#!/usr/bin/env python3
"""Investigate NO_DATA Prolific submissions with no matching Qualtrics record.

For Prolific submissions that show as AWAITING REVIEW but have no matching
PROLIFIC_PID in the Qualtrics export, this script:

  1. Fetches Prolific submission details (time taken, start/end times, status).
  2. Searches the Qualtrics CSV for:
       a. Exact PROLIFIC_PID match (sanity check).
       b. Partial PID matches — catches cases where a participant mis-typed
          their PID into the survey (>=8 consecutive chars in common).
       c. Time-window matches — Qualtrics responses whose EndDate falls
          within ±30 min of the Prolific completion time.
  3. Reports findings and recommends action for each PID.

Environment variables:
  PROLIFIC_API_TOKEN  — Prolific API token (required)
  PROLIFIC_STUDY_ID   — Prolific study ID (required)
  PID_LIST            — Comma-separated Prolific PIDs to investigate (required)
  QUALTRICS_CSV       — Path to Qualtrics CSV export (required)
"""

import csv
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

# Allow running from repo root or from scripts/analysis/
sys.path.insert(0, str(Path(__file__).parent))

from tabs_api import prolific_submissions  # noqa: E402

# ── Constants ────────────────────────────────────────────────

MIN_PARTIAL_MATCH_LEN = 8   # minimum consecutive chars for a partial PID match
TIME_WINDOW_MINUTES = 30    # ±minutes for a completion-time match


# ── Time helpers ─────────────────────────────────────────────

def _parse_prolific_time(ts: str) -> "datetime | None":
    """Parse a Prolific ISO 8601 timestamp into a UTC-aware datetime."""
    if not ts:
        return None
    for fmt in (
        "%Y-%m-%dT%H:%M:%S.%fZ",
        "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%dT%H:%M:%S+00:00",
    ):
        try:
            return datetime.strptime(ts, fmt).replace(tzinfo=timezone.utc)
        except ValueError:
            continue
    return None


def _parse_qualtrics_time(ts: str) -> "datetime | None":
    """Parse a Qualtrics EndDate timestamp into a UTC-aware datetime.

    Qualtrics exports dates as 'YYYY-MM-DD HH:MM:SS' in UTC.
    """
    if not ts:
        return None
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S"):
        try:
            return datetime.strptime(ts, fmt).replace(tzinfo=timezone.utc)
        except ValueError:
            continue
    return None


# ── Qualtrics CSV loading ─────────────────────────────────────

def load_qualtrics_csv(csv_path: str) -> "tuple[list[str], list[dict]]":
    """Load a Qualtrics CSV export, skipping the 2 metadata rows.

    Qualtrics CSVs have 3 header rows:
      Row 1: column names
      Row 2: human-readable question text
      Row 3: import/export format identifiers
    Data starts at row 4.

    Returns (headers, rows) where rows is a list of dicts keyed by header.
    """
    with open(csv_path, encoding="utf-8-sig", newline="") as f:
        reader = csv.reader(f)
        all_rows = list(reader)

    if len(all_rows) < 4:
        # Fewer rows than expected — treat everything after row 1 as data.
        headers = all_rows[0] if all_rows else []
        data_rows = all_rows[1:]
    else:
        headers = all_rows[0]
        data_rows = all_rows[3:]  # skip the 2 Qualtrics metadata rows

    rows = [
        dict(zip(headers, row))
        for row in data_rows
        if any(row)  # skip blank lines
    ]
    return headers, rows


# ── Matching logic ────────────────────────────────────────────

def find_partial_pid_matches(
    pid: str,
    qualtrics_rows: "list[dict]",
    min_len: int = MIN_PARTIAL_MATCH_LEN,
) -> "list[dict]":
    """Return rows where PROLIFIC_PID shares a long enough substring with pid.

    Checks whether any contiguous slice of the target PID (length ≥ min_len)
    appears inside the Qualtrics PROLIFIC_PID field.  This catches typos such
    as omitted or transposed characters.
    """
    pid_lower = pid.lower()
    matches = []
    for row in qualtrics_rows:
        q_pid = row.get("PROLIFIC_PID", "").strip().lower()
        if not q_pid:
            continue
        # Slide a window of increasing length over the target PID and check
        # for containment in the Qualtrics PID.
        found = False
        for length in range(min_len, len(pid) + 1):
            for start in range(len(pid) - length + 1):
                if pid_lower[start : start + length] in q_pid:
                    found = True
                    break
            if found:
                break
        if found:
            matches.append(row)
    return matches


def find_time_window_matches(
    completed_at: "datetime | None",
    qualtrics_rows: "list[dict]",
    window_minutes: int = TIME_WINDOW_MINUTES,
) -> "list[dict]":
    """Return rows whose Qualtrics EndDate is within ±window_minutes of completed_at.

    Each matched row gets an extra key ``_time_diff_minutes`` with the absolute
    difference in minutes.
    """
    if completed_at is None:
        return []
    matches = []
    for row in qualtrics_rows:
        end_date = row.get("EndDate", "").strip()
        q_time = _parse_qualtrics_time(end_date)
        if q_time is None:
            continue
        diff_sec = abs((completed_at - q_time).total_seconds())
        diff_min = diff_sec / 60
        if diff_min <= window_minutes:
            matches.append({**row, "_time_diff_minutes": round(diff_min, 1)})
    return matches


# ── Recommendation logic ──────────────────────────────────────

def recommend_action(
    exact_match: bool,
    partial_matches: "list[dict]",
    time_matches: "list[dict]",
    time_min: "float | None",
) -> str:
    """Return a short recommendation string for a NO_DATA PID.

    Priority order:
      1. Exact match found  → ALREADY_MATCHED (sanity flag; should not happen)
      2. Partial PID match  → INVESTIGATE_PARTIAL_MATCH
      3. Time-window match  → INVESTIGATE_TIME_MATCH
      4. Otherwise          → LIKELY_RETURN
    """
    if exact_match:
        return "ALREADY_MATCHED"
    if partial_matches:
        return "INVESTIGATE_PARTIAL_MATCH"
    if time_matches:
        return "INVESTIGATE_TIME_MATCH"
    return "LIKELY_RETURN"


# ── Main ──────────────────────────────────────────────────────

def main() -> None:
    token = os.environ.get("PROLIFIC_API_TOKEN")
    if not token:
        print("Error: PROLIFIC_API_TOKEN is required", file=sys.stderr)
        sys.exit(1)

    study_id = os.environ.get("PROLIFIC_STUDY_ID")
    if not study_id:
        print("Error: PROLIFIC_STUDY_ID is required", file=sys.stderr)
        sys.exit(1)

    pid_list_raw = os.environ.get("PID_LIST", "")
    if not pid_list_raw:
        print("Error: PID_LIST is required (comma-separated Prolific PIDs)", file=sys.stderr)
        sys.exit(1)

    qualtrics_csv = os.environ.get("QUALTRICS_CSV", "")
    if not qualtrics_csv:
        print("Error: QUALTRICS_CSV path is required", file=sys.stderr)
        sys.exit(1)

    pids = [p.strip() for p in pid_list_raw.split(",") if p.strip()]

    # ── Load Qualtrics data ──────────────────────────────────────
    print(f"Loading Qualtrics CSV: {qualtrics_csv}")
    try:
        _headers, qualtrics_rows = load_qualtrics_csv(qualtrics_csv)
    except FileNotFoundError:
        print(f"Error: Qualtrics CSV not found: {qualtrics_csv}", file=sys.stderr)
        sys.exit(1)

    qualtrics_pids = {row.get("PROLIFIC_PID", "").strip() for row in qualtrics_rows}
    print(f"Loaded {len(qualtrics_rows)} Qualtrics responses ({len(qualtrics_pids)} unique PIDs)")
    print()

    # ── Load Prolific submission details ─────────────────────────
    print(f"Fetching Prolific submissions for study {study_id}...")
    all_subs = prolific_submissions(study_id, token)
    sub_map = {s.get("participant_id", ""): s for s in all_subs}
    print(f"Fetched {len(all_subs)} submissions")
    print()

    # ── Per-PID investigation ────────────────────────────────────
    print("=" * 70)
    print("NO_DATA PID INVESTIGATION REPORT")
    print("=" * 70)
    print()

    results = []

    for pid in pids:
        print(f"--- {pid} ---")

        sub = sub_map.get(pid)
        if sub is None:
            print(f"  WARNING: PID not found in Prolific study {study_id}")
            print(f"  (Check that PROLIFIC_STUDY_ID={study_id} is correct)")
            print()
            results.append(
                {
                    "pid": pid,
                    "status": "NOT_IN_PROLIFIC",
                    "time_min": None,
                    "exact_match": False,
                    "partial_matches": 0,
                    "time_matches": 0,
                    "recommendation": "VERIFY_STUDY_ID",
                }
            )
            continue

        time_taken = sub.get("time_taken", 0) or 0
        time_min = round(time_taken / 60, 1)
        status = sub.get("status", "UNKNOWN")
        started = sub.get("started_at", "N/A")
        completed = sub.get("completed_at") or sub.get("returned_at") or "N/A"

        print(f"  Status:    {status}")
        print(f"  Time:      {time_min} min")
        print(f"  Started:   {started}")
        print(f"  Completed: {completed}")

        # 1. Exact PID match
        exact_match = pid in qualtrics_pids
        print(f"  Exact Qualtrics PID match: {'YES' if exact_match else 'NO'}")

        # 2. Partial PID matches
        partial_matches = find_partial_pid_matches(pid, qualtrics_rows)
        if partial_matches:
            print(f"  Partial PID matches ({MIN_PARTIAL_MATCH_LEN}+ chars): {len(partial_matches)}")
            for match in partial_matches[:5]:
                q_pid = match.get("PROLIFIC_PID", "").strip()
                q_end = match.get("EndDate", "")
                q_finished = match.get("Finished", "")
                print(f"    ↳ Qualtrics PID: {q_pid!r:30s}  EndDate: {q_end}  Finished: {q_finished}")
        else:
            print(f"  Partial PID matches ({MIN_PARTIAL_MATCH_LEN}+ chars): none")

        # 3. Time-window matches
        completed_dt = _parse_prolific_time(
            sub.get("completed_at") or sub.get("returned_at") or ""
        )
        time_matches = find_time_window_matches(completed_dt, qualtrics_rows)
        if time_matches:
            print(f"  Time-window matches (±{TIME_WINDOW_MINUTES} min): {len(time_matches)}")
            for match in time_matches[:5]:
                q_pid = match.get("PROLIFIC_PID", "").strip()
                q_end = match.get("EndDate", "")
                diff = match.get("_time_diff_minutes", "?")
                q_finished = match.get("Finished", "")
                print(
                    f"    ↳ Qualtrics PID: {q_pid!r:30s}  EndDate: {q_end}"
                    f"  Diff: {diff} min  Finished: {q_finished}"
                )
        else:
            print(f"  Time-window matches (±{TIME_WINDOW_MINUTES} min): none")

        recommendation = recommend_action(exact_match, partial_matches, time_matches, time_min)
        print(f"  → Recommendation: {recommendation}")
        print()

        results.append(
            {
                "pid": pid,
                "status": status,
                "time_min": time_min,
                "exact_match": exact_match,
                "partial_matches": len(partial_matches),
                "time_matches": len(time_matches),
                "recommendation": recommendation,
            }
        )

    # ── Summary table ─────────────────────────────────────────────
    print("=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print()
    print(f"  {'PID':<28}  {'Status':<18}  {'Min':>5}  {'Recommendation'}")
    print(f"  {'-'*28}  {'-'*18}  {'-'*5}  {'-'*30}")
    for r in results:
        pid = r["pid"]
        status = r["status"]
        time_min = f"{r['time_min']}" if r["time_min"] is not None else "N/A"
        rec = r["recommendation"]
        print(f"  {pid:<28}  {status:<18}  {time_min:>5}  {rec}")

    print()
    print("Recommendation key:")
    print("  INVESTIGATE_PARTIAL_MATCH  – A Qualtrics response has a similar (possibly")
    print("                               mis-typed) PID. Cross-check manually and, if")
    print("                               confirmed, approve and note the linkage.")
    print("  INVESTIGATE_TIME_MATCH     – A Qualtrics response completed around the")
    print("                               same time. Cross-check content manually.")
    print("  LIKELY_RETURN              – No data found anywhere. Request return so the")
    print("                               participant can re-take or be released.")
    print("  ALREADY_MATCHED            – Exact match found (should not appear in")
    print("                               NO_DATA list; verify input).")
    print("  VERIFY_STUDY_ID            – PID not found in Prolific study; confirm that")
    print("                               PROLIFIC_STUDY_ID is correct.")
    print()


if __name__ == "__main__":
    main()
