<?php

namespace Database\Seeders;

use App\Models\Kategori;
use App\Models\Pengguna;
use App\Models\Produk;
use App\Models\ZonaAntar;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Data contoh. Jalankan dengan: php artisan migrate:fresh --seed
 * Semua nama menu, harga, dan zona hanya contoh — silakan diganti.
 */
class DatabaseSeeder extends Seeder
{
    /** Isi database dengan akun admin, kategori, menu, opsi, dan zona contoh. */
    public function run(): void
    {
        // Akun admin untuk percobaan di komputer sendiri (ganti sandinya sebelum dipakai sungguhan!)
        Pengguna::create([
            'nama' => 'Admin Slerp',
            'email' => 'admin@slerp.test',
            'password_hash' => Hash::make('admin123'),
            'aktif' => true,
        ]);

        $mie = Kategori::create(['nama' => 'Mie']);
        $minuman = Kategori::create(['nama' => 'Minuman']);
        $dimsum = Kategori::create(['nama' => 'Dimsum']);

        // Level pedas untuk semua mie: level 0–2 gratis, level 3–6 tambah Rp1.000
        $level = [];
        foreach (range(0, 6) as $n) {
            $level[] = ['pedas', $n === 0 ? 'Level 0 (tidak pedas)' : "Level $n", $n >= 3 ? 1000 : 0];
        }

        // [kategori, nama, deskripsi, foto, harga, varian wajib?, pedas wajib?, opsi]
        $data = [
            [$mie, 'Mie Ayam', 'Mie kenyal dengan ayam kecap manis-gurih, sawi hijau, dan kuah kaldu hangat. Menu andalan sejak hari pertama.', 'mie-ayam.jpg', 9500, false, true, $level],
            [$mie, 'Mie Goreng', 'Mie goreng wajan besi dengan sayuran, bawang bombai, dan bumbu kecap sangrai yang wangi.', 'mie-goreng.jpg', 9500, false, true, $level],
            [$mie, 'Mie Duarrr', 'Pedas ultra! Mie bumbu sambal rawit dengan pangsit goreng renyah dan bawang goreng. Berani coba level 6?', 'mie-duarrr.jpg', 9500, false, true, $level],

            [$minuman, 'Es Kuwut', 'Minuman khas Bali: serutan kelapa muda, melon, selasih, dan perasan jeruk nipis. Segar sekali.', 'es-kuwut.jpg', 6000, false, false, []],
            [$minuman, 'Es Teler', 'Alpukat, nangka, kelapa muda, cincau, dan mutiara dengan susu kental manis di atas es serut.', 'es-teler.jpg', 12000, false, false, []],
            [$minuman, 'Es Teh', 'Teh melati diseduh setiap pagi, disajikan dingin. Penyelamat setelah mie pedas.', 'es-teh.jpg', 4000, false, false, []],
            [$minuman, 'Es Thai Tea', 'Teh Thailand dengan susu, manis dan creamy, diberi busa susu di atasnya.', 'es-thai-tea.jpg', 7500, false, false, []],

            [$dimsum, 'Siomay', 'Siomay ayam dan udang kukus dengan kulit lembut, disajikan di keranjang bambu.', 'siomay.jpg', 8500, false, false, []],
            [$dimsum, 'Jiaozi', 'Pangsit rebus isi ayam dan sayuran, disiram minyak cabai dan daun bawang.', 'jiaozi.jpg', 8500, false, false, []],
            [$dimsum, 'Gyoza', 'Pangsit panggang dengan dasar renyah keemasan, ditabur wijen sangrai.', 'gyoza.jpg', 8500, false, false, []],
            [$dimsum, 'Lumpia Udang', 'Lumpia kulit tahu isi udang cincang, digoreng renyah dan disajikan dengan saus sambal manis.', 'lumpia-udang.jpg', 8500, false, false, []],
        ];

        foreach ($data as $baris) {
            [$kategori, $nama, $deskripsi, $foto, $harga, $varianWajib, $pedasWajib, $opsi] = $baris;

            $produk = Produk::create([
                'kategori_id' => $kategori->id,
                'nama' => $nama,
                'deskripsi' => $deskripsi,
                'foto_path' => 'images/menu/'.$foto,
                'harga_dasar' => $harga,
                'varian_wajib' => $varianWajib,
                'pedas_wajib' => $pedasWajib,
                'aktif' => true,
            ]);

            foreach ($opsi as [$jenis, $namaOpsi, $biaya]) {
                $produk->opsi()->create(['jenis' => $jenis, 'nama' => $namaOpsi, 'biaya_tambahan' => $biaya]);
            }
        }

        ZonaAntar::create(['nama' => 'Zona Dekat', 'cakupan' => 'Radius ± 2 km dari outlet: Kec. Contoh Utara dan sekitarnya.', 'ongkir' => 5000]);
        ZonaAntar::create(['nama' => 'Zona Tengah', 'cakupan' => 'Radius 2–5 km: Kec. Contoh Timur, Kec. Contoh Barat.', 'ongkir' => 8000]);
        ZonaAntar::create(['nama' => 'Zona Jauh', 'cakupan' => 'Radius 5–8 km: Kec. Contoh Selatan.', 'ongkir' => 12000]);
    }
}
