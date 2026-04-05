"""Tests for approve_submissions.py — CSV parsing, PID extraction, and thank-you chaining."""

import csv
import json
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


class TestThankYouChaining:
    """Tests for the automatic thank-you message step chained after approval."""

    def test_dry_run_notes_thank_you_by_default(self, tmp_path):
        """In dry-run, output mentions that thank-you would be sent."""
        csv_path = _write_csv(
            tmp_path,
            ["PROLIFIC_PID", "Disposition"],
            [["PID_A", "CLEAN"], ["PID_B", "CLEAN"]],
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
        assert "would send thank-you" in result.stdout
        assert "2 CLEAN participants" in result.stdout

    def test_dry_run_no_thank_you_when_disabled(self, tmp_path):
        """In dry-run with SEND_THANK_YOU=false, no thank-you note appears."""
        csv_path = _write_csv(
            tmp_path,
            ["PROLIFIC_PID", "Disposition"],
            [["PID_A", "CLEAN"]],
        )
        env = {
            "PROLIFIC_API_TOKEN": "test_token",
            "STUDY_ID": "STUDY_1",
            "CSV_FILE_PATH": csv_path,
            "DRY_RUN": "true",
            "SEND_THANK_YOU": "false",
        }
        result = subprocess.run(
            [sys.executable, SCRIPT],
            env=env,
            capture_output=True,
            text=True,
        )
        assert result.returncode == 0
        assert "thank-you" not in result.stdout.lower()

    def test_step_summary_includes_thank_you_section(self, tmp_path):
        """_write_step_summary includes thank-you section when stats are provided."""
        import os
        from approve_submissions import _write_step_summary

        summary_file = str(tmp_path / "summary.md")
        os.environ["GITHUB_STEP_SUMMARY"] = summary_file
        try:
            _write_step_summary(
                study_id="STUDY_1",
                dry_run=False,
                total_data_rows=2,
                clean_count=2,
                skipped=0,
                already_approved=0,
                newly_approved=2,
                thank_you_stats={"sent": 2, "skipped": 0, "skipped_not_approved": 0, "not_found": 0, "failed": 0},
            )
        finally:
            del os.environ["GITHUB_STEP_SUMMARY"]

        summary = Path(summary_file).read_text()
        assert "Thank-you messages" in summary
        assert "| Sent | 2 |" in summary
        assert "| Skipped (already sent) | 0 |" in summary

    def test_step_summary_no_thank_you_section_when_omitted(self, tmp_path):
        """Step summary omits thank-you section when thank_you_stats is None."""
        import os
        from approve_submissions import _write_step_summary

        summary_file = str(tmp_path / "summary.md")
        os.environ["GITHUB_STEP_SUMMARY"] = summary_file
        try:
            _write_step_summary(
                study_id="STUDY_1",
                dry_run=True,
                total_data_rows=3,
                clean_count=2,
                skipped=0,
                already_approved=0,
                newly_approved=0,
                thank_you_stats=None,
            )
        finally:
            del os.environ["GITHUB_STEP_SUMMARY"]

        summary = Path(summary_file).read_text()
        assert "Newly approved | 0" in summary
        assert "Thank-you messages" not in summary

    def test_send_thank_you_to_pids_is_importable(self):
        """send_thank_you_to_pids is importable as a reusable function."""
        from send_thank_you import send_thank_you_to_pids, THANK_YOU_MESSAGE, SIGNATURE
        assert callable(send_thank_you_to_pids)
        assert SIGNATURE in THANK_YOU_MESSAGE

    def test_send_thank_you_to_pids_dedup(self):
        """send_thank_you_to_pids skips participants who already received thank-you."""
        from unittest.mock import patch as _patch
        from send_thank_you import send_thank_you_to_pids, SIGNATURE
        import send_thank_you as sty_module

        mock_subs = [
            {"participant_id": "PID_A", "status": "APPROVED"},
            {"participant_id": "PID_B", "status": "APPROVED"},
        ]
        # PID_A has already received a thank-you; PID_B has not
        def mock_user_messages(pid, token):
            if pid == "PID_A":
                return [{"body": f"Thanks — {SIGNATURE}", "data": {"study_id": "S1"}}]
            return []

        sent_to = []

        def mock_send(study_id, pid, msg, token):
            sent_to.append(pid)

        with _patch.object(sty_module, "prolific_submissions", return_value=mock_subs), \
             _patch.object(sty_module, "prolific_user_messages", side_effect=mock_user_messages), \
             _patch.object(sty_module, "prolific_send_message", side_effect=mock_send):
            stats = send_thank_you_to_pids(["PID_A", "PID_B"], "S1", "token", dry_run=False)

        assert stats["sent"] == 1
        assert stats["skipped"] == 1  # already thanked
        assert "PID_B" in sent_to
        assert "PID_A" not in sent_to

    def test_send_thank_you_to_pids_skips_non_approved(self):
        """send_thank_you_to_pids skips participants not yet in APPROVED status."""
        from unittest.mock import patch as _patch
        from send_thank_you import send_thank_you_to_pids
        import send_thank_you as sty_module

        mock_subs = [
            {"participant_id": "PID_A", "status": "AWAITING REVIEW"},
        ]

        with _patch.object(sty_module, "prolific_submissions", return_value=mock_subs), \
             _patch.object(sty_module, "prolific_user_messages", return_value=[]), \
             _patch.object(sty_module, "prolific_send_message") as mock_send:
            stats = send_thank_you_to_pids(["PID_A"], "S1", "token", dry_run=False)
            mock_send.assert_not_called()

        assert stats["skipped_not_approved"] == 1
        assert stats["sent"] == 0

    def test_send_thank_you_to_pids_dry_run(self):
        """In dry-run mode, send_thank_you_to_pids does not call prolific_send_message."""
        from unittest.mock import patch as _patch
        from send_thank_you import send_thank_you_to_pids
        import send_thank_you as sty_module

        mock_subs = [
            {"participant_id": "PID_A", "status": "APPROVED"},
        ]

        with _patch.object(sty_module, "prolific_submissions", return_value=mock_subs), \
             _patch.object(sty_module, "prolific_user_messages", return_value=[]), \
             _patch.object(sty_module, "prolific_send_message") as mock_send:
            stats = send_thank_you_to_pids(["PID_A"], "S1", "token", dry_run=True)
            mock_send.assert_not_called()

        # dry_run counts as "sent" in output (would-message count)
        assert stats["sent"] == 1
