<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('produk', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kategori_id')->constrained('kategori');
            $table->string('nama', 100);
            $table->text('deskripsi');
            $table->string('foto_path', 255);
            $table->decimal('harga_dasar', 12, 2)->unsigned();
            $table->boolean('varian_wajib')->default(false);
            $table->boolean('pedas_wajib')->default(false);
            $table->boolean('aktif')->default(true);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('produk');
    }
};
