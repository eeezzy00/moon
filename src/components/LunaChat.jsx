import { useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n'
import { reply, createState, idleLine } from '../lib/luna'
import { phaseIndex, percent } from '../lib/phases'
import LunaSprite from './LunaSprite'
import PixelMoon from './PixelMoon'

const TYPE_MS = 24 // скорость «печати» ответа

// Чат-терминал в правой панели: страница остаётся видна, LUNA.AI выезжает справа.
export default function LunaChat({ open, onClose, gram }) {
  const { t, lang } = useLang()
  // элемент: { me, text, n } где n — сколько символов уже напечатано
  const [log, setLog] = useState([])
  const [thinking, setThinking] = useState(false)
  const [value, setValue] = useState('')
  const box = useRef(null)
  const input = useRef(null)
  const timer = useRef(null)
  const idleCount = useRef(0) // сколько реплик подряд LUNA сказала сама
  const brain = useRef(createState()) // память LUNA: имя собеседника, настроение, прошлые темы

  useEffect(() => { setLog([]); setThinking(false); clearTimeout(timer.current); brain.current = createState() }, [lang])
  // приветствие печатается при первом открытии
  useEffect(() => { if (open && log.length === 0) setLog([{ text: t.hello, n: 0 }]) }, [open, log.length, t])
  useEffect(() => () => clearTimeout(timer.current), [])

  // посимвольная печать последнего ответа LUNA
  const last = log[log.length - 1]
  const printing = Boolean(last && !last.me && last.n < last.text.length)
  useEffect(() => {
    if (!printing) return
    const id = setTimeout(() => {
      setLog((l) => l.map((m, i) => (i === l.length - 1 ? { ...m, n: Math.min(m.text.length, m.n + 1) } : m)))
    }, TYPE_MS)
    return () => clearTimeout(id)
  }, [printing, last?.n])

  useEffect(() => { if (box.current) box.current.scrollTop = box.current.scrollHeight }, [log, thinking, open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const f = setTimeout(() => input.current?.focus({ preventScroll: true }), 500)
    return () => {
      window.removeEventListener('keydown', onKey)
      clearTimeout(f)
    }
  }, [open, onClose])

  const send = (text) => {
    const q = text.trim()
    if (!q || thinking || printing) return
    setLog((l) => [...l, { me: true, text: q, n: q.length }].slice(-30))
    setValue('')
    idleCount.current = 0
    setThinking(true)
    const res = reply(q, brain.current, lang, t, gram)
    timer.current = setTimeout(() => {
      setLog((l) => [...l, { text: res.text, n: 0 }].slice(-30))
      setThinking(false)
    }, res.delay)
  }

  // если собеседник молчит, LUNA сама говорит что-нибудь интересное (до 4 реплик подряд)
  const busyNow = thinking || printing
  useEffect(() => {
    if (!open || busyNow || idleCount.current >= 4) return
    const id = setTimeout(() => {
      idleCount.current += 1
      setLog((l) => [...l, { text: idleLine(brain.current, lang, t, gram), n: 0 }].slice(-30))
    }, 24000 + Math.random() * 10000)
    return () => clearTimeout(id)
  }, [open, busyNow, log.length, lang, t, gram])

  const phase = phaseIndex(gram)
  const talking = thinking || printing
  const busy = talking

  return (
    <aside className={`lchat ${open ? 'lchat--open' : ''}`} role="dialog" aria-label="LUNA.AI" inert={open ? undefined : ''}>
      <i className="lchat__stars" />

      <div className="lchat__head">
        <div className="portrait lchat__ava">
          <LunaSprite scale={2} talking={talking} glow />
        </div>
        <div className="lchat__info">
          <h2>LUNA.AI</h2>
          <p className="lchat__status"><i className="dot" /> {talking ? '···' : t.online}</p>
          <div className="lchat__phase">
            <PixelMoon phase={phase} size={30} />
            <span><b>{t.phl[phase]}</b> · {percent(gram)}%</span>
          </div>
        </div>
        <button className="lchat__close" onClick={onClose} aria-label={t.chatClose} title={t.chatClose}>✕</button>
      </div>

      <section className="term">
        <i className="term__corners" aria-hidden="true" />
        <div className="term__bar">
          <span className="term__dots"><i /><i /><i /></span>
          <span className="term__title">LUNA.AI://{t.termTitle}</span>
          <span className="term__sig" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => <i key={i} className={talking ? 'on' : ''} style={{ animationDelay: `${i * 0.12}s` }} />)}
          </span>
        </div>

        <div className="term__body" ref={box} aria-live="polite">
          <div className="tline tline--sys">SYS› {t.sysLink} · {t.phl[phase].toUpperCase()}</div>
          {log.map((m, i) => (
            <div key={i} className={`tline ${m.me ? 'tline--me' : 'tline--luna'}`}>
              <b>{m.me ? `${t.you}›` : 'LUNA›'}</b> <span>{m.text.slice(0, m.n)}</span>
              {!m.me && m.n < m.text.length && <i className="caret" />}
            </div>
          ))}
          {thinking && <div className="tline tline--luna"><b>LUNA›</b> <span className="tdots"><i /><i /><i /></span></div>}
        </div>

        <div className="term__chips">
          {t.q.map((label) => (
            <button key={label} onClick={() => send(label)} disabled={busy}>{label}</button>
          ))}
        </div>

        <form className="term__form" onSubmit={(e) => { e.preventDefault(); send(value) }}>
          <label htmlFor="luna-input">{t.you}›</label>
          <input
            id="luna-input"
            ref={input}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={t.placeholder}
            maxLength={140}
            autoComplete="off"
          />
          <button className="btn btn--sm" type="submit" disabled={busy}>{t.send} ↵</button>
        </form>
        <p className="term__foot">{t.chatFoot}</p>
      </section>
    </aside>
  )
}
