#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════╗
║  DESTRUCTIVE OPERATION: Reject AUTO-EXCLUDE Submissions         ║
║                                                                  ║
║  This script REJECTS participants whose disposition is           ║
║  AUTO-EXCLUDE. Rejected participants will NOT be paid.           ║
║  This action cannot be easily undone.                            ║
║                                                                  ║
║  Each participant receives a PERSONALIZED rejection message      ║
║  explaining which checks they failed.                            ║
╚══════════════════════════════════════════════════════════════════╝

Python port of scripts/reject-auto-exclude-submissions.ts.

Environment variables:
  PROLIFIC_API_TOKEN  – Prolific API token (required)
  STUDY_ID            – Prolific study ID (required)
  CSV_FILE_PATH       – Path to disposition CSV (required)
  CONFIRM_REJECT      – Must be exactly "REJECT" to execute live (required for live)
  DRY_RUN             – When "false" AND CONFIRM_REJECT=="REJECT", reject live (default: true)
  PID_LIST            – Optional comma-separated PIDs to process (default: all matching)
  SUB_TYPE            – Optional filter: IRI3_SPEED, IRI3, IRI2_SPEED, IRI2, SPEED_IRI, ALL
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

VALID_SUB_TYPES = {"ALL", "IRI3_SPEED", "IRI3", "IRI2_SPEED", "IRI2", "SPEED_IRI"}


def _require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        print(f"Error: {name} is required", file=sys.stderr)
        sys.exit(1)
    return value


def classify_sub_type(speed_flag: int, iri_fail_count: int) -> str:
    """Classify the AUTO-EXCLUDE sub-type based on Speed_Flag and IRI_Fail_Count."""
    if iri_fail_count >= 3 and speed_flag == 1:
        return "IRI3_SPEED"
    if iri_fail_count >= 3:
        return "IRI3"
    if iri_fail_count == 2 and speed_flag == 1:
        return "IRI2_SPEED"
    if iri_fail_count == 2:
        return "IRI2"
    return "SPEED_IRI"


def build_rejection_message(iri_fail_count: int, speed_flag: int, duration: int) -> str:
    """Build a personalized rejection message."""
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
    """Build the list of rejection categories for the Prolific API."""
    cats = [REJECTION_CATEGORIES["FAILED_ATTENTION_CHECK"]]
    if speed_flag == 1:
        cats.append(REJECTION_CATEGORIES["TOO_QUICKLY"])
    cats.append(REJECTION_CATEGORIES["OTHER"])
    return cats


def _append_step_summary(content: str) -> None:
    summary_file = os.environ.get("GITHUB_STEP_SUMMARY")
    if not summary_file:
        return
    with open(summary_file, "a", encoding="utf-8") as f:
        f.write(content)


def _md_escape(text: str) -> str:
    return text.replace("\\", "\\\\").replace("|", "\\|").replace("\n", " ").replace("\r", " ")


def main():
    print("================================================================")
    print("  DESTRUCTIVE OPERATION: Prolific Submission Rejection")
    print("  Participants with Disposition == AUTO-EXCLUDE")
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
    disp_idx = col("Disposition")
    iri_fail_idx = col("IRI_Fail_Count")
    speed_idx = col("Speed_Flag")
    duration_idx = col("Duration_Seconds")

    # Build rejection records
    records = []
    for row in rows[1:]:
        pid = (row[pid_idx] if pid_idx < len(row) else "").strip()
        disposition = (row[disp_idx] if disp_idx < len(row) else "").strip()
        if not pid or disposition != "AUTO-EXCLUDE":
            continue
        iri_fail = int(row[iri_fail_idx]) if iri_fail_idx < len(row) and row[iri_fail_idx].strip().isdigit() else 0
        speed = int(row[speed_idx]) if speed_idx < len(row) and row[speed_idx].strip().isdigit() else 0
        duration = int(row[duration_idx]) if duration_idx < len(row) and row[duration_idx].strip().isdigit() else 0
        sub_type = classify_sub_type(speed, iri_fail)
        message = build_rejection_message(iri_fail, speed, duration)
        categories = build_rejection_categories(speed)
        records.append({
            "pid": pid,
            "iri_fail": iri_fail,
            "speed_flag": speed,
            "duration": duration,
            "sub_type": sub_type,
            "message": message,
            "categories": categories,
        })

    # ── Apply SUB_TYPE filter ──
    sub_type_filter = os.environ.get("SUB_TYPE", "ALL").strip().upper()
    if sub_type_filter and sub_type_filter not in VALID_SUB_TYPES:
        print(f"Error: Invalid SUB_TYPE '{sub_type_filter}'. Valid: {', '.join(sorted(VALID_SUB_TYPES))}", file=sys.stderr)
        sys.exit(1)

    if sub_type_filter and sub_type_filter != "ALL":
        filtered = [r for r in records if r["sub_type"] == sub_type_filter]
        print(f"Sub-type filter: {sub_type_filter}")
        print(f"Matched: {len(filtered)} of {len(records)} AUTO-EXCLUDE participants")
        print()
    else:
        filtered = records

    # ── Apply PID filter ──
    pid_list_raw = os.environ.get("PID_LIST", "").strip()
    if pid_list_raw:
        pid_filter = {p.strip() for p in pid_list_raw.split(",") if p.strip()}
        filtered = [r for r in filtered if r["pid"] in pid_filter]
        print(f"PID filter: {len(pid_filter)} PID(s) specified, matched: {len(filtered)}")
        missing = pid_filter - {r["pid"] for r in filtered}
        if missing:
            print(f"Not found: {', '.join(sorted(missing))}")
        print()

    # ── Summary by sub-type ──
    by_sub_type: dict[str, list] = {}
    for r in filtered:
        by_sub_type.setdefault(r["sub_type"], []).append(r)

    print(f"Parsed {len(rows) - 1} data rows")
    print(f"Participants with Disposition == AUTO-EXCLUDE: {len(records)}")
    if pid_list_raw:
        print(f"Filtered to: {len(filtered)}")
    for st, lst in by_sub_type.items():
        print(f"  {st}: {len(lst)}")
    print()

    if not filtered:
        print("No participants to reject.")
        _append_step_summary("## Prolific AUTO-EXCLUDE Rejection\n\nNo participants with Disposition == AUTO-EXCLUDE.\n")
        return

    # ── Log every rejection ──
    print("Rejection details:")
    print()
    for r in filtered:
        minutes = f"{r['duration'] / 60:.1f}"
        print(f"  PID: {r['pid']}")
        print(f"    Duration: {minutes} min | IRI Failed: {r['iri_fail']}/3 | Speed: {'TOO FAST' if r['speed_flag'] == 1 else 'OK'} | Sub-type: {r['sub_type']}")
        print(f"    Categories: {', '.join(r['categories'])}")
        print(f"    Message: {r['message']}")
        print()

    # ── Verify API (live mode only - dry run stays offline-safe) ──
    study_name = study_id
    if not dry_run:
        print("Verifying Prolific API connection...")
        study = prolific_study_info(study_id, api_token)
        study_name = study.get("name", "UNKNOWN")
        print(f"Study: {study_name} (status: {study.get('status', 'UNKNOWN')})")
        print()

    # ── Execute or dry run ──
    if dry_run:
        print("================================================================")
        print("  DRY RUN - no submissions will be rejected")
        print(f"  Would reject: {len(filtered)} participants")
        print("  Set DRY_RUN=false and CONFIRM_REJECT=REJECT to execute")
        print("================================================================")
    else:
        print("================================================================")
        print(f"  LIVE REJECTION: {len(filtered)} submissions")
        print(f"  Study: {study_id} ({study_name})")
        print("================================================================")
        print()

        # Look up submission IDs
        print("Looking up submission IDs...")
        pid_to_sub_id = prolific_get_submission_ids_map(
            study_id, [r["pid"] for r in filtered], api_token
        )

        not_found = []
        rejected = 0

        for r in filtered:
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
        if not_found:
            print(f"PIDs not found: {', '.join(not_found)}")

    # ── Step summary ──
    summary_rows = []
    for r in filtered:
        minutes = f"{r['duration'] / 60:.1f}"
        summary_rows.append(
            f"| `{r['pid']}` | {minutes} min | {r['iri_fail']}/3 "
            f"| {'Yes' if r['speed_flag'] == 1 else 'No'} | {r['sub_type']} |"
        )

    sub_type_counts = "\n".join(
        f"  - **{st}:** {len(lst)}" for st, lst in by_sub_type.items()
    )

    # Example messages per sub-type
    examples = []
    for st, lst in by_sub_type.items():
        if lst:
            examples.append(f"**{st}:**")
            examples.append(f"> {lst[0]['message']}")
            examples.append("")

    _append_step_summary("\n".join([
        "## Prolific AUTO-EXCLUDE Rejection",
        "",
        "> **DESTRUCTIVE OPERATION** - rejected participants will NOT be paid.",
        "",
        f"- **Study ID:** {_md_escape(study_id)}",
        f"- **Mode:** {'DRY RUN' if dry_run else 'LIVE REJECTION'}",
        "",
        "### Sub-type Breakdown",
        "",
        sub_type_counts,
        "",
        "### Participants",
        "",
        "| PID | Duration | IRI Failed | Speed Flag | Sub-type |",
        "|---|---|---|---|---|",
        *summary_rows,
        "",
        f"**Total:** {len(filtered)}",
        "",
        "### Message Examples",
        "",
        *examples,
        "",
        "> **Dry run** - no rejections executed." if dry_run
        else "> **All listed participants have been rejected with personalized messages.**",
        "",
    ]))

    print()
    print("Done")


if __name__ == "__main__":
    main()
