@echo off
TITLE Calorie Tracker Startup
cd /d "%~dp0"

echo Stopping any stray Next.js processes...
taskkill /f /im node.exe >nul 2>&1

echo Starting Calorie Tracker Dev Server...
start "Next.js Dev Server" cmd /k "pnpm dev --turbopack -H 0.0.0.0"

echo Starting ngrok tunnel...
start "ngrok Tunnel" cmd /k "pnpm dlx ngrok http --host-header=rewrite 3000"

echo All services launched!