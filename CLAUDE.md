# CLAUDE.md — project-scaffold

This repo IS the scaffold template. When editing, you're editing the templates
other projects will use.

## Development Commands

```bash
# Validate all template files have required sections
./scripts/validate-templates.sh

# Test the scaffold script
./scripts/scaffold.sh /tmp/test-project

# Regenerate the single-file distribution
./scripts/generate-init.sh

# Verify scaffold.sh and init.sh produce identical output
diff <(./scripts/scaffold.sh /tmp/test-a 2>&1) <(./scripts/init.sh /tmp/test-b 2>&1)

# Lint markdown
npx markdownlint-cli2 "**/*.md"
```

## Architecture

- `scaffold/` — Template files that get copied into target projects
- `docs/` — Guide documentation (stays in this repo, not copied)
- `scripts/scaffold.sh` — Copies scaffold/ into a target directory
- `scripts/init.sh` — Single-file distribution (generated, do not edit directly)
- `scripts/generate-init.sh` — Builds init.sh from scaffold/ contents

## Rules

- Every template file must have `<!-- CUSTOMIZE -->` comments on sections that need editing
- Every scaffold file must be documented in docs/GUIDE.md
- README.md must list every scaffold file with its purpose
- Template files use [brackets] for placeholder values
- Non-template files (settings.json, CI workflows) should work with minimal changes
- The canonical gate command is `gates`. Never use `quality`, `validate`, or `claude:gates` anywhere.
- After changing any scaffold/ file, regenerate init.sh with `./scripts/generate-init.sh`

## Permissions

The `.claude/settings.json` in scaffold/ pre-approves these commands:

- `allow`: Safe read-only and build commands. The LLM runs these without asking.
- `deny`: Destructive operations. Structurally blocked.
- `git push` is intentionally NOT in allow — you want to review before pushing.
- `npm install` is intentionally NOT in allow — review new dependencies.
