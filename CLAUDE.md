# CLAUDE.md

## Project Overview

This repository is a reusable scaffold for AI-assisted development workflows. It ships template files under `scaffold/` and supporting scripts/docs in the root so downstream projects can quickly adopt consistent agent instructions, quality gates, and delivery guardrails.

## Workflow

- **Small changes**: implement directly.
- **Multi-file changes/new patterns**: create a short plan first, then implement.
- Always run `pnpm verify` before finishing.

## Quick Reference

| Aspect          | Value |
|-----------------|-------|
| Package manager | pnpm |
| Runtime         | Node.js >= 22 |
| Language        | Bash + Markdown + template TypeScript config |
| Framework       | N/A in this scaffold repo (templates target multiple stacks) |
| Lint            | `pnpm lint` |
| Type check      | `pnpm typecheck` |
| Test            | `pnpm test` |
| Build           | `pnpm build` |
| **All checks**  | **`pnpm verify`** |

## Development Commands

```bash
# Placeholder dev command for this template repository
pnpm dev

# Full verification gate
pnpm verify

# Individual checks
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Architecture

### Key Systems

- `scaffold/`: files copied into downstream repositories.
- `scripts/`: validation, scaffold generation, and packaging helpers.
- `docs/`: long-form guidance for maintainers of this scaffold.

### Directory Map

```text
scaffold/    # installable template files
scripts/     # shell automation for validation/generation
docs/        # maintainer-facing documentation
```

### Starting Points

| Task | Start Here | Why |
|------|------------|-----|
| Update template behavior | `scaffold/` | Source-of-truth files used by consumers |
| Update generation logic | `scripts/generate-init.sh` | Controls generated installer output |
| Update maintainer guidance | `docs/AX_UPGRADE_REPORT.md` | Tracks AX upgrade inventory and decisions |

## Code Conventions

### Shell + Template Safety

**Rule:** Keep shell scripts POSIX-safe Bash and syntax-check them.
**Bug it prevents:** Installer failures and broken generation pipelines.

### Documentation Integrity

**Rule:** If template behavior changes, update corresponding docs in `docs/`.
**Bug it prevents:** Drift that confuses agents and humans.

## Common Mistakes

### Build Breakers

- Editing `scaffold/` without re-running `scripts/generate-init.sh`.
- Introducing commands that assume npm/yarn when the standard gate is `pnpm verify`.

### Silent Bugs

- Missing official-doc links for Vercel/Supabase guidance.
- Documenting env vars without noting server vs client boundaries.

## Environment Variables

This repository itself has no required runtime environment variables for local maintenance workflows.

## Documentation Sync Rules

When updating Vercel/Supabase guidance, also update:
- `docs/ENV.md`
- `docs/RUNBOOK.md`
- `docs/ARCHITECTURE.md`
- `docs/DECISIONS.md`
- `docs/TROUBLESHOOTING.md`
- `docs/AX_UPGRADE_REPORT.md`

## Official References

- Vercel agent resources: https://vercel.com/docs/agent-resources
- Vercel agent skills: https://vercel.com/docs/agent-resources/skills
- Vercel environment variables: https://vercel.com/docs/environment-variables
- Supabase API keys: https://supabase.com/docs/guides/api/api-keys
- Supabase local dev & migrations: https://supabase.com/docs/guides/local-development/overview
