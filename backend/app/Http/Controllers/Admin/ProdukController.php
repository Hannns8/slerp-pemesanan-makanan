<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OpsiProduk;
use App\Models\Produk;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProdukController extends Controller
{
    /** GET /api/admin/produk?cari=&kategori_id=&aktif= */
    public function index(Request $request): JsonResponse
    {
        $query = Produk::with('kategori:id,nama')->withCount('opsi');

        if ($request->filled('cari')) {
            $query->where('nama', 'like', '%'.$request->cari.'%');
        }
        if ($request->filled('kategori_id')) {
            $query->where('kategori_id', $request->kategori_id);
        }
        if ($request->filled('aktif')) {
            $query->where('aktif', $request->boolean('aktif'));
        }

        return response()->json($query->orderBy('kategori_id')->orderBy('id')->get());
    }

    /** GET /api/admin/produk/{id} — termasuk opsi yang nonaktif. */
    public function show(Produk $produk): JsonResponse
    {
        return response()->json($produk->load(['kategori:id,nama', 'opsi' => fn ($q) => $q->orderBy('jenis')->orderBy('id')]));
    }

    /** POST /api/admin/produk — tambah produk (multipart, karena ada foto). */
    public function store(Request $request): JsonResponse
    {
        $data = $this->validasi($request, true);
        $data['foto_path'] = $request->file('foto')->store('produk', 'public');

        // Produk baru dengan pilihan wajib belum punya opsi → simpan sebagai nonaktif dulu
        $mintaAktif = $data['aktif'] ?? true;
        $data['aktif'] = $mintaAktif && ! $data['varian_wajib'] && ! $data['pedas_wajib'];

        $produk = Produk::create($data);

        return response()->json([
            'produk' => $produk,
            'pesan' => $mintaAktif && ! $produk->aktif
                ? 'Produk disimpan sebagai nonaktif. Tambahkan opsi wajib lalu aktifkan.'
                : 'Produk berhasil ditambahkan.',
        ], 201);
    }

    /**
     * POST /api/admin/produk/{id} — ubah produk.
     * Memakai POST (bukan PUT) karena PHP tidak membaca file dari request PUT multipart.
     */
    public function update(Request $request, Produk $produk): JsonResponse
    {
        $data = $this->validasi($request, false);

        if ($request->hasFile('foto')) {
            if (! str_starts_with($produk->foto_path, 'images/')) {
                Storage::disk('public')->delete($produk->foto_path);
            }
            $data['foto_path'] = $request->file('foto')->store('produk', 'public');
        }

        $produk->fill($data);

        if ($produk->aktif && ($alasan = $produk->alasanTidakBisaAktif())) {
            return response()->json(['message' => $alasan, 'errors' => ['aktif' => [$alasan]]], 422);
        }

        $produk->save();

        return response()->json(['produk' => $produk, 'pesan' => 'Produk berhasil diperbarui.']);
    }

    // ---------- Opsi produk ----------

    /** POST /api/admin/produk/{id}/opsi */
    public function tambahOpsi(Request $request, Produk $produk): JsonResponse
    {
        $data = $request->validate([
            'jenis' => ['required', Rule::in(OpsiProduk::JENIS)],
            'nama' => [
                'required', 'string', 'max:80',
                Rule::unique('opsi_produk')->where('produk_id', $produk->id)->where('jenis', $request->jenis),
            ],
            'biaya_tambahan' => 'required|numeric|min:0',
        ], ['nama.unique' => 'Opsi dengan nama ini sudah ada.']);

        return response()->json($produk->opsi()->create($data), 201);
    }

    /** PUT /api/admin/opsi/{id} */
    public function ubahOpsi(Request $request, OpsiProduk $opsi): JsonResponse
    {
        $data = $request->validate([
            'nama' => [
                'required', 'string', 'max:80',
                Rule::unique('opsi_produk')->where('produk_id', $opsi->produk_id)
                    ->where('jenis', $opsi->jenis)->ignore($opsi->id),
            ],
            'biaya_tambahan' => 'required|numeric|min:0',
            'aktif' => 'boolean',
        ]);

        $opsi->fill($data);

        // Menonaktifkan opsi wajib terakhir dari produk aktif tidak diizinkan
        if (! $opsi->aktif && $opsi->produk->aktif) {
            $opsi->save();
            if ($alasan = $opsi->produk->alasanTidakBisaAktif()) {
                $opsi->update(['aktif' => true]);

                return response()->json(['message' => $alasan.' Nonaktifkan produknya terlebih dahulu.'], 422);
            }
        }

        $opsi->save();

        return response()->json($opsi);
    }

    /** DELETE /api/admin/opsi/{id} — hanya jika belum pernah dipesan; selain itu nonaktifkan. */
    public function hapusOpsi(OpsiProduk $opsi): JsonResponse
    {
        if ($opsi->pernahDipesan()) {
            return response()->json([
                'message' => 'Opsi sudah pernah dipesan sehingga tidak bisa dihapus. Nonaktifkan saja.',
            ], 422);
        }

        $produk = $opsi->produk;
        $opsi->delete();

        if ($produk->aktif && ($alasan = $produk->alasanTidakBisaAktif())) {
            $produk->update(['aktif' => false]);

            return response()->json(['message' => 'Opsi dihapus. Produk dinonaktifkan: '.$alasan]);
        }

        return response()->json(['message' => 'Opsi dihapus.']);
    }

    /** Aturan validasi form produk (foto wajib hanya untuk produk baru). */
    private function validasi(Request $request, bool $baru): array
    {
        return $request->validate([
            'kategori_id' => 'required|exists:kategori,id',
            'nama' => 'required|string|max:100',
            'deskripsi' => 'required|string|max:1000',
            'harga_dasar' => 'required|numeric|min:0',
            'varian_wajib' => 'required|boolean',
            'pedas_wajib' => 'required|boolean',
            'aktif' => 'required|boolean',
            'foto' => ($baru ? 'required' : 'nullable').'|image|mimes:jpg,jpeg,png,webp|max:2048',
        ], ['harga_dasar.min' => 'Harga tidak boleh negatif.']);
    }
}
