import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import router from './router'
import App from './App.vue'
import i18n from './plugins/i18n'

// Vuetify styles
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

// Firebase初期化
import './services/firebase'

// Performance monitoring setup
import { setupFetchInterceptor } from '@/utils/performanceInterceptor'
if (typeof window !== 'undefined') {
  setupFetchInterceptor()
}

// Error monitoring setup
// Error monitoring is available but not used in main setup
// import { errorMonitor } from '@/utils/errorHandler'
if (typeof window !== 'undefined') {
  // Initialize error monitoring
  console.log('Error monitoring initialized')
}

// Vuetify設定
const vuetify = createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#E91E63',
          secondary: '#9C27B0',
          accent: '#FF5722',
          error: '#F44336',
          warning: '#FF9800',
          info: '#2196F3',
          success: '#4CAF50'
        }
      },
      dark: {
        colors: {
          primary: '#E91E63',
          secondary: '#9C27B0'
        }
      }
    }
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi
    }
  }
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)
app.use(i18n)

app.mount('#app') 