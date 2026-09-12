#!/usr/bin/env python3
"""Audit npm and Python dependencies against the software-citations catalog.

Reads ``package.json`` and ``scripts/analysis/requirements.txt``, then
compares each dependency against the entries in
``src/data/software-citations.json``.  Reports which packages are not yet
cataloged and exits non-zero when *key* packages (listed in
``key_packages`` within the catalog) are missing.

Usage:
    python scripts/audit-software-citations.py [options]

Options:
    --strict     Exit 1 if *any* uncited package is found (not just key ones).
    --catalog    Path to software-citations.json (default: src/data/software-citations.json)
    --pkg        Path to package.json (default: package.json)
    --req        Path to requirements.txt (default: scripts/analysis/requirements.txt)
    --skip-dev   Skip devDependencies from package.json (default: include them)

Exit codes:
    0  All key packages are cited (informational warnings may still appear)
    1  One or more key packages are not in the catalog (or --strict and any missing)
    2  Input error (missing file, JSON parse error, etc.)
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _load_json(path: Path) -> dict:
    """Load and parse a JSON file; exit 2 on error."""
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        print(f"ERROR: File not found: {path}", file=sys.stderr)
        sys.exit(2)
    except json.JSONDecodeError as exc:
        print(f"ERROR: JSON parse error in {path}: {exc}", file=sys.stderr)
        sys.exit(2)


def _parse_requirements(path: Path) -> list[str]:
    """Return normalised package names from a pip requirements file.

    Handles:
    - Comment lines (``#``)
    - Version specifiers (``==``, ``>=``, ``<=``, ``!=``, ``~=``, ``>``, ``<``)
    - Blank lines
    - Options lines (``-r``, ``-c``, ``--index-url``, etc.)
    - Extras syntax (``package[extra]``)
    """
    if not path.exists():
        return []
    packages: list[str] = []
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or line.startswith("-"):
            continue
        # Strip extras and version specifiers
        name = re.split(r"[>=<!~\[\s;@]", line)[0].strip()
        if name:
            packages.append(_normalise_pip(name))
    return packages


def _normalise_pip(name: str) -> str:
    """Normalise a pip package name (PEP 503 canonical form: lowercase, hyphens)."""
    return re.sub(r"[-_.]+", "-", name).lower()


def _normalise_npm(name: str) -> str:
    """Return npm package name lowercased (scoped packages kept as-is)."""
    return name.lower()


# ---------------------------------------------------------------------------
# Main audit logic
# ---------------------------------------------------------------------------

def build_catalog_index(catalog: dict) -> tuple[dict[str, dict], set[str], set[str]]:
    """Return (entries_by_pkg, key_npm, key_pip) from the catalog."""
    entries_by_pkg: dict[str, dict] = {}
    for entry in catalog.get("entries", []):
        ecosystem = entry.get("ecosystem", "")
        pkg = entry.get("package_name", "")
        if ecosystem == "npm":
            key = ("npm", _normalise_npm(pkg))
        elif ecosystem == "pip":
            key = ("pip", _normalise_pip(pkg))
        else:
            continue
        entries_by_pkg[key] = entry

    key_packages = catalog.get("key_packages", {})
    key_npm = {_normalise_npm(p) for p in key_packages.get("npm", [])}
    key_pip = {_normalise_pip(p) for p in key_packages.get("pip", [])}

    return entries_by_pkg, key_npm, key_pip


def audit(
    catalog_path: Path,
    pkg_path: Path,
    req_path: Path,
    skip_dev: bool,
    strict: bool,
) -> int:
    """Run the audit and return an exit code."""
    catalog = _load_json(catalog_path)
    pkg_json = _load_json(pkg_path)

    entries_by_pkg, key_npm, key_pip = build_catalog_index(catalog)

    # ── npm dependencies ──────────────────────────────────────────────────
    npm_deps: dict[str, str] = {}
    npm_deps.update(pkg_json.get("dependencies", {}))
    if not skip_dev:
        npm_deps.update(pkg_json.get("devDependencies", {}))

    uncited_key: list[str] = []
    uncited_other: list[str] = []
    cited_count = 0

    for pkg_name in sorted(npm_deps.keys()):
        norm = _normalise_npm(pkg_name)
        key = ("npm", norm)
        if key in entries_by_pkg:
            cited_count += 1
        elif norm in key_npm:
            uncited_key.append(f"npm:{pkg_name}  [KEY PACKAGE]")
        else:
            uncited_other.append(f"npm:{pkg_name}")

    # ── pip dependencies ──────────────────────────────────────────────────
    pip_deps = _parse_requirements(req_path)
    for pkg_name in sorted(pip_deps):
        norm = _normalise_pip(pkg_name)
        key = ("pip", norm)
        if key in entries_by_pkg:
            cited_count += 1
        elif norm in key_pip:
            uncited_key.append(f"pip:{pkg_name}  [KEY PACKAGE]")
        else:
            uncited_other.append(f"pip:{pkg_name}")

    # ── Report ────────────────────────────────────────────────────────────
    total_checked = cited_count + len(uncited_key) + len(uncited_other)
    print(f"Software citations audit — catalog: {catalog_path}")
    print(f"Checked {total_checked} packages ({len(npm_deps)} npm, {len(pip_deps)} pip)")
    print(f"  Cited:   {cited_count}")
    print(f"  Missing: {len(uncited_key) + len(uncited_other)}")

    if uncited_key:
        print("\n[FAIL] Key packages not in catalog (must add for compliance):")
        for item in uncited_key:
            print(f"  • {item}")

    if uncited_other:
        label = "[FAIL]" if strict else "[INFO]"
        print(f"\n{label} Other packages not yet cited:")
        for item in uncited_other:
            print(f"  • {item}")

    if not uncited_key and not uncited_other:
        print("\n✓ All packages are cited.")

    if uncited_key:
        return 1
    if strict and uncited_other:
        return 1
    return 0


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    repo_root = Path(__file__).parent.parent

    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Exit 1 if any uncited package is found, not just key packages.",
    )
    parser.add_argument(
        "--catalog",
        type=Path,
        default=repo_root / "src" / "data" / "software-citations.json",
        help="Path to software-citations.json",
    )
    parser.add_argument(
        "--pkg",
        type=Path,
        default=repo_root / "package.json",
        help="Path to package.json",
    )
    parser.add_argument(
        "--req",
        type=Path,
        default=repo_root / "scripts" / "analysis" / "requirements.txt",
        help="Path to requirements.txt",
    )
    parser.add_argument(
        "--skip-dev",
        action="store_true",
        help="Skip devDependencies from package.json.",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = _parse_args(argv)
    return audit(
        catalog_path=args.catalog,
        pkg_path=args.pkg,
        req_path=args.req,
        skip_dev=args.skip_dev,
        strict=args.strict,
    )


if __name__ == "__main__":
    sys.exit(main())
