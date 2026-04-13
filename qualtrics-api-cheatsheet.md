# Qualtrics API v3 Cheat Sheet (REST)

This repo primarily automates Qualtrics through the **Public API v3**.

- Base URL pattern: `https://<your-datacenter>.qualtrics.com/API/v3`
- Auth header: `X-API-TOKEN: <your token>`
- Typical headers: `Accept: application/json` (and `Content-Type: application/json` for JSON bodies)

> Tip: In this repo’s workflows, `QUALTRICS_BASE_URL` is usually the host root (e.g. `https://your-datacenter.qualtrics.com`) and we append `/API/v3/...`.

## Common endpoints

### List surveys

- `GET /surveys`
- Pagination: `?offset=<opaque string>` (returned in `result.nextPage` or similar, depending on endpoint)

```bash
curl -sS \
  -H "X-API-TOKEN: $QUALTRICS_API_TOKEN" \
  -H "Accept: application/json" \
  "$QUALTRICS_BASE_URL/API/v3/surveys"
```

### Get survey metadata

- `GET /surveys/{surveyId}`

```bash
curl -sS \
  -H "X-API-TOKEN: $QUALTRICS_API_TOKEN" \
  -H "Accept: application/json" \
  "$QUALTRICS_BASE_URL/API/v3/surveys/$SURVEY_ID"
```

### Copy a survey (preferred, API-supported)

Qualtrics supports copying via `POST /surveys` with an `X-Copy-Source` header.

- `POST /surveys`
- Required header: `X-Copy-Source: <sourceSurveyId>`
- Optional header: `X-Copy-Destination-Owner: <ownerId>`
- Optional JSON body: `{ "projectName": "New Survey Name" }`

```bash
curl -sS \
  -X POST \
  -H "X-API-TOKEN: $QUALTRICS_API_TOKEN" \
  -H "X-Copy-Source: $SOURCE_SURVEY_ID" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"projectName":"My Copied Survey"}' \
  "$QUALTRICS_BASE_URL/API/v3/surveys"
```

Notes:

- There can be a delay before the new survey appears in the Qualtrics UI.
- If the caller doesn’t have copy/edit permissions for the source survey, copy can fail even if the survey appears in list endpoints.
- Some tenants require `X-Copy-Destination-Owner` (the workflow in this repo derives it from the source survey’s `ownerId`).

## Annual survey rollover (10-year collection)

This repo supports a low-effort “yearly rollover” workflow for long-running (multi-year) data collection:

1. Copy the active survey to a new “year N” survey via API.
2. Update the environment variable used by automation to point at the new survey.
3. Update the Prolific study external URL to point at the new survey link.

This reduces admin effort because the yearly survey creation + verification can be done from GitHub Actions, without manual Qualtrics export/import.

In this repo:

- Survey copy: `.github/workflows/qualtrics-copy-survey.yml`
- Qualtrics ↔ Prolific verification: `.github/workflows/qualtrics-prolific-verify.yml`

Suggested yearly sequence:

1. Run the copy workflow.
2. Update GitHub Environment `qualtrics-prod` → `QUALTRICS_SURVEY_ID` to the new Survey ID.
3. Run the verification workflow against the new Survey ID.
4. Update the Prolific study to point at the new survey link.

## Survey definition / export

Different tenants expose different “definition” or “export” endpoints. This repo tries the “definition” endpoints first because they are often simpler.

### Fetch survey definition (try these first)

- `GET /survey-definitions/{surveyId}`
- `GET /surveys/{surveyId}/definition`

```bash
curl -sS \
  -H "X-API-TOKEN: $QUALTRICS_API_TOKEN" \
  -H "Accept: application/json" \
  "$QUALTRICS_BASE_URL/API/v3/survey-definitions/$SURVEY_ID"

curl -sS \
  -H "X-API-TOKEN: $QUALTRICS_API_TOKEN" \
  -H "Accept: application/json" \
  "$QUALTRICS_BASE_URL/API/v3/surveys/$SURVEY_ID/definition"
```

### Async export (fallback)

Some exports are handled via an async job:

1. Start export

- `POST /surveys/{surveyId}/export`

2. Poll status

- `GET /surveys/{surveyId}/export/{progressId}`

3. Download file

- `GET /surveys/{surveyId}/export/{fileId}/file`

If your tenant returns 404 for these export endpoints, prefer the “definition” endpoints above.

## Survey Flow (Embedded Data, End of Survey)

Some survey configuration (like Survey Flow Embedded Data fields and End-of-Survey redirects) can be managed via the Survey Flow endpoints.

### Fetch survey flow

- `GET /survey-definitions/{surveyId}/flow`

```bash
curl -sS \
  -H "X-API-TOKEN: $QUALTRICS_API_TOKEN" \
  -H "Accept: application/json" \
  "$QUALTRICS_BASE_URL/API/v3/survey-definitions/$SURVEY_ID/flow"
```

### Update survey flow

- `PUT /survey-definitions/{surveyId}/flow`

In this repo, live Prolific ↔ Qualtrics integration changes can be applied via:

- `.github/workflows/qualtrics-prolific-apply.yml`

### Export flow JSON (read-only workflow)

This repo includes a read-only workflow to dump the live Survey Flow JSON for inspection:

```bash
# Via GitHub CLI
gh workflow run qualtrics-dump-flow.yml

# With a specific survey ID
gh workflow run qualtrics-dump-flow.yml -f survey_id=SV_abc123
```

The workflow runs `scripts/qualtrics-dump-flow.ts`, prints the flow to the run log, and uploads it as a 30-day artifact. See `.github/workflows/qualtrics-dump-flow.yml`.

You can also run the script locally:

```bash
# Requires QUALTRICS_API_TOKEN or OAuth token
npx tsx scripts/qualtrics-dump-flow.ts
# Output: .vscode/qualtrics-flow.<surveyId>.json
```

### Branch Logic - tenant-specific field reference

When building Survey Flow Branch elements via the API, the JSON structure varies across Qualtrics tenants. The values below were captured from the TABS production tenant and are what the `PUT` endpoint validates:

| Field                                   | Value             | Notes                                      |
| --------------------------------------- | ----------------- | ------------------------------------------ |
| `BranchLogic.Operator`                  | `"NotEmpty"`      | Not `"IsNotEmpty"` or `"IsNotBlank"`       |
| `BranchLogic.LeftOperand`               | `"SOURCE"`        | Plain field name, no `"e://Field/"` prefix |
| `BranchLogic.LogicType`                 | `"EmbeddedField"` |                                            |
| `EmbeddedData[].Type` (inside branches) | `"Custom"`        | Not `"EmbeddedData"` or `"Text"`           |
| `EndSurvey.EndingType`                  | `"Advanced"`      | Required for redirect                      |
| `EndSurvey.Options.SurveyTermination`   | `"Redirect"`      | Capital R                                  |
| `EndSurvey.Options.Advanced`            | `"true"`          | String, not boolean                        |

> **Tip:** If you encounter `PUT` validation errors for `Type` or `Operator`, dump the live flow first (`qualtrics-dump-flow.yml`) and inspect the actual field values your tenant uses. See [PROLIFIC_INTEGRATION.md](./PROLIFIC_INTEGRATION.md#two-branch-survey-flow-architecture-redirect-lockdown) for the full two-branch architecture reference.

## Import survey

The import endpoint expects `multipart/form-data`.

### Import from local file

```bash
curl -sS \
  -X POST \
  -H "X-API-TOKEN: $QUALTRICS_API_TOKEN" \
  -H "Accept: application/json" \
  -F "file=@Simple.qsf;type=application/vnd.qualtrics.survey.qsf" \
  -F "name=Imported Survey" \
  "$QUALTRICS_BASE_URL/API/v3/surveys"
```

### Import from URL

```bash
curl -sS \
  -X POST \
  -H "X-API-TOKEN: $QUALTRICS_API_TOKEN" \
  -H "Accept: application/json" \
  -F "name=Imported Survey" \
  -F "contentType=application/vnd.qualtrics.survey.qsf" \
  -F "fileUrl=https://example.com/your-survey.qsf" \
  "$QUALTRICS_BASE_URL/API/v3/surveys"
```

## Where this is used in this repo

- Copy survey workflow: `.github/workflows/qualtrics-copy-survey.yml`
- Connectivity + metadata smoke test: `.github/workflows/qualtrics-api-smoke.yml`
- Metrics update automation: `.github/workflows/qualtrics-metrics-update.yml`- Survey Flow export (read-only): `.github/workflows/qualtrics-dump-flow.yml`
- Prolific integration apply: `.github/workflows/qualtrics-prolific-apply.yml`
- Prolific integration verify: `.github/workflows/qualtrics-prolific-verify.yml`
  If you’re troubleshooting or validating credentials, run the smoke test first.
