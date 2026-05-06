# Example Workspace Fixture

A small synthetic workspace under `example_workspace/` exists so anyone can run the crp-document-tools end-to-end without access to the real (private) CRP workspace. It is the "Try it without your own workspace" path documented in the parent README's Quickstart section.

## What's here

```
fixtures/
├── README.md                      # this file
├── build_example_workspace.py     # regenerates the fixture from scratch
└── example_workspace/
    ├── 01 CRP Body/               # placeholder body docx (synthetic, no real claims)
    ├── 02 CRP Appendixes/         # placeholder appendix markdown stubs
    └── 05 TABS Survey Support/
        └── TABS Survey Data/
            └── TABS_V2_Enriched_CRP200_synthetic.csv
                                   # 30-respondent synthetic survey CSV
                                   # with a known clean-sample composition,
                                   # generated for deterministic test output
```

Everything in `example_workspace/` is **fictional and contains no real respondent data**. The CSV uses fixed seed-driven random data so the output of `compute_crp_stats_v2.py` against the fixture is deterministic and can be asserted in tests.

## Why a fixture (and not just docs)

A README that says "the script accepts a CRP workspace and writes statistics" is a promise. A fixture lets that promise be tested. Concretely:

1. Anyone reading the docs can run `python builders/compute_crp_stats_v2.py` from the subtree root and immediately see what the output looks like against a known input.
2. CI (when wired up) can run the validators against the fixture and fail the build if a future change breaks the toolchain's ability to start from zero.
3. The fixture establishes the workspace layout convention as a working example, not just a description.

## Regenerating the fixture

If you ever need to update the synthetic data (add a new column, change scale labels, exercise an edge case the current fixture doesn't cover), run:

```bash
cd scripts/crp-document-tools/fixtures
python build_example_workspace.py
```

The script is deterministic (fixed seed) and idempotent (overwrites the existing fixture in place). Commit the resulting changes to the workspace alongside your script change.

## Privacy note

Because this fixture is committed to the public repo, every value in it must be safe to publish. Names, organisation labels, and any free-text fields use generic placeholders. The script enforces this by never sourcing values from real CRP data files.
