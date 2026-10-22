<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kategori;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Kategori tidak dihapus, hanya dinonaktifkan.
 * Kategori nonaktif ikut menyembunyikan produk di dalamnya.
 */
class KategoriController extends Controller
{
    /** GET /api/admin/kategori — semua kategori beserta jumlah produknya. */
    public function index(): JsonResponse
    {
        return response()->json(Kategori::withCount('produk')->orderBy('id')->get());
    }

    /** POST /api/admin/kategori — tambah kategori baru. */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nama' => 'required|string|max:60|unique:kategori,nama',
            'aktif' => 'boolean',
        ]);

        return response()->json(Kategori::create($data), 201);
    }

    /** PUT /api/admin/kategori/{id} — ganti nama atau aktif/nonaktifkan kategori. */
    public function update(Request $request, Kategori $kategori): JsonResponse
    {
        $data = $request->validate([
            'nama' => ['required', 'string', 'max:60', Rule::unique('kategori', 'nama')->ignore($kategori->id)],
            'aktif' => 'boolean',
        ]);

        $kategori->update($data);

        return response()->json($kategori);
    }
}
