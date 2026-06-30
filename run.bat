@echo off
:: Ensure we run from the directory containing this batch file
cd /d "%~dp0"

title Saad's Workout App
echo ==========================================
echo Starting Saad's Workout Next.js App...
echo.
echo Opening browser at http://localhost:3000...
echo ==========================================
echo.

:: Start a background process that waits 3 seconds then opens the browser
start "" cmd /c "ping 127.0.0.1 -n 4 >nul && start http://localhost:3000"

:: Start the Next.js development server
call npm run dev

echo.
echo Server has stopped.
pause
