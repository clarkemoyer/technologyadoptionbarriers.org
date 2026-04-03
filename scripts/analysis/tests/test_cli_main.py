"""Tests for CLI main() entry points via subprocess.

Covers:
  - tabs_v2_analysis.py main() (lines 810-872)
  - tabs_v2_data_audit.py main() (lines 529-572)
  - enrich_qualtrics_csv.py main() (lines 170-182)
  - Additional analysis branch coverage for edge cases
"""

import json
import subprocess
import sys
from pathlib import Path

import pytest

PROD_CSV = str(Path(__file__).parent / "test_data_production_format.csv")
SCRIPTS = Path(__file__).parent.parent


class TestAnalysisMain:
    def test_default_run(self):
        result = subprocess.run(
            [sys.executable, str(SCRIPTS / "tabs_v2_analysis.py"), PROD_CSV],
            capture_output=True, text=True, timeout=30,
        )
        assert result.returncode == 0, f"stderr: {result.stderr[:500]}"
        assert "SENSITIVITY ANALYSIS" in result.stdout
        assert "ANALYSIS COMPLETE" in result.stdout

    def test_json_output(self, tmp_path):
        json_path = str(tmp_path / "sensitivity.json")
        result = subprocess.run(
            [sys.executable, str(SCRIPTS / "tabs_v2_analysis.py"), PROD_CSV, "--json", json_path],
            capture_output=True, text=True, timeout=30,
        )
        assert result.returncode == 0
        assert Path(json_path).exists()
        data = json.loads(Path(json_path).read_text())
        assert "samples" in data
        assert "metrics" in data
        assert len(data["samples"]) == 5

    def test_primary_sample_conservative_clean(self):
        result = subprocess.run(
            [sys.executable, str(SCRIPTS / "tabs_v2_analysis.py"), PROD_CSV,
             "--primary-sample", "conservative_clean"],
            capture_output=True, text=True, timeout=30,
        )
        assert result.returncode == 0
        assert "Conservative Clean" in result.stdout

    def test_primary_sample_prolific_accepted(self):
        result = subprocess.run(
            [sys.executable, str(SCRIPTS / "tabs_v2_analysis.py"), PROD_CSV,
             "--primary-sample", "prolific_accepted"],
            capture_output=True, text=True, timeout=30,
        )
        assert result.returncode == 0
        assert "Prolific Accepted" in result.stdout

    def test_primary_sample_v2_all(self):
        result = subprocess.run(
            [sys.executable, str(SCRIPTS / "tabs_v2_analysis.py"), PROD_CSV,
             "--primary-sample", "v2_all"],
            capture_output=True, text=True, timeout=30,
        )
        assert result.returncode == 0

    def test_no_args_exits(self):
        result = subprocess.run(
            [sys.executable, str(SCRIPTS / "tabs_v2_analysis.py")],
            capture_output=True, text=True, timeout=10,
        )
        assert result.returncode != 0


class TestDataAuditMain:
    def test_default_run(self, tmp_path):
        output = str(tmp_path / "audit.json")
        result = subprocess.run(
            [sys.executable, str(SCRIPTS / "tabs_v2_data_audit.py"),
             "--input", PROD_CSV, "--output", output],
            capture_output=True, text=True, timeout=30,
        )
        assert result.returncode == 0
        assert Path(output).exists()
        data = json.loads(Path(output).read_text())
        assert "disposition_counts" in data
        assert "CLEAN" in data["disposition_counts"]

    def test_no_args_exits(self):
        result = subprocess.run(
            [sys.executable, str(SCRIPTS / "tabs_v2_data_audit.py")],
            capture_output=True, text=True, timeout=10,
        )
        assert result.returncode != 0


class TestEnrichMain:
    def test_cli_run(self, tmp_path):
        """Test the full CLI path of enrich_qualtrics_csv.py."""
        # Create auth checks
        auth_path = tmp_path / "auth.csv"
        auth_path.write_text("PROLIFIC_PID,Auth_LLM,Auth_Bots\nP_CLEAN_01,HIGH,HIGH\n")

        output = str(tmp_path / "enriched.csv")
        result = subprocess.run(
            [sys.executable, str(SCRIPTS / "enrich_qualtrics_csv.py"),
             "--qualtrics", PROD_CSV,
             "--auth-checks", str(auth_path),
             "--output", output],
            capture_output=True, text=True, timeout=30,
        )
        assert result.returncode == 0
        assert Path(output).exists()
        assert "Enriched" in result.stdout


class TestAnalysisBranchCoverage:
    """Tests that exercise specific uncovered branches in the analysis functions."""

    def test_effect_sizes_with_prod_data(self, prod_format_csv, capsys):
        """Run print_effect_sizes with production data that has role diversity."""
        sys.path.insert(0, str(Path(__file__).parent.parent))
        from tabs_v2_analysis import load_data, filter_samples, print_effect_sizes
        idx, data = load_data(prod_format_csv)
        _, samples = filter_samples(data, idx)
        print_effect_sizes(samples["flexible_clean"], idx)
        out = capsys.readouterr().out
        assert "EFFECT SIZES" in out

    def test_cross_tabs_with_prod_data(self, prod_format_csv, capsys):
        """Run print_cross_tabs with production data."""
        sys.path.insert(0, str(Path(__file__).parent.parent))
        from tabs_v2_analysis import load_data, filter_samples, print_cross_tabs
        idx, data = load_data(prod_format_csv)
        _, samples = filter_samples(data, idx)
        print_cross_tabs(samples["flexible_clean"], idx)
        out = capsys.readouterr().out
        assert "CROSS-TABULATIONS" in out
        assert "Org Size" in out
        assert "Profit Model" in out

    def test_correlations_with_insufficient_data(self, capsys):
        """Test correlation printing with too few data points."""
        sys.path.insert(0, str(Path(__file__).parent.parent))
        from tabs_v2_analysis import print_correlations_and_reliability, BARRIER_COLS
        # Single row → correlations return N/A
        idx = {col: i for i, col in enumerate(["ResponseId", "StartDate", "Duration (in seconds)"] + BARRIER_COLS)}
        # Not enough data to compute correlations
        print_correlations_and_reliability([], idx)
        out = capsys.readouterr().out
        # Empty rows should handle gracefully
        assert "CORRELATIONS" in out
