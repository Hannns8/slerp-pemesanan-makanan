import { useEffect, useState } from 'react'
import * as api from '../../api/admin'
import { pesanError } from '../../api/client'
import { rupiah } from '../../utils/format'

const ZONA_KOSONG = { id: null, nama: '', cakupan: '', ongkir: '', aktif: true }

/** VIEW: Pengaturan zona pengantaran (Layar 10). */
export default function ZonesPage() {
  const [zona, setZona] = useState([])
  const [form, setForm] = useState(ZONA_KOSONG)
  const [error, setError] = useState('')
  const [pesan, setPesan] = useState('')

  // Ambil daftar zona antar.
  const muat = () => api.daftarZona().then(setZona)
  useEffect(() => {
    muat()
  }, [])

  // Simpan perubahan isi form zona.
  const ubah = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  // Simpan zona ke server (zona baru atau perubahan).
  const simpan = async (e) => {
    e.preventDefault()
    setError('')
    setPesan('')
    try {
      await api.simpanZona(form)
      setPesan(form.id ? 'Zona diperbarui.' : 'Zona ditambahkan.')
      setForm(ZONA_KOSONG)
      muat()
    } catch (err) {
      setError(pesanError(err))
    }
  }

  return (
    <div>
      <header className="admin-head"><h1>Zona antar</h1></header>
      <div className="orders-layout">
        <div className="orders-list">
          <table className="table">
            <thead>
              <tr><th>Zona</th><th>Cakupan</th><th className="num">Ongkir</th><th>Status</th><th /></tr>
            </thead>
            <tbody>
              {zona.map((z) => (
                <tr key={z.id} className={z.aktif ? '' : 'off'}>
                  <td><b>{z.nama}</b></td>
                  <td>{z.cakupan}</td>
                  <td className="num">{rupiah(z.ongkir)}</td>
                  <td><span className={`badge ${z.aktif ? 's-selesai' : 's-dibatalkan'}`}>{z.aktif ? 'Aktif' : 'Nonaktif'}</span></td>
                  <td><button className="text-btn" onClick={() => setForm(z)}>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="hint pad">Zona yang sudah dipakai tidak dihapus — nonaktifkan saja. Pesanan lama tetap memakai ongkir saat checkout.</p>
        </div>

        <form className="orders-detail detail" onSubmit={simpan}>
          <div className="detail-head"><h2>{form.id ? 'Edit zona' : 'Zona baru'}</h2></div>
          {error && <p className="alert">{error}</p>}
          {pesan && <p className="alert ok">{pesan}</p>}
          <div className="field">
            <label htmlFor="zn">Nama zona</label>
            <input id="zn" name="nama" className="input" value={form.nama} onChange={ubah} required maxLength={80} />
          </div>
          <div className="field">
            <label htmlFor="zc">Batas / cakupan area</label>
            <textarea id="zc" name="cakupan" className="input" value={form.cakupan} onChange={ubah} required />
          </div>
          <div className="field">
            <label htmlFor="zo">Ongkir (Rp)</label>
            <input id="zo" name="ongkir" type="number" min="0" className="input" value={form.ongkir} onChange={ubah} required />
          </div>
          <div className="checks">
            <label><input type="checkbox" name="aktif" checked={form.aktif} onChange={ubah} /> Aktif untuk pesanan baru</label>
          </div>
          <div className="status-actions">
            <button className="btn btn-small">Simpan</button>
            {form.id && <button type="button" className="btn btn-small btn-ghost" onClick={() => setForm(ZONA_KOSONG)}>Batal edit</button>}
          </div>
        </form>
      </div>
    </div>
  )
}
