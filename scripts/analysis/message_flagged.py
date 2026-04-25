#!/usr/bin/env python3
"""
Send personalized messages to FLAG-disposition participants via Prolific.

Python port of scripts/message-flagged-submissions.ts.

Supports all FLAG dispositions plus AUTO-EXCLUDE return variants:
  FLAG-SPEED, FLAG-SINGLE-IRI, FLAG-SMEAL,
  FLAG-RECAPTCHA, FLAG-PARTIAL-STRAIGHTLINING,
  AUTO-EXCLUDE:SPEED_IRI, AUTO-EXCLUDE:IRI2_RETURN,
  AUTO-EXCLUDE:IRI3_RETURN, AUTO-EXCLUDE:IRI3_SPEED_RETURN,
  AUTO-EXCLUDE:IRI2_SPEED_RETURN

Environment variables:
  PROLIFIC_API_TOKEN    – Prolific API token (required)
  STUDY_ID              – Prolific study ID (required)
  CSV_FILE_PATH         – Path to disposition CSV (required)
  DISPOSITION_FILTER    – Which disposition to process (required)
  DRY_RUN               – When "false", send messages live (default: true)
  PID_LIST              – Optional comma-separated PIDs (default: all matching)
"""

import csv
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from tabs_api import (
    prolific_send_message,
    prolific_submissions,
    prolific_study_info,
    prolific_user_messages,
)

# ── Valid dispositions ──

VALID_DISPOSITIONS = [
    "FLAG-SPEED",
    "FLAG-SINGLE-IRI",
    "FLAG-SMEAL",
    "FLAG-RECAPTCHA",
    "FLAG-PARTIAL-STRAIGHTLINING",
    "AUTO-EXCLUDE:SPEED_IRI",
    "AUTO-EXCLUDE:IRI2_RETURN",
    "AUTO-EXCLUDE:IRI3_RETURN",
    "AUTO-EXCLUDE:IRI3_SPEED_RETURN",
    "AUTO-EXCLUDE:IRI2_SPEED_RETURN",
]

# ── IRI failure details ──

IRI_DETAILS = {
    "barrier": {"label": "Barrier attention check", "expected": "Major Barrier"},
    "readiness": {"label": "Readiness attention check", "expected": "Low Readiness/Capability"},
    "maturity": {"label": "Maturity attention check", "expected": "Level 2: Developing/Repeatable"},
}

SKIP_STATUSES = {"APPROVED", "REJECTED", "RETURNED", "TIMED-OUT"}


def _require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        print(f"Error: {name} is required", file=sys.stderr)
        sys.exit(1)
    return value


def _build_iri_failure_list(barrier_pass: int, readiness_pass: int, maturity_pass: int) -> str:
    failures = []
    if barrier_pass == 0:
        d = IRI_DETAILS["barrier"]
        failures.append(
            f"({len(failures) + 1}) {d['label']}: the item asked you to select "
            f'"{d["expected"]}" but a different answer was recorded'
        )
    if readiness_pass == 0:
        d = IRI_DETAILS["readiness"]
        failures.append(
            f"({len(failures) + 1}) {d['label']}: the item asked you to select "
            f'"{d["expected"]}" but a different answer was recorded'
        )
    if maturity_pass == 0:
        d = IRI_DETAILS["maturity"]
        failures.append(
            f"({len(failures) + 1}) {d['label']}: the item asked you to select "
            f'"{d["expected"]}" but a different answer was recorded'
        )
    return ". ".join(failures) + "."


def build_flag_message(record: dict) -> str:
    """Build a personalized message based on disposition type."""
    minutes = f"{record['duration'] / 60:.1f}"
    iri_details = _build_iri_failure_list(
        record["iri_barrier_pass"], record["iri_readiness_pass"], record["iri_maturity_pass"]
    )
    disposition = record["disposition"]

    if disposition == "FLAG-SPEED":
        return (
            "Hi, thank you for participating in our Technology Adoption Barriers Survey. "
            f"We are reviewing your submission because it was completed in {minutes} minutes, "
            "which is faster than expected for a survey of this length. "
            "However, we note that you answered all attention checks correctly. "
            "Could you briefly explain how you were able to complete the survey so quickly? "
            "We want to treat all participants fairly. "
            "Please reply within 48 hours."
        )

    if disposition == "FLAG-SINGLE-IRI":
        return (
            "Hi, thank you for participating in our Technology Adoption Barriers Survey. "
            "We are reviewing your submission because 1 of 3 embedded attention checks "
            "was answered differently than expected. "
            f"Specifically: {iri_details} "
            "This may have been an oversight. "
            "Could you confirm that you read each question carefully? "
            "We want to treat all participants fairly. "
            "Please reply within 48 hours."
        )

    if disposition == "FLAG-SMEAL":
        return (
            "Hi, thank you for participating in our Technology Adoption Barriers Survey. "
            f"We are reviewing your submission because your completion time of {minutes} minutes "
            "is below our benchmark of 9 minutes, based on the fastest subject matter expert "
            "completion during beta testing. "
            "However, we note that you answered all attention checks correctly. "
            "Could you briefly share your experience completing the survey? "
            "We want to treat all participants fairly. "
            "Please reply within 48 hours."
        )

    if disposition == "FLAG-RECAPTCHA":
        return (
            "Hi, thank you for participating in our Technology Adoption Barriers Survey. "
            "Our automated authenticity checks flagged your submission for additional review. "
            "This does not necessarily mean there is an issue \u2014 false positives can occur. "
            "Could you confirm that you personally completed this survey? "
            "We want to treat all participants fairly. "
            "Please reply within 48 hours."
        )

    if disposition == "FLAG-PARTIAL-STRAIGHTLINING":
        block_names = record.get("partial_straightlining_blocks", "").replace(";", ", ") or "flagged"
        return (
            "Hi, thank you for participating in our Technology Adoption Barriers Survey. "
            f"We are reviewing your submission because your responses in the {block_names} "
            "section(s) showed very little variation, which our quality checks flag for review. "
            "This may reflect your genuine experience \u2014 some respondents do have consistent "
            "views across items. "
            "Could you briefly confirm that you considered each item individually? "
            "We want to treat all participants fairly. "
            "Please reply within 48 hours."
        )

    if disposition == "AUTO-EXCLUDE:SPEED_IRI":
        return (
            "Hi, thank you for participating in our Technology Adoption Barriers Survey. "
            f"We are reviewing your submission because it was completed in {minutes} minutes "
            "and one of three embedded attention checks was answered differently than expected. "
            "We would like to learn more before making a final decision on your submission. "
            "Could you please share: (1) What is your professional background and role? "
            "(2) What were your overall thoughts on the survey and its topics? "
            "(3) How were you able to complete the survey so quickly? "
            "We want to treat all participants fairly and appreciate your time. "
            "Please reply within 48 hours."
        )

    if disposition == "AUTO-EXCLUDE:IRI2_RETURN":
        return (
            "Hi, thank you for participating in our Technology Adoption Barriers Survey. "
            "After reviewing your submission, we found that 2 of 3 embedded attention check "
            "questions were answered differently than the instructions specified. "
            f"Specifically: {iri_details} "
            "These items are designed to confirm that respondents are reading each question carefully, "
            "and are critical to ensuring the highest quality data for our research. "
            "Rather than rejecting your submission (which would negatively impact your Prolific record), "
            "we would like to offer you the option to return it voluntarily. "
            "To return your submission, go to your Prolific Submissions page and click the "
            'circular arrow icon next to this study to "Return and cancel reward". '
            "If you believe you did answer the attention checks correctly and would like to discuss, "
            "please reply to this message within 48 hours and we will review further. "
            "We appreciate your participation and want to treat all participants fairly."
        )

    if disposition == "AUTO-EXCLUDE:IRI3_RETURN":
        return (
            "Hi, thank you for participating in our Technology Adoption Barriers Survey. "
            "After reviewing your submission, we found that all 3 of the embedded attention check "
            "questions were answered differently than the instructions specified. "
            f"Specifically: {iri_details} "
            "These items are designed to confirm that respondents are reading each question carefully, "
            "and are critical to ensuring the highest quality data for our research. "
            "Rather than rejecting your submission (which would negatively impact your Prolific record), "
            "we would like to offer you the option to return it voluntarily. "
            "To return your submission, go to your Prolific Submissions page and click the "
            'circular arrow icon next to this study to "Return and cancel reward". '
            "If you believe you did answer the attention checks correctly and would like to discuss, "
            "please reply to this message within 48 hours and we will review further. "
            "We appreciate your participation and want to treat all participants fairly."
        )

    if disposition == "AUTO-EXCLUDE:IRI3_SPEED_RETURN":
        return (
            "Hi, thank you for participating in our Technology Adoption Barriers Survey. "
            f"After reviewing your submission, we found that it was completed in {minutes} minutes "
            "(below our 5-minute minimum) and all 3 of the embedded attention check questions "
            "were answered differently than the instructions specified. "
            f"Specifically: {iri_details} "
            "Both completion speed and attention checks are critical to ensuring the highest "
            "quality data for our research. "
            "Rather than rejecting your submission (which would negatively impact your Prolific record), "
            "we would like to offer you the option to return it voluntarily. "
            "To return your submission, go to your Prolific Submissions page and click the "
            'circular arrow icon next to this study to "Return and cancel reward". '
            "If you believe this is an error and would like to discuss, "
            "please reply to this message within 48 hours and we will review further. "
            "We appreciate your participation and want to treat all participants fairly."
        )

    if disposition == "AUTO-EXCLUDE:IRI2_SPEED_RETURN":
        return (
            "Hi, thank you for participating in our Technology Adoption Barriers Survey. "
            f"After reviewing your submission, we found that it was completed in {minutes} minutes "
            "(below our 5-minute minimum) and 2 of 3 embedded attention check questions "
            "were answered differently than the instructions specified. "
            f"Specifically: {iri_details} "
            "Both completion speed and attention checks are critical to ensuring the highest "
            "quality data for our research. "
            "Rather than rejecting your submission (which would negatively impact your Prolific record), "
            "we would like to offer you the option to return it voluntarily. "
            "To return your submission, go to your Prolific Submissions page and click the "
            'circular arrow icon next to this study to "Return and cancel reward". '
            "If you believe this is an error and would like to discuss, "
            "please reply to this message within 48 hours and we will review further. "
            "We appreciate your participation and want to treat all participants fairly."
        )

    return ""


def get_message_signature(disposition: str) -> str:
    """Return a unique phrase from each disposition's message template for dedup."""
    signatures = {
        "FLAG-SPEED": "which is faster than expected for a survey of this length",
        "FLAG-SINGLE-IRI": "1 of 3 embedded attention checks was answered differently",
        "FLAG-SMEAL": "below our benchmark of 9 minutes",
        "FLAG-RECAPTCHA": "automated authenticity checks flagged your submission",
        "FLAG-PARTIAL-STRAIGHTLINING": "showed very little variation, which our quality checks flag",
        "AUTO-EXCLUDE:SPEED_IRI": "What is your professional background and role",
        "AUTO-EXCLUDE:IRI2_RETURN": "2 of 3 embedded attention check questions were answered differently",
        "AUTO-EXCLUDE:IRI3_RETURN": "all 3 of the embedded attention check questions were answered differently",
        "AUTO-EXCLUDE:IRI3_SPEED_RETURN": "all 3 of the embedded attention check questions were answered differently",
        "AUTO-EXCLUDE:IRI2_SPEED_RETURN": "2 of 3 embedded attention check questions were answered differently",
    }
    return signatures.get(disposition, "")


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
    print("  Prolific Flagged Submission Messaging")
    print("  Send personalized review messages to flagged participants")
    print("================================================================")
    print()

    api_token = _require_env("PROLIFIC_API_TOKEN")
    study_id = _require_env("STUDY_ID")
    csv_file_path = _require_env("CSV_FILE_PATH")
    disposition_filter = os.environ.get("DISPOSITION_FILTER", "").strip()
    if not disposition_filter:
        print("Error: DISPOSITION_FILTER is required", file=sys.stderr)
        print(f"  Valid values: {', '.join(VALID_DISPOSITIONS)}", file=sys.stderr)
        sys.exit(1)
    if disposition_filter not in VALID_DISPOSITIONS:
        print(f'Error: Invalid DISPOSITION_FILTER: "{disposition_filter}"', file=sys.stderr)
        print(f"  Valid values: {', '.join(VALID_DISPOSITIONS)}", file=sys.stderr)
        sys.exit(1)

    dry_run = os.environ.get("DRY_RUN", "true").strip().lower() != "false"

    print(f"Disposition filter: {disposition_filter}")
    print(f"Mode: {'DRY RUN' if dry_run else 'LIVE'}")
    print()

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
    duration_idx = col("Duration_Seconds")
    partial_blocks_idx = col("Partial_Straightlining_Blocks")
    iri_fail_idx = col("IRI_Fail_Count")
    speed_idx = col("Speed_Flag")
    iri_barrier_idx = col("IRI_Barrier_Pass")
    iri_readiness_idx = col("IRI_Readiness_Pass")
    iri_maturity_idx = col("IRI_Maturity_Pass")

    records = []
    for row in rows[1:]:
        pid = (row[pid_idx] if pid_idx < len(row) else "").strip()
        disposition = (row[disp_idx] if disp_idx < len(row) else "").strip()

        # Match disposition - compound filters need sub-type matching
        matches = False
        iri_fail = int(row[iri_fail_idx]) if iri_fail_idx < len(row) and row[iri_fail_idx].strip().isdigit() else 0
        speed = int(row[speed_idx]) if speed_idx < len(row) and row[speed_idx].strip().isdigit() else 0

        if disposition_filter == "AUTO-EXCLUDE:SPEED_IRI":
            matches = disposition == "AUTO-EXCLUDE" and speed == 1 and iri_fail == 1
        elif disposition_filter == "AUTO-EXCLUDE:IRI2_RETURN":
            matches = disposition == "AUTO-EXCLUDE" and iri_fail == 2 and speed == 0
        elif disposition_filter == "AUTO-EXCLUDE:IRI3_RETURN":
            matches = disposition == "AUTO-EXCLUDE" and iri_fail >= 3 and speed == 0
        elif disposition_filter == "AUTO-EXCLUDE:IRI3_SPEED_RETURN":
            matches = disposition == "AUTO-EXCLUDE" and iri_fail >= 3 and speed == 1
        elif disposition_filter == "AUTO-EXCLUDE:IRI2_SPEED_RETURN":
            matches = disposition == "AUTO-EXCLUDE" and iri_fail == 2 and speed == 1
        else:
            matches = disposition == disposition_filter

        if not pid or not matches:
            continue

        rec = {
            "pid": pid,
            "disposition": disposition_filter,
            "duration": int(row[duration_idx]) if duration_idx < len(row) and row[duration_idx].strip().isdigit() else 0,
            "partial_straightlining_blocks": (row[partial_blocks_idx] if partial_blocks_idx < len(row) else "").strip(),
            "iri_barrier_pass": int(row[iri_barrier_idx]) if iri_barrier_idx < len(row) and row[iri_barrier_idx].strip().isdigit() else 0,
            "iri_readiness_pass": int(row[iri_readiness_idx]) if iri_readiness_idx < len(row) and row[iri_readiness_idx].strip().isdigit() else 0,
            "iri_maturity_pass": int(row[iri_maturity_idx]) if iri_maturity_idx < len(row) and row[iri_maturity_idx].strip().isdigit() else 0,
        }
        rec["message"] = build_flag_message(rec)
        records.append(rec)

    # ── Apply PID filter ──
    pid_list_raw = os.environ.get("PID_LIST", "").strip()
    if pid_list_raw:
        pid_filter = {p.strip() for p in pid_list_raw.split(",") if p.strip()}
        filtered = [r for r in records if r["pid"] in pid_filter]
        print(f"PID filter: {len(pid_filter)} PID(s) specified, matched: {len(filtered)}")
        missing = pid_filter - {r["pid"] for r in filtered}
        if missing:
            print(f"Not found in {disposition_filter}: {', '.join(sorted(missing))}")
    else:
        filtered = records

    print(f"Parsed {len(rows) - 1} data rows")
    print(f"Participants matching {disposition_filter}: {len(records)}")
    print()

    if not filtered:
        print(f"No participants with disposition {disposition_filter}.")
        _append_step_summary(
            f"## Prolific Flagged Submission Messaging\n\nNo participants with disposition {disposition_filter}.\n"
        )
        return

    # ── Log messages ──
    print("Message details:")
    print()
    for r in filtered:
        minutes = f"{r['duration'] / 60:.1f}"
        print(f"  PID: {r['pid']}")
        print(f"    Duration: {minutes} min | Disposition: {r['disposition']}")
        if r["partial_straightlining_blocks"]:
            print(f"    Flagged blocks: {r['partial_straightlining_blocks']}")
        print(f"    Message: {r['message']}")
        print()

    # ── Verify API ──
    print("Verifying Prolific API connection...")
    study = prolific_study_info(study_id, api_token)
    print(f"Study: {study.get('name', 'UNKNOWN')}")

    # ── Execute or dry run ──
    if dry_run:
        print("================================================================")
        print("  DRY RUN \u2014 no messages will be sent")
        print(f"  Would message: {len(filtered)} participants")
        print(f"  Disposition: {disposition_filter}")
        print("  Set DRY_RUN=false to send messages")
        print("================================================================")
    else:
        print("================================================================")
        print(f"  SENDING MESSAGES: {len(filtered)} participants")
        print(f"  Study: {study_id}")
        print(f"  Disposition: {disposition_filter}")
        print("================================================================")
        print()

        # Fetch fresh submission statuses
        print("Fetching fresh submission statuses...")
        subs = prolific_submissions(study_id, api_token)
        status_map = {s.get("participant_id", ""): s.get("status", "") for s in subs}
        print(f"Loaded {len(status_map)} statuses")
        print()

        sent = 0
        failed = 0
        skipped_actioned = 0
        skipped_not_found = 0
        skipped_messaged = 0

        for r in filtered:
            try:
                # Check submission status - require known status
                sub_status = status_map.get(r["pid"])
                if not sub_status:
                    skipped_not_found += 1
                    print(f"  SKIPPED {r['pid']} - not found in study submissions")
                    continue
                if sub_status in SKIP_STATUSES:
                    skipped_actioned += 1
                    print(f"  SKIPPED {r['pid']} - submission is {sub_status}")
                    continue

                # Check if already received this message type
                existing = prolific_user_messages(r["pid"], api_token)
                study_msgs = [
                    m for m in existing
                    if (m.get("data") or {}).get("study_id") == study_id
                ]
                signature = get_message_signature(r["disposition"])
                already_sent = any(signature in (m.get("body") or "") for m in study_msgs)
                if already_sent:
                    skipped_messaged += 1
                    print(f"  SKIPPED {r['pid']} - already received this {r['disposition']} message")
                    continue
                if study_msgs:
                    print(
                        f"  NOTE: {r['pid']} has {len(study_msgs)} existing message(s) "
                        "but none match this disposition type - sending new message"
                    )

                print(f"  Sending message to {r['pid']}...")
                prolific_send_message(study_id, r["pid"], r["message"], api_token)
                sent += 1
                print("    Sent successfully")
            except Exception as e:
                failed += 1
                print(f"    FAILED to send to {r['pid']}: {e}")

        print()
        print(
            f"SENT: {sent} | NOT FOUND: {skipped_not_found} "
            f"| SKIPPED (already actioned): {skipped_actioned} "
            f"| SKIPPED (already messaged): {skipped_messaged} | FAILED: {failed}"
        )

    # ── Step summary (aggregate counts only - no PIDs for participant privacy) ──
    if dry_run:
        results_lines = [
            f"- **Would message:** {len(filtered)} participants",
        ]
    else:
        results_lines = [
            f"- **Sent:** {sent}",
            f"- **Skipped (already actioned):** {skipped_actioned}",
            f"- **Skipped (already messaged):** {skipped_messaged}",
            f"- **Not found:** {skipped_not_found}",
            f"- **Failed:** {failed}",
        ]

    _append_step_summary("\n".join([
        "## Prolific Flagged Submission Messaging",
        "",
        f"- **Study ID:** {_md_escape(study_id)}",
        f"- **Disposition filter:** {disposition_filter}",
        f"- **Mode:** {'DRY RUN' if dry_run else 'LIVE'}",
        f"- **Matched:** {len(filtered)} participants",
        "",
        "### Results",
        "",
        *results_lines,
        "",
        "### Sample Message",
        "",
        "> " + filtered[0]["message"],
        "",
    ]))

    print()
    print("Done")


if __name__ == "__main__":
    main()
