#!/usr/bin/env python3
"""deidentify_tabs_data.py - De-identification pipeline for TABS V2 public dataset.

Implements the 5-step NIST Expert Determination protocol described in CRP
Appendix L for preparing survey data for ScholarSphere deposit.

Steps:
    1. Free-text PII scan and redaction
    2. ResponseId replacement (sequential TABS_V2_NNN)
    3. Timestamp generalization (date-only)
    4. Column exclusion (drop PII/platform columns)
    5. Prolific linkage file separation

Prolific Data Handling:
    Per Prolific's researcher guidelines (https://researcher-help.prolific.com):
    - Prolific IDs (PIDs) are pseudonymous identifiers that link to participant
      profiles containing real identities. PIDs MUST be removed from public
      datasets. This script drops PROLIFIC_PID in step 4 and preserves the
      ResponseId-to-PID mapping in a separate confidential linkage file.
    - Prolific demographic data (age, sex, country from participant profiles)
      is treated as personal data under UK/EU GDPR. If present in the enriched
      CSV (Prolific_* columns), these are dropped along with other PII columns.
    - Researchers must not attempt to re-identify participants through the
      pseudonymized or de-identified data.

Usage:
    python3 scripts/deidentify_tabs_data.py <input_csv> <output_dir>
    python3 scripts/deidentify_tabs_data.py data.csv output/ --dry-run
    python3 scripts/deidentify_tabs_data.py data.csv output/ --skip-review

The dataset outputs (public CSV, mapping, linkage) are deterministic: same
input always produces the same output.  Report files (PII report, audit log)
include run timestamps for provenance tracking.

Exit codes:
    0  Success
    1  PII flagged (requires human review, use --skip-review to proceed)
    2  Input / configuration error
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import re
import sys
from datetime import datetime
from io import StringIO
from pathlib import Path

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

# Columns to DROP entirely (PII and platform identifiers)
COLUMNS_TO_DROP = {
    "IPAddress",
    "PROLIFIC_PID",
    "STUDY_ID",
    "SESSION_ID",
    "COMPLETE_URL",
    "SOURCE",
    "RecipientLastName",
    "RecipientFirstName",
    "RecipientEmail",
    "ExternalReference",
    "LocationLatitude",
    "LocationLongitude",
    # Enrichment columns added by enrich_qualtrics_csv.py
    "Auth_LLM",
    "Auth_Bots",
    "Prolific_Status",
}

# Prolific demographic columns (Prolific_*) are also dropped if present.
# These are added dynamically; see filter_columns() which drops any column
# matching the COLUMNS_TO_DROP set or starting with "Prolific_".
PROLIFIC_DEMO_PREFIX = "Prolific_"

# Free-text columns to scan for PII
FREE_TEXT_COLUMNS = [
    "Q74_Feedback",
    "Q1_Role_11_TEXT",
    "Q3_Industry_26_TEXT",
]

# Columns containing timestamps to generalize
TIMESTAMP_COLUMNS = ["StartDate", "EndDate", "RecordedDate"]

# Columns needed for the Prolific linkage file
PROLIFIC_LINKAGE_COLUMNS = [
    "ResponseId",
    "PROLIFIC_PID",
    "STUDY_ID",
    "SESSION_ID",
    "COMPLETE_URL",
]

# PII detection patterns
PII_PATTERNS = [
    (re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"), "email address"),
    (re.compile(r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b"), "phone number"),
    (re.compile(r"https?://\S+", re.IGNORECASE), "URL"),
    (
        re.compile(
            r"\b(?:work(?:s|ing)?|employed|job|position)\s+(?:at|for|with)\s+([A-Z][A-Za-z\s&.,']{2,30})",
            re.IGNORECASE,
        ),
        "employer reference",
    ),
    (
        re.compile(r"\$\s*[\d,]+(?:\.\d+)?\s*(?:million|billion|M|B|k)?\b", re.IGNORECASE),
        "dollar amount",
    ),
    (
        re.compile(
            r"\b\d[\d,]*\s+employees\b",
            re.IGNORECASE,
        ),
        "employee count",
    ),
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def sha256_file(path: Path) -> str:
    """Compute SHA-256 hash of a file."""
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def parse_qualtrics_csv(
    csv_path: Path,
) -> tuple[list[str], list[str], list[str], list[dict[str, str]]] | None:
    """Parse a Qualtrics CSV export with 3 header rows.

    Returns (headers, description_row, import_id_row, data_rows), or None on error.
    """
    text = csv_path.read_text(encoding="utf-8-sig")
    reader = csv.reader(StringIO(text))

    try:
        headers = next(reader)
        description_row = next(reader)
        import_id_row = next(reader)
    except StopIteration:
        print("Error: CSV has fewer than 3 header rows", file=sys.stderr)
        return None

    rows: list[dict[str, str]] = []
    for row in reader:
        if len(row) >= len(headers):
            rows.append(dict(zip(headers, row[: len(headers)])))
        elif row and any(cell.strip() for cell in row):
            rows.append(dict(zip(headers, row + [""] * (len(headers) - len(row)))))

    return headers, description_row, import_id_row, rows


# ---------------------------------------------------------------------------
# Step 1: Free-text PII scan
# ---------------------------------------------------------------------------


def scan_pii(
    rows: list[dict[str, str]],
    free_text_columns: list[str],
    row_offset: int = 4,
) -> list[dict]:
    """Scan free-text columns for PII patterns.

    Args:
        row_offset: Added to row_index for CSV row numbers.
            Use 4 for Qualtrics input (3 header rows + 1-indexed).
            Use 2 for output CSV (1 header row + 1-indexed).

    Returns a list of flagged items: {row_index, column, pattern_type, match, text}.
    """
    flags: list[dict] = []

    for row_idx, row in enumerate(rows):
        for col in free_text_columns:
            text = row.get(col, "").strip()
            if not text or text.lower() == "none":
                continue

            for pattern, pattern_type in PII_PATTERNS:
                for match in pattern.finditer(text):
                    # Use captured group if available (e.g., just the company name),
                    # otherwise use the full match
                    redact_target = match.group(1) if match.lastindex else match.group()
                    flags.append(
                        {
                            "row_index": row_idx,
                            "row_number": row_idx + row_offset,
                            "column": col,
                            "pattern_type": pattern_type,
                            "match": redact_target,
                            "text": text,
                        }
                    )

    return flags


def redact_pii(rows: list[dict[str, str]], flags: list[dict]) -> int:
    """Apply [REDACTED] to all flagged PII matches. Returns count of redactions."""
    redaction_count = 0
    for flag in flags:
        row = rows[flag["row_index"]]
        col = flag["column"]
        original = row[col]
        redacted = original.replace(flag["match"], "[REDACTED]")
        if redacted != original:
            row[col] = redacted
            redaction_count += 1
    return redaction_count


# ---------------------------------------------------------------------------
# Step 2: ResponseId replacement
# ---------------------------------------------------------------------------


def replace_response_ids(
    rows: list[dict[str, str]],
) -> tuple[list[dict[str, str]], list[tuple[str, str]]]:
    """Replace ResponseId with sequential TABS_V2_NNN identifiers.

    Sorts by StartDate for chronological ordering.
    Returns (rows, mapping) where mapping is [(original_id, new_id), ...].
    """
    # Sort by StartDate
    rows.sort(key=lambda r: r.get("StartDate", ""))

    mapping: list[tuple[str, str]] = []
    for i, row in enumerate(rows, start=1):
        original_id = row.get("ResponseId", "")
        new_id = f"TABS_V2_{i:03d}"
        mapping.append((original_id, new_id))
        row["ResponseId"] = new_id

    return rows, mapping


# ---------------------------------------------------------------------------
# Step 3: Timestamp generalization
# ---------------------------------------------------------------------------


def generalize_timestamps(rows: list[dict[str, str]], columns: list[str]) -> None:
    """Generalize timestamp columns to date-only format."""
    for row in rows:
        for col in columns:
            val = row.get(col, "").strip()
            if not val:
                continue
            # Try parsing common Qualtrics timestamp formats
            date_part = val.split(" ")[0] if " " in val else val
            row[col] = date_part


# ---------------------------------------------------------------------------
# Step 4: Column exclusion
# ---------------------------------------------------------------------------


def filter_columns(
    headers: list[str], rows: list[dict[str, str]], drop_columns: set[str]
) -> tuple[list[str], list[dict[str, str]]]:
    """Remove specified columns and Prolific_* demographic columns from headers and all rows."""
    kept_headers = [h for h in headers
                    if h not in drop_columns and not h.startswith(PROLIFIC_DEMO_PREFIX)]
    filtered_rows = [{h: row.get(h, "") for h in kept_headers} for row in rows]
    return kept_headers, filtered_rows


# ---------------------------------------------------------------------------
# Step 5: Prolific linkage file
# ---------------------------------------------------------------------------


def extract_linkage(
    rows: list[dict[str, str]], linkage_columns: list[str]
) -> list[dict[str, str]]:
    """Extract Prolific linkage data before column removal."""
    return [{col: row.get(col, "") for col in linkage_columns} for row in rows]


# ---------------------------------------------------------------------------
# Output writers
# ---------------------------------------------------------------------------


def write_csv(path: Path, headers: list[str], rows: list[dict[str, str]]) -> None:
    """Write a CSV file."""
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=headers, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def write_pii_report(path: Path, flags: list[dict]) -> None:
    """Write the PII review report."""
    with open(path, "w", encoding="utf-8") as f:
        f.write("PII REVIEW REPORT\n")
        f.write(f"Generated: {datetime.utcnow().isoformat()}Z\n")
        f.write(f"Total flags: {len(flags)}\n")
        f.write("=" * 72 + "\n\n")

        if not flags:
            f.write("No PII patterns detected in free-text fields.\n")
            return

        for i, flag in enumerate(flags, 1):
            f.write(f"Flag {i}:\n")
            f.write(f"  Row (CSV): {flag['row_number']}\n")
            f.write(f"  Column: {flag['column']}\n")
            f.write(f"  Type: {flag['pattern_type']}\n")
            f.write(f"  Match: {flag['match']}\n")
            f.write(f"  Full text: {flag['text'][:200]}{'...' if len(flag['text']) > 200 else ''}\n")
            f.write("\n")


def write_audit_log(
    path: Path,
    input_path: Path,
    input_hash: str,
    output_hash: str,
    rows_processed: int,
    columns_dropped: list[str],
    pii_flags: int,
    redactions: int,
    dry_run: bool,
) -> None:
    """Write the de-identification audit log."""
    with open(path, "w", encoding="utf-8") as f:
        f.write("DE-IDENTIFICATION AUDIT LOG\n")
        f.write("=" * 72 + "\n\n")
        f.write(f"Timestamp: {datetime.utcnow().isoformat()}Z\n")
        f.write(f"Mode: {'DRY RUN' if dry_run else 'FULL RUN'}\n")
        f.write(f"Input file: {input_path}\n")
        f.write(f"Input SHA-256: {input_hash}\n")
        f.write(f"Output SHA-256: {output_hash if not dry_run else 'N/A (dry run)'}\n")
        f.write(f"Rows processed: {rows_processed}\n")
        f.write(f"Columns dropped: {len(columns_dropped)} ({', '.join(columns_dropped)})\n")
        f.write(f"PII flags found: {pii_flags}\n")
        f.write(f"Redactions applied: {redactions if not dry_run else 'N/A (dry run)'}\n")


# ---------------------------------------------------------------------------
# Main pipeline
# ---------------------------------------------------------------------------


def main() -> int:
    parser = argparse.ArgumentParser(
        description="De-identify TABS V2 survey data for ScholarSphere release",
        epilog="Exit codes: 0 = success, 1 = PII flagged (needs review), 2 = input error",
    )
    parser.add_argument("input_csv", type=Path, help="Path to Qualtrics CSV export")
    parser.add_argument("output_dir", type=Path, help="Directory for output files")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Produce PII report without modifying data",
    )
    parser.add_argument(
        "--skip-review",
        action="store_true",
        help="Apply all automated steps without human PII confirmation",
    )
    args = parser.parse_args()

    if not args.input_csv.exists():
        print(f"Error: input file not found: {args.input_csv}", file=sys.stderr)
        return 2

    args.output_dir.mkdir(parents=True, exist_ok=True)

    input_hash = sha256_file(args.input_csv)
    print(f"Input: {args.input_csv}")
    print(f"SHA-256: {input_hash}")

    # Parse CSV
    result = parse_qualtrics_csv(args.input_csv)
    if result is None:
        return 2
    headers, _desc_row, _import_row, rows = result
    print(f"Parsed: {len(rows)} data rows, {len(headers)} columns")

    # Validate required columns exist
    required = {"ResponseId", "StartDate"}
    missing = required - set(headers)
    if missing:
        print(f"Error: required columns missing from CSV: {missing}", file=sys.stderr)
        return 2

    # Step 1: PII scan
    print("\n--- Step 1: Free-text PII scan ---")
    available_text_cols = [c for c in FREE_TEXT_COLUMNS if c in headers]
    pii_flags = scan_pii(rows, available_text_cols)
    print(f"  Scanned columns: {available_text_cols}")
    print(f"  PII flags found: {len(pii_flags)}")

    # Write PII report (always, even in dry-run)
    pii_report_path = args.output_dir / "pii_review_report.txt"
    write_pii_report(pii_report_path, pii_flags)
    print(f"  Report: {pii_report_path}")

    if args.dry_run:
        print("\n[DRY RUN] Stopping after PII scan. Review the report above.")
        write_audit_log(
            args.output_dir / "deidentification_log.txt",
            args.input_csv,
            input_hash,
            "",
            len(rows),
            sorted(COLUMNS_TO_DROP & set(headers)),
            len(pii_flags),
            0,
            dry_run=True,
        )
        return 1 if pii_flags else 0

    if pii_flags and not args.skip_review:
        print(f"\n{len(pii_flags)} PII flag(s) require human review.")
        print(f"Review: {pii_report_path}")
        print("Re-run with --skip-review to proceed with automated redaction.")
        return 1

    # Apply redactions
    redaction_count = 0
    if pii_flags:
        redaction_count = redact_pii(rows, pii_flags)
        print(f"  Redactions applied: {redaction_count}")

    # Extract Prolific linkage BEFORE ResponseId replacement (needs original IDs)
    print("\n--- Step 2: Prolific linkage file (extracted before ID replacement) ---")
    available_linkage_cols = [c for c in PROLIFIC_LINKAGE_COLUMNS if c in headers]
    linkage_data = extract_linkage(rows, available_linkage_cols)
    linkage_path = args.output_dir / "prolific_linkage_CONFIDENTIAL.csv"
    write_csv(linkage_path, available_linkage_cols, linkage_data)
    print(f"  Saved: {linkage_path} ({len(linkage_data)} rows)")

    # Step 3: ResponseId replacement
    print("\n--- Step 3: ResponseId replacement ---")
    rows, id_mapping = replace_response_ids(rows)
    mapping_path = args.output_dir / "responseid_mapping.csv"
    with open(mapping_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["original_response_id", "anonymous_id"])
        writer.writerows(id_mapping)
    print(f"  Saved: {mapping_path} ({len(id_mapping)} mappings)")

    # Step 4: Timestamp generalization
    print("\n--- Step 4: Timestamp generalization ---")
    available_ts_cols = [c for c in TIMESTAMP_COLUMNS if c in headers]
    generalize_timestamps(rows, available_ts_cols)
    print(f"  Generalized: {available_ts_cols}")

    # Step 5: Column exclusion
    print("\n--- Step 5: Column exclusion ---")
    columns_actually_dropped = sorted(COLUMNS_TO_DROP & set(headers))
    kept_headers, filtered_rows = filter_columns(headers, rows, COLUMNS_TO_DROP)
    print(f"  Dropped: {len(columns_actually_dropped)} columns")
    print(f"  Kept: {len(kept_headers)} columns")

    # Write public dataset
    public_path = args.output_dir / "TABS_V2_public_dataset.csv"
    write_csv(public_path, kept_headers, filtered_rows)
    output_hash = sha256_file(public_path)
    print(f"\n  Public dataset: {public_path}")
    print(f"  Output SHA-256: {output_hash}")
    print(f"  Rows: {len(filtered_rows)}, Columns: {len(kept_headers)}")

    # Verify: re-scan output for PII
    print("\n--- Verification: re-scan output for PII ---")
    verify_flags = scan_pii(filtered_rows, [c for c in available_text_cols if c in kept_headers], row_offset=2)
    if verify_flags:
        print(f"  FAIL: {len(verify_flags)} PII pattern(s) still detected in output!")
        for flag in verify_flags:
            print(f"    Row {flag['row_number']}, {flag['column']}: {flag['pattern_type']}")
        public_path.unlink(missing_ok=True)
        print("\n  Public dataset REMOVED due to PII detection. Manual review required.")
    else:
        print("  PASS: No PII patterns detected in output.")
    verification_failed = len(verify_flags) > 0

    # Write audit log
    write_audit_log(
        args.output_dir / "deidentification_log.txt",
        args.input_csv,
        input_hash,
        output_hash,
        len(rows),
        columns_actually_dropped,
        len(pii_flags),
        redaction_count,
        dry_run=False,
    )
    print(f"\n  Audit log: {args.output_dir / 'deidentification_log.txt'}")

    print("\n" + "=" * 72)
    if verification_failed:
        print("DE-IDENTIFICATION FAILED - PII detected in output")
        print("  Public dataset was removed. Review the PII report and re-run.")
    else:
        print("DE-IDENTIFICATION COMPLETE")
        print(f"  Public dataset: {public_path}")
    print(f"  CONFIDENTIAL files (do NOT release):")
    print(f"    - {mapping_path}")
    print(f"    - {linkage_path}")
    print("=" * 72)

    return 1 if verification_failed else 0


if __name__ == "__main__":
    sys.exit(main())
