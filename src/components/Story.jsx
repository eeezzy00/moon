import { useLang } from '../i18n'
import { CONFIG } from '../lib/config'

// Картинка главы: пиксельный кадр в тонкой рамке со светом от своих пикселей
function Shot({ n, locked = false, size = 256 }) {
  const src = `/story/${n}.png`
  return (
    <div className={`portrait simg ${locked ? 'simg--locked' : ''}`} style={{ '--size': `${size}px` }}>
      <img className="simg__glow" src={src} alt="" aria-hidden="true" />
      <img className="simg__main" src={src} alt="" width="64" height="64" />
      {locked && <span className="simg__q" aria-hidden="true">?</span>}
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
