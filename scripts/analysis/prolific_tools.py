#!/usr/bin/env python3
"""
Prolific read-only utilities — Python replacements for TS scripts.

Replaces:
  - collect-prolific-data.ts     → prolific_collect
  - fetch-prolific-auth-checks.ts → (already in tabs_api.py)
  - fetch-prolific-demographics.ts → (already in tabs_api.py)
  - check-all-messages.ts        → prolific_all_messages
  - check-participant-messages.ts → prolific_participant_messages
  - find-url-reply.ts            → prolific_find_url_replies
  - list-replied-pids.ts         → prolific_replied_pids
  - fetch-qualtrics-questions.ts  → qualtrics_questions

Usage:
  python prolific_tools.py <command> [options]

Commands:
  collect          List studies or export submissions for a study
  messages         Show recent messages grouped by participant
  participant-msgs Show messages for a specific participant (PID=...)
  url-replies      Find participants who replied with URLs
  replied-pids     List PIDs who replied to messages
  questions        Fetch Qualtrics survey questions

Environment:
  PROLIFIC_API_TOKEN, STUDY_ID (for Prolific commands)
  QUALTRICS_API_TOKEN, QUALTRICS_BASE_URL, QUALTRICS_SURVEY_ID (for questions)
"""

import json
import os
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
    prolific_submission_statuses,
    prolific_list_studies,
    prolific_demographics_csv,
    qualtrics_survey_questions,
)


def _require_env(name: str) -> str:
    """Return a required environment variable or exit with a clear error."""
    value = os.environ.get(name)
    if not value:
        print(f"Error: required environment variable {name} is not set.", file=sys.stderr)
        sys.exit(1)
    return value


# ── collect ──────────────────────────────────────────────────

def cmd_collect():
    """List studies or export submissions (replaces collect-prolific-data.ts)."""
    token = _require_env("PROLIFIC_API_TOKEN")
    study_id = os.environ.get("STUDY_ID", "")

    if not study_id:
        studies = prolific_list_studies(token)
        print(f"Found {len(studies)} studies:\n")
        for s in studies:
            print(f"  {s.get('id', '?')}  {s.get('name', '?')[:60]}  status={s.get('status', '?')}")
        return

    # Get study info
    study = prolific_study_info(study_id, token)
    print(f"Study: {study.get('name', study_id)}")
    print(f"Status: {study.get('status', '?')}")

    # Get submissions
    subs = prolific_submissions(study_id, token)
    print(f"Submissions: {len(subs)}")

    # Count by status
    status_counts: dict[str, int] = {}
    for sub in subs:
        st = sub.get("status", "UNKNOWN")
        status_counts[st] = status_counts.get(st, 0) + 1

    print("\nStatus breakdown:")
    for st, count in sorted(status_counts.items(), key=lambda x: -x[1]):
        print(f"  {st}: {count}")


# ── demographics ─────────────────────────────────────────────

def cmd_demographics():
    """Fetch Prolific demographics CSV (replaces fetch-prolific-demographics.ts)."""
    token = _require_env("PROLIFIC_API_TOKEN")
    study_id = _require_env("STUDY_ID")
    output_path = os.environ.get("OUTPUT_PATH", "")

    result = prolific_demographics_csv(study_id, token, output_path or "/dev/stdout")
    if not result:
        print("Demographics export returned no data", file=sys.stderr)
        sys.exit(1)


# ── messages ─────────────────────────────────────────────────

def cmd_messages():
    """Show recent messages grouped by participant (replaces check-all-messages.ts)."""
    token = _require_env("PROLIFIC_API_TOKEN")
    study_id = _require_env("STUDY_ID")

    since = (datetime.utcnow() - timedelta(days=30)).isoformat() + "Z"
    messages = prolific_recent_messages(since, token, study_id)

    # Group by channel_id (conversation)
    by_channel: dict[str, list] = defaultdict(list)
    for msg in messages:
        channel = msg.get("channel_id", "unknown")
        by_channel[channel].append(msg)

    print(f"Messages in last 30 days: {len(messages)}")
    print(f"Conversations: {len(by_channel)}\n")

    for channel, msgs in sorted(by_channel.items()):
        print(f"--- Channel {channel} ({len(msgs)} messages) ---")
        for msg in sorted(msgs, key=lambda m: m.get("created_at", "")):
            sender = msg.get("sender_id", "?")
            body = msg.get("body", "")[:100]
            created = msg.get("created_at", "?")[:19]
            print(f"  [{created}] {sender}: {body}")
        print()


# ── participant-msgs ─────────────────────────────────────────

def cmd_participant_messages():
    """Show messages for a specific participant (replaces check-participant-messages.ts)."""
    token = _require_env("PROLIFIC_API_TOKEN")
    pid = os.environ.get("PID", "")
    if not pid:
        print("ERROR: PID environment variable required")
        sys.exit(1)

    messages = prolific_user_messages(pid, token)
    print(f"Messages for {pid}: {len(messages)}\n")

    for msg in sorted(messages, key=lambda m: m.get("created_at", "")):
        sender = msg.get("sender_id", "?")
        body = msg.get("body", "")
        created = msg.get("created_at", "?")[:19]
        print(f"[{created}] {sender}:")
        print(f"  {body}\n")


# ── url-replies ──────────────────────────────────────────────

def cmd_url_replies():
    """Find participants who replied with URLs (replaces find-url-reply.ts)."""
    import re
    token = _require_env("PROLIFIC_API_TOKEN")
    study_id = _require_env("STUDY_ID")

    subs = prolific_submissions(study_id, token)
    pid_to_status = {s.get("participant_id", ""): s.get("status", "") for s in subs}

    since = (datetime.utcnow() - timedelta(days=30)).isoformat() + "Z"
    messages = prolific_recent_messages(since, token, study_id)

    url_pattern = re.compile(r"https?://\S+", re.IGNORECASE)
    found = []
    for msg in messages:
        body = msg.get("body", "")
        if url_pattern.search(body):
            sender = msg.get("sender_id", "?")
            found.append({
                "sender": sender,
                "status": pid_to_status.get(sender, "?"),
                "url": url_pattern.search(body).group(),
                "body": body[:200],
            })

    print(f"Messages containing URLs: {len(found)}\n")
    for f in found:
        print(f"  PID: {f['sender']} ({f['status']})")
        print(f"  URL: {f['url']}")
        print(f"  Body: {f['body'][:100]}\n")


# ── replied-pids ─────────────────────────────────────────────

def cmd_replied_pids():
    """List PIDs who replied to messages (replaces list-replied-pids.ts)."""
    token = _require_env("PROLIFIC_API_TOKEN")
    study_id = _require_env("STUDY_ID")
    researcher_id = os.environ.get("RESEARCHER_ID", "68264cbfdeb62546fe6060fe")

    since = (datetime.utcnow() - timedelta(days=7)).isoformat() + "Z"
    messages = prolific_recent_messages(since, token, study_id)

    # Find messages NOT from the researcher (= participant replies)
    participant_replies = [m for m in messages if m.get("sender_id") != researcher_id]

    replied_pids = set()
    for msg in participant_replies:
        replied_pids.add(msg.get("sender_id", ""))

    replied_pids.discard("")

    subs = prolific_submissions(study_id, token)
    pid_to_status = {s.get("participant_id", ""): s.get("status", "") for s in subs}

    print(f"Participants who replied (last 7 days): {len(replied_pids)}\n")
    for pid in sorted(replied_pids):
        print(f"  {pid}  ({pid_to_status.get(pid, 'unknown')})")


# ── questions ────────────────────────────────────────────────

def cmd_questions():
    """Fetch Qualtrics survey questions (replaces fetch-qualtrics-questions.ts)."""
    token = os.environ["QUALTRICS_API_TOKEN"]
    base_url = os.environ["QUALTRICS_BASE_URL"]
    survey_id = os.environ["QUALTRICS_SURVEY_ID"]

    definition = qualtrics_survey_questions(token, base_url, survey_id)
    questions = definition.get("Questions", {})

    print(f"Survey: {definition.get('SurveyName', survey_id)}")
    print(f"Questions: {len(questions)}\n")

    for qid, q in sorted(questions.items()):
        text = q.get("QuestionText", "")
        # Strip HTML tags
        import re
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
