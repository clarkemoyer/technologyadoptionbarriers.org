#!/usr/bin/env python3
"""
Prolific read-only utilities - Python replacements for TS scripts.

Replaces:
  - collect-prolific-data.ts     → collect (list studies or print submission status breakdown)
  - fetch-prolific-demographics.ts → demographics (fetch demographics CSV, requires OUTPUT_PATH)
  - check-all-messages.ts        → messages (conversations where participant replied, 7-day window)
  - check-participant-messages.ts → participant-msgs (all messages for a single PID)
  - find-url-reply.ts            → url-replies (participants who replied after receiving study URL)
  - list-replied-pids.ts         → replied-pids (PIDs awaiting review who replied, with PID_LIST)
  - fetch-qualtrics-questions.ts  → questions (fetch Qualtrics survey definition)

Usage:
  python prolific_tools.py <command>

Note:
  This PR switches workflows from the TS scripts to this Python CLI.
  The TS scripts are not deleted in this PR - they remain in scripts/
  as a rollback path. They will be removed in Phase 5 (#687) after
  production validation confirms the Python replacements work correctly.

Commands:
  collect          List studies or print submission status breakdown
  demographics     Fetch Prolific demographics CSV (requires OUTPUT_PATH)
  messages         Show conversations where participant replied (7-day window)
  participant-msgs Show messages for a specific participant (PID=...)
  url-replies      Find participants who replied after receiving study URL
  replied-pids     List replied PIDs awaiting review (emits PID_LIST for copy/paste)
  questions        Fetch Qualtrics survey questions

Environment:
  PROLIFIC_API_TOKEN, STUDY_ID (for Prolific commands)
  RESEARCHER_ID (optional, defaults to known researcher ID)
  QUALTRICS_API_TOKEN, QUALTRICS_BASE_URL, QUALTRICS_SURVEY_ID (for questions)
"""

import os
import re
import sys
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from tabs_api import (
    prolific_submissions,
    prolific_recent_messages,
    prolific_user_messages,
    prolific_study_info,
    prolific_list_studies,
    prolific_demographics_csv,
    qualtrics_survey_questions,
)

RESEARCHER_ID = os.environ.get("RESEARCHER_ID", "68264cbfdeb62546fe6060fe")


def _require_env(name: str) -> str:
    """Return a required environment variable or exit with a clear error."""
    value = os.environ.get(name)
    if not value:
        print(f"Error: required environment variable {name} is not set.", file=sys.stderr)
        sys.exit(1)
    return value


# ── collect ──────────────────────────────────────────────────

def cmd_collect():
    """List studies or print submission status breakdown."""
    token = _require_env("PROLIFIC_API_TOKEN")
    study_id = os.environ.get("STUDY_ID", "")

    if not study_id:
        studies = prolific_list_studies(token)
        print(f"Found {len(studies)} studies:\n")
        for s in studies:
            name = str(s.get("name") or "?")
            print(f"  {s.get('id', '?')}  {name[:60]}  status={s.get('status', '?')}")
        return

    study = prolific_study_info(study_id, token)
    print(f"Study: {study.get('name', study_id)}")
    print(f"Status: {study.get('status', '?')}")

    subs = prolific_submissions(study_id, token)
    print(f"Submissions: {len(subs)}")

    status_counts: dict[str, int] = {}
    for sub in subs:
        st = sub.get("status", "UNKNOWN")
        status_counts[st] = status_counts.get(st, 0) + 1

    print("\nStatus breakdown:")
    for st, count in sorted(status_counts.items(), key=lambda x: -x[1]):
        print(f"  {st}: {count}")


# ── demographics ─────────────────────────────────────────────

def cmd_demographics():
    """Fetch Prolific demographics CSV (requires OUTPUT_PATH)."""
    token = _require_env("PROLIFIC_API_TOKEN")
    study_id = _require_env("STUDY_ID")
    output_path = os.environ.get("OUTPUT_PATH")

    if not output_path:
        print(
            "Error: required environment variable OUTPUT_PATH is not set. "
            "Refusing to write demographics CSV to stdout (contains PII).",
            file=sys.stderr,
        )
        sys.exit(1)

    result = prolific_demographics_csv(study_id, token, output_path)
    if not result:
        print("Demographics export returned no data", file=sys.stderr)
        sys.exit(1)


# ── messages (matches check-all-messages.ts) ─────────────────

def cmd_messages():
    """Show conversations where participant replied (7-day window).

    Matches check-all-messages.ts: filters to channels with participant
    replies, shows status and time taken, uses 7-day window.
    """
    token = _require_env("PROLIFIC_API_TOKEN")
    study_id = _require_env("STUDY_ID")

    since = (datetime.utcnow() - timedelta(days=7)).isoformat() + "Z"
    messages = prolific_recent_messages(since, token, study_id)

    subs = prolific_submissions(study_id, token)
    sub_map = {s.get("participant_id", ""): s for s in subs}

    # Group by channel
    by_channel: dict[str, list] = defaultdict(list)
    for msg in messages:
        channel = msg.get("channel_id", "unknown")
        by_channel[channel].append(msg)

    for channel, msgs in sorted(by_channel.items()):
        # Only show channels where a participant replied
        participant_msgs = [m for m in msgs if m.get("sender_id") != RESEARCHER_ID]
        if not participant_msgs:
            continue

        pid = participant_msgs[0].get("sender_id", "?")
        sub = sub_map.get(pid, {})
        status = sub.get("status", "UNKNOWN")
        time_taken = sub.get("time_taken")
        time_str = f"{time_taken / 60:.1f} min" if time_taken else "N/A"

        print("=" * 40)
        print(f"PID: {pid}")
        print(f"Status: {status}")
        print(f"Time taken: {time_str}")
        print(f"Messages: {len(msgs)} ({len(participant_msgs)} from participant)")
        print()

        show_bodies = os.environ.get("SHOW_BODIES", "").lower() in ("1", "true", "yes")
        msgs.sort(key=lambda m: m.get("sent_at") or m.get("id") or "")
        for m in msgs:
            who = "RESEARCHER" if m.get("sender_id") == RESEARCHER_ID else "PARTICIPANT"
            ts = (m.get("sent_at") or m.get("created_at", ""))[:19]
            if show_bodies:
                body = (m.get("body", "") or "").replace("\n", " ")[:300]
                print(f"  [{ts}] [{who}] {body}")
            else:
                print(f"  [{ts}] [{who}] ({len(m.get('body', '') or '')} chars)")
        print()


# ── participant-msgs ─────────────────────────────────────────

def cmd_participant_messages():
    """Show messages for a specific participant."""
    token = _require_env("PROLIFIC_API_TOKEN")
    pid = os.environ.get("PID", "")
    if not pid:
        print("Error: PID environment variable required", file=sys.stderr)
        sys.exit(1)

    messages = prolific_user_messages(pid, token)
    print(f"Messages for {pid}: {len(messages)}\n")

    show_bodies = os.environ.get("SHOW_BODIES", "").lower() in ("1", "true", "yes")
    for msg in sorted(messages, key=lambda m: m.get("sent_at") or m.get("created_at") or ""):
        sender = msg.get("sender_id", "?")
        ts = (msg.get("sent_at") or msg.get("created_at", "?"))[:19]
        if show_bodies:
            body = msg.get("body", "")
            print(f"[{ts}] {sender}:")
            print(f"  {body}\n")
        else:
            body_len = len(msg.get("body", "") or "")
            print(f"[{ts}] {sender}: ({body_len} chars - set SHOW_BODIES=1 to display)")


# ── url-replies (matches find-url-reply.ts) ──────────────────

def cmd_url_replies():
    """Find participants who replied and received the study URL.

    Matches find-url-reply.ts: for each submission, checks per-participant
    message history for (1) researcher message containing the study domain,
    and (2) any participant reply exists. Note: the TS script does not
    check chronological ordering - it only checks both conditions exist.
    """
    token = _require_env("PROLIFIC_API_TOKEN")
    study_id = _require_env("STUDY_ID")

    subs = prolific_submissions(study_id, token)

    for sub in subs:
        pid = sub.get("participant_id", "")
        if not pid:
            continue

        try:
            msgs = prolific_user_messages(pid, token)
        except Exception as e:
            print(f"  Warning: failed to fetch messages for {pid}: {e}", file=sys.stderr)
            continue

        # Check if any researcher message contains the study URL
        has_url = any(
            m.get("sender_id") == RESEARCHER_ID
            and m.get("body")
            and "technologyadoptionbarriers.org" in m.get("body", "")
            for m in msgs
        )
        if not has_url:
            continue

        # Check if participant replied
        participant_msgs = [m for m in msgs if m.get("sender_id") != RESEARCHER_ID]
        if not participant_msgs:
            continue

        status = sub.get("status", "?")
        time_taken = sub.get("time_taken", 0) or 0
        print(f"=== {pid} | {status} | {time_taken / 60:.1f} min ===")
        for m in participant_msgs:
            body = (m.get("body", "") or "")[:250]
            print(f"  [PARTICIPANT] {body}")
        print()


# ── replied-pids (matches list-replied-pids.ts) ──────────────

def cmd_replied_pids():
    """List replied PIDs awaiting review with PID_LIST for copy/paste.

    Matches list-replied-pids.ts: 7-day window, filters participant replies,
    separates AWAITING REVIEW from already-actioned, emits PID_LIST.
    """
    token = _require_env("PROLIFIC_API_TOKEN")
    study_id = _require_env("STUDY_ID")

    since = (datetime.utcnow() - timedelta(days=7)).isoformat() + "Z"
    messages = prolific_recent_messages(since, token, study_id)

    subs = prolific_submissions(study_id, token)
    sub_map = {s.get("participant_id", ""): s for s in subs}

    # Find unique PIDs who replied (sender != researcher)
    replied_pids = set()
    for msg in messages:
        sender = msg.get("sender_id", "")
        if sender and sender != RESEARCHER_ID:
            replied_pids.add(sender)

    # Categorize by status
    awaiting_review = []
    other_status = []
    for pid in sorted(replied_pids):
        sub = sub_map.get(pid, {})
        status = sub.get("status", "UNKNOWN")
        time_taken = sub.get("time_taken", 0) or 0
        if status == "AWAITING REVIEW":
            awaiting_review.append(pid)
            print(f"APPROVE: {pid} ({time_taken / 60:.1f} min)")
        else:
            other_status.append(pid)
            print(f"SKIP: {pid} - already {status}")

    print()
    print(f"Total replied: {len(replied_pids)}")
    print(f"Awaiting review (to approve): {len(awaiting_review)}")
    print(f"Already actioned: {len(other_status)}")
    print()
    print(f"PID_LIST={','.join(awaiting_review)}")


# ── questions ────────────────────────────────────────────────

def cmd_questions():
    """Fetch Qualtrics survey questions."""
    token = _require_env("QUALTRICS_API_TOKEN")
    base_url = _require_env("QUALTRICS_BASE_URL")
    survey_id = _require_env("QUALTRICS_SURVEY_ID")

    questions = qualtrics_survey_questions(token, base_url, survey_id)

    if not questions:
        print("Error: no questions returned from Qualtrics API", file=sys.stderr)
        sys.exit(1)

    print(f"Questions: {len(questions)}\n")

    for qid, q in sorted(questions.items()):
        text = q.get("QuestionText", "")
        text = re.sub(r"<[^>]+>", "", text)[:80]
        qtype = q.get("QuestionType", "?")
        print(f"  {qid}: [{qtype}] {text}")


# ── CLI dispatch ─────────────────────────────────────────────

COMMANDS = {
    "collect": cmd_collect,
    "demographics": cmd_demographics,
    "messages": cmd_messages,
    "participant-msgs": cmd_participant_messages,
    "url-replies": cmd_url_replies,
    "replied-pids": cmd_replied_pids,
    "questions": cmd_questions,
}


def main():
    if len(sys.argv) < 2 or sys.argv[1] not in COMMANDS:
        print(f"Usage: python {sys.argv[0]} <command>")
        print(f"Commands: {', '.join(COMMANDS.keys())}")
        sys.exit(1)

    COMMANDS[sys.argv[1]]()


if __name__ == "__main__":
    main()
