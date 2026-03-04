# AX_UPGRADE_REPORT.md

## Inventory summary (Step 0) — 2026-03-04

- **Repository type:** Scaffold/template repository, not a runnable Next.js app.
- **Next.js mode (App Router vs Pages):** Not present in this repo — templates target both.
- **Auth approach:** Not implemented here; only template guidance and env var boundaries exist.
- **Supabase client usage:** Not implemented; scaffold provides `.env.example` template and docs for downstream projects.
- **Env var pattern:** `.env.example` in scaffold/ with `NEXT_PUBLIC_*` / server-only split. `.gitignore` blocks `.env`, `.env.local`, `.env.*.local`.
- **Package manager:** pnpm@10.6.0 (for this repo's maintenance commands).
- **Lint/format/test/tooling:** Script-based validation (`scripts/check-templates.sh`, `bash -n` syntax checks, `scripts/scaffold.sh` smoke test, `scripts/generate-init.sh` build).
- **CI status:** Two audit workflows (`health-audit.yml`, `cross-repo-align.yml`). No per-PR CI for this repo itself (scaffold validation runs via `pnpm verify`).

## Changes made (2026-03-04 refresh)

### Commit A: Docs + control-plane files
- Updated `CLAUDE.md`: added `docs/DECISIONS.md` and `docs/TROUBLESHOOTING.md` to sync rules, added official references section with Vercel agent-resources links.
- Updated `AGENTS.md`: expanded documentation map with all docs/* files, added official references section.
- Updated `docs/ENV.md`: added `POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`, `VERCEL_PROJECT_PRODUCTION_URL` vars; added Supabase publishable keys note; added framework env var and branching doc links.
- Updated `docs/RUNBOOK.md`: added Supabase CLI migration commands, branching workflow, RLS testing guidance, Vercel system env var usage.
- Updated `docs/ARCHITECTURE.md`: added Vercel Fluid Compute / `use cache` / `cacheLife` / `cacheTag` / `revalidateTag` caching patterns; added Supabase branching and migration guidance; updated doc links.
- Updated `docs/DECISIONS.md`: added 2026-03-04 decision entry for this incremental refresh.
- Updated `docs/TROUBLESHOOTING.md`: added Supabase migration drift section, Vercel Fluid Compute timeout section, improved existing entries.

### Commit B: Scaffold templates
- Updated `scaffold/.env.example`: added `POSTGRES_URL` / `POSTGRES_URL_NON_POOLING` for migration/branching workflows, added Supabase publishable keys comment.
- Updated `scaffold/CLAUDE.md.template`: added `verify` alias in Quick Reference, added Fluid Compute `maxDuration` to common mistakes, added Supabase migration workflow recipe.
- Updated `scaffold/AGENTS.md.template`: added `verify` alias note, added Vercel agent-resources link.

### Commit C: Env var correctness + security hardening
- Updated `scaffold/scripts/security-check.sh`: added check for `SUPABASE_SERVICE_ROLE_KEY` usage in client component paths.
- Verified `scaffold/.claude/settings.json` includes Supabase CLI in allow list.
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
- Supabase local dev & migrations: https://supabase.com/docs/guides/local-development/overview
- Supabase database migrations: https://supabase.com/docs/guides/deployment/database-migrations
- Supabase branching: https://supabase.com/docs/guides/deployment/branching/working-with-branches
- Supabase API keys (publishable keys): https://supabase.com/docs/guides/api/api-keys
- Supabase auth SSR (Next.js): https://supabase.com/docs/guides/auth/server-side/nextjs
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase ↔ Vercel integration: https://supabase.com/partners/integrations/vercel

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

## Follow-ups

- **Follow-up:** Add a first-class Vercel + Supabase runnable sample app in `examples/` to validate runtime/caching guidance end-to-end.
- **Follow-up:** Add optional secret scanning CI workflow template (gitleaks/git-secrets) to `scaffold/.github/workflows`.
- **Follow-up:** Add Supabase publishable key detection to security-check.sh once the key format stabilizes.
- **Follow-up:** Consider adding a `scaffold/.github/workflows/ci.yml` template that runs `supabase db push --dry-run` for migration validation in CI.
