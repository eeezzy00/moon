import { useEffect, useRef } from 'react'

const COLORS = ['#4DFFA0', '#8AFFC4', '#E3FFF1', '#2FD68A']
const INTERACTIVE = 'a, button, summary, input, label, [role="slider"], .card, .phase'

// Пиксельный курсор с шлейфом угасающих искр. Только для мыши; на тач-экранах и при
// «уменьшении движения» остаётся обычный курсор.
export default function CursorTrail() {
  const canvas = useRef(null)
  const dot = useRef(null)
  const ring = useRef(null)

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduced) return

    const root = document.documentElement
    root.classList.add('cursor-on')
    const cv = canvas.current
    const ctx = cv.getContext('2d')
    let W = 0, H = 0
    const resize = () => {
      W = cv.width = window.innerWidth
      H = cv.height = window.innerHeight
    }
    resize()

    const parts = []
    const mouse = { x: -100, y: -100, px: -100, py: -100, seen: false }
    const lag = { x: -100, y: -100 }
    let hover = false
    let raf = 0

    const spawn = (x, y, n) => {
      for (let i = 0; i < n; i++) {
        parts.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 0.6,
          vy: -0.2 - Math.random() * 0.6,
          life: 1,
          decay: 0.018 + Math.random() * 0.02,
          size: Math.random() > 0.75 ? 4 : 3,
          c: COLORS[Math.floor(Math.random() * COLORS.length)],
        })
      }
      if (parts.length > 260) parts.splice(0, parts.length - 260)
    }

    const onMove = (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      if (!mouse.seen) {
        mouse.seen = true
        mouse.px = lag.x = mouse.x
        mouse.py = lag.y = mouse.y
        dot.current.style.opacity = ring.current.style.opacity = '1'
      }
      // искры вдоль пути, чтобы шлейф был сплошным при быстром движении
      const dist = Math.hypot(mouse.x - mouse.px, mouse.y - mouse.py)
      const steps = Math.min(8, Math.floor(dist / 8))
      for (let i = 1; i <= steps; i++) {
        spawn(mouse.px + ((mouse.x - mouse.px) * i) / steps, mouse.py + ((mouse.y - mouse.py) * i) / steps, 1)
      }
      if (steps === 0 && Math.random() > 0.6) spawn(mouse.x, mouse.y, 1)
      mouse.px = mouse.x
      mouse.py = mouse.y
      const h = Boolean(e.target.closest?.(INTERACTIVE))
      if (h !== hover) {
        hover = h
        ring.current.classList.toggle('cursor__ring--hover', h)
      }
    }
    const onDown = () => { ring.current.classList.add('cursor__ring--down'); spawn(mouse.x, mouse.y, 14) }
    const onUp = () => { ring.current.classList.remove('cursor__ring--down') }
    const onLeave = () => { dot.current.style.opacity = ring.current.style.opacity = '0'; mouse.seen = false }

    const frame = () => {
      lag.x += (mouse.x - lag.x) * 0.18
      lag.y += (mouse.y - lag.y) * 0.18
      dot.current.style.transform = `translate(${mouse.x}px, ${mouse.y}px)`
      ring.current.style.transform = `translate(${lag.x}px, ${lag.y}px)`

      ctx.clearRect(0, 0, W, H)
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]
        p.x += p.vx
        p.y += p.vy
        p.life -= p.decay
        if (p.life <= 0) { parts.splice(i, 1); continue }
        ctx.globalAlpha = p.life * 0.85
        ctx.fillStyle = p.c
        const s = p.life > 0.5 ? p.size : p.size - 1
        ctx.fillRect(Math.round(p.x - s / 2), Math.round(p.y - s / 2), s, s)
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('resize', resize)
    document.addEventListener('mouseleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      root.classList.remove('cursor-on')
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('resize', resize)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <div className="cursor" aria-hidden="true">
      <canvas ref={canvas} className="cursor__trail" />
      <span ref={ring} className="cursor__ring" />
      <span ref={dot} className="cursor__dot" />
    </div>
  )
}
