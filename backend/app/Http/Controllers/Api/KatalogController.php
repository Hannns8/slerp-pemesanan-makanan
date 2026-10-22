<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kategori;
use App\Models\Produk;
use App\Models\ZonaAntar;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * CONTROLLER: menerima request dari frontend, mengambil data lewat Model,
 * lalu mengembalikan JSON yang akan ditampilkan oleh VIEW (React).
 */
class KatalogController extends Controller
{
    /** GET /api/info — informasi usaha (nama, rekening, alamat outlet). */
    public function info(): JsonResponse
    {
        return response()->json(config('toko'));
    }

    /** GET /api/kategori — kategori yang aktif saja. */
    public function kategori(): JsonResponse
    {
        return response()->json(
            Kategori::where('aktif', true)->orderBy('id')->get()
        );
    }

    /** GET /api/produk?cari=mie&kategori_id=1 — daftar menu untuk katalog. */
    public function index(Request $request): JsonResponse
    {
        $query = Produk::with('kategori:id,nama')
            ->whereHas('kategori', fn ($q) => $q->where('aktif', true));

        if ($request->filled('cari')) {
            $query->where('nama', 'like', '%'.$request->cari.'%');
        }
        if ($request->filled('kategori_id')) {
            $query->where('kategori_id', $request->kategori_id);
        }

        // Produk nonaktif tetap ditampilkan sebagai "tidak tersedia",
        // tetapi tidak bisa dimasukkan keranjang.
        $produk = $query->orderByDesc('aktif')->orderBy('kategori_id')->orderBy('id')->get();

        return response()->json($produk);
    }

    /** GET /api/produk/{id} — detail produk beserta opsi yang aktif. */
    public function show(int $id): JsonResponse
    {
        $produk = Produk::with([
            'kategori:id,nama,aktif',
            'opsi' => fn ($q) => $q->where('aktif', true)->orderBy('id'),
        ])->findOrFail($id);

        abort_unless($produk->kategori->aktif, 404);

        return response()->json($produk);
    }

    /** GET /api/zona — zona pengantaran yang aktif (untuk checkout). */
    public function zona(): JsonResponse
    {
        return response()->json(
            ZonaAntar::where('aktif', true)->orderBy('ongkir')->get()
        );
    }
}
