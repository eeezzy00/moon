import { useLang } from '../i18n'

// bare=true: без своей обёртки и заголовка (используется внутри документации)
export default function Faq({ bare = false }) {
  const { t } = useLang()
  return (
    <div className="faq">
      {t.faq.map(([q, a], i) => (
        <details key={q} open={!bare && i === 0}>
          <summary>{q}</summary>
          <p>{a}</p>
        </details>
      ))}
    </div>
  )
}
