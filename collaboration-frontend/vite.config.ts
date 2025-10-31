import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    // Optimize dev server memory usage
    hmr: {
      overlay: true, // Show errors in browser
    },
    watch: {
      // Ignore node_modules to reduce file watching
      ignored: ['**/node_modules/**', '**/dist/**']
    }
  },
  // Build optimizations
  build: {
    // Enable source maps for debugging but smaller size
    sourcemap: false,
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunking for better code splitting
        manualChunks: {
          // Vendor chunk for React and related libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI library chunk for Radix UI components
          'ui-vendor': [
            '@radix-ui/react-avatar',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-slot',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
          ],
          // Socket.io separate chunk
          'socket-vendor': ['socket.io-client'],
        }
      }
    }
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'socket.io-client',
      'axios',
      'lucide-react'
    ],
    exclude: ['@vite/client', '@vite/env']
  }
}); 