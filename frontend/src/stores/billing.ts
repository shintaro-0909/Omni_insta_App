import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getFunctions, httpsCallable } from 'firebase/functions'

// 型定義
interface Plan {
  id: string
  planId: string
  name: string
  description: string
  price: number
  currency: string
  interval: string
  stripePriceId: string | null
  features: {
    instagramAccountLimit: number
    monthlyPostLimit: number
    scheduledPosts: boolean
    recurringPosts: boolean
    randomPosts: boolean
    proxySupport: boolean
    prioritySupport: boolean
    apiAccess: boolean
  }
  isActive: boolean
}

interface Subscription {
  planId: string
  status: string
  currentPeriodStart?: any
  currentPeriodEnd?: any
  cancelAtPeriodEnd: boolean
}

interface PaymentHistory {
  id: string
  stripePaymentIntentId: string
  amount: number
  currency: string
  status: string
  planId: string
  description: string
  createdAt: any
}

export const useBillingStore = defineStore('billing', () => {
  // State
  const plans = ref<Plan[]>([])
  const currentSubscription = ref<Subscription | null>(null)
  const paymentHistory = ref<PaymentHistory[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Firebase Functions
  const functions = getFunctions()
  const createCheckoutSessionFn = httpsCallable(functions, 'createCheckoutSession')
  const getSubscriptionFn = httpsCallable(functions, 'getSubscription')
  const cancelSubscriptionFn = httpsCallable(functions, 'cancelSubscription')
  const resumeSubscriptionFn = httpsCallable(functions, 'resumeSubscription')
  const getPaymentHistoryFn = httpsCallable(functions, 'getPaymentHistory')
  const getPlansFn = httpsCallable(functions, 'getPlans')

  // Computed
  const currentPlan = computed(() => {
    if (!currentSubscription.value) return null
    return plans.value.find(plan => plan.planId === currentSubscription.value?.planId) || null
  })

  const isFreePlan = computed(() => {
    return currentSubscription.value?.planId === 'free'
  })

  const canUpgrade = computed(() => {
    return isFreePlan.value || currentSubscription.value?.status !== 'active'
  })

  const canCancel = computed(() => {
    return !isFreePlan.value && 
           currentSubscription.value?.status === 'active' && 
           !currentSubscription.value?.cancelAtPeriodEnd
  })

  const canResume = computed(() => {
    return !isFreePlan.value && 
           currentSubscription.value?.status === 'active' && 
           currentSubscription.value?.cancelAtPeriodEnd
  })

  // Actions
  const fetchPlans = async () => {
    try {
      loading.value = true
      error.value = null

      const result = await getPlansFn()
      const data = result.data as any

      if (data.success) {
        plans.value = data.plans
      } else {
        throw new Error('プラン情報の取得に失敗しました')
      }
    } catch (err: any) {
      console.error('Failed to fetch plans:', err)
      error.value = err.message || 'プラン情報の取得に失敗しました'
    } finally {
      loading.value = false
    }
  }

  const fetchSubscription = async () => {
    try {
      loading.value = true
      error.value = null

      const result = await getSubscriptionFn()
      const data = result.data as any

      if (data.success) {
        currentSubscription.value = data.subscription
      } else {
        throw new Error('サブスクリプション情報の取得に失敗しました')
      }
    } catch (err: any) {
      console.error('Failed to fetch subscription:', err)
      error.value = err.message || 'サブスクリプション情報の取得に失敗しました'
    } finally {
      loading.value = false
    }
  }

  const createCheckoutSession = async (planId: string) => {
    try {
      loading.value = true
      error.value = null

      const successUrl = `${window.location.origin}/billing/success`
      const cancelUrl = `${window.location.origin}/billing`

      const result = await createCheckoutSessionFn({
        planId,
        successUrl,
        cancelUrl
      })
      
      const data = result.data as any

      if (data.success && data.url) {
        // Stripe Checkoutページにリダイレクト
        window.location.href = data.url
      } else {
        throw new Error('決済セッションの作成に失敗しました')
      }
    } catch (err: any) {
      console.error('Failed to create checkout session:', err)
      error.value = err.message || '決済セッションの作成に失敗しました'
      loading.value = false
    }
  }

  const cancelSubscription = async () => {
    try {
      loading.value = true
      error.value = null

      const result = await cancelSubscriptionFn()
      const data = result.data as any

      if (data.success) {
        // サブスクリプション情報を再取得
        await fetchSubscription()
        return data.message
      } else {
        throw new Error('サブスクリプションのキャンセルに失敗しました')
      }
    } catch (err: any) {
      console.error('Failed to cancel subscription:', err)
      error.value = err.message || 'サブスクリプションのキャンセルに失敗しました'
      throw err
    } finally {
      loading.value = false
    }
  }

  const resumeSubscription = async () => {
    try {
      loading.value = true
      error.value = null

      const result = await resumeSubscriptionFn()
      const data = result.data as any

      if (data.success) {
        // サブスクリプション情報を再取得
        await fetchSubscription()
        return data.message
      } else {
        throw new Error('サブスクリプションの再開に失敗しました')
      }
    } catch (err: any) {
      console.error('Failed to resume subscription:', err)
      error.value = err.message || 'サブスクリプションの再開に失敗しました'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchPaymentHistory = async (limit = 10, startAfter?: any) => {
    try {
      loading.value = true
      error.value = null

      const result = await getPaymentHistoryFn({ limit, startAfter })
      const data = result.data as any

      if (data.success) {
        if (startAfter) {
          // 追加読み込みの場合は配列に追加
          paymentHistory.value.push(...data.payments)
        } else {
          // 初回読み込みの場合は置き換え
          paymentHistory.value = data.payments
        }
        return {
          hasMore: data.hasMore,
          lastDoc: data.lastDoc
        }
      } else {
        throw new Error('決済履歴の取得に失敗しました')
      }
    } catch (err: any) {
      console.error('Failed to fetch payment history:', err)
      error.value = err.message || '決済履歴の取得に失敗しました'
      return { hasMore: false, lastDoc: null }
    } finally {
      loading.value = false
    }
  }

  const formatPrice = (price: number, currency = 'JPY') => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(price)
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return ''
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }

  const getPlanFeatureText = (plan: Plan) => {
    const features = []
    
    if (plan.features.instagramAccountLimit === -1) {
      features.push('Instagramアカウント: 無制限')
    } else {
      features.push(`Instagramアカウント: ${plan.features.instagramAccountLimit}個`)
    }
    
    if (plan.features.monthlyPostLimit === -1) {
      features.push('月間投稿数: 無制限')
    } else {
      features.push(`月間投稿数: ${plan.features.monthlyPostLimit}回`)
    }
    
    if (plan.features.scheduledPosts) features.push('予約投稿')
    if (plan.features.recurringPosts) features.push('繰り返し投稿')
    if (plan.features.randomPosts) features.push('ランダム投稿')
    if (plan.features.proxySupport) features.push('プロキシ設定')
    if (plan.features.prioritySupport) features.push('優先サポート')
    if (plan.features.apiAccess) features.push('API アクセス')
    
    return features
  }

  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    plans.value = []
    currentSubscription.value = null
    paymentHistory.value = []
    loading.value = false
    error.value = null
  }

  return {
    // State
    plans,
    currentSubscription,
    paymentHistory,
    loading,
    error,

    // Computed
    currentPlan,
    isFreePlan,
    canUpgrade,
    canCancel,
    canResume,

    // Actions
    fetchPlans,
    fetchSubscription,
    createCheckoutSession,
    cancelSubscription,
    resumeSubscription,
    fetchPaymentHistory,
    formatPrice,
    formatDate,
    getPlanFeatureText,
    clearError,
    reset,
  }
}) 