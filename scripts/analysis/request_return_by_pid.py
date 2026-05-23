#!/usr/bin/env python3
"""
Request Prolific return for AWAITING REVIEW submissions by PID, disposition-aware.

Mirrors reject_by_pid.py's safety surface but calls the dedicated
/submissions/{id}/request-return/ endpoint instead of REJECT. Used by the
daily pipeline to automate the formal API-level request-return step for the
`stale_no_reply_to_message` bucket produced by find_stale_return_requested.py.

Per-PID reason text comes from the disposition CSV so a FLAG-SMEAL gets a
speed-framed reason while an AUTO-EXCLUDE:IRI3 gets an attention-check reason.
A disposition not in the handled set aborts rather than inventing an
unmodelled reason.

Environment variables:
  PROLIFIC_API_TOKEN          - Prolific API token (required)
  STUDY_ID                    - Prolific study ID (required)
  CSV_FILE_PATH               - Path to disposition CSV (required)
  PID_LIST                    - Comma-separated PIDs (required)
  CONFIRM_REQUEST_RETURN      - Must be "REQUEST_RETURN" for live execution
  DRY_RUN                     - When "false" AND CONFIRM_REQUEST_RETURN matches, live
  MAX_PER_RUN                 - Optional ceiling; abort if PID_LIST exceeds it
  OUTPUT_JSON_PATH            - Optional path for machine-readable results
  BYPASS_STALE_GATE           - When "true", skip the stale_no_reply_to_message
                                bucket check on live runs. Use only for ad-hoc
                                operator decisions on PIDs that have replied
                                but where the operator has already judged the
                                reply insufficient. Default "false".

Exit codes:
  0 - success (live or dry run completed)
  1 - validation, configuration, or API error
  2 - ceiling exceeded (PID_LIST > MAX_PER_RUN); JSON written with status

Results JSON shape (when OUTPUT_JSON_PATH is set):
  {
    "mode": "live" | "dry_run" | "skipped_ceiling",
    "study_id": "...",
    "computed_at": "...",
    "input_count": int,
    "ceiling": int | null,
    "ceiling_exceeded": bool,
    "successes": [{pid, submission_id, disposition, reason}],
    "failures":  [{pid, reason}],
    "skipped_non_awaiting": [{pid, status}]
  }
"""

import csv
import json
import os
import sys
import time
from datetime import timedelta
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple

sys.path.insert(0, str(Path(__file__).parent))

from find_stale_return_requested import (
    DEFAULT_RESEARCHER_ID,
    _API_CALL_DELAY,
    _fetch_messages_with_backoff,
    classify_submission,
)
from tabs_api import (
    prolific_request_return,
    prolific_study_info,
    prolific_submissions,
)

_CONSTANTS_PATH = Path(__file__).parent / "tabs_v2_constants.json"
_CONSTANTS = json.loads(_CONSTANTS_PATH.read_text(encoding="utf-8")) if _CONSTANTS_PATH.exists() else {}
_SMEAL_SECONDS = _CONSTANTS.get("DURATION_THRESHOLDS", {}).get("smealBenchmarkMin", 300)
_SMEAL_MAX_SECONDS = _CONSTANTS.get("DURATION_THRESHOLDS", {}).get("smealBenchmarkMax", 540)
SMEAL_BENCHMARK_MIN: float = _SMEAL_SECONDS / 60
SMEAL_BENCHMARK_MAX: float = _SMEAL_MAX_SECONDS / 60


def _require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        print(f"Error: {name} is required", file=sys.stderr)
        sys.exit(1)
    return value


def _fmt_minutes(duration_seconds: int) -> str:
    return f"{duration_seconds / 60:.1f}"


def _safe_int(row: Dict[str, str], key: str) -> int:
    raw = (row.get(key) or "").strip()
    return int(raw) if raw.isdigit() else 0


# ── Per-disposition reason builders ──────────────────────────────────────
# Each returns a single reason string Prolific stores on the submission and
# surfaces to the participant in their return-request notification.


def _reason_auto_exclude(duration: int, iri_fail: int, speed_flag: int) -> str:
    parts = []
    if speed_flag == 1:
        parts.append(
            f"completion time of {_fmt_minutes(duration)} minutes was below our "
            f"{SMEAL_BENCHMARK_MIN:.0f}-minute minimum"
        )
    parts.append(f"{iri_fail} of 3 embedded attention checks were answered differently than instructed")
    return "Quality review: " + " and ".join(parts)


def _reason_flag_single_iri() -> str:
    return (
        "Quality review: 1 of 3 embedded attention check questions was answered "
        "differently than the instructions specified."
    )


def _reason_flag_smeal(duration: int) -> str:
    return (
        f"Quality review: completion time of {_fmt_minutes(duration)} minutes is well "
        f"below the typical {SMEAL_BENCHMARK_MAX:.0f}-minute benchmark for reading every item carefully."
    )


def _reason_flag_speed(duration: int) -> str:
    return (
        f"Quality review: completion time of {_fmt_minutes(duration)} minutes is below "
        f"our {SMEAL_BENCHMARK_MIN:.0f}-minute minimum."
    )


def _reason_flag_partial_straightlining() -> str:
    return (
        "Quality review: several response blocks showed identical-response patterns "
        "suggesting some questions were not read carefully."
    )


def _reason_flag_recaptcha() -> str:
    return "Quality review: reCAPTCHA authenticity score was below our threshold."


def _classify_and_build(row: Dict[str, str]) -> str:
    duration = _safe_int(row, "Duration_Seconds")
    iri_fail = _safe_int(row, "IRI_Fail_Count")
    speed_flag = _safe_int(row, "Speed_Flag")
    disposition = (row.get("Disposition") or "").strip()

    if disposition == "AUTO-EXCLUDE":
        return _reason_auto_exclude(duration, iri_fail, speed_flag)
    if disposition == "FLAG-SINGLE-IRI":
        return _reason_flag_single_iri()
    if disposition == "FLAG-SMEAL":
        return _reason_flag_smeal(duration)
    if disposition == "FLAG-SPEED":
        return _reason_flag_speed(duration)
    if disposition == "FLAG-PARTIAL-STRAIGHTLINING":
        return _reason_flag_partial_straightlining()
    if disposition == "FLAG-RECAPTCHA":
        return _reason_flag_recaptcha()
    raise ValueError(
        f"Unhandled disposition {disposition!r} for PID {row.get('PROLIFIC_PID')}"
    )


def _write_json(path_raw: str, payload: Dict) -> None:
    path = Path(path_raw)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, sort_keys=True), encoding="utf-8")


def _parse_pid_list(raw: str) -> List[str]:
    target: List[str] = []
    seen: Set[str] = set()
    for chunk in raw.split(","):
        pid = chunk.strip()
        if not pid:
            continue
        if pid in seen:
            print(f"WARNING: duplicate PID in PID_LIST (ignored): {pid}", file=sys.stderr)
            continue
        seen.add(pid)
        target.append(pid)
    return target


def _parse_max_per_run(raw: str) -> Optional[int]:
    value = raw.strip()
    if not value:
        return None
    try:
        parsed = int(value)
    except ValueError:
        print(
            f"Error: invalid MAX_PER_RUN={raw!r}. Expected a positive integer.",
            file=sys.stderr,
        )
        sys.exit(1)
    if parsed <= 0:
        print(
            f"Error: invalid MAX_PER_RUN={raw!r}. Expected a positive integer.",
            file=sys.stderr,
        )
        sys.exit(1)
    return parsed


def main() -> None:
    print("================================================================")
    print("  Prolific Request-Return by PID (disposition-aware)")
    print("================================================================")
    print()

    api_token = _require_env("PROLIFIC_API_TOKEN")
    study_id = _require_env("STUDY_ID")
    csv_path = _require_env("CSV_FILE_PATH")
    pid_list_raw = _require_env("PID_LIST")
    dry_run = os.environ.get("DRY_RUN", "true").strip().lower() != "false"
    confirm = os.environ.get("CONFIRM_REQUEST_RETURN", "").strip()
    output_json_path = os.environ.get("OUTPUT_JSON_PATH", "").strip()
    bypass_stale_gate = os.environ.get("BYPASS_STALE_GATE", "false").strip().lower() == "true"
    max_per_run_raw = os.environ.get("MAX_PER_RUN", "")
    max_per_run = _parse_max_per_run(max_per_run_raw)
    stale_hours_raw = os.environ.get("STALE_HOURS", "48")
    researcher_id = os.environ.get("RESEARCHER_ID", DEFAULT_RESEARCHER_ID).strip() or DEFAULT_RESEARCHER_ID
    try:
        stale_hours = int(stale_hours_raw)
    except ValueError:
        print(
            f"Error: invalid STALE_HOURS={stale_hours_raw!r}. Expected an integer.",
            file=sys.stderr,
        )
        sys.exit(1)
    if stale_hours <= 0:
        print(
            f"Error: invalid STALE_HOURS={stale_hours_raw!r}. Expected a positive integer.",
            file=sys.stderr,
        )
        sys.exit(1)

    if not dry_run and confirm != "REQUEST_RETURN":
        print("================================================================", file=sys.stderr)
        print('  SAFETY STOP: CONFIRM_REQUEST_RETURN must be exactly "REQUEST_RETURN"', file=sys.stderr)
        print(f'  Received: "{confirm}"', file=sys.stderr)
        print("================================================================", file=sys.stderr)
        sys.exit(1)

    target_pids = _parse_pid_list(pid_list_raw)
    if not target_pids:
        print("Error: PID_LIST must contain at least one PID", file=sys.stderr)
        sys.exit(1)

    print(f"Target PIDs: {len(target_pids)}")
    print(f"Mode: {'DRY RUN' if dry_run else 'LIVE REQUEST-RETURN'}")
    print(f"Ceiling (MAX_PER_RUN): {max_per_run if max_per_run is not None else 'unset (no limit)'}")
    if bypass_stale_gate:
        print("BYPASS_STALE_GATE=true - will NOT enforce stale_no_reply_to_message bucket gate")
    print()

    computed_at = datetime.now(timezone.utc).isoformat()
    base_payload: Dict = {
        "study_id": study_id,
        "computed_at": computed_at,
        "input_count": len(target_pids),
        "target_pids": target_pids,
        "ceiling": max_per_run,
        "ceiling_exceeded": False,
        "successes": [],
        "failures": [],
        "skipped_non_awaiting": [],
    }

    # ── Ceiling guard ──
    if max_per_run is not None and len(target_pids) > max_per_run:
        print("================================================================", file=sys.stderr)
        print(f"  CEILING EXCEEDED: {len(target_pids)} PIDs > MAX_PER_RUN={max_per_run}", file=sys.stderr)
        print("  Refusing to act. Manual review required.", file=sys.stderr)
        print("================================================================", file=sys.stderr)
        base_payload["mode"] = "skipped_ceiling"
        base_payload["ceiling_exceeded"] = True
        if output_json_path:
            _write_json(output_json_path, base_payload)
        sys.exit(2)

    # ── Load disposition CSV ──
    print(f"Reading disposition CSV from {csv_path}")
    rows_by_pid: Dict[str, Dict[str, str]] = {}
    with open(csv_path, encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            pid = (row.get("PROLIFIC_PID") or "").strip()
            if pid:
                rows_by_pid[pid] = row
    print(f"  Loaded {len(rows_by_pid)} rows.")

    missing = [p for p in target_pids if p not in rows_by_pid]
    if missing:
        print("Error: the following PIDs are not in the disposition CSV:", file=sys.stderr)
        for p in missing:
            print(f"  {p}", file=sys.stderr)
        sys.exit(1)

    # ── Build plan ──
    records: List[Dict] = []
    for pid in target_pids:
        row = rows_by_pid[pid]
        try:
            reason = _classify_and_build(row)
        except ValueError as e:
            print(f"Error: {e}", file=sys.stderr)
            sys.exit(1)
        records.append({
            "pid": pid,
            "disposition": (row.get("Disposition") or "").strip(),
            "reason": reason,
        })

    by_disp: Dict[str, List[str]] = {}
    print()
    print("Request-return plan:")
    for r in records:
        by_disp.setdefault(r["disposition"], []).append(r["pid"])
        print(f"  PID: {r['pid']}")
        print(f"    Disposition: {r['disposition']}")
        print(f"    Reason: {r['reason']}")
        print()

    print("By disposition:")
    for disp, pids in sorted(by_disp.items()):
        print(f"  {disp}: {len(pids)}")
    print()

    if dry_run:
        print("================================================================")
        print(f"  DRY RUN - no submissions will be modified")
        print(f"  Would request return on: {len(records)} participants")
        print("================================================================")
        base_payload["mode"] = "dry_run"
        # Treat plan rows as "successes" in dry-run so the report can preview
        base_payload["successes"] = [
            {"pid": r["pid"], "submission_id": None, "disposition": r["disposition"], "reason": r["reason"]}
            for r in records
        ]
        if output_json_path:
            _write_json(output_json_path, base_payload)
        return

    # ── Verify API and resolve submission IDs ──
    print("Verifying Prolific API connection...")
    study = prolific_study_info(study_id, api_token)
    print(f"  Study: {study.get('name', 'UNKNOWN')} (status: {study.get('status', 'UNKNOWN')})")
    print()

    target_pid_set = {r["pid"] for r in records}
    all_subs = prolific_submissions(study_id, api_token)
    pid_to_sub_id: Dict[str, str] = {}
    status_map: Dict[str, str] = {}
    submission_by_pid: Dict[str, Dict] = {}
    for s in all_subs:
        p = s.get("participant_id", "")
        if not p:
            continue
        submission_by_pid[p] = s
        status_map[p] = s.get("status", "UNKNOWN")
        if p in target_pid_set and s.get("id"):
            pid_to_sub_id[p] = s["id"]

    # Skip (don't error) any PID not in AWAITING REVIEW — could have been
    # actioned out-of-band since the artifact was produced.
    actionable: List[Dict] = []
    stale_now = datetime.now(timezone.utc)
    stale_cutoff = stale_now - timedelta(hours=stale_hours)
    revalidation_idx = 0
    for r in records:
        status = status_map.get(r["pid"], "NOT FOUND")
        if status == "NOT FOUND":
            print(
                f"  FAILED {r['pid']}: not found in live study submissions",
                file=sys.stderr,
            )
            base_payload["failures"].append(
                {"pid": r["pid"], "reason": "submission not found in live study"}
            )
            continue
        if status != "AWAITING REVIEW":
            print(f"  SKIPPING {r['pid']}: status is {status!r}, not AWAITING REVIEW", file=sys.stderr)
            base_payload["skipped_non_awaiting"].append({"pid": r["pid"], "status": status})
            continue

        submission = submission_by_pid.get(r["pid"])
        if submission is None:
            base_payload["failures"].append(
                {"pid": r["pid"], "reason": "submission payload missing after live fetch"}
            )
            continue
        try:
            if revalidation_idx > 0:
                time.sleep(_API_CALL_DELAY)
            revalidation_idx += 1
            messages, err = _fetch_messages_with_backoff(r["pid"], api_token)
            if messages is None:
                raise RuntimeError(f"message fetch failed: {err}")
            bucket, _ = classify_submission(
                submission,
                messages,
                researcher_id,
                stale_now,
                stale_cutoff,
            )
        except Exception as e:
            base_payload["failures"].append(
                {"pid": r["pid"], "reason": f"revalidation failed: {e}"}
            )
            continue
        if bucket != "stale_no_reply_to_message" and not bypass_stale_gate:
            status_label = f"NO_LONGER_ELIGIBLE:{bucket or 'NONE'}"
            print(
                f"  SKIPPING {r['pid']}: stale revalidation result {status_label}",
                file=sys.stderr,
            )
            base_payload["skipped_non_awaiting"].append({"pid": r["pid"], "status": status_label})
            continue
        if bucket != "stale_no_reply_to_message" and bypass_stale_gate:
            print(
                f"  BYPASS_STALE_GATE: {r['pid']} bucket={bucket or 'NONE'} - proceeding anyway",
                file=sys.stderr,
            )
        sub_id = pid_to_sub_id.get(r["pid"])
        if not sub_id:
            base_payload["failures"].append({"pid": r["pid"], "reason": "no submission id"})
            continue
        actionable.append({**r, "submission_id": sub_id})

    print()
    print("================================================================")
    print(f"  LIVE REQUEST-RETURN: {len(actionable)} submissions")
    print("================================================================")
    print()

    for r in actionable:
        print(f"  Requesting return for {r['pid']} ({r['disposition']}, submission {r['submission_id']})...")
        try:
            prolific_request_return(r["submission_id"], [r["reason"]], api_token)
            base_payload["successes"].append({
                "pid": r["pid"],
                "submission_id": r["submission_id"],
                "disposition": r["disposition"],
                "reason": r["reason"],
            })
        except Exception as e:
            print(f"    FAILED: {e}", file=sys.stderr)
            base_payload["failures"].append({"pid": r["pid"], "reason": str(e)})

    base_payload["mode"] = "live"
    print()
    print(
        f"REQUESTED: {len(base_payload['successes'])} | "
        f"FAILED: {len(base_payload['failures'])} | "
        f"SKIPPED (not awaiting): {len(base_payload['skipped_non_awaiting'])}"
    )

    if output_json_path:
        _write_json(output_json_path, base_payload)

    if base_payload["failures"]:
        sys.exit(1)


if __name__ == "__main__":
    main()
