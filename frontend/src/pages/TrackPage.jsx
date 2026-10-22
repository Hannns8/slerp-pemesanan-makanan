import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Reveal, { RevealLines } from '../components/Reveal'
import { rupiah } from '../utils/format'
import { daftarPesananSaya, tautanLacak } from '../utils/pesananSaya'

/** VIEW: form lacak pesanan dengan kode + token. */
export default function TrackPage() {
  const [kode, setKode] = useState('')
  const [token, setToken] = useState('')
  const navigate = useNavigate()
  const tersimpan = daftarPesananSaya()

  // Buka halaman status pesanan berdasarkan kode + token yang diisi.
  const kirim = (e) => {
    e.preventDefault()
    navigate(tautanLacak(kode.trim().toUpperCase(), token.trim()))
  }

  return (
    <section className="page">
      <div className="container narrow">
        <div className="page-head">
          <span className="eyebrow">Lacak pesanan</span>
          <RevealLines as="h1" animateOnMount className="display" lines={['Di mana', <span className="serif-i">mie-ku?</span>]} />
        </div>

        <Reveal className="card form-card">
          <form onSubmit={kirim}>
            <div className="field">
              <label htmlFor="kode">Kode pesanan</label>
              <input id="kode" className="input" value={kode} onChange={(e) => setKode(e.target.value)} placeholder="SLR-261021-AB12" required />
            </div>
            <div className="field">
              <label htmlFor="token">Token privat</label>
              <input id="token" className="input" value={token} onChange={(e) => setToken(e.target.value)} required />
              <span className="hint">Token ada di tautan pelacakan yang kamu terima setelah checkout. Kode saja tidak cukup demi keamanan.</span>
            </div>
            <button className="btn btn-block">Lacak <span className="arrow">→</span></button>
          </form>
        </Reveal>

        {tersimpan.length > 0 && (
          <Reveal className="saved-orders" delay={0.15}>
            <h3>Pesanan di perangkat ini</h3>
            <ul>
              {tersimpan.map((p) => (
                <li key={p.kode}>
                  <Link to={tautanLacak(p.kode, p.token)}>
                    <b>{p.kode}</b>
                    <span>{rupiah(p.total)} · {new Date(p.waktu).toLocaleDateString('id-ID')}</span>
                    <span className="arrow">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </div>
    </section>
  )
}
