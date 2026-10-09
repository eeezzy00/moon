// 8-битные звуки интерфейса, синтезируются на лету через Web Audio (без файлов).
let ctx = null

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

// Нота с коротким «пиксельным» затуханием; slide — куда сползает частота к концу
function note(a, freq, start, dur, vol, type = 'square', slide = 0) {
  const osc = a.createOscillator()
  const gain = a.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), start + dur)
  gain.gain.setValueAtTime(vol, start)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  osc.connect(gain).connect(a.destination)
  osc.start(start)
  osc.stop(start + dur + 0.02)
}

const play = (fn) => { const a = audio(); if (a) fn(a, a.currentTime) }

// «Монетка» на кнопках: короткая нота и звонкая длинная выше
export const playCoin = () => play((a, t) => {
  note(a, 1046.5, t, 0.07, 0.05) // C6
  note(a, 1568, t + 0.07, 0.32, 0.05) // G6
})

// Печать LUNA: тихий мягкий «бип» со случайной высотой, как голос персонажа в ретро-играх
let lastBlip = 0
export const playBlip = (base = 640) => play((a, t) => {
  if (t - lastBlip < 0.045) return
  lastBlip = t
  note(a, base + Math.random() * 220, t, 0.045, 0.022, 'triangle')
})

// Звуки событий LUNA
export const playSad = () => play((a, t) => {
  note(a, 523, t, 0.25, 0.035, 'triangle', -120)
  note(a, 392, t + 0.25, 0.45, 0.035, 'triangle', -90)
})
export const playConfused = () => play((a, t) => {
  note(a, 330, t, 0.12, 0.035, 'square', 160)
  note(a, 440, t + 0.16, 0.18, 0.035, 'square', 260)
})
export const playAlarm = () => play((a, t) => {
  for (let i = 0; i < 3; i++) note(a, 220, t + i * 0.28, 0.16, 0.04, 'square')
})
export const playJoy = () => play((a, t) => {
  ;[784, 988, 1175, 1568].forEach((f, i) => note(a, f, t + i * 0.08, 0.14, 0.04))
})
