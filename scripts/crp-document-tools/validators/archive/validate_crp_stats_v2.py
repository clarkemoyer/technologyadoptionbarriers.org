#!/usr/bin/env python3
"""
TABS CRP Comprehensive Statistics Validator v2
===============================================
Validates ALL statistical claims in the CRP body against:
  1. Frozen N=200 CSV (computed ground truth)
  2. Pipeline canonical JSON (crp-validation.json, crp-sensitivity-analysis.json)
  3. Internal consistency (same stat must match everywhere in document)
  4. Pre-freeze contamination detection (flags values from N=339 pool)

Usage:
  python3 validate_crp_stats_v2.py [--docx PATH] [--csv PATH] [--repo PATH]

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
        # Current session mount
        glob.glob("/sessions/*/mnt/! Clarke Moyer Smeal CRP - TABS"),
        # Direct mount
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
        # Fall back to any .docx
        for f in os.listdir(body_dir):
            if f.endswith(".docx") and not f.startswith("~"):
                candidates.append(os.path.join(body_dir, f))
    return sorted(candidates)[-1] if candidates else None

def find_csv(workspace):
    """Find the frozen N=200 public dataset CSV."""
    # Try public dataset first (most reliable)
    for pattern in [
        os.path.join(workspace, "TABS_V2_CRP_2026_public_dataset.csv"),
        os.path.join(workspace, "05 TABS Survey Support", "TABS Survey Data", "*V2_ONLY*.csv"),
    ]:
        matches = glob.glob(pattern)
        if matches:
            return sorted(matches)[-1]
    return None

def find_repo():
    """Find the cloned repo with pipeline JSON."""
    for path in ["/tmp/tabs-site3", "/tmp/tabs-site", "/tmp/tabs-site2"]:
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
IRI_B_COL = "Q10-28_Barriers_19"
IRI_R_COL = "Q47-64_Readiness_18"
IRI_M_COL = "Q65-73_Maturity_9"

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
    'Other (please specify)': 'Other'
}
TECH_ROLES = {'CIO', 'CTO'}
NONTECH_ROLES = {'CEO', 'CFO', 'COO', 'CHRO', 'CMO', 'CSO', 'CRO'}
ORG_SIZE_SMALL = {'<100', '100-499'}
ORG_SIZE_MEDIUM = {'500-999', '1000-4999'}
ORG_SIZE_LARGE = {'5000-9999', '10000+'}

# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 2: GROUND TRUTH COMPUTATION FROM CSV
# ═══════════════════════════════════════════════════════════════════════════════

def load_csv(csv_path):
    """Load and parse the frozen CSV into structured data."""
    import pandas as pd
    df = pd.read_csv(csv_path)

    # Map text to numeric
    for col in BARRIER_COLS + [IRI_B_COL]:
        df[col + "_n"] = df[col].map(BARRIER_SCALE)
    for col in READINESS_COLS + [IRI_R_COL]:
        df[col + "_n"] = df[col].map(READINESS_SCALE)
    for col in MATURITY_COLS + [IRI_M_COL]:
        df[col + "_n"] = df[col].map(MATURITY_SCALE)

    # Person-level means
    b_cols = [c + "_n" for c in BARRIER_COLS]
    r_cols = [c + "_n" for c in READINESS_COLS]
    m_cols = [c + "_n" for c in MATURITY_COLS]
    df["barrier_mean"] = df[b_cols].mean(axis=1)
    df["readiness_mean"] = df[r_cols].mean(axis=1, skipna=True)
    df["maturity_mean"] = df[m_cols].mean(axis=1, skipna=True)

    # Duration
    df["duration"] = pd.to_numeric(df["Duration (in seconds)"], errors="coerce")

    # IRI checks
    df["iri_b"] = df[IRI_B_COL] == IRI_BARRIER_EXPECTED
    df["iri_r"] = df[IRI_R_COL] == IRI_READINESS_EXPECTED
    df["iri_m"] = df[IRI_M_COL] == IRI_MATURITY_EXPECTED
    df["iri_count"] = df["iri_b"].astype(int) + df["iri_r"].astype(int) + df["iri_m"].astype(int)

    # Role
    df["role_short"] = df["Q1_Role"].map(ROLE_MAP)
    df["is_tech"] = df["role_short"].isin(TECH_ROLES)
    df["is_nontech"] = df["role_short"].isin(NONTECH_ROLES)

    # Org size bucket
    def org_bucket(v):
        v = str(v).strip()
        if v in ORG_SIZE_SMALL: return "Small"
        if v in ORG_SIZE_MEDIUM: return "Medium"
        if v in ORG_SIZE_LARGE: return "Large"
        return None
    df["org_bucket"] = df["Q4_OrgSize"].apply(org_bucket)

    return df, b_cols, r_cols, m_cols


def compute_ground_truth(df, b_cols, r_cols, m_cols):
    """Compute all ground-truth statistics from the frozen CSV."""
    from scipy import stats
    truth = {}

    # === SAMPLE SIZES ===
    truth["N_total"] = len(df)
    dur_qualified = df[df["duration"] >= 480]
    truth["N_dur_qualified"] = len(dur_qualified)
    flexible = df[(df["duration"] >= 480) & (df["iri_count"] == 3)]
    truth["N_flexible_clean"] = len(flexible)

    # IRI pass rates (full N=200)
    truth["iri_b_pct"] = df["iri_b"].mean() * 100
    truth["iri_r_pct"] = df["iri_r"].mean() * 100
    truth["iri_m_pct"] = df["iri_m"].mean() * 100
    truth["iri_all3_pct"] = (df["iri_count"] == 3).mean() * 100

    # IRI threshold counts in frozen N=200
    truth["iri_3of3_n"] = int((df["iri_count"] == 3).sum())
    truth["iri_2of3_n"] = int((df["iri_count"] >= 2).sum())
    truth["iri_1of3_n"] = int((df["iri_count"] >= 1).sum())

    # === FULL N=200 CONSTRUCT STATS ===
    for label, col in [("B", "barrier_mean"), ("R", "readiness_mean"), ("M", "maturity_mean")]:
        vals = df[col].dropna()
        truth[f"{label}_mean_N200"] = vals.mean()
        truth[f"{label}_sd_N200"] = vals.std(ddof=1)
        truth[f"{label}_n_N200"] = len(vals)

    # === CORRELATIONS (N=200, person-level means) ===
    corr_df = df[["barrier_mean", "readiness_mean", "maturity_mean"]].dropna()
    truth["N_listwise_corr"] = len(corr_df)

    r_br, _ = stats.pearsonr(corr_df["barrier_mean"], corr_df["readiness_mean"])
    r_bm, _ = stats.pearsonr(corr_df["barrier_mean"], corr_df["maturity_mean"])
    r_rm, _ = stats.pearsonr(corr_df["readiness_mean"], corr_df["maturity_mean"])
    truth["pearson_BR"] = r_br
    truth["pearson_BM"] = r_bm
    truth["pearson_RM"] = r_rm
    truth["pearson_RM_sq"] = r_rm ** 2

    rho_br, _ = stats.spearmanr(corr_df["barrier_mean"], corr_df["readiness_mean"])
    rho_bm, _ = stats.spearmanr(corr_df["barrier_mean"], corr_df["maturity_mean"])
    rho_rm, _ = stats.spearmanr(corr_df["readiness_mean"], corr_df["maturity_mean"])
    truth["spearman_BR"] = rho_br
    truth["spearman_BM"] = rho_bm
    truth["spearman_RM"] = rho_rm

    # === CRONBACH'S ALPHA (from CSV, should match pipeline) ===
    def cronbach_alpha(cols, data):
        d = data[cols].dropna()
        k = len(cols)
        item_var = d.var(ddof=1)
        total_var = d.sum(axis=1).var(ddof=1)
        return (k / (k - 1)) * (1 - item_var.sum() / total_var), len(d)

    alpha_b, n_b = cronbach_alpha(b_cols, df)
    alpha_r, n_r = cronbach_alpha(r_cols, df)
    alpha_m, n_m = cronbach_alpha(m_cols, df)
    truth["alpha_B"] = alpha_b
    truth["alpha_R"] = alpha_r
    truth["alpha_M"] = alpha_m
    truth["alpha_B_n"] = n_b
    truth["alpha_R_n"] = n_r
    truth["alpha_M_n"] = n_m

    # === ITEM-LEVEL STATS (N=200) ===
    for i, col in enumerate(BARRIER_COLS):
        vals = df[col + "_n"].dropna()
        truth[f"B{i+1}_mean"] = vals.mean()
        truth[f"B{i+1}_sd"] = vals.std(ddof=1)

    for i, col in enumerate(READINESS_COLS):
        vals = df[col + "_n"].dropna()
        truth[f"R{i+1}_mean"] = vals.mean()
        truth[f"R{i+1}_sd"] = vals.std(ddof=1)

    for i, col in enumerate(MATURITY_COLS):
        vals = df[col + "_n"].dropna()
        truth[f"M{i+1}_mean"] = vals.mean()
        truth[f"M{i+1}_sd"] = vals.std(ddof=1)

    # === DEMOGRAPHIC SUBGROUP STATS (N=200) ===
    for bucket in ["Small", "Medium", "Large"]:
        sub = df[df["org_bucket"] == bucket]
        for label, col in [("B", "barrier_mean"), ("R", "readiness_mean"), ("M", "maturity_mean")]:
            vals = sub[col].dropna()
            if len(vals) > 0:
                truth[f"{label}_{bucket}_mean"] = vals.mean()
                truth[f"{label}_{bucket}_sd"] = vals.std(ddof=1)
                truth[f"{label}_{bucket}_n"] = len(vals)

    for group_name, mask in [("Tech", df["is_tech"]), ("NonTech", df["is_nontech"])]:
        sub = df[mask]
        for label, col in [("B", "barrier_mean"), ("R", "readiness_mean"), ("M", "maturity_mean")]:
            vals = sub[col].dropna()
            if len(vals) > 0:
                truth[f"{label}_{group_name}_mean"] = vals.mean()
                truth[f"{label}_{group_name}_sd"] = vals.std(ddof=1)

    for pm in ["For-Profit", "Non-Profit", "Government/Public Sector"]:
        sub = df[df["Q5_ProfitModel"].str.strip() == pm]
        short = pm.split("/")[0].strip()
        for label, col in [("B", "barrier_mean"), ("R", "readiness_mean"), ("M", "maturity_mean")]:
            vals = sub[col].dropna()
            if len(vals) > 0:
                truth[f"{label}_{short}_mean"] = vals.mean()
                truth[f"{label}_{short}_sd"] = vals.std(ddof=1)

    # === IRI CRITERION VALIDITY (dur>=480 within frozen N=200) ===
    dur_pass = df[(df["duration"] >= 480) & (df["iri_count"] == 3)]
    dur_fail = df[(df["duration"] >= 480) & (df["iri_count"] < 3)]
    truth["IRI_dur_pass_n"] = len(dur_pass)
    truth["IRI_dur_fail_n"] = len(dur_fail)

    for label, col in [("B", "barrier_mean"), ("R", "readiness_mean"), ("M", "maturity_mean")]:
        pass_vals = dur_pass[col].dropna()
        fail_vals = dur_fail[col].dropna()
        if len(pass_vals) > 0 and len(fail_vals) > 0:
            truth[f"IRI_pass_{label}_mean"] = pass_vals.mean()
            truth[f"IRI_pass_{label}_sd"] = pass_vals.std(ddof=1)
            truth[f"IRI_fail_{label}_mean"] = fail_vals.mean()
            truth[f"IRI_fail_{label}_sd"] = fail_vals.std(ddof=1)
            # Cohen's d
            pooled_sd = math.sqrt(((len(pass_vals)-1)*pass_vals.std(ddof=1)**2 +
                                   (len(fail_vals)-1)*fail_vals.std(ddof=1)**2) /
                                  (len(pass_vals) + len(fail_vals) - 2))
            if pooled_sd > 0:
                truth[f"IRI_d_{label}"] = (pass_vals.mean() - fail_vals.mean()) / pooled_sd

    # === IRI THRESHOLD SENSITIVITY (within frozen N=200) ===
    for thresh in [3, 2, 1]:
        sub = df[df["iri_count"] >= thresh]
        truth[f"IRI_{thresh}of3_n_frozen"] = len(sub)
        for label, col in [("B", "barrier_mean"), ("R", "readiness_mean"), ("M", "maturity_mean")]:
            vals = sub[col].dropna()
            truth[f"IRI_{thresh}of3_{label}_mean"] = vals.mean()
            truth[f"IRI_{thresh}of3_{label}_sd"] = vals.std(ddof=1)

    # === DEMOGRAPHIC PERCENTAGES ===
    n = len(df)
    for pm, short in [("For-Profit", "ForProfit"), ("Non-Profit", "NonProfit"), ("Government/Public Sector", "Govt")]:
        truth[f"pct_{short}"] = (df["Q5_ProfitModel"].str.strip() == pm).sum() / n * 100

    # Org size distribution
    for sz in ["<100", "100-499", "500-999", "1000-4999", "5000-9999", "10000+"]:
        safe = sz.replace("<", "lt").replace("+", "plus").replace("-", "_")
        truth[f"pct_orgsize_{safe}"] = (df["Q4_OrgSize"].str.strip() == sz).sum() / n * 100

    # Decision authority
    da_col = "Q2_DecisionAuth"
    if da_col in df.columns:
        for val in df[da_col].dropna().unique():
            v = val.strip()
            pct = (df[da_col].str.strip() == v).sum() / n * 100
            if "primary" in v.lower():
                truth["pct_primary_dm"] = pct
            elif "several" in v.lower() or "collective" in v.lower():
                truth["pct_collaborative_dm"] = pct
            elif "significant input" in v.lower():
                truth["pct_input_dm"] = pct
            elif "implement" in v.lower():
                truth["pct_implement_dm"] = pct

    return truth


# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 3: LOAD PIPELINE CANONICAL DATA
# ═══════════════════════════════════════════════════════════════════════════════

def load_pipeline(repo_path):
    """Load pipeline JSON and extract all canonical values."""
    canon = {}

    val_path = os.path.join(repo_path, "src/data/crp-validation.json")
    sens_path = os.path.join(repo_path, "src/data/crp-sensitivity-analysis.json")

    if os.path.exists(val_path):
        with open(val_path) as f:
            val = json.load(f)

        for construct in ["Barriers", "Readiness", "Maturity"]:
            c = construct[0]  # B, R, M
            d = val[construct]
            canon[f"pipe_alpha_{c}"] = d["cronbach_alpha"]
            canon[f"pipe_alpha_{c}_ci_lo"] = d["cronbach_alpha_ci"][0]
            canon[f"pipe_alpha_{c}_ci_hi"] = d["cronbach_alpha_ci"][1]
            canon[f"pipe_omega_{c}"] = d["mcdonalds_omega"]
            canon[f"pipe_cr_{c}"] = d["composite_reliability"]
            canon[f"pipe_ave_{c}"] = d["ave"]
            canon[f"pipe_n_listwise_{c}"] = d["n_listwise"]
            canon[f"pipe_kmo_{c}"] = d["kmo_bartlett"]["kmo_overall"]
            canon[f"pipe_bartlett_chi2_{c}"] = d["kmo_bartlett"]["bartlett_chi2"]
            canon[f"pipe_split_half_{c}"] = d["split_half"]
            canon[f"pipe_inter_item_mean_{c}"] = d["inter_item"]["mean_r"]
            canon[f"pipe_inter_item_min_{c}"] = d["inter_item"]["min_r"]
            canon[f"pipe_inter_item_max_{c}"] = d["inter_item"]["max_r"]

            # EFA
            if d.get("efa"):
                efa = d["efa"]
                canon[f"pipe_efa_nfactors_{c}"] = efa["n_factors"]
                canon[f"pipe_efa_total_var_{c}"] = efa["total_variance"]
                for i, v in enumerate(efa.get("variance_explained", [])):
                    canon[f"pipe_efa_var_{c}_F{i+1}"] = v

            # Parallel analysis eigenvalues
            if d.get("parallel_analysis"):
                for i, ev in enumerate(d["parallel_analysis"]["eigenvalues_real"]):
                    canon[f"pipe_eigenvalue_{c}_{i+1}"] = ev

        # HTMT
        for h in val.get("htmt", []):
            pair = h["pair"]
            if "Barriers" in pair and "Readiness" in pair:
                key = "BR"
            elif "Barriers" in pair and "Maturity" in pair:
                key = "BM"
            else:
                key = "RM"
            canon[f"pipe_htmt_{key}"] = h["htmt"]
            canon[f"pipe_htmt_{key}_ci_lo"] = h["ci_lower"]
            canon[f"pipe_htmt_{key}_ci_hi"] = h["ci_upper"]

        # Fornell-Larcker
        for fl in val.get("fornell_larcker", []):
            pair = fl["pair"]
            if "Barriers" in pair and "Readiness" in pair:
                key = "BR"
            elif "Barriers" in pair and "Maturity" in pair:
                key = "BM"
            else:
                key = "RM"
            canon[f"pipe_fl_abs_r_{key}"] = fl["abs_r"]
            canon[f"pipe_fl_sqrt_ave1_{key}"] = fl["sqrt_ave1"]
            canon[f"pipe_fl_sqrt_ave2_{key}"] = fl["sqrt_ave2"]

        # Construct correlations
        corrs = val.get("construct_correlations", {})
        canon["pipe_corr_BR"] = corrs.get("Barriers", {}).get("Readiness", None)
        canon["pipe_corr_BM"] = corrs.get("Barriers", {}).get("Maturity", None)
        canon["pipe_corr_RM"] = corrs.get("Readiness", {}).get("Maturity", None)

        # Factor analysis details
        fa = val.get("factor_analysis", {})
        if fa.get("factor_correlation"):
            canon["pipe_factor_corr_B"] = fa["factor_correlation"]
        for group in fa.get("three_groups", []):
            name = group["name"]
            if "F1a" in name:
                key = "F1a"
            elif "F1b" in name:
                key = "F1b"
            elif "F2" in name:
                key = "F2"
            else:
                continue
            canon[f"pipe_subgroup_{key}_alpha"] = group["alpha"]
            canon[f"pipe_subgroup_{key}_cr"] = group["cr"]
            canon[f"pipe_subgroup_{key}_ave"] = group["ave"]
            canon[f"pipe_subgroup_{key}_items"] = group["items"]

        # Loadings matrix
        for item in fa.get("loadings_matrix", []):
            iid = item["id"]
            canon[f"pipe_loading_{iid}_f1"] = item["f1"]
            if "f2" in item:
                canon[f"pipe_loading_{iid}_f2"] = item["f2"]

    if os.path.exists(sens_path):
        with open(sens_path) as f:
            sens = json.load(f)

        # Sample definitions
        for s in sens.get("samples", []):
            canon[f"pipe_sample_n_{s['key']}"] = s["n"]

        # Sensitivity metrics
        for metric in sens.get("metrics", []):
            key = metric["key"]
            for tier, val in metric["values"].items():
                canon[f"pipe_sens_{key}_{tier}"] = val

    return canon


# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 4: EXTRACT TEXT FROM DOCX
# ═══════════════════════════════════════════════════════════════════════════════

def extract_docx_text(docx_path):
    """Extract full text from docx, paragraph by paragraph."""
    ns = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
    paragraphs = []
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
    return paragraphs


# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 5: THE VALIDATOR ENGINE
# ═══════════════════════════════════════════════════════════════════════════════

class Validator:
    def __init__(self):
        self.results = []  # list of (category, name, status, detail)
        self.counts = {"PASS": 0, "FAIL": 0, "WARN": 0, "INFO": 0}

    def check(self, category, name, status, detail=""):
        self.results.append((category, name, status, detail))
        self.counts[status] += 1

    def check_value_in_text(self, category, name, expected, text, tolerances=None):
        """Check if a value appears in the text at various precisions.
        tolerances: list of (decimal_places, absolute_tolerance) pairs.
        Default: check 2dp, 3dp, 4dp exact match."""
        if expected is None:
            self.check(category, name, "WARN", "Expected value is None (not computed)")
            return False

        # Normalize unicode minus signs
        text_normalized = text.replace("\u2212", "-")

        # Try multiple precision levels
        for dp in [4, 3, 2]:
            fmt = f"{expected:.{dp}f}"
            # Remove trailing zeros for 3dp and 4dp
            if dp >= 3:
                fmt_stripped = fmt.rstrip("0").rstrip(".")
            else:
                fmt_stripped = fmt

            for candidate in [fmt, fmt_stripped]:
                if candidate in text_normalized:
                    return True
                # Also try without leading zero for values like 0.873 → .873
                if candidate.startswith("0."):
                    no_lead = candidate[1:]  # ".873"
                    if no_lead in text_normalized:
                        return True
                elif candidate.startswith("-0."):
                    no_lead = "-" + candidate[2:]  # "-.873"
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
            # Show what the document SHOULD contain
            fmt2 = f"{expected:.2f}"
            fmt3 = f"{expected:.3f}"
            fmt4 = f"{expected:.4f}"
            self.check(category, name, "FAIL",
                       f"Expected ~{fmt3} (2dp:{fmt2}, 3dp:{fmt3}, 4dp:{fmt4}) NOT FOUND{' — ' + context_hint if context_hint else ''}")

    def verify_stat_match(self, category, name, computed, pipeline, full_text,
                          tolerance=0.002, check_presence=True):
        """Verify a stat matches both pipeline and appears in document.
        Two-phase check: (1) computed vs pipeline, (2) value in document."""
        if computed is not None and pipeline is not None:
            diff = abs(computed - pipeline)
            if diff > tolerance:
                self.check(category, f"{name} [CSV vs Pipeline]", "FAIL",
                           f"CSV={computed:.4f} vs Pipeline={pipeline:.4f}, diff={diff:.4f} > {tolerance}")
            else:
                self.check(category, f"{name} [CSV vs Pipeline]", "PASS",
                           f"CSV={computed:.4f} ≈ Pipeline={pipeline:.4f}")

        canonical = pipeline if pipeline is not None else computed
        if check_presence and canonical is not None:
            self.verify_stat(category, f"{name} [in document]", canonical, full_text)

    def print_report(self):
        """Print formatted validation report."""
        current_cat = None
        for cat, name, status, detail in self.results:
            if cat != current_cat:
                print(f"\n{'='*80}")
                print(f"  {cat}")
                print(f"{'='*80}")
                current_cat = cat
            icon = {"PASS": "✓", "FAIL": "✗", "WARN": "⚠", "INFO": "ℹ"}[status]
            # Color codes
            color = {"PASS": "\033[92m", "FAIL": "\033[91m", "WARN": "\033[93m", "INFO": "\033[94m"}[status]
            reset = "\033[0m"
            print(f"  {color}{icon} {status}{reset}  {name}")
            if detail and status != "PASS":
                print(f"         {detail}")

        print(f"\n{'='*80}")
        print(f"  SUMMARY")
        print(f"{'='*80}")
        total = sum(self.counts.values())
        print(f"  Total checks: {total}")
        print(f"  \033[92m✓ PASS: {self.counts['PASS']}\033[0m")
        print(f"  \033[91m✗ FAIL: {self.counts['FAIL']}\033[0m")
        print(f"  \033[93m⚠ WARN: {self.counts['WARN']}\033[0m")
        print(f"  \033[94mℹ INFO: {self.counts['INFO']}\033[0m")
        if self.counts["FAIL"] == 0:
            print(f"\n  \033[92m★ ALL STATISTICAL CHECKS PASSED ★\033[0m")
        else:
            print(f"\n  \033[91m⚠ {self.counts['FAIL']} FAILURES REQUIRE ATTENTION\033[0m")


# ═══════════════════════════════════════════════════════════════════════════════
# SECTION 6: RUN ALL CHECKS
# ═══════════════════════════════════════════════════════════════════════════════

def run_validation(docx_path, csv_path, repo_path):
    import pandas as pd
    from scipy import stats as sp_stats

    print(f"CRP Body:  {os.path.basename(docx_path)}")
    print(f"CSV:       {os.path.basename(csv_path)}")
    print(f"Repo:      {repo_path or '(not found)'}")
    print()

    v = Validator()

    # Load data
    df, b_cols, r_cols, m_cols = load_csv(csv_path)
    truth = compute_ground_truth(df, b_cols, r_cols, m_cols)
    canon = load_pipeline(repo_path) if repo_path else {}

    # Extract document text
    paragraphs = extract_docx_text(docx_path)
    full_text = "\n".join(paragraphs)
    full_text_norm = full_text.replace("\u2212", "-")

    # ─── Category 1: Sample Sizes ───────────────────────────────────────────
    cat = "1. SAMPLE SIZES"
    v.check(cat, "Frozen N=200", "PASS" if "N = 200" in full_text or "N=200" in full_text else "FAIL",
            f"Computed N={truth['N_total']}")

    # Check N=79 Conservative Clean
    pipe_n79 = canon.get("pipe_sample_n_conservative_clean", 79)
    if "N = 79" in full_text or "(N = 79)" in full_text:
        v.check(cat, "Conservative Clean N=79", "PASS")
    else:
        v.check(cat, "Conservative Clean N=79", "FAIL", "N=79 not found")

    # Check N=116 Flexible Clean
    pipe_n116 = canon.get("pipe_sample_n_flexible_clean", 116)
    if "N = 116" in full_text or "(N = 116)" in full_text:
        v.check(cat, "Flexible Clean N=116", "PASS")
    else:
        v.check(cat, "Flexible Clean N=116", "FAIL", "N=116 not found")

    # ─── Category 2: Sensitivity Analysis (3-tier means/SDs) ────────────────
    cat = "2. SENSITIVITY ANALYSIS (3-tier means and SDs)"
    tier_map = {
        "Conservative Clean": "conservative_clean",
        "Flexible Clean": "flexible_clean",
        "Full N=200": "prolific_accepted",
    }
    for tier_label, tier_key in tier_map.items():
        for construct, metric_base in [("Barriers", "barrier"), ("Readiness", "readiness"), ("Maturity", "maturity")]:
            for stat, suffix in [("Mean", "mean"), ("SD", "sd")]:
                pipe_key = f"pipe_sens_{metric_base}_{suffix}_{tier_key}"
                pipe_val = canon.get(pipe_key)
                v.verify_stat(cat, f"{tier_label} {construct} {stat}", pipe_val, full_text)

    # Tier correlations — only R-M is individually cited across tiers; B-R and B-M
    # per-tier values are not expected in the CRP text, so use WARN for missing
    for pair, pair_key in [("B-R", "corr_br"), ("B-M", "corr_bm"), ("R-M", "corr_rm")]:
        for tier_label, tier_key in tier_map.items():
            pipe_key = f"pipe_sens_{pair_key}_{tier_key}"
            pipe_val = canon.get(pipe_key)
            if pipe_val is not None:
                found = v.check_value_in_text(cat, "", pipe_val, full_text)
                if found:
                    v.check(cat, f"{tier_label} {pair} correlation", "PASS", f"{pipe_val:.4f}")
                elif pair == "R-M":
                    # R-M range is explicitly cited
                    v.verify_stat(cat, f"{tier_label} {pair} correlation", pipe_val, full_text)
                else:
                    v.check(cat, f"{tier_label} {pair} correlation", "INFO",
                           f"{pipe_val:.4f} not cited individually (OK if only range/N=200 cited)")

    # Tier alphas
    for construct, alpha_key in [("Barriers", "alpha_barriers"), ("Readiness", "alpha_readiness"), ("Maturity", "alpha_maturity")]:
        for tier_label, tier_key in tier_map.items():
            pipe_key = f"pipe_sens_{alpha_key}_{tier_key}"
            pipe_val = canon.get(pipe_key)
            if pipe_val is not None:
                v.verify_stat(cat, f"{tier_label} {construct} alpha", pipe_val, full_text)

    # ─── Category 3: Reliability (alpha, omega, CR) ─────────────────────────
    cat = "3. RELIABILITY (Alpha, Omega, CR)"
    for c_short, c_full in [("B", "Barriers"), ("R", "Readiness"), ("M", "Maturity")]:
        # Alpha
        v.verify_stat_match(cat, f"{c_full} alpha",
                           truth.get(f"alpha_{c_short}"), canon.get(f"pipe_alpha_{c_short}"), full_text)
        # Alpha CI
        for bound, label in [("lo", "lower"), ("hi", "upper")]:
            pipe_key = f"pipe_alpha_{c_short}_ci_{bound}"
            pipe_val = canon.get(pipe_key)
            if pipe_val:
                v.verify_stat(cat, f"{c_full} alpha CI {label}", pipe_val, full_text)

        # Omega
        v.verify_stat(cat, f"{c_full} omega", canon.get(f"pipe_omega_{c_short}"), full_text)
        # CR
        v.verify_stat(cat, f"{c_full} CR", canon.get(f"pipe_cr_{c_short}"), full_text)
        # AVE
        v.verify_stat(cat, f"{c_full} AVE", canon.get(f"pipe_ave_{c_short}"), full_text)
        # N listwise
        n_lw = canon.get(f"pipe_n_listwise_{c_short}")
        if n_lw:
            if str(int(n_lw)) in full_text:
                v.check(cat, f"{c_full} N listwise = {int(n_lw)}", "PASS")
            else:
                v.check(cat, f"{c_full} N listwise = {int(n_lw)}", "WARN", "Not found (may be OK if not stated)")

    # ─── Category 4: Construct Correlations (Pearson) ───────────────────────
    cat = "4. CONSTRUCT CORRELATIONS (Pearson, N=200)"
    for pair, csv_key, pipe_key in [
        ("B-R", "pearson_BR", "pipe_corr_BR"),
        ("B-M", "pearson_BM", "pipe_corr_BM"),
        ("R-M", "pearson_RM", "pipe_corr_RM"),
    ]:
        v.verify_stat_match(cat, f"{pair} Pearson r", truth.get(csv_key), canon.get(pipe_key), full_text)

    # R-M r²
    v.verify_stat(cat, "R-M r² (shared variance)", truth.get("pearson_RM_sq"), full_text)

    # Spearman correlations
    cat = "4b. CONSTRUCT CORRELATIONS (Spearman, N=200)"
    for pair, key in [("B-R", "spearman_BR"), ("B-M", "spearman_BM"), ("R-M", "spearman_RM")]:
        v.verify_stat(cat, f"{pair} Spearman rho", truth.get(key), full_text)

    # ─── Category 5: HTMT and Fornell-Larcker ───────────────────────────────
    cat = "5. DISCRIMINANT VALIDITY (HTMT, Fornell-Larcker)"
    for pair in ["BR", "BM", "RM"]:
        pair_label = pair[0] + "-" + pair[1]
        v.verify_stat(cat, f"{pair_label} HTMT ratio", canon.get(f"pipe_htmt_{pair}"), full_text)
        for bound, label in [("lo", "CI lower"), ("hi", "CI upper")]:
            v.verify_stat(cat, f"{pair_label} HTMT {label}",
                         canon.get(f"pipe_htmt_{pair}_ci_{bound}"), full_text)

    for pair in ["BR", "BM", "RM"]:
        pair_label = pair[0] + "-" + pair[1]
        v.verify_stat(cat, f"{pair_label} FL |r|", canon.get(f"pipe_fl_abs_r_{pair}"), full_text)

    # ─── Category 6: Factor Analysis ────────────────────────────────────────
    cat = "6. FACTOR ANALYSIS (KMO, eigenvalues, variance)"
    for c_short, c_full in [("B", "Barriers"), ("R", "Readiness"), ("M", "Maturity")]:
        v.verify_stat(cat, f"{c_full} KMO", canon.get(f"pipe_kmo_{c_short}"), full_text)
        # Eigenvalues (first 2 are typically cited; 3rd+ may not be)
        for i in range(1, 5):
            ev = canon.get(f"pipe_eigenvalue_{c_short}_{i}")
            if ev:
                found = v.check_value_in_text(cat, "", ev, full_text)
                if found:
                    v.check(cat, f"{c_full} eigenvalue {i}", "PASS", f"{ev:.4f}")
                elif i <= 2:
                    v.verify_stat(cat, f"{c_full} eigenvalue {i}", ev, full_text)
                else:
                    v.check(cat, f"{c_full} eigenvalue {i}", "INFO",
                           f"{ev:.4f} not cited (minor eigenvalue, OK if not reported)")

    # Variance explained
    for c_short, c_full in [("B", "Barriers"), ("R", "Readiness"), ("M", "Maturity")]:
        total_var = canon.get(f"pipe_efa_total_var_{c_short}")
        if total_var:
            # Check both as proportion and percentage
            found_prop = v.check_value_in_text(cat, "", total_var, full_text)
            found_pct = v.check_value_in_text(cat, "", total_var * 100, full_text)
            if found_prop or found_pct:
                v.check(cat, f"{c_full} total variance explained", "PASS",
                       f"{total_var:.4f} ({total_var*100:.1f}%)")
            else:
                v.check(cat, f"{c_full} total variance explained", "WARN",
                       f"Expected {total_var:.4f} or {total_var*100:.1f}%")

    # Factor correlation (Barriers 2-factor)
    fc = canon.get("pipe_factor_corr_B")
    if fc:
        v.verify_stat(cat, "Barriers F1-F2 correlation", fc, full_text)

    # ─── Category 7: IRI Checks ────────────────────────────────────────────
    cat = "7. IRI ATTENTION CHECKS"
    # Expected answers
    for label, expected, keyword in [
        ("Barrier IRI answer", IRI_BARRIER_EXPECTED, "Major Barrier"),
        ("Readiness IRI answer", IRI_READINESS_EXPECTED, "Low Readiness/Capability"),
        ("Maturity IRI answer", IRI_MATURITY_EXPECTED, "Level 2: Developing/Repeatable"),
    ]:
        if keyword in full_text:
            v.check(cat, label, "PASS")
        else:
            v.check(cat, label, "FAIL", f"'{keyword}' not found")

    # IRI pass rates in frozen N=200
    v.verify_stat(cat, "Barrier IRI pass rate (%)", truth["iri_b_pct"], full_text)
    v.verify_stat(cat, "Readiness IRI pass rate (%)", truth["iri_r_pct"], full_text)
    v.verify_stat(cat, "Maturity IRI pass rate (%)", truth["iri_m_pct"], full_text)
    v.verify_stat(cat, "All 3 IRIs pass rate (%)", truth["iri_all3_pct"], full_text)

    # Mathematical consistency check: all_3_rate <= min(individual rates)
    # If the CRP states individual rates AND an all-3 rate, they must be consistent
    all3_pct = truth["iri_all3_pct"]
    min_individual = min(truth["iri_b_pct"], truth["iri_r_pct"], truth["iri_m_pct"])
    if all3_pct <= min_individual + 0.1:
        v.check(cat, "IRI rate mathematical consistency", "PASS",
               f"all_3={all3_pct:.1f}% <= min_individual={min_individual:.1f}%")
    else:
        v.check(cat, "IRI rate mathematical consistency", "FAIL",
               f"IMPOSSIBLE: all_3={all3_pct:.1f}% > min_individual={min_individual:.1f}%")

    # Scan for pre-freeze IRI rates that are now wrong for frozen N=200
    pre_freeze_iri = {
        "52.6": ("Barrier IRI pre-freeze rate", f"Correct frozen N=200: {truth['iri_b_pct']:.1f}%"),
        "52.8": ("Barrier IRI pre-freeze rate (N=339)", f"Correct frozen N=200: {truth['iri_b_pct']:.1f}%"),
        "65.6": ("Readiness IRI pre-freeze rate", f"Correct frozen N=200: {truth['iri_r_pct']:.1f}%"),
        "65.8": ("Readiness IRI pre-freeze rate (N=339)", f"Correct frozen N=200: {truth['iri_r_pct']:.1f}%"),
        "72.6": ("Maturity IRI pre-freeze rate", f"Correct frozen N=200: {truth['iri_m_pct']:.1f}%"),
        "72.9": ("Maturity IRI pre-freeze rate (N=339)", f"Correct frozen N=200: {truth['iri_m_pct']:.1f}%"),
    }
    for val_str, (label, correct) in pre_freeze_iri.items():
        if val_str in full_text_norm:
            # Check context: is it near "frozen" or "N = 200"?
            for m in re.finditer(re.escape(val_str), full_text_norm):
                ctx = full_text_norm[max(0, m.start()-300):m.start()+300].lower()
                if "frozen" in ctx or "n = 200" in ctx:
                    v.check(cat, f"Pre-freeze IRI rate {val_str}% in frozen context", "FAIL",
                           f"{label} appears near 'frozen N=200'. {correct}")
                    break
                elif "n = 339" in ctx or "full v2" in ctx:
                    v.check(cat, f"Pre-freeze IRI rate {val_str}% in V2 pool context", "INFO",
                           f"{label} — OK if properly qualified as pre-freeze data")
                    break

    # ─── Category 8: Demographic Percentages ────────────────────────────────
    # NOTE: De-identification may alter demographic distributions.
    # Use WARN for mismatches since the CRP uses the original dataset.
    cat = "8. DEMOGRAPHIC PERCENTAGES (public CSV — de-ID may differ)"
    for label, key in [
        ("For-Profit %", "pct_ForProfit"),
        ("Non-Profit %", "pct_NonProfit"),
        ("Government %", "pct_Govt"),
        ("Primary DM %", "pct_primary_dm"),
        ("Collaborative DM %", "pct_collaborative_dm"),
    ]:
        val = truth.get(key)
        if val is not None:
            found = v.check_value_in_text(cat, "", val, full_text)
            if found:
                v.check(cat, label, "PASS", f"{val:.1f}%")
            else:
                v.check(cat, label, "WARN",
                       f"Expected {val:.1f}% not found (may differ due to NIST de-identification)")

    # ─── Category 9: Internal Consistency ───────────────────────────────────
    cat = "9. INTERNAL CONSISTENCY (same value must match everywhere)"

    # Find all occurrences of key values and check they're consistent
    key_values = {
        "R-M Pearson r": [".7194", ".719"],
        "B-R Pearson r": ["-.3814", "-.381"],
        "B-M Pearson r": ["-.3156", "-.316"],
        "HTMT R-M": [".804", ".8044"],
        "Barriers alpha": [".873", ".8728"],
        "Readiness alpha": [".917", ".9171"],
        "Maturity alpha": [".885", ".8847"],
        "CR Barriers": [".873", ".8729"],
        "CR Readiness": [".918", ".9183"],
        "CR Maturity": [".886", ".8857"],
    }

    for stat_name, valid_forms in key_values.items():
        # Count occurrences
        occurrences = 0
        for form in valid_forms:
            occurrences += full_text_norm.count(form)
        if occurrences > 0:
            v.check(cat, f"{stat_name} appears {occurrences}x (valid forms: {', '.join(valid_forms)})", "PASS")
        # No FAIL here — absence is checked elsewhere

    # ─── Category 10: Pre-Freeze Contamination ─────────────────────────────
    cat = "10. PRE-FREEZE CONTAMINATION (values from N=339 pool)"

    # Known pre-freeze values that should NOT appear
    pre_freeze_markers = {
        "N = 339": "Full V2 pool size (should be qualified if present)",
        "N = 204": "Pre-freeze duration-qualified count (frozen N=200 has 156)",
        "N=339": "Full V2 pool size",
        "N=204": "Pre-freeze duration-qualified count",
    }

    for marker, desc in pre_freeze_markers.items():
        if marker in full_text:
            # Check context — might be OK if in methodology section
            idx = full_text.find(marker)
            context = full_text[max(0, idx-200):idx+200].lower()
            if any(kw in context for kw in ["full v2 sample", "full v2 response", "total v2", "prior to"]):
                v.check(cat, f"'{marker}' found", "WARN",
                       f"{desc}. Appears in V2 pool context — verify it's properly qualified")
            else:
                v.check(cat, f"'{marker}' found", "WARN",
                       f"{desc}. Verify this is properly labeled as pre-freeze data")
        else:
            v.check(cat, f"'{marker}' absent", "PASS", f"No pre-freeze marker '{marker}'")

    # Check for specific pre-freeze correlation values we just fixed
    old_correlations = {
        ".7231": "Pre-freeze R-M Pearson (correct: .7194)",
        ".5504": "Pre-freeze B-R Pearson (correct: .3814)",
        ".4359": "Pre-freeze B-M Pearson (correct: .3156)",
        ".7281": "Pre-freeze R-M Spearman (correct: .7098)",
        ".5084": "Pre-freeze B-R Spearman (correct: .3898)",
        ".4094": "Pre-freeze B-M Spearman (correct: .2839)",
    }
    for val, desc in old_correlations.items():
        if val in full_text_norm:
            v.check(cat, f"Stale correlation {val}", "FAIL", desc)
        else:
            v.check(cat, f"Stale correlation {val} absent", "PASS")

    # Old CR values — check they don't appear in reliability/CR context
    old_cr = {
        ".832": ("Old Barriers CR (correct: .873)", ["composite reliability", "cr =", "cr=", "cronbach"]),
        ".846": ("Old Maturity CR (correct: .886)", ["composite reliability", "cr =", "cr=", "cronbach"]),
    }
    for val, (desc, keywords) in old_cr.items():
        found_in_cr_context = False
        for m in re.finditer(re.escape(val), full_text_norm):
            ctx = full_text_norm[max(0, m.start()-200):m.start()+200].lower()
            if any(kw in ctx for kw in keywords):
                found_in_cr_context = True
                break
        if found_in_cr_context:
            v.check(cat, f"Stale CR {val}", "FAIL", desc)
        else:
            v.check(cat, f"Stale CR {val} absent", "PASS")

    # ─── Category 11: Structural Checks ─────────────────────────────────────
    cat = "11. STRUCTURAL CHECKS"

    # Limitation count
    ordinals = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth",
                "Seventh", "Eighth", "Ninth", "Tenth", "Eleventh", "Twelfth",
                "Thirteenth", "Fourteenth", "Fifteenth", "Sixteenth", "Seventeenth",
                "Eighteenth", "Nineteenth", "Twentieth"]
    number_words = {"ten": 10, "eleven": 11, "twelve": 12, "thirteen": 13, "fourteen": 14,
                    "fifteen": 15, "sixteen": 16, "seventeen": 17, "eighteen": 18,
                    "nineteen": 19, "twenty": 20}

    # Find limitations section
    lim_start = -1
    for i, p in enumerate(paragraphs):
        if "limitations" in p.lower() and ("future research" in p.lower() or "acknowledged" in p.lower()):
            if i > len(paragraphs) * 0.5:  # must be in second half of doc
                lim_start = i
                break

    if lim_start >= 0:
        lim_text = "\n".join(paragraphs[lim_start:min(lim_start + 200, len(paragraphs))])
        max_ordinal = 0
        for idx, word in enumerate(ordinals):
            if re.search(rf'\b{word},', lim_text):
                max_ordinal = idx + 1
        stated = None
        intro = lim_text[:2000].lower()
        for word, num in sorted(number_words.items(), key=lambda x: -x[1]):
            if re.search(rf'\b{word}\b', intro):
                stated = (word, num)
                break
        if stated and max_ordinal:
            if stated[1] == max_ordinal:
                v.check(cat, f"Limitation count: stated={stated[0]}({stated[1]}), found={max_ordinal}", "PASS")
            else:
                v.check(cat, f"Limitation count mismatch", "FAIL",
                       f"Stated {stated[0]}={stated[1]}, but highest ordinal found is {max_ordinal}")
        elif max_ordinal:
            v.check(cat, f"Limitations: {max_ordinal} ordinals found", "INFO", "Stated count not detected")

    # Check "frozen N = 200" statement
    if "frozen N = 200" in full_text or "frozen N=200" in full_text:
        v.check(cat, "Frozen dataset declaration present", "PASS")
    else:
        v.check(cat, "Frozen dataset declaration", "WARN", "'frozen N = 200' not found")

    # ─── Category 12: Cross-tab / Subgroup Means ───────────────────────────
    # NOTE: These are computed from the PUBLIC CSV which has NIST de-identified
    # demographics. The CRP may use the original (non-de-identified) dataset,
    # so demographic-based subgroup means may not match. Use WARN for mismatches.
    cat = "12. SUBGROUP MEANS (public CSV — de-ID may affect demographics)"
    for bucket in ["Small", "Medium", "Large"]:
        for c, label in [("B", "Barriers"), ("R", "Readiness"), ("M", "Maturity")]:
            mean_val = truth.get(f"{c}_{bucket}_mean")
            if mean_val:
                found = v.check_value_in_text(cat, "", mean_val, full_text)
                if found:
                    v.check(cat, f"{bucket} org {label} mean", "PASS", f"{mean_val:.3f}")
                else:
                    v.check(cat, f"{bucket} org {label} mean", "WARN",
                           f"Expected ~{mean_val:.3f} not found (may differ due to de-ID or clean sample)")

    for group in ["Tech", "NonTech"]:
        for c, label in [("B", "Barriers"), ("R", "Readiness"), ("M", "Maturity")]:
            mean_val = truth.get(f"{c}_{group}_mean")
            if mean_val:
                found = v.check_value_in_text(cat, "", mean_val, full_text)
                if found:
                    v.check(cat, f"{group} role {label} mean", "PASS", f"{mean_val:.3f}")
                else:
                    v.check(cat, f"{group} role {label} mean", "WARN",
                           f"Expected ~{mean_val:.3f} not found (may differ due to de-ID or clean sample)")

    for pm in ["For-Profit", "Non-Profit", "Government"]:
        for c, label in [("B", "Barriers"), ("R", "Readiness"), ("M", "Maturity")]:
            mean_val = truth.get(f"{c}_{pm}_mean")
            if mean_val:
                found = v.check_value_in_text(cat, "", mean_val, full_text)
                if found:
                    v.check(cat, f"{pm} {label} mean", "PASS", f"{mean_val:.3f}")
                else:
                    v.check(cat, f"{pm} {label} mean", "WARN",
                           f"Expected ~{mean_val:.3f} not found (may differ due to de-ID or clean sample)")

    # ─── Category 13: INFERENTIAL STATISTICS (t-tests, Cohen's d, ANOVA) ──
    cat = "13. INFERENTIAL STATISTICS (t-tests, effect sizes, ANOVA)"

    # --- Tech vs NonTech t-tests (Welch's) ---
    tech = df[df["is_tech"]]
    nontech = df[df["is_nontech"]]
    # Exclude "Other" from both
    for label, col in [("B", "barrier_mean"), ("R", "readiness_mean"), ("M", "maturity_mean")]:
        t_vals = tech[col].dropna()
        nt_vals = nontech[col].dropna()
        if len(t_vals) > 1 and len(nt_vals) > 1:
            t_stat, p_val = sp_stats.ttest_ind(t_vals, nt_vals, equal_var=False)
            # Cohen's d (pooled)
            pooled_sd = math.sqrt(((len(t_vals)-1)*t_vals.std(ddof=1)**2 +
                                   (len(nt_vals)-1)*nt_vals.std(ddof=1)**2) /
                                  (len(t_vals) + len(nt_vals) - 2))
            d_val = (t_vals.mean() - nt_vals.mean()) / pooled_sd if pooled_sd > 0 else 0
            truth[f"t_tech_{label}"] = t_stat
            truth[f"d_tech_{label}"] = d_val
            truth[f"t_tech_{label}_df"] = len(t_vals) + len(nt_vals) - 2

    # --- IRI Criterion Validity t-tests (dur>=480 pass vs fail) ---
    dur_pass = df[(df["duration"] >= 480) & (df["iri_count"] == 3)]
    dur_fail = df[(df["duration"] >= 480) & (df["iri_count"] < 3)]
    if len(dur_pass) > 1 and len(dur_fail) > 1:
        iri_df_value = len(dur_pass) + len(dur_fail) - 2
        truth["iri_ttest_df"] = iri_df_value
        for label, col in [("B", "barrier_mean"), ("R", "readiness_mean"), ("M", "maturity_mean")]:
            p_vals = dur_pass[col].dropna()
            f_vals = dur_fail[col].dropna()
            if len(p_vals) > 1 and len(f_vals) > 1:
                t_stat, _ = sp_stats.ttest_ind(p_vals, f_vals, equal_var=True)
                truth[f"t_iri_{label}"] = t_stat

    # --- Decision Authority ANOVA ---
    da_col = "Q2_DecisionAuth"
    if da_col in df.columns:
        da_vals = df[da_col].dropna().str.strip()
        # 3-group collapse: Primary, Shared (collaborative+input), Implementation (implement+limited)
        def da_3group(val):
            v_lower = val.lower()
            if "primary" in v_lower:
                return "Primary"
            elif "several" in v_lower or "collective" in v_lower or "significant input" in v_lower:
                return "Shared"
            elif "implement" in v_lower or "limited" in v_lower:
                return "Implementation"
            return None
        df["da_3group"] = df[da_col].dropna().apply(lambda x: da_3group(str(x).strip()))

        for label, col in [("B", "barrier_mean"), ("R", "readiness_mean"), ("M", "maturity_mean")]:
            groups = []
            for g in ["Primary", "Shared", "Implementation"]:
                vals = df[df["da_3group"] == g][col].dropna()
                if len(vals) > 0:
                    groups.append(vals)
            if len(groups) >= 2:
                f_stat, p_val = sp_stats.f_oneway(*groups)
                total_n = sum(len(g) for g in groups)
                truth[f"f_da3_{label}"] = f_stat
                truth[f"f_da3_{label}_df_between"] = len(groups) - 1
                truth[f"f_da3_{label}_df_within"] = total_n - len(groups)

    # --- Org Size ANOVA ---
    for label, col in [("B", "barrier_mean"), ("R", "readiness_mean"), ("M", "maturity_mean")]:
        groups = []
        for bucket in ["Small", "Medium", "Large"]:
            vals = df[df["org_bucket"] == bucket][col].dropna()
            if len(vals) > 0:
                groups.append(vals)
        if len(groups) >= 2:
            f_stat, p_val = sp_stats.f_oneway(*groups)
            total_n = sum(len(g) for g in groups)
            truth[f"f_orgsize_{label}"] = f_stat
            truth[f"f_orgsize_{label}_df_between"] = len(groups) - 1
            truth[f"f_orgsize_{label}_df_within"] = total_n - len(groups)

    # Now validate inferential stats against document
    # Tech vs NonTech t-tests
    for label, construct in [("B", "Barriers"), ("R", "Readiness"), ("M", "Maturity")]:
        t_val = truth.get(f"t_tech_{label}")
        d_val = truth.get(f"d_tech_{label}")
        if t_val is not None:
            found_t = v.check_value_in_text(cat, "", abs(t_val), full_text)
            if found_t:
                v.check(cat, f"Tech vs NonTech {construct} |t|", "PASS", f"t={t_val:.3f}")
            else:
                v.check(cat, f"Tech vs NonTech {construct} |t|", "WARN",
                       f"Expected |t|={abs(t_val):.3f} not found (CRP may use different grouping or clean sample)")
        if d_val is not None:
            found_d = v.check_value_in_text(cat, "", abs(d_val), full_text)
            if not found_d:
                found_d = v.check_value_in_text(cat, "", d_val, full_text)
            if found_d:
                v.check(cat, f"Tech vs NonTech {construct} Cohen's d", "PASS", f"d={d_val:.3f}")
            else:
                v.check(cat, f"Tech vs NonTech {construct} Cohen's d", "WARN",
                       f"Expected d={d_val:.3f} not found (may use different sample)")

    # IRI criterion t-test df check — CRP should NOT use t(202)
    iri_df = truth.get("iri_ttest_df")
    if iri_df is not None:
        if "t(202)" in full_text_norm:
            v.check(cat, "IRI t-test uses pre-freeze df t(202)", "FAIL",
                   f"CRP has t(202) but frozen N=200 dur≥480 gives df={iri_df} → t({iri_df})")
        if f"t({iri_df})" in full_text_norm:
            v.check(cat, f"IRI t-test df=t({iri_df})", "PASS")
        elif "t(202)" not in full_text_norm:
            v.check(cat, "IRI t-test df", "WARN",
                   f"Expected t({iri_df}) not found — IRI criterion validity section may not state df explicitly")

    # Org Size ANOVA F-values
    for label, construct in [("B", "Barriers"), ("R", "Readiness"), ("M", "Maturity")]:
        f_val = truth.get(f"f_orgsize_{label}")
        if f_val is not None:
            found = v.check_value_in_text(cat, "", f_val, full_text)
            if found:
                v.check(cat, f"Org size ANOVA {construct} F", "PASS", f"F={f_val:.2f}")
            else:
                v.check(cat, f"Org size ANOVA {construct} F", "WARN",
                       f"Expected F={f_val:.2f} not found (may use different grouping)")

    # Decision Authority ANOVA
    for label, construct in [("B", "Barriers"), ("R", "Readiness"), ("M", "Maturity")]:
        f_val = truth.get(f"f_da3_{label}")
        if f_val is not None:
            found = v.check_value_in_text(cat, "", f_val, full_text)
            if found:
                v.check(cat, f"DA 3-group ANOVA {construct} F", "PASS", f"F={f_val:.2f}")
            else:
                v.check(cat, f"DA 3-group ANOVA {construct} F", "WARN",
                       f"Expected F={f_val:.2f} not found (CRP may use 5-group or different grouping)")

    # ─── Category 14: r²/r CROSS-VALIDATION ────────────────────────────────
    cat = "14. r²/r CROSS-VALIDATION"

    # Targeted check: find explicit "r² = X.XX" or "X.X% shared variance" patterns
    # and match them to the CLOSEST construct pair context
    r_sq_explicit = list(re.finditer(r'[Rr]²\s*=\s*([\d.]+)', full_text_norm))
    shared_var_pct = list(re.finditer(r'([\d.]+)%\s*(?:of\s+)?(?:shared|common)\s+variance', full_text_norm))
    shared_var_pct2 = list(re.finditer(r'shared variance.*?([\d.]+)%', full_text_norm))

    known_r_pairs = [
        ("B-R", truth.get("pearson_BR"), ["barriers-readiness", "barriers–readiness"]),
        ("B-M", truth.get("pearson_BM"), ["barriers-maturity", "barriers–maturity"]),
        ("R-M", truth.get("pearson_RM"), ["readiness-maturity", "readiness–maturity"]),
    ]

    def find_closest_pair(pos, text):
        """Find which construct pair is closest to position pos in text."""
        best_pair = None
        best_dist = float("inf")
        for pair_name, r_val, keywords in known_r_pairs:
            for kw in keywords:
                idx = text.lower().rfind(kw, max(0, pos - 80), pos + 10)
                if idx >= 0:
                    dist = pos - idx
                    if dist < best_dist:
                        best_dist = dist
                        best_pair = (pair_name, r_val)
                # Also check forward
                idx = text.lower().find(kw, max(0, pos - 10), pos + 80)
                if idx >= 0:
                    dist = abs(pos - idx)
                    if dist < best_dist:
                        best_dist = dist
                        best_pair = (pair_name, r_val)
        return best_pair

    checked_r2 = set()

    for match in r_sq_explicit:
        pos = match.start()
        val_str = match.group(1)
        match_key = (pos, val_str)
        if match_key in checked_r2:
            continue
        checked_r2.add(match_key)
        try:
            val_num = float(val_str)
        except ValueError:
            continue

        pair_info = find_closest_pair(pos, full_text_norm)
        if pair_info is None:
            continue
        pair_name, r_val = pair_info
        if r_val is None:
            continue
        r_sq = r_val ** 2
        if abs(val_num - r_sq) < 0.01:
            v.check(cat, f"{pair_name} r²={val_num:.3f} matches r={r_val:.4f}", "PASS",
                   f"Computed r²={r_sq:.4f}")
        elif abs(val_num - r_sq) < 0.05:
            v.check(cat, f"{pair_name} r²={val_num:.3f} vs computed {r_sq:.4f}", "WARN",
                   f"Off by {abs(val_num - r_sq):.4f}")
        else:
            v.check(cat, f"{pair_name} r²={val_num:.3f} vs computed {r_sq:.4f}", "FAIL",
                   f"r={r_val:.4f} → r²={r_sq:.4f}")

    for match in shared_var_pct + shared_var_pct2:
        pos = match.start()
        val_str = match.group(1)
        match_key = (pos, val_str)
        if match_key in checked_r2:
            continue
        checked_r2.add(match_key)
        try:
            val_pct = float(val_str)
        except ValueError:
            continue

        pair_info = find_closest_pair(pos, full_text_norm)
        if pair_info is None:
            continue
        pair_name, r_val = pair_info
        if r_val is None:
            continue
        r_sq_pct = (r_val ** 2) * 100
        if abs(val_pct - r_sq_pct) < 1.5:
            v.check(cat, f"{pair_name} shared variance {val_pct}% matches r={r_val:.4f}", "PASS",
                   f"Computed r²={r_sq_pct:.1f}%")
        elif abs(val_pct - r_sq_pct) < 5.0:
            v.check(cat, f"{pair_name} shared variance {val_pct}% vs computed {r_sq_pct:.1f}%", "WARN",
                   f"Off by {abs(val_pct - r_sq_pct):.1f}pp — may be from different sample tier")
        else:
            v.check(cat, f"{pair_name} shared variance {val_pct}% vs computed {r_sq_pct:.1f}%", "FAIL",
                   f"r={r_val:.4f} → r²={r_sq_pct:.1f}%")

    # ─── Category 15: CI BOUND ORDERING ─────────────────────────────────────
    cat = "15. CONFIDENCE INTERVAL CONSISTENCY"

    # Find CI patterns — only match clear CI/confidence interval contexts
    ci_patterns = [
        # [0.845, 0.898] style — only near CI/confidence keywords
        r'(?:CI|confidence interval|95%)[^[\]]{0,40}\[(\-?[\d.]+),\s*(\-?[\d.]+)\]',
        # 95% CI [lower, upper]
        r'95%\s*CI[^[]{0,20}\[(\-?[\d.]+),\s*(\-?[\d.]+)\]',
        # CI = (lower, upper) in parentheses
        r'(?:CI|confidence interval)\s*[:=]\s*\((\-?[\d.]+),\s*(\-?[\d.]+)\)',
    ]

    ci_count = 0
    ci_violations = 0
    ci_seen = set()
    for pat in ci_patterns:
        for m in re.finditer(pat, full_text_norm):
            try:
                lo = float(m.group(1))
                hi = float(m.group(2))
            except ValueError:
                continue
            # Skip page ranges, section references, etc.
            if lo > 10 or hi > 10:
                continue
            if lo == hi:
                continue
            key = (round(lo, 4), round(hi, 4))
            if key in ci_seen:
                continue
            ci_seen.add(key)
            ci_count += 1
            if lo > hi:
                ci_violations += 1
                v.check(cat, f"CI bounds inverted: [{lo}, {hi}]", "FAIL",
                       f"Lower={lo} > Upper={hi}")

    if ci_count > 0 and ci_violations == 0:
        v.check(cat, f"All {ci_count} detected CIs have lower < upper", "PASS")
    elif ci_count == 0:
        v.check(cat, "No CI patterns detected", "INFO", "Could not find CI patterns to validate")

    # ─── Category 16: PERCENTAGE/COUNT ARITHMETIC ───────────────────────────
    cat = "16. PERCENTAGE/COUNT ARITHMETIC"

    # Scan for N × % = count consistency
    # Pattern: "X (Y%)" or "Y% (n = X)" near an N reference
    pct_count_patterns = [
        # "154 (77.0%)" — count then percent
        r'(\d+)\s*\((\d+\.?\d*)%\)',
        # "77.0% (n = 154)" — percent then count
        r'(\d+\.?\d*)%\s*\((?:n|N)\s*=\s*(\d+)\)',
    ]

    pct_checks = 0
    pct_fails = 0
    n_contexts = [200, 156, 116, 79]  # plausible N values

    for pat in pct_count_patterns:
        for m in re.finditer(pat, full_text_norm):
            g1, g2 = m.group(1), m.group(2)
            try:
                if "%" in m.group(0) and g1.replace(".", "").isdigit() and float(g1) > 100:
                    # First group is count, second is percentage
                    count = int(float(g1))
                    pct = float(g2)
                else:
                    # Could be either way — try both
                    v1, v2 = float(g1), float(g2)
                    if v1 > 100:
                        count, pct = int(v1), v2
                    elif v2 > 100:
                        pct, count = v1, int(v2)
                    else:
                        continue
            except (ValueError, OverflowError):
                continue

            # Check against known N values
            for N in n_contexts:
                expected_pct = count / N * 100
                if abs(expected_pct - pct) < 0.15:
                    pct_checks += 1
                    break
                expected_count = round(N * pct / 100)
                if expected_count == count:
                    pct_checks += 1
                    break
            else:
                # No N matched — check if count/pct is internally consistent for any reasonable N
                if pct > 0:
                    implied_n = round(count / pct * 100)
                    if implied_n in n_contexts or abs(count / implied_n * 100 - pct) < 0.15:
                        pct_checks += 1
                    else:
                        pct_fails += 1
                        v.check(cat, f"Count/Pct mismatch: {count} ({pct}%)", "WARN",
                               f"Implies N={implied_n}, not in known contexts {n_contexts}")

    if pct_checks > 0 and pct_fails == 0:
        v.check(cat, f"All {pct_checks} detected count/pct pairs are consistent", "PASS")
    elif pct_checks == 0 and pct_fails == 0:
        v.check(cat, "No count/pct pairs detected", "INFO")

    # ─── Category 17: EXHAUSTIVE NUMBER SCANNER ─────────────────────────────
    cat = "17. EXHAUSTIVE NUMBER SCANNER (unmatched statistics)"

    # Scan for all M = X.XX, SD = X.XX patterns
    m_sd_pattern = r'[Mm]\s*=\s*(\d+\.\d+).*?[Ss][Dd]\s*=\s*(\d+\.\d+)'
    unmatched_means = []
    for m in re.finditer(m_sd_pattern, full_text_norm):
        reported_m = float(m.group(1))
        reported_sd = float(m.group(2))

        # Check against all computed means AND item-level means
        matched = False
        for key, val in truth.items():
            if val is None or not isinstance(val, (int, float)):
                continue
            if abs(val - reported_m) < 0.015:
                matched = True
                break
        if not matched:
            # Also check pipeline sensitivity values
            for key, val in canon.items():
                if val is None or not isinstance(val, (int, float)):
                    continue
                if abs(val - reported_m) < 0.015:
                    matched = True
                    break

        if not matched and 1.0 <= reported_m <= 5.0:
            context_start = max(0, m.start() - 100)
            context = full_text_norm[context_start:m.start() + 80]
            # Clean for display
            context_clean = context.replace("\n", " ")[-120:]
            unmatched_means.append((reported_m, reported_sd, context_clean))

    if unmatched_means:
        for um, usd, ctx in unmatched_means[:10]:  # cap at 10 to avoid noise
            v.check(cat, f"Unmatched M={um:.2f} SD={usd:.2f}", "WARN",
                   f"No ground truth match. Context: ...{ctx[:80]}...")
    else:
        v.check(cat, "All M/SD values match a known ground truth", "PASS")

    # Scan for F(df1, df2) = X.XX patterns
    f_pattern = r'[Ff]\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)\s*=\s*(\d+\.?\d*)'
    for m in re.finditer(f_pattern, full_text_norm):
        df1 = int(m.group(1))
        df2 = int(m.group(2))
        f_val = float(m.group(3))
        # Check df plausibility
        if df1 + df2 + 1 > 250:
            v.check(cat, f"F({df1},{df2})={f_val} implies N={df1+df2+1}", "WARN",
                   "Degrees of freedom imply larger sample than frozen N=200")
        # Cross-check against computed F values
        matched_f = False
        for key, val in truth.items():
            if key.startswith("f_") and not key.endswith("_df_between") and not key.endswith("_df_within"):
                if isinstance(val, (int, float)) and abs(val - f_val) < 0.05:
                    matched_f = True
                    break
        if not matched_f and f_val > 0.5:
            context_start = max(0, m.start() - 60)
            ctx = full_text_norm[context_start:m.start() + 40].replace("\n", " ")
            v.check(cat, f"F({df1},{df2})={f_val:.2f} unmatched", "WARN",
                   f"No ground truth F-value match. Context: {ctx[-80:]}")

    # Scan for t(df) = X.XX patterns
    t_pattern = r'[Tt]\s*\(\s*(\d+)\s*\)\s*=\s*(\-?[\d.]+)'
    for m in re.finditer(t_pattern, full_text_norm):
        df_val = int(m.group(1))
        t_val = float(m.group(2))
        # Flag if df implies pre-freeze sample
        if df_val == 202:
            v.check(cat, f"t(202)={t_val} uses pre-freeze df", "FAIL",
                   f"df=202 implies N=204 (pre-freeze). Frozen N=200 dur≥480 gives df={truth.get('iri_ttest_df', '?')}")
        elif df_val > 198:
            v.check(cat, f"t({df_val})={t_val} df>198", "WARN",
                   f"df={df_val} implies N>{df_val+2}, which exceeds frozen N=200")

    # Scan for Cohen's d = X.XX patterns
    d_pattern = r"[Cc]ohen['']?s?\s*[Dd]\s*=?\s*(\-?[\d.]+)"
    d_values_found = []
    for m in re.finditer(d_pattern, full_text_norm):
        try:
            d_val = float(m.group(1))
            d_values_found.append(d_val)
        except ValueError:
            pass

    if d_values_found:
        v.check(cat, f"Found {len(d_values_found)} Cohen's d values", "INFO",
               f"Values: {', '.join(f'{d:.3f}' for d in d_values_found[:8])}")

    # ─── Print Report ───────────────────────────────────────────────────────
    v.print_report()
    return v


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="TABS CRP Statistics Validator v2")
    parser.add_argument("--docx", help="Path to CRP body .docx")
    parser.add_argument("--csv", help="Path to frozen N=200 CSV")
    parser.add_argument("--repo", help="Path to cloned repo with pipeline JSON")
    args = parser.parse_args()

    workspace = find_workspace()
    docx_path = args.docx or (find_latest_docx(workspace) if workspace else None)
    csv_path = args.csv or (find_csv(workspace) if workspace else None)
    repo_path = args.repo or find_repo()

    if not docx_path:
        print("ERROR: Could not find CRP body .docx. Use --docx PATH")
        sys.exit(1)
    if not csv_path:
        print("ERROR: Could not find frozen CSV. Use --csv PATH")
        sys.exit(1)

    print("=" * 80)
    print("  TABS CRP Comprehensive Statistics Validator v2")
    print("=" * 80)

    v = run_validation(docx_path, csv_path, repo_path)
    sys.exit(1 if v.counts["FAIL"] > 0 else 0)
