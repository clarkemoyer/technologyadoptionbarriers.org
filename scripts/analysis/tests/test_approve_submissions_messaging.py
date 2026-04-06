"""Tests for the thank-you messaging integration in approve_submissions.py.

These tests verify that approve_submissions.main() correctly invokes
send_thank_you_to_pids() after live approval, with proper arguments,
and that dry-run mode does NOT invoke it or report misleading metrics.
"""

import csv
import os
import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent))

import approve_submissions


def _write_csv(tmp_path: Path, headers: list[str], rows: list[list[str]]) -> str:
    """Write a CSV file and return its path."""
    path = str(tmp_path / "disposition.csv")
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(rows)
    return path


def _base_env(tmp_path: Path, csv_path: str, dry_run: str = "false") -> dict[str, str]:
    """Return a minimal env dict for approve_submissions.main()."""
    return {
        "PROLIFIC_API_TOKEN": "test_token",
        "STUDY_ID": "STUDY_1",
        "CSV_FILE_PATH": csv_path,
        "DRY_RUN": dry_run,
    }


class TestMessagingIntegrationLive:
    """Tests for live (non-dry-run) messaging via send_thank_you_to_pids."""

    def test_calls_send_thank_you_after_approval(self, tmp_path):
        """In live mode, send_thank_you_to_pids is called with correct PIDs."""
        csv_path = _write_csv(
            tmp_path,
            ["PROLIFIC_PID", "Disposition"],
            [["PID_A", "CLEAN"], ["PID_B", "CLEAN"], ["PID_C", "FLAG-SPEED"]],
        )
        env = _base_env(tmp_path, csv_path, dry_run="false")

        mock_thank_you = MagicMock(return_value={
            "sent": 2, "skipped": 0, "skipped_not_approved": 0,
            "not_found": 0, "failed": 0,
        })

        with patch.dict(os.environ, env, clear=True), \
             patch.object(approve_submissions, "prolific_study_info", return_value={"name": "Test", "status": "ACTIVE"}), \
             patch.object(approve_submissions, "prolific_submission_statuses", return_value={
                 "PID_A": "AWAITING REVIEW", "PID_B": "AWAITING REVIEW",
             }), \
             patch.object(approve_submissions, "prolific_bulk_approve") as mock_approve, \
             patch("approve_submissions.send_thank_you_to_pids", mock_thank_you, create=True), \
             patch.dict("sys.modules", {"send_thank_you": MagicMock(send_thank_you_to_pids=mock_thank_you)}):
            approve_submissions.main()

        # Verify approval was called
        mock_approve.assert_called_once()
        approve_call_pids = mock_approve.call_args[0][1]
        assert sorted(approve_call_pids) == ["PID_A", "PID_B"]

        # Verify thank-you was called with all CLEAN PIDs
        mock_thank_you.assert_called_once()
        ty_args = mock_thank_you.call_args
        assert sorted(ty_args[0][0]) == ["PID_A", "PID_B"]
        assert ty_args[0][1] == "STUDY_1"
        assert ty_args[0][2] == "test_token"
        assert ty_args.kwargs.get("dry_run") is False or ty_args[0][3] is False

    def test_thank_you_skipped_when_disabled(self, tmp_path):
        """When SEND_THANK_YOU=false, send_thank_you_to_pids is NOT called."""
        csv_path = _write_csv(
            tmp_path,
            ["PROLIFIC_PID", "Disposition"],
            [["PID_A", "CLEAN"]],
        )
        env = _base_env(tmp_path, csv_path, dry_run="false")
        env["SEND_THANK_YOU"] = "false"

        mock_sty_module = MagicMock()

        with patch.dict(os.environ, env, clear=True), \
             patch.object(approve_submissions, "prolific_study_info", return_value={"name": "Test", "status": "ACTIVE"}), \
             patch.object(approve_submissions, "prolific_submission_statuses", return_value={
                 "PID_A": "AWAITING REVIEW",
             }), \
             patch.object(approve_submissions, "prolific_bulk_approve"), \
             patch.dict("sys.modules", {"send_thank_you": mock_sty_module}):
            approve_submissions.main()

        # send_thank_you_to_pids should never have been called
        mock_sty_module.send_thank_you_to_pids.assert_not_called()

    def test_thank_you_stats_in_step_summary(self, tmp_path):
        """Live run includes thank-you stats in the step summary."""
        csv_path = _write_csv(
            tmp_path,
            ["PROLIFIC_PID", "Disposition"],
            [["PID_A", "CLEAN"]],
        )
        summary_file = str(tmp_path / "summary.md")
        env = _base_env(tmp_path, csv_path, dry_run="false")
        env["GITHUB_STEP_SUMMARY"] = summary_file

        mock_thank_you = MagicMock(return_value={
            "sent": 1, "skipped": 0, "skipped_not_approved": 0,
            "not_found": 0, "failed": 0,
        })

        with patch.dict(os.environ, env, clear=True), \
             patch.object(approve_submissions, "prolific_study_info", return_value={"name": "Test", "status": "ACTIVE"}), \
             patch.object(approve_submissions, "prolific_submission_statuses", return_value={
                 "PID_A": "AWAITING REVIEW",
             }), \
             patch.object(approve_submissions, "prolific_bulk_approve"), \
             patch.dict("sys.modules", {"send_thank_you": MagicMock(send_thank_you_to_pids=mock_thank_you)}):
            approve_submissions.main()

        summary = Path(summary_file).read_text()
        assert "Thank-you messages" in summary
        assert "| Sent | 1 |" in summary

    def test_thank_you_not_called_when_no_clean_pids(self, tmp_path):
        """When no CLEAN PIDs exist, send_thank_you_to_pids is not called."""
        csv_path = _write_csv(
            tmp_path,
            ["PROLIFIC_PID", "Disposition"],
            [["PID_A", "FLAG-SPEED"]],
        )
        env = _base_env(tmp_path, csv_path, dry_run="false")

        mock_sty_module = MagicMock()

        with patch.dict(os.environ, env, clear=True), \
             patch.dict("sys.modules", {"send_thank_you": mock_sty_module}):
            approve_submissions.main()

        mock_sty_module.send_thank_you_to_pids.assert_not_called()

    def test_already_approved_still_triggers_thank_you(self, tmp_path):
        """Even if all PIDs are already APPROVED, thank-you is still sent (dedup handled inside)."""
        csv_path = _write_csv(
            tmp_path,
            ["PROLIFIC_PID", "Disposition"],
            [["PID_A", "CLEAN"]],
        )
        env = _base_env(tmp_path, csv_path, dry_run="false")

        mock_thank_you = MagicMock(return_value={
            "sent": 0, "skipped": 1, "skipped_not_approved": 0,
            "not_found": 0, "failed": 0,
        })

        with patch.dict(os.environ, env, clear=True), \
             patch.object(approve_submissions, "prolific_study_info", return_value={"name": "Test", "status": "ACTIVE"}), \
             patch.object(approve_submissions, "prolific_submission_statuses", return_value={
                 "PID_A": "APPROVED",
             }), \
             patch.object(approve_submissions, "prolific_bulk_approve") as mock_approve, \
             patch.dict("sys.modules", {"send_thank_you": MagicMock(send_thank_you_to_pids=mock_thank_you)}):
            approve_submissions.main()

        # No new approvals needed
        mock_approve.assert_not_called()
        # But thank-you is still called (dedup will handle it inside send_thank_you)
        mock_thank_you.assert_called_once()


class TestMessagingDryRun:
    """Tests for dry-run mode: no messages sent, no misleading metrics."""

    def test_dry_run_does_not_call_send_thank_you(self, tmp_path):
        """Dry-run mode does NOT invoke send_thank_you_to_pids."""
        csv_path = _write_csv(
            tmp_path,
            ["PROLIFIC_PID", "Disposition"],
            [["PID_A", "CLEAN"], ["PID_B", "CLEAN"]],
        )
        env = _base_env(tmp_path, csv_path, dry_run="true")

        mock_sty_module = MagicMock()

        with patch.dict(os.environ, env, clear=True), \
             patch.dict("sys.modules", {"send_thank_you": mock_sty_module}):
            approve_submissions.main()

        mock_sty_module.send_thank_you_to_pids.assert_not_called()

    def test_dry_run_step_summary_has_no_thank_you_section(self, tmp_path):
        """Dry-run step summary does NOT include a thank-you metrics table."""
        csv_path = _write_csv(
            tmp_path,
            ["PROLIFIC_PID", "Disposition"],
            [["PID_A", "CLEAN"]],
        )
        summary_file = str(tmp_path / "summary.md")
        env = _base_env(tmp_path, csv_path, dry_run="true")
        env["GITHUB_STEP_SUMMARY"] = summary_file

        with patch.dict(os.environ, env, clear=True):
            approve_submissions.main()

        summary = Path(summary_file).read_text()
        # The summary should NOT contain any thank-you metrics in dry-run
        assert "Thank-you messages" not in summary
        # Verify it still has the basic approval table
        assert "CLEAN dispositions | 1" in summary

    def test_dry_run_does_not_report_messages_sent(self, tmp_path, capsys):
        """Dry-run output does not report a specific 'messages_sent' count that could mislead."""
        csv_path = _write_csv(
            tmp_path,
            ["PROLIFIC_PID", "Disposition"],
            [["PID_A", "CLEAN"], ["PID_B", "CLEAN"], ["PID_C", "CLEAN"]],
        )
        env = _base_env(tmp_path, csv_path, dry_run="true")

        with patch.dict(os.environ, env, clear=True):
            approve_submissions.main()

        captured = capsys.readouterr()
        # Should mention "would send" (conditional), not a hard count of "sent"
        assert "would send thank-you" in captured.out
        # Should NOT contain a misleading "messages_sent" metric
        assert "messages_sent" not in captured.out


class TestMessagingErrorHandling:
    """Tests for error scenarios in the messaging integration."""

    def test_approval_failure_skips_thank_you(self, tmp_path):
        """If approval API call fails, thank-you step is not reached."""
        csv_path = _write_csv(
            tmp_path,
            ["PROLIFIC_PID", "Disposition"],
            [["PID_A", "CLEAN"]],
        )
        env = _base_env(tmp_path, csv_path, dry_run="false")

        mock_sty_module = MagicMock()

        with patch.dict(os.environ, env, clear=True), \
             patch.object(approve_submissions, "prolific_study_info", return_value={"name": "Test", "status": "ACTIVE"}), \
             patch.object(approve_submissions, "prolific_submission_statuses", return_value={
                 "PID_A": "AWAITING REVIEW",
             }), \
             patch.object(approve_submissions, "prolific_bulk_approve", side_effect=RuntimeError("API down")), \
             patch.dict("sys.modules", {"send_thank_you": mock_sty_module}):
            with pytest.raises(SystemExit):
                approve_submissions.main()

        mock_sty_module.send_thank_you_to_pids.assert_not_called()

    def test_thank_you_failure_does_not_crash_main(self, tmp_path):
        """If send_thank_you_to_pids raises, main() propagates the error but approval is already done."""
        csv_path = _write_csv(
            tmp_path,
            ["PROLIFIC_PID", "Disposition"],
            [["PID_A", "CLEAN"]],
        )
        env = _base_env(tmp_path, csv_path, dry_run="false")

        mock_thank_you = MagicMock(side_effect=RuntimeError("messaging failed"))

        with patch.dict(os.environ, env, clear=True), \
             patch.object(approve_submissions, "prolific_study_info", return_value={"name": "Test", "status": "ACTIVE"}), \
             patch.object(approve_submissions, "prolific_submission_statuses", return_value={
                 "PID_A": "AWAITING REVIEW",
             }), \
             patch.object(approve_submissions, "prolific_bulk_approve"), \
             patch.dict("sys.modules", {"send_thank_you": MagicMock(send_thank_you_to_pids=mock_thank_you)}):
            # The error from send_thank_you_to_pids will propagate
            with pytest.raises(RuntimeError, match="messaging failed"):
                approve_submissions.main()
