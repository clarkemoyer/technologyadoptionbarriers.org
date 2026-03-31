# TABS V2 Analysis Scripts

Reproducible analysis pipeline for the Technology Adoption Barriers Survey (TABS) V2 dataset.

## Scripts

| Script                     | Purpose                                                                                             |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| `tabs_v2_analysis.py`      | Full descriptive statistics, cross-tabs, sensitivity analysis across sample cuts                    |
| `tabs_v2_psychometrics.py` | Psychometric legitimacy audit: convergent/discriminant validity, response biases, IRI effectiveness |

## Usage

Both scripts expect a Qualtrics CSV export as the first argument:

```bash
python scripts/analysis/tabs_v2_analysis.py path/to/qualtrics_export.csv
python scripts/analysis/tabs_v2_psychometrics.py path/to/qualtrics_export.csv
```

The CSV must contain the standard Qualtrics 3-row header (column names, sub-labels, import IDs).

## Data Note

Raw survey data is not committed to this repository. Qualtrics exports are stored locally
in the project workspace under `05 TABS Survey Support/TABS Survey Data/`.

## V2 Filter

All scripts filter to V2 production data using `StartDate >= '2026-03-23 14:00:00'`.

## Sample Cuts

The analysis scripts compute results across three sample definitions:

- **Clean** (conservative): Duration ≥ 480s AND all 3 IRI attention checks correct
- **Relaxed**: Duration ≥ 480s AND at least 2 of 3 IRI checks correct
- **All V2**: Duration ≥ 120s, no IRI filter (extreme speeders only excluded)
