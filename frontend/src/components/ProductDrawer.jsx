import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { ambilDetailProduk } from '../api/toko'
import { useCart } from '../context/CartContext'
import { JENIS_OPSI, rupiah } from '../utils/format'

/**
 * Panel detail produk yang meluncur dari kanan.
 * Pelanggan memilih varian, level pedas, topping, dan jumlah sebelum masuk keranjang.
 */
export default function ProductDrawer({ produkId, onClose }) {
  const [produk, setProduk] = useState(null)
  const [error, setError] = useState('')
  const [varian, setVarian] = useState(null)
  const [pedas, setPedas] = useState(null)
  const [topping, setTopping] = useState([])
  const [jumlah, setJumlah] = useState(1)
  const { tambah } = useCart()

  useEffect(() => {
    if (!produkId) return
    setProduk(null)
    setError('')
    setVarian(null)
    setPedas(null)
    setTopping([])
    setJumlah(1)
    ambilDetailProduk(produkId)
      .then(setProduk)
      .catch(() => setError('Menu tidak dapat dimuat.'))
  }, [produkId])

  // Tutup dengan tombol Escape
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Ambil opsi produk berdasarkan jenisnya (varian / pedas / topping).
  const opsiJenis = (jenis) => produk?.opsi.filter((o) => o.jenis === jenis) || []
  const dipilih = [varian, pedas, ...topping].filter(Boolean)
  const hargaSatuan = produk ? produk.harga_dasar + dipilih.reduce((t, o) => t + o.biaya_tambahan, 0) : 0

  const kurang = []
  if (produk?.varian_wajib && !varian) kurang.push('varian')
  if (produk?.pedas_wajib && !pedas) kurang.push('level pedas')
  const bisaTambah = produk?.aktif && kurang.length === 0

  // Pilih atau batalkan satu topping (boleh lebih dari satu).
  const toggleTopping = (o) =>
    setTopping((t) => (t.some((x) => x.id === o.id) ? t.filter((x) => x.id !== o.id) : [...t, o]))

  // Masukkan produk beserta pilihannya ke keranjang, lalu tutup panel.
  const simpan = () => {
    tambah(produk, dipilih, jumlah)
    onClose()
  }

  // Dipanggil sebagai fungsi biasa (bukan <Komponen>) agar tombol tidak dibuat ulang tiap render
  const grupPilihan = (jenis, nilai, setNilai, wajib) => {
    const daftar = opsiJenis(jenis)
    if (!daftar.length) return null // pilihan hanya muncul jika tersedia untuk produk ini
    const multi = jenis === 'topping'
    return (
      <fieldset className="opt-group">
        <legend>
          {JENIS_OPSI[jenis]} {wajib ? <span className="tag">Wajib</span> : <span className="tag grey">Opsional</span>}
        </legend>
        <div className="opt-list">
          {daftar.map((o) => {
            const aktif = multi ? nilai.some((x) => x.id === o.id) : nilai?.id === o.id
            return (
              <button
                key={o.id}
                type="button"
                className={`opt ${aktif ? 'active' : ''}`}
                aria-pressed={aktif}
                onClick={() => (multi ? toggleTopping(o) : setNilai(aktif && !wajib ? null : o))}
              >
                <span>{o.nama}</span>
                {o.biaya_tambahan > 0 && <small>+{rupiah(o.biaya_tambahan)}</small>}
              </button>
            )
          })}
        </div>
      </fieldset>
    )
  }

  return (
    <AnimatePresence>
      {produkId && (
        <>
          <motion.div className="drawer-backdrop" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside
            className="drawer"
            role="dialog"
            aria-modal="true"
            aria-label={produk?.nama || 'Detail menu'}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            data-lenis-prevent
          >
            <button className="drawer-close" onClick={onClose} aria-label="Tutup">✕</button>

            {error && <p className="alert">{error}</p>}
            {!produk && !error && <div className="drawer-loading">Memuat menu…</div>}

            {produk && (
              <>
                <div className="drawer-media">
                  <motion.img
                    src={produk.foto_url}
                    alt={produk.nama}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <div className="drawer-body">
                  <span className="eyebrow">{produk.kategori?.nama}</span>
                  <h2 className="display drawer-title">{produk.nama}</h2>
                  <p className="drawer-desc">{produk.deskripsi}</p>
                  <p className="drawer-price">Mulai {rupiah(produk.harga_dasar)}</p>

                  {!produk.aktif && <p className="alert">Menu ini sedang tidak tersedia.</p>}

                  {grupPilihan('varian', varian, setVarian, produk.varian_wajib)}
                  {grupPilihan('pedas', pedas, setPedas, produk.pedas_wajib)}
                  {grupPilihan('topping', topping)}
                </div>

                <div className="drawer-footer">
                  <div className="qty" aria-label="Jumlah">
                    <button type="button" onClick={() => setJumlah((j) => Math.max(1, j - 1))} aria-label="Kurangi">−</button>
                    <span>{jumlah}</span>
                    <button type="button" onClick={() => setJumlah((j) => Math.min(99, j + 1))} aria-label="Tambah">+</button>
                  </div>
                  <button className="btn" onClick={simpan} disabled={!bisaTambah}>
                    {bisaTambah ? (
                      <>
                        Tambah · <motion.span key={hargaSatuan * jumlah} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>{rupiah(hargaSatuan * jumlah)}</motion.span>
                      </>
                    ) : produk.aktif ? `Pilih ${kurang.join(' & ')}` : 'Tidak tersedia'}
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
