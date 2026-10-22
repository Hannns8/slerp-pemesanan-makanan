import { Link } from 'react-router-dom'

// Halaman 404 untuk alamat yang tidak dikenal.
export default function NotFound() {
  return (
    <section className="page">
      <div className="container empty-state">
        <h1 className="display outline-green" style={{ fontSize: 'clamp(90px, 20vw, 220px)' }}>404</h1>
        <p>Halaman ini sudah habis, seperti mie di jam makan siang.</p>
        <Link to="/" className="btn">Kembali ke beranda</Link>
      </div>
    </section>
  )
}
