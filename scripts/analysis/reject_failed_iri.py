#!/usr/bin/env python3
"""
DESTRUCTIVE OPERATION: Reject participants who failed ALL 3 IRI attention checks.

Python port of scripts/reject-failed-iri-submissions.ts.

Filters for IRI_Fail_Count == 3, builds personalized rejection messages,
and rejects via Prolific API.

Environment variables:
  PROLIFIC_API_TOKEN  – Prolific API token (required)
  STUDY_ID            – Prolific study ID (required)
  CSV_FILE_PATH       – Path to disposition CSV (required)
  CONFIRM_REJECT      – Must be exactly "REJECT" to execute live
  DRY_RUN             – When "false" AND CONFIRM_REJECT=="REJECT", reject live (default: true)
"""

import csv
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from tabs_api import (
    REJECTION_CATEGORIES,
    prolific_get_submission_ids_map,
    prolific_reject_submission,
    prolific_study_info,
)


def _require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        print(f"Error: {name} is required", file=sys.stderr)
        sys.exit(1)
    return value


def _append_step_summary(content: str) -> None:
    summary_file = os.environ.get("GITHUB_STEP_SUMMARY")
    if not summary_file:
        return
    with open(summary_file, "a", encoding="utf-8") as f:
        f.write(content)


def build_rejection_message(iri_fail_count: int, speed_flag: int, duration: int) -> str:
    minutes = f"{duration / 60:.1f}"
    reasons = []
    if speed_flag == 1:
        reasons.append(f"it was completed in {minutes} minutes (below our 5-minute minimum)")
    reasons.append(f"{iri_fail_count} of 3 embedded attention checks were answered incorrectly")
    reason_text = " and ".join(reasons)
    return (
        "Hi, thank you for participating in our Technology Adoption Barriers Survey. "
        f"Unfortunately, your submission has been rejected because {reason_text}. "
        "These checks are designed to confirm that respondents are reading each question carefully. "
        "If you believe this is an error, please reply to this message with any questions."
    )


def build_rejection_categories(speed_flag: int) -> list[str]:
    cats = [REJECTION_CATEGORIES["FAILED_ATTENTION_CHECK"]]
    if speed_flag == 1:
        cats.append(REJECTION_CATEGORIES["TOO_QUICKLY"])
    cats.append(REJECTION_CATEGORIES["OTHER"])
    return cats


def main():
    print("================================================================")
    print("  DESTRUCTIVE OPERATION: Prolific Submission Rejection")
    print("  Participants who failed ALL 3 IRI attention checks")
    print("================================================================")
    print()

    api_token = _require_env("PROLIFIC_API_TOKEN")
    study_id = _require_env("STUDY_ID")
    csv_file_path = _require_env("CSV_FILE_PATH")
    dry_run = os.environ.get("DRY_RUN", "true").strip().lower() != "false"
    confirm_reject = os.environ.get("CONFIRM_REJECT", "").strip()

    if not dry_run and confirm_reject != "REJECT":
        print("================================================================", file=sys.stderr)
        print('  SAFETY STOP: CONFIRM_REJECT must be exactly "REJECT"', file=sys.stderr)
        print(f'  Received: "{confirm_reject}"', file=sys.stderr)
        print("================================================================", file=sys.stderr)
        sys.exit(1)

    # ── Load CSV ──
    print(f"Reading disposition CSV from {csv_file_path}")
    with open(csv_file_path, encoding="utf-8", newline="") as f:
        reader = csv.reader(f)
        rows = list(reader)

    if len(rows) < 2:
        print("Error: CSV must have a header row and at least one data row", file=sys.stderr)
        sys.exit(1)

    headers = rows[0]

    def col(name: str) -> int:
        try:
            return headers.index(name)
        except ValueError:
            print(f"Error: Required column '{name}' not found", file=sys.stderr)
            sys.exit(1)

    pid_idx = col("PROLIFIC_PID")
    iri_fail_idx = col("IRI_Fail_Count")
    speed_idx = col("Speed_Flag")
    duration_idx = col("Duration_Seconds")

    records = []
    for row in rows[1:]:
        pid = (row[pid_idx] if pid_idx < len(row) else "").strip()
        iri_fail = int(row[iri_fail_idx]) if iri_fail_idx < len(row) and row[iri_fail_idx].strip().isdigit() else 0
        if not pid or iri_fail != 3:
            continue
        speed = int(row[speed_idx]) if speed_idx < len(row) and row[speed_idx].strip().isdigit() else 0
        duration = int(row[duration_idx]) if duration_idx < len(row) and row[duration_idx].strip().isdigit() else 0
        message = build_rejection_message(iri_fail, speed, duration)
        categories = build_rejection_categories(speed)
        records.append({
            "pid": pid,
            "iri_fail": iri_fail,
            "speed_flag": speed,
            "duration": duration,
            "message": message,
            "categories": categories,
        })

    print(f"Parsed {len(rows) - 1} data rows")
    print(f"Participants with IRI_Fail_Count == 3: {len(records)}")
    print()

    if not records:
        print("No participants to reject.")
        _append_step_summary("## Prolific Submission Rejection\n\nNo participants with IRI_Fail_Count == 3.\n")
        return

    # ── Log rejections ──
    print("Rejection details:")
    print()
    for r in records:
        minutes = f"{r['duration'] / 60:.1f}"
        print(f"  PID: {r['pid']}")
        print(f"    Duration: {minutes} min | IRI Failed: {r['iri_fail']}/3 | Speed: {'TOO FAST' if r['speed_flag'] == 1 else 'OK'}")
        print(f"    Message: {r['message']}")
        print()

    # ── Verify API (always, even in dry run) ──
    print("Verifying Prolific API connection...")
    study = prolific_study_info(study_id, api_token)
    study_name = study.get("name", "UNKNOWN")
    print(f"Study: {study_name}")
    print()

    # ── Execute or dry run ──
    if dry_run:
        print("================================================================")
        print("  DRY RUN - no submissions will be rejected")
        print(f"  Would reject: {len(records)} participants")
        print("  Set DRY_RUN=false and CONFIRM_REJECT=REJECT to execute")
        print("================================================================")
    else:
        print(f"LIVE REJECTION: {len(records)} submissions for {study_name}")
        print()
        pid_to_sub_id = prolific_get_submission_ids_map(
            study_id, [r["pid"] for r in records], api_token
        )
        not_found = []
        rejected = 0
        for r in records:
            sub_id = pid_to_sub_id.get(r["pid"])
            if not sub_id:
                print(f"  WARNING: No submission found for PID {r['pid']} - skipping")
                not_found.append(r["pid"])
                continue
            print(f"  Rejecting {r['pid']} (submission {sub_id})...")
            prolific_reject_submission(sub_id, r["categories"], r["message"], api_token)
            rejected += 1
        print()
        print(f"REJECTED: {rejected} | NOT FOUND: {len(not_found)}")

    # ── Step summary ──
    summary_rows = [
        f"| `{r['pid']}` | {r['duration'] / 60:.1f} min | {r['iri_fail']}/3 | {'Yes' if r['speed_flag'] == 1 else 'No'} |"
        for r in records
    ]
    from datetime import datetime, timezone
    run_time = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    _append_step_summary("\n".join([
        "## Prolific Submission Rejection (Failed IRI)",
        "",
        "> **DESTRUCTIVE OPERATION** - rejected participants will NOT be paid.",
        "",
        f"- **Run time (UTC):** {run_time}",
        f"- **Study:** {study_name} (`{study_id}`)",
        f"- **Mode:** {'DRY RUN' if dry_run else 'LIVE REJECTION'}",
        f"- **Criteria:** IRI\\_Fail\\_Count == 3 (all three attention checks failed)",
        "",
        "| PID | Duration | IRI Failed | Speed Flag |",
        "|---|---|---|---|",
        *summary_rows,
        "",
        f"**Total:** {len(records)}",
        "",
    ]))

    print()
    print("Done")


if __name__ == "__main__":
    main()
