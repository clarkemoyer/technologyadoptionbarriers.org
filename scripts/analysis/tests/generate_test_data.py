#!/usr/bin/env python3
"""
Generate a production-format synthetic Qualtrics + Prolific test CSV.

Creates N=500 realistic respondents with sufficient diversity in every
demographic and quality dimension to trigger all branches in:
  - tabs_v2_analysis.py (roles, org sizes, profit models, decision auth)
  - tabs_v2_advanced.py (budget moderation, revenue tiers, role-by-role, geo)
  - tabs_v2_psychometrics.py (V2 filter, IRI criterion, duration tiers)
  - tabs_v2_quality_audit.py (straightlining, outliers, Mahalanobis)
  - tabs_v2_data_audit.py (all 10 waterfall steps)
  - deidentify_tabs_data.py (PII patterns, Don't Know, free text)
  - enrich_qualtrics_csv.py (auth checks, demographics, statuses)

Usage:
    python generate_test_data.py [output_path]
"""

import csv
import random
import sys
from pathlib import Path

random.seed(42)

N = 500  # Total respondents

# ── Column definitions ───────────────────────────────────────

BARRIER_COLS = [f"Q10-28_Barriers_{i}" for i in range(1, 20)]
READINESS_COLS = [f"Q47-64_Readiness_{i}" for i in range(1, 19)]
MATURITY_COLS = [f"Q65-73_Maturity_{i}" for i in range(1, 10)]

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
    *BARRIER_COLS, *READINESS_COLS, *MATURITY_COLS,
    "Q74_Feedback",
    "PROLIFIC_PID", "STUDY_ID", "SESSION_ID", "COMPLETE_URL", "SOURCE",
    "Q_RecaptchaScore", "Q_StraightliningCount",
    "Auth_LLM", "Auth_Bots", "Prolific_Status",
]

# ── Scale values ─────────────────────────────────────────────

BARRIER_VALUES = ["Not a Barrier", "Minor Barrier", "Moderate Barrier", "Significant Barrier", "Major Barrier"]
READINESS_VALUES = ["Very Low Readiness/Capability", "Low Readiness/Capability", "Moderate Readiness/Capability", "High Readiness/Capability", "Very High Readiness/Capability"]
MATURITY_VALUES = ["Level 1: Initial/Ad Hoc", "Level 2: Developing/Repeatable", "Level 3: Defined/Standardized", "Level 4: Managed/Quantitatively Managed", "Level 5: Optimizing/Innovating"]

IRI_BARRIER = "Major Barrier"
IRI_READINESS = "Low Readiness/Capability"
IRI_MATURITY = "Level 2: Developing/Repeatable"

ROLES = [
    "CIO (e.g., Director of IT)",
    "CTO (e.g., Director of Technology/Innovation, Chief Scientist)",
    "CEO (e.g., Agency Director, Secretary, Administrator, City/County Manager)",
    "CFO (e.g., Director of Finance, Budget Director, Comptroller)",
    "COO (e.g., Deputy Director, Chief of Staff, Assistant Secretary for Administration)",
    "CHRO (e.g., Chief Human Capital Officer (CHCO), Director of Human Resources, Personnel Director)",
    "CMO (e.g., Director of Communications, Public Affairs Officer, Chief Marketing & Communications Officer)",
    "CSO (e.g., Director of Strategic Planning, Policy Director, Chief Strategy Officer)",
    "CRO (e.g., Director of Budget/Finance, Director of Development/Fundraising, Head of Revenue Operations)",
    "Other (please specify)",
]
DECISION_AUTH = [
    "I am the primary decision-maker for technology adoption in my organization",
    "I am one of several key decision-makers who collaboratively decide on technology adoption",
    "I provide significant input and recommendations, but the final decision is made by others",
]
INDUSTRIES = [
    "Technology", "Financial Services", "Healthcare", "Manufacturing",
    "Government/Public Sector", "Education", "Retail", "Energy/Utilities",
    "Transportation/Logistics", "Non-Profit/NGO",
]
ORG_SIZES = ["<100", "100-499", "500-999", "1000-4999", "5000-9999", "10000+"]
PROFIT_MODELS = ["For-Profit", "Non-Profit", "Government/Public Sector"]
REVENUES = [
    "Under $1M", "$1M-$5M", "$5M-$10M", "$10M-$25M", "$25M-$50M",
    "$50M-$100M", "$100M-$250M", "$250M-$500M", "$500M+",
]
BUDGETS = [
    "Under $100K", "$100K-$500K", "$500K-$1M", "$1M-$2M",
    "$2M-$5M", "$5M-$10M", "$10M-$25M", "$25M-$50M", "$50M+",
]
GEO_SCOPES = ["United States", "Global", "Europe", "Asia-Pacific", "Latin America"]
GEO_SCALES = ["Single country", "Multi-country"]

PII_FEEDBACK = [
    "Contact me at john@example.com for follow-up",
    "I work at Microsoft in Seattle",
    "Our IT budget is $5 million annually",
    "Call 555-123-4567 if you need more info",
    "See our report at https://company.internal/report",
    "We have 5000 employees and growing",
]
CLEAN_FEEDBACK = [
    "Great survey, very relevant to our organization",
    "Too long to complete", "Useful for strategic planning",
    "Well designed and comprehensive", "Need more questions about cloud adoption",
    "Very thorough assessment tool", "Clear instructions, easy to follow",
    "Would recommend to colleagues", "Interesting research topic",
    "Covers all the key areas", "Good mix of questions",
    "Relevant to our industry challenges", "", "", "",
]

# ── Disposition distribution ─────────────────────────────────
# Realistic distribution matching actual TABS data proportions

DISPOSITION_MIX = {
    "clean":           0.22,  # ~110 Pipeline CLEAN
    "smeal":           0.10,  # ~50  FLAG-SMEAL (480-539s, all IRIs)
    "single_iri":      0.18,  # ~90  FLAG-SINGLE-IRI
    "auto_exclude_2":  0.10,  # ~50  AUTO-EXCLUDE (2 IRI fails)
    "auto_exclude_3":  0.07,  # ~35  AUTO-EXCLUDE (3 IRI fails)
    "speed_clean":     0.02,  # ~10  FLAG-SPEED (<300s, all IRIs pass)
    "speed_iri":       0.04,  # ~20  AUTO-EXCLUDE (speed + 1 IRI)
    "recaptcha":       0.01,  # ~5   FLAG-RECAPTCHA
    "straightline_p":  0.05,  # ~25  FLAG-PARTIAL-STRAIGHTLINING
    "straightline_f":  0.01,  # ~5   FLAG-STRAIGHTLINING
    "incomplete":      0.12,  # ~60  INCOMPLETE
    "auth_fail":       0.04,  # ~20  FLAG-AUTH-FAIL (covers all 6 LOW combos)
    "auth_mixed":      0.04,  # ~20  FLAG-AUTH-MIXED (covers all 5 MIXED combos)
}


def weighted_choice(values, weights=None):
    return random.choices(values, weights=weights, k=1)[0]


def gen_likert(scale_values, bias="mid", count=18, straightline=False, dont_know_rate=0.0):
    """Generate Likert responses with configurable bias and patterns."""
    if straightline:
        val = random.choice(scale_values[1:4])  # avoid extremes for straightlining
        return [val] * count

    weights_map = {
        "low":    [4, 3, 2, 1, 0],
        "mid":    [1, 2, 4, 2, 1],
        "high":   [0, 1, 2, 3, 4],
        "varied": [1, 1, 1, 1, 1],
        "skew_h": [0, 0, 1, 3, 5],
        "skew_l": [5, 3, 1, 0, 0],
    }
    w = weights_map.get(bias, [1, 1, 1, 1, 1])
    result = random.choices(scale_values, weights=w, k=count)

    if dont_know_rate > 0:
        for i in range(count):
            if random.random() < dont_know_rate:
                result[i] = "Don't Know"
    return result


def build_respondent(idx, disposition_type):
    """Build a single respondent row."""

    # Demographics - ensure full coverage of all values
    role = ROLES[idx % len(ROLES)]
    role_other = "VP of Innovation" if "Other" in role else ""
    decision = DECISION_AUTH[idx % len(DECISION_AUTH)]
    industry = INDUSTRIES[idx % len(INDUSTRIES)]
    org_size = ORG_SIZES[idx % len(ORG_SIZES)]
    profit = PROFIT_MODELS[idx % len(PROFIT_MODELS)]
    revenue = REVENUES[idx % len(REVENUES)]
    budget = BUDGETS[idx % len(BUDGETS)]
    geo_scope = GEO_SCOPES[idx % len(GEO_SCOPES)]
    geo_scale = GEO_SCALES[idx % len(GEO_SCALES)]

    bias = random.choice(["low", "mid", "high", "varied", "skew_h", "skew_l"])
    dont_know = 0.0

    # Configure based on disposition type
    if disposition_type == "clean":
        duration = random.randint(540, 1800)
        iri = (True, True, True)
        recaptcha = round(random.uniform(0.6, 1.0), 2)
        straight_count = 0
        finished = True
        auth_llm, auth_bots = "HIGH", "HIGH"
        status = "APPROVED"
        straightline_barriers = False
    elif disposition_type == "smeal":
        duration = random.randint(480, 539)
        iri = (True, True, True)
        recaptcha = round(random.uniform(0.6, 1.0), 2)
        straight_count = 0
        finished = True
        auth_llm, auth_bots = "HIGH", "HIGH"
        status = random.choice(["APPROVED", "AWAITING REVIEW"])
        straightline_barriers = False
    elif disposition_type == "single_iri":
        duration = random.randint(540, 1500)
        fail_idx = random.randint(0, 2)
        iri = tuple(i != fail_idx for i in range(3))
        recaptcha = round(random.uniform(0.6, 1.0), 2)
        straight_count = 0
        finished = True
        auth_llm, auth_bots = "HIGH", "HIGH"
        status = random.choice(["APPROVED", "AWAITING REVIEW"])
        straightline_barriers = False
    elif disposition_type == "auto_exclude_2":
        duration = random.randint(480, 1200)
        fails = random.sample([0, 1, 2], 2)
        iri = tuple(i not in fails for i in range(3))
        recaptcha = round(random.uniform(0.5, 1.0), 2)
        straight_count = 0
        finished = True
        auth_llm, auth_bots = "HIGH", "HIGH"
        status = random.choice(["REJECTED", "AWAITING REVIEW", "RETURNED"])
        straightline_barriers = False
    elif disposition_type == "auto_exclude_3":
        duration = random.randint(300, 1200)
        iri = (False, False, False)
        recaptcha = round(random.uniform(0.3, 1.0), 2)
        straight_count = 0
        finished = True
        auth_llm, auth_bots = "HIGH", "HIGH"
        status = random.choice(["REJECTED", "RETURNED"])
        straightline_barriers = False
        bias = "varied"
    elif disposition_type == "speed_clean":
        duration = random.randint(120, 299)
        iri = (True, True, True)
        recaptcha = round(random.uniform(0.6, 1.0), 2)
        straight_count = 0
        finished = True
        auth_llm, auth_bots = "HIGH", "HIGH"
        status = "APPROVED"
        straightline_barriers = False
    elif disposition_type == "speed_iri":
        duration = random.randint(120, 299)
        fail_idx = random.randint(0, 2)
        iri = tuple(i != fail_idx for i in range(3))
        recaptcha = round(random.uniform(0.5, 1.0), 2)
        straight_count = 0
        finished = True
        auth_llm, auth_bots = "HIGH", "HIGH"
        status = "REJECTED"
        straightline_barriers = False
    elif disposition_type == "recaptcha":
        duration = random.randint(540, 1200)
        iri = (True, True, True)
        recaptcha = round(random.uniform(0.05, 0.49), 2)
        straight_count = 0
        finished = True
        auth_llm, auth_bots = "HIGH", "HIGH"
        status = "AWAITING REVIEW"
        straightline_barriers = False
    elif disposition_type == "straightline_p":
        duration = random.randint(540, 1200)
        iri = (True, True, True)
        recaptcha = round(random.uniform(0.6, 1.0), 2)
        straight_count = 0
        finished = True
        auth_llm, auth_bots = "HIGH", "HIGH"
        status = "AWAITING REVIEW"
        straightline_barriers = True
    elif disposition_type == "straightline_f":
        duration = random.randint(540, 1200)
        iri = (True, True, True)
        recaptcha = round(random.uniform(0.6, 1.0), 2)
        straight_count = random.randint(1, 3)
        finished = True
        auth_llm, auth_bots = "HIGH", "HIGH"
        status = "AWAITING REVIEW"
        straightline_barriers = True
    elif disposition_type == "incomplete":
        duration = random.randint(30, 300)
        iri = (False, False, False)
        recaptcha = round(random.uniform(0.3, 1.0), 2)
        straight_count = 0
        finished = False
        auth_llm, auth_bots = "", ""
        status = random.choice(["RETURNED", "TIMED-OUT"])
        straightline_barriers = False
    elif disposition_type == "auth_fail":
        duration = random.randint(540, 1200)
        iri = (True, True, True)
        recaptcha = round(random.uniform(0.6, 1.0), 2)
        straight_count = 0
        finished = True
        # Cycle through all LOW combinations to ensure full auth coverage
        auth_low_combos = [
            ("LOW", "HIGH"), ("HIGH", "LOW"), ("LOW", "LOW"),
            ("LOW", "MIXED"), ("LOW", ""), ("", "LOW"),
        ]
        auth_llm, auth_bots = auth_low_combos[idx % len(auth_low_combos)]
        status = "AWAITING REVIEW"
        straightline_barriers = False
    elif disposition_type == "auth_mixed":
        duration = random.randint(540, 1200)
        iri = (True, True, True)
        recaptcha = round(random.uniform(0.6, 1.0), 2)
        straight_count = 0
        finished = True
        # Cycle through all MIXED combinations (no LOW present)
        auth_mixed_combos = [
            ("MIXED", "HIGH"), ("HIGH", "MIXED"), ("MIXED", "MIXED"),
            ("MIXED", ""), ("", "MIXED"),
        ]
        auth_llm, auth_bots = auth_mixed_combos[idx % len(auth_mixed_combos)]
        status = "AWAITING REVIEW"
        straightline_barriers = False
    else:
        raise ValueError(f"Unknown disposition type: {disposition_type}")

    # Add some Don't Know responses (~5% of respondents)
    if random.random() < 0.05:
        dont_know = 0.15

    # Generate responses
    barriers = gen_likert(BARRIER_VALUES, bias, 18, straightline=straightline_barriers)
    barrier_iri = IRI_BARRIER if iri[0] else random.choice(BARRIER_VALUES[:4])
    readiness = gen_likert(READINESS_VALUES, bias, 17, dont_know_rate=dont_know)
    readiness_iri = IRI_READINESS if iri[1] else random.choice(READINESS_VALUES[2:])
    maturity = gen_likert(MATURITY_VALUES, bias, 8, dont_know_rate=dont_know)
    maturity_iri = IRI_MATURITY if iri[2] else random.choice(MATURITY_VALUES[2:])

    # Edge cases: reCAPTCHA boundary and empty values
    if idx == 0:
        recaptcha = 0.5  # exact boundary
    elif idx == 1:
        recaptcha_str_override = ""  # empty string → default to 1.0

    # Edge case: Finished as "1" instead of "TRUE" (numeric export mode)
    if idx == 2 and finished:
        finished_override = "1"
    elif idx == 3 and not finished:
        finished_override = "0"

    # Feedback - mix of clean and PII-containing
    if random.random() < 0.05:
        feedback = random.choice(PII_FEEDBACK)
    else:
        feedback = random.choice(CLEAN_FEEDBACK)

    day = 24 + (idx % 8)
    hour = 8 + (idx % 14)
    minute = (idx * 7) % 60
    start = f"2026-03-{day:02d} {hour:02d}:{minute:02d}:00"
    end = f"2026-03-{day:02d} {hour + duration // 3600:02d}:{(minute + duration // 60) % 60:02d}:00"

    pid = f"P_{idx:04d}"

    # Apply edge case overrides
    finished_str = locals().get("finished_override", "TRUE" if finished else "FALSE")
    recaptcha_val = locals().get("recaptcha_str_override", str(recaptcha))

    return [
        f"R_{idx + 1:04d}", start, end, end,
        "IP Address",
        finished_str,
        str(duration),
        f"192.168.{idx // 256}.{idx % 256}", "", "", "", "",
        f"40.{random.uniform(0, 9):.4f}", f"-75.{random.uniform(0, 9):.4f}",
        role, role_other, decision, industry, "",
        org_size, profit, revenue, budget, geo_scope, geo_scale,
        *barriers, barrier_iri,
        *readiness, readiness_iri,
        *maturity, maturity_iri,
        feedback, pid,
        "69c17630acada6abeead2da5", f"sess_{idx:04d}",
        f"https://app.prolific.com/submissions/complete?cc=TABS{idx}",
        "prolific",
        recaptcha_val, str(straight_count),
        auth_llm, auth_bots, status,
    ]


def main():
    output = sys.argv[1] if len(sys.argv) > 1 else str(Path(__file__).parent / "test_data_production_format.csv")

    # Build disposition type list based on mix proportions
    types = []
    for dtype, proportion in DISPOSITION_MIX.items():
        count = max(1, round(N * proportion))
        types.extend([dtype] * count)
    # Pad or trim to exactly N
    while len(types) < N:
        types.append("clean")
    types = types[:N]
    random.shuffle(types)

    with open(output, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(HEADERS)
        writer.writerow([""] * len(HEADERS))  # Sub-header
        writer.writerow([""] * len(HEADERS))  # Import IDs
        for i, dtype in enumerate(types):
            writer.writerow(build_respondent(i, dtype))

    # Count dispositions
    counts = {}
    for t in types:
        counts[t] = counts.get(t, 0) + 1

    print(f"Generated {N} synthetic respondents → {output}")
    print(f"  Columns: {len(HEADERS)}")
    for k, v in sorted(counts.items(), key=lambda x: -x[1]):
        print(f"  {k:<20s}: {v:>4d} ({v/N*100:.1f}%)")


if __name__ == "__main__":
    main()
