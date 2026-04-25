"""Extended tests to increase coverage across all modules.

Targets specific uncovered lines identified by coverage analysis:
  - tabs_v2_analysis.py: load_data, print_*, person_means edge cases,
    cohens_d pooled=0, kurtosis_excess, print_sensitivity, print_disposition
  - tabs_v2_data_audit.py: parse_csv with synthetic data, print_summary,
    constants fallback
  - tabs_api.py: _http error path, no-CSV-in-ZIP, pagination,
    demographics failure, auth fallback fields
  - enrich_qualtrics_csv.py: too-few-rows error, missing-PID error
"""

import csv
import io
import json
import math
import sys
import zipfile
from io import StringIO
from pathlib import Path
from unittest.mock import patch, MagicMock
from urllib.error import HTTPError

import pytest

sys.path.insert(0, str(Path(__file__).parent))
sys.path.insert(0, str(Path(__file__).parent.parent))

from _helpers import make_qualtrics_csv, make_csv, make_json, MINIMAL_HEADERS, make_clean_row


# ═══════════════════════════════════════════════════════════════
# tabs_v2_analysis.py - additional coverage
# ═══════════════════════════════════════════════════════════════

from tabs_v2_analysis import (
    mean_sd, pearson_r, cohens_d, cronbach_alpha, skewness, kurtosis_excess,
    person_means, load_data, filter_samples, print_disposition, print_sensitivity,
    print_demographics, print_item_rankings, print_correlations_and_reliability,
    print_effect_sizes, print_cross_tabs, sensitivity_to_json,
    BARRIER_SCALE, READINESS_SCALE, MATURITY_SCALE,
    BARRIER_COLS, READINESS_COLS, MATURITY_COLS,
)


class TestCohensD_Extended:
    def test_nonzero_effect(self):
        d, ci_l, ci_u = cohens_d([1, 2, 3, 4], [5, 6, 7, 8])
        assert d is not None
        assert d < 0  # group1 < group2

    def test_empty_groups(self):
        assert cohens_d([], [1, 2, 3]) == (None, None, None)

    def test_none_values_in_groups(self):
        assert cohens_d([None, None], [1, 2, 3]) == (None, None, None)


class TestKurtosisExcess:
    def test_normal_data(self):
        vals = [1, 2, 3, 4, 5, 6, 7, 8]
        k = kurtosis_excess(vals)
        assert k is not None
        assert isinstance(k, float)

    def test_constant_data(self):
        assert kurtosis_excess([5, 5, 5, 5]) == 0

    def test_too_few(self):
        assert kurtosis_excess([1, 2, 3]) is None


class TestPersonMeans:
    def test_with_none_values(self):
        """person_means should skip None scale values."""
        idx = {"A": 0, "B": 1}
        rows = [["Major Barrier", "InvalidValue"]]
        result = person_means(rows, ["A", "B"], BARRIER_SCALE, idx)
        # "Major Barrier" = 5, "InvalidValue" = None → mean of [5] = 5.0
        assert result == [5.0]

    def test_all_none(self):
        idx = {"A": 0}
        rows = [["InvalidValue"]]
        result = person_means(rows, ["A"], BARRIER_SCALE, idx)
        assert result == [None]


class TestLoadData:
    def test_loads_test_csv(self, test_data_csv):
        idx, data = load_data(test_data_csv)
        assert "ResponseId" in idx
        assert "StartDate" in idx
        assert len(data) > 0


class TestPrintFunctions:
    """Test that print functions run without errors (output correctness is secondary)."""

    def test_print_disposition(self, test_data_csv, capsys):
        idx, data = load_data(test_data_csv)
        v2, samples = filter_samples(data, idx)
        print_disposition(v2, samples, idx)
        captured = capsys.readouterr()
        assert "DISPOSITION WATERFALL" in captured.out
        assert "Conservative Clean" in captured.out

    def test_print_demographics(self, test_data_csv, capsys):
        idx, data = load_data(test_data_csv)
        _, samples = filter_samples(data, idx)
        # Use v2_finished since test data may not have Prolific_Status column
        print_demographics(samples["v2_finished"], idx, "Test")
        captured = capsys.readouterr()
        assert "DEMOGRAPHICS" in captured.out

    def test_print_demographics_empty(self, capsys):
        print_demographics([], {}, "Empty")
        captured = capsys.readouterr()
        assert "No data" in captured.out

    def test_print_item_rankings(self, test_data_csv, capsys):
        idx, data = load_data(test_data_csv)
        _, samples = filter_samples(data, idx)
        print_item_rankings(samples["v2_finished"], idx)
        captured = capsys.readouterr()
        assert "BARRIER ITEM RANKINGS" in captured.out
        assert "Grand Mean" in captured.out

    def test_print_correlations_and_reliability(self, test_data_csv, capsys):
        idx, data = load_data(test_data_csv)
        _, samples = filter_samples(data, idx)
        print_correlations_and_reliability(samples["v2_finished"], idx)
        captured = capsys.readouterr()
        assert "CORRELATIONS" in captured.out
        assert "Cronbach" in captured.out

    def test_print_effect_sizes(self, test_data_csv, capsys):
        idx, data = load_data(test_data_csv)
        _, samples = filter_samples(data, idx)
        print_effect_sizes(samples["v2_finished"], idx)
        captured = capsys.readouterr()
        assert "EFFECT SIZES" in captured.out

    def test_print_cross_tabs(self, test_data_csv, capsys):
        idx, data = load_data(test_data_csv)
        _, samples = filter_samples(data, idx)
        print_cross_tabs(samples["v2_finished"], idx)
        captured = capsys.readouterr()
        assert "CROSS-TABULATIONS" in captured.out

    def test_print_sensitivity(self, prod_format_csv, capsys):
        idx, data = load_data(prod_format_csv)
        _, samples = filter_samples(data, idx)
        cuts = [
            ("Conservative Clean", samples["conservative_clean"]),
            ("Flexible Clean", samples["flexible_clean"]),
            ("All V2", samples["v2_all"]),
        ]
        print_sensitivity(cuts, idx)
        captured = capsys.readouterr()
        assert "SENSITIVITY ANALYSIS" in captured.out
        assert "Barrier Grand Mean" in captured.out

    def test_sensitivity_handles_na(self, capsys):
        """Sensitivity analysis should handle N/A for small samples."""
        idx = {"StartDate": 0, "Duration (in seconds)": 1}
        cuts = [("Empty", [])]
        print_sensitivity(cuts, idx)
        captured = capsys.readouterr()
        assert "N/A" in captured.out


# ═══════════════════════════════════════════════════════════════
# tabs_v2_data_audit.py - additional coverage
# ═══════════════════════════════════════════════════════════════

from tabs_v2_data_audit import (
    parse_csv, compute_statistics, print_summary,
)


class TestParseCsvSynthetic:
    def test_clean_row_parsed(self, tmp_path):
        path = make_qualtrics_csv(tmp_path, MINIMAL_HEADERS, [
            make_clean_row(pid="PID001", duration=600),
        ])
        rows = parse_csv(path)
        assert len(rows) == 1
        assert rows[0]["PROLIFIC_PID"] == "PID001"
        assert rows[0]["Duration_Seconds"] == 600
        assert rows[0]["Disposition"] == "CLEAN"

    def test_incomplete_row(self, tmp_path):
        row = make_clean_row(pid="PID002", finished="FALSE")
        path = make_qualtrics_csv(tmp_path, MINIMAL_HEADERS, [row])
        rows = parse_csv(path)
        assert rows[0]["Disposition"] == "INCOMPLETE"

    def test_speed_flag(self, tmp_path):
        row = make_clean_row(pid="PID003", duration=200)
        path = make_qualtrics_csv(tmp_path, MINIMAL_HEADERS, [row])
        rows = parse_csv(path)
        assert rows[0]["Speed_Flag"] == 1

    def test_iri_failure(self, tmp_path):
        row = make_clean_row(pid="PID004", barrier_iri="Wrong", readiness_iri="Wrong")
        path = make_qualtrics_csv(tmp_path, MINIMAL_HEADERS, [row])
        rows = parse_csv(path)
        assert rows[0]["IRI_Fail_Count"] == 2
        assert rows[0]["Disposition"] == "AUTO-EXCLUDE"

    def test_recaptcha_flag(self, tmp_path):
        row = make_clean_row(pid="PID005", recaptcha="0.3")
        path = make_qualtrics_csv(tmp_path, MINIMAL_HEADERS, [row])
        rows = parse_csv(path)
        assert rows[0]["reCAPTCHA_Flag"] == 1

    def test_smeal_benchmark(self, tmp_path):
        row = make_clean_row(pid="PID006", duration=450)
        path = make_qualtrics_csv(tmp_path, MINIMAL_HEADERS, [row])
        rows = parse_csv(path)
        assert rows[0]["Smeal_Benchmark_Flag"] == 1

    def test_multiple_rows_mixed(self, tmp_path):
        rows_data = [
            make_clean_row(pid="P1", duration=600),
            make_clean_row(pid="P2", duration=250, barrier_iri="Wrong"),
            make_clean_row(pid="P3", duration=700, recaptcha="0.2"),
        ]
        path = make_qualtrics_csv(tmp_path, MINIMAL_HEADERS, rows_data)
        rows = parse_csv(path)
        dispositions = {r["PROLIFIC_PID"]: r["Disposition"] for r in rows}
        assert dispositions["P1"] == "CLEAN"
        assert dispositions["P2"] == "AUTO-EXCLUDE"  # speed + 1 IRI
        assert dispositions["P3"] == "FLAG-RECAPTCHA"


class TestPrintSummary:
    def test_runs_without_error(self, tmp_path, capsys):
        rows_data = [make_clean_row(pid="P1"), make_clean_row(pid="P2")]
        path = make_qualtrics_csv(tmp_path, MINIMAL_HEADERS, rows_data)
        rows = parse_csv(path)
        stats = compute_statistics(rows)
        print_summary(rows, stats)
        captured = capsys.readouterr()
        assert "DISPOSITION WATERFALL REPORT" in captured.out
        assert "CLEAN" in captured.out


# ═══════════════════════════════════════════════════════════════
# tabs_api.py - additional coverage
# ═══════════════════════════════════════════════════════════════

from tabs_api import (
    _http, _json_request, _prolific_paginate,
    prolific_auth_checks_csv, prolific_demographics_csv,
    qualtrics_export_csv,
)


class TestHTTPErrorHandling:
    def test_http_error_raises_runtime(self):
        """_http should wrap HTTPError in RuntimeError."""
        error = HTTPError(
            url="https://example.com",
            code=403,
            msg="Forbidden",
            hdrs=None,
            fp=io.BytesIO(b"Access denied"),
        )
        with patch("tabs_api.urlopen", side_effect=error):
            with pytest.raises(RuntimeError, match="HTTP 403"):
                _http("GET", "https://example.com", {})


class TestProlificPagination:
    def test_multi_page(self):
        """Should follow 'next' links until None."""
        page1 = {"results": [{"id": 1}], "next": "https://api.prolific.com/page2"}
        page2 = {"results": [{"id": 2}], "next": None}

        call_count = [0]
        def mock_json_request(method, url, headers):
            r = page1 if call_count[0] == 0 else page2
            call_count[0] += 1
            return r

        with patch("tabs_api._json_request", side_effect=mock_json_request):
            results = _prolific_paginate("https://api.prolific.com/page1", {})

        assert len(results) == 2
        assert results[0]["id"] == 1
        assert results[1]["id"] == 2


class TestQualtricsCsvNoZip:
    def test_no_csv_in_zip_raises(self, tmp_path):
        """Should raise if ZIP contains no CSV files."""
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w") as zf:
            zf.writestr("readme.txt", "no csv here")
        zip_bytes = zip_buffer.getvalue()

        responses = [
            json.dumps({"result": {"progressId": "p1"}}).encode(),
            json.dumps({"result": {"percentComplete": 100, "fileId": "f1"}}).encode(),
            zip_bytes,
        ]
        call_idx = [0]
        def mock_http(m, u, h, body=None, timeout=60):
            r = responses[call_idx[0]]
            call_idx[0] += 1
            return r

        with patch("tabs_api._http", side_effect=mock_http):
            with patch("tabs_api.time.sleep"):
                with pytest.raises(RuntimeError, match="No CSV found"):
                    qualtrics_export_csv("t", "https://q.com", "S", str(tmp_path / "out.csv"))


class TestAuthChecksFallbackFields:
    def test_fallback_to_top_level_fields(self, tmp_path):
        """When authenticity dict is empty, should check top-level fields."""
        mock_subs = [
            {"participant_id": "PID1", "authenticity": {},
             "authenticity_score_llm": "HIGH", "authenticity_score_bots": "LOW"},
        ]
        with patch("tabs_api.prolific_submissions", return_value=mock_subs):
            out = str(tmp_path / "auth.csv")
            prolific_auth_checks_csv("s1", "t", out)

        with open(out) as f:
            rows = list(csv.DictReader(f))
        assert rows[0]["Auth_LLM"] == "HIGH"
        assert rows[0]["Auth_Bots"] == "LOW"


class TestDemographicsFailure:
    def test_http_error_returns_empty(self, tmp_path):
        """Demographics should return empty string on HTTP error."""
        error = HTTPError("https://api.prolific.com", 403, "Forbidden", None, io.BytesIO(b""))
        with patch("tabs_api.urlopen", side_effect=error):
            result = prolific_demographics_csv("s1", "t", str(tmp_path / "demo.csv"))
        assert result == ""


# ═══════════════════════════════════════════════════════════════
# enrich_qualtrics_csv.py - additional coverage
# ═══════════════════════════════════════════════════════════════

from enrich_qualtrics_csv import enrich


class TestEnrichErrors:
    def test_too_few_rows_exits(self, tmp_path):
        """CSV with fewer than 4 rows should exit."""
        path = tmp_path / "small.csv"
        path.write_text("header1,header2\nval1,val2\n")
        with pytest.raises(SystemExit):
            enrich(str(path), None, None, None, str(tmp_path / "out.csv"))

    def test_missing_pid_column_exits(self, tmp_path):
        """CSV without PROLIFIC_PID should exit."""
        path = tmp_path / "nopid.csv"
        lines = ["ResponseId,Q1\n", "subheader,sub\n", "importid,imp\n", "R_1,answer\n"]
        path.write_text("".join(lines))
        with pytest.raises(SystemExit):
            enrich(str(path), None, None, None, str(tmp_path / "out.csv"))
