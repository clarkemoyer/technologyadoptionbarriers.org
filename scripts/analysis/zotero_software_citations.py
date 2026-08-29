#!/usr/bin/env python3
"""
Create or update the "Software & Tools" Zotero subcollection with software
citations for license compliance.

Reads ``src/data/software-citations.json`` and pushes each entry to a Zotero
library as a ``computerProgram`` item, creating the "Software & Tools"
collection under "Website Citations" if it does not already exist.

Environment variables (required in --push mode):
    ZOTERO_API_KEY       Zotero API key with write access
    ZOTERO_LIBRARY_ID    Numeric user or group ID
    ZOTERO_LIBRARY_TYPE  "user" or "group" (default: "user")

Usage:
    # Dry run (no API calls) — print what would be pushed
    python scripts/analysis/zotero_software_citations.py

    # Push to Zotero
    ZOTERO_API_KEY=... ZOTERO_LIBRARY_ID=... \\
        python scripts/analysis/zotero_software_citations.py --push

    # Push, skipping items that already exist (match by title)
    python scripts/analysis/zotero_software_citations.py --push --skip-existing

Exit codes:
    0  Success (or dry-run completed)
    1  Push error (API failure)
    2  Input / configuration error
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path
from typing import Any
from urllib.error import HTTPError
from urllib.request import Request, urlopen


# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

REPO_ROOT = Path(__file__).parent.parent.parent
CATALOG_PATH = REPO_ROOT / "src" / "data" / "software-citations.json"

ZOTERO_API_BASE = "https://api.zotero.org"
SOFTWARE_COLLECTION_NAME = "Software & Tools"
PARENT_COLLECTION_NAME = "Website Citations"


# ---------------------------------------------------------------------------
# Zotero HTTP helpers
# ---------------------------------------------------------------------------

def _headers(api_key: str, extra: dict[str, str] | None = None) -> dict[str, str]:
    h = {
        "Zotero-API-Key": api_key,
        "Content-Type": "application/json",
        "Zotero-API-Version": "3",
    }
    if extra:
        h.update(extra)
    return h


def _get(url: str, api_key: str) -> Any:
    req = Request(url, headers=_headers(api_key))
    with urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode())


def _post(url: str, api_key: str, payload: Any) -> Any:
    data = json.dumps(payload).encode()
    req = Request(url, data=data, headers=_headers(api_key), method="POST")
    try:
        with urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode())
    except HTTPError as exc:
        body = exc.read().decode(errors="replace")
        raise RuntimeError(f"POST {url} failed {exc.code}: {body}") from exc


# ---------------------------------------------------------------------------
# Collection helpers
# ---------------------------------------------------------------------------

def _library_prefix(library_id: str, library_type: str) -> str:
    if library_type == "group":
        return f"{ZOTERO_API_BASE}/groups/{library_id}"
    return f"{ZOTERO_API_BASE}/users/{library_id}"


def _list_collections(prefix: str, api_key: str) -> list[dict]:
    """Return all collections in the library (paginated)."""
    results: list[dict] = []
    start = 0
    limit = 100
    while True:
        url = f"{prefix}/collections?limit={limit}&start={start}"
        page = _get(url, api_key)
        if not page:
            break
        results.extend(page)
        if len(page) < limit:
            break
        start += limit
    return results


def _find_or_create_collection(
    prefix: str, api_key: str, name: str, parent_key: str | None = None
) -> str:
    """Return the key of a collection (creating it if missing)."""
    collections = _list_collections(prefix, api_key)
    for col in collections:
        data = col.get("data", {})
        if data.get("name") == name and data.get("parentCollection") == (parent_key or False):
            return col["key"]

    # Create it
    payload: dict[str, Any] = {"name": name}
    if parent_key:
        payload["parentCollection"] = parent_key
    result = _post(f"{prefix}/collections", api_key, [payload])
    created = result.get("successful", {})
    if not created:
        raise RuntimeError(f"Failed to create collection '{name}': {result}")
    return list(created.values())[0]["key"]


# ---------------------------------------------------------------------------
# Item helpers
# ---------------------------------------------------------------------------

def _list_items_in_collection(prefix: str, api_key: str, collection_key: str) -> list[dict]:
    """Return all items in a collection (paginated)."""
    results: list[dict] = []
    start = 0
    limit = 100
    while True:
        url = f"{prefix}/collections/{collection_key}/items?limit={limit}&start={start}"
        page = _get(url, api_key)
        if not page:
            break
        results.extend(page)
        if len(page) < limit:
            break
        start += limit
    return results


def _entry_to_zotero_item(entry: dict, collection_key: str) -> dict:
    """Convert a software-citations.json entry to a Zotero computerProgram item."""
    authors = entry.get("authors", [])
    creators = [
        {"creatorType": "programmer", "name": name} for name in authors
    ]
    version = entry.get("version_cited", "")
    license_text = entry.get("license", "")
    name = entry.get("name", entry.get("package_name", ""))

    return {
        "itemType": "computerProgram",
        "title": name,
        "abstractNote": entry.get("description", ""),
        "programmingLanguage": "",
        "version": version,
        "system": "",
        "place": "",
        "publisher": authors[0] if authors else "",
        "date": "",
        "seriesTitle": "",
        "url": entry.get("url", entry.get("repository", "")),
        "rights": license_text,
        "extra": (
            f"License: {license_text}\n"
            f"Ecosystem: {entry.get('ecosystem', '')}\n"
            f"Package: {entry.get('package_name', '')}\n"
            f"Repository: {entry.get('repository', '')}"
        ).strip(),
        "creators": creators,
        "tags": [
            {"tag": entry.get("ecosystem", "")},
            {"tag": "software-dependency"},
            {"tag": f"license:{license_text}"},
        ],
        "collections": [collection_key],
        "relations": {},
    }


# ---------------------------------------------------------------------------
# Push logic
# ---------------------------------------------------------------------------

def push_to_zotero(
    catalog: dict,
    api_key: str,
    library_id: str,
    library_type: str,
    skip_existing: bool,
    dry_run: bool,
) -> int:
    prefix = _library_prefix(library_id, library_type)

    print(f"Library: {prefix}")
    print(f"Mode: {'dry-run' if dry_run else 'live'}")
    print(f"Skip existing: {skip_existing}")
    print()

    if dry_run:
        # Just show what would be pushed
        entries = catalog.get("entries", [])
        print(f"Would create/ensure collection: '{PARENT_COLLECTION_NAME}' > '{SOFTWARE_COLLECTION_NAME}'")
        print(f"Would push {len(entries)} items:")
        for entry in entries:
            name = entry.get("name", entry.get("package_name", "?"))
            version = entry.get("version_cited", "")
            lic = entry.get("license", "")
            print(f"  • {name} {version}  [{entry.get('ecosystem','?')}]  License: {lic}")
        return 0

    # Find/create parent collection
    print(f"Finding/creating collection: '{PARENT_COLLECTION_NAME}'...")
    parent_key = _find_or_create_collection(prefix, api_key, PARENT_COLLECTION_NAME)
    print(f"  → key: {parent_key}")

    # Find/create "Software & Tools" subcollection
    print(f"Finding/creating subcollection: '{SOFTWARE_COLLECTION_NAME}'...")
    sw_key = _find_or_create_collection(prefix, api_key, SOFTWARE_COLLECTION_NAME, parent_key)
    print(f"  → key: {sw_key}")

    # Optionally build a set of existing titles
    existing_titles: set[str] = set()
    if skip_existing:
        print("Fetching existing items in collection...")
        existing_items = _list_items_in_collection(prefix, api_key, sw_key)
        existing_titles = {
            item.get("data", {}).get("title", "").lower() for item in existing_items
        }
        print(f"  Found {len(existing_titles)} existing items.")

    entries = catalog.get("entries", [])
    pushed = 0
    skipped = 0
    failed = 0

    # Zotero allows up to 50 items per POST; batch them
    batch_size = 50
    to_push = []
    skipped_names = []

    for entry in entries:
        name = entry.get("name", entry.get("package_name", "?"))
        if skip_existing and name.lower() in existing_titles:
            skipped_names.append(name)
            skipped += 1
            continue
        to_push.append(_entry_to_zotero_item(entry, sw_key))

    if skipped_names:
        print(f"\nSkipped {skipped} already-existing items: {', '.join(skipped_names)}")

    # Push in batches
    for batch_start in range(0, len(to_push), batch_size):
        batch = to_push[batch_start : batch_start + batch_size]
        print(f"\nPushing batch of {len(batch)} items...")
        try:
            result = _post(f"{prefix}/items", api_key, batch)
            success = result.get("successful", {})
            failed_items = result.get("failed", {})
            pushed += len(success)
            if failed_items:
                failed += len(failed_items)
                print(f"  WARNING: {len(failed_items)} items failed: {failed_items}")
            else:
                print(f"  ✓ Pushed {len(success)} items.")
        except RuntimeError as exc:
            print(f"  ERROR: {exc}", file=sys.stderr)
            failed += len(batch)
        time.sleep(0.5)  # Respect API rate limits

    print(f"\nSummary: pushed={pushed}, skipped={skipped}, failed={failed}")
    return 1 if failed else 0


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def _load_catalog(path: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        print(f"ERROR: Catalog not found: {path}", file=sys.stderr)
        sys.exit(2)
    except json.JSONDecodeError as exc:
        print(f"ERROR: JSON parse error in {path}: {exc}", file=sys.stderr)
        sys.exit(2)


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "--push",
        action="store_true",
        help="Push entries to Zotero (requires ZOTERO_API_KEY, ZOTERO_LIBRARY_ID).",
    )
    parser.add_argument(
        "--skip-existing",
        action="store_true",
        help="Skip items whose title already exists in the collection.",
    )
    parser.add_argument(
        "--catalog",
        type=Path,
        default=CATALOG_PATH,
        help=f"Path to software-citations.json (default: {CATALOG_PATH})",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = _parse_args(argv)
    catalog = _load_catalog(args.catalog)

    dry_run = not args.push

    if not dry_run:
        api_key = os.environ.get("ZOTERO_API_KEY", "")
        library_id = os.environ.get("ZOTERO_LIBRARY_ID", "")
        library_type = os.environ.get("ZOTERO_LIBRARY_TYPE", "user")
        if not api_key:
            print("ERROR: ZOTERO_API_KEY environment variable is required.", file=sys.stderr)
            return 2
        if not library_id:
            print("ERROR: ZOTERO_LIBRARY_ID environment variable is required.", file=sys.stderr)
            return 2
    else:
        api_key = ""
        library_id = ""
        library_type = "user"

    return push_to_zotero(
        catalog=catalog,
        api_key=api_key,
        library_id=library_id,
        library_type=library_type,
        skip_existing=args.skip_existing,
        dry_run=dry_run,
    )


if __name__ == "__main__":
    sys.exit(main())
