#!/usr/bin/env python3
"""
Validate bibliography page references against the Zotero library.

This script:
1. Extracts author-year pairs from each bibliography page's References <ol>
2. Queries Zotero (cloud or local API) for matching items
3. Reports unmatched references that need to be added to Zotero

Usage:
  python scripts/validate-bibliography-references.py                # cloud API (CI)
  python scripts/validate-bibliography-references.py --local        # local Zotero desktop
  python scripts/validate-bibliography-references.py --dry-run      # extract refs, skip Zotero
  python scripts/validate-bibliography-references.py --verbose / -v # show all pages, not just warnings

Environment (cloud mode):
  ZOTERO_API_KEY          - API key
  ZOTERO_USER_ID          - numeric user ID
  ZOTERO_BASE_URL         - optional base URL override (e.g. for non-standard
                            Zotero-compatible endpoints; defaults to pyzotero's
                            built-in https://api.zotero.org)

Environment (optional):
  ZOTERO_COLLECTION_KEYS  - comma-separated Zotero collection keys to index
                            (overrides name-based and hard-coded defaults).
                            If unset, the script resolves collections by name
                            (looking for "Bibliography Series" / "Website Citations"),
                            then falls back to the built-in default key list.
  VALIDATION_REPORT_PATH  - path for the JSON report (default: bibliography-validation-report.json)

Exit codes:
  0 - All references validated
  1 - Unmatched references found (warning mode)
  2 - Script error
"""

import glob
import json
import os
import re
import sys
from typing import NamedTuple


class PageResult(NamedTuple):
    slug: str
    total: int
    unmatched_count: int
    unmatched: list
    possible_count: int
    possible: list


def extract_references_from_tsx(filepath: str) -> list[dict]:
    """Extract reference entries from a bibliography page's References section."""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Find the References <ol> block
    ref_match = re.search(
        r">References</h2>.*?<ol[^>]*>(.*?)</ol>", content, re.DOTALL
    )
    if not ref_match:
        return []

    ol_content = ref_match.group(1)

    # Extract each <li> content (regex matches both `<li>` and `<li id="ref-...">`)
    refs = []
    for li_match in re.finditer(r"<li[^>]*>(.*?)</li>", ol_content, re.DOTALL):
        raw = li_match.group(1)
        # Strip JSX tags and entities
        text = re.sub(r"<[^>]+>", "", raw)
        text = re.sub(r"\{[^}]*\}", " ", text)  # {' '} etc
        text = text.replace("&amp;", "&")
        text = text.replace("&ldquo;", '"').replace("&rdquo;", '"')
        text = text.replace("&lsquo;", "'").replace("&rsquo;", "'")
        text = text.replace("&apos;", "'")
        text = text.replace("&ndash;", "-").replace("&mdash;", "-")
        text = re.sub(r"\s+", " ", text).strip()

        # Extract author-year pattern
        # APA: Author, A. B. (Year).
        # Also handles: Author, A. B., & Author, C. D. (Year).
        author_year = re.match(
            r"^(.+?)\s*\((\d{4})\)\.", text
        )
        if author_year:
            authors = author_year.group(1).strip().rstrip(",")
            year = author_year.group(2)
            # Get first author last name; strip trailing punctuation so
            # "Microsoft." and "The Open Group." match Zotero's name field.
            first_author = authors.split(",")[0].strip().rstrip(".;:,")
            refs.append(
                {
                    "first_author": first_author,
                    "year": year,
                    "authors_raw": authors,
                    "full_text": text[:120],
                }
            )
        else:
            # Try to extract any year
            year_match = re.search(r"\((\d{4})\)", text)
            # Strip trailing punctuation from fallback author extraction too
            fallback_author = (
                text.split(",")[0].split(".")[0].strip().rstrip(".;:,")
                if "," in text[:40]
                else text[:30].rstrip(".;:,")
            )
            refs.append(
                {
                    "first_author": fallback_author,
                    "year": year_match.group(1) if year_match else "????",
                    "authors_raw": "",
                    "full_text": text[:120],
                }
            )

    return refs


def get_zotero_client(local: bool = False):
    """Get a pyzotero client configured for cloud or local access."""
    try:
        from pyzotero import zotero
    except ImportError:
        print("ERROR: pyzotero not installed. Run: pip install pyzotero==1.11.0")
        sys.exit(2)

    if local:
        zot = zotero.Zotero(0, "user")
        zot.endpoint = "http://localhost:23119/api"
        return zot

    user_id = os.environ.get("ZOTERO_USER_ID")
    api_key = os.environ.get("ZOTERO_API_KEY")
    if not user_id or not api_key:
        print("ERROR: ZOTERO_USER_ID and ZOTERO_API_KEY must be set")
        sys.exit(2)

    zot = zotero.Zotero(int(user_id), "user", api_key)
    base_url = os.environ.get("ZOTERO_BASE_URL")
    if base_url:
        zot.endpoint = base_url.rstrip("/")
    return zot


def find_collection_keys_by_name(zot, target_names: list[str]) -> list[str]:
    """Look up Zotero collection keys by name (case-insensitive substring match).

    Searches all collections in the library and returns keys whose names contain
    any of the target strings.  Falls back to an empty list if the listing fails.
    """
    try:
        all_collections = zot.all_collections()
    except Exception as e:
        print(f"  Warning: could not list Zotero collections: {e}")
        return []

    found = []
    for coll in all_collections:
        name = coll.get("data", {}).get("name", "")
        key = coll.get("data", {}).get("key", "")
        if key and any(t.lower() in name.lower() for t in target_names):
            found.append(key)
    return found


def build_zotero_index(zot, collection_keys: list[str]) -> tuple[dict, int]:
    """Build a lookup index from Zotero items: (last_name_lower, year) -> item.

    Items are deduplicated by their Zotero key so that overlapping parent/child
    collections (e.g. "Website Citations" and its sub-collections) do not cause
    redundant API pagination or inflate the item count.
    """
    index: dict[tuple[str, str], dict] = {}
    seen_item_keys: set[str] = set()
    ingested = 0

    for key in collection_keys:
        try:
            # Fetch all items; filter attachments/notes client-side
            # (the Zotero API itemType param only supports a single type or simple
            # negation, so compound expressions like "-attachment || note" are invalid)
            items = zot.everything(zot.collection_items(key))
            for item in items:
                data = item.get("data", {})
                # Skip attachments and notes — they have no author/year to index.
                # Do this before the deduplication check so seen_item_keys only
                # tracks items that actually contribute to the index.
                if data.get("itemType") in ("attachment", "note"):
                    continue

                # Deduplicate across overlapping parent/child collections
                item_key = item.get("key") or data.get("key", "")
                if item_key in seen_item_keys:
                    continue
                seen_item_keys.add(item_key)
                ingested += 1

                creators = data.get("creators", [])
                date = data.get("date", "")
                year_match = re.search(r"(\d{4})", date)
                year = year_match.group(1) if year_match else ""

                for creator in creators:
                    # Corporate/single-field authors use "name"; personal authors use "lastName".
                    # Strip trailing punctuation to match page extraction normalization.
                    raw_name = creator.get("lastName") or creator.get("name", "")
                    last_name = raw_name.rstrip(".;:,").lower()
                    if last_name and year:
                        lookup_key = (last_name, year)
                        if lookup_key not in index:
                            index[lookup_key] = data
                        break  # Only index by first author
        except Exception as e:
            print(f"  Warning: could not fetch collection {key}: {e}")

    return index, ingested


def validate_page(
    slug: str, refs: list[dict], zotero_index: dict
) -> tuple[list[dict], list[dict]]:
    """Check each reference against the Zotero index.

    Returns:
        A tuple of (unmatched, possible_matches).  ``unmatched`` refs have no
        Zotero entry at all; ``possible_matches`` have a fuzzy year+4-char
        prefix overlap and are reported separately so callers can surface them
        as suggestions rather than treating them as validated (which would hide
        real gaps when different authors share the same name prefix).
    """
    unmatched = []
    possible_matches = []
    for ref in refs:
        first_author_lower = ref["first_author"].lower()
        year = ref["year"]
        lookup = (first_author_lower, year)

        if lookup in zotero_index:
            continue  # Exact match — validated

        # Check for a fuzzy year+prefix match.  Reported as "possible match"
        # rather than treated as validated to avoid false positives.
        found_fuzzy = False
        for (name, yr), _ in zotero_index.items():
            if yr == year and (
                name.startswith(first_author_lower[:4])
                or first_author_lower.startswith(name[:4])
            ):
                found_fuzzy = True
                break
        if found_fuzzy:
            possible_matches.append(ref)
        else:
            unmatched.append(ref)

    return unmatched, possible_matches


def main():
    local = "--local" in sys.argv
    dry_run = "--dry-run" in sys.argv
    verbose = "--verbose" in sys.argv or "-v" in sys.argv

    report_path = os.environ.get(
        "VALIDATION_REPORT_PATH", "bibliography-validation-report.json"
    )

    print("=" * 60)
    print("Bibliography References vs Zotero Validation")
    print("=" * 60)

    # Find all bibliography pages
    pages = sorted(glob.glob("src/app/bibliography-*/page.tsx"))
    print(f"\nFound {len(pages)} bibliography pages")

    # Extract references from all pages
    all_page_refs = {}
    total_refs = 0
    pages_with_refs = 0
    pages_without_refs = 0

    for page in pages:
        slug = os.path.basename(os.path.dirname(page))
        refs = extract_references_from_tsx(page)
        if refs:
            all_page_refs[slug] = refs
            total_refs += len(refs)
            pages_with_refs += 1
        else:
            pages_without_refs += 1
            if verbose:
                print(f"  WARNING: {slug} has no References section")

    print(f"  {pages_with_refs} pages with References ({total_refs} total entries)")
    if pages_without_refs:
        print(f"  {pages_without_refs} pages WITHOUT References")

    if dry_run:
        print("\n--- DRY RUN: Extracted references ---")
        for slug, refs in all_page_refs.items():
            print(f"\n{slug} ({len(refs)} refs):")
            for ref in refs:
                print(f"  [{ref['first_author']}, {ref['year']}] {ref['full_text']}")
        return

    # Connect to Zotero
    print(f"\nConnecting to Zotero ({'local' if local else 'cloud'})...")
    try:
        zot = get_zotero_client(local)
    except SystemExit as exc:
        # Write a minimal error report so CI steps that read it don't crash
        _write_error_report(report_path, pages, pages_with_refs, pages_without_refs, total_refs, "Could not connect to Zotero")
        raise

    # Build index from bibliography collections.
    # Resolution order:
    #   1. ZOTERO_COLLECTION_KEYS env var (comma-separated keys) — explicit override
    #   2. Name-based lookup: find collections whose names contain "Bibliography Series"
    #      or "Website Citations" — resilient to collection recreation
    #   3. Hard-coded default keys — last resort; warns so operators know to update them
    _default_collection_names = ["Bibliography Series", "Website Citations"]
    _default_keys = [
        "CW5CU2Z2",  # Bibliography Branch 1
        "QRAH48GW",  # Bibliography Branch 2
        "4N7NAXWR",  # Website Citations (parent)
        "BIM6DVJ5",  # Individual Technology Adoption Models (source)
        "D3RV9FU5",  # Organizational Technology Adoption Models (source)
    ]
    _env_keys = os.environ.get("ZOTERO_COLLECTION_KEYS", "")
    if _env_keys:
        collection_keys = [k.strip() for k in _env_keys.split(",") if k.strip()]
        print(f"Using {len(collection_keys)} collection key(s) from ZOTERO_COLLECTION_KEYS")
    else:
        # Try name-based resolution first so hard-coded keys don't break when
        # collections are recreated.
        collection_keys = find_collection_keys_by_name(zot, _default_collection_names)
        if collection_keys:
            print(f"  Resolved {len(collection_keys)} collection(s) by name")
        else:
            # Fall back to hard-coded keys — warn so operators know to update them.
            collection_keys = _default_keys
            print("  Warning: name-based collection lookup returned no results; using hard-coded default keys")
            print("  If keys have changed, set ZOTERO_COLLECTION_KEYS to override")

    print("Building Zotero reference index...")
    try:
        zotero_index, item_count = build_zotero_index(zot, collection_keys)
    except Exception as e:
        _write_error_report(report_path, pages, pages_with_refs, pages_without_refs, total_refs, str(e))
        print(f"ERROR building Zotero index: {e}")
        sys.exit(2)

    if item_count == 0:
        error_msg = (
            f"No items fetched from any of the {len(collection_keys)} configured "
            "collection(s). Verify ZOTERO_COLLECTION_KEYS or the default collection keys "
            "are correct for this Zotero library."
        )
        _write_error_report(report_path, pages, pages_with_refs, pages_without_refs, total_refs, error_msg)
        print(f"ERROR: {error_msg}")
        sys.exit(2)

    print(f"  Indexed {len(zotero_index)} unique (author, year) pairs from {item_count} items")

    # Validate each page
    print("\nValidating references...\n")
    total_unmatched = 0
    total_possible = 0
    results = []

    for slug, refs in sorted(all_page_refs.items()):
        unmatched, possible = validate_page(slug, refs, zotero_index)
        results.append(PageResult(slug, len(refs), len(unmatched), unmatched, len(possible), possible))
        total_unmatched += len(unmatched)
        total_possible += len(possible)

        if unmatched or possible or verbose:
            print(f"{'PASS' if not unmatched else 'WARN'} {slug} ({len(refs)} refs, {len(unmatched)} unmatched, {len(possible)} possible)")
            for ref in unmatched:
                print(f"     NOT IN ZOTERO: [{ref['first_author']}, {ref['year']}] {ref['full_text'][:80]}")
            for ref in possible:
                print(f"     POSSIBLE MATCH: [{ref['first_author']}, {ref['year']}] {ref['full_text'][:80]}")

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    # Each ref falls into exactly one of: exact match, fuzzy/possible, unmatched.
    # matched + total_possible + total_unmatched == total_refs
    matched = total_refs - total_unmatched - total_possible
    pct = (matched * 100 // total_refs) if total_refs > 0 else 0
    print(f"Total references: {total_refs}")
    print(f"Matched in Zotero: {matched} ({pct}%)")
    print(f"Possible matches (fuzzy, verify manually): {total_possible}")
    print(f"Unmatched: {total_unmatched}")
    print(f"Pages checked: {len(all_page_refs)}")

    if total_unmatched > 0:
        print(f"\n{'!' * 60}")
        print(f"  {total_unmatched} references need to be added to Zotero")
        print(f"{'!' * 60}")

    # Write JSON report for CI
    report = {
        "total_pages": len(pages),
        "pages_with_refs": pages_with_refs,
        "pages_without_refs": pages_without_refs,
        "total_refs": total_refs,
        "matched": matched,
        "possible_matches": total_possible,
        "unmatched": total_unmatched,
        "possible_match_details": [
            {
                "page": r.slug,
                "ref": f"{ref['first_author']} ({ref['year']})",
                "text": ref["full_text"][:100],
            }
            for r in results
            for ref in r.possible
        ],
        "unmatched_details": [
            {
                "page": r.slug,
                "ref": f"{ref['first_author']} ({ref['year']})",
                "text": ref["full_text"][:100],
            }
            for r in results
            for ref in r.unmatched
        ],
    }

    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    print(f"\nReport written to {report_path}")

    # Exit with warning code if unmatched (non-blocking for now)
    if total_unmatched > 0:
        sys.exit(1)


def _write_error_report(
    report_path: str,
    pages: list,
    pages_with_refs: int,
    pages_without_refs: int,
    total_refs: int,
    error: str,
) -> None:
    """Write a minimal error report so downstream CI steps can always read it."""
    report = {
        "total_pages": len(pages),
        "pages_with_refs": pages_with_refs,
        "pages_without_refs": pages_without_refs,
        "total_refs": total_refs,
        "matched": 0,
        "unmatched": 0,
        "error": error,
        "unmatched_details": [],
    }
    try:
        with open(report_path, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2)
    except OSError as e:
        print(f"Warning: could not write error report to {report_path}: {e}", file=sys.stderr)


if __name__ == "__main__":
    main()
