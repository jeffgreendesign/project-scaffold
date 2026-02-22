# Before/After Examples

Real-world scenarios showing the impact of each scaffold component. Each example contrasts what happens without the scaffold versus with it.

---

## 1. Before CLAUDE.md: Agent Burns Tokens Exploring

```text
Agent: I need to add a new API endpoint. Let me explore the codebase.

> Reading package.json...
> Reading src/index.ts... not the entry point
> Reading app/page.tsx... this is the frontend
> ls src/
> ls api/
> ls server/
> Reading src/server/index.ts... found the server!
> What testing framework is this? Let me check...
> Reading jest.config.js... doesn't exist
> Reading vitest.config.ts... found it!
> What's the linting setup?
> Reading .eslintrc... doesn't exist
> Reading biome.json... found it!

[12 turns spent exploring before writing a single line of code]
```

## 2. After CLAUDE.md: Agent Goes Straight to the Right Files

```text
Agent: I need to add a new API endpoint. Let me read CLAUDE.md first.

> Reading CLAUDE.md...
> Quick Reference: pnpm, Node 22, TypeScript (ESM), Hono framework
> Starting Points: "New endpoint" → src/routes/
> Commands: pnpm gates, pnpm test, pnpm dev

> Creating src/routes/users.ts following the pattern in src/routes/posts.ts
> Creating src/routes/__tests__/users.test.ts
> Running pnpm gates... all passed.

[3 turns. Done.]
```

---

## 3. Before Guardrail Tests: Direct DB Import Slips Through

```typescript
// Agent creates src/routes/users.ts
import { Pool } from 'pg';  // Direct import — bypasses connection pool wrapper

const pool = new Pool();  // New connection pool — ignores the shared one

export async function getUsers() {
  const result = await pool.query('SELECT * FROM users');  // No pagination!
  return result.rows;
}

// This passes linting. This passes type checking. This passes unit tests.
// It ships to production. Connection pool exhaustion occurs under load.
```

## 4. After Guardrail Tests: Caught Immediately

```text
$ npm run gates

✗ Architecture: Import boundaries
  Found 1 forbidden import(s):

  src/routes/users.ts:1 imports 'pg' directly.
    Found: import { Pool } from 'pg';
    Only these files may import 'pg': src/lib/db.ts

  Fix: Import from the wrapper module instead of the direct dependency.
  Allowed wrappers: src/lib/db.ts
```

---

## 5. Before `gates` Script: Commit with Lint Errors

```text
Agent: Tests pass! Let me commit.

$ npm run test
✓ 47 tests passed

$ git add . && git commit -m "Add users endpoint"
[main abc1234] Add users endpoint

# Meanwhile, biome would have caught:
# - Unused import on line 3
# - console.log() on line 15
# - Missing semicolons on lines 8, 12
# These ship to main. CI fails. PR is blocked.
```

## 6. After `gates` Script: Pre-commit Hook Blocks It

```text
Agent: Tests pass! Let me commit.

$ git add . && git commit -m "Add users endpoint"

Running pre-commit hook...
$ npm run lint

✗ src/routes/users.ts
  Line 3: Unused import 'debug'
  Line 15: console.log() detected — use logger instead

Commit blocked. Fixing lint errors...

$ git add . && git commit -m "Add users endpoint"
✓ All gates passed. Committed.
```

---

## 7. Before Starting Points: Agent Edits Wrong Directory

```text
# Project structure:
# ├── app/          ← Next.js app (what you want edited)
# ├── website/      ← Marketing site
# ├── docs/         ← Documentation site
# └── packages/     ← Shared packages

User: "Add a dashboard page"

Agent: Let me find where pages live...
> ls website/src/pages/
> Creating website/src/pages/dashboard.tsx
> Adding route to website/src/App.tsx

User: "No, that's the marketing site. I meant the app."

# 10 minutes wasted editing the wrong directory.
```

## 8. After Starting Points: Agent Goes to the Right Directory

```markdown
# CLAUDE.md — Starting Points

| Task            | Start Here          | Why                        |
|-----------------|---------------------|----------------------------|
| New page        | `app/src/pages/`    | Next.js App Router pages   |
| New component   | `app/src/components/`| Shared React components   |
| API endpoint    | `app/src/api/`      | API route handlers         |
```

```text
Agent: CLAUDE.md says new pages go in app/src/pages/.
> Creating app/src/pages/dashboard.tsx
> Done. First try.
```

---

## 9. Before Workspace Boundaries: Circular Dependency

```typescript
// packages/ui/src/UserCard.tsx
import { fetchUser } from 'packages/api';  // UI imports from API

// packages/api/src/routes/users.ts
import { UserCard } from 'packages/ui';   // API imports from UI

// Build fails with cryptic error:
// "Maximum call stack size exceeded" during module resolution
// Agent retries build 4 times. Still fails. No idea why.
```

## 10. After Workspace Boundaries: Clear Error Message

```text
$ npm run gates

✗ Workspace boundaries: cross-package imports
  Found 1 workspace boundary violation(s):

  packages/ui → packages/api:
    packages/ui/src/UserCard.tsx:2 — import { fetchUser } from 'packages/api';
    packages/ui may only import from: packages/shared

  Fix: Move shared code to an allowed package, or update WORKSPACE_RULES.
```

---

## 11. Before API Stability Rules: Breaking Change Ships

```typescript
// Agent renames a public export
// Before:
export function calculateTotal(items: Item[]): number { ... }

// After (agent "improves" the name):
export function computeTotal(items: Item[]): number { ... }

// Every consumer that imports calculateTotal breaks.
// No migration guide. No deprecation notice.
// Downstream projects discover the break when their CI fails.
```

## 12. After API Stability Rules: CLAUDE.md Prevents It

```markdown
# CLAUDE.md — Public API Stability

### Stable Exports (do not change without migration entry)
- `calculateTotal` — computes total price for cart items

**Rule:** Any change to a stable export requires:
1. A new entry in MIGRATION.md explaining the change
2. A semver-appropriate version bump
3. Deprecation notice on the old API if not a major version
```

```text
Agent reads CLAUDE.md, sees calculateTotal is a stable export.
Agent keeps the name. If the rename is truly needed, agent creates
MIGRATION.md entry and bumps the major version first.
```

---

## 13. Before `/design`: Agent Builds the Wrong Thing

```text
User: "Add role-based access control to the admin endpoints"

Agent: Got it! Let me implement RBAC.

> Creating src/middleware/rbac.ts
> Creating src/models/role.ts
> Creating src/models/permission.ts
> Modifying src/routes/admin.ts
> Creating src/routes/admin/roles.ts
> Creating src/routes/admin/permissions.ts
> Creating tests/rbac.test.ts
> Modifying src/lib/db.ts — adding roles table

User: "Stop. We already have a roles system in src/auth/roles.ts.
       I wanted you to USE that, not build a new one.
       Also, we use Drizzle for migrations, not raw SQL in db.ts."

# 20 minutes wasted. Full revert. Start over.
```

## 14. After `/design`: Correct on First Implementation

```text
User: /design add role-based access control to the admin endpoints

Agent: [researches codebase thoroughly]

**Understanding:** Add RBAC to admin endpoints using the existing roles system.

**Reference implementations:**
| Creating | Follow the pattern in | Key things to match |
|----------|----------------------|---------------------|
| Admin middleware | `src/auth/middleware.ts` | Token validation pattern, error responses |
| Role checks | `src/auth/roles.ts` | Existing role definitions and permission checks |
| Migration | `drizzle/migrations/003_*.ts` | Drizzle migration format, rollback support |

**Files to change:**
| File | Change | Why |
|------|--------|-----|
| src/auth/roles.ts | Add ADMIN_READ, ADMIN_WRITE permissions | Extend existing role system |
| src/middleware/requireRole.ts | Create role-checking middleware | Reusable across admin routes |
| src/routes/admin.ts | Add requireRole() to route handlers | Enforce permissions |
| drizzle/migrations/004_admin_roles.ts | Add admin permissions to roles table | Schema change via Drizzle |

**Do NOT implement yet. Waiting for approval.**

User: "Looks right. But use a single ADMIN permission instead of
       READ/WRITE split — we can granularize later. Implement it."

# Agent implements the corrected plan. One round of review
# caught the over-engineering. No wasted implementation.
```

---

## 15. Before Debug Playbook: Agent Stuck in Retry Loop

```text
$ npm run build
error TS2345: Argument of type 'string | undefined' is not assignable
to parameter of type 'string'.

Agent: Build failed. Let me try again.
$ npm run build    ← same error
$ npm run build    ← same error
$ npm run build    ← same error
$ npm run build    ← same error

# 5 attempts. Same error. Agent is stuck.
# Eventually gives up or makes the wrong fix (adds `as string`).
```

## 16. After Debug Playbook: One-Step Resolution

```markdown
# CLAUDE.md — Debug Playbook

### If the build fails
- TypeScript strict mode catches something the IDE missed — run `pnpm typecheck` locally to see the full error
- Most common: `noUncheckedIndexedAccess` flags array/object access. Fix: add a null check or use optional chaining.
- Do NOT use `as` type assertions to suppress the error. Handle the null case.
```

```text
Agent reads Debug Playbook, sees the fix pattern.
$ pnpm typecheck
> src/utils.ts:15 — 'string | undefined' not assignable to 'string'

Agent adds null check:
  const value = items[0];
  if (!value) throw new Error('Empty items');

$ npm run gates ← passes on first try
```
