#!/usr/bin/env python3
"""
fetch-zotero-citations.py
=========================
Fetches citation metrics from a Zotero library via the pyzotero API client
and writes a summary to src/data/citation-metrics.json.

Required environment variables:
  ZOTERO_LIBRARY_ID   - Zotero numeric library/group ID
  ZOTERO_API_KEY      - Zotero API key with read access
  ZOTERO_LIBRARY_TYPE - "user" or "group" (default: "group")

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

LIBRARY_ID = os.environ.get("ZOTERO_LIBRARY_ID", "")
API_KEY = os.environ.get("ZOTERO_API_KEY", "")
LIBRARY_TYPE = os.environ.get("ZOTERO_LIBRARY_TYPE", "group")
TOP_COLLECTIONS_LIMIT = 10

REPO_ROOT = Path(__file__).parent.parent
OUTPUT_PATH = REPO_ROOT / "src" / "data" / "citation-metrics.json"

# Zotero item types that are considered "regular" references (excludes
# attachments, notes, and annotations which are child items).
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
    # Try the first four characters if they look like a year
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


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> None:
    library_id = _require_env("ZOTERO_LIBRARY_ID")
    api_key = _require_env("ZOTERO_API_KEY")
    library_type = os.environ.get("ZOTERO_LIBRARY_TYPE", "group").strip() or "group"

    print(f"Connecting to Zotero {library_type} library {library_id} …")
    zot = zotero.Zotero(library_id, library_type, api_key)

    # ------------------------------------------------------------------
    # Fetch all top-level items (excludes attachments/notes by default
    # when using top=True, but we explicitly filter anyway).
    # ------------------------------------------------------------------
    print("Fetching all items …")
    all_items = zot.everything(zot.items(itemType="-attachment || -note"))

    # Filter to only top-level reference items
    items = [
        item
        for item in all_items
        if item.get("data", {}).get("itemType", "") not in EXCLUDED_TYPES
        and item.get("data", {}).get("parentItem") is None
    ]

    total_references = len(items)
    print(f"  Found {total_references} top-level reference items.")

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
    journals = set()
    for item in items:
        data = item.get("data", {})
        pub = data.get("publicationTitle", "").strip()
        if pub:
            journals.add(pub)

    unique_journals = len(journals)
    print(f"  Unique journals/publications: {unique_journals}")

    # ------------------------------------------------------------------
    # Date range
    # ------------------------------------------------------------------
    years = []
    for item in items:
        data = item.get("data", {})
        year = _parse_year(data.get("date", ""))
        if year is not None:
            years.append(year)

    date_range = {
        "earliest": min(years) if years else None,
        "latest": max(years) if years else None,
    }
    print(f"  Date range: {date_range}")

    # ------------------------------------------------------------------
    # Collections (top N by item count)
    # ------------------------------------------------------------------
    print("Fetching collections …")
    all_collections = zot.everything(zot.collections())

    # Build a map of collectionKey -> name
    col_name: dict[str, str] = {}
    for col in all_collections:
        key = col.get("key", "")
        name = col.get("data", {}).get("name", key)
        col_name[key] = name

    # Count items per collection by looking at each item's collections list
    col_counter: Counter[str] = Counter()
    for item in items:
        for col_key in item.get("data", {}).get("collections", []):
            col_counter[col_key] += 1

    top_collections = [
        {"name": col_name.get(k, k), "count": v}
        for k, v in col_counter.most_common(TOP_COLLECTIONS_LIMIT)
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
