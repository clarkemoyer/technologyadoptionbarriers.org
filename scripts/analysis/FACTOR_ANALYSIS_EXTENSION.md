# Factor Analysis Extension - Pending Local Push

This branch (`crp/factor-analysis-extension`) is the home for the six extension
analyses described in Issue #1836:

1. Barriers 3-factor canonical CFA (F1a / F1b / F2)
2. Formal CFA model comparison (chi-sq diff + delta-AIC + delta-BIC)
3. Item-level Hair convergent / discriminant tests
4. Joint 3-construct CFA (B + R + M, free latent correlations)
5. HTMT and Fornell-Larcker on barrier subgroups
6. Alpha-if-deleted summary

The two modified scripts (`tabs_v2_validation.py`, `tabs_v2_unified_data_analysis.py`)
are staged in the workspace folder under
`03 Defense Presentation/factor-analysis-extension-PR/`. To complete the PR,
run `PUSH_TO_BRANCH.sh` from the local clone of this repository - it will check
out this branch, copy the modified scripts into `scripts/analysis/`, commit, and push.

Once the script files are pushed, this marker file will be removed in the same PR
or in the merge commit.

## Verification commands (run after the script files are pushed)

```bash
# Frozen CRP-200 (regenerates crp-validation.json with 7 new keys)
python scripts/analysis/tabs_v2_validation.py \
    public/datasets/TABS_V2_CRP_2026_public_dataset.csv \
    --crp200 --json src/data/crp-validation.json

# Live dataset (daily pipeline target; regenerates live-validation.json)
python scripts/analysis/tabs_v2_unified_data_analysis.py
```

## Expected new top-level JSON keys

- `barriers_2f_cfa`
- `barriers_3f_cfa`
- `joint_3construct_cfa`
- `barrier_model_comparison`
- `item_level_validity`
- `subgroup_discriminant_validity`
- `alpha_if_deleted_summary`

## Where each new statistic surfaces on the website (no new URLs)

| Output | CRP page | Live page | Section |
|---|---|---|---|
| `barriers_3f_cfa` | `/results/crp-2026/factor-analysis` | `/results/factor-analysis` | Level 3: 3-Group Decomposition |
| `barrier_model_comparison` | `/results/crp-2026/validation` | `/results/validation` | Section 3: CFA |
| `joint_3construct_cfa` | `/results/crp-2026/validation` | `/results/validation` | Section 3: CFA |
| `item_level_validity` | `/results/crp-2026/validation` | `/results/validation` | Section 6: Item Diagnostics |
| `subgroup_discriminant_validity` | `/results/crp-2026/factor-analysis` | `/results/factor-analysis` | Level 3 (under reliability table) |
| `alpha_if_deleted_summary` | `/results/crp-2026/reliability` | `/results/reliability` | After alpha-by-construct table |

A follow-up PR will edit the corresponding TSX components to surface these
keys on the existing pages.
