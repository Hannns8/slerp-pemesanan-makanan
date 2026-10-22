<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabel pengguna = akun admin (pemilik / petugas usaha).
 * Pelanggan TIDAK punya akun karena checkout tanpa registrasi.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pengguna', function (Blueprint $table) {
            $table->id();
            $table->string('nama', 100);
            $table->string('email', 150)->unique();
            $table->string('password_hash', 255); // hash, bukan sandi asli
            $table->boolean('aktif')->default(true);
            $table->dateTime('dibuat_pada');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengguna');
    }
};
