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

from pathlib import Path

import numpy as np
import pandas as pd
import pyreadstat

REPO_ROOT = Path(__file__).resolve().parents[2]
SOURCE_CSV = REPO_ROOT / "public" / "datasets" / "TABS_V2_CRP_2026_public_dataset.csv"
OUT_DIR = Path(__file__).resolve().parent
OUT_SAV = OUT_DIR / "tabs_v2_crp200_spss.sav"
OUT_CSV = OUT_DIR / "tabs_v2_crp200_spss.csv"

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

BARRIER_NAMES = [
    "Resistance to Change",
    "Lack of Leadership Support",
    "Risk-Averse Culture",
    "Insufficient Workforce Skills",
    "Inadequate Training",
    "High Implementation Cost",
    "Legacy System Integration",
    "Inadequate IT Infrastructure",
    "Difficulty Demonstrating Value",
    "No Clear Strategy/Roadmap",
    "Insufficient Governance",
    "Workflow Disruption",
    "Cybersecurity Concerns",
    "Data Privacy Compliance",
    "Lack of Trust in Tech/Vendors",
    "Regulatory Complexity",
    "External Pressure Without Readiness",
    "Vendor/Partner Difficulty",
]
READINESS_NAMES = [
    "Strategic Alignment",
    "Leadership Sponsorship",
    "Change Management Capability",
    "Workforce Skills",
    "Training Resources",
    "Funding Availability",
    "IT Infrastructure",
    "Data Quality",
    "Vendor Ecosystem",
    "Governance Structure",
    "Risk Management Process",
    "Performance Measurement",
    "Innovation Culture",
    "Cross-functional Collaboration",
    "Process Documentation",
    "Compliance Readiness",
    "External Partnerships",
]
MATURITY_NAMES = [
    "Technology Selection",
    "Implementation Planning",
    "Pilot/POC Execution",
    "Full Deployment",
    "Adoption Measurement",
    "Continuous Improvement",
    "Knowledge Management",
    "Strategic Integration",
]


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

    # Variable labels (long descriptions for SPSS dialogs and output)
    variable_labels: dict[str, str] = {}
    for i, name in enumerate(BARRIER_NAMES, start=1):
        variable_labels[f"B{i}"] = f"Barrier {i}: {name}"
    for i, name in enumerate(READINESS_NAMES, start=1):
        variable_labels[f"R{i}"] = f"Readiness {i}: {name}"
    for i, name in enumerate(MATURITY_NAMES, start=1):
        variable_labels[f"M{i}"] = f"Maturity {i}: {name}"
    variable_labels["B_mean"] = "Barriers construct mean (mean of B1-B18)"
    variable_labels["R_mean"] = "Readiness construct mean (mean of R1-R17)"
    variable_labels["M_mean"] = "Maturity construct mean (mean of M1-M8)"
    variable_labels["SMB_ENT"] = "Org size group: 1=SMB (<1000 emp), 2=Enterprise (>=1000 emp)"

    # Value labels (so SPSS dialogs show "Not a Barrier" / "Major Barrier" etc.)
    barrier_values = {1.0: "Not a Barrier", 2.0: "Minor", 3.0: "Moderate",
                      4.0: "Significant", 5.0: "Major Barrier"}
    readiness_values = {1.0: "Very Low", 2.0: "Low", 3.0: "Moderate",
                        4.0: "High", 5.0: "Very High Readiness"}
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
