import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 3000
  },
  build: {
    sourcemap: false,
  },
  esbuild: {
    // Strip console/debugger in production builds only
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}))
