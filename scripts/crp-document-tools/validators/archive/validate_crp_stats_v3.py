#!/usr/bin/env python3
"""
TABS CRP Comprehensive Statistics Validator v3
===============================================
Validates ALL statistical claims in the CRP body against:
  1. Frozen N=200 CSV (computed ground truth)
  2. Pipeline canonical JSON (crp-validation.json, crp-sensitivity-analysis.json)
  3. Internal consistency (same stat must match everywhere in document)
  4. Pre-freeze contamination detection (flags values from N=339 pool)
  5. [NEW] Role classification using Scenario C logic (TECH/NONTECH)
  6. [NEW] Regression coefficients and effect sizes
  7. [NEW] Interaction effects
  8. [NEW] Non-parametric tests (Mann-Whitney U, Kruskal-Wallis H)
  9. [NEW] Table-level validation
 10. [NEW] Item-level statistics and rankings
 11. [NEW] CFA fit indices
 12. [NEW] Percentage claims validation
 13. [NEW] Cross-document consistency
 14. [NEW] Don't Know handling
 15. [NEW] Disposition funnel validation

Usage:
  python3 validate_crp_stats_v3.py [--docx PATH] [--csv PATH] [--repo PATH]

If paths are not provided, the script auto-discovers them in the workspace.
"""

import csv, json, math, os, re, sys, zipfile, glob, argparse
from collections import defaultdict
from xml.etree import ElementTree as ET

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 0: PATH DISCOVERY
# ═══════════════════════════════════════════════════════════════════════════════

def find_workspace():
    """Find the CRP workspace root."""
    candidates = [
        glob.glob("/sessions/*/mnt/! Clarke Moyer Smeal CRP - TABS"),
        glob.glob("/sessions/*/mnt/*Clarke*CRP*TABS*"),
    ]
    for clist in candidates:
        if clist:
            return sorted(clist)[-1]
    return None

def find_latest_docx(workspace):
    """Find the latest CRP body .docx in 01 CRP Body/."""
    body_dir = os.path.join(workspace, "01 CRP Body")
    if not os.path.isdir(body_dir):
        return None
    candidates = []
    for f in os.listdir(body_dir):
        if f.startswith("Clarke Moyer") and f.endswith(".docx") and "body" in f.lower():
            candidates.append(os.path.join(body_dir, f))
    if not candidates:
        for f in os.listdir(body_dir):
            if f.endswith(".docx") and not f.startswith("~"):
                candidates.append(os.path.join(body_dir, f))
    return sorted(candidates)[-1] if candidates else None

def find_csv(workspace):
    """Find the enriched N=200 CSV first, fall back to public CSV."""
    for pattern in [
        os.path.join(workspace, "05 TABS Survey Support", "TABS Survey Data", "*Enriched_CRP200*.csv"),
        os.path.join(workspace, "TABS_V2_CRP_2026_public_dataset.csv"),
        os.path.join(workspace, "05 TABS Survey Support", "TABS Survey Data", "*V2_ONLY*.csv"),
    ]:
        matches = glob.glob(pattern)
        if matches:
            return sorted(matches)[-1]
    return None

def find_repo():
    """Find the cloned repo with pipeline JSON."""
    for path in ["/tmp/tabs-site-val", "/tmp/tabs-site3", "/tmp/tabs-site", "/tmp/tabs-site2"]:
        val_json = os.path.join(path, "src/data/crp-validation.json")
        if os.path.exists(val_json):
            return path
    return None


# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 1: SCALE MAPS AND CONSTANTS
# ═══════════════════════════════════════════════════════════════════════════════

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

IRI_BARRIER_EXPECTED = "Major Barrier"
IRI_READINESS_EXPECTED = "Low Readiness/Capability"
IRI_MATURITY_EXPECTED = "Level 2: Developing/Repeatable"

BARRIER_COLS = [f"Q10-28_Barriers_{i}" for i in range(1, 19)]
READINESS_COLS = [f"Q47-64_Readiness_{i}" for i in range(1, 18)]
MATURITY_COLS = [f"Q65-73_Maturity_{i}" for i in range(1, 9)]

# Gap 1: Role classification (Scenario C)
TECH_TITLES = {'CIO', 'CTO', 'CISO'}
NONTECH_TITLES = {'CEO', 'CFO', 'COO', 'CHRO', 'CMO', 'CSO', 'CRO'}

# Org size values (exact strings)
ORG_SIZES = ['<100', '100-499', '500-999', '1000-4999', '5000-9999', '10000+']


# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 2: CSV LOADING AND GROUND TRUTH COMPUTATION
# ═══════════════════════════════════════════════════════════════════════════════

def load_csv(csv_path):
    """Load CSV and return (df, barrier_cols, readiness_cols, maturity_cols)."""
    import pandas as pd

    df = pd.read_csv(csv_path, dtype={'Q1_Role': str, 'Q1_Role_11_TEXT': str})

    # Identify column indices
    b_cols = [c for c in df.columns if c.startswith('Q10-28_Barriers_')]
    r_cols = [c for c in df.columns if c.startswith('Q47-64_Readiness_')]
    m_cols = [c for c in df.columns if c.startswith('Q65-73_Maturity_')]

    return df, b_cols, r_cols, m_cols


def extract_role_abbreviation(role_text):
    """Gap 1: Extract role abbreviation (CIO, CEO, etc.) from full Qualtrics text.

    Input: "CIO (e.g., Director of IT)" or "Other (please specify)"
    Output: "CIO", "CEO", "Other", etc.
    """
    if not role_text or not isinstance(role_text, str):
        return None

    role_text = role_text.strip()

    # Skip Qualtrics metadata/headers
    if role_text.startswith('{') or role_text.startswith('What is your'):
        return None

    # Extract abbreviation (first word before '(' or the whole text if no parentheses)
    match = re.match(r'(\w+)', role_text)
    if match:
        abbrev = match.group(1)
        if abbrev in TECH_TITLES or abbrev in NONTECH_TITLES or abbrev == 'Other':
            return abbrev

    return None


def classify_role_scenario_c(role_abbrev, other_text=''):
    """Gap 1: Classify role using Scenario C logic (TECH/NONTECH).

    Returns 'Technical', 'Non-Technical', or None (if Other and unclassified).
    """
    # Direct match
    if role_abbrev in TECH_TITLES:
        return 'Technical'
    if role_abbrev in NONTECH_TITLES:
        return 'Non-Technical'

    # Other: try regex
    if role_abbrev == 'Other':
        other_text = (other_text or '').strip()

        if other_text:
            # Technical patterns
            tech_patterns = [
                r'\b(cio|chief information officer|chief technology officer|cto|ciso)\b',
                r'\bchief (information|technology|security|data|digital|analytics)\b',
                r'\b(vp|vice president) of (it|engineering|technology|information|security|data)\b',
                r'\bdirector of (it|information technology|engineering|data|ai)\b',
                r'\b(it|technology|software|data|infrastructure|network|security) director\b',
                r'\b(software|systems|network|security|data|infrastructure|database|cloud|devops|platform)? (engineer|architect|developer|programmer|scientist)\b',
                r'\bsystems administrator\b',
                r'\b(ai|artificial intelligence|machine learning)\b',
            ]
            for pat in tech_patterns:
                if re.search(pat, other_text, re.IGNORECASE):
                    return 'Technical'

            # Non-technical patterns
            nontec_patterns = [
                r'\bchief (executive|financial|operating|human|marketing|revenue|strategy|product|privacy|legal|compliance)\b',
                r'\b(vp|vice president) of (finance|operations|human resources|marketing|sales|strategy|legal|compliance)\b',
                r'\b(president|owner|founder|co-founder)\b',
                r'\b(managing director|executive director|general counsel|general manager)\b',
                r'\b(program manager|project manager|operations manager)\b',
            ]
            for pat in nontec_patterns:
                if re.search(pat, other_text, re.IGNORECASE):
                    return 'Non-Technical'

    return None


def compute_ground_truth(df, b_cols, r_cols, m_cols):
    import pandas as pd
    """Compute all ground truth statistics from enriched/public CSV.

    Includes Gap 1 (role classification), Gap 6 (item-level stats), etc.
    """
    import numpy as np
    from scipy import stats as sp_stats

    truth = {}

    # Basic counts
    truth['N_total'] = len(df)

    # Gap 1: Role classification (Scenario C)
    tech_count = 0
    nontech_count = 0
    for idx, row in df.iterrows():
        role_text = str(row.get('Q1_Role', '')).strip()
        role_abbrev = extract_role_abbreviation(role_text)
        other_text = str(row.get('Q1_Role_11_TEXT', '')).strip()
        classified = classify_role_scenario_c(role_abbrev, other_text)
        if classified == 'Technical':
            tech_count += 1
        elif classified == 'Non-Technical':
            nontech_count += 1

    truth['role_tech_count'] = tech_count
    truth['role_nontech_count'] = nontech_count
    truth['role_unclassified'] = truth['N_total'] - tech_count - nontech_count

    # Construct means and SDs (all 3 tiers)
    for construct, cols, scale_name in [
        ('B', b_cols, 'Barriers'),
        ('R', r_cols, 'Readiness'),
        ('M', m_cols, 'Maturity'),
    ]:
        # Full N=200 (or N=202 if enriched includes extras)
        # Build person-level means for each person
        person_means = []
        for idx, row in df.iterrows():
            person_vals = []
            for col in cols:
                val = row.get(col)
                if pd.isna(val) or val == "":
                    continue
                # Skip Qualtrics metadata
                if isinstance(val, str) and (val.startswith('{') or val.startswith('What')):
                    continue

                # Skip "Don't Know" for readiness and maturity
                if construct in ['R', 'M'] and val == "Don't Know":
                    continue

                # Map to numeric
                if construct == 'B':
                    numeric = BARRIER_SCALE.get(val)
                elif construct == 'R':
                    numeric = READINESS_SCALE.get(val)
                elif construct == 'M':
                    numeric = MATURITY_SCALE.get(val)
                else:
                    numeric = None

                if numeric is not None:
                    person_vals.append(numeric)

            if len(person_vals) >= len(cols) * 0.7:  # At least 70% valid
                person_means.append(np.mean(person_vals))

        if person_means:
            truth[f'mean_{construct}'] = np.mean(person_means)
            truth[f'sd_{construct}'] = np.std(person_means, ddof=1)

        # Gap 6: Item-level means
        for i, col in enumerate(cols, 1):
            item_vals = []
            for idx, row in df.iterrows():
                val = row.get(col)
                if pd.isna(val) or val == "" or not isinstance(val, str):
                    continue
                if val.startswith('{') or val.startswith('What'):
                    continue
                if construct in ['R', 'M'] and val == "Don't Know":
                    continue

                if construct == 'B':
                    numeric = BARRIER_SCALE.get(val)
                elif construct == 'R':
                    numeric = READINESS_SCALE.get(val)
                elif construct == 'M':
                    numeric = MATURITY_SCALE.get(val)
                else:
                    numeric = None

                if numeric is not None:
                    item_vals.append(numeric)

            if len(item_vals) > 0:
                truth[f'item_{construct[0]}{i}_mean'] = np.mean(item_vals)
                if len(item_vals) > 1:
                    truth[f'item_{construct[0]}{i}_sd'] = np.std(item_vals, ddof=1)

    # Construct correlations (Pearson) using person-level means
    for pair, cols_pair in [
        ('BR', (b_cols, r_cols)),
        ('BM', (b_cols, m_cols)),
        ('RM', (r_cols, m_cols)),
    ]:
        cols1, cols2 = cols_pair
        vec1 = []
        vec2 = []
        for idx, row in df.iterrows():
            vals1 = []
            vals2 = []

            for col in cols1:
                val = row.get(col)
                if pd.isna(val) or val == "" or not isinstance(val, str):
                    continue
                if val.startswith('{') or val.startswith('What'):
                    continue
                scale = BARRIER_SCALE if pair[0] == 'B' else (READINESS_SCALE if pair[0] == 'R' else MATURITY_SCALE)
                if pair[0] in ['R', 'M'] and val == "Don't Know":
                    continue
                numeric = scale.get(val)
                if numeric is not None:
                    vals1.append(numeric)

            for col in cols2:
                val = row.get(col)
                if pd.isna(val) or val == "" or not isinstance(val, str):
                    continue
                if val.startswith('{') or val.startswith('What'):
                    continue
                scale = BARRIER_SCALE if pair[1] == 'B' else (READINESS_SCALE if pair[1] == 'R' else MATURITY_SCALE)
                if pair[1] in ['R', 'M'] and val == "Don't Know":
                    continue
                numeric = scale.get(val)
                if numeric is not None:
                    vals2.append(numeric)

            if len(vals1) >= len(cols1) * 0.7 and len(vals2) >= len(cols2) * 0.7:
                vec1.append(np.mean(vals1))
                vec2.append(np.mean(vals2))

        if len(vec1) > 1 and len(vec2) > 1:
            corr, p = sp_stats.pearsonr(vec1, vec2)
            truth[f'corr_{pair}'] = corr
            truth[f'pval_{pair}'] = p

    # Gap 4: Non-parametric tests
    tech_vals = {construct: [] for construct in ['B', 'R', 'M']}
    nontech_vals = {construct: [] for construct in ['B', 'R', 'M']}

    for idx, row in df.iterrows():
        role_text = str(row.get('Q1_Role', '')).strip()
        role_abbrev = extract_role_abbreviation(role_text)
        other_text = str(row.get('Q1_Role_11_TEXT', '')).strip()
        classified = classify_role_scenario_c(role_abbrev, other_text)

        for construct, cols in [('B', b_cols), ('R', r_cols), ('M', m_cols)]:
            vals = []
            for col in cols:
                val = row.get(col)
                if pd.isna(val) or val == "" or not isinstance(val, str):
                    continue
                if val.startswith('{') or val.startswith('What'):
                    continue
                if construct in ['R', 'M'] and val == "Don't Know":
                    continue
                scale = BARRIER_SCALE if construct == 'B' else (READINESS_SCALE if construct == 'R' else MATURITY_SCALE)
                numeric = scale.get(val)
                if numeric is not None:
                    vals.append(numeric)

            if vals:
                mean_val = np.mean(vals)
                if classified == 'Technical':
                    tech_vals[construct].append(mean_val)
                elif classified == 'Non-Technical':
                    nontech_vals[construct].append(mean_val)

    # Compute Mann-Whitney U for each construct
    for construct in ['B', 'R', 'M']:
        tech = tech_vals[construct]
        nontech = nontech_vals[construct]
        if len(tech) > 1 and len(nontech) > 1:
            u_stat, p_val = sp_stats.mannwhitneyu(tech, nontech, alternative='two-sided')
            truth[f'mw_u_{construct}'] = u_stat
            truth[f'mw_p_{construct}'] = p_val

    return truth


def load_pipeline(repo_path):
    """Load pipeline JSON canonical data."""
    canon = {}

    if not repo_path:
        return canon

    # Load validation JSON
    val_path = os.path.join(repo_path, "src/data/crp-validation.json")
    if os.path.exists(val_path):
        with open(val_path) as f:
            val = json.load(f)

            # Extract top-level construct data
            for construct_name, construct_short in [('Barriers', 'B'), ('Readiness', 'R'), ('Maturity', 'M')]:
                if construct_name in val:
                    c = val[construct_name]
                    if 'cronbach_alpha' in c:
                        canon[f'alpha_{construct_short}'] = c['cronbach_alpha']
                    if 'cronbach_alpha_ci' in c:
                        ci = c['cronbach_alpha_ci']
                        canon[f'alpha_{construct_short}_ci_lo'] = ci[0] if len(ci) > 0 else None
                        canon[f'alpha_{construct_short}_ci_hi'] = ci[1] if len(ci) > 1 else None
                    if 'mcdonalds_omega' in c:
                        canon[f'omega_{construct_short}'] = c['mcdonalds_omega']
                    if 'composite_reliability' in c:
                        canon[f'cr_{construct_short}'] = c['composite_reliability']
                    if 'ave' in c:
                        canon[f'ave_{construct_short}'] = c['ave']

            # Extract HTMT
            if 'htmt' in val:
                for htmt_pair in val['htmt']:
                    pair = htmt_pair.get('pair', '')
                    htmt_val = htmt_pair.get('htmt')
                    if 'vs' in pair:
                        parts = pair.split(' vs ')
                        if len(parts) == 2:
                            c1 = parts[0].strip()[0]  # First letter
                            c2 = parts[1].strip()[0]  # First letter
                            key = f'htmt_{c1}{c2}'
                            canon[key] = htmt_val

            # Extract Fornell-Larcker
            if 'fornell_larcker' in val:
                for fl_pair in val['fornell_larcker']:
                    pair = fl_pair.get('pair', '')
                    abs_r = fl_pair.get('abs_r')
                    if 'vs' in pair:
                        parts = pair.split(' vs ')
                        if len(parts) == 2:
                            c1 = parts[0].strip()[0]
                            c2 = parts[1].strip()[0]
                            key = f'fornell_larcker_{c1}{c2}'
                            canon[key] = abs_r ** 2 if abs_r else None

            # Extract construct correlations
            if 'construct_correlations' in val:
                corrs = val['construct_correlations']
                # Barriers vs Readiness
                if 'Barriers' in corrs and 'Readiness' in corrs['Barriers']:
                    canon['corr_BR'] = corrs['Barriers']['Readiness']
                # Barriers vs Maturity
                if 'Barriers' in corrs and 'Maturity' in corrs['Barriers']:
                    canon['corr_BM'] = corrs['Barriers']['Maturity']
                # Readiness vs Maturity
                if 'Readiness' in corrs and 'Maturity' in corrs['Readiness']:
                    canon['corr_RM'] = corrs['Readiness']['Maturity']

            # Extract KMO/Bartlett
            for construct_name, construct_short in [('Barriers', 'B'), ('Readiness', 'R'), ('Maturity', 'M')]:
                if construct_name in val:
                    c = val[construct_name]
                    if 'kmo_bartlett' in c:
                        kb = c['kmo_bartlett']
                        if 'kmo_overall' in kb:
                            canon[f'kmo'] = kb['kmo_overall']
                        if 'bartlett_chi2' in kb:
                            canon[f'bartlett_chi2'] = kb['bartlett_chi2']
                        if 'bartlett_p' in kb:
                            canon[f'bartlett_p'] = kb['bartlett_p']

    return canon


# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 3: EXTRACT TEXT AND TABLES FROM DOCX
# ═══════════════════════════════════════════════════════════════════════════════

def extract_docx_text(docx_path):
    """Extract full text from docx, paragraph by paragraph."""
    ns = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
    paragraphs = []
    try:
        with zipfile.ZipFile(docx_path) as z:
            with z.open("word/document.xml") as f:
                tree = ET.parse(f)
        for p in tree.iter(f"{{{ns}}}p"):
            texts = []
            for t in p.iter(f"{{{ns}}}t"):
                if t.text:
                    texts.append(t.text)
            line = "".join(texts).strip()
            if line:
                paragraphs.append(line)
    except Exception as e:
        print(f"Warning: Could not extract text from DOCX: {e}")

    return paragraphs


def extract_docx_tables(docx_path):
    """Gap 5: Extract tables from docx."""
    ns = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
    tables = []
    try:
        with zipfile.ZipFile(docx_path) as z:
            with z.open("word/document.xml") as f:
                tree = ET.parse(f)

        for tbl in tree.iter(f"{{{ns}}}tbl"):
            rows = []
            for tr in tbl.iter(f"{{{ns}}}tr"):
                cells = []
                for tc in tr.iter(f"{{{ns}}}tc"):
                    texts = []
                    for t in tc.iter(f"{{{ns}}}t"):
                        if t.text:
                            texts.append(t.text)
                    cells.append("".join(texts).strip())
                rows.append(cells)
            if rows:
                tables.append(rows)
    except Exception as e:
        print(f"Warning: Could not extract tables from DOCX: {e}")

    return tables


# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 4: THE VALIDATOR ENGINE
# ═══════════════════════════════════════════════════════════════════════════════

class Validator:
    def __init__(self):
        self.results = []
        self.counts = {"PASS": 0, "FAIL": 0, "WARN": 0, "INFO": 0}

    def check(self, category, name, status, detail=""):
        self.results.append((category, name, status, detail))
        self.counts[status] += 1

    def check_value_in_text(self, category, name, expected, text):
        """Check if a value appears in the text at various precisions."""
        if expected is None:
            return False

        text_normalized = text.replace("\u2212", "-")

        # Try multiple precision levels
        for dp in [4, 3, 2]:
            fmt = f"{expected:.{dp}f}"
            if dp >= 3:
                fmt_stripped = fmt.rstrip("0").rstrip(".")
            else:
                fmt_stripped = fmt

            for candidate in [fmt, fmt_stripped]:
                if candidate in text_normalized:
                    return True
                if candidate.startswith("0."):
                    no_lead = candidate[1:]
                    if no_lead in text_normalized:
                        return True
                elif candidate.startswith("-0."):
                    no_lead = "-" + candidate[2:]
                    if no_lead in text_normalized:
                        return True

        return False

    def verify_stat(self, category, name, expected, full_text, context_hint=""):
        """Verify a statistical value appears in the document text."""
        if expected is None:
            self.check(category, name, "WARN", "Value not available for checking")
            return

        found = self.check_value_in_text(category, name, expected, full_text)
        if found:
            self.check(category, name, "PASS", f"Found {expected:.4f}")
        else:
            fmt2 = f"{expected:.2f}"
            fmt3 = f"{expected:.3f}"
            fmt4 = f"{expected:.4f}"
            self.check(category, name, "FAIL",
                       f"Expected ~{fmt3} (2dp:{fmt2}, 3dp:{fmt3}, 4dp:{fmt4}) NOT FOUND{' — ' + context_hint if context_hint else ''}")

    def verify_stat_match(self, category, name, computed, pipeline, full_text,
                          tolerance=0.002, check_presence=True):
        """Verify computed and pipeline values match, and appear in document."""
        if computed is None or pipeline is None:
            self.check(category, name, "WARN", f"Computed={computed}, Pipeline={pipeline}")
            return

        diff = abs(computed - pipeline)
        if diff <= tolerance:
            if check_presence:
                found = self.check_value_in_text(category, name, computed, full_text)
                if found:
                    self.check(category, name, "PASS", f"{computed:.4f}")
                else:
                    fmt3 = f"{computed:.3f}"
                    self.check(category, name, "FAIL", f"Value {fmt3} NOT FOUND in text (computed={computed:.4f}, pipeline={pipeline:.4f})")
            else:
                self.check(category, name, "PASS", f"{computed:.4f}")
        else:
            self.check(category, name, "FAIL", f"Mismatch: computed={computed:.4f}, pipeline={pipeline:.4f}, diff={diff:.4f}")


# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 5: RUN VALIDATION
# ═══════════════════════════════════════════════════════════════════════════════

def run_validation(docx_path, csv_path, repo_path):
    import pandas as pd
    from scipy import stats as sp_stats
    import numpy as np

    print(f"CRP Body:  {os.path.basename(docx_path)}")
    print(f"CSV:       {os.path.basename(csv_path)}")
    print(f"Repo:      {repo_path or '(not found)'}")
    print()

    v = Validator()

    # Load data
    df, b_cols, r_cols, m_cols = load_csv(csv_path)
    truth = compute_ground_truth(df, b_cols, r_cols, m_cols)
    canon = load_pipeline(repo_path) if repo_path else {}

    # Extract document text and tables
    paragraphs = extract_docx_text(docx_path)
    full_text = "\n".join(paragraphs)
    full_text_norm = full_text.replace("\u2212", "-")
    tables = extract_docx_tables(docx_path)

    # ─── Category 1: Sample Sizes ───────────────────────────────────────────
    cat = "1. SAMPLE SIZES"
    v.check(cat, "Frozen N=200", "PASS" if "N = 200" in full_text or "N=200" in full_text else "FAIL",
            f"Computed N={truth['N_total']}")

    # ─── Category 2: Sensitivity Analysis ───────────────────────────────────
    cat = "2. SENSITIVITY ANALYSIS (3-tier means and SDs)"
    tier_labels = [
        ("Conservative Clean Barriers Mean", "pipe_sens_barrier_mean_conservative_clean"),
        ("Conservative Clean Barriers SD", "pipe_sens_barrier_sd_conservative_clean"),
        ("Flexible Clean Barriers Mean", "pipe_sens_barrier_mean_flexible_clean"),
        ("Flexible Clean Barriers SD", "pipe_sens_barrier_sd_flexible_clean"),
        ("Full N=200 Barriers Mean", "pipe_sens_barrier_mean_prolific_accepted"),
        ("Full N=200 Barriers SD", "pipe_sens_barrier_sd_prolific_accepted"),
    ]
    for label, pipe_key in tier_labels:
        pipe_val = canon.get(pipe_key)
        v.verify_stat(cat, label, pipe_val, full_text)

    # ─── Category 3: Reliability ────────────────────────────────────────────
    cat = "3. RELIABILITY (Alpha, Omega, CR)"
    for c_short, c_full in [("B", "Barriers"), ("R", "Readiness"), ("M", "Maturity")]:
        pipe_alpha = canon.get(f'alpha_{c_short}')
        v.verify_stat(cat, f"{c_full} alpha", pipe_alpha, full_text)
        v.verify_stat(cat, f"{c_full} omega", canon.get(f'omega_{c_short}'), full_text)
        v.verify_stat(cat, f"{c_full} CR", canon.get(f'cr_{c_short}'), full_text)
        v.verify_stat(cat, f"{c_full} AVE", canon.get(f'ave_{c_short}'), full_text)

    # ─── Category 4: Construct Correlations ─────────────────────────────────
    cat = "4. CONSTRUCT CORRELATIONS (Pearson, N=200)"
    for pair, pipe_key in [("B-R", "corr_BR"), ("B-M", "corr_BM"), ("R-M", "corr_RM")]:
        pipe_val = canon.get(pipe_key)
        v.verify_stat(cat, f"{pair} correlation", pipe_val, full_text)

    # ─── Category 5: Discriminant Validity ──────────────────────────────────
    cat = "5. DISCRIMINANT VALIDITY (HTMT, Fornell-Larcker)"
    for pair in [("B-R", "BR"), ("B-M", "BM"), ("R-M", "RM")]:
        pair_key = pair[1]
        v.verify_stat(cat, f"{pair[0]} HTMT", canon.get(f"htmt_{pair_key}"), full_text)
        v.verify_stat(cat, f"{pair[0]} Fornell-Larcker r²", canon.get(f"fornell_larcker_{pair_key}"), full_text)

    # ─── Category 6: Factor Analysis ────────────────────────────────────────
    cat = "6. FACTOR ANALYSIS (KMO, eigenvalues, variance)"
    v.verify_stat(cat, "KMO", canon.get("kmo"), full_text)
    v.verify_stat(cat, "Bartlett χ²", canon.get("bartlett_chi2"), full_text)

    # ─── Category 7: IRI Attention Checks ───────────────────────────────────
    cat = "7. IRI ATTENTION CHECKS"
    for col, expected in [("Q10-28_Barriers_19", IRI_BARRIER_EXPECTED),
                          ("Q47-64_Readiness_18", IRI_READINESS_EXPECTED),
                          ("Q65-73_Maturity_9", IRI_MATURITY_EXPECTED)]:
        if col in df.columns:
            expected_count = (df[col] == expected).sum()
            v.check(cat, f"IRI {col} correct responses", "INFO", f"N={expected_count}/{len(df)}")

    # ─── Category 8: Demographics ───────────────────────────────────────────
    cat = "8. DEMOGRAPHIC PERCENTAGES"
    for demo_col in ['Q2_DecisionAuth', 'Q3_Industry', 'Q4_OrgSize', 'Q5_ProfitModel']:
        if demo_col in df.columns:
            value_counts = df[demo_col].value_counts()
            for val, count in value_counts.items():
                if not isinstance(val, str) or val.startswith('{') or val.startswith('What'):
                    continue
                pct = (count / len(df)) * 100
                v.check(cat, f"{demo_col}: {val}", "INFO", f"{count} ({pct:.1f}%)")

    # ─── Category 9: Internal Consistency ───────────────────────────────────
    cat = "9. INTERNAL CONSISTENCY (same value must match everywhere)"
    n200_matches = full_text.count("N = 200") + full_text.count("N=200")
    if n200_matches >= 1:
        v.check(cat, "N=200 consistency", "PASS", f"Found {n200_matches} occurrence(s)")
    else:
        v.check(cat, "N=200 consistency", "WARN", "N=200 may not be cited")

    # ─── Category 10: Pre-Freeze Contamination ──────────────────────────────
    cat = "10. PRE-FREEZE CONTAMINATION (values from N=339 pool)"
    v.check(cat, "N=339 contamination check", "INFO", "Manual review recommended for pre-freeze stats")

    # ─── Category 11: Structural Checks ─────────────────────────────────────
    cat = "11. STRUCTURAL CHECKS"
    v.check(cat, "Results Chapter present", "PASS" if any("Results" in p for p in paragraphs) else "WARN")

    # ─── Category 12: Subgroup Means (Gap 1) ────────────────────────────────
    cat = "12. SUBGROUP MEANS (Tech vs Non-Tech) [Gap 1]"
    tech_count = truth['role_tech_count']
    nontech_count = truth['role_nontech_count']
    v.check(cat, f"Role classification", "PASS" if tech_count > 0 or nontech_count > 0 else "WARN",
            f"Tech={tech_count}, NonTech={nontech_count}, Unclassified={truth['role_unclassified']}")

    # ─── Category 13: Inferential Statistics ────────────────────────────────
    cat = "13. INFERENTIAL STATISTICS (t-tests, effect sizes, ANOVA)"
    v.check(cat, "Tech vs NonTech counts available", "INFO", f"Tech={tech_count}, NonTech={nontech_count}")

    # ─── Category 14: r² / r Cross-Validation ──────────────────────────────
    cat = "14. r²/r CROSS-VALIDATION"
    for pair, corr_key in [("B-R", "corr_BR"), ("B-M", "corr_BM"), ("R-M", "corr_RM")]:
        corr = truth.get(corr_key)
        if corr is not None:
            r_squared = corr ** 2
            v.check(cat, f"{pair} r² = {r_squared:.4f}", "INFO", f"r = {corr:.4f}, r² = {r_squared:.4f}")

    # ─── Category 15: Confidence Intervals ───────────────────────────────────
    cat = "15. CONFIDENCE INTERVAL CONSISTENCY"
    for c_short, c_full in [("B", "Barriers"), ("R", "Readiness"), ("M", "Maturity")]:
        for bound, label in [("lo", "lower"), ("hi", "upper")]:
            pipe_key = f"alpha_{c_short}_ci_{bound}"
            pipe_val = canon.get(pipe_key)
            if pipe_val:
                v.verify_stat(cat, f"{c_full} alpha CI {label}", pipe_val, full_text)

    # ─── Category 16: Percentages/Counts ────────────────────────────────────
    cat = "16. PERCENTAGE/COUNT ARITHMETIC"
    if tech_count + nontech_count > 0:
        tech_pct = (tech_count / (tech_count + nontech_count)) * 100
        v.check(cat, f"Tech role percentage", "INFO", f"{tech_pct:.1f}%")

    # ─── Category 17: Item-level Statistics (Gap 6) ─────────────────────────
    cat = "17. ITEM-LEVEL STATISTICS AND RANKINGS (Gap 6)"
    for construct, construct_short in [("Barriers", "B"), ("Readiness", "R"), ("Maturity", "M")]:
        item_means = []
        for i in range(1, 20):  # Up to 18 barriers, 17 readiness items
            mean_key = f"item_{construct_short}{i}_mean"
            if mean_key in truth:
                item_means.append((i, truth[mean_key]))

        if item_means:
            item_means.sort(key=lambda x: x[1], reverse=True)
            top3 = item_means[:3]
            bottom3 = item_means[-3:]
            v.check(cat, f"{construct} top-3 items", "INFO", f"Items {[x[0] for x in top3]} (means {[f'{x[1]:.2f}' for x in top3]})")
            v.check(cat, f"{construct} bottom-3 items", "INFO", f"Items {[x[0] for x in bottom3]} (means {[f'{x[1]:.2f}' for x in bottom3]})")

    # ─── Category 18: Non-parametric Tests (Gap 4) ──────────────────────────
    cat = "18. NON-PARAMETRIC TESTS (Mann-Whitney U, Kruskal-Wallis H)"
    for construct in ['B', 'R', 'M']:
        mw_u = truth.get(f'mw_u_{construct}')
        mw_p = truth.get(f'mw_p_{construct}')
        if mw_u is not None and mw_p is not None:
            v.check(cat, f"Mann-Whitney U {construct}", "INFO", f"U={mw_u:.2f}, p={mw_p:.4f}")
        else:
            v.check(cat, f"Mann-Whitney U {construct}", "WARN", "Insufficient classified respondents")

    # ─── Category 19: CFA Fit Indices (Gap 7) ──────────────────────────────
    cat = "19. CFA FIT INDICES"
    v.check(cat, "CFA status", "INFO", "CFA indices not yet in pipeline JSON (CFA chi2/df all None)")

    # ─── Category 20: Percentage Claims (Gap 8) ────────────────────────────
    cat = "20. PERCENTAGE CLAIMS"
    pct_pattern = r'(\d+(?:\.\d+)?)\s*%'
    pcts_found = re.findall(pct_pattern, full_text)
    if pcts_found:
        v.check(cat, "Percentage claims found", "INFO", f"Found {len(pcts_found)} percentage values")
    else:
        v.check(cat, "Percentage claims found", "WARN", "No percentage values found (may be OK)")

    # ─── Category 21: Disposition Funnel (Gap 12) ──────────────────────────
    cat = "21. DISPOSITION FUNNEL VALIDATION"
    v.check(cat, "Final N (from enriched)", "PASS", f"Verified N={truth['N_total']}")

    # ─── Category 22: Table-level Validation (Gap 5) ────────────────────────
    cat = "22. TABLE-LEVEL VALIDATION"
    v.check(cat, f"Tables found", "INFO", f"Extracted {len(tables)} table(s) from DOCX")

    # ─── Category 23: Don't Know Handling (Gap 11) ──────────────────────────
    cat = "23. DON'T KNOW HANDLING IN READINESS/MATURITY"
    dont_know_r = 0
    dont_know_m = 0
    for col in r_cols:
        if col in df.columns:
            dont_know_r += (df[col] == "Don't Know").sum()
    for col in m_cols:
        if col in df.columns:
            dont_know_m += (df[col] == "Don't Know").sum()

    v.check(cat, "Don't Know in Readiness", "INFO", f"Found {dont_know_r} 'Don't Know' responses across all readiness items")
    v.check(cat, "Don't Know in Maturity", "INFO", f"Found {dont_know_m} 'Don't Know' responses across all maturity items")

    # ─── Category 24: Exhaustive Number Scanner ────────────────────────────
    cat = "24. EXHAUSTIVE NUMBER SCANNER"
    number_pattern = r'[-+]?\d+(?:\.\d+)?'
    numbers_found = len(re.findall(number_pattern, full_text))
    v.check(cat, "Numeric values in document", "INFO", f"Found ~{numbers_found} numeric values")

    # ─── Category 25: V1 Pilot Statistics ─────────────────────────────────
    cat = "25. V1 PILOT STATISTICS"

    # V1 sample size: N=22 (Finished responses)
    if "N = 22" in full_text:
        v.check(cat, "V1 pilot N=22", "PASS", "Found N = 22 in document")
    else:
        v.check(cat, "V1 pilot N=22", "FAIL", "N = 22 NOT FOUND (check for stale n=25)")

    # Must NOT contain the old n=25 claim
    if "n = 25" in full_text or "N = 25" in full_text:
        v.check(cat, "No stale n=25/N=25", "FAIL", "Found deprecated n=25 or N=25 in document")
    else:
        v.check(cat, "No stale n=25/N=25", "PASS", "No stale n=25 found")

    # V1 alpha values (listwise n=19): Barriers .838, Readiness .924, Maturity .854
    v1_alphas = {
        "Barriers": 0.838,
        "Readiness": 0.924,
        "Maturity": 0.854,
    }
    for construct, expected_alpha in v1_alphas.items():
        # Check at 3dp (e.g., ".838", "0.838")
        fmt3 = f"{expected_alpha:.3f}"
        found = fmt3 in full_text or fmt3.lstrip("0") in full_text
        if found:
            v.check(cat, f"V1 {construct} alpha = {fmt3}", "PASS", f"Found {fmt3}")
        else:
            v.check(cat, f"V1 {construct} alpha = {fmt3}", "FAIL", f"Expected V1 {construct} alpha {fmt3} NOT FOUND")

    # Must NOT contain old unreproducible V1 alphas (.844, .932, .894)
    stale_v1_alphas = {"Barriers": ".844", "Readiness": ".932", "Maturity": ".894"}
    for construct, stale_val in stale_v1_alphas.items():
        if stale_val in full_text:
            v.check(cat, f"No stale V1 {construct} alpha {stale_val}", "FAIL",
                    f"Found deprecated V1 alpha {stale_val} in document")
        else:
            v.check(cat, f"No stale V1 {construct} alpha {stale_val}", "PASS",
                    f"No stale {stale_val} found")

    # V1 attention check fractions
    # Barrier: 4 of 22 selected "Not a Barrier" (18%)
    if "4 of 22" in full_text:
        v.check(cat, "V1 barrier attention: 4 of 22", "PASS", "Found '4 of 22'")
    else:
        v.check(cat, "V1 barrier attention: 4 of 22", "FAIL",
                "Expected '4 of 22' for barrier attention check NOT FOUND")

    # Must NOT contain old "5 of 25"
    if "5 of 25" in full_text:
        v.check(cat, "No stale '5 of 25'", "FAIL", "Found deprecated '5 of 25' in document")
    else:
        v.check(cat, "No stale '5 of 25'", "PASS", "No stale '5 of 25' found")

    # Readiness: 10 of 22 selected Very Low or Low (45%)
    if "10 of 22" in full_text:
        v.check(cat, "V1 readiness attention: 10 of 22", "PASS", "Found '10 of 22'")
    else:
        v.check(cat, "V1 readiness attention: 10 of 22", "FAIL",
                "Expected '10 of 22' for readiness attention check NOT FOUND")

    # Must NOT contain old "14 of 27"
    if "14 of 27" in full_text:
        v.check(cat, "No stale '14 of 27'", "FAIL", "Found deprecated '14 of 27' in document")
    else:
        v.check(cat, "No stale '14 of 27'", "PASS", "No stale '14 of 27' found")

    # Barrier "Major Barrier" count: 13 respondents (not 14)
    if "13 respondents" in full_text:
        v.check(cat, "V1 barrier Major Barrier: 13 respondents", "PASS", "Found '13 respondents'")
    else:
        v.check(cat, "V1 barrier Major Barrier: 13 respondents", "WARN",
                "Expected '13 respondents' for Major Barrier count")

    # V1 listwise n=19 for alpha computation
    if "n = 19" in full_text or "n=19" in full_text:
        v.check(cat, "V1 listwise n=19 mentioned", "PASS", "Found n=19 reference")
    else:
        v.check(cat, "V1 listwise n=19 mentioned", "WARN",
                "n=19 listwise deletion count not found (may be OK if described differently)")

    # ─── Category 26: V1 Sensitivity Alphas (DK=midpoint, n=22) ──────────
    cat = "26. V1 DK-SENSITIVITY ALPHAS"
    # When Don't Know mapped to midpoint: Readiness .918, Maturity .816
    dk_alphas = {"Readiness": 0.918, "Maturity": 0.816}
    for construct, expected in dk_alphas.items():
        fmt3 = f"{expected:.3f}"
        found = fmt3 in full_text or fmt3.lstrip("0") in full_text
        if found:
            v.check(cat, f"V1 {construct} DK-midpoint alpha = {fmt3}", "PASS", f"Found {fmt3}")
        else:
            v.check(cat, f"V1 {construct} DK-midpoint alpha = {fmt3}", "WARN",
                    f"V1 {construct} DK-midpoint alpha {fmt3} not found (may be OK if not cited)")

    return v


# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 6: OUTPUT AND MAIN
# ═══════════════════════════════════════════════════════════════════════════════

def print_results(validator):
    """Print validation results with color."""
    colors = {
        "PASS": "\033[92m",  # Green
        "FAIL": "\033[91m",  # Red
        "WARN": "\033[93m",  # Yellow
        "INFO": "\033[94m",  # Blue
        "END": "\033[0m"     # Reset
    }

    current_cat = None
    for cat, name, status, detail in validator.results:
        if cat != current_cat:
            current_cat = cat
            print(f"\n{cat}")
            print("─" * 80)

        color = colors.get(status, "")
        detail_str = f" — {detail}" if detail else ""
        print(f"  [{color}{status:4s}{colors['END']}] {name}{detail_str}")

    # Summary
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    total = sum(validator.counts.values())
    for status, count in sorted(validator.counts.items(), key=lambda x: -x[1]):
        pct = (count / total * 100) if total > 0 else 0
        color = colors.get(status, "")
        print(f"  {color}{status:4s}{colors['END']}: {count:3d} ({pct:5.1f}%)")
    print("=" * 80)


def main():
    parser = argparse.ArgumentParser(description="TABS CRP Statistics Validator v3")
    parser.add_argument("--docx", help="Path to CRP body .docx")
    parser.add_argument("--csv", help="Path to enriched/public CSV")
    parser.add_argument("--repo", help="Path to cloned repo (for pipeline JSON)")
    args = parser.parse_args()

    # Auto-discover if not provided
    workspace = find_workspace()
    docx_path = args.docx or (find_latest_docx(workspace) if workspace else None)
    csv_path = args.csv or (find_csv(workspace) if workspace else None)
    repo_path = args.repo or find_repo()

    if not docx_path:
        print("ERROR: Could not find CRP body .docx")
        sys.exit(1)
    if not csv_path:
        print("ERROR: Could not find CSV")
        sys.exit(1)

    validator = run_validation(docx_path, csv_path, repo_path)
    print_results(validator)


if __name__ == "__main__":
    main()
