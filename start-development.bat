@echo off
echo Starting Laravel + React Development Environment...
echo.

REM Start Laravel server in background
start "Laravel Server" cmd /k "cd /d D:\NIXTZONE\shagertech-1.0 && php artisan serve"

REM Wait a moment for Laravel to start
timeout /t 3 /nobreak >nul

REM Start React development server
cd /d D:\NIXTZONE\shagertech-1.0\react-frontend
npm run dev

echo.
echo Development servers started!
echo Laravel: https://api.shajara.tech
echo React: http://localhost:3000
pause