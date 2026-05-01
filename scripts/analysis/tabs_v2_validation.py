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
        secondary = sorted(loads, reverse=True)[1] if len(loads) > 1 else 0.0
        diff = primary - secondary

        if primary >= primary_pass:
            cv = 'PASS'
        elif primary >= primary_acceptable:
            cv = 'WEAK'
        else:
            cv = 'FAIL'

        if secondary < cross_load_threshold or diff >= gap_threshold:
            dv = 'PASS'
        else:
            dv = 'FAIL'

        out.append({
            'id': item_ids[i] if i < len(item_ids) else col,
            'name': item_names[i] if i < len(item_names) else col,
            'primary': round(primary, 4),
            'secondary': round(secondary, 4),
            'gap': round(diff, 4),
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

    means = {label: data.mean(axis=1) for label, data in sub_data.items()}

    import math
    for i, n1 in enumerate(labels):
        for j, n2 in enumerate(labels):
            if i >= j:
                continue
            d1, d2 = sub_data[n1], sub_data[n2]
            h, (lo, hi) = htmt_bootstrap_ci(d1, d2, n_boot=2000)
            htmt_results.append({
                'pair': f'{n1} vs {n2}',
                'htmt': round(float(h), 4) if h == h else None,
                'ci_lower': round(float(lo), 4) if lo == lo else None,
                'ci_upper': round(float(hi), 4) if hi == hi else None,
                'pass_085': bool(h < 0.85) if h == h else None,
                'pass_090': bool(h < 0.90) if h == h else None,
            })

            mask = means[n1].notna() & means[n2].notna()
            r = float(means[n1][mask].corr(means[n2][mask]))
            pearson_corr[f'{n1} vs {n2}'] = round(r, 4)

            ave1 = group_aves.get(n1)
            ave2 = group_aves.get(n2)
            if ave1 is not None and ave2 is not None:
                sa1 = math.sqrt(ave1)
                sa2 = math.sqrt(ave2)
                small = min(sa1, sa2)
                fl_results.append({
                    'pair': f'{n1} vs {n2}',
                    'sqrt_ave_1': round(sa1, 4),
                    'sqrt_ave_2': round(sa2, 4),
                    'abs_r': round(abs(r), 4),
                    'smaller_sqrt_ave': round(small, 4),
                    'pass': bool(small > abs(r)),
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
    # Compute subgroup AVE from the F1 promax loadings for F1a and F1b items, F2 loadings for F2 items.
    # EFA loadings are keyed by original (unsafe) column names; use original cols for lookup.
    barrier_loadings_matrix = barrier_result.get('efa', {}).get('loadings', {})
    barrier_col_map = {c: safe_col(c) for c in BARRIER_COLS}
    barrier_cols_list = [barrier_col_map[c] for c in BARRIER_COLS]
    subgroup_aves = {}
    for grp_label, idxs in BARRIER_3GROUP.items():
        # F1a, F1b take F1 loadings (index 0); F2 takes F2 loadings (index 1)
        load_idx = 0 if grp_label in ('F1a', 'F1b') else 1
        lams = []
        for i in idxs:
            original_col = BARRIER_COLS[i]
            lv = barrier_loadings_matrix.get(original_col)
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
