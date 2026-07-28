import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // backend/ é um pacote Node independente (Express + Mongoose) com seus
  // próprios testes; sem este exclude, `npm test` varreria backend/**/*.test.js
  // também e tentaria resolver express/mongoose, que a suíte da raiz não espera.
  test: {
    exclude: ['**/node_modules/**', '**/dist/**', 'backend/**'],
  },
  // Mantém as chamadas do frontend (authClient.js) em caminho relativo
  // /api/... já em dev, do mesmo jeito que funcionará em produção via um
  // rewrite do Vercel — nenhum dos dois lados muda quando isso for ligado.
  server: {
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
})
