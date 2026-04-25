# TABS V2 Reproducible Analysis Scripts

## Overview

These scripts reproduce all statistical analyses reported in the Technology Adoption Barriers Survey (TABS) Culminating Research Project (CRP). They are designed to be run against the TABS V2 dataset available at [ScholarSphere](https://scholarsphere.psu.edu/resources/cc6df3e4-17d3-4594-86f6-48a433cde962) or other comparable Qualtrics CSV exports.

This reproducibility pipeline ensures transparency and enables independent verification of every statistic reported in the CRP (Chapters I-IV), the defense presentation, and the Comprehensive Analysis Report (Appendix M).

## Project Context

- **Student**: Clarke Moyer, Penn State Smeal DBA candidate
- **Project**: Technology Adoption Barriers Survey (TABS): Culminating Research Project
- **Defense**: May 7, 2026
- **Repository**: [github.com/clarkemoyer/technologyadoptionbarriers.org](https://github.com/clarkemoyer/technologyadoptionbarriers.org)
- **Data**: Publicly available at [ScholarSphere](https://scholarsphere.psu.edu/resources/cc6df3e4-17d3-4594-86f6-48a433cde962)

## Requirements

### Python Version

- Python 3.9 or later

### Dependencies

All required packages are listed in `requirements.txt` with pinned versions for exact reproducibility:

```bash
pip install -r requirements.txt
```

Key packages:

- **pandas** 2.3.3: Data manipulation and CSV handling
- **numpy** 2.2.6: Numerical computations
- **scipy** 1.15.3: Statistical functions and significance tests
- **scikit-learn** 1.7.2: Factor analysis, PCA, and clustering
- **statsmodels** 0.14.6: Advanced regression and statistical models
- **matplotlib** 3.10.8: Data visualization (optional for scripts; used in Jupyter notebooks)
- **seaborn** 0.13.2: Enhanced statistical visualizations

## AI Agent Coordination

This repository utilizes a multi-agent setup where different AI coding assistants are responsible for different sets of scripts and capabilities based on their strengths.

- **GitHub Copilot**: Handles backend automation, data pipeline scripts, CI/CD workflows, and code review across Python and TypeScript.
- **Google Jules (Gemini Ultra)**: Highly capable for complex data visualization work, creating charting components, and large-scale parallel frontend updates (60 concurrent limit).
- **Claude Code**: Primarily used for orchestrating work, PR management, handling complex Prolific API operations, and advanced analysis tasks.

When generating or refactoring scripts in this directory, tasks are typically routed according to this agent delegation model.

## Scripts Overview

| Script                       | Purpose                                                  | Input          | Output                    |
| ---------------------------- | -------------------------------------------------------- | -------------- | ------------------------- |
| `tabs_v2_analysis.py`        | Descriptive stats, 5-cut sensitivity analysis            | CSV            | Console + JSON (`--json`) |
| `tabs_v2_advanced.py`        | Inferential: PCA, regression, ANOVA, interaction effects | CSV            | Console                   |
| `tabs_v2_psychometrics.py`   | Instrument validation: KMO, HTMT, Cronbach's, Harman's   | CSV            | Console                   |
| `tabs_v2_data_audit.py`      | Disposition waterfall audit (matches TS pipeline)        | CSV            | JSON report               |
| `tabs_v2_quality_audit.py`   | Data quality: outliers, CMV, Mahalanobis distance        | CSV            | Console                   |
| `tabs_api.py`                | Python API clients for Qualtrics export + Prolific data  | APIs           | CSV/JSON                  |
| `enrich_qualtrics_csv.py`    | Merge Prolific auth checks + statuses into Qualtrics CSV | CSV + CSV/JSON | CSV                       |
| `../deidentify_tabs_data.py` | NIST 5-step de-identification for ScholarSphere          | CSV            | Public CSV + audit files  |

## Script Details

### 1. tabs_v2_analysis.py

**Primary Analysis Script**

Computes all descriptive and inferential statistics reported in the CRP Results (Chapters III-IV).

**Key outputs**:

- Construct-level descriptive statistics (means, standard deviations, medians, distributions)
- Item-level rankings and descriptive statistics within each construct
- Demographic cross-tabulations (organization size, profit model, industry, role, decision authority, geographic scope, revenue, budget)
- Correlation matrices with 95% confidence intervals
- Independent samples t-tests with effect sizes (Cohen's d)
- ANOVA tests by decision authority with post-hoc comparisons
- Sensitivity analysis comparing statistics across all 5 sample definitions
- Open-ended feedback summary from Q74_Feedback

**Sample definitions** (most to least restrictive):

| Sample                 | Key                  | Criteria                                                                                                                                         |
| ---------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Conservative Clean** | `conservative_clean` | Prolific APPROVED + ALL quality checks (IRI, duration ≥ 540s, reCAPTCHA ≥ 0.5, no straightlining, no partial straightlining, Prolific auth pass) |
| **Flexible Clean**     | `flexible_clean`     | Prolific APPROVED + basic quality (all 3 IRIs correct + duration ≥ 480s). Includes manually-reviewed FLAG responses that passed human review     |
| **Prolific Accepted**  | `prolific_accepted`  | ALL deduplicated V2 responses with Prolific status APPROVED (must match Prolific UI exactly)                                                     |
| **All V2 Finished**    | `v2_finished`        | Finished + duration ≥ 120s (extreme speeders excluded)                                                                                           |
| **All V2**             | `v2_all`             | All V2 responses including incomplete                                                                                                            |

**Constraints**: Conservative Clean ⊆ Flexible Clean ⊆ Prolific Accepted ⊆ All V2, and All V2 Finished ⊆ All V2

Prolific Accepted is defined by Prolific approval status (all V2 APPROVED responses). All V2 Finished is defined by survey completion plus duration ≥ 120s. These two sets overlap but neither is guaranteed to be a subset of the other - a response can be APPROVED but INCOMPLETE (rare edge case), or FINISHED but not APPROVED. Conservative Clean is the primary analysis sample for the CRP. The sensitivity analysis runs all statistics across all 5 definitions to demonstrate robustness.

**Deduplication**: When a participant retakes the survey, the completed response is preferred over an incomplete retake. Among completed responses, latest wins.

**Usage**:

```bash
# Default: detailed analysis on Conservative Clean, sensitivity across all 5
python tabs_v2_analysis.py /path/to/qualtrics_export.csv

# Export sensitivity analysis as JSON for the website dashboard
python tabs_v2_analysis.py /path/to/csv --json sensitivity-analysis.json

# Run detailed analysis on a different primary sample
python tabs_v2_analysis.py /path/to/csv --primary-sample conservative_clean
python tabs_v2_analysis.py /path/to/csv --primary-sample flexible_clean
python tabs_v2_analysis.py /path/to/csv --primary-sample prolific_accepted
```

### 2. tabs_v2_psychometrics.py

**Validation Script**

Validates 84 statistical claims embedded in the CRP document against computed values from the source CSV. This ensures that all reported statistics are traceable to the data and protects against transcription errors.

**Validation coverage**:

- Construct means and standard deviations
- Correlations between constructs
- Item-level descriptive statistics
- Sample size and disposition figures
- Demographic tables
- Statistical test results (t-tests, ANOVA)
- Reliability coefficients (Cronbach's alpha)
- Validity metrics (AVE, HTMT, factor loadings)

**Output**: Pass/fail summary with detailed mismatch reports for any failed checks.

**Usage**:

```bash
python tabs_v2_psychometrics.py /path/to/qualtrics_export.csv /path/to/crp_document.docx
```

### 3. ../validate-deck.py

**Defense Presentation Validation**

Validates 81 statistical claims in the defense presentation (PPTX) against computed values. Ensures consistency between the CRP document and presentation materials.

**Usage**:

```bash
python ../validate-deck.py /path/to/qualtrics_export.csv /path/to/defense_presentation.pptx
```

## Data Schema

### CSV Structure

The scripts expect a standard Qualtrics CSV export with:

- **Row 1**: Column headers (question IDs)
- **Row 2**: Question text and sub-labels
- **Row 3**: Import IDs
- **Rows 4+**: Survey response data

### Column Naming Convention

**Demographics**:

- `Q1_Role`: Respondent role (e.g., "CIO (e.g., Director of IT)")
- `Q2_DecisionAuth`: Decision authority level (High, Medium, Low)
- `Q3_Industry`: Organization industry
- `Q4_OrgSize`: Organization size (exact values: `<100`, `100-499`, `500-999`, `1000-4999`, `5000-9999`, `10000+`)
- `Q5_ProfitModel`: Profit model (exact values: `For-Profit`, `Non-Profit`, `Government/Public Sector`)
- `Q6_RevenueBudget`: Annual revenue or budget
- `Q7_PersonalBudget`: Personal IT budget responsibility
- `Q8_GeoScope`: Geographic scope (Domestic, Global)
- `Q9_GeoScale`: Geographic scale (Single country, Multi-country)

**Barriers** (Q10-28, 18 items + 1 IRI):

- `Q10-28_Barriers_1` through `Q10-28_Barriers_19`
- Scale values: "Not a Barrier", "Minor Barrier", "Moderate Barrier", "Significant Barrier", "Major Barrier"

**Readiness** (Q47-64, 17 items + 1 IRI):

- `Q47-64_Readiness_1` through `Q47-64_Readiness_18`
- Scale values: "Very Low Readiness/Capability", "Low Readiness/Capability", "Moderate Readiness/Capability", "High Readiness/Capability", "Very High Readiness/Capability", "Don't Know"

**Maturity** (Q65-73, 8 items + 1 IRI):

- `Q65-73_Maturity_1` through `Q65-73_Maturity_9`
- Scale values: "Level 1: Initial/Ad Hoc", "Level 2: Developing/Repeatable", "Level 3: Defined/Standardized", "Level 4: Managed/Quantitatively Managed", "Level 5: Optimizing/Innovating", "Don't Know"

**Other**:

- `Duration (in seconds)`: Survey completion time
- `StartDate`: Response submission timestamp
- `Q74_Feedback`: Open-ended feedback text
- `ResponseId`: Unique participant ID

### Scale Mappings

All scripts use identical scale mappings extracted directly from the Qualtrics CSV:

**Barriers (5-point)**:

```
Not a Barrier = 1
Minor Barrier = 2
Moderate Barrier = 3
Significant Barrier = 4
Major Barrier = 5
```

**Readiness (5-point)**:

```
Very Low Readiness/Capability = 1
Low Readiness/Capability = 2
Moderate Readiness/Capability = 3
High Readiness/Capability = 4
Very High Readiness/Capability = 5
Don't Know = MISSING (excluded from scoring)
```

**Maturity (5-point)**:

```
Level 1: Initial/Ad Hoc = 1
Level 2: Developing/Repeatable = 2
Level 3: Defined/Standardized = 3
Level 4: Managed/Quantitatively Managed = 4
Level 5: Optimizing/Innovating = 5
Don't Know = MISSING (excluded from scoring)
```

**Critical rule**: "Don't Know" responses on readiness and maturity items are excluded from scoring (treated as missing data), not mapped to a numeric value.

## V2 Data Filter

All scripts apply a consistent V2 production filter to select the final analysis sample:

```sql
StartDate >= '2026-03-23 14:00:00'
OR ResponseId == 'R_1QK12IJpHjC3wd6'
```

The second condition includes one Prolific live test response (ResponseId `R_1QK12IJpHjC3wd6`, submitted 2026-03-23 09:07 AM, COO role, 876 seconds, all 3 IRIs correct) that used the V2 instrument before the official launch timestamp. This response is included as a valid result because it:

1. Used the V2 instrument (not V1)
2. Passed all quality checks (all 3 IRIs correct, adequate duration)
3. Represents a live test of production conditions

See Appendix K (Prolific Recruitment Platform Configuration) of the CRP for additional context.

## Instructed Response Items (IRIs)

IRIs are embedded attention-check items with predetermined correct answers. All scripts validate IRIs to assess respondent attention:

**IRI Expected Answers** (correct responses):

- Barrier IRI (`Q10-28_Barriers_19`): **"Major Barrier"**
- Readiness IRI (`Q47-64_Readiness_18`): **"Low Readiness/Capability"**
- Maturity IRI (`Q65-73_Maturity_9`): **"Level 2: Developing/Repeatable"**

**Conservative clean filter**: Duration ≥ 480 seconds AND all 3 IRIs correct. This is intentionally broader than the live disposition pipeline's CLEAN category, which also requires duration ≥ 540 seconds (Smeal 9-minute benchmark), reCAPTCHA ≥ 0.5, no straightlining, no partial straightlining (within-person SD ≥ 0.5), and passing Prolific auth checks. The delta between the two counts represents responses that pass the analysis filter but are routed to manual review in the pipeline (FLAG-SMEAL, FLAG-RECAPTCHA, FLAG-PARTIAL-STRAIGHTLINING, etc.).

## Test Data

A synthetic test dataset (`test_data.csv`, 15 records) is provided for verification and debugging:

### Test Dataset Composition

- **Clean records** (N=10): Duration ≥ 480 seconds, all 3 IRIs correct
  - Diverse role, industry, and org size combinations
  - Range of barrier/readiness/maturity scores

- **IRI failure** (N=1): Readiness IRI incorrect; should be excluded by conservative filter

- **Duration failure** (N=2): Duration < 480 seconds; should be excluded regardless of IRI status

- **"Don't Know" responses** (N=2): Demonstrates handling of missing readiness/maturity data

### Running with Test Data

```bash
# Test tabs_v2_analysis.py
python tabs_v2_analysis.py test_data.csv

# Expected output: N=10 clean (5 from valid duration + IRIs, 5 with "Don't Know" treated as missing)
```

The test data validates:

1. Correct CSV parsing (headers, scale mappings)
2. V2 filter logic
3. IRI validation
4. Duration filtering
5. "Don't Know" handling
6. Scale mapping correctness
7. Statistical computation (means, correlations, etc.)

## Usage Examples

### Example 1: Full Analysis on Production Data

```bash
# Install dependencies
pip install -r requirements.txt

# Run main analysis
python tabs_v2_analysis.py ~/Downloads/tabs_production_data.csv > analysis_results.txt

# Validate CRP statistics
python tabs_v2_psychometrics.py ~/Downloads/tabs_production_data.csv ~/Documents/crp.docx

# Validate defense presentation
python ../validate-deck.py ~/Downloads/tabs_production_data.csv ~/Documents/defense.pptx
```

### Example 2: Test Script Logic

```bash
# Run with test data to verify logic without production data
python tabs_v2_analysis.py test_data.csv

# Expected: Summary statistics for N=10 clean records
```

### Example 3: Custom Analysis

Edit `tabs_v2_analysis.py` to add additional analyses:

- Subset by demographics (edit the loop over demographic breakdowns)
- Change sample filters (edit the `is_clean()` function)
- Add new statistics (extend the output section)

## Psychometrics Details

### Factor Analysis (PCA with Varimax Rotation)

**Barriers construct**:

- Extraction: 4 factors
- Variance explained: 55.9%
- KMO: 0.840 (good)
- Bartlett's test: p < 0.001

**Readiness construct**:

- Extraction: 3 factors
- Variance explained: 58.8%
- KMO: 0.902 (meritorious)
- Bartlett's test: p < 0.001

**Maturity construct**:

- Extraction: 1 factor
- Variance explained: 56.2%
- KMO: 0.885 (meritorious)
- Bartlett's test: p < 0.001

### Reliability (Internal Consistency)

Cronbach's alpha by construct (conservative clean sample, N=116):

- Barriers: α = 0.883 (acceptable; 18 items)
- Readiness: α = 0.853 (acceptable; 17 items)
- Maturity: α = 0.916 (excellent; 8 items)

### Validity Assessment

**Convergent validity** (Average Variance Extracted):

- Barriers: AVE = 0.239
- Readiness: AVE = 0.383
- Maturity: AVE = 0.438

Note: AVE values are below the traditional 0.50 threshold. See CRP Chapter III Part A for discussion and compensatory validity evidence (high reliability, clear construct definitions, IRI criterion validity).

**Discriminant validity**:

- Barriers-Readiness: r = −0.603, HTMT = 0.603
- Barriers-Maturity: r = −0.522, HTMT = 0.522
- Readiness-Maturity: r = 0.723, HTMT = 0.803

All HTMT ratios < 0.85 threshold, except R-M at 0.803. Fornell-Larcker test shows R-M overlap (shared variance 52.3%). See CRP for interpretation and future work recommendations.

## Continuous Integration

Analysis scripts are validated on every GitHub commit through CI/CD workflows:

- **GitHub Actions** (24 workflows documented in Appendix I)
- **Code review**: Automated via Copilot Review Cycle (up to 7 review rounds per commit)
- **Validation**: Both `tabs_v2_psychometrics.py` and `../validate-deck.py` run on each commit

This ensures that code changes do not break statistical reproducibility.

## Troubleshooting

### "CSV not found" Error

Ensure the CSV path is correct and file permissions allow reading:

```bash
ls -lah /path/to/tabs_data.csv
```

### "Invalid scale value" Warning

This indicates a response value not in the expected scale. Check:

1. Qualtrics QSF file (Appendix J) for scale definitions
2. CSV for transcription errors
3. Script's scale mappings for correctness

### "Don't Know" Handling

Readiness and maturity items allow "Don't Know" responses. These are automatically excluded from scoring (person-level means exclude them). Barrier items do not have "Don't Know" as an option.

### Performance on Large Datasets

For N > 10,000 responses, expect 2–5 minutes computation time. Monitor memory usage:

```bash
# On Linux/Mac
time python tabs_v2_analysis.py large_dataset.csv
```

## License

All scripts are distributed under **CC-BY-4.0** (Creative Commons Attribution 4.0 International). See the GitHub repository for full license text.

## Citation

If you use these scripts in published research, please cite:

> Moyer, C. (2026). _Technology Adoption Barriers Survey (TABS): Reproducible Analysis Scripts_. Penn State University. https://scholarsphere.psu.edu/resources/cc6df3e4-17d3-4594-86f6-48a433cde962

## Contact

For questions about the scripts or data, contact:

- **Clarke Moyer**: Penn State Smeal College of Business (DBA candidate)
- **GitHub Repository**: [github.com/clarkemoyer/technologyadoptionbarriers.org](https://github.com/clarkemoyer/technologyadoptionbarriers.org)

## References

Key publications supporting the analysis methodology:

- **Factor Analysis**: Fabrigar, L. R., et al. (1999). Evaluating the use of exploratory factor analysis in psychological research. _Psychological Methods_, 4(3), 272–299.
- **Reliability**: Cronbach, L. J. (1951). Coefficient alpha and the internal structure of tests. _Psychometrika_, 16(3), 297–334.
- **Validity**: Fornell, C., & Larcker, D. F. (1981). Evaluating structural equation models with unobservable variables and measurement error. _Journal of Marketing Research_, 18(1), 39–50.
- **HTMT**: Henseler, J., et al. (2015). A new criterion for assessing discriminant validity in variance-based structural equation modeling. _Journal of the Academy of Marketing Science_, 43(1), 115–135.

---

Last updated: April 1, 2026
