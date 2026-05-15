"""Tests for the auto-stale-actions pipeline scripts.

Covers request_return_by_pid.py (new) and the ceiling-guard + JSON-output
behavior added to reject_by_pid.py for unattended pipeline use.
"""

import csv
import json
import subprocess
import sys
from pathlib import Path
from unittest.mock import patch

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

SCRIPTS_DIR = Path(__file__).parent.parent
REQUEST_RETURN_SCRIPT = str(SCRIPTS_DIR / "request_return_by_pid.py")
REJECT_BY_PID_SCRIPT = str(SCRIPTS_DIR / "reject_by_pid.py")

_CSV_HEADERS = [
    "PROLIFIC_PID",
    "Duration_Seconds",
    "IRI_Barrier_Pass",
    "IRI_Readiness_Pass",
    "IRI_Maturity_Pass",
    "IRI_Pass_Count",
    "IRI_Fail_Count",
    "Speed_Flag",
    "Disposition",
]


def _write_csv(tmp_path, rows, filename="disposition.csv"):
    path = str(tmp_path / filename)
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(_CSV_HEADERS)
        for row in rows:
            writer.writerow(row)
    return path


def _row(pid, disposition, iri_fail=0, speed_flag=0, duration=600):
    return [pid, str(duration), "1", "1", "1", "3", str(iri_fail), str(speed_flag), disposition]


# ── request_return_by_pid.py: pure reason builders ─────────────────────


class TestRequestReturnReasonBuilders:
    def test_auto_exclude_iri3_no_speed(self):
        from request_return_by_pid import _reason_auto_exclude
        reason = _reason_auto_exclude(duration=600, iri_fail=3, speed_flag=0)
        assert "3 of 3" in reason
        assert "minute" not in reason  # no speed clause

    def test_auto_exclude_iri2_with_speed(self):
        from request_return_by_pid import _reason_auto_exclude
        reason = _reason_auto_exclude(duration=120, iri_fail=2, speed_flag=1)
        assert "2.0 minutes" in reason
        assert "2 of 3" in reason

    def test_flag_smeal_mentions_duration(self):
        from request_return_by_pid import _reason_flag_smeal
        assert "4.0 minutes" in _reason_flag_smeal(duration=240)

    def test_flag_single_iri(self):
        from request_return_by_pid import _reason_flag_single_iri
        assert "1 of 3" in _reason_flag_single_iri()

    def test_flag_partial_straightlining(self):
        from request_return_by_pid import _reason_flag_partial_straightlining
        assert "identical-response" in _reason_flag_partial_straightlining()

    def test_flag_recaptcha(self):
        from request_return_by_pid import _reason_flag_recaptcha
        assert "reCAPTCHA" in _reason_flag_recaptcha()

    def test_classify_unknown_disposition_raises(self):
        from request_return_by_pid import _classify_and_build
        with pytest.raises(ValueError):
            _classify_and_build({
                "PROLIFIC_PID": "X",
                "Disposition": "UNKNOWN-WAT",
                "IRI_Fail_Count": "0",
                "Speed_Flag": "0",
                "Duration_Seconds": "600",
            })


# ── request_return_by_pid.py: subprocess-driven behavior ──────────────


class TestRequestReturnByPidScript:
    def test_safety_stop_requires_exact_confirmation(self, tmp_path):
        csv_path = _write_csv(tmp_path, [_row("PID_A", "FLAG-SMEAL", duration=240)])
        result = subprocess.run(
            [sys.executable, REQUEST_RETURN_SCRIPT],
            env={
                "PROLIFIC_API_TOKEN": "t",
                "STUDY_ID": "S",
                "CSV_FILE_PATH": csv_path,
                "PID_LIST": "PID_A",
                "DRY_RUN": "false",
                "CONFIRM_REQUEST_RETURN": "REJECT",  # wrong token
            },
            capture_output=True,
            text=True,
        )
        assert result.returncode == 1
        assert "SAFETY STOP" in result.stderr

    def test_ceiling_exceeded_writes_skipped_json_and_exits_2(self, tmp_path):
        csv_path = _write_csv(
            tmp_path,
            [_row(f"P{i}", "FLAG-SMEAL", duration=240) for i in range(5)],
        )
        json_path = str(tmp_path / "result.json")
        result = subprocess.run(
            [sys.executable, REQUEST_RETURN_SCRIPT],
            env={
                "PROLIFIC_API_TOKEN": "t",
                "STUDY_ID": "S",
                "CSV_FILE_PATH": csv_path,
                "PID_LIST": ",".join(f"P{i}" for i in range(5)),
                "MAX_PER_RUN": "3",
                "DRY_RUN": "true",
                "OUTPUT_JSON_PATH": json_path,
            },
            capture_output=True,
            text=True,
        )
        assert result.returncode == 2
        assert "CEILING EXCEEDED" in result.stderr
        payload = json.loads(Path(json_path).read_text(encoding="utf-8"))
        assert payload["mode"] == "skipped_ceiling"
        assert payload["ceiling_exceeded"] is True
        assert payload["input_count"] == 5
        assert payload["ceiling"] == 3

    def test_dry_run_writes_planned_successes(self, tmp_path):
        csv_path = _write_csv(
            tmp_path,
            [
                _row("PID_A", "AUTO-EXCLUDE", iri_fail=3, duration=600),
                _row("PID_B", "FLAG-SMEAL", duration=240),
            ],
        )
        json_path = str(tmp_path / "result.json")
        result = subprocess.run(
            [sys.executable, REQUEST_RETURN_SCRIPT],
            env={
                "PROLIFIC_API_TOKEN": "t",
                "STUDY_ID": "S",
                "CSV_FILE_PATH": csv_path,
                "PID_LIST": "PID_A,PID_B",
                "DRY_RUN": "true",
                "OUTPUT_JSON_PATH": json_path,
            },
            capture_output=True,
            text=True,
        )
        assert result.returncode == 0, result.stderr
        payload = json.loads(Path(json_path).read_text(encoding="utf-8"))
        assert payload["mode"] == "dry_run"
        assert len(payload["successes"]) == 2
        pids = {s["pid"] for s in payload["successes"]}
        assert pids == {"PID_A", "PID_B"}
        # Reasons differ per disposition
        reasons = {s["disposition"]: s["reason"] for s in payload["successes"]}
        assert "3 of 3" in reasons["AUTO-EXCLUDE"]
        assert "4.0 minutes" in reasons["FLAG-SMEAL"]

    def test_unknown_pid_aborts(self, tmp_path):
        csv_path = _write_csv(tmp_path, [_row("PID_A", "FLAG-SMEAL", duration=240)])
        result = subprocess.run(
            [sys.executable, REQUEST_RETURN_SCRIPT],
            env={
                "PROLIFIC_API_TOKEN": "t",
                "STUDY_ID": "S",
                "CSV_FILE_PATH": csv_path,
                "PID_LIST": "PID_A,PID_NOT_IN_CSV",
                "DRY_RUN": "true",
            },
            capture_output=True,
            text=True,
        )
        assert result.returncode == 1
        assert "PID_NOT_IN_CSV" in result.stderr

    def test_unmodelled_disposition_aborts(self, tmp_path):
        csv_path = _write_csv(tmp_path, [_row("PID_A", "WAT-NEW-DISPOSITION")])
        result = subprocess.run(
            [sys.executable, REQUEST_RETURN_SCRIPT],
            env={
                "PROLIFIC_API_TOKEN": "t",
                "STUDY_ID": "S",
                "CSV_FILE_PATH": csv_path,
                "PID_LIST": "PID_A",
                "DRY_RUN": "true",
            },
            capture_output=True,
            text=True,
        )
        assert result.returncode == 1
        assert "Unhandled disposition" in result.stderr


# ── reject_by_pid.py: new ceiling + JSON output behavior ───────────────


class TestRejectByPidNewBehavior:
    def test_ceiling_exceeded_writes_skipped_json_and_exits_2(self, tmp_path):
        csv_path = _write_csv(
            tmp_path,
            [_row(f"P{i}", "AUTO-EXCLUDE", iri_fail=3, duration=600) for i in range(5)],
        )
        json_path = str(tmp_path / "reject-result.json")
        result = subprocess.run(
            [sys.executable, REJECT_BY_PID_SCRIPT],
            env={
                "PROLIFIC_API_TOKEN": "t",
                "STUDY_ID": "S",
                "CSV_FILE_PATH": csv_path,
                "PID_LIST": ",".join(f"P{i}" for i in range(5)),
                "MAX_PER_RUN": "3",
                "DRY_RUN": "true",
                "OUTPUT_JSON_PATH": json_path,
            },
            capture_output=True,
            text=True,
        )
        assert result.returncode == 2, result.stderr
        assert "CEILING EXCEEDED" in result.stderr
        payload = json.loads(Path(json_path).read_text(encoding="utf-8"))
        assert payload["mode"] == "skipped_ceiling"
        assert payload["ceiling_exceeded"] is True

    def test_dry_run_writes_plan_to_json(self, tmp_path):
        csv_path = _write_csv(
            tmp_path,
            [_row("PID_A", "AUTO-EXCLUDE", iri_fail=3, duration=600)],
        )
        json_path = str(tmp_path / "reject-result.json")
        result = subprocess.run(
            [sys.executable, REJECT_BY_PID_SCRIPT],
            env={
                "PROLIFIC_API_TOKEN": "t",
                "STUDY_ID": "S",
                "CSV_FILE_PATH": csv_path,
                "PID_LIST": "PID_A",
                "DRY_RUN": "true",
                "OUTPUT_JSON_PATH": json_path,
            },
            capture_output=True,
            text=True,
        )
        assert result.returncode == 0, result.stderr
        payload = json.loads(Path(json_path).read_text(encoding="utf-8"))
        assert payload["mode"] == "dry_run"
        assert len(payload["successes"]) == 1
        assert payload["successes"][0]["pid"] == "PID_A"
        assert "FAILED_ATTENTION_CHECK" in payload["successes"][0]["categories"]
