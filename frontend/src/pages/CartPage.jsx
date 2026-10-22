import { AnimatePresence, motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { RevealLines } from '../components/Reveal'
import { useCart } from '../context/CartContext'
import { ringkasOpsi, rupiah } from '../utils/format'

/** VIEW: Keranjang belanja (Layar 3). */
export default function CartPage() {
  const { items, subtotal, ubahJumlah, hapus } = useCart()
  const navigate = useNavigate()

  return (
    <section className="page">
      <div className="container">
        <div className="page-head">
          <span className="eyebrow">Langkah 1 dari 3</span>
          <RevealLines as="h1" animateOnMount className="display" lines={['Keranjang', <span className="serif-i">kamu</span>]} />
        </div>

        {items.length === 0 ? (
          <div className="empty-state card">
            <img src="/images/menu/mie-ayam.jpg" alt="" />
            <h2>Keranjang masih kosong</h2>
            <p>Mangkuknya menunggu diisi. Yuk pilih menu dulu.</p>
            <Link to="/#menu" className="btn">Lihat menu <span className="arrow">→</span></Link>
          </div>
        ) : (
          <div className="two-col">
            <div className="cart-list">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.div
                    key={item.kunci}
                    layout
                    className="cart-item card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -80, transition: { duration: 0.3 } }}
                  >
                    <div className="cart-thumb"><img src={item.foto_url} alt="" /></div>
                    <div className="cart-info">
                      <h3>{item.nama}</h3>
                      {item.opsi.length > 0 && <p className="cart-opsi">{ringkasOpsi(item.opsi)}</p>}
                      <p className="cart-unit">{rupiah(item.harga_satuan)} / porsi</p>
                      <div className="cart-actions">
                        <div className="qty small">
                          <button onClick={() => ubahJumlah(item.kunci, item.jumlah - 1)} aria-label="Kurangi">−</button>
                          <span>{item.jumlah}</span>
                          <button onClick={() => ubahJumlah(item.kunci, item.jumlah + 1)} aria-label="Tambah">+</button>
                        </div>
                        <button className="text-btn" onClick={() => hapus(item.kunci)}>Hapus</button>
                      </div>
                    </div>
                    <strong className="cart-line">{rupiah(item.harga_satuan * item.jumlah)}</strong>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <aside className="summary card">
              <h3>Ringkasan</h3>
              <div className="sum-row"><span>Subtotal</span><b>{rupiah(subtotal)}</b></div>
              <p className="hint">Belum termasuk ongkir. Harga akan diperiksa ulang saat checkout.</p>
              <button className="btn btn-block" onClick={() => navigate('/checkout')} disabled={!items.length}>
                Checkout <span className="arrow">→</span>
              </button>
              <Link to="/#menu" className="btn btn-ghost btn-block">Lanjut belanja</Link>
            </aside>
          </div>
        )}
      </div>
    </section>
  )
}
