# CRP Document Builders

Offline tools that construct the final CRP deliverable document from its constituent parts (body .docx + 4 appendix markdown files) and compute descriptive statistics used throughout the CRP.

## Files

### Current

| File | Purpose |
|------|---------|
| `merge_appendixes.py` | Merges the CRP body .docx with Appendixes A, B, C, D (markdown) into a single final docx with consistent formatting, page breaks, and table of contents. Produces output named `Clarke Moyer - DBA Culminating Research Project - Product Development (<EST-timestamp>).docx`. |
| `compute_crp_stats_v2.py` | Computes descriptive statistics from the frozen CRP CSV using the canonical scale maps (barrier 1-5, readiness 1-5 with Don't Know excluded, maturity 1-5 with Don't Know excluded). Useful for spot-checking validator output or generating new numbers for CRP insertion. |

### Archive

| File | Date | Notes |
|------|------|-------|
| `archive/merge_appendixes_v2.py` | 2026-04-16 early | Earlier iteration of the merge script; predates the current `merge_appendixes.py` despite the 'v2' in its name (the workspace naming is historical). |

## Running

```bash
# Merge body + appendixes into the final CRP docx
python scripts/crp-document-tools/builders/merge_appendixes.py

# Compute baseline statistics from the frozen CRP CSV
python scripts/crp-document-tools/builders/compute_crp_stats_v2.py
```

Both scripts auto-discover the CRP workspace folder via glob and output files with EST-timestamped names following the project's versioning rule (never overwrite, always new file with EST timestamp, move prior versions to `Old/`).

## Dependencies

- `python-docx` for docx manipulation
- `lxml` for XML-level edits (for cases where python-docx's high-level API is insufficient)
- `pandas` for CSV reading in `compute_crp_stats_v2.py`

## Adherence to project rules

- **No em or en dashes:** output uses only ASCII hyphen-minus or U+2212 Unicode minus (for negative numbers in statistics tables)
- **EST timestamps in filenames:** uses `TZ='America/New_York'` explicitly, not UTC
- **Person-level means:** grand means computed as mean of person-level means, not item-level means
- **Don't Know excluded:** maturity and readiness "Don't Know" responses are excluded from scoring, not mapped to a number
- **IRI attention checks excluded:** barrier item 19, readiness item 18, maturity item 9 are dropped from substantive statistics
