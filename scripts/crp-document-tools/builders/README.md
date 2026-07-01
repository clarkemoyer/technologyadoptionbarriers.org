# CRP Document Builders

Offline tools that construct the final CRP deliverable document from its constituent parts (body .docx + 4 appendix markdown files) and compute descriptive statistics used throughout the CRP.

## Files

### Current

| File                      | Purpose                                                                                                                                                                                                                                                                       |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `merge_appendixes.py`     | Merges the CRP body .docx with Appendixes A, B, C, D (markdown) into a single final docx with consistent formatting, page breaks, and table of contents. Produces output named `Clarke Moyer - DBA Culminating Research Project - Product Development (<ET-timestamp>).docx`. |
| `compute_crp_stats_v2.py` | Computes descriptive statistics from the frozen CRP CSV using the canonical scale maps (barrier 1-5, readiness 1-5 with Don't Know excluded, maturity 1-5 with Don't Know excluded). Useful for spot-checking validator output or generating new numbers for CRP insertion.   |

### Archive

| File                             | Date             | Notes                                                                                                                                                |
| -------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `archive/merge_appendixes_v2.py` | 2026-04-16 early | Earlier iteration of the merge script; predates the current `merge_appendixes.py` despite the 'v2' in its name (the workspace naming is historical). |

## Running

```bash
# Merge body + appendixes into the final CRP docx (auto-discovers workspace)
python scripts/crp-document-tools/builders/merge_appendixes.py

# Or specify paths explicitly:
python scripts/crp-document-tools/builders/merge_appendixes.py \
    --workspace /path/to/CRP-workspace
python scripts/crp-document-tools/builders/merge_appendixes.py \
    --docx /path/to/body.docx --appendix-dir /path/to/appendixes

# Compute baseline statistics from the frozen CRP CSV (auto-discovers workspace)
python scripts/crp-document-tools/builders/compute_crp_stats_v2.py

# Or specify the CSV explicitly:
python scripts/crp-document-tools/builders/compute_crp_stats_v2.py \
    --csv /path/to/survey.csv
```

Both scripts auto-discover the CRP workspace folder via glob and output files with ET-timestamped names (EST in winter, EDT in summer). Each run produces a new timestamped file without overwriting prior outputs; archiving older runs to `Old/` is a manual project convention.

## Dependencies

- `python-docx` for docx manipulation
- `lxml` for XML-level edits (for cases where python-docx's high-level API is insufficient)
- `zoneinfo` (Python 3.9+ stdlib) for EST timestamp generation in `merge_appendixes.py`

## Adherence to project rules

- **No em or en dashes:** output uses only ASCII hyphen-minus or U+2212 Unicode minus (for negative numbers in statistics tables)
- **EST timestamps in filenames:** uses `TZ='America/New_York'` explicitly, not UTC; yields EST in winter and EDT in summer
- **Person-level means:** grand means computed as mean of person-level means, not item-level means
- **Don't Know excluded:** maturity and readiness "Don't Know" responses are excluded from scoring, not mapped to a number
- **IRI attention checks excluded:** barrier item 19, readiness item 18, maturity item 9 are dropped from substantive statistics
