import { useLang } from '../i18n'
import { CONFIG } from '../lib/config'
import { SocialLinks } from './Socials'

export default function Footer() {
  const { t } = useLang()
  return (
    <footer className="footer">
      <div className="container footer__row">
        <div className="footer__main">
          <SocialLinks />
          <p>{t.disc}</p>
        </div>
        <span>© 2026 {CONFIG.name}</span>
      </div>
    </footer>
  )
}
