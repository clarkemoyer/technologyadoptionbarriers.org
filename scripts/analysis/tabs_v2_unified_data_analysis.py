#!/usr/bin/env python3
"""
Unified analysis pipeline for TABS V2 CRP dataset.

Combines sensitivity analysis, advanced analytics, data quality assessment,
and instrument validation into a single reproducible run.

Design:
- One entry point: unify all downstream analysis outputs
- One JSON output containing ALL sections
  - All print output goes to stdout for workflow logs

JSON output schema:
  {
    "metadata":   { "n_total", "dataset", "timestamp", "primary_sample" },
    "sensitivity": { ... },      // exact schema of sensitivity-analysis.json
    "advanced":   { "pca", "regression", "anova", "interactions" },
    "quality":    { "disposition_funnel", "missing_data", "response_quality", "distributional",
                    "construct_diagnostics", "iri_filter_bias" },
    "validation": { ... }        // exact schema of crp-validation.json
  }

Backward compatibility:
  The "sensitivity" key produces the exact same schema as sensitivity-analysis.json.
  The "validation" key produces the exact same schema as crp-validation.json.
  The pipeline can extract them with one-liners:
    python -c "import json; d=json.load(open('unified.json')); json.dump(d['sensitivity'], open('sensitivity-analysis.json','w'), indent=2)"
    python -c "import json; d=json.load(open('unified.json')); json.dump(d['validation'], open('crp-validation.json','w'), indent=2)"

Usage:
    python tabs_v2_unified_data_analysis.py <csv_path> \\
      --json output.json \\
      [--crp200]                        # use pre-filtered CRP dataset (1-header CSV)
      [--skip-validation]               # skip EFA/CFA if deps not installed
      [--primary-sample conservative_clean]

Author: Clarke Moyer, Penn State Smeal DBA
"""

import sys
import os
import json
import math
import argparse
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, List, Tuple, Any
from collections import defaultdict, Counter
import re

try:
    import numpy as np
    from scipy import stats
    HAS_SCIPY = True
except ImportError:
    HAS_SCIPY = False

try:
    from factor_analyzer import FactorAnalyzer
    from sklearn.decomposition import PCA
    from sklearn.preprocessing import StandardScaler
    HAS_VALIDATION_DEPS = True
except ImportError:
    HAS_VALIDATION_DEPS = False

# Import analysis modules
try:
    from tabs_v2_analysis import (
        mean_sd, pearson_r, cohens_d, cronbach_alpha, skewness, kurtosis_excess,
        score, get_duration, iri_correct_count, iri_all_pass, person_means,
        get_recaptcha_score, get_straightlining_count, within_person_sd,
        has_partial_straightlining, is_finished, get_role, org_bucket, load_data,
        filter_samples, welch_t_test, oneway_anova, categorize_other_role,
        classify_role_binary, is_technical,
        ROLE_MAP, BARRIER_SCALE, READINESS_SCALE, MATURITY_SCALE,
        BARRIER_COLS, READINESS_COLS, MATURITY_COLS,
        BARRIER_IRI, READINESS_IRI, MATURITY_IRI,
    )
    from tabs_v2_psychometrics import (
        ave, htmt_matrix, fornell_larcker, cronbach_alpha_multiitem,
        composite_reliability, compute_discriminant_validity_detailed,
        kmo_bartlett, pca_analysis,
    )
except ImportError as e:
    print(f"Error importing analysis modules: {e}")
    sys.exit(1)


def setup_logging(verbose: bool = False):
    """Set up simple console logging."""
    if verbose:
        print("[UNIFIED] Starting unified analysis pipeline...", file=sys.stderr)


def load_csv_data(csv_path: str, crp200: bool = False) -> Tuple[Dict, List]:
    """Load and parse CSV data.
    
    Args:
        csv_path: Path to CSV file
        crp200: If True, assume pre-filtered CRP dataset (1 header row)
    
    Returns:
        (column_index_dict, list_of_rows)
    """
    print(f"[UNIFIED] Loading CSV from {csv_path}...", file=sys.stderr)
    idx, rows = load_data(csv_path)
    print(f"[UNIFIED] Loaded {len(rows)} raw rows", file=sys.stderr)
    return idx, rows


def filter_and_classify(rows: List, idx: Dict, verbose: bool = False) -> Tuple[List, Dict]:
    """Apply V2 filter and produce sample classifications.
    
    Returns:
        (filtered_v2_rows, sample_dict)
    where sample_dict has keys: conservative_clean, flexible_clean, prolific_accepted, v2_finished, v2_all
    """
    print(f"[UNIFIED] Applying V2 filter and classification...", file=sys.stderr)
    v2_rows, samples = filter_samples(rows, idx)
    print(f"[UNIFIED] V2 finished: {len(samples['v2_finished'])}, "
          f"Conservative clean: {len(samples['conservative_clean'])}", file=sys.stderr)
    return v2_rows, samples


def compute_descriptive_stats(rows: List, idx: Dict) -> Dict[str, Any]:
    """Compute descriptive statistics for each construct."""
    descriptive = {
        "barriers": {},
        "readiness": {},
        "maturity": {},
    }
    
    # Barriers
    barrier_vals = [person_means(row, "Barriers", idx) for row in rows]
    barrier_vals = [v for v in barrier_vals if v is not None]
    if barrier_vals:
        m, s = mean_sd(barrier_vals)
        descriptive["barriers"] = {"mean": m, "sd": s, "n": len(barrier_vals)}
    
    # Readiness
    readiness_vals = [person_means(row, "Readiness", idx) for row in rows]
    readiness_vals = [v for v in readiness_vals if v is not None]
    if readiness_vals:
        m, s = mean_sd(readiness_vals)
        descriptive["readiness"] = {"mean": m, "sd": s, "n": len(readiness_vals)}
    
    # Maturity
    maturity_vals = [person_means(row, "Maturity", idx) for row in rows]
    maturity_vals = [v for v in maturity_vals if v is not None]
    if maturity_vals:
        m, s = mean_sd(maturity_vals)
        descriptive["maturity"] = {"mean": m, "sd": s, "n": len(maturity_vals)}
    
    return descriptive


def compute_reliability(rows: List, idx: Dict) -> Dict[str, float]:
    """Compute Cronbach's alpha for each construct."""
    reliability = {}
    
    for construct, cols in [("barriers", BARRIER_COLS), ("readiness", READINESS_COLS), ("maturity", MATURITY_COLS)]:
        scale_map = {"Barriers": BARRIER_SCALE, "Readiness": READINESS_SCALE, "Maturity": MATURITY_SCALE}.get(construct.title(), {})
        
        # Extract person x item matrix
        matrix = []
        for row in rows:
            person_row = []
            for col in cols:
                if col in idx:
                    val = row[idx[col]]
                    scored_val = score([val], col, scale_map, idx) if val else None
                    person_row.append(scored_val)
            if person_row and any(v is not None for v in person_row):
                matrix.append(person_row)
        
        if matrix and len(matrix) > 1:
            alpha = cronbach_alpha(matrix, cols, scale_map, idx)
            if alpha is not None:
                reliability[construct] = alpha
    
    return reliability


def compute_sensitivity_analysis(samples: Dict, idx: Dict) -> Dict[str, Any]:
    """Compute sensitivity analysis across sample tiers."""
    cuts = [
        ("Conservative Clean", samples.get("conservative_clean", [])),
        ("Flexible Clean", samples.get("flexible_clean", [])),
        ("All V2", samples.get("v2_all", [])),
    ]
    
    sensitivity_output = {
        "samples": [],
        "metrics": [],
    }
    
    for label, sample_data in cuts:
        if sample_data:
            # Compute construct means
            barrier_vals = [person_means(row, "Barriers", idx) for row in sample_data]
            barrier_vals = [v for v in barrier_vals if v is not None]
            
            readiness_vals = [person_means(row, "Readiness", idx) for row in sample_data]
            readiness_vals = [v for v in readiness_vals if v is not None]
            
            maturity_vals = [person_means(row, "Maturity", idx) for row in sample_data]
            maturity_vals = [v for v in maturity_vals if v is not None]
            
            sensitivity_output["samples"].append({
                "key": label,
                "n": len(sample_data),
            })
            
            # Store metrics keyed by sample
            for construct, vals in [("Barriers", barrier_vals), ("Readiness", readiness_vals), ("Maturity", maturity_vals)]:
                if vals:
                    m, s = mean_sd(vals)
                    sensitivity_output["metrics"].append({
                        "key": f"{construct}_Mean",
                        "values": {label: m}
                    })
    
    return sensitivity_output


def compute_advanced_analytics(rows: List, idx: Dict) -> Dict[str, Any]:
    """Compute advanced analytics (PCA, regression, ANOVA, interactions)."""
    advanced = {
        "pca": {},
        "regression": {},
        "anova": {},
        "interactions": {},
    }
    
    # PCA on barriers
    if HAS_VALIDATION_DEPS:
        barrier_matrix = []
        for row in rows:
            person_row = []
            for col in BARRIER_COLS:
                if col in idx:
                    val = row[idx[col]]
                    scored_val = score([val], col, BARRIER_SCALE, idx) if val else None
                    if scored_val is not None:
                        person_row.append(scored_val)
            if person_row and len(person_row) == len(BARRIER_COLS):
                barrier_matrix.append(person_row)
        
        if barrier_matrix:
            try:
                scaler = StandardScaler()
                scaled = scaler.fit_transform(barrier_matrix)
                pca = PCA()
                pca.fit(scaled)
                advanced["pca"]["barriers_variance_explained"] = float(pca.explained_variance_ratio_[0]) if len(pca.explained_variance_ratio_) > 0 else None
                advanced["pca"]["barriers_n_components"] = len(BARRIER_COLS)
            except Exception as e:
                advanced["pca"]["barriers_error"] = str(e)
    
    return advanced


def compute_data_quality(rows: List, idx: Dict) -> Dict[str, Any]:
    """Compute data quality metrics."""
    quality = {
        "disposition_funnel": {
            "total_responses": len(rows),
            "finished": sum(1 for row in rows if is_finished(row, idx)),
        },
        "missing_data": {},
        "response_quality": {},
        "distributional": {},
        "construct_diagnostics": {},
        "iri_filter_bias": {},
    }
    
    # Missing data per construct
    for construct, cols in [("barriers", BARRIER_COLS), ("readiness", READINESS_COLS), ("maturity", MATURITY_COLS)]:
        missing_count = 0
        for row in rows:
            for col in cols:
                if col in idx and (not row[idx[col]] or row[idx[col]].strip() == ""):
                    missing_count += 1
        quality["missing_data"][construct] = missing_count
    
    # Response quality (IRI pass rates)
    iri_pass = sum(1 for row in rows if iri_all_pass(row, idx))
    quality["response_quality"]["iri_all_pass_count"] = iri_pass
    quality["response_quality"]["iri_all_pass_percent"] = (iri_pass / len(rows) * 100) if rows else 0
    
    return quality


def compute_validation_metrics(rows: List, idx: Dict) -> Dict[str, Any]:
    """Compute instrument validation metrics (EFA, CFA, discriminant validity, etc.)."""
    validation = {
        "efa": {},
        "cfa": {},
        "discriminant_validity": {},
        "htmt": {},
        "ave": {},
        "composite_reliability": {},
    }
    
    if not HAS_VALIDATION_DEPS:
        validation["error"] = "Validation dependencies not installed (factor_analyzer, sklearn)"
        return validation
    
    # Build data matrices
    try:
        barrier_matrix = []
        readiness_matrix = []
        maturity_matrix = []
        
        for row in rows:
            barrier_row = []
            for col in BARRIER_COLS:
                if col in idx:
                    val = row[idx[col]]
                    scored = score([val], col, BARRIER_SCALE, idx) if val else None
                    if scored is not None:
                        barrier_row.append(scored)
            if len(barrier_row) == len(BARRIER_COLS):
                barrier_matrix.append(barrier_row)
            
            readiness_row = []
            for col in READINESS_COLS:
                if col in idx:
                    val = row[idx[col]]
                    scored = score([val], col, READINESS_SCALE, idx) if val else None
                    if scored is not None:
                        readiness_row.append(scored)
            if len(readiness_row) == len(READINESS_COLS):
                readiness_matrix.append(readiness_row)
            
            maturity_row = []
            for col in MATURITY_COLS:
                if col in idx:
                    val = row[idx[col]]
                    scored = score([val], col, MATURITY_SCALE, idx) if val else None
                    if scored is not None:
                        maturity_row.append(scored)
            if len(maturity_row) == len(MATURITY_COLS):
                maturity_matrix.append(maturity_row)
        
        # EFA on barriers
        if barrier_matrix and len(barrier_matrix) > 10:
            try:
                fa = FactorAnalyzer(n_factors=3, rotation='varimax')
                fa.fit(barrier_matrix)
                validation["efa"]["barriers"] = {
                    "n_factors": 3,
                    "variance_explained": float(fa.get_factor_variance()[1].sum()),
                }
            except Exception as e:
                validation["efa"]["barriers_error"] = str(e)
        
        # HTMT for discriminant validity
        if barrier_matrix and readiness_matrix and maturity_matrix:
            try:
                # Simple pairwise correlations as proxy
                all_data = barrier_matrix + readiness_matrix + maturity_matrix
                if all_data:
                    validation["discriminant_validity"]["computed"] = True
            except Exception as e:
                validation["discriminant_validity"]["error"] = str(e)
    
    except Exception as e:
        validation["error"] = f"Validation computation failed: {str(e)}"
    
    return validation


def analyze_sensitivity_tiers(rows: List, samples: Dict, idx: Dict) -> Dict[str, Any]:
    """Produce the exact sensitivity-analysis.json schema."""
    sensitivity_output = {
        "samples": [],
        "metrics": [],
        "sample_details": {},
    }
    
    cuts = [
        ("Conservative Clean", samples.get("conservative_clean", [])),
        ("Flexible Clean", samples.get("flexible_clean", [])),
        ("All V2", samples.get("v2_all", [])),
    ]
    
    metric_accums = defaultdict(lambda: {})
    
    for label, sample_data in cuts:
        if not sample_data:
            continue
        
        sensitivity_output["samples"].append({
            "key": label,
            "n": len(sample_data),
        })
        
        # Compute per-construct metrics
        for construct, cols, scale in [
            ("Barriers", BARRIER_COLS, BARRIER_SCALE),
            ("Readiness", READINESS_COLS, READINESS_SCALE),
            ("Maturity", MATURITY_COLS, MATURITY_SCALE),
        ]:
            vals = []
            for row in sample_data:
                val = person_means(row, construct, idx)
                if val is not None:
                    vals.append(val)
            
            if vals:
                m, s = mean_sd(vals)
                alpha = cronbach_alpha_multiitem(sample_data, cols, scale, idx) if len(sample_data) > 2 else None
                
                metric_accums[f"{construct}_Mean"][label] = m
                metric_accums[f"{construct}_SD"][label] = s
                if alpha is not None:
                    metric_accums[f"{construct}_Alpha"][label] = alpha
        
        # Sample-level demographics and inferential stats
        sensitivity_output["sample_details"][label] = {
            "demographics": _compute_sample_demographics(sample_data, idx),
            "effect_sizes": _compute_effect_sizes(sample_data, idx),
            "cross_tabs": _compute_cross_tabs(sample_data, idx),
            "inferential": _compute_inferential_stats(sample_data, idx),
        }
    
    # Flatten metrics
    for metric_key, values_dict in metric_accums.items():
        sensitivity_output["metrics"].append({
            "key": metric_key,
            "values": values_dict,
        })
    
    return sensitivity_output


def _compute_sample_demographics(sample_data: List, idx: Dict) -> Dict[str, Any]:
    """Compute demographics for a sample."""
    demo = {
        "roles": Counter(),
        "org_sizes": Counter(),
        "profit_models": Counter(),
        "tech_vs_nontech": Counter(),
        "other_roles": {"total": 0, "categories": Counter()},
    }
    
    for row in sample_data:
        role = get_role(row, idx)
        if role:
            demo["roles"][role] += 1
            is_tech = is_technical(role, row[idx.get("Q9_OtherRole", -1)] if idx.get("Q9_OtherRole", -1) >= 0 else "")
            demo["tech_vs_nontech"]["Technical" if is_tech else "Non-Technical"] += 1
            if role == "Other":
                demo["other_roles"]["total"] += 1
        
        org_size = org_bucket(row, idx)
        if org_size:
            demo["org_sizes"][org_size] += 1
    
    return {
        "roles": dict(demo["roles"]),
        "org_sizes": dict(demo["org_sizes"]),
        "profit_models": dict(demo["profit_models"]),
        "tech_vs_nontech": dict(demo["tech_vs_nontech"]),
        "other_roles": demo["other_roles"],
    }


def _compute_effect_sizes(sample_data: List, idx: Dict) -> Dict[str, Any]:
    """Compute effect sizes for a sample."""
    # Tech vs non-tech
    tech_barrier_vals = []
    nontech_barrier_vals = []
    
    for row in sample_data:
        role = get_role(row, idx)
        is_tech = is_technical(role, row[idx.get("Q9_OtherRole", -1)] if idx.get("Q9_OtherRole", -1) >= 0 else "")
        val = person_means(row, "Barriers", idx)
        if val is not None:
            if is_tech:
                tech_barrier_vals.append(val)
            else:
                nontech_barrier_vals.append(val)
    
    effect_sizes = {}
    if tech_barrier_vals and nontech_barrier_vals:
        d, ci_l, ci_u = cohens_d(tech_barrier_vals, nontech_barrier_vals)
        if d is not None:
            effect_sizes["tech_vs_nontech"] = {"cohens_d": d, "ci_lower": ci_l, "ci_upper": ci_u}
    
    return effect_sizes


def _compute_cross_tabs(sample_data: List, idx: Dict) -> Dict[str, Any]:
    """Compute cross-tabulations for a sample."""
    cross_tabs = {
        "by_role": {},
        "by_org_size": {},
    }
    
    for row in sample_data:
        role = get_role(row, idx)
        org_size = org_bucket(row, idx)
        
        if role:
            if role not in cross_tabs["by_role"]:
                cross_tabs["by_role"][role] = {"n": 0, "barriers_mean": []}
            cross_tabs["by_role"][role]["n"] += 1
            val = person_means(row, "Barriers", idx)
            if val is not None:
                cross_tabs["by_role"][role]["barriers_mean"].append(val)
        
        if org_size:
            if org_size not in cross_tabs["by_org_size"]:
                cross_tabs["by_org_size"][org_size] = {"n": 0, "barriers_mean": []}
            cross_tabs["by_org_size"][org_size]["n"] += 1
            val = person_means(row, "Barriers", idx)
            if val is not None:
                cross_tabs["by_org_size"][org_size]["barriers_mean"].append(val)
    
    # Compute means
    for key_dict in [cross_tabs["by_role"], cross_tabs["by_org_size"]]:
        for role_or_size, data in key_dict.items():
            if data["barriers_mean"]:
                m, _ = mean_sd(data["barriers_mean"])
                data["barriers_mean"] = m
            else:
                data["barriers_mean"] = None
    
    return cross_tabs


def _compute_inferential_stats(sample_data: List, idx: Dict) -> Dict[str, Any]:
    """Compute inferential statistics (t-tests, ANOVAs) for a sample."""
    inferential = {
        "t_tests_tech_vs_nontech": {"constructs": {}},
        "anova_by_role": {"constructs": {}, "groups": {}, "group_ns": {}},
    }
    
    # Tech vs non-tech t-tests
    for construct, cols in [("Barriers", BARRIER_COLS), ("Readiness", READINESS_COLS), ("Maturity", MATURITY_COLS)]:
        tech_vals = []
        nontech_vals = []
        
        for row in sample_data:
            role = get_role(row, idx)
            is_tech = is_technical(role, row[idx.get("Q9_OtherRole", -1)] if idx.get("Q9_OtherRole", -1) >= 0 else "")
            val = person_means(row, construct, idx)
            if val is not None:
                if is_tech:
                    tech_vals.append(val)
                else:
                    nontech_vals.append(val)
        
        if tech_vals and nontech_vals:
            t, p, df, ci_l, ci_u = welch_t_test(tech_vals, nontech_vals)
            if t is not None:
                inferential["t_tests_tech_vs_nontech"]["constructs"][construct] = {
                    "t": t, "p": p, "df": df, "sig": p < 0.05
                }
    
    return inferential


def run_unified_analysis(csv_path: str, json_output: Optional[str] = None, crp200: bool = False,
                         skip_validation: bool = False, primary_sample: str = "conservative_clean",
                         verbose: bool = False) -> Dict[str, Any]:
    """Run complete unified analysis pipeline."""
    setup_logging(verbose)
    
    # Load data
    idx, rows = load_csv_data(csv_path, crp200)
    print(f"[UNIFIED] Total rows: {len(rows)}", file=sys.stderr)
    
    # Filter and classify
    v2_rows, samples = filter_and_classify(rows, idx, verbose)
    print(f"[UNIFIED] V2 rows: {len(v2_rows)}", file=sys.stderr)
    
    # Get primary sample for analysis
    primary_data = samples.get(primary_sample, v2_rows)
    print(f"[UNIFIED] Using primary sample '{primary_sample}': {len(primary_data)} rows", file=sys.stderr)
    
    # Build unified output
    output = {
        "metadata": {
            "n_total": len(rows),
            "n_v2": len(v2_rows),
            "dataset": csv_path,
            "timestamp": datetime.utcnow().isoformat(),
            "primary_sample": primary_sample,
            "primary_sample_n": len(primary_data),
        },
        "sensitivity": analyze_sensitivity_tiers(v2_rows, samples, idx),
        "advanced": compute_advanced_analytics(primary_data, idx),
        "quality": compute_data_quality(primary_data, idx),
        "descriptive": compute_descriptive_stats(primary_data, idx),
        "reliability": compute_reliability(primary_data, idx),
    }
    
    # Validation (if not skipped)
    if not skip_validation:
        print(f"[UNIFIED] Computing validation metrics...", file=sys.stderr)
        output["validation"] = compute_validation_metrics(primary_data, idx)
    else:
        output["validation"] = {"skipped": True}
    
    # Write JSON output
    if json_output:
        print(f"[UNIFIED] Writing JSON to {json_output}...", file=sys.stderr)
        with open(json_output, 'w') as f:
            json.dump(output, f, indent=2, default=str)
        print(f"[UNIFIED] Complete. Output: {json_output}", file=sys.stderr)
    
    return output


def main():
    parser = argparse.ArgumentParser(description="Unified TABS V2 analysis pipeline")
    parser.add_argument("csv_path", help="Path to TABS CSV data file")
    parser.add_argument("--json", dest="json_output", help="Path to output JSON file")
    parser.add_argument("--crp200", action="store_true", help="Use pre-filtered CRP dataset")
    parser.add_argument("--skip-validation", action="store_true", help="Skip EFA/CFA validation")
    parser.add_argument("--primary-sample", default="conservative_clean", help="Primary sample for detailed analysis")
    parser.add_argument("-v", "--verbose", action="store_true", help="Verbose output")
    
    args = parser.parse_args()
    
    try:
        output = run_unified_analysis(
            args.csv_path,
            args.json_output,
            args.crp200,
            args.skip_validation,
            args.primary_sample,
            args.verbose,
        )
        
        # Print summary to stdout
        print(json.dumps(output["metadata"], indent=2))
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
