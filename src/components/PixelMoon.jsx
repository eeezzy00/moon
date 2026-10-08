import { useMemo } from 'react'
import { PHASE_LIT } from '../lib/phases'

// Спрайт public/moon.png 64×64; сама луна занимает клетки 9..54 (46×46, центр 32).
const BOX = 46
const OFF = 9
// Границы непрозрачных пикселей по строкам y = 9..54: [первый x, последний x]
const ROWS = [
  [28, 35], [25, 38], [23, 40], [21, 42], [19, 44], [18, 45], [16, 47], [15, 47], [14, 48], [14, 49],
  [13, 50], [13, 50], [12, 51], [12, 51], [11, 52], [11, 52], [11, 52], [10, 53], [10, 53], [10, 53],
  [9, 54], [9, 54], [9, 54], [9, 54], [9, 54], [9, 54], [10, 53], [10, 53], [10, 53], [11, 52],
  [11, 52], [11, 52], [12, 51], [12, 51], [13, 50], [13, 49], [14, 48], [15, 47], [16, 47], [17, 45],
  [18, 44], [20, 42], [22, 40], [25, 38], [28, 35], [28, 35],
]

// Луна = пиксельный спрайт + тень фазы строго по пикселям спрайта + зелёная тонировка + свечение.
// lit (0..1) — необязательная плавная доля света вместо фазы (используется как регулятор громкости).
export default function PixelMoon({ phase = 0, size = 160, glow = true, lit: litProp, flip = false, flat = false }) {
  const { tint, shadow, bright } = useMemo(() => {
    const lit = litProp ?? PHASE_LIT[phase]
    const k = 1 - 2 * lit // >0 серп, <0 «растущая», -1 полнолуние
    const tint = []
    const shadow = []
    const bright = []
    ROWS.forEach(([a, b], i) => {
      const y = OFF + i
      const from = a
      const to = b + 1
      tint.push({ y, x: from, w: to - from })
      const half = (to - from) / 2
      const mid = (to + from) / 2
      const edge = lit === 0 ? to : Math.round(mid + k * half)
      const w = Math.min(edge, to) - from
      // flip: зеркало, свет слева, тень отступает вправо
      if (w > 0) shadow.push({ y, x: flip ? to - w : from, w })
      const lw = to - from - Math.max(0, w)
      if (lw > 0) bright.push({ y, x: flip ? from : from + Math.max(0, w), w: lw })
    })
    return { tint, shadow, bright }
  }, [phase, litProp, flip])

  const strength = litProp != null ? 0.18 + litProp * 0.48 : 0.18 + phase * 0.12

  // flat: только силуэт, без текстуры спрайта (для маленьких значков)
  if (flat) {
    return (
      <svg viewBox={`${OFF} ${OFF} ${BOX} ${BOX}`} width={size} height={size} shapeRendering="crispEdges"
        style={glow ? { filter: `drop-shadow(0 0 ${size / 8}px rgba(77,255,160,${0.15 + (litProp ?? 0) * 0.5}))` } : undefined} aria-hidden="true">
        <g fill="#12382B" opacity=".75">{tint.map((r) => <rect key={r.y} x={r.x} y={r.y} width={r.w} height="1" />)}</g>
        <g fill="#7CF2B8">{bright.map((r) => <rect key={r.y} x={r.x} y={r.y} width={r.w} height="1" />)}</g>
      </svg>
    )
  }

  return (
    <svg
      viewBox={`${OFF} ${OFF} ${BOX} ${BOX}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      style={glow ? {
        filter: `drop-shadow(0 0 ${size / 12}px rgba(77,255,160,${strength + 0.1})) drop-shadow(0 0 ${size / 3}px rgba(52, 232, 154,${strength / 1.6}))`,
      } : undefined}
      aria-hidden="true"
    >
      <image href="/moon.png" x="0" y="0" width="64" height="64" style={{ imageRendering: 'pixelated' }} />
      {/* зелёная тонировка */}
      <g fill="#4DFFA0" opacity=".22" style={{ mixBlendMode: 'soft-light' }}>
        {tint.map((r) => <rect key={r.y} x={r.x} y={r.y} width={r.w} height="1" />)}
      </g>
      {/* тень фазы */}
      <g fill="#010302" opacity=".9">
        {shadow.map((r) => <rect key={r.y} x={r.x} y={r.y} width={r.w} height="1" />)}
      </g>
    </svg>
  )
}
