/**
 * Performance monitoring utilities for Omniy Instagram Scheduler
 * Provides comprehensive performance tracking and optimization tools
 */

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  metadata?: Record<string, any>
}

interface PerformanceConfig {
  enableLogging: boolean
  enableWebVitals: boolean
  enableResourceTiming: boolean
  enableUserTiming: boolean
  sampleRate: number
}

class PerformanceMonitor {
  private config: PerformanceConfig
  private metrics: PerformanceMetric[] = []
  private observers: PerformanceObserver[] = []
  private memoryCheckInterval?: number

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enableLogging: true,
      enableWebVitals: true,
      enableResourceTiming: true,
      enableUserTiming: true,
      sampleRate: 1.0,
      ...config
    }

    this.initialize()
  }

  private initialize() {
    if (typeof window === 'undefined') return

    // Initialize Web Vitals monitoring
    if (this.config.enableWebVitals) {
      this.initWebVitals()
    }

    // Initialize Resource Timing monitoring
    if (this.config.enableResourceTiming) {
      this.initResourceTiming()
    }

    // Initialize User Timing monitoring
    if (this.config.enableUserTiming) {
      this.initUserTiming()
    }

    // Monitor memory usage
    this.initMemoryMonitoring()

    // Monitor long tasks
    this.initLongTaskMonitoring()
  }

  private initWebVitals() {
    // Core Web Vitals monitoring
    const observeWebVital = (name: string) => {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric({
              name,
              value: entry.value || (entry as any).duration,
              timestamp: Date.now(),
              metadata: {
                entryType: entry.entryType,
                startTime: entry.startTime
              }
            })
          }
        })
        observer.observe({ entryTypes: [name === 'CLS' ? 'layout-shift' : 'largest-contentful-paint'] })
        this.observers.push(observer)
      } catch (error) {
        console.warn(`Failed to observe ${name}:`, error)
      }
    }

    // Largest Contentful Paint
    observeWebVital('LCP')

    // Cumulative Layout Shift
    if ('PerformanceObserver' in window) {
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value
            }
          }
          if (clsValue > 0) {
            this.recordMetric({
              name: 'CLS',
              value: clsValue,
              timestamp: Date.now()
            })
          }
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
        this.observers.push(clsObserver)
      } catch (error) {
        console.warn('Failed to observe CLS:', error)
      }
    }

    // First Input Delay
    if ('PerformanceObserver' in window) {
      try {
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric({
              name: 'FID',
              value: (entry as any).processingStart - entry.startTime,
              timestamp: Date.now(),
              metadata: {
                entryType: entry.entryType,
                startTime: entry.startTime
              }
            })
          }
        })
        fidObserver.observe({ entryTypes: ['first-input'] })
        this.observers.push(fidObserver)
      } catch (error) {
        console.warn('Failed to observe FID:', error)
      }
    }
  }

  private initResourceTiming() {
    if (!('PerformanceObserver' in window)) return

    try {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resource = entry as PerformanceResourceTiming
          
          // Only track significant resources
          if (resource.duration > 100 || resource.transferSize > 10000) {
            this.recordMetric({
              name: 'resource-timing',
              value: resource.duration,
              timestamp: Date.now(),
              metadata: {
                name: resource.name,
                transferSize: resource.transferSize,
                encodedBodySize: resource.encodedBodySize,
                decodedBodySize: resource.decodedBodySize,
                initiatorType: resource.initiatorType
              }
            })
          }
        }
      })
      
      resourceObserver.observe({ entryTypes: ['resource'] })
      this.observers.push(resourceObserver)
    } catch (error) {
      console.warn('Failed to observe resource timing:', error)
    }
  }

  private initUserTiming() {
    if (!('PerformanceObserver' in window)) return

    try {
      const userTimingObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric({
            name: `user-timing-${entry.entryType}`,
            value: entry.duration || 0,
            timestamp: Date.now(),
            metadata: {
              name: entry.name,
              entryType: entry.entryType,
              startTime: entry.startTime
            }
          })
        }
      })
      
      userTimingObserver.observe({ entryTypes: ['measure', 'mark'] })
      this.observers.push(userTimingObserver)
    } catch (error) {
      console.warn('Failed to observe user timing:', error)
    }
  }

  private initMemoryMonitoring() {
    if (typeof window === 'undefined' || !('memory' in performance)) return

    this.memoryCheckInterval = window.setInterval(() => {
      const memory = (performance as any).memory
      if (memory) {
        this.recordMetric({
          name: 'memory-usage',
          value: memory.usedJSHeapSize,
          timestamp: Date.now(),
          metadata: {
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit,
            usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
          }
        })
      }
    }, 30000) // Check every 30 seconds
  }

  private initLongTaskMonitoring() {
    if (!('PerformanceObserver' in window)) return

    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric({
            name: 'long-task',
            value: entry.duration,
            timestamp: Date.now(),
            metadata: {
              startTime: entry.startTime,
              attribution: (entry as any).attribution
            }
          })
        }
      })
      
      longTaskObserver.observe({ entryTypes: ['longtask'] })
      this.observers.push(longTaskObserver)
    } catch (error) {
      console.warn('Failed to observe long tasks:', error)
    }
  }

  private recordMetric(metric: PerformanceMetric) {
    // Sample rate check
    if (Math.random() > this.config.sampleRate) return

    this.metrics.push(metric)

    // Log if enabled
    if (this.config.enableLogging) {
      console.groupCollapsed(`📊 Performance: ${metric.name}`)
      console.log('Value:', metric.value)
      console.log('Timestamp:', new Date(metric.timestamp).toISOString())
      if (metric.metadata) {
        console.log('Metadata:', metric.metadata)
      }
      console.groupEnd()
    }

    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500)
    }
  }

  // Public API methods
  public mark(name: string, metadata?: Record<string, any>) {
    if (typeof window === 'undefined') return

    performance.mark(name)
    this.recordMetric({
      name: `mark-${name}`,
      value: performance.now(),
      timestamp: Date.now(),
      metadata
    })
  }

  public measure(name: string, startMark?: string, endMark?: string, metadata?: Record<string, any>) {
    if (typeof window === 'undefined') return

    const measureName = `measure-${name}`
    performance.measure(measureName, startMark, endMark)
    
    const entries = performance.getEntriesByName(measureName, 'measure')
    if (entries.length > 0) {
      const measure = entries[entries.length - 1]
      this.recordMetric({
        name: measureName,
        value: measure.duration,
        timestamp: Date.now(),
        metadata
      })
    }
  }

  public getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(metric => metric.name === name)
    }
    return [...this.metrics]
  }

  public getAverageMetric(name: string): number {
    const metrics = this.getMetrics(name)
    if (metrics.length === 0) return 0
    
    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0)
    return sum / metrics.length
  }

  public clearMetrics() {
    this.metrics = []
  }

  public destroy() {
    // Clean up observers
    this.observers.forEach(observer => {
      try {
        observer.disconnect()
      } catch (error) {
        console.warn('Failed to disconnect observer:', error)
      }
    })
    this.observers = []

    // Clear memory check interval
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval)
      this.memoryCheckInterval = undefined
    }

    // Clear metrics
    this.clearMetrics()
  }
}

// Global performance monitor instance
let globalPerformanceMonitor: PerformanceMonitor | null = null

export function createPerformanceMonitor(config?: Partial<PerformanceConfig>): PerformanceMonitor {
  return new PerformanceMonitor(config)
}

export function getGlobalPerformanceMonitor(): PerformanceMonitor {
  if (!globalPerformanceMonitor) {
    globalPerformanceMonitor = new PerformanceMonitor({
      enableLogging: import.meta.env.DEV,
      sampleRate: import.meta.env.PROD ? 0.1 : 1.0
    })
  }
  return globalPerformanceMonitor
}

// Utility functions for common performance measurements
export function measureAsync<T>(
  name: string,
  asyncFn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const monitor = getGlobalPerformanceMonitor()
  const startMark = `${name}-start`
  const endMark = `${name}-end`
  
  monitor.mark(startMark)
  
  return asyncFn()
    .then(result => {
      monitor.mark(endMark)
      monitor.measure(name, startMark, endMark, metadata)
      return result
    })
    .catch(error => {
      monitor.mark(endMark)
      monitor.measure(name, startMark, endMark, { ...metadata, error: true })
      throw error
    })
}

export function measureSync<T>(
  name: string,
  syncFn: () => T,
  metadata?: Record<string, any>
): T {
  const monitor = getGlobalPerformanceMonitor()
  const startMark = `${name}-start`
  const endMark = `${name}-end`
  
  monitor.mark(startMark)
  
  try {
    const result = syncFn()
    monitor.mark(endMark)
    monitor.measure(name, startMark, endMark, metadata)
    return result
  } catch (error) {
    monitor.mark(endMark)
    monitor.measure(name, startMark, endMark, { ...metadata, error: true })
    throw error
  }
}

// Route change performance tracking
export function trackRouteChange(to: string, from: string) {
  const monitor = getGlobalPerformanceMonitor()
  monitor.mark('route-change', {
    to,
    from,
    timestamp: Date.now()
  })
}

// Component render performance tracking
export function trackComponentRender(componentName: string, renderTime: number) {
  const monitor = getGlobalPerformanceMonitor()
  monitor.recordMetric({
    name: 'component-render',
    value: renderTime,
    timestamp: Date.now(),
    metadata: { componentName }
  })
}

export { PerformanceMonitor, type PerformanceMetric, type PerformanceConfig }