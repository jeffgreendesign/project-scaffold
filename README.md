# project-scaffold

Opinionated project scaffold with AI-native defaults.

- Every project starts with guardrails that prevent common LLM mistakes
- Quality gates that catch errors before they hit the repo
- Documentation structure that makes AI agents productive from turn one

---

## Quick Start

### Option A: Use as GitHub Template

Click **"Use this template"** on GitHub to create a new repo with all scaffold files.

### Option B: Copy into an Existing Project

```bash
git clone https://github.com/jeffgreendesign/project-scaffold.git
./project-scaffold/scripts/scaffold.sh /path/to/your/project
```

### Option C: Single-File Install

```bash
# No clone needed — single script creates all files
curl -sL https://raw.githubusercontent.com/jeffgreendesign/project-scaffold/main/scripts/init.sh | bash
```

> **Security note:** Piping `curl` to `bash` executes remote code without review.
> To inspect the script first:
>
> ```bash
> curl -sL https://raw.githubusercontent.com/jeffgreendesign/project-scaffold/main/scripts/init.sh -o init.sh
> less init.sh        # review the script
> bash init.sh        # run after review
> ```

### Option D: Cherry-Pick Individual Files

Browse the `scaffold/` directory and copy only the files you need.

---

## What's Included

Every file in `scaffold/` with its purpose:

| File | Purpose |
|------|---------|
| `CLAUDE.md.template` | Project context for LLM agents — commands, architecture, conventions |
| `NOW.md.template` | Session state tracker — prevents context loss between sessions |
| `AGENTS.md.template` | Codex/GPT agent instructions + optional external API guide |
| `llms.txt.template` | AI-readable project summary for discovery |
| `.env.example` | Environment variable documentation with examples |
| `CHANGELOG.md` | Changelog starter following Keep a Changelog format |
| `.claude/settings.json` | Pre-approved safe commands, blocked destructive operations |
| `.claude/commands/gates.md` | Slash command: run all quality gates |
| `.claude/commands/new-component.md` | Slash command: create component following conventions |
| `.claude/commands/design.md` | Slash command: research codebase and propose plan before implementing |
| `.claude/hooks/session-start.sh` | Auto-install dependencies on session start |
| `.github/workflows/ci.yml` | CI pipeline: lint, typecheck, test, build via `gates` |
| `.github/workflows/changelog-check.yml` | Enforce changelog updates on PRs |
| `.husky/pre-commit` | Pre-commit hook running fast quality checks |
| `.cursor/rules/typescript.mdc` | Cursor IDE rules for TypeScript conventions |
| `.cursor/rules/shell-scripts.mdc` | Cursor IDE rules for shell script conventions and linting |
| `scripts/security-check.sh` | Pre-commit security scanner (path traversal, secrets, eval) |
| `scripts/doc-sync-check.sh` | Documentation drift detection |
| `config/biome.json` | Biome linter + formatter config (strict, tabs, single quotes) |
| `config/tsconfig.json` | Strict TypeScript config |
| `config/tsconfig.python-equiv.md` | Python equivalent notes (ruff, mypy, pytest) |
| `config/.node-version` | Pinned Node.js runtime version |
| `tests/test_architecture.ts` | Guardrail test: import boundary enforcement (TypeScript) |
| `tests/test_architecture.py` | Guardrail test: DB access, pagination, registration (Python) |
| `tests/test_workspace_boundaries.ts` | Guardrail test: monorepo dependency boundaries |
| `tests/smoke.test.tsx` | Component smoke test example (React/Vitest) |

---

## Tier System

Adopt incrementally. Each tier builds on the previous one. See [docs/TIERS.md](docs/TIERS.md) for full details.

| Tier | Time | What You Get | Key Files |
|------|------|-------------|-----------|
| **0** | 15 min | LLM can work autonomously | CLAUDE.md, settings.json, .env.example, `gates` script |
| **1** | 1 hr | Mistakes caught before repo | linter, strict types, hooks, CI, .node-version |
| **2** | 2-3 hrs | Sustained multi-session quality | NOW.md, commands, guardrail tests, changelog |
| **3** | optional | Multi-agent discoverability and DX | llms.txt, AGENTS.md, Cursor rules |

**Start with Tier 0.** If you can only do one thing: write the CLAUDE.md.

---

## Customization

### Template Files (`.template` extension)

These files use `[brackets]` for placeholder values and `<!-- CUSTOMIZE -->` comments for sections that need editing:

1. Copy the file (or run `scaffold.sh` which copies all of them)
2. Replace every `[bracketed]` value with your project's actual values
3. Delete the `<!-- CUSTOMIZE -->` comments once done
4. Delete entire sections that don't apply (e.g., "Data Integrity Rules" for projects without data sync)

### Non-Template Files

These work with minimal changes:

- **`.claude/settings.json`** — Adjust the `allow` list for your project's commands
- **CI workflows** — May need package manager adjustments
- **`biome.json`** — Works as-is for most TypeScript projects
- **`tsconfig.json`** — Works as-is; add `"jsx": "react-jsx"` for React projects
- **Guardrail tests** — Update the forbidden imports and allowed wrappers for your architecture

### The `gates` Script

Add to your `package.json`:

```json
{
  "scripts": {
    "gates": "npm run lint && npm run typecheck && npm run test && npm run build"
  }
}
```

This is the single quality gate command. CI, pre-commit hooks, and CLAUDE.md all reference `gates`. One name, every repo.

---

## Philosophy

Make implicit knowledge explicit. LLMs don't have institutional memory.

Every convention, every command, every architectural decision that lives in someone's head needs to live in a file. Agents start fresh each session. They can't learn from past mistakes. They need explicit rules, enforced by tools, caught before commit.

The core loop: **Tell → Enforce → Fail Fast.**

- **Tell:** CLAUDE.md, docs, comments tell the agent what to do
- **Enforce:** Linters, CI, hooks, guardrail tests make rules mandatory
- **Fail Fast:** Errors caught in pre-commit and CI, not production

---

## Documentation

| Document | Description |
|----------|-------------|
| [docs/GUIDE.md](docs/GUIDE.md) | Full playbook — file-by-file deep dive, advanced patterns |
| [docs/TIERS.md](docs/TIERS.md) | Tier breakdown with time estimates and file lists |
| [docs/RETROFIT.md](docs/RETROFIT.md) | How to apply the scaffold to existing projects |
| [docs/ANTI-PATTERNS.md](docs/ANTI-PATTERNS.md) | What not to do — common mistakes and fixes |
| [docs/DECISION-TREES.md](docs/DECISION-TREES.md) | Flowcharts for choosing which files you need |
| [docs/EXAMPLES.md](docs/EXAMPLES.md) | Before/after examples showing the impact |

---

## Stacks

The scaffold supports two stacks:

- **TypeScript (Node.js)** — Primary target. All config files and examples are TypeScript-first.
- **Python** — Secondary. See `config/tsconfig.python-equiv.md` for equivalent tooling (ruff, mypy, pytest). Python guardrail test included at `tests/test_architecture.py`.

---

## License

MIT
