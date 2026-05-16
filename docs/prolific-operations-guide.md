# Prolific Operations Guide

A reference for every workflow and script that touches Prolific submissions, messages, and participant decisions. Use this when you need to act on a specific participant or batch and aren't sure which workflow to dispatch.

If you're an AI agent reading this for the first time: this is the canonical "how do I X?" doc for participant operations. Search it before grepping `.github/workflows/`.

## The participant lifecycle

```
Qualtrics complete  →  Prolific status: AWAITING REVIEW  →  one of:
                                                            ├─ APPROVED  (payment released)
                                                            ├─ RETURNED  (participant chose to return)
                                                            ├─ REJECTED  (no payment)
                                                            └─ TIMED-OUT (Prolific auto-action)
```

The daily pipeline (`daily-pipeline.yml`) runs at 10:30 UTC and handles the routine cycle: fetch → triage → auto-approve CLEAN → message FLAGs → auto-request-return on stale messages → auto-reject on stale return-requests → commit data → file daily report issue.

Anything outside the routine cycle — single-PID approves/rejects, custom messages, ad-hoc inspection — is done with the workflows below.

## Quick lookup: "I want to..."

| Goal                                                      | Workflow                             | Mode / Inputs                                                                                                |
| --------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Approve one PID                                           | `check-participant.yml`              | `mode=approve`, `pid=<id>`, `dry_run=true` (flip to `false` + `confirm_approve=APPROVE` for live)            |
| Approve N PIDs from today's report's auto-eligible bucket | `bulk-approve-replied.yml`           | `source_run_id=<daily-pipeline run>`, `dry_run=true` (flip to `false` for live), `max_per_run=30`            |
| Approve all CLEAN PIDs from a CSV                         | `prolific-approve-submissions.yml`   | `csv_content=<csv>` or `csv_file_path=<path>`                                                                |
| Reject one or more PIDs                                   | `prolific-reject-by-pid.yml`         | `pid_list=<csv>`, `dry_run=false`, `confirm_reject=REJECT`                                                   |
| Reject the daily report's high-tier-no-reply bucket       | `bulk-reject-high-tier-no-reply.yml` | `source_run_id=<run>`, `dry_run=true` (flip to `false` + `confirm_reject=REJECT` for live), `max_per_run=10` |
| Reject all AUTO-EXCLUDE                                   | `prolific-reject-auto-exclude.yml`   | (full destructive — read inputs carefully)                                                                   |
| Reject all failed-IRI                                     | `prolific-reject-failed-iri.yml`     | (full destructive — read inputs carefully)                                                                   |
| Send a custom one-off message to one PID                  | `check-participant.yml`              | `mode=send-custom`, `pid=<id>`, `message=<text>`                                                             |
| Send the standard FLAG message to one or more PIDs        | `prolific-message-flagged.yml`       | `disposition_filter=<one of the 10>`, `pid_list=<csv or empty>`, `dry_run=false`                             |
| Send a thank-you to specific PIDs                         | `check-participant.yml`              | `mode=send-thank-you`, `pid=<id>`                                                                            |
| Request return on one PID                                 | `check-participant.yml`              | `mode=request-return`, `pid=<id>`                                                                            |
| Unreject one or more PIDs                                 | `check-participant.yml`              | `mode=unreject`, `pid=<comma-separated>`                                                                     |
| Inspect one PID's submission + messages                   | `check-participant.yml`              | `mode=single`, `pid=<id>`                                                                                    |
| List every participant who has replied                    | `check-participant.yml`              | `mode=all-replies`                                                                                           |
| Export every Prolific message (both directions)           | `prolific-message-export.yml`        | (since: ISO date, study: optional)                                                                           |
| Search every message body for a term                      | `check-participant.yml`              | `mode=search-messages`, `message=<term>`                                                                     |
| Find replies that contain a URL                           | `check-participant.yml`              | `mode=find-url-replies`                                                                                      |
| Find stale return-request candidates                      | `check-participant.yml`              | `mode=stale-return-requested`                                                                                |
| Build the operator-style "awaiting review" report         | `check-participant.yml`              | `mode=awaiting-report`                                                                                       |
| Verify a PID's IRI answers against Qualtrics              | `check-participant.yml`              | `mode=single`, `pid=<id>` (the verify-iri job auto-runs)                                                     |
| Pull demographics from Prolific                           | `check-participant.yml`              | `mode=demographics`                                                                                          |
| Smoke-test the Prolific API token                         | `prolific-api-smoke.yml`             | (no inputs)                                                                                                  |
| Run the daily pipeline ad-hoc                             | `daily-pipeline.yml`                 | (no required inputs; runs the full chain)                                                                    |

## Workflow inventory

### Daily orchestration

- **`daily-pipeline.yml`** — The main scheduled workflow (cron `30 10 * * *`). Six phases:
  - Phase 1: Fetch Prolific data (auth checks, statuses)
  - Phase 2: Export Qualtrics → enrich → disposition waterfall → unified analysis → CRP analysis
  - Phase 3a: Auto-approve CLEAN
  - Phase 3b: Message FLAGs (10-disposition matrix)
  - Phase 3c: Generate dashboard + find stale submissions
  - Phase 3d: Auto-request-return on stale-no-reply-to-message
  - Phase 3e: Auto-reject on stale-no-reply-to-return-request
  - Phase 3f: Export Prolific messages → recommendations classifier → upload artifact
  - Phase 4: Commit daily data + open `chore/daily-pipeline-data` PR
  - Phase 5: Build Daily Disposition Report issue, including a HIGH-RISK push alert when applicable

  All Phase 3a/3b/3d/3e steps are kill-switch and ceiling guarded (`vars.AUTO_*_ENABLED` and `vars.AUTO_STALE_MAX_PER_RUN`).

### Per-PID / per-submission actions

- **`check-participant.yml`** — Swiss army knife for single-PID actions (modes listed in the table above). It includes both read-only and destructive modes; use destructive ones carefully and follow the per-mode guardrails (for example, `mode=approve` now defaults to dry-run and requires typed confirmation for live approval).

- **`bulk-approve-replied.yml`** — Approves PIDs from the daily-pipeline `reply-action-recommendations` artifact's `auto_approve_eligible` bucket. Defaults to dry-run; live requires `dry_run=false`. Internally calls `approve_by_pid.py` which now does one Prolific API call per PID (partial failures don't abort).

- **`bulk-reject-high-tier-no-reply.yml`** — Rejects PIDs from the same artifact's `no_reply_high_tier` bucket. Same safety pattern (dry-run default, `confirm_reject=REJECT` required for live). Uses `STRICT_AWAITING=false` so re-runs skip any PID already actioned elsewhere and remain idempotent.

- **`prolific-reject-by-pid.yml`** — General single-PID-or-list rejection. Re-runs Qualtrics triage first to ensure rejection reasons are computed from current disposition data. Live requires typing "REJECT" in the confirm input.

- **`prolific-approve-submissions.yml`** — Bulk-approve CLEAN-disposition PIDs from a CSV. Accept either `csv_content` (paste CSV inline) or `csv_file_path` (path inside repo). Auto-detects PID and Disposition columns.

- **`prolific-reject-auto-exclude.yml`** / **`prolific-reject-failed-iri.yml`** — Older destructive batch-reject workflows. Prefer `bulk-reject-high-tier-no-reply.yml` for new operator-driven rejections since it routes through the classifier and surfaces in the daily report.

- **`prolific-message-flagged.yml`** — Sends the standard FLAG template message for a single disposition type. `pid_list` filter is optional (empty = all PIDs matching the disposition). Default dry-run. Used by the daily pipeline; can be run ad-hoc to re-message a specific PID.

### Message / inspection

- **`prolific-message-export.yml`** — Pulls every Prolific message in the study channel (both directions) since a given ISO date. Produces:
  - `prolific-message-aggregate-summary` (committable, 7-day retention) — totals, themes, PII risk distribution
  - `prolific-messages-inbound-csv` (PII-bearing, 1-day retention) — full reply bodies for operator inspection
  - `prolific-messages-raw`, `prolific-messages-transcripts`, `prolific-messages-candidates` — full audit / curation

  The daily pipeline also runs this in Phase 3f; ad-hoc dispatch is for backfill or rebuild.

### Health / smoke

- **`prolific-api-smoke.yml`** — Verifies the `TABS_PROLIFIC_TOKEN` secret works and the study is reachable. Use after rotating tokens.

- **`qualtrics-prolific-verify.yml`** — Cross-references Qualtrics responses against Prolific submissions to catch desync.

- **`data-quality-check.yml`** — PII scan of `src/data/*.json`. Runs on every PR that touches data files.

## Script inventory

All under `scripts/analysis/`. Each is invoked by one or more workflows; check the script header docstring for env vars.

### Approve / reject

| Script                     | Used by                                                            | Behavior                                                                                              |
| -------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `approve_submissions.py`   | `prolific-approve-submissions.yml`, Phase 3a                       | CSV → CLEAN rows → bulk-approve API call → thank-you per PID                                          |
| `approve_by_pid.py`        | `bulk-approve-replied.yml`, `check-participant.yml` (mode=approve) | PID_LIST env → one bulk-approve call per PID (resilient to partial failure) → thank-you per PID       |
| `reject_by_pid.py`         | `prolific-reject-by-pid.yml`, `bulk-reject-high-tier-no-reply.yml` | PID_LIST env + disposition CSV → per-submission rejection with auto-generated reasons per disposition |
| `reject_auto_exclude.py`   | `prolific-reject-auto-exclude.yml`                                 | Older bulk path; superseded by `reject_by_pid.py`                                                     |
| `reject_failed_iri.py`     | `prolific-reject-failed-iri.yml`                                   | Older bulk path; superseded                                                                           |
| `unreject_submissions.py`  | `check-participant.yml` (mode=unreject)                            | Reverses a rejection via the transition endpoint                                                      |
| `request_return_by_pid.py` | Phase 3d                                                           | PID_LIST env → POST /submissions/{id}/request-return/ with disposition-specific reason text           |

### Messaging

| Script                         | Used by                                         | Behavior                                                                                                                                                                                                         |
| ------------------------------ | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `message_flagged.py`           | Phase 3b matrix, `prolific-message-flagged.yml` | DISPOSITION_FILTER env + CSV → looks up PIDs matching that disposition (with sub-type matching for AUTO-EXCLUDE) → sends the disposition-specific template message. Dedup-aware (signature phrase per template). |
| `send_custom_message.py`       | `check-participant.yml` (mode=send-custom)      | PID + MESSAGE env → sends a single arbitrary message. No dedup; will resend if invoked twice.                                                                                                                    |
| `send_thank_you.py`            | `check-participant.yml` (mode=send-thank-you)   | PID_LIST env → sends the standard thank-you template, dedup-aware                                                                                                                                                |
| `extract_prolific_messages.py` | Phase 3f, `prolific-message-export.yml`         | Pulls every message in the study channel; emits the inbound-CSV + aggregate summary + transcripts + candidates files                                                                                             |

### Analysis / classification (drive the operator UI)

| Script                           | Used by                                                                                                      | Behavior                                                                                                                                                                                                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `fetch_prolific_data.py`         | Phase 1                                                                                                      | Auth checks + submission statuses → CSV + JSON                                                                                                                                                                                                                           |
| `find_stale_return_requested.py` | Phase 3c                                                                                                     | Phase 3d/3e bucket extraction (stale messages, stale return-requests)                                                                                                                                                                                                    |
| `classify_replies_for_action.py` | Phase 5                                                                                                      | Cross-references inbound CSV with disposition CSV → 5 action buckets (`auto_approve_eligible`, `human_review_questions`, `human_review_high_tier`, `no_reply_high_tier`, `no_reply`) plus `multi_reply_count`. Uses `?` presence in reply body to detect real questions. |
| `prolific_tools.py`              | `check-participant.yml` modes (`all-replies`, `find-url-replies`, `demographics`, `replied-pids`, `collect`) | Multi-subcommand utility for ad-hoc Prolific inspection                                                                                                                                                                                                                  |
| `tabs_api.py`                    | All of the above                                                                                             | Low-level Prolific + Qualtrics API client. Single source of truth for endpoint URLs and request shapes.                                                                                                                                                                  |

## Safety conventions

Every destructive workflow follows the same pattern. If you're adding a new one, match it:

1. **Default to dry-run.** `dry_run: boolean (default true)`.
2. **Confirmation typing.** Live destructive actions require typing `REJECT` (or analogous) into a separate input. The script enforces this server-side.
3. **`MAX_PER_RUN` ceiling.** Workflow defaults are conservative and workflow-specific (for example 30 for bulk-approve, 10 for bulk-reject). Scripts enforce the ceiling, but behavior can differ by script: `reject_by_pid.py` aborts over-ceiling lists, while `approve_by_pid.py` truncates eligible targets after status filtering and records deferred PIDs in its JSON output.
4. **Status check before action.** Per-PID status verification — skip if no longer AWAITING REVIEW. Makes re-runs idempotent.
5. **Audit JSON output.** Every script writes a structured results JSON listing PIDs touched and per-PID outcome. PID-bearing workflow artifacts in this area are retained for 1 day, not 7, to match the privacy policy for intermediate participant data.

## Daily Disposition Report → workflow dispatch

The daily report issue (filed by Phase 5) is the operator's primary UI. It includes dispatch commands per recommended action:

- 🟢 **"Recommended for Auto-Approve" sub-section** quotes the exact `gh workflow run bulk-approve-replied.yml ... source_run_id=<this-run>` command
- 🔴 **"Recommended for Bulk-Reject" sub-section** quotes the bulk-reject equivalent
- 🟡 **"Replies to Consider — Questions" sub-section** lists reply themes; for genuine questions, use `check-participant.yml` mode=send-custom

When in doubt: `gh workflow run check-participant.yml --repo clarkemoyer/technologyadoptionbarriers.org -F mode=help` — wait, that doesn't exist yet. For now, this guide is the help.

## Tokens & environments

Every Prolific-touching workflow runs in the `prolific-prod` environment, which holds:

- `secrets.TABS_PROLIFIC_TOKEN` — Prolific API token (rotate annually; verify via `prolific-api-smoke.yml`)
- `vars.PROLIFIC_STUDY_ID` — the TABS V2 study ID (don't hard-code)
- `vars.AUTO_REQUEST_RETURN_ENABLED` / `vars.AUTO_REJECT_STALE_ENABLED` — Phase 3d/3e kill switches (default `'true'`)
- `vars.AUTO_STALE_MAX_PER_RUN` — Phase 3d/3e ceiling (default `'30'`)

Qualtrics workflows use the `qualtrics-prod` environment with `secrets.QUALTRICS_API_TOKEN`, `vars.QUALTRICS_BASE_URL`, and `vars.QUALTRICS_SURVEY_ID`.
