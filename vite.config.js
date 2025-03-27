import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'], // Optional but recommended
    css: true, // If you're using CSS in your tests
    include: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)']
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://yappari-coffee-bar.shop',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
