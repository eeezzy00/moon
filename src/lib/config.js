// Единое место для параметров проекта. Всё «рабочее» (имя, тикер, ссылка, адреса) меняется здесь.
export const CONFIG = {
  name: 'MOON AI',
  ticker: '$MOONAI',
  launchUrl: 'https://moon.cx',
  docsUrl: 'https://moon.cx/docs',
  socials: {
    x: 'https://x.com/Moonaiofficial8',
    telegram: 'https://t.me/+-Va7YKlK-z4zYTcy', // ранний доступ
    devBlog: 'https://t.me/earlymainnet', // блог разработчика
  },
  maxGram: 2000,
  // Быстрый выбор луны, пока нет реальных данных: 0 новолуние, 500 серп, 1000 четверть, 1500 растущая, 2000 полнолуние.
  // Поменять число здесь или открыть сайт с ?moon=new|crescent|quarter|gibbous|full (или ?gram=1200).
  demoGram: 0,
  // Токеномика по стандарту фабрики moon.cx (как у MBTC). Сверить в интерфейсе moon.cx перед запуском.
  token: {
    supply: 1_000_000_000,
    curve: 800_000_000, // продаётся на бондинг-кривой
    pool: 200_000_000, // контракт вносит в пул при выходе
  },
  phaseStep: 500,
  progressUrl: import.meta.env.VITE_PROGRESS_URL || '',
  // ЗАГЛУШКИ для имитации. Заменить настоящими адресами в день запуска.
  contracts: [
    { id: 'jetton', address: 'EQD4FPq-PRDieyQKkizFTRtSDyucUIqrj0v_zXJmqaDp6_0t' },
    { id: 'curve', address: 'EQBYivdc0GAk-nnczaMnYNuSjpeXu2nJS3DidA6markXn3Vb' },
    { id: 'pool', address: 'EQCzFTXpR5Vq-y8NDoYoN4pn9mYaDCbHZ7CXcyZtq3F2Lr8h' },
    { id: 'lock', address: 'EQAvDfWFG0oYX19jwNDNBBL1rEGXq9_vJb_fBbmoSjFhXk2d' },
  ],
}
