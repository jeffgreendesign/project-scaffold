# DECISIONS.md

## Decision log

### 2026-03-03 — Standardize on `pnpm verify` as canonical gate

- **Context:** Multiple script naming patterns increase agent error rates.
- **Decision:** Use `verify` as single command that runs lint + typecheck + test + build.
- **Reasoning:** Single gate command reduces drift between local and CI.

### 2026-03-03 — Keep this repo framework-agnostic, document Vercel + Supabase best practices

- **Context:** This repository is a scaffold, not a runnable Next.js app.
- **Decision:** Document official Vercel/Supabase guidance in root docs and scaffold templates without introducing app-specific code.
- **Reasoning:** Least-change default preserves template reusability while improving AX for Vercel + Supabase adopters.

## Product-decision notes

If downstream users need hard choices (e.g., App Router vs Pages Router, specific auth library, RLS model), they should make that decision in their generated project and record tradeoffs there.

## Official references

- Vercel framework docs hub: https://vercel.com/docs/frameworks
- Supabase auth overview: https://supabase.com/docs/guides/auth
- Supabase RLS overview: https://supabase.com/docs/guides/database/postgres/row-level-security
