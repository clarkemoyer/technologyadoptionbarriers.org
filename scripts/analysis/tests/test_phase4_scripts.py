"""Tests for Phase 4 scripts - reject, message, thank-you, custom, unreject."""

import csv
import subprocess
import sys
from pathlib import Path
from unittest.mock import patch

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

SCRIPTS_DIR = Path(__file__).parent.parent


def _write_csv(tmp_path, headers, rows, filename="disposition.csv"):
    path = str(tmp_path / filename)
    with open(path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        for row in rows:
            writer.writerow(row)
    return path


# ── reject_auto_exclude.py ──────────────────────────────────────

class TestRejectAutoExclude:
    SCRIPT = str(SCRIPTS_DIR / "reject_auto_exclude.py")

    def test_classify_sub_type(self):
        from reject_auto_exclude import classify_sub_type
        assert classify_sub_type(1, 3) == "IRI3_SPEED"
        assert classify_sub_type(0, 3) == "IRI3"
        assert classify_sub_type(1, 2) == "IRI2_SPEED"
        assert classify_sub_type(0, 2) == "IRI2"
        assert classify_sub_type(1, 1) == "SPEED_IRI"

    def test_build_rejection_message_speed(self):
        from reject_auto_exclude import build_rejection_message
        msg = build_rejection_message(3, 1, 180)
        assert "3.0 minutes" in msg
        assert "below our 5-minute minimum" in msg
        assert "3 of 3 embedded attention checks" in msg

    def test_build_rejection_message_no_speed(self):
        from reject_auto_exclude import build_rejection_message
        msg = build_rejection_message(2, 0, 600)
        assert "5-minute minimum" not in msg
        assert "2 of 3 embedded attention checks" in msg

    def test_build_rejection_categories(self):
        from reject_auto_exclude import build_rejection_categories
        cats = build_rejection_categories(1)
        assert "FAILED_ATTENTION_CHECK" in cats
        assert "TOO_QUICKLY" in cats
        assert "OTHER" in cats

        cats_no_speed = build_rejection_categories(0)
        assert "TOO_QUICKLY" not in cats_no_speed

    def test_dry_run_csv_parsing(self, tmp_path):
        csv_path = _write_csv(
            tmp_path,
            ["PROLIFIC_PID", "Disposition", "IRI_Fail_Count", "Speed_Flag",
             "Duration_Seconds", "IRI_Barrier_Pass", "IRI_Readiness_Pass",
             "IRI_Maturity_Pass", "reCAPTCHA_Score", "reCAPTCHA_Flag",
             "Straightlining_Count"],
            [
                ["PID_A", "AUTO-EXCLUDE", "3", "1", "120", "0", "0", "0", "0.9", "0", "0"],
                ["PID_B", "AUTO-EXCLUDE", "2", "0", "600", "1", "0", "0", "0.9", "0", "0"],
                ["PID_C", "CLEAN", "0", "0", "900", "1", "1", "1", "0.9", "0", "0"],
            ],
        )
        result = subprocess.run(
            [sys.executable, self.SCRIPT],
            env={
                "PROLIFIC_API_TOKEN": "test",
                "STUDY_ID": "STUDY_1",
                "CSV_FILE_PATH": csv_path,
                "DRY_RUN": "true",
            },
            capture_output=True,
            text=True,
        )
        # Dry run doesn't call API, but still parses CSV
        assert "AUTO-EXCLUDE: 2" in result.stdout or "Participants with Disposition == AUTO-EXCLUDE: 2" in result.stdout

    def test_safety_stop(self, tmp_path):
        csv_path = _write_csv(
            tmp_path,
            ["PROLIFIC_PID", "Disposition", "IRI_Fail_Count", "Speed_Flag",
             "Duration_Seconds"],
            [["PID_A", "AUTO-EXCLUDE", "3", "0", "600"]],
        )
        result = subprocess.run(
            [sys.executable, self.SCRIPT],
            env={
                "PROLIFIC_API_TOKEN": "test",
                "STUDY_ID": "STUDY_1",
                "CSV_FILE_PATH": csv_path,
                "DRY_RUN": "false",
                "CONFIRM_REJECT": "wrong",
            },
            capture_output=True,
            text=True,
        )
        assert result.returncode != 0
        assert "SAFETY STOP" in result.stderr

    def test_sub_type_filter(self, tmp_path):
        csv_path = _write_csv(
            tmp_path,
            ["PROLIFIC_PID", "Disposition", "IRI_Fail_Count", "Speed_Flag",
             "Duration_Seconds", "IRI_Barrier_Pass", "IRI_Readiness_Pass",
             "IRI_Maturity_Pass", "reCAPTCHA_Score", "reCAPTCHA_Flag",
             "Straightlining_Count"],
            [
                ["PID_A", "AUTO-EXCLUDE", "3", "1", "120", "0", "0", "0", "0.9", "0", "0"],
                ["PID_B", "AUTO-EXCLUDE", "2", "0", "600", "1", "0", "0", "0.9", "0", "0"],
            ],
        )
        result = subprocess.run(
            [sys.executable, self.SCRIPT],
            env={
                "PROLIFIC_API_TOKEN": "test",
                "STUDY_ID": "STUDY_1",
                "CSV_FILE_PATH": csv_path,
                "DRY_RUN": "true",
                "SUB_TYPE": "IRI2",
            },
            capture_output=True,
            text=True,
        )
        assert "Sub-type filter: IRI2" in result.stdout
        assert "Matched: 1 of 2" in result.stdout


# ── message_flagged.py ──────────────────────────────────────────

class TestMessageFlagged:
    def test_build_flag_message_speed(self):
        from message_flagged import build_flag_message
        msg = build_flag_message({
            "disposition": "FLAG-SPEED",
            "duration": 240,
            "iri_barrier_pass": 1,
            "iri_readiness_pass": 1,
            "iri_maturity_pass": 1,
            "partial_straightlining_blocks": "",
        })
        assert "4.0 minutes" in msg
        assert "faster than expected" in msg

    def test_build_flag_message_single_iri(self):
        from message_flagged import build_flag_message
        msg = build_flag_message({
            "disposition": "FLAG-SINGLE-IRI",
            "duration": 600,
            "iri_barrier_pass": 0,
            "iri_readiness_pass": 1,
            "iri_maturity_pass": 1,
            "partial_straightlining_blocks": "",
        })
        assert "1 of 3 embedded attention checks" in msg
        assert "Major Barrier" in msg

    def test_build_flag_message_partial_straightlining(self):
        from message_flagged import build_flag_message
        msg = build_flag_message({
            "disposition": "FLAG-PARTIAL-STRAIGHTLINING",
            "duration": 600,
            "iri_barrier_pass": 1,
            "iri_readiness_pass": 1,
            "iri_maturity_pass": 1,
            "partial_straightlining_blocks": "Barriers;Readiness",
        })
        assert "Barriers, Readiness" in msg

    def test_build_flag_message_auto_exclude_return(self):
        from message_flagged import build_flag_message
        msg = build_flag_message({
            "disposition": "AUTO-EXCLUDE:IRI2_RETURN",
            "duration": 600,
            "iri_barrier_pass": 0,
            "iri_readiness_pass": 0,
            "iri_maturity_pass": 1,
            "partial_straightlining_blocks": "",
        })
        assert "2 of 3 embedded attention check" in msg
        assert "return it voluntarily" in msg

    def test_get_message_signature(self):
        from message_flagged import get_message_signature
        assert "faster than expected" in get_message_signature("FLAG-SPEED")
        assert "benchmark of 9 minutes" in get_message_signature("FLAG-SMEAL")
        assert get_message_signature("UNKNOWN") == ""

    def test_valid_dispositions(self):
        from message_flagged import VALID_DISPOSITIONS, build_flag_message
        # Every valid disposition should produce a non-empty message
        base_record = {
            "duration": 300,
            "iri_barrier_pass": 0,
            "iri_readiness_pass": 0,
            "iri_maturity_pass": 0,
            "partial_straightlining_blocks": "Barriers",
        }
        for disp in VALID_DISPOSITIONS:
            msg = build_flag_message({**base_record, "disposition": disp})
            assert msg, f"Empty message for {disp}"
            assert "Technology Adoption Barriers Survey" in msg


# ── send_thank_you.py ───────────────────────────────────────────

class TestSendThankYou:
    def test_constants(self):
        from send_thank_you import THANK_YOU_MESSAGE, SIGNATURE
        assert SIGNATURE in THANK_YOU_MESSAGE
        assert "Technology Adoption Barriers Survey" in THANK_YOU_MESSAGE

    def test_missing_env(self):
        result = subprocess.run(
            [sys.executable, str(SCRIPTS_DIR / "send_thank_you.py")],
            env={"STUDY_ID": "S1", "PID_LIST": "P1"},
            capture_output=True,
            text=True,
        )
        assert result.returncode != 0
        assert "PROLIFIC_API_TOKEN" in result.stderr


# ── send_custom_message.py ──────────────────────────────────────

class TestSendCustomMessage:
    def test_missing_message(self):
        result = subprocess.run(
            [sys.executable, str(SCRIPTS_DIR / "send_custom_message.py")],
            env={"PROLIFIC_API_TOKEN": "t", "STUDY_ID": "S1", "PID": "P1"},
            capture_output=True,
            text=True,
        )
        assert result.returncode != 0
        assert "MESSAGE" in result.stderr

    def test_missing_pid(self):
        result = subprocess.run(
            [sys.executable, str(SCRIPTS_DIR / "send_custom_message.py")],
            env={"PROLIFIC_API_TOKEN": "t", "STUDY_ID": "S1", "MESSAGE": "hi"},
            capture_output=True,
            text=True,
        )
        assert result.returncode != 0
        assert "PID" in result.stderr


# ── unreject_submissions.py ─────────────────────────────────────

class TestUnrejectSubmissions:
    def test_missing_env(self):
        result = subprocess.run(
            [sys.executable, str(SCRIPTS_DIR / "unreject_submissions.py")],
            env={"PROLIFIC_API_TOKEN": "t", "STUDY_ID": "S1"},
            capture_output=True,
            text=True,
        )
        assert result.returncode != 0
        assert "PID_LIST" in result.stderr


# ── tabs_api.py write operations ────────────────────────────────

class TestAPIWriteOps:
    def test_rejection_categories(self):
        from tabs_api import REJECTION_CATEGORIES
        assert "FAILED_ATTENTION_CHECK" in REJECTION_CATEGORIES
        assert "TOO_QUICKLY" in REJECTION_CATEGORIES
        assert "OTHER" in REJECTION_CATEGORIES

    def test_reject_submission_url_and_payload(self):
        from tabs_api import prolific_reject_submission
        calls = []

        def mock_http(method, url, headers, body=None, timeout=60):
            calls.append((method, url, body))
            return b'{"id": "sub1"}'

        with patch("tabs_api._http", side_effect=mock_http):
            prolific_reject_submission(
                "sub123",
                ["FAILED_ATTENTION_CHECK", "OTHER"],
                "Test message",
                "token123",
            )

        assert len(calls) == 1
        method, url, body = calls[0]
        assert method == "POST"
        assert "/submissions/sub123/transition/" in url
        import json
        payload = json.loads(body)
        assert payload["action"] == "REJECT"
        assert payload["rejection_categories"] == ["FAILED_ATTENTION_CHECK", "OTHER"]
        assert payload["message"] == "Test message"

    def test_get_submission_ids_map(self):
        from tabs_api import prolific_get_submission_ids_map

        mock_subs = [
            {"participant_id": "PID1", "id": "SUB1", "status": "APPROVED"},
            {"participant_id": "PID2", "id": "SUB2", "status": "REJECTED"},
            {"participant_id": "PID3", "id": "SUB3", "status": "ACTIVE"},
        ]

        with patch("tabs_api.prolific_submissions", return_value=mock_subs):
            result = prolific_get_submission_ids_map("study1", ["PID1", "PID3"], "token")

        assert result == {"PID1": "SUB1", "PID3": "SUB3"}
        assert "PID2" not in result


# ── reject_failed_iri.py ────────────────────────────────────────

class TestRejectFailedIRI:
    SCRIPT = str(SCRIPTS_DIR / "reject_failed_iri.py")

    def test_message_includes_iri_count(self):
        from reject_failed_iri import build_rejection_message
        msg = build_rejection_message(3, 0, 600)
        assert "3 of 3 embedded attention checks" in msg
        assert "5-minute minimum" not in msg

    def test_message_includes_speed_when_flagged(self):
        from reject_failed_iri import build_rejection_message
        msg = build_rejection_message(3, 1, 180)
        assert "3.0 minutes" in msg
        assert "5-minute minimum" in msg

    def test_categories_include_attention_and_other(self):
        from reject_failed_iri import build_rejection_categories
        cats = build_rejection_categories(0)
        assert "FAILED_ATTENTION_CHECK" in cats
        assert "OTHER" in cats
        assert "TOO_QUICKLY" not in cats

    def test_categories_include_speed_when_flagged(self):
        from reject_failed_iri import build_rejection_categories
        cats = build_rejection_categories(1)
        assert "TOO_QUICKLY" in cats

    def test_safety_stop(self, tmp_path):
        csv_path = _write_csv(
            tmp_path,
            ["PROLIFIC_PID", "IRI_Fail_Count", "Speed_Flag", "Duration_Seconds"],
            [["PID_A", "3", "0", "600"]],
        )
        result = subprocess.run(
            [sys.executable, self.SCRIPT],
            env={
                "PROLIFIC_API_TOKEN": "test",
                "STUDY_ID": "STUDY_1",
                "CSV_FILE_PATH": csv_path,
                "DRY_RUN": "false",
                "CONFIRM_REJECT": "wrong",
            },
            capture_output=True,
            text=True,
        )
        assert result.returncode != 0
        assert "SAFETY STOP" in result.stderr

    def test_dry_run_filters_iri3_only(self, tmp_path):
        csv_path = _write_csv(
            tmp_path,
            ["PROLIFIC_PID", "IRI_Fail_Count", "Speed_Flag", "Duration_Seconds"],
            [
                ["PID_A", "3", "0", "600"],
                ["PID_B", "2", "0", "600"],
                ["PID_C", "3", "1", "120"],
            ],
        )
        result = subprocess.run(
            [sys.executable, self.SCRIPT],
            env={
                "PROLIFIC_API_TOKEN": "test",
                "STUDY_ID": "STUDY_1",
                "CSV_FILE_PATH": csv_path,
                "DRY_RUN": "true",
            },
            capture_output=True,
            text=True,
        )
        assert "IRI_Fail_Count == 3: 2" in result.stdout


# ── reject_by_pid.py ────────────────────────────────────────────

class TestRejectByPid:
    """Tests for disposition-aware rejection helpers in reject_by_pid.py."""

    def _row(self, disposition, duration=600, iri_fail=2, speed_flag=0):
        return {
            "PROLIFIC_PID": "PID_TEST",
            "Disposition": disposition,
            "Duration_Seconds": str(duration),
            "IRI_Fail_Count": str(iri_fail),
            "Speed_Flag": str(speed_flag),
        }

    def test_auto_exclude_message_and_categories(self):
        from reject_by_pid import _classify_and_build, SMEAL_BENCHMARK_MIN
        msg, cats = _classify_and_build(self._row("AUTO-EXCLUDE", duration=600, iri_fail=2, speed_flag=0))
        assert "2 of 3 embedded attention checks" in msg
        assert f"{SMEAL_BENCHMARK_MIN:.0f}-minute minimum" not in msg  # no speed flag
        assert "FAILED_ATTENTION_CHECK" in cats
        assert "TOO_QUICKLY" not in cats
        assert "OTHER" in cats

    def test_auto_exclude_with_speed_uses_smeal_constant(self):
        from reject_by_pid import _classify_and_build, SMEAL_BENCHMARK_MIN
        msg, cats = _classify_and_build(self._row("AUTO-EXCLUDE", duration=180, iri_fail=3, speed_flag=1))
        assert f"{SMEAL_BENCHMARK_MIN:.0f}-minute minimum" in msg
        assert "3.0 minutes" in msg
        assert "3 of 3 embedded attention checks" in msg
        assert "FAILED_ATTENTION_CHECK" in cats
        assert "TOO_QUICKLY" in cats

    def test_flag_single_iri_message_and_categories(self):
        from reject_by_pid import _classify_and_build
        msg, cats = _classify_and_build(self._row("FLAG-SINGLE-IRI", duration=600, iri_fail=1))
        assert "one of the 3 embedded attention check" in msg
        assert "return-offer message" in msg
        assert "FAILED_ATTENTION_CHECK" in cats
        assert "OTHER" in cats

    def test_flag_smeal_message_and_categories(self):
        from reject_by_pid import _classify_and_build
        msg, cats = _classify_and_build(self._row("FLAG-SMEAL", duration=240))
        assert "4.0 minutes" in msg
        assert "voluntarily" in msg
        assert "TOO_QUICKLY" in cats
        assert "OTHER" in cats

    def test_flag_speed_uses_smeal_constant(self):
        from reject_by_pid import _classify_and_build, SMEAL_BENCHMARK_MIN
        msg, cats = _classify_and_build(self._row("FLAG-SPEED", duration=180))
        assert f"{SMEAL_BENCHMARK_MIN:.0f}-minute minimum" in msg
        assert "TOO_QUICKLY" in cats

    def test_flag_partial_straightlining_message_and_categories(self):
        from reject_by_pid import _classify_and_build
        msg, cats = _classify_and_build(self._row("FLAG-PARTIAL-STRAIGHTLINING", duration=600))
        assert "identical-response pattern" in msg
        assert "LOW_EFFORT" in cats
        assert "OTHER" in cats

    def test_flag_recaptcha_message_and_categories(self):
        from reject_by_pid import _classify_and_build
        msg, cats = _classify_and_build(self._row("FLAG-RECAPTCHA", duration=600))
        assert "reCAPTCHA" in msg
        assert "FAILED_AUTHENTICITY_CHECK" in cats
        assert "OTHER" in cats

    def test_unhandled_disposition_raises(self):
        from reject_by_pid import _classify_and_build
        import pytest
        with pytest.raises(ValueError, match="Unhandled disposition"):
            _classify_and_build(self._row("CLEAN"))

    def test_safe_int_empty_field(self):
        from reject_by_pid import _safe_int
        row = {"Duration_Seconds": "", "IRI_Fail_Count": "NaN", "Speed_Flag": "1"}
        assert _safe_int(row, "Duration_Seconds") == 0
        assert _safe_int(row, "IRI_Fail_Count") == 0
        assert _safe_int(row, "Speed_Flag") == 1

    def test_all_messages_include_survey_name(self):
        from reject_by_pid import _classify_and_build
        dispositions = [
            ("AUTO-EXCLUDE", {"iri_fail": 2, "speed_flag": 0}),
            ("FLAG-SINGLE-IRI", {"iri_fail": 1, "speed_flag": 0}),
            ("FLAG-SMEAL", {}),
            ("FLAG-SPEED", {}),
            ("FLAG-PARTIAL-STRAIGHTLINING", {}),
            ("FLAG-RECAPTCHA", {}),
        ]
        for disp, kwargs in dispositions:
            row = self._row(disp, **kwargs)
            msg, _ = _classify_and_build(row)
            assert "Technology Adoption Barriers Survey" in msg, f"Missing survey name for {disp}"
