#!/usr/bin/env python3
"""Approve a specified list of Prolific submissions by PID.

Mirrors the safety pattern of reject_by_pid.py:
  - Verifies token and study before any API call
  - Resolves targets by current status and skips PIDs that aren't AWAITING REVIEW
    (including dry-run previews, for accurate operator validation)
  - Hard ceiling on PIDs per run to prevent runaway approvals
  - Requires CONFIRM_APPROVE=APPROVE for live runs (typo-proof safety)
  - Writes a structured JSON results file

For each approved PID, sends a thank-you message acknowledging the
participant's reply. The thank-you is deduped by signature so re-runs
do not double-send.

Environment variables:
  PROLIFIC_API_TOKEN     - required
  STUDY_ID               - required
  PID_LIST               - comma-separated PIDs (required)
  MAX_PER_RUN            - ceiling (default 30)
  DRY_RUN                - "false" to approve live; otherwise dry run
  CONFIRM_APPROVE        - must equal "APPROVE" for live runs (safety)
  OUTPUT_JSON_PATH       - optional results JSON path
"""

from __future__ import annotations

import json
import os
import re
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from tabs_api import (
    prolific_bulk_approve,
    prolific_send_message,
    prolific_study_info,
    prolific_submission_statuses,
    prolific_user_messages,
)

THANK_YOU_MESSAGE = (
    "Hi, thank you for participating in our Technology Adoption Barriers Survey "
    "and for taking the time to respond to our review message. After reviewing "
    "your reply, your submission has been approved. We appreciate your "
    "thoughtful engagement and the insights you shared - they are valuable to "
    "our research. Thank you again for your contribution!"
)
SIGNATURE = "After reviewing your reply, your submission has been approved"
DEFAULT_MAX_PER_RUN = 30
PID_RE = re.compile(r"\b[0-9a-fA-F]{24}\b")
_API_CALL_DELAY = 0.2


def _require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        print(f"Error: {name} is required", file=sys.stderr)
        sys.exit(1)
    return value


def _parse_max_per_run(raw: str | None) -> int:
    if not raw:
        return DEFAULT_MAX_PER_RUN
    try:
        n = int(raw.strip())
    except (TypeError, ValueError):
        print(f"Warning: invalid MAX_PER_RUN '{raw}', using default {DEFAULT_MAX_PER_RUN}", file=sys.stderr)
        return DEFAULT_MAX_PER_RUN
    if n <= 0:
        print(f"Warning: non-positive MAX_PER_RUN {n}, using default {DEFAULT_MAX_PER_RUN}", file=sys.stderr)
        return DEFAULT_MAX_PER_RUN
    return n


def _write_results(path: str | None, payload: dict) -> None:
    if not path:
        return
    Path(path).write_text(json.dumps(payload, indent=2))
    print(f"Results: {path}")


def _redact_pid(pid: str) -> str:
    if len(pid) <= 4:
        return pid
    return f"****{pid[-4:]}"


def _sanitize_log_text(text: str) -> str:
    return PID_RE.sub(lambda m: _redact_pid(m.group(0)), text)


def _fetch_messages_with_backoff(pid: str, api_token: str, max_retries: int = 3) -> tuple[list[dict] | None, str | None]:
    """Fetch messages with exponential backoff on transient API failures."""
    last_err = ""
    redacted_pid = _redact_pid(pid)
    for attempt in range(max_retries):
        try:
            if attempt > 0:
                wait = min(2**attempt, 30)
                print(
                    f"  Retry {attempt}/{max_retries - 1} for {redacted_pid} in {wait}s",
                    file=sys.stderr,
                )
                time.sleep(wait)
            msgs = prolific_user_messages(pid, api_token)
            return msgs, None
        except Exception as exc:
            last_err = _sanitize_log_text(str(exc))
    return None, last_err


def _send_thank_you_with_backoff(study_id: str, pid: str, api_token: str, max_retries: int = 3) -> str | None:
    """Send thank-you with exponential backoff. Returns sanitized error on failure."""
    last_err = ""
    redacted_pid = _redact_pid(pid)
    for attempt in range(max_retries):
        try:
            if attempt > 0:
                wait = min(2**attempt, 30)
                print(
                    f"  Retry {attempt}/{max_retries - 1} send for {redacted_pid} in {wait}s",
                    file=sys.stderr,
                )
                time.sleep(wait)
            prolific_send_message(study_id, pid, THANK_YOU_MESSAGE, api_token)
            return None
        except Exception as exc:
            last_err = _sanitize_log_text(str(exc))
    return last_err


def main() -> int:
    api_token = _require_env("PROLIFIC_API_TOKEN")
    study_id = _require_env("STUDY_ID")
    pid_list_raw = _require_env("PID_LIST").strip()
    dry_run = os.environ.get("DRY_RUN", "true").strip().lower() != "false"
    max_per_run = _parse_max_per_run(os.environ.get("MAX_PER_RUN"))
    output_path = os.environ.get("OUTPUT_JSON_PATH")

    pids = [p.strip() for p in pid_list_raw.split(",") if p.strip()]
    seen: set[str] = set()
    deduped: list[str] = []
    for p in pids:
        if p not in seen:
            seen.add(p)
            deduped.append(p)
    pids = deduped

    print("=" * 64)
    print("  Prolific Bulk Approve by PID")
    print("=" * 64)
    print(f"Mode: {'DRY RUN' if dry_run else 'LIVE'}")
    print(f"Input PIDs (deduped): {len(pids)}")
    print(f"Ceiling: {max_per_run}")

    result: dict = {
        "mode": "dry_run" if dry_run else "live",
        "input_count": len(pids),
        "ceiling": max_per_run,
        "ceiling_exceeded": False,
        "approved": [],
        "skipped_non_awaiting": [],
        "thank_you_sent": [],
        "thank_you_skipped_dedup": [],
        "thank_you_failed": [],
        "bulk_approve_error": None,
        "failures": [],
    }

    if not pids:
        print("No PIDs provided. Nothing to do.")
        _write_results(output_path, result)
        return 0

    if len(pids) > max_per_run:
        result["ceiling_exceeded"] = True
        print(
            f"::error::Ceiling exceeded: {len(pids)} PIDs > {max_per_run} ceiling. Aborting.",
            file=sys.stderr,
        )
        _write_results(output_path, result)
        return 1

    if not dry_run:
        confirm = os.environ.get("CONFIRM_APPROVE", "")
        if confirm != "APPROVE":
            print(
                "::error::CONFIRM_APPROVE must be set to 'APPROVE' for live runs",
                file=sys.stderr,
            )
            sys.exit(1)

    print(f"Verifying study {study_id}...")
    study = prolific_study_info(study_id, api_token)
    print(f"  Study: {study.get('name', '?')} (status: {study.get('status', '?')})")

    print("Fetching current submission statuses...")
    statuses = prolific_submission_statuses(study_id, api_token)

    targets: list[str] = []
    for pid in pids:
        st = statuses.get(pid, "UNKNOWN")
        if st == "AWAITING REVIEW":
            targets.append(pid)
        else:
            print(f"  SKIP {_redact_pid(pid)} - status is {st}, not AWAITING REVIEW")
            result["skipped_non_awaiting"].append({"pid": pid, "status": st})

    if dry_run:
        print(f"DRY RUN - would target {len(targets)} currently AWAITING REVIEW PIDs")
    print(f"  AWAITING REVIEW (will approve): {len(targets)}")
    print(f"  Skipped (other status): {len(result['skipped_non_awaiting'])}")

    if not targets:
        print("No eligible PIDs to approve.")
        _write_results(output_path, result)
        return 0

    if dry_run:
        print(f"DRY RUN - {len(targets)} would be approved")
        result["approved"] = list(targets)
    else:
        print(f"Approving {len(targets)} submissions (one API call per PID)...")
        for pid in targets:
            try:
                prolific_bulk_approve(study_id, [pid], api_token)
                result["approved"].append(pid)
                print(f"  APPROVED {_redact_pid(pid)}")
            except Exception as exc:
                err = _sanitize_log_text(str(exc))
                print(f"  FAILED {_redact_pid(pid)}: {err}", file=sys.stderr)
                result["failures"].append({"pid": pid, "error": err})

    if dry_run:
        print(f"DRY RUN - thank-you messages would be sent to {len(targets)} PIDs")
        result["thank_you_sent"] = list(targets)
    else:
        print("\nSending thank-you messages...")
        for idx, pid in enumerate(targets):
            if idx > 0:
                time.sleep(_API_CALL_DELAY)
            try:
                existing, fetch_err = _fetch_messages_with_backoff(pid, api_token)
                if existing is None:
                    raise RuntimeError(fetch_err or "message fetch failed")
                already = any(
                    (m.get("data") or {}).get("study_id") == study_id
                    and SIGNATURE in (m.get("body") or "")
                    for m in existing
                )
                if already:
                    print(f"  SKIP {_redact_pid(pid)} - already received this thank-you")
                    result["thank_you_skipped_dedup"].append(pid)
                    continue
                send_err = _send_thank_you_with_backoff(study_id, pid, api_token)
                if send_err:
                    raise RuntimeError(send_err)
                print(f"  SENT thank-you to {_redact_pid(pid)}")
                result["thank_you_sent"].append(pid)
            except Exception as exc:
                err = _sanitize_log_text(str(exc))
                print(f"  FAILED thank-you to {_redact_pid(pid)}: {err}", file=sys.stderr)
                result["thank_you_failed"].append({"pid": pid, "error": err})

    print()
    print(
        f"Done. Approved: {len(result['approved'])} | "
        f"Thank-yous sent: {len(result['thank_you_sent'])} | "
        f"Skipped (non-awaiting): {len(result['skipped_non_awaiting'])} | "
        f"Thank-you dedup skips: {len(result['thank_you_skipped_dedup'])} | "
        f"Thank-you failures: {len(result['thank_you_failed'])}"
    )
    _write_results(output_path, result)
    return 0


if __name__ == "__main__":
    sys.exit(main())
