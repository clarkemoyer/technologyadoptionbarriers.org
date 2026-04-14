#!/usr/bin/env python3
"""
fetch-zotero-citations.py
=========================
Fetches citation metrics from the "TABS Website Citations" Zotero collection
(and all items nested within it) via the pyzotero API client, then writes a
summary to src/data/citation-metrics.json.

Required environment variables:
  ZOTERO_LIBRARY_ID   - Zotero numeric library/group ID
  ZOTERO_API_KEY      - Zotero API key with read access
  ZOTERO_LIBRARY_TYPE - "user" or "group" (default: "group")

Optional environment variable:
  ZOTERO_COLLECTION_NAME - Name of the root collection to scope to
                           (default: "TABS Website Citations")

Output JSON shape:
  {
    "updatedAt": "<ISO-8601 timestamp>",
    "totalReferences": <int>,
    "uniqueJournals": <int>,
    "dateRange": { "earliest": <int|null>, "latest": <int|null> },
    "itemTypes": [{ "type": "<str>", "count": <int> }, ...],
    "topCollections": [{ "name": "<str>", "count": <int> }, ...]
  }
"""

import json
import os
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

try:
    from pyzotero import zotero
except ImportError:
    print("ERROR: pyzotero is not installed. Run: pip install pyzotero", file=sys.stderr)
    sys.exit(1)


# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

TOP_COLLECTIONS_LIMIT = 10
TARGET_COLLECTION_NAME = os.environ.get("ZOTERO_COLLECTION_NAME", "TABS Website Citations")

REPO_ROOT = Path(__file__).parent.parent
OUTPUT_PATH = REPO_ROOT / "src" / "data" / "citation-metrics.json"

# Zotero item types that are not standalone references (child items).
EXCLUDED_TYPES = {"attachment", "note", "annotation"}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _require_env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        print(f"ERROR: Environment variable {name} is not set.", file=sys.stderr)
        sys.exit(1)
    return value


def _parse_year(date_str: str | None) -> int | None:
    """Extract a 4-digit year from a Zotero date string (e.g. '2023', '2023-04', '2023-04-12')."""
    if not date_str:
        return None
    date_str = date_str.strip()
    if len(date_str) >= 4 and date_str[:4].isdigit():
        year = int(date_str[:4])
        if 1000 <= year <= datetime.now(timezone.utc).year:
            return year
    return None


def _friendly_type(item_type: str) -> str:
    """Convert a Zotero itemType camelCase key to a human-readable label."""
    mapping = {
        "journalArticle": "Journal Articles",
        "book": "Books",
        "bookSection": "Book Chapters",
        "conferencePaper": "Conference Papers",
        "report": "Reports",
        "thesis": "Theses",
        "webpage": "Web Pages",
        "magazineArticle": "Magazine Articles",
        "newspaperArticle": "Newspaper Articles",
        "preprint": "Preprints",
        "dataset": "Datasets",
        "document": "Documents",
        "presentation": "Presentations",
        "patent": "Patents",
        "statute": "Statutes",
        "case": "Legal Cases",
        "encyclopediaArticle": "Encyclopedia Articles",
        "dictionaryEntry": "Dictionary Entries",
        "forumPost": "Forum Posts",
        "blogPost": "Blog Posts",
        "podcast": "Podcasts",
        "radioBroadcast": "Radio Broadcasts",
        "tvBroadcast": "TV Broadcasts",
        "film": "Films",
        "videoRecording": "Video Recordings",
        "audioRecording": "Audio Recordings",
        "artwork": "Artwork",
        "map": "Maps",
        "hearing": "Hearings",
        "bill": "Bills",
        "email": "Emails",
        "instantMessage": "Instant Messages",
        "letter": "Letters",
        "interview": "Interviews",
        "manuscript": "Manuscripts",
        "computerProgram": "Computer Programs",
    }
    return mapping.get(item_type, item_type)


def _collect_descendant_keys(
    root_key: str,
    children_by_parent: dict[str, list[str]],
) -> set[str]:
    """Return root_key and all transitively nested subcollection keys.

    Args:
        root_key: The starting collection key to begin traversal from.
        children_by_parent: Mapping of parent collection key to list of
            direct child collection keys.

    Returns:
        A set containing root_key and all recursively nested descendant
        collection keys.
    """
    visited: set[str] = set()
    stack = [root_key]
    while stack:
        key = stack.pop()
        if key in visited:
            continue
        visited.add(key)
        stack.extend(children_by_parent.get(key, []))
    return visited


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> None:
    library_id = _require_env("ZOTERO_LIBRARY_ID")
    api_key = _require_env("ZOTERO_API_KEY")
    library_type = os.environ.get("ZOTERO_LIBRARY_TYPE", "group").strip() or "group"

    print(f"Connecting to Zotero {library_type} library {library_id} ...")
    zot = zotero.Zotero(library_id, library_type, api_key)

    # ------------------------------------------------------------------
    # Fetch all collections and find the target root collection key
    # ------------------------------------------------------------------
    print(f"Fetching collections to locate '{TARGET_COLLECTION_NAME}' ...")
    all_collections = zot.everything(zot.collections())

    # Build lookup structures
    col_name_by_key: dict[str, str] = {}          # key -> name
    children_by_parent: dict[str, list[str]] = {}  # parentKey -> [childKey, ...]
    root_collection_key: str | None = None

    for col in all_collections:
        key = col.get("key", "")
        data = col.get("data", {})
        name = data.get("name", key)
        col_name_by_key[key] = name

        parent_key = data.get("parentCollection", None)
        if parent_key:
            children_by_parent.setdefault(parent_key, []).append(key)

        if name == TARGET_COLLECTION_NAME:
            root_collection_key = key

    if root_collection_key is None:
        print(
            f"ERROR: Collection '{TARGET_COLLECTION_NAME}' not found in library {library_id}.",
            file=sys.stderr,
        )
        # Build a set of all child keys for O(1) lookup when filtering top-level collections
        all_child_keys: set[str] = set().union(*children_by_parent.values()) if children_by_parent else set()
        print(
            "  Available top-level collections: "
            + ", ".join(
                f"'{col_name_by_key[k]}'"
                for k in col_name_by_key
                if k not in all_child_keys
            ),
            file=sys.stderr,
        )
        sys.exit(1)

    print(f"  Found collection key: {root_collection_key}")

    # Collect all collection keys that are within the target (including itself)
    scoped_collection_keys = _collect_descendant_keys(root_collection_key, children_by_parent)
    print(
        f"  Scoping to {len(scoped_collection_keys)} collection(s) "
        f"('{TARGET_COLLECTION_NAME}' + nested subcollections)."
    )

    # ------------------------------------------------------------------
    # Fetch items from the root collection (pyzotero returns all items
    # directly in a collection; we also include nested subcollections by
    # fetching each scoped collection's items separately).
    # ------------------------------------------------------------------
    print("Fetching items in scoped collections ...")
    seen_keys: set[str] = set()
    items: list[dict] = []

    for col_key in scoped_collection_keys:
        col_items = zot.everything(zot.collection_items(col_key))
        for item in col_items:
            item_key = item.get("key", "")
            item_type = item.get("data", {}).get("itemType", "")
            parent = item.get("data", {}).get("parentItem")

            # Only count each item once, skip non-reference child items
            if item_key not in seen_keys and item_type not in EXCLUDED_TYPES and not parent:
                seen_keys.add(item_key)
                items.append(item)

    total_references = len(items)
    print(f"  Found {total_references} unique top-level reference items.")

    # ------------------------------------------------------------------
    # Item types breakdown
    # ------------------------------------------------------------------
    type_counter: Counter[str] = Counter()
    for item in items:
        raw_type = item.get("data", {}).get("itemType", "unknown")
        type_counter[raw_type] += 1

    item_types = [
        {"type": _friendly_type(k), "count": v}
        for k, v in type_counter.most_common()
    ]

    # ------------------------------------------------------------------
    # Unique journals
    # ------------------------------------------------------------------
    journals: set[str] = set()
    for item in items:
        pub = item.get("data", {}).get("publicationTitle", "").strip()
        if pub:
            journals.add(pub)

    unique_journals = len(journals)
    print(f"  Unique journals/publications: {unique_journals}")

    # ------------------------------------------------------------------
    # Date range
    # ------------------------------------------------------------------
    years: list[int] = []
    for item in items:
        year = _parse_year(item.get("data", {}).get("date", ""))
        if year is not None:
            years.append(year)

    date_range = {
        "earliest": min(years) if years else None,
        "latest": max(years) if years else None,
    }
    print(f"  Date range: {date_range}")

    # ------------------------------------------------------------------
    # Subcollections within the scoped set (exclude the root itself)
    # ------------------------------------------------------------------
    subcollection_keys = scoped_collection_keys - {root_collection_key}

    # Count items per subcollection
    subcol_counter: Counter[str] = Counter()
    for item in items:
        for col_key in item.get("data", {}).get("collections", []):
            if col_key in subcollection_keys:
                subcol_counter[col_key] += 1

    top_collections = [
        {"name": col_name_by_key.get(k, k), "count": v}
        for k, v in subcol_counter.most_common(TOP_COLLECTIONS_LIMIT)
    ]

    # ------------------------------------------------------------------
    # Write output
    # ------------------------------------------------------------------
    output = {
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "totalReferences": total_references,
        "uniqueJournals": unique_journals,
        "dateRange": date_range,
        "itemTypes": item_types,
        "topCollections": top_collections,
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as fh:
        json.dump(output, fh, indent=2, ensure_ascii=False)
        fh.write("\n")

    print(f"\nWrote citation metrics to {OUTPUT_PATH}")
    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()

