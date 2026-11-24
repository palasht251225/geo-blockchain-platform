@echo off
title Push GeoLedger to GitHub - Palash Tripathi
cls
echo ==============================================================================
echo   Publish GeoLedger to GitHub
echo   Engineered by Palash Tripathi
echo ==============================================================================
echo.

set GIT_EXE=C:\Users\alexh\.gemini\antigravity\scratch\mingit\cmd\git.exe
if not exist "%GIT_EXE%" (
    set GIT_EXE=git
)

echo [1/3] Checking committed project files...
"%GIT_EXE%" status --short

echo.
echo [2/3] Setting target GitHub repository...
set DEFAULT_REPO=https://github.com/palasht251225/geo-blockchain-platform.git
set /p REPO_URL="Enter your GitHub Repository URL [Press Enter for %DEFAULT_REPO%]: "
if "%REPO_URL%"=="" set REPO_URL=%DEFAULT_REPO%

echo.
echo [3/3] Pushing main branch to %REPO_URL%...
"%GIT_EXE%" remote remove origin >nul 2>&1
"%GIT_EXE%" remote add origin %REPO_URL%
"%GIT_EXE%" branch -M main
"%GIT_EXE%" push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ==============================================================================
    echo   SUCCESS! GeoLedger is now live on GitHub:
    echo   %REPO_URL%
    echo.
    echo   Now go to https://vercel.com/new and click "Import" on this repo!
    echo ==============================================================================
) else (
    echo.
    echo [!] If push failed with 404, please make sure you created the empty repo at:
    echo     https://github.com/new (Name: geo-blockchain-platform)
)

echo.
pause
