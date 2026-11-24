@echo off
title Push GeoLedger to GitHub - Palash Tripathi
cls
echo ==============================================================================
echo   Publish GeoLedger to GitHub
echo   Engineered by Palash Tripathi
echo ==============================================================================
echo.

where git >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Git is not installed in PATH.
    echo Please download and install Git from: https://git-scm.com/download/win
    echo (Just run the installer and click Next, then re-run this script!)
    echo.
    pause
    exit /b
)

echo [1/4] Initializing local git repository...
if not exist .git (
    git init
)

echo [2/4] Staging all files...
git add .

echo [3/4] Committing codebase...
git commit -m "feat: Initial commit of GeoLedger — Blockchain-Based Geo-Tagging Platform"

echo.
set DEFAULT_REPO=https://github.com/palasht251225/geo-blockchain-platform.git
set /p REPO_URL="Enter your GitHub Repository URL [Press Enter for %DEFAULT_REPO%]: "
if "%REPO_URL%"=="" set REPO_URL=%DEFAULT_REPO%

echo [4/4] Pushing to %REPO_URL%...
git remote remove origin >nul 2>&1
git remote add origin %REPO_URL%
git branch -M main
git push -u origin main

echo.
echo ==============================================================================
echo   SUCCESS: GeoLedger pushed to %REPO_URL%!
echo ==============================================================================
pause
