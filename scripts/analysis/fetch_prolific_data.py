#!/usr/bin/env python3
"""Fetch Prolific auth checks and submission statuses for the analysis pipeline.

Reads environment variables:
  PROLIFIC_API_TOKEN  - Prolific API token (required)
  PROLIFIC_STUDY_ID   - Study ID (required)
  AUTH_OUTPUT         - Path to write auth checks CSV (default: /tmp/auth-checks.csv)
  STATUSES_OUTPUT     - Path to write statuses JSON (default: /tmp/statuses.json)

The statuses JSON now stores the full submission summary per PID:
  {"<pid>": {"status": "...", "completed_at": "...", "started_at": "..."}, ...}

The richer payload feeds the enrichment + disposition steps so every
downstream consumer can reason about Prolific's 21-day auto-approve clock
without making its own API call. Older callers that only read the status
string are kept compatible by ``load_statuses`` in
``enrich_qualtrics_csv.py``.
"""
import json
import os
import sys
from pathlib import Path

# Add analysis dir to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from tabs_api import prolific_auth_checks_csv, prolific_submission_summaries


def main():
    api_token = os.environ.get("PROLIFIC_API_TOKEN")
    if not api_token:
        print("Error: PROLIFIC_API_TOKEN environment variable is required", file=sys.stderr)
        sys.exit(1)

    study_id = os.environ.get("PROLIFIC_STUDY_ID")
    if not study_id:
        print("Error: PROLIFIC_STUDY_ID environment variable is required", file=sys.stderr)
        sys.exit(1)

    # Auth checks
    auth_output = os.environ.get("AUTH_OUTPUT", "/tmp/auth-checks.csv")
    prolific_auth_checks_csv(study_id, api_token, auth_output)

    # Submission summaries (status + completed_at + started_at per PID)
    statuses_output = os.environ.get("STATUSES_OUTPUT", "/tmp/statuses.json")
    summaries = prolific_submission_summaries(study_id, api_token)
    Path(statuses_output).parent.mkdir(parents=True, exist_ok=True)
    with open(statuses_output, "w") as f:
        json.dump(summaries, f)
    print(f"Statuses: {len(summaries)} submissions → {statuses_output}")


if __name__ == "__main__":
    main()
