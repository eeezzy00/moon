import { useState } from 'react'
import { useLang } from '../i18n'
import { CONFIG } from '../lib/config'

// bare=true: только список (внутри документации)
export default function Contracts({ bare = false }) {
  const { t } = useLang()
  const [copied, setCopied] = useState(null)

  const copy = async (id, address) => {
    try { await navigator.clipboard.writeText(address) } catch {}
    setCopied(id)
    setTimeout(() => setCopied((c) => (c === id ? null : c)), 1600)
  }

  const body = (
    <>
      <div className="note note--warn">{t.ctDemo}</div>
      <div className="contracts">
        {CONFIG.contracts.map(({ id, address }) => (
          <div className="contract" key={id}>
            <div>
              <h3>{t.ct[id][0]}</h3>
              <p className="muted">{t.ct[id][1]}</p>
              <code>{address}</code>
            </div>
            <button className="btn btn--sm btn--ghost" onClick={() => copy(id, address)}>
              {copied === id ? t.copied : t.copy}
            </button>
          </div>
        ))}
      </div>
    </>
  )
  if (bare) return body

  return (
    <section id="contracts" className="container section">
      <p className="kicker">{t.ctK}</p>
      <h2>{t.ctH}</h2>
      {body}
    </section>
  )
}
