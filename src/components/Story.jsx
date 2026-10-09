import { useEffect, useRef } from 'react'
import { useLang } from '../i18n'
import { CONFIG } from '../lib/config'

const MAX_TILT = 16 // градусов

// Картинка главы: пиксельный кадр в тонкой рамке со светом от своих пикселей.
// При наведении наклоняется в сторону курсора, по ней скользит металлический блик (как карточки в Steam).
// Курсор считается по неподвижной обёртке, а наклон плавно догоняет цель: так карточка не дёргается.
function Shot({ n, locked = false, size = 256 }) {
  const src = `/story/${n}.png`
  const card = useRef(null)
  const st = useRef({ tx: 0, ty: 0, x: 0, y: 0, gx: 50, gy: 50, on: 0, raf: 0 })

  const loop = () => {
    const s = st.current
    s.x += (s.tx - s.x) * 0.16
    s.y += (s.ty - s.y) * 0.16
    const el = card.current
    if (el) {
      el.style.setProperty('--rx', `${s.y.toFixed(2)}deg`)
      el.style.setProperty('--ry', `${s.x.toFixed(2)}deg`)
      el.style.setProperty('--gx', `${s.gx.toFixed(1)}%`)
      el.style.setProperty('--gy', `${s.gy.toFixed(1)}%`)
    }
    const moving = Math.abs(s.tx - s.x) > 0.02 || Math.abs(s.ty - s.y) > 0.02
    s.raf = moving || s.on ? requestAnimationFrame(loop) : 0
  }
  const kick = () => { if (!st.current.raf) st.current.raf = requestAnimationFrame(loop) }
  useEffect(() => () => cancelAnimationFrame(st.current.raf), [])

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect() // обёртка не наклоняется, координаты стабильны
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
    const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))
    const s = st.current
    s.tx = (x - 0.5) * 2 * MAX_TILT
    s.ty = (0.5 - y) * 2 * MAX_TILT
    s.gx = x * 100
    s.gy = y * 100
    if (!s.on) { s.on = 1; card.current?.classList.add('is-tilting') }
    kick()
  }
  const onLeave = () => {
    const s = st.current
    s.tx = 0
    s.ty = 0
    s.on = 0
    card.current?.classList.remove('is-tilting')
    kick()
  }

  return (
    <div className="tilt-wrap" onPointerMove={onMove} onPointerLeave={onLeave}>
      <div ref={card} className={`portrait simg tilt ${locked ? 'simg--locked' : ''}`} style={{ '--size': `${size}px` }}>
        <img className="simg__glow" src={src} alt="" aria-hidden="true" />
        <img className="simg__main" src={src} alt="" width="64" height="64" />
        {locked && <span className="simg__q" aria-hidden="true">?</span>}
        <i className="tilt__glare" aria-hidden="true" />
      </div>
    </div>
  )
}

// Главы истории по фазам луны. Глава 0 открыта всегда, глава 1 открывается на 500 GRAM.
export default function Story({ gram }) {
  const { t } = useLang()
  const s = t.story
  const next = CONFIG.phaseStep
  const unlocked = gram >= next

  return (
    <section id="story" className="container section">
      <p className="kicker">{s.k}</p>
      <h2>{s.title}</h2>
      <p className="text">{s.sub}</p>

      <blockquote className="prologue">
        <span className="prologue__k">{s.prologueK}</span>
        {s.prologue.map((p) => <p key={p}>{p}</p>)}
      </blockquote>

      <div className="chapter">
        <span className="chapter__tag">0 GRAM · {t.phl[0].toUpperCase()}</span>
        <h3 className="chapter__title">{s.ch0}</h3>
      </div>

      <div className="scenes">
        {s.scenes.map((sc, i) => (
          <article className={`scene ${i % 2 ? 'scene--rev' : ''}`} key={sc.title}>
            <Shot n={i + 1} />
            <div className="scene__text">
              <span className="scene__tag">{String(i + 1).padStart(2, '0')} · {sc.tag}</span>
              <h3>{sc.title}</h3>
              {sc.p.map((p, j) => <p key={j}>{p}</p>)}
              {sc.points && <ul>{sc.points.map((x) => <li key={x}>{x}</li>)}</ul>}
            </div>
          </article>
        ))}
      </div>

      <div className="chapter chapter--next">
        <span className="chapter__tag">{next} GRAM · {t.phl[1].toUpperCase()}</span>
        <h3 className="chapter__title">{unlocked ? s.ch1 : s.ch1Locked}</h3>
      </div>
      <article className={`scene scene--next ${unlocked ? '' : 'scene--locked'}`}>
        <Shot n={4} locked={!unlocked} />
        <div className="scene__text">
          <span className="scene__tag">{unlocked ? s.next.tagOpen : s.next.tagLocked}</span>
          <h3>{unlocked ? s.next.titleOpen : s.next.titleLocked}</h3>
          <p>{unlocked ? s.next.open : s.next.locked(next)}</p>
        </div>
      </article>
      <div className="story-end" aria-hidden="true" />
    </section>
  )
}
