<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\Api\KatalogController;
use App\Http\Controllers\Api\PembayaranController;
use App\Http\Controllers\Api\PesananController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| ROUTES API
|--------------------------------------------------------------------------
| Semua URL di file ini otomatis diawali "/api".
| Format: Route::metode('url', [NamaController::class, 'namaFungsi']);
*/

// ===================== SISI PELANGGAN (tanpa login) =====================

Route::get('/info', [KatalogController::class, 'info']);
Route::get('/kategori', [KatalogController::class, 'kategori']);
Route::get('/produk', [KatalogController::class, 'index']);
Route::get('/produk/{id}', [KatalogController::class, 'show']);
Route::get('/zona', [KatalogController::class, 'zona']);

Route::post('/keranjang/hitung', [PesananController::class, 'hitung']);
Route::post('/pesanan', [PesananController::class, 'store'])->middleware('throttle:checkout');
Route::get('/pesanan/{kode}', [PesananController::class, 'show']);

Route::post('/pesanan/{kode}/pembayaran', [PembayaranController::class, 'store'])->middleware('throttle:checkout');
Route::get('/pesanan/{kode}/pembayaran/{id}/bukti', [PembayaranController::class, 'bukti']);

// ===================== SISI ADMIN =====================

Route::prefix('admin')->group(function () {
    // Login dibatasi 5 percobaan per menit
    Route::post('/login', [Admin\AuthController::class, 'login'])->middleware('throttle:login');

    // Semua route di dalam grup ini wajib login (token Sanctum) dan akun aktif
    Route::middleware(['auth:sanctum', 'admin.aktif'])->group(function () {
        Route::get('/me', [Admin\AuthController::class, 'me']);
        Route::post('/logout', [Admin\AuthController::class, 'logout']);

        Route::get('/kategori', [Admin\KategoriController::class, 'index']);
        Route::post('/kategori', [Admin\KategoriController::class, 'store']);
        Route::put('/kategori/{kategori}', [Admin\KategoriController::class, 'update']);

        Route::get('/produk', [Admin\ProdukController::class, 'index']);
        Route::post('/produk', [Admin\ProdukController::class, 'store']);
        Route::get('/produk/{produk}', [Admin\ProdukController::class, 'show']);
        Route::post('/produk/{produk}', [Admin\ProdukController::class, 'update']);
        Route::post('/produk/{produk}/opsi', [Admin\ProdukController::class, 'tambahOpsi']);
        Route::put('/opsi/{opsi}', [Admin\ProdukController::class, 'ubahOpsi']);
        Route::delete('/opsi/{opsi}', [Admin\ProdukController::class, 'hapusOpsi']);

        Route::get('/zona', [Admin\ZonaController::class, 'index']);
        Route::post('/zona', [Admin\ZonaController::class, 'store']);
        Route::put('/zona/{zona}', [Admin\ZonaController::class, 'update']);

        Route::get('/pesanan', [Admin\PesananController::class, 'index']);
        Route::get('/pesanan/{pesanan}', [Admin\PesananController::class, 'show']);
        Route::post('/pesanan/{pesanan}/status', [Admin\PesananController::class, 'ubahStatus']);
        Route::post('/pesanan/{pesanan}/batal', [Admin\PesananController::class, 'batal']);

        Route::post('/pembayaran/{pembayaran}/verifikasi', [Admin\PesananController::class, 'verifikasi']);
        Route::post('/pembayaran/{pembayaran}/refund', [Admin\PesananController::class, 'refund']);
        Route::get('/pembayaran/{pembayaran}/bukti', [Admin\PesananController::class, 'bukti']);
    });
});
