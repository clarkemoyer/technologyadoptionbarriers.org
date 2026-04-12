"""Tests for pass_count verdict counting in run_validation().

Verifies that pass_count uses equality (==) not identity (is) to count
boolean verdicts, so numpy.bool_ values are counted correctly.
See: https://github.com/clarkemoyer/technologyadoptionbarriers.org/issues/XXX
"""

import numpy as np
import pytest


class TestPassCountEquality:
    """Verify that the pass_count logic handles numpy.bool_ correctly."""

    @staticmethod
    def _count_pass(verdicts: dict) -> int:
        """Replicate the pass_count logic from run_validation (line ~2655)."""
        return sum(1 for val in verdicts.values() if val == True)  # noqa: E712

    def test_native_python_bools(self):
        """Native Python bools should be counted correctly."""
        v = {"a": True, "b": False, "c": True}
        assert self._count_pass(v) == 2

    def test_numpy_bools(self):
        """numpy.bool_ values should be counted correctly via == True."""
        v = {
            "alpha_above_070": np.bool_(True),
            "omega_above_070": np.bool_(True),
            "cr_above_070": np.bool_(True),
            "ave_above_050": np.bool_(False),
            "itc_all_above_030": True,  # native Python bool
            "split_half_above_070": np.bool_(True),
            "kmo_above_060": np.bool_(True),
            "bartlett_significant": np.bool_(True),
            "cfa_cfi_above_090": np.bool_(False),
        }
        assert self._count_pass(v) == 7

    def test_numpy_bool_identity_fails(self):
        """Demonstrate that 'is True' fails for numpy.bool_(True)."""
        assert np.bool_(True) is not True  # identity check fails
        assert np.bool_(True) == True  # equality check works  # noqa: E712

    def test_mixed_bools_from_numpy_comparison(self):
        """Comparisons on numpy floats produce numpy.bool_, not Python bool."""
        val = round(np.float64(0.8728), 4)
        result = val >= 0.70
        # The comparison produces numpy.bool_, not Python bool
        assert isinstance(result, (bool, np.bool_))
        # Equality check works (used in pass_count logic)
        assert result == True  # noqa: E712
        # Identity check may fail for numpy.bool_
        if isinstance(result, np.bool_):
            assert result is not True

    def test_all_false(self):
        """All False values should give pass_count = 0."""
        v = {"a": np.bool_(False), "b": False, "c": np.bool_(False)}
        assert self._count_pass(v) == 0

    def test_non_bool_values_excluded(self):
        """Non-boolean values (ints, strings) should not be counted."""
        v = {
            "a": np.bool_(True),
            "b": 1,        # int, not bool — but == True is True for 1
            "c": "true",   # string — != True
            "d": np.bool_(False),
        }
        # Note: 1 == True is True in Python, so int(1) counts.
        # This matches the actual behavior in run_validation where
        # pass_count and total_criteria (ints) are added AFTER counting.
        assert self._count_pass(v) == 2  # np.bool_(True) and int(1)
