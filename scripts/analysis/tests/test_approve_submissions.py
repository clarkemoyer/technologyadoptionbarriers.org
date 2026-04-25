"""Tests for approve_submissions.py - CSV parsing and PID extraction."""

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
        """Rejects 'participant_id' - only PROLIFIC_PID is accepted for safety."""
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
