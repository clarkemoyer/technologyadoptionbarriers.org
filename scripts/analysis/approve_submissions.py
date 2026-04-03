#!/usr/bin/env python3
"""
Approve Prolific submissions from a CSV disposition file.

Python port of scripts/approve-prolific-submissions.ts.

Reads a CSV, finds rows where the Disposition column is "CLEAN",
and bulk-approves them via the Prolific API.

Environment variables:
  PROLIFIC_API_TOKEN   – Prolific API token (required)
  STUDY_ID             – Prolific study ID (required)
  CSV_FILE_PATH        – Path to the disposition CSV (required)
  DRY_RUN              – When "false", approve live; otherwise dry run (default: true)
"""

import csv
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from tabs_api import prolific_bulk_approve


def _require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        print(f"Error: {name} is required", file=sys.stderr)
        sys.exit(1)
    return value


def _env_flag(name: str, default: bool = False) -> bool:
    value = (os.environ.get(name) or "").strip().lower()
    if not value:
        return default
    return value in ("1", "true", "yes", "y", "on")


def main():
    api_token = _require_env("PROLIFIC_API_TOKEN")
    study_id = _require_env("STUDY_ID")
    csv_file_path = _require_env("CSV_FILE_PATH")
    # DRY_RUN=false means live; anything else (true, unset, empty) means dry run
    dry_run = os.environ.get("DRY_RUN", "true").strip().lower() != "false"

    # Read disposition CSV
    print(f"Reading CSV from: {csv_file_path}")
    with open(csv_file_path, encoding="utf-8", newline="") as f:
        reader = csv.reader(f)
        rows = list(reader)

    if len(rows) < 2:
        print("Error: CSV must contain a header row and at least one data row", file=sys.stderr)
        sys.exit(1)

    headers = rows[0]

    # Detect PID column
    pid_idx = -1
    for pattern in ["PROLIFIC_PID", "participant_id", "PID"]:
        for i, h in enumerate(headers):
            if h.strip().lower() == pattern.lower():
                pid_idx = i
                break
        if pid_idx >= 0:
            break
    if pid_idx < 0:
        pid_idx = 0  # fallback to first column

    # Detect disposition column
    disp_idx = -1
    for i, h in enumerate(headers):
        if h.strip().lower() == "disposition":
            disp_idx = i
            break
    if disp_idx < 0:
        if len(headers) > 3:
            disp_idx = 3  # fallback to column D
        else:
            print("Error: Cannot detect Disposition column", file=sys.stderr)
            sys.exit(1)

    print(f"  PID column: '{headers[pid_idx]}' (index {pid_idx})")
    print(f"  Disposition column: '{headers[disp_idx]}' (index {disp_idx})")
    print()

    # Parse rows — find CLEAN dispositions
    clean_pids: list[str] = []
    skipped = 0
    for row in rows[1:]:
        if len(row) <= max(pid_idx, disp_idx):
            continue
        disposition = row[disp_idx].strip().upper()
        pid = row[pid_idx].strip()
        if disposition == "CLEAN":
            if pid:
                clean_pids.append(pid)
            else:
                print(f"  Warning: CLEAN row with empty PID — skipping")
                skipped += 1

    total_data_rows = len(rows) - 1
    print(f"Parsed {total_data_rows} data rows")
    print(f"  CLEAN dispositions: {len(clean_pids)}")
    if skipped:
        print(f"  Skipped (empty PID): {skipped}")
    print()

    if not clean_pids:
        print("No participants with CLEAN disposition found. Nothing to approve.")
        return

    # Approve
    if dry_run:
        print(f"DRY RUN — {len(clean_pids)} submissions would be approved")
        print("  (Set DRY_RUN=false to approve live)")
    else:
        print(f"Approving {len(clean_pids)} submissions for study {study_id}...")
        try:
            prolific_bulk_approve(study_id, clean_pids, api_token)
            print(f"Successfully approved {len(clean_pids)} submissions")
        except Exception as e:
            print(f"Error approving submissions: {e}", file=sys.stderr)
            sys.exit(1)

    # GitHub step summary
    summary_file = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary_file:
        mode = "Dry run" if dry_run else "Live"
        approved = 0 if dry_run else len(clean_pids)
        lines = [
            "## Prolific Submission Approval",
            "",
            f"- **Study ID:** {study_id}",
            f"- **Mode:** {mode}",
            "",
            "| Metric | Value |",
            "|---|---:|",
            f"| CSV rows parsed | {total_data_rows} |",
            f"| CLEAN dispositions | {len(clean_pids)} |",
            f"| Skipped (empty PID) | {skipped} |",
            f"| Approved | {approved} |",
            "",
        ]
        with open(summary_file, "a") as f:
            f.write("\n".join(lines))

    print("\nDone")


if __name__ == "__main__":
    main()
