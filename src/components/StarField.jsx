import { useEffect, useRef } from 'react'
import { rng, nebula } from '../lib/pixel'

const SCALE = 3 // 1 пиксель холста = 3 пикселя экрана, поэтому звёзды «пиксельные»
// Слои: доля скролла, с которой улетают звёзды, постоянный дрейф, размер, количество на 400 клеток ширины
const LAYERS = [
  { k: 0.12, drift: 1.2, size: 1, count: 70 },
  { k: 0.3, drift: 2.4, size: 1, count: 45 },
  { k: 0.65, drift: 4.5, size: 2, count: 22 },
]
const COLORS = ['#E3FFF1', '#9CFFD0', '#9CFFC8', '#FFF4C9']
const CONST_K = 0.2 // параллакс созвездий
const CONST_DRIFT = 1.6

// Созвездие: 4–7 звёзд, соединённых ломаной, иногда с ответвлением
function makeConstellation(r, W, H) {
  const n = 4 + Math.floor(r() * 4)
  const pts = [{ x: r() * W, y: r() * H }]
  let ang = r() * Math.PI * 2
  for (let i = 1; i < n; i++) {
    ang += (r() - 0.5) * 1.6
    const len = 9 + r() * 16
    const p = pts[i - 1]
    pts.push({ x: p.x + Math.cos(ang) * len, y: p.y + Math.sin(ang) * len })
  }
  const links = pts.slice(1).map((_, i) => [i, i + 1])
  if (n > 4 && r() > 0.4) links.push([1 + Math.floor(r() * (n - 2)), n - 1 - Math.floor(r() * 2)])
  return { pts, links, phase: r() * 6.28, speed: 0.25 + r() * 0.35 }
}

// Фиксированный космос на фоне всей страницы. При скролле звёзды и созвездия плавно улетают вверх.
export default function StarField() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let W = 0, H = 0, raf = 0
    let cur = window.scrollY / SCALE
    let stars = []
    let blobs = []
    let consts = []

    const build = () => {
      W = Math.ceil(window.innerWidth / SCALE)
      H = Math.ceil(window.innerHeight / SCALE)
      canvas.width = W
      canvas.height = H
      const r = rng(42)
      stars = LAYERS.flatMap((L, li) =>
        Array.from({ length: Math.round((L.count * W) / 400) }, () => ({
          li, x: Math.floor(r() * W), y: r() * H, c: COLORS[Math.floor(r() * COLORS.length)], p: r() * 6.28,
        })),
      )
      blobs = [
        { cells: nebula(5, W * 0.2, H * 0.3, W * 0.25, H * 0.2), c: '#34E89A', k: 0.05 },
        { cells: nebula(8, W * 0.8, H * 0.7, W * 0.22, H * 0.22), c: '#4DFFA0', k: 0.08 },
      ]
      const rc = rng(77)
      consts = Array.from({ length: Math.max(3, Math.round(W / 110)) }, () => makeConstellation(rc, W, H))
    }

    const wrap = (v) => ((v % H) + H) % H

    const frame = (ms) => {
      const t = ms / 1000
      const target = window.scrollY / SCALE
      cur += (target - cur) * 0.07 // плавное догоняние скролла
      ctx.clearRect(0, 0, W, H)

      for (const b of blobs) {
        ctx.fillStyle = b.c
        for (const c of b.cells) {
          ctx.globalAlpha = c.o * 0.15
          ctx.fillRect(Math.round(c.x), Math.round(wrap(c.y - cur * b.k)), 2, 2)
        }
      }

      // созвездия: тонкие линии мягко пульсируют, узлы светятся; рисуем дважды для бесшовного перехода через край
      const shift = cur * CONST_K + (reduced ? 0 : t * CONST_DRIFT)
      ctx.lineWidth = 1
      for (const c of consts) {
        const pulse = 0.5 + 0.5 * Math.sin(t * c.speed + c.phase)
        const oy = wrap(c.pts[0].y - shift) - c.pts[0].y
        for (const dy of [oy, oy - H]) {
          ctx.strokeStyle = '#4DFFA0'
          ctx.globalAlpha = 0.05 + pulse * 0.09
          ctx.beginPath()
          for (const [a, b] of c.links) {
            ctx.moveTo(c.pts[a].x, c.pts[a].y + dy)
            ctx.lineTo(c.pts[b].x, c.pts[b].y + dy)
          }
          ctx.stroke()
          ctx.fillStyle = '#E3FFF1'
          ctx.globalAlpha = 0.25 + pulse * 0.35
          for (const p of c.pts) ctx.fillRect(Math.round(p.x), Math.round(p.y + dy), 1, 1)
        }
      }

      // Чёрная дыра: центр и радиус притяжения в пикселях холста
      const hole = document.getElementById('blackhole')
      let hx = 0, hy = 0, pullR = 0
      if (hole) {
        const b = hole.getBoundingClientRect()
        hx = (b.left + b.width / 2) / SCALE
        hy = (b.top + b.height / 2) / SCALE
        pullR = Math.min(W, 140)
      }
      const coreR = 18 * 3 / SCALE // радиус горизонта событий (в клетках холста)

      for (const s of stars) {
        const L = LAYERS[s.li]
        let x = s.x
        let y = wrap(s.y - cur * L.k - (reduced ? 0 : t * L.drift))
        // плавное мерцание вместо резкого мигания
        let a = (0.45 + 0.4 * Math.sin(t * 1.3 + s.p)) * 0.32
        let size = L.size
        if (hole && y > hy - coreR) {
          const dx = hx - x, dy = hy - y
          const d = Math.hypot(dx, dy)
          if (d < pullR) {
            const f = Math.pow(1 - d / pullR, 1.6) // 0 на краю, 1 в центре
            x += dx * f * 0.9
            y += dy * f * 0.45
            a += (0.9 - a) * Math.min(1, f * 1.5)
            if (d < coreR * 2.2) a *= Math.max(0, (d - coreR * 0.6) / (coreR * 1.6))
            if (f > 0.45) size = 1
          }
        }
        ctx.globalAlpha = a
        ctx.fillStyle = s.c
        ctx.fillRect(Math.round(x), Math.floor(y), size, size)
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(frame)
    }

    // не тратим ресурсы, пока вкладка скрыта
    const onVis = () => {
      cancelAnimationFrame(raf)
      if (!document.hidden) raf = requestAnimationFrame(frame)
    }

    build()
    raf = requestAnimationFrame(frame)
    window.addEventListener('resize', build)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', build)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return <canvas ref={ref} className="starfield" aria-hidden="true" />
}
