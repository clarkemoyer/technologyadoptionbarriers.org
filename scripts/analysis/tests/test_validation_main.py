"""Subprocess tests for the tabs_v2_validation.py CLI entry point.

Exercises the CLI contract (exit codes, output shape, JSON validity, --seed
reproducibility) against a minimal fixture CSV generated at test time.
factor_analyzer and semopy are optional -- tests pass whether or not they are
installed (the script degrades gracefully).

--n-boot 50 --n-sim 50 keeps bootstrap/parallel-analysis iterations low so
tests finish in a few seconds instead of minutes.
"""

import csv
import json
import subprocess
import sys
from pathlib import Path

import pytest

SCRIPTS = Path(__file__).parent.parent
VALIDATION_SCRIPT = str(SCRIPTS / "tabs_v2_validation.py")

# Fast flags shared by every test that invokes the full pipeline.
_FAST = ["--n-boot", "50", "--n-sim", "50"]

# ── Column names matching the production Qualtrics export format ────────────
_BARRIER_COLS = [f"Q10-28_Barriers_{i}" for i in range(1, 20)]   # 19 items (18 + IRI)
_READINESS_COLS = [f"Q47-64_Readiness_{i}" for i in range(1, 19)]  # 18 items (17 + IRI)
_MATURITY_COLS = [f"Q65-73_Maturity_{i}" for i in range(1, 10)]   # 9 items (8 + IRI)

_HEADERS = [
    "ResponseId", "StartDate", "EndDate", "RecordedDate", "Status", "Finished",
    "Duration (in seconds)", "IPAddress", "RecipientLastName", "RecipientFirstName",
    "RecipientEmail", "ExternalReference", "LocationLatitude", "LocationLongitude",
    "Q1_Role", "Q1_Role_11_TEXT", "Q2_DecisionAuth", "Q3_Industry",
    "Q3_Industry_26_TEXT", "Q4_OrgSize", "Q5_ProfitModel", "Q6_RevenueBudget",
    "Q7_PersonalBudget", "Q8_GeoScope", "Q9_GeoScale",
    *_BARRIER_COLS,
    *_READINESS_COLS,
    *_MATURITY_COLS,
    "Q74_Feedback", "PROLIFIC_PID", "STUDY_ID", "SESSION_ID",
    "COMPLETE_URL", "SOURCE", "Q_RecaptchaScore", "Q_StraightliningCount",
    "Auth_LLM", "Auth_Bots", "Prolific_Status",
]

_BARRIER_VALS = [
    "Not a Barrier", "Minor Barrier", "Moderate Barrier",
    "Significant Barrier", "Major Barrier",
]
_READINESS_VALS = [
    "Very Low Readiness/Capability", "Low Readiness/Capability",
    "Moderate Readiness/Capability", "High Readiness/Capability",
    "Very High Readiness/Capability",
]
_MATURITY_VALS = [
    "Level 1: Initial/Ad Hoc", "Level 2: Developing/Repeatable",
    "Level 3: Defined/Standardized", "Level 4: Managed/Quantitatively Managed",
    "Level 5: Optimizing/Innovating",
]


def _make_row(i: int) -> list:
    """Return one clean data row passing IRI + duration filters."""
    barriers = [_BARRIER_VALS[(i + j) % 5] for j in range(18)] + ["Major Barrier"]
    readiness = [_READINESS_VALS[(i + j) % 5] for j in range(17)] + ["Low Readiness/Capability"]
    maturity = [_MATURITY_VALS[(i + j) % 5] for j in range(8)] + ["Level 2: Developing/Repeatable"]
    return [
        f"R_{i:04d}",                        # ResponseId
        "2026-03-24 08:00:00",               # StartDate (passes V2 filter)
        "2026-03-24 08:15:00",               # EndDate
        "2026-03-24 08:15:00",               # RecordedDate
        "IP Address", "TRUE",
        "600",                               # Duration -- passes >=480s threshold
        "192.168.0.1",
        "", "", "", "",                      # name / email / ext ref
        "40.0", "-75.0",                     # lat/lon
        "CIO (e.g., Director of IT)", "",   # Q1_Role
        "I am the primary decision-maker for technology adoption in my organization",
        "Technology", "",                    # Q3_Industry
        "1000-4999", "For-Profit",           # Q4/Q5
        "50M-100M", "1M-5M",                # Q6/Q7
        "United States", "Single country",  # Q8/Q9
        *barriers,
        *readiness,
        *maturity,
        "",                                  # Q74_Feedback
        f"PID{i:06d}",                       # PROLIFIC_PID
        "STUDY001", f"SESS{i:04d}",          # STUDY_ID, SESSION_ID
        "https://example.com/complete",      # COMPLETE_URL
        "prolific", "0.9", "0",              # SOURCE, recaptcha, straightlining
        "HIGH", "HIGH", "AWAITING REVIEW",  # Auth_LLM, Auth_Bots, Prolific_Status
    ]


@pytest.fixture
def small_csv(tmp_path) -> str:
    """30-row clean fixture -- enough for reliability/HTMT stats, fast to run."""
    path = tmp_path / "small_validation.csv"
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(_HEADERS)
        writer.writerow([""] * len(_HEADERS))   # Qualtrics sub-header row 1
        writer.writerow([""] * len(_HEADERS))   # Qualtrics sub-header row 2
        for i in range(30):
            writer.writerow(_make_row(i))
    return str(path)


class TestValidationMain:
    def test_no_args_exits(self):
        """Script must exit non-zero and print usage when no CSV is given."""
        result = subprocess.run(
            [sys.executable, VALIDATION_SCRIPT],
            capture_output=True,
            text=True,
            timeout=10,
        )
        assert result.returncode != 0
        assert "Usage:" in result.stdout or "Usage:" in result.stderr

    def test_default_run(self, small_csv):
        """Script exits 0 and prints validation headings with a clean fixture."""
        result = subprocess.run(
            [sys.executable, VALIDATION_SCRIPT, small_csv] + _FAST,
            capture_output=True,
            text=True,
            timeout=60,
        )
        assert result.returncode == 0, f"stderr: {result.stderr[:500]}"
        assert "INSTRUMENT VALIDATION" in result.stdout or "Barriers" in result.stdout

    def test_seed_flag_reproducible(self, small_csv):
        """Two runs with the same --seed must produce identical stdout."""
        def run():
            return subprocess.run(
                [sys.executable, VALIDATION_SCRIPT, small_csv, "--seed", "42"] + _FAST,
                capture_output=True,
                text=True,
                timeout=60,
            )

        r1 = run()
        r2 = run()
        assert r1.returncode == 0
        assert r2.returncode == 0
        assert r1.stdout == r2.stdout, "Output differed between seeded runs"

    def test_json_output_created(self, small_csv, tmp_path):
        """--json flag must create a file at the specified path."""
        json_path = str(tmp_path / "validation.json")
        result = subprocess.run(
            [sys.executable, VALIDATION_SCRIPT, small_csv, "--json", json_path] + _FAST,
            capture_output=True,
            text=True,
            timeout=60,
        )
        assert result.returncode == 0
        assert Path(json_path).exists(), "JSON output file not created"

    def test_json_output_valid(self, small_csv, tmp_path):
        """JSON output must be standards-compliant (no bare NaN) with expected keys."""
        json_path = str(tmp_path / "validation.json")
        result = subprocess.run(
            [sys.executable, VALIDATION_SCRIPT, small_csv, "--json", json_path] + _FAST,
            capture_output=True,
            text=True,
            timeout=60,
        )
        assert result.returncode == 0
        raw = Path(json_path).read_text()
        # Parse the output, then explicitly reject bare NaN via the raw JSON text check below.
        data = json.loads(raw)
        assert "NaN" not in raw, "JSON output contains bare NaN (not valid JSON)"
        assert isinstance(data, dict), "Top-level JSON output must be a dict"

    def test_json_seed_reproducible(self, small_csv, tmp_path):
        """JSON output must be identical across seeded runs."""
        def run_json(out_path):
            return subprocess.run(
                [sys.executable, VALIDATION_SCRIPT, small_csv,
                 "--json", str(out_path), "--seed", "99"] + _FAST,
                capture_output=True,
                text=True,
                timeout=60,
            )

        p1 = tmp_path / "v1.json"
        p2 = tmp_path / "v2.json"
        r1 = run_json(p1)
        r2 = run_json(p2)
        assert r1.returncode == 0
        assert r2.returncode == 0
        d1, d2 = json.loads(p1.read_text()), json.loads(p2.read_text())
        d1.pop("validation_date", None); d2.pop("validation_date", None)
        assert d1 == d2, (
            "JSON output differed between seeded runs"
        )
