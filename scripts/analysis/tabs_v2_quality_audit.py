#!/usr/bin/env python3
"""
TABS V2 Data Quality Audit
===========================
Systematic examination of dataset flaws, biases, and limitations.
"""

import csv, math, sys
import numpy as np
from scipy import stats as sp
from collections import Counter, defaultdict

if len(sys.argv) < 2:
    print(f"Usage: {sys.argv[0]} <qualtrics_csv_path>")
    sys.exit(1)
CSV_PATH = sys.argv[1]
V2_START = "2026-03-23 14:00:00"

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

# ── Load ALL V2 rows (not just clean) ─────────────────────────────
with open(CSV_PATH, newline='', encoding='utf-8-sig') as f:
    reader = csv.reader(f)
    hdr = next(reader)
    subhdr = next(reader)
    next(reader)  # import IDs
    idx = {h: i for i, h in enumerate(hdr)}
    all_rows = []
    for r in reader:
        if r[idx['StartDate']] >= V2_START:
            all_rows.append(r)

N_all = len(all_rows)
print(f"{'='*80}")
print(f"  TABS V2 DATA QUALITY AUDIT")
print(f"  Total V2 rows: {N_all}")
print(f"{'='*80}")

# ══════════════════════════════════════════════════════════════════
# 1. DISPOSITION FUNNEL - Where do we lose respondents?
# ══════════════════════════════════════════════════════════════════
print(f"\n{'='*80}")
print(f"  1. DISPOSITION FUNNEL & ATTRITION")
print(f"{'='*80}")

durations = []
for r in all_rows:
    try:
        durations.append(float(r[idx['Duration (in seconds)']]))
    except:
        durations.append(0)

dur_arr = np.array(durations)
print(f"\n  Duration distribution (all V2, N={N_all}):")
print(f"    Min:    {dur_arr.min():.0f}s ({dur_arr.min()/60:.1f}m)")
print(f"    P5:     {np.percentile(dur_arr, 5):.0f}s")
print(f"    P25:    {np.percentile(dur_arr, 25):.0f}s ({np.percentile(dur_arr, 25)/60:.1f}m)")
print(f"    Median: {np.percentile(dur_arr, 50):.0f}s ({np.percentile(dur_arr, 50)/60:.1f}m)")
print(f"    P75:    {np.percentile(dur_arr, 75):.0f}s ({np.percentile(dur_arr, 75)/60:.1f}m)")
print(f"    P95:    {np.percentile(dur_arr, 95):.0f}s ({np.percentile(dur_arr, 95)/60:.1f}m)")
print(f"    Max:    {dur_arr.max():.0f}s ({dur_arr.max()/60:.1f}m)")

# Speed tiers
print(f"\n  Speed tiers:")
for label, lo, hi in [("<2min", 0, 120), ("2-5min", 120, 300), ("5-8min", 300, 480),
                        ("8-15min", 480, 900), ("15-30min", 900, 1800), ("30min+", 1800, 999999)]:
    n = sum(1 for d in durations if lo <= d < hi)
    print(f"    {label:>8}: {n:>4} ({100*n/N_all:.1f}%)")

# IRI pass rates
iri_b_pass = sum(1 for r in all_rows if r[idx[IRI_B]] == "Major Barrier")
iri_r_pass = sum(1 for r in all_rows if r[idx[IRI_R]] == "Low Readiness/Capability")
iri_m_pass = sum(1 for r in all_rows if r[idx[IRI_M]] == "Level 2: Developing/Repeatable")
iri_all = sum(1 for r in all_rows if r[idx[IRI_B]] == "Major Barrier" and
              r[idx[IRI_R]] == "Low Readiness/Capability" and
              r[idx[IRI_M]] == "Level 2: Developing/Repeatable")

print(f"\n  IRI attention check pass rates (all V2, N={N_all}):")
print(f"    Barrier IRI (Major Barrier):     {iri_b_pass:>4} ({100*iri_b_pass/N_all:.1f}%)")
print(f"    Readiness IRI (Low R/C):         {iri_r_pass:>4} ({100*iri_r_pass/N_all:.1f}%)")
print(f"    Maturity IRI (Level 2):          {iri_m_pass:>4} ({100*iri_m_pass/N_all:.1f}%)")
print(f"    All 3 correct:                   {iri_all:>4} ({100*iri_all/N_all:.1f}%)")

# Funnel
dur_pass = sum(1 for d in durations if d >= 480)
clean = sum(1 for i, r in enumerate(all_rows) if durations[i] >= 480 and
            r[idx[IRI_B]] == "Major Barrier" and r[idx[IRI_R]] == "Low Readiness/Capability" and
            r[idx[IRI_M]] == "Level 2: Developing/Repeatable")
print(f"\n  Disposition funnel:")
print(f"    Total V2:       {N_all:>4}")
print(f"    Duration ≥ 8m:  {dur_pass:>4} ({100*dur_pass/N_all:.1f}%) - lost {N_all - dur_pass}")
print(f"    + All 3 IRI:    {clean:>4} ({100*clean/N_all:.1f}%) - lost {dur_pass - clean} more")
print(f"    *** Clean retention rate: {100*clean/N_all:.1f}% ***")

# ══════════════════════════════════════════════════════════════════
# 2. DEMOGRAPHIC IMBALANCES
# ══════════════════════════════════════════════════════════════════
print(f"\n{'='*80}")
print(f"  2. DEMOGRAPHIC IMBALANCES (Clean N={clean})")
print(f"{'='*80}")

clean_rows = [r for i, r in enumerate(all_rows) if durations[i] >= 480 and
              r[idx[IRI_B]] == "Major Barrier" and r[idx[IRI_R]] == "Low Readiness/Capability" and
              r[idx[IRI_M]] == "Level 2: Developing/Repeatable"]

def map_role(raw):
    for prefix in ["CEO", "CFO", "CIO", "CMO", "COO", "CHRO", "CTO", "CSO", "CRO"]:
        if raw.startswith(prefix):
            return prefix
    return "Other"

print(f"\n  2A: Role distribution")
roles = [map_role(r[idx['Q1_Role']]) for r in clean_rows]
for role, cnt in Counter(roles).most_common():
    print(f"    {role:>8}: {cnt:>3} ({100*cnt/clean:.1f}%)")

print(f"\n  2B: Organization size")
sizes = [r[idx['Q4_OrgSize']] for r in clean_rows]
for sz, cnt in Counter(sizes).most_common():
    print(f"    {sz:>12}: {cnt:>3} ({100*cnt/clean:.1f}%)")

print(f"\n  2C: Profit model")
profs = [r[idx['Q5_ProfitModel']] for r in clean_rows]
for pm, cnt in Counter(profs).most_common():
    print(f"    {pm:>30}: {cnt:>3} ({100*cnt/clean:.1f}%)")

print(f"\n  2D: Geographic scope")
geos = [r[idx['Q8_GeoScope']] for r in clean_rows]
for g, cnt in Counter(geos).most_common():
    print(f"    {g:>20}: {cnt:>3} ({100*cnt/clean:.1f}%)")

print(f"\n  2E: Decision authority")
auths = [r[idx['Q2_DecisionAuth']] for r in clean_rows]
for a, cnt in Counter(auths).most_common():
    short = a[:60] + "..." if len(a) > 60 else a
    print(f"    {short:>63}: {cnt:>3} ({100*cnt/clean:.1f}%)")

print(f"\n  2F: Industry (Q3)")
inds = [r[idx['Q3_Industry']] for r in clean_rows]
for ind, cnt in Counter(inds).most_common():
    short = ind[:55] + "..." if len(ind) > 55 else ind
    print(f"    {short:>58}: {cnt:>3} ({100*cnt/clean:.1f}%)")

# ══════════════════════════════════════════════════════════════════
# 3. MISSING DATA ANALYSIS
# ══════════════════════════════════════════════════════════════════
print(f"\n{'='*80}")
print(f"  3. MISSING DATA PATTERNS")
print(f"{'='*80}")

all_item_cols = BARRIER_COLS + READINESS_COLS + MATURITY_COLS
all_scales = [BARRIER_SCALE]*18 + [READINESS_SCALE]*17 + [MATURITY_SCALE]*8

# Item-level missingness
print(f"\n  3A: Item-level missingness (clean sample)")
for scale_name, cols, scale in [("Barriers", BARRIER_COLS, BARRIER_SCALE),
                                  ("Readiness", READINESS_COLS, READINESS_SCALE),
                                  ("Maturity", MATURITY_COLS, MATURITY_SCALE)]:
    total_cells = len(cols) * clean
    missing = 0
    dk_count = 0
    for c in cols:
        for r in clean_rows:
            val = r[idx[c]]
            if val not in scale:
                missing += 1
                if "Don't Know" in val or "don't know" in val.lower():
                    dk_count += 1
    print(f"  {scale_name}: {missing} missing of {total_cells} cells ({100*missing/total_cells:.2f}%)")
    if dk_count > 0:
        print(f"    Of which 'Don't Know': {dk_count}")

# Person-level completeness
print(f"\n  3B: Person-level completeness")
person_missing = defaultdict(int)
for r in clean_rows:
    miss = 0
    for c, sc in zip(all_item_cols, all_scales):
        if r[idx[c]] not in sc:
            miss += 1
    person_missing[miss] += 1

for miss_count in sorted(person_missing.keys()):
    n = person_missing[miss_count]
    pct = 100 * n / clean
    print(f"    {miss_count:>2} items missing: {n:>3} respondents ({pct:.1f}%)")

# "Don't Know" by maturity item
print(f"\n  3C: 'Don't Know' responses by Maturity item")
mat_names = ["IT Investment & Value Mgmt", "IT-Enabled Innovation",
    "Process Mgmt & Standardization", "Data Governance & Analytics",
    "Tech Risk & Resilience", "Strategic IT Planning",
    "Workforce Capability", "Change Leadership"]
for i, c in enumerate(MATURITY_COLS):
    dk = sum(1 for r in clean_rows if "Don't Know" in r[idx[c]] or "don't know" in r[idx[c]].lower())
    if dk > 0:
        print(f"    {mat_names[i]:>35}: {dk:>3} ({100*dk/clean:.1f}%)")

for i, c in enumerate(READINESS_COLS):
    dk = sum(1 for r in clean_rows if "Don't Know" in r[idx[c]] or "don't know" in r[idx[c]].lower())
    if dk > 0:
        rname = f"Readiness_{i+1}"
        print(f"    {rname:>35}: {dk:>3} ({100*dk/clean:.1f}%)")

# ══════════════════════════════════════════════════════════════════
# 4. RESPONSE QUALITY - Straightlining, central tendency, extreme
# ══════════════════════════════════════════════════════════════════
print(f"\n{'='*80}")
print(f"  4. RESPONSE QUALITY ISSUES")
print(f"{'='*80}")

def person_responses(r, cols, scale):
    return [scale[r[idx[c]]] for c in cols if r[idx[c]] in scale]

# Straightlining: all same answer on a scale
print(f"\n  4A: Straightlining (all items same value within a scale)")
for scale_name, cols, scale in [("Barriers", BARRIER_COLS, BARRIER_SCALE),
                                  ("Readiness", READINESS_COLS, READINESS_SCALE),
                                  ("Maturity", MATURITY_COLS, MATURITY_SCALE)]:
    straightline = 0
    for r in clean_rows:
        vals = person_responses(r, cols, scale)
        if vals and len(set(vals)) == 1:
            straightline += 1
    print(f"    {scale_name}: {straightline} ({100*straightline/clean:.1f}%)")

# Low variance (SD < 0.5)
print(f"\n  4B: Low variance respondents (within-person SD < 0.5)")
for scale_name, cols, scale in [("Barriers", BARRIER_COLS, BARRIER_SCALE),
                                  ("Readiness", READINESS_COLS, READINESS_SCALE),
                                  ("Maturity", MATURITY_COLS, MATURITY_SCALE)]:
    low_var = 0
    for r in clean_rows:
        vals = person_responses(r, cols, scale)
        if len(vals) >= 3:
            sd = np.std(vals, ddof=1)
            if sd < 0.5:
                low_var += 1
    print(f"    {scale_name}: {low_var} ({100*low_var/clean:.1f}%)")

# Extreme responding (>80% at endpoints)
print(f"\n  4C: Extreme responding (>80% of responses at scale endpoints)")
for scale_name, cols, scale in [("Barriers", BARRIER_COLS, BARRIER_SCALE),
                                  ("Readiness", READINESS_COLS, READINESS_SCALE),
                                  ("Maturity", MATURITY_COLS, MATURITY_SCALE)]:
    extreme = 0
    for r in clean_rows:
        vals = person_responses(r, cols, scale)
        if vals:
            at_ends = sum(1 for v in vals if v in (1, 5))
            if at_ends / len(vals) > 0.8:
                extreme += 1
    print(f"    {scale_name}: {extreme} ({100*extreme/clean:.1f}%)")

# Central tendency bias (>80% at midpoint)
print(f"\n  4D: Central tendency bias (>80% at midpoint 3)")
for scale_name, cols, scale in [("Barriers", BARRIER_COLS, BARRIER_SCALE),
                                  ("Readiness", READINESS_COLS, READINESS_SCALE),
                                  ("Maturity", MATURITY_COLS, MATURITY_SCALE)]:
    central = 0
    for r in clean_rows:
        vals = person_responses(r, cols, scale)
        if vals:
            at_mid = sum(1 for v in vals if v == 3)
            if at_mid / len(vals) > 0.8:
                central += 1
    print(f"    {scale_name}: {central} ({100*central/clean:.1f}%)")

# ══════════════════════════════════════════════════════════════════
# 5. DISTRIBUTIONAL PROPERTIES
# ══════════════════════════════════════════════════════════════════
print(f"\n{'='*80}")
print(f"  5. DISTRIBUTIONAL PROPERTIES")
print(f"{'='*80}")

def person_mean(r, cols, scale):
    vals = [scale[r[idx[c]]] for c in cols if r[idx[c]] in scale]
    return sum(vals) / len(vals) if vals else None

B = [person_mean(r, BARRIER_COLS, BARRIER_SCALE) for r in clean_rows]
R = [person_mean(r, READINESS_COLS, READINESS_SCALE) for r in clean_rows]
M = [person_mean(r, MATURITY_COLS, MATURITY_SCALE) for r in clean_rows]

for name, vals in [("Barriers", B), ("Readiness", R), ("Maturity", M)]:
    arr = np.array([v for v in vals if v is not None])
    skew = sp.skew(arr)
    kurt = sp.kurtosis(arr)  # excess kurtosis
    shapiro_stat, shapiro_p = sp.shapiro(arr)
    print(f"\n  {name} (n={len(arr)}):")
    print(f"    Skewness: {skew:+.3f} {'(acceptable)' if abs(skew) < 1 else '⚠ SKEWED'}")
    print(f"    Kurtosis: {kurt:+.3f} {'(acceptable)' if abs(kurt) < 2 else '⚠ NON-NORMAL'}")
    print(f"    Shapiro-Wilk: W={shapiro_stat:.4f}, p={shapiro_p:.6f} {'(normal)' if shapiro_p > .05 else '⚠ NON-NORMAL'}")
    print(f"    Range used: {arr.min():.2f} – {arr.max():.2f} of 1.00–5.00")
    print(f"    Floor/ceiling: {sum(arr < 1.5)}/{sum(arr > 4.5)} respondents at extremes")

# ══════════════════════════════════════════════════════════════════
# 6. SMALL CELL SIZES & POWER ANALYSIS
# ══════════════════════════════════════════════════════════════════
print(f"\n{'='*80}")
print(f"  6. SMALL CELL SIZES & STATISTICAL POWER")
print(f"{'='*80}")

print(f"\n  6A: Subgroup sizes for key comparisons")
role_counts = Counter(map_role(r[idx['Q1_Role']]) for r in clean_rows)
size_counts = Counter(r[idx['Q4_OrgSize']] for r in clean_rows)
prof_counts = Counter(r[idx['Q5_ProfitModel']] for r in clean_rows)
geo_counts = Counter(r[idx['Q8_GeoScope']] for r in clean_rows)

print(f"  Roles with n < 10:")
for role, n in role_counts.most_common():
    if n < 10:
        print(f"    {role}: n={n}")

print(f"  Org sizes with n < 10:")
for sz, n in size_counts.most_common():
    if n < 10:
        print(f"    {sz}: n={n}")

print(f"  Other small groups:")
for label, counts in [("Profit", prof_counts), ("Geo", geo_counts)]:
    for g, n in counts.most_common():
        if n < 10:
            print(f"    {label}/{g}: n={n}")

# Power analysis for key tests
print(f"\n  6B: Minimum detectable effect sizes (power=.80, α=.05)")
# For independent t-test: d = t_crit * sqrt(1/n1 + 1/n2), approximately
from scipy.stats import norm
z_alpha = 1.96
z_beta = 0.84

for label, n1, n2 in [("Tech vs NonTech", 27, 60), ("Large vs Small/Med", 20, 82),
                         ("US vs Intl", 92, 10), ("ForProfit vs Govt", 76, 8)]:
    mde = (z_alpha + z_beta) * math.sqrt(1/n1 + 1/n2)
    print(f"    {label:>25}: MDE d = {mde:.2f} (n1={n1}, n2={n2})")

# ══════════════════════════════════════════════════════════════════
# 7. CONSTRUCT-LEVEL CONCERNS
# ══════════════════════════════════════════════════════════════════
print(f"\n{'='*80}")
print(f"  7. CONSTRUCT-LEVEL CONCERNS")
print(f"{'='*80}")

# Inter-item correlation range
print(f"\n  7A: Inter-item correlation diagnostics")
for scale_name, cols, scale in [("Barriers", BARRIER_COLS, BARRIER_SCALE),
                                  ("Readiness", READINESS_COLS, READINESS_SCALE),
                                  ("Maturity", MATURITY_COLS, MATURITY_SCALE)]:
    # Build item matrix
    matrix = []
    for r in clean_rows:
        row_vals = []
        for c in cols:
            v = r[idx[c]]
            row_vals.append(scale.get(v, np.nan))
        matrix.append(row_vals)
    X = np.array(matrix)

    # Pairwise correlations
    n_items = X.shape[1]
    corrs = []
    for i in range(n_items):
        for j in range(i+1, n_items):
            mask = ~np.isnan(X[:, i]) & ~np.isnan(X[:, j])
            if mask.sum() >= 10:
                r_val, _ = sp.pearsonr(X[mask, i], X[mask, j])
                corrs.append(r_val)

    corrs = np.array(corrs)
    print(f"  {scale_name} ({n_items} items, {len(corrs)} pairs):")
    print(f"    Mean r: {corrs.mean():.3f}")
    print(f"    Min r:  {corrs.min():.3f}")
    print(f"    Max r:  {corrs.max():.3f}")
    print(f"    Pairs with r < .20: {sum(corrs < .20)}")
    print(f"    Pairs with r > .70: {sum(corrs > .70)} (potential redundancy)")

# R-M overlap
print(f"\n  7B: Readiness–Maturity discriminant validity concern")
aligned = [(r, m) for r, m in zip(R, M) if r is not None and m is not None]
ra, ma = np.array([x[0] for x in aligned]), np.array([x[1] for x in aligned])
r_rm, p_rm = sp.pearsonr(ra, ma)
print(f"    R-M correlation: r = {r_rm:.3f} (p = {p_rm:.2e})")
print(f"    Shared variance: {r_rm**2:.1%}")
if r_rm > 0.70:
    print(f"    ⚠ r > .70 raises discriminant validity concern - are these really distinct constructs?")

# ══════════════════════════════════════════════════════════════════
# 8. IRI FILTER BIAS - Does the filter systematically exclude?
# ══════════════════════════════════════════════════════════════════
print(f"\n{'='*80}")
print(f"  8. IRI FILTER SELECTION BIAS")
print(f"{'='*80}")

# Compare demographics: clean vs. IRI-fail (among those with dur >= 480)
dur_pass_rows = [(i, r) for i, r in enumerate(all_rows) if durations[i] >= 480]
iri_pass_rows = [r for i, r in dur_pass_rows if
    r[idx[IRI_B]] == "Major Barrier" and r[idx[IRI_R]] == "Low Readiness/Capability" and
    r[idx[IRI_M]] == "Level 2: Developing/Repeatable"]
iri_fail_rows = [r for i, r in dur_pass_rows if not (
    r[idx[IRI_B]] == "Major Barrier" and r[idx[IRI_R]] == "Low Readiness/Capability" and
    r[idx[IRI_M]] == "Level 2: Developing/Repeatable")]

print(f"\n  Duration ≥ 480s: {len(dur_pass_rows)} total, {len(iri_pass_rows)} IRI-pass, {len(iri_fail_rows)} IRI-fail")

# Compare role distributions
print(f"\n  8A: Role distribution - IRI-pass vs IRI-fail")
pass_roles = Counter(map_role(r[idx['Q1_Role']]) for r in iri_pass_rows)
fail_roles = Counter(map_role(r[idx['Q1_Role']]) for r in iri_fail_rows)
print(f"  {'Role':>8} {'Pass':>6} {'Pass%':>7} {'Fail':>6} {'Fail%':>7} {'Delta':>7}")
for role in ['CIO', 'CTO', 'CEO', 'CFO', 'CMO', 'COO', 'CHRO', 'CSO', 'CRO', 'Other']:
    p_n = pass_roles.get(role, 0)
    f_n = fail_roles.get(role, 0)
    p_pct = 100 * p_n / len(iri_pass_rows) if iri_pass_rows else 0
    f_pct = 100 * f_n / len(iri_fail_rows) if iri_fail_rows else 0
    print(f"  {role:>8} {p_n:>6} {p_pct:>6.1f}% {f_n:>6} {f_pct:>6.1f}% {p_pct-f_pct:>+6.1f}%")

# Compare org size distributions
print(f"\n  8B: Org size - IRI-pass vs IRI-fail")
pass_sizes = Counter(r[idx['Q4_OrgSize']] for r in iri_pass_rows)
fail_sizes = Counter(r[idx['Q4_OrgSize']] for r in iri_fail_rows)
for sz in ['<100', '100-499', '500-999', '1000-4999', '5000-9999', '10000+']:
    p_n = pass_sizes.get(sz, 0)
    f_n = fail_sizes.get(sz, 0)
    p_pct = 100 * p_n / len(iri_pass_rows) if iri_pass_rows else 0
    f_pct = 100 * f_n / len(iri_fail_rows) if iri_fail_rows else 0
    print(f"  {sz:>12} {p_n:>6} {p_pct:>6.1f}% {f_n:>6} {f_pct:>6.1f}% {p_pct-f_pct:>+6.1f}%")

# Compare mean scores
print(f"\n  8C: Construct means - IRI-pass vs IRI-fail")
for name, cols, scale in [("Barriers", BARRIER_COLS, BARRIER_SCALE),
                           ("Readiness", READINESS_COLS, READINESS_SCALE),
                           ("Maturity", MATURITY_COLS, MATURITY_SCALE)]:
    pass_means = [person_mean(r, cols, scale) for r in iri_pass_rows]
    fail_means = [person_mean(r, cols, scale) for r in iri_fail_rows]
    pa = np.array([v for v in pass_means if v is not None])
    fa = np.array([v for v in fail_means if v is not None])
    if len(fa) >= 5:
        t, p = sp.ttest_ind(pa, fa, equal_var=False)
        print(f"  {name:>12}: Pass M={pa.mean():.2f} (n={len(pa)}), Fail M={fa.mean():.2f} (n={len(fa)}), t={t:.2f}, p={p:.4f}")

# ══════════════════════════════════════════════════════════════════
# 9. TEMPORAL PATTERNS
# ══════════════════════════════════════════════════════════════════
print(f"\n{'='*80}")
print(f"  9. TEMPORAL PATTERNS")
print(f"{'='*80}")

# Check if responses cluster on certain days
from datetime import datetime
dates = []
for r in clean_rows:
    try:
        dt = datetime.strptime(r[idx['StartDate']][:10], '%Y-%m-%d')
        dates.append(dt.strftime('%Y-%m-%d'))
    except:
        pass

print(f"\n  9A: Response dates (clean sample)")
for d, cnt in sorted(Counter(dates).items()):
    bar = '█' * cnt
    print(f"    {d}: {cnt:>3} {bar}")

# Check for time-of-day patterns
hours = []
for r in clean_rows:
    try:
        dt = datetime.strptime(r[idx['StartDate']], '%Y-%m-%d %H:%M:%S')
        hours.append(dt.hour)
    except:
        pass

print(f"\n  9B: Response hours (UTC from Qualtrics)")
hour_counts = Counter(hours)
for h in range(24):
    cnt = hour_counts.get(h, 0)
    bar = '█' * (cnt // 1) if cnt > 0 else ''
    print(f"    {h:>2}:00  {cnt:>3} {bar}")

# ══════════════════════════════════════════════════════════════════
# 10. PROLIFIC PLATFORM CONCERNS
# ══════════════════════════════════════════════════════════════════
print(f"\n{'='*80}")
print(f"  10. SAMPLING & EXTERNAL VALIDITY")
print(f"{'='*80}")

print(f"""
  10A: Sampling method
    Platform: Prolific (paid panel)
    Population: Self-identified C-suite / senior executives
    Screening: Prolific pre-screening for seniority + survey role question

  CONCERNS:
  a) Self-selection bias: Prolific panelists who choose to take surveys
     may differ systematically from the broader C-suite population
     (e.g., more tech-savvy, more curious, less time-pressured)
  b) Verification gap: No independent verification of C-suite status
     beyond self-report. Prolific pre-screens on job role but has no
     way to verify actual organizational authority level.
  c) Payment effect: $X compensation may attract satisficers who rush
     through for payment vs. engaged respondents
  d) Panel fatigue: Professional survey-takers may respond differently
     than genuine first-time respondents
  e) Geographic concentration: {100*geo_counts.get('United States', 0)/clean:.0f}% US-based - limited
     international generalizability
  f) For-Profit dominance: {100*prof_counts.get('For-Profit', 0)/clean:.0f}% For-Profit - government and
     non-profit sectors underrepresented
  g) Convenience timing: All responses collected within ~{len(set(dates))} days -
     no seasonal variation captured
""")

# ══════════════════════════════════════════════════════════════════
# SUMMARY
# ══════════════════════════════════════════════════════════════════
print(f"{'='*80}")
print(f"  SUMMARY OF DATA ISSUES (ranked by severity)")
print(f"{'='*80}")
print(f"""
  HIGH SEVERITY:
  1. Small N for key subgroups - CRO (n=4), CSO (n=5), CTO (n=7),
     Govt (n=8), 5000-9999 (n=6), International (n=10). Many interaction
     analyses have cells with n < 5, making results unreliable.
  2. High attrition - Only {100*clean/N_all:.0f}% of V2 respondents pass the clean filter.
     This severe filtering raises concerns about representativeness.
  3. R-M discriminant validity - r = {r_rm:.3f} ({r_rm**2:.0%} shared variance).
     Readiness and Maturity may not be distinct constructs.

  MODERATE SEVERITY:
  4. Demographic imbalance - For-Profit ({100*prof_counts.get('For-Profit',0)/clean:.0f}%) and US-based
     ({100*geo_counts.get('United States',0)/clean:.0f}%) dominate. Results may not generalize to government
     or international contexts.
  5. Non-normality - Shapiro-Wilk likely rejects normality for at least
     one construct, though parametric tests are generally robust at N=102.
  6. Self-report single-method - All three constructs measured via
     same-format Likert scales from same respondent, inflating shared
     method variance and potentially biasing correlations upward.

  LOWER SEVERITY:
  7. Temporal clustering - All data collected in a narrow window;
     results reflect a single point-in-time snapshot.
  8. No causal inference - Cross-sectional design cannot determine
     whether barriers cause low readiness or vice versa.
  9. Prolific panel effects - Professional survey-takers may exhibit
     different response patterns than a true probability sample.
""")
