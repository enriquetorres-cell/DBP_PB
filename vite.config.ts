import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Backend Spring Boot (H2) runs on :8080. The browser talks only to the Vite
// dev server (:5173), which proxies these API paths to the backend. This keeps
// requests same-origin, so we don't depend on CORS being configured on the
// backend.
const backend = 'http://localhost:8080'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': backend,
      '/users': backend,
      '/flights': backend,
      '/cleanup': backend,
    },
  },
})
