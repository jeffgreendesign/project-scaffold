---
paths:
  - "src/**/*.{ts,tsx}"
---

# TypeScript Rules

<!-- Loaded only when the agent reads matching files. Read by Claude Code and Grok Build. -->
<!-- Keep in sync with .cursor/rules/typescript.mdc (the Cursor equivalent). -->

## Critical Rules

- ESM imports only — use `.js` extensions even for .ts files
- Never use `any` — use `unknown` and narrow with type guards
- Never use non-null assertions (`!`) — handle the null case

## Import Patterns

- Use `@/` path aliases for project imports
- External deps first, then internal, then relative
- No barrel exports (`index.ts` re-exports) — import directly

## Common Mistakes

- Forgetting `"use client"` when using React hooks
- Using `console.log()` instead of the project logger
- String interpolation in SQL queries (use parameterized queries)
