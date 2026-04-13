"""Tests for enrich_qualtrics_csv.py - CSV enrichment with Prolific data."""

import csv
import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from enrich_qualtrics_csv import load_auth_checks, load_statuses, load_demographics, enrich


# ── load_auth_checks ─────────────────────────────────────────

class TestLoadAuthChecks:
    def test_basic(self, tmp_path):
        from _helpers import make_csv
        path = make_csv(tmp_path,
            ["PROLIFIC_PID", "Auth_LLM", "Auth_Bots"],
            [["PID1", "HIGH", "HIGH"], ["PID2", "LOW", "MIXED"]],
        )
        result = load_auth_checks(path)
        assert result["PID1"] == {"Auth_LLM": "HIGH", "Auth_Bots": "HIGH"}
        assert result["PID2"] == {"Auth_LLM": "LOW", "Auth_Bots": "MIXED"}

    def test_empty_pid_skipped(self, tmp_path):
        from _helpers import make_csv
        path = make_csv(tmp_path,
            ["PROLIFIC_PID", "Auth_LLM", "Auth_Bots"],
            [["", "HIGH", "HIGH"]],
        )
        assert load_auth_checks(path) == {}

    def test_strips_whitespace(self, tmp_path):
        from _helpers import make_csv
        path = make_csv(tmp_path,
            ["PROLIFIC_PID", "Auth_LLM", "Auth_Bots"],
            [["  PID1  ", " HIGH ", " LOW "]],
        )
        result = load_auth_checks(path)
        assert "PID1" in result
        assert result["PID1"]["Auth_LLM"] == "HIGH"


# ── load_statuses ────────────────────────────────────────────

class TestLoadStatuses:
    def test_basic(self, tmp_path):
        from _helpers import make_json
        path = make_json(tmp_path, {"PID1": "APPROVED", "PID2": "REJECTED"})
        result = load_statuses(path)
        assert result == {"PID1": "APPROVED", "PID2": "REJECTED"}


# ── load_demographics ────────────────────────────────────────

class TestLoadDemographics:
    def test_basic(self, tmp_path):
        from _helpers import make_csv
        path = make_csv(tmp_path,
            ["participant_id", "age", "sex", "country"],
            [["PID1", "30", "Male", "UK"], ["PID2", "25", "Female", "US"]],
            filename="demographics.csv",
        )
        cols, data = load_demographics(path)
        assert set(cols) == {"age", "sex", "country"}
        assert data["PID1"]["age"] == "30"
        assert data["PID2"]["country"] == "US"

    def test_excludes_participant_id_column(self, tmp_path):
        from _helpers import make_csv
        path = make_csv(tmp_path,
            ["participant_id", "education"],
            [["PID1", "PhD"]],
            filename="demo.csv",
        )
        cols, _ = load_demographics(path)
        assert "participant_id" not in cols
        assert "education" in cols


# ── enrich (integration) ────────────────────────────────────

class TestEnrich:
    def _make_qualtrics(self, tmp_path) -> str:
        """Create a minimal 3-header-row Qualtrics CSV."""
        from _helpers import make_qualtrics_csv
        headers = ["ResponseId", "PROLIFIC_PID", "Duration (in seconds)", "Q1_Response"]
        rows = [
            ["R_001", "PID1", "600", "Answer1"],
            ["R_002", "PID2", "500", "Answer2"],
            ["R_003", "PID3", "400", "Answer3"],
        ]
        return make_qualtrics_csv(tmp_path, headers, rows, "qualtrics.csv")

    def test_auth_only(self, tmp_path):
        from _helpers import make_csv
        qualtrics_path = self._make_qualtrics(tmp_path)
        auth_path = make_csv(tmp_path,
            ["PROLIFIC_PID", "Auth_LLM", "Auth_Bots"],
            [["PID1", "HIGH", "HIGH"], ["PID2", "LOW", "MIXED"]],
            filename="auth.csv",
        )
        output_path = str(tmp_path / "enriched.csv")

        enrich(qualtrics_path, auth_path, None, None, output_path)

        with open(output_path) as f:
            lines = f.readlines()
        # Header row should have Auth_LLM, Auth_Bots appended
        assert "Auth_LLM" in lines[0]
        assert "Auth_Bots" in lines[0]
        # 3 header rows + 3 data rows
        assert len(lines) == 6

        # Parse and check values
        reader = csv.reader(lines)
        header = next(reader)
        auth_llm_idx = header.index("Auth_LLM")
        auth_bots_idx = header.index("Auth_Bots")
        next(reader)  # sub-header
        next(reader)  # import IDs
        data_rows = list(reader)
        assert data_rows[0][auth_llm_idx] == "HIGH"  # PID1
        assert data_rows[1][auth_llm_idx] == "LOW"   # PID2
        assert data_rows[2][auth_llm_idx] == ""       # PID3 not in auth data

    def test_statuses(self, tmp_path):
        from _helpers import make_json
        qualtrics_path = self._make_qualtrics(tmp_path)
        statuses_path = make_json(tmp_path, {"PID1": "APPROVED", "PID3": "REJECTED"})
        output_path = str(tmp_path / "enriched.csv")

        enrich(qualtrics_path, None, statuses_path, None, output_path)

        with open(output_path) as f:
            reader = csv.reader(f)
            header = next(reader)
        assert "Prolific_Status" in header

    def test_demographics(self, tmp_path):
        from _helpers import make_csv
        qualtrics_path = self._make_qualtrics(tmp_path)
        demo_path = make_csv(tmp_path,
            ["participant_id", "age", "country"],
            [["PID1", "30", "UK"], ["PID2", "25", "US"]],
            filename="demographics.csv",
        )
        output_path = str(tmp_path / "enriched.csv")

        enrich(qualtrics_path, None, None, demo_path, output_path)

        with open(output_path) as f:
            reader = csv.reader(f)
            header = next(reader)
        # Demographics should be prefixed with Prolific_
        assert "Prolific_age" in header
        assert "Prolific_country" in header

    def test_all_sources_combined(self, tmp_path):
        from _helpers import make_csv, make_json
        qualtrics_path = self._make_qualtrics(tmp_path)
        auth_path = make_csv(tmp_path,
            ["PROLIFIC_PID", "Auth_LLM", "Auth_Bots"],
            [["PID1", "HIGH", "HIGH"]],
            filename="auth.csv",
        )
        statuses_path = make_json(tmp_path, {"PID1": "APPROVED"})
        demo_path = make_csv(tmp_path,
            ["participant_id", "age"],
            [["PID1", "30"]],
            filename="demographics.csv",
        )
        output_path = str(tmp_path / "enriched.csv")

        enrich(qualtrics_path, auth_path, statuses_path, demo_path, output_path)

        with open(output_path) as f:
            reader = csv.reader(f)
            header = next(reader)
        assert "Auth_LLM" in header
        assert "Prolific_Status" in header
        assert "Prolific_age" in header

    def test_no_enrichment(self, tmp_path):
        """If no enrichment sources provided, output equals input."""
        qualtrics_path = self._make_qualtrics(tmp_path)
        output_path = str(tmp_path / "enriched.csv")

        enrich(qualtrics_path, None, None, None, output_path)

        with open(qualtrics_path) as f:
            original_lines = len(f.readlines())
        with open(output_path) as f:
            output_lines = len(f.readlines())
        assert output_lines == original_lines
