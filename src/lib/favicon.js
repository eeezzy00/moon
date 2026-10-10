// Иконка вкладки: спящая луна в наушниках, 32×32 пикселя.
// pixels(f) — чистая функция без браузера (её же использует scripts/favicon.mjs для статичной иконки),
// startFavicon() — анимация во вкладке: луна качается в такт, всплывают «z», мерцают звёзды.

export const SIZE = 32
export const FRAMES = 8

const C = {
  line: '#0a3a2a', light: '#b8ffe0', mid: '#4dffa0', teal: '#34e89a', deep: '#22c48f', crater: '#2bb883',
  band: '#1f6b55', cup: '#2ee6d0', cupDark: '#16a493', face: '#04110c', z: '#4dffa0', star: '#e3fff1',
}

const CX = 15.5
const CY = 17.5
const R = 10.4

export function pixels(f = 0) {
  const out = []
  const put = (x, y, c) => { if (x >= 0 && y >= 0 && x < SIZE && y < SIZE) out.push([x, y, c]) }
  const bob = f % 4 < 2 ? 0 : 1 // покачивание в такт

  // звёзды
  const stars = [[2, 4], [7, 2], [28, 27], [3, 28]]
  stars.forEach(([x, y], i) => { if ((f + i * 3) % 8 < 6) put(x, y, C.star) })

  // дуга наушников над головой
  for (let a = Math.PI * 1.08; a <= Math.PI * 1.92; a += 0.02) {
    put(Math.round(CX + Math.cos(a) * (R + 1.6)), Math.round(CY + bob + Math.sin(a) * (R + 1.6)), C.band)
  }

  // луна: контур и диагональные полосы света
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const dx = x + 0.5 - (CX + 0.5)
      const dy = y + 0.5 - (CY + 0.5 + bob)
      const d = Math.hypot(dx, dy)
      if (d > R + 1) continue
      if (d > R) { put(x, y, C.line); continue }
      const s = dx + dy // диагональ: свет сверху слева
      put(x, y, s < -9 ? C.light : s < 2 ? C.mid : s < 9 ? C.teal : C.deep)
    }
  }

  // кратеры
  ;[[11, 11], [20, 10], [22, 21], [9, 22], [17, 25]].forEach(([x, y]) => put(x, y + bob, C.crater))

  // чашки наушников
  for (let y = 14; y <= 21; y++) {
    ;[3, 4, 5, 26, 27, 28].forEach((x) => {
      const edge = x === 3 || x === 28 || y === 14 || y === 21
      put(x, y + bob, edge ? C.cupDark : C.cup)
    })
  }

  // закрытые глаза и улыбка
  const face = [[9, 17], [10, 18], [11, 18], [12, 17], [19, 17], [20, 18], [21, 18], [22, 17], [14, 21], [15, 22], [16, 22], [17, 21]]
  face.forEach(([x, y]) => put(x, y + bob, C.face))

  // «z» всплывают справа сверху и растворяются: маленькая и большая по очереди
  const Z = [
    { shift: 0, x: 24, y: 6, map: ['####', '..#.', '.#..', '####'] },
    { shift: 4, x: 26, y: 5, map: ['#####', '...#.', '..#..', '.#...', '#####'] },
  ]
  Z.forEach(({ shift, x, y, map }) => {
    const t = (f + shift) % FRAMES
    if (t > 4) return
    map.forEach((row, j) => [...row].forEach((ch, k) => { if (ch === '#') put(x + k, y - t + j - map.length + 1, C.z) }))
  })

  return out
}

export function startFavicon() {
  if (typeof document === 'undefined') return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  document.querySelectorAll('link[rel~="icon"]').forEach((l) => l.remove())
  const link = document.createElement('link')
  link.rel = 'icon'
  link.type = 'image/png'
  document.head.appendChild(link)

  let f = 0
  const draw = () => {
    ctx.clearRect(0, 0, SIZE, SIZE)
    pixels(f).forEach(([x, y, c]) => { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1) })
    link.href = canvas.toDataURL('image/png')
    f = (f + 1) % FRAMES
  }
  draw()
  setInterval(draw, 280)
}
