import { useState } from 'react'
import { useLang } from '../i18n'
import { CONFIG } from '../lib/config'
import { phaseIndex, percent } from '../lib/phases'
import HeroMoon from './HeroMoon'
import Cosmos from './Cosmos'
import SplitText from './SplitText'
import Astronaut from './Astronaut'
import { SocialLinks } from './Socials'

export default function Hero({ gram }) {
  const { t } = useLang()
  const phase = phaseIndex(gram)
  // Луна первого экрана декоративная: при каждой загрузке случайная доля света (не чёрный диск).
  // Реальный прогресс показан подписью и в разделе фаз.
  const [heroLit] = useState(() => [0.32, 0.45, 0.58, 0.72, 1][Math.floor(Math.random() * 5)])

  return (
    <section id="top" className="hero" aria-label={CONFIG.name}>
      <Cosmos />
      <div className="hero__glow" />
      <div className="hero__drifter" aria-hidden="true"><Astronaut size={40} /></div>
      <div className="container hero__row">
        <div className="hero__text">
          {phase === 4 && <span className="badge">{t.fullBadge}</span>}
          <p className="kicker hero__in" style={{ '--d': '.1s' }}>{t.kicker}</p>
          <SplitText key={t.h1} as="h1" text={t.h1} delay={0.25} />
          <p className="lead hero__in" style={{ '--d': '.9s' }}>{t.sub}</p>
          <div className="hero__cta hero__in" style={{ '--d': '1.15s' }}>
            <a className="btn" href={CONFIG.launchUrl} target="_blank" rel="noreferrer">{t.cta1}</a>
            <a className="btn btn--ghost" href="#how">{t.cta2}</a>
          </div>
          <SocialLinks className="hero__social hero__in" />
          <div className="hero__stat hero__in" style={{ '--d': '1.35s' }}>
            <i /> <span>{t.phl[phase]}</span> · {percent(gram)}% {t.curve.toLowerCase()}
          </div>
        </div>
        <div className="hero__moonwrap hero__in" style={{ '--d': '.5s' }}>
          <div className="halo" />
          <div className="halo halo--2" />
          <div className="bob"><HeroMoon lit={heroLit} size={360} /></div>
        </div>
      </div>
    </section>
  )
}
