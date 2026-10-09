import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLang } from '../i18n'

// Смещение элемента относительно wrapper через offsetTop/Left: не зависит от transform анимаций появления
function offsetIn(el, wrap) {
  let x = 0
  let y = 0
  for (let n = el; n && n !== wrap; n = n.offsetParent) { x += n.offsetLeft; y += n.offsetTop }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight }
}

// Контурная нить: от первой луны к кадру 1 по левому полю, между кадрами с разных сторон
// идёт ломаной в промежутке между сценами (вправо и обратно влево), между кадрами слева снова по полю.
export default function Trail({ gram, unlockAt, children }) {
  const wrap = useRef(null)
  const { lang } = useLang()
  const [geo, setGeo] = useState(null)

  const measure = useCallback(() => {
    const root = wrap.current
    if (!root) return
    const first = root.querySelector('.phase')
    const els = [...root.querySelectorAll('.scene .tilt-wrap')] // обёртка кадра: её размер не зависит от наклона
    if (!first || els.length === 0) return setGeo(null)

    const half = root.offsetWidth / 2
    const f = offsetIn(first, root)
    const railX = Math.max(4, f.x - 16)
    // точки: карточка первой луны, затем кадры истории
    const pts = [{ x: f.x, y: f.y + f.h / 2, w: f.w, h: f.h, left: true, top: f.y, bottom: f.y + f.h }]
    els.forEach((el) => {
      const o = offsetIn(el, root)
      pts.push({ x: o.x, y: o.y + o.h / 2, w: o.w, h: o.h, left: o.x < half, top: o.y, bottom: o.y + o.h, next: Boolean(el.closest('.scene--next')) })
    })
    const head = root.querySelector('.chapter--next')
    const ht = head ? offsetIn(head, root) : null

    const segs = []
    const dots = []
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i]
      const b = pts[i + 1]
      const lit = i + 1 < pts.length - 1 || gram >= unlockAt
      let d
      if (b.next && ht) {
        // к заголовку центрированной главы: поперёк в промежутке и вниз, затем короткий отрезок к картинке
        const ax = a.x + a.w / 2
        const mid = Math.round((a.bottom + ht.y) / 2)
        d = `M${ax} ${a.bottom} V${mid} H${half} V${ht.y}`
        segs.push({ d: `M${half} ${ht.y + ht.h} V${b.top}`, lit })
        dots.push({ x: ax, y: a.bottom, lit: true }, { x: half, y: ht.y, lit }, { x: half, y: b.top, lit })
      } else if (a.left && b.left) {
        // обе слева: по полю
        d = `M${a.x} ${a.y} H${railX} V${b.y} H${b.x}`
        dots.push({ x: a.x, y: a.y, lit: true }, { x: b.x, y: b.y, lit })
      } else {
        // с разных сторон: вниз из центра кадра, поперёк в промежутке, вниз к следующему
        const ax = a.x + a.w / 2
        const bx = b.x + b.w / 2
        const mid = Math.round((a.bottom + b.top) / 2)
        d = `M${ax} ${a.bottom} V${mid} H${bx} V${b.top}`
        dots.push({ x: ax, y: a.bottom, lit: true }, { x: bx, y: b.top, lit })
      }
      segs.push({ d, lit })
    }
    // две ветки от центрированной главы, угасающие вниз: начинаются под текстом главы, чтобы его не пересекать
    const last = pts[pts.length - 1]
    const nextArt = root.querySelector('.scene--next')
    let branches = null
    if (last.next && nextArt) {
      const na = offsetIn(nextArt, root)
      const y0 = na.y + na.h + 14
      branches = {
        y0,
        y1: y0 + 120,
        lit: gram >= unlockAt,
        d: [
          `M${half} ${y0} V${y0 + 26} H${half - 190} V${y0 + 120}`,
          `M${half} ${y0} V${y0 + 26} H${half + 190} V${y0 + 120}`,
        ],
      }
    }
    setGeo({ w: root.offsetWidth, h: root.offsetHeight, segs, dots, branches })
  }, [gram, unlockAt])

  useLayoutEffect(() => { measure() }, [measure, lang])
  useEffect(() => {
    const ro = new ResizeObserver(measure)
    ro.observe(wrap.current)
    window.addEventListener('resize', measure)
    window.addEventListener('load', measure)
    document.fonts?.ready.then(measure)
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); window.removeEventListener('load', measure) }
  }, [measure])

  return (
    <div className="trail" ref={wrap}>
      {children}
      {geo && (
        <svg className="trail__layer" width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`} shapeRendering="crispEdges" aria-hidden="true">
          {geo.segs.map((s, i) => <path key={i} d={s.d} className={`trail__seg ${s.lit ? 'on' : ''}`} />)}
          {geo.branches && (
            <>
              <defs>
                <linearGradient id="trailfade" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1={geo.branches.y0} y2={geo.branches.y1}>
                  <stop offset="0" stopColor="#fff" />
                  <stop offset="1" stopColor="#000" />
                </linearGradient>
                <mask id="trailmask" maskUnits="userSpaceOnUse" x="0" y={geo.branches.y0} width={geo.w} height={geo.branches.y1 - geo.branches.y0 + 2}>
                  <rect x="0" y={geo.branches.y0} width={geo.w} height={geo.branches.y1 - geo.branches.y0 + 2} fill="url(#trailfade)" />
                </mask>
              </defs>
              <g mask="url(#trailmask)">
                {geo.branches.d.map((d, i) => <path key={i} d={d} className={`trail__seg trail__seg--branch ${geo.branches.lit ? 'on' : ''}`} />)}
              </g>
            </>
          )}
          {geo.dots.map((p, i) => (
            <rect key={i} x={p.x - 3} y={p.y - 3} width="6" height="6" className={`trail__dot ${p.lit ? 'on' : ''}`} />
          ))}
        </svg>
      )}
    </div>
  )
}
