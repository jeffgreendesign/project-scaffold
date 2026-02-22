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
  # Prefer python -m pip when not in a virtual environment
  PIP_CMD="pip"
  if [ -z "${VIRTUAL_ENV:-}" ]; then
    echo "⚠ No virtual environment detected — using python -m pip"
    PIP_CMD="python -m pip"
  fi
  # Only use .[dev] if pyproject.toml defines dev extras
  if grep -qE '\[project\.optional-dependencies\]' pyproject.toml && grep -qE '^\s*dev\s*=' pyproject.toml; then
    $PIP_CMD install -e ".[dev]" --quiet 2>&1
  else
    $PIP_CMD install -e . --quiet 2>&1
  fi
elif [ -f "requirements.txt" ]; then
  PIP_CMD="pip"
  if [ -z "${VIRTUAL_ENV:-}" ]; then
    echo "⚠ No virtual environment detected — using python -m pip"
    PIP_CMD="python -m pip"
  fi
  $PIP_CMD install -r requirements.txt --quiet 2>&1
else
  echo "⚠ No lockfile or project file found — skipping dependency install"
fi

echo "--- Session start complete ---"
