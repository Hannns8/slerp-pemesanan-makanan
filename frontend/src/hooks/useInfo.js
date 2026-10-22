import { useEffect, useState } from 'react'
import { ambilInfo } from '../api/toko'

/** Info usaha (nama, alamat, rekening) dari config/toko.php di Laravel. */
let cache = null

// Ambil info usaha dari server sekali, lalu simpan di cache.
export function useInfo() {
  const [info, setInfo] = useState(cache)

  useEffect(() => {
    if (cache) return
    ambilInfo()
      .then((data) => {
        cache = data
        setInfo(data)
      })
      .catch(() => {})
  }, [])

  return info
}
