import React from 'react'
import { createRoot } from 'react-dom/client'
import { LangProvider } from './i18n'
import App from './App.jsx'
import './styles.css'
import { startFavicon } from './lib/favicon'

startFavicon()

createRoot(document.getElementById('root')).render(
  <LangProvider>
    <App />
  </LangProvider>
)
