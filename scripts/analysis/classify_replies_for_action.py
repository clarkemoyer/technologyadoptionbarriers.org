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

High-tier no-reply PIDs are split further using the Phase 3c stale-triage
buckets (issue #3012). `reject_by_pid.py` revalidates every PID against
live Prolific state and only rejects bucket `stale_no_reply_to_rr`, so
recommending anything else for bulk-reject produces a guaranteed no-op
(e.g. a PID the same pipeline run just messaged is `in_window_msg` and
gets skipped). To keep the report's recommendation and the executor's
guard in agreement:

  no_reply_high_tier
    High tier, no reply, AND stale-triage bucket `stale_no_reply_to_rr`.
    These are genuinely bulk-reject-eligible right now.

  no_reply_high_tier_in_window
    High tier, no reply, but still inside the message/RR reply window
    (or not yet messaged / not yet return-requested). NOT bulk-reject-
    eligible; the auto-cycle is handling them. Each entry carries the
    stale-triage bucket and an `earliest_eligible_at` estimate.

When STALE_TRIAGE_JSON is not provided (or unreadable) the split cannot
be computed and all high-tier no-reply PIDs land in `no_reply_high_tier`
(legacy behavior); the output flags `stale_triage_available: false` so
the report can caveat the recommendation.

High rejection tier definition (operator policy):
  - iri_fail >= 3, OR
  - iri_fail == 2 AND (speed_flag == 1 OR partial_straightlining_flag == 1)

Environment variables:
  INBOUND_CSV          - participant_messages.csv (Phase 3f artifact)
  DISPOSITION_CSV      - disposition.csv (Phase 2 artifact)
  STALE_TRIAGE_JSON    - stale-triage.json (Phase 3c artifact, optional)
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
from datetime import datetime, timedelta
from pathlib import Path


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


def load_stale_triage(path: str | None) -> dict | None:
    """Load Phase 3c's stale-triage.json and index records by PID.

    Returns None when the file is absent or unreadable — callers fall back
    to legacy (unsplit) behavior. Returns a dict:
      {"by_pid": {pid: (bucket_name, record)}, "stale_hours": float,
       "message_stale_hours": float}
    """
    if not path:
        return None
    p = Path(path)
    if not p.is_file():
        return None
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
        by_pid: dict[str, tuple[str, dict]] = {}
        for bucket_name, records in (data.get("buckets") or {}).items():
            for rec in records or []:
                pid = (rec.get("pid") or "").strip()
                if pid:
                    by_pid[pid] = (bucket_name, rec)
        return {
            "by_pid": by_pid,
            "stale_hours": float(data.get("stale_hours") or 48),
            "message_stale_hours": float(
                data.get("message_stale_hours") or data.get("stale_hours") or 48
            ),
        }
    except (OSError, ValueError, TypeError) as e:
        print(f"::warning::could not read STALE_TRIAGE_JSON at {path}: {e}", file=sys.stderr)
        return None


def _earliest_eligible_at(
    stale_bucket: str | None, record: dict | None, stale_hours: float, message_stale_hours: float
) -> str | None:
    """Estimate when an in-window high-tier PID becomes bulk-reject-eligible.

    Mirrors the auto-cycle stages in find_stale_return_requested.py:
      in_window_rr             -> anchor + stale_hours (reject window on the RR)
      stale_no_reply_to_message-> RR is imminent (Phase 3d), then + stale_hours
      in_window_msg            -> anchor + message_stale_hours (msg window)
                                  + stale_hours (subsequent RR window)
    Unknown/absent bucket (never messaged, fetch error) -> None.
    """
    if not stale_bucket or record is None:
        return None
    anchor_raw = record.get("anchor")
    try:
        anchor = datetime.fromisoformat(anchor_raw) if anchor_raw else None
    except (ValueError, TypeError):
        anchor = None
    if anchor is None:
        return None
    if stale_bucket == "in_window_rr":
        return (anchor + timedelta(hours=stale_hours)).isoformat()
    if stale_bucket == "stale_no_reply_to_message":
        # Phase 3d sends the return request this run; the RR anchor is
        # approximately now (≈ anchor + age_hours).  Using message_stale_hours
        # as the offset underestimates eligibility whenever the message is
        # older than the message window (age_hours > message_stale_hours),
        # which is the common case for this bucket.  age_hours reflects the
        # actual elapsed time, so the estimate is anchor + age_hours + stale_hours.
        age_hours = float(record.get("age_hours") or message_stale_hours)
        return (anchor + timedelta(hours=age_hours + stale_hours)).isoformat()
    if stale_bucket == "in_window_msg":
        return (anchor + timedelta(hours=message_stale_hours + stale_hours)).isoformat()
    return None


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
    stale_triage = load_stale_triage(os.environ.get("STALE_TRIAGE_JSON"))
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
    total_rows = 0
    saw_pid_column = False
    saw_status_column = False
    with open(disp_path, encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            total_rows += 1
            if "PROLIFIC_PID" in row:
                saw_pid_column = True
            if "Prolific_Status" in row:
                saw_status_column = True
            if row.get("Prolific_Status") != "AWAITING REVIEW":
                continue
            pid = (row.get("PROLIFIC_PID") or "").strip()
            if pid:
                awaiting_rows.append(row)

    # Sanity check: if the CSV has rows but our column lookups returned
    # nothing, the schema has probably changed and we're silently producing
    # empty buckets. Emit a workflow warning so the daily report job surfaces
    # it instead of shipping a blank Replies-to-Consider section without
    # explanation. Use the GitHub Actions warning format so it shows up in
    # the job summary.
    if total_rows > 0 and not awaiting_rows:
        missing = []
        if not saw_pid_column:
            missing.append("PROLIFIC_PID")
        if not saw_status_column:
            missing.append("Prolific_Status")
        if missing:
            print(
                f"::warning::disposition CSV had {total_rows} row(s) but missing column(s) "
                f"{missing!r}; produced no AWAITING REVIEW classifications. Did the disposition "
                "CSV schema change?",
                file=sys.stderr,
            )
        else:
            print(
                f"::warning::disposition CSV had {total_rows} row(s) but none had "
                "Prolific_Status='AWAITING REVIEW'; produced no classifications. Either the "
                "queue is empty or upstream filtering changed.",
                file=sys.stderr,
            )

    buckets: dict[str, list[dict]] = {
        "auto_approve_eligible": [],
        "human_review_questions": [],
        "human_review_high_tier": [],
        "no_reply_high_tier": [],
        "no_reply_high_tier_in_window": [],
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
                if stale_triage is None:
                    # Legacy behavior: no stale-triage data, can't split.
                    buckets["no_reply_high_tier"].append(entry)
                else:
                    stale_bucket, stale_rec = stale_triage["by_pid"].get(pid, (None, None))
                    entry["stale_bucket"] = stale_bucket or "(not classified)"
                    if stale_bucket == "stale_no_reply_to_rr":
                        # The only bucket reject_by_pid.py will actually
                        # reject — genuinely bulk-reject-eligible (#3012).
                        buckets["no_reply_high_tier"].append(entry)
                    else:
                        entry["earliest_eligible_at"] = _earliest_eligible_at(
                            stale_bucket,
                            stale_rec,
                            stale_triage["stale_hours"],
                            stale_triage["message_stale_hours"],
                        )
                        buckets["no_reply_high_tier_in_window"].append(entry)
            else:
                buckets["no_reply"].append(entry)
        elif is_high_rejection_tier(row):
            # High-tier wins over question detection. The operator policy is that
            # 3+ IRI fails or 2 IRI + factor always requires reading the messaging
            # exchange before any action -- even if the reply contains a question,
            # the high-tier disposition warrants the more cautious review path.
            buckets["human_review_high_tier"].append(entry)
        elif reply_has_question(replies):
            buckets["human_review_questions"].append(entry)
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
        "stale_triage_available": stale_triage is not None,
    }
    Path(output_path).write_text(json.dumps(out, indent=2))
    print(f"Classified {len(awaiting_rows)} AWAITING REVIEW PIDs:")
    for k, v in bucket_counts.items():
        print(f"  {k}: {v}")
    print(f"Wrote: {output_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
