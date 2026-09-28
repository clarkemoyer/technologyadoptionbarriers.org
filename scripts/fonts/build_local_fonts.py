#!/usr/bin/env python3
"""Regenerate the self-hosted web fonts in ``src/fonts/``.

The site used to load its typefaces through ``next/font/google``, which
downloads every font from fonts.googleapis.com / fonts.gstatic.com during
``next build``. When Google Fonts was slow or unreachable the build failed
(``Module not found: Can't resolve '@vercel/turbopack-next/internal/font/
google/font'``) and the deploy for that commit was skipped. The fonts are
now committed to the repository and loaded with ``next/font/local``, so the
build never touches the network for fonts.

This script is the reproducible recipe for those committed files. It is NOT
run during the build; run it only when adding a family, changing weights, or
refreshing from upstream.

Source of truth: the official google/fonts repository (the same files the
Google Fonts API serves), except Lato, which the API still serves at an older
version than the repository holds and is therefore fetched from the API
itself (see FAMILIES). Clone the needed folders first:

    git clone --depth 1 --filter=blob:none --sparse \
        https://github.com/google/fonts.git /tmp/gfonts
    git -C /tmp/gfonts sparse-checkout set \
        ofl/opensans ofl/lato ofl/raleway ofl/faustina ofl/cantataone \
        ofl/faunaone ofl/montserrat ofl/cinzel ofl/outfit \
        ofl/plusjakartasans ofl/firacode

    pip install -r scripts/fonts/requirements.txt
    python scripts/fonts/build_local_fonts.py --source /tmp/gfonts

For each family the script:
  1. Keeps the full weight axis and pins any other axis to its default, as
     Google Fonts does, and checks the axis covers the weights declared in
     ``src/lib/fonts.ts``.
  2. Subsets each face into a preloaded Latin file and an on-demand
     extended file (see GOOGLE_SUBSETS below), recording the exact unicode-range
     each file must be declared with.
  3. Writes WOFF2 plus the family's OFL.txt (required by the SIL Open Font
     License) and records provenance in ``src/fonts/manifest.json``.
"""

from __future__ import annotations

import argparse
import hashlib
import io
import json
import re
import shutil
import subprocess
import sys
import tempfile
import urllib.request
from dataclasses import dataclass
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

REPO_ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = REPO_ROOT / "src" / "fonts"

# Each face is split into two files, mirroring how Google Fonts serves them:
#
#   *-latin.woff2  Google's "latin" subset. Preloaded on every page. Declared
#                  with Google's latin unicode-range verbatim.
#   *-ext.woff2    The other Google subsets this site needs, limited to the
#                  ones Google actually served for that family (Family.ext):
#                  "latin-ext" for all, plus "greek" (statistics notation)
#                  for Open Sans and Fira Code and box-drawing "symbols2"
#                  for Fira Code. NOT preloaded. Its unicode-range is the
#                  exact set of code points the file contains (recorded as
#                  "unicode_range" in manifest.json), so the browser fetches
#                  it only when a page uses a glyph the font really has.
#
# Restricting to Google's per-family subsets keeps rendering identical to
# the previous next/font/google output: any character Google didn't serve
# for a family (e.g. the U+2139 / U+2197 icons in the navigation, or Greek
# in Lato) still falls through to the next font in the stack. Cyrillic,
# Vietnamese and Hebrew are dropped - the site has no content in them.
#
# The declared ranges are copied verbatim into src/lib/fonts.ts (next/font
# requires literal options); __tests__/lib/fonts.test.ts fails if they drift.
GOOGLE_SUBSETS = {
    "latin": (
        "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, "
        "U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, "
        "U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"
    ),
    "latin-ext": (
        "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, "
        "U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, "
        "U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF"
    ),
    "greek": (
        "U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF"
    ),
    "symbols2": "U+2000-2001, U+2004-2008, U+200A, U+23B8-23BD, U+2500-259F",
}

# Code points already covered by the preloaded latin file are excluded from
# the ext file's declared range so the two faces never overlap.
_LATIN_CPS = set(subset.parse_unicodes(GOOGLE_SUBSETS["latin"].replace(" ", "")))


def to_unicode_range(codepoints: set[int]) -> str:
    """Compress code points into a CSS unicode-range list (U+XXXX-YYYY)."""
    out: list[str] = []
    cps = sorted(codepoints)
    i = 0
    while i < len(cps):
        j = i
        while j + 1 < len(cps) and cps[j + 1] == cps[j] + 1:
            j += 1
        out.append(f"U+{cps[i]:04X}" if i == j else f"U+{cps[i]:04X}-{cps[j]:04X}")
        i = j + 1
    return ", ".join(out)


@dataclass(frozen=True)
class Family:
    slug: str  # folder in google/fonts ofl/ and in src/fonts/
    name: str  # CSS family name
    weights: tuple[int, ...]  # weights declared in src/lib/fonts.ts
    variable: str | None = None  # variable source file, if any
    statics: dict[int, str] | None = None  # weight -> static source file
    ext: tuple[str, ...] = ("latin-ext",)  # Google subsets merged into *-ext
    # Google recomputes OS/2.xAvgCharWidth per subset for this family instead
    # of keeping the upstream value (verified against the files
    # next/font/google downloaded). Recomputing over our subset lands within
    # 2 font units of Google's value (1051 vs 1049 for Open Sans latin).
    recalc_avg_width: bool = False

    def subsets(self) -> dict[str, str]:
        """Map output subset name -> comma-separated unicode ranges."""
        return {
            "latin": GOOGLE_SUBSETS["latin"],
            "ext": ", ".join(GOOGLE_SUBSETS[name] for name in self.ext),
        }

    def faces(self) -> dict[str, tuple[str, int | None]]:
        """Map output file stem -> (source file, static weight or None)."""
        stem = self.name.replace(" ", "")
        if self.variable:
            return {f"{stem}-Variable": (self.variable, None)}
        assert self.statics
        return {f"{stem}-{w}": (src, w) for w, src in sorted(self.statics.items())}


FAMILIES = [
    Family("opensans", "Open Sans", (400, 500, 600, 700, 800), variable="OpenSans[wdth,wght].ttf",
           ext=("latin-ext", "greek"), recalc_avg_width=True),
    # The Google Fonts API still serves Lato 1.104 ("Western+Polish"), while
    # google/fonts ofl/lato holds Lato 2.015, which has different metrics and
    # spacing. Lato is the site's body font, so take it from the API to keep
    # the rendered site identical to what next/font/google produced.
    Family("lato", "Lato", (400, 700), statics={400: "api:Lato:400", 700: "api:Lato:700"}),
    Family("raleway", "Raleway", (400, 500, 600, 700), variable="Raleway[wght].ttf"),
    Family("faustina", "Faustina", (400, 500, 600, 700), variable="Faustina[wght].ttf"),
    Family("cantataone", "Cantata One", (400,), statics={400: "CantataOne-Regular.ttf"}),
    Family("faunaone", "Fauna One", (400,), statics={400: "FaunaOne-Regular.ttf"}),
    Family("montserrat", "Montserrat", (400, 500, 600, 700), variable="Montserrat[wght].ttf"),
    Family("cinzel", "Cinzel", (400, 500, 600, 700), variable="Cinzel[wght].ttf"),
    Family("outfit", "Outfit", (300, 400, 600, 700), variable="Outfit[wght].ttf"),
    Family("plusjakartasans", "Plus Jakarta Sans", (400, 500, 700), variable="PlusJakartaSans[wght].ttf"),
    Family("firacode", "Fira Code", (400, 500), variable="FiraCode[wght].ttf", ext=("latin-ext", "greek", "symbols2")),
]


API_CSS = "https://fonts.googleapis.com/css2?family={family}:wght@{weight}"


def fetch_from_api(spec: str, cache_dir: Path) -> tuple[Path, str]:
    """Download the full (unsubsetted) TTF the Google Fonts API serves.

    ``spec`` is ``api:<Family>:<weight>``. Without a browser User-Agent the
    API answers with one un-subsetted TrueType file per weight.
    """
    _, family, weight = spec.split(":")
    css_url = API_CSS.format(family=family.replace(" ", "+"), weight=weight)
    req = urllib.request.Request(css_url, headers={"User-Agent": "build_local_fonts.py"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        css = resp.read().decode("utf-8")
    urls = re.findall(r"url\((https://fonts\.gstatic\.com/[^)]+\.ttf)\)", css)
    if len(urls) != 1:
        raise SystemExit(f"{spec}: expected exactly one TTF URL, got {urls}")
    dest = cache_dir / f"{family.replace(' ', '')}-{weight}.ttf"
    with urllib.request.urlopen(urls[0], timeout=60) as resp:
        dest.write_bytes(resp.read())
    return dest, urls[0]


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def build_font(
    src: Path,
    dest: Path,
    weights: tuple[int, ...],
    static_weight: int | None,
    unicodes: str,
    recalc_avg_width: bool,
) -> set[int]:
    """Write one subset WOFF2; return the code points it maps."""
    # recalcTimestamp=False keeps the upstream head.modified date, so running
    # the script twice produces byte-identical files (reviewable diffs).
    font = TTFont(src, recalcTimestamp=False)
    source_avg_width = font["OS/2"].xAvgCharWidth
    if "fvar" in font:
        # Google Fonts serves each variable family with its full weight axis
        # and every other axis pinned to its default (e.g. Open Sans wdth=100).
        # Keeping the full wght axis keeps outlines and advance widths the same
        # as Google served; limiting the range re-derives deltas and shifted
        # glyph positions by fractions of a pixel in side-by-side screenshots.
        pinned = {a.axisTag: a.defaultValue for a in font["fvar"].axes if a.axisTag != "wght"}
        if pinned:
            font = instancer.instantiateVariableFont(font, pinned)
            # Round-trip through bytes so the subsetter sees fully compiled
            # tables (it cannot subset the instancer's lazily-loaded gvar).
            buf = io.BytesIO()
            font.save(buf)
            buf.seek(0)
            font = TTFont(buf, recalcTimestamp=False)
        axes = {a.axisTag: a for a in font["fvar"].axes}
        wght = axes.get("wght")
        if wght is None or not (wght.minValue <= min(weights) and max(weights) <= wght.maxValue):
            raise SystemExit(f"{src.name}: wght axis does not cover declared weights {weights}")
    elif static_weight is not None:
        actual = font["OS/2"].usWeightClass
        if actual != static_weight:
            raise SystemExit(f"{src.name}: usWeightClass {actual} != expected {static_weight}")

    options = subset.Options()
    options.flavor = "woff2"
    # Match what Google Fonts ships: fontTools' default feature set (kern,
    # liga, calt, ccmp, locl, mark/mkmk, frac, numr/dnom, ...) plus numeral
    # forms. Stylistic sets, small caps and swashes are dropped as Google
    # does - they multiply glyph counts and the site doesn't use them.
    options.layout_features = options.layout_features + ["tnum", "pnum", "lnum"]
    # Google serves unhinted WOFF2 to modern browsers; TrueType hinting
    # instructions roughly double file size for no benefit on current
    # rasterizers.
    options.hinting = False
    options.name_IDs = ["*"]  # keep copyright/license name records
    options.name_languages = ["*"]
    options.notdef_outline = True
    options.glyph_names = False
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=subset.parse_unicodes(unicodes.replace(" ", "")))
    subsetter.subset(font)
    # OS/2.xAvgCharWidth feeds the default width of form controls (Chrome
    # sizes an <input> from it), so follow what Google served: the upstream
    # value, or a per-subset recomputation where Google does that.
    if recalc_avg_width:
        font["OS/2"].xAvgCharWidth = font["OS/2"].recalcAvgCharWidth(font)
    else:
        font["OS/2"].xAvgCharWidth = source_avg_width
    dest.parent.mkdir(parents=True, exist_ok=True)
    mapped = set(font.getBestCmap() or {})
    font.flavor = "woff2"
    font.save(dest)
    return mapped


def upstream_commit(source: Path) -> str | None:
    try:
        return subprocess.run(
            ["git", "-C", str(source), "rev-parse", "HEAD"],
            check=True, capture_output=True, text=True,
        ).stdout.strip()
    except (OSError, subprocess.CalledProcessError):
        return None


def build_all(source: Path, api_cache: Path, manifest: dict[str, object]) -> int:
    """Build every family into OUT_DIR, filling manifest["families"]."""
    families: dict[str, object] = {}
    manifest["families"] = families
    for fam in FAMILIES:
        src_dir = source / "ofl" / fam.slug
        if not src_dir.is_dir():
            print(f"missing {src_dir}", file=sys.stderr)
            return 1
        out_dir = OUT_DIR / fam.slug
        if out_dir.exists():
            shutil.rmtree(out_dir)
        out_dir.mkdir(parents=True)
        shutil.copyfile(src_dir / "OFL.txt", out_dir / "OFL.txt")

        files = {}
        for stem, (src_name, static_weight) in fam.faces().items():
            if src_name.startswith("api:"):
                src, source_ref = fetch_from_api(src_name, api_cache)
            else:
                src, source_ref = src_dir / src_name, f"ofl/{fam.slug}/{src_name}"
            for subset_name, unicodes in fam.subsets().items():
                out_name = f"{stem}-{subset_name}.woff2"
                dest = out_dir / out_name
                mapped = build_font(
                    src,
                    dest,
                    fam.weights,
                    static_weight,
                    unicodes,
                    fam.recalc_avg_width,
                )
                if subset_name == "latin":
                    declared = GOOGLE_SUBSETS["latin"]
                else:
                    declared = to_unicode_range(mapped - _LATIN_CPS)
                    if not declared:
                        raise SystemExit(f"{out_name}: no code points beyond latin")
                files[out_name] = {
                    "source": source_ref,
                    "source_sha256": sha256(src),
                    "subset": subset_name,
                    "codepoints": len(mapped),
                    "unicode_range": declared,
                    "sha256": sha256(dest),
                    "bytes": dest.stat().st_size,
                }
                print(
                    f"{fam.name:<18} {out_name:<38} {len(mapped):5d} cps "
                    f"{dest.stat().st_size / 1024:6.1f} KiB"
                )
        families[fam.name] = {
            "folder": f"src/fonts/{fam.slug}",
            "weights": list(fam.weights),
            "ext_subsets": list(fam.ext),
            "license": "SIL Open Font License 1.1 (see OFL.txt)",
            "files": files,
        }

    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--source", required=True, type=Path, help="Path to a google/fonts checkout")
    args = parser.parse_args()

    manifest: dict[str, object] = {
        "generator": "scripts/fonts/build_local_fonts.py",
        "upstream": "https://github.com/google/fonts",
        "upstream_commit": upstream_commit(args.source),
        "google_subsets": GOOGLE_SUBSETS,
        "families": {},
    }

    with tempfile.TemporaryDirectory(prefix="gfonts-api-") as tmp:
        status = build_all(args.source, Path(tmp), manifest)
    if status:
        return status

    manifest_path = OUT_DIR / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    # CI runs `prettier --check .`; format the manifest the same way.
    try:
        subprocess.run(
            ["pnpm", "exec", "prettier", "--write", str(manifest_path)],
            check=True, cwd=REPO_ROOT, capture_output=True,
        )
    except (OSError, subprocess.CalledProcessError) as exc:
        print(f"warning: run `pnpm exec prettier --write {manifest_path}` ({exc})", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
