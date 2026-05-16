"""Tests for approve_by_pid.py."""

from __future__ import annotations

import json
from pathlib import Path

from approve_by_pid import main


def _base_env(tmp_path: Path, **overrides: str) -> dict[str, str]:
    env = {
        "PROLIFIC_API_TOKEN": "token",
        "STUDY_ID": "study_123",
        "PID_LIST": "aaaaaaaaaaaaaaaaaaaaaaa1,bbbbbbbbbbbbbbbbbbbbbbb2",
        "DRY_RUN": "true",
        "MAX_PER_RUN": "30",
        "OUTPUT_JSON_PATH": str(tmp_path / "result.json"),
    }
    env.update(overrides)
    return env


def test_dry_run_still_filters_non_awaiting(monkeypatch, tmp_path):
    monkeypatch.setattr(
        "approve_by_pid.prolific_study_info",
        lambda *_: {"name": "Study", "status": "ACTIVE"},
    )
    monkeypatch.setattr(
        "approve_by_pid.prolific_submission_statuses",
        lambda *_: {
            "aaaaaaaaaaaaaaaaaaaaaaa1": "AWAITING REVIEW",
            "bbbbbbbbbbbbbbbbbbbbbbb2": "APPROVED",
        },
    )
    monkeypatch.setattr("approve_by_pid.prolific_bulk_approve", lambda *_: None)
    monkeypatch.setattr("approve_by_pid.prolific_user_messages", lambda *_: [])
    monkeypatch.setattr("approve_by_pid.prolific_send_message", lambda *_: None)
    monkeypatch.setattr("approve_by_pid.time.sleep", lambda *_: None)

    monkeypatch.setattr("approve_by_pid.os.environ", _base_env(tmp_path))
    rc = main()

    assert rc == 0
    payload = json.loads((tmp_path / "result.json").read_text())
    assert payload["mode"] == "dry_run"
    assert payload["approved"] == ["aaaaaaaaaaaaaaaaaaaaaaa1"]
    assert payload["skipped_non_awaiting"] == [{"pid": "bbbbbbbbbbbbbbbbbbbbbbb2", "status": "APPROVED"}]


def test_live_thank_you_uses_backoff_then_succeeds(monkeypatch, tmp_path):
    monkeypatch.setattr(
        "approve_by_pid.prolific_study_info",
        lambda *_: {"name": "Study", "status": "ACTIVE"},
    )
    monkeypatch.setattr(
        "approve_by_pid.prolific_submission_statuses",
        lambda *_: {"aaaaaaaaaaaaaaaaaaaaaaa1": "AWAITING REVIEW"},
    )
    monkeypatch.setattr("approve_by_pid.prolific_bulk_approve", lambda *_: None)

    attempts = {"fetch": 0, "send": 0}

    def _messages(*_args):
        attempts["fetch"] += 1
        if attempts["fetch"] == 1:
            raise RuntimeError("HTTP 429 at /messages/?user_id=aaaaaaaaaaaaaaaaaaaaaaa1")
        return []

    def _send(*_args):
        attempts["send"] += 1
        if attempts["send"] == 1:
            raise RuntimeError("HTTP 503 temporary")
        return None

    sleep_calls: list[int | float] = []

    monkeypatch.setattr("approve_by_pid.prolific_user_messages", _messages)
    monkeypatch.setattr("approve_by_pid.prolific_send_message", _send)
    monkeypatch.setattr("approve_by_pid.time.sleep", lambda secs: sleep_calls.append(secs))
    monkeypatch.setattr("approve_by_pid._API_CALL_DELAY", 0)

    monkeypatch.setattr(
        "approve_by_pid.os.environ",
        _base_env(
            tmp_path,
            PID_LIST="aaaaaaaaaaaaaaaaaaaaaaa1",
            DRY_RUN="false",
            CONFIRM_APPROVE="APPROVE",
        ),
    )
    rc = main()

    assert rc == 0
    payload = json.loads((tmp_path / "result.json").read_text())
    assert payload["approved"] == ["aaaaaaaaaaaaaaaaaaaaaaa1"]
    assert payload["thank_you_sent"] == ["aaaaaaaaaaaaaaaaaaaaaaa1"]
    assert payload["thank_you_failed"] == []
    assert attempts == {"fetch": 2, "send": 2}
    assert 2 in sleep_calls


def test_ceiling_applies_to_filtered_targets_not_input(monkeypatch, tmp_path):
    monkeypatch.setattr(
        "approve_by_pid.prolific_study_info",
        lambda *_: {"name": "Study", "status": "ACTIVE"},
    )
    monkeypatch.setattr(
        "approve_by_pid.prolific_submission_statuses",
        lambda *_: {
            "aaaaaaaaaaaaaaaaaaaaaaa1": "AWAITING REVIEW",
            "bbbbbbbbbbbbbbbbbbbbbbb2": "AWAITING REVIEW",
            "ccccccccccccccccccccccc3": "AWAITING REVIEW",
        },
    )
    monkeypatch.setattr("approve_by_pid.prolific_bulk_approve", lambda *_: None)
    monkeypatch.setattr("approve_by_pid.prolific_user_messages", lambda *_: [])
    monkeypatch.setattr("approve_by_pid.prolific_send_message", lambda *_: None)
    monkeypatch.setattr("approve_by_pid.time.sleep", lambda *_: None)

    monkeypatch.setattr(
        "approve_by_pid.os.environ",
        _base_env(
            tmp_path,
            PID_LIST="aaaaaaaaaaaaaaaaaaaaaaa1,bbbbbbbbbbbbbbbbbbbbbbb2,ccccccccccccccccccccccc3",
            MAX_PER_RUN="2",
            DRY_RUN="true",
        ),
    )
    rc = main()

    assert rc == 0
    payload = json.loads((tmp_path / "result.json").read_text())
    assert payload["input_count"] == 3
    assert payload["eligible_target_count"] == 3
    assert payload["ceiling_exceeded"] is True
    assert payload["approved"] == ["aaaaaaaaaaaaaaaaaaaaaaa1", "bbbbbbbbbbbbbbbbbbbbbbb2"]
    assert payload["skipped_ceiling"] == [{"pid": "ccccccccccccccccccccccc3", "status": "AWAITING REVIEW"}]
