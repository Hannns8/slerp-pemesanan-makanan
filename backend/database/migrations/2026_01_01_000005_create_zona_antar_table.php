<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('zona_antar', function (Blueprint $table) {
            $table->id();
            $table->string('nama', 80)->unique();
            $table->text('cakupan');
            $table->decimal('ongkir', 12, 2)->unsigned();
            $table->boolean('aktif')->default(true);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('zona_antar');
    }
};
