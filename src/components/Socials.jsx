import { useLang } from '../i18n'
import { CONFIG } from '../lib/config'

// Пиксельные иконки 12×12
export function XIcon() {
  return (
    <svg viewBox="0 0 12 12" width="16" height="16" shapeRendering="crispEdges" aria-hidden="true" fill="currentColor">
      {[[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], [10, 10], [2, 1], [3, 2], [4, 3], [5, 4], [6, 5], [7, 6], [8, 7], [9, 8], [10, 9],
        [10, 1], [9, 2], [8, 3], [7, 4], [3, 8], [2, 9], [1, 10]].map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />)}
    </svg>
  )
}
export function TgIcon() {
  return (
    <svg viewBox="0 0 12 12" width="16" height="16" shapeRendering="crispEdges" aria-hidden="true" fill="currentColor">
      <rect x="9" y="2" width="2" height="1" /><rect x="7" y="3" width="4" height="1" /><rect x="5" y="4" width="5" height="1" />
      <rect x="3" y="5" width="7" height="1" /><rect x="1" y="6" width="5" height="1" /><rect x="7" y="6" width="2" height="1" />
      <rect x="3" y="7" width="2" height="1" /><rect x="7" y="7" width="2" height="1" /><rect x="4" y="8" width="1" height="2" />
      <rect x="8" y="8" width="1" height="2" /><rect x="5" y="9" width="1" height="1" />
    </svg>
  )
}

// Иконки соцсетей для шапки
export function SocialIcons() {
  const { t } = useLang()
  return (
    <div className="socials">
      <a href={CONFIG.socials.x} target="_blank" rel="noreferrer" aria-label="X" title="X"><XIcon /></a>
      <a href={CONFIG.socials.telegram} target="_blank" rel="noreferrer" aria-label={t.tgEarly} title={t.tgEarly}><TgIcon /></a>
    </div>
  )
}

// Ссылки с подписями (первый экран, подвал)
export function SocialLinks({ className = '' }) {
  const { t } = useLang()
  return (
    <div className={`social-links ${className}`}>
      <a href={CONFIG.socials.telegram} target="_blank" rel="noreferrer"><TgIcon /> <span>{t.tgEarly}</span></a>
      <a href={CONFIG.socials.x} target="_blank" rel="noreferrer"><XIcon /> <span>@Moonaiofficial8</span></a>
    </div>
  )
}
