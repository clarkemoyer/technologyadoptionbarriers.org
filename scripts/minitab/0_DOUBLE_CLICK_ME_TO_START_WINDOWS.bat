@echo off
REM ====================================================================
REM TABS V2 CRP-200 Validation - Minitab Windows double-click launcher
REM ====================================================================
REM What this does:
REM   1. Confirms the zip was extracted (not double-clicked from inside).
REM   2. Locates Minitab (mtb.exe) AND a Python interpreter (preferring
REM      the SPSS-bundled python.exe if SPSS is also installed, then
REM      falling back to system python on PATH).
REM   3. PRE-INSTALLS semopy via the located Python so the SEM companion
REM      script (tabs_v2_sem_companion.py) can import it immediately.
REM   4. Runs the SEM companion script - produces sem_companion_results.txt
REM      with CFA fit indices, omega from CFA, bifactor decomposition,
REM      multigroup CFA, and Mardia normality, since Minitab does not
REM      have these natively.
REM   5. Launches Minitab with tabs_v2_validation.MTB preloaded - opens
REM      the worksheet, runs the macro, output appears in Minitab's
REM      Session window.
REM   6. THIS CONSOLE WINDOW STAYS OPEN until the recipient presses a
REM      key, so they can see what happened (especially install output).
REM
REM Recipient experience:
REM   1. Extract the zip
REM   2. Double-click this .bat
REM   3. Watch the console install semopy if Python is found (~30 sec)
REM   4. SEM companion runs (~10 sec); writes sem_companion_results.txt
REM   5. Minitab opens with the worksheet + macro preloaded
REM   6. In Minitab: File > Run an Exec > tabs_v2_validation.MTB
REM      (or use Run Now if the launcher already started it)
REM   7. Open both sem_companion_results.txt and the Minitab Session
REM      window to see the full validation receipt
REM
REM Why a sibling Python script (not Minitab Python integration):
REM   Minitab does not bundle Python like SPSS does. The companion script
REM   is the cleanest way to give Minitab users the SEM-derived stats
REM   (CFA fit indices, omega-from-CFA, bifactor, Mardia normality) that
REM   the Python pipeline canonically produces, without requiring the
REM   recipient to install Python separately. Output is plain text + CSV
REM   so it opens in Notepad, Excel, or even Minitab itself.
REM ====================================================================

setlocal enableextensions

set "HERE=%~dp0"
if "%HERE:~-1%"=="\" set "HERE=%HERE:~0,-1%"

cd /d "%HERE%"

echo ==========================================================
echo TABS V2 CRP-200 Validation - Minitab Windows launcher
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
if not exist "%HERE%\tabs_v2_crp200_minitab.csv" goto NOT_EXTRACTED
if not exist "%HERE%\tabs_v2_validation.MTB" goto NOT_EXTRACTED
goto FILES_OK

:NOT_EXTRACTED
echo ====================================================================
echo
echo            YOU NEED TO EXTRACT THE ZIP FIRST.
echo
echo ====================================================================
echo.
echo  It looks like you double-clicked this file from inside the zip
echo  archive, or copied just this .bat somewhere on its own.
echo.
echo  Detected folder: %HERE%
echo.
echo  Please:
echo    1. Close this window.
echo    2. Right-click tabs_v2_validation_minitab.zip and Extract All...
echo    3. Open the EXTRACTED folder.
echo    4. Double-click 0_DOUBLE_CLICK_ME_TO_START_WINDOWS.bat from THERE.
echo.
echo ====================================================================
echo.
pause
exit /b 1

:FILES_OK

REM ====================================================================
REM Locate Minitab (mtb.exe). Search version-newest-first.
REM ====================================================================

set "MTB_EXE="
for %%P in (
  "%ProgramFiles%\Minitab\Minitab 22\mtb.exe"
  "%ProgramFiles%\Minitab\Minitab 21\mtb.exe"
  "%ProgramFiles%\Minitab\Minitab 20\mtb.exe"
  "%ProgramFiles%\Minitab\Minitab 19\mtb.exe"
  "%ProgramFiles%\Minitab\Minitab 18\mtb.exe"
  "%ProgramFiles(x86)%\Minitab\Minitab 22\mtb.exe"
  "%ProgramFiles(x86)%\Minitab\Minitab 21\mtb.exe"
  "%ProgramFiles(x86)%\Minitab\Minitab 20\mtb.exe"
  "%ProgramFiles(x86)%\Minitab\Minitab 19\mtb.exe"
  "%ProgramFiles(x86)%\Minitab\Minitab 18\mtb.exe"
) do (
  if exist %%P if not defined MTB_EXE set "MTB_EXE=%%~P"
)

if not defined MTB_EXE (
  echo WARNING: Minitab was not found in standard install locations.
  echo          The native Minitab analyses will not run automatically.
  echo          To run them: launch Minitab manually, then File ^> Open
  echo          Worksheet ^> tabs_v2_crp200_minitab.csv, then File ^> Run
  echo          an Exec ^> tabs_v2_validation.MTB.
  echo.
  echo          The SEM companion ^(Python^) section below will still run
  echo          if Python is found, giving you the CFA/omega/bifactor outputs.
  echo.
) else (
  echo Found Minitab at: %MTB_EXE%
  echo.
)

REM ====================================================================
REM Locate Python. Preference order:
REM   1. SPSS-bundled python.exe (likely on a stats analyst's machine)
REM   2. System python.exe on PATH
REM ====================================================================

set "PYTHON_EXE="

REM Try SPSS-bundled Python first (newest SPSS first).
for %%P in (
  "%ProgramFiles%\IBM\SPSS Statistics\Python3\python.exe"
  "%ProgramFiles%\IBM\SPSS\Statistics\31\Python3\python.exe"
  "%ProgramFiles%\IBM\SPSS\Statistics\30\Python3\python.exe"
  "%ProgramFiles%\IBM\SPSS\Statistics\29\Python3\python.exe"
  "%ProgramFiles(x86)%\IBM\SPSS Statistics\Python3\python.exe"
) do (
  if exist %%P if not defined PYTHON_EXE set "PYTHON_EXE=%%~P"
)

REM Fall back to system Python on PATH.
if not defined PYTHON_EXE (
  for /f "delims=" %%P in ('where python 2^>nul') do (
    if not defined PYTHON_EXE set "PYTHON_EXE=%%P"
  )
)

if not defined PYTHON_EXE (
  echo WARNING: No Python interpreter found.
  echo          The SEM companion script will be skipped.
  echo          Install Python 3.10+ from https://python.org or install
  echo          IBM SPSS Statistics ^(which bundles Python^) to get the
  echo          CFA / omega / bifactor / Mardia analyses.
  echo.
  goto SKIP_PYTHON
)

echo Found Python at: %PYTHON_EXE%
echo.

REM ====================================================================
REM Pre-install semopy + dependencies into the Python user-site directory
REM ====================================================================

echo ----------------------------------------------------------
echo Checking Python SEM packages ^(numpy, pandas, scipy, semopy^)
echo ----------------------------------------------------------
"%PYTHON_EXE%" -c "import semopy" 2>nul
if errorlevel 1 (
  echo semopy is not yet installed. Installing now ^(~30-90 sec depending
  echo on whether numpy/pandas/scipy are also missing^)...
  echo.
  "%PYTHON_EXE%" -m pip install --user --upgrade pip
  "%PYTHON_EXE%" -m pip install --user numpy pandas scipy semopy
  if errorlevel 1 (
    echo.
    echo WARNING: pip install failed. SEM companion will not run.
    goto SKIP_PYTHON
  ) else (
    echo.
    echo OK: semopy installed successfully.
  )
) else (
  echo OK: semopy is already installed. Skipping install step.
)
echo.

REM ====================================================================
REM Run the SEM companion script. Writes sem_companion_results.txt and
REM sem_companion_results.csv to the extraction folder.
REM ====================================================================

if exist "%HERE%\tabs_v2_sem_companion.py" (
  echo Running SEM companion script ^(~10 sec^)...
  echo.
  "%PYTHON_EXE%" "%HERE%\tabs_v2_sem_companion.py" --csv "%HERE%\tabs_v2_crp200_minitab.csv" --out-dir "%HERE%"
  if errorlevel 1 (
    echo.
    echo WARNING: SEM companion script reported errors above.
    echo          Native Minitab analyses will still run.
  ) else (
    echo.
    echo OK: SEM companion complete.
    echo   Output: sem_companion_results.txt
    echo   Output: sem_companion_results.csv
  )
  echo.
)

:SKIP_PYTHON

REM ====================================================================
REM Launch Minitab with the .MTB file
REM ====================================================================

if defined MTB_EXE (
  echo Minitab is opening. The worksheet will load, then you can:
  echo.
  echo   ^>^>  File ^> Run an Exec ^> tabs_v2_validation.MTB ^<^<
  echo.
  echo Output appears in Minitab's Session window. Native Minitab
  echo analyses run for about 20-30 seconds.
  echo.

  REM mtb.exe accepts a worksheet file directly. We open the worksheet;
  REM the user can then File > Run an Exec on the .MTB. (mtb.exe does
  REM not have a single-flag combined "open worksheet AND run exec"
  REM mode that works reliably across Minitab versions.)
  start "" /D "%HERE%" "%MTB_EXE%" "%HERE%\tabs_v2_crp200_minitab.csv"
)

echo.
echo ==========================================================
echo Done. Files in this folder:
if exist "%HERE%\sem_companion_results.txt" echo   - sem_companion_results.txt   ^(SEM analyses, plain text^)
if exist "%HERE%\sem_companion_results.csv" echo   - sem_companion_results.csv   ^(SEM analyses, table format^)
echo   - tabs_v2_validation.MTB      ^(run from Minitab^)
echo   - Minitab Session output      ^(after running the macro^)
echo.
echo This window stays open. Press any key to close it.
echo ==========================================================
pause
endlocal
