# TROUBLESHOOTING.md

## `pnpm verify` fails on `typecheck`

- Confirm shell scripts still pass syntax checks.
- If editing generated installer logic, re-run generation and check syntax again.

## CI mismatch vs local

- Ensure CI runs the same `pnpm verify` command.
- Ensure lockfile/package manager detection is not bypassed.

## Supabase auth issues in downstream projects

- Confirm anon key is used in browser paths.
- Confirm service-role key is server-only.
- Validate cookie/session behavior with official SSR auth helpers.

## Vercel env mismatch (preview vs production)

- Verify both Preview and Production environment variables are set in Vercel.
- Check use of `VERCEL_ENV` for environment-aware logic.

## Official references

- Vercel env troubleshooting: https://vercel.com/docs/environment-variables
- Vercel functions troubleshooting: https://vercel.com/docs/functions
- Supabase SSR auth troubleshooting: https://supabase.com/docs/guides/auth/server-side
- Supabase Vercel integration: https://supabase.com/partners/integrations/vercel
