import { useLang } from '../i18n'

const PREVIEW = ['desk', 'nook', 'balcony', 'rain']

// Превью галереи на лендинге: четыре сцены и кнопка перехода на страницу /gallery/
export default function Gallery() {
  const { t } = useLang()
  return (
    <section id="gallery" className="container section">
      <p className="kicker">{t.galK}</p>
      <h2>{t.galH}</h2>
      <p className="text">{t.galP}</p>

      <div className="gal">
        {PREVIEW.map((id) => (
          <a key={id} href="/gallery/" className="gal__card" aria-label={t.gcap[id][0]}>
            <img className="gal__video" src={`/gallery/${id}.png`} alt={t.gcap[id][0]} loading="lazy" decoding="async" />
            <span className="gal__cap">{t.gcap[id][0]}</span>
          </a>
        ))}
      </div>

      <div className="gal__more">
        <a className="btn" href="/gallery/">{t.gopen} →</a>
      </div>
    </section>
  )
}
