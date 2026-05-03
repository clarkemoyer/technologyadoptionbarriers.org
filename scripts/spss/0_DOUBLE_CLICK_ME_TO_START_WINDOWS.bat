@echo off
REM ====================================================================
REM TABS V2 CRP-200 Validation - Windows double-click launcher
REM ====================================================================
REM What this does:
REM   1. Confirms the zip was extracted (not double-clicked from inside).
REM   2. Locates IBM SPSS Statistics + the SPSS-bundled python.exe.
REM   3. PRE-INSTALLS semopy via the SPSS-bundled Python so the .sps's
REM      Python blocks (Section 13) can import it immediately.
REM   4. Generates a combined runtime .sps that bakes in the absolute
REM      working folder, then launches SPSS interactively with that file.
REM   5. The recipient clicks Run > All in SPSS. Outputs land back here.
REM   6. THIS CONSOLE WINDOW STAYS OPEN until the recipient presses a
REM      key, so they can see what happened (especially install output).
REM
REM Recipient experience:
REM   1. Extract the zip
REM   2. Double-click this .bat
REM   3. Watch the console install semopy (~30 sec first run, instant after)
REM   4. SPSS opens with the syntax preloaded
REM   5. Click Run > All inside SPSS
REM   6. Wait ~90 seconds; Viewer opens; spv_export.xlsx + .spv land here
REM   7. Press any key in this console window to close it
REM ====================================================================

setlocal enableextensions

REM %~dp0 always includes the trailing backslash (e.g. C:\path\to\folder\).
REM We rely on that throughout: %HERE%filename (no extra \) is intentional.
set "HERE=%~dp0"
set "HERE_FWD=%HERE:\=/%"

cd /d "%HERE%"

echo ==========================================================
echo TABS V2 CRP-200 Validation - Windows launcher
echo Working folder: %HERE%
echo ==========================================================
echo.

REM ====================================================================
REM Detect "running from inside the zip" / missing siblings
REM ====================================================================

set "RUNNING_FROM_ZIP=0"
echo %HERE% | findstr /I /C:"\Temp\Temp" >nul && set "RUNNING_FROM_ZIP=1"
echo %HERE% | findstr /I /R "\\AppData\\Local\\Temp\\.*\.zip" >nul && set "RUNNING_FROM_ZIP=1"
echo %HERE% | findstr /I /R "\\AppData\\Local\\Temp\\Rar\$" >nul && set "RUNNING_FROM_ZIP=1"
echo %HERE% | findstr /I /R "\\AppData\\Local\\Temp\\7z" >nul && set "RUNNING_FROM_ZIP=1"

if "%RUNNING_FROM_ZIP%"=="1" goto NOT_EXTRACTED
if not exist "%HERE%tabs_v2_crp200_spss.sav" goto NOT_EXTRACTED
if not exist "%HERE%tabs_v2_validation.sps" goto NOT_EXTRACTED
goto FILES_OK

:NOT_EXTRACTED
echo ====================================================================
echo
echo            YOU NEED TO EXTRACT THE ZIP FIRST.
echo
echo ====================================================================
echo.
echo  It looks like you double-clicked this file from inside the zip
echo  archive (without unzipping first), or copied just this .bat file
echo  somewhere on its own.
echo.
echo  This .bat needs its sibling files (the .sav data, the .sps
echo  syntax, etc.) in the same folder.
echo.
echo  Detected folder: %HERE%
echo.
echo  Please do this instead:
echo.
echo    1. Close this window.
echo    2. Find the original zip file: tabs_v2_validation_spss.zip
echo    3. Right-click the zip and choose "Extract All..."
echo    4. Pick a folder (Desktop or Documents is fine).
echo    5. Open the EXTRACTED folder.
echo    6. Double-click 0_DOUBLE_CLICK_ME_TO_START_WINDOWS.bat from THERE.
echo.
echo ====================================================================
echo.
pause
exit /b 1

:FILES_OK

REM ====================================================================
REM Locate SPSS Statistics + bundled python.exe
REM ====================================================================

REM Search order: version-numbered paths newest-first (each version checked
REM under both the "IBM\SPSS Statistics\<ver>" layout – the common IBM
REM installer default – and the "IBM\SPSS\Statistics\<ver>" layout used by
REM some enterprise deployments), then versionless generic paths last (those
REM resolve to whatever IBM happens to install, which is sometimes older than
REM the newest version-specific path on the same machine when the user has
REM multiple SPSS versions side-by-side).
set "SPSS_DIR="
set "SPSS_EXE="
for %%P in (
  "%ProgramFiles%\IBM\SPSS Statistics\31"
  "%ProgramFiles%\IBM\SPSS\Statistics\31"
  "%ProgramFiles%\IBM\SPSS Statistics\30"
  "%ProgramFiles%\IBM\SPSS\Statistics\30"
  "%ProgramFiles%\IBM\SPSS Statistics\29"
  "%ProgramFiles%\IBM\SPSS\Statistics\29"
  "%ProgramFiles%\IBM\SPSS Statistics\28"
  "%ProgramFiles%\IBM\SPSS\Statistics\28"
  "%ProgramFiles%\IBM\SPSS Statistics\27"
  "%ProgramFiles%\IBM\SPSS\Statistics\27"
  "%ProgramFiles%\IBM\SPSS Statistics\26"
  "%ProgramFiles%\IBM\SPSS\Statistics\26"
  "%ProgramFiles%\IBM\SPSS Statistics\25"
  "%ProgramFiles%\IBM\SPSS\Statistics\25"
  "%ProgramFiles%\IBM\SPSS Statistics\24"
  "%ProgramFiles%\IBM\SPSS\Statistics\24"
  "%ProgramFiles(x86)%\IBM\SPSS Statistics\31"
  "%ProgramFiles(x86)%\IBM\SPSS\Statistics\31"
  "%ProgramFiles(x86)%\IBM\SPSS Statistics\30"
  "%ProgramFiles(x86)%\IBM\SPSS\Statistics\30"
  "%ProgramFiles(x86)%\IBM\SPSS Statistics\29"
  "%ProgramFiles(x86)%\IBM\SPSS\Statistics\29"
  "%ProgramFiles(x86)%\IBM\SPSS Statistics\28"
  "%ProgramFiles(x86)%\IBM\SPSS\Statistics\28"
  "%ProgramFiles(x86)%\IBM\SPSS Statistics\27"
  "%ProgramFiles(x86)%\IBM\SPSS\Statistics\27"
  "%ProgramFiles(x86)%\IBM\SPSS Statistics\26"
  "%ProgramFiles(x86)%\IBM\SPSS\Statistics\26"
  "%ProgramFiles(x86)%\IBM\SPSS Statistics\25"
  "%ProgramFiles(x86)%\IBM\SPSS\Statistics\25"
  "%ProgramFiles(x86)%\IBM\SPSS Statistics\24"
  "%ProgramFiles(x86)%\IBM\SPSS\Statistics\24"
  "%ProgramFiles%\IBM\SPSS Statistics"
  "%ProgramFiles(x86)%\IBM\SPSS Statistics"
  "%LocalAppData%\Programs\IBM\SPSS Statistics"
) do (
  if exist "%%~P\stats.exe" if not defined SPSS_EXE (
    set "SPSS_DIR=%%~P"
    set "SPSS_EXE=%%~P\stats.exe"
  )
)

if not defined SPSS_EXE (
  echo ERROR: IBM SPSS Statistics was not found in any standard install
  echo        location. Either install SPSS 24+ or open the syntax
  echo        manually: File ^> Open ^> Syntax ^> tabs_v2_validation.sps
  echo.
  pause
  exit /b 1
)

echo Found SPSS at: %SPSS_EXE%

REM Locate the SPSS-bundled python.exe
set "SPSS_PYTHON="
if exist "%SPSS_DIR%\Python3\python.exe" set "SPSS_PYTHON=%SPSS_DIR%\Python3\python.exe"

if defined SPSS_PYTHON (
  echo Found SPSS Python: %SPSS_PYTHON%
) else (
  echo WARNING: SPSS-bundled Python not found at %SPSS_DIR%\Python3\python.exe
  echo          Section 13 ^(CFA via Python^) may skip; R fallback in Section 14.
)
echo.

REM ====================================================================
REM Pre-install semopy into the SPSS-bundled Python user site
REM This is BEFORE launching SPSS so the import works immediately when
REM Section 13's BEGIN PROGRAM PYTHON3 runs.
REM ====================================================================

if defined SPSS_PYTHON (
  echo ----------------------------------------------------------
  echo Checking Python SEM packages ^(numpy, pandas, scipy, semopy^)
  echo ----------------------------------------------------------

  REM Quick check: try to import all required SEM packages. If they all
  REM work, skip install. semopy==2.3.11 pulls numpy/pandas/scipy as
  REM dependencies, so one install covers all four.
  "%SPSS_PYTHON%" -c "import numpy, pandas, scipy, semopy" 2>nul
  if errorlevel 1 (
    echo One or more SEM packages ^(numpy, pandas, scipy, semopy^) are not
    echo yet installed. Installing now ^(~30 sec^)...
    echo.
    "%SPSS_PYTHON%" -m pip install --user --upgrade pip
    "%SPSS_PYTHON%" -m pip install --user semopy==2.3.11
    if errorlevel 1 (
      echo.
      echo WARNING: pip install failed. Section 13 ^(Python CFA^) will skip.
      echo          R fallback in Section 14 will activate if lavaan is installed.
    ) else (
      echo.
      echo OK: numpy, pandas, scipy, semopy installed successfully.
    )
  ) else (
    echo OK: numpy, pandas, scipy, semopy are already installed. Skipping install step.
  )
  echo.
)

REM ====================================================================
REM Pre-install R packages for Section 14 fallback (lavaan invariance
REM tests + semTools omega from CFA). Optional but adds the metric and
REM scalar measurement-invariance Delta-CFI tests that semopy does not
REM compute. First-run install ~3-5 min; subsequent runs detect + skip.
REM ====================================================================

set "RSCRIPT="
if exist "%SPSS_DIR%\R\bin\Rscript.exe" set "RSCRIPT=%SPSS_DIR%\R\bin\Rscript.exe"

if defined RSCRIPT (
  echo ----------------------------------------------------------
  echo Checking R SEM packages ^(lavaan, semTools^)
  echo ----------------------------------------------------------
  REM Check via positive form (no leading "!" - delayed expansion eats it).
  REM requireNamespace returns TRUE if lavaan is found; we map that to exit 0,
  REM and the missing case to exit 1, then test errorlevel.
  "%RSCRIPT%" -e "quit(status = if (requireNamespace('lavaan', quietly = TRUE)) 0 else 1)" 2>nul
  if errorlevel 1 (
    echo lavaan is not yet installed. It adds metric/scalar invariance tests ^(~3-5 min, ~50 MB^).
    echo.
    choice /c YN /m "Install lavaan and semTools now"
    if errorlevel 2 (
      echo.
      echo Skipping R package install. Section 14 will be skipped; Python results are still complete.
    ) else (
      "%RSCRIPT%" -e "lib<-.libPaths()[1]; cat('Installing to:',lib,'\n'); install.packages(c('lavaan','semTools'), repos='https://cloud.r-project.org', lib=lib, dependencies=TRUE)"
      if errorlevel 1 (
        echo.
        echo WARNING: R install failed. Section 14 will skip; Python results are still complete.
      ) else (
        echo.
        echo OK: lavaan + semTools installed successfully.
      )
    )
  ) else (
    echo OK: lavaan is already installed. Skipping install step.
  )
  echo.
)

REM ====================================================================
REM Build the combined runtime syntax with absolute CD prepended
REM ====================================================================

set "COMBINED=%HERE%_run_validation.sps"
REM Escape ^ first, then & (CMD metacharacter safety); escape ' -> '' (SPSS string literal safety).
REM < > | cannot appear in NTFS paths. ! is safe because enabledelayedexpansion is off.
REM % could appear in paths but is extremely rare; if it does, the echo would garble it,
REM but that edge case is left for a future PowerShell-based writer if needed.
set "HERE_FWD_SPS=%HERE_FWD:^=^^%"
set "HERE_FWD_SPS=%HERE_FWD_SPS:&=^&%"
set "HERE_FWD_SPS=%HERE_FWD_SPS:'=''%"
> "%COMBINED%" echo * Auto-generated combined syntax. Prepends absolute CD then concatenates
>>"%COMBINED%" echo * tabs_v2_validation.sps. Regenerated each launcher run; safe to delete.
>>"%COMBINED%" echo *.
>>"%COMBINED%" echo.
>>"%COMBINED%" echo CD '%HERE_FWD_SPS%'.
>>"%COMBINED%" echo.
type "%HERE%tabs_v2_validation.sps" >> "%COMBINED%"

echo Combined syntax generated: %COMBINED%
echo.
echo SPSS Statistics is opening. When it appears:
echo.
echo   ^>^>  Click  Run  ^>  All   (or press Ctrl+A then Ctrl+R)  ^<^<
echo.
echo The validation runs for about 90 seconds. Outputs land here:
echo   - spv_export.xlsx        (open in Excel/Numbers/LibreOffice)
echo   - Post_Run_Results.spv   (open in SPSS Viewer or SmartReader)
echo.
echo SPSS will stay open afterwards so you can drill into any table.
echo.

REM Launch SPSS interactively. /D explicitly sets the working directory.
start "" /D "%HERE%" "%SPSS_EXE%" "%COMBINED%"

echo.
echo ==========================================================
echo SPSS is opening. This window stays open so you can review
echo the install output above. Press any key to close it.
echo ==========================================================
pause
endlocal
