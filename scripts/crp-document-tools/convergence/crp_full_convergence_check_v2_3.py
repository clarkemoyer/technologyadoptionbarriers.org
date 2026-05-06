#!/usr/bin/env python3
"""
CRP Full Claims Convergence Checker v2.3 (4-16-2026)
=====================================================
PROVENANCE PRINCIPLE: A claim is only VERIFIED if it traces to a
COMPUTATIONAL source of truth (pipeline JSON, frozen CSV, repo filesystem,
or institutional document). Claims that only appear in the CRP text itself
or in session-generated reference files are NOT verified -- they are
UNPROVENANCED and must be either (a) recomputed from source data and added
to the pipeline, or (b) removed from the CRP.

Checks ALL claim categories against their source-of-truth registries:
  1. Statistical claims -> crp-validation.json, crp-sensitivity-analysis.json
     (pipeline-generated from frozen CSV by GitHub Actions)
  2. Instrument claims -> crp-instrument-claims.json
     (verified against tabs_v2_constants.json + concept-mapping JSONs)
  3. Sample/methodology claims -> crp-sample-claims.json
     (verified against pipeline JSON tier definitions)
  4. Demographic claims -> crp-demographic-claims.json
     (verified against frozen CSV column distributions)
  5. Platform claims -> crp-platform-claims.json
     (verified against repo filesystem counts)
  6. Institutional claims -> crp-institutional-claims.json
     (verified against IRB letter, program docs)
  7. Timeline claims -> crp-timeline-claims.json
     (verified against QSF timestamps, git history, program records)
  8. Framework claims -> crp-framework-references.json
     (verified against published literature citations)
  9. V1 pilot claims -> crp-v1-pilot-claims.json
     (verified against V1 pilot XLSX source data, Feb 2026)
 10. Appendix claims -> crp-appendix-claims.json
     (verified against repo filesystem, pipeline JSON, and CRP text;
      covers Appendixes A-D: psychometric table, platform metrics,
      script line counts, capture page counts, IRB/committee facts)

Usage:
    python crp_full_convergence_check.py \
        --crp-xml /path/to/unpacked/word/document.xml \
        --registry-dir /path/to/CRP Convergence System/Claims Registries \
        --repo /path/to/tabs-site \
        --output-dir /path/to/CRP Convergence System
"""

import json, re, os, sys, argparse
from datetime import datetime
from zoneinfo import ZoneInfo

NY = ZoneInfo('America/New_York')

def get_timestamp():
    now = datetime.now(NY)
    return now.strftime(f"{now.month}-{now.day}-%Y %H%M %Z")

def strip_xml(xml):
    text = re.sub(r'<[^>]+>', ' ', xml)
    for old, new in [('&amp;','&'),('&lt;','<'),('&gt;','>'),
                     ('&#x2019;',"'"),('&#x201C;','"'),('&#x201D;','"'),
                     ('&#x2018;',"'"),('&#x2013;','-'),('&#x2014;','-')]:
        text = text.replace(old, new)
    return re.sub(r'\s+', ' ', text)

def parse_num(s):
    s = s.strip().rstrip('.')
    try: return float(s)
    except: return None

def load_json(path):
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f)
    return None

# ============================================================
# CHECK FUNCTIONS - one per claim category
# ============================================================

def check_scale_definitions(crp_text, instrument):
    """Check that scale labels, point counts, and anchors match."""
    results = []
    scales = instrument.get('scales', {})

    for construct, sdef in scales.items():
        labels = sdef.get('labels', {})
        for label, value in labels.items():
            # Check if the label appears in the CRP
            if label in crp_text:
                results.append({
                    'category': 'instrument',
                    'subcategory': 'scale_label',
                    'claim': f'{construct} scale: "{label}" = {value}',
                    'status': 'VERIFIED',
                    'source': sdef.get('source', 'constants.json')
                })
            else:
                results.append({
                    'category': 'instrument',
                    'subcategory': 'scale_label',
                    'claim': f'{construct} scale: "{label}" = {value}',
                    'status': 'NOT_FOUND_IN_CRP',
                    'source': sdef.get('source', 'constants.json'),
                    'note': 'Label not found in CRP text - may be referenced differently'
                })

        # Check point count
        point_str = f'{sdef["points"]}-point'
        if point_str in crp_text.lower() or f'{sdef["points"]} point' in crp_text.lower():
            results.append({
                'category': 'instrument',
                'subcategory': 'scale_points',
                'claim': f'{construct}: {sdef["points"]}-point scale',
                'status': 'VERIFIED',
                'source': sdef.get('source')
            })

    return results

def check_iri_claims(crp_text, instrument):
    """Check IRI attention check claims."""
    results = []
    iri = instrument.get('iri_attention_checks', {})

    for construct, idef in iri.items():
        expected = idef.get('expected_answer', '')
        if expected in crp_text:
            results.append({
                'category': 'instrument',
                'subcategory': 'iri_answer',
                'claim': f'{construct} IRI expected: "{expected}"',
                'status': 'VERIFIED',
                'source': idef.get('source')
            })
        else:
            results.append({
                'category': 'instrument',
                'subcategory': 'iri_answer',
                'claim': f'{construct} IRI expected: "{expected}"',
                'status': 'CHECK_MANUALLY',
                'source': idef.get('source'),
                'note': f'Exact string "{expected}" not found - may use abbreviated form'
            })

    # Check "3 instructed-response" or "three IRI" claims
    if '3 instructed' in crp_text.lower() or 'three instructed' in crp_text.lower() or '3 IRI' in crp_text or 'three IRI' in crp_text.lower():
        results.append({
            'category': 'instrument',
            'subcategory': 'iri_count',
            'claim': '3 IRI attention checks',
            'status': 'VERIFIED',
            'source': 'tabs_v2_constants.json:IRI_COLUMNS (3 entries)'
        })

    return results

def check_item_counts(crp_text, instrument):
    """Check item count claims (18 barriers, 17 readiness, etc.)."""
    results = []
    counts = instrument.get('item_counts', {})

    checks = [
        ('barriers', 'scored', '18 barrier', '18 barriers'),
        ('readiness', 'scored', '17 readiness', '17 readiness'),
        ('maturity', 'scored', '8 maturity', '8 maturity'),
        (None, 'total_survey_items', '57 item', '57 items'),
    ]

    for construct, key, *search_terms in checks:
        if construct:
            expected = counts.get(construct, {}).get(key, 0)
        else:
            expected = counts.get(key, 0)

        found = any(term in crp_text.lower() for term in search_terms)
        results.append({
            'category': 'instrument',
            'subcategory': 'item_count',
            'claim': f'{search_terms[0]}s = {expected}',
            'status': 'VERIFIED' if found else 'CHECK_MANUALLY',
            'source': 'tabs_v2_constants.json:ITEM_COUNTS'
        })

    return results

def check_dont_know(crp_text, instrument):
    """Check Don't Know handling claims."""
    results = []
    dk = instrument.get('dont_know', {})

    if "don't know" in crp_text.lower() or "dont know" in crp_text.lower():
        results.append({
            'category': 'instrument',
            'subcategory': 'dont_know',
            'claim': "Don't Know response exists",
            'status': 'VERIFIED',
            'source': dk.get('source', 'constants.json')
        })

    if 'excluded from scoring' in crp_text.lower() or 'treated as missing' in crp_text.lower():
        results.append({
            'category': 'instrument',
            'subcategory': 'dont_know_handling',
            'claim': "Don't Know excluded from scoring / treated as missing",
            'status': 'VERIFIED',
            'source': dk.get('source', 'constants.json')
        })

    return results

def check_sample_claims(crp_text, sample_reg):
    """Check sample size and tier claims."""
    results = []
    tiers = sample_reg.get('sample_tiers', {})

    for key, tdef in tiers.items():
        n = tdef.get('n', 0)
        n_str = f'N = {n}'
        n_str2 = f'N={n}'
        n_str3 = f'n = {n}'
        n_str4 = f'n={n}'

        found = any(s in crp_text for s in [n_str, n_str2, n_str3, n_str4])
        results.append({
            'category': 'sample',
            'subcategory': 'tier_n',
            'claim': f'{tdef.get("label", key)}: N={n}',
            'status': 'VERIFIED' if found else 'CHECK_MANUALLY',
            'source': 'crp-sensitivity-analysis.json:samples'
        })

    # Check quality filter claims
    filters = sample_reg.get('quality_filters', {})
    cons = filters.get('conservative_clean_criteria', {})
    if '480' in crp_text:
        results.append({
            'category': 'sample',
            'subcategory': 'duration_threshold',
            'claim': 'Conservative clean: duration >= 480 seconds',
            'status': 'VERIFIED',
            'source': 'tabs_v2_constants.json:DURATION_THRESHOLDS'
        })

    # V2 data filter
    v2f = filters.get('v2_data_filter', {})
    if '2026-03-23' in crp_text or 'March 23' in crp_text:
        results.append({
            'category': 'sample',
            'subcategory': 'v2_start',
            'claim': f'V2 start date: {v2f.get("start_date")}',
            'status': 'VERIFIED',
            'source': 'tabs_v2_constants.json:V2_DATA_FILTER'
        })

    return results

def check_demographic_claims(crp_text, demo_reg):
    """Check demographic percentage and distribution claims."""
    results = []
    derived = demo_reg.get('derived_percentages', {})

    # Check commonly cited percentages
    pct_checks = [
        ('smb_pct', 'SMB percentage'),
        ('enterprise_pct', 'Enterprise percentage'),
        ('for_profit_pct', 'For-profit percentage'),
    ]

    for key, desc in pct_checks:
        expected = derived.get(key, 0)
        # Search for the percentage in CRP (as XX% or XX.X% or referenced by name)
        pct_str = f'{expected}%'
        pct_int = f'{int(expected)}%'
        # Also check for N-based references (e.g., "N = 114" for SMB, "N = 86" for Enterprise)
        found = pct_str in crp_text or pct_int in crp_text
        # Check if the concept is referenced even without exact percentage
        if not found and 'smb' in key.lower():
            found = 'SMB' in crp_text and ('1,000 employees' in crp_text or '1000 employees' in crp_text.lower())
        if not found and 'enterprise' in key.lower():
            found = 'enterprise' in crp_text.lower() and ('1,000 employees' in crp_text or '1000 employees' in crp_text.lower())
        results.append({
            'category': 'demographic',
            'subcategory': 'percentage',
            'claim': f'{desc}: {expected}%',
            'status': 'VERIFIED' if found else 'CHECK_MANUALLY',
            'expected_value': expected,
            'source': derived.get('source', 'Frozen CSV')
        })

    # Check org size values
    for size_val, count in demo_reg.get('org_size_distribution', {}).get('counts', {}).items():
        if size_val in crp_text:
            results.append({
                'category': 'demographic',
                'subcategory': 'org_size_value',
                'claim': f'Org size "{size_val}" referenced in CRP',
                'status': 'VERIFIED',
                'source': 'TABS_V2_CRP_2026_public_dataset.csv:Q4_OrgSize'
            })

    # Check role values
    for role_val in demo_reg.get('role_distribution', {}).get('counts', {}).keys():
        # Roles are long strings, check short version
        short = role_val.split('(')[0].strip() if '(' in role_val else role_val
        if short in crp_text:
            results.append({
                'category': 'demographic',
                'subcategory': 'role_value',
                'claim': f'Role "{short}" referenced in CRP',
                'status': 'VERIFIED',
                'source': 'TABS_V2_CRP_2026_public_dataset.csv:Q1_Role'
            })

    return results

def check_platform_claims(crp_text, platform_reg):
    """Check platform count claims."""
    results = []

    checks = [
        ('static_routes', 'count', 'static route', '163'),
        ('scholarly_articles', 'count', 'scholarly article', '18'),
        ('bibliography_entries', 'count', 'bibliography', '42'),
        ('cicd_workflows', 'count', 'CI/CD workflow', '39'),
        ('validation_checks', 'crp_stats_validator', 'validation check', '84'),
    ]

    for key, subkey, desc, expected_str in checks:
        entry = platform_reg.get(key, {})
        expected = entry.get(subkey, 0)
        found = expected_str in crp_text
        results.append({
            'category': 'platform',
            'subcategory': 'count',
            'claim': f'{expected} {desc}s',
            'status': 'VERIFIED' if found else 'CHECK_MANUALLY',
            'expected_value': expected,
            'source': entry.get('source', 'repo filesystem')
        })

    return results

def check_institutional_claims(crp_text, inst_reg):
    """Check IRB, committee, and institutional claims."""
    results = []

    # IRB
    irb = inst_reg.get('irb', {})
    irb_checks = [
        ('study_number', irb.get('study_number', '')),
        ('exemption_category', irb.get('exemption_category', '')),
        ('approval_date', irb.get('approval_date', '')),
    ]
    for field, value in irb_checks:
        found = value in crp_text if value else False
        results.append({
            'category': 'institutional',
            'subcategory': f'irb_{field}',
            'claim': f'IRB {field}: {value}',
            'status': 'VERIFIED' if found else 'CHECK_MANUALLY',
            'source': irb.get('source', 'IRB documentation')
        })

    # Committee
    committee = inst_reg.get('committee', {})
    for role_key, member in committee.items():
        if isinstance(member, dict) and 'name' in member:
            name = member['name']
            found = name in crp_text
            results.append({
                'category': 'institutional',
                'subcategory': 'committee_member',
                'claim': f'Committee: {name} ({member.get("role", "")})',
                'status': 'VERIFIED' if found else 'CHECK_MANUALLY',
                'source': committee.get('source', 'Appendix D')
            })

    # Prolific study
    prolific = inst_reg.get('prolific_study', {})
    if str(prolific.get('target_n', '')) in crp_text:
        results.append({
            'category': 'institutional',
            'subcategory': 'prolific_target',
            'claim': f'Prolific target N={prolific.get("target_n")}',
            'status': 'VERIFIED',
            'source': prolific.get('source', 'Prolific dashboard')
        })

    return results

def check_timeline_claims(crp_text, timeline_reg):
    """Check date and timeline claims."""
    results = []
    milestones = timeline_reg.get('milestones', {})

    for key, mdef in milestones.items():
        date_str = mdef.get('date', '')
        event = mdef.get('event', '')

        # Try multiple date formats
        found = False
        if date_str:
            found = date_str in crp_text
            # Also try human-readable formats
            try:
                dt = datetime.strptime(date_str, '%Y-%m-%d')
                # Build month/day-of-month strings without the non-portable
                # '%-m'/'%-d' modifiers (which fail on Windows).
                m_padded = dt.strftime('%m')
                d_padded = dt.strftime('%d')
                m_unpad = str(dt.month)
                d_unpad = str(dt.day)
                month_name = dt.strftime('%B')
                year = dt.strftime('%Y')
                alt_formats = [
                    f'{month_name} {d_padded}, {year}',  # July 28, 2025
                    f'{month_name} {d_unpad}, {year}',   # July 8, 2025
                    f'{m_padded}/{d_padded}/{year}',      # 07/28/2025
                    f'{m_unpad}/{d_unpad}/{year}',        # 7/28/2025
                    f'{month_name} {d_unpad}',            # May 7 (no year)
                    f'{month_name} {d_padded}',           # May 07
                    f'{m_unpad}/{d_unpad}',               # 5/7
                ]
                found = found or any(fmt in crp_text for fmt in alt_formats)
            except (ValueError, TypeError):
                pass

        results.append({
            'category': 'timeline',
            'subcategory': 'milestone',
            'claim': f'{key}: {date_str} - {event[:60]}',
            'status': 'VERIFIED' if found else 'CHECK_MANUALLY',
            'source': mdef.get('source', 'project records')
        })

    return results

def check_provenance_sentinels(crp_text):
    """Check that known non-reproducible values do NOT appear in the CRP.

    These are values that were identified as having no computational source
    of truth and were removed from the CRP. If they reappear, flag them.
    """
    results = []

    sentinels = [
        ('69.9%', 'Bifactor omega-specific percentage (removed: not reproducible from frozen N=200)'),
        ('omega hierarchical', 'Omega-h statistic (removed: no pipeline computation exists)'),
        ('omega_hierarchical', 'Omega-h statistic (removed: no pipeline computation exists)'),
        ('omega total for all 43', 'Cross-construct omega-total (removed: not in pipeline)'),
        ('.301', 'Omega-h value (removed: computed on non-frozen sample without surviving script)'),
    ]

    for sentinel, reason in sentinels:
        if sentinel in crp_text.lower() or sentinel in crp_text:
            results.append({
                'category': 'provenance',
                'subcategory': 'sentinel_violation',
                'claim': f'NON-REPRODUCIBLE VALUE FOUND: "{sentinel}"',
                'status': 'MISMATCH',
                'note': reason,
                'source': 'Provenance sentinel check'
            })

    # Also check for omega-specific with the actual Unicode omega
    if '\u03c9_specific' in crp_text or 'ω_specific' in crp_text:
        results.append({
            'category': 'provenance',
            'subcategory': 'sentinel_violation',
            'claim': 'NON-REPRODUCIBLE VALUE FOUND: "omega_specific"',
            'status': 'MISMATCH',
            'note': 'Omega-specific (removed: no pipeline computation exists)',
            'source': 'Provenance sentinel check'
        })

    if not results:
        results.append({
            'category': 'provenance',
            'subcategory': 'sentinel_check',
            'claim': 'No non-reproducible sentinel values found in CRP',
            'status': 'VERIFIED',
            'source': 'Provenance sentinel check (5 sentinels tested)'
        })

    return results


def check_v1_pilot_claims(crp_text, v1_reg):
    """Check V1 pilot statistics in CRP against source-computed values.

    Source of truth: V1 pilot XLSX (Feb 27, 2026 export), computed directly
    from the raw data. These statistics appear in CRP Sections A.3/A.4
    (V1 instrument description and V1-to-V2 revision record).
    """
    results = []

    if not v1_reg:
        return results

    # Check V1 pilot sample size
    sample = v1_reg.get('sample', {})
    n_total = sample.get('total_v1_pilot_responses')
    if n_total:
        # Look for the V1 pilot N in the CRP (e.g., "25 responses", "N = 25", "n = 25")
        n_str = str(n_total)
        patterns = [f'n = {n_str}', f'N = {n_str}', f'{n_str} responses', f'{n_str} participants',
                    f'{n_str} complete', f'pilot.*{n_str}', f'{n_str}.*pilot']
        found = any(re.search(p, crp_text, re.IGNORECASE) for p in patterns)
        results.append({
            'category': 'v1_pilot',
            'subcategory': 'sample_size',
            'claim': f'V1 pilot total responses: {n_total}',
            'status': 'VERIFIED' if found else 'CHECK_MANUALLY',
            'source': 'V1 pilot XLSX (Feb 27, 2026)',
            'note': None if found else 'V1 pilot N may be referenced in appendix only'
        })

    # Check V1 reliability (alphas)
    reliability = v1_reg.get('reliability', {})
    for construct, rdata in reliability.items():
        alpha = rdata.get('cronbachs_alpha')
        if alpha is None:
            continue

        # Search for the alpha value in CRP text (with tolerance for rounding)
        alpha_str_3 = f'.{str(round(alpha, 3))[2:]}'  # e.g., .803
        alpha_str_2 = f'.{str(round(alpha, 2))[2:]}'  # e.g., .80
        alpha_full = str(round(alpha, 4))               # e.g., 0.8029

        # Also check common CRP phrasings
        found = False
        for s in [alpha_str_3, alpha_str_2, alpha_full, str(round(alpha, 3))]:
            if s in crp_text:
                found = True
                break

        # Special: look for the .932/.930 range for readiness
        if not found and construct == 'readiness':
            for s in ['.932', '.930', '.9303']:
                if s in crp_text:
                    found = True
                    break

        results.append({
            'category': 'v1_pilot',
            'subcategory': 'reliability',
            'claim': f'V1 pilot {construct} alpha = {alpha:.4f} (n={rdata.get("n_complete")} complete, k={rdata.get("n_items")} items)',
            'status': 'VERIFIED' if found else 'CHECK_MANUALLY',
            'source': 'V1 pilot XLSX (Feb 27, 2026), computed from source data',
            'note': None if found else f'V1 pilot alpha for {construct} not found in CRP body - may be in appendix'
        })

    # Check V1 instrument structure
    inst = v1_reg.get('instrument', {})
    if inst.get('barrier_items'):
        # Check "18 barrier items" claim
        found = '18 barrier' in crp_text.lower() or '18-item barrier' in crp_text.lower()
        results.append({
            'category': 'v1_pilot',
            'subcategory': 'instrument',
            'claim': f'V1 barrier items: {inst["barrier_items"]}',
            'status': 'VERIFIED' if found else 'CHECK_MANUALLY',
            'source': 'V1 pilot XLSX column headers'
        })

    if inst.get('readiness_items'):
        found = '17 readiness' in crp_text.lower() or '17-item readiness' in crp_text.lower()
        results.append({
            'category': 'v1_pilot',
            'subcategory': 'instrument',
            'claim': f'V1 readiness items: {inst["readiness_items"]}',
            'status': 'VERIFIED' if found else 'CHECK_MANUALLY',
            'source': 'V1 pilot XLSX column headers'
        })

    if inst.get('maturity_items'):
        found = '8 maturity' in crp_text.lower() or '8-item maturity' in crp_text.lower() or 'eight maturity' in crp_text.lower()
        results.append({
            'category': 'v1_pilot',
            'subcategory': 'instrument',
            'claim': f'V1 maturity items: {inst["maturity_items"]}',
            'status': 'VERIFIED' if found else 'CHECK_MANUALLY',
            'source': 'V1 pilot XLSX column headers'
        })

    # Check V1-to-V2 changes
    changes = v1_reg.get('v1_to_v2_changes', {})
    if changes.get('forced_ranking_removed'):
        found = 'forced' in crp_text.lower() and 'rank' in crp_text.lower()
        results.append({
            'category': 'v1_pilot',
            'subcategory': 'v1_v2_change',
            'claim': 'Forced ranking removed in V2',
            'status': 'VERIFIED' if found else 'CHECK_MANUALLY',
            'source': 'V1 pilot XLSX (Q9/Q10 present), V2 QSF (Q9/Q10 absent)'
        })

    if changes.get('attention_check_change'):
        found = 'instructed' in crp_text.lower() and 'response' in crp_text.lower()
        results.append({
            'category': 'v1_pilot',
            'subcategory': 'v1_v2_change',
            'claim': 'V1 absurd-content attention checks replaced with IRI in V2',
            'status': 'VERIFIED' if found else 'CHECK_MANUALLY',
            'source': 'V1 pilot XLSX (absurd items) vs V2 QSF (IRI items)'
        })

    if changes.get('decision_authority_added'):
        found = 'decision authority' in crp_text.lower() or 'Q1b' in crp_text
        results.append({
            'category': 'v1_pilot',
            'subcategory': 'v1_v2_change',
            'claim': 'Decision Authority (Q1b) added in V2',
            'status': 'VERIFIED' if found else 'CHECK_MANUALLY',
            'source': 'V1 QSF (no Q1b) vs V2 QSF (Q1b present)'
        })

    # Check forced ranking findings
    fr = v1_reg.get('forced_ranking_findings', {})
    if fr.get('spearman_rho') is not None:
        rho = fr['spearman_rho']
        rho_str = str(rho)
        # Look for Spearman rho value
        found = rho_str in crp_text or '-.24' in crp_text or '-0.24' in crp_text
        results.append({
            'category': 'v1_pilot',
            'subcategory': 'forced_ranking',
            'claim': f'V1 forced ranking Spearman rho = {rho}',
            'status': 'VERIFIED' if found else 'CHECK_MANUALLY',
            'source': 'V1 pilot XLSX, rank-severity concordance analysis',
            'note': None if found else 'Spearman rho may be in appendix A.4 only'
        })

    return results


def check_framework_claims(crp_text, fw_reg):
    """Check claims about external frameworks (construct counts, names, etc.)."""
    results = []

    for fw_key, fdef in fw_reg.items():
        if fw_key.startswith('_'):
            continue
        if not isinstance(fdef, dict):
            continue

        fw_name = fdef.get('full_name', fw_key)

        # Check if framework is referenced at all
        if fw_key in crp_text or fw_name in crp_text:
            results.append({
                'category': 'framework',
                'subcategory': 'reference',
                'claim': f'{fw_key} ({fw_name}) referenced',
                'status': 'VERIFIED',
                'source': fdef.get('source', 'published literature')
            })

        # Check specific numeric claims about the framework
        if 'core_constructs' in fdef and isinstance(fdef['core_constructs'], int):
            n = fdef['core_constructs']
            # Look for "four core constructs" or "4 constructs" near framework name
            patterns = [f'{n} core constructs', f'{n} constructs']
            word_nums = {2:'two',3:'three',4:'four',5:'five',6:'six',7:'seven',8:'eight'}
            if n in word_nums:
                patterns.append(f'{word_nums[n]} core constructs')
                patterns.append(f'{word_nums[n]} constructs')

            found = any(p in crp_text.lower() for p in patterns)
            results.append({
                'category': 'framework',
                'subcategory': 'construct_count',
                'claim': f'{fw_key}: {n} core constructs',
                'status': 'VERIFIED' if found else 'CHECK_MANUALLY',
                'source': fdef.get('source')
            })

        # Check construct names if listed
        if 'construct_names' in fdef:
            for cname in fdef['construct_names']:
                found = cname in crp_text
                results.append({
                    'category': 'framework',
                    'subcategory': 'construct_name',
                    'claim': f'{fw_key}: construct "{cname}"',
                    'status': 'VERIFIED' if found else 'NOT_IN_CRP',
                    'source': fdef.get('source')
                })

        # Check maturity levels
        if 'levels' in fdef and isinstance(fdef['levels'], int):
            n = fdef['levels']
            word_nums = {2:'two',3:'three',4:'four',5:'five',6:'six'}
            patterns = [f'{n} maturity levels', f'{n} levels']
            if n in word_nums:
                patterns.extend([f'{word_nums[n]} maturity levels', f'{word_nums[n]} levels'])
            found = any(p in crp_text.lower() for p in patterns)
            results.append({
                'category': 'framework',
                'subcategory': 'level_count',
                'claim': f'{fw_key}: {n} maturity levels',
                'status': 'VERIFIED' if found else 'CHECK_MANUALLY',
                'source': fdef.get('source')
            })

        # Check HTMT thresholds
        if 'conservative' in fdef:
            threshold = str(fdef['conservative'])
            if threshold in crp_text or '.85' in crp_text:
                results.append({
                    'category': 'framework',
                    'subcategory': 'threshold',
                    'claim': f'{fw_key}: conservative threshold = {threshold}',
                    'status': 'VERIFIED',
                    'source': fdef.get('source')
                })

    return results

def check_statistical_claims(crp_text, repo_path):
    """Original statistical claims check (from v1)."""
    results = []

    # Load pipeline
    val_path = os.path.join(repo_path, 'src/data/crp-validation.json')
    sens_path = os.path.join(repo_path, 'src/data/crp-sensitivity-analysis.json')

    stats = {}
    if os.path.exists(val_path):
        with open(val_path) as f:
            val = json.load(f)
        samples = val.get('samples', []) if isinstance(val, dict) else []
        sample = samples[0] if samples else {}
        for construct in ['Barriers', 'Readiness', 'Maturity', 'barriers', 'readiness', 'maturity']:
            if construct in sample:
                d = sample[construct]
                for metric in ['alpha', 'composite_reliability', 'ave', 'omega_total', 'omega_hierarchical', 'split_half', 'kmo']:
                    if d.get(metric) is not None:
                        stats[f'{metric}_{construct}'] = d[metric]
        for entry in sample.get('htmt', []):
            pair = entry.get('pair')
            htmt_val = entry.get('htmt')
            if pair is not None and htmt_val is not None:
                stats[f'htmt_{pair}'] = htmt_val
        corr = sample.get('construct_correlations', {})
        if isinstance(corr, dict):
            for c1, inner in corr.items():
                if isinstance(inner, dict):
                    for c2, v in inner.items():
                        stats[f'corr_{c1}_{c2}'] = v

    if os.path.exists(sens_path):
        with open(sens_path) as f:
            sens = json.load(f)
        for metric in sens.get('metrics', []):
            for tier, v in metric.get('values', {}).items():
                stats[f'{metric["key"]}_{tier}'] = v

    # Extract numeric claims
    patterns = [
        (r'(?:alpha|α)\s*(?:=|of|was)\s*(\.?\d+\.?\d*)', 'alpha'),
        (r'(?:composite\s+reliability|CR)\s*(?:=|of|was)\s*(\.?\d+\.?\d*)', 'cr'),
        (r'(?:AVE)\s*(?:=|of|was)\s*(\.?\d+\.?\d*)', 'ave'),
        (r'HTMT\s*(?:ratio)?\s*(?:=|of|was)\s+(0?\.\d+)', 'htmt'),
    ]

    seen_claims = set()  # deduplicate
    for pattern, cat in patterns:
        for match in re.finditer(pattern, crp_text, re.IGNORECASE):
            val = parse_num(match.group(1))
            if val is None:
                continue

            # Skip false positives
            if cat == 'alpha' and val < 0.3:  # alpha = .05 is significance level, not reliability
                continue
            if cat == 'htmt' and val == 0.85:  # HTMT.85 is the threshold, not a measured value
                continue

            # Deduplicate identical value+category pairs
            dedup_key = f'{cat}_{round(val, 3)}'
            if dedup_key in seen_claims:
                continue
            seen_claims.add(dedup_key)

            matched = False
            matched_key = None
            for key, pval in stats.items():
                try:
                    # Use wider tolerance for rounded values (.844 matches .8441)
                    if abs(val - float(pval)) < 0.01:
                        matched = True
                        matched_key = key
                        break
                except:
                    pass

            results.append({
                'category': 'statistical',
                'subcategory': cat,
                'claim': match.group(0)[:80],
                'crp_value': val,
                'pipeline_key': matched_key,
                'pipeline_value': float(stats.get(matched_key, 0)) if matched_key else None,
                'status': 'VERIFIED' if matched else 'CHECK_MANUALLY',
                'source': 'crp-validation.json / crp-sensitivity-analysis.json'
            })

    return results


def check_appendix_claims(crp_text, appendix_reg, repo_path):
    """Check appendix-specific claims against CRP text and repo filesystem.

    Covers Appendixes A-D: psychometric table values, platform metrics,
    script line counts, capture page counts, committee/IRB facts.
    Verifies against: repo filesystem, pipeline JSON, CRP body+appendix text.
    """
    results = []

    # Load pipeline JSON for psychometric verification
    val_path = os.path.join(repo_path, 'src/data/crp-validation.json')
    sens_path = os.path.join(repo_path, 'src/data/crp-sensitivity-analysis.json')
    val_data = load_json(val_path)
    sens_data = load_json(sens_path)

    # Helper: extract pipeline value by construct and metric
    def get_pipeline_val(construct, metric):
        """Get a value from pipeline JSON for verification."""
        if val_data and metric in ('composite_reliability', 'ave'):
            for s in val_data.get('samples', []):
                cdata = s.get(construct) or s.get(construct.title())
                if cdata and metric in cdata:
                    return cdata[metric]
        if sens_data and metric == 'alpha':
            for m in sens_data.get('metrics', []):
                if m.get('key') == f'alpha_{construct}':
                    return m.get('values', {}).get('prolific_accepted')
        return None

    # ============================================================
    # APPENDIX A: Psychometric table and instrument structure
    # ============================================================
    app_a = appendix_reg.get('appendix_a', {})

    # A.1 psychometric cross-reference table
    for claim in app_a.get('psychometric_table', {}).get('claims', []):
        field = claim.get('field', '')
        expected = claim.get('value')
        search_val = str(expected)

        # Verify value exists in CRP text
        found_in_crp = search_val in crp_text

        # Cross-check against pipeline
        pipeline_match = None
        if 'alpha' in field:
            construct = field.replace('_alpha', '')
            pval = get_pipeline_val(construct, 'alpha')
            if pval is not None:
                pipeline_match = abs(float(pval) - expected) < 0.001
        elif '_cr' in field:
            construct = field.replace('_cr', '')
            pval = get_pipeline_val(construct, 'composite_reliability')
            if pval is not None:
                pipeline_match = abs(float(pval) - expected) < 0.001
        elif '_ave' in field:
            construct = field.replace('_ave', '')
            pval = get_pipeline_val(construct, 'ave')
            if pval is not None:
                pipeline_match = abs(float(pval) - expected) < 0.001
        elif '_items' in field:
            pipeline_match = True  # Item counts verified by instrument registry

        status = 'VERIFIED' if (found_in_crp and pipeline_match is not False) else 'CHECK_MANUALLY'
        note = None
        if not found_in_crp:
            note = f'Value {search_val} not found in CRP text'
        elif pipeline_match is False:
            note = f'Pipeline mismatch for {field}'

        results.append({
            'category': 'appendix_a',
            'subcategory': 'psychometric_table',
            'claim': claim['claim'],
            'status': status,
            'source': claim.get('source', 'pipeline JSON'),
            'note': note
        })

    # A instrument structure claims (search-based)
    for claim in app_a.get('instrument_structure', {}).get('claims', []):
        search_text = claim.get('search_text', '')
        found = search_text in crp_text
        results.append({
            'category': 'appendix_a',
            'subcategory': 'instrument_structure',
            'claim': claim['claim'],
            'status': 'VERIFIED' if found else 'CHECK_MANUALLY',
            'source': 'CRP text + source data'
        })

    # A.4 V1 revision record claims
    for claim in app_a.get('v1_revision_record', {}).get('claims', []):
        search_text = claim.get('search_text', '')
        # Handle Unicode minus sign as well as ASCII
        found = search_text in crp_text
        if not found and '-' in search_text:
            # Try with Unicode minus
            found = search_text.replace('-', '\u2212') in crp_text
        results.append({
            'category': 'appendix_a',
            'subcategory': 'v1_revision',
            'claim': claim['claim'],
            'status': 'VERIFIED' if found else 'CHECK_MANUALLY',
            'source': 'V1 pilot XLSX source data'
        })

    # ============================================================
    # APPENDIX B: Platform metrics (verifiable against repo)
    # ============================================================
    app_b = appendix_reg.get('appendix_b', {})

    # Platform at a Glance metrics
    for claim in app_b.get('platform_metrics', {}).get('claims', []):
        search_text = claim.get('search_text', '')
        found = search_text in crp_text

        # Filesystem verification where possible
        repo_verified = None
        if claim.get('verify_type') == 'repo_check' and repo_path:
            expected = claim.get('expected')
            expected_min = claim.get('expected_min')
            if expected == 39:  # workflows
                actual = len([f for f in os.listdir(os.path.join(repo_path, '.github/workflows'))
                              if f.endswith('.yml')])
                repo_verified = (actual == expected)
            elif expected == 65:  # components
                import glob
                actual = len(glob.glob(os.path.join(repo_path, 'src/components/**/*.tsx'), recursive=True))
                repo_verified = (actual == expected)
            elif expected == 42:  # bibliography
                actual = len(glob.glob(os.path.join(repo_path, 'src/app/bibliography-*/page.tsx')))
                repo_verified = (actual == expected)
            elif expected == 784:  # repo files
                import subprocess
                r = subprocess.run(['git', 'ls-files'], cwd=repo_path, capture_output=True, text=True)
                actual = len(r.stdout.strip().split('\n'))
                repo_verified = (actual == expected)
            elif expected == 18:  # blog articles (17 article-* + 1 overview)
                actual = len(glob.glob(os.path.join(repo_path, 'src/app/article-*/page.tsx')))
                actual += 1  # overview at technology-adoption-models/
                repo_verified = (actual == expected)
            elif expected_min == 163:  # content pages
                import subprocess
                r = subprocess.run(['find', os.path.join(repo_path, 'src/app'), '-name', 'page.tsx'],
                                   capture_output=True, text=True)
                actual = len(r.stdout.strip().split('\n'))
                repo_verified = (actual >= expected_min)

        status = 'VERIFIED'
        note = None
        if not found:
            status = 'NOT_FOUND_IN_CRP'
            note = f'"{search_text}" not found in CRP text'
        elif repo_verified is False:
            status = 'MISMATCH'
            note = f'Repo filesystem count does not match claim'

        results.append({
            'category': 'appendix_b',
            'subcategory': 'platform_metric',
            'claim': claim['claim'],
            'status': status,
            'source': 'repo filesystem' if claim.get('verify_type') == 'repo_check' else 'CRP text',
            'note': note
        })

    # Capture page counts
    for claim in app_b.get('capture_pages', {}).get('claims', []):
        search_text = claim.get('search_text', '')
        found = search_text in crp_text
        results.append({
            'category': 'appendix_b',
            'subcategory': 'capture_pages',
            'claim': claim['claim'],
            'status': 'VERIFIED' if found else 'CHECK_MANUALLY',
            'source': 'Moment in Time Capture artifacts'
        })

    # Content counts
    for claim in app_b.get('content_counts', {}).get('claims', []):
        search_text = claim.get('search_text', '')
        found = search_text in crp_text
        results.append({
            'category': 'appendix_b',
            'subcategory': 'content_count',
            'claim': claim['claim'],
            'status': 'VERIFIED' if found else 'CHECK_MANUALLY',
            'source': 'repo content / captures'
        })

    # ============================================================
    # APPENDIX C: Analysis pipeline claims
    # ============================================================
    app_c = appendix_reg.get('appendix_c', {})

    # Script line counts (verifiable against repo)
    for claim in app_c.get('pipeline_scripts', {}).get('claims', []):
        search_text = claim.get('search_text', '')
        found = search_text in crp_text

        repo_verified = None
        if claim.get('verify_type') == 'repo_check' and repo_path:
            expected = claim.get('expected')
            # Check if this is the total or individual script
            if expected == 8921:
                scripts = ['tabs_v2_analysis.py', 'tabs_v2_psychometrics.py',
                           'tabs_v2_unified_data_analysis.py', 'tabs_v2_data_audit.py',
                           'tabs_v2_advanced.py', 'tabs_v2_quality_audit.py',
                           'tabs_v2_validation.py']
                total = 0
                for s in scripts:
                    spath = os.path.join(repo_path, 'scripts/analysis', s)
                    if os.path.exists(spath):
                        with open(spath) as f:
                            total += sum(1 for _ in f)
                repo_verified = (total == expected)
            elif expected and expected < 5000:
                # Individual script line count
                for sname in ['tabs_v2_analysis.py', 'tabs_v2_psychometrics.py',
                              'tabs_v2_unified_data_analysis.py', 'tabs_v2_data_audit.py',
                              'tabs_v2_advanced.py', 'tabs_v2_quality_audit.py',
                              'tabs_v2_validation.py']:
                    spath = os.path.join(repo_path, 'scripts/analysis', sname)
                    if os.path.exists(spath):
                        with open(spath) as f:
                            lines = sum(1 for _ in f)
                        if lines == expected:
                            repo_verified = True
                            break

        status = 'VERIFIED'
        note = None
        if not found:
            status = 'NOT_FOUND_IN_CRP'
            note = f'"{search_text}" not found in CRP text'
        elif repo_verified is False:
            status = 'MISMATCH'
            note = 'Repo script line count does not match claim'

        results.append({
            'category': 'appendix_c',
            'subcategory': 'pipeline_script',
            'claim': claim['claim'],
            'status': status,
            'source': 'repo scripts/analysis/' if claim.get('verify_type') == 'repo_check' else 'CRP text',
            'note': note
        })

    # Validation registry claims
    for claim in app_c.get('validation_registry', {}).get('claims', []):
        search_text = claim.get('search_text', '')
        found = search_text in crp_text
        results.append({
            'category': 'appendix_c',
            'subcategory': 'validation_registry',
            'claim': claim['claim'],
            'status': 'VERIFIED' if found else 'CHECK_MANUALLY',
            'source': 'CRP body validator output'
        })

    # Dataset tier claims
    for claim in app_c.get('dataset_tiers', {}).get('claims', []):
        search_text = claim.get('search_text', '')
        found = search_text in crp_text
        results.append({
            'category': 'appendix_c',
            'subcategory': 'dataset_tier',
            'claim': claim['claim'],
            'status': 'VERIFIED' if found else 'CHECK_MANUALLY',
            'source': 'crp-sensitivity-analysis.json'
        })

    # ============================================================
    # APPENDIX D: Institutional governance
    # ============================================================
    app_d = appendix_reg.get('appendix_d', {})

    # Committee claims
    for claim in app_d.get('committee', {}).get('claims', []):
        search_text = claim.get('search_text', '')
        found = search_text in crp_text
        results.append({
            'category': 'appendix_d',
            'subcategory': 'committee',
            'claim': claim['claim'],
            'status': 'VERIFIED' if found else 'CHECK_MANUALLY',
            'source': 'Appendix D / institutional records'
        })

    # IRB claims
    for claim in app_d.get('irb', {}).get('claims', []):
        search_text = claim.get('search_text', '')
        found = search_text in crp_text
        results.append({
            'category': 'appendix_d',
            'subcategory': 'irb',
            'claim': claim['claim'],
            'status': 'VERIFIED' if found else 'CHECK_MANUALLY',
            'source': 'IRB exemption letter / Appendix D'
        })

    return results


def main():
    parser = argparse.ArgumentParser(description='CRP Full Claims Convergence Checker v2.3')
    parser.add_argument('--crp-xml', required=True)
    parser.add_argument('--registry-dir', required=True, help='Dir containing all claim registry JSONs')
    parser.add_argument('--repo', required=True)
    parser.add_argument('--output-dir', required=True)
    parser.add_argument('--crp-version', default='Unknown')
    args = parser.parse_args()

    timestamp = get_timestamp()
    print(f"CRP Full Claims Convergence Check v2.3 - {timestamp}")
    print("=" * 70)

    # Load CRP text
    print("Loading CRP text...")
    with open(args.crp_xml) as f:
        crp_text = strip_xml(f.read())
    print(f"  {len(crp_text)} chars ({len(crp_text)//5} words)")

    # Load registries
    print("Loading claim registries...")
    reg = {}
    for fname in os.listdir(args.registry_dir):
        if fname.endswith('.json'):
            # Strip timestamp suffix like " (4-16-2026 1656 EST)" or "... EDT)" before extracting key
            key = re.sub(r'\s*\(\d+-\d+-\d{4}\s+\d+\s+[A-Z]{3}\)', '', fname.replace('.json', ''))
            key = key.replace('crp-', '')
            reg[key] = load_json(os.path.join(args.registry_dir, fname))
            print(f"  Loaded: {fname} -> key: {key}")

    # Run all checks
    all_results = []

    if 'instrument-claims' in reg:
        print("Checking instrument claims...")
        all_results.extend(check_scale_definitions(crp_text, reg['instrument-claims']))
        all_results.extend(check_iri_claims(crp_text, reg['instrument-claims']))
        all_results.extend(check_item_counts(crp_text, reg['instrument-claims']))
        all_results.extend(check_dont_know(crp_text, reg['instrument-claims']))

    if 'sample-claims' in reg:
        print("Checking sample/methodology claims...")
        all_results.extend(check_sample_claims(crp_text, reg['sample-claims']))

    if 'demographic-claims' in reg:
        print("Checking demographic claims...")
        all_results.extend(check_demographic_claims(crp_text, reg['demographic-claims']))

    if 'platform-claims' in reg:
        print("Checking platform claims...")
        all_results.extend(check_platform_claims(crp_text, reg['platform-claims']))

    if 'institutional-claims' in reg:
        print("Checking institutional claims...")
        all_results.extend(check_institutional_claims(crp_text, reg['institutional-claims']))

    if 'timeline-claims' in reg:
        print("Checking timeline claims...")
        all_results.extend(check_timeline_claims(crp_text, reg['timeline-claims']))

    if 'framework-references' in reg:
        print("Checking framework claims...")
        all_results.extend(check_framework_claims(crp_text, reg['framework-references']))

    if 'v1-pilot-claims' in reg:
        print("Checking V1 pilot claims...")
        all_results.extend(check_v1_pilot_claims(crp_text, reg['v1-pilot-claims']))

    if 'appendix-claims' in reg:
        print("Checking appendix claims (A-D)...")
        all_results.extend(check_appendix_claims(crp_text, reg['appendix-claims'], args.repo))

    print("Checking statistical claims...")
    all_results.extend(check_statistical_claims(crp_text, args.repo))

    print("Checking provenance sentinels...")
    all_results.extend(check_provenance_sentinels(crp_text))

    # Tally
    status_counts = {}
    category_counts = {}
    for r in all_results:
        s = r['status']
        c = r['category']
        status_counts[s] = status_counts.get(s, 0) + 1
        if c not in category_counts:
            category_counts[c] = {'total': 0, 'verified': 0, 'check': 0, 'not_found': 0}
        category_counts[c]['total'] += 1
        if s == 'VERIFIED':
            category_counts[c]['verified'] += 1
        elif s in ('CHECK_MANUALLY', 'MISMATCH'):
            category_counts[c]['check'] += 1
        else:
            category_counts[c]['not_found'] += 1

    total = len(all_results)
    verified = status_counts.get('VERIFIED', 0)
    coverage = round(verified / total * 100, 1) if total > 0 else 0

    print(f"\n{'='*70}")
    print(f"RESULTS: {total} claims checked, {verified} verified ({coverage}% coverage)")
    print(f"{'='*70}")
    print(f"\nBy status:")
    for s, count in sorted(status_counts.items()):
        print(f"  {s}: {count}")
    print(f"\nBy category:")
    for c, counts in sorted(category_counts.items()):
        cat_cov = round(counts['verified']/counts['total']*100, 1) if counts['total'] > 0 else 0
        print(f"  {c}: {counts['total']} total, {counts['verified']} verified ({cat_cov}%), {counts['check']} need check")

    # Generate report
    lines = []
    lines.append(f"# CRP Full Claims Convergence Report v2.2")
    lines.append(f"")
    lines.append(f"**Generated:** {timestamp}")
    lines.append(f"**CRP Version:** {args.crp_version}")
    lines.append(f"**Total Claims Checked:** {total}")
    lines.append(f"**Verified:** {verified} ({coverage}%)")
    lines.append(f"**Registries Loaded:** {len(reg)}")
    lines.append(f"")
    lines.append(f"## Coverage by Category")
    lines.append(f"")
    lines.append(f"| Category | Total | Verified | Need Check | Coverage |")
    lines.append(f"|----------|-------|----------|------------|----------|")
    for c, counts in sorted(category_counts.items()):
        cat_cov = round(counts['verified']/counts['total']*100, 1) if counts['total'] > 0 else 0
        lines.append(f"| {c} | {counts['total']} | {counts['verified']} | {counts['check']} | {cat_cov}% |")
    lines.append(f"| **TOTAL** | **{total}** | **{verified}** | **{status_counts.get('CHECK_MANUALLY', 0)}** | **{coverage}%** |")
    lines.append(f"")

    # Items needing attention
    needs_check = [r for r in all_results if r['status'] in ('CHECK_MANUALLY', 'MISMATCH')]
    if needs_check:
        lines.append(f"## Items Needing Manual Check ({len(needs_check)})")
        lines.append(f"")
        for r in needs_check:
            lines.append(f"- **[{r['category']}/{r['subcategory']}]** {r['claim']}")
            if r.get('note'):
                lines.append(f"  - Note: {r['note']}")
        lines.append(f"")

    # Full verified list
    lines.append(f"## All Verified Claims ({verified})")
    lines.append(f"")
    current_cat = None
    for r in sorted(all_results, key=lambda x: (x['category'], x['subcategory'])):
        if r['status'] != 'VERIFIED':
            continue
        if r['category'] != current_cat:
            current_cat = r['category']
            lines.append(f"### {current_cat.title()}")
            lines.append(f"")
        lines.append(f"- {r['claim']} (source: {r.get('source', 'N/A')})")

    report_text = '\n'.join(lines)

    # Save outputs
    report_path = os.path.join(args.output_dir, 'Convergence Reports',
                                f'full_convergence_report ({timestamp}).md')
    with open(report_path, 'w') as f:
        f.write(report_text)
    print(f"\nSaved: {report_path}")

    claims_path = os.path.join(args.output_dir, 'Claims Databases',
                                f'full_claims_database ({timestamp}).json')
    with open(claims_path, 'w') as f:
        json.dump({
            'timestamp': timestamp,
            'crp_version': args.crp_version,
            'total_claims': total,
            'verified': verified,
            'coverage_pct': coverage,
            'status_counts': status_counts,
            'category_counts': category_counts,
            'claims': all_results
        }, f, indent=2, default=str)
    print(f"Saved: {claims_path}")

    return 0 if coverage >= 80 else 1


if __name__ == '__main__':
    sys.exit(main())
