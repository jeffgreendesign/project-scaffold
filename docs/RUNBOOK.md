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

## Supabase workflow

### Migrations

```bash
# Create a new migration
supabase migration new <migration_name>

# Apply migrations to local database
supabase migration up

# Reset local database (reapply all migrations + seed)
supabase db reset

# Diff dashboard changes into a migration file
supabase db diff -f <migration_name>

# Deploy migrations to remote project
supabase db push
```

### Branching (preview environments)

Supabase branches provide isolated database instances per Git branch. **Prerequisites:** Enable the Supabase GitHub integration in your Supabase project settings, point it at your repository and the `supabase/` directory, and enable "Automatic branching" in the integration settings. Once configured:

1. Open a PR to create a preview branch automatically (requires the GitHub integration and automatic branching to be enabled).
2. Each branch gets its own database, API endpoints, auth, and storage.
3. Use `POSTGRES_URL_NON_POOLING` from the branch for ORM migrations in CI.
4. Merge the branch to apply migrations to production.

### RLS and auth

- Enable RLS on every user-facing table.
- Test RLS policies locally with `supabase db reset` + seed data.
- Use `supabase db pull --schema auth` to capture auth-related triggers/policies.
- Validate auth flows in preview environments before promoting to production.

## Official references

- Vercel deployments and environments: https://vercel.com/docs/deployments
- Vercel preview deployments: https://vercel.com/docs/deployments/preview-deployments
- Vercel functions (Fluid Compute): https://vercel.com/docs/functions
- Supabase local development and migrations: https://supabase.com/docs/guides/local-development/overview
- Supabase database migrations: https://supabase.com/docs/guides/deployment/database-migrations
- Supabase branching: https://supabase.com/docs/guides/deployment/branching/working-with-branches
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase ↔ Vercel integration: https://supabase.com/partners/integrations/vercel
