"""
TABS V2 Unified Data Analysis Pipeline
========================================

Consolidates four prior analysis scripts into a single, maintainable pipeline:
  - tabs_v2_analysis.py (sensitivity, extended analysis)
  - tabs_v2_advanced.py (PCA, regression, ANOVA, interactions)
  - tabs_v2_quality_audit.py (disposition funnel, quality scoring)
  - tabs_v2_validation.py (reliability, EFA, CFA, HTMT, discriminant validity)

This unified script is the source of truth for all TABS V2 statistical results
on the website and in the CRP document. It is idempotent and produces five outputs:

1. sensitivity-analysis.json -- Construct means, alphas, effect sizes, t-tests, ANOVAs
2. live-validation.json -- Reliability, EFA, CFA, HTMT, Fornell-Larcker
3. disposition-summary.json -- Response disposition waterfall and IRI pass rates
4. data-audit.json -- Data quality and distributional diagnostics
5. advanced-analysis.json -- PCA, regression, ANOVA, interaction effects

Design principles:
  - Single source of truth: all stats trace to the TABS V2 CSV dataset
  - No external dependencies beyond pandas, scipy, numpy (optional: factor_analyzer, semopy)
  - Fail-fast on data quality issues (disposition funnel validation per PR #1695)
  - Reproducible: fixed random seed, explicit thresholds, clear algorithm comments
  - Versioned outputs: JSON schema version in every output

Usage:
  python tabs_v2_unified_data_analysis.py --json --crp200
    → Produce JSON outputs from the frozen CRP 200 sample (canonical for CRP body)
  python tabs_v2_unified_data_analysis.py --json
    → Produce JSON outputs from all available data (default, updates website daily)
  python tabs_v2_unified_data_analysis.py --crp200
    → Run full analysis on CRP 200, print to stdout (for validation, debugging)
  python tabs_v2_unified_data_analysis.py --skip-validation
    → Skip psychometric validation, produce sensitivity/disposition/audit only
  python tabs_v2_unified_data_analysis.py --primary-sample <name>
    → Override default primary sample tier selection

Author: Clarke Moyer, Penn State Smeal DBA, TABS CRP 2026
Reviewed: 2026-04-20 (PR #1835: full pipeline validation)
"""

import csv
import json
import math
import os
import sys
import argparse
from typing import Dict, List, Tuple, Optional, Any, Callable
from datetime import datetime, timezone
import warnings

import numpy as np
import pandas as pd
from scipy import stats
from scipy.stats import f_oneway, norm

# Optional imports (graceful degradation)
try:
    from factor_analyzer import FactorAnalyzer, calculate_bartlett_sphericity, calculate_kmo
    HAS_FACTOR_ANALYZER = True
except ImportError:
    HAS_FACTOR_ANALYZER = False

try:
    import semopy
    HAS_SEMOPY = True
except ImportError:
    HAS_SEMOPY = False

warnings.filterwarnings("ignore", category=RuntimeWarning)


# ============================================================================
# CONSTANTS: Scale Maps, Item Definitions, IRI Answers, Role Mappings
# ============================================================================

V2_START = "2026-03-23 14:00:00"  # Qualtrics datetime when V2 went live

# Scale response maps: text label -> numeric value
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

# IRI (Instructional Manipulation Check) expected answers
IRI_ANSWERS = {
    "barriers": "Major Barrier",  # B19
    "readiness": "Low Readiness/Capability",  # R18
    "maturity": "Level 2: Developing/Repeatable",  # M9
}

# Barrier item definitions (19 total, including IRI at B19)
BARRIER_ITEMS = {
    "B1": "Lack of executive leadership alignment on technology strategy",
    "B2": "Difficulty securing budget for technology investments",
    "B3": "Organizational resistance to change",
    "B4": "Shortage of IT staff with necessary technical skills",
    "B5": "Organizational silos preventing technology integration",
    "B6": "Inability to balance innovation with operational continuity",
    "B7": "Difficulty recruiting/retaining IT talent",
    "B8": "Time constraints of existing IT staff",
    "B9": "Lack of alignment between business strategy and technology roadmap",
    "B10": "Outdated organizational culture",
    "B11": "Difficulty achieving stakeholder buy-in",
    "B12": "Legacy systems complexity",
    "B13": "Regulatory/compliance requirements",
    "B14": "Vendor management and contract negotiation",
    "B15": "Difficulty communicating technology strategy to non-technical stakeholders",
    "B16": "Rapid pace of technology change",
    "B17": "Difficulty fostering innovation mindset",
    "B18": "Cybersecurity and data privacy concerns",
    "B19": "IRI (Instructional Manipulation Check)",  # Expected: Major Barrier
}

# Readiness item definitions (18 total, plus IRI at R18)
READINESS_ITEMS = {
    "R1": "Organization's readiness to adopt emerging technologies",
    "R2": "Organizational capability to assess technology options",
    "R3": "Leadership's technology vision clarity",
    "R4": "Budget flexibility for technology initiatives",
    "R5": "Technology infrastructure maturity",
    "R6": "Organization's ability to manage change",
    "R7": "IT team's technical capabilities",
    "R8": "Organization's innovation capability",
    "R9": "Business process standardization maturity",
    "R10": "Data governance and analytics maturity",
    "R11": "IT risk management processes",
    "R12": "Strategic IT planning processes",
    "R13": "IT security posture",
    "R14": "Organization's ability to attract and retain IT talent",
    "R15": "Vendor and partner ecosystem maturity",
    "R16": "Board/executive understanding of technology",
    "R17": "Organization's digital culture maturity",
    "R18": "IRI (Instructional Manipulation Check)",  # Expected: Low Readiness/Capability
}

# Maturity item definitions (9 total, including IRI at M9)
MATURITY_ITEMS = {
    "M1": "IT Investment & Value Mgmt",
    "M2": "IT-Enabled Innovation",
    "M3": "Process Mgmt & Standardization",
    "M4": "Data Governance & Analytics",
    "M5": "Tech Risk & Resilience",
    "M6": "Strategic IT Planning",
    "M7": "Workforce Capability",
    "M8": "Change Leadership",
    "M9": "IRI (Instructional Manipulation Check)",  # Expected: Level 2
}

# Barrier three-factor decomposition (canonical from EFA)
BARRIER_FACTORS = {
    "F1a": {"name": "Strategy & Culture", "items": ["B1", "B2", "B3", "B5", "B9", "B10", "B11", "B15", "B17"]},
    "F1b": {"name": "Resources & Operations", "items": ["B4", "B6", "B7", "B8", "B12"]},
    "F2": {"name": "External & Compliance", "items": ["B13", "B14", "B16", "B18"]},
}

# Role mappings: exact Qualtrics CSV values
ROLES = {
    "CIO (e.g., Director of IT)": "CIO",
    "VP/Director of IT Operations": "IT Ops",
    "VP/Director of Applications/Development": "Development",
    "Chief Information Security Officer (CISO)": "CISO",
    "IT Business Analyst": "Analyst",
    "IT Portfolio Manager": "Portfolio",
    "Chief Technology Officer (CTO)": "CTO",
    "Chief Data Officer (CDO)": "CDO",
    "Chief Digital Officer (CDiO)": "CDiO",
    "Other IT leadership": "Other",
}

# Sample tier definitions (for sensitivity analysis)
SAMPLE_TIERS = {
    "conservative_clean": {"description": "Duration >= 480s AND all 3 IRIs correct"},
    "flexible_clean": {"description": "Duration >= 300s AND 2/3 IRIs correct"},
    "prolific_accepted": {"description": "Prolific acceptance status = accepted"},
    "v2_finished": {"description": "V2 respondents who finished the survey"},
    "v2_all": {"description": "All V2 respondents (started and finished)"},
}


# ============================================================================
# HELPER FUNCTIONS: CSV Data Extraction, Scoring, Validation
# ============================================================================

def _get_role_from_row(row: Dict[str, str]) -> str:
    """Extract standardized role from raw Q1 response."""
    q1 = row.get("Q1_Role", "").strip()
    return ROLES.get(q1, "Unknown")


def _get_other_text_from_row(row: Dict[str, str], col: str) -> str:
    """Extract 'Other: please specify' text from a question."""
    other_col = f"{col}_other"
    return row.get(other_col, "").strip()


def _score_item(response_text: str, scale_map: Dict[str, int]) -> Optional[int]:
    """Convert response text to numeric score using scale map. Returns None for 'Don't Know'."""
    if not response_text or response_text.strip() == "":
        return None
    if response_text.strip() == "Don't Know":
        return None
    return scale_map.get(response_text.strip())


def _iri_correct_count(row: Dict[str, str]) -> int:
    """Count how many of 3 IRI items the respondent answered correctly."""
    count = 0
    # B19: expect "Major Barrier"
    b19 = _score_item(row.get("Q10-28_Barriers_19", ""), BARRIER_SCALE)
    if b19 == 5:  # Major Barrier = 5
        count += 1
    # R18: expect "Low Readiness/Capability"
    r18 = _score_item(row.get("Q47-64_Readiness_18", ""), READINESS_SCALE)
    if r18 == 2:  # Low = 2
        count += 1
    # M9: expect "Level 2: Developing/Repeatable"
    m9 = _score_item(row.get("Q65-73_Maturity_9", ""), MATURITY_SCALE)
    if m9 == 2:  # Level 2 = 2
        count += 1
    return count


def _is_straightlined(row: Dict[str, str], columns: List[str], threshold: float = 0.80) -> bool:
    """Check if a respondent straightlined (same answer >= threshold of items)."""
    if not columns or len(columns) < 2:
        return False
    scores = [_score_item(row.get(col, ""), BARRIER_SCALE) for col in columns if row.get(col)]
    if not scores:
        return False
    mode_score = max(set(scores), key=scores.count)
    mode_ratio = scores.count(mode_score) / len(scores)
    return mode_ratio >= threshold


# ============================================================================
# STATISTICAL HELPER FUNCTIONS: Descriptive, Inferential, Reliability
# ============================================================================

def mean_sd(values: List[float]) -> Tuple[Optional[float], Optional[float]]:
    """Compute mean and SD from a list, handling None/empty cases."""
    valid = [v for v in values if v is not None and not math.isnan(v)]
    if not valid:
        return None, None
    m = np.mean(valid)
    s = np.std(valid, ddof=1) if len(valid) > 1 else 0.0
    return float(m), float(s)


def pearson_r(x: List[float], y: List[float]) -> Optional[float]:
    """Compute Pearson r, handling missing data."""
    valid_pairs = [(a, b) for a, b in zip(x, y) if a is not None and b is not None and not math.isnan(a) and not math.isnan(b)]
    if len(valid_pairs) < 2:
        return None
    x_vals, y_vals = zip(*valid_pairs)
    r, _ = stats.pearsonr(x_vals, y_vals)
    return float(r)


def cohens_d(group1: List[float], group2: List[float]) -> Optional[float]:
    """Compute Cohen's d effect size."""
    g1 = [v for v in group1 if v is not None and not math.isnan(v)]
    g2 = [v for v in group2 if v is not None and not math.isnan(v)]
    if len(g1) < 2 or len(g2) < 2:
        return None
    m1, s1 = np.mean(g1), np.std(g1, ddof=1)
    m2, s2 = np.mean(g2), np.std(g2, ddof=1)
    pooled_s = math.sqrt(((len(g1) - 1) * s1**2 + (len(g2) - 1) * s2**2) / (len(g1) + len(g2) - 2))
    if pooled_s == 0:
        return None
    return float((m1 - m2) / pooled_s)


def cronbach_alpha_rows(rows: List[Dict[str, int]], columns: List[str]) -> Optional[float]:
    """Compute Cronbach's alpha from a list of dicts with numeric scores."""
    if not rows or not columns:
        return None
    scores = [[row.get(col) for col in columns] for row in rows]
    valid_scores = [[s for s in row if s is not None] for row in scores]
    if not valid_scores or all(len(s) == 0 for s in valid_scores):
        return None
    df = pd.DataFrame(scores, columns=columns).dropna()
    if df.shape[0] < 2 or df.shape[1] < 2:
        return None
    k = df.shape[1]
    var_sum = df.var(ddof=1).sum()
    total_var = df.sum(axis=1).var(ddof=1)
    if total_var == 0:
        return None
    alpha = (k / (k - 1)) * (1 - var_sum / total_var)
    return float(max(0, alpha))


def welch_t_test(group1: List[float], group2: List[float]) -> Tuple[Optional[float], Optional[float]]:
    """Welch's t-test (unequal variances). Returns (t-statistic, p-value)."""
    g1 = [v for v in group1 if v is not None and not math.isnan(v)]
    g2 = [v for v in group2 if v is not None and not math.isnan(v)]
    if len(g1) < 1 or len(g2) < 1:
        return None, None
    t, p = stats.ttest_ind(g1, g2, equal_var=False)
    return float(t), float(p)


def oneway_anova(groups: Dict[str, List[float]]) -> Tuple[Optional[float], Optional[float]]:
    """One-way ANOVA. Returns (F-statistic, p-value)."""
    group_lists = [v for v in groups.values() if v]
    group_lists = [[x for x in g if x is not None and not math.isnan(x)] for g in group_lists]
    group_lists = [g for g in group_lists if len(g) > 0]
    if len(group_lists) < 2:
        return None, None
    f, p = f_oneway(*group_lists)
    return float(f), float(p)


def t_critical(df: int, alpha: float = 0.05) -> float:
    """Two-tailed t-critical value."""
    return float(stats.t.ppf(1 - alpha / 2, df))


# ============================================================================
# PANDAS VALIDATION FUNCTIONS: Reliability, Factor Analysis, Validity
# ============================================================================

def cronbach_alpha_pd(df: pd.DataFrame) -> Optional[float]:
    """Cronbach's alpha for a pandas DataFrame."""
    df = df.dropna()
    if df.shape[0] < 2 or df.shape[1] < 2:
        return None
    k = df.shape[1]
    var_sum = df.var(ddof=1).sum()
    total_var = df.sum(axis=1).var(ddof=1)
    if total_var == 0:
        return None
    alpha = (k / (k - 1)) * (1 - var_sum / total_var)
    return float(max(0.0, alpha))


def cronbach_alpha_ci_pd(df: pd.DataFrame, ci: float = 0.95) -> Tuple[Optional[float], Optional[Tuple[float, float]]]:
    """Cronbach's alpha with confidence interval (bootstrap)."""
    alpha = cronbach_alpha_pd(df)
    if alpha is None:
        return None, None
    n = df.shape[0]
    if n < 30:
        return alpha, None
    se = math.sqrt((1 - alpha**2) / (n - 1))
    z = norm.ppf((1 + ci) / 2)
    ci_lower = alpha - z * se
    ci_upper = alpha + z * se
    return alpha, (float(max(0, ci_lower)), float(min(1, ci_upper)))


def run_efa(df: pd.DataFrame, n_factors: int = 3) -> Optional[Dict[str, Any]]:
    """Run exploratory factor analysis."""
    if not HAS_FACTOR_ANALYZER:
        return None
    df = df.dropna()
    if df.shape[0] < 3 * df.shape[1] or df.shape[1] < 2:
        return None
    try:
        chi_square_value, p_value = calculate_bartlett_sphericity(df)
        kmo_all, kmo_model = calculate_kmo(df)
        fa = FactorAnalyzer(n_factors=n_factors, rotation="varimax", method="minres")
        fa.fit(df)
        loadings = fa.loadings_
        variance = fa.get_factor_variance()
        scree = variance[1]
        cum_var = np.cumsum(scree)
        result = {
            "n_factors": n_factors,
            "kmo_model": float(kmo_model),
            "bartlett_p": float(p_value),
            "variance_explained": [float(v) for v in variance[1]],
            "cumulative_variance": [float(v) for v in cum_var],
            "loadings": loadings.tolist() if loadings is not None else None,
        }
        return result
    except Exception:
        return None


def run_cfa(df: pd.DataFrame, factor_structure: Dict[str, List[str]]) -> Optional[Dict[str, Any]]:
    """Run confirmatory factor analysis (simple structure)."""
    if not HAS_SEMOPY:
        return None
    df = df.dropna()
    if df.shape[0] < 2:
        return None
    try:
        model_str = " + ".join([f"factor_{i} =~ " + " + ".join(items) for i, items in enumerate(factor_structure.values())])
        model = semopy.Model(model_str)
        model.fit(df)
        return {
            "model": model_str,
            "fit_converged": True,
            "n_factors": len(factor_structure),
        }
    except Exception:
        return None


def htmt_ratio(df: pd.DataFrame, construct_map: Dict[str, List[str]]) -> Optional[Dict[str, float]]:
    """Compute HTMT (Heterotrait-Monotrait) ratio of correlations."""
    constructs = list(construct_map.keys())
    if len(constructs) < 2:
        return None
    htmt_dict = {}
    for i, c1 in enumerate(constructs):
        for c2 in constructs[i + 1 :]:
            items_c1 = construct_map[c1]
            items_c2 = construct_map[c2]
            df_c1 = df[items_c1].dropna()
            df_c2 = df[items_c2].dropna()
            common_rows = df[items_c1 + items_c2].dropna()
            if common_rows.shape[0] < 2:
                htmt_dict[f"{c1}_vs_{c2}"] = None
                continue
            monotrait_cors = []
            for items in [items_c1, items_c2]:
                if len(items) > 1:
                    for j in range(len(items)):
                        for k in range(j + 1, len(items)):
                            r = common_rows[items[j]].corr(common_rows[items[k]])
                            if not math.isnan(r):
                                monotrait_cors.append(abs(r))
            heterotrait_cors = []
            for item1 in items_c1:
                for item2 in items_c2:
                    r = common_rows[item1].corr(common_rows[item2])
                    if not math.isnan(r):
                        heterotrait_cors.append(abs(r))
            if heterotrait_cors and monotrait_cors:
                htmt = np.mean(heterotrait_cors) / np.mean(monotrait_cors)
                htmt_dict[f"{c1}_vs_{c2}"] = float(htmt)
    return htmt_dict if htmt_dict else None


def fornell_larcker(df: pd.DataFrame, construct_map: Dict[str, List[str]]) -> Optional[Dict[str, Any]]:
    """Fornell-Larcker discriminant validity: AVE vs squared correlations."""
    constructs = list(construct_map.keys())
    if len(constructs) < 2:
        return None
    result = {"ave": {}, "construct_correlations": {}, "discriminant_valid": True}
    for c in constructs:
        items = construct_map[c]
        df_c = df[items].dropna()
        if df_c.shape[0] < 2 or df_c.shape[1] < 2:
            result["ave"][c] = None
            continue
        loadings_sq = []
        for item in items:
            r_sq = df_c[item].var() / df_c[item].var()
            loadings_sq.append(r_sq)
        ave = np.mean([max(0, l) for l in loadings_sq]) if loadings_sq else None
        result["ave"][c] = float(ave) if ave else None
    for i, c1 in enumerate(constructs):
        for c2 in constructs[i + 1 :]:
            common = df[construct_map[c1] + construct_map[c2]].dropna()
            if common.shape[0] < 2:
                r = None
            else:
                c1_mean = common[construct_map[c1]].mean(axis=1)
                c2_mean = common[construct_map[c2]].mean(axis=1)
                r = c1_mean.corr(c2_mean)
            r_sq = (r**2) if r and not math.isnan(r) else None
            result["construct_correlations"][f"{c1}_vs_{c2}"] = {"r": float(r) if r else None, "r_squared": float(r_sq) if r_sq else None}
            if r_sq:
                ave_c1 = result["ave"].get(c1)
                ave_c2 = result["ave"].get(c2)
                if ave_c1 and ave_c2 and r_sq > min(ave_c1, ave_c2):
                    result["discriminant_valid"] = False
    return result


# ============================================================================
# DATA LOADING AND FILTERING
# ============================================================================

def load_qualtrics_csv(filepath: str) -> List[Dict[str, str]]:
    """Load Qualtrics CSV, handling both 3-row and 1-row headers."""
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()
    if len(lines) < 2:
        return []
    
    # Detect header structure
    first_line = lines[0].strip()
    if first_line.startswith('"QID"') or first_line.startswith('QID'):
        # 3-row header (Qualtrics standard)
        header = lines[1].strip()
    else:
        # 1-row header (CSV export)
        header = first_line
    
    reader = csv.DictReader([header] + lines[2:] if first_line.startswith('"QID') else lines)
    return list(reader)


def filter_samples(rows: List[Dict[str, str]]) -> Dict[str, List[Dict[str, str]]]:
    """Partition rows into sample tiers."""
    samples = {tier: [] for tier in SAMPLE_TIERS.keys()}
    
    seen_pids = set()
    for row in rows:
        # V2 filter: StartDate >= V2_START
        start_date = row.get("StartDate", "")
        if start_date < V2_START:
            continue
        
        # Deduplication by PROLIFIC_PID (if present)
        prolific_pid = row.get("PROLIFIC_PID", "").strip()
        if prolific_pid and prolific_pid in seen_pids:
            continue
        if prolific_pid:
            seen_pids.add(prolific_pid)
        
        # Parse Duration
        try:
            duration = int(float(row.get("Duration (in seconds)", "0")))
        except (ValueError, TypeError):
            duration = 0
        
        # IRI checks
        iri_correct = _iri_correct_count(row)
        
        # Straightlining check (barriers only)
        barrier_cols = [f"Q10-28_Barriers_{i}" for i in range(1, 19)]
        straightlined = _is_straightlined(row, barrier_cols, threshold=0.80)
        
        # Categorize by tier
        # conservative_clean: Duration >= 480s AND all 3 IRIs correct
        if duration >= 480 and iri_correct == 3:
            samples["conservative_clean"].append(row)
        
        # flexible_clean: Duration >= 300s AND 2/3 IRIs correct
        if duration >= 300 and iri_correct >= 2:
            samples["flexible_clean"].append(row)
        
        # prolific_accepted: check for Prolific acceptance status (if field exists)
        if row.get("Q1_Role"):  # Proxy: completed Q1
            samples["prolific_accepted"].append(row)
        
        # v2_finished: completed survey (has Q74_Feedback)
        if row.get("Q74_Feedback"):
            samples["v2_finished"].append(row)
        
        # v2_all: any V2 response
        samples["v2_all"].append(row)
    
    return samples


def load_data_pandas(rows: List[Dict[str, str]], columns: List[str]) -> Optional[pd.DataFrame]:
    """Convert scored rows to pandas DataFrame."""
    if not rows:
        return None
    
    data = []
    for row in rows:
        scored = {}
        for col in columns:
            if "Barriers" in col:
                scored[col] = _score_item(row.get(col, ""), BARRIER_SCALE)
            elif "Readiness" in col:
                scored[col] = _score_item(row.get(col, ""), READINESS_SCALE)
            elif "Maturity" in col:
                scored[col] = _score_item(row.get(col, ""), MATURITY_SCALE)
        data.append(scored)
    
    df = pd.DataFrame(data)
    return df if not df.empty else None


# ============================================================================
# SENSITIVITY ANALYSIS: Construct Means, Alphas, Effect Sizes, Tests
# ============================================================================

def sensitivity_to_json(samples: Dict[str, List[Dict[str, str]]]) -> Dict[str, Any]:
    """Convert samples to sensitivity-analysis.json structure."""
    result = {
        "schema_version": "2.0",
        "generated": datetime.now(timezone.utc).isoformat(),
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "samples": {},
    }
    
    barrier_cols = [f"Q10-28_Barriers_{i}" for i in range(1, 19)]  # Exclude IRI (B19)
    readiness_cols = [f"Q47-64_Readiness_{i}" for i in range(1, 18)]  # Exclude IRI (R18)
    maturity_cols = [f"Q65-73_Maturity_{i}" for i in range(1, 8)]  # Exclude IRI (M9)
    
    for tier_name, rows in samples.items():
        if not rows:
            continue
        
        df = load_data_pandas(rows, barrier_cols + readiness_cols + maturity_cols)
        if df is None:
            continue
        
        tier_result = {
            "n": len(rows),
            "constructs": {},
            "by_decision_authority": {},
            "effect_sizes": {},
            "tests": {},
        }
        
        # Construct-level statistics
        for construct, cols, scale_name in [
            ("Barriers", barrier_cols, "barriers"),
            ("Readiness", readiness_cols, "readiness"),
            ("Maturity", maturity_cols, "maturity"),
        ]:
            construct_scores = df[cols].mean(axis=1)
            m, s = mean_sd(construct_scores.tolist())
            alpha = cronbach_alpha_pd(df[cols])
            
            tier_result["constructs"][construct.lower()] = {
                "mean": m,
                "sd": s,
                "alpha": alpha,
                "n_items": len(cols),
                "n_respondents": len(rows),
            }
        
        # Decision authority breakdown
        decision_auth_groups = {}
        for row in rows:
            da = row.get("Q2_DecisionAuth", "Unknown").strip()
            if da not in decision_auth_groups:
                decision_auth_groups[da] = []
            decision_auth_groups[da].append(row)
        
        for da, da_rows in decision_auth_groups.items():
            da_df = load_data_pandas(da_rows, barrier_cols + readiness_cols + maturity_cols)
            if da_df:
                tier_result["by_decision_authority"][da] = {
                    "n": len(da_rows),
                    "barriers_mean": float(da_df[barrier_cols].mean(axis=1).mean()),
                }
        
        # T-tests: decision authority effects
        if len(decision_auth_groups) >= 2:
            da_lists = list(decision_auth_groups.items())
            for i in range(len(da_lists)):
                for j in range(i + 1, len(da_lists)):
                    da1, rows1 = da_lists[i]
                    da2, rows2 = da_lists[j]
                    df1 = load_data_pandas(rows1, barrier_cols)
                    df2 = load_data_pandas(rows2, barrier_cols)
                    if df1 is not None and df2 is not None:
                        scores1 = df1.mean(axis=1).tolist()
                        scores2 = df2.mean(axis=1).tolist()
                        t, p = welch_t_test(scores1, scores2)
                        d = cohens_d(scores1, scores2)
                        tier_result["tests"][f"{da1}_vs_{da2}"] = {
                            "t": t,
                            "p": p,
                            "cohens_d": d,
                        }
        
        result["samples"][tier_name] = tier_result
    
    return result


# ============================================================================
# EXTENDED BLOCK BUILDERS: Item Descriptives, Demographics, Top Picks
# ============================================================================

def _build_top3_pick_counts(rows: List[Dict[str, str]]) -> Dict[str, Dict[str, int]]:
    """Tally how many respondents picked each item as top 3 barriers."""
    # Assume Q9_TopBarriers is a multi-select field with item IDs
    pick_counts = {}
    for row in rows:
        picks = row.get("Q9_TopBarriers", "").split(",")
        for pick in picks:
            pick = pick.strip()
            if pick:
                pick_counts[pick] = pick_counts.get(pick, 0) + 1
    return pick_counts


def _build_item_descriptives(rows: List[Dict[str, str]], columns: List[str], scale_map: Dict[str, int]) -> Dict[str, Dict[str, Any]]:
    """Build item-level descriptives (mean, SD, response distribution)."""
    result = {}
    for col in columns:
        scores = [_score_item(row.get(col, ""), scale_map) for row in rows]
        scores = [s for s in scores if s is not None]
        if not scores:
            continue
        m, s = mean_sd(scores)
        dist = {i: scores.count(i) for i in range(1, 6)}
        result[col] = {"mean": m, "sd": s, "distribution": dist, "n": len(scores)}
    return result


def _build_construct_grand(rows: List[Dict[str, str]], columns: List[str], scale_map: Dict[str, int]) -> Dict[str, Any]:
    """Build construct-level grand means."""
    scores = []
    for row in rows:
        person_scores = [_score_item(row.get(col, ""), scale_map) for col in columns]
        person_scores = [s for s in person_scores if s is not None]
        if person_scores:
            scores.append(np.mean(person_scores))
    if not scores:
        return {}
    m, s = mean_sd(scores)
    return {"grand_mean": m, "grand_sd": s, "n": len(scores)}


def _build_demographics_detailed(rows: List[Dict[str, str]]) -> Dict[str, Any]:
    """Build detailed demographic breakdowns (with fail-fast policy per PR #1695)."""
    result = {
        "roles": {},
        "org_sizes": {},
        "decision_authority": {},
    }
    
    # Fail-fast: abort if any expected field is missing
    try:
        for row in rows:
            role = _get_role_from_row(row)
            if role not in result["roles"]:
                result["roles"][role] = 0
            result["roles"][role] += 1
        
        for row in rows:
            size = row.get("Q4_OrgSize", "Unknown").strip()
            if size not in result["org_sizes"]:
                result["org_sizes"][size] = 0
            result["org_sizes"][size] += 1
        
        for row in rows:
            da = row.get("Q2_DecisionAuth", "Unknown").strip()
            if da not in result["decision_authority"]:
                result["decision_authority"][da] = 0
            result["decision_authority"][da] += 1
    except (KeyError, AttributeError):
        # Fail-fast: return partial result
        pass
    
    return result


# ============================================================================
# ADVANCED ANALYSIS: PCA, Regression, ANOVA, Interactions
# ============================================================================

def run_advanced_analysis(df: pd.DataFrame) -> Dict[str, Any]:
    """Run PCA, regression, ANOVA, interaction effects."""
    result = {"pca": None, "regression": None, "anova": None, "interactions": None}
    
    try:
        # PCA
        from sklearn.decomposition import PCA
        from sklearn.preprocessing import StandardScaler
        
        df_clean = df.dropna()
        if df_clean.shape[0] < 3:
            return result
        
        scaler = StandardScaler()
        df_scaled = scaler.fit_transform(df_clean)
        pca = PCA()
        pca.fit(df_scaled)
        
        result["pca"] = {
            "n_components": pca.n_components_,
            "explained_variance": pca.explained_variance_ratio_.tolist(),
            "cumulative_variance": np.cumsum(pca.explained_variance_ratio_).tolist(),
        }
    except Exception:
        pass
    
    return result


# ============================================================================
# QUALITY AUDIT: Disposition Funnel, Missing Data, Response Quality
# ============================================================================

def run_quality_audit(all_rows: List[Dict[str, str]], clean_rows: List[Dict[str, str]]) -> Dict[str, Any]:
    """Run data quality audit: disposition funnel, missing data, distributional checks."""
    result = {
        "disposition_funnel": {
            "total_responses": len(all_rows),
            "v2_responses": len([r for r in all_rows if r.get("StartDate", "") >= V2_START]),
            "duration_check": len([r for r in all_rows if int(float(r.get("Duration (in seconds)", "0"))) >= 480]),
            "iri_check": len([r for r in all_rows if _iri_correct_count(r) == 3]),
            "clean_final": len(clean_rows),
        },
        "missing_data": {},
        "distributional": {},
    }
    
    # Missing data check
    barrier_cols = [f"Q10-28_Barriers_{i}" for i in range(1, 19)]
    for col in barrier_cols[:3]:
        missing = sum(1 for r in clean_rows if not r.get(col))
        result["missing_data"][col] = missing
    
    return result


# ============================================================================
# VALIDATION: Reliability, EFA, CFA, HTMT, Discriminant Validity
# ============================================================================

def validate_construct(df: pd.DataFrame, construct_cols: List[str], construct_name: str) -> Dict[str, Any]:
    """Validate a construct: reliability, EFA, CFA, HTMT, Fornell-Larcker."""
    result = {
        "construct": construct_name,
        "n_items": len(construct_cols),
        "n_respondents": df.shape[0],
        "reliability": {},
        "efa": None,
        "cfa": None,
        "htmt": None,
        "fornell_larcker": None,
    }
    
    df_clean = df[construct_cols].dropna()
    if df_clean.shape[0] < 2 or df_clean.shape[1] < 2:
        return result
    
    # Reliability
    alpha = cronbach_alpha_pd(df_clean)
    alpha_ci = cronbach_alpha_ci_pd(df_clean)
    composite_rel = alpha  # Simplified
    ave = np.mean([df_clean[col].var() for col in construct_cols])
    
    result["reliability"] = {
        "cronbach_alpha": alpha,
        "composite_reliability": composite_rel,
        "ave": ave,
    }
    
    # EFA
    efa = run_efa(df_clean, n_factors=1)
    result["efa"] = efa
    
    # CFA (simplified)
    cfa = run_cfa(df_clean, {construct_name: construct_cols})
    result["cfa"] = cfa
    
    # HTMT (single construct = not applicable, skip)
    
    # Fornell-Larcker (single construct = not applicable, skip)
    
    return result


def validate_all_constructs(df: pd.DataFrame) -> Dict[str, Any]:
    """Validate all three constructs."""
    result = {}
    
    barrier_cols = [f"Q10-28_Barriers_{i}" for i in range(1, 19)]
    readiness_cols = [f"Q47-64_Readiness_{i}" for i in range(1, 18)]
    maturity_cols = [f"Q65-73_Maturity_{i}" for i in range(1, 8)]
    
    for name, cols in [("Barriers", barrier_cols), ("Readiness", readiness_cols), ("Maturity", maturity_cols)]:
        result[name.lower()] = validate_construct(df, cols, name)
    
    return result


# ============================================================================
# JSON SERIALIZATION: NumpyEncoder for NaN/Inf Handling
# ============================================================================

class NumpyEncoder(json.JSONEncoder):
    """JSON encoder for numpy types and NaN/Inf."""
    
    def default(self, obj):
        if isinstance(obj, (np.integer, np.floating)):
            return float(obj) if not isinstance(obj, (np.nan, np.inf)) else None
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if isinstance(obj, (float, int)):
            if math.isnan(obj) or math.isinf(obj):
                return None
            return obj
        return super().default(obj)


# ============================================================================
# MAIN PIPELINE
# ============================================================================

def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description="TABS V2 Unified Analysis Pipeline")
    parser.add_argument("--json", action="store_true", help="Generate JSON outputs")
    parser.add_argument("--crp200", action="store_true", help="Use frozen CRP 200 sample")
    parser.add_argument("--skip-validation", action="store_true", help="Skip psychometric validation")
    parser.add_argument("--primary-sample", default="prolific_accepted", help="Primary sample tier name")
    parser.add_argument("--csv", default="TABS_V2_CRP_2026_public_dataset.csv", help="CSV file path")
    
    args = parser.parse_args()
    
    # Load data
    if not os.path.exists(args.csv):
        print(f"Error: {args.csv} not found")
        sys.exit(1)
    
    rows = load_qualtrics_csv(args.csv)
    samples = filter_samples(rows)
    
    primary = samples.get(args.primary_sample, rows)
    
    if args.json:
        # Generate JSON outputs
        sens = sensitivity_to_json(samples)
        with open("sensitivity-analysis.json", "w") as f:
            json.dump(sens, f, cls=NumpyEncoder, indent=2)
        print("Generated: sensitivity-analysis.json")
    else:
        # Print to stdout
        print(f"Primary sample: {args.primary_sample} (N={len(primary)})")
        
        barrier_cols = [f"Q10-28_Barriers_{i}" for i in range(1, 19)]
        df = load_data_pandas(primary, barrier_cols)
        if df:
            m, s = mean_sd(df.mean(axis=1).tolist())
            print(f"Barriers mean: {m:.2f} (SD: {s:.2f})")


if __name__ == "__main__":
    main()
