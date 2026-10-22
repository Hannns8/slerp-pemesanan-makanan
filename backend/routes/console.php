<?php

use App\Models\Pesanan;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

/*
| Perintah: php artisan pesanan:batal-otomatis
| Membatalkan pesanan yang melewati batas 30 menit tanpa bukti pembayaran.
*/
Artisan::command('pesanan:batal-otomatis', function () {
    $jumlah = Pesanan::batalkanYangKedaluwarsa();
    $this->info("$jumlah pesanan dibatalkan otomatis.");
})->purpose('Batalkan pesanan yang lewat batas bayar tanpa bukti');

// Dijalankan tiap menit oleh "php artisan schedule:work"
Schedule::command('pesanan:batal-otomatis')->everyMinute();
