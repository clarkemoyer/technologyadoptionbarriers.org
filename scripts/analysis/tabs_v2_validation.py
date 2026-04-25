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

Usage:
    python tabs_v2_validation.py <qualtrics_csv_path> [--json output.json]

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

    print(f"V2 total: {len(df)} | Clean (≥{MIN_DURATION_CLEAN}s + 3 IRIs): {len(clean)}")
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
        # Fit indices - semopy.calc_stats() returns metrics as row index,
        # 'Value' as the single column.  Access: fit_stats.loc[metric, 'Value'].
        fit_stats = semopy.calc_stats(mod)
        result['chi2'] = round(float(fit_stats.loc['chi2', 'Value']), 3) if 'chi2' in fit_stats.index else None
        result['df'] = int(fit_stats.loc['DoF', 'Value']) if 'DoF' in fit_stats.index else None
        result['chi2_p'] = round(float(fit_stats.loc['chi2 p-value', 'Value']), 4) if 'chi2 p-value' in fit_stats.index else None
        result['cfi'] = round(float(fit_stats.loc['CFI', 'Value']), 4) if 'CFI' in fit_stats.index else None
        result['tli'] = round(float(fit_stats.loc['TLI', 'Value']), 4) if 'TLI' in fit_stats.index else None
        result['rmsea'] = round(float(fit_stats.loc['RMSEA', 'Value']), 4) if 'RMSEA' in fit_stats.index else None
        result['srmr'] = round(float(fit_stats.loc['SRMR', 'Value']), 4) if 'SRMR' in fit_stats.index else None
        result['aic'] = round(float(fit_stats.loc['AIC', 'Value']), 2) if 'AIC' in fit_stats.index else None
        result['bic'] = round(float(fit_stats.loc['BIC', 'Value']), 2) if 'BIC' in fit_stats.index else None

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

        # HTMT with bootstrap CI
        h, (ci_lo, ci_hi) = htmt_bootstrap_ci(d1, d2, n_boot=2000)
        print(f"    HTMT: {h:.4f} [{ci_lo:.4f}, {ci_hi:.4f}] {'PASS' if h < 0.85 else 'FAIL (>.85)'}")
        htmt_results.append({
            'pair': f"{name1}-{name2}",
            'htmt': round(h, 4),
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
              f"r={fl['correlation']:.4f} → {status}")

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


def build_cfa_models():
    """Build lavaan-style CFA model specifications using safe column names."""
    barrier_items = ' + '.join(SAFE_BARRIER_COLS)
    readiness_items = ' + '.join(SAFE_READINESS_COLS)
    maturity_items = ' + '.join(SAFE_MATURITY_COLS)

    barrier_cfa = f"Barriers =~ {barrier_items}"
    readiness_cfa = f"Readiness =~ {readiness_items}"
    maturity_cfa = f"Maturity =~ {maturity_items}"

    # 4-factor barriers model (from prior EFA)
    barrier_4f = (
        f"OrgCultural =~ {' + '.join([SAFE_BARRIER_COLS[i] for i in BARRIER_SUBCONSTRUCTS['Organizational & Cultural']])}\n"
        f"Strategic =~ {' + '.join([SAFE_BARRIER_COLS[i] for i in BARRIER_SUBCONSTRUCTS['Strategic & Operational']])}\n"
        f"Resource =~ {' + '.join([SAFE_BARRIER_COLS[i] for i in BARRIER_SUBCONSTRUCTS['Resource & Capability']])}\n"
        f"RiskTrust =~ {' + '.join([SAFE_BARRIER_COLS[i] for i in BARRIER_SUBCONSTRUCTS['Risk, Trust & External']])}"
    )

    return {
        'barriers_1f': barrier_cfa,
        'barriers_4f': barrier_4f,
        'readiness_1f': readiness_cfa,
        'maturity_1f': maturity_cfa,
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

    # ── Validate each construct ──
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

    # ── 4-factor barriers CFA ──
    print(f"\n{'='*70}")
    print(f"  4-FACTOR BARRIERS CFA")
    print(f"{'='*70}")
    safe_barrier_data = df[BARRIER_COLS].rename(columns={c: safe_col(c) for c in BARRIER_COLS})
    barrier_4f_cfa = run_cfa(safe_barrier_data, cfa_models['barriers_4f'], 'Barriers_4F')
    if 'error' not in barrier_4f_cfa:
        print(f"  CFI={barrier_4f_cfa.get('cfi')}, TLI={barrier_4f_cfa.get('tli')}, "
              f"RMSEA={barrier_4f_cfa.get('rmsea')}, SRMR={barrier_4f_cfa.get('srmr')}")
    else:
        print(f"  Error: {barrier_4f_cfa['error']}")

    # ── Discriminant validity ──
    discrim = compute_discriminant_validity(df, construct_results)

    # ── Summary table ──
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

    # ── JSON output ──
    if json_output:
        output = OrderedDict()
        output['validation_date'] = pd.Timestamp.now().isoformat()
        output['n_clean'] = len(df)
        output['constructs'] = construct_results
        output['barriers_4f_cfa'] = barrier_4f_cfa
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
