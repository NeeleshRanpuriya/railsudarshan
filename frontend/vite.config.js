import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
    proxy: {
      '/rapid-api': {
        target: 'https://irctc1.p.rapidapi.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rapid-api/, ''),
      },
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})