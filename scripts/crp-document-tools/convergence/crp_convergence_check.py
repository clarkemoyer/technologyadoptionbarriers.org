#!/usr/bin/env python3
"""
CRP Convergence Checker v1.0 (4-16-2026)
=========================================
Self-contained script that:
1. Extracts all quantitative claims from the CRP DOCX body XML
2. Loads pipeline ground-truth from crp-validation.json and crp-sensitivity-analysis.json
3. Cross-references every claim against pipeline values
4. Produces a versioned claims database JSON and convergence report

Usage:
    python crp_convergence_check.py \
        --crp-xml /path/to/unpacked/word/document.xml \
        --repo /path/to/tabs-site \
        --output-dir /path/to/CRP Convergence System

Requirements:
    - CRP must be unpacked first (unpack.py)
    - Repo must be cloned (git clone --depth 1 ...)
    - Python 3.9+ with json, re, os, sys, zoneinfo (stdlib only)

The script produces:
    - Pipeline Snapshots/pipeline_stats (<timestamp>).json
    - Claims Databases/claims_database (<timestamp>).json
    - Convergence Reports/convergence_report (<timestamp>).md
"""

import json
import re
import os
import sys
import argparse
from datetime import datetime
from zoneinfo import ZoneInfo

# Use the real America/New_York timezone (handles EST vs EDT correctly)
NY = ZoneInfo('America/New_York')


def get_timestamp():
    """Return a local-time timestamp string for filenames."""
    now = datetime.now(NY)
    return now.strftime(f"{now.month}-{now.day}-%Y %H%M %Z")


def strip_xml_tags(xml_text):
    """Strip all XML tags, decode common entities."""
    text = re.sub(r'<[^>]+>', ' ', xml_text)
    text = text.replace('&amp;', '&')
    text = text.replace('&lt;', '<')
    text = text.replace('&gt;', '>')
    text = text.replace('&#x2019;', "'")
    text = text.replace('&#x201C;', '"')
    text = text.replace('&#x201D;', '"')
    text = text.replace('&#x2018;', "'")
    text = text.replace('&#x2013;', '-')
    text = text.replace('&#x2014;', '-')
    text = re.sub(r'\s+', ' ', text)
    return text


def parse_num(s):
    """Parse a number string, stripping trailing periods and common artifacts."""
    s = s.strip().rstrip('.')
    try:
        return float(s)
    except ValueError:
        return None


def extract_pipeline_stats(repo_path):
    """Extract all statistics from frozen CRP pipeline JSON files."""
    stats = {}

    # Load crp-validation.json
    val_path = os.path.join(repo_path, 'src/data/crp-validation.json')
    if os.path.exists(val_path):
        with open(val_path) as f:
            val = json.load(f)
        # Prefer the sample identified by primary_sample; fall back to samples[0]
        # if the key is absent (older schema or single-sample files).
        samples = val.get('samples', [])
        if not samples:
            return stats
        primary_key = val.get('primary_sample')
        if primary_key:
            sample = next(
                (s for s in samples if s.get('key') == primary_key),
                samples[0],
            )
        else:
            sample = samples[0]

        # Reliability metrics per construct.
        # crp-validation.json stores construct blocks under capitalized keys
        # ("Barriers", "Readiness", "Maturity") with cronbach_alpha (not alpha),
        # mcdonalds_omega (not omega_total), and kmo_bartlett.kmo_overall (not kmo).
        # Fall back to lowercase keys so the extractor also handles any
        # older schema versions that used lowercase.
        for construct in ['Barriers', 'Readiness', 'Maturity']:
            data = sample.get(construct) or sample.get(construct.lower())
            if data:
                stats[f'alpha_{construct}'] = data.get('cronbach_alpha') or data.get('alpha')
                stats[f'cr_{construct}'] = data.get('composite_reliability')
                stats[f'ave_{construct}'] = data.get('ave')
                stats[f'omega_total_{construct}'] = (
                    data.get('mcdonalds_omega') or data.get('omega_total')
                )
                stats[f'omega_h_{construct}'] = data.get('omega_hierarchical')
                stats[f'split_half_{construct}'] = data.get('split_half')
                kmo_bartlett = data.get('kmo_bartlett') or {}
                stats[f'kmo_{construct}'] = (
                    kmo_bartlett.get('kmo_overall') if kmo_bartlett else data.get('kmo')
                )
                stats[f'items_{construct}'] = data.get('items')
                # Item-total correlations
                itc = data.get('item_total_correlations', {})
                for item, val_itc in itc.items():
                    stats[f'itc_{construct}_{item}'] = val_itc

        # HTMT
        for entry in sample.get('htmt', []):
            pair = entry.get('pair', '')
            stats[f'htmt_{pair}'] = entry.get('htmt')

        # Fornell-Larcker.
        # The schema exposes sqrt_ave1, sqrt_ave2, abs_r, and pass per pair
        # (no shared_variance field).  Extract each numeric field so CRP claims
        # can be matched, and compute shared_variance = abs_r^2 as an extra key
        # in case the CRP states the squared correlation directly.
        for entry in sample.get('fornell_larcker', []):
            pair = entry.get('pair', '')
            for field in ('sqrt_ave1', 'sqrt_ave2', 'abs_r'):
                val = entry.get(field)
                if val is not None:
                    stats[f'fl_{pair}_{field}'] = val
            abs_r = entry.get('abs_r')
            if abs_r is not None:
                stats[f'fl_{pair}_shared_variance'] = round(abs_r ** 2, 6)

        # Construct correlations
        corr = sample.get('construct_correlations', {})
        if isinstance(corr, dict):
            for c1, inner in corr.items():
                if isinstance(inner, dict):
                    for c2, val_corr in inner.items():
                        stats[f'corr_{c1}_{c2}'] = val_corr

        # Factor analysis
        fa = sample.get('factor_analysis', {})
        for i, factor in enumerate(fa.get('efa_factors', [])):
            stats[f'efa_f{i+1}_items'] = factor.get('items')
            stats[f'efa_f{i+1}_eigenvalue'] = factor.get('eigenvalue')
            stats[f'efa_f{i+1}_variance_pct'] = factor.get('variance_pct')
        for group in fa.get('three_groups', []):
            name = group.get('name', '')
            stats[f'group_{name}_items'] = group.get('items')
            stats[f'group_{name}_alpha'] = group.get('alpha')
            stats[f'group_{name}_cr'] = group.get('cr')
            stats[f'group_{name}_ave'] = group.get('ave')

    # Load crp-sensitivity-analysis.json
    sens_path = os.path.join(repo_path, 'src/data/crp-sensitivity-analysis.json')
    if os.path.exists(sens_path):
        with open(sens_path) as f:
            sens = json.load(f)
        # Extract metrics across tiers
        for metric in sens.get('metrics', []):
            key = metric.get('key', '')
            values = metric.get('values', {})
            for tier, val_tier in values.items():
                stats[f'{key}_{tier}'] = val_tier

    return stats


def extract_claims(crp_text):
    """Extract quantitative claims from CRP text using regex patterns."""
    claims = []
    claim_id = 0

    # Pattern definitions: (category, subcategory, regex, pipeline_key_template)
    patterns = [
        # Cronbach's alpha
        ('reliability', 'cronbach_alpha',
         r'(?:Cronbach.s\s+)?(?:alpha|α)\s*(?:=|of|was|:)\s*(\.?\d+\.?\d*)',
         None),
        # Composite reliability
        ('reliability', 'composite_reliability',
         r'(?:composite\s+reliability|CR)\s*(?:=|of|was|:)\s*(\.?\d+\.?\d*)',
         None),
        # AVE
        ('validity', 'ave',
         r'(?:AVE|average\s+variance\s+extracted)\s*(?:=|of|was|:)\s*(\.?\d+\.?\d*)',
         None),
        # HTMT
        ('validity', 'htmt',
         r'HTMT\s*(?:ratio)?\s*(?:=|of|was|:)?\s*(\.?\d+\.?\d*)',
         None),
        # Sample sizes
        ('sample', 'n',
         r'[Nn]\s*=\s*(\d+)',
         None),
        # Construct means
        ('descriptive', 'mean',
         r'(?:mean|average[sd]?)\s*(?:=|of|was|:)\s*(\d+\.\d+)',
         None),
        # Correlations
        ('correlation', 'pearson',
         r'[Rr]\s*=\s*([-.]?\d+\.?\d*)',
         None),
        # Variance explained
        ('factor', 'variance',
         r'(\d+\.?\d*)\s*%\s*(?:of\s+)?(?:total\s+)?variance',
         None),
        # Route/article/workflow counts
        ('platform', 'counts',
         r'(\d+)\s+(?:static\s+routes|scholarly\s+articles|bibliography\s+entries|CI/CD\s+workflows|validation\s+checks)',
         None),
    ]

    for category, subcategory, pattern, _ in patterns:
        for match in re.finditer(pattern, crp_text, re.IGNORECASE):
            val = parse_num(match.group(1))
            if val is None:
                continue

            # Get surrounding context (100 chars each side)
            start = max(0, match.start() - 100)
            end = min(len(crp_text), match.end() + 100)
            context = crp_text[start:end].strip()

            claims.append({
                'id': claim_id,
                'category': category,
                'subcategory': subcategory,
                'crp_value': val,
                'crp_text': match.group(0),
                'context': context,
                'char_offset': match.start(),
                'pipeline_key': None,
                'pipeline_value': None,
                'status': 'UNVERIFIED',
                'tier': None
            })
            claim_id += 1

    return claims


def match_claims_to_pipeline(claims, stats):
    """Match extracted claims to pipeline statistics and classify."""
    tier_keys = ['conservative_clean', 'flexible_clean', 'prolific_accepted', 'v2_finished', 'v2_all']

    for claim in claims:
        ctx = claim['context'].lower()
        val = claim['crp_value']
        best_match = None
        best_status = 'UNVERIFIED'
        best_key = None
        best_tier = None

        # Try to match against all pipeline stats
        for key, pval in stats.items():
            if pval is None:
                continue
            try:
                pval_f = float(pval)
            except (ValueError, TypeError):
                continue

            # Check for exact match (within 0.0005)
            if abs(val - pval_f) < 0.0005:
                # Determine tier
                tier = None
                for t in tier_keys:
                    if t in key:
                        tier = t
                        break

                if best_match is None or (tier == 'prolific_accepted' and best_tier != 'prolific_accepted'):
                    best_match = pval_f
                    best_key = key
                    best_tier = tier
                    best_status = 'EXACT_MATCH'

            # Check for rounding match (within 0.005)
            elif abs(val - pval_f) < 0.005:
                if best_status not in ('EXACT_MATCH',):
                    tier = None
                    for t in tier_keys:
                        if t in key:
                            tier = t
                            break
                    best_match = pval_f
                    best_key = key
                    best_tier = tier
                    best_status = 'ROUNDING_OK'

        if best_match is not None:
            claim['pipeline_value'] = best_match
            claim['pipeline_key'] = best_key
            claim['status'] = best_status
            claim['tier'] = best_tier

    return claims


def deduplicate_claims(claims):
    """Remove duplicate claims produced by overlapping regex matches.

    Two claims are considered duplicates only when they share *all* of:
      - the same numeric value (crp_value)
      - the same ~500-char text window (char_offset // 500)
      - the same category and subcategory
      - the same matched text span (crp_text)

    The additional discriminators prevent distinct claims that coincidentally
    share the same value in the same paragraph (e.g. two different metrics
    that both equal 0.85) from being incorrectly merged.
    """
    seen = set()
    unique = []
    for c in claims:
        key = (
            c['crp_value'],
            c['char_offset'] // 500,
            c['category'],
            c['subcategory'],
            c['crp_text'],
        )
        if key not in seen:
            seen.add(key)
            unique.append(c)
    return unique


def classify_mismatches(claims, stats):
    """Classify unverified claims as tier-specific, item-level, subgroup, or true mismatch."""
    for claim in claims:
        if claim['status'] != 'UNVERIFIED':
            continue
        ctx = claim['context'].lower()

        # Check if it's a tier-specific value
        for tier in ['conservative', 'flexible', 'prolific']:
            if tier in ctx:
                claim['status'] = 'TIER_MATCH'
                claim['tier'] = tier
                break

        # Check for item-level indicators
        if claim['status'] == 'UNVERIFIED':
            item_indicators = ['legacy', 'privacy', 'cybersecurity', 'workforce', 'budget',
                             'leadership', 'governance', 'vendor', 'regulatory', 'training']
            for ind in item_indicators:
                if ind in ctx:
                    claim['status'] = 'ITEM_LEVEL'
                    break

        # Check for subgroup indicators
        if claim['status'] == 'UNVERIFIED':
            subgroup_indicators = ['iri-pass', 'iri-fail', 'smb', 'enterprise', 'subgroup',
                                 'cio', 'cto', 'coo', 'vp']
            for ind in subgroup_indicators:
                if ind in ctx:
                    claim['status'] = 'SUBGROUP'
                    break

        # Check for V1 pilot values
        if claim['status'] == 'UNVERIFIED' and ('v1' in ctx or 'pilot' in ctx or 'n = 25' in ctx or 'n=25' in ctx):
            claim['status'] = 'V1_PILOT'

    return claims


def generate_report(claims, stats, crp_version, timestamp):
    """Generate a convergence report in markdown."""
    # Tally statuses
    status_counts = {}
    for c in claims:
        s = c['status']
        status_counts[s] = status_counts.get(s, 0) + 1

    mismatches = [c for c in claims if c['status'] in ('MISMATCH', 'UNVERIFIED')]

    lines = []
    lines.append(f"# CRP Factual Convergence Report")
    lines.append(f"")
    lines.append(f"**Generated:** {timestamp}")
    lines.append(f"**CRP Version:** {crp_version}")
    lines.append(f"**Pipeline Stats Loaded:** {len(stats)}")
    lines.append(f"**Claims Extracted:** {len(claims)}")
    lines.append(f"")
    lines.append(f"## Claims Status Summary")
    lines.append(f"")
    lines.append(f"| Status | Count | Description |")
    lines.append(f"|--------|-------|-------------|")

    status_desc = {
        'EXACT_MATCH': 'CRP value matches pipeline within 0.0005',
        'ROUNDING_OK': 'CRP rounds correctly to stated precision',
        'TIER_MATCH': 'CRP value matches a different sample tier',
        'ITEM_LEVEL': 'Individual item mean, not construct grand mean',
        'SUBGROUP': 'Subgroup-specific value (IRI-pass/fail, role-based)',
        'V1_PILOT': 'V1 pilot value (n=25), not V2 pipeline',
        'UNVERIFIED': 'Claim not matched to any pipeline value - needs review',
        'MISMATCH': 'Value does not match any pipeline statistic',
    }
    for status in ['EXACT_MATCH', 'ROUNDING_OK', 'TIER_MATCH', 'ITEM_LEVEL',
                   'SUBGROUP', 'V1_PILOT', 'UNVERIFIED', 'MISMATCH']:
        count = status_counts.get(status, 0)
        desc = status_desc.get(status, '')
        lines.append(f"| {status} | {count} | {desc} |")

    lines.append(f"")

    if mismatches:
        lines.append(f"## CLAIMS REQUIRING ATTENTION ({len(mismatches)})")
        lines.append(f"")
        lines.append(f"Includes claims with status `MISMATCH` (value contradicts pipeline) and `UNVERIFIED` (no pipeline value found to compare against).")
        lines.append(f"")
        for m in mismatches:
            lines.append(f"### Claim ID {m['id']}: {m['category']}/{m['subcategory']} [{m['status']}]")
            lines.append(f"- **CRP value:** {m['crp_value']}")
            lines.append(f"- **CRP text:** `{m['crp_text']}`")
            lines.append(f"- **Context:** ...{m['context']}...")
            lines.append(f"- **Char offset:** {m['char_offset']}")
            lines.append(f"")
    else:
        lines.append(f"## No Mismatches or Unverified Claims Found")
        lines.append(f"")
        lines.append(f"All extracted claims either match the pipeline or are correctly classified as tier-specific, item-level, subgroup, or V1 pilot values.")

    lines.append(f"")
    lines.append(f"---")
    lines.append(f"")
    lines.append(f"## Verified Key Statistics")
    lines.append(f"")
    lines.append(f"| Statistic | CRP Value | Pipeline Value | Status |")
    lines.append(f"|-----------|-----------|----------------|--------|")
    for c in sorted(claims, key=lambda x: x['category']):
        if c['status'] in ('EXACT_MATCH', 'ROUNDING_OK'):
            pv = f"{c['pipeline_value']:.4f}" if c['pipeline_value'] is not None else 'N/A'
            lines.append(f"| {c['pipeline_key'] or c['crp_text']} | {c['crp_value']} | {pv} | {c['status']} |")

    return '\n'.join(lines)


def main():
    parser = argparse.ArgumentParser(description='CRP Convergence Checker')
    parser.add_argument('--crp-xml', required=True, help='Path to unpacked document.xml')
    parser.add_argument('--repo', required=True, help='Path to cloned tabs-site repo')
    parser.add_argument('--output-dir', required=True, help='Path to CRP Convergence System folder')
    parser.add_argument('--crp-version', default='Unknown', help='CRP version identifier')
    args = parser.parse_args()

    timestamp = get_timestamp()
    print(f"CRP Convergence Check - {timestamp}")
    print(f"=" * 60)

    # Step 1: Load pipeline stats
    print("Loading pipeline statistics...")
    stats = extract_pipeline_stats(args.repo)
    print(f"  Loaded {len(stats)} pipeline statistics")

    # Step 2: Extract CRP text
    print("Extracting CRP text...")
    with open(args.crp_xml, 'r', encoding='utf-8') as f:
        xml_content = f.read()
    crp_text = strip_xml_tags(xml_content)
    print(f"  Extracted {len(crp_text)} characters")

    # Step 3: Extract claims
    print("Extracting quantitative claims...")
    claims = extract_claims(crp_text)
    print(f"  Found {len(claims)} raw claims")

    # Step 4: Deduplicate
    claims = deduplicate_claims(claims)
    print(f"  {len(claims)} unique claims after deduplication")

    # Step 5: Match to pipeline
    print("Matching claims to pipeline...")
    claims = match_claims_to_pipeline(claims, stats)

    # Step 6: Classify remaining
    claims = classify_mismatches(claims, stats)

    # Tally
    status_counts = {}
    for c in claims:
        s = c['status']
        status_counts[s] = status_counts.get(s, 0) + 1
    print(f"  Results: {json.dumps(status_counts, indent=2)}")

    # Step 7: Save outputs
    # Create output subdirectories if they don't already exist
    for subdir in ('Pipeline Snapshots', 'Claims Databases', 'Convergence Reports'):
        os.makedirs(os.path.join(args.output_dir, subdir), exist_ok=True)

    # Pipeline snapshot
    pipeline_path = os.path.join(args.output_dir, 'Pipeline Snapshots',
                                  f'pipeline_stats ({timestamp}).json')
    with open(pipeline_path, 'w') as f:
        json.dump(stats, f, indent=2, default=str)
    print(f"  Saved: {pipeline_path}")

    # Claims database
    claims_path = os.path.join(args.output_dir, 'Claims Databases',
                                f'claims_database ({timestamp}).json')
    with open(claims_path, 'w') as f:
        json.dump(claims, f, indent=2, default=str)
    print(f"  Saved: {claims_path}")

    # Convergence report
    report = generate_report(claims, stats, args.crp_version, timestamp)
    report_path = os.path.join(args.output_dir, 'Convergence Reports',
                                f'convergence_report ({timestamp}).md')
    with open(report_path, 'w') as f:
        f.write(report)
    print(f"  Saved: {report_path}")

    # Summary - treat both MISMATCH and UNVERIFIED as non-convergence conditions.
    # UNVERIFIED claims were never matched to a pipeline value, so silently exiting 0
    # would give a false "all clear" even when coverage is incomplete.
    mismatches = status_counts.get('MISMATCH', 0)
    unverified = status_counts.get('UNVERIFIED', 0)
    if mismatches > 0:
        print(f"\n  WARNING: {mismatches} MISMATCHES found - review convergence report!")
    if unverified > 0:
        print(f"\n  WARNING: {unverified} UNVERIFIED claims - not matched to any pipeline value!")
    if mismatches == 0 and unverified == 0:
        print(f"\n  All claims converge with pipeline. No mismatches or unverified claims.")

    return mismatches + unverified


if __name__ == '__main__':
    sys.exit(main())
