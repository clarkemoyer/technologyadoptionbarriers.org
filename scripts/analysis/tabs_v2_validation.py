import csv
import json
import math
import numpy as np
from scipy import stats
from scipy.stats import shapiro, skew, kurtosis
from sklearn.decomposition import FactorAnalysis
from sklearn.preprocessing import StandardScaler
from itertools import combinations

V2_START_DATE = '2026-03-23 14:00:00'
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

def score(response_text, scale):
    for label, value in scale.items():
        if response_text and response_text.strip() == label:
            return value
    if response_text and response_text.strip().lower() == "don't know":
        return None
    return None

def iri_correct_count(row):
    count = 0
    if score(row.get('Q10-28_Barriers_19', ''), BARRIER_SCALE) == 5:
        count += 1
    if score(row.get('Q47-64_Readiness_18', ''), READINESS_SCALE) == 2:
        count += 1
    if score(row.get('Q65-73_Maturity_9', ''), MATURITY_SCALE) == 2:
        count += 1
    return count

def load_and_filter(csv_path, duration_threshold=480, iri_correct_all=True):
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        data = list(reader)
    
    filtered = []
    seen_ids = set()
    
    for row in data:
        response_id = row.get('ResponseId', '')
        
        if response_id in seen_ids:
            continue
        seen_ids.add(response_id)
        
        start_date = row.get('StartDate', '')
        if start_date < V2_START_DATE and response_id != V2_EXPLICIT_INCLUSION:
            continue
        
        duration = int(row.get('Duration', 0))
        if duration < duration_threshold:
            continue
        
        if iri_correct_all:
            if iri_correct_count(row) != 3:
                continue
        
        filtered.append(row)
    
    return filtered

def cronbach_alpha(item_matrix):
    n_items = len(item_matrix[0])
    n_respondents = len(item_matrix)
    
    if n_items < 2:
        return None
    
    total_var = np.var(np.sum(item_matrix, axis=1), ddof=1)
    item_vars = np.var(item_matrix, axis=0, ddof=1)
    sum_item_vars = np.sum(item_vars)
    
    alpha = (n_items / (n_items - 1)) * (1 - sum_item_vars / total_var)
    return alpha

def corrected_item_total_correlations(item_matrix, threshold=0.30):
    n_items = len(item_matrix[0])
    total_scores = np.sum(item_matrix, axis=1)
    
    correlations = {}
    flagged = []
    
    for i in range(n_items):
        item_scores = item_matrix[:, i]
        total_without_item = total_scores - item_scores
        
        corr = np.corrcoef(item_scores, total_without_item)[0, 1]
        correlations[f'item_{i+1}'] = corr
        
        if corr < threshold:
            flagged.append((f'item_{i+1}', corr))
    
    return correlations, flagged

def composite_reliability_and_ave(loadings):
    loadings = np.array(loadings)
    
    sum_loadings = np.sum(loadings)
    sum_sq_loadings = np.sum(loadings ** 2)
    
    sum_error_var = len(loadings) - sum_sq_loadings
    
    cr = (sum_loadings ** 2) / ((sum_loadings ** 2) + sum_error_var)
    ave = sum_sq_loadings / len(loadings)
    
    return cr, ave

def kmo_test(correlation_matrix):
    X = np.array(correlation_matrix)
    n = X.shape[0]
    
    partial_corr = np.linalg.inv(X)
    
    numerator = np.sum(X[np.triu_indices_from(X, k=1)] ** 2)
    denominator = np.sum(X[np.triu_indices_from(X, k=1)] ** 2) + np.sum((1 / np.diag(partial_corr) - 1) ** 2)
    
    kmo = numerator / denominator
    return kmo

def htmt_with_ci(construct1_items, construct2_items, n_bootstrap=2000):
    corr_within_c1 = np.mean([np.corrcoef(construct1_items[:, i], construct1_items[:, j])[0, 1] 
                               for i, j in combinations(range(len(construct1_items[0])), 2)])
    corr_within_c2 = np.mean([np.corrcoef(construct2_items[:, i], construct2_items[:, j])[0, 1] 
                               for i, j in combinations(range(len(construct2_items[0])), 2)])
    
    corr_between = np.mean([np.corrcoef(construct1_items[:, i], construct2_items[:, j])[0, 1] 
                            for i in range(len(construct1_items[0])) 
                            for j in range(len(construct2_items[0]))])
    
    if corr_within_c1 == 0 or corr_within_c2 == 0:
        return None, None, None
    
    htmt = corr_between / math.sqrt(corr_within_c1 * corr_within_c2)
    
    htmt_boots = []
    n = len(construct1_items)
    
    for _ in range(n_bootstrap):
        idx = np.random.choice(n, size=n, replace=True)
        c1_boot = construct1_items[idx]
        c2_boot = construct2_items[idx]
        
        cw1 = np.mean([np.corrcoef(c1_boot[:, i], c1_boot[:, j])[0, 1] 
                       for i, j in combinations(range(len(c1_boot[0])), 2)])
        cw2 = np.mean([np.corrcoef(c2_boot[:, i], c2_boot[:, j])[0, 1] 
                       for i, j in combinations(range(len(c2_boot[0])), 2)])
        cb = np.mean([np.corrcoef(c1_boot[:, i], c2_boot[:, j])[0, 1] 
                      for i in range(len(c1_boot[0])) 
                      for j in range(len(c2_boot[0]))])
        
        if cw1 > 0 and cw2 > 0:
            htmt_boots.append(cb / math.sqrt(cw1 * cw2))
    
    ci_lower = np.percentile(htmt_boots, 2.5)
    ci_upper = np.percentile(htmt_boots, 97.5)
    
    return htmt, ci_lower, ci_upper

def fornell_larcker(construct_means, construct_sds, correlations):
    results = {}
    n_constructs = len(construct_means)
    
    for i in range(n_constructs):
        for j in range(i + 1, n_constructs):
            r = correlations[i][j]
            r_sq = r ** 2
            results[f'construct_{i}_vs_{j}'] = {
                'r': r,
                'r_squared': r_sq
            }
    
    return results

def load_crp200(csv_path):
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        data = list(reader)
    
    crp_ids = set()
    filtered = load_and_filter(csv_path, duration_threshold=480, iri_correct_all=True)
    
    return filtered[:200] if len(filtered) >= 200 else filtered

if __name__ == '__main__':
    data = load_and_filter('data.csv', duration_threshold=480, iri_correct_all=True)
    print(f'Loaded {len(data)} valid responses')
