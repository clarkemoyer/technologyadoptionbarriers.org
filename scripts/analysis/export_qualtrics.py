#!/usr/bin/env python3
"""Export Qualtrics survey responses for the analysis pipeline.

Reads environment variables:
  QUALTRICS_API_TOKEN   - Qualtrics API token (required)
  QUALTRICS_BASE_URL    - Qualtrics base URL (required)
  QUALTRICS_SURVEY_ID   - Survey ID (required)
  OUTPUT_PATH           - Path to write CSV (default: /tmp/qualtrics-raw.csv)
"""
import os
import sys
from pathlib import Path

# Add analysis dir to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from tabs_api import qualtrics_export_csv


def main():
    api_token = os.environ.get("QUALTRICS_API_TOKEN")
    if not api_token:
        print("Error: QUALTRICS_API_TOKEN environment variable is required", file=sys.stderr)
        sys.exit(1)

    base_url = os.environ.get("QUALTRICS_BASE_URL")
    if not base_url:
        print("Error: QUALTRICS_BASE_URL environment variable is required", file=sys.stderr)
        sys.exit(1)

    survey_id = os.environ.get("QUALTRICS_SURVEY_ID")
    if not survey_id:
        print("Error: QUALTRICS_SURVEY_ID environment variable is required", file=sys.stderr)
        sys.exit(1)

    output_path = os.environ.get("OUTPUT_PATH", "/tmp/qualtrics-raw.csv")
    qualtrics_export_csv(api_token, base_url, survey_id, output_path)


if __name__ == "__main__":
    main()
