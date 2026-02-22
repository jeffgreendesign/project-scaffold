#!/bin/bash
# ============================================================================
# Documentation Sync Check — Detects Documentation Drift
# ============================================================================
# Compares "source of truth" code patterns against documentation files to
# find items that exist in code but aren't documented.
#
# How it works:
# 1. Define source patterns (e.g., exported functions, route registrations)
# 2. Define doc files that should reference those items
# 3. Script extracts items from source, checks doc files for references
# 4. Reports any missing references
#
# Usage:
#   ./scripts/doc-sync-check.sh              # Check for drift
#   ./scripts/doc-sync-check.sh --fix        # Report what to add (no auto-fix)
#
# Configuration:
#   Edit the SYNC_RULES array below to match your project structure.
# ============================================================================
set -euo pipefail

FIX_MODE=false
if [ "${1:-}" = "--fix" ]; then
  FIX_MODE=true
fi

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0

# ============================================================================
# CUSTOMIZE: Define your sync rules below.
#
# Each rule has:
#   SOURCE_GLOB  — files to extract items from
#   PATTERN      — regex to extract item names (first capture group)
#   DOC_FILES    — files that must reference each extracted item
#   DESCRIPTION  — human-readable description for error messages
# ============================================================================

check_sync() {
  local description="$1"
  local source_glob="$2"
  local pattern="$3"
  shift 3
  local doc_files=("$@")

  echo -e "${BLUE}Checking: $description${NC}"

  # Extract items from source files
  local items=()
  for source_file in $source_glob; do
    [ -f "$source_file" ] || continue
    while IFS= read -r item; do
      [ -n "$item" ] && items+=("$item")
    done < <(grep -oE "$pattern" "$source_file" 2>/dev/null | sed -E "s/$pattern/\1/" || true)
  done

  if [ ${#items[@]} -eq 0 ]; then
    echo "  No items found in source files. Skipping."
    echo ""
    return
  fi

  echo "  Found ${#items[@]} items in source."

  # Check each doc file for references
  for doc_file in "${doc_files[@]}"; do
    if [ ! -f "$doc_file" ]; then
      echo -e "  ${YELLOW}⚠ Doc file not found: $doc_file${NC}"
      ERRORS=$((ERRORS + 1))
      continue
    fi

    local missing=()
    for item in "${items[@]}"; do
      if ! grep -q "$item" "$doc_file" 2>/dev/null; then
        missing+=("$item")
      fi
    done

    if [ ${#missing[@]} -eq 0 ]; then
      echo -e "  ${GREEN}✓ $doc_file — all items referenced${NC}"
    else
      echo -e "  ${RED}✗ $doc_file — missing ${#missing[@]} reference(s):${NC}"
      for m in "${missing[@]}"; do
        echo "    - $m"
        ERRORS=$((ERRORS + 1))
      done

      if [ "$FIX_MODE" = true ]; then
        echo ""
        echo -e "  ${BLUE}To fix, add these to $doc_file:${NC}"
        for m in "${missing[@]}"; do
          echo "    - \`$m\` — [add description]"
        done
      fi
    fi
  done

  echo ""
}

# ============================================================================
# CUSTOMIZE: Add your sync rules here.
#
# Example rules (uncomment and adapt):
# ============================================================================

# Example 1: Exported functions must be documented in API docs
# check_sync \
#   "Exported functions → API.md" \
#   "src/lib/*.ts" \
#   "export (function|const) ([a-zA-Z]+)" \
#   "docs/API.md"

# Example 2: Route registrations must be in AGENTS.md
# check_sync \
#   "Route registrations → AGENTS.md" \
#   "src/routes/*.ts" \
#   "router\.(get|post|put|delete)\(['\"]([^'\"]+)" \
#   "AGENTS.md"

# Example 3: Environment variables must be in .env.example
# check_sync \
#   "Env vars → .env.example" \
#   "src/**/*.ts" \
#   "process\.env\.([A-Z_]+)" \
#   ".env.example" "CLAUDE.md"

# ============================================================================
# Placeholder: Remove this block once you've added your own rules above
# ============================================================================
echo -e "${YELLOW}No sync rules configured yet.${NC}"
echo ""
echo "Edit this script to add your project's sync rules."
echo "See the CUSTOMIZE section for examples."
echo ""
exit 0

# ============================================================================
# Summary
# ============================================================================
echo "══════════════════════════════════════"
if [ "$ERRORS" -eq 0 ]; then
  echo -e "${GREEN}✓ All documentation is in sync.${NC}"
  exit 0
fi

echo -e "${RED}Found $ERRORS documentation drift issue(s).${NC}"
if [ "$FIX_MODE" = false ]; then
  echo "Run with --fix for details on what to add."
fi
exit 1
