# SPSS cross-verification for the TABS validation pipeline

This folder lets an SPSS user reproduce the descriptive + reliability layer
of the TABS validation pipeline on the same frozen N=200 dataset that drives
the Python and R analyses, with as few GUI clicks as possible.

## Targeted SPSS license

Built and tested against this combination of installed components
(IBM SPSS Statistics 31.0):

| Module                  | Used here for                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Statistics Base**     | Cronbach's alpha + alpha-if-deleted (Reliability), EFA + KMO + Bartlett (Factor), Pearson + Spearman correlations, T-Test |
| **Regression**          | Mahalanobis distance (saved via REGRESSION /SAVE MAHAL)                                                                   |
| **Bootstrapping**       | 95% bootstrap percentile CIs around Cronbach's alpha (1000 resamples, matches Python `bootstrap_alpha_ci` default)        |
| **Missing Values**      | Little's MCAR test + missingness pattern analysis (matches the data-quality audit in the Python pipeline)                 |
| **Advanced Statistics** | Available for follow-up GLM / Mixed Models work, not required by the syntax in this folder                                |

**Not in the targeted license: IBM SPSS Amos.** That is the SEM/CFA add-on,
sold separately. Without it, SPSS cannot natively compute confirmatory
factor analysis, McDonald's omega from a CFA, composite reliability with
proper standard errors, bifactor / second-order / multigroup CFA,
measurement invariance testing, or the DWLS/WLSMV estimator for ordinal
data. Workarounds for the omega/CR/AVE values are at the bottom of this
file; for everything else, the recommendation is to cite the Python pipeline
(cross-validated against R via `scripts/analysis/verify_against_R.R`).

## Files in this folder

| File                      | What it is                                                                                                                                                                                                  |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Run_Validation.bat`      | **Windows double-click launcher.** Locates SPSS, runs the syntax in production mode, exports to XLSX, prints Done. Recipient experience: extract zip, double-click this.                                    |
| `Run_Validation.command`  | **macOS double-click launcher.** Same as the .bat but for Macs. Right-click -> Open the first time (Gatekeeper); double-click thereafter.                                                                   |
| `tabs_v2_crp200_spss.sav` | SPSS native binary worksheet (N=200, 47 columns). Variable labels and value labels embedded so the Likert anchors and group names appear in dialogs and output without manual setup.                        |
| `tabs_v2_crp200_spss.csv` | Same data as CSV (for sharing with non-SPSS users).                                                                                                                                                         |
| `tabs_v2_validation.sps`  | SPSS syntax file. Loads the .sav, runs every analysis the targeted license supports natively, writes results to a Viewer document, then auto-exports to `spv_export.xlsx` and saves `Post_Run_Results.spv`. |
| `build_spss_artifacts.py` | Python regenerator. Re-run if the source dataset changes.                                                                                                                                                   |

## Easiest workflow - one double-click

1. **Extract the zip** into any folder (Desktop, Documents, anywhere).
2. **Double-click the launcher for your operating system:**
   - **Windows**: `Run_Validation.bat`
   - **macOS**: right-click `Run_Validation.command` -> Open (one-time
     Gatekeeper approval). After the first run, double-click works.
3. **Wait about 60 seconds.** A console window shows progress; SPSS runs
   headlessly in production mode (no manual clicks).
4. **When you see "DONE"**, the same folder now contains:
   - `spv_export.xlsx` - all SPSS tables in Excel format (open in Excel,
     Numbers, or LibreOffice)
   - `Post_Run_Results.spv` - native SPSS Viewer document (open in SPSS or
     the free IBM SPSS SmartReader)

The launcher locates SPSS automatically by checking the standard install
locations. If it cannot find SPSS (because it's installed somewhere
unusual), it falls back to printing instructions for opening the syntax
file manually.

## Manual workflow (if you prefer the GUI, or the launcher cannot find SPSS)

1. **Drop both files into the same folder** on your machine. The .sps uses
   a relative path (`CD '.'.`) so it can find the .sav as long as they are
   side-by-side and SPSS's working directory is the same folder.
2. **Open the syntax file:** `File -> Open -> Syntax -> tabs_v2_validation.sps`.
3. **Run -> All**. Output appears in a new Viewer window. The syntax
   automatically writes `spv_export.xlsx` and `Post_Run_Results.spv` into
   the working directory at the end.

If SPSS reports "File not found" for the .sav, change the working
directory: `Edit -> Options -> File Locations -> Last folder used`, OR edit
the `CD` line at the top of the syntax file to an absolute path.

## What the syntax reproduces

Each block prints expected values in its header comment so you can spot-check
against the Python pipeline.

| Analysis                                    | SPSS command                                                                              | Expected value (CRP-200)                                 |
| ------------------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Sanity check (means + SDs)                  | `DESCRIPTIVES VARIABLES=B1 TO B18 R1 TO R17 M1 TO M8`                                     | per-item descriptives                                    |
| Cronbach's alpha (Barriers) + bootstrap CI  | `BOOTSTRAP ... /VARIABLES TARGET=B1 TO B18 ... RELIABILITY ...`                           | alpha = 0.873; N = 192                                   |
| Cronbach's alpha (Readiness) + bootstrap CI | same with `R1 TO R17`                                                                     | alpha = 0.917; N = 181                                   |
| Cronbach's alpha (Maturity) + bootstrap CI  | same with `M1 TO M8`                                                                      | alpha = 0.885; N = 191                                   |
| Item-total correlations                     | (in Reliability output, `/SUMMARY=TOTAL`)                                                 | per-item ITC                                             |
| Alpha-if-deleted                            | (in Reliability output, `/SUMMARY=TOTAL`)                                                 | per-item alpha-if-removed                                |
| EFA Barriers (ML, 2 factors)                | `FACTOR /VARIABLES B1 TO B18 ... /CRITERIA FACTORS(2) /EXTRACTION ML /ROTATION PROMAX(4)` | KMO=0.851; Bartlett chi-squared=1135.51                  |
| EFA Readiness (ML, 1 factor)                | same with `R1 TO R17`                                                                     | KMO=0.927; Bartlett chi-squared=1278.99                  |
| EFA Maturity (ML, 1 factor)                 | same with `M1 TO M8`                                                                      | KMO=0.912; Bartlett chi-squared=650.13                   |
| Inter-construct Pearson r                   | `CORRELATIONS /VARIABLES=B_mean R_mean M_mean`                                            | r(B,R) ~ -0.40; r(B,M) ~ -0.33; r(R,M) ~ +0.73           |
| Inter-construct Spearman rho                | `NONPAR CORR /VARIABLES=B_mean R_mean M_mean /PRINT=SPEARMAN`                             | similar pattern, rank-based                              |
| 2-sample t (SMB vs ENT) per construct       | `T-TEST GROUPS=SMB_ENT(1 2) /VARIABLES=B_mean R_mean M_mean`                              | per-construct group difference                           |
| Mahalanobis outliers (Barriers)             | `REGRESSION /DEPENDENT B_mean /METHOD=ENTER B1 TO B18 /SAVE MAHAL`                        | max D-squared in Residuals Statistics; per-case in MAH_1 |
| Mahalanobis outliers (Readiness)            | same with `R_mean` and `R1 TO R17`                                                        | same                                                     |
| Mahalanobis outliers (Maturity)             | same with `M_mean` and `M1 TO M8`                                                         | same                                                     |
| **Little's MCAR test**                      | `MVA VARIABLES=B1 TO B18 R1 TO R17 M1 TO M8 /MPATTERN /TPATTERN`                          | chi-squared, df, p; MCAR plausibility                    |

## Optional add-ons (free, work with your license)

These are widely-used third-party SPSS macros that fill gaps in base SPSS
without requiring AMOS. All are free academic downloads.

| Macro                          | What it adds                                                                                                                                                                        | Source                                                                   |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **PROCESS macro (Hayes)**      | Mediation, moderation, conditional process analysis with bootstrap CIs. Replaces the Python pipeline's `mediation_b_r_m` for the Barriers -> Readiness -> Maturity indirect effect. | https://processmacro.org                                                 |
| **O'Connor parallel analysis** | Horn's parallel analysis (suggests how many factors to extract). Confirms the 2 / 1 / 1 factor count Python's `parallel_analysis` returns.                                          | https://people.ok.ubc.ca/brioconn/nfactors/nfactors.html                 |
| **HTMT macro (Henseler)**      | HTMT (Henseler 2015) discriminant-validity ratio. The Python pipeline computes both HTMT and HTMT2 (Roemer 2021); this SPSS macro covers HTMT only.                                 | Available on the author's website; search for "HTMT SPSS macro Henseler" |

After installing a macro into SPSS's macro library, you can call it from a
new syntax block within `tabs_v2_validation.sps` if you want all results in
one Viewer document.

## What you cannot do natively (and what to do about it)

### CFA-derived statistics (omega from CFA, CR with SEs, AVE, HTMT2, bifactor, second-order, multigroup CFA, measurement invariance, ESEM, IRT GRM, Mardia normality, Tucker congruence)

These all require either:

- AMOS (covers ML CFA, bifactor with manual constraints, multigroup, but NOT DWLS/WLSMV, NOT HTMT2, NOT IRT GRM, NOT ESEM)
- OR Mplus (covers everything in the Python pipeline)
- OR the Python pipeline + R verification script already in this repo

Recommended: in the dissertation methods section, add one paragraph like:

> "Cronbach's alpha, KMO, Bartlett's sphericity, exploratory factor analysis,
> inter-construct correlations, group comparisons, and Little's MCAR test were
> independently verified in IBM SPSS Statistics 31.0 (Statistics Base + Regression + Bootstrapping + Missing Values modules); see `scripts/spss/`. CFA fit indices,
> McDonald's omega, composite reliability, AVE, HTMT, HTMT2, bifactor decomposition,
> and IRT graded response models were computed in Python (semopy 2.3) and
> cross-validated in R (lavaan 0.6.21, semTools 0.5.8, psych 2.6.3); see
> `scripts/analysis/`. Without IBM SPSS Amos, these CFA-based statistics are
> not natively computable in SPSS and were therefore not re-derived there."

### Manual workaround for omega, CR, AVE, Tucker congruence in SPSS

If you want to do _something_ in SPSS for the CFA-based reliability stats:
SPSS Factor Analysis can store standardized loadings to the worksheet. Use
the EFA loadings from the Factor commands in the syntax file (which are
stored when you check the `Save scores` option in the dialog), then compute:

| Stat                                                          | Formula in `Compute Variable` (Transform -> Compute Variable) |
| ------------------------------------------------------------- | ------------------------------------------------------------- |
| Sum of loadings (for one factor's loadings in column `L`)     | `SUM(L)` (use Aggregate first if needed)                      |
| **McDonald's omega-1F** = **CR**                              | `(SUM(L))**2 / ((SUM(L))**2 + SUM(1 - L**2))`                 |
| **AVE**                                                       | `MEAN(L**2)`                                                  |
| **Tucker congruence** between two loading vectors `A` and `B` | `SUM(A*B) / (SQRT(SUM(A**2)) * SQRT(SUM(B**2)))`              |

These manually-computed values match the Python pipeline to 4 decimals when
fed identical standardized loadings.

### If you get AMOS access later

The CFA models specified in the Python pipeline can be drawn in AMOS as
follows. (Each is also a known model spec in `lavaan` syntax; Mplus syntax
is similar.)

| Model                 | Latent factors                                                                                                                                                            | Items                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| Maturity 1F           | `Maturity`                                                                                                                                                                | M1-M8                 |
| Readiness 1F          | `Readiness`                                                                                                                                                               | R1-R17                |
| Barriers 1F           | `Barriers`                                                                                                                                                                | B1-B18                |
| Barriers 2F           | `F1` (B1-B12, B15, B17), `F2` (B13, B14, B16, B18); free covariance                                                                                                       | EFA-derived           |
| Barriers 3F           | `F1a` (B1, B2, B3, B5, B9, B10, B11, B15, B17), `F1b` (B4, B6, B7, B8, B12), `F2` (B13, B14, B16, B18); free covariances                                                  | canonical             |
| Joint 3-construct     | `Barriers`, `Readiness`, `Maturity`; free covariances                                                                                                                     | all 43 items          |
| Bifactor Barriers     | general factor `G` on all 18 items; group factors `F1aS` (same items as F1a above), `F1bS`, `F2S`; constrain all G-x-group covariances and group-x-group covariances to 0 | for omega-h / omega-t |
| Bifactor R+M          | `G` on R1-R17 and M1-M8; group factors `RS` and `MS`; constrain G-RS, G-MS, RS-MS covariances to 0                                                                        | for ECV               |
| Second-order Barriers | first-order factors F1a / F1b / F2; second-order factor `Barriers` on those three                                                                                         | hierarchical          |

Run with ML estimator. AMOS does not natively support DWLS/WLSMV; for
that, use Mplus or the Python pipeline.

## Verifying alignment

After running the syntax, three quick checks should match exactly:

1. **Listwise N in each Reliability output**: 192 / 181 / 191 for B / R / M.
2. **Cronbach's alpha values**: 0.873 / 0.917 / 0.885.
3. **KMO + Bartlett values** in each Factor output: 0.851 / 0.927 / 0.912 for KMO; chi-squared values 1135.51 / 1278.99 / 650.13.

If any of these disagree with the Python output, the data import is off
(usually a missing-value coding issue); resolve before interpreting the
rest of the SPSS output.

## Regenerating the .sav from source

If `public/datasets/TABS_V2_CRP_2026_public_dataset.csv` changes, re-run
the encoder:

```bash
python scripts/spss/build_spss_artifacts.py
```

Requires `pyreadstat>=1.3` (Python). The encoder uses the exact same scale
dictionaries as `load_crp200` in `scripts/analysis/tabs_v2_validation.py`,
so the Likert-to-numeric mapping is byte-stable across all three platforms
(Python, R, SPSS).
