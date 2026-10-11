@echo off
title GitHub Push - Antigravity Claude Pro
cls
echo =====================================================================
echo   Pushing antigravity-claude-pro to GitHub...
echo   Target: https://github.com/LAN1357/antigravity-claude-pro
echo   If a browser window appears, please authorize git-ecosystem.
echo =====================================================================
echo.

set "PATH=C:\Program Files\Git\cmd;C:\Program Files\Git\bin;C:\Program Files\Git\mingw64\bin;%PATH%"
set "http_proxy=http://127.0.0.1:7897"
set "https_proxy=http://127.0.0.1:7897"

cd /d "%~dp0"

echo [1/2] Checking remote...
git remote -v
echo.

echo [2/2] Running: git push -u origin main...
git push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo =====================================================================
    echo   [SUCCESS] Push completed successfully!
    echo =====================================================================
    timeout /t 5
) else (
    echo.
    echo =====================================================================
    echo   [ERROR] Push encountered an issue. See output above.
    echo =====================================================================
    pause
)
