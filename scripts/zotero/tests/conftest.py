"""Pytest conftest for Zotero dedup test suite."""

import sys
from pathlib import Path

TESTS_DIR = Path(__file__).parent
ZOTERO_DIR = TESTS_DIR.parent
REPO_ROOT = ZOTERO_DIR.parent.parent

sys.path.insert(0, str(TESTS_DIR))
sys.path.insert(0, str(ZOTERO_DIR))
sys.path.insert(0, str(REPO_ROOT))
