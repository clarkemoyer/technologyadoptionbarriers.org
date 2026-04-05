#!/usr/bin/env python3
"""Aggregate Prolific demographics CSV into a privacy-safe JSON summary.

Reads the Prolific bulk demographics CSV and produces a JSON file suitable
for display on the /results/sample page — showing aggregate counts and
percentages only, with no individual-level data.

Usage (fetch from API):
    PROLIFIC_API_TOKEN=... STUDY_ID=... OUTPUT_PATH=src/data/demographics.json \\
        python3 scripts/analysis/aggregate_demographics.py

Usage (pre-downloaded CSV):
    INPUT_CSV=/tmp/demographics.csv OUTPUT_PATH=src/data/demographics.json \\
        python3 scripts/analysis/aggregate_demographics.py

Privacy guarantees:
    - Aggregated only — no individual-level data in output
    - Minimum cell size: categories with count < MIN_CELL_SIZE merged into "Other"
    - No participant IDs (PIDs) in output
    - OUTPUT_PATH is required — refuses to write to stdout

Environment variables:
    INPUT_CSV          Path to a pre-downloaded demographics CSV (optional)
    PROLIFIC_API_TOKEN Prolific API token (required if INPUT_CSV not set)
    STUDY_ID           Prolific study ID (required if INPUT_CSV not set)
    OUTPUT_PATH        Destination path for demographics.json (required)
    MIN_CELL_SIZE      Minimum count before a category is merged into "Other" (default: 5)

Author: Clarke Moyer / GitHub Copilot, Penn State Smeal DBA
"""

from __future__ import annotations

import csv
import datetime
import json
import math
import os
import sys
import tempfile
from collections import Counter
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# ── Configuration ────────────────────────────────────────────────────────────

# Categories with fewer than MIN_CELL_SIZE participants are merged into "Other"
DEFAULT_MIN_CELL_SIZE = 5

# Prolific bulk-export column names (case-insensitive lookup used below)
# Each entry is a list of acceptable column names in priority order.
COL_AGE = ["Age"]
COL_SEX = ["Sex"]
COL_ETHNICITY = ["Ethnicity simplified", "Ethnicity"]
COL_COUNTRY = ["Country of residence", "Nationality", "Country of birth"]
COL_EMPLOYMENT = ["Employment status"]
COL_STUDENT = ["Student status"]
COL_LANGUAGE = ["Language"]

# Maximum number of categories to list before collapsing into "Other"
MAX_CATEGORIES = 15


# ── Helpers ───────────────────────────────────────────────────────────────────

def _find_col(headers: List[str], candidates: List[str]) -> Optional[str]:
    """Return first candidate column present in headers (case-insensitive)."""
    lower = {h.lower(): h for h in headers}
    for c in candidates:
        if c.lower() in lower:
            return lower[c.lower()]
    return None


def _safe_int(value: str) -> Optional[int]:
    """Parse integer, returning None on failure."""
    try:
        return int(float(value.strip()))
    except (ValueError, AttributeError):
        return None


def _aggregate_categorical(
    values: List[str],
    min_cell: int,
    max_cats: int = MAX_CATEGORIES,
) -> List[Dict]:
    """Count category occurrences, merging small/overflow cells into 'Other'.

    Args:
        values: Raw category strings (empty/DATA_EXPIRED treated as unknown).
        min_cell: Minimum count; cells below this merge into "Other".
        max_cats: Maximum distinct categories before overflow merges into "Other".

    Returns:
        List of {"label": str, "count": int, "pct": float} sorted by count desc.
    """
    total = len(values)
    if total == 0:
        return []

    # Normalise empty / DATA_EXPIRED values
    cleaned = []
    for v in values:
        v = v.strip()
        if not v or v.upper() in ("DATA_EXPIRED", "N/A", "NA", "PREFER NOT TO SAY"):
            cleaned.append("Prefer not to say / Not available")
        else:
            cleaned.append(v)

    counts = Counter(cleaned)

    # Sort by count desc, then alphabetically
    ordered = sorted(counts.items(), key=lambda x: (-x[1], x[0]))

    # Merge overflow (beyond max_cats) into "Other"
    if len(ordered) > max_cats:
        keep = ordered[:max_cats]
        other_count = sum(ct for _, ct in ordered[max_cats:])
        keep_dict = dict(keep)
        keep_dict["Other"] = keep_dict.get("Other", 0) + other_count
        ordered = sorted(keep_dict.items(), key=lambda x: (-x[1], x[0]))

    # Merge small cells into "Other"
    result = []
    other_count = 0
    for label, count in ordered:
        if label == "Other":
            other_count += count
        elif count < min_cell:
            other_count += count
        else:
            result.append({"label": label, "count": count, "pct": round(count / total * 100, 1)})

    if other_count > 0:
        # Only include "Other" bucket if its merged total meets min_cell threshold
        result.append({
            "label": "Other / Prefer not to say",
            "count": other_count,
            "pct": round(other_count / total * 100, 1),
        })

    return result


def _aggregate_age(
    values: List[Optional[int]],
    min_cell: int,
) -> Dict:
    """Compute age distribution, mean, and median.

    Age ranges: 18-24, 25-34, 35-44, 45-54, 55-64, 65+
    """
    valid = [v for v in values if v is not None]
    n = len(valid)
    if n == 0:
        return {"ranges": [], "mean": None, "median": None}

    buckets = [
        ("18-24", 18, 24),
        ("25-34", 25, 34),
        ("35-44", 35, 44),
        ("45-54", 45, 54),
        ("55-64", 55, 64),
        ("65+", 65, 999),
    ]

    ranges = []
    for label, lo, hi in buckets:
        count = sum(1 for v in valid if lo <= v <= hi)
        if count < min_cell:
            # Don't expose bins with too few participants
            ranges.append({"range": label, "count": None, "pct": None})
        else:
            ranges.append({"range": label, "count": count, "pct": round(count / n * 100, 1)})

    mean_val = round(sum(valid) / n, 1) if n > 0 else None
    sorted_vals = sorted(valid)
    if n % 2 == 1:
        median_val = float(sorted_vals[n // 2])
    else:
        median_val = (sorted_vals[n // 2 - 1] + sorted_vals[n // 2]) / 2.0
    median_val = round(median_val, 1) if median_val is not None else None

    return {"ranges": ranges, "mean": mean_val, "median": median_val}


# ── Main aggregation ──────────────────────────────────────────────────────────

def aggregate_demographics(csv_path: str, min_cell: int = DEFAULT_MIN_CELL_SIZE) -> Dict:
    """Read the Prolific demographics CSV and return an aggregated summary dict.

    Args:
        csv_path: Path to the Prolific bulk demographics CSV.
        min_cell: Minimum category size; smaller cells merge into "Other".

    Returns:
        Dictionary suitable for JSON serialisation (no individual-level data).
    """
    with open(csv_path, newline="", encoding="utf-8-sig") as fh:
        reader = csv.DictReader(fh)
        rows = list(reader)
        headers = reader.fieldnames or []

    if not rows:
        raise ValueError(f"Demographics CSV is empty: {csv_path}")

    # Locate columns
    age_col = _find_col(headers, COL_AGE)
    sex_col = _find_col(headers, COL_SEX)
    ethnicity_col = _find_col(headers, COL_ETHNICITY)
    country_col = _find_col(headers, COL_COUNTRY)
    employment_col = _find_col(headers, COL_EMPLOYMENT)
    student_col = _find_col(headers, COL_STUDENT)
    language_col = _find_col(headers, COL_LANGUAGE)

    total = len(rows)

    # Age
    ages = [_safe_int(r[age_col]) if age_col else None for r in rows]
    age_data = _aggregate_age(ages, min_cell)

    # Gender / Sex
    genders = [r[sex_col] if sex_col else "" for r in rows]
    gender_cats = _aggregate_categorical(genders, min_cell)

    # Ethnicity
    ethnicities = [r[ethnicity_col] if ethnicity_col else "" for r in rows]
    ethnicity_cats = _aggregate_categorical(ethnicities, min_cell)

    # Country of residence
    countries = [r[country_col] if country_col else "" for r in rows]
    country_cats = _aggregate_categorical(countries, min_cell, max_cats=10)

    # Employment status
    employment = [r[employment_col] if employment_col else "" for r in rows]
    employment_cats = _aggregate_categorical(employment, min_cell)

    # Student status
    student = [r[student_col] if student_col else "" for r in rows]
    student_cats = _aggregate_categorical(student, min_cell)

    # First language
    languages = [r[language_col] if language_col else "" for r in rows]
    language_cats = _aggregate_categorical(languages, min_cell, max_cats=10)

    return {
        "generatedAt": datetime.datetime.now(datetime.timezone.utc).strftime(
            "%Y-%m-%dT%H:%M:%SZ"
        ),
        "totalParticipants": total,
        "sampleUsed": "prolific_accepted",
        "privacyNote": (
            f"All counts are aggregated. Categories with fewer than {min_cell} "
            "participants are merged into 'Other / Prefer not to say' to protect "
            "individual privacy. No participant-level data is included."
        ),
        "age": age_data,
        "gender": {"categories": gender_cats},
        "ethnicity": {"categories": ethnicity_cats},
        "country": {"categories": country_cats},
        "employmentStatus": {"categories": employment_cats},
        "studentStatus": {"categories": student_cats},
        "firstLanguage": {"categories": language_cats},
        "columnsFound": {
            "age": age_col,
            "sex": sex_col,
            "ethnicity": ethnicity_col,
            "country": country_col,
            "employment": employment_col,
            "student": student_col,
            "language": language_col,
        },
    }


# ── Entry point ───────────────────────────────────────────────────────────────

def main() -> None:
    output_path = os.environ.get("OUTPUT_PATH")
    if not output_path:
        print(
            "Error: OUTPUT_PATH environment variable is required. "
            "Refusing to write demographics JSON to stdout (may expose aggregated PII).",
            file=sys.stderr,
        )
        sys.exit(1)

    min_cell = int(os.environ.get("MIN_CELL_SIZE", str(DEFAULT_MIN_CELL_SIZE)))

    input_csv = os.environ.get("INPUT_CSV")

    if input_csv:
        # Use pre-downloaded CSV
        if not Path(input_csv).exists():
            print(f"Error: INPUT_CSV not found: {input_csv}", file=sys.stderr)
            sys.exit(1)
        csv_path = input_csv
        print(f"Using pre-downloaded demographics CSV: {csv_path}")
    else:
        # Fetch from Prolific API
        api_token = os.environ.get("PROLIFIC_API_TOKEN")
        study_id = os.environ.get("STUDY_ID") or os.environ.get("PROLIFIC_STUDY_ID")

        if not api_token:
            print(
                "Error: PROLIFIC_API_TOKEN is required when INPUT_CSV is not set.",
                file=sys.stderr,
            )
            sys.exit(1)
        if not study_id:
            print(
                "Error: STUDY_ID (or PROLIFIC_STUDY_ID) is required when INPUT_CSV is not set.",
                file=sys.stderr,
            )
            sys.exit(1)

        sys.path.insert(0, str(Path(__file__).parent))
        from tabs_api import prolific_demographics_csv  # noqa: PLC0415

        with tempfile.NamedTemporaryFile(suffix=".csv", delete=False) as tmp:
            tmp_path = tmp.name

        print(f"Fetching demographics from Prolific API (study: {study_id})...")
        result = prolific_demographics_csv(study_id, api_token, tmp_path)
        if not result:
            print(
                "Error: Demographics export returned no data from Prolific API.",
                file=sys.stderr,
            )
            sys.exit(1)
        csv_path = tmp_path

    print(f"Aggregating demographics (min_cell={min_cell})...")
    data = aggregate_demographics(csv_path, min_cell=min_cell)

    # Write output
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=2)
        fh.write("\n")

    print(
        f"Demographics JSON written: {output_path} "
        f"(N={data['totalParticipants']} participants)"
    )


if __name__ == "__main__":
    main()
