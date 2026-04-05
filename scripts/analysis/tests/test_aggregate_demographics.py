"""Tests for aggregate_demographics.py — aggregation logic and privacy thresholds."""

import csv
import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from aggregate_demographics import (
    aggregate_demographics,
    _aggregate_categorical,
    _aggregate_age,
    _find_col,
    _safe_int,
    DEFAULT_MIN_CELL_SIZE,
)


# ── Helpers ───────────────────────────────────────────────────────────────────

DEMO_HEADERS = [
    "Participant id",
    "Age",
    "Sex",
    "Ethnicity simplified",
    "Country of residence",
    "Employment status",
    "Student status",
    "Language",
]


def _make_demo_csv(tmp_path: Path, rows: list[list[str]], filename: str = "demo.csv") -> str:
    """Write a Prolific-style demographics CSV to tmp_path."""
    path = tmp_path / filename
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(DEMO_HEADERS)
        for row in rows:
            writer.writerow(row)
    return str(path)


def _make_row(
    pid: str = "P1",
    age: str = "35",
    sex: str = "Male",
    ethnicity: str = "White",
    country: str = "United States",
    employment: str = "Full-Time",
    student: str = "No",
    language: str = "English",
) -> list[str]:
    return [pid, age, sex, ethnicity, country, employment, student, language]


# ── _find_col ─────────────────────────────────────────────────────────────────

class TestFindCol:
    def test_exact_match(self):
        assert _find_col(["Age", "Sex"], ["Age"]) == "Age"

    def test_case_insensitive(self):
        assert _find_col(["age", "sex"], ["Age"]) == "age"

    def test_priority_order(self):
        # First candidate wins
        assert _find_col(["nationality", "Country of residence"], ["Country of residence", "Nationality"]) == "Country of residence"

    def test_missing_returns_none(self):
        assert _find_col(["Age", "Sex"], ["Language"]) is None

    def test_empty_headers(self):
        assert _find_col([], ["Age"]) is None


# ── _safe_int ─────────────────────────────────────────────────────────────────

class TestSafeInt:
    def test_integer_string(self):
        assert _safe_int("35") == 35

    def test_float_string(self):
        assert _safe_int("35.0") == 35

    def test_empty_string(self):
        assert _safe_int("") is None

    def test_non_numeric(self):
        assert _safe_int("DATA_EXPIRED") is None

    def test_whitespace(self):
        assert _safe_int("  42  ") == 42


# ── _aggregate_categorical ────────────────────────────────────────────────────

class TestAggregateCategorical:
    def test_basic_counts(self):
        values = ["Male"] * 10 + ["Female"] * 8
        result = _aggregate_categorical(values, min_cell=5)
        labels = {r["label"] for r in result}
        assert "Male" in labels
        assert "Female" in labels

    def test_small_cell_merged_into_other(self):
        # 3 "Non-binary" — below min_cell=5, should merge into Other
        values = ["Male"] * 10 + ["Female"] * 8 + ["Non-binary"] * 3
        result = _aggregate_categorical(values, min_cell=5)
        labels = {r["label"] for r in result}
        assert "Non-binary" not in labels
        assert "Other / Prefer not to say" in labels

    def test_small_cell_count_absorbed_into_other(self):
        values = ["Male"] * 10 + ["Female"] * 8 + ["Non-binary"] * 3
        result = _aggregate_categorical(values, min_cell=5)
        other = next(r for r in result if r["label"] == "Other / Prefer not to say")
        assert other["count"] == 3

    def test_data_expired_normalized(self):
        values = ["Male"] * 10 + ["DATA_EXPIRED"] * 2 + ["Female"] * 8
        result = _aggregate_categorical(values, min_cell=1)
        labels = {r["label"] for r in result}
        assert "DATA_EXPIRED" not in labels
        # DATA_EXPIRED becomes "Prefer not to say / Not available"
        assert any("Prefer not to say" in lbl or "Not available" in lbl for lbl in labels)

    def test_empty_string_normalized(self):
        values = ["Male"] * 10 + [""] * 3 + ["Female"] * 8
        result = _aggregate_categorical(values, min_cell=1)
        labels = {r["label"] for r in result}
        assert "" not in labels

    def test_percentages_sum_to_100(self):
        values = ["A"] * 50 + ["B"] * 30 + ["C"] * 20
        result = _aggregate_categorical(values, min_cell=5)
        total_pct = sum(r["pct"] for r in result)
        assert abs(total_pct - 100.0) < 0.5  # Allow rounding tolerance

    def test_max_categories_respected(self):
        # 20 unique categories; max_cats=10 → overflow into "Other"
        values = [str(i) * 6 for i in range(20)]  # 20 unique values, 1 each — all small
        result = _aggregate_categorical(values, min_cell=1, max_cats=10)
        assert len(result) <= 10 + 1  # 10 named + Other

    def test_empty_input(self):
        result = _aggregate_categorical([], min_cell=5)
        assert result == []

    def test_all_small_cells_merged(self):
        # All categories below min_cell — everything goes into Other
        values = ["A"] * 3 + ["B"] * 2 + ["C"] * 1
        result = _aggregate_categorical(values, min_cell=5)
        assert len(result) == 1
        assert result[0]["label"] == "Other / Prefer not to say"
        assert result[0]["count"] == 6

    def test_pct_computed_correctly(self):
        values = ["Male"] * 6 + ["Female"] * 4
        result = _aggregate_categorical(values, min_cell=1)
        male = next(r for r in result if r["label"] == "Male")
        assert male["pct"] == pytest.approx(60.0)
        female = next(r for r in result if r["label"] == "Female")
        assert female["pct"] == pytest.approx(40.0)


# ── _aggregate_age ────────────────────────────────────────────────────────────

class TestAggregateAge:
    def test_basic_distribution(self):
        ages = list(range(20, 65))  # 45 values
        result = _aggregate_age(ages, min_cell=5)
        assert "ranges" in result
        assert "mean" in result
        assert "median" in result

    def test_mean_correct(self):
        ages = [20, 30, 40]
        result = _aggregate_age(ages, min_cell=1)
        assert result["mean"] == pytest.approx(30.0, abs=0.1)

    def test_median_odd(self):
        ages = [20, 30, 40]
        result = _aggregate_age(ages, min_cell=1)
        assert result["median"] == pytest.approx(30.0)

    def test_median_even(self):
        ages = [20, 30, 40, 50]
        result = _aggregate_age(ages, min_cell=1)
        assert result["median"] == pytest.approx(35.0)

    def test_small_bin_suppressed(self):
        # Only 3 people in 18-24 range — below min_cell=5, count suppressed (None)
        ages = [20, 21, 22] + [30] * 10
        result = _aggregate_age(ages, min_cell=5)
        r_1824 = next(r for r in result["ranges"] if r["range"] == "18-24")
        assert r_1824["count"] is None
        assert r_1824["pct"] is None

    def test_large_bin_not_suppressed(self):
        ages = [30] * 10 + [20, 21, 22]
        result = _aggregate_age(ages, min_cell=5)
        r_2534 = next(r for r in result["ranges"] if r["range"] == "25-34")
        assert r_2534["count"] == 10
        assert r_2534["pct"] is not None

    def test_empty_ages(self):
        result = _aggregate_age([], min_cell=5)
        assert result["ranges"] == []
        assert result["mean"] is None
        assert result["median"] is None

    def test_none_ages_filtered(self):
        ages = [None, 30, None, 40]
        result = _aggregate_age(ages, min_cell=1)
        assert result["mean"] == pytest.approx(35.0)

    def test_65_plus_bucket(self):
        ages = [66, 70, 75, 80, 85, 90]
        result = _aggregate_age(ages, min_cell=5)
        r_65 = next(r for r in result["ranges"] if r["range"] == "65+")
        assert r_65["count"] == 6


# ── aggregate_demographics (integration) ─────────────────────────────────────

class TestAggregateDemographics:
    def test_basic_structure(self, tmp_path):
        rows = [_make_row(f"P{i}", str(25 + i)) for i in range(20)]
        csv_path = _make_demo_csv(tmp_path, rows)
        result = aggregate_demographics(csv_path, min_cell=5)

        assert "generatedAt" in result
        assert result["totalParticipants"] == 20
        assert result["sampleUsed"] == "prolific_accepted"
        assert "age" in result
        assert "gender" in result
        assert "country" in result
        assert "employmentStatus" in result
        assert "studentStatus" in result
        assert "firstLanguage" in result

    def test_total_participant_count(self, tmp_path):
        rows = [_make_row(f"P{i}") for i in range(15)]
        csv_path = _make_demo_csv(tmp_path, rows)
        result = aggregate_demographics(csv_path, min_cell=1)
        assert result["totalParticipants"] == 15

    def test_privacy_min_cell_respected(self, tmp_path):
        # 12 Male, 6 Female, 3 Other — with min_cell=5, "Other" sex should merge
        rows = (
            [_make_row(f"P{i}", sex="Male") for i in range(12)]
            + [_make_row(f"P{i + 12}", sex="Female") for i in range(6)]
            + [_make_row(f"P{i + 18}", sex="Non-binary") for i in range(3)]
        )
        csv_path = _make_demo_csv(tmp_path, rows)
        result = aggregate_demographics(csv_path, min_cell=5)
        gender_labels = {c["label"] for c in result["gender"]["categories"]}
        assert "Non-binary" not in gender_labels

    def test_no_pid_in_output(self, tmp_path):
        rows = [_make_row(f"PID_{i}") for i in range(10)]
        csv_path = _make_demo_csv(tmp_path, rows)
        result = aggregate_demographics(csv_path, min_cell=1)
        result_json = json.dumps(result)
        assert "PID_0" not in result_json
        assert "PID_9" not in result_json

    def test_empty_csv_raises(self, tmp_path):
        csv_path = str(tmp_path / "empty.csv")
        with open(csv_path, "w") as f:
            f.write("Participant id,Age,Sex\n")  # header only, no rows
        with pytest.raises(ValueError, match="empty"):
            aggregate_demographics(csv_path, min_cell=5)

    def test_age_mean_and_median_computed(self, tmp_path):
        # 10 rows with ages 30-39
        rows = [_make_row(f"P{i}", age=str(30 + i)) for i in range(10)]
        csv_path = _make_demo_csv(tmp_path, rows)
        result = aggregate_demographics(csv_path, min_cell=1)
        assert result["age"]["mean"] == pytest.approx(34.5, abs=0.1)
        assert result["age"]["median"] is not None

    def test_generated_at_is_iso(self, tmp_path):
        rows = [_make_row(f"P{i}") for i in range(10)]
        csv_path = _make_demo_csv(tmp_path, rows)
        result = aggregate_demographics(csv_path, min_cell=1)
        # Should parse without exception
        import datetime
        datetime.datetime.fromisoformat(result["generatedAt"].replace("Z", "+00:00"))

    def test_columns_found_metadata(self, tmp_path):
        rows = [_make_row(f"P{i}") for i in range(10)]
        csv_path = _make_demo_csv(tmp_path, rows)
        result = aggregate_demographics(csv_path, min_cell=1)
        assert "columnsFound" in result
        assert result["columnsFound"]["age"] == "Age"
        assert result["columnsFound"]["sex"] == "Sex"

    def test_country_max_10_categories(self, tmp_path):
        # Create 15 distinct countries with enough participants each
        countries = [f"Country{i}" for i in range(15)]
        rows = []
        for i, country in enumerate(countries):
            for j in range(6):
                rows.append(_make_row(f"P_{i}_{j}", country=country))
        csv_path = _make_demo_csv(tmp_path, rows)
        result = aggregate_demographics(csv_path, min_cell=5)
        # Country is limited to max_cats=10 → at most 11 entries (10 named + Other)
        assert len(result["country"]["categories"]) <= 11

    def test_utf8_bom_handled(self, tmp_path):
        """CSV with BOM (utf-8-sig) should parse correctly."""
        path = tmp_path / "bom.csv"
        with open(path, "w", newline="", encoding="utf-8-sig") as f:
            writer = csv.writer(f)
            writer.writerow(DEMO_HEADERS)
            writer.writerow(_make_row("P1"))
        result = aggregate_demographics(str(path), min_cell=1)
        assert result["totalParticipants"] == 1


# ── main() (CLI) ──────────────────────────────────────────────────────────────

class TestCLI:
    def test_missing_output_path_exits(self, monkeypatch, capsys):
        """main() must exit(1) when OUTPUT_PATH is not set."""
        monkeypatch.delenv("OUTPUT_PATH", raising=False)
        monkeypatch.delenv("INPUT_CSV", raising=False)
        from aggregate_demographics import main
        with pytest.raises(SystemExit) as exc:
            main()
        assert exc.value.code == 1
        captured = capsys.readouterr()
        assert "OUTPUT_PATH" in captured.err

    def test_missing_input_csv_exits(self, monkeypatch, capsys, tmp_path):
        """main() must exit(1) when INPUT_CSV path doesn't exist."""
        monkeypatch.setenv("OUTPUT_PATH", str(tmp_path / "out.json"))
        monkeypatch.setenv("INPUT_CSV", "/nonexistent/path/demo.csv")
        from aggregate_demographics import main
        with pytest.raises(SystemExit) as exc:
            main()
        assert exc.value.code == 1

    def test_full_run_writes_json(self, monkeypatch, tmp_path):
        """main() writes valid JSON when INPUT_CSV and OUTPUT_PATH are set."""
        # Create minimal demographics CSV
        csv_path = str(tmp_path / "demo.csv")
        rows = [_make_row(f"P{i}", str(25 + i)) for i in range(10)]
        with open(csv_path, "w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(DEMO_HEADERS)
            writer.writerows(rows)

        out_path = str(tmp_path / "demographics.json")
        monkeypatch.setenv("INPUT_CSV", csv_path)
        monkeypatch.setenv("OUTPUT_PATH", out_path)
        monkeypatch.setenv("MIN_CELL_SIZE", "1")

        from aggregate_demographics import main
        main()

        assert Path(out_path).exists()
        with open(out_path) as f:
            data = json.load(f)
        assert data["totalParticipants"] == 10
