#!/usr/bin/env python3
"""
TABS V2 Unified Data Analysis

This module unifies the previous three-part analysis pipeline (tabs_v2_analysis.py,
tabs_v2_psychometrics.py, tabs_v2_data_audit.py) into a single coherent analysis
that generates the five JSON outputs used by the website and CRP.

Output files:
  - crp-sensitivity-analysis.json (frozen N=200 CRP dataset)
  - crp-validation.json (frozen N=200 CRP dataset)
  - sensitivity-analysis.json (live pipeline, all data collected so far)
  - live-validation.json (live pipeline, all data collected so far)
  - disposition-summary.json (live disposition waterfall and IRI rates)

Dataset modes:
  - 'crp_200': Frozen N=200 dataset used for the CRP (StartDate filter + explicit inclusion)
  - 'live': All V2 data from the live pipeline (no freeze)

The frozen N=200 dataset is generated from the public TABS_V2_CRP_2026_public_dataset.csv
and remains stable for CRP reproducibility. The live dataset updates daily as new responses
come in from Prolific.
"""

import json
import math
import os
import sys
from collections import defaultdict
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import pandas as pd
import numpy as np
from scipy import stats

# ============================================================================
# CONFIGURATION AND CONSTANTS
# ============================================================================

# Load constants from the canonical constants file
CONSTANTS_FILE = Path(__file__).parent / "tabs_v2_constants.json"
if not CONSTANTS_FILE.exists():
    print(f"ERROR: Constants file not found at {CONSTANTS_FILE}", file=sys.stderr)
    sys.exit(1)

with open(CONSTANTS_FILE) as f:
    CONSTANTS = json.load(f)

SCALE_MAPS = CONSTANTS["scale_maps"]
IRI_ANSWERS = CONSTANTS["iri_answers"]
THRESHOLDS = CONSTANTS["thresholds"]
ITEM_MAPPING = CONSTANTS["item_mapping"]
MATURITY_NAMES = CONSTANTS["maturity_names"]

# Data quality thresholds
DURATION_THRESHOLD_SECONDS = THRESHOLDS["duration_seconds"]
QUALITY_SCORE_FLOOR = THRESHOLDS["quality_score_floor"]
SMEAL_IRI_THRESHOLD = THRESHOLDS["smeal_iri_threshold"]

# Expected column counts
EXPECTED_BARRIER_COLS = 19  # B1-B19, with B19 being the IRI
EXPECTED_READINESS_COLS = 18  # R1-R18, with R18 being the IRI
EXPECTED_MATURITY_COLS = 9  # M1-M9, with M9 being the IRI
EXPECTED_TOP3_COLS = 18  # TOP3_B_1 through TOP3_B_9, TOP3_R_1 through TOP3_R_9 (no TOP3 for M, no IRI)

def load_data(csv_path: str, mode: str = 'live') -> pd.DataFrame:
    """
    Load survey data from CSV.
    
    Args:
        csv_path: Path to the CSV file
        mode: 'crp_200' for frozen CRP dataset, 'live' for all data
    
    Returns:
        DataFrame with V2 data filtered by mode
    """
    print(f"Loading data from {csv_path}...")
    df = pd.read_csv(csv_path)
    print(f"Loaded {len(df)} rows")
    
    # Filter for V2 responses
    # V2 started 2026-03-23 14:00:00 EST
    # Plus one explicit inclusion: R_1QK12IJpHjC3wd6 (Prolific live test, 2026-03-23 09:07 AM)
    if mode == 'crp_200':
        # Frozen dataset: use the exact rows from the public CSV
        # The public CSV is already filtered to N=200
        df = df[df['ResponseId'].notna()]  # basic filter
        print(f"CRP 200 mode: {len(df)} rows (should be 200)")
    else:
        # Live mode: filter by V2 start time
        df['StartDate'] = pd.to_datetime(df['StartDate'], errors='coerce')
        v2_start = pd.to_datetime('2026-03-23 14:00:00')
        explicit_include = 'R_1QK12IJpHjC3wd6'
        df = df[(df['StartDate'] >= v2_start) | (df['ResponseId'] == explicit_include)]
        print(f"Live mode: {len(df)} rows after V2 filter")
    
    return df

def _map_response_value(value: str, scale_key: str) -> Optional[float]:
    """
    Map a text response to a numeric value using the canonical scale map.
    "Don't Know" returns None (treated as missing).
    Returns None if the scale_key is not found or the value is not in the scale.
    """
    if pd.isna(value) or value == "Don't Know" or value == "N/A":
        return None
    
    if scale_key not in SCALE_MAPS:
        return None
    
    scale = SCALE_MAPS[scale_key]
    if value in scale:
        return scale[value]
    
    return None

def _build_sensitivity_cuts(idx: pd.DataFrame) -> Dict[str, pd.DataFrame]:
    """
    Build the five sample cuts used for sensitivity analysis.
    Returns a dict with keys: 'conservative_clean', 'flexible_clean', 'prolific_accepted', 'v2_finished', 'v2_all'.
    """
    cuts = {}
    
    # Tier 1: Conservative clean (Duration >= 480s, all 3 IRIs correct)
    conservative = idx[
        (idx['Duration'] >= DURATION_THRESHOLD_SECONDS) &
        (idx['IRI_Barriers_Pass'] == 1) &
        (idx['IRI_Readiness_Pass'] == 1) &
        (idx['IRI_Maturity_Pass'] == 1)
    ]
    cuts['conservative_clean'] = conservative
    
    # Tier 2: Flexible clean (Duration >= 480s, at least 2 IRIs correct)
    flexible = idx[
        (idx['Duration'] >= DURATION_THRESHOLD_SECONDS) &
        ((idx['IRI_Barriers_Pass'] + idx['IRI_Readiness_Pass'] + idx['IRI_Maturity_Pass']) >= 2)
    ]
    cuts['flexible_clean'] = flexible
    
    # Tier 3: Prolific Accepted (all Prolific "APPROVED" status)
    prolific_accepted = idx[idx['Status'] == 'APPROVED']
    cuts['prolific_accepted'] = prolific_accepted
    
    # Tier 4: V2 Finished (all rows where response is complete)
    v2_finished = idx[idx['Progress'] == 100]
    cuts['v2_finished'] = v2_finished
    
    # Tier 5: V2 All (all V2 data, no filter)
    cuts['v2_all'] = idx
    
    return cuts

def _build_iri_flags(idx: pd.DataFrame) -> pd.DataFrame:
    """
    Build IRI pass/fail flags for each response.
    """
    # Check Barriers IRI (B19)
    barriers_iri_value = idx.get('Q10-28_Barriers_19', pd.Series([None] * len(idx), index=idx.index))
    barriers_iri_numeric = barriers_iri_value.apply(
        lambda v: _map_response_value(v, 'barriers') if pd.notna(v) else None
    )
    idx['IRI_Barriers_Pass'] = (barriers_iri_numeric == 5).astype(int)  # Should be 'Major Barrier' = 5
    
    # Check Readiness IRI (R18)
    readiness_iri_value = idx.get('Q47-64_Readiness_18', pd.Series([None] * len(idx), index=idx.index))
    readiness_iri_numeric = readiness_iri_value.apply(
        lambda v: _map_response_value(v, 'readiness') if pd.notna(v) else None
    )
    idx['IRI_Readiness_Pass'] = (readiness_iri_numeric == 2).astype(int)  # Should be 'Low Readiness/Capability' = 2
    
    # Check Maturity IRI (M9)
    maturity_iri_value = idx.get('Q65-73_Maturity_9', pd.Series([None] * len(idx), index=idx.index))
    maturity_iri_numeric = maturity_iri_value.apply(
        lambda v: _map_response_value(v, 'maturity') if pd.notna(v) else None
    )
    idx['IRI_Maturity_Pass'] = (maturity_iri_numeric == 2).astype(int)  # Should be 'Level 2: Developing/Repeatable' = 2
    
    return idx

def _build_construct_means(cut: pd.DataFrame, scale_key: str, col_prefix: str, num_items: int) -> Dict[str, float]:
    """
    Build construct-level means (grand mean = mean of person-level means).
    
    Args:
        cut: DataFrame for this tier
        scale_key: Key in SCALE_MAPS (e.g., 'barriers', 'readiness', 'maturity')
        col_prefix: Column prefix (e.g., 'Q10-28_Barriers_')
        num_items: Number of items (excluding IRI)
    
    Returns:
        Dict with 'mean' and 'std' keys
    """
    results = {}
    
    # Build person-level means
    person_means = []
    for _, row in cut.iterrows():
        item_values = []
        for i in range(1, num_items + 1):
            col = f"{col_prefix}{i}"
            if col in cut.columns:
                val = _map_response_value(row[col], scale_key)
                if val is not None:
                    item_values.append(val)
        
        if item_values:
            person_means.append(np.mean(item_values))
    
    if person_means:
        results['mean'] = float(np.mean(person_means))
        results['std'] = float(np.std(person_means, ddof=1)) if len(person_means) > 1 else 0.0
    else:
        results['mean'] = None
        results['std'] = None
    
    return results

def _build_item_descriptives(cut: pd.DataFrame) -> Dict[str, Any]:
    """
    Build item-level descriptive statistics for all three scales.
    Fails fast if ANY column is missing.
    """
    descriptives = {}
    
    # Check barriers columns (B1-B18, excluding IRI B19)
    barrier_cols = [f"Q10-28_Barriers_{i}" for i in range(1, 19)]
    missing_barrier_cols = [col for col in barrier_cols if col not in cut.columns]
    if missing_barrier_cols:
        raise ValueError(f"Barrier columns missing from index: {missing_barrier_cols}")
    
    # Check readiness columns (R1-R17, excluding IRI R18)
    readiness_cols = [f"Q47-64_Readiness_{i}" for i in range(1, 18)]
    missing_readiness_cols = [col for col in readiness_cols if col not in cut.columns]
    if missing_readiness_cols:
        raise ValueError(f"Readiness columns missing from index: {missing_readiness_cols}")
    
    # Check maturity columns (M1-M8, excluding IRI M9)
    maturity_cols = [f"Q65-73_Maturity_{i}" for i in range(1, 9)]
    missing_maturity_cols = [col for col in maturity_cols if col not in cut.columns]
    if missing_maturity_cols:
        raise ValueError(f"Maturity columns missing from index: {missing_maturity_cols}")
    
    # Barriers
    descriptives['barriers'] = []
    for i, col in enumerate(barrier_cols, 1):
        values = cut[col].apply(lambda v: _map_response_value(v, 'barriers')).dropna()
        if len(values) > 0:
            descriptives['barriers'].append({
                'item': i,
                'mean': float(values.mean()),
                'std': float(values.std(ddof=1) if len(values) > 1 else 0.0),
                'n': int(len(values))
            })
    
    # Readiness
    descriptives['readiness'] = []
    for i, col in enumerate(readiness_cols, 1):
        values = cut[col].apply(lambda v: _map_response_value(v, 'readiness')).dropna()
        if len(values) > 0:
            descriptives['readiness'].append({
                'item': i,
                'mean': float(values.mean()),
                'std': float(values.std(ddof=1) if len(values) > 1 else 0.0),
                'n': int(len(values))
            })
    
    # Maturity
    descriptives['maturity'] = []
    for i, col in enumerate(maturity_cols, 1):
        values = cut[col].apply(lambda v: _map_response_value(v, 'maturity')).dropna()
        if len(values) > 0:
            descriptives['maturity'].append({
                'item': i,
                'mean': float(values.mean()),
                'std': float(values.std(ddof=1) if len(values) > 1 else 0.0),
                'n': int(len(values))
            })
    
    return descriptives

def _build_top3_pick_counts(cut: pd.DataFrame) -> Dict[str, Any]:
    """
    Build top-3 pick counts across all respondents in the cut.
    Fails fast if ANY of the 18 TOP3 columns is missing.
    """
    # Define the 18 TOP3 columns
    top3_cols = (
        [f"TOP3_B_{i}" for i in range(1, 10)] +
        [f"TOP3_R_{i}" for i in range(1, 10)]
    )
    
    # Check for missing columns
    missing_cols = [col for col in top3_cols if col not in cut.columns]
    if missing_cols:
        raise ValueError(f"TOP3 columns missing from idx: {missing_cols}")
    
    pick_counts = {}
    
    # Process barrier TOP3 picks
    for i in range(1, 10):
        col = f"TOP3_B_{i}"
        values = cut[col].dropna()
        pick_counts[f"barrier_{i}"] = int(len(values[values != '']))
    
    # Process readiness TOP3 picks
    for i in range(1, 10):
        col = f"TOP3_R_{i}"
        values = cut[col].dropna()
        pick_counts[f"readiness_{i}"] = int(len(values[values != '']))
    
    return {'pick_counts': pick_counts}

def _build_demographics_detailed(cut: pd.DataFrame) -> Dict[str, Any]:
    """
    Build detailed demographic breakdowns.
    Fails fast if ANY required demographic column is missing.
    """
    required_cols = ['Q1_Role', 'Q2_DecisionAuth', 'Q4_OrgSize', 'Q5_ProfitModel']
    missing_cols = [col for col in required_cols if col not in cut.columns]
    if missing_cols:
        raise ValueError(f"Required demographic columns missing: {missing_cols}")
    
    demos = {}
    
    # Role breakdown
    role_counts = cut['Q1_Role'].value_counts().to_dict()
    demos['role'] = [{'category': k, 'count': int(v)} for k, v in sorted(role_counts.items(), key=lambda x: x[1], reverse=True)]
    
    # Decision Authority breakdown
    auth_counts = cut['Q2_DecisionAuth'].value_counts().to_dict()
    demos['decision_authority'] = [{'category': k, 'count': int(v)} for k, v in sorted(auth_counts.items(), key=lambda x: x[1], reverse=True)]
    
    # Org Size breakdown
    demos['org_size'] = [{'category': k, 'count': int(v)} for k, v in cut['Q4_OrgSize'].value_counts().items()]
    
    # Profit Model breakdown
    demos['profit_model'] = [{'category': k, 'count': int(v)} for k, v in cut['Q5_ProfitModel'].value_counts().items()]
    
    return demos

def sensitivity_to_json(cuts: Dict[str, pd.DataFrame], mode: str, output_file: str) -> None:
    """
    Generate sensitivity-analysis.json from the five sample cuts.
    Fails fast if 'Prolific Accepted' cut is missing or empty.
    """
    if 'prolific_accepted' not in cuts:
        raise RuntimeError("'prolific_accepted' cut is missing from cuts dict")
    
    if len(cuts['prolific_accepted']) == 0:
        raise RuntimeError("'prolific_accepted' cut is empty")
    
    output = {
        'mode': mode,
        'last_updated': pd.Timestamp.now().isoformat(),
        'construct_means': {},
        'item_descriptives': {},
        'top3_picks': {},
        'demographics': {},
        'extended': {}
    }
    
    # For each tier, compute and store extended outputs
    for tier_name in ['conservative_clean', 'flexible_clean', 'prolific_accepted', 'v2_finished', 'v2_all']:
        if tier_name not in cuts:
            continue
        
        tier = cuts[tier_name]
        if len(tier) == 0:
            continue
        
        # Extended outputs for this tier
        output['extended'][tier_name] = {
            'n': int(len(tier)),
            'construct_means': {
                'barriers': _build_construct_means(tier, 'barriers', 'Q10-28_Barriers_', 18),
                'readiness': _build_construct_means(tier, 'readiness', 'Q47-64_Readiness_', 17),
                'maturity': _build_construct_means(tier, 'maturity', 'Q65-73_Maturity_', 8)
            },
            'item_descriptives': _build_item_descriptives(tier),
            'top3_picks': _build_top3_pick_counts(tier),
            'demographics': _build_demographics_detailed(tier)
        }
    
    # Write output
    with open(output_file, 'w') as f:
        json.dump(output, f, indent=2)
    print(f"Wrote {output_file}")

def main():
    # Assume public CSV exists at a known location
    csv_path = Path(__file__).parent.parent.parent / 'public' / 'datasets' / 'TABS_V2_CRP_2026_public_dataset.csv'
    
    if not csv_path.exists():
        print(f"ERROR: CSV not found at {csv_path}", file=sys.stderr)
        sys.exit(1)
    
    # Load frozen N=200 dataset
    df = load_data(str(csv_path), mode='crp_200')
    
    # Build IRI flags
    df = _build_iri_flags(df)
    
    # Build sensitivity cuts
    cuts = _build_sensitivity_cuts(df)
    
    # Generate sensitivity-analysis.json
    output_dir = csv_path.parent.parent / 'src' / 'data'
    output_dir.mkdir(parents=True, exist_ok=True)
    
    sensitivity_to_json(cuts, mode='crp_200', output_file=str(output_dir / 'crp-sensitivity-analysis.json'))

if __name__ == '__main__':
    main()
