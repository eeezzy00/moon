import { useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n'
import PixelMoon from './PixelMoon'
import track from '../../music/velariomusic-calm-ambient-603158.mp3?url'

const STORAGE_KEY = 'moonfm-volume'
const TIME_KEY = 'moonfm-time'
const PAUSED_KEY = 'moonfm-paused' // пауза, поставленная пользователем (на время сессии)

function savedVolume() {
  try {
    const v = parseFloat(localStorage.getItem(STORAGE_KEY))
    if (v >= 0 && v <= 1) return v
  } catch {}
  return 0.5 // средняя громкость по умолчанию
}

// MOON.FM: плеер с регулятором громкости в виде луны. Чем больше тени, тем тише.
export default function RadioPlayer() {
  const { t } = useLang()
  const audio = useRef(null)
  const dial = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(savedVolume)

  useEffect(() => {
    if (audio.current) audio.current.volume = volume
    try { localStorage.setItem(STORAGE_KEY, String(volume)) } catch {}
  }, [volume])

  // Автозапуск с начала. Браузеры блокируют звук до первого действия пользователя,
  // поэтому при отказе трек стартует с первого клика, нажатия клавиши или касания.
  // Позиция запоминается, и на соседней странице (документация) трек продолжается.
  useEffect(() => {
    const a = audio.current
    if (!a) return
    const userPaused = () => { try { return sessionStorage.getItem(PAUSED_KEY) === '1' } catch { return false } }
    const onMeta = () => {
      try {
        const t = parseFloat(localStorage.getItem(TIME_KEY))
        if (t > 0 && t < a.duration - 1) a.currentTime = t
      } catch {}
    }
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    a.addEventListener('loadedmetadata', onMeta)
    a.addEventListener('play', onPlay)
    a.addEventListener('pause', onPause)
    if (a.readyState >= 1) onMeta()

    const events = ['pointerdown', 'keydown', 'touchstart']
    const unlock = (e) => {
      if (e.target.closest?.('.radio__btn') || userPaused()) return
      a.play().then(off).catch(() => {})
    }
    const off = () => events.forEach((ev) => window.removeEventListener(ev, unlock, true))

    if (!userPaused()) {
      a.play().catch(() => events.forEach((ev) => window.addEventListener(ev, unlock, true)))
    }

    const save = () => { try { if (a.currentTime > 0) localStorage.setItem(TIME_KEY, String(a.currentTime)) } catch {} }
    const id = setInterval(save, 2000)
    window.addEventListener('pagehide', save)
    return () => {
      off()
      clearInterval(id)
      window.removeEventListener('pagehide', save)
      a.removeEventListener('loadedmetadata', onMeta)
      a.removeEventListener('play', onPlay)
      a.removeEventListener('pause', onPause)
    }
  }, [])

  const toggle = () => {
    const a = audio.current
    if (!a) return
    if (a.paused) {
      try { sessionStorage.removeItem(PAUSED_KEY) } catch {}
      a.play().catch(() => {})
    } else {
      try { sessionStorage.setItem(PAUSED_KEY, '1') } catch {}
      a.pause()
    }
  }

  // громкость = доля света на луне: слева 0 (новолуние), справа 1 (полнолуние)
  const setFromPointer = (e) => {
    const r = dial.current.getBoundingClientRect()
    setVolume(Math.round(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * 20) / 20)
  }
  const onDown = (e) => { e.currentTarget.setPointerCapture(e.pointerId); setFromPointer(e) }
  const onMove = (e) => { if (e.buttons) setFromPointer(e) }
  const onKey = (e) => {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 0.05 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -0.05 : 0
    if (!step) return
    e.preventDefault()
    setVolume((v) => Math.round(Math.min(1, Math.max(0, v + step)) * 20) / 20)
  }

  return (
    <div className={`radio ${playing ? 'radio--on' : ''}`}>
      <audio ref={audio} src={track} loop preload="auto" />
      <button className="radio__btn" onClick={toggle} aria-label={playing ? t.radioPause : t.radioPlay} title={playing ? t.radioPause : t.radioPlay}>
        <svg viewBox="0 0 8 8" width="14" height="14" shapeRendering="crispEdges" aria-hidden="true">
          {playing
            ? <><rect x="1" y="1" width="2" height="6" /><rect x="5" y="1" width="2" height="6" /></>
            : <><rect x="2" y="1" width="1" height="6" /><rect x="3" y="2" width="1" height="4" /><rect x="4" y="2" width="1" height="4" /><rect x="5" y="3" width="1" height="2" /></>}
        </svg>
      </button>
      <div className="radio__info">
        <b>MOON.FM</b>
        <span className="radio__eq" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => <i key={i} className={playing ? 'on' : ''} style={{ animationDelay: `${i * 0.13}s` }} />)}
        </span>
      </div>
      <div
        ref={dial}
        className="radio__moon"
        role="slider"
        tabIndex={0}
        aria-label={t.radioVol}
        title={t.radioVol}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(volume * 100)}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onKeyDown={onKey}
      >
        <PixelMoon lit={volume} size={34} flip flat />
      </div>
    </div>
  )
}
