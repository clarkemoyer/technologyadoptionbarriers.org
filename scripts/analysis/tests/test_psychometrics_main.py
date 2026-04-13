"""Tests for tabs_v2_psychometrics.py main() - full report generation.

Runs main() against the production-format test CSV and verifies all 12
report sections are generated. This covers lines 419-1251 which make up
the bulk of uncovered code.
"""

import sys
from pathlib import Path
from unittest.mock import patch

import numpy as np
import pandas as pd
import pytest

PROD_CSV = str(Path(__file__).parent / "test_data_production_format.csv")


@pytest.fixture
def run_main(capsys):
    """Run psychometrics main() and return captured stdout."""
    with patch.object(sys, "argv", ["test", PROD_CSV]):
        if "tabs_v2_psychometrics" in sys.modules:
            del sys.modules["tabs_v2_psychometrics"]
        sys.path.insert(0, str(Path(__file__).parent.parent))
        import tabs_v2_psychometrics as mod
        mod.main()
    return capsys.readouterr().out


class TestPsychometricsMainReport:
    """Verify all 12 report sections are generated."""

    def test_header(self, run_main):
        assert "INSTRUMENT VALIDATION & DATA QUALITY REPORT" in run_main

    def test_part1_header(self, run_main):
        assert "PART I: INSTRUMENT VALIDATION" in run_main

    def test_section1_content_validity(self, run_main):
        assert "CONTENT VALIDITY EVIDENCE" in run_main
        assert "Barriers:" in run_main
        assert "Readiness:" in run_main
        assert "Maturity:" in run_main
        assert "18 items" in run_main
        assert "17 items" in run_main
        assert "8 items" in run_main

    def test_section2_construct_validity_pca(self, run_main):
        assert "CONSTRUCT VALIDITY" in run_main
        assert "PCA" in run_main or "FACTOR ANALYSIS" in run_main
        # Should report KMO and Bartlett for each construct
        assert "KMO" in run_main
        assert "Bartlett" in run_main

    def test_section3_reliability(self, run_main):
        assert "RELIABILITY" in run_main
        assert "Cronbach" in run_main
        # Should report alpha for each construct
        out = run_main
        assert "Barriers" in out
        # Should have confidence intervals
        assert "CI" in out or "95%" in out

    def test_section4_convergent_discriminant(self, run_main):
        assert "CONVERGENT" in run_main or "DISCRIMINANT" in run_main
        # Should report AVE, HTMT
        assert "AVE" in run_main
        assert "HTMT" in run_main

    def test_section5_iri_effectiveness(self, run_main):
        assert "IRI" in run_main
        assert "Barrier" in run_main
        # Should report pass rates
        assert "pass" in run_main.lower() or "Pass" in run_main

    def test_part2_header(self, run_main):
        assert "PART II: RESPONSE DATA VALIDATION" in run_main

    def test_section6_sample_characteristics(self, run_main):
        assert "SAMPLE CHARACTERISTICS" in run_main or "REPRESENTATIVENESS" in run_main

    def test_section7_missing_data(self, run_main):
        assert "MISSING DATA" in run_main

    def test_section8_response_quality(self, run_main):
        assert "RESPONSE QUALITY" in run_main

    def test_section9_distributions(self, run_main):
        assert "DISTRIBUTIONAL" in run_main

    def test_section10_cmv(self, run_main):
        assert "COMMON METHOD" in run_main or "CMV" in run_main or "Harman" in run_main

    def test_section11_response_bias(self, run_main):
        assert "BIAS" in run_main or "bias" in run_main

    def test_section12_sensitivity(self, run_main):
        # Final sensitivity analysis section
        assert "sensitivity" in run_main.lower() or "Correlation Structure" in run_main

    def test_report_complete(self, run_main):
        assert "Report generation complete" in run_main

    def test_key_findings(self, run_main):
        assert "Key Findings" in run_main


class TestPsychometricsMainDataProcessing:
    """Verify data processing within main()."""

    def _get_module(self):
        with patch.object(sys, "argv", ["test", PROD_CSV]):
            if "tabs_v2_psychometrics" in sys.modules:
                del sys.modules["tabs_v2_psychometrics"]
            sys.path.insert(0, str(Path(__file__).parent.parent))
            import tabs_v2_psychometrics as mod
            return mod

    def test_load_and_encode(self):
        mod = self._get_module()
        df = mod.load_data()
        encoded = mod.encode_scales(df)
        # After encoding, barrier columns should be numeric (1-5)
        for col in mod.BARRIER_ITEM_COLS:
            valid = encoded[col].dropna()
            if len(valid) > 0:
                assert valid.min() >= 1
                assert valid.max() <= 5

    def test_v2_filtering(self):
        mod = self._get_module()
        df = mod.load_data()
        v2_mask = df["StartDate"] >= mod.V2_THRESHOLD
        v2_count = v2_mask.sum()
        assert v2_count > 0
        assert v2_count <= len(df)

    def test_iri_pass_computation(self):
        mod = self._get_module()
        df = mod.load_data()
        encoded = mod.encode_scales(df)
        # IRI pass = exact match to expected answer (after encoding, it's a numeric value)
        barrier_pass = encoded[mod.BARRIER_IRI_COL] == mod.BARRIER_SCALE[mod.IRI_EXPECTED["barrier"]]
        assert barrier_pass.sum() > 0  # some should pass

    def test_encode_dont_know_as_nan(self):
        """Don't Know responses should become NaN after encoding."""
        mod = self._get_module()
        df = mod.load_data()
        encoded = mod.encode_scales(df)
        # The P_DONTK_01 respondent has Don't Know in some readiness items
        # After encoding, those should be NaN
        for col in mod.READINESS_ITEM_COLS:
            dk_mask = df[col].astype(str).str.strip() == "Don't Know"
            if dk_mask.any():
                encoded_vals = encoded.loc[dk_mask, col]
                assert encoded_vals.isna().all(), f"{col} Don't Know should be NaN"

    def test_person_means_excludes_nan(self):
        mod = self._get_module()
        df = mod.load_data()
        encoded = mod.encode_scales(df)
        means = mod.person_means(encoded, mod.READINESS_ITEM_COLS)
        # Person means should still be computed even if some items are NaN
        assert means.notna().sum() > 0

    def test_cronbach_alpha_ci_feldt(self):
        """Test Feldt confidence interval method."""
        mod = self._get_module()
        df = mod.load_data()
        encoded = mod.encode_scales(df)
        # Apply V2 filter
        v2_mask = encoded["StartDate"] >= mod.V2_THRESHOLD
        v2_data = encoded[v2_mask]
        barrier_data = v2_data[mod.BARRIER_ITEM_COLS].dropna()
        if len(barrier_data) >= 10:
            lower, upper = mod.cronbach_alpha_ci(barrier_data, method="feldt")
            alpha = mod.cronbach_alpha(barrier_data)
            assert lower <= alpha <= upper

    def test_subconstruct_definitions(self):
        """Verify sub-construct item indices are valid."""
        mod = self._get_module()
        for name, items in mod.BARRIER_SUBCONSTRUCTS.items():
            for item_num in items:
                assert 1 <= item_num <= 18, f"Barrier sub-construct {name} has invalid item {item_num}"
        for name, items in mod.READINESS_SUBCONSTRUCTS.items():
            for item_num in items:
                assert 1 <= item_num <= 17, f"Readiness sub-construct {name} has invalid item {item_num}"
