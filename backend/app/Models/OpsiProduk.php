<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Pilihan untuk sebuah produk: varian, level pedas, atau topping. */
class OpsiProduk extends Model
{
    protected $table = 'opsi_produk';
    public $timestamps = false;

    public const JENIS = ['varian', 'pedas', 'topping'];

    protected $fillable = ['produk_id', 'jenis', 'nama', 'biaya_tambahan', 'aktif'];

    protected $casts = [
        'biaya_tambahan' => 'float',
        'aktif' => 'boolean',
    ];

    /** Opsi ini milik satu produk. */
    public function produk(): BelongsTo
    {
        return $this->belongsTo(Produk::class, 'produk_id');
    }

    /** Apakah opsi ini pernah dipakai di pesanan (jika ya, tidak boleh dihapus). */
    public function pernahDipesan(): bool
    {
        return OpsiItem::where('opsi_id', $this->id)->exists();
    }
}
