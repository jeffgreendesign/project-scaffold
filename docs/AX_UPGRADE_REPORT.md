# AX_UPGRADE_REPORT.md

## Inventory summary (Step 0)

- **Repository type:** Scaffold/template repository, not a runnable Next.js app.
- **Next.js mode (App Router vs Pages):** Not present in this repo.
- **Auth approach:** Not implemented here; only template guidance exists.
- **Supabase client usage:** Not implemented here; only template guidance exists.
- **Env var pattern:** Existing `.env` ignore rules and scaffold `.env.example` template.
- **Package manager:** Standardized to `pnpm` for this repo’s dev/verify commands.
- **Lint/format/test/tooling:** Script-based validation; workflow templates exist under `scaffold/.github/workflows`.
- **CI status:** Root repo has audit workflows; scaffold provides a CI template for generated projects.

## Changes made

- Added root-level agent/developer control plane docs (`AGENTS.md`, refreshed `CLAUDE.md`, and new docs set).
- Added standardized command contract (`dev` + `verify`) via `package.json` and wired CI to use `verify`.
- Hardened environment variable template for Vercel + Supabase usage and server/client key separation.
- Added lightweight guardrails: strict pre-commit security scan, secret-safety docs, env-boundary rules, and start-point mapping.

## Why (official docs)

- Env scoping and deployment environments:
  - https://vercel.com/docs/environment-variables
  - https://vercel.com/docs/environment-variables/system-environment-variables
- Deployment model and preview behavior:
  - https://vercel.com/docs/deployments
  - https://vercel.com/docs/deployments/preview-deployments
- Supabase auth + API key boundaries:
  - https://supabase.com/docs/guides/auth/server-side/nextjs
  - https://supabase.com/docs/guides/api/api-keys
- Supabase migration and RLS guidance:
  - https://supabase.com/docs/guides/deployment/database-migrations
  - https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase ↔ Vercel integration:
  - https://supabase.com/partners/integrations/vercel

## How to verify locally

- `pnpm install` — installs local tooling (none required beyond scripts).
- `pnpm dev` — runs a no-op dev command for scaffold maintenance context.
- `pnpm verify` — runs lint + typecheck + test + build scripts.
- `bash scripts/security-check.sh --strict` (in generated projects) — blocks commits on common secret/security mistakes.
- `./scripts/scaffold.sh /tmp/ax-template-check` — validates template copy behavior.

Expected outcomes:
- All checks pass with exit code 0.
- `verify` runs all four required phases.
- scaffold copy command creates files without errors.

## Follow-ups

- **Follow-up:** Add a first-class Vercel + Supabase runnable sample app in `examples/` to validate runtime/caching guidance end-to-end.
- **Follow-up:** Add optional secret scanning action template (e.g., git-secrets/gitleaks workflow) to `scaffold/.github/workflows`.
