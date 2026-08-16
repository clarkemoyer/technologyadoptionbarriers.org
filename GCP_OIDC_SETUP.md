# GCP Workload Identity Federation Setup

This guide explains how to configure Google Cloud Workload Identity Federation (WIF) so that
GitHub Actions workflows can authenticate to Google Cloud **without long-lived service-account
keys**. Once set up, temporary OAuth 2.0 access tokens are minted at runtime via an OIDC token
exchange — no `GOOGLE_PRIVATE_KEY` or `GOOGLE_SERVICE_ACCOUNT_EMAIL` secrets required in CI.

> **Scope** — This setup covers the `google-prod` GitHub environment used by three workflows:
> `ga-report.yml`, `seo-metrics.yml`, and `seo-dashboard-sync.yml`.

---

## Prerequisites

- A Google Cloud project with the Analytics Data API and Search Console API enabled.
- `gcloud` CLI installed and authenticated (`gcloud auth login`).
- Owner or Editor role on the GCP project.
- Admin access to the GitHub repository settings.

---

## Step 1 — Enable Required APIs

```bash
gcloud services enable \
  analyticsdata.googleapis.com \
  searchconsole.googleapis.com \
  iam.googleapis.com \
  iamcredentials.googleapis.com \
  sts.googleapis.com \
  --project=YOUR_PROJECT_ID
```

---

## Step 2 — Create a Workload Identity Pool

```bash
gcloud iam workload-identity-pools create "github" \
  --project="YOUR_PROJECT_ID" \
  --location="global" \
  --display-name="GitHub Actions pool"
```

---

## Step 3 — Add the GitHub OIDC Provider

```bash
gcloud iam workload-identity-pools providers create-oidc "github" \
  --project="YOUR_PROJECT_ID" \
  --location="global" \
  --workload-identity-pool="github" \
  --display-name="GitHub provider" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository == 'clarkemoyer/technologyadoptionbarriers.org'"
```

The `attribute-condition` restricts token exchange to this repository only.

---

## Step 4 — Create (or reuse) a Service Account

```bash
gcloud iam service-accounts create "github-actions-google-prod" \
  --project="YOUR_PROJECT_ID" \
  --display-name="GitHub Actions — google-prod"
```

Grant it the roles it needs:

```bash
# Google Analytics Data API — read access
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions-google-prod@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/analyticsdata.viewer"

# (Search Console permissions are granted in the GSC UI — see Step 6)
```

---

## Step 5 — Allow the Workload Identity Pool to Impersonate the Service Account

```bash
# Get the full pool resource name
POOL_NAME=$(gcloud iam workload-identity-pools describe github \
  --project="YOUR_PROJECT_ID" \
  --location="global" \
  --format="value(name)")

gcloud iam service-accounts add-iam-policy-binding \
  "github-actions-google-prod@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --project="YOUR_PROJECT_ID" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/${POOL_NAME}/attribute.repository/clarkemoyer/technologyadoptionbarriers.org"
```

---

## Step 6 — Grant Search Console Access

Google Search Console permissions are **not** managed through IAM; they are set in the GSC web UI.

1. Open [Google Search Console](https://search.google.com/search-console).
2. Select the property for `technologyadoptionbarriers.org`.
3. Go to **Settings → Users and permissions → Add user**.
4. Enter the service account email:
   `github-actions-google-prod@YOUR_PROJECT_ID.iam.gserviceaccount.com`
5. Choose **Restricted** or **Full** permission and save.

---

## Step 7 — Retrieve the Provider Resource Name

```bash
gcloud iam workload-identity-pools providers describe github \
  --project="YOUR_PROJECT_ID" \
  --location="global" \
  --workload-identity-pool="github" \
  --format="value(name)"
```

The output looks like:

```
projects/123456789/locations/global/workloadIdentityPools/github/providers/github
```

This is the value for the `GCP_WORKLOAD_IDENTITY_PROVIDER` secret.

---

## Step 8 — Add Secrets to the `google-prod` GitHub Environment

1. Open the repository on GitHub → **Settings → Environments → google-prod**.
2. Add two new secrets:

| Secret name                      | Value                                                                               |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | `projects/123456789/locations/global/workloadIdentityPools/github/providers/github` |
| `GCP_SERVICE_ACCOUNT`            | `github-actions-google-prod@YOUR_PROJECT_ID.iam.gserviceaccount.com`                |

`GA_PROPERTY_ID` (the numeric GA4 property ID, e.g. `123456789`) must remain as a secret since it
is not a credential but still needed by the scripts.

---

## Step 9 — (Optional) Remove the Old Static Key Secrets

Once the OIDC workflows run successfully, the following secrets are no longer needed in CI and
can be **deleted** from the `google-prod` environment:

- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`

> **Keep them for local development** if scripts are run locally with
> `GOOGLE_SERVICE_ACCOUNT_EMAIL` / `GOOGLE_PRIVATE_KEY` env vars. The TypeScript client
> libraries fall back to these when `GOOGLE_APPLICATION_CREDENTIALS` is not set.

---

## How It Works in Workflows

Each affected workflow now contains:

```yaml
permissions:
  id-token: write # ← lets GitHub mint an OIDC token for this job

jobs:
  some-job:
    environment: google-prod
    steps:
      - uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.GCP_WORKLOAD_IDENTITY_PROVIDER }}
          service_account: ${{ secrets.GCP_SERVICE_ACCOUNT }}
      # ↑ sets GOOGLE_APPLICATION_CREDENTIALS to a short-lived credential file
      # All subsequent steps that use the Google SDK pick this up automatically.
```

The `google-github-actions/auth@v2` action:

1. Requests a GitHub OIDC JWT for the running workflow.
2. Exchanges it at the GCP Security Token Service for a short-lived OAuth 2.0 access token scoped
   to the service account.
3. Writes a credentials file and sets `GOOGLE_APPLICATION_CREDENTIALS` in the environment.
4. The `@google-analytics/data` and `googleapis` SDKs detect `GOOGLE_APPLICATION_CREDENTIALS`
   automatically (Application Default Credentials / ADC) — no code changes required in the scripts
   themselves beyond removing the explicit credentials constructor arguments.

---

## Cloudflare

Cloudflare is used purely as a DNS/CDN proxy for this project; no GitHub Actions workflow
interacts with the Cloudflare API. If a Cloudflare API workflow is added in the future, Cloudflare
supports OIDC via their
[GitHub Actions + Cloudflare Workers](https://developers.cloudflare.com/workers/ci-cd/deploy-button/github-actions/)
integration and the
[`cloudflare/wrangler-action`](https://github.com/cloudflare/wrangler-action) which accepts an
`CLOUDFLARE_API_TOKEN` minted via OIDC. The pattern would be identical to the GCP approach above.

---

## References

- [GitHub — OIDC with cloud providers](https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [google-github-actions/auth — README](https://github.com/google-github-actions/auth)
- [GCP Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)
- [Cloudflare Wrangler Action](https://github.com/cloudflare/wrangler-action)
