@echo off
echo Killing Node.js processes on ports 3000 and 3001...
echo.

REM Kill process on port 3000
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    echo Killing process on port 3000 (PID: %%a)
    taskkill /F /PID %%a
)

REM Kill process on port 3001
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do (
    echo Killing process on port 3001 (PID: %%a)
    taskkill /F /PID %%a
)

echo.
echo Done! Ports 3000 and 3001 should now be free.
echo.
pause
