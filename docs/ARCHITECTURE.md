# ARCHITECTURE.md

## Repository architecture

- `scaffold/` holds installable template assets copied into downstream repos.
- `scripts/` holds generation/validation tooling for this scaffold.
- `docs/` holds maintainer-facing process and policy docs.

## Target architecture guidance (for generated projects)

This scaffold is aligned to modern Vercel + Supabase patterns:

- Next.js on Vercel with explicit server/client boundaries.
- Supabase clients separated by runtime context (browser vs server).
- Env-driven configuration for preview vs production safety.
- Cache/revalidation behavior documented at route/data-layer boundaries.

## Official references

- Vercel runtime and functions: https://vercel.com/docs/functions
- Vercel data cache and revalidation: https://vercel.com/docs/data-cache
- Supabase Next.js guide: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- Supabase SSR auth utilities: https://supabase.com/docs/guides/auth/server-side
