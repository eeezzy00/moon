import React from 'react'
import { createRoot } from 'react-dom/client'
import { LangProvider } from './i18n'
import GalleryPage from './pages/GalleryPage.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <LangProvider>
    <GalleryPage />
  </LangProvider>
)
