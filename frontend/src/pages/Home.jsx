import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ambilKategori, ambilProduk, ambilZona } from '../api/toko'
import { Marquee, RotatingBadge, Wave } from '../components/Decor'
import ProductDrawer from '../components/ProductDrawer'
import { useCart } from '../context/CartContext'
import Reveal, { RevealLines } from '../components/Reveal'
import { useInfo } from '../hooks/useInfo'
import { useStatusBuka } from '../hooks/useStatusBuka'
import { scrollKe } from '../hooks/useSmoothScroll'
import { rupiah } from '../utils/format'

/** VIEW: halaman beranda satu halaman penuh (one-page). */
export default function Home() {
  const location = useLocation()
  const [produkDibuka, setProdukDibuka] = useState(null)

  // Jika datang dari link "/#menu", scroll ke bagian tersebut
  useEffect(() => {
    if (location.hash) setTimeout(() => scrollKe(location.hash), 350)
  }, [location.hash])

  return (
    <>
      <Hero />
      <Marquee className="marquee-mustard" items={['Mie Ayam', 'Mie Goreng', 'Mie Duarrr', 'Es Teler', 'Es Thai Tea', 'Siomay', 'Gyoza']} />
      <Story />
      <Steps />
      <Catalog onPilih={setProdukDibuka} />
      <Fulfilment />
      <ProductDrawer produkId={produkDibuka} onClose={() => setProdukDibuka(null)} />
    </>
  )
}

/* ------------------------------------------------------------------ */
/* HERO                                                                */
/* ------------------------------------------------------------------ */
function Hero() {
  const info = useInfo()
  const buka = useStatusBuka(info) // true = buka, false = tutup, null = masih memuat
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })

  // Efek parallax: gambar bergerak lebih lambat dari scroll
  const yMangkuk = useTransform(scrollYProgress, [0, 1], [0, 180])
  const yGelas = useTransform(scrollYProgress, [0, 1], [0, 320])
  const rotasi = useTransform(scrollYProgress, [0, 1], [-4, 6])
  const skala = useTransform(scrollYProgress, [0, 1], [1, 0.94])

  // Gambar sedikit mengikuti gerakan mouse
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 60, damping: 18 })
  const sy = useSpring(my, { stiffness: 60, damping: 18 })
  // Hitung posisi mouse di dalam hero untuk menggeser gambar.
  const onMouseMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 30)
    my.set(((e.clientY - r.top) / r.height - 0.5) * 30)
  }

  return (
    <section className="hero" ref={ref} id="beranda">
      <motion.div className="hero-card" style={{ scale: skala }} onMouseMove={onMouseMove}>
        <div className="hero-noise" aria-hidden="true" />
        <div className="hero-glow" aria-hidden="true" />

        <div className="hero-content">
          <motion.p className="hero-kicker" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}>
            {/* Titik hijau + "Buka" pada jam kerja; titik merah + "Tutup" di luar jam kerja */}
            <span className={`dot-live ${buka === false ? 'is-tutup' : ''} ${buka === null ? 'is-memuat' : ''}`} />
            <span>
              {buka !== null && <><b>{buka ? 'Buka' : 'Tutup'}</b> - </>}
              setiap hari {info?.jam_mulai ?? '10:00'} - {info?.jam_tutup ?? '21:00'}
            </span>
          </motion.p>

          <RevealLines
            as="h1"
            animateOnMount
            delay={0.3}
            className="display hero-title"
            lines={[
              <span className="outline-cream">Mie kenyal,</span>,
              <span className="outline-cream">bumbu meresap,</span>,
              <>pedasnya nagih.</>,
            ]}
          />

          <motion.p className="hero-sub" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.8 }}>
            Mie dimasak dadakan begitu kamu pesan, jadi masih panas mengepul saat sampai.
            Atur level pedas dari 0 sampai 6, temani dengan dimsum kukus dan es teler segar,
            lalu <b>ambil sendiri</b> atau <b>kami antar</b> ke rumah.
          </motion.p>

          <motion.div className="hero-cta" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05, duration: 0.8 }}>
            <button className="btn" onClick={() => scrollKe('#menu')}>
              Pilih menumu <span className="arrow">→</span>
            </button>
            <Link to="/lacak" className="link-underline hero-link">Lacak pesanan</Link>
          </motion.div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <motion.div className="hero-plate" style={{ y: yMangkuk, x: sx, rotate: rotasi }}>
            <motion.div
              className="photo-card"
              initial={{ y: 160, rotate: -14, opacity: 0 }}
              animate={{ y: 0, rotate: 0, opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <img src="/images/menu/mie-duarrr.jpg" alt="" />
              <span className="photo-tag">🌶 Mie Duarrr</span>
            </motion.div>
          </motion.div>
          <motion.div className="hero-glass" style={{ y: yGelas, x: sy }}>
            <motion.div
              className="photo-card small"
              initial={{ y: 200, opacity: 0, rotate: 20 }}
              animate={{ y: 0, opacity: 1, rotate: 8 }}
              transition={{ duration: 1.4, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <img src="/images/menu/es-thai-tea.jpg" alt="" />
            </motion.div>
          </motion.div>
        </div>

        <RotatingBadge className="hero-badge" text="PESAN • AMBIL • ANTAR • ">
          <button onClick={() => scrollKe('#menu')} aria-label="Ke menu">↓</button>
        </RotatingBadge>
      </motion.div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* CERITA                                                              */
/* ------------------------------------------------------------------ */
function Story() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const x1 = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])

  return (
    <section className="story" ref={ref} id="cerita">
      <div className="container story-inner">
        <Reveal><span className="eyebrow both">Cerita kami</span></Reveal>
        <motion.div style={{ x: x1 }}>
          <RevealLines className="display story-title" lines={[<span className="outline-chili">Berawal dari</span>]} />
        </motion.div>
        <RevealLines className="display story-title-2" lines={[<span className="serif-i">dapur kecil</span>]} delay={0.15} />

        {/* Teks cerita contoh — silakan sesuaikan dengan kisah asli usaha */}
        <div className="story-text">
          <Reveal as="p" delay={0.1}>
            Slerp lahir dari satu wajan dan satu panci kaldu. Awalnya kami hanya memasak mie untuk
            teman kos dan tetangga sekitar. Rasanya cocok, kabarnya menyebar, dan pesanan mulai datang
            lewat chat hampir setiap malam.
          </Reveal>
          <Reveal as="p" delay={0.2}>
            Makin ramai, makin repot. Pesanan level 3 tercatat level 1, ongkir salah hitung, bukti
            transfer tenggelam di antara ratusan pesan, dan pembeli terus bertanya,
            <em> “pesananku sudah dibuat belum?”</em>
          </Reveal>
          <Reveal as="p" delay={0.3}>
            Dari situ kami membuka Slerp: kedai dengan menu dan harga yang jelas sejak awal, level pedas
            yang tercatat rapi, mie yang <em>dimasak saat kamu memesan</em>, dan status pesanan yang bisa
            kamu pantau sendiri tanpa perlu bertanya.
          </Reveal>
          <Reveal as="p" delay={0.4} className="story-sign">
            Namanya diambil dari bunyi seruputan mie panas. <b>Slerp</b> — tanda paling jujur bahwa
            makanannya enak.
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* CARA PESAN (carousel)                                               */
/* ------------------------------------------------------------------ */
const LANGKAH = [
  { judul: 'Pilih menu', isi: 'Buka katalog, cari mie atau minuman favoritmu, lalu pilih level pedasnya.', img: 'mie-ayam.jpg' },
  { judul: 'Isi data', isi: 'Masukkan nama dan nomor telepon. Pilih ambil sendiri (gratis ongkir) atau diantar sesuai zona.', img: 'es-teler.jpg' },
  { judul: 'Transfer', isi: 'Transfer ke rekening kami lalu unggah bukti dalam 30 menit. Admin akan memeriksa dana yang masuk.', img: 'siomay.jpg' },
  { judul: 'Pantau', isi: 'Lacak status pesanan lewat tautan privatmu: diproses, siap diambil atau dikirim, hingga selesai.', img: 'mie-goreng.jpg' },
]

const JUMLAH = LANGKAH.length

/** Posisi kartu di tumpukan: 0 = paling depan, makin besar makin ke belakang (mengintip ke kanan atas). */
const slot = (d) => ({ x: d * 22, y: d * -26, rotate: d * 4 - 2, scale: 1 - d * 0.06, filter: `brightness(${1 - d * 0.12})` })

// Bagian 'Cara pesan': tumpukan 4 kartu yang berganti otomatis dan bisa digeser.
function Steps() {
  // i = kartu paling depan, sebelumnya = kartu depan sebelumnya, arah = 1 (maju) / -1 (mundur)
  const [posisi, setPosisi] = useState({ i: 0, sebelumnya: null, arah: 1 })
  const [digeser, setDigeser] = useState(false)
  const { i, sebelumnya, arah } = posisi

  // Ganti kartu depan: d = 1 maju, d = -1 mundur (berputar 1 → 4 → 1).
  const geser = (d) => setPosisi((p) => ({ i: (p.i + d + JUMLAH) % JUMLAH, sebelumnya: p.i, arah: d }))

  // Ganti otomatis setiap 6 detik (berhenti sementara saat kartu sedang digeser)
  useEffect(() => {
    if (digeser) return
    const t = setTimeout(() => geser(1), 6000)
    return () => clearTimeout(t)
  }, [i, digeser])

  /** Kartu depan digeser: ke kiri = langkah berikutnya, ke kanan = langkah sebelumnya. */
  const selesaiGeser = (_, info) => {
    setDigeser(false)
    if (info.offset.x < -80 || info.velocity.x < -500) geser(1)
    else if (info.offset.x > 80 || info.velocity.x > 500) geser(-1)
  }

  /** Animasi tiap kartu sesuai posisinya di tumpukan. */
  const animasiKartu = (k) => {
    const d = (k - i + JUMLAH) % JUMLAH
    const tujuan = { ...slot(d), zIndex: JUMLAH - d }

    // Kartu depan yang ditinggalkan: terbang ke kiri, lalu masuk ke belakang tumpukan
    if (arah === 1 && k === sebelumnya) {
      return {
        x: [null, -360, tujuan.x], y: [null, 40, tujuan.y], rotate: [null, -16, tujuan.rotate],
        scale: [null, 0.95, tujuan.scale], filter: tujuan.filter, zIndex: [JUMLAH + 1, JUMLAH + 1, tujuan.zIndex],
        transition: { duration: 0.9, times: [0, 0.45, 1], ease: [0.22, 1, 0.36, 1] },
      }
    }
    // Mundur: kartu paling belakang keluar ke kanan, lalu mendarat di depan
    if (arah === -1 && k === i && sebelumnya !== null) {
      return {
        x: [null, 360, tujuan.x], y: [null, 40, tujuan.y], rotate: [null, 16, tujuan.rotate],
        scale: [null, 0.95, tujuan.scale], filter: tujuan.filter, zIndex: [0, JUMLAH + 1, JUMLAH + 1],
        transition: { duration: 0.9, times: [0, 0.45, 1], ease: [0.22, 1, 0.36, 1] },
      }
    }
    return { ...tujuan, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
  }

  const s = LANGKAH[i]

  return (
    <section className="steps" id="cara-pesan">
      <Wave color="var(--green)" />
      <div className="steps-body">
        <div className="container steps-grid">
          <div className="steps-text">
            <Reveal><span className="eyebrow">Cara pesan</span></Reveal>
            <RevealLines className="display steps-title" lines={['Empat langkah', <span className="serif-i">slerp</span>]} />

            <div className="steps-slide">
              <AnimatePresence mode="wait" custom={arah}>
                <motion.div
                  key={i}
                  custom={arah}
                  initial={{ opacity: 0, x: arah * 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: arah * -40 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h3>{s.judul}</h3>
                  <p>{s.isi}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="steps-nav">
              <button className="round-btn" onClick={() => geser(-1)} aria-label="Sebelumnya">←</button>
              <button className="round-btn" onClick={() => geser(1)} aria-label="Berikutnya">→</button>
              <span className="steps-count">0{i + 1} / 0{JUMLAH}</span>
            </div>
          </div>

          <div className="steps-visual">
            {/* Tumpukan 4 kartu; hanya kartu paling depan yang bisa digeser */}
            <div className="steps-stack">
              {LANGKAH.map((langkah, k) => {
                const depan = k === i
                return (
                  <motion.div
                    key={langkah.judul}
                    className={`steps-card ${depan ? 'is-front' : ''}`}
                    initial={{ ...slot((k - i + JUMLAH) % JUMLAH), zIndex: JUMLAH - ((k - i + JUMLAH) % JUMLAH) }}
                    animate={animasiKartu(k)}
                    drag={depan ? 'x' : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.8}
                    onDragStart={() => setDigeser(true)}
                    onDragEnd={selesaiGeser}
                    aria-hidden={!depan}
                  >
                    <span className="steps-num">0{k + 1}</span>
                    <img src={`/images/menu/${langkah.img}`} alt="" draggable="false" />
                    <span className="steps-card-label">{langkah.judul}</span>
                  </motion.div>
                )
              })}
            </div>
            <p className="steps-hint">← Geser kartu →</p>
          </div>
        </div>
      </div>
      {/* Bawah section bergelombang dengan lengkungan yang sama persis seperti bagian atas:
          garis gelombang yang sama, hijau di atas garis dan krem di bawahnya */}
      <Wave color="var(--cream)" bg="var(--green)" />
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* KATALOG MENU                                                        */
/* ------------------------------------------------------------------ */
function Catalog({ onPilih }) {
  const [kategori, setKategori] = useState([])
  const [produk, setProduk] = useState([])
  const [aktif, setAktif] = useState('')
  const [cari, setCari] = useState('')
  const [memuat, setMemuat] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    ambilKategori().then(setKategori).catch(() => {})
  }, [])

  // Muat ulang produk saat kategori/pencarian berubah (pencarian ditunda 300 ms)
  useEffect(() => {
    setMemuat(true)
    const t = setTimeout(() => {
      ambilProduk({ kategori_id: aktif || undefined, cari: cari || undefined })
        .then((data) => {
          setProduk(data)
          setError('')
        })
        .catch(() => setError('Menu belum bisa dimuat. Pastikan server Laravel berjalan.'))
        .finally(() => setMemuat(false))
    }, 300)
    return () => clearTimeout(t)
  }, [aktif, cari])

  // Kelompokkan produk per kategori
  const grup = useMemo(() => {
    const map = new Map()
    produk.forEach((p) => {
      const nama = p.kategori?.nama || 'Lainnya'
      if (!map.has(nama)) map.set(nama, [])
      map.get(nama).push(p)
    })
    return [...map.entries()]
  }, [produk])

  return (
    <section className="catalog" id="menu">
      <div className="container">
        <div className="catalog-head">
          <div>
            <Reveal><span className="eyebrow">Menu</span></Reveal>
            <RevealLines className="display catalog-title" lines={[<span className="serif-i">Yang paling</span>, 'Dicari']} />
          </div>
          <Reveal className="catalog-blurb" delay={0.2}>
            Dimasak saat dipesan. Pilih level pedas dari 0 sampai 6 (level 3 ke atas tambah Rp1.000), lengkapi dengan dimsum
            dan es segar — harga langsung terhitung sebelum masuk keranjang.
          </Reveal>
        </div>

        <Reveal className="catalog-tools" delay={0.1}>
          <div className="pills" role="tablist" aria-label="Kategori">
            <button className={`pill ${aktif === '' ? 'active' : ''}`} onClick={() => setAktif('')}>Semua</button>
            {kategori.map((k) => (
              <button key={k.id} className={`pill ${aktif === k.id ? 'active' : ''}`} onClick={() => setAktif(k.id)}>
                {k.nama}
              </button>
            ))}
          </div>
          <label className="search">
            <span className="sr-only">Cari menu</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari mie, es teh…" />
          </label>
        </Reveal>

        {error && <p className="alert">{error}</p>}
        {!memuat && !error && produk.length === 0 && <p className="catalog-empty">Menu “{cari}” tidak ditemukan.</p>}

        <div className={`catalog-groups ${memuat ? 'is-loading' : ''}`}>
          {grup.map(([nama, daftar]) => (
            <div key={nama} className="catalog-group">
              <Reveal className="group-head">
                <h3 className="display outline-green">{nama}</h3>
                <span>{String(daftar.length).padStart(2, '0')}</span>
              </Reveal>
              <div className="menu-grid">
                {daftar.map((p, idx) => (
                  <MenuItem key={p.id} produk={p} delay={(idx % 2) * 0.08} onPilih={onPilih} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Satu baris menu di katalog: foto, nama, deskripsi, harga, dan jumlah di keranjang.
function MenuItem({ produk, delay, onPilih }) {
  const tersedia = produk.aktif
  const { items } = useCart()
  // Total porsi produk ini di keranjang (semua kombinasi level pedas dijumlahkan)
  const diKeranjang = items.filter((i) => i.produk_id === produk.id).reduce((t, i) => t + i.jumlah, 0)

  return (
    <Reveal delay={delay}>
      <button
        className={`menu-item ${tersedia ? '' : 'is-off'}`}
        onClick={() => onPilih(produk.id)}
        aria-label={`${produk.nama}, ${rupiah(produk.harga_dasar)}${tersedia ? '' : ', tidak tersedia'}${diKeranjang ? `, ${diKeranjang} di keranjang` : ''}`}
      >
        <div className="menu-thumb">
          <img src={produk.foto_url} alt="" loading="lazy" />
        </div>
        <div className="menu-info">
          <div className="menu-name-row">
            <h4>{produk.nama}</h4>
            {!tersedia && <span className="tag grey">Habis</span>}
            {tersedia && produk.pedas_wajib && <span className="tag">🌶 Pilih level</span>}
          </div>
          <p>{produk.deskripsi}</p>
          <div className="menu-price-row">
            <span className="menu-price">{rupiah(produk.harga_dasar)}</span>
            {/* Penanda hanya muncul jika produk ini sudah ada di keranjang */}
            <AnimatePresence>
              {diKeranjang > 0 && (
                <motion.span
                  className="menu-qty"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                >
                  {/* key berganti setiap jumlah berubah → angka "melompat" kecil */}
                  <motion.span key={diKeranjang} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                    ×{diKeranjang}
                  </motion.span>
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </button>
    </Reveal>
  )
}

/* ------------------------------------------------------------------ */
/* AMBIL ATAU ANTAR                                                    */
/* ------------------------------------------------------------------ */
function Fulfilment() {
  const [zona, setZona] = useState([])
  const info = useInfo()

  useEffect(() => {
    ambilZona().then(setZona).catch(() => {})
  }, [])

  return (
    <section className="fulfil">
      <div className="container">
        <div className="fulfil-head">
          <Reveal><span className="eyebrow both">Ambil atau antar</span></Reveal>
          <RevealLines className="display fulfil-title" lines={[<span className="outline-green">Kamu yang</span>, <>pilih <span className="serif-i">caranya</span></>]} />
        </div>

        <div className="fulfil-grid">
          <Reveal className="fulfil-card pickup">
            <span className="fulfil-icon" aria-hidden="true">
              {/* Ikon tas belanja (garis) */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z" />
                <path d="M9 10V6.5a3 3 0 0 1 6 0V10" />
              </svg>
            </span>
            <h3>Ambil sendiri</h3>
            <p>Datang ke outlet saat status berubah menjadi <b>siap diambil</b>.</p>
            <p className="fulfil-addr">{info?.alamat_outlet}</p>
            <span className="fulfil-price">Ongkir Rp0</span>
          </Reveal>

          <Reveal className="fulfil-card delivery" delay={0.15}>
            <span className="fulfil-icon" aria-hidden="true">
              {/* Ikon motor pengantar (garis) */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="5.5" cy="17" r="2.5" />
                <circle cx="18.5" cy="17" r="2.5" />
                <path d="M8 17h7.5l2.5-6h-4l-2 4" />
                <path d="M15 7h2.5l1.5 4" />
                <path d="M3 11h6l1.5 2.5" />
              </svg>
            </span>
            <h3>Diantar</h3>
            <p>Diantar kurir internal kami. Tarif tetap per pesanan sesuai zona.</p>
            <ul className="zone-list">
              {zona.map((z) => (
                <li key={z.id}>
                  <div>
                    <b>{z.nama}</b>
                    <small>{z.cakupan}</small>
                  </div>
                  <span>{rupiah(z.ongkir)}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
