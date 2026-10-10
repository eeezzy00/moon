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
  return detectLang()
}

// Основной язык английский. Русский ставится только если браузер явно русскоязычный (россия и СНГ):
// первый язык из списка или русский где-то в списке языков браузера
const RU_LIKE = ['ru', 'uk', 'be', 'kk', 'ky', 'uz', 'tg', 'tk', 'hy', 'az', 'ka', 'mo']
function detectLang() {
  try {
    const list = (navigator.languages?.length ? navigator.languages : [navigator.language]).map((l) => (l || '').toLowerCase().split('-')[0])
    const first = list.find(Boolean)
    if (RU_LIKE.includes(first)) return 'ru'
    if (list.includes('ru')) return 'ru'
  } catch {}
  return 'en'
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
