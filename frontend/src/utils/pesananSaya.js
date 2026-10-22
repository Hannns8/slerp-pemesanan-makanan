/**
 * Menyimpan daftar pesanan (kode + token) di browser pelanggan,
 * supaya mereka bisa membuka lagi halaman lacak tanpa mengetik ulang.
 */
const KEY = 'slerp_pesanan_saya'

// Daftar pesanan yang pernah dibuat di perangkat ini.
export function daftarPesananSaya() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || []
  } catch {
    return []
  }
}

// Simpan pesanan baru ke daftar (maksimal 10 terakhir).
export function simpanPesananSaya(kode, token, total) {
  try {
    const lama = daftarPesananSaya().filter((p) => p.kode !== kode)
    localStorage.setItem(KEY, JSON.stringify([{ kode, token, total, waktu: Date.now() }, ...lama].slice(0, 10)))
  } catch {
    /* abaikan jika penyimpanan browser tidak tersedia */
  }
}

export const tautanLacak = (kode, token) => `/pesanan/${encodeURIComponent(kode)}?token=${encodeURIComponent(token)}`
