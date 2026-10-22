<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pesanan;
use App\Models\ZonaAntar;
use App\Services\KeranjangService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PesananController extends Controller
{
    // Laravel otomatis "menyuntikkan" KeranjangService ke sini (dependency injection)
    public function __construct(private KeranjangService $keranjang)
    {
    }

    /**
     * POST /api/keranjang/hitung
     * Menghitung ulang keranjang dari harga terbaru di database.
     */
    public function hitung(Request $request): JsonResponse
    {
        $request->validate(['items' => 'required|array|min:1|max:50']);

        return response()->json($this->keranjang->hitung($request->items));
    }

    /**
     * POST /api/pesanan — checkout (membuat pesanan baru).
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'checkout_key' => 'required|string|max:64',
            'nama_penerima' => 'required|string|max:100',
            'telepon' => ['required', 'regex:/^(\+62|62|0)8[0-9]{7,12}$/'],
            'metode' => 'required|in:ambil,antar',
            'zona_id' => 'required_if:metode,antar|nullable|integer',
            'alamat' => 'required_if:metode,antar|nullable|string|max:500',
            'catatan' => 'nullable|string|max:500',
            'items' => 'required|array|min:1|max:50',
            'total_disetujui' => 'required|numeric|min:0',
        ], [
            'telepon.regex' => 'Nomor telepon tidak valid. Contoh: 081234567890',
            'zona_id.required_if' => 'Pilih zona pengantaran.',
            'alamat.required_if' => 'Alamat lengkap dan patokan wajib diisi untuk pengantaran.',
        ]);

        // Cegah pesanan ganda (misalnya tombol diklik dua kali)
        if (Pesanan::where('checkout_key', $data['checkout_key'])->exists()) {
            return response()->json(['message' => 'Pesanan ini sudah dibuat sebelumnya.'], 409);
        }

        // 1. Hitung ulang harga di server
        $hasil = $this->keranjang->hitung($data['items']);

        // 2. Ongkir: ambil sendiri = 0, antar = ongkir zona aktif
        $zona = null;
        if ($data['metode'] === 'antar') {
            $zona = ZonaAntar::where('aktif', true)->find($data['zona_id']);
            if (! $zona) {
                return response()->json([
                    'message' => 'Zona pengantaran tidak tersedia.',
                    'errors' => ['zona_id' => ['Zona pengantaran tidak tersedia.']],
                ], 422);
            }
        }
        $ongkir = $zona ? $zona->ongkir : 0;
        $total = $hasil['subtotal'] + $ongkir;

        // 3. Jika harga berubah sejak pelanggan melihat ringkasan, minta persetujuan ulang
        if (round($total) !== round((float) $data['total_disetujui'])) {
            return response()->json([
                'message' => 'Harga atau ketersediaan menu berubah. Periksa kembali total terbaru.',
                'ringkasan' => $hasil + ['ongkir' => $ongkir, 'total' => $total],
            ], 409);
        }

        $token = Str::random(40);

        // 4. Simpan pesanan + item + opsi dalam SATU transaksi database.
        //    Jika ada yang gagal, semuanya dibatalkan.
        $pesanan = DB::transaction(function () use ($data, $hasil, $zona, $ongkir, $total, $token) {
            $pesanan = Pesanan::create([
                'kode' => $this->buatKode(),
                'checkout_key' => $data['checkout_key'],
                'token_hash' => Hash::make($token),
                'nama_penerima' => $data['nama_penerima'],
                'telepon' => $data['telepon'],
                'metode' => $data['metode'],
                'zona_id' => $zona?->id,
                'nama_zona' => $zona?->nama,
                'alamat' => $zona ? $data['alamat'] : null,
                'catatan' => $data['catatan'] ?? null,
                'subtotal' => $hasil['subtotal'],
                'ongkir' => $ongkir,
                'total' => $total,
                'status' => Pesanan::MENUNGGU_PEMBAYARAN,
                'batas_bayar' => now()->addMinutes(Pesanan::BATAS_BAYAR_MENIT),
            ]);

            foreach ($hasil['items'] as $baris) {
                $item = $pesanan->item()->create([
                    'produk_id' => $baris['produk_id'],
                    'nama_produk' => $baris['nama_produk'],
                    'harga_dasar' => $baris['harga_dasar'],
                    'harga_satuan' => $baris['harga_satuan'],
                    'jumlah' => $baris['jumlah'],
                    'subtotal' => $baris['subtotal'],
                ]);

                foreach ($baris['opsi'] as $opsi) {
                    $item->opsi()->create([
                        'opsi_id' => $opsi['id'],
                        'jenis' => $opsi['jenis'],
                        'nama' => $opsi['nama'],
                        'biaya_tambahan' => $opsi['biaya_tambahan'],
                    ]);
                }
            }

            $pesanan->riwayat()->create([
                'status' => Pesanan::MENUNGGU_PEMBAYARAN,
                'catatan' => 'Pesanan dibuat',
            ]);

            return $pesanan;
        });

        return response()->json([
            'kode' => $pesanan->kode,
            'token' => $token, // hanya dikirim SEKALI; di database yang disimpan hash-nya
            'total' => $pesanan->total,
        ], 201);
    }

    /**
     * GET /api/pesanan/{kode}?token=xxx — halaman lacak pesanan.
     * Wajib kode + token; kode saja tidak cukup.
     */
    public function show(Request $request, string $kode): JsonResponse
    {
        Pesanan::batalkanYangKedaluwarsa();

        $pesanan = self::cariDenganToken($kode, (string) $request->query('token'));
        $pesanan->load(['item.opsi', 'pembayaran', 'riwayat']);

        return response()->json([
            'pesanan' => $pesanan,
            'bisa_unggah_bukti' => $pesanan->bisaUnggahBukti(),
            'rekening' => config('toko.bank'),
            'alamat_outlet' => config('toko.alamat_outlet'),
        ]);
    }

    /**
     * Mencari pesanan berdasarkan kode lalu mencocokkan token dengan hash di database.
     * Pesan error dibuat sama agar orang lain tidak bisa menebak kode yang valid.
     */
    public static function cariDenganToken(string $kode, string $token): Pesanan
    {
        $pesanan = Pesanan::where('kode', $kode)->first();

        if (! $pesanan || $token === '' || ! Hash::check($token, $pesanan->token_hash)) {
            abort(404, 'Pesanan tidak ditemukan atau token salah.');
        }

        return $pesanan;
    }

    /** Contoh kode: SLR-261021-K7QZ */
    private function buatKode(): string
    {
        do {
            $kode = 'SLR-'.now()->format('ymd').'-'.strtoupper(Str::random(4));
        } while (Pesanan::where('kode', $kode)->exists());

        return $kode;
    }
}
