<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class Pesanan extends Model
{
    protected $table = 'pesanan';

    const CREATED_AT = 'dibuat_pada';
    const UPDATED_AT = 'diubah_pada';

    // Daftar status pesanan (lihat dokumen: "Status pesanan")
    public const MENUNGGU_PEMBAYARAN = 'menunggu_pembayaran';
    public const DITERIMA = 'diterima';
    public const DIPROSES = 'diproses';
    public const SIAP_DIAMBIL = 'siap_diambil';
    public const DIKIRIM = 'dikirim';
    public const SELESAI = 'selesai';
    public const DIBATALKAN = 'dibatalkan';

    // Batas waktu unggah bukti pertama setelah checkout (menit)
    public const BATAS_BAYAR_MENIT = 30;

    protected $fillable = [
        'kode', 'checkout_key', 'token_hash', 'nama_penerima', 'telepon',
        'metode', 'zona_id', 'nama_zona', 'alamat', 'catatan',
        'subtotal', 'ongkir', 'total', 'status', 'alasan_batal',
        'admin_id', 'batas_bayar',
    ];

    protected $hidden = ['token_hash', 'checkout_key'];

    protected $casts = [
        'subtotal' => 'float',
        'ongkir' => 'float',
        'total' => 'float',
        'dibuat_pada' => 'datetime',
        'batas_bayar' => 'datetime',
        'diubah_pada' => 'datetime',
    ];

    protected $appends = ['status_pembayaran'];

    // ---------- Relasi ----------

    /** Daftar item (menu) dalam pesanan ini. */
    public function item(): HasMany
    {
        return $this->hasMany(ItemPesanan::class, 'pesanan_id');
    }

    /** Semua percobaan pembayaran pesanan ini, urut dari yang pertama. */
    public function pembayaran(): HasMany
    {
        return $this->hasMany(Pembayaran::class, 'pesanan_id')->orderBy('id');
    }

    /** Riwayat perubahan status pesanan, urut dari yang pertama. */
    public function riwayat(): HasMany
    {
        return $this->hasMany(RiwayatStatus::class, 'pesanan_id')->orderBy('id');
    }

    /** Zona pengantaran (kosong jika ambil sendiri). */
    public function zona(): BelongsTo
    {
        return $this->belongsTo(ZonaAntar::class, 'zona_id');
    }

    // ---------- Aturan bisnis ----------

    /**
     * Status pembayaran TIDAK disimpan di tabel pesanan,
     * tetapi dihitung dari percobaan pembayaran terakhir.
     * Hasil: belum_dibayar | menunggu | diterima | ditolak
     */
    public function getStatusPembayaranAttribute(): string
    {
        $pembayaran = $this->relationLoaded('pembayaran')
            ? $this->pembayaran
            : $this->pembayaran()->get();

        if ($pembayaran->contains('status', 'diterima')) {
            return 'diterima';
        }

        return $pembayaran->last()->status ?? 'belum_dibayar';
    }

    /**
     * Langkah status berikutnya yang boleh dipilih admin.
     * Urutan tidak boleh dilompati. "diterima" hanya lewat verifikasi pembayaran.
     */
    public function langkahBerikutnya(): array
    {
        return match ($this->status) {
            self::DITERIMA => [self::DIPROSES],
            self::DIPROSES => [$this->metode === 'ambil' ? self::SIAP_DIAMBIL : self::DIKIRIM],
            self::SIAP_DIAMBIL, self::DIKIRIM => [self::SELESAI],
            default => [],
        };
    }

    /** Pembatalan manual hanya sebelum produksi (sebelum "diproses"). */
    public function bisaDibatalkan(): bool
    {
        return in_array($this->status, [self::MENUNGGU_PEMBAYARAN, self::DITERIMA]);
    }

    /** Pelanggan boleh mengunggah bukti (baru atau pengganti)? */
    public function bisaUnggahBukti(): bool
    {
        if ($this->status !== self::MENUNGGU_PEMBAYARAN) {
            return false;
        }

        // Tidak boleh unggah lagi selama ada bukti yang sedang diperiksa
        return ! $this->pembayaran()->whereIn('status', ['menunggu', 'diterima'])->exists();
    }

    /** Ubah status + simpan riwayatnya (selalu dipakai bersama). */
    public function ubahStatus(string $statusBaru, ?string $catatan = null, ?int $adminId = null): void
    {
        $this->status = $statusBaru;
        if ($adminId) {
            $this->admin_id = $adminId;
        }
        $this->save();

        $this->riwayat()->create([
            'status' => $statusBaru,
            'catatan' => $catatan,
            'admin_id' => $adminId,
        ]);
    }

    /**
     * Pembatalan otomatis: pesanan yang lewat batas bayar dan BELUM ada bukti sama sekali.
     * Dipanggil oleh scheduler (routes/console.php) dan juga sebelum data pesanan ditampilkan.
     */
    public static function batalkanYangKedaluwarsa(): int
    {
        $daftar = self::where('status', self::MENUNGGU_PEMBAYARAN)
            ->where('batas_bayar', '<', now())
            ->whereDoesntHave('pembayaran')
            ->get();

        foreach ($daftar as $pesanan) {
            DB::transaction(function () use ($pesanan) {
                $pesanan->alasan_batal = 'Bukti pembayaran tidak diunggah sebelum batas waktu.';
                $pesanan->ubahStatus(self::DIBATALKAN, 'Dibatalkan otomatis oleh sistem');
            });
        }

        return $daftar->count();
    }
}
