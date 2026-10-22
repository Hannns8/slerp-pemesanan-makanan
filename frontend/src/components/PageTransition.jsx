import { motion } from 'framer-motion'

/** Animasi masuk/keluar setiap kali pindah halaman. */
export default function PageTransition({ children }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.main>
  )
}
