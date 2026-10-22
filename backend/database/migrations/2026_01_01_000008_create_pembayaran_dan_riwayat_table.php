<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Setiap unggahan bukti = satu "percobaan" pembayaran
        Schema::create('pembayaran', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pesanan_id')->constrained('pesanan')->cascadeOnDelete();
            $table->string('metode', 20)->default('transfer_bank');
            $table->decimal('nominal', 12, 2)->unsigned();
            $table->string('referensi', 120);
            $table->string('bukti_path', 255);
            $table->enum('status', ['menunggu', 'diterima', 'ditolak'])->default('menunggu');
            $table->string('catatan', 255)->nullable();
            $table->foreignId('admin_id')->nullable()->constrained('pengguna');
            $table->dateTime('diunggah_pada');
            $table->dateTime('diverifikasi_pada')->nullable();
            $table->enum('refund_status', ['tidak_ada', 'perlu', 'selesai'])->default('tidak_ada');
            $table->string('refund_catatan', 255)->nullable();
        });

        Schema::create('riwayat_status', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pesanan_id')->constrained('pesanan')->cascadeOnDelete();
            $table->string('status', 30);
            $table->string('catatan', 255)->nullable();
            $table->foreignId('admin_id')->nullable()->constrained('pengguna');
            $table->dateTime('dibuat_pada');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('riwayat_status');
        Schema::dropIfExists('pembayaran');
    }
};
