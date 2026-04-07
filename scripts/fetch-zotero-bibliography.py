#!/usr/bin/env python3
"""Fetch bibliography data from Zotero and write to src/data/bibliography.json.

Reads the "Website Citations" Zotero collection and its sub-collections.
Sub-collections are treated as tracks (e.g., "Track 1 - Individual",
"Track 2 - Organizational"). Items within each sub-collection become the
bibliography entries for that track. If there are no sub-collections, all
items are placed in a single track.

Environment variables:
  ZOTERO_API_KEY         — Zotero API key (required)
  ZOTERO_LIBRARY_ID      — Zotero user or group ID (required)
  ZOTERO_LIBRARY_TYPE    — 'user' or 'group' (default: 'user')
  ZOTERO_COLLECTION_NAME — Top-level collection name (default: 'Website Citations')
  OUTPUT_PATH            — Output file path (default: src/data/bibliography.json)
"""

from __future__ import annotations

import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

try:
    from pyzotero import zotero
except ImportError:
    print("Error: pyzotero is required. Install with: pip install pyzotero", file=sys.stderr)
    sys.exit(1)


# ---------------------------------------------------------------------------
# Author helpers
# ---------------------------------------------------------------------------


def extract_year(date_str: str) -> str:
    """Extract a 4-digit year from a date string."""
    if not date_str:
        return ""
    match = re.search(r"\b(1[0-9]{3}|2[0-9]{3})\b", date_str)
    return match.group(1) if match else date_str.strip()


def format_creators(creators: list) -> list:
    """Normalise a Zotero creators list into the bibliography schema."""
    result = []
    for creator in creators:
        creator_type = creator.get("creatorType", "author")
        if creator_type not in ("author", "editor"):
            continue
        result.append(
            {
                "creatorType": creator_type,
                "lastName": creator.get("lastName", ""),
                "firstName": creator.get("firstName", ""),
                # 'name' is non-empty for institutional / single-name authors
                "name": creator.get("name", ""),
            }
        )
    return result


def _first_sort_name(authors: list) -> str:
    """Return a sortable string for the first author (last name or institution name)."""
    if not authors:
        return ""
    first = authors[0]
    return (first.get("lastName") or first.get("name", "")).lower()


def _inventory_author_str(authors: list) -> str:
    """Format authors for the inventory display ('Last & Last (year)' style)."""
    if not authors:
        return ""

    def last(a: dict) -> str:
        return a.get("lastName") or a.get("name", "")

    n = len(authors)
    if n == 1:
        return last(authors[0])
    if n == 2:
        return f"{last(authors[0])} & {last(authors[1])}"
    if n == 3:
        return f"{last(authors[0])}, {last(authors[1])}, & {last(authors[2])}"
    # 4+ authors
    return f"{last(authors[0])} et al."


def make_inventory_display(authors: list, year: str, title: str) -> str:
    """Build the one-line inventory entry: 'Author (year) - Short title'."""
    author_str = _inventory_author_str(authors)
    short_title = title[:65] + "..." if len(title) > 65 else title
    return f"{author_str} ({year}) - {short_title}"


# ---------------------------------------------------------------------------
# Item conversion
# ---------------------------------------------------------------------------


def item_to_entry(item: dict) -> dict:
    """Convert a raw Zotero item dict to a bibliography entry dict."""
    data = item.get("data", {})
    authors = format_creators(data.get("creators", []))
    year = extract_year(data.get("date", ""))
    title = data.get("title", "")

    return {
        "key": data.get("key", item.get("key", "")),
        "itemType": data.get("itemType", ""),
        "title": title,
        "authors": authors,
        "year": year,
        "doi": data.get("DOI", ""),
        "url": data.get("url", ""),
        "journal": data.get("publicationTitle", ""),
        "volume": data.get("volume", ""),
        "issue": data.get("issue", ""),
        "pages": data.get("pages", ""),
        "publisher": data.get("publisher", "") or data.get("institution", ""),
        "place": data.get("place", ""),
        "abstract": data.get("abstractNote", ""),
        "accessDate": data.get("accessDate", ""),
        "edition": data.get("edition", ""),
        "versionNumber": data.get("versionNumber", ""),
        # Pre-formatted one-liner for the inventory dashboard table.
        # Override this value in Zotero's 'Extra' field as:
        #   inventoryDisplay: Custom Author (Year) - Custom Title
        # if the auto-generated string is unsatisfactory.
        "inventoryDisplay": _parse_extra_field(data.get("extra", ""), "inventoryDisplay")
        or make_inventory_display(authors, year, title),
    }


def _parse_extra_field(extra: str, key: str) -> str:
    """Extract a value from Zotero's free-form 'extra' field.

    Looks for lines of the form:
        key: value
    Returns the trimmed value, or an empty string if not found.
    """
    for line in (extra or "").splitlines():
        if line.strip().lower().startswith(key.lower() + ":"):
            return line.split(":", 1)[1].strip()
    return ""


# ---------------------------------------------------------------------------
# Zotero collection helpers
# ---------------------------------------------------------------------------


def find_collection_by_name(zot, name: str) -> str | None:
    """Find a top-level collection by name (case-insensitive), return its key."""
    for col in zot.collections():
        if col.get("data", {}).get("name", "").strip().lower() == name.strip().lower():
            return col["data"]["key"]
    return None


def get_sub_collections(zot, parent_key: str) -> list:
    """Return sub-collections of *parent_key*, sorted by name."""
    subs = zot.collections_sub(parent_key)
    return sorted(subs, key=lambda c: c.get("data", {}).get("name", ""))


def get_collection_items(zot, collection_key: str) -> list:
    """Return all non-attachment, non-note items in a collection."""
    raw = zot.everything(zot.collection_items(collection_key, itemType="-attachment"))
    return [
        item
        for item in raw
        if item.get("data", {}).get("itemType") not in ("note", "attachment")
    ]


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> None:
    api_key = os.environ.get("ZOTERO_API_KEY")
    if not api_key:
        print("Error: ZOTERO_API_KEY environment variable is required", file=sys.stderr)
        sys.exit(1)

    library_id = os.environ.get("ZOTERO_LIBRARY_ID")
    if not library_id:
        print("Error: ZOTERO_LIBRARY_ID environment variable is required", file=sys.stderr)
        sys.exit(1)

    library_type = os.environ.get("ZOTERO_LIBRARY_TYPE", "user")
    collection_name = os.environ.get("ZOTERO_COLLECTION_NAME", "Website Citations")
    output_path = os.environ.get("OUTPUT_PATH", "src/data/bibliography.json")

    print(f"Connecting to Zotero {library_type} library {library_id} …")
    zot = zotero.Zotero(library_id, library_type, api_key)

    print(f"Looking for collection: {collection_name!r}")
    collection_key = find_collection_by_name(zot, collection_name)
    if not collection_key:
        print(f"Error: Collection {collection_name!r} not found.", file=sys.stderr)
        print("Available collections:", file=sys.stderr)
        for col in zot.collections():
            print(f"  - {col.get('data', {}).get('name', '')}", file=sys.stderr)
        sys.exit(1)

    print(f"Found collection key: {collection_key}")

    # Prefer sub-collections as tracks; fall back to the top-level collection.
    sub_collections = get_sub_collections(zot, collection_key)
    tracks: list = []
    total_items = 0

    if sub_collections:
        print(f"Found {len(sub_collections)} sub-collection(s):")
        for sub in sub_collections:
            sub_name = sub["data"]["name"]
            sub_key = sub["data"]["key"]
            print(f"  - {sub_name} ({sub_key})")

            raw_items = get_collection_items(zot, sub_key)
            entries = [item_to_entry(item) for item in raw_items]
            # Sort alphabetically by first-author last name within each track.
            entries.sort(key=lambda e: _first_sort_name(e["authors"]))
            total_items += len(entries)

            # Derive track ID from the first digit found in the sub-collection name.
            track_match = re.search(r"(\d+)", sub_name)
            track_id = int(track_match.group(1)) if track_match else len(tracks) + 1

            tracks.append({"id": track_id, "name": sub_name, "items": entries})

        tracks.sort(key=lambda t: t["id"])
    else:
        # No sub-collections — treat the whole collection as one track.
        print("No sub-collections found; using all items as a single track.")
        raw_items = get_collection_items(zot, collection_key)
        entries = [item_to_entry(item) for item in raw_items]
        entries.sort(key=lambda e: _first_sort_name(e["authors"]))
        total_items = len(entries)
        tracks.append({"id": 1, "name": collection_name, "items": entries})

    output = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "collection": collection_name,
        "totalItems": total_items,
        "tracks": tracks,
    }

    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\nWrote {total_items} items across {len(tracks)} track(s) to {output_path}")
    for track in tracks:
        print(f"  Track {track['id']}: {track['name']} ({len(track['items'])} items)")


if __name__ == "__main__":
    main()
