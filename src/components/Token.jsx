import { useLang } from '../i18n'
import { CONFIG } from '../lib/config'

const fmt = (n) => n.toLocaleString('ru-RU').replace(/ /g, ' ')

// Токеномика: общий выпуск, деление кривая/пул полосой, порог выхода и блокировка ликвидности
export default function Token() {
  const { t } = useLang()
  const { supply, curve, pool } = CONFIG.token
  const curvePct = Math.round((curve / supply) * 100)
  const poolPct = 100 - curvePct

  return (
    <section id="token" className="container section">
      <p className="kicker">{t.tokK}</p>
      <h2>{t.tokH}</h2>
      <p className="text">{t.tokP}</p>

      <div className="tok">
        <div className="card tok__supply">
          <span className="tok__label">{t.supplyL}</span>
          <div className="tok__big">{fmt(supply)}</div>
          <p>{t.supplyD}</p>

          <div className="tok__bar" role="img" aria-label={`${curvePct}% / ${poolPct}%`}>
            <i className="tok__bar-curve" style={{ width: `${curvePct}%` }} />
            <i className="tok__bar-pool" style={{ width: `${poolPct}%` }} />
          </div>
          <div className="tok__split">
            <div>
              <span className="tok__dot tok__dot--curve" />
              <b>{curvePct}% · {fmt(curve)}</b>
              <span className="tok__label">{t.curveL}</span>
              <p>{t.curveD}</p>
            </div>
            <div>
              <span className="tok__dot tok__dot--pool" />
              <b>{poolPct}% · {fmt(pool)}</b>
              <span className="tok__label">{t.poolL}</span>
              <p>{t.poolD}</p>
            </div>
          </div>
        </div>

        <div className="tok__side">
          <div className="card tok__stat">
            <span className="tok__label">{t.gradL}</span>
            <div className="tok__mid">{CONFIG.maxGram} GRAM</div>
            <p>{t.gradD}</p>
          </div>
          <div className="card tok__stat">
            <span className="tok__label">{t.lockL}</span>
            <div className="tok__mid">{t.lockV}</div>
            <p>{t.lockD}</p>
          </div>
        </div>
      </div>

      <dl className="tok__meta">
        <div><dt>{t.metaNet}</dt><dd>TON</dd></div>
        <div><dt>{t.metaPad}</dt><dd>moon.cx</dd></div>
        <div><dt>{t.metaTicker}</dt><dd>{CONFIG.ticker}</dd></div>
        <div><dt>{t.metaContract}</dt><dd>{t.metaContractV}</dd></div>
      </dl>
      <p className="muted tok__note">{t.tokNote}</p>
    </section>
  )
}
