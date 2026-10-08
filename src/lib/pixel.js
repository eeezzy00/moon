// Утилиты для процедурной пиксельной графики.
export function rng(seed) {
  let s = seed
  return () => ((s = (s * 16807) % 2147483647) / 2147483647)
}

// Клетки диска радиуса r с центром (cx, cy)
export function discCells(cx, cy, r) {
  const out = []
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
      const dx = x + 0.5 - cx
      const dy = y + 0.5 - cy
      if (dx * dx + dy * dy <= r * r) out.push({ x, y, dx, dy })
    }
  }
  return out
}

// Туманность: облако квадратов 2×2 со спадающей плотностью
export function nebula(seed, cx, cy, rx, ry) {
  const rnd = rng(seed)
  const out = []
  for (let y = Math.floor(cy - ry); y <= cy + ry; y += 2) {
    for (let x = Math.floor(cx - rx); x <= cx + rx; x += 2) {
      const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2
      if (d < 1 && rnd() < (1 - d) * 0.9) out.push({ x, y, o: +(0.05 + (1 - d) * 0.16).toFixed(3) })
    }
  }
  return out
}
