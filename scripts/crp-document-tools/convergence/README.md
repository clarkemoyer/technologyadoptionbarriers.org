# CRP Convergence Tools

Offline reconciliation tools that compare the CRP `.docx`, the pipeline-generated JSON data (`src/data/crp-sensitivity-analysis.json`, `src/data/crp-validation.json`), and the public website's `/results/crp-2026/*` pages, then produce a structured discrepancy report organized by direction of drift.

## Files

### Current

| File                                 | Purpose                                                                                                                                                                                                                                                                           |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `crp_full_convergence_check_v2_3.py` | Full convergence check across CRP docx, pipeline JSON, and website TSX. Current version (v2.3). Produces a markdown report organized as Category A (website newer, CRP needs updating), Category B (CRP newer, website needs updating), Category C (both differ, needs decision). |
| `crp_convergence_check.py`           | Simpler baseline reconciler. Checks only the highest-priority numeric claims (sample sizes, construct means, alphas). Useful for a quick pre-commit sanity pass.                                                                                                                  |

### Archive

| File                                            | Date             | Notes                                            |
| ----------------------------------------------- | ---------------- | ------------------------------------------------ |
| `archive/crp_full_convergence_check_v2_1656.py` | 2026-04-16 16:56 | Initial v2 cut                                   |
| `archive/crp_full_convergence_check_v2_1659.py` | 2026-04-16 16:59 | v2 with minor fix                                |
| `archive/crp_full_convergence_check_v2_1.py`    | 2026-04-16 17:27 | v2.1 (added HTMT and Fornell-Larcker checks)     |
| `archive/crp_full_convergence_check_v2_2.py`    | 2026-04-16 17:39 | v2.2 (added demographic crosstab reconciliation) |

## Output format

The two scripts differ in how many artifacts they write per run:

**`crp_full_convergence_check_v2_3.py`** writes two artifacts:

1. **Claims database** (`Claims Databases/claims_database (<EST-timestamp>).json`): every quantitative claim found in each source, with location and value
2. **Convergence report** (`Convergence Reports/convergence_report (<EST-timestamp>).md`): structured discrepancy list with recommended resolution direction

**`crp_convergence_check.py`** writes three artifacts:

1. **Pipeline snapshot** (`Pipeline Snapshots/pipeline_stats (<EST-timestamp>).json`): the extracted pipeline stats used for the convergence pass
2. **Claims database** (`Claims Databases/claims_database (<EST-timestamp>).json`): every quantitative claim found in each source, with location and value
3. **Convergence report** (`Convergence Reports/convergence_report (<EST-timestamp>).md`): structured discrepancy list with recommended resolution direction

Outputs are written to the workspace `04 CRP Review Reports/CRP Convergence System/` folder. Each run produces a new timestamped file; older outputs are not moved automatically - archiving prior runs to `Old/` is a manual project convention.

## Running

Both scripts require the CRP `.docx` body text to be extracted first, and a local clone of the tabs-site repo. Unpack `word/document.xml` from the `.docx` (which is a zip archive) using any of the following equivalent methods:

```bash
# Option A - unzip (POSIX)
unzip -p /path/to/CRP-body.docx word/document.xml > /tmp/crp-document.xml

# Option B - Python (cross-platform)
python - <<'EOF'
import zipfile, sys
src = sys.argv[1]; dest = sys.argv[2]
with zipfile.ZipFile(src) as z:
    with z.open("word/document.xml") as xml_in, open(dest, "wb") as out:
        out.write(xml_in.read())
EOF /path/to/CRP-body.docx /tmp/crp-document.xml
```

All other input paths must be supplied explicitly via CLI flags - neither script auto-discovers workspace locations.

```bash
# Full check (slow, comprehensive)
python scripts/crp-document-tools/convergence/crp_full_convergence_check_v2_3.py \
    --crp-xml /path/to/unpacked/word/document.xml \
    --repo /tmp/tabs-site \
    --registry-dir "/path/to/04 CRP Review Reports/CRP Convergence System/Claim Registries" \
    --output-dir "/path/to/04 CRP Review Reports/CRP Convergence System"

# Minimal check (fast, high-priority only)
python scripts/crp-document-tools/convergence/crp_convergence_check.py \
    --crp-xml /path/to/unpacked/word/document.xml \
    --repo /tmp/tabs-site \
    --output-dir "/path/to/04 CRP Review Reports/CRP Convergence System"
```

On the original author's machine the workspace root is typically under `/sessions/*/mnt/! Clarke Moyer Smeal CRP - TABS`; substitute the actual path when running locally.

## How the categories work

- **Category A** - website is newer/correct, CRP needs updating. Typically surfaces when a late pipeline regen produced a number the CRP docx still reflects from an earlier frozen export.
- **Category B** - CRP is newer/correct, website needs updating. Typically surfaces when an author added analytic narrative to the CRP that the website's data pages have not yet caught up to.
- **Category C** - both differ, need decision. Typically surfaces when there is a framing or methodology difference rather than a pure data drift.

Within each category, each finding reports: what (the specific claim or number), where in CRP (section and paragraph), where on website (file and line number), CRP value vs website value, and a recommended direction.

## Session log reference

The 2026-04-17 00:14 EST convergence session report is in the workspace:

- `04 CRP Review Reports/CRP Convergence System/Convergence Reports/convergence_session_report (4-17-2026 0014 EST).md`

That document captures the full before/after of the most recent convergence pass, including the top-3 pick ranking addition and the validator v5 scope expansion.
