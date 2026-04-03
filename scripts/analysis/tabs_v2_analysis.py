#!/usr/bin/env python3
"""
TABS V2 Descriptive Statistics and Sensitivity Analysis
========================================================

Produces all descriptive statistics, cross-tabulations, effect sizes,
correlations, reliability coefficients, and sensitivity analysis across
three sample cuts for the Technology Adoption Barriers Survey V2.

Usage:
    python tabs_v2_analysis.py <qualtrics_csv_path>

The CSV must be a standard Qualtrics export with 3 header rows.
V2 filter: StartDate >= '2026-03-23 14:00:00' OR ResponseId == 'R_1QK12IJpHjC3wd6' (Prolific live test)

Author: Clarke Moyer, Penn State Smeal DBA
"""

import csv
import math
import sys
from collections import Counter

# ─────────────────────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────────────────────

V2_START = "2026-03-23 14:00:00"
# Prolific live test of V2 instrument (2026-03-23 09:07 AM, COO, 876s) — valid V2 response
PROLIFIC_TEST_ID = 'R_1QK12IJpHjC3wd6'

# Duration thresholds for sample definitions
MIN_DURATION_PIPELINE_CLEAN = 540  # 9 minutes (Smeal eDBA benchmark, pipeline waterfall)
MIN_DURATION_CLEAN = 480       # 8 minutes (conservative analysis filter)
MIN_DURATION_RELAXED = 480
MIN_DURATION_ALL = 120         # 2 minutes (extreme speeders only)
IRI_THRESHOLD_RELAXED = 2      # at least 2 of 3 IRIs correct

# reCAPTCHA and straightlining thresholds (matching disposition.ts pipeline)
RECAPTCHA_THRESHOLD = 0.5
PARTIAL_STRAIGHTLINING_SD_THRESHOLD = 0.5

# Scale maps — verified against actual Qualtrics CSV response values
BARRIER_SCALE = {
    "Not a Barrier": 1, "Minor Barrier": 2, "Moderate Barrier": 3,
    "Significant Barrier": 4, "Major Barrier": 5
}
READINESS_SCALE = {
    "Very Low Readiness/Capability": 1, "Low Readiness/Capability": 2,
    "Moderate Readiness/Capability": 3, "High Readiness/Capability": 4,
    "Very High Readiness/Capability": 5
}
MATURITY_SCALE = {
    "Level 1: Initial/Ad Hoc": 1, "Level 2: Developing/Repeatable": 2,
    "Level 3: Defined/Standardized": 3, "Level 4: Managed/Quantitatively Managed": 4,
    "Level 5: Optimizing/Innovating": 5
}

# Column definitions — from Qualtrics export
BARRIER_COLS = [f"Q10-28_Barriers_{i}" for i in range(1, 19)]
BARRIER_IRI = "Q10-28_Barriers_19"
READINESS_COLS = [f"Q47-64_Readiness_{i}" for i in range(1, 18)]
READINESS_IRI = "Q47-64_Readiness_18"
MATURITY_COLS = [f"Q65-73_Maturity_{i}" for i in range(1, 9)]
MATURITY_IRI = "Q65-73_Maturity_9"

# IRI expected answers
IRI_BARRIER_ANSWER = "Major Barrier"
IRI_READINESS_ANSWER = "Low Readiness/Capability"
IRI_MATURITY_ANSWER = "Level 2: Developing/Repeatable"

# Item names — verified against CSV subheader row
BARRIER_NAMES = [
    "Resistance to Change", "Lack of Leadership Support", "Risk-Averse Culture",
    "Insufficient Workforce Skills", "Inadequate Training", "High Implementation Cost",
    "Legacy System Integration", "Inadequate IT Infrastructure", "Difficulty Demonstrating Value",
    "No Clear Strategy/Roadmap", "Insufficient Governance", "Workflow Disruption",
    "Cybersecurity Concerns", "Data Privacy Compliance", "Lack of Trust in Tech/Vendors",
    "Regulatory Complexity", "External Pressure Without Readiness", "Vendor/Partner Difficulty"
]
READINESS_NAMES = [
    "Vision/Leadership", "Tech-Strategy Alignment", "IT Governance Effectiveness",
    "Culture Openness", "Innovation Support", "Technical Workforce",
    "Training Programs", "Change Management", "IT Infrastructure",
    "System Interoperability", "Technical Support", "Data Governance",
    "Data Quality", "Data Analytics", "Business Process Maturity",
    "Performance Monitoring", "Budget Adequacy"
]
MATURITY_NAMES = [
    "IT Investment & Value Mgmt", "IT-Enabled Innovation",
    "Process Mgmt & Standardization", "Data Governance & Analytics",
    "Tech Risk & Resilience", "Strategic IT Planning",
    "Workforce Capability", "Change Leadership"
]

ROLE_MAP = {
    'CIO (e.g., Director of IT)': 'CIO',
    'CTO (e.g., Director of Technology/Innovation, Chief Scientist)': 'CTO',
    'CEO (e.g., Agency Director, Secretary, Administrator, City/County Manager)': 'CEO',
    'CFO (e.g., Director of Finance, Budget Director, Comptroller)': 'CFO',
    'COO (e.g., Deputy Director, Chief of Staff, Assistant Secretary for Administration)': 'COO',
    'CHRO (e.g., Chief Human Capital Officer (CHCO), Director of Human Resources, Personnel Director)': 'CHRO',
    'CMO (e.g., Director of Communications, Public Affairs Officer, Chief Marketing & Communications Officer)': 'CMO',
    'CSO (e.g., Director of Strategic Planning, Policy Director, Chief Strategy Officer)': 'CSO',
    'CRO (e.g., Director of Budget/Finance, Director of Development/Fundraising, Head of Revenue Operations)': 'CRO',
    'Other (please specify)': 'Other'
}
TECH_TITLES = {'CIO', 'CTO'}
NONTECH_TITLES = {'CEO', 'CFO', 'COO', 'CHRO', 'CMO', 'CSO', 'CRO'}


# ─────────────────────────────────────────────────────────────
# Statistical functions
# ─────────────────────────────────────────────────────────────

def mean_sd(values):
    """Compute mean and sample standard deviation."""
    values = [v for v in values if v is not None]
    n = len(values)
    if n == 0:
        return (None, None)
    m = sum(values) / n
    if n == 1:
        return (m, 0.0)
    var = sum((x - m) ** 2 for x in values) / (n - 1)
    return (m, math.sqrt(var))


def pearson_r(x, y):
    """Compute Pearson correlation coefficient between two lists."""
    pairs = [(a, b) for a, b in zip(x, y) if a is not None and b is not None]
    n = len(pairs)
    if n < 3:
        return None
    mx = sum(a for a, b in pairs) / n
    my = sum(b for a, b in pairs) / n
    sx = math.sqrt(sum((a - mx) ** 2 for a, b in pairs) / (n - 1))
    sy = math.sqrt(sum((b - my) ** 2 for a, b in pairs) / (n - 1))
    if sx == 0 or sy == 0:
        return None
    return sum((a - mx) * (b - my) for a, b in pairs) / ((n - 1) * sx * sy)


def cohens_d(g1, g2):
    """Compute Cohen's d effect size between two groups."""
    m1, s1 = mean_sd(g1)
    m2, s2 = mean_sd(g2)
    if m1 is None or m2 is None:
        return None
    n1, n2 = len(g1), len(g2)
    if n1 < 2 or n2 < 2:
        return None
    pooled = math.sqrt(((n1 - 1) * s1 ** 2 + (n2 - 1) * s2 ** 2) / (n1 + n2 - 2))
    if pooled == 0:
        return None
    return (m1 - m2) / pooled


def cronbach_alpha(rows, cols, scale, idx):
    """Compute Cronbach's alpha for a set of items."""
    k = len(cols)
    scored = []
    for r in rows:
        vals = [score(r, c, scale, idx) for c in cols]
        if all(v is not None for v in vals):
            scored.append(vals)
    n = len(scored)
    if n < 3:
        return None
    item_vars = []
    for j in range(k):
        iv = [scored[i][j] for i in range(n)]
        m = sum(iv) / n
        var = sum((x - m) ** 2 for x in iv) / (n - 1)
        item_vars.append(var)
    totals = [sum(row) for row in scored]
    tm = sum(totals) / n
    tv = sum((t - tm) ** 2 for t in totals) / (n - 1)
    if tv == 0:
        return None
    return (k / (k - 1)) * (1 - sum(item_vars) / tv)


def skewness(vals):
    """Compute sample skewness."""
    n = len(vals)
    if n < 3:
        return None
    m = sum(vals) / n
    s = math.sqrt(sum((x - m) ** 2 for x in vals) / (n - 1))
    if s == 0:
        return 0
    return (n / ((n - 1) * (n - 2))) * sum(((x - m) / s) ** 3 for x in vals)


def kurtosis_excess(vals):
    """Compute excess kurtosis."""
    n = len(vals)
    if n < 4:
        return None
    m = sum(vals) / n
    s = math.sqrt(sum((x - m) ** 2 for x in vals) / (n - 1))
    if s == 0:
        return 0
    k4 = (n * (n + 1) / ((n - 1) * (n - 2) * (n - 3))) * sum(((x - m) / s) ** 4 for x in vals)
    return k4 - 3 * (n - 1) ** 2 / ((n - 2) * (n - 3))


# ─────────────────────────────────────────────────────────────
# Data helpers
# ─────────────────────────────────────────────────────────────

def score(row, col, scale, idx):
    """Score a single response using the given scale map."""
    val = row[idx[col]].strip()
    return scale.get(val, None)


def get_duration(row, idx):
    """Get duration in seconds."""
    try:
        return int(row[idx['Duration (in seconds)']])
    except (ValueError, KeyError):
        return None


def iri_correct_count(row, idx):
    """Count how many of 3 IRI attention checks are correct."""
    correct = 0
    if row[idx[BARRIER_IRI]].strip() == IRI_BARRIER_ANSWER:
        correct += 1
    if row[idx[READINESS_IRI]].strip() == IRI_READINESS_ANSWER:
        correct += 1
    if row[idx[MATURITY_IRI]].strip() == IRI_MATURITY_ANSWER:
        correct += 1
    return correct


def iri_all_pass(row, idx):
    """Check if all 3 IRIs are correct."""
    return iri_correct_count(row, idx) == 3


def person_means(rows, cols, scale, idx):
    """Compute person-level scale means."""
    out = []
    for r in rows:
        vals = [score(r, c, scale, idx) for c in cols]
        vals = [v for v in vals if v is not None]
        if vals:
            out.append(sum(vals) / len(vals))
        else:
            out.append(None)
    return out


def get_recaptcha_score(row, idx):
    """Get reCAPTCHA score (defaults to 1.0 if missing)."""
    if 'Q_RecaptchaScore' not in idx:
        return 1.0
    val = row[idx['Q_RecaptchaScore']].strip()
    if val == '':
        return 1.0
    try:
        return float(val)
    except ValueError:
        return 1.0


def get_straightlining_count(row, idx):
    """Get Qualtrics straightlining count (defaults to 0 if missing)."""
    if 'Q_StraightliningCount' not in idx:
        return 0
    try:
        return int(row[idx['Q_StraightliningCount']].strip() or '0')
    except (ValueError, KeyError):
        return 0


def within_person_sd(responses):
    """Compute within-person SD for categorical responses mapped to numeric indices."""
    non_empty = [r for r in responses if r != '']
    if len(non_empty) < 2:
        return float('nan')
    unique_vals = list(dict.fromkeys(non_empty))
    numeric = [unique_vals.index(r) for r in non_empty]
    mean = sum(numeric) / len(numeric)
    variance = sum((val - mean) ** 2 for val in numeric) / len(numeric)
    return math.sqrt(variance)


def has_partial_straightlining(row, idx, threshold=PARTIAL_STRAIGHTLINING_SD_THRESHOLD):
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
                responses.append(row[idx[col]].strip())
        non_empty = [r for r in responses if r != '']
        if len(non_empty) < max(2, math.ceil(len(cols) / 2)):
            continue
        sd = within_person_sd(responses)
        if not math.isnan(sd) and sd < threshold:
            return True
    return False


def _has_auth_flag(row, idx):
    """Check if Prolific auth checks flag this response (LOW or MIXED)."""
    if 'Auth_LLM' not in idx or 'Auth_Bots' not in idx:
        return False  # columns not present, assume passing
    llm = row[idx['Auth_LLM']].strip().upper() if idx['Auth_LLM'] < len(row) else ''
    bots = row[idx['Auth_Bots']].strip().upper() if idx['Auth_Bots'] < len(row) else ''
    return llm in ('LOW', 'MIXED') or bots in ('LOW', 'MIXED')


def _get_prolific_status(row, idx):
    """Get Prolific submission status from enrichment column."""
    if 'Prolific_Status' not in idx:
        return ''
    val = row[idx['Prolific_Status']].strip() if idx['Prolific_Status'] < len(row) else ''
    return val


def is_finished(row, idx):
    """Check if response is finished (handles both label and numeric export)."""
    if 'Finished' not in idx:
        return True  # assume finished if column missing (legacy test data)
    val = row[idx['Finished']].strip().upper()
    return val in ('TRUE', '1')


def get_role(row, idx):
    """Get short role label."""
    return ROLE_MAP.get(row[idx['Q1_Role']].strip(), 'Unknown')


def org_bucket(row, idx):
    """Classify org size into Small/Medium/Large."""
    os_val = row[idx['Q4_OrgSize']].strip()
    if os_val in ('<100', '100-499'):
        return 'Small (<500)'
    elif os_val in ('500-999', '1000-4999'):
        return 'Medium (500-4999)'
    elif os_val in ('5000-9999', '10000+'):
        return 'Large (5000+)'
    return None


# ─────────────────────────────────────────────────────────────
# Main analysis
# ─────────────────────────────────────────────────────────────

def load_data(csv_path):
    """Load Qualtrics CSV and return header index + data rows."""
    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.reader(f)
        row1 = next(reader)  # Column names
        row2 = next(reader)  # Sub-labels
        row3 = next(reader)  # Import IDs
        data = list(reader)
    idx = {h: i for i, h in enumerate(row1)}
    return idx, data


def filter_samples(data, idx):
    """Create sample cuts from V2 data, grounded in Prolific operational reality.

    Sample hierarchy:
      1. Conservative Clean — Prolific APPROVED + passes ALL quality checks
                              (all 3 IRIs, duration >= 540s, reCAPTCHA >= 0.5,
                              no straightlining, no partial straightlining, auth pass)
      2. Flexible Clean     — Prolific APPROVED + passes basic quality checks
                              (all 3 IRIs, duration >= 480s) — includes manually
                              reviewed FLAG responses that were approved
      3. Prolific Accepted  — V2 finished (finished + dur>=120s) with Prolific APPROVED status
      4. All V2 Finished    — Finished + duration >= 120s
      5. All V2             — All V2 responses including incomplete

    Constraint: Conservative Clean ⊆ Flexible Clean ⊆ Prolific Accepted

    Returns:
        Tuple of (v2_rows, samples_dict) where samples_dict maps
        sample key to list of rows.
    """
    v2 = [r for r in data if r[idx['StartDate']] >= V2_START
          or ('ResponseId' in idx and r[idx['ResponseId']] == PROLIFIC_TEST_ID)]

    v2_finished = [r for r in v2 if is_finished(r, idx)
                   and get_duration(r, idx) is not None
                   and get_duration(r, idx) >= MIN_DURATION_ALL]

    # Prolific Accepted = finished responses with APPROVED status
    prolific_accepted = [r for r in v2_finished if _get_prolific_status(r, idx) == 'APPROVED']

    # Flexible Clean = APPROVED + basic quality (all 3 IRIs + duration >= 480s)
    flexible_clean = [r for r in prolific_accepted
                      if is_finished(r, idx)
                      and get_duration(r, idx) is not None
                      and get_duration(r, idx) >= MIN_DURATION_CLEAN
                      and iri_all_pass(r, idx)]

    # Conservative Clean = APPROVED + ALL quality checks (pipeline-level)
    conservative_clean = [r for r in flexible_clean
                          if get_duration(r, idx) >= MIN_DURATION_PIPELINE_CLEAN
                          and get_recaptcha_score(r, idx) >= RECAPTCHA_THRESHOLD
                          and get_straightlining_count(r, idx) == 0
                          and not has_partial_straightlining(r, idx)
                          and not _has_auth_flag(r, idx)]

    samples = {
        "conservative_clean": conservative_clean,
        "flexible_clean": flexible_clean,
        "prolific_accepted": prolific_accepted,
        "v2_finished": v2_finished,
        "v2_all": v2,
    }

    return v2, samples


def print_disposition(v2, samples, idx):
    """Print disposition waterfall and sample size summary."""
    print("=" * 78)
    print("  DISPOSITION WATERFALL & SAMPLE DEFINITIONS")
    print("=" * 78)
    print(f"  V2 total responses:        {len(v2):>5}")

    finished = [r for r in v2 if is_finished(r, idx)]
    print(f"  Finished:                  {len(finished):>5}")

    dur_fail = sum(1 for r in finished if get_duration(r, idx) is None or get_duration(r, idx) < MIN_DURATION_CLEAN)
    speed_ok = [r for r in finished if get_duration(r, idx) is not None and get_duration(r, idx) >= MIN_DURATION_CLEAN]
    print(f"  Duration < {MIN_DURATION_CLEAN}s excluded:  {dur_fail:>5}")
    print(f"  Duration >= {MIN_DURATION_CLEAN}s:          {len(speed_ok):>5}")
    f2 = sum(1 for r in speed_ok if iri_correct_count(r, idx) <= 1)
    f1 = sum(1 for r in speed_ok if iri_correct_count(r, idx) == 2)
    f0 = sum(1 for r in speed_ok if iri_correct_count(r, idx) == 3)
    print(f"  IRI fail 2+:               {f2:>5}")
    print(f"  IRI pass 2 of 3 (relaxed): {f1:>5}")
    print(f"  IRI pass all 3 (clean):    {f0:>5}")

    SAMPLE_LABELS = [
        ("conservative_clean", "Conservative Clean", "APPROVED + all checks (IRI, dur>=540s, reCAPTCHA, straightlining, auth)"),
        ("flexible_clean", "Flexible Clean", "APPROVED + basic quality (all 3 IRIs + dur>=480s)"),
        ("prolific_accepted", "Prolific Accepted", "V2 finished (finished + dur>=120s) with Prolific APPROVED status"),
        ("v2_finished", "All V2 Finished", "Finished + duration >= 120s"),
        ("v2_all", "All V2", "All V2 responses (including incomplete)"),
    ]

    print(f"\n  {'Sample':<25} {'N':>6}  Criteria")
    print(f"  {'─' * 25} {'─' * 6}  {'─' * 45}")
    for key, label, desc in SAMPLE_LABELS:
        n = len(samples[key])
        print(f"  {label:<25} {n:>6}  {desc}")

    # IRI pass rates
    bp = sum(1 for r in v2 if r[idx[BARRIER_IRI]].strip() == IRI_BARRIER_ANSWER)
    rp = sum(1 for r in v2 if r[idx[READINESS_IRI]].strip() == IRI_READINESS_ANSWER)
    mp = sum(1 for r in v2 if r[idx[MATURITY_IRI]].strip() == IRI_MATURITY_ANSWER)
    print(f"\n  IRI pass rates (all V2 N={len(v2)}):")
    print(f"    Barrier:   {bp}/{len(v2)} ({bp / len(v2) * 100:.1f}%)")
    print(f"    Readiness: {rp}/{len(v2)} ({rp / len(v2) * 100:.1f}%)")
    print(f"    Maturity:  {mp}/{len(v2)} ({mp / len(v2) * 100:.1f}%)")


def print_demographics(rows, idx, label="Clean"):
    """Print demographic breakdown."""
    if not rows:
        print("  No data")
        return
    print(f"\n{'=' * 78}")
    print(f"  DEMOGRAPHICS ({label} N={len(rows)})")
    print("=" * 78)

    roles = Counter(get_role(r, idx) for r in rows)
    print("\n  Roles:")
    for role, ct in roles.most_common():
        print(f"    {role:6s}: {ct:3d} ({ct / len(rows) * 100:5.1f}%)")

    tech = [r for r in rows if get_role(r, idx) in TECH_TITLES]
    nontech = [r for r in rows if get_role(r, idx) in NONTECH_TITLES]
    other = [r for r in rows if get_role(r, idx) == 'Other']
    print(f"\n  Technical (CIO/CTO): n={len(tech)} ({len(tech) / len(rows) * 100:.1f}%)")
    print(f"  Non-Technical:       n={len(nontech)} ({len(nontech) / len(rows) * 100:.1f}%)")
    print(f"  Other:               n={len(other)} ({len(other) / len(rows) * 100:.1f}%)")

    print("\n  Org Size:")
    for os_val in ['<100', '100-499', '500-999', '1000-4999', '5000-9999', '10000+']:
        ct = sum(1 for r in rows if r[idx['Q4_OrgSize']].strip() == os_val)
        print(f"    {os_val:12s}: {ct:3d} ({ct / len(rows) * 100:.1f}%)")

    print("\n  Profit Model:")
    for pm in ['For-Profit', 'Non-Profit', 'Government/Public Sector']:
        ct = sum(1 for r in rows if r[idx['Q5_ProfitModel']].strip() == pm)
        print(f"    {pm:30s}: {ct:3d} ({ct / len(rows) * 100:.1f}%)")

    print("\n  Geographic Scope:")
    for g, ct in Counter(r[idx['Q8_GeoScope']].strip() for r in rows).most_common():
        print(f"    {g:20s}: {ct:3d} ({ct / len(rows) * 100:.1f}%)")


def print_item_rankings(rows, idx):
    """Print item rankings for all three scales."""
    for scale_label, cols, names, sc in [
        ("BARRIER", BARRIER_COLS, BARRIER_NAMES, BARRIER_SCALE),
        ("READINESS", READINESS_COLS, READINESS_NAMES, READINESS_SCALE),
        ("MATURITY", MATURITY_COLS, MATURITY_NAMES, MATURITY_SCALE),
    ]:
        print(f"\n{'=' * 78}")
        print(f"  {scale_label} ITEM RANKINGS (N={len(rows)})")
        print("=" * 78)

        stats = []
        for i, col in enumerate(cols):
            vals = [score(r, col, sc, idx) for r in rows]
            vals = [v for v in vals if v is not None]
            m, sd = mean_sd(vals)
            stats.append((names[i], m, sd, len(vals)))

        stats.sort(key=lambda x: -(x[1] or 0))
        print(f"\n  {'Rank':>4} {'Item':<38} {'M':>6} {'SD':>6} {'n':>4}")
        print(f"  {'─' * 4} {'─' * 38} {'─' * 6} {'─' * 6} {'─' * 4}")
        for rank, (name, m, sd, n) in enumerate(stats, 1):
            m_str = f"{m:.2f}" if m is not None else "NA"
            sd_str = f"{sd:.2f}" if sd is not None else "NA"
            print(f"  {rank:>4} {name:<38} {m_str:>6}  {sd_str:>6}  {n:>3}")

        pm = person_means(rows, cols, sc, idx)
        gm, gsd = mean_sd(pm)
        gm_str = f"{gm:.2f}" if gm is not None else "NA"
        gsd_str = f"{gsd:.2f}" if gsd is not None else "NA"
        print(f"\n  Grand Mean: {gm_str} (SD={gsd_str})")


def print_correlations_and_reliability(rows, idx):
    """Print construct correlations, shared variance, and Cronbach's alpha."""
    print(f"\n{'=' * 78}")
    print("  CORRELATIONS & RELIABILITY")
    print("=" * 78)

    bp = person_means(rows, BARRIER_COLS, BARRIER_SCALE, idx)
    rp = person_means(rows, READINESS_COLS, READINESS_SCALE, idx)
    mp = person_means(rows, MATURITY_COLS, MATURITY_SCALE, idx)

    br = pearson_r(bp, rp)
    bm = pearson_r(bp, mp)
    rm = pearson_r(rp, mp)

    print(f"\n  Construct Correlations:")
    if br is not None:
        print(f"    B-R: r = {br:.3f}  (r² = {br ** 2:.3f}, {br ** 2 * 100:.1f}% shared variance)")
    else:
        print(f"    B-R: r = N/A")
    if bm is not None:
        print(f"    B-M: r = {bm:.3f}  (r² = {bm ** 2:.3f}, {bm ** 2 * 100:.1f}% shared variance)")
    else:
        print(f"    B-M: r = N/A")
    if rm is not None:
        print(f"    R-M: r = {rm:.3f}  (r² = {rm ** 2:.3f}, {rm ** 2 * 100:.1f}% shared variance)")
    else:
        print(f"    R-M: r = N/A")

    ba = cronbach_alpha(rows, BARRIER_COLS, BARRIER_SCALE, idx)
    ra = cronbach_alpha(rows, READINESS_COLS, READINESS_SCALE, idx)
    ma = cronbach_alpha(rows, MATURITY_COLS, MATURITY_SCALE, idx)

    print(f"\n  Cronbach's Alpha:")
    ba_str = f"{ba:.3f}" if ba is not None else "N/A"
    ra_str = f"{ra:.3f}" if ra is not None else "N/A"
    ma_str = f"{ma:.3f}" if ma is not None else "N/A"
    print(f"    Barriers (18 items):  α = {ba_str}")
    print(f"    Readiness (17 items): α = {ra_str}")
    print(f"    Maturity (8 items):   α = {ma_str}")

    print(f"\n  Distribution Shape:")
    for name, vals in [("Barriers", bp), ("Readiness", rp), ("Maturity", mp)]:
        m, s = mean_sd(vals)
        sk = skewness(vals)
        ku = kurtosis_excess(vals)
        m_str = f"{m:.2f}" if m is not None else "NA"
        s_str = f"{s:.2f}" if s is not None else "NA"
        sk_str = f"{sk:+.2f}" if sk is not None else "NA"
        ku_str = f"{ku:+.2f}" if ku is not None else "NA"
        print(f"    {name:<12}: M={m_str}, SD={s_str}, skew={sk_str}, kurtosis={ku_str}")


def print_effect_sizes(rows, idx):
    """Print effect sizes for key group comparisons."""
    print(f"\n{'=' * 78}")
    print("  EFFECT SIZES (Cohen's d)")
    print("=" * 78)

    tech = [r for r in rows if get_role(r, idx) in TECH_TITLES]
    nontech = [r for r in rows if get_role(r, idx) in NONTECH_TITLES]

    print(f"\n  Tech (n={len(tech)}) vs Non-Tech (n={len(nontech)}):")
    for label, cols, sc in [("Barriers", BARRIER_COLS, BARRIER_SCALE),
                             ("Readiness", READINESS_COLS, READINESS_SCALE),
                             ("Maturity", MATURITY_COLS, MATURITY_SCALE)]:
        t = person_means(tech, cols, sc, idx)
        nt = person_means(nontech, cols, sc, idx)
        d = cohens_d(t, nt)
        tm, _ = mean_sd(t)
        ntm, _ = mean_sd(nt)
        if d is not None:
            size = 'small' if abs(d) < 0.5 else 'medium' if abs(d) < 0.8 else 'large'
            tm_str = f"{tm:.2f}" if tm is not None else "NA"
            ntm_str = f"{ntm:.2f}" if ntm is not None else "NA"
            print(f"    {label:<12}: Tech={tm_str}, NonTech={ntm_str}, d={d:+.2f} ({size})")
        else:
            tm_str = f"{tm:.2f}" if tm is not None else "NA"
            ntm_str = f"{ntm:.2f}" if ntm is not None else "NA"
            print(f"    {label:<12}: Tech={tm_str}, NonTech={ntm_str}, d=N/A")

    large = [r for r in rows if r[idx['Q4_OrgSize']].strip() in ('5000-9999', '10000+')]
    smmed = [r for r in rows if r[idx['Q4_OrgSize']].strip() not in ('5000-9999', '10000+')]

    print(f"\n  Large Org (n={len(large)}) vs Small/Medium (n={len(smmed)}):")
    for label, cols, sc in [("Barriers", BARRIER_COLS, BARRIER_SCALE),
                             ("Readiness", READINESS_COLS, READINESS_SCALE)]:
        l = person_means(large, cols, sc, idx)
        s = person_means(smmed, cols, sc, idx)
        d = cohens_d(l, s)
        lm, _ = mean_sd(l)
        sm, _ = mean_sd(s)
        if d is not None:
            size = 'small' if abs(d) < 0.5 else 'medium' if abs(d) < 0.8 else 'large'
            lm_str = f"{lm:.2f}" if lm is not None else "NA"
            sm_str = f"{sm:.2f}" if sm is not None else "NA"
            print(f"    {label:<12}: Large={lm_str}, S/M={sm_str}, d={d:+.2f} ({size})")
        else:
            lm_str = f"{lm:.2f}" if lm is not None else "NA"
            sm_str = f"{sm:.2f}" if sm is not None else "NA"
            print(f"    {label:<12}: Large={lm_str}, S/M={sm_str}, d=N/A")

    # Budget adequacy
    budget_col = READINESS_COLS[16]
    high_budget = [r for r in rows if score(r, budget_col, READINESS_SCALE, idx) and score(r, budget_col, READINESS_SCALE, idx) >= 4]
    low_budget = [r for r in rows if score(r, budget_col, READINESS_SCALE, idx) and score(r, budget_col, READINESS_SCALE, idx) <= 2]
    if high_budget and low_budget:
        hb = person_means(high_budget, BARRIER_COLS, BARRIER_SCALE, idx)
        lb = person_means(low_budget, BARRIER_COLS, BARRIER_SCALE, idx)
        d = cohens_d(hb, lb)
        hbm, _ = mean_sd(hb)
        lbm, _ = mean_sd(lb)
        print(f"\n  Budget Adequacy — High (n={len(high_budget)}) vs Low (n={len(low_budget)}):")
        if d is not None:
            hbm_str = f"{hbm:.2f}" if hbm is not None else "NA"
            lbm_str = f"{lbm:.2f}" if lbm is not None else "NA"
            print(f"    Barriers: High={hbm_str}, Low={lbm_str}, d={d:+.2f}")
        else:
            hbm_str = f"{hbm:.2f}" if hbm is not None else "NA"
            lbm_str = f"{lbm:.2f}" if lbm is not None else "NA"
            print(f"    Barriers: High={hbm_str}, Low={lbm_str}, d=N/A")

    # Decision authority
    print(f"\n  Decision Authority Effect:")
    primary = [r for r in rows if 'primary decision' in r[idx['Q2_DecisionAuth']].lower()]
    shared = [r for r in rows if 'several key' in r[idx['Q2_DecisionAuth']].lower()]
    input_only = [r for r in rows if 'significant input' in r[idx['Q2_DecisionAuth']].lower()]
    for gname, grows in [("Primary", primary), ("Shared", shared), ("Input/Recommender", input_only)]:
        if not grows:
            continue
        bm, _ = mean_sd(person_means(grows, BARRIER_COLS, BARRIER_SCALE, idx))
        rm, _ = mean_sd(person_means(grows, READINESS_COLS, READINESS_SCALE, idx))
        mm, _ = mean_sd(person_means(grows, MATURITY_COLS, MATURITY_SCALE, idx))
        print(f"    {gname:25s} (n={len(grows):3d}): B={bm:.2f}, R={rm:.2f}, M={mm:.2f}")


def print_cross_tabs(rows, idx):
    """Print cross-tabulation results."""
    print(f"\n{'=' * 78}")
    print("  CROSS-TABULATIONS")
    print("=" * 78)

    # Tech vs NonTech
    print("\n  Tech vs Non-Tech:")
    for gname, grows in [
        ("Technical (CIO/CTO)", [r for r in rows if get_role(r, idx) in TECH_TITLES]),
        ("Non-Technical", [r for r in rows if get_role(r, idx) in NONTECH_TITLES]),
        ("Other", [r for r in rows if get_role(r, idx) == 'Other']),
    ]:
        if not grows:
            continue
        bm, _ = mean_sd(person_means(grows, BARRIER_COLS, BARRIER_SCALE, idx))
        rm, _ = mean_sd(person_means(grows, READINESS_COLS, READINESS_SCALE, idx))
        mm, _ = mean_sd(person_means(grows, MATURITY_COLS, MATURITY_SCALE, idx))
        print(f"    {gname:25s} (n={len(grows):3d}): B={bm:.2f}, R={rm:.2f}, M={mm:.2f}")

    # Org Size
    print("\n  Org Size:")
    for bname in ['Small (<500)', 'Medium (500-4999)', 'Large (5000+)']:
        brows = [r for r in rows if org_bucket(r, idx) == bname]
        if not brows:
            continue
        bm, _ = mean_sd(person_means(brows, BARRIER_COLS, BARRIER_SCALE, idx))
        rm, _ = mean_sd(person_means(brows, READINESS_COLS, READINESS_SCALE, idx))
        mm, _ = mean_sd(person_means(brows, MATURITY_COLS, MATURITY_SCALE, idx))
        print(f"    {bname:25s} (n={len(brows):3d}): B={bm:.2f}, R={rm:.2f}, M={mm:.2f}")

    # Profit Model
    print("\n  Profit Model:")
    for pm_name in ['For-Profit', 'Non-Profit', 'Government/Public Sector']:
        prows = [r for r in rows if r[idx['Q5_ProfitModel']].strip() == pm_name]
        if not prows:
            continue
        bm, _ = mean_sd(person_means(prows, BARRIER_COLS, BARRIER_SCALE, idx))
        rm, _ = mean_sd(person_means(prows, READINESS_COLS, READINESS_SCALE, idx))
        mm, _ = mean_sd(person_means(prows, MATURITY_COLS, MATURITY_SCALE, idx))
        print(f"    {pm_name:30s} (n={len(prows):3d}): B={bm:.2f}, R={rm:.2f}, M={mm:.2f}")


def print_sensitivity(cuts, idx):
    """Print sensitivity analysis across all sample cuts."""
    print(f"\n{'=' * 78}")
    print("  SENSITIVITY ANALYSIS — ALL SAMPLE DEFINITIONS")
    print("=" * 78)

    col_width = 12
    headers = [label for label, _ in cuts]
    header_line = "  " + f"{'Metric':<40}" + "".join(f"{h:>{col_width}}" for h in headers)
    print(f"\n{header_line}")
    print("  " + "─" * 40 + ("─" * col_width) * len(cuts))

    metrics = [
        ("N", lambda rows: str(len(rows))),
        ("Barrier Grand Mean", lambda rows: f"{mean_sd(person_means(rows, BARRIER_COLS, BARRIER_SCALE, idx))[0]:.2f}"),
        ("Barrier SD", lambda rows: f"{mean_sd(person_means(rows, BARRIER_COLS, BARRIER_SCALE, idx))[1]:.2f}"),
        ("Readiness Grand Mean", lambda rows: f"{mean_sd(person_means(rows, READINESS_COLS, READINESS_SCALE, idx))[0]:.2f}"),
        ("Readiness SD", lambda rows: f"{mean_sd(person_means(rows, READINESS_COLS, READINESS_SCALE, idx))[1]:.2f}"),
        ("Maturity Grand Mean", lambda rows: f"{mean_sd(person_means(rows, MATURITY_COLS, MATURITY_SCALE, idx))[0]:.2f}"),
        ("Maturity SD", lambda rows: f"{mean_sd(person_means(rows, MATURITY_COLS, MATURITY_SCALE, idx))[1]:.2f}"),
        ("B-R Correlation", lambda rows: f"{pearson_r(person_means(rows, BARRIER_COLS, BARRIER_SCALE, idx), person_means(rows, READINESS_COLS, READINESS_SCALE, idx)):.3f}"),
        ("B-M Correlation", lambda rows: f"{pearson_r(person_means(rows, BARRIER_COLS, BARRIER_SCALE, idx), person_means(rows, MATURITY_COLS, MATURITY_SCALE, idx)):.3f}"),
        ("R-M Correlation", lambda rows: f"{pearson_r(person_means(rows, READINESS_COLS, READINESS_SCALE, idx), person_means(rows, MATURITY_COLS, MATURITY_SCALE, idx)):.3f}"),
        ("Alpha Barriers", lambda rows: f"{cronbach_alpha(rows, BARRIER_COLS, BARRIER_SCALE, idx):.3f}"),
        ("Alpha Readiness", lambda rows: f"{cronbach_alpha(rows, READINESS_COLS, READINESS_SCALE, idx):.3f}"),
        ("Alpha Maturity", lambda rows: f"{cronbach_alpha(rows, MATURITY_COLS, MATURITY_SCALE, idx):.3f}"),
    ]

    for label, fn in metrics:
        vals = []
        for _, rows in cuts:
            try:
                vals.append(fn(rows))
            except Exception:
                vals.append("N/A")
        print("  " + f"{label:<40}" + "".join(f"{v:>{col_width}}" for v in vals))


def sensitivity_to_json(cuts, idx):
    """Return sensitivity analysis results as a JSON-serializable dict."""
    result = {"samples": [], "metrics": []}

    sample_meta = {
        "Conservative Clean": {
            "key": "conservative_clean",
            "description": "Prolific APPROVED + all quality checks (IRI, duration >= 540s, reCAPTCHA, straightlining, auth)",
        },
        "Flexible Clean": {
            "key": "flexible_clean",
            "description": "Prolific APPROVED + basic quality (all 3 IRIs + duration >= 480s)",
        },
        "Prolific Accepted": {
            "key": "prolific_accepted",
            "description": "V2 finished (finished + dur>=120s) with Prolific APPROVED status",
        },
        "All V2 Finished": {
            "key": "v2_finished",
            "description": "Finished + duration >= 120s (extreme speeders excluded)",
        },
        "All V2": {
            "key": "v2_all",
            "description": "All V2 responses including incomplete",
        },
    }

    for label, rows in cuts:
        meta = sample_meta.get(label, {"key": label.lower().replace(" ", "_"), "description": ""})
        result["samples"].append({
            "key": meta["key"],
            "label": label,
            "description": meta["description"],
            "n": len(rows),
        })

    def safe_compute(fn, rows):
        try:
            val = fn(rows)
            if val is None or (isinstance(val, float) and math.isnan(val)):
                return None
            return round(val, 4) if isinstance(val, float) else val
        except Exception:
            return None

    metric_defs = [
        ("barrier_mean", "Barrier Grand Mean", lambda rows: mean_sd(person_means(rows, BARRIER_COLS, BARRIER_SCALE, idx))[0]),
        ("barrier_sd", "Barrier SD", lambda rows: mean_sd(person_means(rows, BARRIER_COLS, BARRIER_SCALE, idx))[1]),
        ("readiness_mean", "Readiness Grand Mean", lambda rows: mean_sd(person_means(rows, READINESS_COLS, READINESS_SCALE, idx))[0]),
        ("readiness_sd", "Readiness SD", lambda rows: mean_sd(person_means(rows, READINESS_COLS, READINESS_SCALE, idx))[1]),
        ("maturity_mean", "Maturity Grand Mean", lambda rows: mean_sd(person_means(rows, MATURITY_COLS, MATURITY_SCALE, idx))[0]),
        ("maturity_sd", "Maturity SD", lambda rows: mean_sd(person_means(rows, MATURITY_COLS, MATURITY_SCALE, idx))[1]),
        ("corr_br", "B-R Correlation", lambda rows: pearson_r(person_means(rows, BARRIER_COLS, BARRIER_SCALE, idx), person_means(rows, READINESS_COLS, READINESS_SCALE, idx))),
        ("corr_bm", "B-M Correlation", lambda rows: pearson_r(person_means(rows, BARRIER_COLS, BARRIER_SCALE, idx), person_means(rows, MATURITY_COLS, MATURITY_SCALE, idx))),
        ("corr_rm", "R-M Correlation", lambda rows: pearson_r(person_means(rows, READINESS_COLS, READINESS_SCALE, idx), person_means(rows, MATURITY_COLS, MATURITY_SCALE, idx))),
        ("alpha_barriers", "Alpha Barriers", lambda rows: cronbach_alpha(rows, BARRIER_COLS, BARRIER_SCALE, idx)),
        ("alpha_readiness", "Alpha Readiness", lambda rows: cronbach_alpha(rows, READINESS_COLS, READINESS_SCALE, idx)),
        ("alpha_maturity", "Alpha Maturity", lambda rows: cronbach_alpha(rows, MATURITY_COLS, MATURITY_SCALE, idx)),
    ]

    for key, label, fn in metric_defs:
        values = {}
        for sample_label, rows in cuts:
            sample_key = sample_meta.get(sample_label, {}).get("key", sample_label.lower().replace(" ", "_"))
            values[sample_key] = safe_compute(fn, rows)
        result["metrics"].append({
            "key": key,
            "label": label,
            "values": values,
        })

    return result


def main():
    import argparse as _ap
    parser = _ap.ArgumentParser(description="TABS V2 Descriptive Statistics & Sensitivity Analysis")
    parser.add_argument("csv_path", help="Path to Qualtrics CSV export")
    parser.add_argument("--json", dest="json_output", metavar="PATH",
                        help="Write sensitivity analysis results to JSON file")
    parser.add_argument("--primary-sample", dest="primary_sample", default="conservative_clean",
                        choices=["conservative_clean", "flexible_clean", "prolific_accepted", "v2_finished", "v2_all"],
                        help="Which sample to use for detailed analysis (default: conservative_clean)")
    args = parser.parse_args()

    csv_path = args.csv_path
    idx, data = load_data(csv_path)
    v2, samples = filter_samples(data, idx)

    print("=" * 78)
    print("  TABS V2 DESCRIPTIVE STATISTICS & SENSITIVITY ANALYSIS")
    print(f"  Source: {csv_path}")
    print("=" * 78)

    print_disposition(v2, samples, idx)

    # Detailed analysis on the selected primary sample
    primary = samples[args.primary_sample]
    sample_labels = {
        "conservative_clean": "Conservative Clean",
        "flexible_clean": "Flexible Clean",
        "prolific_accepted": "Prolific Accepted",
        "v2_finished": "All V2 Finished",
        "v2_all": "All V2",
    }
    primary_label = sample_labels[args.primary_sample]

    print_demographics(primary, idx, primary_label)
    print_item_rankings(primary, idx)
    print_correlations_and_reliability(primary, idx)
    print_effect_sizes(primary, idx)
    print_cross_tabs(primary, idx)

    # Sensitivity analysis across all sample definitions
    cuts = [
        ("Conservative Clean", samples["conservative_clean"]),
        ("Flexible Clean", samples["flexible_clean"]),
        ("Prolific Accepted", samples["prolific_accepted"]),
        ("All V2 Finished", samples["v2_finished"]),
        ("All V2", samples["v2_all"]),
    ]
    print_sensitivity(cuts, idx)

    # JSON output
    if args.json_output:
        import json as _json
        sensitivity_data = sensitivity_to_json(cuts, idx)
        with open(args.json_output, "w", encoding="utf-8") as f:
            _json.dump(sensitivity_data, f, indent=2)
            f.write("\n")
        print(f"\n  JSON output written to: {args.json_output}")

    print(f"\n{'=' * 78}")
    print("  ANALYSIS COMPLETE")
    print("=" * 78)


if __name__ == "__main__":
    main()
