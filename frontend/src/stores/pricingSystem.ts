/**
 * Grandfather Pricing + Price-Ladder システム用Store
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/services/firebase'

interface GlobalStats {
  currentSubscribers: number
  peakSubscribers: number
  currentPriceId: string
  lastUpdated: string
}

interface PriceInfo {
  priceId: string
  lookupKey: string
  amount: number
  currency: string
  maxSubscribers: number
  isActive: boolean
}

interface CurrentPricingData {
  globalStats: GlobalStats
  currentPrice: PriceInfo
  nextTierInfo: {
    amount: number
    remainingUsers: number
  } | null
}

export const usePricingSystemStore = defineStore('pricingSystem', () => {
  // State
  const currentPricingData = ref<CurrentPricingData | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const currentPrice = computed(() => {
    return currentPricingData.value?.currentPrice?.amount || 4980
  })

  const formattedCurrentPrice = computed(() => {
    return `¥${currentPrice.value.toLocaleString()}`
  })

  const remainingUsersForNextTier = computed(() => {
    return currentPricingData.value?.nextTierInfo?.remainingUsers || 0
  })

  const nextTierPrice = computed(() => {
    const nextAmount = currentPricingData.value?.nextTierInfo?.amount
    return nextAmount ? `¥${nextAmount.toLocaleString()}` : null
  })

  const isMaxPriceReached = computed(() => {
    return currentPrice.value >= 14800
  })

  // Actions
  const fetchCurrentPricing = async () => {
    try {
      loading.value = true
      error.value = null

      const getCurrentPricing = httpsCallable(functions, 'getCurrentPricing')
      const result = await getCurrentPricing()
      
      if (result.data && typeof result.data === 'object' && 'success' in result.data) {
        const data = result.data as { success: boolean; data: CurrentPricingData }
        if (data.success) {
          currentPricingData.value = data.data
        } else {
          throw new Error('Failed to fetch pricing data')
        }
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err: any) {
      console.error('Failed to fetch current pricing:', err)
      error.value = err.message || '価格情報の取得に失敗しました'
      
      // フォールバック値を設定
      currentPricingData.value = {
        globalStats: {
          currentSubscribers: 0,
          peakSubscribers: 0,
          currentPriceId: 'price_tier_000',
          lastUpdated: new Date().toISOString()
        },
        currentPrice: {
          priceId: 'price_tier_000',
          lookupKey: 'tier_000',
          amount: 4980,
          currency: 'jpy',
          maxSubscribers: 100,
          isActive: true
        },
        nextTierInfo: {
          amount: 5480,
          remainingUsers: 100
        }
      }
    } finally {
      loading.value = false
    }
  }

  const refreshPricing = async () => {
    await fetchCurrentPricing()
  }

  // 価格更新の通知を受信（WebSocket等で実装可能）
  const onPricingUpdate = (newData: CurrentPricingData) => {
    currentPricingData.value = newData
  }

  return {
    // State
    currentPricingData,
    loading,
    error,
    
    // Getters
    currentPrice,
    formattedCurrentPrice,
    remainingUsersForNextTier,
    nextTierPrice,
    isMaxPriceReached,
    
    // Actions
    fetchCurrentPricing,
    refreshPricing,
    onPricingUpdate
  }
})