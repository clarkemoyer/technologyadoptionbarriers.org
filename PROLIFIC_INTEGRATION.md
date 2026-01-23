# Prolific API Integration

**Last Updated:** January 18, 2026

This document describes the Prolific API integration for collecting and managing survey data from the Prolific platform.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [API Client Library](#api-client-library)
- [GitHub Actions Workflow](#github-actions-workflow)
- [Setup Instructions](#setup-instructions)
- [Qualtrics ↔ Prolific Survey Setup](#qualtrics--prolific-survey-setup)
- [Qualtrics ↔ Prolific Verification Workflow](#qualtrics--prolific-verification-workflow)
- [Usage Examples](#usage-examples)
- [API Features](#api-features)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)

## Overview

**Prolific** (https://app.prolific.com/) is a platform for collecting valid survey results from a curated pool of participants. This integration provides:

1. **API Client Library** (`src/lib/prolific-api.ts`) - TypeScript functions for interacting with the Prolific API
2. **GitHub Actions Workflow** (`.github/workflows/prolific.yml`) - Automated data collection workflow
3. **Comprehensive Testing** - Unit tests for all API functions

### What is Prolific?

Prolific is a research participant recruitment platform that connects researchers with high-quality participants for online studies. Key features include:

- Vetted participant pool with demographic targeting
- Built-in quality checks and attention filters
- Automated participant payments
- Integration with survey platforms
- API for programmatic access to study data

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions Workflow                   │
│                  (.github/workflows/prolific.yml)            │
│                                                              │
│  Triggers:                                                   │
│  - Schedule (Weekly on Mondays at 9 AM UTC)                 │
│  - Manual dispatch with optional study ID                   │
│                                                              │
│  Environment: prolific-prod                                  │
│  Secret: TABS_PROLIFIC_TOKEN                                │
└─────────────────────┬────────────────────────────────────────┘
                      │
                      │ uses
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  Prolific API Client Library                 │
│                   (src/lib/prolific-api.ts)                  │
│                                                              │
│  Functions:                                                  │
│  - getCurrentUser()                                          │
│  - listStudies()                                             │
│  - getStudy(studyId)                                        │
│  - listStudySubmissions(studyId)                            │
│  - getSubmission(studyId, submissionId)                     │
│  - getStudyStatistics(studyId)                              │
│  - exportSubmissionsCSV(studyId)                            │
└─────────────────────┬────────────────────────────────────────┘
                      │
                      │ authenticated requests
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                      Prolific REST API                       │
│              https://api.prolific.com/api/v1/               │
│                                                              │
│  Endpoints:                                                  │
│  - GET /users/me/                                           │
│  - GET /studies/                                            │
│  - GET /studies/:id/                                        │
│  - GET /studies/:id/submissions/                            │
│  - GET /studies/:id/submissions/:id/                        │
└─────────────────────────────────────────────────────────────┘
```

## API Client Library

The Prolific API client library is located at `src/lib/prolific-api.ts` and provides strongly-typed TypeScript functions for interacting with the Prolific API.

### Core Functions

#### Authentication

All functions require a Prolific API token for authentication. The token is passed as a parameter to each function.

#### Available Functions

1. **`getCurrentUser(apiToken: string)`**
   - Returns information about the authenticated user
   - Useful for verifying API token validity

2. **`listStudies(apiToken: string)`**
   - Returns a paginated list of all studies
   - Includes study metadata and status

3. **`getStudy(studyId: string, apiToken: string)`**
   - Returns detailed information about a specific study
   - Includes all study configuration and settings

4. **`listStudySubmissions(studyId: string, apiToken: string)`**
   - Returns all participant submissions for a study
   - Includes submission status and timing data

5. **`getSubmission(studyId: string, submissionId: string, apiToken: string)`**
   - Returns details of a specific submission
   - Includes participant ID and completion data

6. **`getStudyStatistics(studyId: string, apiToken: string)`**
   - Calculates and returns summary statistics for a study
   - Includes approval rates, completion rates, and timing data

7. **`exportSubmissionsCSV(studyId: string, apiToken: string)`**
   - Exports all submissions as CSV format
   - Useful for data analysis and reporting

### TypeScript Types

The library includes comprehensive TypeScript types:

- `Study` - Study metadata and configuration
- `Submission` - Participant submission data
- `Participant` - Participant information
- `StudyStatus` - Study state enum
- `SubmissionStatus` - Submission state enum
- `PaginatedResponse<T>` - API pagination wrapper
- `ProlificApiError` - Error response type
- `ProlificApiErrorClass` - Custom error class

### Error Handling

All functions throw `ProlificApiErrorClass` on errors, which includes:

- HTTP status code
- Error message from API
- Full error response object

## GitHub Actions Workflow

The workflow file (`.github/workflows/prolific.yml`) automates data collection from Prolific.

### Triggers

1. **Scheduled Run**: Every Monday at 9:00 AM UTC
2. **Manual Dispatch**: Can be triggered manually with optional study ID parameter

### Environment

- **Environment Name**: `prolific-prod`
- **Required Secret**: `TABS_PROLIFIC_TOKEN`

### Workflow Steps

1. **Checkout repository** - Get latest code
2. **Setup Node.js** - Install Node.js 20 with npm caching
3. **Install dependencies** - Run `npm ci`
4. **Verify API token** - Check that `TABS_PROLIFIC_TOKEN` is configured
5. **Run data collection** - Execute API queries and display results
6. **Summary** - Add success/failure summary to workflow run

### Output

The workflow outputs:

- User information (non-sensitive)
- Study list (if no study ID provided)
- Study details and submission statistics (no raw row-level identifiers)
- Optional CSV export to a file/artifact (opt-in; not printed to logs)

## Setup Instructions

### 1. Create Prolific API Token

1. Log in to Prolific at https://app.prolific.com/
2. Navigate to **Settings** → **API Tokens**
3. Click **"Create API Token"**
4. Give it a descriptive name (e.g., "TABS Data Collection")
5. Copy the generated token immediately (it won't be shown again)

### 2. Configure GitHub Environment and Secret

1. Go to your GitHub repository
2. Navigate to **Settings** → **Environments**
3. Verify that the `prolific-prod` environment exists
4. Click on `prolific-prod` to configure it
5. Under **Environment secrets**, add:
   - Name: `TABS_PROLIFIC_TOKEN`
   - Value: [paste your Prolific API token]
6. Click **Add secret**

### 3. Verify Setup

Run the workflow manually to verify setup:

1. Go to **Actions** tab in GitHub
2. Select **"Prolific Survey Data Collection"** workflow
3. Click **"Run workflow"**
4. Leave study ID blank to list all studies
5. Click **"Run workflow"**
6. Check the workflow run logs for successful connection

## Qualtrics ↔ Prolific Survey Setup

This section covers the **Qualtrics-side configuration** needed for a Prolific study that launches a Qualtrics survey and requires:

- Prolific URL parameters stored in Qualtrics as Embedded Data: `PROLIFIC_PID`, `STUDY_ID`, `SESSION_ID`
- Support for **non‑Prolific respondents** (e.g., users coming from our website) while still capturing responses
- Conditional end-of-survey redirect:
  - Prolific respondents → redirect back to Prolific completion URL
  - Website/other respondents → redirect to a website completion page
- Prolific “Authenticity checks (beta)” script injected into the Qualtrics survey header

### 1. Embedded Data fields

Add these Embedded Data fields (exact names):

- `PROLIFIC_PID`
- `STUDY_ID`
- `SESSION_ID`
- `SOURCE`
- `COMPLETE_URL`

You can add them via **Survey Flow** (Embedded Data element near the top) or rely on the automation in this repo (recommended).

Notes:

- Prolific appends these as URL parameters when participants launch your survey.
- Qualtrics needs the fields present so the values are captured/stored.
- `SOURCE` is used to tag where the respondent came from (e.g., `prolific`, `website`, `unknown`).
- `COMPLETE_URL` is used to drive the end-of-survey redirect destination.

### 2. Conditional completion redirect (Prolific + website)

1. In Qualtrics, configure the end-of-survey action to **Redirect to a URL**.
2. Set the redirect URL to the following piped text (exact string):
   - `${e://Field/COMPLETE_URL}`

Notes:

- Some Qualtrics tenants expose this as **Survey Options** fields (`SurveyTermination` + `EOSRedirectURL`) rather than a Survey Flow element. In our tenant, the API-validated termination value is `Redirect` (capital R) and the redirect URL is stored in `EOSRedirectURL`.

How it works:

- With **redirect lockdown enabled** (`lock_down_redirect=true`), respondents do **not** need to pass `COMPLETE_URL` at all.
  - Survey Flow overwrites `COMPLETE_URL` to the Prolific completion URL when `PROLIFIC_PID` is present.
  - Otherwise `COMPLETE_URL` remains the website completion page.
- With **redirect lockdown disabled**, `COMPLETE_URL` comes from the inbound survey link.
  - Prolific links should pass `COMPLETE_URL` pointing to the Prolific completion URL.
  - Website links should pass `COMPLETE_URL` pointing to the website completion page.

Security note:

- Treat Prolific completion codes as sensitive (don’t commit them to the repo; don’t paste them into public logs).
- Using `${e://Field/COMPLETE_URL}` can become an **open redirect** if you accept arbitrary `COMPLETE_URL` values from inbound URLs.
  - Recommended mitigation: enable **redirect lockdown** in the LIVE apply workflow (`lock_down_redirect=true`). This overwrites `COMPLETE_URL` in **Survey Flow** to one of two allowlisted destinations:
    - Prolific completion URL (when `PROLIFIC_PID` is present)
    - Website completion URL (default)
  - With redirect lockdown enabled, inbound links do not need to pass `COMPLETE_URL` at all (and passing it has no effect).

Recommended Prolific External URL format:

- Use the Qualtrics survey link, with Prolific placeholders and extra parameters.
- If you have **redirect lockdown enabled**, you can omit `COMPLETE_URL` entirely.
  - `PROLIFIC_PID={{%PROLIFIC_PID%}}`
  - `STUDY_ID={{%STUDY_ID%}}`
  - `SESSION_ID={{%SESSION_ID%}}`
  - `SOURCE=prolific`
  - `COMPLETE_URL=<URL-encoded Prolific completion URL>`

Example (line breaks for readability):

```text
https://<your-dc>.qualtrics.com/jfe/form/<SURVEY_ID>
   ?PROLIFIC_PID={{%PROLIFIC_PID%}}
   &STUDY_ID={{%STUDY_ID%}}
   &SESSION_ID={{%SESSION_ID%}}
   &SOURCE=prolific
   &COMPLETE_URL=https%3A%2F%2Fapp.prolific.com%2Fsubmissions%2Fcomplete%3Fcc%3D<YOUR_CODE>
```

Recommended website link format:

- Use `SOURCE=TABS_Website` and pass `COMPLETE_URL` pointing to the website completion page.

### 3. Prolific authenticity checks script (Qualtrics header)

If you are using Prolific’s “Authenticity checks (beta)”, ensure the Prolific-provided Qualtrics script is placed in the **survey header** (not a question block) per Prolific instructions.

Automation note (recommended):

- Store the entire script as a single secret named `PROLIFIC_QUALTRICS_AUTHENTICITY_SCRIPT`.
- The apply tooling will inject it into the survey header when that secret is present (or when the workflow input `apply_authenticity_script` is enabled in GitHub Actions).

After editing, make sure the survey is saved and any required publish/activate step is completed.

Important: In some Qualtrics tenants, API changes update the editor/draft configuration but do **not** immediately affect the anonymous link respondent experience until you click **Publish** in the Qualtrics UI.

If you want to probe whether your tenant supports publishing via API, try these local scripts (they prompt for tokens; nothing is committed):

- List versions (read-only): [scripts/qualtrics-list-survey-versions.prompt.ps1](scripts/qualtrics-list-survey-versions.prompt.ps1)
- Attempt publish (writes; requires typing `PUBLISH`): [scripts/qualtrics-publish-survey-version.prompt.ps1](scripts/qualtrics-publish-survey-version.prompt.ps1)

## Qualtrics ↔ Prolific Verification Workflow

This repo includes an API-only verification workflow that checks the survey definition for:

- Survey termination is Redirect and end-of-survey redirect is data-driven: `EOSRedirectURL=${e://Field/COMPLETE_URL}`
- Embedded Data fields exist: `PROLIFIC_PID`, `STUDY_ID`, `SESSION_ID`, `SOURCE`, `COMPLETE_URL`
- Prolific authenticity script marker (only when configured/enabled)

Workflow: [​.github/workflows/qualtrics-prolific-verify.yml](.github/workflows/qualtrics-prolific-verify.yml)

### How to run

From the GitHub UI:

1. Go to **Actions** → **Verify Qualtrics ↔ Prolific Survey Setup**
2. Click **Run workflow**
3. Optionally provide a `survey_id` input (otherwise it uses `QUALTRICS_SURVEY_ID` from the `qualtrics-prod` environment)

From the GitHub CLI:

```bash
gh workflow run qualtrics-prolific-verify.yml
```

### Expected result

- If configured correctly: the workflow passes.
- If not: the workflow fails and lists exactly which marker(s) are missing.

## Apply Qualtrics ↔ Prolific config (LIVE)

If you want to apply the required Qualtrics-side configuration **via API** (rather than clicking in the Qualtrics UI), use the live apply workflow:

- Workflow: [.github/workflows/qualtrics-prolific-apply.yml](.github/workflows/qualtrics-prolific-apply.yml)

What it does (API-only):

- Ensures Embedded Data fields exist: `PROLIFIC_PID`, `STUDY_ID`, `SESSION_ID`, `SOURCE`, `COMPLETE_URL`
- Ensures end-of-survey redirect is enabled and points to `${e://Field/COMPLETE_URL}`
- Sets default `SOURCE=unknown`
- Sets default `COMPLETE_URL` to the website completion page (safe default for non‑Prolific traffic)
- If `lock_down_redirect=true`, Survey Flow will overwrite `COMPLETE_URL` at runtime to one of two allowlisted destinations:
  - Prolific completion URL (when `PROLIFIC_PID` is present)
  - Website completion URL (default)
- Optionally injects the Prolific authenticity-checks script into the survey header (from a secret)

Required GitHub Environment secrets (in `qualtrics-prod`):

- `QUALTRICS_API_TOKEN` (already used by other Qualtrics workflows)

Optional GitHub Environment variables (in `qualtrics-prod`):

- `TABS_WEBSITE_COMPLETE_URL` (optional override for the website completion page; defaults to `https://technologyadoptionbarriers.org/survey-complete`)

Optional secret (in `qualtrics-prod`):

- `PROLIFIC_QUALTRICS_AUTHENTICITY_SCRIPT` (the Prolific-provided Qualtrics script; keep out of git and logs)

Safety notes:

- This workflow modifies the **live** survey configuration. Run it only with an explicit `confirm=APPLY`.
- Secrets and full survey payloads are not printed to logs; only high-level status and markers are reported.

Publishing note:

- Some tenants require a separate **Publish** step for respondent-facing behavior to update.
- The workflow supports an optional publish attempt via API: set `publish_after_apply=true` and `publish_confirm=PUBLISH`.

## Annual survey rollover (10-year data collection)

This project runs a long-term (multi-year) data collection effort. To reduce yearly admin work, this repo includes GitHub Actions automation to:

1. Create a new “yearly copy” of the active Qualtrics survey via API.
2. Verify the Qualtrics survey still has the required Prolific integration markers.

### Recommended yearly sequence

1. Run the Qualtrics API smoke test (quick credential/connectivity check):
   - Workflow: [​.github/workflows/qualtrics-api-smoke.yml](.github/workflows/qualtrics-api-smoke.yml)
2. Create the new survey copy:
   - Workflow: [​.github/workflows/qualtrics-copy-survey.yml](.github/workflows/qualtrics-copy-survey.yml)
   - Result: outputs a new Survey ID in the workflow summary.
3. Update GitHub Environment `qualtrics-prod` → `QUALTRICS_SURVEY_ID` to the new Survey ID.
4. Re-run verification against the new Survey ID:
   - Workflow: [​.github/workflows/qualtrics-prolific-verify.yml](.github/workflows/qualtrics-prolific-verify.yml)
5. Update the Prolific study’s external URL to point at the new Qualtrics survey link.

This workflow-first approach reduces manual steps in Qualtrics and helps keep each year’s survey setup consistent.

## Usage Examples

### List All Studies

Run the workflow without a study ID to see all studies:

```bash
gh workflow run prolific.yml
```

Or via GitHub web interface:

1. Actions → Prolific Survey Data Collection → Run workflow
2. Leave "study_id" blank
3. Click "Run workflow"

### Get Specific Study Data

Run the workflow with a study ID to get detailed statistics:

```bash
gh workflow run prolific.yml -f study_id=your-study-id-here
```

Or via GitHub web interface:

1. Actions → Prolific Survey Data Collection → Run workflow
2. Enter study ID in "study_id" field
3. Click "Run workflow"

### Using the API Client in Code

```typescript
import {
  getCurrentUser,
  listStudies,
  getStudyStatistics,
  exportSubmissionsCSV,
} from '@/lib/prolific-api'

const API_TOKEN = process.env.PROLIFIC_API_TOKEN

// Get current user
const user = await getCurrentUser(API_TOKEN)
console.log(`Connected as: ${user.name}`)

// List all studies
const studies = await listStudies(API_TOKEN)
console.log(`Found ${studies.results.length} studies`)

// Get study statistics
const stats = await getStudyStatistics('study-123', API_TOKEN)
console.log(`Approved: ${stats.approvedSubmissions}`)
console.log(`Average time: ${stats.averageTimeMinutes} minutes`)

// Export submissions
const csv = await exportSubmissionsCSV('study-123', API_TOKEN)
console.log(csv)
```

## API Features

### Study Management

- **List Studies**: Get all studies with filtering and pagination
- **Study Details**: Retrieve complete study configuration
- **Study Status**: Track study lifecycle (UNPUBLISHED, ACTIVE, SCHEDULED, COMPLETED, AWAITING REVIEW)

### Submission Tracking

- **List Submissions**: Get all participant submissions for a study
- **Submission Status**: Track individual submission states
  - RESERVED - Participant reserved a place
  - ACTIVE - Participant is currently taking the study
  - AWAITING REVIEW - Submission needs manual review
  - APPROVED - Submission approved and participant paid
  - REJECTED - Submission rejected
  - RETURNED - Participant returned the submission
  - TIMED-OUT - Participant exceeded time limit
- **Time Tracking**: Monitor actual vs. expected completion times
- **Participant Data**: Access participant IDs and metadata

### Statistics and Analytics

- **Approval Rates**: Calculate percentage of approved submissions
- **Completion Rates**: Track how many participants complete the study
- **Timing Analysis**: Analyze actual completion times vs. estimates
- **Data Export**: Export submission data as CSV for analysis

### Data Quality

- **Participant Screening**: Prolific pre-screens participants
- **Attention Checks**: Built-in quality control mechanisms
- **Review Workflow**: Manual review for flagged submissions

## Security Considerations

### API Token Security

⚠️ **CRITICAL**: Never expose your Prolific API token in:

- Client-side code
- Public repositories
- Logs or console output
- Error messages
- Screenshots or documentation

### Best Practices

1. **Store tokens in GitHub Secrets**: Use the `prolific-prod` environment with secret storage
2. **Use environment-specific tokens**: Create separate tokens for production and testing
3. **Rotate tokens regularly**: Generate new tokens periodically
4. **Monitor token usage**: Check Prolific dashboard for unexpected API usage
5. **Delete unused tokens**: Remove tokens that are no longer needed
6. **Limit token permissions**: Use workspace-specific tokens when possible

### GitHub Environment Protection

The `prolific-prod` environment provides:

- **Secret encryption**: Secrets are encrypted at rest
- **Access control**: Only authorized workflows can access the environment
- **Audit logging**: All secret access is logged

### Data Privacy

When collecting participant data:

1. **Anonymize data**: Prolific provides participant IDs, not personal information
2. **Follow GDPR**: Respect data protection regulations
3. **Secure storage**: If storing data, use encrypted storage
4. **Data retention**: Delete data when no longer needed
5. **Access control**: Limit who can view participant data

## Troubleshooting

### Common Issues

#### 1. "Invalid token" error (401 Unauthorized)

**Cause**: API token is invalid, expired, or incorrectly configured

**Solution**:

- Verify the token is correctly set in GitHub Secrets
- Check that the token hasn't been deleted in Prolific dashboard
- Try creating a new API token

#### 2. "Study not found" error (404 Not Found)

**Cause**: Study ID doesn't exist or you don't have access

**Solution**:

- Verify the study ID is correct
- Check that the study belongs to your Prolific account
- Ensure you're using the correct workspace token

#### 3. Workflow fails to run

**Cause**: Environment or secret not configured

**Solution**:

- Verify `prolific-prod` environment exists
- Check that `TABS_PROLIFIC_TOKEN` secret is set
- Ensure you have repository permissions to run workflows

#### 4. Network timeout errors

**Cause**: Prolific API is temporarily unavailable

**Solution**:

- Wait a few minutes and try again
- Check Prolific status page for outages
- Contact Prolific support if issue persists

#### 5. Rate limiting errors (429 Too Many Requests)

**Cause**: Too many API requests in a short time

**Solution**:

- Reduce frequency of workflow runs
- Implement exponential backoff in custom scripts
- Contact Prolific to increase rate limits if needed

### Debug Mode

To enable detailed logging in the workflow:

1. Edit `.github/workflows/prolific.yml`
2. Add `ACTIONS_STEP_DEBUG: true` to env section
3. Re-run the workflow

### Getting Help

- **Prolific API Documentation**: https://docs.prolific.com/api-reference/introduction/basic
- **Prolific Support**: support@prolific.com
- **GitHub Issues**: Report issues in this repository
- **Community**: Prolific API community forums

## Additional Resources

### Official Documentation

- [Prolific API Documentation](https://docs.prolific.com/api-reference/introduction/basic)
- [API Fundamentals](https://docs.prolific.com/documentation/get-started/api-fundamentals)
- [Submissions Guide](https://docs.prolific.com/api-reference/submissions/submissions-guide)

### Related Files

- API Client: `src/lib/prolific-api.ts`
- Tests: `__tests__/lib/prolific-api.test.ts`
- Workflow: `.github/workflows/prolific.yml`
- External Dependencies: `EXTERNAL_DEPENDENCIES.md`

### Code Examples

See the test file (`__tests__/lib/prolific-api.test.ts`) for comprehensive examples of using each API function.

## Changelog

### January 15, 2026

- Initial implementation of Prolific API integration
- Created API client library with TypeScript support
- Added GitHub Actions workflow for automated data collection
- Comprehensive unit tests with 100% coverage
- Documentation and setup guide

## Future Enhancements

Potential improvements for future iterations:

1. **Data Storage**: Save collected data to GitHub repository or external database
2. **Notifications**: Send alerts when studies are completed or need review
3. **Automated Approvals**: Implement rules-based automatic submission approval
4. **Dashboard**: Create web dashboard for visualizing study data
5. **Participant Management**: Expand to include participant screening and targeting
6. **Bonus Payments**: Automate bonus payments based on performance
7. **Multi-Study Analysis**: Compare metrics across multiple studies
8. **Export Formats**: Support additional export formats (JSON, Excel)

## Contributing

When making changes to the Prolific integration:

1. Update the API client library (`src/lib/prolific-api.ts`)
2. Add corresponding tests (`__tests__/lib/prolific-api.test.ts`)
3. Update this documentation
4. Test with the GitHub Actions workflow
5. Follow security best practices for API tokens
