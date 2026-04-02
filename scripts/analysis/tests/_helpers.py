"""Shared fixtures for TABS analysis test suite."""

import csv
import json
import os
import sys
from pathlib import Path
from typing import Any

import pytest

# Add scripts/analysis to path so imports work
ANALYSIS_DIR = Path(__file__).parent.parent
TESTS_DIR = Path(__file__).parent
sys.path.insert(0, str(ANALYSIS_DIR))
# Add repo root so `scripts.analysis.X` imports work
REPO_ROOT = ANALYSIS_DIR.parent.parent
sys.path.insert(0, str(REPO_ROOT))


@pytest.fixture
def test_data_csv() -> str:
    """Path to the Qualtrics-format test CSV."""
    return str(ANALYSIS_DIR / "test_data_qualtrics.csv")


@pytest.fixture
def prod_format_csv() -> str:
    """Path to the production-format test CSV with all columns."""
    return str(TESTS_DIR / "test_data_production_format.csv")


@pytest.fixture
def tmp_csv(tmp_path: Path) -> str:
    """Path for writing temporary CSV output."""
    return str(tmp_path / "output.csv")


@pytest.fixture
def tmp_json(tmp_path: Path) -> str:
    """Path for writing temporary JSON output."""
    return str(tmp_path / "output.json")


def make_qualtrics_csv(
    tmp_path: Path,
    headers: list[str],
    rows: list[list[str]],
    filename: str = "qualtrics.csv",
) -> str:
    """Create a minimal Qualtrics-format CSV (3 header rows + data).

    Row 0 = column names, Row 1 = question text (empty), Row 2 = import IDs (empty).
    """
    path = tmp_path / filename
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerow([""] * len(headers))  # sub-header
        writer.writerow([""] * len(headers))  # import IDs
        for row in rows:
            writer.writerow(row)
    return str(path)


def make_csv(tmp_path: Path, headers: list[str], rows: list[list[str]], filename: str = "data.csv") -> str:
    """Create a simple CSV file."""
    path = tmp_path / filename
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        for row in rows:
            writer.writerow(row)
    return str(path)


def make_json(tmp_path: Path, data: Any, filename: str = "data.json") -> str:
    """Create a JSON file."""
    path = tmp_path / filename
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f)
    return str(path)


# Minimal Qualtrics row headers that the analysis scripts need
MINIMAL_HEADERS = [
    "ResponseId", "StartDate", "Duration (in seconds)", "Finished",
    "Q1_Role", "Q2_DecisionAuth", "Q3_Industry", "Q4_OrgSize",
    "Q5_ProfitModel", "Q6_RevenueBudget", "Q7_PersonalBudget",
    "Q8_GeoScope", "Q9_GeoScale",
    "Q10-28_Barriers_1", "Q10-28_Barriers_2", "Q10-28_Barriers_3",
    "Q10-28_Barriers_4", "Q10-28_Barriers_5", "Q10-28_Barriers_6",
    "Q10-28_Barriers_7", "Q10-28_Barriers_8", "Q10-28_Barriers_9",
    "Q10-28_Barriers_10", "Q10-28_Barriers_11", "Q10-28_Barriers_12",
    "Q10-28_Barriers_13", "Q10-28_Barriers_14", "Q10-28_Barriers_15",
    "Q10-28_Barriers_16", "Q10-28_Barriers_17", "Q10-28_Barriers_18",
    "Q10-28_Barriers_19",
    "Q47-64_Readiness_1", "Q47-64_Readiness_2", "Q47-64_Readiness_3",
    "Q47-64_Readiness_4", "Q47-64_Readiness_5", "Q47-64_Readiness_6",
    "Q47-64_Readiness_7", "Q47-64_Readiness_8", "Q47-64_Readiness_9",
    "Q47-64_Readiness_10", "Q47-64_Readiness_11", "Q47-64_Readiness_12",
    "Q47-64_Readiness_13", "Q47-64_Readiness_14", "Q47-64_Readiness_15",
    "Q47-64_Readiness_16", "Q47-64_Readiness_17", "Q47-64_Readiness_18",
    "Q65-73_Maturity_1", "Q65-73_Maturity_2", "Q65-73_Maturity_3",
    "Q65-73_Maturity_4", "Q65-73_Maturity_5", "Q65-73_Maturity_6",
    "Q65-73_Maturity_7", "Q65-73_Maturity_8", "Q65-73_Maturity_9",
    "PROLIFIC_PID", "Q_RecaptchaScore", "Q_StraightliningCount",
    "Q74_Feedback",
]


def make_clean_row(
    pid: str = "PID001",
    response_id: str = "R_001",
    start_date: str = "2026-03-24 10:00:00",
    duration: int = 600,
    finished: str = "TRUE",
    barrier_iri: str = "Major Barrier",
    readiness_iri: str = "Low Readiness/Capability",
    maturity_iri: str = "Level 2: Developing/Repeatable",
    recaptcha: str = "0.9",
    straightlining: str = "0",
) -> list[str]:
    """Create a row that passes all quality checks (Pipeline CLEAN).

    Uses varied responses across all scale points to avoid partial straightlining.
    """
    barrier_vals = ["Not a Barrier", "Minor Barrier", "Moderate Barrier", "Significant Barrier", "Major Barrier"]
    readiness_vals = ["Very Low Readiness/Capability", "Low Readiness/Capability", "Moderate Readiness/Capability", "High Readiness/Capability", "Very High Readiness/Capability"]
    maturity_vals = ["Level 1: Initial/Ad Hoc", "Level 2: Developing/Repeatable", "Level 3: Defined/Standardized", "Level 4: Managed/Quantitatively Managed", "Level 5: Optimizing/Innovating"]
    barriers = [barrier_vals[i % 5] for i in range(18)] + [barrier_iri]
    readiness = [readiness_vals[i % 5] for i in range(17)] + [readiness_iri]
    maturity = [maturity_vals[i % 5] for i in range(8)] + [maturity_iri]
    return [
        response_id, start_date, str(duration), finished,
        "CIO (e.g., Director of IT)", "High", "Technology", "10000+",
        "For-Profit", "250M-500M", "5M-10M", "Global", "Multi-country",
        *barriers, *readiness, *maturity,
        pid, recaptcha, straightlining, "",
    ]
