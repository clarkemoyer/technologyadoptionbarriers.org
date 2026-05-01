"""Tests for tabs_api.py - API client functions (unit tests with mocks)."""

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
    prolific_bulk_approve,
    prolific_bulk_reject,
    prolific_send_message,
    prolific_unreject,
    prolific_get_submission_ids,
    QUALTRICS_PROLIFIC_FILTER_MAP,
    PROLIFIC_AUGMENTATION_FILTERS,
    PROLIFIC_ENRICHMENT_FILTER_IDS,
    PROLIFIC_STUDY_SCREENERS,
)


# ── Constants ────────────────────────────────────────────────

class TestProlificConstants:
    def test_study_screeners_structure(self):
        """PROLIFIC_STUDY_SCREENERS has correct structure for all 5 screeners."""
        assert isinstance(PROLIFIC_STUDY_SCREENERS, list)
        assert len(PROLIFIC_STUDY_SCREENERS) == 5
        for s in PROLIFIC_STUDY_SCREENERS:
            assert "filter_id" in s
            assert "label" in s
            assert "selected_values" in s
            assert "base_field" in s
            assert isinstance(s["selected_values"], list)
            assert len(s["selected_values"]) > 0

    def test_study_screener_filter_ids(self):
        """All expected screener filter_ids are present."""
        ids = [s["filter_id"] for s in PROLIFIC_STUDY_SCREENERS]
        assert "current_country_of_residence" in ids
        assert "employment_status" in ids
        assert "employment_sector" in ids
        assert "company_size" in ids
        assert "occupation" in ids

    def test_enrichment_filter_ids_include_screeners(self):
        """PROLIFIC_ENRICHMENT_FILTER_IDS includes all non-base screener filter_ids."""
        non_base = [s["filter_id"] for s in PROLIFIC_STUDY_SCREENERS if not s["base_field"]]
        for fid in non_base:
            assert fid in PROLIFIC_ENRICHMENT_FILTER_IDS, f"{fid} missing from enrichment list"

    def test_enrichment_filter_ids_within_api_limit(self):
        """Total enrichment filter_ids must not exceed Prolific's 15-filter limit."""
        assert len(PROLIFIC_ENRICHMENT_FILTER_IDS) <= 15

    def test_qualtrics_prolific_filter_map_keys(self):
        """Cross-validation map has expected Qualtrics question keys."""
        assert "Q1_Role" in QUALTRICS_PROLIFIC_FILTER_MAP
        assert "Q3_Industry" in QUALTRICS_PROLIFIC_FILTER_MAP
        assert "Q4_OrgSize" in QUALTRICS_PROLIFIC_FILTER_MAP
        assert "Q5_ProfitModel" in QUALTRICS_PROLIFIC_FILTER_MAP


# ── HTTP helpers ─────────────────────────────────────────────

class TestHTTPHelpers:
    def test_prolific_headers(self):
        headers = _prolific_headers("my_token")
        assert headers["Authorization"] == "Token my_token"
        assert "User-Agent" in headers  # Cloudflare requires non-default UA

    def test_json_request_empty_body_allowed(self):
        """Write endpoints with allow_empty=True return {} on empty response."""
        with patch("tabs_api._http", return_value=b""):
            result = _json_request("POST", "https://example.com", {},
                                   allow_empty=True)
        assert result == {}

    def test_json_request_empty_body_raises_by_default(self):
        """GET endpoints raise on empty response (default allow_empty=False)."""
        with patch("tabs_api._http", return_value=b""):
            with pytest.raises(RuntimeError, match="Empty response body"):
                _json_request("GET", "https://example.com", {})

    def test_json_request_whitespace_body_allowed(self):
        """Whitespace-only response treated as empty when allowed."""
        with patch("tabs_api._http", return_value=b"  \n  "):
            result = _json_request("POST", "https://example.com", {},
                                   allow_empty=True)
        assert result == {}


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

    def test_summaries_include_timestamps(self):
        """prolific_submission_summaries returns the per-PID dict shape that
        carries completed_at and started_at -- needed for the 21-day
        auto-approve runway computation downstream."""
        from tabs_api import prolific_submission_summaries

        mock_submissions = [
            {
                "participant_id": "PID1",
                "status": "APPROVED",
                "completed_at": "2026-04-25T12:34:56Z",
                "started_at": "2026-04-25T12:30:00Z",
            },
            {
                "participant_id": "PID2",
                "status": "AWAITING REVIEW",
                # missing completed_at / started_at — should yield empty strings
            },
            # rows with no participant_id are skipped
            {"status": "REJECTED"},
        ]

        with patch("tabs_api.prolific_submissions", return_value=mock_submissions):
            result = prolific_submission_summaries("study1", "token")

        assert result == {
            "PID1": {
                "status": "APPROVED",
                "completed_at": "2026-04-25T12:34:56Z",
                "started_at": "2026-04-25T12:30:00Z",
            },
            "PID2": {
                "status": "AWAITING REVIEW",
                "completed_at": "",
                "started_at": "",
            },
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

    def test_demographics_csv_with_filters(self, tmp_path):
        """Passing filter_ids includes them in the request payload."""
        from tabs_api import prolific_demographics_csv

        captured_bodies: list = []

        def mock_urlopen(req, timeout=120):
            captured_bodies.append(req.data)
            resp = MagicMock()
            resp.read.return_value = b"pid,age,industry\nP1,30,Tech\n"
            resp.__enter__ = lambda s: resp
            resp.__exit__ = MagicMock(return_value=False)
            return resp

        with patch("tabs_api.urlopen", side_effect=mock_urlopen):
            output = str(tmp_path / "demo_filtered.csv")
            prolific_demographics_csv(
                "study1", "token", output,
                filter_ids=["industry", "company_size"],
            )

        payload = json.loads(captured_bodies[0])
        assert len(payload["filters"]) == 2
        assert {"filter_id": "industry"} in payload["filters"]
        assert {"filter_id": "company_size"} in payload["filters"]

    def test_filter_map_constants(self):
        """QUALTRICS_PROLIFIC_FILTER_MAP and PROLIFIC_ENRICHMENT_FILTER_IDS are valid."""
        from tabs_api import (
            QUALTRICS_PROLIFIC_FILTER_MAP,
            PROLIFIC_AUGMENTATION_FILTERS,
            PROLIFIC_ENRICHMENT_FILTER_IDS,
        )

        # Cross-validation map covers key Qualtrics fields
        assert "Q1_Role" in QUALTRICS_PROLIFIC_FILTER_MAP
        assert "Q3_Industry" in QUALTRICS_PROLIFIC_FILTER_MAP
        assert "Q4_OrgSize" in QUALTRICS_PROLIFIC_FILTER_MAP
        assert "Q5_ProfitModel" in QUALTRICS_PROLIFIC_FILTER_MAP
        for entry in QUALTRICS_PROLIFIC_FILTER_MAP.values():
            assert "filter_id" in entry
            assert "description" in entry

        # Augmentation filters provide additional dimensions
        assert "education_level" in PROLIFIC_AUGMENTATION_FILTERS
        assert "household_income" in PROLIFIC_AUGMENTATION_FILTERS
        assert "fluent_languages" in PROLIFIC_AUGMENTATION_FILTERS

        # Combined list includes both cross-validation and augmentation
        assert len(PROLIFIC_ENRICHMENT_FILTER_IDS) == (
            len(QUALTRICS_PROLIFIC_FILTER_MAP) + len(PROLIFIC_AUGMENTATION_FILTERS)
        )
        assert "occupation" in PROLIFIC_ENRICHMENT_FILTER_IDS
        assert "education_level" in PROLIFIC_ENRICHMENT_FILTER_IDS


# ── Prolific write operations (mocked) ─────────────────────

class TestProlificWriteOps:
    def test_bulk_approve_url_and_payload(self):
        """Verify bulk approve sends correct URL, method, and payload."""
        calls = []

        def mock_http(method, url, headers, body=None, timeout=60):
            calls.append({"method": method, "url": url, "body": body})
            return b"{}"  # Prolific may return empty JSON

        with patch("tabs_api._http", side_effect=mock_http):
            prolific_bulk_approve("STUDY1", ["PID_A", "PID_B"], "tok")

        assert len(calls) == 1
        assert calls[0]["method"] == "POST"
        assert "bulk-approve" in calls[0]["url"]
        payload = json.loads(calls[0]["body"])
        assert payload["study_id"] == "STUDY1"
        assert payload["participant_ids"] == ["PID_A", "PID_B"]

    def test_bulk_reject_url_and_payload(self):
        """Verify bulk reject sends correct URL, method, and payload."""
        calls = []

        def mock_http(method, url, headers, body=None, timeout=60):
            calls.append({"method": method, "url": url, "body": body})
            return b"{}"

        with patch("tabs_api._http", side_effect=mock_http):
            prolific_bulk_reject("STUDY2", ["PID_X"], "tok")

        assert len(calls) == 1
        assert calls[0]["method"] == "POST"
        assert "bulk-reject" in calls[0]["url"]
        payload = json.loads(calls[0]["body"])
        assert payload["study_id"] == "STUDY2"
        assert payload["participant_ids"] == ["PID_X"]

    def test_send_message_url_and_payload(self):
        """Verify message sends correct URL, method, and payload."""
        calls = []

        def mock_http(method, url, headers, body=None, timeout=60):
            calls.append({"method": method, "url": url, "body": body})
            return b"{}"

        with patch("tabs_api._http", side_effect=mock_http):
            prolific_send_message("S1", "PID_1", "Hello!", "tok")

        assert len(calls) == 1
        assert calls[0]["method"] == "POST"
        assert "/messages/" in calls[0]["url"]
        payload = json.loads(calls[0]["body"])
        assert payload["recipient_id"] == "PID_1"
        assert payload["body"] == "Hello!"
        assert payload["study_id"] == "S1"

    def test_unreject_url_and_payload(self):
        """Verify unreject sends correct transition action."""
        calls = []

        def mock_http(method, url, headers, body=None, timeout=60):
            calls.append({"method": method, "url": url, "body": body})
            return b"{}"

        with patch("tabs_api._http", side_effect=mock_http):
            prolific_unreject("SUB_123", "tok")

        assert len(calls) == 1
        assert calls[0]["method"] == "POST"
        assert "SUB_123/transition" in calls[0]["url"]
        payload = json.loads(calls[0]["body"])
        assert payload["action"] == "UNREJECT"

    def test_bulk_approve_empty_response(self):
        """Write endpoints returning empty body should succeed."""
        with patch("tabs_api._http", return_value=b""):
            result = prolific_bulk_approve("S1", ["P1"], "tok")
        assert result == {}

    def test_get_submission_ids(self):
        """Verify submission ID lookup filters by participant."""
        mock_subs = [
            {"id": "sub1", "participant_id": "PID_A"},
            {"id": "sub2", "participant_id": "PID_B"},
            {"id": "sub3", "participant_id": "PID_A"},
        ]
        with patch("tabs_api.prolific_submissions", return_value=mock_subs):
            result = prolific_get_submission_ids("STUDY", "PID_A", "tok")
        assert result == ["sub1", "sub3"]

    def test_get_submission_ids_not_found(self):
        """No submissions for participant returns empty list."""
        mock_subs = [
            {"id": "sub1", "participant_id": "PID_B"},
        ]
        with patch("tabs_api.prolific_submissions", return_value=mock_subs):
            result = prolific_get_submission_ids("STUDY", "PID_X", "tok")
        assert result == []
