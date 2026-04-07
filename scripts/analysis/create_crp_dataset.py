#!/usr/bin/env python3
"""create_crp_dataset.py — Build the final CRP public dataset (N=200).

Selects N=200 responses from Prolific Accepted participants using a
three-tier quality-based selection strategy, then de-identifies the
result for ScholarSphere deposit.

Tier Selection Strategy
=======================

  Tier 1 — Conservative Clean (auto-include all)
      Prolific APPROVED + ALL quality checks:
        - All 3 IRI attention checks correct
        - Duration >= 540 s (Smeal eDBA benchmark)
        - reCAPTCHA score >= 0.5
        - No full straightlining (Q_StraightliningCount == 0)
        - No partial straightlining (within-person SD >= 0.5 in all blocks)
        - No auth flags (Auth_LLM and Auth_Bots not LOW or MIXED)

  Tier 2 — Flexible Clean surplus (auto-include all)
      Prolific APPROVED + basic quality (all 3 IRIs + duration >= 480 s)
      that did NOT qualify for Tier 1.

  Tier 3 — Quality-ranked fill (top N remaining)
      Remaining Prolific APPROVED responses ranked by composite quality
      score (0–100 pts):

        Indicator                  Weight  Scoring
        ─────────────────────────  ──────  ──────────────────────────────────
        IRI Correct Count           35 pts  0/3→0, 1/3→8, 2/3→22, 3/3→35
        Duration (normalized)       20 pts  min(dur, 900) / 900 × 20
        reCAPTCHA Score             15 pts  score × 15
        Auth Check Pass             15 pts  Neither flagged→15, one→5, both→0
        No Full Straightlining       8 pts  count==0 → 8, else 0
        No Partial Straightlining    7 pts  no block SD<0.5 → 7, else 0

      The three independent authenticity/bot-detection systems are weighted
      equally at the platform level:
        - Google reCAPTCHA (15 pts) — browser-level bot detection
        - Prolific Auth (15 pts) — behavioral LLM and bot detection
        - Qualtrics Straightlining (15 pts combined) — response pattern quality

      Tie-breaking: IRI count desc → Duration desc → ResponseId alphabetical

De-identification (NIST 5-step)
===============================
  1. Free-text PII scan and redaction
  2. Prolific linkage file extraction (before ID replacement)
  3. ResponseId replacement → sequential TABS_V2_NNN
  4. Timestamp generalization → date-only
  5. Column exclusion (drop PII/platform columns)

Usage:
    python create_crp_dataset.py <enriched_qualtrics_csv>
    python create_crp_dataset.py data.csv --target-n 200 --output-dir ./output
    python create_crp_dataset.py data.csv --dry-run

Exit codes:
    0  Success
    1  PII detected in output (verification failed)
    2  Input / configuration error

Author: Clarke Moyer, Penn State Smeal DBA
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import math
import re
import sys
from datetime import datetime
from pathlib import Path

# ─────────────────────────────────────────────────────────────
# Configuration — mirrors tabs_v2_analysis.py exactly
# ─────────────────────────────────────────────────────────────

V2_START = "2026-03-23 14:00:00"
PROLIFIC_TEST_ID = "R_1QK12IJpHjC3wd6"

MIN_DURATION_PIPELINE_CLEAN = 540   # 9 min — Smeal eDBA benchmark
MIN_DURATION_CLEAN = 480            # 8 min — flexible clean threshold
MIN_DURATION_ALL = 120              # 2 min — extreme speeder cutoff
SPEED_FLAG_THRESHOLD = 300          # 5 min — speed flag
SMEAL_UPPER = 540                   # upper bound of Smeal window

RECAPTCHA_THRESHOLD = 0.5
PARTIAL_STRAIGHTLINING_SD_THRESHOLD = 0.5

# Scale maps
BARRIER_SCALE = {
    "Not a Barrier": 1, "Minor Barrier": 2, "Moderate Barrier": 3,
    "Significant Barrier": 4, "Major Barrier": 5,
}
READINESS_SCALE = {
    "Very Low Readiness/Capability": 1, "Low Readiness/Capability": 2,
    "Moderate Readiness/Capability": 3, "High Readiness/Capability": 4,
    "Very High Readiness/Capability": 5,
}
MATURITY_SCALE = {
    "Level 1: Initial/Ad Hoc": 1, "Level 2: Developing/Repeatable": 2,
    "Level 3: Defined/Standardized": 3,
    "Level 4: Managed/Quantitatively Managed": 4,
    "Level 5: Optimizing/Innovating": 5,
}

# Column definitions
BARRIER_COLS = [f"Q10-28_Barriers_{i}" for i in range(1, 19)]
BARRIER_IRI = "Q10-28_Barriers_19"
READINESS_COLS = [f"Q47-64_Readiness_{i}" for i in range(1, 18)]
READINESS_IRI = "Q47-64_Readiness_18"
MATURITY_COLS = [f"Q65-73_Maturity_{i}" for i in range(1, 9)]
MATURITY_IRI = "Q65-73_Maturity_9"

IRI_BARRIER_ANSWER = "Major Barrier"
IRI_READINESS_ANSWER = "Low Readiness/Capability"
IRI_MATURITY_ANSWER = "Level 2: Developing/Repeatable"

# Quality score weights (total = 100)
WEIGHT_IRI = 35
WEIGHT_DURATION = 20
WEIGHT_RECAPTCHA = 15
WEIGHT_AUTH = 15
WEIGHT_FULL_STRAIGHTLINING = 8
WEIGHT_PARTIAL_STRAIGHTLINING = 7
IRI_SCORE_MAP = {0: 0, 1: 8, 2: 22, 3: 35}
DURATION_CAP = 900  # 15 min cap for normalization

# PII detection patterns — mirrors deidentify_tabs_data.py
PII_PATTERNS = [
    (re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"), "email address"),
    (re.compile(r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b"), "phone number"),
    (re.compile(r"https?://\S+", re.IGNORECASE), "URL"),
    (
        re.compile(
            r"\b(?:work(?:s|ing)?|employed|job|position)\s+(?:at|for|with)\s+([A-Z][A-Za-z\s&.,']{2,30})",
            re.IGNORECASE,
        ),
        "employer reference",
    ),
    (re.compile(r"\$\s*[\d,]+(?:\.\d+)?\s*(?:million|billion|M|B|k)?\b", re.IGNORECASE), "dollar amount"),
    (re.compile(r"\b\d[\d,]*\s+employees\b", re.IGNORECASE), "employee count"),
]

FREE_TEXT_COLUMNS = ["Q74_Feedback", "Q1_Role_11_TEXT", "Q3_Industry_26_TEXT"]
TIMESTAMP_COLUMNS = ["StartDate", "EndDate", "RecordedDate"]

COLUMNS_TO_DROP = {
    "IPAddress", "PROLIFIC_PID", "STUDY_ID", "SESSION_ID", "COMPLETE_URL",
    "SOURCE", "RecipientLastName", "RecipientFirstName", "RecipientEmail",
    "ExternalReference", "LocationLatitude", "LocationLongitude",
    "Auth_LLM", "Auth_Bots", "Prolific_Status",
}
PROLIFIC_DEMO_PREFIX = "Prolific_"

PROLIFIC_LINKAGE_COLUMNS = [
    "ResponseId", "PROLIFIC_PID", "STUDY_ID", "SESSION_ID", "COMPLETE_URL",
]


# ─────────────────────────────────────────────────────────────
# Data helpers — mirrors tabs_v2_analysis.py
# ─────────────────────────────────────────────────────────────


def load_qualtrics_csv(csv_path: str) -> tuple[list[str], list[list[str]]]:
    """Load Qualtrics CSV with 3 header rows. Returns (headers, data_rows)."""
    with open(csv_path, "r", encoding="utf-8-sig") as f:
        reader = csv.reader(f)
        try:
            headers = next(reader)
            next(reader)  # description row
            next(reader)  # import ID row
        except StopIteration:
            print(
                "Error: invalid Qualtrics CSV input; expected 3 header rows "
                "(header, description, import ID) before data rows.",
                file=sys.stderr,
            )
            raise SystemExit(2)
        data = list(reader)
    return headers, data


def make_idx(headers: list[str]) -> dict[str, int]:
    """Create column name → index mapping."""
    return {h: i for i, h in enumerate(headers)}


def get_val(row: list[str], idx: dict[str, int], col: str) -> str:
    """Get stripped value from row by column name."""
    if col not in idx:
        return ""
    i = idx[col]
    return row[i].strip() if i < len(row) else ""


def get_duration(row: list[str], idx: dict[str, int]) -> int | None:
    """Get duration in seconds."""
    try:
        return int(get_val(row, idx, "Duration (in seconds)"))
    except (ValueError, KeyError):
        return None


def is_finished(row: list[str], idx: dict[str, int]) -> bool:
    """Check if response is finished."""
    val = get_val(row, idx, "Finished").upper()
    return val in ("TRUE", "1")


def iri_correct_count(row: list[str], idx: dict[str, int]) -> int:
    """Count correct IRI attention checks (0–3)."""
    correct = 0
    if get_val(row, idx, BARRIER_IRI) == IRI_BARRIER_ANSWER:
        correct += 1
    if get_val(row, idx, READINESS_IRI) == IRI_READINESS_ANSWER:
        correct += 1
    if get_val(row, idx, MATURITY_IRI) == IRI_MATURITY_ANSWER:
        correct += 1
    return correct


def get_recaptcha_score(row: list[str], idx: dict[str, int]) -> float:
    """Get reCAPTCHA score (defaults to 1.0 if missing)."""
    val = get_val(row, idx, "Q_RecaptchaScore")
    if not val:
        return 1.0
    try:
        return float(val)
    except ValueError:
        return 1.0


def get_straightlining_count(row: list[str], idx: dict[str, int]) -> int:
    """Get Qualtrics straightlining count (defaults to 0 if missing)."""
    val = get_val(row, idx, "Q_StraightliningCount")
    if not val:
        return 0
    try:
        return int(val)
    except ValueError:
        return 0


def within_person_sd(responses: list[str]) -> float:
    """Compute within-person SD for categorical responses."""
    non_empty = [r for r in responses if r != ""]
    if len(non_empty) < 2:
        return float("nan")
    unique_vals = list(dict.fromkeys(non_empty))
    numeric = [unique_vals.index(r) for r in non_empty]
    mean = sum(numeric) / len(numeric)
    variance = sum((val - mean) ** 2 for val in numeric) / len(numeric)
    return math.sqrt(variance)


def has_partial_straightlining(
    row: list[str], idx: dict[str, int],
    threshold: float = PARTIAL_STRAIGHTLINING_SD_THRESHOLD,
) -> bool:
    """Check if any question block has within-person SD below threshold."""
    blocks = [
        ("Barriers", BARRIER_COLS),
        ("Readiness", READINESS_COLS),
        ("Maturity", MATURITY_COLS),
    ]
    for _name, cols in blocks:
        responses = []
        for col in cols:
            if col in idx:
                responses.append(get_val(row, idx, col))
        non_empty = [r for r in responses if r != ""]
        if len(non_empty) < max(2, math.ceil(len(cols) / 2)):
            continue
        sd = within_person_sd(responses)
        if not math.isnan(sd) and sd < threshold:
            return True
    return False


def has_auth_flag(row: list[str], idx: dict[str, int]) -> tuple[bool, bool]:
    """Check Prolific auth flags. Returns (llm_flagged, bots_flagged)."""
    llm = get_val(row, idx, "Auth_LLM").upper()
    bots = get_val(row, idx, "Auth_Bots").upper()
    llm_flag = llm in ("LOW", "MIXED")
    bots_flag = bots in ("LOW", "MIXED")
    return llm_flag, bots_flag


def get_prolific_status(row: list[str], idx: dict[str, int]) -> str:
    """Get Prolific submission status."""
    return get_val(row, idx, "Prolific_Status")


def get_response_id(row: list[str], idx: dict[str, int]) -> str:
    """Get ResponseId."""
    return get_val(row, idx, "ResponseId")


# ─────────────────────────────────────────────────────────────
# Disposition waterfall (for reporting only)
# ─────────────────────────────────────────────────────────────


def classify_disposition(row: list[str], idx: dict[str, int]) -> str:
    """Apply the 10-step disposition waterfall. Returns disposition label."""
    # Step 0: Incomplete
    if not is_finished(row, idx):
        return "INCOMPLETE"

    # Steps 1-2: Auth flags
    llm_flag, bots_flag = has_auth_flag(row, idx)
    llm_val = get_val(row, idx, "Auth_LLM").upper()
    bots_val = get_val(row, idx, "Auth_Bots").upper()
    if llm_val == "LOW" or bots_val == "LOW":
        return "FLAG-AUTH-FAIL"
    if llm_val == "MIXED" or bots_val == "MIXED":
        return "FLAG-AUTH-MIXED"

    # Step 3: Auto-exclude
    dur = get_duration(row, idx)
    iri_fails = 3 - iri_correct_count(row, idx)
    speed_flag = dur is not None and dur < SPEED_FLAG_THRESHOLD
    if iri_fails >= 2 or (speed_flag and iri_fails >= 1):
        return "AUTO-EXCLUDE"

    # Step 4: Speed only (fast but all IRIs correct)
    if speed_flag:
        return "FLAG-SPEED"

    # Step 5: Single IRI failure
    if iri_fails == 1 and dur is not None and dur >= SPEED_FLAG_THRESHOLD:
        return "FLAG-SINGLE-IRI"

    # Step 6: Smeal benchmark (300-539s, all IRIs pass)
    if dur is not None and SPEED_FLAG_THRESHOLD <= dur < SMEAL_UPPER:
        return "FLAG-SMEAL"

    # Step 7: reCAPTCHA
    if get_recaptcha_score(row, idx) < RECAPTCHA_THRESHOLD:
        return "FLAG-RECAPTCHA"

    # Step 8: Full straightlining
    if get_straightlining_count(row, idx) > 0:
        return "FLAG-STRAIGHTLINING"

    # Step 9: Partial straightlining
    if has_partial_straightlining(row, idx):
        return "FLAG-PARTIAL-STRAIGHTLINING"

    # Step 10: Clean
    return "CLEAN"


# ─────────────────────────────────────────────────────────────
# Quality score computation
# ─────────────────────────────────────────────────────────────


def compute_quality_score(row: list[str], idx: dict[str, int]) -> float:
    """Compute composite quality score (0–100) for Tier 3 ranking.

    Components:
      IRI Correct Count          35 pts  (0→0, 1→8, 2→22, 3→35)
      Duration (normalized)      20 pts  min(dur, 900) / 900 × 20
      reCAPTCHA Score            15 pts  score × 15
      Auth Check Pass            15 pts  neither→15, one→5, both→0
      No Full Straightlining      8 pts  count==0 → 8, else 0
      No Partial Straightlining   7 pts  no block SD<0.5 → 7, else 0

    The three independent authenticity/bot-detection systems — Google
    reCAPTCHA, Prolific Auth, and Qualtrics Straightlining — are weighted
    equally at the platform level (15 pts each).
    """
    score = 0.0

    # IRI (35 pts)
    iri_count = iri_correct_count(row, idx)
    score += IRI_SCORE_MAP.get(iri_count, 0)

    # Duration (20 pts)
    dur = get_duration(row, idx)
    if dur is not None and dur > 0:
        score += min(dur, DURATION_CAP) / DURATION_CAP * WEIGHT_DURATION
    # else: 0 pts

    # reCAPTCHA (15 pts)
    recaptcha = get_recaptcha_score(row, idx)
    score += recaptcha * WEIGHT_RECAPTCHA

    # Auth (15 pts) — equal weight to reCAPTCHA as independent platform signal
    llm_flag, bots_flag = has_auth_flag(row, idx)
    if not llm_flag and not bots_flag:
        score += WEIGHT_AUTH        # 15 — neither flagged
    elif llm_flag and bots_flag:
        score += 0                  #  0 — both flagged
    else:
        score += 5                  #  5 — one flagged

    # Full straightlining (8 pts)
    if get_straightlining_count(row, idx) == 0:
        score += WEIGHT_FULL_STRAIGHTLINING

    # Partial straightlining (7 pts)
    if not has_partial_straightlining(row, idx):
        score += WEIGHT_PARTIAL_STRAIGHTLINING

    return round(score, 2)


def sort_key_quality(entry: dict) -> tuple:
    """Sort key for Tier 3: quality score desc, IRI desc, duration desc, ResponseId asc."""
    return (
        -entry["quality_score"],
        -entry["iri_count"],
        -(entry["duration"] or 0),
        entry["response_id"],
    )


# ─────────────────────────────────────────────────────────────
# V2 filtering, deduplication, and tiered selection
# ─────────────────────────────────────────────────────────────


def filter_v2_and_dedup(
    data: list[list[str]], idx: dict[str, int],
) -> list[list[str]]:
    """Filter to V2 responses and deduplicate by PROLIFIC_PID."""
    v2 = [
        r for r in data
        if get_val(r, idx, "StartDate") >= V2_START
        or get_response_id(r, idx) == PROLIFIC_TEST_ID
    ]

    if "PROLIFIC_PID" not in idx:
        return v2

    by_pid: dict[str, list[str]] = {}
    for r in v2:
        pid = get_val(r, idx, "PROLIFIC_PID")
        if not pid:
            continue
        existing = by_pid.get(pid)
        if existing is None:
            by_pid[pid] = r
        else:
            existing_fin = is_finished(existing, idx)
            new_fin = is_finished(r, idx)
            if new_fin or not existing_fin:
                by_pid[pid] = r
    return list(by_pid.values())


def build_response_profile(row: list[str], idx: dict[str, int]) -> dict:
    """Build a complete quality profile for a single response."""
    dur = get_duration(row, idx)
    iri_count = iri_correct_count(row, idx)
    recaptcha = get_recaptcha_score(row, idx)
    llm_flag, bots_flag = has_auth_flag(row, idx)
    straightlining = get_straightlining_count(row, idx)
    partial_sl = has_partial_straightlining(row, idx)
    disposition = classify_disposition(row, idx)
    quality = compute_quality_score(row, idx)

    return {
        "row": row,
        "response_id": get_response_id(row, idx),
        "prolific_status": get_prolific_status(row, idx),
        "finished": is_finished(row, idx),
        "duration": dur,
        "iri_count": iri_count,
        "recaptcha": recaptcha,
        "llm_flag": llm_flag,
        "bots_flag": bots_flag,
        "straightlining": straightlining,
        "partial_straightlining": partial_sl,
        "disposition": disposition,
        "quality_score": quality,
        "tier": None,       # assigned below
        "selected": False,  # assigned below
    }


def select_crp_sample(
    profiles: list[dict], target_n: int,
) -> list[dict]:
    """Apply tiered selection and return all profiles with tier/selected flags set."""
    # Prolific Accepted pool
    accepted = [p for p in profiles if p["prolific_status"] == "APPROVED"]

    if len(accepted) < target_n:
        print(f"  WARNING: Only {len(accepted)} Prolific Accepted, target is {target_n}")

    # Tier 1: Conservative Clean
    tier1 = []
    for p in accepted:
        if (p["finished"]
                and p["iri_count"] == 3
                and p["duration"] is not None
                and p["duration"] >= MIN_DURATION_PIPELINE_CLEAN
                and p["recaptcha"] >= RECAPTCHA_THRESHOLD
                and p["straightlining"] == 0
                and not p["partial_straightlining"]
                and not p["llm_flag"]
                and not p["bots_flag"]):
            p["tier"] = 1
            p["selected"] = True
            tier1.append(p)

    tier1_ids = {p["response_id"] for p in tier1}

    # Tier 2: Flexible Clean minus Tier 1
    tier2 = []
    for p in accepted:
        if p["response_id"] in tier1_ids:
            continue
        if (p["finished"]
                and p["iri_count"] == 3
                and p["duration"] is not None
                and p["duration"] >= MIN_DURATION_CLEAN):
            p["tier"] = 2
            p["selected"] = True
            tier2.append(p)

    tier12_ids = tier1_ids | {p["response_id"] for p in tier2}

    # Tier 3: Remaining Accepted, ranked by quality score
    # Filter out incomplete or extremely short responses — they passed Prolific
    # approval but are not usable for analysis (no substantive item data).
    tier3_pool = [p for p in accepted
                  if p["response_id"] not in tier12_ids
                  and p["finished"]
                  and p["duration"] is not None
                  and p["duration"] >= MIN_DURATION_ALL]
    for p in tier3_pool:
        p["tier"] = 3

    tier3_pool.sort(key=sort_key_quality)

    eligible = len(tier1) + len(tier2) + len(tier3_pool)
    if eligible < target_n:
        print(f"  WARNING: Only {eligible} eligible responses "
              f"(Tier 1: {len(tier1)}, Tier 2: {len(tier2)}, "
              f"Tier 3 eligible: {len(tier3_pool)}). "
              f"Final dataset will have {eligible} rows, not {target_n}.")

    slots_remaining = max(0, target_n - len(tier1) - len(tier2))
    for i, p in enumerate(tier3_pool):
        if i < slots_remaining:
            p["selected"] = True
        else:
            p["selected"] = False

    return profiles  # all profiles now have tier/selected set


# ──────────────────────────────────────────────────────────────
# Selection manifest and reporting
# ───────────────────────────────────────────────────────────────


def generate_manifest(profiles: list[dict], target_n: int) -> str:
    """Generate the full selection manifest as a string."""
    lines: list[str] = []
    w = lines.append

    accepted = [p for p in profiles if p["prolific_status"] == "APPROVED"]
    selected = [p for p in accepted if p["selected"]]
    tier1 = [p for p in accepted if p["tier"] == 1]
    tier2 = [p for p in accepted if p["tier"] == 2]
    tier3 = [p for p in accepted if p["tier"] == 3]
    tier3_selected = [p for p in tier3 if p["selected"]]
    tier3_excluded = [p for p in tier3 if not p["selected"]]

    w("=" * 78)
    w("  CRP DATASET SELECTION MANIFEST")
    w(f"  Generated: {datetime.utcnow().isoformat()}Z")
    w(f"  Target N: {target_n}")
    w("=" * 78)

    # ── Summary table ──
    w("\n  TIER SUMMARY")
    w(f"  {'Tier':<35} {'Count':>6} {'Cumulative':>11}")
    w(f"  {'─' * 35} {'─' * 6} {'─' * 11}")
    cum = 0
    cum += len(tier1)
    w(f"  {'1: Conservative Clean':<35} {len(tier1):>6} {cum:>11}")
    cum += len(tier2)
    w(f"  {'2: Flexible Clean Surplus':<35} {len(tier2):>6} {cum:>11}")
    cum += len(tier3_selected)
    w(f"  {'3: Quality-Ranked Fill':<35} {len(tier3_selected):>6} {cum:>11}")
    w(f"  {'─' * 35} {'─' * 6} {'─' * 11}")
    w(f"  {'TOTAL SELECTED':<35} {len(selected):>6}")
    w(f"  {'Tier 3 Excluded':<35} {len(tier3_excluded):>6}")
    w(f"  {'Total Prolific Accepted':<35} {len(accepted):>6}")

    # ── Tier 2 breakdown by disposition ──
    w("\n\n  TIER 2 BREAKDOWN (Flexible Clean minus Conservative)")
    w(f"  {'Disposition':<35} {'Count':>6}")
    w(f"  {'─' * 35} {'─' * 6}")
    t2_disp = {}
    for p in tier2:
        t2_disp[p["disposition"]] = t2_disp.get(p["disposition"], 0) + 1
    for disp in sorted(t2_disp.keys()):
        w(f"  {disp:<35} {t2_disp[disp]:>6}")

    # ── Tier 3 breakdown by disposition subcategory ──
    w("\n\n  TIER 3 BREAKDOWN BY DISPOSITION")
    w(f"  {'Disposition':<30} {'Selected':>9} {'Excluded':>9} {'Total':>6}")
    w(f"  {'─' * 30} {'─' * 9} {'─' * 9} {'─' * 6}")
    t3_dispositions = {}
    for p in tier3:
        d = p["disposition"]
        if d not in t3_dispositions:
            t3_dispositions[d] = {"selected": 0, "excluded": 0}
        if p["selected"]:
            t3_dispositions[d]["selected"] += 1
        else:
            t3_dispositions[d]["excluded"] += 1
    for disp in sorted(t3_dispositions.keys()):
        s = t3_dispositions[disp]["selected"]
        e = t3_dispositions[disp]["excluded"]
        w(f"  {disp:<30} {s:>9} {e:>9} {s + e:>6}")

    # ── FLAG-SPEED detail (user specifically requested this) ──
    speed_responses = [p for p in tier3 if p["disposition"] == "FLAG-SPEED"]
    w("\n\n  FLAG-SPEED DETAIL (Speed Only — all 3 IRIs correct, duration < 300s)")
    w(f"  Total FLAG-SPEED in Tier 3: {len(speed_responses)}")
    if speed_responses:
        w(f"\n  {'ResponseId':<20} {'Score':>6} {'Dur(s)':>7} {'reCAPTCHA':>10} "
          f"{'Auth_LLM':>9} {'Auth_Bot':>9} {'SL':>3} {'PSL':>4} {'Result':>10}")
        w(f"  {'─' * 20} {'─' * 6} {'──' * 7} {'─' * 10} "
          f"{'─' * 9} {'─' * 9} {'─' * 3} {'─' * 4} {'─' * 10}")
        for p in sorted(speed_responses, key=lambda x: -x["quality_score"]):
            auth_llm = "FLAG" if p["llm_flag"] else "PASS"
            auth_bot = "FLAG" if p["bots_flag"] else "PASS"
            sl = str(p["straightlining"])
            psl = "Y" if p["partial_straightlining"] else "N"
            result = "SELECTED" if p["selected"] else "EXCLUDED"
            w(f"  {p['response_id']:<20} {p['quality_score']:>6.1f} "
              f"{p['duration'] or 0:>7d} {p['recaptcha']:>10.3f} "
              f"{auth_llm:>9} {auth_bot:>9} {sl:>3} {psl:>4} {result:>10}")
    else:
        w("  (none)")

    # ── Quality score distribution ──
    w("\n\n  TIER 3 QUALITY SCORE DISTRIBUTION")
    if tier3:
        all_scores = sorted([p["quality_score"] for p in tier3], reverse=True)
        selected_scores = sorted([p["quality_score"] for p in tier3_selected], reverse=True)
        excluded_scores = sorted([p["quality_score"] for p in tier3_excluded], reverse=True)

        # Histogram bins
        bins = [(90, 100), (80, 90), (70, 80), (60, 70), (50, 60),
                (40, 50), (30, 40), (20, 30), (10, 20), (0, 10)]
        w(f"\n  {'Score Range':<15} {'Selected':>9} {'Excluded':>9} {'Total':>6}")
        w(f"  {'─' * 15} {'─' * 9} {'─' * 9} {'─' * 6}")
        for lo, hi in bins:
            s = sum(1 for x in selected_scores if lo <= x < hi)
            e = sum(1 for x in excluded_scores if lo <= x < hi)
            if s + e > 0:
                w(f"  {lo:>3}–{hi:<3}        {s:>9} {e:>9} {s + e:>6}")

        if tier3_selected:
            cutoff = min(p["quality_score"] for p in tier3_selected)
            w(f"\n  Cutoff score (minimum selected): {cutoff:.2f}")
        if tier3_excluded:
            max_excluded = max(p["quality_score"] for p in tier3_excluded)
            w(f"  Highest excluded score:          {max_excluded:.2f}")

        # Summary stats
        w(f"\n  Selected  — min: {min(selected_scores):.2f}, "
          f"max: {max(selected_scores):.2f}, "
          f"mean: {sum(selected_scores) / len(selected_scores):.2f}")
        if excluded_scores:
            w(f"  Excluded  — min: {min(excluded_scores):.2f}, "
              f"max: {max(excluded_scores):.2f}, "
              f"mean: {sum(excluded_scores) / len(excluded_scores):.2f}")

    # ── Full per-response manifest ──
    w("\n\n  FULL RESPONSE MANIFEST (Prolific Accepted only)")
    w(f"  {'ResponseId':<20} {'Tier':>5} {'Sel':>4} {'Disposition':<30} "
      f"{'QScore':>7} {'IRI':>4} {'Dur':>6} {'reCAPTCHA':>10} "
      f"{'AuthLLM':>8} {'AuthBot':>8} {'SL':>3} {'PSL':>4}")
    w(f"  {'─' * 20} {'─' * 5} {'─' * 4} {'─' * 30} "
      f"{'─' * 7} {'─' * 4} {'─' * 6} {'─' * 10} "
      f"{'─' * 8} {'─' * 8} {'─' * 3} {'─' * 4}")

    for p in sorted(accepted, key=lambda x: (x["tier"] or 99, -x["quality_score"])):
        tier_str = str(p["tier"]) if p["tier"] else "—"
        sel_str = "Y" if p["selected"] else "N"
        auth_llm = "FLAG" if p["llm_flag"] else "PASS"
        auth_bot = "FLAG" if p["bots_flag"] else "PASS"
        sl = str(p["straightlining"])
        psl = "Y" if p["partial_straightlining"] else "N"
        w(f"  {p['response_id']:<20} {tier_str:>5} {sel_str:>4} "
          f"{p['disposition']:<30} {p['quality_score']:>7.2f} "
          f"{p['iri_count']:>4} {p['duration'] or 0:>6} "
          f"{p['recaptcha']:>10.3f} {auth_llm:>8} {auth_bot:>8} "
          f"{sl:>3} {psl:>4}")

    w("\n" + "=" * 78)
    return "\n".join(lines)


# ─────────────────────────────────────────────────────────────
# De-identification pipeline (mirrors deidentify_tabs_data.py)
# ─────────────────────────────────────────────────────────────


def sha256_file(path: Path) -> str:
    """Compute SHA-256 hash of a file."""
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def scan_pii(
    rows: list[dict[str, str]],
    free_text_columns: list[str],
    row_offset: int = 4,
) -> list[dict]:
    """Scan free-text columns for PII patterns.

    Defaults to Qualtrics input row numbering (3 header rows => first data row
    is CSV row 4). Callers scanning one-header-row public output should pass
    ``row_offset=2`` explicitly.
    """
    flags: list[dict] = []
    for row_idx, row in enumerate(rows):
        for col in free_text_columns:
            text = row.get(col, "").strip()
            if not text or text.lower() == "none":
                continue
            for pattern, pattern_type in PII_PATTERNS:
                for match in pattern.finditer(text):
                    redact_target = match.group(1) if match.lastindex else match.group()
                    flags.append({
                        "row_index": row_idx,
                        "row_number": row_idx + row_offset,
                        "column": col,
                        "pattern_type": pattern_type,
                        "match": redact_target,
                        "text": text,
                    })
    return flags


def redact_pii(rows: list[dict[str, str]], flags: list[dict]) -> int:
    """Apply [REDACTED] to all flagged PII matches. Returns count."""
    count = 0
    for flag in flags:
        row = rows[flag["row_index"]]
        col = flag["column"]
        original = row[col]
        redacted = original.replace(flag["match"], "[REDACTED]")
        if redacted != original:
            row[col] = redacted
            count += 1
    return count


def rows_to_dicts(
    selected_rows: list[list[str]], headers: list[str],
) -> list[dict[str, str]]:
    """Convert list-of-lists rows to list-of-dicts, padding short rows."""
    n = len(headers)
    return [dict(zip(headers, row + [""] * (n - len(row)))) for row in selected_rows]


def replace_response_ids(
    rows: list[dict[str, str]],
) -> tuple[list[dict[str, str]], list[tuple[str, str]]]:
    """Replace ResponseId with sequential TABS_V2_NNN (sorted by StartDate)."""
    rows.sort(key=lambda r: r.get("StartDate", ""))
    mapping: list[tuple[str, str]] = []
    for i, row in enumerate(rows, start=1):
        original_id = row.get("ResponseId", "")
        new_id = f"TABS_V2_{i:03d}"
        mapping.append((original_id, new_id))
        row["ResponseId"] = new_id
    return rows, mapping


def generalize_timestamps(
    rows: list[dict[str, str]], columns: list[str],
) -> None:
    """Generalize timestamp columns to date-only format."""
    for row in rows:
        for col in columns:
            val = row.get(col, "").strip()
            if not val:
                continue
            row[col] = val.split(" ")[0] if " " in val else val


def filter_columns(
    headers: list[str], rows: list[dict[str, str]], drop_columns: set[str],
) -> tuple[list[str], list[dict[str, str]]]:
    """Remove PII/platform columns and Prolific_* demographics."""
    kept = [h for h in headers
            if h not in drop_columns and not h.startswith(PROLIFIC_DEMO_PREFIX)]
    filtered = [{h: row.get(h, "") for h in kept} for row in rows]
    return kept, filtered


def extract_linkage(
    rows: list[dict[str, str]], columns: list[str],
) -> list[dict[str, str]]:
    """Extract Prolific linkage data before column removal."""
    return [{col: row.get(col, "") for col in columns} for row in rows]


def write_csv(
    path: Path, headers: list[str], rows: list[dict[str, str]],
) -> None:
    """Write a CSV file."""
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=headers, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def write_pii_report(path: Path, flags: list[dict]) -> None:
    """Write the PII review report."""
    with open(path, "w", encoding="utf-8") as f:
        f.write("PII REVIEW REPORT — CRP DATASET\n")
        f.write(f"Generated: {datetime.utcnow().isoformat()}Z\n")
        f.write(f"Total flags: {len(flags)}\n")
        f.write("=" * 72 + "\n\n")
        if not flags:
            f.write("No PII patterns detected in free-text fields.\n")
            return
        for i, flag in enumerate(flags, 1):
            f.write(f"Flag {i}:\n")
            f.write(f"  Row (CSV): {flag['row_number']}\n")
            f.write(f"  Column: {flag['column']}\n")
            f.write(f"  Type: {flag['pattern_type']}\n")
            f.write(f"  Match: {flag['match']}\n")
            text_preview = flag["text"][:200] + ("..." if len(flag["text"]) > 200 else "")
            f.write(f"  Full text: {text_preview}\n\n")


def deidentify_selected(
    selected_rows: list[list[str]], headers: list[str], output_dir: Path,
) -> bool:
    """Run the full 5-step NIST de-identification on selected rows.

    Returns True on success, False if PII verification fails.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    rows = rows_to_dicts(selected_rows, headers)

    # Step 1: PII scan and redaction
    print("\n--- De-identification Step 1: Free-text PII scan ---")
    available_text_cols = [c for c in FREE_TEXT_COLUMNS if c in headers]
    pii_flags = scan_pii(rows, available_text_cols)
    print(f"  Scanned columns: {available_text_cols}")
    print(f"  PII flags found: {len(pii_flags)}")

    pii_report_path = output_dir / "pii_review_report_CONFIDENTIAL.txt"
    write_pii_report(pii_report_path, pii_flags)
    print(f"  Report: {pii_report_path}")

    redaction_count = 0
    if pii_flags:
        redaction_count = redact_pii(rows, pii_flags)
        print(f"  Redactions applied: {redaction_count}")

    # Step 2: Extract Prolific linkage BEFORE ID replacement
    print("\n--- De-identification Step 2: Prolific linkage file ---")
    available_linkage = [c for c in PROLIFIC_LINKAGE_COLUMNS if c in headers]
    linkage_data = extract_linkage(rows, available_linkage)
    linkage_path = output_dir / "prolific_linkage_CONFIDENTIAL.csv"
    write_csv(linkage_path, available_linkage, linkage_data)
    print(f"  Saved: {linkage_path} ({len(linkage_data)} rows)")

    # Step 3: ResponseId replacement
    print("\n--- De-identification Step 3: ResponseId replacement ---")
    rows, id_mapping = replace_response_ids(rows)
    mapping_path = output_dir / "responseid_mapping_CONFIDENTIAL.csv"
    with open(mapping_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["original_response_id", "anonymous_id"])
        writer.writerows(id_mapping)
    print(f"  Saved: {mapping_path} ({len(id_mapping)} mappings)")

    # Step 4: Timestamp generalization
    print("\n--- De-identification Step 4: Timestamp generalization ---")
    available_ts = [c for c in TIMESTAMP_COLUMNS if c in headers]
    generalize_timestamps(rows, available_ts)
    print(f"  Generalized: {available_ts}")

    # Step 5: Column exclusion
    print("\n--- De-identification Step 5: Column exclusion ---")
    dropped = sorted(COLUMNS_TO_DROP & set(headers))
    kept_headers, filtered_rows = filter_columns(headers, rows, COLUMNS_TO_DROP)
    prolific_dropped = [h for h in headers if h.startswith(PROLIFIC_DEMO_PREFIX)]
    print(f"  Dropped: {len(dropped) + len(prolific_dropped)} columns")
    print(f"  Kept: {len(kept_headers)} columns")

    # Write public dataset
    public_path = output_dir / "TABS_V2_CRP_public_dataset.csv"
    write_csv(public_path, kept_headers, filtered_rows)
    output_hash = sha256_file(public_path)
    print(f"\n  Public dataset: {public_path}")
    print(f"  Output SHA-256: {output_hash}")
    print(f"  Rows: {len(filtered_rows)}, Columns: {len(kept_headers)}")

    # Verify: re-scan for PII
    print("\n--- Verification: re-scan output for PII ---")
    verify_cols = [c for c in available_text_cols if c in kept_headers]
    verify_flags = scan_pii(filtered_rows, verify_cols, row_offset=2)
    if verify_flags:
        print(f"  FAIL: {len(verify_flags)} PII pattern(s) still detected!")
        for flag in verify_flags:
            print(f"    Row {flag['row_number']}, {flag['column']}: {flag['pattern_type']}")
        public_path.unlink(missing_ok=True)
        print("  Public dataset REMOVED. Manual review required.")
        return False

    print("  PASS: No PII patterns detected in output.")

    # Audit log
    log_path = output_dir / "deidentification_log.txt"
    with open(log_path, "w", encoding="utf-8") as f:
        f.write("DE-IDENTIFICATION AUDIT LOG — CRP DATASET\n")
        f.write("=" * 72 + "\n\n")
        f.write(f"Timestamp: {datetime.utcnow().isoformat()}Z\n")
        f.write(f"Output SHA-256: {output_hash}\n")
        f.write(f"Rows: {len(filtered_rows)}\n")
        f.write(f"Columns dropped: {len(dropped) + len(prolific_dropped)}"
                f" ({', '.join(dropped + prolific_dropped)})\n")
        f.write(f"PII flags found: {len(pii_flags)}\n")
        f.write(f"Redactions applied: {redaction_count}\n")
    print(f"  Audit log: {log_path}")

    return True


# ───────────────────────────────────────────────────────────────
# Main
# ───────────────────────────────────────────────────────────────


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Build the final CRP public dataset (N=200) with "
                    "tiered quality-based selection and NIST de-identification.",
        epilog="Exit codes: 0=success, 1=PII in output, 2=input error",
    )
    parser.add_argument("input_csv", type=Path,
                        help="Path to enriched Qualtrics CSV (3 header rows)")
    parser.add_argument("--target-n", type=int, default=200,
                        help="Target sample size (default: 200)")
    parser.add_argument("--output-dir", type=Path, default=Path("./crp_dataset_output"),
                        help="Output directory (default: ./crp_dataset_output)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Show selection without writing de-identified files")
    args = parser.parse_args()

    if not args.input_csv.exists():
        print(f"Error: input file not found: {args.input_csv}", file=sys.stderr)
        return 2

    # ── Load data ──
    print("=" * 78)
    print("  CRP DATASET BUILDER")
    print(f"  Input:    {args.input_csv}")
    print(f"  Target N: {args.target_n}")
    print(f"  Output:   {args.output_dir}")
    print(f"  Dry run:  {args.dry_run}")
    print("=" * 78)

    print("\n--- Loading enriched Qualtrics CSV ---")
    headers, data = load_qualtrics_csv(str(args.input_csv))
    idx = make_idx(headers)
    print(f"  Loaded {len(data)} rows, {len(headers)} columns")

    # ── V2 filter and dedup ──
    print("\n--- V2 filtering and deduplication ---")
    v2 = filter_v2_and_dedup(data, idx)
    print(f"  V2 responses (deduplicated): {len(v2)}")

    # ── Build quality profiles ──
    print("\n--- Building quality profiles ---")
    profiles = [build_response_profile(row, idx) for row in v2]
    accepted = [p for p in profiles if p["prolific_status"] == "APPROVED"]
    print(f"  Prolific Accepted: {len(accepted)}")

    if len(accepted) < args.target_n:
        print(f"\n  WARNING: Only {len(accepted)} Prolific Accepted responses.")
        print(f"  Cannot reach target N={args.target_n}.")
        print(f"  Will select all {len(accepted)} available.")

    # ── Tiered selection ──
    print("\n--- Applying tiered selection ---")
    select_crp_sample(profiles, args.target_n)

    selected = [p for p in accepted if p["selected"]]
    print(f"  Selected: {len(selected)} / {len(accepted)}")

    # ── Generate manifest ──
    print("\n--- Generating selection manifest ---")
    manifest = generate_manifest(profiles, args.target_n)

    # Save manifest (confidential — contains ResponseIds and auth flags)
    args.output_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = args.output_dir / "selection_manifest_CONFIDENTIAL.txt"
    with open(manifest_path, "w", encoding="utf-8") as f:
        f.write(manifest)
    print(f"  Summary: selected {len(selected)} responses for target N={args.target_n}.")
    print(f"  Manifest saved: {manifest_path}")
    print("  (Full manifest withheld from stdout — contains confidential ResponseIds.)")

    if args.dry_run:
        print("\n[DRY RUN] Stopping before de-identification.")
        return 0

    # ── De-identify ──
    print("\n" + "=" * 78)
    print("  DE-IDENTIFICATION PIPELINE")
    print("=" * 78)

    selected_rows = [p["row"] for p in selected]
    success = deidentify_selected(selected_rows, headers, args.output_dir)

    print("\n" + "=" * 78)
    if success:
        print("  CRP DATASET COMPLETE")
        print(f"  Public dataset:  {args.output_dir / 'TABS_V2_CRP_public_dataset.csv'}")
        print(f"  Rows: {len(selected)}")
        print(f"\n  CONFIDENTIAL files (do NOT release):")
        print(f"    - {args.output_dir / 'responseid_mapping_CONFIDENTIAL.csv'}")
        print(f"    - {args.output_dir / 'prolific_linkage_CONFIDENTIAL.csv'}")
        print(f"    - {args.output_dir / 'pii_review_report_CONFIDENTIAL.txt'}")
        print(f"    - {args.output_dir / 'selection_manifest_CONFIDENTIAL.txt'}")
    else:
        print("  CRP DATASET FAILED — PII detected in output")
        print("  Review pii_review_report_CONFIDENTIAL.txt and re-run.")
    print("=" * 78)

    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
