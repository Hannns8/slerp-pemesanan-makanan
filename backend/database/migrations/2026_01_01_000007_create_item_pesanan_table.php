<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * item_pesanan menyimpan SALINAN nama & harga produk saat checkout,
 * supaya riwayat pesanan lama tidak berubah ketika menu diedit.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('item_pesanan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pesanan_id')->constrained('pesanan')->cascadeOnDelete();
            $table->foreignId('produk_id')->constrained('produk');
            $table->string('nama_produk', 100);
            $table->decimal('harga_dasar', 12, 2)->unsigned();
            $table->decimal('harga_satuan', 12, 2)->unsigned();
            $table->unsignedSmallInteger('jumlah');
            $table->decimal('subtotal', 12, 2)->unsigned();
        });

        Schema::create('opsi_item', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained('item_pesanan')->cascadeOnDelete();
            $table->foreignId('opsi_id')->constrained('opsi_produk');
            $table->string('jenis', 20);
            $table->string('nama', 80);
            $table->decimal('biaya_tambahan', 12, 2)->unsigned();

            $table->unique(['item_id', 'opsi_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('opsi_item');
        Schema::dropIfExists('item_pesanan');
    }
};
