import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Base path for GitHub Pages deployment
  base: process.env.NODE_ENV === 'production' ? '/App-Concept-Analysis/' : '/',
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  // WebLLM requires these settings for WebGPU/WASM support
  optimizeDeps: {
    exclude: ['@mlc-ai/web-llm'],
  },
  build: {
    target: 'esnext',
  },
});
