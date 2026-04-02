#!/usr/bin/env python3
"""
Generate a production-format synthetic Qualtrics + Prolific test CSV.

This script creates a realistic test dataset with ALL columns used by every
analysis script in the pipeline:
  - tabs_v2_analysis.py
  - tabs_v2_advanced.py
  - tabs_v2_psychometrics.py
  - tabs_v2_quality_audit.py
  - tabs_v2_data_audit.py
  - deidentify_tabs_data.py
  - enrich_qualtrics_csv.py

The CSV follows the Qualtrics 3-row header format:
  Row 0: Column names
  Row 1: Question text (sub-labels)
  Row 2: ImportId JSON
  Row 3+: Data rows

Includes 25 synthetic respondents with varied:
  - Dispositions (CLEAN, FLAG-*, AUTO-EXCLUDE, INCOMPLETE)
  - Demographics (roles, industries, org sizes, profit models)
  - IRI pass/fail patterns
  - Duration ranges (speed, smeal, clean)
  - reCAPTCHA scores
  - Straightlining patterns
  - Don't Know responses (readiness, maturity)
  - Free-text feedback (some with PII for deidentification testing)
  - Auth check enrichment columns
  - Prolific status enrichment

Usage:
    python generate_test_data.py [output_path]
    # Default: writes to test_data_production_format.csv in same directory
"""

import csv
import random
import sys
from pathlib import Path

random.seed(42)  # Deterministic output

# ── Column definitions ───────────────────────────────────────

BARRIER_COLS = [f"Q10-28_Barriers_{i}" for i in range(1, 20)]  # 18 items + IRI
READINESS_COLS = [f"Q47-64_Readiness_{i}" for i in range(1, 19)]  # 17 items + IRI
MATURITY_COLS = [f"Q65-73_Maturity_{i}" for i in range(1, 10)]  # 8 items + IRI

HEADERS = [
    "ResponseId", "StartDate", "EndDate", "RecordedDate",
    "Status", "Finished", "Duration (in seconds)",
    "IPAddress", "RecipientLastName", "RecipientFirstName", "RecipientEmail",
    "ExternalReference", "LocationLatitude", "LocationLongitude",
    "Q1_Role", "Q1_Role_11_TEXT",
    "Q2_DecisionAuth",
    "Q3_Industry", "Q3_Industry_26_TEXT",
    "Q4_OrgSize", "Q5_ProfitModel",
    "Q6_RevenueBudget", "Q7_PersonalBudget",
    "Q8_GeoScope", "Q9_GeoScale",
    *BARRIER_COLS,
    *READINESS_COLS,
    *MATURITY_COLS,
    "Q74_Feedback",
    "PROLIFIC_PID", "STUDY_ID", "SESSION_ID", "COMPLETE_URL", "SOURCE",
    "Q_RecaptchaScore", "Q_StraightliningCount",
    # Enrichment columns (added by enrich_qualtrics_csv.py)
    "Auth_LLM", "Auth_Bots", "Prolific_Status",
]

# Sub-header row (question text)
SUB_HEADERS = ["" for _ in HEADERS]

# Import ID row
IMPORT_IDS = ["" for _ in HEADERS]

# ── Scale values ─────────────────────────────────────────────

BARRIER_VALUES = ["Not a Barrier", "Minor Barrier", "Moderate Barrier", "Significant Barrier", "Major Barrier"]
READINESS_VALUES = ["Very Low Readiness/Capability", "Low Readiness/Capability", "Moderate Readiness/Capability", "High Readiness/Capability", "Very High Readiness/Capability"]
MATURITY_VALUES = ["Level 1: Initial/Ad Hoc", "Level 2: Developing/Repeatable", "Level 3: Defined/Standardized", "Level 4: Managed/Quantitatively Managed", "Level 5: Optimizing/Innovating"]

ROLES = [
    "CIO (e.g., Director of IT)",
    "CTO (e.g., Director of Technology/Innovation, Chief Scientist)",
    "CEO (e.g., Agency Director, Secretary, Administrator, City/County Manager)",
    "CFO (e.g., Director of Finance, Budget Director, Comptroller)",
    "COO (e.g., Deputy Director, Chief of Staff, Assistant Secretary for Administration)",
]
DECISION_AUTH = [
    "I am the primary decision-maker for technology adoption in my organization",
    "I am one of several key decision-makers who collaboratively decide on technology adoption",
    "I provide significant input and recommendations, but the final decision is made by others",
]
INDUSTRIES = ["Technology", "Financial Services", "Healthcare", "Manufacturing", "Government/Public Sector", "Education", "Retail"]
ORG_SIZES = ["<100", "100-499", "500-999", "1000-4999", "5000-9999", "10000+"]
PROFIT_MODELS = ["For-Profit", "Non-Profit", "Government/Public Sector"]
REVENUES = ["Under $1M", "$1M-$5M", "$5M-$10M", "$10M-$25M", "$50M-$100M", "$100M-$250M", "$250M-$500M", "$500M+"]
BUDGETS = ["Under $100K", "$100K-$500K", "$500K-$1M", "$1M-$2M", "$2M-$5M", "$5M-$10M", "$10M-$25M"]
GEO_SCOPES = ["United States", "Global", "Europe", "Asia-Pacific"]
GEO_SCALES = ["Single country", "Multi-country"]

IRI_BARRIER_CORRECT = "Major Barrier"
IRI_READINESS_CORRECT = "Low Readiness/Capability"
IRI_MATURITY_CORRECT = "Level 2: Developing/Repeatable"

# ── Respondent profiles ──────────────────────────────────────

PROFILES = [
    # CLEAN respondents (pipeline clean: duration >= 540, all IRIs, good reCAPTCHA, varied responses)
    dict(pid="P_CLEAN_01", dur=620, iri=(True, True, True), recaptcha=0.9, straight=0, finished=True, auth_llm="HIGH", auth_bots="HIGH", status="APPROVED", bias="varied"),
    dict(pid="P_CLEAN_02", dur=750, iri=(True, True, True), recaptcha=0.8, straight=0, finished=True, auth_llm="HIGH", auth_bots="HIGH", status="APPROVED", bias="high"),
    dict(pid="P_CLEAN_03", dur=890, iri=(True, True, True), recaptcha=0.95, straight=0, finished=True, auth_llm="", auth_bots="", status="APPROVED", bias="low"),
    dict(pid="P_CLEAN_04", dur=680, iri=(True, True, True), recaptcha=0.7, straight=0, finished=True, auth_llm="HIGH", auth_bots="HIGH", status="APPROVED", bias="varied"),
    dict(pid="P_CLEAN_05", dur=1100, iri=(True, True, True), recaptcha=0.85, straight=0, finished=True, auth_llm="HIGH", auth_bots="HIGH", status="APPROVED", bias="mid"),
    dict(pid="P_CLEAN_06", dur=700, iri=(True, True, True), recaptcha=0.9, straight=0, finished=True, auth_llm="HIGH", auth_bots="HIGH", status="APPROVED", bias="varied"),
    dict(pid="P_CLEAN_07", dur=560, iri=(True, True, True), recaptcha=0.75, straight=0, finished=True, auth_llm="HIGH", auth_bots="HIGH", status="APPROVED", bias="varied"),
    dict(pid="P_CLEAN_08", dur=950, iri=(True, True, True), recaptcha=0.88, straight=0, finished=True, auth_llm="HIGH", auth_bots="HIGH", status="APPROVED", bias="mid"),
    # Conservative clean but NOT pipeline clean (duration 480-539)
    dict(pid="P_SMEAL_01", dur=500, iri=(True, True, True), recaptcha=0.9, straight=0, finished=True, auth_llm="HIGH", auth_bots="HIGH", status="APPROVED", bias="varied"),
    dict(pid="P_SMEAL_02", dur=510, iri=(True, True, True), recaptcha=0.8, straight=0, finished=True, auth_llm="HIGH", auth_bots="HIGH", status="APPROVED", bias="mid"),
    # FLAG-SINGLE-IRI (1 IRI fail, normal speed)
    dict(pid="P_IRI1_01", dur=650, iri=(True, False, True), recaptcha=0.9, straight=0, finished=True, auth_llm="HIGH", auth_bots="HIGH", status="APPROVED", bias="varied"),
    dict(pid="P_IRI1_02", dur=800, iri=(True, True, False), recaptcha=0.85, straight=0, finished=True, auth_llm="HIGH", auth_bots="HIGH", status="AWAITING REVIEW", bias="high"),
    # AUTO-EXCLUDE (2+ IRI fails)
    dict(pid="P_EXCL_01", dur=600, iri=(False, False, True), recaptcha=0.9, straight=0, finished=True, auth_llm="HIGH", auth_bots="HIGH", status="REJECTED", bias="extreme"),
    dict(pid="P_EXCL_02", dur=700, iri=(False, False, False), recaptcha=0.8, straight=0, finished=True, auth_llm="HIGH", auth_bots="HIGH", status="REJECTED", bias="extreme"),
    # FLAG-SPEED (< 300s, all IRIs pass)
    dict(pid="P_SPEED_01", dur=200, iri=(True, True, True), recaptcha=0.9, straight=0, finished=True, auth_llm="HIGH", auth_bots="HIGH", status="APPROVED", bias="varied"),
    # AUTO-EXCLUDE: speed + 1 IRI fail
    dict(pid="P_SPIRI_01", dur=250, iri=(True, False, True), recaptcha=0.9, straight=0, finished=True, auth_llm="HIGH", auth_bots="HIGH", status="REJECTED", bias="varied"),
    # FLAG-RECAPTCHA
    dict(pid="P_RECAP_01", dur=700, iri=(True, True, True), recaptcha=0.3, straight=0, finished=True, auth_llm="HIGH", auth_bots="HIGH", status="AWAITING REVIEW", bias="varied"),
    # FLAG-PARTIAL-STRAIGHTLINING (all same responses in barriers)
    dict(pid="P_STRAL_01", dur=600, iri=(True, True, True), recaptcha=0.9, straight=0, finished=True, auth_llm="HIGH", auth_bots="HIGH", status="AWAITING REVIEW", bias="straightline"),
    # Full straightlining (Q_StraightliningCount > 0)
    dict(pid="P_FSTRL_01", dur=600, iri=(True, True, True), recaptcha=0.9, straight=2, finished=True, auth_llm="HIGH", auth_bots="HIGH", status="AWAITING REVIEW", bias="straightline"),
    # INCOMPLETE
    dict(pid="P_INCOM_01", dur=120, iri=(False, False, False), recaptcha=0.9, straight=0, finished=False, auth_llm="", auth_bots="", status="RETURNED", bias="varied"),
    dict(pid="P_INCOM_02", dur=60, iri=(False, False, False), recaptcha=0.5, straight=0, finished=False, auth_llm="", auth_bots="", status="TIMED-OUT", bias="varied"),
    # AUTH failures
    dict(pid="P_AUTH_01", dur=700, iri=(True, True, True), recaptcha=0.9, straight=0, finished=True, auth_llm="LOW", auth_bots="HIGH", status="AWAITING REVIEW", bias="varied"),
    dict(pid="P_AUTH_02", dur=650, iri=(True, True, True), recaptcha=0.85, straight=0, finished=True, auth_llm="HIGH", auth_bots="MIXED", status="AWAITING REVIEW", bias="varied"),
    # Don't Know responses
    dict(pid="P_DONTK_01", dur=800, iri=(True, True, True), recaptcha=0.9, straight=0, finished=True, auth_llm="HIGH", auth_bots="HIGH", status="APPROVED", bias="dontknow"),
    # PII in feedback (for deidentification testing)
    dict(pid="P_PII_01", dur=900, iri=(True, True, True), recaptcha=0.9, straight=0, finished=True, auth_llm="HIGH", auth_bots="HIGH", status="APPROVED", bias="varied"),
]


def gen_responses(bias: str, is_barrier: bool = True) -> list[str]:
    """Generate Likert-scale responses based on a bias profile."""
    if is_barrier:
        vals = BARRIER_VALUES
    else:
        vals = None  # handled separately

    if bias == "straightline":
        if is_barrier:
            return ["Moderate Barrier"] * 18
        return []  # readiness/maturity handled separately

    if bias == "extreme":
        if is_barrier:
            return [random.choice(["Major Barrier", "Not a Barrier"]) for _ in range(18)]
        return []

    weights = {
        "varied": [1, 2, 3, 2, 1],
        "high": [0, 1, 2, 3, 4],
        "low": [4, 3, 2, 1, 0],
        "mid": [1, 2, 4, 2, 1],
        "dontknow": [1, 2, 3, 2, 1],
    }
    w = weights.get(bias, [1, 1, 1, 1, 1])
    if is_barrier:
        return random.choices(vals, weights=w, k=18)
    return []


def gen_readiness(bias: str, count: int = 17) -> list[str]:
    vals = READINESS_VALUES
    if bias == "straightline":
        return ["Moderate Readiness/Capability"] * count
    if bias == "extreme":
        return [random.choice(vals) for _ in range(count)]
    if bias == "dontknow":
        result = random.choices(vals, weights=[1, 2, 3, 2, 1], k=count)
        # Replace ~20% with Don't Know
        for i in random.sample(range(count), min(3, count)):
            result[i] = "Don't Know"
        return result
    weights = {
        "varied": [1, 2, 3, 2, 1],
        "high": [0, 1, 2, 3, 4],
        "low": [4, 3, 2, 1, 0],
        "mid": [1, 2, 4, 2, 1],
    }
    w = weights.get(bias, [1, 1, 1, 1, 1])
    return random.choices(vals, weights=w, k=count)


def gen_maturity(bias: str, count: int = 8) -> list[str]:
    vals = MATURITY_VALUES
    if bias == "straightline":
        return ["Level 3: Defined/Standardized"] * count
    if bias == "extreme":
        return [random.choice(vals) for _ in range(count)]
    if bias == "dontknow":
        result = random.choices(vals, weights=[1, 2, 3, 2, 1], k=count)
        for i in random.sample(range(count), min(2, count)):
            result[i] = "Don't Know"
        return result
    weights = {
        "varied": [1, 2, 3, 2, 1],
        "high": [0, 1, 2, 3, 4],
        "low": [4, 3, 2, 1, 0],
        "mid": [1, 2, 4, 2, 1],
    }
    w = weights.get(bias, [1, 1, 1, 1, 1])
    return random.choices(vals, weights=w, k=count)


FEEDBACK_TEXTS = [
    "Great survey, very relevant to our organization",
    "Too long to complete",
    "Useful for strategic planning",
    "Contact me at john@example.com for follow-up",  # PII: email
    "I work at Microsoft in Seattle",  # PII: employer
    "Our IT budget is $5 million annually",  # PII: dollar amount
    "Well designed and comprehensive",
    "Need more questions about cloud adoption",
    "",
    "Very thorough assessment tool",
    "Call 555-123-4567 if you need more info",  # PII: phone
    "See our report at https://company.internal/report",  # PII: URL
    "Clear instructions, easy to follow",
    "Would recommend to colleagues",
    "",
]


def build_row(profile: dict, idx: int) -> list[str]:
    """Build a complete CSV row from a respondent profile."""
    p = profile
    base_date = f"2026-03-{24 + (idx % 10):02d}"
    start = f"{base_date} {10 + (idx % 12):02d}:{idx * 3 % 60:02d}:00"
    end_sec = p["dur"]
    end_min = end_sec // 60
    end = f"{base_date} {10 + (idx % 12) + end_min // 60:02d}:{(idx * 3 % 60 + end_min) % 60:02d}:00"

    barriers = gen_responses(p["bias"], is_barrier=True)
    barrier_iri = IRI_BARRIER_CORRECT if p["iri"][0] else random.choice(BARRIER_VALUES[:4])
    readiness = gen_readiness(p["bias"])
    readiness_iri = IRI_READINESS_CORRECT if p["iri"][1] else random.choice(READINESS_VALUES[2:])
    maturity = gen_maturity(p["bias"])
    maturity_iri = IRI_MATURITY_CORRECT if p["iri"][2] else random.choice(MATURITY_VALUES[2:])

    role = ROLES[idx % len(ROLES)]
    role_other = "VP of Innovation" if "Other" in role else ""

    return [
        f"R_{idx + 1:03d}",  # ResponseId
        start,  # StartDate
        end,  # EndDate
        end,  # RecordedDate
        "IP Address",  # Status
        "TRUE" if p["finished"] else "FALSE",  # Finished
        str(p["dur"]),  # Duration (in seconds)
        f"192.168.1.{idx + 1}",  # IPAddress
        "", "",  # RecipientLastName, RecipientFirstName
        "",  # RecipientEmail
        "",  # ExternalReference
        f"40.{idx:.4f}",  # LocationLatitude
        f"-75.{idx:.4f}",  # LocationLongitude
        role,  # Q1_Role
        role_other,  # Q1_Role_11_TEXT
        DECISION_AUTH[idx % len(DECISION_AUTH)],  # Q2_DecisionAuth
        INDUSTRIES[idx % len(INDUSTRIES)],  # Q3_Industry
        "",  # Q3_Industry_26_TEXT
        ORG_SIZES[idx % len(ORG_SIZES)],  # Q4_OrgSize
        PROFIT_MODELS[idx % len(PROFIT_MODELS)],  # Q5_ProfitModel
        REVENUES[idx % len(REVENUES)],  # Q6_RevenueBudget
        BUDGETS[idx % len(BUDGETS)],  # Q7_PersonalBudget
        GEO_SCOPES[idx % len(GEO_SCOPES)],  # Q8_GeoScope
        GEO_SCALES[idx % len(GEO_SCALES)],  # Q9_GeoScale
        *barriers, barrier_iri,  # Q10-28_Barriers_1 through _19
        *readiness, readiness_iri,  # Q47-64_Readiness_1 through _18
        *maturity, maturity_iri,  # Q65-73_Maturity_1 through _9
        FEEDBACK_TEXTS[idx % len(FEEDBACK_TEXTS)],  # Q74_Feedback
        p["pid"],  # PROLIFIC_PID
        "69c17630acada6abeead2da5",  # STUDY_ID
        f"sess_{idx + 1:03d}",  # SESSION_ID
        f"https://app.prolific.com/submissions/complete?cc=TABS{idx}",  # COMPLETE_URL
        "prolific",  # SOURCE
        str(p["recaptcha"]),  # Q_RecaptchaScore
        str(p["straight"]),  # Q_StraightliningCount
        p["auth_llm"],  # Auth_LLM
        p["auth_bots"],  # Auth_Bots
        p["status"],  # Prolific_Status
    ]


def main():
    output = sys.argv[1] if len(sys.argv) > 1 else str(Path(__file__).parent / "test_data_production_format.csv")

    with open(output, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(HEADERS)
        writer.writerow(SUB_HEADERS)
        writer.writerow(IMPORT_IDS)
        for i, profile in enumerate(PROFILES):
            writer.writerow(build_row(profile, i))

    print(f"Generated {len(PROFILES)} synthetic respondents → {output}")
    print(f"  Columns: {len(HEADERS)}")
    print(f"  CLEAN: {sum(1 for p in PROFILES if p['bias'] not in ('straightline', 'extreme') and all(p['iri']) and p['dur'] >= 540 and p['recaptcha'] >= 0.5 and p['straight'] == 0 and p['finished'] and p['auth_llm'] != 'LOW' and p['auth_bots'] not in ('LOW', 'MIXED'))}")


if __name__ == "__main__":
    main()
