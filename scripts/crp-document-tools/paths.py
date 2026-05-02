"""Portable workspace + data file discovery for crp-document-tools.

Originally each script under builders/, validators/, and convergence/ had its
own hardcoded glob like '/sessions/*/mnt/! Clarke Moyer Smeal CRP - TABS'.
Those paths are specific to one Claude.ai session and break for anyone else
running these scripts (including the original author on a different
machine, in CI, or after the source session ends).

This module centralises the discovery in one well-documented place so the
toolchain can be reproduced from a fresh git clone. Discovery order, from
highest to lowest precedence:

  1. Explicit CLI flag (--workspace, --csv, --docx, etc) - the caller
     passed the path directly. Always wins.
  2. CRP_WORKSPACE environment variable - single source of truth for
     researchers who want to point all the scripts at the same root.
  3. Common user locations: ~/Documents/CRP-workspace, ~/CRP-workspace.
     Cross-platform via os.path.expanduser, so works on Windows/macOS/Linux.
  4. Repo-relative fixture: <repo>/scripts/crp-document-tools/fixtures/
     example_workspace, used by CI and the Quickstart-for-Researchers tour.
  5. Legacy glob patterns: /sessions/*/mnt/... and /tmp/tabs-crp-workspace.
     Kept so the original author's existing automation keeps working
     without changes.

If everything fails, helpers raise CrpWorkspaceNotFound with a message
that points the user at the Quickstart README. They never silently
return None - that turns "missing workspace" into a deferred crash
deep in the calling script, which is exactly the failure mode the
reproducibility goal is trying to eliminate.
"""

from __future__ import annotations

import glob as _glob
import os
import re
from typing import Iterable, Optional


SUBTREE_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(os.path.dirname(SUBTREE_DIR))
FIXTURE_DIR = os.path.join(SUBTREE_DIR, "fixtures", "example_workspace")

# Subdirectories the scripts expect inside a workspace. Kept here so the
# Quickstart README and any future fixture builder share one source of truth.
WORKSPACE_LAYOUT = {
    "body_dir": "01 CRP Body",
    "appendix_dir": "02 CRP Appendixes",
    "survey_data_dir": os.path.join("05 TABS Survey Support", "TABS Survey Data"),
}


class CrpWorkspaceNotFound(FileNotFoundError):
    """Raised when no CRP workspace can be located via any discovery path."""


def _user_locations() -> Iterable[str]:
    home = os.path.expanduser("~")
    yield os.path.join(home, "Documents", "CRP-workspace")
    yield os.path.join(home, "CRP-workspace")


def _legacy_glob_locations() -> Iterable[str]:
    # Preserve the original author's auto-discovery so existing workflows
    # keep working unchanged. POSIX-only paths; harmless on Windows since
    # they will simply not match anything.
    patterns = [
        "/sessions/*/mnt/! Clarke Moyer Smeal CRP - TABS",
        "/sessions/*/mnt/*Clarke*CRP*TABS*",
        "/tmp/tabs-crp-workspace",
    ]
    for pattern in patterns:
        for match in sorted(_glob.glob(pattern)):
            yield match


def find_workspace(explicit: Optional[str] = None) -> str:
    """Locate the CRP workspace root.

    Args:
        explicit: A path passed via CLI flag. If provided and exists, returned
            unchanged. If provided but missing, raises CrpWorkspaceNotFound -
            an explicit override that does not exist is always an error, never
            a silent fallback.

    Returns:
        Absolute path to the workspace root.

    Raises:
        CrpWorkspaceNotFound: when no candidate directory exists.
    """
    if explicit:
        if os.path.isdir(explicit):
            return os.path.abspath(explicit)
        raise CrpWorkspaceNotFound(
            f"--workspace path does not exist: {explicit}"
        )

    env = os.environ.get("CRP_WORKSPACE")
    if env:
        if os.path.isdir(env):
            return os.path.abspath(env)
        raise CrpWorkspaceNotFound(
            f"CRP_WORKSPACE points to a missing directory: {env}"
        )

    for candidate in _user_locations():
        if os.path.isdir(candidate):
            return candidate

    if os.path.isdir(FIXTURE_DIR):
        return FIXTURE_DIR

    for candidate in _legacy_glob_locations():
        if os.path.isdir(candidate):
            return candidate

    raise CrpWorkspaceNotFound(
        "No CRP workspace found. Set CRP_WORKSPACE, pass --workspace, or "
        "see scripts/crp-document-tools/README.md (Quickstart for Researchers)."
    )


def find_body_docx(workspace: Optional[str] = None) -> str:
    """Locate the latest CRP body .docx inside the workspace's body dir."""
    workspace = workspace or find_workspace()
    body_dir = os.path.join(workspace, WORKSPACE_LAYOUT["body_dir"])
    if not os.path.isdir(body_dir):
        raise CrpWorkspaceNotFound(
            f"Workspace is missing body dir: {body_dir}"
        )

    candidates = [
        os.path.join(body_dir, f)
        for f in os.listdir(body_dir)
        if f.endswith(".docx") and not f.startswith("~")
    ]
    if not candidates:
        raise CrpWorkspaceNotFound(f"No .docx found in {body_dir}")
    return max(candidates, key=lambda p: (parse_filename_date(p), os.path.getmtime(p)))


def find_appendix_dir(workspace: Optional[str] = None) -> str:
    """Locate the appendix markdown directory."""
    workspace = workspace or find_workspace()
    appendix_dir = os.path.join(workspace, WORKSPACE_LAYOUT["appendix_dir"])
    if not os.path.isdir(appendix_dir):
        raise CrpWorkspaceNotFound(
            f"Workspace is missing appendix dir: {appendix_dir}"
        )
    return appendix_dir


def find_survey_csv(workspace: Optional[str] = None, pattern: str = "*Enriched_CRP200*.csv") -> str:
    """Locate the latest survey CSV in the workspace's survey-data directory."""
    workspace = workspace or find_workspace()
    survey_dir = os.path.join(workspace, WORKSPACE_LAYOUT["survey_data_dir"])
    if not os.path.isdir(survey_dir):
        raise CrpWorkspaceNotFound(
            f"Workspace is missing survey-data dir: {survey_dir}"
        )

    matches = _glob.glob(os.path.join(survey_dir, pattern))
    if not matches:
        raise CrpWorkspaceNotFound(
            f"No survey CSV matching {pattern} in {survey_dir}"
        )
    # Newest by mtime - the survey CSV is exported fresh on each run, so
    # mtime is more reliable than the filename embedded date.
    return max(matches, key=os.path.getmtime)


_FILENAME_DATE_RE = re.compile(r"\((\d{1,2})-(\d{1,2})-(\d{4})\s+(\d{4})\s+[A-Z]{2,4}\)")


def parse_filename_date(filename: str) -> tuple:
    """Parse a (M-D-YYYY HHMM TZ) timestamp embedded in a filename.

    Returns a (year, month, day, hhmm) tuple suitable for max-sorting.
    The timezone token is intentionally permissive (2-4 uppercase letters)
    so the regex matches both EST and EDT, plus any other 3-letter zone a
    future contributor might use (CST, MST, PST, UTC, etc).

    Returns (0, 0, 0, 0) on failure so callers can detect the no-timestamp
    case and fall back to file mtime.
    """
    m = _FILENAME_DATE_RE.search(os.path.basename(filename))
    if not m:
        return (0, 0, 0, 0)
    month, day, year, hhmm = (int(m.group(i)) for i in (1, 2, 3, 4))
    return (year, month, day, hhmm)
