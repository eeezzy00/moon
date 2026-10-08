# MOON AI — лендинг

Пиксельный лендинг мемкоина на TON (запуск на moon.cx). React + Vite, RU/EN.

## Запуск

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # сборка в dist/
```

Страницы: `/` — лендинг, `/docs/` — документация.

## Полезное

- `src/lib/config.js` — название, тикер, ссылки, адреса контрактов (сейчас заглушки).
- `VITE_PROGRESS_URL` (см. `.env.example`) — эндпоинт прогресса кривой. Без него демо: `/?gram=1200`.
- `/?chat` — открыть чат с LUNA.AI сразу.
- `src/i18n/` — тексты сайта, `src/lib/luna/` — реплики LUNA.AI.
- `docs/BRIEF.md` — бриф, `docs/LORE.md` — канон легенды, `docs/TWITTER.md` — гайд для постов.
