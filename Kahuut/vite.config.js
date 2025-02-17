import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
<<<<<<< HEAD
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000
=======
  plugins: [react()],
  server: {
    port: 3001
>>>>>>> main
  }
})
g