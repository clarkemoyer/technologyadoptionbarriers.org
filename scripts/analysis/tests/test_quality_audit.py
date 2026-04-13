"""Tests for tabs_v2_quality_audit.py - data quality assessment.

Uses production-format synthetic CSV with all required columns.
"""

import sys
from pathlib import Path
from unittest.mock import patch

import pytest

PROD_CSV = str(Path(__file__).parent / "test_data_production_format.csv")


def _import():
    """Import tabs_v2_quality_audit with patched sys.argv."""
    with patch.object(sys, "argv", ["test", PROD_CSV]):
        if "tabs_v2_quality_audit" in sys.modules:
            del sys.modules["tabs_v2_quality_audit"]
        sys.path.insert(0, str(Path(__file__).parent.parent))
        import tabs_v2_quality_audit as mod
        return mod


class TestQualityFunctions:
    def test_map_role_cio(self):
        mod = _import()
        assert mod.map_role("CIO (e.g., Director of IT)") == "CIO"

    def test_map_role_cto(self):
        mod = _import()
        assert mod.map_role("CTO (e.g., Director of Technology/Innovation, Chief Scientist)") == "CTO"

    def test_map_role_unknown(self):
        mod = _import()
        assert mod.map_role("SomeOtherRole") == "Other"

    def test_person_responses_valid(self):
        """person_responses uses module-level idx to map column names to row indices."""
        mod = _import()
        idx = mod.idx
        cols = mod.BARRIER_COLS[:2]
        row = [""] * (max(idx.values()) + 1)
        row[idx[cols[0]]] = "Minor Barrier"
        row[idx[cols[1]]] = "Major Barrier"
        result = mod.person_responses(row, cols, mod.BARRIER_SCALE)
        assert result == [2, 5]

    def test_person_responses_skips_invalid(self):
        mod = _import()
        idx = mod.idx
        cols = mod.BARRIER_COLS[:2]
        row = [""] * (max(idx.values()) + 1)
        row[idx[cols[0]]] = "InvalidValue"
        row[idx[cols[1]]] = "Moderate Barrier"
        result = mod.person_responses(row, cols, mod.BARRIER_SCALE)
        assert result == [3]  # Only the valid one

    def test_person_mean_valid(self):
        mod = _import()
        idx = mod.idx
        cols = mod.BARRIER_COLS[:2]
        row = [""] * (max(idx.values()) + 1)
        row[idx[cols[0]]] = "Minor Barrier"
        row[idx[cols[1]]] = "Major Barrier"
        result = mod.person_mean(row, cols, mod.BARRIER_SCALE)
        assert result == pytest.approx(3.5)

    def test_person_mean_no_valid(self):
        mod = _import()
        idx = mod.idx
        cols = mod.BARRIER_COLS[:1]
        row = [""] * (max(idx.values()) + 1)
        row[idx[cols[0]]] = "InvalidValue"
        result = mod.person_mean(row, cols, mod.BARRIER_SCALE)
        assert result is None

    def test_module_has_clean_rows(self):
        """The module should load and filter to clean rows from production CSV."""
        mod = _import()
        assert hasattr(mod, "clean_rows")
        assert len(mod.clean_rows) > 0

    def test_module_has_idx(self):
        mod = _import()
        assert "StartDate" in mod.idx
        assert "Duration (in seconds)" in mod.idx
        assert "Q10-28_Barriers_1" in mod.idx


class TestQualityEndToEnd:
    def test_runs_without_fatal_error(self):
        import subprocess
        result = subprocess.run(
            [sys.executable, str(Path(__file__).parent.parent / "tabs_v2_quality_audit.py"), PROD_CSV],
            capture_output=True, text=True, timeout=30,
        )
        assert result.returncode == 0, f"stderr: {result.stderr[:500]}"
        assert "DATA QUALITY AUDIT" in result.stdout
