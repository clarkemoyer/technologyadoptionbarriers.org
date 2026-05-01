"""Generate a Minitab-friendly numeric CSV from the public CRP-200 dataset.

Minitab's Item Analysis, Factor Analysis, and Correlation commands expect
numeric columns. The public dataset stores Likert responses as text labels
("Not a Barrier", "Major Barrier", "Level 1: Initial/Ad Hoc", etc.), so this
script:

1. Encodes Likert text -> numeric (1-5) using the SAME mapping the Python
   pipeline uses (load_crp200 in scripts/analysis/tabs_v2_validation.py),
   so every Minitab statistic is computed on identical data to Python/R.
2. Renames the analysis columns to short identifiers (B1-B18, R1-R17, M1-M8)
   to match the dissertation tables.
3. Adds construct mean columns (B_mean, R_mean, M_mean) for inter-construct
   correlation and Fornell-Larcker comparisons.
4. Keeps Q4_OrgSize and a derived SMB / Enterprise grouping column.
5. Writes everything as a comma-delimited CSV with one header row, which
   Minitab opens cleanly via File -> Open Worksheet.

Usage:
    python scripts/minitab/build_minitab_csv.py

Output: scripts/minitab/tabs_v2_crp200_minitab.csv (same N=200 as the source)
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

REPO_ROOT = Path(__file__).resolve().parents[2]
SOURCE_CSV = REPO_ROOT / "public" / "datasets" / "TABS_V2_CRP_2026_public_dataset.csv"
OUTPUT_CSV = Path(__file__).resolve().parent / "tabs_v2_crp200_minitab.csv"

BARRIER_SCALE = {
    "Not a Barrier": 1,
    "Minor Barrier": 2,
    "Moderate Barrier": 3,
    "Significant Barrier": 4,
    "Major Barrier": 5,
}
READINESS_SCALE = {
    "Very Low Readiness/Capability": 1,
    "Low Readiness/Capability": 2,
    "Moderate Readiness/Capability": 3,
    "High Readiness/Capability": 4,
    "Very High Readiness/Capability": 5,
}
MATURITY_SCALE = {
    "Level 1: Initial/Ad Hoc": 1,
    "Level 2: Developing/Repeatable": 2,
    "Level 3: Defined/Standardized": 3,
    "Level 4: Managed/Quantitatively Managed": 4,
    "Level 5: Optimizing/Innovating": 5,
}
MISSING_TOKEN = "Don't Know"

BARRIER_COLS = [f"Q10-28_Barriers_{i}" for i in range(1, 19)]
READINESS_COLS = [f"Q47-64_Readiness_{i}" for i in range(1, 18)]
MATURITY_COLS = [f"Q65-73_Maturity_{i}" for i in range(1, 9)]


def encode(value: object, scale_map: dict[str, int]) -> float:
    if pd.isna(value):
        return np.nan
    s = str(value).strip()
    if s == MISSING_TOKEN or s == "":
        return np.nan
    return float(scale_map.get(s, np.nan))


def main() -> None:
    if not SOURCE_CSV.exists():
        raise SystemExit(f"Source CSV not found: {SOURCE_CSV}")

    df = pd.read_csv(SOURCE_CSV, encoding="utf-8-sig")

    # Encode Likert columns
    for col in BARRIER_COLS:
        df[col] = df[col].apply(lambda v: encode(v, BARRIER_SCALE))
    for col in READINESS_COLS:
        df[col] = df[col].apply(lambda v: encode(v, READINESS_SCALE))
    for col in MATURITY_COLS:
        df[col] = df[col].apply(lambda v: encode(v, MATURITY_SCALE))

    # Rename to short item codes (B1-B18, R1-R17, M1-M8)
    rename_map: dict[str, str] = {}
    for i, c in enumerate(BARRIER_COLS, start=1):
        rename_map[c] = f"B{i}"
    for i, c in enumerate(READINESS_COLS, start=1):
        rename_map[c] = f"R{i}"
    for i, c in enumerate(MATURITY_COLS, start=1):
        rename_map[c] = f"M{i}"
    df = df.rename(columns=rename_map)

    # Build construct mean columns (treat any-NaN row as NaN; matches Python pipeline)
    b_cols = [f"B{i}" for i in range(1, 19)]
    r_cols = [f"R{i}" for i in range(1, 18)]
    m_cols = [f"M{i}" for i in range(1, 9)]
    df["B_mean"] = df[b_cols].mean(axis=1, skipna=False)
    df["R_mean"] = df[r_cols].mean(axis=1, skipna=False)
    df["M_mean"] = df[m_cols].mean(axis=1, skipna=False)

    # SMB / Enterprise grouping (1 = SMB, 2 = ENT, blank otherwise)
    smb_set = {"<100", "100-499", "500-999"}
    ent_set = {"1000-4999", "5000-9999", "10000+"}

    def org_grp(v: object) -> object:
        if pd.isna(v):
            return np.nan
        s = str(v).strip()
        if s in smb_set:
            return 1
        if s in ent_set:
            return 2
        return np.nan

    if "Q4_OrgSize" in df.columns:
        df["SMB_ENT"] = df["Q4_OrgSize"].apply(org_grp)

    # Keep only columns Minitab will actually use; drop free-text and ID columns
    # to reduce friction when opening the worksheet.
    keep_cols = b_cols + r_cols + m_cols + ["B_mean", "R_mean", "M_mean"]
    if "SMB_ENT" in df.columns:
        keep_cols.append("SMB_ENT")
    if "Q4_OrgSize" in df.columns:
        keep_cols.append("Q4_OrgSize")

    out = df[keep_cols].copy()

    # Minitab handles blank cells as missing automatically; write blank for NaN.
    out.to_csv(OUTPUT_CSV, index=False, na_rep="")

    print(f"Wrote {OUTPUT_CSV}")
    print(f"  Rows: {len(out)}")
    print(f"  Columns: {len(out.columns)}")
    print(f"  Barrier listwise N: {out[b_cols].dropna().shape[0]}")
    print(f"  Readiness listwise N: {out[r_cols].dropna().shape[0]}")
    print(f"  Maturity listwise N: {out[m_cols].dropna().shape[0]}")


if __name__ == "__main__":
    main()
