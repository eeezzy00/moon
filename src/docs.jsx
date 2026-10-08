import React from 'react'
import { createRoot } from 'react-dom/client'
import { LangProvider } from './i18n'
import DocsPage from './pages/DocsPage.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <LangProvider>
    <DocsPage />
  </LangProvider>
)
