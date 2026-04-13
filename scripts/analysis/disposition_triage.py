#!/usr/bin/env python3
"""
TABS V2 Disposition Triage CLI (Python)

Drop-in replacement for scripts/disposition-triage.ts.
Reads a Qualtrics CSV export, computes dispositions using the 10-step
waterfall, and writes a disposition CSV with the same columns and format
as the TypeScript version.

Environment variables:
  INPUT_PATH   – Path to the raw Qualtrics CSV export (required)
  OUTPUT_PATH  – Path to write the disposition CSV (required)
"""

import csv
import os
import sys
from pathlib import Path

# Add analysis dir to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from tabs_v2_data_audit import parse_csv


# CSV column order matching scripts/disposition-triage.ts exactly
CSV_HEADERS = [
    "PROLIFIC_PID",
    "Finished",
    "Duration_Seconds",
    "Auth_LLM",
    "Auth_Bots",
    "Auth_Flag",
    "IRI_Barrier_Pass",
    "IRI_Readiness_Pass",
    "IRI_Maturity_Pass",
    "IRI_Pass_Count",
    "IRI_Fail_Count",
    "Speed_Flag",
    "Smeal_Benchmark_Flag",
    "reCAPTCHA_Score",
    "reCAPTCHA_Flag",
    "Straightlining_Count",
    "Straightlining_Flag",
    "Partial_Straightlining_Flag",
    "Partial_Straightlining_Blocks",
    "Disposition",
]


def compute_auth_flag(row: dict) -> int:
    """Derive Auth_Flag from Auth_LLM and Auth_Bots when present, otherwise 0.

    Note: The TS pipeline hardcodes Auth_LLM/Auth_Bots/Auth_Flag to empty/0
    in triageCsv() (src/lib/disposition.ts lines 259-261). This Python version
    reads the actual values from enrichment columns when present.
    """
    llm = str(row.get("Auth_LLM", "")).strip().upper()
    bots = str(row.get("Auth_Bots", "")).strip().upper()
    if llm in ("LOW", "MIXED") or bots in ("LOW", "MIXED"):
        return 1
    return 0


def stringify_csv_value(value: object) -> str:
    """Stringify values to match TS/JS Number#toString semantics.

    Python str(1.0) → "1.0" but JS String(1.0) → "1". This matters for
    fields like reCAPTCHA_Score where downstream scripts may compare strings.

    Also normalizes NaN/Infinity to JS spellings:
      Python nan → JS NaN, Python inf → JS Infinity.
    """
    if value is None:
        return ""
    if isinstance(value, float):
        import math
        if math.isnan(value):
            return "NaN"
        if math.isinf(value):
            return "Infinity" if value > 0 else "-Infinity"
        if value.is_integer():
            return str(int(value))
    return str(value)


def rows_to_csv(rows: list[dict]) -> str:
    """Convert disposition rows to CSV string matching TS format."""
    lines = [",".join(CSV_HEADERS)]
    for row in rows:
        row["Auth_Flag"] = compute_auth_flag(row)
        values = [stringify_csv_value(row.get(h, "")) for h in CSV_HEADERS]
        lines.append(",".join(values))
    return "\n".join(lines) + "\n"


def generate_summary(rows: list[dict]) -> str:
    """Generate GitHub step summary markdown."""
    if not rows:
        return "## TABS V2 Disposition Triage\n\n**No responses to triage.**\n"

    counts: dict[str, int] = {}
    for row in rows:
        d = row["Disposition"]
        counts[d] = counts.get(d, 0) + 1

    order = [
        "CLEAN", "FLAG-AUTH-FAIL", "FLAG-AUTH-MIXED", "AUTO-EXCLUDE",
        "FLAG-SPEED", "FLAG-SINGLE-IRI", "FLAG-SMEAL", "FLAG-RECAPTCHA",
        "FLAG-STRAIGHTLINING", "FLAG-PARTIAL-STRAIGHTLINING", "INCOMPLETE",
    ]

    table_rows = []
    for d in order:
        if d in counts:
            pct = (counts[d] / len(rows)) * 100
            table_rows.append(f"| {d} | {counts[d]} | {pct:.1f}% |")

    return "\n".join([
        "## TABS V2 Disposition Triage",
        "",
        f"**Total responses:** {len(rows)}",
        "",
        "| Disposition | Count | % |",
        "|---|---:|---:|",
        *table_rows,
        "",
    ])


REQUIRED_COLUMNS = [
    "PROLIFIC_PID",
    "Finished",
    "Duration (in seconds)",
    "Q10-28_Barriers_19",
    "Q47-64_Readiness_18",
    "Q65-73_Maturity_9",
    "Q_RecaptchaScore",
    "Q_StraightliningCount",
]


def verify_headers(csv_path: str) -> None:
    """Verify required columns exist in the Qualtrics CSV (replaces check-export-headers.ts)."""
    with open(csv_path, encoding="utf-8-sig", newline="") as f:
        reader = csv.reader(f)
        try:
            headers = next(reader)
        except StopIteration:
            print("ERROR: CSV file is empty")
            sys.exit(1)

    if not headers or all(h.strip() == "" for h in headers):
        print("ERROR: CSV file has no valid headers")
        sys.exit(1)

    missing = [col for col in REQUIRED_COLUMNS if col not in headers]
    if missing:
        print(f"ERROR: Missing required columns: {missing}")
        print(f"Available columns ({len(headers)}): {headers[:10]}...")
        sys.exit(1)

    print(f"Header verification passed ({len(headers)} columns, all {len(REQUIRED_COLUMNS)} required columns present)")


def main():
    input_path = os.environ.get("INPUT_PATH")
    output_path = os.environ.get("OUTPUT_PATH")

    if not input_path or not output_path:
        print("Error: INPUT_PATH and OUTPUT_PATH are required")
        sys.exit(1)

    print(f"Reading Qualtrics export from {input_path}")
    verify_headers(input_path)
    rows = parse_csv(input_path)
    print(f"Triaged {len(rows)} responses")

    csv_content = rows_to_csv(rows)
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    Path(output_path).write_text(csv_content, encoding="utf-8")
    print(f"Wrote disposition CSV to {output_path}")

    summary = generate_summary(rows)
    print(summary)

    # Write to GitHub step summary if available
    summary_file = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary_file:
        with open(summary_file, "a") as f:
            f.write(summary)


if __name__ == "__main__":
    main()
