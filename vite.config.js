import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// Три страницы: лендинг (/), документация (/docs/) и галерея (/gallery/)
export default defineConfig({
  plugins: [react()],
  // папка music лежит в корне проекта; её файлы могут быть заняты другими программами (EBUSY)
  server: { watch: { ignored: ['**/music/**'] } },
  // Railway отдаёт сайт на своём домене: без этого vite preview отвечает 403 на чужой Host
  preview: { allowedHosts: true },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        docs: resolve(__dirname, 'docs/index.html'),
        gallery: resolve(__dirname, 'gallery/index.html'),
      },
    },
  },
})
