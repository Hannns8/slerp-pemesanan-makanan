import { useEffect, useState } from 'react'
import { sedangBuka } from '../utils/jamBuka'

/**
 * Status buka/tutup kedai yang diperbarui otomatis setiap 30 detik,
 * jadi tulisan berganti sendiri saat jam buka/tutup tiba.
 * Mengembalikan null selama info usaha belum dimuat.
 */
export function useStatusBuka(info) {
  const [sekarang, setSekarang] = useState(() => new Date())

  useEffect(() => {
    const t = setInterval(() => setSekarang(new Date()), 30000)
    return () => clearInterval(t)
  }, [])

  if (!info?.jam_mulai || !info?.jam_tutup) return null
  return sedangBuka(info, sekarang)
}
