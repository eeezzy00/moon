import { phaseIndex, gramLeft, percent } from './phases'
import { createState, respond, idleLine as idle } from './luna/engine'
import ru from './luna/ru'
import en from './luna/en'

const CONTENT = { ru, en }

export { createState }

// Ответ LUNA.AI: { text, delay }. Сценарный движок с памятью (state живёт на время чата).
// В v1 эту функцию заменяет запрос к LLM-прокси.
export function reply(text, state, lang, t, gram) {
  const phase = phaseIndex(gram)
  return respond(text, state, CONTENT[lang] || ru, {
    lang,
    phase,
    phaseName: t.phl[phase].toLowerCase(),
    left: gramLeft(gram),
    pct: percent(gram),
    gram,
  })
}

// Реплика, которую LUNA говорит сама, если собеседник давно молчит
export function idleLine(state, lang, t, gram) {
  const phase = phaseIndex(gram)
  return idle(state, CONTENT[lang] || ru, {
    lang, phase, phaseName: t.phl[phase].toLowerCase(), left: gramLeft(gram), pct: percent(gram), gram,
  })
}
