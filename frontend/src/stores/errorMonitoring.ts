import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { errorMonitor, type ErrorDetails } from '@/utils/errorHandler'

export const useErrorMonitoringStore = defineStore('errorMonitoring', () => {
  // State
  const errors = ref<ErrorDetails[]>([])
  const isErrorDialogOpen = ref(false)
  const currentError = ref<ErrorDetails | null>(null)
  const errorFilters = ref({
    severity: 'all' as 'all' | 'low' | 'medium' | 'high' | 'critical',
    category: 'all' as 'all' | 'javascript' | 'network' | 'auth' | 'api' | 'ui' | 'performance',
    timeRange: '24h' as '1h' | '24h' | '7d' | '30d'
  })

  // Computed
  const filteredErrors = computed(() => {
    let filtered = errors.value

    // Filter by severity
    if (errorFilters.value.severity !== 'all') {
      filtered = filtered.filter(error => error.severity === errorFilters.value.severity)
    }

    // Filter by category
    if (errorFilters.value.category !== 'all') {
      filtered = filtered.filter(error => error.category === errorFilters.value.category)
    }

    // Filter by time range
    const now = new Date()
    const timeRangeMs = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    }
    
    const cutoff = new Date(now.getTime() - timeRangeMs[errorFilters.value.timeRange])
    filtered = filtered.filter(error => error.timestamp >= cutoff)

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  })

  const errorStats = computed(() => {
    const total = filteredErrors.value.length
    const byCategory = filteredErrors.value.reduce((acc, error) => {
      acc[error.category] = (acc[error.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const bySeverity = filteredErrors.value.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const recentErrors = filteredErrors.value.filter(
      error => error.timestamp >= new Date(Date.now() - 60 * 60 * 1000) // Last hour
    ).length

    return {
      total,
      recent: recentErrors,
      byCategory,
      bySeverity
    }
  })

  const criticalErrors = computed(() => {
    return filteredErrors.value.filter(error => error.severity === 'critical')
  })

  const topErrors = computed(() => {
    // Group errors by message and count occurrences
    const errorCounts = filteredErrors.value.reduce((acc, error) => {
      const key = error.message
      if (!acc[key]) {
        acc[key] = { count: 0, latestError: error, errors: [] }
      }
      acc[key].count++
      acc[key].errors.push(error)
      if (error.timestamp > acc[key].latestError.timestamp) {
        acc[key].latestError = error
      }
      return acc
    }, {} as Record<string, { count: number; latestError: ErrorDetails; errors: ErrorDetails[] }>)

    return Object.entries(errorCounts)
      .map(([message, data]) => ({
        message,
        count: data.count,
        latestError: data.latestError,
        errors: data.errors
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  })

  // Actions
  const loadErrors = () => {
    errors.value = errorMonitor.getErrorHistory()
  }

  const clearErrors = () => {
    errorMonitor.clearErrorHistory()
    errors.value = []
  }

  const showErrorDetails = (error: ErrorDetails) => {
    currentError.value = error
    isErrorDialogOpen.value = true
  }

  const closeErrorDialog = () => {
    isErrorDialogOpen.value = false
    currentError.value = null
  }

  const updateFilters = (newFilters: Partial<typeof errorFilters.value>) => {
    errorFilters.value = { ...errorFilters.value, ...newFilters }
  }

  const exportErrorReport = () => {
    const report = errorMonitor.exportErrorReport()
    const blob = new Blob([report], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `omniy-error-report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const sendErrorReport = async (errorId: string, userFeedback?: string) => {
    const error = errors.value.find(e => e.sessionId === errorId)
    if (!error) return

    try {
      // Send to support system
      const response = await fetch('/api/error-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error,
          userFeedback,
          timestamp: new Date().toISOString()
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send error report')
      }

      return true
    } catch (err) {
      console.error('Failed to send error report:', err)
      return false
    }
  }

  // Auto-refresh errors periodically
  const startAutoRefresh = () => {
    const interval = setInterval(() => {
      loadErrors()
    }, 5000) // Refresh every 5 seconds

    return () => clearInterval(interval)
  }

  return {
    // State
    errors,
    isErrorDialogOpen,
    currentError,
    errorFilters,

    // Computed
    filteredErrors,
    errorStats,
    criticalErrors,
    topErrors,

    // Actions
    loadErrors,
    clearErrors,
    showErrorDetails,
    closeErrorDialog,
    updateFilters,
    exportErrorReport,
    sendErrorReport,
    startAutoRefresh
  }
})