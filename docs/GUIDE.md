# The project-scaffold Playbook

The comprehensive guide to the project-scaffold template repository. Every file, why it exists, how to customize it, and what breaks if you skip it.

---

## 1. Philosophy

**Make implicit knowledge explicit. LLMs don't have institutional memory.**

AI coding agents start every session with zero context. They can't learn from past mistakes. They don't remember that your project uses pnpm, not npm. They don't know that `src/lib/db.ts` is the only file allowed to import Prisma. They don't know your build breaks if you forget the `"use client"` directive.

Every piece of knowledge that lives in a developer's head but not in the repo is a bug waiting to happen. The agent will:

- Explore the wrong directory for 10 minutes before finding the right one
- Use `any` because it doesn't know you enforce strict TypeScript
- Import the database client directly instead of using your wrapper
- "Modernize" syntax and silently drop support for Node 18
- Commit without running the linter because it doesn't know about your quality gates

This scaffold makes all of that impossible. Not by asking nicely — by enforcing structurally.

Three principles:

| Principle | Meaning |
|-----------|---------|
| Explicit over implicit | If it's not written down, it doesn't exist |
| Enforced over advisory | Rules without enforcement are suggestions |
| One command over many | `gates` runs everything — no guessing |

---

## 2. The Core Loop

### Tell -> Enforce -> Fail Fast

Every rule in this scaffold follows the same three-step pattern:

```text
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    TELL      │────▶│   ENFORCE    │────▶│  FAIL FAST   │
│              │     │              │     │              │
│ CLAUDE.md    │     │ Linters      │     │ Pre-commit   │
│ Docs         │     │ CI           │     │ CI           │
│ Comments     │     │ Hooks        │     │ Not prod     │
│ Templates    │     │ Guard tests  │     │              │
└─────────────┘     └─────────────┘     └─────────────┘
```

**Tell:** CLAUDE.md, inline comments, doc files, and templates tell the agent what to do. This is the cheapest layer — it costs nothing to maintain and prevents most mistakes on the first pass.

**Enforce:** Linters (Biome/ruff), type checkers (tsc/mypy), guardrail tests, and CI workflows make rules mandatory. The agent can ignore prose. It can't ignore a failing test.

**Fail Fast:** Errors are caught at the earliest possible moment — pre-commit hooks catch lint and type errors before they reach the repo. CI catches everything else. Nothing reaches production without passing `gates`.

If you only tell without enforcing, agents ignore the rules under pressure. If you enforce without telling, agents waste tokens figuring out what the rules are. You need both.

---

## 3. File-by-File Deep Dive

### CLAUDE.md.template

**Location:** `scaffold/CLAUDE.md.template`

**What it does:** The single source of truth for any AI agent working in your repo. Contains project overview, commands, architecture map, code conventions, common mistakes, debug playbook, and step-by-step recipes.

**Why it exists:** Without this file, agents spend their first 5-10 minutes exploring the repo — reading random files, guessing the build system, trying wrong commands. CLAUDE.md gives them everything they need in one read. This is the most important file in the entire scaffold.

**Bug it prevents:** Agent explores `website/` when the task is in `src/`. Agent uses `npm` when project uses `pnpm`. Agent commits without running quality gates. Agent "modernizes" syntax and drops Node 18 support.

**How to customize:**

1. Replace every `[bracketed]` value with your project's actual values
2. Delete HTML comments (`<!-- CUSTOMIZE -->`) after filling in sections
3. Remove sections that don't apply (Data Integrity Rules for non-data projects, Public API Stability for apps)
4. Add your project-specific conventions in the Code Conventions section using the Rule-Bug-Prevention format

**Key sections and why they matter:**

| Section | Why it matters |
|---------|---------------|
| Quick Reference table | Agent gets commands without reading prose |
| Node targets + TS target | Prevents silent runtime compatibility drops |
| Starting Points | Prevents exploring the wrong directory in multi-root repos |
| Code Conventions | Prevents the specific mistakes YOUR project sees most |
| Debug Playbook | Breaks retry loops when agents hit failures they don't understand |
| Documentation Sync Rules | Prevents docs from drifting out of sync with code |

**Common mistakes:**

- Making it longer than 500 lines (eats context budget — split to separate docs)
- Leaving `[bracketed]` placeholder values (agent uses them literally)
- Not including the compatibility matrix (agent defaults to latest everything)
- Not listing starting points (agent explores randomly in multi-root repos)

---

### .claude/settings.json

**Location:** `scaffold/.claude/settings.json`

**What it does:** Defines allow/deny permissions for Claude Code's tool use. Commands in `allow` run without asking. Commands in `deny` are structurally blocked.

**Why it exists:** Without permissions, every `npm run test` triggers a confirmation dialog. With overly broad permissions, agents can run `rm -rf /` or `git push --force`. This file balances productivity with safety.

**Bug it prevents:** Agent runs `rm -rf` on the wrong directory. Agent force-pushes over main. Agent runs `curl` to download unreviewed code. Agent installs unreviewed dependencies.

**Current configuration:**

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

**How to customize:**

- Add your package manager: change `npm run` to `pnpm` or `yarn` in every allow entry
- Add project-specific safe commands (e.g., `Bash(docker compose up*)`)
- Add project-specific dangerous commands to deny (e.g., `Bash(kubectl delete*)`)

**Intentional omissions:**

| Command | Why it's NOT in allow |
|---------|----------------------|
| `git push` | Review before pushing — you want to see what's going out |
| `npm install` | Review new dependencies before they enter the project |
| `curl` | Blocked — prevents downloading unreviewed code |

**Common mistakes:**

- Using `pnpm` in CLAUDE.md but `npm` in settings.json (they must match)
- Adding `git push` to allow (removes your review checkpoint)
- Adding `npm install` to allow (agents add unnecessary dependencies)
- Forgetting the wildcard (`*`) at the end of patterns

---

### .claude/commands/gates.md

**Location:** `scaffold/.claude/commands/gates.md`

**What it does:** Slash command (`/gates`) that runs all quality gates and reports results. The agent runs `npm run gates` and identifies specific errors if any gate fails.

**Why it exists:** Agents sometimes run individual checks and miss others. This command ensures the full suite runs every time, with clear stop-on-failure behavior.

**Bug it prevents:** Agent runs lint but forgets typecheck. Agent commits after tests pass but before checking the build.

**How to customize:**

- Change `npm run gates` to your package manager (`pnpm gates`, etc.)
- Add project-specific post-validation steps if needed

**Common mistakes:**

- Naming it something other than `gates.md` (agents look for standard names)
- Referencing individual commands instead of the single `gates` command

---

### .claude/commands/new-component.md

**Location:** `scaffold/.claude/commands/new-component.md`

**What it does:** Slash command (`/new-component`) that creates a component following project conventions. Reads CLAUDE.md for patterns, creates the component file, creates its test file, adds a smoke test, and runs `gates`.

**Why it exists:** Without a template command, every new component is a blank canvas. Agents guess at file locations, naming conventions, and test patterns. This command encodes your project's conventions into a repeatable recipe.

**Bug it prevents:** Component created in wrong directory. Test file missing. Smoke test not updated. Gates not run after creation.

**How to customize:**

- Change the file paths to match your directory structure
- Add any project-specific steps (e.g., registering in an index file, adding Storybook stories)
- Create additional commands for other common tasks (new-endpoint, new-page, new-hook)

**Common mistakes:**

- Not updating paths when your directory structure differs from the template
- Forgetting to include `npm run gates` as the final step

---

### .claude/commands/design.md

**Location:** `scaffold/.claude/commands/design.md`

**What it does:** Slash command (`/design`) that separates thinking from doing. When invoked with a task description (e.g., `/design add cursor-based pagination`), the agent researches the relevant codebase area, identifies reference implementations, and proposes a structured implementation plan — then stops and waits for human approval before writing any code.

**Why it exists:** The most expensive failure mode with AI agents isn't wrong syntax — it's building the wrong thing correctly. An agent that misunderstands a requirement can produce 8 files of implementation in a single turn. Unwinding that is costly. The `/design` command forces a review checkpoint between understanding and implementation.

**Bug it prevents:** Agent refactors 15 files based on a wrong assumption. Agent ignores an existing caching layer because it didn't research the codebase first. Agent duplicates logic that already exists elsewhere. Agent picks a complex approach when a simpler one would do.

**How to customize:**

- Adjust the proposal structure fields for your project's needs
- Add project-specific research instructions (e.g., "always check the migrations folder before proposing schema changes")
- The "Do NOT implement" guard is the most important part — keep it prominent

**Common mistakes:**

- Removing the "Do NOT implement" guard (agents will skip straight to code)
- Using it for single-file changes where it adds unnecessary friction
- Confusing it with Claude Code's built-in `/plan` mode — `/design` produces a structured research-backed proposal; `/plan` toggles the agent into plan-only mode

---

### .claude/hooks/session-start.sh

**Location:** `scaffold/.claude/hooks/session-start.sh`

**What it does:** Runs automatically when a Claude Code session starts. Detects the package manager (pnpm/yarn/npm/pip) and installs dependencies with a frozen lockfile.

**Why it exists:** The first thing an agent does in a fresh session is try to run a command — and it fails because `node_modules` doesn't exist. This hook eliminates that entire class of "install first" failures.

**Bug it prevents:** `npm run gates` fails with "command not found" because dependencies aren't installed. Agent wastes a turn installing dependencies manually.

**How to customize:**

- Add project-specific setup steps after the install (e.g., database migrations, environment file copying)
- Add setup validation (e.g., checking that required env vars exist)

**Common mistakes:**

- Not making the file executable (`chmod +x`)
- Adding interactive prompts (sessions run non-interactively)
- Not using `--frozen-lockfile` / `npm ci` (agents should never modify the lockfile)

---

### .github/workflows/ci.yml

**Location:** `scaffold/.github/workflows/ci.yml`

**What it does:** CI pipeline that runs on every push to main and every PR targeting main. Detects code vs. docs changes with `dorny/paths-filter`, reads Node version from `.node-version`, detects the package manager, installs dependencies, and runs `npm run gates`.

**Why it exists:** CI is the last line of defense. Even if a developer skips the pre-commit hook, CI catches it. The critical design choice: **CI runs the same `gates` command as local development.** One command, everywhere, no drift.

**Bug it prevents:** Code merged to main with lint errors. Breaking changes merged without test coverage. Node version in CI drifting from local development version.

**Key design choices:**

| Choice | Why |
|--------|-----|
| `dorny/paths-filter` | Skips CI on docs-only PRs (saves Actions minutes) |
| `.node-version` read, not hardcoded | Single source of truth for runtime version |
| Concurrency with cancel-in-progress | Prevents stacking runs on rapid pushes |
| 10-minute timeout | Prevents hung processes from burning budget |
| `npm run gates` as final step | Same command as local — no drift |

**How to customize:**

- Add environment variables for tests that need them (database URLs, API keys in secrets)
- Add matrix testing if you support multiple Node versions
- Add deployment steps after quality gates pass
- Change the paths-filter patterns if you have non-standard file extensions

**Common mistakes:**

- Hardcoding the Node version instead of reading `.node-version`
- Running individual checks (lint, test, build) instead of `gates`
- Forgetting to enable pnpm via corepack if using pnpm
- Not setting a timeout (default is 6 hours)

---

### .github/workflows/changelog-check.yml

**Location:** `scaffold/.github/workflows/changelog-check.yml`

**What it does:** Enforces that every PR with code changes also updates CHANGELOG.md. Skips for docs-only PRs (only .md files changed) and PRs with the `skip-changelog` label.

**Why it exists:** Changelogs drift immediately without enforcement. The question "what changed in this release?" becomes unanswerable within weeks. This workflow makes changelog updates a requirement, not a suggestion.

**Bug it prevents:** Release goes out with no changelog entry. "What shipped last week?" has no answer. CHANGELOG.md is 6 months stale.

**Escape hatches:**

| Escape hatch | When to use |
|--------------|-------------|
| `skip-changelog` label | Refactors, CI changes, dependency bumps — anything that doesn't affect users |
| Docs-only PR | Automatically skipped when only `.md` files changed |

**How to customize:**

- Change the target branch if your default isn't `main`
- Adjust the error message to match your team's changelog format
- Add additional skip conditions for your workflow

**Common mistakes:**

- Forgetting to create the `skip-changelog` label in GitHub
- Not using `fetch-depth: 0` in checkout (needed for `git diff` against main)

---

### .husky/pre-commit

**Location:** `scaffold/.husky/pre-commit`

**What it does:** Runs lint and typecheck before every commit. Fast checks only — the full test suite runs in CI.

**Why it exists:** Pre-commit hooks are the fastest feedback loop. They catch errors in seconds, before the commit even happens. This prevents "fix lint" commits cluttering the history.

**Bug it prevents:** Commits with lint errors. Commits with type errors. "Fix lint" follow-up commits.

**Contents:**

```bash
#!/bin/sh

# Quality gates — must pass before commit
# For full test suite, rely on CI. Pre-commit runs fast checks only.
npm run lint
npm run typecheck
```

**How to customize:**

- Change `npm run` to your package manager
- Add `./scripts/security-check.sh` for security scanning
- Keep it fast — if the hook takes more than 10 seconds, developers will skip it

**Common mistakes:**

- Running the full test suite in pre-commit (too slow — developers bypass it)
- Not installing husky (`npm install husky --save-dev && npx husky init`)
- Forgetting to make the file executable

---

### config/biome.json

**Location:** `scaffold/config/biome.json`

**What it does:** Configures Biome for linting and formatting TypeScript/JavaScript. Strict rules with opinionated defaults: tab indentation, single quotes, trailing commas, 100-character line width.

**Why it exists:** Without a linter, agents generate inconsistent code. One file uses semicolons, the next doesn't. One file uses double quotes, the next uses single. Biome catches this plus real bugs — unused variables, `any` usage, non-null assertions.

**Bug it prevents:** `any` masking real type errors. Unused imports accumulating. Inconsistent formatting across the codebase. `console.log` left in production code.

**Key rules and why:**

| Rule | Setting | Why |
|------|---------|-----|
| `noExplicitAny` | error | `any` masks real bugs — use `unknown` and narrow |
| `noUnusedVariables` | error | Dead code accumulates fast with agents |
| `noUnusedImports` | error | Agents add imports and forget to remove them |
| `noNonNullAssertion` | warn | `!` hides null checks — handle the null case |
| `noConsole` | warn | `console.log` in production is a data leak if stdout is structured |
| `noParameterAssign` | error | Reassigning params creates confusing bugs |
| `useLiteralKeys` | error | `obj["key"]` when `obj.key` works is noise |

**How to customize:**

- Change `indentStyle` to `"space"` if your team prefers spaces
- Change `quoteStyle` to `"double"` if that's your convention
- Add files to the `ignore` array for generated code
- Promote `warn` rules to `error` as your codebase matures

**Common mistakes:**

- Putting biome.json in the project root when it's in `config/` (update your `biome` script path)
- Not ignoring config files (`*.config.js`, `*.config.ts`)
- Setting `noConsole` to `error` before you have a structured logger

---

### config/tsconfig.json

**Location:** `scaffold/config/tsconfig.json`

**What it does:** Strict TypeScript configuration. Enables every meaningful strictness flag.

**Why it exists:** Relaxed TypeScript is worse than no TypeScript. It gives a false sense of safety while allowing `any` to propagate silently. Strict mode catches real bugs.

**Bug it prevents:** `any` propagation hiding type errors. Unchecked array index access causing runtime crashes. Unused variables and parameters accumulating.

**Key flags:**

| Flag | What it does |
|------|-------------|
| `strict: true` | Enables all strict checks (strictNullChecks, strictFunctionTypes, etc.) |
| `noUncheckedIndexedAccess` | `arr[0]` is `T \| undefined`, not `T` — prevents index-out-of-bounds |
| `noUnusedLocals` | Catches dead variables |
| `noUnusedParameters` | Catches dead parameters |
| `moduleResolution: "bundler"` | Modern resolution for bundler-based projects |
| `isolatedModules` | Required for SWC/esbuild transpilers |

**How to customize:**

- Set `target` to match your Node targets (e.g., `ES2022` for Node 18+)
- Add `paths` for path aliases (`@/` → `src/`)
- Add `include` and `exclude` patterns
- Set `exactOptionalPropertyTypes: true` if your codebase is ready for it (it's strict — start with `false`)

**Common mistakes:**

- Putting tsconfig.json in `config/` but not pointing your build tool to it
- Disabling `noUncheckedIndexedAccess` because it's "annoying" (it catches real bugs)
- Setting `target` to `ESNext` when you need to support Node 18 (use `ES2022`)

---

### config/.node-version

**Location:** `scaffold/config/.node-version`

**What it does:** Pins the Node.js runtime version. Contains a single number: `22`.

**Why it exists:** Without a pinned version, every developer and CI environment uses a different Node version. The CI workflow reads this file to set up Node — single source of truth. Version managers (nvm, fnm, mise) also read it automatically.

**Bug it prevents:** "Works on my machine" failures. CI using Node 20 while local uses Node 22. Agent generating Node 22 syntax that breaks on Node 18.

**How to customize:**

- Change `22` to the exact version your project requires
- `.node-version` pins an exact version (e.g. `22`) — CI and developers will use that exact runtime
- State the same version in CLAUDE.md's Quick Reference table

**Common mistakes:**

- Putting the version in CI workflow AND in `.node-version` (they'll drift)
- Using a version string like `v22.0.0` (just use `22`)

---

### scripts/security-check.sh

**Location:** `scaffold/scripts/security-check.sh`

**What it does:** Pre-commit security scanner that checks for path traversal, `console.log` in non-test files, hardcoded secrets, `eval()` usage, and SQL string interpolation. Non-blocking by default (exits 0 with warnings). Use `--strict` to fail on findings.

**Why it exists:** Agents don't think about security. They'll concatenate user input into file paths, interpolate variables into SQL queries, and hardcode API keys. This script catches the most common security mistakes before they reach the repo.

**Bug it prevents:** Path traversal vulnerabilities. Hardcoded API keys in source. SQL injection via string interpolation. `eval()` code injection.

**What it scans:**

| Pattern | Risk |
|---------|------|
| User input in `fs.readFile`, `path.join`, etc. | Path traversal |
| `console.log()` in non-test files | Data leak if stdout is structured |
| `api_key`, `secret`, `password` as string literals | Hardcoded secrets |
| `eval()` | Code injection |
| `SELECT`/`INSERT`/etc. with `${}` or `+` or `f""` | SQL injection |

**How to customize:**

- Add patterns specific to your stack (e.g., `dangerouslySetInnerHTML` for React)
- Add to the pre-commit hook: `./scripts/security-check.sh`
- Use `--strict` in CI to block merges with findings

**Common mistakes:**

- Not making the file executable (`chmod +x scripts/security-check.sh`)
- Running in strict mode in pre-commit (too noisy early on — use warn mode)
- Forgetting to exclude test files from `console.log` checks

---

### scripts/doc-sync-check.sh

**Location:** `scaffold/scripts/doc-sync-check.sh`

**What it does:** Detects documentation drift by comparing source-of-truth code patterns against doc files. Extracts items from source files (function names, route registrations, env vars) and checks that documentation references all of them.

**Why it exists:** Documentation drifts the moment it's written. A new endpoint gets added but not documented in AGENTS.md. A new env var gets used but not added to `.env.example`. This script catches those gaps.

**Bug it prevents:** Endpoints exist in code but not in docs. Environment variables used but not documented. API surface grows without documentation updates.

**How to customize:**

1. Uncomment the example rules at the bottom of the script
2. Define your own sync rules with `check_sync`:

```bash
check_sync \
  "Exported functions -> API.md" \
  "src/lib/*.ts" \
  "export (function|const) ([a-zA-Z]+)" \
  "docs/API.md"
```

3. Run with `--fix` to see exactly what to add (no auto-fix, but clear guidance)

**Common mistakes:**

- Leaving all rules commented out (the script does nothing by default — you must configure it)
- Using overly broad regex patterns that match false positives
- Not running it in CI (it only helps if it runs automatically)

---

### tests/test_architecture.ts

**Location:** `scaffold/tests/test_architecture.ts`

**What it does:** Guardrail test that enforces import boundaries. Scans `src/` for files that import protected modules (e.g., `pg`, `@prisma/client`) directly. Only designated wrapper modules are allowed to import them.

**Why it exists:** Agents don't know your architecture. They'll import the database client from any file, bypassing your connection pooling, error handling, and logging wrappers. A linter can't catch this — it requires understanding your project's dependency graph.

**Bug it prevents:** Direct database imports bypassing connection pooling. Raw `pg` usage instead of your wrapper. Scattered database access making it impossible to add logging or caching later.

**How to customize:**

```typescript
// 1. Change the forbidden imports to match YOUR protected modules
const FORBIDDEN_IMPORTS: string[] = [
  'pg',
  '@prisma/client',
  // Add: 'redis', 'aws-sdk', etc.
];

// 2. Change the allowed importers to YOUR wrapper module(s)
const ALLOWED_IMPORTERS: string[] = [
  'src/lib/db.ts',
  'src/db/client.ts',
];

// 3. Change SCAN_DIR if your source isn't in src/
const SCAN_DIR = 'src';
```

**Common mistakes:**

- Not adding all your wrapper modules to `ALLOWED_IMPORTERS` (test fails on legitimate imports)
- Forgetting to update the test when you add a new protected dependency
- Scanning test files (the template already excludes `.test.` and `.spec.` files)

---

### tests/test_architecture.py

**Location:** `scaffold/tests/test_architecture.py`

**What it does:** Python equivalent of the TypeScript guardrail test. Enforces three rules using AST parsing:

1. **Single database access point** — only `src/db/client.py` may import the DB driver
2. **Pagination on multi-row queries** — every `.all()` or `.filter()` must have a `.limit()`
3. **Registration consistency** — every file in `src/endpoints/` must be imported in `src/routes.py`

**Why it exists:** Same as the TypeScript version — agents don't respect implicit architecture. The Python version adds pagination enforcement and registration consistency because these are the two most common Python-specific agent mistakes.

**Bug it prevents:** Direct DB imports. Unbounded queries returning 100K rows. New endpoints that exist in code but aren't reachable because they're not registered.

**Key pattern — VERIFIED_SINGLE_ROW_LOOKUPS:**

```python
# Files known to perform single-row lookups (no pagination needed).
# Add entries here after manually verifying the query is safe.
VERIFIED_SINGLE_ROW_LOOKUPS: set[str] = {
    "src/users/repository.py:get_by_id",
    "src/auth/repository.py:get_session",
}
```

This allowlist pattern lets you mark specific functions as safe after manual review, preventing false positives without disabling the rule.

**How to customize:**

- Update `SRC_DIR`, `DB_WRAPPER_MODULE`, `FORBIDDEN_DB_IMPORTS` at the top
- Add to `VERIFIED_SINGLE_ROW_LOOKUPS` as you audit single-row queries
- Update `ROUTES_FILE` and `ENDPOINTS_DIR` to match your project structure

**Common mistakes:**

- Not updating `ENDPOINTS_DIR` (test silently skips if the directory doesn't exist)
- Adding too many entries to `VERIFIED_SINGLE_ROW_LOOKUPS` without actual verification
- Forgetting to run `pytest` — this test only helps if it's in your `gates` command

---

### tests/test_workspace_boundaries.ts

**Location:** `scaffold/tests/test_workspace_boundaries.ts`

**What it does:** Monorepo-specific guardrail test. Defines allowed/denied import relationships between workspace packages and scans for violations. Uses an explicit-allow model — if a package isn't in the `allow` list, imports from it are blocked.

**Why it exists:** In monorepos, agents create accidental circular dependencies by importing between packages that shouldn't know about each other. `packages/ui` imports from `packages/api`, which imports from `packages/ui`, and now you have a cycle that breaks the build in subtle ways.

**Bug it prevents:** Circular dependencies between packages. UI package importing backend code. Shared package depending on application packages. Accidental tight coupling between packages that should be independent.

**How to customize:**

```typescript
const WORKSPACE_RULES: Record<string, { allow: string[]; deny: string[] }> = {
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
```

Update the rules to match your actual package structure. If you have a single-package repo, delete this file entirely.

**Common mistakes:**

- Using this test in a single-package repo (it's only for monorepos)
- Forgetting to add new packages to the rules when you create them
- Putting packages in `deny` but not removing them from `allow` (allow takes precedence)

---

### tests/smoke.test.tsx

**Location:** `scaffold/tests/smoke.test.tsx`

**What it does:** Template for React component smoke tests. Each critical component gets a basic "renders without crashing" test.

**Why it exists:** Smoke tests are the cheapest way to catch catastrophic regressions. If `<Button>` can't render, you know immediately. Without smoke tests, a bad import or missing provider crashes the app at runtime.

**Bug it prevents:** Components that crash on render due to missing providers, bad imports, or broken dependencies.

**How to customize:**

```typescript
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';

describe('Component smoke tests', () => {
  it('renders Button without crashing', () => {
    const { container } = render(<Button>Click</Button>);
    expect(container).toBeTruthy();
  });

  it('renders Header without crashing', () => {
    const { container } = render(<Header />);
    expect(container).toBeTruthy();
  });
});
```

**Common mistakes:**

- Not wrapping components with required providers (Router, Theme, Auth)
- Testing implementation details instead of just "does it render"
- Forgetting to add new critical components to the smoke tests

---

### NOW.md.template

**Location:** `scaffold/NOW.md.template`

**What it does:** Session state tracker. Records current sprint, recently completed work, blockers, and next actions. Updated at the end of every work session.

**Why it exists:** Agents start fresh every session. Without NOW.md, you spend the first 5 minutes of every session re-explaining context. With it, the agent reads NOW.md and knows exactly where you left off.

**Bug it prevents:** Context loss between sessions. Agents re-doing completed work. Agents not knowing about active blockers. "What was I working on?" at the start of every session.

**How to customize:**

- Replace all `[bracketed]` values
- Keep it under 100 lines — if it's longer, you're not updating frequently enough
- Update at the END of every session, not the beginning

**Common mistakes:**

- Letting NOW.md grow unbounded (it should be a snapshot, not a log)
- Not updating it (stale NOW.md is worse than no NOW.md)
- Including too much detail (high-level tasks, not implementation notes)

---

### AGENTS.md.template

**Location:** `scaffold/AGENTS.md.template`

**What it does:** Provides execution guidance for Codex/GPT-style agents (scope, startup commands, repo rules, and PR expectations), with an optional API section for external consumers.

**Why it exists:** Codex-compatible environments prioritize `AGENTS.md` for operating instructions. A strong default improves agent reliability and developer experience from the first turn. Keep the external API section only when needed.

**Bug it prevents:** Agents running the wrong commands, missing repo constraints, and producing low-signal PRs without validation context.

**How to customize:**

- Always create this file for Codex/GPT agent compatibility
- Keep the top sections concise, executable, and repo-specific
- Keep the API tables only if your project exposes an external API/SDK/tool interface

**Common mistakes:**

- Leaving it generic (agents need concrete commands and constraints)
- Letting AGENTS.md and CLAUDE.md drift on canonical commands
- Keeping API sections for projects that do not expose external interfaces

---

### llms.txt.template

**Location:** `scaffold/llms.txt.template`

**What it does:** AI-readable project summary following the llms.txt convention. A brief, structured overview that any LLM can read to understand what the project is and how to interact with it.

**Why it exists:** When an LLM encounters your project for the first time (via web search, documentation crawl, or MCP), llms.txt gives it the 10-second overview. It's the `robots.txt` equivalent for AI agents.

**Bug it prevents:** LLMs misunderstanding the project's purpose. Agents not finding the right documentation entry point.

**How to customize:**

- Replace `[Project Name]`, `[One-line description]`, and all bracketed values
- Keep it short — under 50 lines
- Link to CLAUDE.md and AGENTS.md from the Documentation section

**Common mistakes:**

- Making it too long (it's a summary, not comprehensive documentation)
- Duplicating content from README.md (link to it instead)

---

### CHANGELOG.md

**Location:** `scaffold/CHANGELOG.md`

**What it does:** Starter changelog following [Keep a Changelog](https://keepachangelog.com/) format. Includes an `[Unreleased]` section with grouped entries (Added, Changed, Fixed, Removed).

**Why it exists:** The `changelog-check.yml` workflow requires CHANGELOG.md to exist and be updated with every code PR. This file provides the starting template.

**Bug it prevents:** Release with no record of what changed. "What shipped this week?" is unanswerable. Changelog created from git log (useless for users).

**How to customize:**

- Start adding entries under `[Unreleased]` immediately
- Group entries: Added, Changed, Fixed, Removed
- When you release, move `[Unreleased]` entries to a versioned section

**Common mistakes:**

- Writing changelog entries that describe code changes instead of user-visible changes
- Not grouping entries (a flat list becomes unreadable quickly)
- Forgetting to move `[Unreleased]` to a version number on release

---

### .env.example

**Location:** `scaffold/.env.example`

**What it does:** Documents every environment variable the project uses. Includes descriptions, required/optional markers, and example values. Committed to version control (unlike `.env`).

**Why it exists:** Without this file, agents invent environment variables. They'll create `DB_URL` when your project uses `DATABASE_URL`. They'll set `PORT=8080` when your app expects `3000`. This file is the single source of truth for environment configuration.

**Bug it prevents:** Agents inventing env var names. Missing required env vars in deployment. Developers not knowing what env vars to set. Wrong default values.

**How to customize:**

- Add every environment variable your project uses
- Mark each as REQUIRED or OPTIONAL in a comment
- Include realistic example values (not just `your-value-here`)
- Group by category (Server, Database, Auth, Feature Flags)

**Common mistakes:**

- Putting real secrets in `.env.example` (use placeholder values)
- Not updating `.env.example` when adding new env vars to the code
- Not listing this file in CLAUDE.md's Documentation Sync Rules

---

### .cursor/rules/typescript.mdc

**Location:** `scaffold/.cursor/rules/typescript.mdc`

**What it does:** Cursor IDE rules for TypeScript files. Uses YAML frontmatter to target specific file globs (`src/**/*.ts`, `src/**/*.tsx`). Defines critical rules, import patterns, and common mistakes.

**Why it exists:** Cursor uses `.mdc` files to provide context-aware suggestions. These rules apply automatically when editing TypeScript files in Cursor, reinforcing the same conventions defined in CLAUDE.md.

**Bug it prevents:** Cursor suggesting `any` instead of `unknown`. Cursor using CommonJS imports in an ESM project. Cursor missing `"use client"` directives.

**How to customize:**

- Add rules specific to your project's patterns
- Create additional `.mdc` files for other file types (`.cursor/rules/python.mdc`, `.cursor/rules/react.mdc`)
- Keep rules actionable — "Do X" not "Consider X"

**Common mistakes:**

- Contradicting CLAUDE.md rules (they must be consistent)
- Making rules too generic (Cursor rules should be specific to file patterns)
- Not using the frontmatter globs (rules apply to all files without them)

---

## 4. Stack-Specific Notes

### TypeScript vs Python

The scaffold is TypeScript-first, but every pattern has a Python equivalent. Here's the mapping:

| Concern | TypeScript | Python |
|---------|-----------|--------|
| Linter + Formatter | `config/biome.json` | `ruff` section in `pyproject.toml` |
| Type checker | `config/tsconfig.json` (`strict: true`) | `mypy` with `strict = true` |
| Test runner | vitest | pytest |
| Runtime pin | `config/.node-version` | `.python-version` |
| Quality gate | `npm run gates` / `pnpm gates` | `python -m gates` |
| Package config | `package.json` | `pyproject.toml` |
| Lockfile | `pnpm-lock.yaml` / `package-lock.json` | `uv.lock` / `requirements.txt` |
| Import boundaries test | `tests/test_architecture.ts` | `tests/test_architecture.py` |
| Workspace boundaries | `tests/test_workspace_boundaries.ts` | N/A (use namespace packages) |

### Python-specific setup

**pyproject.toml gates equivalent:**

```toml
[project.scripts]
gates = "scripts.gates:main"
```

Or in a Makefile:

```makefile
.PHONY: gates
gates:
	ruff check .
	mypy .
	pytest
```

**ruff configuration (replaces biome.json):**

```toml
[tool.ruff]
line-length = 100
target-version = "py312"

[tool.ruff.lint]
select = ["E", "F", "I", "N", "UP", "B", "A", "C4", "SIM", "TCH"]

[tool.ruff.lint.per-file-ignores]
"tests/**" = ["S101"]  # Allow assert in tests
```

**mypy configuration (replaces tsconfig.json):**

```toml
[tool.mypy]
strict = true
warn_return_any = true
warn_unused_configs = true
```

**CI adjustments for Python:**

```yaml
- uses: actions/setup-python@v5
  with:
    python-version-file: '.python-version'

- name: Install dependencies
  run: pip install -e ".[dev]"

- name: Run quality gates
  run: python -m gates
```

---

## 5. Advanced Patterns

### YAML Frontmatter on Docs

Add YAML frontmatter to documentation files for machine-readable metadata:

```markdown
---
title: API Authentication Guide
audience: [developers, agents]
last_verified: 2025-03-15
depends_on: [src/auth/middleware.ts, src/auth/providers.ts]
---

# API Authentication Guide
...
```

**Why:** Agents can filter docs by audience, skip stale docs, and check if source files have changed since the doc was last verified. The `depends_on` field powers the `doc-sync-check.sh` script.

**Fields to include:**

| Field | Purpose |
|-------|---------|
| `title` | Machine-readable title (may differ from the H1) |
| `audience` | Who this doc is for — filter for relevance |
| `last_verified` | Date someone confirmed this doc is still accurate |
| `depends_on` | Source files this doc describes — triggers drift warnings |
| `tier` | Which scaffold tier this doc belongs to (0-3) |

---

### The Rule-Bug-Prevention Format

Structure every coding convention with three parts:

```markdown
**Rule:** [What to do]
**Bug it prevents:** [What goes wrong without this rule]

// WRONG
[bad pattern with explanation]

// CORRECT
[good pattern with explanation]
```

**Why:** Agents follow rules better when they understand the consequence. "Use parameterized queries" is weaker than "Use parameterized queries — string interpolation causes SQL injection, which is a CVE."

**Example:**

````markdown
**Rule:** Always use parameterized queries for database operations.
**Bug it prevents:** SQL injection — user input in string-interpolated queries
can execute arbitrary SQL. This is a CVE-level vulnerability.

```typescript
// WRONG — SQL injection risk
const users = await db.query(`SELECT * FROM users WHERE id = '${userId}'`);

// CORRECT — parameterized query
const users = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
```
````

---

### Token-Efficient Response Formats

Define structured output templates in CLAUDE.md to prevent agents from writing essays when you want data:

```markdown
## Response Formats

When reporting test results, use this format:
| Gate | Status | Details |
|------|--------|---------|
| Lint | PASS/FAIL | [error count or "clean"] |
| Types | PASS/FAIL | [error count or "clean"] |
| Tests | PASS/FAIL | [X passed, Y failed] |
| Build | PASS/FAIL | [error or "clean"] |

When describing a code change, use:
**File:** `path/to/file.ts`
**Change:** [one sentence]
**Why:** [one sentence]
```

**Why:** Without explicit formats, agents write 500-word descriptions of a 3-line change. Structured formats save tokens and make output scannable.

---

### Research-Then-Plan Workflow

For multi-file changes, separate research from implementation using the `/design` command:

```text
┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐
│  RESEARCH  │────▶│  PROPOSE   │────▶│  REVIEW    │────▶│ IMPLEMENT  │────▶│  VERIFY    │
│            │     │            │     │            │     │            │     │            │
│ Read code  │     │ Write plan │     │ Human adds │     │ Execute    │     │ Run gates  │
│ deeply     │     │ with refs  │     │ notes and  │     │ approved   │     │            │
│            │     │            │     │ corrections│     │ plan       │     │            │
└───────────┘     └───────────┘     └───────────┘     └───────────┘     └───────────┘
                                          │
                                          ▼
                                    Repeat 1-3x
                                    until satisfied
```

**The annotation cycle:** After the agent proposes a plan, review it and add corrections directly:
- Correct assumptions: *"this should be a PATCH, not a PUT"*
- Reject approaches: *"remove the caching section, we don't need it here"*
- Add constraints: *"the signatures of these three functions must not change"*
- Point to references: *"this table should look exactly like the users table"*

Then send the agent back to revise: "I added notes — update the proposal accordingly. Don't implement yet." This cycle typically repeats 1-3 times. The explicit "don't implement yet" guard is essential — without it, the agent will jump to code the moment it thinks the plan is good enough.

**Reference implementations** are the highest-leverage technique. Instead of describing what you want from scratch, point to existing code: "follow the pattern in `src/routes/users.ts`". Agents are excellent at reproducing patterns from concrete examples. The Reference Implementations table in CLAUDE.md makes this systematic.

**When to skip it:** Single-file changes, typo fixes, documentation updates, and well-understood bug fixes don't need a formal plan. The threshold: if the change touches 3+ files or introduces a pattern the codebase doesn't have yet, use `/design`.

---

### Decision Trees

Use ASCII flowcharts in CLAUDE.md for common architectural choices:

```text
┌─────────────────────────────────┐
│ Does the component use hooks?    │
└──────────┬──────────────────────┘
     ┌─────┴──────┐
     │             │
    Yes           No
     │             │
     ▼             ▼
  Add            No directive
  "use client"   needed
  at top
```

**Why:** Agents follow decision trees more reliably than prose instructions. The branching structure maps directly to their reasoning process.

---

### Module-Level JSDoc

Add a purpose comment at the top of every module:

```typescript
/**
 * @module UserRepository
 * @description Handles all user database operations. This is the ONLY module
 * allowed to import from '@prisma/client' directly.
 *
 * @dependency prisma — connection managed by src/lib/db.ts
 * @see src/lib/db.ts for connection pool configuration
 */
```

**Why:** When an agent opens a file, the first thing it reads is the top. Module-level JSDoc tells it what this file does, what it depends on, and what constraints apply — before it reads a single line of code.

---

### Workspace Boundary Enforcement for Monorepos

The `test_workspace_boundaries.ts` test enforces dependency rules between packages. The pattern:

1. Define allowed imports per package in `WORKSPACE_RULES`
2. Test scans all source files for cross-package imports
3. Any import not in the `allow` list fails the test

**When to use:** Any monorepo with 2+ packages that shouldn't freely import from each other.

**When to skip:** Single-package repos. Monorepos where all packages can freely depend on each other (rare but valid).

**Scaling pattern:** For large monorepos (10+ packages), move `WORKSPACE_RULES` to a JSON file and check it separately:

```json
// workspace-rules.json
{
  "packages/ui": { "allow": ["packages/shared"], "deny": ["packages/api"] },
  "packages/api": { "allow": ["packages/shared", "packages/db"], "deny": ["packages/ui"] }
}
```

---

### Public API Stability Rules for Libraries

If your project is a library with external consumers, add these to CLAUDE.md:

```markdown
## Public API Stability

### Stable Exports (do not change without migration entry)
- `createClient` — factory function for API client
- `ClientOptions` — configuration type
- `ApiError` — error class

**Rule:** Any change to a stable export requires:
1. A new entry in MIGRATION.md explaining the change
2. A semver-appropriate version bump
3. Deprecation notice on the old API if not a major version
```

**Enforce it:** Add a guardrail test that reads MIGRATION.md and checks that every export rename/removal has a corresponding entry. Use the changelog-check workflow pattern but for MIGRATION.md.

**When to skip:** Apps, internal tools, and anything without external consumers.

---

### Data Integrity Rules for Data-Heavy Projects

For projects that read, transform, or persist data, add these rules to CLAUDE.md:

| Rule | Bug it prevents |
|------|----------------|
| Never cap results with array slicing (no `[:20]` or `.slice(0, 100)`) unless it's a documented CLI flag | Silent data loss — 50 items collected, only 20 saved |
| Per-item error handling in loops is mandatory | One bad item kills processing for everything after it |
| Log counts and error counts for every sync | "Synced 47/50 items, 3 failures" not silence |
| Ordering and pagination must be deterministic | Non-deterministic sort order = missed items on next page |
| Never pass empty strings to DB timestamp columns | Database constraint violations at 3 AM |

**When to skip:** Frontend-only projects. Projects that don't do data ingestion or sync.

---

### Debug Playbooks for Breaking Retry Loops

Agents get stuck in retry loops when they hit failures they don't understand. They'll try the same failing command 5 times before giving up. A debug playbook breaks the loop:

```markdown
## Debug Playbook

### If tests fail in CI but pass locally
1. Check for missing env vars — compare `.env` with CI secrets
2. Check for timezone differences — CI runs in UTC
3. Check for file ordering assumptions — CI filesystem may order differently

### If the build fails with "Cannot find module"
1. Delete `node_modules` and reinstall: `rm -rf node_modules && pnpm install`
2. Check for circular imports: `npx madge --circular src/`
3. Check for missing `@types/` packages

### If lint fails with unfixable errors
1. Run `pnpm lint --fix` first — many errors are auto-fixable
2. For remaining errors: read the rule name, check biome.json for the rule config
3. If the rule is wrong for this case, use `// biome-ignore` with an explanation
```

**Format: one heading per failure mode, numbered steps from most likely to least likely cause.**

Include the top 5 failure modes your project actually hits. Don't include generic advice — be specific to YOUR project.

---

### Compatibility Matrix Enforcement in CI

State your compatibility matrix explicitly in CLAUDE.md:

```markdown
| Aspect | Value |
|--------|-------|
| Node targets | >= 18 |
| TS target | ES2022 |
```

Then enforce it:

1. **CI reads `.node-version`** — not a hardcoded value in the workflow
2. **tsconfig.json `target` matches** — `ES2022` for Node 18+, `ESNext` for Node 22+
3. **CLAUDE.md states both** — agents see the constraint before writing code

**Bug it prevents:** Agent uses `Array.prototype.at()` (Node 16.6+), `structuredClone()` (Node 17+), or top-level `await` in CJS (never). By stating the targets explicitly, the agent knows what's available.

**Matrix testing in CI** (for libraries with multiple target versions):

```yaml
strategy:
  matrix:
    node-version: [18, 20, 22]
```

---

## Quick Reference: All Scaffold Files

| File | Purpose | Tier |
|------|---------|------|
| `CLAUDE.md.template` | Agent instructions — the most important file | 0 |
| `.claude/settings.json` | Allow/deny permissions for agent tools | 0 |
| `.env.example` | Environment variable documentation | 0 |
| `config/biome.json` | Linter + formatter config | 1 |
| `config/tsconfig.json` | Strict TypeScript config | 1 |
| `config/tsconfig.python-equiv.md` | Python equivalent notes (ruff, mypy, pytest) | Config/notes |
| `config/.node-version` | Pinned runtime version | 1 |
| `.husky/pre-commit` | Local quality gate hook | 1 |
| `.github/workflows/ci.yml` | CI pipeline — runs `gates` | 1 |
| `NOW.md.template` | Session state tracker | 2 |
| `.claude/commands/gates.md` | Slash command — run all gates | 2 |
| `.claude/commands/new-component.md` | Slash command — create component | 2 |
| `.claude/commands/design.md` | Slash command — research and propose before implementing | 2 |
| `.claude/hooks/session-start.sh` | Auto-install deps on session start | 2 |
| `tests/test_architecture.ts` | Import boundary guardrail (TypeScript) | 2 |
| `tests/test_architecture.py` | Import boundary guardrail (Python) | 2 |
| `tests/test_workspace_boundaries.ts` | Monorepo boundary guardrail | 2 |
| `tests/smoke.test.tsx` | Component smoke tests | 2 |
| `.github/workflows/changelog-check.yml` | Changelog enforcement | 2 |
| `CHANGELOG.md` | Changelog starter | 2 |
| `scripts/security-check.sh` | Pre-commit security scanner | 2 |
| `scripts/doc-sync-check.sh` | Documentation drift detection | 2 |
| `llms.txt.template` | AI-readable project summary | 3 |
| `AGENTS.md.template` | External agent integration guide | 3 |
| `.cursor/rules/typescript.mdc` | Cursor IDE rules | 3 |
| `.cursor/rules/shell-scripts.mdc` | Cursor IDE rules for shell script conventions and linting | IDE rules |
