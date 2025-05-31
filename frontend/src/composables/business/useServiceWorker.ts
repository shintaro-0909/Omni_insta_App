/**
 * Service Worker Integration Composable
 * Manages ultra-fast Service Worker with intelligent predictive caching
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'

interface ServiceWorkerState {
  isSupported: boolean
  isRegistered: boolean
  isUpdateAvailable: boolean
  registration: ServiceWorkerRegistration | null
  performanceMetrics: PerformanceMetrics | null
}

interface PerformanceMetrics {
  cacheHits: number
  cacheMisses: number
  networkRequests: number
  averageResponseTime: number
  predictiveHits: number
  cacheHitRate: number
  totalRequests: number
  predictiveHitRate: number
}

interface UserBehavior {
  clickTarget: string
  currentPath: string
  timestamp: number
}

export function useServiceWorker() {
  const state = ref<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isUpdateAvailable: false,
    registration: null,
    performanceMetrics: null
  })

  const isOnline = ref(navigator.onLine)
  const swController = ref<ServiceWorker | null>(null)
  const updatePrompt = ref(false)

  // Computed properties
  const cacheEfficiency = computed(() => {
    if (!state.value.performanceMetrics) return 0
    return state.value.performanceMetrics.cacheHitRate || 0
  })

  const averageResponseTime = computed(() => {
    if (!state.value.performanceMetrics) return 0
    return Math.round(state.value.performanceMetrics.averageResponseTime || 0)
  })

  const predictiveAccuracy = computed(() => {
    if (!state.value.performanceMetrics) return 0
    return state.value.performanceMetrics.predictiveHitRate || 0
  })

  /**
   * Register Service Worker with advanced features
   */
  async function registerServiceWorker(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported')
      return false
    }

    try {
      state.value.isSupported = true

      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      })

      state.value.registration = registration
      state.value.isRegistered = true

      console.log('🚀 Ultra-Fast Service Worker registered successfully')

      // Setup event listeners
      setupServiceWorkerListeners(registration)

      // Start performance monitoring
      startPerformanceMonitoring()

      // Setup user behavior tracking
      setupBehaviorTracking()

      return true

    } catch (error) {
      console.error('Service Worker registration failed:', error)
      return false
    }
  }

  /**
   * Setup Service Worker event listeners
   */
  function setupServiceWorkerListeners(registration: ServiceWorkerRegistration) {
    // Listen for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (!newWorker) return

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          state.value.isUpdateAvailable = true
          updatePrompt.value = true
          console.log('🔄 New Service Worker version available')
        }
      })
    })

    // Listen for controller changes
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      swController.value = navigator.serviceWorker.controller
      console.log('🎛️ Service Worker controller changed')
      
      // Reload the page to ensure new SW is active
      if (state.value.isUpdateAvailable) {
        window.location.reload()
      }
    })

    // Set initial controller
    swController.value = navigator.serviceWorker.controller
  }

  /**
   * Start performance monitoring
   */
  function startPerformanceMonitoring() {
    // Get performance metrics every 30 seconds
    setInterval(async () => {
      try {
        const metrics = await getPerformanceMetrics()
        state.value.performanceMetrics = metrics
      } catch (error) {
        console.warn('Failed to get performance metrics:', error)
      }
    }, 30000)

    // Initial metrics load
    setTimeout(async () => {
      try {
        const metrics = await getPerformanceMetrics()
        state.value.performanceMetrics = metrics
      } catch (error) {
        console.warn('Failed to get initial performance metrics:', error)
      }
    }, 5000)
  }

  /**
   * Get performance metrics from Service Worker
   */
  async function getPerformanceMetrics(): Promise<PerformanceMetrics | null> {
    if (!swController.value) return null

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel()
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data)
      }

      swController.value.postMessage(
        { type: 'GET_PERFORMANCE_METRICS' },
        [messageChannel.port2]
      )

      // Timeout after 5 seconds
      setTimeout(() => resolve(null), 5000)
    })
  }

  /**
   * Setup user behavior tracking
   */
  function setupBehaviorTracking() {
    // Track page navigation
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState

    history.pushState = function(...args) {
      originalPushState.apply(history, args)
      trackUserBehavior({ 
        clickTarget: 'navigation', 
        currentPath: location.pathname,
        timestamp: Date.now()
      })
    }

    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args)
      trackUserBehavior({ 
        clickTarget: 'navigation', 
        currentPath: location.pathname,
        timestamp: Date.now()
      })
    }

    // Track clicks on important elements
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      const clickTarget = getClickTarget(target)
      
      if (clickTarget) {
        trackUserBehavior({
          clickTarget,
          currentPath: location.pathname,
          timestamp: Date.now()
        })
      }
    })
  }

  /**
   * Get meaningful click target identifier
   */
  function getClickTarget(element: HTMLElement): string | null {
    // Check for data attributes
    if (element.dataset.track) {
      return element.dataset.track
    }

    // Check for navigation elements
    if (element.matches('nav a, .nav-link, [role="menuitem"]')) {
      return element.textContent?.toLowerCase().replace(/\s+/g, '-') + '-nav' || 'nav-link'
    }

    // Check for buttons
    if (element.matches('button, .btn, [role="button"]')) {
      const text = element.textContent?.toLowerCase().replace(/\s+/g, '-')
      return text ? `${text}-btn` : 'button'
    }

    // Check for form elements
    if (element.matches('form, input, textarea, select')) {
      return element.getAttribute('name') || element.getAttribute('id') || 'form-element'
    }

    // Check for cards or list items
    if (element.matches('.card, .list-item, [data-item]')) {
      return 'content-item'
    }

    return null
  }

  /**
   * Track user behavior and send to Service Worker
   */
  function trackUserBehavior(behavior: UserBehavior) {
    if (!swController.value) return

    swController.value.postMessage({
      type: 'UPDATE_USER_BEHAVIOR',
      data: behavior
    })
  }

  /**
   * Prefetch resources based on user intent
   */
  async function prefetchResources(urls: string[]) {
    if (!swController.value) return

    swController.value.postMessage({
      type: 'PREFETCH_RESOURCES',
      data: { urls }
    })

    console.log(`📦 Prefetching ${urls.length} resources`)
  }

  /**
   * Clear specific cache type
   */
  async function clearCache(cacheType: 'static' | 'dynamic' | 'api' | 'images') {
    if (!swController.value) return

    swController.value.postMessage({
      type: 'CLEAR_CACHE',
      data: { cacheType }
    })

    console.log(`🗑️ Cleared ${cacheType} cache`)
  }

  /**
   * Update Service Worker to latest version
   */
  async function updateServiceWorker() {
    if (!state.value.registration) return

    try {
      // Tell the new SW to skip waiting
      if (state.value.registration.waiting) {
        state.value.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      }

      // Force update check
      await state.value.registration.update()
      
      state.value.isUpdateAvailable = false
      updatePrompt.value = false

      console.log('🔄 Service Worker updated successfully')

    } catch (error) {
      console.error('Failed to update Service Worker:', error)
    }
  }

  /**
   * Dismiss update prompt
   */
  function dismissUpdate() {
    updatePrompt.value = false
  }

  /**
   * Get cache status for debugging
   */
  async function getCacheStatus() {
    if (!('caches' in window)) return null

    const cacheNames = await caches.keys()
    const cacheStatus = await Promise.all(
      cacheNames.map(async (name) => {
        const cache = await caches.open(name)
        const keys = await cache.keys()
        return {
          name,
          size: keys.length,
          urls: keys.slice(0, 5).map(req => req.url) // First 5 URLs
        }
      })
    )

    return cacheStatus
  }

  /**
   * Monitor network status
   */
  function setupNetworkMonitoring() {
    const updateOnlineStatus = () => {
      isOnline.value = navigator.onLine
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }

  // Lifecycle hooks
  onMounted(() => {
    registerServiceWorker()
    setupNetworkMonitoring()
  })

  onUnmounted(() => {
    // Cleanup is handled by the return value of setupNetworkMonitoring
  })

  return {
    // State
    state: readonly(state),
    isOnline: readonly(isOnline),
    updatePrompt: readonly(updatePrompt),

    // Computed
    cacheEfficiency,
    averageResponseTime,
    predictiveAccuracy,

    // Methods
    registerServiceWorker,
    updateServiceWorker,
    dismissUpdate,
    prefetchResources,
    clearCache,
    getCacheStatus,
    getPerformanceMetrics,
    trackUserBehavior
  }
}

// Global Service Worker utilities
export const swUtils = {
  /**
   * Check if running in PWA mode
   */
  isPWA(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone ||
           document.referrer.includes('android-app://')
  },

  /**
   * Show install prompt for PWA
   */
  async showInstallPrompt(): Promise<boolean> {
    const deferredPrompt = (window as any).deferredPrompt
    
    if (!deferredPrompt) {
      console.log('Install prompt not available')
      return false
    }

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('PWA install accepted')
        return true
      } else {
        console.log('PWA install dismissed')
        return false
      }
    } catch (error) {
      console.error('Install prompt failed:', error)
      return false
    }
  },

  /**
   * Estimate cache storage usage
   */
  async getStorageUsage(): Promise<{ used: number; quota: number; percentage: number } | null> {
    if (!('storage' in navigator && 'estimate' in navigator.storage)) {
      return null
    }

    try {
      const estimate = await navigator.storage.estimate()
      const used = estimate.usage || 0
      const quota = estimate.quota || 0
      const percentage = quota > 0 ? (used / quota) * 100 : 0

      return {
        used: Math.round(used / 1024 / 1024), // MB
        quota: Math.round(quota / 1024 / 1024), // MB
        percentage: Math.round(percentage)
      }
    } catch (error) {
      console.error('Failed to get storage estimate:', error)
      return null
    }
  }
}