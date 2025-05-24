import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getFunctions, httpsCallable } from 'firebase/functions'

// 型定義
interface PlanLimits {
  instagramAccountLimit: number
  monthlyPostLimit: number
  scheduledPosts: boolean
  recurringPosts: boolean
  randomPosts: boolean
  proxySupport: boolean
  prioritySupport: boolean
  apiAccess: boolean
}

interface Usage {
  instagramAccountCount: number
  monthlyPostCount: number
  lastResetDate: any
}

interface LimitCheckResult {
  allowed: boolean
  reason?: string
  currentCount: number
  limit: number
}

export const usePlanLimitsStore = defineStore('planLimits', () => {
  // State
  const limits = ref<PlanLimits | null>(null)
  const usage = ref<Usage | null>(null)
  const percentages = ref<{
    instagramAccounts: number
    monthlyPosts: number
  } | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Firebase Functions
  const functions = getFunctions()
  const getUserLimitsAndUsageFn = httpsCallable(functions, 'getUserLimitsAndUsage')
  const checkInstagramAccountLimitFn = httpsCallable(functions, 'checkInstagramAccountLimit')
  const checkPostExecutionLimitFn = httpsCallable(functions, 'checkPostExecutionLimit')
  const checkScheduleCreationLimitFn = httpsCallable(functions, 'checkScheduleCreationLimit')
  const checkFeatureAvailabilityFn = httpsCallable(functions, 'checkFeatureAvailability')

  // Computed
  const isUnlimited = computed(() => {
    if (!limits.value) return false
    return limits.value.instagramAccountLimit === -1 && limits.value.monthlyPostLimit === -1
  })

  const canAddAccount = computed(() => {
    if (!limits.value || !usage.value) return false
    if (limits.value.instagramAccountLimit === -1) return true
    return usage.value.instagramAccountCount < limits.value.instagramAccountLimit
  })

  const canPost = computed(() => {
    if (!limits.value || !usage.value) return false
    if (limits.value.monthlyPostLimit === -1) return true
    return usage.value.monthlyPostCount < limits.value.monthlyPostLimit
  })

  const accountUsageText = computed(() => {
    if (!limits.value || !usage.value) return ''
    if (limits.value.instagramAccountLimit === -1) {
      return `${usage.value.instagramAccountCount} / 無制限`
    }
    return `${usage.value.instagramAccountCount} / ${limits.value.instagramAccountLimit}`
  })

  const postUsageText = computed(() => {
    if (!limits.value || !usage.value) return ''
    if (limits.value.monthlyPostLimit === -1) {
      return `${usage.value.monthlyPostCount} / 無制限`
    }
    return `${usage.value.monthlyPostCount} / ${limits.value.monthlyPostLimit}`
  })

  const accountUsagePercentage = computed(() => {
    return percentages.value?.instagramAccounts || 0
  })

  const postUsagePercentage = computed(() => {
    return percentages.value?.monthlyPosts || 0
  })

  const accountUsageColor = computed(() => {
    const percentage = accountUsagePercentage.value
    if (percentage >= 90) return 'error'
    if (percentage >= 70) return 'warning'
    return 'success'
  })

  const postUsageColor = computed(() => {
    const percentage = postUsagePercentage.value
    if (percentage >= 90) return 'error'
    if (percentage >= 70) return 'warning'
    return 'success'
  })

  // Actions
  const fetchLimitsAndUsage = async () => {
    try {
      loading.value = true
      error.value = null

      const result = await getUserLimitsAndUsageFn()
      const data = result.data as any

      if (data.success) {
        limits.value = data.limits
        usage.value = data.usage
        percentages.value = data.percentages
      } else {
        throw new Error('制限情報の取得に失敗しました')
      }
    } catch (err: any) {
      console.error('Failed to fetch limits and usage:', err)
      error.value = err.message || '制限情報の取得に失敗しました'
    } finally {
      loading.value = false
    }
  }

  const checkAccountLimit = async (): Promise<LimitCheckResult> => {
    try {
      const result = await checkInstagramAccountLimitFn()
      const data = result.data as any

      if (data.success) {
        return {
          allowed: data.allowed,
          reason: data.reason,
          currentCount: data.currentCount,
          limit: data.limit,
        }
      } else {
        throw new Error('アカウント制限チェックに失敗しました')
      }
    } catch (err: any) {
      console.error('Failed to check account limit:', err)
      return {
        allowed: false,
        reason: 'アカウント制限チェックに失敗しました',
        currentCount: 0,
        limit: 0,
      }
    }
  }

  const checkPostLimit = async (): Promise<LimitCheckResult> => {
    try {
      const result = await checkPostExecutionLimitFn()
      const data = result.data as any

      if (data.success) {
        return {
          allowed: data.allowed,
          reason: data.reason,
          currentCount: data.currentCount,
          limit: data.limit,
        }
      } else {
        throw new Error('投稿制限チェックに失敗しました')
      }
    } catch (err: any) {
      console.error('Failed to check post limit:', err)
      return {
        allowed: false,
        reason: '投稿制限チェックに失敗しました',
        currentCount: 0,
        limit: 0,
      }
    }
  }

  const checkScheduleLimit = async (scheduleType: 'one-time' | 'recurring' | 'random'): Promise<{
    allowed: boolean
    reason?: string
  }> => {
    try {
      const result = await checkScheduleCreationLimitFn({ scheduleType })
      const data = result.data as any

      if (data.success) {
        return {
          allowed: data.allowed,
          reason: data.reason,
        }
      } else {
        throw new Error('スケジュール制限チェックに失敗しました')
      }
    } catch (err: any) {
      console.error('Failed to check schedule limit:', err)
      return {
        allowed: false,
        reason: 'スケジュール制限チェックに失敗しました',
      }
    }
  }

  const checkFeature = async (feature: string): Promise<boolean> => {
    try {
      const result = await checkFeatureAvailabilityFn({ feature })
      const data = result.data as any

      if (data.success) {
        return data.available
      } else {
        throw new Error('機能チェックに失敗しました')
      }
    } catch (err: any) {
      console.error('Failed to check feature:', err)
      return false
    }
  }

  const getUpgradeMessage = (type: 'account' | 'post' | 'feature', feature?: string) => {
    switch (type) {
      case 'account':
        return 'Instagramアカウントの追加上限に達しました。上位プランにアップグレードしてより多くのアカウントを管理しましょう。'
      case 'post':
        return '月間投稿数の上限に達しました。上位プランにアップグレードしてより多くの投稿を行いましょう。'
      case 'feature':
        return `${feature}機能は現在のプランでは利用できません。上位プランにアップグレードして全機能をお楽しみください。`
      default:
        return 'プランの制限に達しました。上位プランにアップグレードしてください。'
    }
  }

  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    limits.value = null
    usage.value = null
    percentages.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    limits,
    usage,
    percentages,
    loading,
    error,

    // Computed
    isUnlimited,
    canAddAccount,
    canPost,
    accountUsageText,
    postUsageText,
    accountUsagePercentage,
    postUsagePercentage,
    accountUsageColor,
    postUsageColor,

    // Actions
    fetchLimitsAndUsage,
    checkAccountLimit,
    checkPostLimit,
    checkScheduleLimit,
    checkFeature,
    getUpgradeMessage,
    clearError,
    reset,
  }
}) 