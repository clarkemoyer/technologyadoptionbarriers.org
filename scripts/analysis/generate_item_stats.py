#!/usr/bin/env python3
"""Generate per-item descriptive statistics for all 46 survey items.

Reads the enriched Qualtrics CSV and computes per-item means and standard
deviations for all Barriers (18 items), Readiness (17 items), and Maturity
(8 items) scales. Uses the Conservative Clean sample by default.

Outputs ``src/data/item-stats.json`` with:
  - Per-item means, SDs, and N for each construct
  - Top 5 / bottom 5 barriers by mean

Usage:
    INPUT_CSV=/path/to/qualtrics-enriched.csv \\
    OUTPUT_PATH=src/data/item-stats.json \\
        python3 scripts/analysis/generate_item_stats.py

Environment variables:
    INPUT_CSV    Path to the enriched Qualtrics CSV (required)
    OUTPUT_PATH  Destination path for item-stats.json (required)
    SAMPLE       Sample to use: conservative_clean (default), flexible_clean,
                 prolific_accepted, v2_finished, v2_all

Author: Clarke Moyer / GitHub Copilot, Penn State Smeal DBA
"""

from __future__ import annotations

import datetime
import json
import os
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# Add scripts/analysis to path
sys.path.insert(0, str(Path(__file__).parent))

from tabs_v2_analysis import (
    load_data,
    filter_samples,
    mean_sd,
    score,
    BARRIER_COLS,
    BARRIER_NAMES,
    BARRIER_SCALE,
    READINESS_COLS,
    READINESS_NAMES,
    READINESS_SCALE,
    MATURITY_COLS,
    MATURITY_NAMES,
    MATURITY_SCALE,
)

# ── Sample key → filter function ──────────────────────────────────────────────

SAMPLE_KEYS = (
    "conservative_clean",
    "flexible_clean",
    "prolific_accepted",
    "v2_finished",
    "v2_all",
)


def _select_sample(all_samples: Dict, key: str) -> List:
    """Return the rows for the requested sample key."""
    if key not in all_samples:
        available = ", ".join(all_samples.keys())
        raise ValueError(f"Unknown sample key '{key}'. Available: {available}")
    return all_samples[key]


# ── Item statistics ───────────────────────────────────────────────────────────

def _item_stats(rows: List, col: str, scale: Dict, idx: Dict) -> Dict:
    """Compute mean, SD, and N for a single item column."""
    vals = [score(r, col, scale, idx) for r in rows]
    vals = [v for v in vals if v is not None]
    m, sd = mean_sd(vals)
    return {
        "mean": round(m, 4) if m is not None else None,
        "sd": round(sd, 4) if sd is not None else None,
        "n": len(vals),
    }


def _build_construct(
    rows: List,
    cols: List[str],
    names: List[str],
    scale: Dict,
    idx: Dict,
    label: str,
) -> Dict:
    """Build the per-item statistics block for one construct."""
    items = []
    for col, name in zip(cols, names):
        stats = _item_stats(rows, col, scale, idx)
        items.append({"col": col, "name": name, **stats})

    # Sort copies for ranking; exclude items with no mean (do not modify original order)
    ranked = sorted(
        [item for item in items if item["mean"] is not None],
        key=lambda x: (-x["mean"], x["name"]),
    )

    return {
        "label": label,
        "numItems": len(items),
        "items": items,
        "top5": [
            {"rank": i + 1, "name": x["name"], "mean": x["mean"], "sd": x["sd"]}
            for i, x in enumerate(ranked[:5])
        ],
        "bottom5": [
            {"rank": len(ranked) - (4 - i), "name": x["name"], "mean": x["mean"], "sd": x["sd"]}
            for i, x in enumerate(ranked[-5:])
        ],
    }


# ── Main ──────────────────────────────────────────────────────────────────────

def generate_item_stats(csv_path: str, sample_key: str = "conservative_clean") -> Dict:
    """Read the enriched CSV and return item-level statistics as a dict.

    Args:
        csv_path: Path to the enriched Qualtrics CSV.
        sample_key: Which sample definition to use (default: conservative_clean).

    Returns:
        Dictionary suitable for JSON serialization.
    """
    idx, rows = load_data(csv_path)
    _v2, samples = filter_samples(rows, idx)
    selected = _select_sample(samples, sample_key)

    barriers = _build_construct(selected, BARRIER_COLS, BARRIER_NAMES, BARRIER_SCALE, idx, "Barriers")
    readiness = _build_construct(selected, READINESS_COLS, READINESS_NAMES, READINESS_SCALE, idx, "Readiness")
    maturity = _build_construct(selected, MATURITY_COLS, MATURITY_NAMES, MATURITY_SCALE, idx, "Maturity")

    return {
        "generatedAt": datetime.datetime.now(datetime.timezone.utc).strftime(
            "%Y-%m-%dT%H:%M:%SZ"
        ),
        "sampleKey": sample_key,
        "n": len(selected),
        "constructs": {
            "barriers": barriers,
            "readiness": readiness,
            "maturity": maturity,
        },
    }


def main() -> None:
    input_csv = os.environ.get("INPUT_CSV")
    output_path = os.environ.get("OUTPUT_PATH")

    if not input_csv:
        print("Error: INPUT_CSV environment variable is required.", file=sys.stderr)
        sys.exit(1)
    if not output_path:
        print("Error: OUTPUT_PATH environment variable is required.", file=sys.stderr)
        sys.exit(1)
    if not Path(input_csv).exists():
        print(f"Error: INPUT_CSV not found: {input_csv}", file=sys.stderr)
        sys.exit(1)

    sample_key = os.environ.get("SAMPLE", "conservative_clean")

    print(f"Generating item statistics (sample={sample_key})...")
    data = generate_item_stats(input_csv, sample_key)

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=2)
        fh.write("\n")

    n = data["n"]
    nb = data["constructs"]["barriers"]["numItems"]
    nr = data["constructs"]["readiness"]["numItems"]
    nm = data["constructs"]["maturity"]["numItems"]
    print(
        f"Item stats written: {output_path} "
        f"(N={n}, {nb} barriers + {nr} readiness + {nm} maturity items)"
    )


if __name__ == "__main__":
    main()
