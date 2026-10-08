import { useLang } from '../i18n'
import { CONFIG } from '../lib/config'

export default function Footer() {
  const { t } = useLang()
  return (
    <footer className="footer">
      <div className="container footer__row">
        <p>{t.disc}</p>
        <span>© 2026 {CONFIG.name}</span>
      </div>
    </footer>
  )
}
