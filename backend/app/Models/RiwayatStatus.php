<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RiwayatStatus extends Model
{
    protected $table = 'riwayat_status';

    const CREATED_AT = 'dibuat_pada';
    const UPDATED_AT = null;

    protected $fillable = ['pesanan_id', 'status', 'catatan', 'admin_id'];

    protected $casts = ['dibuat_pada' => 'datetime'];

    /** Admin yang mengubah status (kosong jika oleh sistem/pelanggan). */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(Pengguna::class, 'admin_id');
    }
}
