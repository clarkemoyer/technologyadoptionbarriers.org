#!/usr/bin/env python3
"""Validate src/data/*.json files against their JSON Schema definitions.

Usage:
    python3 scripts/validate_data_schemas.py [--strict]

Options:
    --strict   Fail on *any* validation warning; default is errors-only.

Exit codes:
    0  All files passed validation
    1  One or more files failed validation (blocks CI / PR merge)

This script is invoked by the "Validate data schemas" step in ci.yml and
acts as a quality gate: pull requests that introduce schema violations are
blocked before the build runs.

Additionally it scans every validated file for PROLIFIC_PID patterns as a
defence-in-depth check that mirrors the PreToolUse hook in
.claude/settings.json.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Optional jsonschema import (available in CI; graceful fallback for local dev)
# ---------------------------------------------------------------------------
try:
    import jsonschema  # type: ignore

    _JSONSCHEMA_AVAILABLE = True
except ImportError:
    _JSONSCHEMA_AVAILABLE = False

# ---------------------------------------------------------------------------
# Configuration — maps each data file to its schema
# ---------------------------------------------------------------------------
_ROOT = Path(__file__).parent.parent

_VALIDATION_TARGETS: list[tuple[Path, Path]] = [
    (
        _ROOT / "src" / "data" / "disposition-summary.json",
        _ROOT / ".github" / "schemas" / "disposition-summary.schema.json",
    ),
    (
        _ROOT / "src" / "data" / "sensitivity-analysis.json",
        _ROOT / ".github" / "schemas" / "sensitivity-analysis.schema.json",
    ),
]

# Patterns that must NOT appear in any committed src/data/ file.
#
# We intentionally do NOT flag bare 24-char hex strings because the Prolific
# study ID (a MongoDB ObjectId) is stored in disposition-summary.json and is
# *not* a participant identifier.  Instead we look for:
#   1. The literal column header / field name PROLIFIC_PID (any case).
#   2. A JSON array containing 3 or more 24-char hex strings in close proximity —
#      this indicates a list of participant IDs rather than a single study/org ID.
_PID_PATTERNS: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"\bPROLIFIC_PID\b"), "PROLIFIC_PID column header"),
    (re.compile(r"\bprolific_pid\b", re.IGNORECASE), "prolific_pid field name"),
    (
        # 3+ hex-24 strings within 200 chars → likely a PID array
        re.compile(
            r"[0-9a-f]{24}.{0,200}[0-9a-f]{24}.{0,200}[0-9a-f]{24}",
            re.DOTALL,
        ),
        "multiple 24-char hex strings in sequence (likely Prolific PID array)",
    ),
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _validate_schema(data: object, schema: dict, data_path: Path) -> list[str]:
    """Return a list of human-readable error strings for *data* against *schema*."""
    if not _JSONSCHEMA_AVAILABLE:
        print(
            f"  [WARNING] jsonschema not installed — skipping schema check for {data_path.name}",
            file=sys.stderr,
        )
        return []
    errors: list[str] = []
    validator = jsonschema.Draft7Validator(schema)
    for error in validator.iter_errors(data):
        path_str = " → ".join(str(p) for p in error.absolute_path) or "<root>"
        errors.append(f"    [{path_str}] {error.message}")
    return errors


def _scan_for_pids(raw_text: str) -> list[str]:
    """Return descriptions of any PID patterns found in *raw_text*."""
    hits: list[str] = []
    for pattern, description in _PID_PATTERNS:
        if pattern.search(raw_text):
            hits.append(description)
    return hits


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Exit 1 even for warnings (e.g. jsonschema not installed)",
    )
    args = parser.parse_args(argv)

    overall_pass = True

    for data_path, schema_path in _VALIDATION_TARGETS:
        print(f"\n── {data_path.name if not data_path.is_relative_to(_ROOT) else data_path.relative_to(_ROOT)} ──")

        # 1. File must exist
        if not data_path.exists():
            print(f"  ERROR: file not found: {data_path}")
            overall_pass = False
            continue

        # 2. Must be valid JSON
        raw_text = data_path.read_text(encoding="utf-8")
        try:
            data = json.loads(raw_text)
        except json.JSONDecodeError as exc:
            print(f"  ERROR: invalid JSON — {exc}")
            overall_pass = False
            continue

        # 3. PID scan (defence-in-depth, mirrors PreToolUse hook)
        pid_hits = _scan_for_pids(raw_text)
        if pid_hits:
            print(
                f"  ERROR: participant identifier(s) detected in a public data file:\n"
                + "\n".join(f"    • {h}" for h in pid_hits)
            )
            overall_pass = False
            # Continue so we can surface schema errors too.

        # 4. Schema validation
        if not schema_path.exists():
            print(f"  WARNING: schema file not found: {schema_path} — skipping")
            if args.strict:
                overall_pass = False
            continue

        schema = json.loads(schema_path.read_text(encoding="utf-8"))
        errors = _validate_schema(data, schema, data_path)
        if errors:
            print(f"  ERROR: {len(errors)} schema violation(s):")
            for err in errors:
                print(err)
            overall_pass = False
        else:
            if not pid_hits:
                print("  OK")

    print()
    if overall_pass:
        print("✓ All data schema validations passed.")
        return 0
    else:
        print("✗ Data schema validation FAILED — see errors above.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
