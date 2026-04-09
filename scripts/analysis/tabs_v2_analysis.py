import csv
import json
import math
from collections import defaultdict, Counter
from statistics import mean, stdev, median
from scipy import stats
from itertools import combinations

V2_START_DATE = '2026-03-23 14:00:00'
V2_DURATION_MINUTES = 6
V2_EXPLICIT_INCLUSION = 'R_1QK12IJpHjC3wd6'

BARRIER_SCALE = {
    'Not a Barrier': 1,
    'Minor Barrier': 2,
    'Moderate Barrier': 3,
    'Significant Barrier': 4,
    'Major Barrier': 5
}

READINESS_SCALE = {
    'Very Low Readiness/Capability': 1,
    'Low Readiness/Capability': 2,
    'Moderate Readiness/Capability': 3,
    'High Readiness/Capability': 4,
    'Very High Readiness/Capability': 5
}

MATURITY_SCALE = {
    'Level 1: Initial/Ad Hoc': 1,
    'Level 2: Developing/Repeatable': 2,
    'Level 3: Defined/Standardized': 3,
    'Level 4: Managed/Quantitatively Managed': 4,
    'Level 5: Optimizing/Innovating': 5
}

IRI_ANSWERS = {
    'barriers': 'Major Barrier',
    'readiness': 'Low Readiness/Capability',
    'maturity': 'Level 2: Developing/Repeatable'
}

OTHER_ROLE_CLASSIFICATIONS = {
    # C-Suite Adjacent
    'Chief Data Officer': 'C-Suite Adjacent',
    'Chief Privacy Officer': 'C-Suite Adjacent',
    'Chief Marketing Officer': 'C-Suite Adjacent',
    'CDO': 'C-Suite Adjacent',
    'CPO': 'C-Suite Adjacent',
    'CAO': 'C-Suite Adjacent',
    'CLO': 'C-Suite Adjacent',
    'Chief Analytics Officer': 'C-Suite Adjacent',
    'Chief Security Officer': 'C-Suite Adjacent',
    'Chief Strategy Officer': 'C-Suite Adjacent',
    'Chief Product Officer': 'C-Suite Adjacent',
    # VP / SVP
    'Vice President': 'VP / SVP',
    'VP': 'VP / SVP',
    'SVP': 'VP / SVP',
    'EVP': 'VP / SVP',
    'AVP': 'VP / SVP',
    'Senior Vice President': 'VP / SVP',
    'Executive Vice President': 'VP / SVP',
    # Director
    'Director': 'Director',
    'Senior Director': 'Director',
    'Group Director': 'Director',
    'Managing Director': 'Director',
    # Manager / Program Lead
    'Manager': 'Manager / Program Lead',
    'Program Lead': 'Manager / Program Lead',
    'Program Manager': 'Manager / Program Lead',
    'Team Lead': 'Manager / Program Lead',
    'Supervisor': 'Manager / Program Lead',
    # Owner / Founder / President
    'Owner': 'Owner / Founder / President',
    'Founder': 'Owner / Founder / President',
    'President': 'Owner / Founder / President',
    'Partner': 'Owner / Founder / President',
    'Principal': 'Owner / Founder / President',
    # Technical Specialist
    'Engineer': 'Technical Specialist',
    'Architect': 'Technical Specialist',
    'Analyst': 'Technical Specialist',
    'Administrator': 'Technical Specialist',
    'Specialist': 'Technical Specialist'
}

ROLE_MAP = {
    'CIO (e.g., Director of IT)': 'CIO',
    'CTO (e.g., VP of Engineering)': 'CTO',
    'CEO (e.g., President)': 'CEO',
    'CFO (e.g., VP of Finance)': 'CFO',
    'COO (e.g., VP of Operations)': 'COO',
    'CHRO (e.g., VP of Human Resources)': 'CHRO',
    'CMO (e.g., VP of Marketing)': 'CMO',
    'CSO (e.g., VP of Sales)': 'CSO',
    'CRO (e.g., VP of Revenue)': 'CRO'
}

BARRIER_ITEMS = [
    'Cost/Financial Resources',
    'Organizational Culture',
    'Leadership Buy-In',
    'Legacy Systems/Integration',
    'Skills/Training',
    'Change Management',
    'Security/Compliance',
    'Technology Maturity',
    'Vendor Lock-In',
    'Return on Investment',
    'Complexity',
    'Regulatory/Legal',
    'Cybersecurity Threats',
    'Data Privacy Concerns',
    'Business Model Disruption',
    'Unclear Business Case',
    'Resistance to Change',
    'Infrastructure Limitations',
    'Attention Check'
]

READINESS_ITEMS = [
    'Financial Readiness',
    'Technical Infrastructure',
    'Organizational Skills',
    'Change Management Capability',
    'Leadership Alignment',
    'Strategic Vision',
    'Process Standardization',
    'Data Governance',
    'Risk Management',
    'Project Management',
    'Innovation Culture',
    'Vendor Management',
    'Customer Readiness',
    'Regulatory Compliance',
    'Technology Governance',
    'Performance Metrics',
    'Workforce Engagement',
    'Attention Check'
]

MATURITY_ITEMS = [
    'IT Investment & Value Mgmt',
    'IT-Enabled Innovation',
    'Process Mgmt & Standardization',
    'Data Governance & Analytics',
    'Tech Risk & Resilience',
    'Strategic IT Planning',
    'Workforce Capability',
    'Change Leadership',
    'Attention Check'
]

def mean_sd(values):
    if not values:
        return None, None
    m = mean(values)
    if len(values) == 1:
        return m, 0
    s = stdev(values)
    return m, s

def mean_ci(values, confidence=0.95):
    if not values:
        return None, None, None
    n = len(values)
    m = mean(values)
    if n == 1:
        return m, m, m
    s = stdev(values)
    t_crit = stats.t.ppf((1 + confidence) / 2, n - 1)
    se = s / math.sqrt(n)
    ci_lower = m - t_crit * se
    ci_upper = m + t_crit * se
    return m, ci_lower, ci_upper

def pearson_r(x, y):
    if len(x) < 2 or len(y) < 2:
        return None
    try:
        r, p = stats.pearsonr(x, y)
        return r, p
    except:
        return None, None

def cohens_d(group1, group2, bootstrap_ci=True):
    n1, n2 = len(group1), len(group2)
    if n1 < 1 or n2 < 1:
        return None, None, None
    
    m1, m2 = mean(group1), mean(group2)
    
    if n1 == 1 and n2 == 1:
        return 0, 0, 0
    
    if n1 == 1:
        var2 = sum((x - m2) ** 2 for x in group2) / (n2 - 1)
        pooled_sd = math.sqrt(var2)
    elif n2 == 1:
        var1 = sum((x - m1) ** 2 for x in group1) / (n1 - 1)
        pooled_sd = math.sqrt(var1)
    else:
        var1 = sum((x - m1) ** 2 for x in group1) / (n1 - 1)
        var2 = sum((x - m2) ** 2 for x in group2) / (n2 - 1)
        pooled_sd = math.sqrt(((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2))
    
    if pooled_sd == 0:
        return 0, 0, 0
    
    d = (m1 - m2) / pooled_sd
    
    if not bootstrap_ci:
        return d, None, None
    
    import numpy as np
    d_boots = []
    for _ in range(2000):
        boot_g1 = np.random.choice(group1, size=n1, replace=True)
        boot_g2 = np.random.choice(group2, size=n2, replace=True)
        m1_boot = float(np.mean(boot_g1))
        m2_boot = float(np.mean(boot_g2))
        var1_boot = float(np.var(boot_g1, ddof=1)) if n1 > 1 else 0
        var2_boot = float(np.var(boot_g2, ddof=1)) if n2 > 1 else 0
        pooled_sd_boot = math.sqrt(((n1 - 1) * var1_boot + (n2 - 1) * var2_boot) / (n1 + n2 - 2)) if (var1_boot + var2_boot) > 0 else 1
        d_boots.append((m1_boot - m2_boot) / pooled_sd_boot)
    
    ci_lower = sorted(d_boots)[int(0.025 * len(d_boots))]
    ci_upper = sorted(d_boots)[int(0.975 * len(d_boots))]
    
    return d, ci_lower, ci_upper

def cronbach_alpha(item_scores):
    if not item_scores or len(item_scores[0]) < 2:
        return None
    n_items = len(item_scores[0])
    n_respondents = len(item_scores)
    
    total_var = sum(sum((score - mean(col)) ** 2 for score in col) / n_respondents for col in zip(*item_scores)) / n_items
    
    item_vars = []
    for col in zip(*item_scores):
        if len(col) == 1:
            item_vars.append(0)
        else:
            item_vars.append(sum((score - mean(col)) ** 2 for score in col) / (n_respondents - 1))
    
    sum_item_vars = sum(item_vars)
    
    if total_var == 0:
        return None
    
    alpha = (n_items / (n_items - 1)) * (1 - sum_item_vars / total_var)
    return alpha

def score(response_text, scale):
    for label, value in scale.items():
        if response_text and response_text.strip() == label:
            return value
    if response_text and response_text.strip().lower() == "don't know":
        return None
    return None

def person_means(row, construct_type):
    if construct_type == 'barriers':
        cols = [f'Q10-28_Barriers_{i}' for i in range(1, 19)]
    elif construct_type == 'readiness':
        cols = [f'Q47-64_Readiness_{i}' for i in range(1, 18)]
    elif construct_type == 'maturity':
        cols = [f'Q65-73_Maturity_{i}' for i in range(1, 8)]
    else:
        return None
    
    values = []
    scale = BARRIER_SCALE if construct_type == 'barriers' else (READINESS_SCALE if construct_type == 'readiness' else MATURITY_SCALE)
    
    for col in cols:
        if col in row:
            val = score(row[col], scale)
            if val is not None:
                values.append(val)
    
    return mean(values) if values else None

def iri_correct_count(row):
    count = 0
    if score(row.get('Q10-28_Barriers_19', ''), BARRIER_SCALE) == 5:
        count += 1
    if score(row.get('Q47-64_Readiness_18', ''), READINESS_SCALE) == 2:
        count += 1
    if score(row.get('Q65-73_Maturity_9', ''), MATURITY_SCALE) == 2:
        count += 1
    return count

def org_bucket(org_size_str):
    if org_size_str in ['<100', '100-499']:
        return 'Small (<500)'
    elif org_size_str in ['500-999', '1000-4999']:
        return 'Medium (500-4999)'
    elif org_size_str in ['5000-9999', '10000+']:
        return 'Large (5000+)'
    return None

def categorize_other_role(role_str):
    if not role_str or not role_str.strip():
        return 'Uncategorized'
    
    role_lower = role_str.lower()
    
    for keyword, category in OTHER_ROLE_CLASSIFICATIONS.items():
        if keyword.lower() in role_lower or role_lower in keyword.lower():
            return category
    
    return 'Uncategorized'

def print_disposition(data):
    total = len(data)
    v2_count = 0
    iri_correct = [0, 0, 0, 0]
    duration_ok = [0, 0, 0, 0]
    
    for row in data:
        if row.get('StartDate', '') >= V2_START_DATE or row.get('ResponseId') == V2_EXPLICIT_INCLUSION:
            v2_count += 1
            duration_secs = int(row.get('Duration (in seconds)', row.get('Duration', 0)) or 0)
            iri_count = iri_correct_count(row)
            
            if duration_secs >= 480:
                duration_ok[0] += 1
            if iri_count == 3:
                iri_correct[0] += 1
            if duration_secs >= 480 and iri_count == 3:
                iri_correct[1] += 1
    
    print(f'Total responses: {total}')
    print(f'V2 responses: {v2_count}')
    print(f'Responses with duration >= 480s: {duration_ok[0]}')
    print(f'Responses with all 3 IRIs correct: {iri_correct[0]}')
    print(f'Conservative Clean (duration + all IRIs): {iri_correct[1]}')

def print_demographics(data, sample_filter=None):
    filtered = []
    for row in data:
        if sample_filter is None or sample_filter(row):
            filtered.append(row)
    
    roles = Counter()
    org_sizes = Counter()
    
    for row in filtered:
        role = row.get('Q1_Role', 'Unknown')
        if role in ROLE_MAP:
            roles[ROLE_MAP[role]] += 1
        else:
            roles['Other'] += 1
        
        org_size = row.get('Q4_OrgSize', 'Unknown')
        org_sizes[org_size] += 1
    
    print(f'N = {len(filtered)}')
    print('Roles:', dict(roles.most_common()))
    print('Organization Sizes:', dict(org_sizes.most_common()))

def print_item_rankings(data, construct_type, sample_filter=None):
    filtered = []
    for row in data:
        if sample_filter is None or sample_filter(row):
            filtered.append(row)
    
    if construct_type == 'barriers':
        cols = [f'Q10-28_Barriers_{i}' for i in range(1, 19)]
        scale = BARRIER_SCALE
        items = BARRIER_ITEMS
    elif construct_type == 'readiness':
        cols = [f'Q47-64_Readiness_{i}' for i in range(1, 18)]
        scale = READINESS_SCALE
        items = READINESS_ITEMS
    else:
        cols = [f'Q65-73_Maturity_{i}' for i in range(1, 8)]
        scale = MATURITY_SCALE
        items = MATURITY_ITEMS
    
    item_means = []
    for i, col in enumerate(cols):
        values = []
        for row in filtered:
            val = score(row.get(col, ''), scale)
            if val is not None:
                values.append(val)
        
        if values:
            m = mean(values)
            item_means.append((items[i] if i < len(items) else f'Item {i+1}', m))
    
    item_means.sort(key=lambda x: x[1], reverse=True)
    
    print(f'Top 10 {construct_type.capitalize()} Items:')
    for item, m in item_means[:10]:
        print(f'  {item}: {m:.2f}')

def print_correlations_and_reliability(data, sample_filter=None):
    filtered = []
    for row in data:
        if sample_filter is None or sample_filter(row):
            filtered.append(row)
    
    barrier_vals = []
    readiness_vals = []
    maturity_vals = []
    
    for row in filtered:
        b = person_means(row, 'barriers')
        r = person_means(row, 'readiness')
        m = person_means(row, 'maturity')
        
        if b is not None and r is not None and m is not None:
            barrier_vals.append(b)
            readiness_vals.append(r)
            maturity_vals.append(m)
    
    r_br, p_br = pearson_r(barrier_vals, readiness_vals)
    r_bm, p_bm = pearson_r(barrier_vals, maturity_vals)
    r_rm, p_rm = pearson_r(readiness_vals, maturity_vals)
    
    print(f'Construct Correlations (N={len(barrier_vals)})')
    print(f'  Barriers-Readiness: r={r_br:.3f}, p={p_br:.4f}')
    print(f'  Barriers-Maturity: r={r_bm:.3f}, p={p_bm:.4f}')
    print(f'  Readiness-Maturity: r={r_rm:.3f}, p={p_rm:.4f}')

def sensitivity_to_json(data):
    result = {
        'samples': {
            'conservative_clean': {'n': 0},
            'flexible_clean': {'n': 0},
            'prolific_accepted': {'n': 0},
            'v2_finished': {'n': 0},
            'v2_all': {'n': 0}
        },
        'sample_details': {}
    }
    
    return json.dumps(result, indent=2)

if __name__ == '__main__':
    with open('data.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        data = list(reader)
    
    print_disposition(data)
