#!/usr/bin/env python3
"""Semantic Scholar monitor for new papers citing TABS core references.

Queries Semantic Scholar for new papers citing or related to the core
references in the TABS Zotero library (e.g. "Website Citations" or
"Smeal Dissertation" collection), then reports papers published in the
last N days that are not already in the Zotero library.

Environment variables (required):
    ZOTERO_API_KEY      -- Zotero API key
    ZOTERO_LIBRARY_ID   -- Zotero library ID (numeric)

Environment variables (optional):
    ZOTERO_LIBRARY_TYPE -- 'user' or 'group' (default: user)
    ZOTERO_COLLECTION   -- Collection name to use as core-reference source
                           (searches all items when absent)
    DAYS_BACK           -- Days to look back for new papers (default: 90)
    MIN_CITATIONS       -- Minimum citation count to include (default: 0)
    TOP_N_REFS          -- Max core references to query (default: 25)
    REPORT_OUTPUT       -- Path to write the markdown report
                           (default: /tmp/ss-report.md)
    S2_API_KEY          -- Semantic Scholar API key (optional; raises the
                           default rate limit from 100 req/5 min to 1 req/s)
"""

from __future__ import annotations

import json
import os
import sys
import time
from datetime import date, timedelta
from pathlib import Path
from typing import Optional
from urllib.error import HTTPError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen

try:
    from pyzotero import zotero as pyzotero
except ImportError:
    print(
        "Error: pyzotero not installed. Run: pip install pyzotero",
        file=sys.stderr,
    )
    sys.exit(1)

# ---------------------------------------------------------------------------
# Semantic Scholar API constants
# ---------------------------------------------------------------------------

S2_BASE = "https://api.semanticscholar.org/graph/v1"
S2_REC_BASE = "https://api.semanticscholar.org/recommendations/v1"

# Fields requested for every paper object
PAPER_FIELDS = (
    "paperId,title,authors,year,publicationDate,"
    "citationCount,externalIds,abstract,url"
)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _require_env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        print(f"Error: {name} is required", file=sys.stderr)
        sys.exit(1)
    return value


def _append_step_summary(content: str) -> None:
    summary_file = os.environ.get("GITHUB_STEP_SUMMARY")
    if not summary_file:
        return
    with open(summary_file, "a", encoding="utf-8") as fh:
        fh.write(content)


def _s2_get(
    path: str,
    params: Optional[dict] = None,
    api_key: Optional[str] = None,
) -> dict:
    """Make a GET request to the Semantic Scholar API with basic retry logic."""
    url = path
    if params:
        url = f"{path}?{urlencode(params)}"

    headers: dict[str, str] = {"Accept": "application/json"}
    if api_key:
        headers["x-api-key"] = api_key

    for attempt in range(3):
        try:
            req = Request(url, headers=headers)
            with urlopen(req, timeout=30) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except HTTPError as exc:
            if exc.code == 429:  # rate-limited
                wait = 15 * (attempt + 1)
                print(f"  Rate-limited — waiting {wait}s before retry…")
                time.sleep(wait)
                continue
            if exc.code == 404:
                return {}
            # Re-raise unexpected HTTP errors
            raise
        except Exception:
            if attempt == 2:
                raise
            time.sleep(5)

    return {}


# ---------------------------------------------------------------------------
# Zotero helpers
# ---------------------------------------------------------------------------


def _get_zotero_dois(
    api_key: str,
    library_id: str,
    library_type: str,
    collection_name: Optional[str],
) -> tuple[list[str], set[str]]:
    """Return (core_dois, all_library_dois).

    *core_dois*  — ordered list of DOIs from the target collection (or all
                   items when no collection is specified), deduped.
    *all_library_dois*  — lowercase DOI set for the entire library, used to
                          skip papers already present.
    """
    zot = pyzotero.Zotero(library_id, library_type, api_key)

    print("  Fetching all library items for cross-check…")
    all_items = zot.everything(zot.items())

    all_dois: set[str] = set()
    for item in all_items:
        doi = item.get("data", {}).get("DOI", "").strip().lower()
        if doi:
            all_dois.add(doi)

    # Determine target item set
    target_items = list(all_items)
    if collection_name:
        print(f"  Looking for collection '{collection_name}'…")
        collections = zot.collections()
        match = next(
            (
                c
                for c in collections
                if c["data"]["name"].lower() == collection_name.lower()
            ),
            None,
        )
        if match:
            col_key = match["key"]
            print(f"  Found collection key {col_key}")
            target_items = zot.everything(zot.collection_items_top(col_key))
        else:
            print(
                f"  Warning: collection '{collection_name}' not found — "
                "using all library items",
                file=sys.stderr,
            )

    # Extract unique DOIs preserving order
    seen: set[str] = set()
    core_dois: list[str] = []
    for item in target_items:
        doi = item.get("data", {}).get("DOI", "").strip()
        if doi and doi.lower() not in seen:
            seen.add(doi.lower())
            core_dois.append(doi)

    return core_dois, all_dois


# ---------------------------------------------------------------------------
# Semantic Scholar helpers
# ---------------------------------------------------------------------------


def _s2_sleep(api_key: Optional[str]) -> None:
    """Sleep to respect Semantic Scholar rate limits.

    Free tier:  100 req / 5 min ≈ 0.33 req/s  → sleep 3 s to be safe.
    Paid tier:  1 req / s                       → sleep 1.1 s to be safe.
    """
    time.sleep(1.1 if api_key else 3.0)


def _get_paper_by_doi(doi: str, api_key: Optional[str]) -> Optional[dict]:
    """Look up a Semantic Scholar paper by DOI; returns None if not found."""
    _s2_sleep(api_key)
    result = _s2_get(
        f"{S2_BASE}/paper/DOI:{quote(doi, safe='')}",
        params={"fields": PAPER_FIELDS},
        api_key=api_key,
    )
    return result if result.get("paperId") else None


def _get_citations(
    paper_id: str,
    api_key: Optional[str],
    limit: int = 100,
) -> list[dict]:
    """Return a list of papers that cite *paper_id*."""
    _s2_sleep(api_key)
    result = _s2_get(
        f"{S2_BASE}/paper/{paper_id}/citations",
        params={"fields": PAPER_FIELDS, "limit": limit},
        api_key=api_key,
    )
    return [
        entry["citingPaper"]
        for entry in result.get("data", [])
        if "citingPaper" in entry
    ]


def _get_recommendations(
    paper_id: str,
    api_key: Optional[str],
    limit: int = 20,
) -> list[dict]:
    """Return related / recommended papers for *paper_id*."""
    _s2_sleep(api_key)
    result = _s2_get(
        f"{S2_REC_BASE}/papers/forpaper/{paper_id}",
        params={"fields": PAPER_FIELDS, "limit": limit},
        api_key=api_key,
    )
    return result.get("recommendedPapers", [])


def _filter_papers(
    papers: list[dict],
    cutoff_date: date,
    min_citations: int,
    library_dois: set[str],
) -> list[dict]:
    """Keep papers that are new, cited enough, and not already in the library."""
    filtered: list[dict] = []
    seen_ids: set[str] = set()

    for paper in papers:
        paper_id = paper.get("paperId")
        if not paper_id or paper_id in seen_ids:
            continue
        seen_ids.add(paper_id)

        # Skip papers already in the Zotero library
        doi = (paper.get("externalIds") or {}).get("DOI", "").lower()
        if doi and doi in library_dois:
            continue

        # Citation count gate
        if (paper.get("citationCount") or 0) < min_citations:
            continue

        # Publication date gate — prefer precise date, fall back to year
        pub_date_str = paper.get("publicationDate") or ""
        if pub_date_str:
            try:
                # Guard against strings shorter than 10 chars before slicing
                date_prefix = pub_date_str[:10] if len(pub_date_str) >= 10 else pub_date_str
                pub_date = date.fromisoformat(date_prefix)
                if pub_date < cutoff_date:
                    continue
            except ValueError:
                pass  # malformed date — keep the paper
        elif paper.get("year"):
            if paper["year"] < cutoff_date.year:
                continue
        else:
            # No date information — skip to avoid stale results
            continue

        filtered.append(paper)

    return filtered


# ---------------------------------------------------------------------------
# Report formatting
# ---------------------------------------------------------------------------


def _format_paper(paper: dict) -> str:
    """Format a single paper as a Markdown block."""
    title = paper.get("title") or "Untitled"
    authors = paper.get("authors") or []
    author_str = ", ".join(a.get("name", "") for a in authors[:3])
    if len(authors) > 3:
        author_str += " et al."
    year = paper.get("year") or "n.d."
    doi = (paper.get("externalIds") or {}).get("DOI", "")
    citations = paper.get("citationCount") or 0
    url = paper.get("url") or ""
    abstract = paper.get("abstract") or ""
    if len(abstract) > 300:
        abstract = abstract[:297] + "…"

    lines: list[str] = [f"**{title}**"]
    lines.append(f"_{author_str}_ ({year}) · {citations} citations")

    if doi:
        lines.append(f"DOI: [{doi}](https://doi.org/{doi})")
        lines.append(
            f"[📎 Add to Zotero](https://www.zotero.org/save?type=doi&q={quote(doi, safe='')})"
        )
    elif url:
        lines.append(f"[View paper]({url})")

    if abstract:
        lines.append(f"> {abstract}")

    return "\n".join(lines)


def _build_report(
    results: dict[str, dict],
    days_back: int,
    run_date: date,
    cutoff_date: date,
    n_queried: int,
) -> str:
    """Assemble the full Markdown report."""
    total_new = sum(
        len(v["citing"]) + len(v["related"]) for v in results.values()
    )

    lines: list[str] = [
        f"## 🔬 Semantic Scholar Monitor — {run_date.isoformat()}",
        "",
        (
            f"Queried **{n_queried}** core references · "
            f"Looking back **{days_back} days** (since {cutoff_date}) · "
            f"**{total_new}** new papers found"
        ),
        "",
    ]

    if total_new == 0:
        lines.append(
            "_No new papers matched the filter criteria for this period._"
        )
        return "\n".join(lines)

    for ref_doi, data in results.items():
        ref_title = data["title"]
        citing = data["citing"]
        related = data["related"]

        if not citing and not related:
            continue

        lines += [
            "---",
            "",
            f"### 📄 {ref_title}",
            f"Core reference DOI: `{ref_doi}`",
            "",
        ]

        if citing:
            lines.append(f"#### New Citing Papers ({len(citing)})\n")
            for paper in citing:
                lines.append(_format_paper(paper))
                lines.append("")

        if related:
            lines.append(f"#### Related / Recommended Papers ({len(related)})\n")
            for paper in related:
                lines.append(_format_paper(paper))
                lines.append("")

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> int:
    api_key = _require_env("ZOTERO_API_KEY")
    library_id = _require_env("ZOTERO_LIBRARY_ID")
    library_type = os.environ.get("ZOTERO_LIBRARY_TYPE", "user").strip() or "user"
    collection_name = os.environ.get("ZOTERO_COLLECTION", "").strip() or None
    days_back = int(os.environ.get("DAYS_BACK") or "90")
    min_citations = int(os.environ.get("MIN_CITATIONS") or "0")
    top_n = int(os.environ.get("TOP_N_REFS") or "25")
    report_output = os.environ.get("REPORT_OUTPUT") or "/tmp/ss-report.md"
    s2_api_key = os.environ.get("S2_API_KEY", "").strip() or None

    cutoff_date = date.today() - timedelta(days=days_back)
    run_date = date.today()

    print(f"Semantic Scholar Monitor — {run_date.isoformat()}")
    print(f"  Library type : {library_type} / {library_id}")
    print(f"  Collection   : {collection_name or '(all items)'}")
    print(f"  Look-back    : {days_back} days (since {cutoff_date})")
    print(f"  Min citations: {min_citations}")
    print(f"  Max refs     : {top_n}")
    print(f"  S2 API key   : {'yes' if s2_api_key else 'no (free tier)'}")

    # ------------------------------------------------------------------
    # Step 1: Fetch Zotero core references and full library DOI set
    # ------------------------------------------------------------------
    print("\n[1/3] Fetching Zotero library…")
    core_dois, library_dois = _get_zotero_dois(
        api_key, library_id, library_type, collection_name
    )

    print(
        f"  {len(core_dois)} DOIs in target collection, "
        f"{len(library_dois)} total in library"
    )

    if not core_dois:
        print("Warning: no DOIs found — nothing to monitor.", file=sys.stderr)
        report = (
            f"## 🔬 Semantic Scholar Monitor — {run_date.isoformat()}\n\n"
            "No DOIs found in the specified Zotero collection."
        )
        Path(report_output).parent.mkdir(parents=True, exist_ok=True)
        Path(report_output).write_text(report, encoding="utf-8")
        _append_step_summary(
            "## Semantic Scholar Monitor\n\n"
            "⚠️ No DOIs found in Zotero collection — no report generated.\n"
        )
        return 0

    core_dois = core_dois[:top_n]
    print(f"  Using top {len(core_dois)} core references")

    # ------------------------------------------------------------------
    # Step 2: Query Semantic Scholar
    # ------------------------------------------------------------------
    print(f"\n[2/3] Querying Semantic Scholar for {len(core_dois)} papers…")
    results: dict[str, dict] = {}

    for i, doi in enumerate(core_dois, 1):
        print(f"  [{i:2d}/{len(core_dois)}] {doi}")

        s2_paper = _get_paper_by_doi(doi, s2_api_key)
        if not s2_paper:
            print("         → not found on Semantic Scholar")
            continue

        paper_id = s2_paper["paperId"]
        paper_title = s2_paper.get("title") or doi
        total_cites = s2_paper.get("citationCount") or 0
        print(
            f"         → '{paper_title[:55]}…' "
            f"({total_cites} total citations)"
        )

        # Citing papers
        raw_citing = _get_citations(paper_id, s2_api_key)
        citing_filtered = _filter_papers(
            raw_citing, cutoff_date, min_citations, library_dois
        )
        print(
            f"         citations: {len(raw_citing)} total, "
            f"{len(citing_filtered)} new matches"
        )

        # Related / recommended papers
        raw_related = _get_recommendations(paper_id, s2_api_key)
        related_filtered = _filter_papers(
            raw_related, cutoff_date, min_citations, library_dois
        )
        print(
            f"         related  : {len(raw_related)} total, "
            f"{len(related_filtered)} new matches"
        )

        if citing_filtered or related_filtered:
            results[doi] = {
                "title": paper_title,
                "citing": citing_filtered,
                "related": related_filtered,
            }

    # ------------------------------------------------------------------
    # Step 3: Build and write report
    # ------------------------------------------------------------------
    total_new = sum(
        len(v["citing"]) + len(v["related"]) for v in results.values()
    )
    print(f"\n[3/3] Building report — {total_new} new papers total…")

    report = _build_report(results, days_back, run_date, cutoff_date, len(core_dois))

    out_path = Path(report_output)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(report, encoding="utf-8")
    print(f"  Report written to {report_output}")

    # GitHub Actions step summary
    _append_step_summary(
        "## Semantic Scholar Monitor\n\n"
        f"| Metric | Value |\n"
        f"|--------|-------|\n"
        f"| Core references queried | {len(core_dois)} |\n"
        f"| Library DOIs (cross-check) | {len(library_dois)} |\n"
        f"| New papers found | {total_new} |\n"
        f"| Look-back period | {days_back} days (since {cutoff_date}) |\n"
        f"| Refs with new papers | {len(results)} |\n"
    )

    print("Done.")
    return total_new


if __name__ == "__main__":
    main()
