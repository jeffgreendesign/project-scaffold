# TROUBLESHOOTING.md

## `pnpm verify` fails on `typecheck`

- Confirm shell scripts still pass syntax checks.
- If editing generated installer logic, re-run `./scripts/generate-init.sh` and check syntax again.
- Run `bash -n scripts/*.sh scaffold/scripts/*.sh` to isolate the broken script.

## CI mismatch vs local

- Ensure CI runs the same `pnpm verify` command.
- Ensure lockfile/package manager detection is not bypassed.

## Supabase auth issues in downstream projects

- Confirm anon key is used in browser paths.
- Confirm service-role key is server-only — never import it in files under `src/app/` or any `"use client"` component.
- Validate cookie/session behavior with official `@supabase/ssr` auth helpers.

## Supabase migration drift

- If local migrations don't match the remote project, run `supabase db pull` to capture remote schema.
- If a preview branch has stale migrations, delete and recreate the branch (`supabase db reset` equivalent).
- Use `supabase db diff --schema public` to compare local dashboard changes against migration files.
- Always run `supabase migration up` (not manual SQL) to apply changes locally.

## Vercel env mismatch (preview vs production)

- Verify both Preview and Production environment variables are set in Vercel Project Settings.
- Check use of `VERCEL_ENV` for environment-aware logic.
- Remember: `VERCEL_PROJECT_PRODUCTION_URL` is set even in preview deploys — use it for canonical URLs.

## Vercel function timeouts / Fluid Compute

- Default function timeout is 10s on Hobby, 60s on Pro. Set `export const maxDuration = 60;` for long-running routes.
- If a function times out, check whether it can be optimized or if `maxDuration` needs increasing.
- Fluid Compute reuses function instances — avoid global mutable state that persists across requests.

## Official references

- Vercel env troubleshooting: https://vercel.com/docs/environment-variables
- Vercel functions (Fluid Compute): https://vercel.com/docs/functions
- Vercel runtime cache: https://vercel.com/docs/runtime-cache
- Supabase SSR auth troubleshooting: https://supabase.com/docs/guides/auth/server-side
- Supabase local development and migrations: https://supabase.com/docs/guides/local-development/overview
- Supabase database migrations: https://supabase.com/docs/guides/deployment/database-migrations
- Supabase Vercel integration: https://supabase.com/partners/integrations/vercel
