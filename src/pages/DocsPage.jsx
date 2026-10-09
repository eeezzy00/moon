import { useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n'
import { CONFIG } from '../lib/config'
import { useReveal } from '../hooks/useReveal'
import { useClickSfx } from '../hooks/useClickSfx'
import Backdrop from '../components/Backdrop'
import CursorTrail from '../components/CursorTrail'
import SplitText from '../components/SplitText'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Contracts from '../components/Contracts'
import Faq from '../components/Faq'

const file = (i, id) => `${String(i).padStart(2, '0')}_${id}.md`

function Extra({ type }) {
  const { t } = useLang()
  const d = t.docs
  if (type === 'phases') {
    return (
      <table className="table">
        <thead><tr><th>{d.phasesHead[0]}</th><th>{d.phasesHead[1]}</th></tr></thead>
        <tbody>{t.phl.map((name, i) => <tr key={name}><td>{i * CONFIG.phaseStep} GRAM</td><td>{name}</td></tr>)}</tbody>
      </table>
    )
  }
  if (type === 'chapters') {
    return (
      <table className="table">
        <thead><tr>{d.chaptersHead.map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {d.chapters.map(([ph, g, ch, st], i) => (
            <tr key={ch} className={i === 0 ? '' : 'is-locked'}><td>{ph}</td><td>{g}</td><td>{ch}</td><td>{i === 0 ? `[x] ${st}` : `[ ] ${st}`}</td></tr>
          ))}
        </tbody>
      </table>
    )
  }
  if (type === 'tokenomics') {
    return (
      <table className="table">
        <tbody>{d.tokenomics.map(([k, v]) => <tr key={k}><td>{k}</td><td>{v}</td></tr>)}</tbody>
      </table>
    )
  }
  if (type === 'links') {
    const rows = [['Website', window.location.host, '/'], ['X', 'x.com/Moonaiofficial8', CONFIG.socials.x], ['Telegram', t.tgEarly, CONFIG.socials.telegram], ['Launchpad', 'moon.cx', CONFIG.launchUrl]]
    return (
      <table className="table">
        <thead><tr><th>{d.linksHead[0]}</th><th>{d.linksHead[1]}</th></tr></thead>
        <tbody>{rows.map(([k, label, href]) => <tr key={k}><td>{k}</td><td><a href={href} target={href === '/' ? undefined : '_blank'} rel="noreferrer">{label}</a></td></tr>)}</tbody>
      </table>
    )
  }
  if (type === 'commands') {
    return (
      <table className="table table--cmd">
        <thead><tr><th>{d.commandsHead[0]}</th><th>{d.commandsHead[1]}</th></tr></thead>
        <tbody>{d.commands.map(([c, what]) => <tr key={c}><td>{c}</td><td>{what}</td></tr>)}</tbody>
      </table>
    )
  }
  if (type === 'glossary') {
    return <dl className="gloss">{d.glossary.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
  }
  if (type === 'faq') {
    // адреса контрактов живут в конце FAQ
    return (
      <>
        <Faq bare />
        <h3 id="contracts" className="doc-sub">{t.ctH}</h3>
        <Contracts bare />
      </>
    )
  }
  return null
}

// Документация в виде терминала: окно с панелью, дерево файлов слева, разделы как вывод `cat file.md`
export default function DocsPage() {
  const { t, lang } = useLang()
  const d = t.docs

  useEffect(() => { document.title = `${d.title} · ${CONFIG.name}` }, [lang, d.title])
  useReveal()
  useClickSfx()

  // подсветка текущего файла в дереве: активен последний раздел, чей верх прошёл линию в трети экрана.
  // После клика по файлу или доп. панели подсветка на время «замораживается», чтобы прыжок не переключал её.
  const [active, setActive] = useState(d.sections[0].id)
  const lockUntil = useRef(0)
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      if (performance.now() < lockUntil.current) return
      const line = window.innerHeight * 0.33
      let cur = d.sections[0].id
      for (const s of d.sections) {
        const el = document.getElementById(s.id)
        if (el && el.getBoundingClientRect().top <= line) cur = s.id
      }
      setActive(cur)
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [d.sections])

  const go = (e, id, more = false) => {
    e.preventDefault()
    const target = document.getElementById(more ? `${id}-more` : id)
    if (!target) return
    if (more) target.open = true
    setActive(id)
    lockUntil.current = performance.now() + 1400 // пока идёт плавная прокрутка, подсветку не трогаем
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    history.replaceState(null, '', `#${target.id}`)
  }

  return (
    <>
      <Backdrop />
      <Header docs />
      <main className="container docs">
        <div className="dterm">
          <div className="dterm__bar">
            <span className="term__dots"><i /><i /><i /></span>
            <span className="dterm__title">MOON_AI://docs · {lang}</span>
            <a className="dterm__back" href="/">{t.docsBack}</a>
          </div>

          <div className="dterm__grid">
            <aside className="docs__toc">
              <p className="dterm__path">~/moon-ai/docs/</p>
              <nav>
                {d.sections.map((s, i) => (
                  <div key={s.id} className="dterm__node">
                    <a href={`#${s.id}`} className={active === s.id ? 'on' : ''} onClick={(e) => go(e, s.id)}>
                      <span className="dterm__fname">{file(i, s.id)}</span>
                      <span className="dterm__ftitle">{s.title}</span>
                    </a>
                    {s.more && active === s.id && (
                      <a href={`#${s.id}-more`} className="dterm__sub" onClick={(e) => go(e, s.id, true)}>
                        <span className="dterm__branch">└─</span> man_{s.id} <span className="dterm__ftitle">· {d.moreLabel}</span>
                      </a>
                    )}
                  </div>
                ))}
              </nav>
            </aside>

            <article className="docs__body">
              <header className="docs__head">
                <div className="dcmd"><span className="dcmd__ps">moon@docs:~$</span> cat README.md</div>
                <SplitText key={d.title} as="h1" className="docs__h1" text={d.title} delay={0.1} />
                <p className="lead docs__intro">{d.intro}</p>
              </header>

              {d.sections.map((s, i) => (
                <section key={s.id} id={s.id} className="doc-sec">
                  <div className="dcmd"><span className="dcmd__ps">moon@docs:~$</span> cat {file(i, s.id)}</div>
                  <h2>{s.title}</h2>
                  {s.p?.map((p, j) => <p key={j}>{p}</p>)}
                  {s.extra && <Extra type={s.extra} />}
                  {s.ul && <ul>{s.ul.map((li) => <li key={li}>{li}</li>)}</ul>}
                  {s.more && (
                    <details className="dmore" id={`${s.id}-more`}>
                      <summary><span className="dcmd__ps">$</span> man {s.id} <span className="dmore__hint">· {d.moreLabel}</span></summary>
                      {s.more.map((m) => <p key={m}>{m}</p>)}
                    </details>
                  )}
                  {s.tbd && (
                    <div className="dtbd">
                      <span className="dtbd__k">// TODO · {d.tbdLabel}</span>
                      <ul>{s.tbd.map((x) => <li key={x}>{x}</li>)}</ul>
                    </div>
                  )}
                </section>
              ))}

              <div className="dcmd dcmd--end"><span className="dcmd__ps">moon@docs:~$</span> <i className="caret" /></div>
            </article>
          </div>
        </div>
      </main>
      <Footer />
      <CursorTrail />
    </>
  )
}
