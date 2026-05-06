#!/usr/bin/env python3
"""
Validate bibliography page references against the Zotero library.

This script:
1. Extracts author-year pairs from each bibliography page's References <ol>
2. Queries Zotero (cloud or local API) for matching items
3. Reports unmatched references that need to be added to Zotero

Usage:
  python scripts/validate-bibliography-references.py          # cloud API (CI)
  python scripts/validate-bibliography-references.py --local   # local Zotero desktop

Environment (cloud mode):
  ZOTERO_API_KEY   - API key
  ZOTERO_USER_ID   - User ID (1527234)

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
            # Get first author last name
            first_author = authors.split(",")[0].strip()
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
            refs.append(
                {
                    "first_author": text.split(",")[0].split(".")[0].strip()
                    if "," in text[:40]
                    else text[:30],
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

    return zotero.Zotero(int(user_id), "user", api_key)


def build_zotero_index(zot, collection_keys: list[str]) -> dict:
    """Build a lookup index from Zotero items: (last_name_lower, year) -> item."""
    index = {}
    all_items = []

    for key in collection_keys:
        try:
            # Fetch all items; filter attachments/notes client-side
            # (the Zotero API itemType param only supports a single type or simple
            # negation, so compound expressions like "-attachment || note" are invalid)
            items = zot.everything(zot.collection_items(key))
            all_items.extend(items)
        except Exception as e:
            print(f"  Warning: could not fetch collection {key}: {e}")

    for item in all_items:
        data = item.get("data", {})
        # Skip attachments and notes — they have no author/year to index
        if data.get("itemType") in ("attachment", "note"):
            continue
        creators = data.get("creators", [])
        date = data.get("date", "")
        year_match = re.search(r"(\d{4})", date)
        year = year_match.group(1) if year_match else ""

        for creator in creators:
            # Corporate/single-field authors use "name"; personal authors use "lastName"
            last_name = (creator.get("lastName") or creator.get("name", "")).lower()
            if last_name and year:
                lookup_key = (last_name, year)
                if lookup_key not in index:
                    index[lookup_key] = data
                break  # Only index by first author

    return index, len(all_items)


def validate_page(
    slug: str, refs: list[dict], zotero_index: dict
) -> list[dict]:
    """Check each reference against the Zotero index. Return unmatched."""
    unmatched = []
    for ref in refs:
        first_author_lower = ref["first_author"].lower()
        year = ref["year"]
        lookup = (first_author_lower, year)

        if lookup not in zotero_index:
            # Try partial match (in case of name variants)
            found = False
            for (name, yr), _ in zotero_index.items():
                if yr == year and (
                    name.startswith(first_author_lower[:4])
                    or first_author_lower.startswith(name[:4])
                ):
                    found = True
                    break
            if not found:
                unmatched.append(ref)

    return unmatched


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

    # Build index from bibliography collections
    collection_keys = [
        "CW5CU2Z2",  # Bibliography Branch 1
        "QRAH48GW",  # Bibliography Branch 2
        "4N7NAXWR",  # Website Citations (parent)
        "BIM6DVJ5",  # Individual Technology Adoption Models (source)
        "D3RV9FU5",  # Organizational Technology Adoption Models (source)
    ]

    print("Building Zotero reference index...")
    try:
        zotero_index, item_count = build_zotero_index(zot, collection_keys)
    except Exception as e:
        _write_error_report(report_path, pages, pages_with_refs, pages_without_refs, total_refs, str(e))
        print(f"ERROR building Zotero index: {e}")
        sys.exit(2)
    print(f"  Indexed {len(zotero_index)} unique (author, year) pairs from {item_count} items")

    # Validate each page
    print("\nValidating references...\n")
    total_unmatched = 0
    results = []

    for slug, refs in sorted(all_page_refs.items()):
        unmatched = validate_page(slug, refs, zotero_index)
        results.append((slug, len(refs), len(unmatched), unmatched))
        total_unmatched += len(unmatched)

        if unmatched or verbose:
            print(f"{'PASS' if not unmatched else 'WARN'} {slug} ({len(refs)} refs, {len(unmatched)} unmatched)")
            for ref in unmatched:
                print(f"     NOT IN ZOTERO: [{ref['first_author']}, {ref['year']}] {ref['full_text'][:80]}")

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    matched = total_refs - total_unmatched
    pct = (matched * 100 // total_refs) if total_refs > 0 else 0
    print(f"Total references: {total_refs}")
    print(f"Matched in Zotero: {matched} ({pct}%)")
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
        "unmatched": total_unmatched,
        "unmatched_details": [
            {
                "page": slug,
                "ref": f"{ref['first_author']} ({ref['year']})",
                "text": ref["full_text"][:100],
            }
            for slug, _, _, unmatched in results
            for ref in unmatched
        ],
    }

    with open(report_path, "w") as f:
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
        with open(report_path, "w") as f:
            json.dump(report, f, indent=2)
    except OSError as e:
        print(f"Warning: could not write error report to {report_path}: {e}", file=sys.stderr)


if __name__ == "__main__":
    main()
