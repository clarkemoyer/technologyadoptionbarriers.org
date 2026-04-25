#!/usr/bin/env python3
"""
Send a custom message to a specific participant.

Python port of scripts/send-custom-message.ts.

Environment variables:
  PROLIFIC_API_TOKEN  – Prolific API token (required)
  STUDY_ID            – Prolific study ID (required)
  PID                 – Participant ID to message (required)
  MESSAGE             – Message body to send (required)
  DRY_RUN             – When "false", send live (default: true)
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from tabs_api import prolific_send_message


def _require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        print(f"Error: {name} is required", file=sys.stderr)
        sys.exit(1)
    return value


def main():
    api_token = _require_env("PROLIFIC_API_TOKEN")
    study_id = _require_env("STUDY_ID")
    pid = _require_env("PID")
    message = _require_env("MESSAGE")
    dry_run = os.environ.get("DRY_RUN", "true").strip().lower() != "false"

    print(f"PID: {pid}")
    print(f"Message length: {len(message)} chars")
    print(f"Mode: {'DRY RUN' if dry_run else 'LIVE'}")
    print()
    print(f"Message: {message}")
    print()

    if dry_run:
        print("DRY RUN - message not sent")
    else:
        prolific_send_message(study_id, pid, message, api_token)
        print("Message sent successfully")


if __name__ == "__main__":
    main()
