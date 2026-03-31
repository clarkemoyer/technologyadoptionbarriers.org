#!/usr/bin/env python3
"""
TABS V2 Psychometric Legitimacy Audit
======================================

Comprehensive instrument validation covering:
  1. Convergent and discriminant validity (MTMM-style)
  2. Within-scale vs between-scale correlation ratios
  3. IRI attention check effectiveness and validation
  4. Response bias detection (straightlining, acquiescence, ERS)
  5. Order and fatigue effects
  6. Response distribution entropy

Usage:
    python tabs_v2_psychometrics.py <qualtrics_csv_path>

The CSV must be a standard Qualtrics export with 3 header rows.
V2 filter: StartDate >= '2026-03-23 14:00:00'

Author: Clarke Moyer, Penn State Smeal DBA
"""

import csv
import math
import sys
from collections import Counter

# ─────────────────────────────────────────────────────────────
# Configuration (duplicated from analysis script to keep scripts independently runnable)
# ─────────────────────────────────────────────────────────────

V2_START = "2026-03-23 14:00:00"
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
    "B1: Resistance to Change", "B2: Lack of Leadership Support", "B3: Risk-Averse Culture",
    "B4: Insuff. Workforce Skills", "B5: Inadequate Training", "B6: High Implementation Cost",
    "B7: Legacy System Integration", "B8: Inadequate IT Infra", "B9: Difficulty Demonstrating Value",
    "B10: No Clear Strategy", "B11: Insuff. Governance", "B12: Workflow Disruption",
    "B13: Cybersecurity Concerns", "B14: Data Privacy Compliance", "B15: Lack of Trust",
    "B16: Regulatory Complexity", "B17: External Pressure w/o Ready", "B18: Vendor/Partner Difficulty"
]
READINESS_NAMES = [
    "R1: Vision/Leadership", "R2: Tech-Strategy Alignment", "R3: IT Gov. Effectiveness",
    "R4: Culture Openness", "R5: Innovation Support", "R6: Technical Workforce",
    "R7: Training Programs", "R8: Change Management", "R9: IT Infrastructure",
    "R10: System Interoperability", "R11: Technical Support", "R12: Data Governance",
    "R13: Data Quality", "R14: Data Analytics", "R15: Business Process Maturity",
    "R16: Performance Monitoring", "R17: Budget Adequacy"
]
MATURITY_NAMES = [
    "M1: IT Investment & Value", "M2: IT-Enabled Innovation",
    "M3: Process Mgmt & Std", "M4: Data Gov. & Analytics",
    "M5: Tech Risk & Resilience", "M6: Strategic IT Planning",
    "M7: Workforce Capability", "M8: Change Leadership"
]


# ─────────────────────────────────────────────────────────────
# Statistical helpers
# ─────────────────────────────────────────────────────────────

def mean_sd(vals):
    vals = [v for v in vals if v is not None]
    n = len(vals)
    if n == 0: return (None, None)
    m = sum(vals) / n
    if n == 1: return (m, 0.0)
    var = sum((x - m) ** 2 for x in vals) / (n - 1)
    return (m, math.sqrt(var))


def pearson_r(x, y):
    pairs = [(a, b) for a, b in zip(x, y) if a is not None and b is not None]
    n = len(pairs)
    if n < 3: return None
    mx = sum(a for a, b in pairs) / n
    my = sum(b for a, b in pairs) / n
    sx = math.sqrt(sum((a - mx) ** 2 for a, b in pairs) / (n - 1))
    sy = math.sqrt(sum((b - my) ** 2 for a, b in pairs) / (n - 1))
    if sx == 0 or sy == 0: return None
    return sum((a - mx) * (b - my) for a, b in pairs) / ((n - 1) * sx * sy)


def score(row, col, scale, idx):
    val = row[idx[col]].strip()
    return scale.get(val, None)


def get_duration(row, idx):
    try: return int(row[idx['Duration (in seconds)']])
    except (KeyError, ValueError, IndexError): return None


def iri_all_pass(row, idx):
    return (row[idx[BARRIER_IRI]].strip() == IRI_BARRIER_ANSWER and
            row[idx[READINESS_IRI]].strip() == IRI_READINESS_ANSWER and
            row[idx[MATURITY_IRI]].strip() == IRI_MATURITY_ANSWER)


def person_scale_mean(rows, cols, scale, idx):
    out = []
    for r in rows:
        vals = [score(r, c, scale, idx) for c in cols]
        vals = [v for v in vals if v is not None]
        out.append(sum(vals) / len(vals) if vals else None)
    return out


def entropy(vals):
    n = len(vals)
    if n == 0: return 0
    counts = Counter(vals)
    h = 0
    for c in counts.values():
        p = c / n
        if p > 0:
            h -= p * math.log2(p)
    return h


# ─────────────────────────────────────────────────────────────
# Section 1: Convergent & Discriminant Validity
# ─────────────────────────────────────────────────────────────

def section_convergent_discriminant(clean, idx):
    print(f"\n{'=' * 85}")
    print("  SECTION 1: CONVERGENT & DISCRIMINANT VALIDITY")
    print(f"{'=' * 85}")
    print("  Each item's corrected correlation with its OWN scale vs OTHER scale totals")

    b_totals = person_scale_mean(clean, BARRIER_COLS, BARRIER_SCALE, idx)
    r_totals = person_scale_mean(clean, READINESS_COLS, READINESS_SCALE, idx)
    m_totals = person_scale_mean(clean, MATURITY_COLS, MATURITY_SCALE, idx)

    print(f"\n  {'Item':<35} {'Own r':>7} {'B tot':>7} {'R tot':>7} {'M tot':>7} {'Verdict'}")
    print(f"  {'─' * 35} {'─' * 7} {'─' * 7} {'─' * 7} {'─' * 7} {'─' * 12}")

    conv_pass = 0
    conv_fail = 0

    all_scales = [
        (BARRIER_COLS, BARRIER_NAMES, BARRIER_SCALE, "B"),
        (READINESS_COLS, READINESS_NAMES, READINESS_SCALE, "R"),
        (MATURITY_COLS, MATURITY_NAMES, MATURITY_SCALE, "M"),
    ]

    for cols, names, sc, label in all_scales:
        for i, col in enumerate(cols):
            item_vals = [score(r, col, sc, idx) for r in clean]

            # Corrected item-total: exclude this item from own scale
            other_cols = [c for j, c in enumerate(cols) if j != i]
            corrected_own = person_scale_mean(clean, other_cols, sc, idx)

            own_r = pearson_r(item_vals, corrected_own)
            rb = pearson_r(item_vals, b_totals)
            rr = pearson_r(item_vals, r_totals)
            rm = pearson_r(item_vals, m_totals)

            cross_max = max(
                abs(rb) if rb is not None and label != "B" else 0,
                abs(rr) if rr is not None and label != "R" else 0,
                abs(rm) if rm is not None and label != "M" else 0,
            )

            if own_r is not None and own_r > cross_max:
                verdict = "CONV"
                conv_pass += 1
            else:
                verdict = "CROSS-LOAD"
                conv_fail += 1

            rb_str = f"{rb:>+7.3f}" if rb is not None else "    NA"
            rr_str = f"{rr:>+7.3f}" if rr is not None else "    NA"
            rm_str = f"{rm:>+7.3f}" if rm is not None else "    NA"
            own_r_str = f"{own_r:>+7.3f}" if own_r is not None else "    NA"
            print(f"  {names[i]:<35} {own_r_str} {rb_str} {rr_str} {rm_str} {verdict}")

        if label != "M":
            print()

    total = conv_pass + conv_fail
    print(f"\n  SUMMARY: {conv_pass}/{total} items load on own scale ({conv_pass / total * 100:.0f}%)")
    if conv_fail:
        print(f"  {conv_fail} item(s) cross-load more strongly on another scale")


# ─────────────────────────────────────────────────────────────
# Section 2: Within vs Between Scale Correlations
# ─────────────────────────────────────────────────────────────

def section_scale_discrimination(clean, idx):
    print(f"\n{'=' * 85}")
    print("  SECTION 2: WITHIN-SCALE vs BETWEEN-SCALE CORRELATIONS")
    print(f"{'=' * 85}")

    def avg_within(rows, cols, scale):
        data = [[score(r, c, scale, idx) for r in rows] for c in cols]
        corrs = [pearson_r(data[i], data[j]) for i in range(len(cols)) for j in range(i + 1, len(cols))]
        corrs = [r for r in corrs if r is not None]
        return sum(corrs) / len(corrs) if corrs else None

    def avg_between(rows, c1, s1, c2, s2):
        d1 = [[score(r, c, s1, idx) for r in rows] for c in c1]
        d2 = [[score(r, c, s2, idx) for r in rows] for c in c2]
        corrs = []
        for a in d1:
            for b in d2:
                r = pearson_r(a, b)
                if r is not None:
                    corrs.append(abs(r))
        return sum(corrs) / len(corrs) if corrs else None

    bw = avg_within(clean, BARRIER_COLS, BARRIER_SCALE)
    rw = avg_within(clean, READINESS_COLS, READINESS_SCALE)
    mw = avg_within(clean, MATURITY_COLS, MATURITY_SCALE)
    br_b = avg_between(clean, BARRIER_COLS, BARRIER_SCALE, READINESS_COLS, READINESS_SCALE)
    bm_b = avg_between(clean, BARRIER_COLS, BARRIER_SCALE, MATURITY_COLS, MATURITY_SCALE)
    rm_b = avg_between(clean, READINESS_COLS, READINESS_SCALE, MATURITY_COLS, MATURITY_SCALE)

    print(f"\n  Within-scale average r:")
    print(f"    Barriers:  {bw:.3f}")
    print(f"    Readiness: {rw:.3f}")
    print(f"    Maturity:  {mw:.3f}")

    print(f"\n  Between-scale average |r|:")
    print(f"    B x R: {br_b:.3f}")
    print(f"    B x M: {bm_b:.3f}")
    print(f"    R x M: {rm_b:.3f}")

    print(f"\n  Discrimination Ratios (within/max-between, should be >1.0):")
    if bw is not None and max(br_b, bm_b) > 0:
        print(f"    Barriers:  {bw / max(br_b, bm_b):.2f}x")
    else:
        print(f"    Barriers:  N/A")
    if rw is not None and max(br_b, rm_b) > 0:
        print(f"    Readiness: {rw / max(br_b, rm_b):.2f}x")
    else:
        print(f"    Readiness: N/A")
    if mw is not None and max(bm_b, rm_b) > 0:
        print(f"    Maturity:  {mw / max(bm_b, rm_b):.2f}x")
    else:
        print(f"    Maturity:  N/A")


# ─────────────────────────────────────────────────────────────
# Section 3: IRI Attention Check Effectiveness
# ─────────────────────────────────────────────────────────────

def section_iri_effectiveness(v2, clean, idx):
    print(f"\n{'=' * 85}")
    print("  SECTION 3: IRI ATTENTION CHECK EFFECTIVENESS")
    print(f"{'=' * 85}")

    speed_ok = [r for r in v2 if get_duration(r, idx) and get_duration(r, idx) >= MIN_DURATION_CLEAN]
    if not speed_ok:
        print("  No data")
        return

    bp = sum(1 for r in speed_ok if r[idx[BARRIER_IRI]].strip() == IRI_BARRIER_ANSWER)
    rp = sum(1 for r in speed_ok if r[idx[READINESS_IRI]].strip() == IRI_READINESS_ANSWER)
    mp = sum(1 for r in speed_ok if r[idx[MATURITY_IRI]].strip() == IRI_MATURITY_ANSWER)
    all3 = sum(1 for r in speed_ok if iri_all_pass(r, idx))

    print(f"\n  Among duration >= {MIN_DURATION_CLEAN}s (N={len(speed_ok)}):")
    print(f"    Barrier IRI:   {bp}/{len(speed_ok)} ({bp / len(speed_ok) * 100:.1f}%)")
    print(f"    Readiness IRI: {rp}/{len(speed_ok)} ({rp / len(speed_ok) * 100:.1f}%)")
    print(f"    Maturity IRI:  {mp}/{len(speed_ok)} ({mp / len(speed_ok) * 100:.1f}%)")
    print(f"    All 3:         {all3}/{len(speed_ok)} ({all3 / len(speed_ok) * 100:.1f}%)")

    # IRI response distributions
    for iri_col, iri_name, scale_vals, correct in [
        (BARRIER_IRI, "Barrier IRI", list(BARRIER_SCALE.keys()), IRI_BARRIER_ANSWER),
        (READINESS_IRI, "Readiness IRI", list(READINESS_SCALE.keys()), IRI_READINESS_ANSWER),
        (MATURITY_IRI, "Maturity IRI", list(MATURITY_SCALE.keys()), IRI_MATURITY_ANSWER),
    ]:
        print(f"\n  {iri_name} Response Distribution:")
        counts = Counter(r[idx[iri_col]].strip() for r in speed_ok)
        for val in scale_vals:
            ct = counts.get(val, 0)
            marker = " <- CORRECT" if val == correct else ""
            print(f"    {val:45s}: {ct:4d} ({ct / len(speed_ok) * 100:5.1f}%){marker}")

    # Failure patterns
    print(f"\n  IRI Failure Patterns:")
    patterns = Counter()
    for r in speed_ok:
        bp_ = r[idx[BARRIER_IRI]].strip() == IRI_BARRIER_ANSWER
        rp_ = r[idx[READINESS_IRI]].strip() == IRI_READINESS_ANSWER
        mp_ = r[idx[MATURITY_IRI]].strip() == IRI_MATURITY_ANSWER
        patterns[(bp_, rp_, mp_)] += 1

    for (bp_, rp_, mp_), ct in sorted(patterns.items(), key=lambda x: -x[1]):
        b_str = "B+" if bp_ else "B-"
        r_str = "R+" if rp_ else "R-"
        m_str = "M+" if mp_ else "M-"
        print(f"    {b_str} {r_str} {m_str}: {ct:4d} ({ct / len(speed_ok) * 100:5.1f}%)")

    # IRI validation: pass vs fail response differences
    iri_pass_rows = [r for r in speed_ok if iri_all_pass(r, idx)]
    iri_fail_rows = [r for r in speed_ok if not iri_all_pass(r, idx)]

    def pm_list(rows, cols, sc):
        out = []
        for r in rows:
            vals = [score(r, c, sc, idx) for c in cols]
            vals = [v for v in vals if v is not None]
            if vals:
                out.append(sum(vals) / len(vals))
            else:
                out.append(None)
        return out

    pass_b = pm_list(iri_pass_rows, BARRIER_COLS, BARRIER_SCALE)
    fail_b = pm_list(iri_fail_rows, BARRIER_COLS, BARRIER_SCALE)
    pass_r = pm_list(iri_pass_rows, READINESS_COLS, READINESS_SCALE)
    fail_r = pm_list(iri_fail_rows, READINESS_COLS, READINESS_SCALE)

    print(f"\n  IRI Validation (do failers respond differently?):")
    print(f"    Pass (n={len(iri_pass_rows)}): B={mean_sd(pass_b)[0]:.2f} (SD={mean_sd(pass_b)[1]:.2f}), R={mean_sd(pass_r)[0]:.2f}")
    print(f"    Fail (n={len(iri_fail_rows)}): B={mean_sd(fail_b)[0]:.2f} (SD={mean_sd(fail_b)[1]:.2f}), R={mean_sd(fail_r)[0]:.2f}")

    pass_br = pearson_r(pass_b, pass_r)
    fail_br = pearson_r(fail_b, fail_r)
    if pass_br is not None and fail_br is not None:
        print(f"    B-R correlation: Pass={pass_br:.2f}, Fail={fail_br:.2f} (delta={abs(pass_br) - abs(fail_br):+.2f})")
    else:
        pbr_str = f"{pass_br:.2f}" if pass_br is not None else "N/A"
        fbr_str = f"{fail_br:.2f}" if fail_br is not None else "N/A"
        print(f"    B-R correlation: Pass={pbr_str}, Fail={fbr_str}")


# ─────────────────────────────────────────────────────────────
# Section 4: Response Bias Detection
# ─────────────────────────────────────────────────────────────

def section_response_biases(clean, v2, idx):
    print(f"\n{'=' * 85}")
    print("  SECTION 4: RESPONSE BIAS DETECTION")
    print(f"{'=' * 85}")

    if len(clean) == 0:
        print("  No data")
        return

    # 4A: Straightlining
    def check_straightline(row, cols, scale):
        vals = [row[idx[c]].strip() for c in cols if row[idx[c]].strip() in scale]
        return len(vals) >= 3 and len(set(vals)) == 1

    print("\n  4A: Straightlining (all identical responses within scale):")
    for label, rows in [("Clean", clean), ("All V2", v2)]:
        bs = sum(1 for r in rows if check_straightline(r, BARRIER_COLS, BARRIER_SCALE))
        rs = sum(1 for r in rows if check_straightline(r, READINESS_COLS, READINESS_SCALE))
        ms = sum(1 for r in rows if check_straightline(r, MATURITY_COLS, MATURITY_SCALE))
        print(f"    {label} (N={len(rows)}): B={bs} ({bs / len(rows) * 100:.1f}%), "
              f"R={rs} ({rs / len(rows) * 100:.1f}%), M={ms} ({ms / len(rows) * 100:.1f}%)")

    # 4B: Low variance
    def low_variance(row, cols, scale):
        vals = [row[idx[c]].strip() for c in cols if row[idx[c]].strip() in scale]
        return len(set(vals)) <= 2 and len(vals) >= 5

    print("\n  4B: Low-variance responding (<=2 unique values):")
    bl = sum(1 for r in clean if low_variance(r, BARRIER_COLS, BARRIER_SCALE))
    rl = sum(1 for r in clean if low_variance(r, READINESS_COLS, READINESS_SCALE))
    ml = sum(1 for r in clean if low_variance(r, MATURITY_COLS, MATURITY_SCALE))
    print(f"    Clean: B={bl} ({bl / len(clean) * 100:.1f}%), R={rl} ({rl / len(clean) * 100:.1f}%), "
          f"M={ml} ({ml / len(clean) * 100:.1f}%)")

    # 4C: Acquiescence bias
    print("\n  4C: Acquiescence Bias:")
    person_grand = []
    for r in clean:
        all_vals = []
        for c in BARRIER_COLS:
            v = score(r, c, BARRIER_SCALE, idx)
            if v: all_vals.append(v)
        for c in READINESS_COLS:
            v = score(r, c, READINESS_SCALE, idx)
            if v: all_vals.append(v)
        for c in MATURITY_COLS:
            v = score(r, c, MATURITY_SCALE, idx)
            if v: all_vals.append(v)
        if all_vals:
            person_grand.append(sum(all_vals) / len(all_vals))

    pm_m, pm_s = mean_sd(person_grand)
    print(f"    Grand mean of all-item person means: {pm_m:.2f} (SD={pm_s:.2f})")
    print(f"    Theoretical midpoint: 3.00")
    high = sum(1 for v in person_grand if v >= 4.0)
    low = sum(1 for v in person_grand if v <= 2.0)
    print(f"    Mean >= 4.0 (acquiescence): {high} ({high / len(clean) * 100:.1f}%)")
    print(f"    Mean <= 2.0 (naysaying):    {low} ({low / len(clean) * 100:.1f}%)")

    # 4D: Extreme response style
    print("\n  4D: Extreme Response Style:")
    ers = []
    for r in clean:
        all_vals = []
        for c in BARRIER_COLS:
            v = score(r, c, BARRIER_SCALE, idx)
            if v: all_vals.append(v)
        for c in READINESS_COLS:
            v = score(r, c, READINESS_SCALE, idx)
            if v: all_vals.append(v)
        for c in MATURITY_COLS:
            v = score(r, c, MATURITY_SCALE, idx)
            if v: all_vals.append(v)
        if all_vals:
            extreme = sum(1 for v in all_vals if v in (1, 5))
            ers.append(extreme / len(all_vals))

    ers_m, ers_s = mean_sd(ers)
    high_ers = sum(1 for v in ers if v > 0.60)
    print(f"    Mean extreme proportion: {ers_m:.2f} (SD={ers_s:.2f})")
    print(f"    Expected under uniform: 0.40")
    print(f"    High ERS (>60%): {high_ers} ({high_ers / len(clean) * 100:.1f}%)")


# ─────────────────────────────────────────────────────────────
# Section 5: Order & Fatigue Effects
# ─────────────────────────────────────────────────────────────

def section_order_fatigue(clean, idx):
    print(f"\n{'=' * 85}")
    print("  SECTION 5: ORDER & FATIGUE EFFECTS")
    print(f"{'=' * 85}")

    print("\n  5A: Within-Scale Position Effects (first half vs second half SD):")
    for label, cols, sc in [
        ("Barriers", BARRIER_COLS, BARRIER_SCALE),
        ("Readiness", READINESS_COLS, READINESS_SCALE),
        ("Maturity", MATURITY_COLS, MATURITY_SCALE),
    ]:
        first = cols[:len(cols) // 2]
        second = cols[len(cols) // 2:]

        f_sds = []
        s_sds = []
        for c in first:
            vals = [score(r, c, sc, idx) for r in clean]
            vals = [v for v in vals if v is not None]
            _, sd = mean_sd(vals)
            f_sds.append(sd)
        for c in second:
            vals = [score(r, c, sc, idx) for r in clean]
            vals = [v for v in vals if v is not None]
            _, sd = mean_sd(vals)
            s_sds.append(sd)

        avg_f = sum(f_sds) / len(f_sds)
        avg_s = sum(s_sds) / len(s_sds)
        delta = avg_s - avg_f
        interp = "stable" if abs(delta) < 0.05 else "possible fatigue" if delta > 0 else "possible engagement increase"
        print(f"    {label:12s}: first={avg_f:.3f}, second={avg_s:.3f}, delta={delta:+.3f} ({interp})")

    print("\n  5B: Cross-Scale Missing Data (survey order: B -> R -> M):")
    for label, cols, sc in [
        ("Barriers (Q10-28)", BARRIER_COLS, BARRIER_SCALE),
        ("Readiness (Q47-64)", READINESS_COLS, READINESS_SCALE),
        ("Maturity (Q65-73)", MATURITY_COLS, MATURITY_SCALE),
    ]:
        missing = 0
        total = 0
        for c in cols:
            for r in clean:
                total += 1
                if score(r, c, sc, idx) is None:
                    missing += 1
        pct = missing / total * 100 if total else 0
        print(f"    {label:25s}: {missing}/{total} missing ({pct:.2f}%)")

    # Duration vs quality
    print("\n  5C: Duration vs Response Quality:")
    durations = [(get_duration(r, idx), r) for r in clean if get_duration(r, idx)]
    durations.sort(key=lambda x: x[0])
    q_size = len(durations) // 4
    if q_size == 0:
        print("    Not enough data for quartile analysis")
        return
    fast = [r for _, r in durations[:q_size]]
    slow = [r for _, r in durations[-q_size:]]

    def pm_list(rows, cols, sc):
        out = []
        for r in rows:
            vals = [score(r, c, sc, idx) for c in cols]
            vals = [v for v in vals if v is not None]
            if vals:
                out.append(sum(vals) / len(vals))
            else:
                out.append(None)
        return out

    fb = pm_list(fast, BARRIER_COLS, BARRIER_SCALE)
    sb = pm_list(slow, BARRIER_COLS, BARRIER_SCALE)
    fbm, fbs = mean_sd(fb)
    sbm, sbs = mean_sd(sb)
    fbm_str = f"{fbm:.2f}" if fbm is not None else "NA"
    fbs_str = f"{fbs:.2f}" if fbs is not None else "NA"
    sbm_str = f"{sbm:.2f}" if sbm is not None else "NA"
    sbs_str = f"{sbs:.2f}" if sbs is not None else "NA"
    print(f"    Fastest quartile (n={len(fast)}, <={durations[q_size][0] / 60:.1f}min): B={fbm_str} (SD={fbs_str})")
    print(f"    Slowest quartile (n={len(slow)}, >={durations[-q_size][0] / 60:.1f}min): B={sbm_str} (SD={sbs_str})")


# ─────────────────────────────────────────────────────────────
# Section 6: Response Distribution Entropy
# ─────────────────────────────────────────────────────────────

def section_entropy(clean, idx):
    print(f"\n{'=' * 85}")
    print("  SECTION 6: RESPONSE DISTRIBUTION ENTROPY")
    print(f"{'=' * 85}")

    max_h = math.log2(5)
    print(f"  Max possible entropy (uniform 5-point): {max_h:.3f}")

    items = []
    for cols, names, sc in [
        (BARRIER_COLS, BARRIER_NAMES, BARRIER_SCALE),
        (READINESS_COLS, READINESS_NAMES, READINESS_SCALE),
        (MATURITY_COLS, MATURITY_NAMES, MATURITY_SCALE),
    ]:
        for i, col in enumerate(cols):
            vals = [score(r, col, sc, idx) for r in clean]
            vals = [v for v in vals if v is not None]
            h = entropy(vals)
            ratio = h / max_h
            interp = ("excellent" if ratio > 0.85 else
                      "good" if ratio > 0.70 else
                      "moderate" if ratio > 0.55 else
                      "concentrated")
            items.append((names[i], h, ratio, interp))

    items.sort(key=lambda x: x[2])
    print(f"\n  {'Item':<35} {'H':>6} {'H/Hmax':>7} {'Rating'}")
    print(f"  {'─' * 35} {'─' * 6} {'─' * 7} {'─' * 15}")
    for name, h, ratio, interp in items:
        print(f"  {name:<35} {h:>6.3f} {ratio:>6.1%} {interp}")

    avg = sum(x[2] for x in items) / len(items)
    print(f"\n  Average H/Hmax: {avg:.1%}")


# ─────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────

def main():
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <qualtrics_csv_path>")
        sys.exit(1)

    csv_path = sys.argv[1]
    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.reader(f)
        row1 = next(reader)
        next(reader)  # sub-labels
        next(reader)  # import IDs
        data = list(reader)
    idx = {h: i for i, h in enumerate(row1)}

    v2 = [r for r in data if r[idx['StartDate']] >= V2_START]
    clean = [r for r in v2 if get_duration(r, idx) and get_duration(r, idx) >= MIN_DURATION_CLEAN
             and iri_all_pass(r, idx)]

    print("=" * 85)
    print("  TABS V2 PSYCHOMETRIC LEGITIMACY AUDIT")
    print(f"  Source: {csv_path}")
    print(f"  Clean N={len(clean)}, V2 Total N={len(v2)}")
    print("=" * 85)

    section_convergent_discriminant(clean, idx)
    section_scale_discrimination(clean, idx)
    section_iri_effectiveness(v2, clean, idx)
    section_response_biases(clean, v2, idx)
    section_order_fatigue(clean, idx)
    section_entropy(clean, idx)

    print(f"\n{'=' * 85}")
    print("  AUDIT COMPLETE")
    print(f"{'=' * 85}")


if __name__ == "__main__":
    main()
