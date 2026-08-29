"""Tests for the software-citations audit and Zotero push scripts."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

# Make scripts importable
SCRIPTS_DIR = Path(__file__).parent.parent.parent.parent  # repo root / scripts
ANALYSIS_DIR = Path(__file__).parent.parent
REPO_ROOT = ANALYSIS_DIR.parent.parent

sys.path.insert(0, str(REPO_ROOT / "scripts"))
sys.path.insert(0, str(ANALYSIS_DIR))


# ---------------------------------------------------------------------------
# Import the modules under test
# ---------------------------------------------------------------------------

import importlib.util


def _load_module(path: Path, name: str):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


AUDIT_SCRIPT = REPO_ROOT / "scripts" / "audit-software-citations.py"
ZOTERO_SCRIPT = ANALYSIS_DIR / "zotero_software_citations.py"

audit_mod = _load_module(AUDIT_SCRIPT, "audit_software_citations")
zotero_mod = _load_module(ZOTERO_SCRIPT, "zotero_software_citations")


# ---------------------------------------------------------------------------
# Shared fixtures
# ---------------------------------------------------------------------------

MINIMAL_CATALOG = {
    "meta": {"description": "Test catalog"},
    "entries": [
        {
            "id": "nextjs",
            "name": "Next.js",
            "ecosystem": "npm",
            "package_name": "next",
            "version_cited": "16.2.1",
            "license": "MIT",
            "url": "https://nextjs.org",
            "repository": "https://github.com/vercel/next.js",
            "authors": ["Vercel, Inc."],
            "description": "React framework.",
            "zotero_item_type": "computerProgram",
            "cite_key": "nextjs",
        },
        {
            "id": "pandas",
            "name": "pandas",
            "ecosystem": "pip",
            "package_name": "pandas",
            "version_cited": "2.3.3",
            "license": "BSD-3-Clause",
            "url": "https://pandas.pydata.org",
            "repository": "https://github.com/pandas-dev/pandas",
            "authors": ["The Pandas Development Team"],
            "description": "Data analysis.",
            "zotero_item_type": "computerProgram",
            "cite_key": "pandas",
        },
    ],
    "key_packages": {
        "npm": ["next", "tailwindcss"],
        "pip": ["pandas", "scipy"],
    },
}

MINIMAL_PKG_JSON = {
    "dependencies": {"next": "^16.2.1"},
    "devDependencies": {"tailwindcss": "^4.1.12"},
}


# ---------------------------------------------------------------------------
# audit-software-citations.py tests
# ---------------------------------------------------------------------------


class TestNormalisePip:
    def test_lowercase(self):
        assert audit_mod._normalise_pip("Pandas") == "pandas"

    def test_hyphens_replace_underscores(self):
        assert audit_mod._normalise_pip("scikit_learn") == "scikit-learn"

    def test_dots_replaced(self):
        assert audit_mod._normalise_pip("some.package") == "some-package"

    def test_multiple_separators(self):
        assert audit_mod._normalise_pip("My--Pkg__2") == "my-pkg-2"


class TestNormaliseNpm:
    def test_scoped_package_lowercase(self):
        assert audit_mod._normalise_npm("@Playwright/test") == "@playwright/test"

    def test_simple_package(self):
        assert audit_mod._normalise_npm("Next") == "next"


class TestParseRequirements:
    def test_parses_pinned_versions(self, tmp_path):
        req = tmp_path / "requirements.txt"
        req.write_text(
            "pandas==2.3.3\n"
            "numpy==2.2.6\n"
            "# comment\n"
            "\n"
            "scipy>=1.0\n"
            "-r other.txt\n",
            encoding="utf-8",
        )
        result = audit_mod._parse_requirements(req)
        assert "pandas" in result
        assert "numpy" in result
        assert "scipy" in result
        assert len(result) == 3  # comment and -r line excluded

    def test_extras_stripped(self, tmp_path):
        req = tmp_path / "requirements.txt"
        req.write_text("package[extra]==1.0\n", encoding="utf-8")
        result = audit_mod._parse_requirements(req)
        assert result == ["package"]

    def test_missing_file_returns_empty(self, tmp_path):
        result = audit_mod._parse_requirements(tmp_path / "nonexistent.txt")
        assert result == []


class TestBuildCatalogIndex:
    def test_npm_entries_indexed(self):
        entries, key_npm, key_pip = audit_mod.build_catalog_index(MINIMAL_CATALOG)
        assert ("npm", "next") in entries

    def test_pip_entries_indexed(self):
        entries, key_npm, key_pip = audit_mod.build_catalog_index(MINIMAL_CATALOG)
        assert ("pip", "pandas") in entries

    def test_key_packages_loaded(self):
        entries, key_npm, key_pip = audit_mod.build_catalog_index(MINIMAL_CATALOG)
        assert "next" in key_npm
        assert "tailwindcss" in key_npm
        assert "pandas" in key_pip
        assert "scipy" in key_pip


class TestAudit:
    def test_all_cited_exits_zero(self, tmp_path):
        catalog_file = tmp_path / "catalog.json"
        catalog_file.write_text(json.dumps(MINIMAL_CATALOG), encoding="utf-8")

        pkg_file = tmp_path / "package.json"
        pkg_file.write_text(
            json.dumps({"dependencies": {"next": "^16"}, "devDependencies": {}}),
            encoding="utf-8",
        )

        req_file = tmp_path / "requirements.txt"
        req_file.write_text("pandas==2.3.3\n", encoding="utf-8")

        code = audit_mod.audit(
            catalog_path=catalog_file,
            pkg_path=pkg_file,
            req_path=req_file,
            skip_dev=False,
            strict=False,
        )
        assert code == 0

    def test_missing_key_package_exits_one(self, tmp_path):
        catalog_file = tmp_path / "catalog.json"
        catalog_file.write_text(json.dumps(MINIMAL_CATALOG), encoding="utf-8")

        # tailwindcss is a key_package but not in catalog entries
        pkg_file = tmp_path / "package.json"
        pkg_file.write_text(
            json.dumps({"dependencies": {"tailwindcss": "^4"}, "devDependencies": {}}),
            encoding="utf-8",
        )

        req_file = tmp_path / "requirements.txt"
        req_file.write_text("", encoding="utf-8")

        code = audit_mod.audit(
            catalog_path=catalog_file,
            pkg_path=pkg_file,
            req_path=req_file,
            skip_dev=False,
            strict=False,
        )
        assert code == 1

    def test_uncited_non_key_strict_exits_one(self, tmp_path):
        catalog_file = tmp_path / "catalog.json"
        catalog_file.write_text(json.dumps(MINIMAL_CATALOG), encoding="utf-8")

        pkg_file = tmp_path / "package.json"
        pkg_file.write_text(
            # next is cited; "some-new-pkg" is not a key package but --strict should fail
            json.dumps(
                {"dependencies": {"next": "^16", "some-new-pkg": "^1"}, "devDependencies": {}}
            ),
            encoding="utf-8",
        )

        req_file = tmp_path / "requirements.txt"
        req_file.write_text("pandas==2.0\n", encoding="utf-8")

        code = audit_mod.audit(
            catalog_path=catalog_file,
            pkg_path=pkg_file,
            req_path=req_file,
            skip_dev=False,
            strict=True,
        )
        assert code == 1

    def test_uncited_non_key_non_strict_exits_zero(self, tmp_path):
        catalog_file = tmp_path / "catalog.json"
        catalog_file.write_text(json.dumps(MINIMAL_CATALOG), encoding="utf-8")

        pkg_file = tmp_path / "package.json"
        pkg_file.write_text(
            json.dumps({"dependencies": {"next": "^16", "some-unlisted": "^1"}, "devDependencies": {}}),
            encoding="utf-8",
        )

        req_file = tmp_path / "requirements.txt"
        req_file.write_text("pandas==2.0\n", encoding="utf-8")

        code = audit_mod.audit(
            catalog_path=catalog_file,
            pkg_path=pkg_file,
            req_path=req_file,
            skip_dev=False,
            strict=False,
        )
        assert code == 0

    def test_skip_dev_excludes_dev_deps(self, tmp_path):
        catalog_file = tmp_path / "catalog.json"
        # tailwindcss is key_package; NOT in entries (would fail if checked)
        catalog_file.write_text(json.dumps(MINIMAL_CATALOG), encoding="utf-8")

        pkg_file = tmp_path / "package.json"
        pkg_file.write_text(
            json.dumps(
                {
                    "dependencies": {"next": "^16"},
                    "devDependencies": {"tailwindcss": "^4"},
                }
            ),
            encoding="utf-8",
        )

        req_file = tmp_path / "requirements.txt"
        req_file.write_text("pandas==2.0\n", encoding="utf-8")

        code = audit_mod.audit(
            catalog_path=catalog_file,
            pkg_path=pkg_file,
            req_path=req_file,
            skip_dev=True,  # skip tailwindcss
            strict=False,
        )
        # tailwindcss skipped, no key package missing
        assert code == 0

    def test_missing_catalog_exits_two(self, tmp_path):
        with pytest.raises(SystemExit) as exc_info:
            audit_mod.audit(
                catalog_path=tmp_path / "nonexistent.json",
                pkg_path=tmp_path / "package.json",
                req_path=tmp_path / "requirements.txt",
                skip_dev=False,
                strict=False,
            )
        assert exc_info.value.code == 2


# ---------------------------------------------------------------------------
# Real catalog + real package.json smoke test
# ---------------------------------------------------------------------------


class TestRealCatalogAudit:
    """Verify that the real catalog covers all key packages declared in key_packages."""

    def test_key_packages_are_in_catalog(self):
        catalog = json.loads(
            (REPO_ROOT / "src" / "data" / "software-citations.json").read_text()
        )
        entries_by_pkg, key_npm, key_pip = audit_mod.build_catalog_index(catalog)

        missing_npm = [p for p in key_npm if ("npm", p) not in entries_by_pkg]
        missing_pip = [p for p in key_pip if ("pip", p) not in entries_by_pkg]

        assert missing_npm == [], f"Key npm packages not in catalog: {missing_npm}"
        assert missing_pip == [], f"Key pip packages not in catalog: {missing_pip}"

    def test_catalog_entries_have_required_fields(self):
        catalog = json.loads(
            (REPO_ROOT / "src" / "data" / "software-citations.json").read_text()
        )
        required_fields = ["id", "name", "ecosystem", "package_name", "license", "url"]
        for entry in catalog.get("entries", []):
            for field in required_fields:
                assert field in entry, (
                    f"Entry '{entry.get('id', '?')}' is missing field '{field}'"
                )

    def test_real_audit_exits_zero(self):
        """Real package.json + requirements.txt should pass the non-strict audit."""
        pkg_path = REPO_ROOT / "package.json"
        req_path = REPO_ROOT / "scripts" / "analysis" / "requirements.txt"
        catalog_path = REPO_ROOT / "src" / "data" / "software-citations.json"

        if not pkg_path.exists() or not catalog_path.exists():
            pytest.skip("Real files not found")

        code = audit_mod.audit(
            catalog_path=catalog_path,
            pkg_path=pkg_path,
            req_path=req_path,
            skip_dev=False,
            strict=False,
        )
        assert code == 0, "Real audit should pass (no key packages uncited)"


# ---------------------------------------------------------------------------
# zotero_software_citations.py tests
# ---------------------------------------------------------------------------


class TestEntryToZoteroItem:
    def test_basic_structure(self):
        entry = MINIMAL_CATALOG["entries"][0]  # Next.js
        item = zotero_mod._entry_to_zotero_item(entry, "COLL_KEY")
        assert item["itemType"] == "computerProgram"
        assert item["title"] == "Next.js"
        assert item["version"] == "16.2.1"
        assert item["rights"] == "MIT"
        assert "COLL_KEY" in item["collections"]

    def test_creators_are_programmers(self):
        entry = MINIMAL_CATALOG["entries"][0]
        item = zotero_mod._entry_to_zotero_item(entry, "X")
        assert any(c["creatorType"] == "programmer" for c in item["creators"])

    def test_tags_include_ecosystem_and_license(self):
        entry = MINIMAL_CATALOG["entries"][0]
        item = zotero_mod._entry_to_zotero_item(entry, "X")
        tag_names = [t["tag"] for t in item["tags"]]
        assert "npm" in tag_names
        assert "license:MIT" in tag_names
        assert "software-dependency" in tag_names

    def test_extra_contains_package_info(self):
        entry = MINIMAL_CATALOG["entries"][1]  # pandas
        item = zotero_mod._entry_to_zotero_item(entry, "X")
        assert "pandas" in item["extra"]
        assert "pip" in item["extra"]
        assert "BSD-3-Clause" in item["extra"]


class TestDryRun:
    def test_dry_run_returns_zero(self):
        result = zotero_mod.push_to_zotero(
            catalog=MINIMAL_CATALOG,
            api_key="",
            library_id="",
            library_type="user",
            skip_existing=False,
            dry_run=True,
        )
        assert result == 0


class TestNormaliseHelpers:
    def test_library_prefix_user(self):
        prefix = zotero_mod._library_prefix("12345", "user")
        assert "users/12345" in prefix

    def test_library_prefix_group(self):
        prefix = zotero_mod._library_prefix("99999", "group")
        assert "groups/99999" in prefix
