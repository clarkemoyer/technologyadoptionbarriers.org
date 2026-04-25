#!/usr/bin/env python3
"""Generate GitHub step summary markdown from analysis JSON output.

Design contract - aggregate counts only
----------------------------------------
This script intentionally emits *only* aggregate statistics (sample Ns,
disposition counts).  It must never include per-participant data such as
Prolific PIDs or Qualtrics response IDs.  The output is written directly to
$GITHUB_STEP_SUMMARY and appears in the public GitHub Actions UI.

A runtime guard (see ``_assert_no_pids``) verifies that no 24-char hex
strings (the Prolific PID/study-ID format) appear in the generated output.
"""

import json
import re
import sys

# 24 lowercase hex characters - matches Prolific PID / study ID format.
_PID_RE = re.compile(r"[0-9a-f]{24}")


def _assert_no_pids(text: str) -> None:
    """Raise RuntimeError if *text* contains any 24-char hex string.

    This is a defence-in-depth guard to ensure the step summary never
    accidentally leaks a participant identifier into the public workflow UI.
    Only the count and unique count are reported - no match fragments.
    """
    matches = _PID_RE.findall(text)
    if matches:
        unique_count = len(set(matches))
        raise RuntimeError(
            f"Step summary contains {len(matches)} potential PID match(es) "
            f"across {unique_count} unique value(s). "
            "Aborting to prevent accidental data exposure in the public Actions UI."
        )


def generate_summary(data: dict) -> str:
    """Return markdown summary text for *data*.  Only aggregate counts."""
    lines: list[str] = []

    if "samples" in data:
        # sensitivity-analysis.json
        lines.append("#### Sample Definitions")
        lines.append("")
        lines.append("| Sample | N |")
        lines.append("| --- | ---: |")
        for s in data["samples"]:
            lines.append(f"| {s['label']} | {s['n']} |")
    elif "disposition_counts" in data:
        # data-audit.json
        lines.append("")
        lines.append("| Disposition | Count |")
        lines.append("| --- | ---: |")
        for d, c in sorted(data["disposition_counts"].items(), key=lambda x: -x[1]):
            lines.append(f"| {d} | {c} |")

    return "\n".join(lines)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(0)

    with open(sys.argv[1]) as f:
        data = json.load(f)

    summary = generate_summary(data)
    try:
        _assert_no_pids(summary)  # defence-in-depth: block any accidental PID leak
    except RuntimeError as exc:
        print(f"⛔ {exc}", file=sys.stderr)
        sys.exit(1)
    print(summary)
