/**
 * Efek hover tombol: mencatat titik masuk/keluar kursor pada tombol
 * ke variabel CSS --x dan --y, supaya lingkaran merah (lihat .btn::before
 * di styles/global.css) menyebar dari titik tersebut.
 *
 * Cukup dipasang sekali (di main.jsx) dan otomatis berlaku untuk semua tombol,
 * termasuk tombol yang baru muncul belakangan.
 */
const SELEKTOR_TOMBOL = '.btn, .round-btn, .badge-center button'

// Simpan posisi kursor saat masuk/keluar tombol ke --x dan --y.
function catatPosisiKursor(e) {
  const tombol = e.target.closest?.(SELEKTOR_TOMBOL)
  // Abaikan perpindahan kursor antar-elemen di dalam tombol yang sama
  if (!tombol || tombol.contains(e.relatedTarget)) return

  const r = tombol.getBoundingClientRect()
  tombol.style.setProperty('--x', `${e.clientX - r.left}px`)
  tombol.style.setProperty('--y', `${e.clientY - r.top}px`)
}

// Pasang efek hover ke seluruh halaman (cukup dipanggil sekali).
export function pasangEfekTombol() {
  document.addEventListener('pointerover', catatPosisiKursor)
  document.addEventListener('pointerout', catatPosisiKursor)
}
