# Python Equivalents for TypeScript Config

<!-- This file maps the TypeScript tooling choices in this scaffold to their
     Python equivalents. Use it when setting up a Python project with the same
     level of strictness and quality gates. -->

## Linter + Formatter: Biome → Ruff

TypeScript uses Biome for linting and formatting. The Python equivalent is [Ruff](https://docs.astral.sh/ruff/).

```toml
# pyproject.toml
[tool.ruff]
line-length = 100
target-version = "py312"

[tool.ruff.lint]
select = [
    "E",    # pycodestyle errors
    "W",    # pycodestyle warnings
    "F",    # pyflakes
    "I",    # isort
    "N",    # pep8-naming
    "UP",   # pyupgrade
    "B",    # flake8-bugbear
    "A",    # flake8-builtins
    "S",    # flake8-bandit (security)
    "T20",  # flake8-print (catches print statements)
    "SIM",  # flake8-simplify
    "TCH",  # flake8-type-checking
    "ARG",  # flake8-unused-arguments
    "RUF",  # ruff-specific rules
]

[tool.ruff.format]
quote-style = "double"
indent-style = "space"
```

## Type Checker: TypeScript strict → mypy / pyright

TypeScript's `strict: true` maps to strict mypy or pyright settings.

```toml
# pyproject.toml — mypy
[tool.mypy]
python_version = "3.12"
strict = true
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
disallow_any_generics = true
no_implicit_optional = true
check_untyped_defs = true
```

```toml
# pyproject.toml — pyright (alternative)
[tool.pyright]
pythonVersion = "3.12"
typeCheckingMode = "strict"
```

## Test Runner: Vitest → pytest

```toml
# pyproject.toml
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_functions = ["test_*"]
addopts = "-v --tb=short"
```

## Quality Gates: `npm run gates` → `python -m gates`

Create a `gates` module or script that runs all checks:

```python
# gates.py (or as a package.json-style script in pyproject.toml)
"""
Quality gates — run before every commit.
Usage: python -m gates
"""
import subprocess
import sys

gates = [
    ("lint", ["ruff", "check", "."]),
    ("format", ["ruff", "format", "--check", "."]),
    ("typecheck", ["mypy", "."]),
    ("test", ["pytest"]),
]

failed = []
for name, cmd in gates:
    print(f"\n--- {name} ---")
    result = subprocess.run(cmd)
    if result.returncode != 0:
        failed.append(name)

if failed:
    print(f"\n✗ Failed gates: {', '.join(failed)}")
    sys.exit(1)
print("\n✓ All gates passed.")
```

Or in pyproject.toml with a task runner:

```toml
# pyproject.toml (using hatch or pdm scripts)
[tool.hatch.envs.default.scripts]
gates = [
    "ruff check .",
    "ruff format --check .",
    "mypy .",
    "pytest",
]
```

## Runtime Pin: `.node-version` → `.python-version`

```text
3.12
```

Use with pyenv or mise to ensure consistent Python versions.

## Package Manager: pnpm → uv / pip

- **uv** is the modern equivalent (fast, lockfile-based)
- **pip + pip-tools** is the traditional approach
- **poetry** / **pdm** are alternatives with built-in virtual env management

## Key Differences

| TypeScript                  | Python Equivalent           |
|-----------------------------|-----------------------------|
| `biome.json`                | `pyproject.toml` [tool.ruff] |
| `tsconfig.json` (strict)    | `pyproject.toml` [tool.mypy] |
| `vitest`                    | `pytest`                    |
| `.node-version`             | `.python-version`           |
| `pnpm install`              | `uv sync` / `pip install`   |
| `npm run gates`             | `python -m gates` / `hatch run gates` |
| `package.json` scripts      | `pyproject.toml` scripts    |
| ESM imports                 | Standard Python imports     |
| `@types/*` packages         | Type stubs (`*-stubs`)      |
