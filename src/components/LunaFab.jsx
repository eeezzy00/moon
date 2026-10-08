import { useLang } from '../i18n'
import Astronaut from './Astronaut'

// Плавающая кнопка в правом нижнем углу: пиксельный скафандр, открывает чат с LUNA.AI.
export default function LunaFab({ onClick, hidden }) {
  const { t } = useLang()
  return (
    <button
      className={`fab ${hidden ? 'fab--hidden' : ''}`}
      onClick={onClick}
      aria-label={t.fabLabel}
      title={t.fabLabel}
      tabIndex={hidden ? -1 : 0}
    >
      <Astronaut size={84} />
      <span className="fab__tip">{t.fabLabel}</span>
    </button>
  )
}
