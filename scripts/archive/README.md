# Archived TypeScript Scripts

These are the original TypeScript operational scripts that have been replaced
by Python equivalents in `scripts/analysis/`. They are preserved here for
reference only and should not be used in new workflows.

## Migration Mapping

| Archived TS Script                   | Python Replacement (`scripts/analysis/`) |
| ------------------------------------ | ---------------------------------------- |
| `approve-prolific-submissions.ts`    | `approve_submissions.py`                 |
| `disposition-triage.ts`              | `disposition_triage.py`                  |
| `generate-disposition-summary.ts`    | `generate_disposition_summary.py`        |
| `message-flagged-submissions.ts`     | `message_flagged.py`                     |
| `reject-auto-exclude-submissions.ts` | `reject_auto_exclude.py`                 |
| `reject-failed-iri-submissions.ts`   | (handled by `reject_auto_exclude.py`)    |
| `send-custom-message.ts`             | `send_custom_message.py`                 |
| `send-thank-you-message.ts`          | `send_thank_you.py`                      |
| `unreject-submissions.ts`            | `unreject_submissions.py`                |

## Why Archived (Not Deleted)

- Preserves `git log` history via `git mv`
- Useful as reference for edge-case behavior during Python migration validation
- Will be deleted once all workflows have fully migrated (tracked in issue #728)

## Related Issues

- **#687** -- Python rewrite of operational scripts
- **#725** -- This archival step
- **#728** -- Migrate remaining TS workflow references to Python
