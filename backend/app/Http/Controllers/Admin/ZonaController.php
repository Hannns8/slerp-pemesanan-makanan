<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ZonaAntar;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Zona tidak dihapus; zona yang tidak dipakai lagi cukup dinonaktifkan.
 * Pesanan lama tetap memakai salinan nama zona & ongkir saat checkout.
 */
class ZonaController extends Controller
{
    /** GET /api/admin/zona — semua zona, termasuk yang nonaktif. */
    public function index(): JsonResponse
    {
        return response()->json(ZonaAntar::orderBy('id')->get());
    }

    /** POST /api/admin/zona — tambah zona baru. */
    public function store(Request $request): JsonResponse
    {
        return response()->json(ZonaAntar::create($this->validasi($request)), 201);
    }

    /** PUT /api/admin/zona/{id} — ubah nama, cakupan, ongkir, atau status zona. */
    public function update(Request $request, ZonaAntar $zona): JsonResponse
    {
        $zona->update($this->validasi($request, $zona->id));

        return response()->json($zona);
    }

    /** Aturan validasi form zona (nama unik, ongkir tidak boleh negatif). */
    private function validasi(Request $request, ?int $abaikanId = null): array
    {
        return $request->validate([
            'nama' => ['required', 'string', 'max:80', Rule::unique('zona_antar', 'nama')->ignore($abaikanId)],
            'cakupan' => 'required|string|max:1000',
            'ongkir' => 'required|numeric|min:0',
            'aktif' => 'required|boolean',
        ], ['ongkir.min' => 'Ongkir tidak boleh negatif.']);
    }
}
