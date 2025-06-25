import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getFunctions, httpsCallable } from 'firebase/functions'

interface FeedbackItem {
  id?: string
  rating: number
  comment: string
  page: string
  timestamp: Date
  resolved?: boolean
  resolvedAt?: Date
}

interface FeedbackState {
  feedbackHistory: FeedbackItem[]
  loading: boolean
  error: string | null
}

export const useFeedbackStore = defineStore('feedback', () => {
  const feedbackHistory = ref<FeedbackItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const functions = getFunctions()
  const submitFeedbackFn = httpsCallable(functions, 'submitFeedback')
  const getFeedbackFn = httpsCallable(functions, 'getFeedback')
  const markFeedbackResolvedFn = httpsCallable(functions, 'markFeedbackResolved')

  const submitFeedback = async (feedbackData: Omit<FeedbackItem, 'id' | 'resolved'>) => {
    loading.value = true
    error.value = null

    try {
      const result = await submitFeedbackFn({
        rating: feedbackData.rating,
        comment: feedbackData.comment,
        page: feedbackData.page
      })

      if (result.data && typeof result.data === 'object' && 'success' in result.data) {
        const data = result.data as { success: boolean; feedbackId: string; message: string }
        
        if (data.success) {
          const newFeedback: FeedbackItem = {
            id: data.feedbackId,
            ...feedbackData,
            resolved: false
          }
          
          feedbackHistory.value.unshift(newFeedback)
          return data
        }
      }
      
      throw new Error('フィードバックの送信に失敗しました')
    } catch (err: any) {
      console.error('フィードバック送信エラー:', err)
      error.value = err.message || 'フィードバックの送信に失敗しました'
      throw err
    } finally {
      loading.value = false
    }
  }

  const loadFeedbackHistory = async () => {
    loading.value = true
    error.value = null

    try {
      const result = await getFeedbackFn()

      if (result.data && typeof result.data === 'object' && 'success' in result.data) {
        const data = result.data as { success: boolean; feedback: any[] }
        
        if (data.success && Array.isArray(data.feedback)) {
          feedbackHistory.value = data.feedback.map((item: any) => ({
            id: item.id,
            rating: item.rating,
            comment: item.comment,
            page: item.page,
            timestamp: item.timestamp?.toDate() || new Date(item.timestamp),
            resolved: item.resolved || false,
            resolvedAt: item.resolvedAt?.toDate() || undefined
          }))
        }
      }
    } catch (err: any) {
      console.error('フィードバック履歴取得エラー:', err)
      error.value = err.message || 'フィードバック履歴の取得に失敗しました'
    } finally {
      loading.value = false
    }
  }

  const markAsResolved = async (feedbackId: string) => {
    loading.value = true
    error.value = null

    try {
      const result = await markFeedbackResolvedFn({ feedbackId })

      if (result.data && typeof result.data === 'object' && 'success' in result.data) {
        const data = result.data as { success: boolean; message: string }
        
        if (data.success) {
          const feedbackIndex = feedbackHistory.value.findIndex(f => f.id === feedbackId)
          if (feedbackIndex !== -1) {
            feedbackHistory.value[feedbackIndex].resolved = true
            feedbackHistory.value[feedbackIndex].resolvedAt = new Date()
          }
          return data
        }
      }
      
      throw new Error('フィードバックの解決マークに失敗しました')
    } catch (err: any) {
      console.error('フィードバック解決エラー:', err)
      error.value = err.message || 'フィードバックの解決マークに失敗しました'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getAverageRating = () => {
    if (feedbackHistory.value.length === 0) return 0
    
    const totalRating = feedbackHistory.value.reduce((sum, feedback) => sum + feedback.rating, 0)
    return Math.round((totalRating / feedbackHistory.value.length) * 10) / 10
  }

  const getFeedbackStats = () => {
    const total = feedbackHistory.value.length
    const resolved = feedbackHistory.value.filter(f => f.resolved).length
    const pending = total - resolved
    const averageRating = getAverageRating()
    
    const ratingDistribution = {
      5: feedbackHistory.value.filter(f => f.rating === 5).length,
      4: feedbackHistory.value.filter(f => f.rating === 4).length,
      3: feedbackHistory.value.filter(f => f.rating === 3).length,
      2: feedbackHistory.value.filter(f => f.rating === 2).length,
      1: feedbackHistory.value.filter(f => f.rating === 1).length
    }

    return {
      total,
      resolved,
      pending,
      averageRating,
      ratingDistribution
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    feedbackHistory,
    loading,
    error,
    submitFeedback,
    loadFeedbackHistory,
    markAsResolved,
    getAverageRating,
    getFeedbackStats,
    clearError
  }
})

export type { FeedbackItem }