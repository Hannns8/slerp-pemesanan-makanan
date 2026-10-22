import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useInfo } from '../hooks/useInfo'
import { scrollKe } from '../hooks/useSmoothScroll'

const MENU = [
  { label: 'Beranda', to: '/' },
  { label: 'Menu', to: '/#menu' },
  { label: 'Cara Pesan', to: '/#cara-pesan' },
  { label: 'Lacak Pesanan', to: '/lacak' },
  { label: 'Keranjang', to: '/keranjang' },
]

// Jarak dalam (padding) navbar kiri & kanan — dipakai saat menyejajarkan dengan isi hero
const PADDING_KIRI = 14
const PADDING_KANAN = 12

/**
 * Mengukur posisi judul hero ("Mie panas,") dan kartu foto Mie Duarrr,
 * supaya navbar di atas hero sejajar dengan keduanya.
 */
function ukurHero() {
  const judul = document.querySelector('.hero-title')
  if (!judul) return null

  const lebarLayar = document.documentElement.clientWidth
  const kiri = judul.getBoundingClientRect().left
  let kanan = kiri // di ponsel: buat simetris
  let navKiri = kiri - PADDING_KIRI

  // Tombol menu (lingkaran bergaris "=") tepat di atas titik hijau "Buka hari ini":
  // titik tengah tombol disejajarkan dengan titik tengah titik hijau
  const titik = document.querySelector('.dot-live')
  const tombolMenu = document.querySelector('.navbar .burger')
  if (titik && tombolMenu) {
    const r = titik.getBoundingClientRect()
    navKiri = r.left + r.width / 2 - (tombolMenu.offsetLeft + tombolMenu.offsetWidth / 2)
  }

  const visual = document.querySelector('.hero-visual')
  const foto = document.querySelector('.hero-plate')
  if (visual && foto && lebarLayar > 960) {
    // offsetLeft/offsetWidth tidak terpengaruh efek parallax, jadi posisinya stabil
    const tepiKananFoto = visual.getBoundingClientRect().left + foto.offsetLeft + foto.offsetWidth
    kanan = lebarLayar - tepiKananFoto
  }

  return {
    left: Math.max(4, navKiri),
    right: Math.max(16, kanan - PADDING_KANAN),
  }
}

// Navbar mengambang: tombol menu, logo, dan tombol keranjang.
export default function Navbar() {
  const [buka, setBuka] = useState(false)
  const [terscroll, setTerscroll] = useState(false)
  const [tersembunyi, setTersembunyi] = useState(false)
  const [posisiHero, setPosisiHero] = useState(null)
  const scrollTerakhir = useRef(0)
  const { totalItem } = useCart()
  const info = useInfo()
  const location = useLocation()
  const navigate = useNavigate()

  // Scroll ke bawah → navbar bersembunyi; scroll ke atas → muncul lagi (mengambang)
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setTerscroll(y > 80)
      if (Math.abs(y - scrollTerakhir.current) < 6) return
      setTersembunyi(y > scrollTerakhir.current && y > 160)
      scrollTerakhir.current = y
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Ukur ulang posisi hero saat halaman berganti atau ukuran layar berubah
  useEffect(() => {
    if (location.pathname !== '/') {
      setPosisiHero(null)
      return
    }
    const ukur = () => setPosisiHero(ukurHero())
    // Beranda baru muncul setelah animasi pindah halaman, jadi ukur beberapa kali
    const timer = [60, 400, 900].map((ms) => setTimeout(ukur, ms))
    window.addEventListener('resize', ukur)
    return () => {
      timer.forEach(clearTimeout)
      window.removeEventListener('resize', ukur)
    }
  }, [location.pathname])

  // Kunci scroll halaman saat menu layar penuh terbuka
  useEffect(() => {
    document.body.style.overflow = buka ? 'hidden' : ''
  }, [buka])

  // Pindah ke halaman/bagian yang dipilih dari menu layar penuh.
  const pergi = (to) => {
    setBuka(false)
    const hash = to.split('#')[1]
    if (hash && location.pathname === '/') scrollKe('#' + hash)
    else navigate(to)
  }

  // Di atas hero beranda, navbar transparan dengan teks terang
  const terang = location.pathname === '/' && !terscroll && !buka
  // Di atas hero, navbar dipersempit agar sejajar dengan judul & foto; setelah scroll kembali normal
  const gaya = terang && posisiHero ? posisiHero : undefined
  const sembunyi = tersembunyi && !buka

  return (
    <>
      <header
        className={`navbar ${terang ? 'is-light' : 'is-solid'} ${buka ? 'is-open' : ''} ${sembunyi ? 'is-hidden' : ''}`}
        style={gaya}
      >
        <div className="navbar-left">
          <button className="burger" onClick={() => setBuka(!buka)} aria-label={buka ? 'Tutup menu' : 'Buka menu'} aria-expanded={buka}>
            <span /><span />
          </button>
          <Link to="/" className="logo" onClick={() => setBuka(false)}>
            {info?.nama || 'Slerp!'}
          </Link>
        </div>
        <Link to="/keranjang" className="nav-cart" aria-label={`Keranjang, ${totalItem} item`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 8h14l-1.5 11a2 2 0 0 1-2 1.7H8.5a2 2 0 0 1-2-1.7L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" />
          </svg>
          <span className="nav-cart-label">Keranjang</span>
          <motion.span key={totalItem} className="nav-cart-count" initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 15 }}>
            {totalItem}
          </motion.span>
        </Link>
      </header>

      <AnimatePresence>
        {buka && (
          <motion.nav
            className="menu-overlay"
            initial={{ clipPath: 'circle(0% at 40px 40px)' }}
            animate={{ clipPath: 'circle(150% at 40px 40px)' }}
            exit={{ clipPath: 'circle(0% at 40px 40px)' }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          >
            <ul>
              {MENU.map((m, i) => (
                <li key={m.to}>
                  <span className="menu-num">0{i + 1}</span>
                  <motion.button
                    className="menu-link"
                    onClick={() => pergi(m.to)}
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.25 + i * 0.07, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {m.label}
                  </motion.button>
                </li>
              ))}
            </ul>
            <motion.div className="menu-overlay-info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
              <p>{info?.alamat_outlet}</p>
              <p>{info?.jam_buka}</p>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}
