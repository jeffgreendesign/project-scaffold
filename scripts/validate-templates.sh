#!/bin/bash
# ============================================================================
# validate-templates.sh — Verify scaffold templates have required sections
# ============================================================================
# Scans scaffold/ for .template files and checks that each contains at least
# one <!-- CUSTOMIZE --> comment (per project rules in CLAUDE.md).
#
# Usage:
#   ./scripts/validate-templates.sh
#
# Exit codes:
#   0 — all templates valid
#   1 — one or more templates missing required sections
# ============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
SCAFFOLD_DIR="$REPO_DIR/scaffold"

errors=0

echo "Validating scaffold templates..."
echo ""

# Check all .template files for required <!-- CUSTOMIZE --> markers
while IFS= read -r -d '' filepath; do
  relpath="${filepath#$SCAFFOLD_DIR/}"

  if ! grep -q '<!-- CUSTOMIZE' "$filepath"; then
    echo "  ERROR: $relpath — missing <!-- CUSTOMIZE --> comment"
    errors=$((errors + 1))
  else
    echo "  OK: $relpath"
  fi
done < <(find "$SCAFFOLD_DIR" -name "*.template" -type f -print0 | sort -z)

echo ""

if [ "$errors" -gt 0 ]; then
  echo "✗ $errors template(s) missing required sections"
  exit 1
else
  echo "✓ All templates valid"
fi
