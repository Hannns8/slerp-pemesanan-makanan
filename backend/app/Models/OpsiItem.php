<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Salinan opsi yang dipilih untuk satu item pesanan. */
class OpsiItem extends Model
{
    protected $table = 'opsi_item';
    public $timestamps = false;

    protected $fillable = ['item_id', 'opsi_id', 'jenis', 'nama', 'biaya_tambahan'];

    protected $casts = ['biaya_tambahan' => 'float'];
}
