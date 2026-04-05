"""Tests for check_pid_write.py (PreToolUse hook) and validate_data_schemas.py."""

import json
import sys
from io import StringIO
from pathlib import Path
from unittest.mock import patch

import pytest

# Make scripts/ importable from anywhere pytest is run from.
_SCRIPTS_DIR = Path(__file__).parent.parent.parent
sys.path.insert(0, str(_SCRIPTS_DIR))

from scripts.check_pid_write import _is_protected_path, _scan_for_pids, main as hook_main
from scripts.validate_data_schemas import main as validate_main, _scan_for_pids as vs_scan


# ---------------------------------------------------------------------------
# check_pid_write — unit tests
# ---------------------------------------------------------------------------


class TestIsProtectedPath:
    def test_src_data_json(self):
        assert _is_protected_path("src/data/disposition-summary.json")

    def test_src_data_with_dot_slash(self):
        assert _is_protected_path("./src/data/foo.json")

    def test_outside_src_data(self):
        assert not _is_protected_path("scripts/something.py")

    def test_other_src_dir(self):
        assert not _is_protected_path("src/components/header/index.tsx")


class TestScanForPids:
    def test_no_pids(self):
        assert _scan_for_pids('{"updatedAt": "2026-01-01", "studyId": "69c17630acada6abeead2da5"}') == []

    def test_prolific_pid_header(self):
        hits = _scan_for_pids("PROLIFIC_PID,ResponseId,answer")
        assert any("PROLIFIC_PID" in h for h in hits)

    def test_prolific_pid_lowercase(self):
        hits = _scan_for_pids('{"prolific_pid": "abc"}')
        assert any("prolific_pid" in h for h in hits)

    def test_single_hex24_allowed(self):
        # A single 24-char hex string (study ID) must NOT be flagged.
        assert _scan_for_pids('"69c17630acada6abeead2da5"') == []

    def test_three_hex24_blocked(self):
        # Three PIDs in sequence → flagged.
        content = json.dumps(
            [
                "5f4dcc3b5aa765d61d8327de",
                "69c17630acada6abeead2da5",
                "6a4dcc3b5aa765d61d83feed",
            ]
        )
        hits = _scan_for_pids(content)
        assert hits, "Expected PID array to be flagged"


class TestHookMain:
    def _run(self, payload: dict) -> int:
        stdin_data = json.dumps(payload)
        with patch("sys.stdin", StringIO(stdin_data)):
            return hook_main()

    def test_safe_write_passes(self):
        payload = {
            "tool_name": "Write",
            "tool_input": {
                "path": "src/data/disposition-summary.json",
                "content": '{"studyId": "69c17630acada6abeead2da5"}',
            },
        }
        assert self._run(payload) == 0

    def test_pid_header_in_src_data_blocked(self):
        payload = {
            "tool_name": "Write",
            "tool_input": {
                "path": "src/data/oops.json",
                "content": '{"PROLIFIC_PID": "abc123"}',
            },
        }
        assert self._run(payload) == 2

    def test_pid_in_other_path_allowed(self):
        payload = {
            "tool_name": "Write",
            "tool_input": {
                "path": "scripts/collect_data.py",
                "content": "PROLIFIC_PID = 'abc123'",
            },
        }
        assert self._run(payload) == 0

    def test_invalid_json_stdin_allows(self):
        with patch("sys.stdin", StringIO("not-json")):
            assert hook_main() == 0

    def test_edit_tool_checked(self):
        payload = {
            "tool_name": "Edit",
            "tool_input": {
                "path": "src/data/foo.json",
                "new_string": '{"prolific_pid": "abc"}',
                "old_string": "{}",
            },
        }
        assert self._run(payload) == 2


# ---------------------------------------------------------------------------
# validate_data_schemas — integration-style tests against real data files
# ---------------------------------------------------------------------------


class TestValidateDataSchemas:
    def test_current_data_files_pass(self):
        """The committed src/data files must always pass schema validation."""
        rc = validate_main([])
        assert rc == 0, "Schema validation failed on committed data files"

    def test_invalid_json_fails(self, tmp_path, monkeypatch):
        """A non-parseable JSON file must cause exit 1."""
        bad_file = tmp_path / "disposition-summary.json"
        bad_file.write_text("{ not valid json }", encoding="utf-8")

        schema_path = (
            _SCRIPTS_DIR.parent
            / ".github"
            / "schemas"
            / "disposition-summary.schema.json"
        )

        import scripts.validate_data_schemas as vds

        orig_targets = vds._VALIDATION_TARGETS
        monkeypatch.setattr(
            vds,
            "_VALIDATION_TARGETS",
            [(bad_file, schema_path)],
        )
        try:
            rc = validate_main([])
        finally:
            monkeypatch.setattr(vds, "_VALIDATION_TARGETS", orig_targets)

        assert rc == 1

    def test_missing_required_field_fails(self, tmp_path, monkeypatch):
        """A JSON file missing required fields must cause exit 1."""
        bad_file = tmp_path / "disposition-summary.json"
        bad_file.write_text('{"updatedAt": "2026-01-01"}', encoding="utf-8")

        schema_path = (
            _SCRIPTS_DIR.parent
            / ".github"
            / "schemas"
            / "disposition-summary.schema.json"
        )

        import scripts.validate_data_schemas as vds

        orig_targets = vds._VALIDATION_TARGETS
        monkeypatch.setattr(
            vds,
            "_VALIDATION_TARGETS",
            [(bad_file, schema_path)],
        )
        try:
            rc = validate_main([])
        finally:
            monkeypatch.setattr(vds, "_VALIDATION_TARGETS", orig_targets)

        assert rc == 1

    def test_pid_in_data_file_fails(self, tmp_path, monkeypatch):
        """A data file containing PROLIFIC_PID must be rejected."""
        bad_file = tmp_path / "disposition-summary.json"
        bad_file.write_text(
            '{"PROLIFIC_PID": "abc", "updatedAt": "2026-01-01"}', encoding="utf-8"
        )

        schema_path = (
            _SCRIPTS_DIR.parent
            / ".github"
            / "schemas"
            / "disposition-summary.schema.json"
        )

        import scripts.validate_data_schemas as vds

        orig_targets = vds._VALIDATION_TARGETS
        monkeypatch.setattr(
            vds,
            "_VALIDATION_TARGETS",
            [(bad_file, schema_path)],
        )
        try:
            rc = validate_main([])
        finally:
            monkeypatch.setattr(vds, "_VALIDATION_TARGETS", orig_targets)

        assert rc == 1
