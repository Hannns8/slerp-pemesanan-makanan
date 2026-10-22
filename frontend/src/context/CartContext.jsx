import { createContext, useContext, useEffect, useMemo, useState } from 'react'

/**
 * Keranjang belanja disimpan di browser (localStorage), tanpa tabel di database.
 * Context membuat data keranjang bisa dipakai di komponen mana pun lewat useCart().
 */
const CartContext = createContext(null)
const STORAGE_KEY = 'slerp_keranjang'

// Baca isi keranjang yang tersimpan di browser (kosong jika belum ada).
function bacaKeranjang() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch {
    return []
  }
}

/** Item dengan produk & kombinasi opsi yang sama digabung; kombinasi berbeda = item terpisah. */
const buatKunci = (produkId, opsi) =>
  `${produkId}:${opsi.map((o) => o.id).sort((a, b) => a - b).join('-')}`

// Penyedia data keranjang untuk seluruh aplikasi (dipasang di main.jsx).
export function CartProvider({ children }) {
  const [items, setItems] = useState(bacaKeranjang)
  const [notif, setNotif] = useState(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* penyimpanan browser tidak tersedia — keranjang tetap jalan selama halaman terbuka */
    }
  }, [items])

  // Tambah produk ke keranjang; jika kombinasinya sudah ada, jumlahnya ditambah.
  const tambah = (produk, opsi, jumlah) => {
    const kunci = buatKunci(produk.id, opsi)
    const hargaSatuan = produk.harga_dasar + opsi.reduce((t, o) => t + o.biaya_tambahan, 0)

    setItems((lama) => {
      const ada = lama.find((i) => i.kunci === kunci)
      if (ada) {
        return lama.map((i) => (i.kunci === kunci ? { ...i, jumlah: Math.min(99, i.jumlah + jumlah) } : i))
      }
      return [
        ...lama,
        { kunci, produk_id: produk.id, nama: produk.nama, foto_url: produk.foto_url, harga_satuan: hargaSatuan, opsi, jumlah },
      ]
    })
    setNotif({ nama: produk.nama, jumlah, waktu: Date.now() })
  }

  // Ubah jumlah satu item (dibatasi 1–99).
  const ubahJumlah = (kunci, jumlah) =>
    setItems((lama) => lama.map((i) => (i.kunci === kunci ? { ...i, jumlah: Math.max(1, Math.min(99, jumlah)) } : i)))

  // Hapus satu item dari keranjang.
  const hapus = (kunci) => setItems((lama) => lama.filter((i) => i.kunci !== kunci))
  // Kosongkan keranjang (dipakai setelah pesanan berhasil dibuat).
  const kosongkan = () => setItems([])

  /** Ganti harga di keranjang dengan harga terbaru dari server. */
  const perbaruiHarga = (hasilServer) =>
    setItems((lama) =>
      lama.map((i, idx) => {
        const baru = hasilServer[idx]
        return baru ? { ...i, nama: baru.nama_produk, harga_satuan: baru.harga_satuan } : i
      }),
    )

  const nilai = useMemo(() => {
    const totalItem = items.reduce((t, i) => t + i.jumlah, 0)
    const subtotal = items.reduce((t, i) => t + i.harga_satuan * i.jumlah, 0)
    // Format yang dikirim ke API Laravel
    const untukServer = items.map((i) => ({ produk_id: i.produk_id, jumlah: i.jumlah, opsi_ids: i.opsi.map((o) => o.id) }))
    return { items, totalItem, subtotal, untukServer, tambah, ubahJumlah, hapus, kosongkan, perbaruiHarga, notif }
  }, [items, notif])

  return <CartContext.Provider value={nilai}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
