import { useMemo } from 'react'

const N = 22

// Пиксельный скафандр (шлем + плечи) в палитре LUNA.AI. Рисуется процедурно по клеткам.
function colorAt(x, y) {
  const dx = x + 0.5 - 11
  const dy = y + 0.5 - 8.5
  const d = Math.hypot(dx, dy)

  // зеркальные блики на стекле
  const glints = ['7,5', '8,5', '7,6', '8,4', '14,6', '15,7']
  if (glints.includes(`${x},${y}`)) return '#4DFFA0'

  const vx = dx / 5.6
  const vy = (dy - 0.4) / 5.0
  const v = vx * vx + vy * vy
  if (d <= 8.4) {
    if (v <= 1) return dy > 1.5 ? '#06261c' : '#03110c' // стекло визора
    if (v <= 1.22) return '#0a241b'                      // кант визора
    if (d > 7.4) return '#0d4a3c'                        // внешний контур шлема
    const t = (dx + dy) / (d * 1.41 || 1)               // освещение с левого верхнего угла
    return t < -0.4 ? '#9CFFD0' : t < 0.2 ? '#34E89A' : '#168a74'
  }

  if (y >= 16 && y <= 17 && x >= 8 && x <= 13) return y === 16 ? '#168a74' : '#0d4a3c' // шея
  if (y >= 17) {
    const half = 5 + (y - 17) * 1.7
    if (Math.abs(dx) <= half) {
      if (y === 17) return '#9CFFD0'
      if (y >= 19 && y <= 20 && x >= 9 && x <= 12) return (x === 10 || x === 12) && y === 19 ? '#4DFFA0' : '#0a241b' // панель
      return dx < -half * 0.45 ? '#E3FFF1' : dx > half * 0.45 ? '#7FA897' : '#BFE8D6'
    }
  }
  return null
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
