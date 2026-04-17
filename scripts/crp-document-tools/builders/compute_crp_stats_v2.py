#!/usr/bin/env python3
"""Compute ALL statistics for CRP V2 Results — CORRECTED scale maps from actual CSV values.

Usage:
    python compute_crp_stats_v2.py
    python compute_crp_stats_v2.py --csv /path/to/survey.csv
"""
import csv, math, json, argparse, glob, os, sys, statistics
from collections import defaultdict, Counter

def find_csv():
    """Auto-discover the CRP survey CSV via workspace glob patterns."""
    for pattern in [
        "/sessions/*/mnt/! Clarke Moyer Smeal CRP - TABS/05 TABS Survey Support/TABS Survey Data/*Enriched_CRP200*.csv",
        "/sessions/*/mnt/! Clarke Moyer Smeal CRP - TABS/05 TABS Survey Support/TABS Survey Data/*V2_ONLY*.csv",
        "/sessions/*/mnt/*Clarke*CRP*TABS*/05 TABS Survey Support/TABS Survey Data/*Enriched_CRP200*.csv",
    ]:
        matches = glob.glob(pattern)
        if matches:
            return sorted(matches)[-1]
    return None

parser = argparse.ArgumentParser(description="Compute CRP V2 descriptive statistics")
parser.add_argument("--csv", help="Path to survey CSV (auto-discovered if omitted)")
args = parser.parse_args()

CSV_PATH = args.csv or find_csv()
if not CSV_PATH:
    print("ERROR: No survey CSV found. Provide --csv or set up the CRP workspace.")
    sys.exit(1)
print(f"Using CSV: {CSV_PATH}")

with open(CSV_PATH, 'r', encoding='utf-8-sig') as f:
    reader = csv.reader(f)
    row1 = next(reader)
    row2 = next(reader)
    row3 = next(reader)
    data = list(reader)

col_idx = {h: i for i, h in enumerate(row1)}

# Guard required columns (optional-column access rule)
required_cols = ['StartDate', 'Duration (in seconds)', 'Q1_Role', 'Q4_OrgSize',
                 'Q5_ProfitModel', 'Q3_Industry', 'Q2_DecisionAuth', 'Q8_GeoScope',
                 'Q74_Feedback']
missing = [c for c in required_cols if c not in col_idx]
if missing:
    print(f"ERROR: CSV is missing required columns: {missing}")
    print(f"       CSV header has {len(row1)} columns; first 5: {row1[:5]}")
    sys.exit(1)

# V2 filter
v2_rows = [r for r in data if r[col_idx['StartDate']] >= '2026-03-23 14:00:00']
print(f"V2 total: {len(v2_rows)}")
if not v2_rows:
    print("ERROR: No V2 survey rows found (StartDate >= 2026-03-23 14:00:00).")
    print("       Verify --csv points to a V2 or frozen CRP export.")
    sys.exit(1)

# CORRECTED scale maps (from actual CSV response values)
barrier_scale = {
    "Not a Barrier": 1, "Minor Barrier": 2, "Moderate Barrier": 3,
    "Significant Barrier": 4, "Major Barrier": 5
}
readiness_scale = {
    "Very Low Readiness/Capability": 1, "Low Readiness/Capability": 2,
    "Moderate Readiness/Capability": 3, "High Readiness/Capability": 4,
    "Very High Readiness/Capability": 5
}
maturity_scale = {
    "Level 1: Initial/Ad Hoc": 1, "Level 2: Developing/Repeatable": 2,
    "Level 3: Defined/Standardized": 3, "Level 4: Managed/Quantitatively Managed": 4,
    "Level 5: Optimizing/Innovating": 5
}

# Columns
barrier_cols = [f"Q10-28_Barriers_{i}" for i in range(1,19)]
barrier_iri = "Q10-28_Barriers_19"
readiness_cols = [f"Q47-64_Readiness_{i}" for i in range(1,18)]
readiness_iri = "Q47-64_Readiness_18"
maturity_cols = [f"Q65-73_Maturity_{i}" for i in range(1,9)]
maturity_iri = "Q65-73_Maturity_9"

# Short item names
barrier_names = [
    "Resistance to Change", "Lack of Leadership Support", "Risk-Averse Culture",
    "Insufficient Workforce Skills", "Inadequate Training", "High Implementation Cost",
    "Legacy System Integration", "Inadequate IT Infrastructure", "Difficulty Demonstrating Value",
    "No Clear Strategy/Roadmap", "Insufficient Governance", "Workflow Disruption",
    "Cybersecurity Concerns", "Data Privacy Compliance", "Lack of Trust in Tech/Vendors",
    "Regulatory Complexity", "External Pressure Without Readiness", "Vendor/Partner Difficulty"
]
readiness_names = [
    "Vision/Leadership", "Tech-Strategy Alignment", "IT Governance Effectiveness",
    "Culture Openness", "Innovation Support", "Technical Workforce",
    "Training Programs", "Change Management", "IT Infrastructure",
    "System Interoperability", "Technical Support", "Data Governance",
    "Data Quality", "Data Analytics", "Business Process Maturity",
    "Performance Monitoring", "Budget Adequacy"
]
maturity_names = [
    "IT Investment & Value Mgmt", "IT-Enabled Innovation",
    "Process Mgmt & Standardization", "Data Governance & Analytics",
    "Tech Risk & Resilience", "Strategic IT Planning",
    "Workforce Capability", "Change Leadership"
]

def get_duration(row):
    try:
        return int(row[col_idx['Duration (in seconds)']])
    except (ValueError, TypeError, IndexError):
        return None

# Conservative clean
def is_clean(row):
    dur = get_duration(row)
    if dur is None or dur < 480: return False
    if row[col_idx[barrier_iri]].strip() != "Major Barrier": return False
    if row[col_idx[readiness_iri]].strip() != "Low Readiness/Capability": return False
    if row[col_idx[maturity_iri]].strip() != "Level 2: Developing/Repeatable": return False
    return True

clean_rows = [r for r in v2_rows if is_clean(r)]
print(f"Conservative clean N: {len(clean_rows)}")
if not clean_rows:
    print("ERROR: Zero rows passed the conservative clean filter")
    print("       (Duration >= 480s AND all 3 IRIs correct).")
    print("       Refusing to compute CRP statistics from an empty clean sample.")
    sys.exit(1)

def mean_sd(values):
    n = len(values)
    if n == 0: return (None, None)
    m = sum(values) / n
    if n == 1: return (m, 0)
    var = sum((x - m)**2 for x in values) / (n - 1)
    return (m, math.sqrt(var))

def score(row, col, scale):
    val = row[col_idx[col]].strip()
    return scale.get(val, None)

def pearson_r(x, y):
    pairs = [(a, b) for a, b in zip(x, y) if a is not None and b is not None]
    n = len(pairs)
    if n < 3: return None
    mx = sum(a for a,b in pairs) / n
    my = sum(b for a,b in pairs) / n
    sx = math.sqrt(sum((a-mx)**2 for a,b in pairs) / (n-1))
    sy = math.sqrt(sum((b-my)**2 for a,b in pairs) / (n-1))
    if sx == 0 or sy == 0: return None
    return sum((a-mx)*(b-my) for a,b in pairs) / ((n-1) * sx * sy)

# Duration stats
durations = sorted([get_duration(r) for r in clean_rows if get_duration(r)])
if durations:
    # Use statistics.median for correct handling of odd and even length lists
    med = statistics.median(durations)
    mean = sum(durations) / len(durations)
    print(f"\nDuration: median={med/60:.1f}min, mean={mean/60:.1f}min, range={min(durations)/60:.1f}-{max(durations)/60:.1f}min")
else:
    print("\nDuration: no valid durations found in clean rows")

# ===== BARRIER ITEMS =====
print("\n=== BARRIER RANKINGS ===")
barrier_stats = []
for i, col in enumerate(barrier_cols):
    vals = [score(r, col, barrier_scale) for r in clean_rows]
    vals = [v for v in vals if v is not None]
    m, sd = mean_sd(vals)
    barrier_stats.append((barrier_names[i], m, sd, len(vals)))
barrier_stats.sort(key=lambda x: -x[1])
for rank, (name, m, sd, n) in enumerate(barrier_stats, 1):
    print(f"  {rank}. {name}: M={m:.2f}, SD={sd:.2f}, n={n}")

# Barrier grand mean
b_person = []
for r in clean_rows:
    vals = [score(r, c, barrier_scale) for c in barrier_cols]
    vals = [v for v in vals if v is not None]
    if vals: b_person.append(sum(vals)/len(vals))
bgm, bgsd = mean_sd(b_person)
print(f"Barrier Grand Mean: M={bgm:.2f}, SD={bgsd:.2f}")

# ===== READINESS ITEMS =====
print("\n=== READINESS RANKINGS ===")
readiness_stats = []
for i, col in enumerate(readiness_cols):
    vals = [score(r, col, readiness_scale) for r in clean_rows]
    vals = [v for v in vals if v is not None]
    m, sd = mean_sd(vals)
    readiness_stats.append((readiness_names[i], m, sd, len(vals)))
readiness_stats.sort(key=lambda x: -x[1])
for rank, (name, m, sd, n) in enumerate(readiness_stats, 1):
    print(f"  {rank}. {name}: M={m:.2f}, SD={sd:.2f}, n={n}")

r_person = []
for r in clean_rows:
    vals = [score(r, c, readiness_scale) for c in readiness_cols]
    vals = [v for v in vals if v is not None]
    if vals: r_person.append(sum(vals)/len(vals))
rgm, rgsd = mean_sd(r_person)
print(f"Readiness Grand Mean: M={rgm:.2f}, SD={rgsd:.2f}")

# ===== MATURITY ITEMS =====
print("\n=== MATURITY RANKINGS ===")
maturity_stats = []
for i, col in enumerate(maturity_cols):
    vals = [score(r, col, maturity_scale) for r in clean_rows]
    vals = [v for v in vals if v is not None]
    m, sd = mean_sd(vals)
    maturity_stats.append((maturity_names[i], m, sd, len(vals)))
maturity_stats.sort(key=lambda x: -x[1])
for rank, (name, m, sd, n) in enumerate(maturity_stats, 1):
    print(f"  {rank}. {name}: M={m:.2f}, SD={sd:.2f}, n={n}")

m_person = []
for r in clean_rows:
    vals = [score(r, c, maturity_scale) for c in maturity_cols]
    vals = [v for v in vals if v is not None]
    if vals: m_person.append(sum(vals)/len(vals))
mgm, mgsd = mean_sd(m_person)
print(f"Maturity Grand Mean: M={mgm:.2f}, SD={mgsd:.2f}")

def _fmt(x, spec=".2f"):
    """None-safe numeric format (avoids TypeError when mean_sd/pearson_r return None)."""
    if x is None:
        return "N/A"
    return format(x, spec)

# ===== CORRELATIONS =====
print("\n=== CORRELATIONS ===")
br = pearson_r(b_person, r_person)
bm = pearson_r(b_person, m_person)
rm = pearson_r(r_person, m_person)
print(f"B-R: r={_fmt(br)}")
print(f"B-M: r={_fmt(bm)}")
print(f"R-M: r={_fmt(rm)}")

# ===== DEMOGRAPHICS =====
print("\n=== DEMOGRAPHICS ===")
# Role mapping
role_map = {
    'CIO (e.g., Director of IT)': 'CIO',
    'CTO (e.g., Director of Technology/Innovation, Chief Scientist)': 'CTO',
    'CEO (e.g., Agency Director, Secretary, Administrator, City/County Manager)': 'CEO',
    'CFO (e.g., Director of Finance, Budget Director, Comptroller)': 'CFO',
    'COO (e.g., Deputy Director, Chief of Staff, Assistant Secretary for Administration)': 'COO',
    'CHRO (e.g., Chief Human Capital Officer (CHCO), Director of Human Resources, Personnel Director)': 'CHRO',
    'CMO (e.g., Director of Communications, Public Affairs Officer, Chief Marketing & Communications Officer)': 'CMO',
    'CSO (e.g., Director of Strategic Planning, Policy Director, Chief Strategy Officer)': 'CSO',
    'CRO (e.g., Director of Budget/Finance, Director of Development/Fundraising, Head of Revenue Operations)': 'CRO',
    'Other (please specify)': 'Other'
}

tech_titles = {'CIO', 'CTO'}
nontech_titles = {'CEO', 'CFO', 'COO', 'CHRO', 'CMO', 'CSO', 'CRO'}

roles = Counter()
for r in clean_rows:
    raw = r[col_idx['Q1_Role']].strip()
    short = role_map.get(raw, 'Unknown')
    roles[short] += 1

print("Roles:")
for role, ct in roles.most_common():
    print(f"  {role}: {ct} ({ct/len(clean_rows)*100:.1f}%)")

tech_rows = [r for r in clean_rows if role_map.get(r[col_idx['Q1_Role']].strip(), '') in tech_titles]
nontech_rows = [r for r in clean_rows if role_map.get(r[col_idx['Q1_Role']].strip(), '') in nontech_titles]
other_rows = [r for r in clean_rows if role_map.get(r[col_idx['Q1_Role']].strip(), '') == 'Other']
print(f"\nTechnical (CIO/CTO): n={len(tech_rows)}")
print(f"Non-Technical (CEO/CFO/COO/CHRO/CMO/CSO/CRO): n={len(nontech_rows)}")
print(f"Other: n={len(other_rows)}")

# Grand means by role group
for gname, grows in [("Technical", tech_rows), ("Non-Technical", nontech_rows), ("Other", other_rows)]:
    if not grows: continue
    bv = []; rv = []; mv = []
    for r in grows:
        b = [score(r, c, barrier_scale) for c in barrier_cols]; b = [x for x in b if x];
        if b: bv.append(sum(b)/len(b))
        rd = [score(r, c, readiness_scale) for c in readiness_cols]; rd = [x for x in rd if x]
        if rd: rv.append(sum(rd)/len(rd))
        mt = [score(r, c, maturity_scale) for c in maturity_cols]; mt = [x for x in mt if x]
        if mt: mv.append(sum(mt)/len(mt))
    bm_, _ = mean_sd(bv); rm_, _ = mean_sd(rv); mm_, _ = mean_sd(mv)
    print(f"  {gname}: B={_fmt(bm_)}, R={_fmt(rm_)}, M={_fmt(mm_)}")

# Org size
print("\nOrg Size:")
for os_val, ct in Counter(r[col_idx['Q4_OrgSize']].strip() for r in clean_rows).most_common():
    print(f"  {os_val}: {ct} ({ct/len(clean_rows)*100:.1f}%)")

# Profit model
print("\nProfit Model:")
for pm, ct in Counter(r[col_idx['Q5_ProfitModel']].strip() for r in clean_rows).most_common():
    print(f"  {pm}: {ct} ({ct/len(clean_rows)*100:.1f}%)")

# Industry
print("\nIndustry:")
for ind, ct in Counter(r[col_idx['Q3_Industry']].strip() for r in clean_rows).most_common():
    print(f"  {ind}: {ct} ({ct/len(clean_rows)*100:.1f}%)")

# Decision Auth
print("\nDecision Authority:")
for da, ct in Counter(r[col_idx['Q2_DecisionAuth']].strip() for r in clean_rows).most_common():
    print(f"  {da}: {ct} ({ct/len(clean_rows)*100:.1f}%)")

# Geographic
print("\nGeographic:")
for g, ct in Counter(r[col_idx['Q8_GeoScope']].strip() for r in clean_rows).most_common():
    print(f"  {g}: {ct} ({ct/len(clean_rows)*100:.1f}%)")

# ===== CROSS-TABS =====
print("\n=== CROSS-TABS: ORG SIZE ===")
def org_bucket(row):
    os_val = row[col_idx['Q4_OrgSize']].strip()
    if os_val in ('<100', '100-499'): return 'Small (<500)'
    elif os_val in ('500-999', '1000-4999'): return 'Medium (500-4999)'
    elif os_val in ('5000-9999', '10000+'): return 'Large (5000+)'
    return None

for bname in ['Small (<500)', 'Medium (500-4999)', 'Large (5000+)']:
    brows = [r for r in clean_rows if org_bucket(r) == bname]
    if not brows: continue
    bv = []; rv = []; mv = []
    for r in brows:
        b = [score(r, c, barrier_scale) for c in barrier_cols]; b = [x for x in b if x]
        if b: bv.append(sum(b)/len(b))
        rd = [score(r, c, readiness_scale) for c in readiness_cols]; rd = [x for x in rd if x]
        if rd: rv.append(sum(rd)/len(rd))
        mt = [score(r, c, maturity_scale) for c in maturity_cols]; mt = [x for x in mt if x]
        if mt: mv.append(sum(mt)/len(mt))
    bm_, _ = mean_sd(bv); rm_, _ = mean_sd(rv); mm_, _ = mean_sd(mv)
    print(f"  {bname} (n={len(brows)}): B={_fmt(bm_)}, R={_fmt(rm_)}, M={_fmt(mm_)}")

print("\n=== CROSS-TABS: PROFIT MODEL ===")
for pm_name in ['For-Profit', 'Non-Profit', 'Government/Public Sector']:
    prows = [r for r in clean_rows if r[col_idx['Q5_ProfitModel']].strip() == pm_name]
    if not prows: continue
    bv = []; rv = []; mv = []
    for r in prows:
        b = [score(r, c, barrier_scale) for c in barrier_cols]; b = [x for x in b if x]
        if b: bv.append(sum(b)/len(b))
        rd = [score(r, c, readiness_scale) for c in readiness_cols]; rd = [x for x in rd if x]
        if rd: rv.append(sum(rd)/len(rd))
        mt = [score(r, c, maturity_scale) for c in maturity_cols]; mt = [x for x in mt if x]
        if mt: mv.append(sum(mt)/len(mt))
    bm_, _ = mean_sd(bv); rm_, _ = mean_sd(rv); mm_, _ = mean_sd(mv)
    print(f"  {pm_name} (n={len(prows)}): B={_fmt(bm_)}, R={_fmt(rm_)}, M={_fmt(mm_)}")

# ===== TECH VS NON-TECH ITEM-LEVEL DIFFS =====
print("\n=== TOP BARRIER GAPS: TECH vs NON-TECH ===")
for i, col in enumerate(barrier_cols):
    t_vals = [score(r, col, barrier_scale) for r in tech_rows]; t_vals = [v for v in t_vals if v]
    n_vals = [score(r, col, barrier_scale) for r in nontech_rows]; n_vals = [v for v in n_vals if v]
    if t_vals and n_vals:
        tm, _ = mean_sd(t_vals); nm, _ = mean_sd(n_vals)
        if tm is None or nm is None:
            continue
        diff = tm - nm
        print(f"  {barrier_names[i]}: Tech={tm:.2f}, NonTech={nm:.2f}, diff={diff:+.2f}")

# ===== DISPOSITION WATERFALL =====
print("\n=== DISPOSITION WATERFALL ===")
print(f"V2 total responses: {len(v2_rows)}")
dur_fail = sum(1 for r in v2_rows if get_duration(r) is None or get_duration(r) < 480)
speed_ok = [r for r in v2_rows if get_duration(r) is not None and get_duration(r) >= 480]
print(f"Duration < 480s (auto-exclude): {dur_fail}")
print(f"Duration >= 480s: {len(speed_ok)}")

def iri_fails(row):
    f = 0
    if row[col_idx[barrier_iri]].strip() != "Major Barrier": f += 1
    if row[col_idx[readiness_iri]].strip() != "Low Readiness/Capability": f += 1
    if row[col_idx[maturity_iri]].strip() != "Level 2: Developing/Repeatable": f += 1
    return f

f2 = sum(1 for r in speed_ok if iri_fails(r) >= 2)
f1 = sum(1 for r in speed_ok if iri_fails(r) == 1)
f0 = sum(1 for r in speed_ok if iri_fails(r) == 0)
print(f"IRI fail 2+: {f2}")
print(f"IRI fail exactly 1: {f1}")
print(f"IRI pass all 3: {f0}")

# IRI pass rates (full V2)
bp = sum(1 for r in v2_rows if r[col_idx[barrier_iri]].strip() == "Major Barrier")
rp = sum(1 for r in v2_rows if r[col_idx[readiness_iri]].strip() == "Low Readiness/Capability")
mp = sum(1 for r in v2_rows if r[col_idx[maturity_iri]].strip() == "Level 2: Developing/Repeatable")
print(f"\nIRI pass rates (V2 total):")
print(f"  Barrier: {bp}/{len(v2_rows)} ({bp/len(v2_rows)*100:.1f}%)")
print(f"  Readiness: {rp}/{len(v2_rows)} ({rp/len(v2_rows)*100:.1f}%)")
print(f"  Maturity: {mp}/{len(v2_rows)} ({mp/len(v2_rows)*100:.1f}%)")
avg_iri = (bp + rp + mp) / (3 * len(v2_rows)) * 100
print(f"  Average: {avg_iri:.1f}%")

# Q74
print("\n=== Q74 FEEDBACK ===")
fb_rows = [r for r in clean_rows if r[col_idx['Q74_Feedback']].strip()]
print(f"Provided feedback: {len(fb_rows)}/{len(clean_rows)} ({len(fb_rows)/len(clean_rows)*100:.1f}%)")

print("\n=== DONE ===")
