<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pembayaran;
use App\Models\Pesanan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class PesananController extends Controller
{
    /** GET /api/admin/pesanan?status=&tanggal=&cari= */
    public function index(Request $request): JsonResponse
    {
        Pesanan::batalkanYangKedaluwarsa();

        $query = Pesanan::with('pembayaran')->withCount('item');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('tanggal')) {
            $query->whereDate('dibuat_pada', $request->tanggal);
        }
        if ($request->filled('cari')) {
            $query->where(fn ($q) => $q->where('kode', 'like', '%'.$request->cari.'%')
                ->orWhere('nama_penerima', 'like', '%'.$request->cari.'%'));
        }

        $pesanan = $query->orderByDesc('dibuat_pada')->limit(200)->get();

        // Ringkasan jumlah per status untuk kartu di atas daftar
        $ringkasan = Pesanan::select('status', DB::raw('count(*) as jumlah'))
            ->groupBy('status')->pluck('jumlah', 'status');

        return response()->json(['data' => $pesanan, 'ringkasan' => $ringkasan]);
    }

    /** GET /api/admin/pesanan/{id} */
    public function show(Pesanan $pesanan): JsonResponse
    {
        $pesanan->load(['item.opsi', 'pembayaran.admin:id,nama', 'riwayat.admin:id,nama']);

        return response()->json([
            'pesanan' => $pesanan,
            'langkah_berikutnya' => $pesanan->langkahBerikutnya(),
            'bisa_dibatalkan' => $pesanan->bisaDibatalkan(),
        ]);
    }

    /** POST /api/admin/pesanan/{id}/status — maju satu langkah sesuai urutan. */
    public function ubahStatus(Request $request, Pesanan $pesanan): JsonResponse
    {
        $request->validate([
            'status' => ['required', Rule::in($pesanan->langkahBerikutnya())],
            'catatan' => 'nullable|string|max:255',
        ], ['status.in' => 'Status tidak boleh dilompati atau dimundurkan.']);

        DB::transaction(function () use ($request, $pesanan) {
            Pesanan::whereKey($pesanan->id)->lockForUpdate()->first();
            $pesanan->ubahStatus($request->status, $request->catatan, $request->user()->id);
        });

        return $this->show($pesanan->fresh());
    }

    /** POST /api/admin/pesanan/{id}/batal — hanya sebelum diproses, wajib alasan. */
    public function batal(Request $request, Pesanan $pesanan): JsonResponse
    {
        $request->validate(['alasan' => 'required|string|max:255']);

        if (! $pesanan->bisaDibatalkan()) {
            return response()->json(['message' => 'Pesanan yang sudah diproses tidak dapat dibatalkan.'], 422);
        }

        DB::transaction(function () use ($request, $pesanan) {
            $pesanan->alasan_batal = $request->alasan;
            $pesanan->ubahStatus(Pesanan::DIBATALKAN, $request->alasan, $request->user()->id);

            // Dana yang sudah diterima harus dikembalikan (secara manual di luar website)
            $pesanan->pembayaran()->where('status', 'diterima')->update(['refund_status' => 'perlu']);
            // Bukti yang belum diperiksa ditolak otomatis karena pesanan batal
            $pesanan->pembayaran()->where('status', 'menunggu')->update([
                'status' => 'ditolak',
                'catatan' => 'Pesanan dibatalkan',
                'admin_id' => $request->user()->id,
                'diverifikasi_pada' => now(),
            ]);
        });

        return $this->show($pesanan->fresh());
    }

    /**
     * POST /api/admin/pembayaran/{id}/verifikasi
     * keputusan = terima | tolak. Alasan wajib jika ditolak.
     */
    public function verifikasi(Request $request, Pembayaran $pembayaran): JsonResponse
    {
        $request->validate([
            'keputusan' => 'required|in:terima,tolak',
            'catatan' => 'required_if:keputusan,tolak|nullable|string|max:255',
        ], ['catatan.required_if' => 'Alasan penolakan wajib diisi.']);

        $hasil = DB::transaction(function () use ($request, $pembayaran) {
            // Kunci baris pesanan agar dua admin tidak memverifikasi bersamaan
            $pesanan = Pesanan::whereKey($pembayaran->pesanan_id)->lockForUpdate()->first();
            $pembayaran->refresh();

            if ($pembayaran->status !== 'menunggu') {
                return 'Bukti ini sudah diperiksa sebelumnya.';
            }
            if ($pesanan->status !== Pesanan::MENUNGGU_PEMBAYARAN) {
                return 'Pesanan tidak sedang menunggu pembayaran.';
            }

            $terima = $request->keputusan === 'terima';

            $pembayaran->update([
                'status' => $terima ? 'diterima' : 'ditolak',
                'catatan' => $request->catatan,
                'admin_id' => $request->user()->id,
                'diverifikasi_pada' => now(),
            ]);

            if ($terima) {
                $pesanan->ubahStatus(Pesanan::DITERIMA, 'Pembayaran terverifikasi', $request->user()->id);
            } else {
                $pesanan->riwayat()->create([
                    'status' => $pesanan->status,
                    'catatan' => 'Bukti pembayaran ditolak: '.$request->catatan,
                    'admin_id' => $request->user()->id,
                ]);
            }

            return null;
        });

        if ($hasil) {
            return response()->json(['message' => $hasil], 422);
        }

        return $this->show(Pesanan::find($pembayaran->pesanan_id));
    }

    /** POST /api/admin/pembayaran/{id}/refund — catat bahwa dana sudah dikembalikan. */
    public function refund(Request $request, Pembayaran $pembayaran): JsonResponse
    {
        $request->validate(['refund_catatan' => 'required|string|max:255']);

        if ($pembayaran->refund_status !== 'perlu') {
            return response()->json(['message' => 'Pembayaran ini tidak memerlukan refund.'], 422);
        }

        $pembayaran->update([
            'refund_status' => 'selesai',
            'refund_catatan' => $request->refund_catatan,
        ]);

        return $this->show(Pesanan::find($pembayaran->pesanan_id));
    }

    /** GET /api/admin/pembayaran/{id}/bukti — menampilkan berkas bukti privat. */
    public function bukti(Pembayaran $pembayaran): BinaryFileResponse
    {
        return response()->file(Storage::disk('local')->path($pembayaran->bukti_path));
    }
}
