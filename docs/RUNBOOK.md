# RUNBOOK.md

## Local development

1. Install deps: `pnpm install`
2. Start local workflow: `pnpm dev`
3. Run full validation before commit: `pnpm verify`

## Vercel deployment flow

- Use Preview deployments for branch validation.
- Keep Production environment variables scoped to production only.
- Verify that preview and production variables are both configured in Vercel Project Settings.

## Supabase workflow

- Prefer migration-based schema changes.
- Apply migrations through Supabase CLI in local/CI workflows.
- Validate RLS and auth flows in non-production environments before promoting.

## Official references

- Vercel deployments and environments: https://vercel.com/docs/deployments
- Vercel preview deployments: https://vercel.com/docs/deployments/preview-deployments
- Supabase migrations: https://supabase.com/docs/guides/deployment/database-migrations
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase ↔ Vercel integration: https://supabase.com/partners/integrations/vercel
