@echo off
REM Prisma DB Push Script for Portable Node.js
SET NODE_PATH=%~dp0..\..\nodejs\node-v20.11.0-win-x64
SET PATH=%NODE_PATH%;%PATH%

echo Running Prisma DB Push...
cd /d "%~dp0"
call npm run db:push
