import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname || path.dirname(new URL(import.meta.url).pathname), './src')
    }
  },
  server: {
    port: 8080,
    strictPort: false,
    host: true,
    watch: {
      ignored: ['**/*.tmp', '**/*.docx', '**/*.pdf', '**/dist/**', '**/*.py', '**/*.ps1']
    },
    headers: {
      'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob:; frame-src 'self' https://meet.jit.si https://*.jit.si blob:; img-src 'self' data: https: blob:; connect-src 'self' https: wss:;"
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/framer-motion/')) {
            return 'vendor-motion';
          }
          if (id.includes('node_modules/lucide-react/')) {
            return 'vendor-icons';
          }
          if (id.includes('node_modules/@supabase/')) {
            return 'vendor-supabase';
          }
        }
      }
    }
  }
})
