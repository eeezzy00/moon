import { createContext, useContext, useEffect, useState } from 'react'
import ru from './ru'
import en from './en'

const DICTS = { ru, en }
const Ctx = createContext(null)

function initialLang() {
  try {
    const saved = localStorage.getItem('lang')
    if (saved in DICTS) return saved
  } catch {}
  return navigator.language?.toLowerCase().startsWith('ru') ? 'ru' : 'en'
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState(initialLang)
  useEffect(() => {
    document.documentElement.lang = lang
    try { localStorage.setItem('lang', lang) } catch {}
  }, [lang])
  return <Ctx.Provider value={{ lang, setLang, t: DICTS[lang] }}>{children}</Ctx.Provider>
}

export const useLang = () => useContext(Ctx)
