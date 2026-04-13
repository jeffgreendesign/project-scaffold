# DECISIONS.md

## Decision log

### 2026-04-12 — Adopt coordination-patterns vocabulary; standardize plan-first workflow across Claude, Codex, and Gemini

- **Context:** Anthropic blog published 2026-04-10 names five multi-agent coordination patterns. Scaffold already ships primitives (`design.md`, `gates.md`, `NOW.md`) that map to three of these patterns but doesn't use the vocabulary. The plan-first workflow only reaches Claude Code via `/design`; Codex (GPT-5.4) and Gemini (3.0/3.1) agents lack equivalent guidance. No `GEMINI.md` template exists.
- **Decision:** (1) Add `docs/COORDINATION-PATTERNS.md` mapping patterns to scaffold primitives across all platforms. (2) Add plan-first working rule to `scaffold/AGENTS.md.template` for Codex/Gemini. (3) Add `scaffold/GEMINI.md.template`. (4) Annotate `design.md` and `ANTI-PATTERNS.md` with pattern names. (5) Add `GEMINI.md` to Tier 3 and decision trees.
- **Reasoning:** Least-change approach. No behavioral changes to existing Claude workflow. Extends the same Orchestrator-Subagent default to all three frontier coding-agent models. Preserves framework-agnostic philosophy. Aligns with the blog's "start simple, evolve when symptoms appear" recommendation — matches the scaffold's incremental-tier philosophy.

### 2026-03-31 — Upgrade free-tier stack: Supabase → Neon + Better Auth + Drizzle

- **Context:** Supabase free tier has significant limitations: projects pause after 7 days of inactivity, database branching requires a paid plan, and only 2 free projects are allowed. Auth is tightly coupled to Supabase infrastructure.
- **Decision:** Replace Supabase with Neon (database) + Better Auth (authentication) + Drizzle ORM (schema/migrations) + Vercel Blob (file storage). Update all scaffold templates, docs, and scripts.
- **Reasoning:**
  - **Neon free tier** — transparent auto-suspend with instant resume (no hard pause), 10 free database branches, native Vercel integration, scale-to-zero compute.
  - **Better Auth** — open-source, self-hosted auth that stores data in your own database. No vendor lock-in. Supports OAuth, email/password, magic links, 2FA. Drizzle adapter available.
  - **Drizzle ORM** — type-safe queries, first-class Neon support, `drizzle-kit` for migrations. Better Auth has a mature Drizzle adapter.
  - **Vercel Blob** — natural free-tier pairing for file uploads when using Vercel.
  - **Security model shift** — from database-level RLS to application-level middleware and server guards. More portable, more control for downstream projects.

### 2026-03-04 — Incremental doc refresh with latest official Vercel/Supabase guidance

- **Context:** Prior AX pass (2026-03-03) created all control-plane files. Official docs have added Fluid Compute, `use cache` directives, Supabase branching, and publishable keys.
- **Decision:** Update existing docs with current official-doc links and add missing guidance sections (caching patterns, migration workflow, branching, publishable keys). No structural changes.
- **Reasoning:** Least-change approach — freshen content, don't reorganize. Keep the scaffold framework-agnostic.

### 2026-03-03 — Standardize on `pnpm verify` as canonical gate

- **Context:** Multiple script naming patterns increase agent error rates.
- **Decision:** Use `verify` as single command that runs lint + typecheck + test + build.
- **Reasoning:** Single gate command reduces drift between local and CI.

### 2026-03-03 — Keep this repo framework-agnostic, document best practices

- **Context:** This repository is a scaffold, not a runnable Next.js app.
- **Decision:** Document official Vercel/Neon/Better Auth guidance in root docs and scaffold templates without introducing app-specific code.
- **Reasoning:** Least-change default preserves template reusability while improving AX for adopters.

## Product-decision notes

If downstream users need hard choices (e.g., App Router vs Pages Router, specific auth providers, access control model), they should make that decision in their generated project and record tradeoffs there.

## Official references

- Vercel framework docs hub: https://vercel.com/docs/frameworks
- Vercel agent resources: https://vercel.com/docs/agent-resources
- Neon docs: https://neon.tech/docs
- Neon branching: https://neon.tech/docs/introduction/branching
- Better Auth docs: https://www.better-auth.com/docs
- Drizzle ORM: https://orm.drizzle.team/docs/overview
