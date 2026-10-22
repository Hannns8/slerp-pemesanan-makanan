import { motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { pesanError } from '../api/client'
import { ambilPesanan, unggahBukti, urlBukti } from '../api/toko'
import Reveal from '../components/Reveal'
import { jalurStatus, ringkasOpsi, rupiah, STATUS_BAYAR, STATUS_PESANAN, tanggalJam } from '../utils/format'

/** VIEW: Pembayaran (Layar 5) + Status pesanan (Layar 6). */
export default function OrderPage() {
  const { kode } = useParams()
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const baru = params.get('baru') === '1'

  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  // Ambil data pesanan terbaru dari server.
  const muat = useCallback(() => {
    ambilPesanan(kode, token)
      .then((d) => {
        setData(d)
        setError('')
      })
      .catch((e) => setError(pesanError(e)))
  }, [kode, token])

  // Muat data, lalu perbarui otomatis setiap 20 detik
  useEffect(() => {
    muat()
    const t = setInterval(muat, 20000)
    return () => clearInterval(t)
  }, [muat])

  if (error && !data) {
    return (
      <section className="page">
        <div className="container narrow empty-state card">
          <h2>Pesanan tidak ditemukan</h2>
          <p>{error}</p>
          <Link to="/lacak" className="btn">Coba lacak lagi</Link>
        </div>
      </section>
    )
  }

  if (!data) return <section className="page"><div className="container center muted">Memuat pesanan…</div></section>

  const p = data.pesanan
  const batal = p.status === 'dibatalkan'
  const jalur = jalurStatus(p.metode)
  const posisi = jalur.indexOf(p.status)
  const terakhirDitolak = [...p.pembayaran].reverse().find((b) => b.status === 'ditolak')

  return (
    <section className="page">
      <div className="container">
        {baru && (
          <motion.div className="success-banner" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="success-icon">✓</span>
            <div>
              <b>Pesanan berhasil dibuat!</b>
              <p>Simpan tautan halaman ini — tautan ini adalah kunci untuk melacak pesananmu.</p>
            </div>
            <CopyButton text={window.location.href.replace('&baru=1', '')} label="Salin tautan" />
          </motion.div>
        )}

        <div className="order-head">
          <div>
            <span className="eyebrow">Pesanan · {tanggalJam(p.dibuat_pada)}</span>
            <h1 className="display order-code">{p.kode}</h1>
          </div>
          <div className="status-pair">
            <div className={`status-chip bayar-${p.status_pembayaran}`}>
              <small>Pembayaran</small>
              <b>{STATUS_BAYAR[p.status_pembayaran]}</b>
            </div>
            <div className={`status-chip pesanan-${p.status}`}>
              <small>Pesanan</small>
              <b>{STATUS_PESANAN[p.status]}</b>
            </div>
          </div>
        </div>

        {batal ? (
          <div className="alert" role="status"><b>Pesanan dibatalkan.</b> {p.alasan_batal}</div>
        ) : (
          <Reveal className="track card">
            {jalur.map((s, i) => (
              <div key={s} className={`track-step ${i <= posisi ? 'done' : ''} ${i === posisi ? 'current' : ''}`}>
                <div className="track-dot">{i < posisi ? '✓' : i + 1}</div>
                <span>{STATUS_PESANAN[s]}</span>
                {i < jalur.length - 1 && (
                  <div className="track-line">
                    <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: i < posisi ? 1 : 0 }} transition={{ duration: 0.8, delay: 0.3 + i * 0.15 }} />
                  </div>
                )}
              </div>
            ))}
          </Reveal>
        )}

        <div className="two-col">
          <div>
            {p.status === 'menunggu_pembayaran' && (
              <PaymentPanel data={data} kode={kode} token={token} ditolak={terakhirDitolak} onSelesai={muat} />
            )}

            {p.pembayaran.length > 0 && (
              <div className="card block">
                <h3>Riwayat pembayaran</h3>
                <ul className="pay-list">
                  {p.pembayaran.map((b, i) => (
                    <li key={b.id}>
                      <div>
                        <b>Percobaan {i + 1}</b> · {rupiah(b.nominal)} · {b.referensi}
                        <small>{tanggalJam(b.diunggah_pada)}{b.catatan ? ` — ${b.catatan}` : ''}</small>
                        {b.refund_status !== 'tidak_ada' && (
                          <small>Refund: {b.refund_status === 'perlu' ? 'sedang diproses admin' : `selesai — ${b.refund_catatan}`}</small>
                        )}
                      </div>
                      <div className="pay-right">
                        <span className={`tag ${b.status === 'diterima' ? 'green' : b.status === 'ditolak' ? '' : 'mustard'}`}>{STATUS_BAYAR[b.status]}</span>
                        <a href={urlBukti(kode, b.id, token)} target="_blank" rel="noreferrer" className="link-underline">Bukti</a>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="card block">
              <h3>Riwayat status</h3>
              <ol className="timeline">
                {[...p.riwayat].reverse().map((r) => (
                  <li key={r.id}>
                    <time>{tanggalJam(r.dibuat_pada)}</time>
                    <b>{STATUS_PESANAN[r.status] || r.status}</b>
                    {r.catatan && <p>{r.catatan}</p>}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <aside className="summary card">
            <h3>Rincian</h3>
            <ul className="sum-items">
              {p.item.map((it) => (
                <li key={it.id}>
                  <span>
                    {it.jumlah}× {it.nama_produk}
                    {it.opsi.length > 0 && <small>{ringkasOpsi(it.opsi)}</small>}
                  </span>
                  <b>{rupiah(it.subtotal)}</b>
                </li>
              ))}
            </ul>
            <div className="sum-row"><span>Subtotal</span><b>{rupiah(p.subtotal)}</b></div>
            <div className="sum-row"><span>Ongkir {p.nama_zona ? `(${p.nama_zona})` : ''}</span><b>{rupiah(p.ongkir)}</b></div>
            <div className="sum-row total"><span>Total</span><b>{rupiah(p.total)}</b></div>
            <hr />
            <dl className="meta">
              <dt>Penerima</dt><dd>{p.nama_penerima} · {p.telepon}</dd>
              <dt>Metode</dt><dd>{p.metode === 'ambil' ? 'Ambil sendiri' : 'Diantar'}</dd>
              <dt>{p.metode === 'ambil' ? 'Lokasi ambil' : 'Alamat'}</dt><dd>{p.metode === 'ambil' ? data.alamat_outlet : p.alamat}</dd>
              {p.catatan && (<><dt>Catatan</dt><dd>{p.catatan}</dd></>)}
            </dl>
          </aside>
        </div>
      </div>
    </section>
  )
}

/** Panel instruksi transfer + form unggah bukti. */
function PaymentPanel({ data, kode, token, ditolak, onSelesai }) {
  const p = data.pesanan
  const [berkas, setBerkas] = useState(null)
  const [referensi, setReferensi] = useState('')
  const [nominal, setNominal] = useState(p.total)
  const [error, setError] = useState('')
  const [mengirim, setMengirim] = useState(false)
  const sisa = useCountdown(p.batas_bayar)
  const belumAdaBukti = p.pembayaran.length === 0

  // Periksa berkas bukti (jenis & ukuran) sebelum dikirim.
  const pilihBerkas = (file) => {
    setError('')
    if (!file) return
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) return setError('Format harus JPG, PNG, atau PDF.')
    if (file.size > 5 * 1024 * 1024) return setError('Ukuran berkas maksimal 5 MB.')
    setBerkas(file)
  }

  // Kirim bukti transfer ke server, lalu muat ulang data pesanan.
  const kirim = async (e) => {
    e.preventDefault()
    if (!berkas) return setError('Pilih berkas bukti transfer.')
    setMengirim(true)
    setError('')
    const fd = new FormData()
    fd.append('token', token)
    fd.append('bukti', berkas)
    fd.append('referensi', referensi)
    fd.append('nominal', nominal)
    try {
      await unggahBukti(kode, fd)
      setBerkas(null)
      setReferensi('')
      onSelesai()
    } catch (err) {
      setError(pesanError(err))
    } finally {
      setMengirim(false)
    }
  }

  return (
    <div className="card block pay-panel">
      <h3>Pembayaran</h3>
      <div className="bank-box">
        <div>
          <small>Transfer ke {data.rekening.nama}</small>
          <b className="bank-no">{data.rekening.nomor}</b>
          <small>a.n. {data.rekening.atas_nama}</small>
        </div>
        <CopyButton text={data.rekening.nomor.replace(/\s/g, '')} label="Salin" />
      </div>
      <div className="sum-row total"><span>Tagihan</span><b>{rupiah(p.total)}</b></div>

      {belumAdaBukti && (
        <p className={`alert ${sisa.habis ? '' : 'info'}`}>
          {sisa.habis
            ? 'Batas waktu unggah bukti sudah lewat. Pesanan akan dibatalkan otomatis.'
            : <>Unggah bukti sebelum <b>{tanggalJam(p.batas_bayar)}</b> — sisa <b>{sisa.teks}</b>.</>}
        </p>
      )}
      {ditolak && data.bisa_unggah_bukti && (
        <p className="alert"><b>Bukti sebelumnya ditolak:</b> {ditolak.catatan}. Silakan unggah bukti baru.</p>
      )}
      {!data.bisa_unggah_bukti && p.status_pembayaran === 'menunggu' && (
        <p className="alert ok">Bukti sudah diterima dan sedang diperiksa admin. Halaman ini diperbarui otomatis.</p>
      )}

      {data.bisa_unggah_bukti && !(belumAdaBukti && sisa.habis) && (
        <form onSubmit={kirim}>
          <label
            className={`dropzone ${berkas ? 'has-file' : ''}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              pilihBerkas(e.dataTransfer.files[0])
            }}
          >
            <input type="file" accept="image/jpeg,image/png,application/pdf" onChange={(e) => pilihBerkas(e.target.files[0])} />
            <span className="dz-icon">{berkas ? '📎' : '⬆'}</span>
            <span>{berkas ? berkas.name : 'Klik atau seret bukti transfer ke sini'}</span>
            <small>JPG, PNG, atau PDF · maks. 5 MB</small>
          </label>
          <div className="field-row">
            <div className="field">
              <label htmlFor="ref">Nama pengirim / kode transfer</label>
              <input id="ref" className="input" value={referensi} onChange={(e) => setReferensi(e.target.value)} required maxLength={120} placeholder="BCA a.n. Budi" />
            </div>
            <div className="field">
              <label htmlFor="nom">Nominal ditransfer</label>
              <input id="nom" type="number" min="1" className="input" value={nominal} onChange={(e) => setNominal(e.target.value)} required />
            </div>
          </div>
          {error && <p className="alert" role="alert">{error}</p>}
          <button className="btn btn-block" disabled={mengirim}>{mengirim ? 'Mengunggah…' : 'Kirim bukti pembayaran'}</button>
        </form>
      )}
    </div>
  )
}

// Hitung sisa waktu menuju batas bayar, diperbarui tiap detik.
function useCountdown(batas) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const ms = new Date(batas).getTime() - now
  const m = Math.max(0, Math.floor(ms / 60000))
  const s = Math.max(0, Math.floor((ms % 60000) / 1000))
  return { habis: ms <= 0, teks: `${m}:${String(s).padStart(2, '0')}` }
}

// Tombol untuk menyalin teks (nomor rekening / tautan) ke clipboard.
function CopyButton({ text, label }) {
  const [ok, setOk] = useState(false)
  // Salin teks; jika browser menolak, tampilkan teks untuk disalin manual.
  const salin = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setOk(true)
      setTimeout(() => setOk(false), 1800)
    } catch {
      window.prompt('Salin teks ini:', text)
    }
  }
  return (
    <button type="button" className="btn btn-small btn-dark" onClick={salin}>
      {ok ? 'Tersalin ✓' : label}
    </button>
  )
}
