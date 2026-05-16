"""Tests for approve_by_pid.py — ceiling truncation, status filtering,
dry-run vs live, per-PID failure isolation."""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from unittest.mock import patch, MagicMock

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))


@pytest.fixture
def fake_env(tmp_path, monkeypatch):
    """Set the minimum env vars required by approve_by_pid.main()."""
    output = str(tmp_path / "results.json")
    monkeypatch.setenv("PROLIFIC_API_TOKEN", "tok")
    monkeypatch.setenv("STUDY_ID", "studyA")
    monkeypatch.setenv("OUTPUT_JSON_PATH", output)
    monkeypatch.setenv("DRY_RUN", "true")
    monkeypatch.setenv("MAX_PER_RUN", "30")
    monkeypatch.delenv("CONFIRM_APPROVE", raising=False)
    return output


@pytest.fixture(autouse=True)
def patch_api():
    """Stub out every Prolific API call. Tests can override behavior."""
    with patch("approve_by_pid.prolific_study_info") as study, \
         patch("approve_by_pid.prolific_submission_statuses") as statuses, \
         patch("approve_by_pid.prolific_bulk_approve") as approve, \
         patch("approve_by_pid.prolific_user_messages") as messages, \
         patch("approve_by_pid.prolific_send_message") as send, \
         patch("approve_by_pid.time.sleep"):  # don't actually sleep in tests
        study.return_value = {"name": "Test Study", "status": "ACTIVE"}
        statuses.return_value = {}  # tests override
        approve.return_value = {}
        messages.return_value = []
        send.return_value = {}
        yield {
            "study": study,
            "statuses": statuses,
            "approve": approve,
            "messages": messages,
            "send": send,
        }


def _read(path: str) -> dict:
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def _pid(suffix: str) -> str:
    """Generate a valid 24-char hex PID-shaped string."""
    return (suffix + "0" * 24)[:24]


# ---------------------------------------------------------------------------
# Empty / no-op cases
# ---------------------------------------------------------------------------


class TestNoOp:
    def test_empty_pid_list_exits_with_required_error(self, fake_env, monkeypatch):
        # PID_LIST is _require_env; empty string triggers the required guard
        monkeypatch.setenv("PID_LIST", "")
        import approve_by_pid
        with pytest.raises(SystemExit) as exc:
            approve_by_pid.main()
        assert exc.value.code == 1


# ---------------------------------------------------------------------------
# Safety guards
# ---------------------------------------------------------------------------


class TestSafetyGuards:
    def test_live_without_confirm_aborts(self, fake_env, monkeypatch):
        monkeypatch.setenv("PID_LIST", _pid("a"))
        monkeypatch.setenv("DRY_RUN", "false")
        # No CONFIRM_APPROVE set
        import approve_by_pid
        with pytest.raises(SystemExit) as exc:
            approve_by_pid.main()
        assert exc.value.code == 1

    def test_live_with_wrong_confirm_aborts(self, fake_env, monkeypatch):
        monkeypatch.setenv("PID_LIST", _pid("a"))
        monkeypatch.setenv("DRY_RUN", "false")
        monkeypatch.setenv("CONFIRM_APPROVE", "approve")  # wrong case
        import approve_by_pid
        with pytest.raises(SystemExit) as exc:
            approve_by_pid.main()
        assert exc.value.code == 1


# ---------------------------------------------------------------------------
# Status filtering
# ---------------------------------------------------------------------------


class TestStatusFiltering:
    def test_non_awaiting_pids_are_skipped(self, fake_env, patch_api, monkeypatch):
        pid_a, pid_b, pid_c = _pid("a"), _pid("b"), _pid("c")
        monkeypatch.setenv("PID_LIST", ",".join([pid_a, pid_b, pid_c]))
        patch_api["statuses"].return_value = {
            pid_a: "AWAITING REVIEW",
            pid_b: "APPROVED",
            pid_c: "RETURNED",
        }
        import approve_by_pid
        rc = approve_by_pid.main()
        assert rc == 0
        result = _read(fake_env)
        # Dry-run: only AWAITING REVIEW target makes it into "approved"
        assert result["approved"] == [pid_a]
        # Skipped (non-AWAITING): pid_b and pid_c
        skipped_pids = [s["pid"] for s in result["skipped_non_awaiting"]]
        assert pid_b in skipped_pids
        assert pid_c in skipped_pids

    def test_unknown_pid_treated_as_skip(self, fake_env, patch_api, monkeypatch):
        pid_a = _pid("a")
        monkeypatch.setenv("PID_LIST", pid_a)
        patch_api["statuses"].return_value = {}  # no statuses returned
        import approve_by_pid
        rc = approve_by_pid.main()
        assert rc == 0
        result = _read(fake_env)
        assert result["approved"] == []
        assert result["skipped_non_awaiting"][0]["status"] == "UNKNOWN"


# ---------------------------------------------------------------------------
# Ceiling truncation (the policy change in this PR)
# ---------------------------------------------------------------------------


class TestCeilingTruncation:
    def test_inputs_over_ceiling_after_filter_truncate_and_warn(self, fake_env, patch_api, monkeypatch):
        # Input 5 PIDs, all AWAITING REVIEW, ceiling=2 -> approve 2, defer 3
        pids = [_pid(c) for c in "abcde"]
        monkeypatch.setenv("PID_LIST", ",".join(pids))
        monkeypatch.setenv("MAX_PER_RUN", "2")
        patch_api["statuses"].return_value = {p: "AWAITING REVIEW" for p in pids}
        import approve_by_pid
        rc = approve_by_pid.main()
        assert rc == 0
        result = _read(fake_env)
        assert result["ceiling_exceeded"] is True
        assert len(result["approved"]) == 2  # dry-run, but truncated to first 2
        assert len(result["deferred_over_ceiling"]) == 3

    def test_inputs_over_ceiling_but_filter_brings_under_no_truncate(self, fake_env, patch_api, monkeypatch):
        # Input 5 PIDs but only 2 are AWAITING REVIEW; ceiling=3 -> no truncate
        pids = [_pid(c) for c in "abcde"]
        monkeypatch.setenv("PID_LIST", ",".join(pids))
        monkeypatch.setenv("MAX_PER_RUN", "3")
        patch_api["statuses"].return_value = {
            pids[0]: "AWAITING REVIEW",
            pids[1]: "APPROVED",
            pids[2]: "AWAITING REVIEW",
            pids[3]: "REJECTED",
            pids[4]: "RETURNED",
        }
        import approve_by_pid
        rc = approve_by_pid.main()
        assert rc == 0
        result = _read(fake_env)
        assert result["ceiling_exceeded"] is False
        assert len(result["approved"]) == 2


# ---------------------------------------------------------------------------
# Live approve path — per-PID failure isolation
# ---------------------------------------------------------------------------


class TestLiveApprove:
    def test_per_pid_failure_does_not_abort_others(self, fake_env, patch_api, monkeypatch):
        pid_a, pid_b, pid_c = _pid("a"), _pid("b"), _pid("c")
        monkeypatch.setenv("PID_LIST", ",".join([pid_a, pid_b, pid_c]))
        monkeypatch.setenv("DRY_RUN", "false")
        monkeypatch.setenv("CONFIRM_APPROVE", "APPROVE")
        patch_api["statuses"].return_value = {
            p: "AWAITING REVIEW" for p in [pid_a, pid_b, pid_c]
        }

        # Make approval for pid_b fail; the others should still go through
        def approve_side_effect(study_id, pids, token):
            if pid_b in pids:
                raise RuntimeError("simulated 500 from Prolific")
            return {}

        patch_api["approve"].side_effect = approve_side_effect
        import approve_by_pid
        rc = approve_by_pid.main()
        assert rc == 0
        result = _read(fake_env)
        assert pid_a in result["approved"]
        assert pid_c in result["approved"]
        failed_pids = [f["pid"] for f in result["failures"]]
        assert pid_b in failed_pids

    def test_thank_you_dedup_skips_already_thanked(self, fake_env, patch_api, monkeypatch):
        pid_a = _pid("a")
        monkeypatch.setenv("PID_LIST", pid_a)
        monkeypatch.setenv("DRY_RUN", "false")
        monkeypatch.setenv("CONFIRM_APPROVE", "APPROVE")
        patch_api["statuses"].return_value = {pid_a: "AWAITING REVIEW"}
        # Existing thank-you already in message thread
        patch_api["messages"].return_value = [
            {
                "body": (
                    "Hi, thanks. After reviewing your reply, your submission has "
                    "been approved. Cheers!"
                ),
                "data": {"study_id": "studyA"},
            }
        ]
        import approve_by_pid
        rc = approve_by_pid.main()
        assert rc == 0
        result = _read(fake_env)
        assert pid_a in result["approved"]
        assert pid_a in result["thank_you_skipped_dedup"]
        # Send was never called because dedup hit
        patch_api["send"].assert_not_called()


# ---------------------------------------------------------------------------
# Backoff retry behavior (regression: ensure transient API failures are
# retried instead of aborting the run)
# ---------------------------------------------------------------------------


class TestBackoffRetry:
    def test_thank_you_retries_on_transient_failure(self, fake_env, patch_api, monkeypatch):
        pid_a = _pid("a")
        monkeypatch.setenv("PID_LIST", pid_a)
        monkeypatch.setenv("DRY_RUN", "false")
        monkeypatch.setenv("CONFIRM_APPROVE", "APPROVE")
        patch_api["statuses"].return_value = {pid_a: "AWAITING REVIEW"}

        attempts = {"fetch": 0, "send": 0}

        def fetch_side(*args, **kwargs):
            attempts["fetch"] += 1
            if attempts["fetch"] == 1:
                raise RuntimeError("HTTP 429 transient")
            return []

        def send_side(*args, **kwargs):
            attempts["send"] += 1
            if attempts["send"] == 1:
                raise RuntimeError("HTTP 503 transient")
            return {}

        patch_api["messages"].side_effect = fetch_side
        patch_api["send"].side_effect = send_side

        # Make _API_CALL_DELAY = 0 to keep the test fast
        import approve_by_pid
        monkeypatch.setattr(approve_by_pid, "_API_CALL_DELAY", 0)

        rc = approve_by_pid.main()
        assert rc == 0
        result = _read(fake_env)
        assert pid_a in result["approved"]
        assert pid_a in result["thank_you_sent"]
        assert result["thank_you_failed"] == []
        # Confirms both backoff functions retried at least once
        assert attempts["fetch"] >= 2
        assert attempts["send"] >= 2


# ---------------------------------------------------------------------------
# Result file always written
# ---------------------------------------------------------------------------


class TestResultsFile:
    def test_results_file_has_expected_keys(self, fake_env, patch_api, monkeypatch):
        pid_a = _pid("a")
        monkeypatch.setenv("PID_LIST", pid_a)
        patch_api["statuses"].return_value = {pid_a: "AWAITING REVIEW"}
        import approve_by_pid
        approve_by_pid.main()
        result = _read(fake_env)
        for key in (
            "mode",
            "input_count",
            "ceiling",
            "ceiling_exceeded",
            "deferred_over_ceiling",
            "approved",
            "skipped_non_awaiting",
            "thank_you_sent",
            "thank_you_skipped_dedup",
            "thank_you_failed",
            "failures",
        ):
            assert key in result, f"missing key: {key}"
        assert result["mode"] == "dry_run"
        assert result["input_count"] == 1
