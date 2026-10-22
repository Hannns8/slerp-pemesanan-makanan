<?php

/**
 * Pengaturan usaha. Ubah nilainya di file .env (bukan di sini)
 * supaya mudah diganti tanpa menyentuh kode.
 */
// Jam operasional (format 24 jam HH:MM), dipakai untuk status "Buka/Tutup" di website
$jamMulai = env('TOKO_JAM_MULAI', '10:00');
$jamTutup = env('TOKO_JAM_TUTUP', '21:00');

return [
    'nama' => env('TOKO_NAMA', 'Slerp!'),
    'tagline' => env('TOKO_TAGLINE', 'Mie & Minuman'),
    'alamat_outlet' => env('TOKO_ALAMAT', 'Jl. Contoh Raya No. 12, Surabaya'),
    'telepon' => env('TOKO_TELEPON', '0812-0000-0000'),

    'jam_mulai' => $jamMulai,
    'jam_tutup' => $jamTutup,
    'jam_buka' => "Setiap hari, $jamMulai - $jamTutup", // teks untuk footer & menu
    'zona_waktu' => env('APP_TIMEZONE', 'Asia/Jakarta'), // jam di atas dihitung dalam zona ini

    'bank' => [
        'nama' => env('TOKO_BANK_NAMA', 'Bank Contoh'),
        'nomor' => env('TOKO_BANK_NOMOR', '123 456 7890'),
        'atas_nama' => env('TOKO_BANK_ATAS_NAMA', 'Pemilik Usaha'),
    ],
];
