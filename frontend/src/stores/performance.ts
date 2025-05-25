import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals'

export interface PerformanceMetrics {
  // Core Web Vitals
  LCP?: number // Largest Contentful Paint
  FID?: number // First Input Delay
  CLS?: number // Cumulative Layout Shift
  
  // Other important metrics
  FCP?: number // First Contentful Paint
  TTFB?: number // Time to First Byte
  
  // App-specific metrics
  loadTime?: number
  renderTime?: number
  apiCallTimes: Record<string, number[]>
  errorCount: number
  
  // Cold start metrics (for Cloud Functions)
  coldStartCount: number
  coldStartTimes: number[]
}

export interface PerformanceThresholds {
  LCP: { good: number; needsImprovement: number }
  FID: { good: number; needsImprovement: number }
  CLS: { good: number; needsImprovement: number }
  FCP: { good: number; needsImprovement: number }
  TTFB: { good: number; needsImprovement: number }
}

// Performance thresholds based on Google's Core Web Vitals
const PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  LCP: { good: 2500, needsImprovement: 4000 },
  FID: { good: 100, needsImprovement: 300 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FCP: { good: 1800, needsImprovement: 3000 },
  TTFB: { good: 800, needsImprovement: 1800 }
}

export const usePerformanceStore = defineStore('performance', () => {
  // State
  const metrics = ref<PerformanceMetrics>({
    apiCallTimes: {},
    errorCount: 0,
    coldStartCount: 0,
    coldStartTimes: []
  })
  
  const isInitialized = ref(false)
  const lastUpdated = ref<Date | null>(null)

  // Computed
  const overallScore = computed(() => {
    const m = metrics.value
    if (!m.LCP || !m.FID || !m.CLS) return null
    
    let score = 0
    let count = 0
    
    // LCP Score (0-100)
    if (m.LCP <= PERFORMANCE_THRESHOLDS.LCP.good) score += 100
    else if (m.LCP <= PERFORMANCE_THRESHOLDS.LCP.needsImprovement) score += 75
    else score += 25
    count++
    
    // FID Score (0-100)
    if (m.FID <= PERFORMANCE_THRESHOLDS.FID.good) score += 100
    else if (m.FID <= PERFORMANCE_THRESHOLDS.FID.needsImprovement) score += 75
    else score += 25
    count++
    
    // CLS Score (0-100)
    if (m.CLS <= PERFORMANCE_THRESHOLDS.CLS.good) score += 100
    else if (m.CLS <= PERFORMANCE_THRESHOLDS.CLS.needsImprovement) score += 75
    else score += 25
    count++
    
    return Math.round(score / count)
  })
  
  const averageApiCallTime = computed(() => {
    const allTimes = Object.values(metrics.value.apiCallTimes).flat()
    if (allTimes.length === 0) return 0
    return allTimes.reduce((sum, time) => sum + time, 0) / allTimes.length
  })
  
  const averageColdStartTime = computed(() => {
    const times = metrics.value.coldStartTimes
    if (times.length === 0) return 0
    return times.reduce((sum, time) => sum + time, 0) / times.length
  })

  // Actions
  const initializeWebVitals = () => {
    if (isInitialized.value) return
    
    // Track Core Web Vitals
    onLCP((metric: Metric) => {
      metrics.value.LCP = metric.value
      updateLastUpdated()
    })
    
    onINP((metric: Metric) => {
      metrics.value.FID = metric.value
      updateLastUpdated()
    })
    
    onCLS((metric: Metric) => {
      metrics.value.CLS = metric.value
      updateLastUpdated()
    })
    
    onFCP((metric: Metric) => {
      metrics.value.FCP = metric.value
      updateLastUpdated()
    })
    
    onTTFB((metric: Metric) => {
      metrics.value.TTFB = metric.value
      updateLastUpdated()
    })
    
    // Track page load time
    if (typeof window !== 'undefined' && window.performance) {
      const loadComplete = performance.now()
      metrics.value.loadTime = loadComplete
      updateLastUpdated()
    }
    
    isInitialized.value = true
  }
  
  const trackApiCall = (endpoint: string, duration: number, isColdStart = false) => {
    if (!metrics.value.apiCallTimes[endpoint]) {
      metrics.value.apiCallTimes[endpoint] = []
    }
    
    metrics.value.apiCallTimes[endpoint].push(duration)
    
    // Track cold starts
    if (isColdStart) {
      metrics.value.coldStartCount++
      metrics.value.coldStartTimes.push(duration)
    }
    
    // Keep only last 50 measurements per endpoint to prevent memory issues
    if (metrics.value.apiCallTimes[endpoint].length > 50) {
      metrics.value.apiCallTimes[endpoint] = metrics.value.apiCallTimes[endpoint].slice(-50)
    }
    
    updateLastUpdated()
  }
  
  const trackError = () => {
    metrics.value.errorCount++
    updateLastUpdated()
  }
  
  const updateLastUpdated = () => {
    lastUpdated.value = new Date()
  }
  
  const getMetricStatus = (metric: keyof PerformanceThresholds, value: number) => {
    const threshold = PERFORMANCE_THRESHOLDS[metric]
    if (value <= threshold.good) return 'good'
    if (value <= threshold.needsImprovement) return 'needs-improvement'
    return 'poor'
  }
  
  const resetMetrics = () => {
    metrics.value = {
      apiCallTimes: {},
      errorCount: 0,
      coldStartCount: 0,
      coldStartTimes: []
    }
    lastUpdated.value = null
  }
  
  const exportMetrics = () => {
    return {
      ...metrics.value,
      overallScore: overallScore.value,
      averageApiCallTime: averageApiCallTime.value,
      averageColdStartTime: averageColdStartTime.value,
      lastUpdated: lastUpdated.value,
      timestamp: new Date().toISOString()
    }
  }

  return {
    // State
    metrics,
    isInitialized,
    lastUpdated,
    
    // Computed
    overallScore,
    averageApiCallTime,
    averageColdStartTime,
    
    // Actions
    initializeWebVitals,
    trackApiCall,
    trackError,
    getMetricStatus,
    resetMetrics,
    exportMetrics,
    
    // Constants
    PERFORMANCE_THRESHOLDS
  }
})