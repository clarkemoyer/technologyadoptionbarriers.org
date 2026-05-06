# CRP Document Tools

Offline tooling that authors, validates, and cross-checks the TABS CRP (Culminating Research Project) document and its appendixes against the pipeline-generated numbers on this site. These scripts are intentionally separate from `scripts/analysis/` (the live, CI-run analysis pipeline).

## Why this subtree exists (the reproducibility motivation)

A research-grade dissertation needs to defend numerical claims long after the original analyst is unavailable. Word documents drift from analytical truth in two ways:

1. **The author copies a number into the prose, then later regenerates the analysis but forgets to update the prose.** The Word doc and the analysis disagree, and nobody notices until a committee member spot-checks one statistic.
2. **The author moves to a new machine, the original analysis environment is lost, and there is no record of how each cited number was produced.** The dissertation contains numbers nobody can reproduce.

The tools in this subtree address both failure modes:

- **Validators** assert that every quantitative claim in the CRP `.docx` matches the value computed by the pipeline. The `validate_crp_stats_v5.py` validator runs 277 checks across 42 categories. If you edit the CRP and accidentally introduce a typo (`alpha = .87` when the pipeline says `.86`), the validator catches it.
- **Builders** regenerate the merged CRP `.docx` from the body document plus four appendix markdown files in a deterministic, scripted way - no manual copy-paste assembly that can drift between revisions.
- **Convergence checkers** reconcile three sources of truth: the CRP `.docx`, the pipeline JSON committed to this repo, and the live website. When a number diverges across surfaces, the convergence script localises the gap to one specific claim.

If this repo is the only thing left, anyone with Python and a CRP `.docx` can re-run every validator and rebuild the merged document. That is the reproducibility guarantee. The discovery in `paths.py` is what enables that guarantee on a fresh machine.

## Quickstart for Researchers

You do **not** need to be a TABS contributor to use this method. The pattern - "validators that assert claims in a Word document match values from a separate analysis" - works for any dissertation, white paper, or research report.

### What you need

1. Python 3.10 or newer
2. A clone of this repo (or just the `scripts/crp-document-tools/` subfolder)
3. A "workspace" folder on your local machine containing your research artifacts. The TABS layout is:

   ```
   <workspace-root>/
     01 CRP Body/                              # The Word document
       Clarke Moyer - DBA CRP - Body (...).docx
     02 CRP Appendixes/                        # Markdown source for appendixes
       A_TABS_Survey_Instrument_(...).md
       B_TABS_Research_Platform_(...).md
       C_Data_Analysis_and_Validation_(...).md
       D_Institutional_Governance_(...).md
     05 TABS Survey Support/
       TABS Survey Data/
         <enriched_survey_data>.csv
   ```

   Adapt the folder names to your project. The discovery layer in `paths.py` documents which subfolder names each script looks for.

### Telling the scripts where your workspace lives

Three options, in order of precedence:

| Method                  | Example                                                         | When to use                                                      |
| ----------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------- |
| `--workspace` flag      | `python validate_crp_stats_v5.py --workspace ~/my-dissertation` | One-off run, or scripting against multiple workspaces            |
| `CRP_WORKSPACE` env var | `export CRP_WORKSPACE=~/my-dissertation` then run any script    | You usually work against the same workspace                      |
| Auto-discovery          | `python validate_crp_stats_v5.py`                               | Workspace is at `~/Documents/CRP-workspace` or `~/CRP-workspace` |

If none of those exist, the scripts try the legacy session paths the original author uses inside Claude.ai, and finally fall back to a bundled fixture (see below). If everything fails, you get a clear `CrpWorkspaceNotFound` error pointing back here.

### Try it without your own workspace

A small synthetic workspace ships under `fixtures/example_workspace/`. Run any script with no arguments and it will fall through to that fixture:

```bash
cd scripts/crp-document-tools
python builders/compute_crp_stats_v2.py
```

That gives you a working end-to-end example - the script prints the same kind of statistical summary it would produce against a real workspace, only on synthetic data with known ground-truth values you can sanity-check.

### Adapting this method to your own project

To validate claims in _your_ document against _your_ analysis:

1. Replace the construct definitions in `compute_crp_stats_v2.py` (`BARRIER_COLS`, `READINESS_COLS`, `MATURITY_COLS`, etc.) with your own variables.
2. Replace the assertion catalog in `validate_crp_stats_v5.py` (the 277 hardcoded checks) with the claims your document makes.
3. Keep the `paths.py` module as-is - the workspace discovery pattern is project-agnostic.
4. Optional: write a `convergence/` script that reconciles your document text against your analysis output, modeled on `crp_convergence_check.py`.

The point of the framework is the _pattern_, not the specific TABS scales. The pattern: a validator script that runs `python validate.py` on every commit and red-flags any drift between document and analysis is the equivalent of unit tests for prose.

## Folder layout

```
scripts/crp-document-tools/
├── paths.py              Shared workspace discovery (start here)
├── fixtures/             Synthetic example workspace for trying scripts
├── validators/           Static assertion checks against the CRP docx
├── builders/             Document construction (merge, stats computation)
└── convergence/          CRP docx <-> pipeline JSON <-> website reconciliation
```

Each subfolder contains the current top-level scripts plus an `archive/` directory preserving prior versions. The latest version of each script is at the top of its subfolder; historical versions live under `archive/` for traceability and methodological evolution.

## CI smoke test

A fixture-driven smoke test runs in CI via `.github/workflows/crp-tools-smoke.yml` on every PR and push that touches `scripts/crp-document-tools/**`. The smoke test runs `compute_crp_stats_v2.py` and `fixtures/build_example_workspace.py` against the bundled synthetic fixture in `fixtures/example_workspace/` - no private workspace and no CRP `.docx` required.

Scripts that need a real CRP `.docx` (the validators and convergence checkers) run locally only; they are not exercised by the CI smoke test.

## Runtime context

These scripts assume:

- A local copy of the CRP workspace folder (or the bundled fixture for trying things out)
- Python 3.10+ with `python-docx`, `lxml`, `numpy`, `pandas`, `scipy` (validators), `pypdf` (validate_appendixes.py only), `pytz`/`zoneinfo` (builders timestamps)
- A local clone of this repo (for cross-referencing pipeline JSON in `src/data/`)

They do **not** assume any cloud secrets, API keys, or GitHub authentication. Everything runs locally against files on disk.

## What lives elsewhere

- `scripts/analysis/` - live analysis pipeline (runs in CI, produces `src/data/*.json`)
- `scripts/validate-deck.py` - defense-deck validator (runnable from repo)
- `src/data/crp-validation.json` and `crp-sensitivity-analysis.json` - frozen CRP pipeline outputs (the canonical numbers these validators check CRP docx claims against)

## Privacy note

These scripts do not hard-code any PII or credentials. They operate on:

- The CRP `.docx` itself (no PII - contains only aggregated statistics)
- Pipeline-generated JSON files in `src/data/`
- A potentially-enriched CSV from the local workspace, used only when present

Where a script may use an enriched CRP dataset (e.g., `validate_crp_stats_v5.py` tries `*Enriched_CRP200*.csv` before falling back to the public dataset), that enriched file lives only in the local CRP workspace and is **never committed to this repo**. The public dataset (`TABS_V2_CRP_2026_public_dataset.csv`) is the safe default and the only CSV form that may be committed. See the root `CLAUDE.md` for the full privacy policy.

## When to update which subfolder

| Change type                                                   | Subfolder          |
| ------------------------------------------------------------- | ------------------ |
| New statistical claim added to the CRP, needs validation      | `validators/`      |
| Change to how appendixes merge into the body document         | `builders/`        |
| CRP number drifted from pipeline number, need to identify gap | `convergence/`     |
| Live pipeline output shape changed, affects offline tools     | Possibly all three |
| Workspace layout or discovery rule changed                    | `paths.py`         |

## Version history

Each subfolder's `README.md` tracks the version lineage and what changed between revisions. The `archive/` subdirectories preserve the methodological evolution itself, so a researcher reading the repo a year from now can see how the validator coverage grew from ~80 to 277 checks over five iterations.
