# Anti-Patterns

What not to do when setting up LLM-friendly project infrastructure. Each anti-pattern includes why it fails and what to do instead.

## The Table

| Anti-Pattern | Why It Fails | Do This Instead |
|---|---|---|
| 1000+ line CLAUDE.md | Eats context budget. Agent can't find relevant info in a wall of text. | Keep under 500 lines. Split detailed docs into separate files. |
| Docs in a wiki | Drift immediately. No PR review. No version control. Wiki and code diverge within days. | Co-locate with code. Docs live in the repo and ship with PRs. |
| "Update docs later" | Later never comes. The PR ships, the ticket closes, docs rot. | Atomic commits — code and docs in the same PR, same commit. |
| Instructions without enforcement | LLMs ignore prose rules. "Please don't use any" doesn't work when the agent is under pressure to ship. | Linter + CI + hooks. Make rules structural, not aspirational. |
| No `gates` script | LLMs skip individual checks. Agent runs tests but forgets linting. Or lints but skips typecheck. | One command runs everything: `npm run gates`. |
| Multiple gate command names | Agent doesn't know which to run. `npm run check` in CI, `npm run gates` locally, `npm run quality` in docs. | Standardize on `gates` everywhere — CI, hooks, docs, CLAUDE.md. |
| Relaxed TypeScript | `any` masks real bugs. Agent uses `any` as an escape hatch, bugs surface in production. | `strict: true`, `noUncheckedIndexedAccess: true`, lint rule banning `any`. |
| Version numbers in 10 places | They'll disagree within a week. Agent updates package.json but not the README badge. | Single source of truth. One file owns the version. |
| Separate doc PRs | Docs lag behind code. "I'll update the docs in a follow-up PR" → PR never created. | Same PR, same commit. Code change = doc change. |
| Missing .env.example | LLMs invent env vars. Agent guesses `DB_HOST` when it should be `DATABASE_URL`. | Document every variable in .env.example with types and examples. |
| Advisory-only rules | Ignored under deadline pressure. "We recommend running tests" → agent skips tests. | CI enforcement. Rules that aren't enforced aren't rules. |
| No compatibility matrix | Agent "modernizes" syntax, drops runtime support. Uses `Array.at()` on Node 14. | State Node targets + TS target in CLAUDE.md Quick Reference table. |
| No starting points in CLAUDE.md | Agent explores wrong directories in multi-root repos. Edits `website/` when you meant `app/`. | List top 3-5 entry points with "most tasks start here" table. |
| No debug playbook | Agent gets stuck in retry loops on common failures. Runs `npm run build` 5 times with same error. | Document top 5 failure modes and their fixes in CLAUDE.md. |
| Changing stable exports without migration | Consumers break silently. Agent renames `getData()` to `fetchData()`, breaks every downstream import. | Require MIGRATION.md entry for any public API change (libraries only). |
| No workspace boundary rules (monorepos) | Accidental circular deps between packages. `packages/ui` imports from `packages/api` which imports from `packages/ui`. | Guardrail test with explicit allow/deny import rules per package. |
| Implementing multi-file changes without a plan | Agent misunderstands a requirement, builds 8 files in the wrong direction, you revert everything. More capable models go further, faster, on wrong assumptions. | For changes touching 3+ files or introducing new patterns, use `/design` to research and propose before implementing. Review the proposal. Then approve. |

## Deep Dives

### "But my CLAUDE.md needs to be long — the project is complex"

Split it. Keep CLAUDE.md under 500 lines with the essentials:
- Quick Reference table
- Development commands
- Directory map with starting points
- Code conventions (top 5 rules)
- Common mistakes
- Debug playbook

Move everything else to separate docs:
- Detailed architecture → `docs/ARCHITECTURE.md`
- API reference → `AGENTS.md`
- Data model → `docs/DATA-MODEL.md`
- Deployment → `docs/DEPLOYMENT.md`

CLAUDE.md links to these files. The agent reads them on demand.

### "We use ESLint, not Biome"

That's fine. The scaffold uses Biome because it's fast and handles both linting and formatting. The principle is what matters: have a strict linter that runs in CI and pre-commit. ESLint + Prettier works. Biome works. No linter doesn't work.

### "We don't need guardrail tests — our linter catches everything"

Linters catch syntax and style. Guardrail tests catch architecture. A linter can't know that `packages/ui` shouldn't import from `packages/api`. A linter can't enforce that all database access goes through `src/lib/db.ts`. Guardrail tests fill the gap between "syntactically valid" and "architecturally correct."

### "We have a monorepo but don't need workspace boundary tests"

You will. The first time an agent creates a circular dependency between packages, you'll spend an hour debugging why the build fails. Workspace boundary tests catch this in 2 seconds at CI time.

### "But planning slows me down for small changes"

Correct. The `/design` workflow is for changes that touch multiple files or introduce new patterns. For single-file fixes, type fixes, and documentation updates, implement directly. The threshold: if you would review the PR diff before merging, review a proposal before implementing. Single-file changes don't need a proposal. A new subsystem spanning 8 files does.

### "Our project doesn't need all these files"

Correct. See [docs/DECISION-TREES.md](DECISION-TREES.md) for flowcharts that tell you exactly which files to include based on your project type. The scaffold is modular — use what you need, delete what you don't.
