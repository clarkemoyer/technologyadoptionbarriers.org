"""Tests for classify_replies_for_action.py."""

from __future__ import annotations

import csv
import json
from pathlib import Path

from classify_replies_for_action import _split_themes, is_high_rejection_tier, main


def _write_csv(path: Path, headers: list[str], rows: list[list[str]]) -> None:
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(rows)


def test_split_themes_supports_semicolon_pipe_and_empty():
    assert _split_themes("question_about_study;payment_question") == [
        "question_about_study",
        "payment_question",
    ]
    assert _split_themes("question_about_study|payment_question") == [
        "question_about_study",
        "payment_question",
    ]
    assert _split_themes("question_about_study ; payment_question|technical_issue") == [
        "question_about_study",
        "payment_question",
        "technical_issue",
    ]
    assert _split_themes("") == []
    assert _split_themes(None) == []


def test_high_rejection_tier_boundaries():
    assert is_high_rejection_tier({"IRI_Fail_Count": "3", "Speed_Flag": "0", "Partial_Straightlining_Flag": "0"})
    assert is_high_rejection_tier({"IRI_Fail_Count": "2", "Speed_Flag": "1", "Partial_Straightlining_Flag": "0"})
    assert is_high_rejection_tier({"IRI_Fail_Count": "2", "Speed_Flag": "0", "Partial_Straightlining_Flag": "1"})
    assert not is_high_rejection_tier({"IRI_Fail_Count": "2", "Speed_Flag": "0", "Partial_Straightlining_Flag": "0"})
    assert not is_high_rejection_tier({"IRI_Fail_Count": "1", "Speed_Flag": "1", "Partial_Straightlining_Flag": "1"})


def test_high_tier_precedence_over_question_themes(monkeypatch, tmp_path):
    inbound = tmp_path / "inbound.csv"
    disposition = tmp_path / "disposition.csv"
    output = tmp_path / "output.json"

    _write_csv(
        inbound,
        ["participant_id", "themes"],
        [
            ["pid-high-question", "question_about_study"],
            ["pid-question", "question_about_study"],
            ["pid-auto", "acknowledgment"],
        ],
    )
    _write_csv(
        disposition,
        [
            "PROLIFIC_PID",
            "Prolific_Status",
            "Disposition",
            "IRI_Fail_Count",
            "Speed_Flag",
            "Partial_Straightlining_Flag",
        ],
        [
            ["pid-high-question", "AWAITING REVIEW", "FLAG-SPEED", "2", "1", "0"],
            ["pid-question", "AWAITING REVIEW", "FLAG-SPEED", "1", "0", "0"],
            ["pid-auto", "AWAITING REVIEW", "FLAG-SPEED", "1", "0", "0"],
        ],
    )

    monkeypatch.setattr(
        "classify_replies_for_action.os.environ",
        {
            "INBOUND_CSV": str(inbound),
            "DISPOSITION_CSV": str(disposition),
            "OUTPUT_JSON_PATH": str(output),
        },
    )
    rc = main()
    assert rc == 0

    payload = json.loads(output.read_text())
    assert payload["bucket_counts"]["human_review_high_tier"] == 1
    assert payload["bucket_counts"]["human_review_questions"] == 1
    assert payload["bucket_counts"]["auto_approve_eligible"] == 1
    high_tier_pids = {row["pid"] for row in payload["buckets"]["human_review_high_tier"]}
    assert high_tier_pids == {"pid-high-question"}

