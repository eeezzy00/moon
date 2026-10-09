import { useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n'
import { EVENTS, HELP, UNKNOWN, parseCommand, pick } from '../lib/lunaEvents'
import { playBlip } from '../lib/sfx'
import { phaseIndex, percent } from '../lib/phases'
import LunaSprite from './LunaSprite'
import PixelMoon from './PixelMoon'

const TYPE_MS = 24 // скорость «печати» ответа

// «Мозг» LUNA (сотни реплик на двух языках) грузится отдельным файлом только при открытии чата
let brainModule = null
const loadBrain = () => (brainModule ? Promise.resolve(brainModule) : import('../lib/luna').then((m) => (brainModule = m)))
const BLIP = { sad: 420, joy: 860, oxygen: 300, confused: 560 } // высота «голоса» при печати

// Эффекты вокруг портрета для каждого события
function MoodFx({ mood, dur }) {
  if (mood === 'sad') return <div className="mfx mfx--sad">{Array.from({ length: 12 }, (_, i) => <i key={i} style={{ left: `${6 + i * 8}%`, animationDelay: `${(i * 0.37) % 1.6}s` }} />)}</div>
  if (mood === 'confused') return <div className="mfx mfx--confused">{['?', '?', '!'].map((c, i) => <b key={i} style={{ animationDelay: `${i * 0.25}s` }}>{c}</b>)}</div>
  if (mood === 'joy') return <div className="mfx mfx--joy">{Array.from({ length: 14 }, (_, i) => <i key={i} style={{ '--a': `${(i / 14) * 360}deg`, animationDelay: `${(i % 3) * 0.12}s` }} />)}</div>
  if (mood === 'oxygen') return (
    <div className="mfx mfx--oxygen">
      <span>O2</span>
      <div className="mfx__tank"><i style={{ animationDuration: `${dur * 0.55}ms` }} /></div>
    </div>
  )
  return null
}

// Чат-терминал в правой панели: страница остаётся видна, LUNA.AI выезжает справа.
export default function LunaChat({ open, onClose, gram }) {
  const { t, lang } = useLang()
  // элемент: { me, sys, text, n } где n — сколько символов уже напечатано
  const [log, setLog] = useState([])
  const [thinking, setThinking] = useState(false)
  const [value, setValue] = useState('')
  const [mood, setMood] = useState(null)
  const [sprites, setSprites] = useState({}) // какие спрайты эмоций загружены (public/luna-<mood>.png)
  const box = useRef(null)
  const input = useRef(null)
  const timer = useRef(null)
  const moodTimer = useRef(null)
  const idleCount = useRef(0) // сколько реплик подряд LUNA сказала сама
  const brain = useRef(null) // память LUNA: имя собеседника, настроение, прошлые темы

  useEffect(() => { setLog([]); setThinking(false); clearTimeout(timer.current); brain.current = brainModule ? brainModule.createState() : null }, [lang])
  // заранее подгружаем «мозг», как только чат открыли
  useEffect(() => { if (open) loadBrain() }, [open])
  // приветствие печатается при первом открытии
  useEffect(() => { if (open && log.length === 0) setLog([{ text: t.hello, n: 0 }]) }, [open, log.length, t])
  useEffect(() => () => { clearTimeout(timer.current); clearTimeout(moodTimer.current) }, [])

  // проверяем, какие спрайты эмоций уже лежат в public/
  useEffect(() => {
    Object.keys(EVENTS).forEach((m) => {
      const im = new Image()
      im.onload = () => setSprites((s) => ({ ...s, [m]: true }))
      im.src = `/luna-${m}.png`
    })
  }, [])

  // посимвольная печать последнего ответа LUNA с тихим «голосом»
  const last = log[log.length - 1]
  const printing = Boolean(last && !last.me && !last.sys && last.n < last.text.length)
  const typeMs = mood ? EVENTS[mood].typeMs : TYPE_MS
  useEffect(() => {
    if (!printing) return
    const id = setTimeout(() => {
      const ch = last.text[last.n]
      if (open && ch && ch.trim() && last.n % 2 === 0) playBlip(BLIP[mood] ?? 640)
      setLog((l) => l.map((m, i) => (i === l.length - 1 ? { ...m, n: Math.min(m.text.length, m.n + 1) } : m)))
    }, typeMs)
    return () => clearTimeout(id)
  }, [printing, last?.n, typeMs, mood, open, last?.text])

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

  const push = (item) => setLog((l) => [...l, item].slice(-30))
  const say = (text) => push({ text, n: 0 })

  // событие-эмоция: реплика, звук, эффект вокруг портрета, потом возврат в норму
  const runEvent = (id) => {
    const e = EVENTS[id]
    const copy = e[lang] || e.ru
    clearTimeout(moodTimer.current)
    setMood(id)
    e.sound()
    if (id === 'oxygen') push({ sys: true, text: 'O2 LOW · 12%' })
    say(pick(copy.lines))
    moodTimer.current = setTimeout(() => {
      setMood(null)
      if (copy.end) { push({ sys: true, text: 'O2 OK · 100%' }); say(copy.end) }
    }, e.dur)
  }

  const send = (text) => {
    const q = text.trim()
    if (!q || thinking || printing) return
    push({ me: true, text: q, n: q.length })
    setValue('')
    idleCount.current = 0

    if (q.startsWith('/')) {
      const cmd = parseCommand(q)
      timer.current = setTimeout(() => {
        if (cmd === 'help') say(HELP[lang] || HELP.ru)
        else if (cmd) runEvent(cmd)
        else say(UNKNOWN[lang] || UNKNOWN.ru)
      }, 300)
      return
    }

    setThinking(true)
    loadBrain().then((m) => {
      if (!brain.current) brain.current = m.createState()
      const res = m.reply(q, brain.current, lang, t, gram)
      timer.current = setTimeout(() => {
        say(res.text)
        setThinking(false)
      }, res.delay)
    })
  }

  // если собеседник молчит, LUNA сама говорит что-нибудь интересное (до 4 реплик подряд)
  const busyNow = thinking || printing
  useEffect(() => {
    if (!open || busyNow || idleCount.current >= 4) return
    const id = setTimeout(() => {
      loadBrain().then((m) => {
        if (!brain.current) brain.current = m.createState()
        idleCount.current += 1
        say(m.idleLine(brain.current, lang, t, gram))
      })
    }, 24000 + Math.random() * 10000)
    return () => clearTimeout(id)
  }, [open, busyNow, log.length, lang, t, gram])

  const phase = phaseIndex(gram)
  const talking = thinking || printing
  const busy = talking
  const ev = mood ? (EVENTS[mood][lang] || EVENTS[mood].ru) : null

  // подсказка команд, когда ввод начинается с «/»
  const showCmds = value.startsWith('/')
  const cmds = Object.values(EVENTS).map((e) => e[lang] || e.ru)
    .filter((c) => c.cmd.startsWith(value.toLowerCase()) || value === '/')

  return (
    <aside className={`lchat ${open ? 'lchat--open' : ''} ${mood ? `lchat--${mood}` : ''}`} role="dialog" aria-label="LUNA.AI" inert={open ? undefined : ''}>
      <i className="lchat__stars" />

      <div className="lchat__head">
        <div className="portrait lchat__ava">
          <LunaSprite scale={2} talking={talking} mood={mood && sprites[mood] ? mood : null} glow />
          <MoodFx mood={mood} dur={mood ? EVENTS[mood].dur : 0} />
        </div>
        <div className="lchat__info">
          <h2>LUNA.AI</h2>
          <p className="lchat__status"><i className="dot" /> {ev ? ev.status : talking ? '···' : t.online}</p>
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
            m.sys
              ? <div key={i} className="tline tline--sys tline--alert">SYS› {m.text}</div>
              : (
                <div key={i} className={`tline ${m.me ? 'tline--me' : 'tline--luna'}`}>
                  <b>{m.me ? `${t.you}›` : 'LUNA›'}</b> <span>{m.text.slice(0, m.n)}</span>
                  {!m.me && m.n < m.text.length && <i className="caret" />}
                </div>
              )
          ))}
          {thinking && <div className="tline tline--luna"><b>LUNA›</b> <span className="tdots"><i /><i /><i /></span></div>}
        </div>

        <div className="term__chips">
          {t.q.map((label) => (
            <button key={label} onClick={() => send(label)} disabled={busy}>{label}</button>
          ))}
        </div>

        <form className="term__form" onSubmit={(e) => { e.preventDefault(); send(value) }}>
          {showCmds && cmds.length > 0 && (
            <ul className="term__cmds">
              {cmds.map((c) => (
                <li key={c.cmd}><button type="button" onClick={() => send(c.cmd)} disabled={busy}><b>{c.cmd}</b> {c.label}</button></li>
              ))}
            </ul>
          )}
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
        <p className="term__foot">{t.chatFoot} · /help</p>
      </section>
    </aside>
  )
}
