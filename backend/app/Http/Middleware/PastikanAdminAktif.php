<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * MIDDLEWARE: "penjaga pintu" yang dijalankan sebelum Controller.
 * Memastikan akun admin masih aktif pada SETIAP tindakan, bukan hanya saat login.
 */
class PastikanAdminAktif
{
    /** Tolak request jika admin tidak login atau akunnya nonaktif. */
    public function handle(Request $request, Closure $next): Response
    {
        $admin = $request->user();

        if (! $admin || ! $admin->aktif) {
            $admin?->currentAccessToken()?->delete();

            return response()->json(['message' => 'Akses admin tidak diizinkan.'], 403);
        }

        return $next($request);
    }
}
