# API Integration Guide

**Last Updated:** January 24, 2026

This comprehensive guide explains all external API integrations used in the TABS project, including setup, usage, workflows, and best practices.

## Table of Contents

- [Overview](#overview)
- [Qualtrics API v3](#qualtrics-api-v3)
- [Prolific API v1](#prolific-api-v1)
- [Google Analytics Data API v1](#google-analytics-data-api-v1)
- [API Security Best Practices](#api-security-best-practices)
- [GitHub Environments](#github-environments)
- [Workflow Automation](#workflow-automation)
- [Local Development](#local-development)
- [Troubleshooting](#troubleshooting)

## Overview

The TABS project integrates with three primary external APIs:

1. **Qualtrics API v3** - Survey management and data collection
2. **Prolific API v1** - Participant recruitment and study management
3. **Google Analytics Data API v1** - Analytics reporting and impact metrics

All APIs are accessed through:

- **GitHub Actions workflows** for automation (using environment-specific secrets)
- **TypeScript client libraries** for programmatic access
- **MCP servers** for AI coding agent integration (where available)

## Qualtrics API v3

### Purpose

The Qualtrics REST API v3 enables automated survey management for long-term (10-year) data collection:

- **Annual Survey Rollover:** Copy surveys for yearly data collection cycles
- **Configuration Management:** Automated setup of Embedded Data fields and redirects
- **Question Inventory:** Extract survey questions and metadata
- **Integration Verification:** Validate Prolific ↔ Qualtrics configuration

### Base URL

```
https://<your-datacenter>.qualtrics.com
```

Replace `<your-datacenter>` with your Qualtrics brand/cluster hostname (e.g., `smeal.yul1.qualtrics.com`, `by-brand.iad1.qualtrics.com`). The API client automatically appends `/API/v3` to the base URL for API requests.

### Authentication

All requests require an API token sent via the `X-API-TOKEN` header:

```bash
curl -H "X-API-TOKEN: $QUALTRICS_API_TOKEN" \
  "$QUALTRICS_BASE_URL/API/v3/surveys"
```

### Client Library

**Location:** `src/lib/qualtrics-api.ts`

**Available Functions:**

- `listSurveys()` - List all surveys in account
- `getSurvey(surveyId)` - Get survey metadata
- `copySurvey(sourceSurveyId, projectName)` - Copy survey for annual rollover
- `getSurveyDefinition(surveyId)` - Get complete survey definition
- `getSurveyFlow(surveyId)` - Get Survey Flow configuration
- `updateSurveyFlow(surveyId, flowData)` - Update Survey Flow
- `insertEmbeddedData(surveyId, fields)` - Add Embedded Data fields

### GitHub Environment: `qualtrics-prod`

**Required Secrets:**

- `QUALTRICS_API_TOKEN` - API authentication token

**Prolific Integration Secrets (required for Prolific workflows):**

- **One of:**
  - `PROLIFIC_COMPLETION_URL` - Prolific completion URL used for redirect on successful survey completion (preferred)
  - `PROLIFIC_COMPLETION_CODE_SUCCESS` - Prolific completion code used when a URL is not provided

**Required Variables:**

- `QUALTRICS_BASE_URL` - Base URL (e.g., `https://smeal.yul1.qualtrics.com`)
- `QUALTRICS_SURVEY_ID` - Active survey ID for automation
- `QUALTRICS_COPY_DESTINATION_OWNER` - Owner ID for survey copies (some tenants require this)

**Optional Secrets:**

- `PROLIFIC_QUALTRICS_AUTHENTICITY_SCRIPT` - Prolific authenticity checks script (required only if authenticity checks are enabled)
- `QUALTRICS_USERID` - Qualtrics user ID (used by smoke-test workflows)
- `QUALTRICS_USERNAME` - Qualtrics username (used by smoke-test workflows)

### Automated Workflows

#### 1. Survey Copy (Annual Rollover)

**Workflow:** `.github/workflows/qualtrics-copy-survey.yml`

**Purpose:** Create a new survey copy for the next data collection year

**Usage:**

```bash
# Via GitHub UI
Actions → Qualtrics Survey Copy → Run workflow
  - Optional: specify source survey ID
  - Optional: specify destination survey name

# Via GitHub CLI
gh workflow run qualtrics-copy-survey.yml \
  -f source_survey_id=SV_abc123 \
  -f destination_survey_name="TABS Survey 2026"
```

**Output:** New survey ID in workflow summary

#### 2. Prolific Integration Configuration (LIVE)

**Workflow:** `.github/workflows/qualtrics-prolific-apply.yml`

**Purpose:** Apply Qualtrics-side configuration for Prolific integration via API

**What it configures:**

- Embedded Data fields: `PROLIFIC_PID`, `STUDY_ID`, `SESSION_ID`, `SOURCE`, `COMPLETE_URL`
- End-of-survey redirect to `${e://Field/COMPLETE_URL}`
- Default `SOURCE=unknown` and `COMPLETE_URL` pointing to website completion page
- Optional redirect lockdown (overwrites `COMPLETE_URL` at runtime for security)
- Optional Prolific authenticity script injection

**Usage:**

```bash
# Via GitHub UI
Actions → Apply Qualtrics ↔ Prolific Config (LIVE) → Run workflow
  - confirm: APPLY (required)
  - lock_down_redirect: true (recommended)
  - apply_authenticity_script: true (optional)
  - publish_after_apply: true (optional, some tenants require publish)
  - publish_confirm: PUBLISH (required if publishing)

# Via GitHub CLI
gh workflow run qualtrics-prolific-apply.yml \
  -f confirm=APPLY \
  -f lock_down_redirect=true
```

**⚠️ Warning:** This modifies the LIVE survey configuration. Only run with explicit confirmation.

#### 3. Prolific Integration Verification

**Workflow:** `.github/workflows/qualtrics-prolific-verify.yml`

**Purpose:** Verify Qualtrics survey has required Prolific integration markers

**Checks:**

- Survey termination is Redirect
- End-of-survey redirect URL is `${e://Field/COMPLETE_URL}`
- Embedded Data fields exist
- Prolific authenticity script (if configured)

**Usage:**

```bash
# Via GitHub UI
Actions → Verify Qualtrics ↔ Prolific Survey Setup → Run workflow
  - Optional: specify survey ID (defaults to QUALTRICS_SURVEY_ID)

# Via GitHub CLI
gh workflow run qualtrics-prolific-verify.yml
```

**Output:** Pass/fail status with detailed marker checks

#### 4. Metrics Update

**Workflow:** `.github/workflows/qualtrics-metrics-update.yml`

**Purpose:** Update survey metrics and metadata

**Usage:**

```bash
gh workflow run qualtrics-metrics-update.yml
```

#### 5. Question Fetching

**Workflow:** `.github/workflows/fetch-qualtrics-questions.yml`

**Purpose:** Extract survey questions and metadata

**Usage:**

```bash
gh workflow run fetch-qualtrics-questions.yml
```

#### 6. API Connectivity Test

**Workflow:** `.github/workflows/qualtrics-api-smoke.yml`

**Purpose:** Quick connectivity and credential verification

**Usage:**

```bash
# Run this first to verify setup
gh workflow run qualtrics-api-smoke.yml
```

**Output:** Connection status, user info, survey count

### Annual Survey Rollover Process

The recommended sequence for yearly survey rollover:

1. **Test Connectivity**

   ```bash
   gh workflow run qualtrics-api-smoke.yml
   ```

2. **Copy Survey**

   ```bash
   gh workflow run qualtrics-copy-survey.yml \
     -f destination_survey_name="TABS Survey 2026"
   ```

3. **Update Environment Variable**
   - Go to Settings → Environments → qualtrics-prod
   - Update `QUALTRICS_SURVEY_ID` to new survey ID

4. **Verify Configuration**

   ```bash
   gh workflow run qualtrics-prolific-verify.yml
   ```

5. **Apply Prolific Integration (if needed)**

   ```bash
   gh workflow run qualtrics-prolific-apply.yml \
     -f confirm=APPLY \
     -f lock_down_redirect=true
   ```

6. **Update Prolific Study**
   - Update external URL in Prolific study settings
   - Point to new Qualtrics survey link

### Documentation

- [Qualtrics API Cheat Sheet](./qualtrics-api-cheatsheet.md) - Quick reference
- [Prolific Integration Guide](./PROLIFIC_INTEGRATION.md) - Detailed Qualtrics ↔ Prolific setup

---

## Prolific API v1

### Purpose

The Prolific REST API v1 enables participant recruitment and study data collection:

- **Weekly Data Collection:** Automated submission data retrieval
- **Study Management:** List studies, get details, track status
- **Participant Data:** Export submissions, calculate statistics
- **Quality Control:** Approval rates, completion times

### Base URL

```
https://api.prolific.com/api/v1/
```

### Authentication

All requests require a Prolific API token sent via the `Authorization` header:

```bash
curl -H "Authorization: Token $PROLIFIC_API_TOKEN" \
  "https://api.prolific.com/api/v1/users/me/"
```

### Client Library

**Location:** `src/lib/prolific-api.ts`

**Available Functions:**

- `getCurrentUser(apiToken)` - Verify token and get user info
- `listStudies(apiToken)` - List all studies
- `getStudy(studyId, apiToken)` - Get study details
- `listStudySubmissions(studyId, apiToken)` - Get all submissions
- `getSubmission(studyId, submissionId, apiToken)` - Get single submission
- `getStudyStatistics(studyId, apiToken)` - Calculate approval rates, timing
- `exportSubmissionsCSV(studyId, apiToken)` - Export as CSV

### GitHub Environment: `prolific-prod`

**Required Secrets:**

- `TABS_PROLIFIC_TOKEN` - Prolific API token (mapped to `PROLIFIC_API_TOKEN` in workflows)

**Required Variables:**

- `PROLIFIC_STUDY_ID` - Default study ID for workflows

> **Note:** The Prolific API documentation and code examples refer to an environment variable named `PROLIFIC_API_TOKEN`. In this repository, the GitHub environment secret must be created as `TABS_PROLIFIC_TOKEN`; the workflow `.github/workflows/prolific.yml` maps that secret into the `PROLIFIC_API_TOKEN` environment variable for use in jobs.

### Automated Workflows

#### 1. Weekly Data Collection

**Workflow:** `.github/workflows/prolific.yml`

**Schedule:** Every Monday at 9:00 AM UTC

**Purpose:** Automated weekly collection of study and submission data

**Usage:**

```bash
# Manual run with default study
gh workflow run prolific.yml

# Manual run with specific study
gh workflow run prolific.yml -f study_id=<study-id>
```

**Output:**

- User information (non-sensitive)
- Study metadata and status
- Submission statistics (approval rates, timing)
- Optional CSV export (not logged by default)

### Documentation

- [Prolific Integration Guide](./PROLIFIC_INTEGRATION.md) - Complete setup and usage
- [Prolific API Documentation](https://docs.prolific.com/api-reference/introduction/basic) - Official docs

---

## Google Analytics Data API v1

### Purpose

The Google Analytics Data API v1 enables automated analytics reporting:

- **Daily Reports:** Automated generation and email delivery
- **Impact Metrics:** Website traffic, engagement, user behavior
- **Data Export:** JSON reports saved to repository
- **Public Metrics:** Update `src/data/impact.json` for website display

### Base URL

```
Google Analytics Data API (via @google-analytics/data SDK)
```

### Authentication

Service account credentials (email + private key):

```typescript
import { gaClient } from '@/lib/google-analytics'

// Client is pre-configured with service account credentials
const response = await gaClient.runReport({
  startDate: '28daysAgo',
  endDate: 'today',
  metrics: ['activeUsers', 'sessions', 'engagementRate'],
  dimensions: ['date', 'pagePath'],
})
```

### Client Library

**Location:** `src/lib/google-analytics.ts`

**Key Features:**

- Pre-configured `gaClient` with service account authentication
- Helper functions for common report types
- Error handling and retry logic

### GitHub Environment: `google-prod`

**Required Secrets:**

- `GA_PROPERTY_ID` - Raw numeric Google Analytics 4 property ID (e.g., `123456789`, without `properties/` prefix)
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` - Service account email
- `GOOGLE_PRIVATE_KEY` - Service account private key (PEM format)
- `GMAIL_APP_PASSWORD` - Gmail app password for email delivery
- `GOOGLE_PROJECT_OWNER_EMAIL` - Email sender address
- `REPORT_RECIPIENT_EMAIL` - Report recipient address

> **Important:** `GA_PROPERTY_ID` should be the raw numeric property ID only (e.g., `123456789`). The client library automatically prepends `properties/` when making API calls. Including the prefix will cause API calls to fail with `properties/properties/...`.

### Automated Workflows

#### 1. Daily Analytics Report

**Workflow:** `.github/workflows/ga-report.yml`

**Schedule:** Daily at 00:00 UTC

**Purpose:** Generate and email daily analytics report

**Usage:**

```bash
# Manual run
gh workflow run ga-report.yml
```

**Output:**

- `reports/ga-report-YYYY-MM-DD.json` - Full report data
- `src/data/impact.json` - Public-facing metrics
- Email sent to stakeholders with summary

### Scripts

**Location:** `scripts/`

**Available Scripts:**

- `generate-report.ts` - Fetch GA data and generate report
- `send-report-email.ts` - Email report to stakeholders

**Local Usage:**

```bash
# Set environment variables
export GA_PROPERTY_ID="123456789"
export GOOGLE_SERVICE_ACCOUNT_EMAIL="service@project.iam.gserviceaccount.com"
export GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Generate report
npx tsx scripts/generate-report.ts

# Send report email (requires email credentials)
export GMAIL_APP_PASSWORD="your-app-password"
export GOOGLE_PROJECT_OWNER_EMAIL="sender@example.com"
export REPORT_RECIPIENT_EMAIL="recipient@example.com"
npx tsx scripts/send-report-email.ts
```

### Documentation

- [Google Analytics Data API](https://developers.google.com/analytics/devguides/reporting/data/v1) - Official docs

---

## API Security Best Practices

### Never Commit Credentials

⚠️ **CRITICAL:** Never commit API tokens or credentials to the repository

**What NOT to commit:**

- API tokens
- OAuth access tokens
- Private keys
- Passwords
- Client secrets

**Safe storage locations:**

- GitHub Actions environment secrets (for CI/CD)
- Local environment variables (for development)
- MCP OAuth prompts (for interactive use)

### GitHub Environment Secrets

All API credentials are stored as GitHub Actions environment secrets:

**Creating Environment Secrets:**

1. Go to repository Settings → Environments
2. Select environment (e.g., `qualtrics-prod`)
3. Click "Add secret"
4. Enter name (e.g., `QUALTRICS_API_TOKEN`) and value
5. Click "Add secret"

**Accessing in Workflows:**

```yaml
- name: Use API
  env:
    API_TOKEN: ${{ secrets.QUALTRICS_API_TOKEN }}
  run: |
    curl -H "X-API-TOKEN: $API_TOKEN" ...
```

**Important:** Secrets are encrypted at rest and never exposed in logs

### Local Development

For local testing, use environment variables (never commit them):

**Option 1: Session-only (recommended)**

```bash
# Set for current session
export QUALTRICS_API_TOKEN="your-token"
export QUALTRICS_BASE_URL="https://your-dc.qualtrics.com"
```

**Option 2: Shell profile (persistent)**

```bash
# Add to ~/.bashrc or ~/.zshrc (DO NOT commit this file)
export QUALTRICS_API_TOKEN="your-token"
export QUALTRICS_BASE_URL="https://your-dc.qualtrics.com"
```

**Option 3: MCP OAuth (for Qualtrics)**

```bash
# Copy MCP example config
cp .vscode/mcp.json.example .vscode/mcp.json

# Edit with your datacenter
# VS Code will prompt for OAuth token when connecting
```

### Token Rotation

Regularly rotate API tokens for security:

1. **Qualtrics:** Generate new API token in Qualtrics UI → Account Settings → Qualtrics IDs
2. **Prolific:** Generate new token in Prolific dashboard → Settings → API Tokens
3. **Google:** Generate new service account key in Google Cloud Console
4. Update GitHub environment secrets
5. Delete old tokens from service dashboards

---

## GitHub Environments

All external APIs use GitHub environment secrets for secure credential management:

| Environment      | API/Service             | Secrets              | Variables   | Status                  |
| ---------------- | ----------------------- | -------------------- | ----------- | ----------------------- |
| `qualtrics-prod` | Qualtrics API v3        | 7 secrets            | 3 variables | ✅ Active (6 workflows) |
| `prolific-prod`  | Prolific API v1         | 1 secret             | 1 variable  | ✅ Active (1 workflow)  |
| `google-prod`    | Google Analytics Data   | 6 secrets            | -           | ✅ Active (1 workflow)  |
| `microsoft-prod` | Microsoft Forms         | 1 secret             | -           | ⚠️ Configured (future)  |
| `stripe-prod`    | Payment processing      | 1 secret             | -           | ⚠️ Configured (future)  |
| `github-pages`   | GitHub Pages deployment | Auto token           | -           | ✅ Active (deployment)  |
| `copilot`        | MCP servers             | MCP-prefixed secrets | -           | ✅ Active (MCP servers) |

**Legend:**

- ✅ **Active** - Used in GitHub Actions workflows
- ⚠️ **Configured** - Secrets set up for future integrations
- All environments are **only accessible in GitHub Actions**
- Local development requires separate credential setup

---

## Workflow Automation

### Workflow Triggers

**Schedule-based:**

- Prolific data collection: Weekly (Mondays 9 AM UTC)
- Google Analytics report: Daily (00:00 UTC)

**Manual dispatch:**

- All workflows support `workflow_dispatch` for manual triggering
- Use GitHub UI or `gh workflow run` command

**Event-based:**

- CI/CD workflows: Push to `main`, pull request events
- CodeQL: Weekly security scans

### Workflow Best Practices

1. **Test connectivity first:** Run smoke tests before production workflows
2. **Use manual dispatch:** Test workflows with `workflow_dispatch` before scheduling
3. **Monitor logs:** Check workflow run logs for errors
4. **Set up notifications:** Configure GitHub notifications for workflow failures
5. **Review outputs:** Check workflow summaries for results

---

## Local Development

### Setting Up Local Environment

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set environment variables:**

   ```bash
   # Qualtrics
   export QUALTRICS_API_TOKEN="your-token"
   export QUALTRICS_BASE_URL="https://your-dc.qualtrics.com"
   export QUALTRICS_SURVEY_ID="SV_abc123"

   # Prolific
   export PROLIFIC_API_TOKEN="your-token"
   export PROLIFIC_STUDY_ID="your-study-id"

   # Google Analytics (raw numeric ID only, no "properties/" prefix)
   export GA_PROPERTY_ID="123456789"
   export GOOGLE_SERVICE_ACCOUNT_EMAIL="service@project.iam.gserviceaccount.com"
   export GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

3. **Test API connectivity:**

   ```bash
   # Qualtrics
   curl -H "X-API-TOKEN: $QUALTRICS_API_TOKEN" \
     "$QUALTRICS_BASE_URL/API/v3/surveys"

   # Prolific
   curl -H "Authorization: Token $PROLIFIC_API_TOKEN" \
     "https://api.prolific.com/api/v1/users/me/"
   ```

4. **Run TypeScript scripts:**

   ```bash
   # Qualtrics
   npx tsx scripts/fetch-qualtrics-questions.ts

   # Prolific
   npx tsx scripts/collect-prolific-data.ts

   # Google Analytics
   npx tsx scripts/generate-report.ts
   ```

### Using Client Libraries

**Qualtrics:**

```typescript
import { listSurveys, copySurvey } from '@/lib/qualtrics-api'

const token = process.env.QUALTRICS_API_TOKEN
const baseUrl = process.env.QUALTRICS_BASE_URL

const surveys = await listSurveys(token, baseUrl)
console.log(`Found ${surveys.length} surveys`)

const newSurvey = await copySurvey('SV_source', 'New Survey Name', token, baseUrl)
console.log(`Created survey: ${newSurvey.id}`)
```

**Prolific:**

```typescript
import { getCurrentUser, listStudies } from '@/lib/prolific-api'

const token = process.env.PROLIFIC_API_TOKEN

const user = await getCurrentUser(token)
console.log(`Connected as: ${user.name}`)

const studies = await listStudies(token)
console.log(`Found ${studies.results.length} studies`)
```

**Google Analytics:**

```typescript
import { gaClient } from '@/lib/google-analytics'

const response = await gaClient.runReport({
  startDate: '7daysAgo',
  endDate: 'today',
  metrics: ['activeUsers', 'sessions'],
  dimensions: ['date'],
})

console.log(response.rows)
```

---

## Troubleshooting

### Common Issues

#### 1. API Token Invalid (401 Unauthorized)

**Symptom:** API requests return 401 or "Invalid token"

**Causes:**

- Token expired or deleted
- Token not set in environment/secrets
- Wrong token for environment (dev vs. prod)

**Solutions:**

- Verify token in service dashboard (Qualtrics, Prolific, Google Cloud)
- Check GitHub environment secrets are set correctly
- Generate new token if expired
- Test locally with `curl` before running workflows

#### 2. Survey Not Found (404 Not Found)

**Symptom:** Qualtrics API returns "Survey not found"

**Causes:**

- Wrong survey ID
- Survey deleted or archived
- User doesn't have access to survey

**Solutions:**

- Verify survey ID in Qualtrics UI
- Check survey ownership and permissions
- Use `listSurveys()` to find correct survey ID

#### 3. Study Not Found (404 Not Found)

**Symptom:** Prolific API returns "Study not found"

**Causes:**

- Wrong study ID
- Study belongs to different workspace
- Token doesn't have access

**Solutions:**

- Verify study ID in Prolific dashboard
- Check token workspace permissions
- Use `listStudies()` to find correct study ID

#### 4. Google Analytics Property Not Found

**Symptom:** GA API returns "Property not found"

**Causes:**

- Wrong property ID format
- Service account not granted access
- Property doesn't exist

**Solutions:**

- Verify property ID: use the raw numeric ID (e.g., `123456789`), not prefixed with `properties/` — the client library prepends that internally
- Grant service account "Viewer" role in GA4 property settings
- Check property exists in Google Analytics UI

#### 5. Workflow Fails with Environment Errors

**Symptom:** Workflow fails with "environment not found" or "secret not set"

**Causes:**

- Environment not created
- Secret not added to environment
- Workflow referencing wrong environment

**Solutions:**

- Create environment in Settings → Environments
- Add required secrets to environment
- Verify workflow YAML uses correct environment name

#### 6. Rate Limiting (429 Too Many Requests)

**Symptom:** API returns 429 or rate limit errors

**Causes:**

- Too many requests in short time
- Workflow running too frequently

**Solutions:**

- Reduce workflow frequency
- Add delays between API calls
- Contact API provider for rate limit increase

### Debug Mode

Enable detailed logging in workflows:

```yaml
env:
  ACTIONS_STEP_DEBUG: true
```

Or set repository secret `ACTIONS_STEP_DEBUG` to `true`.

### Getting Help

**Qualtrics:**

- Qualtrics Support: https://www.qualtrics.com/support/
- API Documentation: https://api.qualtrics.com/

**Prolific:**

- Prolific Support: support@prolific.com
- API Documentation: https://docs.prolific.com/

**Google Analytics:**

- Google Analytics Support: https://support.google.com/analytics/
- API Documentation: https://developers.google.com/analytics/devguides/reporting/data/v1

**This Project:**

- GitHub Issues: https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues
- Email: contact@technologyadoptionbarriers.org

---

## Additional Resources

### Related Documentation

- [Qualtrics API Cheat Sheet](./qualtrics-api-cheatsheet.md)
- [Qualtrics MCP Guide](./qualtrics-mcp.md)
- [Prolific Integration Guide](./PROLIFIC_INTEGRATION.md)
- [MCP Servers Documentation](./MCP_SERVERS.md)
- [External Dependencies](./EXTERNAL_DEPENDENCIES.md)

### Official API Documentation

- [Qualtrics API Reference](https://api.qualtrics.com/)
- [Prolific API Reference](https://docs.prolific.com/api-reference/introduction/basic)
- [Google Analytics Data API](https://developers.google.com/analytics/devguides/reporting/data/v1)

### Internal Workflows

All workflows are in `.github/workflows/`:

- `qualtrics-*.yml` - Qualtrics API workflows (6 files)
- `prolific.yml` - Prolific data collection
- `ga-report.yml` - Google Analytics reporting

---

**Last Updated:** January 24, 2026  
**Version:** 1.0.0  
**Maintainer:** Clarke Moyer (contact@technologyadoptionbarriers.org)
