import { useMemo } from 'react'

const N = 80 // сетка: диск луны + ступенчатое свечение вокруг
const C = N / 2
const R = 30 // радиус диска в пикселях
const HALO = 9 // ширина ступенчатого ореола

// Палитра в стиле концепта «Восход над озером»
const LIGHT = '#9DFFCF' // верхняя полоса света
const MID = '#4DFFA0' // основная
const LOW = '#34E89A' // нижняя
const DARK = '#062A1F' // ночная сторона
const RIM = '#0B3D2D' // кромка ночной стороны
const CR_LIT = '#2FC98A' // кратер на свету
const CR_GLOW = '#34E89A' // светящийся кратер в тени
const CR_HI = '#8AFFC4' // блик кратера
const CR_SH = '#1FA56E' // тень кратера

// Кратеры в долях радиуса: [x, y, r]
const CRATERS = [[0.36, -0.2, 0.17], [-0.48, 0.06, 0.15], [0.04, 0.16, 0.07]]

function colorAt(x, y, lit) {
  const dx = x + 0.5 - C
  const dy = y + 0.5 - C
  const d = Math.hypot(dx, dy)

  if (d > R) {
    // ступенчатый ореол: кольца по 1–2 пикселя, всё прозрачнее
    if (d > R + HALO) return null
    const step = Math.ceil((d - R) / 1.5)
    return { c: MID, o: Math.max(0.04, 0.3 - step * 0.04) }
  }

  const half = Math.sqrt(R * R - dy * dy)
  const term = (2 * lit - 1) * half // граница света, свет слева
  const isLit = lit >= 1 || dx < term

  for (const [cx, cy, cr] of CRATERS) {
    const ex = dx / R - cx
    const ey = dy / R - cy
    const e = Math.hypot(ex, ey)
    if (e <= cr) {
      if (isLit) return { c: e > cr * 0.7 && ex + ey > 0 ? CR_SH : CR_LIT }
      if (ex + ey < -cr * 0.6) return { c: CR_HI }
      return { c: ex + ey > cr * 0.5 ? CR_SH : CR_GLOW }
    }
  }

  if (!isLit) return { c: d > R - 1.3 ? RIM : DARK }

  // полосы света по диагонали, с шахматным смешиванием на стыках
  const u = (dx + dy) / R
  const checker = (x + y) % 2 === 0
  if (u < -0.42 || (u < -0.32 && checker)) return { c: LIGHT }
  if (u < 0.48 || (u < 0.58 && checker)) return { c: MID }
  return { c: LOW }
}

// Плоская пиксельная луна первого экрана. lit: доля света 0..1 (свет слева).
export default function HeroMoon({ lit = 0.5, size = 340 }) {
  const runs = useMemo(() => {
    // склеиваем одинаковые соседние пиксели строки в один прямоугольник
    const out = []
    for (let y = 0; y < N; y++) {
      let cur = null
      for (let x = 0; x <= N; x++) {
        const p = x < N ? colorAt(x, y, lit) : null
        const key = p ? `${p.c}|${p.o ?? 1}` : null
        if (cur && cur.key === key) { cur.w += 1; continue }
        if (cur && cur.key) out.push(cur)
        cur = p ? { key, x, y, w: 1, c: p.c, o: p.o ?? 1 } : { key: null }
      }
    }
    return out
  }, [lit])

  return (
    <svg className="hero-moon" viewBox={`0 0 ${N} ${N}`} width={size} height={size} shapeRendering="crispEdges" aria-hidden="true">
      {runs.map((r) => (
        <rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width={r.w} height="1.02" fill={r.c} opacity={r.o < 1 ? r.o : undefined} />
      ))}
    </svg>
  )
}
