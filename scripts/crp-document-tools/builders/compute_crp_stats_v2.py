#!/usr/bin/env python3
"""Compute ALL statistics for CRP V2 Results - CORRECTED scale maps from actual CSV values.

Workspace and CSV discovery follow the precedence documented in
``scripts/crp-document-tools/paths.py``:

    --csv flag  >  CRP_WORKSPACE env
    >  ~/Documents/CRP-workspace  or  ~/CRP-workspace
    >  scripts/crp-document-tools/fixtures/example_workspace  (CI/quickstart)
    >  /sessions/*/mnt/...  or  /tmp/tabs-crp-workspace  (legacy)

If you have no real workspace yet, the bundled ``fixtures/example_workspace/``
will satisfy the discovery so the script can demonstrate end-to-end behaviour
on synthetic data. See the Quickstart in the subtree README.

Usage:
    python compute_crp_stats_v2.py
    python compute_crp_stats_v2.py --csv /path/to/survey.csv
    CRP_WORKSPACE=~/Documents/CRP-workspace python compute_crp_stats_v2.py
"""
import argparse
import csv
import math
import os
import statistics
import sys
from collections import Counter

# Import the shared path-discovery helpers from the subtree root. We prepend
# the subtree dir to sys.path so this script remains runnable directly via
# ``python compute_crp_stats_v2.py`` from any working directory.
_SUBTREE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _SUBTREE_DIR not in sys.path:
    sys.path.insert(0, _SUBTREE_DIR)
from paths import CrpWorkspaceNotFound, find_survey_csv, find_workspace  # noqa: E402


def find_csv(workspace=None):
    """Find the survey CSV using an ordered list of glob patterns.

    Mirrors the strategy in ``validate_crp_stats_v5.find_csv()``:
    1. ``*Enriched_CRP200*.csv``  -- enriched live export (most common)
    2. ``*V2_ONLY*.csv``          -- V2-only variant
    3. Root-level public frozen dataset (no survey_data_dir sub-dir required)

    This avoids requiring ``--csv`` in common setups where only one of these
    variants is present.
    """
    resolved = find_workspace(explicit=workspace)
    for pattern in ["*Enriched_CRP200*.csv", "*V2_ONLY*.csv"]:
        try:
            return find_survey_csv(workspace=resolved, pattern=pattern)
        except CrpWorkspaceNotFound:
            pass
    # Root-level public frozen dataset fallback
    public = os.path.join(resolved, "TABS_V2_CRP_2026_public_dataset.csv")
    if os.path.exists(public):
        return public
    raise CrpWorkspaceNotFound(
        f"No survey CSV found in {resolved}. "
        "Provide --csv or place a *Enriched_CRP200*.csv / *V2_ONLY*.csv / "
        "TABS_V2_CRP_2026_public_dataset.csv in the workspace."
    )


# CORRECTED scale maps (from actual CSV response values)
BARRIER_SCALE = {
    "Not a Barrier": 1, "Minor Barrier": 2, "Moderate Barrier": 3,
    "Significant Barrier": 4, "Major Barrier": 5,
}
READINESS_SCALE = {
    "Very Low Readiness/Capability": 1, "Low Readiness/Capability": 2,
    "Moderate Readiness/Capability": 3, "High Readiness/Capability": 4,
    "Very High Readiness/Capability": 5,
}
MATURITY_SCALE = {
    "Level 1: Initial/Ad Hoc": 1, "Level 2: Developing/Repeatable": 2,
    "Level 3: Defined/Standardized": 3, "Level 4: Managed/Quantitatively Managed": 4,
    "Level 5: Optimizing/Innovating": 5,
}

BARRIER_COLS = [f"Q10-28_Barriers_{i}" for i in range(1, 19)]
BARRIER_IRI = "Q10-28_Barriers_19"
READINESS_COLS = [f"Q47-64_Readiness_{i}" for i in range(1, 18)]
READINESS_IRI = "Q47-64_Readiness_18"
MATURITY_COLS = [f"Q65-73_Maturity_{i}" for i in range(1, 9)]
MATURITY_IRI = "Q65-73_Maturity_9"

BARRIER_NAMES = [
    "Resistance to Change", "Lack of Leadership Support", "Risk-Averse Culture",
    "Insufficient Workforce Skills", "Inadequate Training", "High Implementation Cost",
    "Legacy System Integration", "Inadequate IT Infrastructure", "Difficulty Demonstrating Value",
    "No Clear Strategy/Roadmap", "Insufficient Governance", "Workflow Disruption",
    "Cybersecurity Concerns", "Data Privacy Compliance", "Lack of Trust in Tech/Vendors",
    "Regulatory Complexity", "External Pressure Without Readiness", "Vendor/Partner Difficulty",
]
READINESS_NAMES = [
    "Vision/Leadership", "Tech-Strategy Alignment", "IT Governance Effectiveness",
    "Culture Openness", "Innovation Support", "Technical Workforce",
    "Training Programs", "Change Management", "IT Infrastructure",
    "System Interoperability", "Technical Support", "Data Governance",
    "Data Quality", "Data Analytics", "Business Process Maturity",
    "Performance Monitoring", "Budget Adequacy",
]
MATURITY_NAMES = [
    "IT Investment & Value Mgmt", "IT-Enabled Innovation",
    "Process Mgmt & Standardization", "Data Governance & Analytics",
    "Tech Risk & Resilience", "Strategic IT Planning",
    "Workforce Capability", "Change Leadership",
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
    'Other (please specify)': 'Other',
}
TECH_TITLES = {'CIO', 'CTO'}
NONTECH_TITLES = {'CEO', 'CFO', 'COO', 'CHRO', 'CMO', 'CSO', 'CRO'}

REQUIRED_COLS = [
    'StartDate', 'Duration (in seconds)', 'Q1_Role', 'Q4_OrgSize',
    'Q5_ProfitModel', 'Q3_Industry', 'Q2_DecisionAuth', 'Q8_GeoScope',
    'Q74_Feedback',
]


def mean_sd(values):
    n = len(values)
    if n == 0:
        return (None, None)
    m = sum(values) / n
    if n == 1:
        return (m, 0)
    var = sum((x - m) ** 2 for x in values) / (n - 1)
    return (m, math.sqrt(var))


def pearson_r(x, y):
    """Pearson correlation. Inputs MUST be aligned by respondent.

    Filters out (None, _) and (_, None) pairs internally so callers can
    pass per-respondent triples that include missing values for some
    constructs. Returns None when fewer than 3 valid pairs remain.
    """
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


def _fmt(x, spec=".2f"):
    """None-safe numeric format (avoids TypeError when mean_sd/pearson_r return None)."""
    if x is None:
        return "N/A"
    return format(x, spec)


def construct_score(row, cols, scale, col_idx):
    """Mean of an item set for one respondent, or None if no valid items.

    Returning None (rather than skipping the respondent) keeps the position
    aligned across constructs so per-respondent triples can be zipped for
    correlations without breaking respondent identity.
    """
    vals = []
    for c in cols:
        val = row[col_idx[c]].strip()
        v = scale.get(val)
        if v is not None:
            vals.append(v)
    if not vals:
        return None
    return sum(vals) / len(vals)


def is_clean(row, col_idx):
    try:
        dur = int(row[col_idx['Duration (in seconds)']])
    except (ValueError, TypeError, IndexError):
        return False
    if dur < 480:
        return False
    if row[col_idx[BARRIER_IRI]].strip() != "Major Barrier":
        return False
    if row[col_idx[READINESS_IRI]].strip() != "Low Readiness/Capability":
        return False
    if row[col_idx[MATURITY_IRI]].strip() != "Level 2: Developing/Repeatable":
        return False
    return True


def get_duration(row, col_idx):
    try:
        return int(row[col_idx['Duration (in seconds)']])
    except (ValueError, TypeError, IndexError):
        return None


def parse_args(argv=None):
    parser = argparse.ArgumentParser(description="Compute CRP V2 descriptive statistics")
    parser.add_argument("--csv", help="Path to survey CSV (auto-discovered if omitted)")
    parser.add_argument(
        "--workspace",
        help="CRP workspace root (overrides CRP_WORKSPACE env). Used when --csv is omitted.",
    )
    return parser.parse_args(argv)


def load_survey(csv_path):
    """Read the Qualtrics-style 3-header CSV and return (header_row, data_rows, col_idx)."""
    with open(csv_path, "r", encoding="utf-8-sig", newline="") as f:
        reader = csv.reader(f)
        try:
            row1 = next(reader)
            next(reader)  # row2 (question text) - not used
            next(reader)  # row3 (import IDs) - not used
        except StopIteration as exc:
            raise ValueError(
                f"CSV {csv_path} has fewer than 3 header rows; expected Qualtrics 3-row format."
            ) from exc
        data = list(reader)
    col_idx = {h: i for i, h in enumerate(row1)}
    all_required = (
        REQUIRED_COLS
        + BARRIER_COLS
        + [BARRIER_IRI]
        + READINESS_COLS
        + [READINESS_IRI]
        + MATURITY_COLS
        + [MATURITY_IRI]
    )
    missing = [c for c in all_required if c not in col_idx]
    if missing:
        raise ValueError(
            f"CSV is missing required columns: {missing}\n"
            f"Header has {len(row1)} columns; first 5: {row1[:5]}"
        )
    return row1, data, col_idx


def main(argv=None):
    args = parse_args(argv)
    try:
        csv_path = args.csv or find_csv(workspace=args.workspace)
    except CrpWorkspaceNotFound as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1
    print(f"Using CSV: {csv_path}")

    _, data, col_idx = load_survey(csv_path)

    # V2 filter
    v2_rows = [r for r in data if r[col_idx['StartDate']] >= '2026-03-23 14:00:00']
    print(f"V2 total: {len(v2_rows)}")
    if not v2_rows:
        print("ERROR: No V2 survey rows found (StartDate >= 2026-03-23 14:00:00).", file=sys.stderr)
        print("       Verify --csv points to a V2 or frozen CRP export.", file=sys.stderr)
        return 1

    clean_rows = [r for r in v2_rows if is_clean(r, col_idx)]
    print(f"Conservative clean N: {len(clean_rows)}")
    if not clean_rows:
        print("ERROR: Zero rows passed the conservative clean filter", file=sys.stderr)
        print("       (Duration >= 480s AND all 3 IRIs correct).", file=sys.stderr)
        print("       Refusing to compute CRP statistics from an empty clean sample.", file=sys.stderr)
        return 1

    # Duration stats
    durations = sorted([get_duration(r, col_idx) for r in clean_rows if get_duration(r, col_idx)])
    if durations:
        med = statistics.median(durations)
        mean = sum(durations) / len(durations)
        print(
            f"\nDuration: median={med/60:.1f}min, mean={mean/60:.1f}min, "
            f"range={min(durations)/60:.1f}-{max(durations)/60:.1f}min"
        )
    else:
        print("\nDuration: no valid durations found in clean rows")

    # ===== BARRIER ITEMS =====
    print("\n=== BARRIER RANKINGS ===")
    barrier_stats = []
    for i, col in enumerate(BARRIER_COLS):
        vals = [BARRIER_SCALE.get(r[col_idx[col]].strip()) for r in clean_rows]
        vals = [v for v in vals if v is not None]
        m, sd = mean_sd(vals)
        barrier_stats.append((BARRIER_NAMES[i], m, sd, len(vals)))
    barrier_stats.sort(key=lambda x: -(x[1] or 0))
    for rank, (name, m, sd, n) in enumerate(barrier_stats, 1):
        print(f"  {rank}. {name}: M={_fmt(m)}, SD={_fmt(sd)}, n={n}")

    # ===== READINESS ITEMS =====
    print("\n=== READINESS RANKINGS ===")
    readiness_stats = []
    for i, col in enumerate(READINESS_COLS):
        vals = [READINESS_SCALE.get(r[col_idx[col]].strip()) for r in clean_rows]
        vals = [v for v in vals if v is not None]
        m, sd = mean_sd(vals)
        readiness_stats.append((READINESS_NAMES[i], m, sd, len(vals)))
    readiness_stats.sort(key=lambda x: -(x[1] or 0))
    for rank, (name, m, sd, n) in enumerate(readiness_stats, 1):
        print(f"  {rank}. {name}: M={_fmt(m)}, SD={_fmt(sd)}, n={n}")

    # ===== MATURITY ITEMS =====
    print("\n=== MATURITY RANKINGS ===")
    maturity_stats = []
    for i, col in enumerate(MATURITY_COLS):
        vals = [MATURITY_SCALE.get(r[col_idx[col]].strip()) for r in clean_rows]
        vals = [v for v in vals if v is not None]
        m, sd = mean_sd(vals)
        maturity_stats.append((MATURITY_NAMES[i], m, sd, len(vals)))
    maturity_stats.sort(key=lambda x: -(x[1] or 0))
    for rank, (name, m, sd, n) in enumerate(maturity_stats, 1):
        print(f"  {rank}. {name}: M={_fmt(m)}, SD={_fmt(sd)}, n={n}")

    # ===== PERSON-LEVEL CONSTRUCT SCORES (aligned by respondent) =====
    # IMPORTANT: Build (b, r, m) per-respondent in a single pass with None
    # placeholders for all-missing constructs. This preserves respondent
    # alignment so the pearson_r calls below correlate matched values for
    # the same respondent. The earlier per-construct list-comprehension
    # approach silently dropped respondents with one all-missing construct,
    # which then gave correlations between values from different people.
    person_scores = []
    for r in clean_rows:
        b = construct_score(r, BARRIER_COLS, BARRIER_SCALE, col_idx)
        rd = construct_score(r, READINESS_COLS, READINESS_SCALE, col_idx)
        mt = construct_score(r, MATURITY_COLS, MATURITY_SCALE, col_idx)
        person_scores.append((b, rd, mt))

    b_person = [s[0] for s in person_scores if s[0] is not None]
    r_person = [s[1] for s in person_scores if s[1] is not None]
    m_person = [s[2] for s in person_scores if s[2] is not None]
    bgm, bgsd = mean_sd(b_person)
    rgm, rgsd = mean_sd(r_person)
    mgm, mgsd = mean_sd(m_person)
    print(f"\nBarrier Grand Mean: M={_fmt(bgm)}, SD={_fmt(bgsd)}")
    print(f"Readiness Grand Mean: M={_fmt(rgm)}, SD={_fmt(rgsd)}")
    print(f"Maturity Grand Mean: M={_fmt(mgm)}, SD={_fmt(mgsd)}")

    # Aligned pairs - pearson_r filters None pairs internally
    print("\n=== CORRELATIONS ===")
    br = pearson_r([s[0] for s in person_scores], [s[1] for s in person_scores])
    bm = pearson_r([s[0] for s in person_scores], [s[2] for s in person_scores])
    rm = pearson_r([s[1] for s in person_scores], [s[2] for s in person_scores])
    print(f"B-R: r={_fmt(br)}")
    print(f"B-M: r={_fmt(bm)}")
    print(f"R-M: r={_fmt(rm)}")

    # ===== DEMOGRAPHICS =====
    print("\n=== DEMOGRAPHICS ===")

    roles = Counter()
    for r in clean_rows:
        raw = r[col_idx['Q1_Role']].strip()
        roles[ROLE_MAP.get(raw, 'Unknown')] += 1

    print("Roles:")
    for role, ct in roles.most_common():
        print(f"  {role}: {ct} ({ct/len(clean_rows)*100:.1f}%)")

    tech_rows = [r for r in clean_rows if ROLE_MAP.get(r[col_idx['Q1_Role']].strip(), '') in TECH_TITLES]
    nontech_rows = [r for r in clean_rows if ROLE_MAP.get(r[col_idx['Q1_Role']].strip(), '') in NONTECH_TITLES]
    other_rows = [r for r in clean_rows if ROLE_MAP.get(r[col_idx['Q1_Role']].strip(), '') == 'Other']
    print(f"\nTechnical (CIO/CTO): n={len(tech_rows)}")
    print(f"Non-Technical (CEO/CFO/COO/CHRO/CMO/CSO/CRO): n={len(nontech_rows)}")
    print(f"Other: n={len(other_rows)}")

    # Grand means by role group (uses same aligned-triple pattern)
    for gname, grows in [("Technical", tech_rows), ("Non-Technical", nontech_rows), ("Other", other_rows)]:
        if not grows:
            continue
        bv = [construct_score(r, BARRIER_COLS, BARRIER_SCALE, col_idx) for r in grows]
        rv = [construct_score(r, READINESS_COLS, READINESS_SCALE, col_idx) for r in grows]
        mv = [construct_score(r, MATURITY_COLS, MATURITY_SCALE, col_idx) for r in grows]
        bm_, _ = mean_sd([v for v in bv if v is not None])
        rm_, _ = mean_sd([v for v in rv if v is not None])
        mm_, _ = mean_sd([v for v in mv if v is not None])
        print(f"  {gname}: B={_fmt(bm_)}, R={_fmt(rm_)}, M={_fmt(mm_)}")

    print("\nOrg Size:")
    for os_val, ct in Counter(r[col_idx['Q4_OrgSize']].strip() for r in clean_rows).most_common():
        print(f"  {os_val}: {ct} ({ct/len(clean_rows)*100:.1f}%)")

    print("\nProfit Model:")
    for pm, ct in Counter(r[col_idx['Q5_ProfitModel']].strip() for r in clean_rows).most_common():
        print(f"  {pm}: {ct} ({ct/len(clean_rows)*100:.1f}%)")

    print("\nIndustry:")
    for ind, ct in Counter(r[col_idx['Q3_Industry']].strip() for r in clean_rows).most_common():
        print(f"  {ind}: {ct} ({ct/len(clean_rows)*100:.1f}%)")

    print("\nDecision Authority:")
    for da, ct in Counter(r[col_idx['Q2_DecisionAuth']].strip() for r in clean_rows).most_common():
        print(f"  {da}: {ct} ({ct/len(clean_rows)*100:.1f}%)")

    print("\nGeographic:")
    for g, ct in Counter(r[col_idx['Q8_GeoScope']].strip() for r in clean_rows).most_common():
        print(f"  {g}: {ct} ({ct/len(clean_rows)*100:.1f}%)")

    # ===== CROSS-TABS =====
    print("\n=== CROSS-TABS: ORG SIZE ===")

    def org_bucket(row):
        os_val = row[col_idx['Q4_OrgSize']].strip()
        if os_val in ('<100', '100-499'):
            return 'Small (<500)'
        if os_val in ('500-999', '1000-4999'):
            return 'Medium (500-4999)'
        if os_val in ('5000-9999', '10000+'):
            return 'Large (5000+)'
        return None

    for bname in ['Small (<500)', 'Medium (500-4999)', 'Large (5000+)']:
        brows = [r for r in clean_rows if org_bucket(r) == bname]
        if not brows:
            continue
        bv = [construct_score(r, BARRIER_COLS, BARRIER_SCALE, col_idx) for r in brows]
        rv = [construct_score(r, READINESS_COLS, READINESS_SCALE, col_idx) for r in brows]
        mv = [construct_score(r, MATURITY_COLS, MATURITY_SCALE, col_idx) for r in brows]
        bm_, _ = mean_sd([v for v in bv if v is not None])
        rm_, _ = mean_sd([v for v in rv if v is not None])
        mm_, _ = mean_sd([v for v in mv if v is not None])
        print(f"  {bname} (n={len(brows)}): B={_fmt(bm_)}, R={_fmt(rm_)}, M={_fmt(mm_)}")

    print("\n=== CROSS-TABS: PROFIT MODEL ===")
    for pm_name in ['For-Profit', 'Non-Profit', 'Government/Public Sector']:
        prows = [r for r in clean_rows if r[col_idx['Q5_ProfitModel']].strip() == pm_name]
        if not prows:
            continue
        bv = [construct_score(r, BARRIER_COLS, BARRIER_SCALE, col_idx) for r in prows]
        rv = [construct_score(r, READINESS_COLS, READINESS_SCALE, col_idx) for r in prows]
        mv = [construct_score(r, MATURITY_COLS, MATURITY_SCALE, col_idx) for r in prows]
        bm_, _ = mean_sd([v for v in bv if v is not None])
        rm_, _ = mean_sd([v for v in rv if v is not None])
        mm_, _ = mean_sd([v for v in mv if v is not None])
        print(f"  {pm_name} (n={len(prows)}): B={_fmt(bm_)}, R={_fmt(rm_)}, M={_fmt(mm_)}")

    # ===== TECH VS NON-TECH ITEM-LEVEL DIFFS =====
    print("\n=== TOP BARRIER GAPS: TECH vs NON-TECH ===")
    for i, col in enumerate(BARRIER_COLS):
        t_vals = [BARRIER_SCALE.get(r[col_idx[col]].strip()) for r in tech_rows]
        t_vals = [v for v in t_vals if v is not None]
        n_vals = [BARRIER_SCALE.get(r[col_idx[col]].strip()) for r in nontech_rows]
        n_vals = [v for v in n_vals if v is not None]
        if t_vals and n_vals:
            tm, _ = mean_sd(t_vals)
            nm, _ = mean_sd(n_vals)
            if tm is None or nm is None:
                continue
            print(f"  {BARRIER_NAMES[i]}: Tech={tm:.2f}, NonTech={nm:.2f}, diff={tm-nm:+.2f}")

    # ===== DISPOSITION WATERFALL =====
    print("\n=== DISPOSITION WATERFALL ===")
    print(f"V2 total responses: {len(v2_rows)}")
    dur_fail = sum(1 for r in v2_rows if (get_duration(r, col_idx) or 0) < 480)
    speed_ok = [r for r in v2_rows if (get_duration(r, col_idx) or 0) >= 480]
    print(f"Duration < 480s (auto-exclude): {dur_fail}")
    print(f"Duration >= 480s: {len(speed_ok)}")

    def iri_fails(row):
        f = 0
        if row[col_idx[BARRIER_IRI]].strip() != "Major Barrier":
            f += 1
        if row[col_idx[READINESS_IRI]].strip() != "Low Readiness/Capability":
            f += 1
        if row[col_idx[MATURITY_IRI]].strip() != "Level 2: Developing/Repeatable":
            f += 1
        return f

    f2 = sum(1 for r in speed_ok if iri_fails(r) >= 2)
    f1 = sum(1 for r in speed_ok if iri_fails(r) == 1)
    f0 = sum(1 for r in speed_ok if iri_fails(r) == 0)
    print(f"IRI fail 2+: {f2}")
    print(f"IRI fail exactly 1: {f1}")
    print(f"IRI pass all 3: {f0}")

    bp = sum(1 for r in v2_rows if r[col_idx[BARRIER_IRI]].strip() == "Major Barrier")
    rp = sum(1 for r in v2_rows if r[col_idx[READINESS_IRI]].strip() == "Low Readiness/Capability")
    mp = sum(1 for r in v2_rows if r[col_idx[MATURITY_IRI]].strip() == "Level 2: Developing/Repeatable")
    print("\nIRI pass rates (V2 total):")
    print(f"  Barrier: {bp}/{len(v2_rows)} ({bp/len(v2_rows)*100:.1f}%)")
    print(f"  Readiness: {rp}/{len(v2_rows)} ({rp/len(v2_rows)*100:.1f}%)")
    print(f"  Maturity: {mp}/{len(v2_rows)} ({mp/len(v2_rows)*100:.1f}%)")
    print(f"  Average: {(bp + rp + mp) / (3 * len(v2_rows)) * 100:.1f}%")

    print("\n=== Q74 FEEDBACK ===")
    fb_rows = [r for r in clean_rows if r[col_idx['Q74_Feedback']].strip()]
    print(f"Provided feedback: {len(fb_rows)}/{len(clean_rows)} ({len(fb_rows)/len(clean_rows)*100:.1f}%)")

    print("\n=== DONE ===")
    return 0


if __name__ == "__main__":
    sys.exit(main())
