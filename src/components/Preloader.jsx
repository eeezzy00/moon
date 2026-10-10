import { useEffect, useRef, useState } from 'react'
import Cosmos from './Cosmos'
import HeroMoon from './HeroMoon'

// Что ждём перед показом сайта: шрифты, ключевые картинки и полную загрузку страницы
const IMAGES = ['/moon.png', '/luna.png', '/luna-talk.png', '/how.png', '/how2.png', '/story/1.png', '/story/2.png', '/story/3.png', '/story/4.png']
const MIN_MS = 1600 // луна растёт не быстрее, чтобы анимацию успели увидеть
const MAX_MS = 7000 // страховка: показать сайт, даже если что-то не загрузилось

// Вступление после загрузки: сначала луна, потом текст, кнопки, и только затем шапка и весь остальной сайт.
// Пока висит класс intro, остальное скрыто (см. стили); при «уменьшении движения» вступление пропускается.
const INTRO_MS = 4200
function startIntro(root) {
  root.classList.remove('is-loading')
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  root.classList.add('intro')
  setTimeout(() => root.classList.remove('intro'), INTRO_MS)
}

// Загрузка в виде луны: от новолуния до полнолуния по мере загрузки, затем мягко растворяется.
// Пока на <html> висит класс is-loading, анимации первого экрана стоят на паузе.
export default function Preloader() {
  const [shown, setShown] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const [gone, setGone] = useState(false)
  const target = useRef(0)

  useEffect(() => {
    const root = document.documentElement
    // ?noload в адресе пропускает загрузку (удобно для скриншотов и отладки)
    if (new URLSearchParams(window.location.search).has('noload')) {
      // ?noload&intro: без загрузки, но с вступлением (для проверки порядка появления)
      if (new URLSearchParams(window.location.search).has('intro')) startIntro(root)
      else root.classList.remove('is-loading')
      setGone(true)
      return
    }
    const start = performance.now()
    const tasks = []
    const done = () => { target.current = Math.min(1, target.current + 1 / tasks.length) }

    tasks.push(document.fonts ? document.fonts.ready : Promise.resolve())
    tasks.push(new Promise((res) => (document.readyState === 'complete' ? res() : window.addEventListener('load', res, { once: true }))))
    IMAGES.forEach((src) => tasks.push(new Promise((res) => { const im = new Image(); im.onload = im.onerror = res; im.src = src })))
    tasks.forEach((p) => p.then(done, done))

    let raf = 0
    let cur = 0
    let finished = false
    const tick = (now) => {
      const elapsed = now - start
      const goal = elapsed > MAX_MS ? 1 : Math.min(target.current, elapsed / MIN_MS)
      cur += (goal - cur) * 0.08
      if (goal - cur < 0.004) cur = goal
      setShown(Math.round(cur * 50) / 50) // шаг 2%: луна растёт пиксельными ступенями
      if (cur >= 1 && !finished) {
        finished = true
        setTimeout(() => {
          setLeaving(true)
          startIntro(root)
          setTimeout(() => setGone(true), 1000)
        }, 260)
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  if (gone) return null
  return (
    <div className={`loader ${leaving ? 'loader--out' : ''}`} role="progressbar" aria-label="Loading" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(shown * 100)}>
      <Cosmos />
      <div className="loader__glow" style={{ opacity: 0.35 + shown * 0.65 }} />
      <div className="loader__center">
        <div className="loader__moon">
          <HeroMoon lit={shown} size={280} />
        </div>
        <div className="loader__text">
          LOADING<span className="loader__dots"><i>.</i><i>.</i><i>.</i></span>
          <span className="loader__pct">{Math.round(shown * 100)}%</span>
        </div>
      </div>
    </div>
  )
}
