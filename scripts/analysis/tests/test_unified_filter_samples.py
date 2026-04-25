"""Tests for filter_samples() in tabs_v2_unified_data_analysis.py.

Covers the crp200 flag that was added to fix date-only StartDate values
being lexicographically excluded by the V2_START string comparison after
NIST de-identification strips the time component from timestamps.
"""

import sys
from pathlib import Path

import pytest

TESTS_DIR = Path(__file__).parent
ANALYSIS_DIR = TESTS_DIR.parent
sys.path.insert(0, str(ANALYSIS_DIR))
sys.path.insert(0, str(TESTS_DIR))

from tabs_v2_unified_data_analysis import filter_samples, PROLIFIC_TEST_ID  # noqa: E402
from _helpers import MINIMAL_HEADERS, make_clean_row  # noqa: E402


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _idx():
    """Return a column-name→index map for the full minimal headers."""
    return {h: i for i, h in enumerate(MINIMAL_HEADERS)}


def _row(start_date, pid, response_id=None):
    """Return a fully-formed row using make_clean_row, overriding start_date/pid."""
    rid = response_id or f"R_{pid}"
    return make_clean_row(pid=pid, response_id=rid, start_date=start_date)


# ---------------------------------------------------------------------------
# Tests: crp200=True (bypass V2_START filter)
# ---------------------------------------------------------------------------

class TestFilterSamplesCrp200:
    """When crp200=True all rows pass regardless of StartDate format."""

    def test_date_only_launch_day_rows_are_included(self):
        """Date-only values like '2026-03-23' must NOT be excluded in CRP mode."""
        idx = _idx()
        rows = [_row("2026-03-23", pid=f"P{i:03d}") for i in range(81)]
        v2, samples = filter_samples(rows, idx, crp200=True)
        assert len(v2) == 81

    def test_full_datetime_rows_are_included(self):
        idx = _idx()
        rows = [_row("2026-03-24 09:00:00", pid=f"P{i:03d}") for i in range(10)]
        v2, _ = filter_samples(rows, idx, crp200=True)
        assert len(v2) == 10

    def test_mixed_date_formats_all_included(self):
        idx = _idx()
        rows = (
            [_row("2026-03-23", pid=f"A{i:03d}") for i in range(81)]
            + [_row("2026-03-24 09:00:00", pid=f"B{i:03d}") for i in range(119)]
        )
        v2, _ = filter_samples(rows, idx, crp200=True)
        assert len(v2) == 200

    def test_empty_data_returns_empty(self):
        idx = _idx()
        v2, samples = filter_samples([], idx, crp200=True)
        assert v2 == []
        assert samples["prolific_accepted"] == []


# ---------------------------------------------------------------------------
# Tests: crp200=False (default - V2_START datetime comparison)
# ---------------------------------------------------------------------------

class TestFilterSamplesLivePath:
    """When crp200=False (default), StartDate is parsed and compared as datetime."""

    def test_rows_after_v2_start_are_included(self):
        idx = _idx()
        rows = [_row("2026-03-24 09:00:00", pid=f"P{i:03d}") for i in range(10)]
        v2, _ = filter_samples(rows, idx, crp200=False)
        assert len(v2) == 10

    def test_rows_before_v2_start_are_excluded(self):
        idx = _idx()
        rows = [_row("2026-01-01 00:00:00", pid=f"P{i:03d}") for i in range(5)]
        v2, _ = filter_samples(rows, idx, crp200=False)
        assert len(v2) == 0

    def test_date_only_same_day_excluded_without_crp200(self):
        """'2026-03-23' (date-only) is BEFORE V2_START - excluded on the live path.

        This documents the exact bug that crp200=True fixes: a date-only
        StartDate from the same launch day is excluded on the live path because
        datetime('2026-03-23') < V2_START (2026-03-23 14:00:00). This is
        intentional for the live export (which always has full timestamps)
        but would incorrectly drop rows in the de-identified CRP dataset.
        """
        idx = _idx()
        rows = [_row("2026-03-23", pid=f"P{i:03d}") for i in range(5)]
        v2, _ = filter_samples(rows, idx, crp200=False)
        # date-only '2026-03-23' → datetime(2026, 3, 23, 0, 0, 0) < V2_START
        assert len(v2) == 0

    def test_prolific_test_id_always_passes(self):
        """Explicit PROLIFIC_TEST_ID ResponseId bypasses the date filter."""
        idx = _idx()
        rows = [_row("2026-01-01 00:00:00", pid="P_TEST", response_id=PROLIFIC_TEST_ID)]
        v2, _ = filter_samples(rows, idx, crp200=False)
        assert len(v2) == 1

    def test_invalid_start_date_excluded_gracefully(self):
        """Rows with unparseable StartDate are silently excluded (not raised)."""
        idx = _idx()
        rows = [_row("not-a-date", pid="P001")]
        v2, _ = filter_samples(rows, idx, crp200=False)
        assert len(v2) == 0

    def test_default_is_same_as_false(self):
        idx = _idx()
        rows = [_row("2026-03-24 09:00:00", pid="P001")]
        v2_default, _ = filter_samples(rows, idx)
        v2_false, _ = filter_samples(rows, idx, crp200=False)
        assert len(v2_default) == len(v2_false)


# ---------------------------------------------------------------------------
# Tests: crp200 exactly recovers the 81 launch-day rows
# ---------------------------------------------------------------------------

class TestCrp200RecoversBug:
    """End-to-end regression: crp200=True restores 81 rows lost by old string compare."""

    def test_81_launch_day_rows_recovered(self):
        idx = _idx()
        launch_day = [_row("2026-03-23", pid=f"A{i:03d}") for i in range(81)]
        later = [_row("2026-03-24 09:00:00", pid=f"B{i:03d}") for i in range(119)]
        all_rows = launch_day + later

        v2_old, _ = filter_samples(all_rows, idx, crp200=False)
        v2_new, _ = filter_samples(all_rows, idx, crp200=True)

        assert len(v2_old) == 119, f"Expected 119 without fix, got {len(v2_old)}"
        assert len(v2_new) == 200, f"Expected 200 with fix, got {len(v2_new)}"
        assert len(v2_new) - len(v2_old) == 81, "Expected exactly 81 rows recovered"

