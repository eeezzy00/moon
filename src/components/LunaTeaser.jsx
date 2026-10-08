import { useLang } from '../i18n'
import LunaSprite from './LunaSprite'

// Секция на странице: знакомство с LUNA.AI и кнопка открытия полноэкранного чата
export default function LunaTeaser({ onOpen }) {
  const { t } = useLang()
  return (
    <section id="luna" className="container section">
      <div className="teaser">
        <div className="portrait teaser__ava"><LunaSprite scale={4} glow /></div>
        <div className="teaser__text">
          <h2>LUNA.AI</h2>
          <p className="text">{t.lunaP}</p>
          <p className="muted">{t.lunaRole}</p>
          <div><button className="btn" onClick={onOpen}>{t.chatOpen}</button></div>
        </div>
      </div>
    </section>
  )
}
