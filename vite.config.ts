import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
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
