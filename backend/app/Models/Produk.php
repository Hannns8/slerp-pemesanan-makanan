<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Produk extends Model
{
    protected $table = 'produk';
    public $timestamps = false;

    protected $fillable = [
        'kategori_id', 'nama', 'deskripsi', 'foto_path',
        'harga_dasar', 'varian_wajib', 'pedas_wajib', 'aktif',
    ];

    protected $casts = [
        'harga_dasar' => 'float',
        'varian_wajib' => 'boolean',
        'pedas_wajib' => 'boolean',
        'aktif' => 'boolean',
    ];

    // foto_url otomatis ikut saat model diubah ke JSON
    protected $appends = ['foto_url'];

    /** Produk ini berada di satu kategori. */
    public function kategori(): BelongsTo
    {
        return $this->belongsTo(Kategori::class, 'kategori_id');
    }

    /** Semua opsi (varian/pedas/topping) milik produk ini. */
    public function opsi(): HasMany
    {
        return $this->hasMany(OpsiProduk::class, 'produk_id');
    }

    /**
     * Scope "tersedia": produk aktif DAN kategorinya aktif.
     * Dipakai seperti: Produk::tersedia()->get()
     */
    public function scopeTersedia(Builder $query): Builder
    {
        return $query->where('aktif', true)
            ->whereHas('kategori', fn ($q) => $q->where('aktif', true));
    }

    /** URL lengkap foto. Foto contoh ada di public/images, foto unggahan admin di storage. */
    public function getFotoUrlAttribute(): string
    {
        if (str_starts_with($this->foto_path, 'images/')) {
            return asset($this->foto_path);
        }

        return Storage::disk('public')->url($this->foto_path);
    }

    /**
     * Aturan: produk tidak boleh aktif jika pilihan yang diwajibkan belum ada.
     * Mengembalikan pesan error, atau null jika boleh diaktifkan.
     */
    public function alasanTidakBisaAktif(): ?string
    {
        if ($this->varian_wajib && ! $this->opsi()->where('jenis', 'varian')->where('aktif', true)->exists()) {
            return 'Produk mewajibkan varian, tetapi belum ada opsi varian yang aktif.';
        }
        if ($this->pedas_wajib && ! $this->opsi()->where('jenis', 'pedas')->where('aktif', true)->exists()) {
            return 'Produk mewajibkan level pedas, tetapi belum ada opsi pedas yang aktif.';
        }

        return null;
    }
}
