// Радио MOON.FM собирается из папки music автоматически:
//   music/<станция>/<трек>.mp3   станция = название папки (lofi-night -> «Lofi Night»)
//   music/<трек>.mp3             треки прямо в music попадают на станцию MOON.FM
// Порядок треков по имени файла (удобно нумеровать: 01_..., 02_...). Форматы: mp3, ogg, m4a, wav.
// Исполнитель пишется после двойного подчёркивания: 01_rainy-night__alex-morgan.mp3 -> «Rainy Night», «Alex Morgan»
const files = import.meta.glob('../../music/**/*.{mp3,ogg,m4a,wav}', { eager: true, query: '?url', import: 'default' })

const pretty = (s) =>
  s
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/^\d+[\s._-]*/, '') // номер в начале нужен только для порядка
    .replace(/[\s_-]*\d{5,}$/, '') // длинный числовой id в конце (так называют файлы стоки)
    .replace(/[-_]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())

const byName = (a, b) => a.file.localeCompare(b.file, undefined, { numeric: true, sensitivity: 'base' })

function build() {
  const map = new Map()
  for (const [path, src] of Object.entries(files)) {
    const parts = path.split('/music/')[1].split('/')
    const file = parts[parts.length - 1]
    const id = parts.length > 1 ? parts[0] : 'main'
    if (!map.has(id)) map.set(id, { id, name: id === 'main' ? 'MOON.FM' : pretty(id), tracks: [] })
    const [name, artist = ''] = file.replace(/\.[a-z0-9]+$/i, '').split('__')
    map.get(id).tracks.push({ id: `${id}/${file}`, file, title: pretty(name) || file, artist: pretty(artist), src })
  }
  const list = [...map.values()]
  list.forEach((s) => s.tracks.sort(byName))
  // главная станция первой, остальные по алфавиту
  list.sort((a, b) => (a.id === 'main' ? -1 : b.id === 'main' ? 1 : a.name.localeCompare(b.name)))
  return list
}

export const STATIONS = build()
export const ALL_TRACKS = STATIONS.flatMap((s) => s.tracks)
