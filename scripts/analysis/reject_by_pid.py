#!/usr/bin/env python3
"""
DESTRUCTIVE: Reject AWAITING REVIEW submissions by PID, disposition-aware.

Generalises `reject_auto_exclude.py` to support the explicitly handled
disposition types in `_classify_and_build()` (currently AUTO-EXCLUDE and the
modelled FLAG-* variants). Intended for stale PIDs that received a formal API
request-return and did not respond within the 48h window — see
`find_stale_return_requested.py` for the upstream triage.

A disposition not in the handled set will abort the run rather than inventing
an unmodelled rejection reason.

The rejection message and Prolific rejection categories are chosen per-PID
from the disposition CSV for supported dispositions, so a FLAG-SMEAL stale PID
gets a speed-framed message and TOO_QUICKLY category while an
AUTO-EXCLUDE:IRI3 stale PID gets an attention-check message and
FAILED_ATTENTION_CHECK category.

Environment variables:
  PROLIFIC_API_TOKEN  - Prolific API token (required)
  STUDY_ID            - Prolific study ID (required)
  CSV_FILE_PATH       - Path to disposition CSV (required)
  PID_LIST            - Comma-separated PIDs to reject (required)
  CONFIRM_REJECT      - Must be exactly "REJECT" for live
  DRY_RUN             - When "false" AND CONFIRM_REJECT=="REJECT", reject live

Exits non-zero if:
  - Required env vars are missing
  - A PID in PID_LIST is not found in the CSV (safety: refuse to reject an
    unknown PID, since we would not know how to build a fair message)
  - A disposition is not one of the explicitly-handled types (refuse to
    invent a rejection reason for disposition types we have not modelled)
  - Any PID is not in AWAITING REVIEW status on Prolific at the time of
    the live run (prevents mid-run errors from stale-status PIDs)
  - Any target PID could not be resolved to a submission ID after the live
    rejection loop (indicates a PID was silently skipped)
"""

import csv
import json
import os
import sys
from pathlib import Path
from typing import Dict, List, Tuple

sys.path.insert(0, str(Path(__file__).parent))

from tabs_api import (
    REJECTION_CATEGORIES,
    prolific_get_submission_ids_map,
    prolific_reject_submission,
    prolific_study_info,
    prolific_submission_statuses,
)

# Load the Smeal speed threshold from the shared constants file so this script
# stays in sync with the disposition logic in tabs_v2_data_audit.py.
_CONSTANTS_PATH = Path(__file__).parent / "tabs_v2_constants.json"
_CONSTANTS = json.loads(_CONSTANTS_PATH.read_text(encoding="utf-8")) if _CONSTANTS_PATH.exists() else {}
_SMEAL_SECONDS = _CONSTANTS.get("DURATION_THRESHOLDS", {}).get("smealBenchmarkMin", 300)
SMEAL_BENCHMARK_MIN: float = _SMEAL_SECONDS / 60  # convert to minutes for message text


def _require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        print(f"Error: {name} is required", file=sys.stderr)
        sys.exit(1)
    return value


def _fmt_minutes(duration_seconds: int) -> str:
    return f"{duration_seconds / 60:.1f}"


def _safe_int(row: Dict[str, str], key: str) -> int:
    """Parse an integer field from a CSV row, returning 0 for missing/non-integer values."""
    raw = (row.get(key) or "").strip()
    return int(raw) if raw.isdigit() else 0


# ── Per-disposition message + category builders ──────────────────────────
# Each builder takes the raw CSV row fields it needs and returns
# (message, categories). Common prefix/suffix are handled at the call site.


def _build_auto_exclude(duration: int, iri_fail: int, speed_flag: int) -> Tuple[str, List[str]]:
    reasons = []
    if speed_flag == 1:
        reasons.append(f"it was completed in {_fmt_minutes(duration)} minutes (below our {SMEAL_BENCHMARK_MIN:.0f}-minute minimum)")
    reasons.append(f"{iri_fail} of 3 embedded attention checks were answered incorrectly")
    reason_text = " and ".join(reasons)
    msg = (
        "Hi, thank you for participating in our Technology Adoption Barriers Survey. "
        f"Unfortunately, your submission has been rejected because {reason_text}. "
        "These checks are designed to confirm that respondents are reading each question "
        "carefully. If you believe this is an error, please reply to this message with any "
        "questions."
    )
    cats = [REJECTION_CATEGORIES["FAILED_ATTENTION_CHECK"]]
    if speed_flag == 1:
        cats.append(REJECTION_CATEGORIES["TOO_QUICKLY"])
    cats.append(REJECTION_CATEGORIES["OTHER"])
    return msg, cats


def _build_flag_single_iri(_duration: int, iri_fail: int) -> Tuple[str, List[str]]:
    msg = (
        "Hi, thank you for participating in our Technology Adoption Barriers Survey. "
        "Unfortunately, your submission has been rejected because one of the 3 embedded "
        "attention-check questions was answered differently than the instructions specified. "
        "We asked you to review this via a return-offer message; we did not receive a reply "
        "within the review window, so we are unable to verify the answer. If you believe "
        "this is an error, please reply to this message with any questions."
    )
    return msg, [REJECTION_CATEGORIES["FAILED_ATTENTION_CHECK"], REJECTION_CATEGORIES["OTHER"]]


def _build_flag_smeal(duration: int) -> Tuple[str, List[str]]:
    msg = (
        "Hi, thank you for participating in our Technology Adoption Barriers Survey. "
        f"Unfortunately, your submission has been rejected because the completion time of "
        f"{_fmt_minutes(duration)} minutes was well below the typical time needed to read "
        "and answer the survey carefully. We offered you the option to return the submission "
        "voluntarily; we did not receive a reply within the review window. If you believe "
        "this is an error, please reply to this message with any questions."
    )
    return msg, [REJECTION_CATEGORIES["TOO_QUICKLY"], REJECTION_CATEGORIES["OTHER"]]


def _build_flag_speed(duration: int) -> Tuple[str, List[str]]:
    msg = (
        "Hi, thank you for participating in our Technology Adoption Barriers Survey. "
        f"Unfortunately, your submission has been rejected because it was completed in "
        f"{_fmt_minutes(duration)} minutes, below our {SMEAL_BENCHMARK_MIN:.0f}-minute minimum. We offered you the "
        "option to return the submission voluntarily; we did not receive a reply within the "
        "review window. If you believe this is an error, please reply to this message with "
        "any questions."
    )
    return msg, [REJECTION_CATEGORIES["TOO_QUICKLY"], REJECTION_CATEGORIES["OTHER"]]


def _build_flag_partial_straightlining(duration: int) -> Tuple[str, List[str]]:
    msg = (
        "Hi, thank you for participating in our Technology Adoption Barriers Survey. "
        "Unfortunately, your submission has been rejected because several blocks of answers "
        "showed an identical-response pattern that suggests the questions were not read "
        "carefully. We offered you the option to return the submission voluntarily; we did "
        "not receive a reply within the review window. If you believe this is an error, "
        "please reply to this message with any questions."
    )
    return msg, [REJECTION_CATEGORIES["LOW_EFFORT"], REJECTION_CATEGORIES["OTHER"]]


def _build_flag_recaptcha(duration: int) -> Tuple[str, List[str]]:
    msg = (
        "Hi, thank you for participating in our Technology Adoption Barriers Survey. "
        "Unfortunately, your submission has been rejected because the reCAPTCHA authenticity "
        "score was below our threshold. We offered you the option to return the submission "
        "voluntarily; we did not receive a reply within the review window. If you believe "
        "this is an error, please reply to this message with any questions."
    )
    return msg, [REJECTION_CATEGORIES["FAILED_AUTHENTICITY_CHECK"], REJECTION_CATEGORIES["OTHER"]]


def _classify_and_build(row: Dict[str, str]) -> Tuple[str, List[str]]:
    """Return (message, categories) for the row's disposition.

    Raises ValueError if the disposition is not one of the handled types.
    """
    duration = _safe_int(row, "Duration_Seconds")
    iri_fail = _safe_int(row, "IRI_Fail_Count")
    speed_flag = _safe_int(row, "Speed_Flag")
    disposition = (row.get("Disposition") or "").strip()

    if disposition == "AUTO-EXCLUDE":
        return _build_auto_exclude(duration, iri_fail, speed_flag)
    if disposition == "FLAG-SINGLE-IRI":
        return _build_flag_single_iri(duration, iri_fail)
    if disposition == "FLAG-SMEAL":
        return _build_flag_smeal(duration)
    if disposition == "FLAG-SPEED":
        return _build_flag_speed(duration)
    if disposition == "FLAG-PARTIAL-STRAIGHTLINING":
        return _build_flag_partial_straightlining(duration)
    if disposition == "FLAG-RECAPTCHA":
        return _build_flag_recaptcha(duration)

    raise ValueError(
        f"Unhandled disposition {disposition!r} for PID {row.get('PROLIFIC_PID')}"
    )


# ── Main ─────────────────────────────────────────────────────────────────


def main() -> None:
    print("================================================================")
    print("  DESTRUCTIVE OPERATION: Reject stale PIDs by disposition")
    print("================================================================")
    print()

    api_token = _require_env("PROLIFIC_API_TOKEN")
    study_id = _require_env("STUDY_ID")
    csv_path = _require_env("CSV_FILE_PATH")
    pid_list_raw = _require_env("PID_LIST")
    dry_run = os.environ.get("DRY_RUN", "true").strip().lower() != "false"
    confirm = os.environ.get("CONFIRM_REJECT", "").strip()

    if not dry_run and confirm != "REJECT":
        print("================================================================", file=sys.stderr)
        print('  SAFETY STOP: CONFIRM_REJECT must be exactly "REJECT"', file=sys.stderr)
        print(f'  Received: "{confirm}"', file=sys.stderr)
        print("================================================================", file=sys.stderr)
        sys.exit(1)

    target_pids: List[str] = []
    seen_pids: set = set()
    for raw_pid in pid_list_raw.split(","):
        pid = raw_pid.strip()
        if not pid:
            continue
        if pid in seen_pids:
            print(f"WARNING: duplicate PID in PID_LIST (ignored): {pid}", file=sys.stderr)
            continue
        seen_pids.add(pid)
        target_pids.append(pid)
    if not target_pids:
        print("Error: PID_LIST must contain at least one PID", file=sys.stderr)
        sys.exit(1)

    print(f"Target PIDs: {len(target_pids)}")
    print(f"Mode: {'DRY RUN' if dry_run else 'LIVE REJECTION'}")
    print()

    # Load CSV and index by PID
    print(f"Reading disposition CSV from {csv_path}")
    with open(csv_path, encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        rows_by_pid: Dict[str, Dict[str, str]] = {}
        for row in reader:
            pid = (row.get("PROLIFIC_PID") or "").strip()
            if pid:
                rows_by_pid[pid] = row

    print(f"  Loaded {len(rows_by_pid)} rows.")
    print()

    missing = [p for p in target_pids if p not in rows_by_pid]
    if missing:
        print("Error: the following PIDs are not in the disposition CSV:", file=sys.stderr)
        for p in missing:
            print(f"  {p}", file=sys.stderr)
        print(
            "Refusing to reject unknown PIDs - re-run the triage pipeline or correct the CSV.",
            file=sys.stderr,
        )
        sys.exit(1)

    # Build rejection plan
    records: List[Dict] = []
    for pid in target_pids:
        row = rows_by_pid[pid]
        try:
            msg, cats = _classify_and_build(row)
        except ValueError as e:
            print(f"Error: {e}", file=sys.stderr)
            sys.exit(1)
        records.append({
            "pid": pid,
            "disposition": (row.get("Disposition") or "").strip(),
            "duration": _safe_int(row, "Duration_Seconds"),
            "iri_fail": _safe_int(row, "IRI_Fail_Count"),
            "speed_flag": _safe_int(row, "Speed_Flag"),
            "message": msg,
            "categories": cats,
        })

    # Log everything before doing anything destructive
    by_disp: Dict[str, List[str]] = {}
    print("Rejection plan:")
    for r in records:
        by_disp.setdefault(r["disposition"], []).append(r["pid"])
        print(f"  PID: {r['pid']}")
        print(
            f"    Disposition: {r['disposition']} | Duration: {_fmt_minutes(r['duration'])} min "
            f"| IRI Failed: {r['iri_fail']}/3 | Speed: {'TOO FAST' if r['speed_flag'] == 1 else 'OK'}"
        )
        print(f"    Categories: {', '.join(r['categories'])}")
        print(f"    Message: {r['message']}")
        print()

    print("By disposition:")
    for disp, pids in sorted(by_disp.items()):
        print(f"  {disp}: {len(pids)}")
    print()

    if dry_run:
        print("================================================================")
        print("  DRY RUN - no submissions will be rejected")
        print(f"  Would reject: {len(records)} participants")
        print("  Set DRY_RUN=false and CONFIRM_REJECT=REJECT to execute")
        print("================================================================")
        return

    # Verify Prolific access before touching anything
    print("Verifying Prolific API connection...")
    study = prolific_study_info(study_id, api_token)
    print(f"  Study: {study.get('name', 'UNKNOWN')} (status: {study.get('status', 'UNKNOWN')})")
    print()

    # Look up submission IDs for all PIDs up front
    print("Looking up submission IDs...")
    pid_to_sub_id = prolific_get_submission_ids_map(study_id, [r["pid"] for r in records], api_token)
    print(f"  Resolved {len([p for p in pid_to_sub_id if pid_to_sub_id[p]])} / {len(records)}")
    print()

    # Pre-validate that every target PID is currently AWAITING REVIEW.
    # Any other status (APPROVED, RETURNED, REJECTED, …) would cause the
    # Prolific API to error mid-run and leave a partial/unclear outcome.
    print("Pre-validating submission statuses...")
    status_map = prolific_submission_statuses(study_id, api_token)
    not_rejectable: List[str] = []
    for r in records:
        status = status_map.get(r["pid"], "NOT FOUND")
        if status != "AWAITING REVIEW":
            print(f"  WARNING: PID {r['pid']} has status {status!r} — expected AWAITING REVIEW", file=sys.stderr)
            not_rejectable.append(r["pid"])
    if not_rejectable:
        print(
            f"\nAborting: {len(not_rejectable)} PID(s) are not in AWAITING REVIEW status.",
            file=sys.stderr,
        )
        print("Re-run the triage to confirm current statuses before rejecting.", file=sys.stderr)
        sys.exit(1)
    print(f"  All {len(records)} PIDs confirmed AWAITING REVIEW.")
    print()

    not_found: List[str] = []
    rejected = 0

    print("================================================================")
    print(f"  LIVE REJECTION: {len(records)} submissions")
    print("================================================================")
    print()

    for r in records:
        sub_id = pid_to_sub_id.get(r["pid"])
        if not sub_id:
            print(f"  WARNING: No submission found for PID {r['pid']} - skipping")
            not_found.append(r["pid"])
            continue

        print(f"  Rejecting {r['pid']} ({r['disposition']}, submission {sub_id})...")
        prolific_reject_submission(sub_id, r["categories"], r["message"], api_token)
        rejected += 1

    print()
    print(f"REJECTED: {rejected} | NOT FOUND: {len(not_found)}")
    if not_found:
        print(
            f"Error: {len(not_found)} PID(s) could not be resolved to a submission ID and were NOT rejected: "
            f"{', '.join(not_found)}",
            file=sys.stderr,
        )
        sys.exit(1)


if __name__ == "__main__":
    main()
