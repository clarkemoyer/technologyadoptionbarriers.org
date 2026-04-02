#!/usr/bin/env python3
"""
Enrich Qualtrics CSV with Prolific auth checks and submission statuses.

Merges the raw Qualtrics CSV export with:
  1. Prolific auth check scores (Auth_LLM, Auth_Bots)
  2. Prolific submission statuses (Prolific_Status)

The enriched CSV is used by the analysis pipeline so that Pipeline CLEAN
filtering accurately accounts for auth-flagged responses.

Usage:
    python enrich_qualtrics_csv.py \
        --qualtrics raw_export.csv \
        --auth-checks auth.csv \
        --output enriched.csv

    # Or with Prolific status:
    python enrich_qualtrics_csv.py \
        --qualtrics raw_export.csv \
        --auth-checks auth.csv \
        --statuses statuses.json \
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


def load_statuses(path: str) -> dict[str, str]:
    """Load submission statuses JSON into {PID: status}."""
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def enrich(
    qualtrics_path: str,
    auth_path: str | None,
    statuses_path: str | None,
    output_path: str,
) -> None:
    """Merge auth checks and statuses into the Qualtrics CSV."""
    auth_data = load_auth_checks(auth_path) if auth_path else {}
    status_data = load_statuses(statuses_path) if statuses_path else {}

    with open(qualtrics_path, encoding="utf-8-sig") as f:
        raw_lines = f.readlines()

    if len(raw_lines) < 4:
        print("ERROR: Qualtrics CSV must have 3 header rows + data")
        sys.exit(1)

    # Parse the header row to find PROLIFIC_PID column
    reader = csv.reader([raw_lines[0]])
    headers = next(reader)

    pid_idx = -1
    for i, h in enumerate(headers):
        if h.strip() == "PROLIFIC_PID":
            pid_idx = i
            break

    if pid_idx == -1:
        print("ERROR: PROLIFIC_PID column not found in CSV")
        sys.exit(1)

    # Add new columns
    new_cols = []
    if auth_data:
        new_cols.extend(["Auth_LLM", "Auth_Bots"])
    if status_data:
        new_cols.append("Prolific_Status")

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", newline="", encoding="utf-8") as out:
        writer = csv.writer(out)

        for line_idx, line in enumerate(raw_lines):
            row = next(csv.reader([line]))

            if line_idx < 3:
                # Header rows: append column names (row 0) or empty cells (rows 1-2)
                if line_idx == 0:
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
                    row.append(status_data.get(pid, ""))

            writer.writerow(row)

    # Count enrichment hits
    data_rows = len(raw_lines) - 3
    auth_hits = sum(1 for line in raw_lines[3:] if next(csv.reader([line]))[pid_idx].strip() in auth_data) if auth_data else 0
    status_hits = sum(1 for line in raw_lines[3:] if next(csv.reader([line]))[pid_idx].strip() in status_data) if status_data else 0

    print(f"Enriched {data_rows} rows → {output_path}")
    if auth_data:
        print(f"  Auth checks matched: {auth_hits}/{data_rows}")
    if status_data:
        print(f"  Statuses matched: {status_hits}/{data_rows}")


def main():
    parser = argparse.ArgumentParser(description="Enrich Qualtrics CSV with Prolific data")
    parser.add_argument("--qualtrics", required=True, help="Raw Qualtrics CSV export")
    parser.add_argument("--auth-checks", help="Auth checks CSV (PROLIFIC_PID,Auth_LLM,Auth_Bots)")
    parser.add_argument("--statuses", help="Submission statuses JSON ({PID: status})")
    parser.add_argument("--output", required=True, help="Enriched CSV output path")
    args = parser.parse_args()

    enrich(args.qualtrics, args.auth_checks, args.statuses, args.output)


if __name__ == "__main__":
    main()
