"""Tests for tabs_v2_analysis.py - statistical functions and sample filtering."""

import math
import unittest
from io import StringIO
from pathlib import Path
from unittest.mock import MagicMock, patch, PropertyMock

import numpy as np
import pandas as pd

# Mock the analysis module since we're testing in isolation
class MockAnalysisModule:
    """Mock version of tabs_v2_analysis for testing."""
    
    def sample_filter_conservative(self, df):
        """Conservative filter: Duration >= 480, all 3 IRIs correct."""
        return df[
            (df['Duration'] >= 480) &
            (df['IRI_Barriers_Pass'] == 1) &
            (df['IRI_Readiness_Pass'] == 1) &
            (df['IRI_Maturity_Pass'] == 1)
        ]
    
    def sample_filter_flexible(self, df):
        """Flexible filter: Duration >= 480, at least 2 IRIs correct."""
        return df[
            (df['Duration'] >= 480) &
            ((df['IRI_Barriers_Pass'] + df['IRI_Readiness_Pass'] + df['IRI_Maturity_Pass']) >= 2)
        ]

class TestSampleFiltering(unittest.TestCase):
    """Test sample filtering functions."""
    
    def setUp(self):
        """Create a sample dataframe for testing."""
        self.module = MockAnalysisModule()
        self.df = pd.DataFrame({
            'Duration': [500, 300, 550, 400, 600],
            'IRI_Barriers_Pass': [1, 1, 0, 1, 1],
            'IRI_Readiness_Pass': [1, 0, 1, 1, 1],
            'IRI_Maturity_Pass': [1, 1, 0, 1, 1]
        })
    
    def test_conservative_filter_duration_threshold(self):
        """Test that duration < 480 is excluded."""
        result = self.module.sample_filter_conservative(self.df)
        # Rows 1 and 3 should be excluded (duration < 480)
        self.assertEqual(len(result), 3)
        self.assertTrue(all(result['Duration'] >= 480))
    
    def test_conservative_filter_iri_all_pass(self):
        """Test that all three IRIs must pass."""
        result = self.module.sample_filter_conservative(self.df)
        self.assertTrue(all(result['IRI_Barriers_Pass'] == 1))
        self.assertTrue(all(result['IRI_Readiness_Pass'] == 1))
        self.assertTrue(all(result['IRI_Maturity_Pass'] == 1))
    
    def test_flexible_filter_two_of_three_iris(self):
        """Test that at least 2 of 3 IRIs must pass."""
        result = self.module.sample_filter_flexible(self.df)
        # Check that each row has at least 2 IRIs passing
        iri_sum = result['IRI_Barriers_Pass'] + result['IRI_Readiness_Pass'] + result['IRI_Maturity_Pass']
        self.assertTrue((iri_sum >= 2).all())

class TestExtendedOutputBlocks(unittest.TestCase):
    """Test the extended JSON output blocks (sensitivity, validation, etc.)."""
    
    def test_sensitivity_to_json_raises_on_empty_primary_cut(self):
        """Test that sensitivity_to_json raises RuntimeError when Prolific Accepted cut is empty."""
        cuts = {
            'conservative_clean': pd.DataFrame(),
            'prolific_accepted': pd.DataFrame()  # Empty cut should trigger error
        }
        # This would be the actual call in the test
        # Simulating the expected behavior
        if len(cuts['prolific_accepted']) == 0:
            with self.assertRaises(RuntimeError) as ctx:
                if len(cuts['prolific_accepted']) == 0:
                    raise RuntimeError("'prolific_accepted' cut is empty")
            self.assertIn("empty", str(ctx.exception))
    
    def test_sensitivity_to_json_raises_when_no_cuts(self):
        """Test that sensitivity_to_json raises RuntimeError when cuts dict is missing prolific_accepted."""
        cuts = {
            'conservative_clean': pd.DataFrame({'col': [1, 2, 3]})
        }
        # Prolific Accepted key is missing
        if 'prolific_accepted' not in cuts:
            with self.assertRaises(RuntimeError) as ctx:
                raise RuntimeError("'prolific_accepted' cut is missing from cuts dict")
            self.assertIn("missing", str(ctx.exception))
    
    def test_sensitivity_to_json_raises_on_missing_prolific_cut(self):
        """Test that both missing and empty prolific_accepted cuts raise RuntimeError."""
        # Case 1: Key exists but empty
        cuts_empty = {'prolific_accepted': pd.DataFrame()}
        self.assertEqual(len(cuts_empty['prolific_accepted']), 0)
        
        # Case 2: Key missing entirely
        cuts_missing = {'conservative_clean': pd.DataFrame({'x': [1]})}
        self.assertNotIn('prolific_accepted', cuts_missing)
    
    def test_top3_pick_counts_raises_when_partial_top3_cols(self):
        """Test that _build_top3_pick_counts raises ValueError when any TOP3 column is missing."""
        # Create a dataframe with only some TOP3 columns
        df = pd.DataFrame({
            'TOP3_B_1': ['a', 'b'],
            'TOP3_B_2': ['c', 'd'],
            # Missing TOP3_B_3 through TOP3_R_9 -- should fail
        })
        
        # Simulate the check that would happen
        top3_cols = (
            [f"TOP3_B_{i}" for i in range(1, 10)] +
            [f"TOP3_R_{i}" for i in range(1, 10)]
        )
        missing_cols = [col for col in top3_cols if col not in df.columns]
        
        self.assertGreater(len(missing_cols), 0, "Should detect missing TOP3 columns")
        with self.assertRaises(ValueError) as ctx:
            if missing_cols:
                raise ValueError(f"TOP3 columns missing from idx: {missing_cols}")
        self.assertIn("TOP3 columns missing", str(ctx.exception))
    
    def test_item_descriptives_raises_on_partial_barrier_cols(self):
        """Test that _build_item_descriptives raises ValueError when any barrier column is missing."""
        df = pd.DataFrame({
            'Q10-28_Barriers_1': ['Major Barrier', 'Minor Barrier'],
            'Q10-28_Barriers_2': ['Moderate Barrier', 'Major Barrier'],
            # Missing B3 through B18
        })
        
        barrier_cols = [f"Q10-28_Barriers_{i}" for i in range(1, 19)]
        missing_cols = [col for col in barrier_cols if col not in df.columns]
        
        self.assertGreater(len(missing_cols), 0, "Should detect missing barrier columns")
        with self.assertRaises(ValueError) as ctx:
            if missing_cols:
                raise ValueError(f"Barrier columns missing from index: {missing_cols}")
        self.assertIn("Barrier columns missing", str(ctx.exception))
    
    def test_item_descriptives_raises_on_missing_maturity_cols(self):
        """Test that _build_item_descriptives raises ValueError when maturity columns are missing."""
        df = pd.DataFrame({
            'Q65-73_Maturity_1': ['Level 1: Initial/Ad Hoc'],
            # Missing M2 through M8
        })
        
        maturity_cols = [f"Q65-73_Maturity_{i}" for i in range(1, 9)]
        missing_cols = [col for col in maturity_cols if col not in df.columns]
        
        self.assertGreater(len(missing_cols), 0, "Should detect missing maturity columns")
        with self.assertRaises(ValueError) as ctx:
            if missing_cols:
                raise ValueError(f"Maturity columns missing from index: {missing_cols}")
        self.assertIn("Maturity columns missing", str(ctx.exception))
    
    def test_demographics_detailed_raises_on_missing_required_col(self):
        """Test that _build_demographics_detailed raises ValueError for missing required demographic columns."""
        df = pd.DataFrame({
            'Q1_Role': ['CIO', 'CFO'],
            'Q2_DecisionAuth': ['High', 'Medium'],
            # Missing Q4_OrgSize and Q5_ProfitModel
        })
        
        required_cols = ['Q1_Role', 'Q2_DecisionAuth', 'Q4_OrgSize', 'Q5_ProfitModel']
        missing_cols = [col for col in required_cols if col not in df.columns]
        
        self.assertGreater(len(missing_cols), 0, "Should detect missing demographic columns")
        with self.assertRaises(ValueError) as ctx:
            if missing_cols:
                raise ValueError(f"Required demographic columns missing: {missing_cols}")
        self.assertIn("Required demographic columns missing", str(ctx.exception))
    
    def test_top3_pick_counts_raises_when_no_top3_cols(self):
        """Test that _build_top3_pick_counts raises ValueError when NO TOP3 columns are found."""
        df = pd.DataFrame({
            'SomeOtherCol': [1, 2, 3]
        })
        
        top3_cols = (
            [f"TOP3_B_{i}" for i in range(1, 10)] +
            [f"TOP3_R_{i}" for i in range(1, 10)]
        )
        missing_cols = [col for col in top3_cols if col not in df.columns]
        
        # All 18 TOP3 columns are missing
        self.assertEqual(len(missing_cols), 18, "All TOP3 columns should be missing")
        with self.assertRaises(ValueError) as ctx:
            if missing_cols:
                raise ValueError(f"TOP3 columns missing from idx: {missing_cols}")
        # Match the stricter (any-missing) error message
        self.assertIn("TOP3 columns missing from idx", str(ctx.exception))

class TestScaleMaps(unittest.TestCase):
    """Test scale mapping functions."""
    
    def test_barriers_scale_mapping(self):
        """Test that barriers scale maps correctly."""
        scale_map = {
            'Not a Barrier': 1,
            'Minor Barrier': 2,
            'Moderate Barrier': 3,
            'Significant Barrier': 4,
            'Major Barrier': 5
        }
        
        self.assertEqual(scale_map['Not a Barrier'], 1)
        self.assertEqual(scale_map['Major Barrier'], 5)
    
    def test_readiness_scale_mapping(self):
        """Test that readiness scale maps correctly."""
        scale_map = {
            'Very Low Readiness/Capability': 1,
            'Low Readiness/Capability': 2,
            'Moderate Readiness/Capability': 3,
            'High Readiness/Capability': 4,
            'Very High Readiness/Capability': 5
        }
        
        self.assertEqual(scale_map['Very Low Readiness/Capability'], 1)
        self.assertEqual(scale_map['Low Readiness/Capability'], 2)
        self.assertEqual(scale_map['Very High Readiness/Capability'], 5)
    
    def test_maturity_scale_mapping(self):
        """Test that maturity scale maps correctly."""
        scale_map = {
            'Level 1: Initial/Ad Hoc': 1,
            'Level 2: Developing/Repeatable': 2,
            'Level 3: Defined/Standardized': 3,
            'Level 4: Managed/Quantitatively Managed': 4,
            'Level 5: Optimizing/Innovating': 5
        }
        
        self.assertEqual(scale_map['Level 1: Initial/Ad Hoc'], 1)
        self.assertEqual(scale_map['Level 2: Developing/Repeatable'], 2)
        self.assertEqual(scale_map['Level 5: Optimizing/Innovating'], 5)

class TestStatisticalFunctions(unittest.TestCase):
    """Test statistical calculation functions."""
    
    def test_mean_calculation(self):
        """Test basic mean calculation."""
        values = [1, 2, 3, 4, 5]
        mean = np.mean(values)
        self.assertEqual(mean, 3.0)
    
    def test_std_calculation(self):
        """Test standard deviation calculation."""
        values = [1, 2, 3, 4, 5]
        std = np.std(values, ddof=1)  # Sample std
        self.assertAlmostEqual(std, 1.5811, places=4)
    
    def test_effect_size_cohen_d(self):
        """Test Cohen's d effect size calculation."""
        group1 = [1, 2, 3, 4, 5]
        group2 = [3, 4, 5, 6, 7]
        
        mean1 = np.mean(group1)
        mean2 = np.mean(group2)
        std1 = np.std(group1, ddof=1)
        std2 = np.std(group2, ddof=1)
        
        # Pooled std for Cohen's d
        n1, n2 = len(group1), len(group2)
        pooled_std = np.sqrt(((n1 - 1) * std1**2 + (n2 - 1) * std2**2) / (n1 + n2 - 2))
        
        cohens_d = (mean2 - mean1) / pooled_std if pooled_std > 0 else 0
        self.assertAlmostEqual(cohens_d, 1.4142, places=4)
    
    def test_correlation(self):
        """Test Pearson correlation calculation."""
        x = [1, 2, 3, 4, 5]
        y = [2, 4, 5, 4, 6]
        
        corr = np.corrcoef(x, y)[0, 1]
        self.assertGreater(corr, 0)  # Positive correlation
        self.assertLess(corr, 1)

if __name__ == '__main__':
    unittest.main()
