# Archived Workflows

These workflows have been moved out of `.github/workflows/` to prevent accidental execution against the live Qualtrics survey. GitHub Actions only recognizes workflow files inside `.github/workflows/`, so files here are effectively disabled.

## Archived Files

| File                           | Original Purpose                                             | Reason Archived                                                            |
| ------------------------------ | ------------------------------------------------------------ | -------------------------------------------------------------------------- |
| `qualtrics-copy-survey.yml`    | Copy/create a new survey in Qualtrics via API                | Write operation - could create unintended survey copies                    |
| `qualtrics-prolific-apply.yml` | Modify live survey flow (embedded data, branches, redirects) | Write operation - could break the working Prolific ↔ Qualtrics integration |

## How to Restore

To re-enable a workflow, move it back:

```bash
mv .github/workflows-archived/<file>.yml .github/workflows/
```

## Still Active (Read-Only Workflows)

These workflows remain in `.github/workflows/` because they only **read** data and cannot modify the live survey:

- `qualtrics-metrics-update.yml` - Fetches Qualtrics response counts, updates `src/data/qualtrics-metrics.json` (consumed by the Response Funnel page)
- `qualtrics-api-smoke.yml` - Connectivity check (lists surveys, fetches metadata)
- `qualtrics-prolific-verify.yml` - Reads survey definition and verifies configuration
- `fetch-qualtrics-questions.yml` - Fetches survey questions (read-only)
- `prolific.yml` - Collects Prolific study data and submissions

## References

- Issue: #316 (Prolific/Qualtrics tech debt)
- Closed issues: #91, #241
