"""Tests for the 7 pipeline-gap statistics added in the 5-2-2026 audit.

Covers:
  Gap 1 — _compute_srmr_fallback()  (SRMR on every CFA model)
  Gap 2 — henze_zirkler_normality() (HZ multivariate normality)
  Gap 3 — t_tests_smb_vs_enterprise() (construct-level SMB vs ENT Welch t-tests)
  Gap 4 — harman_single_factor_cmv() (Harman CMV test)
  Gap 5 — split_sample_cv() emits tucker_per_factor (per-factor Tucker congruence)
  Gap 6 — _build_validation_registry() (aggregate pass/fail registry)
  Gap 7 — _build_r_parity_tests()     (R parity test count meta-block)

All tests are designed to run in the CI sandbox (pingouin, numpy, pandas,
scipy pre-installed; semopy is optional for Gap 1/5 tests).
"""

import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

import numpy as np
import pandas as pd
import pytest

ANALYSIS_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(ANALYSIS_DIR))

# --------------------------------------------------------------------------- #
# Import helpers                                                                #
# --------------------------------------------------------------------------- #


def _import_validation():
    """Import tabs_v2_validation functions needed for gap tests."""
    with patch.object(sys, "argv", ["test", "/dev/null"]):
        mname = "tabs_v2_validation"
        if mname in sys.modules:
            del sys.modules[mname]
        import tabs_v2_validation as mod  # noqa: PLC0415
        return mod


try:
    import semopy as _semopy  # noqa: F401
    _has_semopy = True
except ImportError:
    _has_semopy = False

requires_semopy = pytest.mark.skipif(not _has_semopy, reason="semopy not installed")

try:
    import pingouin as _pingouin  # noqa: F401
    _has_pingouin = True
except ImportError:
    _has_pingouin = False

requires_pingouin = pytest.mark.skipif(not _has_pingouin, reason="pingouin not installed")


# --------------------------------------------------------------------------- #
# Fixtures                                                                      #
# --------------------------------------------------------------------------- #


@pytest.fixture()
def synth_df():
    """Small synthetic DataFrame (~200 rows) with 3 constructs (5 items each)."""
    rng = np.random.default_rng(seed=42)
    n = 200
    b_factor = rng.standard_normal(n)
    r_factor = rng.standard_normal(n)
    m_factor = rng.standard_normal(n)
    data = {}
    for i in range(5):
        data[f"B{i+1}"] = np.clip(np.round(b_factor * 0.7 + rng.standard_normal(n) * 0.5 + 3), 1, 5).astype(float)
        data[f"R{i+1}"] = np.clip(np.round(r_factor * 0.7 + rng.standard_normal(n) * 0.5 + 3), 1, 5).astype(float)
        data[f"M{i+1}"] = np.clip(np.round(m_factor * 0.7 + rng.standard_normal(n) * 0.5 + 3), 1, 5).astype(float)
    # Create _SMB indicator: first 114 rows = SMB (1), last 86 = Enterprise (0)
    smb = [1] * 114 + [0] * 86
    data["_SMB"] = smb
    return pd.DataFrame(data)


# --------------------------------------------------------------------------- #
# Gap 1 — _compute_srmr_fallback()                                             #
# --------------------------------------------------------------------------- #

class TestComputeSrmrFallback:
    """Gap 1: SRMR fallback returns plausible value when mx_cov is available."""

    def test_returns_float_for_valid_input(self, synth_df):
        mod = _import_validation()
        cols = [f"B{i+1}" for i in range(5)]
        d = synth_df[cols].dropna()
        S = d.cov().values
        # Build a simple mock 'mod' with mx_cov set to observed cov (perfect fit → SRMR≈0)
        mock_model = MagicMock()
        mock_model.mx_cov = S  # perfect fit proxy
        result = mod._compute_srmr_fallback(d, mock_model)
        assert result is not None
        assert isinstance(result, float)
        # Perfect fit (implied == observed) → SRMR should be ~0
        assert abs(result) < 0.01, f"Expected near-zero SRMR for perfect fit, got {result}"

    def test_returns_none_when_mx_cov_missing(self, synth_df):
        mod = _import_validation()
        cols = [f"B{i+1}" for i in range(5)]
        d = synth_df[cols].dropna()
        mock_model = MagicMock()
        mock_model.mx_cov = None
        result = mod._compute_srmr_fallback(d, mock_model)
        assert result is None

    def test_srmr_nonnegative(self, synth_df):
        mod = _import_validation()
        cols = [f"B{i+1}" for i in range(5)]
        d = synth_df[cols].dropna()
        # Add a small perturbation so implied ≠ observed
        S = d.cov().values.copy()
        Sigma = S * 1.05  # slightly off
        mock_model = MagicMock()
        mock_model.mx_cov = Sigma
        result = mod._compute_srmr_fallback(d, mock_model)
        assert result is not None
        assert result >= 0.0

    @requires_semopy
    def test_srmr_run_cfa_dwls_includes_srmr_key(self, synth_df):
        """run_cfa_dwls result must include 'srmr' key when semopy is available."""
        mod = _import_validation()
        cols = [f"B{i+1}" for i in range(5)]
        d = synth_df[cols]
        spec = "F1 =~ B1 + B2 + B3 + B4 + B5"
        result = mod.run_cfa_dwls(d, spec, "Barriers")
        # Key must exist; value may be None if calc_stats and fallback both fail
        assert "srmr" in result


# --------------------------------------------------------------------------- #
# Gap 2 — henze_zirkler_normality()                                            #
# --------------------------------------------------------------------------- #

class TestHenzeZirklerNormality:
    """Gap 2: henze_zirkler_normality() returns expected keys and types."""

    @requires_pingouin
    def test_returns_expected_keys(self, synth_df):
        mod = _import_validation()
        cols = [f"B{i+1}" for i in range(5)]
        result = mod.henze_zirkler_normality(synth_df[cols])
        assert result is not None
        assert "error" not in result, f"Unexpected error: {result}"
        for key in ("hz", "p_value", "multivariate_normal_005", "n", "p"):
            assert key in result, f"Missing key: {key}"

    @requires_pingouin
    def test_hz_is_positive(self, synth_df):
        mod = _import_validation()
        cols = [f"B{i+1}" for i in range(5)]
        result = mod.henze_zirkler_normality(synth_df[cols])
        assert result["hz"] > 0

    @requires_pingouin
    def test_p_value_in_range(self, synth_df):
        mod = _import_validation()
        cols = [f"R{i+1}" for i in range(5)]
        result = mod.henze_zirkler_normality(synth_df[cols])
        assert 0 <= result["p_value"] <= 1

    @requires_pingouin
    def test_multivariate_normal_flag_is_bool(self, synth_df):
        mod = _import_validation()
        cols = [f"M{i+1}" for i in range(5)]
        result = mod.henze_zirkler_normality(synth_df[cols])
        assert isinstance(result["multivariate_normal_005"], bool)

    @requires_pingouin
    def test_returns_none_for_tiny_data(self):
        mod = _import_validation()
        tiny = pd.DataFrame({"x": [1.0, 2.0]})
        result = mod.henze_zirkler_normality(tiny)
        assert result is None

    def test_graceful_error_when_pingouin_missing(self, synth_df):
        """Should return None or an error dict if pingouin is absent (HAS_PINGOUIN=False)."""
        mod = _import_validation()
        cols = [f"B{i+1}" for i in range(5)]
        # Temporarily disable pingouin via the module flag
        orig = mod.HAS_PINGOUIN
        mod.HAS_PINGOUIN = False
        try:
            result = mod.henze_zirkler_normality(synth_df[cols])
        finally:
            mod.HAS_PINGOUIN = orig
        # Either None or an error dict — must not raise
        assert result is None or isinstance(result, dict)


# --------------------------------------------------------------------------- #
# Gap 3 — t_tests_smb_vs_enterprise()                                          #
# --------------------------------------------------------------------------- #

class TestTTestsSmbVsEnterprise:
    """Gap 3: construct-level Welch t-tests (SMB vs Enterprise) match expected shape."""

    def test_returns_expected_top_level_keys(self, synth_df):
        mod = _import_validation()
        constructs = {
            "Barriers": [f"B{i+1}" for i in range(5)],
            "Readiness": [f"R{i+1}" for i in range(5)],
            "Maturity": [f"M{i+1}" for i in range(5)],
        }
        result = mod.t_tests_smb_vs_enterprise(synth_df, constructs, smb_col="_SMB")
        assert "smb_n" in result
        assert "enterprise_n" in result
        assert "constructs" in result
        assert result["smb_n"] == 114
        assert result["enterprise_n"] == 86

    def test_each_construct_has_required_fields(self, synth_df):
        mod = _import_validation()
        constructs = {
            "Barriers": [f"B{i+1}" for i in range(5)],
            "Readiness": [f"R{i+1}" for i in range(5)],
            "Maturity": [f"M{i+1}" for i in range(5)],
        }
        result = mod.t_tests_smb_vs_enterprise(synth_df, constructs)
        for cname in ("Barriers", "Readiness", "Maturity"):
            c = result["constructs"][cname]
            assert "error" not in c, f"{cname} returned error: {c}"
            for key in ("t", "df", "p", "cohens_d", "sig_05", "smb_mean", "enterprise_mean"):
                assert key in c, f"Missing key '{key}' in {cname}"

    def test_p_value_in_range(self, synth_df):
        mod = _import_validation()
        constructs = {"Barriers": [f"B{i+1}" for i in range(5)]}
        result = mod.t_tests_smb_vs_enterprise(synth_df, constructs)
        p = result["constructs"]["Barriers"]["p"]
        assert p is not None and 0 <= p <= 1

    def test_missing_smb_col_returns_error(self, synth_df):
        mod = _import_validation()
        constructs = {"Barriers": [f"B{i+1}" for i in range(5)]}
        df_no_smb = synth_df.drop(columns=["_SMB"])
        result = mod.t_tests_smb_vs_enterprise(df_no_smb, constructs, smb_col="_SMB")
        assert "error" in result


# --------------------------------------------------------------------------- #
# Gap 4 — harman_single_factor_cmv()                                           #
# --------------------------------------------------------------------------- #

class TestHarmanSingleFactorCmv:
    """Gap 4: Harman CMV test returns valid variance percentage."""

    def test_returns_expected_keys(self, synth_df):
        mod = _import_validation()
        all_cols = [f"B{i+1}" for i in range(5)] + \
                   [f"R{i+1}" for i in range(5)] + \
                   [f"M{i+1}" for i in range(5)]
        result = mod.harman_single_factor_cmv(synth_df, all_cols)
        assert "error" not in result, f"Unexpected error: {result}"
        for key in ("first_eigenvalue_pct_variance", "below_50pct", "n_items_combined", "n_listwise"):
            assert key in result, f"Missing key: {key}"

    def test_variance_pct_in_range(self, synth_df):
        mod = _import_validation()
        all_cols = [f"B{i+1}" for i in range(5)] + \
                   [f"R{i+1}" for i in range(5)] + \
                   [f"M{i+1}" for i in range(5)]
        result = mod.harman_single_factor_cmv(synth_df, all_cols)
        pct = result["first_eigenvalue_pct_variance"]
        assert pct is not None
        assert 0 < pct < 100

    def test_below_50pct_flag(self, synth_df):
        """Synthetic 3-construct data should have PC1 < 50% (independent latent vars)."""
        mod = _import_validation()
        all_cols = [f"B{i+1}" for i in range(5)] + \
                   [f"R{i+1}" for i in range(5)] + \
                   [f"M{i+1}" for i in range(5)]
        result = mod.harman_single_factor_cmv(synth_df, all_cols)
        # Synthetic data with independent factors → CMV flag should be True (below 50%)
        assert result["below_50pct"] is True

    def test_n_items_matches_input(self, synth_df):
        mod = _import_validation()
        cols = [f"B{i+1}" for i in range(5)]
        result = mod.harman_single_factor_cmv(synth_df, cols)
        assert result["n_items_combined"] == 5

    def test_error_on_tiny_data(self):
        mod = _import_validation()
        tiny = pd.DataFrame({"x": [1.0]})
        result = mod.harman_single_factor_cmv(tiny, ["x"])
        assert "error" in result


# --------------------------------------------------------------------------- #
# Gap 5 — split_sample_cv() emits tucker_per_factor                           #
# --------------------------------------------------------------------------- #

class TestSplitSampleCvPerFactor:
    """Gap 5: split_sample_cv() must return tucker_per_factor sub-dict."""

    @requires_semopy
    def test_tucker_per_factor_present_when_cv_succeeds(self, synth_df):
        mod = _import_validation()
        barrier_cols_safe = [f"B{i+1}" for i in range(5)]
        # Use a simpler 2-factor definition so the 5-item data can support it
        three_group_def = {
            "F1": [0, 1, 2],
            "F2": [3, 4],
        }
        result = mod.split_sample_cv(synth_df, barrier_cols_safe, three_group_def, seed=42)
        if "error" in result:
            pytest.skip(f"split_sample_cv failed: {result['error']}")
        assert "tucker_per_factor" in result, "tucker_per_factor key missing from cv results"
        tpf = result["tucker_per_factor"]
        assert isinstance(tpf, dict)
        assert set(tpf.keys()) == {"F1", "F2"}
        for fact, val in tpf.items():
            if val is not None:
                assert isinstance(val, float), f"{fact} tucker should be float"
                assert -1.0 <= val <= 1.0, f"{fact} tucker {val} out of [-1,1]"

    def test_returns_error_without_semopy(self, synth_df):
        mod = _import_validation()
        orig = mod.HAS_SEMOPY
        mod.HAS_SEMOPY = False
        try:
            result = mod.split_sample_cv(synth_df, ["B1", "B2", "B3"], {"F1": [0, 1, 2]})
            assert "error" in result
        finally:
            mod.HAS_SEMOPY = orig


# --------------------------------------------------------------------------- #
# Gap 6 — _build_validation_registry()                                         #
# --------------------------------------------------------------------------- #

class TestBuildValidationRegistry:
    """Gap 6: _build_validation_registry() aggregates pass/fail counts correctly."""

    # ------------------------------------------------------------------
    # Helpers: pipeline-shaped dicts (as returned by validate_construct())
    # ------------------------------------------------------------------

    @staticmethod
    def _good_construct(name="Readiness"):
        """Pipeline-shaped construct result with all 10 criteria passing."""
        return {
            "construct": name,
            "cronbach_alpha": 0.85,
            "mcdonalds_omega": 0.85,
            "composite_reliability": 0.85,
            "ave_from_loadings": 0.60,
            "citc_flagged_below_030": [],
            "split_half_spearman_brown": 0.80,
            "efa": {"kmo_model": 0.75, "bartlett_p": 0.001},
            "cfa": {"cfi": 0.95, "rmsea": 0.05},
        }

    @staticmethod
    def _failing_construct(name="Barriers"):
        """Pipeline-shaped construct result with some criteria failing."""
        # alpha FAIL (0.65), citc FAIL (2 items flagged), kmo FAIL (0.55)
        # → 7/10 criteria pass
        return {
            "construct": name,
            "cronbach_alpha": 0.65,
            "mcdonalds_omega": 0.85,
            "composite_reliability": 0.85,
            "ave_from_loadings": 0.60,
            "citc_flagged_below_030": ["B1", "B2"],
            "split_half_spearman_brown": 0.75,
            "efa": {"kmo_model": 0.55, "bartlett_p": 0.001},
            "cfa": {"cfi": 0.95, "rmsea": 0.07},
        }

    # ------------------------------------------------------------------
    # Tests
    # ------------------------------------------------------------------

    def test_returns_expected_keys(self):
        mod = _import_validation()
        reg = mod._build_validation_registry(
            [self._good_construct()], last_run_utc="2026-05-03T00:00:00"
        )
        for key in ("total_checks", "passed", "failed", "pass_rate_pct", "categories", "last_run_utc"):
            assert key in reg, f"Missing key: {key}"

    def test_pipeline_shaped_inputs_no_verdicts_key(self):
        """Registry must work with actual validate_construct() output — no 'verdicts' sub-dict."""
        mod = _import_validation()
        cr = self._good_construct("Barriers")
        # Confirm input has NO pre-existing 'verdicts' key (the bug that was filed)
        assert "verdicts" not in cr, "Test fixture should not have a 'verdicts' key"
        reg = mod._build_validation_registry([cr], last_run_utc="now")
        assert reg["total_checks"] > 0, "Expected at least one criterion to be counted"
        assert reg["passed"] > 0, "Expected at least one criterion to pass"

    def test_all_pass_for_good_construct(self):
        """Good construct (all thresholds met) should yield passed == total_checks."""
        mod = _import_validation()
        reg = mod._build_validation_registry(
            [self._good_construct()], last_run_utc="now"
        )
        assert reg["passed"] == reg["total_checks"]
        assert reg["failed"] == 0
        assert reg["pass_rate_pct"] == 100.0

    def test_totals_are_correct_mixed(self):
        """Failing construct (alpha/citc/kmo below threshold) reduces pass count."""
        mod = _import_validation()
        # _failing_construct: 7/10 pass; _good_construct: 10/10 pass
        construct_results = [
            self._failing_construct("Barriers"),
            self._good_construct("Readiness"),
        ]
        reg = mod._build_validation_registry(construct_results, last_run_utc="now")
        # Good: 10, Failing: 7 → passed=17, total=20, failed=3
        assert reg["total_checks"] == 20
        assert reg["passed"] == 17
        assert reg["failed"] == 3

    def test_categories_match_construct_names(self):
        mod = _import_validation()
        cr = self._good_construct("Barriers")
        reg = mod._build_validation_registry([cr], last_run_utc="now")
        assert "Barriers" in reg["categories"]

    def test_categories_contain_pass_and_total(self):
        mod = _import_validation()
        cr = self._good_construct("Maturity")
        reg = mod._build_validation_registry([cr], last_run_utc="now")
        cat = reg["categories"]["Maturity"]
        assert "pass_count" in cat
        assert "total_criteria" in cat
        assert isinstance(cat["pass_count"], int)
        assert isinstance(cat["total_criteria"], int)

    def test_empty_construct_results(self):
        mod = _import_validation()
        reg = mod._build_validation_registry([], last_run_utc="now")
        assert reg["total_checks"] == 0
        assert reg["passed"] == 0
        assert reg["pass_rate_pct"] is None

    def test_none_metrics_dont_inflate_total(self):
        """When optional metrics (e.g. CFA) are absent, total_criteria stays ≤ 10."""
        mod = _import_validation()
        # Construct without CFA: cfa_cfi and cfa_rmsea criteria are None
        cr = {
            "construct": "Maturity",
            "cronbach_alpha": 0.85,
            "mcdonalds_omega": 0.85,
            "composite_reliability": 0.85,
            "ave_from_loadings": 0.60,
            "citc_flagged_below_030": [],
            "split_half_spearman_brown": 0.80,
            "efa": {"kmo_model": 0.75, "bartlett_p": 0.001},
            # No 'cfa' key
        }
        reg = mod._build_validation_registry([cr], last_run_utc="now")
        cat = reg["categories"]["Maturity"]
        # 10 criteria defined, 2 are None (no CFA) → total_criteria == 8
        assert cat["total_criteria"] == 8
        assert cat["pass_count"] <= cat["total_criteria"]


# --------------------------------------------------------------------------- #
# Gap 7 — _build_r_parity_tests()                                              #
# --------------------------------------------------------------------------- #

class TestBuildRParityTests:
    """Gap 7: _build_r_parity_tests() derives count from the live parity test file."""

    def test_returns_expected_keys(self):
        mod = _import_validation()
        result = mod._build_r_parity_tests(last_run_utc="2026-05-03T00:00:00")
        for key in ("count", "ci_workflow", "last_run_utc", "all_passing"):
            assert key in result, f"Missing key: {key}"

    def test_count_reflects_actual_parity_file(self):
        """count must match the number of def test_ functions in the parity file."""
        import re as _re
        mod = _import_validation()
        result = mod._build_r_parity_tests(last_run_utc="now")
        parity_file = (
            Path(__file__).parent / "test_parity_to_published_formulas.py"
        )
        if parity_file.exists():
            source = parity_file.read_text(encoding="utf-8")
            expected = len(_re.findall(r"^def test_", source, _re.MULTILINE))
            assert result["count"] == expected, (
                f"count={result['count']} but file has {expected} tests; "
                "update _build_r_parity_tests() or add/remove tests consistently"
            )
        else:
            # File not found — count falls back to a non-zero integer
            assert isinstance(result["count"], int)
            assert result["count"] > 0

    def test_count_is_positive_integer(self):
        """count should always be a positive integer regardless of environment."""
        mod = _import_validation()
        result = mod._build_r_parity_tests(last_run_utc="now")
        assert isinstance(result["count"], int)
        assert result["count"] > 0

    def test_all_passing_is_none_by_default(self):
        """all_passing should start as None (populated by CI at runtime)."""
        mod = _import_validation()
        result = mod._build_r_parity_tests(last_run_utc="now")
        assert result["all_passing"] is None

    def test_custom_workflow_path(self):
        mod = _import_validation()
        result = mod._build_r_parity_tests(
            ci_workflow=".github/workflows/custom.yml",
            last_run_utc="now"
        )
        assert result["ci_workflow"] == ".github/workflows/custom.yml"
