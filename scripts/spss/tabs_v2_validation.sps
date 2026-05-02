* =====================================================================
* TABS V2 CRP-200 Validation - SPSS Syntax File
* =====================================================================
*
* Reproduces every analysis the user's SPSS license supports natively
* on the same frozen N=200 dataset that drives the Python and R pipelines.
*
* TARGETED LICENSE (per the user's installed components):
*   Statistics Base, Regression, Advanced Statistics, Categories, Exact
*   Tests, Missing Values, Conjoint, Custom Tables, Complex Samples,
*   Decision Trees, Data Preparation, Forecasting, Neural Networks,
*   Direct Marketing, Bootstrapping.
*
*   NOT IN LICENSE: IBM SPSS Amos. CFA-based statistics (omega from CFA,
*   composite reliability with SEs, bifactor models, second-order CFA,
*   multigroup CFA, measurement invariance, DWLS for ordinal data) cannot
*   be computed in SPSS without Amos. See README.md "Option 2" for the
*   manual-from-EFA-loadings workaround for omega/CR/AVE.
*
* HOW TO RUN:
*   1. Open this file in SPSS (File -> Open -> Syntax).
*   2. Confirm the working directory: Edit -> Options -> File Locations
*      should point to the folder containing tabs_v2_crp200_spss.sav,
*      OR adjust the CD line below to an absolute path.
*   3. Run -> All. Output goes to a new Viewer document.
*
* WHAT THIS COVERS (matches Python pipeline to <=0.001):
*   - Cronbach's alpha + bootstrap 95% CI (Bootstrapping module)
*   - Item-total correlations + alpha-if-deleted (Reliability dialog)
*   - Inter-item correlation matrices per construct
*   - EFA (Maximum Likelihood) with KMO + Bartlett's sphericity
*   - Construct-level Pearson + Spearman correlations
*   - SMB vs Enterprise 2-sample t per construct
*   - Mahalanobis distance via Regression (Statistics Base)
*   - Little's MCAR test (Missing Values module)
*
* NOT COVERED (use the Python pipeline / R verification script):
*   - CFA fit indices, McDonald's omega from CFA, CR with SEs
*   - Bifactor / second-order / multigroup CFA / measurement invariance
*   - HTMT, HTMT2, Tucker congruence, ESEM, DIF, IRT GRM
*   - Mardia / Henze-Zirkler multivariate normality
* =====================================================================.

* --- Load the data -------------------------------------------------.
* If SPSS reports "File not found", change CD to the absolute folder
* path containing tabs_v2_crp200_spss.sav (use forward slashes on
* both Windows and macOS within SPSS syntax).

CD '.'.
GET FILE='tabs_v2_crp200_spss.sav'.
DATASET NAME crp200 WINDOW=FRONT.

* --- Sanity check: row counts + missingness ------------------------.
DESCRIPTIVES VARIABLES=B1 TO B18 R1 TO R17 M1 TO M8
  /STATISTICS=MEAN STDDEV MIN MAX.

* =====================================================================
* BARRIERS RELIABILITY
* Expected (matches Python cronbach_alpha exactly):
*   Cronbach's alpha = 0.873; N listwise = 192
* The BOOTSTRAP /SAMPLING=SIMPLE block uses the user's SPSS Bootstrapping
* module to compute a 95% percentile CI on alpha. Output appears in a
* second table immediately below the standard Reliability output.
* NSAMPLES=1000 matches the Python pipeline's bootstrap_alpha_ci default.
* =====================================================================.

BOOTSTRAP /SAMPLING METHOD=SIMPLE /VARIABLES TARGET=B1 TO B18
  /CRITERIA CILEVEL=95 CITYPE=PERCENTILE NSAMPLES=1000 /MISSING USERMISSING=EXCLUDE.
RELIABILITY VARIABLES=B1 TO B18
  /SCALE('Barriers, 18 items')=ALL
  /MODEL=ALPHA
  /STATISTICS=DESCRIPTIVE SCALE CORR
  /SUMMARY=TOTAL MEANS VARIANCE.

* =====================================================================
* READINESS RELIABILITY (expected alpha = 0.917; N = 181)
* =====================================================================.

BOOTSTRAP /SAMPLING METHOD=SIMPLE /VARIABLES TARGET=R1 TO R17
  /CRITERIA CILEVEL=95 CITYPE=PERCENTILE NSAMPLES=1000 /MISSING USERMISSING=EXCLUDE.
RELIABILITY VARIABLES=R1 TO R17
  /SCALE('Readiness, 17 items')=ALL
  /MODEL=ALPHA
  /STATISTICS=DESCRIPTIVE SCALE CORR
  /SUMMARY=TOTAL MEANS VARIANCE.

* =====================================================================
* MATURITY RELIABILITY (expected alpha = 0.885; N = 191)
* =====================================================================.

BOOTSTRAP /SAMPLING METHOD=SIMPLE /VARIABLES TARGET=M1 TO M8
  /CRITERIA CILEVEL=95 CITYPE=PERCENTILE NSAMPLES=1000 /MISSING USERMISSING=EXCLUDE.
RELIABILITY VARIABLES=M1 TO M8
  /SCALE('Maturity, 8 items')=ALL
  /MODEL=ALPHA
  /STATISTICS=DESCRIPTIVE SCALE CORR
  /SUMMARY=TOTAL MEANS VARIANCE.

* =====================================================================
* EFA - BARRIERS (ML extraction, 2 factors per parallel analysis)
* Includes KMO + Bartlett's sphericity (printed at top of Factor output).
* Expected:
*   KMO = 0.851; Bartlett chi-squared = 1135.51, df = 153, p < 0.001
*   2 factors retained (parallel analysis)
* =====================================================================.

FACTOR
  /VARIABLES B1 TO B18
  /MISSING LISTWISE
  /ANALYSIS B1 TO B18
  /PRINT INITIAL CORRELATION SIG KMO EXTRACTION ROTATION
  /FORMAT SORT BLANK(.30)
  /PLOT EIGEN
  /CRITERIA FACTORS(2) ITERATE(50)
  /EXTRACTION ML
  /ROTATION PROMAX(4)
  /METHOD=CORRELATION.

* =====================================================================
* EFA - READINESS (ML, 1 factor per parallel analysis)
* Expected: KMO = 0.927; Bartlett chi-squared = 1278.99
* =====================================================================.

FACTOR
  /VARIABLES R1 TO R17
  /MISSING LISTWISE
  /ANALYSIS R1 TO R17
  /PRINT INITIAL CORRELATION SIG KMO EXTRACTION
  /FORMAT SORT BLANK(.30)
  /CRITERIA FACTORS(1) ITERATE(50)
  /EXTRACTION ML
  /METHOD=CORRELATION.

* =====================================================================
* EFA - MATURITY (ML, 1 factor per parallel analysis)
* Expected: KMO = 0.912; Bartlett chi-squared = 650.13
* =====================================================================.

FACTOR
  /VARIABLES M1 TO M8
  /MISSING LISTWISE
  /ANALYSIS M1 TO M8
  /PRINT INITIAL CORRELATION SIG KMO EXTRACTION
  /FORMAT SORT BLANK(.30)
  /CRITERIA FACTORS(1) ITERATE(50)
  /EXTRACTION ML
  /METHOD=CORRELATION.

* =====================================================================
* INTER-CONSTRUCT CORRELATIONS (Pearson and Spearman)
* On the construct means (B_mean / R_mean / M_mean). The Python pipeline
* computes these correlations with pairwise complete cases (any row missing
* either construct mean is dropped from that pair only). SPSS's CORRELATIONS
* /MISSING=PAIRWISE matches this behavior. Expected:
*   r(B,R) ~ -0.40, r(B,M) ~ -0.33, r(R,M) ~ +0.73
* =====================================================================.

CORRELATIONS
  /VARIABLES=B_mean R_mean M_mean
  /PRINT=TWOTAIL NOSIG
  /STATISTICS DESCRIPTIVES
  /MISSING=PAIRWISE.

NONPAR CORR
  /VARIABLES=B_mean R_mean M_mean
  /PRINT=SPEARMAN TWOTAIL NOSIG
  /MISSING=PAIRWISE.

* =====================================================================
* SMB vs ENTERPRISE 2-SAMPLE T-TESTS
* SMB_ENT is coded 1=SMB (n~114) and 2=Enterprise (n~86).
* Welch's t (unequal variances) is reported in the second row of the
* Independent Samples Test output.
* =====================================================================.

T-TEST GROUPS=SMB_ENT(1 2)
  /MISSING=ANALYSIS
  /VARIABLES=B_mean R_mean M_mean
  /CRITERIA=CI(.95).

* =====================================================================
* MAHALANOBIS DISTANCE - BARRIERS (via REGRESSION /SAVE)
* SPSS computes Mahalanobis distance as a side effect of REGRESSION
* with an arbitrary dependent. The B_mean dependent gives the same
* squared distances as the Python mahalanobis_outliers function.
* The maximum D-squared appears in Residuals Statistics; the per-case
* values are saved as MAH_1 in the active dataset.
* =====================================================================.

REGRESSION
  /MISSING LISTWISE
  /STATISTICS COEFF OUTS R ANOVA
  /CRITERIA=PIN(.05) POUT(.10)
  /NOORIGIN
  /DEPENDENT B_mean
  /METHOD=ENTER B1 B2 B3 B4 B5 B6 B7 B8 B9 B10 B11 B12 B13 B14 B15 B16 B17 B18
  /SAVE MAHAL.

* Same for Readiness and Maturity --------------------------------------.

REGRESSION
  /MISSING LISTWISE
  /STATISTICS R
  /DEPENDENT R_mean
  /METHOD=ENTER R1 TO R17
  /SAVE MAHAL.

REGRESSION
  /MISSING LISTWISE
  /STATISTICS R
  /DEPENDENT M_mean
  /METHOD=ENTER M1 TO M8
  /SAVE MAHAL.

* =====================================================================
* LITTLE'S MCAR TEST + MISSINGNESS PATTERN ANALYSIS
* (Requires Missing Values module - confirmed in user's license)
* This is the SPSS equivalent of Python's data-quality audit. If MCAR
* p > .05, missingness is plausibly MCAR; otherwise consider FIML or
* multiple imputation rather than listwise deletion.
* =====================================================================.

* CATEGORICAL=NONE was removed: some SPSS variants reject NONE as a
* keyword for /CATEGORICAL. Omitting the subcommand is equivalent
* (SPSS treats all variables as continuous by default).

MVA
  VARIABLES=B1 TO B18 R1 TO R17 M1 TO M8
  /MAXCAT=25
  /MPATTERN
  /TPATTERN PERCENT=1
  /TTESTS PERCENT=5
  /MISSING NEVER
  /EM ( TOLERANCE=0.001 CONVERGENCE=0.0001 ITERATIONS=25 ).

* =====================================================================
* AUTO-EXPORT TO EXCEL
* Writes the entire Viewer document to spv_export.xlsx in the current
* working directory. When launched via Run_Validation.bat/.command the
* launcher prepends an absolute CD so the working directory is the
* extracted folder. Recipients can open the .xlsx in Excel, Numbers, or
* LibreOffice to review every analysis without needing SPSS Viewer.
*
* CSV format is intentionally not used here: some SPSS variants reject
* /CSV as a subcommand on OUTPUT EXPORT. XLSX works on every modern
* SPSS Statistics license.
* =====================================================================.

OUTPUT EXPORT
  /CONTENTS EXPORT=ALL
  /XLSX DOCUMENTFILE='spv_export.xlsx'.

* =====================================================================
* AUTO-SAVE THE VIEWER DOCUMENT
* Saves the entire Viewer to Post_Run_Results.spv in the working
* directory so the recipient has a native SPSS receipt as well as the
* Excel export. Filename is predictable so the launcher script (.bat
* on Windows, .command on macOS) can confirm the run finished.
* =====================================================================.

OUTPUT SAVE
  OUTFILE='Post_Run_Results.spv'.

* =====================================================================
* DONE. Compare these printed values to:
*   - scripts/analysis/verify_against_R.R output
*   - src/data/crp-validation.json on the matching keys
*   - The Minitab Session window (scripts/minitab/tabs_v2_validation.MTB)
* The descriptive layer should match all three sources to 4 decimals.
*
* The accompanying Run_Validation.bat (Windows) and
* Run_Validation.command (macOS) files in this folder open SPSS with
* the syntax preloaded; click Run -> All to execute everything.
* =====================================================================.
