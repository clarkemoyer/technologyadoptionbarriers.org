#!/usr/bin/env python3
"""
TABS V2 Unified Data Analysis
==============================

Consolidated analysis pipeline for the Technology Adoption Barriers Survey V2.
This script replaces four separate scripts with a single entry point that
produces a unified JSON output containing all analysis sections.

Consolidated scripts:
  1. tabs_v2_analysis.py       -> sensitivity section  (descriptive stats, effect sizes, cross-tabs)
  2. tabs_v2_advanced.py       -> advanced section      (PCA, regression, ANOVA, interactions)
  3. tabs_v2_quality_audit.py  -> quality section        (disposition funnel, missing data, response quality)
  4. tabs_v2_validation.py     -> validation section     (EFA, CFA, HTMT, reliability, discriminant validity)

Architecture:
  - One set of deduplicated constants (scales, columns, item names, role patterns)
  - One pandas-based data loader supporting both 3-row Qualtrics and 1-row CRP headers
  - Statistical functions grouped by domain
  - One CLI entry point with argparse
  - One JSON output containing ALL sections
  - All print output goes to stdout for workflow logs

JSON output schema:
  {
    "metadata":   { "n_total", "dataset", "timestamp", "primary_sample" },
    "sensitivity": { ... },      // exact schema of sensitivity-analysis.json
    "advanced":   { "pca", "regression", "anova", "interactions" },
    "quality":    { "disposition_funnel", "missing_data", "response_quality", "distributional",
                    "construct_diagnostics", "iri_filter_bias" },
    "validation": {               // per-sample validation results
      "samples": [
        { "key": "conservative_clean", "label": "...", "n": 87,
          "adequacy": "inadequate", "adequacy_note": "...",
          "Barriers": {...}, "Readiness": {...}, ... },
        ...
      ],
      "primary_sample": "conservative_clean"
    }
  }

Backward compatibility:
  The "sensitivity" key produces the exact same schema as sensitivity-analysis.json.
  The "validation" key contains per-sample validation results with adequacy metadata.
  The pipeline can extract them with one-liners:
    python -c "import json; d=json.load(open('unified.json')); json.dump(d['sensitivity'], open('sensitivity-analysis.json','w'), indent=2)"
    python -c "import json; d=json.load(open('unified.json')); json.dump(d['validation'], open('live-validation.json','w'), indent=2)"

Usage:
    python tabs_v2_unified_data_analysis.py <csv_path> \\
      --json output.json \\
      [--crp200]                        # use pre-filtered CRP dataset (1-header CSV)
      [--skip-validation]               # skip EFA/CFA if deps not installed
      [--linderman]                     # run Linderman-grade extensions for primary sample
      [--primary-sample conservative_clean]

Author: Clarke Moyer, Penn State Smeal DBA
"""

import argparse
import csv
import json
import math
import random
import re
import sys
import warnings
from collections import Counter, OrderedDict, defaultdict
from datetime import datetime

import numpy as np
import pandas as pd
from scipy import stats as sp
from scipy.stats import shapiro, spearmanr

warnings.filterwarnings('ignore', category=FutureWarning)
warnings.filterwarnings('ignore', category=RuntimeWarning)

# ============================================================================
# OPTIONAL IMPORTS - degrade gracefully
# ============================================================================

try:
    from factor_analyzer import FactorAnalyzer
    from factor_analyzer.factor_analyzer import calculate_kmo, calculate_bartlett_sphericity
    HAS_FACTOR_ANALYZER = True
except ImportError:
    HAS_FACTOR_ANALYZER = False

try:
    import semopy
    HAS_SEMOPY = True
except ImportError:
    HAS_SEMOPY = False


# ============================================================================
# CONSTANTS (single canonical set, deduplicated from all 4 scripts)
# ============================================================================

V2_START = "2026-03-23 14:00:00"
PROLIFIC_TEST_ID = 'R_1QK12IJpHjC3wd6'

# Duration thresholds for sample definitions
MIN_DURATION_PIPELINE_CLEAN = 540   # 9 minutes (Smeal eDBA benchmark)
MIN_DURATION_CLEAN = 480            # 8 minutes (conservative analysis filter)
MIN_DURATION_RELAXED = 480
MIN_DURATION_ALL = 120              # 2 minutes (extreme speeders only)
IRI_THRESHOLD_RELAXED = 2           # at least 2 of 3 IRIs correct

# reCAPTCHA and straightlining thresholds
RECAPTCHA_THRESHOLD = 0.5
PARTIAL_STRAIGHTLINING_SD_THRESHOLD = 0.5

# Scale maps
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

# Column definitions
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

# Item names
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

# Role mapping
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

# Other role categorization patterns
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

ALL_CONSTRUCTS = [
    ("barriers", BARRIER_COLS, BARRIER_SCALE),
    ("readiness", READINESS_COLS, READINESS_SCALE),
    ("maturity", MATURITY_COLS, MATURITY_SCALE),
]

# Binary tech/non-tech role classification patterns
_OTHER_ROLE_PATTERNS: list[tuple[re.Pattern[str], str]] = [
    # Technical
    (re.compile(r'\b(cio|chief information officer)\b', re.IGNORECASE), 'Technical'),
    (re.compile(r'\b(cto|chief technology officer)\b', re.IGNORECASE), 'Technical'),
    (re.compile(r'\b(ciso|chief information security officer|chief security officer)\b', re.IGNORECASE), 'Technical'),
    (re.compile(r'\bchief (information|technology|security|data|digital|analytics|innovation|artificial)\b', re.IGNORECASE), 'Technical'),
    (re.compile(r'\b(vp|vice president) of (it|information technology|engineering|technology|information|security|data|software|infrastructure|cyber|digital|analytics)\b', re.IGNORECASE), 'Technical'),
    (re.compile(r'\b(svp|evp|avp|senior vice president|executive vice president|assistant vice president) of (it|information technology|engineering|technology|information|security|data|software|infrastructure|cyber|digital|analytics)\b', re.IGNORECASE), 'Technical'),
    (re.compile(r'\bdirector of (it|information technology|engineering|technology|information|security|data|software|infrastructure|cyber|digital)\b', re.IGNORECASE), 'Technical'),
    (re.compile(r'\b(it|technology|software|data|infrastructure|network|security|systems) director\b', re.IGNORECASE), 'Technical'),
    (re.compile(r'\b(software |systems |network |security |data |infrastructure |database |cloud |devops |platform )?(engineer|architect|developer|programmer)\b', re.IGNORECASE), 'Technical'),
    (re.compile(r'\bsystems administrator\b', re.IGNORECASE), 'Technical'),
    (re.compile(r'\b(network|infrastructure|cybersecurity|data scientist|data engineer|software|database)\b', re.IGNORECASE), 'Technical'),
    (re.compile(r'\b(analytics|ai|artificial intelligence)\b', re.IGNORECASE), 'Technical'),
    (re.compile(r'\b(online learning|e-learning|digital learning)\b', re.IGNORECASE), 'Technical'),
    # Non-Technical
    (re.compile(r'\bchief (executive|financial|operating|human|marketing|revenue|strategy|product|privacy|legal|compliance)\b', re.IGNORECASE), 'Non-Technical'),
    (re.compile(r'\b(vp|vice president|svp|evp|avp) of (finance|financial|operations|human resources|hr|marketing|sales|strategy|legal|compliance|product)\b', re.IGNORECASE), 'Non-Technical'),
    (re.compile(r'\b(vice president|vp|svp|evp|avp|senior vp|executive vp)\b', re.IGNORECASE), 'Non-Technical'),
    (re.compile(r'\b(president|owner|founder|co-founder)\b', re.IGNORECASE), 'Non-Technical'),
    (re.compile(r'\b(managing director|executive director)\b', re.IGNORECASE), 'Non-Technical'),
    (re.compile(r'\b(program manager|project manager|operations manager|finance manager|hr manager|marketing manager)\b', re.IGNORECASE), 'Non-Technical'),
]

# Theoretical sub-construct groupings for barriers EFA
BARRIER_SUBCONSTRUCTS = {
    'Organizational & Cultural': [0, 2],
    'Strategic & Operational': [1, 6, 8, 9, 10, 11],
    'Resource & Capability': [3, 4, 5, 7],
    'Risk, Trust & External': [12, 13, 14, 15, 16, 17]
}

READINESS_SUBCONSTRUCTS = {
    'Strategic Leadership': [0, 1, 2],
    'Culture & Change': [3, 4, 7],
    'Workforce & Skills': [5, 6],
    'Infrastructure': [8, 9, 10],
    'Data & Analytics': [11, 12, 13],
    'Process & Operational': [14, 15],
    'Financial': [16]
}


# ============================================================================
# ROLE CLASSIFICATION FUNCTIONS
# ============================================================================

def classify_role(text):
    """Classify a free-text 'Other' role as Technical, Non-Technical, or Other."""
    if not text or not text.strip():
        return 'Other'
    for pattern, classification in _OTHER_ROLE_PATTERNS:
        if pattern.search(text):
            return classification
    return 'Other'


def classify_role_binary(role, other_text=''):
    """Return the binary Tech/Non-Tech role group for a respondent."""
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
    """Return True if role maps to the Technical group under the binary classification."""
    return classify_role_binary(role, other_text) == 'Technical'


def categorize_other_role(text):
    """Categorize a free-text 'Other' role into a broad group."""
    if not text or not text.strip():
        return "Uncategorized"
    t = text.strip()
    for category, patterns in OTHER_ROLE_CATEGORIES_PATTERNS:
        for pat in patterns:
            if re.search(pat, t, re.IGNORECASE):
                return category
    return "Uncategorized"


# ============================================================================
# CSV-BASED DATA HELPERS (for sensitivity section using raw rows)
# ============================================================================

def _get_role_from_row(row, idx):
    """Get short role label from raw CSV row."""
    return ROLE_MAP.get(row[idx['Q1_Role']].strip(), 'Unknown')


def _get_other_text_from_row(row, idx):
    """Get free-text 'Other' role response from raw CSV row."""
    other_text_idx = idx.get('Q1_Role_11_TEXT')
    if other_text_idx is not None and other_text_idx < len(row):
        return row[other_text_idx].strip()
    return ''


def _score_item(row, col, scale, idx):
    """Score a single response using the given scale map."""
    val = row[idx[col]].strip()
    return scale.get(val, None)


def _get_duration(row, idx):
    """Get duration in seconds."""
    try:
        return int(row[idx['Duration (in seconds)']])
    except (ValueError, KeyError):
        return None


def _iri_correct_count(row, idx):
    """Count how many of 3 IRI attention checks are correct."""
    correct = 0
    if row[idx[BARRIER_IRI]].strip() == IRI_BARRIER_ANSWER:
        correct += 1
    if row[idx[READINESS_IRI]].strip() == IRI_READINESS_ANSWER:
        correct += 1
    if row[idx[MATURITY_IRI]].strip() == IRI_MATURITY_ANSWER:
        correct += 1
    return correct


def _iri_all_pass(row, idx):
    """Check if all 3 IRIs are correct."""
    return _iri_correct_count(row, idx) == 3


def _person_means_rows(rows, cols, scale, idx):
    """Compute person-level scale means from raw CSV rows."""
    out = []
    for r in rows:
        vals = [_score_item(r, c, scale, idx) for c in cols]
        vals = [v for v in vals if v is not None]
        if vals:
            out.append(sum(vals) / len(vals))
        else:
            out.append(None)
    return out


def _is_finished(row, idx):
    """Check if response is finished."""
    if 'Finished' not in idx:
        return True
    val = row[idx['Finished']].strip().upper()
    return val in ('TRUE', '1')


def _get_recaptcha_score(row, idx):
    """Get reCAPTCHA score.

    Handles three column formats (checked in priority order):
    - Q_RecaptchaScore (numeric 0.0-1.0, from enriched Qualtrics CSV)
    - RecaptchaPass (derived boolean, from CRP public CSV)
    - Q_RecaptchaStatus ('complete'/'error', fallback)
    """
    if 'Q_RecaptchaScore' in idx:
        val = row[idx['Q_RecaptchaScore']].strip()
        if val == '':
            return 1.0
        try:
            return float(val)
        except ValueError:
            return 1.0
    if 'RecaptchaPass' in idx:
        val = row[idx['RecaptchaPass']].strip().upper() if idx['RecaptchaPass'] < len(row) else ''
        return 1.0 if val == 'TRUE' else 0.0
    if 'Q_RecaptchaStatus' in idx:
        status = row[idx['Q_RecaptchaStatus']].strip().lower()
        return 1.0 if status == 'complete' else 0.0
    return 1.0


def _get_straightlining_count(row, idx):
    """Get Qualtrics straightlining count.

    Handles three column formats (checked in priority order):
    - Q_StraightliningCount (integer, from enriched Qualtrics CSV)
    - StraightliningCount (derived integer, from CRP public CSV)
    - Q_StraightliningPercentage (float %, fallback)
    """
    if 'Q_StraightliningCount' in idx:
        try:
            return int(row[idx['Q_StraightliningCount']].strip() or '0')
        except (ValueError, KeyError):
            return 0
    if 'StraightliningCount' in idx:
        try:
            return int(row[idx['StraightliningCount']].strip() or '0')
        except (ValueError, KeyError):
            return 0
    if 'Q_StraightliningPercentage' in idx:
        try:
            pct = float(row[idx['Q_StraightliningPercentage']].strip() or '0')
            return 0 if pct == 0 else 1
        except (ValueError, KeyError):
            return 0
    return 0


def _within_person_sd(responses):
    """Compute within-person SD for categorical responses."""
    non_empty = [r for r in responses if r != '']
    if len(non_empty) < 2:
        return float('nan')
    unique_vals = list(dict.fromkeys(non_empty))
    numeric = [unique_vals.index(r) for r in non_empty]
    mean_val = sum(numeric) / len(numeric)
    variance = sum((val - mean_val) ** 2 for val in numeric) / len(numeric)
    return math.sqrt(variance)


def _has_partial_straightlining(row, idx, threshold=PARTIAL_STRAIGHTLINING_SD_THRESHOLD):
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
        sd = _within_person_sd(responses)
        if not math.isnan(sd) and sd < threshold:
            return True
    return False


def _has_auth_flag(row, idx):
    """Check if Prolific auth checks flag this response.

    Handles two column formats:
    - Auth_LLM + Auth_Bots (raw Prolific columns, from enriched CSV)
    - Auth_Flagged (derived boolean, from CRP public CSV)
    """
    # CRP public CSV: derived boolean column
    if 'Auth_Flagged' in idx:
        val = row[idx['Auth_Flagged']].strip().upper() if idx['Auth_Flagged'] < len(row) else ''
        return val == 'TRUE'
    # Enriched CSV: raw Prolific auth columns
    if 'Auth_LLM' not in idx or 'Auth_Bots' not in idx:
        return False
    llm = row[idx['Auth_LLM']].strip().upper() if idx['Auth_LLM'] < len(row) else ''
    bots = row[idx['Auth_Bots']].strip().upper() if idx['Auth_Bots'] < len(row) else ''
    return llm in ('LOW', 'MIXED') or bots in ('LOW', 'MIXED')


def _get_prolific_status(row, idx):
    """Get Prolific submission status from enrichment column."""
    if 'Prolific_Status' not in idx:
        return ''
    val = row[idx['Prolific_Status']].strip() if idx['Prolific_Status'] < len(row) else ''
    return val


def _org_bucket(row, idx):
    """Classify org size into Small/Medium/Large."""
    os_val = row[idx['Q4_OrgSize']].strip()
    if os_val in ('<100', '100-499'):
        return 'Small (<500)'
    elif os_val in ('500-999', '1000-4999'):
        return 'Medium (500-4999)'
    elif os_val in LARGE_ORG_SIZES:
        return 'Large (5000+)'
    return None


# ============================================================================
# STATISTICAL HELPER FUNCTIONS
# ============================================================================


def count_bool_true(mapping):
    """Count boolean-True values in *mapping*, accepting numpy.bool_.

    Only ``bool`` and ``numpy.bool_`` instances are considered.  Non-boolean
    truthy values (e.g. ``1``, ``1.0``, ``np.int64(1)``) are intentionally
    excluded so that ``pass_count`` is never silently inflated by non-verdict
    fields that happen to be added to the dict before counting.
    """
    return sum(
        1 for val in mapping.values()
        if isinstance(val, (bool, np.bool_)) and bool(val)
    )


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
    """Compute the confidence interval for the mean."""
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


def _calc_d(g1, g2):
    """Helper to calculate raw Cohen's d for two lists."""
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
    """Compute Cohen's d with 95% CI via percentile bootstrap."""
    g1 = [v for v in g1 if v is not None]
    g2 = [v for v in g2 if v is not None]
    d = _calc_d(g1, g2)
    if d is None:
        return (None, None, None)
    n1, n2 = len(g1), len(g2)
    boot_d = []
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
    lower_idx = max(0, min(int(len(boot_d) * (alpha / 2.0)), len(boot_d) - 1))
    upper_idx = max(0, min(int(len(boot_d) * (1.0 - alpha / 2.0)), len(boot_d) - 1))
    return (d, boot_d[lower_idx], boot_d[upper_idx])


def cronbach_alpha_rows(rows, cols, scale, idx):
    """Compute Cronbach's alpha from raw CSV rows."""
    k = len(cols)
    scored = []
    for r in rows:
        vals = [_score_item(r, c, scale, idx) for c in cols]
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


def skewness_manual(vals):
    """Compute sample skewness."""
    n = len(vals)
    if n < 3:
        return None
    m = sum(vals) / n
    s = math.sqrt(sum((x - m) ** 2 for x in vals) / (n - 1))
    if s == 0:
        return 0
    return (n / ((n - 1) * (n - 2))) * sum(((x - m) / s) ** 3 for x in vals)


def kurtosis_excess_manual(vals):
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


# ── t-distribution helpers ──

def _t_ppf_two_tailed(p, df, tol=1e-5):
    """Approximate critical t-value for a given two-tailed probability."""
    if df <= 0 or p <= 0 or p >= 1:
        return None
    low = 0.0
    high = 100.0
    while _t_cdf_two_tailed(high, df) > p:
        high *= 2.0
    best_t = 0.0
    for _ in range(100):
        mid = (low + high) / 2.0
        current_p = _t_cdf_two_tailed(mid, df)
        if abs(current_p - p) < tol:
            return mid
        if current_p > p:
            low = mid
        else:
            high = mid
        best_t = mid
    return best_t


def _t_cdf_two_tailed(t_abs, df):
    """Approximate two-tailed p-value for Student's t-distribution."""
    x = df / (df + t_abs ** 2)
    p = _regularized_incomplete_beta(x, df / 2.0, 0.5)
    return max(0.0, min(1.0, p))


def _regularized_incomplete_beta(x, a, b, max_iter=200, tol=1e-12):
    """Regularized incomplete beta function I_x(a, b) via continued fraction."""
    if x <= 0:
        return 0.0
    if x >= 1:
        return 1.0
    # Symmetry relation for better convergence (Numerical Recipes §6.4).
    # The continued fraction converges faster when x < (a+1)/(a+b+2).
    if x > (a + 1.0) / (a + b + 2.0):
        return 1.0 - _regularized_incomplete_beta(1.0 - x, b, a, max_iter, tol)
    ln_prefix = _ln_beta_prefix(x, a, b)
    c = 1.0
    d = 1.0 - (a + b) * x / (a + 1.0)
    if abs(d) < 1e-30:
        d = 1e-30
    d = 1.0 / d
    f = d
    for m in range(1, max_iter + 1):
        num = m * (b - m) * x / ((a + 2 * m - 1) * (a + 2 * m))
        d = 1.0 + num * d
        if abs(d) < 1e-30:
            d = 1e-30
        c = 1.0 + num / c
        if abs(c) < 1e-30:
            c = 1e-30
        d = 1.0 / d
        f *= d * c
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
    """Log of the beta function B(a, b)."""
    return math.lgamma(a) + math.lgamma(b) - math.lgamma(a + b)


def welch_t_test(g1, g2):
    """Welch's t-test for independent samples with unequal variances."""
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
    num = (s1_sq / n1 + s2_sq / n2) ** 2
    denom = (s1_sq / n1) ** 2 / (n1 - 1) + (s2_sq / n2) ** 2 / (n2 - 1)
    if denom == 0:
        return (None, None, None, None, None)
    df = num / denom
    p = _t_cdf_two_tailed(abs(t_stat), df)
    t_crit = _t_ppf_two_tailed(0.05, df)
    if t_crit is not None:
        ci_lower = (m1 - m2) - t_crit * se
        ci_upper = (m1 - m2) + t_crit * se
    else:
        ci_lower, ci_upper = None, None
    return (t_stat, p, df, ci_lower, ci_upper)


def _f_cdf_right(f_val, df1, df2):
    """Right-tail p-value for F-distribution."""
    if f_val <= 0:
        return 1.0
    x = df2 / (df2 + df1 * f_val)
    return _regularized_incomplete_beta(x, df2 / 2.0, df1 / 2.0)


def oneway_anova(*groups):
    """One-way ANOVA F-test for 2+ independent groups."""
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


# ============================================================================
# PANDAS-BASED VALIDATION FUNCTIONS
# ============================================================================

def cronbach_alpha_pd(data):
    """Cronbach's alpha with listwise deletion (pandas DataFrame)."""
    d = data.dropna()
    if len(d) < 2 or d.shape[1] < 2:
        return np.nan
    k = d.shape[1]
    var_sum = d.var(ddof=1).sum()
    total_var = d.sum(axis=1).var(ddof=1)
    if total_var == 0:
        return np.nan
    return (k / (k - 1)) * (1 - var_sum / total_var)


def cronbach_alpha_ci_pd(data):
    """95% CI via Feldt (1965) method."""
    alpha = cronbach_alpha_pd(data)
    if np.isnan(alpha):
        return alpha, (np.nan, np.nan)
    d = data.dropna()
    n, k = d.shape
    f_upper = sp.f.ppf(0.975, n - 1, (n - 1) * (k - 1))
    lower = 1 - (1 - alpha) * f_upper
    f_lower = sp.f.ppf(0.025, n - 1, (n - 1) * (k - 1))
    upper = 1 - (1 - alpha) * f_lower
    return alpha, (max(0.0, lower), min(1.0, upper))


def corrected_item_total(data):
    """Corrected item-total correlations."""
    d = data.dropna()
    results = {}
    for col in d.columns:
        rest = d.drop(columns=[col]).sum(axis=1)
        r = d[col].corr(rest)
        results[col] = round(r, 4)
    return results


def composite_reliability(loadings):
    """CR from standardized factor loadings."""
    lam = np.array(loadings, dtype=float)
    if len(lam) == 0 or np.any(np.isnan(lam)):
        return np.nan
    sum_lam = lam.sum()
    error_var = 1 - lam ** 2
    denom = sum_lam ** 2 + error_var.sum()
    if denom == 0:
        return np.nan
    return sum_lam ** 2 / denom


def mcdonalds_omega(data):
    """McDonald's omega_t (total)."""
    d = data.dropna()
    if not HAS_FACTOR_ANALYZER or len(d) < 10:
        return np.nan, []
    fa = FactorAnalyzer(n_factors=1, rotation=None, method='ml')
    try:
        fa.fit(d)
    except Exception:
        fa = FactorAnalyzer(n_factors=1, rotation=None, method='minres')
        fa.fit(d)
    loadings = fa.loadings_.flatten()
    sum_lam = loadings.sum()
    error_var = (1 - loadings ** 2)
    omega = sum_lam ** 2 / (sum_lam ** 2 + error_var.sum())
    return omega, loadings.tolist()


def ave_from_loadings(loadings):
    """AVE = mean of squared standardized factor loadings."""
    lam = np.array(loadings)
    return float(np.mean(lam ** 2))


def run_efa(data, construct_name, n_factors=None, max_factors=6):
    """Run EFA with KMO, Bartlett's, parallel analysis, and promax rotation."""
    d = data.dropna()
    result = {
        'construct': construct_name,
        'n_valid': len(d),
        'n_items': d.shape[1],
    }
    if not HAS_FACTOR_ANALYZER:
        result['error'] = 'factor_analyzer not installed'
        return result

    try:
        kmo_all, kmo_model = calculate_kmo(d)
        result['kmo_model'] = round(float(kmo_model), 4)
        result['kmo_per_item'] = {col: round(float(v), 4) for col, v in zip(d.columns, kmo_all)}
    except Exception as e:
        result['kmo_error'] = str(e)

    try:
        chi2, p_val = calculate_bartlett_sphericity(d)
        result['bartlett_chi2'] = round(float(chi2), 2)
        result['bartlett_p'] = float(p_val)
    except Exception as e:
        result['bartlett_error'] = str(e)

    if n_factors is None:
        n_factors = parallel_analysis(d, max_factors=max_factors)
        result['parallel_analysis_factors'] = n_factors
    result['n_factors'] = n_factors

    rotation = 'promax' if n_factors > 1 else None
    try:
        fa = FactorAnalyzer(n_factors=n_factors, rotation=rotation, method='ml')
        fa.fit(d)
    except Exception:
        fa = FactorAnalyzer(n_factors=n_factors, rotation=rotation, method='minres')
        fa.fit(d)

    loadings = fa.loadings_
    result['loadings'] = {d.columns[i]: [round(float(v), 4) for v in loadings[i]]
                          for i in range(loadings.shape[0])}

    ev, v = fa.get_eigenvalues()
    result['eigenvalues_original'] = [round(float(x), 4) for x in ev[:max_factors]]

    var_explained = fa.get_factor_variance()
    result['variance_explained'] = {
        'per_factor': [round(float(x), 4) for x in var_explained[1]],
        'cumulative': [round(float(x), 4) for x in var_explained[2]],
        'total': round(float(var_explained[2][-1]), 4)
    }

    if n_factors > 1 and hasattr(fa, 'phi_') and fa.phi_ is not None:
        phi = fa.phi_
        result['factor_correlations'] = [[round(float(phi[i][j]), 4)
                                          for j in range(n_factors)]
                                         for i in range(n_factors)]

    result['communalities'] = {d.columns[i]: round(float(v), 4)
                               for i, v in enumerate(fa.get_communalities())}
    return result


def parallel_analysis(data, n_iter=1000, max_factors=6, percentile=95, seed=42):
    """Horn's parallel analysis for factor retention."""
    d = data.dropna()
    n, p = d.shape
    rng = np.random.RandomState(seed)
    corr = np.corrcoef(d.values, rowvar=False)
    actual_ev = np.sort(np.linalg.eigvalsh(corr))[::-1]
    random_evs = np.zeros((n_iter, p))
    for i in range(n_iter):
        rand_data = rng.normal(size=(n, p))
        rand_corr = np.corrcoef(rand_data, rowvar=False)
        random_evs[i] = np.sort(np.linalg.eigvalsh(rand_corr))[::-1]
    threshold = np.percentile(random_evs, percentile, axis=0)
    n_factors = 0
    for i in range(min(max_factors, p)):
        if actual_ev[i] > threshold[i]:
            n_factors += 1
        else:
            break
    return max(1, n_factors)


def run_cfa(data, model_spec, construct_name):
    """Run CFA using semopy."""
    if not HAS_SEMOPY:
        return {'construct': construct_name, 'error': 'semopy not installed'}
    d = data.dropna()
    result = {'construct': construct_name, 'n_valid': len(d)}
    try:
        mod = semopy.Model(model_spec)
        mod.fit(d)
        fit_stats = semopy.calc_stats(mod)
        # semopy 2.x returns stats as *columns* with a single 'Value' row;
        # handle both orientations so the code works regardless of version.
        if 'Value' in fit_stats.index and 'CFI' not in fit_stats.index:
            # Stats are columns, 'Value' is the row label (semopy ≥2.x)
            def _stat(name):
                return float(fit_stats.loc['Value', name]) if name in fit_stats.columns else None
        else:
            # Stats are row labels (hypothetical older layout)
            def _stat(name):
                return float(fit_stats.loc[name, 'Value']) if name in fit_stats.index else None
        result['chi2'] = round(_stat('chi2'), 3) if _stat('chi2') is not None else None
        result['df'] = int(_stat('DoF')) if _stat('DoF') is not None else None
        result['chi2_p'] = round(_stat('chi2 p-value'), 4) if _stat('chi2 p-value') is not None else None
        result['cfi'] = round(_stat('CFI'), 4) if _stat('CFI') is not None else None
        result['tli'] = round(_stat('TLI'), 4) if _stat('TLI') is not None else None
        result['rmsea'] = round(_stat('RMSEA'), 4) if _stat('RMSEA') is not None else None
        result['srmr'] = round(_stat('SRMR'), 4) if _stat('SRMR') is not None else None
        result['aic'] = round(_stat('AIC'), 2) if _stat('AIC') is not None else None
        result['bic'] = round(_stat('BIC'), 2) if _stat('BIC') is not None else None
        est_std = mod.inspect(std_est=True)
        loadings = est_std[(est_std['op'] == '~') & (est_std['Est. Std'].notna())]
        result['standardized_loadings'] = {
            row['lval']: round(float(row['Est. Std']), 4)
            for _, row in loadings.iterrows()
        }
    except Exception as e:
        result['error'] = str(e)
    return result


def htmt_ratio(data1, data2):
    """HTMT ratio for discriminant validity."""
    combined = pd.concat([data1, data2], axis=1).dropna()
    if len(combined) < 3:
        return np.nan
    d1 = combined.iloc[:, :data1.shape[1]]
    d2 = combined.iloc[:, data1.shape[1]:]
    p1, p2 = d1.shape[1], d2.shape[1]
    if p1 < 2 or p2 < 2:
        return np.nan
    w1 = d1.corr().values
    mask1 = ~np.eye(p1, dtype=bool)
    within1 = np.mean(np.abs(w1[mask1]))
    w2 = d2.corr().values
    mask2 = ~np.eye(p2, dtype=bool)
    within2 = np.mean(np.abs(w2[mask2]))
    between = []
    for c1 in d1.columns:
        for c2 in d2.columns:
            between.append(abs(d1[c1].corr(d2[c2])))
    between_mean = np.mean(between)
    geo = np.sqrt(within1 * within2)
    return between_mean / geo if geo > 0 else np.nan


def htmt_bootstrap_ci(data1, data2, n_boot=2000, ci=0.95, seed=42):
    """Bootstrap CI for HTMT ratio."""
    combined = pd.concat([data1, data2], axis=1).dropna()
    if len(combined) < 10:
        return np.nan, (np.nan, np.nan)
    point = htmt_ratio(data1, data2)
    n = len(combined)
    boot_vals = []
    rng = np.random.default_rng(seed)
    for _ in range(n_boot):
        idx = rng.choice(n, size=n, replace=True)
        b = combined.iloc[idx]
        b1 = b.iloc[:, :data1.shape[1]]
        b2 = b.iloc[:, data1.shape[1]:]
        h = htmt_ratio(b1, b2)
        if not np.isnan(h):
            boot_vals.append(h)
    if len(boot_vals) < 100:
        return point, (np.nan, np.nan)
    alpha = (1 - ci) / 2
    lower = np.percentile(boot_vals, alpha * 100)
    upper = np.percentile(boot_vals, (1 - alpha) * 100)
    return point, (round(lower, 4), round(upper, 4))


def fornell_larcker(ave_dict, corr_matrix):
    """Fornell-Larcker criterion check."""
    constructs = list(ave_dict.keys())
    results = []
    for i, c1 in enumerate(constructs):
        for j, c2 in enumerate(constructs):
            if i >= j:
                continue
            sqrt_ave1 = math.sqrt(ave_dict[c1])
            sqrt_ave2 = math.sqrt(ave_dict[c2])
            r = corr_matrix[c1][c2]
            passes = (sqrt_ave1 > abs(r)) and (sqrt_ave2 > abs(r))
            results.append({
                'pair': f"{c1}-{c2}",
                'sqrt_ave_1': round(sqrt_ave1, 4),
                'sqrt_ave_2': round(sqrt_ave2, 4),
                'correlation': round(r, 4),
                'passes': passes
            })
    return results


def normality_tests(data, item_names):
    """Shapiro-Wilk, skewness, kurtosis for each item."""
    d = data.dropna()
    results = []
    for i, col in enumerate(d.columns):
        vals = d[col].values
        name = item_names[i] if i < len(item_names) else col
        sw_stat, sw_p = shapiro(vals) if len(vals) >= 3 else (np.nan, np.nan)
        results.append({
            'item': name,
            'column': col,
            'mean': round(float(vals.mean()), 4),
            'sd': round(float(vals.std(ddof=1)), 4),
            'skewness': round(float(sp.skew(vals)), 4),
            'kurtosis': round(float(sp.kurtosis(vals)), 4),
            'shapiro_w': round(float(sw_stat), 4),
            'shapiro_p': round(float(sw_p), 6),
            'normal_p05': sw_p > 0.05 if not np.isnan(sw_p) else None
        })
    return results


def split_half_reliability(data):
    """Spearman-Brown split-half reliability (odd-even split)."""
    d = data.dropna()
    if len(d) < 5 or d.shape[1] < 4:
        return np.nan
    cols = list(d.columns)
    odd = d[[cols[i] for i in range(0, len(cols), 2)]]
    even = d[[cols[i] for i in range(1, len(cols), 2)]]
    odd_total = odd.sum(axis=1)
    even_total = even.sum(axis=1)
    r = odd_total.corr(even_total)
    sb = 2 * r / (1 + r) if (1 + r) != 0 else np.nan
    return round(sb, 4)


def inter_item_diagnostics(data):
    """Mean, min, max of inter-item correlation matrix."""
    d = data.dropna()
    corr = d.corr().values
    n = corr.shape[0]
    mask = ~np.eye(n, dtype=bool)
    off_diag = corr[mask]
    return {
        'mean': round(float(off_diag.mean()), 4),
        'min': round(float(off_diag.min()), 4),
        'max': round(float(off_diag.max()), 4),
        'sd': round(float(off_diag.std()), 4),
        'negative_count': int((off_diag < 0).sum()),
        'below_015_count': int((off_diag < 0.15).sum()),
    }


def alpha_if_deleted(data, item_names):
    """Cronbach's alpha if each item is deleted."""
    base_alpha = cronbach_alpha_pd(data)
    results = []
    for i, col in enumerate(data.columns):
        reduced = data.drop(columns=[col])
        a = cronbach_alpha_pd(reduced)
        name = item_names[i] if i < len(item_names) else col
        results.append({
            'item': name,
            'column': col,
            'alpha_if_deleted': round(a, 4),
            'change': round(a - base_alpha, 4) if not np.isnan(a) and not np.isnan(base_alpha) else None,
            'flag_increase': a > base_alpha if not np.isnan(a) and not np.isnan(base_alpha) else False
        })
    return results


# ============================================================================
# DATA LOADING
# ============================================================================

def load_qualtrics_csv(csv_path, single_header=False):
    """Load CSV and return (idx, data_rows).

    Args:
        csv_path: Path to CSV file.
        single_header: If True, CSV has 1 header row (CRP public format).
                       If False (default), CSV has 3-row Qualtrics header.
    """
    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.reader(f)
        row1 = next(reader)
        if not single_header:
            next(reader)  # skip Qualtrics description row
            next(reader)  # skip Qualtrics import ID row
        data = list(reader)
    idx = {h: i for i, h in enumerate(row1)}
    return idx, data


def filter_samples(data, idx, crp200=False):
    """Create sample cuts from V2 data. Returns (v2_rows, samples_dict).

    Args:
        data: list of row lists from load_qualtrics_csv (values accessed via idx)
        idx:  column-name-to-index map (header → column position)
        crp200: when True, skip the V2_START date filter entirely.
                The frozen CRP dataset is V2-only by construction, so no
                date filtering is needed. When False, StartDate values are
                parsed as datetimes and compared against V2_START, which
                avoids the lexicographic pitfall where a date-only string
                (e.g. after upstream de-identification strips the time
                component) sorts before the V2_START datetime string and
                would silently exclude same-day responses from the sample.
    """
    if crp200:
        v2_all_rows = list(data)
    else:
        from datetime import datetime as _dt
        _v2_start = _dt.fromisoformat(V2_START)

        def _after_v2_start(row):
            raw = row[idx['StartDate']]
            try:
                # Accept both "YYYY-MM-DD HH:MM:SS" and "YYYY-MM-DD" formats
                ts = _dt.fromisoformat(raw)
            except (ValueError, TypeError):
                return False
            return ts >= _v2_start

        v2_all_rows = [
            r for r in data
            if _after_v2_start(r)
            or ('ResponseId' in idx and r[idx['ResponseId']] == PROLIFIC_TEST_ID)
        ]

    # Deduplicate by PROLIFIC_PID
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
                existing_finished = (
                    finished_idx_col is not None
                    and existing[finished_idx_col].strip().upper() in ('TRUE', '1')
                )
                new_finished = (
                    finished_idx_col is not None
                    and r[finished_idx_col].strip().upper() in ('TRUE', '1')
                )
                if new_finished or not existing_finished:
                    by_pid[pid] = r
        v2 = list(by_pid.values())
    else:
        v2 = v2_all_rows

    v2_finished = [r for r in v2 if _is_finished(r, idx)
                   and _get_duration(r, idx) is not None
                   and _get_duration(r, idx) >= MIN_DURATION_ALL]

    # If Prolific_Status column exists, filter by APPROVED.
    # If not (e.g., CRP public CSV), treat all rows as accepted - the CRP
    # dataset only contains Prolific-accepted respondents by construction.
    if 'Prolific_Status' in idx:
        prolific_accepted = [r for r in v2 if _get_prolific_status(r, idx) == 'APPROVED']
    else:
        prolific_accepted = list(v2)

    flexible_clean = [r for r in prolific_accepted
                      if _is_finished(r, idx)
                      and _get_duration(r, idx) is not None
                      and _get_duration(r, idx) >= MIN_DURATION_CLEAN
                      and _iri_all_pass(r, idx)]

    conservative_clean = [r for r in flexible_clean
                          if _get_duration(r, idx) >= MIN_DURATION_PIPELINE_CLEAN
                          and _get_recaptcha_score(r, idx) >= RECAPTCHA_THRESHOLD
                          and _get_straightlining_count(r, idx) == 0
                          and not _has_partial_straightlining(r, idx)
                          and not _has_auth_flag(r, idx)]

    samples = {
        "conservative_clean": conservative_clean,
        "flexible_clean": flexible_clean,
        "prolific_accepted": prolific_accepted,
        "v2_finished": v2_finished,
        "v2_all": v2,
    }
    return v2, samples


def load_data_pandas(csv_path, crp200=False):
    """Load and prepare dataset as pandas DataFrame with numeric scales.

    Supports both:
      - 3-row Qualtrics headers (standard export)
      - 1-row CRP headers (--crp200 flag)
    """
    if crp200:
        df = pd.read_csv(csv_path, encoding='utf-8-sig')
    else:
        df = pd.read_csv(csv_path, encoding='utf-8-sig', skiprows=[1, 2])

    df['Duration (in seconds)'] = pd.to_numeric(df['Duration (in seconds)'], errors='coerce')

    if not crp200:
        df['StartDate'] = pd.to_datetime(df['StartDate'], errors='coerce')
        v2_mask = (df['StartDate'] >= V2_START) | (df['ResponseId'] == PROLIFIC_TEST_ID)
        df = df[v2_mask].copy()

    # Encode scales
    for col in BARRIER_COLS + [BARRIER_IRI]:
        if col in df.columns:
            df[col] = df[col].map(BARRIER_SCALE)
    for col in READINESS_COLS + [READINESS_IRI]:
        if col in df.columns:
            df[col] = df[col].apply(lambda x: np.nan if str(x).strip() == "Don't Know"
                                    else READINESS_SCALE.get(str(x).strip(), np.nan) if pd.notna(x) else np.nan)
    for col in MATURITY_COLS + [MATURITY_IRI]:
        if col in df.columns:
            df[col] = df[col].apply(lambda x: np.nan if str(x).strip() == "Don't Know"
                                    else MATURITY_SCALE.get(str(x).strip(), np.nan) if pd.notna(x) else np.nan)

    if not crp200:
        # IRI correctness and filtering
        df['iri_barrier_ok'] = (df[BARRIER_IRI] == BARRIER_SCALE[IRI_BARRIER_ANSWER])
        df['iri_readiness_ok'] = (df[READINESS_IRI] == READINESS_SCALE[IRI_READINESS_ANSWER])
        df['iri_maturity_ok'] = (df[MATURITY_IRI] == MATURITY_SCALE[IRI_MATURITY_ANSWER])
        df['iri_all_ok'] = df['iri_barrier_ok'] & df['iri_readiness_ok'] & df['iri_maturity_ok']
        clean = df[(df['Duration (in seconds)'] >= MIN_DURATION_CLEAN) & df['iri_all_ok']].copy()
        print(f"  V2 total: {len(df)} | Clean (>={MIN_DURATION_CLEAN}s + 3 IRIs): {len(clean)}")
        # Return (clean_df, full_v2_df) - quality audit needs the full population
        return clean, df
    else:
        print(f"  CRP-200 dataset: {len(df)} respondents loaded")
        # In CRP mode, the full population IS the selected sample
        return df, df


# ============================================================================
# SECTION 1: SENSITIVITY ANALYSIS (from tabs_v2_analysis.py)
# ============================================================================

def sensitivity_to_json(cuts, idx):
    """Return sensitivity analysis results matching sensitivity-analysis.json schema."""
    result = {"samples": [], "metrics": []}

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
            "note": "Self-reported by participants within the TABS survey instrument.",
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
                {"filter_id": "current_country_of_residence", "label": "Current Country of Residence",
                 "selected_values": ["United States"], "base_field": True},
                {"filter_id": "employment_status", "label": "Employment Status",
                 "selected_values": ["Full-Time"], "base_field": True},
                {"filter_id": "employment_sector", "label": "Employer Type",
                 "selected_values": [
                     "Employee of a for-profit company or business or of an individual, for wages, salary, or commissions",
                     "Employee of a not-for-profit, tax-exempt, or charitable organization",
                     "Local government employee (city, county, etc.)",
                     "State government employee",
                     "Federal government employee",
                     "Self-employed in own not-incorporated business, professional practice, or farm",
                     "Self-employed in own incorporated business, professional practice, or farm",
                     "Working without pay in family business or farm",
                 ], "base_field": False},
                {"filter_id": "company_size", "label": "Company Size",
                 "selected_values": ["50-249", "250-999", "1000+"], "base_field": False},
                {"filter_id": "occupation", "label": "Job Position",
                 "selected_values": [
                     "C-Level (e.g. CEO, CFO), Owner, Partner, President",
                     "Vice President (EVP, SVP, AVP, VP)",
                     "Director (Group Director, Sr. Director, Director)",
                     "Manager (Group Manager, Sr. Manager, Manager, Program Manager)",
                 ], "base_field": False},
            ],
            "prescreener_note": "Up to 15 prescreener filters can be selected per export.",
            "fields": {
                "age": "Participant age", "sex": "Biological sex", "ethnicity": "Ethnic background",
                "language": "Primary/first language", "country_of_residence": "Current country of residence",
                "nationality": "Nationality", "country_of_birth": "Country of birth",
                "student_status": "Current student status", "employment_status": "Employment status",
                "employment_sector": "Employment sector (prescreener)",
                "industry": "Industry classification (prescreener)",
                "company_size": "Company/organization size (prescreener)",
                "occupation": "Occupation/job title category (prescreener)",
                "education_level": "Education level (prescreener)",
                "household_income": "Household income (prescreener)",
                "fluent_languages": "Fluent languages (prescreener)",
            },
            "cross_validation": {
                "description": "Prolific prescreener fields overlap with Qualtrics survey demographics.",
                "overlapping_fields": {
                    "industry": {"prolific": "industry", "qualtrics": "Q3_Industry"},
                    "company_size": {"prolific": "company_size", "qualtrics": "Q4_OrgSize"},
                    "employment_sector": {"prolific": "employment_sector", "qualtrics": "Q5_ProfitModel"},
                    "occupation": {"prolific": "occupation", "qualtrics": "Q1_Role"},
                },
                "use_cases": [
                    "Flag discrepancies between Prolific profile and survey responses",
                    "Balance samples using validated Prolific profile data",
                    "Augment survey demographics with additional Prolific fields",
                ],
            },
            "note": "Base fields are always included in the Prolific demographic export.",
        },
    }

    sample_meta = {
        "Conservative Clean": {"key": "conservative_clean",
                               "description": "Prolific APPROVED + all quality checks (IRI, duration >= 540s, reCAPTCHA, straightlining, auth)"},
        "Flexible Clean": {"key": "flexible_clean",
                           "description": "Prolific APPROVED + basic quality (all 3 IRIs + duration >= 480s)"},
        "Prolific Accepted": {"key": "prolific_accepted",
                              "description": "All deduplicated V2 rows with Prolific APPROVED status"},
        "All V2 Finished": {"key": "v2_finished",
                            "description": "Finished + duration >= 120s (extreme speeders excluded)"},
        "All V2": {"key": "v2_all",
                   "description": "All V2 responses including incomplete"},
    }

    for label, rows in cuts:
        meta = sample_meta.get(label, {"key": label.lower().replace(" ", "_"), "description": ""})
        result["samples"].append({"key": meta["key"], "label": label,
                                  "description": meta["description"], "n": len(rows)})

    def safe_compute(fn, rows):
        try:
            val = fn(rows)
            if val is None or (isinstance(val, float) and math.isnan(val)):
                return None
            return round(val, 4) if isinstance(val, float) else val
        except Exception:
            return None

    metric_defs = [
        ("barrier_mean", "Barrier Grand Mean", lambda rows: mean_sd(_person_means_rows(rows, BARRIER_COLS, BARRIER_SCALE, idx))[0]),
        ("barrier_sd", "Barrier SD", lambda rows: mean_sd(_person_means_rows(rows, BARRIER_COLS, BARRIER_SCALE, idx))[1]),
        ("readiness_mean", "Readiness Grand Mean", lambda rows: mean_sd(_person_means_rows(rows, READINESS_COLS, READINESS_SCALE, idx))[0]),
        ("readiness_sd", "Readiness SD", lambda rows: mean_sd(_person_means_rows(rows, READINESS_COLS, READINESS_SCALE, idx))[1]),
        ("maturity_mean", "Maturity Grand Mean", lambda rows: mean_sd(_person_means_rows(rows, MATURITY_COLS, MATURITY_SCALE, idx))[0]),
        ("maturity_sd", "Maturity SD", lambda rows: mean_sd(_person_means_rows(rows, MATURITY_COLS, MATURITY_SCALE, idx))[1]),
        ("corr_br", "B-R Correlation", lambda rows: pearson_r(_person_means_rows(rows, BARRIER_COLS, BARRIER_SCALE, idx), _person_means_rows(rows, READINESS_COLS, READINESS_SCALE, idx))),
        ("corr_bm", "B-M Correlation", lambda rows: pearson_r(_person_means_rows(rows, BARRIER_COLS, BARRIER_SCALE, idx), _person_means_rows(rows, MATURITY_COLS, MATURITY_SCALE, idx))),
        ("corr_rm", "R-M Correlation", lambda rows: pearson_r(_person_means_rows(rows, READINESS_COLS, READINESS_SCALE, idx), _person_means_rows(rows, MATURITY_COLS, MATURITY_SCALE, idx))),
        ("alpha_barriers", "Alpha Barriers", lambda rows: cronbach_alpha_rows(rows, BARRIER_COLS, BARRIER_SCALE, idx)),
        ("alpha_readiness", "Alpha Readiness", lambda rows: cronbach_alpha_rows(rows, READINESS_COLS, READINESS_SCALE, idx)),
        ("alpha_maturity", "Alpha Maturity", lambda rows: cronbach_alpha_rows(rows, MATURITY_COLS, MATURITY_SCALE, idx)),
    ]

    for key, label, fn in metric_defs:
        values = {}
        for sample_label, rows in cuts:
            sample_key = sample_meta.get(sample_label, {}).get("key", sample_label.lower().replace(" ", "_"))
            values[sample_key] = safe_compute(fn, rows)
        result["metrics"].append({"key": key, "label": label, "values": values})

    # Demographics per sample
    def demographics_for(rows):
        if not rows:
            return {"roles": {}, "org_sizes": {k: 0 for k in ALL_ORG_SIZES},
                    "profit_models": {k: 0 for k in ['For-Profit', 'Non-Profit', 'Government/Public Sector']},
                    "tech_vs_nontech": {"technical": 0, "non_technical": 0, "other": 0},
                    "other_roles": {"total": 0, "categories": {}}}
        roles = Counter()
        tech_n = nontech_n = other_n = 0
        other_cats = Counter()
        org_sizes = Counter()
        profit_models = Counter()
        for r in rows:
            role = _get_role_from_row(r, idx)
            roles[role] += 1
            other_text = _get_other_text_from_row(r, idx) if role == 'Other' else ''
            binary = classify_role_binary(role, other_text)
            if binary == 'Technical':
                tech_n += 1
            elif binary == 'Non-Technical':
                nontech_n += 1
            else:
                other_n += 1
                if role == 'Other':
                    other_cats[categorize_other_role(other_text)] += 1
            org_sizes[r[idx['Q4_OrgSize']].strip()] += 1
            profit_models[r[idx['Q5_ProfitModel']].strip()] += 1
        return {
            "roles": dict(roles.most_common()),
            "org_sizes": {k: org_sizes.get(k, 0) for k in ALL_ORG_SIZES},
            "profit_models": {k: profit_models.get(k, 0) for k in ['For-Profit', 'Non-Profit', 'Government/Public Sector']},
            "tech_vs_nontech": {"technical": tech_n, "non_technical": nontech_n, "other": other_n},
            "other_roles": {
                "total": sum(1 for r in rows if _get_role_from_row(r, idx) == 'Other'),
                # k-anonymity suppression: suppress category counts below 5 to prevent
                # re-identification in small cells (NIST SP 800-188 compliant).
                "categories": {cat: (ct if ct >= 5 else "<5")
                               for cat, ct in other_cats.most_common()},
            },
        }

    # Effect sizes per sample
    def effect_sizes_for(rows):
        if not rows:
            return {}
        effects = {}
        tech = [r for r in rows if classify_role_binary(_get_role_from_row(r, idx), _get_other_text_from_row(r, idx)) == 'Technical']
        nontech = [r for r in rows if classify_role_binary(_get_role_from_row(r, idx), _get_other_text_from_row(r, idx)) == 'Non-Technical']
        effects["tech_vs_nontech"] = {"tech_n": len(tech), "nontech_n": len(nontech), "constructs": {}}
        for label, cols, sc in ALL_CONSTRUCTS:
            t = _person_means_rows(tech, cols, sc, idx)
            nt = _person_means_rows(nontech, cols, sc, idx)
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
            l = _person_means_rows(large, cols, sc, idx)
            s = _person_means_rows(smmed, cols, sc, idx)
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

    # Cross-tabs per sample
    def cross_tabs_for(rows):
        if not rows:
            return {}
        groups = {}
        role_groups = [
            ("Technical", [r for r in rows if classify_role_binary(_get_role_from_row(r, idx), _get_other_text_from_row(r, idx)) == 'Technical']),
            ("Non-Technical", [r for r in rows if classify_role_binary(_get_role_from_row(r, idx), _get_other_text_from_row(r, idx)) == 'Non-Technical']),
            ("Unclassified", [r for r in rows if classify_role_binary(_get_role_from_row(r, idx), _get_other_text_from_row(r, idx)) is None]),
        ]
        role_results = []
        for gname, grows in role_groups:
            if not grows:
                continue
            bm, _ = mean_sd(_person_means_rows(grows, BARRIER_COLS, BARRIER_SCALE, idx))
            rm, _ = mean_sd(_person_means_rows(grows, READINESS_COLS, READINESS_SCALE, idx))
            mm, _ = mean_sd(_person_means_rows(grows, MATURITY_COLS, MATURITY_SCALE, idx))
            role_results.append({"group": gname, "n": len(grows),
                                 "barrier_mean": round(bm, 4) if bm is not None else None,
                                 "readiness_mean": round(rm, 4) if rm is not None else None,
                                 "maturity_mean": round(mm, 4) if mm is not None else None})
        groups["by_role"] = role_results
        size_groups = [
            ("Small (<500)", [r for r in rows if r[idx['Q4_OrgSize']].strip() in ('<100', '100-499')]),
            ("Medium (500-4999)", [r for r in rows if r[idx['Q4_OrgSize']].strip() in ('500-999', '1000-4999')]),
            ("Large (5000+)", [r for r in rows if r[idx['Q4_OrgSize']].strip() in LARGE_ORG_SIZES]),
        ]
        size_results = []
        for gname, grows in size_groups:
            if not grows:
                continue
            bm, _ = mean_sd(_person_means_rows(grows, BARRIER_COLS, BARRIER_SCALE, idx))
            rm, _ = mean_sd(_person_means_rows(grows, READINESS_COLS, READINESS_SCALE, idx))
            mm, _ = mean_sd(_person_means_rows(grows, MATURITY_COLS, MATURITY_SCALE, idx))
            size_results.append({"group": gname, "n": len(grows),
                                 "barrier_mean": round(bm, 4) if bm is not None else None,
                                 "readiness_mean": round(rm, 4) if rm is not None else None,
                                 "maturity_mean": round(mm, 4) if mm is not None else None})
        groups["by_org_size"] = size_results
        return groups

    # Inferential statistics per sample
    def inferential_for(rows):
        if not rows:
            return {}
        result_inf = {}
        tech = [r for r in rows if classify_role_binary(_get_role_from_row(r, idx), _get_other_text_from_row(r, idx)) == 'Technical']
        nontech = [r for r in rows if classify_role_binary(_get_role_from_row(r, idx), _get_other_text_from_row(r, idx)) == 'Non-Technical']
        t_tests = {}
        for label, cols, sc in ALL_CONSTRUCTS:
            t_vals = _person_means_rows(tech, cols, sc, idx)
            nt_vals = _person_means_rows(nontech, cols, sc, idx)
            t_stat, p_val, df, ci_l, ci_u = welch_t_test(t_vals, nt_vals)
            t_tests[label] = {
                "t": round(t_stat, 4) if t_stat is not None else None,
                "p": round(p_val, 4) if p_val is not None else None,
                "df": round(df, 2) if df is not None else None,
                "mean_diff_ci_lower": round(ci_l, 4) if ci_l is not None else None,
                "mean_diff_ci_upper": round(ci_u, 4) if ci_u is not None else None,
                "sig": p_val is not None and p_val < 0.05,
            }
        result_inf["t_tests_tech_vs_nontech"] = {"tech_n": len(tech), "nontech_n": len(nontech), "constructs": t_tests}

        large = [r for r in rows if r[idx['Q4_OrgSize']].strip() in LARGE_ORG_SIZES]
        smmed = [r for r in rows if r[idx['Q4_OrgSize']].strip() not in LARGE_ORG_SIZES]
        t_tests_org = {}
        for label, cols, sc in ALL_CONSTRUCTS:
            l_vals = _person_means_rows(large, cols, sc, idx)
            s_vals = _person_means_rows(smmed, cols, sc, idx)
            t_stat, p_val, df, ci_l, ci_u = welch_t_test(l_vals, s_vals)
            t_tests_org[label] = {
                "t": round(t_stat, 4) if t_stat is not None else None,
                "p": round(p_val, 4) if p_val is not None else None,
                "df": round(df, 2) if df is not None else None,
                "mean_diff_ci_lower": round(ci_l, 4) if ci_l is not None else None,
                "mean_diff_ci_upper": round(ci_u, 4) if ci_u is not None else None,
                "sig": p_val is not None and p_val < 0.05,
            }
        result_inf["t_tests_large_vs_small"] = {"large_n": len(large), "small_medium_n": len(smmed), "constructs": t_tests_org}

        # Dynamically build groups to avoid reporting 3 groups when only 2 are populated.
        unclassified = [r for r in rows if classify_role_binary(_get_role_from_row(r, idx), _get_other_text_from_row(r, idx)) is None]
        role_anova_groups = [
            ("Technical", tech),
            ("Non-Technical", nontech),
            ("Unclassified", unclassified),
        ]
        role_anova_groups = [(name, grp) for name, grp in role_anova_groups if grp]
        anova_role = {}
        for label, cols, sc in ALL_CONSTRUCTS:
            group_vals = [_person_means_rows(grp, cols, sc, idx) for _, grp in role_anova_groups]
            f_stat, p_val, df_b, df_w = oneway_anova(*group_vals)
            anova_role[label] = {
                "f": round(f_stat, 4) if f_stat is not None else None,
                "p": round(p_val, 4) if p_val is not None else None,
                "df_between": df_b, "df_within": df_w,
                "sig": p_val is not None and p_val < 0.05,
            }
        result_inf["anova_by_role"] = {"groups": [name for name, _ in role_anova_groups],
                                       "group_ns": [len(grp) for _, grp in role_anova_groups], "constructs": anova_role}

        small_orgs = [r for r in rows if r[idx['Q4_OrgSize']].strip() in ('<100', '100-499')]
        med_orgs = [r for r in rows if r[idx['Q4_OrgSize']].strip() in ('500-999', '1000-4999')]
        large_orgs = [r for r in rows if r[idx['Q4_OrgSize']].strip() in LARGE_ORG_SIZES]
        anova_org = {}
        for label, cols, sc in ALL_CONSTRUCTS:
            g1 = _person_means_rows(small_orgs, cols, sc, idx)
            g2 = _person_means_rows(med_orgs, cols, sc, idx)
            g3 = _person_means_rows(large_orgs, cols, sc, idx)
            f_stat, p_val, df_b, df_w = oneway_anova(g1, g2, g3)
            anova_org[label] = {
                "f": round(f_stat, 4) if f_stat is not None else None,
                "p": round(p_val, 4) if p_val is not None else None,
                "df_between": df_b, "df_within": df_w,
                "sig": p_val is not None and p_val < 0.05,
            }
        result_inf["anova_by_org_size"] = {"groups": ["Small (<500)", "Medium (500-4999)", "Large (5000+)"],
                                           "group_ns": [len(small_orgs), len(med_orgs), len(large_orgs)], "constructs": anova_org}
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

    # Filter bias analysis
    def filter_bias_analysis_for(cuts_list):
        import scipy.stats as _scipy_stats
        role_counts = []
        org_size_counts = []
        profit_model_counts = []
        required_labels = ['Conservative Clean', 'Flexible Clean', 'Prolific Accepted', 'All V2 Finished']
        cuts_by_label = {sl: rows for sl, rows in cuts_list}
        missing_labels = [label for label in required_labels if label not in cuts_by_label]
        if missing_labels:
            return None
        main_cuts = [(label, cuts_by_label[label]) for label in required_labels]
        for sample_label, rows in main_cuts:
            tech_n = sum(1 for r in rows if classify_role_binary(_get_role_from_row(r, idx), _get_other_text_from_row(r, idx)) == 'Technical')
            nontech_n = sum(1 for r in rows if classify_role_binary(_get_role_from_row(r, idx), _get_other_text_from_row(r, idx)) == 'Non-Technical')
            unclassified_n = sum(1 for r in rows if classify_role_binary(_get_role_from_row(r, idx), _get_other_text_from_row(r, idx)) is None)
            role_counts.append([tech_n, nontech_n, unclassified_n])
            org_sizes = [sum(1 for r in rows if r[idx['Q4_OrgSize']].strip() == os_val) for os_val in ALL_ORG_SIZES]
            org_size_counts.append(org_sizes)
            profit_models = [sum(1 for r in rows if r[idx['Q5_ProfitModel']].strip() == pm_val)
                             for pm_val in ['For-Profit', 'Non-Profit', 'Government/Public Sector']]
            profit_model_counts.append(profit_models)

        def _run_chi2(contingency_table):
            try:
                table = np.array(contingency_table, dtype=float)
                col_mask = table.sum(axis=0) > 0
                table = table[:, col_mask]
                row_mask = table.sum(axis=1) > 0
                table = table[row_mask, :]
                chi2, p, dof, ex = _scipy_stats.chi2_contingency(table)
                return {"ok": True, "chi2": round(float(chi2), 2), "p_value": round(float(p), 4), "df": int(dof), "error": None}
            except Exception as e:
                return {"ok": False, "chi2": None, "p_value": None, "df": None, "error": str(e)}

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
            "profit_model_distribution": {"labels": profit_model_labels, "groups": profit_model_dist},
        }

    fba_result = filter_bias_analysis_for(cuts)
    if fba_result is not None:
        result["filter_bias_analysis"] = fba_result

    result["role_categories"] = [
        {"label": cat,
         "description": OTHER_ROLE_CATEGORIES_DESCRIPTIONS.get(cat, {}).get("description", ""),
         "examples": OTHER_ROLE_CATEGORIES_DESCRIPTIONS.get(cat, {}).get("examples", "")}
        for cat, _ in OTHER_ROLE_CATEGORIES_PATTERNS
    ] + [{"label": "Uncategorized", "description": "Responses that did not match any keyword pattern", "examples": ""}]

    # ------------------------------------------------------------------
    # Extended blocks (added 2026-04-16): top-3 pick counts, item-level
    # descriptives, construct grand means/SDs, demographic detail. These
    # feed the /results/crp-2026/top-barriers page and validator v5.
    #
    # FAIL-FAST POLICY (PR #1695)
    # ----------------------------
    # This pipeline does NOT emit zero-count placeholder structures, empty
    # arrays, or silently-defaulted {mean: None, n: 0} objects when the
    # primary cut is missing or empty. If the canonical primary sample is
    # unavailable, the pipeline raises RuntimeError and the workflow fails,
    # preventing any new JSON from reaching the repo. The website continues
    # rendering the last known-good snapshot until a human fixes the broken
    # step.
    #
    # Rationale:
    #   - Zero-shaped placeholders have repeatedly misled reviewers and
    #     automated agents into thinking the pipeline "succeeded" when the
    #     real input was broken.
    #   - The project rule is strict transactional integrity: either every
    #     step succeeds and we commit one atomic update, or nothing commits
    #     and everything stays stale.
    #
    # Do not replace the raises below with placeholder-emit logic. See the
    # CLAUDE.md "Fail-fast discipline" note and the PR #1695 description.
    # ------------------------------------------------------------------
    primary_rows = None
    for label, rows in cuts:
        if label == "Prolific Accepted":
            primary_rows = rows
            break
    if primary_rows is None:
        available = ", ".join(label for label, _ in cuts) if cuts else "(no cuts)"
        raise RuntimeError(
            "Fail-fast: primary cut 'Prolific Accepted' not found in cuts. "
            f"Available cuts: {available}. "
            "Refusing to emit extended blocks without the canonical primary sample. "
            "This indicates a CSV contract regression or a cut-building bug upstream. "
            "Do NOT work around this by adding a fallback to cuts[-1] - fix the cut builder."
        )
    if len(primary_rows) == 0:
        raise RuntimeError(
            "Fail-fast: primary cut 'Prolific Accepted' is empty (0 rows). "
            "Refusing to emit extended blocks from a zero-row sample. "
            "This indicates the upstream quality filter rejected every response, or "
            "the input CSV is empty. Fix the filter or the underlying data before "
            "re-running. Do NOT work around this by emitting zero-count placeholders."
        )

    result["top3_pick_counts"] = _build_top3_pick_counts(primary_rows, idx)
    result["item_descriptives"] = _build_item_descriptives(primary_rows, idx)
    result["construct_grand"] = _build_construct_grand(primary_rows, idx)
    result["demographics_detailed"] = _build_demographics_detailed(primary_rows, idx)

    # Timestamps - consumed by 10+ results pages via utcTimestamp component.
    # extended_last_updated marks when the extended blocks were last regenerated.
    ts = datetime.utcnow().isoformat() + "Z"
    result["last_updated"] = ts
    result["extended_last_updated"] = ts

    return result


# ============================================================================
# SECTION 1B: Extended block builders (top-3, item descriptives, demographics)
# ============================================================================

# Item 19 in barriers, item 18 in readiness, item 9 in maturity are IRI attention
# checks and are excluded from substantive analysis. CLAUDE.md documents this.
TOP3_COLS = [f"Q29-46_Top3Barriers_{i}" for i in range(1, 19)]

BARRIER_ITEM_TEXT = {
    # Exact pick-text values from Q29-46_Top3Barriers_* columns in the CRP
    # public CSV (including trailing period). Derived from the non-empty cell
    # values across the dataset - must match exactly so top3_pick_counts.text
    # agrees with the source CSV label.
    1: "Resistance to change among employees or middle management.",
    2: "Lack of support or clear vision from top leadership (including the board, e.g., governing body, oversight committee).",
    3: "Organizational culture that discourages risk-taking or experimentation with new technologies.",
    4: "Insufficient skills or expertise within the workforce to utilize new technologies effectively.",
    5: "Inadequate training programs for new technologies.",
    6: "High cost associated with acquiring or implementing new technologies.",
    7: "Difficulty integrating new technologies with existing legacy systems.",
    8: "Inadequate IT infrastructure (e.g., network, storage, computing power) to support new technologies.",
    9: "Difficulty demonstrating clear value (e.g., mission impact, public value, cost-effectiveness) for new technology investments.",
    10: "Lack of a clear strategy or roadmap for technology adoption.",
    11: "Insufficient governance processes for selecting and managing new technologies.",
    12: "New technologies disrupting existing workflows or processes significantly.",
    13: "Concerns about cybersecurity risks associated with new technologies.",
    14: "Concerns about data privacy compliance related to new technologies.",
    15: "Lack of trust in the reliability or performance of new technologies or vendors.",
    16: "Uncertainty or complexity related to regulatory requirements.",
    17: "Pressure to adopt technology due to external factors (e.g., mandates, public expectations, peer agency actions), without adequate internal readiness.",
    18: "Difficulty finding reliable technology vendors or partners.",
}

READINESS_ITEM_TEXT = {
    1: "Formal digital or technology strategy",
    2: "Dedicated IT leadership role",
    3: "Skilled in-house technology staff",
    4: "Adequate financial resources for technology",
    5: "Willingness to invest in new technologies",
    6: "Data and analytics capabilities",
    7: "Cybersecurity and risk management capabilities",
    8: "Change management capabilities",
    9: "Vendor and partner management capabilities",
    10: "Digital infrastructure (cloud, network, devices)",
    11: "Alignment between IT and business strategy",
    12: "Cross-functional collaboration on technology",
    13: "Employee digital skills",
    14: "Leadership digital literacy",
    15: "Innovation culture",
    16: "Willingness to experiment with new technologies",
    17: "Customer or stakeholder demand for technology",
}

MATURITY_ITEM_TEXT = {
    1: "IT Investment & Value Mgmt",
    2: "IT-Enabled Innovation",
    3: "Process Mgmt & Standardization",
    4: "Data Governance & Analytics",
    5: "Tech Risk & Resilience",
    6: "Strategic IT Planning",
    7: "Workforce Capability",
    8: "Change Leadership",
}


def _build_top3_pick_counts(rows, idx):
    """Build per-barrier forced-choice pick counts from 18 TOP3 columns.

    FAIL-FAST: if ANY of the 18 TOP3 columns is missing from idx, this
    function raises ValueError. It does NOT emit zero-count entries for
    missing columns. See the module-level fail-fast policy in
    sensitivity_to_json() and the PR #1695 description.
    """
    total = len(rows)
    missing = [col for col in TOP3_COLS if col not in idx]
    if missing:
        raise ValueError(
            f"Fail-fast: TOP3 columns missing from CSV - {len(missing)} of "
            f"{len(TOP3_COLS)} expected columns not found: {', '.join(missing)}. "
            f"Expected columns are {TOP3_COLS[0]} through {TOP3_COLS[-1]}. "
            f"Check that the CSV was exported with the forced-choice section intact. "
            f"Do NOT work around this by emitting zero-count placeholder items."
        )
    items = []
    for i, col in enumerate(TOP3_COLS, start=1):
        col_idx = idx[col]
        cnt = sum(1 for r in rows if col_idx < len(r) and str(r[col_idx]).strip() not in ("", "nan", "None"))
        pct = round(100.0 * cnt / total, 2) if total else 0.0
        items.append({"item": f"B{i}", "text": BARRIER_ITEM_TEXT[i], "count": cnt, "pct": pct})
    items_sorted = sorted(items, key=lambda r: -r["count"])
    return {"total_n": total, "items": items, "items_sorted_desc": items_sorted}


def _build_item_descriptives(rows, idx):
    """Build per-item mean/SD/N for barriers, readiness, maturity.

    FAIL-FAST on contract violations:
      - If ANY required scale column is missing from idx, raises ValueError.
      - Does NOT emit {mean: None, n: 0} placeholder entries for missing
        columns. See the module-level fail-fast policy in
        sensitivity_to_json() and the PR #1695 description.

    Data-level behavior (NOT fail-fast, intentional):
      - If a column IS present but every respondent answered blank,
        'Don't Know', or an unmapped value, the item entry is emitted with
        n=0, mean=None, sd=None. This is an honest null reporting a data
        condition, not a silent default for a broken pipeline - 'Don't Know'
        is a valid survey response and CLAUDE.md requires it to be
        excluded from scoring rather than coerced to a number.
    """
    def compute(cols, scale, labels, prefix):
        missing = [col for col in cols if col not in idx]
        if missing:
            raise ValueError(
                f"Fail-fast: {prefix} construct missing {len(missing)} of "
                f"{len(cols)} required scale columns: {', '.join(missing)}. "
                f"Refusing to emit partial item_descriptives for construct '{prefix}'. "
                f"Do NOT work around this by emitting n=0 placeholder entries."
            )
        out = []
        for i, col in enumerate(cols, start=1):
            col_idx = idx[col]
            vals = []
            for r in rows:
                if col_idx >= len(r):
                    continue
                v = str(r[col_idx]).strip()
                if v in ("", "nan", "None"):
                    continue
                mapped = scale.get(v)
                if mapped is None:
                    continue
                vals.append(mapped)
            if vals:
                m, sd = mean_sd(vals)
                out.append({
                    "item": f"{prefix}{i}",
                    "text": labels[i],
                    "mean": round(m, 4) if m is not None else None,
                    "sd": round(sd, 4) if sd is not None else None,
                    "n": len(vals),
                })
            else:
                # Data-level null: every respondent answered blank or
                # 'Don't Know' on this item. Emit honest null, not a fake
                # zero. This is NOT a pipeline failure - it is legitimate
                # data the website must be able to display as such.
                out.append({
                    "item": f"{prefix}{i}",
                    "text": labels[i],
                    "mean": None,
                    "sd": None,
                    "n": 0,
                })
        return out

    return {
        "barriers":  compute(BARRIER_COLS,  BARRIER_SCALE,  BARRIER_ITEM_TEXT,  "B"),
        "readiness": compute(READINESS_COLS, READINESS_SCALE, READINESS_ITEM_TEXT, "R"),
        "maturity":  compute(MATURITY_COLS, MATURITY_SCALE, MATURITY_ITEM_TEXT, "M"),
    }


def _build_construct_grand(rows, idx):
    """Build grand mean/SD/N per construct from person-level means.

    FAIL-FAST on contract violations:
      - If ANY required scale column is missing from idx, raises ValueError
        BEFORE any row processing begins. This matches the upfront-guard
        pattern used by _build_top3_pick_counts, _build_item_descriptives,
        and _build_demographics_detailed, so a missing column produces a
        single descriptive error rather than a raw KeyError bubbling up
        from _person_means_rows -> _score_item during a list comprehension.
        See the module-level fail-fast policy in sensitivity_to_json() and
        the PR #1695 description.

    Data-level behavior (NOT fail-fast, intentional):
      - If all columns are present but every respondent's person-mean is
        None (all items blank / "Don't Know"), returns {mean: None, sd:
        None, n: 0}. This is the honest-null path, the same pattern used
        by _build_item_descriptives for all-Don't-Know items.
    """
    def gm(cols, scale, prefix):
        missing = [col for col in cols if col not in idx]
        if missing:
            raise ValueError(
                f"Fail-fast: {prefix} construct_grand missing {len(missing)} of "
                f"{len(cols)} required scale columns: {', '.join(missing)}. "
                f"Refusing to emit partial construct_grand for '{prefix}'. "
                f"Do NOT work around this by computing over the subset present."
            )
        raw = _person_means_rows(rows, cols, scale, idx)
        # Filter out None entries (respondents whose items were all missing or
        # all "Don't Know").  Using len(raw) would overcount n and could expose
        # {mean: None, sd: None, n: >0} when every person mean is None.
        valid_means = [v for v in raw if v is not None]
        if not valid_means:
            return {"mean": None, "sd": None, "n": 0}
        m, sd = mean_sd(valid_means)
        return {"mean": round(m, 4) if m is not None else None,
                "sd": round(sd, 4) if sd is not None else None,
                "n": len(valid_means)}

    return {
        "barriers":  gm(BARRIER_COLS,  BARRIER_SCALE,  "barriers"),
        "readiness": gm(READINESS_COLS, READINESS_SCALE, "readiness"),
        "maturity":  gm(MATURITY_COLS, MATURITY_SCALE, "maturity"),
    }


def _build_demographics_detailed(rows, idx):
    """Tabulate the four key demographic columns on the primary cut.

    FAIL-FAST on contract violations:
      - If ANY of the four required demographic columns is missing from
        idx, raises ValueError. Does NOT return empty arrays for missing
        columns. See the module-level fail-fast policy in
        sensitivity_to_json() and the PR #1695 description.
    """
    total = len(rows)
    required_cols = ["Q1_Role", "Q4_OrgSize", "Q5_ProfitModel", "Q2_DecisionAuth"]
    missing = [c for c in required_cols if c not in idx]
    if missing:
        raise ValueError(
            f"Fail-fast: demographics missing {len(missing)} of "
            f"{len(required_cols)} required columns: {', '.join(missing)}. "
            f"Refusing to emit partial demographics_detailed. "
            f"Do NOT work around this by returning empty arrays."
        )

    def tabulate(col_name):
        col_idx = idx[col_name]
        counter = Counter()
        for r in rows:
            if col_idx < len(r):
                v = str(r[col_idx]).strip()
                if v not in ("", "nan", "None"):
                    counter[v] += 1
        # Sort by count descending, then by label ascending for ties to
        # produce a stable, deterministic ordering across pipeline runs.
        items_sorted = sorted(counter.items(), key=lambda kv: (-kv[1], kv[0]))
        return [{"label": k, "count": v, "pct": round(100.0 * v / total, 2) if total else 0.0}
                for k, v in items_sorted]

    return {
        "roles": tabulate("Q1_Role"),
        "org_sizes": tabulate("Q4_OrgSize"),
        "profit_models": tabulate("Q5_ProfitModel"),
        "decision_authority": tabulate("Q2_DecisionAuth"),
    }


# ============================================================================
# SECTION 2: ADVANCED ANALYSIS (from tabs_v2_advanced.py)
# ============================================================================

def run_advanced_analysis(df):
    """Run PCA, regression, ANOVA, and interaction analyses on pandas DataFrame.

    Returns a dict with keys: pca, regression, anova, interactions.
    """
    result = {}
    N = len(df)

    # Compute person-level means
    df_b = df[BARRIER_COLS].mean(axis=1)
    df_r = df[READINESS_COLS].mean(axis=1)
    df_m = df[MATURITY_COLS].mean(axis=1)

    B_arr = df_b.dropna().values
    R_arr = df_r.dropna().values
    M_arr = df_m.dropna().values

    # ── PCA ──
    all_cols = BARRIER_COLS + READINESS_COLS + MATURITY_COLS
    all_names = BARRIER_NAMES + READINESS_NAMES + MATURITY_NAMES
    X = df[all_cols].copy()
    col_means = X.mean()
    X = X.fillna(col_means)
    X_std = (X - X.mean()) / X.std(ddof=0)
    corr = np.corrcoef(X_std.values.T)
    eigenvalues, eigenvectors = np.linalg.eigh(corr)
    order = np.argsort(eigenvalues)[::-1]
    eigenvalues = eigenvalues[order]
    eigenvectors = eigenvectors[:, order]
    total_var = eigenvalues.sum()

    pca_eigenvalues = []
    cum = 0
    for i in range(min(10, len(eigenvalues))):
        pct = 100 * eigenvalues[i] / total_var
        cum += pct
        pca_eigenvalues.append({
            "component": i + 1,
            "eigenvalue": round(float(eigenvalues[i]), 3),
            "pct_variance": round(pct, 1),
            "cumulative_pct": round(cum, 1),
            "above_1": bool(eigenvalues[i] > 1),
        })

    n_above_1 = int(sum(1 for e in eigenvalues if e > 1))
    loadings = eigenvectors[:, :3] * np.sqrt(eigenvalues[:3])
    pca_loadings = []
    for i, name in enumerate(all_names):
        scale_label = 'B' if i < 18 else ('R' if i < 35 else 'M')
        pca_loadings.append({
            "item": name, "scale": scale_label,
            "pc1": round(float(loadings[i, 0]), 3),
            "pc2": round(float(loadings[i, 1]), 3),
            "pc3": round(float(loadings[i, 2]), 3),
        })

    # Variance by theoretical scale
    scale_communalities = {}
    for label, start, end in [("Barriers", 0, 18), ("Readiness", 18, 35), ("Maturity", 35, 43)]:
        scale_loads = loadings[start:end]
        comm = np.sum(scale_loads ** 2, axis=1)
        scale_communalities[label] = {
            "avg": round(float(comm.mean()), 3),
            "min": round(float(comm.min()), 3),
            "max": round(float(comm.max()), 3),
        }

    # Bartlett's test
    n_obs = X.shape[0]
    p = X.shape[1]
    det_corr = np.linalg.det(corr)
    bartlett = {}
    if det_corr > 0:
        chi2 = -((n_obs - 1) - (2 * p + 5) / 6) * np.log(det_corr)
        df_bart = p * (p - 1) / 2
        p_bart = 1 - sp.chi2.cdf(chi2, df_bart)
        bartlett = {"chi2": round(float(chi2), 1), "df": int(df_bart),
                    "p": round(float(p_bart), 6), "significant": bool(p_bart < 0.05)}
    else:
        bartlett = {"chi2": None, "df": None, "p": None, "significant": True, "note": "singular matrix"}

    result["pca"] = {
        "n": N,
        "n_items": p,
        "eigenvalues": pca_eigenvalues,
        "n_components_above_1": n_above_1,
        "loadings_pc1_pc2_pc3": pca_loadings,
        "scale_communalities": scale_communalities,
        "bartlett": bartlett,
    }

    # ── Inferential statistics ──
    inferential = {}

    # One-sample t-tests vs midpoint (3.0)
    one_sample = {}
    for name, arr in [("barriers", B_arr), ("readiness", R_arr), ("maturity", M_arr)]:
        t, p_val = sp.ttest_1samp(arr, 3.0)
        d = (arr.mean() - 3.0) / arr.std(ddof=1)
        one_sample[name] = {
            "mean": round(float(arr.mean()), 2), "sd": round(float(arr.std(ddof=1)), 2),
            "t": round(float(t), 3), "df": len(arr) - 1,
            "p": round(float(p_val), 6), "d": round(float(d), 2),
        }
    inferential["one_sample_vs_midpoint"] = one_sample

    # Construct correlations
    aligned_mask = df_b.notna() & df_r.notna() & df_m.notna()
    ba = df_b[aligned_mask].values
    ra = df_r[aligned_mask].values
    ma = df_m[aligned_mask].values
    correlations = {}
    for pair, x, y in [("B-R", ba, ra), ("B-M", ba, ma), ("R-M", ra, ma)]:
        r_val, p_val = sp.pearsonr(x, y)
        n_corr = len(x)
        z = np.arctanh(r_val)
        se = 1 / np.sqrt(n_corr - 3)
        z_lo, z_hi = z - 1.96 * se, z + 1.96 * se
        r_lo, r_hi = np.tanh(z_lo), np.tanh(z_hi)
        correlations[pair] = {
            "r": round(float(r_val), 3), "p": float(f"{p_val:.2e}"),
            "ci_lower": round(float(r_lo), 3), "ci_upper": round(float(r_hi), 3),
            "n": n_corr,
        }
    inferential["construct_correlations"] = correlations

    result["anova"] = inferential

    # ── Regression ──
    reg_result = {}
    # Build role mapping on the DataFrame
    def _map_role_df(raw):
        if not raw:
            return 'Unknown'
        for prefix in ["CEO", "CFO", "CIO", "CMO", "COO", "CHRO", "CTO", "CSO", "CRO"]:
            if str(raw).startswith(prefix):
                return prefix
        return 'Other'

    if 'Q1_Role' in df.columns and 'Q4_OrgSize' in df.columns:
        reg_mask = df_b.notna() & df_r.notna() & df_m.notna()
        reg_df = df[reg_mask].copy()
        reg_df['B_mean'] = df_b[reg_mask]
        reg_df['R_mean'] = df_r[reg_mask]
        reg_df['M_mean'] = df_m[reg_mask]
        reg_df['role_short'] = reg_df['Q1_Role'].apply(_map_role_df)
        reg_df['tech'] = reg_df['role_short'].isin(['CIO', 'CTO']).astype(int)
        reg_df['large'] = reg_df['Q4_OrgSize'].isin(['5000-9999', '10000+']).astype(int)

        y = reg_df['B_mean'].values
        X_reg = np.column_stack([
            np.ones(len(reg_df)),
            reg_df['R_mean'].values,
            reg_df['M_mean'].values,
            reg_df['tech'].values,
            reg_df['large'].values,
        ])
        predictor_names = ['Intercept', 'Readiness', 'Maturity', 'Tech Role', 'Large Org']
        try:
            betas = np.linalg.lstsq(X_reg, y, rcond=None)[0]
            y_pred = X_reg @ betas
            residuals = y - y_pred
            n_reg, k = X_reg.shape
            ss_res = np.sum(residuals ** 2)
            ss_tot = np.sum((y - y.mean()) ** 2)
            r_sq = 1 - ss_res / ss_tot
            adj_r_sq = 1 - (1 - r_sq) * (n_reg - 1) / (n_reg - k)
            mse = ss_res / (n_reg - k)
            se_betas = np.sqrt(np.diag(mse * np.linalg.inv(X_reg.T @ X_reg)))
            F_reg = ((ss_tot - ss_res) / (k - 1)) / mse
            p_F = 1 - sp.f.cdf(F_reg, k - 1, n_reg - k)
            coefficients = []
            for j, pname in enumerate(predictor_names):
                t_val = betas[j] / se_betas[j]
                p_coeff = 2 * (1 - sp.t.cdf(abs(t_val), n_reg - k))
                coefficients.append({
                    "predictor": pname, "beta": round(float(betas[j]), 3),
                    "se": round(float(se_betas[j]), 3), "t": round(float(t_val), 3),
                    "p": round(float(p_coeff), 6),
                    "sig": "***" if p_coeff < .001 else ("**" if p_coeff < .01 else ("*" if p_coeff < .05 else "")),
                })
            reg_result = {
                "n": n_reg, "r_squared": round(float(r_sq), 3), "adj_r_squared": round(float(adj_r_sq), 3),
                "f_statistic": round(float(F_reg), 3), "f_p": round(float(p_F), 6),
                "df_model": k - 1, "df_residual": n_reg - k,
                "coefficients": coefficients,
            }
        except np.linalg.LinAlgError:
            reg_result = {"error": "singular matrix"}
    result["regression"] = reg_result

    # ── Interaction effects ──
    interactions = {}

    # Org Size x Role Type on Barriers
    if 'Q1_Role' in df.columns and 'Q4_OrgSize' in df.columns:
        df['role_short'] = df['Q1_Role'].apply(_map_role_df)
        cells = {}
        for _, row in df.iterrows():
            b_val = df_b.get(row.name)
            if pd.isna(b_val):
                continue
            role = row.get('role_short', 'Unknown')
            if role in ('CIO', 'CTO'):
                role_grp = 'Tech'
            elif role in ('CEO', 'CFO', 'CMO', 'COO', 'CHRO', 'CSO', 'CRO'):
                role_grp = 'NonTech'
            else:
                continue
            size = row.get('Q4_OrgSize', '')
            if size in ('<100', '100-499', '500-999', '1000-4999'):
                size_grp = 'Small/Med'
            elif size in ('5000-9999', '10000+'):
                size_grp = 'Large'
            else:
                continue
            key = (size_grp, role_grp)
            if key not in cells:
                cells[key] = []
            cells[key].append(float(b_val))

        cell_means = {}
        for (sg, rg), vals in cells.items():
            cell_means[f"{sg}_{rg}"] = {"mean": round(float(np.mean(vals)), 2), "n": len(vals)}

        interaction_diff = None
        if all(k in cells for k in [('Large', 'Tech'), ('Small/Med', 'Tech'), ('Large', 'NonTech'), ('Small/Med', 'NonTech')]):
            tech_diff = np.mean(cells[('Large', 'Tech')]) - np.mean(cells[('Small/Med', 'Tech')])
            nt_diff = np.mean(cells[('Large', 'NonTech')]) - np.mean(cells[('Small/Med', 'NonTech')])
            interaction_diff = {
                "tech_large_effect": round(float(tech_diff), 2),
                "nontech_large_effect": round(float(nt_diff), 2),
                "interaction": round(float(tech_diff - nt_diff), 2),
            }

        interactions["org_size_x_role_on_barriers"] = {
            "cell_means": cell_means,
            "interaction": interaction_diff,
        }

    # Budget moderation
    budget_col = READINESS_COLS[16]  # Q47-64_Readiness_17
    if budget_col in df.columns:
        high_b_idx = df[budget_col] >= 4
        low_b_idx = df[budget_col] <= 2
        hb_df = df[high_b_idx & df_b.notna() & df_r.notna()]
        lb_df = df[low_b_idx & df_b.notna() & df_r.notna()]
        if len(hb_df) >= 5 and len(lb_df) >= 5:
            hb_b = df_b[hb_df.index].values
            hb_r = df_r[hb_df.index].values
            lb_b = df_b[lb_df.index].values
            lb_r = df_r[lb_df.index].values
            r_high, p_high = sp.pearsonr(hb_b, hb_r)
            r_low, p_low = sp.pearsonr(lb_b, lb_r)
            z_h, z_l = np.arctanh(r_high), np.arctanh(r_low)
            se_diff = np.sqrt(1 / (len(hb_df) - 3) + 1 / (len(lb_df) - 3))
            z_diff = (z_h - z_l) / se_diff
            p_diff = 2 * (1 - sp.norm.cdf(abs(z_diff)))
            interactions["budget_moderation"] = {
                "high_budget_n": len(hb_df), "high_budget_br_r": round(float(r_high), 3),
                "high_budget_br_p": round(float(p_high), 4),
                "low_budget_n": len(lb_df), "low_budget_br_r": round(float(r_low), 3),
                "low_budget_br_p": round(float(p_low), 4),
                "fisher_z": round(float(z_diff), 3), "fisher_p": round(float(p_diff), 4),
                "significant": bool(p_diff < 0.05),
            }

    result["interactions"] = interactions
    return result


# ============================================================================
# SECTION 3: QUALITY AUDIT (from tabs_v2_quality_audit.py)
# ============================================================================

def run_quality_audit(df, all_rows_raw=None, idx_raw=None):
    """Run data quality audit on the FULL V2 population DataFrame.

    In live mode, df should be the full V2 population (pre-IRI/duration filter)
    so that missing data, straightlining, and response quality metrics reflect
    all respondents - not just those who passed quality gates.

    In CRP mode, df is the selected N=200 sample (the full relevant population).

    For disposition funnel and IRI filter bias we need the raw rows and idx
    from the Qualtrics CSV. If not provided, those sections are skipped.

    Returns a dict with keys: disposition_funnel, missing_data, response_quality,
    distributional, construct_diagnostics, iri_filter_bias.
    """
    result = {}
    N = len(df)

    # ── Missing data analysis ──
    missing = {}
    for scale_name, cols, scale_map in [("barriers", BARRIER_COLS, BARRIER_SCALE),
                                         ("readiness", READINESS_COLS, READINESS_SCALE),
                                         ("maturity", MATURITY_COLS, MATURITY_SCALE)]:
        total_cells = len(cols) * N
        missing_count = 0
        for c in cols:
            if c in df.columns:
                missing_count += int(df[c].isna().sum())
        missing[scale_name] = {
            "total_cells": total_cells,
            "missing_count": missing_count,
            "missing_pct": round(100 * missing_count / total_cells, 2) if total_cells > 0 else 0,
        }

    # Person-level completeness
    all_item_cols = [c for c in BARRIER_COLS + READINESS_COLS + MATURITY_COLS if c in df.columns]
    person_missing_counts = df[all_item_cols].isna().sum(axis=1)
    person_completeness = Counter(person_missing_counts.values)
    missing["person_level"] = {str(k): int(v) for k, v in sorted(person_completeness.items())}

    result["missing_data"] = missing

    # ── Response quality ──
    response_quality = {}

    def _person_responses_df(row, cols):
        return [row[c] for c in cols if c in row.index and pd.notna(row[c])]

    # Straightlining
    straightlining = {}
    for scale_name, cols in [("barriers", BARRIER_COLS), ("readiness", READINESS_COLS), ("maturity", MATURITY_COLS)]:
        valid_cols = [c for c in cols if c in df.columns]
        count = 0
        for _, row in df.iterrows():
            vals = _person_responses_df(row, valid_cols)
            if vals and len(set(vals)) == 1:
                count += 1
        straightlining[scale_name] = {"count": count, "pct": round(100 * count / N, 1) if N > 0 else 0}
    response_quality["straightlining"] = straightlining

    # Low variance (SD < 0.5)
    low_var = {}
    for scale_name, cols in [("barriers", BARRIER_COLS), ("readiness", READINESS_COLS), ("maturity", MATURITY_COLS)]:
        valid_cols = [c for c in cols if c in df.columns]
        count = 0
        for _, row in df.iterrows():
            vals = _person_responses_df(row, valid_cols)
            if len(vals) >= 3:
                sd = np.std(vals, ddof=1)
                if sd < 0.5:
                    count += 1
        low_var[scale_name] = {"count": count, "pct": round(100 * count / N, 1) if N > 0 else 0}
    response_quality["low_variance"] = low_var

    # Extreme responding (>80% at endpoints)
    extreme = {}
    for scale_name, cols in [("barriers", BARRIER_COLS), ("readiness", READINESS_COLS), ("maturity", MATURITY_COLS)]:
        valid_cols = [c for c in cols if c in df.columns]
        count = 0
        for _, row in df.iterrows():
            vals = _person_responses_df(row, valid_cols)
            if vals:
                at_ends = sum(1 for v in vals if v in (1, 5))
                if at_ends / len(vals) > 0.8:
                    count += 1
        extreme[scale_name] = {"count": count, "pct": round(100 * count / N, 1) if N > 0 else 0}
    response_quality["extreme_responding"] = extreme

    # Central tendency bias (>80% at midpoint)
    central = {}
    for scale_name, cols in [("barriers", BARRIER_COLS), ("readiness", READINESS_COLS), ("maturity", MATURITY_COLS)]:
        valid_cols = [c for c in cols if c in df.columns]
        count = 0
        for _, row in df.iterrows():
            vals = _person_responses_df(row, valid_cols)
            if vals:
                at_mid = sum(1 for v in vals if v == 3)
                if at_mid / len(vals) > 0.8:
                    count += 1
        central[scale_name] = {"count": count, "pct": round(100 * count / N, 1) if N > 0 else 0}
    response_quality["central_tendency"] = central

    result["response_quality"] = response_quality

    # ── Distributional properties ──
    distributional = {}
    for name, cols in [("barriers", BARRIER_COLS), ("readiness", READINESS_COLS), ("maturity", MATURITY_COLS)]:
        valid_cols = [c for c in cols if c in df.columns]
        arr = df[valid_cols].mean(axis=1).dropna().values
        if len(arr) >= 3:
            skew = float(sp.skew(arr))
            kurt = float(sp.kurtosis(arr))
            shapiro_stat, shapiro_p = shapiro(arr)
            distributional[name] = {
                "n": len(arr),
                "skewness": round(skew, 3),
                "kurtosis": round(kurt, 3),
                "shapiro_w": round(float(shapiro_stat), 4),
                "shapiro_p": round(float(shapiro_p), 6),
                "normal_p05": bool(shapiro_p > 0.05),
                "range_min": round(float(arr.min()), 2),
                "range_max": round(float(arr.max()), 2),
                "floor_count": int(np.sum(arr < 1.5)),
                "ceiling_count": int(np.sum(arr > 4.5)),
            }
    result["distributional"] = distributional

    # ── Construct-level diagnostics ──
    construct_diag = {}
    for scale_name, cols in [("barriers", BARRIER_COLS), ("readiness", READINESS_COLS), ("maturity", MATURITY_COLS)]:
        valid_cols = [c for c in cols if c in df.columns]
        data = df[valid_cols].dropna()
        if len(data) >= 10:
            corr_mat = data.corr().values
            n_items = corr_mat.shape[0]
            mask = ~np.eye(n_items, dtype=bool)
            off_diag = corr_mat[mask]
            construct_diag[scale_name] = {
                "n_items": n_items,
                "n_pairs": int(n_items * (n_items - 1) / 2),
                "mean_r": round(float(off_diag.mean()), 3),
                "min_r": round(float(off_diag.min()), 3),
                "max_r": round(float(off_diag.max()), 3),
                "pairs_below_020": int(np.sum(off_diag < 0.20)),
                "pairs_above_070": int(np.sum(off_diag > 0.70)),
            }
    result["construct_diagnostics"] = construct_diag

    # ── Readiness-Maturity discriminant concern ──
    r_cols = [c for c in READINESS_COLS if c in df.columns]
    m_cols = [c for c in MATURITY_COLS if c in df.columns]
    r_means = df[r_cols].mean(axis=1)
    m_means = df[m_cols].mean(axis=1)
    valid = r_means.notna() & m_means.notna()
    if valid.sum() >= 3:
        r_rm, p_rm = sp.pearsonr(r_means[valid].values, m_means[valid].values)
        result["readiness_maturity_overlap"] = {
            "r": round(float(r_rm), 3),
            "p": round(float(p_rm), 6),
            "shared_variance": round(float(r_rm ** 2), 3),
            "concern": bool(abs(r_rm) > 0.70),
        }

    # ── Disposition funnel (raw rows only) ──
    if all_rows_raw is not None and idx_raw is not None:
        durations = []
        for r in all_rows_raw:
            try:
                durations.append(float(r[idx_raw['Duration (in seconds)']]))
            except (ValueError, KeyError):
                durations.append(0)

        N_all = len(all_rows_raw)
        dur_arr = np.array(durations)

        duration_stats = {
            "n": N_all,
            "min": round(float(dur_arr.min()), 0),
            "p5": round(float(np.percentile(dur_arr, 5)), 0),
            "p25": round(float(np.percentile(dur_arr, 25)), 0),
            "median": round(float(np.percentile(dur_arr, 50)), 0),
            "p75": round(float(np.percentile(dur_arr, 75)), 0),
            "p95": round(float(np.percentile(dur_arr, 95)), 0),
            "max": round(float(dur_arr.max()), 0),
        }

        speed_tiers = {}
        for label, lo, hi in [("<2min", 0, 120), ("2-5min", 120, 300), ("5-8min", 300, 480),
                                ("8-15min", 480, 900), ("15-30min", 900, 1800), ("30min+", 1800, 999999)]:
            n_tier = sum(1 for d in durations if lo <= d < hi)
            speed_tiers[label] = {"n": n_tier, "pct": round(100 * n_tier / N_all, 1) if N_all > 0 else 0}

        iri_b_pass = sum(1 for r in all_rows_raw if r[idx_raw[BARRIER_IRI]] == IRI_BARRIER_ANSWER)
        iri_r_pass = sum(1 for r in all_rows_raw if r[idx_raw[READINESS_IRI]] == IRI_READINESS_ANSWER)
        iri_m_pass = sum(1 for r in all_rows_raw if r[idx_raw[MATURITY_IRI]] == IRI_MATURITY_ANSWER)
        iri_all = sum(1 for r in all_rows_raw if r[idx_raw[BARRIER_IRI]] == IRI_BARRIER_ANSWER and
                      r[idx_raw[READINESS_IRI]] == IRI_READINESS_ANSWER and
                      r[idx_raw[MATURITY_IRI]] == IRI_MATURITY_ANSWER)

        dur_pass = sum(1 for d in durations if d >= MIN_DURATION_CLEAN)
        clean_count = sum(1 for i, r in enumerate(all_rows_raw) if durations[i] >= MIN_DURATION_CLEAN and
                          r[idx_raw[BARRIER_IRI]] == IRI_BARRIER_ANSWER and
                          r[idx_raw[READINESS_IRI]] == IRI_READINESS_ANSWER and
                          r[idx_raw[MATURITY_IRI]] == IRI_MATURITY_ANSWER)

        result["disposition_funnel"] = {
            "duration_stats": duration_stats,
            "speed_tiers": speed_tiers,
            "iri_pass_rates": {
                "barrier": {"n": iri_b_pass, "pct": round(100 * iri_b_pass / N_all, 1) if N_all > 0 else 0},
                "readiness": {"n": iri_r_pass, "pct": round(100 * iri_r_pass / N_all, 1) if N_all > 0 else 0},
                "maturity": {"n": iri_m_pass, "pct": round(100 * iri_m_pass / N_all, 1) if N_all > 0 else 0},
                "all_3": {"n": iri_all, "pct": round(100 * iri_all / N_all, 1) if N_all > 0 else 0},
            },
            "funnel": {
                "total_v2": N_all,
                "duration_pass": dur_pass,
                "clean": clean_count,
                "retention_pct": round(100 * clean_count / N_all, 1) if N_all > 0 else 0,
            },
        }

    return result


# ============================================================================
# SECTION 4: VALIDATION (from tabs_v2_validation.py)
# ============================================================================

def safe_col(col):
    """Make column name CFA-safe."""
    return col.replace('-', '_').replace(' ', '_')


SAFE_BARRIER_COLS = [safe_col(c) for c in BARRIER_COLS]
SAFE_READINESS_COLS = [safe_col(c) for c in READINESS_COLS]
SAFE_MATURITY_COLS = [safe_col(c) for c in MATURITY_COLS]


# Canonical 3-group barrier decomposition (matches THREE_GROUP_DEFS / CRP §4.3.2)
# F1a Strategy & Culture: B1, B2, B3, B5, B9, B10, B11, B15, B17 (9 items, 0-indexed)
# F1b Resources & Operations: B4, B6, B7, B8, B12 (5 items)
# F2  External & Compliance: B13, B14, B16, B18 (4 items)
BARRIER_3GROUP = {
    'F1a': [0, 1, 2, 4, 8, 9, 10, 14, 16],
    'F1b': [3, 5, 6, 7, 11],
    'F2':  [12, 13, 15, 17],
}
# EFA-derived 2-factor partition (parallel analysis at N=200 retained 2 factors)
BARRIER_2GROUP = {
    'F1': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 16],
    'F2': [12, 13, 15, 17],
}


def build_cfa_models():
    """Build lavaan-style CFA model specifications.

    Adds barriers_2f (EFA-derived), barriers_3f (canonical F1a/F1b/F2), and
    joint_3construct (B+R+M with free latent correlations) on top of the
    legacy 1F and 4F specs.
    """
    barrier_items = ' + '.join(SAFE_BARRIER_COLS)
    readiness_items = ' + '.join(SAFE_READINESS_COLS)
    maturity_items = ' + '.join(SAFE_MATURITY_COLS)
    barrier_cfa = f"Barriers =~ {barrier_items}"
    readiness_cfa = f"Readiness =~ {readiness_items}"
    maturity_cfa = f"Maturity =~ {maturity_items}"
    barrier_2f = (
        f"F1 =~ {' + '.join(SAFE_BARRIER_COLS[i] for i in BARRIER_2GROUP['F1'])}\n"
        f"F2 =~ {' + '.join(SAFE_BARRIER_COLS[i] for i in BARRIER_2GROUP['F2'])}"
    )
    barrier_3f = (
        f"F1a =~ {' + '.join(SAFE_BARRIER_COLS[i] for i in BARRIER_3GROUP['F1a'])}\n"
        f"F1b =~ {' + '.join(SAFE_BARRIER_COLS[i] for i in BARRIER_3GROUP['F1b'])}\n"
        f"F2 =~ {' + '.join(SAFE_BARRIER_COLS[i] for i in BARRIER_3GROUP['F2'])}"
    )
    barrier_4f = (
        f"OrgCultural =~ {' + '.join([SAFE_BARRIER_COLS[i] for i in BARRIER_SUBCONSTRUCTS['Organizational & Cultural']])}\n"
        f"Strategic =~ {' + '.join([SAFE_BARRIER_COLS[i] for i in BARRIER_SUBCONSTRUCTS['Strategic & Operational']])}\n"
        f"Resource =~ {' + '.join([SAFE_BARRIER_COLS[i] for i in BARRIER_SUBCONSTRUCTS['Resource & Capability']])}\n"
        f"RiskTrust =~ {' + '.join([SAFE_BARRIER_COLS[i] for i in BARRIER_SUBCONSTRUCTS['Risk, Trust & External']])}"
    )
    joint_3construct = (
        f"Barriers =~ {barrier_items}\n"
        f"Readiness =~ {readiness_items}\n"
        f"Maturity =~ {maturity_items}"
    )
    return {
        'barriers_1f': barrier_cfa, 'barriers_2f': barrier_2f,
        'barriers_3f': barrier_3f, 'barriers_4f': barrier_4f,
        'readiness_1f': readiness_cfa, 'maturity_1f': maturity_cfa,
        'joint_3construct': joint_3construct,
    }


def validate_construct(df, cols, names, construct_name, cfa_model=None):
    """Run all validations for a single construct. Returns dict."""
    data = df[cols]
    result = OrderedDict()
    result['construct'] = construct_name
    result['n_items'] = len(cols)
    result['n_valid_listwise'] = int(data.dropna().shape[0])

    alpha, (ci_lo, ci_hi) = cronbach_alpha_ci_pd(data)
    result['cronbach_alpha'] = round(alpha, 4)
    result['alpha_95ci'] = [round(ci_lo, 4), round(ci_hi, 4)]
    print(f"  Cronbach's alpha: {alpha:.4f} [{ci_lo:.4f}, {ci_hi:.4f}]")

    omega, single_loadings = mcdonalds_omega(data)
    result['mcdonalds_omega'] = round(omega, 4) if not np.isnan(omega) else None
    print(f"  McDonald's omega: {omega:.4f}" if not np.isnan(omega) else "  McDonald's omega: N/A")

    if single_loadings:
        cr = composite_reliability(single_loadings)
        result['composite_reliability'] = round(cr, 4)
        ave = ave_from_loadings(single_loadings)
        result['ave_from_loadings'] = round(ave, 4)
        result['single_factor_loadings'] = {names[i]: round(float(v), 4)
                                            for i, v in enumerate(single_loadings) if i < len(names)}
        print(f"  CR: {cr:.4f}, AVE: {ave:.4f}")
    else:
        result['composite_reliability'] = None
        result['ave_from_loadings'] = None

    sh = split_half_reliability(data)
    result['split_half_spearman_brown'] = sh
    print(f"  Split-half (Spearman-Brown): {sh}")

    citc = corrected_item_total(data)
    citc_named = {}
    flagged = []
    for i, (col, r) in enumerate(citc.items()):
        name = names[i] if i < len(names) else col
        citc_named[name] = r
        if r < 0.30:
            flagged.append(name)
    result['corrected_item_total'] = citc_named
    result['citc_flagged_below_030'] = flagged
    print(f"  CITC: {len(flagged)} items below 0.30" + (f" ({', '.join(flagged)})" if flagged else ""))

    aid = alpha_if_deleted(data, names)
    result['alpha_if_deleted'] = aid

    iic = inter_item_diagnostics(data)
    result['inter_item_correlations'] = iic
    print(f"  Inter-item r: mean={iic['mean']:.4f}, min={iic['min']:.4f}, max={iic['max']:.4f}")

    norm = normality_tests(data, names)
    result['normality'] = norm
    non_normal = sum(1 for x in norm if x.get('normal_p05') is False)
    print(f"  Normality: {non_normal}/{len(norm)} items non-normal")

    efa = run_efa(data, construct_name)
    result['efa'] = efa
    if 'kmo_model' in efa:
        print(f"  KMO: {efa['kmo_model']:.4f}")
    if 'n_factors' in efa:
        print(f"  Factors retained: {efa['n_factors']}")

    if cfa_model:
        safe_data = data.rename(columns={c: safe_col(c) for c in data.columns})
        cfa = run_cfa(safe_data, cfa_model, construct_name)
        result['cfa'] = cfa
        if 'error' not in cfa:
            print(f"  CFA: CFI={cfa.get('cfi')}, TLI={cfa.get('tli')}, RMSEA={cfa.get('rmsea')}")
        else:
            print(f"  CFA: {cfa['error']}")

    return result


# ============================================================================
# CFA MODEL COMPARISON / ITEM-LEVEL HAIR / SUBGROUP HTMT-FL / ALPHA-IF-DELETED
# (Extension analyses added 2026-05-01 to support defense-ready statistics
#  and feed the existing /results/{crp-2026,*}/factor-analysis,validation,
#  reliability pages with new structured output.)
# ============================================================================

def compare_cfa_models(model_results):
    """Compare a list of CFA model fit dicts.

    Returns a summary list and pairwise nested chi-squared difference tests
    (delta-chi2, delta-df, p, delta-AIC, delta-BIC).
    """
    from scipy.stats import chi2 as chi2_dist
    summary = []
    for m in model_results:
        if 'error' in m:
            continue
        summary.append({
            'name': m.get('construct') or m.get('name'),
            'df': m.get('df'),
            'chi2': m.get('chi2'),
            'cfi': m.get('cfi'),
            'tli': m.get('tli'),
            'rmsea': m.get('rmsea'),
            'aic': m.get('aic'),
            'bic': m.get('bic'),
        })
    pairwise = []
    for i, r in enumerate(model_results):
        for j, full in enumerate(model_results):
            if i >= j or 'error' in r or 'error' in full:
                continue
            r_chi2 = r.get('chi2')
            full_chi2 = full.get('chi2')
            r_df = r.get('df')
            full_df = full.get('df')
            if r_chi2 is None or full_chi2 is None or r_df is None or full_df is None:
                continue
            d_chi2 = r_chi2 - full_chi2
            d_df = r_df - full_df
            if d_df <= 0:
                continue
            if d_chi2 <= 0:
                # d_chi2 <= 0 can occur with non-nested models or estimation variance;
                # skip to avoid misleading p-values (e.g., values near 1.0).
                continue
            try:
                p = float(1 - chi2_dist.cdf(d_chi2, d_df))
            except Exception:
                p = None
            r_aic = r.get('aic')
            full_aic = full.get('aic')
            d_aic = round(r_aic - full_aic, 3) if r_aic is not None and full_aic is not None else None
            r_bic = r.get('bic')
            full_bic = full.get('bic')
            d_bic = round(r_bic - full_bic, 3) if r_bic is not None and full_bic is not None else None
            pairwise.append({
                'restricted': r.get('construct') or r.get('name'),
                'full': full.get('construct') or full.get('name'),
                'd_chi2': round(d_chi2, 3),
                'd_df': int(d_df),
                'p': round(p, 6) if p is not None else None,
                'd_aic': d_aic,
                'd_bic': d_bic,
                'note': 'heuristic: 1F/2F/3F/4F models have different loading patterns and may not be strictly nested',
            })
    return {'summary': summary, 'pairwise_chi2_diff': pairwise}


def item_level_validity(efa_loadings, item_names, item_ids,
                        primary_pass=0.50, primary_acceptable=0.40,
                        cross_load_threshold=0.30, gap_threshold=0.20):
    """Apply Hair (2014/2019) item-level convergent and discriminant rules.

    Convergent: primary >= primary_pass = PASS; >= primary_acceptable = WEAK.
    Discriminant: secondary < cross_load_threshold OR (primary - secondary) >= gap_threshold = PASS.
    """
    out = []
    cols = list(efa_loadings.keys())
    for i, col in enumerate(cols):
        loads = [abs(float(x)) for x in efa_loadings[col]]
        primary = max(loads) if loads else 0.0
        if primary >= primary_pass:
            cv = 'PASS'
        elif primary >= primary_acceptable:
            cv = 'WEAK'
        else:
            cv = 'FAIL'
        if len(loads) >= 2:
            secondary = sorted(loads, reverse=True)[1]
            diff = primary - secondary
            if secondary < cross_load_threshold or diff >= gap_threshold:
                dv = 'PASS'
            else:
                dv = 'FAIL'
        else:
            # 1-factor EFA: no secondary loading to assess; mark as not evaluated
            secondary = None
            diff = None
            dv = None
        out.append({
            'id': item_ids[i] if i < len(item_ids) else col,
            'name': item_names[i] if i < len(item_names) else col,
            'primary': round(primary, 4),
            'secondary': round(secondary, 4) if secondary is not None else None,
            'gap': round(diff, 4) if diff is not None else None,
            'convergent': cv,
            'discriminant': dv,
            'loadings': [round(float(x), 4) for x in efa_loadings[col]],
        })
    return out


def subgroup_discriminant(df, group_def, all_cols, group_aves, n_boot=2000):
    """HTMT bootstrap CI + Fornell-Larcker treating group_def keys as constructs.

    n_boot controls HTMT bootstrap iterations; callers may pass a smaller value
    (e.g. 500) for non-primary samples to keep daily pipeline runtime bounded.
    """
    sub_data = {label: df[[all_cols[i] for i in idxs]]
                for label, idxs in group_def.items()}
    labels = list(group_def.keys())
    htmt_results = []
    fl_results = []
    pearson_corr = {}
    means = {label: data.mean(axis=1, skipna=False) for label, data in sub_data.items()}
    import math
    for i, n1 in enumerate(labels):
        for j, n2 in enumerate(labels):
            if i >= j:
                continue
            d1, d2 = sub_data[n1], sub_data[n2]
            h, (lo, hi) = htmt_bootstrap_ci(d1, d2, n_boot=n_boot)
            htmt_results.append({
                'pair': f'{n1} vs {n2}',
                'htmt': round(float(h), 4) if h == h else None,
                'ci_lower': round(float(lo), 4) if lo == lo else None,
                'ci_upper': round(float(hi), 4) if hi == hi else None,
                'pass_085': bool(h < 0.85) if h == h else None,
                'pass_090': bool(h < 0.90) if h == h else None,
            })
            mask = means[n1].notna() & means[n2].notna()
            raw_r = means[n1][mask].corr(means[n2][mask])
            r = None if pd.isna(raw_r) else float(raw_r)
            pearson_corr[f'{n1} vs {n2}'] = round(r, 4) if r is not None else None
            ave1 = group_aves.get(n1)
            ave2 = group_aves.get(n2)
            if ave1 is not None and ave2 is not None:
                sa1 = math.sqrt(ave1)
                sa2 = math.sqrt(ave2)
                small = min(sa1, sa2)
                abs_r = abs(r) if r is not None else None
                fl_results.append({
                    'pair': f'{n1} vs {n2}',
                    'sqrt_ave_1': round(sa1, 4),
                    'sqrt_ave_2': round(sa2, 4),
                    'abs_r': round(abs_r, 4) if abs_r is not None else None,
                    'smaller_sqrt_ave': round(small, 4),
                    'pass': bool(small > abs_r) if abs_r is not None else None,
                })
    return {
        'htmt': htmt_results,
        'fornell_larcker': fl_results,
        'pearson_correlations': pearson_corr,
        'aves_used': {k: round(v, 4) if v is not None else None for k, v in group_aves.items()},
    }


def alpha_if_deleted_summary(construct_results):
    """Summarize alpha-if-deleted across constructs."""
    out = []
    for cr in construct_results:
        base = cr.get('cronbach_alpha')
        items = cr.get('alpha_if_deleted', [])
        increases = []
        closest = None
        closest_change = -1e9
        for it in items:
            change = it.get('change')
            if change is None:
                continue
            if it.get('flag_increase'):
                increases.append({
                    'item': it.get('item'),
                    'alpha_if_deleted': it.get('alpha_if_deleted'),
                    'change': change,
                })
            if change > closest_change:
                closest_change = change
                closest = it
        out.append({
            'construct': cr.get('construct'),
            'base_alpha': base,
            'items_increasing_alpha_count': len(increases),
            'items_increasing_alpha': increases,
            'closest_call': {
                'item': closest.get('item'),
                'alpha_if_deleted': closest.get('alpha_if_deleted'),
                'change': closest.get('change'),
            } if closest else None,
        })
    return out



# ============================================================================
# 17. PER-SUBGROUP STANDALONE VALIDATION (added 2026-05-01)
# Tests whether each barrier subgroup is internally coherent as a unidimensional
# scale on its own - independent of the rest of the Barriers items and
# independent of Readiness or Maturity.
# ============================================================================

def subgroup_standalone_validation(df, group_def, all_cols, item_names_full):
    """For each subgroup, run alpha + KMO/Bartlett + parallel analysis + 1F EFA + 1F CFA."""
    results = []
    for label, idxs in group_def.items():
        cols = [all_cols[i] for i in idxs]
        item_ids = [f"B{i+1}" for i in idxs]
        data = df[cols].dropna()
        n, k = data.shape
        out = {
            'name': label,
            'item_ids': list(item_ids),
            'k': int(k),
            'n_listwise': int(n),
        }
        # Cronbach alpha (use cronbach_alpha_pd helper that exists in this script)
        a = cronbach_alpha_pd(data) if 'cronbach_alpha_pd' in globals() else cronbach_alpha(data)
        out['alpha'] = round(float(a), 4) if not np.isnan(a) else None
        if k < 3:
            out['note'] = f"Only {k} items; CFA under-identified, EFA requires >=3 items."
            out['verdict'] = {'overall_pass': False, 'reason': 'too_few_items'}
            results.append(out)
            continue
        if HAS_FACTOR_ANALYZER:
            try:
                _, kmo = calculate_kmo(data)
                out['kmo'] = round(float(kmo), 4)
                chi2_v, p = calculate_bartlett_sphericity(data)
                out['bartlett_chi2'] = round(float(chi2_v), 2)
                out['bartlett_p'] = float(p)
            except Exception as e:
                out['kmo_error'] = str(e)
        try:
            n_factors_pa = parallel_analysis(data, max_factors=min(4, k), n_iter=200)
            out['parallel_analysis_factors'] = int(n_factors_pa)
        except Exception:
            out['parallel_analysis_factors'] = None
            n_factors_pa = None
        if HAS_FACTOR_ANALYZER:
            try:
                fa = FactorAnalyzer(n_factors=1, rotation=None, method='ml')
                fa.fit(data)
            except Exception:
                fa = FactorAnalyzer(n_factors=1, rotation=None, method='minres')
                fa.fit(data)
            loads_1f = fa.loadings_.flatten().tolist()
            out['loadings_1f'] = {item_ids[i]: round(float(loads_1f[i]), 4) for i in range(k)}
            try:
                var_explained = float(fa.get_factor_variance()[1][0])
                out['variance_explained_1f'] = round(var_explained, 4)
            except Exception:
                out['variance_explained_1f'] = None
            cr = composite_reliability(loads_1f)
            ave = ave_from_loadings(loads_1f)
            out['cr_1f'] = round(float(cr), 4) if not np.isnan(cr) else None
            out['ave_1f'] = round(float(ave), 4) if not np.isnan(ave) else None
        spec = "F =~ " + " + ".join(cols)
        cfa_result = run_cfa(data, spec, label)
        if 'error' in cfa_result:
            out['cfa_1f'] = {'error': cfa_result['error']}
        else:
            out['cfa_1f'] = {kk: cfa_result.get(kk) for kk in
                             ('chi2', 'df', 'chi2_p', 'cfi', 'tli', 'rmsea', 'aic', 'bic')}
        cfi_v = (out.get('cfa_1f') or {}).get('cfi')
        rmsea_v = (out.get('cfa_1f') or {}).get('rmsea')
        out['verdict'] = {
            'parallel_analysis_unidimensional': bool(n_factors_pa == 1) if n_factors_pa is not None else None,
            'alpha_above_070': bool(a >= 0.70) if a == a else None,
            'cfi_above_090': bool(cfi_v >= 0.90) if cfi_v is not None else None,
            'rmsea_below_008': bool(rmsea_v <= 0.08) if rmsea_v is not None else None,
        }
        ov = (out['verdict']['parallel_analysis_unidimensional'] is True
              and out['verdict']['alpha_above_070'] is True
              and out['verdict']['cfi_above_090'] is True
              and out['verdict']['rmsea_below_008'] is True)
        out['verdict']['overall_pass'] = bool(ov)
        results.append(out)
    return results



# ============================================================================
# 18-22. LINDERMAN-GRADE EXTENSIONS (added 2026-05-01)
# Adds: DWLS ordinal CFA, bifactor R+M with omega-h/ECV/PUC, second-order
# Barriers CFA, Mardia multivariate normality, Mahalanobis outliers,
# split-sample cross-validation with Tucker congruence.
# ============================================================================

def run_cfa_dwls(data, model_spec, construct_name):
    """CFA using DWLS estimator (proper for ordinal Likert; WLSMV equivalent in semopy)."""
    if not HAS_SEMOPY:
        return {'construct': construct_name, 'error': 'semopy not installed'}
    d = data.dropna()
    result = {'construct': construct_name, 'n_valid': len(d), 'estimator': 'DWLS'}
    try:
        mod = semopy.Model(model_spec)
        mod.fit(d, obj='DWLS')
        fit_stats = semopy.calc_stats(mod)
        if 'Value' in fit_stats.index and 'CFI' not in fit_stats.index:
            def _stat(name):
                return float(fit_stats.loc['Value', name]) if name in fit_stats.columns else None
        else:
            def _stat(name):
                return float(fit_stats.loc[name, 'Value']) if name in fit_stats.index else None
        for k_in, k_out in [('chi2','chi2'),('chi2 p-value','chi2_p'),('DoF','df'),
                             ('CFI','cfi'),('TLI','tli'),('RMSEA','rmsea'),
                             ('AIC','aic'),('BIC','bic')]:
            v = _stat(k_in)
            if v is not None:
                result[k_out] = round(v, 4) if k_out not in ('df',) else int(v)
            else:
                result[k_out] = None
    except Exception as e:
        result['error'] = str(e)
    return result


def bifactor_rm(df, r_cols, m_cols):
    """Confirmatory bifactor on combined Readiness + Maturity items.

    Accepts a df that may have raw or safe column names; renames internally
    so callers can pass either form.
    Returns ECV, omega-t, omega-h (general + each specific), PUC, fit indices.
    """
    if not HAS_SEMOPY:
        return {'error': 'semopy not installed'}
    rm = list(r_cols) + list(m_cols)
    # Rename df columns to safe form if needed (look up by safe-col mapping)
    if not all(c in df.columns for c in rm):
        rename_map = {c: safe_col(c) for c in df.columns if safe_col(c) in rm}
        df = df.rename(columns=rename_map)
    data = df[rm].dropna()
    n_R = len(r_cols); n_M = len(m_cols); n = n_R + n_M
    spec = (
        "G =~ " + " + ".join(rm) + "\n"
        "RS =~ " + " + ".join(r_cols) + "\n"
        "MS =~ " + " + ".join(m_cols) + "\n"
        "G ~~ 0*RS\nG ~~ 0*MS\nRS ~~ 0*MS"
    )
    try:
        mod = semopy.Model(spec)
        mod.fit(data, obj='DWLS')
        st = semopy.calc_stats(mod)
        if 'Value' in st.index and 'CFI' not in st.index:
            def _stat(nm):
                return float(st.loc['Value', nm]) if nm in st.columns else None
        else:
            def _stat(nm):
                return float(st.loc[nm, 'Value']) if nm in st.index else None
        insp = mod.inspect(std_est=True)
        loads = insp[(insp['op'] == '~') & (insp['Est. Std'].notna())]
        g_loads = loads[loads['rval']=='G']['Est. Std'].astype(float).tolist()
        r_loads = loads[loads['rval']=='RS']['Est. Std'].astype(float).tolist()
        m_loads = loads[loads['rval']=='MS']['Est. Std'].astype(float).tolist()
        sum_g2 = sum(x**2 for x in g_loads)
        sum_r2 = sum(x**2 for x in r_loads)
        sum_m2 = sum(x**2 for x in m_loads)
        denom = sum_g2 + sum_r2 + sum_m2 if (sum_g2 + sum_r2 + sum_m2) else 1.0
        ecv = sum_g2 / denom
        # omega-h, omega-h-s, omega-t
        sum_g = sum(g_loads); sum_r = sum(r_loads); sum_m = sum(m_loads)
        all_h2 = []
        for i, col in enumerate(rm):
            g = g_loads[i] if i < len(g_loads) else 0
            if col in r_cols:
                idx = r_cols.index(col)
                s = r_loads[idx] if idx < len(r_loads) else 0
            else:
                idx = m_cols.index(col)
                s = m_loads[idx] if idx < len(m_loads) else 0
            all_h2.append(g**2 + s**2)
        total_var = sum_g**2 + sum_r**2 + sum_m**2 + (n - sum(all_h2))
        if total_var <= 0:
            total_var = 1.0
        omega_t = (sum_g**2 + sum_r**2 + sum_m**2) / total_var
        omega_h_g = sum_g**2 / total_var
        omega_h_r = sum_r**2 / total_var
        omega_h_m = sum_m**2 / total_var
        n_total = n * (n-1) / 2
        puc = (n_R * n_M) / n_total if n_total else None
        return {
            'fit': {
                'chi2': round(_stat('chi2'), 3) if _stat('chi2') is not None else None,
                'df': int(_stat('DoF')) if _stat('DoF') is not None else None,
                'cfi': round(_stat('CFI'), 4) if _stat('CFI') is not None else None,
                'tli': round(_stat('TLI'), 4) if _stat('TLI') is not None else None,
                'rmsea': round(_stat('RMSEA'), 4) if _stat('RMSEA') is not None else None,
            },
            'n_listwise': len(data),
            'ecv_general': round(ecv, 4),
            'ecv_r_specific': round(sum_r2/denom, 4),
            'ecv_m_specific': round(sum_m2/denom, 4),
            'omega_t': round(omega_t, 4),
            'omega_h_general': round(omega_h_g, 4),
            'omega_h_r_specific': round(omega_h_r, 4),
            'omega_h_m_specific': round(omega_h_m, 4),
            'puc': round(puc, 4) if puc is not None else None,
            'g_loadings': [round(float(x), 4) for x in g_loads],
            'r_specific_loadings': [round(float(x), 4) for x in r_loads],
            'm_specific_loadings': [round(float(x), 4) for x in m_loads],
            'note': 'Reise/Rodriguez interpretation: ECV>.70 + omega_h>.80 + small omega_h_s implies general factor dominates; specific subscale scores are unreliable in isolation.',
        }
    except Exception as e:
        return {'error': str(e)}


def second_order_barriers_cfa(df, barrier_cols_safe, three_group_def):
    """Higher-order Barriers CFA: F1a, F1b, F2 -> Barriers."""
    if not HAS_SEMOPY:
        return {'error': 'semopy not installed'}
    spec_lines = []
    for label, idxs in three_group_def.items():
        items = " + ".join(barrier_cols_safe[i] for i in idxs)
        spec_lines.append(f"{label} =~ {items}")
    factors = list(three_group_def.keys())
    spec_lines.append(f"Barriers =~ {' + '.join(factors)}")
    spec = "\n".join(spec_lines)
    data = df[barrier_cols_safe].dropna()
    try:
        mod = semopy.Model(spec)
        mod.fit(data, obj='DWLS')
        st = semopy.calc_stats(mod)
        if 'Value' in st.index and 'CFI' not in st.index:
            def _stat(nm):
                return float(st.loc['Value', nm]) if nm in st.columns else None
        else:
            def _stat(nm):
                return float(st.loc[nm, 'Value']) if nm in st.index else None
        insp = mod.inspect(std_est=True)
        ho = insp[(insp['op']=='~') & (insp['rval']=='Barriers') & (insp['Est. Std'].notna())]
        ho_loads = {row['lval']: round(float(row['Est. Std']), 4) for _, row in ho.iterrows()}
        return {
            'estimator': 'DWLS',
            'n_listwise': len(data),
            'chi2': round(_stat('chi2'), 3) if _stat('chi2') is not None else None,
            'df': int(_stat('DoF')) if _stat('DoF') is not None else None,
            'cfi': round(_stat('CFI'), 4) if _stat('CFI') is not None else None,
            'tli': round(_stat('TLI'), 4) if _stat('TLI') is not None else None,
            'rmsea': round(_stat('RMSEA'), 4) if _stat('RMSEA') is not None else None,
            'higher_order_loadings': ho_loads,
        }
    except Exception as e:
        return {'error': str(e)}


def mardia_multivariate_normality(data):
    """Mardia's test for multivariate skew + kurtosis."""
    X = data.dropna().values
    n, p = X.shape
    if n < 5 or p < 2:
        return None
    mean = X.mean(axis=0)
    Xc = X - mean
    S = np.cov(Xc.T, bias=True)
    Sinv = np.linalg.pinv(S)
    D = Xc @ Sinv @ Xc.T
    b1p = (D ** 3).sum() / (n ** 2)
    b2p = float(np.diag(D ** 2).mean())
    skew_chi2 = n * b1p / 6.0
    skew_df = p * (p+1) * (p+2) / 6.0
    skew_p = float(1 - stats.chi2.cdf(skew_chi2, skew_df))
    expected_kurt = p * (p + 2)
    kurt_z = (b2p - expected_kurt) / float(np.sqrt(8 * p * (p+2) / n))
    kurt_p = float(2 * (1 - stats.norm.cdf(abs(kurt_z))))
    return {
        'n': int(n), 'p': int(p),
        'multivariate_skewness': round(float(b1p), 4),
        'skew_chi2': round(float(skew_chi2), 3),
        'skew_df': float(skew_df),
        'skew_p': round(float(skew_p), 6),
        'multivariate_kurtosis': round(float(b2p), 4),
        'kurt_z': round(float(kurt_z), 4),
        'kurt_p': round(float(kurt_p), 6),
        'multivariate_normal_005': bool(skew_p > 0.05 and kurt_p > 0.05),
    }


def mahalanobis_outliers(data, alpha=0.001):
    """Count Mahalanobis^2 outliers at chi-squared p < alpha."""
    X = data.dropna().values
    n, p = X.shape
    if n < 5 or p < 2:
        return None
    mean = X.mean(axis=0); cov = np.cov(X.T)
    inv = np.linalg.pinv(cov)
    diffs = X - mean
    md_sq = np.array([d @ inv @ d for d in diffs])
    threshold = float(stats.chi2.ppf(1 - alpha, p))
    outlier_count = int((md_sq > threshold).sum())
    return {
        'n_listwise': int(n),
        'n_items': int(p),
        'threshold_chi2': round(threshold, 4),
        'outlier_count': outlier_count,
        'outlier_pct': round(100 * outlier_count / n, 2) if n else 0,
    }


def split_sample_cv(df, barrier_cols_safe, three_group_def, seed=42):
    """50/50 calibration/validation split with Tucker congruence on loadings."""
    if not HAS_SEMOPY:
        return {'error': 'semopy not installed'}
    spec_lines = []
    for label, idxs in three_group_def.items():
        items = " + ".join(barrier_cols_safe[i] for i in idxs)
        spec_lines.append(f"{label} =~ {items}")
    spec = "\n".join(spec_lines)
    data = df[barrier_cols_safe].dropna().reset_index(drop=True)
    rng = np.random.RandomState(seed)
    idx = rng.permutation(len(data))
    half = len(data) // 2
    calib = data.iloc[idx[:half]]
    valid = data.iloc[idx[half:]]
    out = {'n_calibration': int(len(calib)), 'n_validation': int(len(valid)), 'seed': seed}
    loads_calib = []; loads_valid = []
    for sample_name, sample, store in [('calibration', calib, loads_calib), ('validation', valid, loads_valid)]:
        try:
            mod = semopy.Model(spec)
            mod.fit(sample, obj='DWLS')
            st = semopy.calc_stats(mod)
            if 'Value' in st.index and 'CFI' not in st.index:
                def _stat(nm):
                    return float(st.loc['Value', nm]) if nm in st.columns else None
            else:
                def _stat(nm):
                    return float(st.loc[nm, 'Value']) if nm in st.index else None
            out[sample_name] = {
                'chi2': round(_stat('chi2'), 3) if _stat('chi2') is not None else None,
                'cfi': round(_stat('CFI'), 4) if _stat('CFI') is not None else None,
                'tli': round(_stat('TLI'), 4) if _stat('TLI') is not None else None,
                'rmsea': round(_stat('RMSEA'), 4) if _stat('RMSEA') is not None else None,
            }
            insp = mod.inspect(std_est=True)
            L = insp[(insp['op']=='~') & (insp['Est. Std'].notna())]
            for fact in three_group_def.keys():
                for _, row in L[L['rval']==fact].iterrows():
                    store.append(float(row['Est. Std']))
        except Exception as e:
            out[sample_name] = {'error': str(e)}
    if len(loads_calib) == len(loads_valid) and len(loads_calib) > 0:
        a = np.array(loads_calib); b = np.array(loads_valid)
        denom = float(np.sqrt(a @ a) * np.sqrt(b @ b))
        tucker = float(a @ b / denom) if denom > 0 else None
        out['tucker_congruence'] = round(tucker, 4) if tucker is not None else None
        out['interpretation'] = ('identical' if (tucker or 0) >= 0.95 else
                                  'minor_differences' if (tucker or 0) >= 0.85 else 'different_structures')
    return out






# ============================================================================
# 25-30. TIER 1 + TIER 2 EXTENSIONS (added 2026-05-01)
# Mediation (B->R->M), VIF, bootstrap CIs, item-level d, demo-alpha,
# power, equivalence (TOST), construct stability, BARRIERS bifactor,
# multi-group 3F SEM, approximate measurement invariance, DIF, ESEM.
# ============================================================================

try:
    import pingouin as _pg
    HAS_PINGOUIN = True
except ImportError:
    HAS_PINGOUIN = False


def mediation_b_r_m(df, barrier_cols, readiness_cols, maturity_cols, n_boot=2000, seed=42):
    """Mediation: Barriers -> Readiness -> Maturity (bootstrapped indirect effect)."""
    if not HAS_PINGOUIN:
        return {'error': 'pingouin not installed'}
    work = df.copy()
    work['_B'] = work[barrier_cols].mean(axis=1)
    work['_R'] = work[readiness_cols].mean(axis=1)
    work['_M'] = work[maturity_cols].mean(axis=1)
    sub = work[['_B','_R','_M']].dropna()
    try:
        med = _pg.mediation_analysis(data=sub, x='_B', m='_R', y='_M', n_boot=n_boot, seed=seed)
        out = {}
        for _, row in med.iterrows():
            out[row['path'].replace('_','')] = {
                'coef': round(float(row['coef']), 4),
                'se': round(float(row['se']), 4),
                'p': round(float(row['pval']), 6),
                'ci_lo': round(float(row['CI[2.5%]']), 4) if 'CI[2.5%]' in row.index else None,
                'ci_hi': round(float(row['CI[97.5%]']), 4) if 'CI[97.5%]' in row.index else None,
                'sig': str(row.get('sig', '')),
            }
        out['n_listwise'] = int(len(sub))
        return out
    except Exception as e:
        return {'error': str(e)}


def standardized_subfactor_regressions(df, barrier_cols, readiness_cols, maturity_cols, three_group_def):
    """Sub-factor regressions reported as standardized betas plus VIF."""
    try:
        import statsmodels.api as sm
        import statsmodels.formula.api as smf
        from statsmodels.stats.outliers_influence import variance_inflation_factor as _vif
    except ImportError:
        return {'error': 'statsmodels not installed'}
    work = df.copy()
    work['_B'] = work[barrier_cols].mean(axis=1)
    work['_R'] = work[readiness_cols].mean(axis=1)
    work['_M'] = work[maturity_cols].mean(axis=1)
    factor_keys = list(three_group_def.keys())
    for label, idxs in three_group_def.items():
        cols = [barrier_cols[i] for i in idxs]
        work[f'_{label}'] = work[cols].mean(axis=1)
    factor_cols = [f'_{l}' for l in factor_keys]
    cols_needed = ['_R','_M'] + factor_cols
    sub = work[cols_needed].dropna()
    z = (sub - sub.mean()) / sub.std()
    out = {}
    try:
        for outcome in ['_R','_M']:
            X = sm.add_constant(z[factor_cols])
            m = sm.OLS(z[outcome], X).fit()
            out[outcome.lstrip('_')] = {
                'r2': round(float(m.rsquared), 4),
                'beta_std': {l: round(float(m.params.get(f'_{l}', 0)), 4) for l in factor_keys},
                't': {l: round(float(m.tvalues.get(f'_{l}', 0)), 3) for l in factor_keys},
                'p': {l: round(float(m.pvalues.get(f'_{l}', 1)), 4) for l in factor_keys},
                'n': int(m.nobs),
            }
        # VIF on sub-factor regression (one-time computation)
        X_vif = sm.add_constant(z[factor_cols]).values
        vif_out = {}
        for i, name in enumerate(['constant'] + factor_keys):
            try:
                vif_out[name] = round(float(_vif(X_vif, i)), 4)
            except Exception:
                vif_out[name] = None
        out['vif'] = vif_out
    except Exception as e:
        out['error'] = str(e)
    return out


def bootstrap_alpha_ci(data, n_boot=1000, ci=0.95, seed=42):
    """Bootstrap percentile CI for Cronbach alpha."""
    d = data.dropna()
    if len(d) < 10:
        return None
    rng = np.random.RandomState(seed)
    boots = []
    n = len(d)
    for _ in range(n_boot):
        idx = rng.choice(n, n, replace=True)
        a = cronbach_alpha(d.iloc[idx])
        if not np.isnan(a):
            boots.append(a)
    if len(boots) < 100:
        return None
    alpha_p = (1 - ci) / 2
    return {
        'mean': round(float(np.mean(boots)), 4),
        'ci_lower': round(float(np.percentile(boots, alpha_p * 100)), 4),
        'ci_upper': round(float(np.percentile(boots, (1 - alpha_p) * 100)), 4),
        'n_boot': n_boot,
    }


def item_level_cohens_d_smb(df, raw_cols, item_names, item_ids, smb_col='_SMB'):
    """Per-item Cohen's d (Enterprise - SMB) and Welch's t-test p-value."""
    out = []
    for i, col in enumerate(raw_cols):
        smb = df[df[smb_col]==1][col].dropna()
        ent = df[df[smb_col]==0][col].dropna()
        if len(smb) < 3 or len(ent) < 3:
            continue
        m1, m2 = float(smb.mean()), float(ent.mean())
        s1, s2 = float(smb.std()), float(ent.std())
        n1, n2 = len(smb), len(ent)
        s_pooled = np.sqrt(((n1-1)*s1**2 + (n2-1)*s2**2) / max(1, (n1+n2-2)))
        d = (m2 - m1) / s_pooled if s_pooled > 0 else 0.0
        try:
            t, p = stats.ttest_ind(smb, ent, equal_var=False)
        except Exception:
            t, p = (None, None)
        out.append({
            'id': item_ids[i] if i < len(item_ids) else col,
            'name': item_names[i] if i < len(item_names) else col,
            'smb_mean': round(m1, 4),
            'ent_mean': round(m2, 4),
            'cohens_d': round(d, 4),
            't': round(float(t), 3) if t is not None else None,
            'p': round(float(p), 4) if p is not None else None,
            'sig_05': bool(p is not None and p < 0.05),
        })
    return out


def reliability_by_demo(df, barrier_cols, readiness_cols, maturity_cols, demo_filters):
    """Cronbach alpha for each construct within each demographic group."""
    out = {}
    for grp_label, mask in demo_filters.items():
        sub = df[mask]
        n = len(sub)
        out[grp_label] = {'n': int(n)}
        if n < 10:
            continue
        for cname, cols in [('Barriers', barrier_cols), ('Readiness', readiness_cols), ('Maturity', maturity_cols)]:
            a = cronbach_alpha(sub[cols])
            out[grp_label][cname] = round(float(a), 4) if not np.isnan(a) else None
    return out


def power_analysis(df, smb_col='_SMB'):
    """Post-hoc power: smallest detectable Cohen's d for SMB vs Enterprise t-test."""
    try:
        from statsmodels.stats.power import TTestIndPower
    except ImportError:
        return {'error': 'statsmodels.stats.power not available'}
    n_smb = int((df[smb_col]==1).sum())
    n_ent = int((df[smb_col]==0).sum())
    if n_smb < 5 or n_ent < 5:
        return {'error': f'insufficient N (SMB={n_smb}, ENT={n_ent})'}
    pwr = TTestIndPower()
    ratio = n_ent / n_smb
    detectable = float(pwr.solve_power(effect_size=None, nobs1=n_smb, alpha=0.05, power=0.80,
                                        ratio=ratio, alternative='two-sided'))
    return {
        'n_smb': n_smb,
        'n_enterprise': n_ent,
        'ratio': round(ratio, 4),
        'detectable_d_at_power_80': round(detectable, 4),
        'note': 'Smallest Cohen\'s d detectable at alpha=0.05, power=0.80',
    }


def equivalence_test_smb_ent(df, construct_cols_map, smb_col='_SMB', delta_sd=0.30):
    """TOST equivalence test for each construct mean (SMB vs Enterprise).

    delta_sd: equivalence band as a fraction of pooled SD (default 0.3 = small effect)
    """
    try:
        from statsmodels.stats.weightstats import ttost_ind
    except ImportError:
        return {'error': 'statsmodels.stats.weightstats not available'}
    out = {}
    for cname, cols in construct_cols_map.items():
        work = df.copy()
        work[f'_{cname}'] = work[cols].mean(axis=1)
        smb = work[work[smb_col]==1][f'_{cname}'].dropna()
        ent = work[work[smb_col]==0][f'_{cname}'].dropna()
        if len(smb) < 3 or len(ent) < 3:
            continue
        pooled_sd = float(np.sqrt(
            (smb.var()*(len(smb)-1) + ent.var()*(len(ent)-1)) / max(1, (len(smb)+len(ent)-2))
        ))
        delta = delta_sd * pooled_sd
        try:
            p_tost, _, _ = ttost_ind(smb, ent, low=-delta, upp=delta, usevar='unequal')
            out[cname] = {
                'p_tost': round(float(p_tost), 4),
                'delta': round(float(delta), 4),
                'pooled_sd': round(pooled_sd, 4),
                'equivalent_05': bool(p_tost < 0.05),
            }
        except Exception as e:
            out[cname] = {'error': str(e)}
    return out


def construct_stability_index(sensitivity_data):
    """Compute max range of each construct mean across all sample tiers."""
    if not sensitivity_data or 'tiers' not in sensitivity_data:
        return None
    construct_means = {}
    for tier in sensitivity_data.get('tiers', []):
        construct_means[tier['key']] = {
            'n': tier.get('n'),
            'b': (tier.get('barriers') or {}).get('mean'),
            'r': (tier.get('readiness') or {}).get('mean'),
            'm': (tier.get('maturity') or {}).get('mean'),
        }
    bvals = [t['b'] for t in construct_means.values() if t['b'] is not None]
    rvals = [t['r'] for t in construct_means.values() if t['r'] is not None]
    mvals = [t['m'] for t in construct_means.values() if t['m'] is not None]
    return {
        'tiers': construct_means,
        'max_range_barriers': round(max(bvals)-min(bvals), 4) if bvals else None,
        'max_range_readiness': round(max(rvals)-min(rvals), 4) if rvals else None,
        'max_range_maturity': round(max(mvals)-min(mvals), 4) if mvals else None,
    }


def bifactor_barriers(df, barrier_cols_safe, three_group_def):
    """Confirmatory bifactor on Barriers: G + 3 specific factors."""
    if not HAS_SEMOPY:
        return {'error': 'semopy not installed'}
    spec_lines = ["G =~ " + " + ".join(barrier_cols_safe)]
    for label, idxs in three_group_def.items():
        spec_lines.append(f"{label}S =~ " + " + ".join(barrier_cols_safe[i] for i in idxs))
    # Orthogonality
    factors = ['G'] + [f'{l}S' for l in three_group_def.keys()]
    for i in range(len(factors)):
        for j in range(i+1, len(factors)):
            spec_lines.append(f"{factors[i]} ~~ 0*{factors[j]}")
    spec = "\n".join(spec_lines)
    data = df[barrier_cols_safe].dropna()
    try:
        mod = semopy.Model(spec)
        mod.fit(data, obj='DWLS')
        st = semopy.calc_stats(mod)
        if 'Value' in st.index and 'CFI' not in st.index:
            def _stat(nm):
                return float(st.loc['Value', nm]) if nm in st.columns else None
        else:
            def _stat(nm):
                return float(st.loc[nm, 'Value']) if nm in st.index else None
        insp = mod.inspect(std_est=True)
        loads = insp[(insp['op']=='~') & (insp['Est. Std'].notna())]
        g_loads = loads[loads['rval']=='G']['Est. Std'].astype(float).tolist()
        spec_loads = {}
        for label in three_group_def.keys():
            spec_loads[label] = loads[loads['rval']==f'{label}S']['Est. Std'].astype(float).tolist()
        sum_g2 = sum(x**2 for x in g_loads)
        sum_spec2 = {l: sum(x**2 for x in spec_loads[l]) for l in three_group_def.keys()}
        denom = sum_g2 + sum(sum_spec2.values()) if (sum_g2 + sum(sum_spec2.values())) else 1.0
        n = len(barrier_cols_safe)
        sum_g = sum(g_loads)
        sum_spec = {l: sum(spec_loads[l]) for l in three_group_def.keys()}
        all_h2 = []
        for i, col in enumerate(barrier_cols_safe):
            g = g_loads[i] if i < len(g_loads) else 0
            s_val = 0
            for label, idxs in three_group_def.items():
                if i in idxs:
                    s_idx = idxs.index(i)
                    if s_idx < len(spec_loads[label]):
                        s_val = spec_loads[label][s_idx]
                    break
            all_h2.append(g**2 + s_val**2)
        total_var = sum_g**2 + sum(s_v**2 for s_v in sum_spec.values()) + (n - sum(all_h2))
        if total_var <= 0:
            total_var = 1.0
        return {
            'fit': {
                'chi2': round(_stat('chi2'), 3) if _stat('chi2') is not None else None,
                'df': int(_stat('DoF')) if _stat('DoF') is not None else None,
                'cfi': round(_stat('CFI'), 4) if _stat('CFI') is not None else None,
                'tli': round(_stat('TLI'), 4) if _stat('TLI') is not None else None,
                'rmsea': round(_stat('RMSEA'), 4) if _stat('RMSEA') is not None else None,
            },
            'n_listwise': int(len(data)),
            'ecv_general': round(sum_g2 / denom, 4),
            'ecv_specifics': {l: round(sum_spec2[l] / denom, 4) for l in three_group_def.keys()},
            'omega_h_general': round(sum_g**2 / total_var, 4),
            'omega_h_specifics': {l: round(sum_spec[l]**2 / total_var, 4) for l in three_group_def.keys()},
            'g_loadings': [round(x, 4) for x in g_loads],
        }
    except Exception as e:
        return {'error': str(e)}


def multigroup_3f_sem(df, barrier_cols_safe, three_group_def, group_col='_SMB'):
    """Fit 3F Barriers CFA separately for each group; report fit + latent correlations."""
    if not HAS_SEMOPY:
        return {'error': 'semopy not installed'}
    spec_lines = []
    for label, idxs in three_group_def.items():
        spec_lines.append(f"{label} =~ " + " + ".join(barrier_cols_safe[i] for i in idxs))
    spec = "\n".join(spec_lines)
    out = {}
    for grp_label, grp_value in [('Group_1', 1), ('Group_0', 0)]:
        sub = df[df[group_col]==grp_value][barrier_cols_safe].dropna()
        if len(sub) < 30:
            out[grp_label] = {'error': f'insufficient N: {len(sub)}'}
            continue
        try:
            mod = semopy.Model(spec)
            mod.fit(sub, obj='DWLS')
            st = semopy.calc_stats(mod)
            if 'Value' in st.index and 'CFI' not in st.index:
                def _stat(nm):
                    return float(st.loc['Value', nm]) if nm in st.columns else None
            else:
                def _stat(nm):
                    return float(st.loc[nm, 'Value']) if nm in st.index else None
            insp = mod.inspect(std_est=True)
            corrs = insp[(insp['op']=='~~') & (insp['Est. Std'].notna()) & (insp['lval']!=insp['rval'])]
            corr_dict = {f"{r['lval']}~~{r['rval']}": round(float(r['Est. Std']), 4) for _, r in corrs.iterrows()}
            out[grp_label] = {
                'n': int(len(sub)),
                'chi2': round(_stat('chi2'), 3) if _stat('chi2') is not None else None,
                'df': int(_stat('DoF')) if _stat('DoF') is not None else None,
                'cfi': round(_stat('CFI'), 4) if _stat('CFI') is not None else None,
                'rmsea': round(_stat('RMSEA'), 4) if _stat('RMSEA') is not None else None,
                'latent_correlations': corr_dict,
            }
        except Exception as e:
            out[grp_label] = {'error': str(e)}
    return out


def dif_irt(df, raw_cols, item_names, item_ids, group_col='_SMB', delta_threshold=0.5):
    """DIF: per-item IRT discrimination by group (SMB vs Enterprise)."""
    try:
        from girth import grm_mml
    except ImportError:
        return {'error': 'girth not installed'}
    g1_data = df[df[group_col]==1][raw_cols].dropna().astype(int).values
    g0_data = df[df[group_col]==0][raw_cols].dropna().astype(int).values
    if len(g1_data) < 30 or len(g0_data) < 30:
        return {'error': f'insufficient N (g1={len(g1_data)}, g0={len(g0_data)})'}
    try:
        irt1 = grm_mml((g1_data - 1).T)
        irt0 = grm_mml((g0_data - 1).T)
    except Exception as e:
        return {'error': f'girth failed: {e}'}
    items = []
    for i in range(len(raw_cols)):
        d1 = float(irt1['Discrimination'][i])
        d0 = float(irt0['Discrimination'][i])
        items.append({
            'id': item_ids[i] if i < len(item_ids) else raw_cols[i],
            'name': item_names[i] if i < len(item_names) else raw_cols[i],
            'discrimination_group_1': round(d1, 4),
            'discrimination_group_0': round(d0, 4),
            'delta': round(abs(d1 - d0), 4),
            'flag_dif': bool(abs(d1 - d0) > delta_threshold),
        })
    return {
        'n_group_1': int(len(g1_data)),
        'n_group_0': int(len(g0_data)),
        'delta_threshold': delta_threshold,
        'flagged_count': sum(1 for it in items if it['flag_dif']),
        'items': items,
    }


def esem_target_rotation(df, cols, n_factors=3):
    """Approximate ESEM via 3-factor EFA with oblimin rotation (free cross-loadings)."""
    if not HAS_FACTOR_ANALYZER:
        return {'error': 'factor_analyzer not installed'}
    data = df[cols].dropna()
    try:
        fa = FactorAnalyzer(n_factors=n_factors, rotation='oblimin', method='ml')
        fa.fit(data)
    except Exception:
        try:
            fa = FactorAnalyzer(n_factors=n_factors, rotation='oblimin', method='minres')
            fa.fit(data)
        except Exception as e:
            return {'error': str(e)}
    loads = fa.loadings_
    var_exp = fa.get_factor_variance()
    phi = fa.phi_ if hasattr(fa, 'phi_') and fa.phi_ is not None else None
    items = {}
    for i, col in enumerate(cols):
        loads_i = [round(float(loads[i][j]), 4) for j in range(n_factors)]
        primary = int(np.argmax(np.abs(loads[i])))
        items[f'B{i+1}'] = {
            'loadings': loads_i,
            'primary_factor': f'F{primary+1}',
        }
    return {
        'n_listwise': int(len(data)),
        'n_factors': n_factors,
        'variance_explained_per_factor': [round(float(x), 4) for x in var_exp[1]],
        'cumulative_variance': round(float(var_exp[2][-1]), 4),
        'factor_correlations': [[round(float(phi[i][j]), 4) for j in range(n_factors)] for i in range(n_factors)] if phi is not None else None,
        'items': items,
    }



def run_validation(df, skip=False, crp200=False, primary_sample=True, linderman=False):
    """Run full validation pipeline. Returns dict matching crp-validation.json schema.

    Args:
        df: pandas DataFrame containing scale-encoded survey responses.
        skip: when True, return immediately with a skipped sentinel dict
            (used by --skip-validation CLI flag).
        crp200: when True, use CRP-200 frozen-dataset code paths (single header
            CSV layout, pre-filtered rows, etc.).
        primary_sample: when False, skip the computationally expensive per-subgroup
            standalone validation (parallel_analysis + CFA per subgroup) to keep the
            daily pipeline fast when run_validation() is called for multiple samples.
        linderman: when True (and primary_sample is True), run the 'Linderman-grade'
            extension analyses (DWLS CFAs, bifactor, second-order, Mardia/Mahalanobis,
            CV, IRT GRM, per-factor regressions). Defaults to False so the daily
            production pipeline stays fast unless --linderman is explicitly passed.
    """
    if skip:
        return {"skipped": True, "reason": "--skip-validation flag was used"}

    cfa_models = build_cfa_models()

    print(f"\n{'='*70}")
    print(f"  INSTRUMENT VALIDATION")
    print(f"{'='*70}")

    barrier_result = validate_construct(df, BARRIER_COLS, BARRIER_NAMES, 'Barriers',
                                        cfa_model=cfa_models['barriers_1f'])
    readiness_result = validate_construct(df, READINESS_COLS, READINESS_NAMES, 'Readiness',
                                          cfa_model=cfa_models['readiness_1f'])
    maturity_result = validate_construct(df, MATURITY_COLS, MATURITY_NAMES, 'Maturity',
                                         cfa_model=cfa_models['maturity_1f'])
    construct_results = [barrier_result, readiness_result, maturity_result]

    # ── Multi-spec barrier CFAs (1F / 2F / 3F / 4F) ──
    print(f"\n{'='*70}")
    print(f"  BARRIER CFA MODEL COMPARISON (1F / 2F / 3F / 4F)")
    print(f"{'='*70}")
    safe_barrier_data = df[BARRIER_COLS].rename(columns={c: safe_col(c) for c in BARRIER_COLS})

    # 1F was already produced inside validate_construct(); use it for unified comparison.
    # Copy it before relabeling so the original construct-level validation output
    # remains unchanged while the model-comparison view uses a consistent name.
    barrier_1f_cfa = dict(barrier_result.get('cfa', {}))
    barrier_1f_cfa['construct'] = 'Barriers_1F'

    barrier_2f_cfa = run_cfa(safe_barrier_data, cfa_models['barriers_2f'], 'Barriers_2F')
    if 'error' not in barrier_2f_cfa:
        print(f"  2F: CFI={barrier_2f_cfa.get('cfi')}, RMSEA={barrier_2f_cfa.get('rmsea')}")
    else:
        print(f"  2F error: {barrier_2f_cfa['error']}")

    barrier_3f_cfa = run_cfa(safe_barrier_data, cfa_models['barriers_3f'], 'Barriers_3F')
    if 'error' not in barrier_3f_cfa:
        print(f"  3F: CFI={barrier_3f_cfa.get('cfi')}, RMSEA={barrier_3f_cfa.get('rmsea')}")
    else:
        print(f"  3F error: {barrier_3f_cfa['error']}")

    barrier_4f_cfa = run_cfa(safe_barrier_data, cfa_models['barriers_4f'], 'Barriers_4F')
    if 'error' not in barrier_4f_cfa:
        print(f"  4F: CFI={barrier_4f_cfa.get('cfi')}, RMSEA={barrier_4f_cfa.get('rmsea')}")
    else:
        print(f"  4F error: {barrier_4f_cfa['error']}")

    barrier_model_comparison = compare_cfa_models([
        barrier_1f_cfa, barrier_2f_cfa, barrier_3f_cfa, barrier_4f_cfa
    ])

    # ── Joint 3-construct CFA ──
    print(f"\n{'='*70}")
    print(f"  JOINT 3-CONSTRUCT CFA")
    print(f"{'='*70}")
    rename_all = {c: safe_col(c) for c in BARRIER_COLS + READINESS_COLS + MATURITY_COLS}
    joint_data = df[BARRIER_COLS + READINESS_COLS + MATURITY_COLS].rename(columns=rename_all)
    joint_cfa = run_cfa(joint_data, cfa_models['joint_3construct'], 'Joint_3Construct')
    if 'error' not in joint_cfa:
        print(f"  Joint: CFI={joint_cfa.get('cfi')}, RMSEA={joint_cfa.get('rmsea')}, "
              f"N(listwise)={joint_data.dropna().shape[0]}")
    else:
        print(f"  Joint error: {joint_cfa['error']}")

    # ── Item-level Hair-style convergent + discriminant ──
    print(f"\n{'='*70}")
    print(f"  ITEM-LEVEL HAIR TESTS")
    print(f"{'='*70}")
    barrier_efa_loads = barrier_result.get('efa', {}).get('loadings', {})
    barrier_item_ids = [f'B{i+1}' for i in range(len(BARRIER_NAMES))]
    item_level_barriers = item_level_validity(barrier_efa_loads, BARRIER_NAMES, barrier_item_ids)
    print(f"  Barriers: convergent FAIL={sum(1 for x in item_level_barriers if x['convergent']=='FAIL')}, "
          f"WEAK={sum(1 for x in item_level_barriers if x['convergent']=='WEAK')}; "
          f"discriminant FAIL={sum(1 for x in item_level_barriers if x['discriminant']=='FAIL')}")

    readiness_efa_loads = readiness_result.get('efa', {}).get('loadings', {})
    readiness_item_ids = [f'R{i+1}' for i in range(len(READINESS_NAMES))]
    item_level_readiness = item_level_validity(readiness_efa_loads, READINESS_NAMES, readiness_item_ids)
    print(f"  Readiness: convergent FAIL={sum(1 for x in item_level_readiness if x['convergent']=='FAIL')}, "
          f"WEAK={sum(1 for x in item_level_readiness if x['convergent']=='WEAK')}")

    maturity_efa_loads = maturity_result.get('efa', {}).get('loadings', {})
    maturity_item_ids = [f'M{i+1}' for i in range(len(MATURITY_NAMES))]
    item_level_maturity = item_level_validity(maturity_efa_loads, MATURITY_NAMES, maturity_item_ids)
    print(f"  Maturity: convergent FAIL={sum(1 for x in item_level_maturity if x['convergent']=='FAIL')}, "
          f"WEAK={sum(1 for x in item_level_maturity if x['convergent']=='WEAK')}")

    item_level = {
        'barriers': item_level_barriers,
        'readiness': item_level_readiness,
        'maturity': item_level_maturity,
    }

    # ── Subgroup HTMT + Fornell-Larcker (F1a / F1b / F2) ──
    print(f"\n{'='*70}")
    print(f"  SUBGROUP DISCRIMINANT VALIDITY (F1a / F1b / F2 as 3 constructs)")
    print(f"{'='*70}")
    # EFA loadings are keyed by original (unsafe) column names; use original cols for lookup.
    barrier_loadings_matrix = barrier_result.get('efa', {}).get('loadings', {})
    barrier_col_map = {c: safe_col(c) for c in BARRIER_COLS}
    barrier_cols_list = [barrier_col_map[c] for c in BARRIER_COLS]
    subgroup_aves = {}
    for grp_label, idxs in BARRIER_3GROUP.items():
        load_idx = 0 if grp_label in ('F1a', 'F1b') else 1
        lams = []
        for i in idxs:
            original_col = BARRIER_COLS[i]
            lv = barrier_loadings_matrix.get(original_col)
            if lv is not None and len(lv) > load_idx:
                lams.append(float(lv[load_idx]))
        subgroup_aves[grp_label] = ave_from_loadings(lams) if lams else None

    subgroup_validity = subgroup_discriminant(
        safe_barrier_data, BARRIER_3GROUP, barrier_cols_list, subgroup_aves,
        n_boot=2000 if primary_sample else 500,
    )
    for r in subgroup_validity['htmt']:
        verdict = 'PASS' if r['pass_085'] else 'FAIL'
        print(f"  HTMT {r['pair']}: {r['htmt']} [{r['ci_lower']}, {r['ci_upper']}] {verdict}")

    # ── Linderman-grade extensions: DWLS ordinal CFA, bifactor, second-order, normality, CV ──
    # Only run for the primary sample AND when --linderman is explicitly passed, so the
    # daily production pipeline avoids the runtime cost (~6+ expensive semopy fits per sample).
    cfa_dwls = {}; bifactor_results = {}; secondorder_results = {}
    mardia_results = {}; mahalanobis_results = {}; cv_results = {}
    irt_results = {}; per_factor_reg = {}
    if primary_sample and linderman:
        print(f"\n{'='*70}")
        print(f"  LINDERMAN-GRADE EXTENSIONS")
        print(f"{'='*70}")
        _barrier_cols_safe = [safe_col(c) for c in BARRIER_COLS]
        _barrier_renamed = df[BARRIER_COLS].rename(columns={c: safe_col(c) for c in BARRIER_COLS})
        _readiness_renamed = df[READINESS_COLS].rename(columns={c: safe_col(c) for c in READINESS_COLS})
        _maturity_renamed = df[MATURITY_COLS].rename(columns={c: safe_col(c) for c in MATURITY_COLS})

        cfa_dwls['Barriers_1F'] = run_cfa_dwls(_barrier_renamed, cfa_models['barriers_1f'], 'Barriers_1F')
        cfa_dwls['Barriers_2F'] = run_cfa_dwls(_barrier_renamed, cfa_models['barriers_2f'], 'Barriers_2F')
        cfa_dwls['Barriers_3F'] = run_cfa_dwls(_barrier_renamed, cfa_models['barriers_3f'], 'Barriers_3F')
        cfa_dwls['Barriers_4F'] = run_cfa_dwls(_barrier_renamed, cfa_models['barriers_4f'], 'Barriers_4F')
        cfa_dwls['Readiness_1F'] = run_cfa_dwls(_readiness_renamed, cfa_models['readiness_1f'], 'Readiness_1F')
        cfa_dwls['Maturity_1F'] = run_cfa_dwls(_maturity_renamed, cfa_models['maturity_1f'], 'Maturity_1F')
        print(f"  DWLS Barriers 3F: CFI={cfa_dwls['Barriers_3F'].get('cfi')}")

        bifactor_results = bifactor_rm(df, [safe_col(c) for c in READINESS_COLS], [safe_col(c) for c in MATURITY_COLS])
        if 'error' not in bifactor_results:
            print(f"  Bifactor R+M: ECV={bifactor_results.get('ecv_general')}, omega_h={bifactor_results.get('omega_h_general')}")

        secondorder_results = second_order_barriers_cfa(_barrier_renamed, _barrier_cols_safe, BARRIER_3GROUP)
        if 'error' not in secondorder_results:
            print(f"  Second-order Barriers: CFI={secondorder_results.get('cfi')}")

        for cname, sub in [('Barriers', _barrier_renamed),
                            ('Readiness', _readiness_renamed),
                            ('Maturity', _maturity_renamed)]:
            mardia_results[cname] = mardia_multivariate_normality(sub)
            mahalanobis_results[cname] = mahalanobis_outliers(sub)

        cv_results = split_sample_cv(_barrier_renamed, _barrier_cols_safe, BARRIER_3GROUP)

        # IRT graded response models per construct
        barrier_short_ids = [f'B{i+1}' for i in range(len(BARRIER_NAMES))]
        readiness_short_ids = [f'R{i+1}' for i in range(len(READINESS_NAMES))]
        maturity_short_ids = [f'M{i+1}' for i in range(len(MATURITY_NAMES))]
        irt_results['Barriers'] = irt_grm(_barrier_renamed, _barrier_cols_safe, barrier_short_ids, BARRIER_NAMES)
        irt_results['Readiness'] = irt_grm(_readiness_renamed, [safe_col(c) for c in READINESS_COLS], readiness_short_ids, READINESS_NAMES)
        irt_results['Maturity'] = irt_grm(_maturity_renamed, [safe_col(c) for c in MATURITY_COLS], maturity_short_ids, MATURITY_NAMES)
        if 'error' not in irt_results['Barriers']:
            print(f"  IRT Barriers: mean discrimination={irt_results['Barriers'].get('mean_discrimination')}, "
                  f"ceiling-effect items={irt_results['Barriers'].get('ceiling_effect_count')}")

        # Per-factor regressions (sub-factor decomposition vs full-scale aggregate)
        per_factor_reg = per_factor_regressions(df, BARRIER_COLS, READINESS_COLS, MATURITY_COLS, BARRIER_3GROUP)
        if 'Readiness_mean' in per_factor_reg and 'error' not in per_factor_reg.get('Readiness_mean', {}):
            rr = per_factor_reg['Readiness_mean']
            print(f"  Per-factor Reg (Readiness): R^2 total={rr['total_scale_model']['r2']} "
                  f"-> sub-factor={rr['sub_factor_model']['r2']} (lift={rr['r2_lift_from_decomposition']})")
    # Tier 1+2 extensions
    if 'Q4_OrgSize' in df.columns:
        df['_SMB'] = df['Q4_OrgSize'].isin(['<100','100-499','500-999']).astype(int)
        df['_PROFIT'] = (df.get('Q5_ProfitModel') == 'For-Profit').astype(int) if 'Q5_ProfitModel' in df.columns else 0
        mediation_results = mediation_b_r_m(df, BARRIER_COLS, READINESS_COLS, MATURITY_COLS)
        std_reg = standardized_subfactor_regressions(df, BARRIER_COLS, READINESS_COLS, MATURITY_COLS, BARRIER_3GROUP)
        bootstrap_alpha_results = {cname: bootstrap_alpha_ci(df[cols]) for cname, cols in [('Barriers', BARRIER_COLS), ('Readiness', READINESS_COLS), ('Maturity', MATURITY_COLS)]}
        item_d_smb = {}
        for cname, cols, names, ids in [('Barriers', BARRIER_COLS, BARRIER_NAMES, [f'B{i+1}' for i in range(len(BARRIER_NAMES))]), ('Readiness', READINESS_COLS, READINESS_NAMES, [f'R{i+1}' for i in range(len(READINESS_NAMES))]), ('Maturity', MATURITY_COLS, MATURITY_NAMES, [f'M{i+1}' for i in range(len(MATURITY_NAMES))])]:
            item_d_smb[cname] = item_level_cohens_d_smb(df, cols, names, ids, smb_col='_SMB')
        reliability_demo = reliability_by_demo(df, BARRIER_COLS, READINESS_COLS, MATURITY_COLS, {'SMB': df['_SMB']==1, 'Enterprise': df['_SMB']==0, 'For_Profit': df['_PROFIT']==1, 'Non_Profit_or_Gov': df['_PROFIT']==0})
        power_results = power_analysis(df, smb_col='_SMB')
        tost_results = equivalence_test_smb_ent(df, {'Barriers': BARRIER_COLS, 'Readiness': READINESS_COLS, 'Maturity': MATURITY_COLS}, smb_col='_SMB')
        bifactor_b_results = bifactor_barriers(barrier_renamed, barrier_cols_safe, BARRIER_3GROUP)
        renamed_with_demo = barrier_renamed.copy()
        renamed_with_demo['_SMB'] = df['_SMB'].reindex(barrier_renamed.index).values
        multigroup_3f_results = multigroup_3f_sem(renamed_with_demo, barrier_cols_safe, BARRIER_3GROUP, group_col='_SMB')
        dif_results = {}
        for cname, cols, names, ids in [('Barriers', BARRIER_COLS, BARRIER_NAMES, [f'B{i+1}' for i in range(len(BARRIER_NAMES))]), ('Readiness', READINESS_COLS, READINESS_NAMES, [f'R{i+1}' for i in range(len(READINESS_NAMES))]), ('Maturity', MATURITY_COLS, MATURITY_NAMES, [f'M{i+1}' for i in range(len(MATURITY_NAMES))])]:
            dif_results[cname] = dif_irt(df, cols, names, ids, group_col='_SMB')
        esem_results = esem_target_rotation(barrier_renamed, barrier_cols_safe, n_factors=3)
        if 'error' not in mediation_results:
            ind = (mediation_results.get('Indirect') or {}).get('coef')
            print(f"  Mediation B->R->M: indirect={ind}")
        if 'error' not in bifactor_b_results:
            print(f"  Bifactor Barriers: ECV(G)={bifactor_b_results.get('ecv_general')}, omega_h(G)={bifactor_b_results.get('omega_h_general')}")
    else:
        mediation_results = std_reg = power_results = tost_results = multigroup_3f_results = dif_results = {'error': 'Q4_OrgSize not in df'}
        bootstrap_alpha_results = item_d_smb = reliability_demo = {}
        bifactor_b_results = bifactor_barriers(barrier_renamed, barrier_cols_safe, BARRIER_3GROUP)
        esem_results = esem_target_rotation(barrier_renamed, barrier_cols_safe, n_factors=3)


    # ── Per-subgroup standalone validation ──
    # This is computationally expensive (parallel_analysis + CFA per subgroup), so it
    # only runs for the primary sample to avoid multiplying runtime across all 5 samples
    # in the daily pipeline.
    if primary_sample:
        print(f"\n{'='*70}")
        print(f"  PER-SUBGROUP STANDALONE VALIDATION (canonical 3-group F1a/F1b/F2)")
        print(f"{'='*70}")
        barrier_cols_safe = [safe_col(c) for c in BARRIER_COLS]
        barrier_renamed = df[BARRIER_COLS].rename(columns={c: safe_col(c) for c in BARRIER_COLS})
        standalone_3group = subgroup_standalone_validation(
            barrier_renamed, BARRIER_3GROUP, barrier_cols_safe, BARRIER_NAMES
        )
        for r in standalone_3group:
            cfa = r.get('cfa_1f', {}) or {}
            v = r.get('verdict', {}) or {}
            print(f"  {r['name']:<20} k={r['k']} N={r['n_listwise']} alpha={r.get('alpha')} "
                  f"PA={r.get('parallel_analysis_factors')} CFI={cfa.get('cfi')} RMSEA={cfa.get('rmsea')} "
                  f"PASS={v.get('overall_pass')}")

        print(f"\n{'='*70}")
        print(f"  PER-SUBGROUP STANDALONE VALIDATION (legacy 4-group BARRIER_SUBCONSTRUCTS)")
        print(f"{'='*70}")
        legacy_4group = {label: idxs for label, idxs in BARRIER_SUBCONSTRUCTS.items()}
        standalone_4group = subgroup_standalone_validation(
            barrier_renamed, legacy_4group, barrier_cols_safe, BARRIER_NAMES
        )
        for r in standalone_4group:
            cfa = r.get('cfa_1f', {}) or {}
            v = r.get('verdict', {}) or {}
            print(f"  {r['name']:<35} k={r['k']} N={r['n_listwise']} alpha={r.get('alpha')} "
                  f"PA={r.get('parallel_analysis_factors')} CFI={cfa.get('cfi')} RMSEA={cfa.get('rmsea')} "
                  f"PASS={v.get('overall_pass')}")

        subgroup_standalone = {
            '3group_canonical': standalone_3group,
            '4group_theoretical': standalone_4group,
        }
    else:
        subgroup_standalone = None

    # ── Alpha-if-deleted summary ──
    print(f"\n{'='*70}")
    print(f"  ALPHA-IF-DELETED SUMMARY")
    print(f"{'='*70}")
    aid_summary = alpha_if_deleted_summary(construct_results)
    for s in aid_summary:
        print(f"  {s['construct']}: {s['items_increasing_alpha_count']} items would raise alpha")

    # Discriminant validity
    print(f"\n{'='*70}")
    print(f"  DISCRIMINANT VALIDITY")
    print(f"{'='*70}")
    pairs = [
        ('Barriers', BARRIER_COLS, 'Readiness', READINESS_COLS),
        ('Barriers', BARRIER_COLS, 'Maturity', MATURITY_COLS),
        ('Readiness', READINESS_COLS, 'Maturity', MATURITY_COLS),
    ]
    htmt_results = []
    for name1, cols1, name2, cols2 in pairs:
        d1, d2 = df[cols1], df[cols2]
        h, (ci_lo, ci_hi) = htmt_bootstrap_ci(d1, d2, n_boot=2000)
        print(f"  {name1} vs {name2}: HTMT={h:.4f} [{ci_lo:.4f}, {ci_hi:.4f}] {'PASS' if h < 0.85 else 'FAIL'}")
        htmt_results.append({
            'pair': f"{name1} vs {name2}",
            'htmt': round(h, 4),
            'ci_lower': ci_lo, 'ci_upper': ci_hi,
            'below_085': h < 0.85, 'below_090': h < 0.90,
        })

    # Fornell-Larcker
    ave_dict = {}
    for cr in construct_results:
        name = cr['construct']
        ave = cr.get('ave_from_loadings')
        if ave:
            ave_dict[name] = ave

    constructs_map = {'Barriers': BARRIER_COLS, 'Readiness': READINESS_COLS, 'Maturity': MATURITY_COLS}
    corr_mat = {}
    for n1, c1 in constructs_map.items():
        corr_mat[n1] = {}
        pm1 = df[c1].mean(axis=1)
        for n2, c2 in constructs_map.items():
            pm2 = df[c2].mean(axis=1)
            valid = pm1.notna() & pm2.notna()
            corr_mat[n1][n2] = round(float(pm1[valid].corr(pm2[valid])), 4)

    fl_results_raw = fornell_larcker(ave_dict, corr_mat) if ave_dict else []
    fl_results = []
    for fl in fl_results_raw:
        fl_results.append({
            "pair": fl['pair'].replace('-', ' vs '),
            "sqrt_ave1": fl['sqrt_ave_1'],
            "sqrt_ave2": fl['sqrt_ave_2'],
            "abs_r": round(abs(fl['correlation']), 4),
            "pass": fl['passes'],
        })

    # Build output matching crp-validation.json schema
    output = OrderedDict()

    # Per-construct blocks
    for cr in construct_results:
        cname = cr['construct']
        block = OrderedDict()
        block['cronbach_alpha'] = cr['cronbach_alpha']
        block['cronbach_alpha_ci'] = cr['alpha_95ci']
        block['n_listwise'] = cr['n_valid_listwise']
        block['mcdonalds_omega'] = cr.get('mcdonalds_omega')
        block['composite_reliability'] = cr.get('composite_reliability')
        block['ave'] = cr.get('ave_from_loadings')
        block['split_half'] = cr.get('split_half_spearman_brown')

        # KMO/Bartlett
        efa_data = cr.get('efa', {})
        block['kmo_bartlett'] = {
            'kmo_overall': efa_data.get('kmo_model'),
            'bartlett_chi2': efa_data.get('bartlett_chi2'),
            'bartlett_p': efa_data.get('bartlett_p', 0.0),
        }
        block['parallel_analysis'] = {
            'n_factors': efa_data.get('parallel_analysis_factors', efa_data.get('n_factors')),
            'eigenvalues_real': efa_data.get('eigenvalues_original', [])[:4],
        }

        # EFA
        efa_block = {
            'construct': cname,
            'n_factors': efa_data.get('n_factors'),
            'variance_explained': efa_data.get('variance_explained', {}).get('per_factor', []),
            'total_variance': efa_data.get('variance_explained', {}).get('total'),
            'factor_correlations': efa_data.get('factor_correlations'),
            'loadings': {},
        }
        raw_loadings = efa_data.get('loadings', {})
        if raw_loadings:
            for i, col in enumerate(BARRIER_COLS if cname == 'Barriers' else (READINESS_COLS if cname == 'Readiness' else MATURITY_COLS)):
                short_name = f"B{i+1}" if cname == 'Barriers' else (f"R{i+1}" if cname == 'Readiness' else f"M{i+1}")
                if col in raw_loadings:
                    efa_block['loadings'][short_name] = raw_loadings[col]
        block['efa'] = efa_block

        # CFA
        cfa_data = cr.get('cfa', {})
        cfa_block = {
            'construct': cname,
            'chi2': cfa_data.get('chi2'),
            'df': cfa_data.get('df'),
            'chi2_p': cfa_data.get('chi2_p'),
            'cfi': cfa_data.get('cfi'),
            'tli': cfa_data.get('tli'),
            'rmsea': cfa_data.get('rmsea'),
            'srmr': cfa_data.get('srmr'),
        }
        if 'error' in cfa_data:
            cfa_block['error'] = cfa_data['error']
        block['cfa'] = cfa_block

        # Inter-item
        iic = cr.get('inter_item_correlations', {})
        block['inter_item'] = {
            'mean_r': iic.get('mean'),
            'min_r': iic.get('min'),
            'max_r': iic.get('max'),
            'sd_r': iic.get('sd'),
        }

        # ITC
        citc = cr.get('corrected_item_total', {})
        citc_vals = [v for v in citc.values() if v is not None]
        block['itc_min'] = round(min(citc_vals), 2) if citc_vals else None
        block['itc_all_above_030'] = len(cr.get('citc_flagged_below_030', [])) == 0

        output[cname] = block

    # HTMT
    output['htmt'] = htmt_results
    output['fornell_larcker'] = fl_results
    output['construct_correlations'] = corr_mat

    # 4-factor barriers CFA (legacy decomposition)
    b4f_out = {}
    if 'error' not in barrier_4f_cfa:
        for k in ['chi2', 'df', 'chi2_p', 'cfi', 'tli', 'rmsea', 'aic', 'bic']:
            b4f_out[k] = barrier_4f_cfa.get(k)
    else:
        b4f_out['error'] = barrier_4f_cfa['error']
    output['barriers_4f_cfa'] = b4f_out

    # Extension analyses (added 2026-05-01) - all consumed by /factor-analysis,
    # /validation, and /reliability pages on both crp-2026 and live tracks.
    def _cfa_block(c):
        if not c or 'error' in c:
            return {'error': (c or {}).get('error', 'unavailable')}
        return {k: c.get(k) for k in ['chi2', 'df', 'chi2_p', 'cfi', 'tli', 'rmsea',
                                       'aic', 'bic', 'standardized_loadings']}

    # 2-factor barriers CFA (matches the EFA-derived structure parallel analysis returned)
    output['barriers_2f_cfa'] = _cfa_block(barrier_2f_cfa)
    # 3-factor barriers CFA (canonical F1a/F1b/F2 - the decomposition reported in CRP §4.3.2)
    output['barriers_3f_cfa'] = _cfa_block(barrier_3f_cfa)
    # Joint 3-construct CFA (Barriers + Readiness + Maturity, free latent correlations)
    output['joint_3construct_cfa'] = _cfa_block(joint_cfa)
    # Formal CFA model comparison (chi-squared difference, delta-AIC, delta-BIC)
    output['barrier_model_comparison'] = barrier_model_comparison
    # Item-level Hair convergent/discriminant tests
    output['item_level_validity'] = item_level
    # HTMT + Fornell-Larcker treating F1a/F1b/F2 as 3 constructs
    output['subgroup_discriminant_validity'] = subgroup_validity
    # Per-subgroup standalone validation (primary sample only; None for non-primary samples)
    if subgroup_standalone is not None:
        output['subgroup_standalone_validation'] = subgroup_standalone
    # Alpha-if-deleted summary across all three constructs
    output['alpha_if_deleted_summary'] = aid_summary
    # Linderman-grade extensions (primary sample + --linderman only; added 2026-05-01)
    if primary_sample and linderman:
        output['cfa_dwls_estimator'] = cfa_dwls
        output['bifactor_rm'] = bifactor_results
        output['second_order_barriers_cfa'] = secondorder_results
        output['mardia_normality'] = mardia_results
        output['mahalanobis_outliers'] = mahalanobis_results
        output['barriers_3f_cross_validation'] = cv_results
        output['irt_grm'] = irt_results
        output['per_factor_regressions'] = per_factor_reg
    output['mediation_b_r_m'] = mediation_results
    output['standardized_subfactor_regressions'] = std_reg
    output['bootstrap_alpha_ci'] = bootstrap_alpha_results
    output['item_level_cohens_d_smb'] = item_d_smb
    output['reliability_by_demo'] = reliability_demo
    output['power_analysis'] = power_results
    output['equivalence_test_tost_smb_ent'] = tost_results
    output['bifactor_barriers'] = bifactor_b_results
    output['multigroup_3f_smb_vs_ent'] = multigroup_3f_results
    output['dif_irt_smb_vs_ent'] = dif_results
    output['esem_3factor'] = esem_results

    # Factor analysis summary (for EFA factors)
    barrier_efa = barrier_result.get('efa', {})
    n_factors_b = barrier_efa.get('n_factors', 0)
    loadings_raw = barrier_efa.get('loadings', {})
    eigenvalues_raw = barrier_efa.get('eigenvalues_original', [])
    var_explained_raw = barrier_efa.get('variance_explained', {}).get('per_factor', [])

    efa_factors = []
    if n_factors_b >= 1 and eigenvalues_raw:
        for fi in range(min(n_factors_b, len(eigenvalues_raw))):
            items_in_factor = 0
            for col, loading_vals in loadings_raw.items():
                if fi < len(loading_vals):
                    max_factor = max(range(len(loading_vals)), key=lambda x: abs(loading_vals[x]))
                    if max_factor == fi:
                        items_in_factor += 1
            efa_factors.append({
                "name": f"F{fi+1}",
                "items": items_in_factor,
                "eigenvalue": eigenvalues_raw[fi] if fi < len(eigenvalues_raw) else None,
                "variance_pct": round(var_explained_raw[fi] * 100, 1) if fi < len(var_explained_raw) else None,
            })

    loadings_matrix = []
    for i, col in enumerate(BARRIER_COLS):
        short_name = f"B{i+1}"
        if col in loadings_raw:
            lv = loadings_raw[col]
            entry = {"id": short_name}
            for fi in range(len(lv)):
                entry[f"f{fi+1}"] = lv[fi]
            if lv:
                max_f = max(range(len(lv)), key=lambda x: abs(lv[x]))
                entry["assigned"] = f"F{max_f+1}"
            loadings_matrix.append(entry)

    factor_correlation = barrier_efa.get('factor_correlations')
    if factor_correlation and len(factor_correlation) > 1:
        factor_correlation = factor_correlation[0][1]
    else:
        factor_correlation = None

    # ── Three-group decomposition of Barriers (F1a/F1b split + F2) ──
    # Canonical group definitions - emitted as `item_ids` in each
    # three_groups entry of crp-validation.json so the UI consumes
    # them from data rather than maintaining a separate list.
    THREE_GROUP_DEFS = [
        ('F1a \u2014 Strategy & Culture',
         ['B1', 'B2', 'B3', 'B5', 'B9', 'B10', 'B11', 'B15', 'B17'], 'f1'),
        ('F1b \u2014 Resources & Operations',
         ['B4', 'B6', 'B7', 'B8', 'B12'], 'f1'),
        ('F2 \u2014 External & Compliance',
         ['B13', 'B14', 'B16', 'B18'], 'f2'),
    ]
    lm_by_id = {r['id']: r for r in loadings_matrix}
    three_groups = []
    for grp_name, grp_ids, factor_key in THREE_GROUP_DEFS:
        missing = [
            bid for bid in grp_ids
            if bid not in lm_by_id or lm_by_id[bid].get(factor_key) is None
        ]
        lambdas = [
            lm_by_id[bid].get(factor_key)
            for bid in grp_ids
            if bid in lm_by_id and lm_by_id[bid].get(factor_key) is not None
        ]
        k = len(lambdas)
        alpha_val = None
        cr_val = None
        ave_val = None
        # Only compute stats when we have the complete item set
        if lambdas and not missing:
            cr_raw = composite_reliability(lambdas)
            cr_val = None if (cr_raw is None or np.isnan(cr_raw)) else float(cr_raw)
            ave_val = ave_from_loadings(lambdas)
            # Approximate alpha from the factor-model implied correlation matrix
            lam_arr = np.array(lambdas, dtype=float)
            off_diag = float(lam_arr.sum() ** 2 - (lam_arr ** 2).sum())
            total_var = k + off_diag
            alpha_val = (k / (k - 1)) * (off_diag / total_var) if (k > 1 and total_var) else None
        entry = {
            'name': grp_name,
            'item_ids': list(grp_ids),
            'items': len(grp_ids),
            'alpha': round(alpha_val, 4) if alpha_val is not None else None,
            'cr': round(cr_val, 4) if cr_val is not None else None,
            'ave': round(ave_val, 4) if ave_val is not None else None,
        }
        if missing:
            entry['items_computed'] = k
            entry['missing_items'] = missing
        three_groups.append(entry)

    output['factor_analysis'] = {
        'efa_factors': efa_factors,
        'three_groups': three_groups,
        'factor_correlation': factor_correlation,
        'barrier_names': BARRIER_NAMES,
        'loadings_matrix': loadings_matrix,
    }

    # Verdicts
    verdicts = {}
    for cr in construct_results:
        cname = cr['construct']
        cfa_data = cr.get('cfa', {})
        efa_data = cr.get('efa', {})
        v = {
            "alpha_above_070": cr['cronbach_alpha'] >= 0.70 if cr['cronbach_alpha'] else False,
            "omega_above_070": (cr.get('mcdonalds_omega') or 0) >= 0.70,
            "cr_above_070": (cr.get('composite_reliability') or 0) >= 0.70,
            "ave_above_050": (cr.get('ave_from_loadings') or 0) >= 0.50,
            "itc_all_above_030": len(cr.get('citc_flagged_below_030', [])) == 0,
            "split_half_above_070": (cr.get('split_half_spearman_brown') or 0) >= 0.70,
            "kmo_above_060": (efa_data.get('kmo_model') or 0) >= 0.60,
            "bartlett_significant": efa_data.get('bartlett_p', 1.0) < 0.05 if efa_data.get('bartlett_p') is not None else False,
            "cfa_cfi_above_090": (cfa_data.get('cfi') or 0) >= 0.90,
            "cfa_rmsea_below_008": cfa_data['rmsea'] <= 0.08 if cfa_data.get('rmsea') is not None else False,
        }
        # Count only boolean-like pass/fail results, while still accepting numpy.bool_
        v["pass_count"] = count_bool_true(v)
        v["total_criteria"] = 10
        verdicts[cname] = v
    output['verdicts'] = verdicts

    output['metadata'] = {
        'n_total': len(df),
        'crp200_mode': crp200,
        'constructs': ['Barriers', 'Readiness', 'Maturity'],
        'n_barriers': 18,
        'n_readiness': 17,
        'n_maturity': 8,
    }

    return output


# ============================================================================
# JSON SERIALIZATION
# ============================================================================

class NumpyEncoder(json.JSONEncoder):
    """JSON encoder that handles numpy types and NaN/Inf."""
    def default(self, obj):
        if isinstance(obj, (np.integer,)):
            return int(obj)
        if isinstance(obj, (np.floating,)):
            if np.isnan(obj) or np.isinf(obj):
                return None
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if isinstance(obj, np.bool_):
            return bool(obj)
        if isinstance(obj, float) and (math.isnan(obj) or math.isinf(obj)):
            return None
        if isinstance(obj, OrderedDict):
            return dict(obj)
        return super().default(obj)


# ============================================================================
# MAIN
# ============================================================================


# ============================================================================
# 23. IRT GRADED RESPONSE MODEL (Samejima) - added 2026-05-01
# Marginal MLE estimation via girth. Gracefully degrades if girth unavailable.
# ============================================================================

try:
    from girth import grm_mml
    HAS_GIRTH = True
except ImportError:
    HAS_GIRTH = False


def irt_grm(df, cols, item_ids, item_names=None):
    """Samejima graded response model.

    Returns per-item discrimination (a) and 4 thresholds (b1..b4) for 5-point
    Likert. Plus summary stats and ceiling-effect flags.
    """
    if not HAS_GIRTH:
        return {'error': 'girth not installed'}
    data = df[cols].dropna().astype(int).values
    if data.shape[0] < 30 or data.shape[1] < 3:
        return {'error': 'insufficient data for IRT (need >=30 N, >=3 items)'}
    arr = (data - 1).T  # girth wants 0-indexed, items x persons
    try:
        result = grm_mml(arr)
    except Exception as e:
        return {'error': f'girth.grm_mml failed: {e}'}
    disc = [float(x) for x in result['Discrimination']]
    diff = result['Difficulty']
    items = []
    for i in range(len(cols)):
        thr = [float(diff[i, j]) for j in range(diff.shape[1])]
        # Ceiling effect: any threshold extremely low (population endorses uniformly)
        ceiling = bool(min(thr) < -3.0) if thr else False
        items.append({
            'id': item_ids[i] if i < len(item_ids) else cols[i],
            'name': item_names[i] if item_names and i < len(item_names) else (item_ids[i] if i < len(item_ids) else cols[i]),
            'discrimination': round(disc[i], 4),
            'thresholds': [round(x, 4) for x in thr],
            'low_discrimination_flag': bool(disc[i] < 0.5),
            'high_discrimination_flag': bool(disc[i] > 1.5),
            'ceiling_effect_flag': ceiling,
        })
    return {
        'n_listwise': int(data.shape[0]),
        'n_items': int(data.shape[1]),
        'mean_discrimination': round(sum(disc) / len(disc), 4),
        'min_discrimination': round(min(disc), 4),
        'max_discrimination': round(max(disc), 4),
        'low_discrimination_count': sum(1 for d in disc if d < 0.5),
        'high_discrimination_count': sum(1 for d in disc if d > 1.5),
        'ceiling_effect_count': sum(1 for it in items if it['ceiling_effect_flag']),
        'items': items,
    }




# ============================================================================
# 24. PER-FACTOR REGRESSIONS (added 2026-05-01)
# Uses statsmodels OLS to break down barrier effects by sub-factor.
# Reveals sign-reversals masked by full-scale aggregate scores.
# ============================================================================

def per_factor_regressions(df, barrier_cols, readiness_cols, maturity_cols, three_group_def):
    """Run regressions of construct means on barrier sub-factor means.

    Returns dict with R^2, coefficients, p-values for sub-factor models on
    Readiness and Maturity, plus a full-scale comparison. Quantifies the
    'is the sub-factor decomposition substantively useful?' question.
    """
    try:
        import statsmodels.formula.api as smf
    except ImportError:
        return {'error': 'statsmodels not installed'}
    work = df.copy()
    work['Barriers_mean'] = work[barrier_cols].mean(axis=1)
    work['Readiness_mean'] = work[readiness_cols].mean(axis=1)
    work['Maturity_mean'] = work[maturity_cols].mean(axis=1)
    for label, idxs in three_group_def.items():
        cols = [barrier_cols[i] for i in idxs]
        work[f'{label}_mean'] = work[cols].mean(axis=1)
    factor_cols = [f'{label}_mean' for label in three_group_def.keys()]

    out = {}
    for outcome in ['Readiness_mean', 'Maturity_mean']:
        # Total-scale model
        try:
            m_total = smf.ols(f'{outcome} ~ Barriers_mean', data=work).fit()
            # Sub-factor model
            m_sub = smf.ols(f'{outcome} ~ ' + ' + '.join(factor_cols), data=work).fit()
            out[outcome] = {
                'total_scale_model': {
                    'r2': round(float(m_total.rsquared), 4),
                    'r2_adj': round(float(m_total.rsquared_adj), 4),
                    'beta': round(float(m_total.params.get('Barriers_mean', 0)), 4),
                    'p': round(float(m_total.pvalues.get('Barriers_mean', 1)), 4),
                    'n': int(m_total.nobs),
                },
                'sub_factor_model': {
                    'r2': round(float(m_sub.rsquared), 4),
                    'r2_adj': round(float(m_sub.rsquared_adj), 4),
                    'f': round(float(m_sub.fvalue), 3),
                    'f_p': round(float(m_sub.f_pvalue), 6),
                    'n': int(m_sub.nobs),
                    'sub_factors': {col.replace('_mean',''): {
                        'beta': round(float(m_sub.params.get(col, 0)), 4),
                        't': round(float(m_sub.tvalues.get(col, 0)), 3),
                        'p': round(float(m_sub.pvalues.get(col, 1)), 4),
                    } for col in factor_cols},
                },
                'r2_lift_from_decomposition': round(float(m_sub.rsquared - m_total.rsquared), 4),
            }
        except Exception as e:
            out[outcome] = {'error': str(e)}
    return out



def main():
    parser = argparse.ArgumentParser(
        description="TABS V2 Unified Data Analysis - consolidates descriptive, advanced, quality, and validation analyses",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Full analysis with JSON output
  python tabs_v2_unified_data_analysis.py data.csv --json unified.json

  # CRP-200 pre-filtered dataset
  python tabs_v2_unified_data_analysis.py crp200.csv --json output.json --crp200

  # Skip EFA/CFA validation
  python tabs_v2_unified_data_analysis.py data.csv --json output.json --skip-validation

  # Use flexible clean as primary sample
  python tabs_v2_unified_data_analysis.py data.csv --json output.json --primary-sample flexible_clean
        """
    )
    parser.add_argument("csv_path", help="Path to Qualtrics CSV export or CRP-200 dataset")
    parser.add_argument("--json", dest="json_output", metavar="PATH",
                        help="Write unified analysis results to JSON file")
    parser.add_argument("--crp200", action="store_true",
                        help="Use pre-filtered CRP-200 dataset (1-header CSV, no re-filtering)")
    parser.add_argument("--skip-validation", action="store_true",
                        help="Skip EFA/CFA validation (if deps not installed)")
    parser.add_argument("--linderman", action="store_true",
                        help="Run Linderman-grade extensions (DWLS CFAs, bifactor, IRT, regressions) "
                             "for the primary sample; off by default to keep daily runs fast")
    parser.add_argument("--primary-sample", dest="primary_sample", default="conservative_clean",
                        choices=["conservative_clean", "flexible_clean", "prolific_accepted", "v2_finished", "v2_all"],
                        help="Which sample to use for detailed analysis (default: conservative_clean)")
    args = parser.parse_args()

    print("=" * 80)
    print("  TABS V2 UNIFIED DATA ANALYSIS")
    print(f"  Source: {args.csv_path}")
    print(f"  Mode: {'CRP-200' if args.crp200 else 'Live Qualtrics'}")
    print("=" * 80)

    # ── Load data for pandas-based analyses ──
    # df_clean: IRI+duration filtered (used for analysis, advanced)
    # df_full_v2: all V2 rows before quality filtering (used for quality audit)
    df_clean, df_full_v2 = load_data_pandas(args.csv_path, crp200=args.crp200)
    df = df_clean  # primary analysis DataFrame (used for advanced analysis)
    N = len(df)

    # ── Sensitivity section (raw CSV rows for 5-sample cuts) ──
    # In CRP mode, use single_header=True since the public CSV has 1 header row.
    # Sensitivity runs for BOTH live and CRP - CRP pages need sample cuts too.
    idx_raw, data_raw = load_qualtrics_csv(args.csv_path, single_header=args.crp200)
    v2_rows_raw, samples_raw = filter_samples(data_raw, idx_raw, crp200=args.crp200)

    cuts = [
        ("Conservative Clean", samples_raw["conservative_clean"]),
        ("Flexible Clean", samples_raw["flexible_clean"]),
        ("Prolific Accepted", samples_raw["prolific_accepted"]),
        ("All V2 Finished", samples_raw["v2_finished"]),
        ("All V2", samples_raw["v2_all"]),
    ]

    print(f"\n{'='*78}")
    print(f"  SENSITIVITY ANALYSIS SAMPLES")
    print(f"{'='*78}")
    for label, rows in cuts:
        print(f"  {label:25s}: N={len(rows)}")

    sensitivity_data = sensitivity_to_json(cuts, idx_raw)
    print(f"  Sensitivity analysis computed across {len(cuts)} sample definitions")

    # ── Advanced analysis ──
    print(f"\n{'='*78}")
    print(f"  ADVANCED ANALYSIS (N={N})")
    print(f"{'='*78}")
    advanced_data = run_advanced_analysis(df)
    print(f"  PCA: {advanced_data['pca']['n_components_above_1']} components above eigenvalue 1")
    if advanced_data.get('regression') and 'r_squared' in advanced_data['regression']:
        print(f"  Regression: R^2={advanced_data['regression']['r_squared']}")

    # ── Quality audit ──
    # Pass the FULL V2 population (pre-filtering) for accurate quality metrics.
    # Missing data, straightlining, and response quality should reflect ALL
    # respondents, not just those who passed IRI+duration filters.
    print(f"\n{'='*78}")
    print(f"  DATA QUALITY AUDIT (full V2: N={len(df_full_v2)}, clean: N={N})")
    print(f"{'='*78}")
    quality_data = run_quality_audit(df_full_v2, all_rows_raw=v2_rows_raw, idx_raw=idx_raw)
    for scale_name, info in quality_data.get("missing_data", {}).items():
        if isinstance(info, dict) and "missing_pct" in info:
            print(f"  {scale_name} missing: {info['missing_pct']}%")

    # ── Validation (per-sample) ──
    # Build pandas DataFrames for each named sample by matching ResponseIds
    # from the raw-row samples to the scale-encoded pandas DataFrame.
    # This avoids duplicating filter logic between raw-CSV and pandas paths.
    SAMPLE_META = {
        "conservative_clean": {"label": "Conservative Clean",
                               "description": "Prolific APPROVED + all quality checks (IRI, duration >= 540s, reCAPTCHA, straightlining, auth)"},
        "flexible_clean": {"label": "Flexible Clean",
                           "description": "Prolific APPROVED + basic quality (all 3 IRIs + duration >= 480s)"},
        "prolific_accepted": {"label": "Prolific Accepted",
                              "description": "All deduplicated V2 rows with Prolific APPROVED status"},
        "v2_finished": {"label": "All V2 Finished",
                        "description": "Finished + duration >= 120s (extreme speeders excluded)"},
        "v2_all": {"label": "All V2",
                   "description": "All V2 responses including incomplete"},
    }
    # CFA parameter count for the most complex model (Barriers 4-factor: ~46 params)
    CFA_MAX_PARAMS = 46

    rid_col = idx_raw.get('ResponseId')
    # Strip whitespace from pandas ResponseId column to match raw-row .strip()
    if 'ResponseId' in df_full_v2.columns:
        df_full_v2['ResponseId'] = df_full_v2['ResponseId'].astype(str).str.strip()
    sample_dfs = {}
    for key, rows in samples_raw.items():
        if rid_col is not None:
            rids = {r[rid_col].strip() for r in rows}
            sample_dfs[key] = df_full_v2[df_full_v2['ResponseId'].isin(rids)].copy()
        else:
            sample_dfs[key] = df_full_v2.copy()

    # Ordered sample keys (most restrictive first)
    _CRP_SAMPLE_KEY = "crp_200"  # key used for the frozen CRP-200 dataset in all sample dicts
    SAMPLE_ORDER = ["conservative_clean", "flexible_clean", "prolific_accepted",
                    "v2_finished", "v2_all"]
    if args.crp200:
        # CRP mode: single sample (the full frozen dataset)
        SAMPLE_ORDER = [_CRP_SAMPLE_KEY]
        sample_dfs[_CRP_SAMPLE_KEY] = df_full_v2.copy()
        SAMPLE_META[_CRP_SAMPLE_KEY] = {"label": "CRP-200",
                                         "description": "Frozen CRP dataset (N=200, tiered selection)"}

    validation_samples = []
    for sample_key in SAMPLE_ORDER:
        sample_df = sample_dfs[sample_key]
        meta = SAMPLE_META[sample_key]
        n = len(sample_df)
        ratio = round(n / CFA_MAX_PARAMS, 1) if CFA_MAX_PARAMS > 0 else 0.0

        if ratio >= 10:
            adequacy = "good"
            adequacy_note = (f"N:parameter ratio {ratio}:1 meets the recommended 10:1 threshold "
                             f"for stable CFA estimation.")
        elif ratio >= 5:
            adequacy = "adequate"
            adequacy_note = (f"N:parameter ratio {ratio}:1 meets the 5:1 minimum but is below "
                             f"the recommended 10:1 threshold. Results are interpretable but may "
                             f"show instability in fit indices.")
        elif ratio >= 3:
            adequacy = "marginal"
            adequacy_note = (f"N:parameter ratio {ratio}:1 is below the 5:1 minimum. CFA fit "
                             f"indices should be interpreted with caution; convergence issues "
                             f"and Heywood cases are possible.")
        else:
            adequacy = "inadequate"
            adequacy_note = (f"N:parameter ratio {ratio}:1 is well below minimum thresholds. "
                             f"CFA results are unreliable and provided for trend monitoring only "
                             f"as sample size grows.")

        print(f"\n{'='*70}")
        print(f"  VALIDATION: {meta['label']} (N={n}, adequacy={adequacy})")
        print(f"{'='*70}")

        primary_key = _CRP_SAMPLE_KEY if args.crp200 else args.primary_sample
        val_result = run_validation(sample_df, skip=args.skip_validation,
                                    crp200=args.crp200,
                                    primary_sample=(sample_key == primary_key),
                                    linderman=args.linderman)
        # Inject sample identification and adequacy metadata
        val_result = OrderedDict([
            ("key", sample_key),
            ("label", meta["label"]),
            ("description", meta["description"]),
            ("n", n),
            ("n_to_param_ratio", ratio),
            ("adequacy", adequacy),
            ("adequacy_note", adequacy_note),
        ] + list(val_result.items()))

        validation_samples.append(val_result)

    primary = args.primary_sample if not args.crp200 else _CRP_SAMPLE_KEY
    validation_data = OrderedDict([
        ("samples", validation_samples),
        ("primary_sample", primary),
    ])

    # ── Assemble unified output ──
    unified = OrderedDict()
    unified["metadata"] = {
        "n_total": N,
        "dataset": "crp200" if args.crp200 else "live",
        "timestamp": datetime.now().isoformat(),
        "primary_sample": primary,
        "source": args.csv_path,
    }
    unified["sensitivity"] = sensitivity_data
    unified["advanced"] = advanced_data
    unified["quality"] = quality_data
    unified["validation"] = validation_data

    # ── Write JSON ──
    if args.json_output:
        with open(args.json_output, 'w', encoding='utf-8') as f:
            json.dump(unified, f, indent=2, cls=NumpyEncoder)
            f.write("\n")
        print(f"\n  JSON output written to: {args.json_output}")

    print(f"\n{'='*80}")
    print(f"  UNIFIED ANALYSIS COMPLETE")
    print(f"{'='*80}")


if __name__ == '__main__':
    main()
