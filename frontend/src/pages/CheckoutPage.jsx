import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { pesanError } from '../api/client'
import { ambilZona, buatPesanan, hitungKeranjang } from '../api/toko'
import { RevealLines } from '../components/Reveal'
import { useCart } from '../context/CartContext'
import { useInfo } from '../hooks/useInfo'
import { ringkasOpsi, rupiah } from '../utils/format'
import { simpanPesananSaya, tautanLacak } from '../utils/pesananSaya'

/** VIEW: Checkout (Layar 4). */
export default function CheckoutPage() {
  const cart = useCart()
  const info = useInfo()
  const navigate = useNavigate()

  const [form, setForm] = useState({ nama_penerima: '', telepon: '', metode: 'ambil', zona_id: '', alamat: '', catatan: '' })
  const [zona, setZona] = useState([])
  const [ringkasan, setRingkasan] = useState(null) // hasil hitung server
  const [error, setError] = useState('')
  const [info2, setInfo2] = useState('')
  const [mengirim, setMengirim] = useState(false)
  // Kunci unik checkout: mencegah pesanan ganda jika tombol diklik dua kali
  const [checkoutKey] = useState(() => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random()))

  useEffect(() => {
    ambilZona().then(setZona).catch(() => {})
  }, [])

  // Hitung ulang keranjang di server saat halaman dibuka
  useEffect(() => {
    if (!cart.items.length) return
    hitungKeranjang(cart.untukServer)
      .then((hasil) => {
        const berubah = hasil.items.some((it, i) => it.harga_satuan !== cart.items[i]?.harga_satuan)
        if (berubah) {
          cart.perbaruiHarga(hasil.items)
          setInfo2('Ada harga menu yang berubah sejak dimasukkan ke keranjang. Total di bawah sudah memakai harga terbaru.')
        }
        setRingkasan(hasil)
      })
      .catch((e) => setError(pesanError(e) + ' Silakan perbarui keranjang.'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!cart.items.length) {
    return (
      <section className="page">
        <div className="container empty-state card">
          <h2>Keranjang kosong</h2>
          <Link to="/#menu" className="btn">Pilih menu</Link>
        </div>
      </section>
    )
  }

  // Simpan perubahan isi form ke state.
  const ubah = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const zonaDipilih = zona.find((z) => String(z.id) === String(form.zona_id))
  const ongkir = form.metode === 'antar' ? zonaDipilih?.ongkir || 0 : 0
  const subtotal = ringkasan?.subtotal ?? cart.subtotal
  const total = subtotal + ongkir

  // Kirim pesanan ke server, lalu buka halaman pembayaran.
  const kirim = async (e) => {
    e.preventDefault()
    setError('')
    setMengirim(true)
    try {
      const hasil = await buatPesanan({
        ...form,
        checkout_key: checkoutKey,
        zona_id: form.metode === 'antar' ? form.zona_id : null,
        alamat: form.metode === 'antar' ? form.alamat : null,
        items: cart.untukServer,
        total_disetujui: total,
      })
      simpanPesananSaya(hasil.kode, hasil.token, hasil.total)
      cart.kosongkan()
      navigate(tautanLacak(hasil.kode, hasil.token) + '&baru=1')
    } catch (err) {
      // 409 + ringkasan = harga berubah; tampilkan total baru dan minta pelanggan menyetujui lagi
      const data = err.response?.data
      if (err.response?.status === 409 && data?.ringkasan) {
        cart.perbaruiHarga(data.ringkasan.items)
        setRingkasan(data.ringkasan)
      }
      setError(pesanError(err))
      setMengirim(false)
    }
  }

  return (
    <section className="page">
      <div className="container">
        <div className="page-head">
          <span className="eyebrow">Langkah 2 dari 3</span>
          <RevealLines as="h1" animateOnMount className="display" lines={['Checkout']} />
        </div>

        <form className="two-col" onSubmit={kirim}>
          <div className="card form-card">
            <h3 className="form-title">Data penerima</h3>
            <div className="field">
              <label htmlFor="nama">Nama penerima</label>
              <input id="nama" name="nama_penerima" className="input" value={form.nama_penerima} onChange={ubah} required maxLength={100} autoComplete="name" />
            </div>
            <div className="field">
              <label htmlFor="telp">Nomor telepon / WhatsApp</label>
              <input id="telp" name="telepon" className="input" value={form.telepon} onChange={ubah} required placeholder="081234567890" inputMode="tel" autoComplete="tel" />
            </div>

            <h3 className="form-title">Cara menerima</h3>
            <div className="method-toggle" role="radiogroup" aria-label="Metode">
              {[
                ['ambil', '🛍️ Ambil sendiri', 'Gratis ongkir'],
                ['antar', '🛵 Diantar', 'Ongkir sesuai zona'],
              ].map(([val, label, sub]) => (
                <button
                  type="button"
                  key={val}
                  role="radio"
                  aria-checked={form.metode === val}
                  className={`method ${form.metode === val ? 'active' : ''}`}
                  onClick={() => setForm({ ...form, metode: val })}
                >
                  {form.metode === val && <motion.span layoutId="method-bg" className="method-bg" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                  <span className="method-label">{label}</span>
                  <small>{sub}</small>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {form.metode === 'ambil' ? (
                <motion.div key="ambil" className="pickup-box" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <p><b>Lokasi pengambilan:</b><br />{info?.alamat_outlet}</p>
                </motion.div>
              ) : (
                <motion.div key="antar" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                  <div className="field">
                    <label>Zona pengantaran</label>
                    <div className="zone-options">
                      {zona.map((z) => (
                        <label key={z.id} className={`zone-option ${String(form.zona_id) === String(z.id) ? 'active' : ''}`}>
                          <input type="radio" name="zona_id" value={z.id} checked={String(form.zona_id) === String(z.id)} onChange={ubah} required />
                          <span><b>{z.nama}</b><small>{z.cakupan}</small></span>
                          <strong>{rupiah(z.ongkir)}</strong>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="alamat">Alamat lengkap & patokan</label>
                    <textarea id="alamat" name="alamat" className="input" value={form.alamat} onChange={ubah} required maxLength={500} placeholder="Jl. Mawar No. 5, RT 02/RW 03. Patokan: depan masjid hijau" />
                    <span className="hint">Alamat di luar zona akan dikonfirmasi admin.</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="field">
              <label htmlFor="catatan">Catatan (opsional)</label>
              <textarea id="catatan" name="catatan" className="input" value={form.catatan} onChange={ubah} maxLength={500} placeholder="Contoh: es teh kurang manis" />
            </div>
          </div>

          <aside className="summary card">
            <h3>Ringkasan pesanan</h3>
            <ul className="sum-items">
              {(ringkasan?.items || cart.items).map((it, i) => (
                <li key={i}>
                  <span>
                    {it.jumlah}× {it.nama_produk || it.nama}
                    {it.opsi?.length > 0 && <small>{ringkasOpsi(it.opsi)}</small>}
                  </span>
                  <b>{rupiah(it.subtotal ?? it.harga_satuan * it.jumlah)}</b>
                </li>
              ))}
            </ul>
            <div className="sum-row"><span>Subtotal</span><b>{rupiah(subtotal)}</b></div>
            <div className="sum-row"><span>Ongkir</span><b>{form.metode === 'antar' && !zonaDipilih ? '—' : rupiah(ongkir)}</b></div>
            <div className="sum-row total"><span>Total</span><motion.b key={total} initial={{ scale: 1.2, color: '#e8462b' }} animate={{ scale: 1, color: '#14352a' }}>{rupiah(total)}</motion.b></div>

            {info2 && <p className="alert info">{info2}</p>}
            {error && <p className="alert" role="alert">{error}</p>}

            <button className="btn btn-block" type="submit" disabled={mengirim || !ringkasan}>
              {mengirim ? 'Membuat pesanan…' : <>Buat pesanan · {rupiah(total)}</>}
            </button>
            <p className="hint center">Setelah pesanan dibuat, kamu punya 30 menit untuk mengunggah bukti transfer.</p>
          </aside>
        </form>
      </div>
    </section>
  )
}
