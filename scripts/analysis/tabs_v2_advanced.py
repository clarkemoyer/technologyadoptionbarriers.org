#!/usr/bin/env python3
"""
TABS V2 Advanced Statistical Analysis
======================================
Inferential statistics, factor analysis (PCA), interaction effects,
and demographic deep-dive cuts.

Uses scipy + numpy for statistical tests.
"""

import csv, math, sys
import numpy as np
from scipy import stats as sp
from collections import Counter, defaultdict

# ── Config ────────────────────────────────────────────────────
if len(sys.argv) < 2:
    print("Usage: python tabs_v2_advanced.py <qualtrics_csv_path>")
    sys.exit(1)
CSV_PATH = sys.argv[1]
V2_START = "2026-03-23 14:00:00"
MIN_DUR = 480

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
READINESS_COLS = [f"Q47-64_Readiness_{i}" for i in range(1, 18)]
MATURITY_COLS = [f"Q65-73_Maturity_{i}" for i in range(1, 9)]
IRI_B, IRI_R, IRI_M = "Q10-28_Barriers_19", "Q47-64_Readiness_18", "Q65-73_Maturity_9"

BARRIER_NAMES = [
    "Resistance to Change", "Lack of Leadership Support", "Risk-Averse Culture",
    "Insufficient Workforce Skills", "Inadequate Training", "High Implementation Cost",
    "Legacy System Integration", "Inadequate IT Infrastructure",
    "Difficulty Demonstrating Value", "No Clear Strategy/Roadmap",
    "Insufficient Governance", "Workflow Disruption", "Cybersecurity Concerns",
    "Data Privacy Compliance", "Lack of Trust in Tech/Vendors",
    "Regulatory Complexity", "External Pressure Without Readiness",
    "Vendor/Partner Difficulty"
]
READINESS_NAMES = [
    "Vision/Leadership", "Tech-Strategy Alignment", "IT Gov. Effectiveness",
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

def map_role(raw):
    """Map raw Qualtrics role string to short label using prefix matching."""
    if not raw:
        return 'Unknown'
    prefixes = [
        ("CEO", "CEO"), ("CFO", "CFO"), ("CIO", "CIO"), ("CMO", "CMO"),
        ("COO", "COO"), ("CHRO", "CHRO"), ("CTO", "CTO"), ("CSO", "CSO"),
        ("CRO", "CRO"),
    ]
    for prefix, label in prefixes:
        if raw.startswith(prefix):
            return label
    if 'Other' in raw:
        return 'Other'
    return 'Other'

# ── Load & filter ─────────────────────────────────────────────
def load():
    with open(CSV_PATH, newline='', encoding='utf-8-sig') as f:
        reader = csv.reader(f)
        hdr = next(reader)
        next(reader); next(reader)  # skip Qualtrics sub-headers
        idx = {h: i for i, h in enumerate(hdr)}
        rows = []
        for r in reader:
            if r[idx['StartDate']] < V2_START:
                continue
            try:
                dur = float(r[idx['Duration (in seconds)']])
            except (ValueError, KeyError):
                continue
            if dur < MIN_DUR:
                continue
            iri_b = r[idx[IRI_B]] == "Major Barrier"
            iri_r = r[idx[IRI_R]] == "Low Readiness/Capability"
            iri_m = r[idx[IRI_M]] == "Level 2: Developing/Repeatable"
            if not (iri_b and iri_r and iri_m):
                continue
            rows.append(r)
        return hdr, idx, rows

def score(row, idx, cols, scale):
    vals = []
    for c in cols:
        v = row[idx[c]]
        if v in scale:
            vals.append(scale[v])
    return vals

def person_mean(row, idx, cols, scale):
    vals = score(row, idx, cols, scale)
    return sum(vals) / len(vals) if vals else None

def item_vectors(rows, idx, cols, scale):
    """Return list of numpy arrays, one per item."""
    vecs = []
    for c in cols:
        v = []
        for r in rows:
            val = r[idx[c]]
            if val in scale:
                v.append(scale[val])
            else:
                v.append(np.nan)
        vecs.append(np.array(v))
    return vecs

hdr, idx, rows = load()
N = len(rows)
print(f"{'='*80}")
print(f"  TABS V2 ADVANCED STATISTICAL ANALYSIS")
print(f"  Clean N = {N}")
print(f"{'='*80}")

# Compute person-level means
B = [person_mean(r, idx, BARRIER_COLS, BARRIER_SCALE) for r in rows]
R = [person_mean(r, idx, READINESS_COLS, READINESS_SCALE) for r in rows]
M = [person_mean(r, idx, MATURITY_COLS, MATURITY_SCALE) for r in rows]

B_arr = np.array([x for x in B if x is not None])
R_arr = np.array([x for x in R if x is not None])
M_arr = np.array([x for x in M if x is not None])

# ══════════════════════════════════════════════════════════════
# SECTION 1: INFERENTIAL STATISTICS
# ══════════════════════════════════════════════════════════════
print(f"\n{'='*80}")
print(f"  SECTION 1: INFERENTIAL STATISTICS")
print(f"{'='*80}")

# 1a. One-sample t-tests vs scale midpoint (3.0)
print(f"\n  1A: One-Sample t-tests vs Midpoint (3.0)")
print(f"  {'Construct':<20} {'M':>6} {'SD':>6} {'t':>8} {'df':>4} {'p':>10} {'d':>6}")
print(f"  {'─'*20} {'─'*6} {'─'*6} {'─'*8} {'─'*4} {'─'*10} {'─'*6}")
for name, arr in [("Barriers", B_arr), ("Readiness", R_arr), ("Maturity", M_arr)]:
    t, p = sp.ttest_1samp(arr, 3.0)
    d = (arr.mean() - 3.0) / arr.std(ddof=1)
    print(f"  {name:<20} {arr.mean():>6.2f} {arr.std(ddof=1):>6.2f} {t:>8.3f} {len(arr)-1:>4} {p:>10.6f} {d:>6.2f}")

# 1b. Independent t-tests: Tech vs Non-Tech
print(f"\n  1B: Independent t-tests - Tech (CIO/CTO) vs Non-Tech")
tech_idx_list = [i for i, r in enumerate(rows) if map_role(r[idx['Q1_Role']]) in ('CIO', 'CTO')]
nontech_idx_list = [i for i, r in enumerate(rows) if map_role(r[idx['Q1_Role']]) in ('CEO','CFO','CMO','COO','CHRO','CSO','CRO')]
print(f"  Tech n={len(tech_idx_list)}, Non-Tech n={len(nontech_idx_list)}")
print(f"  {'Construct':<12} {'Tech M':>7} {'NT M':>7} {'t':>8} {'df':>6} {'p':>10} {'d':>6} {'95% CI d':>16}")
print(f"  {'─'*12} {'─'*7} {'─'*7} {'─'*8} {'─'*6} {'─'*10} {'─'*6} {'─'*16}")

for name, vals in [("Barriers", B), ("Readiness", R), ("Maturity", M)]:
    tech = np.array([vals[i] for i in tech_idx_list if vals[i] is not None])
    nt = np.array([vals[i] for i in nontech_idx_list if vals[i] is not None])
    if len(tech) < 2 or len(nt) < 2:
        print(f"  {name:<12}  - skipped (insufficient group size: tech={len(tech)}, nontech={len(nt)})")
        continue
    t, p = sp.ttest_ind(tech, nt, equal_var=False)  # Welch's t
    pooled_sd = np.sqrt(((len(tech)-1)*tech.var(ddof=1) + (len(nt)-1)*nt.var(ddof=1)) / (len(tech)+len(nt)-2))
    d = (tech.mean() - nt.mean()) / pooled_sd
    se_d = np.sqrt((len(tech)+len(nt))/(len(tech)*len(nt)) + d**2/(2*(len(tech)+len(nt))))
    ci_lo, ci_hi = d - 1.96*se_d, d + 1.96*se_d
    print(f"  {name:<12} {tech.mean():>7.2f} {nt.mean():>7.2f} {t:>8.3f} {len(tech)+len(nt)-2:>6} {p:>10.6f} {d:>+6.2f} [{ci_lo:>+.2f}, {ci_hi:>+.2f}]")

# 1c. Independent t-test: Large vs Small/Med org
print(f"\n  1C: Independent t-tests - Large (\u226510K) vs Small/Med Orgs")
large_idx = [i for i, r in enumerate(rows) if r[idx['Q4_OrgSize']] in ('5000-9999', '10000+')]
small_idx = [i for i, r in enumerate(rows) if r[idx['Q4_OrgSize']] in ('<100', '100-499', '500-999', '1000-4999')]
print(f"  Large n={len(large_idx)}, Small/Med n={len(small_idx)}")
print(f"  {'Construct':<12} {'Large M':>8} {'SM M':>7} {'t':>8} {'p':>10} {'d':>6}")
print(f"  {'─'*12} {'─'*8} {'─'*7} {'─'*8} {'─'*10} {'─'*6}")
for name, vals in [("Barriers", B), ("Readiness", R), ("Maturity", M)]:
    lg = np.array([vals[i] for i in large_idx if vals[i] is not None])
    sm = np.array([vals[i] for i in small_idx if vals[i] is not None])
    t, p = sp.ttest_ind(lg, sm, equal_var=False)
    pooled_sd = np.sqrt(((len(lg)-1)*lg.var(ddof=1) + (len(sm)-1)*sm.var(ddof=1)) / (len(lg)+len(sm)-2))
    d = (lg.mean() - sm.mean()) / pooled_sd
    print(f"  {name:<12} {lg.mean():>8.2f} {sm.mean():>7.2f} {t:>8.3f} {p:>10.6f} {d:>+6.2f}")

# 1d. One-way ANOVA: Decision Authority (3 levels)
print(f"\n  1D: One-Way ANOVA - Decision Authority")
auth_groups = defaultdict(list)
for i, r in enumerate(rows):
    a = r[idx['Q2_DecisionAuth']].lower()
    if 'primary decision' in a: auth_groups['Primary'].append(i)
    elif 'several key decision' in a or 'collectively' in a: auth_groups['Shared'].append(i)
    elif 'input' in a or 'recommend' in a: auth_groups['Input'].append(i)
    elif 'limited' in a or 'implement' in a: auth_groups['Input'].append(i)  # group limited with input

for name, vals in [("Barriers", B), ("Readiness", R), ("Maturity", M)]:
    groups = []
    labels = []
    for lbl in ['Primary', 'Shared', 'Input']:
        if lbl in auth_groups:
            g = np.array([vals[j] for j in auth_groups[lbl] if vals[j] is not None])
            groups.append(g)
            labels.append(f"{lbl}(n={len(g)})")
    if len(groups) >= 2:
        F, p = sp.f_oneway(*groups)
        # Eta-squared
        grand = np.concatenate(groups)
        ss_between = sum(len(g) * (g.mean() - grand.mean())**2 for g in groups)
        ss_total = np.sum((grand - grand.mean())**2)
        eta2 = ss_between / ss_total if ss_total > 0 else 0
        print(f"  {name:<12}: F({len(groups)-1},{len(grand)-len(groups)})={F:.3f}, p={p:.6f}, η²={eta2:.3f}")
        for lbl, g in zip(labels, groups):
            print(f"    {lbl}: M={g.mean():.2f}, SD={g.std(ddof=1):.2f}")

# 1e. One-way ANOVA: Org Size (3 levels: small, medium, large)
print(f"\n  1E: One-Way ANOVA - Organization Size (3 groups)")
size_groups = {'Small': [], 'Medium': [], 'Large': []}
for i, r in enumerate(rows):
    s = r[idx['Q4_OrgSize']]
    if s in ('<100', '100-499'): size_groups['Small'].append(i)
    elif s in ('500-999', '1000-4999'): size_groups['Medium'].append(i)
    elif s in ('5000-9999', '10000+'): size_groups['Large'].append(i)

for name, vals in [("Barriers", B), ("Readiness", R), ("Maturity", M)]:
    groups = []
    labels = []
    for lbl in ['Small', 'Medium', 'Large']:
        g = np.array([vals[j] for j in size_groups[lbl] if vals[j] is not None])
        groups.append(g)
        labels.append(f"{lbl}(n={len(g)})")
    F, p = sp.f_oneway(*groups)
    grand = np.concatenate(groups)
    ss_between = sum(len(g) * (g.mean() - grand.mean())**2 for g in groups)
    ss_total = np.sum((grand - grand.mean())**2)
    eta2 = ss_between / ss_total if ss_total > 0 else 0
    print(f"  {name:<12}: F({len(groups)-1},{len(grand)-len(groups)})={F:.3f}, p={p:.6f}, η²={eta2:.3f}")
    for lbl, g in zip(labels, groups):
        print(f"    {lbl}: M={g.mean():.2f}, SD={g.std(ddof=1):.2f}")

# 1f. Pearson correlations with p-values
print(f"\n  1F: Construct Correlations with Significance")
# Align arrays (only include respondents with all 3 non-None)
aligned = [(b, r, m) for b, r, m in zip(B, R, M) if b is not None and r is not None and m is not None]
ba, ra, ma = np.array([x[0] for x in aligned]), np.array([x[1] for x in aligned]), np.array([x[2] for x in aligned])
for pair, x, y in [("B-R", ba, ra), ("B-M", ba, ma), ("R-M", ra, ma)]:
    r_val, p_val = sp.pearsonr(x, y)
    n = len(x)
    # Fisher z CI
    z = np.arctanh(r_val)
    se = 1 / np.sqrt(n - 3)
    z_lo, z_hi = z - 1.96*se, z + 1.96*se
    r_lo, r_hi = np.tanh(z_lo), np.tanh(z_hi)
    print(f"  {pair}: r={r_val:+.3f}, p={p_val:.2e}, 95% CI [{r_lo:+.3f}, {r_hi:+.3f}], n={n}")

# ══════════════════════════════════════════════════════════════
# SECTION 2: FACTOR ANALYSIS / PCA
# ══════════════════════════════════════════════════════════════
print(f"\n{'='*80}")
print(f"  SECTION 2: PRINCIPAL COMPONENT ANALYSIS (PCA)")
print(f"{'='*80}")

# Build full item matrix (43 items × N respondents)
all_cols = BARRIER_COLS + READINESS_COLS + MATURITY_COLS
all_scales = [BARRIER_SCALE]*18 + [READINESS_SCALE]*17 + [MATURITY_SCALE]*8
all_names = BARRIER_NAMES + READINESS_NAMES + MATURITY_NAMES

matrix = []
for r in rows:
    row_vals = []
    for c, sc in zip(all_cols, all_scales):
        v = r[idx[c]]
        row_vals.append(sc.get(v, np.nan))
    matrix.append(row_vals)
X = np.array(matrix)

# Impute missing with column means
col_means = np.nanmean(X, axis=0)
for j in range(X.shape[1]):
    mask = np.isnan(X[:, j])
    X[mask, j] = col_means[j]

# Standardize
X_std = (X - X.mean(axis=0)) / X.std(axis=0, ddof=0)

# Correlation matrix & eigendecomposition
corr = np.corrcoef(X_std.T)
eigenvalues, eigenvectors = np.linalg.eigh(corr)
# Sort descending
order = np.argsort(eigenvalues)[::-1]
eigenvalues = eigenvalues[order]
eigenvectors = eigenvectors[:, order]

# Scree data
total_var = eigenvalues.sum()
print(f"\n  2A: Eigenvalues & Variance Explained (top 10)")
print(f"  {'PC':>4} {'Eigenvalue':>11} {'% Var':>8} {'Cum %':>8}")
print(f"  {'─'*4} {'─'*11} {'─'*8} {'─'*8}")
cum = 0
for i in range(min(10, len(eigenvalues))):
    pct = 100 * eigenvalues[i] / total_var
    cum += pct
    marker = " ←" if eigenvalues[i] > 1 else ""
    print(f"  {i+1:>4} {eigenvalues[i]:>11.3f} {pct:>7.1f}% {cum:>7.1f}%{marker}")

n_above_1 = sum(1 for e in eigenvalues if e > 1)
print(f"\n  Components with eigenvalue > 1 (Kaiser criterion): {n_above_1}")

# 2B: Loadings on first 3 components (varimax-like inspection)
print(f"\n  2B: Item Loadings on First 3 Components")
print(f"  {'Item':<40} {'PC1':>7} {'PC2':>7} {'PC3':>7} {'Scale':>3}")
print(f"  {'─'*40} {'─'*7} {'─'*7} {'─'*7} {'─'*3}")

# Loadings = eigenvector * sqrt(eigenvalue)
loadings = eigenvectors[:, :3] * np.sqrt(eigenvalues[:3])

for i, name in enumerate(all_names):
    scale_label = 'B' if i < 18 else ('R' if i < 35 else 'M')
    l1, l2, l3 = loadings[i]
    # Bold the dominant loading
    vals = [abs(l1), abs(l2), abs(l3)]
    max_idx = vals.index(max(vals))
    markers = ['', '', '']
    markers[max_idx] = '*'
    print(f"  {name:<40} {l1:>+6.3f}{markers[0]} {l2:>+6.3f}{markers[1]} {l3:>+6.3f}{markers[2]}  {scale_label}")

# 2C: Variance by theoretical scale
print(f"\n  2C: Variance Captured by PC1-PC3 per Theoretical Scale")
for label, start, end in [("Barriers", 0, 18), ("Readiness", 18, 35), ("Maturity", 35, 43)]:
    scale_loadings = loadings[start:end]
    communalities = np.sum(scale_loadings**2, axis=1)
    print(f"  {label}: avg communality (3 PCs) = {communalities.mean():.3f} (range {communalities.min():.3f}–{communalities.max():.3f})")

# 2D: KMO-like measure (simplified)
print(f"\n  2D: Bartlett's Test of Sphericity")
n_obs = X.shape[0]
p = X.shape[1]
det_corr = np.linalg.det(corr)
if det_corr > 0:
    chi2 = -((n_obs - 1) - (2*p + 5)/6) * np.log(det_corr)
    df_bart = p * (p - 1) / 2
    p_bart = 1 - sp.chi2.cdf(chi2, df_bart)
    print(f"  χ²({int(df_bart)}) = {chi2:.1f}, p {'< .001' if p_bart < .001 else f'= {p_bart:.6f}'}")
    print(f"  Conclusion: {'Reject H0 - correlations are significantly non-zero → PCA appropriate' if p_bart < .05 else 'Fail to reject H0'}")
else:
    print(f"  Correlation matrix is singular (det ≈ 0) - Bartlett's test trivially significant")

# ══════════════════════════════════════════════════════════════
# SECTION 3: INTERACTION EFFECTS
# ══════════════════════════════════════════════════════════════
print(f"\n{'='*80}")
print(f"  SECTION 3: INTERACTION EFFECTS")
print(f"{'='*80}")

# 3A: Org Size × Role Type on Barriers
print(f"\n  3A: Two-Way Interaction - Org Size × Role Type on Barriers")
# Build 2x2: (Small/Med vs Large) × (Tech vs NonTech)
cells = defaultdict(list)
for i, r in enumerate(rows):
    if B[i] is None: continue
    role = map_role(r[idx['Q1_Role']])
    if role in ('CIO', 'CTO'): role_grp = 'Tech'
    elif role in ('CEO','CFO','CMO','COO','CHRO','CSO','CRO'): role_grp = 'NonTech'
    else: continue

    size = r[idx['Q4_OrgSize']]
    if size in ('<100', '100-499', '500-999', '1000-4999'): size_grp = 'Small/Med'
    elif size in ('5000-9999', '10000+'): size_grp = 'Large'
    else: continue

    cells[(size_grp, role_grp)].append(B[i])

print(f"  Cell Means (Barriers):")
print(f"  {'':>15} {'Tech':>12} {'NonTech':>12}")
for sg in ['Small/Med', 'Large']:
    t_vals = cells.get((sg, 'Tech'), [])
    n_vals = cells.get((sg, 'NonTech'), [])
    t_m = f"{np.mean(t_vals):.2f} (n={len(t_vals)})" if t_vals else "-"
    n_m = f"{np.mean(n_vals):.2f} (n={len(n_vals)})" if n_vals else "-"
    print(f"  {sg:>15} {t_m:>12} {n_m:>12}")

# Simple interaction test using 2x2 ANOVA-like approach
all_cells = []
for key in [('Small/Med','Tech'), ('Small/Med','NonTech'), ('Large','Tech'), ('Large','NonTech')]:
    all_cells.append(np.array(cells.get(key, [])))
if all(len(c) > 0 for c in all_cells):
    # Check if large-org effect differs for tech vs non-tech
    tech_diff = np.mean(cells[('Large','Tech')]) - np.mean(cells[('Small/Med','Tech')])
    nt_diff = np.mean(cells[('Large','NonTech')]) - np.mean(cells[('Small/Med','NonTech')])
    print(f"\n  Large-org effect for Tech:    Δ = {tech_diff:+.2f}")
    print(f"  Large-org effect for NonTech: Δ = {nt_diff:+.2f}")
    print(f"  Interaction (difference of differences): {tech_diff - nt_diff:+.2f}")

# 3B: Budget moderates B-R relationship?
print(f"\n  3B: Budget Moderation - Does Budget Adequacy Moderate the B-R Relationship?")
budget_col = 'Q47-64_Readiness_17'
high_budget = []
low_budget = []
for i, r in enumerate(rows):
    if B[i] is None or R[i] is None: continue
    bv = r[idx[budget_col]]
    if bv in READINESS_SCALE:
        score_v = READINESS_SCALE[bv]
        if score_v >= 4: high_budget.append((B[i], R[i]))
        elif score_v <= 2: low_budget.append((B[i], R[i]))

if len(high_budget) >= 5 and len(low_budget) >= 5:
    hb, hr = np.array([x[0] for x in high_budget]), np.array([x[1] for x in high_budget])
    lb, lr = np.array([x[0] for x in low_budget]), np.array([x[1] for x in low_budget])
    r_high, p_high = sp.pearsonr(hb, hr)
    r_low, p_low = sp.pearsonr(lb, lr)
    # Fisher z-test for difference between correlations
    z_h, z_l = np.arctanh(r_high), np.arctanh(r_low)
    se_diff = np.sqrt(1/(len(high_budget)-3) + 1/(len(low_budget)-3))
    z_diff = (z_h - z_l) / se_diff
    p_diff = 2 * (1 - sp.norm.cdf(abs(z_diff)))
    print(f"  High budget (n={len(high_budget)}): B-R r = {r_high:+.3f}, p = {p_high:.4f}")
    print(f"  Low budget  (n={len(low_budget)}):  B-R r = {r_low:+.3f}, p = {p_low:.4f}")
    print(f"  Fisher z-test for difference: z = {z_diff:.3f}, p = {p_diff:.4f}")
    print(f"  {'Budget DOES moderate the B-R relationship' if p_diff < .05 else 'No significant moderation detected (p > .05)'}")

# 3C: Decision Authority × Org Size on Readiness
print(f"\n  3C: Decision Authority × Org Size on Readiness")
auth_size_cells = defaultdict(list)
for i, r in enumerate(rows):
    if R[i] is None: continue
    a = r[idx['Q2_DecisionAuth']].lower()
    if 'primary decision' in a: auth = 'Primary'
    elif 'several key decision' in a or 'collectively' in a: auth = 'Shared'
    elif 'input' in a or 'recommend' in a or 'limited' in a: auth = 'Input'
    else: continue

    size = r[idx['Q4_OrgSize']]
    if size in ('<100', '100-499', '500-999', '1000-4999'): sg = 'Small/Med'
    elif size in ('5000-9999', '10000+'): sg = 'Large'
    else: continue

    auth_size_cells[(auth, sg)].append(R[i])

print(f"  Cell Means (Readiness):")
print(f"  {'':>15} {'Small/Med':>18} {'Large':>18}")
for auth in ['Primary', 'Shared', 'Input']:
    sm = auth_size_cells.get((auth, 'Small/Med'), [])
    lg = auth_size_cells.get((auth, 'Large'), [])
    sm_s = f"{np.mean(sm):.2f} (n={len(sm)})" if sm else "-"
    lg_s = f"{np.mean(lg):.2f} (n={len(lg)})" if lg else "-"
    print(f"  {auth:>15} {sm_s:>18} {lg_s:>18}")

# ══════════════════════════════════════════════════════════════
# SECTION 4: NEW DEMOGRAPHIC CUTS
# ══════════════════════════════════════════════════════════════
print(f"\n{'='*80}")
print(f"  SECTION 4: DEMOGRAPHIC DEEP DIVES")
print(f"{'='*80}")

# 4A: Profit Model (3-way ANOVA)
print(f"\n  4A: Profit Model Comparison")
profit_groups = defaultdict(list)
for i, r in enumerate(rows):
    pm = r[idx['Q5_ProfitModel']]
    if pm: profit_groups[pm].append(i)

for name, vals in [("Barriers", B), ("Readiness", R), ("Maturity", M)]:
    groups = []
    labels = []
    for pm in ['For-Profit', 'Non-Profit', 'Government/Public Sector']:
        if pm in profit_groups:
            g = np.array([vals[j] for j in profit_groups[pm] if vals[j] is not None])
            if len(g) > 0:
                groups.append(g)
                labels.append(pm)
    if len(groups) >= 2:
        F, p = sp.f_oneway(*groups)
        print(f"  {name}: F={F:.3f}, p={p:.4f}")
        for lbl, g in zip(labels, groups):
            print(f"    {lbl}: M={g.mean():.2f} (SD={g.std(ddof=1):.2f}, n={len(g)})")

# 4B: Geographic scope
print(f"\n  4B: Geographic Scope - US vs International")
us_idx = [i for i, r in enumerate(rows) if 'United States' in r[idx['Q8_GeoScope']]]
intl_idx = [i for i, r in enumerate(rows) if r[idx['Q8_GeoScope']] and 'United States' not in r[idx['Q8_GeoScope']]]
print(f"  US n={len(us_idx)}, International n={len(intl_idx)}")
for name, vals in [("Barriers", B), ("Readiness", R), ("Maturity", M)]:
    us = np.array([vals[j] for j in us_idx if vals[j] is not None])
    intl = np.array([vals[j] for j in intl_idx if vals[j] is not None])
    if len(intl) >= 3:
        t, p = sp.ttest_ind(us, intl, equal_var=False)
        print(f"  {name:<12}: US M={us.mean():.2f}, Intl M={intl.mean():.2f}, t={t:.3f}, p={p:.4f}")

# 4C: Revenue/Budget tier
print(f"\n  4C: Revenue/Budget Tier Comparison")
rev_groups = defaultdict(list)
for i, r in enumerate(rows):
    rev = r[idx['Q6_RevenueBudget']]
    if rev: rev_groups[rev].append(i)

print(f"  Revenue tiers found: {len(rev_groups)}")
for tier, indices in sorted(rev_groups.items(), key=lambda x: -len(x[1])):
    if len(indices) >= 5:
        b_vals = np.array([B[j] for j in indices if B[j] is not None])
        r_vals = np.array([R[j] for j in indices if R[j] is not None])
        print(f"  {tier[:50]:<50} n={len(indices):>3}  B={b_vals.mean():.2f}  R={r_vals.mean():.2f}")

# 4D: Role-by-role breakdown
print(f"\n  4D: Role-by-Role Breakdown (all C-suite roles)")
role_data = defaultdict(lambda: {'B': [], 'R': [], 'M': []})
for i, r in enumerate(rows):
    role = map_role(r[idx['Q1_Role']])
    if B[i] is not None: role_data[role]['B'].append(B[i])
    if R[i] is not None: role_data[role]['R'].append(R[i])
    if M[i] is not None: role_data[role]['M'].append(M[i])

print(f"  {'Role':<8} {'n':>4} {'B Mean':>7} {'R Mean':>7} {'M Mean':>7} {'B-R gap':>8}")
print(f"  {'─'*8} {'─'*4} {'─'*7} {'─'*7} {'─'*7} {'─'*8}")
for role in ['CIO', 'CTO', 'CEO', 'CFO', 'CMO', 'COO', 'CHRO', 'CSO', 'CRO', 'Other']:
    if role in role_data and len(role_data[role]['B']) >= 3:
        d = role_data[role]
        bm, rm, mm = np.mean(d['B']), np.mean(d['R']), np.mean(d['M'])
        gap = rm - bm
        print(f"  {role:<8} {len(d['B']):>4} {bm:>7.2f} {rm:>7.2f} {mm:>7.2f} {gap:>+8.2f}")

# 4E: Multiple regression - B predicted by R, M, OrgSize, Role
print(f"\n  4E: Multiple Regression - Barriers predicted by Readiness, Maturity, OrgSize, RoleType")
# Build regression matrix
reg_data = []
for i, r in enumerate(rows):
    if B[i] is None or R[i] is None or M[i] is None: continue
    role = map_role(r[idx['Q1_Role']])
    tech = 1 if role in ('CIO', 'CTO') else 0
    size = r[idx['Q4_OrgSize']]
    large = 1 if size in ('5000-9999', '10000+') else 0
    reg_data.append([B[i], R[i], M[i], tech, large])

reg = np.array(reg_data)
y = reg[:, 0]
X_reg = np.column_stack([np.ones(len(reg)), reg[:, 1:]])  # intercept + 4 predictors
predictor_names = ['Intercept', 'Readiness', 'Maturity', 'Tech Role', 'Large Org']

# OLS
try:
    betas = np.linalg.lstsq(X_reg, y, rcond=None)[0]
    y_pred = X_reg @ betas
    residuals = y - y_pred
    n_reg, k = X_reg.shape
    ss_res = np.sum(residuals**2)
    ss_tot = np.sum((y - y.mean())**2)
    r_sq = 1 - ss_res / ss_tot
    adj_r_sq = 1 - (1 - r_sq) * (n_reg - 1) / (n_reg - k)
    mse = ss_res / (n_reg - k)
    se_betas = np.sqrt(np.diag(mse * np.linalg.inv(X_reg.T @ X_reg)))

    F_reg = ((ss_tot - ss_res) / (k - 1)) / mse
    p_F = 1 - sp.f.cdf(F_reg, k - 1, n_reg - k)

    print(f"  N = {n_reg}, R² = {r_sq:.3f}, Adj R² = {adj_r_sq:.3f}")
    print(f"  F({k-1},{n_reg-k}) = {F_reg:.3f}, p {'< .001' if p_F < .001 else f'= {p_F:.4f}'}")
    print(f"\n  {'Predictor':<15} {'β':>8} {'SE':>8} {'t':>8} {'p':>10} {'Sig':>5}")
    print(f"  {'─'*15} {'─'*8} {'─'*8} {'─'*8} {'─'*10} {'─'*5}")
    for j, name in enumerate(predictor_names):
        t_val = betas[j] / se_betas[j]
        p_val = 2 * (1 - sp.t.cdf(abs(t_val), n_reg - k))
        sig = '***' if p_val < .001 else ('**' if p_val < .01 else ('*' if p_val < .05 else ''))
        print(f"  {name:<15} {betas[j]:>+8.3f} {se_betas[j]:>8.3f} {t_val:>8.3f} {p_val:>10.6f} {sig:>5}")
except np.linalg.LinAlgError:
    print(f"  Regression failed - singular matrix")

# 4F: Kruskal-Wallis for non-parametric robustness
print(f"\n  4F: Kruskal-Wallis (non-parametric) - Org Size on Barriers")
kw_groups = []
for sg in ['Small', 'Medium', 'Large']:
    g = np.array([B[j] for j in size_groups[sg] if B[j] is not None])
    kw_groups.append(g)
H, p_kw = sp.kruskal(*kw_groups)
print(f"  H({len(kw_groups)-1}) = {H:.3f}, p = {p_kw:.6f}")
print(f"  {'Significant' if p_kw < .05 else 'Not significant'} - confirms {'parametric ANOVA result' if p_kw < .05 else 'ANOVA result'}")

# Post-hoc pairwise Mann-Whitney
if p_kw < .05:
    print(f"  Post-hoc Mann-Whitney U (Bonferroni-corrected α = .017):")
    pairs = [('Small', 'Medium'), ('Small', 'Large'), ('Medium', 'Large')]
    for a, b in pairs:
        ga = np.array([B[j] for j in size_groups[a] if B[j] is not None])
        gb = np.array([B[j] for j in size_groups[b] if B[j] is not None])
        U, p_mw = sp.mannwhitneyu(ga, gb, alternative='two-sided')
        r_eff = 1 - 2*U/(len(ga)*len(gb))  # rank-biserial
        print(f"    {a} vs {b}: U={U:.0f}, p={p_mw:.4f}, r={r_eff:+.3f} {'*' if p_mw < .017 else ''}")

print(f"\n{'='*80}")
print(f"  ADVANCED ANALYSIS COMPLETE")
print(f"{'='*80}")
