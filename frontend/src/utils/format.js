/** Fungsi bantu format tampilan. */

export const rupiah = (angka) =>
  'Rp' + Math.round(Number(angka) || 0).toLocaleString('id-ID')

export const tanggalJam = (iso) =>
  iso
    ? new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : '-'

export const STATUS_PESANAN = {
  menunggu_pembayaran: 'Menunggu pembayaran',
  diterima: 'Diterima',
  diproses: 'Diproses',
  siap_diambil: 'Siap diambil',
  dikirim: 'Dikirim',
  selesai: 'Selesai',
  dibatalkan: 'Dibatalkan',
}

export const STATUS_BAYAR = {
  belum_dibayar: 'Belum dibayar',
  menunggu: 'Menunggu verifikasi',
  diterima: 'Terverifikasi',
  ditolak: 'Ditolak',
}

export const JENIS_OPSI = { varian: 'Varian', pedas: 'Level pedas', topping: 'Topping' }

/** Urutan jalur status sesuai metode (ambil sendiri vs antar). */
export const jalurStatus = (metode) => [
  'menunggu_pembayaran',
  'diterima',
  'diproses',
  metode === 'ambil' ? 'siap_diambil' : 'dikirim',
  'selesai',
]

/** Gabungkan nama opsi menjadi satu baris, mis. "Reguler · Level 2 · Telur" */
export const ringkasOpsi = (opsi = []) => opsi.map((o) => o.nama).join(' · ')
