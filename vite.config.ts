import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import legacy from '@vitejs/plugin-legacy'
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    wasm(),
    topLevelAwait(),
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ],
  base: './',
  server: {
    port: 8086,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, 'src')
    }
  }
})
