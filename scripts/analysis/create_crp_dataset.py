#!/usr/bin/env python3
"""create_crp_dataset.py - Build the final CRP public dataset (N=200).

CRP = Culminating Research Project, Penn State Smeal College of Business,
Doctor of Business Administration (DBA) program.

Selects N=200 responses from Prolific Accepted participants using a
three-tier quality-based selection strategy, then de-identifies the
result for ScholarSphere deposit.

Tier Selection Strategy
=======================

  Tier 1 - Conservative Clean (include up to target_n; capped at N)
      Prolific APPROVED + ALL quality checks:
        - All 3 IRI attention checks correct
        - Duration >= 540 s (Smeal eDBA benchmark)
        - No full straightlining (Q_StraightliningCount == 0)
        - reCAPTCHA score >= 0.5
        - No auth flags (Auth_LLM and Auth_Bots not LOW or MIXED)
        - No partial straightlining (within-person SD above threshold)

  Tier 2 - Acceptable Quality (supplement to N=200 if Tier 1 falls short)
      Same as Tier 1 but allows 1 or 2 correct IRI checks instead of all 3

  Tier 3 - Borderline (supplement only if both Tier 1 + 2 exhausted)
      APPROVED + duration >= 300 s + no full straightlining
      + reCAPTCHA >= 0.3 + at most 1 IRI miss


De-identification Pipeline (NIST SP 800-188)
============================================

  1. Free-text PII scan (regex patterns)
  2. Prolific linkage file extraction
  3. ResponseId replacement (SHA-256 pseudonymisation)
  4. Timestamp generalization → date-only
  5. Column exclusion (drop PII/platform columns)

Usage:
    python create_crp_dataset.py <enriched_qualtrics_csv>
    python create_crp_dataset.py data.csv --target-n 200 --output-dir ./output
    python create_crp_dataset.py data.csv --dry-run
    python create_crp_dataset.py data.csv --skip-review

Exit codes:
    0  Success
    1  PII flagged (requires human review) or --dry-run completed
    2  Output verification failed after automated redaction, or input/configuration error

Author: Clarke Moyer, Penn State Smeal DBA
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import math
import re
import sys
from datetime import datetime
from pathlib import Path

# ─────────────────────────────────────────────────────────────
# Configuration - mirrors tabs_v2_analysis.py exactly
# ─────────────────────────────────────────────────────────────

# -- V2 cohort filter (matches tabs_v2_analysis.py) --
V2_START = "2026-03-23 14:00:00"
# Prolific live test of V2 instrument (valid V2 response, predates V2_START)
PROLIFIC_TEST_ID = "R_1QK12IJpHjC3wd6"

# -- Thresholds --
DURATION_TIER1_MIN = 540       # seconds (Smeal eDBA benchmark)
DURATION_TIER3_MIN = 300       # seconds (minimum acceptable)
RECAPTCHA_TIER1_MIN = 0.5      # Qualtrics reCAPTCHA threshold
RECAPTCHA_TIER3_MIN = 0.3      # Relaxed threshold for tier 3
PARTIAL_STRAIGHTLINING_SD_THRESHOLD = 0.5  # within-person SD threshold

# -- IRI attention-check columns and correct answers --
BARRIER_IRI = "Q10-28_Barriers_19"
READINESS_IRI = "Q47-64_Readiness_18"
MATURITY_IRI = "Q65-73_Maturity_9"
# Expected answers are Qualtrics choice labels (matches CSV export values)
IRI_BARRIER_ANSWER = "Major Barrier"
IRI_READINESS_ANSWER = "Low Readiness/Capability"
IRI_MATURITY_ANSWER = "Level 2: Developing/Repeatable"

# -- Columns used to assess partial straightlining (IRI items excluded) --
BARRIER_COLS = [f"Q10-28_Barriers_{i}" for i in range(1, 19)]
READINESS_COLS = [f"Q47-64_Readiness_{i}" for i in range(1, 18)]
MATURITY_COLS = [f"Q65-73_Maturity_{i}" for i in range(1, 9)]

# -- Columns to drop from public dataset --
COLUMNS_TO_DROP: set[str] = {
    # Direct identifiers
    "PROLIFIC_PID",
    # ResponseId is retained after pseudonymisation so the public dataset
    # can be linked back to internal records via the confidential mapping file.
    # Quasi-identifiers and platform noise
    "IPAddress",
    "LocationLatitude",
    "LocationLongitude",
    "RecipientFirstName",
    "RecipientLastName",
    "RecipientEmail",
    "ExternalReference",
    # Prolific-enriched auth / provenance columns
    "Auth_LLM",
    "Auth_Bots",
    "Prolific_Status",
    # Prolific submission timestamp anchors — pipeline-internal only.
    # These are also caught by the PROLIFIC_DEMO_PREFIX filter in
    # filter_columns(), but listed here explicitly so the intent is clear.
    "Prolific_Completed_At",
    "Prolific_Started_At",
    # Qualtrics operational fields
    "Q_RecaptchaScore",
    "Q_StraightliningCount",
    "Q_TotalDuration",
    "Q_DataPolicyViolations",
    "Q_BallotBoxStuffing",
    "Q_RelevantIDDuplicate",
    "Q_RelevantIDDuplicateScore",
    "Q_RelevantIDFraudScore",
    "Q_RelevantIDLastStartDate",
    "UserLanguage",
    "distributionChannel",
}
# Prolific demographic columns prefix - must match the prefix applied by
# enrich_qualtrics_csv.py (which writes "Prolific_<col>", capital P).
PROLIFIC_DEMO_PREFIX = "Prolific_"

# -- Columns to preserve in Prolific linkage file --
PROLIFIC_LINKAGE_COLUMNS = [
    "PROLIFIC_PID",
    "ResponseId",
    "StartDate",
    "Prolific_Status",
]

# -- Free-text columns to PII-scan --
# Keep this list aligned with scripts/deidentify_tabs_data.py and the
# production-format Qualtrics export schema used by this repository.
FREE_TEXT_COLUMNS = [
    "Q1_Role_11_TEXT",
    "Q3_Industry_26_TEXT",
    "Q74_Feedback",
]

# -- Timestamp columns to generalize --
TIMESTAMP_COLUMNS = [
    "StartDate",
    "EndDate",
    "RecordedDate",
]


# ─────────────────────────────────────────────────────────────
# CSV loading helpers
# ─────────────────────────────────────────────────────────────


def load_qualtrics_csv(path: str) -> tuple[list[str], list[list[str]]]:
    """Load a Qualtrics CSV with 3 header rows, returning (headers, data_rows).

    Qualtrics exports include three header rows before data:
      Row 1 - column names
      Row 2 - question text / description
      Row 3 - import IDs
    Data rows start at row 4.
    """
    with open(path, newline="", encoding="utf-8-sig") as f:
        reader = csv.reader(f)
        rows = list(reader)
    if len(rows) < 4:
        print(
            f"Input error: expected at least 4 rows (3 headers + 1 data)"
            f" in Qualtrics CSV, got {len(rows)}",
            file=sys.stderr,
        )
        raise SystemExit(2)
    headers = rows[0]
    data = rows[3:]   # Skip column names, question text, and import ID rows
    return headers, data


def make_idx(headers: list[str]) -> dict[str, int]:
    """Map column name → index."""
    return {h: i for i, h in enumerate(headers)}


def get_val(row: list[str], idx: dict[str, int], col: str) -> str:
    """Return the stripped cell value for a column, or '' if column is absent."""
    i = idx.get(col)
    if i is None or i >= len(row):
        return ""
    return row[i].strip()


def rows_to_dicts(rows: list[list[str]], headers: list[str]) -> list[dict[str, str]]:
    """Convert list-of-lists to list-of-dicts."""
    return [dict(zip(headers, row)) for row in rows]


# ─────────────────────────────────────────────────────────────
# Quality metric getters
# ─────────────────────────────────────────────────────────────


def get_duration(row: list[str], idx: dict[str, int]) -> float:
    """Get survey duration in seconds (defaults to 0 if missing)."""
    val = get_val(row, idx, "Duration (in seconds)")
    if not val:
        return 0.0
    try:
        return float(val)
    except ValueError:
        return 0.0


def get_finished(row: list[str], idx: dict[str, int]) -> bool:
    """Return True for standard Qualtrics finished values."""
    val = get_val(row, idx, "Finished").strip().lower()
    return val in ("1", "true")


def count_iri_correct(row: list[str], idx: dict[str, int]) -> int:
    """Count correct IRI attention checks (0–3)."""
    correct = 0
    if get_val(row, idx, BARRIER_IRI) == IRI_BARRIER_ANSWER:
        correct += 1
    if get_val(row, idx, READINESS_IRI) == IRI_READINESS_ANSWER:
        correct += 1
    if get_val(row, idx, MATURITY_IRI) == IRI_MATURITY_ANSWER:
        correct += 1
    return correct


def get_recaptcha_score(row: list[str], idx: dict[str, int]) -> float:
    """Get reCAPTCHA score (defaults to 1.0 if missing)."""
    val = get_val(row, idx, "Q_RecaptchaScore")
    if not val:
        return 1.0
    try:
        return float(val)
    except ValueError:
        return 1.0


def get_straightlining_count(row: list[str], idx: dict[str, int]) -> int:
    """Get Qualtrics straightlining count (defaults to 0 if missing)."""
    val = get_val(row, idx, "Q_StraightliningCount")
    if not val:
        return 0
    try:
        return int(val)
    except ValueError:
        return 0


def within_person_sd(responses: list[str]) -> float:
    """Compute within-person SD for categorical responses."""
    non_empty = [r for r in responses if r != ""]
    if len(non_empty) < 2:
        return float("nan")
    unique_vals = list(dict.fromkeys(non_empty))
    numeric = [unique_vals.index(r) for r in non_empty]
    mean = sum(numeric) / len(numeric)
    variance = sum((val - mean) ** 2 for val in numeric) / len(numeric)
    return math.sqrt(variance)


def has_partial_straightlining(
    row: list[str], idx: dict[str, int],
    threshold: float = PARTIAL_STRAIGHTLINING_SD_THRESHOLD,
) -> bool:
    """Check if any question block has within-person SD below threshold."""
    blocks = [
        ("Barriers", BARRIER_COLS),
        ("Readiness", READINESS_COLS),
        ("Maturity", MATURITY_COLS),
    ]
    for _name, cols in blocks:
        responses = []
        for col in cols:
            if col in idx:
                responses.append(get_val(row, idx, col))
        non_empty = [r for r in responses if r != ""]
        if len(non_empty) < max(2, math.ceil(len(cols) / 2)):
            continue
        sd = within_person_sd(responses)
        if not math.isnan(sd) and sd < threshold:
            return True
    return False


def has_auth_flag(row: list[str], idx: dict[str, int]) -> tuple[bool, bool]:
    """Check Prolific auth flags. Returns (llm_flagged, bots_flagged)."""
    llm = get_val(row, idx, "Auth_LLM").upper()
    bots = get_val(row, idx, "Auth_Bots").upper()
    llm_flag = llm in ("LOW", "MIXED")
    bots_flag = bots in ("LOW", "MIXED")
    return llm_flag, bots_flag


def get_prolific_status(row: list[str], idx: dict[str, int]) -> str:
    """Get Prolific submission status."""
    return get_val(row, idx, "Prolific_Status")


def get_response_id(row: list[str], idx: dict[str, int]) -> str:
    """Get ResponseId."""
    return get_val(row, idx, "ResponseId")


# ─────────────────────────────────────────────────────────────
# Disposition waterfall (for reporting only)
# ─────────────────────────────────────────────────────────────



# ─────────────────────────────────────────────────────────────
# V2 filtering and deduplication
# ─────────────────────────────────────────────────────────────


def filter_v2_and_dedup(
    data: list[list[str]], idx: dict[str, int],
) -> list[list[str]]:
    """
    Return only completed V2 responses from Prolific participants,
    keeping the best response per PROLIFIC_PID.

    A "V2 Prolific response" satisfies all of:
      - Non-empty PROLIFIC_PID and Prolific_Status (injected by enrich_qualtrics_csv.py)
      - StartDate >= V2_START, OR ResponseId == PROLIFIC_TEST_ID (the live test row)

    Deduplication rule (matches tabs_v2_analysis.py):
      - Prefer a finished response over an incomplete one.
      - Among multiple finished (or multiple incomplete) responses, the latest row wins.
    Only rows that are ultimately finished are returned.
    """
    by_pid: dict[str, list[str]] = {}
    for row in data:
        pid = get_val(row, idx, "PROLIFIC_PID")
        status = get_prolific_status(row, idx)
        if not pid or not status:
            continue
        start_date = get_val(row, idx, "StartDate")
        response_id = get_val(row, idx, "ResponseId")
        if start_date < V2_START and response_id != PROLIFIC_TEST_ID:
            continue
        existing = by_pid.get(pid)
        if existing is None:
            by_pid[pid] = row
        else:
            existing_finished = get_finished(existing, idx)
            new_finished = get_finished(row, idx)
            # Take new row if it is finished OR the existing one wasn't;
            # when both have the same finish state, the new (later) row wins.
            if new_finished or not existing_finished:
                by_pid[pid] = row
            # else: existing is finished but new isn't - keep existing

    return [row for row in by_pid.values() if get_finished(row, idx)]


# ─────────────────────────────────────────────────────────────
# Quality profile builder
# ─────────────────────────────────────────────────────────────


def build_response_profile(
    row: list[str], idx: dict[str, int],
) -> dict:
    """Compute the full quality profile for one response row."""
    duration = get_duration(row, idx)
    finished = get_finished(row, idx)
    iri = count_iri_correct(row, idx)
    recaptcha = get_recaptcha_score(row, idx)
    straightlining = get_straightlining_count(row, idx)
    llm_flag, bots_flag = has_auth_flag(row, idx)
    partial_sl = has_partial_straightlining(row, idx)
    prolific_status = get_prolific_status(row, idx)
    response_id = get_response_id(row, idx)
    start_date = get_val(row, idx, "StartDate")

    is_tier1 = (
        prolific_status == "APPROVED"
        and iri == 3
        and duration >= DURATION_TIER1_MIN
        and straightlining == 0
        and recaptcha >= RECAPTCHA_TIER1_MIN
        and not llm_flag
        and not bots_flag
        and not partial_sl
    )
    is_tier2 = (
        prolific_status == "APPROVED"
        and iri >= 1
        and iri < 3
        and duration >= DURATION_TIER1_MIN
        and straightlining == 0
        and recaptcha >= RECAPTCHA_TIER1_MIN
        and not llm_flag
        and not bots_flag
        and not partial_sl
    )
    is_tier3 = (
        prolific_status == "APPROVED"
        and iri >= 2
        and duration >= DURATION_TIER3_MIN
        and straightlining == 0
        and recaptcha >= RECAPTCHA_TIER3_MIN
        and not is_tier1
        and not is_tier2
    )

    tier = 0
    if is_tier1:
        tier = 1
    elif is_tier2:
        tier = 2
    elif is_tier3:
        tier = 3

    return {
        "response_id": response_id,
        "start_date": start_date,
        "prolific_status": prolific_status,
        "finished": finished,
        "duration": duration,
        "iri_correct": iri,
        "recaptcha": recaptcha,
        "straightlining": straightlining,
        "llm_flag": llm_flag,
        "bots_flag": bots_flag,
        "partial_sl": partial_sl,
        "tier": tier,
        "selected": False,
        "row": row,
    }


# ─────────────────────────────────────────────────────────────
# Tiered selection
# ─────────────────────────────────────────────────────────────


def select_crp_sample(
    profiles: list[dict],
    target_n: int,
) -> None:
    """Mark profiles[i]['selected'] = True for the tiered CRP selection.

    Selects up to target_n profiles in tier order (1 → 2 → 3).
    Tier 1 is capped at target_n so the public dataset never exceeds N.

    **Side-effect**: profiles is sorted in-place (earliest StartDate first,
    then ResponseId as a tiebreaker) before iterating, so the selected set
    is stable regardless of CSV row order.  Callers that rely on the original
    ordering should pass a copy.
    """
    # Sort in-place deterministically: earliest StartDate first, then ResponseId.
    # start_date and response_id are always strings (get_val returns '' if absent),
    # so the sort is safe even when a column is missing.
    profiles.sort(key=lambda p: (p.get("start_date") or "", p.get("response_id") or ""))
    selected = 0

    # Tier 1 first (capped at target_n)
    for p in profiles:
        if selected >= target_n:
            break
        if p["prolific_status"] == "APPROVED" and p["tier"] == 1:
            p["selected"] = True
            selected += 1

    # Tier 2 supplement
    if selected < target_n:
        for p in profiles:
            if selected >= target_n:
                break
            if p["prolific_status"] == "APPROVED" and p["tier"] == 2 and not p["selected"]:
                p["selected"] = True
                selected += 1

    # Tier 3 supplement (only if still short)
    if selected < target_n:
        for p in profiles:
            if selected >= target_n:
                break
            if p["prolific_status"] == "APPROVED" and p["tier"] == 3 and not p["selected"]:
                p["selected"] = True
                selected += 1


# ─────────────────────────────────────────────────────────────
# Manifest generation
# ─────────────────────────────────────────────────────────────


def generate_manifest(profiles: list[dict], target_n: int) -> str:
    """Generate a text manifest summarising the selection."""
    selected = [p for p in profiles if p.get("selected")]
    accepted = [p for p in profiles if p["prolific_status"] == "APPROVED"]
    tier_counts = {1: 0, 2: 0, 3: 0, 0: 0}
    for p in selected:
        tier_counts[p["tier"]] = tier_counts.get(p["tier"], 0) + 1

    lines = [
        "SELECTION MANIFEST - CRP DATASET (CONFIDENTIAL)",
        "=" * 72,
        f"Generated: {datetime.utcnow().isoformat()}Z",
        f"Target N: {target_n}",
        f"Prolific Accepted pool: {len(accepted)}",
        f"Selected: {len(selected)}",
        "",
        "Tier breakdown:",
        f"  Tier 1 (Conservative Clean): {tier_counts.get(1, 0)}",
        f"  Tier 2 (Acceptable Quality): {tier_counts.get(2, 0)}",
        f"  Tier 3 (Borderline):         {tier_counts.get(3, 0)}",
        "",
        "Selected ResponseIds:",
    ]
    for p in selected:
        lines.append(f"  {p['response_id']}  [Tier {p['tier']}]"
                     f"  dur={p['duration']:.0f}s  iri={p['iri_correct']}"
                     f"  recap={p['recaptcha']:.2f}"
                     f"  sl={p['straightlining']}"
                     f"  auth={p['llm_flag']}/{p['bots_flag']}")
    lines.append("")
    lines.append("End of manifest.")
    return "\n".join(lines) + "\n"


# ─────────────────────────────────────────────────────────────
# Reporting helpers
# ─────────────────────────────────────────────────────────────




# ─────────────────────────────────────────────────────────────
# PII scan and redaction
# ─────────────────────────────────────────────────────────────


def _make_preview(val: str, pattern: re.Pattern, pattern_type: str, max_len: int = 64) -> str:
    """Return a redacted snippet showing context around the first pattern match.

    The matched span is replaced with [REDACTED_<TYPE>] so the preview never
    contains the raw PII value.  Up to 20 chars of surrounding context are
    shown on each side to help distinguish false positives.
    """
    m = pattern.search(val)
    if not m:
        return ""
    start, end = m.start(), m.end()
    ctx = 20
    s = max(0, start - ctx)
    e = min(len(val), end + ctx)
    prefix = ("…" if s > 0 else "") + val[s:start]
    suffix = val[end:e] + ("…" if e < len(val) else "")
    preview = f"{prefix}[REDACTED_{pattern_type.upper()}]{suffix}"
    if len(preview) > max_len:
        preview = preview[:max_len] + "…"
    return preview


# PII regex patterns (NIST SP 800-188 categories)
PII_PATTERNS: list[tuple[str, re.Pattern]] = [
    ("email", re.compile(
        r"\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b",
    )),
    ("phone", re.compile(
        r"\b(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}\b",
    )),
    ("ssn", re.compile(
        r"\b\d{3}[\s.-]\d{2}[\s.-]\d{4}\b",
    )),
    ("url", re.compile(
        r"https?://[^\s]+|www\.[^\s]+",
    )),
    ("zip_code", re.compile(
        r"\b\d{5}(?:-\d{4})?\b",
    )),
]


def scan_pii(
    rows: list[dict[str, str]],
    text_cols: list[str],
    row_offset: int = 4,
) -> list[dict]:
    """Scan free-text columns for PII patterns. Returns list of flag dicts.

    row_offset maps 0-based row index to 1-based CSV row number for reports.
    Default of 4 matches the standard Qualtrics export (3 header rows, so the
    first data row is CSV row 4).  Pass row_offset=2 for a single-header-row
    output (e.g., the public dataset after column filtering).

    Each flag contains:
        row_number   - 1-based row number (for human-readable reports)
        row_index    - 0-based index into *rows* (for in-place redaction)
        response_id  - ResponseId for locating the response
        column       - column name
        pattern_type - PII pattern category
        preview      - redacted context snippet (PII replaced, not shown)
    """
    flags = []
    for i, row in enumerate(rows):
        for col in text_cols:
            val = row.get(col, "")
            if not val:
                continue
            for pattern_type, pattern in PII_PATTERNS:
                if pattern.search(val):
                    flags.append({
                        "row_number": i + row_offset,
                        "row_index": i,
                        "response_id": row.get("ResponseId", ""),
                        "column": col,
                        "pattern_type": pattern_type,
                        "preview": _make_preview(val, pattern, pattern_type),
                    })
    return flags


def write_pii_report(
    path: Path,
    flags: list[dict],
) -> None:
    """Write a PII review report to disk (flags only, no raw values).

    Each entry includes ResponseId (to locate the source response) and a
    context preview where the matched span is replaced by [REDACTED_<TYPE>],
    so reviewers can distinguish false positives without seeing raw PII.
    """
    with open(path, "w", encoding="utf-8") as f:
        f.write("PII REVIEW REPORT - CRP DATASET (CONFIDENTIAL)\n")
        f.write("=" * 72 + "\n\n")
        f.write(f"Generated: {datetime.utcnow().isoformat()}Z\n")
        f.write(f"Total flags: {len(flags)}\n\n")
        if not flags:
            f.write("No PII patterns detected.\n")
            return
        f.write(f"{'Row':>6}  {'ResponseId':>20}  {'Column':>30}  {'Pattern':>15}\n")
        f.write("-" * 78 + "\n")
        for flag in flags:
            rid = flag.get('response_id', '')
            f.write(
                f"{flag['row_number']:>6}  {rid:>20}  "
                f"{flag['column']:>30}  {flag['pattern_type']:>15}\n"
            )
            preview = flag.get('preview', '')
            if preview:
                f.write(f"         Context: {preview}\n")


def redact_pii(
    rows: list[dict[str, str]],
    flags: list[dict],
) -> int:
    """Apply regex redaction in-place. Returns count of redactions."""
    redaction_count = 0
    for flag in flags:
        row_idx = flag["row_index"]
        col = flag["column"]
        val = rows[row_idx].get(col, "")
        if not val:
            continue
        for pattern_type, pattern in PII_PATTERNS:
            new_val = pattern.sub(f"[REDACTED_{pattern_type.upper()}]", val)
            if new_val != val:
                rows[row_idx][col] = new_val
                val = new_val
                redaction_count += 1
    return redaction_count


# ─────────────────────────────────────────────────────────────
# De-identification steps
# ─────────────────────────────────────────────────────────────


def extract_linkage(
    rows: list[dict[str, str]],
    linkage_cols: list[str],
) -> list[list[str]]:
    """Extract and convert dict rows to list format aligned with linkage_cols order.

    Returns rows as lists (not dicts) so they are compatible with csv.writer.
    """
    return [[row.get(col, "") for col in linkage_cols] for row in rows]


def replace_response_ids(
    rows: list[dict[str, str]],
) -> tuple[list[dict[str, str]], list[tuple[str, str]]]:
    """Replace ResponseId with a SHA-256 pseudonym. Returns (rows, mapping).

    Uses the first 32 hex characters (128 bits of the 256-bit digest) as the
    pseudonym.  Raises ValueError immediately if a truncation collision is
    detected so that callers cannot silently merge two distinct respondents.
    """
    digest_prefix_len = 32
    mapping = []
    original_to_anon: dict[str, str] = {}
    anon_to_original: dict[str, str] = {}

    for row in rows:
        original = row.get("ResponseId", "")
        if not original:
            continue

        anon = original_to_anon.get(original)
        if anon is None:
            anon = hashlib.sha256(original.encode()).hexdigest()[:digest_prefix_len]
            existing_original = anon_to_original.get(anon)
            if existing_original is not None and existing_original != original:
                raise ValueError(
                    "SHA-256 pseudonym collision detected for ResponseId values "
                    f"{existing_original!r} and {original!r}. "
                    "Increase the digest prefix length."
                )
            original_to_anon[original] = anon
            anon_to_original[anon] = original

        row["ResponseId"] = anon
        mapping.append((original, anon))

    return rows, mapping


def generalize_timestamps(
    rows: list[dict[str, str]],
    timestamp_cols: list[str],
) -> None:
    """Replace full timestamps with date-only strings (YYYY-MM-DD)."""
    for row in rows:
        for col in timestamp_cols:
            val = row.get(col, "")
            if val and "T" in val:
                row[col] = val[:10]
            elif val and " " in val:
                row[col] = val.split(" ")[0]


def filter_columns(
    headers: list[str],
    rows: list[dict[str, str]],
    drop_set: set[str],
) -> tuple[list[str], list[list[str]]]:
    """Drop specified columns. Returns (kept_headers, list_of_rows_as_lists)."""
    kept = [h for h in headers if h not in drop_set and not h.startswith(PROLIFIC_DEMO_PREFIX)]
    filtered = [[row.get(h, "") for h in kept] for row in rows]
    return kept, filtered


def write_csv(
    path: Path,
    headers: list[str],
    rows: list[list[str]],
) -> None:
    """Write rows to a CSV file."""
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(rows)


def sha256_file(path: Path) -> str:
    """Return the SHA-256 hex digest of a file."""
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


# ─────────────────────────────────────────────────────────────
# De-identification orchestrator
# ─────────────────────────────────────────────────────────────


def deidentify_selected(
    selected_rows: list[list[str]], headers: list[str], output_dir: Path,
    skip_review: bool = False, dry_run: bool = False,
) -> int:
    """Run the full 5-step NIST de-identification on selected rows.

    Returns:
        0   De-identification complete and output verified clean.
        1   Stopped early: --dry-run completed (regardless of PII flags),
            or PII found and --skip-review not set (human review required).
        2   Output verification failed after automated redaction (public
            dataset removed; manual investigation required).
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    rows = rows_to_dicts(selected_rows, headers)

    # Step 1: PII scan - always run, even in dry-run
    print("\n--- De-identification Step 1: Free-text PII scan ---")
    available_text_cols = [c for c in FREE_TEXT_COLUMNS if c in headers]
    pii_flags = scan_pii(rows, available_text_cols)
    print(f"  Scanned columns: {available_text_cols}")
    print(f"  PII flags found: {len(pii_flags)}")

    pii_report_path = output_dir / "pii_review_report_CONFIDENTIAL.txt"
    write_pii_report(pii_report_path, pii_flags)
    print(f"  Report: {pii_report_path}")

    if dry_run:
        if pii_flags:
            print("\n[DRY RUN] PII scan complete - flags found. Review the report above.")
        else:
            print("\n[DRY RUN] PII scan complete - no flags found.")
        return 1

    if pii_flags and not skip_review:
        print(f"\n{len(pii_flags)} PII flag(s) require human review.")
        print(f"Review: {pii_report_path}")
        print("Re-run with --skip-review to proceed with automated redaction.")
        return 1

    redaction_count = 0
    if pii_flags:
        redaction_count = redact_pii(rows, pii_flags)
        print(f"  Redactions applied: {redaction_count}")

    # Step 2: Extract Prolific linkage BEFORE ID replacement
    print("\n--- De-identification Step 2: Prolific linkage file ---")
    available_linkage = [c for c in PROLIFIC_LINKAGE_COLUMNS if c in headers]
    linkage_data = extract_linkage(rows, available_linkage)
    linkage_path = output_dir / "prolific_linkage_CONFIDENTIAL.csv"
    write_csv(linkage_path, available_linkage, linkage_data)
    print(f"  Saved: {linkage_path} ({len(linkage_data)} rows)")

    # Step 3: ResponseId replacement
    print("\n--- De-identification Step 3: ResponseId replacement ---")
    rows, id_mapping = replace_response_ids(rows)
    mapping_path = output_dir / "responseid_mapping_CONFIDENTIAL.csv"
    with open(mapping_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["original_response_id", "anonymous_id"])
        writer.writerows(id_mapping)
    print(f"  Saved: {mapping_path} ({len(id_mapping)} mappings)")

    # Step 4: Timestamp generalization
    print("\n--- De-identification Step 4: Timestamp generalization ---")
    available_ts = [c for c in TIMESTAMP_COLUMNS if c in headers]
    generalize_timestamps(rows, available_ts)
    print(f"  Generalized: {available_ts}")

    # Step 4b: Add derived quality flag columns for reproducibility
    # Auth_LLM and Auth_Bots are dropped in Step 5 (platform-specific), but the
    # conservative_clean sample definition depends on them. Add a single boolean
    # Auth_Flagged column so the public dataset can reproduce the exact N=79.
    print("\n--- De-identification Step 4b: Add derived quality columns ---")
    auth_llm_idx = headers.index("Auth_LLM") if "Auth_LLM" in headers else None
    auth_bots_idx = headers.index("Auth_Bots") if "Auth_Bots" in headers else None
    recap_score_idx = headers.index("Q_RecaptchaScore") if "Q_RecaptchaScore" in headers else None
    sl_count_idx = headers.index("Q_StraightliningCount") if "Q_StraightliningCount" in headers else None

    # Add derived columns at the end
    headers.append("Auth_Flagged")
    headers.append("RecaptchaPass")
    headers.append("StraightliningCount")
    for r in rows:
        # Auth_Flagged: True if either Auth_LLM or Auth_Bots is LOW or MIXED
        if auth_llm_idx is not None and auth_bots_idx is not None:
            llm = r[auth_llm_idx].strip().upper() if auth_llm_idx < len(r) else ""
            bots = r[auth_bots_idx].strip().upper() if auth_bots_idx < len(r) else ""
            flagged = llm in ("LOW", "MIXED") or bots in ("LOW", "MIXED")
        else:
            flagged = False
        r.append("True" if flagged else "False")
        # RecaptchaPass: True if Q_RecaptchaScore >= 0.5
        if recap_score_idx is not None and recap_score_idx < len(r):
            try:
                score = float(r[recap_score_idx].strip() or "1.0")
                r.append("True" if score >= 0.5 else "False")
            except ValueError:
                r.append("True")
        else:
            r.append("True")
        # StraightliningCount: integer from Q_StraightliningCount
        if sl_count_idx is not None and sl_count_idx < len(r):
            r.append(r[sl_count_idx].strip() or "0")
        else:
            r.append("0")
    print(f"  Added: Auth_Flagged, RecaptchaPass, StraightliningCount")

    # Step 5: Column exclusion
    print("\n--- De-identification Step 5: Column exclusion ---")
    dropped = sorted(COLUMNS_TO_DROP & set(headers))
    kept_headers, filtered_rows = filter_columns(headers, rows, COLUMNS_TO_DROP)
    prolific_dropped = [h for h in headers if h.startswith(PROLIFIC_DEMO_PREFIX)]
    print(f"  Dropped: {len(dropped) + len(prolific_dropped)} columns")
    print(f"  Kept: {len(kept_headers)} columns")

    # Write public dataset
    public_path = output_dir / "TABS_V2_CRP_public_dataset.csv"
    write_csv(public_path, kept_headers, filtered_rows)
    output_hash = sha256_file(public_path)
    print(f"\n  Public dataset: {public_path}")
    print(f"  Output SHA-256: {output_hash}")
    print(f"  Rows: {len(filtered_rows)}, Columns: {len(kept_headers)}")

    # Verify: re-scan for PII
    print("\n--- Verification: re-scan output for PII ---")
    verify_cols = [c for c in available_text_cols if c in kept_headers]
    verify_dicts = rows_to_dicts(filtered_rows, kept_headers)
    verify_flags = scan_pii(verify_dicts, verify_cols, row_offset=2)
    if verify_flags:
        print(f"  FAIL: {len(verify_flags)} PII pattern(s) still detected!")
        for flag in verify_flags:
            print(f"    Row {flag['row_number']}, {flag['column']}: {flag['pattern_type']}")
        public_path.unlink(missing_ok=True)
        print("  Public dataset REMOVED. Manual review required.")
        return 2

    print("  PASS: No PII patterns detected in output.")

    # Audit log
    log_path = output_dir / "deidentification_log.txt"
    with open(log_path, "w", encoding="utf-8") as f:
        f.write("DE-IDENTIFICATION AUDIT LOG - CRP DATASET\n")
        f.write("=" * 72 + "\n\n")
        f.write(f"Timestamp: {datetime.utcnow().isoformat()}Z\n")
        f.write(f"Output SHA-256: {output_hash}\n")
        f.write(f"Rows: {len(filtered_rows)}\n")
        f.write(f"Columns dropped: {len(dropped) + len(prolific_dropped)}"
                f" ({', '.join(dropped + prolific_dropped)})\n")
        f.write(f"PII flags found: {len(pii_flags)}\n")
        f.write(f"Redactions applied: {redaction_count}\n")
    print(f"  Audit log: {log_path}")

    return 0


# ─────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Build the final CRP public dataset (N=200) with "
                    "tiered quality-based selection and NIST de-identification.",
        epilog=(
            "Exit codes: 0=success, 1=PII review required or dry-run, "
            "2=output verification failed or input error"
        ),
    )
    parser.add_argument("input_csv", type=Path,
                        help="Path to enriched Qualtrics CSV (3 header rows)")
    parser.add_argument("--target-n", type=int, default=200,
                        help="Target sample size (default: 200)")
    parser.add_argument("--output-dir", type=Path, default=Path("./crp_dataset_output"),
                        help="Output directory (default: ./crp_dataset_output)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Show selection and scan PII without writing de-identified files")
    parser.add_argument(
        "--skip-review",
        action="store_true",
        help="Proceed with automated PII redaction without human review confirmation",
    )
    args = parser.parse_args()

    if not args.input_csv.exists():
        print(f"Error: input file not found: {args.input_csv}", file=sys.stderr)
        return 2

    # ── Load data ──
    print("=" * 78)
    print("  CRP DATASET BUILDER")
    print(f"  Input:    {args.input_csv}")
    print(f"  Target N: {args.target_n}")
    print(f"  Output:   {args.output_dir}")
    print(f"  Dry run:  {args.dry_run}")
    print(f"  Skip review: {args.skip_review}")
    print("=" * 78)

    print("\n--- Loading enriched Qualtrics CSV ---")
    headers, data = load_qualtrics_csv(str(args.input_csv))
    idx = make_idx(headers)
    print(f"  Loaded {len(data)} rows, {len(headers)} columns")

    # Validate required enrichment, tiering, and IRI attention-check columns
    required_columns = [
        "PROLIFIC_PID",
        "Prolific_Status",
        "ResponseId",
        "StartDate",
        "Finished",
        "Duration (in seconds)",
        BARRIER_IRI,
        READINESS_IRI,
        MATURITY_IRI,
        "Auth_LLM",
        "Auth_Bots",
        "Q_RecaptchaScore",
        "Q_StraightliningCount",
    ]
    missing_columns = [col for col in required_columns if col not in idx]
    if missing_columns:
        print(
            "Error: input CSV is missing required columns for enrichment/tiering: "
            + ", ".join(missing_columns),
            file=sys.stderr,
        )
        print(
            "Ensure you are using the enriched Qualtrics export and that the "
            "core Qualtrics columns needed for tiering have not been removed "
            "or renamed.",
            file=sys.stderr,
        )
        print(
            "Run scripts/analysis/enrich_qualtrics_csv.py first if enrichment "
            "columns are missing.",
            file=sys.stderr,
        )
        return 2

    # ── V2 filter and dedup ──
    print("\n--- V2 filtering and deduplication ---")
    v2 = filter_v2_and_dedup(data, idx)
    print(f"  V2 responses (deduplicated): {len(v2)}")

    # ── Build quality profiles ──
    print("\n--- Building quality profiles ---")
    profiles = [build_response_profile(row, idx) for row in v2]
    accepted = [p for p in profiles if p["prolific_status"] == "APPROVED"]
    print(f"  Prolific Accepted: {len(accepted)}")

    if len(accepted) < args.target_n:
        print(f"\n  WARNING: Only {len(accepted)} Prolific Accepted responses.")
        print(f"  Cannot reach target N={args.target_n}.")
        print(f"  Will select all {len(accepted)} available.")

    # ── Tiered selection ──
    print("\n--- Applying tiered selection ---")
    select_crp_sample(profiles, args.target_n)

    selected = [p for p in accepted if p["selected"]]
    print(f"  Selected: {len(selected)} / {len(accepted)}")

    # ── Generate manifest ──
    print("\n--- Generating selection manifest ---")
    manifest = generate_manifest(profiles, args.target_n)

    # Save manifest (confidential - contains ResponseIds and auth flags)
    args.output_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = args.output_dir / "selection_manifest_CONFIDENTIAL.txt"
    with open(manifest_path, "w", encoding="utf-8") as f:
        f.write(manifest)
    print(f"  Summary: selected {len(selected)} responses for target N={args.target_n}.")
    print(f"  Manifest saved: {manifest_path}")
    print("  (Full manifest withheld from stdout - contains confidential ResponseIds.)")

    # ── De-identify ──
    print("\n" + "=" * 78)
    print("  DE-IDENTIFICATION PIPELINE")
    print("=" * 78)

    selected_rows = [p["row"] for p in selected]
    result = deidentify_selected(
        selected_rows, headers, args.output_dir,
        skip_review=args.skip_review,
        dry_run=args.dry_run,
    )

    print("\n" + "=" * 78)
    if result == 0:
        print("  CRP DATASET COMPLETE")
        print(f"  Public dataset:  {args.output_dir / 'TABS_V2_CRP_public_dataset.csv'}")
        print(f"  Rows: {len(selected)}")
        print(f"\n  CONFIDENTIAL files (do NOT release):")
        print(f"    - {args.output_dir / 'responseid_mapping_CONFIDENTIAL.csv'}")
        print(f"    - {args.output_dir / 'prolific_linkage_CONFIDENTIAL.csv'}")
        print(f"    - {args.output_dir / 'pii_review_report_CONFIDENTIAL.txt'}")
        print(f"    - {args.output_dir / 'selection_manifest_CONFIDENTIAL.txt'}")
    else:
        if args.dry_run:
            print("  [DRY RUN] Selection manifest and PII scan complete.")
        elif result == 2:
            print("  CRP DATASET FAILED - output verification detected residual PII")
            print("  Public dataset was removed. Investigate pii_review_report_CONFIDENTIAL.txt")
            print("  and address the patterns before re-running.")
        else:
            print("  CRP DATASET PAUSED - review required")
            print("  Review pii_review_report_CONFIDENTIAL.txt, then re-run with --skip-review.")
    print("=" * 78)

    # Map deidentify_selected result to main() exit codes:
    #   0 → 0  success
    #   2 → 2  verification failure (distinct from input errors, also 2)
    #   1 → 1  PII review required or dry-run
    return result if result in (0, 2) else 1


if __name__ == "__main__":
    sys.exit(main())
