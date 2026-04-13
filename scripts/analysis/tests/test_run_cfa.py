"""Tests for run_cfa() semopy DataFrame orientation handling.

Ensures that CFA fit indices are correctly extracted from semopy.calc_stats()
which returns stat names as *columns* (not row index) in semopy ≥2.x.
"""

import sys
from pathlib import Path
from unittest.mock import patch

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


class TestRunCFA:
    """Verify run_cfa extracts non-null fit indices from semopy."""

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
