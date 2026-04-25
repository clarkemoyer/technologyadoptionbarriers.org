#!/usr/bin/env python3
"""
TABS Survey Instrument Validation & Data Quality Report
========================================================

Comprehensive validation covering:
- PART I: Instrument Validation (content, construct, reliability, validity, IRI effectiveness)
- PART II: Response Data Validation (disposition, missing data, quality, distributions, CMV, bias)

Source: Technology Adoption Barriers Survey (TABS) - March 28, 2026 export
"""

import sys
import pandas as pd
import numpy as np
from scipy import stats
from scipy.stats import shapiro, ttest_ind, chi2_contingency
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from datetime import datetime
import warnings
# Suppress only specific known-noisy warnings, not all warnings
warnings.filterwarnings('ignore', category=FutureWarning)
warnings.filterwarnings('ignore', category=RuntimeWarning)

# ============================================================================
# CONSTANTS & CONFIGURATION
# ============================================================================

if len(sys.argv) < 2:
    print(f"Usage: {sys.argv[0]} <qualtrics_csv_path>")
    sys.exit(1)
CSV_PATH = sys.argv[1]

# V2 filter threshold
V2_THRESHOLD = '2026-03-23 14:00:00'
# Prolific live test of V2 instrument (2026-03-23 09:07 AM, COO, 876s) - valid V2 response
PROLIFIC_TEST_ID = 'R_1QK12IJpHjC3wd6'

# Scale value mappings
BARRIER_SCALE = {
    'Not a Barrier': 1,
    'Minor Barrier': 2,
    'Moderate Barrier': 3,
    'Significant Barrier': 4,
    'Major Barrier': 5
}

READINESS_SCALE = {
    'Very Low Readiness/Capability': 1,
    'Low Readiness/Capability': 2,
    'Moderate Readiness/Capability': 3,
    'High Readiness/Capability': 4,
    'Very High Readiness/Capability': 5
}

MATURITY_SCALE = {
    'Level 1: Initial/Ad Hoc': 1,
    'Level 2: Developing/Repeatable': 2,
    'Level 3: Defined/Standardized': 3,
    'Level 4: Managed/Quantitatively Managed': 4,
    'Level 5: Optimizing/Innovating': 5
}

# IRI expected values (correct answers)
IRI_EXPECTED = {
    'barrier': 'Major Barrier',
    'readiness': 'Low Readiness/Capability',
    'maturity': 'Level 2: Developing/Repeatable'
}

# Column definitions
BARRIER_ITEM_COLS = [f'Q10-28_Barriers_{i}' for i in range(1, 19)]
BARRIER_IRI_COL = 'Q10-28_Barriers_19'

READINESS_ITEM_COLS = [f'Q47-64_Readiness_{i}' for i in range(1, 18)]
READINESS_IRI_COL = 'Q47-64_Readiness_18'

MATURITY_ITEM_COLS = [f'Q65-73_Maturity_{i}' for i in range(1, 9)]
MATURITY_IRI_COL = 'Q65-73_Maturity_9'

# Demographic columns
DEMO_COLS = ['Q1_Role', 'Q2_DecisionAuth', 'Q3_Industry', 'Q4_OrgSize',
             'Q5_ProfitModel', 'Q6_RevenueBudget', 'Q7_PersonalBudget',
             'Q8_GeoScope', 'Q9_GeoScale']

# Barrier sub-constructs (theoretical groupings)
BARRIER_SUBCONSTRUCTS = {
    'Organizational & Cultural Resistance': [1, 3],
    'Strategic & Operational Challenges': [2, 7, 9, 10, 11, 12],
    'Resource & Skill Deficiencies': [4, 5, 6, 8],
    'Risk Trust & External': [13, 14, 15, 16, 17, 18]
}

# Readiness sub-constructs
READINESS_SUBCONSTRUCTS = {
    'Strategic Leadership & Governance': [1, 2, 3],
    'Culture & Change Readiness': [4, 5, 8],
    'Workforce & Skills': [6, 7],
    'Infrastructure & Technology': [9, 10, 11],
    'Data & Analytics': [12, 13, 14],
    'Process & Operational': [15, 16],
    'Financial': [17]
}

# Maturity item names (verified from instrument)
MATURITY_ITEM_NAMES = {
    1: 'IT Investment & Value Mgmt',
    2: 'IT-Enabled Innovation',
    3: 'Process Mgmt & Standardization',
    4: 'Data Governance & Analytics',
    5: 'Tech Risk & Resilience',
    6: 'Strategic IT Planning',
    7: 'Workforce Capability',
    8: 'Change Leadership'
}

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def load_data():
    """Load and preprocess TABS survey data."""
    # Read CSV with Qualtrics 3-row header:
    # row 0 = field names (used as headers), rows 1-2 = metadata (skipped)
    df = pd.read_csv(CSV_PATH, encoding='utf-8-sig', skiprows=[1, 2])

    # Convert duration to numeric
    df['Duration (in seconds)'] = pd.to_numeric(df['Duration (in seconds)'], errors='coerce')

    # Convert StartDate to datetime
    df['StartDate'] = pd.to_datetime(df['StartDate'], errors='coerce')

    return df

def scale_to_numeric(val, scale_map):
    """Convert scale text value to numeric."""
    if pd.isna(val):
        return np.nan
    val = str(val).strip()
    return scale_map.get(val, np.nan)

def encode_scales(df):
    """Encode all Likert scale responses to numeric."""
    df_encoded = df.copy()

    # Encode barriers
    for col in BARRIER_ITEM_COLS:
        df_encoded[col] = df[col].apply(lambda x: scale_to_numeric(x, BARRIER_SCALE))
    df_encoded[BARRIER_IRI_COL] = df[BARRIER_IRI_COL].apply(lambda x: scale_to_numeric(x, BARRIER_SCALE))

    # Encode readiness (treat "Don't Know" as NaN)
    for col in READINESS_ITEM_COLS:
        df_encoded[col] = df[col].apply(lambda x: np.nan if str(x).strip() == "Don't Know"
                                                   else scale_to_numeric(x, READINESS_SCALE))
    df_encoded[READINESS_IRI_COL] = df[READINESS_IRI_COL].apply(
        lambda x: np.nan if str(x).strip() == "Don't Know"
        else scale_to_numeric(x, READINESS_SCALE))

    # Encode maturity (treat "Don't Know" as NaN)
    for col in MATURITY_ITEM_COLS:
        df_encoded[col] = df[col].apply(lambda x: np.nan if str(x).strip() == "Don't Know"
                                                   else scale_to_numeric(x, MATURITY_SCALE))
    df_encoded[MATURITY_IRI_COL] = df[MATURITY_IRI_COL].apply(
        lambda x: np.nan if str(x).strip() == "Don't Know"
        else scale_to_numeric(x, MATURITY_SCALE))

    return df_encoded

def person_means(df, cols):
    """Compute mean for each person across specified columns.
    Returns Series where NaN rows have None (not a computed mean)."""
    means = {}
    for idx, row in df.iterrows():
        values = row[cols].dropna()
        if len(values) > 0:
            means[idx] = values.mean()
        else:
            means[idx] = None
    return pd.Series(means)

def grand_mean(df, cols):
    """Compute grand mean as mean of person-level means."""
    p_means = person_means(df, cols)
    p_means_valid = p_means.dropna()
    if len(p_means_valid) > 0:
        return p_means_valid.mean()
    return np.nan

def cronbach_alpha(data):
    """Compute Cronbach's alpha for item correlation."""
    data = data.dropna()
    if len(data) < 2 or data.shape[1] < 2:
        return np.nan
    k = data.shape[1]
    var_sum = data.var(ddof=1).sum()
    total_var = data.sum(axis=1).var(ddof=1)
    if total_var == 0:
        return np.nan
    alpha = (k / (k - 1)) * (1 - var_sum / total_var)
    return alpha

def cronbach_alpha_ci(data, method='feldt'):
    """95% CI for Cronbach's alpha using Feldt method."""
    alpha = cronbach_alpha(data)
    if np.isnan(alpha):
        return (np.nan, np.nan)

    n = len(data.dropna())
    k = data.shape[1]
    if n < 2 or k < 2:
        return (np.nan, np.nan)

    # Feldt (1980) method
    f = stats.f.ppf(0.975, n - 1, (n - 1) * (k - 1))
    lower = 1 - (1 - alpha) * f / (1 + (1 - alpha) * f)
    f = stats.f.ppf(0.025, n - 1, (n - 1) * (k - 1))
    upper = 1 - (1 - alpha) * f / (1 + (1 - alpha) * f)

    return (max(0, lower), min(1, upper))

def bartlett_test(data):
    """Bartlett's test of sphericity."""
    data_clean = data.dropna()
    if len(data_clean) < 2 or data_clean.shape[1] < 2:
        return np.nan, np.nan

    corr_matrix = data_clean.corr()
    n = len(data_clean)
    p = data_clean.shape[1]

    # Test statistic: -ln(det(R)) * (n - 1 - (2p + 5)/6)
    det_r = np.linalg.det(corr_matrix)
    chi_sq = -(n - 1 - (2*p + 5)/6) * np.log(max(det_r, 1e-10))
    df = p * (p - 1) / 2
    pval = 1 - stats.chi2.cdf(chi_sq, df)

    return chi_sq, pval

def kmo_measure(data):
    """Kaiser-Meyer-Olkin (KMO) measure of sampling adequacy."""
    data_clean = data.dropna()
    if len(data_clean) < 2 or data_clean.shape[1] < 2:
        return np.nan

    try:
        # Correlation matrix
        r = data_clean.corr().values
        p = r.shape[0]
        r_inv = np.linalg.inv(r)

        # Partial correlations from inverse of correlation matrix
        d = np.diag(r_inv)
        partial_corr = -r_inv / np.sqrt(np.outer(d, d))

        # Off-diagonal mask (exclude diagonal)
        mask = ~np.eye(p, dtype=bool)

        # KMO numerator: sum of squared off-diagonal correlations
        r_sq = np.sum(r[mask] ** 2)

        # KMO denominator: sum of squared off-diagonal correlations + partial correlations
        partial_sq = np.sum(partial_corr[mask] ** 2)

        denom = float(r_sq + partial_sq)
        kmo = float(r_sq) / denom if denom > 0 else np.nan
        return kmo
    except Exception:
        return np.nan

def mean_inter_item_corr(data):
    """Mean inter-item correlation."""
    data_clean = data.dropna()
    if len(data_clean) < 2 or data_clean.shape[1] < 2:
        return np.nan

    corr_matrix = data_clean.corr()
    # Extract upper triangle (excluding diagonal)
    mask = np.triu(np.ones_like(corr_matrix, dtype=bool), k=1)
    correlations = corr_matrix.values[mask]

    return correlations.mean() if len(correlations) > 0 else np.nan

def average_variance_extracted(data):
    """Approximation of AVE as mean of squared item-total correlations."""
    data_clean = data.dropna()
    if len(data_clean) < 2 or data_clean.shape[1] < 2:
        return np.nan

    # For each item, compute correlation with total
    total = data_clean.sum(axis=1)
    item_total_corrs = []
    for col in data_clean.columns:
        corr = data_clean[col].corr(total)
        item_total_corrs.append(corr ** 2)

    return np.mean(item_total_corrs) if len(item_total_corrs) > 0 else np.nan

def htmt_ratio(data1, data2):
    """Heterotrait-Monotrait (HTMT) ratio for discriminant validity.
    Lower values indicate better discriminant validity (ideally < 0.85).

    HTMT = mean(|between-construct correlations|) /
           geometric_mean(mean(|within-construct1 correlations|),
                          mean(|within-construct2 correlations|))
    """
    # Use only respondents who have complete data on BOTH constructs
    combined = pd.concat([data1, data2], axis=1).dropna()
    if len(combined) < 3:
        return np.nan

    d1 = combined.iloc[:, :data1.shape[1]]
    d2 = combined.iloc[:, data1.shape[1]:]

    p1, p2 = d1.shape[1], d2.shape[1]
    if p1 < 2 or p2 < 2:
        return np.nan

    # Within-construct mean absolute correlations (off-diagonal only)
    w1 = d1.corr().values
    mask1 = ~np.eye(p1, dtype=bool)
    within1_mean = np.mean(np.abs(w1[mask1]))

    w2 = d2.corr().values
    mask2 = ~np.eye(p2, dtype=bool)
    within2_mean = np.mean(np.abs(w2[mask2]))

    # Between-construct correlations: every item in d1 with every item in d2
    between_corrs = []
    for c1 in d1.columns:
        for c2 in d2.columns:
            between_corrs.append(abs(d1[c1].corr(d2[c2])))
    between_mean = np.mean(between_corrs)

    # Geometric mean of within-construct means
    geo_within = np.sqrt(within1_mean * within2_mean)

    htmt = between_mean / geo_within if geo_within > 0 else np.nan
    return htmt

def item_total_correlations(data):
    """Item-total correlation for each item."""
    data_clean = data.dropna()
    if len(data_clean) < 2 or data_clean.shape[1] < 2:
        return {}

    total = data_clean.sum(axis=1)
    correlations = {}
    for col in data_clean.columns:
        correlations[col] = data_clean[col].corr(total)

    return correlations

def alpha_if_deleted(data):
    """Cronbach's alpha if each item is deleted."""
    results = {}
    for col in data.columns:
        data_without = data.drop(columns=[col])
        alpha = cronbach_alpha(data_without)
        results[col] = alpha

    return results

def straightlining_rate(row, cols):
    """Proportion of items with same response (excluding NaNs)."""
    values = row[cols].dropna()
    if len(values) < 2:
        return np.nan

    # Count items with most common value
    counts = values.value_counts()
    max_count = counts.iloc[0] if len(counts) > 0 else 0

    return max_count / len(values)

def mahalanobis_distance(data):
    """Compute Mahalanobis distance for outlier detection."""
    data_clean = data.dropna()
    if len(data_clean) < 2 or data_clean.shape[1] < 2:
        return {}

    try:
        scaler = StandardScaler()
        data_scaled = scaler.fit_transform(data_clean)
        cov_matrix = np.cov(data_scaled.T)
        cov_inv = np.linalg.inv(cov_matrix)

        mean = data_scaled.mean(axis=0)
        distances = {}

        for idx, row in enumerate(data_clean.index):
            diff = data_scaled[idx] - mean
            distance = np.sqrt(np.dot(np.dot(diff, cov_inv), diff.T))
            distances[row] = distance

        return distances
    except:
        return {}

def harman_single_factor(data):
    """Harman's single-factor test (CMV).
    Returns variance explained by first unrotated factor."""
    data_clean = data.dropna()
    if len(data_clean) < 2 or data_clean.shape[1] < 2:
        return np.nan

    try:
        pca = PCA(n_components=1)
        pca.fit(StandardScaler().fit_transform(data_clean))
        return pca.explained_variance_ratio_[0]
    except:
        return np.nan

# ============================================================================
# MAIN ANALYSIS
# ============================================================================

def main():
    print("\n" + "="*80)
    print("TABS SURVEY INSTRUMENT VALIDATION & DATA QUALITY REPORT")
    print("="*80)
    print(f"Generated: {datetime.now().astimezone().isoformat(timespec='seconds')}")
    print(f"Data Source: {CSV_PATH}")
    import os
    print(f"Source Filename: {os.path.basename(CSV_PATH)}")

    # Load and encode data
    df_raw = load_data()
    df = encode_scales(df_raw)

    total_records = len(df_raw)

    # Keep full export for disposition funnel reporting in Part II
    df_all = df_raw.copy()

    # Apply V2 threshold filter so Part I analyses use only V2+ data
    if 'StartDate' in df_raw.columns:
        v2_mask = df_raw['StartDate'] >= V2_THRESHOLD
        if 'ResponseId' in df_raw.columns:
            v2_mask = v2_mask | (df_raw['ResponseId'] == PROLIFIC_TEST_ID)
        df_raw = df_raw.loc[v2_mask].reset_index(drop=True)
        df = df.loc[v2_mask].reset_index(drop=True)
        print(f"\nTotal records in export: {total_records}")
        print(f"Records at or after V2 threshold ({V2_THRESHOLD}): {len(df_raw)}")
    else:
        print(f"\nTotal records in export: {total_records}")
        print("Warning: StartDate column not found; V2 threshold filter not applied.")

    # ========================================================================
    # PART I: INSTRUMENT VALIDATION
    # ========================================================================

    print("\n\n" + "="*80)
    print("PART I: INSTRUMENT VALIDATION")
    print("="*80)

    # ========================================================================
    # 1. CONTENT VALIDITY EVIDENCE
    # ========================================================================

    print("\n\n1. CONTENT VALIDITY EVIDENCE")
    print("-" * 80)

    print(f"\nSurvey Items per Construct:")
    print(f"  Barriers:  {len(BARRIER_ITEM_COLS)} items")
    print(f"  Readiness: {len(READINESS_ITEM_COLS)} items")
    print(f"  Maturity:  {len(MATURITY_ITEM_COLS)} items")
    print(f"  Total:     {len(BARRIER_ITEM_COLS) + len(READINESS_ITEM_COLS) + len(MATURITY_ITEM_COLS)} core items")

    print(f"\nBarrier Sub-Construct Coverage:")
    for name, items in BARRIER_SUBCONSTRUCTS.items():
        print(f"  {name}: {len(items)} items (B{items})")

    print(f"\nReadiness Sub-Construct Coverage:")
    for name, items in READINESS_SUBCONSTRUCTS.items():
        print(f"  {name}: {len(items)} items (R{items})")

    print(f"\nMaturity Item Names:")
    for idx, name in MATURITY_ITEM_NAMES.items():
        print(f"  M{idx}: {name}")

    # ========================================================================
    # 2. CONSTRUCT VALIDITY - INTERNAL STRUCTURE (PCA)
    # ========================================================================

    print("\n\n2. CONSTRUCT VALIDITY - INTERNAL STRUCTURE (PCA/FACTOR ANALYSIS)")
    print("-" * 80)

    # Combine all constructs for overall PCA
    all_item_cols = BARRIER_ITEM_COLS + READINESS_ITEM_COLS + MATURITY_ITEM_COLS
    df_all_items = df[all_item_cols].dropna()

    print(f"\nFull Dataset for PCA: {len(df_all_items)} complete cases")

    # Bartlett's test
    chi_sq, pval = bartlett_test(df_all_items)
    print(f"\nBartlett's Test of Sphericity:")
    print(f"  Chi-Square: {chi_sq:.2f}")
    print(f"  p-value:    {pval:.2e}")
    print(f"  Result:     {'Reject H0 - data suitable for factor analysis' if pval < 0.05 else 'Fail to reject H0'}")

    # KMO measure
    kmo = kmo_measure(df_all_items)
    print(f"\nKaiser-Meyer-Olkin (KMO) Measure:")
    print(f"  KMO Statistic: {kmo:.4f}")
    if kmo >= 0.9:
        interpretation = "Marvelous"
    elif kmo >= 0.8:
        interpretation = "Meritorious"
    elif kmo >= 0.7:
        interpretation = "Middling"
    elif kmo >= 0.6:
        interpretation = "Mediocre"
    elif kmo >= 0.5:
        interpretation = "Miserable"
    else:
        interpretation = "Unacceptable"
    print(f"  Interpretation: {interpretation}")

    # PCA
    try:
        scaler = StandardScaler()
        data_scaled = scaler.fit_transform(df_all_items)
        pca = PCA()
        pca.fit(data_scaled)

        print(f"\nEigenvalue Table (Top 10 Components):")
        print(f"  PC | Eigenvalue | Cumulative % Var")
        cumsum = 0
        for i in range(min(10, len(pca.explained_variance_))):
            eig = pca.explained_variance_[i]
            cumsum += pca.explained_variance_ratio_[i]
            print(f"  {i+1:2d} | {eig:10.4f} | {cumsum*100:8.2f}%")

        # First 3 PCs loadings
        print(f"\nItem Loadings on First 3 Principal Components:")
        print(f"  Item                    | PC1      | PC2      | PC3      | Scale")
        for i, col in enumerate(all_item_cols):
            scale = "Barriers" if i < len(BARRIER_ITEM_COLS) else ("Readiness" if i < len(BARRIER_ITEM_COLS) + len(READINESS_ITEM_COLS) else "Maturity")
            print(f"  {col:23s} | {pca.components_[0, i]:8.4f} | {pca.components_[1, i]:8.4f} | {pca.components_[2, i]:8.4f} | {scale}")

        # Cross-loadings
        loadings_matrix = pca.components_[:3, :].T
        cross_load_count = 0
        for row in loadings_matrix:
            if np.sum(np.abs(row) >= 0.30) > 1:
                cross_load_count += 1

        print(f"\nCross-Loading Analysis:")
        print(f"  Items loading ≥0.30 on multiple PCs: {cross_load_count}/{len(all_item_cols)}")

    except Exception as e:
        print(f"PCA Error: {e}")

    # ========================================================================
    # 3. RELIABILITY - INTERNAL CONSISTENCY
    # ========================================================================

    print("\n\n3. RELIABILITY - INTERNAL CONSISTENCY")
    print("-" * 80)

    def analyze_scale(name, item_cols, df_data):
        """Analyze one scale's reliability."""
        df_scale = df_data[item_cols]

        alpha = cronbach_alpha(df_scale)
        alpha_ci = cronbach_alpha_ci(df_scale)
        mii = mean_inter_item_corr(df_scale)

        print(f"\n{name}:")
        print(f"  Cronbach's Alpha: {alpha:.4f} [95% CI: {alpha_ci[0]:.4f} - {alpha_ci[1]:.4f}]")
        print(f"  Mean Inter-Item Correlation: {mii:.4f}")
        print(f"  N items: {len(item_cols)}")
        print(f"  N respondents: {len(df_scale.dropna())}")

        # Item-total correlations
        item_tot = item_total_correlations(df_scale)
        print(f"\n  Item-Total Correlations:")
        for item, corr in item_tot.items():
            print(f"    {item}: {corr:.4f}")

        # Alpha if deleted
        alpha_deleted = alpha_if_deleted(df_scale)
        print(f"\n  Alpha if Item Deleted:")
        improvements = []
        for item, alpha_new in alpha_deleted.items():
            delta = alpha_new - alpha if not np.isnan(alpha_new) else np.nan
            flag = " <-- IMPROVES by ≥.01" if (not np.isnan(delta) and delta >= 0.01) else ""
            print(f"    {item}: {alpha_new:.4f} (Δ={delta:+.4f}){flag}")
            if not np.isnan(delta) and delta >= 0.01:
                improvements.append((item, delta))

        if improvements:
            print(f"\n  FLAGGED for deletion: {len(improvements)} item(s)")
            for item, delta in improvements:
                print(f"    {item} (improvement: {delta:+.4f})")

    analyze_scale("Barriers Scale", BARRIER_ITEM_COLS, df)
    analyze_scale("Readiness Scale", READINESS_ITEM_COLS, df)
    analyze_scale("Maturity Scale", MATURITY_ITEM_COLS, df)

    # ========================================================================
    # 4. CONVERGENT & DISCRIMINANT VALIDITY
    # ========================================================================

    print("\n\n4. CONVERGENT & DISCRIMINANT VALIDITY")
    print("-" * 80)

    # Construct correlations (person-level means)
    barrier_means = person_means(df, BARRIER_ITEM_COLS)
    readiness_means = person_means(df, READINESS_ITEM_COLS)
    maturity_means = person_means(df, MATURITY_ITEM_COLS)

    # Create correlation matrix
    corr_data = pd.DataFrame({
        'Barriers': barrier_means,
        'Readiness': readiness_means,
        'Maturity': maturity_means
    }).dropna()

    corr_matrix = corr_data.corr()

    print(f"\nConstruct Correlation Matrix (Pearson r):")
    print(f"  N: {len(corr_data)} respondents with complete construct means")
    print(f"\n           Barriers  Readiness  Maturity")
    for construct in corr_matrix.index:
        row = corr_matrix.loc[construct]
        print(f"  {construct:10s}  {row['Barriers']:8.4f}  {row['Readiness']:9.4f}  {row['Maturity']:8.4f}")

    # Correlation CIs (Fisher Z-transform)
    def corr_ci(r, n):
        """95% CI for correlation using Fisher Z-transform."""
        z = 0.5 * np.log((1 + r) / (1 - r))
        se = 1 / np.sqrt(n - 3)
        z_crit = 1.96
        ci_lower = np.tanh(z - z_crit * se)
        ci_upper = np.tanh(z + z_crit * se)
        return (ci_lower, ci_upper)

    print(f"\nCorrelation 95% CIs:")
    for i, c1 in enumerate(corr_matrix.columns):
        for c2 in corr_matrix.columns[i+1:]:
            r = corr_matrix.loc[c1, c2]
            ci = corr_ci(r, len(corr_data))
            print(f"  {c1} ↔ {c2}: r={r:.4f} [95% CI: {ci[0]:.4f} - {ci[1]:.4f}]")

    # Average Variance Extracted (AVE)
    print(f"\nAverage Variance Extracted (AVE Approximation):")
    ave_barrier = average_variance_extracted(df[BARRIER_ITEM_COLS])
    ave_readiness = average_variance_extracted(df[READINESS_ITEM_COLS])
    ave_maturity = average_variance_extracted(df[MATURITY_ITEM_COLS])

    print(f"  Barriers:   {ave_barrier:.4f}")
    print(f"  Readiness:  {ave_readiness:.4f}")
    print(f"  Maturity:   {ave_maturity:.4f}")

    # HTMT Ratios
    print(f"\nHeterotrait-Monotrait (HTMT) Ratios (threshold: <0.85):")
    htmt_br = htmt_ratio(df[BARRIER_ITEM_COLS], df[READINESS_ITEM_COLS])
    htmt_bm = htmt_ratio(df[BARRIER_ITEM_COLS], df[MATURITY_ITEM_COLS])
    htmt_rm = htmt_ratio(df[READINESS_ITEM_COLS], df[MATURITY_ITEM_COLS])

    print(f"  Barriers ↔ Readiness: {htmt_br:.4f} {'✓ Acceptable' if htmt_br < 0.85 else '✗ Problematic'}")
    print(f"  Barriers ↔ Maturity:  {htmt_bm:.4f} {'✓ Acceptable' if htmt_bm < 0.85 else '✗ Problematic'}")
    print(f"  Readiness ↔ Maturity: {htmt_rm:.4f} {'✓ Acceptable' if htmt_rm < 0.85 else '✗ Problematic'}")

    # Fornell-Larcker Criterion (AVE > max squared correlation)
    print(f"\nFornell-Larcker Criterion (AVE > r²):")
    print(f"  Barriers:")
    print(f"    AVE = {ave_barrier:.4f}")
    print(f"    Max r² (Readiness): {(corr_matrix.loc['Barriers', 'Readiness']**2):.4f}")
    print(f"    Max r² (Maturity):  {(corr_matrix.loc['Barriers', 'Maturity']**2):.4f}")
    print(f"    Result: {'✓ Pass' if ave_barrier > corr_matrix.loc['Barriers', 'Readiness']**2 and ave_barrier > corr_matrix.loc['Barriers', 'Maturity']**2 else '✗ Fail'}")

    print(f"  Readiness:")
    print(f"    AVE = {ave_readiness:.4f}")
    print(f"    Max r² (Barriers): {(corr_matrix.loc['Readiness', 'Barriers']**2):.4f}")
    print(f"    Max r² (Maturity): {(corr_matrix.loc['Readiness', 'Maturity']**2):.4f}")
    print(f"    Result: {'✓ Pass' if ave_readiness > corr_matrix.loc['Readiness', 'Barriers']**2 and ave_readiness > corr_matrix.loc['Readiness', 'Maturity']**2 else '✗ Fail'}")

    print(f"  Maturity:")
    print(f"    AVE = {ave_maturity:.4f}")
    print(f"    Max r² (Barriers): {(corr_matrix.loc['Maturity', 'Barriers']**2):.4f}")
    print(f"    Max r² (Readiness): {(corr_matrix.loc['Maturity', 'Readiness']**2):.4f}")
    print(f"    Result: {'✓ Pass' if ave_maturity > corr_matrix.loc['Maturity', 'Barriers']**2 and ave_maturity > corr_matrix.loc['Maturity', 'Readiness']**2 else '✗ Fail'}")

    # ========================================================================
    # 5. IRI EFFECTIVENESS
    # ========================================================================

    print("\n\n5. CRITERION VALIDITY - IRI EFFECTIVENESS")
    print("-" * 80)

    # Check IRIs
    df['IRI_Barrier_Pass'] = df[BARRIER_IRI_COL] == BARRIER_SCALE[IRI_EXPECTED['barrier']]
    df['IRI_Readiness_Pass'] = df[READINESS_IRI_COL] == READINESS_SCALE[IRI_EXPECTED['readiness']]
    df['IRI_Maturity_Pass'] = df[MATURITY_IRI_COL] == MATURITY_SCALE[IRI_EXPECTED['maturity']]
    df['IRI_All_Pass'] = df['IRI_Barrier_Pass'] & df['IRI_Readiness_Pass'] & df['IRI_Maturity_Pass']

    print(f"\nIRI Pass Rates:")
    n_total = len(df)
    n_barrier_pass = df['IRI_Barrier_Pass'].sum()
    n_readiness_pass = df['IRI_Readiness_Pass'].sum()
    n_maturity_pass = df['IRI_Maturity_Pass'].sum()
    n_all_pass = df['IRI_All_Pass'].sum()

    print(f"  Barrier IRI:   {n_barrier_pass:3d}/{n_total} ({n_barrier_pass/n_total*100:5.1f}%)")
    print(f"  Readiness IRI: {n_readiness_pass:3d}/{n_total} ({n_readiness_pass/n_total*100:5.1f}%)")
    print(f"  Maturity IRI:  {n_maturity_pass:3d}/{n_total} ({n_maturity_pass/n_total*100:5.1f}%)")
    print(f"  All IRIs Pass: {n_all_pass:3d}/{n_total} ({n_all_pass/n_total*100:5.1f}%)")

    # IRI-pass vs IRI-fail construct mean comparisons
    print(f"\nConstruct Mean Comparisons: IRI-Pass vs IRI-Fail")
    print(f"\n  Barriers Scale:")

    pass_group = df[df['IRI_All_Pass']][BARRIER_ITEM_COLS]
    fail_group = df[~df['IRI_All_Pass']][BARRIER_ITEM_COLS]

    pass_mean = grand_mean(pass_group, BARRIER_ITEM_COLS)
    fail_mean = grand_mean(fail_group, BARRIER_ITEM_COLS)

    if not np.isnan(pass_mean) and not np.isnan(fail_mean):
        pass_data = person_means(pass_group, BARRIER_ITEM_COLS).dropna()
        fail_data = person_means(fail_group, BARRIER_ITEM_COLS).dropna()

        t_stat, p_val = ttest_ind(pass_data, fail_data)
        cohens_d = (pass_mean - fail_mean) / np.sqrt((pass_data.std()**2 + fail_data.std()**2) / 2)

        print(f"    IRI-Pass Mean: {pass_mean:.4f} (n={len(pass_data)})")
        print(f"    IRI-Fail Mean: {fail_mean:.4f} (n={len(fail_data)})")
        print(f"    t-test: t={t_stat:.4f}, p={p_val:.4f}")
        print(f"    Cohen's d: {cohens_d:.4f}")

    print(f"\n  Readiness Scale:")

    pass_group = df[df['IRI_All_Pass']][READINESS_ITEM_COLS]
    fail_group = df[~df['IRI_All_Pass']][READINESS_ITEM_COLS]

    pass_mean = grand_mean(pass_group, READINESS_ITEM_COLS)
    fail_mean = grand_mean(fail_group, READINESS_ITEM_COLS)

    if not np.isnan(pass_mean) and not np.isnan(fail_mean):
        pass_data = person_means(pass_group, READINESS_ITEM_COLS).dropna()
        fail_data = person_means(fail_group, READINESS_ITEM_COLS).dropna()

        t_stat, p_val = ttest_ind(pass_data, fail_data)
        cohens_d = (pass_mean - fail_mean) / np.sqrt((pass_data.std()**2 + fail_data.std()**2) / 2)

        print(f"    IRI-Pass Mean: {pass_mean:.4f} (n={len(pass_data)})")
        print(f"    IRI-Fail Mean: {fail_mean:.4f} (n={len(fail_data)})")
        print(f"    t-test: t={t_stat:.4f}, p={p_val:.4f}")
        print(f"    Cohen's d: {cohens_d:.4f}")

    print(f"\n  Maturity Scale:")

    pass_group = df[df['IRI_All_Pass']][MATURITY_ITEM_COLS]
    fail_group = df[~df['IRI_All_Pass']][MATURITY_ITEM_COLS]

    pass_mean = grand_mean(pass_group, MATURITY_ITEM_COLS)
    fail_mean = grand_mean(fail_group, MATURITY_ITEM_COLS)

    if not np.isnan(pass_mean) and not np.isnan(fail_mean):
        pass_data = person_means(pass_group, MATURITY_ITEM_COLS).dropna()
        fail_data = person_means(fail_group, MATURITY_ITEM_COLS).dropna()

        t_stat, p_val = ttest_ind(pass_data, fail_data)
        cohens_d = (pass_mean - fail_mean) / np.sqrt((pass_data.std()**2 + fail_data.std()**2) / 2)

        print(f"    IRI-Pass Mean: {pass_mean:.4f} (n={len(pass_data)})")
        print(f"    IRI-Fail Mean: {fail_mean:.4f} (n={len(fail_data)})")
        print(f"    t-test: t={t_stat:.4f}, p={p_val:.4f}")
        print(f"    Cohen's d: {cohens_d:.4f}")

    # ========================================================================
    # PART II: RESPONSE DATA VALIDATION
    # ========================================================================

    print("\n\n" + "="*80)
    print("PART II: RESPONSE DATA VALIDATION")
    print("="*80)

    # ========================================================================
    # 6. SAMPLE CHARACTERISTICS & DISPOSITION
    # ========================================================================

    print("\n\n6. SAMPLE CHARACTERISTICS & REPRESENTATIVENESS")
    print("-" * 80)

    # Disposition funnel (use unfiltered df_all to show baseline from full export)
    # df_all is raw (pre-encoding), so compute V2/IRI flags from raw string labels
    df_all['IsV2'] = (df_all['StartDate'] >= pd.to_datetime(V2_THRESHOLD, errors='coerce'))
    if 'ResponseId' in df_all.columns:
        df_all['IsV2'] = df_all['IsV2'] | (df_all['ResponseId'] == PROLIFIC_TEST_ID)
    n_v2 = df_all['IsV2'].sum()

    df_all['Duration_Filter'] = df_all['Duration (in seconds)'] >= 480
    n_duration_filtered = df_all['Duration_Filter'].sum()

    # Compute IRI pass on raw (string) data since df_all is pre-encoding
    df_all['IRI_All_Pass'] = (
        (df_all[BARRIER_IRI_COL] == IRI_EXPECTED['barrier']) &
        (df_all[READINESS_IRI_COL] == IRI_EXPECTED['readiness']) &
        (df_all[MATURITY_IRI_COL] == IRI_EXPECTED['maturity'])
    )
    n_iri_pass = df_all['IRI_All_Pass'].sum()

    clean_df = df_all[df_all['IsV2'] & df_all['Duration_Filter'] & df_all['IRI_All_Pass']]
    n_clean = len(clean_df)

    print(f"\nDisposition Funnel:")
    print(f"  All records:           {len(df_all):3d}")
    print(f"  V2 (≥ 2026-03-23 14:00): {n_v2:3d} ({n_v2/len(df_all)*100:5.1f}%)")
    print(f"  Duration ≥ 480s:       {n_duration_filtered:3d} ({n_duration_filtered/len(df_all)*100:5.1f}% of all)")
    print(f"  IRI All Pass:          {n_iri_pass:3d} ({n_iri_pass/len(df_all)*100:5.1f}% of all)")
    print(f"  Clean (V2+Duration+IRI): {n_clean:3d} ({n_clean/len(df_all)*100:5.1f}% of all)")

    # Duration distribution
    print(f"\nDuration Distribution (seconds):")
    percentiles = [10, 25, 50, 75, 90]
    for p in percentiles:
        val = np.percentile(df['Duration (in seconds)'].dropna(), p)
        print(f"  {p}th percentile: {val:7.1f}s")
    print(f"  Mean: {df['Duration (in seconds)'].mean():7.1f}s")
    print(f"  Std:  {df['Duration (in seconds)'].std():7.1f}s")
    print(f"  Min:  {df['Duration (in seconds)'].min():7.1f}s")
    print(f"  Max:  {df['Duration (in seconds)'].max():7.1f}s")

    # Speed tiers
    df['Speed_Tier'] = pd.cut(df['Duration (in seconds)'],
                               bins=[0, 300, 480, 600, 1000, np.inf],
                               labels=['Very Fast (<5min)', 'Fast (5-8min)', 'Normal (8-10min)', 'Slow (10-17min)', 'Very Slow (>17min)'])

    print(f"\nSpeed Tiers:")
    for tier in ['Very Fast (<5min)', 'Fast (5-8min)', 'Normal (8-10min)', 'Slow (10-17min)', 'Very Slow (>17min)']:
        count = (df['Speed_Tier'] == tier).sum()
        print(f"  {tier:20s}: {count:3d} ({count/len(df)*100:5.1f}%)")

    # Demographics
    print(f"\nDemographic Frequencies:")

    for col in DEMO_COLS:
        print(f"\n  {col}:")
        value_counts = df[col].value_counts().head(10)
        for value, count in value_counts.items():
            if pd.notna(value):
                # Truncate long values
                val_str = str(value)[:50]
                print(f"    {val_str:50s}: {count:3d} ({count/len(df)*100:5.1f}%)")

    # ========================================================================
    # 7. MISSING DATA ANALYSIS
    # ========================================================================

    print("\n\n7. MISSING DATA ANALYSIS")
    print("-" * 80)

    all_item_cols = BARRIER_ITEM_COLS + READINESS_ITEM_COLS + MATURITY_ITEM_COLS

    print(f"\nItem-Level Missingness Rates:")
    print(f"  Barriers:")
    for col in BARRIER_ITEM_COLS:
        missing = df[col].isna().sum()
        print(f"    {col}: {missing:3d} ({missing/len(df)*100:5.1f}%)")

    print(f"\n  Readiness:")
    for col in READINESS_ITEM_COLS:
        missing = df[col].isna().sum()
        print(f"    {col}: {missing:3d} ({missing/len(df)*100:5.1f}%)")

    print(f"\n  Maturity:")
    for col in MATURITY_ITEM_COLS:
        missing = df[col].isna().sum()
        print(f"    {col}: {missing:3d} ({missing/len(df)*100:5.1f}%)")

    # "Don't Know" rates
    print(f"\n\"Don't Know\" Rates (readiness & maturity):")
    print(f"  Readiness:")
    for col in READINESS_ITEM_COLS:
        dk_count = (df_raw[col] == "Don't Know").sum()
        print(f"    {col}: {dk_count:3d} ({dk_count/len(df)*100:5.1f}%)")

    print(f"\n  Maturity:")
    for col in MATURITY_ITEM_COLS:
        dk_count = (df_raw[col] == "Don't Know").sum()
        print(f"    {col}: {dk_count:3d} ({dk_count/len(df)*100:5.1f}%)")

    # Person-level completeness
    df['N_Complete'] = df[all_item_cols].notna().sum(axis=1)
    df['Completeness'] = df['N_Complete'] / len(all_item_cols)

    print(f"\nPerson-Level Completeness:")
    print(f"  Mean: {df['N_Complete'].mean():.2f}/{len(all_item_cols)} items")
    print(f"  Std:  {df['N_Complete'].std():.2f}")
    print(f"  Min:  {df['N_Complete'].min():.0f}")
    print(f"  Max:  {df['N_Complete'].max():.0f}")
    print(f"\n  Distribution:")
    for threshold in [95, 90, 80, 70, 50]:
        n = (df['Completeness'] >= threshold/100).sum()
        print(f"    ≥{threshold}% complete: {n:3d} ({n/len(df)*100:5.1f}%)")

    # ========================================================================
    # 8. RESPONSE QUALITY INDICATORS
    # ========================================================================

    print("\n\n8. RESPONSE QUALITY INDICATORS")
    print("-" * 80)

    # Straightlining
    df['StraightLine_Barrier'] = df.apply(lambda row: straightlining_rate(row, BARRIER_ITEM_COLS), axis=1)
    df['StraightLine_Readiness'] = df.apply(lambda row: straightlining_rate(row, READINESS_ITEM_COLS), axis=1)
    df['StraightLine_Maturity'] = df.apply(lambda row: straightlining_rate(row, MATURITY_ITEM_COLS), axis=1)

    print(f"\nStraightlining Rates (same response for all items):")

    print(f"  Barriers:")
    sl = df['StraightLine_Barrier'].dropna()
    if len(sl) > 0:
        straightliners = (sl >= 1.0).sum()
        print(f"    Mean straightline rate: {sl.mean():.4f}")
        print(f"    100% straightlined: {straightliners:3d} ({straightliners/len(sl)*100:5.1f}%)")

    print(f"  Readiness:")
    sl = df['StraightLine_Readiness'].dropna()
    if len(sl) > 0:
        straightliners = (sl >= 1.0).sum()
        print(f"    Mean straightline rate: {sl.mean():.4f}")
        print(f"    100% straightlined: {straightliners:3d} ({straightliners/len(sl)*100:5.1f}%)")

    print(f"  Maturity:")
    sl = df['StraightLine_Maturity'].dropna()
    if len(sl) > 0:
        straightliners = (sl >= 1.0).sum()
        print(f"    Mean straightline rate: {sl.mean():.4f}")
        print(f"    100% straightlined: {straightliners:3d} ({straightliners/len(sl)*100:5.1f}%)")

    # Low variance respondents
    print(f"\nLow Variance Respondents (SD < 0.5 per scale):")

    for name, cols in [("Barriers", BARRIER_ITEM_COLS),
                        ("Readiness", READINESS_ITEM_COLS),
                        ("Maturity", MATURITY_ITEM_COLS)]:
        low_var = []
        for idx, row in df.iterrows():
            values = row[cols].dropna()
            if len(values) >= 2 and values.std() < 0.5:
                low_var.append(idx)

        print(f"  {name}: {len(low_var):3d} ({len(low_var)/len(df)*100:5.1f}%)")

    # Extreme responding
    print(f"\nExtreme Responding (>80% endpoints):")

    for name, cols in [("Barriers", BARRIER_ITEM_COLS),
                        ("Readiness", READINESS_ITEM_COLS),
                        ("Maturity", MATURITY_ITEM_COLS)]:
        extreme = []
        for idx, row in df.iterrows():
            values = row[cols].dropna()
            if len(values) >= 2:
                endpoints = ((values == values.min()) | (values == values.max())).sum()
                if endpoints / len(values) > 0.80:
                    extreme.append(idx)

        print(f"  {name}: {len(extreme):3d} ({len(extreme)/len(df)*100:5.1f}%)")

    # Central tendency bias
    print(f"\nCentral Tendency Bias (>80% midpoint):")

    for name, cols in [("Barriers", BARRIER_ITEM_COLS),
                        ("Readiness", READINESS_ITEM_COLS),
                        ("Maturity", MATURITY_ITEM_COLS)]:
        central = []
        for idx, row in df.iterrows():
            values = row[cols].dropna()
            if len(values) >= 2:
                midpoint = (values == 3).sum()  # Assuming 5-point scale, 3 is middle
                if midpoint / len(values) > 0.80:
                    central.append(idx)

        print(f"  {name}: {len(central):3d} ({len(central)/len(df)*100:5.1f}%)")

    # Mahalanobis distance outliers
    print(f"\nMahalanobis Distance Outlier Detection (p < 0.05):")

    for name, cols in [("Barriers", BARRIER_ITEM_COLS),
                        ("Readiness", READINESS_ITEM_COLS),
                        ("Maturity", MATURITY_ITEM_COLS)]:
        distances = mahalanobis_distance(df[cols])
        if distances:
            # Chi-square critical value for p=0.05, df=n_items (compare against D²)
            chi2_critical = stats.chi2.ppf(0.95, len(cols))
            outliers = [idx for idx, d in distances.items() if d**2 > chi2_critical]
            print(f"  {name}: {len(outliers):3d} outliers (out of {len(distances)} cases)")

    # ========================================================================
    # 9. DISTRIBUTIONAL PROPERTIES
    # ========================================================================

    print("\n\n9. DISTRIBUTIONAL PROPERTIES")
    print("-" * 80)

    print(f"\nSkewness and Kurtosis (using person-level means):")

    for name, cols in [("Barriers", BARRIER_ITEM_COLS),
                        ("Readiness", READINESS_ITEM_COLS),
                        ("Maturity", MATURITY_ITEM_COLS)]:
        data = person_means(df, cols).dropna()
        if len(data) >= 3:
            skewness = stats.skew(data)
            kurtosis = stats.kurtosis(data)
            print(f"  {name}:")
            print(f"    Skewness: {skewness:8.4f} {'(normal range: -2 to +2)' if -2 <= skewness <= 2 else '(outside normal range)'}")
            print(f"    Kurtosis: {kurtosis:8.4f} {'(normal range: -3 to +3)' if -3 <= kurtosis <= 3 else '(outside normal range)'}")

    # Shapiro-Wilk normality tests
    print(f"\nShapiro-Wilk Normality Tests:")

    for name, cols in [("Barriers", BARRIER_ITEM_COLS),
                        ("Readiness", READINESS_ITEM_COLS),
                        ("Maturity", MATURITY_ITEM_COLS)]:
        data = person_means(df, cols).dropna()
        if len(data) >= 3:
            stat, p = shapiro(data)
            print(f"  {name}: W={stat:.4f}, p={p:.4f} {'✗ Not normal (p<0.05)' if p < 0.05 else '✓ Normal (p≥0.05)'}")

    # Range utilization
    print(f"\nRange Utilization (all response values observed):")

    for name, cols in [("Barriers", BARRIER_ITEM_COLS),
                        ("Readiness", READINESS_ITEM_COLS),
                        ("Maturity", MATURITY_ITEM_COLS)]:
        all_values = df[cols].dropna().values.flatten()
        unique_vals = len(np.unique(all_values))
        print(f"  {name}: {unique_vals} unique values (out of 5 possible)")

    # Floor/ceiling effects
    print(f"\nFloor/Ceiling Effects (>15% at endpoints):")

    for name, cols in [("Barriers", BARRIER_ITEM_COLS),
                        ("Readiness", READINESS_ITEM_COLS),
                        ("Maturity", MATURITY_ITEM_COLS)]:
        data = df[cols].dropna()
        if len(data) > 0:
            floor = (data == 1).sum().sum() / (len(data) * len(cols))
            ceiling = (data == 5).sum().sum() / (len(data) * len(cols))
            print(f"  {name}:")
            print(f"    Floor (1): {floor*100:5.1f}% {'✗ Problematic' if floor > 0.15 else '✓ OK'}")
            print(f"    Ceiling (5): {ceiling*100:5.1f}% {'✗ Problematic' if ceiling > 0.15 else '✓ OK'}")

    # ========================================================================
    # 10. COMMON METHOD VARIANCE ASSESSMENT
    # ========================================================================

    print("\n\n10. COMMON METHOD VARIANCE ASSESSMENT")
    print("-" * 80)

    # Harman's single-factor test
    print(f"\nHarman's Single-Factor Test:")

    for name, cols in [("Barriers", BARRIER_ITEM_COLS),
                        ("Readiness", READINESS_ITEM_COLS),
                        ("Maturity", MATURITY_ITEM_COLS)]:
        var_explained = harman_single_factor(df[cols])
        if not np.isnan(var_explained):
            print(f"  {name}: {var_explained*100:6.2f}% variance from first factor")
            if var_explained > 0.50:
                print(f"    WARNING: >50% suggests potential CMV")
            else:
                print(f"    OK: <50% threshold")

    # Across all constructs
    all_items_df = df[all_item_cols]
    all_var = harman_single_factor(all_items_df)
    if not np.isnan(all_var):
        print(f"\n  All Constructs Combined: {all_var*100:6.2f}% variance from first factor")
        if all_var > 0.50:
            print(f"    WARNING: >50% suggests potential CMV")
        else:
            print(f"    OK: <50% threshold")

    # ========================================================================
    # 11. IRI SELECTION BIAS DEEP-DIVE
    # ========================================================================

    print("\n\n11. IRI SELECTION BIAS DEEP-DIVE")
    print("-" * 80)

    # Demographic comparison: clean vs excluded
    print(f"\nDemographic Comparison: Clean (IRI Pass) vs Excluded (IRI Fail)")

    clean_group = df[df['IRI_All_Pass']]
    excluded_group = df[~df['IRI_All_Pass']]

    for col in DEMO_COLS:
        if df[col].dtype == 'object':
            # Chi-square for categorical
            contingency = pd.crosstab(df[col], df['IRI_All_Pass'], margins=False)
            try:
                chi2, p_chi, dof, expected = chi2_contingency(contingency)
                print(f"\n  {col}:")
                print(f"    Chi-square: χ²={chi2:.4f}, p={p_chi:.4f}")

                # Top values in each group
                clean_vals = clean_group[col].value_counts().head(3)
                excl_vals = excluded_group[col].value_counts().head(3)

                print(f"    Clean top 3:")
                for val, count in clean_vals.items():
                    print(f"      {str(val)[:40]:40s}: {count:3d}")
                print(f"    Excluded top 3:")
                for val, count in excl_vals.items():
                    print(f"      {str(val)[:40]:40s}: {count:3d}")
            except:
                pass

    # Construct mean comparison: clean vs excluded
    print(f"\n\nConstruct Means: Clean vs Excluded")

    print(f"\n  Barriers:")
    clean_data = person_means(clean_group[BARRIER_ITEM_COLS], BARRIER_ITEM_COLS).dropna()
    excl_data = person_means(excluded_group[BARRIER_ITEM_COLS], BARRIER_ITEM_COLS).dropna()

    if len(clean_data) > 0 and len(excl_data) > 0:
        t_stat, p_val = ttest_ind(clean_data, excl_data)
        cohens_d = (clean_data.mean() - excl_data.mean()) / np.sqrt((clean_data.std()**2 + excl_data.std()**2) / 2)

        print(f"    Clean Mean: {clean_data.mean():.4f} (n={len(clean_data)})")
        print(f"    Excl Mean:  {excl_data.mean():.4f} (n={len(excl_data)})")
        print(f"    t-test: t={t_stat:.4f}, p={p_val:.4f}")
        print(f"    Cohen's d: {cohens_d:.4f}")

    print(f"\n  Readiness:")
    clean_data = person_means(clean_group[READINESS_ITEM_COLS], READINESS_ITEM_COLS).dropna()
    excl_data = person_means(excluded_group[READINESS_ITEM_COLS], READINESS_ITEM_COLS).dropna()

    if len(clean_data) > 0 and len(excl_data) > 0:
        t_stat, p_val = ttest_ind(clean_data, excl_data)
        cohens_d = (clean_data.mean() - excl_data.mean()) / np.sqrt((clean_data.std()**2 + excl_data.std()**2) / 2)

        print(f"    Clean Mean: {clean_data.mean():.4f} (n={len(clean_data)})")
        print(f"    Excl Mean:  {excl_data.mean():.4f} (n={len(excl_data)})")
        print(f"    t-test: t={t_stat:.4f}, p={p_val:.4f}")
        print(f"    Cohen's d: {cohens_d:.4f}")

    print(f"\n  Maturity:")
    clean_data = person_means(clean_group[MATURITY_ITEM_COLS], MATURITY_ITEM_COLS).dropna()
    excl_data = person_means(excluded_group[MATURITY_ITEM_COLS], MATURITY_ITEM_COLS).dropna()

    if len(clean_data) > 0 and len(excl_data) > 0:
        t_stat, p_val = ttest_ind(clean_data, excl_data)
        cohens_d = (clean_data.mean() - excl_data.mean()) / np.sqrt((clean_data.std()**2 + excl_data.std()**2) / 2)

        print(f"    Clean Mean: {clean_data.mean():.4f} (n={len(clean_data)})")
        print(f"    Excl Mean:  {excl_data.mean():.4f} (n={len(excl_data)})")
        print(f"    t-test: t={t_stat:.4f}, p={p_val:.4f}")
        print(f"    Cohen's d: {cohens_d:.4f}")

    # Correlation structure: clean vs all-V2
    print(f"\n\nCorrelation Structure: Clean vs All-V2 (sensitivity analysis)")

    # All V2 responses
    all_v2 = encode_scales(df_all[df_all['IsV2']].copy())

    print(f"\n  Barriers ↔ Readiness:")

    # Clean
    clean_b = person_means(clean_group[BARRIER_ITEM_COLS], BARRIER_ITEM_COLS).dropna()
    clean_r = person_means(clean_group[READINESS_ITEM_COLS], READINESS_ITEM_COLS).dropna()
    clean_corr = clean_b.corr(clean_r) if len(clean_b) > 0 and len(clean_r) > 0 else np.nan

    # All V2
    all_b = person_means(all_v2[BARRIER_ITEM_COLS], BARRIER_ITEM_COLS).dropna()
    all_r = person_means(all_v2[READINESS_ITEM_COLS], READINESS_ITEM_COLS).dropna()
    all_corr = all_b.corr(all_r) if len(all_b) > 0 and len(all_r) > 0 else np.nan

    print(f"    Clean sample: r={clean_corr:.4f}")
    print(f"    All V2:       r={all_corr:.4f}")
    print(f"    Δ: {all_corr - clean_corr:+.4f}")

    print(f"\n  Barriers ↔ Maturity:")

    # Clean
    clean_m = person_means(clean_group[MATURITY_ITEM_COLS], MATURITY_ITEM_COLS).dropna()
    clean_corr = clean_b.corr(clean_m) if len(clean_b) > 0 and len(clean_m) > 0 else np.nan

    # All V2
    all_m = person_means(all_v2[MATURITY_ITEM_COLS], MATURITY_ITEM_COLS).dropna()
    all_corr = all_b.corr(all_m) if len(all_b) > 0 and len(all_m) > 0 else np.nan

    print(f"    Clean sample: r={clean_corr:.4f}")
    print(f"    All V2:       r={all_corr:.4f}")
    print(f"    Δ: {all_corr - clean_corr:+.4f}")

    print(f"\n  Readiness ↔ Maturity:")

    # Clean
    clean_corr = clean_r.corr(clean_m) if len(clean_r) > 0 and len(clean_m) > 0 else np.nan

    # All V2
    all_corr = all_r.corr(all_m) if len(all_r) > 0 and len(all_m) > 0 else np.nan

    print(f"    Clean sample: r={clean_corr:.4f}")
    print(f"    All V2:       r={all_corr:.4f}")
    print(f"    Δ: {all_corr - clean_corr:+.4f}")

    # ========================================================================
    # SUMMARY
    # ========================================================================

    print("\n\n" + "="*80)
    print("SUMMARY & RECOMMENDATIONS")
    print("="*80)

    print(f"\nInstrument Status:")
    print(f"  • Barriers Scale: {len(BARRIER_ITEM_COLS)} items, α≈{cronbach_alpha(df[BARRIER_ITEM_COLS]):.4f}")
    print(f"  • Readiness Scale: {len(READINESS_ITEM_COLS)} items, α≈{cronbach_alpha(df[READINESS_ITEM_COLS]):.4f}")
    print(f"  • Maturity Scale: {len(MATURITY_ITEM_COLS)} items, α≈{cronbach_alpha(df[MATURITY_ITEM_COLS]):.4f}")

    print(f"\nData Quality:")
    print(f"  • Clean (V2 + Duration≥480s + IRI): {n_clean} respondents ({n_clean/len(df)*100:.1f}%)")
    print(f"  • IRI Pass Rate: {n_iri_pass/len(df)*100:.1f}%")
    print(f"  • Average Completeness: {df['Completeness'].mean()*100:.1f}%")

    print(f"\nKey Findings:")
    alpha_b = cronbach_alpha(df[BARRIER_ITEM_COLS])
    alpha_r = cronbach_alpha(df[READINESS_ITEM_COLS])
    alpha_m = cronbach_alpha(df[MATURITY_ITEM_COLS])

    if alpha_b > 0.70:
        print(f"  ✓ Barriers scale has acceptable internal consistency (α={alpha_b:.4f})")
    else:
        print(f"  ✗ Barriers scale has low internal consistency (α={alpha_b:.4f})")

    if alpha_r > 0.70:
        print(f"  ✓ Readiness scale has acceptable internal consistency (α={alpha_r:.4f})")
    else:
        print(f"  ✗ Readiness scale has low internal consistency (α={alpha_r:.4f})")

    if alpha_m > 0.70:
        print(f"  ✓ Maturity scale has acceptable internal consistency (α={alpha_m:.4f})")
    else:
        print(f"  ✗ Maturity scale has low internal consistency (α={alpha_m:.4f})")

    if n_clean >= 30:
        print(f"  ✓ Clean sample size ({n_clean}) adequate for analysis")
    else:
        print(f"  ✗ Clean sample size ({n_clean}) may be insufficient")

    print(f"\n" + "="*80)
    print(f"Report generation complete: {datetime.now().astimezone().isoformat(timespec='seconds')}")
    print("="*80 + "\n")

if __name__ == '__main__':
    main()
