# v0.2.0 2026-01-19

## Main Summary

- Added robust survey automation workflows (Qualtrics + Prolific) and improved operational visibility via GitHub Actions summaries.
- Improved site content and navigation CTAs while keeping accessibility/testing coverage strong.
- Reduced review/maintenance friction by deduplicating automation helpers and strengthening tests and documentation.

## 1. User Facing Changes

- Header: added Google site search and improved hover styling.
- Navigation/content: added and refined “Get Involved” and research-support CTAs.
- Content terminology: standardized “donation” terminology to “contribution” across the site.
- Media: added a press kit section.
- Reliability: automated display of the “surveys completed” statistic (site content stays current).

## 2. Internal Application Improvements

- CI/CD hardening: improved workflow consistency and failure diagnostics.
- Testing: expanded unit and E2E coverage, stabilized selectors, and added more edge-case coverage.
- Utilities: centralized GitHub Actions Step Summary + Markdown table escaping utilities and added unit tests.
- Documentation: expanded deployment, integration, and troubleshooting guidance.

## 3. External Integrations

### 3.1 Prolific

- Added CI-safe Prolific data collection workflow and supporting script improvements.
- Added Qualtrics↔Prolific verification workflow to validate markers and definition endpoints.

### 3.2 Qualtrics

- Added workflow + script to fetch Qualtrics survey questions and publish readable output to the GitHub Step Summary.
- Added Qualtrics survey copy/import workflows and API-based fallback paths.
- Automated Qualtrics survey metrics updates and added coverage for Qualtrics stats edge cases.

### 3.3 Google

- Added Google Analytics Data API client, scheduled GA report workflow, and report generation script improvements.
- Added Google site search in the header.

### 3.4 Microsoft

- None in this release.

## Lessons Learned

- GitHub Actions environment secrets are workflow-scoped; local tooling needs explicit env vars.
- Prefer the simplest auth mechanism available for automation (e.g., `X-API-TOKEN`) to reduce brittleness.
- Small, focused PRs + early CI validation reduce churn during iterative review cycles.
- GitHub Step Summary is a UX bonus: treat it as best-effort and escape Markdown defensively.
- When terminals/pagers are inconsistent, polling `gh api` is more reliable than interactive watch mode.

## Related

- Issue: #153
