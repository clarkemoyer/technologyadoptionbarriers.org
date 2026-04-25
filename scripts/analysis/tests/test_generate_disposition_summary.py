"""Tests for generate_disposition_summary.py - JSON output structure and metrics."""

import csv
import json
import subprocess
import sys
from pathlib import Path
from unittest.mock import patch

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

SCRIPT = str(Path(__file__).parent.parent / "generate_disposition_summary.py")


def _write_disposition_csv(tmp_path: Path) -> str:
    """Write a minimal disposition CSV matching the expected format."""
    path = str(tmp_path / "disposition.csv")
    headers = [
        "PROLIFIC_PID", "ResponseId", "Disposition", "IRI_Fail_Count",
        "Speed_Flag", "IRI_Barrier_Pass", "IRI_Readiness_Pass", "IRI_Maturity_Pass",
    ]
    rows = [
        ["PID_A", "R_001", "CLEAN", "0", "0", "1", "1", "1"],
        ["PID_B", "R_002", "CLEAN", "0", "0", "1", "1", "1"],
        ["PID_C", "R_003", "FLAG-SPEED", "0", "1", "1", "1", "1"],
        ["PID_D", "R_004", "AUTO-EXCLUDE", "3", "1", "0", "0", "0"],
        ["PID_E", "R_005", "INCOMPLETE", "0", "0", "0", "0", "0"],
    ]
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(rows)
    return path


MOCK_STUDY = {
    "name": "Test Study",
    "status": "ACTIVE",
    "total_available_places": 500,
    "places_taken": 100,
    "average_reward_per_hour": 38.77,
    "average_time_taken": 650,
    "reward": 800,
    "published_at": "2026-03-23T14:00:00Z",
}

MOCK_SUBMISSIONS = [
    {"participant_id": "PID_A", "status": "APPROVED"},
    {"participant_id": "PID_B", "status": "APPROVED"},
    {"participant_id": "PID_C", "status": "AWAITING REVIEW"},
    {"participant_id": "PID_D", "status": "REJECTED"},
    {"participant_id": "PID_E", "status": "RETURNED"},
]


class TestGenerateDispositionSummary:
    def test_produces_valid_json(self, tmp_path):
        """Script produces valid JSON with expected top-level keys."""
        csv_path = _write_disposition_csv(tmp_path)
        output_path = str(tmp_path / "summary.json")

        with patch("generate_disposition_summary.prolific_study_info", return_value=MOCK_STUDY), \
             patch("generate_disposition_summary.prolific_submissions", return_value=MOCK_SUBMISSIONS), \
             patch("generate_disposition_summary.prolific_recent_messages", return_value=[]):

            # Import and run main directly
            from generate_disposition_summary import main
            import os
            old_env = os.environ.copy()
            os.environ.update({
                "PROLIFIC_API_TOKEN": "test_token",
                "STUDY_ID": "STUDY_1",
                "CSV_FILE_PATH": csv_path,
                "OUTPUT_PATH": output_path,
            })
            try:
                main()
            finally:
                os.environ.clear()
                os.environ.update(old_env)

        assert Path(output_path).exists()
        data = json.loads(Path(output_path).read_text())

        # Check top-level keys
        assert "updatedAt" in data
        assert "study" in data
        assert "completionProgress" in data
        assert "dispositions" in data
        assert "actions" in data
        assert "iriPassRates" in data

    def test_study_metadata(self, tmp_path):
        """Study metadata from Prolific API is correctly mapped."""
        csv_path = _write_disposition_csv(tmp_path)
        output_path = str(tmp_path / "summary.json")

        with patch("generate_disposition_summary.prolific_study_info", return_value=MOCK_STUDY), \
             patch("generate_disposition_summary.prolific_submissions", return_value=MOCK_SUBMISSIONS), \
             patch("generate_disposition_summary.prolific_recent_messages", return_value=[]):

            from generate_disposition_summary import main
            import os
            old_env = os.environ.copy()
            os.environ.update({
                "PROLIFIC_API_TOKEN": "test_token",
                "STUDY_ID": "STUDY_1",
                "CSV_FILE_PATH": csv_path,
                "OUTPUT_PATH": output_path,
            })
            try:
                main()
            finally:
                os.environ.clear()
                os.environ.update(old_env)

        data = json.loads(Path(output_path).read_text())
        study = data["study"]

        assert study["name"] == "Test Study"
        assert study["status"] == "ACTIVE"
        assert study["totalAvailablePlaces"] == 500
        assert study["averageTimeTaken"] == 650
        assert study["reward"] == 800

    def test_disposition_counts(self, tmp_path):
        """Disposition counts match CSV data."""
        csv_path = _write_disposition_csv(tmp_path)
        output_path = str(tmp_path / "summary.json")

        with patch("generate_disposition_summary.prolific_study_info", return_value=MOCK_STUDY), \
             patch("generate_disposition_summary.prolific_submissions", return_value=MOCK_SUBMISSIONS), \
             patch("generate_disposition_summary.prolific_recent_messages", return_value=[]):

            from generate_disposition_summary import main
            import os
            old_env = os.environ.copy()
            os.environ.update({
                "PROLIFIC_API_TOKEN": "test_token",
                "STUDY_ID": "STUDY_1",
                "CSV_FILE_PATH": csv_path,
                "OUTPUT_PATH": output_path,
            })
            try:
                main()
            finally:
                os.environ.clear()
                os.environ.update(old_env)

        data = json.loads(Path(output_path).read_text())
        assert data["dispositions"]["CLEAN"] == 2
        assert data["dispositions"]["FLAG-SPEED"] == 1
        assert data["dispositions"]["AUTO-EXCLUDE"] == 1
        assert data["dispositions"]["INCOMPLETE"] == 1

    def test_iri_pass_rates_finished_only(self, tmp_path):
        """IRI pass rates use finished-only denominator (exclude INCOMPLETE)."""
        csv_path = _write_disposition_csv(tmp_path)
        output_path = str(tmp_path / "summary.json")

        with patch("generate_disposition_summary.prolific_study_info", return_value=MOCK_STUDY), \
             patch("generate_disposition_summary.prolific_submissions", return_value=MOCK_SUBMISSIONS), \
             patch("generate_disposition_summary.prolific_recent_messages", return_value=[]):

            from generate_disposition_summary import main
            import os
            old_env = os.environ.copy()
            os.environ.update({
                "PROLIFIC_API_TOKEN": "test_token",
                "STUDY_ID": "STUDY_1",
                "CSV_FILE_PATH": csv_path,
                "OUTPUT_PATH": output_path,
            })
            try:
                main()
            finally:
                os.environ.clear()
                os.environ.update(old_env)

        data = json.loads(Path(output_path).read_text())
        iri = data["iriPassRates"]
        # 4 finished participants (CLEAN x2, FLAG-SPEED x1, AUTO-EXCLUDE x1)
        # INCOMPLETE excluded from denominator
        assert iri["denominator"] == 4
        # 3 of 4 pass barrier (AUTO-EXCLUDE fails)
        assert iri["barrier"] == 75.0

    def test_completion_progress(self, tmp_path):
        """Completion progress is correctly computed."""
        csv_path = _write_disposition_csv(tmp_path)
        output_path = str(tmp_path / "summary.json")

        with patch("generate_disposition_summary.prolific_study_info", return_value=MOCK_STUDY), \
             patch("generate_disposition_summary.prolific_submissions", return_value=MOCK_SUBMISSIONS), \
             patch("generate_disposition_summary.prolific_recent_messages", return_value=[]):

            from generate_disposition_summary import main
            import os
            old_env = os.environ.copy()
            os.environ.update({
                "PROLIFIC_API_TOKEN": "test_token",
                "STUDY_ID": "STUDY_1",
                "CSV_FILE_PATH": csv_path,
                "OUTPUT_PATH": output_path,
            })
            try:
                main()
            finally:
                os.environ.clear()
                os.environ.update(old_env)

        data = json.loads(Path(output_path).read_text())
        cp = data["completionProgress"]
        assert cp["target"] == 500
        assert cp["approved"] == 2  # PID_A, PID_B
        assert cp["awaitingReview"] == 1  # PID_C
        assert cp["completed"] == 3  # approved + awaiting
        assert cp["percentComplete"] == 0.6  # 3/500 * 100

    def test_actions_from_prolific(self, tmp_path):
        """Action counts come from Prolific API, not CSV."""
        csv_path = _write_disposition_csv(tmp_path)
        output_path = str(tmp_path / "summary.json")

        with patch("generate_disposition_summary.prolific_study_info", return_value=MOCK_STUDY), \
             patch("generate_disposition_summary.prolific_submissions", return_value=MOCK_SUBMISSIONS), \
             patch("generate_disposition_summary.prolific_recent_messages", return_value=[]):

            from generate_disposition_summary import main
            import os
            old_env = os.environ.copy()
            os.environ.update({
                "PROLIFIC_API_TOKEN": "test_token",
                "STUDY_ID": "STUDY_1",
                "CSV_FILE_PATH": csv_path,
                "OUTPUT_PATH": output_path,
            })
            try:
                main()
            finally:
                os.environ.clear()
                os.environ.update(old_env)

        data = json.loads(Path(output_path).read_text())
        assert data["actions"]["approved"] == 2
        assert data["actions"]["rejected"] == 1
        assert data["actions"]["returned"] == 1
        assert data["actions"]["awaitingReview"] == 1
