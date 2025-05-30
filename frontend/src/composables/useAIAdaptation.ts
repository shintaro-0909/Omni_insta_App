import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { usePredictiveUI } from './usePredictiveUI'
import { useIntelligentAnimations } from './useIntelligentAnimations'
import { getContextAnalyzer } from '@/utils/contextAnalyzer'
import { getBehaviorEngine } from '@/utils/behaviorEngine'
import { getAdaptationEngine } from '@/utils/adaptationEngine'

interface UserBehaviorPattern {
  id: string
  name: string
  confidence: number
  frequency: number
  recency: number
  triggers: string[]
  preferences: Record<string, any>
  adaptations: UIAdaptation[]
}

interface UIAdaptation {
  type: 'layout' | 'theme' | 'animation' | 'navigation' | 'content'
  target: string
  modification: Record<string, any>
  confidence: number
  impact: number
  reversible: boolean
}

interface AdaptationContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  dayOfWeek: 'weekday' | 'weekend'
  deviceType: 'mobile' | 'tablet' | 'desktop'
  networkSpeed: 'slow' | 'medium' | 'fast'
  batteryLevel?: number
  userMood?: 'focused' | 'relaxed' | 'excited' | 'stressed'
  taskComplexity: 'simple' | 'moderate' | 'complex'
  sessionDuration: number
  interactionFrequency: number
}

interface AdaptationMetrics {
  accuracy: number
  userSatisfaction: number
  performanceImpact: number
  adoptionRate: number
  rollbackRate: number
}

export function useAIAdaptation() {
  // Core state
  const isEnabled = ref(true)
  const isLearning = ref(true)
  const adaptationMode = ref<'conservative' | 'balanced' | 'aggressive'>('balanced')
  const currentAdaptations = ref<UIAdaptation[]>([])
  const behaviorPatterns = ref<UserBehaviorPattern[]>([])
  const adaptationHistory = ref<Array<{adaptation: UIAdaptation, timestamp: number, success: boolean}>>([])
  
  // Context and engines
  const contextAnalyzer = getContextAnalyzer()
  const behaviorEngine = getBehaviorEngine()
  const adaptationEngine = getAdaptationEngine()
  const predictiveUI = usePredictiveUI()
  const animations = useIntelligentAnimations()
  
  // Reactive adaptation state
  const adaptationState = reactive({
    currentContext: {} as AdaptationContext,
    dominantPattern: null as UserBehaviorPattern | null,
    pendingAdaptations: [] as UIAdaptation[],
    activeAdaptations: new Map<string, UIAdaptation>(),
    metrics: {
      accuracy: 0.85,
      userSatisfaction: 0.82,
      performanceImpact: 0.95,
      adoptionRate: 0.78,
      rollbackRate: 0.12
    } as AdaptationMetrics
  })
  
  // Learning parameters
  const learningConfig = reactive({
    patternMinimumSamples: 5,
    confidenceThreshold: 0.7,
    adaptationCooldown: 30000, // 30 seconds
    maxActiveAdaptations: 5,
    rollbackThreshold: 0.3,
    learningRate: 0.1
  })
  
  // Computed properties
  const adaptationSuggestions = computed(() => {
    const context = adaptationState.currentContext
    const pattern = adaptationState.dominantPattern
    
    if (!pattern || !isEnabled.value) return []
    
    return adaptationEngine.generateSuggestions(context, pattern, {
      mode: adaptationMode.value,
      existingAdaptations: currentAdaptations.value,
      userPreferences: getUserPreferences()
    })
  })
  
  const adaptationConfidence = computed(() => {
    if (behaviorPatterns.value.length === 0) return 0
    
    const avgConfidence = behaviorPatterns.value.reduce((sum, p) => sum + p.confidence, 0) / behaviorPatterns.value.length
    const contextRelevance = getContextRelevance()
    const historySuccess = getHistorySuccessRate()
    
    return (avgConfidence * 0.4 + contextRelevance * 0.3 + historySuccess * 0.3)
  })
  
  const adaptationImpact = computed(() => {
    return currentAdaptations.value.reduce((total, adaptation) => {
      return total + (adaptation.impact * adaptation.confidence)
    }, 0)
  })
  
  // Core methods
  const analyzeUserBehavior = () => {
    const rawData = behaviorEngine.collectBehaviorData()
    const patterns = behaviorEngine.identifyPatterns(rawData)
    
    patterns.forEach(pattern => {
      const existingIndex = behaviorPatterns.value.findIndex(p => p.id === pattern.id)
      
      if (existingIndex >= 0) {
        // Update existing pattern
        behaviorPatterns.value[existingIndex] = {
          ...behaviorPatterns.value[existingIndex],
          ...pattern,
          confidence: Math.min(behaviorPatterns.value[existingIndex].confidence + learningConfig.learningRate, 1),
          frequency: pattern.frequency,
          recency: Date.now()
        }
      } else if (pattern.frequency >= learningConfig.patternMinimumSamples) {
        // Add new pattern
        behaviorPatterns.value.push(pattern)
      }
    })
    
    // Update dominant pattern
    adaptationState.dominantPattern = findDominantPattern()
  }
  
  const generateAdaptations = () => {
    if (!isEnabled.value || !isLearning.value) return
    
    const suggestions = adaptationSuggestions.value
    const filteredSuggestions = suggestions.filter(suggestion => {
      return suggestion.confidence >= learningConfig.confidenceThreshold &&
             !isAdaptationActive(suggestion) &&
             canApplyAdaptation(suggestion)
    })
    
    // Limit active adaptations
    const availableSlots = learningConfig.maxActiveAdaptations - currentAdaptations.value.length
    const selectedAdaptations = filteredSuggestions
      .sort((a, b) => (b.confidence * b.impact) - (a.confidence * a.impact))
      .slice(0, availableSlots)
    
    adaptationState.pendingAdaptations = selectedAdaptations
  }
  
  const applyAdaptation = async (adaptation: UIAdaptation) => {
    try {
      const success = await adaptationEngine.applyAdaptation(adaptation)
      
      if (success) {
        currentAdaptations.value.push(adaptation)
        adaptationState.activeAdaptations.set(adaptation.target, adaptation)
        
        // Record in history
        adaptationHistory.value.push({
          adaptation,
          timestamp: Date.now(),
          success: true
        })
        
        // Animate the change if appropriate
        if (animations && adaptation.type === 'animation') {
          await animations.animateWithEmotion(
            document.querySelector(adaptation.target) as HTMLElement,
            'elegant',
            adaptation.modification
          )
        }
        
        console.log('🤖 Applied AI adaptation:', adaptation.type, 'to', adaptation.target)
      }
    } catch (error) {
      console.error('Failed to apply adaptation:', error)
      adaptationHistory.value.push({
        adaptation,
        timestamp: Date.now(),
        success: false
      })
    }
  }
  
  const rollbackAdaptation = async (adaptationId: string) => {
    const adaptation = currentAdaptations.value.find(a => a.target === adaptationId)
    if (!adaptation || !adaptation.reversible) return
    
    try {
      await adaptationEngine.rollbackAdaptation(adaptation)
      
      currentAdaptations.value = currentAdaptations.value.filter(a => a.target !== adaptationId)
      adaptationState.activeAdaptations.delete(adaptationId)
      
      console.log('🔄 Rolled back adaptation:', adaptationId)
    } catch (error) {
      console.error('Failed to rollback adaptation:', error)
    }
  }
  
  const evaluateAdaptations = () => {
    currentAdaptations.value.forEach(adaptation => {
      const performance = adaptationEngine.evaluatePerformance(adaptation)
      
      if (performance.satisfaction < learningConfig.rollbackThreshold) {
        rollbackAdaptation(adaptation.target)
      } else {
        // Strengthen successful adaptation
        const patternIndex = behaviorPatterns.value.findIndex(p => 
          p.adaptations.some(a => a.target === adaptation.target)
        )
        
        if (patternIndex >= 0) {
          behaviorPatterns.value[patternIndex].confidence = Math.min(
            behaviorPatterns.value[patternIndex].confidence + learningConfig.learningRate,
            1
          )
        }
      }
    })
    
    updateMetrics()
  }
  
  const personalizeExperience = () => {
    const context = adaptationState.currentContext
    const userPrefs = getUserPreferences()
    
    // Dynamic theme adaptation
    if (context.timeOfDay === 'evening' && !userPrefs.manualTheme) {
      applyAdaptation({
        type: 'theme',
        target: 'app-theme',
        modification: { theme: 'dark', transition: 'smooth' },
        confidence: 0.9,
        impact: 0.7,
        reversible: true
      })
    }
    
    // Performance-based layout adaptation
    if (context.networkSpeed === 'slow') {
      applyAdaptation({
        type: 'layout',
        target: 'content-grid',
        modification: { virtualization: true, pageSize: 6 },
        confidence: 0.85,
        impact: 0.8,
        reversible: true
      })
    }
    
    // Mood-based animation adaptation
    if (context.userMood === 'stressed') {
      applyAdaptation({
        type: 'animation',
        target: 'global-animations',
        modification: { speed: 'slow', easing: 'calm' },
        confidence: 0.8,
        impact: 0.6,
        reversible: true
      })
    }
  }
  
  // Helper functions
  const findDominantPattern = (): UserBehaviorPattern | null => {
    if (behaviorPatterns.value.length === 0) return null
    
    const now = Date.now()
    const weightedPatterns = behaviorPatterns.value.map(pattern => {
      const recencyWeight = Math.exp(-(now - pattern.recency) / (24 * 60 * 60 * 1000)) // 24 hour decay
      const score = pattern.confidence * pattern.frequency * recencyWeight
      return { pattern, score }
    })
    
    return weightedPatterns.sort((a, b) => b.score - a.score)[0]?.pattern || null
  }
  
  const isAdaptationActive = (adaptation: UIAdaptation): boolean => {
    return adaptationState.activeAdaptations.has(adaptation.target)
  }
  
  const canApplyAdaptation = (adaptation: UIAdaptation): boolean => {
    // Check cooldown
    const lastApplication = adaptationHistory.value
      .filter(h => h.adaptation.target === adaptation.target)
      .sort((a, b) => b.timestamp - a.timestamp)[0]
    
    if (lastApplication && Date.now() - lastApplication.timestamp < learningConfig.adaptationCooldown) {
      return false
    }
    
    // Check compatibility
    const conflictingAdaptations = currentAdaptations.value.filter(existing => 
      existing.type === adaptation.type && existing.target === adaptation.target
    )
    
    return conflictingAdaptations.length === 0
  }
  
  const getContextRelevance = (): number => {
    const context = adaptationState.currentContext
    const pattern = adaptationState.dominantPattern
    
    if (!pattern) return 0
    
    let relevance = 0
    const factors = Object.keys(context).length
    
    // Simple context matching logic
    if (pattern.triggers.includes(context.timeOfDay)) relevance += 1 / factors
    if (pattern.triggers.includes(context.deviceType)) relevance += 1 / factors
    if (pattern.triggers.includes(context.taskComplexity)) relevance += 1 / factors
    
    return Math.min(relevance * factors, 1)
  }
  
  const getHistorySuccessRate = (): number => {
    if (adaptationHistory.value.length === 0) return 0.5
    
    const recentHistory = adaptationHistory.value
      .filter(h => Date.now() - h.timestamp < 7 * 24 * 60 * 60 * 1000) // Last 7 days
    
    if (recentHistory.length === 0) return 0.5
    
    const successCount = recentHistory.filter(h => h.success).length
    return successCount / recentHistory.length
  }
  
  const getUserPreferences = () => {
    return {
      manualTheme: false,
      animationLevel: 'normal',
      dataUsage: 'auto',
      accessibility: false,
      privacy: 'balanced'
    }
  }
  
  const updateMetrics = () => {
    const recent = adaptationHistory.value.slice(-20)
    
    if (recent.length > 0) {
      adaptationState.metrics.accuracy = recent.filter(h => h.success).length / recent.length
      adaptationState.metrics.rollbackRate = recent.filter(h => !h.success).length / recent.length
    }
  }
  
  const updateContext = () => {
    const context = contextAnalyzer.getContext()
    const hour = new Date().getHours()
    const day = new Date().getDay()
    
    adaptationState.currentContext = {
      timeOfDay: hour < 6 ? 'night' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening',
      dayOfWeek: day === 0 || day === 6 ? 'weekend' : 'weekday',
      deviceType: context.deviceType || 'desktop',
      networkSpeed: context.networkSpeed || 'medium',
      batteryLevel: context.batteryLevel,
      userMood: detectUserMood(),
      taskComplexity: analyzeTaskComplexity(),
      sessionDuration: Date.now() - (sessionStartTime.value || Date.now()),
      interactionFrequency: calculateInteractionFrequency()
    }
  }
  
  const detectUserMood = (): AdaptationContext['userMood'] => {
    // Simple heuristic based on interaction patterns
    const recentInteractions = behaviorEngine.getRecentInteractions()
    const avgSpeed = recentInteractions.reduce((sum, i) => sum + i.speed, 0) / recentInteractions.length
    const errorRate = recentInteractions.filter(i => i.hasError).length / recentInteractions.length
    
    if (errorRate > 0.3) return 'stressed'
    if (avgSpeed > 1.5) return 'excited'
    if (avgSpeed < 0.5) return 'relaxed'
    return 'focused'
  }
  
  const analyzeTaskComplexity = (): AdaptationContext['taskComplexity'] => {
    const currentRoute = window.location.pathname
    
    if (currentRoute.includes('settings') || currentRoute.includes('billing')) return 'complex'
    if (currentRoute.includes('schedule') || currentRoute.includes('content')) return 'moderate'
    return 'simple'
  }
  
  const calculateInteractionFrequency = (): number => {
    const interactions = behaviorEngine.getRecentInteractions()
    const timeWindow = 60000 // 1 minute
    const recentInteractions = interactions.filter(i => Date.now() - i.timestamp < timeWindow)
    return recentInteractions.length / (timeWindow / 1000) // interactions per second
  }
  
  // Session tracking
  const sessionStartTime = ref<number>()
  
  // Lifecycle
  let analysisInterval: number
  let contextInterval: number
  let evaluationInterval: number
  
  onMounted(() => {
    sessionStartTime.value = Date.now()
    
    // Start analysis loops
    analysisInterval = window.setInterval(() => {
      if (isEnabled.value && isLearning.value) {
        analyzeUserBehavior()
        generateAdaptations()
        personalizeExperience()
      }
    }, 10000) // Every 10 seconds
    
    contextInterval = window.setInterval(() => {
      updateContext()
    }, 5000) // Every 5 seconds
    
    evaluationInterval = window.setInterval(() => {
      evaluateAdaptations()
    }, 30000) // Every 30 seconds
    
    // Initial setup
    updateContext()
    
    console.log('🤖 AI Adaptation System initialized')
  })
  
  onUnmounted(() => {
    if (analysisInterval) clearInterval(analysisInterval)
    if (contextInterval) clearInterval(contextInterval)
    if (evaluationInterval) clearInterval(evaluationInterval)
  })
  
  // Auto-apply pending adaptations
  watch(() => adaptationState.pendingAdaptations, (newAdaptations) => {
    if (adaptationMode.value === 'aggressive') {
      newAdaptations.forEach(adaptation => {
        if (adaptation.confidence > 0.8) {
          applyAdaptation(adaptation)
        }
      })
    } else if (adaptationMode.value === 'balanced') {
      newAdaptations.forEach(adaptation => {
        if (adaptation.confidence > 0.85 && adaptation.impact < 0.5) {
          applyAdaptation(adaptation)
        }
      })
    }
    // Conservative mode requires manual approval
  })
  
  return {
    // State
    isEnabled,
    isLearning,
    adaptationMode,
    currentAdaptations,
    behaviorPatterns,
    adaptationState,
    learningConfig,
    
    // Computed
    adaptationSuggestions,
    adaptationConfidence,
    adaptationImpact,
    
    // Methods
    applyAdaptation,
    rollbackAdaptation,
    analyzeUserBehavior,
    generateAdaptations,
    personalizeExperience,
    updateContext,
    
    // Utilities
    findDominantPattern,
    getUserPreferences,
    updateMetrics
  }
}