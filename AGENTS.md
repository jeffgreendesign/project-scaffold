# AGENTS.md

## Scope

These instructions apply to the entire repository.

## Project Snapshot

- **What this repo is:** A scaffold/template repository used to bootstrap AI-friendly projects, including Vercel + Supabase projects.
- **Primary stack:** Mixed (Bash + Markdown + template TypeScript config)
- **Package manager:** pnpm (for local command standardization in this repo)
- **Canonical quality gate:** `pnpm verify`

## First Commands To Run

```bash
pnpm install
pnpm verify
```

## Working Rules

1. Use `rg` for search.
2. Keep edits small and reviewable.
3. Run `pnpm verify` before committing.
4. Keep scaffold templates and root docs aligned.
5. Use only official Vercel and Supabase docs for Vercel/Supabase guidance.

## PR / Commit Requirements

- Include concise summary + impact.
- Include commands run and outcomes.
- Keep commit messages scoped and readable.

## Documentation Map

- `README.md` — repo overview
- `CLAUDE.md` — deeper workflow and architecture notes
- `docs/AX_UPGRADE_REPORT.md` — inventory + AX upgrade changelog for this task
- `docs/` — operational and architectural references
