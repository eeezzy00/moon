import { useLang } from '../i18n'
import { CONFIG } from '../lib/config'

// Схема связки сайта с лаунчпадом moon.cx
export default function Launchpad() {
  const { t } = useLang()
  return (
    <section id="launchpad" className="container section">
      <p className="kicker">{t.lpK}</p>
      <h2>{t.lpH}</h2>
      <p className="text">{t.lpP}</p>

      <div className="flow">
        {t.flow.map(([title, text], i) => (
          <div className="flow__item" key={title}>
            <div className="card">
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
            {i < t.flow.length - 1 && <span className="flow__arrow" aria-hidden="true">▶</span>}
          </div>
        ))}
      </div>

      <div className="note">
        <b>{t.lpNoteT}</b> {t.lpNote}{' '}
        <a href={CONFIG.docsUrl} target="_blank" rel="noreferrer">moon.cx/docs</a>
      </div>
    </section>
  )
}
