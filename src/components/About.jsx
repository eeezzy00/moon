import { useLang } from '../i18n'

export default function About() {
  const { t } = useLang()
  const cards = [
    [t.a1t, t.a1d],
    [t.a2t, t.a2d],
    [t.a3t, t.a3d],
  ]
  return (
    <section id="about" className="container section">
      <p className="kicker">{t.aboutK}</p>
      <h2>{t.aboutH}</h2>
      <p>{t.aboutP1}</p>
      <p>{t.aboutP2}</p>
      <div className="grid">
        {cards.map(([title, text]) => (
          <div className="card" key={title}>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
