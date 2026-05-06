#!/usr/bin/env python3
"""
TABS CRP Appendix Validation Script
====================================
Repeatable validator that checks all appendix markdown files against
the actual deployed Moment in Time Capture PDFs and cross-references
between appendixes.

Usage:
    python3 validate_appendixes.py
    python3 validate_appendixes.py --workspace /path/to/CRP-workspace
    CRP_WORKSPACE=~/Documents/CRP-workspace python3 validate_appendixes.py

Workspace discovery follows the precedence in
``scripts/crp-document-tools/paths.py``: --workspace flag > CRP_WORKSPACE
env > ~/Documents/CRP-workspace or ~/CRP-workspace > legacy /sessions/* +
/tmp/tabs-crp-workspace > bundled fixture (last resort).

Outputs a structured convergence report showing:
- Actual page counts from PDFs vs. claimed page counts in each appendix
- Word counts for each appendix markdown
- Cross-reference consistency between appendixes
- Capture completeness (DOCX/PDF/MD present for each)
- Stale or inconsistent numbers

Requires: pypdf (pip install pypdf)
"""

import argparse
import glob
import os
import re
import sys
from datetime import datetime

# Try importing pypdf
try:
    from pypdf import PdfReader
except ImportError:
    print("ERROR: pypdf not installed. Run: pip install pypdf  (inside a virtualenv or with pipx)")
    sys.exit(1)

# Shared portable workspace discovery (replaces the old hardcoded
# /sessions/*/... globs). See scripts/crp-document-tools/paths.py.
_SUBTREE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _SUBTREE_DIR not in sys.path:
    sys.path.insert(0, _SUBTREE_DIR)
from paths import (  # noqa: E402
    CrpWorkspaceNotFound,
    find_appendix_dir as _find_appendix_dir,
    find_workspace as _find_workspace_shared,
    parse_filename_date,
)

# =============================================================================
# Configuration (resolved at runtime in main)
# =============================================================================

# APPENDIX_DIR and CRP_ROOT are resolved from CLI args / workspace discovery in main().
# Do not hard-code session-specific paths here.
APPENDIX_DIR = None

# The latest timestamp for each capture (the "current" version)
# Updated manually when new captures are built
CAPTURE_CONFIGS = {
    "survey_instrument": {
        "folder": "TABS Survey Instrument - Moment in Time Capture",
        "timestamp": "4-16-2026 0109 EST",
        "appendix": "A",
        "short_name": "Survey Instrument",
    },
    "platform_documentation": {
        "folder": "TABS Platform Documentation - Moment in Time Capture",
        "timestamp": "4-16-2026 0054 EST",
        "appendix": "B",
        "short_name": "Platform Documentation",
    },
    "blog_series": {
        "folder": "TABS Scholarly Blog Series - Moment in Time Capture",
        "timestamp": "4-16-2026 0054 EST",
        "appendix": "B",
        "short_name": "Scholarly Blog Series",
    },
    "bibliography": {
        "folder": "TABS Bibliography Encyclopedia - Moment in Time Capture",
        "timestamp": "4-16-2026 0054 EST",
        "appendix": "B",
        "short_name": "Bibliography Encyclopedia",
    },
    "persona_pages": {
        "folder": "TABS Persona Pages - Moment in Time Capture",
        "timestamp": "4-16-2026 0054 EST",
        "appendix": "B",
        "short_name": "Persona Pages",
    },
    "teaching_series": {
        "folder": "TABS Teaching Series - Moment in Time Capture",
        "timestamp": "4-16-2026 0054 EST",
        "appendix": "B",
        "short_name": "Teaching Series",
    },
    "analysis_report": {
        "folder": "TABS V2 Comprehensive Analysis Report - Moment in Time Capture",
        "timestamp": "4-16-2026 0054 EST",
        "appendix": "C",
        "short_name": "Comprehensive Analysis Report",
    },
    "analysis_scripts": {
        "folder": "TABS V2 Reproducible Analysis Scripts - Moment in Time Capture",
        "timestamp": "4-16-2026 0054 EST",
        "appendix": "C",
        "short_name": "Reproducible Analysis Scripts",
    },
}

# Appendix markdown files (glob pattern -> latest by filename date)
APPENDIX_FILES = {
    "A": None,  # Will be discovered
    "B": None,
    "C": None,
    "D": None,
    "Plan": None,
}

# =============================================================================
# Discovery
# =============================================================================


def discover_appendix_files():
    """Find the latest version of each appendix markdown using date-aware selection.

    Accepts two naming conventions:
      - Long form:  ``Appendix A ...md``, ``Appendix Project Plan ...md``
      - Short form: ``A_...md``, ``B_...md``, ``C_...md``, ``D_...md``

    The fixture workspace and the subtree README use the short form; the author's
    private workspace uses the long form. We accept both so the validator works
    against either layout without requiring a rename.

    If required appendixes (A-D) are still missing after discovery, a clear
    warning is printed so the user knows the report is incomplete.
    """
    global APPENDIX_FILES
    # Group candidates by appendix letter, then pick the one with the newest timestamp.
    buckets = {"A": [], "B": [], "C": [], "D": [], "Plan": []}
    for f in os.listdir(APPENDIX_DIR):
        if not f.endswith(".md"):
            continue
        path = os.path.join(APPENDIX_DIR, f)
        # Long form: "Appendix A ...", "Appendix B ...", etc.
        if f.startswith("Appendix A"):
            buckets["A"].append(path)
        elif f.startswith("Appendix B"):
            buckets["B"].append(path)
        elif f.startswith("Appendix C"):
            buckets["C"].append(path)
        elif f.startswith("Appendix D"):
            buckets["D"].append(path)
        elif f.startswith("Appendix Project Plan"):
            buckets["Plan"].append(path)
        # Short form: "A_...", "B_...", "C_...", "D_..."
        elif f.startswith("A_"):
            buckets["A"].append(path)
        elif f.startswith("B_"):
            buckets["B"].append(path)
        elif f.startswith("C_"):
            buckets["C"].append(path)
        elif f.startswith("D_"):
            buckets["D"].append(path)

    for key, paths in buckets.items():
        if paths:
            # Parse the embedded timestamp first; fall back to file mtime when
            # parse_filename_date returns (0,0,0,0) (no recognisable timestamp in
            # the filename) so selection is deterministic regardless of listdir order.
            APPENDIX_FILES[key] = max(
                paths,
                key=lambda p: (parse_filename_date(os.path.basename(p)), os.path.getmtime(p)),
            )

    # Warn if any required appendix was not found so the report is not misleading.
    missing = [letter for letter in ("A", "B", "C", "D") if APPENDIX_FILES[letter] is None]
    if missing:
        msg = (
            f"WARNING: Could not find appendix markdown for: {', '.join(missing)}. "
            "Checks for these appendixes will be skipped. "
            "Ensure the appendix directory contains files named "
            "'Appendix {X} ...' or '{X}_...'."
        )
        print(msg, file=sys.stderr)


# =============================================================================
# PDF Page Counting
# =============================================================================

def count_pdf_pages(pdf_path):
    """Count pages in a PDF file."""
    try:
        reader = PdfReader(pdf_path)
        return len(reader.pages)
    except Exception as e:
        return f"ERROR: {e}"


def count_pdf_hyperlinks(pdf_path):
    """Count external hyperlinks in a PDF.

    Pages with no annotations are common and legitimate; pypdf may return
    None (or another non-iterable) from ``page.get('/Annots', [])`` for
    such pages. We guard explicitly so a no-annotations page is treated
    as zero links rather than spuriously returning an ERROR string.
    """
    try:
        reader = PdfReader(pdf_path)
        ext_links = 0
        for page in reader.pages:
            annots = page.get('/Annots', [])
            if annots is None:
                continue
            try:
                annot_iter = iter(annots)
            except TypeError:
                # Not iterable - treat as a page with no annotations.
                continue
            for a in annot_iter:
                try:
                    o = a.get_object()
                    if o.get('/Subtype') == '/Link':
                        if '/A' in o and o['/A'].get('/URI'):
                            ext_links += 1
                except Exception:
                    # Skip unparseable annotation objects (corrupt or non-standard)
                    pass
        return ext_links
    except Exception as e:
        return f"ERROR: {e}"


# =============================================================================
# Capture Validation
# =============================================================================

def _resolve_capture_file(folder_path, base_root, ts, ext):
    """Resolve a capture file by exact timestamp, then fall back to glob.

    The CAPTURE_CONFIGS table records EST timestamps, but the builders use
    America/New_York which emits 'EDT' during daylight saving time. So an
    exact-name lookup can miss perfectly valid newer captures. Fall back
    to globbing '<base_root> (* EST|EDT).<ext>' and picking the newest by
    embedded date/time.
    """
    exact = os.path.join(folder_path, f"{base_root} ({ts}).{ext}")
    if os.path.exists(exact):
        return exact, ts
    pattern = os.path.join(folder_path, f"{base_root} (*).{ext}")
    candidates = glob.glob(pattern)
    if not candidates:
        return exact, ts  # path doesn't exist; preserve original for error msg
    # Use parse_filename_date as primary key; fall back to mtime when the
    # filename lacks a parseable timestamp (returns (0,0,0,0)) so the choice
    # is deterministic regardless of glob() ordering.
    chosen = max(
        candidates,
        key=lambda p: (parse_filename_date(os.path.basename(p)), os.path.getmtime(p)),
    )
    # Recover the timestamp string from the chosen filename
    m = re.search(r'\(([^)]+\s+(?:EST|EDT))\)\.[a-z]+$', chosen)
    return chosen, (m.group(1) if m else ts)


def validate_captures():
    """Check each capture bundle: PDF exists, page count, formats present."""
    results = []

    for key, cfg in CAPTURE_CONFIGS.items():
        folder_path = os.path.join(APPENDIX_DIR, cfg["folder"])
        ts = cfg["timestamp"]
        base_root = cfg['folder'].replace(' - Moment in Time Capture', '') + ' - Moment in Time Capture'

        docx_path, _ = _resolve_capture_file(folder_path, base_root, ts, "docx")
        pdf_path, pdf_ts = _resolve_capture_file(folder_path, base_root, ts, "pdf")
        md_path, _ = _resolve_capture_file(folder_path, base_root, ts, "md")

        result = {
            "key": key,
            "short_name": cfg["short_name"],
            "appendix": cfg["appendix"],
            "timestamp": pdf_ts,  # report the actual timestamp located on disk
            "docx_exists": os.path.exists(docx_path),
            "pdf_exists": os.path.exists(pdf_path),
            "md_exists": os.path.exists(md_path),
            "pdf_pages": None,
            "pdf_links": None,
        }

        if result["pdf_exists"]:
            result["pdf_pages"] = count_pdf_pages(pdf_path)
            result["pdf_links"] = count_pdf_hyperlinks(pdf_path)
            # Normalize errors to strings for uniform downstream handling
            if isinstance(result["pdf_links"], str) and result["pdf_links"].startswith("ERROR"):
                result["pdf_links_error"] = result["pdf_links"]
                result["pdf_links"] = None

        results.append(result)

    return results


# =============================================================================
# Text Extraction from Markdown
# =============================================================================

def count_words(text):
    """Count words in markdown text, excluding table formatting."""
    # Drop entire table-separator lines (e.g. "| --- | :--- | ---: |")
    # before any other processing so multi-column separators are handled.
    lines = text.splitlines()
    lines = [ln for ln in lines if not re.match(r'^\s*\|[\s|:*-]+\|\s*$', ln)]
    text = '\n'.join(lines)
    # Remove URLs
    text = re.sub(r'https?://\S+', '', text)
    # Remove markdown formatting characters (incl. remaining pipe characters
    # that are part of table cells, not separators)
    text = re.sub(r'[#*_|`~\[\]()]', ' ', text)
    words = text.split()
    return len(words)


# =============================================================================
# Cross-Reference Checks
# =============================================================================

def check_cross_references(appendix_texts):
    """Check that cross-references between appendixes are consistent."""
    findings = []

    # Define expected cross-references.
    # Each tuple: (from_appendix, should_reference, description, required)
    # required=True  -> status MISSING if not found (hard expectation)
    # required=False -> status OPTIONAL if not found (soft/informational)
    expected_refs = [
        ("A", "C",   "Appendix A should reference Appendix C for psychometric validation",             True),
        ("A", "C.1", "Appendix A should reference C.1 for Comprehensive Analysis Report",              True),
        ("B", "C",   "Appendix B should reference Appendix C for data quality pipeline",               True),
        ("B", "C.2", "Appendix B should reference C.2 for reproducible analysis scripts",              True),
        ("B", "A",   "Appendix B (B.7) should reference Appendix A for concept mapping",               True),
        ("B", "D.2", "Appendix B should reference D.2 for IRB",                                        True),
        ("C", "B",   "Appendix C could cross-reference Appendix B for platform context",               False),
        ("D", "B",   "Appendix D could cross-reference Appendix B for data archive",                   False),
    ]

    for from_app, ref_target, description, required in expected_refs:
        if from_app not in appendix_texts:
            continue
        text_lower = appendix_texts[from_app].lower()

        # Use regex with word boundaries to avoid false positives such as
        # "C.10" matching a search for "C.1".  The patterns use re.escape()
        # so dots and other special characters are treated as literals.
        ref_lower = ref_target.lower()
        full_pattern = re.compile(
            r'\bappendix\s+' + re.escape(ref_lower) + r'\b', re.IGNORECASE
        )
        patterns_re = [full_pattern]
        if "." in ref_target:
            # Also accept bare sub-reference (e.g. "c.1") bounded by non-word chars
            bare_pattern = re.compile(
                r'(?<![.\w])' + re.escape(ref_lower) + r'(?![.\w])', re.IGNORECASE
            )
            patterns_re.append(bare_pattern)

        found = any(p.search(text_lower) for p in patterns_re)
        status = "PASS" if found else ("MISSING" if required else "OPTIONAL")
        findings.append({
            "from": from_app,
            "to": ref_target,
            "description": description,
            "required": required,
            "found": found,
            "status": status,
        })

    return findings


# =============================================================================
# Number Consistency Check
# =============================================================================

def check_number_consistency(appendix_texts):
    """Check that key numbers are consistent across all appendixes."""
    findings = []

    # Key numbers that should be consistent everywhere
    checks = [
        {
            "name": "Frozen CRP dataset size",
            "expected": "N=200",
            "pattern": r"N\s*=\s*200",
        },
        {
            "name": "Prolific Study ID",
            "expected": "[24-char hex study ID ending ...2da5]",
            # Match any 24-char lowercase hex string ending in the known suffix.
            # Using a suffix-only anchor avoids embedding the full ID in version
            # control (where it could be confused with a participant PID).
            "pattern": r"[0-9a-f]{17}ead2da5",
        },
        {
            "name": "Payment per response",
            "expected": "$7.00",
            "pattern": r"\$7\.00",
        },
        {
            "name": "IRB Study ID",
            "expected": "STUDY00027125",
            "pattern": r"STUDY00027125",
        },
        {
            "name": "CI/CD workflow count",
            "expected": "39",
            "pattern": r"(?<!\d)39\s+(?:CI/CD\s+)?workflows",
        },
        {
            "name": "Blog article count",
            "expected": "18",
            "pattern": r"(?<!\d)18\s+(?:blog\s+)?articles",
        },
        {
            "name": "Bibliography profile count",
            "expected": "42",
            "pattern": r"(?<!\d)42\s+(?:annotated\s+)?(?:model\s+)?profiles",
        },
        {
            "name": "Validation check count (CRP)",
            "expected": "277",
            "pattern": r"(?<!\d)277\s+(?:CRP\s+)?(?:body\s+)?checks",
        },
        {
            "name": "Median completion time",
            "expected": "691 seconds",
            "pattern": r"(?<!\d)691\s*(?:s(?:econds)?|sec)",
        },
        {
            "name": "Duration threshold",
            "expected": "480 seconds",
            "pattern": r"(?<!\d)480\s*(?:s(?:econds)?|sec)",
        },
    ]

    for check in checks:
        appearances = {}
        for app_id, text in appendix_texts.items():
            matches = re.findall(check["pattern"], text, re.IGNORECASE)
            if matches:
                appearances[app_id] = len(matches)
        findings.append({
            "name": check["name"],
            "expected": check["expected"],
            "found_in": appearances,
        })

    return findings


# =============================================================================
# Stale Content Checks
# =============================================================================

def check_stale_content(appendix_texts):
    """Flag potentially stale content."""
    findings = []

    # Check for "TBD" in non-Plan files
    for app_id, text in appendix_texts.items():
        if app_id == "Plan":
            continue
        tbd_count = len(re.findall(r'\bTBD\b', text))
        if tbd_count > 0:
            findings.append({
                "appendix": app_id,
                "issue": f"Contains {tbd_count} 'TBD' placeholder(s)",
                "severity": "MODERATE",
            })

    # Check for strikethrough in non-final drafts
    for app_id, text in appendix_texts.items():
        strikethrough_count = len(re.findall(r'~~[^~]+~~', text))
        if strikethrough_count > 0:
            findings.append({
                "appendix": app_id,
                "issue": f"Contains {strikethrough_count} strikethrough section(s) - drafts should use clean text",
                "severity": "MINOR",
            })

    # Check for "as of" dates that may be stale
    for app_id, text in appendix_texts.items():
        for match in re.finditer(r'as of\s+(\d{1,2}[-/]\d{1,2}[-/]\d{4}|\w+\s+\d{1,2},?\s+\d{4})', text, re.IGNORECASE):
            findings.append({
                "appendix": app_id,
                "issue": f"Date-stamped claim: '{match.group(0)}' - verify still current",
                "severity": "INFO",
            })

    return findings


# =============================================================================
# Main Report Generator
# =============================================================================

def main():
    global APPENDIX_DIR

    parser = argparse.ArgumentParser(description="TABS CRP Appendix Validator")
    parser.add_argument("--workspace", help="Path to CRP workspace root (auto-discovered if omitted)")
    args = parser.parse_args()

    workspace = args.workspace
    try:
        resolved_workspace = _find_workspace_shared(explicit=workspace if workspace else None)
        APPENDIX_DIR = _find_appendix_dir(resolved_workspace)
    except CrpWorkspaceNotFound as exc:
        print(f"ERROR: {exc}")
        sys.exit(1)

    print("=" * 80)
    print("TABS CRP APPENDIX VALIDATION REPORT")
    print(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Appendix dir: {APPENDIX_DIR}")
    print("=" * 80)

    # Discover files
    discover_appendix_files()

    print("\n--- APPENDIX FILES DISCOVERED ---")
    for app_id, path in APPENDIX_FILES.items():
        if path:
            print(f"  [{app_id}] {os.path.basename(path)}")
        else:
            print(f"  [{app_id}] NOT FOUND")

    # Read appendix texts
    appendix_texts = {}
    appendix_word_counts = {}
    for app_id, path in APPENDIX_FILES.items():
        if path and os.path.exists(path):
            with open(path, encoding='utf-8') as f:
                text = f.read()
            appendix_texts[app_id] = text
            appendix_word_counts[app_id] = count_words(text)

    # =========================================================================
    # SECTION 1: Capture Bundle Completeness & Actual Page Counts
    # =========================================================================
    print("\n" + "=" * 80)
    print("SECTION 1: CAPTURE BUNDLE VALIDATION")
    print("=" * 80)

    capture_results = validate_captures()
    actual_pages = {}
    total_pages = 0
    total_links = 0

    for r in capture_results:
        actual_pages[r["key"]] = r["pdf_pages"]
        status_parts = []
        if not r["docx_exists"]:
            status_parts.append("MISSING DOCX")
        if not r["pdf_exists"]:
            status_parts.append("MISSING PDF")
        if not r["md_exists"]:
            status_parts.append("MISSING MD")

        format_status = "ALL FORMATS" if not status_parts else ", ".join(status_parts)
        page_str = str(r["pdf_pages"]) if isinstance(r["pdf_pages"], int) else r["pdf_pages"] or "N/A"
        link_str = str(r["pdf_links"]) if isinstance(r["pdf_links"], int) else r["pdf_links"] or "N/A"

        if isinstance(r["pdf_pages"], int):
            total_pages += r["pdf_pages"]
        if isinstance(r["pdf_links"], int):
            total_links += r["pdf_links"]

        print(f"\n  [{r['appendix']}] {r['short_name']}")
        print(f"      Timestamp: {r['timestamp']}")
        print(f"      Formats:   {format_status}")
        print(f"      Pages:     {page_str}")
        print(f"      Links:     {link_str}")

    print(f"\n  TOTAL PAGES (all active captures): {total_pages}")
    print(f"  TOTAL HYPERLINKS: {total_links}")

    # =========================================================================
    # SECTION 2: Page Count Claims vs. Actual
    # =========================================================================
    print("\n" + "=" * 80)
    print("SECTION 2: PAGE COUNT CLAIMS vs. ACTUAL PDF PAGES")
    print("=" * 80)
    print(f"\n  {'Capture':<35} {'Actual':>6} {'Plan':>6} {'App B':>6} {'Status'}")
    print(f"  {'-'*35} {'-'*6} {'-'*6} {'-'*6} {'-'*10}")

    # Extract page claims from Project Plan
    # Some captures appear in the plan table prefixed with "V2" (e.g.,
    # "TABS V2 Comprehensive Analysis Report"), so allow optional modifier
    # tokens between "TABS" and the short_name.
    plan_text = appendix_texts.get("Plan", "")
    plan_claims = {}
    for line in plan_text.split('\n'):
        for key, cfg in CAPTURE_CONFIGS.items():
            short = cfg["short_name"]
            # Match table rows like "| TABS Survey Instrument | DOCX/PDF/MD | 64 |"
            # or "| TABS V2 Comprehensive Analysis Report | DOCX/PDF/MD | 11 |"
            pattern = rf'TABS\s+(?:[\w]+\s+)?{re.escape(short)}\s*\|\s*DOCX/PDF/MD\s*\|\s*(\d+)\s*\|'
            m = re.search(pattern, line, re.IGNORECASE)
            if m:
                plan_claims[key] = int(m.group(1))

    # Extract page claims from Appendix B's Archival Strategy table
    b_text = appendix_texts.get("B", "")
    b_claims = {}
    for line in b_text.split('\n'):
        for key, cfg in CAPTURE_CONFIGS.items():
            short = cfg["short_name"]
            # Match table rows like "| TABS Survey Instrument | 139 |"
            # or "| TABS V2 Comprehensive Analysis Report | 11 |"
            pattern = rf'TABS\s+(?:[\w]+\s+)?{re.escape(short)}\s*\|\s*(\d+)\s*\|'
            m = re.search(pattern, line, re.IGNORECASE)
            if m:
                b_claims[key] = int(m.group(1))

    issues_found = 0
    for key, cfg in CAPTURE_CONFIGS.items():
        actual = actual_pages.get(key)
        plan_val = plan_claims.get(key)
        b_val = b_claims.get(key)

        actual_str = str(actual) if isinstance(actual, int) else "N/A"
        plan_str = str(plan_val) if plan_val else "-"
        b_str = str(b_val) if b_val else "-"

        # Determine status
        mismatches = []
        if plan_val and isinstance(actual, int) and plan_val != actual:
            mismatches.append("Plan")
        if b_val and isinstance(actual, int) and b_val != actual:
            mismatches.append("App B")

        if mismatches:
            status = f"MISMATCH ({', '.join(mismatches)})"
            issues_found += 1
        else:
            status = "OK"

        print(f"  {cfg['short_name']:<35} {actual_str:>6} {plan_str:>6} {b_str:>6} {status}")

    # Also check total
    plan_total_match = re.search(r'\*\*Total\*\*\s*\|[^|]*\|\s*\*\*(\d+)\*\*', plan_text)
    b_total_match = re.search(r'\*\*Total\*\*\s*\|[^|]*\|\s*\*\*(\d+)\*\*', b_text)
    plan_total = int(plan_total_match.group(1)) if plan_total_match else None
    b_total = int(b_total_match.group(1)) if b_total_match else None

    print(f"  {'TOTAL':<35} {total_pages:>6} {str(plan_total) if plan_total else '-':>6} {str(b_total) if b_total else '-':>6}", end="")
    total_mismatches = []
    if plan_total and plan_total != total_pages:
        total_mismatches.append("Plan")
    if b_total and b_total != total_pages:
        total_mismatches.append("App B")
    if total_mismatches:
        print(f" MISMATCH ({', '.join(total_mismatches)})")
        issues_found += 1
    else:
        print(" OK")

    print(f"\n  Page count issues: {issues_found}")

    # =========================================================================
    # SECTION 3: Appendix Word Counts
    # =========================================================================
    print("\n" + "=" * 80)
    print("SECTION 3: APPENDIX WORD COUNTS")
    print("=" * 80)
    total_words = 0
    for app_id in ["A", "B", "C", "D"]:
        wc = appendix_word_counts.get(app_id, 0)
        total_words += wc
        path = APPENDIX_FILES.get(app_id)
        fname = os.path.basename(path) if path else "NOT FOUND"
        print(f"  [{app_id}] {wc:>6} words  ({fname})")
    print(f"  TOTAL: {total_words} words across 4 appendixes")

    # =========================================================================
    # SECTION 4: Cross-Reference Validation
    # =========================================================================
    print("\n" + "=" * 80)
    print("SECTION 4: CROSS-REFERENCE VALIDATION")
    print("=" * 80)

    xref_findings = check_cross_references(appendix_texts)
    pass_count = sum(1 for f in xref_findings if f["status"] == "PASS")
    miss_count = sum(1 for f in xref_findings if f["status"] == "MISSING")
    opt_count  = sum(1 for f in xref_findings if f["status"] == "OPTIONAL")

    for f in xref_findings:
        if f["status"] == "PASS":
            icon = "PASS"
        elif f["status"] == "MISSING":
            icon = "MISS"
        else:
            icon = "OPT "
        print(f"  [{icon}] {f['from']} -> {f['to']}: {f['description']}")

    print(f"\n  Cross-references: {pass_count} PASS, {miss_count} MISSING, {opt_count} OPTIONAL")

    # =========================================================================
    # SECTION 5: Key Number Consistency
    # =========================================================================
    print("\n" + "=" * 80)
    print("SECTION 5: KEY NUMBER CONSISTENCY ACROSS APPENDIXES")
    print("=" * 80)

    number_findings = check_number_consistency(appendix_texts)
    for nf in number_findings:
        apps = ", ".join(f"{k}({v}x)" for k, v in sorted(nf["found_in"].items()))
        print(f"  {nf['name']:<40} Expected: {nf['expected']:<30} Found in: {apps or 'NONE'}")

    # =========================================================================
    # SECTION 6: Stale Content & Cleanup
    # =========================================================================
    print("\n" + "=" * 80)
    print("SECTION 6: STALE CONTENT & CLEANUP FLAGS")
    print("=" * 80)

    stale_findings = check_stale_content(appendix_texts)
    if stale_findings:
        for sf in stale_findings:
            print(f"  [{sf['severity']}] Appendix {sf['appendix']}: {sf['issue']}")
    else:
        print("  No stale content detected.")

    # =========================================================================
    # SECTION 7: Inline Page Claims in Appendix Prose
    # =========================================================================
    print("\n" + "=" * 80)
    print("SECTION 7: INLINE PAGE CLAIMS IN APPENDIX PROSE")
    print("=" * 80)
    print("  Scanning appendix B for page claims embedded in scope lines and prose...")

    b_text = appendix_texts.get("B", "")
    inline_issues = 0

    for key, cfg in CAPTURE_CONFIGS.items():
        if cfg["appendix"] != "B":
            continue
        actual = actual_pages.get(key)
        if not isinstance(actual, int):
            continue

        short = cfg["short_name"]
        # Look for "N-page" patterns near the capture name
        for match in re.finditer(rf'(\d+)-page.*?{re.escape(short)}|{re.escape(short)}.*?(\d+)\s+pages', b_text, re.IGNORECASE):
            claimed = int(match.group(1) or match.group(2))
            if claimed != actual:
                start = max(0, match.start() - 20)
                end = min(len(b_text), match.end() + 20)
                context = b_text[start:end].replace('\n', ' ')
                print(f"  MISMATCH: {short} claims {claimed} pages, actual is {actual}")
                print(f"           Context: ...{context}...")
                inline_issues += 1

    # Also check Appendix A prose
    a_text = appendix_texts.get("A", "")
    for match in re.finditer(r'(\d+)-page|(\d+)\s+pages', a_text, re.IGNORECASE):
        claimed = int(match.group(1) or match.group(2))
        start = max(0, match.start() - 40)
        end = min(len(a_text), match.end() + 40)
        context = a_text[start:end].replace('\n', ' ')
        # Only flag matches that are clearly about the Survey Instrument
        # capture; the word "Capture" alone is too generic and causes false
        # positives for other captures mentioned in Appendix A.
        if "Survey Instrument" in context:
            actual_si = actual_pages.get("survey_instrument")
            if isinstance(actual_si, int) and claimed != actual_si:
                print(f"  MISMATCH: App A claims {claimed} pages for SI capture, actual is {actual_si}")
                print(f"           Context: ...{context}...")
                inline_issues += 1

    if inline_issues == 0:
        print("  No inline page claim mismatches found.")
    else:
        print(f"\n  Inline page claim issues: {inline_issues}")

    # =========================================================================
    # SECTION 8: Capture Count Claims
    # =========================================================================
    print("\n" + "=" * 80)
    print("SECTION 8: CAPTURE COUNT CLAIMS")
    print("=" * 80)

    active_captures = len(CAPTURE_CONFIGS)  # 8
    for app_id, text in appendix_texts.items():
        for match in re.finditer(r'(\d+)\s+Moment in Time Capture', text):
            claimed = int(match.group(1))
            start = max(0, match.start() - 30)
            end = min(len(text), match.end() + 30)
            context = text[start:end].replace('\n', ' ')
            status = "OK" if claimed == active_captures else f"MISMATCH (actual: {active_captures})"
            print(f"  Appendix {app_id}: claims {claimed} captures - {status}")
            if claimed != active_captures:
                print(f"           Context: ...{context}...")

    # =========================================================================
    # SUMMARY
    # =========================================================================
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"  Active captures:     {active_captures}")
    print(f"  Total capture pages: {total_pages}")
    print(f"  Total hyperlinks:    {total_links}")
    print(f"  Appendix words:      {total_words}")
    print(f"  Cross-references:    {pass_count} PASS / {miss_count} MISSING / {opt_count} OPTIONAL")
    print(f"  Page count issues:   {issues_found}")
    print(f"  Inline claim issues: {inline_issues}")
    print(f"  Stale content flags: {len(stale_findings)}")
    print()


if __name__ == "__main__":
    main()
