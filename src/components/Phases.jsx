import { useLang } from '../i18n'
import { CONFIG } from '../lib/config'
import { phaseIndex, percent, gramLeft } from '../lib/phases'
import PixelMoon from './PixelMoon'

const SEGMENTS = 40

export default function Phases({ gram }) {
  const { t } = useLang()
  const cur = phaseIndex(gram)
  const filled = Math.round((gram / CONFIG.maxGram) * SEGMENTS)

  return (
    <section id="phases" className="container section">
      <h2>{t.phH}</h2>
      <p className="text">{t.phP}</p>

      <div className="phases">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={`phase ${i === cur ? 'phase--now' : ''} ${i > cur ? 'phase--locked' : ''}`}>
            <PixelMoon phase={i} size={92} glow={i <= cur} />
            <b>{i * CONFIG.phaseStep} GRAM</b>
            <span>{t.phl[i]}</span>
            {i === cur && <em>{t.now}</em>}
          </div>
        ))}
      </div>

      <div className="meter" role="progressbar" aria-valuenow={gram} aria-valuemin={0} aria-valuemax={CONFIG.maxGram}>
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <i key={i} className={i < filled ? 'on' : ''} style={{ '--k': i }} />
        ))}
      </div>
      <p className="muted">
        {t.curve} · {percent(gram)}% · {cur === 4 ? t.phl[4] : t.left(gramLeft(gram))}
      </p>
    </section>
  )
}
