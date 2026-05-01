#!/usr/bin/env python3
"""
Enrich Qualtrics CSV with Prolific auth checks, submission statuses, and,
optionally, demographics.

Merges the raw Qualtrics CSV export with:
  1. Prolific auth check scores (Auth_LLM, Auth_Bots)
  2. Prolific submission statuses (Prolific_Status)
  3. Optional Prolific participant demographics (age, sex, country, etc.)

In production, the analysis pipeline uses this enrichment step for auth
checks and submission statuses so Pipeline CLEAN filtering can account for
auth-flagged responses. Demographics can still be merged when explicitly
provided to this script for manual or ad hoc workflows, but they are not
fetched/provided by the production analysis pipeline and should not be
treated as a pipeline artifact (they contain per-participant personal data).

Usage:
    # Production (auth + statuses only):
    python enrich_qualtrics_csv.py \
        --qualtrics raw_export.csv \
        --auth-checks auth.csv \
        --statuses statuses.json \
        --output enriched.csv

    # Ad hoc (with demographics):
    python enrich_qualtrics_csv.py \
        --qualtrics raw_export.csv \
        --auth-checks auth.csv \
        --statuses statuses.json \
        --demographics demographics.csv \
        --output enriched.csv
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from pathlib import Path


def load_auth_checks(path: str) -> dict[str, dict[str, str]]:
    """Load auth checks CSV into {PID: {Auth_LLM, Auth_Bots}}."""
    result = {}
    with open(path, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            pid = row.get("PROLIFIC_PID", "").strip()
            if pid:
                result[pid] = {
                    "Auth_LLM": row.get("Auth_LLM", "").strip(),
                    "Auth_Bots": row.get("Auth_Bots", "").strip(),
                }
    return result


def load_statuses(path: str) -> dict[str, dict[str, str]]:
    """Load submission summaries JSON into {PID: {status, completed_at, started_at}}.

    Accepts both the legacy shape ``{PID: status_string}`` (older
    statuses.json artifacts) and the current shape
    ``{PID: {status, completed_at, started_at}}`` written by
    fetch_prolific_data.py. Older shape values are normalised so callers
    can rely on the same dict layout regardless of source.
    """
    with open(path, encoding="utf-8") as f:
        raw = json.load(f)

    normalised: dict[str, dict[str, str]] = {}
    for pid, value in raw.items():
        if not pid or not pid.strip():
            continue
        if isinstance(value, dict):
            normalised[pid] = {
                "status": value.get("status", "") or "",
                "completed_at": value.get("completed_at", "") or "",
                "started_at": value.get("started_at", "") or "",
            }
        else:
            # Legacy shape: bare status string, no timestamps available.
            normalised[pid] = {
                "status": str(value) if value is not None else "",
                "completed_at": "",
                "started_at": "",
            }
    return normalised


def load_demographics(path: str) -> tuple[list[str], dict[str, dict[str, str]]]:
    """Load demographics CSV into (column_names, {PID: {col: val}}).

    The Prolific bulk demographic export has a 'participant_id' column.
    Returns the demographic column names (excluding participant_id) and
    a dict keyed by PID with all demographic values.
    """
    result: dict[str, dict[str, str]] = {}
    demo_cols: list[str] = []
    with open(path, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        if reader.fieldnames:
            demo_cols = [c for c in reader.fieldnames if c != "participant_id"]
        for row in reader:
            pid = row.get("participant_id", "").strip()
            if pid:
                result[pid] = {col: row.get(col, "").strip() for col in demo_cols}
    return demo_cols, result


def enrich(
    qualtrics_path: str,
    auth_path: str | None,
    statuses_path: str | None,
    demographics_path: str | None,
    output_path: str,
) -> None:
    """Merge auth checks, statuses, and demographics into the Qualtrics CSV."""
    auth_data = load_auth_checks(auth_path) if auth_path else {}
    status_data = load_statuses(statuses_path) if statuses_path else {}
    demo_cols: list[str] = []
    demo_data: dict[str, dict[str, str]] = {}
    if demographics_path:
        demo_cols, demo_data = load_demographics(demographics_path)

    # Read entire CSV with csv.reader to handle quoted fields with embedded
    # newlines. Loads all rows into memory - acceptable for survey-scale data
    # (typically <10K rows). For larger datasets, consider streaming.
    with open(qualtrics_path, encoding="utf-8-sig") as f:
        reader = csv.reader(f)
        all_rows = list(reader)

    if len(all_rows) < 4:
        print("ERROR: Qualtrics CSV must have 3 header rows + data")
        sys.exit(1)

    headers = all_rows[0]

    pid_idx = -1
    for i, h in enumerate(headers):
        if h.strip() == "PROLIFIC_PID":
            pid_idx = i
            break

    if pid_idx == -1:
        print("ERROR: PROLIFIC_PID column not found in CSV")
        sys.exit(1)

    # Add new columns
    new_cols: list[str] = []
    if auth_data:
        new_cols.extend(["Auth_LLM", "Auth_Bots"])
    if status_data:
        # Prolific_Status keeps the existing column name for backward
        # compatibility. Prolific_Completed_At and Prolific_Started_At are
        # the canonical anchors for 21-day auto-approve runway calculations.
        new_cols.extend(["Prolific_Status", "Prolific_Completed_At", "Prolific_Started_At"])
    # Prefix Prolific demographic columns to avoid collision with Qualtrics columns
    prefixed_demo_cols = [f"Prolific_{c}" for c in demo_cols]
    new_cols.extend(prefixed_demo_cols)

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", newline="", encoding="utf-8") as out:
        writer = csv.writer(out)

        for row_idx, row in enumerate(all_rows):
            if row_idx < 3:
                # Header rows: append column names (row 0) or empty cells (rows 1-2)
                if row_idx == 0:
                    row.extend(new_cols)
                else:
                    row.extend([""] * len(new_cols))
            else:
                # Data rows: look up PID and merge
                pid = row[pid_idx].strip() if pid_idx < len(row) else ""
                auth = auth_data.get(pid, {})
                if "Auth_LLM" in new_cols:
                    row.append(auth.get("Auth_LLM", ""))
                    row.append(auth.get("Auth_Bots", ""))
                if "Prolific_Status" in new_cols:
                    summary = status_data.get(pid, {})
                    row.append(summary.get("status", ""))
                    row.append(summary.get("completed_at", ""))
                    row.append(summary.get("started_at", ""))
                # Append demographic values in the same order as prefixed_demo_cols
                demo = demo_data.get(pid, {})
                for col in demo_cols:
                    row.append(demo.get(col, ""))

            writer.writerow(row)

    # Count enrichment hits
    data_rows = len(all_rows) - 3
    auth_hits = (
        sum(1 for row in all_rows[3:] if pid_idx < len(row) and row[pid_idx].strip() in auth_data)
        if auth_data else 0
    )
    status_hits = (
        sum(1 for row in all_rows[3:] if pid_idx < len(row) and row[pid_idx].strip() in status_data)
        if status_data else 0
    )
    demo_hits = (
        sum(1 for row in all_rows[3:] if pid_idx < len(row) and row[pid_idx].strip() in demo_data)
        if demo_data else 0
    )

    print(f"Enriched {data_rows} rows → {output_path}")
    if auth_data:
        print(f"  Auth checks: {len(auth_data)} PIDs in source, {auth_hits}/{data_rows} matched")
    if status_data:
        print(f"  Statuses: {len(status_data)} PIDs in source, {status_hits}/{data_rows} matched")
    if demo_data:
        print(f"  Demographics matched: {demo_hits}/{data_rows} ({len(demo_cols)} columns)")


def main():
    parser = argparse.ArgumentParser(description="Enrich Qualtrics CSV with Prolific data")
    parser.add_argument("--qualtrics", required=True, help="Raw Qualtrics CSV export")
    parser.add_argument("--auth-checks", help="Auth checks CSV (PROLIFIC_PID,Auth_LLM,Auth_Bots)")
    parser.add_argument("--statuses", help="Submission statuses JSON ({PID: status})")
    parser.add_argument("--demographics", help="Prolific demographics CSV (participant_id + demographic columns)")
    parser.add_argument("--output", required=True, help="Enriched CSV output path")
    args = parser.parse_args()

    enrich(args.qualtrics, args.auth_checks, args.statuses, args.demographics, args.output)


if __name__ == "__main__":
    main()
