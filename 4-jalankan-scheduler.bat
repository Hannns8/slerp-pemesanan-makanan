@echo off
REM (Opsional) Menjalankan tugas terjadwal Laravel setiap menit:
REM membatalkan otomatis pesanan yang lewat 30 menit tanpa bukti bayar.
REM Tanpa ini pun pembatalan tetap terjadi saat halaman pesanan dibuka.
setlocal
call "%~dp0pengaturan.bat"
cd /d "%~dp0backend"
"%PHP%" artisan schedule:work
pause
