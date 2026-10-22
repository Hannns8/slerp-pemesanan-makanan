import { useEffect, useState } from 'react'
import { Link, NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { ambilSaya, logout } from '../../api/admin'
import { ADMIN_TOKEN_KEY } from '../../api/client'

/**
 * Kerangka halaman admin: sidebar + isi halaman (<Outlet />).
 * Jika belum login (tidak ada token / token tidak valid), diarahkan ke /admin/login.
 */
export default function AdminLayout() {
  const [admin, setAdmin] = useState(null)
  const [gagal, setGagal] = useState(false)
  const navigate = useNavigate()
  const token = localStorage.getItem(ADMIN_TOKEN_KEY)

  useEffect(() => {
    if (!token) return
    ambilSaya()
      .then(setAdmin)
      .catch(() => {
        localStorage.removeItem(ADMIN_TOKEN_KEY)
        setGagal(true)
      })
  }, [token])

  if (!token || gagal) return <Navigate to="/admin/login" replace />
  if (!admin) return <div className="admin-loading">Memuat…</div>

  // Logout: hapus token di server dan browser, lalu kembali ke halaman login.
  const keluar = async () => {
    try {
      await logout()
    } finally {
      localStorage.removeItem(ADMIN_TOKEN_KEY)
      navigate('/admin/login')
    }
  }

  return (
    <div className="admin">
      <aside className="admin-side">
        <Link to="/" className="logo">Slerp!</Link>
        <span className="admin-role">Panel admin</span>
        <nav>
          <NavLink to="/admin" end>📋 Pesanan</NavLink>
          <NavLink to="/admin/produk">🍜 Produk & kategori</NavLink>
          <NavLink to="/admin/zona">🛵 Zona antar</NavLink>
        </nav>
        <div className="admin-user">
          <b>{admin.nama}</b>
          <small>{admin.email}</small>
          <button className="text-btn" onClick={keluar}>Keluar</button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
