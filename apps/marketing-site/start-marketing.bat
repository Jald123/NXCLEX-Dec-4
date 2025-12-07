@echo off
set NODE_PATH=C:\Users\haldhaher\Desktop\nclex-ngn-platform\nodejs\node-v20.11.0-win-x64
set PATH=%NODE_PATH%;%PATH%

echo Starting Marketing Site on port 3003...
cd /d "%~dp0"
"%NODE_PATH%\npm.cmd" run dev
