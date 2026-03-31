# AX_UPGRADE_REPORT.md

## Inventory summary (Step 0) — 2026-03-31

- **Repository type:** Scaffold/template repository, not a runnable Next.js app.
- **Next.js mode (App Router vs Pages):** Not present in this repo — templates target both.
- **Auth approach:** Better Auth — open-source, self-hosted auth storing sessions in Neon via Drizzle adapter. Template guidance and env var boundaries documented.
- **Database:** Neon PostgreSQL with Drizzle ORM for schema management and migrations. Scaffold provides `.env.example` template and docs for downstream projects.
- **File storage:** Vercel Blob — template guidance and env var documented.
- **Env var pattern:** `.env.example` in scaffold/ with server-only secrets (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BLOB_READ_WRITE_TOKEN`). `.gitignore` blocks `.env`, `.env.local`, `.env.*.local`.
- **Package manager:** pnpm@10.6.0 (for this repo's maintenance commands).
- **Lint/format/test/tooling:** Script-based validation (`scripts/check-templates.sh`, `bash -n` syntax checks, `scripts/scaffold.sh` smoke test, `scripts/generate-init.sh` build).
- **CI status:** Two audit workflows (`health-audit.yml`, `cross-repo-align.yml`). No per-PR CI for this repo itself (scaffold validation runs via `pnpm verify`).

## Changes made (2026-03-31 — free-tier stack upgrade)

### Rationale

Supabase free tier has significant limitations: projects pause after 7 days of inactivity, database branching requires a paid plan, only 2 free projects allowed. Replaced with Neon + Better Auth + Drizzle for a stronger free-tier developer experience.

### Commit: Scaffold templates

- Updated `scaffold/.env.example`: replaced all Supabase env vars with Neon (`DATABASE_URL`, `DATABASE_URL_UNPOOLED`), Better Auth (`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`), and Vercel Blob (`BLOB_READ_WRITE_TOKEN`) vars.
- Updated `scaffold/CLAUDE.md.template`: replaced Supabase migration recipe with Drizzle + Neon workflow; updated silent bugs section (DATABASE_URL/BETTER_AUTH_SECRET in client components).
- Updated `scaffold/AGENTS.md.template`: added Neon, Better Auth, and Drizzle doc links to official references.
- Updated `scaffold/scripts/security-check.sh`: replaced `SUPABASE_SERVICE_ROLE_KEY` client-path check with `DATABASE_URL` and `BETTER_AUTH_SECRET` client-path checks.
- Updated `scaffold/.claude/settings.json`: replaced Supabase CLI commands with Drizzle Kit and Neon CLI commands.

### Commit: Docs

- Updated `docs/ARCHITECTURE.md`: replaced Supabase data layer with Neon + Drizzle + Better Auth patterns; added Vercel Blob guidance; updated official references.
- Updated `docs/ENV.md`: replaced all Supabase env var documentation with Neon + Better Auth + Vercel Blob vars and rules.
- Updated `docs/DECISIONS.md`: added 2026-03-31 decision entry documenting the stack upgrade rationale.
- Updated `docs/RUNBOOK.md`: replaced Supabase workflow with Drizzle migration commands, Neon branching, Better Auth session management, Vercel Blob guidance.
- Updated `docs/TROUBLESHOOTING.md`: replaced Supabase auth/migration sections with Better Auth troubleshooting, Drizzle migration drift, Neon connection issues.
- Updated `docs/AX_UPGRADE_REPORT.md`: this file — updated inventory and changelog.

### Commit: Root control-plane files

- Updated `CLAUDE.md`: replaced Supabase references in sync rules, silent bugs, and official references with Neon/Better Auth equivalents.
- Updated `AGENTS.md`: updated project snapshot, documentation map descriptions, and official references.

## Changes made (2026-03-04 refresh)

### Commit A: Docs + control-plane files
- Updated `CLAUDE.md`: added `docs/DECISIONS.md` and `docs/TROUBLESHOOTING.md` to sync rules, added official references section with Vercel agent-resources links.
- Updated `AGENTS.md`: expanded documentation map with all docs/* files, added official references section.
- Updated `docs/ENV.md`: added Neon connection vars; added framework env var and branching doc links.
- Updated `docs/RUNBOOK.md`: added Drizzle migration commands, Neon branching workflow, Better Auth session guidance.
- Updated `docs/ARCHITECTURE.md`: added Vercel Fluid Compute / `use cache` / `cacheLife` / `cacheTag` / `revalidateTag` caching patterns; added Neon branching and Drizzle migration guidance; updated doc links.
- Updated `docs/DECISIONS.md`: added 2026-03-04 decision entry for incremental refresh.
- Updated `docs/TROUBLESHOOTING.md`: added Drizzle migration drift section, Vercel Fluid Compute timeout section, improved existing entries.

### Commit B: Scaffold templates
- Updated `scaffold/.env.example`: added Neon connection vars for migration/branching workflows.
- Updated `scaffold/CLAUDE.md.template`: added `verify` alias in Quick Reference, added Fluid Compute `maxDuration` to common mistakes, added Drizzle migration workflow recipe.
- Updated `scaffold/AGENTS.md.template`: added `verify` alias note, added Vercel agent-resources link.

### Commit C: Env var correctness + security hardening
- Updated `scaffold/scripts/security-check.sh`: added check for server-only secrets (DATABASE_URL, BETTER_AUTH_SECRET) in client component paths.
- Verified `scaffold/.claude/settings.json` includes Drizzle Kit and Neon CLI in allow list.
- Verified `.gitignore` correctly blocks `.env*` files (no change needed).

## Why (official-doc links per change)

- Vercel agent resources: https://vercel.com/docs/agent-resources
- Vercel agent skills: https://vercel.com/docs/agent-resources/skills
- Vercel environment variables: https://vercel.com/docs/environment-variables
- Vercel system env vars (`VERCEL_PROJECT_PRODUCTION_URL`): https://vercel.com/docs/environment-variables/system-environment-variables
- Vercel framework env vars (`NEXT_PUBLIC_*`): https://vercel.com/docs/environment-variables/framework-environment-variables
- Vercel functions (Fluid Compute, `maxDuration`): https://vercel.com/docs/functions
- Vercel runtime cache (`use cache`, `cacheLife`, `cacheTag`): https://vercel.com/docs/runtime-cache
- Vercel data cache and revalidation: https://vercel.com/docs/runtime-cache/data-cache
- Vercel deployments: https://vercel.com/docs/deployments
- Vercel preview deployments: https://vercel.com/docs/deployments/preview-deployments
- Vercel Blob: https://vercel.com/docs/storage/vercel-blob
- Neon docs: https://neon.tech/docs
- Neon branching: https://neon.tech/docs/introduction/branching
- Neon connection pooling: https://neon.tech/docs/connect/connection-pooling
- Neon Vercel integration: https://neon.tech/docs/guides/vercel
- Better Auth docs: https://www.better-auth.com/docs
- Better Auth Next.js integration: https://www.better-auth.com/docs/integrations/next
- Drizzle ORM: https://orm.drizzle.team/docs/overview
- Drizzle + Neon: https://orm.drizzle.team/docs/get-started/neon-new

## How to verify locally

```bash
pnpm install
pnpm verify          # runs lint + typecheck + test + build — all must pass

# Individual checks:
pnpm lint            # validates scaffold templates have <!-- CUSTOMIZE --> markers
pnpm typecheck       # syntax-checks all shell scripts
pnpm test            # runs scaffold.sh smoke test to /tmp
pnpm build           # regenerates init.sh and syntax-checks it
```

Expected outcomes:
- All checks pass with exit code 0.
- `pnpm verify` runs all four phases sequentially.
- Scaffold copy (`./scripts/scaffold.sh /tmp/test`) creates files without errors.
- All docs/*.md files contain an "Official references" section with valid links.
- No remaining references to Supabase in scaffold/ or docs/ files.

## Follow-ups

- **Follow-up:** Add a first-class Vercel + Neon + Better Auth runnable sample app in `examples/` to validate runtime/auth/migration guidance end-to-end.
- **Follow-up:** Add optional secret scanning CI workflow template (gitleaks/git-secrets) to `scaffold/.github/workflows`.
- **Follow-up:** Add `scaffold/.github/workflows/ci.yml` template that validates migrations in CI — use `drizzle-kit push --verbose --strict` for review before confirming, or the programmatic API (`import { pushSchema } from 'drizzle-kit/api'`) to inspect `statementsToExecute` without calling `apply()`.
- **Follow-up:** Add Better Auth provider configuration examples (GitHub, Google) to scaffold templates.
