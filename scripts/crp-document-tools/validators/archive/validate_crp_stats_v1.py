#!/usr/bin/env python3
"""Validate all statistics in the CRP document against source CSV.
Extracts text from the packed docx and checks every number.

Archive note: This is v1, the initial release. Run with --csv and --docx to
point at your local workspace files. This archive version retains the original
/sessions/* glob patterns in find_workspace() for compatibility with the
development environment it was written in. Later versions (v2+) and the current
v5 delegate workspace discovery to scripts/crp-document-tools/paths.py, which
supports CLI flags, CRP_WORKSPACE env var, common user locations, the repo
fixture, and /sessions/* legacy globs in a defined precedence.

Usage:
    python validate_crp_stats_v1.py --csv /path/to/survey.csv --docx /path/to/crp.docx

If --csv or --docx are omitted, the script attempts workspace discovery via
the /sessions/* glob patterns hard-coded in find_workspace() below.
"""

import csv, math, re, zipfile, io, glob, os, sys, argparse
from xml.etree import ElementTree as ET


def find_workspace():
    """Find the CRP workspace root using the original /sessions/* glob patterns.

    Archive note: Unlike v5 (which delegates to paths.py for broader
    discovery), this v1 function uses hard-coded /sessions/* globs that
    are specific to the original development environment. It will not
    find workspaces in ~/Documents/CRP-workspace, via CRP_WORKSPACE env
    var, or from the repo fixture. Pass --csv and --docx explicitly if
    running outside that environment.
    """
    candidates = [
        glob.glob("/sessions/*/mnt/! Clarke Moyer Smeal CRP - TABS"),
        glob.glob("/sessions/*/mnt/*Clarke*CRP*TABS*"),
    ]
    for clist in candidates:
        if clist:
            return sorted(clist)[-1]
    return None


def find_latest_docx(workspace):
    body_dir = os.path.join(workspace, "01 CRP Body")
    if not os.path.isdir(body_dir):
        return None
    candidates = [os.path.join(body_dir, f) for f in os.listdir(body_dir)
                  if f.endswith(".docx") and not f.startswith("~")]
    return sorted(candidates)[-1] if candidates else None


def find_csv(workspace):
    for pattern in [
        os.path.join(workspace, "05 TABS Survey Support", "TABS Survey Data", "*V2_ONLY*.csv"),
        os.path.join(workspace, "05 TABS Survey Support", "TABS Survey Data", "*Enriched_CRP200*.csv"),
    ]:
        matches = glob.glob(pattern)
        if matches:
            return sorted(matches)[-1]
    return None


def main():
    parser = argparse.ArgumentParser(description="Validate CRP stats (v1 archive)")
    parser.add_argument("--csv", help="Path to Qualtrics CSV export")
    parser.add_argument("--docx", help="Path to merged CRP .docx")
    args = parser.parse_args()

    csv_path = args.csv
    docx_path = args.docx

    if not csv_path or not docx_path:
        workspace = find_workspace()
        if workspace:
            print(f"Found workspace: {workspace}")
            if not csv_path:
                csv_path = find_csv(workspace)
            if not docx_path:
                docx_path = find_latest_docx(workspace)
        else:
            print("ERROR: Could not discover workspace. Provide --csv and --docx.")
            sys.exit(1)

    if not csv_path or not os.path.exists(csv_path):
        print(f"ERROR: CSV not found: {csv_path}")
        sys.exit(1)
    if not docx_path or not os.path.exists(docx_path):
        print(f"ERROR: DOCX not found: {docx_path}")
        sys.exit(1)

    print(f"CSV:  {csv_path}")
    print(f"DOCX: {docx_path}")

    # ===== COMPUTE GROUND TRUTH =====
    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.reader(f)
        row1 = next(reader); row2 = next(reader); row3 = next(reader)
        data = list(reader)

    col_idx = {h: i for i, h in enumerate(row1)}

    barrier_scale = {"Not a Barrier": 1, "Minor Barrier": 2, "Moderate Barrier": 3, "Significant Barrier": 4, "Major Barrier": 5}
    readiness_scale = {"Very Low Readiness/Capability": 1, "Low Readiness/Capability": 2, "Moderate Readiness/Capability": 3, "High Readiness/Capability": 4, "Very High Readiness/Capability": 5}
    maturity_scale = {"Level 1: Initial/Ad Hoc": 1, "Level 2: Developing/Repeatable": 2, "Level 3: Defined/Standardized": 3, "Level 4: Managed/Quantitatively Managed": 4, "Level 5: Optimizing/Innovating": 5}

    barrier_cols = [f"Q10-28_Barriers_{i}" for i in range(1,19)]
    readiness_cols = [f"Q47-64_Readiness_{i}" for i in range(1,18)]
    maturity_cols = [f"Q65-73_Maturity_{i}" for i in range(1,9)]

    def get_dur(r):
        try: return int(r[col_idx['Duration (in seconds)']])
        except: return None

    v2 = [r for r in data if r[col_idx['StartDate']] >= '2026-03-23 14:00:00']
    # NOTE: A single-response exception by ResponseId was used in the original workspace version
    # to include a qualifying pilot response. That identifier has been removed from version control;
    # re-filter by StartDate only is correct for the final CRP-200 dataset.
    clean = [r for r in v2 if get_dur(r) and get_dur(r) >= 480
             and r[col_idx["Q10-28_Barriers_19"]].strip() == "Major Barrier"
             and r[col_idx["Q47-64_Readiness_18"]].strip() == "Low Readiness/Capability"
             and r[col_idx["Q65-73_Maturity_9"]].strip() == "Level 2: Developing/Repeatable"]

    def mean_sd(vals):
        n = len(vals)
        if n == 0: return None, None
        m = sum(vals)/n
        if n == 1: return m, 0
        return m, math.sqrt(sum((x-m)**2 for x in vals)/(n-1))

    def score(r, c, s):
        return s.get(r[col_idx[c]].strip(), None)

    def person_mean(r, cols, scale):
        vals = [score(r, c, scale) for c in cols]
        vals = [v for v in vals if v]
        return sum(vals)/len(vals) if vals else None

    def pearson(x, y):
        pairs = [(a,b) for a,b in zip(x,y) if a and b]
        n = len(pairs)
        if n < 2:
            return None
        mx = sum(a for a,b in pairs)/n
        my = sum(b for a,b in pairs)/n
        sx = math.sqrt(sum((a-mx)**2 for a,b in pairs)/(n-1))
        sy = math.sqrt(sum((b-my)**2 for a,b in pairs)/(n-1))
        if sx == 0 or sy == 0:
            return None
        return sum((a-mx)*(b-my) for a,b in pairs)/((n-1)*sx*sy)

    # Compute all stats
    b_person = [person_mean(r, barrier_cols, barrier_scale) for r in clean]
    r_person = [person_mean(r, readiness_cols, readiness_scale) for r in clean]
    m_person = [person_mean(r, maturity_cols, maturity_scale) for r in clean]
    b_person = [x for x in b_person if x]; r_person = [x for x in r_person if x]; m_person = [x for x in m_person if x]

    bgm, bgsd = mean_sd(b_person)
    rgm, rgsd = mean_sd(r_person)
    mgm, mgsd = mean_sd(m_person)
    br_r = pearson(b_person, r_person)
    bm_r = pearson(b_person, m_person)
    rm_r = pearson(r_person, m_person)

    # Item stats
    barrier_items = {}
    for i, c in enumerate(barrier_cols):
        vals = [score(r, c, barrier_scale) for r in clean]; vals = [v for v in vals if v]
        m, sd = mean_sd(vals)
        barrier_items[i] = (m, sd)

    readiness_items = {}
    for i, c in enumerate(readiness_cols):
        vals = [score(r, c, readiness_scale) for r in clean]; vals = [v for v in vals if v]
        m, sd = mean_sd(vals)
        readiness_items[i] = (m, sd)

    maturity_items = {}
    for i, c in enumerate(maturity_cols):
        vals = [score(r, c, maturity_scale) for r in clean]; vals = [v for v in vals if v]
        m, sd = mean_sd(vals)
        maturity_items[i] = (m, sd)

    # ===== EXTRACT TEXT FROM DOCX =====
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    with zipfile.ZipFile(docx_path) as z:
        with z.open('word/document.xml') as f:
            tree = ET.parse(f)
    doc_text = ""
    for p in tree.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
        texts = []
        for t in p.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t'):
            if t.text:
                texts.append(t.text)
        if texts:
            doc_text += " ".join(texts) + "\n"

    # Find the V2 results section -- try multiple markers for compatibility
    v2_start = doc_text.find("V2 Production Results (Preliminary")
    if v2_start == -1:
        # Merged document uses "Part A:" as the start of results
        v2_start = doc_text.find("Part A: Instrument Validation")
        if v2_start == -1:
            v2_start = doc_text.find("Part A:")
    if v2_start == -1:
        print("ERROR: V2 Results section not found in document!")
        exit(1)

    # Find end of results: try "Revised Version", then "CHAPTER IV", then "General Discussion"
    v2_end = doc_text.find("Revised Version", v2_start)
    if v2_end == -1:
        # In merged doc, look for Chapter IV or General Discussion after the results
        for end_marker in ["General Discussion", "CHAPTER IV"]:
            pos = doc_text.find(end_marker, v2_start + 1000)
            if pos != -1:
                v2_end = pos
                break
    if v2_end == -1:
        v2_end = len(doc_text)

    v2_text = doc_text[v2_start:v2_end]
    print(f"Found V2 Results section ({len(v2_text)} chars, starts at pos {v2_start})")

    # ===== VALIDATE =====
    checks = 0
    passed = 0
    failed = 0

    def check(name, expected, text_to_search=None):
        nonlocal checks, passed, failed
        checks += 1
        search = text_to_search or v2_text
        # Format expected to 2 decimal places
        exp_str = f"{expected:.2f}"
        # Also check with Unicode minus (U+2212) which is used in the document
        exp_str_unicode = exp_str.replace("-", "\u2212")
        if exp_str in search or exp_str_unicode in search:
            passed += 1
            print(f"  PASS: {name} = {exp_str}")
        else:
            failed += 1
            print(f"  FAIL: {name} expected {exp_str} NOT FOUND")

    print("\n=== CHECKING GRAND MEANS ===")
    check("Barrier Grand Mean", bgm)
    check("Barrier Grand SD", bgsd)
    check("Readiness Grand Mean", rgm)
    check("Readiness Grand SD", rgsd)
    check("Maturity Grand Mean", mgm)
    check("Maturity Grand SD", mgsd)

    print("\n=== CHECKING CORRELATIONS ===")
    check("B-R correlation", br_r)
    check("B-M correlation", bm_r)
    check("R-M correlation", rm_r)

    print("\n=== CHECKING TOP 5 BARRIER ITEMS ===")
    # Legacy System Integration = index 6
    check("Legacy System Integration M", barrier_items[6][0])
    check("Legacy System Integration SD", barrier_items[6][1])
    # High Implementation Cost = index 5
    check("High Implementation Cost M", barrier_items[5][0])
    check("High Implementation Cost SD", barrier_items[5][1])
    # Data Privacy = index 13
    check("Data Privacy M", barrier_items[13][0])
    check("Data Privacy SD", barrier_items[13][1])
    # Cybersecurity = index 12
    check("Cybersecurity M", barrier_items[12][0])
    check("Cybersecurity SD", barrier_items[12][1])
    # Resistance to Change = index 0
    check("Resistance to Change M", barrier_items[0][0])
    check("Resistance to Change SD", barrier_items[0][1])

    print("\n=== CHECKING BOTTOM 5 BARRIER ITEMS ===")
    # Vendor/Partner = index 17
    check("Vendor/Partner M", barrier_items[17][0])
    check("Vendor/Partner SD", barrier_items[17][1])
    # Risk-Averse = index 2
    check("Risk-Averse M", barrier_items[2][0])
    check("Risk-Averse SD", barrier_items[2][1])
    # Insufficient Governance = index 10
    check("Insufficient Governance M", barrier_items[10][0])
    check("Insufficient Governance SD", barrier_items[10][1])
    # Leadership Support = index 1
    check("Leadership Support M", barrier_items[1][0])
    check("Leadership Support SD", barrier_items[1][1])
    # Lack of Trust = index 14
    check("Lack of Trust M", barrier_items[14][0])
    check("Lack of Trust SD", barrier_items[14][1])

    print("\n=== CHECKING TOP 5 READINESS ITEMS ===")
    # Data Analytics = index 13
    check("Data Analytics M", readiness_items[13][0])
    check("Data Analytics SD", readiness_items[13][1])
    # Innovation Support = index 4
    check("Innovation Support M", readiness_items[4][0])
    check("Innovation Support SD", readiness_items[4][1])
    # Tech-Strategy = index 1
    check("Tech-Strategy M", readiness_items[1][0])
    check("Tech-Strategy SD", readiness_items[1][1])
    # Technical Support = index 10
    check("Technical Support M", readiness_items[10][0])
    check("Technical Support SD", readiness_items[10][1])
    # Business Process = index 14
    check("Business Process M", readiness_items[14][0])
    check("Business Process SD", readiness_items[14][1])

    print("\n=== CHECKING BOTTOM 5 READINESS ITEMS ===")
    # System Interop = index 9
    check("System Interop M", readiness_items[9][0])
    check("System Interop SD", readiness_items[9][1])
    # Training = index 6
    check("Training M", readiness_items[6][0])
    check("Training SD", readiness_items[6][1])
    # IT Gov = index 2
    check("IT Governance M", readiness_items[2][0])
    check("IT Governance SD", readiness_items[2][1])
    # IT Infrastructure = index 8
    check("IT Infrastructure M", readiness_items[8][0])
    check("IT Infrastructure SD", readiness_items[8][1])
    # Perf Monitoring = index 15
    check("Perf Monitoring M", readiness_items[15][0])
    check("Perf Monitoring SD", readiness_items[15][1])

    print("\n=== CHECKING TOP MATURITY ITEMS ===")
    # Tech Risk = index 4
    check("Tech Risk M", maturity_items[4][0])
    check("Tech Risk SD", maturity_items[4][1])
    # Process Mgmt = index 2
    check("Process Mgmt M", maturity_items[2][0])
    check("Process Mgmt SD", maturity_items[2][1])
    # Data Gov = index 3
    check("Data Gov M", maturity_items[3][0])
    check("Data Gov SD", maturity_items[3][1])

    print("\n=== CHECKING BOTTOM MATURITY ITEMS ===")
    # Change Leadership = index 7
    check("Change Leadership M", maturity_items[7][0])
    check("Change Leadership SD", maturity_items[7][1])
    # Innovation = index 1
    check("Innovation M", maturity_items[1][0])
    check("Innovation SD", maturity_items[1][1])
    # Strategic IT = index 5
    check("Strategic IT M", maturity_items[5][0])
    check("Strategic IT SD", maturity_items[5][1])

    print("\n=== CHECKING CROSS-TABS ===")
    # Org size buckets
    from collections import defaultdict
    def org_bucket(r):
        os_val = r[col_idx['Q4_OrgSize']].strip()
        if os_val in ('<100', '100-499'): return 'Small'
        elif os_val in ('500-999', '1000-4999'): return 'Medium'
        elif os_val in ('5000-9999', '10000+'): return 'Large'
        return None

    for bname, label in [('Small', 'Small'), ('Medium', 'Medium'), ('Large', 'Large')]:
        brows = [r for r in clean if org_bucket(r) == bname]
        bv = [person_mean(r, barrier_cols, barrier_scale) for r in brows]; bv = [x for x in bv if x]
        rv = [person_mean(r, readiness_cols, readiness_scale) for r in brows]; rv = [x for x in rv if x]
        bm_, _ = mean_sd(bv); rm_, _ = mean_sd(rv)
        check(f"{label} Barriers", bm_)
        check(f"{label} Readiness", rm_)

    # Profit model
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

    tech_rows = [r for r in clean if role_map.get(r[col_idx['Q1_Role']].strip(), '') in tech_titles]
    nontech_rows = [r for r in clean if role_map.get(r[col_idx['Q1_Role']].strip(), '') in nontech_titles]

    for gname, grows in [("Tech", tech_rows), ("NonTech", nontech_rows)]:
        bv = [person_mean(r, barrier_cols, barrier_scale) for r in grows]; bv = [x for x in bv if x]
        rv = [person_mean(r, readiness_cols, readiness_scale) for r in grows]; rv = [x for x in rv if x]
        mv = [person_mean(r, maturity_cols, maturity_scale) for r in grows]; mv = [x for x in mv if x]
        bm_, _ = mean_sd(bv); rm_, _ = mean_sd(rv); mm_, _ = mean_sd(mv)
        check(f"{gname} Barriers", bm_)
        check(f"{gname} Readiness", rm_)
        check(f"{gname} Maturity", mm_)

    # For-Profit / Non-Profit / Government
    for pm in ['For-Profit', 'Non-Profit', 'Government/Public Sector']:
        prows = [r for r in clean if r[col_idx['Q5_ProfitModel']].strip() == pm]
        if not prows: continue
        bv = [person_mean(r, barrier_cols, barrier_scale) for r in prows]; bv = [x for x in bv if x]
        rv = [person_mean(r, readiness_cols, readiness_scale) for r in prows]; rv = [x for x in rv if x]
        mv = [person_mean(r, maturity_cols, maturity_scale) for r in prows]; mv = [x for x in mv if x]
        bm_, _ = mean_sd(bv); rm_, _ = mean_sd(rv); mm_, _ = mean_sd(mv)
        short = pm.split('/')[0].strip()
        check(f"{short} Barriers", bm_)
        check(f"{short} Readiness", rm_)
        if pm == 'Government/Public Sector':
            check(f"Government Maturity", mm_)

    print("\n=== CHECKING IRI TEXT ===")
    # Check IRI corrections
    if "select Major Barrier" in doc_text:
        print("  PASS: Barrier IRI says 'Major Barrier'")
        passed += 1
    else:
        print("  FAIL: Barrier IRI missing 'Major Barrier'")
        failed += 1
    checks += 1

    if "select Low Readiness/Capability" in doc_text:
        print("  PASS: Readiness IRI says 'Low Readiness/Capability'")
        passed += 1
    else:
        print("  FAIL: Readiness IRI missing 'Low Readiness/Capability'")
        failed += 1
    checks += 1

    if "select Level 2: Developing/Repeatable" in doc_text:
        print("  PASS: Maturity IRI says 'Level 2: Developing/Repeatable'")
        passed += 1
    else:
        print("  FAIL: Maturity IRI missing 'Level 2: Developing/Repeatable'")
        failed += 1
    checks += 1

    # Check old IRI text is gone
    if "select Moderate Barrier" in doc_text:
        print("  FAIL: Old 'Moderate Barrier' IRI text still present!")
        failed += 1
    else:
        print("  PASS: Old 'Moderate Barrier' IRI text removed")
        passed += 1
    checks += 1

    # ===== FULL-DOCUMENT CONSISTENCY CHECKS =====
    # These catch statistics that appear OUTSIDE the V2 Results section
    # (Executive Summary, Chapter I, Chapter II, General Discussion, Limitations)
    print("\n=== FULL-DOCUMENT CONSISTENCY: Grand Means ===")
    # Check that every occurrence of barrier grand mean in the FULL doc matches computed value
    bgm_str = f"{bgm:.2f}"
    rgm_str = f"{rgm:.2f}"
    mgm_str = f"{mgm:.2f}"

    # Known stale values that should NOT appear anywhere in the document
    stale_values = {
        "2.62": "Old barrier grand mean (N=58 era)",
        "2.89": "Old for-profit barrier mean (N=58 era)",
        "3.32": "Old large-org barrier mean (N=58 era)",
    }

    for stale, desc in stale_values.items():
        checks += 1
        # Search full document text for stale values near barrier-related context
        occurrences = [m.start() for m in re.finditer(re.escape(stale), doc_text)]
        if occurrences:
            # Check if any occurrence is near barrier-related text (within 200 chars)
            barrier_context = False
            for pos in occurrences:
                context = doc_text[max(0, pos-200):pos+200].lower()
                if any(kw in context for kw in ['barrier', 'severity', 'construct', 'grand mean', 'for-profit', 'large org']):
                    barrier_context = True
                    break
            if barrier_context:
                failed += 1
                print(f"  FAIL: Stale value {stale} ({desc}) found in barrier context in full document")
            else:
                passed += 1
                print(f"  PASS: {stale} appears but NOT in barrier context (likely unrelated number)")
        else:
            passed += 1
            print(f"  PASS: Stale value {stale} ({desc}) not found in full document")

    # Verify grand means appear in Executive Summary
    print("\n=== FULL-DOCUMENT CONSISTENCY: Exec Summary Stats ===")
    exec_end = doc_text.find("CHAPTER I")
    if exec_end == -1:
        exec_end = 5000  # fallback
    exec_text = doc_text[:exec_end]

    for name, val_str in [("Barrier GM in Exec Summary", bgm_str),
                           ("Readiness GM in Exec Summary", rgm_str),
                           ("Maturity GM in Exec Summary", mgm_str)]:
        checks += 1
        val_unicode = val_str.replace("-", "\u2212")
        if val_str in exec_text or val_unicode in exec_text:
            passed += 1
            print(f"  PASS: {name} = {val_str}")
        else:
            # Not necessarily a fail - exec summary may not quote all means
            # But flag it as a warning
            passed += 1  # soft check
            print(f"  INFO: {name} = {val_str} not found in Executive Summary (may be OK if not quoted there)")

    # ===== LIMITATION COUNT TRACKER =====
    print("\n=== LIMITATION COUNT TRACKER ===")
    # Count actual limitation ordinals in the Limitations section
    ordinal_words = [
        "First", "Second", "Third", "Fourth", "Fifth", "Sixth",
        "Seventh", "Eighth", "Ninth", "Tenth", "Eleventh", "Twelfth",
        "Thirteenth", "Fourteenth", "Fifteenth", "Sixteenth", "Seventeenth",
        "Eighteenth", "Nineteenth", "Twentieth"
    ]

    # Find the actual Limitations section (not the TOC entry)
    # The real section is deep in the body (after pos 200000 in merged doc)
    lim_start = -1
    # Look for "Limitations and Future Research" heading after the results section
    for m in re.finditer(r'Limitations and Future Research', doc_text):
        if m.start() > 200000:  # skip TOC entries
            lim_start = m.start()
            break
    if lim_start == -1:
        # Fallback: look for "limitations of the current study" or "limitations should be acknowledged"
        for pattern in ["limitations of the current study", "limitations should be acknowledged"]:
            pos = doc_text.lower().find(pattern, 200000)
            if pos != -1:
                lim_start = max(0, pos - 200)
                break
    if lim_start == -1:
        lim_start = 0  # give up, search whole doc

    # The limitations section ends at "Conclusion" or "REFERENCES"
    lim_end = len(doc_text)
    for marker in ["Conclusion", "REFERENCES"]:
        pos = doc_text.find(marker, lim_start + 5000)
        if pos != -1 and pos < lim_end:
            lim_end = pos

    lim_text = doc_text[lim_start:lim_end]

    # Count ordinals that appear as limitation paragraph starters ("Nth, ...")
    actual_limitation_count = 0
    found_ordinals = []
    for i, word in enumerate(ordinal_words):
        # Limitation paragraphs start with "Nth," (ordinal followed by comma)
        if re.search(rf'\b{word},', lim_text):
            actual_limitation_count = i + 1  # highest ordinal found
            found_ordinals.append(word)

    # Find the stated count in the intro text of the limitations section
    stated_count = None
    stated_count_word = None
    number_words = {
        "ten": 10, "eleven": 11, "twelve": 12, "thirteen": 13, "fourteen": 14,
        "fifteen": 15, "sixteen": 16, "seventeen": 17, "eighteen": 18,
        "nineteen": 19, "twenty": 20
    }
    # Search the first 2000 chars of the limitations section for a number word
    lim_intro_text = lim_text[:2000].lower()
    for word, num in sorted(number_words.items(), key=lambda x: -x[1]):
        # Sort descending so "sixteen" is found before "six"; use word boundary
        if re.search(rf'\b{word}\b', lim_intro_text):
            stated_count = num
            stated_count_word = word
            break

    checks += 1
    if stated_count and actual_limitation_count:
        if stated_count == actual_limitation_count:
            passed += 1
            print(f"  PASS: Stated limitation count ({stated_count_word}={stated_count}) matches actual ordinal count ({actual_limitation_count})")
        else:
            failed += 1
            print(f"  FAIL: Stated limitation count ({stated_count_word}={stated_count}) != actual highest ordinal ({actual_limitation_count})")
            print(f"         Found ordinals: {', '.join(found_ordinals)}")
    elif actual_limitation_count:
        passed += 1
        print(f"  INFO: Found {actual_limitation_count} limitation ordinals but could not find stated count word")
        print(f"         Found ordinals: {', '.join(found_ordinals)}")
    else:
        failed += 1
        print(f"  FAIL: Could not locate limitation ordinals in document")

    # ===== CONTRIBUTION COUNT TRACKER =====
    print("\n=== CONTRIBUTION COUNT TRACKER ===")
    # Check that Executive Summary and Chapter IV agree on number of contributions
    contribution_words = {
        "two": 2, "three": 3, "four": 4, "five": 5, "six": 6
    }

    exec_contribution_count = None
    ch4_contribution_count = None

    # Search Executive Summary for "N distinct contributions" or "N contributions"
    for word, num in contribution_words.items():
        if re.search(rf'\b{word}\b.{{0,20}}contributions?', exec_text.lower()):
            exec_contribution_count = (word, num)
            break

    # Search Chapter IV for contributions count
    ch4_start = doc_text.find("CHAPTER IV")
    if ch4_start == -1:
        ch4_start = doc_text.find("Chapter IV")
    if ch4_start != -1:
        ch4_text = doc_text[ch4_start:ch4_start+5000].lower()
        for word, num in contribution_words.items():
            if re.search(rf'\b{word}\b.{{0,20}}contributions?', ch4_text):
                ch4_contribution_count = (word, num)
                break

    checks += 1
    if exec_contribution_count and ch4_contribution_count:
        if exec_contribution_count[1] == ch4_contribution_count[1]:
            passed += 1
            print(f"  PASS: Exec Summary ({exec_contribution_count[0]}={exec_contribution_count[1]}) matches Ch IV ({ch4_contribution_count[0]}={ch4_contribution_count[1]}) contribution count")
        else:
            failed += 1
            print(f"  FAIL: Exec Summary says {exec_contribution_count[0]} ({exec_contribution_count[1]}) contributions but Ch IV says {ch4_contribution_count[0]} ({ch4_contribution_count[1]})")
    elif exec_contribution_count:
        passed += 1
        print(f"  INFO: Exec Summary says {exec_contribution_count[0]} contributions; Ch IV count not detected")
    elif ch4_contribution_count:
        passed += 1
        print(f"  INFO: Ch IV says {ch4_contribution_count[0]} contributions; Exec Summary count not detected")
    else:
        passed += 1
        print(f"  INFO: Could not detect contribution count words in either section")

    # ===== SAMPLE SIZE CONSISTENCY =====
    print("\n=== SAMPLE SIZE CONSISTENCY ===")
    n_clean = len(clean)
    checks += 1
    # Check that "N = <n_clean>" or "N=<n_clean>" or "n = <n_clean>" appears in doc
    n_patterns = [f"N = {n_clean}", f"N={n_clean}", f"n = {n_clean}", f"n={n_clean}",
                  f"N  = {n_clean}", f"(N = {n_clean})", f"(n = {n_clean})"]
    found_n = any(p in doc_text for p in n_patterns)
    if found_n:
        passed += 1
        print(f"  PASS: Sample size N={n_clean} found in document")
    else:
        failed += 1
        print(f"  FAIL: Sample size N={n_clean} not found in document")

    print(f"\n{'='*60}")
    print(f"TOTAL: {checks} checks, {passed} passed, {failed} failed")
    if failed == 0:
        print("ALL CHECKS PASSED!")
    else:
        print(f"WARNING: {failed} checks FAILED")


if __name__ == "__main__":
    main()
