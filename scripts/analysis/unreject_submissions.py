#!/usr/bin/env python3
"""
Unreject previously rejected submissions (REJECTED → AWAITING REVIEW).

Python port of scripts/unreject-submissions.ts.

Used when a rejection should be reversed so the participant can be offered
a voluntary return instead.

Environment variables:
  PROLIFIC_API_TOKEN  – Prolific API token (required)
  STUDY_ID            – Prolific study ID (required)
  PID_LIST            – Comma-separated PIDs to unreject (required)
  DRY_RUN             – When "false", unreject live (default: true)
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from tabs_api import prolific_submissions, prolific_unreject


def _require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        print(f"Error: {name} is required", file=sys.stderr)
        sys.exit(1)
    return value


def main():
    api_token = _require_env("PROLIFIC_API_TOKEN")
    study_id = _require_env("STUDY_ID")
    pid_list_raw = _require_env("PID_LIST")
    dry_run = os.environ.get("DRY_RUN", "true").strip().lower() != "false"

    pids = [p.strip() for p in pid_list_raw.split(",") if p.strip()]

    print("================================================================")
    print("  Unreject Submissions (REJECTED → AWAITING REVIEW)")
    print(f"  Study: {study_id}")
    print(f"  PIDs: {len(pids)}")
    print(f"  Mode: {'DRY RUN' if dry_run else 'LIVE'}")
    print("================================================================")
    print()

    # Look up submission IDs
    subs = prolific_submissions(study_id, api_token)
    pid_to_sub: dict[str, dict] = {}
    for s in subs:
        pid_to_sub[s.get("participant_id", "")] = {
            "id": s.get("id", ""),
            "status": s.get("status", ""),
        }

    unrejected = 0
    would_unreject = 0
    skipped = 0
    not_found = 0
    failed = 0

    for pid in pids:
        sub = pid_to_sub.get(pid)
        if not sub:
            print(f"  NOT FOUND: {pid}")
            not_found += 1
            continue
        if sub["status"] != "REJECTED":
            print(f"  SKIP: {pid} - status is {sub['status']} (not REJECTED)")
            skipped += 1
            continue

        if dry_run:
            print(f"  DRY RUN: would unreject {pid} (submission {sub['id']})")
            would_unreject += 1
        else:
            try:
                prolific_unreject(sub["id"], api_token)
                unrejected += 1
            except Exception as e:
                print(f"  FAILED: {pid} - {e}")
                failed += 1

    print()
    if dry_run:
        print(
            f"WOULD UNREJECT: {would_unreject} | SKIPPED: {skipped} "
            f"| NOT FOUND: {not_found}"
        )
    else:
        print(
            f"UNREJECTED: {unrejected} | SKIPPED: {skipped} "
            f"| NOT FOUND: {not_found} | FAILED: {failed}"
        )


if __name__ == "__main__":
    main()
