@echo off
REM Menjalankan React (Vite) di http://localhost:5173
REM Biarkan jendela ini terbuka selama website dipakai. Tutup / Ctrl+C untuk berhenti.
if not exist "%~dp0frontend\node_modules" goto belum_setup

cd /d "%~dp0frontend"
echo Buka http://localhost:5173 di browser  (tutup jendela ini untuk berhenti)
call npm run dev
pause
exit /b 0

:belum_setup
echo [GAGAL] Library JavaScript belum terpasang. Jalankan 1-setup.bat terlebih dahulu.
pause
exit /b 1
