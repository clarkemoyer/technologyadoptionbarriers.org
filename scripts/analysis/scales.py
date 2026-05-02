"""Canonical TABS V2 instrument constants - single source of truth.

Hosts both:

1. **Likert scale dicts** (BARRIER_SCALE / READINESS_SCALE / MATURITY_SCALE)
   plus the MISSING_TOKEN string and the fail-fast `encode_likert()` helper.
2. **Canonical item names** (BARRIER_NAMES / READINESS_NAMES / MATURITY_NAMES)
   that match the Qualtrics column subheaders. These are the names used in
   the dissertation tables and SPSS variable labels.

Used by the analysis pipeline (`tabs_v2_validation.py`,
`tabs_v2_unified_data_analysis.py`) AND the cross-platform verification
artifacts (`scripts/minitab/build_minitab_csv.py`, `scripts/spss/build_spss_artifacts.py`).

If the survey ever adds, renames, or reorders an item or Likert anchor,
update only this file - every downstream consumer picks the change up
automatically. This prevents the class of bug where a generator script
duplicates the names locally and silently drifts (which happened in PR
#1837 before this refactor).
"""
from __future__ import annotations

import math
from typing import Mapping

#: Barriers: 18 items (Q10-28). Anchors documented in the dissertation.
BARRIER_SCALE: Mapping[str, int] = {
    "Not a Barrier": 1,
    "Minor Barrier": 2,
    "Moderate Barrier": 3,
    "Significant Barrier": 4,
    "Major Barrier": 5,
}

#: Readiness: 17 items (Q47-64).
READINESS_SCALE: Mapping[str, int] = {
    "Very Low Readiness/Capability": 1,
    "Low Readiness/Capability": 2,
    "Moderate Readiness/Capability": 3,
    "High Readiness/Capability": 4,
    "Very High Readiness/Capability": 5,
}

#: Maturity: 8 items (Q65-73). CMMI-style 5-level scale.
MATURITY_SCALE: Mapping[str, int] = {
    "Level 1: Initial/Ad Hoc": 1,
    "Level 2: Developing/Repeatable": 2,
    "Level 3: Defined/Standardized": 3,
    "Level 4: Managed/Quantitatively Managed": 4,
    "Level 5: Optimizing/Innovating": 5,
}

#: Token Qualtrics inserts when a respondent selected "Don't Know" / "N/A".
#: Treated as missing (NaN) by every encoder.
MISSING_TOKEN: str = "Don't Know"

#: 18 Barrier item names, in survey order. Match Qualtrics column subheaders.
BARRIER_NAMES: tuple[str, ...] = (
    "Resistance to Change", "Lack of Leadership Support", "Risk-Averse Culture",
    "Insufficient Workforce Skills", "Inadequate Training", "High Implementation Cost",
    "Legacy System Integration", "Inadequate IT Infrastructure", "Difficulty Demonstrating Value",
    "No Clear Strategy/Roadmap", "Insufficient Governance", "Workflow Disruption",
    "Cybersecurity Concerns", "Data Privacy Compliance", "Lack of Trust in Tech/Vendors",
    "Regulatory Complexity", "External Pressure Without Readiness", "Vendor/Partner Difficulty",
)

#: 17 Readiness item names, in survey order.
READINESS_NAMES: tuple[str, ...] = (
    "Vision/Leadership", "Tech-Strategy Alignment", "IT Governance Effectiveness",
    "Culture Openness", "Innovation Support", "Technical Workforce",
    "Training Programs", "Change Management", "IT Infrastructure",
    "System Interoperability", "Technical Support", "Data Governance",
    "Data Quality", "Data Analytics", "Business Process Maturity",
    "Performance Monitoring", "Budget Adequacy",
)

#: 8 Maturity item names, in survey order. These are IT-capability domains
#: (CMMI / IT-CMF / COBIT / DREAMY style), NOT generic adoption-lifecycle stages.
#: PR #1682 documents the parallel concept-mapping framework grouping labels.
MATURITY_NAMES: tuple[str, ...] = (
    "IT Investment & Value Mgmt", "IT-Enabled Innovation",
    "Process Mgmt & Standardization", "Data Governance & Analytics",
    "Tech Risk & Resilience", "Strategic IT Planning",
    "Workforce Capability", "Change Leadership",
)


def encode_likert(value: object, scale_map: Mapping[str, int],
                  *, allow_missing: bool = True) -> float:
    """Encode a Qualtrics text response to a numeric Likert value.

    Parameters
    ----------
    value : object
        A cell from the Qualtrics export. May be a string label, NaN, or empty.
    scale_map : Mapping[str, int]
        One of BARRIER_SCALE / READINESS_SCALE / MATURITY_SCALE.
    allow_missing : bool, default True
        When True, NaN/empty/MISSING_TOKEN values map to math.nan. When False,
        any unrecognized value raises ValueError (useful for strict CSVs).

    Returns
    -------
    float
        The numeric Likert value (1-5), or math.nan if the value is missing.

    Raises
    ------
    ValueError
        If the value is a non-empty string that doesn't match any scale label
        (and isn't the MISSING_TOKEN). This is the fail-fast behavior the
        Copilot review of PR #1837 recommended for the cross-platform encoders.
    """
    if value is None:
        return math.nan if allow_missing else _raise_unknown(value, scale_map)
    # Handle pandas/numpy NaN without depending on those libraries here.
    try:
        if isinstance(value, float) and math.isnan(value):
            return math.nan if allow_missing else _raise_unknown(value, scale_map)
    except (TypeError, ValueError):
        pass

    s = str(value).strip()
    if s == "" or s == MISSING_TOKEN:
        return math.nan if allow_missing else _raise_unknown(s, scale_map)
    if s in scale_map:
        return float(scale_map[s])
    raise ValueError(
        f"Unknown Likert label: {s!r}. Expected one of {sorted(scale_map.keys())} "
        f"(or {MISSING_TOKEN!r} for missing). Update scripts/analysis/scales.py "
        f"if the survey added a new anchor."
    )


def _raise_unknown(value: object, scale_map: Mapping[str, int]) -> float:
    raise ValueError(
        f"Missing or unrecognized value {value!r}; expected one of "
        f"{sorted(scale_map.keys())} or {MISSING_TOKEN!r}."
    )
