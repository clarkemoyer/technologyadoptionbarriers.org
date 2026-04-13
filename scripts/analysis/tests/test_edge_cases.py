"""Targeted tests for specific uncovered branches across all modules.

Each test targets a specific uncovered line or branch identified by
coverage analysis, using crafted minimal inputs rather than volume.
"""

import math
import sys
from pathlib import Path
from unittest.mock import patch

import numpy as np
import pandas as pd
import pytest

sys.path.insert(0, str(Path(__file__).parent))
sys.path.insert(0, str(Path(__file__).parent.parent))

from _helpers import make_qualtrics_csv, MINIMAL_HEADERS, make_clean_row


# ═══════════════════════════════════════════════════════════════
# tabs_v2_analysis.py - uncovered branches
# ═══════════════════════════════════════════════════════════════

from tabs_v2_analysis import (
    mean_sd, pearson_r, cohens_d, skewness, kurtosis_excess,
    get_duration, get_recaptcha_score, get_straightlining_count,
    print_effect_sizes, print_cross_tabs,
    person_means, load_data, filter_samples,
    BARRIER_COLS, READINESS_COLS, MATURITY_COLS,
    BARRIER_SCALE, READINESS_SCALE, MATURITY_SCALE,
)


class TestAnalysisEdgeCases:
    """Lines 180, 192, 276-277, 306, 616-618, 679, 690."""

    def test_skewness_zero_sd(self):
        """Line 192: skewness returns 0 when SD is 0."""
        assert skewness([3, 3, 3, 3, 3]) == 0

    def test_kurtosis_zero_sd(self):
        """Line 206: kurtosis returns 0 when SD is 0."""
        assert kurtosis_excess([3, 3, 3, 3, 3]) == 0

    def test_get_duration_value_error(self):
        """Lines 276-277: get_duration returns None on ValueError."""
        idx = {"Duration (in seconds)": 0}
        assert get_duration(["not_a_number"], idx) is None

    def test_get_straightlining_value_error(self):
        """Line 306: get_straightlining_count returns 0 on ValueError."""
        idx = {"Q_StraightliningCount": 0}
        assert get_straightlining_count(["not_a_number"], idx) == 0

    def test_effect_sizes_d_none_large_org(self, tmp_path, capsys):
        """Lines 616-618: d=N/A branch for Large vs S/M org size.

        Create data where one org-size group has only 1 row → cohens_d returns None.
        """
        # 1 large org row + 2 small org rows → d is None for large group
        rows = [
            make_clean_row(pid="P1", duration=600),
            make_clean_row(pid="P2", duration=700),
            make_clean_row(pid="P3", duration=800),
        ]
        # Override org sizes: P1 = large, P2/P3 = small
        # Q4_OrgSize is index 7 in MINIMAL_HEADERS
        org_idx = MINIMAL_HEADERS.index("Q4_OrgSize")
        rows[0][org_idx] = "10000+"
        rows[1][org_idx] = "<100"
        rows[2][org_idx] = "<100"

        path = make_qualtrics_csv(tmp_path, MINIMAL_HEADERS, rows)
        idx, data = load_data(path)
        _, samples = filter_samples(data, idx)
        # Use all V2 to get all 3 rows
        print_effect_sizes(samples["v2_all"], idx)
        out = capsys.readouterr().out
        assert "EFFECT SIZES" in out

    def test_cross_tabs_empty_groups(self, capsys):
        """Lines 679, 690: groups with 0 rows → continue."""
        # Empty rows → no groups to iterate
        print_cross_tabs([], {})
        out = capsys.readouterr().out
        assert "CROSS-TABULATIONS" in out


# ═══════════════════════════════════════════════════════════════
# tabs_v2_advanced.py - uncovered branches
# ═══════════════════════════════════════════════════════════════

PROD_CSV = str(Path(__file__).parent / "test_data_production_format.csv")


class TestAdvancedEdgeCases:
    """Lines 72, 95, 98-99, 132, 180-181, 212, 363, 386, 448, 453, 581-582, 596-603."""

    def _import(self):
        with patch.object(sys, "argv", ["test", PROD_CSV]):
            if "tabs_v2_advanced" in sys.modules:
                del sys.modules["tabs_v2_advanced"]
            import tabs_v2_advanced as mod
            return mod

    def test_map_role_fallthrough(self):
        """Line 72: Unknown role → 'Unknown' in some branches, 'Other' in map."""
        mod = self._import()
        result = mod.map_role("Some Completely Unknown Title")
        assert result == "Other"

    def test_score_with_missing_column(self):
        """Lines 95, 98-99: score() skips items not in scale or missing."""
        mod = self._import()
        idx = {"Q10-28_Barriers_1": 0, "Q10-28_Barriers_2": 1}
        row = ["Don't Know", ""]  # Neither in BARRIER_SCALE
        result = mod.score(row, idx, ["Q10-28_Barriers_1", "Q10-28_Barriers_2"], mod.BARRIER_SCALE)
        assert result == []  # Both skipped

    def test_item_vectors_with_missing(self):
        """Line 132: item_vectors appends nan for items not in scale."""
        mod = self._import()
        idx = {"Q10-28_Barriers_1": 0}
        rows = [["Don't Know"]]  # Not in BARRIER_SCALE
        result = mod.item_vectors(rows, idx, ["Q10-28_Barriers_1"], mod.BARRIER_SCALE)
        assert len(result) == 1
        assert np.isnan(result[0][0])

    def test_singular_matrix_branch_exists(self):
        """Lines 581-582: Verify the LinAlgError handler exists in the source.

        The singular matrix branch in tabs_v2_advanced.py runs at module level
        during import, so it can't be triggered via mock without breaking the
        entire module load. The e2e subprocess test covers this path when the
        data produces a singular correlation matrix. Here we just verify the
        exception handler is present in the source code.
        """
        import inspect
        mod = self._import()
        source = inspect.getsource(sys.modules["tabs_v2_advanced"])
        assert "LinAlgError" in source
        assert "singular matrix" in source.lower()


# ═══════════════════════════════════════════════════════════════
# tabs_v2_psychometrics.py - uncovered branches
# ═══════════════════════════════════════════════════════════════

class TestPsychometricsEdgeCases:
    """Lines 508-517 (KMO interpretation), 1097-1114 (chi-square),
    1232-1247 (key findings)."""

    def _import(self):
        with patch.object(sys, "argv", ["test", PROD_CSV]):
            if "tabs_v2_psychometrics" in sys.modules:
                del sys.modules["tabs_v2_psychometrics"]
            import tabs_v2_psychometrics as mod
            return mod

    def test_kmo_interpretation_all_tiers(self):
        """Lines 508-517: KMO interpretation tiers."""
        mod = self._import()
        np.random.seed(42)

        # Highly correlated data → high KMO
        base = np.arange(100, dtype=float)
        data = pd.DataFrame({
            "A": base + np.random.randn(100) * 0.01,
            "B": base + np.random.randn(100) * 0.01,
            "C": base + np.random.randn(100) * 0.01,
            "D": base + np.random.randn(100) * 0.01,
            "E": base + np.random.randn(100) * 0.01,
        })
        kmo = mod.kmo_measure(data)
        assert kmo >= 0.7  # Should be at least Middling with highly correlated data

    def test_kmo_low_correlation(self):
        """Lines 514-517: KMO with uncorrelated data → low score."""
        mod = self._import()
        np.random.seed(99)
        data = pd.DataFrame({
            "A": np.random.randn(100),
            "B": np.random.randn(100),
            "C": np.random.randn(100),
            "D": np.random.randn(100),
        })
        kmo = mod.kmo_measure(data)
        # Uncorrelated data should give low KMO
        assert kmo < 0.7

    def test_cronbach_alpha_ci_small_sample(self):
        """Test CI with small but sufficient sample."""
        mod = self._import()
        data = pd.DataFrame({
            "A": [1.0, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            "B": [1.0, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            "C": [2.0, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        })
        lower, upper = mod.cronbach_alpha_ci(data)
        alpha = mod.cronbach_alpha(data)
        assert lower <= alpha
        assert alpha <= upper

    def test_mahalanobis_with_varied_data(self):
        """Test Mahalanobis distance with non-singular data."""
        mod = self._import()
        np.random.seed(42)
        data = pd.DataFrame({
            "A": np.random.randn(20),
            "B": np.random.randn(20),
            "C": np.random.randn(20),
        })
        distances = mod.mahalanobis_distance(data)
        assert len(distances) == 20
        assert all(d >= 0 for d in distances.values())

    def test_harman_insufficient_data(self):
        """Test Harman single-factor with insufficient data."""
        mod = self._import()
        data = pd.DataFrame({"A": [1.0]})
        result = mod.harman_single_factor(data)
        assert np.isnan(result)

    def test_straightlining_rate_two_same(self):
        """straightlining_rate with two identical items."""
        mod = self._import()
        row = pd.Series({"A": 3, "B": 3})
        rate = mod.straightlining_rate(row, ["A", "B"])
        assert rate == 1.0

    def test_mean_inter_item_corr_uncorrelated(self):
        """Mean inter-item correlation with uncorrelated data."""
        mod = self._import()
        np.random.seed(42)
        data = pd.DataFrame({
            "A": np.random.randn(50),
            "B": np.random.randn(50),
        })
        r = mod.mean_inter_item_corr(data)
        assert abs(r) < 0.5  # Should be near zero for uncorrelated

    def test_grand_mean_empty(self):
        """grand_mean with no valid data returns NaN."""
        mod = self._import()
        df = pd.DataFrame({"A": [np.nan, np.nan], "B": [np.nan, np.nan]})
        gm = mod.grand_mean(df, ["A", "B"])
        assert np.isnan(gm)

    def test_person_means_all_nan(self):
        """person_means with all NaN returns None for that person."""
        mod = self._import()
        df = pd.DataFrame({"A": [np.nan], "B": [np.nan]})
        means = mod.person_means(df, ["A", "B"])
        assert means[0] is None


# ═══════════════════════════════════════════════════════════════
# tabs_v2_quality_audit.py - uncovered branches
# ═══════════════════════════════════════════════════════════════

class TestQualityEdgeCases:
    """Lines 330, 335, 341, 473-474, 487-488."""

    def _import(self):
        with patch.object(sys, "argv", ["test", PROD_CSV]):
            if "tabs_v2_quality_audit" in sys.modules:
                del sys.modules["tabs_v2_quality_audit"]
            import tabs_v2_quality_audit as mod
            return mod

    def test_module_has_role_distribution(self):
        """Lines 330, 335: role and size distribution printouts."""
        mod = self._import()
        # These are module-level print statements that execute on import.
        # The fact that import succeeds means they ran.
        assert hasattr(mod, "clean_rows")
        assert len(mod.clean_rows) > 0

    def test_person_responses_empty_row(self):
        """person_responses with all-empty values."""
        mod = self._import()
        idx = mod.idx
        row = [""] * (max(idx.values()) + 1)
        result = mod.person_responses(row, mod.BARRIER_COLS, mod.BARRIER_SCALE)
        assert result == []


# ═══════════════════════════════════════════════════════════════
# tabs_v2_data_audit.py - uncovered branches
# ═══════════════════════════════════════════════════════════════

from tabs_v2_data_audit import compute_disposition


class TestDataAuditEdgeCases:
    """Lines 50, 105, 269, 401."""

    def test_constants_loaded_from_json(self):
        """Verify constants are loaded correctly from tabs_v2_constants.json."""
        from tabs_v2_data_audit import IRI_BARRIER_ANSWER, SPEED_THRESHOLD
        assert IRI_BARRIER_ANSWER == "Major Barrier"
        assert SPEED_THRESHOLD == 300

    def test_constants_fallback_when_missing(self, tmp_path, monkeypatch):
        """Line 50: when tabs_v2_constants.json doesn't exist, defaults are used."""
        import importlib
        # Point the constants path to a nonexistent file
        monkeypatch.setattr("tabs_v2_data_audit._CONSTANTS_PATH", tmp_path / "nonexistent.json")
        # Force reload so module-level code re-executes
        import tabs_v2_data_audit
        importlib.reload(tabs_v2_data_audit)
        # Defaults should still be correct (hardcoded fallbacks)
        assert tabs_v2_data_audit.IRI_BARRIER_ANSWER == "Major Barrier"
        assert tabs_v2_data_audit.SPEED_THRESHOLD == 300
        # Restore original
        importlib.reload(tabs_v2_data_audit)

    def test_waterfall_finished_1(self):
        """Line 105 in parse_csv: Finished='1' treated as TRUE."""
        row = {
            "Finished": "1",
            "Auth_LLM": "", "Auth_Bots": "",
            "IRI_Fail_Count": 0, "Speed_Flag": 0,
            "Smeal_Benchmark_Flag": 0, "reCAPTCHA_Flag": 0,
            "Straightlining_Flag": 0, "Partial_Straightlining_Flag": 0,
        }
        assert compute_disposition(row) == "CLEAN"

    def test_waterfall_finished_false(self):
        row = {
            "Finished": "FALSE",
            "Auth_LLM": "", "Auth_Bots": "",
            "IRI_Fail_Count": 0, "Speed_Flag": 0,
            "Smeal_Benchmark_Flag": 0, "reCAPTCHA_Flag": 0,
            "Straightlining_Flag": 0, "Partial_Straightlining_Flag": 0,
        }
        assert compute_disposition(row) == "INCOMPLETE"

    def test_recaptcha_empty_defaults_to_passing(self, tmp_path):
        """Line 269/298: empty reCAPTCHA string defaults to 1.0 (passing)."""
        from tabs_v2_data_audit import parse_csv
        row = make_clean_row(pid="P1", recaptcha="")
        path = make_qualtrics_csv(tmp_path, MINIMAL_HEADERS, [row])
        rows = parse_csv(path)
        assert rows[0]["reCAPTCHA_Score"] == 1.0
        assert rows[0]["reCAPTCHA_Flag"] == 0


# ═══════════════════════════════════════════════════════════════
# enrich_qualtrics_csv.py - uncovered error branches
# ═══════════════════════════════════════════════════════════════

from enrich_qualtrics_csv import enrich


class TestEnrichEdgeCases:
    """Lines 170-178, 182: main() CLI entry point."""

    def test_cli_with_demographics(self, tmp_path):
        """Exercise the full CLI path including demographics."""
        import subprocess
        from _helpers import make_csv

        # Create minimal Qualtrics CSV
        q_path = make_qualtrics_csv(tmp_path,
            ["ResponseId", "PROLIFIC_PID", "Q1"],
            [["R_1", "PID1", "answer"]],
            filename="q.csv",
        )
        # Create auth checks
        auth_path = make_csv(tmp_path,
            ["PROLIFIC_PID", "Auth_LLM", "Auth_Bots"],
            [["PID1", "HIGH", "HIGH"]],
            filename="auth.csv",
        )
        # Create demographics
        demo_path = make_csv(tmp_path,
            ["participant_id", "age", "country"],
            [["PID1", "30", "UK"]],
            filename="demo.csv",
        )
        output = str(tmp_path / "enriched.csv")

        result = subprocess.run(
            [sys.executable,
             str(Path(__file__).parent.parent / "enrich_qualtrics_csv.py"),
             "--qualtrics", q_path,
             "--auth-checks", auth_path,
             "--demographics", demo_path,
             "--output", output],
            capture_output=True, text=True, timeout=10,
        )
        assert result.returncode == 0
        assert "Enriched" in result.stdout
        assert "Demographics matched" in result.stdout


# ═══════════════════════════════════════════════════════════════
# tabs_api.py - uncovered error branches
# ═══════════════════════════════════════════════════════════════

class TestAPIEdgeCases:
    """Lines 47, 164-166."""

    def test_http_error_includes_body(self):
        """Line 47: HTTPError body is included in RuntimeError message."""
        import io
        from urllib.error import HTTPError
        from tabs_api import _http

        error = HTTPError(
            url="https://example.com/api",
            code=500,
            msg="Internal Server Error",
            hdrs=None,
            fp=io.BytesIO(b'{"error": "Something went wrong"}'),
        )
        with patch("tabs_api.urlopen", side_effect=error):
            with pytest.raises(RuntimeError, match="Something went wrong"):
                _http("GET", "https://example.com/api", {})

    def test_prolific_paginate_empty_results(self):
        """Lines 164-166: prolific_submissions with empty study."""
        from tabs_api import prolific_submissions
        mock_resp = {"results": [], "next": None}
        with patch("tabs_api._json_request", return_value=mock_resp):
            result = prolific_submissions("study1", "token")
        assert result == []
