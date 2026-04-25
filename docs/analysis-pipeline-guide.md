# TABS V2 Analysis Pipeline Guide

> **Status**: This guide documents the analysis pipeline architecture as of April 2026.
> Sample definitions and TS-to-Python migration are actively evolving under
> issue [#687](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/687).
> Re-check the source code for the latest filter logic after each phase merges.

## Overview

The TABS project uses two daily pipelines to process survey data:

1. **Analysis Pipeline** (Python, 09:00 UTC / 4 AM EST) - exports, enriches,
   de-identifies, and analyzes data. Produces JSON for the website and a
   public CSV for ScholarSphere.

2. **Operations Pipeline** (TypeScript, 11:00 UTC / 7 AM EST) - approves
   CLEAN submissions, messages flagged participants, generates the dashboard,
   and creates daily report issues.

The analysis pipeline runs first so its results are available for the
operations pipeline and for morning review.

```
09:00 UTC ─ ANALYSIS PIPELINE (Python)
  ├─ Prolific API  → auth checks + statuses        (prolific-prod)
  ├─ Qualtrics API → raw CSV export                 (qualtrics-prod, on-runner only)
  ├─ Enrich CSV (merge auth + statuses)
  ├─ Disposition audit (10-step waterfall)
  ├─ De-identify → public CSV (NIST 5-step)
  ├─ Descriptive analysis + sensitivity (5 samples)
  ├─ Advanced (PCA, regression, ANOVA)
  ├─ Psychometrics (KMO, HTMT, Cronbach's)
  ├─ Quality audit (outliers, CMV)
  └─ Commit JSON → PR (auto-merged)

11:00 UTC ─ OPERATIONS PIPELINE (TypeScript)
  ├─ Qualtrics export + disposition triage (Python)
  ├─ Auto-approve CLEAN                     (TS)
  ├─ Message flagged participants           (TS)
  ├─ Dashboard data → PR                    (TS)
  └─ Daily report issue
```

## Data Flow

```
                    ┌──────────────┐
                    │ Qualtrics API│
                    └──────┬───────┘
                           │ raw CSV (PII - stays on runner)
                           ▼
┌──────────────┐    ┌──────────────┐
│ Prolific API │───▶│   Enrich     │
│ auth + status│    │   CSV        │
└──────────────┘    └──────┬───────┘
                           │ enriched CSV (auth + status columns)
                    ┌──────┴───────┐
                    │              │
                    ▼              ▼
             ┌────────────┐ ┌─────────────┐
             │ Data Audit  │ │ De-identify │
             │ (waterfall) │ │ (NIST 5-step)│
             └──────┬──────┘ └──────┬──────┘
                    │               │
                    ▼               ▼
             data-audit.json   public CSV
                                (ScholarSphere)
                    │
                    ▼
             ┌─────────────────────────────┐
             │ Analysis Suite              │
             │ ├─ tabs_v2_analysis.py      │
             │ ├─ tabs_v2_advanced.py      │
             │ ├─ tabs_v2_psychometrics.py │
             │ └─ tabs_v2_quality_audit.py │
             └──────────────┬──────────────┘
                            │
                            ▼
                  sensitivity-analysis.json
                  (committed to src/data/)
                            │
                            ▼
                    ┌───────────────┐
                    │   Website     │
                    │ (Next.js)     │
                    └───────────────┘
```

## Sample Definitions

> Sample definitions were redesigned in PR #693 (merged) to be grounded
> in Prolific operational reality (APPROVED status).

| #   | Sample                 | Definition                                                                                                                                         |
| --- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Conservative Clean** | Prolific APPROVED + ALL quality checks (IRI, duration >= 540s, reCAPTCHA >= 0.5, no straightlining, no partial straightlining, Prolific auth pass) |
| 2   | **Flexible Clean**     | Prolific APPROVED + basic quality (all 3 IRIs correct + duration >= 480s). Includes manually-reviewed FLAG responses that passed human review      |
| 3   | **Prolific Accepted**  | ALL deduplicated V2 responses with Prolific status APPROVED (must match Prolific UI "Approved" count exactly)                                      |
| 4   | **All V2 Finished**    | Finished + duration >= 120s (extreme speeders excluded)                                                                                            |
| 5   | **All V2**             | All V2 responses including incomplete                                                                                                              |

**Constraint**: Conservative Clean ⊆ Flexible Clean ⊆ Prolific Accepted ⊆ All V2 Finished ⊆ All V2

The sensitivity analysis runs every statistic across all 5 definitions.
If a finding holds across Conservative Clean and Flexible Clean, it is
robust to inclusion criteria.

## Deduplication Logic

When a participant retakes the survey, the Qualtrics export contains
multiple rows for the same PROLIFIC_PID. The deduplication logic:

1. **Prefers completed responses** (Finished=TRUE/1) over incomplete retakes
2. **Among completed responses**, latest row wins
3. **Never discards a completed response** in favor of an incomplete retake

This is critical: without it, a participant who completed the survey,
got approved on Prolific, then started a retake but didn't finish it
would have their completed response overwritten by the incomplete
retake - causing Prolific Accepted to undercount by 1.

## Edge Cases

- **Retake dedup**: Prefer completed over incomplete (see above)
- **Prolific Accepted = Prolific UI**: Must match exactly; any discrepancy is a pipeline bug
- **IRI denominator**: Finished responses only (incomplete responses can't have valid IRI answers)
- **Partial straightlining**: Within-person SD < 0.5, threshold ceil(block_count/2) items
- **Qualtrics 3-row headers**: Row 0 = columns, rows 1-2 = metadata (skipped by csv.DictReader + `if i < 2: continue`)
- **UTF-8 BOM**: Qualtrics exports include BOM; all CSV reads use `encoding="utf-8-sig"`
- **Embedded newlines**: csv.reader with `newline=""` handles quoted fields containing newlines
- **Don't Know**: Readiness and Maturity allow "Don't Know" → excluded from scoring (not mapped to numeric)
- **Prolific Cloudflare**: Python urllib default User-Agent is blocked; custom UA required
- **Pagination limit**: Prolific API defaults to 100 results per page; use `limit=1000`

## Scripts Reference

### Data Collection & Enrichment

| Script                                     | Language | Purpose                                    | Input           | Output       |
| ------------------------------------------ | -------- | ------------------------------------------ | --------------- | ------------ |
| `scripts/analysis/export_qualtrics.py`     | Python   | Export survey responses from Qualtrics API | API credentials | CSV          |
| `scripts/analysis/fetch_prolific_data.py`  | Python   | Fetch auth checks + submission statuses    | API credentials | CSV + JSON   |
| `scripts/analysis/enrich_qualtrics_csv.py` | Python   | Merge Prolific data into Qualtrics CSV     | CSVs + JSON     | Enriched CSV |
| `scripts/analysis/prolific_tools.py`       | Python   | Unified CLI for Prolific read-only ops     | API credentials | stdout/files |

### Disposition & De-identification

| Script                                   | Language | Purpose                        | Input | Output                   |
| ---------------------------------------- | -------- | ------------------------------ | ----- | ------------------------ |
| `scripts/analysis/disposition_triage.py` | Python   | 10-step disposition waterfall  | CSV   | disposition CSV          |
| `scripts/analysis/tabs_v2_data_audit.py` | Python   | Disposition audit + statistics | CSV   | JSON report              |
| `scripts/deidentify_tabs_data.py`        | Python   | NIST 5-step de-identification  | CSV   | Public CSV + audit files |

### Statistical Analysis

| Script                                      | Language | Purpose                                          | Input | Output                    |
| ------------------------------------------- | -------- | ------------------------------------------------ | ----- | ------------------------- |
| `scripts/analysis/tabs_v2_analysis.py`      | Python   | Descriptive stats + sensitivity                  | CSV   | Console + JSON (`--json`) |
| `scripts/analysis/tabs_v2_advanced.py`      | Python   | PCA, regression, ANOVA, interaction effects      | CSV   | Console                   |
| `scripts/analysis/tabs_v2_psychometrics.py` | Python   | KMO, HTMT, Cronbach's, Harman's, factor analysis | CSV   | Console                   |
| `scripts/analysis/tabs_v2_quality_audit.py` | Python   | Outliers, CMV, Mahalanobis distance              | CSV   | Console                   |

### Shared Infrastructure

| File                                      | Purpose                                                     |
| ----------------------------------------- | ----------------------------------------------------------- |
| `scripts/analysis/tabs_api.py`            | Python API clients for Qualtrics + Prolific (stdlib urllib) |
| `src/lib/tabs-survey-constants.ts`        | Single source of truth for instrument constants             |
| `scripts/analysis/tabs_v2_constants.json` | JSON export of TS constants (CI-generated)                  |

### Operations (TypeScript - Phases 3-5 migration pending)

| Script                                       | Purpose                                 | Risk     |
| -------------------------------------------- | --------------------------------------- | -------- |
| `scripts/approve-prolific-submissions.ts`    | Bulk approve CLEAN                      | Medium   |
| `scripts/message-flagged-submissions.ts`     | 9-type personalized messages with dedup | **High** |
| `scripts/reject-auto-exclude-submissions.ts` | DESTRUCTIVE reject with safety guards   | **High** |
| `scripts/generate-disposition-summary.ts`    | Dashboard JSON from Prolific API        | Medium   |

## How to Run

### Prerequisites

```bash
# Python 3.12+ with scientific libraries
pip install -r scripts/analysis/requirements.txt

# Node.js 20+ (for TS operations scripts and website)
npm ci
```

### Run Analysis on Test Data

```bash
# Run descriptive analysis with sensitivity across all 5 samples
python scripts/analysis/tabs_v2_analysis.py scripts/analysis/tests/test_data_production_format.csv

# Export sensitivity analysis as JSON
python scripts/analysis/tabs_v2_analysis.py <csv> --json sensitivity.json

# Run detailed analysis on a specific sample
python scripts/analysis/tabs_v2_analysis.py <csv> --primary-sample conservative_clean

# Run data audit (disposition waterfall)
python scripts/analysis/tabs_v2_data_audit.py --input <csv> --output audit.json

# Run advanced/inferential analysis
python scripts/analysis/tabs_v2_advanced.py <csv>

# Run psychometric validation
python scripts/analysis/tabs_v2_psychometrics.py <csv>

# Run quality audit
python scripts/analysis/tabs_v2_quality_audit.py <csv>
```

### Run Tests

```bash
# Full Python test suite (271 tests)
python -m pytest scripts/analysis/tests/ -v

# With coverage
python -m pytest scripts/analysis/tests/ --cov=scripts/analysis --cov-report=term-missing

# JS tests (341 tests)
npm test
```

### Prolific Read-Only Operations

```bash
# List studies
PROLIFIC_API_TOKEN=... python scripts/analysis/prolific_tools.py collect

# Show recent messages (participant replies, 7-day window)
PROLIFIC_API_TOKEN=... STUDY_ID=... python scripts/analysis/prolific_tools.py messages

# List replied PIDs awaiting review
PROLIFIC_API_TOKEN=... STUDY_ID=... python scripts/analysis/prolific_tools.py replied-pids

# Fetch demographics (requires OUTPUT_PATH)
PROLIFIC_API_TOKEN=... STUDY_ID=... OUTPUT_PATH=demo.csv python scripts/analysis/prolific_tools.py demographics
```

## GitHub Environments

| Environment      | API/Service      | Used by                                                                         |
| ---------------- | ---------------- | ------------------------------------------------------------------------------- |
| `qualtrics-prod` | Qualtrics API v3 | Analysis pipeline (export), operations pipeline (triage)                        |
| `prolific-prod`  | Prolific API v1  | Analysis pipeline (auth/statuses), operations pipeline (approve/reject/message) |
| `google-prod`    | GA4 + GSC        | GA reports, SEO metrics                                                         |
| `copilot`        | GitHub API       | PR creation, automerge, code review                                             |

## Data Protection

| Data                           | Where it lives           | Retention                | Who can access   |
| ------------------------------ | ------------------------ | ------------------------ | ---------------- |
| Raw Qualtrics CSV              | Runner filesystem only   | Ephemeral (job duration) | No one after job |
| Prolific auth/status artifacts | GitHub Actions artifacts | 1 day                    | Repo members     |
| Enriched CSV                   | Runner filesystem only   | Ephemeral                | No one after job |
| De-identified public CSV       | GitHub Actions artifact  | 30 days                  | Repo members     |
| Sensitivity analysis JSON      | `src/data/` (committed)  | Permanent                | Public           |
| Disposition summary JSON       | `src/data/` (committed)  | Permanent                | Public           |

**Prolific ID (PID)** handling per [Prolific guidelines](https://researcher-help.prolific.com/en/article/635fb9):

- PIDs are pseudonymous identifiers (not direct identifiers like names)
- Required for operational use (approve/reject/message)
- Must be removed from public datasets (handled by `deidentify_tabs_data.py`)
- Appear in 1-day retention artifacts for auth checks and statuses

## Shared Constants Architecture

```
tabs-survey-constants.ts  ──(CI)──▶  tabs_v2_constants.json
        │                                    │
        │ TypeScript import                  │ Python json.load()
        ▼                                    ▼
   disposition.ts                    tabs_v2_data_audit.py
   (live pipeline)                   (analysis pipeline)
```

Both systems share: scale mappings, IRI expected answers, column names,
duration thresholds, item counts. Changes to constants propagate automatically
via `generate-constants-json.ts` (runs on every commit via `validate-analysis.yml`).

## Migration Status (#687)

| Phase | What                                              | Status              |
| ----- | ------------------------------------------------- | ------------------- |
| 1     | Triage + Qualtrics export → Python                | **Merged** (#688)   |
| 2     | Prolific read-only + sample redesign → Python     | **Merged** (#693)   |
| 3     | Reporting (dashboard generator, approve) → Python | Branch ready        |
| 4     | Write operations (reject, message) → Python       | Planned (high risk) |
| 5     | Cleanup (remove TS scripts, constants bridge)     | Planned             |

## Production Hotfixes Applied

| Fix                                         | Issue                                | Impact                               |
| ------------------------------------------- | ------------------------------------ | ------------------------------------ |
| Import paths (`from tabs_api`)              | Pipeline crash on import             | Scripts couldn't find modules        |
| User-Agent header                           | Cloudflare 403 block                 | Prolific API rejected Python urllib  |
| DictReader skip rows                        | Qualtrics metadata parsing           | `int("Duration (in seconds)")` crash |
| Pagination limit 100→1000                   | Only 100 of ~400 submissions fetched | N=54 instead of N=206                |
| Dedup: prefer completed                     | Retake overwrote completed response  | N=205 instead of N=206               |
| Prolific Accepted from v2 (not v2_finished) | INCOMPLETE+APPROVED excluded         | N=205 instead of N=206               |

## Related Issues & PRs

- [#684](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/684) - Analysis pipeline + sensitivity analysis + 250 tests
- [#687](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/687) - TS → Python consolidation plan
- [#688](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/688) - Phase 1: Triage + export to Python
- [#693](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/693) - Phase 2: Read-only ops + sample redesign
- [#700](https://github.com/clarkemoyer/technologyadoptionbarriers.org/pull/700) - Data Analysis & Quality public page
- [#674](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/674) - CLEAN discrepancy documentation (closed)
- [#675](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/675) - IRI pass rate denominator fix (closed)
- [#669](https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/669) - Pipeline guide (closed by #695)

---

_Last updated: April 3, 2026 (post-Phase 2 merge, dedup fix, Prolific Accepted = 206 verified). Update after Phases 3-5 of #687 complete._
