"""Tests for tabs_v2_psychometrics.py - instrument validation functions.

Uses production-format synthetic CSV with all required columns.
"""

import sys
from pathlib import Path
from unittest.mock import patch

import numpy as np
import pandas as pd
import pytest

PROD_CSV = str(Path(__file__).parent / "test_data_production_format.csv")


def _import():
    """Import tabs_v2_psychometrics with patched sys.argv."""
    with patch.object(sys, "argv", ["test", PROD_CSV]):
        if "tabs_v2_psychometrics" in sys.modules:
            del sys.modules["tabs_v2_psychometrics"]
        sys.path.insert(0, str(Path(__file__).parent.parent))
        import tabs_v2_psychometrics as mod
        return mod


# ── Scale conversion ─────────────────────────────────────────

class TestScaleConversion:
    def test_barrier_scale(self):
        mod = _import()
        assert mod.scale_to_numeric("Major Barrier", mod.BARRIER_SCALE) == 5
        assert mod.scale_to_numeric("Not a Barrier", mod.BARRIER_SCALE) == 1
        assert mod.scale_to_numeric("Moderate Barrier", mod.BARRIER_SCALE) == 3

    def test_readiness_scale(self):
        mod = _import()
        assert mod.scale_to_numeric("Very High Readiness/Capability", mod.READINESS_SCALE) == 5
        assert mod.scale_to_numeric("Very Low Readiness/Capability", mod.READINESS_SCALE) == 1

    def test_maturity_scale(self):
        mod = _import()
        assert mod.scale_to_numeric("Level 5: Optimizing/Innovating", mod.MATURITY_SCALE) == 5
        assert mod.scale_to_numeric("Level 1: Initial/Ad Hoc", mod.MATURITY_SCALE) == 1

    def test_dont_know_is_nan(self):
        mod = _import()
        assert np.isnan(mod.scale_to_numeric("Don't Know", mod.READINESS_SCALE))
        assert np.isnan(mod.scale_to_numeric("Don't Know", mod.MATURITY_SCALE))

    def test_invalid_is_nan(self):
        mod = _import()
        assert np.isnan(mod.scale_to_numeric("InvalidValue", mod.BARRIER_SCALE))
        assert np.isnan(mod.scale_to_numeric("", mod.BARRIER_SCALE))

    def test_nan_input_is_nan(self):
        mod = _import()
        assert np.isnan(mod.scale_to_numeric(np.nan, mod.BARRIER_SCALE))


# ── Reliability ──────────────────────────────────────────────

class TestCronbachAlpha:
    def test_high_reliability(self):
        mod = _import()
        data = pd.DataFrame({"A": [1, 2, 3, 4, 5.0], "B": [1, 2, 3, 4, 5.0], "C": [1, 2, 3, 4, 5.0]})
        assert mod.cronbach_alpha(data) > 0.95

    def test_zero_variance(self):
        mod = _import()
        data = pd.DataFrame({"A": [3.0, 3, 3], "B": [3.0, 3, 3]})
        result = mod.cronbach_alpha(data)
        assert np.isnan(result)

    def test_single_item_returns_nan(self):
        mod = _import()
        data = pd.DataFrame({"A": [1, 2, 3, 4, 5.0]})
        result = mod.cronbach_alpha(data)
        assert np.isnan(result)

    def test_with_ci(self):
        mod = _import()
        data = pd.DataFrame({
            "A": [1, 2, 3, 4, 5, 3, 4, 2, 1, 5.0],
            "B": [1, 2, 3, 4, 5, 3, 4, 2, 1, 5.0],
            "C": [2, 3, 4, 5, 5, 4, 3, 2, 1, 4.0],
        })
        lower, upper = mod.cronbach_alpha_ci(data)
        alpha = mod.cronbach_alpha(data)
        assert lower <= alpha <= upper


# ── Validity metrics ─────────────────────────────────────────

class TestBartlettTest:
    def test_correlated_data(self):
        mod = _import()
        np.random.seed(42)
        base = np.random.randn(50)
        data = pd.DataFrame({
            "A": base + np.random.randn(50) * 0.1,
            "B": base + np.random.randn(50) * 0.1,
            "C": base + np.random.randn(50) * 0.1,
        })
        stat, p = mod.bartlett_test(data)
        assert stat > 0
        assert p < 0.05


class TestKMO:
    def test_correlated_data(self):
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
    def test_perfectly_correlated(self):
        mod = _import()
        data = pd.DataFrame({"A": [1, 2, 3, 4, 5.0], "B": [1, 2, 3, 4, 5.0], "C": [1, 2, 3, 4, 5.0]})
        ave = mod.average_variance_extracted(data)
        assert 0 < ave <= 1.0


class TestHTMT:
    def test_htmt_ratio(self):
        mod = _import()
        data1 = pd.DataFrame({"A": [1, 2, 3, 4, 5.0], "B": [1, 2, 3, 4, 5.0]})
        data2 = pd.DataFrame({"C": [5, 4, 3, 2, 1.0], "D": [5, 4, 3, 2, 1.0]})
        htmt = mod.htmt_ratio(data1, data2)
        assert htmt is not None
        assert isinstance(htmt, float)


class TestMeanInterItemCorr:
    def test_basic(self):
        mod = _import()
        data = pd.DataFrame({"A": [1, 2, 3, 4, 5.0], "B": [1, 2, 3, 4, 5.0]})
        r = mod.mean_inter_item_corr(data)
        assert r == pytest.approx(1.0)


# ── Item analysis ────────────────────────────────────────────

class TestItemAnalysis:
    def test_item_total_correlations(self):
        mod = _import()
        data = pd.DataFrame({"A": [1, 2, 3, 4, 5.0], "B": [1, 2, 3, 4, 5.0], "C": [5, 4, 3, 2, 1.0]})
        corrs = mod.item_total_correlations(data)
        assert len(corrs) == 3

    def test_alpha_if_deleted(self):
        mod = _import()
        data = pd.DataFrame({"A": [1, 2, 3, 4, 5.0], "B": [1, 2, 3, 4, 5.0], "C": [5, 4, 3, 2, 1.0]})
        alphas = mod.alpha_if_deleted(data)
        assert len(alphas) == 3


# ── Response quality ─────────────────────────────────────────

class TestStraightliningRate:
    def test_all_same(self):
        mod = _import()
        row = pd.Series({"A": 3, "B": 3, "C": 3})
        assert mod.straightlining_rate(row, ["A", "B", "C"]) == 1.0

    def test_all_different(self):
        mod = _import()
        row = pd.Series({"A": 1, "B": 3, "C": 5})
        assert mod.straightlining_rate(row, ["A", "B", "C"]) < 1.0

    def test_partial(self):
        mod = _import()
        row = pd.Series({"A": 3, "B": 3, "C": 5, "D": 3})
        rate = mod.straightlining_rate(row, ["A", "B", "C", "D"])
        assert 0 < rate < 1.0


class TestMahalanobis:
    def test_basic(self):
        mod = _import()
        np.random.seed(42)
        data = pd.DataFrame({
            "A": np.random.randn(20),
            "B": np.random.randn(20),
        })
        distances = mod.mahalanobis_distance(data)
        assert len(distances) == 20
        assert all(d >= 0 for d in distances)


class TestHarmanSingleFactor:
    def test_returns_percentage(self):
        mod = _import()
        np.random.seed(42)
        data = pd.DataFrame({
            "A": np.random.randn(50),
            "B": np.random.randn(50),
            "C": np.random.randn(50),
        })
        variance = mod.harman_single_factor(data)
        assert 0 < variance < 1.0  # proportion, not percentage


# ── Data loading & encoding ──────────────────────────────────

class TestLoadAndEncode:
    def test_load_data(self):
        mod = _import()
        df = mod.load_data()
        assert len(df) > 0
        assert "Duration (in seconds)" in df.columns
        assert "StartDate" in df.columns

    def test_encode_scales(self):
        mod = _import()
        df = mod.load_data()
        encoded = mod.encode_scales(df)
        # Barrier columns should now be numeric
        for col in mod.BARRIER_ITEM_COLS:
            assert encoded[col].dtype in [np.float64, np.int64, float, int]

    def test_person_means(self):
        mod = _import()
        df = mod.load_data()
        encoded = mod.encode_scales(df)
        means = mod.person_means(encoded, mod.BARRIER_ITEM_COLS)
        assert len(means) == len(encoded)
        # At least some should be non-null
        assert means.notna().sum() > 0

    def test_grand_mean(self):
        mod = _import()
        df = mod.load_data()
        encoded = mod.encode_scales(df)
        gm = mod.grand_mean(encoded, mod.BARRIER_ITEM_COLS)
        assert 1.0 <= gm <= 5.0


# ── End-to-end ───────────────────────────────────────────────

class TestPsychometricsEndToEnd:
    def test_full_run(self):
        """Run the complete psychometrics script against production-format test data."""
        import subprocess
        result = subprocess.run(
            [sys.executable, str(Path(__file__).parent.parent / "tabs_v2_psychometrics.py"), PROD_CSV],
            capture_output=True, text=True, timeout=60,
        )
        assert result.returncode == 0, f"stderr: {result.stderr[:1000]}"
        assert "INSTRUMENT VALIDATION" in result.stdout
        assert "Cronbach" in result.stdout
