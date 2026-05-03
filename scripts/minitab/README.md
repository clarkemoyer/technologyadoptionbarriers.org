# Minitab cross-verification for the TABS validation pipeline

This folder lets a Minitab user reproduce the descriptive layer of the TABS
validation pipeline (Cronbach's alpha, KMO, Bartlett, EFA, inter-construct
correlations, outliers, group comparisons) on the same frozen N=200 dataset
that drives the Python and R analyses. The CFA-based statistics
(McDonald's omega, composite reliability, AVE, HTMT, bifactor) are not
supported natively by Minitab; workaround formulas are at the bottom of this
file.

## Files in this folder

| File                                     | What it is                                                                                                                                                                                                                                                                  |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `0_DOUBLE_CLICK_ME_TO_START_WINDOWS.bat` | **Windows double-click launcher.** Locates Minitab + Python, pre-installs `semopy`, runs the SEM companion script, then opens Minitab with the worksheet preloaded.                                                                                                         |
| `0_DOUBLE_CLICK_ME_TO_START_MAC.command` | **macOS double-click launcher.** Same as the .bat for Macs. Right-click -> Open the first time (Gatekeeper); double-click thereafter.                                                                                                                                       |
| `tabs_v2_crp200_minitab.csv`             | Pre-encoded numeric CSV (N=200, 48 columns). Likert text labels converted to integers 1-5 using the same mapping the Python pipeline uses; analysis columns renamed to short codes (B1-B18, R1-R17, M1-M8); construct means and an SMB-vs-Enterprise grouping column added. |
| `tabs_v2_validation.MTB`                 | Minitab Exec macro that runs every analysis Minitab supports natively.                                                                                                                                                                                                      |
| `tabs_v2_sem_companion.py`               | **SEM companion script.** Runs CFA / omega / bifactor / multigroup / Mardia via `semopy` (Minitab does not support these natively). Writes `sem_companion_results.txt` and `.csv` alongside Minitab's Session output.                                                       |
| `build_minitab_csv.py`                   | Python script that regenerates the CSV from `public/datasets/TABS_V2_CRP_2026_public_dataset.csv`. Re-run if the source dataset changes.                                                                                                                                    |

## Easiest workflow - one double-click

1. **Extract the zip** into any folder (Desktop, Documents, anywhere).
2. **Double-click the launcher for your operating system:**
   - **Windows**: `0_DOUBLE_CLICK_ME_TO_START_WINDOWS.bat`
   - **macOS**: right-click `0_DOUBLE_CLICK_ME_TO_START_MAC.command` -> Open (one-time Gatekeeper).
3. **The launcher does the prep:**
   - Locates Minitab + a Python interpreter (preferring SPSS-bundled Python if present, else system `python` / `python3` on PATH)
   - Pre-installs `semopy` + dependencies (~30-90 sec, first run only)
   - Runs `tabs_v2_sem_companion.py` which writes `sem_companion_results.txt` + `.csv`
   - Opens Minitab with the worksheet preloaded
4. **In Minitab**: `File -> Run an Exec -> tabs_v2_validation.MTB -> Run 1 time`. Native Minitab output appears in the Session window (~20-30 sec).
5. **Open both result files** to see the full validation receipt:
   - Minitab Session output (descriptive + reliability layer)
   - `sem_companion_results.txt` (CFA / omega / bifactor / Mardia)

## Manual workflow (if the launcher cannot find Minitab or Python)

Minitab native analyses:

1. **Open the worksheet:** in Minitab, `File -> Open Worksheet -> tabs_v2_crp200_minitab.csv`.
2. **Run the macro:** `File -> Run an Exec -> tabs_v2_validation.MTB -> Run 1 time`.

SEM companion:

```bash
python -m pip install --user numpy pandas scipy "semopy==2.3.11"
python tabs_v2_sem_companion.py --csv tabs_v2_crp200_minitab.csv --out-dir .
```

Open `sem_companion_results.txt` (Notepad / TextEdit) or `sem_companion_results.csv` (Excel / Minitab `File -> Open Worksheet`).

The macro intentionally does NOT generate plots, save graphs, or modify the worksheet. Everything goes to the Session window so you can copy results into a comparison spreadsheet.

## What the macro reproduces (matches Python/R to <=0.001)

| Analysis                     | Minitab command                                                 | Menu path                               | Expected value                                                                                                                           |
| ---------------------------- | --------------------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Cronbach's alpha (Barriers)  | `ItemAnal 'B1'-'B18'.`                                          | Stat -> Multivariate -> Item Analysis   | 0.873                                                                                                                                    |
| Cronbach's alpha (Readiness) | `ItemAnal 'R1'-'R17'.`                                          | same                                    | 0.917                                                                                                                                    |
| Cronbach's alpha (Maturity)  | `ItemAnal 'M1'-'M8'.`                                           | same                                    | 0.885                                                                                                                                    |
| Item-total correlations      | (in Item Analysis output)                                       | same                                    | per-item ITC values                                                                                                                      |
| Alpha-if-deleted             | (in Item Analysis output)                                       | same                                    | per-item alpha-if-removed                                                                                                                |
| Inter-item correlations      | `Correlation 'B1'-'B18'.`                                       | Stat -> Basic Statistics -> Correlation | full matrix                                                                                                                              |
| EFA Barriers (2 factors)     | `Factor 18 'B1'-'B18'; Method ML; NFactor 2; Rotation Varimax.` | Stat -> Multivariate -> Factor Analysis | **Varimax ≠ Python Promax**: session commands don't support Promax; use GUI dialog (Options → Rotation: Promax) for exact loading parity |
| EFA Readiness (1 factor)     | `Factor 17 'R1'-'R17'; Method ML; NFactor 1.`                   | same                                    | matches Python loadings                                                                                                                  |
| EFA Maturity (1 factor)      | `Factor 8 'M1'-'M8'; Method ML; NFactor 1.`                     | same                                    | matches Python loadings                                                                                                                  |
| Inter-construct correlations | `Correlation 'B_mean' 'R_mean' 'M_mean'.`                       | Stat -> Basic Statistics -> Correlation | r(B,R) ~ -0.40; r(B,M) ~ -0.33; r(R,M) ~ +0.73                                                                                           |
| 2-sample t (SMB vs ENT)      | `TwoSample 'X_mean' 'SMB_ENT'.`                                 | Stat -> Basic Statistics -> 2-Sample t  | per-construct group difference                                                                                                           |
| Mahalanobis outliers         | `Outlier 'B1'-'B18'.`                                           | Stat -> Multivariate -> Outlier Test    | largest D-squared + critical chi-squared                                                                                                 |

### Important menu-only options

A few statistics are computable by Minitab but only via the GUI dialog (no
session subcommand). If you want these in your output, run the corresponding
block from the menu rather than the macro:

| Stat                        | Menu path                               | Where to enable                                                                           |
| --------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------- |
| **KMO** (sampling adequacy) | Stat -> Multivariate -> Factor Analysis | `Options...` -> check `Kaiser-Meyer-Olkin (KMO) measure of sampling adequacy`             |
| **Bartlett's sphericity**   | Same dialog                             | `Options...` -> check `Bartlett's test of sphericity`                                     |
| **Promax rotation**         | Same dialog                             | `Options...` -> Rotation: `Promax` (default exponent kappa=4 matches `factor_analyzer`)   |
| **Parallel analysis**       | NOT in base Minitab                     | Use the third-party macro `%PARALLEL` (Minitab support library) or trust the Python value |

Expected KMO/Bartlett values (run from the menu to see them):

| Construct | KMO   | Bartlett chi-squared | df  | p-value |
| --------- | ----- | -------------------- | --- | ------- |
| Barriers  | 0.851 | 1135.51              | 153 | < 0.001 |
| Readiness | 0.927 | 1278.99              | 136 | < 0.001 |
| Maturity  | 0.912 | 650.13               | 28  | < 0.001 |

## What Minitab does NOT support (and how to handle it)

Minitab is a general-purpose stats package; it does not implement structural
equation modeling, so the CFA-based statistics central to PR #1837 cannot be
computed natively. Three options:

### Option 1 (recommended) - cite Python/R for these in the dissertation

Reference `src/data/crp-validation.json` (committed in this repo) and the
`scripts/analysis/verify_against_R.R` cross-validation. A typical methods
paragraph: "CFA fit indices, McDonald's omega, composite reliability, AVE,
HTMT, and bifactor decompositions were computed in Python (semopy 2.3) and
cross-validated in R (lavaan 0.6.21, semTools 0.5.8, psych 2.6.3). Minitab
does not natively support confirmatory factor analysis."

### Option 2 - manual computation in Minitab from EFA loadings

Minitab's Factor Analysis dialog can store standardized loadings to a column
(`Storage -> Factor coefficients`). Once you have them in a worksheet column,
you can compute reliability statistics with `Calc -> Calculator`:

| Stat                                                            | Formula (assuming loadings in column `LOAD`)                 |
| --------------------------------------------------------------- | ------------------------------------------------------------ |
| **McDonald's omega-1F**                                         | `(SUM('LOAD'))**2 / ((SUM('LOAD'))**2 + SUM(1 - 'LOAD'**2))` |
| **Composite reliability (CR)**                                  | identical to omega-1F formula above                          |
| **AVE**                                                         | `MEAN('LOAD'**2)`                                            |
| **Tucker congruence** (between two loading vectors `A` and `B`) | `SUM('A'*'B') / SQRT(SUM('A'**2) * SUM('B'**2))`             |

These manually-computed values should match the Python/R outputs to 4
decimal places when fed the same standardized loadings.

### Option 3 - HTMT and HTMT2 from inter-item correlations

Both can be computed in Minitab with a few `Calc -> Calculator` formulas
once you have the inter-item correlation matrix from
`Correlation 'B1'-'B18' 'R1'-'R17' 'M1'-'M8'.` Use `Storage` to save the
matrix to a worksheet, then:

```
HTMT (Henseler 2015 - arithmetic mean):
    HTMT_AB = mean(|cross-construct correlations|) /
              sqrt(mean(|within-A correlations|) * mean(|within-B correlations|))

HTMT2 (Roemer, Schuberth & Henseler 2021 - geometric mean):
    HTMT2_AB = exp(mean(log(|cross-construct correlations|))) /
               sqrt(exp(mean(log(|within-A|))) * exp(mean(log(|within-B|))))
```

The Python implementations in `scripts/analysis/tabs_v2_validation.py`
(`htmt_ratio` and `htmt2_ratio`) are the reference. Expected values for
CRP-200 are in `src/data/crp-validation.json` under the `htmt` key.

### Option 4 - what cannot be done at all in Minitab

These genuinely require an SEM package (lavaan, semopy, AMOS, Mplus); there
is no manual workaround in Minitab:

- Confirmatory factor analysis with proper standard errors and fit indices
- DWLS / WLSMV estimator for ordinal data
- Bifactor models with explicit orthogonality constraints
- Second-order factor models
- Multigroup CFA and measurement invariance testing
- IRT graded response model (Samejima 1969)
- ESEM with target rotation
- Mardia's multivariate skewness/kurtosis (Henze-Zirkler may exist in
  Minitab 22+; Mardia does not)
- Differential item functioning across groups

For all of these, the existing `crp-validation.json` and
`verify_against_R.R` outputs are the authoritative source.

## Verifying alignment

After running the macro, you can spot-check that Minitab is computing the
same data the rest of the pipeline sees:

1. **Listwise N** - Minitab's Item Analysis output reports the number of
   complete cases per construct. Expected: Barriers 192, Readiness 181,
   Maturity 191. If you see different numbers, check that blank cells in
   `tabs_v2_crp200_minitab.csv` were imported as missing (Minitab default).

2. **Cronbach's alpha** - the three values printed in the Session window
   should match Python's `cronbach_alpha` to four decimal places. If not,
   check that columns B1-B18 etc. are typed as numeric (Minitab worksheet
   column header should show `C1` not `C1-T`).

3. **Pearson r between construct means** - the 3x3 correlation matrix at
   the bottom of the macro output should show r(R,M) approximately 0.73 and
   r(B,R) and r(B,M) both negative (around -0.40 and -0.33 respectively).
   This sign pattern (Barriers negatively correlated with both
   Readiness and Maturity) is the substantive finding of the dissertation.
   Note: Python's `construct_correlations` key in `crp-validation.json` reports
   slightly different values (around -0.38, -0.32, +0.72) because it uses a
   different sub-sample filter; both are consistent with the same finding.

If any of these three checks disagrees with the Python output, something is
off with the data import; do not interpret the rest of the Minitab output
until that's resolved.

## Regenerating the CSV from source

If `public/datasets/TABS_V2_CRP_2026_public_dataset.csv` changes, re-run
the encoder:

```bash
python scripts/minitab/build_minitab_csv.py
```

This re-applies the Likert-to-numeric mapping, recomputes the construct
means, and overwrites `tabs_v2_crp200_minitab.csv`. The encoder uses the
exact same scale dictionaries as `load_crp200` in
`scripts/analysis/tabs_v2_validation.py`, so output is byte-stable up to
floating-point representation.
