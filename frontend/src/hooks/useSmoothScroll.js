import Lenis from 'lenis'
import { useEffect } from 'react'

/**
 * Scroll halus (smooth scroll) memakai library Lenis.
 * Link "#menu" juga di-scroll halus ke bagian yang dituju.
 */
let lenis = null

// Scroll halus ke elemen tertentu, mis. scrollKe('#menu').
export function scrollKe(target) {
  if (lenis) lenis.scrollTo(target, { offset: -20, duration: 1.4 })
  else document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
}

// Aktifkan smooth scroll (Lenis) selama komponen dipakai.
export function useSmoothScroll(aktif = true) {
  useEffect(() => {
    if (!aktif || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    lenis = new Lenis({ duration: 1.15, smoothWheel: true })
    let frame
    const loop = (time) => {
      lenis.raf(time)
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
      lenis = null
    }
  }, [aktif])
}
