import { useMemo } from 'react'

const N = 24
const C = 12 // центр шлема

// Пиксельный шлем скафандра без тела, в палитре LUNA.AI. Рисуется процедурно по клеткам.
function colorAt(x, y) {
  const dx = x + 0.5 - C
  const dy = y + 0.5 - C
  const d = Math.hypot(dx, dy)

  // антенна с огоньком сверху справа
  if (x === 17 && y >= 1 && y <= 3) return '#168a74'
  if ((x === 17 || x === 18) && y === 0) return '#4DFFA0'

  // боковые «ушки» шлема
  if ((x <= 1 || x >= 22) && y >= 10 && y <= 14) return y === 10 ? '#9CFFD0' : y === 14 ? '#0d4a3c' : '#168a74'

  // воротник шлема снизу
  if (y >= 21 && y <= 23 && x >= 6 && x <= 17) {
    if (y === 21) return '#9CFFD0'
    return x === 6 || x === 17 ? '#0d4a3c' : '#168a74'
  }

  if (d > 10.4) return null

  // блики на стекле
  const glints = ['8,8', '9,8', '8,9', '9,7', '15,9', '16,10', '14,15']
  if (glints.includes(`${x},${y}`)) return x > 13 ? '#2FD68A' : '#E3FFF1'

  const vx = dx / 7
  const vy = (dy - 0.6) / 6
  const v = vx * vx + vy * vy
  if (v <= 1) return dy > 2 ? '#06261c' : '#03110c' // стекло визора
  if (v <= 1.2) return '#0a241b' // кант визора
  if (d > 9.3) return '#0d4a3c' // внешний контур
  const t = (dx + dy) / (d * 1.41 || 1) // свет сверху слева
  return t < -0.4 ? '#9CFFD0' : t < 0.2 ? '#34E89A' : '#168a74'
}

export default function Astronaut({ size = 84 }) {
  const cells = useMemo(() => {
    const out = []
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const fill = colorAt(x, y)
      if (fill) out.push({ x, y, fill })
    }
    return out
  }, [])
  return (
    <svg viewBox={`0 0 ${N} ${N}`} width={size} height={size} shapeRendering="crispEdges" aria-hidden="true">
      {cells.map((c) => <rect key={`${c.x}-${c.y}`} x={c.x} y={c.y} width="1.02" height="1.02" fill={c.fill} />)}
    </svg>
  )
}
