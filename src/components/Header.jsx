import { useEffect, useState } from 'react'
import { useLang } from '../i18n'
import { CONFIG } from '../lib/config'
import RadioPlayer from './RadioPlayer'
import { SocialIcons } from './Socials'

// docs=true: шапка на странице документации, якоря ведут на главную
export default function Header({ docs = false, gallery = false }) {
  const { t, lang, setLang } = useLang()
  const p = docs || gallery ? '/' : ''
  // на телефоне навигация прячется в меню-бургер
  const [menu, setMenu] = useState(false)
  useEffect(() => {
    if (!menu) return
    const onKey = (e) => e.key === 'Escape' && setMenu(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menu])
  return (
    <header className="header">
      <div className="container header__row">
        <a href="/" className="logo">{CONFIG.name}</a>
        <nav className={`nav ${menu ? 'nav--open' : ''}`} onClick={(e) => e.target.closest('a') && setMenu(false)}>
          <a href={`${p}#about`}>{t.navAbout}</a>
          <a href={`${p}#phases`}>{t.navPhases}</a>
          {gallery
            ? <a href="/gallery/" aria-current="page" className="nav__on">{t.navGallery}</a>
            : <a href={`${p}#gallery`}>{t.navGallery}</a>}
          <a href={`${p}#luna`}>LUNA.AI</a>
          <a href={`${p}#token`}>{t.navToken}</a>
          {docs
            ? <a href="/docs/" aria-current="page" className="nav__on">{t.docsNav}</a>
            : <a href="/docs/" target="_blank" rel="noopener">{t.docsNav} ↗</a>}
          <div className="nav__extra">
            <SocialIcons />
            <a className="btn btn--sm" href={CONFIG.launchUrl} target="_blank" rel="noreferrer">{t.buy}</a>
          </div>
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
          <a className="btn btn--sm header__buy" href={CONFIG.launchUrl} target="_blank" rel="noreferrer">{t.buy}</a>
          <button className={`burger ${menu ? 'burger--on' : ''}`} onClick={() => setMenu((m) => !m)} aria-label="Menu" aria-expanded={menu}>
            <i /><i /><i />
          </button>
        </div>
      </div>
    </header>
  )
}
