import { useLang } from '../i18n'
import { CONFIG } from '../lib/config'
import RadioPlayer from './RadioPlayer'
import { SocialIcons } from './Socials'

// docs=true: шапка на странице документации, якоря ведут на главную
export default function Header({ docs = false }) {
  const { t, lang, setLang } = useLang()
  const p = docs ? '/' : ''
  return (
    <header className="header">
      <div className="container header__row">
        <a href="/" className="logo">{CONFIG.name}</a>
        <nav className="nav">
          <a href={`${p}#about`}>{t.navAbout}</a>
          <a href={`${p}#phases`}>{t.navPhases}</a>
          <a href={`${p}#luna`}>LUNA.AI</a>
          <a href={`${p}#token`}>{t.navToken}</a>
          {docs
            ? <a href="/docs/" aria-current="page" className="nav__on">{t.docsNav}</a>
            : <a href="/docs/" target="_blank" rel="noopener">{t.docsNav} ↗</a>}
        </nav>
        <div className="header__right">
          <SocialIcons />
          <RadioPlayer />
          <div className="lang" role="group" aria-label="Language">
            {['ru', 'en'].map((l) => (
              <button key={l} className={l === lang ? 'on' : ''} onClick={() => setLang(l)}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <a className="btn btn--sm" href={CONFIG.launchUrl} target="_blank" rel="noreferrer">{t.buy}</a>
        </div>
      </div>
    </header>
  )
}
