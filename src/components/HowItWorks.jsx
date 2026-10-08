import { useLang } from '../i18n'

export default function HowItWorks() {
  const { t } = useLang()
  return (
    <section id="how" className="container section">
      <p className="kicker">{t.howK}</p>
      <h2>{t.howH}</h2>
      <ol className="steps">
        {t.steps.map(([title, text], i) => (
          <li className="card" key={title}>
            <span className="steps__n">{String(i + 1).padStart(2, '0')}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
