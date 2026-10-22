<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Satu percobaan pembayaran (satu unggahan bukti transfer). */
class Pembayaran extends Model
{
    protected $table = 'pembayaran';
    public $timestamps = false;

    protected $fillable = [
        'pesanan_id', 'metode', 'nominal', 'referensi', 'bukti_path', 'status',
        'catatan', 'admin_id', 'diunggah_pada', 'diverifikasi_pada',
        'refund_status', 'refund_catatan',
    ];

    // Lokasi berkas privat tidak perlu diketahui frontend
    protected $hidden = ['bukti_path'];

    protected $casts = [
        'nominal' => 'float',
        'diunggah_pada' => 'datetime',
        'diverifikasi_pada' => 'datetime',
    ];

    /** Pembayaran ini untuk satu pesanan. */
    public function pesanan(): BelongsTo
    {
        return $this->belongsTo(Pesanan::class, 'pesanan_id');
    }

    /** Admin yang memeriksa bukti pembayaran ini. */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(Pengguna::class, 'admin_id');
    }
}
