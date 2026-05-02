@echo off
REM ====================================================================
REM TABS V2 CRP-200 Validation - Windows double-click launcher
REM ====================================================================
REM What this does:
REM   1. Locates IBM SPSS Statistics on this machine.
REM   2. Generates a combined runtime syntax file that prepends an
REM      absolute `CD '<extracted-folder>'.` to the contents of the
REM      main tabs_v2_validation.sps. This single combined file is
REM      what SPSS opens.
REM   3. Launches SPSS Statistics interactively with the combined
REM      syntax preloaded.
REM   4. The recipient clicks Run -> All in SPSS to execute everything
REM      in one Viewer context. The .xlsx and .spv files land in this
REM      folder.
REM   5. SPSS stays open so the recipient can drill into tables, save
REM      additional outputs, or re-run individual blocks interactively.
REM
REM Why a combined file (not just INSERT):
REM   When SPSS is launched via `stats.exe FILE.sps`, SPSS sets its
REM   working directory to its own install folder, not where the .sps
REM   lives. Relative paths in the syntax then resolve incorrectly and
REM   the OUTPUT EXPORT writes to (or fails inside) Program Files.
REM
REM   Earlier attempts used a wrapper .sps that did `INSERT FILE=...`,
REM   but INSERT'd commands' output goes to a different output document
REM   in some SPSS versions, leaving the main Viewer empty when OUTPUT
REM   EXPORT runs at the end. Concatenating the absolute CD with the
REM   full syntax into a single file avoids both problems.
REM
REM Recipient experience:
REM   1. Extract the zip to any folder
REM   2. Double-click this .bat
REM   3. SPSS opens with the combined syntax preloaded
REM   4. Click Run -> All inside SPSS
REM   5. Wait ~60 seconds for the bootstrap blocks
REM   6. Viewer opens; spv_export.xlsx + Post_Run_Results.spv appear
REM      in this folder; SPSS stays open
REM
REM Tested on Windows 10 + 11. Requires SPSS Statistics 24+.
REM ====================================================================

setlocal enableextensions enabledelayedexpansion

set "HERE=%~dp0"
if "%HERE:~-1%"=="\" set "HERE=%HERE:~0,-1%"
set "HERE_FWD=%HERE:\=/%"

cd /d "%HERE%"

echo ==========================================================
echo TABS V2 CRP-200 Validation
echo Working folder: %HERE%
echo ==========================================================
echo.

set "SPSS_EXE="
for %%P in (
  "%ProgramFiles%\IBM\SPSS Statistics\stats.exe"
  "%ProgramFiles%\IBM\SPSS\Statistics\31\stats.exe"
  "%ProgramFiles%\IBM\SPSS\Statistics\30\stats.exe"
  "%ProgramFiles%\IBM\SPSS\Statistics\29\stats.exe"
  "%ProgramFiles%\IBM\SPSS\Statistics\28\stats.exe"
  "%ProgramFiles%\IBM\SPSS\Statistics\27\stats.exe"
  "%ProgramFiles%\IBM\SPSS\Statistics\26\stats.exe"
  "%ProgramFiles%\IBM\SPSS\Statistics\25\stats.exe"
  "%ProgramFiles%\IBM\SPSS\Statistics\24\stats.exe"
  "%ProgramFiles(x86)%\IBM\SPSS Statistics\stats.exe"
  "%ProgramFiles(x86)%\IBM\SPSS\Statistics\31\stats.exe"
  "%ProgramFiles(x86)%\IBM\SPSS\Statistics\30\stats.exe"
  "%ProgramFiles(x86)%\IBM\SPSS\Statistics\29\stats.exe"
  "%LocalAppData%\Programs\IBM\SPSS Statistics\stats.exe"
) do (
  if exist %%P if not defined SPSS_EXE set "SPSS_EXE=%%~P"
)

if not defined SPSS_EXE (
  echo ERROR: IBM SPSS Statistics was not found in any standard install
  echo        location. Either:
  echo.
  echo   1. Install SPSS Statistics 24 or newer from your IBM license, OR
  echo   2. Open tabs_v2_validation.sps manually:
  echo        - Launch SPSS
  echo        - File ^> Open ^> Syntax ^> tabs_v2_validation.sps
  echo        - Edit the CD line at the top to your extracted-folder path
  echo        - Run ^> All
  echo.
  pause
  exit /b 1
)

echo Found SPSS at: %SPSS_EXE%
echo.

if not exist "%HERE%\tabs_v2_crp200_spss.sav" (
  echo ERROR: tabs_v2_crp200_spss.sav not found in this folder.
  echo        Did you extract the entire zip into this folder?
  pause
  exit /b 1
)
if not exist "%HERE%\tabs_v2_validation.sps" (
  echo ERROR: tabs_v2_validation.sps not found in this folder.
  echo        Did you extract the entire zip into this folder?
  pause
  exit /b 1
)

REM Build the combined runtime syntax file: header + absolute CD + the
REM full contents of tabs_v2_validation.sps. Using `type ... >>` appends
REM the main syntax verbatim, preserving its formatting and comments.
set "COMBINED=%HERE%\_run_validation.sps"
> "%COMBINED%" echo * =====================================================================
>>"%COMBINED%" echo * Auto-generated combined syntax. Prepends an absolute CD command to
>>"%COMBINED%" echo * tabs_v2_validation.sps so SPSS finds the .sav and writes outputs to
>>"%COMBINED%" echo * this folder regardless of which directory SPSS thinks it's in.
>>"%COMBINED%" echo * Regenerated every time Run_Validation.bat runs. Safe to delete.
>>"%COMBINED%" echo * =====================================================================.
>>"%COMBINED%" echo.
>>"%COMBINED%" echo CD '%HERE_FWD%'.
>>"%COMBINED%" echo.
>>"%COMBINED%" echo * --- Inlined from tabs_v2_validation.sps -----------------------------.
>>"%COMBINED%" echo.
type "%HERE%\tabs_v2_validation.sps" >> "%COMBINED%"

echo Combined syntax generated:
echo   %COMBINED%
echo.
echo SPSS Statistics is opening. When it appears:
echo.
echo   ^>^>  Click  Run  ^>  All   (or press Ctrl+A then Ctrl+R)  ^<^<
echo.
echo The validation runs for about 60 seconds. The Viewer opens with all
echo results, and these two files appear in this folder when it finishes:
echo.
echo   - spv_export.xlsx        (open in Excel, Numbers, or LibreOffice)
echo   - Post_Run_Results.spv   (open in SPSS Viewer or SmartReader)
echo.
echo SPSS stays open afterwards so you can drill into any table, save
echo additional outputs, or re-run individual blocks.
echo.

REM Launch SPSS interactively with the combined file. /D explicitly
REM sets the new process's working directory as defense-in-depth (the
REM CD command in the syntax is the primary fix).
start "" /D "%HERE%" "%SPSS_EXE%" "%COMBINED%"

echo.
echo ==========================================================
echo SPSS is opening. You can close this window now.
echo ==========================================================
timeout /t 5 /nobreak > nul
endlocal
