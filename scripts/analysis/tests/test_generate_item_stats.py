"""Tests for generate_item_stats.py — per-item means and ranking logic."""

import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from _helpers import make_qualtrics_csv, make_clean_row, MINIMAL_HEADERS


# ── Fixtures ──────────────────────────────────────────────────────────────────

def _make_enriched_csv(tmp_path: Path, rows: list[list[str]]) -> str:
    """Create an enriched Qualtrics-format CSV with Prolific status columns."""
    # Enriched CSV has all MINIMAL_HEADERS plus Prolific_Status
    headers = MINIMAL_HEADERS + ["Prolific_Status", "Auth_LLM", "Auth_Bots"]

    path = tmp_path / "enriched.csv"
    import csv
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerow([""] * len(headers))  # sub-header
        writer.writerow([""] * len(headers))  # import IDs
        for row in rows:
            # Pad rows to match header length
            padded = list(row) + [""] * (len(headers) - len(row))
            writer.writerow(padded)
    return str(path)


def _make_approved_row(pid: str = "P1", response_id: str = "R_1", **kwargs) -> list[str]:
    """Create a row that is APPROVED and passes all quality checks."""
    base = make_clean_row(pid=pid, response_id=response_id, **kwargs)
    # Pad for Prolific_Status, Auth_LLM, Auth_Bots
    return base + ["APPROVED", "HIGH", "PASS"]


# ── Import guard ───────────────────────────────────────────────────────────────

class TestImports:
    def test_module_importable(self):
        import generate_item_stats
        assert hasattr(generate_item_stats, "generate_item_stats")


# ── generate_item_stats ───────────────────────────────────────────────────────

class TestGenerateItemStats:
    def test_basic_structure(self, tmp_path):
        rows = [_make_approved_row(f"P{i}", f"R_{i}") for i in range(5)]
        csv_path = _make_enriched_csv(tmp_path, rows)

        from generate_item_stats import generate_item_stats
        result = generate_item_stats(csv_path, "conservative_clean")

        assert "generatedAt" in result
        assert "sampleKey" in result
        assert result["sampleKey"] == "conservative_clean"
        assert "n" in result
        assert "constructs" in result

    def test_constructs_present(self, tmp_path):
        rows = [_make_approved_row(f"P{i}", f"R_{i}") for i in range(5)]
        csv_path = _make_enriched_csv(tmp_path, rows)

        from generate_item_stats import generate_item_stats
        result = generate_item_stats(csv_path, "conservative_clean")
        constructs = result["constructs"]

        assert "barriers" in constructs
        assert "readiness" in constructs
        assert "maturity" in constructs

    def test_barrier_item_count(self, tmp_path):
        rows = [_make_approved_row(f"P{i}", f"R_{i}") for i in range(5)]
        csv_path = _make_enriched_csv(tmp_path, rows)

        from generate_item_stats import generate_item_stats
        result = generate_item_stats(csv_path, "conservative_clean")

        assert result["constructs"]["barriers"]["numItems"] == 18
        assert len(result["constructs"]["barriers"]["items"]) == 18

    def test_readiness_item_count(self, tmp_path):
        rows = [_make_approved_row(f"P{i}", f"R_{i}") for i in range(5)]
        csv_path = _make_enriched_csv(tmp_path, rows)

        from generate_item_stats import generate_item_stats
        result = generate_item_stats(csv_path, "conservative_clean")

        assert result["constructs"]["readiness"]["numItems"] == 17
        assert len(result["constructs"]["readiness"]["items"]) == 17

    def test_maturity_item_count(self, tmp_path):
        rows = [_make_approved_row(f"P{i}", f"R_{i}") for i in range(5)]
        csv_path = _make_enriched_csv(tmp_path, rows)

        from generate_item_stats import generate_item_stats
        result = generate_item_stats(csv_path, "conservative_clean")

        assert result["constructs"]["maturity"]["numItems"] == 8
        assert len(result["constructs"]["maturity"]["items"]) == 8

    def test_top5_bottom5_present(self, tmp_path):
        rows = [_make_approved_row(f"P{i}", f"R_{i}") for i in range(5)]
        csv_path = _make_enriched_csv(tmp_path, rows)

        from generate_item_stats import generate_item_stats
        result = generate_item_stats(csv_path, "conservative_clean")
        barriers = result["constructs"]["barriers"]

        assert "top5" in barriers
        assert "bottom5" in barriers
        assert len(barriers["top5"]) == 5
        assert len(barriers["bottom5"]) == 5

    def test_top5_has_rank_and_name(self, tmp_path):
        rows = [_make_approved_row(f"P{i}", f"R_{i}") for i in range(5)]
        csv_path = _make_enriched_csv(tmp_path, rows)

        from generate_item_stats import generate_item_stats
        result = generate_item_stats(csv_path, "conservative_clean")
        top5 = result["constructs"]["barriers"]["top5"]

        assert top5[0]["rank"] == 1
        assert "name" in top5[0]
        assert "mean" in top5[0]

    def test_each_item_has_required_fields(self, tmp_path):
        rows = [_make_approved_row(f"P{i}", f"R_{i}") for i in range(5)]
        csv_path = _make_enriched_csv(tmp_path, rows)

        from generate_item_stats import generate_item_stats
        result = generate_item_stats(csv_path, "conservative_clean")
        items = result["constructs"]["barriers"]["items"]

        for item in items:
            assert "col" in item
            assert "name" in item
            assert "mean" in item
            assert "sd" in item
            assert "n" in item

    def test_n_matches_sample_size(self, tmp_path):
        rows = [_make_approved_row(f"P{i}", f"R_{i}") for i in range(5)]
        csv_path = _make_enriched_csv(tmp_path, rows)

        from generate_item_stats import generate_item_stats
        result = generate_item_stats(csv_path, "conservative_clean")
        # The conservative_clean sample is subset of approved rows
        assert result["n"] >= 0
        assert result["n"] <= 5

    def test_invalid_sample_key_raises(self, tmp_path):
        rows = [_make_approved_row(f"P{i}", f"R_{i}") for i in range(5)]
        csv_path = _make_enriched_csv(tmp_path, rows)

        from generate_item_stats import generate_item_stats
        with pytest.raises(ValueError, match="Unknown sample key"):
            generate_item_stats(csv_path, "nonexistent_key")

    def test_generated_at_is_iso(self, tmp_path):
        rows = [_make_approved_row(f"P{i}", f"R_{i}") for i in range(5)]
        csv_path = _make_enriched_csv(tmp_path, rows)

        from generate_item_stats import generate_item_stats
        import datetime
        result = generate_item_stats(csv_path, "conservative_clean")
        datetime.datetime.fromisoformat(result["generatedAt"].replace("Z", "+00:00"))

    def test_prolific_accepted_sample(self, tmp_path):
        """prolific_accepted sample key is accepted without error."""
        rows = [_make_approved_row(f"P{i}", f"R_{i}") for i in range(5)]
        csv_path = _make_enriched_csv(tmp_path, rows)

        from generate_item_stats import generate_item_stats
        result = generate_item_stats(csv_path, "prolific_accepted")
        assert result["sampleKey"] == "prolific_accepted"


# ── main() (CLI) ──────────────────────────────────────────────────────────────

class TestCLI:
    def test_missing_input_csv_exits(self, monkeypatch, capsys, tmp_path):
        monkeypatch.delenv("INPUT_CSV", raising=False)
        monkeypatch.setenv("OUTPUT_PATH", str(tmp_path / "out.json"))
        from generate_item_stats import main
        with pytest.raises(SystemExit) as exc:
            main()
        assert exc.value.code == 1
        captured = capsys.readouterr()
        assert "INPUT_CSV" in captured.err

    def test_missing_output_path_exits(self, monkeypatch, capsys, tmp_path):
        # Create a dummy CSV so INPUT_CSV check passes
        csv_path = str(tmp_path / "dummy.csv")
        import csv as csvmod
        with open(csv_path, "w") as f:
            csvmod.writer(f).writerow(["col"])
        monkeypatch.setenv("INPUT_CSV", csv_path)
        monkeypatch.delenv("OUTPUT_PATH", raising=False)
        from generate_item_stats import main
        with pytest.raises(SystemExit) as exc:
            main()
        assert exc.value.code == 1
        captured = capsys.readouterr()
        assert "OUTPUT_PATH" in captured.err

    def test_full_run_writes_json(self, monkeypatch, tmp_path):
        rows = [_make_approved_row(f"P{i}", f"R_{i}") for i in range(5)]
        csv_path = _make_enriched_csv(tmp_path, rows)
        out_path = str(tmp_path / "item-stats.json")

        monkeypatch.setenv("INPUT_CSV", csv_path)
        monkeypatch.setenv("OUTPUT_PATH", out_path)
        monkeypatch.setenv("SAMPLE", "conservative_clean")

        from generate_item_stats import main
        main()

        assert Path(out_path).exists()
        with open(out_path) as f:
            data = json.load(f)
        assert "constructs" in data
        assert data["constructs"]["barriers"]["numItems"] == 18
