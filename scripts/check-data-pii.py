#!/usr/bin/env python3
"""Scan JSON files in src/data/ for Prolific Participant ID (PID) patterns.

Prolific PIDs and study IDs share the same 24-character lowercase hex format.
Study IDs are intentionally stored in some files for display purposes;
participant IDs must never appear in committed repository files.

This script is run:
  - In CI on every pull request / push that touches src/data/
  - As a pre-commit check on staged src/data/*.json files
  - On a scheduled basis (data-quality-check.yml) to catch any drift

Usage:
    python scripts/check-data-pii.py [files...]
    python scripts/check-data-pii.py src/data/disposition-summary.json
    python scripts/check-data-pii.py          # defaults to src/data/*.json

Exit codes:
    0 - No PID patterns found (or all found patterns are allowlisted)
    1 - PID patterns found (potential data leak)
    2 - Usage/parse error
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

# 24 lowercase hex characters — the Prolific PID / study-ID format.
# No anchors: also catches PIDs embedded inside longer string values.
_PID_RE = re.compile(r"[0-9a-f]{24}")

# JSON key names whose *values* are known to be study-level identifiers,
# not participant identifiers.  Extend this list if the data schema changes.
_ALLOWED_LEAF_KEYS: frozenset[str] = frozenset(
    {
        "studyId",
        "study_id",
    }
)


def _find_hex_strings(obj: object, key_path: str = "") -> list[tuple[str, str]]:
    """Recursively walk a JSON object and return (key_path, match) for every
    24-char hex substring found in any string value."""
    results: list[tuple[str, str]] = []
    if isinstance(obj, dict):
        for key, val in obj.items():
            child = f"{key_path}.{key}" if key_path else key
            results.extend(_find_hex_strings(val, child))
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            results.extend(_find_hex_strings(item, f"{key_path}[{i}]"))
    elif isinstance(obj, str):
        for m in _PID_RE.finditer(obj):
            results.append((key_path, m.group()))
    return results


def _is_allowed(key_path: str) -> bool:
    """Return True when the key path indicates a study identifier rather than
    a participant identifier.

    Allowed patterns:
      - Any leaf key in _ALLOWED_LEAF_KEYS   (e.g. "studyId", "study_id")
      - The pattern "*.study.id"             (e.g. "study.id")
    """
    parts = key_path.replace("[", ".").replace("]", "").split(".")
    leaf = parts[-1]

    if leaf in _ALLOWED_LEAF_KEYS:
        return True

    # study.id  — value nested inside a dict keyed "study", under key "id"
    if leaf == "id" and len(parts) >= 2 and parts[-2] == "study":
        return True

    return False


def check_file(path: Path) -> list[dict]:
    """Scan *path* and return a list of violation dicts (empty == clean)."""
    violations: list[dict] = []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError) as exc:
        print(f"  ERROR reading {path}: {exc}", file=sys.stderr)
        return [{"file": str(path), "key": "N/A", "value": "N/A", "error": str(exc)}]

    for key_path, value in _find_hex_strings(data):
        if _is_allowed(key_path):
            continue
        # Redact the middle of the 24-char hex value so it isn't echoed in full
        redacted = value[:6] + "..." + value[-4:] if len(value) >= 10 else "***"
        violations.append({"file": str(path), "key": key_path, "value": redacted})

    return violations


def main(argv: list[str] | None = None) -> int:
    args = (argv if argv is not None else sys.argv)[1:]

    if args:
        files = [Path(f) for f in args]
    else:
        data_dir = Path("src/data")
        if not data_dir.is_dir():
            print("ERROR: src/data/ directory not found. Run from the repo root.", file=sys.stderr)
            return 2
        files = sorted(data_dir.glob("*.json"))

    if not files:
        print("No files to check.")
        return 0

    all_violations: list[dict] = []
    for path in files:
        violations = check_file(path)
        for v in violations:
            if "error" in v:
                print(f"  ERROR: {v['file']}: {v['error']}")
            else:
                print(f"  VIOLATION: {v['file']}  key={v['key']}  value={v['value']}")
        all_violations.extend(violations)

    file_count = len(files)
    violation_count = len(all_violations)
    print(f"\nPII scan: {violation_count} violation(s) across {file_count} file(s).")

    if all_violations:
        print(
            "\n⛔ Potential Prolific PID detected in src/data/ JSON.\n"
            "Participant identifiers must never be committed to the repository.\n"
            "Review the violations above and remove any per-participant data."
        )
        return 1

    print("✅ No PID patterns found.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
