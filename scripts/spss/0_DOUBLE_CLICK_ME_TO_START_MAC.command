#!/usr/bin/env bash
# =====================================================================
# TABS V2 CRP-200 Validation - macOS double-click launcher
# =====================================================================
# Mirrors 0_DOUBLE_CLICK_ME_TO_START_WINDOWS.bat:
#   1. Confirms zip was extracted.
#   2. Locates SPSS Statistics + SPSS-bundled python3.
#   3. Pre-installs semopy via SPSS-bundled Python so the .sps Python
#      blocks can import it immediately when SPSS reaches them.
#   4. Generates a combined runtime .sps with absolute CD prepended.
#   5. Launches SPSS interactively with the combined file.
#   6. Terminal stays open until the recipient closes it.
# =====================================================================

set -uo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$HERE"

echo "=========================================================="
echo "TABS V2 CRP-200 Validation - macOS launcher"
echo "Working folder: $HERE"
echo "=========================================================="
echo

NOT_EXTRACTED=0
case "$HERE" in
  */AppTranslocation/*)               NOT_EXTRACTED=1 ;;
  */private/var/folders/*/T/*)        NOT_EXTRACTED=1 ;;
  */tmp/*Archive*)                    NOT_EXTRACTED=1 ;;
esac
[ ! -f "$HERE/tabs_v2_crp200_spss.sav" ] && NOT_EXTRACTED=1
[ ! -f "$HERE/tabs_v2_validation.sps" ] && NOT_EXTRACTED=1

if [ "$NOT_EXTRACTED" = "1" ]; then
  cat <<EXTRACT_MSG
====================================================================

           YOU NEED TO EXTRACT THE ZIP FIRST.

====================================================================

It looks like you double-clicked this file from inside the zip
archive (without unzipping first), or copied just this .command
file somewhere on its own.

This launcher needs its sibling files (the .sav data, the .sps
syntax, etc.) in the same folder.

Detected folder: $HERE

Please:
  1. Close this window.
  2. Find the original zip file: tabs_v2_validation_spss.zip
  3. Double-click the zip in Finder. macOS Archive Utility extracts
     the entire archive into a folder next to the zip.
  4. Open that EXTRACTED folder.
  5. Right-click 0_DOUBLE_CLICK_ME_TO_START_MAC.command -> Open
     (the first time only, to satisfy macOS Gatekeeper).

====================================================================

Press Enter to close...
EXTRACT_MSG
  read -r _
  exit 1
fi

# Locate SPSS app bundle.
SPSS_APP=""
for candidate in \
    "/Applications/IBM SPSS Statistics/SPSSStatistics.app" \
    "/Applications/IBM SPSS Statistics 31/SPSSStatistics.app" \
    "/Applications/IBM SPSS Statistics 30/SPSSStatistics.app" \
    "/Applications/IBM SPSS Statistics 29/SPSSStatistics.app" \
    "/Applications/IBM SPSS Statistics 28/SPSSStatistics.app" \
    "/Applications/IBM SPSS Statistics 27/SPSSStatistics.app"; do
  if [ -d "$candidate" ]; then
    SPSS_APP="$candidate"
    break
  fi
done

if [ -z "$SPSS_APP" ]; then
  echo "ERROR: IBM SPSS Statistics was not found in /Applications."
  echo "       Install SPSS 24+ or open tabs_v2_validation.sps manually."
  echo
  echo "Press Enter to close..."
  read -r _
  exit 1
fi
echo "Found SPSS at: $SPSS_APP"

# Locate SPSS-bundled Python.
SPSS_PYTHON=""
for python_candidate in \
    "$SPSS_APP/Contents/Frameworks/Python3.framework/Versions/Current/bin/python3" \
    "$SPSS_APP/Contents/Resources/Python3/bin/python3" \
    "$(dirname "$SPSS_APP")/Python3/bin/python3"; do
  if [ -x "$python_candidate" ]; then
    SPSS_PYTHON="$python_candidate"
    break
  fi
done

if [ -n "$SPSS_PYTHON" ]; then
  echo "Found SPSS Python: $SPSS_PYTHON"
else
  echo "WARNING: SPSS-bundled Python not found in standard locations."
  echo "         Section 13 (CFA via Python) may skip; R fallback in Section 14."
fi
echo

# Pre-install semopy BEFORE launching SPSS.
if [ -n "$SPSS_PYTHON" ]; then
  echo "----------------------------------------------------------"
  echo "Checking Python SEM packages (numpy, pandas, scipy, semopy)"
  echo "----------------------------------------------------------"
  if "$SPSS_PYTHON" -c "import semopy" >/dev/null 2>&1; then
    echo "OK: semopy is already installed. Skipping install step."
  else
    echo "semopy is not yet installed. Installing now (~30 sec)..."
    echo
    "$SPSS_PYTHON" -m pip install --user --upgrade pip
    if "$SPSS_PYTHON" -m pip install --user semopy; then
      echo
      echo "OK: semopy installed successfully."
    else
      echo
      echo "WARNING: pip install failed. Section 13 (Python CFA) will skip."
      echo "         R fallback in Section 14 will activate if lavaan is installed."
    fi
  fi
  echo
fi

# Pre-install R packages for Section 14 fallback (lavaan invariance +
# semTools omega from CFA). Optional but adds the metric/scalar
# measurement-invariance Delta-CFI tests semopy does not compute.
RSCRIPT=""
for r_candidate in \
    "$SPSS_APP/Contents/Frameworks/R.framework/Versions/Current/Resources/bin/Rscript" \
    "$SPSS_APP/Contents/Resources/R/bin/Rscript" \
    "$(dirname "$SPSS_APP")/R/bin/Rscript"; do
  if [ -x "$r_candidate" ]; then
    RSCRIPT="$r_candidate"
    break
  fi
done

if [ -n "$RSCRIPT" ]; then
  echo "----------------------------------------------------------"
  echo "Checking R SEM packages (lavaan, semTools)"
  echo "----------------------------------------------------------"
  # Positive form (no leading "!" - safer across shells where ! has special meaning).
  if "$RSCRIPT" -e "quit(status = if (requireNamespace('lavaan', quietly = TRUE)) 0 else 1)" >/dev/null 2>&1; then
    echo "OK: lavaan is already installed. Skipping install step."
  else
    echo "lavaan is not yet installed. Installing now (~3-5 min, ~50 MB)..."
    echo "Press Ctrl+C now to skip and continue with Python only."
    echo
    if "$RSCRIPT" -e "lib<-.libPaths()[1]; cat('Installing to:',lib,'\\n'); install.packages(c('lavaan','semTools'), repos='https://cloud.r-project.org', lib=lib, dependencies=TRUE)"; then
      echo
      echo "OK: lavaan + semTools installed successfully."
    else
      echo
      echo "WARNING: R install failed. Section 14 will skip; Python results are still complete."
    fi
  fi
  echo
fi

# Build the combined runtime syntax with absolute CD prepended.
COMBINED="$HERE/_run_validation.sps"
{
  echo "* Auto-generated combined syntax. Prepends absolute CD then INSERTs"
  echo "* tabs_v2_validation.sps. Regenerated each launcher run; safe to delete."
  echo "*."
  echo
  echo "CD '$HERE'."
  echo
  cat "$HERE/tabs_v2_validation.sps"
} > "$COMBINED"

echo "Combined syntax generated: $COMBINED"
echo

cat <<MSG
SPSS Statistics is opening. When it appears:

  >>  Click  Run > All   (or press Cmd+A then Cmd+R)  <<

The validation runs for about 90 seconds. Outputs land here:
  - spv_export.xlsx        (open in Excel, Numbers, or LibreOffice)
  - Post_Run_Results.spv   (open in SPSS Viewer or SmartReader)

SPSS stays open afterwards so you can drill into any table.

MSG

open -a "$SPSS_APP" "$COMBINED"

echo
echo "=========================================================="
echo "SPSS is opening. This window stays open so you can review"
echo "the install output above. Press Enter to close it."
echo "=========================================================="
read -r _
