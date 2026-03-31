# RUNBOOK.md

## Local development

1. Install deps: `pnpm install`
2. Start local workflow: `pnpm dev`
3. Run full validation before commit: `pnpm verify`

## Vercel deployment flow

- Use Preview deployments for branch validation.
- Keep Production environment variables scoped to production only.
- Verify that preview and production variables are both configured in Vercel Project Settings.
- Use `VERCEL_ENV` to distinguish runtime environments (`development`, `preview`, `production`).
- Use `VERCEL_PROJECT_PRODUCTION_URL` for canonical/OG-image URLs — it's always set, even in preview deployments.

## Neon + Drizzle workflow

### Migrations

```bash
# Edit schema files in src/db/schema/, then:

# Generate migration SQL from schema changes
pnpm drizzle-kit generate

# Apply migration to database
pnpm drizzle-kit migrate

# Push schema directly (dev shortcut — skips migration files)
pnpm drizzle-kit push

# Open Drizzle Studio (visual DB browser)
pnpm drizzle-kit studio
```

### Branching (preview environments)

Neon branches provide isolated database instances per Git branch on the free tier (up to 10 branches). **Setup options:**

1. **Neon GitHub integration:** Enable in Neon console → automatic preview branch per PR with its own connection string.
2. **Manual via CLI:**
   ```bash
   neonctl branches create --name preview/feature-x
   neonctl connection-string preview/feature-x
   ```
3. Each branch gets its own database with the parent branch's data as a copy-on-write snapshot.
4. Use `DATABASE_URL_UNPOOLED` from the branch for migrations in CI.
5. Delete the branch after merging: `neonctl branches delete preview/feature-x`.

### Connection pooling

- **Pooled (`DATABASE_URL`):** Goes through PgBouncer. Use for runtime queries in serverless/edge functions. Does not support session-level features (prepared statements, advisory locks, `LISTEN/NOTIFY`).
- **Unpooled (`DATABASE_URL_UNPOOLED`):** Direct connection. Required for migrations, Drizzle schema push, and any operation needing session-level features.

## Better Auth workflow

### Session management

- Better Auth stores sessions in your Neon database via the Drizzle adapter.
- Server-side: `auth.api.getSession({ headers: await headers() })` in React Server Components.
- Client-side: `createAuthClient()` from `better-auth/react` for auth state.
- API routes: catch-all handler at `/app/api/auth/[...all]/route.ts` using `toNextJsHandler`.

### Auth middleware

- Protect routes with Next.js middleware or server-side session checks.
- Enforce access control in server components and API routes — not at the database level.
- Validate auth flows in preview environments before promoting to production.

## Vercel Blob workflow

- Add Blob storage via Vercel dashboard → `BLOB_READ_WRITE_TOKEN` is auto-provisioned.
- Use `@vercel/blob` SDK for uploads: `put()`, `del()`, `list()`, `head()`.
- Token is server-only — never expose in client bundles.

## Official references

- Vercel deployments and environments: https://vercel.com/docs/deployments
- Vercel preview deployments: https://vercel.com/docs/deployments/preview-deployments
- Vercel functions (Fluid Compute): https://vercel.com/docs/functions
- Vercel Blob: https://vercel.com/docs/storage/vercel-blob
- Neon docs: https://neon.tech/docs
- Neon branching: https://neon.tech/docs/introduction/branching
- Neon connection pooling: https://neon.tech/docs/connect/connection-pooling
- Neon Vercel integration: https://neon.tech/docs/guides/vercel
- Better Auth docs: https://www.better-auth.com/docs
- Better Auth Next.js integration: https://www.better-auth.com/docs/integrations/next
- Drizzle ORM: https://orm.drizzle.team/docs/overview
- Drizzle + Neon: https://orm.drizzle.team/docs/get-started/neon-new
