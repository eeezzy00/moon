import { useEffect, useState } from 'react'
import { useLang } from '../i18n'
import { useReveal } from '../hooks/useReveal'
import { useClickSfx } from '../hooks/useClickSfx'
import { GALLERY, GROUPS } from '../lib/gallery'
import Backdrop from '../components/Backdrop'
import CursorTrail from '../components/CursorTrail'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function GalleryPage() {
  const { t } = useLang()
  const [open, setOpen] = useState(null)
  const [hot, setHot] = useState(null) // GIF играет только пока на карточку наведён курсор
  useReveal()
  useClickSfx()

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(null)
    window.addEventListener('keydown', onKey)
    document.documentElement.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.documentElement.style.overflow = '' }
  }, [open])

  const cur = open && GALLERY.find((g) => g.id === open)

  return (
    <>
      <Backdrop />
      <Header gallery />
      <main>
        <section className="container section gpage">
          <p className="kicker">{t.gk}</p>
          <h2>{t.gh}</h2>
          <p className="text">{t.gp}</p>
        </section>
        {GROUPS.map((gr) => (
          <section key={gr} className="container section gpage__group">
            <h3 className="gpage__title">{t.ggroups[gr]}</h3>
            <div className={`gp ${gr === 'pixels' ? 'gp--px' : ''}`}>
              {GALLERY.filter((g) => g.group === gr).map((g) => {
                const [title, line] = t.gcap[g.id]
                return (
                  <figure key={g.id} className="gp__item">
                    <button className={`gp__img ${g.px ? 'gp__img--px' : ''}`} onClick={() => setOpen(g.id)} aria-label={title}
                      onMouseEnter={() => g.still && setHot(g.id)} onMouseLeave={() => setHot(null)}
                      onFocus={() => g.still && setHot(g.id)} onBlur={() => setHot(null)}>
                      <img src={g.still && hot !== g.id ? g.still : g.src} alt={title} loading="lazy" decoding="async" />
                    </button>
                    <figcaption><b>{title}</b><span>{line}</span></figcaption>
                  </figure>
                )
              })}
            </div>
          </section>
        ))}
      </main>
      <Footer />
      <CursorTrail />

      {cur && (
        <div className="gal__lb" role="dialog" aria-modal="true" aria-label={t.gcap[cur.id][0]} onClick={() => setOpen(null)}>
          <div className="gal__lbbox" onClick={(e) => e.stopPropagation()}>
            <img className="gal__lbvideo" src={cur.src} alt={t.gcap[cur.id][0]} style={cur.px ? { maxWidth: 'min(100%, 560px)', margin: '0 auto' } : undefined} />
            <p className="gp__lbline"><b>{t.gcap[cur.id][0]}</b> {t.gcap[cur.id][1]}</p>
            <div className="gal__lbbar">
              <span />
              <a className="btn btn--sm btn--ghost" href={cur.src} download={`moonai-${cur.id}${cur.src.slice(cur.src.lastIndexOf('.'))}`}>{t.gdl}</a>
              <button className="btn btn--sm" onClick={() => setOpen(null)}>{t.galClose}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
