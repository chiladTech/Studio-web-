@echo off
title Maya Pictures Server Launcher
echo ===================================================
echo   MAYA PICTURES - STARTING DEVELOPMENT SERVER
echo ===================================================
echo.

cd /d "%~dp0"
set PATH=C:\Users\ma3816825\node-v20;%PATH%

echo Node version:
node -v

echo.
echo Starting Next.js Dev Server...
echo Website will be available at http://localhost:3000
echo Admin CMS available at http://localhost:3000/admin/login
echo.

npm run dev
pause
