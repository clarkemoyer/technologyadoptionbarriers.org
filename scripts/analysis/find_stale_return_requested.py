#!/usr/bin/env python3
"""
Find stale AWAITING REVIEW submissions that need operator attention.

Emits four buckets that the daily report and ad-hoc operator checks both
consume, based on the TABS policy that Prolific auto-APPROVES stale
submissions after its reserve timeout:

  1. `stale_no_reply_to_rr`
     AWAITING REVIEW, `return_requested` set, > STALE_HOURS old, and no
     participant reply since `return_requested`. These are the reject
     candidates.

  2. `stale_no_reply_to_message`
     AWAITING REVIEW, `return_requested` NOT set, TABS has sent at least one
     message, last TABS message is > STALE_HOURS old, and no participant
     reply after that message. These are the candidates for an API-level
     request-return (the formal next step before rejection).

  3. `in_window_rr`
     `return_requested` is set but still within the STALE_HOURS window, so
     leave alone until the window closes.

  4. `in_window_msg`
     TABS has sent a message but no return request yet, still within the
     STALE_HOURS window, so leave alone until the window closes.

Engaged participants (any reply after our most recent action) are excluded
from all four buckets — they belong on the approve path.

Submissions where the message-history API call fails are excluded from all
four recommendation buckets and reported separately via the
`fetch_errors`/`fetch_error_details` output fields — they should not be
assumed to have no reply.

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
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from tabs_api import (
    prolific_submissions,
    prolific_user_messages,
)

DEFAULT_RESEARCHER_ID = "68264cbfdeb62546fe6060fe"

# Delay between per-PID message API calls to stay well within Prolific's
# undocumented rate limits (observed ~5 req/s on shared plans; 0.2s gives ~3/s
# with some headroom and avoids bursting).
_API_CALL_DELAY = 0.2


def _require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        print(f"Error: {name} is required", file=sys.stderr)
        sys.exit(1)
    return value


def _parse_stale_hours() -> int:
    """Return the configured stale-hours threshold, or exit with a clear error."""
    raw = os.environ.get("STALE_HOURS")
    if raw is None:
        return 48
    try:
        return int(raw.strip())
    except (TypeError, ValueError):
        print(
            f"Invalid STALE_HOURS value: {raw!r}. "
            "Expected an integer number of hours, e.g. 48.",
            file=sys.stderr,
        )
        raise SystemExit(2)


def _parse_iso(ts):
    if not ts:
        return None
    try:
        return datetime.fromisoformat(ts.replace("Z", "+00:00"))
    except ValueError:
        return None


def _objectid_time(message_id):
    """Decode the embedded Unix timestamp from a 24-char hex MongoDB ObjectId.

    Prolific message IDs are MongoDB ObjectIds whose first 4 bytes (8 hex
    chars) encode the creation time as a Unix epoch. When ``sent_at`` and
    ``created_at`` are both absent or unparseable from the messages API
    response (observed across the bulk of FLAG-* / clarification messages,
    not just a few system records), this gives us a deterministic fallback
    ordering anchor — the same anchor the Prolific server itself uses
    internally for message creation.

    Reference: https://www.mongodb.com/docs/manual/reference/method/ObjectId/

    Returns ``None`` for inputs that don't look like a 24-char hex string,
    so callers can chain it after the explicit-timestamp fields.
    """
    if not isinstance(message_id, str) or len(message_id) < 8:
        return None
    try:
        ts = int(message_id[:8], 16)
    except ValueError:
        return None
    if ts <= 0:
        return None
    try:
        return datetime.fromtimestamp(ts, tz=timezone.utc)
    except (OSError, OverflowError, ValueError):
        return None


def _msg_time(m):
    """Return the best-effort timestamp for a message, or ``None`` if no
    fallback yields a parseable instant.

    Resolution order (most authoritative first):
      1. ``sent_at`` — explicit server-recorded send time
      2. ``created_at`` — explicit server-recorded creation time
      3. The 4-byte timestamp prefix of the message ``id`` (MongoDB
         ObjectId convention) — used because the Prolific messages API
         frequently returns ``sent_at`` and ``created_at`` as null/undefined
         for participant↔researcher messages, which previously caused this
         function to drop the message entirely. Dropping a participant
         message is consequential: the caller treats the PID as
         "no reply since RR" and queues it for rejection.
    """
    t = _parse_iso(m.get("sent_at")) or _parse_iso(m.get("created_at"))
    if t is None:
        t = _objectid_time(m.get("id"))
    return t


def classify_submission(sub, msgs, researcher_id, now, cutoff):
    """Return (bucket_name, record_dict) or (None, None) if submission
    doesn't qualify for any bucket.

    Messages with no valid timestamp are silently skipped when ordering
    against an anchor (return_requested or last researcher message). Since
    we cannot prove such a message was sent *after* our anchor, treating
    it as not-after is safe for reject/request-return classification.
    """
    pid = sub.get("participant_id", "")
    if not pid or sub.get("status") != "AWAITING REVIEW":
        return None, None

    researcher_msgs = [m for m in msgs if m.get("sender_id") == researcher_id]
    participant_msgs = [m for m in msgs if m.get("sender_id") and m.get("sender_id") != researcher_id]
    rr = _parse_iso(sub.get("return_requested"))

    if rr is not None:
        if any(
            (ts := _msg_time(m)) is not None and ts > rr
            for m in participant_msgs
        ):
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
    researcher_times = [t for t in (_msg_time(m) for m in researcher_msgs) if t is not None]
    if not researcher_times:
        return None, None
    last_msg_time = max(researcher_times)
    replies_after_msg = any(
        (ts := _msg_time(m)) is not None and ts > last_msg_time
        for m in participant_msgs
    )
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


def _fetch_messages_with_backoff(pid, api_token, max_retries=3):
    """Fetch messages for a PID with exponential backoff on transient errors.

    Returns ``(msgs, None)`` on success or ``(None, error_str)`` when all
    retries are exhausted.  Callers **must** treat a ``None`` return as a
    fetch error and skip classification rather than assuming no reply.
    """
    last_err = ""
    for attempt in range(max_retries):
        try:
            if attempt > 0:
                wait = min(2 ** attempt, 30)  # cap at 30s to avoid runaway delays
                print(
                    f"  Retry {attempt}/{max_retries - 1} for {pid} in {wait}s",
                    file=sys.stderr,
                )
                time.sleep(wait)
            msgs = prolific_user_messages(pid, api_token)
            return msgs, None
        except Exception as e:
            last_err = str(e)
    return None, last_err


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
    stale_hours = _parse_stale_hours()
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

    fetch_errors = []
    requests_made = 0
    skipped_no_pid = 0

    for sub in awaiting:
        pid = sub.get("participant_id", "")
        if not pid:
            skipped_no_pid += 1
            continue
        # Do not skip per-PID history fetches based solely on a recent reply.
        # A participant may have replied after the cutoff and still be stale
        # if TABS sent a later follow-up (message or return request) that the
        # participant never answered.  Full per-PID history is required to
        # determine whether they replied after our most recent action.
        # Small inter-call delay to avoid Prolific rate limiting.
        if requests_made > 0:
            time.sleep(_API_CALL_DELAY)
        msgs, err = _fetch_messages_with_backoff(pid, api_token)
        requests_made += 1
        if msgs is None:
            # Fetch failed — do not classify this PID.  Assuming "no reply"
            # here would risk a wrongful rejection if the participant had in
            # fact replied and the API call merely failed transiently.
            print(
                f"  Error: failed to fetch messages for {pid}: {err}",
                file=sys.stderr,
            )
            fetch_errors.append({"pid": pid, "error": err})
            continue
        try:
            bucket, record = classify_submission(sub, msgs, researcher_id, now, cutoff)
        except ValueError as exc:
            print(
                f"  Error: classification failed for {pid}: {exc}",
                file=sys.stderr,
            )
            fetch_errors.append({"pid": pid, "error": str(exc)})
            continue
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

    if fetch_errors:
        print(
            f"=== FETCH ERRORS ({len(fetch_errors)}) "
            f"— excluded from all recommendations ==="
        )
        for fe in fetch_errors:
            print(f"  {fe['pid']}: {fe['error']}")
        print()

    print(
        f"Message API requests: {requests_made} made, "
        f"{skipped_no_pid} skipped (no PID), "
        f"{len(fetch_errors)} errors"
    )
    print(f"STALE_NO_REPLY_TO_RR_PID_LIST={rr_pids}")
    print(f"STALE_NO_REPLY_TO_MESSAGE_PID_LIST={msg_pids}")

    if output_json:
        payload = {
            "study_id": study_id,
            "computed_at": now.isoformat(),
            "stale_hours": stale_hours,
            "counts": {k: len(v) for k, v in buckets.items()},
            "fetch_errors": len(fetch_errors),
            "fetch_error_details": fetch_errors,
            "buckets": buckets,
        }
        Path(output_json).write_text(json.dumps(payload, indent=2), encoding="utf-8")
        print(f"\nWrote summary to {output_json}")


if __name__ == "__main__":
    main()
