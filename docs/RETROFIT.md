# Retrofit Guide

How to apply the scaffold to an existing project. Work through the phases in order — each builds on the previous one.

**Priority rule: If you can only do one thing, write the CLAUDE.md.**

---

## Audit Checklist

Run through this checklist to identify what your project is missing:

| Item | Have it? | Priority |
|------|----------|----------|
| CLAUDE.md with project overview, commands, architecture | ☐ | Critical |
| `.claude/settings.json` with allow/deny permissions | ☐ | Critical |
| `.env.example` with all env vars documented | ☐ | Critical |
| Single `gates` script that runs all checks | ☐ | Critical |
| Linter configured and enforced | ☐ | High |
| Strict TypeScript / mypy | ☐ | High |
| Pre-commit hooks | ☐ | High |
| CI pipeline running `gates` | ☐ | High |
| Runtime version pinned (.node-version / .python-version) | ☐ | High |
| NOW.md for session state | ☐ | Medium |
| Slash commands for common tasks | ☐ | Medium |
| Guardrail tests (architecture boundaries) | ☐ | Medium |
| CHANGELOG.md with enforcement | ☐ | Medium |
| Debug playbook in CLAUDE.md | ☐ | Medium |
| Starting points in CLAUDE.md | ☐ | Medium |
| Compatibility matrix in CLAUDE.md (libraries) | ☐ | Medium |
| Workspace boundary tests (monorepos) | ☐ | Medium |
| llms.txt | ☐ | Low |
| AGENTS.md (Codex/GPT operating instructions) | ☐ | Low |
| Cursor rules | ☐ | Low |

---

## Phase 1: Immediate Impact (30 min)

### 1. Create CLAUDE.md

Copy `scaffold/CLAUDE.md.template` and fill in:

1. **Project Overview** — one paragraph explaining what the project does
2. **Quick Reference table** — package manager, runtime, framework, all commands
3. **Development Commands** — every command copy-paste ready
4. **Architecture section** — directory map with annotations
5. **Starting Points** — the 3-5 files where most tasks begin

This alone eliminates most wasted exploration turns.

### 2. Create `.claude/settings.json`

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
      "Bash(git reset --hard*)"
    ]
  }
}
```

Adjust the allow list for your project's actual commands.

### 3. Create `.env.example`

List every environment variable your project uses. Include:
- Variable name
- Whether it's required or optional
- A realistic example value
- What it does

### 4. Add the `gates` Script

Add to `package.json`:

```json
{
  "scripts": {
    "gates": "npm run lint && npm run typecheck && npm run test && npm run build"
  }
}
```

Adjust to match your project's actual check commands. The key: one command runs everything.

---

## Phase 2: Prevent Regressions (1 hr)

### 1. Set Up Pre-commit Hooks

```bash
npm install husky --save-dev
npx husky init
```

Create `.husky/pre-commit`:

```bash
#!/bin/sh
npm run lint
npm run typecheck
```

### 2. Set Up CI

Copy `scaffold/.github/workflows/ci.yml` and adjust:
- Change the Node version source if you don't use `.node-version`
- Update the install command for your package manager
- Ensure the final step runs `npm run gates`

### 3. Configure Linting

If you don't have a linter:
- **TypeScript:** Copy `scaffold/config/biome.json`
- **Python:** Add ruff config to `pyproject.toml`

If you have a linter but it's not strict, tighten the rules incrementally. Enable one strict rule per PR to avoid a massive diff.

### 4. Enable Strict TypeScript

If `strict: true` isn't set, enable it incrementally:

1. Start with `"strict": true` in tsconfig
2. Fix all errors (or use `// @ts-expect-error` with explanations temporarily)
3. Enable `"noUncheckedIndexedAccess": true` next
4. Enable `"noUnusedLocals": true` and `"noUnusedParameters": true`

### 5. Pin the Runtime

Create `.node-version` (or `.python-version`) with your target runtime version. Ensure CI reads from this file.

---

## Phase 3: Navigation (1 hr)

### 1. Add Cursor Rules (if team uses Cursor)

Copy `scaffold/.cursor/rules/typescript.mdc` and customize:
- Update the glob patterns for your file structure
- Add project-specific rules for common mistakes

### 2. Create AGENTS.md (for Codex/GPT compatibility)

Create this for all projects so Codex/GPT agents have explicit working rules. Copy `scaffold/AGENTS.md.template` and fill in:
- Scope + project snapshot
- First commands and working rules
- PR/commit requirements
- API section only if the project exposes an external interface

### 3. Create llms.txt

Copy `scaffold/llms.txt.template` and fill in:
- Project name and description
- Key features
- Documentation links

---

## Phase 4: Polish (as needed)

### 1. Add Security Scripts

Copy `scaffold/scripts/security-check.sh`. Add to pre-commit if your project handles user input.

### 2. Add Doc Sync Checking

Copy `scaffold/scripts/doc-sync-check.sh`. Configure the sync rules for your project's source-of-truth files.

### 3. Add Session Start Hook

Copy `scaffold/.claude/hooks/session-start.sh`. This auto-installs dependencies at the start of every Claude session.

### 4. Add Guardrail Tests

Copy the appropriate test files:
- `test_architecture.ts` — for TypeScript projects
- `test_architecture.py` — for Python projects
- `test_workspace_boundaries.ts` — for monorepos only

Customize the forbidden imports and allowed wrapper modules.

### 5. Add NOW.md

Copy `scaffold/NOW.md.template` if the project will last more than 2 weeks. Update it at the end of every work session.

---

## Common Retrofit Mistakes

| Mistake | Fix |
|---------|-----|
| Trying to do everything at once | Start with Phase 1 only. Add phases as you go. |
| Enabling strict TypeScript in one PR | Enable incrementally — one rule per PR. |
| Copying templates without customizing | Every `[bracket]` must be replaced. Templates with brackets are worse than no template. |
| Skipping the `gates` script | This is the single most impactful change. Don't skip it. |
| Different commands in CI vs local | CI must run `npm run gates` — the same command as local hooks. |
| Writing CLAUDE.md but not updating it | Stale CLAUDE.md is worse than none. Update it with every structural change. |
