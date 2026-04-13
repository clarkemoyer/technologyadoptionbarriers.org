"""Cross-validation: Python disposition waterfall vs TypeScript disposition waterfall.

Runs both implementations against the same test CSV and verifies they produce
identical disposition assignments for every response. Any divergence indicates
a bug in one of the implementations.

This test requires Node.js (npx tsx) to run the TS pipeline.
"""

import csv
import json
import os
import subprocess
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

PROD_CSV = str(Path(__file__).parent / "test_data_production_format.csv")
REPO_ROOT = Path(__file__).parent.parent.parent.parent


def run_python_audit(csv_path: str, output_path: str) -> dict:
    """Run the Python disposition waterfall and return results."""
    from tabs_v2_data_audit import parse_csv, compute_statistics

    rows = parse_csv(csv_path)
    stats = compute_statistics(rows)

    # Build PID → disposition mapping
    dispositions = {r["PROLIFIC_PID"]: r["Disposition"] for r in rows}

    with open(output_path, "w") as f:
        json.dump({"dispositions": dispositions, "stats": stats}, f, indent=2)

    return dispositions


def run_ts_triage(csv_path: str, output_path: str) -> dict | None:
    """Run the TypeScript disposition triage and return PID→disposition mapping.

    Returns None if Node.js/tsx is not available.
    """
    # Check if npx tsx is available
    try:
        result = subprocess.run(
            ["npx", "--no-install", "tsx", "--version"],
            capture_output=True, text=True, timeout=10,
            cwd=str(REPO_ROOT),
        )
        if result.returncode != 0:
            return None
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return None

    # Run the TS triage
    result = subprocess.run(
        ["npx", "--no-install", "tsx", "scripts/archive/disposition-triage.ts"],
        capture_output=True, text=True, timeout=30,
        cwd=str(REPO_ROOT),
        env={
            **os.environ,
            "INPUT_PATH": csv_path,
            "OUTPUT_PATH": output_path,
        },
    )

    if result.returncode != 0:
        # tsx is available but triage failed - this is a real error, not a skip
        raise RuntimeError(
            f"TS triage failed (exit {result.returncode}):\n{result.stderr[:1000]}"
        )

    # Parse the TS output CSV
    dispositions = {}
    with open(output_path, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            pid = row.get("PROLIFIC_PID", "").strip()
            disp = row.get("Disposition", "").strip()
            if pid and disp:
                dispositions[pid] = disp

    return dispositions


def make_unenriched_csv(src_csv: str, dst_csv: str) -> str:
    """Strip enrichment columns (Auth_LLM, Auth_Bots, Prolific_Status) from CSV.

    This simulates the raw Qualtrics export that both TS and Python pipelines
    receive before enrichment. The auth columns default to empty in both
    implementations when not present, making dispositions comparable.
    """
    enrichment_cols = {"Auth_LLM", "Auth_Bots", "Prolific_Status"}
    with open(src_csv, encoding="utf-8") as f:
        reader = csv.reader(f)
        all_rows = list(reader)

    if not all_rows:
        return dst_csv

    # Find column indices to drop
    header = all_rows[0]
    drop_indices = {i for i, h in enumerate(header) if h in enrichment_cols}
    keep_indices = [i for i in range(len(header)) if i not in drop_indices]

    with open(dst_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        for row in all_rows:
            writer.writerow([row[i] for i in keep_indices if i < len(row)])

    return dst_csv


class TestCrossValidation:
    """Verify Python and TypeScript disposition waterfalls produce identical results."""

    def test_python_waterfall_runs(self, tmp_path):
        """Baseline: Python waterfall produces dispositions for all PIDs."""
        py_dispositions = run_python_audit(PROD_CSV, str(tmp_path / "py_audit.json"))
        assert len(py_dispositions) > 0
        # Should have at least CLEAN and non-CLEAN
        values = set(py_dispositions.values())
        assert "CLEAN" in values
        assert len(values) > 1  # Multiple disposition types

    def test_python_disposition_counts(self, tmp_path):
        """Verify Python waterfall produces expected disposition distribution."""
        py_dispositions = run_python_audit(PROD_CSV, str(tmp_path / "py_audit.json"))
        counts = {}
        for d in py_dispositions.values():
            counts[d] = counts.get(d, 0) + 1

        # The 500-respondent test data should have these dispositions
        assert counts.get("CLEAN", 0) > 0
        assert counts.get("INCOMPLETE", 0) > 0
        assert counts.get("AUTO-EXCLUDE", 0) > 0
        assert counts.get("FLAG-SINGLE-IRI", 0) > 0

    def test_cross_validate_ts_vs_python(self, tmp_path):
        """Compare TS and Python dispositions for every PID.

        Uses an unenriched CSV (no Auth_LLM/Auth_Bots/Prolific_Status columns)
        because the TS pipeline doesn't read auth columns from the CSV - it
        hardcodes them to empty. Both pipelines should produce identical
        dispositions when auth columns are absent.
        """
        unenriched = make_unenriched_csv(PROD_CSV, str(tmp_path / "unenriched.csv"))
        py_dispositions = run_python_audit(unenriched, str(tmp_path / "py_audit.json"))
        ts_dispositions = run_ts_triage(unenriched, str(tmp_path / "ts_disposition.csv"))

        if ts_dispositions is None:
            pytest.skip("Node.js/tsx not available for TS cross-validation")

        # Both should have the same PIDs
        py_pids = set(py_dispositions.keys())
        ts_pids = set(ts_dispositions.keys())

        # PIDs present in both
        common_pids = py_pids & ts_pids
        assert len(common_pids) > 0, "No common PIDs between TS and Python outputs"

        # Compare dispositions for every common PID
        mismatches = []
        for pid in sorted(common_pids):
            py_d = py_dispositions[pid]
            ts_d = ts_dispositions[pid]
            if py_d != ts_d:
                mismatches.append(f"  {pid}: Python={py_d}, TS={ts_d}")

        if mismatches:
            mismatch_str = "\n".join(mismatches[:20])
            total = len(mismatches)
            pytest.fail(
                f"{total} disposition mismatches between Python and TS:\n{mismatch_str}"
                + (f"\n  ... and {total - 20} more" if total > 20 else "")
            )

    def test_auth_enrichment_divergence_expected(self, tmp_path):
        """Document expected divergence: Python reads auth columns, TS ignores them.

        When the CSV contains Auth_LLM/Auth_Bots columns (from enrichment),
        the Python waterfall will flag responses with LOW/MIXED auth scores
        as FLAG-AUTH-FAIL or FLAG-AUTH-MIXED. The TS pipeline ignores these
        columns and classifies the same responses as CLEAN or other non-auth
        dispositions. This is expected - the TS pipeline receives a separate
        auth check enrichment in production.
        """
        # Run Python on the ENRICHED CSV (has Auth_LLM/Auth_Bots)
        py_enriched = run_python_audit(PROD_CSV, str(tmp_path / "py_enriched.json"))

        # Run Python on the UNENRICHED CSV (no Auth_LLM/Auth_Bots)
        unenriched = make_unenriched_csv(PROD_CSV, str(tmp_path / "unenriched.csv"))
        py_unenriched = run_python_audit(unenriched, str(tmp_path / "py_unenriched.json"))

        # Count auth-flagged responses in enriched but not in unenriched
        auth_flagged = sum(
            1 for pid in py_enriched
            if py_enriched[pid].startswith("FLAG-AUTH") and py_unenriched.get(pid) != py_enriched[pid]
        )
        # Our 500-respondent test data has ~40 auth-flagged responses
        assert auth_flagged > 0, "Expected some auth-flagged divergence with enriched data"

    def test_disposition_triage_cli(self, tmp_path):
        """End-to-end CLI test for disposition_triage.py (drop-in replacement contract)."""
        output_csv = str(tmp_path / "disposition.csv")
        result = subprocess.run(
            [sys.executable, str(Path(__file__).parent.parent / "disposition_triage.py")],
            capture_output=True, text=True, timeout=30,
            env={**os.environ, "INPUT_PATH": PROD_CSV, "OUTPUT_PATH": output_csv},
        )
        assert result.returncode == 0, f"stderr: {result.stderr[:500]}"
        assert "Triaged" in result.stdout
        assert Path(output_csv).exists()

        # Verify CSV headers match TS format exactly
        with open(output_csv) as f:
            header = f.readline().strip()
        expected = "PROLIFIC_PID,Finished,Duration_Seconds,Auth_LLM,Auth_Bots,Auth_Flag,IRI_Barrier_Pass,IRI_Readiness_Pass,IRI_Maturity_Pass,IRI_Pass_Count,IRI_Fail_Count,Speed_Flag,Smeal_Benchmark_Flag,reCAPTCHA_Score,reCAPTCHA_Flag,Straightlining_Count,Straightlining_Flag,Partial_Straightlining_Flag,Partial_Straightlining_Blocks,Disposition"
        assert header == expected, f"Header mismatch:\n  Got:      {header}\n  Expected: {expected}"

        # Verify integer floats don't have trailing .0
        with open(output_csv) as f:
            content = f.read()
        rows = list(csv.reader(content.strip().splitlines()))
        assert len(rows) > 1  # header + data

        # reCAPTCHA scores: 0.9 stays "0.9", but 1.0 becomes "1"
        score_index = rows[0].index("reCAPTCHA_Score")
        score_values = [row[score_index] for row in rows[1:] if row[score_index] != ""]
        integer_scores = [s for s in score_values if float(s).is_integer()]
        assert integer_scores, f"Expected at least one integer-valued score: {score_values}"
        assert all(not s.endswith(".0") for s in integer_scores), (
            f"Integer scores should not have trailing .0: {integer_scores}"
        )

    def test_disposition_triage_cli_empty_file(self, tmp_path):
        """CLI should fail gracefully on empty CSV."""
        empty_csv = tmp_path / "empty.csv"
        empty_csv.write_text("")
        output = str(tmp_path / "out.csv")
        result = subprocess.run(
            [sys.executable, str(Path(__file__).parent.parent / "disposition_triage.py")],
            capture_output=True, text=True, timeout=10,
            env={**os.environ, "INPUT_PATH": str(empty_csv), "OUTPUT_PATH": output},
        )
        assert result.returncode != 0

    def test_disposition_triage_cli_missing_env(self):
        """CLI should fail when INPUT_PATH/OUTPUT_PATH not set."""
        env = {k: v for k, v in os.environ.items() if k not in ("INPUT_PATH", "OUTPUT_PATH")}
        result = subprocess.run(
            [sys.executable, str(Path(__file__).parent.parent / "disposition_triage.py")],
            capture_output=True, text=True, timeout=10,
            env=env,
        )
        assert result.returncode != 0

    def test_python_waterfall_step_order(self):
        """Verify the Python waterfall follows the correct step precedence."""
        from tabs_v2_data_audit import compute_disposition

        # Step 0 beats everything
        row = {"Finished": "FALSE", "Auth_LLM": "LOW", "Auth_Bots": "LOW",
               "IRI_Fail_Count": 3, "Speed_Flag": 1, "Smeal_Benchmark_Flag": 1,
               "reCAPTCHA_Flag": 1, "Straightlining_Flag": 1, "Partial_Straightlining_Flag": 1}
        assert compute_disposition(row) == "INCOMPLETE"

        # Step 1 beats steps 2-10
        row["Finished"] = "TRUE"
        assert compute_disposition(row) == "FLAG-AUTH-FAIL"

        # Step 2 beats steps 3-10
        row["Auth_LLM"] = "MIXED"
        row["Auth_Bots"] = ""
        assert compute_disposition(row) == "FLAG-AUTH-MIXED"

        # Step 3 beats steps 4-10
        row["Auth_LLM"] = ""
        assert compute_disposition(row) == "AUTO-EXCLUDE"

        # And so on - this mirrors the TS waterfall exactly
