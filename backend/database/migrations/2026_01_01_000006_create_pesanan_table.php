<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pesanan', function (Blueprint $table) {
            $table->id();
            $table->string('kode', 24)->unique();
            $table->string('checkout_key', 64)->unique(); // pencegah pesanan ganda
            $table->string('token_hash', 255);            // hash token pelacakan
            $table->string('nama_penerima', 100);
            $table->string('telepon', 20);
            $table->enum('metode', ['ambil', 'antar']);
            $table->foreignId('zona_id')->nullable()->constrained('zona_antar');
            $table->string('nama_zona', 80)->nullable();
            $table->text('alamat')->nullable();
            $table->text('catatan')->nullable();
            $table->decimal('subtotal', 12, 2)->unsigned();
            $table->decimal('ongkir', 12, 2)->unsigned()->default(0);
            $table->decimal('total', 12, 2)->unsigned();
            $table->enum('status', [
                'menunggu_pembayaran', 'diterima', 'diproses',
                'siap_diambil', 'dikirim', 'selesai', 'dibatalkan',
            ])->default('menunggu_pembayaran');
            $table->string('alasan_batal', 255)->nullable();
            $table->foreignId('admin_id')->nullable()->constrained('pengguna');
            $table->dateTime('dibuat_pada')->index();
            $table->dateTime('batas_bayar');
            $table->dateTime('diubah_pada');

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pesanan');
    }
};
