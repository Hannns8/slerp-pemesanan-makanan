<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Kategori extends Model
{
    protected $table = 'kategori';
    public $timestamps = false;

    protected $fillable = ['nama', 'aktif'];

    protected $casts = ['aktif' => 'boolean'];

    /** Satu kategori memiliki banyak produk */
    public function produk(): HasMany
    {
        return $this->hasMany(Produk::class, 'kategori_id');
    }
}
