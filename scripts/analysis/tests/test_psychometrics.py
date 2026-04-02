"""Tests for tabs_v2_psychometrics.py — instrument validation functions.

The module uses sys.argv[1] at module level and pandas. We test individual
pure functions and the end-to-end script via subprocess.
"""

import csv
import sys
from pathlib import Path
from unittest.mock import patch

import numpy as np
import pandas as pd
import pytest

TEST_CSV = str(Path(__file__).parent.parent / "test_data_qualtrics.csv")


def _import():
    """Import tabs_v2_psychometrics with patched sys.argv."""
    with patch.object(sys, "argv", ["test", TEST_CSV]):
        if "tabs_v2_psychometrics" in sys.modules:
            del sys.modules["tabs_v2_psychometrics"]
        sys.path.insert(0, str(Path(__file__).parent.parent))
        import tabs_v2_psychometrics as mod
        return mod


class TestScaleConversion:
    def test_scale_to_numeric_barrier(self):
        mod = _import()
        assert mod.scale_to_numeric("Major Barrier", mod.BARRIER_SCALE) == 5
        assert mod.scale_to_numeric("Not a Barrier", mod.BARRIER_SCALE) == 1

    def test_scale_to_numeric_readiness(self):
        mod = _import()
        assert mod.scale_to_numeric("Very High Readiness/Capability", mod.READINESS_SCALE) == 5
        result = mod.scale_to_numeric("Don't Know", mod.READINESS_SCALE)
        assert np.isnan(result)  # returns NaN, not None

    def test_scale_to_numeric_maturity(self):
        mod = _import()
        assert mod.scale_to_numeric("Level 5: Optimizing/Innovating", mod.MATURITY_SCALE) == 5
        result = mod.scale_to_numeric("Don't Know", mod.MATURITY_SCALE)
        assert np.isnan(result)

    def test_scale_to_numeric_invalid(self):
        mod = _import()
        assert np.isnan(mod.scale_to_numeric("InvalidValue", mod.BARRIER_SCALE))
        assert np.isnan(mod.scale_to_numeric("", mod.BARRIER_SCALE))


class TestCronbachAlpha:
    def test_high_reliability(self):
        mod = _import()
        # Perfectly correlated items → alpha near 1.0
        data = pd.DataFrame({
            "A": [1, 2, 3, 4, 5],
            "B": [1, 2, 3, 4, 5],
            "C": [1, 2, 3, 4, 5],
        })
        alpha = mod.cronbach_alpha(data)
        assert alpha > 0.95

    def test_zero_variance(self):
        mod = _import()
        data = pd.DataFrame({"A": [3, 3, 3], "B": [3, 3, 3]})
        alpha = mod.cronbach_alpha(data)
        # With zero variance, alpha is undefined or 0
        assert alpha is not None

    def test_single_item(self):
        mod = _import()
        data = pd.DataFrame({"A": [1, 2, 3, 4, 5]})
        alpha = mod.cronbach_alpha(data)
        # Single item has no internal consistency to measure
        assert alpha is not None


class TestBartlettTest:
    def test_with_correlated_data(self):
        mod = _import()
        data = pd.DataFrame({
            "A": np.random.randn(50),
            "B": np.random.randn(50),
            "C": np.random.randn(50),
        })
        # Add correlation
        data["B"] = data["A"] + np.random.randn(50) * 0.1
        stat, p = mod.bartlett_test(data)
        assert stat > 0
        assert p < 0.05  # should be significant with correlated data


class TestKMO:
    def test_with_correlated_data(self):
        mod = _import()
        np.random.seed(42)
        base = np.random.randn(100)
        data = pd.DataFrame({
            "A": base + np.random.randn(100) * 0.3,
            "B": base + np.random.randn(100) * 0.3,
            "C": base + np.random.randn(100) * 0.3,
            "D": base + np.random.randn(100) * 0.3,
        })
        kmo = mod.kmo_measure(data)
        assert 0 < kmo <= 1.0


class TestAVE:
    def test_average_variance_extracted(self):
        mod = _import()
        data = pd.DataFrame({
            "A": [1, 2, 3, 4, 5.0],
            "B": [1, 2, 3, 4, 5.0],
            "C": [1, 2, 3, 4, 5.0],
        })
        ave = mod.average_variance_extracted(data)
        assert 0 < ave <= 1.0


class TestHTMT:
    def test_htmt_ratio(self):
        mod = _import()
        data1 = pd.DataFrame({
            "A": [1, 2, 3, 4, 5.0],
            "B": [1, 2, 3, 4, 5.0],
        })
        data2 = pd.DataFrame({
            "C": [5, 4, 3, 2, 1.0],
            "D": [5, 4, 3, 2, 1.0],
        })
        htmt = mod.htmt_ratio(data1, data2)
        assert htmt is not None
        assert isinstance(htmt, float)


class TestItemAnalysis:
    def test_item_total_correlations(self):
        mod = _import()
        data = pd.DataFrame({
            "A": [1.0, 2, 3, 4, 5],
            "B": [1.0, 2, 3, 4, 5],
            "C": [5.0, 4, 3, 2, 1],
        })
        corrs = mod.item_total_correlations(data)
        assert len(corrs) == 3

    def test_alpha_if_deleted(self):
        mod = _import()
        data = pd.DataFrame({
            "A": [1.0, 2, 3, 4, 5],
            "B": [1.0, 2, 3, 4, 5],
            "C": [5.0, 4, 3, 2, 1],
        })
        alphas = mod.alpha_if_deleted(data)
        assert len(alphas) == 3


class TestStraightliningRate:
    def test_all_same(self):
        mod = _import()
        row = pd.Series({"A": 3, "B": 3, "C": 3})
        rate = mod.straightlining_rate(row, ["A", "B", "C"])
        assert rate == 1.0

    def test_all_different(self):
        mod = _import()
        row = pd.Series({"A": 1, "B": 3, "C": 5})
        rate = mod.straightlining_rate(row, ["A", "B", "C"])
        assert rate < 1.0


class TestHarmanSingleFactor:
    def test_harman(self):
        mod = _import()
        np.random.seed(42)
        data = pd.DataFrame({
            "A": np.random.randn(50),
            "B": np.random.randn(50),
            "C": np.random.randn(50),
        })
        variance = mod.harman_single_factor(data)
        assert 0 < variance < 100


class TestPsychometricsEndToEnd:
    @pytest.mark.xfail(reason="Test CSV lacks columns required by psychometrics (IsV2, etc.)")
    def test_runs_without_fatal_error(self):
        import subprocess
        result = subprocess.run(
            [sys.executable, str(Path(__file__).parent.parent / "tabs_v2_psychometrics.py"), TEST_CSV],
            capture_output=True, text=True, timeout=60,
        )
        assert result.returncode == 0, f"stderr: {result.stderr[:500]}"
