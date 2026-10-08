import { useLang } from '../i18n'

// Блок-приглашение в документацию (открывается в новой вкладке)
export default function DocsCta() {
  const { t } = useLang()
  return (
    <section id="docs" className="container section">
      <div className="cta">
        <div>
          <p className="kicker">{t.docsCtaK}</p>
          <h2>{t.docsCtaH}</h2>
          <p className="text">{t.docsCtaP}</p>
        </div>
        <div className="cta__btns">
          <a className="btn" href="/docs/" target="_blank" rel="noopener">{t.docsBtn}</a>
          <a className="btn btn--ghost" href="/docs/#faq" target="_blank" rel="noopener">{t.docsFaqBtn}</a>
        </div>
      </div>
    </section>
  )
}
