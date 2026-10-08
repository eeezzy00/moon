import { useMemo } from 'react'
import { discCells } from '../lib/pixel'

const C = 20 // центр спрайта ядра 40×40

// Чёрная дыра на всю ширину страницы: аккреционный диск-горизонт + ядро.
// Звёзды фона (StarField) притягиваются к точке #blackhole и гаснут в ядре.
export default function BlackHole() {
  const { core, rim } = useMemo(() => ({ core: discCells(C, C, 15), rim: discCells(C, C, 17) }), [])

  return (
    <div className="bh" aria-hidden="true">
      <div className="bh__glow" />
      <div className="bh__disc" />
      <svg className="bh__core-svg" viewBox="0 0 40 40" shapeRendering="crispEdges">
        {rim.map((c) => <rect key={`r${c.x}-${c.y}`} x={c.x} y={c.y} width="1.02" height="1.02" fill="#4DFFA0" opacity=".7" />)}
        {core.map((c) => <rect key={`c${c.x}-${c.y}`} x={c.x} y={c.y} width="1.02" height="1.02" fill="#000" />)}
      </svg>
      <i id="blackhole" className="bh__core" />
    </div>
  )
}
