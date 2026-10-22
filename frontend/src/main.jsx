import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { pasangEfekTombol } from './utils/efekTombol.js'
import './styles/global.css'
import './styles/components.css'
import './styles/home.css'
import './styles/pages.css'
import './styles/admin.css'

// Efek hover "lingkaran merah dari titik kursor" untuk semua tombol
pasangEfekTombol()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <CartProvider>
        <App />
      </CartProvider>
    </BrowserRouter>
  </StrictMode>,
)
