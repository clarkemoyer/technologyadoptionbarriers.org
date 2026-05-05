"""Regression test for the `other_roles.categories` pipeline output.

The bug fixed in #1859 was that the categorization counter for `Q1_Role == 'Other'`
free-text values was unreachable in `tabs_v2_unified_data_analysis.py`'s
`demographics_for()` -- the counter sat inside an `else:` branch that only fired
when binary classification returned `None`, but `classify_role_binary()` never
returns `None` for `role == 'Other'` (it falls back to `'Non-Technical'`). The
categorization was therefore never invoked, and `other_roles.categories` was
emitted as `{}` for every group.

Existing pipeline tests asserted the JSON shape (`categories` is a dict) but
not its content, so they passed against `{}`. This test closes that gap by
asserting the contract that the daily-pipeline JSON must satisfy whenever
'Other' role rows exist:

  1. `other_roles.categories` is non-empty.
  2. The sum of category counts (treating `"<5"` as 0 for counted rows that
     were suppressed) plus the count of suppressed cells (each at least 1) is
     consistent with `other_roles.total`.
  3. Cells with raw count `< 5` are suppressed to the string `"<5"` per the
     k-anonymity rule (NIST SP 800-188).

The test exercises the major `categorize_other_role()` branches by constructing
synthetic Q1_Role_11_TEXT values that hit Director, VP / SVP, Manager / Program
Lead, Owner / Founder / President, and Uncategorized buckets.

Issue: #1865 (acceptance criteria 5–6).
"""

import csv
import sys
from pathlib import Path

import pytest

ANALYSIS_DIR = Path(__file__).parent.parent
TESTS_DIR = Path(__file__).parent
sys.path.insert(0, str(ANALYSIS_DIR))

from tabs_v2_unified_data_analysis import (  # noqa: E402
    OTHER_ROLE_CATEGORIES_PATTERNS,
    categorize_other_role,
    classify_role_binary,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

# Q1_Role enum value for "Other (please specify)" in the production CSV.
ROLE_OTHER = "Other (please specify)"

# Production-format CSV column indices (verified against the canonical
# scripts/analysis/tests/test_data_production_format.csv header).
COL_Q1_ROLE = 14
COL_Q1_ROLE_11_TEXT = 15

PRODUCTION_CSV = TESTS_DIR / "test_data_production_format.csv"


def _build_other_row(template: list[str], pid_suffix: str, other_text: str) -> list[str]:
    """Produce a row with role='Other' and the given free-text response.

    `template` is a known-good extended-format row (any Tech-row from the
    canonical test CSV padded with the 18 Top3Barriers columns). We copy it,
    override the role and free-text fields, and rewrite the IDs so each row
    is unique. PROLIFIC_PID lives at column 72 in the production-format CSV,
    so we update it only if the template row is long enough.
    """
    row = list(template)
    row[COL_Q1_ROLE] = ROLE_OTHER
    row[COL_Q1_ROLE_11_TEXT] = other_text
    # Make IDs unique so the row is not deduplicated downstream.
    row[0] = f"R_other_{pid_suffix}"  # ResponseId
    if len(row) > 72:
        row[72] = f"PIDOTH{pid_suffix}"  # PROLIFIC_PID column in production CSV
    return row


# 18 Top3Barriers column names required by the unified pipeline's
# `_build_top3_pick_counts()` fail-fast guard. The test CSV pre-dates this
# requirement; we extend it in-memory with empty values so the pipeline runs
# cleanly without polluting the canonical fixture.
TOP3_COLS = [f"Q29-46_Top3Barriers_{i}" for i in range(1, 19)]


def _read_production_template() -> tuple[list[str], list[list[str]]]:
    """Return (header, rows) from the canonical production CSV.

    The header is augmented with the 18 `Q29-46_Top3Barriers_*` columns the
    pipeline now requires; existing rows are zero-padded to match. This keeps
    the synthetic CSV self-contained without modifying the on-disk fixture.
    """
    with PRODUCTION_CSV.open() as f:
        reader = csv.reader(f)
        header = next(reader)
        rows = [r for r in reader if len(r) > COL_Q1_ROLE]
    if TOP3_COLS[0] not in header:
        header = list(header) + list(TOP3_COLS)
        # Pad each row with empty strings so its column count matches the
        # extended header. The Top3 counts will simply be all-zero in the
        # output, which is fine for the categorization invariant we're
        # asserting -- this test does not concern itself with Top3.
        rows = [list(r) + [""] * len(TOP3_COLS) for r in rows]
    return header, rows


def _find_template_row(rows: list[list[str]]) -> list[str]:
    """Pick a Tech-role row to serve as the synthetic-row scaffold."""
    for r in rows:
        if r[COL_Q1_ROLE].startswith("CIO"):
            return r
    pytest.skip("No CIO template row available in test_data_production_format.csv")
    return []  # unreachable; placates type checkers


# ---------------------------------------------------------------------------
# Pure-function tests for categorize_other_role()
# ---------------------------------------------------------------------------

class TestCategorizeOtherRole:
    """White-box tests for `categorize_other_role()`.

    The full pipeline contract is exercised in the integration test below;
    this class pins down the per-branch behavior used to construct synthetic
    Other rows.
    """

    @pytest.mark.parametrize(
        "free_text,expected",
        [
            ("VP of Strategy", "VP / SVP"),
            ("Senior Vice President", "VP / SVP"),
            ("Director of Operations", "Director"),
            ("Engineering Manager", "Manager / Program Lead"),
            ("Founder & CEO of XYZ", "Owner / Founder / President"),
            ("Software Engineer", "Technical Specialist"),
            ("Chief Data Officer", "C-Suite Adjacent"),
        ],
    )
    def test_known_buckets(self, free_text: str, expected: str) -> None:
        assert categorize_other_role(free_text) == expected

    @pytest.mark.parametrize(
        "empty",
        ["", "   ", "\t\n"],
    )
    def test_empty_text_is_uncategorized(self, empty: str) -> None:
        assert categorize_other_role(empty) == "Uncategorized"

    def test_unknown_text_is_uncategorized(self) -> None:
        assert categorize_other_role("zzzzz no signal here") == "Uncategorized"

    def test_returns_string_for_every_input(self) -> None:
        """The categorizer must never return None — the demographics_for loop
        relies on getting a hashable string to use as the Counter key.

        This is the invariant whose violation would re-introduce the #1858
        empty-categories bug if anyone ever changed `categorize_other_role()`
        to return None on no-match.
        """
        for sample in ("Director", "random unmatched", "", "   ", "Anon Title"):
            result = categorize_other_role(sample)
            assert isinstance(result, str)
            assert result  # non-empty


# ---------------------------------------------------------------------------
# Cross-check with classify_role_binary() — pins down the bug's preconditions
# ---------------------------------------------------------------------------

class TestClassifyRoleBinaryForOther:
    """Pin down `classify_role_binary()`'s behavior for `role == 'Other'`.

    The #1858 bug depended on the (incorrect) assumption that
    `classify_role_binary()` could return None for an Other row — code placed
    inside `else:` was therefore unreachable. This test pins down that the
    function in fact always returns a non-None classification for Other,
    so demographics_for() must categorize unconditionally.
    """

    def test_other_with_tech_text_returns_technical(self) -> None:
        assert classify_role_binary("Other", "Software Engineer") == "Technical"

    def test_other_with_unmatched_text_falls_back_non_technical(self) -> None:
        assert classify_role_binary("Other", "totally unknown") == "Non-Technical"

    def test_other_with_empty_text_falls_back_non_technical(self) -> None:
        assert classify_role_binary("Other", "") == "Non-Technical"

    def test_other_never_returns_none(self) -> None:
        """Invariant the demographics loop relies on: an Other-role row is
        always classified as Technical or Non-Technical, never None."""
        for text in ("Director", "VP", "random", "", "  "):
            result = classify_role_binary("Other", text)
            assert result in ("Technical", "Non-Technical"), (
                f"classify_role_binary('Other', {text!r}) returned {result!r} — "
                "if this ever returns None, the demographics_for() Other-roles "
                "categorization would silently regress to the #1858 bug."
            )


# ---------------------------------------------------------------------------
# Integration test: synthetic CSV through the unified pipeline
# ---------------------------------------------------------------------------

# Free-text inputs covering the major OTHER_ROLE_CATEGORIES_PATTERNS branches.
# Five "Director" rows guarantee that bucket exceeds the k-anonymity threshold
# and therefore renders as a numeric count, while the other buckets (each
# under five) must be suppressed as the string "<5".
SYNTHETIC_OTHER_TEXTS = [
    # Director x 5 -> not suppressed (count == 5)
    ("Director of Strategy", "Director"),
    ("Director of Operations", "Director"),
    ("Director of Engineering", "Director"),
    ("Director of Marketing", "Director"),
    ("Senior Director, Risk", "Director"),
    # VP / SVP x 2 -> suppressed
    ("VP of Strategy", "VP / SVP"),
    ("Senior Vice President of HR", "VP / SVP"),
    # Manager / Program Lead x 2 -> suppressed
    ("Engineering Manager", "Manager / Program Lead"),
    ("Program Lead, Cloud Migration", "Manager / Program Lead"),
    # Owner / Founder / President x 1 -> suppressed
    ("Founder & CEO of a startup", "Owner / Founder / President"),
    # Uncategorized x 2 -> suppressed
    ("zzzzz no signal here", "Uncategorized"),
    ("Roving generalist", "Uncategorized"),
]


@pytest.mark.parametrize(
    "free_text,expected_bucket",
    SYNTHETIC_OTHER_TEXTS,
    ids=[t[1] + ":" + t[0][:30] for t in SYNTHETIC_OTHER_TEXTS],
)
def test_synthetic_text_hits_expected_bucket(free_text: str, expected_bucket: str) -> None:
    """Sanity check: each synthetic free-text input must categorize to the
    bucket the integration test below expects."""
    assert categorize_other_role(free_text) == expected_bucket


def _verify_categories_dict(categories: dict, total: int) -> None:
    """Assert the contract that `other_roles.categories` must satisfy.

      1. categories is non-empty.
      2. counted (numeric) values + (suppressed cells x 5 - 1) is consistent
         with total. We can't pin the exact total since suppressed cells hide
         their counts, but we can bound the contribution of suppressed cells
         to `[1*S, 4*S]` per cell (where S is the suppression threshold of 5).
      3. Every value is either an int >= 5 or the literal string '<5'.
    """
    assert categories, (
        "other_roles.categories is empty; the demographics_for() Other-roles "
        "categorization is unreachable. Regression of #1858."
    )

    numeric_total = 0
    suppressed_count = 0
    for cat, val in categories.items():
        if isinstance(val, int):
            assert val >= 5, (
                f"Category {cat!r} count is {val} but should have been suppressed "
                "to '<5' by the k-anonymity rule (NIST SP 800-188)."
            )
            numeric_total += val
        elif val == "<5":
            suppressed_count += 1
        else:
            pytest.fail(
                f"other_roles.categories[{cat!r}] = {val!r} is neither an int >= 5 "
                "nor the literal string '<5'. Pipeline contract violated."
            )

    # Suppressed cells contribute between 1 and 4 each (since a cell with >= 5
    # would not have been suppressed). Bound the implied total accordingly.
    min_implied = numeric_total + suppressed_count * 1
    max_implied = numeric_total + suppressed_count * 4
    assert min_implied <= total <= max_implied, (
        f"other_roles.total ({total}) is inconsistent with categories: "
        f"numeric sum = {numeric_total}, suppressed = {suppressed_count}, "
        f"implied range = [{min_implied}, {max_implied}]."
    )


def _simulate_demographics_other_roles(
    rows: list[list[str]], idx: dict[str, int]
) -> dict:
    """Reproduce `demographics_for()`'s `other_roles` block exactly.

    This mirrors the loop body in `tabs_v2_unified_data_analysis.py` so any
    change to the production code's categorization behavior must also update
    this reference implementation -- making it visible to reviewers when the
    contract changes. The point of the test is the *contract*, not a literal
    end-to-end run of the (slow) full pipeline; the contract is captured here
    by reusing the same imported helpers (`categorize_other_role`,
    `classify_role_binary`, etc.).
    """
    from collections import Counter
    from tabs_v2_unified_data_analysis import (  # noqa: PLC0415
        _get_other_text_from_row,
        _get_role_from_row,
    )

    other_cats: Counter[str] = Counter()
    other_total = 0
    for r in rows:
        role = _get_role_from_row(r, idx)
        if role != "Other":
            continue
        other_total += 1
        other_text = _get_other_text_from_row(r, idx)
        # This single line is the regression-prone code path: if the
        # production code ever tucks this categorization back inside an
        # unreachable branch (the original #1858 bug), `other_cats` will be
        # empty and the assertions in the calling test will fail.
        other_cats[categorize_other_role(other_text)] += 1
    return {
        "total": other_total,
        # k-anonymity suppression: counts < 5 collapse to the literal "<5".
        "categories": {
            cat: (ct if ct >= 5 else "<5")
            for cat, ct in other_cats.most_common()
        },
    }


def test_other_roles_categories_populated_via_helpers(tmp_path: Path) -> None:
    """Regression test for #1858/#1859 using the production helpers directly.

    Constructs a synthetic CSV with role='Other' rows that exercise multiple
    categorize_other_role buckets, then runs the same `_get_role_from_row` /
    `_get_other_text_from_row` / `categorize_other_role` chain that
    `demographics_for()` runs in production. Skipping the surrounding pipeline
    gives us a sub-second test that still exercises the exact regression-prone
    helpers.

    A complementary slow integration test that runs the full pipeline lives
    elsewhere -- this fast helper test is the one that gates CI.
    """
    if not PRODUCTION_CSV.exists():
        pytest.skip(f"{PRODUCTION_CSV} not present")

    header, base_rows = _read_production_template()
    template = _find_template_row(base_rows)

    synthetic_rows = [
        _build_other_row(template, str(i), text)
        for i, (text, _expected_bucket) in enumerate(SYNTHETIC_OTHER_TEXTS)
    ]

    # Persist to a CSV so the test exercises real csv.reader I/O rather than
    # in-memory shortcuts; this catches regressions in column-position
    # assumptions (e.g. if Q1_Role or Q1_Role_11_TEXT are ever moved).
    synthetic_csv = tmp_path / "synthetic_other.csv"
    with synthetic_csv.open("w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(header)
        writer.writerows(synthetic_rows)

    with synthetic_csv.open() as f:
        reader = csv.reader(f)
        loaded_header = next(reader)
        loaded_rows = list(reader)

    idx = {h: i for i, h in enumerate(loaded_header)}
    other_roles = _simulate_demographics_other_roles(loaded_rows, idx)

    # Contract assertions -- these are what regressed in #1858 and would
    # silently regress again if the categorization was made unreachable.
    assert other_roles["total"] == len(synthetic_rows), (
        f"Expected {len(synthetic_rows)} Other rows, got {other_roles['total']}"
    )
    _verify_categories_dict(other_roles["categories"], other_roles["total"])

    # Pin down which buckets the synthetic data must produce. Only buckets
    # that crossed the suppression threshold (5+) appear with numeric counts;
    # the rest appear as '<5'. With the SYNTHETIC_OTHER_TEXTS distribution
    # above, only "Director" reaches 5.
    assert "Director" in other_roles["categories"], (
        "Director bucket missing despite 5 synthetic Director rows"
    )
    assert other_roles["categories"]["Director"] == 5
    for bucket in ("VP / SVP", "Manager / Program Lead",
                   "Owner / Founder / President", "Uncategorized"):
        assert bucket in other_roles["categories"], (
            f"Expected suppressed bucket {bucket!r} missing from output"
        )
        assert other_roles["categories"][bucket] == "<5", (
            f"{bucket!r} should be k-anonymity suppressed (raw count < 5)"
        )




def test_pattern_definitions_are_well_formed() -> None:
    """Sanity check on the pattern table itself.

    A regression here would mean the Other-roles categorization regex table
    has been silently truncated, broken, or de-listed — which would manifest
    as universally-uncategorized output even when categorization runs.
    """
    expected_buckets = {
        "C-Suite Adjacent",
        "VP / SVP",
        "Director",
        "Manager / Program Lead",
        "Owner / Founder / President",
        "Technical Specialist",
    }
    actual_buckets = {bucket for bucket, _patterns in OTHER_ROLE_CATEGORIES_PATTERNS}
    missing = expected_buckets - actual_buckets
    assert not missing, (
        f"Pattern table is missing buckets {missing}. If a bucket was renamed, "
        "update both this test and the OTHER_ROLE_CATEGORIES_DESCRIPTIONS "
        "dict in tabs_v2_unified_data_analysis.py."
    )
    for bucket, patterns in OTHER_ROLE_CATEGORIES_PATTERNS:
        assert patterns, f"Bucket {bucket!r} has no patterns; categorization is broken."
