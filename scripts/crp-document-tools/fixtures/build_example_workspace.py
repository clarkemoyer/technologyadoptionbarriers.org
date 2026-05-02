#!/usr/bin/env python3
"""Regenerate the synthetic CRP workspace fixture.

Produces a deterministic 30-respondent survey CSV in the same shape
``compute_crp_stats_v2.py`` and the v5 validator expect. Committed to
the repo so anyone can run the toolchain end-to-end without access to
the real CRP workspace.

Usage:
    python build_example_workspace.py

Determinism: fixed seed, sorted column order, ASCII-only output. Re-running
the script produces byte-identical output (modulo line endings on Windows).
"""

from __future__ import annotations

import csv
import os
import random
from datetime import datetime, timedelta

HERE = os.path.dirname(os.path.abspath(__file__))
WORKSPACE = os.path.join(HERE, "example_workspace")

BODY_DIR = os.path.join(WORKSPACE, "01 CRP Body")
APPENDIX_DIR = os.path.join(WORKSPACE, "02 CRP Appendixes")
SURVEY_DIR = os.path.join(WORKSPACE, "05 TABS Survey Support", "TABS Survey Data")

CSV_NAME = "TABS_V2_Enriched_CRP200_synthetic.csv"

BARRIER_LABELS = [
    "Not a Barrier", "Minor Barrier", "Moderate Barrier",
    "Significant Barrier", "Major Barrier",
]
READINESS_LABELS = [
    "Very Low Readiness/Capability", "Low Readiness/Capability",
    "Moderate Readiness/Capability", "High Readiness/Capability",
    "Very High Readiness/Capability",
]
MATURITY_LABELS = [
    "Level 1: Initial/Ad Hoc", "Level 2: Developing/Repeatable",
    "Level 3: Defined/Standardized", "Level 4: Managed/Quantitatively Managed",
    "Level 5: Optimizing/Innovating",
]

ROLES = [
    'CIO (e.g., Director of IT)',
    'CTO (e.g., Director of Technology/Innovation, Chief Scientist)',
    'CEO (e.g., Agency Director, Secretary, Administrator, City/County Manager)',
    'CFO (e.g., Director of Finance, Budget Director, Comptroller)',
    'COO (e.g., Deputy Director, Chief of Staff, Assistant Secretary for Administration)',
]

ORG_SIZES = ['<100', '100-499', '500-999', '1000-4999', '5000-9999', '10000+']
PROFIT_MODELS = ['For-Profit', 'Non-Profit', 'Government/Public Sector']
INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Education', 'Government', 'Manufacturing']
DECISION_AUTHS = ['Final', 'Strong', 'Moderate', 'Limited']
GEO_SCOPES = ['Local', 'Regional', 'National', 'International']

# Column layout matching the real Qualtrics export the validators expect.
BARRIER_COLS = [f"Q10-28_Barriers_{i}" for i in range(1, 20)]      # 18 items + IRI
READINESS_COLS = [f"Q47-64_Readiness_{i}" for i in range(1, 19)]   # 17 items + IRI
MATURITY_COLS = [f"Q65-73_Maturity_{i}" for i in range(1, 10)]     # 8 items + IRI

DEMO_COLS = [
    "ResponseId", "StartDate", "EndDate", "Duration (in seconds)",
    "Q1_Role", "Q2_DecisionAuth", "Q3_Industry", "Q4_OrgSize",
    "Q5_ProfitModel", "Q8_GeoScope", "Q74_Feedback",
]

ALL_COLS = DEMO_COLS + BARRIER_COLS + READINESS_COLS + MATURITY_COLS

V2_BASELINE = datetime(2026, 3, 24, 9, 0, 0)


def _make_clean_row(rng: random.Random, idx: int) -> dict:
    """Produce a respondent who passes the conservative clean filter.

    All 3 IRIs correct, duration >= 480, StartDate after the V2 cutoff. The
    non-IRI item scores are skewed slightly so ranking is stable and
    correlations are non-trivial across runs of the same seed.
    """
    start = V2_BASELINE + timedelta(days=idx, hours=rng.randint(0, 23))
    duration = rng.randint(540, 1800)
    end = start + timedelta(seconds=duration)
    row = {
        "ResponseId": f"R_synth_{idx:04d}",
        "StartDate": start.strftime("%Y-%m-%d %H:%M:%S"),
        "EndDate": end.strftime("%Y-%m-%d %H:%M:%S"),
        "Duration (in seconds)": str(duration),
        "Q1_Role": rng.choice(ROLES),
        "Q2_DecisionAuth": rng.choice(DECISION_AUTHS),
        "Q3_Industry": rng.choice(INDUSTRIES),
        "Q4_OrgSize": rng.choice(ORG_SIZES),
        "Q5_ProfitModel": rng.choice(PROFIT_MODELS),
        "Q8_GeoScope": rng.choice(GEO_SCOPES),
        "Q74_Feedback": "Synthetic respondent feedback." if rng.random() < 0.5 else "",
    }
    # Barriers: skew toward "Significant Barrier" / "Major Barrier" with the
    # IRI item locked to "Major Barrier" so it passes the clean filter.
    for i, col in enumerate(BARRIER_COLS):
        if col == "Q10-28_Barriers_19":  # IRI
            row[col] = "Major Barrier"
        else:
            row[col] = rng.choices(BARRIER_LABELS, weights=[1, 2, 4, 6, 4])[0]
    # Readiness: lower-skewed with IRI locked to "Low Readiness/Capability".
    for col in READINESS_COLS:
        if col == "Q47-64_Readiness_18":
            row[col] = "Low Readiness/Capability"
        else:
            row[col] = rng.choices(READINESS_LABELS, weights=[2, 5, 6, 4, 1])[0]
    # Maturity: middle-skewed with IRI locked to "Level 2: Developing/Repeatable".
    for col in MATURITY_COLS:
        if col == "Q65-73_Maturity_9":
            row[col] = "Level 2: Developing/Repeatable"
        else:
            row[col] = rng.choices(MATURITY_LABELS, weights=[2, 5, 7, 4, 1])[0]
    return row


def _make_failed_row(rng: random.Random, idx: int, mode: str) -> dict:
    """Produce a respondent who fails one specific clean-filter check.

    Modes: 'duration' (too fast), 'iri' (one IRI miss), 'old' (pre-V2 date).
    Used to populate the disposition waterfall with non-clean cases.
    """
    if mode == "old":
        start = datetime(2026, 3, 1, 12, 0, 0) + timedelta(hours=idx)
    else:
        start = V2_BASELINE + timedelta(days=20 + idx, hours=rng.randint(0, 23))
    duration = rng.randint(120, 400) if mode == "duration" else rng.randint(540, 1500)
    end = start + timedelta(seconds=duration)
    row = {
        "ResponseId": f"R_synth_fail_{idx:04d}",
        "StartDate": start.strftime("%Y-%m-%d %H:%M:%S"),
        "EndDate": end.strftime("%Y-%m-%d %H:%M:%S"),
        "Duration (in seconds)": str(duration),
        "Q1_Role": rng.choice(ROLES),
        "Q2_DecisionAuth": rng.choice(DECISION_AUTHS),
        "Q3_Industry": rng.choice(INDUSTRIES),
        "Q4_OrgSize": rng.choice(ORG_SIZES),
        "Q5_ProfitModel": rng.choice(PROFIT_MODELS),
        "Q8_GeoScope": rng.choice(GEO_SCOPES),
        "Q74_Feedback": "",
    }
    for col in BARRIER_COLS:
        if col == "Q10-28_Barriers_19" and mode == "iri":
            # Pick a wrong IRI answer.
            row[col] = "Moderate Barrier"
        elif col == "Q10-28_Barriers_19":
            row[col] = "Major Barrier"
        else:
            row[col] = rng.choice(BARRIER_LABELS)
    for col in READINESS_COLS:
        row[col] = "Low Readiness/Capability" if col == "Q47-64_Readiness_18" else rng.choice(READINESS_LABELS)
    for col in MATURITY_COLS:
        row[col] = "Level 2: Developing/Repeatable" if col == "Q65-73_Maturity_9" else rng.choice(MATURITY_LABELS)
    return row


def write_csv(path: str) -> None:
    rng = random.Random(20260417)  # fixed seed = deterministic fixture
    rows = [_make_clean_row(rng, i) for i in range(20)]
    rows.extend(_make_failed_row(rng, i, "duration") for i in range(4))
    rows.extend(_make_failed_row(rng, i + 4, "iri") for i in range(4))
    rows.extend(_make_failed_row(rng, i + 8, "old") for i in range(2))

    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="") as f:
        # lineterminator='\n' (not the csv default '\r\n') so the file is
        # byte-identical across Windows/macOS/Linux. Without this, the CI
        # determinism check fails because git stores LF but csv would write
        # CRLF on a Windows-generated commit.
        writer = csv.writer(f, lineterminator='\n')
        # Row 1: column names
        writer.writerow(ALL_COLS)
        # Row 2: question text (Qualtrics export shape)
        writer.writerow([f"Question text for {c}" for c in ALL_COLS])
        # Row 3: import IDs
        writer.writerow([f"{{\"ImportId\":\"{c}\"}}" for c in ALL_COLS])
        for row in rows:
            writer.writerow([row.get(c, "") for c in ALL_COLS])
    print(f"Wrote {len(rows)} synthetic respondents to {path}")


def write_appendix_stubs(appendix_dir: str) -> None:
    os.makedirs(appendix_dir, exist_ok=True)
    stubs = {
        "A_TABS_Survey_Instrument_(4-16-2026 0109 EDT).md":
            "# Appendix A - Survey Instrument (synthetic stub)\n\n"
            "This is a placeholder file shipped with the example workspace fixture. Real\n"
            "appendix content lives in the private CRP workspace.\n",
        "B_TABS_Research_Platform_(4-16-2026 0054 EDT).md":
            "# Appendix B - Research Platform (synthetic stub)\n\n"
            "Placeholder.\n",
        "C_Data_Analysis_and_Validation_(4-16-2026 0054 EDT).md":
            "# Appendix C - Data Analysis and Validation (synthetic stub)\n\n"
            "Placeholder.\n",
        "D_Institutional_Governance_(4-16-2026 0054 EDT).md":
            "# Appendix D - Institutional Governance (synthetic stub)\n\n"
            "Placeholder.\n",
    }
    for name, content in stubs.items():
        with open(os.path.join(appendix_dir, name), "w", encoding="utf-8") as f:
            f.write(content)
    print(f"Wrote {len(stubs)} appendix stub files to {appendix_dir}")


def write_body_placeholder(body_dir: str) -> None:
    os.makedirs(body_dir, exist_ok=True)
    placeholder = os.path.join(body_dir, "README.txt")
    with open(placeholder, "w", encoding="utf-8") as f:
        f.write(
            "Synthetic CRP body docx is not committed to the repo (binary, large).\n"
            "To build one for testing the merge_appendixes.py script:\n\n"
            "    pip install python-docx\n"
            "    python -c \"from docx import Document; d=Document(); "
            "d.add_heading('Example Body', 0); "
            "d.save('Clarke Moyer - Example Body (4-16-2026 0109 EDT).docx')\"\n\n"
            "This avoids checking a binary into git history while still letting the\n"
            "fixture demonstrate the body+appendix merge pattern when needed.\n"
        )
    print(f"Wrote body-dir README at {placeholder}")


def main():
    write_csv(os.path.join(SURVEY_DIR, CSV_NAME))
    write_appendix_stubs(APPENDIX_DIR)
    write_body_placeholder(BODY_DIR)
    print(f"\nFixture workspace ready at: {WORKSPACE}")


if __name__ == "__main__":
    main()
