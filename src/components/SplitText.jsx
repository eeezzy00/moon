import { Fragment } from 'react'

// Текст, который появляется по словам: каждое слово всплывает с небольшой задержкой.
export default function SplitText({ text, as: Tag = 'span', className = '', step = 0.08, delay = 0 }) {
  const words = text.split(' ')
  return (
    <Tag className={`split ${className}`} aria-label={text}>
      {words.map((w, i) => (
        <Fragment key={`${text}-${i}`}>
          <span className="split__w" style={{ animationDelay: `${delay + i * step}s` }} aria-hidden="true">{w}</span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </Tag>
  )
}
