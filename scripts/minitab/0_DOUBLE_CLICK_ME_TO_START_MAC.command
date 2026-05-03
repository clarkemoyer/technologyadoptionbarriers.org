#!/usr/bin/env bash
# =====================================================================
# TABS V2 CRP-200 Validation - Minitab macOS double-click launcher
# =====================================================================
# Mirrors 0_DOUBLE_CLICK_ME_TO_START_WINDOWS.bat:
#   1. Confirms zip was extracted.
#   2. Locates Minitab AND a Python interpreter (preferring SPSS-bundled,
#      then system python3 on PATH, then python on PATH).
#   3. Pre-installs semopy via the located Python so the SEM companion
#      script can import it immediately.
#   4. Runs the SEM companion script - writes sem_companion_results.txt
#      and .csv with CFA/omega/bifactor/Mardia.
#   5. Launches Minitab with the worksheet preloaded; recipient runs
#      the .MTB macro from File > Run an Exec.
#   6. Terminal stays open until the recipient closes it.
#
# Note: Minitab's macOS distribution ships with the same scripting
# language as Windows (.MTB executes the same way). We launch via
# `open -a` because Minitab on macOS is distributed as a .app bundle.
# =====================================================================

set -uo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$HERE"

echo "=========================================================="
echo "TABS V2 CRP-200 Validation - Minitab macOS launcher"
echo "Working folder: $HERE"
echo "=========================================================="
echo

# Detect "running from inside the zip" / missing siblings.
NOT_EXTRACTED=0
case "$HERE" in
  */AppTranslocation/*)               NOT_EXTRACTED=1 ;;
  */private/var/folders/*/T/*)        NOT_EXTRACTED=1 ;;
  */tmp/*Archive*)                    NOT_EXTRACTED=1 ;;
esac
[ ! -f "$HERE/tabs_v2_crp200_minitab.csv" ] && NOT_EXTRACTED=1
[ ! -f "$HERE/tabs_v2_validation.MTB" ] && NOT_EXTRACTED=1

if [ "$NOT_EXTRACTED" = "1" ]; then
  cat <<EXTRACT_MSG
====================================================================

           YOU NEED TO EXTRACT THE ZIP FIRST.

====================================================================

It looks like you double-clicked this file from inside the zip
archive, or copied just this .command somewhere on its own.

Detected folder: $HERE

Please:
  1. Close this window.
  2. Double-click tabs_v2_validation_minitab.zip in Finder. macOS
     Archive Utility will extract the entire archive into a folder
     next to the zip.
  3. Open that EXTRACTED folder.
  4. Right-click 0_DOUBLE_CLICK_ME_TO_START_MAC.command -> Open
     (the first time only, to satisfy macOS Gatekeeper).

====================================================================

Press Enter to close...
EXTRACT_MSG
  read -r _
  exit 1
fi

# Locate Minitab app bundle.
MTB_APP=""
for candidate in \
    "/Applications/Minitab/Minitab 22.app" \
    "/Applications/Minitab/Minitab 21.app" \
    "/Applications/Minitab/Minitab 20.app" \
    "/Applications/Minitab 22.app" \
    "/Applications/Minitab 21.app" \
    "/Applications/Minitab.app"; do
  if [ -d "$candidate" ]; then
    MTB_APP="$candidate"
    break
  fi
done

if [ -z "$MTB_APP" ]; then
  echo "WARNING: Minitab was not found in /Applications."
  echo "         The native Minitab analyses will not run automatically."
  echo "         The SEM companion (Python) section below will still"
  echo "         run if Python is found, giving you the CFA/omega/"
  echo "         bifactor/Mardia outputs."
  echo
else
  echo "Found Minitab at: $MTB_APP"
  echo
fi

# Locate Python. Prefer SPSS-bundled, then system python3, then python.
PYTHON_EXE=""

# SPSS-bundled Python on macOS lives inside the SPSS .app bundle.
for spss_python_candidate in \
    "/Applications/IBM SPSS Statistics 31/SPSSStatistics.app/Contents/Frameworks/Python3.framework/Versions/Current/bin/python3" \
    "/Applications/IBM SPSS Statistics 30/SPSSStatistics.app/Contents/Frameworks/Python3.framework/Versions/Current/bin/python3" \
    "/Applications/IBM SPSS Statistics/SPSSStatistics.app/Contents/Frameworks/Python3.framework/Versions/Current/bin/python3"; do
  if [ -x "$spss_python_candidate" ]; then
    PYTHON_EXE="$spss_python_candidate"
    break
  fi
done

# Fall back to system python3, then python.
if [ -z "$PYTHON_EXE" ]; then
  if command -v python3 >/dev/null 2>&1; then
    PYTHON_EXE="$(command -v python3)"
  elif command -v python >/dev/null 2>&1; then
    PYTHON_EXE="$(command -v python)"
  fi
fi

if [ -z "$PYTHON_EXE" ]; then
  echo "WARNING: No Python interpreter found (no SPSS, no python3 on PATH)."
  echo "         The SEM companion script will be skipped."
  echo "         Install Python 3.10+ from https://python.org or install"
  echo "         IBM SPSS Statistics (which bundles Python) to get the"
  echo "         CFA / omega / bifactor / Mardia analyses."
  echo
else
  echo "Found Python at: $PYTHON_EXE"
  echo

  # Pre-install semopy + dependencies.
  echo "----------------------------------------------------------"
  echo "Checking Python SEM packages (numpy, pandas, scipy, semopy)"
  echo "----------------------------------------------------------"
  if "$PYTHON_EXE" -c "import semopy" >/dev/null 2>&1; then
    SEMOPY_CUR=$("$PYTHON_EXE" -c "import semopy; print(semopy.__version__)" 2>/dev/null || echo "unknown")
    if [ "$SEMOPY_CUR" != "2.3.11" ]; then
      echo "semopy $SEMOPY_CUR is installed but the canonical version is 2.3.11. Reinstalling..."
      echo
      if "$PYTHON_EXE" -m pip install --user "semopy==2.3.11"; then
        echo
        echo "OK: semopy pinned to 2.3.11."
      else
        echo
        echo "WARNING: semopy reinstall to 2.3.11 failed. Results may differ from canonical pipeline."
      fi
    else
      echo "OK: semopy $SEMOPY_CUR is already installed (matches canonical version)."
    fi
  else
    echo "semopy is not yet installed. Installing now (~30-90 sec)..."
    echo
    "$PYTHON_EXE" -m pip install --user --upgrade pip
    if "$PYTHON_EXE" -m pip install --user numpy pandas scipy "semopy==2.3.11"; then
      echo
      echo "OK: semopy installed successfully."
    else
      echo
      echo "WARNING: pip install failed. SEM companion will not run."
      PYTHON_EXE=""
    fi
  fi
  if [ -n "$PYTHON_EXE" ]; then
    SEMOPY_VER=$("$PYTHON_EXE" -c "import semopy; print(semopy.__version__)" 2>/dev/null || echo "unknown")
    echo "  semopy version: $SEMOPY_VER"
    echo
  fi
fi

# Run the SEM companion script if Python is available.
if [ -n "$PYTHON_EXE" ] && [ -f "$HERE/tabs_v2_sem_companion.py" ]; then
  echo "Running SEM companion script (~10 sec)..."
  echo
  if "$PYTHON_EXE" "$HERE/tabs_v2_sem_companion.py" \
       --csv "$HERE/tabs_v2_crp200_minitab.csv" \
       --out-dir "$HERE"; then
    echo
    echo "OK: SEM companion complete."
    echo "  Output: sem_companion_results.txt"
    echo "  Output: sem_companion_results.csv"
  else
    echo
    echo "WARNING: SEM companion script reported errors above."
    echo "         Native Minitab analyses will still run."
  fi
  echo
fi

# Launch Minitab with the worksheet.
if [ -n "$MTB_APP" ]; then
  cat <<MSG
Minitab is opening. The worksheet will load, then you can:

  >>  File > Run an Exec > tabs_v2_validation.MTB  <<

Output appears in Minitab's Session window. Native Minitab
analyses run for about 20-30 seconds.

MSG
  open -a "$MTB_APP" "$HERE/tabs_v2_crp200_minitab.csv"
fi

echo
echo "=========================================================="
echo "Done. Files in this folder:"
[ -f "$HERE/sem_companion_results.txt" ] && echo "  - sem_companion_results.txt   (SEM analyses, plain text)"
[ -f "$HERE/sem_companion_results.csv" ] && echo "  - sem_companion_results.csv   (SEM analyses, table format)"
echo "  - tabs_v2_validation.MTB      (run from Minitab)"
echo "  - Minitab Session output      (after running the macro)"
echo
echo "This window stays open. Press Enter to close it."
echo "=========================================================="
read -r _
