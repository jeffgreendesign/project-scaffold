"""
Architecture Guardrail Test — Python
============================================================================
Enforces architectural rules using AST parsing. Catches violations at test
time before they make it into the codebase.

WHY THIS EXISTS:
LLM agents don't respect implicit architecture rules. They'll import the
database client directly, skip pagination on list queries, and add new
endpoints without registering them. These tests make the rules explicit.

WHAT IT ENFORCES:
1. Single database access point — only db/client.py may import the DB driver
2. Pagination on multi-row queries — every .all() or .filter() must have a limit
3. Registration consistency — every endpoint file must be registered in routes.py

HOW TO CUSTOMIZE:
- Update the constants at the top of each test class
- Add/remove tests based on your project's architecture
- Use the VERIFIED_SINGLE_ROW_LOOKUPS pattern for safe allowlisting

PATTERN: Rule-Bug-Prevention
Rule:    All DB queries must go through the repository layer
Bug:     Direct DB access bypasses caching, logging, and connection management
Prevent: AST scanning catches raw DB imports outside the approved module
============================================================================
"""

import ast
import os
import re
import unittest
from pathlib import Path
from typing import NamedTuple


class Violation(NamedTuple):
    file: str
    line: int
    message: str


# ============================================================================
# CUSTOMIZE: Update these paths to match your project structure
# ============================================================================

# Root directory to scan
SRC_DIR = "src"

# The single file allowed to import the database driver
DB_WRAPPER_MODULE = "src/db/client.py"

# Database packages that should only be imported in the wrapper
FORBIDDEN_DB_IMPORTS = [
    "psycopg2",
    "asyncpg",
    "sqlalchemy.engine",
    "sqlalchemy.create_engine",
]

# Files known to perform single-row lookups (no pagination needed).
# Add entries here after manually verifying the query is safe.
# Format: "path/to/file.py:function_name"
VERIFIED_SINGLE_ROW_LOOKUPS: set[str] = {
    # "src/users/repository.py:get_by_id",
    # "src/auth/repository.py:get_session",
}

# Route registration file
ROUTES_FILE = "src/routes.py"

# Pattern that registers an endpoint (customize the regex)
ROUTE_REGISTRATION_PATTERN = re.compile(
    r"router\.(include_router|add_api_route|get|post|put|delete)\("
)

# Directory containing endpoint files
ENDPOINTS_DIR = "src/endpoints"


def get_python_files(directory: str) -> list[str]:
    """Recursively get all Python files in a directory."""
    files = []
    root = Path(directory)

    if not root.exists():
        return files

    for path in root.rglob("*.py"):
        # Skip test files, __pycache__, and virtual envs
        parts = path.parts
        if any(
            p in ("__pycache__", ".venv", "venv", "node_modules", ".git")
            for p in parts
        ):
            continue
        if path.name.startswith("test_") or path.name.endswith("_test.py"):
            continue
        files.append(str(path))

    return files


def parse_file(filepath: str) -> ast.Module | None:
    """Parse a Python file into an AST, returning None on failure."""
    try:
        with open(filepath) as f:
            return ast.parse(f.read(), filename=filepath)
    except (SyntaxError, UnicodeDecodeError):
        return None


class TestDatabaseAccessBoundary(unittest.TestCase):
    """
    Enforces single database access point.

    Rule:    Only db/client.py may import database driver packages.
    Bug:     Direct DB imports bypass connection pooling and error handling.
    Prevent: This test scans all Python files for forbidden DB imports.
    """

    def test_no_direct_db_imports(self) -> None:
        violations: list[Violation] = []
        files = get_python_files(SRC_DIR)
        wrapper = os.path.normpath(DB_WRAPPER_MODULE)

        for filepath in files:
            normalized = os.path.normpath(filepath)
            if normalized == wrapper:
                continue

            tree = parse_file(filepath)
            if tree is None:
                continue

            for node in ast.walk(tree):
                # Check 'import X' statements
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        for forbidden in FORBIDDEN_DB_IMPORTS:
                            if alias.name == forbidden or alias.name.startswith(
                                forbidden + "."
                            ):
                                violations.append(
                                    Violation(
                                        file=filepath,
                                        line=node.lineno,
                                        message=(
                                            f"Direct import of '{alias.name}' — "
                                            f"use {DB_WRAPPER_MODULE} instead"
                                        ),
                                    )
                                )

                # Check 'from X import Y' statements
                if isinstance(node, ast.ImportFrom) and node.module:
                    for forbidden in FORBIDDEN_DB_IMPORTS:
                        if node.module == forbidden or node.module.startswith(
                            forbidden + "."
                        ):
                            violations.append(
                                Violation(
                                    file=filepath,
                                    line=node.lineno,
                                    message=(
                                        f"Direct import from '{node.module}' — "
                                        f"use {DB_WRAPPER_MODULE} instead"
                                    ),
                                )
                            )

        if violations:
            msg = f"\nFound {len(violations)} forbidden DB import(s):\n\n"
            for v in violations:
                msg += f"  {v.file}:{v.line} — {v.message}\n"
            msg += f"\nOnly {DB_WRAPPER_MODULE} may import these packages."
            self.fail(msg)


class TestPaginationEnforcement(unittest.TestCase):
    """
    Enforces pagination on multi-row queries.

    Rule:    Every query that can return multiple rows must include a limit.
    Bug:     Unbounded queries cause memory issues and slow responses at scale.
    Prevent: AST scanning checks for .all()/.filter() without .limit().
    """

    def test_multi_row_queries_have_pagination(self) -> None:
        violations: list[Violation] = []
        files = get_python_files(SRC_DIR)

        # Patterns that indicate multi-row queries
        multi_row_patterns = re.compile(
            r"\.(all|filter|filter_by|select|query)\s*\("
        )

        # Patterns that indicate pagination is present
        pagination_patterns = re.compile(
            r"\.(limit|paginate|slice|first|\[:|\[0:)\s*\("
        )

        for filepath in files:
            with open(filepath) as f:
                lines = f.readlines()

            for i, line in enumerate(lines, 1):
                if multi_row_patterns.search(line):
                    # Check if this is a verified single-row lookup
                    func_name = _get_enclosing_function(filepath, i)
                    lookup_key = f"{filepath}:{func_name}" if func_name else ""

                    if lookup_key in VERIFIED_SINGLE_ROW_LOOKUPS:
                        continue

                    # Check surrounding lines (within 5 lines) for pagination
                    context_start = max(0, i - 3)
                    context_end = min(len(lines), i + 5)
                    context = "".join(lines[context_start:context_end])

                    if not pagination_patterns.search(context):
                        violations.append(
                            Violation(
                                file=filepath,
                                line=i,
                                message=(
                                    f"Multi-row query without pagination: "
                                    f"{line.strip()}"
                                ),
                            )
                        )

        if violations:
            msg = f"\nFound {len(violations)} query(ies) without pagination:\n\n"
            for v in violations:
                msg += f"  {v.file}:{v.line} — {v.message}\n"
            msg += (
                "\nFix: Add .limit() or add to VERIFIED_SINGLE_ROW_LOOKUPS "
                "if this is intentionally unbounded."
            )
            self.fail(msg)


class TestRegistrationConsistency(unittest.TestCase):
    """
    Enforces that every endpoint module is registered in routes.

    Rule:    Every file in endpoints/ must be imported in routes.py.
    Bug:     New endpoints that aren't registered are silently unreachable.
    Prevent: This test compares endpoint files to route registrations.
    """

    def test_all_endpoints_registered(self) -> None:
        if not os.path.exists(ENDPOINTS_DIR):
            self.skipTest(f"No endpoints directory at {ENDPOINTS_DIR}")

        if not os.path.exists(ROUTES_FILE):
            self.skipTest(f"No routes file at {ROUTES_FILE}")

        # Get endpoint module names
        endpoint_modules = set()
        for filepath in get_python_files(ENDPOINTS_DIR):
            module_name = Path(filepath).stem
            if module_name != "__init__":
                endpoint_modules.add(module_name)

        if not endpoint_modules:
            return

        # Read routes file and find registered modules
        with open(ROUTES_FILE) as f:
            routes_content = f.read()

        unregistered = []
        for module in sorted(endpoint_modules):
            if module not in routes_content:
                unregistered.append(module)

        if unregistered:
            msg = f"\nFound {len(unregistered)} unregistered endpoint(s):\n\n"
            for module in unregistered:
                msg += f"  - {module} (in {ENDPOINTS_DIR}/{module}.py)\n"
            msg += f"\nRegister them in {ROUTES_FILE}."
            self.fail(msg)


def _get_enclosing_function(filepath: str, line_number: int) -> str | None:
    """Get the name of the function containing a given line number."""
    tree = parse_file(filepath)
    if tree is None:
        return None

    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            if hasattr(node, "end_lineno") and node.end_lineno:
                if node.lineno <= line_number <= node.end_lineno:
                    return node.name

    return None


if __name__ == "__main__":
    unittest.main()
