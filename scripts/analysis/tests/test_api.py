"""Tests for tabs_api.py — API client functions (unit tests with mocks)."""

import csv
import io
import json
import sys
import zipfile
from pathlib import Path
from unittest.mock import patch, MagicMock

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from tabs_api import (
    _http,
    _json_request,
    _prolific_headers,
    prolific_submission_statuses,
)


# ── HTTP helpers ─────────────────────────────────────────────

class TestHTTPHelpers:
    def test_prolific_headers(self):
        headers = _prolific_headers("my_token")
        assert headers["Authorization"] == "Token my_token"
        assert "User-Agent" in headers  # Cloudflare requires non-default UA


# ── Qualtrics export (mocked) ────────────────────────────────

class TestQualtricsExport:
    def test_export_csv_flow(self, tmp_path):
        """Test the 3-step export: start → poll → download ZIP → extract CSV."""
        from tabs_api import qualtrics_export_csv

        csv_content = "ResponseId,Q1\nR_001,Answer1\n"

        # Create a ZIP containing the CSV
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w") as zf:
            zf.writestr("responses.csv", csv_content)
        zip_bytes = zip_buffer.getvalue()

        # Mock the 3 API calls
        responses = [
            # Step 1: POST start export
            json.dumps({"result": {"progressId": "prog123"}}).encode(),
            # Step 2: GET poll (100% complete)
            json.dumps({"result": {"percentComplete": 100, "fileId": "file456"}}).encode(),
            # Step 3: GET download ZIP
            zip_bytes,
        ]

        call_count = [0]
        original_http = _http

        def mock_http(method, url, headers, body=None, timeout=60):
            idx = call_count[0]
            call_count[0] += 1
            return responses[idx]

        output_path = str(tmp_path / "export.csv")

        with patch("tabs_api._http", side_effect=mock_http):
            with patch("tabs_api.time.sleep"):  # Skip sleep during polling
                result = qualtrics_export_csv(
                    "token123", "https://qualtrics.example.com", "SV_123", output_path
                )

        assert result == output_path
        assert Path(output_path).exists()
        content = Path(output_path).read_text()
        assert "ResponseId" in content
        assert "R_001" in content

    def test_export_csv_timeout(self, tmp_path):
        """Test that export raises on timeout."""
        from tabs_api import qualtrics_export_csv

        # Always return 0% progress
        def mock_http(method, url, headers, body=None, timeout=60):
            if method == "POST":
                return json.dumps({"result": {"progressId": "prog123"}}).encode()
            return json.dumps({"result": {"percentComplete": 0}}).encode()

        with patch("tabs_api._http", side_effect=mock_http):
            with patch("tabs_api.time.sleep"):
                with pytest.raises(RuntimeError, match="timed out"):
                    qualtrics_export_csv(
                        "token", "https://q.example.com", "SV_1",
                        str(tmp_path / "out.csv"),
                    )


# ── Prolific auth checks (mocked) ───────────────────────────

class TestProlificAuthChecks:
    def test_auth_checks_csv(self, tmp_path):
        from tabs_api import prolific_auth_checks_csv

        mock_submissions = [
            {"participant_id": "PID1", "authenticity": {"llm": "HIGH", "bots": "HIGH"}},
            {"participant_id": "PID2", "authenticity": {"llm": "LOW", "bots": "MIXED"}},
            {"participant_id": "PID3", "authenticity": None},
        ]

        with patch("tabs_api.prolific_submissions", return_value=mock_submissions):
            output = str(tmp_path / "auth.csv")
            prolific_auth_checks_csv("study1", "token", output)

        with open(output) as f:
            reader = csv.DictReader(f)
            rows = list(reader)

        assert len(rows) == 3
        assert rows[0]["Auth_LLM"] == "HIGH"
        assert rows[1]["Auth_LLM"] == "LOW"
        assert rows[2]["Auth_LLM"] == ""  # None authenticity


# ── Prolific submission statuses (mocked) ────────────────────

class TestProlificStatuses:
    def test_status_mapping(self):
        mock_submissions = [
            {"participant_id": "PID1", "status": "APPROVED"},
            {"participant_id": "PID2", "status": "REJECTED"},
            {"participant_id": "PID3", "status": "AWAITING REVIEW"},
        ]

        with patch("tabs_api.prolific_submissions", return_value=mock_submissions):
            result = prolific_submission_statuses("study1", "token")

        assert result == {
            "PID1": "APPROVED",
            "PID2": "REJECTED",
            "PID3": "AWAITING REVIEW",
        }


# ── Prolific demographics (mocked) ──────────────────────────

class TestProlificDemographics:
    def test_demographics_csv(self, tmp_path):
        from tabs_api import prolific_demographics_csv

        mock_csv = "participant_id,age,sex\nPID1,30,Male\nPID2,25,Female\n"

        def mock_urlopen(req, timeout=120):
            resp = MagicMock()
            resp.read.return_value = mock_csv.encode("utf-8")
            resp.__enter__ = lambda s: resp
            resp.__exit__ = MagicMock(return_value=False)
            return resp

        with patch("tabs_api.urlopen", side_effect=mock_urlopen):
            output = str(tmp_path / "demo.csv")
            result = prolific_demographics_csv("study1", "token", output)

        assert result == output
        assert Path(output).exists()
        content = Path(output).read_text()
        assert "PID1" in content
        assert "Male" in content
