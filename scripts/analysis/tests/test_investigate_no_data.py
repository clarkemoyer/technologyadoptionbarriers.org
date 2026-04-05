"""Tests for investigate_no_data.py — NO_DATA PID investigation functions."""

import sys
from datetime import datetime, timezone
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from investigate_no_data import (
    _parse_prolific_time,
    _parse_qualtrics_time,
    find_partial_pid_matches,
    find_time_window_matches,
    load_qualtrics_csv,
    recommend_action,
)


# ── _parse_prolific_time ────────────────────────────────────────

class TestParseProlificTime:
    def test_with_milliseconds(self):
        dt = _parse_prolific_time("2024-03-15T10:30:45.123Z")
        assert dt is not None
        assert dt.year == 2024
        assert dt.month == 3
        assert dt.day == 15

    def test_without_milliseconds(self):
        dt = _parse_prolific_time("2024-03-15T10:30:45Z")
        assert dt is not None
        assert dt.hour == 10

    def test_with_offset(self):
        dt = _parse_prolific_time("2024-03-15T10:30:45+00:00")
        assert dt is not None
        assert dt.tzinfo is not None

    def test_empty_string_returns_none(self):
        assert _parse_prolific_time("") is None

    def test_invalid_format_returns_none(self):
        assert _parse_prolific_time("not-a-date") is None


# ── _parse_qualtrics_time ───────────────────────────────────────

class TestParseQualtricsTime:
    def test_standard_format(self):
        dt = _parse_qualtrics_time("2024-03-15 10:30:45")
        assert dt is not None
        assert dt.year == 2024
        assert dt.minute == 30
        assert dt.tzinfo == timezone.utc

    def test_iso_format(self):
        dt = _parse_qualtrics_time("2024-03-15T10:30:45")
        assert dt is not None

    def test_empty_string_returns_none(self):
        assert _parse_qualtrics_time("") is None

    def test_invalid_format_returns_none(self):
        assert _parse_qualtrics_time("15/03/2024") is None


# ── find_partial_pid_matches ────────────────────────────────────

_SAMPLE_ROWS = [
    {"PROLIFIC_PID": "6978def73c6b4d70XXXX", "EndDate": "2024-01-01 10:00:00"},
    {"PROLIFIC_PID": "completely_different1", "EndDate": "2024-01-01 11:00:00"},
    {"PROLIFIC_PID": "694d28664d27fd5b_typo", "EndDate": "2024-01-01 12:00:00"},
    {"PROLIFIC_PID": "", "EndDate": "2024-01-01 13:00:00"},
]


class TestFindPartialPidMatches:
    def test_detects_partial_match(self):
        pid = "6978def73c6b4d708159c4fc"
        matches = find_partial_pid_matches(pid, _SAMPLE_ROWS)
        assert len(matches) == 1
        assert matches[0]["PROLIFIC_PID"] == "6978def73c6b4d70XXXX"

    def test_no_match_for_unrelated_pid(self):
        pid = "aaaaaaaaaaaaaaaaaaaaaaaa"
        matches = find_partial_pid_matches(pid, _SAMPLE_ROWS)
        assert matches == []

    def test_skips_empty_qualtrics_pid(self):
        pid = "6978def73c6b4d708159c4fc"
        matches = find_partial_pid_matches(pid, [{"PROLIFIC_PID": "", "EndDate": ""}])
        assert matches == []

    def test_respects_min_length(self):
        # Short PID that only matches 4 chars — should not match at min_len=8
        rows = [{"PROLIFIC_PID": "1234abcd", "EndDate": "2024-01-01 10:00:00"}]
        matches = find_partial_pid_matches("1234", rows, min_len=8)
        assert matches == []

    def test_case_insensitive(self):
        rows = [{"PROLIFIC_PID": "ABCDEFGHIJKLMNOP", "EndDate": "2024-01-01 10:00:00"}]
        matches = find_partial_pid_matches("abcdefghijklmnop", rows)
        assert len(matches) == 1

    def test_empty_row_list(self):
        assert find_partial_pid_matches("any_pid", []) == []

    def test_second_partial_match(self):
        pid = "694d28664d27fd5bf031f07a"
        matches = find_partial_pid_matches(pid, _SAMPLE_ROWS)
        assert len(matches) == 1
        assert "694d28664d27fd5b" in matches[0]["PROLIFIC_PID"]


# ── find_time_window_matches ────────────────────────────────────

class TestFindTimeWindowMatches:
    def _rows(self):
        return [
            {"PROLIFIC_PID": "pid_a", "EndDate": "2024-01-01 10:15:00"},  # 15 min away
            {"PROLIFIC_PID": "pid_b", "EndDate": "2024-01-01 12:00:00"},  # 120 min away
            {"PROLIFIC_PID": "pid_c", "EndDate": "2024-01-01 10:30:01"},  # 30 min 1 sec away
            {"PROLIFIC_PID": "pid_d", "EndDate": ""},  # missing EndDate
            {"PROLIFIC_PID": "pid_e", "EndDate": "2024-01-01 10:30:00"},  # exactly 30 min
        ]

    def test_matches_within_window(self):
        completed = datetime(2024, 1, 1, 10, 0, 0, tzinfo=timezone.utc)
        matches = find_time_window_matches(completed, self._rows(), window_minutes=30)
        pids = {m["PROLIFIC_PID"] for m in matches}
        assert "pid_a" in pids  # 15 min → match
        assert "pid_e" in pids  # exactly 30 min → match

    def test_excludes_outside_window(self):
        completed = datetime(2024, 1, 1, 10, 0, 0, tzinfo=timezone.utc)
        matches = find_time_window_matches(completed, self._rows(), window_minutes=30)
        pids = {m["PROLIFIC_PID"] for m in matches}
        assert "pid_b" not in pids   # 120 min → no match
        assert "pid_c" not in pids   # 30 min 1 sec → no match

    def test_skips_missing_end_date(self):
        completed = datetime(2024, 1, 1, 10, 0, 0, tzinfo=timezone.utc)
        matches = find_time_window_matches(completed, self._rows(), window_minutes=30)
        pids = {m["PROLIFIC_PID"] for m in matches}
        assert "pid_d" not in pids

    def test_returns_empty_when_completed_is_none(self):
        assert find_time_window_matches(None, self._rows()) == []

    def test_time_diff_minutes_attached(self):
        completed = datetime(2024, 1, 1, 10, 0, 0, tzinfo=timezone.utc)
        matches = find_time_window_matches(completed, self._rows(), window_minutes=30)
        for m in matches:
            assert "_time_diff_minutes" in m

    def test_empty_row_list(self):
        completed = datetime(2024, 1, 1, 10, 0, 0, tzinfo=timezone.utc)
        assert find_time_window_matches(completed, []) == []


# ── recommend_action ────────────────────────────────────────────

class TestRecommendAction:
    def test_exact_match_takes_priority(self):
        assert recommend_action(True, [{}], [{}], 10.0) == "ALREADY_MATCHED"

    def test_partial_match_takes_priority_over_time(self):
        assert recommend_action(False, [{}], [{}], 10.0) == "INVESTIGATE_PARTIAL_MATCH"

    def test_time_match_when_no_partial(self):
        assert recommend_action(False, [], [{}], 10.0) == "INVESTIGATE_TIME_MATCH"

    def test_likely_return_when_no_matches(self):
        assert recommend_action(False, [], [], 10.0) == "LIKELY_RETURN"

    def test_likely_return_for_short_completion(self):
        assert recommend_action(False, [], [], 2.0) == "LIKELY_RETURN"


# ── load_qualtrics_csv ──────────────────────────────────────────

class TestLoadQualtricsCSV:
    def test_loads_test_csv(self, tmp_path):
        # Use the existing test CSV from the analysis dir
        csv_path = Path(__file__).parent.parent / "test_data_qualtrics.csv"
        if not csv_path.exists():
            pytest.skip("test_data_qualtrics.csv not found")
        headers, rows = load_qualtrics_csv(str(csv_path))
        assert len(headers) > 0
        assert len(rows) > 0

    def test_skips_blank_rows(self, tmp_path):
        csv_file = tmp_path / "test.csv"
        csv_file.write_text(
            "PROLIFIC_PID,EndDate,Finished\n"
            "Q: What is your PID?,End Date,Was it finished?\n"
            "{\"ImportId\":\"PROLIFIC_PID\"},{\"ImportId\":\"EndDate\"},{\"ImportId\":\"Finished\"}\n"
            "abc123,2024-01-01 10:00:00,True\n"
            "\n"
            "def456,2024-01-01 11:00:00,True\n",
            encoding="utf-8",
        )
        headers, rows = load_qualtrics_csv(str(csv_file))
        assert headers == ["PROLIFIC_PID", "EndDate", "Finished"]
        assert len(rows) == 2
        assert rows[0]["PROLIFIC_PID"] == "abc123"
        assert rows[1]["PROLIFIC_PID"] == "def456"

    def test_handles_short_csv(self, tmp_path):
        """CSVs with fewer than 4 rows should still load without error."""
        csv_file = tmp_path / "short.csv"
        csv_file.write_text(
            "PROLIFIC_PID,EndDate\n"
            "abc123,2024-01-01 10:00:00\n",
            encoding="utf-8",
        )
        headers, rows = load_qualtrics_csv(str(csv_file))
        assert "PROLIFIC_PID" in headers
