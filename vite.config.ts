import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build',
    rollupOptions: {
      output: {
        // Vite automatic code splitting
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules/three')) {
            return 'vendor-three';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-framer';
          }
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-lucide';
          }
        }
      }
    },
    chunkSizeWarningLimit: 600,
    minify: 'esbuild'
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', '@supabase/supabase-js', 'lucide-react'],
    exclude: ['three']
  }
})


