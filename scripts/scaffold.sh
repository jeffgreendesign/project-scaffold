#!/bin/bash
# ============================================================================
# scaffold.sh — Copy scaffold files into a target project
# ============================================================================
# Copies all files from the scaffold/ directory into the specified target
# directory. Renames .template files (removes the extension) and makes
# shell scripts executable.
#
# Usage:
#   ./scripts/scaffold.sh /path/to/your/project
# ============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
SCAFFOLD_DIR="$REPO_DIR/scaffold"

# Validate arguments
if [ $# -lt 1 ]; then
  echo "Usage: $0 <target-directory>"
  echo ""
  echo "Copies scaffold files into the target directory."
  exit 1
fi

TARGET_DIR="$1"

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Resolve to absolute path
TARGET_DIR="$(cd "$TARGET_DIR" && pwd)"

echo "Copying scaffold files to $TARGET_DIR..."
echo ""

# Copy all files from scaffold/ to target, preserving directory structure
# Use rsync if available, otherwise fall back to cp
if command -v rsync &>/dev/null; then
  rsync -a "$SCAFFOLD_DIR/" "$TARGET_DIR/" || \
    cp -R "$SCAFFOLD_DIR"/. "$TARGET_DIR/"
else
  cp -R "$SCAFFOLD_DIR"/. "$TARGET_DIR/"
fi

# Rename .template files (remove the .template extension)
find "$TARGET_DIR" -name "*.template" -type f -print0 | while IFS= read -r -d '' template_file; do
  target_file="${template_file%.template}"
  mv "$template_file" "$target_file"
  echo "  Renamed: $(basename "$template_file") → $(basename "$target_file")"
done

# Make shell scripts executable
find "$TARGET_DIR" -name "*.sh" -type f -exec chmod +x {} \;
# Make husky hooks executable
if [ -d "$TARGET_DIR/.husky" ]; then
  find "$TARGET_DIR/.husky" -type f -exec chmod +x {} \;
fi

# Detect package manager in target directory for next-steps output
if [ -f "$TARGET_DIR/pnpm-lock.yaml" ]; then
  PM_INSTALL="pnpm add -D"; PM_EXEC="pnpm dlx"; PM_RUN="pnpm"
elif [ -f "$TARGET_DIR/yarn.lock" ]; then
  PM_INSTALL="yarn add --dev"; PM_RUN="yarn"
  # yarn dlx only exists in Yarn v2+ (Berry); Yarn v1 (Classic) needs npx
  if yarn --version 2>/dev/null | grep -q '^1\.'; then PM_EXEC="npx"; else PM_EXEC="yarn dlx"; fi
else
  PM_INSTALL="npm install --save-dev"; PM_EXEC="npx"; PM_RUN="npm run"
fi

echo ""
echo "✓ Scaffold copied to $TARGET_DIR"
echo ""
echo "Next steps:"
echo "  1. Edit CLAUDE.md — replace all [bracketed] values"
echo "  2. Edit .env.example — add your environment variables"
echo "  3. Edit .claude/settings.json — adjust allowed commands"
echo "  4. Run: $PM_INSTALL husky && $PM_EXEC husky init"
echo "  5. Run: $PM_RUN gates (verify everything passes)"
echo ""
echo "Optional:"
echo "  - Edit NOW.md if project will last > 2 weeks"
echo "  - Edit AGENTS.md for Codex/GPT execution guidance"
echo "  - Delete files you don't need (see docs/DECISION-TREES.md)"
