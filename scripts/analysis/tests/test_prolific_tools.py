"""Tests for prolific_tools.py and new tabs_api.py functions."""

import json
import subprocess
import sys
from pathlib import Path
from unittest.mock import patch

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from tabs_api import (
    prolific_recent_messages,
    prolific_user_messages,
    prolific_study_info,
    qualtrics_survey_questions,
)


# ── API functions ────────────────────────────────────────────

class TestProlificMessages:
    def test_recent_messages(self):
        mock_msgs = [
            {"body": "Hello", "data": {"study_id": "S1"}, "sender_id": "P1"},
            {"body": "Hi", "data": {"study_id": "S2"}, "sender_id": "P2"},
            {"body": "Thanks", "data": {"study_id": "S1"}, "sender_id": "P3"},
        ]
        with patch("tabs_api._prolific_paginate", return_value=mock_msgs):
            # Without study filter
            result = prolific_recent_messages("2026-01-01T00:00:00Z", "token")
            assert len(result) == 3

            # With study filter
            result = prolific_recent_messages("2026-01-01T00:00:00Z", "token", "S1")
            assert len(result) == 2

    def test_user_messages(self):
        mock_msgs = [{"body": "msg1"}, {"body": "msg2"}]
        with patch("tabs_api._prolific_paginate", return_value=mock_msgs):
            result = prolific_user_messages("PID1", "token")
            assert len(result) == 2


class TestProlificStudyInfo:
    def test_study_info(self):
        mock_study = {"id": "S1", "name": "Test Study", "status": "ACTIVE"}
        with patch("tabs_api._json_request", return_value=mock_study):
            result = prolific_study_info("S1", "token")
            assert result["name"] == "Test Study"


class TestQualtricsQuestions:
    def test_questions(self):
        mock_resp = {"result": {
            "SurveyName": "TABS V2",
            "Questions": {
                "QID1": {"QuestionText": "Rate barriers", "QuestionType": "MC"},
                "QID2": {"QuestionText": "Rate readiness", "QuestionType": "MC"},
            }
        }}
        with patch("tabs_api._json_request", return_value=mock_resp):
            result = qualtrics_survey_questions("token", "https://q.example.com", "SV_1")
            assert result["SurveyName"] == "TABS V2"
            assert len(result["Questions"]) == 2


# ── CLI commands ─────────────────────────────────────────────

class TestProlificToolsCLI:
    def test_no_command_exits(self):
        result = subprocess.run(
            [sys.executable, str(Path(__file__).parent.parent / "prolific_tools.py")],
            capture_output=True, text=True, timeout=10,
        )
        assert result.returncode != 0
        assert "Usage" in result.stdout or "Usage" in result.stderr

    def test_invalid_command_exits(self):
        result = subprocess.run(
            [sys.executable, str(Path(__file__).parent.parent / "prolific_tools.py"), "invalid"],
            capture_output=True, text=True, timeout=10,
        )
        assert result.returncode != 0

    def test_collect_missing_token_exits(self):
        env = {k: v for k, v in __import__("os").environ.items()
               if k not in ("PROLIFIC_API_TOKEN",)}
        result = subprocess.run(
            [sys.executable, str(Path(__file__).parent.parent / "prolific_tools.py"), "collect"],
            capture_output=True, text=True, timeout=10, env=env,
        )
        assert result.returncode != 0

    def test_participant_msgs_missing_pid_exits(self):
        env = {**__import__("os").environ, "PROLIFIC_API_TOKEN": "test"}
        env.pop("PID", None)
        result = subprocess.run(
            [sys.executable, str(Path(__file__).parent.parent / "prolific_tools.py"), "participant-msgs"],
            capture_output=True, text=True, timeout=10, env=env,
        )
        assert result.returncode != 0
        assert "PID" in result.stdout or "PID" in result.stderr
