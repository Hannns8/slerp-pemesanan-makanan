@echo off
REM ============================================================
REM  SETUP PERTAMA KALI (setelah proyek diunduh / di-clone)
REM  Memasang library, membuat database, tabel, dan data contoh.
REM
REM  Syarat: XAMPP (PHP 8.2+) dengan MySQL sudah di-Start,
REM          Node.js 20+, dan koneksi internet.
REM  Lokasi XAMPP / password MySQL diatur di pengaturan.bat.
REM ============================================================
setlocal
call "%~dp0pengaturan.bat"

echo Memeriksa persyaratan...
if not exist "%PHP%" goto tanpa_php
"%PHP%" -r "exit(version_compare(PHP_VERSION, '8.2.0', '<') ? 1 : 0);"
if errorlevel 1 goto php_lama
where node >nul 2>nul
if errorlevel 1 goto tanpa_node
"%MYSQL%" %MYSQL_ARGS% -e "SELECT 1" >nul 2>nul
if errorlevel 1 goto tanpa_mysql
echo Semua persyaratan terpenuhi.
echo.

cd /d "%~dp0backend"

echo [1/6] Memasang library PHP (composer install)...
"%PHP%" -d extension=zip "%~dp0tools\composer.phar" install --no-interaction
if errorlevel 1 goto gagal

echo [2/6] Menyiapkan file .env...
if exist .env goto env_ada
copy .env.example .env >nul
"%PHP%" artisan key:generate --force
if errorlevel 1 goto gagal
:env_ada

echo [3/6] Membuat database %DB_NAMA%...
"%MYSQL%" %MYSQL_ARGS% -e "CREATE DATABASE IF NOT EXISTS %DB_NAMA% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
if errorlevel 1 goto gagal

echo [4/6] Membuat tabel + data contoh...
REM Jika database sudah berisi tabel, minta konfirmasi agar data tidak terhapus tanpa sengaja
"%MYSQL%" %MYSQL_ARGS% -N -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='%DB_NAMA%';" > "%TEMP%\slerp_jumlah_tabel.txt"
set /p JUMLAH_TABEL=<"%TEMP%\slerp_jumlah_tabel.txt"
del "%TEMP%\slerp_jumlah_tabel.txt" >nul 2>nul
if "%JUMLAH_TABEL%"=="0" goto migrasi
echo.
echo   PERHATIAN: database %DB_NAMA% sudah berisi data.
echo   Jika dilanjutkan, SEMUA data akan dihapus lalu diisi data contoh.
choice /c YN /m "  Hapus dan isi ulang database"
if errorlevel 2 goto lewati_migrasi
:migrasi
"%PHP%" artisan migrate:fresh --seed --force
if errorlevel 1 goto gagal
goto setelah_migrasi
:lewati_migrasi
echo   Database dibiarkan apa adanya.
:setelah_migrasi

echo [5/6] Menghubungkan folder foto (storage:link)...
"%PHP%" artisan storage:link >nul 2>nul

echo [6/6] Memasang library JavaScript (npm install)...
cd /d "%~dp0frontend"
call npm install
if errorlevel 1 goto gagal

echo.
echo ============================================================
echo  SETUP SELESAI
echo  Langkah berikutnya: jalankan 2-jalankan-backend.bat
echo  lalu 3-jalankan-frontend.bat, kemudian buka http://localhost:5173
echo ============================================================
pause
exit /b 0

:tanpa_php
echo [GAGAL] PHP tidak ditemukan di "%PHP%".
echo         Pasang XAMPP, atau ubah lokasi XAMPP di file pengaturan.bat.
goto gagal

:php_lama
echo [GAGAL] Versi PHP di XAMPP terlalu lama. Laravel 12 butuh PHP 8.2 atau lebih baru.
"%PHP%" -r "echo '        Versi terpasang: ' . PHP_VERSION . PHP_EOL;"
echo         Pasang XAMPP versi terbaru dari https://www.apachefriends.org
goto gagal

:tanpa_node
echo [GAGAL] Node.js belum terpasang atau belum dikenali.
echo         Pasang versi LTS dari https://nodejs.org lalu buka ulang jendela ini.
goto gagal

:tanpa_mysql
echo [GAGAL] Tidak bisa terhubung ke MySQL.
echo         - Pastikan MySQL sudah di-Start di XAMPP Control Panel.
echo         - Jika MySQL root memakai password, isi DB_PASS di pengaturan.bat
echo           dan DB_PASSWORD di backend\.env.
goto gagal

:gagal
echo.
echo SETUP GAGAL. Baca pesan di atas, lalu lihat bagian "Masalah umum" di README.md.
pause
exit /b 1
