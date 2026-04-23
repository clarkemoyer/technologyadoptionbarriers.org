#!/usr/bin/env python3
"""
Find stale AWAITING REVIEW submissions that need operator attention.

Emits three buckets that the daily report and ad-hoc operator checks both
consume, based on the TABS policy that Prolific auto-APPROVES stale
submissions after its reserve timeout:

  1. STALE_NO_REPLY_TO_RR
     AWAITING REVIEW, `return_requested` set, > STALE_HOURS old, and no
     participant reply since `return_requested`. These are the reject
     candidates.

  2. STALE_NO_REPLY_TO_MESSAGE
     AWAITING REVIEW, `return_requested` NOT set, TABS has sent at least one
     message, last TABS message is > STALE_HOURS old, and no participant
     reply after that message. These are the candidates for an API-level
     request-return (the formal next step before rejection).

  3. IN_WINDOW
     Anything above that is still within the STALE_HOURS window, so leave
     alone until the window closes.

Engaged participants (any reply after our most recent action) are excluded
from all three buckets — they belong on the approve path.

Environment variables:
  PROLIFIC_API_TOKEN  - Prolific API token (required)
  STUDY_ID            - Prolific study ID (required)
  STALE_HOURS         - Age threshold in hours (default: 48)
  RESEARCHER_ID       - Prolific researcher user id (optional, has default)
  OUTPUT_JSON_PATH    - Optional path to write a machine-readable summary
                        that downstream workflow steps can consume.
"""

import json
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from tabs_api import (
    prolific_submissions,
    prolific_user_messages,
)

DEFAULT_RESEARCHER_ID = "68264cbfdeb62546fe6060fe"


def _require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        print(f"Error: {name} is required", file=sys.stderr)
        sys.exit(1)
    return value


def _parse_iso(ts):
    if not ts:
        return None
    return datetime.fromisoformat(ts.replace("Z", "+00:00"))


def _msg_time(m):
    t = _parse_iso(m.get("sent_at")) or _parse_iso(m.get("created_at"))
    return t or datetime.min.replace(tzinfo=timezone.utc)


def classify_submission(sub, msgs, researcher_id, now, cutoff):
    """Return (bucket_name, record_dict) or (None, None) if submission
    doesn't qualify for any bucket."""
    pid = sub.get("participant_id", "")
    if not pid or sub.get("status") != "AWAITING REVIEW":
        return None, None

    researcher_msgs = [m for m in msgs if m.get("sender_id") == researcher_id]
    participant_msgs = [m for m in msgs if m.get("sender_id") and m.get("sender_id") != researcher_id]
    rr = _parse_iso(sub.get("return_requested"))

    if rr is not None:
        replies_after_rr = [m for m in participant_msgs if _msg_time(m) > rr]
        if replies_after_rr:
            return None, None
        age_h = (now - rr).total_seconds() / 3600.0
        record = {
            "pid": pid,
            "age_hours": round(age_h, 1),
            "anchor": rr.isoformat(),
            "anchor_kind": "return_requested",
            "total_messages": len(msgs),
            "researcher_messages": len(researcher_msgs),
            "reasons": sub.get("return_requested_reasons") or [],
        }
        if rr < cutoff:
            return "stale_no_reply_to_rr", record
        return "in_window_rr", record

    # No return_requested — consider the latest researcher message
    if not researcher_msgs:
        return None, None
    last_msg_time = max(_msg_time(m) for m in researcher_msgs)
    replies_after_msg = [m for m in participant_msgs if _msg_time(m) > last_msg_time]
    if replies_after_msg:
        return None, None
    age_h = (now - last_msg_time).total_seconds() / 3600.0
    record = {
        "pid": pid,
        "age_hours": round(age_h, 1),
        "anchor": last_msg_time.isoformat(),
        "anchor_kind": "last_researcher_message",
        "total_messages": len(msgs),
        "researcher_messages": len(researcher_msgs),
    }
    if last_msg_time < cutoff:
        return "stale_no_reply_to_message", record
    return "in_window_msg", record


def _print_bucket(title, items):
    print(f"=== {title} ({len(items)}) ===")
    for r in sorted(items, key=lambda x: -x["age_hours"]):
        reasons = "; ".join(r.get("reasons", []))[:60]
        print(
            f"  {r['pid']}  age={r['age_hours']:6.1f}h  "
            f"msgs={r['total_messages']:>2} (rx={r['researcher_messages']})  "
            f"anchor={r['anchor_kind']}"
            + (f"  [{reasons}]" if reasons else "")
        )
    print()


def main():
    api_token = _require_env("PROLIFIC_API_TOKEN")
    study_id = _require_env("STUDY_ID")
    stale_hours = int(os.environ.get("STALE_HOURS", "48"))
    researcher_id = os.environ.get("RESEARCHER_ID", DEFAULT_RESEARCHER_ID)
    output_json = os.environ.get("OUTPUT_JSON_PATH")

    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(hours=stale_hours)

    print(f"Study: {study_id}")
    print(f"Stale threshold: {stale_hours}h (cutoff: {cutoff.isoformat()})")
    print()

    subs = prolific_submissions(study_id, api_token)
    print(f"Total submissions fetched: {len(subs)}")
    awaiting = [s for s in subs if s.get("status") == "AWAITING REVIEW"]
    print(f"AWAITING REVIEW: {len(awaiting)}")
    print()

    buckets = {
        "stale_no_reply_to_rr": [],
        "stale_no_reply_to_message": [],
        "in_window_rr": [],
        "in_window_msg": [],
    }

    for sub in awaiting:
        pid = sub.get("participant_id", "")
        if not pid:
            continue
        try:
            msgs = prolific_user_messages(pid, api_token)
        except Exception as e:
            print(f"  Warning: failed to fetch messages for {pid}: {e}", file=sys.stderr)
            msgs = []
        bucket, record = classify_submission(sub, msgs, researcher_id, now, cutoff)
        if bucket:
            buckets[bucket].append(record)

    _print_bucket(
        f"STALE_NO_REPLY_TO_RR (>{stale_hours}h since return_requested, no reply → reject)",
        buckets["stale_no_reply_to_rr"],
    )
    _print_bucket(
        f"STALE_NO_REPLY_TO_MESSAGE (>{stale_hours}h since last msg, no RR yet → request-return)",
        buckets["stale_no_reply_to_message"],
    )
    _print_bucket(
        f"IN_WINDOW / RR (≤{stale_hours}h since return_requested, no reply yet)",
        buckets["in_window_rr"],
    )
    _print_bucket(
        f"IN_WINDOW / MSG (≤{stale_hours}h since last msg, no RR yet)",
        buckets["in_window_msg"],
    )

    rr_pids = ",".join(r["pid"] for r in buckets["stale_no_reply_to_rr"])
    msg_pids = ",".join(r["pid"] for r in buckets["stale_no_reply_to_message"])
    print(f"STALE_NO_REPLY_TO_RR_PID_LIST={rr_pids}")
    print(f"STALE_NO_REPLY_TO_MESSAGE_PID_LIST={msg_pids}")

    if output_json:
        payload = {
            "study_id": study_id,
            "computed_at": now.isoformat(),
            "stale_hours": stale_hours,
            "counts": {k: len(v) for k, v in buckets.items()},
            "buckets": buckets,
        }
        Path(output_json).write_text(json.dumps(payload, indent=2), encoding="utf-8")
        print(f"\nWrote summary to {output_json}")


if __name__ == "__main__":
    main()
