import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use relative asset paths so the app works from the existing static host
// without server rewrites for the /solmarine-safetymanagementsearch prefix.
export default defineConfig({
  base: './',
  plugins: [react()],
})
