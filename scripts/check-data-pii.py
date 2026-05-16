#!/usr/bin/env python3
"""Scan JSON files in src/data/ for Prolific Participant ID (PID) patterns.

Prolific PIDs and study IDs share the same 24-character lowercase hex format.
Study IDs are intentionally stored in some files for display purposes;
participant IDs must never appear in committed repository files.

This script is run:
  - In CI on every pull request / push that touches src/data/
  - As a pre-commit check on staged src/data/**/*.json files
  - On a scheduled basis (data-quality-check.yml) to catch any drift

Usage:
    python scripts/check-data-pii.py [files...]
    python scripts/check-data-pii.py src/data/disposition-summary.json
    python scripts/check-data-pii.py          # defaults to src/data/**/*.json

Exit codes:
    0 - No PID patterns found (or all found patterns are allowlisted)
    1 - PID patterns found (potential data leak)
    2 - Read/parse error or usage error (scan could not complete)
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

# 24 lowercase hex characters - the Prolific PID / study-ID format.
# No anchors: also catches PIDs embedded inside longer string values.
_PID_RE = re.compile(r"[0-9a-f]{24}")

_COMMIT_SHA_LEAF_KEYS: frozenset[str] = frozenset({"commitSha", "commit_sha"})
_STUDY_ID_LEAF_KEYS: frozenset[str] = frozenset({"studyId", "study_id"})
_COMMIT_SHA_RE = re.compile(r"^[0-9a-f]{40}$")
_STUDY_ID_RE = re.compile(r"^[0-9a-f]{24}$")


def _find_hex_strings(obj: object, key_path: str = "") -> list[tuple[str, str]]:
    """Recursively walk a JSON object and return (key_path, full_string) for every
    string key/value where full_string contains at least one 24-char hex substring."""
    results: list[tuple[str, str]] = []
    if isinstance(obj, dict):
        for key, val in obj.items():
            child = f"{key_path}.{key}" if key_path else key
            # Check the key itself for embedded PIDs
            if isinstance(key, str) and _PID_RE.search(key):
                results.append((f"{child} (key)", key))
            results.extend(_find_hex_strings(val, child))
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            results.extend(_find_hex_strings(item, f"{key_path}[{i}]"))
    elif isinstance(obj, str):
        if _PID_RE.search(obj):
            results.append((key_path, obj))
    return results


def _is_allowed(key_path: str, value: str) -> bool:
    """Return True when the key path indicates an allowlisted machine identifier
    rather than a participant identifier.

    Allowed patterns:
      - commitSha / commit_sha values that are full 40-char lowercase Git SHAs
      - studyId / study_id values that are full 24-char lowercase hex IDs
      - The pattern "*.study.id" where value is a full 24-char lowercase hex ID
    """
    # Never allowlist JSON keys themselves: keys should not contain participant
    # identifiers by design. Only values can be exempted when they match strict
    # machine-identifier formats.
    if key_path.endswith(" (key)"):
        return False

    parts = key_path.replace("[", ".").replace("]", "").split(".")
    leaf = parts[-1]

    if leaf in _COMMIT_SHA_LEAF_KEYS:
        return _COMMIT_SHA_RE.fullmatch(value) is not None

    if leaf in _STUDY_ID_LEAF_KEYS:
        return _STUDY_ID_RE.fullmatch(value) is not None

    # study.id  - value nested inside a dict keyed "study", under key "id"
    if leaf == "id" and len(parts) >= 2 and parts[-2] == "study":
        return _STUDY_ID_RE.fullmatch(value) is not None

    return False


def check_file(path: Path) -> tuple[list[dict], bool]:
    """Scan *path* for PID violations.

    Returns:
        (violations, parse_error) where parse_error is True when the file
        could not be read or parsed (the caller should exit 2, not 1).
    """
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError) as exc:
        print(f"  ERROR reading {path}: {exc}", file=sys.stderr)
        return [], True

    violations: list[dict] = []
    for key_path, value in _find_hex_strings(data):
        if _is_allowed(key_path, value):
            continue
        # Do not echo any PID characters into logs or workflow summaries.
        violations.append({"file": str(path), "key": key_path, "value": "***"})

    return violations, False


def main(argv: list[str] | None = None) -> int:
    args = (argv if argv is not None else sys.argv)[1:]

    if args:
        files = [Path(f) for f in args]
    else:
        data_dir = Path("src/data")
        if not data_dir.is_dir():
            print("ERROR: src/data/ directory not found. Run from the repo root.", file=sys.stderr)
            return 2
        # rglob covers nested subdirectories (faqs/, team/, testimonials/, …)
        files = sorted(data_dir.rglob("*.json"))

    if not files:
        print("No files to check.")
        return 0

    all_violations: list[dict] = []
    had_parse_error = False
    for path in files:
        violations, parse_error = check_file(path)
        if parse_error:
            had_parse_error = True
        for v in violations:
            print(f"  VIOLATION: {v['file']}  key={v['key']}")
        all_violations.extend(violations)

    file_count = len(files)
    violation_count = len(all_violations)

    if had_parse_error:
        print(f"\nPII scan: could not complete - read/parse error(s) in {file_count} file(s) checked.")
        print("Fix the errors above and re-run the scan.")
        return 2

    print(f"\nPII scan: {violation_count} violation(s) across {file_count} file(s).")

    if all_violations:
        print(
            "\n⛔ Potential Prolific PID detected in src/data/ JSON.\n"
            "Participant identifiers must never be committed to the repository.\n"
            "Review the violations above and remove any per-participant data."
        )
        return 1

    print("No PID patterns found.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
