#!/usr/bin/env python3
"""
TABS API Clients - Qualtrics + Prolific
========================================

Lightweight Python clients for the Qualtrics and Prolific REST APIs.
Used by the analysis pipeline to export survey data, fetch auth checks,
and fetch demographics without depending on the TypeScript API clients.

These mirror the functionality in:
  - src/lib/qualtrics-api.ts  (export responses)
  - src/lib/prolific-api.ts   (auth checks, demographics, submissions)

Usage:
    from tabs_api import qualtrics_export_csv, prolific_auth_checks, prolific_submissions

Environment variables:
    QUALTRICS_API_TOKEN, QUALTRICS_BASE_URL, QUALTRICS_SURVEY_ID
    PROLIFIC_API_TOKEN, PROLIFIC_STUDY_ID
"""

from __future__ import annotations

import csv
import io
import json
import os
import sys
import time
import zipfile
from pathlib import Path
from typing import Any, Dict, List, Optional
from urllib.request import Request, urlopen
from urllib.error import HTTPError


# ---------------------------------------------------------------------------
# Prolific ↔ Qualtrics demographic cross-validation filter mapping
# ---------------------------------------------------------------------------
# These are the Prolific prescreener filter_ids that capture the same type
# of demographic information as Qualtrics survey questions Q1–Q9.
# Pass these to ``prolific_demographics_csv(filter_ids=...)`` to include
# prescreener responses in the demographic export for cross-validation.
#
# Privacy: Prescreener data contains PII and must be handled ephemerally
# (runner.temp) - never committed to the repository.
#
# API reference: GET /api/v1/filters/ returns the full filter catalog.
# Export limit: up to 15 filter_ids per demographic export request.

QUALTRICS_PROLIFIC_FILTER_MAP: Dict[str, Dict[str, str]] = {
    # Qualtrics field → Prolific filter_id + description
    "Q1_Role": {
        "filter_id": "occupation",
        "description": "Occupation/job title category",
    },
    "Q3_Industry": {
        "filter_id": "industry",
        "description": "Industry classification",
    },
    "Q4_OrgSize": {
        "filter_id": "company_size",
        "description": "Company/organization size",
    },
    "Q5_ProfitModel": {
        "filter_id": "employment_sector",
        "description": "Employment sector (Private, Public, Non-profit)",
    },
}

# Prolific prescreener filter_ids that augment (not overlap) survey data.
# These provide additional demographic dimensions not captured in Q1–Q9.
PROLIFIC_AUGMENTATION_FILTERS: Dict[str, str] = {
    "education_level": "Highest level of education completed",
    "household_income": "Household income bracket",
    "fluent_languages": "Languages spoken fluently",
}

# Combined list of all cross-validation + augmentation filter_ids,
# suitable for passing directly to prolific_demographics_csv().
PROLIFIC_ENRICHMENT_FILTER_IDS: List[str] = [
    entry["filter_id"] for entry in QUALTRICS_PROLIFIC_FILTER_MAP.values()
] + list(PROLIFIC_AUGMENTATION_FILTERS.keys())


# ---------------------------------------------------------------------------
# Prolific study prescreening criteria (live study configuration)
# ---------------------------------------------------------------------------
# These are the EXACT eligibility screeners configured on the Prolific study.
# Participants must match ALL of these criteria to be eligible.
# The filter_ids below are used in the demographic export to retrieve the
# prescreener responses for cross-validation and enrichment.
#
# NOTE: "Current Country of Residence" and "Employment Status" are also
# captured as base fields in every Prolific demographic export (always
# included, no filter_id required).

PROLIFIC_STUDY_SCREENERS: List[Dict[str, Any]] = [
    {
        "filter_id": "current_country_of_residence",
        "label": "Current Country of Residence",
        "selected_values": ["United States"],
        "base_field": True,
    },
    {
        "filter_id": "employment_status",
        "label": "Employment Status",
        "selected_values": ["Full-Time"],
        "base_field": True,
    },
    {
        "filter_id": "employment_sector",
        "label": "Employer Type",
        "selected_values": [
            "Employee of a for-profit company or business or of an individual, for wages, salary, or commissions",
            "Employee of a not-for-profit, tax-exempt, or charitable organization",
            "Local government employee (city, county, etc.)",
            "State government employee",
            "Federal government employee",
            "Self-employed in own not-incorporated business, professional practice, or farm",
            "Self-employed in own incorporated business, professional practice, or farm",
            "Working without pay in family business or farm",
        ],
        "base_field": False,
    },
    {
        "filter_id": "company_size",
        "label": "Company Size",
        "selected_values": ["50-249", "250-999", "1000+"],
        "base_field": False,
    },
    {
        "filter_id": "occupation",
        "label": "Job Position",
        "selected_values": [
            "C-Level (e.g. CEO, CFO), Owner, Partner, President",
            "Vice President (EVP, SVP, AVP, VP)",
            "Director (Group Director, Sr. Director, Director)",
            "Manager (Group Manager, Sr. Manager, Manager, Program Manager)",
        ],
        "base_field": False,
    },
]


# ---------------------------------------------------------------------------
# HTTP helpers (stdlib only - no requests dependency)
# ---------------------------------------------------------------------------

def _http(method: str, url: str, headers: Dict[str, str],
          body: Optional[bytes] = None, timeout: int = 60) -> bytes:
    """Make an HTTP request and return the response body."""
    req = Request(url, data=body, headers=headers, method=method)
    try:
        with urlopen(req, timeout=timeout) as resp:
            return resp.read()
    except HTTPError as e:
        error_body = e.read().decode("utf-8", errors="replace")[:2000]
        raise RuntimeError(
            f"HTTP {e.code} {method} {url}: {error_body}"
        ) from e


def _json_request(method: str, url: str, headers: Dict[str, str],
                  body: Optional[dict] = None, timeout: int = 60,
                  allow_empty: bool = False) -> Any:
    """Make a JSON HTTP request and parse the response.

    Args:
        allow_empty: If True, return {} for empty responses (used by write
            endpoints like bulk-approve that return empty 2xx on success).
            If False (default), raise on empty response body.
    """
    h = {**headers, "Accept": "application/json"}
    data = None
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        h["Content-Type"] = "application/json"
    raw = _http(method, url, h, data, timeout)
    if not raw or not raw.strip():
        if allow_empty:
            return {}
        raise RuntimeError(f"Empty response body from {method} {url}")
    return json.loads(raw)


# ---------------------------------------------------------------------------
# Qualtrics API
# ---------------------------------------------------------------------------

def qualtrics_export_csv(
    api_token: str,
    base_url: str,
    survey_id: str,
    output_path: str,
    use_labels: bool = True,
) -> str:
    """Export survey responses from Qualtrics API to a CSV file.

    Implements the 3-step async export:
      1. POST /export-responses  → progressId
      2. GET  /export-responses/{progressId}  → poll until fileId
      3. GET  /export-responses/{fileId}/file → download ZIP → extract CSV

    Args:
        api_token: Qualtrics API token
        base_url: Qualtrics base URL (e.g. https://smeal.yul1.qualtrics.com)
        survey_id: Qualtrics survey ID
        output_path: Where to write the CSV
        use_labels: If True, export text labels instead of numeric codes

    Returns:
        Path to the written CSV file
    """
    base = base_url.rstrip("/")
    headers = {"X-API-TOKEN": api_token}
    export_url = f"{base}/API/v3/surveys/{survey_id}/export-responses"

    # Step 1: Start export
    print(f"Starting Qualtrics export for survey {survey_id}...")
    body = {"format": "csv", "useLabels": use_labels, "compress": True}
    resp = _json_request("POST", export_url, headers, body)
    progress_id = resp["result"]["progressId"]
    print(f"  Export started: progressId={progress_id}")

    # Step 2: Poll until complete
    poll_url = f"{export_url}/{progress_id}"
    file_id = None
    for attempt in range(120):  # max 10 minutes
        time.sleep(5)
        resp = _json_request("GET", poll_url, headers)
        pct = resp["result"].get("percentComplete", 0)
        print(f"  Progress: {pct}%", end="\r")
        if pct >= 100:
            file_id = resp["result"].get("fileId")
            break
    print()

    if not file_id:
        raise RuntimeError("Export timed out or failed to produce fileId")
    print(f"  Export complete: fileId={file_id}")

    # Step 3: Download ZIP and extract CSV
    download_url = f"{export_url}/{file_id}/file"
    zip_bytes = _http("GET", download_url, headers, timeout=120)

    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
        csv_names = [n for n in zf.namelist() if n.endswith(".csv")]
        if not csv_names:
            raise RuntimeError(f"No CSV found in ZIP. Files: {zf.namelist()}")
        csv_content = zf.read(csv_names[0]).decode("utf-8-sig")

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    Path(output_path).write_text(csv_content, encoding="utf-8")

    line_count = csv_content.count("\n")
    print(f"  Wrote {line_count} lines to {output_path}")
    return output_path


# ---------------------------------------------------------------------------
# Prolific API
# ---------------------------------------------------------------------------

_PROLIFIC_BASE = "https://api.prolific.com/api/v1"


def _prolific_headers(api_token: str) -> Dict[str, str]:
    return {
        "Authorization": f"Token {api_token}",
        # Prolific's Cloudflare protection blocks Python's default User-Agent
        # (Python-urllib/3.x) as "browser_signature_banned". A descriptive
        # User-Agent avoids the block.
        "User-Agent": "TABS-Research-Pipeline/1.0 (github.com/clarkemoyer/technologyadoptionbarriers.org)",
    }


def _prolific_paginate(url: str, headers: Dict[str, str]) -> List[Dict]:
    """Fetch all pages from a Prolific paginated endpoint.

    Supports both pagination shapes:
      - Top-level: {"results": [...], "next": "url"}
      - Meta-wrapped: {"results": [...], "meta": {"next": "url"}}
    """
    results = []
    while url:
        resp = _json_request("GET", url, headers)
        results.extend(resp.get("results", []))
        # Support both top-level 'next' and 'meta.next' pagination shapes.
        meta = resp.get("meta")
        if not isinstance(meta, dict):
            meta = {}
        url = resp.get("next") or meta.get("next")
    return results


def prolific_list_studies(api_token: str) -> List[Dict]:
    """List all studies (follows pagination)."""
    headers = _prolific_headers(api_token)
    url = f"{_PROLIFIC_BASE}/studies/?limit=1000"
    return _prolific_paginate(url, headers)


def prolific_submissions(study_id: str, api_token: str) -> List[Dict]:
    """List all submissions for a study."""
    headers = _prolific_headers(api_token)
    # Use limit=1000 to minimize pagination (most studies have <1000 submissions)
    url = f"{_PROLIFIC_BASE}/studies/{study_id}/submissions/?limit=1000"
    return _prolific_paginate(url, headers)


def prolific_auth_checks_csv(study_id: str, api_token: str, output_path: str) -> str:
    """Fetch auth check scores (LLM + Bots) for all submissions and write CSV.

    Returns path to the written CSV with columns: PROLIFIC_PID,Auth_LLM,Auth_Bots
    """
    submissions = prolific_submissions(study_id, api_token)

    rows = []
    for sub in submissions:
        pid = sub.get("participant_id", "")
        # Auth scores may be nested under different field names depending on API version
        auth = sub.get("authenticity", {}) or {}
        llm = auth.get("llm", "") or ""
        bots = auth.get("bots", "") or ""
        # Fallback: some API versions use top-level fields
        if not llm:
            llm = sub.get("authenticity_score_llm", "") or ""
        if not bots:
            bots = sub.get("authenticity_score_bots", "") or ""
        rows.append({"PROLIFIC_PID": pid, "Auth_LLM": str(llm), "Auth_Bots": str(bots)})

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["PROLIFIC_PID", "Auth_LLM", "Auth_Bots"])
        writer.writeheader()
        writer.writerows(rows)

    print(f"  Auth checks: {len(rows)} submissions → {output_path}")
    return output_path


def prolific_demographics_csv(
    study_id: str,
    api_token: str,
    output_path: str,
    filter_ids: Optional[List[str]] = None,
) -> str:
    """Fetch bulk demographic export for a study and write to CSV.

    Uses the POST /studies/{id}/demographic-export/ endpoint (bulk export).

    Args:
        study_id: Prolific study ID.
        api_token: Prolific API token.
        output_path: Path to write the CSV output.
        filter_ids: Optional list of Prolific prescreener filter_ids to include
            in the export (up to 15). When provided, the export includes both
            base demographic fields AND responses to the specified prescreener
            filters. Use ``QUALTRICS_PROLIFIC_FILTER_MAP`` values for
            cross-validation against survey demographics.

    Returns:
        Path to the written CSV, or empty string on failure.
    """
    headers = {**_prolific_headers(api_token), "Content-Type": "application/json"}
    url = f"{_PROLIFIC_BASE}/studies/{study_id}/demographic-export/"

    filters_payload: List[Dict[str, Any]] = []
    if filter_ids:
        filters_payload = [{"filter_id": fid} for fid in filter_ids]

    try:
        # Bulk export returns CSV directly
        body = json.dumps({"filters": filters_payload}).encode("utf-8")
        req = Request(url, data=body, headers=headers, method="POST")
        with urlopen(req, timeout=120) as resp:
            csv_data = resp.read().decode("utf-8")

        if csv_data.strip():
            Path(output_path).parent.mkdir(parents=True, exist_ok=True)
            Path(output_path).write_text(csv_data, encoding="utf-8")
            lines = csv_data.strip().split("\n")
            n_filters = len(filters_payload)
            suffix = f" (+ {n_filters} prescreener filters)" if n_filters else ""
            print(f"  Demographics: {len(lines) - 1} rows → {output_path}{suffix}")
            return output_path
    except HTTPError as e:
        print(f"  Demographics bulk export failed (HTTP {e.code}), skipping")

    return ""


def prolific_submission_statuses(study_id: str, api_token: str) -> Dict[str, str]:
    """Return a dict mapping PROLIFIC_PID → submission status.

    Kept for backward compatibility with callers that only need the status
    string. New callers should prefer ``prolific_submission_summaries``,
    which also returns timestamps used for 21-day auto-approve runway
    calculations.

    Submissions without a non-empty ``participant_id`` are silently skipped
    (consistent with ``prolific_submission_summaries``).
    """
    submissions = prolific_submissions(study_id, api_token)
    return {
        sub["participant_id"]: sub.get("status", "UNKNOWN")
        for sub in submissions
        if sub.get("participant_id")
    }


def prolific_submission_summaries(study_id: str, api_token: str) -> Dict[str, Dict[str, str]]:
    """Return a dict mapping PROLIFIC_PID → submission summary fields.

    Each value contains the fields downstream pipeline steps need beyond
    the status string itself:
      - status:         submission state (APPROVED, AWAITING REVIEW, ...)
      - completed_at:   ISO 8601 timestamp the participant submitted, or ""
      - started_at:     ISO 8601 timestamp the participant started, or ""

    ``completed_at`` is the canonical anchor for Prolific's 21-day
    auto-approve clock: any submission still in AWAITING REVIEW longer
    than 21 days after ``completed_at`` is auto-approved by Prolific
    (and the participant is paid). The pipeline persists this raw
    timestamp so consumers can compute their own "now" delta accurately.
    """
    submissions = prolific_submissions(study_id, api_token)
    summaries: Dict[str, Dict[str, str]] = {}
    for sub in submissions:
        pid = sub.get("participant_id", "")
        if not pid:
            continue
        summaries[pid] = {
            "status": sub.get("status", "UNKNOWN") or "UNKNOWN",
            "completed_at": sub.get("completed_at") or "",
            "started_at": sub.get("started_at") or "",
        }
    return summaries


def prolific_recent_messages(
    since: str, api_token: str, study_id: Optional[str] = None
) -> List[Dict]:
    """Fetch recent messages, optionally filtered to a study.

    Args:
        since: ISO 8601 timestamp (e.g. '2026-03-01T00:00:00Z')
        api_token: Prolific API token
        study_id: If provided, filter to messages for this study
    """
    from urllib.parse import quote
    headers = _prolific_headers(api_token)
    url = f"{_PROLIFIC_BASE}/messages/?created_after={quote(since, safe='')}"
    messages = _prolific_paginate(url, headers)
    if study_id:
        messages = [m for m in messages if (m.get("data") or {}).get("study_id") == study_id]
    return messages


def prolific_user_messages(user_id: str, api_token: str) -> List[Dict]:
    """Fetch all messages for a specific user/participant."""
    headers = _prolific_headers(api_token)
    url = f"{_PROLIFIC_BASE}/messages/?user_id={user_id}"
    return _prolific_paginate(url, headers)


def prolific_study_info(study_id: str, api_token: str) -> Dict:
    """Fetch study metadata."""
    headers = _prolific_headers(api_token)
    url = f"{_PROLIFIC_BASE}/studies/{study_id}/"
    return _json_request("GET", url, headers)


# ---------------------------------------------------------------------------
# Prolific Write Operations (Phase 4 - affects real participants)
# ---------------------------------------------------------------------------

# Prolific rejection categories matching the UI checkboxes.
REJECTION_CATEGORIES = {
    "FAILED_AUTHENTICITY_CHECK": "FAILED_AUTHENTICITY_CHECK",
    "FAILED_ATTENTION_CHECK": "FAILED_ATTENTION_CHECK",
    "LOW_EFFORT": "LOW_EFFORT",
    "DIDNT_ANSWER_ESSENTIAL": "DIDNT_ANSWER_ESSENTIAL",
    "NO_DATA": "NO_DATA",
    "TOO_QUICKLY": "TOO_QUICKLY",
    "OTHER": "OTHER",
}


def prolific_bulk_approve(study_id: str, participant_ids: List[str], api_token: str) -> Dict:
    """Bulk approve submissions. LIVE OPERATION - affects real participants."""
    headers = {**_prolific_headers(api_token), "Content-Type": "application/json"}
    url = f"{_PROLIFIC_BASE}/submissions/bulk-approve/"
    body = {"study_id": study_id, "participant_ids": participant_ids}
    return _json_request("POST", url, headers, body, allow_empty=True)


def prolific_bulk_reject(
    study_id: str, participant_ids: List[str], api_token: str
) -> Dict:
    """Bulk reject submissions. DESTRUCTIVE OPERATION - affects real participants."""
    headers = {**_prolific_headers(api_token), "Content-Type": "application/json"}
    url = f"{_PROLIFIC_BASE}/submissions/bulk-reject/"
    body = {"study_id": study_id, "participant_ids": participant_ids}
    return _json_request("POST", url, headers, body, allow_empty=True)


def prolific_reject_submission(
    submission_id: str,
    categories: List[str],
    message: str,
    api_token: str,
) -> Dict:
    """DESTRUCTIVE: Reject a single submission with categories and message.

    Rejected participants will NOT be paid. This cannot be easily undone.
    """
    headers = {**_prolific_headers(api_token), "Content-Type": "application/json"}
    url = f"{_PROLIFIC_BASE}/submissions/{submission_id}/transition/"
    body = {"action": "REJECT", "rejection_categories": categories, "message": message}
    return _json_request("POST", url, headers, body, allow_empty=True)


def prolific_send_message(
    study_id: str, recipient_id: str, message_body: str, api_token: str
) -> Dict:
    """Send a message to a participant. LIVE OPERATION."""
    headers = {**_prolific_headers(api_token), "Content-Type": "application/json"}
    url = f"{_PROLIFIC_BASE}/messages/"
    body = {"recipient_id": recipient_id, "body": message_body, "study_id": study_id}
    return _json_request("POST", url, headers, body, allow_empty=True)


def prolific_request_return(
    submission_id: str, reasons: List[str], api_token: str
) -> Dict:
    """Request that a participant return their submission.

    Uses the dedicated /request-return/ endpoint (not /transition/). Sets
    `return_requested` on the submission while leaving status AWAITING REVIEW;
    Prolific notifies the participant. After the reserve timeout Prolific
    auto-APPROVES if no participant action, so callers must follow up.
    """
    headers = {**_prolific_headers(api_token), "Content-Type": "application/json"}
    url = f"{_PROLIFIC_BASE}/submissions/{submission_id}/request-return/"
    body = {"request_return_reasons": reasons}
    return _json_request("POST", url, headers, body, allow_empty=True)


def prolific_unreject(submission_id: str, api_token: str) -> Dict:
    """Transition a submission from REJECTED → AWAITING REVIEW."""
    headers = {**_prolific_headers(api_token), "Content-Type": "application/json"}
    url = f"{_PROLIFIC_BASE}/submissions/{submission_id}/transition/"
    body = {"action": "UNREJECT"}
    return _json_request("POST", url, headers, body, allow_empty=True)


def prolific_get_submission_ids(study_id: str, participant_id: str, api_token: str) -> List[str]:
    """Get submission IDs for a participant in a study."""
    subs = prolific_submissions(study_id, api_token)
    return [s["id"] for s in subs if s.get("participant_id") == participant_id]


def prolific_get_submission_ids_map(
    study_id: str, participant_ids: List[str], api_token: str
) -> Dict[str, str]:
    """Find submission IDs for a list of participant IDs in a study.

    Returns a dict of participant_id -> submission_id.
    """
    subs = prolific_submissions(study_id, api_token)
    pid_set = set(participant_ids)
    return {
        s["participant_id"]: s["id"]
        for s in subs
        if s.get("participant_id") in pid_set
    }


# ---------------------------------------------------------------------------
# Qualtrics API
# ---------------------------------------------------------------------------

def qualtrics_survey_questions(
    api_token: str, base_url: str, survey_id: str
) -> Dict:
    """Fetch survey questions from the Qualtrics API.

    Uses the /questions sub-endpoint for parity with the TS client.
    Normalizes both possible response shapes (elements list or Questions dict).
    """
    base = base_url.rstrip("/")
    headers = {"X-API-TOKEN": api_token}
    url = f"{base}/API/v3/survey-definitions/{survey_id}/questions"
    resp = _json_request("GET", url, headers)
    result = resp.get("result", {})

    if isinstance(result, dict):
        # Paginated shape: {"elements": [...]}
        elements = result.get("elements")
        if isinstance(elements, list):
            return {(q.get("QuestionID") or f"Q{i}"): q for i, q in enumerate(elements)}
        # Direct shape: {"Questions": {"QID1": {...}, ...}}
        questions = result.get("Questions")
        if isinstance(questions, dict):
            return questions
    raise RuntimeError(
        f"Unexpected Qualtrics questions response shape: "
        f"{list(result.keys()) if isinstance(result, dict) else type(result)}"
    )


# ---------------------------------------------------------------------------
# CLI for testing
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="TABS API test client")
    parser.add_argument("action", choices=["qualtrics-export", "prolific-auth", "prolific-demographics"])
    parser.add_argument("--output", default="/tmp/tabs_api_test_output")
    args = parser.parse_args()

    if args.action == "qualtrics-export":
        qualtrics_export_csv(
            os.environ["QUALTRICS_API_TOKEN"],
            os.environ["QUALTRICS_BASE_URL"],
            os.environ["QUALTRICS_SURVEY_ID"],
            f"{args.output}.csv",
        )
    elif args.action == "prolific-auth":
        prolific_auth_checks_csv(
            os.environ["PROLIFIC_STUDY_ID"],
            os.environ["PROLIFIC_API_TOKEN"],
            f"{args.output}_auth.csv",
        )
    elif args.action == "prolific-demographics":
        prolific_demographics_csv(
            os.environ["PROLIFIC_STUDY_ID"],
            os.environ["PROLIFIC_API_TOKEN"],
            f"{args.output}_demographics.csv",
        )
