<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ItemPesanan extends Model
{
    protected $table = 'item_pesanan';
    public $timestamps = false;

    protected $fillable = [
        'pesanan_id', 'produk_id', 'nama_produk',
        'harga_dasar', 'harga_satuan', 'jumlah', 'subtotal',
    ];

    protected $casts = [
        'harga_dasar' => 'float',
        'harga_satuan' => 'float',
        'jumlah' => 'integer',
        'subtotal' => 'float',
    ];

    /** Item ini milik satu pesanan. */
    public function pesanan(): BelongsTo
    {
        return $this->belongsTo(Pesanan::class, 'pesanan_id');
    }

    /** Opsi (varian/pedas/topping) yang dipilih untuk item ini. */
    public function opsi(): HasMany
    {
        return $this->hasMany(OpsiItem::class, 'item_id');
    }
}
