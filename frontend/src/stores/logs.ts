import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getFunctions, httpsCallable } from 'firebase/functions'

// 実行ログの型定義
export interface ExecutionLog {
  id: string
  scheduleId: string
  igAccountId: string
  contentId: string
  status: 'success' | 'failed' | 'retrying'
  error?: string
  instagramPostId?: string
  executedAt: any // Firestore Timestamp
  retryCount: number
  nextRetryAt?: any // Firestore Timestamp
  userId: string
}

// ログ統計の型定義
export interface LogStats {
  total: number
  success: number
  failed: number
  retrying: number
  last24Hours: {
    total: number
    success: number
    failed: number
  }
  last7Days: {
    total: number
    success: number
    failed: number
  }
  last30Days: {
    total: number
    success: number
    failed: number
  }
}

// 日別統計の型定義
export interface DailyLogStats {
  date: string
  success: number
  failed: number
  total: number
}

// ログフィルターの型定義
export interface LogFilters {
  status?: 'success' | 'failed' | 'retrying'
  igAccountId?: string
  contentId?: string
  dateFrom?: Date
  dateTo?: Date
  last24Hours?: boolean
}

export const useLogsStore = defineStore('logs', () => {
  // State
  const logs = ref<ExecutionLog[]>([])
  const stats = ref<LogStats | null>(null)
  const dailyStats = ref<DailyLogStats[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const hasMore = ref(true)
  const lastLogId = ref<string | null>(null)

  // Functions参照
  const functions = getFunctions()

  // Getters
  const logsCount = computed(() => logs.value.length)
  
  const recentLogs = computed(() => 
    logs.value.slice(0, 10)
  )

  const successRate = computed(() => {
    if (!stats.value || stats.value.total === 0) return 0
    return Math.round((stats.value.success / stats.value.total) * 100)
  })

  const failureRate = computed(() => {
    if (!stats.value || stats.value.total === 0) return 0
    return Math.round((stats.value.failed / stats.value.total) * 100)
  })

  const last24HoursSuccessRate = computed(() => {
    if (!stats.value || stats.value.last24Hours.total === 0) return 0
    return Math.round((stats.value.last24Hours.success / stats.value.last24Hours.total) * 100)
  })

  // Actions
  const fetchLogs = async (filters: LogFilters = {}, reset = false) => {
    try {
      loading.value = true
      error.value = null

      if (reset) {
        logs.value = []
        lastLogId.value = null
        hasMore.value = true
      }

      const getExecutionLogsFn = httpsCallable(functions, 'getExecutionLogsV2')
      const result = await getExecutionLogsFn({
        filters,
        limit: 20,
        lastLogId: lastLogId.value
      })

      const data = result.data as any

      if (data.success) {
        const newLogs = data.logs.map((log: any) => ({
          ...log,
          executedAt: log.executedAt,
          nextRetryAt: log.nextRetryAt
        }))

        if (reset) {
          logs.value = newLogs
        } else {
          logs.value = [...logs.value, ...newLogs]
        }

        hasMore.value = data.hasMore
        lastLogId.value = data.lastLogId
      } else {
        throw new Error('Failed to fetch logs')
      }
    } catch (err: any) {
      error.value = err.message || 'ログの取得に失敗しました'
      console.error('ログ取得エラー:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchStats = async () => {
    try {
      loading.value = true
      error.value = null

      const getLogStatsFn = httpsCallable(functions, 'getLogStats')
      const result = await getLogStatsFn({})
      const data = result.data as any

      if (data.success) {
        stats.value = data.stats
      } else {
        throw new Error('Failed to fetch stats')
      }
    } catch (err: any) {
      error.value = err.message || '統計情報の取得に失敗しました'
      console.error('統計取得エラー:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchDailyStats = async (days = 7) => {
    try {
      loading.value = true
      error.value = null

      const getDailyLogStatsFn = httpsCallable(functions, 'getDailyLogStats')
      const result = await getDailyLogStatsFn({ days })
      const data = result.data as any

      if (data.success) {
        dailyStats.value = data.dailyStats
      } else {
        throw new Error('Failed to fetch daily stats')
      }
    } catch (err: any) {
      error.value = err.message || '日別統計の取得に失敗しました'
      console.error('日別統計取得エラー:', err)
    } finally {
      loading.value = false
    }
  }

  const loadMoreLogs = async (filters: LogFilters = {}) => {
    if (!hasMore.value || loading.value) return
    await fetchLogs(filters, false)
  }

  const refreshData = async (filters: LogFilters = {}) => {
    await Promise.all([
      fetchLogs(filters, true),
      fetchStats(),
      fetchDailyStats()
    ])
  }

  const formatLogDate = (timestamp: any) => {
    if (!timestamp) return '不明'
    
    let date: Date
    if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000)
    } else if (timestamp.toDate) {
      date = timestamp.toDate()
    } else {
      date = new Date(timestamp)
    }
    
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'success'
      case 'failed':
        return 'error'
      case 'retrying':
        return 'warning'
      default:
        return 'grey'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return '成功'
      case 'failed':
        return '失敗'
      case 'retrying':
        return 'リトライ中'
      default:
        return '不明'
    }
  }

  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    logs.value = []
    stats.value = null
    dailyStats.value = []
    loading.value = false
    error.value = null
    hasMore.value = true
    lastLogId.value = null
  }

  return {
    // State
    logs,
    stats,
    dailyStats,
    loading,
    error,
    hasMore,
    // Getters
    logsCount,
    recentLogs,
    successRate,
    failureRate,
    last24HoursSuccessRate,
    // Actions
    fetchLogs,
    fetchStats,
    fetchDailyStats,
    loadMoreLogs,
    refreshData,
    formatLogDate,
    getStatusColor,
    getStatusText,
    clearError,
    reset
  }
})