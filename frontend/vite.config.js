import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Alamat server Laravel (php artisan serve)
const BACKEND = 'http://127.0.0.1:8000'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // "proxy" meneruskan request /api, /images, /storage ke Laravel,
    // jadi frontend cukup memanggil "/api/..." tanpa menulis alamat lengkap.
    proxy: {
      '/api': BACKEND,
      '/images': BACKEND,
      '/storage': BACKEND,
    },
  },
})
