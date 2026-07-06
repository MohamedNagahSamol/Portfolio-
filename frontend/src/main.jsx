import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

/* ── Self-hosted fonts via @fontsource ── */
import '@fontsource/inter/latin.css'
import '@fontsource/cairo/arabic.css'
import '@fontsource/jetbrains-mono/latin.css'
import '@fontsource/space-grotesk/latin.css'

import './index.css'
import './i18n/config'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)
