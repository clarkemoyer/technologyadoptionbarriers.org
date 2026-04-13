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

from tabs_api import (
    prolific_bulk_approve,
    prolific_send_message,
    prolific_study_info,
    prolific_submission_statuses,
    prolific_user_messages,
)

THANK_YOU_MESSAGE = (
    "Hi, thank you for participating in our Technology Adoption Barriers Survey "
    "and for taking the time to respond to our review message. Your submission "
    "has been approved. We appreciate your thoughtful engagement and the insights "
    "you shared - they are valuable to our research. Thank you again for your "
    "contribution!"
)

SIGNATURE = "Your submission has been approved"


def _require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        print(f"Error: {name} is required", file=sys.stderr)
        sys.exit(1)
    return value


def _write_step_summary(
    study_id: str, dry_run: bool, total_data_rows: int,
    clean_count: int, skipped: int, already_approved: int, newly_approved: int,
    messages_sent: int = 0, messages_already_sent: int = 0, messages_failed: int = 0,
) -> None:
    """Write a GitHub Actions step summary (always, even when nothing to approve)."""
    summary_file = os.environ.get("GITHUB_STEP_SUMMARY")
    if not summary_file:
        return
    mode = "Dry run" if dry_run else "Live"
    lines = [
        "## Prolific Submission Approval",
        "",
        f"- **Study ID:** {study_id}",
        f"- **Mode:** {mode}",
        "",
        "| Metric | Value |",
        "|---|---:|",
        f"| CSV rows parsed | {total_data_rows} |",
        f"| CLEAN dispositions | {clean_count} |",
        f"| Skipped (empty PID) | {skipped} |",
        f"| Already APPROVED | {already_approved} |",
        f"| Newly approved | {newly_approved} |",
        f"| Thank-you messages sent | {messages_sent} |",
        f"| Thank-you already sent | {messages_already_sent} |",
        f"| Thank-you messages failed | {messages_failed} |",
        "",
    ]
    with open(summary_file, "a") as f:
        f.write("\n".join(lines))


def _append_failure_summary(message: str) -> None:
    """Append a failure section to the GitHub Actions step summary."""
    summary_file = os.environ.get("GITHUB_STEP_SUMMARY")
    if not summary_file:
        return
    with open(summary_file, "a", encoding="utf-8") as f:
        f.write("\n## Result\n\n")
        f.write("- **Status:** FAILURE\n")
        f.write(f"- **Message:** {message}\n")


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

    # Require explicit PROLIFIC_PID column - no fallback for safety
    pid_idx = -1
    for i, h in enumerate(headers):
        if h.strip() == "PROLIFIC_PID":
            pid_idx = i
            break
    if pid_idx < 0:
        print(
            f"Error: Cannot find 'PROLIFIC_PID' column (exact match required). "
            f"Found headers: {headers[:10]}",
            file=sys.stderr,
        )
        sys.exit(1)

    # Require explicit Disposition column - no fallback for safety
    disp_idx = -1
    for i, h in enumerate(headers):
        if h.strip().lower() == "disposition":
            disp_idx = i
            break
    if disp_idx < 0:
        print(
            f"Error: Cannot find 'Disposition' column. Found headers: {headers[:10]}",
            file=sys.stderr,
        )
        sys.exit(1)

    print(f"  PID column: '{headers[pid_idx]}' (index {pid_idx})")
    print(f"  Disposition column: '{headers[disp_idx]}' (index {disp_idx})")
    print()

    # Parse rows - find CLEAN dispositions
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
                print(f"  Warning: CLEAN row with empty PID - skipping")
                skipped += 1

    total_data_rows = len(rows) - 1
    print(f"Parsed {total_data_rows} data rows")
    print(f"  CLEAN dispositions: {len(clean_pids)}")
    if skipped:
        print(f"  Skipped (empty PID): {skipped}")
    print()

    if not clean_pids:
        print("No participants with CLEAN disposition found. Nothing to approve.")
        _write_step_summary(study_id, dry_run=dry_run, total_data_rows=total_data_rows,
                            clean_count=0, skipped=skipped, already_approved=0,
                            newly_approved=0)
        return

    # Verify API token and study before approving (skip in dry-run for offline use)
    study_name = study_id
    newly_approved = 0
    already_approved = 0
    try:
        if not dry_run:
            print(f"Verifying Prolific API token and study {study_id}...")
            study = prolific_study_info(study_id, api_token)
            study_name = study.get("name", "UNKNOWN")
            print(f"  Verified: {study_name} (status: {study.get('status', 'UNKNOWN')})")

            # Fetch current submission statuses to avoid re-approving
            print(f"Fetching current submission statuses...")
            current_statuses = prolific_submission_statuses(study_id, api_token)

            pids_to_approve = []
            already_approved_pids: list[str] = []
            non_approvable = 0
            for pid in clean_pids:
                status = current_statuses.get(pid, "UNKNOWN")
                if status == "APPROVED":
                    already_approved += 1
                    already_approved_pids.append(pid)
                elif status == "AWAITING REVIEW":
                    pids_to_approve.append(pid)
                else:
                    # RETURNED, TIMED-OUT, REJECTED, etc. - cannot approve
                    non_approvable += 1
                    print(f"  Warning: CLEAN PID {pid} has Prolific status '{status}' - cannot approve")

            print(f"  Already APPROVED: {already_approved}")
            print(f"  AWAITING REVIEW (will approve): {len(pids_to_approve)}")
            if non_approvable:
                print(f"  Non-approvable (RETURNED/REJECTED/etc.): {non_approvable}")
            print()
        else:
            pids_to_approve = clean_pids

        # Approve
        if dry_run:
            print(f"DRY RUN - {len(clean_pids)} submissions would be approved")
            print("  (Set DRY_RUN=false to approve live)")
        elif pids_to_approve:
            print(f"Approving {len(pids_to_approve)} submissions for study {study_id} ({study_name})...")
            prolific_bulk_approve(study_id, pids_to_approve, api_token)
            newly_approved = len(pids_to_approve)
            print(f"Successfully approved {newly_approved} new submissions")
            print(f"  (plus {already_approved} already approved = {already_approved + newly_approved} total CLEAN)")
        else:
            print(f"All {already_approved} CLEAN submissions are already APPROVED. Nothing to do.")

        # Send thank-you messages to all CLEAN participants
        print("\nSending thank-you messages...")
        messages_sent = 0
        messages_already_sent = 0
        messages_failed = 0

        # In a live run, clean_pids with a non-approvable status are NOT approved,
        # so only message the ones that are known to be approved.
        # newly_approved + already_approved = the group of actually approved participants.
        if dry_run:
            print(f"DRY RUN - {len(clean_pids)} participants would be checked for thank-you messages")
            messages_sent = len(clean_pids)
        else:
            approved_message_pids = set(already_approved_pids) | set(pids_to_approve)
            for pid in clean_pids:
                if pid not in approved_message_pids:
                    continue

                try:
                    # Check for existing thank-you message
                    existing = prolific_user_messages(pid, api_token)
                    already_sent = any(
                        (m.get("data") or {}).get("study_id") == study_id
                        and SIGNATURE in (m.get("body") or "")
                        for m in existing
                    )
                    if already_sent:
                        print(f"  SKIP {pid} - already received thank-you")
                        messages_already_sent += 1
                        continue

                    prolific_send_message(study_id, pid, THANK_YOU_MESSAGE, api_token)
                    print(f"  SENT {pid}")
                    messages_sent += 1
                except Exception as e:
                    print(f"  FAILED to message {pid}: {e}")
                    messages_failed += 1

            print(f"\nMessage Summary:")
            print(f"  Sent: {messages_sent}")
            print(f"  Already sent (skipped): {messages_already_sent}")
            print(f"  Failed: {messages_failed}")

    except Exception as e:
        error_msg = f"Failed to process approvals for study {study_id}: {e}"
        print(f"Error: {error_msg}", file=sys.stderr)
        _write_step_summary(study_id, dry_run, total_data_rows, len(clean_pids), skipped,
                            already_approved, newly_approved)
        _append_failure_summary(error_msg)
        sys.exit(1)

    _write_step_summary(study_id, dry_run, total_data_rows, len(clean_pids), skipped,
                        already_approved, newly_approved, messages_sent, messages_already_sent, messages_failed)

    print("\nDone")


if __name__ == "__main__":
    main()
