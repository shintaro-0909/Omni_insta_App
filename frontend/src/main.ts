import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// Lazy load non-critical imports
const lazyImports = {
  vuetify: () => import('./plugins/vuetify'),
  router: () => import('./router'),
  i18n: () => import('./plugins/i18n'),
  firebase: () => import('./services/firebase')
}

// Performance monitoring
import { getGlobalPerformanceMonitor, measureAsync } from '@/utils/performance'

// Setup performance monitoring early
if (typeof window !== 'undefined') {
  const monitor = getGlobalPerformanceMonitor()
  monitor.mark('app-init-start')
  
  // Track initial page load performance
  window.addEventListener('load', () => {
    monitor.mark('app-loaded')
    monitor.measure('app-load-time', 'app-init-start', 'app-loaded')
  })
}

// Error monitoring setup (lazy loaded)
let errorMonitoringInitialized = false
async function initializeErrorMonitoring() {
  if (errorMonitoringInitialized || typeof window === 'undefined') return
  
  try {
    // Only load error monitoring in production or when needed
    if (import.meta.env.PROD) {
      const { setupErrorMonitoring } = await import('@/utils/errorHandler')
      setupErrorMonitoring()
    }
    errorMonitoringInitialized = true
  } catch (error) {
    console.warn('Failed to initialize error monitoring:', error)
  }
}

// Performance interceptor setup (lazy loaded)
async function initializePerformanceInterceptor() {
  if (typeof window === 'undefined') return
  
  try {
    const { setupFetchInterceptor } = await import('@/utils/performanceInterceptor')
    setupFetchInterceptor()
  } catch (error) {
    console.warn('Failed to initialize performance interceptor:', error)
  }
}

// Create Vue app with minimal initial setup
const app = createApp(App)

// Add Pinia immediately (lightweight)
app.use(createPinia())

// Performance-optimized app initialization
async function initializeApp() {
  try {
    // Track initialization performance
    const monitor = getGlobalPerformanceMonitor()
    monitor.mark('plugins-init-start')

    // Initialize critical services in parallel
    const [
      { default: router },
      { default: vuetify },
      { default: i18n }
    ] = await Promise.all([
      lazyImports.router(),
      lazyImports.vuetify(),
      lazyImports.i18n(),
      // Initialize Firebase in background
      lazyImports.firebase().catch(error => {
        console.warn('Firebase initialization delayed:', error)
        return null
      })
    ])

    monitor.mark('plugins-loaded')

    // Install plugins
    app.use(router)
    app.use(vuetify)
    app.use(i18n)

    monitor.mark('plugins-installed')
    monitor.measure('plugins-load-time', 'plugins-init-start', 'plugins-loaded')
    monitor.measure('plugins-install-time', 'plugins-loaded', 'plugins-installed')

    // Mount the app
    monitor.mark('app-mount-start')
    app.mount('#app')
    monitor.mark('app-mounted')
    monitor.measure('app-mount-time', 'app-mount-start', 'app-mounted')

    // Initialize non-critical features after mount
    requestIdleCallback(() => {
      initializeErrorMonitoring()
      initializePerformanceInterceptor()
    })

  } catch (error) {
    console.error('Failed to initialize app:', error)
    
    // Fallback: try to mount with minimal setup
    try {
      app.mount('#app')
    } catch (mountError) {
      console.error('Critical error: Failed to mount app:', mountError)
    }
  }
}

// Global error handler for unhandled errors
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue error:', err, info)
  
  // Send error to monitoring service if available
  if (typeof window !== 'undefined' && window.__error_monitoring__) {
    window.__error_monitoring__.captureError(err, { context: info })
  }
}

// Global warning handler for development
if (import.meta.env.DEV) {
  app.config.warnHandler = (msg, instance, trace) => {
    console.warn('Vue warning:', msg, trace)
  }
}

// Performance configuration for production
if (import.meta.env.PROD) {
  // Disable Vue devtools in production
  app.config.performance = false
  
  // Enable production optimizations
  app.config.compilerOptions = {
    isCustomElement: (tag: string) => tag.startsWith('custom-')
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp)
} else {
  initializeApp()
}

// Preload critical routes for better perceived performance
if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
  requestIdleCallback(() => {
    // Preload dashboard and login routes
    Promise.all([
      import('@/views/DashboardView.vue'),
      import('@/views/LoginView.vue')
    ]).catch(() => {
      // Ignore preload errors
    })
  })
}

// Service Worker registration for PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('SW registered:', registration)
    } catch (error) {
      console.warn('SW registration failed:', error)
    }
  })
}

// Expose app instance for debugging in development
if (import.meta.env.DEV) {
  window.__VUE_APP__ = app
} 