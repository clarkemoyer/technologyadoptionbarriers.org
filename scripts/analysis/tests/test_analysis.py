"""Tests for tabs_v2_analysis.py — statistical functions and sample filtering."""

import math
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from tabs_v2_analysis import (
    mean_sd,
    pearson_r,
    cohens_d,
    cronbach_alpha,
    skewness,
    kurtosis_excess,
    score,
    get_duration,
    iri_correct_count,
    iri_all_pass,
    person_means,
    get_recaptcha_score,
    get_straightlining_count,
    within_person_sd,
    has_partial_straightlining,
    is_finished,
    get_role,
    org_bucket,
    load_data,
    filter_samples,
    sensitivity_to_json,
    welch_t_test,
    oneway_anova,
    BARRIER_SCALE,
    READINESS_SCALE,
    MATURITY_SCALE,
    BARRIER_COLS,
    READINESS_COLS,
    MATURITY_COLS,
    BARRIER_IRI,
    READINESS_IRI,
    MATURITY_IRI,
)


# ── mean_sd ─────────────────────────────────────────────────

class TestMeanSD:
    def test_basic(self):
        m, s = mean_sd([2, 4, 6])
        assert m == pytest.approx(4.0)
        assert s == pytest.approx(2.0)

    def test_single_value(self):
        m, s = mean_sd([5])
        assert m == 5.0
        assert s == 0.0

    def test_empty(self):
        m, s = mean_sd([])
        assert m is None
        assert s is None

    def test_filters_none(self):
        m, s = mean_sd([1, None, 3])
        assert m == pytest.approx(2.0)

    def test_all_same(self):
        m, s = mean_sd([3, 3, 3, 3])
        assert m == 3.0
        assert s == 0.0


# ── pearson_r ────────────────────────────────────────────────

class TestPearsonR:
    def test_perfect_positive(self):
        r = pearson_r([1, 2, 3, 4, 5], [2, 4, 6, 8, 10])
        assert r == pytest.approx(1.0)

    def test_perfect_negative(self):
        r = pearson_r([1, 2, 3, 4, 5], [10, 8, 6, 4, 2])
        assert r == pytest.approx(-1.0)

    def test_insufficient_data(self):
        assert pearson_r([1, 2], [3, 4]) is None

    def test_filters_none(self):
        r = pearson_r([1, None, 3, 4, 5], [2, 99, 6, 8, 10])
        # Only pairs where both non-None: (1,2), (3,6), (4,8), (5,10)
        assert r == pytest.approx(1.0)

    def test_zero_variance(self):
        assert pearson_r([5, 5, 5], [1, 2, 3]) is None


# ── cohens_d ─────────────────────────────────────────────────

class TestCohensD:
    def test_identical_groups(self):
        d = cohens_d([5, 5, 5], [5, 5, 5])
        # Zero difference but also zero pooled SD
        assert d is None

    def test_large_effect(self):
        d = cohens_d([10, 11, 12], [1, 2, 3])
        assert d is not None
        assert abs(d) > 0.8  # large effect

    def test_insufficient_data(self):
        assert cohens_d([5], [3]) is None


# ── cronbach_alpha ───────────────────────────────────────────

class TestCronbachAlpha:
    def test_high_reliability(self):
        # All items perfectly correlated
        idx = {"A": 0, "B": 1, "C": 2}
        scale = {"low": 1, "mid": 3, "high": 5}
        rows = [
            ["low", "low", "low"],
            ["mid", "mid", "mid"],
            ["high", "high", "high"],
        ]
        alpha = cronbach_alpha(rows, ["A", "B", "C"], scale, idx)
        assert alpha is not None
        assert alpha > 0.95

    def test_insufficient_data(self):
        idx = {"A": 0}
        scale = {"x": 1}
        assert cronbach_alpha([["x"], ["x"]], ["A"], scale, idx) is None


# ── skewness and kurtosis ───────────────────────────────────

class TestDistribution:
    def test_symmetric(self):
        vals = [1, 2, 3, 4, 5]
        sk = skewness(vals)
        assert sk is not None
        assert abs(sk) < 0.5

    def test_insufficient(self):
        assert skewness([1, 2]) is None
        assert kurtosis_excess([1, 2, 3]) is None


# ── Data helpers ─────────────────────────────────────────────

class TestDataHelpers:
    def test_score(self):
        idx = {"col": 0}
        assert score(["Major Barrier"], "col", BARRIER_SCALE, idx) == 5
        assert score(["Not a Barrier"], "col", BARRIER_SCALE, idx) == 1
        assert score(["invalid"], "col", BARRIER_SCALE, idx) is None

    def test_get_duration(self):
        idx = {"Duration (in seconds)": 0}
        assert get_duration(["600"], idx) == 600
        assert get_duration(["bad"], idx) is None

    def test_iri_correct_count(self):
        idx = {BARRIER_IRI: 0, READINESS_IRI: 1, MATURITY_IRI: 2}
        row_all_pass = ["Major Barrier", "Low Readiness/Capability", "Level 2: Developing/Repeatable"]
        assert iri_correct_count(row_all_pass, idx) == 3
        assert iri_all_pass(row_all_pass, idx) is True

        row_one_fail = ["Major Barrier", "Wrong", "Level 2: Developing/Repeatable"]
        assert iri_correct_count(row_one_fail, idx) == 2
        assert iri_all_pass(row_one_fail, idx) is False

        row_all_fail = ["Wrong", "Wrong", "Wrong"]
        assert iri_correct_count(row_all_fail, idx) == 0

    def test_get_recaptcha_score(self):
        idx = {"Q_RecaptchaScore": 0}
        assert get_recaptcha_score(["0.9"], idx) == 0.9
        assert get_recaptcha_score([""], idx) == 1.0  # default
        assert get_recaptcha_score(["bad"], idx) == 1.0

    def test_get_recaptcha_missing_column(self):
        assert get_recaptcha_score(["anything"], {}) == 1.0

    def test_get_straightlining_count(self):
        idx = {"Q_StraightliningCount": 0}
        assert get_straightlining_count(["3"], idx) == 3
        assert get_straightlining_count([""], idx) == 0
        assert get_straightlining_count(["0"], idx) == 0

    def test_get_straightlining_missing_column(self):
        assert get_straightlining_count(["anything"], {}) == 0

    def test_is_finished(self):
        idx = {"Finished": 0}
        assert is_finished(["TRUE"], idx) is True
        assert is_finished(["1"], idx) is True
        assert is_finished(["FALSE"], idx) is False
        assert is_finished(["0"], idx) is False
        # Missing column defaults to True (legacy test data)
        assert is_finished(["anything"], {}) is True

    def test_get_role(self):
        idx = {"Q1_Role": 0}
        assert get_role(["CIO (e.g., Director of IT)"], idx) == "CIO"
        assert get_role(["Unknown Role"], idx) == "Unknown"

    def test_org_bucket(self):
        idx = {"Q4_OrgSize": 0}
        assert org_bucket(["<100"], idx) == "Small (<500)"
        assert org_bucket(["100-499"], idx) == "Small (<500)"
        assert org_bucket(["500-999"], idx) == "Medium (500-4999)"
        assert org_bucket(["1000-4999"], idx) == "Medium (500-4999)"
        assert org_bucket(["5000-9999"], idx) == "Large (5000+)"
        assert org_bucket(["10000+"], idx) == "Large (5000+)"
        assert org_bucket(["unknown"], idx) is None


# ── within_person_sd ─────────────────────────────────────────

class TestWithinPersonSD:
    def test_all_same(self):
        sd = within_person_sd(["A", "A", "A", "A"])
        assert sd == 0.0

    def test_two_values(self):
        sd = within_person_sd(["A", "B", "A", "B"])
        assert sd > 0

    def test_insufficient(self):
        assert math.isnan(within_person_sd(["A"]))
        assert math.isnan(within_person_sd([""]))
        assert math.isnan(within_person_sd([]))

    def test_empty_strings_filtered(self):
        sd = within_person_sd(["A", "", "A", ""])
        assert sd == 0.0  # all non-empty are "A"


# ── has_partial_straightlining ──────────────────────────────

class TestPartialStraightlining:
    def test_no_straightlining(self):
        # Varied responses across all 5 scale values in each block
        all_barrier_vals = ["Not a Barrier", "Minor Barrier", "Moderate Barrier", "Significant Barrier", "Major Barrier"]
        all_readiness_vals = ["Very Low Readiness/Capability", "Low Readiness/Capability", "Moderate Readiness/Capability", "High Readiness/Capability", "Very High Readiness/Capability"]
        all_maturity_vals = ["Level 1: Initial/Ad Hoc", "Level 2: Developing/Repeatable", "Level 3: Defined/Standardized", "Level 4: Managed/Quantitatively Managed", "Level 5: Optimizing/Innovating"]
        idx = {}
        row = []
        for i, col in enumerate(BARRIER_COLS):
            idx[col] = len(row)
            row.append(all_barrier_vals[i % 5])
        for i, col in enumerate(READINESS_COLS):
            idx[col] = len(row)
            row.append(all_readiness_vals[i % 5])
        for i, col in enumerate(MATURITY_COLS):
            idx[col] = len(row)
            row.append(all_maturity_vals[i % 5])

        assert has_partial_straightlining(row, idx) is False

    def test_all_same_barriers(self):
        idx = {}
        row = []
        for col in BARRIER_COLS:
            idx[col] = len(row)
            row.append("Moderate Barrier")  # SD = 0
        for i, col in enumerate(READINESS_COLS):
            idx[col] = len(row)
            row.append(["Low Readiness/Capability", "High Readiness/Capability"][i % 2])
        for i, col in enumerate(MATURITY_COLS):
            idx[col] = len(row)
            row.append(["Level 1: Initial/Ad Hoc", "Level 3: Defined/Standardized"][i % 2])

        assert has_partial_straightlining(row, idx) is True


# ── filter_samples ───────────────────────────────────────────

class TestFilterSamples:
    def test_loads_and_filters_test_data(self, test_data_csv):
        idx, data = load_data(test_data_csv)
        v2, samples = filter_samples(data, idx)

        assert len(v2) > 0
        assert "conservative_clean" in samples
        assert "flexible_clean" in samples
        assert "prolific_accepted" in samples
        assert "v2_finished" in samples
        assert "v2_all" in samples

        # Conservative Clean is a subset of Flexible Clean
        assert len(samples["conservative_clean"]) <= len(samples["flexible_clean"])
        # Flexible Clean is a subset of Prolific Accepted
        assert len(samples["flexible_clean"]) <= len(samples["prolific_accepted"])
        # Prolific Accepted is a subset of All V2 Finished
        assert len(samples["prolific_accepted"]) <= len(samples["v2_finished"])
        # All finished is a subset of all V2
        assert len(samples["v2_finished"]) <= len(samples["v2_all"])


# ── sensitivity_to_json ─────────────────────────────────────

class TestSensitivityJSON:
    def test_structure(self, test_data_csv):
        idx, data = load_data(test_data_csv)
        _, samples = filter_samples(data, idx)

        cuts = [
            ("Conservative Clean", samples["conservative_clean"]),
            ("Flexible Clean", samples["flexible_clean"]),
            ("All V2", samples["v2_all"]),
        ]
        result = sensitivity_to_json(cuts, idx)

        assert "samples" in result
        assert "metrics" in result
        assert len(result["samples"]) == 3
        assert all("key" in s and "n" in s for s in result["samples"])
        assert len(result["metrics"]) == 12  # 3 constructs * 4 metrics (mean, sd, corr, alpha) roughly

        # Check that metric values are dicts keyed by sample key
        for metric in result["metrics"]:
            assert "key" in metric
            assert "values" in metric
            assert isinstance(metric["values"], dict)

    def test_sample_details_structure(self, test_data_csv):
        """sample_details must contain demographics, effect_sizes, cross_tabs, and inferential per group."""
        idx, data = load_data(test_data_csv)
        _, samples = filter_samples(data, idx)

        cuts = [
            ("Conservative Clean", samples["conservative_clean"]),
            ("Flexible Clean", samples["flexible_clean"]),
            ("All V2", samples["v2_all"]),
        ]
        result = sensitivity_to_json(cuts, idx)

        assert "sample_details" in result
        # One detail block per sample cut
        assert len(result["sample_details"]) == 3

        for key, details in result["sample_details"].items():
            # All four sections present
            assert "demographics" in details, f"missing demographics for {key}"
            assert "effect_sizes" in details, f"missing effect_sizes for {key}"
            assert "cross_tabs" in details, f"missing cross_tabs for {key}"
            assert "inferential" in details, f"missing inferential for {key}"

            # Demographics has required sub-keys
            demo = details["demographics"]
            assert "roles" in demo
            assert "org_sizes" in demo
            assert "profit_models" in demo
            assert "tech_vs_nontech" in demo

            # Effect sizes has required structure
            if details["effect_sizes"]:
                es = details["effect_sizes"]
                assert "tech_vs_nontech" in es
                assert "large_vs_small" in es
                assert "constructs" in es["tech_vs_nontech"]

            # Cross-tabs has required structure
            if details["cross_tabs"]:
                ct = details["cross_tabs"]
                assert "by_role" in ct
                assert "by_org_size" in ct

            # Inferential has required structure
            if details["inferential"]:
                inf = details["inferential"]
                assert "t_tests_tech_vs_nontech" in inf
                assert "t_tests_large_vs_small" in inf
                assert "anova_by_role" in inf
                assert "anova_by_org_size" in inf

                # t-test structure
                for t_key in ["t_tests_tech_vs_nontech", "t_tests_large_vs_small"]:
                    assert "constructs" in inf[t_key]
                    for construct in inf[t_key]["constructs"].values():
                        assert "t" in construct
                        assert "p" in construct
                        assert "df" in construct
                        assert "sig" in construct

                # ANOVA structure
                for a_key in ["anova_by_role", "anova_by_org_size"]:
                    assert "groups" in inf[a_key]
                    assert "group_ns" in inf[a_key]
                    assert "constructs" in inf[a_key]
                    for construct in inf[a_key]["constructs"].values():
                        assert "f" in construct
                        assert "p" in construct
                        assert "sig" in construct


# ── welch_t_test ────────────────────────────────────────────

class TestWelchTTest:
    def test_equal_groups(self):
        g1 = [1.0, 2.0, 3.0, 4.0, 5.0]
        g2 = [1.0, 2.0, 3.0, 4.0, 5.0]
        t, p, df = welch_t_test(g1, g2)
        assert t == pytest.approx(0.0, abs=1e-6)
        assert p == pytest.approx(1.0, abs=0.01)

    def test_different_groups(self):
        g1 = [10.0, 11.0, 12.0, 13.0, 14.0]
        g2 = [1.0, 2.0, 3.0, 4.0, 5.0]
        t, p, df = welch_t_test(g1, g2)
        assert t > 0
        assert p < 0.01  # clearly significant

    def test_insufficient_data(self):
        t, p, df = welch_t_test([1.0], [2.0, 3.0])
        assert t is None
        assert p is None

    def test_filters_none(self):
        g1 = [1.0, None, 3.0, 5.0]
        g2 = [2.0, 4.0, None, 6.0]
        t, p, df = welch_t_test(g1, g2)
        assert t is not None
        assert p is not None


# ── oneway_anova ────────────────────────────────────────────

class TestOnewayAnova:
    def test_identical_groups(self):
        g = [1.0, 2.0, 3.0, 4.0, 5.0]
        f, p, df_b, df_w = oneway_anova(g, g, g)
        assert f == pytest.approx(0.0, abs=1e-6)
        assert p == pytest.approx(1.0, abs=0.01)

    def test_different_groups(self):
        g1 = [10.0, 11.0, 12.0]
        g2 = [1.0, 2.0, 3.0]
        g3 = [50.0, 51.0, 52.0]
        f, p, df_b, df_w = oneway_anova(g1, g2, g3)
        assert f > 0
        assert p < 0.01
        assert df_b == 2
        assert df_w == 6

    def test_insufficient_groups(self):
        f, p, df_b, df_w = oneway_anova([1.0, 2.0])
        assert f is None
