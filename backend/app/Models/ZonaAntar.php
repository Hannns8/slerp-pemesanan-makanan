<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ZonaAntar extends Model
{
    protected $table = 'zona_antar';
    public $timestamps = false;

    protected $fillable = ['nama', 'cakupan', 'ongkir', 'aktif'];

    protected $casts = [
        'ongkir' => 'float',
        'aktif' => 'boolean',
    ];
}
