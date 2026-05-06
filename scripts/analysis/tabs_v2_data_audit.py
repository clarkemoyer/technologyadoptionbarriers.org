#!/usr/bin/env python3
"""
TABS V2 Data Audit and Disposition Waterfall
==============================================

Implements the complete 10-step disposition waterfall from TypeScript (src/lib/disposition.ts)
to classify survey responses as CLEAN, FLAG-*, AUTO-EXCLUDE, or INCOMPLETE.

Features:
  - Deduplication by Prolific PID (uses latest attempt)
  - IRI (Inattentive Responding Indicator) criterion validity checks
  - Prolific Auth checks (LLM, Bots detection)
  - Speed and Smeal benchmark flags
  - reCAPTCHA score validation
  - Full-block straightlining detection (Qualtrics Q_StraightliningCount)
  - Partial straightlining via within-person SD per block (Meade & Craig 2012)
  - Comprehensive disposition reporting

Usage:
    python tabs_v2_data_audit.py --input test_data.csv
    python tabs_v2_data_audit.py --input production_export.csv

Output:
    data_audit_results.json: JSON summary for React consumption
    Printed summary to stdout

Author: Clarke Moyer, Penn State Smeal DBA
Reference: src/lib/disposition.ts
"""

import argparse
import csv
import json
import math
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple


# ─────────────────────────────────────────────────────────────
# Configuration & Constants (loaded from shared tabs_v2_constants.json)
# ─────────────────────────────────────────────────────────────

_CONSTANTS_PATH = Path(__file__).parent / "tabs_v2_constants.json"
if _CONSTANTS_PATH.exists():
    with open(_CONSTANTS_PATH, encoding="utf-8") as _f:
        _CONSTANTS = json.load(_f)
else:
    _CONSTANTS = {}

# Survey blocks for partial straightlining detection
# Use substantive item counts only - IRI items have predetermined correct
# answers and must NOT be included in within-person SD calculations.
# Including IRIs artificially inflates variance and masks straightlining.
# See Issue #735 for the root-cause analysis.
SURVEY_BLOCKS = [
    {
        "name": name.title(),
        "prefix": _CONSTANTS.get("COLUMN_PREFIXES", {}).get(name, f"Q_{name}_"),
        "count": _CONSTANTS.get("ITEM_COUNTS", {}).get(name, 0),  # substantive items only (excludes IRI)
    }
    for name in ["barriers", "readiness", "maturity"]
] if _CONSTANTS else [
    {"name": "Barriers", "prefix": "Q10-28_Barriers_", "count": 18},
    {"name": "Readiness", "prefix": "Q47-64_Readiness_", "count": 17},
    {"name": "Maturity", "prefix": "Q65-73_Maturity_", "count": 8},
]

PARTIAL_STRAIGHTLINING_SD_THRESHOLD = 0.5

# IRI expected answers
_iri = _CONSTANTS.get("IRI_EXPECTED_ANSWERS", {})
IRI_BARRIER_ANSWER = _iri.get("barrier", "Major Barrier")
IRI_READINESS_ANSWER = _iri.get("readiness", "Low Readiness/Capability")
IRI_MATURITY_ANSWER = _iri.get("maturity", "Level 2: Developing/Repeatable")

# Duration thresholds
_dur = _CONSTANTS.get("DURATION_THRESHOLDS", {})
SPEED_THRESHOLD = _dur.get("speedFlag", 300)
SMEAL_THRESHOLD_MIN = _dur.get("smealBenchmarkMin", 300)
SMEAL_THRESHOLD_MAX = _dur.get("smealBenchmarkMax", 540)

# reCAPTCHA threshold
RECAPTCHA_THRESHOLD = 0.5


# ─────────────────────────────────────────────────────────────
# Straightlining Detection
# ─────────────────────────────────────────────────────────────

def within_person_sd(responses: List[str]) -> float:
    """
    Compute within-person standard deviation for categorical responses.

    Maps text labels to numeric indices (0, 1, 2, ...) and computes population
    standard deviation (divide by N, not N-1).

    Args:
        responses: List of response strings (may include empty strings)

    Returns:
        float: Standard deviation, or NaN if < 2 non-empty responses

    Reference: Meade & Craig (2012), Psychological Methods 17(3)
    """
    non_empty = [r for r in responses if r != ""]
    if len(non_empty) < 2:
        return math.nan

    # Map unique values to numeric indices
    unique_vals = list(dict.fromkeys(non_empty))  # preserves order
    numeric = [unique_vals.index(r) for r in non_empty]

    # Population mean and variance (divide by N, not N-1)
    mean = sum(numeric) / len(numeric)
    variance = sum((val - mean) ** 2 for val in numeric) / len(numeric)
    return math.sqrt(variance)


def detect_partial_straightlining(
    row_dict: Dict[str, str], threshold: float = PARTIAL_STRAIGHTLINING_SD_THRESHOLD
) -> Tuple[int, str]:
    """
    Check blocks for partial straightlining (within-person SD < threshold).

    Args:
        row_dict: Row as dict mapping column names to values
        threshold: SD threshold (default 0.5)

    Returns:
        Tuple of (flag: 0 or 1, block_names: semicolon-separated string)
    """
    flagged_blocks = []

    for block in SURVEY_BLOCKS:
        responses = []
        for item in range(1, block["count"] + 1):
            col_name = f"{block['prefix']}{item}"
            val = row_dict.get(col_name, "").strip()
            responses.append(val)

        # Only evaluate if at least half the block is answered
        non_empty = [r for r in responses if r != ""]
        if len(non_empty) < math.ceil(block["count"] / 2):
            continue

        sd = within_person_sd(responses)
        if not math.isnan(sd) and sd < threshold:
            flagged_blocks.append(block["name"])

    flag = 1 if flagged_blocks else 0
    blocks_str = ";".join(flagged_blocks)
    return flag, blocks_str


# ─────────────────────────────────────────────────────────────
# Disposition Waterfall
# ─────────────────────────────────────────────────────────────

def compute_disposition(row: Dict[str, Any]) -> str:
    """
    10-step disposition waterfall matching src/lib/disposition.ts.

    Steps:
      0: INCOMPLETE (Finished != TRUE)
      1: FLAG-AUTH-FAIL (Auth_LLM or Auth_Bots = LOW)
      2: FLAG-AUTH-MIXED (Auth_LLM or Auth_Bots = MIXED)
      3: AUTO-EXCLUDE (IRI_Fail_Count >= 2 OR (Speed_Flag=1 AND IRI_Fail_Count>=1))
      4: FLAG-SPEED (Speed_Flag=1 AND IRI_Fail_Count=0)
      5: FLAG-SINGLE-IRI (IRI_Fail_Count=1 AND Speed_Flag=0)
      6: FLAG-SMEAL (Smeal_Benchmark_Flag=1)
      7: FLAG-RECAPTCHA (reCAPTCHA_Flag=1)
      8: FLAG-STRAIGHTLINING (Straightlining_Flag=1)
      9: FLAG-PARTIAL-STRAIGHTLINING (Partial_Straightlining_Flag=1)
     10: CLEAN

    Args:
        row: Dict with disposition columns

    Returns:
        str: Disposition code
    """
    # Step 0
    if row["Finished"] not in ("TRUE", "1"):
        return "INCOMPLETE"

    # Step 1
    if row["Auth_LLM"].upper() == "LOW" or row["Auth_Bots"].upper() == "LOW":
        return "FLAG-AUTH-FAIL"

    # Step 2
    if row["Auth_LLM"].upper() == "MIXED" or row["Auth_Bots"].upper() == "MIXED":
        return "FLAG-AUTH-MIXED"

    # Step 3
    if row["IRI_Fail_Count"] >= 2:
        return "AUTO-EXCLUDE"
    if row["Speed_Flag"] == 1 and row["IRI_Fail_Count"] >= 1:
        return "AUTO-EXCLUDE"

    # Step 4
    if row["Speed_Flag"] == 1 and row["IRI_Fail_Count"] == 0:
        return "FLAG-SPEED"

    # Step 5
    if row["IRI_Fail_Count"] == 1 and row["Speed_Flag"] == 0:
        return "FLAG-SINGLE-IRI"

    # Step 6
    if row["Smeal_Benchmark_Flag"] == 1:
        return "FLAG-SMEAL"

    # Step 7
    if row["reCAPTCHA_Flag"] == 1:
        return "FLAG-RECAPTCHA"

    # Step 8
    if row["Straightlining_Flag"] == 1:
        return "FLAG-STRAIGHTLINING"

    # Step 9
    if row["Partial_Straightlining_Flag"] == 1:
        return "FLAG-PARTIAL-STRAIGHTLINING"

    # Step 10
    return "CLEAN"


# ─────────────────────────────────────────────────────────────
# CSV Parsing
# ─────────────────────────────────────────────────────────────

def parse_csv(csv_path: str) -> List[Dict[str, Any]]:
    """
    Parse Qualtrics CSV and apply full disposition waterfall.

    Expects 3 header rows (row 0 = names, rows 1-2 = metadata).
    Data starts at row 3.

    Deduplicates by PROLIFIC_PID using the latest attempt.

    Args:
        csv_path: Path to Qualtrics CSV export

    Returns:
        List of disposition rows, sorted by PROLIFIC_PID
    """
    rows_by_pid = {}
    duplicate_count = 0

    with open(csv_path, "r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)

        for i, row in enumerate(reader):
            # Skip Qualtrics metadata rows (question text + import IDs).
            # DictReader consumes row 0 as headers; rows 1-2 are metadata
            # that DictReader returns as data rows with column-name keys.
            if i < 2:
                continue

            # Verify required columns exist
            required = [
                "PROLIFIC_PID",
                "Finished",
                "Duration (in seconds)",
                "Q10-28_Barriers_19",
                "Q47-64_Readiness_18",
                "Q65-73_Maturity_9",
                "Q_RecaptchaScore",
                "Q_StraightliningCount",
            ]
            if i == 0:  # First data row
                missing = [c for c in required if c not in row]
                if missing:
                    raise ValueError(f"Missing required columns: {missing}")

            pid = row.get("PROLIFIC_PID", "").strip()
            if not pid:
                continue

            # Parse basic fields
            finished = row.get("Finished", "").upper()
            duration = int(row.get("Duration (in seconds)", "0") or "0")

            # IRI checks
            iri_barrier_pass = 1 if row.get("Q10-28_Barriers_19", "").strip() == IRI_BARRIER_ANSWER else 0
            iri_readiness_pass = (
                1 if row.get("Q47-64_Readiness_18", "").strip() == IRI_READINESS_ANSWER else 0
            )
            iri_maturity_pass = (
                1 if row.get("Q65-73_Maturity_9", "").strip() == IRI_MATURITY_ANSWER else 0
            )
            iri_pass_count = iri_barrier_pass + iri_readiness_pass + iri_maturity_pass
            iri_fail_count = 3 - iri_pass_count

            # Flags
            speed_flag = 1 if duration < SPEED_THRESHOLD else 0
            smeal_flag = (
                1 if SMEAL_THRESHOLD_MIN <= duration < SMEAL_THRESHOLD_MAX else 0
            )

            # reCAPTCHA
            recaptcha_str = row.get("Q_RecaptchaScore", "").strip()
            recaptcha_score = 1.0 if recaptcha_str == "" else float(recaptcha_str or "1.0")
            recaptcha_flag = 1 if recaptcha_score < RECAPTCHA_THRESHOLD else 0

            # Straightlining
            straightlining_count = int(row.get("Q_StraightliningCount", "0") or "0")
            straightlining_flag = 1 if straightlining_count > 0 else 0

            # Partial straightlining
            partial_flag, partial_blocks = detect_partial_straightlining(row)

            # Auth checks (default empty, populated by external enrichment)
            auth_llm = row.get("Auth_LLM", "").strip()
            auth_bots = row.get("Auth_Bots", "").strip()

            # Build row dict
            disposition_row = {
                "PROLIFIC_PID": pid,
                "Finished": finished,
                "Duration_Seconds": duration,
                "Auth_LLM": auth_llm,
                "Auth_Bots": auth_bots,
                "IRI_Barrier_Pass": iri_barrier_pass,
                "IRI_Readiness_Pass": iri_readiness_pass,
                "IRI_Maturity_Pass": iri_maturity_pass,
                "IRI_Pass_Count": iri_pass_count,
                "IRI_Fail_Count": iri_fail_count,
                "Speed_Flag": speed_flag,
                "Smeal_Benchmark_Flag": smeal_flag,
                "reCAPTCHA_Score": recaptcha_score,
                "reCAPTCHA_Flag": recaptcha_flag,
                "Straightlining_Count": straightlining_count,
                "Straightlining_Flag": straightlining_flag,
                "Partial_Straightlining_Flag": partial_flag,
                "Partial_Straightlining_Blocks": partial_blocks,
            }

            # Compute disposition
            disposition_row["Disposition"] = compute_disposition(disposition_row)

            # Deduplicate by PID: prefer completed (Finished=TRUE/1) over incomplete.
            # If participant retook the survey but didn't finish retake,
            # keep the completed original (not the incomplete retake).
            if pid in rows_by_pid:
                duplicate_count += 1
                existing = rows_by_pid[pid]
                existing_finished = existing["Finished"] in ("TRUE", "1")
                new_finished = disposition_row["Finished"] in ("TRUE", "1")
                if new_finished or not existing_finished:
                    rows_by_pid[pid] = disposition_row
                # else: keep existing completed response
            else:
                rows_by_pid[pid] = disposition_row

    if duplicate_count > 0:
        print(f"Dedup: {duplicate_count} duplicate PID(s) found - using latest attempt for each.")

    # Return sorted by PID
    return sorted(rows_by_pid.values(), key=lambda r: r["PROLIFIC_PID"])


# ─────────────────────────────────────────────────────────────
# Reporting
# ─────────────────────────────────────────────────────────────

def compute_statistics(rows: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Compute disposition summary statistics.

    Args:
        rows: List of disposition rows

    Returns:
        Dict with summary statistics
    """
    if not rows:
        return {
            "disposition_counts": {},
            "iri_pass_rates": {},
            "duration_stats": {},
            "straightlining_stats": {},
            "sample_sizes": {},
            "waterfall_steps": [],
        }

    # Disposition counts
    disposition_counter = Counter(r["Disposition"] for r in rows)
    disposition_counts = dict(disposition_counter)

    # IRI pass rates
    barrier_passes = sum(1 for r in rows if r["IRI_Barrier_Pass"] == 1)
    readiness_passes = sum(1 for r in rows if r["IRI_Readiness_Pass"] == 1)
    maturity_passes = sum(1 for r in rows if r["IRI_Maturity_Pass"] == 1)

    n = len(rows)
    iri_pass_rates = {
        "barrier": barrier_passes / n if n > 0 else 0.0,
        "readiness": readiness_passes / n if n > 0 else 0.0,
        "maturity": maturity_passes / n if n > 0 else 0.0,
    }

    # Duration stats
    durations = sorted([r["Duration_Seconds"] for r in rows])
    if durations:
        duration_stats = {
            "mean": sum(durations) / len(durations),
            "median": durations[len(durations) // 2],
            "q25": durations[len(durations) // 4],
            "q75": durations[3 * len(durations) // 4],
            "min": min(durations),
            "max": max(durations),
        }
    else:
        duration_stats = {
            "mean": 0.0,
            "median": 0.0,
            "q25": 0.0,
            "q75": 0.0,
            "min": 0.0,
            "max": 0.0,
        }

    # Straightlining stats
    full_straight = sum(1 for r in rows if r["Straightlining_Flag"] == 1)
    partial_straight = sum(1 for r in rows if r["Partial_Straightlining_Flag"] == 1)
    straightlining_stats = {
        "full_block_flagged": full_straight,
        "partial_flagged": partial_straight,
    }

    # Sample sizes
    complete = sum(1 for r in rows if r["Finished"] in ("TRUE", "1"))
    clean = sum(1 for r in rows if r["Disposition"] == "CLEAN")
    sample_sizes = {
        "total": len(rows),
        "complete": complete,
        "clean": clean,
    }

    # Waterfall steps (cumulative exclusion)
    waterfall_steps = []
    cumulative_excluded = 0

    step_configs = [
        (0, "INCOMPLETE", None),
        (1, "FLAG-AUTH-FAIL", None),
        (2, "FLAG-AUTH-MIXED", None),
        (3, "AUTO-EXCLUDE", None),
        (4, "FLAG-SPEED", None),
        (5, "FLAG-SINGLE-IRI", None),
        (6, "FLAG-SMEAL", None),
        (7, "FLAG-RECAPTCHA", None),
        (8, "FLAG-STRAIGHTLINING", None),
        (9, "FLAG-PARTIAL-STRAIGHTLINING", None),
        (10, "CLEAN", None),
    ]

    for step_num, name, _ in step_configs:
        count = disposition_counts.get(name, 0)
        cumulative_excluded += count
        waterfall_steps.append(
            {
                "step": step_num,
                "name": name,
                "count": count,
                "cumulative_excluded": cumulative_excluded if name != "CLEAN" else count,
            }
        )

    return {
        "disposition_counts": disposition_counts,
        "iri_pass_rates": iri_pass_rates,
        "duration_stats": duration_stats,
        "straightlining_stats": straightlining_stats,
        "sample_sizes": sample_sizes,
        "waterfall_steps": waterfall_steps,
    }


def print_summary(rows: List[Dict[str, Any]], stats: Dict[str, Any]) -> None:
    """
    Print human-readable disposition summary to stdout.

    Args:
        rows: List of disposition rows
        stats: Statistics dict from compute_statistics()
    """
    print("\n" + "=" * 70)
    print("TABS V2 DATA AUDIT - DISPOSITION WATERFALL REPORT")
    print("=" * 70)

    # Sample sizes
    sample = stats["sample_sizes"]
    print(f"\nSample Sizes:")
    print(f"  Total responses:    {sample['total']}")
    print(f"  Complete (Finished): {sample['complete']}")
    print(f"  Clean:              {sample['clean']}")

    # Disposition breakdown
    print(f"\nDisposition Summary:")
    counts = stats["disposition_counts"]
    for step in stats["waterfall_steps"]:
        step_num = step["step"]
        name = step["name"]
        count = step["count"]
        pct = (count / sample["total"] * 100) if sample["total"] > 0 else 0
        print(f"  Step {step_num:2d}: {name:35s} {count:4d} ({pct:5.1f}%)")

    # IRI pass rates
    print(f"\nIRI Pass Rates:")
    iri = stats["iri_pass_rates"]
    print(f"  Barriers:    {iri['barrier']:.1%}")
    print(f"  Readiness:   {iri['readiness']:.1%}")
    print(f"  Maturity:    {iri['maturity']:.1%}")

    # Duration stats
    print(f"\nDuration Statistics (seconds):")
    dur = stats["duration_stats"]
    print(f"  Mean:       {dur['mean']:.0f}")
    print(f"  Median:     {dur['median']:.0f}")
    print(f"  Q1 (25%):   {dur['q25']:.0f}")
    print(f"  Q3 (75%):   {dur['q75']:.0f}")
    print(f"  Min:        {dur['min']:.0f}")
    print(f"  Max:        {dur['max']:.0f}")

    # Straightlining
    print(f"\nStraightlining Detection:")
    straight = stats["straightlining_stats"]
    print(f"  Full-block (Q_StraightliningCount > 0): {straight['full_block_flagged']}")
    print(f"  Partial (SD < 0.5 in any block):        {straight['partial_flagged']}")

    print("\n" + "=" * 70)


# ─────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────


def main():
    """Parse arguments and run audit."""
    parser = argparse.ArgumentParser(
        description="TABS V2 Data Audit: Disposition Waterfall Classification"
    )
    parser.add_argument(
        "--input",
        type=str,
        required=True,
        help="Path to Qualtrics CSV export",
    )
    parser.add_argument(
        "--output",
        type=str,
        default="data_audit_results.json",
        help="Output JSON file (default: data_audit_results.json)",
    )
    parser.add_argument(
        "--disposition-csv",
        type=str,
        default=None,
        help="Optional: also write a disposition CSV (same format as disposition_triage.py)",
    )

    args = parser.parse_args()

    # Load and process CSV
    print(f"Loading CSV: {args.input}")
    try:
        rows = parse_csv(args.input)
    except FileNotFoundError:
        print(f"ERROR: File not found: {args.input}")
        sys.exit(1)
    except ValueError as e:
        print(f"ERROR: {e}")
        sys.exit(1)

    # Compute statistics
    stats = compute_statistics(rows)

    # Print summary
    print_summary(rows, stats)

    # Write JSON output
    output_path = Path(args.output)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(stats, f, indent=2)
    print(f"\nJSON output written to: {output_path}")

    # Optionally write disposition CSV (same format as disposition_triage.py)
    # This allows the analysis pipeline to produce the disposition CSV that
    # the operations pipeline consumes, eliminating a redundant Qualtrics export.
    if args.disposition_csv:
        from disposition_triage import rows_to_csv
        csv_path = Path(args.disposition_csv)
        csv_path.parent.mkdir(parents=True, exist_ok=True)
        csv_path.write_text(rows_to_csv(rows), encoding="utf-8")
        print(f"Disposition CSV written to: {csv_path}")


if __name__ == "__main__":
    main()
