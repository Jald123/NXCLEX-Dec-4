@echo off
echo Killing any hung Node.js processes on ports 3000 and 3001...

REM Kill processes on port 3000
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul

REM Kill processes on port 3001  
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul

echo.
echo Processes killed. Now starting dev servers...
echo.

REM Set the full path to npm
set NPM_PATH=%~dp0nodejs\node-v20.11.0-win-x64\npm.cmd

REM Start Admin Dashboard with full path
start "Admin Dashboard" cmd /k "cd /d %~dp0apps\admin-dashboard && %NPM_PATH% run dev"

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start Student Portal with full path
start "Student Portal" cmd /k "cd /d %~dp0apps\student-portal && %NPM_PATH% run dev"

echo.
echo Dev servers starting in new windows...
echo Admin Dashboard: http://localhost:3000
echo Student Portal: http://localhost:3001
echo.
echo Wait 10-15 seconds for servers to fully start, then check the URLs above.
pause
