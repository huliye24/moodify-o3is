import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: '.',
  server: {
    port: 3002,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        app: resolve(__dirname, 'app.html'),
        videos: resolve(__dirname, 'videos.html'),
        playlist: resolve(__dirname, 'playlist.html'),
        voice: resolve(__dirname, 'voice.html'),
        products: resolve(__dirname, 'products.html'),
        boundary: resolve(__dirname, 'boundary.html'),
      },
    },
  },
})
