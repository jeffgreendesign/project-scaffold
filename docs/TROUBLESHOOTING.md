# TROUBLESHOOTING.md

## `pnpm verify` fails on `typecheck`

- Confirm shell scripts still pass syntax checks.
- If editing generated installer logic, re-run `./scripts/generate-init.sh` and check syntax again.
- Run `bash -n scripts/*.sh scaffold/scripts/*.sh` to isolate the broken script.

## CI mismatch vs local

- Ensure CI runs the same `pnpm verify` command.
- Ensure lockfile/package manager detection is not bypassed.

## Better Auth issues in downstream projects

- Confirm `BETTER_AUTH_SECRET` is set and is at least 32 characters with high entropy.
- Confirm `BETTER_AUTH_URL` matches the actual app URL (localhost for dev, production domain for deploy).
- Confirm the auth API route exists at `/app/api/auth/[...all]/route.ts` using `toNextJsHandler`.
- Check that the Drizzle adapter is configured with the correct provider (`"pg"` for Neon).
- For session issues, verify cookies are being set correctly — check `SameSite`, `Secure`, and `Domain` attributes in production.
- Client-side auth state not updating? Ensure `createAuthClient()` is configured with the correct `baseURL`.

## Drizzle migration drift

- If local schema doesn't match the remote database, run `pnpm drizzle-kit pull` to introspect the remote schema.
- Use `pnpm drizzle-kit push` for quick dev sync (bypasses migration files).
- For production, always use `pnpm drizzle-kit generate` + `pnpm drizzle-kit migrate` to maintain migration history.
- If migrations fail, check that you're using `DATABASE_URL_UNPOOLED` (direct connection) — pooled connections via PgBouncer don't support DDL operations reliably.

## Neon connection issues

- **"prepared statement already exists":** You're using the pooled connection (`DATABASE_URL`) for an operation that needs the direct connection. Switch to `DATABASE_URL_UNPOOLED` for migrations and operations using prepared statements.
- **Connection timeout on cold start:** Neon auto-suspends after ~5 minutes of inactivity. The first connection after suspend may take 0.5–2 seconds. This is normal — subsequent connections are instant.
- **Branch not found:** Verify the branch exists with `neonctl branches list`. Preview branches are deleted when the PR is merged if using the GitHub integration.

## Vercel env mismatch (preview vs production)

- Verify both Preview and Production environment variables are set in Vercel Project Settings.
- Check use of `VERCEL_ENV` for environment-aware logic.
- Remember: `VERCEL_PROJECT_PRODUCTION_URL` is set even in preview deploys — use it for canonical URLs.

## Vercel function timeouts / Fluid Compute

- With Fluid Compute (enabled by default on new projects since April 2025), the default timeout is 300s (5 min) on all plans. Max is 300s on Hobby, 800s on Pro/Enterprise. Set `export const maxDuration = N;` to configure per-route.
- Legacy (Fluid Compute disabled): defaults were 10s Hobby / 15s Pro, with maximums of 60s Hobby / 300s Pro.
- If a function times out, check whether it can be optimized or if `maxDuration` needs increasing.
- Fluid Compute reuses function instances — avoid global mutable state that persists across requests.

## Official references

- Vercel env troubleshooting: https://vercel.com/docs/environment-variables
- Vercel functions (Fluid Compute): https://vercel.com/docs/functions
- Vercel runtime cache: https://vercel.com/docs/runtime-cache
- Neon docs: https://neon.tech/docs
- Neon connection pooling: https://neon.tech/docs/connect/connection-pooling
- Better Auth docs: https://www.better-auth.com/docs
- Drizzle ORM: https://orm.drizzle.team/docs/overview
