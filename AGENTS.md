# AGENTS.md

## Scope

These instructions apply to the entire repository.

## Project Snapshot

- **What this repo is:** A scaffold/template repository used to bootstrap AI-friendly projects, including Vercel + Neon + Better Auth projects.
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
5. Use only official Vercel, Neon, and Better Auth docs for stack guidance.

## PR / Commit Requirements

- Include concise summary + impact.
- Include commands run and outcomes.
- Keep commit messages scoped and readable.

## Documentation Map

- `README.md` — repo overview
- `CLAUDE.md` — deeper workflow and architecture notes
- `docs/AX_UPGRADE_REPORT.md` — inventory + AX upgrade changelog
- `docs/ENV.md` — environment variable model (Vercel + Neon + Better Auth)
- `docs/RUNBOOK.md` — local dev, deployment, and migration runbook
- `docs/ARCHITECTURE.md` — repository and target architecture guidance
- `docs/DECISIONS.md` — decision log for architectural choices
- `docs/TROUBLESHOOTING.md` — common failure modes and fixes

## Official References

- Vercel agent resources: https://vercel.com/docs/agent-resources
- Vercel agent skills: https://vercel.com/docs/agent-resources/skills
- Vercel environment variables: https://vercel.com/docs/environment-variables
- Neon docs: https://neon.tech/docs
- Neon branching: https://neon.tech/docs/introduction/branching
- Better Auth docs: https://www.better-auth.com/docs
- Drizzle ORM: https://orm.drizzle.team/docs/overview
