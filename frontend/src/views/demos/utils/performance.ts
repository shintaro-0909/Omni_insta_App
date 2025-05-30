/**
 * Performance optimization utilities for demo styles
 */

// Intersection Observer for lazy loading and animations
export const createIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
): IntersectionObserver => {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
    ...options
  }
  
  return new IntersectionObserver(callback, defaultOptions)
}

// Debounce function for performance-critical events
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number,
  immediate = false
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    
    const callNow = immediate && !timeout
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    
    if (callNow) func(...args)
  }
}

// Throttle function for scroll and resize events
export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Request animation frame with fallback
export const requestAnimationFrame = 
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  ((callback: FrameRequestCallback) => setTimeout(callback, 1000 / 60))

export const cancelAnimationFrame = 
  window.cancelAnimationFrame ||
  window.webkitCancelAnimationFrame ||
  clearTimeout

// Performance monitoring
export class PerformanceMonitor {
  private metrics: Map<string, number> = new Map()
  private observers: PerformanceObserver[] = []

  constructor() {
    this.initializeObservers()
  }

  private initializeObservers() {
    // Long task observer
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            console.warn(`Long task detected: ${entry.duration}ms`, entry)
          })
        })
        longTaskObserver.observe({ entryTypes: ['longtask'] })
        this.observers.push(longTaskObserver)
      } catch (e) {
        // PerformanceObserver not supported
      }

      // Layout shift observer
      try {
        const layoutShiftObserver = new PerformanceObserver((list) => {
          let clsValue = 0
          list.getEntries().forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          })
          if (clsValue > 0.1) {
            console.warn(`Layout shift detected: ${clsValue}`)
          }
        })
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] })
        this.observers.push(layoutShiftObserver)
      } catch (e) {
        // Layout shift observer not supported
      }
    }
  }

  startTiming(label: string) {
    this.metrics.set(label, performance.now())
  }

  endTiming(label: string): number {
    const startTime = this.metrics.get(label)
    if (startTime === undefined) {
      console.warn(`No start time found for label: ${label}`)
      return 0
    }
    
    const duration = performance.now() - startTime
    this.metrics.delete(label)
    
    if (duration > 100) {
      console.warn(`Slow operation detected: ${label} took ${duration.toFixed(2)}ms`)
    }
    
    return duration
  }

  measureAsync<T>(label: string, asyncFunction: () => Promise<T>): Promise<T> {
    this.startTiming(label)
    return asyncFunction().finally(() => {
      this.endTiming(label)
    })
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.metrics.clear()
  }
}

// Image optimization utilities
export const optimizeImage = (
  src: string,
  width?: number,
  height?: number,
  quality = 80
): string => {
  // For demo purposes, using a service like Cloudinary or similar
  // In real implementation, you would integrate with your image optimization service
  if (src.includes('picsum.photos')) {
    const params = new URLSearchParams()
    if (width) params.set('w', width.toString())
    if (height) params.set('h', height.toString())
    if (quality < 100) params.set('q', quality.toString())
    
    const paramString = params.toString()
    return paramString ? `${src}?${paramString}` : src
  }
  
  return src
}

// Lazy loading utility
export const createLazyLoader = () => {
  const imageObserver = createIntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        const src = img.dataset.src
        
        if (src) {
          img.src = src
          img.removeAttribute('data-src')
          imageObserver.unobserve(img)
        }
      }
    })
  }, { rootMargin: '50px' })

  return {
    observe: (element: HTMLImageElement) => imageObserver.observe(element),
    disconnect: () => imageObserver.disconnect()
  }
}

// Animation utilities
export const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
}

export const easeOutQuart = (t: number): number => {
  return 1 - (--t) * t * t * t
}

export const animate = (
  from: number,
  to: number,
  duration: number,
  callback: (value: number) => void,
  easing: (t: number) => number = easeInOutCubic
): () => void => {
  const startTime = performance.now()
  let animationId: number

  const step = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easedProgress = easing(progress)
    const value = from + (to - from) * easedProgress

    callback(value)

    if (progress < 1) {
      animationId = requestAnimationFrame(step)
    }
  }

  animationId = requestAnimationFrame(step)

  return () => cancelAnimationFrame(animationId)
}

// Reduced motion detection
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Memory management
export const createMemoryManager = () => {
  const listeners: Array<() => void> = []
  const timers: Array<NodeJS.Timeout> = []
  const observers: Array<{ disconnect: () => void }> = []

  return {
    addListener: (element: EventTarget, event: string, handler: EventListener) => {
      element.addEventListener(event, handler)
      listeners.push(() => element.removeEventListener(event, handler))
    },

    addTimer: (timer: NodeJS.Timeout) => {
      timers.push(timer)
    },

    addObserver: (observer: { disconnect: () => void }) => {
      observers.push(observer)
    },

    cleanup: () => {
      listeners.forEach(cleanup => cleanup())
      timers.forEach(timer => clearTimeout(timer))
      observers.forEach(observer => observer.disconnect())
      
      listeners.length = 0
      timers.length = 0
      observers.length = 0
    }
  }
}

// CSS animation utilities
export const addCSSAnimation = (
  element: HTMLElement,
  animationClass: string,
  duration = 300
): Promise<void> => {
  return new Promise((resolve) => {
    const handleAnimationEnd = () => {
      element.classList.remove(animationClass)
      element.removeEventListener('animationend', handleAnimationEnd)
      resolve()
    }

    element.addEventListener('animationend', handleAnimationEnd)
    element.classList.add(animationClass)

    // Fallback timeout
    setTimeout(() => {
      element.classList.remove(animationClass)
      element.removeEventListener('animationend', handleAnimationEnd)
      resolve()
    }, duration + 100)
  })
}

// Viewport utilities
export const getViewportSize = () => ({
  width: window.innerWidth || document.documentElement.clientWidth,
  height: window.innerHeight || document.documentElement.clientHeight
})

export const isElementInViewport = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect()
  const viewport = getViewportSize()
  
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= viewport.height &&
    rect.right <= viewport.width
  )
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    performanceMonitor.cleanup()
  })
}