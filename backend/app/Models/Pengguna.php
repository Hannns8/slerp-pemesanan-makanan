<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

/**
 * MODEL: Pengguna (admin).
 * Model = representasi satu tabel database dalam bentuk class PHP.
 */
class Pengguna extends Authenticatable
{
    use HasApiTokens;

    protected $table = 'pengguna';

    // Tabel hanya punya kolom "dibuat_pada", tidak ada kolom waktu ubah
    const CREATED_AT = 'dibuat_pada';
    const UPDATED_AT = null;

    protected $fillable = ['nama', 'email', 'password_hash', 'aktif'];

    // Kolom yang tidak boleh ikut terkirim ke frontend
    protected $hidden = ['password_hash'];

    protected $casts = [
        'aktif' => 'boolean',
        'dibuat_pada' => 'datetime',
    ];

    /** Laravel mencari password di kolom "password"; kita arahkan ke "password_hash". */
    public function getAuthPassword(): string
    {
        return $this->password_hash;
    }
}
