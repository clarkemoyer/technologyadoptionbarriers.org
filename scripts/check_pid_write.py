#!/usr/bin/env python3
"""PreToolUse safety hook: block writes to src/data/ that contain PROLIFIC_PID patterns.

Claude Code calls this script before any Write, Edit, or MultiEdit tool use.
The tool input is provided as JSON on stdin.  If a PID pattern is detected
in content destined for src/data/, the script exits with code 2 to block the
write and prints a human-readable reason to stderr.

Exit codes:
  0  – allow the tool call to proceed
  2  – block the tool call (Claude treats this as a hard stop)
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import PurePosixPath

# Patterns that identify participant-level data that must not reach src/data/.
#
# We intentionally do NOT flag bare 24-char hex strings because the Prolific
# study ID (a MongoDB ObjectId) is stored in disposition-summary.json and is
# *not* a participant identifier.  Instead we look for:
#   1. The literal column header / field name PROLIFIC_PID (any case).
#   2. A JSON array containing 3 or more 24-char hex strings in sequence —
#      this indicates a list of participant IDs rather than a single study ID.
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

# Only gate writes that target this directory tree.
_PROTECTED_PREFIX = "src/data/"


def _is_protected_path(path: str) -> bool:
    """Return True if *path* falls under the protected src/data/ directory."""
    # Normalise to forward slashes and strip leading ./
    normalised = PurePosixPath(path.replace("\\", "/")).as_posix().lstrip("./")
    return normalised.startswith(_PROTECTED_PREFIX)


def _scan_for_pids(content: str) -> list[str]:
    """Return a list of human-readable descriptions of any PID matches found."""
    hits: list[str] = []
    for pattern, description in _PID_PATTERNS:
        if pattern.search(content):
            hits.append(description)
    return hits


def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        # If we can't parse the input, allow the tool call (fail-open).
        return 0

    tool_name: str = payload.get("tool_name", "")
    tool_input: dict = payload.get("tool_input", {})

    # Determine which file(s) are being written.
    paths_and_contents: list[tuple[str, str]] = []

    if tool_name == "Write":
        path = tool_input.get("path") or tool_input.get("file_path", "")
        content = tool_input.get("content", "")
        if path:
            paths_and_contents.append((path, content))

    elif tool_name in ("Edit", "MultiEdit"):
        path = tool_input.get("path") or tool_input.get("file_path", "")
        # For Edit the new content is in new_string; for MultiEdit it's a list of edits.
        edits = tool_input.get("edits", [])
        new_string = tool_input.get("new_string", "")
        combined_content = new_string + " ".join(
            e.get("new_string", "") for e in edits if isinstance(e, dict)
        )
        if path:
            paths_and_contents.append((path, combined_content))

    blocked_reasons: list[str] = []
    for path, content in paths_and_contents:
        if not _is_protected_path(path):
            continue
        hits = _scan_for_pids(content)
        if hits:
            blocked_reasons.append(
                f"  {path}: contains {', '.join(hits)}"
            )

    if blocked_reasons:
        print(
            "BLOCKED by PreToolUse safety hook:\n"
            "Attempted to write PROLIFIC_PID or PID-like patterns into src/data/.\n"
            "src/data/ files are committed to the public repository and must contain\n"
            "only aggregate statistics — never participant-level identifiers.\n\n"
            "Flagged write(s):\n" + "\n".join(blocked_reasons),
            file=sys.stderr,
        )
        return 2

    return 0


if __name__ == "__main__":
    sys.exit(main())
