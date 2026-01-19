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
- Metrics update automation: `.github/workflows/qualtrics-metrics-update.yml`
