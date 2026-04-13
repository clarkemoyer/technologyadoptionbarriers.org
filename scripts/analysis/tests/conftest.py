"""Pytest conftest - set up paths and import fixtures."""

import sys
from pathlib import Path

# Make scripts/analysis importable
TESTS_DIR = Path(__file__).parent
ANALYSIS_DIR = TESTS_DIR.parent
REPO_ROOT = ANALYSIS_DIR.parent.parent

sys.path.insert(0, str(TESTS_DIR))
sys.path.insert(0, str(ANALYSIS_DIR))
sys.path.insert(0, str(REPO_ROOT))

from _helpers import test_data_csv, tmp_csv, tmp_json, prod_format_csv  # noqa: F401
