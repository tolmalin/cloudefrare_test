import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    watch: {
      usePolling: true,
    },
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'index.html',
        view_status: 'status.html',
      }
    }
  },
})
