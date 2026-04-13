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
# Prolific live test of V2 instrument (2026-03-23 09:07 AM, COO, 876s) - valid V2 response
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

# Scale maps - verified against actual Qualtrics CSV response values
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

# Column definitions - from Qualtrics export
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

# Item names - verified against CSV subheader row
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
    'CISO (e.g., Director of Cybersecurity, Chief Security Officer)': 'CISO',
    'Other (please specify)': 'Other'
}
TECH_TITLES = {'CIO', 'CTO', 'CISO'}
NONTECH_TITLES = {'CEO', 'CFO', 'COO', 'CHRO', 'CMO', 'CSO', 'CRO'}

# Categorization patterns for "Other (please specify)" role free-text responses.
# Checked in order; first match wins.  Categories are intentionally broad to avoid
# exposing individual responses while still providing useful groupings.
OTHER_ROLE_CATEGORIES_PATTERNS = [
    ("C-Suite Adjacent", [
        r'\bchief\b', r'\bCDO\b', r'\bCPO\b', r'\bCAO\b', r'\bCLO\b',
        r'\bCDIO\b', r'\bCAIO\b', r'\bCXO\b', r'\bCCO\b',
    ]),
    ("VP / SVP", [
        r'\bvice\s+president\b', r'\bvp\b', r'\bsvp\b', r'\bevp\b', r'\bavp\b',
    ]),
    ("Director", [
        r'\bdirector\b',
    ]),
    ("Manager / Program Lead", [
        r'\bmanager\b', r'\bprogram\s+lead\b', r'\bproject\s+lead\b',
        r'\bteam\s+lead\b', r'\blead\b', r'\bsupervisor\b',
    ]),
    ("Owner / Founder / President", [
        r'\bowner\b', r'\bfounder\b', r'\bpresident\b', r'\bpartner\b',
        r'\bprincipal\b', r'\bproprietor\b',
    ]),
    ("Technical Specialist", [
        r'\bengineer\b', r'\barchitect\b', r'\bdeveloper\b', r'\banalyst\b',
        r'\badmin(?:istrator)?\b', r'\bsecurity\b', r'\bdata\b', r'\b(?-i:IT)\b',
        r'\btechnolog', r'\bsystems?\b', r'\binfrastructure\b', r'\bnetwork\b',
    ]),
]

# Human-readable descriptions and example keywords for each OTHER_ROLE_CATEGORIES_PATTERNS entry.
# Kept alongside the patterns so adding/renaming a category updates the UI automatically via JSON.
OTHER_ROLE_CATEGORIES_DESCRIPTIONS = {
    "C-Suite Adjacent": {
        "description": "Chief-level titles not in the standard 9 C-suite options",
        "examples": "CDO, CPO, CAO, CLO, CAIO, Chief Data Officer, Chief Privacy Officer",
    },
    "VP / SVP": {
        "description": "Vice President, Senior VP, or Executive VP titles",
        "examples": "Vice President, VP, SVP, EVP, AVP",
    },
    "Director": {
        "description": "Director-level titles across functions",
        "examples": "Director of ..., Senior Director, Group Director",
    },
    "Manager / Program Lead": {
        "description": "Management and team-lead roles",
        "examples": "Manager, Program Lead, Team Lead, Supervisor",
    },
    "Owner / Founder / President": {
        "description": "Business ownership or presidency roles",
        "examples": "Owner, Founder, President, Partner, Principal",
    },
    "Technical Specialist": {
        "description": "Individual contributor or specialist technical roles",
        "examples": "Engineer, Architect, Analyst, IT Administrator, Security",
    },
}

LARGE_ORG_SIZES = ('5000-9999', '10000+')
ALL_ORG_SIZES = ['<100', '100-499', '500-999', '1000-4999', '5000-9999', '10000+']

# All three constructs with their column lists and scale maps (lowercase labels for JSON output).
ALL_CONSTRUCTS = [
    ("barriers", BARRIER_COLS, BARRIER_SCALE),
    ("readiness", READINESS_COLS, READINESS_SCALE),
    ("maturity", MATURITY_COLS, MATURITY_SCALE),
]

# Binary tech/non-tech role classification for "Other (please specify)" free-text roles.
# Maps normalized keywords to classification bucket ("Technical" or "Non-Technical").
# Ordered list of (regex_pattern, classification) pairs for classify_role().
# More-specific patterns (e.g. "Vice President of Engineering") MUST come before
# the broader catch-all for the same prefix (e.g. "Vice President") to avoid
# misclassification.  Patterns use word boundaries (\b) so partial word matches
# (e.g. "vp" inside "svp") are handled correctly.
_OTHER_ROLE_PATTERNS: list[tuple[re.Pattern[str], str]] = [
    # ── Technical ──────────────────────────────────────────────────────────
    (re.compile(r'\b(cio|chief information officer)\b', re.IGNORECASE), 'Technical'),
    (re.compile(r'\b(cto|chief technology officer)\b', re.IGNORECASE), 'Technical'),
    (re.compile(r'\b(ciso|chief information security officer|chief security officer)\b', re.IGNORECASE), 'Technical'),
    (re.compile(r'\bchief (information|technology|security|data|digital|analytics|innovation|artificial)\b', re.IGNORECASE), 'Technical'),
    # "Vice President of {technical domain}" - must precede the generic VP catch-all
    (re.compile(r'\b(vp|vice president) of (it|information technology|engineering|technology|information|security|data|software|infrastructure|cyber|digital|analytics)\b', re.IGNORECASE), 'Technical'),
    (re.compile(r'\b(svp|evp|avp|senior vice president|executive vice president|assistant vice president) of (it|information technology|engineering|technology|information|security|data|software|infrastructure|cyber|digital|analytics)\b', re.IGNORECASE), 'Technical'),
    (re.compile(r'\bdirector of (it|information technology|engineering|technology|information|security|data|software|infrastructure|cyber|digital)\b', re.IGNORECASE), 'Technical'),
    (re.compile(r'\b(it|technology|software|data|infrastructure|network|security|systems) director\b', re.IGNORECASE), 'Technical'),
    (re.compile(r'\b(software |systems |network |security |data |infrastructure |database |cloud |devops |platform )?(engineer|architect|developer|programmer)\b', re.IGNORECASE), 'Technical'),
    (re.compile(r'\bsystems administrator\b', re.IGNORECASE), 'Technical'),
    (re.compile(r'\b(network|infrastructure|cybersecurity|data scientist|data engineer|software|database)\b', re.IGNORECASE), 'Technical'),
    (re.compile(r'\b(analytics|ai|artificial intelligence)\b', re.IGNORECASE), 'Technical'),
    (re.compile(r'\b(online learning|e-learning|digital learning)\b', re.IGNORECASE), 'Technical'),
    # ── Non-Technical ───────────────────────────────────────────────────────
    (re.compile(r'\bchief (executive|financial|operating|human|marketing|revenue|strategy|product|privacy|legal|compliance)\b', re.IGNORECASE), 'Non-Technical'),
    # "VP/Vice President of {non-technical domain}" - must precede the generic VP catch-all
    (re.compile(r'\b(vp|vice president|svp|evp|avp) of (finance|financial|operations|human resources|hr|marketing|sales|strategy|legal|compliance|product)\b', re.IGNORECASE), 'Non-Technical'),
    # Generic VP / Vice President without a technical qualifier → Non-Technical
    (re.compile(r'\b(vice president|vp|svp|evp|avp|senior vp|executive vp)\b', re.IGNORECASE), 'Non-Technical'),
    (re.compile(r'\b(president|owner|founder|co-founder)\b', re.IGNORECASE), 'Non-Technical'),
    (re.compile(r'\b(managing director|executive director)\b', re.IGNORECASE), 'Non-Technical'),
    (re.compile(r'\b(program manager|project manager|operations manager|finance manager|hr manager|marketing manager)\b', re.IGNORECASE), 'Non-Technical'),
]

# Keep the dict for backwards-compat (used by callers that inspect the mapping).
OTHER_ROLE_CLASSIFICATIONS = {
    # Technical roles
    'CIO': 'Technical', 'CTO': 'Technical', 'CISO': 'Technical',
    'Chief Information': 'Technical', 'Chief Technology': 'Technical',
    'Chief Security': 'Technical', 'Chief Data': 'Technical',
    'Chief Digital': 'Technical', 'Chief Analytics': 'Technical',
    'Chief Innovation': 'Technical', 'Chief Artificial': 'Technical',
    'VP of IT': 'Technical', 'VP of Technology': 'Technical',
    'VP of Engineering': 'Technical', 'VP of Information': 'Technical',
    'VP of Security': 'Technical', 'VP of Data': 'Technical',
    'Vice President of Engineering': 'Technical', 'Vice President of IT': 'Technical',
    'Vice President of Technology': 'Technical', 'Vice President of Information': 'Technical',
    'Vice President of Security': 'Technical', 'Vice President of Data': 'Technical',
    'Director of IT': 'Technical', 'Director of Technology': 'Technical',
    'Director of Engineering': 'Technical', 'Director of Information': 'Technical',
    'IT Director': 'Technical', 'Technology Director': 'Technical',
    'Engineer': 'Technical', 'Architect': 'Technical', 'Developer': 'Technical',
    'Programmer': 'Technical', 'Systems Administrator': 'Technical',
    'Network': 'Technical', 'Infrastructure': 'Technical', 'Cybersecurity': 'Technical',
    'Data Scientist': 'Technical', 'Data Engineer': 'Technical',
    'Software': 'Technical', 'Database': 'Technical',
    'Analytics': 'Technical', 'AI': 'Technical',
    'Artificial Intelligence': 'Technical',
    'Online Learning': 'Technical', 'E-Learning': 'Technical',
    'Digital Learning': 'Technical',
    # Non-Technical roles
    'Chief Executive': 'Non-Technical', 'Chief Financial': 'Non-Technical',
    'Chief Operating': 'Non-Technical', 'Chief Human': 'Non-Technical',
    'Chief Marketing': 'Non-Technical', 'Chief Revenue': 'Non-Technical',
    'Chief Strategy': 'Non-Technical', 'Chief Product': 'Non-Technical',
    'Chief Privacy': 'Non-Technical', 'Chief Legal': 'Non-Technical',
    'Chief Compliance': 'Non-Technical',
    'VP of Finance': 'Non-Technical', 'VP of Operations': 'Non-Technical',
    'VP of Human': 'Non-Technical', 'VP of Marketing': 'Non-Technical',
    'VP of Sales': 'Non-Technical', 'VP of Strategy': 'Non-Technical',
    'Vice President': 'Non-Technical', 'President': 'Non-Technical',
    'Owner': 'Non-Technical', 'Founder': 'Non-Technical',
    'Managing Director': 'Non-Technical', 'Executive Director': 'Non-Technical',
    'Program Manager': 'Non-Technical', 'Project Manager': 'Non-Technical',
    'Operations Manager': 'Non-Technical', 'Finance Manager': 'Non-Technical',
    'HR Manager': 'Non-Technical', 'Marketing Manager': 'Non-Technical',
}


def classify_role(text):
    """Classify a free-text 'Other' role as Technical, Non-Technical, or Other.

    Uses ordered regex patterns with word boundaries (_OTHER_ROLE_PATTERNS);
    more-specific patterns are listed first to prevent generic catch-alls
    (e.g. "Vice President") from misclassifying specific roles like
    "Vice President of Engineering".  Returns 'Other' if no pattern matches.
    """
    if not text or not text.strip():
        return 'Other'
    for pattern, classification in _OTHER_ROLE_PATTERNS:
        if pattern.search(text):
            return classification
    return 'Other'


def classify_role_binary(role, other_text=''):
    """Return the binary Tech/Non-Tech role group for a respondent.

    Returns:
        'Technical' for roles in TECH_TITLES
        'Non-Technical' for roles in NONTECH_TITLES
        For role == 'Other', uses classify_role(other_text) and returns
        'Technical' or 'Non-Technical' when the free-text value can be
        reclassified; unmatched free-text defaults to 'Non-Technical'
        (no technology signal in title).

    This helper is the single source of truth for all binary
    Technical/Non-Technical grouping logic (counts, effect sizes,
    inferential tests, and JSON output).
    """
    if role in TECH_TITLES:
        return 'Technical'
    if role in NONTECH_TITLES:
        return 'Non-Technical'
    if role == 'Other':
        classified = classify_role(other_text)
        if classified in ('Technical', 'Non-Technical'):
            return classified
        # Unmatched free-text (no technology signal) defaults to Non-Technical
        return 'Non-Technical'
    return None


def is_technical(role, other_text=''):
    """Return True if role maps to the Technical group under the binary classification.

    Roles in TECH_TITLES (CIO, CTO, CISO) are always technical.
    'Other' roles are classified via classify_role() on the free-text value.
    """
    return classify_role_binary(role, other_text) == 'Technical'


def get_other_text(row, idx):
    """Get free-text 'Other' role response for a row, or empty string if unavailable.

    Args:
        row: A list representing a single CSV row of response data.
        idx: A dict mapping Qualtrics column names to zero-based row indices.

    Returns:
        The stripped free-text value of the 'Q1_Role_11_TEXT' column if present,
        otherwise an empty string.
    """
    other_text_idx = idx.get('Q1_Role_11_TEXT')
    if other_text_idx is not None and other_text_idx < len(row):
        return row[other_text_idx].strip()
    return ''


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

def mean_ci(values, confidence=0.95):
    """Compute the confidence interval for the mean.

    Returns (ci_lower, ci_upper) or (None, None) if insufficient data.
    Uses the t-distribution and the custom _t_ppf_two_tailed function.
    """
    m, s = mean_sd(values)
    if m is None or s is None:
        return (None, None)

    values = [v for v in values if v is not None]
    n = len(values)
    if n < 2:
        return (None, None)

    df = n - 1
    alpha = 1.0 - confidence
    t_crit = _t_ppf_two_tailed(alpha, df)

    if t_crit is None:
        return (None, None)

    margin = t_crit * (s / math.sqrt(n))
    return (m - margin, m + margin)


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


import random

def _calc_d(g1, g2):
    """Helper to calculate raw Cohen's d for two lists of numbers."""
    n1, n2 = len(g1), len(g2)
    if n1 < 2 or n2 < 2:
        return None
    m1 = sum(g1) / n1
    m2 = sum(g2) / n2
    s1_sq = sum((x - m1) ** 2 for x in g1) / (n1 - 1)
    s2_sq = sum((x - m2) ** 2 for x in g2) / (n2 - 1)
    pooled = math.sqrt(((n1 - 1) * s1_sq + (n2 - 1) * s2_sq) / (n1 + n2 - 2))
    if pooled == 0:
        return None
    return (m1 - m2) / pooled

def cohens_d(g1, g2, bootstrap_iters=2000, confidence=0.95):
    """Compute Cohen's d effect size between two groups and its 95% CI via percentile bootstrap.

    Returns (d, ci_lower, ci_upper) or (None, None, None) if insufficient data.
    """
    # Filter Nones to get accurate counts
    g1 = [v for v in g1 if v is not None]
    g2 = [v for v in g2 if v is not None]

    d = _calc_d(g1, g2)
    if d is None:
        return (None, None, None)

    n1, n2 = len(g1), len(g2)

    # Non-parametric bootstrap
    boot_d = []
    # Seed fixed for reproducibility in testing, though random is fine in production
    rng = random.Random(42)
    for _ in range(bootstrap_iters):
        bg1 = [g1[rng.randint(0, n1 - 1)] for _ in range(n1)]
        bg2 = [g2[rng.randint(0, n2 - 1)] for _ in range(n2)]
        bd = _calc_d(bg1, bg2)
        if bd is not None:
            boot_d.append(bd)

    if not boot_d:
        return (d, None, None)

    boot_d.sort()
    alpha = 1.0 - confidence
    lower_idx = int(len(boot_d) * (alpha / 2.0))
    upper_idx = int(len(boot_d) * (1.0 - alpha / 2.0))

    # Ensure indices are within bounds
    lower_idx = max(0, min(lower_idx, len(boot_d) - 1))
    upper_idx = max(0, min(upper_idx, len(boot_d) - 1))

    return (d, boot_d[lower_idx], boot_d[upper_idx])


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


def _t_ppf_two_tailed(p, df, tol=1e-5):
    """Approximate critical t-value for a given two-tailed probability and degrees of freedom.

    Uses binary search to find t such that _t_cdf_two_tailed(t, df) == p.
    """
    if df <= 0 or p <= 0 or p >= 1:
        return None
    # Binary search bounds
    low = 0.0
    high = 100.0  # Safe upper bound for practical t-values

    # Increase upper bound if necessary
    while _t_cdf_two_tailed(high, df) > p:
        high *= 2.0

    best_t = 0.0
    for _ in range(100):  # max iterations
        mid = (low + high) / 2.0
        current_p = _t_cdf_two_tailed(mid, df)
        if abs(current_p - p) < tol:
            return mid
        if current_p > p:
            # larger p-value means t is too small (closer to center)
            low = mid
        else:
            high = mid
        best_t = mid
    return best_t


def welch_t_test(g1, g2):
    """Welch's t-test for independent samples with unequal variances.

    Returns (t_statistic, p_value, degrees_of_freedom, ci_lower, ci_upper)
    or (None, None, None, None, None) if either group has fewer than 2 observations.
    Uses the Welch-Satterthwaite approximation for degrees of freedom
    and a two-tailed p-value from the t-distribution.
    """
    g1 = [v for v in g1 if v is not None]
    g2 = [v for v in g2 if v is not None]
    n1, n2 = len(g1), len(g2)
    if n1 < 2 or n2 < 2:
        return (None, None, None, None, None)
    m1 = sum(g1) / n1
    m2 = sum(g2) / n2
    s1_sq = sum((x - m1) ** 2 for x in g1) / (n1 - 1)
    s2_sq = sum((x - m2) ** 2 for x in g2) / (n2 - 1)
    se = math.sqrt(s1_sq / n1 + s2_sq / n2)
    if se == 0:
        return (None, None, None, None, None)
    t_stat = (m1 - m2) / se
    # Welch-Satterthwaite degrees of freedom
    num = (s1_sq / n1 + s2_sq / n2) ** 2
    denom = (s1_sq / n1) ** 2 / (n1 - 1) + (s2_sq / n2) ** 2 / (n2 - 1)
    if denom == 0:
        return (None, None, None, None, None)
    df = num / denom
    p = _t_cdf_two_tailed(abs(t_stat), df)

    # Calculate 95% Confidence Interval for mean difference
    t_crit = _t_ppf_two_tailed(0.05, df)
    if t_crit is not None:
        ci_lower = (m1 - m2) - t_crit * se
        ci_upper = (m1 - m2) + t_crit * se
    else:
        ci_lower, ci_upper = None, None

    return (t_stat, p, df, ci_lower, ci_upper)


def _t_cdf_two_tailed(t_abs, df):
    """Approximate two-tailed p-value for Student's t-distribution.

    Uses the regularized incomplete beta function relationship:
    p = I_{df/(df+t^2)}(df/2, 1/2) which is equivalent to
    2 * (1 - CDF(|t|, df)).
    """
    x = df / (df + t_abs ** 2)
    p = _regularized_incomplete_beta(x, df / 2.0, 0.5)
    return max(0.0, min(1.0, p))


def _regularized_incomplete_beta(x, a, b, max_iter=200, tol=1e-12):
    """Regularized incomplete beta function I_x(a, b) via continued fraction.

    Implements the modified Lentz algorithm for the continued fraction
    expansion of the incomplete beta function, as described in
    Numerical Recipes (Press et al., 3rd ed., §6.4).

    Numerical properties:
    - Converges for 0 < x < 1 with a, b > 0.
    - Uses 1e-30 floor to avoid division by zero (tiny-number stabilization).
    - Log-space prefix computation avoids overflow for large a, b.
    - Maximum 200 iterations; returns best estimate if not converged.
    - Accuracy is typically ~1e-10 for moderate a, b (< 1000).

    For the t-distribution CDF, this is called with x = df/(df+t²),
    a = df/2, b = 0.5. For the F-distribution, x = df2/(df2+df1*F),
    a = df2/2, b = df1/2.
    """
    if x <= 0:
        return 0.0
    if x >= 1:
        return 1.0
    # Symmetry relation for better convergence (Numerical Recipes §6.4).
    # The continued fraction converges faster when x < (a+1)/(a+b+2).
    if x > (a + 1.0) / (a + b + 2.0):
        return 1.0 - _regularized_incomplete_beta(1.0 - x, b, a, max_iter, tol)
    # Use the log-beta for numerical stability
    ln_prefix = _ln_beta_prefix(x, a, b)
    # Continued fraction (modified Lentz's method)
    c = 1.0
    d = 1.0 - (a + b) * x / (a + 1.0)
    if abs(d) < 1e-30:
        d = 1e-30
    d = 1.0 / d
    f = d
    for m in range(1, max_iter + 1):
        # Even step
        num = m * (b - m) * x / ((a + 2 * m - 1) * (a + 2 * m))
        d = 1.0 + num * d
        if abs(d) < 1e-30:
            d = 1e-30
        c = 1.0 + num / c
        if abs(c) < 1e-30:
            c = 1e-30
        d = 1.0 / d
        f *= d * c
        # Odd step
        num = -(a + m) * (a + b + m) * x / ((a + 2 * m) * (a + 2 * m + 1))
        d = 1.0 + num * d
        if abs(d) < 1e-30:
            d = 1e-30
        c = 1.0 + num / c
        if abs(c) < 1e-30:
            c = 1e-30
        d = 1.0 / d
        delta = d * c
        f *= delta
        if abs(delta - 1.0) < tol:
            break
    return max(0.0, min(1.0, math.exp(ln_prefix) * f / a))


def _ln_beta_prefix(x, a, b):
    """Log of x^a * (1-x)^b / B(a, b)."""
    return a * math.log(x) + b * math.log(1 - x) - _ln_beta(a, b)


def _ln_beta(a, b):
    """Log of the beta function B(a, b) = Gamma(a)*Gamma(b)/Gamma(a+b)."""
    return math.lgamma(a) + math.lgamma(b) - math.lgamma(a + b)


def oneway_anova(*groups):
    """One-way ANOVA F-test for 2+ independent groups.

    Returns (f_statistic, p_value, df_between, df_within) or
    (None, None, None, None) if insufficient data.
    """
    groups = [[v for v in g if v is not None] for g in groups]
    groups = [g for g in groups if len(g) >= 1]
    k = len(groups)
    if k < 2:
        return (None, None, None, None)
    ns = [len(g) for g in groups]
    N = sum(ns)
    if N <= k:
        return (None, None, None, None)
    grand_mean = sum(sum(g) for g in groups) / N
    ss_between = sum(n * (sum(g) / n - grand_mean) ** 2 for g, n in zip(groups, ns))
    ss_within = sum(sum((x - sum(g) / n) ** 2 for x in g) for g, n in zip(groups, ns))
    df_b = k - 1
    df_w = N - k
    if df_w <= 0 or ss_within == 0:
        return (None, None, None, None)
    ms_b = ss_between / df_b
    ms_w = ss_within / df_w
    f_stat = ms_b / ms_w
    p = _f_cdf_right(f_stat, df_b, df_w)
    return (f_stat, p, df_b, df_w)


def _f_cdf_right(f_val, df1, df2):
    """Right-tail p-value for F-distribution: P(F > f_val).

    Uses the relationship between F-distribution and incomplete beta function.
    """
    if f_val <= 0:
        return 1.0
    x = df2 / (df2 + df1 * f_val)
    return _regularized_incomplete_beta(x, df2 / 2.0, df1 / 2.0)


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


def categorize_other_role(text):
    """Categorize a free-text 'Other' role response into a broad group.

    Returns one of the category labels from OTHER_ROLE_CATEGORIES_PATTERNS,
    or 'Uncategorized' if no pattern matches.
    """
    if not text or not text.strip():
        return "Uncategorized"
    t = text.strip()
    for category, patterns in OTHER_ROLE_CATEGORIES_PATTERNS:
        for pat in patterns:
            if re.search(pat, t, re.IGNORECASE):
                return category
    return "Uncategorized"


def org_bucket(row, idx):
    """Classify org size into Small/Medium/Large."""
    os_val = row[idx['Q4_OrgSize']].strip()
    if os_val in ('<100', '100-499'):
        return 'Small (<500)'
    elif os_val in ('500-999', '1000-4999'):
        return 'Medium (500-4999)'
    elif os_val in LARGE_ORG_SIZES:
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
      1. Conservative Clean - Prolific APPROVED + passes ALL quality checks
                              (all 3 IRIs, duration >= 540s, reCAPTCHA >= 0.5,
                              no straightlining, no partial straightlining, auth pass)
      2. Flexible Clean     - Prolific APPROVED + passes basic quality checks
                              (all 3 IRIs, duration >= 480s) - includes manually
                              reviewed FLAG responses that were approved
      3. Prolific Accepted  - All deduplicated V2 responses with Prolific APPROVED status (matches Prolific UI exactly)
      4. All V2 Finished    - Finished + duration >= 120s
      5. All V2             - All V2 responses including incomplete

    Constraint: Conservative Clean ⊆ Flexible Clean ⊆ Prolific Accepted

    Returns:
        Tuple of (v2_rows, samples_dict) where samples_dict maps
        sample key to list of rows.
    """
    v2_all_rows = [r for r in data if r[idx['StartDate']] >= V2_START
                   or ('ResponseId' in idx and r[idx['ResponseId']] == PROLIFIC_TEST_ID)]

    # Deduplicate by PROLIFIC_PID - prefer completed (Finished=TRUE/1) over incomplete.
    # If a participant has both a completed response and an incomplete retake,
    # keep the completed one (the retake shouldn't overwrite valid data).
    # Among completed responses, latest row wins.
    if 'PROLIFIC_PID' in idx:
        finished_idx_col = idx.get('Finished')
        by_pid: dict = {}
        for r in v2_all_rows:
            pid = r[idx['PROLIFIC_PID']].strip()
            if not pid:
                continue
            existing = by_pid.get(pid)
            if existing is None:
                by_pid[pid] = r
            else:
                # Check if existing is finished
                existing_finished = (
                    finished_idx_col is not None
                    and existing[finished_idx_col].strip().upper() in ('TRUE', '1')
                )
                new_finished = (
                    finished_idx_col is not None
                    and r[finished_idx_col].strip().upper() in ('TRUE', '1')
                )
                if new_finished or not existing_finished:
                    # New row is finished, or existing wasn't - take new
                    by_pid[pid] = r
                # else: existing is finished but new isn't - keep existing
        v2 = list(by_pid.values())
    else:
        v2 = v2_all_rows

    v2_finished = [r for r in v2 if is_finished(r, idx)
                   and get_duration(r, idx) is not None
                   and get_duration(r, idx) >= MIN_DURATION_ALL]

    # Prolific Accepted = ALL deduplicated V2 responses with Prolific APPROVED status.
    # Must match the Prolific UI "Approved" count exactly (currently 206).
    # Includes incomplete/short responses - Prolific approved them, so they count.
    # Clean samples apply quality filters on top of this.
    prolific_accepted = [r for r in v2 if _get_prolific_status(r, idx) == 'APPROVED']

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
        ("prolific_accepted", "Prolific Accepted", "All deduplicated V2 rows with Prolific APPROVED status"),
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

    tech = [r for r in rows if classify_role_binary(get_role(r, idx), get_other_text(r, idx)) == 'Technical']
    nontech = [r for r in rows if classify_role_binary(get_role(r, idx), get_other_text(r, idx)) == 'Non-Technical']
    unclassified = [r for r in rows if classify_role_binary(get_role(r, idx), get_other_text(r, idx)) is None]
    print(f"\n  Technical: n={len(tech)} ({len(tech) / len(rows) * 100:.1f}%)")
    print(f"  Non-Technical:       n={len(nontech)} ({len(nontech) / len(rows) * 100:.1f}%)")
    print(f"  Unclassified:        n={len(unclassified)} ({len(unclassified) / len(rows) * 100:.1f}%)")

    print("\n  Org Size:")
    for os_val in ALL_ORG_SIZES:
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

    tech = [r for r in rows if classify_role_binary(get_role(r, idx), get_other_text(r, idx)) == 'Technical']
    nontech = [r for r in rows if classify_role_binary(get_role(r, idx), get_other_text(r, idx)) == 'Non-Technical']

    print(f"\n  Tech (n={len(tech)}) vs Non-Tech (n={len(nontech)}):")
    for label, cols, sc in [("Barriers", BARRIER_COLS, BARRIER_SCALE),
                             ("Readiness", READINESS_COLS, READINESS_SCALE),
                             ("Maturity", MATURITY_COLS, MATURITY_SCALE)]:
        t = person_means(tech, cols, sc, idx)
        nt = person_means(nontech, cols, sc, idx)
        d, d_cil, d_ciu = cohens_d(t, nt)
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

    large = [r for r in rows if r[idx['Q4_OrgSize']].strip() in LARGE_ORG_SIZES]
    smmed = [r for r in rows if r[idx['Q4_OrgSize']].strip() not in LARGE_ORG_SIZES]

    print(f"\n  Large Org (n={len(large)}) vs Small/Medium (n={len(smmed)}):")
    for label, cols, sc in [("Barriers", BARRIER_COLS, BARRIER_SCALE),
                             ("Readiness", READINESS_COLS, READINESS_SCALE)]:
        l = person_means(large, cols, sc, idx)
        s = person_means(smmed, cols, sc, idx)
        d, d_cil, d_ciu = cohens_d(l, s)
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
        d, d_cil, d_ciu = cohens_d(hb, lb)
        hbm, _ = mean_sd(hb)
        lbm, _ = mean_sd(lb)
        print(f"\n  Budget Adequacy - High (n={len(high_budget)}) vs Low (n={len(low_budget)}):")
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
        ("Technical", [r for r in rows if classify_role_binary(get_role(r, idx), get_other_text(r, idx)) == 'Technical']),
        ("Non-Technical", [r for r in rows if classify_role_binary(get_role(r, idx), get_other_text(r, idx)) == 'Non-Technical']),
        ("Unclassified", [r for r in rows if classify_role_binary(get_role(r, idx), get_other_text(r, idx)) is None]),
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
    print("  SENSITIVITY ANALYSIS - ALL SAMPLE DEFINITIONS")
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

    # Document the two independent demographic data sources
    result["demographic_sources"] = {
        "survey_demographics": {
            "source": "Qualtrics CSV export (Q1-Q9)",
            "type": "Organizational/role-based characteristics",
            "fields": {
                "Q1_Role": "Executive Role (CIO, CTO, CEO, CFO, COO, CHRO, CMO, CSO, CRO, Other)",
                "Q2_DecisionAuth": "Decision Authority level",
                "Q3_Industry": "Industry classification",
                "Q4_OrgSize": "Organization Size (<100, 100-499, 500-999, 1000-4999, 5000-9999, 10000+)",
                "Q5_ProfitModel": "Profit Model (For-Profit, Non-Profit, Government/Public Sector)",
                "Q6_RevenueBudget": "Organizational revenue/budget range",
                "Q7_PersonalBudget": "Personal budget responsibility",
                "Q8_GeoScope": "Geographic scope",
                "Q9_GeoScale": "Geographic scale",
            },
            "note": "Self-reported by participants within the TABS survey instrument. Used for all per-group demographic breakdowns, effect sizes, and cross-tabulations.",
        },
        "platform_demographics": {
            "source": "Prolific API (POST /studies/{id}/demographic-export/)",
            "filters_api": "GET /api/v1/filters/ (returns full catalog of available prescreener categories)",
            "type": "Personal/sociodemographic and professional characteristics",
            "base_fields": {
                "age": "Participant age (range filter)",
                "sex": "Biological sex as recorded on legal documents",
                "ethnicity": "Ethnic background (simplified)",
                "language": "First/primary language",
                "country_of_residence": "Current country of residence",
                "nationality": "Nationality",
                "country_of_birth": "Country of birth",
                "student_status": "Current student status",
                "employment_status": "Employment status",
            },
            "prescreener_fields": {
                "employment_sector": "Employment sector (Private, Public, Non-profit, etc.)",
                "industry": "Industry classification",
                "company_size": "Company/organization size",
                "occupation": "Occupation/job title category",
                "education_level": "Highest level of education completed",
                "household_income": "Household income bracket",
                "fluent_languages": "Languages spoken fluently",
            },
            "study_screeners": [
                {
                    "filter_id": "current_country_of_residence",
                    "label": "Current Country of Residence",
                    "selected_values": ["United States"],
                    "base_field": True,
                },
                {
                    "filter_id": "employment_status",
                    "label": "Employment Status",
                    "selected_values": ["Full-Time"],
                    "base_field": True,
                },
                {
                    "filter_id": "employment_sector",
                    "label": "Employer Type",
                    "selected_values": [
                        "Employee of a for-profit company or business or of an individual, for wages, salary, or commissions",
                        "Employee of a not-for-profit, tax-exempt, or charitable organization",
                        "Local government employee (city, county, etc.)",
                        "State government employee",
                        "Federal government employee",
                        "Self-employed in own not-incorporated business, professional practice, or farm",
                        "Self-employed in own incorporated business, professional practice, or farm",
                        "Working without pay in family business or farm",
                    ],
                    "base_field": False,
                },
                {
                    "filter_id": "company_size",
                    "label": "Company Size",
                    "selected_values": ["50-249", "250-999", "1000+"],
                    "base_field": False,
                },
                {
                    "filter_id": "occupation",
                    "label": "Job Position",
                    "selected_values": [
                        "C-Level (e.g. CEO, CFO), Owner, Partner, President",
                        "Vice President (EVP, SVP, AVP, VP)",
                        "Director (Group Director, Sr. Director, Director)",
                        "Manager (Group Manager, Sr. Manager, Manager, Program Manager)",
                    ],
                    "base_field": False,
                },
            ],
            "prescreener_note": "Up to 15 prescreener filters can be selected per export (configurable twice before locking). The 5 study screeners above are exported for cross-validation. Additional augmentation filters (education_level, household_income, fluent_languages) are also included, totaling 7 of the 15-filter maximum.",
            "fields": {
                "age": "Participant age",
                "sex": "Biological sex",
                "ethnicity": "Ethnic background",
                "language": "Primary/first language",
                "country_of_residence": "Current country of residence",
                "nationality": "Nationality",
                "country_of_birth": "Country of birth",
                "student_status": "Current student status",
                "employment_status": "Employment status",
                "employment_sector": "Employment sector (prescreener)",
                "industry": "Industry classification (prescreener)",
                "company_size": "Company/organization size (prescreener)",
                "occupation": "Occupation/job title category (prescreener)",
                "education_level": "Education level (prescreener)",
                "household_income": "Household income (prescreener)",
                "fluent_languages": "Fluent languages (prescreener)",
            },
            "cross_validation": {
                "description": "Prolific prescreener fields overlap with Qualtrics survey demographics, enabling independent cross-validation of self-reported data and sample balancing.",
                "overlapping_fields": {
                    "industry": {"prolific": "industry", "qualtrics": "Q3_Industry"},
                    "company_size": {"prolific": "company_size", "qualtrics": "Q4_OrgSize"},
                    "employment_sector": {"prolific": "employment_sector", "qualtrics": "Q5_ProfitModel"},
                    "occupation": {"prolific": "occupation", "qualtrics": "Q1_Role"},
                },
                "use_cases": [
                    "Flag discrepancies between Prolific profile and survey responses",
                    "Balance samples using validated Prolific profile data",
                    "Augment survey demographics with additional Prolific fields (education, income, languages)",
                ],
            },
            "note": "Base fields are always included in the Prolific demographic export. Prescreener fields are available when configured as study filters (up to 15 per export). The export is a snapshot of participants' prescreening responses at the time they took the study. Both base and prescreener data can be cross-referenced with Qualtrics survey data using Prolific Participant ID as join key.",
        },
    }

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
            "description": "All deduplicated V2 rows with Prolific APPROVED status",
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

    # ── Demographics per sample ──
    has_other_text = 'Q1_Role_11_TEXT' in idx

    def demographics_for(rows):
        """Compute SURVEY demographics breakdown for a set of rows.

        These are organizational/role-based demographics from Qualtrics survey
        responses (Q1_Role, Q4_OrgSize, Q5_ProfitModel) - NOT Prolific platform
        demographics (age, sex, ethnicity, etc.).
        """
        if not rows:
            return {
                "roles": {},
                "org_sizes": {k: 0 for k in ALL_ORG_SIZES},
                "profit_models": {
                    k: 0 for k in ['For-Profit', 'Non-Profit', 'Government/Public Sector']
                },
                "tech_vs_nontech": {
                    "technical": 0,
                    "non_technical": 0,
                    "other": 0,
                },
                "other_roles": {
                    "total": 0,
                    "categories": {},
                },
            }

        # Single pass over rows to compute all demographic counts at once,
        # avoiding redundant O(N) iterations per demographic dimension.
        roles = Counter()
        tech_n = 0
        nontech_n = 0
        other_n = 0
        other_cats = Counter()
        org_sizes = Counter()
        profit_models = Counter()

        for r in rows:
            role = get_role(r, idx)
            roles[role] += 1
            # Use binary Tech/Non-Tech classification: 'Other' free-text responses
            # that match a known Technical/Non-Technical keyword are reclassified.
            other_text = get_other_text(r, idx) if role == 'Other' else ''
            binary = classify_role_binary(role, other_text)
            if binary == 'Technical':
                tech_n += 1
            elif binary == 'Non-Technical':
                nontech_n += 1
            else:
                other_n += 1
                # Still categorize all raw 'Other' responses for audit purposes.
                if role == 'Other':
                    other_cats[categorize_other_role(other_text)] += 1
            org_sizes[r[idx['Q4_OrgSize']].strip()] += 1
            profit_models[r[idx['Q5_ProfitModel']].strip()] += 1

        # Preserve ordered output for org sizes and profit models.
        org_sizes_out = {k: org_sizes.get(k, 0) for k in ALL_ORG_SIZES}
        profit_models_out = {k: profit_models.get(k, 0)
                             for k in ['For-Profit', 'Non-Profit', 'Government/Public Sector']}

        return {
            "roles": dict(roles.most_common()),
            "org_sizes": org_sizes_out,
            "profit_models": profit_models_out,
            "tech_vs_nontech": {
                # Counts under binary Tech/Non-Tech classification: 'Other' free-text
                # responses reclassified as Technical/Non-Technical are included here;
                # only truly unclassifiable responses count toward 'other'.
                "technical": tech_n,
                "non_technical": nontech_n,
                "other": other_n,  # roles not recognized by binary classification (e.g. unknown/empty)
            },
            "other_roles": {
                # Raw count of all responses with role == 'Other' (before
                # binary Tech/Non-Tech reclassification), used for free-text audit display.
                "total": sum(1 for r in rows if get_role(r, idx) == 'Other'),
                "categories": dict(other_cats.most_common()),
            },
        }

    # ── Effect sizes per sample ──
    def effect_sizes_for(rows):
        """Compute Cohen's d effect sizes for key group comparisons."""
        if not rows:
            return {}
        effects = {}
        tech = [r for r in rows if classify_role_binary(get_role(r, idx), get_other_text(r, idx)) == 'Technical']
        nontech = [r for r in rows if classify_role_binary(get_role(r, idx), get_other_text(r, idx)) == 'Non-Technical']
        effects["tech_vs_nontech"] = {"tech_n": len(tech), "nontech_n": len(nontech), "constructs": {}}
        for label, cols, sc in ALL_CONSTRUCTS:
            t = person_means(tech, cols, sc, idx)
            nt = person_means(nontech, cols, sc, idx)
            d, d_ci_l, d_ci_u = cohens_d(t, nt)
            tm, _ = mean_sd(t)
            ntm, _ = mean_sd(nt)
            tm_ci_l, tm_ci_u = mean_ci(t)
            ntm_ci_l, ntm_ci_u = mean_ci(nt)
            effects["tech_vs_nontech"]["constructs"][label] = {
                "tech_mean": round(tm, 4) if tm is not None else None,
                "tech_mean_ci_lower": round(tm_ci_l, 4) if tm_ci_l is not None else None,
                "tech_mean_ci_upper": round(tm_ci_u, 4) if tm_ci_u is not None else None,
                "nontech_mean": round(ntm, 4) if ntm is not None else None,
                "nontech_mean_ci_lower": round(ntm_ci_l, 4) if ntm_ci_l is not None else None,
                "nontech_mean_ci_upper": round(ntm_ci_u, 4) if ntm_ci_u is not None else None,
                "d": round(d, 4) if d is not None else None,
                "d_ci_lower": round(d_ci_l, 4) if d_ci_l is not None else None,
                "d_ci_upper": round(d_ci_u, 4) if d_ci_u is not None else None,
            }

        large = [r for r in rows if r[idx['Q4_OrgSize']].strip() in LARGE_ORG_SIZES]
        smmed = [r for r in rows if r[idx['Q4_OrgSize']].strip() not in LARGE_ORG_SIZES]
        effects["large_vs_small"] = {"large_n": len(large), "small_medium_n": len(smmed), "constructs": {}}
        for label, cols, sc in [("barriers", BARRIER_COLS, BARRIER_SCALE),
                                 ("readiness", READINESS_COLS, READINESS_SCALE)]:
            l = person_means(large, cols, sc, idx)
            s = person_means(smmed, cols, sc, idx)
            d, d_ci_l, d_ci_u = cohens_d(l, s)
            lm, _ = mean_sd(l)
            sm, _ = mean_sd(s)
            lm_ci_l, lm_ci_u = mean_ci(l)
            sm_ci_l, sm_ci_u = mean_ci(s)
            effects["large_vs_small"]["constructs"][label] = {
                "large_mean": round(lm, 4) if lm is not None else None,
                "large_mean_ci_lower": round(lm_ci_l, 4) if lm_ci_l is not None else None,
                "large_mean_ci_upper": round(lm_ci_u, 4) if lm_ci_u is not None else None,
                "small_medium_mean": round(sm, 4) if sm is not None else None,
                "small_medium_mean_ci_lower": round(sm_ci_l, 4) if sm_ci_l is not None else None,
                "small_medium_mean_ci_upper": round(sm_ci_u, 4) if sm_ci_u is not None else None,
                "d": round(d, 4) if d is not None else None,
                "d_ci_lower": round(d_ci_l, 4) if d_ci_l is not None else None,
                "d_ci_upper": round(d_ci_u, 4) if d_ci_u is not None else None,
            }

        return effects

    # ── Cross-tabs per sample ──
    def cross_tabs_for(rows):
        """Compute cross-tabulation means for key groupings."""
        if not rows:
            return {}
        groups = {}
        # Role-based
        role_groups = [
            ("Technical", [r for r in rows if classify_role_binary(get_role(r, idx), get_other_text(r, idx)) == 'Technical']),
            ("Non-Technical", [r for r in rows if classify_role_binary(get_role(r, idx), get_other_text(r, idx)) == 'Non-Technical']),
            ("Unclassified", [r for r in rows if classify_role_binary(get_role(r, idx), get_other_text(r, idx)) is None]),
        ]
        role_results = []
        for gname, grows in role_groups:
            if not grows:
                continue
            bm, _ = mean_sd(person_means(grows, BARRIER_COLS, BARRIER_SCALE, idx))
            rm, _ = mean_sd(person_means(grows, READINESS_COLS, READINESS_SCALE, idx))
            mm, _ = mean_sd(person_means(grows, MATURITY_COLS, MATURITY_SCALE, idx))
            role_results.append({
                "group": gname,
                "n": len(grows),
                "barrier_mean": round(bm, 4) if bm is not None else None,
                "readiness_mean": round(rm, 4) if rm is not None else None,
                "maturity_mean": round(mm, 4) if mm is not None else None,
            })
        groups["by_role"] = role_results

        # Org-size buckets
        size_groups = [
            ("Small (<500)", [r for r in rows if r[idx['Q4_OrgSize']].strip() in ('<100', '100-499')]),
            ("Medium (500-4999)", [r for r in rows if r[idx['Q4_OrgSize']].strip() in ('500-999', '1000-4999')]),
            ("Large (5000+)", [r for r in rows if r[idx['Q4_OrgSize']].strip() in LARGE_ORG_SIZES]),
        ]
        size_results = []
        for gname, grows in size_groups:
            if not grows:
                continue
            bm, _ = mean_sd(person_means(grows, BARRIER_COLS, BARRIER_SCALE, idx))
            rm, _ = mean_sd(person_means(grows, READINESS_COLS, READINESS_SCALE, idx))
            mm, _ = mean_sd(person_means(grows, MATURITY_COLS, MATURITY_SCALE, idx))
            size_results.append({
                "group": gname,
                "n": len(grows),
                "barrier_mean": round(bm, 4) if bm is not None else None,
                "readiness_mean": round(rm, 4) if rm is not None else None,
                "maturity_mean": round(mm, 4) if mm is not None else None,
            })
        groups["by_org_size"] = size_results

        return groups

    # ── Inferential statistics per sample ──
    def inferential_for(rows):
        """Compute inferential statistics: t-tests and ANOVA per sample."""
        if not rows:
            return {}
        result_inf = {}

        # 1. Welch's t-tests: Tech vs Non-Tech per construct
        tech = [r for r in rows if classify_role_binary(get_role(r, idx), get_other_text(r, idx)) == 'Technical']
        nontech = [r for r in rows if classify_role_binary(get_role(r, idx), get_other_text(r, idx)) == 'Non-Technical']
        t_tests = {}
        for label, cols, sc in ALL_CONSTRUCTS:
            t_vals = person_means(tech, cols, sc, idx)
            nt_vals = person_means(nontech, cols, sc, idx)
            t_stat, p_val, df, ci_l, ci_u = welch_t_test(t_vals, nt_vals)
            t_tests[label] = {
                "t": round(t_stat, 4) if t_stat is not None else None,
                "p": round(p_val, 4) if p_val is not None else None,
                "df": round(df, 2) if df is not None else None,
                "mean_diff_ci_lower": round(ci_l, 4) if ci_l is not None else None,
                "mean_diff_ci_upper": round(ci_u, 4) if ci_u is not None else None,
                "sig": p_val is not None and p_val < 0.05,
            }
        result_inf["t_tests_tech_vs_nontech"] = {
            "tech_n": len(tech), "nontech_n": len(nontech),
            "constructs": t_tests,
        }

        # 2. Welch's t-tests: Large vs Small/Medium orgs per construct
        large = [r for r in rows if r[idx['Q4_OrgSize']].strip() in LARGE_ORG_SIZES]
        smmed = [r for r in rows if r[idx['Q4_OrgSize']].strip() not in LARGE_ORG_SIZES]
        t_tests_org = {}
        for label, cols, sc in ALL_CONSTRUCTS:
            l_vals = person_means(large, cols, sc, idx)
            s_vals = person_means(smmed, cols, sc, idx)
            t_stat, p_val, df, ci_l, ci_u = welch_t_test(l_vals, s_vals)
            t_tests_org[label] = {
                "t": round(t_stat, 4) if t_stat is not None else None,
                "p": round(p_val, 4) if p_val is not None else None,
                "df": round(df, 2) if df is not None else None,
                "mean_diff_ci_lower": round(ci_l, 4) if ci_l is not None else None,
                "mean_diff_ci_upper": round(ci_u, 4) if ci_u is not None else None,
                "sig": p_val is not None and p_val < 0.05,
            }
        result_inf["t_tests_large_vs_small"] = {
            "large_n": len(large), "small_medium_n": len(smmed),
            "constructs": t_tests_org,
        }

        # 3. One-way ANOVA: by Role (Tech / Non-Tech / Unclassified under binary classification)
        # Dynamically build groups to avoid reporting 3 groups when only 2 are populated.
        unclassified = [r for r in rows if classify_role_binary(get_role(r, idx), get_other_text(r, idx)) is None]
        role_anova_groups = [
            ("Technical", tech),
            ("Non-Technical", nontech),
            ("Unclassified", unclassified),
        ]
        # Keep only non-empty groups for ANOVA
        role_anova_groups = [(name, grp) for name, grp in role_anova_groups if grp]
        anova_role = {}
        for label, cols, sc in ALL_CONSTRUCTS:
            group_vals = [person_means(grp, cols, sc, idx) for _, grp in role_anova_groups]
            f_stat, p_val, df_b, df_w = oneway_anova(*group_vals)
            anova_role[label] = {
                "f": round(f_stat, 4) if f_stat is not None else None,
                "p": round(p_val, 4) if p_val is not None else None,
                "df_between": df_b,
                "df_within": df_w,
                "sig": p_val is not None and p_val < 0.05,
            }
        result_inf["anova_by_role"] = {
            "groups": [name for name, _ in role_anova_groups],
            "group_ns": [len(grp) for _, grp in role_anova_groups],
            "constructs": anova_role,
        }

        # 4. One-way ANOVA: by Org Size (Small / Medium / Large)
        small_orgs = [r for r in rows if r[idx['Q4_OrgSize']].strip() in ('<100', '100-499')]
        med_orgs = [r for r in rows if r[idx['Q4_OrgSize']].strip() in ('500-999', '1000-4999')]
        large_orgs = [r for r in rows if r[idx['Q4_OrgSize']].strip() in LARGE_ORG_SIZES]
        anova_org = {}
        for label, cols, sc in ALL_CONSTRUCTS:
            g1 = person_means(small_orgs, cols, sc, idx)
            g2 = person_means(med_orgs, cols, sc, idx)
            g3 = person_means(large_orgs, cols, sc, idx)
            f_stat, p_val, df_b, df_w = oneway_anova(g1, g2, g3)
            anova_org[label] = {
                "f": round(f_stat, 4) if f_stat is not None else None,
                "p": round(p_val, 4) if p_val is not None else None,
                "df_between": df_b,
                "df_within": df_w,
                "sig": p_val is not None and p_val < 0.05,
            }
        result_inf["anova_by_org_size"] = {
            "groups": ["Small (<500)", "Medium (500-4999)", "Large (5000+)"],
            "group_ns": [len(small_orgs), len(med_orgs), len(large_orgs)],
            "constructs": anova_org,
        }

        return result_inf

    # Build per-sample detail blocks
    result["sample_details"] = {}
    for sample_label, rows in cuts:
        sample_key = sample_meta.get(sample_label, {}).get("key", sample_label.lower().replace(" ", "_"))
        result["sample_details"][sample_key] = {
            "demographics": demographics_for(rows),
            "effect_sizes": effect_sizes_for(rows),
            "cross_tabs": cross_tabs_for(rows),
            "inferential": inferential_for(rows),
        }

    def filter_bias_analysis_for(cuts_list):
        """
        Computes a chi-square test for independence across the four result groups
        for role, organization size, and profit model.

        Returns None when the required sample groups ('Conservative Clean',
        'Flexible Clean', 'Prolific Accepted', 'All V2 Finished') are not all
        present in cuts_list - callers must guard against None.

        Otherwise returns a dict with 'role', 'organization_size', 'profit_model'
        (each {ok, chi2, p_value, df, error}) and 'profit_model_distribution'.
        """
        import scipy.stats
        import numpy as _np

        # Extract the demographic counts for each group
        # These will be lists of lists (contingency tables)
        role_counts = [] # Tech vs Non-tech vs Unclassified
        org_size_counts = []
        profit_model_counts = []

        # Only use the 4 main groups, selected explicitly by label so the
        # analysis does not depend on the ordering of cuts_list.
        required_labels = [
            'Conservative Clean',
            'Flexible Clean',
            'Prolific Accepted',
            'All V2 Finished',
        ]
        cuts_by_label = {sample_label: rows for sample_label, rows in cuts_list}
        missing_labels = [label for label in required_labels if label not in cuts_by_label]
        if missing_labels:
            # Not all required groups are present - skip the analysis gracefully.
            return None
        main_cuts = [(label, cuts_by_label[label]) for label in required_labels]

        for sample_label, rows in main_cuts:
            # Tech vs Non-tech (binary role classification)
            tech_n = sum(1 for r in rows if classify_role_binary(get_role(r, idx), get_other_text(r, idx)) == 'Technical')
            nontech_n = sum(1 for r in rows if classify_role_binary(get_role(r, idx), get_other_text(r, idx)) == 'Non-Technical')
            unclassified_n = sum(1 for r in rows if classify_role_binary(get_role(r, idx), get_other_text(r, idx)) is None)
            role_counts.append([tech_n, nontech_n, unclassified_n])

            # Org Size
            org_sizes = []
            for os_val in ALL_ORG_SIZES:
                org_sizes.append(sum(1 for r in rows if r[idx['Q4_OrgSize']].strip() == os_val))
            org_size_counts.append(org_sizes)

            # Profit Model
            profit_models = []
            for pm_val in ['For-Profit', 'Non-Profit', 'Government/Public Sector']:
                profit_models.append(sum(1 for r in rows if r[idx['Q5_ProfitModel']].strip() == pm_val))
            profit_model_counts.append(profit_models)

        def _run_chi2(contingency_table):
            try:
                table = _np.array(contingency_table, dtype=float)
                # Drop columns that are all-zero across every group to avoid
                # degenerate expected-frequency errors in chi2_contingency.
                col_mask = table.sum(axis=0) > 0
                table = table[:, col_mask]
                # Also drop all-zero rows.
                row_mask = table.sum(axis=1) > 0
                table = table[row_mask, :]
                chi2, p, dof, ex = scipy.stats.chi2_contingency(table)
                return {
                    "ok": True,
                    "chi2": round(float(chi2), 2),
                    "p_value": round(float(p), 4),
                    "df": int(dof),
                    "error": None
                }
            except Exception as e:
                return {
                    "ok": False,
                    "chi2": None,
                    "p_value": None,
                    "df": None,
                    "error": str(e)
                }

        # Collect per-group profit-model counts to power the distribution table.
        profit_model_labels = ['For-Profit', 'Non-Profit', 'Government/Public Sector']
        group_labels = [label for label, _ in main_cuts]
        profit_model_dist = {
            label: {pm: counts[i] for i, pm in enumerate(profit_model_labels)}
            for label, counts in zip(group_labels, profit_model_counts)
        }

        return {
            "role": _run_chi2(role_counts),
            "organization_size": _run_chi2(org_size_counts),
            "profit_model": _run_chi2(profit_model_counts),
            "profit_model_distribution": {
                "labels": profit_model_labels,
                "groups": profit_model_dist,
            },
        }

    # Filter Bias Analysis (Chi-square test across groups)
    fba_result = filter_bias_analysis_for(cuts)
    if fba_result is not None:
        result["filter_bias_analysis"] = fba_result

    # Role category metadata - sourced from OTHER_ROLE_CATEGORIES_PATTERNS so the UI
    # stays consistent with the pipeline without duplicating category names.
    result["role_categories"] = [
        {
            "label": cat,
            "description": OTHER_ROLE_CATEGORIES_DESCRIPTIONS.get(cat, {}).get("description", ""),
            "examples": OTHER_ROLE_CATEGORIES_DESCRIPTIONS.get(cat, {}).get("examples", ""),
        }
        for cat, _ in OTHER_ROLE_CATEGORIES_PATTERNS
    ] + [
        {
            "label": "Uncategorized",
            "description": "Responses that did not match any keyword pattern, or blank entries",
            "examples": "",
        }
    ]

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
