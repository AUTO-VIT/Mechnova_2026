import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    // The only chunk above 500 kB is the lazily loaded Three.js background.
    // Keep the warning threshold close to that measured, non-critical asset.
    chunkSizeWarningLimit: 525,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('/firebase/auth/')) return 'firebase-auth';
          if (id.includes('/firebase/firestore/')) return 'firebase-firestore';
          if (id.includes('/firebase/functions/')) return 'firebase-functions';
          if (id.includes('/firebase/')) return 'firebase-core';
          if (id.includes('/react-dom/') || id.includes('/react-router')) return 'react-router';
          if (id.includes('/react/')) return 'react-core';
        }
      }
    }
  }
});
