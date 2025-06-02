import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    css: {
      modules: {
        classNameStrategy: 'stable'
      }
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.d.ts',
        'src/main.ts',
        'src/router/index.ts'
      ]
    },
    // Vuetify依存関係のインライン化
    server: {
      deps: {
        inline: ['vuetify']
      }
    }
  }
}) 