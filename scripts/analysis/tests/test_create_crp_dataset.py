"""Tests for create_crp_dataset.py — CRP dataset builder.

Covers:
- scan_pii() row_offset default (Qualtrics 3-header convention => row 4)
- select_crp_sample() tier assignment rules (Tier 1 / 2 / 3)
- Tier 3 minimum eligibility filter (finished + duration >= MIN_DURATION_ALL)
- FLAG-SPEED responses in Tier 3 (eligible, ranked by quality score)
- N=200 selection behaviour (fills from tier3 pool, respects slots_remaining)
"""

from __future__ import annotations

import sys
from pathlib import Path

# Ensure scripts/analysis is importable
sys.path.insert(0, str(Path(__file__).parent.parent))

import pytest

from create_crp_dataset import (
    MIN_DURATION_ALL,
    MIN_DURATION_CLEAN,
    MIN_DURATION_PIPELINE_CLEAN,
    FREE_TEXT_COLUMNS,
    scan_pii,
    select_crp_sample,
    compute_quality_score,
)


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _make_profile(
    response_id: str = "R_TEST001",
    prolific_status: str = "APPROVED",
    finished: bool = True,
    duration: int | None = 600,
    iri_count: int = 3,
    recaptcha: float = 0.9,
    llm_flag: bool = False,
    bots_flag: bool = False,
    straightlining: int = 0,
    partial_straightlining: bool = False,
    disposition: str = "CLEAN",
) -> dict:
    """Return a synthetic response profile (no raw row needed for selection logic)."""
    return {
        "row": [],
        "response_id": response_id,
        "prolific_status": prolific_status,
        "finished": finished,
        "duration": duration,
        "iri_count": iri_count,
        "recaptcha": recaptcha,
        "llm_flag": llm_flag,
        "bots_flag": bots_flag,
        "straightlining": straightlining,
        "partial_straightlining": partial_straightlining,
        "disposition": disposition,
        "quality_score": 0.0,  # recomputed below via a real score helper if needed
        "tier": None,
        "selected": False,
    }


def _make_text_rows(*feedback_texts: str) -> list[dict[str, str]]:
    """Create minimal row dicts for scan_pii tests."""
    return [
        {"Q74_Feedback": t, "Q1_Role_11_TEXT": "", "Q3_Industry_26_TEXT": ""}
        for t in feedback_texts
    ]


# ─────────────────────────────────────────────────────────────────────────────
# scan_pii — row_offset default
# ─────────────────────────────────────────────────────────────────────────────

class TestScanPiiRowOffset:
    """scan_pii() row_offset=4 default aligns with Qualtrics 3-header convention."""

    def test_default_row_offset_is_4_for_first_data_row(self):
        """First data row (index 0) should report CSV row 4 with default offset."""
        rows = _make_text_rows("Email me at test@example.com")
        flags = scan_pii(rows, FREE_TEXT_COLUMNS)
        assert flags, "Expected a PII flag for the email address"
        assert flags[0]["pattern_type"] == "email address"
        assert flags[0]["row_number"] == 4  # 0 + 4 = 4

    def test_explicit_row_offset_2_for_single_header_output(self):
        """Callers scanning one-header-row public output pass row_offset=2."""
        rows = _make_text_rows("Email me at test@example.com")
        flags = scan_pii(rows, FREE_TEXT_COLUMNS, row_offset=2)
        assert flags
        assert flags[0]["row_number"] == 2  # 0 + 2 = 2

    def test_second_data_row_offset(self):
        """Second data row (index 1) should report CSV row 5 with default offset."""
        rows = _make_text_rows("clean text", "Call 555-123-4567")
        flags = scan_pii(rows, FREE_TEXT_COLUMNS)
        phone_flags = [f for f in flags if f["pattern_type"] == "phone number"]
        assert phone_flags
        assert phone_flags[0]["row_number"] == 5  # 1 + 4 = 5

    def test_detects_email(self):
        rows = _make_text_rows("Contact me at user@domain.org")
        flags = scan_pii(rows, FREE_TEXT_COLUMNS)
        assert any(f["pattern_type"] == "email address" for f in flags)

    def test_clean_row_no_flags(self):
        rows = _make_text_rows("The survey was well designed and highly relevant")
        flags = scan_pii(rows, FREE_TEXT_COLUMNS)
        assert flags == []

    def test_empty_text_no_flags(self):
        rows = _make_text_rows("")
        flags = scan_pii(rows, FREE_TEXT_COLUMNS)
        assert flags == []


# ─────────────────────────────────────────────────────────────────────────────
# select_crp_sample — Tier 1
# ─────────────────────────────────────────────────────────────────────────────

class TestTier1Selection:
    """Tier 1: APPROVED + all quality gates pass."""

    def test_tier1_profile_is_selected(self):
        p = _make_profile(
            duration=MIN_DURATION_PIPELINE_CLEAN,
            iri_count=3,
            recaptcha=0.9,
            straightlining=0,
            partial_straightlining=False,
            llm_flag=False,
            bots_flag=False,
        )
        select_crp_sample([p], target_n=1)
        assert p["tier"] == 1
        assert p["selected"] is True

    def test_tier1_requires_finished(self):
        p = _make_profile(
            finished=False,
            duration=MIN_DURATION_PIPELINE_CLEAN,
            iri_count=3,
            recaptcha=0.9,
        )
        select_crp_sample([p], target_n=1)
        assert p["tier"] != 1

    def test_tier1_requires_min_duration_pipeline_clean(self):
        p = _make_profile(
            duration=MIN_DURATION_PIPELINE_CLEAN - 1,
            iri_count=3,
            recaptcha=0.9,
        )
        select_crp_sample([p], target_n=1)
        assert p["tier"] != 1

    def test_tier1_requires_three_iri(self):
        p = _make_profile(
            duration=MIN_DURATION_PIPELINE_CLEAN,
            iri_count=2,
            recaptcha=0.9,
        )
        select_crp_sample([p], target_n=1)
        assert p["tier"] != 1

    def test_tier1_excluded_if_llm_flag(self):
        p = _make_profile(
            duration=MIN_DURATION_PIPELINE_CLEAN,
            iri_count=3,
            recaptcha=0.9,
            llm_flag=True,
        )
        select_crp_sample([p], target_n=1)
        assert p["tier"] != 1


# ─────────────────────────────────────────────────────────────────────────────
# select_crp_sample — Tier 2
# ─────────────────────────────────────────────────────────────────────────────

class TestTier2Selection:
    """Tier 2: APPROVED + finished + all 3 IRIs + duration >= MIN_DURATION_CLEAN,
    but fails at least one Tier 1 gate."""

    def test_tier2_profile_is_selected(self):
        # Fails Tier 1 because of auth flag, but meets Tier 2 criteria
        p = _make_profile(
            duration=MIN_DURATION_CLEAN,
            iri_count=3,
            llm_flag=True,  # disqualifies from Tier 1
        )
        select_crp_sample([p], target_n=1)
        assert p["tier"] == 2
        assert p["selected"] is True

    def test_tier2_requires_three_iri(self):
        p = _make_profile(
            duration=MIN_DURATION_CLEAN,
            iri_count=2,
            llm_flag=True,  # fails Tier 1
        )
        select_crp_sample([p], target_n=1)
        assert p["tier"] not in (1, 2)

    def test_tier2_requires_finished(self):
        p = _make_profile(
            finished=False,
            duration=MIN_DURATION_CLEAN,
            iri_count=3,
        )
        select_crp_sample([p], target_n=1)
        assert p["tier"] not in (1, 2)

    def test_tier2_requires_min_duration_clean(self):
        p = _make_profile(
            duration=MIN_DURATION_CLEAN - 1,
            iri_count=3,
            llm_flag=True,
        )
        select_crp_sample([p], target_n=1)
        assert p["tier"] not in (1, 2)

    def test_tier1_not_also_in_tier2(self):
        """A Tier 1 response must not appear in Tier 2."""
        p = _make_profile(
            duration=MIN_DURATION_PIPELINE_CLEAN,
            iri_count=3,
            recaptcha=0.9,
        )
        select_crp_sample([p], target_n=1)
        assert p["tier"] == 1


# ─────────────────────────────────────────────────────────────────────────────
# select_crp_sample — Tier 3 eligibility filter
# ─────────────────────────────────────────────────────────────────────────────

class TestTier3EligibilityFilter:
    """Tier 3 must exclude incomplete or extremely short responses."""

    def test_tier3_eligible_profile_is_selected(self):
        p = _make_profile(
            finished=True,
            duration=MIN_DURATION_ALL,
            iri_count=0,
            disposition="AUTO-EXCLUDE",
        )
        select_crp_sample([p], target_n=1)
        assert p["tier"] == 3
        assert p["selected"] is True

    def test_tier3_excludes_unfinished(self):
        """Unfinished responses (Finished != TRUE) must not enter Tier 3."""
        p = _make_profile(
            finished=False,
            duration=MIN_DURATION_ALL + 100,
            iri_count=1,
        )
        select_crp_sample([p], target_n=1)
        assert p["selected"] is False

    def test_tier3_excludes_below_min_duration(self):
        """Responses shorter than MIN_DURATION_ALL must not enter Tier 3."""
        p = _make_profile(
            finished=True,
            duration=MIN_DURATION_ALL - 1,
            iri_count=1,
        )
        select_crp_sample([p], target_n=1)
        assert p["selected"] is False

    def test_tier3_excludes_none_duration(self):
        """Responses with no duration value must not enter Tier 3."""
        p = _make_profile(
            finished=True,
            duration=None,
            iri_count=1,
        )
        select_crp_sample([p], target_n=1)
        assert p["selected"] is False


# ─────────────────────────────────────────────────────────────────────────────
# select_crp_sample — FLAG-SPEED in Tier 3
# ─────────────────────────────────────────────────────────────────────────────

class TestFlagSpeedTier3:
    """FLAG-SPEED responses (all 3 IRIs correct, duration < 300s) are Tier 3 eligible."""

    def test_flag_speed_enters_tier3(self):
        p = _make_profile(
            finished=True,
            duration=150,  # fast but > MIN_DURATION_ALL (120)
            iri_count=3,
            disposition="FLAG-SPEED",
        )
        select_crp_sample([p], target_n=1)
        assert p["tier"] == 3
        assert p["selected"] is True

    def test_flag_speed_excluded_when_below_min_duration_all(self):
        """FLAG-SPEED responses still obey the MIN_DURATION_ALL eligibility gate."""
        p = _make_profile(
            finished=True,
            duration=MIN_DURATION_ALL - 1,
            iri_count=3,
            disposition="FLAG-SPEED",
        )
        select_crp_sample([p], target_n=1)
        assert p["selected"] is False


# ─────────────────────────────────────────────────────────────────────────────
# select_crp_sample — N=200 fill behaviour
# ─────────────────────────────────────────────────────────────────────────────

class TestN200SelectionBehaviour:
    """Tiered selection correctly fills up to target_n."""

    def _make_tier3_profiles(self, n: int, base_duration: int = 200) -> list[dict]:
        return [
            _make_profile(
                response_id=f"R_T3_{i:03d}",
                finished=True,
                duration=base_duration + i,
                iri_count=1,
                disposition="FLAG-SPEED",
            )
            for i in range(n)
        ]

    def test_fills_to_target_n_from_tier3(self):
        profiles = self._make_tier3_profiles(10)
        select_crp_sample(profiles, target_n=5)
        selected = [p for p in profiles if p["selected"]]
        assert len(selected) == 5

    def test_does_not_exceed_target_n(self):
        profiles = self._make_tier3_profiles(20)
        select_crp_sample(profiles, target_n=10)
        selected = [p for p in profiles if p["selected"]]
        assert len(selected) == 10

    def test_selects_all_when_pool_smaller_than_target(self):
        profiles = self._make_tier3_profiles(3)
        select_crp_sample(profiles, target_n=200)
        selected = [p for p in profiles if p["selected"]]
        assert len(selected) == 3

    def test_tier1_and_tier2_count_toward_target(self):
        """Tier 1+2 selected profiles reduce the number taken from Tier 3."""
        # 1 Tier 1 profile
        tier1_p = _make_profile(
            response_id="R_TIER1",
            finished=True,
            duration=MIN_DURATION_PIPELINE_CLEAN,
            iri_count=3,
            recaptcha=0.9,
        )
        # 5 Tier 3 profiles
        tier3_profiles = self._make_tier3_profiles(5)
        all_profiles = [tier1_p] + tier3_profiles
        select_crp_sample(all_profiles, target_n=3)
        selected = [p for p in all_profiles if p["selected"]]
        # Should pick tier1 + 2 from tier3 = 3 total
        assert len(selected) == 3
        assert tier1_p["selected"] is True
        tier3_selected = [p for p in tier3_profiles if p["selected"]]
        assert len(tier3_selected) == 2

    def test_non_approved_profiles_are_never_selected(self):
        profiles = [
            _make_profile(response_id="R_PENDING", prolific_status="AWAITING REVIEW"),
            _make_profile(response_id="R_REJECTED", prolific_status="REJECTED"),
            _make_profile(response_id="R_APPROVED", prolific_status="APPROVED"),
        ]
        select_crp_sample(profiles, target_n=10)
        assert profiles[0]["selected"] is False
        assert profiles[1]["selected"] is False
        assert profiles[2]["selected"] is True
