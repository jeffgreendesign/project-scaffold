# Repo health audit

Read-only public GitHub audit for selected Jeff Green repos.

## Files

- `repos.json`: target list, classification, notes, and safety rules.
- `REPORT.md`: generated snapshot. Regenerate it with `pnpm repo-health:audit`.
- `../scripts/audit-public-repos.mjs`: audit runner.

## Safe usage

Run:

```bash
pnpm repo-health:audit
```

The script uses `gh` and public metadata. It writes Markdown only.

It does not edit GitHub. It must not create issues, PRs, commits, settings changes, or README rewrites.

Keep the private current site source out of this audit. Do not query `hire-jeff-green-nextjs`. Do not expose private, work, customer, Hermes/session, family, or health details. Do not include real lead/customer/person data. Do not claim production readiness unless the public repo proves it.

## Fields

- `kind`: `profile` or `repo`.
- `owner`: GitHub owner.
- `name`: repo name, for repo targets.
- `classification`: portfolio role.
- `notes`: short human context.

## Agent notes

Read config. Query public only. GET only. No mutation. No private repo. No secrets. No people data. Write report. Stop.
