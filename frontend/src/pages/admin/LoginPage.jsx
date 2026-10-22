import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../../api/admin'
import { ADMIN_TOKEN_KEY, pesanError } from '../../api/client'
import { RevealLines } from '../../components/Reveal'

/** VIEW: Login admin (Layar 7). */
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [memuat, setMemuat] = useState(false)
  const navigate = useNavigate()

  // Kirim email & sandi; jika benar, simpan token lalu buka panel admin.
  const kirim = async (e) => {
    e.preventDefault()
    setMemuat(true)
    setError('')
    try {
      const hasil = await login(email, password)
      localStorage.setItem(ADMIN_TOKEN_KEY, hasil.token)
      navigate('/admin')
    } catch (err) {
      setError(err.response?.status === 429 ? 'Terlalu banyak percobaan. Tunggu satu menit.' : pesanError(err))
    } finally {
      setMemuat(false)
    }
  }

  return (
    <div className="admin-login">
      <div className="login-art">
        <Link to="/" className="logo">Slerp!</Link>
        <RevealLines
          as="h1"
          animateOnMount
          className="display"
          lines={[<span className="outline-cream">Dapur</span>, <>belakang<span className="serif-i">.</span></>]}
        />
        <motion.img
          src="/images/menu/mie-goreng.jpg"
          alt=""
          initial={{ rotate: -120, scale: 0.5, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <motion.form className="login-form" onSubmit={kirim} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
        <span className="eyebrow">Admin</span>
        <h2>Masuk ke panel</h2>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" />
        </div>
        <div className="field">
          <label htmlFor="pw">Kata sandi</label>
          <input id="pw" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </div>
        {error && <p className="alert" role="alert">{error}</p>}
        <button className="btn btn-block" disabled={memuat}>{memuat ? 'Memeriksa…' : 'Masuk'}</button>
        <Link to="/" className="back-link">← Kembali ke website</Link>
      </motion.form>
    </div>
  )
}
