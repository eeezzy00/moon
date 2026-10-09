// События-эмоции LUNA.AI, вызываются в чате командами через «/»
import { playSad, playConfused, playAlarm, playJoy } from './sfx'

export const EVENTS = {
  sad: {
    aliases: ['sad', 'sadness', 'грусть', 'грустно', 'печаль'],
    dur: 9000, typeMs: 42, sound: playSad,
    ru: { cmd: '/грусть', label: 'LUNA грустит', status: 'грустит', lines: ['Иногда луна кажется очень далёкой... шлем запотевает.', 'Грустно. Огней на берегу сегодня мало.', 'Я просто посижу у окна и посмотрю на звёзды. Ладно?', 'Знаешь, даже луна иногда темнеет. Это пройдёт.'] },
    en: { cmd: '/sad', label: 'LUNA feels sad', status: 'feeling sad', lines: ['Sometimes the moon feels so far away... my visor is fogging up.', 'Sad. Not many lights on the shore tonight.', 'I will just sit by the window and watch the stars. Okay?', 'You know, even the moon goes dark sometimes. It passes.'] },
  },
  confused: {
    aliases: ['confused', 'huh', 'what', 'недоумение', 'удивление', 'чего', 'что'],
    dur: 5500, typeMs: 26, sound: playConfused,
    ru: { cmd: '/недоумение', label: 'LUNA в недоумении', status: 'в недоумении', lines: ['Э-э... что? Мои датчики не поняли.', 'Хм. Это было неожиданно. Перезагружаю мысли...', '?..  ...?!', 'Подожди. Я точно правильно поняла? Нет. Не поняла.'] },
    en: { cmd: '/confused', label: 'LUNA is confused', status: 'confused', lines: ['Uh... what? My sensors did not get that.', 'Hm. That was unexpected. Rebooting thoughts...', '?..  ...?!', 'Wait. Did I get that right? No. I did not.'] },
  },
  oxygen: {
    aliases: ['oxygen', 'o2', 'air', 'кислород', 'воздух', 'о2'],
    dur: 7500, typeMs: 55, sound: playAlarm,
    ru: { cmd: '/кислород', label: 'Утечка кислорода', status: 'O2 на исходе', lines: ['Кис...лород... 12%... шлем... пищит...', 'Тревога! Уровень O2 падает! Держусь...', 'Хх... напомни мне... больше не снимать шлем...'], end: 'Фух. Кислород восстановлен. Никому не говори.' },
    en: { cmd: '/oxygen', label: 'Oxygen leak', status: 'O2 running low', lines: ['Oxy...gen... 12%... helmet... beeping...', 'Alert! O2 level dropping! Holding on...', 'Hh... remind me... never to take the helmet off...'], end: 'Phew. Oxygen restored. Do not tell anyone.' },
  },
  joy: {
    aliases: ['joy', 'happy', 'yay', 'радость', 'ура', 'счастье'],
    dur: 5500, typeMs: 20, sound: playJoy,
    ru: { cmd: '/радость', label: 'LUNA радуется', status: 'сияет', lines: ['Ура! Луна стала на пиксель ярче!', 'Я так рада, что ты здесь! Кувыркаюсь в невесомости!', 'Йе-е-ей! Огни на берегу горят ярче!', 'Сегодня отличная ночь, чтобы светиться!'] },
    en: { cmd: '/joy', label: 'LUNA is happy', status: 'glowing', lines: ['Yay! The moon just got one pixel brighter!', 'I am so glad you are here! Tumbling in zero gravity!', 'Yaaay! The lights on the shore are burning brighter!', 'Tonight is a great night to glow!'] },
  },
}

export const HELP = {
  ru: 'Команды: /грусть, /недоумение, /кислород, /радость (или /sad, /confused, /oxygen, /joy). /help — этот список.',
  en: 'Commands: /sad, /confused, /oxygen, /joy. /help shows this list.',
}
export const UNKNOWN = {
  ru: 'Такой команды я не знаю. Напиши /help.',
  en: 'I do not know that command. Type /help.',
}

// Разбор «/команда» → id события, 'help' или null
export function parseCommand(text) {
  const name = text.trim().slice(1).split(/\s+/)[0].toLowerCase()
  if (name === 'help' || name === 'помощь' || name === '') return 'help'
  for (const [id, e] of Object.entries(EVENTS)) if (e.aliases.includes(name)) return id
  return null
}

export const pick = (list) => list[Math.floor(Math.random() * list.length)]
