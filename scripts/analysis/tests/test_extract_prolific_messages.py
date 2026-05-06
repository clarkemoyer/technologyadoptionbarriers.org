"""Tests for extract_prolific_messages.py - per-participant fetch strategy."""

from __future__ import annotations

import sys
from pathlib import Path
from unittest.mock import patch

import pytest

# Make the analysis package importable.
sys.path.insert(0, str(Path(__file__).parent.parent))

# Import internal helpers we want to exercise directly.
from extract_prolific_messages import main, pii_assessment, themes_for  # noqa: E402


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_message(
    id: str,
    sender_id: str = "participant-001",
    body: str = "Hello",
    study_id: str = "STUDY_A",
    sent_at: str = "2025-03-01T10:00:00Z",
) -> dict:
    return {
        "id": id,
        "sender_id": sender_id,
        "body": body,
        "sent_at": sent_at,
        "channel_id": f"ch-{sender_id}",
        "data": {"study_id": study_id},
    }


# ---------------------------------------------------------------------------
# 1. study_id filter removes messages from other studies
# ---------------------------------------------------------------------------

class TestStudyIdFilter:
    """When STUDY_ID is set, only messages for that study appear in output."""

    def _run(self, tmp_path: Path, study_id: str | None, messages_by_user: dict[str, list[dict]]) -> dict:
        """Run main() with mocked API and return the parsed aggregate JSON."""
        raw_path = tmp_path / "raw.json"
        csv_path = tmp_path / "inbound.csv"
        transcripts_path = tmp_path / "transcripts.md"
        candidates_path = tmp_path / "candidates.md"
        summary_path = tmp_path / "summary.json"

        env = {
            "PROLIFIC_API_TOKEN": "token",
            "RESEARCHER_ID": "researcher-999",
            "SINCE": "",
            "RAW_OUTPUT_PATH": str(raw_path),
            "INBOUND_CSV_PATH": str(csv_path),
            "TRANSCRIPTS_PATH": str(transcripts_path),
            "CANDIDATES_PATH": str(candidates_path),
            "SUMMARY_PATH": str(summary_path),
        }
        if study_id:
            env["STUDY_ID"] = study_id

        # submissions: one submission per user id key
        submissions = [{"participant_id": uid} for uid in messages_by_user]

        with (
            patch.dict("os.environ", env, clear=True),
            patch("extract_prolific_messages.prolific_list_studies", return_value=[{"id": "STUDY_A"}, {"id": "STUDY_B"}]),
            patch("extract_prolific_messages.prolific_submissions", return_value=submissions),
            patch("extract_prolific_messages.prolific_user_messages", side_effect=lambda uid, _token: messages_by_user.get(uid, [])),
        ):
            rc = main()

        import json
        aggregate = json.loads(summary_path.read_text())
        return {"rc": rc, "aggregate": aggregate, "raw": json.loads(raw_path.read_text())}

    def test_study_id_filter_excludes_other_study(self, tmp_path):
        """Messages from a different study are excluded when STUDY_ID is set."""
        messages_by_user = {
            "p1": [
                _make_message("m1", sender_id="p1", study_id="STUDY_A"),
                _make_message("m2", sender_id="p1", study_id="STUDY_B"),  # should be excluded
            ],
        }
        result = self._run(tmp_path, study_id="STUDY_A", messages_by_user=messages_by_user)
        assert result["rc"] == 0
        raw = result["raw"]
        assert len(raw) == 1
        assert raw[0]["id"] == "m1"

    def test_no_study_id_returns_all_messages(self, tmp_path):
        """When STUDY_ID is not set all messages across studies are included."""
        messages_by_user = {
            "p1": [
                _make_message("m1", sender_id="p1", study_id="STUDY_A"),
                _make_message("m2", sender_id="p1", study_id="STUDY_B"),
            ],
        }
        result = self._run(tmp_path, study_id=None, messages_by_user=messages_by_user)
        assert result["rc"] == 0
        assert len(result["raw"]) == 2

    def test_study_id_filter_all_excluded(self, tmp_path):
        """If no messages match the study, the export is empty but exits 0."""
        messages_by_user = {
            "p1": [_make_message("m1", sender_id="p1", study_id="STUDY_B")],
        }
        result = self._run(tmp_path, study_id="STUDY_A", messages_by_user=messages_by_user)
        assert result["rc"] == 0
        assert len(result["raw"]) == 0


# ---------------------------------------------------------------------------
# 2. Deduplication by message id across participants
# ---------------------------------------------------------------------------

class TestDeduplication:
    """Messages with duplicate ids (e.g. returned for multiple participants) appear once."""

    def _run(self, tmp_path: Path, messages_by_user: dict[str, list[dict]]) -> list[dict]:
        raw_path = tmp_path / "raw.json"
        csv_path = tmp_path / "inbound.csv"
        transcripts_path = tmp_path / "transcripts.md"
        candidates_path = tmp_path / "candidates.md"
        summary_path = tmp_path / "summary.json"

        env = {
            "PROLIFIC_API_TOKEN": "token",
            "RESEARCHER_ID": "researcher-999",
            "SINCE": "",
            "RAW_OUTPUT_PATH": str(raw_path),
            "INBOUND_CSV_PATH": str(csv_path),
            "TRANSCRIPTS_PATH": str(transcripts_path),
            "CANDIDATES_PATH": str(candidates_path),
            "SUMMARY_PATH": str(summary_path),
        }
        submissions = [{"participant_id": uid} for uid in messages_by_user]

        with (
            patch.dict("os.environ", env, clear=True),
            patch("extract_prolific_messages.prolific_list_studies", return_value=[{"id": "STUDY_A"}]),
            patch("extract_prolific_messages.prolific_submissions", return_value=submissions),
            patch("extract_prolific_messages.prolific_user_messages", side_effect=lambda uid, _token: messages_by_user.get(uid, [])),
        ):
            main()

        import json
        return json.loads(raw_path.read_text())

    def test_duplicate_message_ids_deduplicated(self, tmp_path):
        """The same message id returned for two users appears exactly once."""
        shared_msg = _make_message("shared-id", sender_id="p1")
        messages_by_user = {
            "p1": [shared_msg],
            "p2": [shared_msg],  # same id, different user fetch
        }
        raw = self._run(tmp_path, messages_by_user)
        assert len(raw) == 1
        assert raw[0]["id"] == "shared-id"

    def test_different_ids_not_deduplicated(self, tmp_path):
        """Two messages with different ids both appear in output."""
        messages_by_user = {
            "p1": [_make_message("id-1", sender_id="p1")],
            "p2": [_make_message("id-2", sender_id="p2")],
        }
        raw = self._run(tmp_path, messages_by_user)
        ids = {m["id"] for m in raw}
        assert ids == {"id-1", "id-2"}

    def test_messages_without_id_excluded(self, tmp_path):
        """Messages that have no 'id' field are silently skipped."""
        messages_by_user = {
            "p1": [{"sender_id": "p1", "body": "no id here", "data": {"study_id": "STUDY_A"}}],
        }
        raw = self._run(tmp_path, messages_by_user)
        assert raw == []


# ---------------------------------------------------------------------------
# 3. Failure handling - non-zero exit and no PID leakage
# ---------------------------------------------------------------------------

class TestFailureHandling:
    """When prolific_user_messages raises, failures are tracked and exit is non-zero."""

    def _run(self, tmp_path: Path, fail_user: str, capsys) -> tuple[int, str]:
        raw_path = tmp_path / "raw.json"
        csv_path = tmp_path / "inbound.csv"
        transcripts_path = tmp_path / "transcripts.md"
        candidates_path = tmp_path / "candidates.md"
        summary_path = tmp_path / "summary.json"

        env = {
            "PROLIFIC_API_TOKEN": "token",
            "RESEARCHER_ID": "researcher-999",
            "SINCE": "",
            "RAW_OUTPUT_PATH": str(raw_path),
            "INBOUND_CSV_PATH": str(csv_path),
            "TRANSCRIPTS_PATH": str(transcripts_path),
            "CANDIDATES_PATH": str(candidates_path),
            "SUMMARY_PATH": str(summary_path),
        }

        submissions = [{"participant_id": "aabbccddeeff112233445566"}]
        good_msg = _make_message("good-id", sender_id="aabbccddeeff112233445566")

        def _side_effect(uid: str, _token: str) -> list[dict]:
            if uid == fail_user:
                raise RuntimeError("API timeout")
            return [good_msg]

        with (
            patch.dict("os.environ", env, clear=True),
            patch("extract_prolific_messages.prolific_list_studies", return_value=[{"id": "STUDY_A"}]),
            patch("extract_prolific_messages.prolific_submissions", return_value=submissions),
            patch("extract_prolific_messages.prolific_user_messages", side_effect=_side_effect),
            # Suppress sys.stdout.reconfigure() so it doesn't fail on the real fd
            patch("sys.stdout.reconfigure", lambda **kw: None, create=True),
            patch("sys.stderr.reconfigure", lambda **kw: None, create=True),
        ):
            rc = main()

        captured = capsys.readouterr()
        return rc, captured.out

    def test_exit_nonzero_on_fetch_failure(self, tmp_path, capsys):
        """Script returns exit code 1 when at least one participant fetch fails."""
        rc, _ = self._run(tmp_path, fail_user="aabbccddeeff112233445566", capsys=capsys)
        assert rc == 1

    def test_pid_not_logged_raw(self, tmp_path, capsys):
        """The full participant ID is not printed to stdout on failure."""
        _rc, stdout = self._run(tmp_path, fail_user="aabbccddeeff112233445566", capsys=capsys)
        # The raw 24-char PID must not appear anywhere in the output.
        assert "aabbccddeeff112233445566" not in stdout

    def test_pid_redacted_to_last_four(self, tmp_path, capsys):
        """Error log redacts the PID to '****<last-4>'."""
        _rc, stdout = self._run(tmp_path, fail_user="aabbccddeeff112233445566", capsys=capsys)
        assert "****5566" in stdout

    def test_zero_on_success(self, tmp_path, capsys):
        """Script returns 0 when all participant fetches succeed."""
        # Use a different fail_user so the actual participant doesn't fail.
        rc, _ = self._run(tmp_path, fail_user="nonexistent-participant", capsys=capsys)
        assert rc == 0
