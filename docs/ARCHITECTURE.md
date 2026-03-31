# ARCHITECTURE.md

## Repository architecture

- `scaffold/` holds installable template assets copied into downstream repos.
- `scripts/` holds generation/validation tooling for this scaffold.
- `docs/` holds maintainer-facing process and policy docs.

## Target architecture guidance (for generated projects)

This scaffold is aligned to modern Vercel + Neon + Better Auth patterns:

- Next.js on Vercel with explicit server/client boundaries.
- Neon PostgreSQL with Drizzle ORM for type-safe database access.
- Better Auth for authentication, storing session data in your own Neon DB.
- Env-driven configuration for preview vs production safety.
- Cache/revalidation behavior documented at route/data-layer boundaries.

### Vercel runtime and caching

- **Fluid Compute:** Vercel functions support `maxDuration` configuration for long-running tasks (e.g., AI agents). Set `export const maxDuration = 60;` in route handlers that need extended execution time.
- **`use cache` directive:** Next.js supports `'use cache'` and `'use cache: remote'` directives for granular caching control. Use `cacheLife()` to set expiration and `cacheTag()` for on-demand invalidation with `revalidateTag()`.
- **Data cache patterns:**
  - Time-based: `fetch(url, { next: { revalidate: 3600 } })` for hourly refresh.
  - Tag-based: `fetch(url, { next: { tags: ['blog'] } })` with `revalidateTag('blog')` for on-demand invalidation.
  - Non-fetch sources: use `unstable_cache()` wrapper for database queries.

### Neon data layer

- **Connection strings:** Use `DATABASE_URL` (pooled via PgBouncer) for runtime queries. Use `DATABASE_URL_UNPOOLED` (direct) for migrations and schema changes. Never expose either in client bundles.
- **Drizzle ORM:** All schema changes go through Drizzle schema files in `src/db/schema/`. Use `pnpm drizzle-kit generate` to create migrations, `pnpm drizzle-kit push` for dev, `pnpm drizzle-kit migrate` for production.
- **Branching:** Neon branches provide isolated database instances per Git branch on the free tier (up to 10 branches). Create preview branches with `neonctl branches create` or via the Neon GitHub integration for automatic PR-based branches.
- **File storage:** Use Vercel Blob for file uploads. The `BLOB_READ_WRITE_TOKEN` is server-only — never expose it in client bundles.

### Better Auth

- **Session management:** Better Auth stores sessions in your Neon database via the Drizzle adapter (`better-auth/adapters/drizzle`). No separate auth service needed.
- **Auth boundaries:** Protect routes with Better Auth middleware in server components and API routes. Use `auth.api.getSession()` for server-side session access. Use `createAuthClient()` from `better-auth/react` for client-side auth state.
- **Security model:** Instead of database-level RLS, enforce access control in server-side middleware and Drizzle query guards. Keep `BETTER_AUTH_SECRET` and `DATABASE_URL` strictly server-only.

## Official references

- Vercel functions (Fluid Compute): https://vercel.com/docs/functions
- Vercel runtime cache: https://vercel.com/docs/runtime-cache
- Vercel data cache and revalidation: https://vercel.com/docs/runtime-cache/data-cache
- Vercel agent resources: https://vercel.com/docs/agent-resources
- Vercel Blob: https://vercel.com/docs/storage/vercel-blob
- Neon docs: https://neon.tech/docs
- Neon branching: https://neon.tech/docs/introduction/branching
- Neon Vercel integration: https://neon.tech/docs/guides/vercel
- Neon connection pooling: https://neon.tech/docs/connect/connection-pooling
- Better Auth docs: https://www.better-auth.com/docs
- Better Auth Next.js integration: https://www.better-auth.com/docs/integrations/next
- Drizzle ORM: https://orm.drizzle.team/docs/overview
- Drizzle + Neon: https://orm.drizzle.team/docs/get-started/neon-new
