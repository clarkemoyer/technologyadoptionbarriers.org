#!/usr/bin/env python3
"""Fetch Prolific auth checks and submission statuses for the analysis pipeline.

Reads environment variables:
  PROLIFIC_API_TOKEN  - Prolific API token (required)
  PROLIFIC_STUDY_ID   - Study ID (required)
  AUTH_OUTPUT         - Path to write auth checks CSV (default: /tmp/auth-checks.csv)
  STATUSES_OUTPUT     - Path to write statuses JSON (default: /tmp/statuses.json)
"""
import json
import os
import sys
from pathlib import Path

# Add analysis dir to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from tabs_api import prolific_auth_checks_csv, prolific_submission_statuses


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

    # Submission statuses
    statuses_output = os.environ.get("STATUSES_OUTPUT", "/tmp/statuses.json")
    statuses = prolific_submission_statuses(study_id, api_token)
    Path(statuses_output).parent.mkdir(parents=True, exist_ok=True)
    with open(statuses_output, "w") as f:
        json.dump(statuses, f)
    print(f"Statuses: {len(statuses)} submissions → {statuses_output}")


if __name__ == "__main__":
    main()
