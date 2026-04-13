import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// 固定端口配置（参考 ports.json）
const FRONTEND_PORT = 3000
const BACKEND_PORT = 3001

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: FRONTEND_PORT,
    proxy: {
      '/api': {
        target: `http://localhost:${BACKEND_PORT}`,
        changeOrigin: true,
      },
    },
  },
})
