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

import contextlib
import re
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


def _import_unified():
    """Import tabs_v2_unified_data_analysis for integration tests against production pipeline."""
    with patch.object(sys, "argv", ["test", "/dev/null"]):
        mname = "tabs_v2_unified_data_analysis"
        if mname in sys.modules:
            del sys.modules[mname]
        import tabs_v2_unified_data_analysis as mod  # noqa: PLC0415
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
        reg = mod._build_validation_registry([self._good_construct()])
        for key in ("total_checks", "passed", "failed", "pass_rate_pct", "categories", "last_run_utc"):
            assert key in reg, f"Missing key: {key}"

    def test_last_run_utc_is_utc_iso_string(self):
        """last_run_utc must always be a non-empty ISO-8601 string with UTC offset."""
        from datetime import datetime
        mod = _import_validation()
        reg = mod._build_validation_registry([self._good_construct()])
        ts = reg["last_run_utc"]
        assert isinstance(ts, str), "last_run_utc must be a string"
        assert len(ts) > 0, "last_run_utc must not be empty"
        # Must parse as a valid ISO timestamp (includes +00:00 from pd.Timestamp.now('UTC'))
        try:
            datetime.fromisoformat(ts)
        except ValueError:
            raise AssertionError(f"last_run_utc is not a valid ISO timestamp: {ts!r}")
        # Must indicate UTC via +00:00 suffix (not naive local time)
        assert ts.endswith('+00:00') or ts.endswith('Z'), (
            f"last_run_utc should be UTC (ending in '+00:00' or 'Z'), got: {ts!r}"
        )

    def test_pipeline_shaped_inputs_no_verdicts_key(self):
        """Registry must work with actual validate_construct() output — no 'verdicts' sub-dict."""
        mod = _import_validation()
        cr = self._good_construct("Barriers")
        # Confirm input has NO pre-existing 'verdicts' key (the bug that was filed)
        assert "verdicts" not in cr, "Test fixture should not have a 'verdicts' key"
        reg = mod._build_validation_registry([cr])
        assert reg["total_checks"] > 0, "Expected at least one criterion to be counted"
        assert reg["passed"] > 0, "Expected at least one criterion to pass"

    def test_all_pass_for_good_construct(self):
        """Good construct (all thresholds met) should yield passed == total_checks."""
        mod = _import_validation()
        reg = mod._build_validation_registry([self._good_construct()])
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
        reg = mod._build_validation_registry(construct_results)
        # Good: 10, Failing: 7 → passed=17, total=20, failed=3
        assert reg["total_checks"] == 20
        assert reg["passed"] == 17
        assert reg["failed"] == 3

    def test_categories_match_construct_names(self):
        mod = _import_validation()
        cr = self._good_construct("Barriers")
        reg = mod._build_validation_registry([cr])
        assert "Barriers" in reg["categories"]

    def test_categories_contain_pass_and_total(self):
        mod = _import_validation()
        cr = self._good_construct("Maturity")
        reg = mod._build_validation_registry([cr])
        cat = reg["categories"]["Maturity"]
        assert "pass_count" in cat
        assert "total_criteria" in cat
        assert isinstance(cat["pass_count"], int)
        assert isinstance(cat["total_criteria"], int)

    def test_empty_construct_results(self):
        mod = _import_validation()
        reg = mod._build_validation_registry([])
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
        reg = mod._build_validation_registry([cr])
        cat = reg["categories"]["Maturity"]
        # 10 criteria defined, 2 are None (no CFA) → total_criteria == 8
        assert cat["total_criteria"] == 8
        assert cat["pass_count"] <= cat["total_criteria"]

    def test_subgroup_standalone_adds_to_total(self):
        """Subgroup standalone verdicts must be included in total_checks."""
        mod = _import_validation()
        subgroup_standalone = {
            "3group_canonical": [
                {
                    "name": "F1a",
                    "verdict": {
                        "parallel_analysis_unidimensional": True,
                        "alpha_above_070": True,
                        "cfi_above_090": True,
                        "rmsea_below_008": True,
                        "overall_pass": True,
                    },
                },
                {
                    "name": "F2",
                    "verdict": {
                        "parallel_analysis_unidimensional": True,
                        "alpha_above_070": False,
                        "cfi_above_090": True,
                        "rmsea_below_008": True,
                        "overall_pass": False,
                    },
                },
            ]
        }
        # Without subgroup: 10 checks
        reg_no_sg = mod._build_validation_registry([self._good_construct()])
        # With subgroup: 10 + 4 + 4 = 18 checks
        reg_with_sg = mod._build_validation_registry(
            [self._good_construct()], subgroup_standalone=subgroup_standalone
        )
        assert reg_with_sg["total_checks"] == reg_no_sg["total_checks"] + 8
        # F1a: 4/4 pass; F2: 3/4 pass → subgroup_passed = 7
        assert reg_with_sg["passed"] == reg_no_sg["passed"] + 7

    def test_subgroup_too_few_items_skipped(self):
        """Subgroup with no boolean verdict criteria (too_few_items) must not inflate total."""
        mod = _import_validation()
        subgroup_standalone = {
            "4group_theoretical": [
                {
                    "name": "OrgCultural",
                    "verdict": {"overall_pass": False, "reason": "too_few_items"},
                },
                {
                    "name": "Strategic",
                    "verdict": {
                        "parallel_analysis_unidimensional": True,
                        "alpha_above_070": True,
                        "cfi_above_090": True,
                        "rmsea_below_008": True,
                        "overall_pass": True,
                    },
                },
            ]
        }
        reg = mod._build_validation_registry([], subgroup_standalone=subgroup_standalone)
        # OrgCultural has no boolean criteria → skipped; Strategic has 4 → total=4
        assert reg["total_checks"] == 4
        assert "subgroup/4group_theoretical/OrgCultural" not in reg["categories"]
        assert "subgroup/4group_theoretical/Strategic" in reg["categories"]

    def test_subgroup_category_keys_use_namespaced_names(self):
        """Subgroup categories must be namespaced to avoid collision with top-level construct names."""
        mod = _import_validation()
        subgroup_standalone = {
            "3group_canonical": [
                {
                    "name": "F1a",
                    "verdict": {
                        "parallel_analysis_unidimensional": True,
                        "alpha_above_070": True,
                        "cfi_above_090": True,
                        "rmsea_below_008": True,
                        "overall_pass": True,
                    },
                }
            ]
        }
        reg = mod._build_validation_registry([], subgroup_standalone=subgroup_standalone)
        assert "subgroup/3group_canonical/F1a" in reg["categories"]
        assert "F1a" not in reg["categories"]


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
        mod = _import_validation()
        result = mod._build_r_parity_tests(last_run_utc="now")
        parity_file = (
            Path(__file__).parent / "test_parity_to_published_formulas.py"
        )
        if parity_file.exists():
            source = parity_file.read_text(encoding="utf-8")
            expected = len(re.findall(r"^def test_", source, re.MULTILINE))
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


# --------------------------------------------------------------------------- #
# Integration — unified pipeline (canonical crp-validation.json source)        #
# --------------------------------------------------------------------------- #


class TestUnifiedPipelineGapFunctions:
    """Verify that gap helper functions exist and produce correct output in
    tabs_v2_unified_data_analysis, which is the module that generates the
    canonical crp-validation.json in the daily pipeline.

    These tests do NOT call run_validation() (which is expensive); instead they
    call each gap helper directly from the unified module to confirm the
    functions are present and return the expected schema.
    """

    def test_henze_zirkler_normality_exists_in_unified(self):
        """Gap 2 helper must be present in the unified pipeline module."""
        mod = _import_unified()
        assert hasattr(mod, "henze_zirkler_normality"), (
            "henze_zirkler_normality is missing from tabs_v2_unified_data_analysis"
        )

    @requires_pingouin
    def test_henze_zirkler_normality_returns_schema_from_unified(self):
        """Gap 2 — unified henze_zirkler_normality() returns the expected keys."""
        mod = _import_unified()
        rng = np.random.default_rng(42)
        data = pd.DataFrame(rng.standard_normal((60, 4)))
        result = mod.henze_zirkler_normality(data)
        for key in ("hz", "p_value", "normal"):
            assert key in result, f"Missing key '{key}' in henze_zirkler_normality output"

    def test_t_tests_smb_vs_enterprise_exists_in_unified(self):
        """Gap 3 helper must be present in the unified pipeline module."""
        mod = _import_unified()
        assert hasattr(mod, "t_tests_smb_vs_enterprise"), (
            "t_tests_smb_vs_enterprise is missing from tabs_v2_unified_data_analysis"
        )

    def test_t_tests_smb_vs_enterprise_returns_schema_from_unified(self):
        """Gap 3 — unified t_tests_smb_vs_enterprise() returns the expected structure."""
        mod = _import_unified()
        rng = np.random.default_rng(42)
        n = 80
        df = pd.DataFrame({
            "B1": rng.integers(1, 6, n).astype(float),
            "B2": rng.integers(1, 6, n).astype(float),
            "_SMB": (rng.random(n) > 0.5).astype(int),
        })
        result = mod.t_tests_smb_vs_enterprise(df, {"Barriers": ["B1", "B2"]}, smb_col="_SMB")
        assert "constructs" in result
        assert "Barriers" in result["constructs"]
        assert "t" in result["constructs"]["Barriers"]

    def test_harman_single_factor_cmv_exists_in_unified(self):
        """Gap 4 helper must be present in the unified pipeline module."""
        mod = _import_unified()
        assert hasattr(mod, "harman_single_factor_cmv"), (
            "harman_single_factor_cmv is missing from tabs_v2_unified_data_analysis"
        )

    def test_harman_single_factor_cmv_returns_schema_from_unified(self):
        """Gap 4 — unified harman_single_factor_cmv() returns the expected keys."""
        mod = _import_unified()
        rng = np.random.default_rng(42)
        n = 80
        cols = [f"X{i}" for i in range(8)]
        df = pd.DataFrame(rng.standard_normal((n, 8)), columns=cols)
        result = mod.harman_single_factor_cmv(df, cols)
        assert "first_eigenvalue_pct_variance" in result
        assert "below_50pct" in result

    def test_build_validation_registry_exists_in_unified(self):
        """Gap 6 helper must be present in the unified pipeline module."""
        mod = _import_unified()
        assert hasattr(mod, "_build_validation_registry"), (
            "_build_validation_registry is missing from tabs_v2_unified_data_analysis"
        )

    def test_build_validation_registry_from_unified_no_verdicts_key(self):
        """Gap 6 — unified registry must derive verdicts from raw construct output,
        not from a 'verdicts' sub-dict (which validate_construct() never adds)."""
        mod = _import_unified()
        # Shape matches actual validate_construct() output (no 'verdicts' key)
        construct_result = {
            "construct": "Barriers",
            "cronbach_alpha": 0.85,
            "alpha_95ci": [0.82, 0.88],
            "n_valid_listwise": 200,
            "mcdonalds_omega": 0.87,
            "composite_reliability": 0.88,
            "ave_from_loadings": 0.52,
            "split_half_spearman_brown": 0.83,
            "citc_flagged_below_030": [],
            "efa": {"kmo_model": 0.85, "bartlett_p": 0.0001},
            "cfa": {"cfi": 0.95, "rmsea": 0.05},
        }
        assert "verdicts" not in construct_result, (
            "Test input must not have a 'verdicts' key — "
            "that would make the test trivially pass the wrong way"
        )
        reg = mod._build_validation_registry([construct_result])
        assert reg["total_checks"] >= 1
        assert reg["passed"] >= 0
        assert "pass_rate_pct" in reg
        assert "last_run_utc" in reg

    def test_build_r_parity_tests_exists_in_unified(self):
        """Gap 7 helper must be present in the unified pipeline module."""
        mod = _import_unified()
        assert hasattr(mod, "_build_r_parity_tests"), (
            "_build_r_parity_tests is missing from tabs_v2_unified_data_analysis"
        )

    def test_build_r_parity_tests_fallback_count_updated(self):
        """Gap 7 — fallback count must equal the actual number of tests in the parity file."""
        mod = _import_unified()
        parity_file = Path(__file__).parent / "test_parity_to_published_formulas.py"
        if parity_file.exists():
            source = parity_file.read_text(encoding="utf-8")
            expected = len(re.findall(r"^def test_", source, re.MULTILINE))
            result = mod._build_r_parity_tests()
            assert result["count"] == expected, (
                f"Unified _build_r_parity_tests() returned count={result['count']} "
                f"but parity file has {expected} tests. "
                "Update _FALLBACK_COUNT in tabs_v2_unified_data_analysis.py."
            )

    def test_run_validation_output_contains_gap_keys(self):
        """run_validation() output must contain all 7 gap-stat keys so that
        crp-validation.json generated by the daily pipeline includes them.

        This test uses a minimal synthetic DataFrame and mocks out all
        expensive sub-calls so the test completes in < 1 s.
        """
        mod = _import_unified()
        rng = np.random.default_rng(42)
        n = 60
        df_data = {}
        for col in mod.BARRIER_COLS:
            df_data[col] = rng.integers(1, 6, n).astype(float)
        for col in mod.READINESS_COLS:
            df_data[col] = rng.integers(1, 6, n).astype(float)
        for col in mod.MATURITY_COLS:
            df_data[col] = rng.integers(1, 6, n).astype(float)
        df_data["Q4_OrgSize"] = rng.choice(
            ["<100", "100-499", "1000-4999", "10000+"], n
        )
        df = pd.DataFrame(df_data)

        # Patch the most expensive sub-calls so the test is fast
        _dummy_cfa = {"cfi": 0.96, "rmsea": 0.04, "chi2": 10.0, "df": 5,
                      "chi2_p": 0.05, "tli": 0.95, "srmr": 0.04}
        _dummy_validate = {
            "construct": "Barriers",
            "cronbach_alpha": 0.85,
            "alpha_95ci": [0.82, 0.88],
            "n_valid_listwise": n,
            "mcdonalds_omega": 0.87,
            "composite_reliability": 0.88,
            "ave_from_loadings": 0.52,
            "split_half_spearman_brown": 0.83,
            "citc_flagged_below_030": [],
            "efa": {"kmo_model": 0.85, "bartlett_p": 1e-4, "n_factors": 1,
                    "eigenvalues_original": [3.5], "variance_explained": {"per_factor": [0.52], "total": 0.52},
                    "loadings": {}, "factor_correlations": None},
            "cfa": _dummy_cfa,
            "inter_item_correlations": {"mean": 0.4, "min": 0.2, "max": 0.6, "sd": 0.1},
        }

        def _fake_validate(df_, cols, names, label, **kw):
            return dict(_dummy_validate, construct=label)

        def _fake_run_cfa(*a, **kw):
            return dict(_dummy_cfa)

        patches = [
            patch.object(mod, "validate_construct", side_effect=_fake_validate),
            patch.object(mod, "run_cfa", side_effect=_fake_run_cfa),
            patch.object(mod, "run_cfa_dwls", side_effect=_fake_run_cfa),
            patch.object(mod, "bifactor_rm", return_value={"error": "mocked"}),
            patch.object(mod, "second_order_barriers_cfa", return_value={"error": "mocked"}),
            patch.object(mod, "mardia_multivariate_normality", return_value={"error": "mocked"}),
            patch.object(mod, "mahalanobis_outliers", return_value={"error": "mocked"}),
            patch.object(mod, "split_sample_cv", return_value={"tucker_congruence": 0.99}),
            patch.object(mod, "irt_grm", return_value={"error": "mocked"}),
            patch.object(mod, "per_factor_regressions", return_value={"error": "mocked"}),
            patch.object(mod, "subgroup_standalone_validation", return_value=[]),
            patch.object(mod, "mediation_b_r_m", return_value={"error": "mocked"}),
            patch.object(mod, "standardized_subfactor_regressions", return_value={"error": "mocked"}),
            patch.object(mod, "bootstrap_alpha_ci", return_value={"error": "mocked"}),
            patch.object(mod, "item_level_cohens_d_smb", return_value={}),
            patch.object(mod, "reliability_by_demo", return_value={}),
            patch.object(mod, "power_analysis", return_value={"error": "mocked"}),
            patch.object(mod, "equivalence_test_smb_ent", return_value={"error": "mocked"}),
            patch.object(mod, "bifactor_barriers", return_value={"error": "mocked"}),
            patch.object(mod, "multigroup_3f_sem", return_value={"error": "mocked"}),
            patch.object(mod, "measurement_invariance_approximate", return_value={"error": "mocked"}),
            patch.object(mod, "dif_irt", return_value={"error": "mocked"}),
            patch.object(mod, "esem_target_rotation", return_value={"error": "mocked"}),
            patch.object(mod, "htmt_bootstrap_ci", return_value=(0.60, (0.50, 0.70))),
            patch.object(mod, "htmt2_ratio", return_value=0.61),
            patch.object(mod, "subgroup_discriminant", return_value={"htmt": [], "fornell_larcker": []}),
            patch.object(mod, "alpha_if_deleted_summary", return_value=[]),
            patch.object(mod, "item_level_validity", return_value=[]),
            patch.object(mod, "compare_cfa_models", return_value=[]),
        ]

        with contextlib.ExitStack() as stack:
            for p in patches:
                stack.enter_context(p)
            result = mod.run_validation(df, primary_sample=True)

        # Gap 2
        assert "henze_zirkler_normality" in result, \
            "henze_zirkler_normality missing from run_validation() output"
        # Gap 3
        assert "inferential" in result, "inferential missing from run_validation() output"
        assert "t_tests_smb_vs_enterprise" in result["inferential"], \
            "t_tests_smb_vs_enterprise missing from inferential block"
        # Gap 4
        assert "cmv" in result, "cmv missing from run_validation() output"
        assert "harman_single_factor" in result["cmv"], \
            "harman_single_factor missing from cmv block"
        # Gap 6
        assert "validation_registry" in result, \
            "validation_registry missing from run_validation() output"
        assert "total_checks" in result["validation_registry"]
        assert "pass_rate_pct" in result["validation_registry"]
        # Gap 7
        assert "r_parity_tests" in result, \
            "r_parity_tests missing from run_validation() output"
        assert "count" in result["r_parity_tests"]
