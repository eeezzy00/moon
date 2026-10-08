import { useMemo } from 'react'
import { rng, discCells, nebula } from '../lib/pixel'

const STAR_COLORS = ['#E3FFF1', '#E3FFF1', '#9CFFD0', '#9CFFC8', '#FFF4C9']

// Созвездия первого экрана: точки и связи между ними [индекс, индекс]
const CONSTELLATIONS = [
  { pts: [[22, 14], [34, 20], [46, 12], [58, 22], [70, 16]], links: [[0, 1], [1, 2], [2, 3], [3, 4]] },
  { pts: [[150, 8], [161, 14], [172, 10], [168, 22], [180, 27], [157, 25]], links: [[0, 1], [1, 2], [1, 3], [3, 4], [3, 5]] },
  { pts: [[96, 34], [108, 30], [118, 38], [112, 48], [100, 46]], links: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]] },
  { pts: [[12, 44], [20, 52], [14, 62], [26, 60], [34, 70]], links: [[0, 1], [1, 2], [1, 3], [3, 4]] },
  { pts: [[200, 50], [212, 56], [222, 50], [230, 60], [216, 68]], links: [[0, 1], [1, 2], [2, 3], [1, 4]] },
  { pts: [[128, 70], [140, 64], [152, 72], [146, 82]], links: [[0, 1], [1, 2], [2, 3]] },
]

// Многослойный космос: туманности, звёзды, созвездия, планеты, метеоры.
export default function Cosmos() {
  const data = useMemo(() => {
    const r = rng(11)
    const stars = Array.from({ length: 150 }, () => ({
      x: Math.floor(r() * 240), y: Math.floor(r() * 82),
      big: r() > 0.9, c: STAR_COLORS[Math.floor(r() * STAR_COLORS.length)], d: +(r() * 4).toFixed(2),
      slow: r() > 0.6,
    }))
    const neb = [
      { c: '#34E89A', cells: nebula(3, 60, 30, 55, 20) },
      { c: '#4DFFA0', cells: nebula(9, 175, 45, 50, 18) },
      { c: '#1a8f5c', cells: nebula(21, 120, 14, 70, 11) },
    ]
    const planet = discCells(205, 24, 8)
    const small = discCells(30, 66, 3.5)
    const far = discCells(92, 9, 2.2) // далёкая планетка

    // спиральная галактика: точки по двум рукавам
    const rg = rng(31)
    const galaxy = Array.from({ length: 34 }, (_, i) => {
      const arm = i % 2
      const tt = (i / 34) * 2.6
      const rad = 0.4 + tt * 1.25
      const a = tt * 2.4 + arm * Math.PI
      return { x: 150 + Math.cos(a) * rad * 1.5, y: 80 + Math.sin(a) * rad * 0.6, o: +((0.75 - tt / 4) * 0.7 + rg() * 0.08).toFixed(2) }
    })

    // пояс астероидов: мелкие камни разной формы
    const ra = rng(57)
    const rocks = Array.from({ length: 14 }, () => ({
      x: 150 + ra() * 70, y: 82 + ra() * 10, w: ra() > 0.6 ? 2 : 1, h: ra() > 0.7 ? 2 : 1, c: ra() > 0.5 ? '#2a5b4c' : '#1d4a3c', d: +(ra() * 6).toFixed(1),
    }))

    // искры вокруг луны и пылинки, поднимающиеся вверх
    const rs = rng(91)
    const sparks = Array.from({ length: 10 }, () => ({ x: 150 + rs() * 75, y: 18 + rs() * 64, d: +(rs() * 6).toFixed(1) }))
    const dust = Array.from({ length: 26 }, () => ({ x: rs() * 240, y: 40 + rs() * 60, d: +(rs() * 30).toFixed(1), s: 18 + rs() * 22 }))

    return { stars, neb, planet, small, far, galaxy, rocks, sparks, dust }
  }, [])

  return (
    <svg className="cosmos" viewBox="0 0 240 100" preserveAspectRatio="xMidYMid slice" shapeRendering="crispEdges" aria-hidden="true">
      {data.neb.map((n, i) => (
        <g key={i} fill={n.c} className={`neb neb${i}`}>
          {n.cells.map((c, j) => <rect key={j} x={c.x} y={c.y} width="2" height="2" opacity={c.o} />)}
        </g>
      ))}

      {data.stars.map((s, i) => (
        <g key={i} className={s.slow ? 'tw tw--slow' : 'tw'} style={{ animationDelay: `${s.d}s` }} fill={s.c}>
          <rect x={s.x} y={s.y} width="1" height="1" />
          {s.big && <>
            <rect x={s.x - 1} y={s.y} width="3" height="1" opacity=".5" />
            <rect x={s.x} y={s.y - 1} width="1" height="3" opacity=".5" />
          </>}
        </g>
      ))}

      {/* созвездия: линии прорисовываются и мягко пульсируют */}
      {CONSTELLATIONS.map((c, i) => (
        <g key={i} className="constel" style={{ animationDelay: `${i * 1.3}s` }}>
          <path
            className="constel__line"
            d={c.links.map(([a, b]) => `M${c.pts[a][0]} ${c.pts[a][1]} L${c.pts[b][0]} ${c.pts[b][1]}`).join(' ')}
            pathLength="100"
            style={{ animationDelay: `${0.4 + i * 0.5}s` }}
          />
          {c.pts.map(([x, y], j) => (
            <rect key={j} className="constel__star" x={x - 0.75} y={y - 0.75} width="1.5" height="1.5" style={{ animationDelay: `${i * 0.6 + j * 0.3}s` }} />
          ))}
        </g>
      ))}

      {/* планета с кольцом */}
      <g className="drift">
        {data.planet.map((c) => (
          <rect key={`${c.x}-${c.y}`} x={c.x} y={c.y} width="1.02" height="1.02"
            fill={c.dx + c.dy > 3 ? '#0e3d33' : c.dx + c.dy > -1 ? '#1d7f6a' : '#3fd3b0'} />
        ))}
        <g fill="#9CFFC8" opacity=".8">
          {Array.from({ length: 26 }, (_, i) => {
            const a = (i / 26) * Math.PI * 2
            return <rect key={i} x={Math.round(205 + Math.cos(a) * 14)} y={Math.round(24 + Math.sin(a) * 3.2)} width="1" height="1" />
          })}
        </g>
      </g>
      {data.small.map((c) => (
        <rect key={`s${c.x}-${c.y}`} x={c.x} y={c.y} width="1.02" height="1.02" fill={c.dx > 0 ? '#2a5b4c' : '#14382e'} />
      ))}

      {/* далёкая галактика */}
      <g className="galaxy">
        {data.galaxy.map((g, i) => <rect key={i} x={g.x} y={g.y} width=".8" height=".8" fill="#9cffc8" opacity={g.o} />)}
        <rect x="149.5" y="79.5" width="1" height="1" fill="#e3fff1" opacity=".8" />
      </g>

      {/* далёкая планетка с крошечным спутником */}
      {data.far.map((c) => <rect key={`f${c.x}-${c.y}`} x={c.x} y={c.y} width="1.02" height="1.02" fill={c.dx > 0 ? '#1d6b4f' : '#2fd68a'} opacity=".7" />)}
      <g className="moonlet"><rect x="96" y="9" width=".8" height=".8" fill="#e3fff1" /></g>

      {/* пояс астероидов */}
      {data.rocks.map((r, i) => (
        <rect key={`r${i}`} className="rock" x={r.x} y={r.y} width={r.w} height={r.h} fill={r.c} style={{ animationDelay: `${-r.d}s` }} />
      ))}

      {/* спутник пересекает небо */}
      <g className="sat">
        <rect x="0" y="0" width="2" height="1" fill="#8db5a4" />
        <rect x="-2" y="0" width="1.6" height="1" fill="#2fd68a" opacity=".8" />
        <rect x="2.4" y="0" width="1.6" height="1" fill="#2fd68a" opacity=".8" />
        <rect className="sat__led" x=".7" y="-.6" width=".6" height=".6" fill="#4dffa0" />
      </g>

      {/* комета с хвостом */}
      <g className="comet">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <rect key={i} x={-i * 1.2} y={-i * 0.45} width="1" height="1" fill={i ? '#8affc4' : '#e3fff1'} opacity={1 - i * 0.12} />)}
      </g>

      {/* искры вокруг луны */}
      {data.sparks.map((p, i) => (
        <g key={`p${i}`} className="spark" style={{ animationDelay: `${p.d}s` }} fill="#e3fff1">
          <rect x={p.x - 0.4} y={p.y - 1.4} width=".8" height="2.8" opacity=".6" />
          <rect x={p.x - 1.4} y={p.y - 0.4} width="2.8" height=".8" opacity=".6" />
          <rect x={p.x - 0.4} y={p.y - 0.4} width=".8" height=".8" />
        </g>
      ))}

      {/* пылинки медленно поднимаются */}
      {data.dust.map((p, i) => (
        <rect key={`d${i}`} className="dust" x={p.x} y={p.y} width=".6" height=".6" fill="#4dffa0" style={{ animationDelay: `${-p.d}s`, animationDuration: `${p.s}s` }} />
      ))}

      <rect className="shoot s1" x="0" y="0" width="6" height="1" fill="#E3FFF1" />
      <rect className="shoot s2" x="0" y="0" width="5" height="1" fill="#9CFFC8" />
    </svg>
  )
}
