import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

/** Notifikasi kecil di bawah layar setelah menu masuk keranjang. */
export default function CartToast() {
  const { notif } = useCart()
  const [tampil, setTampil] = useState(null)

  useEffect(() => {
    if (!notif) return
    setTampil(notif)
    const t = setTimeout(() => setTampil(null), 3200)
    return () => clearTimeout(t)
  }, [notif])

  return (
    <AnimatePresence>
      {tampil && (
        <motion.div
          key={tampil.waktu}
          className="cart-toast"
          initial={{ y: 80, opacity: 0, x: '-50%' }}
          animate={{ y: 0, opacity: 1, x: '-50%' }}
          exit={{ y: 80, opacity: 0, x: '-50%' }}
          transition={{ type: 'spring', damping: 22, stiffness: 260 }}
          role="status"
        >
          <span className="cart-toast-dot">{tampil.jumlah}×</span>
          <span><b>{tampil.nama}</b> masuk keranjang</span>
          <Link to="/keranjang" className="link-underline">Lihat</Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
