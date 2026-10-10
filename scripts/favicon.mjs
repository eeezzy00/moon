// Статичная иконка из того же спрайта: node scripts/favicon.mjs → public/favicon.svg
// (пока не загрузился JS, и в браузерах, где анимация выключена)
import { writeFileSync } from 'node:fs'
import { pixels, SIZE } from '../src/lib/favicon.js'

const frame = Number(process.argv[2] ?? 0)
const rects = pixels(frame).map(([x, y, c]) => `<rect x="${x}" y="${y}" width="1" height="1" fill="${c}"/>`).join('')
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" shape-rendering="crispEdges">${rects}</svg>\n`
writeFileSync(new URL('../public/favicon.svg', import.meta.url), svg)
console.log('public/favicon.svg written')
