/**
 * Architecture Guardrail Test — Import Boundary Enforcement
 * ============================================================================
 * This test enforces architectural boundaries by preventing direct imports of
 * protected modules. Only a designated wrapper module is allowed to import them.
 *
 * WHY THIS EXISTS:
 * LLM agents don't know your architecture. They'll import the database client
 * directly from any file, bypassing your connection pooling, error handling,
 * and logging wrappers. This test catches that at CI time.
 *
 * HOW TO CUSTOMIZE:
 * 1. Change FORBIDDEN_IMPORTS to match YOUR protected modules
 * 2. Change ALLOWED_IMPORTERS to match YOUR wrapper module(s)
 * 3. Change SCAN_DIR to match YOUR source directory
 *
 * PATTERN: Rule-Bug-Prevention
 * Rule:    Only db/client.ts may import from 'pg' / 'prisma' / etc.
 * Bug:     Direct DB imports bypass connection pooling, skip error handling
 * Prevent: This test fails CI if any other file imports the DB client directly
 * ============================================================================
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

// ============================================================================
// CUSTOMIZE: Configure these values for your project
// ============================================================================

/** Modules that should only be imported through a wrapper */
const FORBIDDEN_IMPORTS: string[] = [
  // CUSTOMIZE: Add your protected module patterns here
  // Examples:
  // 'pg',
  // '@prisma/client',
  // 'redis',
  // 'aws-sdk',
  'pg',
  '@prisma/client',
];

/** Files that ARE allowed to import the forbidden modules (the wrappers) */
const ALLOWED_IMPORTERS: string[] = [
  // CUSTOMIZE: Your wrapper module(s) that encapsulate the protected imports
  // Examples:
  // 'src/lib/db.ts',
  // 'src/lib/redis.ts',
  'src/lib/db.ts',
  'src/db/client.ts',
];

/** Directory to scan for violations */
const SCAN_DIR = 'src';

// ============================================================================
// Test implementation — you shouldn't need to modify below this line
// ============================================================================

/**
 * Recursively get all TypeScript files in a directory
 */
function getTypeScriptFiles(dir: string): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip node_modules and build output
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'build') {
        continue;
      }
      files.push(...getTypeScriptFiles(fullPath));
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      // Skip test files — they may import anything for testing purposes
      if (entry.name.includes('.test.') || entry.name.includes('.spec.')) {
        continue;
      }
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Check if a file contains forbidden imports
 */
function findForbiddenImports(
  filePath: string,
  forbiddenModules: string[],
): { module: string; line: number; text: string }[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const violations: { module: string; line: number; text: string }[] = [];

  // Pre-compile patterns once per module to avoid repeated RegExp construction
  const compiledPatterns = forbiddenModules.map((mod) => ({
    module: mod,
    patterns: [
      new RegExp(`from\\s+['"]${escapeRegex(mod)}['"]`),
      new RegExp(`import\\s+['"]${escapeRegex(mod)}['"]`),
      new RegExp(`require\\s*\\(\\s*['"]${escapeRegex(mod)}['"]`),
    ],
  }));

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;

    for (const { module: mod, patterns } of compiledPatterns) {
      for (const pattern of patterns) {
        if (pattern.test(line)) {
          violations.push({
            module: mod,
            line: i + 1,
            text: line.trim(),
          });
        }
      }
    }
  }

  return violations;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================================================
// Tests
// ============================================================================

describe('Architecture: Import boundaries', () => {
  it('should not import protected modules outside of designated wrappers', () => {
    const files = getTypeScriptFiles(SCAN_DIR);
    const violations: string[] = [];

    // Normalize allowed importers for comparison
    const normalizedAllowed = ALLOWED_IMPORTERS.map((f) =>
      path.normalize(f),
    );

    for (const file of files) {
      const normalizedFile = path.normalize(file);

      // Skip if this file is an allowed importer
      if (normalizedAllowed.some((allowed) => normalizedFile.endsWith(allowed))) {
        continue;
      }

      const found = findForbiddenImports(file, FORBIDDEN_IMPORTS);

      for (const violation of found) {
        violations.push(
          `${file}:${violation.line} imports '${violation.module}' directly.\n` +
            `  Found: ${violation.text}\n` +
            `  Only these files may import '${violation.module}': ${ALLOWED_IMPORTERS.join(', ')}`,
        );
      }
    }

    if (violations.length > 0) {
      const message =
        `Found ${violations.length} forbidden import(s):\n\n` +
        violations.join('\n\n') +
        '\n\n' +
        'Fix: Import from the wrapper module instead of the direct dependency.\n' +
        `Allowed wrappers: ${ALLOWED_IMPORTERS.join(', ')}`;

      expect.fail(message);
    }
  });
});
