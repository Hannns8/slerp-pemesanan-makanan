import { useCallback, useEffect, useState } from 'react'
import * as api from '../../api/admin'
import { pesanError } from '../../api/client'
import { ringkasOpsi, rupiah, STATUS_BAYAR, STATUS_PESANAN, tanggalJam } from '../../utils/format'

/** VIEW: Pengelolaan pesanan (Layar 9). */
export default function OrdersPage() {
  const [filter, setFilter] = useState({ status: '', tanggal: '', cari: '' })
  const [daftar, setDaftar] = useState([])
  const [ringkasan, setRingkasan] = useState({})
  const [dipilih, setDipilih] = useState(null)

  // Ambil daftar pesanan sesuai filter.
  const muat = useCallback(() => {
    api.daftarPesanan(filter).then((r) => {
      setDaftar(r.data)
      setRingkasan(r.ringkasan)
    })
  }, [filter])

  // Muat ulang daftar setiap 30 detik agar pesanan baru terlihat
  useEffect(() => {
    muat()
    const t = setInterval(muat, 30000)
    return () => clearInterval(t)
  }, [muat])

  // Simpan perubahan filter (status, tanggal, pencarian).
  const ubahFilter = (e) => setFilter({ ...filter, [e.target.name]: e.target.value })

  return (
    <div>
      <header className="admin-head">
        <h1>Pesanan</h1>
        <button className="btn btn-small btn-ghost" onClick={muat}>↻ Muat ulang</button>
      </header>

      <div className="stat-row">
        {['menunggu_pembayaran', 'diterima', 'diproses', 'siap_diambil', 'dikirim'].map((s) => (
          <button key={s} className={`stat ${filter.status === s ? 'active' : ''}`} onClick={() => setFilter({ ...filter, status: filter.status === s ? '' : s })}>
            <b>{ringkasan[s] || 0}</b>
            <span>{STATUS_PESANAN[s]}</span>
          </button>
        ))}
      </div>

      <div className="filters">
        <input name="cari" className="input" placeholder="Cari kode / nama" value={filter.cari} onChange={ubahFilter} />
        <select name="status" className="input" value={filter.status} onChange={ubahFilter}>
          <option value="">Semua status</option>
          {Object.entries(STATUS_PESANAN).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input name="tanggal" type="date" className="input" value={filter.tanggal} onChange={ubahFilter} />
      </div>

      <div className="orders-layout">
        <div className="orders-list">
          {daftar.length === 0 && <p className="muted pad">Tidak ada pesanan.</p>}
          {daftar.map((p) => (
            <button key={p.id} className={`order-row ${dipilih === p.id ? 'active' : ''}`} onClick={() => setDipilih(p.id)}>
              <div>
                <b>{p.kode}</b>
                <small>{p.nama_penerima} · {p.metode === 'ambil' ? 'Ambil' : 'Antar'} · {tanggalJam(p.dibuat_pada)}</small>
              </div>
              <div className="order-row-right">
                <span className={`badge s-${p.status}`}>{STATUS_PESANAN[p.status]}</span>
                <span className={`badge b-${p.status_pembayaran}`}>{STATUS_BAYAR[p.status_pembayaran]}</span>
                <b>{rupiah(p.total)}</b>
              </div>
            </button>
          ))}
        </div>

        <div className="orders-detail">
          {dipilih ? <OrderDetail id={dipilih} onBerubah={muat} /> : <p className="muted pad">Pilih pesanan untuk melihat detail.</p>}
        </div>
      </div>
    </div>
  )
}

// Panel detail satu pesanan beserta tombol aksi admin.
function OrderDetail({ id, onBerubah }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [pesanOk, setPesanOk] = useState('')
  const [bukti, setBukti] = useState(null) // { url, tipe }

  useEffect(() => {
    setData(null)
    setError('')
    setPesanOk('')
    api.detailPesanan(id).then(setData).catch((e) => setError(pesanError(e)))
  }, [id])

  /** Jalankan aksi admin, lalu tampilkan data terbaru. */
  const jalankan = async (aksi, pesan) => {
    setError('')
    setPesanOk('')
    try {
      const hasil = await aksi()
      setData(hasil)
      setPesanOk(pesan)
      onBerubah()
    } catch (e) {
      setError(pesanError(e))
    }
  }

  // Unduh bukti bayar (privat, butuh token) lalu tampilkan di modal.
  const lihatBukti = async (pembayaranId) => {
    const blob = await api.ambilBukti(pembayaranId)
    setBukti({ url: URL.createObjectURL(blob), tipe: blob.type })
  }

  if (!data) return <p className="muted pad">{error || 'Memuat…'}</p>

  const p = data.pesanan

  // Tolak bukti bayar; alasan wajib diisi.
  const tolak = (bayarId) => {
    const alasan = window.prompt('Alasan penolakan (wajib, akan dilihat pelanggan):')
    if (alasan) jalankan(() => api.verifikasiPembayaran(bayarId, 'tolak', alasan), 'Bukti ditolak.')
  }
  // Batalkan pesanan; alasan wajib diisi.
  const batal = () => {
    const alasan = window.prompt('Alasan pembatalan (wajib):')
    if (alasan) jalankan(() => api.batalkanPesanan(p.id, alasan), 'Pesanan dibatalkan.')
  }
  // Catat bahwa dana sudah dikembalikan ke pelanggan.
  const refund = (bayarId) => {
    const catatan = window.prompt('Catatan refund (nominal, rekening tujuan, waktu transfer):')
    if (catatan) jalankan(() => api.catatRefund(bayarId, catatan), 'Refund dicatat.')
  }

  return (
    <div className="detail">
      <div className="detail-head">
        <div>
          <h2>{p.kode}</h2>
          <small>{tanggalJam(p.dibuat_pada)} · batas bayar {tanggalJam(p.batas_bayar)}</small>
        </div>
        <span className={`badge s-${p.status}`}>{STATUS_PESANAN[p.status]}</span>
      </div>

      {error && <p className="alert">{error}</p>}
      {pesanOk && <p className="alert ok">{pesanOk}</p>}

      <section>
        <h4>Pelanggan</h4>
        <p><b>{p.nama_penerima}</b> · {p.telepon}</p>
        <p>{p.metode === 'ambil' ? 'Ambil sendiri di outlet' : <>Antar ke <b>{p.nama_zona}</b>: {p.alamat}</>}</p>
        {p.catatan && <p className="note">Catatan: {p.catatan}</p>}
      </section>

      <section>
        <h4>Item</h4>
        <table className="mini-table">
          <tbody>
            {p.item.map((it) => (
              <tr key={it.id}>
                <td>{it.jumlah}×</td>
                <td>{it.nama_produk}<small>{ringkasOpsi(it.opsi)}</small></td>
                <td className="num">{rupiah(it.subtotal)}</td>
              </tr>
            ))}
            <tr><td /><td>Ongkir</td><td className="num">{rupiah(p.ongkir)}</td></tr>
            <tr className="tot"><td /><td>Total</td><td className="num">{rupiah(p.total)}</td></tr>
          </tbody>
        </table>
      </section>

      <section>
        <h4>Pembayaran · {STATUS_BAYAR[p.status_pembayaran]}</h4>
        {p.pembayaran.length === 0 && <p className="muted">Belum ada bukti.</p>}
        {p.pembayaran.map((b) => (
          <div key={b.id} className="pay-card">
            <div>
              <b>{rupiah(b.nominal)}</b> {b.nominal !== p.total && <span className="badge b-ditolak">≠ tagihan</span>}
              <small>{b.referensi} · {tanggalJam(b.diunggah_pada)}</small>
              {b.catatan && <small>Catatan: {b.catatan}</small>}
              {b.admin && <small>Diperiksa oleh {b.admin.nama}</small>}
              {b.refund_status !== 'tidak_ada' && <small>Refund: {b.refund_status}{b.refund_catatan ? ` — ${b.refund_catatan}` : ''}</small>}
            </div>
            <div className="pay-actions">
              <span className={`badge b-${b.status}`}>{STATUS_BAYAR[b.status]}</span>
              <button className="text-btn" onClick={() => lihatBukti(b.id)}>Lihat bukti</button>
              {b.status === 'menunggu' && p.status === 'menunggu_pembayaran' && (
                <>
                  <button className="btn btn-small btn-dark" onClick={() => {
                    if (window.confirm('Sudah cocokkan dana yang masuk di mutasi rekening?')) {
                      jalankan(() => api.verifikasiPembayaran(b.id, 'terima'), 'Pembayaran diterima.')
                    }
                  }}>Terima</button>
                  <button className="btn btn-small" onClick={() => tolak(b.id)}>Tolak</button>
                </>
              )}
              {b.refund_status === 'perlu' && <button className="btn btn-small" onClick={() => refund(b.id)}>Catat refund</button>}
            </div>
          </div>
        ))}
      </section>

      <section>
        <h4>Ubah status</h4>
        <div className="status-actions">
          {data.langkah_berikutnya.map((s) => (
            <button key={s} className="btn btn-small btn-dark" onClick={() => jalankan(() => api.ubahStatus(p.id, s), `Status diubah ke ${STATUS_PESANAN[s]}.`)}>
              Tandai {STATUS_PESANAN[s]} →
            </button>
          ))}
          {data.langkah_berikutnya.length === 0 && p.status === 'menunggu_pembayaran' && <p className="muted">Status maju setelah pembayaran diterima.</p>}
          {data.bisa_dibatalkan && <button className="btn btn-small btn-ghost" onClick={batal}>Batalkan pesanan</button>}
        </div>
        {p.alasan_batal && <p className="note">Alasan batal: {p.alasan_batal}</p>}
      </section>

      <section>
        <h4>Riwayat</h4>
        <ol className="timeline">
          {[...p.riwayat].reverse().map((r) => (
            <li key={r.id}>
              <time>{tanggalJam(r.dibuat_pada)} · {r.admin?.nama || 'Sistem/pelanggan'}</time>
              <b>{STATUS_PESANAN[r.status] || r.status}</b>
              {r.catatan && <p>{r.catatan}</p>}
            </li>
          ))}
        </ol>
      </section>

      {bukti && (
        <div className="modal" onClick={() => setBukti(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="drawer-close" onClick={() => setBukti(null)} aria-label="Tutup">✕</button>
            {bukti.tipe === 'application/pdf'
              ? <iframe src={bukti.url} title="Bukti pembayaran" />
              : <img src={bukti.url} alt="Bukti pembayaran" />}
          </div>
        </div>
      )}
    </div>
  )
}
