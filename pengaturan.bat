@echo off
REM ============================================================
REM  PENGATURAN BERSAMA untuk semua file .bat proyek ini.
REM  File ini tidak perlu diklik; dipanggil otomatis oleh file .bat lain.
REM
REM  Ubah baris di bawah jika:
REM   - XAMPP tidak terpasang di C:\xampp   (contoh: set "XAMPP=D:\xampp")
REM   - MySQL root memakai password         (isi DB_PASS, dan isi juga
REM                                           DB_PASSWORD di backend\.env)
REM ============================================================
set "XAMPP=C:\xampp"
set "DB_USER=root"
set "DB_PASS="
set "DB_NAMA=db_pemesanan_makanan"

REM --- Tidak perlu diubah di bawah ini ---
REM PHPRC memaksa PHP XAMPP membaca php.ini milik XAMPP (berisi ekstensi pdo_mysql, dll.)
set "PHPRC=%XAMPP%\php"
set "PHP=%XAMPP%\php\php.exe"
set "MYSQL=%XAMPP%\mysql\bin\mysql.exe"
set "MYSQL_ARGS=-u %DB_USER%"
if not "%DB_PASS%"=="" set "MYSQL_ARGS=-u %DB_USER% -p%DB_PASS%"
