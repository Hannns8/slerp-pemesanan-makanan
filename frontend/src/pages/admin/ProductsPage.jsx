import { useCallback, useEffect, useState } from 'react'
import * as api from '../../api/admin'
import { pesanError } from '../../api/client'
import { JENIS_OPSI, rupiah } from '../../utils/format'

const PRODUK_KOSONG = { id: null, kategori_id: '', nama: '', deskripsi: '', harga_dasar: '', varian_wajib: false, pedas_wajib: false, aktif: true }

/** VIEW: Pengelolaan produk, opsi, dan kategori (Layar 8). */
export default function ProductsPage() {
  const [produk, setProduk] = useState([])
  const [kategori, setKategori] = useState([])
  const [filter, setFilter] = useState({ cari: '', kategori_id: '', aktif: '' })
  const [dipilih, setDipilih] = useState(null) // null = tidak ada form, 'baru' = tambah, angka = edit
  const [pesanAwal, setPesanAwal] = useState('') // pesan sukses yang dibawa ke form edit setelah produk baru dibuat

  // Ambil daftar produk (sesuai filter) dan daftar kategori dari server.
  const muatProduk = useCallback(() => api.daftarProduk(filter).then(setProduk), [filter])
  const muatKategori = () => api.daftarKategori().then(setKategori)

  useEffect(() => {
    muatProduk()
  }, [muatProduk])
  useEffect(() => {
    muatKategori()
  }, [])

  // Simpan perubahan filter daftar produk.
  const ubahFilter = (e) => setFilter({ ...filter, [e.target.name]: e.target.value })

  return (
    <div>
      <header className="admin-head">
        <h1>Produk</h1>
        <button className="btn btn-small" onClick={() => setDipilih('baru')}>+ Tambah produk</button>
      </header>

      <KategoriManager kategori={kategori} onBerubah={() => { muatKategori(); muatProduk() }} />

      <div className="filters">
        <input name="cari" className="input" placeholder="Cari nama produk" value={filter.cari} onChange={ubahFilter} />
        <select name="kategori_id" className="input" value={filter.kategori_id} onChange={ubahFilter}>
          <option value="">Semua kategori</option>
          {kategori.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
        </select>
        <select name="aktif" className="input" value={filter.aktif} onChange={ubahFilter}>
          <option value="">Semua status</option>
          <option value="1">Tersedia</option>
          <option value="0">Nonaktif</option>
        </select>
      </div>

      <div className="orders-layout">
        <div className="orders-list">
          {produk.map((p) => (
            <button key={p.id} className={`order-row product-row ${dipilih === p.id ? 'active' : ''}`} onClick={() => setDipilih(p.id)}>
              <img src={p.foto_url} alt="" />
              <div>
                <b>{p.nama}</b>
                <small>{p.kategori?.nama} · {p.opsi_count} opsi</small>
              </div>
              <div className="order-row-right">
                <span className={`badge ${p.aktif ? 's-selesai' : 's-dibatalkan'}`}>{p.aktif ? 'Tersedia' : 'Nonaktif'}</span>
                <b>{rupiah(p.harga_dasar)}</b>
              </div>
            </button>
          ))}
        </div>
        <div className="orders-detail">
          {dipilih ? (
            <ProdukForm
              key={dipilih}
              id={dipilih === 'baru' ? null : dipilih}
              kategori={kategori}
              pesanAwal={pesanAwal}
              onTersimpan={(idBaru, pesan) => {
                muatProduk()
                setPesanAwal(idBaru ? pesan : '')
                if (idBaru) setDipilih(idBaru)
              }}
            />
          ) : (
            <p className="muted pad">Pilih produk untuk mengedit, atau tambah produk baru.</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Form tambah/edit produk (termasuk upload foto dan pengaturan opsi).
function ProdukForm({ id, kategori, pesanAwal, onTersimpan }) {
  const [form, setForm] = useState(PRODUK_KOSONG)
  const [opsi, setOpsi] = useState([])
  const [foto, setFoto] = useState(null)
  const [preview, setPreview] = useState('')
  const [error, setError] = useState('')
  const [pesan, setPesan] = useState(pesanAwal || '')

  // Ambil detail produk yang sedang diedit beserta opsinya.
  const muat = useCallback(() => {
    if (!id) return
    api.detailProduk(id).then((p) => {
      setForm({ ...PRODUK_KOSONG, ...p })
      setOpsi(p.opsi)
      setPreview(p.foto_url)
    })
  }, [id])

  useEffect(() => {
    muat()
  }, [muat])

  // Simpan perubahan isi form (checkbox memakai nilai checked).
  const ubah = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  // Pilih foto baru dan tampilkan pratinjaunya.
  const pilihFoto = (e) => {
    const f = e.target.files[0]
    setFoto(f)
    if (f) setPreview(URL.createObjectURL(f))
  }

  // Simpan produk ke server (produk baru atau perubahan).
  const simpan = async (e) => {
    e.preventDefault()
    setError('')
    setPesan('')
    // Form dengan file harus dikirim sebagai FormData (multipart)
    const fd = new FormData()
    ;['kategori_id', 'nama', 'deskripsi', 'harga_dasar'].forEach((k) => fd.append(k, form[k]))
    ;['varian_wajib', 'pedas_wajib', 'aktif'].forEach((k) => fd.append(k, form[k] ? 1 : 0))
    if (foto) fd.append('foto', foto)
    try {
      const hasil = await api.simpanProduk(id, fd)
      setPesan(hasil.pesan)
      setForm({ ...form, ...hasil.produk })
      onTersimpan(id ? null : hasil.produk.id, hasil.pesan)
    } catch (err) {
      setError(pesanError(err))
    }
  }

  return (
    <div className="detail">
      <div className="detail-head"><h2>{id ? 'Edit produk' : 'Produk baru'}</h2></div>
      {error && <p className="alert">{error}</p>}
      {pesan && <p className="alert ok">{pesan}</p>}

      <form onSubmit={simpan}>
        <div className="photo-field">
          {preview ? <img src={preview} alt="" /> : <div className="photo-empty">Belum ada foto</div>}
          <div className="field">
            <label htmlFor="foto">Foto {id ? '(kosongkan jika tidak diganti)' : ''}</label>
            <input id="foto" type="file" accept="image/jpeg,image/png,image/webp" onChange={pilihFoto} required={!id} />
            <span className="hint">JPG/PNG/WEBP, maks. 2 MB</span>
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="nama">Nama</label>
            <input id="nama" name="nama" className="input" value={form.nama} onChange={ubah} required maxLength={100} />
          </div>
          <div className="field">
            <label htmlFor="kat">Kategori</label>
            <select id="kat" name="kategori_id" className="input" value={form.kategori_id} onChange={ubah} required>
              <option value="">Pilih…</option>
              {kategori.map((k) => <option key={k.id} value={k.id}>{k.nama}{k.aktif ? '' : ' (nonaktif)'}</option>)}
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="desk">Deskripsi</label>
          <textarea id="desk" name="deskripsi" className="input" value={form.deskripsi} onChange={ubah} required maxLength={1000} />
        </div>
        <div className="field">
          <label htmlFor="harga">Harga dasar (Rp)</label>
          <input id="harga" name="harga_dasar" type="number" min="0" className="input" value={form.harga_dasar} onChange={ubah} required />
        </div>
        <div className="checks">
          <label><input type="checkbox" name="varian_wajib" checked={form.varian_wajib} onChange={ubah} /> Wajib pilih varian</label>
          <label><input type="checkbox" name="pedas_wajib" checked={form.pedas_wajib} onChange={ubah} /> Wajib pilih level pedas</label>
          <label><input type="checkbox" name="aktif" checked={form.aktif} onChange={ubah} /> Tersedia untuk dipesan</label>
        </div>
        <button className="btn btn-small">Simpan produk</button>
      </form>

      {id && <OpsiManager produkId={id} opsi={opsi} onBerubah={muat} />}
    </div>
  )
}

// Pengelola opsi produk: varian, level pedas, dan topping.
function OpsiManager({ produkId, opsi, onBerubah }) {
  const [baru, setBaru] = useState({ jenis: 'varian', nama: '', biaya_tambahan: 0 })
  const [error, setError] = useState('')
  const [pesan, setPesan] = useState('')

  // Jalankan aksi opsi (tambah/ubah/hapus), lalu tampilkan hasilnya.
  const aksi = async (fn, ok) => {
    setError('')
    setPesan('')
    try {
      const r = await fn()
      setPesan(r?.message || ok)
      onBerubah()
    } catch (e) {
      setError(pesanError(e))
    }
  }

  // Tambah opsi baru dari form di bawah daftar opsi.
  const tambah = (e) => {
    e.preventDefault()
    aksi(() => api.tambahOpsi(produkId, baru), 'Opsi ditambahkan.').then(() => setBaru({ ...baru, nama: '', biaya_tambahan: 0 }))
  }

  return (
    <section className="opsi-manager">
      <h4>Opsi produk</h4>
      {error && <p className="alert">{error}</p>}
      {pesan && <p className="alert ok">{pesan}</p>}

      {['varian', 'pedas', 'topping'].map((jenis) => {
        const daftar = opsi.filter((o) => o.jenis === jenis)
        return (
          <div key={jenis} className="opsi-group">
            <b>{JENIS_OPSI[jenis]}</b>
            {daftar.length === 0 && <small className="muted">Belum ada</small>}
            {daftar.map((o) => (
              <div key={o.id} className={`opsi-row ${o.aktif ? '' : 'off'}`}>
                <span>{o.nama}</span>
                <span>+{rupiah(o.biaya_tambahan)}</span>
                <button className="text-btn" onClick={() => aksi(() => api.ubahOpsi(o.id, { ...o, aktif: !o.aktif }), o.aktif ? 'Opsi dinonaktifkan.' : 'Opsi diaktifkan.')}>
                  {o.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
                <button className="text-btn" onClick={() => window.confirm(`Hapus opsi "${o.nama}"?`) && aksi(() => api.hapusOpsi(o.id), 'Opsi dihapus.')}>Hapus</button>
              </div>
            ))}
          </div>
        )
      })}

      <form className="opsi-form" onSubmit={tambah}>
        <select className="input" value={baru.jenis} onChange={(e) => setBaru({ ...baru, jenis: e.target.value })}>
          <option value="varian">Varian</option>
          <option value="pedas">Level pedas</option>
          <option value="topping">Topping</option>
        </select>
        <input className="input" placeholder="Nama, mis. Level 2" value={baru.nama} onChange={(e) => setBaru({ ...baru, nama: e.target.value })} required maxLength={80} />
        <input className="input" type="number" min="0" placeholder="Biaya" value={baru.biaya_tambahan} onChange={(e) => setBaru({ ...baru, biaya_tambahan: e.target.value })} required />
        <button className="btn btn-small btn-dark">Tambah</button>
      </form>
    </section>
  )
}

// Baris pengelola kategori: tambah, ganti nama, aktif/nonaktif.
function KategoriManager({ kategori, onBerubah }) {
  const [nama, setNama] = useState('')
  const [error, setError] = useState('')

  // Simpan kategori (baru atau perubahan); hasil true jika berhasil.
  const simpan = async (k) => {
    setError('')
    try {
      await api.simpanKategori(k)
      onBerubah()
      return true
    } catch (e) {
      setError(pesanError(e))
      return false
    }
  }

  return (
    <div className="kategori-bar">
      <b>Kategori:</b>
      {kategori.map((k) => (
        <span key={k.id} className={`kat-chip ${k.aktif ? '' : 'off'}`}>
          {k.nama} <small>({k.produk_count})</small>
          <button
            title={k.aktif ? 'Nonaktifkan (produk di dalamnya ikut tersembunyi)' : 'Aktifkan'}
            onClick={() => simpan({ ...k, aktif: !k.aktif })}
          >
            {k.aktif ? '⏸' : '▶'}
          </button>
          <button
            title="Ganti nama"
            onClick={() => {
              const n = window.prompt('Nama kategori baru:', k.nama)
              if (n) simpan({ ...k, nama: n })
            }}
          >
            ✎
          </button>
        </span>
      ))}
      <form onSubmit={async (e) => {
        e.preventDefault()
        if (await simpan({ nama, aktif: true })) setNama('')
      }}>
        <input className="input" placeholder="Kategori baru" value={nama} onChange={(e) => setNama(e.target.value)} required maxLength={60} />
        <button className="btn btn-small btn-dark">+</button>
      </form>
      {error && <p className="alert">{error}</p>}
    </div>
  )
}
