"""Tests for classify_replies_for_action.py — bucket assignment, theme
parsing, and the question detection / high-tier precedence rules."""

from __future__ import annotations

import csv
import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import classify_replies_for_action as classifier  # noqa: E402

SCRIPT = str(Path(__file__).parent.parent / "classify_replies_for_action.py")


def _write_disposition_csv(tmp_path: Path, rows: list[dict]) -> str:
    path = str(tmp_path / "disposition.csv")
    cols = [
        "PROLIFIC_PID",
        "Duration_Seconds",
        "IRI_Pass_Count",
        "IRI_Fail_Count",
        "Speed_Flag",
        "Partial_Straightlining_Flag",
        "Disposition",
        "Prolific_Status",
    ]
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=cols)
        writer.writeheader()
        for r in rows:
            writer.writerow({c: r.get(c, "") for c in cols})
    return path


def _write_inbound_csv(tmp_path: Path, rows: list[dict]) -> str:
    path = str(tmp_path / "participant_messages.csv")
    cols = ["timestamp", "participant_id", "channel_id", "study_id", "message_id", "char_count", "themes", "pii_risk", "pii_flags", "body"]
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=cols)
        writer.writeheader()
        for r in rows:
            writer.writerow({c: r.get(c, "") for c in cols})
    return path


def _write_stale_triage_json(tmp_path: Path, buckets: dict[str, list[dict]]) -> str:
    """Write a minimal stale-triage.json matching find_stale_return_requested.py's schema."""
    path = str(tmp_path / "stale-triage.json")
    all_buckets = {
        "stale_no_reply_to_rr": [],
        "stale_no_reply_to_message": [],
        "in_window_rr": [],
        "in_window_msg": [],
    }
    all_buckets.update(buckets)
    payload = {
        "study_id": "test-study",
        "computed_at": "2026-07-01T12:00:00+00:00",
        "stale_hours": 48,
        "message_stale_hours": 48,
        "counts": {k: len(v) for k, v in all_buckets.items()},
        "fetch_errors": 0,
        "fetch_error_details": [],
        "buckets": all_buckets,
    }
    Path(path).write_text(json.dumps(payload), encoding="utf-8")
    return path


def _run(
    tmp_path: Path,
    disp_rows: list[dict],
    inbound_rows: list[dict],
    stale_triage_path: str | None = None,
) -> dict:
    disp = _write_disposition_csv(tmp_path, disp_rows)
    inbound = _write_inbound_csv(tmp_path, inbound_rows)
    output = str(tmp_path / "out.json")
    env = {
        "INBOUND_CSV": inbound,
        "DISPOSITION_CSV": disp,
        "OUTPUT_JSON_PATH": output,
        "PYTHONPATH": str(Path(__file__).parent.parent),
    }
    if stale_triage_path is not None:
        env["STALE_TRIAGE_JSON"] = stale_triage_path
    proc = subprocess.run(
        [sys.executable, SCRIPT],
        env=env,
        capture_output=True,
        text=True,
        check=True,
    )
    assert "Classified" in proc.stdout, proc.stdout
    with open(output, encoding="utf-8") as f:
        return json.load(f)


# ---------------------------------------------------------------------------
# High-tier detection unit tests
# ---------------------------------------------------------------------------


class TestHighRejectionTier:
    def test_three_iri_fails_is_high_tier(self):
        assert classifier.is_high_rejection_tier({"IRI_Fail_Count": "3", "Speed_Flag": "0", "Partial_Straightlining_Flag": "0"})

    def test_four_iri_fails_is_high_tier(self):
        assert classifier.is_high_rejection_tier({"IRI_Fail_Count": "4"})

    def test_two_iri_fails_plus_speed_is_high_tier(self):
        assert classifier.is_high_rejection_tier({"IRI_Fail_Count": "2", "Speed_Flag": "1", "Partial_Straightlining_Flag": "0"})

    def test_two_iri_fails_plus_partial_straightlining_is_high_tier(self):
        assert classifier.is_high_rejection_tier({"IRI_Fail_Count": "2", "Speed_Flag": "0", "Partial_Straightlining_Flag": "1"})

    def test_two_iri_fails_alone_is_low_tier(self):
        # Per operator policy: 2 IRI fails without another factor is NOT high tier
        assert not classifier.is_high_rejection_tier({"IRI_Fail_Count": "2", "Speed_Flag": "0", "Partial_Straightlining_Flag": "0"})

    def test_one_iri_fail_is_low_tier(self):
        assert not classifier.is_high_rejection_tier({"IRI_Fail_Count": "1", "Speed_Flag": "1", "Partial_Straightlining_Flag": "1"})

    def test_zero_iri_fails_is_low_tier(self):
        assert not classifier.is_high_rejection_tier({"IRI_Fail_Count": "0"})

    def test_missing_columns_default_to_zero(self):
        assert not classifier.is_high_rejection_tier({})


# ---------------------------------------------------------------------------
# Question detection unit tests
# ---------------------------------------------------------------------------


class TestReplyHasQuestion:
    def test_question_mark_detects_question(self):
        assert classifier.reply_has_question([{"body": "What did I do wrong?", "themes": ""}])

    def test_no_question_mark_no_question(self):
        # Defense / acknowledgment without ? is NOT a question, even if theme
        # tag (which is keyword-based and noisy) says otherwise
        assert not classifier.reply_has_question([{"body": "I paid attention.", "themes": "payment_question"}])

    def test_multiple_replies_any_question(self):
        replies = [
            {"body": "Thanks!", "themes": ""},
            {"body": "Can you explain?", "themes": ""},
        ]
        assert classifier.reply_has_question(replies)

    def test_empty_body_no_question(self):
        assert not classifier.reply_has_question([{"body": "", "themes": ""}])

    def test_missing_body_no_question(self):
        assert not classifier.reply_has_question([{"themes": "question_about_study"}])


# ---------------------------------------------------------------------------
# Theme splitting unit tests
# ---------------------------------------------------------------------------


class TestSplitThemes:
    def test_semicolon_separated(self):
        assert classifier._split_themes("praise;question_about_study") == ["praise", "question_about_study"]

    def test_pipe_separated_normalized_to_semicolon(self):
        # Some legacy CSVs may use pipe; the splitter accepts both for safety
        assert classifier._split_themes("praise|contact_request") == ["praise", "contact_request"]

    def test_single_theme(self):
        assert classifier._split_themes("praise") == ["praise"]

    def test_empty_string(self):
        assert classifier._split_themes("") == []

    def test_none(self):
        assert classifier._split_themes(None) == []

    def test_whitespace_only(self):
        assert classifier._split_themes("  ;  ") == []


# ---------------------------------------------------------------------------
# End-to-end bucket assignment tests (the most policy-critical surface)
# ---------------------------------------------------------------------------


class TestBucketAssignment:
    def test_low_tier_reply_no_question_goes_to_auto_approve(self, tmp_path):
        result = _run(
            tmp_path,
            [
                {
                    "PROLIFIC_PID": "AAAA000000000000000000001",
                    "IRI_Fail_Count": "1",
                    "Speed_Flag": "0",
                    "Partial_Straightlining_Flag": "0",
                    "Disposition": "FLAG-SINGLE-IRI",
                    "Prolific_Status": "AWAITING REVIEW",
                }
            ],
            [
                {"participant_id": "AAAA000000000000000000001", "body": "I read carefully.", "themes": ""},
            ],
        )
        assert result["bucket_counts"]["auto_approve_eligible"] == 1
        assert result["bucket_counts"]["human_review_questions"] == 0

    def test_low_tier_reply_with_question_goes_to_human_review(self, tmp_path):
        result = _run(
            tmp_path,
            [
                {
                    "PROLIFIC_PID": "BBBB000000000000000000001",
                    "IRI_Fail_Count": "1",
                    "Disposition": "FLAG-SINGLE-IRI",
                    "Prolific_Status": "AWAITING REVIEW",
                }
            ],
            [
                {"participant_id": "BBBB000000000000000000001", "body": "What did I miss?", "themes": ""},
            ],
        )
        assert result["bucket_counts"]["human_review_questions"] == 1
        assert result["bucket_counts"]["auto_approve_eligible"] == 0

    def test_high_tier_reply_with_question_goes_to_high_tier_not_questions(self, tmp_path):
        # POLICY: high-tier wins over question detection so the operator
        # reads the messaging exchange in the dispositional context.
        result = _run(
            tmp_path,
            [
                {
                    "PROLIFIC_PID": "CCCC000000000000000000001",
                    "IRI_Fail_Count": "3",
                    "Disposition": "AUTO-EXCLUDE",
                    "Prolific_Status": "AWAITING REVIEW",
                }
            ],
            [
                {"participant_id": "CCCC000000000000000000001", "body": "Can you reconsider?", "themes": ""},
            ],
        )
        assert result["bucket_counts"]["human_review_high_tier"] == 1
        assert result["bucket_counts"]["human_review_questions"] == 0

    def test_high_tier_reply_without_question_goes_to_high_tier(self, tmp_path):
        result = _run(
            tmp_path,
            [
                {
                    "PROLIFIC_PID": "DDDD000000000000000000001",
                    "IRI_Fail_Count": "2",
                    "Speed_Flag": "1",
                    "Disposition": "AUTO-EXCLUDE",
                    "Prolific_Status": "AWAITING REVIEW",
                }
            ],
            [
                {"participant_id": "DDDD000000000000000000001", "body": "I was tired.", "themes": ""},
            ],
        )
        assert result["bucket_counts"]["human_review_high_tier"] == 1
        assert result["bucket_counts"]["auto_approve_eligible"] == 0

    def test_no_reply_low_tier_goes_to_no_reply(self, tmp_path):
        result = _run(
            tmp_path,
            [
                {
                    "PROLIFIC_PID": "EEEE000000000000000000001",
                    "IRI_Fail_Count": "1",
                    "Disposition": "FLAG-SINGLE-IRI",
                    "Prolific_Status": "AWAITING REVIEW",
                }
            ],
            [],
        )
        assert result["bucket_counts"]["no_reply"] == 1
        assert result["bucket_counts"]["no_reply_high_tier"] == 0

    def test_no_reply_high_tier_goes_to_dedicated_bucket(self, tmp_path):
        result = _run(
            tmp_path,
            [
                {
                    "PROLIFIC_PID": "FFFF000000000000000000001",
                    "IRI_Fail_Count": "3",
                    "Disposition": "AUTO-EXCLUDE",
                    "Prolific_Status": "AWAITING REVIEW",
                }
            ],
            [],
        )
        assert result["bucket_counts"]["no_reply_high_tier"] == 1
        assert result["bucket_counts"]["no_reply"] == 0

    def test_non_awaiting_pids_excluded(self, tmp_path):
        result = _run(
            tmp_path,
            [
                {
                    "PROLIFIC_PID": "GGGG000000000000000000001",
                    "Disposition": "CLEAN",
                    "Prolific_Status": "APPROVED",
                }
            ],
            [],
        )
        assert result["total_awaiting"] == 0


# ---------------------------------------------------------------------------
# Stale-triage split of high-tier no-reply PIDs (issue #3012)
#
# reject_by_pid.py's live revalidation only rejects bucket
# stale_no_reply_to_rr, so the recommendation must not include PIDs the
# same pipeline run just messaged (in_window_msg) or return-requested
# (in_window_rr) — those produce guaranteed no-op reject dispatches.
# ---------------------------------------------------------------------------

HIGH_TIER_ROW = {
    "PROLIFIC_PID": "MMMM000000000000000000001",
    "IRI_Fail_Count": "3",
    "Speed_Flag": "0",
    "Partial_Straightlining_Flag": "0",
    "Disposition": "AUTO-EXCLUDE",
    "Prolific_Status": "AWAITING REVIEW",
}


class TestStaleTriageSplit:
    def test_stale_rr_pid_is_bulk_reject_eligible(self, tmp_path):
        st = _write_stale_triage_json(
            tmp_path,
            {
                "stale_no_reply_to_rr": [
                    {"pid": HIGH_TIER_ROW["PROLIFIC_PID"], "age_hours": 72.0, "anchor": "2026-06-28T10:00:00+00:00", "anchor_kind": "return_requested"}
                ]
            },
        )
        result = _run(tmp_path, [HIGH_TIER_ROW], [], stale_triage_path=st)
        assert result["bucket_counts"]["no_reply_high_tier"] == 1
        assert result["bucket_counts"]["no_reply_high_tier_in_window"] == 0
        assert result["stale_triage_available"] is True
        assert result["buckets"]["no_reply_high_tier"][0]["stale_bucket"] == "stale_no_reply_to_rr"

    def test_in_window_msg_pid_not_recommended(self, tmp_path):
        # The #3012 repro: pipeline messaged the PID hours ago, then the
        # same run's report recommended bulk-reject. The reject script
        # skips it (NO_LONGER_ELIGIBLE:in_window_msg); the recommendation
        # must agree and route it to the in-window bucket instead.
        st = _write_stale_triage_json(
            tmp_path,
            {
                "in_window_msg": [
                    {"pid": HIGH_TIER_ROW["PROLIFIC_PID"], "age_hours": 4.0, "anchor": "2026-07-01T08:00:00+00:00", "anchor_kind": "last_researcher_message"}
                ]
            },
        )
        result = _run(tmp_path, [HIGH_TIER_ROW], [], stale_triage_path=st)
        assert result["bucket_counts"]["no_reply_high_tier"] == 0
        assert result["bucket_counts"]["no_reply_high_tier_in_window"] == 1
        entry = result["buckets"]["no_reply_high_tier_in_window"][0]
        assert entry["stale_bucket"] == "in_window_msg"
        # anchor + message_stale_hours (48) + stale_hours (48) = 2026-07-05T08:00
        assert entry["earliest_eligible_at"].startswith("2026-07-05T08:00")

    def test_in_window_rr_pid_not_recommended(self, tmp_path):
        st = _write_stale_triage_json(
            tmp_path,
            {
                "in_window_rr": [
                    {"pid": HIGH_TIER_ROW["PROLIFIC_PID"], "age_hours": 12.0, "anchor": "2026-07-01T00:00:00+00:00", "anchor_kind": "return_requested"}
                ]
            },
        )
        result = _run(tmp_path, [HIGH_TIER_ROW], [], stale_triage_path=st)
        assert result["bucket_counts"]["no_reply_high_tier"] == 0
        entry = result["buckets"]["no_reply_high_tier_in_window"][0]
        assert entry["stale_bucket"] == "in_window_rr"
        # anchor + stale_hours (48) = 2026-07-03T00:00
        assert entry["earliest_eligible_at"].startswith("2026-07-03T00:00")

    def test_stale_no_reply_to_message_pid_not_recommended_and_estimate_uses_age_hours(
        self, tmp_path
    ):
        # Regression for the _earliest_eligible_at() underestimate bug:
        # when age_hours (72) > message_stale_hours (48), Phase 3d sends the
        # RR now (≈ anchor + 72h), so eligibility = anchor + 72 + 48 = anchor + 120h.
        # The old formula (anchor + msg + reject = anchor + 96h) was 24h too early.
        st = _write_stale_triage_json(
            tmp_path,
            {
                "stale_no_reply_to_message": [
                    {
                        "pid": HIGH_TIER_ROW["PROLIFIC_PID"],
                        "age_hours": 72.0,
                        "anchor": "2026-06-29T12:00:00+00:00",
                        "anchor_kind": "last_researcher_message",
                    }
                ]
            },
        )
        result = _run(tmp_path, [HIGH_TIER_ROW], [], stale_triage_path=st)
        assert result["bucket_counts"]["no_reply_high_tier"] == 0
        assert result["bucket_counts"]["no_reply_high_tier_in_window"] == 1
        entry = result["buckets"]["no_reply_high_tier_in_window"][0]
        assert entry["stale_bucket"] == "stale_no_reply_to_message"
        # anchor + age_hours (72) + stale_hours (48) = 2026-07-04T12:00
        # (NOT anchor + message_stale_hours (48) + stale_hours (48) = 2026-07-03T12:00)
        assert entry["earliest_eligible_at"].startswith("2026-07-04T12:00")

    def test_unclassified_pid_not_recommended(self, tmp_path):
        # PID absent from every stale-triage bucket (e.g. never messaged,
        # or the message fetch errored). Not provably rejectable -> in-window
        # bucket with no eligibility estimate.
        st = _write_stale_triage_json(tmp_path, {})
        result = _run(tmp_path, [HIGH_TIER_ROW], [], stale_triage_path=st)
        assert result["bucket_counts"]["no_reply_high_tier"] == 0
        entry = result["buckets"]["no_reply_high_tier_in_window"][0]
        assert entry["stale_bucket"] == "(not classified)"
        assert entry["earliest_eligible_at"] is None

    def test_missing_stale_triage_file_keeps_legacy_behavior(self, tmp_path):
        result = _run(
            tmp_path,
            [HIGH_TIER_ROW],
            [],
            stale_triage_path=str(tmp_path / "does-not-exist.json"),
        )
        assert result["bucket_counts"]["no_reply_high_tier"] == 1
        assert result["bucket_counts"]["no_reply_high_tier_in_window"] == 0
        assert result["stale_triage_available"] is False

    def test_env_var_unset_keeps_legacy_behavior(self, tmp_path):
        result = _run(tmp_path, [HIGH_TIER_ROW], [])
        assert result["bucket_counts"]["no_reply_high_tier"] == 1
        assert result["stale_triage_available"] is False

    def test_low_tier_no_reply_unaffected_by_stale_triage(self, tmp_path):
        low = dict(HIGH_TIER_ROW, IRI_Fail_Count="1", Disposition="FLAG-SINGLE-IRI")
        st = _write_stale_triage_json(
            tmp_path,
            {
                "in_window_msg": [
                    {"pid": low["PROLIFIC_PID"], "age_hours": 4.0, "anchor": "2026-07-01T08:00:00+00:00", "anchor_kind": "last_researcher_message"}
                ]
            },
        )
        result = _run(tmp_path, [low], [], stale_triage_path=st)
        assert result["bucket_counts"]["no_reply"] == 1
        assert result["bucket_counts"]["no_reply_high_tier_in_window"] == 0

    def test_replied_pids_unaffected_by_stale_triage(self, tmp_path):
        # A high-tier PID WITH a reply goes to human_review_high_tier
        # regardless of its stale-triage bucket.
        st = _write_stale_triage_json(
            tmp_path,
            {
                "stale_no_reply_to_rr": [
                    {"pid": HIGH_TIER_ROW["PROLIFIC_PID"], "age_hours": 72.0, "anchor": "2026-06-28T10:00:00+00:00", "anchor_kind": "return_requested"}
                ]
            },
        )
        result = _run(
            tmp_path,
            [HIGH_TIER_ROW],
            [{"participant_id": HIGH_TIER_ROW["PROLIFIC_PID"], "body": "I was tired.", "themes": ""}],
            stale_triage_path=st,
        )
        assert result["bucket_counts"]["human_review_high_tier"] == 1
        assert result["bucket_counts"]["no_reply_high_tier"] == 0
        assert result["bucket_counts"]["no_reply_high_tier_in_window"] == 0


# ---------------------------------------------------------------------------
# Multi-reply tracking
# ---------------------------------------------------------------------------


class TestMultiReply:
    def test_two_replies_counted(self, tmp_path):
        result = _run(
            tmp_path,
            [
                {
                    "PROLIFIC_PID": "HHHH000000000000000000001",
                    "IRI_Fail_Count": "1",
                    "Disposition": "FLAG-SINGLE-IRI",
                    "Prolific_Status": "AWAITING REVIEW",
                }
            ],
            [
                {"participant_id": "HHHH000000000000000000001", "body": "Thanks.", "themes": ""},
                {"participant_id": "HHHH000000000000000000001", "body": "One more thing.", "themes": ""},
            ],
        )
        assert result["multi_reply_count"] == 1

    def test_single_reply_not_multi(self, tmp_path):
        result = _run(
            tmp_path,
            [
                {
                    "PROLIFIC_PID": "IIII000000000000000000001",
                    "IRI_Fail_Count": "1",
                    "Disposition": "FLAG-SINGLE-IRI",
                    "Prolific_Status": "AWAITING REVIEW",
                }
            ],
            [
                {"participant_id": "IIII000000000000000000001", "body": "Just one.", "themes": ""},
            ],
        )
        assert result["multi_reply_count"] == 0


# ---------------------------------------------------------------------------
# Bucket entry schema — these fields are consumed by the daily report
# (build-daily-report.sh) and by the bulk-action workflows. Locking them in
# so a future refactor of the entry dict can't silently break downstream.
# ---------------------------------------------------------------------------


class TestBucketEntrySchema:
    REQUIRED_FIELDS = {
        "pid",
        "disposition",
        "iri_fail",
        "speed_flag",
        "partial_straightlining_flag",
        "reply_count",
        "reply_theme_counts",
    }

    def test_no_reply_high_tier_entry_has_required_fields(self, tmp_path):
        result = _run(
            tmp_path,
            [
                {
                    "PROLIFIC_PID": "JJJJ000000000000000000001",
                    "IRI_Fail_Count": "3",
                    "Speed_Flag": "0",
                    "Partial_Straightlining_Flag": "0",
                    "Disposition": "AUTO-EXCLUDE",
                    "Prolific_Status": "AWAITING REVIEW",
                }
            ],
            [],
        )
        entries = result["buckets"]["no_reply_high_tier"]
        assert len(entries) == 1
        missing = self.REQUIRED_FIELDS - set(entries[0].keys())
        assert not missing, f"missing fields in no_reply_high_tier entry: {missing}"

    def test_auto_approve_eligible_entry_has_required_fields(self, tmp_path):
        result = _run(
            tmp_path,
            [
                {
                    "PROLIFIC_PID": "KKKK000000000000000000001",
                    "IRI_Fail_Count": "1",
                    "Disposition": "FLAG-SINGLE-IRI",
                    "Prolific_Status": "AWAITING REVIEW",
                }
            ],
            [
                {"participant_id": "KKKK000000000000000000001", "body": "I read carefully.", "themes": ""},
            ],
        )
        entries = result["buckets"]["auto_approve_eligible"]
        assert len(entries) == 1
        missing = self.REQUIRED_FIELDS - set(entries[0].keys())
        assert not missing, f"missing fields in auto_approve_eligible entry: {missing}"

    def test_human_review_high_tier_entry_has_required_fields(self, tmp_path):
        # The build-daily-report.sh "high tier" sub-section groups entries by
        # (disposition, iri_fail, speed_flag, partial_straightlining_flag).
        # If any of those keys is missing, the grouping raises KeyError.
        result = _run(
            tmp_path,
            [
                {
                    "PROLIFIC_PID": "LLLL000000000000000000001",
                    "IRI_Fail_Count": "2",
                    "Speed_Flag": "1",
                    "Partial_Straightlining_Flag": "0",
                    "Disposition": "AUTO-EXCLUDE",
                    "Prolific_Status": "AWAITING REVIEW",
                }
            ],
            [
                {"participant_id": "LLLL000000000000000000001", "body": "I was tired.", "themes": ""},
            ],
        )
        entries = result["buckets"]["human_review_high_tier"]
        assert len(entries) == 1
        missing = self.REQUIRED_FIELDS - set(entries[0].keys())
        assert not missing, f"missing fields in human_review_high_tier entry: {missing}"
