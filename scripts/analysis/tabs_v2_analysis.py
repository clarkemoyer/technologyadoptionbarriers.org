#!/usr/bin/env python3
"""TABS V2 Descriptive Statistics and Sensitivity Analysis
========================================================

Produces all descriptive statistics, cross-tabulations, effect sizes,
correlations, reliability coefficients, and sensitivity analysis across
three sample cuts for the Technology Adoption Barriers Survey V2.

Usage:
    python tabs_v2_analysis.py <qualtrics_csv_path>

The CSV must be a standard Qualtrics export with 3 header rows.
V2 filter: StartDate >= '2026-03-23 14:00:00' OR ResponseId == 'R_1QK12IJpHjC3wd6' (Prolific live test)

Author: Clarke Moyer, Penn State Smeal DBA
"""