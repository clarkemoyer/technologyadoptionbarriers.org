"""Tests for deidentify_tabs_data.py - NIST de-identification pipeline."""

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from scripts.deidentify_tabs_data import (
    scan_pii,
    redact_pii,
    replace_response_ids,
    generalize_timestamps,
    filter_columns,
    extract_linkage,
    COLUMNS_TO_DROP,
    FREE_TEXT_COLUMNS,
    TIMESTAMP_COLUMNS,
    PROLIFIC_LINKAGE_COLUMNS,
)


def _make_rows(*feedback_texts):
    """Create row dicts with Q74_Feedback values."""
    return [{"Q74_Feedback": t, "Q1_Role_11_TEXT": "", "Q3_Industry_26_TEXT": ""} for t in feedback_texts]


# ── PII scanning ────────────────────────────────────────────

class TestScanPII:
    def test_detects_email(self):
        rows = _make_rows("Contact me at john@example.com for details")
        flags = scan_pii(rows, FREE_TEXT_COLUMNS)
        assert any("email" in f["pattern_type"] for f in flags)

    def test_detects_phone(self):
        rows = _make_rows("Call 555-123-4567")
        flags = scan_pii(rows, FREE_TEXT_COLUMNS)
        assert any("phone" in f["pattern_type"] for f in flags)

    def test_detects_url(self):
        rows = _make_rows("See https://company.com/report")
        flags = scan_pii(rows, FREE_TEXT_COLUMNS)
        assert any("URL" in f["pattern_type"] for f in flags)

    def test_detects_employer(self):
        rows = _make_rows("I work at Microsoft in Seattle")
        flags = scan_pii(rows, FREE_TEXT_COLUMNS)
        assert any("employer" in f["pattern_type"] for f in flags)

    def test_detects_dollar_amount(self):
        rows = _make_rows("Our budget is $5 million")
        flags = scan_pii(rows, FREE_TEXT_COLUMNS)
        assert any("dollar" in f["pattern_type"] for f in flags)

    def test_clean_text_no_flags(self):
        rows = _make_rows("This survey was well designed and relevant")
        flags = scan_pii(rows, FREE_TEXT_COLUMNS)
        assert len(flags) == 0

    def test_empty_text(self):
        rows = _make_rows("")
        flags = scan_pii(rows, FREE_TEXT_COLUMNS)
        assert len(flags) == 0

    def test_multiple_rows(self):
        rows = _make_rows("clean text", "email: test@foo.com", "no issues")
        flags = scan_pii(rows, FREE_TEXT_COLUMNS)
        assert len(flags) >= 1
        assert flags[0]["row_index"] == 1  # second row


# ── PII redaction ────────────────────────────────────────────

class TestRedactPII:
    def test_redacts_flagged_match(self):
        rows = _make_rows("Contact john@example.com")
        flags = scan_pii(rows, FREE_TEXT_COLUMNS)
        count = redact_pii(rows, flags)
        assert count >= 1
        assert "john@example.com" not in rows[0]["Q74_Feedback"]
        assert "[REDACTED]" in rows[0]["Q74_Feedback"]

    def test_preserves_clean_text(self):
        rows = _make_rows("Great survey, very relevant")
        flags = scan_pii(rows, FREE_TEXT_COLUMNS)
        count = redact_pii(rows, flags)
        assert count == 0
        assert rows[0]["Q74_Feedback"] == "Great survey, very relevant"


# ── ResponseId replacement ───────────────────────────────────

class TestReplaceResponseIds:
    def test_sequential_ids(self):
        rows = [
            {"ResponseId": "R_abc123", "StartDate": "2026-03-24", "Q1": "A"},
            {"ResponseId": "R_def456", "StartDate": "2026-03-25", "Q1": "B"},
            {"ResponseId": "R_ghi789", "StartDate": "2026-03-26", "Q1": "C"},
        ]
        result, mapping = replace_response_ids(rows)
        new_ids = [r["ResponseId"] for r in result]
        assert new_ids == ["TABS_V2_001", "TABS_V2_002", "TABS_V2_003"]
        assert len(mapping) == 3

    def test_preserves_other_columns(self):
        rows = [{"ResponseId": "R_1", "StartDate": "2026-03-24", "Q1": "data"}]
        result, _ = replace_response_ids(rows)
        assert result[0]["Q1"] == "data"


# ── Timestamp generalization ─────────────────────────────────

class TestGeneralizeTimestamps:
    def test_date_only(self):
        rows = [{"StartDate": "2026-03-24 10:15:32", "EndDate": "2026-03-24 10:30:00"}]
        generalize_timestamps(rows, ["StartDate", "EndDate"])
        assert rows[0]["StartDate"] == "2026-03-24"
        assert rows[0]["EndDate"] == "2026-03-24"

    def test_preserves_non_timestamp_columns(self):
        rows = [{"StartDate": "2026-03-24 10:15:32", "Q1": "data"}]
        generalize_timestamps(rows, ["StartDate"])
        assert rows[0]["Q1"] == "data"

    def test_missing_column_no_error(self):
        rows = [{"Q1": "data"}]
        generalize_timestamps(rows, ["StartDate"])
        assert rows[0]["Q1"] == "data"


# ── Column filtering ────────────────────────────────────────

class TestFilterColumns:
    def test_drops_pii_columns(self):
        headers = ["ResponseId", "IPAddress", "PROLIFIC_PID", "Q1"]
        rows = [{"ResponseId": "R_1", "IPAddress": "1.2.3.4", "PROLIFIC_PID": "PID1", "Q1": "x"}]
        kept_h, result = filter_columns(headers, rows, COLUMNS_TO_DROP)
        assert "IPAddress" not in kept_h
        assert "PROLIFIC_PID" not in kept_h
        assert "ResponseId" in kept_h
        assert "Q1" in kept_h
        assert "IPAddress" not in result[0]

    def test_drops_all_configured_columns(self):
        headers = list(COLUMNS_TO_DROP) + ["Q1"]
        row = {col: "val" for col in COLUMNS_TO_DROP}
        row["Q1"] = "keep_this"
        kept_h, result = filter_columns(headers, [row], COLUMNS_TO_DROP)
        for col in COLUMNS_TO_DROP:
            assert col not in kept_h
        assert result[0]["Q1"] == "keep_this"


# ── Prolific linkage extraction ──────────────────────────────

class TestExtractLinkage:
    def test_extracts_linkage_columns(self):
        rows = [
            {"ResponseId": "R_1", "PROLIFIC_PID": "PID1", "STUDY_ID": "S1",
             "SESSION_ID": "sess1", "COMPLETE_URL": "https://...", "Q1": "data"},
        ]
        linkage = extract_linkage(rows, PROLIFIC_LINKAGE_COLUMNS)
        assert len(linkage) == 1
        assert linkage[0]["ResponseId"] == "R_1"
        assert linkage[0]["PROLIFIC_PID"] == "PID1"
        assert "Q1" not in linkage[0]

    def test_missing_linkage_column(self):
        rows = [{"ResponseId": "R_1", "Q1": "data"}]
        linkage = extract_linkage(rows, PROLIFIC_LINKAGE_COLUMNS)
        assert len(linkage) == 1
        assert linkage[0].get("PROLIFIC_PID", "") == ""
