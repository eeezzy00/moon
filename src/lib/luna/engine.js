// Движок «видимости языковой модели» для LUNA.AI: сопоставление фраз по словам-основам,
// случайные варианты без повторов, память о собеседнике, реакция на грубость.
// Это сценарный движок. В v1 respond() заменяется запросом к настоящей LLM.

const norm = (s) =>
  ' ' + s.toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9'\s+*]/g, ' ').replace(/\s+/g, ' ').trim() + ' '

// Шаблон: '=слово' слово целиком; '*корень' корень внутри слова; иначе — начало слова.
const pcache = new Map()
// шаблоны приводим к тому же виду, что и текст: без ё и дефисов
const np = (p) => {
  let v = pcache.get(p)
  if (v === undefined) { v = p.toLowerCase().replace(/ё/g, 'е').replace(/-/g, ' '); pcache.set(p, v) }
  return v
}
function hit(text, raw) {
  const pat = np(raw)
  if (pat[0] === '=') return text.includes(' ' + pat.slice(1) + ' ')
  if (pat[0] === '*') return text.includes(pat.slice(1))
  return text.includes(' ' + pat)
}

const fill = (str, ctx) => str.replace(/\{(\w+)\}/g, (_, k) => (ctx[k] ?? ''))

export function createState() {
  return { last: null, bags: {}, insults: 0, muted: false, name: null, fallbacks: 0, riddle: null, turns: 0, prev: '', seq: {} }
}

// «Мешок» без повторов: перемешиваем варианты и достаём по одному
function draw(state, id, list) {
  let bag = state.bags[id]
  if (!bag || bag.length === 0) {
    bag = list.map((_, i) => i).sort(() => Math.random() - 0.5)
    // чтобы новый круг не начинался с того же ответа
    if (state.bags[`${id}:last`] === bag[bag.length - 1] && bag.length > 1) bag.unshift(bag.pop())
    state.bags[id] = bag
  }
  const i = bag.pop()
  state.bags[`${id}:last`] = i
  return list[i]
}

function timeCtx(lang) {
  const d = new Date()
  const loc = lang === 'ru' ? 'ru-RU' : 'en-US'
  return {
    time: d.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' }),
    date: d.toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long' }),
  }
}

// content: { insult, sorry, polite, intents[], fallback[], muted[], tiers[][], ... }
export function respond(raw, state, content, info) {
  const text = norm(raw)
  const ctx = { ...info, ...timeCtx(info.lang), name: state.name || content.defaultName }
  state.turns += 1
  const result = (str, delay) => ({ text: fill(str, ctx), delay: delay ?? Math.min(1500, 450 + str.length * 9) })

  // пустое и бессмыслица
  if (text.trim().length === 0) return result(draw(state, 'empty', content.empty), 500)
  const letters = text.replace(/[^a-zа-я]/g, '')
  const gibberish = letters.length >= 4 && (!/[аеиоуыэюяaeiou]/.test(letters) || /(.)\1{4,}/.test(letters))
  if (letters.length > 0 && letters.length <= 1 && text.trim().length < 2) return result(draw(state, 'short', content.short), 500)

  // извинение снимает обиду
  const sorry = content.sorry.some((p) => hit(text, p))
  if (sorry && (state.insults > 0 || state.muted)) {
    state.muted = false
    state.insults = 0
    return result(draw(state, 'forgive', content.forgive))
  }

  // грубость: точки и замечания, дальше обида
  if (content.insult.some((p) => hit(text, p))) {
    state.insults += 1
    const tier = Math.min(state.insults, content.tiers.length) - 1
    if (state.insults >= 3) state.muted = true
    return result(draw(state, `tier${tier}`, content.tiers[tier]), 500)
  }
  if (state.muted) return result(draw(state, 'muted', content.muted), 400)

  // повтор той же фразы
  if (text === state.prev && text.trim().length > 3) {
    return result(draw(state, 'repeat', content.repeat), 600)
  }
  state.prev = text

  if (gibberish) return result(draw(state, 'gibberish', content.gibberish))

  // загадка: ждём ответ или сдачу
  if (state.riddle) {
    const r = state.riddle
    if (content.giveup.some((p) => hit(text, p))) {
      state.riddle = null
      return result(r.reveal)
    }
    if (r.keys.some((p) => hit(text, p))) {
      state.riddle = null
      return result(r.win)
    }
    state.riddle.tries += 1
    if (state.riddle.tries >= 3) {
      state.riddle = null
      return result(r.reveal)
    }
    return result(draw(state, 'riddlewrong', content.riddleWrong))
  }

  // имя собеседника
  const nm = content.nameRe && raw.match(content.nameRe)
  if (nm && nm[1]) {
    state.name = nm[1].charAt(0).toUpperCase() + nm[1].slice(1)
    ctx.name = state.name
    state.last = 'name'
    return result(draw(state, 'nameSet', content.nameSet))
  }

  // выбор намерения по сумме совпадений и приоритету
  let best = null
  let bestScore = 0
  for (const it of content.intents) {
    let score = 0
    for (const p of it.k) if (hit(text, p)) score += p.length >= 6 ? 3 : 2
    if (score > 0) {
      score = score * 10 + (it.pr || 0)
      if (score > bestScore) { best = it; bestScore = score }
    }
  }

  // уточняющие реплики опираются на прошлую тему
  const wantsMore = content.more.some((p) => hit(text, p))
  if (wantsMore && state.last && (!best || best.id === 'more')) {
    const prev = content.intents.find((i) => i.id === state.last)
    if (prev) return result(say(state, prev, ctx, content))
  }
  if ((!best || best.id === 'more') && wantsMore) return result(draw(state, 'nomore', content.nomore))

  if (best) {
    state.last = best.id
    state.fallbacks = 0
    if (best.riddle) {
      const rd = draw(state, 'riddles', content.riddles)
      state.riddle = { ...rd, tries: 0 }
      return result(rd.q)
    }
    if (best.id === 'name_ask' && !state.name) return result(content.nameUnknown)
    return result(say(state, best, ctx, content))
  }

  // ничего не поняли
  state.fallbacks += 1
  const hint = state.fallbacks % 3 === 0 ? ' ' + content.hint : ''
  return { text: fill(draw(state, 'fallback', content.fallback), ctx) + hint, delay: 900 }
}

const pickList = (it, ctx) => (ctx.phase === 4 && it.aFull ? it.aFull : it.a)

// Ответ по теме: последовательная легенда (seq) или случайная реплика без повторов
function say(state, it, ctx, content) {
  if (it.seq) {
    const i = state.seq[it.id] || 0
    if (i < it.seq.length) { state.seq[it.id] = i + 1; return it.seq[i] }
    state.seq[it.id] = 0
    return draw(state, `${it.id}:end`, content.loreEnd)
  }
  return draw(state, it.id, pickList(it, ctx))
}

// Самостоятельная реплика LUNA, когда собеседник молчит
export function idleLine(state, content, info) {
  const ctx = { ...info, ...timeCtx(info.lang), name: state.name || content.defaultName }
  return fill(draw(state, 'idle', content.idle), ctx)
}
