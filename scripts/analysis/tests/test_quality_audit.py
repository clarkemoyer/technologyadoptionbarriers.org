"""Tests for tabs_v2_quality_audit.py — data quality assessment.

The module uses sys.argv[1] at module level. We test individual functions
and the end-to-end script via subprocess.
"""

import sys
from pathlib import Path
from unittest.mock import patch

import numpy as np
import pytest

TEST_CSV = str(Path(__file__).parent.parent / "test_data_qualtrics.csv")


def _import():
    """Import tabs_v2_quality_audit with patched sys.argv."""
    with patch.object(sys, "argv", ["test", TEST_CSV]):
        if "tabs_v2_quality_audit" in sys.modules:
            del sys.modules["tabs_v2_quality_audit"]
        sys.path.insert(0, str(Path(__file__).parent.parent))
        import tabs_v2_quality_audit as mod
        return mod


class TestQualityFunctions:
    def test_map_role(self):
        mod = _import()
        assert mod.map_role("CIO (e.g., Director of IT)") == "CIO"
        assert mod.map_role("SomeOtherRole") == "Other"

    def test_person_responses_uses_module_idx(self):
        """person_responses uses the module's global idx to map col names to list indices."""
        mod = _import()
        # Build a row list matching the module's idx layout
        idx = mod.idx
        cols = mod.BARRIER_COLS[:2]
        row = [""] * max(idx.values()) + [""]  # ensure enough columns
        row[idx[cols[0]]] = "Minor Barrier"
        row[idx[cols[1]]] = "Major Barrier"
        result = mod.person_responses(row, cols, mod.BARRIER_SCALE)
        assert result == [2, 5]

    def test_person_responses_skips_invalid(self):
        mod = _import()
        idx = mod.idx
        cols = mod.BARRIER_COLS[:1]
        row = [""] * (max(idx.values()) + 1)
        row[idx[cols[0]]] = "InvalidValue"
        result = mod.person_responses(row, cols, mod.BARRIER_SCALE)
        assert result == []

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


class TestQualityEndToEnd:
    def test_runs_without_fatal_error(self):
        import subprocess
        result = subprocess.run(
            [sys.executable, str(Path(__file__).parent.parent / "tabs_v2_quality_audit.py"), TEST_CSV],
            capture_output=True, text=True, timeout=30,
        )
        assert result.returncode == 0, f"stderr: {result.stderr[:500]}"
