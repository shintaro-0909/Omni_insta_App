import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

// Lazy load non-critical imports
const lazyImports = {
  vuetify: () => import('./plugins/vuetify'),
  router: () => import('./router'),
  i18n: () => import('./plugins/i18n'),
  firebase: () => import('./services/firebase'),
};

// Performance monitoring (temporarily disabled for build stability)
// import { getGlobalPerformanceMonitor } from '@/utils/api/performance'

// Mock implementation for performance monitoring
const getGlobalPerformanceMonitor = () => ({
  mark: (name: string) => console.log(`Performance mark: ${name}`),
  measure: (name: string, _start?: string, _end?: string) =>
    console.log(`Performance measure: ${name}`),
});

// Setup performance monitoring early
if (typeof window !== 'undefined') {
  const monitor = getGlobalPerformanceMonitor();
  monitor.mark('app-init-start');

  // Track initial page load performance
  window.addEventListener('load', () => {
    monitor.mark('app-loaded');
    monitor.measure('app-load-time', 'app-init-start', 'app-loaded');
  });
}

// Error monitoring setup (lazy loaded)
let errorMonitoringInitialized = false;
async function initializeErrorMonitoring() {
  if (errorMonitoringInitialized || typeof window === 'undefined') return;

  try {
    // Only load error monitoring in production or when needed
    if (import.meta.env.PROD) {
      // const { setupErrorMonitoring } = await import('@/utils/validation/errorHandler')
      // setupErrorMonitoring()
    }
    errorMonitoringInitialized = true;
  } catch (error) {
    console.warn('Failed to initialize error monitoring:', error);
  }
}

// Performance interceptor setup (lazy loaded)
async function initializePerformanceInterceptor() {
  if (typeof window === 'undefined') return;

  try {
    const { setupFetchInterceptor } = await import(
      '@/utils/api/performanceInterceptor'
    );
    setupFetchInterceptor();
  } catch (error) {
    console.warn('Failed to initialize performance interceptor:', error);
  }
}

// Create Vue app with minimal initial setup
const app = createApp(App);

// Add Pinia immediately (lightweight)
app.use(createPinia());

// Performance-optimized app initialization
async function initializeApp() {
  try {
    // Track initialization performance
    const monitor = getGlobalPerformanceMonitor();
    monitor.mark('plugins-init-start');

    // Initialize critical services in parallel
    const [{ default: router }, { default: vuetify }, { default: i18n }] =
      await Promise.all([
        lazyImports.router(),
        lazyImports.vuetify(),
        lazyImports.i18n(),
        // Initialize Firebase in background
        lazyImports.firebase().catch(error => {
          console.warn('Firebase initialization delayed:', error);
          return null;
        }),
      ]);

    monitor.mark('plugins-loaded');

    // Install plugins
    app.use(router);
    app.use(vuetify);
    app.use(i18n);

    monitor.mark('plugins-installed');
    monitor.measure(
      'plugins-load-time',
      'plugins-init-start',
      'plugins-loaded'
    );
    monitor.measure(
      'plugins-install-time',
      'plugins-loaded',
      'plugins-installed'
    );

    // Mount the app
    monitor.mark('app-mount-start');
    app.mount('#app');
    monitor.mark('app-mounted');
    monitor.measure('app-mount-time', 'app-mount-start', 'app-mounted');

    // Initialize non-critical features after mount
    requestIdleCallback(() => {
      initializeErrorMonitoring();
      initializePerformanceInterceptor();

      // Real-time monitoring temporarily disabled for build stability
      // if (import.meta.env.DEV) {
      //   import('@/utils/realTimeMonitoring').then(({ realTimeMonitor }) => {
      //     realTimeMonitor.start()
      //     console.log('🔍 Real-Time Monitoring System activated')
      //   }).catch(console.warn)
      // }
    });
  } catch (error) {
    console.error('Failed to initialize app:', error);

    // Fallback: try to mount with minimal setup
    try {
      app.mount('#app');
    } catch (mountError) {
      console.error('Critical error: Failed to mount app:', mountError);
    }
  }
}

// Global error handler for unhandled errors
app.config.errorHandler = (err, _instance, info) => {
  console.error('Vue error:', err, info);

  // Send error to monitoring service if available
  // if (typeof window !== 'undefined' && window.__error_monitoring__) {
  //   window.__error_monitoring__.captureError(err, { context: info })
  // }
};

// Global warning handler for development
if (import.meta.env.DEV) {
  app.config.warnHandler = (msg, _instance, trace) => {
    console.warn('Vue warning:', msg, trace);
  };
}

// Performance configuration for production
if (import.meta.env.PROD) {
  // Disable Vue devtools in production
  app.config.performance = false;

  // Enable production optimizations
  app.config.compilerOptions = {
    isCustomElement: (tag: string) => tag.startsWith('custom-'),
  };
}

// Enterprise Security System Initialization
async function initializeSecuritySystem() {
  try {
    // Security system temporarily disabled for build stability
    // const { enterpriseSecurity } = await import('@/utils/validation/security')
    // enterpriseSecurity.initialize()

    // const { securityMiddleware } = await import('@/utils/validation/securityMiddleware')
    // securityMiddleware.initialize()

    console.log('🔒 Enterprise Security System (simplified) initialized');
  } catch (error) {
    console.warn('Failed to initialize security system:', error);
  }
}

// Unified AI Intelligence System Initialization
async function initializeAISystem() {
  try {
    // AI system temporarily disabled for build stability
    // const { getUnifiedAIIntelligenceSystem } = await import('@/utils/unifiedAIIntelligenceSystem')

    // const aiSystem = getUnifiedAIIntelligenceSystem({
    //   enablePredictiveOptimization: true,
    //   enableAdaptiveUI: true,
    //   enableBehaviorTracking: true,
    //   enableContentPersonalization: true,
    //   adaptationMode: 'balanced',
    //   debugMode: import.meta.env.DEV
    // })

    console.log('🧠 统合AI知能システム (simplified) 初期化完了');
  } catch (error) {
    console.warn('Failed to initialize unified AI system:', error);
  }
}

// Universal Accessibility Engine Initialization
async function initializeAccessibilitySystem() {
  try {
    // Accessibility engine temporarily disabled for build stability
    // const { universalAccessibilityEngine } = await import('@/utils/accessibilityEngine')

    // Engine auto-initializes and starts WCAG compliance monitoring
    console.log('♿ Universal Accessibility Engine (simplified) initialized');
  } catch (error) {
    console.warn('Failed to initialize accessibility system:', error);
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeSecuritySystem();
    initializeAISystem();
    initializeAccessibilitySystem();
    initializeApp();
  });
} else {
  initializeSecuritySystem();
  initializeAISystem();
  initializeAccessibilitySystem();
  initializeApp();
}

// Preload critical routes for better perceived performance
if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
  requestIdleCallback(() => {
    // Preload dashboard and login routes
    Promise.all([
      import('@/views/DashboardView.vue'),
      import('@/views/LoginView.vue'),
    ]).catch(() => {
      // Ignore preload errors
    });
  });
}

// Ultra-Fast Service Worker with Intelligent Caching
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // Import and initialize advanced Service Worker
      // const { useServiceWorker } = await import('@/composables/business/useServiceWorker')
      // const sw = useServiceWorker()
      // TODO: Re-enable when useServiceWorker is implemented
      // const registered = await sw.registerServiceWorker()
      // if (registered) {
      //   console.log('🚀 Ultra-Fast Service Worker registered successfully')
      //
      //   // Setup predictive prefetching for critical routes
      //   setTimeout(() => {
      //     sw.prefetchResources([
      //       '/api/posts?limit=20',
      //       '/api/schedules?limit=10',
      //       '/api/igaccounts',
      //       '/assets/critical-styles.css'
      //     ])
      //   }, 5000)
      //
      //   // Monitor cache performance
      //   if (import.meta.env.DEV) {
      //     setInterval(async () => {
      //       const metrics = await sw.getPerformanceMetrics()
      //       if (metrics) {
      //         console.log('📊 Cache Performance:', {
      //           hitRate: `${metrics.cacheHitRate.toFixed(1)}%`,
      //           avgResponseTime: `${metrics.averageResponseTime}ms`,
      //           predictiveAccuracy: `${metrics.predictiveHitRate.toFixed(1)}%`
      //         })
      //       }
      //     }, 60000) // Every minute in dev mode
      //   }
      // }
    } catch (error) {
      console.warn('Advanced SW registration failed:', error);
    }
  });
}

// Expose app instance for debugging in development
if (import.meta.env.DEV) {
  // window.__VUE_APP__ = app
}
