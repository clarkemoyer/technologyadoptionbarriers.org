"""Tests for generate_item_stats.py — per-item statistics generation."""

import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from generate_item_stats import build_item_stats, compute_item_stats, compute_max_delta
from tabs_v2_analysis import BARRIER_COLS, BARRIER_SCALE, MATURITY_COLS, MATURITY_SCALE

from _helpers import MINIMAL_HEADERS, make_clean_row, make_qualtrics_csv


# ── compute_max_delta ────────────────────────────────────────────────────────


class TestComputeMaxDelta:
    def test_basic(self):
        stats = [
            {"mean": 3.0, "sd": 0.5, "n": 10},
            {"mean": 3.5, "sd": 0.6, "n": 10},
            {"mean": 2.8, "sd": 0.4, "n": 10},
            {"mean": 3.2, "sd": 0.5, "n": 10},
        ]
        result = compute_max_delta(stats)
        assert result == pytest.approx(0.7, abs=1e-4)

    def test_all_same(self):
        stats = [{"mean": 3.0, "sd": 0.5, "n": 10}] * 4
        result = compute_max_delta(stats)
        assert result == pytest.approx(0.0, abs=1e-4)

    def test_with_none(self):
        stats = [
            {"mean": 3.0, "sd": 0.5, "n": 10},
            {"mean": None, "sd": None, "n": 0},
            {"mean": 3.5, "sd": 0.6, "n": 10},
            {"mean": 3.2, "sd": 0.5, "n": 10},
        ]
        result = compute_max_delta(stats)
        assert result == pytest.approx(0.5, abs=1e-4)

    def test_single_valid_returns_none(self):
        stats = [
            {"mean": 3.0, "sd": 0.5, "n": 10},
            {"mean": None, "sd": None, "n": 0},
        ]
        assert compute_max_delta(stats) is None

    def test_all_none_returns_none(self):
        stats = [{"mean": None, "sd": None, "n": 0}] * 4
        assert compute_max_delta(stats) is None


# ── compute_item_stats ───────────────────────────────────────────────────────


class TestComputeItemStats:
    def _make_rows_and_idx(self):
        """Make a minimal list of rows and index for testing."""
        idx = {col: i for i, col in enumerate(BARRIER_COLS)}
        # 3 rows with known barrier values
        rows = []
        for val in ("Not a Barrier", "Minor Barrier", "Major Barrier"):
            row = [""] * len(BARRIER_COLS)
            for col in BARRIER_COLS:
                row[idx[col]] = val
            rows.append(row)
        return rows, idx

    def test_length_equals_cols(self):
        rows, idx = self._make_rows_and_idx()
        result = compute_item_stats(rows, BARRIER_COLS, BARRIER_SCALE, idx)
        assert len(result) == len(BARRIER_COLS)

    def test_mean_and_sd_values(self):
        rows, idx = self._make_rows_and_idx()
        result = compute_item_stats(rows, BARRIER_COLS, BARRIER_SCALE, idx)
        # All cols have same responses: 1, 2, 5 → mean = 8/3 ≈ 2.6667
        for stat in result:
            assert stat["n"] == 3
            assert stat["mean"] == pytest.approx(8 / 3, abs=1e-3)

    def test_empty_rows_returns_none(self):
        idx = {col: i for i, col in enumerate(BARRIER_COLS)}
        result = compute_item_stats([], BARRIER_COLS, BARRIER_SCALE, idx)
        assert len(result) == len(BARRIER_COLS)
        for stat in result:
            assert stat["mean"] is None
            assert stat["sd"] is None
            assert stat["n"] == 0


# ── build_item_stats ─────────────────────────────────────────────────────────


class TestBuildItemStats:
    def test_output_structure(self, tmp_path):
        """build_item_stats returns expected top-level keys."""
        rows = [make_clean_row(pid=f"PID{i:03d}", response_id=f"R_{i:03d}") for i in range(5)]
        csv_path = make_qualtrics_csv(tmp_path, MINIMAL_HEADERS, rows)
        result = build_item_stats(csv_path)

        assert "last_updated" in result
        assert "constructs" in result
        assert set(result["constructs"].keys()) == {"barriers", "readiness", "maturity"}

    def test_barriers_item_count(self, tmp_path):
        rows = [make_clean_row(pid=f"PID{i:03d}", response_id=f"R_{i:03d}") for i in range(5)]
        csv_path = make_qualtrics_csv(tmp_path, MINIMAL_HEADERS, rows)
        result = build_item_stats(csv_path)

        assert len(result["constructs"]["barriers"]["items"]) == len(BARRIER_COLS)

    def test_readiness_item_count(self, tmp_path):
        from tabs_v2_analysis import READINESS_COLS

        rows = [make_clean_row(pid=f"PID{i:03d}", response_id=f"R_{i:03d}") for i in range(5)]
        csv_path = make_qualtrics_csv(tmp_path, MINIMAL_HEADERS, rows)
        result = build_item_stats(csv_path)

        assert len(result["constructs"]["readiness"]["items"]) == len(READINESS_COLS)

    def test_maturity_item_count(self, tmp_path):
        rows = [make_clean_row(pid=f"PID{i:03d}", response_id=f"R_{i:03d}") for i in range(5)]
        csv_path = make_qualtrics_csv(tmp_path, MINIMAL_HEADERS, rows)
        result = build_item_stats(csv_path)

        assert len(result["constructs"]["maturity"]["items"]) == len(MATURITY_COLS)

    def test_item_has_required_keys(self, tmp_path):
        rows = [make_clean_row(pid=f"PID{i:03d}", response_id=f"R_{i:03d}") for i in range(5)]
        csv_path = make_qualtrics_csv(tmp_path, MINIMAL_HEADERS, rows)
        result = build_item_stats(csv_path)

        item = result["constructs"]["barriers"]["items"][0]
        assert "col" in item
        assert "name" in item
        assert "groups" in item
        assert "max_delta" in item

    def test_item_groups_have_four_primary_keys(self, tmp_path):
        rows = [make_clean_row(pid=f"PID{i:03d}", response_id=f"R_{i:03d}") for i in range(5)]
        csv_path = make_qualtrics_csv(tmp_path, MINIMAL_HEADERS, rows)
        result = build_item_stats(csv_path)

        item = result["constructs"]["barriers"]["items"][0]
        expected_keys = {"conservative_clean", "flexible_clean", "prolific_accepted", "v2_finished"}
        assert set(item["groups"].keys()) == expected_keys

    def test_group_stat_has_mean_sd_n(self, tmp_path):
        rows = [make_clean_row(pid=f"PID{i:03d}", response_id=f"R_{i:03d}") for i in range(5)]
        csv_path = make_qualtrics_csv(tmp_path, MINIMAL_HEADERS, rows)
        result = build_item_stats(csv_path)

        item = result["constructs"]["barriers"]["items"][0]
        for sk in ["conservative_clean", "flexible_clean", "prolific_accepted", "v2_finished"]:
            stat = item["groups"][sk]
            assert "mean" in stat
            assert "sd" in stat
            assert "n" in stat

    def test_conservative_clean_subset_of_flexible_clean(self, tmp_path):
        """Conservative clean N ≤ flexible clean N for every item."""
        rows = [make_clean_row(pid=f"PID{i:03d}", response_id=f"R_{i:03d}") for i in range(10)]
        csv_path = make_qualtrics_csv(tmp_path, MINIMAL_HEADERS, rows)
        result = build_item_stats(csv_path)

        for construct in result["constructs"].values():
            for item in construct["items"]:
                cc_n = item["groups"]["conservative_clean"]["n"]
                fc_n = item["groups"]["flexible_clean"]["n"]
                assert cc_n <= fc_n, f"{item['name']}: conservative({cc_n}) > flexible({fc_n})"

    def test_max_delta_non_negative(self, tmp_path):
        rows = [make_clean_row(pid=f"PID{i:03d}", response_id=f"R_{i:03d}") for i in range(10)]
        csv_path = make_qualtrics_csv(tmp_path, MINIMAL_HEADERS, rows)
        result = build_item_stats(csv_path)

        for construct in result["constructs"].values():
            for item in construct["items"]:
                if item["max_delta"] is not None:
                    assert item["max_delta"] >= 0

    def test_col_and_name_match_constants(self, tmp_path):
        """First item col and name match BARRIER_COLS[0] and BARRIER_NAMES[0]."""
        from tabs_v2_analysis import BARRIER_NAMES

        rows = [make_clean_row(pid=f"PID{i:03d}", response_id=f"R_{i:03d}") for i in range(3)]
        csv_path = make_qualtrics_csv(tmp_path, MINIMAL_HEADERS, rows)
        result = build_item_stats(csv_path)

        first = result["constructs"]["barriers"]["items"][0]
        assert first["col"] == BARRIER_COLS[0]
        assert first["name"] == BARRIER_NAMES[0]


# ── CLI integration ──────────────────────────────────────────────────────────


class TestCLIIntegration:
    def test_cli_writes_json(self, tmp_path):
        """Running the script via subprocess writes valid JSON."""
        import subprocess

        rows = [make_clean_row(pid=f"PID{i:03d}", response_id=f"R_{i:03d}") for i in range(5)]
        csv_path = make_qualtrics_csv(tmp_path, MINIMAL_HEADERS, rows)
        out_path = str(tmp_path / "item-stats.json")
        script = str(Path(__file__).parent.parent / "generate_item_stats.py")

        res = subprocess.run(
            [sys.executable, script, csv_path, "--output", out_path],
            capture_output=True,
            text=True,
        )
        assert res.returncode == 0, res.stderr
        data = json.loads(Path(out_path).read_text())
        assert "constructs" in data
        assert set(data["constructs"].keys()) == {"barriers", "readiness", "maturity"}
