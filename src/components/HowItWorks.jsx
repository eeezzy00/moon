import { useState } from 'react'
import { useLang } from '../i18n'
import HeroMoon from './HeroMoon'

const LIT = [0.12, 0.38, 0.66, 1] // фаза луны у каждого шага
const pct = (v, total) => `${(v / total) * 100}%`

// Живые картинки 108×64: координаты звёзд (в пикселях рисунка), центр полной луны и её отблеск на воде
const PICS = [
  {
    src: '/how.png',
    moon: [71.5, 14], water: [66, 40],
    stars: [[4, 2], [56, 2], [16, 4], [8, 5], [22, 9], [30, 10], [87, 11], [83, 15], [32, 21], [53, 21], [43, 23], [74, 27], [57, 28], [61, 29],
      [12, 12], [26, 3], [38, 6], [64, 4], [92, 5], [100, 9], [35, 15], [48, 4], [80, 6], [96, 14]],
  },
  {
    src: '/how2.png',
    moon: [91, 13], water: [91, 50],
    stars: [[11, 6], [12, 8], [23, 12], [107, 29], [20, 7], [65, 8], [105, 24], [52, 0], [78, 20], [84, 33], [42, 12], [83, 28], [48, 13], [105, 6], [20, 16], [38, 14], [64, 32], [72, 1], [25, 5], [61, 26], [42, 5], [46, 17]],
  },
]

// Пиксельная картинка с мерцающими звёздами и мягким лунным светом
function LivingPicture({ pic, onError }) {
  const W = 108
  const H = 64
  return (
    <div className="how__scene">
      <img src={pic.src} alt="" onError={onError} />
      <i className="how__moonlight" style={{ left: pct(pic.moon[0], W), top: pct(pic.moon[1], H) }} />
      <i className="how__waterlight" style={{ left: pct(pic.water[0], W), top: pct(pic.water[1], H) }} />
      {pic.stars.map(([x, y], i) => (
        <i key={i} className={`how__star ${i % 3 === 2 ? 'how__star--faint' : ''}`}
          style={{ left: pct(x, W), top: pct(y, H), width: pct(1, W), height: pct(1, H), animationDelay: `${((i * 0.73) % 5).toFixed(2)}s`, animationDuration: `${3 + (i % 4)}s` }} />
      ))}
    </div>
  )
}

// Слева коллаж из двух наклонённых картинок, справа шаги колонкой на нити.
export default function HowItWorks() {
  const { t } = useLang()
  const [ok, setOk] = useState(true)

  return (
    <section id="how" className="container section">
      <p className="kicker">{t.howK}</p>
      <h2>{t.howH}</h2>

      <div className="how">
        <div className="how__art">
          {ok ? (
            <>
              <div className="how__frame how__frame--a"><LivingPicture pic={PICS[0]} onError={() => setOk(false)} /></div>
              <div className="how__frame how__frame--b"><LivingPicture pic={PICS[1]} /></div>
            </>
          ) : (
            <div className="portrait how__frame"><div className="how__placeholder"><HeroMoon lit={0.5} size={260} /></div></div>
          )}
        </div>

        <ol className="how__steps">
          {t.steps.map(([title, text], i) => (
            <li key={title} className="how__step">
              <span className="how__n" aria-hidden="true">
                <HeroMoon lit={LIT[i]} size={44} />
              </span>
              <div>
                <span className="how__num">{String(i + 1).padStart(2, '0')}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
