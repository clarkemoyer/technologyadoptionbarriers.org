"""Tests for tabs_v2_analysis.py - statistical functions and sample filtering."""

import math
import re
from collections import Counter

import pytest

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
    categorize_other_role,
    classify_role,
    classify_role_binary,
    is_technical,
    _regularized_incomplete_beta,
    _t_cdf_two_tailed,
    _f_cdf_right,
    ROLE_MAP,
    OTHER_ROLE_CATEGORIES_PATTERNS,
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
        d, ci_l, ci_u = cohens_d([5, 5, 5], [5, 5, 5])
        # Zero difference but also zero pooled SD
        assert d is None
        assert ci_l is None
        assert ci_u is None

    def test_large_effect(self):
        d, ci_l, ci_u = cohens_d([10, 11, 12], [1, 2, 3])
        assert d is not None
        assert ci_l is not None
        assert ci_u is not None
        assert abs(d) > 0.8  # large effect
        assert ci_l <= d <= ci_u

    def test_insufficient_data(self):
        assert cohens_d([5], [3]) == (None, None, None)


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

        # demographic_sources metadata documents both data sources
        assert "demographic_sources" in result
        ds = result["demographic_sources"]
        assert "survey_demographics" in ds
        assert "platform_demographics" in ds
        assert "Q1_Role" in ds["survey_demographics"]["fields"]
        assert "age" in ds["platform_demographics"]["fields"]
        # Both use dict format with descriptions
        assert isinstance(ds["survey_demographics"]["fields"], dict)
        assert isinstance(ds["platform_demographics"]["fields"], dict)

        # Platform demographics has base + prescreener field categories
        pd = ds["platform_demographics"]
        assert "base_fields" in pd, "missing base_fields"
        assert "prescreener_fields" in pd, "missing prescreener_fields"
        assert "cross_validation" in pd, "missing cross_validation"
        assert "study_screeners" in pd, "missing study_screeners"
        assert "age" in pd["base_fields"]
        assert "country_of_birth" in pd["base_fields"]
        assert "company_size" in pd["prescreener_fields"]
        assert "industry" in pd["prescreener_fields"]
        assert "employment_sector" in pd["prescreener_fields"]
        assert "occupation" in pd["prescreener_fields"]
        assert "education_level" in pd["prescreener_fields"]
        assert "household_income" in pd["prescreener_fields"]
        assert "fluent_languages" in pd["prescreener_fields"]

        # Study screeners document exact eligibility criteria
        screeners = pd["study_screeners"]
        assert isinstance(screeners, list)
        assert len(screeners) == 5  # 5 screeners configured on live study
        screener_ids = [s["filter_id"] for s in screeners]
        assert "current_country_of_residence" in screener_ids
        assert "employment_status" in screener_ids
        assert "employment_sector" in screener_ids
        assert "company_size" in screener_ids
        assert "occupation" in screener_ids
        for s in screeners:
            assert "label" in s, f"screener {s['filter_id']} missing label"
            assert "selected_values" in s, f"screener {s['filter_id']} missing selected_values"
            assert "base_field" in s, f"screener {s['filter_id']} missing base_field"
            assert isinstance(s["selected_values"], list)
        # Cross-validation documents overlapping fields and use cases
        cv = pd["cross_validation"]
        assert "overlapping_fields" in cv
        assert "use_cases" in cv
        assert "industry" in cv["overlapping_fields"]
        assert "company_size" in cv["overlapping_fields"]

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
            assert "other_roles" in demo, f"missing other_roles for {key}"
            assert "total" in demo["other_roles"], f"other_roles missing total for {key}"
            assert "categories" in demo["other_roles"], f"other_roles missing categories for {key}"
            assert isinstance(demo["other_roles"]["total"], int)
            assert isinstance(demo["other_roles"]["categories"], dict)

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

    def test_role_categories_in_output(self, test_data_csv):
        """role_categories must be present and match OTHER_ROLE_CATEGORIES_PATTERNS + Uncategorized."""
        idx, data = load_data(test_data_csv)
        _, samples = filter_samples(data, idx)

        cuts = [
            ("Conservative Clean", samples["conservative_clean"]),
            ("Flexible Clean", samples["flexible_clean"]),
            ("All V2", samples["v2_all"]),
        ]
        result = sensitivity_to_json(cuts, idx)

        assert "role_categories" in result, "role_categories key missing from JSON output"
        cats = result["role_categories"]
        assert isinstance(cats, list), "role_categories should be a list"

        # Should have one entry per pattern category + "Uncategorized"
        expected_labels = [cat for cat, _ in OTHER_ROLE_CATEGORIES_PATTERNS] + ["Uncategorized"]
        actual_labels = [c["label"] for c in cats]
        assert actual_labels == expected_labels, (
            f"role_categories labels mismatch: {actual_labels} != {expected_labels}"
        )

        for entry in cats:
            assert "label" in entry, "role_categories entry missing 'label'"
            assert "description" in entry, f"role_categories entry '{entry['label']}' missing 'description'"
            assert "examples" in entry, f"role_categories entry '{entry['label']}' missing 'examples'"
            # All named categories (not Uncategorized) must have a non-empty description
            if entry["label"] != "Uncategorized":
                assert entry["description"], (
                    f"role_categories entry '{entry['label']}' has empty description"
                )

    def test_filter_bias_analysis_schema(self, test_data_csv):
        """filter_bias_analysis must be present and have the expected per-category shape."""
        idx, data = load_data(test_data_csv)
        _, samples = filter_samples(data, idx)

        # sensitivity_to_json requires all four labelled cuts for filter_bias_analysis.
        cuts = [
            ("Conservative Clean", samples["conservative_clean"]),
            ("Flexible Clean", samples["flexible_clean"]),
            ("Prolific Accepted", samples["prolific_accepted"]),
            ("All V2 Finished", samples["v2_finished"]),
        ]
        result = sensitivity_to_json(cuts, idx)

        assert "filter_bias_analysis" in result, "filter_bias_analysis key missing from output"
        fba = result["filter_bias_analysis"]

        # Top-level keys
        for category in ("role", "organization_size", "profit_model"):
            assert category in fba, f"missing '{category}' in filter_bias_analysis"
            entry = fba[category]
            assert "ok" in entry, f"'{category}' missing 'ok'"
            if entry["ok"]:
                assert entry["chi2"] is not None, f"'{category}' ok=True but chi2 is None"
                assert entry["p_value"] is not None, f"'{category}' ok=True but p_value is None"
                assert entry["df"] is not None, f"'{category}' ok=True but df is None"
                assert entry["error"] is None, f"'{category}' ok=True but error is set"
                assert isinstance(entry["chi2"], float)
                assert 0.0 <= entry["p_value"] <= 1.0
                assert isinstance(entry["df"], int)
            else:
                assert entry["chi2"] is None
                assert entry["p_value"] is None
                assert entry["df"] is None
                assert isinstance(entry["error"], str)

        # profit_model_distribution sub-key
        assert "profit_model_distribution" in fba, "profit_model_distribution missing"
        dist = fba["profit_model_distribution"]
        assert "labels" in dist
        assert "groups" in dist
        assert isinstance(dist["labels"], list)
        assert len(dist["labels"]) == 3  # For-Profit, Non-Profit, Government/Public Sector
        # One entry per required group
        for label in ("Conservative Clean", "Flexible Clean", "Prolific Accepted", "All V2 Finished"):
            assert label in dist["groups"], f"profit_model_distribution missing group '{label}'"
            group_counts = dist["groups"][label]
            for pm_label in dist["labels"]:
                assert pm_label in group_counts, (
                    f"profit_model_distribution group '{label}' missing label '{pm_label}'"
                )
                assert isinstance(group_counts[pm_label], int)


# ── welch_t_test ────────────────────────────────────────────

class TestWelchTTest:
    def test_equal_groups(self):
        g1 = [1.0, 2.0, 3.0, 4.0, 5.0]
        g2 = [1.0, 2.0, 3.0, 4.0, 5.0]
        t, p, df, ci_l, ci_u = welch_t_test(g1, g2)
        assert t == pytest.approx(0.0, abs=1e-6)
        assert p == pytest.approx(1.0, abs=0.01)
        assert ci_l < 0.0
        assert ci_u > 0.0

    def test_different_groups(self):
        g1 = [10.0, 11.0, 12.0, 13.0, 14.0]
        g2 = [1.0, 2.0, 3.0, 4.0, 5.0]
        t, p, df, ci_l, ci_u = welch_t_test(g1, g2)
        assert t > 0
        assert p < 0.01  # clearly significant
        assert ci_l > 0.0  # mean diff is strictly positive
        assert ci_l < ci_u

    def test_insufficient_data(self):
        t, p, df, ci_l, ci_u = welch_t_test([1.0], [2.0, 3.0])
        assert t is None
        assert p is None
        assert ci_l is None

    def test_filters_none(self):
        g1 = [1.0, None, 3.0, 5.0]
        g2 = [2.0, 4.0, None, 6.0]
        t, p, df, ci_l, ci_u = welch_t_test(g1, g2)
        assert t is not None
        assert p is not None
        assert ci_l is not None
        assert ci_u is not None


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


# ── categorize_other_role ────────────────────────────────────

class TestCategorizeOtherRole:
    """Unit tests for categorize_other_role() and OTHER_ROLE_CATEGORIES_PATTERNS."""

    # --- empty / whitespace inputs ---

    def test_empty_string(self):
        assert categorize_other_role("") == "Uncategorized"

    def test_whitespace_only(self):
        assert categorize_other_role("   \t  ") == "Uncategorized"

    def test_empty_string_again_matches_uncategorized(self):
        # None would raise AttributeError in strip(); guard is `not text`
        assert categorize_other_role("") == "Uncategorized"

    # --- IT acronym case sensitivity ---

    def test_lowercase_it_is_not_technical_specialist(self):
        assert categorize_other_role("it") == "Uncategorized"

    def test_it_in_prose_does_not_match(self):
        assert categorize_other_role("it's complicated") == "Uncategorized"

    def test_it_in_sentence_does_not_match(self):
        assert categorize_other_role("I think it's fine") == "Uncategorized"

    def test_uppercase_IT_matches_technical_specialist(self):
        assert categorize_other_role("IT") == "Technical Specialist"

    def test_IT_standalone_matches_technical_specialist(self):
        assert categorize_other_role("IT Specialist") == "Technical Specialist"

    # --- representative inputs for every category ---

    def test_c_suite_adjacent_chief(self):
        assert categorize_other_role("Chief Digital Officer") == "C-Suite Adjacent"

    def test_c_suite_adjacent_cdo(self):
        assert categorize_other_role("CDO") == "C-Suite Adjacent"

    def test_vp_svp_vp(self):
        assert categorize_other_role("VP of Operations") == "VP / SVP"

    def test_vp_svp_vice_president(self):
        assert categorize_other_role("Vice President, Strategy") == "VP / SVP"

    def test_director(self):
        assert categorize_other_role("Director of Finance") == "Director"

    def test_manager(self):
        assert categorize_other_role("Program Manager") == "Manager / Program Lead"

    def test_team_lead(self):
        assert categorize_other_role("Team Lead") == "Manager / Program Lead"

    def test_owner(self):
        assert categorize_other_role("Owner") == "Owner / Founder / President"

    def test_founder(self):
        assert categorize_other_role("Founder and CEO") == "Owner / Founder / President"

    def test_technical_specialist_engineer(self):
        assert categorize_other_role("Software Engineer") == "Technical Specialist"

    def test_technical_specialist_developer(self):
        assert categorize_other_role("Senior Developer") == "Technical Specialist"

    def test_technical_specialist_architect(self):
        assert categorize_other_role("Solutions Architect") == "Technical Specialist"

    def test_technical_specialist_analyst(self):
        assert categorize_other_role("Data Analyst") == "Technical Specialist"

    def test_technical_specialist_technology_keyword(self):
        assert categorize_other_role("Head of Technology") == "Technical Specialist"

    def test_uncategorized_random_text(self):
        assert categorize_other_role("Something completely unrelated") == "Uncategorized"

    # --- first-match / precedence behavior ---

    def test_first_category_wins_over_second(self):
        """Text that matches both C-Suite Adjacent and VP/SVP should return C-Suite Adjacent."""
        # "chief" matches C-Suite Adjacent; "VP" matches VP/SVP
        assert categorize_other_role("Chief VP") == "C-Suite Adjacent"

    def test_first_category_wins_director_vs_manager(self):
        """'Director' appears before 'Manager / Program Lead' in the list."""
        # 'director' and 'lead' both present → Director wins
        assert categorize_other_role("Director and Team Lead") == "Director"

    # --- counter-based aggregation ---

    def test_counter_aggregation(self):
        inputs = ["", "   ", "Chief of Staff", "Chief Analytics Officer", "VP of Sales"]
        results = Counter(categorize_other_role(t) for t in inputs)
        assert results["Uncategorized"] == 2
        assert results["C-Suite Adjacent"] == 2
        assert results["VP / SVP"] == 1

    # --- all configured categories have a matchable representative ---

    def test_all_categories_have_representative(self):
        """Every entry in OTHER_ROLE_CATEGORIES_PATTERNS can be matched by at least one pattern."""
        # A pool of candidate strings to try against each pattern.
        candidates = [
            "IT", "information technology", "technology", "technical",
            "operations", "operator", "admin", "administrator",
            "finance", "accounting", "procurement", "marketing",
            "communications", "sales", "hr", "human resources", "people",
            "product", "program", "project", "engineering", "engineer",
            "developer", "analyst", "consultant", "owner", "founder",
            "executive", "leadership", "support", "customer success",
            "research", "data", "security", "compliance", "legal",
            "chief", "CDO", "CPO", "CAO", "CLO", "CDIO", "CAIO", "CXO", "CCO",
            "VP", "vice president", "SVP", "EVP", "AVP",
            "director", "manager", "team lead", "supervisor",
            "president", "partner", "principal", "proprietor",
            "architect", "systems", "infrastructure", "network",
        ]

        for category, patterns in OTHER_ROLE_CATEGORIES_PATTERNS:
            matched = False
            for pat in patterns:
                for candidate in candidates:
                    if re.search(pat, candidate, re.IGNORECASE):
                        matched = True
                        break
                if matched:
                    break
            assert matched, (
                "No candidate matched any pattern for category {!r}".format(category)
            )


# ── ROLE_MAP CISO string ────────────────────────────────────

class TestRoleMapCISO:
    """Verify ROLE_MAP contains the correct CISO description string."""

    def test_ciso_key_matches_csv_data(self):
        assert 'CISO (e.g., Director of Cybersecurity, Chief Security Officer)' in ROLE_MAP

    def test_ciso_maps_to_ciso(self):
        assert ROLE_MAP['CISO (e.g., Director of Cybersecurity, Chief Security Officer)'] == 'CISO'

    def test_old_ciso_key_absent(self):
        assert 'CISO (e.g., VP of Information Security, Chief Cybersecurity Officer)' not in ROLE_MAP

    def test_exactly_one_ciso_key(self):
        ciso_keys = [k for k, v in ROLE_MAP.items() if v == 'CISO']
        assert len(ciso_keys) == 1, f"Expected 1 CISO key, found {len(ciso_keys)}: {ciso_keys}"

    def test_get_role_ciso(self):
        idx = {"Q1_Role": 0}
        assert get_role(["CISO (e.g., Director of Cybersecurity, Chief Security Officer)"], idx) == "CISO"


# ── classify_role (free-text patterns) ──────────────────────

class TestClassifyRole:
    """Unit tests for classify_role() regex-based classification."""

    def test_technical_analytics(self):
        assert classify_role('analytics director') == 'Technical'

    def test_technical_ai(self):
        assert classify_role('Director - AI & Operational Analytics') == 'Technical'

    def test_technical_online_learning(self):
        assert classify_role('Director online learning') == 'Technical'

    def test_technical_cybersecurity(self):
        assert classify_role('Director of Cybersecurity') == 'Technical'

    def test_unmatched_sales_director(self):
        # "Sales Director" does not match any Technical pattern; unmatched → 'Other'
        assert classify_role('Sales Director') == 'Other'

    def test_empty_string(self):
        assert classify_role('') == 'Other'

    def test_whitespace(self):
        assert classify_role('   ') == 'Other'

    def test_no_tech_signal(self):
        assert classify_role('Contractor') == 'Other'


# ── classify_role_binary (Tech/Non-Tech) ────────────────────

class TestClassifyRoleBinary:
    """Unit tests for classify_role_binary() - binary Tech/Non-Tech classification."""

    def test_tech_titles(self):
        for role in ('CIO', 'CTO', 'CISO'):
            assert classify_role_binary(role) == 'Technical'

    def test_nontech_titles(self):
        for role in ('CEO', 'CFO', 'COO', 'CHRO', 'CMO', 'CSO', 'CRO'):
            assert classify_role_binary(role) == 'Non-Technical'

    def test_other_technical_freetext(self):
        assert classify_role_binary('Other', 'Director - AI & Operational Analytics') == 'Technical'
        assert classify_role_binary('Other', 'analytics director') == 'Technical'
        assert classify_role_binary('Other', 'Director online learning') == 'Technical'

    def test_other_unmatched_defaults_nontech(self):
        """Unmatched 'Other' free-text defaults to Non-Technical."""
        assert classify_role_binary('Other', 'Sales Director') == 'Non-Technical'
        assert classify_role_binary('Other', 'Contractor') == 'Non-Technical'
        assert classify_role_binary('Other', 'Director of Library') == 'Non-Technical'
        assert classify_role_binary('Other', 'Individual contributor') == 'Non-Technical'

    def test_other_blank_defaults_nontech(self):
        """Blank or empty free-text defaults to Non-Technical."""
        assert classify_role_binary('Other', '') == 'Non-Technical'
        assert classify_role_binary('Other', '  ') == 'Non-Technical'

    def test_other_none_text_defaults_nontech(self):
        """Respondent typed 'None' as free-text → Non-Technical."""
        assert classify_role_binary('Other', 'None') == 'Non-Technical'

    def test_unknown_role_returns_none(self):
        """Roles not in ROLE_MAP ('Unknown') still return None."""
        assert classify_role_binary('Unknown') is None

    def test_is_technical_helper(self):
        assert is_technical('CIO') is True
        assert is_technical('CEO') is False
        assert is_technical('Other', 'analytics director') is True
        assert is_technical('Other', 'Contractor') is False


# ── _regularized_incomplete_beta / _t_cdf_two_tailed / _f_cdf_right ───

class TestRegularizedIncompleteBeta:
    """Regression tests for the incomplete beta function convergence fix.

    The original implementation had two bugs:
    1. c was initialized to 1e-30 instead of 1.0 (Lentz algorithm misuse)
    2. No symmetry relation was used, causing poor convergence when
       x > (a+1)/(a+b+2) with large a and small b (e.g., b=0.5)
    """

    def test_boundary_zero(self):
        assert _regularized_incomplete_beta(0.0, 1.0, 1.0) == 0.0

    def test_boundary_one(self):
        assert _regularized_incomplete_beta(1.0, 1.0, 1.0) == 1.0

    def test_uniform_case(self):
        # I_x(1, 1) = x for the uniform Beta(1,1)
        assert _regularized_incomplete_beta(0.5, 1.0, 1.0) == pytest.approx(0.5, abs=1e-8)
        assert _regularized_incomplete_beta(0.3, 1.0, 1.0) == pytest.approx(0.3, abs=1e-8)

    def test_large_a_small_b(self):
        """The case that triggered the bug: large a, b=0.5, x near 1."""
        # I_0.99(40, 0.5) should be close to 1 but NOT exactly 0.0 or 1.0
        result = _regularized_incomplete_beta(0.99, 40.0, 0.5)
        assert 0.0 < result < 1.0

    def test_symmetry(self):
        """I_x(a, b) = 1 - I_{1-x}(b, a)."""
        x, a, b = 0.3, 2.0, 5.0
        lhs = _regularized_incomplete_beta(x, a, b)
        rhs = 1.0 - _regularized_incomplete_beta(1.0 - x, b, a)
        assert lhs == pytest.approx(rhs, abs=1e-8)


class TestTCdfTwoTailed:
    """Tests for t-distribution p-value computation."""

    def test_zero_t_gives_one(self):
        """t=0 means no difference; p should be 1.0."""
        assert _t_cdf_two_tailed(0.0, 10) == pytest.approx(1.0, abs=0.01)

    def test_large_t_gives_small_p(self):
        """Large |t| → small p."""
        p = _t_cdf_two_tailed(10.0, 50)
        assert p < 0.001

    def test_nonzero_p_with_moderate_t_and_large_df(self):
        """Regression: moderate t with large df must NOT produce p=0.0.

        This was the exact bug: df/2 ≈ 40+ with b=0.5 caused the
        continued fraction to incorrectly converge to 0.0.
        """
        # t=0.2635, df≈82.68 → p should be ≈0.793 (not 0.0)
        p = _t_cdf_two_tailed(0.2635, 82.68)
        assert p == pytest.approx(0.793, abs=0.01)

    def test_known_values_from_issue(self):
        """Verify p-values reported in the bug report."""
        # t=3.9083, df≈82.68 → p should be ≈0.0002
        p = _t_cdf_two_tailed(3.9083, 82.68)
        assert p == pytest.approx(0.0002, abs=0.001)


class TestFCdfRight:
    """Tests for F-distribution right-tail p-value."""

    def test_f_zero_gives_one(self):
        assert _f_cdf_right(0.0, 2, 30) == 1.0

    def test_large_f_gives_small_p(self):
        p = _f_cdf_right(100.0, 2, 50)
        assert p < 0.001

    def test_df1_equals_1_nonzero_p(self):
        """Regression: df1=1 → b=0.5 in the beta function.

        This was the exact bug path for anova_by_role (df_between=1).
        """
        # F=0.0785, df1=1, df2=large → p should be ≈0.78 (not 0.0)
        p = _f_cdf_right(0.0785, 1, 80)
        assert p == pytest.approx(0.78, abs=0.02)

    def test_df1_equals_2_still_works(self):
        """anova_by_org_size path (df1=2) was correct before; verify it stays."""
        # F=2.3884, df1=2, df2=76 → p ≈ 0.0986
        p = _f_cdf_right(2.3884, 2, 76)
        assert p == pytest.approx(0.0986, abs=0.005)


# ── Cross-module parity ─────────────────────────────────────

class TestCrossModuleParity:
    """Assert both copies of the statistical helpers produce identical results.

    _regularized_incomplete_beta (and its dependents _t_cdf_two_tailed,
    _f_cdf_right) are duplicated in tabs_v2_analysis.py and
    tabs_v2_unified_data_analysis.py.  These tests guard against the two
    implementations drifting apart in the future.
    """

    # Representative (x, a, b) inputs covering:
    #   - the exact bug path (large a, b=0.5)
    #   - typical t-distribution params
    #   - typical F-distribution params
    #   - boundary-adjacent values
    BETA_INPUTS = [
        (0.99, 40.0, 0.5),    # bug path: large a, small b, x near 1
        (0.3, 2.0, 5.0),      # moderate params
        (0.5, 1.0, 1.0),      # uniform Beta(1,1)
        (0.01, 0.5, 40.0),    # small x, small a, large b
        (0.85, 41.34, 0.5),   # t-dist: df≈82.68, moderate t
        (0.7, 38.0, 1.0),     # F-dist: df1=2, df2=76
    ]

    def test_incomplete_beta_parity(self):
        """Both modules must return the same I_x(a,b) for every test point."""
        from tabs_v2_unified_data_analysis import (
            _regularized_incomplete_beta as unified_beta,
        )

        for x, a, b in self.BETA_INPUTS:
            val_analysis = _regularized_incomplete_beta(x, a, b)
            val_unified = unified_beta(x, a, b)
            assert val_analysis == pytest.approx(val_unified, abs=1e-12), (
                f"Mismatch for (x={x}, a={a}, b={b}): "
                f"analysis={val_analysis}, unified={val_unified}"
            )

    def test_t_cdf_parity(self):
        """Both modules must return the same two-tailed p for representative t values."""
        from tabs_v2_unified_data_analysis import (
            _t_cdf_two_tailed as unified_t_cdf,
        )

        t_df_pairs = [(0.2635, 82.68), (3.9083, 82.68), (0.0, 10.0), (10.0, 50.0)]
        for t_abs, df in t_df_pairs:
            p_analysis = _t_cdf_two_tailed(t_abs, df)
            p_unified = unified_t_cdf(t_abs, df)
            assert p_analysis == pytest.approx(p_unified, abs=1e-12), (
                f"Mismatch for t={t_abs}, df={df}: "
                f"analysis={p_analysis}, unified={p_unified}"
            )

    def test_f_cdf_parity(self):
        """Both modules must return the same right-tail p for representative F values."""
        from tabs_v2_unified_data_analysis import (
            _f_cdf_right as unified_f_cdf,
        )

        f_df_pairs = [(0.0785, 1, 80), (2.3884, 2, 76), (100.0, 2, 50), (0.0, 2, 30)]
        for f_val, df1, df2 in f_df_pairs:
            p_analysis = _f_cdf_right(f_val, df1, df2)
            p_unified = unified_f_cdf(f_val, df1, df2)
            assert p_analysis == pytest.approx(p_unified, abs=1e-12), (
                f"Mismatch for F={f_val}, df1={df1}, df2={df2}: "
                f"analysis={p_analysis}, unified={p_unified}"
            )
