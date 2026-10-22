import axios from 'axios'

/**
 * Satu "pintu" untuk semua request ke Laravel.
 * baseURL "/api" diteruskan ke http://127.0.0.1:8000/api oleh proxy Vite.
 */
const client = axios.create({
  baseURL: '/api',
  headers: { Accept: 'application/json' },
})

export const ADMIN_TOKEN_KEY = 'slerp_admin_token'

// Jika admin sudah login, sisipkan token di setiap request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY)
  if (token && config.url.startsWith('/admin')) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/** Ambil pesan error yang ramah dari respons Laravel. */
export function pesanError(error) {
  const data = error?.response?.data
  if (data?.errors) return Object.values(data.errors).flat()[0]
  if (data?.message) return data.message
  return 'Terjadi kesalahan. Periksa koneksi lalu coba lagi.'
}

export default client
