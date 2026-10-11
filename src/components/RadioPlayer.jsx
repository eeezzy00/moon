import { useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n'
import PixelMoon from './PixelMoon'
import { STATIONS, ALL_TRACKS } from '../lib/radio'

const STORAGE_KEY = 'moonfm-volume'
const TIME_KEY = 'moonfm-time' // "id трека|секунды": продолжаем с того же места только тот же трек
const TRACK_KEY = 'moonfm-track' // последний трек
const PAUSED_KEY = 'moonfm-paused' // пауза, поставленная пользователем (на время сессии)
const OWNER_KEY = 'moonfm-owner' // вкладка, в которой играет музыка: { id, ts }
const HINT_KEY = 'moonfm-hint' // подсказка уже показывалась в этой сессии
const OWNER_TTL = 5000 // вкладка считается живой, пока обновляет метку чаще этого
const TAB_ID = Math.random().toString(36).slice(2)

// Музыка играет только в одной вкладке: в той, что открыта первой (или где нажали ▶ последней)
function readOwner() {
  try { return JSON.parse(localStorage.getItem(OWNER_KEY)) } catch { return null }
}
const otherTabOwns = () => {
  const o = readOwner()
  return Boolean(o && o.id !== TAB_ID && Date.now() - o.ts < OWNER_TTL)
}
const claim = () => { try { localStorage.setItem(OWNER_KEY, JSON.stringify({ id: TAB_ID, ts: Date.now() })) } catch {} }
const isOwner = () => readOwner()?.id === TAB_ID

function savedTrack() {
  try {
    const t = ALL_TRACKS.find((x) => x.id === localStorage.getItem(TRACK_KEY))
    if (t) return t
  } catch {}
  return ALL_TRACKS[0] || null
}

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
  const volumeRef = useRef(volume)
  volumeRef.current = volume
  const [hintOn, setHintOn] = useState(false)
  const [cur, setCur] = useState(savedTrack) // текущий трек плейлиста
  const [panel, setPanel] = useState(false) // список станций и треков
  const curId = useRef(cur?.id)
  // src задаём сами (при смене трека). Если отдать его React, повторная запись src перезапускает загрузку и обрывает play()
  const firstSrc = useRef(cur?.src)
  // Шина: трек -> выравнивание громкости трека -> мягкий лимитер -> общая громкость -> динамики.
  // Через Web Audio громкость работает и на iPhone, где у <audio> её менять нельзя.
  const bus = useRef(null)
  curId.current = cur?.id
  const [arrowX, setArrowX] = useState(0) // положение стрелки-подсказки над луной-ползунком (телефон)
  const [drag, setDrag] = useState(null) // { ox }: пока тянут громкость, луна увеличивается в большой регулятор
  const pop = useRef(null)
  const start = useRef({ x: 0, v: 0, big: false })

  // Подсказка со стрелкой «тут выключить звук»: один раз за сессию, после вступления
  useEffect(() => {
    try { if (sessionStorage.getItem(HINT_KEY)) return } catch {}
    const root = document.documentElement
    const busy = () => root.classList.contains('is-loading') || root.classList.contains('intro')
    let t1, t2, mo
    const show = () => {
      t1 = setTimeout(() => {
        setHintOn(true)
        try { sessionStorage.setItem(HINT_KEY, '1') } catch {}
        t2 = setTimeout(() => setHintOn(false), 10000)
      }, 2400)
    }
    if (busy()) {
      mo = new MutationObserver(() => { if (!busy()) { mo.disconnect(); show() } })
      mo.observe(root, { attributes: true, attributeFilter: ['class'] })
    } else show()
    return () => { clearTimeout(t1); clearTimeout(t2); mo?.disconnect() }
  }, [])

  useEffect(() => {
    applyLevels()
    try { localStorage.setItem(STORAGE_KEY, String(volume)) } catch {}
  }, [volume])

  // Автозапуск с начала. Браузеры блокируют звук до первого действия пользователя,
  // поэтому при отказе трек стартует с первого клика, нажатия клавиши или касания.
  // Если музыка уже играет в другой вкладке, здесь она сама не запускается.
  useEffect(() => {
    const a = audio.current
    if (!a) return
    const userPaused = () => { try { return sessionStorage.getItem(PAUSED_KEY) === '1' } catch { return false } }
    const onMeta = () => {
      try {
        const [id, sec] = (localStorage.getItem(TIME_KEY) || '').split('|')
        const t = parseFloat(sec)
        if (id === curId.current && t > 0 && t < a.duration - 1) a.currentTime = t
      } catch {}
    }
    const onPlay = () => { setPlaying(true); wakeBus() }
    const onPause = () => setPlaying(false)
    a.addEventListener('loadedmetadata', onMeta)
    a.addEventListener('play', onPlay)
    a.addEventListener('pause', onPause)
    if (a.readyState >= 1) onMeta()

    const events = ['pointerdown', 'keydown', 'touchstart']
    const resume = () => { const b = bus.current; if (b && b.ctx.state === 'suspended') b.ctx.resume().catch(() => {}) }
    events.forEach((ev) => window.addEventListener(ev, resume, true))
    const unlock = (e) => {
      if (e.target.closest?.('.radio__btn') || userPaused() || otherTabOwns()) return
      claim()
      a.play().then(off).catch(() => {})
    }
    const off = () => events.forEach((ev) => window.removeEventListener(ev, unlock, true))

    // Музыка стартует, как только закончились загрузка и вступление. Если браузер не разрешает звук,
    // слушаем первое действие пользователя и включаем тогда.
    events.forEach((ev) => window.addEventListener(ev, unlock, true))
    a.addEventListener('play', off)
    const attempt = () => {
      if (userPaused() || otherTabOwns()) return
      claim()
      a.play().then(off).catch(() => {})
    }
    const root = document.documentElement
    const loading = () => root.classList.contains('is-loading') || root.classList.contains('intro')
    let mo
    if (loading()) {
      mo = new MutationObserver(() => { if (!loading()) { mo.disconnect(); attempt() } })
      mo.observe(root, { attributes: true, attributeFilter: ['class'] })
    } else attempt()

    // вкладка-владелец обновляет метку; если музыку забрала другая вкладка, здесь ставим на паузу
    const beat = setInterval(() => { if (isOwner()) claim() }, 1500)
    const onStorage = (e) => {
      if (e.key !== OWNER_KEY) return
      const o = readOwner()
      if (o && o.id !== TAB_ID && !a.paused) a.pause()
    }
    window.addEventListener('storage', onStorage)
    const release = () => { try { if (isOwner()) localStorage.removeItem(OWNER_KEY) } catch {} }
    window.addEventListener('pagehide', release)

    const save = () => { try { if (a.currentTime > 0) localStorage.setItem(TIME_KEY, `${curId.current}|${a.currentTime}`) } catch {} }
    const id = setInterval(save, 2000)
    window.addEventListener('pagehide', save)
    return () => {
      off()
      mo?.disconnect()
      a.removeEventListener('play', off)
      clearInterval(id)
      clearInterval(beat)
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('pagehide', release)
      window.removeEventListener('pagehide', save)
      a.removeEventListener('loadedmetadata', onMeta)
      a.removeEventListener('play', onPlay)
      a.removeEventListener('pause', onPause)
      events.forEach((ev) => window.removeEventListener(ev, resume, true))
    }
  }, [])

  // стрелка-подсказка смотрит ровно на луну-ползунок, где бы та ни стояла
  useEffect(() => {
    if (!hintOn || !dial.current) return
    const r = dial.current.getBoundingClientRect()
    setArrowX(Math.max(0, r.left + r.width / 2 - 12 - 13.5))
  }, [hintOn])

  const trackOf = () => ALL_TRACKS.find((x) => x.id === curId.current)
  const applyLevels = (tr = trackOf()) => {
    const a = audio.current
    if (!a) return
    const g = tr?.gain ?? 1
    const b = bus.current
    if (b) {
      a.volume = 1
      b.track.gain.setTargetAtTime(g, b.ctx.currentTime, 0.05)
      b.master.gain.setTargetAtTime(volumeRef.current, b.ctx.currentTime, 0.05)
    } else {
      a.volume = Math.min(1, volumeRef.current * g)
    }
  }
  // шина создаётся при первом запуске звука (браузеры дают её включить только после действия пользователя)
  const wakeBus = () => {
    const a = audio.current
    const AC = window.AudioContext || window.webkitAudioContext
    if (!a || !AC) return
    if (!bus.current) {
      try {
        const ctx = new AC()
        const src = ctx.createMediaElementSource(a)
        const track = ctx.createGain()
        const limit = ctx.createDynamicsCompressor()
        limit.threshold.value = -3
        limit.knee.value = 3
        limit.ratio.value = 12
        limit.attack.value = 0.003
        limit.release.value = 0.25
        const master = ctx.createGain()
        src.connect(track).connect(limit).connect(master).connect(ctx.destination)
        bus.current = { ctx, track, master }
        applyLevels()
      } catch { bus.current = null; return }
    }
    if (bus.current.ctx.state === 'suspended') bus.current.ctx.resume().catch(() => {})
  }

  // переключение треков: плейлист идёт по кругу по всем станциям, в панели можно выбрать любой
  const replay = () => { const a = audio.current; if (a) { a.currentTime = 0; a.play().catch(() => {}) } }
  const pick = (tr) => {
    const a = audio.current
    if (!a || !tr) return
    try { localStorage.setItem(TRACK_KEY, tr.id); sessionStorage.removeItem(PAUSED_KEY) } catch {}
    claim()
    curId.current = tr.id
    setCur(tr)
    applyLevels(tr)
    a.src = tr.src // подмена до рендера, чтобы play() сразу играл новый трек
    a.currentTime = 0
    a.play().catch(() => {})
  }
  const go = (d) => {
    if (ALL_TRACKS.length < 2) return replay()
    const i = ALL_TRACKS.findIndex((x) => x.id === curId.current)
    pick(ALL_TRACKS[(i + d + ALL_TRACKS.length) % ALL_TRACKS.length])
  }

  useEffect(() => {
    if (!panel) return
    const close = (e) => { if (e.key === 'Escape' || (e.type === 'pointerdown' && !e.target.closest?.('.radio'))) setPanel(false) }
    window.addEventListener('keydown', close)
    window.addEventListener('pointerdown', close)
    return () => { window.removeEventListener('keydown', close); window.removeEventListener('pointerdown', close) }
  }, [panel])

  const toggle = () => {
    const a = audio.current
    if (!a) return
    if (a.paused) {
      try { sessionStorage.removeItem(PAUSED_KEY) } catch {}
      claim() // нажали ▶ здесь: музыка переезжает в эту вкладку, в остальных встанет на паузу
      a.play().catch(() => {})
    } else {
      try { sessionStorage.setItem(PAUSED_KEY, '1') } catch {}
      a.pause()
    }
  }

  // громкость = доля света на луне: слева 0 (новолуние), справа 1 (полнолуние)
  const snap = (v) => Math.round(Math.min(1, Math.max(0, v)) * 20) / 20
  const fromDial = (e) => {
    const r = dial.current.getBoundingClientRect()
    return snap((e.clientX - r.left) / r.width)
  }
  // На телефоне маленькую луну неудобно двигать пальцем: пока тянут, она «выезжает» крупным регулятором,
  // и громкость меняется относительно того места, где начали
  const onDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    const v = fromDial(e)
    setVolume(v)
    const big = e.pointerType === 'touch' || window.matchMedia('(max-width: 900px)').matches
    start.current = { x: e.clientX, v, big }
    if (big) {
      const r = dial.current.getBoundingClientRect()
      const w = Math.min(320, window.innerWidth - 32)
      setDrag({ ox: r.left + r.width / 2 - (window.innerWidth - w) / 2 })
    }
  }
  const onMove = (e) => {
    if (!e.buttons) return
    const s = start.current
    if (s.big && pop.current) setVolume(snap(s.v + (e.clientX - s.x) / (pop.current.getBoundingClientRect().width * 0.7)))
    else setVolume(fromDial(e))
  }
  const onUp = () => setDrag(null)
  const onKey = (e) => {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 0.05 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -0.05 : 0
    if (!step) return
    e.preventDefault()
    setVolume((v) => Math.round(Math.min(1, Math.max(0, v + step)) * 20) / 20)
  }

  return (
    <div className={`radio ${playing ? 'radio--on' : ''}`} onPointerDown={() => setHintOn(false)}>
      {hintOn && (
        <div className="radio__hint" role="status" style={{ '--ax': `${arrowX}px` }}>
          <svg viewBox="0 0 9 9" width="27" height="27" shapeRendering="crispEdges" aria-hidden="true">
            <rect x="4" y="0" width="1" height="1" fill="#E3FFF1" />
            <rect x="3" y="1" width="3" height="1" fill="#8AFFC4" />
            <rect x="2" y="2" width="5" height="1" fill="#4DFFA0" />
            <rect x="1" y="3" width="7" height="1" fill="#4DFFA0" />
            <rect x="3" y="4" width="3" height="5" fill="#2FD68A" />
          </svg>
          <span>{playing ? t.radioHintOn : t.radioHintOff}</span>
        </div>
      )}
      <audio ref={audio} src={firstSrc.current} preload="none" onEnded={() => go(1)} />
      <button className="radio__btn" onClick={toggle} aria-label={playing ? t.radioPause : t.radioPlay} title={playing ? t.radioPause : t.radioPlay}>
        <svg viewBox="0 0 8 8" width="14" height="14" shapeRendering="crispEdges" aria-hidden="true">
          {playing
            ? <><rect x="1" y="1" width="2" height="6" /><rect x="5" y="1" width="2" height="6" /></>
            : <><rect x="2" y="1" width="1" height="6" /><rect x="3" y="2" width="1" height="4" /><rect x="4" y="2" width="1" height="4" /><rect x="5" y="3" width="1" height="2" /></>}
        </svg>
      </button>
      {ALL_TRACKS.length > 0 && (
        <button className={`radio__list ${panel ? 'on' : ''}`} onClick={() => setPanel((p) => !p)} aria-label={t.radioMenu} aria-expanded={panel} title={t.radioMenu}>
          <svg viewBox="0 0 8 8" width="14" height="14" shapeRendering="crispEdges" aria-hidden="true">
            <rect x="0" y="1" width="8" height="1" /><rect x="0" y="3" width="8" height="1" /><rect x="0" y="5" width="5" height="1" /><rect x="6" y="5" width="2" height="2" />
          </svg>
        </button>
      )}
      <div className="radio__info">
        <b>{STATIONS.find((s) => s.tracks.includes(cur))?.name || 'MOON.FM'}</b>
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
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={onKey}
      >
        <PixelMoon lit={volume} size={34} flip flat />
      </div>
      {panel && (
        <div className="radio__panel" role="dialog" aria-label={t.radioMenu}>
          <div className="radio__ptop">
            <b>MOON.FM</b>
            <span>
              <button onClick={() => go(-1)} aria-label={t.radioPrev} title={t.radioPrev}>◂</button>
              <button onClick={() => go(1)} aria-label={t.radioNext} title={t.radioNext}>▸</button>
            </span>
          </div>
          {STATIONS.map((s) => (
            <div key={s.id} className="radio__st">
              {STATIONS.length > 1 && <p>{s.name}<em>{s.tracks.length}</em></p>}
              {s.tracks.map((tr) => (
                <button key={tr.id} className={tr.id === cur?.id ? 'on' : ''} onClick={() => pick(tr)}>
                  <i aria-hidden="true">{tr.id === cur?.id && playing ? '♪' : '▸'}</i><span>{tr.title}{tr.artist && <small>{tr.artist}</small>}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
      {drag && (
        <div className="radio__pop" ref={pop} style={{ '--ox': `${drag.ox}px` }} aria-hidden="true">
          <PixelMoon lit={volume} size={150} flip flat />
          <b>{Math.round(volume * 100)}%</b>
          <span className="radio__ticks">{Array.from({ length: 21 }, (_, i) => <i key={i} className={i / 20 <= volume + 0.001 ? 'on' : ''} />)}</span>
        </div>
      )}
    </div>
  )
}
