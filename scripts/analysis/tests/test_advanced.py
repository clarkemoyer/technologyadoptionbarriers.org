"""Tests for tabs_v2_advanced.py — inferential statistics and PCA.

These scripts use sys.argv[1] at module level, so we must patch sys.argv
before importing. Tests focus on the pure functions (scoring, loading,
statistical computation) rather than print output.
"""

import csv
import sys
from pathlib import Path
from unittest.mock import patch

import numpy as np
import pytest

# Patch sys.argv before importing the module
TEST_CSV = str(Path(__file__).parent.parent / "test_data_qualtrics.csv")


@pytest.fixture(scope="module", autouse=True)
def _patch_argv():
    """Patch sys.argv so the module-level code doesn't exit."""
    with patch.object(sys, "argv", ["test", TEST_CSV]):
        # Force re-import if already cached
        if "tabs_v2_advanced" in sys.modules:
            del sys.modules["tabs_v2_advanced"]
        yield


def _import():
    """Import the module after argv is patched."""
    with patch.object(sys, "argv", ["test", TEST_CSV]):
        if "tabs_v2_advanced" in sys.modules:
            del sys.modules["tabs_v2_advanced"]
        sys.path.insert(0, str(Path(__file__).parent.parent))
        import tabs_v2_advanced as mod
        return mod


class TestAdvancedFunctions:
    def test_map_role(self):
        mod = _import()
        assert mod.map_role("CIO (e.g., Director of IT)") == "CIO"
        assert mod.map_role("Unknown role") == "Other"

    def test_score_valid(self):
        mod = _import()
        idx = {"Q10-28_Barriers_1": 0}
        row = ["Moderate Barrier"]
        result = mod.score(row, idx, ["Q10-28_Barriers_1"], mod.BARRIER_SCALE)
        assert result == [3.0]

    def test_score_invalid(self):
        mod = _import()
        idx = {"Q10-28_Barriers_1": 0}
        row = ["InvalidValue"]
        result = mod.score(row, idx, ["Q10-28_Barriers_1"], mod.BARRIER_SCALE)
        assert result == []  # invalid values are skipped, not returned as None

    def test_person_mean(self):
        mod = _import()
        idx = {"Q10-28_Barriers_1": 0, "Q10-28_Barriers_2": 1}
        row = ["Minor Barrier", "Major Barrier"]  # 2, 5
        result = mod.person_mean(row, idx, ["Q10-28_Barriers_1", "Q10-28_Barriers_2"], mod.BARRIER_SCALE)
        assert result == pytest.approx(3.5)

    def test_person_mean_with_none(self):
        mod = _import()
        idx = {"Q10-28_Barriers_1": 0, "Q10-28_Barriers_2": 1}
        row = ["Minor Barrier", "InvalidValue"]  # 2, skipped
        result = mod.person_mean(row, idx, ["Q10-28_Barriers_1", "Q10-28_Barriers_2"], mod.BARRIER_SCALE)
        assert result == pytest.approx(2.0)

    def test_person_mean_all_none(self):
        mod = _import()
        idx = {"Q10-28_Barriers_1": 0}
        row = ["InvalidValue"]
        result = mod.person_mean(row, idx, ["Q10-28_Barriers_1"], mod.BARRIER_SCALE)
        assert result is None

    def test_item_vectors(self):
        mod = _import()
        idx = {"Q10-28_Barriers_1": 0, "Q10-28_Barriers_2": 1}
        rows = [
            ["Minor Barrier", "Major Barrier"],
            ["Moderate Barrier", "Significant Barrier"],
        ]
        result = mod.item_vectors(rows, idx, ["Q10-28_Barriers_1", "Q10-28_Barriers_2"], mod.BARRIER_SCALE)
        # item_vectors returns a list of arrays — one per item
        assert len(result) == 2
        # Check values (may be numpy arrays or lists)
        assert list(result[0]) == [2, 3]
        assert list(result[1]) == [5, 4]

    def test_load_produces_data(self):
        mod = _import()
        hdr, idx, rows = mod.load()
        assert isinstance(hdr, list)
        assert isinstance(idx, dict)
        assert "StartDate" in idx


class TestAdvancedEndToEnd:
    """Run the full script via subprocess to verify no crashes."""

    def test_runs_without_fatal_error(self):
        import subprocess
        result = subprocess.run(
            [sys.executable, str(Path(__file__).parent.parent / "tabs_v2_advanced.py"), TEST_CSV],
            capture_output=True, text=True, timeout=30,
        )
        # The script prints analysis output; we just check it doesn't crash
        assert result.returncode == 0, f"stderr: {result.stderr[:500]}"
        assert "TABS V2" in result.stdout or "Barrier" in result.stdout
