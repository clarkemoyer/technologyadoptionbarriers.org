"""Unit tests for find_stale_return_requested.classify_submission.

Covers:
  - return-requested path (stale and in-window)
  - message-only path (stale and in-window)
  - engaged-participant exclusion (replied after RR, replied after last msg)
  - non-AWAITING REVIEW submissions are excluded
  - missing participant_id is excluded
  - no researcher messages yields (None, None)
  - custom STALE_HOURS threshold is respected
  - _msg_time returns None for messages with no valid timestamp
  - classify_submission tolerates timestamp-less messages (skips them)
"""

from datetime import datetime, timedelta, timezone

import pytest

from find_stale_return_requested import classify_submission, _msg_time, _objectid_time

RESEARCHER_ID = "researcher_001"
NOW = datetime(2026, 4, 23, 12, 0, 0, tzinfo=timezone.utc)
THRESHOLD_HOURS = 48
CUTOFF = NOW - timedelta(hours=THRESHOLD_HOURS)


def _ts(dt: datetime) -> str:
    """Return an ISO-8601 string (UTC, Z-suffix) for a datetime."""
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")


def _msg(sender_id: str, sent_at: datetime) -> dict:
    return {"sender_id": sender_id, "sent_at": _ts(sent_at)}


def _sub(pid: str, status: str = "AWAITING REVIEW", rr: datetime | None = None, reasons=None) -> dict:
    s: dict = {"participant_id": pid, "status": status}
    if rr is not None:
        s["return_requested"] = _ts(rr)
        s["return_requested_reasons"] = reasons or []
    return s


# ── Return-requested path ────────────────────────────────────────────────────

class TestReturnRequestedPath:
    def test_stale_rr_no_reply_is_reject_candidate(self):
        """RR set >48h ago with no participant reply → stale_no_reply_to_rr."""
        rr_time = NOW - timedelta(hours=60)
        sub = _sub("PID_A", rr=rr_time, reasons=["failed attention check"])
        msgs = [_msg(RESEARCHER_ID, rr_time - timedelta(hours=1))]
        bucket, record = classify_submission(sub, msgs, RESEARCHER_ID, NOW, CUTOFF)
        assert bucket == "stale_no_reply_to_rr"
        assert record["pid"] == "PID_A"
        assert record["age_hours"] == pytest.approx(60.0, abs=0.1)
        assert record["anchor_kind"] == "return_requested"
        assert record["reasons"] == ["failed attention check"]

    def test_in_window_rr_not_stale(self):
        """RR set <48h ago with no reply → in_window_rr (don't touch yet)."""
        rr_time = NOW - timedelta(hours=24)
        sub = _sub("PID_B", rr=rr_time)
        msgs = []
        bucket, record = classify_submission(sub, msgs, RESEARCHER_ID, NOW, CUTOFF)
        assert bucket == "in_window_rr"
        assert record["pid"] == "PID_B"
        assert record["age_hours"] == pytest.approx(24.0, abs=0.1)

    def test_engaged_participant_after_rr_is_excluded(self):
        """Participant replied after RR → excluded (engaged; approve path)."""
        rr_time = NOW - timedelta(hours=60)
        reply_time = rr_time + timedelta(hours=1)
        sub = _sub("PID_C", rr=rr_time)
        msgs = [
            _msg(RESEARCHER_ID, rr_time - timedelta(hours=2)),
            _msg("PID_C", reply_time),
        ]
        bucket, record = classify_submission(sub, msgs, RESEARCHER_ID, NOW, CUTOFF)
        assert bucket is None
        assert record is None

    def test_rr_at_exact_cutoff_boundary(self):
        """RR set exactly at cutoff (not strictly before) → in_window_rr."""
        sub = _sub("PID_D", rr=CUTOFF)
        msgs = []
        bucket, _ = classify_submission(sub, msgs, RESEARCHER_ID, NOW, CUTOFF)
        assert bucket == "in_window_rr"

    def test_stale_rr_record_contains_researcher_message_count(self):
        """Record includes correct researcher_messages count."""
        rr_time = NOW - timedelta(hours=72)
        sub = _sub("PID_E", rr=rr_time)
        msgs = [
            _msg(RESEARCHER_ID, rr_time - timedelta(hours=10)),
            _msg(RESEARCHER_ID, rr_time - timedelta(hours=5)),
        ]
        bucket, record = classify_submission(sub, msgs, RESEARCHER_ID, NOW, CUTOFF)
        assert bucket == "stale_no_reply_to_rr"
        assert record["researcher_messages"] == 2
        assert record["total_messages"] == 2


# ── Message-only path (no return_requested) ──────────────────────────────────

class TestMessageOnlyPath:
    def test_stale_msg_no_reply_is_request_return_candidate(self):
        """Researcher messaged >48h ago, no RR, no participant reply → stale_no_reply_to_message."""
        msg_time = NOW - timedelta(hours=72)
        sub = _sub("PID_F")
        msgs = [_msg(RESEARCHER_ID, msg_time)]
        bucket, record = classify_submission(sub, msgs, RESEARCHER_ID, NOW, CUTOFF)
        assert bucket == "stale_no_reply_to_message"
        assert record["pid"] == "PID_F"
        assert record["anchor_kind"] == "last_researcher_message"
        assert record["age_hours"] == pytest.approx(72.0, abs=0.1)

    def test_in_window_msg_not_stale(self):
        """Researcher messaged <48h ago, no reply → in_window_msg."""
        msg_time = NOW - timedelta(hours=10)
        sub = _sub("PID_G")
        msgs = [_msg(RESEARCHER_ID, msg_time)]
        bucket, record = classify_submission(sub, msgs, RESEARCHER_ID, NOW, CUTOFF)
        assert bucket == "in_window_msg"
        assert record["pid"] == "PID_G"

    def test_engaged_participant_after_msg_is_excluded(self):
        """Participant replied after last researcher message → excluded."""
        msg_time = NOW - timedelta(hours=72)
        reply_time = msg_time + timedelta(hours=1)
        sub = _sub("PID_H")
        msgs = [
            _msg(RESEARCHER_ID, msg_time),
            _msg("PID_H", reply_time),
        ]
        bucket, record = classify_submission(sub, msgs, RESEARCHER_ID, NOW, CUTOFF)
        assert bucket is None
        assert record is None

    def test_latest_researcher_msg_is_used_as_anchor(self):
        """When there are multiple researcher messages, the latest determines staleness."""
        old_msg = NOW - timedelta(hours=100)
        recent_msg = NOW - timedelta(hours=10)  # within window
        sub = _sub("PID_I")
        msgs = [
            _msg(RESEARCHER_ID, old_msg),
            _msg(RESEARCHER_ID, recent_msg),
        ]
        bucket, record = classify_submission(sub, msgs, RESEARCHER_ID, NOW, CUTOFF)
        # Latest msg is only 10h old → in_window_msg
        assert bucket == "in_window_msg"
        assert record["age_hours"] == pytest.approx(10.0, abs=0.1)

    def test_no_researcher_messages_yields_none(self):
        """No researcher messages and no RR → submission is not in any bucket."""
        sub = _sub("PID_J")
        msgs = [_msg("PID_J", NOW - timedelta(hours=5))]  # only participant msg
        bucket, record = classify_submission(sub, msgs, RESEARCHER_ID, NOW, CUTOFF)
        assert bucket is None
        assert record is None

    def test_no_messages_at_all_yields_none(self):
        """No messages and no RR → not in any bucket."""
        sub = _sub("PID_K")
        bucket, record = classify_submission(sub, [], RESEARCHER_ID, NOW, CUTOFF)
        assert bucket is None
        assert record is None


# ── General exclusions ────────────────────────────────────────────────────────

class TestGeneralExclusions:
    def test_non_awaiting_review_is_excluded(self):
        """Submissions with status other than AWAITING REVIEW are ignored."""
        for status in ("APPROVED", "RETURNED", "REJECTED", "TIMED-OUT"):
            sub = _sub("PID_L", status=status, rr=NOW - timedelta(hours=100))
            bucket, record = classify_submission(sub, [], RESEARCHER_ID, NOW, CUTOFF)
            assert bucket is None, f"Expected None for status={status}"
            assert record is None

    def test_missing_participant_id_is_excluded(self):
        """Submissions with no participant_id are skipped."""
        sub = {"status": "AWAITING REVIEW"}
        bucket, record = classify_submission(sub, [], RESEARCHER_ID, NOW, CUTOFF)
        assert bucket is None
        assert record is None

    def test_empty_participant_id_is_excluded(self):
        """Submissions with empty-string participant_id are skipped."""
        sub = {"participant_id": "", "status": "AWAITING REVIEW"}
        bucket, record = classify_submission(sub, [], RESEARCHER_ID, NOW, CUTOFF)
        assert bucket is None
        assert record is None


# ── Custom threshold ──────────────────────────────────────────────────────────

class TestCustomThreshold:
    def test_24h_threshold_reclassifies_borderline_submission(self):
        """A submission 30h old is stale at 24h threshold but in-window at 48h."""
        rr_time = NOW - timedelta(hours=30)
        sub = _sub("PID_M", rr=rr_time)
        msgs = []

        cutoff_24h = NOW - timedelta(hours=24)
        bucket_24, _ = classify_submission(sub, msgs, RESEARCHER_ID, NOW, cutoff_24h)
        assert bucket_24 == "stale_no_reply_to_rr"

        cutoff_48h = NOW - timedelta(hours=48)
        bucket_48, _ = classify_submission(sub, msgs, RESEARCHER_ID, NOW, cutoff_48h)
        assert bucket_48 == "in_window_rr"


# ── _msg_time sentinel behaviour ─────────────────────────────────────────────

class TestMsgTime:
    def test_valid_sent_at_is_returned(self):
        """_msg_time returns the parsed sent_at timestamp."""
        dt = NOW - timedelta(hours=5)
        m = {"sender_id": "x", "sent_at": dt.strftime("%Y-%m-%dT%H:%M:%SZ")}
        assert _msg_time(m) == dt

    def test_falls_back_to_created_at(self):
        """_msg_time uses created_at when sent_at is absent."""
        dt = NOW - timedelta(hours=3)
        m = {"sender_id": "x", "created_at": dt.strftime("%Y-%m-%dT%H:%M:%SZ")}
        assert _msg_time(m) == dt

    def test_missing_timestamps_returns_none(self):
        """_msg_time returns None when neither timestamp field is present."""
        assert _msg_time({"sender_id": "x"}) is None

    def test_unparseable_timestamps_returns_none(self):
        """_msg_time returns None when both timestamp fields are unparseable."""
        assert _msg_time({"sender_id": "x", "sent_at": "not-a-date", "created_at": None}) is None

    def test_classify_tolerates_timestampless_participant_message(self):
        """A participant message with no timestamp cannot prove a reply-after-RR
        happened, so it is skipped for ordering purposes and the submission
        stays classified as stale."""
        rr_time = NOW - timedelta(hours=60)
        sub = _sub("PID_N", rr=rr_time)
        msgs = [
            {"sender_id": RESEARCHER_ID, "sent_at": _ts(rr_time - timedelta(hours=1))},
            {"sender_id": "PID_N", "sent_at": "bad-timestamp"},
        ]
        bucket, record = classify_submission(sub, msgs, RESEARCHER_ID, NOW, CUTOFF)
        assert bucket == "stale_no_reply_to_rr"
        assert record is not None
        assert record["pid"] == "PID_N"

    def test_classify_tolerates_timestampless_researcher_message_only_path(self):
        """A researcher message with no timestamp is skipped for ordering in the
        message-only path; if at least one researcher message with a valid
        timestamp exists, classification proceeds as normal."""
        good_time = NOW - timedelta(hours=60)
        sub = _sub("PID_T")
        msgs = [
            {"sender_id": RESEARCHER_ID, "sent_at": "bad-timestamp"},
            _msg(RESEARCHER_ID, good_time),
        ]
        bucket, record = classify_submission(sub, msgs, RESEARCHER_ID, NOW, CUTOFF)
        assert bucket == "stale_no_reply_to_message"
        assert record is not None
        assert record["pid"] == "PID_T"


# ── ObjectId-prefix timestamp fallback ──────────────────────────────────────
#
# Prolific message ids are MongoDB ObjectIds whose first 4 bytes encode the
# Unix epoch creation time. The messages API frequently returns sent_at /
# created_at as null for FLAG-* and clarification messages, so the ObjectId
# prefix is the only deterministic ordering anchor available. These tests
# pin the decoder + ensure classify_submission picks up participant replies
# that previously slipped through and got the PID flagged for rejection.

# Synthetic ObjectId used across this test class.  Constructed from a
# well-known round epoch (2026-01-01T00:00:00 UTC = 0x6955b900) plus a
# fixed dummy suffix — clearly not a real participant or message identifier.
_SYNTHETIC_EPOCH = datetime(2026, 1, 1, 0, 0, 0, tzinfo=timezone.utc)
_SYNTHETIC_OID = format(int(_SYNTHETIC_EPOCH.timestamp()), "08x") + "deadbeefdeadbeef"


class TestObjectIdFallback:
    def test_objectid_decoder_decodes_known_epoch(self):
        """Synthetic ObjectId constructed from a known round epoch decodes
        back to that same epoch.  Prefix 0x6955b900 = 1767225600 seconds
        = 2026-01-01T00:00:00 UTC."""
        decoded = _objectid_time(_SYNTHETIC_OID)
        assert decoded == _SYNTHETIC_EPOCH

    def test_objectid_decoder_returns_none_for_non_string(self):
        assert _objectid_time(None) is None
        assert _objectid_time(12345) is None

    def test_objectid_decoder_returns_none_for_short_string(self):
        assert _objectid_time("abc") is None

    def test_objectid_decoder_returns_none_for_non_24_length(self):
        """IDs >= 8 chars but not exactly 24 must be rejected.

        Covers the API-format-change risk where a UUID-like id such as
        '69ef4762-f059-1a0a-e79e-a82f' (28 chars) starts with 8 valid
        hex chars but is not a MongoDB ObjectId."""
        # 16 chars — long enough for the old len >= 8 guard but not 24
        assert _objectid_time("69ef4762f0591a0a") is None
        # 28 chars — UUID-like, starts with 8 valid hex chars
        assert _objectid_time("69ef4762-f059-1a0a-e79e-a82f") is None
        # 25 chars — off by one
        assert _objectid_time("69ef4762f0591a0ae79ea82f0") is None

    def test_objectid_decoder_returns_none_for_non_hex_prefix(self):
        assert _objectid_time("zzzzzzzzdeadbeefdeadbeef") is None

    def test_msg_time_uses_objectid_when_timestamps_absent(self):
        """When sent_at and created_at are null/undefined, _msg_time falls
        back to the ObjectId timestamp prefix instead of returning None."""
        m = {"sender_id": "x", "id": _SYNTHETIC_OID}
        assert _msg_time(m) == _SYNTHETIC_EPOCH

    def test_msg_time_prefers_explicit_sent_at_over_objectid(self):
        """sent_at is the most authoritative source; ObjectId is the last
        resort. Explicit timestamps must win even if the id is also present."""
        explicit = NOW - timedelta(hours=12)
        m = {
            "sender_id": "x",
            "sent_at": _ts(explicit),
            "id": _SYNTHETIC_OID,  # would decode to a different time
        }
        assert _msg_time(m) == explicit

    def test_classify_recognises_participant_reply_via_objectid(self):
        """Participant message has no sent_at / created_at but its id encodes
        a timestamp AFTER the return_requested. Without the fallback, this
        PID was being misclassified as stale_no_reply_to_rr — the exact bug
        that caused the 2026-05-01 rejection-review-rounds investigation."""
        rr_time = NOW - timedelta(hours=60)
        # Reply id encodes a time roughly 1 hour after the RR was sent.
        reply_ts = rr_time + timedelta(hours=1)
        reply_id = format(int(reply_ts.timestamp()), "08x") + "f0591a0ae79ea82f"
        sub = _sub("PID_R", rr=rr_time)
        msgs = [
            {"sender_id": RESEARCHER_ID, "sent_at": _ts(rr_time - timedelta(hours=1))},
            # Participant message with NO explicit timestamps but a valid id.
            {"sender_id": "PID_R", "id": reply_id},
        ]
        bucket, record = classify_submission(sub, msgs, RESEARCHER_ID, NOW, CUTOFF)
        # Participant did reply (per ObjectId timestamp), so the PID should be
        # excluded from any stale bucket — not queued for rejection.
        assert bucket is None
        assert record is None

    def test_classify_returns_none_when_all_researcher_messages_lack_timestamps(self):
        """If every researcher message lacks a valid timestamp in the
        message-only path, there is no anchor to measure from and the
        submission is not classified."""
        sub = _sub("PID_U")
        msgs = [{"sender_id": RESEARCHER_ID, "sent_at": "bad-timestamp"}]
        bucket, record = classify_submission(sub, msgs, RESEARCHER_ID, NOW, CUTOFF)
        assert bucket is None
        assert record is None
