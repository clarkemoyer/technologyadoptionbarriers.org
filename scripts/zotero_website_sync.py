#!/usr/bin/env python3
"""
Zotero Website Citations Sync
==============================

Scans all TSX/JSON source files in the TABS website for DOIs, then:

1. Creates (or verifies) a top-level Zotero collection "Website Citations"
   with subcollections mirroring the site's content structure.
2. Matches every found DOI to a Zotero library item via the DOI field.
3. Adds matched items to the appropriate subcollection.
4. Prints a report of unmatched DOIs (items that need to be added to Zotero).

Collection structure created:
  Website Citations/
    Bibliography Series/
      Branch 1 — User Adoption Models     (bibliography-1-* pages)
      Branch 2 — Organizational Frameworks (bibliography-2-* pages)
    Articles                               (article-* pages)
    Concept Maps                           (concept-mapping-*.json)
    Results & Analysis                     (results/* pages)

Environment variables (required):
  ZOTERO_API_KEY       — Zotero API key with read/write access to the library
  ZOTERO_LIBRARY_ID    — Numeric Zotero library/group ID
  ZOTERO_LIBRARY_TYPE  — "user" or "group" (default: "user")

Environment variables (optional):
  ZOTERO_DRY_RUN       — When "true", skip Zotero writes (scan + match only)
  REPO_ROOT            — Repository root path (default: parent of this script's dir)
"""

from __future__ import annotations

import os
import re
import sys
from collections import defaultdict
from pathlib import Path
from typing import Optional

# ---------------------------------------------------------------------------
# Helpers for HTML entity and JSX escape variants in DOI strings
# ---------------------------------------------------------------------------

_HTML_ENTITIES = {
    "&lt;": "<",
    "&gt;": ">",
    "&amp;": "&",
    "&#x3C;": "<",
    "&#60;": "<",
}

_DOI_PATTERN = re.compile(
    # Captures the DOI suffix after https://doi.org/, excluding whitespace,
    # quotes, and angle brackets (valid after HTML-entity decoding of the source).
    r"""https?://doi\.org/([^\s"'<>]+)""",
    re.IGNORECASE,
)

# Pattern for DOIs inside href="..." attributes — stops only at quotes so that
# angle-bracket-containing DOIs (e.g. 10.1002/(SICI)…18:7<509::AID…>) are
# captured in full from their unencoded href form.
_HREF_DOI_PATTERN = re.compile(
    r"""href=["']https?://doi\.org/([^"']+)["']""",
    re.IGNORECASE,
)

# ---------------------------------------------------------------------------
# Source classification helpers
# ---------------------------------------------------------------------------

_SRC_DIR_NAME = "src"


def _classify_source(rel_path: str) -> str:
    """Return a subcollection key based on the file path."""
    p = rel_path.replace("\\", "/").lower()
    if "/bibliography-1-" in p:
        return "branch1"
    if "/bibliography-2-" in p:
        return "branch2"
    if "/article-" in p:
        return "articles"
    if "/concept-mapping" in p or "concept-mapping-" in Path(p).name:
        return "concept_maps"
    if "/results/" in p or p.endswith("/results/page.tsx"):
        return "results"
    return "other"


# ---------------------------------------------------------------------------
# DOI extraction from file contents
# ---------------------------------------------------------------------------


def _decode_html_entities(text: str) -> str:
    for entity, char in _HTML_ENTITIES.items():
        text = text.replace(entity, char)
    return text


def _extract_dois_from_text(text: str) -> set[str]:
    """Return normalised DOI suffixes (without the https://doi.org/ prefix).

    Runs two extraction passes:
    1. href="…" attributes — captures DOIs with literal angle brackets intact.
    2. HTML-decoded body text — captures plain-text DOI citations.

    If a shorter DOI is a strict prefix of a longer one (e.g. when the same DOI
    appears both in text content and in an href), only the longer form is kept.
    """
    dois: set[str] = set()

    # Pass 1: extract from raw href attributes — captures DOIs with literal
    # angle brackets (e.g. 10.1002/(SICI)…18:7<509::AID-SMJ882>3.0.CO;2-Z)
    for raw_doi in _HREF_DOI_PATTERN.findall(text):
        doi = raw_doi.rstrip(".,;:)")
        if doi:
            dois.add(doi)

    # Pass 2: extract from HTML-decoded text (inline DOI references)
    decoded = _decode_html_entities(text)
    for raw_doi in _DOI_PATTERN.findall(decoded):
        doi = raw_doi.rstrip(".,;:)")
        if doi:
            dois.add(doi)

    # Remove any DOI that is a strict prefix of another (keep the longer form)
    to_remove: set[str] = set()
    doi_list = sorted(dois, key=len, reverse=True)
    for i, longer in enumerate(doi_list):
        for shorter in doi_list[i + 1 :]:
            if longer.startswith(shorter) and shorter not in to_remove:
                to_remove.add(shorter)
    return dois - to_remove


def _scan_src_files(repo_root: Path) -> dict[str, set[str]]:
    """Walk src/ (TSX) and src/data/ (JSON) and return {doi_suffix: {rel_paths}}.

    After scanning all files, removes any DOI that is a strict prefix of another
    DOI found anywhere in the codebase (keeping the longer, canonical form).
    """
    doi_to_sources: dict[str, set[str]] = defaultdict(set)
    src_dir = repo_root / _SRC_DIR_NAME

    extensions = {".tsx", ".ts", ".json"}
    for path in src_dir.rglob("*"):
        if path.suffix not in extensions:
            continue
        try:
            text = path.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        for doi in _extract_dois_from_text(text):
            rel = str(path.relative_to(repo_root))
            doi_to_sources[doi].add(rel)

    # Global deduplication: remove DOIs that are strict prefixes of longer ones
    all_dois = sorted(doi_to_sources.keys(), key=len, reverse=True)
    to_remove: set[str] = set()
    for i, longer in enumerate(all_dois):
        for shorter in all_dois[i + 1 :]:
            if longer.startswith(shorter) and shorter not in to_remove:
                # Merge the shorter's sources into the longer before removing
                doi_to_sources[longer].update(doi_to_sources[shorter])
                to_remove.add(shorter)
    for doi in to_remove:
        del doi_to_sources[doi]

    return doi_to_sources


def _classify_dois(
    doi_to_sources: dict[str, set[str]],
) -> dict[str, set[str]]:
    """Return {subcollection_key: {doi_suffixes}}."""
    coll: dict[str, set[str]] = defaultdict(set)
    for doi, sources in doi_to_sources.items():
        keys: set[str] = set()
        for src in sources:
            keys.add(_classify_source(src))
        for key in keys:
            coll[key].add(doi)
    return coll


# ---------------------------------------------------------------------------
# Zotero collection management (via pyzotero)
# ---------------------------------------------------------------------------


def _require_env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        print(f"Error: environment variable {name} is required", file=sys.stderr)
        sys.exit(1)
    return value


def _get_or_create_collection(
    zot, parent_key: Optional[str], name: str, dry_run: bool
) -> str:
    """Return the collection key for *name* under *parent_key*, creating if absent."""
    all_collections = zot.collections()
    for col in all_collections:
        data = col.get("data", {})
        if data.get("name") == name and data.get("parentCollection") == (
            parent_key or False
        ):
            return data["key"]

    if dry_run:
        print(f"  [dry-run] Would create collection: '{name}' (parent={parent_key})")
        return f"DRY-{name.upper().replace(' ', '_')}"

    payload = {"name": name}
    if parent_key:
        payload["parentCollection"] = parent_key
    result = zot.create_collections([payload])
    # pyzotero returns {"success": {"0": <key>}, ...}
    key = result.get("success", {}).get("0")
    if not key:
        print(
            f"Warning: Could not determine new collection key for '{name}': {result}",
            file=sys.stderr,
        )
        return ""
    print(f"  Created collection '{name}' → key={key}")
    return key


def _ensure_collection_hierarchy(zot, dry_run: bool) -> dict[str, str]:
    """Create the full Website Citations hierarchy if not present.

    Returns a mapping from logical subcollection key → Zotero collection key.
    """
    print("Ensuring Zotero collection hierarchy…")

    root_key = _get_or_create_collection(zot, None, "Website Citations", dry_run)
    bib_series_key = _get_or_create_collection(
        zot, root_key, "Bibliography Series", dry_run
    )
    branch1_key = _get_or_create_collection(
        zot, bib_series_key, "Branch 1 — User Adoption Models", dry_run
    )
    branch2_key = _get_or_create_collection(
        zot, bib_series_key, "Branch 2 — Organizational Frameworks", dry_run
    )
    articles_key = _get_or_create_collection(zot, root_key, "Articles", dry_run)
    concept_maps_key = _get_or_create_collection(
        zot, root_key, "Concept Maps", dry_run
    )
    results_key = _get_or_create_collection(
        zot, root_key, "Results & Analysis", dry_run
    )
    other_key = _get_or_create_collection(zot, root_key, "Other", dry_run)

    return {
        "root": root_key,
        "branch1": branch1_key,
        "branch2": branch2_key,
        "articles": articles_key,
        "concept_maps": concept_maps_key,
        "results": results_key,
        "other": other_key,
    }


# ---------------------------------------------------------------------------
# DOI → Zotero item matching
# ---------------------------------------------------------------------------


def _build_doi_index(zot) -> dict[str, str]:
    """Fetch all items and return {normalised_doi: item_key}.

    For libraries with thousands of items pyzotero paginates automatically via
    ``zot.everything()``.  Each page is ~100 items; typical TABS library sizes
    are well within practical limits.
    """
    print("Building DOI index from Zotero library…")
    try:
        items = zot.everything(zot.items())
    except Exception as exc:
        print(f"Error fetching items from Zotero: {exc}", file=sys.stderr)
        sys.exit(1)
    doi_index: dict[str, str] = {}
    for item in items:
        data = item.get("data", {})
        raw_doi: str = data.get("DOI", "").strip()
        if not raw_doi:
            # Fall back to scanning the 'url' field for doi.org links
            url: str = data.get("url", "")
            m = _DOI_PATTERN.search(url)
            if m:
                raw_doi = m.group(1)
        if raw_doi:
            doi_index[_normalise_doi(raw_doi)] = data["key"]
    print(f"  Indexed {len(doi_index)} items with DOIs")
    return doi_index


def _normalise_doi(doi: str) -> str:
    """Lower-case and strip whitespace from a DOI for consistent comparison."""
    return doi.strip().lower()


# ---------------------------------------------------------------------------
# Collection membership (add items)
# ---------------------------------------------------------------------------


def _add_items_to_collection(
    zot, collection_key: str, item_keys: list[str], dry_run: bool
) -> None:
    """Add *item_keys* to *collection_key* (skipping if already a member)."""
    if not item_keys:
        return

    # Fetch current members to avoid duplicates
    try:
        existing = zot.everything(zot.collection_items(collection_key))
        existing_keys = {i["data"]["key"] for i in existing}
    except Exception as exc:
        print(
            f"Warning: could not fetch existing members of collection {collection_key}: {exc}",
            file=sys.stderr,
        )
        existing_keys = set()

    to_add = [k for k in item_keys if k not in existing_keys]
    if not to_add:
        return

    if dry_run:
        print(f"    [dry-run] Would add {len(to_add)} item(s) to collection {collection_key}")
        return

    # pyzotero addto_collection accepts a list of item dicts
    item_dicts = [{"key": k} for k in to_add]
    zot.addto_collection(collection_key, item_dicts)
    print(f"    Added {len(to_add)} item(s) to collection {collection_key}")


# ---------------------------------------------------------------------------
# Step summary (GitHub Actions)
# ---------------------------------------------------------------------------


def _write_step_summary(
    total_dois: int,
    matched: int,
    unmatched_dois: list[tuple[str, set[str]]],
    dry_run: bool,
) -> None:
    summary_file = os.environ.get("GITHUB_STEP_SUMMARY")
    if not summary_file:
        return

    mode = "Dry run" if dry_run else "Live"
    lines = [
        "## Zotero Website Citations Sync",
        "",
        f"| Metric | Count |",
        "|---|---:|",
        f"| Mode | {mode} |",
        f"| Unique DOIs found on site | {total_dois} |",
        f"| Matched to Zotero items | {matched} |",
        f"| Unmatched (need Zotero entry) | {len(unmatched_dois)} |",
        "",
    ]

    if unmatched_dois:
        lines += [
            "### Unmatched DOIs",
            "",
            "These DOIs appear on the website but were **not found** in the Zotero library.",
            "Add a Zotero item with the correct DOI field for each one.",
            "",
            "| DOI | Found in |",
            "|---|---|",
        ]
        for doi, sources in sorted(unmatched_dois):
            # Only list up to 3 source files to keep the table readable
            src_list = ", ".join(sorted(sources)[:3])
            if len(sources) > 3:
                src_list += f" (+{len(sources) - 3} more)"
            lines.append(f"| `{doi}` | {src_list} |")
        lines.append("")

    with open(summary_file, "a", encoding="utf-8") as f:
        f.write("\n".join(lines))


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> None:
    # ── Configuration ────────────────────────────────────────────────────────
    api_key = _require_env("ZOTERO_API_KEY")
    library_id = _require_env("ZOTERO_LIBRARY_ID")
    library_type = os.environ.get("ZOTERO_LIBRARY_TYPE", "user").strip() or "user"
    dry_run = os.environ.get("ZOTERO_DRY_RUN", "false").strip().lower() == "true"

    # Repository root: parent of the directory that contains this script
    repo_root_env = os.environ.get("REPO_ROOT", "")
    if repo_root_env:
        repo_root = Path(repo_root_env).resolve()
    else:
        repo_root = Path(__file__).resolve().parent.parent

    print(f"Repository root : {repo_root}")
    print(f"Zotero library  : {library_type}/{library_id}")
    print(f"Dry-run mode    : {dry_run}")
    print()

    # ── Scan source files for DOIs ───────────────────────────────────────────
    print("Scanning source files for DOIs…")
    doi_to_sources = _scan_src_files(repo_root)
    total_dois = len(doi_to_sources)
    print(f"  Found {total_dois} unique DOI(s)")
    if total_dois == 0:
        print("Nothing to sync.")
        return

    doi_by_subcollection = _classify_dois(doi_to_sources)

    # ── Connect to Zotero ────────────────────────────────────────────────────
    try:
        from pyzotero import zotero  # type: ignore[import]
    except ImportError:
        print(
            "Error: pyzotero is not installed. "
            "Run: pip install pyzotero",
            file=sys.stderr,
        )
        sys.exit(1)

    zot = zotero.Zotero(library_id, library_type, api_key)

    # ── Ensure collection hierarchy ──────────────────────────────────────────
    collection_keys = _ensure_collection_hierarchy(zot, dry_run)
    print()

    # ── Build DOI → item key index ───────────────────────────────────────────
    if dry_run:
        doi_index: dict[str, str] = {}
        print("[dry-run] Skipping Zotero item fetch.")
    else:
        doi_index = _build_doi_index(zot)
    print()

    # ── Match and add items ──────────────────────────────────────────────────
    matched_count = 0
    unmatched: list[tuple[str, set[str]]] = []

    for subcol_key, dois in doi_by_subcollection.items():
        zotero_col_key = collection_keys.get(subcol_key) or collection_keys.get("other", "")
        matched_item_keys: list[str] = []
        for doi in dois:
            item_key = doi_index.get(_normalise_doi(doi))
            if item_key:
                matched_item_keys.append(item_key)
                matched_count += 1
            else:
                unmatched.append((doi, doi_to_sources[doi]))

        if zotero_col_key:
            print(
                f"Collection '{subcol_key}': {len(matched_item_keys)} matched"
                f" / {len(dois)} total DOIs"
            )
            _add_items_to_collection(zot, zotero_col_key, matched_item_keys, dry_run)

    print()

    # ── Report ───────────────────────────────────────────────────────────────
    print("=" * 60)
    print(f"Summary")
    print(f"  Total unique DOIs on site : {total_dois}")
    print(f"  Matched to Zotero items   : {matched_count}")
    print(f"  Unmatched (missing)       : {len(unmatched)}")

    if unmatched:
        print()
        print("Unmatched DOIs (not found in Zotero — please add these):")
        for doi, sources in sorted(unmatched):
            src_list = ", ".join(sorted(sources)[:2])
            if len(sources) > 2:
                src_list += f" (+{len(sources) - 2} more)"
            print(f"  https://doi.org/{doi}")
            print(f"    → {src_list}")

    _write_step_summary(total_dois, matched_count, unmatched, dry_run)

    # Exit with non-zero if there are unmatched DOIs so CI can flag them
    if unmatched:
        sys.exit(1)


if __name__ == "__main__":
    main()
