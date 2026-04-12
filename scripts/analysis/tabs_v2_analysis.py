#!/usr/bin/env python3
"""Analysis functions for the TABS V2 Culminating Research Project.

Key statistical and psychometric computations for the Technology Adoption
Barriers Survey, including reliability, validity, hypothesis testing, and
sensitivity analysis across sample cuts.
"""

import csv
import json
from collections import Counter, defaultdict
from dataclasses import dataclass, asdict
from pathlib import Path


# ── SCALE CONSTANTS ──────────────────────────────────────────

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

# Construct column names (19 barrier items + IRI)
BARRIER_COLS = [f"Q10-28_Barriers_{i}" for i in range(1, 19)] + ["Q10-28_Barriers_19"]
READINESS_COLS = [f"Q47-64_Readiness_{i}" for i in range(1, 18)] + ["Q47-64_Readiness_18"]
MATURITY_COLS = [f"Q65-73_Maturity_{i}" for i in range(1, 8)] + ["Q65-73_Maturity_9"]

# IRI column identifiers (the "attention check" items)
BARRIER_IRI = "Q10-28_Barriers_19"
READINESS_IRI = "Q47-64_Readiness_18"
MATURITY_IRI = "Q65-73_Maturity_9"

# IRI expected answers
BARRIER_IRI_ANSWER = "Major Barrier"
READINESS_IRI_ANSWER = "Low Readiness/Capability"
MATURITY_IRI_ANSWER = "Level 2: Developing/Repeatable"

# ── ROLE CLASSIFICATION ──────────────────────────────────────

# Role mapping: long Q1_Role values -> short role labels (primary role classification)
ROLE_MAP = {
    "CIO (e.g., Director of IT)": "CIO",
    "CTO (e.g., VP of Engineering)": "CTO",
    "CISO (e.g., Director of Cybersecurity, Chief Security Officer)": "CISO",
    "Other C-Suite (e.g., CFO, COO, CMO)": "Other C-Suite",
    "VP (e.g., VP of Business Operations, VP of Technology)": "VP",
    "Director (e.g., Director of IT Operations, Director of Strategy)": "Director",
    "Manager (e.g., IT Manager, Operations Manager)": "Manager",
    "Individual Contributor (e.g., Analyst, Engineer)": "Individual Contributor",
    "Business/Functional Analyst": "Business/Functional Analyst",
    "Business Consultant": "Business Consultant",
    "Board Member": "Board Member",
    "Researcher": "Researcher",
    "Other (please specify)": "Other",
}

# Pattern-based classification for "Other (please specify)" free-text: map patterns to category labels.
# Used by categorize_other_role() to sort free-text into named buckets for analysis.
# When multiple patterns match, the first category in this list "wins" (first-match semantics).
OTHER_ROLE_CATEGORIES_PATTERNS = [
    ("C-Suite Adjacent", [
        r"\bchief\b", r"\bCDO\b", r"\bCPO\b", r"\bCAO\b", r"\bCLO\b",
        r"\bCDIO\b", r"\bCAIO\b", r"\bCXO\b", r"\bCCO\b",
    ]),
    ("VP / SVP", [
        r"\bVP\b", r"\bvice president\b", r"\bSVP\b", r"\bEVP\b", r"\bAVP\b",
    ]),
    ("Director", [
        r"\bdirector\b",
    ]),
    ("Manager / Program Lead", [
        r"\bmanager\b", r"\bteam lead\b", r"\bleadership\b", r"\bsupervisor\b",
    ]),
    ("Owner / Founder / President", [
        r"\b(owner|founder|president|partner|principal|proprietor)\b",
    ]),
    ("Technical Specialist", [
        r"\b(engineer|developer|architect|analyst|consultant|technologist|technology)\b",
    ]),
    ("Other Functional Role", [
        r"\b(operations|finance|accounting|procurement|marketing|communications|sales|"
        r"hr|human resources|people|product|program|project|support|customer success|"
        r"research|data|security|compliance|legal)\b",
    ]),
]

# Patterns for classify_role(): more-specific technical keyword patterns checked FIRST.
# Broader patterns added later to catch roles with partial keyword matches.
# Ordered list of (regex_pattern, classification) pairs for classify_role().
# More-specific patterns (e.g. "Vice President of Engineering") MUST come before
# the broader catch-all for the same prefix (e.g. "Vice President") to avoid
# false positives: "VP of Engineering" should match as Technical, not Non-Technical.
ROLE_CLASSIFICATION_PATTERNS = [
    (r"(?:Vice President|VP|SVP|EVP) of (Engineering|Technology|Product|Analytics)", "Technical"),
    (r"\b(CIO|CTO|CISO|Chief (Information|Technology|Digital|Data|Security|Analytics))\b", "Technical"),
    (r"\b(Software|Solutions|Data|Systems|Infrastructure|Network|Cloud|IT|Cybersecurity|Security|Information) "
     r"(Engineer|Developer|Architect|Manager|Director|Officer)\b", "Technical"),
    (r"\b(Data Scientist|ML Engineer|Artificial Intelligence|Machine Learning|Analytics|Analytics Manager)\b", "Technical"),
    (r"\b(VP|Vice President|Senior) of (IT|Technology|Engineering|Analytics|Data)\b", "Technical"),
    (r"\b(IT Manager|Systems Administrator|Network Administrator|Database Administrator)\b", "Technical"),
    (r"\bChief (Technology|Data|Information|Digital|Analytics) Officer\b", "Technical"),
    (r"\b(Head of Technology|Head of Engineering|Technology Lead|Engineering Lead|Lead Architect)\b", "Technical"),
    (r"\b(Online Learning|E-Learning|Learning Management|eLearning|Digital Learning)\b", "Technical"),
    # Note: "Online Learning" and similar terms can be technical due to edtech platform expertise
]

# Binary tech/non-tech role classification for "Other (please specify)" free-text roles.
# Maps normalized keywords to classification bucket ("Technical" or "Non-Technical").
# Ordered list of (regex_pattern, classification) pairs for classify_role().
# More-specific patterns (e.g. "Vice President of Engineering") MUST come before
# the broader catch-all for the same prefix (e.g. "Vice President") to avoid
# false positives: "VP of Engineering" should match as Technical, not Non-Technical.
TECHNICAL_KEYWORDS = [
    # UPPERCASE matches MUST appear first to avoid case-insensitive false positives
    # e.g. "IT" must match the acronym, not the word "it" in "it's complicated"
    r"\bIT\b",  # uppercase "IT" only (e.g., "IT Specialist")
    r"(infrastructure|network|systems|security|cybersecurity|cloud|data|analytics|"
    r"ai|artificial intelligence|machine learning|engineering|architect|developer|"
    r"programmer|database|it operations|itops|devops|sre|platform|technology|"
    r"software|hardware|application|it support|it manager|it director|information "
    r"technology|digital|online learning)",
]


# ── STATISTICAL FUNCTIONS ───────────────────────────────────


def mean_sd(values):
    """Compute mean and standard deviation, filtering None values."""
    filtered = [v for v in values if v is not None]
    if not filtered:
        return None, None
    n = len(filtered)
    if n == 0:
        return None, None
    mean_val = sum(filtered) / n
    if n == 1:
        return mean_val, 0.0
    variance = sum((v - mean_val) ** 2 for v in filtered) / (n - 1)
    sd = variance ** 0.5
    return mean_val, sd


def pearson_r(x_values, y_values):
    """Compute Pearson correlation coefficient, filtering None pairs."""
    pairs = [(x, y) for x, y in zip(x_values, y_values) if x is not None and y is not None]
    if len(pairs) < 3:
        return None
    xs = [p[0] for p in pairs]
    ys = [p[1] for p in pairs]
    x_mean, x_sd = mean_sd(xs)
    y_mean, y_sd = mean_sd(ys)
    if x_sd == 0 or y_sd == 0:
        return None
    cov = sum((xs[i] - x_mean) * (ys[i] - y_mean) for i in range(len(pairs))) / (len(pairs) - 1)
    r = cov / (x_sd * y_sd)
    return r


def cohens_d(g1, g2):
    """Compute Cohen's d effect size and 95% CI for two groups."""
    m1, s1 = mean_sd(g1)
    m2, s2 = mean_sd(g2)
    if m1 is None or m2 is None:
        return None, None, None
    n1 = len([v for v in g1 if v is not None])
    n2 = len([v for v in g2 if v is not None])
    if n1 < 2 or n2 < 2:
        return None, None, None
    pooled_sd_sq = ((n1 - 1) * s1 ** 2 + (n2 - 1) * s2 ** 2) / (n1 + n2 - 2)
    pooled_sd = pooled_sd_sq ** 0.5
    if pooled_sd == 0:
        return None, None, None
    d = (m1 - m2) / pooled_sd
    se = (pooled_sd_sq * (1 / n1 + 1 / n2)) ** 0.5
    # CI ± 1.96 * SE
    ci_lower = d - 1.96 * se
    ci_upper = d + 1.96 * se
    return d, ci_lower, ci_upper


def cronbach_alpha(rows, items, scale, idx):
    """Compute Cronbach's alpha for a scale given rows, item list, and index."""
    if len(items) < 2:
        return None
    # Convert rows to numeric scores
    scores = []
    for row in rows:
        item_scores = []
        for item in items:
            val = row[idx[item]]
            if val in scale:
                item_scores.append(scale[val])
        if len(item_scores) == len(items):  # all items present
            scores.append(item_scores)
    if len(scores) < 2:
        return None
    k = len(items)
    item_vars = []
    for j in range(k):
        item_vals = [s[j] for s in scores]
        _, var = mean_sd(item_vals)
        if var is None:
            var = 0
        item_vars.append(var)
    sum_item_vars = sum(item_vars)
    # Total variance
    all_vals = [val for score in scores for val in score]
    _, total_var = mean_sd(all_vals)
    if total_var is None or total_var == 0:
        return None
    alpha = (k / (k - 1)) * (1 - sum_item_vars / total_var)
    return alpha


def skewness(values):
    """Compute skewness (third standardized moment)."""
    filtered = [v for v in values if v is not None]
    if len(filtered) < 3:
        return None
    m, s = mean_sd(filtered)
    if m is None or s == 0:
        return None
    n = len(filtered)
    m3 = sum((v - m) ** 3 for v in filtered) / n
    skew = m3 / (s ** 3)
    return skew


def kurtosis_excess(values):
    """Compute excess kurtosis (fourth standardized moment - 3)."""
    filtered = [v for v in values if v is not None]
    if len(filtered) < 4:
        return None
    m, s = mean_sd(filtered)
    if m is None or s == 0:
        return None
    n = len(filtered)
    m4 = sum((v - m) ** 4 for v in filtered) / n
    kurt = m4 / (s ** 4) - 3
    return kurt


def score(row, col, scale, idx):
    """Retrieve and convert a response to a numeric score."""
    val = row[idx[col]]
    if val in scale:
        return scale[val]
    return None


def get_duration(row, idx):
    """Get duration in seconds."""
    col = "Duration (in seconds)"
    if col not in idx:
        return None
    try:
        return int(float(row[idx[col]]))
    except (ValueError, IndexError):
        return None


def iri_correct_count(row, idx):
    """Count correct IRI (attention check) answers across all three scales."""
    count = 0
    checks = [
        (BARRIER_IRI, BARRIER_IRI_ANSWER),
        (READINESS_IRI, READINESS_IRI_ANSWER),
        (MATURITY_IRI, MATURITY_IRI_ANSWER),
    ]
    for col, expected_answer in checks:
        if col in idx:
            actual = row[idx[col]]
            if actual == expected_answer:
                count += 1
    return count


def iri_all_pass(row, idx):
    """Check if all three IRI (attention check) answers are correct."""
    return iri_correct_count(row, idx) == 3


def person_means(row, cols, scale, idx):
    """Compute a person's mean score across items in cols."""
    scores = [score(row, col, scale, idx) for col in cols]
    scores = [s for s in scores if s is not None]
    if not scores:
        return None
    return sum(scores) / len(scores)


def get_recaptcha_score(row, idx):
    """Get reCAPTCHA score (0.0-1.0), default 1.0 if missing."""
    col = "Q_RecaptchaScore"
    if col not in idx:
        return 1.0
    try:
        score_val = float(row[idx[col]])
        return score_val
    except (ValueError, IndexError):
        return 1.0


def get_straightlining_count(row, idx):
    """Get the straightlining count (number of consecutive identical responses)."""
    col = "Q_StraightliningCount"
    if col not in idx:
        return 0
    try:
        return int(row[idx[col]])
    except (ValueError, IndexError):
        return 0


def is_finished(row, idx):
    """Check if survey is marked as Finished."""
    col = "Finished"
    if col not in idx:
        return True  # legacy: missing column defaults to True
    val = row[idx[col]]
    return val.upper() in ("TRUE", "1")


def get_role(row, idx):
    """Get the short role label from the long Q1_Role value."""
    col = "Q1_Role"
    if col not in idx:
        return "Unknown"
    val = row[idx[col]]
    return ROLE_MAP.get(val, "Unknown")


def org_bucket(row, idx):
    """Convert Q4_OrgSize to a bucket label."""
    col = "Q4_OrgSize"
    if col not in idx:
        return None
    val = row[idx[col]]
    if val in ("<100", "100-499"):
        return "Small (<500)"
    elif val in ("500-999", "1000-4999"):
        return "Medium (500-4999)"
    elif val in ("5000-9999", "10000+"):
        return "Large (5000+)"
    return None


def within_person_sd(responses):
    """Compute within-person SD across a respondent's item responses.

    Filters empty strings and None, so heterogeneous response patterns
    yield high SD and homogeneous patterns (straightlining) yield low SD.
    """
    filtered = [r for r in responses if r and r.strip()]
    if len(filtered) < 2:
        return float("nan")
    # Convert to numeric: map each unique response to an integer ID
    # (this lets us compute SD on categorical data)
    unique_resp = list(set(filtered))
    resp_to_id = {r: i for i, r in enumerate(unique_resp)}
    numeric = [float(resp_to_id[r]) for r in filtered]
    _, sd = mean_sd(numeric)
    return sd if sd is not None else float("nan")


def has_partial_straightlining(row, idx):
    """Check if a respondent straightlined on any construct (all items identical within a scale).

    A respondent shows partial straightlining if within-person SD is 0 on
    any one construct (barriers, readiness, or maturity). This is a red flag
    for low data quality.
    """
    constructs = [
        ("Barriers", BARRIER_COLS),
        ("Readiness", READINESS_COLS),
        ("Maturity", MATURITY_COLS),
    ]
    for name, cols in constructs:
        responses = [row[idx[col]] for col in cols if col in idx]
        sd = within_person_sd(responses)
        if not (sd is not None):  # NaN check
            continue
        if sd == 0:
            return True  # Straightlined on this construct
    return False


# ── ROLE CLASSIFICATION: FREE-TEXT PARSING ──────────────────

def categorize_other_role(text):
    """Classify free-text 'Other (please specify)' role into a named category.

    Uses pattern matching on OTHER_ROLE_CATEGORIES_PATTERNS. The first matching
    category is returned; if no match, returns 'Uncategorized'.
    """
    if not text or not text.strip():
        return "Uncategorized"
    text_lower = text.lower()
    for category, patterns in OTHER_ROLE_CATEGORIES_PATTERNS:
        for pattern in patterns:
            if pattern in patterns and pattern.startswith(r"\b"):
                # Use case-insensitive word boundary matching
                import re
                if re.search(pattern, text_lower):
                    return category
            else:
                if pattern.lower() in text_lower:
                    return category
    return "Uncategorized"


def classify_role(free_text):
    """Classify free-text role (from 'Other' field) as Technical or Non-Technical.

    Returns 'Technical' if any ROLE_CLASSIFICATION_PATTERNS pattern matches;
    otherwise returns 'Other' (unmatched).
    """
    if not free_text or not free_text.strip():
        return "Other"
    import re
    for pattern, classification in ROLE_CLASSIFICATION_PATTERNS:
        if re.search(pattern, free_text, re.IGNORECASE):
            return classification
    return "Other"


def classify_role_binary(role, free_text=""):
    """Return the binary Tech/Non-Tech role group for a respondent.

    For fixed roles (CIO, CTO, CISO, CEO, etc.), returns Tech or Non-Tech.
    For "Other", classifies based on free-text patterns; defaults to Non-Tech if unmatched.
    Returns None if role is not recognized.
    """
    if role not in ROLE_MAP.values() and role != "Unknown":
        return None

    if role in ("CIO", "CTO", "CISO"):
        return "Technical"
    elif role in ("CEO", "CFO", "COO", "CHRO", "CMO", "CSO", "CRO"):
        return "Non-Technical"
    elif role == "Other":
        classified = classify_role(free_text)
        if classified == "Technical":
            return "Technical"
        else:
            return "Non-Technical"
    else:
        # Other roles default to Non-Technical
        return "Non-Technical"


def is_technical(role, free_text=""):
    """Return True if role maps to the Technical group under the binary classification.

    Helper for binary role classification. Used in sensitivity analysis and
    demographic breakdowns.
    """
    return classify_role_binary(role, free_text) == "Technical"


# ── LOAD AND PARSE DATA ──────────────────────────────────────

def load_data(csv_path):
    """Load CSV data and return (index_dict, data_list)."""
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader)
        idx = {col: i for i, col in enumerate(header)}
        data = list(reader)
    return idx, data


def filter_samples(data, idx):
    """Partition data into multiple analytic samples with increasing strictness.

    Returns (v2_rows, samples_dict) where v2_rows are all V2 rows and
    samples_dict contains keyed samples for sensitivity analysis:
      - conservative_clean: strict quality, ≥480s duration, all 3 IRIs correct
      - flexible_clean: less strict, ≥120s, straightlining check, some IRIs OK
      - prolific_accepted: any V2 row marked Status="Approved" on Prolific
      - v2_finished: all V2 rows with Finished="TRUE"
      - v2_all: all V2 rows regardless of status
    """
    # V2 filter: StartDate >= '2026-03-23 14:00:00' OR explicit inclusion of live test
    v2_start = "2026-03-23 14:00:00"
    explicit_inclusion = "R_1QK12IJpHjC3wd6"
    start_date_col = "StartDate"
    response_id_col = "ResponseId"

    v2_rows = []
    if start_date_col in idx:
        for i, row in enumerate(data):
            start_date = row[idx[start_date_col]]
            resp_id = row[idx[response_id_col]] if response_id_col in idx else ""
            if start_date >= v2_start or resp_id == explicit_inclusion:
                v2_rows.append((i, row))

    # Parse quality signals
    samples = {
        "conservative_clean": [],
        "flexible_clean": [],
        "prolific_accepted": [],
        "v2_finished": [],
        "v2_all": v2_rows,
    }

    for row_idx, row in v2_rows:
        duration = get_duration(row, idx)
        has_straightline = has_partial_straightlining(row, idx)
        all_iris = iri_all_pass(row, idx)
        iri_count = iri_correct_count(row, idx)
        is_fin = is_finished(row, idx)
        status_col = "Status"
        status = row[idx[status_col]] if status_col in idx else ""

        # conservative_clean: ≥480s, all 3 IRIs correct
        if duration is not None and duration >= 480 and all_iris:
            samples["conservative_clean"].append((row_idx, row))

        # flexible_clean: ≥120s, no straightlining, ≥2 IRIs correct
        if duration is not None and duration >= 120 and not has_straightline and iri_count >= 2:
            samples["flexible_clean"].append((row_idx, row))

        # prolific_accepted: Status == "Approved"
        if status == "Approved":
            samples["prolific_accepted"].append((row_idx, row))

        # v2_finished: Finished == "TRUE"
        if is_fin:
            samples["v2_finished"].append((row_idx, row))

    return v2_rows, samples


# ── ANALYSIS HELPERS ─────────────────────────────────────────

@dataclass
class ConstructMeans:
    construct: str
    mean: float
    sd: float
    cronbach_alpha: float
    n_items: int
    n_respondents: int


def construct_analysis(sample_rows, idx):
    """Compute construct means, SDs, and alphas for a sample."""
    constructs_def = [
        ("Barriers", BARRIER_COLS, BARRIER_SCALE),
        ("Readiness", READINESS_COLS, READINESS_SCALE),
        ("Maturity", MATURITY_COLS, MATURITY_SCALE),
    ]
    results = []
    for name, cols, scale in constructs_def:
        person_means_list = []
        for _, row in sample_rows:
            pm = person_means(row, cols, scale, idx)
            if pm is not None:
                person_means_list.append(pm)
        if person_means_list:
            m, s = mean_sd(person_means_list)
            alpha = cronbach_alpha([row for _, row in sample_rows], cols, scale, idx)
            results.append(
                ConstructMeans(
                    construct=name,
                    mean=m,
                    sd=s,
                    cronbach_alpha=alpha if alpha is not None else 0,
                    n_items=len(cols),
                    n_respondents=len(person_means_list),
                )
            )
    return results


def welch_t_test(g1, g2):
    """Welch's t-test (does not assume equal variances)."""
    g1_filtered = [v for v in g1 if v is not None]
    g2_filtered = [v for v in g2 if v is not None]
    if len(g1_filtered) < 2 or len(g2_filtered) < 2:
        return None, None, None, None, None
    m1, s1 = mean_sd(g1_filtered)
    m2, s2 = mean_sd(g2_filtered)
    n1, n2 = len(g1_filtered), len(g2_filtered)
    if s1 == 0 and s2 == 0:
        return None, None, None, None, None
    var1, var2 = s1 ** 2, s2 ** 2
    t = (m1 - m2) / ((var1 / n1 + var2 / n2) ** 0.5)
    # Welch-Satterthwaite DF
    num = (var1 / n1 + var2 / n2) ** 2
    den = (var1 / n1) ** 2 / (n1 - 1) + (var2 / n2) ** 2 / (n2 - 1)
    df = num / den if den > 0 else n1 + n2 - 2
    # Two-tailed p-value (rough approximation via t-dist)
    from math import erf
    p = 1 - (2 * (1 + erf(abs(t) / (2 ** 0.5))) / 2 - 1)
    # CI ± 1.96 * SE
    se = (var1 / n1 + var2 / n2) ** 0.5
    ci_lower = (m1 - m2) - 1.96 * se
    ci_upper = (m1 - m2) + 1.96 * se
    return t, p, df, ci_lower, ci_upper


def oneway_anova(*groups):
    """One-way ANOVA across groups."""
    filtered_groups = []
    for g in groups:
        fg = [v for v in g if v is not None]
        if fg:
            filtered_groups.append(fg)
    if len(filtered_groups) < 2:
        return None, None, None, None
    k = len(filtered_groups)
    n_total = sum(len(g) for g in filtered_groups)
    grand_mean = sum(sum(g) for g in filtered_groups) / n_total
    # Between-group SS
    ss_between = sum(len(g) * (mean_sd(g)[0] - grand_mean) ** 2 for g in filtered_groups)
    # Within-group SS
    ss_within = sum(
        sum((x - mean_sd(g)[0]) ** 2 for x in g) for g in filtered_groups
    )
    df_between = k - 1
    df_within = n_total - k
    if df_between == 0 or df_within == 0:
        return None, None, None, None
    ms_between = ss_between / df_between
    ms_within = ss_within / df_within
    if ms_within == 0:
        return None, None, None, None
    f = ms_between / ms_within
    # p-value (approximation)
    from math import erf
    p = 1 - (2 * (1 + erf(f / (2 ** 0.5))) / 2 - 1)
    return f, p, df_between, df_within


# ── SAMPLE DISPOSITION & QUALITY SCORING ─────────────────────

@dataclass
class DispositionRow:
    stage: str
    filter_name: str
    count: int
    cumulative: int
    pct_total: float
    pct_of_previous: float


def disposition_funnel(data, idx):
    """Compute the disposition funnel (how many rows pass each quality filter)."""
    v2_filter = "V2 (StartDate >= 2026-03-23)"
    finished = "Finished = TRUE"
    duration_480 = "Duration >= 480s"
    iri_all = "All 3 IRIs Correct"

    v2_start = "2026-03-23 14:00:00"
    explicit_inclusion = "R_1QK12IJpHjC3wd6"

    n_v2 = 0
    n_fin = 0
    n_dur = 0
    n_iri = 0
    n_total = len(data)

    for row in data:
        start_date = row[idx["StartDate"]] if "StartDate" in idx else ""
        resp_id = row[idx["ResponseId"]] if "ResponseId" in idx else ""
        is_v2 = start_date >= v2_start or resp_id == explicit_inclusion
        if is_v2:
            n_v2 += 1
            is_fin = is_finished(row, idx)
            if is_fin:
                n_fin += 1
                duration = get_duration(row, idx)
                if duration is not None and duration >= 480:
                    n_dur += 1
                    if iri_all_pass(row, idx):
                        n_iri += 1

    # Build disposition rows
    disposition = [
        DispositionRow(
            stage="Intake",
            filter_name="All Responses",
            count=n_total,
            cumulative=n_total,
            pct_total=100.0,
            pct_of_previous=100.0,
        ),
        DispositionRow(
            stage="Filter 1",
            filter_name=v2_filter,
            count=n_v2,
            cumulative=n_v2,
            pct_total=round(100 * n_v2 / n_total, 1) if n_total > 0 else 0,
            pct_of_previous=round(100 * n_v2 / n_total, 1) if n_total > 0 else 0,
        ),
        DispositionRow(
            stage="Filter 2",
            filter_name=finished,
            count=n_fin,
            cumulative=n_fin,
            pct_total=round(100 * n_fin / n_total, 1) if n_total > 0 else 0,
            pct_of_previous=round(100 * n_fin / n_v2, 1) if n_v2 > 0 else 0,
        ),
        DispositionRow(
            stage="Filter 3",
            filter_name=duration_480,
            count=n_dur,
            cumulative=n_dur,
            pct_total=round(100 * n_dur / n_total, 1) if n_total > 0 else 0,
            pct_of_previous=round(100 * n_dur / n_fin, 1) if n_fin > 0 else 0,
        ),
        DispositionRow(
            stage="Filter 4",
            filter_name=iri_all,
            count=n_iri,
            cumulative=n_iri,
            pct_total=round(100 * n_iri / n_total, 1) if n_total > 0 else 0,
            pct_of_previous=round(100 * n_iri / n_dur, 1) if n_dur > 0 else 0,
        ),
    ]
    return disposition


def quality_score_row(row, idx):
    """Assign a quality score (0-5) based on data quality signals."""
    score_val = 5
    if not is_finished(row, idx):
        score_val -= 1
    duration = get_duration(row, idx)
    if duration is None or duration < 120:
        score_val -= 1
    elif duration < 300:
        score_val -= 0.5
    if has_partial_straightlining(row, idx):
        score_val -= 1
    iri_count = iri_correct_count(row, idx)
    if iri_count < 2:
        score_val -= 1
    recaptcha = get_recaptcha_score(row, idx)
    if recaptcha < 0.3:
        score_val -= 1
    return max(0, score_val)


# ── ROLE & DEMOGRAPHIC ANALYSIS ──────────────────────────────

def role_counts(sample_rows, idx):
    """Count responses by role classification."""
    tech_count = 0
    nontech_count = 0
    unknown_count = 0

    for _, row in sample_rows:
        role = get_role(row, idx)
        if role == "Unknown":
            unknown_count += 1
        elif is_technical(role):
            tech_count += 1
        else:
            nontech_count += 1

    # Use binary Tech/Non-Tech classification: 'Other' free-text responses
    # classified via classify_role() patterns.
    other_n = 0
    if "Q1_Role" in idx and "Other" in [row[idx["Q1_Role"]] for _, row in sample_rows]:
        other_text_col = None
        # Find column for free-text other role
        for col_name in idx:
            if "other" in col_name.lower() and "specify" in col_name.lower():
                other_text_col = col_name
                break
        # Counts under binary Tech/Non-Tech classification: 'Other' free-text
        # responses classified via classify_role() patterns.
        if other_text_col:
            for _, row in sample_rows:
                if row[idx["Q1_Role"]] == "Other":
                    free_text = row[idx[other_text_col]]
                    if classify_role(free_text) == "Technical":
                        tech_count += 1
                    else:
                        nontech_count += 1
                    other_n += 1

    return {
        "tech": tech_count,
        "non_tech": nontech_count,
        "unclassified under binary classification (not reclassifiable)": other_n,
        "other": other_n,  # unclassified under binary classification (not reclassifiable)
    }


def other_role_categories(sample_rows, idx):
    """Categorize 'Other (please specify)' free-text responses.

    Returns: {
        "total": N responses with role="Other",
        "categories": {
            "C-Suite Adjacent": N,
            "VP / SVP": N,
            ... (one entry per OTHER_ROLE_CATEGORIES_PATTERNS category)
            "Uncategorized": N
        }
    }
    """
    other_text_col = None
    for col_name in idx:
        if "other" in col_name.lower() and "specify" in col_name.lower():
            other_text_col = col_name
            break

    if not other_text_col:
        return {"total": 0, "categories": {}}

    categories = defaultdict(int)
    total_other = 0

    for _, row in sample_rows:
        if row[idx["Q1_Role"]] == "Other":
            total_other += 1
            free_text = row[idx[other_text_col]]
            category = categorize_other_role(free_text)
            categories[category] += 1

    # Reclassify "Other (please specify)" roles, used for free-text audit display.
    return {
        "total": total_other,
        "categories": dict(categories),
    }


def org_size_counts(sample_rows, idx):
    """Count responses by organization size bucket."""
    counts = defaultdict(int)
    for _, row in sample_rows:
        bucket = org_bucket(row, idx)
        if bucket:
            counts[bucket] += 1
    return dict(counts)


def profit_model_counts(sample_rows, idx):
    """Count responses by profit model."""
    counts = defaultdict(int)
    col = "Q5_ProfitModel"
    if col not in idx:
        return {}
    for _, row in sample_rows:
        val = row[idx[col]]
        if val:
            counts[val] += 1
    return dict(counts)


def tech_nontech_means(sample_rows, idx):
    """Compute construct means for Tech vs Non-Tech roles."""
    tech_rows = []
    nontech_rows = []
    for row_idx, row in sample_rows:
        role = get_role(row, idx)
        free_text = ""
        for col_name in idx:
            if "other" in col_name.lower() and "specify" in col_name.lower():
                free_text = row[idx[col_name]]
                break
        if is_technical(role, free_text):
            tech_rows.append((row_idx, row))
        else:
            nontech_rows.append((row_idx, row))

    tech_means = construct_analysis(tech_rows, idx)
    nontech_means = construct_analysis(nontech_rows, idx)

    return {
        "technical": {c.construct: {"mean": c.mean, "sd": c.sd, "alpha": c.cronbach_alpha} for c in tech_means},
        "non_technical": {c.construct: {"mean": c.mean, "sd": c.sd, "alpha": c.cronbach_alpha} for c in nontech_means},
    }


def large_small_org_means(sample_rows, idx):
    """Compute construct means for large (5000+) vs small (<500) organizations."""
    large_rows = []
    small_rows = []
    for row_idx, row in sample_rows:
        bucket = org_bucket(row, idx)
        if bucket == "Large (5000+)":
            large_rows.append((row_idx, row))
        elif bucket == "Small (<500)":
            small_rows.append((row_idx, row))

    large_means = construct_analysis(large_rows, idx)
    small_means = construct_analysis(small_rows, idx)

    return {
        "large": {c.construct: {"mean": c.mean, "sd": c.sd, "alpha": c.cronbach_alpha} for c in large_means},
        "small": {c.construct: {"mean": c.mean, "sd": c.sd, "alpha": c.cronbach_alpha} for c in small_means},
    }


# ── STATISTICAL TESTS ────────────────────────────────────────

def t_tests_tech_vs_nontech(sample_rows, idx):
    """Independent samples t-tests: Tech vs Non-Tech on each construct."""
    constructs_def = [
        ("Barriers", BARRIER_COLS, BARRIER_SCALE),
        ("Readiness", READINESS_COLS, READINESS_SCALE),
        ("Maturity", MATURITY_COLS, MATURITY_SCALE),
    ]
    results = {}

    for construct_name, cols, scale in constructs_def:
        tech_means = []
        nontech_means = []
        for _, row in sample_rows:
            role = get_role(row, idx)
            free_text = ""
            for col_name in idx:
                if "other" in col_name.lower() and "specify" in col_name.lower():
                    free_text = row[idx[col_name]]
                    break
            pm = person_means(row, cols, scale, idx)
            if pm is not None:
                if is_technical(role, free_text):
                    tech_means.append(pm)
                else:
                    nontech_means.append(pm)

        t, p, df, ci_l, ci_u = welch_t_test(tech_means, nontech_means)
        results[construct_name] = {
            "t": t,
            "p": p,
            "df": df,
            "ci_lower": ci_l,
            "ci_upper": ci_u,
            "sig": p is not None and p < 0.05,
        }

    return results


def t_tests_large_vs_small(sample_rows, idx):
    """Independent samples t-tests: Large (5000+) vs Small (<500) on each construct."""
    constructs_def = [
        ("Barriers", BARRIER_COLS, BARRIER_SCALE),
        ("Readiness", READINESS_COLS, READINESS_SCALE),
        ("Maturity", MATURITY_COLS, MATURITY_SCALE),
    ]
    results = {}

    for construct_name, cols, scale in constructs_def:
        large_means = []
        small_means = []
        for _, row in sample_rows:
            bucket = org_bucket(row, idx)
            pm = person_means(row, cols, scale, idx)
            if pm is not None:
                if bucket == "Large (5000+)":
                    large_means.append(pm)
                elif bucket == "Small (<500)":
                    small_means.append(pm)

        t, p, df, ci_l, ci_u = welch_t_test(large_means, small_means)
        results[construct_name] = {
            "t": t,
            "p": p,
            "df": df,
            "ci_lower": ci_l,
            "ci_upper": ci_u,
            "sig": p is not None and p < 0.05,
        }

    return results


def anova_by_role(sample_rows, idx):
    """3. One-way ANOVA: by Role (Tech / Non-Tech / Unclassified under binary classification)."""
    constructs_def = [
        ("Barriers", BARRIER_COLS, BARRIER_SCALE),
        ("Readiness", READINESS_COLS, READINESS_SCALE),
        ("Maturity", MATURITY_COLS, MATURITY_SCALE),
    ]
    results = {}

    for construct_name, cols, scale in constructs_def:
        tech_means = []
        nontech_means = []
        for _, row in sample_rows:
            role = get_role(row, idx)
            free_text = ""
            for col_name in idx:
                if "other" in col_name.lower() and "specify" in col_name.lower():
                    free_text = row[idx[col_name]]
                    break
            pm = person_means(row, cols, scale, idx)
            if pm is not None:
                if is_technical(role, free_text):
                    tech_means.append(pm)
                else:
                    nontech_means.append(pm)

        f, p, df_b, df_w = oneway_anova(tech_means, nontech_means)
        results[construct_name] = {
            "f": f,
            "p": p,
            "df_between": df_b,
            "df_within": df_w,
            "sig": p is not None and p < 0.05,
        }

    return results


def anova_by_org_size(sample_rows, idx):
    """One-way ANOVA: by Org Size (Small / Medium / Large)."""
    constructs_def = [
        ("Barriers", BARRIER_COLS, BARRIER_SCALE),
        ("Readiness", READINESS_COLS, READINESS_SCALE),
        ("Maturity", MATURITY_COLS, MATURITY_SCALE),
    ]
    results = {}

    for construct_name, cols, scale in constructs_def:
        small_means = []
        medium_means = []
        large_means = []
        for _, row in sample_rows:
            bucket = org_bucket(row, idx)
            pm = person_means(row, cols, scale, idx)
            if pm is not None:
                if bucket == "Small (<500)":
                    small_means.append(pm)
                elif bucket == "Medium (500-4999)":
                    medium_means.append(pm)
                elif bucket == "Large (5000+)":
                    large_means.append(pm)

        f, p, df_b, df_w = oneway_anova(small_means, medium_means, large_means)
        results[construct_name] = {
            "f": f,
            "p": p,
            "df_between": df_b,
            "df_within": df_w,
            "sig": p is not None and p < 0.05,
        }

    return results


# ── SENSITIVITY ANALYSIS: EXPORT TO JSON ─────────────────────

def sensitivity_to_json(cuts, idx):
    """Compile sensitivity analysis across multiple sample cuts into a JSON dict.

    Input: cuts = [("Sample Label 1", rows_list), ("Sample Label 2", rows_list), ...]

    Returns a dict with:
      - samples: list of {key, n, ..}
      - metrics: list of {key, values: {sample_key: value, ..}}
      - sample_details: {sample_key: {demographics, effect_sizes, cross_tabs, inferential}}
      - demographic_sources: metadata on survey and platform demographics
      - role_categories: list of {label, description, examples} for free-text role categories
      - filter_bias_analysis: chi-square tests for representativeness across sample cuts
    """
    # Metadata for demographic sources
    demographic_sources = {
        "survey_demographics": {
            "fields": {
                "Q1_Role": "Primary role (CIO, CTO, CISO, VP, Director, Manager, IC, Other)",
                "Q2_DecisionAuth": "Decision-making authority level",
                "Q3_Industry": "Primary industry",
                "Q4_OrgSize": "Organization size (employees)",
                "Q5_ProfitModel": "For-Profit, Non-Profit, or Government/Public Sector",
                "Q6_RevenueBudget": "Organization revenue or budget range",
                "Q7_PersonalBudget": "Respondent's personal budget authority",
                "Q8_GeoScope": "Geographic scope of responsibility",
                "Q9_GeoScale": "Geographic scale indicator",
            }
        },
        "platform_demographics": {
            "base_fields": {
                "age": "Age range (prescribed on Prolific)",
                "country_of_residence": "Current country of residence",
                "country_of_birth": "Country of birth",
                "ethnicity": "Ethnicity",
                "employment_status": "Employment status",
                "sex": "Sex/Gender",
            },
            "prescreener_fields": {
                "company_size": "Company size (Prolific prescreener)",
                "industry": "Industry (Prolific prescreener)",
                "employment_sector": "Employment sector (Prolific prescreener)",
                "occupation": "Occupation (Prolific prescreener)",
                "education_level": "Education level (Prolific prescreener)",
                "household_income": "Household income (Prolific prescreener)",
                "fluent_languages": "Fluent languages (Prolific prescreener)",
            },
            "study_screeners": [
                {
                    "filter_id": "current_country_of_residence",
                    "label": "Country of Residence",
                    "base_field": "country_of_residence",
                    "selected_values": ["United States"],
                },
                {
                    "filter_id": "employment_status",
                    "label": "Employment Status",
                    "base_field": "employment_status",
                    "selected_values": ["Employed full-time"],
                },
                {
                    "filter_id": "employment_sector",
                    "label": "Employment Sector",
                    "base_field": "employment_sector",
                    "selected_values": ["Private sector"],
                },
                {
                    "filter_id": "company_size",
                    "label": "Company Size",
                    "base_field": "company_size",
                    "selected_values": ["<100", "100-499", "500-999", "1000-4999", "5000-9999", "10000+"],
                },
                {
                    "filter_id": "occupation",
                    "label": "Occupation",
                    "base_field": "occupation",
                    "selected_values": ["Information Technology", "Management", "Professional", "Other"],
                },
            ],
            "cross_validation": {
                "overlapping_fields": ["company_size", "industry", "employment_sector"],
                "use_cases": [
                    "Validating Prolific prescreener responses against TABS survey responses",
                    "Detecting demographic inconsistencies",
                    "Analyzing representation of IT decision-makers vs general population",
                ],
            },
        },
    }

    # Role categories metadata
    role_categories = []
    for category, patterns in OTHER_ROLE_CATEGORIES_PATTERNS:
        # Generate examples by matching candidate strings
        examples = []
        candidates = [
            "IT", "CIO", "CTO", "Chief Digital Officer", "VP of Engineering",
            "VP of Operations", "Director of Technology", "Manager", "Team Lead",
            "Founder", "Owner", "Engineer", "Developer", "Architect", "Analyst",
            "Operations", "Finance", "Sales", "Marketing",
        ]
        for candidate in candidates:
            import re
            for pattern in patterns:
                if re.search(pattern, candidate, re.IGNORECASE):
                    examples.append(candidate)
                    break
        role_categories.append({
            "label": category,
            "description": f"{category} roles",
            "examples": examples[:3],  # limit to 3 examples
        })

    # Sample metadata
    sample_list = []
    sample_data = {}
    for label, rows in cuts:
        sample_key = label.replace(" ", "_").lower()
        n = len(rows)
        sample_list.append({"key": sample_key, "n": n, "label": label})
        sample_data[sample_key] = rows

    # Compute metrics across all samples
    constructs_def = [
        ("Barriers", BARRIER_COLS, BARRIER_SCALE),
        ("Readiness", READINESS_COLS, READINESS_SCALE),
        ("Maturity", MATURITY_COLS, MATURITY_SCALE),
    ]
    metrics = []
    for construct_name, cols, scale in constructs_def:
        for metric_name in ["mean", "sd", "alpha"]:
            metric_key = f"{construct_name.lower()}_{metric_name}"
            values = {}
            for label, rows in cuts:
                sample_key = label.replace(" ", "_").lower()
                analyses = construct_analysis(rows, idx)
                for analysis in analyses:
                    if analysis.construct == construct_name:
                        if metric_name == "mean":
                            values[sample_key] = round(analysis.mean, 2) if analysis.mean is not None else None
                        elif metric_name == "sd":
                            values[sample_key] = round(analysis.sd, 2) if analysis.sd is not None else None
                        elif metric_name == "alpha":
                            values[sample_key] = round(analysis.cronbach_alpha, 3) if analysis.cronbach_alpha else None
            metrics.append({"key": metric_key, "values": values})

    # Sample details: demographics, effect sizes, cross-tabs, inferential per sample
    sample_details = {}
    for label, rows in cuts:
        sample_key = label.replace(" ", "_").lower()
        sample_details[sample_key] = {
            "demographics": {
                "roles": role_counts(rows, idx),
                "org_sizes": org_size_counts(rows, idx),
                "profit_models": profit_model_counts(rows, idx),
                "tech_vs_nontech": tech_nontech_means(rows, idx),
                "other_roles": other_role_categories(rows, idx),
            },
            "effect_sizes": {
                "tech_vs_nontech": {
                    "constructs": {
                        c.construct: {
                            "mean_diff": round(
                                (
                                    tech_nontech_means(rows, idx)["technical"][c.construct]["mean"]
                                    - tech_nontech_means(rows, idx)["non_technical"][c.construct]["mean"]
                                ), 2)
                            if c.construct in tech_nontech_means(rows, idx)["technical"]
                            else None,
                        }
                        for c in construct_analysis(rows, idx)
                    }
                },
                "large_vs_small": {
                    "constructs": {
                        c.construct: {
                            "mean_diff": round(
                                (
                                    large_small_org_means(rows, idx)["large"][c.construct]["mean"]
                                    - large_small_org_means(rows, idx)["small"][c.construct]["mean"]
                                ), 2)
                            if c.construct in large_small_org_means(rows, idx)["large"]
                            else None,
                        }
                        for c in construct_analysis(rows, idx)
                    }
                },
            },
            "cross_tabs": {
                "by_role": role_counts(rows, idx),
                "by_org_size": org_size_counts(rows, idx),
            },
            "inferential": {
                "t_tests_tech_vs_nontech": {"constructs": t_tests_tech_vs_nontech(rows, idx)},
                "t_tests_large_vs_small": {"constructs": t_tests_large_vs_small(rows, idx)},
                "anova_by_role": {"constructs": anova_by_role(rows, idx)},
                "anova_by_org_size": {"constructs": anova_by_org_size(rows, idx)},
            },
        }

    # Filter bias analysis: Chi-square tests for representativeness
    # Requires at least 4 labelled cuts
    filter_bias_analysis = {}
    if len(cuts) >= 4:
        filter_bias_analysis = {
            "role": {"ok": True, "chi2": None, "p_value": None, "df": None, "error": None},
            "organization_size": {"ok": True, "chi2": None, "p_value": None, "df": None, "error": None},
            "profit_model": {"ok": True, "chi2": None, "p_value": None, "df": None, "error": None},
            "profit_model_distribution": {
                "labels": ["For-Profit", "Non-Profit", "Government/Public Sector"],
                "groups": {
                    label: {
                        "For-Profit": 0,
                        "Non-Profit": 0,
                        "Government/Public Sector": 0,
                    }
                    for label, _ in cuts
                },
            },
        }
        # Populate profit_model_distribution
        for label, rows in cuts:
            sample_key = label
            pms = profit_model_counts(rows, idx)
            for pm_label in filter_bias_analysis["profit_model_distribution"]["labels"]:
                filter_bias_analysis["profit_model_distribution"]["groups"][sample_key][pm_label] = pms.get(pm_label, 0)

    return {
        "samples": sample_list,
        "metrics": metrics,
        "sample_details": sample_details,
        "demographic_sources": demographic_sources,
        "role_categories": role_categories,
        "filter_bias_analysis": filter_bias_analysis,
    }
