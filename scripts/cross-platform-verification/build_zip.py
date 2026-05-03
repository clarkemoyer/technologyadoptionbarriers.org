"""Bundle the cross-platform verification artifacts into per-tool zip files.

Three separate downloads are produced, one per analysis platform, so a
user only grabs what they need for their tool of choice (no need to pull
every package's files when they only have, say, SPSS):

    tabs_v2_validation_spss.zip      ~110 KB   for IBM SPSS Statistics 31.0+
    tabs_v2_validation_minitab.zip   ~62  KB   for Minitab 21+
    tabs_v2_validation_python.zip    ~variable for Python (TABS-native canonical)

Each zip is self-contained for the level of analysis its tool can do:

  - SPSS / Minitab: descriptive layer (Cronbach alpha, KMO, Bartlett, EFA,
    inter-construct correlations, group comparisons, Mahalanobis outliers).
    The CFA-derived statistics (omega from CFA, CR with SEs, AVE, HTMT,
    HTMT2, bifactor, second-order, multigroup, measurement invariance,
    ESEM, IRT GRM, Mardia normality) require an SEM package and stay in
    the Python pipeline.

  - Python (TABS native): the full analysis pipeline. Includes the canonical
    `tabs_v2_validation.py`, the shared `scales.py` module, the parity test
    file that validates every custom statistic against its published source-
    paper formula, the R cross-verification script, and the source dataset.

NOTE ON THE COMMITTED ZIPS: The three zip outputs are intentionally version-
controlled in this repository so a colleague can download any one directly
from the GitHub web UI (or `git archive`) without first cloning and running
this script. This trades a small binary diff per regeneration for a much
lower friction "send this link to my committee member" workflow, which was
the explicit user requirement when the cross-platform verification work was
specced. The zips are generated artifacts - DO NOT hand-edit. Re-run this
script whenever any source file changes.

Usage:
    python scripts/cross-platform-verification/build_zip.py
"""
from __future__ import annotations

import zipfile
from pathlib import Path
from typing import Sequence

REPO_ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = Path(__file__).resolve().parent

# -----------------------------------------------------------------------------
# Bundle definitions
# -----------------------------------------------------------------------------

# Each entry is (source path relative to REPO_ROOT, destination path inside zip).

SPSS_MANIFEST: Sequence[tuple[str, str]] = (
    ("scripts/spss/tabs_v2_crp200_spss.sav", "tabs_v2_crp200_spss.sav"),
    ("scripts/spss/tabs_v2_crp200_spss.csv", "tabs_v2_crp200_spss.csv"),
    ("scripts/spss/tabs_v2_validation.sps", "tabs_v2_validation.sps"),
    ("scripts/spss/README.md", "README_SPSS.md"),
)

MINITAB_MANIFEST: Sequence[tuple[str, str]] = (
    ("scripts/minitab/tabs_v2_crp200_minitab.csv", "tabs_v2_crp200_minitab.csv"),
    ("scripts/minitab/tabs_v2_validation.MTB", "tabs_v2_validation.MTB"),
    # Double-click launchers. Same "0_" prefix as the SPSS bundle so they
    # sort to the top of the extracted folder. Locate Minitab + Python,
    # pre-install semopy, run the SEM companion script, then launch
    # Minitab with the worksheet.
    (
        "scripts/minitab/0_DOUBLE_CLICK_ME_TO_START_WINDOWS.bat",
        "0_DOUBLE_CLICK_ME_TO_START_WINDOWS.bat",
    ),
    (
        "scripts/minitab/0_DOUBLE_CLICK_ME_TO_START_MAC.command",
        "0_DOUBLE_CLICK_ME_TO_START_MAC.command",
    ),
    # SEM companion script: runs CFA / omega / bifactor / Mardia via
    # semopy because Minitab does not support these natively. Output
    # goes to sem_companion_results.txt + .csv alongside Minitab's
    # Session window output, giving Minitab users the same defense-grade
    # validation receipt as SPSS users.
    ("scripts/minitab/tabs_v2_sem_companion.py", "tabs_v2_sem_companion.py"),
    ("scripts/minitab/README.md", "README_MINITAB.md"),
)

PYTHON_MANIFEST: Sequence[tuple[str, str]] = (
    # Source dataset (the canonical input)
    (
        "public/datasets/TABS_V2_CRP_2026_public_dataset.csv",
        "data/TABS_V2_CRP_2026_public_dataset.csv",
    ),
    # Canonical Likert encoding module (single source of truth)
    ("scripts/analysis/scales.py", "scripts/scales.py"),
    # Canonical validation pipeline (the entire module - exposes every custom statistic)
    ("scripts/analysis/tabs_v2_validation.py", "scripts/tabs_v2_validation.py"),
    # Parity test file (16 tests against published formulas + R cross-checks)
    (
        "scripts/analysis/tests/test_parity_to_published_formulas.py",
        "scripts/tests/test_parity_to_published_formulas.py",
    ),
    # R verification script (committee-facing artifact, optional)
    ("scripts/analysis/verify_against_R.R", "scripts/verify_against_R.R"),
    # NOTE: requirements.txt is NOT listed here because it is generated at
    # build time by combining scripts/analysis/requirements.txt (base deps)
    # with scripts/analysis/requirements-validation.txt (EFA/CFA/IRT extras)
    # into a single installable file.  See build_one() / main() below.
)

# -----------------------------------------------------------------------------
# Per-bundle top-level READMEs
# -----------------------------------------------------------------------------

SPSS_README = """# TABS V2 Validation - SPSS Bundle

This zip contains everything an SPSS user needs to independently reproduce
the descriptive + reliability layer of the TABS validation pipeline on the
same frozen N=200 dataset that drives the canonical Python and R analyses.

## Quick start (about 2 clicks once SPSS is open)

1. Unzip into any folder.
2. Open `tabs_v2_validation.sps` in SPSS (`File -> Open -> Syntax`).
3. `Run -> All`. Output appears in a new Viewer document.

If SPSS reports "File not found" for the .sav, set the working directory
to the unzipped folder via `Edit -> Options -> File Locations`.

## Targeted SPSS license

Built for IBM SPSS Statistics 31.0 with Statistics Base + Regression +
Bootstrapping + Missing Values + Advanced Statistics. Without IBM SPSS
Amos, this bundle covers the descriptive + reliability layer only - CFA
fit indices, McDonald's omega from CFA, composite reliability with SEs,
AVE, HTMT/HTMT2, bifactor decompositions, second-order CFA, multigroup CFA,
measurement invariance, ESEM, IRT GRM, and Mardia normality stay in the
Python pipeline (download `tabs_v2_validation_python.zip` for those).

## What's inside

```
tabs_v2_crp200_spss.sav     <- SPSS native binary worksheet (open with double-click)
tabs_v2_crp200_spss.csv     <- same data, CSV form (for sharing or re-import)
tabs_v2_validation.sps      <- syntax file (Run -> All)
README_SPSS.md              <- detailed walkthrough + expected values
```

## Three quick spot-checks that should match exactly

| Stat | Expected |
|---|---|
| Cronbach's alpha (Barriers, 18 items) | 0.873 |
| Cronbach's alpha (Readiness, 17 items) | 0.917 |
| Cronbach's alpha (Maturity, 8 items) | 0.885 |
| Listwise N (Barriers / Readiness / Maturity) | 192 / 181 / 191 |

If any of these disagree with what SPSS prints, the data import is off
(usually missing-value coding); resolve before interpreting anything else.

See `README_SPSS.md` for the complete expected-value table and the menu
paths for KMO + Bartlett (GUI-only options on the Factor Analysis dialog).
"""

MINITAB_README = """# TABS V2 Validation - Minitab Bundle

This zip contains everything a Minitab user needs to independently reproduce
the **full** TABS validation pipeline (descriptive layer in Minitab + SEM
layer via a sibling Python script) on the same frozen N=200 dataset that
drives the canonical Python and R analyses.

## Quick start - one double-click

1. Unzip into any folder.
2. Double-click the launcher for your operating system:
   - **Windows**: `0_DOUBLE_CLICK_ME_TO_START_WINDOWS.bat`
   - **macOS**: right-click `0_DOUBLE_CLICK_ME_TO_START_MAC.command` -> Open
     (one-time Gatekeeper). After the first run, double-click works.
3. The launcher pre-installs `semopy` (~30 sec, first run only) using the
   SPSS-bundled Python if SPSS is installed, else system Python on PATH.
4. The launcher runs `tabs_v2_sem_companion.py` to produce
   `sem_companion_results.txt` + `sem_companion_results.csv` in the same
   folder - these contain CFA fit indices, McDonald's omega, AVE, HTMT/HTMT2,
   bifactor decomposition, multigroup CFA configural baseline, and Mardia
   multivariate normality.
5. The launcher then opens Minitab with the worksheet preloaded.
6. In Minitab: `File -> Run an Exec -> tabs_v2_validation.MTB`

The descriptive + reliability layer (Cronbach alpha, EFA, correlations,
Mahalanobis, t-tests) comes from Minitab's Session window output. The
SEM-derived layer comes from the SEM companion files. Together they give
you the same defense-grade validation receipt as the SPSS bundle, just
produced by two cooperating processes (Minitab + Python).

KMO and Bartlett's sphericity are GUI-only options on Minitab's Factor
Analysis dialog (no session subcommand). To see them, run the Factor
Analysis block manually from the menu and check the boxes in `Options...`.

## Manual fallback (if the launcher cannot find Minitab or Python)

Minitab native analyses:
1. `File -> Open Worksheet -> tabs_v2_crp200_minitab.csv`
2. `File -> Run an Exec -> tabs_v2_validation.MTB -> Run 1 time`

SEM companion:
1. Install Python 3.10+ from https://python.org if you do not have it.
2. From a terminal in this folder:
   ```
   python -m pip install --user numpy pandas scipy semopy
   python tabs_v2_sem_companion.py --csv tabs_v2_crp200_minitab.csv --out-dir .
   ```
3. Open `sem_companion_results.txt` (Notepad / TextEdit) or
   `sem_companion_results.csv` (Excel / Minitab File -> Open Worksheet).

## What's inside

```
0_DOUBLE_CLICK_ME_TO_START_WINDOWS.bat  <- Windows double-click launcher
0_DOUBLE_CLICK_ME_TO_START_MAC.command  <- macOS double-click launcher
tabs_v2_crp200_minitab.csv              <- pre-encoded numeric data
tabs_v2_validation.MTB                  <- Minitab Exec macro
tabs_v2_sem_companion.py                <- SEM analyses via semopy
README_MINITAB.md                       <- detailed walkthrough
README.md                               <- this file
```

## Coverage

| Statistic | Source |
|---|---|
| Cronbach's alpha + ITC + alpha-if-deleted | Minitab Item Analysis |
| Inter-item correlation matrices | Minitab Correlation |
| EFA (ML, Varimax in session, Promax via GUI dialog) | Minitab Factor Analysis |
| Inter-construct Pearson correlations | Minitab Correlation |
| 2-sample t (SMB vs Enterprise) | Minitab TwoSample |
| Mahalanobis outliers per construct | Minitab Outlier Test |
| KMO + Bartlett sphericity | Minitab Factor Analysis (GUI) |
| HTMT + HTMT2 | SEM companion (Python semopy) |
| Single-factor CFA + 3-factor CFA fit indices | SEM companion |
| McDonald omega-1F + CR + AVE | SEM companion |
| Bifactor (G + 3 group factors) -> omega-h, ECV | SEM companion |
| Multigroup CFA configural baseline by SMB_ENT | SEM companion |
| Mardia multivariate normality | SEM companion |

For full Delta-CFI metric/scalar measurement invariance install R lavaan
and use the SPSS bundle's Section 14 (or call lavaan directly).

## Three quick spot-checks that should match exactly

| Stat | Expected |
|---|---|
| Cronbach's alpha (Barriers, 18 items) | 0.873 |
| Cronbach's alpha (Readiness, 17 items) | 0.917 |
| Cronbach's alpha (Maturity, 8 items) | 0.885 |
| Listwise N (Barriers / Readiness / Maturity) | 192 / 181 / 191 |

The SEM companion's CFA Maturity should report CFI = 0.981, RMSEA = 0.057,
matching the canonical `crp-validation.json` to 4 decimals.
"""

PYTHON_README = """# TABS V2 Validation - Python Bundle (TABS Native)

This zip contains the canonical Python pipeline for the TABS validation
workflow plus the parity test suite that validates every custom statistic
against its published source-paper formula. This is the TABS-native
implementation - the source of truth that the SPSS, Minitab, and R
verification artifacts compare against.

## Quick start

```bash
# 1. Unzip into any folder, then:
cd <unzipped-folder>

# 2. Create a virtualenv and install dependencies
python -m venv .venv
source .venv/bin/activate         # macOS / Linux
.venv\\\\Scripts\\\\activate       # Windows
pip install -r requirements.txt

# 3. Run the parity test suite (16 tests, ~3 seconds)
pytest scripts/tests/test_parity_to_published_formulas.py -v

# 4. (Optional) Compute every custom statistic from the canonical pipeline
python scripts/tabs_v2_validation.py data/TABS_V2_CRP_2026_public_dataset.csv
```

If you open the unzipped folder in VS Code, the Python extension will
auto-detect the virtualenv and the test suite will be runnable from the
Test Explorer panel.

## What's inside

```
data/
  TABS_V2_CRP_2026_public_dataset.csv  <- frozen N=200 dataset (the input)
scripts/
  scales.py                            <- canonical Likert encoding module
  tabs_v2_validation.py                <- canonical validation pipeline (~3000 LOC)
  verify_against_R.R                   <- R cross-verification (psych/lavaan/semTools/MVN)
  tests/
    test_parity_to_published_formulas.py <- 16 unit tests vs published formulas
requirements.txt                       <- Python deps (numpy, pandas, scipy,
                                          factor_analyzer, semopy, pingouin, ...)
README.md                              <- this overview document
```

## What's covered (full analysis layer, unlike SPSS / Minitab)

The Python pipeline computes every statistic in the dissertation:

- Cronbach's alpha (with bootstrap CIs) and split-half reliability
- McDonald's omega (1-factor) and bifactor omega-h, omega-t
- Composite reliability (CR) and AVE
- KMO + Bartlett's sphericity, parallel analysis
- EFA (ML extraction, Promax rotation) with proper sphericity tests
- CFA (ML and DWLS/WLSMV estimators) with full fit indices
- HTMT (Henseler 2015) and HTMT2 (Roemer 2021)
- Tucker congruence, Fornell-Larcker discriminant validity
- Mardia + Henze-Zirkler multivariate normality
- Mahalanobis outliers
- IRT graded response model (Samejima 1969)
- Bifactor (general + group factors), second-order CFA, multigroup CFA,
  measurement invariance, ESEM, DIF

## Verification chain

The parity test file in `scripts/tests/` validates every custom function
against the formula from its source paper (Cronbach 1951, Fornell &
Larcker 1981, Henseler 2015, Roemer 2021, Tucker 1951, Mardia 1970,
Spearman 1910, Mahalanobis 1936, McDonald 1999, Zinbarg et al. 2005).
All 16 tests pass on every commit in the source repo's CI.

For an R-side cross-check, install R 4.6.0+ with `psych`, `lavaan`,
`semTools`, `MVN`, and `jsonlite`, then run:

```bash
Rscript scripts/verify_against_R.R \\
  data/TABS_V2_CRP_2026_public_dataset.csv \\
  /tmp/R_results.json
```

Every directly-comparable statistic agrees with the Python output to
<= 0.014 absolute difference.

## Source repository

Generated by `scripts/cross-platform-verification/build_zip.py` in
https://github.com/clarkemoyer/technologyadoptionbarriers.org. Re-download
this zip after any pipeline update.
"""

BUNDLES: Sequence[tuple[str, Sequence[tuple[str, str]], str]] = (
    ("tabs_v2_validation_spss.zip", SPSS_MANIFEST, SPSS_README),
    ("tabs_v2_validation_minitab.zip", MINITAB_MANIFEST, MINITAB_README),
    ("tabs_v2_validation_python.zip", PYTHON_MANIFEST, PYTHON_README),
)


def _combined_requirements() -> str:
    """Combine base + validation requirements into a single installable file."""
    base = (REPO_ROOT / "scripts/analysis/requirements.txt").read_text()
    validation = (REPO_ROOT / "scripts/analysis/requirements-validation.txt").read_text()
    return (
        "# Combined requirements for the TABS validation pipeline\n"
        "# Merges scripts/analysis/requirements.txt (base) and\n"
        "# scripts/analysis/requirements-validation.txt (EFA/CFA/IRT extras).\n"
        "# Install with: pip install -r requirements.txt\n"
        "#\n"
        + base.strip()
        + "\n\n"
        + validation.strip()
        + "\n"
    )


def _add_to_zip(zf: zipfile.ZipFile, src: Path, arcname: str) -> None:
    """Add *src* to *zf* with correct permissions and line endings.

    * ``.command`` / ``.sh`` – stored as Unix-executable (rwxr-xr-x) so the
      +x bit survives extraction on macOS/Linux even when the zip is built on
      Windows (create_system=3, external_attr=0o100755<<16).
    * ``.bat`` / ``.cmd`` – line endings are normalised to CRLF so the file
      runs on all Windows versions regardless of the build platform.
    * Everything else – packaged as-is (no special treatment).
    """
    data = src.read_bytes()
    info = zipfile.ZipInfo(arcname)
    info.compress_type = zipfile.ZIP_DEFLATED

    suffix = src.suffix.lower()
    if suffix in (".command", ".sh"):
        info.create_system = 3  # Unix
        info.external_attr = 0o100755 << 16  # rwxr-xr-x
    elif suffix in (".bat", ".cmd"):
        # Normalise line endings to CRLF: first convert all existing line
        # endings (\r\n or lone \r) to bare \n, then replace every \n with
        # \r\n.  This makes the file run correctly on all Windows versions
        # regardless of the build platform's native line endings.
        data = data.replace(b"\r\n", b"\n").replace(b"\r", b"\n").replace(b"\n", b"\r\n")
    # For all other types, ZipInfo defaults (create_system=0, no exec bit) are fine.

    zf.writestr(info, data)


def build_one(
    zip_name: str,
    manifest: Sequence[tuple[str, str]],
    readme: str,
    extra_strings: "dict[str, str] | None" = None,
) -> Path:
    out_path = OUT_DIR / zip_name
    missing = [src for src, _ in manifest if not (REPO_ROOT / src).exists()]
    if missing:
        raise SystemExit(
            f"Missing required artifacts for {zip_name}:\n  " + "\n  ".join(missing)
        )

    with zipfile.ZipFile(out_path, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        zf.writestr("README.md", readme)
        for src_rel, dest in manifest:
            _add_to_zip(zf, REPO_ROOT / src_rel, dest)
        if extra_strings:
            for dest, content in extra_strings.items():
                zf.writestr(dest, content)

    return out_path


def main() -> None:
    print("Building per-tool cross-platform verification bundles:")
    print()
    # Extra in-memory files to inject per bundle (keyed by zip name substring).
    python_extras = {"requirements.txt": _combined_requirements()}
    for zip_name, manifest, readme in BUNDLES:
        extra = python_extras if "python" in zip_name else None
        out = build_one(zip_name, manifest, readme, extra_strings=extra)
        size_kb = out.stat().st_size / 1024
        print(f"  {zip_name:40s}  {size_kb:>8,.1f} KB")
        with zipfile.ZipFile(out) as zf:
            for info in zf.infolist():
                print(f"    {info.filename:40s}  {info.file_size:>10,} bytes")
        print()


if __name__ == "__main__":
    main()
