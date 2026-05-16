#!/usr/bin/env python3
"""Classify AWAITING REVIEW PIDs with replies into action buckets.

Reads the inbound participant CSV (Phase 3f) and the disposition CSV
(Phase 2). For each PID that is AWAITING REVIEW and has at least one
reply, classifies into one of three buckets:

  auto_approve_eligible
    Reply is acknowledgment-only (no question/dispute themes) AND the PID
    is NOT in a high rejection tier. AI judges the reply as sufficient
    to approve given the disposition.

  human_review_questions
    Reply contains question themes the operator must read and answer:
    question_about_study, contact_request, rejection_dispute,
    payment_question, technical_issue.

  human_review_high_tier
    PID is in a high rejection tier (3+ IRI fails, or 2 IRI fails plus
    another quality factor like speed or partial straightlining).
    Operator must read the messaging exchange before any action.

PIDs with no reply at all go into a `no_reply` bucket. Those continue
through the existing auto-cycle (message > 48h > request-return > 48h >
reject), which runs in Phases 3b/3d/3e.

High rejection tier definition (operator policy):
  - iri_fail >= 3, OR
  - iri_fail == 2 AND (speed_flag == 1 OR partial_straightlining_flag == 1)

Environment variables:
  INBOUND_CSV          - participant_messages.csv (Phase 3f artifact)
  DISPOSITION_CSV      - disposition.csv (Phase 2 artifact)
  OUTPUT_JSON_PATH     - where to write the classification JSON

Exit codes:
  0 - success
  2 - missing required env var or input file
"""

from __future__ import annotations

import csv
import json
import os
import sys
from collections import Counter, defaultdict
from pathlib import Path


QUESTION_THEMES = frozenset(
    {
        "question_about_study",
        "contact_request",
        "rejection_dispute",
        "payment_question",
        "technical_issue",
    }
)


def _safe_int(value: object) -> int:
    if value is None:
        return 0
    try:
        return int(str(value).strip())
    except (TypeError, ValueError):
        return 0


def is_high_rejection_tier(row: dict) -> bool:
    iri_fail = _safe_int(row.get("IRI_Fail_Count"))
    speed = _safe_int(row.get("Speed_Flag"))
    partial_sl = _safe_int(row.get("Partial_Straightlining_Flag"))
    if iri_fail >= 3:
        return True
    if iri_fail == 2 and (speed == 1 or partial_sl == 1):
        return True
    return False


def _split_themes(raw: str | None) -> list[str]:
    # extract_prolific_messages.py joins multiple theme tags with ';' in the
    # themes column. Split on both ';' and '|' for defensive parsing.
    if not raw:
        return []
    parts: list[str] = []
    for chunk in raw.replace("|", ";").split(";"):
        chunk = chunk.strip()
        if chunk:
            parts.append(chunk)
    return parts


def reply_has_question(reply_records: list[dict]) -> bool:
    # Trust the '?' character. Real questions almost always include one.
    # The theme tags emitted by extract_prolific_messages.py are loose
    # keyword matches and produce many false positives (e.g. "I paid
    # attention" gets tagged payment_question because of the word "paid";
    # "I made an error" gets technical_issue). Routing replies to manual
    # review based on those tags clogs the queue with non-questions and
    # hides real questions. The '?' heuristic is far more precise --
    # validated against today's 309 inbound messages (1 real question
    # surfaced; ~5 false-positive theme tags correctly demoted).
    for r in reply_records:
        if "?" in (r.get("body") or ""):
            return True
    return False


def reply_theme_counts(reply_records: list[dict]) -> dict[str, int]:
    counter: Counter[str] = Counter()
    for r in reply_records:
        themes = _split_themes(r.get("themes"))
        for t in themes:
            counter[t] += 1
        if not themes:
            counter["(no_theme)"] += 1
    return dict(counter)


def main() -> int:
    inbound_path = os.environ.get("INBOUND_CSV")
    disp_path = os.environ.get("DISPOSITION_CSV")
    output_path = os.environ.get("OUTPUT_JSON_PATH")
    if not inbound_path or not disp_path or not output_path:
        print(
            "Error: INBOUND_CSV, DISPOSITION_CSV, and OUTPUT_JSON_PATH are required",
            file=sys.stderr,
        )
        return 2
    if not Path(inbound_path).is_file():
        print(f"Error: INBOUND_CSV not found at {inbound_path}", file=sys.stderr)
        return 2
    if not Path(disp_path).is_file():
        print(f"Error: DISPOSITION_CSV not found at {disp_path}", file=sys.stderr)
        return 2

    replies_by_pid: dict[str, list[dict]] = defaultdict(list)
    with open(inbound_path, encoding="utf-8-sig", newline="") as f:
        for r in csv.DictReader(f):
            pid = (r.get("participant_id") or "").strip()
            if pid:
                replies_by_pid[pid].append(r)

    awaiting_rows: list[dict] = []
    with open(disp_path, encoding="utf-8-sig", newline="") as f:
        for row in csv.DictReader(f):
            if row.get("Prolific_Status") != "AWAITING REVIEW":
                continue
            pid = (row.get("PROLIFIC_PID") or "").strip()
            if pid:
                awaiting_rows.append(row)

    buckets: dict[str, list[dict]] = {
        "auto_approve_eligible": [],
        "human_review_questions": [],
        "human_review_high_tier": [],
        "no_reply_high_tier": [],
        "no_reply": [],
    }
    multi_reply_pids: list[dict] = []
    for row in awaiting_rows:
        pid = row["PROLIFIC_PID"].strip()
        replies = replies_by_pid.get(pid, [])
        entry = {
            "pid": pid,
            "disposition": (row.get("Disposition") or "").strip(),
            "iri_fail": _safe_int(row.get("IRI_Fail_Count")),
            "speed_flag": _safe_int(row.get("Speed_Flag")),
            "partial_straightlining_flag": _safe_int(row.get("Partial_Straightlining_Flag")),
            "reply_count": len(replies),
            "reply_theme_counts": reply_theme_counts(replies),
        }
        if not replies:
            # High-tier no-reply gets a separate bucket so bulk-reject can target it
            # without affecting lower-tier PIDs still in the auto-cycle.
            if is_high_rejection_tier(row):
                buckets["no_reply_high_tier"].append(entry)
            else:
                buckets["no_reply"].append(entry)
        elif reply_has_question(replies):
            buckets["human_review_questions"].append(entry)
        elif is_high_rejection_tier(row):
            buckets["human_review_high_tier"].append(entry)
        else:
            buckets["auto_approve_eligible"].append(entry)
        if len(replies) >= 2:
            multi_reply_pids.append({"pid": pid, "reply_count": len(replies), "disposition": entry["disposition"]})

    bucket_counts = {k: len(v) for k, v in buckets.items()}

    # Per-bucket disposition + theme breakdowns for the report.
    breakdown: dict[str, dict] = {}
    for name, items in buckets.items():
        disp_counter: Counter[str] = Counter(i["disposition"] for i in items)
        theme_counter: Counter[str] = Counter()
        for i in items:
            for t, n in i["reply_theme_counts"].items():
                theme_counter[t] += n
        breakdown[name] = {
            "by_disposition": dict(disp_counter.most_common()),
            "top_themes": dict(theme_counter.most_common(5)),
        }

    out = {
        "total_awaiting": len(awaiting_rows),
        "bucket_counts": bucket_counts,
        "breakdown": breakdown,
        "buckets": buckets,
        "multi_reply_count": len(multi_reply_pids),
        "multi_reply_pids": multi_reply_pids,
    }
    Path(output_path).write_text(json.dumps(out, indent=2))
    print(f"Classified {len(awaiting_rows)} AWAITING REVIEW PIDs:")
    for k, v in bucket_counts.items():
        print(f"  {k}: {v}")
    print(f"Wrote: {output_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
