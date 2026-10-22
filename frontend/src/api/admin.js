import client from './client'

/** Fungsi-fungsi pemanggil API sisi ADMIN (butuh token login). */

const data = (r) => r.data

export const login = (email, password) => client.post('/admin/login', { email, password }).then(data)
export const logout = () => client.post('/admin/logout').then(data)
export const ambilSaya = () => client.get('/admin/me').then(data)

// Pesanan & pembayaran
export const daftarPesanan = (params) => client.get('/admin/pesanan', { params }).then(data)
export const detailPesanan = (id) => client.get(`/admin/pesanan/${id}`).then(data)
export const ubahStatus = (id, status, catatan) => client.post(`/admin/pesanan/${id}/status`, { status, catatan }).then(data)
export const batalkanPesanan = (id, alasan) => client.post(`/admin/pesanan/${id}/batal`, { alasan }).then(data)
export const verifikasiPembayaran = (id, keputusan, catatan) =>
  client.post(`/admin/pembayaran/${id}/verifikasi`, { keputusan, catatan }).then(data)
export const catatRefund = (id, refund_catatan) => client.post(`/admin/pembayaran/${id}/refund`, { refund_catatan }).then(data)
/** Bukti bayar bersifat privat, jadi diunduh sebagai blob dengan token admin. */
export const ambilBukti = (id) => client.get(`/admin/pembayaran/${id}/bukti`, { responseType: 'blob' }).then(data)

// Kategori
export const daftarKategori = () => client.get('/admin/kategori').then(data)
export const simpanKategori = (k) =>
  (k.id ? client.put(`/admin/kategori/${k.id}`, k) : client.post('/admin/kategori', k)).then(data)

// Produk & opsi
export const daftarProduk = (params) => client.get('/admin/produk', { params }).then(data)
export const detailProduk = (id) => client.get(`/admin/produk/${id}`).then(data)
export const simpanProduk = (id, formData) =>
  client.post(id ? `/admin/produk/${id}` : '/admin/produk', formData).then(data)
export const tambahOpsi = (produkId, opsi) => client.post(`/admin/produk/${produkId}/opsi`, opsi).then(data)
export const ubahOpsi = (id, opsi) => client.put(`/admin/opsi/${id}`, opsi).then(data)
export const hapusOpsi = (id) => client.delete(`/admin/opsi/${id}`).then(data)

// Zona
export const daftarZona = () => client.get('/admin/zona').then(data)
export const simpanZona = (z) => (z.id ? client.put(`/admin/zona/${z.id}`, z) : client.post('/admin/zona', z)).then(data)
