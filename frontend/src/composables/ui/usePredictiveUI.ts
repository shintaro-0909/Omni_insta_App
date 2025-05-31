import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export interface PredictiveAction {
  id: string
  route?: string
  action?: () => void
  probability: number
  context: string[]
  preloadData?: () => Promise<any>
}

export interface UserPattern {
  sequence: string[]
  count: number
  lastSeen: number
  averageTime: number
}

export function usePredictiveUI() {
  const router = useRouter()
  const authStore = useAuthStore()
  
  // Pattern tracking
  const actionHistory = ref<string[]>([])
  const userPatterns = ref<Map<string, UserPattern>>(new Map())
  const predictedActions = ref<PredictiveAction[]>([])
  const preloadedData = ref<Map<string, any>>(new Map())
  
  // Context awareness
  const currentContext = ref<string[]>([])
  const timeOfDay = ref<'morning' | 'afternoon' | 'evening' | 'night'>('morning')
  const deviceType = ref<'mobile' | 'tablet' | 'desktop'>('desktop')
  const networkSpeed = ref<'slow' | 'medium' | 'fast'>('fast')
  
  // Configuration
  const maxHistoryLength = 50
  const patternMinLength = 2
  const patternMaxLength = 5
  const predictionThreshold = 0.3
  const preloadLimit = 3
  
  // Track user action
  const trackAction = (actionId: string) => {
    actionHistory.value.push(actionId)
    if (actionHistory.value.length > maxHistoryLength) {
      actionHistory.value.shift()
    }
    
    updatePatterns()
    updatePredictions()
  }
  
  // Update patterns based on history
  const updatePatterns = () => {
    const history = actionHistory.value
    
    for (let length = patternMinLength; length <= patternMaxLength; length++) {
      if (history.length < length) break
      
      for (let i = 0; i <= history.length - length; i++) {
        const pattern = history.slice(i, i + length).join('-')
        const existing = userPatterns.value.get(pattern) || {
          sequence: history.slice(i, i + length),
          count: 0,
          lastSeen: 0,
          averageTime: 0
        }
        
        existing.count++
        existing.lastSeen = Date.now()
        userPatterns.value.set(pattern, existing)
      }
    }
    
    // Clean old patterns
    const now = Date.now()
    const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days
    userPatterns.value.forEach((pattern, key) => {
      if (now - pattern.lastSeen > maxAge) {
        userPatterns.value.delete(key)
      }
    })
  }
  
  // Update predictions based on patterns
  const updatePredictions = () => {
    const predictions: Map<string, number> = new Map()
    const recentHistory = actionHistory.value.slice(-patternMaxLength)
    
    // Check all pattern lengths
    for (let length = patternMinLength; length <= Math.min(patternMaxLength, recentHistory.length); length++) {
      const currentPattern = recentHistory.slice(-length).join('-')
      
      // Find patterns that start with current pattern
      userPatterns.value.forEach((pattern, key) => {
        if (key.startsWith(currentPattern + '-')) {
          const nextAction = pattern.sequence[length]
          if (nextAction) {
            const score = (pattern.count / 100) * (1 / (Date.now() - pattern.lastSeen + 1000))
            predictions.set(nextAction, (predictions.get(nextAction) || 0) + score)
          }
        }
      })
    }
    
    // Convert to predictive actions
    const sortedPredictions = Array.from(predictions.entries())
      .sort((a, b) => b[1] - a[1])
      .filter(([_, prob]) => prob > predictionThreshold)
      .slice(0, 5)
    
    predictedActions.value = sortedPredictions.map(([actionId, probability]) => {
      const action = getActionDetails(actionId)
      return {
        id: actionId,
        route: action.route,
        action: action.action,
        probability,
        context: currentContext.value,
        preloadData: action.preloadData
      }
    })
    
    // Preload top predictions
    preloadTopPredictions()
  }
  
  // Get action details based on ID
  const getActionDetails = (actionId: string): Partial<PredictiveAction> => {
    const actionMap: Record<string, Partial<PredictiveAction>> = {
      'view-schedules': {
        route: '/schedules',
        preloadData: async () => {
          // Preload schedules data
          return { schedules: [] }
        }
      },
      'view-content': {
        route: '/content',
        preloadData: async () => {
          // Preload content library
          return { posts: [] }
        }
      },
      'view-accounts': {
        route: '/accounts',
        preloadData: async () => {
          // Preload Instagram accounts
          return { accounts: [] }
        }
      },
      'create-post': {
        action: () => {
          // Open create post dialog
        }
      },
      'create-schedule': {
        action: () => {
          // Open schedule dialog
        }
      }
    }
    
    return actionMap[actionId] || {}
  }
  
  // Preload data for top predictions
  const preloadTopPredictions = async () => {
    const topPredictions = predictedActions.value.slice(0, preloadLimit)
    
    for (const prediction of topPredictions) {
      if (prediction.preloadData && !preloadedData.value.has(prediction.id)) {
        try {
          const data = await prediction.preloadData()
          preloadedData.value.set(prediction.id, data)
          
          // Clean old preloaded data
          if (preloadedData.value.size > preloadLimit * 2) {
            const oldestKey = Array.from(preloadedData.value.keys())[0]
            preloadedData.value.delete(oldestKey)
          }
        } catch (error) {
          console.error('Preload failed:', error)
        }
      }
    }
  }
  
  // Update context
  const updateContext = () => {
    const hour = new Date().getHours()
    if (hour < 6) timeOfDay.value = 'night'
    else if (hour < 12) timeOfDay.value = 'morning'
    else if (hour < 18) timeOfDay.value = 'afternoon'
    else timeOfDay.value = 'evening'
    
    const width = window.innerWidth
    if (width < 768) deviceType.value = 'mobile'
    else if (width < 1024) deviceType.value = 'tablet'
    else deviceType.value = 'desktop'
    
    currentContext.value = [
      timeOfDay.value,
      deviceType.value,
      authStore.user ? 'authenticated' : 'anonymous',
      router.currentRoute.value.name as string
    ]
  }
  
  // Get preloaded data
  const getPreloadedData = (actionId: string) => {
    return preloadedData.value.get(actionId)
  }
  
  // Computed properties
  const topPrediction = computed(() => predictedActions.value[0])
  
  const suggestionConfidence = computed(() => {
    if (!topPrediction.value) return 0
    return Math.min(topPrediction.value.probability * 100, 100)
  })
  
  // Watchers
  watch(() => router.currentRoute.value, () => {
    trackAction(router.currentRoute.value.name as string)
    updateContext()
  })
  
  // Initialize
  onMounted(() => {
    updateContext()
    
    // Restore patterns from localStorage
    const savedPatterns = localStorage.getItem('userPatterns')
    if (savedPatterns) {
      try {
        const parsed = JSON.parse(savedPatterns)
        userPatterns.value = new Map(parsed)
      } catch (error) {
        console.error('Failed to restore patterns:', error)
      }
    }
    
    // Save patterns periodically
    setInterval(() => {
      const patternsArray = Array.from(userPatterns.value.entries())
      localStorage.setItem('userPatterns', JSON.stringify(patternsArray))
    }, 30000) // Every 30 seconds
  })
  
  return {
    predictedActions,
    topPrediction,
    suggestionConfidence,
    currentContext,
    trackAction,
    getPreloadedData,
    updateContext
  }
}