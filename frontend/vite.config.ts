import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // The default patterns skip fonts, and the self-hosted faces have to
        // be cached for the app to look right offline. Only the latin subsets
        // are ever requested, so the other unicode ranges stay out of the
        // precache.
        globPatterns: ['**/*.{js,css,html,ico,png,svg}', '**/*latin*.woff2'],
      },
      manifest: {
        name: 'RailObserver',
        short_name: 'RailObserver',
        description: 'Personal Swiss rail vehicle observation platform',
        theme_color: '#fafafa',
        background_color: '#fafafa',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
