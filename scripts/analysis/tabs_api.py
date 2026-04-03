#!/usr/bin/env python3
"""
TABS API Clients — Qualtrics + Prolific
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
# HTTP helpers (stdlib only — no requests dependency)
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
                  body: Optional[dict] = None, timeout: int = 60) -> Any:
    """Make a JSON HTTP request and parse the response."""
    h = {**headers, "Accept": "application/json"}
    data = None
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        h["Content-Type"] = "application/json"
    raw = _http(method, url, h, data, timeout)
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
        # Normalize meta to dict to handle meta: null gracefully.
        meta = resp.get("meta")
        if not isinstance(meta, dict):
            meta = {}
        url = resp.get("next") or meta.get("next")
    return results


def prolific_list_studies(api_token: str) -> List[Dict]:
    """List all studies (follows pagination)."""
    headers = _prolific_headers(api_token)
    url = f"{_PROLIFIC_BASE}/studies/?limit=100"
    return _prolific_paginate(url, headers)


def prolific_submissions(study_id: str, api_token: str) -> List[Dict]:
    """List all submissions for a study."""
    headers = _prolific_headers(api_token)
    url = f"{_PROLIFIC_BASE}/studies/{study_id}/submissions/?limit=100"
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


def prolific_demographics_csv(study_id: str, api_token: str, output_path: str) -> str:
    """Fetch bulk demographic export for a study and write to CSV.

    Uses the POST /studies/{id}/demographic-export/ endpoint (bulk export).
    Returns path to the written CSV.
    """
    headers = {**_prolific_headers(api_token), "Content-Type": "application/json"}
    url = f"{_PROLIFIC_BASE}/studies/{study_id}/demographic-export/"

    try:
        # Bulk export returns CSV directly
        body = json.dumps({"filters": []}).encode("utf-8")
        req = Request(url, data=body, headers=headers, method="POST")
        with urlopen(req, timeout=120) as resp:
            csv_data = resp.read().decode("utf-8")

        if csv_data.strip():
            Path(output_path).parent.mkdir(parents=True, exist_ok=True)
            Path(output_path).write_text(csv_data, encoding="utf-8")
            lines = csv_data.strip().split("\n")
            print(f"  Demographics: {len(lines) - 1} rows → {output_path}")
            return output_path
    except HTTPError as e:
        print(f"  Demographics bulk export failed (HTTP {e.code}), skipping")

    return ""


def prolific_submission_statuses(study_id: str, api_token: str) -> Dict[str, str]:
    """Return a dict mapping PROLIFIC_PID → submission status."""
    submissions = prolific_submissions(study_id, api_token)
    return {
        sub.get("participant_id", ""): sub.get("status", "UNKNOWN")
        for sub in submissions
    }


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
