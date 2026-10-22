@echo off
REM Menjalankan server Laravel di http://localhost:8000
REM Biarkan jendela ini terbuka selama website dipakai. Tutup / Ctrl+C untuk berhenti.
setlocal
call "%~dp0pengaturan.bat"

if not exist "%~dp0backend\vendor" goto belum_setup
if not exist "%~dp0backend\.env" goto belum_setup

cd /d "%~dp0backend"
echo Backend Laravel berjalan di http://localhost:8000  (tutup jendela ini untuk berhenti)
"%PHP%" artisan serve --port=8000
pause
exit /b 0

:belum_setup
echo [GAGAL] Proyek belum di-setup. Jalankan 1-setup.bat terlebih dahulu.
pause
exit /b 1
