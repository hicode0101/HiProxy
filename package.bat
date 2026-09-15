@echo off
setlocal
title HiProxy Package Script

rem ============================================================
rem  HiProxy one-click package script
rem  Flow: check pnpm -> install deps -> build extension -> zip
rem  Output: .output\hiproxy-<version>-chrome.zip
rem  NOTE: keep this file ASCII-only (cmd.exe encoding limits)
rem ============================================================

cd /d "%~dp0"

echo.
echo ============================================
echo   [1/4] Check pnpm
echo ============================================
where pnpm >nul 2>nul
if errorlevel 1 (
    echo [ERROR] pnpm not found. Install it first: npm install -g pnpm
    goto :fail
)
for /f "delims=" %%v in ('pnpm --version') do set PNPM_VER=%%v
echo [OK] pnpm %PNPM_VER%

echo.
echo ============================================
echo   [2/4] Install dependencies
echo ============================================
if not exist "node_modules" (
    echo node_modules not found, installing dependencies...
    call pnpm install
    if errorlevel 1 goto :fail
) else (
    echo [SKIP] node_modules already exists
)

echo.
echo ============================================
echo   [3/4] Build extension
echo ============================================
call pnpm build
if errorlevel 1 goto :fail
if not exist ".output\chrome-mv3\manifest.json" (
    echo [ERROR] Build output missing: .output\chrome-mv3\manifest.json
    goto :fail
)
echo [OK] Build output: .output\chrome-mv3

echo.
echo ============================================
echo   [4/4] Create release zip
echo ============================================
call pnpm zip
if errorlevel 1 goto :fail

rem Read version from package.json to report the artifact name
set VERSION=
for /f "delims=" %%v in ('powershell -NoProfile -Command "(Get-Content -Raw package.json | ConvertFrom-Json).version"') do set VERSION=%%v

echo.
echo ============================================
echo   Package SUCCESS
echo   Version: v%VERSION%
echo   Unpacked: .output\chrome-mv3
echo   Release:  .output\hiproxy-%VERSION%-chrome.zip
echo ============================================
echo.
echo Tip: upload the zip to Chrome Web Store, or unzip it and load via
echo      chrome://extensions -^> "Load unpacked".
echo.
pause
exit /b 0

:fail
echo.
echo [FAILED] Something went wrong, check the log above.
echo.
pause
exit /b 1
