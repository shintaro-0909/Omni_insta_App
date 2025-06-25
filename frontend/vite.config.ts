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
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        annotations: true
      },
      output: {
        experimentalMinChunkSize: 30000,
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Vue ecosystem
            if (id.includes('vue') || id.includes('pinia') || id.includes('@vue')) {
              return 'vendor-vue';
            }
            // Firebase
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            // AG Grid
            if (id.includes('ag-grid')) {
              return 'vendor-ag-grid';
            }
            // Other vendors
            return 'vendor-misc';
          }
          
          // App code
          if (id.includes('/views/Dashboard') || id.includes('/views/Content') || 
              id.includes('/views/Schedules') || id.includes('/views/Accounts')) {
            return 'app-core';
          }
          
          if (id.includes('/views/Settings') || id.includes('/views/Billing') || 
              id.includes('/views/Logs')) {
            return 'app-admin';
          }
          
          if (id.includes('/components/')) {
            return 'app-components';
          }
          
          if (id.includes('/composables/') || id.includes('/stores/') || 
              id.includes('/utils/')) {
            return 'app-utils';
          }
        },
        chunkFileNames: (chunkInfo) => {
          if (chunkInfo.name.startsWith('vendor-')) {
            return 'vendor/[name]-[hash].js';
          }
          if (chunkInfo.name.startsWith('app-')) {
            return 'app/[name]-[hash].js';
          }
          return 'chunks/[name]-[hash].js';
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