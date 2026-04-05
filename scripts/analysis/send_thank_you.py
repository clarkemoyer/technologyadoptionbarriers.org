#!/usr/bin/env python3
"""
Send a thank-you message to approved participants.

Python port of scripts/send-thank-you-message.ts.

Environment variables:
  PROLIFIC_API_TOKEN  – Prolific API token (required)
  STUDY_ID            – Prolific study ID (required)
  PID_LIST            – Comma-separated PIDs to message (required)
  DRY_RUN             – When "false", send messages live (default: true)
"""

import os
import sys
from pathlib import Path
from typing import Dict, List

sys.path.insert(0, str(Path(__file__).parent))

from tabs_api import (
    prolific_send_message,
    prolific_submissions,
    prolific_user_messages,
)

THANK_YOU_MESSAGE = (
    "Hi, thank you for participating in our Technology Adoption Barriers Survey "
    "and for taking the time to respond to our review message. Your submission "
    "has been approved. We appreciate your thoughtful engagement and the insights "
    "you shared — they are valuable to our research. Thank you again for your "
    "contribution!"
)

SIGNATURE = "Your submission has been approved"


def _require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        print(f"Error: {name} is required", file=sys.stderr)
        sys.exit(1)
    return value


def send_thank_you_to_pids(
    pids: List[str],
    study_id: str,
    api_token: str,
    dry_run: bool = True,
) -> Dict[str, int]:
    """Send thank-you messages to a list of participant IDs.

    Skips participants who are not APPROVED or have already received the
    thank-you message (dedup via message history check).

    Args:
        pids: Participant IDs to message.
        study_id: Prolific study ID.
        api_token: Prolific API token.
        dry_run: When True, log what would be sent without sending.

    Returns:
        Dict with counts: sent, skipped (already sent), skipped_not_approved,
        not_found, failed.
    """
    # Order-preserving dedup: prevent duplicate API calls if caller passes duplicate PIDs
    seen: set = set()
    pids = [p for p in pids if not (p in seen or seen.add(p))]  # type: ignore[func-returns-value]

    print(f"Sending thank-you messages to {len(pids)} participants")
    print(f"Mode: {'DRY RUN' if dry_run else 'LIVE'}")
    print()

    # Fetch fresh submission statuses
    print("Fetching submission statuses...")
    subs = prolific_submissions(study_id, api_token)
    status_map = {s.get("participant_id", ""): s.get("status", "") for s in subs}
    print(f"Loaded {len(status_map)} statuses")
    print()

    sent = 0
    skipped = 0
    skipped_not_approved = 0
    not_found = 0
    failed = 0

    for pid in pids:
        try:
            # Require explicit APPROVED status — skip if missing or non-APPROVED
            status = status_map.get(pid)
            if not status:
                not_found += 1
                print(f"  SKIP {pid} — not found in study submissions")
                continue
            if status != "APPROVED":
                skipped_not_approved += 1
                print(f"  SKIP {pid} — status is {status} (not APPROVED)")
                continue

            # Check for existing thank-you message (dedup)
            existing = prolific_user_messages(pid, api_token)
            already_sent = any(
                (m.get("data") or {}).get("study_id") == study_id
                and SIGNATURE in (m.get("body") or "")
                for m in existing
            )
            if already_sent:
                print(f"  SKIP {pid} — already received thank-you")
                skipped += 1
                continue

            if dry_run:
                print(f"  DRY RUN: would message {pid}")
                sent += 1
            else:
                prolific_send_message(study_id, pid, THANK_YOU_MESSAGE, api_token)
                print(f"  SENT {pid}")
                sent += 1
        except Exception as e:
            print(f"  FAILED {pid}: {e}")
            failed += 1

    print()
    print(
        f"SENT: {sent} | NOT FOUND: {not_found} | SKIPPED (not approved): {skipped_not_approved} "
        f"| SKIPPED (already sent): {skipped} | FAILED: {failed}"
    )

    return {
        "sent": sent,
        "skipped": skipped,
        "skipped_not_approved": skipped_not_approved,
        "not_found": not_found,
        "failed": failed,
    }


def main():
    api_token = _require_env("PROLIFIC_API_TOKEN")
    study_id = _require_env("STUDY_ID")
    pid_list_raw = _require_env("PID_LIST")
    dry_run = os.environ.get("DRY_RUN", "true").strip().lower() != "false"

    pids = [p.strip() for p in pid_list_raw.split(",") if p.strip()]
    send_thank_you_to_pids(pids, study_id, api_token, dry_run)


if __name__ == "__main__":
    main()
