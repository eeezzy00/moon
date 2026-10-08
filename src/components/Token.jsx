import { useLang } from '../i18n'
import { CONFIG } from '../lib/config'

export default function Token() {
  const { t } = useLang()
  const facts = [
    ['1 000 000 000', t.k1, t.d1],
    ['800 + 200M', t.k2, t.d2],
    [`${CONFIG.maxGram} GRAM`, t.k3, t.d3],
    ['∞', t.k4, t.d4],
  ]
  return (
    <section id="token" className="container section">
      <h2>{t.navToken}</h2>
      <div className="grid">
        {facts.map(([big, k, d]) => (
          <div className="card" key={k}>
            <div className={`big ${big === '∞' ? 'big--sym' : ''}`}>{big}</div>
            <h3>{k}</h3>
            <p>{d}</p>
          </div>
        ))}
      </div>
      <p className="muted">
        {t.net}: TON · {t.ticker}: {CONFIG.ticker}
      </p>
    </section>
  )
}
