#!/bin/bash
set -euo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$PROJECT_DIR"

echo "--- Session start: installing dependencies ---"

# Detect package manager
if [ -f "pnpm-lock.yaml" ]; then
  pnpm install --frozen-lockfile 2>&1
elif [ -f "yarn.lock" ]; then
  yarn install --frozen-lockfile 2>&1
elif [ -f "package-lock.json" ]; then
  npm ci 2>&1
elif [ -f "pyproject.toml" ]; then
  pip install -e ".[dev]" --quiet 2>&1
elif [ -f "requirements.txt" ]; then
  pip install -r requirements.txt --quiet 2>&1
fi

echo "--- Session start complete ---"
