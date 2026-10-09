import { useLang } from '../i18n'
import Astronaut from './Astronaut'

// Пиксельная стрелка вправо (указывает на шлем)
function Arrow() {
  return (
    <svg viewBox="0 0 9 7" width="36" height="28" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="0" y="3" width="6" height="1" fill="#4DFFA0" />
      <rect x="0" y="2" width="5" height="1" fill="#2FD68A" />
      <rect x="0" y="4" width="5" height="1" fill="#2FD68A" />
      <rect x="5" y="1" width="1" height="5" fill="#4DFFA0" />
      <rect x="6" y="2" width="1" height="3" fill="#8AFFC4" />
      <rect x="7" y="3" width="1" height="1" fill="#E3FFF1" />
      <rect x="4" y="0" width="1" height="1" fill="#2FD68A" />
      <rect x="4" y="6" width="1" height="1" fill="#2FD68A" />
    </svg>
  )
}

// Плавающая кнопка в правом нижнем углу: шлем скафандра и стрелка-подсказка, открывает чат с LUNA.AI.
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
      <span className="fab__arrow"><Arrow /></span>
      <Astronaut size={84} />
      <span className="fab__tip">{t.fabLabel}</span>
    </button>
  )
}
