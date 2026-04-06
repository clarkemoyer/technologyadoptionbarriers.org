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


class TestApproveSubmissionsLiveOps:
    """Unit tests for the live Prolific side-effects introduced in approve_submissions.py.

    Patches prolific_user_messages / prolific_send_message / status lookups to verify:
    (1) messages are only sent when status is confirmed APPROVED or AWAITING REVIEW, and
    (2) dedupe correctly skips when the thank-you signature already exists.
    """

    @staticmethod
    def _write_csv(tmp_path: Path, rows: list[list[str]]) -> str:
        path = str(tmp_path / "disposition.csv")
        with open(path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["PROLIFIC_PID", "Disposition"])
            writer.writerows(rows)
        return path

    @staticmethod
    def _live_env(csv_path: str) -> dict[str, str]:
        return {
            "PROLIFIC_API_TOKEN": "test_token",
            "STUDY_ID": "STUDY_1",
            "CSV_FILE_PATH": csv_path,
            "DRY_RUN": "false",
        }

    def test_message_sent_only_for_approved_status(self, tmp_path):
        """send_message is called for APPROVED participants but NOT for RETURNED."""
        import approve_submissions

        csv_path = self._write_csv(
            tmp_path,
            [["PID_OK", "CLEAN"], ["PID_BAD", "CLEAN"]],
        )
        statuses = {"PID_OK": "APPROVED", "PID_BAD": "RETURNED"}

        with (
            patch.dict(os.environ, self._live_env(csv_path), clear=True),
            patch("approve_submissions.prolific_study_info", return_value={"name": "S", "status": "ACTIVE"}),
            patch("approve_submissions.prolific_submission_statuses", return_value=statuses),
            patch("approve_submissions.prolific_bulk_approve"),
            patch("approve_submissions.prolific_user_messages", return_value=[]),
            patch("approve_submissions.prolific_send_message") as mock_send,
        ):
            approve_submissions.main()

        # Only PID_OK (APPROVED) should receive a message; PID_BAD (RETURNED) is skipped
        mock_send.assert_called_once()
        assert mock_send.call_args.args[1] == "PID_OK"

    def test_message_not_sent_for_returned_status(self, tmp_path):
        """send_message is NOT called when participant status is RETURNED."""
        import approve_submissions

        csv_path = self._write_csv(tmp_path, [["PID_RET", "CLEAN"]])

        with (
            patch.dict(os.environ, self._live_env(csv_path), clear=True),
            patch("approve_submissions.prolific_study_info", return_value={"name": "S", "status": "ACTIVE"}),
            patch("approve_submissions.prolific_submission_statuses", return_value={"PID_RET": "RETURNED"}),
            patch("approve_submissions.prolific_bulk_approve"),
            patch("approve_submissions.prolific_user_messages", return_value=[]),
            patch("approve_submissions.prolific_send_message") as mock_send,
        ):
            approve_submissions.main()

        mock_send.assert_not_called()

    def test_message_not_sent_for_timed_out_status(self, tmp_path):
        """send_message is NOT called when participant status is TIMED-OUT."""
        import approve_submissions

        csv_path = self._write_csv(tmp_path, [["PID_TO", "CLEAN"]])

        with (
            patch.dict(os.environ, self._live_env(csv_path), clear=True),
            patch("approve_submissions.prolific_study_info", return_value={"name": "S", "status": "ACTIVE"}),
            patch("approve_submissions.prolific_submission_statuses", return_value={"PID_TO": "TIMED-OUT"}),
            patch("approve_submissions.prolific_bulk_approve"),
            patch("approve_submissions.prolific_user_messages", return_value=[]),
            patch("approve_submissions.prolific_send_message") as mock_send,
        ):
            approve_submissions.main()

        mock_send.assert_not_called()

    def test_message_sent_for_awaiting_review_status(self, tmp_path):
        """send_message IS called for AWAITING REVIEW participants (about to be approved)."""
        import approve_submissions

        csv_path = self._write_csv(tmp_path, [["PID_AW", "CLEAN"]])

        with (
            patch.dict(os.environ, self._live_env(csv_path), clear=True),
            patch("approve_submissions.prolific_study_info", return_value={"name": "S", "status": "ACTIVE"}),
            patch("approve_submissions.prolific_submission_statuses", return_value={"PID_AW": "AWAITING REVIEW"}),
            patch("approve_submissions.prolific_bulk_approve"),
            patch("approve_submissions.prolific_user_messages", return_value=[]),
            patch("approve_submissions.prolific_send_message") as mock_send,
        ):
            approve_submissions.main()

        mock_send.assert_called_once()
        assert mock_send.call_args.args[1] == "PID_AW"

    def test_dedupe_skips_when_signature_present_for_same_study(self, tmp_path):
        """send_message is NOT called when the SIGNATURE already exists in messages for the same study."""
        import approve_submissions

        csv_path = self._write_csv(tmp_path, [["PID_DUPE", "CLEAN"]])
        existing_msg = {
            "body": f"Preamble. {approve_submissions.SIGNATURE}. Thanks!",
            "data": {"study_id": "STUDY_1"},
        }

        with (
            patch.dict(os.environ, self._live_env(csv_path), clear=True),
            patch("approve_submissions.prolific_study_info", return_value={"name": "S", "status": "ACTIVE"}),
            patch("approve_submissions.prolific_submission_statuses", return_value={"PID_DUPE": "APPROVED"}),
            patch("approve_submissions.prolific_bulk_approve"),
            patch("approve_submissions.prolific_user_messages", return_value=[existing_msg]),
            patch("approve_submissions.prolific_send_message") as mock_send,
        ):
            approve_submissions.main()

        mock_send.assert_not_called()

    def test_dedupe_sends_when_no_prior_messages(self, tmp_path):
        """send_message IS called when the participant has no prior messages."""
        import approve_submissions

        csv_path = self._write_csv(tmp_path, [["PID_NEW", "CLEAN"]])

        with (
            patch.dict(os.environ, self._live_env(csv_path), clear=True),
            patch("approve_submissions.prolific_study_info", return_value={"name": "S", "status": "ACTIVE"}),
            patch("approve_submissions.prolific_submission_statuses", return_value={"PID_NEW": "APPROVED"}),
            patch("approve_submissions.prolific_bulk_approve"),
            patch("approve_submissions.prolific_user_messages", return_value=[]),
            patch("approve_submissions.prolific_send_message") as mock_send,
        ):
            approve_submissions.main()

        mock_send.assert_called_once()

    def test_dedupe_sends_when_signature_absent_from_messages(self, tmp_path):
        """send_message IS called when messages exist but none contain the SIGNATURE."""
        import approve_submissions

        csv_path = self._write_csv(tmp_path, [["PID_NOSIG", "CLEAN"]])
        other_msg = {
            "body": "Some unrelated message without the key phrase.",
            "data": {"study_id": "STUDY_1"},
        }

        with (
            patch.dict(os.environ, self._live_env(csv_path), clear=True),
            patch("approve_submissions.prolific_study_info", return_value={"name": "S", "status": "ACTIVE"}),
            patch("approve_submissions.prolific_submission_statuses", return_value={"PID_NOSIG": "APPROVED"}),
            patch("approve_submissions.prolific_bulk_approve"),
            patch("approve_submissions.prolific_user_messages", return_value=[other_msg]),
            patch("approve_submissions.prolific_send_message") as mock_send,
        ):
            approve_submissions.main()

        mock_send.assert_called_once()

    def test_dedupe_sends_when_signature_present_for_different_study(self, tmp_path):
        """send_message IS called when the SIGNATURE exists but for a different study_id."""
        import approve_submissions

        csv_path = self._write_csv(tmp_path, [["PID_DIFF", "CLEAN"]])
        # Message with SIGNATURE but belonging to a different study
        other_study_msg = {
            "body": approve_submissions.SIGNATURE,
            "data": {"study_id": "DIFFERENT_STUDY"},
        }

        with (
            patch.dict(os.environ, self._live_env(csv_path), clear=True),
            patch("approve_submissions.prolific_study_info", return_value={"name": "S", "status": "ACTIVE"}),
            patch("approve_submissions.prolific_submission_statuses", return_value={"PID_DIFF": "APPROVED"}),
            patch("approve_submissions.prolific_bulk_approve"),
            patch("approve_submissions.prolific_user_messages", return_value=[other_study_msg]),
            patch("approve_submissions.prolific_send_message") as mock_send,
        ):
            approve_submissions.main()

        mock_send.assert_called_once()
