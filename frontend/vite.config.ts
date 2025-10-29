import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { vfileSubpathFix } from './vite-vfile-fix.js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    vfileSubpathFix(),
    nodePolyfills({
      // Enable polyfills for specific globals and modules
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    hmr: {
      host: "localhost",
      protocol: "ws",
    },
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      // Suppress warnings for 'use client' directives
      onwarn(warning, warn) {
        // Ignore 'use client' directive warnings
        if (warning.message.includes("Module level directives cause errors")) {
          return
        }
        // Ignore #minpath import warnings (vfile issue)
        if (warning.message.includes("#minpath")) {
          return
        }
        warn(warning)
      },
    },
  },
  optimizeDeps: {
    include: ['vfile'],
    esbuildOptions: {
      // Handle Node.js subpath imports
      mainFields: ['module', 'main'],
      resolveExtensions: ['.js', '.mjs', '.ts', '.tsx', '.json'],
    },
  },
})
