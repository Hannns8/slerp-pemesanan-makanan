<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pengguna;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /** POST /api/admin/login — dibatasi 5 percobaan per menit (lihat AppServiceProvider). */
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $admin = Pengguna::where('email', $data['email'])->first();

        // Pesan dibuat umum: tidak memberi tahu apakah email atau sandi yang salah
        if (! $admin || ! $admin->aktif || ! Hash::check($data['password'], $admin->password_hash)) {
            return response()->json(['message' => 'Email atau kata sandi salah.'], 422);
        }

        // Token Sanctum dipakai frontend di header: Authorization: Bearer <token>
        $token = $admin->createToken('admin')->plainTextToken;

        return response()->json(['token' => $token, 'admin' => $admin]);
    }

    /** GET /api/admin/me — data admin yang sedang login. */
    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    /** POST /api/admin/logout — hapus token yang sedang dipakai. */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Berhasil keluar.']);
    }
}
