#!/usr/bin/env python3
"""
Generate disposition-summary.json from live Prolific API data + disposition CSV.

Python port of scripts/generate-disposition-summary.ts.

Combines:
  1. Prolific API - real submission statuses (approved, rejected, returned, etc.)
  2. Disposition CSV - triage results (CLEAN, AUTO-EXCLUDE, FLAG-*, etc.)

Output: src/data/disposition-summary.json (committed to repo, drives the dashboard page)

Environment variables:
  PROLIFIC_API_TOKEN  – Prolific API token (required)
  STUDY_ID            – Prolific study ID (required)
  CSV_FILE_PATH       – Path to disposition CSV from pipeline (required)
  OUTPUT_PATH         – Path to write JSON (optional, defaults to src/data/disposition-summary.json)
"""

import csv
import json
import math
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from tabs_api import (
    prolific_study_info,
    prolific_submissions,
    prolific_recent_messages,
)


def _require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        print(f"Error: {name} is required", file=sys.stderr)
        sys.exit(1)
    return value


def main():
    api_token = _require_env("PROLIFIC_API_TOKEN")
    study_id = _require_env("STUDY_ID")
    csv_file_path = _require_env("CSV_FILE_PATH")

    print("Generating disposition summary from live data...")
    print()

    # ── 1. Fetch live Prolific data ──────────────────────────────

    print("Fetching Prolific study data...")
    study = prolific_study_info(study_id, api_token)
    subs = prolific_submissions(study_id, api_token)

    thirty_days_ago = (datetime.now(timezone.utc) - timedelta(days=30)).strftime("%Y-%m-%dT%H:%M:%SZ")
    try:
        messages = prolific_recent_messages(thirty_days_ago, api_token)
    except Exception:
        messages = []

    # Build PID → Prolific status map
    status_by_pid: dict[str, str] = {}
    status_counts: dict[str, int] = {}
    for sub in subs:
        status = sub.get("status", "UNKNOWN")
        status_counts[status] = status_counts.get(status, 0) + 1
        status_by_pid[sub.get("participant_id", "")] = status

    study_name = study.get("name", f"Study {study_id}")
    print(f"Study: {study_name}")
    print(f"Total submissions: {len(subs)}")
    for status, count in sorted(status_counts.items(), key=lambda x: -x[1]):
        print(f"  {status}: {count}")

    # Count unique participants messaged (filter to this study)
    messaged_pids: set[str] = set()
    for msg in messages:
        if (msg.get("data") or {}).get("study_id") == study_id:
            messaged_pids.add(msg.get("channel_id", ""))
    messaged_pids.discard("")
    print(f"Unique participants messaged: {len(messaged_pids)}")
    print()

    # ── 2. Parse disposition CSV ─────────────────────────────────

    print("Parsing disposition CSV...")
    with open(csv_file_path, encoding="utf-8", newline="") as f:
        reader = csv.reader(f)
        rows = list(reader)

    if not rows:
        print("ERROR: Empty CSV", file=sys.stderr)
        sys.exit(1)

    headers = rows[0]

    def col(name: str) -> int:
        try:
            return headers.index(name)
        except ValueError:
            print(f"ERROR: Required column '{name}' not found. Available: {headers[:10]}...", file=sys.stderr)
            sys.exit(1)

    pid_idx = col("PROLIFIC_PID")
    disp_idx = col("Disposition")
    iri_fail_idx = col("IRI_Fail_Count")
    speed_idx = col("Speed_Flag")
    iri_barrier_idx = col("IRI_Barrier_Pass")
    iri_readiness_idx = col("IRI_Readiness_Pass")
    iri_maturity_idx = col("IRI_Maturity_Pass")

    dispositions: dict[str, int] = {}
    auto_exclude_breakdown = {
        "IRI3_SPEED": 0, "IRI3": 0, "IRI2_SPEED": 0, "IRI2": 0, "SPEED_IRI": 0,
    }
    disposition_by_status: dict[str, dict[str, int]] = {}

    total_participants = 0
    finished_participants = 0
    iri_barrier_pass = 0
    iri_readiness_pass = 0
    iri_maturity_pass = 0

    for row in rows[1:]:
        if len(row) <= disp_idx:
            continue
        disposition = row[disp_idx].strip()
        if not disposition:
            continue

        total_participants += 1
        dispositions[disposition] = dispositions.get(disposition, 0) + 1

        # Cross-reference with Prolific status
        pid = row[pid_idx].strip() if pid_idx < len(row) else ""
        prolific_status = status_by_pid.get(pid, "NO_SUBMISSION") if pid else "NO_SUBMISSION"
        if disposition not in disposition_by_status:
            disposition_by_status[disposition] = {}
        disposition_by_status[disposition][prolific_status] = (
            disposition_by_status[disposition].get(prolific_status, 0) + 1
        )

        # Flag anomalies
        if disposition == "AUTO-EXCLUDE" and prolific_status == "APPROVED":
            print(f"  ANOMALY: AUTO-EXCLUDE PID {pid} is APPROVED on Prolific")

        # IRI pass rates - count only finished responses
        if disposition != "INCOMPLETE":
            finished_participants += 1
            iri_barrier_pass += int(row[iri_barrier_idx]) if iri_barrier_idx < len(row) and row[iri_barrier_idx].strip().isdigit() else 0
            iri_readiness_pass += int(row[iri_readiness_idx]) if iri_readiness_idx < len(row) and row[iri_readiness_idx].strip().isdigit() else 0
            iri_maturity_pass += int(row[iri_maturity_idx]) if iri_maturity_idx < len(row) and row[iri_maturity_idx].strip().isdigit() else 0

        # AUTO-EXCLUDE sub-types
        if disposition == "AUTO-EXCLUDE":
            iri_fail = int(row[iri_fail_idx]) if iri_fail_idx < len(row) and row[iri_fail_idx].strip().isdigit() else 0
            speed = int(row[speed_idx]) if speed_idx < len(row) and row[speed_idx].strip().isdigit() else 0

            if iri_fail >= 3 and speed == 1:
                auto_exclude_breakdown["IRI3_SPEED"] += 1
            elif iri_fail >= 3:
                auto_exclude_breakdown["IRI3"] += 1
            elif iri_fail == 2 and speed == 1:
                auto_exclude_breakdown["IRI2_SPEED"] += 1
            elif iri_fail == 2:
                auto_exclude_breakdown["IRI2"] += 1
            elif speed == 1 and iri_fail >= 1:
                auto_exclude_breakdown["SPEED_IRI"] += 1

    print(f"Disposition CSV: {total_participants} participants")
    for d, c in sorted(dispositions.items(), key=lambda x: -x[1]):
        print(f"  {d}: {c}")
    print()

    print("Disposition x Prolific Status cross-reference:")
    for disp, statuses in sorted(disposition_by_status.items()):
        parts = ", ".join(f"{s}:{c}" for s, c in sorted(statuses.items(), key=lambda x: -x[1]))
        print(f"  {disp}: {parts}")
    print()

    # ── 3. Build summary JSON ────────────────────────────────────

    def iri_rate(passes: int) -> float:
        """Compute IRI pass rate with round-half-up to match JS toFixed(1)."""
        if finished_participants <= 0:
            return 0.0
        raw = passes / finished_participants * 100
        # Use math.floor(x * 10 + 0.5) / 10 for round-half-up (matches JS toFixed)
        return math.floor(raw * 10 + 0.5) / 10

    target_n = study.get("total_available_places", 0) or 0
    completed_n = status_counts.get("APPROVED", 0) + status_counts.get("AWAITING REVIEW", 0)

    summary = {
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "last_updated": datetime.now(timezone.utc).isoformat(),
        # Study metadata from Prolific API (matches Prolific UI exactly)
        "study": {
            "id": study_id,
            "name": study_name,
            "status": study.get("status", "UNKNOWN"),
            "totalAvailablePlaces": study.get("total_available_places") or 0,
            "placesTaken": study.get("places_taken") or 0,
            "averageRewardPerHour": study.get("average_reward_per_hour") or 0,
            "averageTimeTaken": study.get("average_time_taken") or 0,
            "reward": study.get("reward") or 0,
            "publishedAt": study.get("published_at", ""),
        },
        # Completion progress: how close to N target
        "completionProgress": {
            "target": target_n,
            "completed": completed_n,
            "approved": status_counts.get("APPROVED", 0),
            "awaitingReview": status_counts.get("AWAITING REVIEW", 0),
            "percentComplete": round(completed_n / target_n * 100, 1) if target_n > 0 else 0,
        },
        "totalResponses": len(subs),
        "uniqueParticipants": total_participants,
        "duplicatesRemoved": 0,
        "dispositions": dispositions,
        "dispositionByStatus": disposition_by_status,
        "autoExcludeBreakdown": auto_exclude_breakdown,
        "actions": {
            "approved": status_counts.get("APPROVED", 0),
            "rejected": status_counts.get("REJECTED", 0),
            "returned": status_counts.get("RETURNED", 0),
            "timedOut": status_counts.get("TIMED-OUT", 0),
            "awaitingReview": status_counts.get("AWAITING REVIEW", 0),
            "active": status_counts.get("ACTIVE", 0),
            "messaged": len(messaged_pids),
        },
        "iriPassRates": {
            "barrier": iri_rate(iri_barrier_pass),
            "readiness": iri_rate(iri_readiness_pass),
            "maturity": iri_rate(iri_maturity_pass),
            "denominator": finished_participants,
        },
        "studyId": study_id,
        "studyName": study_name,
    }

    # ── 4. Write to file ─────────────────────────────────────────

    output_path = os.environ.get("OUTPUT_PATH") or str(
        Path(__file__).parent.parent.parent / "src" / "data" / "disposition-summary.json"
    )
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)
        f.write("\n")

    print(f"Wrote disposition summary to {output_path}")
    print()
    print("Study metadata (from Prolific API):")
    s = summary["study"]
    print(f"  Status: {s['status']}")
    print(f"  Target N: {s['totalAvailablePlaces']}")
    print(f"  Places taken: {s['placesTaken']}")
    print(f"  Avg time: {s['averageTimeTaken']:.0f}s ({s['averageTimeTaken']/60:.1f} min)")
    print(f"  Reward/hr: ${s['averageRewardPerHour']:.2f}")
    print()
    cp = summary["completionProgress"]
    print(f"Completion progress: {cp['completed']}/{cp['target']} ({cp['percentComplete']}%)")
    print(f"  Approved: {cp['approved']}")
    print(f"  Awaiting review: {cp['awaitingReview']}")
    print()
    print("Actions (from live Prolific API):")
    for action, count in summary["actions"].items():
        print(f"  {action}: {count}")


if __name__ == "__main__":
    main()
