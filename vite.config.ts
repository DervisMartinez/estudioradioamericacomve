import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo_colors.png', 'logo_blanco.png'],
      manifest: {
        name: 'Estudio Radio América',
        short_name: 'Radio América',
        description: 'La otra versión de la radio. Podcast y Programas de Radio América 90.9 FM',
        theme_color: '#131314',
        background_color: '#131314',
        display: 'standalone',
        icons: [
          {
            src: '/logo_colors.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo_colors.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      // Redirige cualquier petición que empiece con /api al backend
      '/api': {
        target: 'http://localhost:3005',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3005',
        changeOrigin: true,
      },
    },
  },
})
