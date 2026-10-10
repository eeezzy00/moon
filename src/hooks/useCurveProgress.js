import { useEffect, useState } from 'react'
import { CONFIG } from '../lib/config'

// Возвращает прогресс кривой в GRAM.
// Если задан VITE_PROGRESS_URL — опрашивает его раз в 30 с.
// Иначе демо: значение из ?gram=1200 в адресной строке (по умолчанию CONFIG.demoGram).
const MOONS = { new: 0, crescent: 500, quarter: 1000, gibbous: 1500, full: 2000 }
function demoGram() {
  const q = new URLSearchParams(window.location.search)
  if (q.get('moon') in MOONS) return MOONS[q.get('moon')]
  const raw = q.get('gram')
  const v = raw === null || raw === '' ? NaN : Number(raw)
  return Number.isFinite(v) && v >= 0 ? Math.min(v, CONFIG.maxGram) : CONFIG.demoGram
}

export function useCurveProgress() {
  const live = Boolean(CONFIG.progressUrl)
  const [gram, setGram] = useState(demoGram)

  useEffect(() => {
    if (!live) return
    let stop = false
    const load = () =>
      fetch(CONFIG.progressUrl)
        .then((r) => r.json())
        .then((d) => !stop && setGram(Number(d.gram) || 0))
        .catch(() => {})
    load()
    const id = setInterval(load, 30000)
    return () => {
      stop = true
      clearInterval(id)
    }
  }, [live])

  return { gram }
}
