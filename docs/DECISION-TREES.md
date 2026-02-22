# Decision Trees

Use these flowcharts to decide which scaffold files your project needs. Not every project needs every file.

---

## 1. "Do I Need This File?"

### CLAUDE.md

```text
┌───────────────────────────┐
│ Will an LLM ever touch    │
│ this codebase?            │
└──────────┬────────────────┘
     ┌─────┴──────┐
     │             │
    Yes           No
     │             │
     ▼             ▼
  Create        Still create it.
  CLAUDE.md     It helps humans too.
```

**Answer: Always create CLAUDE.md.** It's useful for humans and agents alike.

### AGENTS.md

```text
┌──────────────────────────┐
│ Does project expose API? │
└──────────┬───────────────┘
     ┌─────┴──────┐
     │             │
    Yes           No
     │             │
     ▼             ▼
  Create        Skip
  AGENTS.md     AGENTS.md
```

### NOW.md

```text
┌──────────────────────────────┐
│ Will this project be active  │
│ for more than 2 weeks?       │
└──────────┬───────────────────┘
     ┌─────┴──────┐
     │             │
    Yes           No
     │             │
     ▼             ▼
  Create        Skip NOW.md
  NOW.md        (short projects
                 don't need it)
```

### llms.txt

```text
┌──────────────────────────────┐
│ Will external agents or      │
│ users interact with this     │
│ project?                     │
└──────────┬───────────────────┘
     ┌─────┴──────┐
     │             │
    Yes           No
     │             │
     ▼             ▼
  Create        Skip
  llms.txt      llms.txt
```

### Cursor Rules

```text
┌──────────────────────────────┐
│ Does your team use Cursor?   │
└──────────┬───────────────────┘
     ┌─────┴──────┐
     │             │
    Yes           No
     │             │
     ▼             ▼
  Create        Skip
  .cursor/       .cursor/
  rules/         rules/
```

---

## 2. "Which Tier Should I Implement?"

```text
┌─────────────────────────────┐
│ How long will this project  │
│ be actively developed?      │
└──────────┬──────────────────┘
     ┌─────┴──────┐
     │             │
  < 2 weeks    >= 2 weeks
     │             │
     ▼             ▼
  Tier 0       ┌──────────────────┐
  only         │ Is there a team  │
               │ (> 1 person)?    │
               └──────┬───────────┘
                 ┌─────┴──────┐
                 │             │
               Yes            No
                 │             │
                 ▼             ▼
              Tier 0+1+2   Tier 0+1
                 │
              ┌──┴───────────────┐
              │ Is the project   │
              │ public or has    │
              │ external users?  │
              └──────┬───────────┘
                ┌────┴─────┐
                │          │
              Yes         No
                │          │
                ▼          ▼
             Tier 0-3   Tier 0-2
             (full)     (skip Tier 3)
```

---

## 3. "Is This a Library with Consumers?"

```text
┌──────────────────────────────┐
│ Is this a library with       │
│ external consumers?          │
└──────────┬───────────────────┘
     ┌─────┴──────┐
     │             │
    Yes           No
     │             │
     ▼             ▼
  Add:          Skip these
  - Public API     sections
    Stability
    section in
    CLAUDE.md
  - MIGRATION.md
  - Compat matrix
    (Node + TS
    targets) in
    Quick Reference
  - Semver
    enforcement
    in CI
```

---

## 4. "Is This a Monorepo?"

```text
┌──────────────────────────────┐
│ Is this a monorepo?          │
└──────────┬───────────────────┘
     ┌─────┴──────┐
     │             │
    Yes           No
     │             │
     ▼             ▼
  Add:          Use standard
  - workspace      test_
    boundary test  architecture
    (test_         tests only
    workspace_
    boundaries.ts)
  - changeset
    enforcement
  - per-package
    gates scripts
  - cross-package
    build validation
```

---

## 5. "Does This Project Handle Data Ingestion/Sync?"

```text
┌──────────────────────────────┐
│ Does this project read,      │
│ transform, or persist data   │
│ from external sources?       │
└──────────┬───────────────────┘
     ┌─────┴──────┐
     │             │
    Yes           No
     │             │
     ▼             ▼
  Add Data       Skip Data
  Integrity      Integrity
  Rules to       Rules section
  CLAUDE.md:
  - No array
    slicing caps
  - Per-item
    error handling
  - Log counts
  - Deterministic
    ordering
  - No empty
    string
    timestamps
```

---

## 6. "Server Component or Client Component?" (React)

```text
┌──────────────────────────────┐
│ Does this component need:    │
│ - useState / useEffect?      │
│ - onClick / onChange?        │
│ - Browser APIs?              │
└──────────┬───────────────────┘
     ┌─────┴──────┐
     │             │
    Yes           No
     │             │
     ▼             ▼
  Client        Server
  Component     Component
  (add "use     (default in
   client")     Next.js App
                Router)
     │
     ▼
  Keep it small.
  Extract data
  fetching to a
  Server Component
  parent.
```

---

## 7. "Guardrail Test or Linter Rule?"

```text
┌──────────────────────────────┐
│ What kind of rule is this?   │
└──────────┬───────────────────┘
     ┌─────┴──────┐
     │             │
  Syntax/Style  Architecture
     │             │
     ▼             ▼
  Linter rule   Guardrail test
  (biome/ruff/  (test_architecture
   eslint)       .ts/.py)
                     │
  Examples:       Examples:
  - no `any`      - Only db.ts
  - import          imports pg
    order         - No circular
  - unused          deps in
    variables       monorepo
  - naming        - All endpoints
    conventions     registered
                  - Pagination
                    on list queries
```

---

## 8. "Single File or Co-located Docs?"

```text
┌──────────────────────────────┐
│ Is CLAUDE.md over 500 lines? │
└──────────┬───────────────────┘
     ┌─────┴──────┐
     │             │
    Yes           No
     │             │
     ▼             ▼
  Split into     Keep as
  separate       single file
  docs:
  - CLAUDE.md
    (essentials)
  - docs/
    ARCHITECTURE.md
  - docs/
    DATA-MODEL.md
  - docs/
    DEPLOYMENT.md
  - AGENTS.md
    (API guide)
```
