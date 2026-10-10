import { useLang } from '../i18n'
import { CONFIG } from '../lib/config'
import { TgIcon, XIcon } from './Socials'

// Баннер-призыв в сообщество. Якорь #join — для ссылок из рекламы и постов (moonai.wiki/#join)
export default function JoinUs() {
  const { t } = useLang()
  return (
    <section id="join" className="container section">
      <p className="kicker">{t.joinK}</p>
      <div className="join">
        <div className="join__bg" aria-hidden="true" />
        <div className="join__body">
          <p className="join__title">JOIN US!</p>
          <p className="join__sub">{t.joinSub}</p>
          <p className="join__rule">{t.joinRule}</p>
          <div className="join__btns">
            <a className="btn join__btn" href={CONFIG.socials.telegram} target="_blank" rel="noreferrer"><TgIcon /> {t.joinTg}</a>
            <a className="btn btn--ghost join__btn" href={CONFIG.socials.x} target="_blank" rel="noreferrer"><XIcon /> {t.joinX}</a>
          </div>
          <a className="join__dev" href={CONFIG.socials.devBlog} target="_blank" rel="noreferrer">
            <TgIcon /> <span>{t.joinDev}</span> <b>{t.joinDevLink} →</b>
          </a>
        </div>
      </div>
    </section>
  )
}
