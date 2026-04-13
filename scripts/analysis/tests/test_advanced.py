"""Tests for tabs_v2_advanced.py - inferential statistics and PCA.

Uses production-format synthetic CSV with all required columns.
"""

import sys
from pathlib import Path
from unittest.mock import patch

import numpy as np
import pytest

PROD_CSV = str(Path(__file__).parent / "test_data_production_format.csv")


def _import():
    """Import the module after argv is patched."""
    with patch.object(sys, "argv", ["test", PROD_CSV]):
        if "tabs_v2_advanced" in sys.modules:
            del sys.modules["tabs_v2_advanced"]
        sys.path.insert(0, str(Path(__file__).parent.parent))
        import tabs_v2_advanced as mod
        return mod


class TestAdvancedFunctions:
    def test_map_role_known(self):
        mod = _import()
        assert mod.map_role("CIO (e.g., Director of IT)") == "CIO"
        assert mod.map_role("CTO (e.g., Director of Technology/Innovation, Chief Scientist)") == "CTO"

    def test_map_role_unknown(self):
        mod = _import()
        assert mod.map_role("Unknown role") == "Other"

    def test_score_valid(self):
        mod = _import()
        idx = {"Q10-28_Barriers_1": 0}
        row = ["Moderate Barrier"]
        result = mod.score(row, idx, ["Q10-28_Barriers_1"], mod.BARRIER_SCALE)
        assert result == [3]

    def test_score_invalid_skipped(self):
        mod = _import()
        idx = {"Q10-28_Barriers_1": 0}
        row = ["InvalidValue"]
        result = mod.score(row, idx, ["Q10-28_Barriers_1"], mod.BARRIER_SCALE)
        assert result == []

    def test_score_multiple_items(self):
        mod = _import()
        idx = {"Q10-28_Barriers_1": 0, "Q10-28_Barriers_2": 1, "Q10-28_Barriers_3": 2}
        row = ["Minor Barrier", "Major Barrier", "Not a Barrier"]
        result = mod.score(row, idx, ["Q10-28_Barriers_1", "Q10-28_Barriers_2", "Q10-28_Barriers_3"], mod.BARRIER_SCALE)
        assert result == [2, 5, 1]

    def test_person_mean(self):
        mod = _import()
        idx = {"Q10-28_Barriers_1": 0, "Q10-28_Barriers_2": 1}
        row = ["Minor Barrier", "Major Barrier"]
        result = mod.person_mean(row, idx, ["Q10-28_Barriers_1", "Q10-28_Barriers_2"], mod.BARRIER_SCALE)
        assert result == pytest.approx(3.5)

    def test_person_mean_with_invalid(self):
        mod = _import()
        idx = {"Q10-28_Barriers_1": 0, "Q10-28_Barriers_2": 1}
        row = ["Minor Barrier", "InvalidValue"]
        result = mod.person_mean(row, idx, ["Q10-28_Barriers_1", "Q10-28_Barriers_2"], mod.BARRIER_SCALE)
        assert result == pytest.approx(2.0)

    def test_person_mean_all_invalid(self):
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
        assert len(result) == 2
        assert list(result[0]) == [2, 3]
        assert list(result[1]) == [5, 4]

    def test_load_produces_data(self):
        mod = _import()
        hdr, idx, rows = mod.load()
        assert isinstance(hdr, list)
        assert isinstance(idx, dict)
        assert "StartDate" in idx
        assert "Duration (in seconds)" in idx
        assert len(rows) > 0  # production CSV has valid clean rows

    def test_load_filters_clean_only(self):
        """load() should only return clean rows (dur >= 480, all 3 IRIs)."""
        mod = _import()
        _, idx, rows = mod.load()
        for r in rows:
            dur = float(r[idx["Duration (in seconds)"]])
            assert dur >= mod.MIN_DUR
            assert r[idx[mod.IRI_B]] == "Major Barrier"
            assert r[idx[mod.IRI_R]] == "Low Readiness/Capability"
            assert r[idx[mod.IRI_M]] == "Level 2: Developing/Repeatable"


class TestAdvancedEndToEnd:
    def test_runs_without_fatal_error(self):
        import subprocess
        result = subprocess.run(
            [sys.executable, str(Path(__file__).parent.parent / "tabs_v2_advanced.py"), PROD_CSV],
            capture_output=True, text=True, timeout=30,
        )
        assert result.returncode == 0, f"stderr: {result.stderr[:500]}"
        assert "TABS V2" in result.stdout
        assert "INFERENTIAL" in result.stdout
