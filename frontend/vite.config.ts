import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      script: {
        defineModel: true,
        propsDestructure: true
      },
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('custom-')
        }
      }
    }),
    vuetify({
      autoImport: true,
      theme: {
        defaultTheme: 'light'
      },
      styles: {
        configFile: 'src/styles/settings.scss'
      }
    }),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
              },
              cacheKeyWillBeUsed: async ({ request }) => {
                return `${request.url}`
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
              }
            }
          }
        ]
      },
      manifest: {
        name: 'Omniy - Instagram Scheduler',
        short_name: 'Omniy',
        description: 'Professional Instagram scheduling app for influencers and businesses',
        theme_color: '#E91E63',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait-primary',
        categories: ['social', 'productivity', 'business'],
        lang: 'ja'
      },
      devOptions: {
        enabled: false
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    dedupe: ['vue', 'vue-router', 'pinia']
  },
  server: {
    port: 3000,
    host: true,
    hmr: {
      overlay: false
    }
  },
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'vuetify',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/functions'
    ],
    exclude: ['@fullcalendar/core', '@fullcalendar/vue3']
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'esnext',
    minify: 'terser',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        annotations: true
      },
      output: {
        experimentalMinChunkSize: 20000,
        manualChunks(id) {
          // === 1人運営向け最適化チャンク分割 ===
          
          // MVPコア（常に必要）
          if (id.includes('node_modules/vue/') || id.includes('node_modules/@vue/')) {
            return 'vue-core'
          }
          if (id.includes('node_modules/vue-router/')) {
            return 'vue-core'
          }
          if (id.includes('node_modules/pinia/')) {
            return 'vue-core'
          }
          
          // Firebase必須機能
          if (id.includes('firebase/app') || id.includes('firebase/auth') || id.includes('firebase/firestore')) {
            return 'firebase-core'
          }
          
          // Firebase拡張機能 (機能フラグで制御)
          if (id.includes('firebase/functions') || id.includes('firebase/storage')) {
            return 'firebase-extended'
          }
          
          // Vuetify UI（分割してロード速度向上）
          if (id.includes('node_modules/vuetify/') && id.includes('components')) {
            return 'vuetify-components'
          }
          if (id.includes('node_modules/vuetify/')) {
            return 'vuetify-core'
          }
          
          // 複雑機能（機能フラグで制御）
          if (id.includes('node_modules/chart.js/') || id.includes('node_modules/chartjs-')) {
            return 'features-analytics'  // パフォーマンス分析用
          }
          if (id.includes('node_modules/@fullcalendar/')) {
            return 'features-calendar'   // カレンダー表示用
          }
          if (id.includes('node_modules/vue-i18n/')) {
            return 'features-i18n'       // 多言語対応用
          }
          
          // ユーティリティ（軽量化）
          if (id.includes('node_modules/date-fns/')) {
            return 'utils-date'
          }
          if (id.includes('node_modules/lodash/')) {
            return 'utils-lodash'
          }
          
          // その他vendor（最小限）
          if (id.includes('node_modules/')) {
            return 'vendor'
          }
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          if (facadeModuleId) {
            if (facadeModuleId.includes('views/')) {
              return 'views/[name]-[hash].js'
            }
            if (facadeModuleId.includes('components/')) {
              return 'components/[name]-[hash].js'
            }
          }
          return 'chunks/[name]-[hash].js'
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 2
      },
      mangle: {
        safari10: true
      }
    }
  },
  define: {
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_OPTIONS_API__: false
  },
  css: {
    devSourcemap: false,
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  }
}) 