"""Unit tests for scripts/zotero/zotero_dedup.py.

All tests are fully offline — pyzotero is mocked at module level before import
so no real Zotero API calls are made.
"""

from __future__ import annotations

import json
import sys
import types
from pathlib import Path
from typing import Any
from unittest.mock import MagicMock, patch

import pytest

# ---------------------------------------------------------------------------
# Stub out pyzotero and rapidfuzz before importing the module under test so
# the tests run without those packages installed (CI may not have them).
# ---------------------------------------------------------------------------

# pyzotero stub
_pyzotero_mod = types.ModuleType("pyzotero")
_zotero_sub = types.ModuleType("pyzotero.zotero")


class _FakeZotero:  # noqa: D101
    def __init__(self, *a: Any, **kw: Any) -> None:  # noqa: D107
        pass


_zotero_sub.Zotero = _FakeZotero
_pyzotero_mod.zotero = _zotero_sub
sys.modules.setdefault("pyzotero", _pyzotero_mod)
sys.modules.setdefault("pyzotero.zotero", _zotero_sub)

# rapidfuzz stub (real implementation if available, else basic ratio)
if "rapidfuzz" not in sys.modules:
    _rf = types.ModuleType("rapidfuzz")
    _fuzz_sub = types.ModuleType("rapidfuzz.fuzz")

    def _token_sort_ratio(a: str, b: str) -> float:
        """Naive token-sort ratio for testing purposes."""
        ta = sorted(a.split())
        tb = sorted(b.split())
        sa, sb = " ".join(ta), " ".join(tb)
        if sa == sb:
            return 100.0
        # Levenshtein approximation: character overlap
        common = sum(c in sb for c in sa)
        return 100.0 * (2 * common) / max(1, len(sa) + len(sb))

    _fuzz_sub.token_sort_ratio = _token_sort_ratio
    _rf.fuzz = _fuzz_sub
    sys.modules.setdefault("rapidfuzz", _rf)
    sys.modules.setdefault("rapidfuzz.fuzz", _fuzz_sub)

import zotero_dedup as zd  # noqa: E402


# ---------------------------------------------------------------------------
# Factories
# ---------------------------------------------------------------------------


def _make_raw(
    key: str,
    title: str,
    doi: str = "",
    item_type: str = "journalArticle",
    year: str = "2020",
    abstract: str = "",
    num_authors: int = 1,
    pdf_key: str | None = None,
    note_keys: list[str] | None = None,
) -> dict[str, Any]:
    """Build a minimal raw Zotero item dict."""
    creators = [{"creatorType": "author", "lastName": f"Author{i}"} for i in range(num_authors)]
    raw: dict[str, Any] = {
        "key": key,
        "data": {
            "key": key,
            "itemType": item_type,
            "title": title,
            "DOI": doi,
            "date": year,
            "abstractNote": abstract,
            "creators": creators,
        },
        "_pdf_key": pdf_key,
        "_note_keys": note_keys if note_keys is not None else [],
    }
    return raw


def _item(
    key: str,
    title: str,
    doi: str = "",
    item_type: str = "journalArticle",
    year: str = "2020",
    abstract: str = "",
    num_authors: int = 1,
    pdf_key: str | None = None,
    note_keys: list[str] | None = None,
) -> zd.ZoteroItem:
    return zd.ZoteroItem(
        _make_raw(
            key=key,
            title=title,
            doi=doi,
            item_type=item_type,
            year=year,
            abstract=abstract,
            num_authors=num_authors,
            pdf_key=pdf_key,
            note_keys=note_keys,
        )
    )


# ---------------------------------------------------------------------------
# ZoteroItem tests
# ---------------------------------------------------------------------------


class TestZoteroItem:
    def test_key(self) -> None:
        it = _item("ABC123", "Test Title")
        assert it.key == "ABC123"

    def test_title_normalization(self) -> None:
        it = _item("K1", "  Hello   World  ")
        assert it.title_normalized == "hello world"

    def test_has_pdf_false(self) -> None:
        it = _item("K1", "Title", pdf_key=None)
        assert not it.has_pdf

    def test_has_pdf_true(self) -> None:
        it = _item("K1", "Title", pdf_key="ATTACH1")
        assert it.has_pdf
        assert it.pdf_key == "ATTACH1"

    def test_has_notes_false(self) -> None:
        it = _item("K1", "Title", note_keys=[])
        assert not it.has_notes

    def test_has_notes_true(self) -> None:
        it = _item("K1", "Title", note_keys=["N1", "N2"])
        assert it.has_notes
        assert it.note_keys == ["N1", "N2"]

    def test_doi(self) -> None:
        it = _item("K1", "Title", doi="10.1000/xyz")
        assert it.doi == "10.1000/xyz"

    def test_completeness_score_full(self) -> None:
        it = _item(
            "K1",
            "Title",
            doi="10.1000/xyz",
            pdf_key="P1",
            note_keys=["N1"],
            abstract="An abstract.",
            num_authors=2,
            year="2020",
        )
        # 4 (pdf) + 3 (notes) + 2 (doi) + 1 (author) + 1 (year) + 1 (abstract) = 12
        assert it.completeness_score == 12

    def test_completeness_score_empty(self) -> None:
        it = _item("K1", "Title", num_authors=0, year="")
        assert it.completeness_score == 0

    def test_completeness_score_doi_only(self) -> None:
        it = _item("K1", "Title", doi="10.1/x", num_authors=0, year="")
        assert it.completeness_score == 2

    def test_repr(self) -> None:
        it = _item("K1", "My Title")
        assert "K1" in repr(it)
        assert "My Title" in repr(it)


# ---------------------------------------------------------------------------
# detect_duplicates tests
# ---------------------------------------------------------------------------


class TestDetectDuplicates:
    def test_no_duplicates(self) -> None:
        items = [
            _item("A", "User Acceptance of Information Technology"),
            _item("B", "Organizational Commitment and Employee Turnover"),
            _item("C", "Transaction Cost Economics and Market Structure"),
        ]
        groups = zd.detect_duplicates(items)
        assert groups == []

    def test_exact_title_match(self) -> None:
        items = [
            _item("A", "User Acceptance of Information Technology", pdf_key="P1"),
            _item("B", "User Acceptance of Information Technology"),
        ]
        groups = zd.detect_duplicates(items)
        assert len(groups) == 1
        # Canonical should be A (has PDF → higher score)
        assert groups[0].canonical.key == "A"
        assert groups[0].duplicates[0].key == "B"

    def test_fuzzy_title_match(self) -> None:
        # Titles differ only by subtitle — should be grouped
        items = [
            _item("A", "Technology Acceptance Model: An Empirical Study", pdf_key="P1"),
            _item("B", "Technology Acceptance Model An Empirical Study"),
        ]
        groups = zd.detect_duplicates(items)
        assert len(groups) == 1

    def test_canonical_prefers_publisher_doi_over_jstor(self) -> None:
        items = [
            _item("A", "Same Title", doi="10.2307/41410412"),  # JSTOR DOI
            _item("B", "Same Title", doi="10.2308/real-doi", pdf_key="P1"),  # publisher DOI + PDF
        ]
        groups = zd.detect_duplicates(items)
        assert len(groups) == 1
        # B has more points (PDF=4, DOI=2, author=1, year=1 = 8) vs A (DOI=2, author=1, year=1 = 4)
        assert groups[0].canonical.key == "B"

    def test_canonical_selected_by_score(self) -> None:
        items = [
            _item("X", "Same Title", doi="10.1/x", pdf_key="P1", note_keys=["N1"]),
            _item("Y", "Same Title"),
            _item("Z", "Same Title", doi="10.1/x"),
        ]
        groups = zd.detect_duplicates(items)
        assert len(groups) == 1
        # X: pdf(4)+notes(3)+doi(2)+author(1)+year(1) = 11
        # Z: doi(2)+author(1)+year(1) = 4
        # Y: author(1)+year(1) = 2
        assert groups[0].canonical.key == "X"

    def test_empty_title_items_skipped(self) -> None:
        items = [
            _item("A", "Real Title"),
            _item("B", ""),  # no title — should be ignored
        ]
        groups = zd.detect_duplicates(items)
        assert groups == []

    def test_three_versions_one_group(self) -> None:
        items = [
            _item("A", "User Acceptance of Information Technology"),
            _item("B", "User Acceptance of Information Technology", pdf_key="P1"),
            _item("C", "User Acceptance of Information Technology", doi="10.1/x"),
        ]
        groups = zd.detect_duplicates(items)
        assert len(groups) == 1
        assert len(groups[0].all_items) == 3

    def test_distinct_titles_not_grouped(self) -> None:
        items = [
            _item("A", "Technology Adoption in Small Firms"),
            _item("B", "Organizational Learning and Knowledge Transfer"),
        ]
        groups = zd.detect_duplicates(items)
        assert groups == []


# ---------------------------------------------------------------------------
# DuplicateGroup tests
# ---------------------------------------------------------------------------


class TestDuplicateGroup:
    def _group(self) -> zd.DuplicateGroup:
        canon = _item("C", "Title", pdf_key="P1")
        dup1 = _item("D1", "Title")
        dup2 = _item("D2", "Title", note_keys=["N1"])
        return zd.DuplicateGroup(canonical=canon, duplicates=[dup1, dup2])

    def test_all_items(self) -> None:
        g = self._group()
        assert len(g.all_items) == 3
        assert g.all_items[0].key == "C"

    def test_any_has_pdf(self) -> None:
        g = self._group()
        assert g.any_has_pdf  # canonical has PDF

    def test_any_has_notes(self) -> None:
        g = self._group()
        assert g.any_has_notes  # dup2 has a note

    def test_no_pdf_group(self) -> None:
        g = zd.DuplicateGroup(
            canonical=_item("C", "Title"),
            duplicates=[_item("D", "Title")],
        )
        assert not g.any_has_pdf


# ---------------------------------------------------------------------------
# enrich_item tests
# ---------------------------------------------------------------------------


class TestEnrichItem:
    def test_copies_doi_dry_run(self) -> None:
        mock_zot = MagicMock()
        canonical = _item("C", "Title", doi="10.1000/real")
        sparse = _item("S", "Title", doi="")
        changes = zd.enrich_item(mock_zot, sparse, canonical, dry_run=True)
        assert changes["copied_doi"] is True
        mock_zot.update_item.assert_not_called()

    def test_copies_doi_live(self) -> None:
        mock_zot = MagicMock()
        canonical = _item("C", "Title", doi="10.1000/real")
        sparse = _item("S", "Title", doi="")
        zd.enrich_item(mock_zot, sparse, canonical, dry_run=False)
        mock_zot.update_item.assert_called_once()
        call_arg = mock_zot.update_item.call_args[0][0]
        assert call_arg["data"]["DOI"] == "10.1000/real"

    def test_no_change_when_doi_already_present(self) -> None:
        mock_zot = MagicMock()
        canonical = _item("C", "Title", doi="10.1000/real")
        sparse = _item("S", "Title", doi="10.1000/existing")
        changes = zd.enrich_item(mock_zot, sparse, canonical, dry_run=False)
        assert changes["copied_doi"] is False
        mock_zot.update_item.assert_not_called()

    def test_no_change_when_canonical_has_no_doi(self) -> None:
        mock_zot = MagicMock()
        canonical = _item("C", "Title", doi="")
        sparse = _item("S", "Title", doi="")
        changes = zd.enrich_item(mock_zot, sparse, canonical, dry_run=False)
        assert changes["copied_doi"] is False
        mock_zot.update_item.assert_not_called()


# ---------------------------------------------------------------------------
# clean_collection tests
# ---------------------------------------------------------------------------


class TestCleanCollection:
    def _make_mock_zot(
        self,
        col_name: str,
        col_key: str,
        col_item_keys: list[str],
    ) -> MagicMock:
        mock_zot = MagicMock()
        mock_zot.collections.return_value = [
            {"key": col_key, "data": {"name": col_name}}
        ]
        mock_zot.everything.return_value = [{"key": k} for k in col_item_keys]
        return mock_zot

    def test_removes_duplicate_from_collection_dry_run(self) -> None:
        mock_zot = self._make_mock_zot(
            "Website Citations", "COL1", ["C", "D"]
        )
        canonical = _item("C", "Title", pdf_key="P1")
        dup = _item("D", "Title")
        group = zd.DuplicateGroup(canonical=canonical, duplicates=[dup])

        summary = zd.clean_collection(
            mock_zot, [group], collection_name="Website Citations", dry_run=True
        )
        assert "D" in summary["removed"]
        mock_zot.remove_item_from_collection.assert_not_called()

    def test_removes_duplicate_from_collection_live(self) -> None:
        mock_zot = self._make_mock_zot(
            "Website Citations", "COL1", ["C", "D"]
        )
        canonical = _item("C", "Title", pdf_key="P1")
        dup = _item("D", "Title")
        group = zd.DuplicateGroup(canonical=canonical, duplicates=[dup])

        summary = zd.clean_collection(
            mock_zot, [group], collection_name="Website Citations", dry_run=False
        )
        assert "D" in summary["removed"]
        mock_zot.remove_item_from_collection.assert_called_once_with("D", "COL1")

    def test_adds_canonical_if_not_in_collection(self) -> None:
        # Collection only contains the duplicate, not the canonical
        mock_zot = self._make_mock_zot(
            "Website Citations", "COL1", ["D"]
        )
        canonical = _item("C", "Title", pdf_key="P1")
        dup = _item("D", "Title")
        group = zd.DuplicateGroup(canonical=canonical, duplicates=[dup])

        summary = zd.clean_collection(
            mock_zot, [group], collection_name="Website Citations", dry_run=False
        )
        assert "D" in summary["removed"]
        assert "C" in summary["added_canonical"]
        mock_zot.addto_collection.assert_called_once()

    def test_collection_not_found(self) -> None:
        mock_zot = MagicMock()
        mock_zot.collections.return_value = []
        summary = zd.clean_collection(
            mock_zot, [], collection_name="Nonexistent", dry_run=True
        )
        assert summary["collection_found"] is False

    def test_no_duplicates_in_collection(self) -> None:
        # Collection has canonical only — no action needed
        mock_zot = self._make_mock_zot(
            "Website Citations", "COL1", ["C"]
        )
        canonical = _item("C", "Title", pdf_key="P1")
        dup = _item("D", "Title")  # D is NOT in the collection
        group = zd.DuplicateGroup(canonical=canonical, duplicates=[dup])

        summary = zd.clean_collection(
            mock_zot, [group], collection_name="Website Citations", dry_run=False
        )
        assert summary["removed"] == []
        assert summary["added_canonical"] == []


# ---------------------------------------------------------------------------
# report_no_pdf tests
# ---------------------------------------------------------------------------


class TestReportNoPdf:
    def test_journal_without_pdf_flagged(self) -> None:
        items = [
            _item("A", "Journal Article Without PDF", item_type="journalArticle"),
        ]
        result = zd.report_no_pdf(items, collection_name="", zot=None)
        assert len(result) == 1
        assert result[0]["key"] == "A"
        assert result[0]["is_non_journal"] is False

    def test_book_without_pdf_flagged_as_non_journal(self) -> None:
        items = [
            _item("B", "A Book", item_type="book"),
        ]
        result = zd.report_no_pdf(items, collection_name="", zot=None)
        assert len(result) == 1
        assert result[0]["is_non_journal"] is True

    def test_item_with_pdf_not_included(self) -> None:
        items = [
            _item("C", "Article With PDF", pdf_key="P1"),
        ]
        result = zd.report_no_pdf(items, collection_name="", zot=None)
        assert result == []

    def test_mixed_items(self) -> None:
        items = [
            _item("A", "Article With PDF", pdf_key="P1", item_type="journalArticle"),
            _item("B", "Article No PDF", item_type="journalArticle"),
            _item("C", "Book No PDF", item_type="book"),
        ]
        result = zd.report_no_pdf(items, collection_name="", zot=None)
        keys = [r["key"] for r in result]
        assert "A" not in keys
        assert "B" in keys
        assert "C" in keys


# ---------------------------------------------------------------------------
# ci_check_duplicates tests
# ---------------------------------------------------------------------------


class TestCiCheckDuplicates:
    def _make_zot(self, col_key: str, col_item_keys: list[str]) -> MagicMock:
        mock_zot = MagicMock()
        mock_zot.collections.return_value = [
            {"key": col_key, "data": {"name": "Website Citations"}}
        ]
        mock_zot.everything.return_value = [{"key": k} for k in col_item_keys]
        return mock_zot

    def test_no_duplicates_in_collection(self) -> None:
        # Collection has one item per group — no CI failure
        mock_zot = self._make_zot("COL1", ["C"])
        groups = [
            zd.DuplicateGroup(
                canonical=_item("C", "Title"),
                duplicates=[_item("D", "Title")],
            )
        ]
        assert zd.ci_check_duplicates(groups, mock_zot) == 0

    def test_duplicates_in_collection_triggers_failure(self) -> None:
        # Collection has BOTH canonical and duplicate
        mock_zot = self._make_zot("COL1", ["C", "D"])
        groups = [
            zd.DuplicateGroup(
                canonical=_item("C", "Title"),
                duplicates=[_item("D", "Title")],
            )
        ]
        assert zd.ci_check_duplicates(groups, mock_zot) == 1

    def test_collection_not_found_returns_zero(self) -> None:
        mock_zot = MagicMock()
        mock_zot.collections.return_value = []
        assert zd.ci_check_duplicates([], mock_zot) == 0


# ---------------------------------------------------------------------------
# write_report tests
# ---------------------------------------------------------------------------


class TestWriteReport:
    def test_writes_valid_json(self, tmp_path: Path) -> None:
        output = tmp_path / "report.json"
        canon = _item("C", "Title", pdf_key="P1", doi="10.1/x")
        dup = _item("D", "Title")
        groups = [zd.DuplicateGroup(canonical=canon, duplicates=[dup])]

        zd.write_report(output, groups, [], {}, [])

        assert output.exists()
        data = json.loads(output.read_text())
        assert "duplicate_groups" in data
        assert len(data["duplicate_groups"]) == 1
        assert data["duplicate_groups"][0]["canonical"]["key"] == "C"
        assert data["duplicate_groups"][0]["duplicates"][0]["key"] == "D"

    def test_report_includes_enrichment_changes(self, tmp_path: Path) -> None:
        output = tmp_path / "report.json"
        changes = [{"key": "D", "copied_doi": True, "added_note": False}]
        zd.write_report(output, [], changes, {}, [])

        data = json.loads(output.read_text())
        assert data["enrichment_changes"] == changes

    def test_report_includes_no_pdf_items(self, tmp_path: Path) -> None:
        output = tmp_path / "report.json"
        no_pdf = [
            {
                "key": "A",
                "title": "Missing PDF",
                "item_type": "journalArticle",
                "doi": "",
                "year": "2020",
                "is_non_journal": False,
            }
        ]
        zd.write_report(output, [], [], {}, no_pdf)

        data = json.loads(output.read_text())
        assert data["no_pdf_items"] == no_pdf


# ---------------------------------------------------------------------------
# CLI / main() tests
# ---------------------------------------------------------------------------


class TestMain:
    def _make_zot_mock(self) -> MagicMock:
        mock_zot = MagicMock()
        # top() returns raw items
        mock_zot.top.return_value = []
        mock_zot.everything.return_value = []
        mock_zot.collections.return_value = []
        mock_zot.children.return_value = []
        return mock_zot

    def test_missing_library_id_returns_2(self) -> None:
        result = zd.main(["--api-key", "KEY"])
        assert result == 2

    def test_missing_api_key_returns_2(self) -> None:
        result = zd.main(["--library-id", "123"])
        assert result == 2

    def test_detect_only_no_api_writes(self, tmp_path: Path) -> None:
        output = str(tmp_path / "report.json")

        with patch("zotero_dedup._build_client") as mock_build, \
             patch("zotero_dedup._fetch_all_top_level_items") as mock_fetch, \
             patch("zotero_dedup._annotate_with_children") as mock_annotate:

            mock_zot = self._make_zot_mock()
            mock_build.return_value = mock_zot
            mock_fetch.return_value = []
            mock_annotate.return_value = []

            result = zd.main(
                [
                    "--library-id", "12345",
                    "--api-key", "TESTKEY",
                    "--detect-only",
                    "--output", output,
                ]
            )

        assert result == 0
        assert Path(output).exists()
        data = json.loads(Path(output).read_text())
        assert data["duplicate_groups"] == []

    def test_ci_check_passes_when_no_duplicates(self) -> None:
        with patch("zotero_dedup._build_client") as mock_build, \
             patch("zotero_dedup._fetch_all_top_level_items") as mock_fetch, \
             patch("zotero_dedup._annotate_with_children") as mock_annotate, \
             patch("zotero_dedup._find_collection") as mock_col:

            mock_zot = self._make_zot_mock()
            mock_build.return_value = mock_zot
            mock_fetch.return_value = []
            mock_annotate.return_value = []
            mock_col.return_value = None  # no collection found

            result = zd.main(
                [
                    "--library-id", "12345",
                    "--api-key", "TESTKEY",
                    "--ci-check",
                ]
            )
        assert result == 0

    def test_ci_check_fails_when_duplicates_in_collection(self) -> None:
        raw_c = _make_raw("C", "Same Title", pdf_key="P1")
        raw_d = _make_raw("D", "Same Title")

        with patch("zotero_dedup._build_client") as mock_build, \
             patch("zotero_dedup._fetch_all_top_level_items") as mock_fetch, \
             patch("zotero_dedup._annotate_with_children") as mock_ann, \
             patch("zotero_dedup._find_collection") as mock_col, \
             patch("zotero_dedup._fetch_collection_items") as mock_ci:

            mock_zot = self._make_zot_mock()
            mock_build.return_value = mock_zot
            mock_fetch.return_value = [raw_c, raw_d]
            mock_ann.return_value = [zd.ZoteroItem(raw_c), zd.ZoteroItem(raw_d)]
            mock_col.return_value = {"key": "COL1", "data": {"name": "Website Citations"}}
            mock_ci.return_value = [{"key": "C"}, {"key": "D"}]  # both in collection

            result = zd.main(
                [
                    "--library-id", "12345",
                    "--api-key", "TESTKEY",
                    "--ci-check",
                ]
            )
        assert result == 1

    def test_skip_children_flag(self) -> None:
        with patch("zotero_dedup._build_client") as mock_build, \
             patch("zotero_dedup._fetch_all_top_level_items") as mock_fetch, \
             patch("zotero_dedup._annotate_with_children") as mock_annotate:

            mock_zot = self._make_zot_mock()
            mock_build.return_value = mock_zot
            mock_fetch.return_value = []
            mock_annotate.return_value = []

            with patch("builtins.open", create=True), \
                 patch("pathlib.Path.write_text"):
                zd.main(
                    [
                        "--library-id", "12345",
                        "--api-key", "TESTKEY",
                        "--detect-only",
                        "--skip-children",
                        "--output", "/tmp/noop.json",
                    ]
                )

            # _annotate_with_children should NOT be called when --skip-children
            mock_annotate.assert_not_called()
