import { Link } from 'react-router-dom'
import { useInfo } from '../hooks/useInfo'
import { RotatingBadge, Wave } from './Decor'
import Reveal, { RevealLines } from './Reveal'

/** Bagian kontak + footer, tampil di semua halaman pelanggan. */
export default function Footer() {
  const info = useInfo()

  return (
    <footer className="footer">
      <Wave color="var(--green)" />
      <div className="footer-body">
        <div className="container">
          <div className="footer-head">
            <span className="eyebrow both">Mampir ke dapur kami</span>
            <RevealLines
              className="display footer-title"
              lines={[
                <><span className="outline-cream">Kami</span> <span className="serif-i">siap</span></>,
                'memasak',
              ]}
            />
          </div>

          <div className="footer-grid">
            <Reveal className="footer-col">
              <h4>Outlet</h4>
              <p>{info?.alamat_outlet}</p>
            </Reveal>
            <Reveal className="footer-col" delay={0.1}>
              <h4>Jam buka</h4>
              <p>{info?.jam_buka}</p>
            </Reveal>
            <Reveal className="footer-col" delay={0.2}>
              <h4>Kontak</h4>
              <p>{info?.telepon}</p>
            </Reveal>
            <Reveal className="footer-col" delay={0.3}>
              <h4>Pintasan</h4>
              <p>
                <Link to="/lacak" className="link-underline">Lacak pesanan</Link>
              </p>
            </Reveal>
          </div>

          <RotatingBadge className="footer-badge" text="SLERP • SLERP • SLERP • " size={110}>
            <span>🍜</span>
          </RotatingBadge>
        </div>

        <div className="footer-giant" aria-hidden="true">{info?.nama || 'Slerp!'}</div>

        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} {info?.nama} — {info?.tagline}</span>
          <Link to="/admin/login">Masuk admin</Link>
        </div>
      </div>
    </footer>
  )
}
