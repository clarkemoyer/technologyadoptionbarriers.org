#!/usr/bin/env python3
"""
generate_item_stats.py — Per-item statistics for TABS survey items.

For each of the four primary result groups (conservative_clean, flexible_clean,
prolific_accepted, v2_finished), compute mean, SD, and N for every individual
survey item across the Barriers, Readiness, and Maturity constructs.

Also computes a sensitivity indicator (max_delta) — the maximum absolute
difference in item means across the four groups — to flag items whose scores
shift substantially with different inclusion criteria.

Usage:
    python generate_item_stats.py <qualtrics_csv_path> [--output <path>]

Output:
    JSON file written to src/data/item-stats.json (default) or --output path.

Author: Clarke Moyer, Penn State Smeal DBA
"""

import argparse
import json
import math
import sys
from datetime import datetime, timezone
from pathlib import Path

# Reuse shared helpers from the main analysis module
from tabs_v2_analysis import (
    BARRIER_COLS,
    BARRIER_NAMES,
    BARRIER_SCALE,
    MATURITY_COLS,
    MATURITY_NAMES,
    MATURITY_SCALE,
    READINESS_COLS,
    READINESS_NAMES,
    READINESS_SCALE,
    filter_samples,
    load_data,
    mean_sd,
    score,
)

# The four primary groups shown on the findings page
PRIMARY_SAMPLE_KEYS = [
    "conservative_clean",
    "flexible_clean",
    "prolific_accepted",
    "v2_finished",
]

# Construct definitions: (key, column list, scale map, item name list)
CONSTRUCTS = [
    ("barriers", BARRIER_COLS, BARRIER_SCALE, BARRIER_NAMES),
    ("readiness", READINESS_COLS, READINESS_SCALE, READINESS_NAMES),
    ("maturity", MATURITY_COLS, MATURITY_SCALE, MATURITY_NAMES),
]


def compute_item_stats(rows, cols, scale, idx):
    """Compute mean, SD, and N for each item column over a list of rows.

    Returns a list of dicts with keys ``mean``, ``sd``, ``n`` — one per column,
    in the same order as *cols*.  Items with no valid responses get
    ``mean=None``, ``sd=None``, ``n=0``.
    """
    results = []
    for col in cols:
        vals = [score(r, col, scale, idx) for r in rows]
        vals = [v for v in vals if v is not None]
        n = len(vals)
        if n == 0:
            results.append({"mean": None, "sd": None, "n": 0})
        else:
            m, s = mean_sd(vals)
            results.append(
                {
                    "mean": round(m, 4) if m is not None else None,
                    "sd": round(s, 4) if s is not None else None,
                    "n": n,
                }
            )
    return results


def compute_max_delta(group_stats_list):
    """Return the maximum absolute pairwise difference in means.

    ``group_stats_list`` is a list of per-group stat dicts (``mean``, ``sd``,
    ``n``), one entry per primary group.  Returns ``None`` when fewer than two
    groups have valid means.
    """
    valid_means = [s["mean"] for s in group_stats_list if s["mean"] is not None]
    if len(valid_means) < 2:
        return None
    return round(max(valid_means) - min(valid_means), 4)


def build_item_stats(csv_path):
    """Load CSV, filter samples, and return the full item-stats structure."""
    idx, data = load_data(csv_path)
    _, samples = filter_samples(data, idx)

    constructs_out = {}
    for construct_key, cols, scale, names in CONSTRUCTS:
        items = []
        # Per-group stats: {sample_key: [stat_dict_per_item]}
        per_group = {}
        for sk in PRIMARY_SAMPLE_KEYS:
            rows = samples.get(sk, [])
            per_group[sk] = compute_item_stats(rows, cols, scale, idx)

        for i, (col, name) in enumerate(zip(cols, names)):
            group_stats = {sk: per_group[sk][i] for sk in PRIMARY_SAMPLE_KEYS}
            max_delta = compute_max_delta(list(group_stats.values()))
            items.append(
                {
                    "col": col,
                    "name": name,
                    "groups": group_stats,
                    "max_delta": max_delta,
                }
            )
        constructs_out[construct_key] = {"items": items}

    return {
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "constructs": constructs_out,
    }


def main():
    parser = argparse.ArgumentParser(description="Generate per-item statistics JSON.")
    parser.add_argument("csv_path", help="Path to enriched Qualtrics CSV export")
    parser.add_argument(
        "--output",
        default=str(
            Path(__file__).resolve().parent.parent.parent / "src" / "data" / "item-stats.json"
        ),
        help="Output JSON path (default: src/data/item-stats.json)",
    )
    args = parser.parse_args()

    result = build_item_stats(args.csv_path)
    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)
        f.write("\n")

    n_items = sum(
        len(v["items"]) for v in result["constructs"].values()
    )
    print(f"Wrote {n_items} items across {len(result['constructs'])} constructs → {out_path}")


if __name__ == "__main__":
    main()
