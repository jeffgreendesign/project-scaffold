# ENV.md

## Environment variable model (Vercel + Neon + Better Auth)

This scaffold recommends splitting environment variables into:

- **Public client variables** (safe to expose): `NEXT_PUBLIC_*`
- **Server-only secrets** (never shipped to browser): database URLs, auth secrets, blob tokens

### Recommended variables

| Variable | Required | Scope | Purpose |
|---|---|---|---|
| `DATABASE_URL` | Yes | Server-only | Neon pooled connection string (via PgBouncer) for runtime queries |
| `DATABASE_URL_UNPOOLED` | Yes (migrations) | Server-only | Neon direct connection for Drizzle migrations and schema changes |
| `BETTER_AUTH_SECRET` | Yes | Server-only | Signing/encryption secret for Better Auth sessions — min 32 chars, high entropy |
| `BETTER_AUTH_URL` | Yes | Server-only | Base URL for auth callbacks (e.g., `http://localhost:3000` locally, production URL in deploy) |
| `BLOB_READ_WRITE_TOKEN` | Optional | Server-only | Vercel Blob token for file uploads — auto-provisioned via Vercel dashboard |
| `VERCEL_ENV` | Provided by Vercel | Server | Runtime env (`development`, `preview`, `production`) |
| `VERCEL_PROJECT_PRODUCTION_URL` | Provided by Vercel | Server | Shortest production domain — useful for OG images and canonical URLs |

## Rules

1. Never expose `DATABASE_URL`, `BETTER_AUTH_SECRET`, or `BLOB_READ_WRITE_TOKEN` in client bundles.
2. Keep local `.env*` files (for example: `.env`, `.env.local`, `.env.development`) out of Git — do not ignore the tracked `.env.example` template.
3. Keep `.env.example` committed with safe placeholder values only (never real secrets).
4. Use `DATABASE_URL_UNPOOLED` (direct connection) for migrations; use `DATABASE_URL` (pooled) for runtime queries. The pooled connection goes through PgBouncer and does not support session-level features like prepared statements or advisory locks.

## Official references

- Vercel environment variables: https://vercel.com/docs/environment-variables
- Vercel system environment variables (`VERCEL_ENV`, `VERCEL_PROJECT_PRODUCTION_URL`): https://vercel.com/docs/environment-variables/system-environment-variables
- Vercel framework environment variables (`NEXT_PUBLIC_*`): https://vercel.com/docs/environment-variables/framework-environment-variables
- Vercel Blob: https://vercel.com/docs/storage/vercel-blob
- Neon connection pooling: https://neon.tech/docs/connect/connection-pooling
- Neon Vercel integration: https://neon.tech/docs/guides/vercel
- Better Auth configuration: https://www.better-auth.com/docs/installation
- Drizzle ORM configuration: https://orm.drizzle.team/docs/get-started/neon-new
