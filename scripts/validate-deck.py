#!/usr/bin/env python3
"""validate-deck.py - Offline PPTX deck statistics validator.

Reads a Qualtrics CSV export and a PPTX presentation file (or directory of
unpacked slide XML), computes survey statistics (item means, standard
deviations, grand construct means, and Pearson correlations), extracts
claimed numeric values from slide text, and reports PASS / FAIL for each
check.

Usage:
    python scripts/validate-deck.py <csv_path> <pptx_path>
    python scripts/validate-deck.py responses.csv deck.pptx
    python scripts/validate-deck.py responses.csv slides_dir/ --slides 8,10,19,20,21,22,23,24

The CSV must be a Qualtrics response export (three header rows: labels,
descriptions, import IDs).  The PPTX is parsed by extracting slide XML
from the ZIP archive; alternatively pass a directory of unpacked
``slideN.xml`` files.

Exit codes:
    0  All checks passed (or no checks were applicable)
    1  One or more checks failed
    2  Input / configuration error
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import re
import sys
import xml.etree.ElementTree as ET
import zipfile
from dataclasses import dataclass, field
from io import StringIO
from pathlib import Path

# Optional heavy-weight libraries - the script falls back to pure-Python
# implementations when they are absent.
try:
    from scipy import stats as scipy_stats

    _HAS_SCIPY = True
except ImportError:  # pragma: no cover
    _HAS_SCIPY = False

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

# Column-name patterns that identify each construct in the Qualtrics export.
# Default patterns match the TABS V2 Qualtrics column naming convention:
#   Q10-28_Barriers_1 … Q10-28_Barriers_19
#   Q47-64_Readiness_1 … Q47-64_Readiness_18
#   Q65-73_Maturity_1 … Q65-73_Maturity_9
# Override via --construct CLI option if your column names differ.
CONSTRUCT_PATTERNS: dict[str, str] = {
    "Barriers": r"^Q\d+-\d+_Barriers_\d+$",
    "Readiness": r"^Q\d+-\d+_Readiness_\d+$",
    "Maturity": r"^Q\d+-\d+_Maturity_\d+$",
}

# Default numeric comparison tolerance (absolute).
DEFAULT_TOLERANCE = 0.05

# Default slide numbers to validate (from the issue: slides 8, 10, 19-24).
DEFAULT_TARGET_SLIDES = [8, 10, 19, 20, 21, 22, 23, 24]


# ---------------------------------------------------------------------------
# Data classes
# ---------------------------------------------------------------------------


@dataclass
class CheckResult:
    """Outcome of a single validation check."""

    slide: int | str
    label: str
    expected: float
    actual: float | None
    tolerance: float
    passed: bool
    message: str = ""


@dataclass
class ValidationReport:
    """Aggregated validation results."""

    checks: list[CheckResult] = field(default_factory=list)

    @property
    def total(self) -> int:
        return len(self.checks)

    @property
    def passed(self) -> int:
        return sum(1 for c in self.checks if c.passed)

    @property
    def failed(self) -> int:
        return sum(1 for c in self.checks if not c.passed)

    @property
    def all_passed(self) -> bool:
        return self.failed == 0


# ---------------------------------------------------------------------------
# Qualtrics CSV parser
# ---------------------------------------------------------------------------


def parse_qualtrics_csv(
    csv_path: Path,
) -> tuple[list[str], list[dict[str, str]]]:
    """Parse a standard Qualtrics CSV export (three header rows).

    Returns ``(column_names, data_rows)`` where each data row is a dict
    keyed by column name.
    """

    text = csv_path.read_text(encoding="utf-8-sig")
    reader = csv.reader(StringIO(text))

    try:
        headers: list[str] = next(reader)  # Row 1 – column labels
        next(reader)  # Row 2 – long descriptions (skip)
        next(reader)  # Row 3 – import IDs (skip)
    except StopIteration:
        _log("Error: CSV has fewer than 3 header rows (expected Qualtrics 3-row format)")
        return [], []

    rows: list[dict[str, str]] = []
    skipped = 0
    for row in reader:
        if len(row) >= len(headers):
            rows.append(dict(zip(headers, row[:len(headers)])))
        elif row:
            skipped += 1

    if skipped > 0:
        _log(f"  Warning: skipped {skipped} row(s) with fewer columns than expected")

    return headers, rows


# ---------------------------------------------------------------------------
# PPTX / slide-XML text extraction
# ---------------------------------------------------------------------------


def _slide_sort_key(name: str) -> int:
    """Extract slide number from a filename for sorting."""
    m = re.search(r"(\d+)", name.rsplit("/", 1)[-1])
    return int(m.group(1)) if m else 0


def extract_slide_texts(pptx_path: Path) -> dict[int, str]:
    """Return ``{slide_number: concatenated_text}`` from a ``.pptx`` file."""

    slides: dict[int, str] = {}

    with zipfile.ZipFile(pptx_path, "r") as zf:
        slide_files = sorted(
            [
                n
                for n in zf.namelist()
                if re.match(r"ppt/slides/slide\d+\.xml$", n)
            ],
            key=_slide_sort_key,
        )

        for slide_file in slide_files:
            match = re.search(r"(\d+)", slide_file.rsplit("/", 1)[-1])
            if match is None:
                continue
            slide_num = int(match.group(1))
            tree = ET.parse(zf.open(slide_file))

            texts: list[str] = []
            for elem in tree.iter():
                local = elem.tag.split("}")[-1] if "}" in elem.tag else elem.tag
                if local == "t" and elem.text:
                    texts.append(elem.text)

            slides[slide_num] = " ".join(texts)

    return slides


def extract_slide_texts_from_dir(slides_dir: Path) -> dict[int, str]:
    """Return ``{slide_number: concatenated_text}`` from unpacked XML."""

    slides: dict[int, str] = {}

    for slide_file in sorted(
        slides_dir.glob("slide*.xml"),
        key=lambda p: _slide_sort_key(p.stem),
    ):
        match = re.search(r"(\d+)", slide_file.stem)
        if match is None:
            continue
        slide_num = int(match.group(1))
        tree = ET.parse(slide_file)

        texts: list[str] = []
        for elem in tree.iter():
            local = elem.tag.split("}")[-1] if "}" in elem.tag else elem.tag
            if local == "t" and elem.text:
                texts.append(elem.text)

        slides[slide_num] = " ".join(texts)

    return slides


# ---------------------------------------------------------------------------
# Statistics helpers
# ---------------------------------------------------------------------------


# Qualtrics Likert label-to-numeric mappings.
# When useLabels=true, response columns contain text; map them to the
# underlying numeric values so statistics can be computed.
_LIKERT_LABEL_MAP: dict[str, float] = {}

# Barriers (5-point: Not a Barrier=1 … Major Barrier=5)
for i, lbl in enumerate(
    ["Not a Barrier", "Minor Barrier", "Moderate Barrier", "Significant Barrier", "Major Barrier"],
    start=1,
):
    _LIKERT_LABEL_MAP[lbl.lower()] = float(i)

# Readiness (5-point: Very Low=1 … Very High=5)
for i, lbl in enumerate(
    [
        "Very Low Readiness/Capability",
        "Low Readiness/Capability",
        "Moderate Readiness/Capability",
        "High Readiness/Capability",
        "Very High Readiness/Capability",
    ],
    start=1,
):
    _LIKERT_LABEL_MAP[lbl.lower()] = float(i)

# Maturity (5-point: Level 1=1 … Level 5=5)
for i, lbl in enumerate(
    [
        "Level 1: Initial/Ad Hoc",
        "Level 2: Developing/Repeatable",
        "Level 3: Defined/Standardized",
        "Level 4: Managed/Quantitatively Managed",
        "Level 5: Optimizing/Innovating",
    ],
    start=1,
):
    _LIKERT_LABEL_MAP[lbl.lower()] = float(i)


def _safe_float(value: str) -> float | None:
    """Parse *value* as a finite float, or return ``None``.

    Also checks Qualtrics Likert text labels (e.g. "Major Barrier" → 5.0).
    """
    stripped = value.strip()
    # Try numeric first
    try:
        v = float(stripped)
        return v if math.isfinite(v) else None
    except (ValueError, AttributeError):
        pass
    # Try Likert label mapping
    mapped = _LIKERT_LABEL_MAP.get(stripped.lower())
    if mapped is not None:
        return mapped
    return None


def _pearson_r(xs: list[float], ys: list[float]) -> float | None:
    """Pearson correlation for two equal-length lists.

    Returns ``None`` when fewer than 3 valid pairs or zero variance.
    """
    pairs = [
        (x, y)
        for x, y in zip(xs, ys)
        if x is not None and y is not None
    ]
    n = len(pairs)
    if n < 3:
        return None

    if _HAS_SCIPY:
        a, b = zip(*pairs)
        r, _ = scipy_stats.pearsonr(a, b)
        return float(r) if math.isfinite(r) else None

    a, b = zip(*pairs)
    mean_a = sum(a) / n
    mean_b = sum(b) / n

    cov = sum((ai - mean_a) * (bi - mean_b) for ai, bi in pairs) / (n - 1)
    var_a = sum((ai - mean_a) ** 2 for ai in a) / (n - 1)
    var_b = sum((bi - mean_b) ** 2 for bi in b) / (n - 1)

    if var_a == 0 or var_b == 0:
        return None

    return cov / math.sqrt(var_a * var_b)


# ---------------------------------------------------------------------------
# Construct scoring
# ---------------------------------------------------------------------------


def compute_construct_scores(
    rows: list[dict[str, str]],
    headers: list[str],
    patterns: dict[str, str],
) -> dict[str, dict]:
    """Compute per-construct descriptive statistics.

    Returns a dict keyed by construct name, each containing:

    * ``items`` – matched column names
    * ``item_means`` / ``item_sds`` – per-item descriptive stats
    * ``grand_mean`` / ``grand_sd`` – construct-level (mean of respondent
      means)
    * ``n`` – number of respondents with at least one valid item value
    * ``respondent_means`` – list of per-respondent mean scores
    """

    results: dict[str, dict] = {}

    for construct, pattern in patterns.items():
        regex = re.compile(pattern, re.IGNORECASE)
        items = [h for h in headers if regex.match(h)]

        if not items:
            results[construct] = {
                "items": [],
                "item_means": {},
                "item_sds": {},
                "grand_mean": None,
                "grand_sd": None,
                "n": 0,
                "respondent_means": [],
                "respondent_means_indexed": [],
            }
            continue

        item_values: dict[str, list[float]] = {item: [] for item in items}
        # Track (row_index, mean) so correlations can align by respondent
        respondent_means_indexed: list[tuple[int, float]] = []

        for row_idx, row in enumerate(rows):
            valid_vals: list[float] = []
            for item in items:
                v = _safe_float(row.get(item, ""))
                if v is not None:
                    item_values[item].append(v)
                    valid_vals.append(v)
            if valid_vals:
                respondent_means_indexed.append((row_idx, sum(valid_vals) / len(valid_vals)))

        respondent_means = [m for _, m in respondent_means_indexed]

        # Item-level
        item_means: dict[str, float | None] = {}
        item_sds: dict[str, float | None] = {}
        for item in items:
            vals = item_values[item]
            if vals:
                mean = sum(vals) / len(vals)
                item_means[item] = mean
                if len(vals) > 1:
                    var = sum((v - mean) ** 2 for v in vals) / (len(vals) - 1)
                    item_sds[item] = math.sqrt(var)
                else:
                    item_sds[item] = None  # SD undefined for n=1
            else:
                item_means[item] = None
                item_sds[item] = None

        # Construct-level
        grand_mean: float | None = None
        grand_sd: float | None = None
        if respondent_means:
            grand_mean = sum(respondent_means) / len(respondent_means)
            if len(respondent_means) > 1:
                var = sum((v - grand_mean) ** 2 for v in respondent_means) / (
                    len(respondent_means) - 1
                )
                grand_sd = math.sqrt(var)
            else:
                grand_sd = None  # SD undefined for n=1

        results[construct] = {
            "items": items,
            "item_means": item_means,
            "item_sds": item_sds,
            "grand_mean": grand_mean,
            "grand_sd": grand_sd,
            "n": len(respondent_means),
            "respondent_means": respondent_means,
            "respondent_means_indexed": respondent_means_indexed,
        }

    return results


def compute_correlations(
    constructs: dict[str, dict],
) -> dict[str, float | None]:
    """Pairwise Pearson correlations between construct respondent means.

    Uses indexed respondent means so partial responders are correctly
    aligned by row index (only respondents present in both constructs
    contribute to the correlation).
    """

    pairs: dict[str, float | None] = {}
    names = list(constructs.keys())

    for i, name_a in enumerate(names):
        for name_b in names[i + 1 :]:
            indexed_a = constructs[name_a].get("respondent_means_indexed", [])
            indexed_b = constructs[name_b].get("respondent_means_indexed", [])

            # Build index → mean maps and intersect on common respondents
            map_a = dict(indexed_a)
            map_b = dict(indexed_b)
            common = sorted(set(map_a) & set(map_b))

            if len(common) >= 3:
                r = _pearson_r(
                    [map_a[idx] for idx in common],
                    [map_b[idx] for idx in common],
                )
            else:
                r = None

            label = f"{name_a[0]}-{name_b[0]}" if name_a and name_b else "?-?"
            pairs[label] = r

    return pairs


# ---------------------------------------------------------------------------
# Numeric value extraction from slide text
# ---------------------------------------------------------------------------

_NUMBER_RE = re.compile(r"-?\d+(?:\.\d+)?")


def _extract_numbers(text: str) -> list[float]:
    """Extract all numeric values (integer and decimal) from *text*."""
    return [float(m) for m in _NUMBER_RE.findall(text)]


# ---------------------------------------------------------------------------
# Matching / validation helpers
# ---------------------------------------------------------------------------


def _find_closest(
    target: float, candidates: list[float], tolerance: float
) -> float | None:
    """Return the candidate closest to *target* within *tolerance*, or None."""
    best: float | None = None
    best_diff = float("inf")
    for c in candidates:
        diff = abs(c - target)
        if diff <= tolerance and diff < best_diff:
            best = c
            best_diff = diff
    return best


def _check_value(
    slide: int | str,
    label: str,
    expected: float,
    candidates: list[float],
    tolerance: float,
) -> CheckResult:
    match = _find_closest(expected, candidates, tolerance)
    if match is not None:
        return CheckResult(
            slide=slide,
            label=label,
            expected=expected,
            actual=match,
            tolerance=tolerance,
            passed=True,
            message=f"found {match:.4f} (expected {expected:.4f})",
        )
    return CheckResult(
        slide=slide,
        label=label,
        expected=expected,
        actual=None,
        tolerance=tolerance,
        passed=False,
        message=f"expected {expected:.4f} not found (tolerance ±{tolerance})",
    )


# ---------------------------------------------------------------------------
# Main validation pipeline
# ---------------------------------------------------------------------------


def _log(msg: str) -> None:
    """Write a progress message to stderr (keeps stdout clean for --json)."""
    print(msg, file=sys.stderr)


def run_validation(
    csv_path: Path,
    pptx_path: Path,
    tolerance: float = DEFAULT_TOLERANCE,
    target_slides: list[int] | None = None,
    construct_patterns: dict[str, str] | None = None,
) -> ValidationReport | None:
    """Execute the full validation pipeline and return a report."""

    report = ValidationReport()
    patterns = construct_patterns or CONSTRUCT_PATTERNS

    # ---- 1. Parse CSV ----
    _log(f"Reading CSV: {csv_path}")
    headers, rows = parse_qualtrics_csv(csv_path)
    _log(f"  {len(headers)} columns, {len(rows)} data rows")

    # ---- 2. Extract slide text ----
    if pptx_path.is_dir():
        _log(f"Reading slide XML from directory: {pptx_path}")
        slide_texts = extract_slide_texts_from_dir(pptx_path)
    elif pptx_path.suffix.lower() == ".pptx":
        _log(f"Reading PPTX: {pptx_path}")
        slide_texts = extract_slide_texts(pptx_path)
    else:
        _log(f"Error: {pptx_path} is neither a .pptx file nor a directory")
        return None  # signals input error to caller

    _log(f"  {len(slide_texts)} slides found")

    if target_slides:
        missing = [s for s in target_slides if s not in slide_texts]
        if missing:
            _log(f"  Warning: requested slides not found in PPTX: {missing}")
        slide_texts = {k: v for k, v in slide_texts.items() if k in target_slides}
        _log(f"  Validating target slides: {sorted(slide_texts.keys())}")

    # ---- 3. Compute statistics ----
    _log("\nComputing statistics from CSV...")
    constructs = compute_construct_scores(rows, headers, patterns)

    for name, data in constructs.items():
        gm = data["grand_mean"]
        gsd = data["grand_sd"]
        gm_str = f"{gm:.4f}" if gm is not None else "N/A"
        gsd_str = f"{gsd:.4f}" if gsd is not None else "N/A"
        _log(
            f"  {name}: {len(data['items'])} items, n={data['n']}, "
            f"M={gm_str}, SD={gsd_str}"
        )

    correlations = compute_correlations(constructs)
    for label, r in correlations.items():
        r_str = f"{r:.4f}" if r is not None else "N/A"
        _log(f"  Correlation {label}: r={r_str}")

    # ---- 4. Extract numbers from slides ----
    slide_numbers: dict[int, list[float]] = {}
    for sn, text in slide_texts.items():
        slide_numbers[sn] = _extract_numbers(text)

    # ---- 5. Validate values ----
    _log(f"\nValidating values (tolerance ±{tolerance})...")
    all_sns = sorted(slide_texts.keys())

    for construct_name, data in constructs.items():
        # Item means
        for item_name, item_mean in data["item_means"].items():
            if item_mean is None:
                continue
            for sn in all_sns:
                result = _check_value(
                    sn, f"{item_name} mean", item_mean, slide_numbers.get(sn, []), tolerance
                )
                if result.passed:
                    report.checks.append(result)
                    break
            else:
                report.checks.append(
                    CheckResult(
                        slide="any",
                        label=f"{item_name} mean",
                        expected=item_mean,
                        actual=None,
                        tolerance=tolerance,
                        passed=False,
                        message=f"expected {item_mean:.4f} not found on any checked slide",
                    )
                )

        # Item SDs
        for item_name, item_sd in data["item_sds"].items():
            if item_sd is None:
                continue
            for sn in all_sns:
                result = _check_value(
                    sn, f"{item_name} SD", item_sd, slide_numbers.get(sn, []), tolerance
                )
                if result.passed:
                    report.checks.append(result)
                    break
            else:
                report.checks.append(
                    CheckResult(
                        slide="any",
                        label=f"{item_name} SD",
                        expected=item_sd,
                        actual=None,
                        tolerance=tolerance,
                        passed=False,
                        message=f"expected {item_sd:.4f} not found on any checked slide",
                    )
                )

        # Grand mean
        if data["grand_mean"] is not None:
            for sn in all_sns:
                result = _check_value(
                    sn,
                    f"{construct_name} grand mean",
                    data["grand_mean"],
                    slide_numbers.get(sn, []),
                    tolerance,
                )
                if result.passed:
                    report.checks.append(result)
                    break
            else:
                report.checks.append(
                    CheckResult(
                        slide="any",
                        label=f"{construct_name} grand mean",
                        expected=data["grand_mean"],
                        actual=None,
                        tolerance=tolerance,
                        passed=False,
                        message=f"expected {data['grand_mean']:.4f} not found on any checked slide",
                    )
                )

        # Grand SD
        if data["grand_sd"] is not None:
            for sn in all_sns:
                result = _check_value(
                    sn,
                    f"{construct_name} grand SD",
                    data["grand_sd"],
                    slide_numbers.get(sn, []),
                    tolerance,
                )
                if result.passed:
                    report.checks.append(result)
                    break
            else:
                report.checks.append(
                    CheckResult(
                        slide="any",
                        label=f"{construct_name} grand SD",
                        expected=data["grand_sd"],
                        actual=None,
                        tolerance=tolerance,
                        passed=False,
                        message=f"expected {data['grand_sd']:.4f} not found on any checked slide",
                    )
                )

    # Correlations
    for corr_label, r in correlations.items():
        if r is None:
            continue
        for sn in all_sns:
            result = _check_value(
                sn,
                f"Correlation {corr_label}",
                r,
                slide_numbers.get(sn, []),
                tolerance,
            )
            if result.passed:
                report.checks.append(result)
                break
        else:
            report.checks.append(
                CheckResult(
                    slide="any",
                    label=f"Correlation {corr_label}",
                    expected=r,
                    actual=None,
                    tolerance=tolerance,
                    passed=False,
                    message=f"expected r={r:.4f} not found on any checked slide",
                )
            )

    return report


# ---------------------------------------------------------------------------
# Output
# ---------------------------------------------------------------------------


def print_report(report: ValidationReport) -> None:
    """Print a human-readable validation report to stdout."""

    print("\n" + "=" * 72)
    print("DECK VALIDATION REPORT")
    print("=" * 72)

    if not report.checks:
        print("\nNo checks were performed.")
        print("Hint: ensure the CSV contains columns matching the construct")
        print("patterns (Q10-28_Barriers_1, Q47-64_Readiness_1, …) and the")
        print("PPTX contains slides with numeric values.")
        return

    failed = [c for c in report.checks if not c.passed]
    passed = [c for c in report.checks if c.passed]

    if failed:
        print(f"\nFAILED CHECKS ({len(failed)}):")
        for c in failed:
            print(f"  FAIL  slide {str(c.slide):>4}  {c.label:<35}  {c.message}")

    if passed:
        print(f"\nPASSED CHECKS ({len(passed)}):")
        for c in passed:
            print(f"  PASS  slide {str(c.slide):>4}  {c.label:<35}  {c.message}")

    print(
        f"\nSUMMARY: {report.passed}/{report.total} passed, "
        f"{report.failed}/{report.total} failed"
    )

    if report.all_passed:
        print("RESULT: ALL CHECKS PASSED")
    else:
        print("RESULT: SOME CHECKS FAILED")


def report_as_json(report: ValidationReport) -> str:
    """Serialize the report to a JSON string."""

    return json.dumps(
        {
            "total": report.total,
            "passed": report.passed,
            "failed": report.failed,
            "checks": [
                {
                    "slide": c.slide,
                    "label": c.label,
                    "expected": c.expected,
                    "actual": c.actual,
                    "tolerance": c.tolerance,
                    "passed": c.passed,
                    "message": c.message,
                }
                for c in report.checks
            ],
        },
        indent=2,
    )


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Validate PPTX deck statistics against a Qualtrics CSV export",
        epilog="Exit codes: 0 = all passed, 1 = failures found, 2 = input error",
    )
    parser.add_argument(
        "csv_path",
        type=Path,
        help="Path to Qualtrics CSV response export",
    )
    parser.add_argument(
        "pptx_path",
        type=Path,
        help="Path to .pptx file or directory of unpacked slide XML files",
    )
    parser.add_argument(
        "--tolerance",
        type=float,
        default=DEFAULT_TOLERANCE,
        help=f"Absolute tolerance for numeric comparisons (default: {DEFAULT_TOLERANCE})",
    )
    parser.add_argument(
        "--slides",
        type=str,
        default=None,
        help=(
            "Comma-separated slide numbers to check "
            f"(default: {','.join(str(s) for s in DEFAULT_TARGET_SLIDES)})"
        ),
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output results as JSON instead of human-readable text",
    )
    parser.add_argument(
        "--construct",
        action="append",
        metavar="NAME=PATTERN",
        help=(
            "Override a construct column pattern, e.g. "
            "'--construct Barriers=^B_\\d+$'. May be repeated."
        ),
    )

    args = parser.parse_args()

    if not args.csv_path.exists():
        print(f"Error: CSV file not found: {args.csv_path}", file=sys.stderr)
        return 2

    if not args.pptx_path.exists():
        print(f"Error: PPTX path not found: {args.pptx_path}", file=sys.stderr)
        return 2

    target_slides: list[int] | None
    if args.slides is not None:
        target_slides = [int(s.strip()) for s in args.slides.split(",")]
    else:
        target_slides = DEFAULT_TARGET_SLIDES

    custom_patterns: dict[str, str] | None = None
    if args.construct:
        custom_patterns = dict(CONSTRUCT_PATTERNS)
        for item in args.construct:
            if "=" not in item:
                print(f"Error: --construct must be NAME=PATTERN, got: {item}", file=sys.stderr)
                return 2
            name, pattern = item.split("=", 1)
            custom_patterns[name] = pattern

    report = run_validation(
        csv_path=args.csv_path,
        pptx_path=args.pptx_path,
        tolerance=args.tolerance,
        target_slides=target_slides,
        construct_patterns=custom_patterns,
    )

    if report is None:
        return 2  # input error

    if args.json:
        print(report_as_json(report))
    else:
        print_report(report)

    if report.total == 0:
        _log("Warning: no checks were performed - verify CSV columns match construct patterns")
        return 1
    return 0 if report.all_passed else 1


if __name__ == "__main__":
    raise SystemExit(main())
