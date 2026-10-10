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

// Русский для России и СНГ, английский для всех остальных:
// сначала языки браузера по порядку, затем часовой пояс (если браузер на английском)
const RU_LIKE = ['ru', 'uk', 'be', 'kk', 'ky', 'uz', 'tg', 'tk', 'hy', 'az', 'ka', 'mo']
const CIS_ZONES = /^(Europe\/(Moscow|Kaliningrad|Samara|Volgograd|Kirov|Saratov|Astrakhan|Ulyanovsk|Minsk|Kyiv|Kiev|Chisinau|Simferopol|Uzhgorod|Zaporozhye)|Asia\/(Almaty|Qostanay|Aqtau|Aqtobe|Atyrau|Oral|Qyzylorda|Bishkek|Tashkent|Samarkand|Dushanbe|Ashgabat|Yerevan|Baku|Tbilisi|Yekaterinburg|Omsk|Novosibirsk|Barnaul|Tomsk|Novokuznetsk|Krasnoyarsk|Irkutsk|Chita|Yakutsk|Vladivostok|Magadan|Sakhalin|Kamchatka|Anadyr|Srednekolymsk|Ust-Nera|Khandyga))$/
function detectLang() {
  try {
    const list = (navigator.languages?.length ? navigator.languages : [navigator.language]).map((l) => (l || '').toLowerCase().split('-')[0])
    const first = list.find(Boolean)
    if (RU_LIKE.includes(first)) return 'ru'
    if (first === 'en' || !first) {
      if (list.includes('ru')) return 'ru'
      if (CIS_ZONES.test(Intl.DateTimeFormat().resolvedOptions().timeZone || '')) return 'ru'
    }
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
