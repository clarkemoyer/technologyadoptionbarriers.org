"""Tests for the count_bool_true helper used by run_validation().

Exercises the *production* counting function directly so that a regression
(e.g. reverting to ``val is True``) will break the suite.
See: https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/1471
"""

import sys
import os

import numpy as np

# Allow importing from the parent scripts/analysis directory
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from tabs_v2_unified_data_analysis import count_bool_true  # noqa: E402


class TestCountBoolTrue:
    """Unit tests for count_bool_true (production helper)."""

    def test_native_python_bools(self):
        """Native Python True values are counted."""
        assert count_bool_true({"a": True, "b": False, "c": True}) == 2

    def test_numpy_bool_true_counted(self):
        """numpy.bool_(True) values are counted."""
        assert count_bool_true({
            "x": np.bool_(True),
            "y": np.bool_(False),
            "z": np.bool_(True),
        }) == 2

    def test_mixed_bool_and_numpy_bool(self):
        """Mixed bool and numpy.bool_ values are all counted correctly."""
        v = {
            "alpha_above_070": np.bool_(True),
            "omega_above_070": np.bool_(True),
            "cr_above_070": np.bool_(True),
            "ave_above_050": np.bool_(False),
            "itc_all_above_030": True,
            "split_half_above_070": np.bool_(True),
            "kmo_above_060": np.bool_(True),
            "bartlett_significant": np.bool_(True),
            "cfa_cfi_above_090": np.bool_(False),
        }
        assert count_bool_true(v) == 7

    def test_non_bool_truthy_values_excluded(self):
        """int(1), float(1.0), np.int64(1) must NOT be counted."""
        v = {
            "a": np.bool_(True),
            "b": 1,               # int - truthy but not bool
            "c": 1.0,             # float - truthy but not bool
            "d": np.int64(1),     # numpy int - truthy but not bool
            "e": np.bool_(False),
        }
        assert count_bool_true(v) == 1  # only np.bool_(True)

    def test_all_false_returns_zero(self):
        """All False values give count 0."""
        assert count_bool_true({
            "a": False,
            "b": np.bool_(False),
        }) == 0

    def test_empty_dict_returns_zero(self):
        """Empty dict gives count 0."""
        assert count_bool_true({}) == 0

    def test_string_values_excluded(self):
        """String values must not be counted even if truthy."""
        assert count_bool_true({"a": "true", "b": "True", "c": True}) == 1


class TestNumpyBoolSemantics:
    """Document the Python/numpy boolean behaviors that motivate the helper."""

    def test_numpy_bool_identity_vs_equality(self):
        """numpy.bool_(True) fails 'is True' but passes '== True'."""
        result = np.bool_(True)
        assert result == True  # noqa: E712
        assert result is not True

    def test_numpy_comparison_produces_numpy_bool(self):
        """Comparisons on numpy floats produce numpy.bool_, not Python bool."""
        val = round(np.float64(0.8728), 4)
        result = val >= 0.70
        assert isinstance(result, (bool, np.bool_))
        assert result == True  # noqa: E712
        if isinstance(result, np.bool_):
            assert result is not True
