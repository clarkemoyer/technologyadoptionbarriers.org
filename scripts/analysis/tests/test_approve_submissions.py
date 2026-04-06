"""Tests for approve_submissions.py — CSV parsing and PID extraction."""

import csv
import json
import os
import subprocess
import sys
from pathlib import Path
from unittest.mock import patch

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

import approve_submissions

SCRIPT = str(Path(__file__).parent.parent / "approve_submissions.py")


def _write_csv(tmp_path: Path, headers: list[str], rows: list[list[str]]) -> str:
    """Write a CSV file and return its path."""
    path = str(tmp_path / "disposition.csv")
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(rows)
    return path


class TestApproveCSVParsing:
    def test_extracts_clean_pids(self, tmp_path):
        """CLEAN dispositions are correctly extracted."""
        csv_path = _write_csv(
            tmp_path,
            ["PROLIFIC_PID", "ResponseId", "Duration", "Disposition"],
            [
                ["PID_A", "R_001", "600", "CLEAN"],
                ["PID_B", "R_002", "300", "FLAG-SPEED"],
                ["PID_C", "R_003", "700", "CLEAN"],
                ["PID_D", "R_004", "200", "AUTO-EXCLUDE"],
            ],
        )
        env = {
            "PROLIFIC_API_TOKEN": "test_token",
            "STUDY_ID": "STUDY_1",
            "CSV_FILE_PATH": csv_path,
            "DRY_RUN": "true",
        }
        result = subprocess.run(
            [sys.executable, SCRIPT],
            env=env,
            capture_output=True,
            text=True,
        )
        assert result.returncode == 0
        assert "CLEAN dispositions: 2" in result.stdout
        assert "DRY RUN" in result.stdout

    def test_rejects_missing_pid_column(self, tmp_path):
        """Script exits with error when no PID column is found."""
        csv_path = _write_csv(
            tmp_path,
            ["Unknown", "ResponseId", "Duration", "Disposition"],
            [["PID_A", "R_001", "600", "CLEAN"]],
        )
        env = {
            "PROLIFIC_API_TOKEN": "test_token",
            "STUDY_ID": "STUDY_1",
            "CSV_FILE_PATH": csv_path,
            "DRY_RUN": "true",
        }
        result = subprocess.run(
            [sys.executable, SCRIPT],
            env=env,
            capture_output=True,
            text=True,
        )
        assert result.returncode != 0
        assert "Cannot find 'PROLIFIC_PID' column" in result.stderr

    def test_rejects_missing_disposition_column(self, tmp_path):
        """Script exits with error when no Disposition column is found."""
        csv_path = _write_csv(
            tmp_path,
            ["PROLIFIC_PID", "ResponseId", "Duration", "Status"],
            [["PID_A", "R_001", "600", "CLEAN"]],
        )
        env = {
            "PROLIFIC_API_TOKEN": "test_token",
            "STUDY_ID": "STUDY_1",
            "CSV_FILE_PATH": csv_path,
            "DRY_RUN": "true",
        }
        result = subprocess.run(
            [sys.executable, SCRIPT],
            env=env,
            capture_output=True,
            text=True,
        )
        assert result.returncode != 0
        assert "Cannot find" in result.stderr
        assert "Disposition" in result.stderr

    def test_no_clean_dispositions(self, tmp_path):
        """Script handles CSV with no CLEAN rows gracefully."""
        csv_path = _write_csv(
            tmp_path,
            ["PROLIFIC_PID", "Disposition"],
            [
                ["PID_A", "FLAG-SPEED"],
                ["PID_B", "AUTO-EXCLUDE"],
            ],
        )
        env = {
            "PROLIFIC_API_TOKEN": "test_token",
            "STUDY_ID": "STUDY_1",
            "CSV_FILE_PATH": csv_path,
            "DRY_RUN": "true",
        }
        result = subprocess.run(
            [sys.executable, SCRIPT],
            env=env,
            capture_output=True,
            text=True,
        )
        assert result.returncode == 0
        assert "CLEAN dispositions: 0" in result.stdout
        assert "Nothing to approve" in result.stdout

    def test_step_summary_written_when_no_clean(self, tmp_path):
        """Step summary is written even when no CLEAN PIDs are found (auditability)."""
        csv_path = _write_csv(
            tmp_path,
            ["PROLIFIC_PID", "Disposition"],
            [["PID_A", "FLAG-SPEED"]],
        )
        summary_file = str(tmp_path / "summary.md")
        env = {
            "PROLIFIC_API_TOKEN": "test_token",
            "STUDY_ID": "STUDY_1",
            "CSV_FILE_PATH": csv_path,
            "DRY_RUN": "true",
            "GITHUB_STEP_SUMMARY": summary_file,
        }
        result = subprocess.run(
            [sys.executable, SCRIPT],
            env=env,
            capture_output=True,
            text=True,
        )
        assert result.returncode == 0
        summary = Path(summary_file).read_text()
        assert "CLEAN dispositions | 0" in summary
        assert "Newly approved | 0" in summary

    def test_case_insensitive_disposition(self, tmp_path):
        """Disposition matching is case-insensitive."""
        csv_path = _write_csv(
            tmp_path,
            ["PROLIFIC_PID", "Disposition"],
            [
                ["PID_A", "clean"],
                ["PID_B", "Clean"],
                ["PID_C", "CLEAN"],
            ],
        )
        env = {
            "PROLIFIC_API_TOKEN": "test_token",
            "STUDY_ID": "STUDY_1",
            "CSV_FILE_PATH": csv_path,
            "DRY_RUN": "true",
        }
        result = subprocess.run(
            [sys.executable, SCRIPT],
            env=env,
            capture_output=True,
            text=True,
        )
        assert result.returncode == 0
        assert "CLEAN dispositions: 3" in result.stdout

    def test_missing_env_vars(self):
        """Script exits with error when required env vars are missing."""
        result = subprocess.run(
            [sys.executable, SCRIPT],
            env={"PATH": "/usr/bin"},
            capture_output=True,
            text=True,
        )
        assert result.returncode != 0
        assert "required" in result.stderr.lower()

    def test_participant_id_header_rejected(self, tmp_path):
        """Rejects 'participant_id' — only PROLIFIC_PID is accepted for safety."""
        csv_path = _write_csv(
            tmp_path,
            ["participant_id", "Disposition"],
            [["PID_A", "CLEAN"]],
        )
        env = {
            "PROLIFIC_API_TOKEN": "test_token",
            "STUDY_ID": "STUDY_1",
            "CSV_FILE_PATH": csv_path,
            "DRY_RUN": "true",
        }
        result = subprocess.run(
            [sys.executable, SCRIPT],
            env=env,
            capture_output=True,
            text=True,
        )
        assert result.returncode != 0
        assert "Cannot find 'PROLIFIC_PID' column" in result.stderr


class TestApproveMessaging:
    """Unit tests for the thank-you message logic introduced in approve_submissions.py.

    These tests exercise the live (DRY_RUN=false) code path and verify:
    1. Messages are sent only when the participant's Prolific status is APPROVED or
       AWAITING REVIEW — not for non-approvable statuses like RETURNED.
    2. The dedupe guard correctly skips sending when the SIGNATURE string already
       appears in an existing message for the same study.
    """

    def _make_env(self, csv_path: str) -> dict:
        """Minimal environment for a live (non-dry-run) invocation."""
        return {
            "PROLIFIC_API_TOKEN": "tok",
            "STUDY_ID": "STUDY_1",
            "CSV_FILE_PATH": csv_path,
            "DRY_RUN": "false",
        }

    def test_messages_sent_only_for_approved_and_awaiting_review(self, tmp_path):
        """Messages are sent for APPROVED and AWAITING REVIEW, but not for RETURNED."""
        csv_path = _write_csv(
            tmp_path,
            ["PROLIFIC_PID", "Disposition"],
            [
                ["PID_APPR", "CLEAN"],    # status = APPROVED -> must receive message
                ["PID_AWAIT", "CLEAN"],   # status = AWAITING REVIEW -> must receive message
                ["PID_RETURN", "CLEAN"],  # status = RETURNED -> must NOT receive message
            ],
        )
        statuses = {
            "PID_APPR": "APPROVED",
            "PID_AWAIT": "AWAITING REVIEW",
            "PID_RETURN": "RETURNED",
        }
        with (
            patch.dict(os.environ, self._make_env(csv_path), clear=True),
            patch("approve_submissions.prolific_study_info",
                  return_value={"name": "Test Study", "status": "ACTIVE"}),
            patch("approve_submissions.prolific_submission_statuses", return_value=statuses),
            patch("approve_submissions.prolific_bulk_approve"),
            patch("approve_submissions.prolific_user_messages", return_value=[]),
            patch("approve_submissions.prolific_send_message") as mock_send,
        ):
            approve_submissions.main()

        sent_pids = [c.args[1] for c in mock_send.call_args_list]
        assert "PID_APPR" in sent_pids
        assert "PID_AWAIT" in sent_pids
        assert "PID_RETURN" not in sent_pids

    def test_dedupe_skips_when_signature_already_exists(self, tmp_path):
        """No message is sent when the participant already received the thank-you."""
        csv_path = _write_csv(
            tmp_path,
            ["PROLIFIC_PID", "Disposition"],
            [["PID_DUP", "CLEAN"]],
        )
        # Existing message that contains the SIGNATURE for the same study
        existing = [
            {
                "body": approve_submissions.SIGNATURE + " — thank you for your contribution!",
                "data": {"study_id": "STUDY_1"},
            }
        ]
        with (
            patch.dict(os.environ, self._make_env(csv_path), clear=True),
            patch("approve_submissions.prolific_study_info",
                  return_value={"name": "Test Study", "status": "ACTIVE"}),
            patch("approve_submissions.prolific_submission_statuses",
                  return_value={"PID_DUP": "APPROVED"}),
            patch("approve_submissions.prolific_bulk_approve"),
            patch("approve_submissions.prolific_user_messages", return_value=existing),
            patch("approve_submissions.prolific_send_message") as mock_send,
        ):
            approve_submissions.main()

        mock_send.assert_not_called()

    def test_dedupe_sends_when_signature_absent(self, tmp_path):
        """Message IS sent when existing messages don't contain the thank-you signature."""
        csv_path = _write_csv(
            tmp_path,
            ["PROLIFIC_PID", "Disposition"],
            [["PID_NEW", "CLEAN"]],
        )
        # Existing message for the same study but without the SIGNATURE
        existing = [{"body": "Welcome to the study!", "data": {"study_id": "STUDY_1"}}]
        with (
            patch.dict(os.environ, self._make_env(csv_path), clear=True),
            patch("approve_submissions.prolific_study_info",
                  return_value={"name": "Test Study", "status": "ACTIVE"}),
            patch("approve_submissions.prolific_submission_statuses",
                  return_value={"PID_NEW": "APPROVED"}),
            patch("approve_submissions.prolific_bulk_approve"),
            patch("approve_submissions.prolific_user_messages", return_value=existing),
            patch("approve_submissions.prolific_send_message") as mock_send,
        ):
            approve_submissions.main()

        mock_send.assert_called_once()
        # prolific_send_message(study_id, recipient_id, message_body, api_token)
        # args[1] is recipient_id — the participant PID being messaged
        assert mock_send.call_args.args[1] == "PID_NEW"

    def test_step_summary_includes_message_metrics(self, tmp_path):
        """Step summary records sent / already-sent / failed message counts."""
        summary_file = str(tmp_path / "summary.md")
        csv_path = _write_csv(
            tmp_path,
            ["PROLIFIC_PID", "Disposition"],
            [["PID_A", "CLEAN"]],
        )
        # Simulate the thank-you already sent for PID_A
        existing = [
            {
                "body": approve_submissions.SIGNATURE,
                "data": {"study_id": "STUDY_1"},
            }
        ]
        env = {**self._make_env(csv_path), "GITHUB_STEP_SUMMARY": summary_file}
        with (
            patch.dict(os.environ, env, clear=True),
            patch("approve_submissions.prolific_study_info",
                  return_value={"name": "Test Study", "status": "ACTIVE"}),
            patch("approve_submissions.prolific_submission_statuses",
                  return_value={"PID_A": "APPROVED"}),
            patch("approve_submissions.prolific_bulk_approve"),
            patch("approve_submissions.prolific_user_messages", return_value=existing),
            patch("approve_submissions.prolific_send_message"),
        ):
            approve_submissions.main()

        summary = Path(summary_file).read_text()
        assert "Thank-you messages sent" in summary
        assert "Thank-you already sent" in summary
        assert "Thank-you messages failed" in summary
