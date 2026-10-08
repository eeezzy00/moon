import { useEffect, useState } from 'react'
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

function Extra({ type }) {
  const { t } = useLang()
  const d = t.docs
  if (type === 'phases') {
    return (
      <table className="table">
        <thead><tr><th>{d.phasesHead[0]}</th><th>{d.phasesHead[1]}</th></tr></thead>
        <tbody>
          {t.phl.map((name, i) => (
            <tr key={name}><td>{i * CONFIG.phaseStep} GRAM</td><td>{name}</td></tr>
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
  if (type === 'glossary') {
    return (
      <dl className="gloss">
        {d.glossary.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
      </dl>
    )
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

export default function DocsPage() {
  const { t, lang } = useLang()
  const d = t.docs

  useEffect(() => { document.title = `${d.title} · ${CONFIG.name}` }, [lang, d.title])
  useReveal()
  useClickSfx()

  // подсветка текущего раздела в оглавлении
  const [active, setActive] = useState(d.sections[0].id)
  useEffect(() => {
    const els = d.sections.map((s) => document.getElementById(s.id)).filter(Boolean)
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-30% 0px -60% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [d.sections])

  return (
    <>
      <Backdrop />
      <Header docs />
      <main className="container docs">
        <aside className="docs__toc">
          <a className="docs__back" href="/">{t.docsBack}</a>
          <p className="kicker">{t.docsOn}</p>
          <nav>
            {d.sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className={active === s.id ? 'on' : ''}>{s.title}</a>
            ))}
          </nav>
        </aside>

        <article className="docs__body">
          <header className="docs__head">
            <p className="kicker">{t.docsNav.toUpperCase()}</p>
            <SplitText key={d.title} as="h1" className="docs__h1" text={d.title} delay={0.1} />
            <p className="lead docs__intro">{d.intro}</p>
          </header>

          {d.sections.map((s) => (
            <section key={s.id} id={s.id} className="doc-sec">
              <h2>{s.title}</h2>
              {s.p?.map((p, i) => <p key={i}>{p}</p>)}
              {s.ul && <ul>{s.ul.map((li) => <li key={li}>{li}</li>)}</ul>}
              {s.extra && <Extra type={s.extra} />}
            </section>
          ))}
        </article>
      </main>
      <Footer />
      <CursorTrail />
    </>
  )
}
