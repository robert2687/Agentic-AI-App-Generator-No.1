import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': './',
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              // Split vendor code
              'react-vendor': ['react', 'react-dom'],
              // Split large dependencies
              'diff-vendor': ['diff', 'diff2html'],
              'ai-vendor': ['@google/genai'],
              'supabase-vendor': ['@supabase/supabase-js'],
            }
          }
        },
        chunkSizeWarningLimit: 600,
        // Enable source maps for production debugging (optional)
        sourcemap: false,
      },
      optimizeDeps: {
        include: ['react', 'react-dom', '@google/genai', '@supabase/supabase-js']
      }
    };
});
