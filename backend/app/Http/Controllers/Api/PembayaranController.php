<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pembayaran;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class PembayaranController extends Controller
{
    /**
     * POST /api/pesanan/{kode}/pembayaran — pelanggan mengunggah bukti transfer.
     * Bukti baru tidak menghapus bukti lama; ia menjadi "percobaan" baru.
     */
    public function store(Request $request, string $kode): JsonResponse
    {
        $request->validate([
            'token' => 'required|string',
            'nominal' => 'required|numeric|min:1',
            'referensi' => 'required|string|max:120',
            // mimes memeriksa isi berkas, bukan hanya nama ekstensinya
            'bukti' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ], [
            'bukti.mimes' => 'Bukti harus berupa JPG, PNG, atau PDF.',
            'bukti.max' => 'Ukuran bukti maksimal 5 MB.',
        ]);

        $pesanan = PesananController::cariDenganToken($kode, $request->token);

        if (! $pesanan->bisaUnggahBukti()) {
            return response()->json([
                'message' => 'Bukti tidak dapat diunggah untuk pesanan ini saat ini.',
            ], 422);
        }

        // Pesanan tanpa bukti sama sekali harus mengunggah sebelum batas waktu
        if (! $pesanan->pembayaran()->exists() && $pesanan->batas_bayar->isPast()) {
            return response()->json(['message' => 'Batas waktu pembayaran sudah lewat.'], 422);
        }

        // Disimpan di disk "local" (storage/app/private) → TIDAK bisa diakses publik
        $path = $request->file('bukti')->store('bukti', 'local');

        $pembayaran = $pesanan->pembayaran()->create([
            'metode' => 'transfer_bank',
            'nominal' => $request->nominal,
            'referensi' => $request->referensi,
            'bukti_path' => $path,
            'status' => 'menunggu',
            'diunggah_pada' => now(),
        ]);

        $pesanan->riwayat()->create([
            'status' => $pesanan->status,
            'catatan' => 'Bukti pembayaran diunggah, menunggu verifikasi',
        ]);

        return response()->json($pembayaran, 201);
    }

    /** GET /api/pesanan/{kode}/pembayaran/{id}/bukti?token=xxx — pelanggan melihat buktinya sendiri. */
    public function bukti(Request $request, string $kode, int $id): BinaryFileResponse
    {
        $pesanan = PesananController::cariDenganToken($kode, (string) $request->query('token'));
        $pembayaran = Pembayaran::where('pesanan_id', $pesanan->id)->findOrFail($id);

        return response()->file(Storage::disk('local')->path($pembayaran->bukti_path));
    }
}
