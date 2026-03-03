# ENV.md

## Environment variable model (Vercel + Supabase)

This scaffold recommends splitting environment variables into:

- **Public client variables** (safe to expose): `NEXT_PUBLIC_*`
- **Server-only secrets** (never shipped to browser): service-role keys and any private tokens

### Recommended variables

| Variable | Required | Scope | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Client + Server | Supabase project URL for browser/server clients |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Client + Server | Public anonymous key for Supabase client auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional (server jobs/admin only) | Server-only | Elevated access for trusted backend tasks |
| `SUPABASE_ACCESS_TOKEN` | Optional | Local CLI/CI | Token for Supabase CLI operations |
| `VERCEL_ENV` | Provided by Vercel | Server | Runtime env (`development`, `preview`, `production`) |

## Rules

1. Never expose `SUPABASE_SERVICE_ROLE_KEY` in client bundles.
2. Keep local `.env*` files (for example: `.env`, `.env.local`, `.env.development`) out of Git — do not ignore the tracked `.env.example` template.
3. Keep `.env.example` committed with safe placeholder values only (never real secrets).

## Official references

- Vercel environment variables: https://vercel.com/docs/environment-variables
- Vercel system environment variables (`VERCEL_ENV`): https://vercel.com/docs/environment-variables/system-environment-variables
- Supabase Next.js server-side auth guide: https://supabase.com/docs/guides/auth/server-side/nextjs
- Supabase API keys and key handling: https://supabase.com/docs/guides/api/api-keys
- Supabase ↔ Vercel integration: https://supabase.com/partners/integrations/vercel
