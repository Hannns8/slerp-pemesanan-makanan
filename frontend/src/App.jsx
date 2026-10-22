import { AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import CartToast from './components/CartToast'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import PageTransition from './components/PageTransition'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import AdminLayout from './pages/admin/AdminLayout'
import AdminLogin from './pages/admin/LoginPage'
import AdminOrders from './pages/admin/OrdersPage'
import AdminProducts from './pages/admin/ProductsPage'
import AdminZones from './pages/admin/ZonesPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import OrderPage from './pages/OrderPage'
import TrackPage from './pages/TrackPage'

/**
 * Daftar halaman (routing). Setiap <Route> memetakan URL ke satu komponen halaman.
 * Halaman pelanggan memakai Navbar + Footer; halaman admin memakai AdminLayout.
 */
export default function App() {
  const location = useLocation()
  const diAdmin = location.pathname.startsWith('/admin')

  useSmoothScroll(!diAdmin)

  // Kembali ke atas setiap pindah halaman (kecuali link ke #bagian)
  useEffect(() => {
    if (!location.hash) window.scrollTo(0, 0)
  }, [location.pathname, location.hash])

  if (diAdmin) {
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOrders />} />
          <Route path="produk" element={<AdminProducts />} />
          <Route path="zona" element={<AdminZones />} />
        </Route>
      </Routes>
    )
  }

  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/keranjang" element={<PageTransition><CartPage /></PageTransition>} />
          <Route path="/checkout" element={<PageTransition><CheckoutPage /></PageTransition>} />
          <Route path="/lacak" element={<PageTransition><TrackPage /></PageTransition>} />
          <Route path="/pesanan/:kode" element={<PageTransition><OrderPage /></PageTransition>} />
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </AnimatePresence>
      <Footer />
      <CartToast />
    </>
  )
}
