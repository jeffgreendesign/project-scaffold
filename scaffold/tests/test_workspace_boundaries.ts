/**
 * Workspace Boundary Guardrail Test — Monorepo Import Enforcement
 * ============================================================================
 * CUSTOMIZE: Update WORKSPACE_RULES to match your monorepo package structure.
 * Skip this file entirely for single-package repos.
 *
 * WHY THIS EXISTS:
 * In monorepos, LLM agents create accidental circular dependencies by importing
 * between packages that shouldn't know about each other. This test enforces
 * explicit dependency boundaries between workspace packages.
 *
 * HOW IT WORKS:
 * 1. Define allowed/denied import relationships in WORKSPACE_RULES
 * 2. Test scans each package's source files for cross-package imports
 * 3. Flags any import that violates the allow/deny rules
 *
 * EXAMPLE VIOLATION MESSAGE:
 * "packages/ui/src/Button.tsx imports from packages/api — this is not allowed.
 *  packages/ui may only import from: packages/shared"
 * ============================================================================
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

// ============================================================================
// CUSTOMIZE: Define your workspace dependency rules
// ============================================================================

/**
 * Import rules for each package in the monorepo.
 *
 * - allow: packages this package MAY import from
 * - deny: packages this package MUST NOT import from
 *
 * If a package is in neither allow nor deny, it's treated as denied by default
 * (explicit-allow model). To use explicit-deny instead, flip the logic in
 * checkViolation().
 */
const WORKSPACE_RULES: Record<string, { allow: string[]; deny: string[] }> = {
  // CUSTOMIZE: Replace with your actual package structure
  'packages/ui': {
    allow: ['packages/shared'],
    deny: ['packages/api', 'packages/db'],
  },
  'packages/api': {
    allow: ['packages/shared', 'packages/db'],
    deny: ['packages/ui'],
  },
  'packages/shared': {
    allow: [],
    deny: ['packages/ui', 'packages/api', 'packages/db'],
  },
};

/** Root directory of the monorepo (relative to project root) */
const MONOREPO_ROOT = '.';

// ============================================================================
// Implementation — you shouldn't need to modify below this line
// ============================================================================

interface Violation {
  sourceFile: string;
  sourcePackage: string;
  importedPackage: string;
  line: number;
  text: string;
}

/**
 * Get all TypeScript/JavaScript files in a directory recursively
 */
function getSourceFiles(dir: string): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (['node_modules', 'dist', 'build', '.next', 'coverage'].includes(entry.name)) {
        continue;
      }
      files.push(...getSourceFiles(fullPath));
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Extract cross-package import references from a file
 */
function findCrossPackageImports(
  filePath: string,
  allPackages: string[],
): { importedPackage: string; line: number; text: string }[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const results: { importedPackage: string; line: number; text: string }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;

    // Match import/require statements
    const importPatterns = [
      /from\s+['"]([^'"]+)['"]/,
      /require\s*\(\s*['"]([^'"]+)['"]/,
      /import\s*\(\s*['"]([^'"]+)['"]/,
    ];

    for (const pattern of importPatterns) {
      const match = line.match(pattern);
      if (!match) continue;

      const importPath = match[1]!;

      // Check if this import references another workspace package
      for (const pkg of allPackages) {
        // Match imports like '@scope/package-name' or relative paths to other packages
        const pkgName = path.basename(pkg);
        const scopedName = `@${path.basename(path.dirname(pkg))}/${pkgName}`;

        if (
          importPath === pkgName ||
          importPath.startsWith(pkgName + '/') ||
          importPath === scopedName ||
          importPath.startsWith(scopedName + '/') ||
          importPath.includes(`../${pkg}`) ||
          importPath.includes(`../../${pkg}`)
        ) {
          results.push({
            importedPackage: pkg,
            line: i + 1,
            text: line.trim(),
          });
        }
      }
    }
  }

  return results;
}

/**
 * Determine which package a file belongs to
 */
function getPackageForFile(filePath: string, packages: string[]): string | null {
  const normalized = path.normalize(filePath);
  for (const pkg of packages) {
    if (normalized.startsWith(path.normalize(pkg) + path.sep)) {
      return pkg;
    }
  }
  return null;
}

// ============================================================================
// Tests
// ============================================================================

describe('Workspace boundaries: cross-package imports', () => {
  const packages = Object.keys(WORKSPACE_RULES);

  it('should not import from denied packages', () => {
    const violations: Violation[] = [];

    for (const sourcePackage of packages) {
      const srcDir = path.join(MONOREPO_ROOT, sourcePackage, 'src');
      const files = getSourceFiles(srcDir);
      const rules = WORKSPACE_RULES[sourcePackage]!;

      // All other packages that aren't explicitly allowed
      const otherPackages = packages.filter((p) => p !== sourcePackage);

      for (const file of files) {
        const imports = findCrossPackageImports(file, otherPackages);

        for (const imp of imports) {
          // Check if this import is allowed
          const isAllowed = rules.allow.includes(imp.importedPackage);
          const isDenied = rules.deny.includes(imp.importedPackage);

          // Violation if explicitly denied, or if not explicitly allowed
          if (isDenied || !isAllowed) {
            violations.push({
              sourceFile: file,
              sourcePackage,
              importedPackage: imp.importedPackage,
              line: imp.line,
              text: imp.text,
            });
          }
        }
      }
    }

    if (violations.length > 0) {
      const grouped = new Map<string, Violation[]>();
      for (const v of violations) {
        const key = `${v.sourcePackage} → ${v.importedPackage}`;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(v);
      }

      let message = `Found ${violations.length} workspace boundary violation(s):\n\n`;

      for (const [key, group] of grouped) {
        const sourcePackage = group[0]!.sourcePackage;
        const importedPackage = group[0]!.importedPackage;
        const rules = WORKSPACE_RULES[sourcePackage]!;
        const allowedStr =
          rules.allow.length > 0 ? rules.allow.join(', ') : '(none — this is a leaf package)';

        message += `${key}:\n`;
        for (const v of group) {
          message += `  ${v.sourceFile}:${v.line} — ${v.text}\n`;
        }
        message += `  ${sourcePackage} may only import from: ${allowedStr}\n\n`;
      }

      message += 'Fix: Move shared code to an allowed package, or update WORKSPACE_RULES.';

      expect.fail(message);
    }
  });
});
