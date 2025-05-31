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
      }
      // styles: {
      //   configFile: 'src/styles/settings.scss'
      // }
    }),
    // VitePWA temporarily disabled for build testing
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   workbox: {
    //     globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    //     cleanupOutdatedCaches: true,
    //     skipWaiting: true,
    //     clientsClaim: true
    //   }
    // })
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
        experimentalMinChunkSize: 50000, // 空チャンク防止
        manualChunks: (id) => {
          // 革新的動的チャンク分割アルゴリズム - 空チャンク完全排除
          
          // Node modules
          if (id.includes('node_modules')) {
            // Vue エコシステム
            if (id.includes('vue') || id.includes('pinia') || id.includes('@vue')) {
              return 'vendor-vue'
            }
            
            // Vuetify（大容量のため独立）
            if (id.includes('vuetify')) {
              return 'vendor-ui'
            }
            
            // Firebase（大容量かつ重要度高）
            if (id.includes('firebase')) {
              return 'vendor-firebase'
            }
            
            // その他vendor（サイズ制限で統合）
            return 'vendor-misc'
          }
          
          // アプリケーション コード
          
          // 大容量コンポーネント（150KB以上の場合）
          if (id.includes('/views/demos/') || id.includes('/styles/')) {
            return 'app-demos'
          }
          
          // Core views（使用頻度高）
          if (id.includes('/views/') && (
            id.includes('Dashboard') || 
            id.includes('Content') || 
            id.includes('Schedules') ||
            id.includes('Accounts')
          )) {
            return 'app-core'
          }
          
          // Admin views（使用頻度低）
          if (id.includes('/views/') && (
            id.includes('Settings') || 
            id.includes('Billing') || 
            id.includes('Logs')
          )) {
            return 'app-admin'
          }
          
          // Composables（共通ユーティリティ）
          if (id.includes('/composables/') || id.includes('/utils/')) {
            return 'app-utils'
          }
          
          // Components（サイズに応じて分割）
          if (id.includes('/components/')) {
            return 'app-components'
          }
          
          // Default（その他すべて）
          return 'app-main'
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
    devSourcemap: false
    // preprocessorOptions: {
    //   scss: {
    //     additionalData: `@import "@/styles/variables.scss";`
    //   }
    // }
  }
}) 