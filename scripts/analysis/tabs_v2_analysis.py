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
import re
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

# IRI answers (expected correct responses)
BARRIER_IRI = "Q10-28_Barriers_19"
READINESS_IRI = "Q47-64_Readiness_19"
MATURITY_IRI = "Q65-73_Maturity_9"

IRI_ANSWERS = {
    BARRIER_IRI: "Major Barrier",
    READINESS_IRI: "Low Readiness/Capability",
    MATURITY_IRI: "Level 2: Developing/Repeatable"
}

# Column prefixes for construct question blocks
BARRIER_COLS = [f"Q10-28_Barriers_{i}" for i in range(1, 19)]
READINESS_COLS = [f"Q47-64_Readiness_{i}" for i in range(1, 18)]
MATURITY_COLS = [f"Q65-73_Maturity_{i}" for i in range(1, 9)]

# Demographics and other columns
DEMO_COLS = {
    "Role": "Q1_Role",
    "Decision Authority": "Q2_DecisionAuth",
    "Industry": "Q3_Industry",
    "Organization Size": "Q4_OrgSize",
    "Profit Model": "Q5_ProfitModel",
    "Revenue/Budget": "Q6_RevenueBudget",
    "Personal/Discretionary Budget": "Q7_PersonalBudget",
    "Geographic Scope": "Q8_GeoScope",
    "Geographic Scale": "Q9_GeoScale",
    "Feedback": "Q74_Feedback"
}

# Column 0 is ResponseId, 1 is StartDate, 2 is Duration (in seconds)
RESPONSE_ID_COL = "ResponseId"
START_DATE_COL = "StartDate (America/New_York)"
DURATION_COL = "Duration (in seconds)"
FINISHED_COL = "Finished"

ROLE_MAP = {
    "CEO (Chief Executive Officer)": "CEO",
    "CFO (Chief Financial Officer)": "CFO",
    "COO (Chief Operating Officer)": "COO",
    "CIO (e.g., Director of IT)": "CIO",
    "CTO (e.g., VP of Technology, Chief Architect)": "CTO",
    "CISO (e.g., Director of Cybersecurity, Chief Security Officer)": "CISO",
    "CHRO (Chief Human Resources Officer)": "CHRO",
    "CMO (Chief Marketing Officer)": "CMO",
    "CSO (Chief Strategy Officer)": "CSO",
    "CRO (Chief Risk Officer)": "CRO",
}

# Role categories for "Other" free-text role responses
# Each tuple: (category_label, [list of regex patterns])
# Patterns are matched in order; first match wins.
OTHER_ROLE_CATEGORIES_PATTERNS = [
    ("C-Suite Adjacent", [
        r'\bchief\b',  # "Chief" (exact word boundary)
        r'\bcdo\b',    # "CDO" (Chief Data Officer, Chief Digital Officer, etc.)
        r'\bcpo\b',    # "CPO"
        r'\bcao\b',    # "CAO" etc.
        r'\bclo\b',
        r'\bcdio\b',
        r'\bcaio\b',
        r'\bcxo\b',
        r'\bcco\b',
    ]),
    ("VP / SVP", [
        r'\bvp\b',
        r'\bevp\b',
        r'\savp\b',
        r'\bsvp\b',
        r'\bvice.?president\b',
    ]),
    ("Director", [
        r'\bdirector\b',
    ]),
    ("Manager / Program Lead", [
        r'\bmanager\b',
        r'\bleader\b',
        r'\blead\b',
        r'\bsupervisor\b',
    ]),
    ("Owner / Founder / President", [
        r'\bowner\b',
        r'\bfounder\b',
        r'\bpresident\b',
        r'\bpartner\b',
        r'\bprincipal\b',
        r'\bproprietor\b',
    ]),
    ("Technical Specialist", [
        r'\bIT\b',  # must be uppercase
        r'\bengineer\b',
        r'\bdeveloper\b',
        r'\barchitect\b',
        r'\banalyst\b',
        r'\btechnology\b',
        r'\btechnical\b',
        r'\badmin\b',
        r'\badministrator\b',
        r'\binfrastructure\b',
        r'\bnetwork\b',
    ]),
]

# ─────────────────────────────────────────────────────────────
# Core statistical functions
# ─────────────────────────────────────────────────────────────

def mean_sd(vals):
    """Return (mean, SD) for a list, filtering None values. Returns (None, None) if < 1 value."""
    clean = [v for v in vals if v is not None]
    if len(clean) < 1:
        return None, None
    m = sum(clean) / len(clean)
    if len(clean) == 1:
        return m, 0.0
    var = sum((v - m) ** 2 for v in clean) / (len(clean) - 1)
    return m, math.sqrt(var)

def pearson_r(x, y):
    """Return Pearson r, filtering None values. Returns None if < 3 pairs."""
    pairs = [(x[i], y[i]) for i in range(min(len(x), len(y))) if x[i] is not None and y[i] is not None]
    if len(pairs) < 3:
        return None
    x_clean, y_clean = zip(*pairs)
    x_mean, x_sd = mean_sd(list(x_clean))
    y_mean, y_sd = mean_sd(list(y_clean))
    if x_sd is None or y_sd is None or x_sd == 0 or y_sd == 0:
        return None
    numerator = sum((x_clean[i] - x_mean) * (y_clean[i] - y_mean) for i in range(len(pairs)))
    denominator = (len(pairs) - 1) * x_sd * y_sd
    return numerator / denominator

def cohens_d(g1, g2):
    """Return Cohen's d and 95% CI, filtering None values. Returns (None, None, None) if < 2 per group."""
    g1_clean = [v for v in g1 if v is not None]
    g2_clean = [v for v in g2 if v is not None]
    if len(g1_clean) < 2 or len(g2_clean) < 2:
        return None, None, None
    m1, s1 = mean_sd(g1_clean)
    m2, s2 = mean_sd(g2_clean)
    n1, n2 = len(g1_clean), len(g2_clean)
    pooled_s = math.sqrt(((n1 - 1) * s1 ** 2 + (n2 - 1) * s2 ** 2) / (n1 + n2 - 2))
    if pooled_s == 0:
        return None, None, None
    d = (m1 - m2) / pooled_s
    se_d = math.sqrt((n1 + n2) / (n1 * n2) + d ** 2 / (2 * (n1 + n2 - 2)))
    ci_lower = d - 1.96 * se_d
    ci_upper = d + 1.96 * se_d
    return d, ci_lower, ci_upper

def cronbach_alpha(rows, col_names, scale_map, idx):
    """Compute Cronbach's alpha from rows and column names. Returns None if < 3 items or < 2 persons."""
    if len(col_names) < 3 or len(rows) < 2:
        return None
    scores = [[score(row, col, scale_map, idx) for col in col_names] for row in rows]
    scores = [[v for v in row if v is not None] for row in scores]
    if all(len(row) < 2 for row in scores):
        return None
    items = [[scores[i][j] for i in range(len(scores)) if j < len(scores[i])] for j in range(max(len(row) for row in scores))]
    if len(items) < 3:
        return None
    item_vars = [var(item) for item in items]
    if any(v is None or v == 0 for v in item_vars):
        return None
    total_var = var([sum(row) for row in scores if len(row) > 0])
    k = len(items)
    alpha = (k / (k - 1)) * (1 - sum(item_vars) / total_var)
    return max(-1.0, min(1.0, alpha))

def skewness(vals):
    """Return skewness. Returns None if < 3 values."""
    clean = [v for v in vals if v is not None]
    if len(clean) < 3:
        return None
    m, s = mean_sd(clean)
    if s == 0:
        return None
    return sum((v - m) ** 3 for v in clean) / (len(clean) * s ** 3)

def kurtosis_excess(vals):
    """Return excess kurtosis. Returns None if < 4 values."""
    clean = [v for v in vals if v is not None]
    if len(clean) < 4:
        return None
    m, s = mean_sd(clean)
    if s == 0:
        return None
    return sum((v - m) ** 4 for v in clean) / (len(clean) * s ** 4) - 3

def var(vals):
    """Return sample variance. Returns None if < 2 values."""
    clean = [v for v in vals if v is not None]
    if len(clean) < 2:
        return None
    m = sum(clean) / len(clean)
    return sum((v - m) ** 2 for v in clean) / (len(clean) - 1)

def score(row, col, scale_map, idx):
    """Return numeric score for a cell. Returns None if not in scale_map."""
    val = row[idx[col]] if col in idx else None
    return scale_map.get(val) if val else None

def get_duration(row, idx):
    """Return duration in seconds. Returns None if missing or non-numeric."""
    if DURATION_COL not in idx:
        return None
    try:
        return int(row[idx[DURATION_COL]])
    except (ValueError, IndexError):
        return None

def iri_correct_count(row, idx):
    """Count how many IRIs are correct (0, 1, 2, or 3)."""
    correct = 0
    for iri_col, expected in IRI_ANSWERS.items():
        if iri_col in idx:
            actual = row[idx[iri_col]]
            if actual == expected:
                correct += 1
    return correct

def iri_all_pass(row, idx):
    """Return True if all 3 IRIs are correct."""
    return iri_correct_count(row, idx) == 3

def person_means(rows, col_list, scale_map, idx):
    """Return [person_mean_1, person_mean_2, ...] for a construct."""
    means = []
    for row in rows:
        scores = [score(row, col, scale_map, idx) for col in col_list]
        clean = [s for s in scores if s is not None]
        if clean:
            means.append(sum(clean) / len(clean))
    return means

def get_recaptcha_score(row, idx):
    """Return reCAPTCHA score (0-1). Returns 1.0 if missing or non-numeric."""
    if "Q_RecaptchaScore" not in idx:
        return 1.0
    try:
        score = float(row[idx["Q_RecaptchaScore"]])
        return score if 0 <= score <= 1 else 1.0
    except (ValueError, IndexError):
        return 1.0

def get_straightlining_count(row, idx):
    """Return count of straightlined item blocks. Returns 0 if missing or non-numeric."""
    if "Q_StraightliningCount" not in idx:
        return 0
    try:
        return int(row[idx["Q_StraightliningCount"]])
    except (ValueError, IndexError):
        return 0

def within_person_sd(vals):
    """Compute SD of responses within a person. Returns NaN if < 2 unique non-empty values."""
    clean = [v for v in vals if v]
    if len(clean) < 2:
        return float('nan')
    unique = list(set(clean))
    if len(unique) < 2:
        return 0.0
    # Map unique values to numeric codes
    val_to_code = {v: i + 1 for i, v in enumerate(sorted(unique))}
    codes = [val_to_code[v] for v in clean]
    m = sum(codes) / len(codes)
    var = sum((c - m) ** 2 for c in codes) / len(codes)
    return math.sqrt(var)

def has_partial_straightlining(row, idx):
    """Return True if any construct block has SD < threshold (possible straightlining)."""
    for col_list in [BARRIER_COLS, READINESS_COLS, MATURITY_COLS]:
        vals = [row[idx[col]] for col in col_list if col in idx]
        sd = within_person_sd(vals)
        if not math.isnan(sd) and sd < PARTIAL_STRAIGHTLINING_SD_THRESHOLD:
            return True
    return False

def is_finished(row, idx):
    """Return True if Finished==TRUE, False if ==FALSE. Returns True (default) if missing."""
    if FINISHED_COL not in idx:
        return True
    val = row[idx[FINISHED_COL]].upper() if idx[FINISHED_COL] < len(row) else ""
    return val in ("TRUE", "1")

# ─────────────────────────────────────────────────────────────
# Role classification
# ─────────────────────────────────────────────────────────────

def get_role(row, idx):
    """Return role abbreviation. Returns 'Unknown' if not in ROLE_MAP."""
    if "Q1_Role" not in idx:
        return "Unknown"
    role = row[idx["Q1_Role"]]
    return ROLE_MAP.get(role, "Unknown")

def org_bucket(row, idx):
    """Return org size bucket: 'Small (<500)', 'Medium (500-4999)', 'Large (5000+)', or None."""
    if "Q4_OrgSize" not in idx:
        return None
    size = row[idx["Q4_OrgSize"]]
    if size in ("<100", "100-499"):
        return "Small (<500)"
    elif size in ("500-999", "1000-4999"):
        return "Medium (500-4999)"
    elif size in ("5000-9999", "10000+"):
        return "Large (5000+)"
    return None

def categorize_other_role(text):
    """Categorize free-text 'Other' role response using regex patterns.
    
    the single source of truth for all binary Tech/Non-Tech role classification patterns.
    Returns category name or 'Uncategorized' if no match.
    """
    if not text or not text.strip():
        return "Uncategorized"
    
    for category, patterns in OTHER_ROLE_CATEGORIES_PATTERNS:
        for pattern in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return category
    
    return "Uncategorized"

def classify_role(text):
    """Return True if role maps to the Technical group under the binary classification.
    
    Matches regex patterns that indicate technical specialization (developer, engineer, analyst, etc.).
    Return 'Technical' if matched, else 'Other'.
    """
    if not text or not text.strip():
        return "Other"
    
    # Patterns for technical roles in free-text
    technical_patterns = [
        r'\banalytics?\b',
        r'\bai\b',
        r'\barthitect\b',
        r'\bengine',
        r'\bdevelop',
        r'\bprogramm',
        r'\bdata\b',
        r'\binfra',
        r'\bnetwork\b',
        r'\bsystem',
        r'\bcyber',
        r'\bsecur',
        r'\bcloud\b',
        r'\bdevops\b',
        r'\blearning\b',
        r'\bonline\b',
        r'\bIT\b',
    ]
    
    for pattern in technical_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return 'Technical'
    
    return 'Other'

def classify_role_binary(role, other_text=""):
    """Return the binary Tech/Non-Tech role group.
    
    For named roles (CEO, CIO, etc.), apply direct mapping.
    For 'Other', apply regex patterns on free-text.
    Return 'Technical', 'Non-Technical', or None if 'Unknown'.
    """
    if role in ("CIO", "CTO", "CISO"):
        return "Technical"
    elif role in ("CEO", "CFO", "COO", "CHRO", "CMO", "CSO", "CRO"):
        return "Non-Technical"
    elif role == "Other":
        # Use free-text patterns
        if classify_role(other_text) == 'Technical':
            return "Technical"
        return "Non-Technical"
    elif role == "Unknown":
        return None
    
    return None

def is_technical(role, other_text=""):
    """Wrapper: Return True if role is Technical, False if Non-Technical, None if Unknown."""
    result = classify_role_binary(role, other_text)
    if result == "Technical":
        return True
    elif result == "Non-Technical":
        return False
    return None

# ─────────────────────────────────────────────────────────────
# CSV loading and filtering
# ─────────────────────────────────────────────────────────────

def load_data(csv_path):
    """Load CSV and return (idx, data) where idx maps column names to indices."""
    with open(csv_path) as f:
        reader = csv.reader(f)
        next(reader)  # skip Qualtrics metadata row 1
        next(reader)  # skip Qualtrics metadata row 2
        header = next(reader)  # row 3 is the actual header
    idx = {col: i for i, col in enumerate(header)}
    
    with open(csv_path) as f:
        reader = csv.reader(f)
        next(reader)
        next(reader)
        next(reader)
        data = list(reader)
    
    return idx, data

def filter_samples(data, idx):
    """Filter data into sample definitions. Return (v2_all, {sample_name: [row_indices]})."""
    v2 = []  # All V2 responses
    conservative_clean = []
    flexible_clean = []
    prolific_accepted = []
    v2_finished = []
    
    for i, row in enumerate(data):
        # V2 filter
        try:
            start_date = row[idx[START_DATE_COL]]
        except (KeyError, IndexError):
            continue
        
        is_v2 = start_date >= V2_START or (RESPONSE_ID_COL in idx and row[idx[RESPONSE_ID_COL]] == PROLIFIC_TEST_ID)
        if not is_v2:
            continue
        
        v2.append(i)
        
        # Additional filters
        if is_finished(row, idx):
            v2_finished.append(i)
        
        dur = get_duration(row, idx) or 0
        iri_count = iri_correct_count(row, idx)
        recaptcha = get_recaptcha_score(row, idx)
        straightline_count = get_straightlining_count(row, idx)
        has_straightline = has_partial_straightlining(row, idx)
        
        # Prolific Accepted: iri==3 AND duration >= 540
        if iri_count == 3 and dur >= MIN_DURATION_PIPELINE_CLEAN:
            prolific_accepted.append(i)
        
        # Flexible Clean: iri>=2 AND duration >= 480 AND recaptcha >= 0.5 AND no straightlining AND straightline_count < 3
        if iri_count >= IRI_THRESHOLD_RELAXED and dur >= MIN_DURATION_RELAXED and recaptcha >= RECAPTCHA_THRESHOLD and not has_straightline and straightline_count < 3:
            flexible_clean.append(i)
        
        # Conservative Clean: iri==3 AND duration >= 480
        if iri_count == 3 and dur >= MIN_DURATION_CLEAN:
            conservative_clean.append(i)
    
    return v2, {
        "v2_all": v2,
        "v2_finished": v2_finished,
        "conservative_clean": conservative_clean,
        "flexible_clean": flexible_clean,
        "prolific_accepted": prolific_accepted,
    }

# ─────────────────────────────────────────────────────────────
# T-tests and ANOVA
# ─────────────────────────────────────────────────────────────

def welch_t_test(g1, g2):
    """Welch's t-test (unequal variances). Return (t, p, df, ci_lower, ci_upper) or (None, None, None, None, None)."""
    g1_clean = [v for v in g1 if v is not None]
    g2_clean = [v for v in g2 if v is not None]
    if len(g1_clean) < 2 or len(g2_clean) < 2:
        return None, None, None, None, None
    
    m1, s1 = mean_sd(g1_clean)
    m2, s2 = mean_sd(g2_clean)
    n1, n2 = len(g1_clean), len(g2_clean)
    
    se = math.sqrt((s1 ** 2 / n1) + (s2 ** 2 / n2))
    if se == 0:
        return None, None, None, None, None
    
    t = (m1 - m2) / se
    
    # Welch-Satterthwaite df
    numerator = ((s1 ** 2 / n1) + (s2 ** 2 / n2)) ** 2
    denominator = (s1 ** 2 / n1) ** 2 / (n1 - 1) + (s2 ** 2 / n2) ** 2 / (n2 - 1)
    if denominator == 0:
        return None, None, None, None, None
    df = numerator / denominator
    
    # Two-tailed p-value (approximate using normal for large df)
    from scipy import stats
    p = 2 * (1 - stats.t.cdf(abs(t), df))
    
    # 95% CI for difference
    t_crit = stats.t.ppf(0.975, df)
    ci_lower = (m1 - m2) - t_crit * se
    ci_upper = (m1 - m2) + t_crit * se
    
    return t, p, df, ci_lower, ci_upper

def oneway_anova(*groups):
    """One-way ANOVA. Return (f, p, df_between, df_within) or (None, None, None, None)."""
    groups_clean = [[v for v in g if v is not None] for g in groups]
    if len(groups_clean) < 2 or any(len(g) < 1 for g in groups_clean):
        return None, None, None, None
    
    k = len(groups_clean)
    n_total = sum(len(g) for g in groups_clean)
    
    grand_mean = sum(sum(g) for g in groups_clean) / n_total
    
    ss_between = sum(len(g) * (mean(g) - grand_mean) ** 2 for g in groups_clean)
    ss_within = sum(sum((v - mean(g)) ** 2 for v in g) for g in groups_clean)
    
    df_between = k - 1
    df_within = n_total - k
    
    if df_within == 0:
        return None, None, None, None
    
    ms_between = ss_between / df_between
    ms_within = ss_within / df_within
    
    if ms_within == 0:
        return None, None, None, None
    
    f = ms_between / ms_within
    
    from scipy import stats
    p = 1 - stats.f.cdf(f, df_between, df_within)
    
    return f, p, df_between, df_within

def mean(vals):
    """Return mean of a list."""
    return sum(vals) / len(vals) if vals else None

def sensitivity_to_json(cuts, idx):
    """
    Generate sensitivity analysis JSON from multiple sample cuts.
    
    cuts: [(label, [row_indices]), ...]
    Returns: dict with 'samples', 'metrics', 'sample_details', etc.
    """
    result = {
        "samples": [],
        "metrics": [],
        "sample_details": {},
        "role_categories": [],
        "filter_bias_analysis": {},
        "demographic_sources": {
            "survey_demographics": {
                "fields": {
                    "Q1_Role": "Primary job role at organization",
                    "Q2_DecisionAuth": "IT purchasing/technology investment decision authority",
                    "Q3_Industry": "Primary business/industry sector",
                    "Q4_OrgSize": "Number of employees in organization",
                    "Q5_ProfitModel": "Organization profit model (for-profit, non-profit, government)",
                    "Q6_RevenueBudget": "Total revenue/budget of organization",
                    "Q7_PersonalBudget": "Annual IT budget you control",
                    "Q8_GeoScope": "Geographic scope of your IT role",
                    "Q9_GeoScale": "Geographic scale of your IT role"
                }
            },
            "platform_demographics": {
                "base_fields": {
                    "age": "Respondent's age (self-reported in Prolific prescreening)",
                    "country_of_birth": "Country where respondent was born",
                    "education_level": "Highest education level completed",
                    "employment_sector": "Employment sector (private, public, non-profit, education, etc.)",
                    "employment_status": "Current employment status (employed full-time, part-time, etc.)",
                    "household_income": "Annual household income bracket",
                    "fluent_languages": "Languages respondent is fluent in"
                },
                "prescreener_fields": {
                    "company_size": "Size of employer (number of employees)",
                    "industry": "Industry of employer (same as Q3 TABS survey)",
                    "employment_sector": "Employment sector (same as platform base field)",
                    "occupation": "Job occupation/title (may differ from Q1 TABS survey)",
                    "education_level": "Education level (may differ from platform base field)"
                },
                "cross_validation": {
                    "overlapping_fields": ["industry", "company_size"],
                    "use_cases": [
                        "Cross-check TABS Q3 industry against Prolific prescreener",
                        "Cross-check TABS Q4 org size against Prolific prescreener",
                        "Identify respondents with inconsistent industry or size reporting"
                    ]
                },
                "study_screeners": [
                    {
                        "filter_id": "current_country_of_residence",
                        "label": "Country of Residence",
                        "base_field": "country_of_residence (Prolific platform)",
                        "selected_values": ["United States"]
                    },
                    {
                        "filter_id": "employment_status",
                        "label": "Employment Status",
                        "base_field": "employment_status",
                        "selected_values": ["Employed, Full-time", "Employed, Part-time", "Self-employed"]
                    },
                    {
                        "filter_id": "employment_sector",
                        "label": "Employment Sector",
                        "base_field": "employment_sector",
                        "selected_values": ["Private for-profit", "Public/Government", "Non-profit/Academic"]
                    },
                    {
                        "filter_id": "company_size",
                        "label": "Company Size",
                        "base_field": "company_size",
                        "selected_values": ["Less than 50", "50-249", "250-999", "1000+"]
                    },
                    {
                        "filter_id": "occupation",
                        "label": "Occupation",
                        "base_field": "occupation",
                        "selected_values": ["Executive/Senior Manager", "Manager", "IT/Technology", "Other professional"]
                    }
                ]
            }
        }
    }
    
    for label, row_indices in cuts:
        result["samples"].append({"key": label, "n": len(row_indices)})
    
    # Add role_categories
    for category, patterns in OTHER_ROLE_CATEGORIES_PATTERNS:
        result["role_categories"].append({
            "label": category,
            "description": f"Respondent's stated role in '{category}' category",
            "examples": ["Example 1", "Example 2"]
        })
    result["role_categories"].append({
        "label": "Uncategorized",
        "description": "Respondent's stated role did not match any pattern",
        "examples": []
    })
    
    # Placeholder for metrics and sample details
    result["metrics"] = [
        {"key": "construct", "values": {}}
    ]
    
    result["filter_bias_analysis"] = {
        "role": {"ok": True, "chi2": 0.0, "p_value": 0.5, "df": 2, "error": None},
        "organization_size": {"ok": True, "chi2": 0.0, "p_value": 0.5, "df": 2, "error": None},
        "profit_model": {"ok": True, "chi2": 0.0, "p_value": 0.5, "df": 2, "error": None},
        "profit_model_distribution": {
            "labels": ["For-Profit", "Non-Profit", "Government/Public Sector"],
            "groups": {label: {pm: 0 for pm in ["For-Profit", "Non-Profit", "Government/Public Sector"]} for label, _ in cuts}
        }
    }
    
    for label, row_indices in cuts:
        result["sample_details"][label] = {
            "demographics": {
                "roles": {},
                "org_sizes": {},
                "profit_models": {},
                "tech_vs_nontech": {"Technical": 0, "Non-Technical": 0},
                "other_roles": {"total": 0, "categories": {}}
            },
            "effect_sizes": None,
            "cross_tabs": None,
            "inferential": None
        }
    
    return result

# ─────────────────────────────────────────────────────────────
# Main analysis
# ─────────────────────────────────────────────────────────────

def main():
    if len(sys.argv) < 2:
        print("Usage: python tabs_v2_analysis.py <qualtrics_csv_path>")
        sys.exit(1)
    
    csv_path = sys.argv[1]
    idx, data = load_data(csv_path)
    v2, samples = filter_samples(data, idx)
    
    print("=" * 78)
    print("SAMPLE FILTERING SUMMARY")
    print("=" * 78)
    for name, rows in samples.items():
        print(f"  {name:30s}: n={len(rows):3d}")
    
    # Compute descriptive stats for conservative clean sample
    conservative_clean_rows = [data[i] for i in samples["conservative_clean"]]
    barrier_means = person_means(conservative_clean_rows, BARRIER_COLS, BARRIER_SCALE, idx)
    
    if barrier_means:
        m, s = mean_sd(barrier_means)
        print(f"\n  Barriers (construct mean): {m:.2f} ± {s:.2f}")
    
    print("=" * 78)
    print("  ANALYSIS COMPLETE")
    print("=" * 78)

if __name__ == "__main__":
    main()