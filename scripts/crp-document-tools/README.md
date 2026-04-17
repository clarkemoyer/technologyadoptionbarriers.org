# CRP Document Tools

Offline tooling used to author, validate, and cross-check the TABS CRP (Culminating Research Project) document and its appendixes. These scripts are **not** part of the website build, are **not** run in CI today, and are intentionally kept separate from `scripts/analysis/` (which contains the live pipeline and IS run in CI).

## Purpose

The CRP document and the TABS website are two representations of the same research. Numbers in the CRP must reconcile against numbers produced by the live analysis pipeline in `scripts/analysis/`. The tools here enforce that reconciliation, construct the merged deliverable, and generate convergence audit reports.

## Folder layout

```
scripts/crp-document-tools/
├── validators/        Static assertion checks against the CRP docx
├── builders/          Document construction (merge, stats computation)
└── convergence/       CRP docx <-> pipeline JSON <-> website reconciliation
```

Each subfolder contains the current top-level scripts plus an `archive/` directory preserving prior versions. The latest version of each script is at the top of its subfolder; historical versions live under `archive/` for traceability.

## Runtime context

These scripts assume:

- A local copy of the CRP workspace folder (`! Clarke Moyer Smeal CRP - TABS/`) on disk with the CRP `.docx`, appendix markdown files, and the frozen CRP CSV
- A local clone of this repo in `/tmp/tabs-site/` (or one of the alternate paths each script tries)
- Python 3.10+ with `python-docx`, `lxml`, `numpy`, `pandas`

They do **not** assume any cloud secrets, API keys, or GitHub authentication. Everything runs locally against files on disk.

## What lives elsewhere

- `scripts/analysis/` - live analysis pipeline (runs in CI, produces `src/data/*.json`)
- `scripts/validate-deck.py` - defense-deck validator (runnable from repo)
- `src/data/crp-validation.json` and `crp-sensitivity-analysis.json` - frozen CRP pipeline outputs (the canonical numbers these validators check CRP docx claims against)

## Privacy note

None of these scripts contain or require PII. They operate on:

- The CRP `.docx` itself (no PII - contains only aggregated statistics)
- The NIST de-identified public CRP dataset (`public/datasets/TABS_V2_CRP_2026_public_dataset.csv`)
- Pipeline-generated JSON files in `src/data/`

PII-containing CSVs (enriched with Prolific demographics, raw Qualtrics exports) are NEVER referenced by these scripts and MUST NEVER be committed to this repo per the project's data rules. See the root `CLAUDE.md` for the full privacy policy.

## When to update which subfolder

| Change type | Subfolder |
|-------------|-----------|
| New statistical claim added to the CRP, needs validation | `validators/` |
| Change to how appendixes merge into the body document | `builders/` |
| CRP number drifted from pipeline number, need to identify gap | `convergence/` |
| Live pipeline output shape changed, affects offline tools | Possibly all three |

## Version history

Each subfolder's `README.md` tracks the version lineage and what changed between revisions.
