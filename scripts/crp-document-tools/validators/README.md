# CRP Validators

Static assertion checks that walk the CRP `.docx` text and verify every quantitative claim reconciles against canonical pipeline output in `src/data/crp-sensitivity-analysis.json` and `src/data/crp-validation.json`.

## Files

### Current

| File                       | Purpose                                                                  | Coverage                        |
| -------------------------- | ------------------------------------------------------------------------ | ------------------------------- |
| `validate_crp_stats_v5.py` | Comprehensive statistics validator for the merged CRP body+appendix docx | 277 checks across 42 categories |
| `validate_appendixes.py`   | Structural checks against the 4 appendix markdown files (A, B, C, D)     | Appendix internal consistency   |

### Archive

| File                                   | Date          | Notes                                            |
| -------------------------------------- | ------------- | ------------------------------------------------ |
| `archive/validate_crp_stats_v1.py`     | 2026-04-02    | Initial release, ~93 checks across 14 categories |
| `archive/validate_crp_stats_v2.py`     | 2026-04-11    | Expanded to ~150 checks                          |
| `archive/validate_crp_stats_merged.py` | 2026-04-11    | One-off merge variant of v2                      |
| `archive/validate_crp_stats_v3.py`     | 2026-04-16 AM | ~200 checks, 20 categories                       |
| `archive/validate_crp_stats_v4.py`     | 2026-04-16 PM | ~230 checks, 30 categories                       |

## v5 category coverage (42 total)

The v5 run on the 2026-04-17 00:04 EST merged CRP produced 277 checks: 209 PASS, 68 INFO, 0 WARN, 0 FAIL.

Categories new in v5 (31-42):

- **31**: Top-3 pick counts - every top-10 picked barrier's N and % must appear in the document with the correct label
- **32**: Pick-vs-mean rank divergence - verifies B1 delta=-2 and B13 delta=+2 position-3 swap
- **33**: Item-level barrier means/SDs - all 18 barrier items vs `item_descriptives.barriers`
- **34**: Item-level readiness means/SDs - all 17 substantive readiness items
- **35**: Item-level maturity means/SDs - all 8 substantive maturity items
- **36**: Construct-level SDs - grand-sample SDs for all 3 constructs
- **37**: ANOVA by decision authority - F, df1, df2, p for all three constructs
- **38**: Demographic crosstab completeness - every demographic value in `demographics_detailed` must appear
- **39**: Disposition waterfall - starts, consents, finished, IRI pass, final N
- **40**: Sensitivity tier alpha consistency - alphas must not drift across tiers beyond tolerance
- **41**: Construct correlation matrix - all 3 off-diagonal Pearson correlations plus r-squared
- **42**: Top-3 methodology citation - Q29-46 forced-choice task must be described in prose

## Running

```bash
# From this repo's root:
python scripts/crp-document-tools/validators/validate_crp_stats_v5.py

# Workspace discovery is handled by scripts/crp-document-tools/paths.py.
# Precedence (highest to lowest):
#   1. --workspace <path>  or  --docx <path>  (explicit CLI flags always win)
#   2. CRP_WORKSPACE environment variable
#   3. ~/Documents/CRP-workspace  or  ~/CRP-workspace  (common user locations)
#   4. scripts/crp-document-tools/fixtures/example_workspace  (CI / quickstart)
#   5. /sessions/*/mnt/... legacy glob  (original author's session environment)
# If none of these resolve, the script exits with a clear error pointing at the
# Quickstart README rather than failing deep inside discovery logic.
```

Exit codes: 0 if no FAIL, non-zero if any check FAILs. WARNs do not fail the run. INFO-level checks are reference numbers surfaced for reviewer awareness.
