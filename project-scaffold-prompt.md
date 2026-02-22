# Build: project-scaffold

You are building `project-scaffold` — an opinionated starter template for new projects (and a retrofit guide for existing ones) that ships with AI-native defaults out of the box. The author is a product engineer who wants every project to start with guardrails, discoverability, quality gates, and conventions that make LLM coding agents (Claude Code, Cursor, Copilot) productive from their first turn.

This is NOT an “AI project starter.” It’s how the author builds all projects — the LLM-friendliness is a property of the defaults, not the identity.

**Terminology rule:** The single quality gate command is called `gates`. Not `quality`, not `claude:gates`, not `check`. One name, every repo, no exceptions. This is the command agents run before committing. All CI, hooks, docs, and settings reference `pnpm gates` (or `npm run gates` / `python -m gates` depending on stack).

-----

## What to Build

A GitHub-ready template repository with two things:

1. **Scaffold files** — the actual starter files a new project gets (CLAUDE.md, settings, CI, hooks, configs, etc.)
2. **Documentation** — a comprehensive README and guide explaining what each file does, why it exists, and how to customize it. This doubles as the retrofit guide for existing projects.

The scaffold supports two stacks out of the box:

- **TypeScript (Node.js)** — the primary target
- **Python** — secondary, with equivalent patterns noted where they differ

-----

## Repository Structure

Build this exact structure:

```text
project-scaffold/
├── README.md                          # Project overview + quick start + full guide
├── LICENSE                            # MIT
├── CLAUDE.md                          # Meta: instructions for working on project-scaffold itself
├── .gitignore
│
├── scaffold/                          # ← The actual template files
│   ├── CLAUDE.md.template             # Annotated with <!-- CUSTOMIZE --> comments
│   ├── NOW.md.template                # Current state tracker
│   ├── AGENTS.md.template             # For projects exposing APIs/tools
│   ├── llms.txt.template              # AI-readable project summary
│   ├── .env.example                   # Annotated environment template
│   ├── CHANGELOG.md                   # Starter changelog
│   │
│   ├── .claude/
│   │   ├── settings.json              # Pre-approved tool permissions
│   │   ├── commands/
│   │   │   ├── new-component.md       # Example slash command
│   │   │   └── gates.md            # Run all quality gates
│   │   └── hooks/
│   │       └── session-start.sh       # Auto-setup on session start
│   │
│   ├── .github/
│   │   └── workflows/
│   │       ├── ci.yml                 # Lint + typecheck + test + build
│   │       └── changelog-check.yml    # Enforce changelog updates on PRs
│   │
│   ├── .husky/
│   │   └── pre-commit                 # Local quality gate hook
│   │
│   ├── .cursor/
│   │   └── rules/
│   │       └── typescript.mdc         # Example Cursor rule file
│   │
│   ├── scripts/
│   │   ├── security-check.sh          # Pre-commit security scan
│   │   └── doc-sync-check.sh          # Documentation drift detection
│   │
│   ├── config/
│   │   ├── biome.json                 # Lint + format (TypeScript)
│   │   ├── tsconfig.json              # Strict TypeScript
│   │   ├── tsconfig.python-equiv.md   # Python equivalent notes (pyproject.toml + ruff)
│   │   └── .node-version              # Pinned runtime
│   │
│   └── tests/
│       ├── test_architecture.ts       # Guardrail test example (TypeScript)
│       ├── test_architecture.py       # Guardrail test example (Python)
│       ├── test_workspace_boundaries.ts # Monorepo dependency guardrail (TypeScript)
│       └── smoke.test.tsx             # Component smoke test example
│
├── docs/
│   ├── GUIDE.md                       # Full playbook (the deep guide)
│   ├── TIERS.md                       # Tier breakdown with time estimates
│   ├── RETROFIT.md                    # How to apply to existing projects
│   ├── ANTI-PATTERNS.md              # What not to do
│   ├── DECISION-TREES.md             # When to use what
│   └── EXAMPLES.md                    # Real-world before/after examples
│
└── scripts/
    ├── scaffold.sh                    # Copy scaffold/ into a target directory
    ├── init.sh                        # Single-file version (generated from scaffold/)
    └── generate-init.sh               # Builds init.sh from scaffold/ contents
```

-----

## File-by-File Specifications

### README.md

The README is the public face. It should:

1. **Open with a one-liner:** “Opinionated project scaffold with AI-native defaults.”
2. **Show the value prop in 3 bullets:**
- Every project starts with guardrails that prevent common LLM mistakes
- Quality gates that catch errors before they hit the repo
- Documentation structure that makes AI agents productive from turn one
1. **Quick Start section:**
- Option A: Use as GitHub template
- Option B: Run `scaffold.sh` to copy files into an existing project
- Option C: Cherry-pick individual files
1. **What’s Included table:** Every file in `scaffold/` with a one-line purpose
2. **Tier System overview** (link to docs/TIERS.md for details):
- Tier 0: Before you write code (15 min) — CLAUDE.md, settings.json, .env.example, `gates` script
- Tier 1: First week (1 hr) — linter, strict types, hooks, CI, runtime pin
- Tier 2: Project has legs (2-3 hrs) — NOW.md, slash commands, guardrail tests, changelog, frontmatter, API stability rules (for libraries)
- Tier 3: Public/multi-agent (optional) — llms.txt, AGENTS.md, MCP manifest, Cursor rules, decision trees
1. **Customization section:** How to adapt each template file
2. **Philosophy section** (brief): “Make implicit knowledge explicit. LLMs don’t have institutional memory.”
3. **Links** to all docs/ files

### scaffold/CLAUDE.md.template

This is the most important file. Build it with:

```markdown
# CLAUDE.md

<!-- CUSTOMIZE: Replace everything in [brackets] with your project values -->

## Project Overview
[One paragraph: what this project does, who it's for, what problem it solves.]

## Quick Reference

| Aspect          | Value                          |
|-----------------|--------------------------------|
| Package manager | [pnpm / npm / yarn]            |
| Runtime         | [Node.js >= 22 / Python >= 3.12] |
| Language        | [TypeScript (ESM) / Python]    |
| Framework       | [Next.js 16 / FastAPI / etc.]  |
| Lint            | `[pnpm lint]`                  |
| Test            | `[pnpm test]`                  |
| Type check      | `[pnpm typecheck]`            |
| Build           | `[pnpm build]`                 |
| **All checks**  | **`[pnpm gates]`**             |
| Node targets    | [>= 22 / >= 20 / >= 18]       |
| TS target       | [ESNext / ES2022 / etc.]       |

<!-- CUSTOMIZE: The compatibility matrix (Node targets, TS target) matters. -->
<!-- Agents will "modernize" syntax and silently drop support for older runtimes -->
<!-- if you don't explicitly state what you support. -->

## Development Commands

<!-- CUSTOMIZE: Every command the LLM might need, copy-paste ready -->
<!-- Group by purpose: dev, quality, testing, build -->

```bash
# Development
[pnpm dev]

# Quality gates (run before every commit)
[pnpm gates]

# Individual checks
[pnpm lint]
[pnpm typecheck]
[pnpm test]
[pnpm build]
```

## Architecture

### Key Systems

<!-- CUSTOMIZE: Each major subsystem gets a paragraph -->

<!-- Include: what it does, where it lives, how pieces connect -->

### Directory Map

<!-- CUSTOMIZE: Run `tree -L 2 src/` and annotate -->

```text
src/
├── [folder]/     # [purpose]
├── [folder]/     # [purpose]
└── [folder]/     # [purpose]
```

### Starting Points

<!-- CUSTOMIZE: List the 3-5 files/folders where most tasks begin. -->

<!-- This prevents the agent from exploring the wrong part of the repo. -->

<!-- Critical for repos with multiple top-level directories (app/, website/, docs/, etc.) -->

Most tasks start in `src/`. Key entry points:

|Task                |Start Here      |Why                      |
|--------------------|----------------|-------------------------|
|[Most common task]  |`[path/to/file]`|[What this file controls]|
|[Second most common]|`[path/to/file]`|[What this file controls]|
|[Third most common] |`[path/to/file]`|[What this file controls]|

## Code Conventions

<!-- CUSTOMIZE: The rules LLMs violate most often in YOUR project -->

<!-- Use the Rule-Bug-Prevention format for each: -->

### [Convention Category]

**Rule:** [What to do]
**Bug it prevents:** [What goes wrong without this rule]

```[lang]
# WRONG
[bad pattern]

# CORRECT
[good pattern]
```

## Common Mistakes

<!-- CUSTOMIZE: Group by severity -->

### Build Breakers

These will fail the build:

- [Mistake 1]
- [Mistake 2]

### Silent Bugs

These won’t fail the build but cause problems:

- [Mistake 1]
- [Mistake 2]

## How to Add New [Things]

<!-- CUSTOMIZE: Step-by-step recipes for every common creation task -->

<!-- "Create file at X, add Y, run Z." No ambiguity. -->

### New [Component/Route/Endpoint]

1. Create `[path/to/new-thing]`
2. Add required fields: [list]
3. Follow this pattern:

   ```[lang]
   [minimal template]
   ```

4. Run `[pnpm gates]`

## Architecture Decisions

<!-- CUSTOMIZE: Why each major tech choice was made -->

<!-- "Do not suggest alternatives unless explicitly asked." -->

These choices are intentional. Do not suggest alternatives unless explicitly asked.

- **[Tool] over [Alternative]**: [Reason]
- **[Tool] over [Alternative]**: [Reason]

## Data Integrity Rules

<!-- CUSTOMIZE: Remove this section if your project doesn't handle data ingestion/sync. -->

<!-- For projects that read, transform, or persist data, these rules prevent silent data loss. -->

- **Never cap results with array slicing** (no `[:20]` or `.slice(0, 100)`) unless it’s a deliberate, documented CLI flag. If 50 items were collected, all 50 must be saved.
- **Per-item error handling in loops is mandatory.** A single outer try/catch means one bad item kills processing for everything after it.
- **Log counts and error counts** for every ingestion/sync operation. “Synced 47/50 items, 3 failures” not silence.
- **Ordering and pagination must be deterministic.** Sort by a unique column. If sorting by a non-unique column, add a tiebreaker.
- **Never pass empty strings to database timestamp columns.** Convert to `null`/`None`.

## Public API Stability

<!-- CUSTOMIZE: Only include this section for libraries with external consumers. -->

<!-- Remove for apps and internal tools. -->

### Stable Exports (do not change without migration entry)

<!-- CUSTOMIZE: List your public API surface -->

- `[exportName]` — [what it does]
- `[exportName]` — [what it does]

**Rule:** Any change to a stable export requires:

1. A new entry in MIGRATION.md explaining the change
2. A semver-appropriate version bump
3. Deprecation notice on the old API if not a major version

## Debug Playbook

<!-- CUSTOMIZE: The 3-5 most common failure modes and their fixes. -->

<!-- Agents get stuck in retry loops when they hit failures they don't understand. -->

<!-- This section breaks those loops. -->

### If tests fail in CI but pass locally

- [Most likely cause, e.g., “Missing env var in CI — check .github/workflows/ci.yml”]
- [Second cause]

### If the build fails

- [Most likely cause, e.g., “TypeScript strict mode catches something the IDE missed — run `pnpm typecheck` locally”]
- [Second cause]

### If lint fails

- [Most likely cause, e.g., “Auto-fixable — run `pnpm lint --fix`”]

### If types fail

- [Most likely cause, e.g., “Missing type for new dependency — check if @types/[pkg] exists”]

## Environment Variables

<!-- CUSTOMIZE: Every env var with description -->

<!-- Mark REQUIRED vs OPTIONAL -->

|Variable|Required|Purpose       |
|--------|--------|--------------|
|`[VAR]` |Yes     |[What it does]|

## Documentation Sync Rules

<!-- CUSTOMIZE: List files that must be updated together -->

<!-- This is the #1 source of documentation drift -->

When updating [X], also update:

- [File A]
- [File B]

```text
Include extensive comments explaining WHY each section exists, referencing the lessons documents. The template should be usable by copying it, replacing bracketed values, and deleting comments.

### scaffold/.claude/settings.json

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run gates*)",
      "Bash(npm run lint*)",
      "Bash(npm run typecheck*)",
      "Bash(npm run test*)",
      "Bash(npm run build*)",
      "Bash(npm run dev*)",
      "Bash(git status*)",
      "Bash(git diff*)",
      "Bash(git log*)",
      "Bash(git add *)",
      "Bash(git commit *)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(git push --force*)",
      "Bash(git reset --hard*)",
      "Bash(DROP TABLE*)",
      "Bash(DROP DATABASE*)",
      "Bash(curl *)"
    ]
  }
}
```

Add a comment block (in a sibling README or at the top of CLAUDE.md) explaining:

- `allow`: Safe read-only and build commands. The LLM runs these without asking.
- `deny`: Destructive operations. Structurally blocked.
- `git push` is intentionally NOT in allow — you want to review before pushing.
- `npm install` is intentionally NOT in allow — review new dependencies.

### scaffold/.claude/commands/gates.md

```markdown
Run all quality gates on the codebase:

1. Run `npm run gates`
2. Report results for each gate (typecheck, lint, test, build)
3. If any gate fails, identify the specific errors
4. Do NOT proceed with committing until all gates pass
```

### scaffold/.claude/commands/new-component.md

```markdown
Create a new component following project conventions:

## Instructions

1. Read CLAUDE.md for directory structure and naming conventions
2. Check existing components in `src/components/` for patterns

## Output

1. Create component file at `src/components/[name].tsx`
2. Create test file at `src/components/__tests__/[name].test.tsx`
3. Add smoke test to `src/components/__tests__/smoke.test.tsx`

## After Creating

1. Run `npm run gates`
```

### scaffold/.claude/hooks/session-start.sh

```bash
#!/bin/bash
set -euo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$PROJECT_DIR"

echo "--- Session start: installing dependencies ---"

# Detect package manager
if [ -f "pnpm-lock.yaml" ]; then
  pnpm install --frozen-lockfile 2>&1
elif [ -f "yarn.lock" ]; then
  yarn install --frozen-lockfile 2>&1
elif [ -f "package-lock.json" ]; then
  npm ci 2>&1
elif [ -f "pyproject.toml" ]; then
  pip install -e ".[dev]" --quiet 2>&1
elif [ -f "requirements.txt" ]; then
  pip install -r requirements.txt --quiet 2>&1
fi

echo "--- Session start complete ---"
```

### scaffold/.github/workflows/ci.yml

Build a CI workflow that:

1. Triggers on push to main and pull_request to main
2. Uses `dorny/paths-filter@v3` to detect code changes vs docs-only changes
3. Skips quality checks on docs-only PRs
4. Runs: install → lint → typecheck → test → build
5. Uses the Node version from `.node-version` (not hardcoded) to enforce the compatibility matrix
6. Caches npm/pnpm
7. Has a 10-minute timeout
8. Include comments explaining each design choice
9. The final step should be `npm run gates` (not individual commands) — CI runs the same command as local hooks

### scaffold/.github/workflows/changelog-check.yml

Build a changelog enforcement workflow that:

1. Triggers on pull_request to main
2. Skips if PR has `skip-changelog` label
3. Skips for docs-only PRs (only .md file changes)
4. Requires CHANGELOG.md to be modified if code files changed
5. Prints a clear error message explaining what to do

### scaffold/.husky/pre-commit

```bash
#!/bin/sh

# Quality gates — must pass before commit
# For full test suite, rely on CI. Pre-commit runs fast checks only.
npm run lint
npm run typecheck
```

### scaffold/scripts/security-check.sh

Build the security pre-commit script from the textrawl lessons doc. Adapt it to scan for:

- User input flowing into filesystem operations (path traversal)
- `console.log()` in non-test files (if stdout is reserved)
- Hardcoded secrets patterns (API keys, tokens, passwords)
- `eval()` usage
- SQL string interpolation

Make it non-blocking (exit 0 with warnings) by default, with a `--strict` flag that exits 1.

### scaffold/scripts/doc-sync-check.sh

Build the documentation sync enforcement script. It should:

1. Accept a config of “source of truth” patterns and “must-reference” doc files
2. Extract items from source files (function names, route registrations, etc.)
3. Check that all doc files reference all items
4. Print clear error messages for missing references
5. Include a `--fix` flag that just reports (no auto-fix, but clear about what to add)

### scaffold/config/biome.json

Use the biome config from the textrawl lessons doc. Strict linting, tab indentation, single quotes, trailing commas, 100 char line width. Include comments in a sibling file explaining each non-obvious choice.

### scaffold/config/tsconfig.json

Strict mode TypeScript:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": false,
    "moduleResolution": "bundler",
    "module": "ESNext",
    "target": "ESNext",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  }
}
```

### scaffold/config/.node-version

```text
22
```

### scaffold/tests/test_architecture.ts

TypeScript guardrail test that:

1. Scans `src/` for files importing a forbidden module directly (e.g., database client)
2. Allows only a single designated wrapper module to import it
3. Uses `ts-morph` or simple regex/AST parsing
4. Includes clear violation messages
5. Has extensive comments explaining the pattern and how to customize

### scaffold/tests/test_architecture.py

Python guardrail test (from the search-tool lessons doc) that:

1. Enforces single database access point
2. Enforces pagination on multi-row queries
3. Enforces registration consistency
4. Uses AST parsing
5. Includes the `VERIFIED_SINGLE_ROW_LOOKUPS` allowlist pattern

### scaffold/tests/test_workspace_boundaries.ts

Monorepo dependency guardrail test (TypeScript) that:

1. Reads a `WORKSPACE_RULES` config (either inline or from a JSON file) defining allowed import relationships between packages:

   ```typescript
   // Example: packages/ui can import from packages/shared, but not from packages/api
   const WORKSPACE_RULES: Record<string, { allow: string[]; deny: string[] }> = {
     'packages/ui': { allow: ['packages/shared'], deny: ['packages/api', 'packages/db'] },
     'packages/api': { allow: ['packages/shared', 'packages/db'], deny: ['packages/ui'] },
     'packages/shared': { allow: [], deny: ['packages/ui', 'packages/api', 'packages/db'] },
   };
   ```

2. Scans each package’s source files for imports from other workspace packages
3. Flags any import that violates the allow/deny rules
4. Catches accidental circular dependencies in monorepos
5. Includes clear violation messages: “packages/ui/src/Button.tsx imports from packages/api — this is not allowed. packages/ui may only import from: packages/shared”
6. Has a comment at the top: “CUSTOMIZE: Update WORKSPACE_RULES to match your monorepo package structure. Skip this file entirely for single-package repos.”

### scaffold/tests/smoke.test.tsx

React component smoke test example:

```typescript
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

// CUSTOMIZE: Import your critical components
// import { Button } from '@/components/Button';

describe('Component smoke tests', () => {
  // CUSTOMIZE: Add a smoke test for each critical component
  // it('renders Button without crashing', () => {
  //   const { container } = render(<Button>Click</Button>);
  //   expect(container).toBeTruthy();
  // });

  it('placeholder — add your component smoke tests here', () => {
    expect(true).toBe(true);
  });
});
```

### scaffold/NOW.md.template

```markdown
# What's Happening Now

<!-- This file prevents context loss between sessions. -->
<!-- Update it at the end of every work session. -->
<!-- Keep it under 100 lines. If it's longer, you're not updating often enough. -->

**Last Updated:** [YYYY-MM-DD]
**Project Status:** [Brief status — e.g., "MVP in progress", "95% complete"]

## Current Sprint
- [ ] [Active task 1]
- [ ] [Active task 2]

## Recently Completed
- [x] [Completed item] ([date])

## Blocked / Waiting
- [Item] — blocked on [reason]

## Next Actions
**High Priority:**
- [Task A]

**Low Priority:**
- [Task B]
```

### scaffold/AGENTS.md.template

```markdown
# AGENTS.md

<!-- CUSTOMIZE: Only create this file if your project exposes an API, SDK, or tool interface. -->
<!-- This tells external AI agents how to USE your project (vs. CLAUDE.md which tells agents how to DEVELOP it). -->

## Quick Reference

| Aspect  | Value                          |
|---------|--------------------------------|
| API     | [REST / GraphQL / MCP], base URL [/api/v1] |
| Auth    | [Bearer token / API key / none] |
| Limits  | [Rate limits]                  |

## Endpoint Selection Guide

| User Intent          | Endpoint        | Key Params          |
|----------------------|-----------------|---------------------|
| [Intent 1]           | [METHOD /path]  | [params]            |
| [Intent 2]           | [METHOD /path]  | [params]            |

## Common Workflows

<!-- Show 2-3 typical multi-step workflows an agent would perform -->

### [Workflow Name]
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Error Handling

| Error | Cause | Fix |
|-------|-------|-----|
| 401   | [cause] | [fix] |
| 429   | [cause] | [fix] |
```

### scaffold/llms.txt.template

```markdown
# [Project Name]

> [One-line description]

[Brief paragraph: what it does, how to interact with it.]

## Key Features
- [Feature 1]: [description]
- [Feature 2]: [description]

## Documentation
- [/README.md](README.md) — Project overview
- [/AGENTS.md](AGENTS.md) — Agent integration guide

## Quick Facts
- [Key fact 1]
- [Key fact 2]
```

### scaffold/CHANGELOG.md

```markdown
# Changelog

All notable changes to this project will be documented in this file.

Format: [Keep a Changelog](https://keepachangelog.com/)

## [Unreleased]

### Added
- Initial project setup
```

### scaffold/.env.example

```bash
# =============================================================================
# Environment Variables
# =============================================================================
# Copy this file to .env and fill in the values.
# NEVER commit .env to version control.
#
# CUSTOMIZE: Add all environment variables your project uses.
# Mark each as REQUIRED or OPTIONAL.
# Include valid value examples or ranges.
# =============================================================================

# Server (REQUIRED)
PORT=3000
NODE_ENV=development

# Database (REQUIRED)
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb

# Authentication (REQUIRED for production)
# API_KEY=your-api-key-here

# Feature Flags (OPTIONAL)
# ENABLE_DEBUG=false
```

### scaffold/.cursor/rules/typescript.mdc

```markdown
---
description: TypeScript conventions and import patterns
globs: ["src/**/*.ts", "src/**/*.tsx"]
---

# TypeScript Rules

## Critical Rules
- ESM imports only — use `.js` extensions even for .ts files
- Never use `any` — use `unknown` and narrow with type guards
- Never use non-null assertions (`!`) — handle the null case

## Import Patterns
- Use `@/` path aliases for project imports
- External deps first, then internal, then relative
- No barrel exports (`index.ts` re-exports) — import directly

## Common Mistakes
- Forgetting `"use client"` when using React hooks
- Using `console.log()` instead of the project logger
- String interpolation in SQL queries (use parameterized queries)
```

-----

## Documentation Specifications

### docs/GUIDE.md

The full playbook. Structure it as:

1. **Philosophy** — “Make implicit knowledge explicit. LLMs don’t have institutional memory.”
2. **The Core Loop** — Tell → Enforce → Fail Fast
3. **File-by-file deep dive** — Every scaffold file with:
- What it does
- Why it exists (with the specific bug/failure it prevents)
- How to customize it
- Common mistakes when setting it up
1. **Stack-specific notes** — TypeScript vs Python differences
2. **Advanced patterns:**
- YAML frontmatter on docs (from flophouse)
- The Rule-Bug-Prevention format (from search tool)
- Token-efficient response formats (from textrawl)
- Decision trees (from flophouse)
- Module-level JSDoc (from portfolio)
- Workspace boundary enforcement for monorepos
- Public API stability rules for libraries
- Data integrity rules for data-heavy projects
- Debug playbooks for breaking retry loops
- Compatibility matrix enforcement in CI

### docs/TIERS.md

The tier breakdown with exact time estimates:

|Tier|Time    |Files                                                                                                                 |Value                          |
|----|--------|----------------------------------------------------------------------------------------------------------------------|-------------------------------|
|0   |15 min  |CLAUDE.md, settings.json, .env.example, `gates` script                                                                |LLM can work autonomously      |
|1   |1 hr    |linter, strict types, hooks, CI, .node-version                                                                        |Mistakes caught before repo    |
|2   |2-3 hrs |NOW.md, commands, guardrail tests, changelog, frontmatter, API stability (libraries), workspace boundaries (monorepos)|Sustained multi-session quality|
|3   |optional|llms.txt, AGENTS.md, MCP, Cursor rules, decision trees                                                                |External agent discoverability |

For each tier, list:

- Exact files to create
- Why this tier before the next
- What you lose if you skip it
- “If you can only do one thing from this tier, do [X]”
- **Project-type variants:** Flag items that only apply to libraries (API stability rules), monorepos (workspace boundaries), or data-heavy projects (data integrity rules)

### docs/RETROFIT.md

How to apply to an existing project. Structured as:

1. **Audit checklist** — Run through to identify gaps
2. **Phase 1: Immediate impact (30 min)** — CLAUDE.md + settings + `gates` script
3. **Phase 2: Prevent regressions (1 hr)** — hooks + CI + linter
4. **Phase 3: Navigation (1 hr)** — Cursor rules, AGENTS.md, llms.txt
5. **Phase 4: Polish (as needed)** — security scripts, doc sync, session hooks
6. **Priority rule:** “If you can only do one thing: write the CLAUDE.md.”

### docs/ANTI-PATTERNS.md

A table of anti-patterns, why they fail, and what to do instead. Pull from all four lessons docs. Include at minimum:

|Anti-Pattern                             |Why It Fails                                        |Do This Instead                                                      |
|-----------------------------------------|----------------------------------------------------|---------------------------------------------------------------------|
|1000+ line CLAUDE.md                     |Eats context budget                                 |Keep under 500 lines, split to separate docs                         |
|Docs in a wiki                           |Drift immediately, no PR review                     |Co-locate with code                                                  |
|“Update docs later”                      |Later never comes                                   |Atomic commits (code + docs together)                                |
|Instructions without enforcement         |LLMs ignore prose rules                             |Linter + CI + hooks                                                  |
|No `gates` script                        |LLMs skip individual checks                         |One command runs everything                                          |
|Multiple gate command names              |Agent doesn’t know which to run                     |Standardize on `gates` everywhere                                    |
|Relaxed TypeScript                       |`any` masks real bugs                               |strict: true, warn on any                                            |
|Version numbers in 10 places             |They’ll disagree within a week                      |Single source of truth                                               |
|Separate doc PRs                         |Docs lag behind code                                |Same PR, same commit                                                 |
|Missing .env.example                     |LLMs invent env vars                                |Document every variable                                              |
|Advisory-only rules                      |Ignored under deadline pressure                     |CI enforcement                                                       |
|No compatibility matrix                  |Agent “modernizes” syntax, drops runtime support    |State Node + TS targets in CLAUDE.md Quick Reference                 |
|No starting points in CLAUDE.md          |Agent explores wrong directories in multi-root repos|List top 5 hot files with “most tasks start here”                    |
|No debug playbook                        |Agent gets stuck in retry loops on common failures  |Document top 5 failure modes and their fixes                         |
|Changing stable exports without migration|Consumers break silently                            |Require MIGRATION.md entry for any public API change (libraries only)|
|No workspace boundary rules (monorepos)  |Accidental circular deps between packages           |Guardrail test with allow/deny import rules per package              |

### docs/DECISION-TREES.md

Decision trees for common architectural choices:

1. **“Do I need this file?”** — flowchart for each scaffold file based on project type
2. **“Which tier should I implement?”** — based on project lifespan and team size
3. **“Is this a library with consumers?”** — branches into API stability rules, MIGRATION.md, compatibility matrix enforcement in CI
4. **“Is this a monorepo?”** — branches into workspace boundary tests, changeset enforcement, cross-package build validation
5. **“Does this project handle data ingestion/sync?”** — branches into data integrity rules, pagination enforcement, per-item error handling
6. **“Server component or client component?”** — React-specific
7. **“Guardrail test or linter rule?”** — when to use each enforcement mechanism
8. **“Single file or co-located docs?”** — when to split documentation

Use ASCII flowchart format:

```text
┌──────────────────────────┐
│ Does project expose API? │
└──────────┬───────────────┘
     ┌─────┴──────┐
     │             │
    Yes           No
     │             │
     ▼             ▼
  Create        Skip
  AGENTS.md     AGENTS.md
```

```text
┌──────────────────────────────┐
│ Is this a library with       │
│ external consumers?          │
└──────────┬───────────────────┘
     ┌─────┴──────┐
     │             │
    Yes           No
     │             │
     ▼             ▼
  Add:          Skip these
  - Public API     sections
    Stability
    section
  - MIGRATION.md
  - Compat matrix
    in CI
```

```text
┌──────────────────────────────┐
│ Is this a monorepo?          │
└──────────┬───────────────────┘
     ┌─────┴──────┐
     │             │
    Yes           No
     │             │
     ▼             ▼
  Add:          Use standard
  - workspace      test_
    boundary test  architecture
  - changeset      tests
    enforcement
  - per-package
    gates
```

### docs/EXAMPLES.md

Before/after examples showing the impact:

1. **Before CLAUDE.md:** Show an LLM session burning tokens on exploration
2. **After CLAUDE.md:** Same task, LLM goes straight to the right files
3. **Before guardrail tests:** Bug slips through (missing pagination, direct DB import)
4. **After guardrail tests:** `pytest` catches it immediately
5. **Before `gates` script:** LLM commits with lint errors
6. **After `gates` script:** Pre-commit hook blocks it
7. **Before starting points:** Agent edits `website/` when you meant `src/` in a multi-root repo
8. **After starting points:** Agent goes to the right directory immediately
9. **Before workspace boundaries (monorepo):** Agent creates circular dep between packages
10. **After workspace boundaries:** Guardrail test catches the forbidden import
11. **Before API stability rules (library):** Agent renames an exported function, breaking consumers
12. **After API stability rules:** CLAUDE.md prevents the rename without a migration entry
13. **Before debug playbook:** Agent retries the same failing command 5 times
14. **After debug playbook:** Agent reads the fix and resolves it in one step

-----

## scripts/scaffold.sh

Build a shell script that:

1. Accepts a target directory as argument
2. Copies all scaffold/ files into the target
3. Renames `.template` files (removes the extension)
4. Makes shell scripts executable
5. Prints a checklist of next steps:

   ```text
   ✓ Scaffold copied to /path/to/project
   
   Next steps:
   6. Edit CLAUDE.md — replace all [bracketed] values
   7. Edit .env.example — add your environment variables
   8. Edit .claude/settings.json — adjust allowed commands
   9. Run: npm install husky --save-dev && npx husky init
   10. Run: npm run gates (verify everything passes)
   
   Optional:
   - Edit NOW.md if project will last > 2 weeks
   - Edit AGENTS.md if project exposes an API
   - Delete files you don't need (see docs/DECISION-TREES.md)
   ```

-----

## scripts/init.sh

Build a single-file distribution version that inlines all scaffold content using `cat << 'EOF'` blocks. This is the “compiled” version of scaffold/ — a single script someone can `curl | bash` or copy-paste without cloning the repo.

Rules for init.sh:

1. It must produce the exact same output as `scaffold.sh` copying `scaffold/`
2. It must be generated from the template files, not maintained separately (add a `scripts/generate-init.sh` that reads scaffold/ and produces init.sh)
3. It must detect existing files and prompt before overwriting
4. It must detect the package manager (pnpm/yarn/npm) and adjust the `gates` script accordingly
5. It must create a `package.json` with the `gates` script if none exists, or print instructions to add it manually if one does exist

-----

## The Meta CLAUDE.md

The `CLAUDE.md` at the repo root is for working on project-scaffold itself:

```markdown
# CLAUDE.md — project-scaffold

This repo IS the scaffold template. When editing, you're editing the templates
other projects will use.

## Development Commands

```bash
# Validate all template files have required sections
./scripts/check-templates.sh

# Test the scaffold script
./scripts/scaffold.sh /tmp/test-project

# Regenerate the single-file distribution
./scripts/generate-init.sh

# Verify scaffold.sh and init.sh produce identical output
diff <(./scripts/scaffold.sh /tmp/test-a 2>&1) <(./scripts/init.sh /tmp/test-b 2>&1)

# Lint markdown
npx markdownlint-cli2 "**/*.md"
```

## Architecture

- `scaffold/` — Template files that get copied into target projects
- `docs/` — Guide documentation (stays in this repo, not copied)
- `scripts/scaffold.sh` — Copies scaffold/ into a target directory
- `scripts/init.sh` — Single-file distribution (generated, do not edit directly)
- `scripts/generate-init.sh` — Builds init.sh from scaffold/ contents

## Rules

- Every template file must have `<!-- CUSTOMIZE -->` comments on sections that need editing
- Every scaffold file must be documented in docs/GUIDE.md
- README.md must list every scaffold file with its purpose
- Template files use [brackets] for placeholder values
- Non-template files (settings.json, CI workflows) should work with minimal changes
- The canonical gate command is `gates`. Never use `quality`, `validate`, `check`, or `claude:gates` anywhere.
- After changing any scaffold/ file, regenerate init.sh with `./scripts/generate-init.sh`

```text
---

## Quality Standards

Apply these standards to everything you build:

1. **Every file must have a clear purpose comment** at the top explaining what it is and why it exists
2. **All shell scripts must use `set -euo pipefail`** and be marked executable
3. **All YAML must be valid** — test with a YAML parser
4. **All JSON must be valid** — test with `jq`
5. **All markdown must pass markdownlint** with default rules
6. **Template files must be immediately usable** — copy, replace brackets, done
7. **No dead links** — all cross-references between docs must resolve
8. **Consistent terminology** — use "gates" not "quality"/"checks"/"check", "scaffold" not "boilerplate", "guardrail tests" not "architecture tests"

---

## Build Order

Execute in this order:

1. Create the repo structure (all directories)
2. Build scaffold/ files (CLAUDE.md.template first, then settings, then CI, then everything else)
3. Build docs/ files (GUIDE.md first, then TIERS.md, then the rest)
4. Build scripts/scaffold.sh
5. Build scripts/init.sh (the single-file distribution) and scripts/generate-init.sh (builds init.sh from scaffold/)
6. Build the meta CLAUDE.md
7. Build README.md (last, because it references everything else)
8. Validate: run markdownlint, check all cross-references, verify scaffold.sh works, verify init.sh produces identical output to scaffold.sh

---

## Tone and Voice

- Direct and pragmatic. No fluff.
- "Do this" not "you might consider doing this."
- Explain WHY once, then move on.
- Use tables over prose for structured information.
- Use code blocks for anything copy-pasteable.
- Short paragraphs (1-3 sentences).
- Contractions always. Active voice.
```
