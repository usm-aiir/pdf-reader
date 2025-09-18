import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/pdf_reader/',
  plugins: [react()],
  worker: {
    format: 'es'
  },
  optimizeDeps: {
    include: ['pdfjs-dist']
  }
})
