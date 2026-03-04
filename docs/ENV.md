# ENV.md

## Environment variable model (Vercel + Supabase)

This scaffold recommends splitting environment variables into:

- **Public client variables** (safe to expose): `NEXT_PUBLIC_*`
- **Server-only secrets** (never shipped to browser): service-role keys and any private tokens

### Recommended variables

| Variable | Required | Scope | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Client + Server | Supabase project URL for browser/server clients |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Recommended (or use publishable key) | Client + Server | Public anonymous key — safe for client use; see publishable keys section for newer alternative |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional (server jobs/admin only) | Server-only | Elevated access for trusted backend tasks — **never expose in client bundles** |
| `SUPABASE_ACCESS_TOKEN` | Optional | Local CLI/CI | Token for Supabase CLI operations |
| `POSTGRES_URL` | Optional (migration workflows) | Server/CI | Pooled Postgres connection string for ORM/query use |
| `POSTGRES_URL_NON_POOLING` | Optional (migration workflows) | Server/CI | Direct Postgres connection for schema migrations |
| `VERCEL_ENV` | Provided by Vercel | Server | Runtime env (`development`, `preview`, `production`) |
| `VERCEL_PROJECT_PRODUCTION_URL` | Provided by Vercel | Server | Shortest production domain — useful for OG images and canonical URLs |

### Supabase publishable keys

Supabase is transitioning to publishable keys (format: `sb_publishable_...`) as a replacement for legacy anon JWT keys. Publishable keys offer independent rotation and improved security. For new projects, prefer publishable keys when available. See the API keys docs for details.

## Rules

1. Never expose `SUPABASE_SERVICE_ROLE_KEY` in client bundles.
2. Keep local `.env*` files (for example: `.env`, `.env.local`, `.env.development`) out of Git — do not ignore the tracked `.env.example` template.
3. Keep `.env.example` committed with safe placeholder values only (never real secrets).
4. Use `POSTGRES_URL_NON_POOLING` (direct connection) for migrations; use `POSTGRES_URL` (pooled) for runtime queries.

## Official references

- Vercel environment variables: https://vercel.com/docs/environment-variables
- Vercel system environment variables (`VERCEL_ENV`, `VERCEL_PROJECT_PRODUCTION_URL`): https://vercel.com/docs/environment-variables/system-environment-variables
- Vercel framework environment variables (`NEXT_PUBLIC_*`): https://vercel.com/docs/environment-variables/framework-environment-variables
- Supabase Next.js server-side auth guide: https://supabase.com/docs/guides/auth/server-side/nextjs
- Supabase API keys and key handling: https://supabase.com/docs/guides/api/api-keys
- Supabase ↔ Vercel integration: https://supabase.com/partners/integrations/vercel
- Supabase branching (uses `POSTGRES_URL`): https://supabase.com/docs/guides/deployment/branching/working-with-branches
