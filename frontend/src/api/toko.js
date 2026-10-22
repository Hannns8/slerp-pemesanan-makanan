import client from './client'

/**
 * Fungsi-fungsi pemanggil API sisi PELANGGAN.
 * Setiap fungsi mengembalikan data (bukan objek response axios).
 */

export const ambilInfo = () => client.get('/info').then((r) => r.data)
export const ambilKategori = () => client.get('/kategori').then((r) => r.data)
export const ambilProduk = (params) => client.get('/produk', { params }).then((r) => r.data)
export const ambilDetailProduk = (id) => client.get(`/produk/${id}`).then((r) => r.data)
export const ambilZona = () => client.get('/zona').then((r) => r.data)

export const hitungKeranjang = (items) => client.post('/keranjang/hitung', { items }).then((r) => r.data)
export const buatPesanan = (data) => client.post('/pesanan', data).then((r) => r.data)

export const ambilPesanan = (kode, token) =>
  client.get(`/pesanan/${encodeURIComponent(kode)}`, { params: { token } }).then((r) => r.data)

export const unggahBukti = (kode, formData) =>
  client.post(`/pesanan/${encodeURIComponent(kode)}/pembayaran`, formData).then((r) => r.data)

export const urlBukti = (kode, id, token) =>
  `/api/pesanan/${encodeURIComponent(kode)}/pembayaran/${id}/bukti?token=${encodeURIComponent(token)}`
