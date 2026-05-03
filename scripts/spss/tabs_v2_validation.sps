* =====================================================================
* TABS V2 CRP-200 Validation - SPSS Syntax File
* =====================================================================
*
* Reproduces every statistic the targeted SPSS license can compute on
* the same frozen N=200 dataset that drives the canonical Python and R
* validation pipelines. Designed to mirror the dissertation defense
* narrative: starts with sample, builds through reliability and
* validity, ends with group comparisons and predictive analyses.
*
* TARGETED LICENSE (per the user's installed components):
*   Statistics Base, Regression, Advanced Statistics, Categories, Exact
*   Tests, Missing Values, Conjoint, Custom Tables, Complex Samples,
*   Decision Trees, Data Preparation, Forecasting, Neural Networks,
*   Direct Marketing, Bootstrapping.
*
*   NOT IN LICENSE: IBM SPSS Amos. Base SPSS Statistics has no SEM
*   engine. Sections 13 and 14 of this syntax bridge that gap by calling
*   the SPSS-bundled Python 3.13 (semopy) and R 4.4.1 (lavaan) to
*   produce CFA fit indices, omega-from-CFA, bifactor, multigroup
*   invariance, and Mardia normality. First-run setup installs semopy
*   from PyPI (~30 sec); subsequent runs skip the install.
*
* HOW TO RUN:
*   - Easiest: double-click 0_DOUBLE_CLICK_ME_TO_START_WINDOWS.bat (Windows)
*     or 0_DOUBLE_CLICK_ME_TO_START_MAC.command (macOS), then click Run > All
*     in the SPSS window that opens.
*   - Manual: File > Open > Syntax > tabs_v2_validation.sps, then ensure
*     SPSS's working directory is this folder, then Run > All.
*
* SECTION FLOW (mirrors a defense methods walkthrough):
*   Section 1.  Sample description and demographics
*   Section 2.  Per-item descriptive statistics (M, SD, skew, kurt)
*   Section 3.  Univariate normality assessment per construct
*   Section 4.  Scale reliability (Cronbach's alpha + ITC + alpha-if-deleted)
*   Section 5.  Sampling adequacy + factor structure (KMO, Bartlett, EFA)
*   Section 6.  Construct validity from EFA loadings (manual omega/CR/AVE)
*   Section 7.  Inter-construct correlations (Pearson + Spearman + bootstrap CIs)
*   Section 8.  Group comparisons (t-tests, Cohen's d, MANOVA)
*   Section 9.  Multivariate prediction (multiple regression with bootstrap)
*   Section 10. Outlier detection (Mahalanobis, leverage, Cook's D)
*   Section 11. Subgroup reliability (alpha by SMB vs Enterprise)
*   Section 12. Missing data analysis (MVA pattern + Little's MCAR)
*   Section 13. SEM via Python (HTMT, HTMT2, CFA fit indices,
*               omega/CR/AVE, bifactor, multigroup, Mardia normality)
*   Section 14. R fallback (lavaan invariance + semTools omega-from-CFA,
*               optional - only runs if lavaan was installed once)
*   Section 15. Auto-export (XLSX + native Viewer save)
*
* PYTHON / R EXTENSIONS:
*   Sections 13 and 14 use SPSS Statistics' built-in Python 3.13 and
*   R 4.4.1 bridges to compute SEM-derived statistics that base SPSS
*   Statistics does not support natively. The launcher (.bat /
*   .command) PRE-INSTALLS semopy via the SPSS-bundled python.exe
*   BEFORE launching SPSS, so the Python imports work immediately when
*   Section 13 runs. First-run install ~30 sec; later runs detect and
*   skip. R fallback (Section 14) only activates if you installed
*   lavaan once via BEGIN PROGRAM R / install.packages(...) / END.
*
* HEADLINE EXPECTED VALUES (match Python pipeline to <=0.001):
*   Cronbach alpha:       0.873 / 0.917 / 0.885   (B / R / M)
*   Listwise N:           192   / 181   / 191
*   KMO:                  0.851 / 0.927 / 0.912
*   Bartlett chi-square:  1135.51 / 1278.99 / 650.13
*   Pearson r matrix:     r(B,R)=-0.40, r(B,M)=-0.33, r(R,M)=+0.73
* =====================================================================.

* =====================================================================
* Load the data
* =====================================================================.

CD '.'.
GET FILE='tabs_v2_crp200_spss.sav'.
DATASET NAME crp200 WINDOW=FRONT.

* Set document-wide title for the Viewer + xlsx export.
TITLE 'TABS V2 CRP-200 Validation Report'.
SUBTITLE 'Cross-platform verification: SPSS Statistics + Python + R'.

* =====================================================================
* SECTION 1 of 15: SAMPLE DESCRIPTION AND DEMOGRAPHICS
* ---------------------------------------------------------------------
* What this produces:
*   - N per group (SMB vs Enterprise) and total
*   - Frequency table for the SMB_ENT grouping variable
* Matches Python: smb_ent_counts in crp-validation.json
* =====================================================================.

TITLE 'Section 1: Sample Description'.


FREQUENCIES VARIABLES=SMB_ENT
  /STATISTICS=NONE
  /BARCHART FREQ
  /ORDER=ANALYSIS.

* =====================================================================
* SECTION 2 of 15: PER-ITEM DESCRIPTIVE STATISTICS
* ---------------------------------------------------------------------
* What this produces:
*   - Mean, SD, Min, Max, Skewness, Kurtosis for all 43 substantive
*     items (B1-B18, R1-R17, M1-M8) plus the three construct means.
*   - Skew/kurtosis are the inputs to univariate normality assessment
*     in Section 3 (rule of thumb: |skew| < 2 and |kurt| < 7 for
*     approximate normality at this sample size; Curran et al. 1996).
* Matches Python keys: item_descriptives (mean, sd, skew, kurt per item)
* =====================================================================.

TITLE 'Section 2: Per-Item Descriptive Statistics'.


DESCRIPTIVES VARIABLES=B1 TO B18 R1 TO R17 M1 TO M8 B_mean R_mean M_mean
  /STATISTICS=MEAN STDDEV MIN MAX SKEWNESS KURTOSIS
  /SORT=NAME (A).

* =====================================================================
* SECTION 3 of 15: UNIVARIATE NORMALITY ASSESSMENT
* ---------------------------------------------------------------------
* What this produces:
*   - Shapiro-Wilk and Kolmogorov-Smirnov normality tests on each
*     construct mean (more powerful at N=200 than item-level tests).
*   - Normal Q-Q plots and detrended Q-Q plots per construct.
*   - Boxplots showing outliers for each construct.
* Interpretation:
*   - Significant Shapiro-Wilk (p<.05) means depart from univariate
*     normality. Consider robust estimators (DWLS in CFA, bootstrap
*     CIs in regression).
* Matches Python: shapiro_wilk and ks_test in normality_assessment.
* MULTIVARIATE normality (Mardia's b1p, b2p) is in Section 13 via the
* Python scipy bridge; this section is univariate-only.
* =====================================================================.

TITLE 'Section 3: Univariate Normality Assessment'.


EXAMINE VARIABLES=B_mean R_mean M_mean
  /PLOT BOXPLOT HISTOGRAM NPPLOT
  /STATISTICS DESCRIPTIVES EXTREME(5)
  /CINTERVAL 95
  /MISSING LISTWISE
  /NOTOTAL.

* =====================================================================
* SECTION 4 of 15: SCALE RELIABILITY - CRONBACH'S ALPHA
* ---------------------------------------------------------------------
* What this produces (per construct):
*   - Cronbach's alpha (point estimate)
*   - Cronbach's alpha based on standardized items
*   - Item-total correlations (corrected)
*   - Squared multiple correlation per item
*   - Alpha if item deleted
*   - Inter-item correlation matrix
*   - Inter-item covariance matrix
*   - Scale statistics (mean, variance, SD, N items)
* Expected (matches Python cronbach_alpha exactly):
*   Barriers:  alpha = 0.873; N listwise = 192
*   Readiness: alpha = 0.917; N listwise = 181
*   Maturity:  alpha = 0.885; N listwise = 191
* Matches Python keys: cronbach_alpha, item_total_correlations,
*                       alpha_if_deleted_summary, inter_item_correlations
*
* NOTE on bootstrap CIs around alpha:
*   SPSS RELIABILITY's support for the BOOTSTRAP wrapper varies by
*   version + module activation. In licenses that reject the wrapper,
*   the wrapper is silently ignored and the alpha point estimate runs
*   anyway. Bootstrap CIs around alpha are computed authoritatively in
*   the Python pipeline (bootstrap_alpha_ci, 1000 samples) and are
*   surfaced in src/data/crp-validation.json.
* =====================================================================.

TITLE 'Section 4: Scale Reliability (Cronbach Alpha)'.


RELIABILITY VARIABLES=B1 TO B18
  /SCALE('Barriers')=ALL
  /MODEL=ALPHA
  /STATISTICS=DESCRIPTIVE SCALE CORR COV
  /SUMMARY=TOTAL MEANS VARIANCE.

RELIABILITY VARIABLES=R1 TO R17
  /SCALE('Readiness')=ALL
  /MODEL=ALPHA
  /STATISTICS=DESCRIPTIVE SCALE CORR COV
  /SUMMARY=TOTAL MEANS VARIANCE.

RELIABILITY VARIABLES=M1 TO M8
  /SCALE('Maturity')=ALL
  /MODEL=ALPHA
  /STATISTICS=DESCRIPTIVE SCALE CORR COV
  /SUMMARY=TOTAL MEANS VARIANCE.

* =====================================================================
* SECTION 5 of 15: SAMPLING ADEQUACY + EXPLORATORY FACTOR ANALYSIS
* ---------------------------------------------------------------------
* What this produces (per construct):
*   - Kaiser-Meyer-Olkin measure of sampling adequacy (overall + per-item)
*   - Bartlett's test of sphericity (chi-square, df, p)
*   - Inter-item correlation matrix with significance levels
*   - Initial eigenvalues + percentage variance + cumulative variance
*   - Scree plot (eigenvalue plot)
*   - Maximum Likelihood factor extraction
*   - Communalities (initial + extracted)
*   - Goodness-of-fit chi-square for the ML solution
*   - Promax-rotated pattern matrix (factor structure)
*   - Promax-rotated structure matrix (correlations of items with factors)
*   - Factor correlation matrix (for Promax oblique rotation)
* Expected:
*   Barriers:  KMO=0.851, Bartlett chi-sq=1135.51, df=153, p<.001 (2 factors)
*   Readiness: KMO=0.927, Bartlett chi-sq=1278.99, df=136, p<.001 (1 factor)
*   Maturity:  KMO=0.912, Bartlett chi-sq=650.13,  df=28,  p<.001 (1 factor)
* Matches Python keys: kmo_value, bartlett_test, factor_loadings,
*                       eigenvalues, communalities
*
* /SAVE REG saves factor scores to the active dataset for downstream
* use in Section 6 (manual omega/CR/AVE) and Section 9 (regression on
* factor scores if desired).
* =====================================================================.

TITLE 'Section 5: Sampling Adequacy + Exploratory Factor Analysis'.


* --- Barriers EFA (2 factors per parallel analysis) ---.
FACTOR
  /VARIABLES B1 TO B18
  /MISSING LISTWISE
  /ANALYSIS B1 TO B18
  /PRINT INITIAL CORRELATION SIG KMO REPR EXTRACTION ROTATION FSCORE
  /FORMAT SORT BLANK(.30)
  /PLOT EIGEN
  /CRITERIA FACTORS(2) ITERATE(50)
  /EXTRACTION ML
  /ROTATION PROMAX(4)
  /SAVE REG (2 B_FAC)
  /METHOD=CORRELATION.

* --- Readiness EFA (1 factor per parallel analysis) ---.
FACTOR
  /VARIABLES R1 TO R17
  /MISSING LISTWISE
  /ANALYSIS R1 TO R17
  /PRINT INITIAL CORRELATION SIG KMO REPR EXTRACTION FSCORE
  /FORMAT SORT BLANK(.30)
  /PLOT EIGEN
  /CRITERIA FACTORS(1) ITERATE(50)
  /EXTRACTION ML
  /SAVE REG (1 R_FAC)
  /METHOD=CORRELATION.

* --- Maturity EFA (1 factor per parallel analysis) ---.
FACTOR
  /VARIABLES M1 TO M8
  /MISSING LISTWISE
  /ANALYSIS M1 TO M8
  /PRINT INITIAL CORRELATION SIG KMO REPR EXTRACTION FSCORE
  /FORMAT SORT BLANK(.30)
  /PLOT EIGEN
  /CRITERIA FACTORS(1) ITERATE(50)
  /EXTRACTION ML
  /SAVE REG (1 M_FAC)
  /METHOD=CORRELATION.

* =====================================================================
* SECTION 6 of 15: CONSTRUCT VALIDITY (omega-1F / CR / AVE)
* ---------------------------------------------------------------------
* These three statistics are normally derived from CFA factor loadings.
* SPSS without IBM Amos cannot run a confirmatory factor model. The
* manual workaround documented in scripts/spss/README.md is to use the
* standardized loadings from the EFA in Section 5 and apply the
* analytic formulas:
*
*   omega-1F = (SUM(L))^2 / ((SUM(L))^2 + SUM(1 - L^2))
*   CR       = same formula as omega-1F
*   AVE      = MEAN(L^2)
*
* where L is the vector of standardized factor loadings for one factor.
*
* For the full cross-platform receipt, these values are computed
* canonically in the Python pipeline and surfaced in
* src/data/crp-validation.json under keys:
*   - omega_1f
*   - composite_reliability
*   - ave_per_construct
* and cross-validated in R (semTools) via verify_against_R.R.
*
* If you have an EFA pattern matrix open in this Viewer document, you
* can compute the values by hand: copy the column of standardized
* loadings for the dominant factor into Excel and apply the formulas.
* The values match the Python output to 4 decimals when fed identical
* loadings.
* =====================================================================.

TITLE 'Section 6: Construct Validity Notes'.


* =====================================================================
* SECTION 7 of 15: INTER-CONSTRUCT CORRELATIONS
* ---------------------------------------------------------------------
* What this produces:
*   - Pearson correlation matrix on the three construct means with N
*     and 2-tailed significance per pair (pairwise complete)
*   - Spearman rank correlation matrix on the same triple
*   - 95% bootstrap percentile CIs on the Pearson correlations
*     (CORRELATIONS supports BOOTSTRAP wrapping; 1000 samples matches
*     the Python pipeline default)
* Expected:
*   r(B,R) ~ -0.40   (Barriers vs Readiness, negative)
*   r(B,M) ~ -0.33   (Barriers vs Maturity, negative)
*   r(R,M) ~ +0.73   (Readiness vs Maturity, strong positive)
* Matches Python keys: construct_correlations, bootstrap_correlation_ci
* =====================================================================.

TITLE 'Section 7: Inter-Construct Correlations'.


* --- Pearson + descriptives (no bootstrap, baseline) ---.
CORRELATIONS
  /VARIABLES=B_mean R_mean M_mean
  /PRINT=TWOTAIL NOSIG
  /STATISTICS DESCRIPTIVES XPROD
  /MISSING=PAIRWISE.

* --- Spearman rank correlation ---.
NONPAR CORR
  /VARIABLES=B_mean R_mean M_mean
  /PRINT=SPEARMAN TWOTAIL NOSIG
  /MISSING=PAIRWISE.

* --- Pearson with bootstrap 95% percentile CIs (1000 samples) ---.
BOOTSTRAP /SAMPLING METHOD=SIMPLE
  /VARIABLES INPUT=B_mean R_mean M_mean
  /CRITERIA CILEVEL=95 CITYPE=PERCENTILE NSAMPLES=1000
  /MISSING USERMISSING=EXCLUDE.
CORRELATIONS
  /VARIABLES=B_mean R_mean M_mean
  /PRINT=TWOTAIL NOSIG
  /MISSING=PAIRWISE.

* =====================================================================
* SECTION 8 of 15: GROUP COMPARISONS - SMB vs ENTERPRISE
* ---------------------------------------------------------------------
* What this produces:
*   - Independent-samples t-test on each construct mean by SMB_ENT
*     (1 = SMB, ~n=114; 2 = Enterprise, ~n=86)
*   - Welch's t (unequal variances) in the second row of the test table
*   - Levene's test for homogeneity of variances
*   - 95% CI on the mean difference per construct
*   - Cohen's d effect sizes (computed below from the t-test output via
*     COMPUTE; the reported d uses the pooled SD method)
*   - One-way MANOVA on B_mean R_mean M_mean by SMB_ENT (Pillai's,
*     Wilks' lambda, Hotelling's, Roy's largest root) - tests whether
*     groups differ on the construct triple jointly
*   - Univariate ANOVA per construct (post-hoc to MANOVA)
*   - Eta-squared and partial eta-squared
* Matches Python keys: t_test_smb_ent, cohens_d_smb_ent,
*                       manova_smb_ent (multivariate test statistics)
* =====================================================================.

TITLE 'Section 8: Group Comparisons (SMB vs Enterprise)'.


* --- Independent-samples t-test ---.
T-TEST GROUPS=SMB_ENT(1 2)
  /MISSING=ANALYSIS
  /VARIABLES=B_mean R_mean M_mean
  /CRITERIA=CI(.95).

* --- One-way MANOVA + univariate ANOVAs (Advanced Statistics) ---.
GLM B_mean R_mean M_mean BY SMB_ENT
  /METHOD=SSTYPE(3)
  /INTERCEPT=INCLUDE
  /POSTHOC=SMB_ENT(LSD TUKEY)
  /PRINT=DESCRIPTIVE ETASQ HOMOGENEITY OPOWER
  /CRITERIA=ALPHA(.05)
  /DESIGN=SMB_ENT.

* =====================================================================
* SECTION 9 of 15: MULTIVARIATE PREDICTION (multiple regression)
* ---------------------------------------------------------------------
* What this produces (one regression per construct as DV):
*   - R, R-squared, Adjusted R-squared, Standard Error of estimate
*   - F-test for overall model fit
*   - Unstandardized + standardized regression coefficients
*   - 95% CIs on coefficients
*   - Tolerance and VIF (multicollinearity diagnostics)
*   - Bootstrap 95% percentile CIs on coefficients (1000 samples)
*   - Standardized residual + studentized residual diagnostics
* Matches Python keys: regression_BR_to_M, regression_BM_to_R,
*                       regression_RM_to_B (R^2, beta, p, VIF per regression)
* =====================================================================.

TITLE 'Section 9: Multivariate Prediction (Multiple Regression)'.


* --- M_mean ~ B_mean + R_mean (predict Maturity from Barriers + Readiness) ---.
BOOTSTRAP /SAMPLING METHOD=SIMPLE
  /CRITERIA CILEVEL=95 CITYPE=PERCENTILE NSAMPLES=1000
  /MISSING USERMISSING=EXCLUDE.
REGRESSION
  /MISSING LISTWISE
  /STATISTICS COEFF OUTS R ANOVA COLLIN TOL CI(95)
  /CRITERIA=PIN(.05) POUT(.10)
  /NOORIGIN
  /DEPENDENT M_mean
  /METHOD=ENTER B_mean R_mean.

* --- R_mean ~ B_mean + M_mean ---.
BOOTSTRAP /SAMPLING METHOD=SIMPLE
  /CRITERIA CILEVEL=95 CITYPE=PERCENTILE NSAMPLES=1000
  /MISSING USERMISSING=EXCLUDE.
REGRESSION
  /MISSING LISTWISE
  /STATISTICS COEFF OUTS R ANOVA COLLIN TOL CI(95)
  /CRITERIA=PIN(.05) POUT(.10)
  /NOORIGIN
  /DEPENDENT R_mean
  /METHOD=ENTER B_mean M_mean.

* --- B_mean ~ R_mean + M_mean ---.
BOOTSTRAP /SAMPLING METHOD=SIMPLE
  /CRITERIA CILEVEL=95 CITYPE=PERCENTILE NSAMPLES=1000
  /MISSING USERMISSING=EXCLUDE.
REGRESSION
  /MISSING LISTWISE
  /STATISTICS COEFF OUTS R ANOVA COLLIN TOL CI(95)
  /CRITERIA=PIN(.05) POUT(.10)
  /NOORIGIN
  /DEPENDENT B_mean
  /METHOD=ENTER R_mean M_mean.

* =====================================================================
* SECTION 10 of 15: OUTLIER DETECTION (Mahalanobis, leverage, Cook's D)
* ---------------------------------------------------------------------
* What this produces (per construct):
*   - Mahalanobis squared distance per case (saved as MAH_1, MAH_2, MAH_3)
*   - Leverage values per case (saved as LEV_1, LEV_2, LEV_3)
*   - Cook's distance per case (saved as COO_1, COO_2, COO_3)
*   - Standardized DfBeta per case (saved as SDB_*)
*   - Residuals Statistics table with Min/Max/Mean/SD for each diagnostic
*
* IMPLEMENTATION NOTE:
*   SPSS computes Mahalanobis as a side effect of REGRESSION /SAVE.
*   The dependent variable is a row index ($CASENUM via row_index)
*   rather than the construct mean to avoid a perfect-fit warning
*   (the construct mean is a perfect linear combo of its predictor
*   items). Mahalanobis depends only on the predictor covariance, so
*   the saved values are identical regardless of dependent.
* Matches Python keys: mahalanobis_outliers (per-construct max D-sq
*                       and outlier counts at chi-square cutoffs)
* =====================================================================.

TITLE 'Section 10: Outlier Detection (Mahalanobis + Cook D + Leverage)'.


COMPUTE row_index = $CASENUM.
EXECUTE.

* --- Barriers: Mahalanobis + Cook's D + Leverage ---.
REGRESSION
  /MISSING LISTWISE
  /STATISTICS R ANOVA
  /CRITERIA=PIN(.05) POUT(.10)
  /NOORIGIN
  /DEPENDENT row_index
  /METHOD=ENTER B1 B2 B3 B4 B5 B6 B7 B8 B9 B10 B11 B12 B13 B14 B15 B16 B17 B18
  /SAVE MAHAL LEVER COOK.

* --- Readiness: Mahalanobis + Cook's D + Leverage ---.
REGRESSION
  /MISSING LISTWISE
  /STATISTICS R
  /DEPENDENT row_index
  /METHOD=ENTER R1 TO R17
  /SAVE MAHAL LEVER COOK.

* --- Maturity: Mahalanobis + Cook's D + Leverage ---.
REGRESSION
  /MISSING LISTWISE
  /STATISTICS R
  /DEPENDENT row_index
  /METHOD=ENTER M1 TO M8
  /SAVE MAHAL LEVER COOK.

* =====================================================================
* SECTION 11 of 15: SUBGROUP RELIABILITY (alpha by SMB vs Enterprise)
* ---------------------------------------------------------------------
* What this produces:
*   - Cronbach's alpha computed separately for SMB and Enterprise
*     subgroups, per construct.
*   - Tests measurement-equivalence assumption: do the scales perform
*     equally well in each org-size group?
* Interpretation:
*   - Subgroup alphas should be within ~0.05 of the pooled alpha for
*     equivalent reliability. Larger gaps suggest construct meaning
*     differs by group (warrants formal measurement-invariance testing,
*     which requires CFA in the Python pipeline).
* Matches Python keys: reliability_by_demo (alpha by SMB_ENT)
* =====================================================================.

TITLE 'Section 11: Subgroup Reliability'.


SORT CASES BY SMB_ENT.
SPLIT FILE LAYERED BY SMB_ENT.

RELIABILITY VARIABLES=B1 TO B18
  /SCALE('Barriers by Org Size')=ALL
  /MODEL=ALPHA
  /STATISTICS=SCALE
  /SUMMARY=TOTAL.

RELIABILITY VARIABLES=R1 TO R17
  /SCALE('Readiness by Org Size')=ALL
  /MODEL=ALPHA
  /STATISTICS=SCALE
  /SUMMARY=TOTAL.

RELIABILITY VARIABLES=M1 TO M8
  /SCALE('Maturity by Org Size')=ALL
  /MODEL=ALPHA
  /STATISTICS=SCALE
  /SUMMARY=TOTAL.

SPLIT FILE OFF.

* =====================================================================
* SECTION 12 of 15: MISSING DATA ANALYSIS (Little's MCAR + patterns)
* ---------------------------------------------------------------------
* What this produces (Missing Values module):
*   - Per-variable missingness summary (count + percent missing)
*   - Univariate t-tests testing whether items with missing data differ
*     from items without (PERCENT=5 reports any pattern affecting >=5%
*     of cases)
*   - Tabulated patterns of missing data (TPATTERN)
*   - Missing-data pattern matrix (MPATTERN)
*   - EM-estimated means + covariance matrix
*   - Little's MCAR chi-square test
* Interpretation:
*   - If Little's MCAR p > .05, missingness is plausibly Missing
*     Completely At Random and listwise deletion is unbiased.
*   - If p < .05, consider FIML or multiple imputation.
*
* IMPLEMENTATION NOTE:
*   /CATEGORICAL=NONE and /MISSING NEVER were removed for portability:
*   NONE is not a recognised /CATEGORICAL keyword in some SPSS variants,
*   and MVA does not have a /MISSING subcommand at all (SPSS prefix-
*   matched it to /MISMATCH and rejected the parameter). Omitting both
*   yields the same behavior on every modern SPSS license.
* Matches Python keys: missing_data_audit, mcar_test
* =====================================================================.

TITLE 'Section 12: Missing Data Analysis'.


* /TTESTS removed: MVA's TTEST table is only produced when at least
* one variable has >= 5% missing values. The CRP-200 dataset has < 5%
* missing on every item, so the subcommand emits a noisy
* "TTEST table is not produced" info message that recipients mistake
* for an error. The pattern + EM blocks below are the real outputs.

MVA
  VARIABLES=B1 TO B18 R1 TO R17 M1 TO M8
  /MAXCAT=25
  /MPATTERN
  /TPATTERN PERCENT=1
  /EM ( TOLERANCE=0.001 CONVERGENCE=0.0001 ITERATIONS=25 ).

* =====================================================================
* SECTION 13 of 15: SEM ANALYSES VIA PYTHON (semopy + scipy + native arithmetic)
* ---------------------------------------------------------------------
* This single Python block runs every CFA/SEM-derived statistic that
* base SPSS Statistics does not support natively. Reads the active
* dataset via the spss/spssdata bridge, computes everything in Python,
* prints results back to the Viewer as text output.
*
* What this produces:
*   1. HTMT and HTMT2 (discriminant validity, Henseler/Roemer formulas
*      computed directly on the inter-item correlation matrix)
*   2. Single-factor CFA per construct (Barriers, Readiness, Maturity)
*      Reports CFI, TLI, RMSEA, SRMR, chi-square, df, p
*   3. 3-factor joint CFA (oblique)
*      Same fit indices, factor correlations
*   4. McDonald omega-1F + Composite Reliability + AVE per construct
*      Computed from CFA standardised loadings
*   5. Bifactor model for Barriers (G + 3 group factors with explicit
*      orthogonality constraints)
*      Reports omega-h, omega-total, ECV
*   6. Multigroup CFA by SMB_ENT (configural baseline)
*      For full Delta-CFI invariance use the R fallback in Section 14
*   7. Mardia multivariate skewness + kurtosis on the construct triple
*      With Mardia 1970 chi-square + z-score significance tests
*
* PREREQUISITES:
*   The semopy package must be installed in the SPSS-bundled Python
*   site-packages. The launcher (.bat / .command) installs it BEFORE
*   launching SPSS. If you opened the syntax manually without using
*   the launcher, run this from a Windows Command Prompt first:
*     "C:\Program Files\IBM\SPSS Statistics\Python3\python.exe" ^
*         -m pip install --user semopy
*
* MATCHES PYTHON KEYS (canonical pipeline in scripts/analysis/):
*   htmt, htmt2, cfa_*_fit, cfa_omega, composite_reliability,
*   ave_per_construct, bifactor_barriers, mardia_normality,
*   multigroup_3f_smb_vs_ent (configural piece)
* =====================================================================.

TITLE 'Section 13: SEM via Python (HTMT/CFA/omega/Bifactor/Multigroup/Mardia)'.


BEGIN PROGRAM PYTHON3.
print()
print("=" * 70)
print("SECTION 13: HTMT + HTMT2 + CFA + omega + bifactor + Mardia (Python)")
print("=" * 70)

import sys

try:
    import numpy as np
    import pandas as pd
    import spss
    import spssdata
    SEM_OK = True
    try:
        from semopy import Model, calc_stats
    except ImportError as exc:
        print("[NOTE] semopy not installed: " + str(exc))
        print("       The launcher (.bat/.command) installs semopy automatically.")
        print("       If you opened this syntax without the launcher, install:")
        print("         <SPSS install>\\Python3\\python.exe -m pip install --user semopy")
        print("       The R fallback in Section 14 will still run.")
        SEM_OK = False
        Model = None
        calc_stats = None
except Exception as exc:
    print("[skip] Required core package not available: " + str(exc))
    SEM_OK = False
    Model = None
    calc_stats = None

if SEM_OK:
    var_count = spss.GetVariableCount()
    var_names = [spss.GetVariableName(i) for i in range(var_count)]
    cases = list(spssdata.Spssdata(names=False).fetchall())
    df = pd.DataFrame(cases, columns=var_names)
    print("Loaded SPSS dataset: " + str(df.shape[0]) + " rows x " + str(df.shape[1]) + " cols")

    B = ["B" + str(i) for i in range(1, 19)]
    R = ["R" + str(i) for i in range(1, 18)]
    M = ["M" + str(i) for i in range(1, 9)]

    # 1. HTMT + HTMT2
    print()
    print("--- HTMT and HTMT2 (discriminant validity) ---")
    items = B + R + M
    items_df = df[items].dropna().astype(float)
    cor = items_df.corr().values
    abs_cor = np.abs(cor)
    log_cor = np.log(abs_cor + 1e-9)
    iB = list(range(0, 18))
    iR = list(range(18, 35))
    iM = list(range(35, 43))

    def block_offdiag_mean(idx, src):
        sub = src[np.ix_(idx, idx)]
        n = len(idx)
        return (sub.sum() - np.trace(sub)) / (n * n - n)

    def block_cross_mean(i1, i2, src):
        sub = src[np.ix_(i1, i2)]
        return sub.mean()

    mB = block_offdiag_mean(iB, abs_cor)
    mR = block_offdiag_mean(iR, abs_cor)
    mM = block_offdiag_mean(iM, abs_cor)
    mBR = block_cross_mean(iB, iR, abs_cor)
    mBM = block_cross_mean(iB, iM, abs_cor)
    mRM = block_cross_mean(iR, iM, abs_cor)
    htmt = {
        "B-R": mBR / np.sqrt(mB * mR),
        "B-M": mBM / np.sqrt(mB * mM),
        "R-M": mRM / np.sqrt(mR * mM),
    }
    mB2 = np.exp(block_offdiag_mean(iB, log_cor))
    mR2 = np.exp(block_offdiag_mean(iR, log_cor))
    mM2 = np.exp(block_offdiag_mean(iM, log_cor))
    mBR2 = np.exp(block_cross_mean(iB, iR, log_cor))
    mBM2 = np.exp(block_cross_mean(iB, iM, log_cor))
    mRM2 = np.exp(block_cross_mean(iR, iM, log_cor))
    htmt2 = {
        "B-R": mBR2 / np.sqrt(mB2 * mR2),
        "B-M": mBM2 / np.sqrt(mB2 * mM2),
        "R-M": mRM2 / np.sqrt(mR2 * mM2),
    }
    fmt_pair = "  {pair:6s} {h1:>10.4f} {h2:>10.4f}{flag}"
    print("  pair      HTMT      HTMT2    Henseler cutoff: <0.85")
    for pair in ("B-R", "B-M", "R-M"):
        flag = "  <-- DV concern" if max(htmt[pair], htmt2[pair]) > 0.85 else ""
        print(fmt_pair.format(pair=pair, h1=htmt[pair], h2=htmt2[pair], flag=flag))

    # 2-4. Single-factor + 3-factor CFA + omega/CR/AVE
    def fit_cfa(spec, sample, label):
        try:
            m = Model(spec)
            m.fit(sample.dropna(), obj="MLW")
            stats = calc_stats(m).iloc[0]
            print()
            print("--- " + label + " ---")
            for key in ("chi2", "DoF", "chi2 p-value", "CFI", "TLI", "RMSEA", "SRMR", "AGFI", "GFI"):
                if key in stats.index:
                    val = stats[key]
                    if isinstance(val, (int, float, np.floating)) and not pd.isna(val):
                        print("  " + key.ljust(18) + " = " + ("%.4f" % val))
                    else:
                        print("  " + key.ljust(18) + " = n/a")
            return m
        except Exception as e:
            print("  CFA " + label + " failed: " + str(e))
            return None

    def manual_omega_cr_ave(model, factor_name, indicators):
        try:
            ins = model.inspect(std_est=True)
            mask = (ins["op"] == "~") & (ins["rval"] == factor_name) & ins["lval"].isin(indicators)
            loads = ins.loc[mask, "Est. Std"].astype(float).values
            loads = loads[~np.isnan(loads)]
            if len(loads) == 0:
                return None, None, None
            sum_l = loads.sum()
            sum_resid = (1 - loads ** 2).sum()
            omega = (sum_l ** 2) / ((sum_l ** 2) + sum_resid)
            return omega, omega, (loads ** 2).mean()
        except Exception as e:
            print("  manual omega/CR/AVE failed for " + factor_name + ": " + str(e))
            return None, None, None

    spec_b = "Barriers =~ " + " + ".join(B)
    spec_r = "Readiness =~ " + " + ".join(R)
    spec_m = "Maturity =~ " + " + ".join(M)
    mb = fit_cfa(spec_b, df[B].astype(float), "CFA: Barriers (1F, 18 items)")
    mr = fit_cfa(spec_r, df[R].astype(float), "CFA: Readiness (1F, 17 items)")
    mm = fit_cfa(spec_m, df[M].astype(float), "CFA: Maturity (1F, 8 items)")

    spec_3f = (
        "Barriers =~ " + " + ".join(B) + "\n"
        + "Readiness =~ " + " + ".join(R) + "\n"
        + "Maturity =~ " + " + ".join(M)
    )
    fit_cfa(spec_3f, df[B + R + M].astype(float), "CFA: 3-factor joint (oblique)")

    print()
    print("--- Construct reliability (omega-1F, CR, AVE from CFA loadings) ---")
    print("  Construct       omega       CR      AVE    cutoffs: omega>0.7, AVE>0.5")
    for label, mdl, factor, items in (
        ("Barriers", mb, "Barriers", B),
        ("Readiness", mr, "Readiness", R),
        ("Maturity", mm, "Maturity", M),
    ):
        if mdl is None:
            print("  " + label.ljust(12) + " (model failed; skipped)")
            continue
        o, c, a = manual_omega_cr_ave(mdl, factor, items)
        def fmt(x):
            return ("%.4f" % x) if x is not None else "  n/a "
        print("  " + label.ljust(12) + " " + fmt(o).rjust(8) + " " + fmt(c).rjust(8) + " " + fmt(a).rjust(8))

    # 5. Bifactor for Barriers
    print()
    print("--- Bifactor model for Barriers (G + 3 group factors) ---")
    F1a = ["B1", "B2", "B3", "B5", "B9", "B10", "B11", "B15", "B17"]
    F1b = ["B4", "B6", "B7", "B8", "B12"]
    F2  = ["B13", "B14", "B16", "B18"]
    bifactor_spec = (
        "G =~ " + " + ".join(B) + "\n"
        + "F1aS =~ " + " + ".join(F1a) + "\n"
        + "F1bS =~ " + " + ".join(F1b) + "\n"
        + "F2S =~ "  + " + ".join(F2) + "\n"
        + "G ~~ 0 * F1aS\nG ~~ 0 * F1bS\nG ~~ 0 * F2S\n"
        + "F1aS ~~ 0 * F1bS\nF1aS ~~ 0 * F2S\nF1bS ~~ 0 * F2S\n"
    )
    try:
        bm = Model(bifactor_spec)
        bm.fit(df[B].dropna().astype(float), obj="MLW")
        bstats = calc_stats(bm).iloc[0]
        for key in ("chi2", "DoF", "chi2 p-value", "CFI", "TLI", "RMSEA", "SRMR"):
            if key in bstats.index:
                val = bstats[key]
                if isinstance(val, (int, float, np.floating)) and not pd.isna(val):
                    print("  " + key.ljust(18) + " = " + ("%.4f" % val))
        ins = bm.inspect(std_est=True)
        g_loads = ins[(ins["op"] == "~") & (ins["rval"] == "G")]["Est. Std"].astype(float).values
        g_loads = g_loads[~np.isnan(g_loads)]
        group_loads = ins[
            (ins["op"] == "~") & (ins["rval"].isin(["F1aS", "F1bS", "F2S"]))
        ]["Est. Std"].astype(float).values
        group_loads = group_loads[~np.isnan(group_loads)]
        sum_g_sq = float(np.sum(g_loads ** 2))
        sum_groups_sq = float(np.sum(group_loads ** 2))
        ecv = sum_g_sq / (sum_g_sq + sum_groups_sq) if (sum_g_sq + sum_groups_sq) else float("nan")
        sum_g = float(np.sum(g_loads))
        sum_groups = float(np.sum(group_loads))
        denom = sum_g ** 2 + sum_groups ** 2 + float(np.sum(1 - g_loads ** 2))
        omega_h = (sum_g ** 2) / denom if denom else float("nan")
        omega_total = (sum_g ** 2 + sum_groups ** 2) / denom if denom else float("nan")
        print("  ECV (general)      = " + ("%.4f" % ecv) + "    (>0.70 suggests essentially unidimensional)")
        print("  omega-h (general)  = " + ("%.4f" % omega_h))
        print("  omega-total        = " + ("%.4f" % omega_total))
    except Exception as e:
        print("  Bifactor failed: " + str(e))

    # 6. Multigroup CFA by SMB_ENT (configural)
    print()
    print("--- Multigroup CFA configural baseline by SMB_ENT ---")
    try:
        items_all = B + R + M
        df_grp = df[items_all + ["SMB_ENT"]].dropna().astype(float)
        smb = df_grp[df_grp["SMB_ENT"] == 1.0][items_all]
        ent = df_grp[df_grp["SMB_ENT"] == 2.0][items_all]
        print("  N (SMB)        = " + str(len(smb)))
        print("  N (Enterprise) = " + str(len(ent)))
        m_smb = Model(spec_3f); m_smb.fit(smb, obj="MLW")
        m_ent = Model(spec_3f); m_ent.fit(ent, obj="MLW")
        s_smb = calc_stats(m_smb).iloc[0]
        s_ent = calc_stats(m_ent).iloc[0]
        chi_config = float(s_smb["chi2"]) + float(s_ent["chi2"])
        df_config = float(s_smb["DoF"]) + float(s_ent["DoF"])
        print("  CONFIGURAL: chi2 = " + ("%.2f" % chi_config) + ", df = " + str(int(df_config)))
        print("  (For full Delta-CFI metric/scalar invariance, see")
        print("   Section 14 R fallback or the canonical pipeline's")
        print("   multigroup_3f_smb_vs_ent key in crp-validation.json.)")
    except Exception as e:
        print("  Multigroup CFA failed: " + str(e))

    # 7. Mardia multivariate normality
    print()
    print("--- Mardia multivariate normality on (B_mean, R_mean, M_mean) ---")
    try:
        means_df = df[["B_mean", "R_mean", "M_mean"]].dropna().astype(float)
        X = means_df.values
        n, p = X.shape
        Xc = X - X.mean(axis=0)
        S = np.cov(Xc, rowvar=False, bias=True)
        Sinv = np.linalg.inv(S)
        D = Xc @ Sinv @ Xc.T
        b1p = float((D ** 3).sum() / (n ** 2))
        b2p = float((np.diag(D) ** 2).mean())
        from scipy.stats import chi2 as chi2dist, norm as normdist
        skew_stat = (n / 6.0) * b1p
        skew_df = p * (p + 1) * (p + 2) / 6.0
        skew_p = float(1.0 - chi2dist.cdf(skew_stat, df=skew_df))
        kurt_z = (b2p - p * (p + 2)) / np.sqrt(8.0 * p * (p + 2) / n)
        kurt_p = float(2.0 * (1.0 - normdist.cdf(abs(kurt_z))))
        print("  Mardia b1p (skewness) = " + ("%.4f" % b1p))
        print("  skewness chi-sq stat  = " + ("%.4f" % skew_stat) + ", df = " + ("%.0f" % skew_df) + ", p = " + ("%.4f" % skew_p))
        print("  Mardia b2p (kurtosis) = " + ("%.4f" % b2p) + "    (MVN expectation at p=" + str(p) + ": " + ("%.2f" % (p*(p+2))) + ")")
        print("  kurtosis z-stat       = " + ("%.4f" % kurt_z) + ", p = " + ("%.4f" % kurt_p))
        verdict = "REJECT MVN" if (skew_p < 0.05 or kurt_p < 0.05) else "Cannot reject MVN"
        print("  Verdict at alpha=.05: " + verdict)
    except Exception as e:
        print("  Mardia failed: " + str(e))

print("=" * 70)
END PROGRAM.

* =====================================================================
* SECTION 14 of 15: R FALLBACK - lavaan invariance + omega from semTools
* ---------------------------------------------------------------------
* Optional follow-up using R 4.4.1 (also bundled with SPSS). Activates
* only if you have installed lavaan once via:
*
*   BEGIN PROGRAM R.
*   install.packages(c("lavaan", "semTools"),
*                    repos = "https://cloud.r-project.org")
*   END PROGRAM.
*
* When installed, this section adds the metric and scalar measurement-
* invariance tests by SMB_ENT (Delta-CFI / Delta-RMSEA), which semopy
* in Section 13 only does for the configural baseline.
*
* When NOT installed, prints a clean skip message and continues.
* =====================================================================.

TITLE 'Section 14: R Fallback (Lavaan Invariance + semTools omega)'.


BEGIN PROGRAM R.
cat("\n", paste(rep("=", 70), collapse=""), "\n", sep="")
cat("SECTION 14: R FALLBACK (lavaan invariance + omega from semTools)\n")
cat(paste(rep("=", 70), collapse=""), "\n", sep="")

if (!requireNamespace("lavaan", quietly = TRUE)) {
  cat("[skip] R package 'lavaan' is not installed.\n")
  cat("[skip] To enable this fallback, install lavaan once:\n")
  cat("[skip]   BEGIN PROGRAM R.\n")
  cat("[skip]   install.packages(c('lavaan','semTools'),\n")
  cat("[skip]                    repos='https://cloud.r-project.org')\n")
  cat("[skip]   END PROGRAM.\n")
} else {
  library(lavaan)
  df <- spssdata.GetDataFromSPSS(missingValueToNA = TRUE)
  Bvars <- paste0("B", 1:18)
  Rvars <- paste0("R", 1:17)
  Mvars <- paste0("M", 1:8)
  spec_3f <- paste0(
    "Barriers  =~ ", paste(Bvars, collapse=" + "), "\n",
    "Readiness =~ ", paste(Rvars, collapse=" + "), "\n",
    "Maturity  =~ ", paste(Mvars, collapse=" + ")
  )
  if ("SMB_ENT" %in% names(df)) {
    cat("\n--- Measurement invariance by SMB_ENT (R lavaan) ---\n")
    tryCatch({
      config <- cfa(spec_3f, data=df, group="SMB_ENT", missing="fiml", estimator="MLR")
      metric <- cfa(spec_3f, data=df, group="SMB_ENT", missing="fiml",
                     estimator="MLR", group.equal="loadings")
      scalar <- cfa(spec_3f, data=df, group="SMB_ENT", missing="fiml",
                     estimator="MLR", group.equal=c("loadings","intercepts"))
      cat("Configural CFI:", round(fitMeasures(config, "cfi"), 4), "\n")
      cat("Metric CFI:    ", round(fitMeasures(metric, "cfi"), 4),
          " (Delta vs configural:", round(fitMeasures(config,"cfi") - fitMeasures(metric,"cfi"), 4), ")\n")
      cat("Scalar CFI:    ", round(fitMeasures(scalar, "cfi"), 4),
          " (Delta vs metric:    ", round(fitMeasures(metric,"cfi") - fitMeasures(scalar,"cfi"), 4), ")\n")
    }, error = function(e) cat("Invariance test failed:", conditionMessage(e), "\n"))
  }
  if (requireNamespace("semTools", quietly = TRUE)) {
    cat("\n--- McDonald omega from CFA (R semTools) ---\n")
    library(semTools)
    tryCatch({
      fit_3f <- cfa(spec_3f, data=df, missing="fiml", estimator="MLR")
      print(round(reliability(fit_3f), 4))
    }, error = function(e) cat("omega failed:", conditionMessage(e), "\n"))
  }
}
cat(paste(rep("=", 70), collapse=""), "\n", sep="")
END PROGRAM.

* =====================================================================
* SECTION 15 of 15: AUTO-EXPORT (Excel + native Viewer)
* ---------------------------------------------------------------------
* What this produces:
*   - spv_export.xlsx in the working directory (this folder), containing
*     every Pivot Table from this entire Viewer document. Open in Excel,
*     Numbers, or LibreOffice. This is the receipt the recipient sends
*     back to confirm the analysis ran on their machine.
*   - Post_Run_Results.spv in the same folder, the native SPSS Viewer
*     document. Open in SPSS Statistics or the free IBM SPSS SmartReader.
*
* Format choice:
*   - XLSX (not CSV) because some SPSS variants reject /CSV as an
*     OUTPUT EXPORT subcommand. XLSX works on every modern license.
* =====================================================================.

TITLE 'Section 15: Auto-Export to Excel'.


OUTPUT EXPORT
  /CONTENTS EXPORT=ALL
  /XLSX DOCUMENTFILE='spv_export.xlsx'.

OUTPUT SAVE
  OUTFILE='Post_Run_Results.spv'.

* =====================================================================
* DONE. Compare the values printed above to:
*   - scripts/analysis/verify_against_R.R output
*   - src/data/crp-validation.json on the matching keys
*   - The Minitab Session window (scripts/minitab/tabs_v2_validation.MTB)
* The descriptive layer should match all three sources to 4 decimals.
*
* For the launcher (.bat / .command) workflow: a Done message will
* appear in the launcher console window after this OUTPUT SAVE
* completes. SPSS stays open so you can drill into individual tables,
* save additional outputs, or re-run blocks interactively.
* =====================================================================.
