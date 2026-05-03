"""Generate SPSS-ready artifacts from the public CRP-200 dataset.

Produces:
  - tabs_v2_crp200_spss.sav      : SPSS native binary data file (double-click to open)
  - tabs_v2_crp200_spss.csv      : same data as CSV (for non-SPSS users / sharing)

The .sav file embeds variable labels and value labels so SPSS displays the
Likert anchors and group names in dialogs and output without manual setup.

Pairs with tabs_v2_validation.sps (the syntax file that GETs the .sav and
runs every analysis SPSS Statistics supports) and amos_spec.md (the path-
diagram specifications for AMOS, since AMOS is graphical and not directly
scriptable from a portable text file).

Usage:
    python scripts/spss/build_spss_artifacts.py
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import pandas as pd

REPO_ROOT = Path(__file__).resolve().parents[2]
SOURCE_CSV = REPO_ROOT / "public" / "datasets" / "TABS_V2_CRP_2026_public_dataset.csv"
OUT_DIR = Path(__file__).resolve().parent
OUT_SAV = OUT_DIR / "tabs_v2_crp200_spss.sav"
OUT_CSV = OUT_DIR / "tabs_v2_crp200_spss.csv"

# Likert scales AND canonical item names come from the shared scales module
# so this encoder cannot silently drift from scripts/analysis/tabs_v2_validation.py.
# encode_likert() raises ValueError on any unknown label (fail-fast) instead of
# producing NaN.
#
# Earlier versions of this file hardcoded its own READINESS_NAMES and
# MATURITY_NAMES guesses ("Strategic Alignment", "Technology Selection", etc.)
# which were entirely fictional - the real Qualtrics column subheaders are
# IT-capability domains like "IT Investment & Value Mgmt" and "Vision/Leadership".
# Importing from scales.py prevents that class of drift.
sys.path.insert(0, str(REPO_ROOT / "scripts" / "analysis"))
from scales import (  # noqa: E402
    BARRIER_SCALE,
    READINESS_SCALE,
    MATURITY_SCALE,
    BARRIER_NAMES,
    READINESS_NAMES,
    MATURITY_NAMES,
    encode_likert,
)

BARRIER_COLS = [f"Q10-28_Barriers_{i}" for i in range(1, 19)]
READINESS_COLS = [f"Q47-64_Readiness_{i}" for i in range(1, 18)]
MATURITY_COLS = [f"Q65-73_Maturity_{i}" for i in range(1, 9)]


def encode(value: object, scale_map: dict) -> float:
    """Wrapper that handles pandas NaN; delegates to fail-fast encode_likert()."""
    if pd.isna(value):
        return np.nan
    return encode_likert(value, scale_map)


def main() -> None:
    try:
        import pyreadstat  # noqa: PLC0415
    except ImportError:
        raise SystemExit(
            "pyreadstat is required to write .sav files.\n"
            "Install it with:  pip install pyreadstat>=1.3"
        )

    if not SOURCE_CSV.exists():
        raise SystemExit(f"Source CSV not found: {SOURCE_CSV}")

    df = pd.read_csv(SOURCE_CSV, encoding="utf-8-sig")

    # Encode Likert
    for col in BARRIER_COLS:
        df[col] = df[col].apply(lambda v: encode(v, BARRIER_SCALE))
    for col in READINESS_COLS:
        df[col] = df[col].apply(lambda v: encode(v, READINESS_SCALE))
    for col in MATURITY_COLS:
        df[col] = df[col].apply(lambda v: encode(v, MATURITY_SCALE))

    # Rename to short codes
    rename_map: dict[str, str] = {}
    for i, c in enumerate(BARRIER_COLS, start=1):
        rename_map[c] = f"B{i}"
    for i, c in enumerate(READINESS_COLS, start=1):
        rename_map[c] = f"R{i}"
    for i, c in enumerate(MATURITY_COLS, start=1):
        rename_map[c] = f"M{i}"
    df = df.rename(columns=rename_map)

    # Construct mean columns (skipna=False matches the Python pipeline's behavior)
    b_cols = [f"B{i}" for i in range(1, 19)]
    r_cols = [f"R{i}" for i in range(1, 18)]
    m_cols = [f"M{i}" for i in range(1, 9)]
    df["B_mean"] = df[b_cols].mean(axis=1, skipna=False)
    df["R_mean"] = df[r_cols].mean(axis=1, skipna=False)
    df["M_mean"] = df[m_cols].mean(axis=1, skipna=False)

    # SMB (1) / Enterprise (2) grouping
    smb_set = {"<100", "100-499", "500-999"}
    ent_set = {"1000-4999", "5000-9999", "10000+"}

    def org_grp(v: object) -> float:
        if pd.isna(v):
            return np.nan
        s = str(v).strip()
        if s in smb_set:
            return 1.0
        if s in ent_set:
            return 2.0
        return np.nan

    df["SMB_ENT"] = df["Q4_OrgSize"].apply(org_grp) if "Q4_OrgSize" in df.columns else np.nan

    # Output column order
    keep = b_cols + r_cols + m_cols + ["B_mean", "R_mean", "M_mean", "SMB_ENT"]
    out = df[keep].copy()

    # CSV mirror
    out.to_csv(OUT_CSV, index=False, na_rep="")
    print(f"Wrote {OUT_CSV}")

    # Variable labels - kept short so they don't dominate chart titles
    # and pivot table headers in the Viewer / xlsx export. The short
    # name + Likert value labels make the variables self-documenting in
    # context; full item text lives in the README and the canonical
    # pipeline's BARRIER_NAMES / READINESS_NAMES / MATURITY_NAMES.
    variable_labels: dict[str, str] = {}
    for i, name in enumerate(BARRIER_NAMES, start=1):
        variable_labels[f"B{i}"] = f"B{i}: {name}"
    for i, name in enumerate(READINESS_NAMES, start=1):
        variable_labels[f"R{i}"] = f"R{i}: {name}"
    for i, name in enumerate(MATURITY_NAMES, start=1):
        variable_labels[f"M{i}"] = f"M{i}: {name}"
    variable_labels["B_mean"] = "Barriers (mean)"
    variable_labels["R_mean"] = "Readiness (mean)"
    variable_labels["M_mean"] = "Maturity (mean)"
    variable_labels["SMB_ENT"] = "Org Size Group"

    # Value labels (so SPSS dialogs show "Not a Barrier" / "Major Barrier" etc.)
    barrier_values = {1.0: "Not a Barrier", 2.0: "Minor Barrier", 3.0: "Moderate Barrier",
                      4.0: "Significant Barrier", 5.0: "Major Barrier"}
    readiness_values = {1.0: "Very Low Readiness/Capability", 2.0: "Low Readiness/Capability",
                        3.0: "Moderate Readiness/Capability", 4.0: "High Readiness/Capability",
                        5.0: "Very High Readiness/Capability"}
    maturity_values = {1.0: "L1: Initial", 2.0: "L2: Repeatable", 3.0: "L3: Defined",
                       4.0: "L4: Managed", 5.0: "L5: Optimizing"}
    smb_values = {1.0: "SMB", 2.0: "Enterprise"}

    value_labels: dict[str, dict[float, str]] = {}
    for c in b_cols:
        value_labels[c] = barrier_values
    for c in r_cols:
        value_labels[c] = readiness_values
    for c in m_cols:
        value_labels[c] = maturity_values
    value_labels["SMB_ENT"] = smb_values

    # Measurement levels: nominal for SMB_ENT, scale for everything else
    measure_levels = {c: "scale" for c in keep}
    measure_levels["SMB_ENT"] = "nominal"

    # Write .sav
    pyreadstat.write_sav(
        out,
        str(OUT_SAV),
        column_labels=[variable_labels.get(c, "") for c in out.columns],
        variable_value_labels=value_labels,
        variable_measure=measure_levels,
        file_label=(
            "TABS V2 CRP-200 frozen dataset (N=200) - re-encoded for SPSS. "
            "Source: public/datasets/TABS_V2_CRP_2026_public_dataset.csv. "
            "See scripts/spss/README.md for the analysis workflow."
        ),
    )
    print(f"Wrote {OUT_SAV}")
    print(f"  Rows: {len(out)}")
    print(f"  Columns: {len(out.columns)}")
    print(f"  Barrier listwise N: {out[b_cols].dropna().shape[0]}")
    print(f"  Readiness listwise N: {out[r_cols].dropna().shape[0]}")
    print(f"  Maturity listwise N: {out[m_cols].dropna().shape[0]}")


if __name__ == "__main__":
    main()
