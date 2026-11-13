#!/usr/bin/env python3
"""
Zotero Library Deduplication and Enrichment
=============================================

Scans a Zotero library for duplicate items (by fuzzy title match), identifies
the canonical (most-complete) version of each group, enriches sparse copies
with missing metadata (DOI, notes), and cleans the Website Citations collection
so it contains only canonical, fully-enriched entries.

Phases
------
  Phase 1 – Detect duplicates across the entire library (fuzzy title match).
  Phase 2 – Enrich sparse versions: copy DOI from canonical, ensure notes exist.
  Phase 3 – Clean Website Citations: remove sparse duplicates, keep canonical.
  Phase 4 – Report: list remaining items that genuinely lack PDFs (books, etc.).

Usage
-----
    # Detect only (safe, read-only)
    python zotero_dedup.py --library-id LIB_ID --api-key KEY --detect-only

    # Detect + enrich + clean (writes to Zotero)
    python zotero_dedup.py --library-id LIB_ID --api-key KEY

    # Dry-run (shows what would change but makes no API calls)
    python zotero_dedup.py --library-id LIB_ID --api-key KEY --dry-run

    # Restrict to Website Citations collection only
    python zotero_dedup.py --library-id LIB_ID --api-key KEY \\
        --collection "Website Citations"

    # CI mode: exit 1 if duplicates are found in Website Citations
    python zotero_dedup.py --library-id LIB_ID --api-key KEY \\
        --collection "Website Citations" --ci-check

Environment variables (alternative to flags)
--------------------------------------------
    ZOTERO_LIBRARY_ID  – numeric Zotero user/group library ID
    ZOTERO_API_KEY     – Zotero API key with read (+ write for enrichment)
    ZOTERO_LIBRARY_TYPE – "user" (default) or "group"

Exit codes
----------
    0 – Success (or no duplicates found in --ci-check mode)
    1 – Duplicates found in --ci-check mode
    2 – Configuration / API error
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

try:
    from pyzotero import zotero  # type: ignore[import-untyped]
except ImportError:
    print(
        "Error: pyzotero is required. Install with: pip install pyzotero",
        file=sys.stderr,
    )
    sys.exit(2)

try:
    from rapidfuzz import fuzz  # type: ignore[import-untyped]
except ImportError:
    print(
        "Error: rapidfuzz is required. Install with: pip install rapidfuzz",
        file=sys.stderr,
    )
    sys.exit(2)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

FUZZY_TITLE_THRESHOLD = 92  # minimum token-sort-ratio score to consider a match
WEBSITE_CITATIONS_NAME = "Website Citations"

# Item types that legitimately may not have a PDF (books, standards, webpages…)
NON_JOURNAL_TYPES = {
    "book",
    "bookSection",
    "webpage",
    "report",
    "standard",
    "statute",
    "patent",
    "thesis",
    "conferencePaper",
    "document",
    "presentation",
    "videoRecording",
    "podcast",
}


# ---------------------------------------------------------------------------
# Data classes
# ---------------------------------------------------------------------------


@dataclass
class ZoteroItem:
    """Lightweight wrapper around a raw Zotero item dict."""

    raw: dict[str, Any]

    # ── computed on first access ──────────────────────────────────────────
    @property
    def key(self) -> str:
        return self.raw.get("key", "")

    @property
    def item_type(self) -> str:
        return self.raw.get("data", {}).get("itemType", "")

    @property
    def title(self) -> str:
        return self.raw.get("data", {}).get("title", "").strip()

    @property
    def title_normalized(self) -> str:
        """Lower-cased, whitespace-collapsed title for matching."""
        return " ".join(self.title.lower().split())

    @property
    def doi(self) -> str:
        return self.raw.get("data", {}).get("DOI", "").strip()

    @property
    def year(self) -> str:
        return self.raw.get("data", {}).get("date", "")[:4]

    @property
    def has_pdf(self) -> bool:
        return bool(self.raw.get("_pdf_key"))

    @property
    def has_notes(self) -> bool:
        return bool(self.raw.get("_note_keys"))

    @property
    def pdf_key(self) -> str | None:
        return self.raw.get("_pdf_key")

    @property
    def note_keys(self) -> list[str]:
        return self.raw.get("_note_keys", [])

    @property
    def num_authors(self) -> int:
        creators = self.raw.get("data", {}).get("creators", [])
        return len(creators)

    @property
    def completeness_score(self) -> int:
        """Higher is better (canonical selection heuristic).

        Points:
          +4  has PDF attachment
          +3  has at least one note
          +2  has DOI
          +1  has ≥ 1 author
          +1  has year
          +1  has abstract
        """
        score = 0
        if self.has_pdf:
            score += 4
        if self.has_notes:
            score += 3
        if self.doi:
            score += 2
        if self.num_authors >= 1:
            score += 1
        if self.year:
            score += 1
        if self.raw.get("data", {}).get("abstractNote", "").strip():
            score += 1
        return score

    def __repr__(self) -> str:
        return (
            f"ZoteroItem(key={self.key!r}, title={self.title[:40]!r}, "
            f"score={self.completeness_score}, has_pdf={self.has_pdf}, "
            f"has_notes={self.has_notes}, doi={self.doi!r})"
        )


@dataclass
class DuplicateGroup:
    """A group of items that are duplicates of each other."""

    canonical: ZoteroItem
    duplicates: list[ZoteroItem] = field(default_factory=list)

    @property
    def all_items(self) -> list[ZoteroItem]:
        return [self.canonical] + self.duplicates

    @property
    def any_has_pdf(self) -> bool:
        return any(item.has_pdf for item in self.all_items)

    @property
    def any_has_notes(self) -> bool:
        return any(item.has_notes for item in self.all_items)


# ---------------------------------------------------------------------------
# Zotero helpers
# ---------------------------------------------------------------------------


def _build_client(library_id: str, api_key: str, library_type: str) -> Any:
    """Return an authenticated pyzotero client."""
    return zotero.Zotero(library_id, library_type, api_key)


def _fetch_all_top_level_items(zot: Any) -> list[dict[str, Any]]:
    """Fetch every top-level item in the library (excluding attachments/notes)."""
    print("Fetching all top-level items from Zotero library…", flush=True)
    items = zot.everything(zot.top())
    print(f"  Retrieved {len(items)} top-level items.", flush=True)
    return items


def _fetch_children(zot: Any, parent_key: str) -> list[dict[str, Any]]:
    """Return child items (attachments, notes) for a given parent key."""
    try:
        return zot.children(parent_key)
    except Exception:
        return []


def _annotate_with_children(
    zot: Any, items: list[dict[str, Any]], *, verbose: bool = False
) -> list[ZoteroItem]:
    """Attach PDF key and note keys to each item dict, return ZoteroItem list."""
    annotated: list[ZoteroItem] = []
    total = len(items)
    for i, raw in enumerate(items):
        if verbose and i % 100 == 0:
            print(f"  Annotating children {i}/{total}…", flush=True)
        children = _fetch_children(zot, raw["key"])
        pdf_key: str | None = None
        note_keys: list[str] = []
        for child in children:
            ctype = child.get("data", {}).get("itemType", "")
            if ctype == "attachment":
                link_mode = child.get("data", {}).get("linkMode", "")
                content_type = child.get("data", {}).get("contentType", "")
                if link_mode in ("imported_file", "linked_file") and "pdf" in content_type.lower():
                    pdf_key = child["key"]
            elif ctype == "note":
                note_keys.append(child["key"])
        raw["_pdf_key"] = pdf_key
        raw["_note_keys"] = note_keys
        annotated.append(ZoteroItem(raw))
        # Polite rate-limiting: Zotero API allows ~6 req/s (1/6 ≈ 0.167 s per request)
        time.sleep(0.17)
    return annotated


# ---------------------------------------------------------------------------
# Phase 1 – Duplicate detection
# ---------------------------------------------------------------------------


def detect_duplicates(items: list[ZoteroItem]) -> list[DuplicateGroup]:
    """Group items by fuzzy title match and return duplicate groups.

    Uses a greedy O(n²) approach — acceptable for library sizes up to ~5 k items.
    Only items with non-empty titles are considered.
    """
    # Filter out items without titles (attachments that sneak through, etc.)
    titled = [it for it in items if it.title_normalized]

    # Union-find to group duplicates
    parent = {it.key: it.key for it in titled}
    key_to_item = {it.key: it for it in titled}

    def find(k: str) -> str:
        while parent[k] != k:
            parent[k] = parent[parent[k]]
            k = parent[k]
        return k

    def union(a: str, b: str) -> None:
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[rb] = ra

    print("Running fuzzy duplicate detection…", flush=True)
    n = len(titled)
    for i in range(n):
        for j in range(i + 1, n):
            score = fuzz.token_sort_ratio(
                titled[i].title_normalized, titled[j].title_normalized
            )
            if score >= FUZZY_TITLE_THRESHOLD:
                union(titled[i].key, titled[j].key)

    # Build groups
    groups: dict[str, list[ZoteroItem]] = {}
    for item in titled:
        root = find(item.key)
        groups.setdefault(root, []).append(item)

    # Only return groups with ≥ 2 items
    dup_groups: list[DuplicateGroup] = []
    for group_items in groups.values():
        if len(group_items) < 2:
            continue
        # Canonical = highest completeness score; break ties by preferring
        # the item with a non-JSTOR DOI, then the earliest key (alphabetical)
        sorted_items = sorted(
            group_items,
            key=lambda it: (
                -it.completeness_score,
                1 if (it.doi.startswith("10.2307") or not it.doi) else 0,
                it.key,
            ),
        )
        canonical = sorted_items[0]
        duplicates = sorted_items[1:]
        dup_groups.append(DuplicateGroup(canonical=canonical, duplicates=duplicates))

    dup_groups.sort(key=lambda g: g.canonical.title)
    print(f"  Found {len(dup_groups)} duplicate group(s).", flush=True)
    return dup_groups


# ---------------------------------------------------------------------------
# Phase 2 – Enrich sparse versions
# ---------------------------------------------------------------------------


def enrich_item(
    zot: Any, sparse: ZoteroItem, canonical: ZoteroItem, *, dry_run: bool
) -> dict[str, Any]:
    """Copy DOI (and other missing metadata) from canonical to sparse item.

    Returns a dict describing what was changed.
    """
    changes: dict[str, Any] = {"key": sparse.key, "copied_doi": False, "added_note": False}
    data = dict(sparse.raw.get("data", {}))
    updated = False

    # Copy DOI if sparse is missing it and canonical has one
    if not sparse.doi and canonical.doi:
        data["DOI"] = canonical.doi
        changes["copied_doi"] = True
        updated = True

    if updated:
        if not dry_run:
            zot.update_item({**sparse.raw, "data": data})
        print(
            f"  {'[DRY RUN] ' if dry_run else ''}Enriched {sparse.key}: {changes}",
            flush=True,
        )

    return changes


def enrich_groups(
    zot: Any, groups: list[DuplicateGroup], *, dry_run: bool
) -> list[dict[str, Any]]:
    """Run Phase 2 enrichment for all duplicate groups.

    Only enriches items that are DUPLICATES (not the canonical). The canonical
    is already the best version.
    """
    all_changes: list[dict[str, Any]] = []
    for group in groups:
        for sparse in group.duplicates:
            changes = enrich_item(zot, sparse, group.canonical, dry_run=dry_run)
            all_changes.append(changes)
    return all_changes


# ---------------------------------------------------------------------------
# Phase 3 – Clean Website Citations collection
# ---------------------------------------------------------------------------


def _find_collection(zot: Any, name: str) -> dict[str, Any] | None:
    """Return the raw Zotero collection dict matching ``name`` (case-insensitive)."""
    collections = zot.collections()
    for col in collections:
        if col.get("data", {}).get("name", "").lower() == name.lower():
            return col
    return None


def _fetch_collection_items(zot: Any, collection_key: str) -> list[dict[str, Any]]:
    """Return all top-level items in a collection."""
    return zot.everything(zot.collection_items_top(collection_key))


def clean_collection(
    zot: Any,
    groups: list[DuplicateGroup],
    *,
    collection_name: str = WEBSITE_CITATIONS_NAME,
    dry_run: bool,
) -> dict[str, Any]:
    """Phase 3: Remove sparse duplicates from the collection, keep canonical.

    Returns a summary dict.
    """
    col = _find_collection(zot, collection_name)
    if col is None:
        print(
            f"  Collection '{collection_name}' not found — skipping Phase 3.",
            flush=True,
        )
        return {"collection_found": False}

    col_key = col["key"]
    col_items_raw = _fetch_collection_items(zot, col_key)
    col_keys: set[str] = {item["key"] for item in col_items_raw}

    print(
        f"  Collection '{collection_name}' has {len(col_keys)} items.",
        flush=True,
    )

    removed: list[str] = []
    added_canonical: list[str] = []

    for group in groups:
        canonical_key = group.canonical.key
        dup_keys_in_col = [d.key for d in group.duplicates if d.key in col_keys]
        if not dup_keys_in_col:
            continue  # no duplicates in this collection

        # Remove sparse duplicates from collection
        for dup_key in dup_keys_in_col:
            if not dry_run:
                zot.remove_item_from_collection(dup_key, col_key)
            removed.append(dup_key)
            print(
                f"  {'[DRY RUN] ' if dry_run else ''}Removed duplicate {dup_key} "
                f"from '{collection_name}'.",
                flush=True,
            )

        # Ensure the canonical version IS in the collection
        if canonical_key not in col_keys:
            if not dry_run:
                zot.addto_collection(canonical_key, col)
            added_canonical.append(canonical_key)
            print(
                f"  {'[DRY RUN] ' if dry_run else ''}Added canonical {canonical_key} "
                f"to '{collection_name}'.",
                flush=True,
            )

    return {
        "collection_found": True,
        "collection_name": collection_name,
        "initial_size": len(col_keys),
        "removed": removed,
        "added_canonical": added_canonical,
    }


# ---------------------------------------------------------------------------
# Phase 4 – Report items genuinely lacking PDFs
# ---------------------------------------------------------------------------


def report_no_pdf(
    items: list[ZoteroItem],
    *,
    collection_name: str = WEBSITE_CITATIONS_NAME,
    zot: Any | None = None,
) -> list[dict[str, Any]]:
    """Return items that have no PDF anywhere and are not non-journal types."""
    # If a collection name is given, filter to that collection's items only
    if zot is not None and collection_name:
        col = _find_collection(zot, collection_name)
        if col:
            col_items_raw = _fetch_collection_items(zot, col["key"])
            col_keys = {item["key"] for item in col_items_raw}
            items = [it for it in items if it.key in col_keys]

    no_pdf = []
    for item in items:
        if not item.has_pdf:
            no_pdf.append(
                {
                    "key": item.key,
                    "title": item.title,
                    "item_type": item.item_type,
                    "doi": item.doi,
                    "year": item.year,
                    "is_non_journal": item.item_type in NON_JOURNAL_TYPES,
                }
            )
    return no_pdf


# ---------------------------------------------------------------------------
# CI check helper
# ---------------------------------------------------------------------------


def ci_check_duplicates(
    groups: list[DuplicateGroup],
    zot: Any,
    *,
    collection_name: str = WEBSITE_CITATIONS_NAME,
) -> int:
    """Return the number of duplicate groups that have members in ``collection_name``.

    Used by --ci-check: exits 1 if > 0.
    """
    col = _find_collection(zot, collection_name)
    if col is None:
        return 0
    col_items_raw = _fetch_collection_items(zot, col["key"])
    col_keys: set[str] = {item["key"] for item in col_items_raw}

    count = 0
    for group in groups:
        all_keys = {it.key for it in group.all_items}
        if all_keys & col_keys and len(all_keys & col_keys) > 1:
            count += 1
    return count


# ---------------------------------------------------------------------------
# Report writing
# ---------------------------------------------------------------------------


def write_report(
    output_path: Path,
    groups: list[DuplicateGroup],
    enrichment_changes: list[dict[str, Any]],
    clean_summary: dict[str, Any],
    no_pdf_items: list[dict[str, Any]],
) -> None:
    """Write a JSON report to ``output_path``."""
    report = {
        "duplicate_groups": [
            {
                "canonical": {
                    "key": g.canonical.key,
                    "title": g.canonical.title,
                    "doi": g.canonical.doi,
                    "has_pdf": g.canonical.has_pdf,
                    "has_notes": g.canonical.has_notes,
                    "completeness_score": g.canonical.completeness_score,
                },
                "duplicates": [
                    {
                        "key": d.key,
                        "title": d.title,
                        "doi": d.doi,
                        "has_pdf": d.has_pdf,
                        "has_notes": d.has_notes,
                        "completeness_score": d.completeness_score,
                    }
                    for d in g.duplicates
                ],
                "any_has_pdf": g.any_has_pdf,
                "any_has_notes": g.any_has_notes,
            }
            for g in groups
        ],
        "enrichment_changes": enrichment_changes,
        "clean_summary": clean_summary,
        "no_pdf_items": no_pdf_items,
    }
    output_path.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Report written to {output_path}", flush=True)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Deduplicate and enrich a Zotero library.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "--library-id",
        default=os.environ.get("ZOTERO_LIBRARY_ID", ""),
        help="Zotero library ID (env: ZOTERO_LIBRARY_ID)",
    )
    parser.add_argument(
        "--api-key",
        default=os.environ.get("ZOTERO_API_KEY", ""),
        help="Zotero API key (env: ZOTERO_API_KEY)",
    )
    parser.add_argument(
        "--library-type",
        default=os.environ.get("ZOTERO_LIBRARY_TYPE", "user"),
        choices=["user", "group"],
        help="Library type: user or group (env: ZOTERO_LIBRARY_TYPE, default: user)",
    )
    parser.add_argument(
        "--collection",
        default=WEBSITE_CITATIONS_NAME,
        help=f"Collection name to clean in Phase 3 (default: '{WEBSITE_CITATIONS_NAME}')",
    )
    parser.add_argument(
        "--detect-only",
        action="store_true",
        help="Only run Phase 1 (duplicate detection), skip enrichment and cleanup",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would change but make no API write calls",
    )
    parser.add_argument(
        "--ci-check",
        action="store_true",
        help=(
            "Exit 1 if duplicate entries are found within the target collection. "
            "Skips enrichment and cleanup phases."
        ),
    )
    parser.add_argument(
        "--skip-children",
        action="store_true",
        help="Skip fetching child items (faster but cannot detect PDFs/notes)",
    )
    parser.add_argument(
        "--output",
        default="zotero_dedup_report.json",
        help="Path to write the JSON report (default: zotero_dedup_report.json)",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Print progress during child annotation",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = _parse_args(argv)

    if not args.library_id:
        print(
            "Error: --library-id or ZOTERO_LIBRARY_ID is required.",
            file=sys.stderr,
        )
        return 2
    if not args.api_key:
        print(
            "Error: --api-key or ZOTERO_API_KEY is required.",
            file=sys.stderr,
        )
        return 2

    # Build client
    try:
        zot = _build_client(args.library_id, args.api_key, args.library_type)
    except Exception as exc:
        print(f"Error creating Zotero client: {exc}", file=sys.stderr)
        return 2

    # ── Phase 1: Detect duplicates ──────────────────────────────────────
    print("\n=== Phase 1: Detecting duplicates ===", flush=True)
    raw_items = _fetch_all_top_level_items(zot)
    if args.skip_children:
        items = [ZoteroItem(raw) for raw in raw_items]
    else:
        items = _annotate_with_children(zot, raw_items, verbose=args.verbose)

    groups = detect_duplicates(items)

    if args.ci_check:
        dup_count = ci_check_duplicates(groups, zot, collection_name=args.collection)
        if dup_count > 0:
            print(
                f"\nCI CHECK FAILED: {dup_count} duplicate group(s) found in "
                f"'{args.collection}'.",
                file=sys.stderr,
                flush=True,
            )
            _print_duplicate_summary(groups)
            return 1
        print(
            f"\nCI CHECK PASSED: No duplicates found in '{args.collection}'.",
            flush=True,
        )
        return 0

    _print_duplicate_summary(groups)

    enrichment_changes: list[dict[str, Any]] = []
    clean_summary: dict[str, Any] = {}
    no_pdf_items: list[dict[str, Any]] = []

    if not args.detect_only:
        # ── Phase 2: Enrich sparse versions ────────────────────────────
        print("\n=== Phase 2: Enriching sparse versions ===", flush=True)
        enrichment_changes = enrich_groups(zot, groups, dry_run=args.dry_run)
        _changed = [c for c in enrichment_changes if c.get("copied_doi") or c.get("added_note")]
        print(f"  {len(_changed)} item(s) updated.", flush=True)

        # ── Phase 3: Clean Website Citations ───────────────────────────
        print(f"\n=== Phase 3: Cleaning '{args.collection}' ===", flush=True)
        clean_summary = clean_collection(
            zot,
            groups,
            collection_name=args.collection,
            dry_run=args.dry_run,
        )

        # ── Phase 4: Report items without PDFs ─────────────────────────
        print("\n=== Phase 4: Items without PDFs ===", flush=True)
        no_pdf_items = report_no_pdf(
            items,
            collection_name=args.collection,
            zot=zot if not args.skip_children else None,
        )
        journal_no_pdf = [it for it in no_pdf_items if not it["is_non_journal"]]
        other_no_pdf = [it for it in no_pdf_items if it["is_non_journal"]]
        print(
            f"  {len(journal_no_pdf)} journal article(s) without PDF "
            f"(manual review needed).",
            flush=True,
        )
        print(
            f"  {len(other_no_pdf)} non-journal item(s) without PDF "
            f"(books, webpages — expected).",
            flush=True,
        )

    # Write report
    output_path = Path(args.output)
    write_report(output_path, groups, enrichment_changes, clean_summary, no_pdf_items)
    return 0


def _print_duplicate_summary(groups: list[DuplicateGroup]) -> None:
    if not groups:
        print("  No duplicates found.", flush=True)
        return
    print(f"\n  {len(groups)} duplicate group(s):\n", flush=True)
    for g in groups:
        print(f"  ★ CANONICAL [{g.canonical.completeness_score}] {g.canonical}", flush=True)
        for d in g.duplicates:
            missing = []
            if not d.has_pdf:
                missing.append("no PDF")
            if not d.has_notes:
                missing.append("no notes")
            if not d.doi:
                missing.append("no DOI")
            miss_str = ", ".join(missing) if missing else "complete"
            print(
                f"    DUP [{d.completeness_score}] {d}  ({miss_str})",
                flush=True,
            )
        print()


if __name__ == "__main__":
    sys.exit(main())
