@echo off
setlocal enabledelayedexpansion
title Wam ^& Bao - 2nd Anniversary Web Experience

cd /d "%~dp0"

echo ===================================================================
echo               WAM ^& BAO - 2ND ANNIVERSARY EXPERIENCE
echo ===================================================================
echo.
echo [1/2] Preparing development environment...
echo Current directory: %CD%
echo.

:: Check if node is installed
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not found in PATH. Please install Node.js.
    pause
    exit /b 1
)

:: Prefer pnpm if available, fallback to npm
where pnpm >nul 2>&1
if %ERRORLEVEL% equ 0 (
    set PKG_MGR=pnpm
) else (
    set PKG_MGR=npm
)

echo [2/2] Launching live Vite server with %PKG_MGR%...
echo Live URL: http://localhost:5173/
echo (The web application will open automatically in your browser)
echo.
echo Press Ctrl+C in this window anytime to stop the server.
echo ===================================================================
echo.

if "%PKG_MGR%"=="pnpm" (
    call pnpm dev --open --host 0.0.0.0 --port 5173
) else (
    call npm run dev -- --open --host 0.0.0.0 --port 5173
)

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Server encountered an error or stopped unexpectedly.
    pause
)
