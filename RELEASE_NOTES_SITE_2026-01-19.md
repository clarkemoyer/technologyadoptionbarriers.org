# Site Release: 2026-01-19

This release captures recent automation work (Qualtrics + Prolific), CI hardening, and operational lessons learned from iterative review cycles.

## Summary

- Added automation for fetching Qualtrics survey questions (script + workflow) with safer Markdown output to GitHub Actions Step Summary.
- Hardened API clients and workflows with clearer preflight checks and error messages.
- Improved maintainability by deduplicating shared GitHub Step Summary helpers and adding unit tests.

## What Changed (Highlights)

### Qualtrics automation

- New workflow to fetch survey questions: `.github/workflows/fetch-qualtrics-questions.yml`.
- New script: `scripts/fetch-qualtrics-questions.ts`.
- New Qualtrics client utilities:
  - `src/lib/qualtrics-api.ts` (`makeApiRequest`, `getSurveyQuestions`)
  - `src/lib/stripHtml.ts` for sanitizing question text
- Added/expanded Jest coverage:
  - `__tests__/lib/qualtrics-api.test.ts`
  - `__tests__/lib/stripHtml.test.ts`

### GitHub Actions / CI quality

- Standardized and hardened workflow configuration and summaries across automation workflows.
- Added shared helpers for GitHub Actions Step Summary + Markdown table escaping:
  - `src/lib/github-utils.ts`
  - `__tests__/lib/github-utils.test.ts`

### Site/UI improvements (recent)

- Header button hover styling improvements.

## Lessons Learned

### 1) Secrets scope: GitHub Environments vs local dev

- GitHub Actions _environment secrets_ are only available inside workflow runs; local development and MCP processes cannot read them.
- For local dev, use explicit environment variables (`QUALTRICS_API_TOKEN`, etc.) and keep workflow secrets in GitHub Environments.

### 2) Prefer simple auth paths for automation

- When a service supports a straightforward API token header (`X-API-TOKEN`), it’s usually the most reliable path for CI automation.
- More complex auth layers (OAuth clients, multi-hop proxying) tend to introduce brittle startup/auth issues.

### 3) Avoid bundled PRs; keep changes reviewable

- Large “holding PRs” slow review and complicate issue tracking.
- Smaller PRs reduce rework, reduce review latency, and keep issue ↔ PR closure semantics clean.

### 4) GitHub Step Summary is a UX bonus, not a dependency

- Step Summary writing should never fail a workflow.
- Escape table content (`|`, `\\`, newlines) defensively to avoid broken Markdown rendering.

### 5) Watcher approach: prefer polling `gh api` over interactive watch

- `gh run watch` can trigger pager/alternate-buffer behavior depending on terminal settings.
- A simple polling loop (`gh api repos/.../actions/runs/<id>`) is reliable in CI, in scripts, and in restrictive shells.

## How to Use the New Automation

- Fetch Qualtrics questions locally:
  - Set `QUALTRICS_API_TOKEN`, `QUALTRICS_BASE_URL`, `QUALTRICS_SURVEY_ID`
  - Run `npx --no-install tsx scripts/fetch-qualtrics-questions.ts`

- Run via GitHub Actions:
  - Trigger the “Fetch Qualtrics Questions” workflow and ensure the `qualtrics-prod` environment is configured.

## Related

- Issue: #151
- PR: #125
