@echo off
REM Start the Next.js dev server using portable Node.js
cd /d "%~dp0"
..\..\nodejs\node-v20.11.0-win-x64\node_modules\npm\bin\npx-cli.js next dev -p 3000
