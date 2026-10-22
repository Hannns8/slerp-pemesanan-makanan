<?php

namespace App\Services;

use App\Models\OpsiProduk;
use App\Models\Produk;
use Illuminate\Validation\ValidationException;

/**
 * SERVICE: tempat logika bisnis yang dipakai lebih dari satu Controller.
 *
 * KeranjangService menghitung ulang harga keranjang dari data katalog di database.
 * Server TIDAK pernah mempercayai harga yang dikirim browser.
 *
 * Format satu item yang dikirim frontend:
 *   ['produk_id' => 1, 'jumlah' => 2, 'opsi_ids' => [3, 7]]
 */
class KeranjangService
{
    /**
     * @return array{items: array, subtotal: float}
     * @throws ValidationException jika ada item yang tidak valid
     */
    public function hitung(array $items): array
    {
        $hasil = [];
        $errors = [];

        foreach ($items as $i => $item) {
            try {
                $hasil[] = $this->hitungSatuItem($item);
            } catch (\InvalidArgumentException $e) {
                $errors["items.$i"] = $e->getMessage();
            }
        }

        if ($errors) {
            throw ValidationException::withMessages($errors);
        }

        return [
            'items' => $hasil,
            'subtotal' => array_sum(array_column($hasil, 'subtotal')),
        ];
    }

    /** Validasi satu item keranjang lalu hitung harga satuan & subtotalnya. */
    private function hitungSatuItem(array $item): array
    {
        $jumlah = (int) ($item['jumlah'] ?? 0);
        if ($jumlah < 1 || $jumlah > 99) {
            throw new \InvalidArgumentException('Jumlah harus antara 1 sampai 99.');
        }

        // 1. Produk harus ada, aktif, dan kategorinya aktif
        $produk = Produk::tersedia()->find($item['produk_id'] ?? 0);
        if (! $produk) {
            throw new \InvalidArgumentException('Menu sudah tidak tersedia.');
        }

        // 2. Opsi harus aktif dan milik produk ini
        $opsiIds = array_map('intval', $item['opsi_ids'] ?? []);
        if (count($opsiIds) !== count(array_unique($opsiIds))) {
            throw new \InvalidArgumentException("Pilihan untuk {$produk->nama} tidak boleh dobel.");
        }

        $opsi = OpsiProduk::whereIn('id', $opsiIds)
            ->where('produk_id', $produk->id)
            ->where('aktif', true)
            ->get();

        if ($opsi->count() !== count($opsiIds)) {
            throw new \InvalidArgumentException("Sebagian pilihan untuk {$produk->nama} sudah tidak tersedia.");
        }

        // 3. Maksimal satu varian & satu level pedas; wajib jika produk mengharuskan
        $jumlahVarian = $opsi->where('jenis', 'varian')->count();
        $jumlahPedas = $opsi->where('jenis', 'pedas')->count();

        if ($jumlahVarian > 1 || $jumlahPedas > 1) {
            throw new \InvalidArgumentException("Pilih hanya satu varian dan satu level pedas untuk {$produk->nama}.");
        }
        if ($produk->varian_wajib && $jumlahVarian === 0) {
            throw new \InvalidArgumentException("Varian untuk {$produk->nama} wajib dipilih.");
        }
        if ($produk->pedas_wajib && $jumlahPedas === 0) {
            throw new \InvalidArgumentException("Level pedas untuk {$produk->nama} wajib dipilih.");
        }

        // 4. Hitung harga: harga satuan = harga dasar + biaya opsi
        $hargaSatuan = $produk->harga_dasar + $opsi->sum('biaya_tambahan');

        return [
            'produk_id' => $produk->id,
            'nama_produk' => $produk->nama,
            'foto_url' => $produk->foto_url,
            'harga_dasar' => $produk->harga_dasar,
            'opsi' => $opsi->sortBy(fn ($o) => array_search($o->jenis, OpsiProduk::JENIS))
                ->map(fn ($o) => [
                    'id' => $o->id,
                    'jenis' => $o->jenis,
                    'nama' => $o->nama,
                    'biaya_tambahan' => $o->biaya_tambahan,
                ])->values()->all(),
            'harga_satuan' => $hargaSatuan,
            'jumlah' => $jumlah,
            'subtotal' => $hargaSatuan * $jumlah,
        ];
    }
}
