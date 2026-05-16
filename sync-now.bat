@echo off
title Teacher Site Sync
color 0A
cd /d "%~dp0"
set DEBUG_LOG=%cd%\sync-debug.txt
echo [%date% %time%] sync-now.bat started > "%DEBUG_LOG%"
echo Current folder: %cd% >> "%DEBUG_LOG%"
echo User: %USERNAME% >> "%DEBUG_LOG%"
echo ==========================================
echo Teacher site one-time sync
echo ==========================================
echo.
echo Website folder:
echo %cd%
echo.
echo Starting sync. If GitHub opens a login window, please sign in.
echo.
where powershell.exe >> "%DEBUG_LOG%" 2>&1
where git.exe >> "%DEBUG_LOG%" 2>&1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".auto-sync\auto-sync.ps1" -Once >> "%DEBUG_LOG%" 2>&1
echo PowerShell exit code: %ERRORLEVEL% >> "%DEBUG_LOG%"
echo.
echo ------------------------------------------
echo Sync command finished.
echo.
echo If GitHub asked you to sign in, complete the login window,
echo then run this file again.
echo.
echo Log file:
echo %cd%\.auto-sync\sync.log
echo Debug file:
echo %DEBUG_LOG%
echo ------------------------------------------
pause
