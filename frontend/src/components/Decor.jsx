import { useId } from 'react'

/**
 * Komponen hiasan kecil: badge teks berputar, garis gelombang, dan teks berjalan (marquee).
 */

export function RotatingBadge({ text = 'PESAN • ANTAR • AMBIL • ', size = 120, className = '', children }) {
  const id = 'circle' + useId().replace(/:/g, '')
  return (
    <div className={`rotating-badge ${className}`} style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 100 100" className="spin">
        <defs>
          <path id={id} d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
        </defs>
        <text>
          <textPath href={`#${id}`} startOffset="0">
            {text.repeat(2)}
          </textPath>
        </text>
      </svg>
      <div className="badge-center">{children}</div>
    </div>
  )
}

/**
 * Pembatas bergelombang antar-bagian.
 * color = warna bagian di bawah garis gelombang, bg = warna di atasnya (default transparan).
 */
export function Wave({ color = 'var(--green)', bg, flip = false, className = '' }) {
  return (
    <div className={`wave ${flip ? 'flip' : ''} ${className}`} style={bg ? { background: bg } : undefined} aria-hidden="true">
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
        <path
          fill={color}
          d="M0,64 C180,120 360,120 540,80 C720,40 900,0 1080,24 C1260,48 1350,96 1440,88 L1440,120 L0,120 Z"
        />
      </svg>
    </div>
  )
}

/** Teks yang terus berjalan ke samping. */
export function Marquee({ items, className = '' }) {
  const isi = items.map((t, i) => (
    <span key={i} className="marquee-item">
      {t} <span className="marquee-star">✦</span>
    </span>
  ))
  return (
    <div className={`marquee ${className}`} aria-hidden="true">
      <div className="marquee-track">
        <div className="marquee-group">{isi}</div>
        <div className="marquee-group">{isi}</div>
      </div>
    </div>
  )
}
