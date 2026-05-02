#!/usr/bin/env bash
# =====================================================================
# TABS V2 CRP-200 Validation - macOS double-click launcher
# =====================================================================
# What this does (mirrors Run_Validation.bat for Windows):
#   1. Locates IBM SPSS Statistics on this Mac.
#   2. Generates a combined runtime syntax file that prepends an
#      absolute `CD '<extracted-folder>'.` to the contents of the main
#      tabs_v2_validation.sps. This single combined file is what SPSS
#      opens.
#   3. Launches SPSS Statistics interactively with the combined syntax
#      preloaded.
#   4. The recipient clicks Run > All to execute everything in one
#      Viewer context. The .xlsx and .spv files land in this folder.
#   5. SPSS stays open afterwards.
#
# Why a combined file (not just INSERT):
#   When SPSS is launched via `open -a` with a .sps argument, SPSS sets
#   its working directory to a system path rather than where the .sps
#   file lives. Relative paths in the syntax then resolve incorrectly.
#   Earlier attempts used a wrapper that did INSERT FILE='...', but
#   INSERT'd output goes to a different output document in some SPSS
#   versions, leaving the main Viewer empty when OUTPUT EXPORT runs.
#   Concatenating the absolute CD with the full syntax into a single
#   file avoids both problems.
#
# Recipient experience:
#   1. Extract the zip
#   2. (one-time) Right-click Run_Validation.command -> Open
#      (this satisfies macOS Gatekeeper). After the first run,
#      double-click works.
#   3. SPSS opens with the combined syntax preloaded
#   4. Click Run > All inside SPSS
#   5. Wait ~60 seconds for the bootstrap blocks
#   6. Viewer opens; .xlsx + .spv appear in this folder; SPSS stays open
#
# Tested on macOS 13 + 14. Requires SPSS Statistics 24+.
# =====================================================================

set -uo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$HERE"

echo "=========================================================="
echo "TABS V2 CRP-200 Validation"
echo "Working folder: $HERE"
echo "=========================================================="
echo

SPSS_APP=""
for candidate in \
    "/Applications/IBM SPSS Statistics/SPSSStatistics.app" \
    "/Applications/IBM SPSS Statistics 31/SPSSStatistics.app" \
    "/Applications/IBM SPSS Statistics 30/SPSSStatistics.app" \
    "/Applications/IBM SPSS Statistics 29/SPSSStatistics.app" \
    "/Applications/IBM SPSS Statistics 28/SPSSStatistics.app" \
    "/Applications/IBM SPSS Statistics 27/SPSSStatistics.app" \
    "/Applications/IBM SPSS Statistics 26/SPSSStatistics.app" \
    "/Applications/IBM SPSS Statistics 25/SPSSStatistics.app" \
    "/Applications/IBM SPSS Statistics 24/SPSSStatistics.app"; do
  if [ -d "$candidate" ]; then
    SPSS_APP="$candidate"
    break
  fi
done

if [ -z "$SPSS_APP" ]; then
  echo "ERROR: IBM SPSS Statistics was not found in /Applications."
  echo "       Either:"
  echo "  1. Install SPSS Statistics 24 or newer from your IBM license, OR"
  echo "  2. Open tabs_v2_validation.sps manually:"
  echo "       - Launch SPSS"
  echo "       - File > Open > Syntax > tabs_v2_validation.sps"
  echo "       - Edit the CD line at the top to your extracted-folder path"
  echo "       - Run > All"
  echo
  echo "Press Enter to close..."
  read -r _
  exit 1
fi

echo "Found SPSS at: $SPSS_APP"
echo

for required in tabs_v2_crp200_spss.sav tabs_v2_validation.sps; do
  if [ ! -f "$HERE/$required" ]; then
    echo "ERROR: $required not found in this folder."
    echo "       Did you extract the entire zip into this folder?"
    echo
    echo "Press Enter to close..."
    read -r _
    exit 1
  fi
done

# Build the combined runtime syntax file: header + absolute CD + full
# contents of tabs_v2_validation.sps.
# Escape any single quotes in the path by doubling them (SPSS standard).
# Use a variable for the single-quote character so the pattern in the
# parameter expansion is unambiguous regardless of shell quoting rules.
COMBINED="$HERE/_run_validation.sps"
_SQ="'"
HERE_ESCAPED="${HERE//$_SQ/$_SQ$_SQ}"
{
  echo "* ====================================================================="
  echo "* Auto-generated combined syntax. Prepends an absolute CD command to"
  echo "* tabs_v2_validation.sps so SPSS finds the .sav and writes outputs to"
  echo "* this folder regardless of which directory SPSS thinks it's in."
  echo "* Regenerated every time Run_Validation.command runs. Safe to delete."
  echo "* =====================================================================."
  echo
  echo "CD '${HERE_ESCAPED}'."
  echo
  echo "* --- Inlined from tabs_v2_validation.sps -----------------------------."
  echo
  cat "$HERE/tabs_v2_validation.sps"
} > "$COMBINED"

echo "Combined syntax generated:"
echo "  $COMBINED"
echo

cat <<MSG
SPSS Statistics is opening. When it appears:

  >>  Click  Run > All   (or press Cmd+A then Cmd+R)  <<

The validation runs for about 60 seconds. The Viewer opens with all
results, and these two files appear in this folder when it finishes:

  - spv_export.xlsx        (open in Excel, Numbers, or LibreOffice)
  - Post_Run_Results.spv   (open in SPSS Viewer or SmartReader)

SPSS stays open afterwards so you can drill into any table, save
additional outputs, or re-run individual blocks.

MSG

open -a "$SPSS_APP" "$COMBINED"

echo
echo "=========================================================="
echo "SPSS is opening. You can close this window now."
echo "=========================================================="
sleep 3
