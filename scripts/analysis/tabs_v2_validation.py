#!/usr/bin/env python3
"""
TABS V2 Instrument Validation Pipeline
=======================================

Comprehensive psychometric validation for the Technology Adoption Barriers
Survey V2, producing defense-ready statistics at N=200.

Analyses:
  1. Exploratory Factor Analysis (EFA) with oblique rotation (promax)
  2. Confirmatory Factor Analysis (CFA) via semopy
  3. Composite Reliability (CR) and McDonald's Omega
  4. Corrected Item-Total Correlations (r > 0.30 threshold)
  5. AVE from actual factor loadings (not item-total approximation)
  6. HTMT with bootstrap confidence intervals
  7. Inter-item correlation matrix diagnostics
  8. Normality testing (Shapiro-Wilk, skewness, kurtosis)
  9. Fornell-Larcker criterion with squared correlations
 10. Split-half reliability (Spearman-Brown)
 11. KMO and Bartlett's test of sphericity
 12. Parallel analysis for factor retention
 13. CFA model comparison (chi-sq diff, delta-AIC, delta-BIC) - added 2026-05-01
 14. Item-level Hair convergent / discriminant flags - added 2026-05-01
 15. Subgroup HTMT + Fornell-Larcker on F1a/F1b/F2 - added 2026-05-01
 16. Alpha-if-deleted summary across constructs - added 2026-05-01

Additional advanced psychometric analyses (items 17-23 run unconditionally;
item 24 requires --crp200 due to computational cost):
 17. DWLS ordinal CFA on each construct and multi-factor barriers models
 18. Bifactor R+M with omega-h, ECV, and PUC
 19. Second-order barriers CFA
 20. Mardia multivariate normality + Mahalanobis outlier detection
 21. 50/50 split-sample cross-validation (Tucker congruence)
 22. IRT graded response model (requires girth; degrades gracefully if missing)
 23. Per-factor regressions (sub-factor decomposition vs full-scale aggregate)
 24. Per-subgroup standalone validation (--crp200 only; parallel analysis + CFA per subgroup)

Usage:
    python tabs_v2_validation.py <qualtrics_csv_path> [--json output.json] [--crp200]

Author: Clarke Moyer, Penn State Smeal DBA
"""

import json
import math
import sys
import warnings
from collections import OrderedDict

import numpy as np
import pandas as pd
from scipy import stats
from scipy.stats import shapiro, spearmanr

warnings.filterwarnings('ignore', category=FutureWarning)
warnings.filterwarnings('ignore', category=RuntimeWarning)

# Optional imports - degrade gracefully
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
# CONSTANTS (duplicated from tabs_v2_analysis.py for standalone use; keep in sync)
# ============================================================================

V2_START = "2026-03-23 14:00:00"
PROLIFIC_TEST_ID = 'R_1QK12IJpHjC3wd6'
MIN_DURATION_CLEAN = 480

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

BARRIER_COLS = [f"Q10-28_Barriers_{i}" for i in range(1, 19)]
BARRIER_IRI = "Q10-28_Barriers_19"
READINESS_COLS = [f"Q47-64_Readiness_{i}" for i in range(1, 18)]
READINESS_IRI = "Q47-64_Readiness_18"
MATURITY_COLS = [f"Q65-73_Maturity_{i}" for i in range(1, 9)]
MATURITY_IRI = "Q65-73_Maturity_9"

IRI_BARRIER_ANSWER = "Major Barrier"
IRI_READINESS_ANSWER = "Low Readiness/Capability"
IRI_MATURITY_ANSWER = "Level 2: Developing/Repeatable"

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

# Theoretical sub-construct groupings for barriers (EFA seed)
BARRIER_SUBCONSTRUCTS = {
    'Organizational & Cultural': [0, 2],      # B1, B3
    'Strategic & Operational': [1, 6, 8, 9, 10, 11],  # B2, B7, B9-B12
    'Resource & Capability': [3, 4, 5, 7],    # B4-B6, B8
    'Risk, Trust & External': [12, 13, 14, 15, 16, 17]  # B13-B18
}

READINESS_SUBCONSTRUCTS = {
    'Strategic Leadership': [0, 1, 2],        # R1-R3
    'Culture & Change': [3, 4, 7],            # R4, R5, R8
    'Workforce & Skills': [5, 6],             # R6, R7
    'Infrastructure': [8, 9, 10],             # R9-R11
    'Data & Analytics': [11, 12, 13],         # R12-R14
    'Process & Operational': [14, 15],        # R15-R16
    'Financial': [16]                         # R17
}


# ============================================================================
# DATA LOADING
# ============================================================================

def load_and_filter(csv_path):
    """Load Qualtrics CSV, apply V2 filter + clean criteria, return numeric df."""
    df = pd.read_csv(csv_path, encoding='utf-8-sig', skiprows=[1, 2])
    df['Duration (in seconds)'] = pd.to_numeric(df['Duration (in seconds)'], errors='coerce')
    df['StartDate'] = pd.to_datetime(df['StartDate'], errors='coerce')

    # V2 filter
    v2_mask = (df['StartDate'] >= V2_START) | (df['ResponseId'] == PROLIFIC_TEST_ID)
    df = df[v2_mask].copy()

    # Encode scales
    for col in BARRIER_COLS + [BARRIER_IRI]:
        df[col] = df[col].map(BARRIER_SCALE)
    for col in READINESS_COLS + [READINESS_IRI]:
        df[col] = df[col].apply(lambda x: np.nan if str(x).strip() == "Don't Know"
                                else READINESS_SCALE.get(str(x).strip(), np.nan) if pd.notna(x) else np.nan)
    for col in MATURITY_COLS + [MATURITY_IRI]:
        df[col] = df[col].apply(lambda x: np.nan if str(x).strip() == "Don't Know"
                                else MATURITY_SCALE.get(str(x).strip(), np.nan) if pd.notna(x) else np.nan)

    # IRI correctness
    df['iri_barrier_ok'] = (df[BARRIER_IRI] == BARRIER_SCALE[IRI_BARRIER_ANSWER])
    df['iri_readiness_ok'] = (df[READINESS_IRI] == READINESS_SCALE[IRI_READINESS_ANSWER])
    df['iri_maturity_ok'] = (df[MATURITY_IRI] == MATURITY_SCALE[IRI_MATURITY_ANSWER])
    df['iri_all_ok'] = df['iri_barrier_ok'] & df['iri_readiness_ok'] & df['iri_maturity_ok']

    # Conservative clean filter
    clean = df[(df['Duration (in seconds)'] >= MIN_DURATION_CLEAN) & df['iri_all_ok']].copy()

    print(f"V2 total: {len(df)} | Clean (>={MIN_DURATION_CLEAN}s + 3 IRIs): {len(clean)}")
    return clean


# ============================================================================
# 1. CRONBACH'S ALPHA WITH FELDT CI
# ============================================================================

def cronbach_alpha(data):
    """Cronbach's alpha with listwise deletion."""
    d = data.dropna()
    if len(d) < 2 or d.shape[1] < 2:
        return np.nan
    k = d.shape[1]
    var_sum = d.var(ddof=1).sum()
    total_var = d.sum(axis=1).var(ddof=1)
    if total_var == 0:
        return np.nan
    return (k / (k - 1)) * (1 - var_sum / total_var)


def cronbach_alpha_ci(data):
    """95% CI via Feldt (1965) method."""
    alpha = cronbach_alpha(data)
    if np.isnan(alpha):
        return alpha, (np.nan, np.nan)
    d = data.dropna()
    n, k = d.shape
    f_upper = stats.f.ppf(0.975, n - 1, (n - 1) * (k - 1))
    lower = 1 - (1 - alpha) * f_upper
    f_lower = stats.f.ppf(0.025, n - 1, (n - 1) * (k - 1))
    upper = 1 - (1 - alpha) * f_lower
    return alpha, (max(0.0, lower), min(1.0, upper))


# ============================================================================
# 2. CORRECTED ITEM-TOTAL CORRELATIONS
# ============================================================================

def corrected_item_total(data):
    """Corrected item-total correlations: each item correlated with sum of
    remaining items (item excluded from total). Threshold: r > 0.30."""
    d = data.dropna()
    results = {}
    for col in d.columns:
        rest = d.drop(columns=[col]).sum(axis=1)
        r = d[col].corr(rest)
        results[col] = round(r, 4)
    return results


# ============================================================================
# 3. COMPOSITE RELIABILITY (CR) AND McDONALD'S OMEGA
# ============================================================================

def composite_reliability(loadings):
    """CR = (sum of loadings)^2 / ((sum of loadings)^2 + sum of error variances).
    loadings: 1-D array of standardized factor loadings."""
    lam = np.array(loadings, dtype=float)
    if len(lam) == 0 or np.any(np.isnan(lam)):
        return np.nan
    sum_lam = lam.sum()
    error_var = 1 - lam ** 2
    denom = sum_lam ** 2 + error_var.sum()
    if denom == 0:
        return np.nan
    cr = sum_lam ** 2 / denom
    return cr


def mcdonalds_omega(data):
    """McDonald's omega_t (total) - model-based reliability.
    Uses single-factor CFA loadings from factor_analyzer."""
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


# ============================================================================
# 4. AVE FROM FACTOR LOADINGS
# ============================================================================

def ave_from_loadings(loadings):
    """AVE = mean of squared standardized factor loadings.
    This is the correct method (not from item-total correlations)."""
    lam = np.array(loadings)
    return float(np.mean(lam ** 2))


# ============================================================================
# 5. EFA WITH PROMAX ROTATION
# ============================================================================

def run_efa(data, construct_name, n_factors=None, max_factors=6):
    """Run EFA with KMO, Bartlett's, parallel analysis for factor retention,
    and promax rotation. Returns full loading matrix and diagnostics."""
    d = data.dropna()
    result = {
        'construct': construct_name,
        'n_valid': len(d),
        'n_items': d.shape[1],
    }

    if not HAS_FACTOR_ANALYZER:
        result['error'] = 'factor_analyzer not installed'
        return result

    # KMO
    try:
        kmo_all, kmo_model = calculate_kmo(d)
        result['kmo_model'] = round(float(kmo_model), 4)
        result['kmo_per_item'] = {col: round(float(v), 4) for col, v in zip(d.columns, kmo_all)}
    except Exception as e:
        result['kmo_error'] = str(e)

    # Bartlett's test
    try:
        chi2, p_val = calculate_bartlett_sphericity(d)
        result['bartlett_chi2'] = round(float(chi2), 2)
        result['bartlett_p'] = float(p_val)
    except Exception as e:
        result['bartlett_error'] = str(e)

    # Parallel analysis for factor retention
    if n_factors is None:
        n_factors = parallel_analysis(d, max_factors=max_factors)
        result['parallel_analysis_factors'] = n_factors

    result['n_factors'] = n_factors

    # Run EFA - promax (oblique) rotation
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

    # Eigenvalues and variance explained
    ev, v = fa.get_eigenvalues()
    result['eigenvalues_original'] = [round(float(x), 4) for x in ev[:max_factors]]

    var_explained = fa.get_factor_variance()
    result['variance_explained'] = {
        'per_factor': [round(float(x), 4) for x in var_explained[1]],
        'cumulative': [round(float(x), 4) for x in var_explained[2]],
        'total': round(float(var_explained[2][-1]), 4)
    }

    # Factor correlation matrix (only for multi-factor)
    if n_factors > 1 and hasattr(fa, 'phi_') and fa.phi_ is not None:
        phi = fa.phi_
        result['factor_correlations'] = [[round(float(phi[i][j]), 4)
                                          for j in range(n_factors)]
                                         for i in range(n_factors)]

    # Communalities
    result['communalities'] = {d.columns[i]: round(float(v), 4)
                               for i, v in enumerate(fa.get_communalities())}

    return result


def parallel_analysis(data, n_iter=1000, max_factors=6, percentile=95, seed=42):
    """Horn's parallel analysis: compare actual eigenvalues against
    eigenvalues from random data of the same shape."""
    d = data.dropna()
    n, p = d.shape
    rng = np.random.RandomState(seed)

    # Actual eigenvalues from correlation matrix
    corr = np.corrcoef(d.values, rowvar=False)
    actual_ev = np.sort(np.linalg.eigvalsh(corr))[::-1]

    # Random eigenvalues
    random_evs = np.zeros((n_iter, p))
    for i in range(n_iter):
        rand_data = rng.normal(size=(n, p))
        rand_corr = np.corrcoef(rand_data, rowvar=False)
        random_evs[i] = np.sort(np.linalg.eigvalsh(rand_corr))[::-1]

    threshold = np.percentile(random_evs, percentile, axis=0)

    # Number of factors where actual > random threshold
    n_factors = 0
    for i in range(min(max_factors, p)):
        if actual_ev[i] > threshold[i]:
            n_factors += 1
        else:
            break

    return max(1, n_factors)


# ============================================================================
# 6. CFA (CONFIRMATORY FACTOR ANALYSIS) VIA SEMOPY
# ============================================================================

def run_cfa(data, model_spec, construct_name):
    """Run CFA using semopy. model_spec is a lavaan-style model string.
    Returns fit indices: chi2, df, p, CFI, TLI, RMSEA, SRMR."""
    if not HAS_SEMOPY:
        return {'construct': construct_name, 'error': 'semopy not installed'}

    d = data.dropna()
    result = {'construct': construct_name, 'n_valid': len(d)}

    try:
        mod = semopy.Model(model_spec)
        mod.fit(d)
        # Fit indices - semopy 2.x returns stats as *columns* with a single 'Value' row;
        # handle both orientations so the code works regardless of version.
        fit_stats = semopy.calc_stats(mod)
        if 'Value' in fit_stats.index and 'CFI' not in fit_stats.index:
            def _stat(name):
                return float(fit_stats.loc['Value', name]) if name in fit_stats.columns else None
        else:
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

        # Standardized loadings (lval = item name, rval = factor name in semopy).
        # Use std_est=True so composite_reliability() receives standardized values.
        est_std = mod.inspect(std_est=True)
        loadings = est_std[(est_std['op'] == '~') & (est_std['Est. Std'].notna())]
        result['standardized_loadings'] = {
            row['lval']: round(float(row['Est. Std']), 4)
            for _, row in loadings.iterrows()
        }

    except Exception as e:
        result['error'] = str(e)

    return result


# ============================================================================
# 7. HTMT WITH BOOTSTRAP CI
# ============================================================================

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

    # Within-construct mean |correlations| (off-diagonal)
    w1 = d1.corr().values
    mask1 = ~np.eye(p1, dtype=bool)
    within1 = np.mean(np.abs(w1[mask1]))

    w2 = d2.corr().values
    mask2 = ~np.eye(p2, dtype=bool)
    within2 = np.mean(np.abs(w2[mask2]))

    # Between-construct correlations
    between = []
    for c1 in d1.columns:
        for c2 in d2.columns:
            between.append(abs(d1[c1].corr(d2[c2])))
    between_mean = np.mean(between)

    geo = np.sqrt(within1 * within2)
    return between_mean / geo if geo > 0 else np.nan


def htmt2_ratio(data1, data2):
    """HTMT2 (Roemer, Schuberth & Henseler 2021) - geometric-mean variant.

    HTMT2 replaces the arithmetic means in HTMT (Henseler 2015) with geometric
    means of the absolute correlations. By the AM-GM inequality, HTMT2 <= HTMT
    always. HTMT2 is a consistent estimator of the disattenuated correlation
    under tau-equivalence; semTools 0.5.6+ uses it as the default. Reported
    here as a robustness check alongside the canonical HTMT (Henseler 2015).

    Reference: Roemer, E., Schuberth, F., & Henseler, J. (2021). HTMT2 - an
    improved criterion for assessing discriminant validity in structural
    equation modeling. Industrial Management & Data Systems, 121(12).
    """
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
    abs_w1 = np.abs(w1[mask1])
    abs_w1 = abs_w1[abs_w1 > 0]
    if len(abs_w1) == 0:
        return np.nan
    within1_geo = float(np.exp(np.mean(np.log(abs_w1))))
    w2 = d2.corr().values
    mask2 = ~np.eye(p2, dtype=bool)
    abs_w2 = np.abs(w2[mask2])
    abs_w2 = abs_w2[abs_w2 > 0]
    if len(abs_w2) == 0:
        return np.nan
    within2_geo = float(np.exp(np.mean(np.log(abs_w2))))
    between = []
    for c1 in d1.columns:
        for c2 in d2.columns:
            r = d1[c1].corr(d2[c2])
            if pd.notna(r) and abs(r) > 0:
                between.append(abs(r))
    if len(between) == 0:
        return np.nan
    between_geo = float(np.exp(np.mean(np.log(between))))
    geo_within = math.sqrt(within1_geo * within2_geo)
    return between_geo / geo_within if geo_within > 0 else np.nan


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


# ============================================================================
# 8. FORNELL-LARCKER CRITERION
# ============================================================================

def fornell_larcker(ave_dict, corr_matrix):
    """Fornell-Larcker: sqrt(AVE) should exceed inter-construct correlations.
    Returns pass/fail for each pair."""
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


# ============================================================================
# 9. NORMALITY TESTING
# ============================================================================

def normality_tests(data, item_names):
    """Shapiro-Wilk, skewness, kurtosis for each item and person-level means."""
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
            'skewness': round(float(stats.skew(vals)), 4),
            'kurtosis': round(float(stats.kurtosis(vals)), 4),
            'shapiro_w': round(float(sw_stat), 4),
            'shapiro_p': round(float(sw_p), 6),
            'normal_p05': sw_p > 0.05 if not np.isnan(sw_p) else None
        })
    return results


# ============================================================================
# 10. SPLIT-HALF RELIABILITY
# ============================================================================

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

    # Spearman-Brown prophecy formula
    sb = 2 * r / (1 + r) if (1 + r) != 0 else np.nan
    return round(sb, 4)


# ============================================================================
# 11. INTER-ITEM CORRELATION MATRIX DIAGNOSTICS
# ============================================================================

def inter_item_diagnostics(data):
    """Mean, min, max of inter-item correlation matrix (off-diagonal)."""
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


# ============================================================================
# 12. ALPHA-IF-DELETED
# ============================================================================

def alpha_if_deleted(data, item_names):
    """Cronbach's alpha if each item is deleted."""
    base_alpha = cronbach_alpha(data)
    results = []
    for i, col in enumerate(data.columns):
        reduced = data.drop(columns=[col])
        a = cronbach_alpha(reduced)
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
# MAIN PIPELINE
# ============================================================================

def validate_construct(df, cols, names, construct_name, cfa_model=None):
    """Run all validations for a single construct."""
    data = df[cols]
    print(f"\n{'='*70}")
    print(f"  {construct_name} ({len(cols)} items)")
    print(f"{'='*70}")

    result = OrderedDict()
    result['construct'] = construct_name
    result['n_items'] = len(cols)
    result['n_valid_listwise'] = int(data.dropna().shape[0])

    # --- Cronbach's alpha ---
    alpha, (ci_lo, ci_hi) = cronbach_alpha_ci(data)
    result['cronbach_alpha'] = round(alpha, 4)
    result['alpha_95ci'] = [round(ci_lo, 4), round(ci_hi, 4)]
    print(f"  Cronbach's alpha: {alpha:.4f} [{ci_lo:.4f}, {ci_hi:.4f}]")

    # --- McDonald's omega ---
    omega, single_loadings = mcdonalds_omega(data)
    result['mcdonalds_omega'] = round(omega, 4) if not np.isnan(omega) else None
    print(f"  McDonald's omega: {omega:.4f}" if not np.isnan(omega) else "  McDonald's omega: N/A")

    # --- CR from single-factor loadings ---
    if single_loadings:
        cr = composite_reliability(single_loadings)
        result['composite_reliability'] = round(cr, 4)
        print(f"  Composite Reliability (CR): {cr:.4f}")

        ave = ave_from_loadings(single_loadings)
        result['ave_from_loadings'] = round(ave, 4)
        print(f"  AVE (from factor loadings): {ave:.4f}")

        result['single_factor_loadings'] = {names[i]: round(float(v), 4)
                                            for i, v in enumerate(single_loadings) if i < len(names)}
    else:
        result['composite_reliability'] = None
        result['ave_from_loadings'] = None

    # --- Split-half ---
    sh = split_half_reliability(data)
    result['split_half_spearman_brown'] = sh
    print(f"  Split-half (Spearman-Brown): {sh}")

    # --- Corrected item-total correlations ---
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
    n_flagged = len(flagged)
    print(f"  Corrected item-total: {n_flagged} items below 0.30 threshold" +
          (f" ({', '.join(flagged)})" if flagged else ""))

    # --- Alpha-if-deleted ---
    aid = alpha_if_deleted(data, names)
    result['alpha_if_deleted'] = aid
    increases = [x['item'] for x in aid if x.get('flag_increase')]
    if increases:
        print(f"  Alpha-if-deleted: {len(increases)} items would increase alpha ({', '.join(increases)})")

    # --- Inter-item correlations ---
    iic = inter_item_diagnostics(data)
    result['inter_item_correlations'] = iic
    print(f"  Inter-item r: mean={iic['mean']:.4f}, min={iic['min']:.4f}, max={iic['max']:.4f}")

    # --- Normality ---
    norm = normality_tests(data, names)
    result['normality'] = norm
    non_normal = sum(1 for x in norm if x.get('normal_p05') is False)
    print(f"  Normality: {non_normal}/{len(norm)} items non-normal (Shapiro-Wilk p<.05)")

    # --- EFA ---
    efa = run_efa(data, construct_name)
    result['efa'] = efa
    if 'kmo_model' in efa:
        print(f"  KMO: {efa['kmo_model']:.4f}")
    if 'bartlett_chi2' in efa:
        print(f"  Bartlett's: chi2={efa['bartlett_chi2']:.1f}, p={efa['bartlett_p']:.2e}")
    if 'n_factors' in efa:
        print(f"  Factors retained (parallel analysis): {efa['n_factors']}")
    if 'variance_explained' in efa:
        print(f"  Cumulative variance: {efa['variance_explained']['total']:.1%}")

    # --- CFA (with safe column names) ---
    if cfa_model:
        safe_data = data.rename(columns={c: safe_col(c) for c in data.columns})
        cfa = run_cfa(safe_data, cfa_model, construct_name)
        result['cfa'] = cfa
        if 'error' not in cfa:
            print(f"  CFA fit: CFI={cfa.get('cfi')}, TLI={cfa.get('tli')}, "
                  f"RMSEA={cfa.get('rmsea')}, SRMR={cfa.get('srmr')}")
        else:
            print(f"  CFA: {cfa['error']}")

    return result


def compute_discriminant_validity(df, construct_results):
    """HTMT with bootstrap CIs, Fornell-Larcker, and construct correlations."""
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
        print(f"\n  {name1} vs {name2}:")

        # HTMT with bootstrap CI; HTMT2 (Roemer 2021) reported as a robustness check
        h, (ci_lo, ci_hi) = htmt_bootstrap_ci(d1, d2, n_boot=2000)
        h2 = htmt2_ratio(d1, d2)
        print(f"    HTMT: {h:.4f} [{ci_lo:.4f}, {ci_hi:.4f}] HTMT2: {h2:.4f} {'PASS' if h < 0.85 else 'FAIL (>.85)'}")
        htmt_results.append({
            'pair': f"{name1}-{name2}",
            'htmt': round(h, 4),
            'htmt2': round(float(h2), 4) if h2 == h2 else None,
            'ci_95': [ci_lo, ci_hi],
            'passes_085': h < 0.85,
            'passes_090': h < 0.90,
        })

        # Pearson and Spearman construct-level correlations
        pm1 = df[cols1].mean(axis=1)
        pm2 = df[cols2].mean(axis=1)
        mask = pm1.notna() & pm2.notna()
        r_pearson = pm1[mask].corr(pm2[mask])
        r_spearman, sp_p = spearmanr(pm1[mask], pm2[mask])
        print(f"    Pearson r: {r_pearson:.4f}, Spearman rho: {r_spearman:.4f}")

    # Fornell-Larcker
    ave_dict = {}
    for cr in construct_results:
        name = cr['construct']
        ave = cr.get('ave_from_loadings')
        if ave is not None and not pd.isna(ave):
            ave_dict[name] = ave

    # Construct correlation matrix
    constructs = {'Barriers': BARRIER_COLS, 'Readiness': READINESS_COLS, 'Maturity': MATURITY_COLS}
    corr_mat = {}
    for n1, c1 in constructs.items():
        corr_mat[n1] = {}
        pm1 = df[c1].mean(axis=1)
        for n2, c2 in constructs.items():
            pm2 = df[c2].mean(axis=1)
            mask = pm1.notna() & pm2.notna()
            corr_mat[n1][n2] = float(pm1[mask].corr(pm2[mask]))

    fl_results = fornell_larcker(ave_dict, corr_mat) if ave_dict else []
    for fl in fl_results:
        status = 'PASS' if fl['passes'] else 'FAIL'
        print(f"\n  Fornell-Larcker {fl['pair']}: sqrt(AVE)={fl['sqrt_ave_1']:.4f}/{fl['sqrt_ave_2']:.4f}, "
              f"r={fl['correlation']:.4f} -> {status}")

    return {
        'htmt': htmt_results,
        'fornell_larcker': fl_results,
        'construct_correlations': corr_mat
    }


def safe_col(col):
    """Make column name CFA-safe (no dashes)."""
    return col.replace('-', '_').replace(' ', '_')


SAFE_BARRIER_COLS = [safe_col(c) for c in BARRIER_COLS]
SAFE_READINESS_COLS = [safe_col(c) for c in READINESS_COLS]
SAFE_MATURITY_COLS = [safe_col(c) for c in MATURITY_COLS]


# Canonical 3-group barrier decomposition (item ids B1..B18 are 1-indexed; convert to 0-index)
# F1a Strategy & Culture: B1, B2, B3, B5, B9, B10, B11, B15, B17 (9 items)
# F1b Resources & Operations: B4, B6, B7, B8, B12 (5 items)
# F2  External & Compliance: B13, B14, B16, B18 (4 items)
BARRIER_3GROUP = {
    'F1a': [0, 1, 2, 4, 8, 9, 10, 14, 16],
    'F1b': [3, 5, 6, 7, 11],
    'F2':  [12, 13, 15, 17],
}

# EFA-derived 2-factor partition: F1 holds 14 items; F2 holds B13, B14, B16, B18.
BARRIER_2GROUP = {
    'F1': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 16],
    'F2': [12, 13, 15, 17],
}


def build_cfa_models():
    """Build lavaan-style CFA model specifications using safe column names.

    Includes:
      - barriers_1f: single-factor Barriers
      - barriers_2f: EFA-derived 2-factor (F1=14 items, F2=4 items)
      - barriers_3f: canonical 3-factor decomposition (F1a/F1b/F2)
      - barriers_4f: legacy 4-factor decomposition (BARRIER_SUBCONSTRUCTS)
      - readiness_1f, maturity_1f: single-factor R, M
      - joint_3construct: B + R + M with free latent correlations
    """
    barrier_items = ' + '.join(SAFE_BARRIER_COLS)
    readiness_items = ' + '.join(SAFE_READINESS_COLS)
    maturity_items = ' + '.join(SAFE_MATURITY_COLS)

    barrier_cfa = f"Barriers =~ {barrier_items}"
    readiness_cfa = f"Readiness =~ {readiness_items}"
    maturity_cfa = f"Maturity =~ {maturity_items}"

    # EFA-derived 2-factor barrier model (matches what parallel analysis returned at N=200)
    barrier_2f = (
        f"F1 =~ {' + '.join(SAFE_BARRIER_COLS[i] for i in BARRIER_2GROUP['F1'])}\n"
        f"F2 =~ {' + '.join(SAFE_BARRIER_COLS[i] for i in BARRIER_2GROUP['F2'])}"
    )

    # Canonical 3-factor barrier model (F1a Strategy & Culture, F1b Resources & Ops, F2 External)
    barrier_3f = (
        f"F1a =~ {' + '.join(SAFE_BARRIER_COLS[i] for i in BARRIER_3GROUP['F1a'])}\n"
        f"F1b =~ {' + '.join(SAFE_BARRIER_COLS[i] for i in BARRIER_3GROUP['F1b'])}\n"
        f"F2 =~ {' + '.join(SAFE_BARRIER_COLS[i] for i in BARRIER_3GROUP['F2'])}"
    )

    # Legacy 4-factor barriers model
    barrier_4f = (
        f"OrgCultural =~ {' + '.join([SAFE_BARRIER_COLS[i] for i in BARRIER_SUBCONSTRUCTS['Organizational & Cultural']])}\n"
        f"Strategic =~ {' + '.join([SAFE_BARRIER_COLS[i] for i in BARRIER_SUBCONSTRUCTS['Strategic & Operational']])}\n"
        f"Resource =~ {' + '.join([SAFE_BARRIER_COLS[i] for i in BARRIER_SUBCONSTRUCTS['Resource & Capability']])}\n"
        f"RiskTrust =~ {' + '.join([SAFE_BARRIER_COLS[i] for i in BARRIER_SUBCONSTRUCTS['Risk, Trust & External']])}"
    )

    # Joint 3-construct CFA: all three constructs in one model with free latent correlations
    joint_3construct = (
        f"Barriers =~ {barrier_items}\n"
        f"Readiness =~ {readiness_items}\n"
        f"Maturity =~ {maturity_items}"
    )

    return {
        'barriers_1f': barrier_cfa,
        'barriers_2f': barrier_2f,
        'barriers_3f': barrier_3f,
        'barriers_4f': barrier_4f,
        'readiness_1f': readiness_cfa,
        'maturity_1f': maturity_cfa,
        'joint_3construct': joint_3construct,
    }


def load_crp200(csv_path):
    """Load pre-selected CRP-200 dataset (already filtered/frozen).
    The CRP public CSV has a single header row (de-identified format)."""
    df = pd.read_csv(csv_path, encoding='utf-8-sig')
    df['Duration (in seconds)'] = pd.to_numeric(df['Duration (in seconds)'], errors='coerce')

    # Encode scales
    for col in BARRIER_COLS + [BARRIER_IRI]:
        df[col] = df[col].map(BARRIER_SCALE)
    for col in READINESS_COLS + [READINESS_IRI]:
        df[col] = df[col].apply(lambda x: np.nan if str(x).strip() == "Don't Know"
                                else READINESS_SCALE.get(str(x).strip(), np.nan) if pd.notna(x) else np.nan)
    for col in MATURITY_COLS + [MATURITY_IRI]:
        df[col] = df[col].apply(lambda x: np.nan if str(x).strip() == "Don't Know"
                                else MATURITY_SCALE.get(str(x).strip(), np.nan) if pd.notna(x) else np.nan)

    print(f"CRP-200 dataset: {len(df)} respondents loaded")
    return df


def rename_cols_for_cfa(df, cols):
    """Rename columns to CFA-safe names (no dashes/special chars).
    Returns (renamed_df, col_map)."""
    col_map = {}
    for col in cols:
        safe = col.replace('-', '_').replace(' ', '_')
        col_map[col] = safe
    renamed = df[cols].rename(columns=col_map)
    return renamed, col_map


# ============================================================================
# 13. CFA MODEL COMPARISON (chi-squared difference, delta-AIC, delta-BIC)
# ============================================================================

def compare_cfa_models(model_results):
    """Compare a list of fitted CFA models.

    model_results: list of dicts with keys: name, chi2, df, aic, bic, cfi, tli, rmsea
    Returns a dict with summary table and pairwise nested chi-squared difference tests.
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


# ============================================================================
# 14. ITEM-LEVEL CONVERGENT / DISCRIMINANT (Hair 2014 rules)
# ============================================================================

def item_level_validity(efa_loadings, item_names, item_ids,
                        primary_pass=0.50, primary_acceptable=0.40,
                        cross_load_threshold=0.30, gap_threshold=0.20):
    """Apply Hair (2014/2019) item-level convergent and discriminant rules.

    efa_loadings: dict mapping column name -> list of loadings (one per factor).
    item_names: ordered list of human-readable item names.
    item_ids: ordered list of short ids (e.g., 'B1' .. 'B18').

    Convergent: primary loading >= primary_pass = PASS; >= primary_acceptable = WEAK.
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


# ============================================================================
# 15. SUBGROUP HTMT + FORNELL-LARCKER (treats F1a/F1b/F2 as 3 constructs)
# ============================================================================

def subgroup_discriminant(df, group_def, all_cols, group_aves):
    """HTMT bootstrap CI + Fornell-Larcker on a 3-group barrier decomposition.

    group_def: dict mapping group label -> list of 0-indexed positions in all_cols
    all_cols: full ordered column list (e.g., SAFE_BARRIER_COLS)
    group_aves: dict mapping group label -> AVE (precomputed from the EFA loadings)
    """
    sub_data = {label: df[[all_cols[i] for i in idxs]]
                for label, idxs in group_def.items()}
    labels = list(group_def.keys())

    htmt_results = []
    fl_results = []
    pearson_corr = {}

    means = {label: data.mean(axis=1, skipna=False) for label, data in sub_data.items()}

    for i, n1 in enumerate(labels):
        for j, n2 in enumerate(labels):
            if i >= j:
                continue
            d1, d2 = sub_data[n1], sub_data[n2]
            h, (lo, hi) = htmt_bootstrap_ci(d1, d2, n_boot=2000)
            h2 = htmt2_ratio(d1, d2)
            htmt_results.append({
                'pair': f'{n1} vs {n2}',
                'htmt': round(float(h), 4) if h == h else None,
                'htmt2': round(float(h2), 4) if h2 == h2 else None,
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


# ============================================================================
# 16. ALPHA-IF-DELETED SUMMARY (counts items where deletion would raise alpha)
# ============================================================================

def alpha_if_deleted_summary(construct_results):
    """Summarize alpha-if-deleted across constructs.

    Each construct_result must have 'cronbach_alpha' and 'alpha_if_deleted' (list).
    """
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
# independent of Readiness or Maturity. Runs EFA + parallel analysis + 1F CFA
# on JUST that subgroup's items.
# ============================================================================

def subgroup_standalone_validation(df, group_def, all_cols, item_names_full):
    """For each subgroup, run alpha + KMO/Bartlett + parallel analysis + 1F EFA + 1F CFA.

    group_def: dict label -> list of 0-indexed positions in all_cols
    all_cols: full ordered column list
    item_names_full: list of human-readable item names (same length as all_cols)

    Returns list of dicts, one per subgroup, with verdict.
    """
    results = []
    for label, idxs in group_def.items():
        cols = [all_cols[i] for i in idxs]
        item_ids = [f"B{i+1}" for i in idxs]  # short ids B1..B18
        data = df[cols].dropna()
        n, k = data.shape
        out = {
            'name': label,
            'item_ids': list(item_ids),
            'k': int(k),
            'n_listwise': int(n),
        }
        a = cronbach_alpha(data)
        out['alpha'] = round(float(a), 4) if not np.isnan(a) else None

        if k < 3:
            out['note'] = f"Only {k} items; CFA under-identified, EFA requires >=3 items."
            out['verdict'] = {'overall_pass': False, 'reason': 'too_few_items'}
            results.append(out)
            continue

        # KMO + Bartlett
        if HAS_FACTOR_ANALYZER:
            try:
                _, kmo = calculate_kmo(data)
                out['kmo'] = round(float(kmo), 4)
                chi2_v, p = calculate_bartlett_sphericity(data)
                out['bartlett_chi2'] = round(float(chi2_v), 2)
                out['bartlett_p'] = float(p)
            except Exception as e:
                out['kmo_error'] = str(e)
        else:
            out['kmo_error'] = "factor_analyzer not installed; KMO/Bartlett skipped."

        # Parallel analysis on just these items (use fewer iterations for subgroup checks)
        try:
            n_factors_pa = parallel_analysis(data, max_factors=min(4, k), n_iter=200)
            out['parallel_analysis_factors'] = int(n_factors_pa)
        except Exception:
            out['parallel_analysis_factors'] = None
            n_factors_pa = None

        # 1F EFA
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

        # 1F CFA
        spec = "F =~ " + " + ".join(cols)
        cfa_result = run_cfa(data, spec, label)
        if 'error' in cfa_result:
            out['cfa_1f'] = {'error': cfa_result['error']}
        else:
            out['cfa_1f'] = {kk: cfa_result.get(kk) for kk in
                             ('chi2', 'df', 'chi2_p', 'cfi', 'tli', 'rmsea', 'aic', 'bic')}

        # Verdict
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
# 18-22. EXTENDED STATISTICAL EXTENSIONS (added 2026-05-01)
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
        # omega_h_general = variance from general factor only (Zinbarg et al. 2005)
        # omega_t = variance from general + group factors combined (McDonald 1999)
        omega_h_general = sum_g**2 / total_var
        omega_t = (sum_g**2 + sum(s**2 for s in sum_spec.values())) / total_var
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
            'omega_h_general': round(omega_h_general, 4),
            'omega_h_specifics': {l: round(sum_spec[l]**2 / total_var, 4) for l in three_group_def.keys()},
            'omega_t': round(omega_t, 4),
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




# ============================================================================
# 31. APPROXIMATE MEASUREMENT INVARIANCE (added 2026-05-01)
# Configural via per-group fit; metric via Tucker congruence on loadings;
# scalar via item-mean correlation + max delta. Used because formal multigroup
# chi-squared difference tests at N<300 per group are underpowered, and
# semopy 2.3.x's stacked-data optimizer doesn't converge with the high
# missingness pattern that group-encoded data requires.
#
# Thresholds (Marsh et al. 2009; van de Vijver & Tanzer 2004):
#   Tucker congruence >= 0.95 = strong metric invariance support
#                      >= 0.85 = acceptable
#   Item-mean correlation >= 0.90 = strong scalar invariance support
#                          >= 0.80 = acceptable
# ============================================================================

def measurement_invariance_approximate(df, cols, spec, group_col, group_values=('SMB','ENT')):
    """Compute approximate configural / metric / scalar invariance evidence.

    Returns:
        configural: per-group fit indices (CFI, TLI, RMSEA)
        metric_approximate: Tucker's congruence on standardized loadings
        scalar_approximate: correlation of per-group item means + max abs delta
        verdicts at conventional thresholds
    """
    if not HAS_SEMOPY:
        return {'error': 'semopy not installed'}
    out = {'group_col': group_col, 'group_values': list(group_values)}
    per_group = {}
    loadings_per_group = {}
    means_per_group = {}
    for grp in group_values:
        sub = df[df[group_col] == grp][cols].dropna()
        if len(sub) < 10:
            per_group[grp] = {'error': f'insufficient N: {len(sub)}'}
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
            per_group[grp] = {
                'n': int(len(sub)),
                'chi2': round(_stat('chi2'), 3) if _stat('chi2') is not None else None,
                'df': int(_stat('DoF')) if _stat('DoF') is not None else None,
                'cfi': round(_stat('CFI'), 4) if _stat('CFI') is not None else None,
                'tli': round(_stat('TLI'), 4) if _stat('TLI') is not None else None,
                'rmsea': round(_stat('RMSEA'), 4) if _stat('RMSEA') is not None else None,
            }
            insp = mod.inspect(std_est=True)
            loads = insp[(insp['op']=='~') & (insp['Est. Std'].notna())].copy()
            loads['Est. Std'] = loads['Est. Std'].astype(float)
            loadings_per_group[grp] = loads.set_index(['lval','rval'])['Est. Std']
            means_per_group[grp] = sub.mean()
        except Exception as e:
            per_group[grp] = {'error': str(e)}
    out['configural'] = per_group

    # Approximate metric: Tucker's congruence on standardized loadings
    if len(loadings_per_group) == len(group_values):
        keys = list(loadings_per_group.keys())
        a_idx = loadings_per_group[keys[0]].index
        b_idx = loadings_per_group[keys[1]].index
        common = a_idx.intersection(b_idx)
        if len(common) >= 3:
            a = np.array(loadings_per_group[keys[0]].loc[common].values, dtype=float)
            b = np.array(loadings_per_group[keys[1]].loc[common].values, dtype=float)
            denom = float(np.sqrt((a*a).sum()) * np.sqrt((b*b).sum()))
            tc = float((a*b).sum() / denom) if denom else None
            out['metric_approximate'] = {
                'tucker_congruence': round(tc, 4) if tc is not None else None,
                'n_loadings_compared': int(len(common)),
                'support': ('strong' if tc is not None and tc >= 0.95 else
                             'acceptable' if tc is not None and tc >= 0.85 else
                             'weak'),
                'note': "Tucker's congruence on standardized loadings; >=.95 strong, >=.85 acceptable.",
            }
        else:
            out['metric_approximate'] = {'error': 'insufficient common loadings'}
    else:
        out['metric_approximate'] = {'error': 'one or more groups failed to fit'}

    # Approximate scalar: item-mean correlation + max abs delta
    if len(means_per_group) == len(group_values):
        keys = list(means_per_group.keys())
        common = means_per_group[keys[0]].index.intersection(means_per_group[keys[1]].index)
        if len(common) >= 3:
            a = means_per_group[keys[0]].loc[common]
            b = means_per_group[keys[1]].loc[common]
            r = float(a.corr(b))
            mean_diff = (b - a)
            max_abs = float(mean_diff.abs().max())
            out['scalar_approximate'] = {
                'item_mean_correlation': round(r, 4),
                'max_abs_mean_diff': round(max_abs, 4),
                'support': ('strong' if r >= 0.90 else
                             'acceptable' if r >= 0.80 else
                             'weak'),
                'note': "Per-group item-mean correlation; high r implies stable item difficulty across groups.",
            }
        else:
            out['scalar_approximate'] = {'error': 'insufficient common items'}
    return out



def main():
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <qualtrics_csv_path> [--json output.json] [--crp200]")
        sys.exit(1)

    csv_path = sys.argv[1]
    json_output = None
    use_crp200 = '--crp200' in sys.argv
    if '--json' in sys.argv:
        idx = sys.argv.index('--json')
        if idx + 1 < len(sys.argv) and not sys.argv[idx + 1].startswith('--'):
            json_output = sys.argv[idx + 1]

    # Load data
    if use_crp200:
        df = load_crp200(csv_path)
    else:
        df = load_and_filter(csv_path)

    # Build CFA models
    cfa_models = build_cfa_models()

    # -- Validate each construct --
    print("\n" + "=" * 70)
    print("  TABS V2 INSTRUMENT VALIDATION REPORT")
    print("=" * 70)

    barrier_result = validate_construct(
        df, BARRIER_COLS, BARRIER_NAMES, 'Barriers',
        cfa_model=cfa_models['barriers_1f']
    )

    readiness_result = validate_construct(
        df, READINESS_COLS, READINESS_NAMES, 'Readiness',
        cfa_model=cfa_models['readiness_1f']
    )

    maturity_result = validate_construct(
        df, MATURITY_COLS, MATURITY_NAMES, 'Maturity',
        cfa_model=cfa_models['maturity_1f']
    )

    construct_results = [barrier_result, readiness_result, maturity_result]

    # -- Multi-spec barrier CFAs (1F / 2F / 3F / 4F) --
    print(f"\n{'='*70}")
    print(f"  BARRIER CFA MODEL COMPARISON (1F / 2F / 3F / 4F)")
    print(f"{'='*70}")
    safe_barrier_data = df[BARRIER_COLS].rename(columns={c: safe_col(c) for c in BARRIER_COLS})

    # 1F result was already produced in validate_construct(); copy it here for unified comparison.
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

    # -- Joint 3-construct CFA (Barriers + Readiness + Maturity in one model) --
    print(f"\n{'='*70}")
    print(f"  JOINT 3-CONSTRUCT CFA")
    print(f"{'='*70}")
    rename_all = {c: safe_col(c) for c in BARRIER_COLS + READINESS_COLS + MATURITY_COLS}
    joint_data = df[BARRIER_COLS + READINESS_COLS + MATURITY_COLS].rename(columns=rename_all)
    joint_cfa = run_cfa(joint_data, cfa_models['joint_3construct'], 'Joint_3Construct')
    if 'error' not in joint_cfa:
        print(f"  Joint: CFI={joint_cfa.get('cfi')}, RMSEA={joint_cfa.get('rmsea')}")
        print(f"  N (listwise): {joint_data.dropna().shape[0]}")
    else:
        print(f"  Joint error: {joint_cfa['error']}")

    # -- Item-level Hair-style convergent + discriminant --
    print(f"\n{'='*70}")
    print(f"  ITEM-LEVEL HAIR TESTS (primary>=.50 PASS; cross<.30 OR gap>=.20 = DV PASS)")
    print(f"{'='*70}")
    barrier_efa_loads = barrier_result.get('efa', {}).get('loadings', {})
    barrier_item_ids = [f'B{i+1}' for i in range(len(BARRIER_NAMES))]
    item_level_barriers = item_level_validity(barrier_efa_loads, BARRIER_NAMES, barrier_item_ids)
    cv_fail_b = sum(1 for x in item_level_barriers if x['convergent'] == 'FAIL')
    cv_weak_b = sum(1 for x in item_level_barriers if x['convergent'] == 'WEAK')
    dv_fail_b = sum(1 for x in item_level_barriers if x['discriminant'] == 'FAIL')
    print(f"  Barriers: convergent FAIL={cv_fail_b}, WEAK={cv_weak_b}; discriminant FAIL={dv_fail_b}")

    readiness_efa_loads = readiness_result.get('efa', {}).get('loadings', {})
    readiness_item_ids = [f'R{i+1}' for i in range(len(READINESS_NAMES))]
    item_level_readiness = item_level_validity(readiness_efa_loads, READINESS_NAMES, readiness_item_ids)
    cv_fail_r = sum(1 for x in item_level_readiness if x['convergent'] == 'FAIL')
    cv_weak_r = sum(1 for x in item_level_readiness if x['convergent'] == 'WEAK')
    print(f"  Readiness: convergent FAIL={cv_fail_r}, WEAK={cv_weak_r}")

    maturity_efa_loads = maturity_result.get('efa', {}).get('loadings', {})
    maturity_item_ids = [f'M{i+1}' for i in range(len(MATURITY_NAMES))]
    item_level_maturity = item_level_validity(maturity_efa_loads, MATURITY_NAMES, maturity_item_ids)
    cv_fail_m = sum(1 for x in item_level_maturity if x['convergent'] == 'FAIL')
    cv_weak_m = sum(1 for x in item_level_maturity if x['convergent'] == 'WEAK')
    print(f"  Maturity: convergent FAIL={cv_fail_m}, WEAK={cv_weak_m}")

    item_level = {
        'barriers': item_level_barriers,
        'readiness': item_level_readiness,
        'maturity': item_level_maturity,
    }

    # -- Subgroup HTMT + Fornell-Larcker (F1a / F1b / F2) --
    print(f"\n{'='*70}")
    print(f"  SUBGROUP DISCRIMINANT VALIDITY (F1a / F1b / F2 as 3 constructs)")
    print(f"{'='*70}")
    barrier_col_map = {c: safe_col(c) for c in BARRIER_COLS}
    barrier_cols_list = [barrier_col_map[c] for c in BARRIER_COLS]
    subgroup_aves = {}
    # Prefer 3F CFA standardized loadings (each item loads on its own factor F1a/F1b/F2).
    # Fall back to 2F EFA loadings only when the 3F CFA was unavailable (semopy missing or failed).
    cfa_3f_loads = (
        barrier_3f_cfa.get('standardized_loadings', {})
        if barrier_3f_cfa and 'error' not in barrier_3f_cfa and 'standardized_loadings' in barrier_3f_cfa
        else {}
    )
    if cfa_3f_loads:
        for grp_label, idxs in BARRIER_3GROUP.items():
            lams = []
            for i in idxs:
                v = cfa_3f_loads.get(safe_col(BARRIER_COLS[i]))
                if v is not None:
                    lams.append(float(v))
            subgroup_aves[grp_label] = ave_from_loadings(lams) if lams else None
    else:
        # Fallback: 2F EFA loadings (F1 factor for F1a/F1b items, F2 factor for F2 items)
        barrier_loadings_matrix = barrier_result.get('efa', {}).get('loadings', {})
        for grp_label, idxs in BARRIER_3GROUP.items():
            load_idx = 0 if grp_label in ('F1a', 'F1b') else 1
            lams = []
            for i in idxs:
                lv = barrier_loadings_matrix.get(BARRIER_COLS[i])
                if lv is not None and len(lv) > load_idx:
                    lams.append(float(lv[load_idx]))
            subgroup_aves[grp_label] = ave_from_loadings(lams) if lams else None

    barrier_subgroup_data = df[BARRIER_COLS].rename(columns=barrier_col_map)
    subgroup_validity = subgroup_discriminant(
        barrier_subgroup_data, BARRIER_3GROUP, barrier_cols_list, subgroup_aves
    )
    for r in subgroup_validity['htmt']:
        verdict = 'PASS' if r['pass_085'] else 'FAIL'
        print(f"  HTMT {r['pair']}: {r['htmt']} [{r['ci_lower']}, {r['ci_upper']}] {verdict}")

    # -- Extended psychometric validation: DWLS ordinal CFA, bifactor, second-order, normality, CV --
    # Items 17-23: unconditional. subgroup_standalone_validation (item 24) is gated behind --crp200.
    cfa_dwls = {}; bifactor_results = {}; secondorder_results = {}
    mardia_results = {}; mahalanobis_results = {}; cv_results = {}
    irt_results = {}; per_factor_reg = {}
    print(f"\n{'='*70}")
    print(f"  EXTENDED PSYCHOMETRIC VALIDATION (DWLS, bifactor, 2nd-order, normality, CV, IRT)")
    print(f"{'='*70}")
    _barrier_cols_safe = [safe_col(c) for c in BARRIER_COLS]
    _barrier_renamed = df[BARRIER_COLS].rename(columns={c: safe_col(c) for c in BARRIER_COLS})
    _readiness_renamed = df[READINESS_COLS].rename(columns={c: safe_col(c) for c in READINESS_COLS})
    _maturity_renamed = df[MATURITY_COLS].rename(columns={c: safe_col(c) for c in MATURITY_COLS})

    # DWLS ordinal CFA on each construct + 3F barriers
    cfa_dwls['Barriers_1F'] = run_cfa_dwls(_barrier_renamed, cfa_models['barriers_1f'], 'Barriers_1F')
    cfa_dwls['Barriers_2F'] = run_cfa_dwls(_barrier_renamed, cfa_models['barriers_2f'], 'Barriers_2F')
    cfa_dwls['Barriers_3F'] = run_cfa_dwls(_barrier_renamed, cfa_models['barriers_3f'], 'Barriers_3F')
    cfa_dwls['Barriers_4F'] = run_cfa_dwls(_barrier_renamed, cfa_models['barriers_4f'], 'Barriers_4F')
    cfa_dwls['Readiness_1F'] = run_cfa_dwls(_readiness_renamed, cfa_models['readiness_1f'], 'Readiness_1F')
    cfa_dwls['Maturity_1F'] = run_cfa_dwls(_maturity_renamed, cfa_models['maturity_1f'], 'Maturity_1F')
    print(f"  DWLS Barriers 3F: CFI={cfa_dwls['Barriers_3F'].get('cfi')}, RMSEA={cfa_dwls['Barriers_3F'].get('rmsea')}")
    print(f"  DWLS Readiness 1F: CFI={cfa_dwls['Readiness_1F'].get('cfi')}, RMSEA={cfa_dwls['Readiness_1F'].get('rmsea')}")
    print(f"  DWLS Maturity 1F: CFI={cfa_dwls['Maturity_1F'].get('cfi')}, RMSEA={cfa_dwls['Maturity_1F'].get('rmsea')}")

    # Bifactor R+M
    bifactor_results = bifactor_rm(df, [safe_col(c) for c in READINESS_COLS], [safe_col(c) for c in MATURITY_COLS])
    if 'error' not in bifactor_results:
        print(f"  Bifactor R+M: ECV={bifactor_results.get('ecv_general')}, "
              f"omega_h={bifactor_results.get('omega_h_general')}")

    # Second-order Barriers CFA
    secondorder_results = second_order_barriers_cfa(_barrier_renamed, _barrier_cols_safe, BARRIER_3GROUP)
    if 'error' not in secondorder_results:
        print(f"  Second-order Barriers: CFI={secondorder_results.get('cfi')}, "
              f"RMSEA={secondorder_results.get('rmsea')}")

    # Mardia + Mahalanobis on each construct
    for cname, sub in [('Barriers', _barrier_renamed),
                        ('Readiness', _readiness_renamed),
                        ('Maturity', _maturity_renamed)]:
        mardia_results[cname] = mardia_multivariate_normality(sub)
        mahalanobis_results[cname] = mahalanobis_outliers(sub)
    if mardia_results.get('Barriers'):
        print(f"  Mardia (Barriers): MV-normal? {mardia_results['Barriers'].get('multivariate_normal_005')}")

    # Cross-validation 50/50 split
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
    if 'tucker_congruence' in cv_results:
        print(f"  CV split-half: Tucker congruence = {cv_results.get('tucker_congruence')}")
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
        bifactor_b_results = bifactor_barriers(_barrier_renamed, _barrier_cols_safe, BARRIER_3GROUP)
        renamed_with_demo = _barrier_renamed.copy()
        renamed_with_demo['_SMB'] = df['_SMB'].reindex(_barrier_renamed.index).values
        multigroup_3f_results = multigroup_3f_sem(renamed_with_demo, _barrier_cols_safe, BARRIER_3GROUP, group_col='_SMB')
        # Approximate measurement invariance (configural + metric + scalar)
        if 'Q4_OrgSize' in df.columns:
            inv_size_grp = df['Q4_OrgSize'].apply(lambda x: 'SMB' if x in ['<100','100-499','500-999'] else 'ENT' if x in ['1000-4999','5000-9999','10000+'] else None)
            inv_df = df.copy(); inv_df['_inv_grp'] = inv_size_grp
            inv_df = inv_df[inv_df['_inv_grp'].notna()]
            inv_df = inv_df.rename(columns={c: safe_col(c) for c in BARRIER_COLS + READINESS_COLS + MATURITY_COLS})
            _safe_b = [safe_col(c) for c in BARRIER_COLS]
            _safe_r = [safe_col(c) for c in READINESS_COLS]
            _safe_m = [safe_col(c) for c in MATURITY_COLS]
            _spec_b3f = (
                "F1a =~ " + " + ".join(_safe_b[i] for i in BARRIER_3GROUP['F1a']) + "\n"
                "F1b =~ " + " + ".join(_safe_b[i] for i in BARRIER_3GROUP['F1b']) + "\n"
                "F2 =~ "  + " + ".join(_safe_b[i] for i in BARRIER_3GROUP['F2'])
            )
            _spec_r1f = "Readiness =~ " + " + ".join(_safe_r)
            _spec_m1f = "Maturity =~ " + " + ".join(_safe_m)
            measurement_invariance = {
                'Barriers_3F': measurement_invariance_approximate(inv_df, _safe_b, _spec_b3f, '_inv_grp'),
                'Readiness_1F': measurement_invariance_approximate(inv_df, _safe_r, _spec_r1f, '_inv_grp'),
                'Maturity_1F': measurement_invariance_approximate(inv_df, _safe_m, _spec_m1f, '_inv_grp'),
            }
        else:
            measurement_invariance = {'error': 'Q4_OrgSize not in df'}

        dif_results = {}
        for cname, cols, names, ids in [('Barriers', BARRIER_COLS, BARRIER_NAMES, [f'B{i+1}' for i in range(len(BARRIER_NAMES))]), ('Readiness', READINESS_COLS, READINESS_NAMES, [f'R{i+1}' for i in range(len(READINESS_NAMES))]), ('Maturity', MATURITY_COLS, MATURITY_NAMES, [f'M{i+1}' for i in range(len(MATURITY_NAMES))])]:
            dif_results[cname] = dif_irt(df, cols, names, ids, group_col='_SMB')
        esem_results = esem_target_rotation(_barrier_renamed, _barrier_cols_safe, n_factors=3)
        if 'error' not in mediation_results:
            ind = (mediation_results.get('Indirect') or {}).get('coef')
            print(f"  Mediation B->R->M: indirect={ind}")
        if 'error' not in bifactor_b_results:
            print(f"  Bifactor Barriers: ECV(G)={bifactor_b_results.get('ecv_general')}, omega_h(G)={bifactor_b_results.get('omega_h_general')}")
    else:
        mediation_results = std_reg = power_results = tost_results = multigroup_3f_results = dif_results = {'error': 'Q4_OrgSize not in df'}
        bootstrap_alpha_results = item_d_smb = reliability_demo = {}
        bifactor_b_results = bifactor_barriers(_barrier_renamed, _barrier_cols_safe, BARRIER_3GROUP)
        esem_results = esem_target_rotation(_barrier_renamed, _barrier_cols_safe, n_factors=3)
        measurement_invariance = {'error': 'Q4_OrgSize not in df'}


    # -- Per-subgroup standalone validation (does each barrier subgroup hold as its own scale?) --
    # This is computationally expensive (parallel_analysis + CFA per subgroup), so it is
    # gated behind --crp200 to keep live/continuous validation runs fast.
    if use_crp200:
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

    # -- Alpha-if-deleted summary --
    print(f"\n{'='*70}")
    print(f"  ALPHA-IF-DELETED SUMMARY")
    print(f"{'='*70}")
    aid_summary = alpha_if_deleted_summary(construct_results)
    for s in aid_summary:
        print(f"  {s['construct']}: {s['items_increasing_alpha_count']} items would raise alpha")
        for it in s['items_increasing_alpha']:
            print(f"    {it['item']}: alpha if deleted = {it['alpha_if_deleted']} ({it['change']:+.4f})")

    # -- Standard discriminant validity (across the three top-level constructs) --
    discrim = compute_discriminant_validity(df, construct_results)

    # -- Summary table --
    print(f"\n{'='*70}")
    print(f"  SUMMARY TABLE")
    print(f"{'='*70}")
    print(f"  {'Construct':<12} {'Alpha':>7} {'Omega':>7} {'CR':>7} {'AVE':>7} {'Split':>7} {'KMO':>7} {'Factors':>8}")
    print(f"  {'-'*64}")
    for cr in construct_results:
        alpha = cr.get('cronbach_alpha', 'N/A')
        omega = cr.get('mcdonalds_omega', 'N/A')
        crel = cr.get('composite_reliability', 'N/A')
        ave = cr.get('ave_from_loadings', 'N/A')
        sh = cr.get('split_half_spearman_brown', 'N/A')
        kmo = cr.get('efa', {}).get('kmo_model', 'N/A')
        nf = cr.get('efa', {}).get('n_factors', 'N/A')

        def fmt(v):
            return f"{v:.4f}" if isinstance(v, (int, float)) and v is not None else str(v)

        print(f"  {cr['construct']:<12} {fmt(alpha):>7} {fmt(omega):>7} {fmt(crel):>7} "
              f"{fmt(ave):>7} {fmt(sh):>7} {fmt(kmo):>7} {str(nf):>8}")

    # -- JSON output --
    if json_output:
        output = OrderedDict()
        output['validation_date'] = pd.Timestamp.now().isoformat()
        output['n_clean'] = len(df)
        output['constructs'] = construct_results
        output['barriers_2f_cfa'] = barrier_2f_cfa
        output['barriers_3f_cfa'] = barrier_3f_cfa
        output['barriers_4f_cfa'] = barrier_4f_cfa
        output['barrier_model_comparison'] = barrier_model_comparison
        output['joint_3construct_cfa'] = joint_cfa
        output['item_level_validity'] = item_level
        output['subgroup_discriminant_validity'] = subgroup_validity
        if subgroup_standalone is not None:
            output['subgroup_standalone_validation'] = subgroup_standalone
        output['alpha_if_deleted_summary'] = aid_summary
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
        output['measurement_invariance'] = measurement_invariance
        output['discriminant_validity'] = discrim

        # Convert any numpy types for JSON serialization
        def convert(obj):
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
            return obj

        class NumpyEncoder(json.JSONEncoder):
            def default(self, obj):
                v = convert(obj)
                if v is not obj:
                    return v
                return super().default(obj)

        with open(json_output, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, cls=NumpyEncoder)
        print(f"\n  JSON output written to: {json_output}")

    print(f"\n{'='*70}")
    print(f"  VALIDATION COMPLETE")
    print(f"{'='*70}")


if __name__ == '__main__':
    main()
