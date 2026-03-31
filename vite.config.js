import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Rice Farming',
        short_name: 'RiceFarm',
        description: 'Progressive Web App for Rice Farming',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#4CAF50',
        "icons": [
          { "src": "src/assets/logo.png", "sizes": "192x192", "type": "image/png" },
          { "src": "src/assets/logo.png", "sizes": "512x512", "type": "image/png" }
        ]
      }
    })
  ]
})
