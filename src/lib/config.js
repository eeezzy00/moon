// Единое место для параметров проекта. Всё «рабочее» (имя, тикер, ссылка, адреса) меняется здесь.
export const CONFIG = {
  name: 'MOON',
  ticker: '[TICKER]',
  launchUrl: 'https://moon.cx',
  docsUrl: 'https://moon.cx/docs',
  maxGram: 2000,
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
