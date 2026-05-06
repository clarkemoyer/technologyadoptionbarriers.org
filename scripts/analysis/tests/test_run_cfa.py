"""Tests for run_cfa() semopy DataFrame orientation handling.

Ensures that CFA fit indices are correctly extracted from semopy.calc_stats()
which returns stat names as *columns* (not row index) in semopy ≥2.x.

The ``TestRunCFAMocked`` class exercises the orientation logic using a mocked
semopy so that it runs in **all** CI environments (even when semopy is not
installed).
"""

import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

import numpy as np
import pandas as pd
import pytest

ANALYSIS_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(ANALYSIS_DIR))


def _import_run_cfa():
    """Import run_cfa from the unified analysis module."""
    with patch.object(sys, "argv", ["test", "/dev/null"]):
        if "tabs_v2_unified_data_analysis" in sys.modules:
            del sys.modules["tabs_v2_unified_data_analysis"]
        from tabs_v2_unified_data_analysis import run_cfa
        return run_cfa


# Only skip semopy-dependent tests; the error-path test runs without semopy.
try:
    import semopy as _semopy  # noqa: F401
    _has_semopy = True
except ImportError:
    _has_semopy = False

requires_semopy = pytest.mark.skipif(
    not _has_semopy, reason="semopy not installed"
)


@pytest.fixture()
def synth_data():
    """Create synthetic single-factor data for CFA."""
    np.random.seed(42)
    n = 200
    factor = np.random.randn(n)
    data = pd.DataFrame(
        {f"x{i}": factor * 0.7 + np.random.randn(n) * 0.5 for i in range(5)}
    )
    model_spec = "F1 =~ x0 + x1 + x2 + x3 + x4"
    return data, model_spec


# ---------------------------------------------------------------------------
# Mock-based tests — always run (no semopy install required)
# ---------------------------------------------------------------------------

def _semopy2x_stats():
    """DataFrame matching semopy ≥2.x: stat names are columns, 'Value' is the row."""
    return pd.DataFrame(
        {
            "chi2": [25.5],
            "DoF": [5.0],
            "chi2 p-value": [0.0001],
            "CFI": [0.95],
            "TLI": [0.93],
            "RMSEA": [0.06],
            "SRMR": [0.04],
            "AIC": [1234.56],
            "BIC": [1278.9],
        },
        index=["Value"],
    )


def _legacy_stats():
    """DataFrame matching hypothetical older semopy: stat names are row indices."""
    stats = ["chi2", "DoF", "chi2 p-value", "CFI", "TLI", "RMSEA", "SRMR", "AIC", "BIC"]
    vals = [25.5, 5.0, 0.0001, 0.95, 0.93, 0.06, 0.04, 1234.56, 1278.9]
    return pd.DataFrame({"Value": vals}, index=stats)


def _run_with_mock_stats(synth_data, stats_df):
    """Import the analysis module with mocked semopy and invoke run_cfa."""
    data, model_spec = synth_data

    mock_semopy = MagicMock()
    mock_model = MagicMock()
    mock_semopy.Model.return_value = mock_model
    mock_semopy.calc_stats.return_value = stats_df
    mock_model.inspect.return_value = pd.DataFrame(
        columns=["lval", "op", "Est. Std"]
    )

    with patch.dict(sys.modules, {"semopy": mock_semopy}):
        with patch.object(sys, "argv", ["test", "/dev/null"]):
            if "tabs_v2_unified_data_analysis" in sys.modules:
                del sys.modules["tabs_v2_unified_data_analysis"]
            import tabs_v2_unified_data_analysis as mod
            mod.semopy = mock_semopy
            mod.HAS_SEMOPY = True
            return mod.run_cfa(data, model_spec, "MockCFA")


class TestRunCFAMocked:
    """Test run_cfa() orientation logic with mocked semopy (runs in all CI)."""

    def test_semopy2x_column_orientation(self, synth_data):
        """Column-oriented stats (semopy ≥2.x) should produce correct fit indices."""
        result = _run_with_mock_stats(synth_data, _semopy2x_stats())

        assert "error" not in result, f"Unexpected error: {result.get('error')}"
        assert result["cfi"] == 0.95
        assert result["tli"] == 0.93
        assert result["rmsea"] == 0.06
        assert result["chi2"] == 25.5
        assert result["df"] == 5
        assert result["chi2_p"] == 0.0001
        assert result["srmr"] == 0.04
        assert result["aic"] == 1234.56
        assert result["bic"] == 1278.9

    def test_legacy_row_orientation(self, synth_data):
        """Row-oriented stats (hypothetical older semopy) should also work."""
        result = _run_with_mock_stats(synth_data, _legacy_stats())

        assert "error" not in result, f"Unexpected error: {result.get('error')}"
        assert result["cfi"] == 0.95
        assert result["tli"] == 0.93
        assert result["rmsea"] == 0.06
        assert result["chi2"] == 25.5
        assert result["df"] == 5


# ---------------------------------------------------------------------------
# Tests requiring real semopy (skipped when semopy is not installed)
# ---------------------------------------------------------------------------


class TestRunCFA:
    """Verify run_cfa extracts non-null fit indices from real semopy."""

    @requires_semopy
    def test_cfa_produces_nonnull_indices(self, synth_data):
        """CFI, TLI, RMSEA, chi2 should all be non-null floats."""
        data, model_spec = synth_data
        run_cfa = _import_run_cfa()
        result = run_cfa(data, model_spec, "TestConstruct")

        assert "error" not in result, f"CFA raised error: {result.get('error')}"
        for key in ("cfi", "tli", "rmsea", "chi2", "df", "chi2_p"):
            assert result.get(key) is not None, f"{key} should not be None"
            assert isinstance(result[key], (int, float)), f"{key} should be numeric"

    @requires_semopy
    def test_cfa_cfi_in_valid_range(self, synth_data):
        """CFI should be between 0 and 1."""
        data, model_spec = synth_data
        run_cfa = _import_run_cfa()
        result = run_cfa(data, model_spec, "TestConstruct")
        cfi = result["cfi"]
        assert 0 <= cfi <= 1, f"CFI={cfi} out of expected range [0, 1]"

    def test_cfa_without_semopy(self, synth_data):
        """When semopy is unavailable, run_cfa returns an error dict."""
        data, model_spec = synth_data
        run_cfa = _import_run_cfa()
        # Temporarily pretend semopy is missing
        import tabs_v2_unified_data_analysis as mod
        orig = mod.HAS_SEMOPY
        mod.HAS_SEMOPY = False
        try:
            result = run_cfa(data, model_spec, "TestConstruct")
            assert "error" in result
            assert "semopy not installed" in result["error"]
        finally:
            mod.HAS_SEMOPY = orig
