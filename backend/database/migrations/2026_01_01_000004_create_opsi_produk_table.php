<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('opsi_produk', function (Blueprint $table) {
            $table->id();
            $table->foreignId('produk_id')->constrained('produk');
            $table->enum('jenis', ['varian', 'pedas', 'topping']);
            $table->string('nama', 80);
            $table->decimal('biaya_tambahan', 12, 2)->unsigned()->default(0);
            $table->boolean('aktif')->default(true);

            // Kombinasi produk_id + jenis + nama harus unik
            $table->unique(['produk_id', 'jenis', 'nama']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('opsi_produk');
    }
};
