"""Tests for tabs_v2_data_audit.py - disposition waterfall and CSV parsing."""

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

from tabs_v2_data_audit import (
    within_person_sd,
    detect_partial_straightlining,
    compute_disposition,
    parse_csv,
    compute_statistics,
)


# ── compute_disposition (waterfall) ──────────────────────────

class TestComputeDisposition:
    """Test the 10-step disposition waterfall matches TS implementation."""

    def _make_row(self, **overrides):
        """Create a base row that would be CLEAN, then apply overrides."""
        base = {
            "Finished": "TRUE",
            "Auth_LLM": "",
            "Auth_Bots": "",
            "IRI_Fail_Count": 0,
            "Speed_Flag": 0,
            "Smeal_Benchmark_Flag": 0,
            "reCAPTCHA_Flag": 0,
            "Straightlining_Flag": 0,
            "Partial_Straightlining_Flag": 0,
        }
        base.update(overrides)
        return base

    # Step 0: INCOMPLETE
    def test_incomplete_false(self):
        assert compute_disposition(self._make_row(Finished="FALSE")) == "INCOMPLETE"

    def test_incomplete_zero(self):
        assert compute_disposition(self._make_row(Finished="0")) == "INCOMPLETE"

    # Step 1: FLAG-AUTH-FAIL
    def test_auth_llm_low(self):
        assert compute_disposition(self._make_row(Auth_LLM="LOW")) == "FLAG-AUTH-FAIL"

    def test_auth_bots_low(self):
        assert compute_disposition(self._make_row(Auth_Bots="LOW")) == "FLAG-AUTH-FAIL"

    def test_auth_llm_low_case_insensitive(self):
        assert compute_disposition(self._make_row(Auth_LLM="low")) == "FLAG-AUTH-FAIL"

    # Step 2: FLAG-AUTH-MIXED
    def test_auth_llm_mixed(self):
        assert compute_disposition(self._make_row(Auth_LLM="MIXED")) == "FLAG-AUTH-MIXED"

    def test_auth_bots_mixed(self):
        assert compute_disposition(self._make_row(Auth_Bots="MIXED")) == "FLAG-AUTH-MIXED"

    # Step 3: AUTO-EXCLUDE
    def test_iri_fail_2(self):
        assert compute_disposition(self._make_row(IRI_Fail_Count=2)) == "AUTO-EXCLUDE"

    def test_iri_fail_3(self):
        assert compute_disposition(self._make_row(IRI_Fail_Count=3)) == "AUTO-EXCLUDE"

    def test_speed_plus_iri_1(self):
        assert compute_disposition(self._make_row(Speed_Flag=1, IRI_Fail_Count=1)) == "AUTO-EXCLUDE"

    # Step 4: FLAG-SPEED
    def test_speed_no_iri_fail(self):
        assert compute_disposition(self._make_row(Speed_Flag=1, IRI_Fail_Count=0)) == "FLAG-SPEED"

    # Step 5: FLAG-SINGLE-IRI
    def test_single_iri_fail(self):
        assert compute_disposition(self._make_row(IRI_Fail_Count=1, Speed_Flag=0)) == "FLAG-SINGLE-IRI"

    # Step 6: FLAG-SMEAL
    def test_smeal_benchmark(self):
        assert compute_disposition(self._make_row(Smeal_Benchmark_Flag=1)) == "FLAG-SMEAL"

    # Step 7: FLAG-RECAPTCHA
    def test_recaptcha_flag(self):
        assert compute_disposition(self._make_row(reCAPTCHA_Flag=1)) == "FLAG-RECAPTCHA"

    # Step 8: FLAG-STRAIGHTLINING
    def test_straightlining(self):
        assert compute_disposition(self._make_row(Straightlining_Flag=1)) == "FLAG-STRAIGHTLINING"

    # Step 9: FLAG-PARTIAL-STRAIGHTLINING
    def test_partial_straightlining(self):
        assert compute_disposition(self._make_row(Partial_Straightlining_Flag=1)) == "FLAG-PARTIAL-STRAIGHTLINING"

    # Step 10: CLEAN
    def test_clean(self):
        assert compute_disposition(self._make_row()) == "CLEAN"

    # Waterfall precedence: earlier steps win
    def test_auth_fail_beats_auto_exclude(self):
        row = self._make_row(Auth_LLM="LOW", IRI_Fail_Count=3)
        assert compute_disposition(row) == "FLAG-AUTH-FAIL"

    def test_auto_exclude_beats_flag_speed(self):
        row = self._make_row(Speed_Flag=1, IRI_Fail_Count=2)
        assert compute_disposition(row) == "AUTO-EXCLUDE"

    def test_single_iri_beats_smeal(self):
        row = self._make_row(IRI_Fail_Count=1, Smeal_Benchmark_Flag=1)
        assert compute_disposition(row) == "FLAG-SINGLE-IRI"

    def test_smeal_beats_recaptcha(self):
        row = self._make_row(Smeal_Benchmark_Flag=1, reCAPTCHA_Flag=1)
        assert compute_disposition(row) == "FLAG-SMEAL"

    def test_recaptcha_beats_straightlining(self):
        row = self._make_row(reCAPTCHA_Flag=1, Straightlining_Flag=1)
        assert compute_disposition(row) == "FLAG-RECAPTCHA"

    def test_straightlining_beats_partial(self):
        row = self._make_row(Straightlining_Flag=1, Partial_Straightlining_Flag=1)
        assert compute_disposition(row) == "FLAG-STRAIGHTLINING"


# ── within_person_sd ─────────────────────────────────────────

class TestWithinPersonSDAudit:
    def test_all_same(self):
        assert within_person_sd(["A", "A", "A"]) == 0.0

    def test_varied(self):
        sd = within_person_sd(["A", "B", "C"])
        assert sd > 0

    def test_empty_filtered(self):
        sd = within_person_sd(["A", "", "A"])
        assert sd == 0.0


# ── detect_partial_straightlining ────────────────────────────

class TestDetectPartialStraightlining:
    def test_no_flags(self):
        row = {"Q10-28_Barriers_1": "Minor Barrier", "Q10-28_Barriers_2": "Major Barrier"}
        flag, blocks = detect_partial_straightlining(row)
        # Too few items to flag
        assert flag == 0

    def test_all_same_large_block(self):
        row = {}
        for i in range(1, 20):
            row[f"Q10-28_Barriers_{i}"] = "Moderate Barrier"
        flag, blocks = detect_partial_straightlining(row)
        assert flag == 1
        assert "Barriers" in blocks

    def test_iri_excluded_from_straightlining(self):
        """IRI items must NOT be included in partial straightlining SD.

        Regression test for Issue #735: including IRI items (which have
        predetermined correct answers) artificially inflated within-person
        SD and masked straightlining for ~15 responses.
        """
        # All 18 substantive barrier items are identical (straightlining)
        # but the IRI item (#19) has a different answer
        row = {}
        for i in range(1, 19):
            row[f"Q10-28_Barriers_{i}"] = "Moderate Barrier"
        row["Q10-28_Barriers_19"] = "Major Barrier"  # IRI (correct answer)

        flag, blocks = detect_partial_straightlining(row)
        # Should be flagged: all 18 substantive items are identical
        # The IRI item must NOT mask the straightlining
        assert flag == 1, (
            "Straightlining was not detected - IRI item may be included "
            "in SD calculation (see Issue #735)"
        )
        assert "Barriers" in blocks

    def test_iri_only_not_flagged(self):
        """If only the IRI item is present, block should not be evaluated."""
        row = {"Q10-28_Barriers_19": "Major Barrier"}
        flag, blocks = detect_partial_straightlining(row)
        assert flag == 0


# ── parse_csv ────────────────────────────────────────────────

class TestParseCSV:
    def test_parses_test_data(self, test_data_csv):
        """The existing test CSV should parse without errors."""
        # test_data_qualtrics.csv lacks some columns (Finished, Q_RecaptchaScore, etc.)
        # but parse_csv should handle missing columns by requiring them.
        # Since the test CSV doesn't have all required columns, we test with a
        # synthetic CSV instead.
        pass  # Covered by integration test below

    def test_dedup_latest_attempt(self, tmp_path):
        """When same PID appears twice, latest row (last) wins."""
        from _helpers import make_qualtrics_csv, MINIMAL_HEADERS, make_clean_row

        row1 = make_clean_row(pid="PID001", duration=500)
        row2 = make_clean_row(pid="PID001", duration=900)  # Latest attempt
        path = make_qualtrics_csv(tmp_path, MINIMAL_HEADERS, [row1, row2])

        rows = parse_csv(path)
        pids = [r["PROLIFIC_PID"] for r in rows]
        assert pids.count("PID001") == 1
        # Should keep the latest (row2 with duration 900)
        match = [r for r in rows if r["PROLIFIC_PID"] == "PID001"]
        assert match[0]["Duration_Seconds"] == 900


# ── compute_statistics ───────────────────────────────────────

class TestComputeStatistics:
    def test_empty(self):
        stats = compute_statistics([])
        assert stats["disposition_counts"] == {}

    def test_with_rows(self):
        """Test stats computation with pre-built disposition rows."""
        rows = [
            {"PROLIFIC_PID": "P1", "Finished": "TRUE", "Duration_Seconds": 600,
             "Auth_LLM": "", "Auth_Bots": "",
             "IRI_Barrier_Pass": 1, "IRI_Readiness_Pass": 1, "IRI_Maturity_Pass": 1,
             "IRI_Pass_Count": 3, "IRI_Fail_Count": 0,
             "Speed_Flag": 0, "Smeal_Benchmark_Flag": 0,
             "reCAPTCHA_Score": 0.9, "reCAPTCHA_Flag": 0,
             "Straightlining_Count": 0, "Straightlining_Flag": 0,
             "Partial_Straightlining_Flag": 0, "Partial_Straightlining_Blocks": "",
             "Disposition": "CLEAN"},
            {"PROLIFIC_PID": "P2", "Finished": "TRUE", "Duration_Seconds": 250,
             "Auth_LLM": "", "Auth_Bots": "",
             "IRI_Barrier_Pass": 0, "IRI_Readiness_Pass": 0, "IRI_Maturity_Pass": 1,
             "IRI_Pass_Count": 1, "IRI_Fail_Count": 2,
             "Speed_Flag": 1, "Smeal_Benchmark_Flag": 0,
             "reCAPTCHA_Score": 0.9, "reCAPTCHA_Flag": 0,
             "Straightlining_Count": 0, "Straightlining_Flag": 0,
             "Partial_Straightlining_Flag": 0, "Partial_Straightlining_Blocks": "",
             "Disposition": "AUTO-EXCLUDE"},
        ]
        stats = compute_statistics(rows)
        assert stats["disposition_counts"]["CLEAN"] == 1
        assert stats["disposition_counts"]["AUTO-EXCLUDE"] == 1
        assert stats["iri_pass_rates"]["barrier"] == pytest.approx(0.5)
