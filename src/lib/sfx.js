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

// Нота квадратной волной с коротким «пиксельным» затуханием
function note(a, freq, start, dur, vol) {
  const osc = a.createOscillator()
  const gain = a.createGain()
  osc.type = 'square'
  osc.frequency.setValueAtTime(freq, start)
  gain.gain.setValueAtTime(vol, start)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  osc.connect(gain).connect(a.destination)
  osc.start(start)
  osc.stop(start + dur + 0.02)
}

// «Монетка»: короткая нота и звонкая длинная выше
export function playCoin() {
  const a = audio()
  if (!a) return
  const t = a.currentTime
  note(a, 1046.5, t, 0.07, 0.05) // C6
  note(a, 1568, t + 0.07, 0.32, 0.05) // G6
}
