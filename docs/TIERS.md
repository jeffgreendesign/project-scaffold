# Tier System

Adopt the scaffold incrementally. Each tier builds on the previous one. Start at Tier 0 and work up as the project matures.

## Overview

| Tier | Time | Files | Value |
|------|------|-------|-------|
| 0 | 15 min | CLAUDE.md, settings.json, .env.example, `gates` script | LLM can work autonomously |
| 1 | 1 hr | linter, strict types, hooks, CI, .node-version | Mistakes caught before repo |
| 2 | 2-3 hrs | NOW.md, commands, guardrail tests, changelog, frontmatter, API stability (libraries), workspace boundaries (monorepos) | Sustained multi-session quality |
| 3 | optional | llms.txt, AGENTS.md, MCP, Cursor rules, decision trees | Multi-agent discoverability and DX |

---

## Tier 0: Before You Write Code (15 min)

**If you can only do one thing from this tier, do: write the CLAUDE.md.**

### Files to Create

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Project context for LLM agents — commands, architecture, conventions |
| `.claude/settings.json` | Pre-approved safe commands, blocked destructive operations |
| `.env.example` | Document every environment variable with examples |
| `package.json` `"gates"` script | Single command that runs all quality checks |

### Why This Tier First

Without Tier 0, every LLM session starts with exploration. The agent reads random files, guesses at commands, invents environment variables, and runs destructive operations. CLAUDE.md alone eliminates 80% of wasted turns.

### What You Lose If You Skip It

- Agent burns 5-10 turns exploring the codebase each session
- Agent uses wrong commands (`yarn` instead of `pnpm`, `npm test` instead of `pnpm gates`)
- Agent invents `.env` values and breaks database connections
- Agent runs `rm -rf` or `git push --force` without guardrails

### The `gates` Script

Add to `package.json`:

```json
{
  "scripts": {
    "gates": "npm run lint && npm run typecheck && npm run test && npm run build"
  }
}
```

Python equivalent in `pyproject.toml`:

```toml
[tool.hatch.envs.default.scripts]
gates = ["ruff check .", "ruff format --check .", "mypy .", "pytest"]
```

---

## Tier 1: First Week (1 hr)

**If you can only do one thing from this tier, do: set up the linter with CI.**

### Files to Create

| File | Purpose |
|------|---------|
| `config/biome.json` | Lint + format (TypeScript) |
| `config/tsconfig.json` | Strict TypeScript (`strict: true`, `noUncheckedIndexedAccess`) |
| `.node-version` | Pin the runtime version |
| `.husky/pre-commit` | Run fast checks before every commit |
| `.github/workflows/ci.yml` | Run `gates` on every push and PR |

### Why This Tier Before Tier 2

Tier 0 tells the agent what to do. Tier 1 enforces it. Without enforcement, agents ignore rules under pressure — they'll skip linting, use `any` types, and commit without checking. CI + hooks make compliance structural, not aspirational.

### What You Lose If You Skip It

- `any` types accumulate silently until the codebase is untyped
- Formatting inconsistencies in every PR
- Lint errors discovered in production, not development
- Runtime version drift between local and CI

### Stack Variants

**Python projects:** Replace biome.json with ruff config in `pyproject.toml`. Replace tsconfig.json with mypy strict config. See `config/tsconfig.python-equiv.md` for exact mappings.

---

## Tier 2: Project Has Legs (2-3 hrs)

**If you can only do one thing from this tier, do: add guardrail tests.**

### Files to Create

| File | Purpose | Project Type |
|------|---------|-------------|
| `NOW.md` | Session state tracker — prevents context loss | All |
| `.claude/commands/gates.md` | Slash command to run all gates | All |
| `.claude/commands/new-component.md` | Slash command for component creation | All |
| `tests/test_architecture.ts` | Guardrail test — import boundaries | All |
| `tests/test_architecture.py` | Guardrail test — Python equivalent | Python |
| `CHANGELOG.md` | Track notable changes | All |
| `.github/workflows/changelog-check.yml` | Enforce changelog updates on PRs | All |
| `tests/test_workspace_boundaries.ts` | Monorepo dependency boundaries | **Monorepos only** |
| Public API Stability section in CLAUDE.md | Prevent breaking changes to exports | **Libraries only** |
| Data Integrity Rules section in CLAUDE.md | Prevent silent data loss | **Data-heavy projects only** |

### Why This Tier Before Tier 3

Tier 2 is about sustained quality across multiple sessions. NOW.md prevents context loss. Guardrail tests catch architectural violations that linters can't. Changelog enforcement prevents "what changed?" confusion.

### What You Lose If You Skip It

- Context lost between sessions — agent re-explores every time
- Architectural boundaries violated silently (direct DB imports, circular deps)
- No changelog → no release notes → no idea what changed
- Libraries: breaking changes shipped without migration guides
- Monorepos: circular dependencies between packages

### Project-Type Variants

**Libraries with external consumers:**
- Add the "Public API Stability" section to CLAUDE.md
- Create MIGRATION.md for tracking breaking changes
- Add compatibility matrix (Node targets, TS target) to CLAUDE.md Quick Reference
- Enforce semver in CI

**Monorepos:**
- Add `tests/test_workspace_boundaries.ts` with WORKSPACE_RULES config
- Consider per-package `gates` scripts
- Add changeset enforcement for coordinated releases

**Data-heavy projects (ingestion, sync, ETL):**
- Add the "Data Integrity Rules" section to CLAUDE.md
- Enforce pagination on all multi-row queries
- Require per-item error handling in processing loops
- Log counts for every sync operation

---

## Tier 3: Public / Multi-Agent (Optional)

**If you can only do one thing from this tier, do: create llms.txt.**

### Files to Create

| File | Purpose |
|------|---------|
| `llms.txt` | AI-readable project summary for external agents |
| `AGENTS.md` | Codex/GPT agent instructions (+ optional external API guide) |
| `.cursor/rules/typescript.mdc` | Cursor IDE rules for TypeScript conventions |
| Decision trees in docs | Flowcharts for common architectural choices |

### Why This Tier Is Optional

Tier 3 is for projects that are consumed by external agents or used in multi-agent workflows. If your project is an internal app with no API, skip this tier entirely.

### What You Lose If You Skip It

- External agents can't discover your project's capabilities
- Cursor users don't get project-specific rules
- New team members (human or AI) spend longer understanding the architecture

### When to Implement

- Always create AGENTS.md for Codex/GPT execution guidance
- Project is an open-source library → create llms.txt
- Team uses Cursor → create .cursor/rules/
- Architecture choices aren't obvious → create decision trees

---

## Quick Decision Guide

```text
┌─────────────────────────────┐
│ How long will this project  │
│ be actively developed?      │
└──────────┬──────────────────┘
     ┌─────┴──────┐
     │             │
  < 2 weeks    > 2 weeks
     │             │
     ▼             ▼
  Tier 0        Tier 0 + 1
  only          minimum
                     │
              ┌──────┴──────┐
              │              │
           > 1 month    > 3 months
              │              │
              ▼              ▼
           Tier 2         Tier 2 + 3
           add on         full scaffold
```
