import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5194,  // Fixed port to prevent CORS issues
    strictPort: true,  // 重要：如果端口占用，直接報錯而不自動試下一個
    host: true   // Allow external access
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  define: {
    // 解決 CSP 問題
    'process.env': process.env
  }
})
