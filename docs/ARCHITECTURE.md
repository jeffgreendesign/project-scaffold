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

### Vercel runtime and caching

- **Fluid Compute:** Vercel functions support `maxDuration` configuration for long-running tasks (e.g., AI agents). Set `export const maxDuration = 60;` in route handlers that need extended execution time.
- **`use cache` directive:** Next.js supports `'use cache'` and `'use cache: remote'` directives for granular caching control. Use `cacheLife()` to set expiration and `cacheTag()` for on-demand invalidation with `revalidateTag()`.
- **Data cache patterns:**
  - Time-based: `fetch(url, { next: { revalidate: 3600 } })` for hourly refresh.
  - Tag-based: `fetch(url, { next: { tags: ['blog'] } })` with `revalidateTag('blog')` for on-demand invalidation.
  - Non-fetch sources: use `unstable_cache()` wrapper for database queries.

### Supabase data layer

- **Migrations:** All schema changes go through `supabase/migrations/` files. Use `supabase migration new` to create, `supabase db push` to deploy.
- **Branching:** Supabase branches provide isolated database instances per Git branch, with automatic migration application on PR creation.
- **RLS:** Row-Level Security should be enabled on all user-facing tables. Test policies locally with `supabase db reset` and seed data.
- **Auth boundaries:** Use `@supabase/ssr` for server-side auth in Next.js. Browser clients use the anon key; server routes can use the service-role key for admin operations.

## Official references

- Vercel functions (Fluid Compute): https://vercel.com/docs/functions
- Vercel runtime cache: https://vercel.com/docs/runtime-cache
- Vercel data cache and revalidation: https://vercel.com/docs/runtime-cache/data-cache
- Vercel agent resources: https://vercel.com/docs/agent-resources
- Supabase Next.js guide: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- Supabase SSR auth utilities: https://supabase.com/docs/guides/auth/server-side
- Supabase local development and migrations: https://supabase.com/docs/guides/local-development/overview
- Supabase branching: https://supabase.com/docs/guides/deployment/branching/working-with-branches
