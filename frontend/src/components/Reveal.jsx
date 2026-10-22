import { motion } from 'framer-motion'

/**
 * Bungkus elemen apa pun agar muncul (fade + naik) saat di-scroll ke layar.
 * Contoh: <Reveal delay={0.2}><p>Halo</p></Reveal>
 */
export default function Reveal({ children, delay = 0, y = 40, as = 'div', className, ...rest }) {
  const Tag = motion[as]
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

/**
 * Judul besar yang muncul baris demi baris dari balik "masker".
 * lines = array berisi teks atau elemen, masing-masing satu baris.
 */
export function RevealLines({ lines, className, delay = 0, as = 'h2', animateOnMount = false }) {
  const Tag = motion[as]
  // Pemicu dipasang di elemen induk (bukan tiap baris), karena baris yang
  // tersembunyi di balik masker tidak pernah terdeteksi "terlihat" oleh browser.
  const pemicu = animateOnMount
    ? { animate: 'show' }
    : { whileInView: 'show', viewport: { once: true, margin: '-40px' } }

  return (
    <Tag className={className} initial="hidden" {...pemicu}>
      {lines.map((line, i) => (
        <span key={i} className="line-mask">
          <motion.span
            className="line-inner"
            variants={{
              hidden: { y: '105%', rotate: 2 },
              show: { y: '0%', rotate: 0 },
            }}
            transition={{ duration: 1.05, delay: delay + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}
