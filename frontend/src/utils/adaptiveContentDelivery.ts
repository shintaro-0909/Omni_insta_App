/**
 * Adaptive Content Delivery System
 * AI-powered personalized content delivery and user experience optimization
 */

import { ref, computed, reactive, readonly } from 'vue'
import { aiPredictionEngine } from './aiPredictionEngine'

interface AccessibilitySettings {
  highContrast: boolean
  largeText: boolean
  reducedMotion: boolean
  screenReader: boolean
}

interface ContentProfile {
  userId?: string
  preferences: UserPreferences
  behaviorHistory: ContentInteraction[]
  learningData: LearningData
  adaptationRules: AdaptationRule[]
}

interface UserPreferences {
  contentTypes: string[]
  visualStyle: 'minimal' | 'rich' | 'visual'
  interactionStyle: 'quick' | 'detailed' | 'guided'
  performanceMode: 'fast' | 'balanced' | 'rich'
  accessibility: AccessibilitySettings
}

interface ContentInteraction {
  contentId: string
  contentType: string
  action: 'view' | 'click' | 'share' | 'save' | 'skip'
  timestamp: number
  duration: number
  context: string
  satisfaction?: number
}

interface LearningData {
  patterns: Map<string, number>
  preferences: Map<string, number>
  performance: Map<string, number>
  errors: Map<string, number>
  adaptations: Map<string, number>
}

interface AdaptationRule {
  id: string
  condition: string
  action: 'show' | 'hide' | 'emphasize' | 'simplify' | 'prefetch'
  target: string
  confidence: number
  impact: number
}

interface ContentRecommendation {
  contentId: string
  type: string
  relevance: number
  reasoning: string
  adaptations: string[]
}

interface UIAdaptation {
  component: string
  property: string
  value: any
  reason: string
  confidence: number
}

class AdaptiveContentDelivery {
  private profile: ContentProfile
  private recommendations: ContentRecommendation[]
  private activeAdaptations: UIAdaptation[]
  private contentLibrary: Map<string, any>
  private performanceMetrics: Map<string, number>
  
  constructor() {
    this.profile = this.initializeProfile()
    this.recommendations = []
    this.activeAdaptations = []
    this.contentLibrary = new Map()
    this.performanceMetrics = new Map()
    
    this.startAdaptiveLearning()
    this.initializeContentLibrary()
  }

  /**
   * Initialize user profile
   */
  private initializeProfile(): ContentProfile {
    const stored = localStorage.getItem('adaptive_profile')
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        return this.migrateProfile(parsed)
      } catch (error) {
        console.warn('Failed to parse stored profile:', error)
      }
    }
    
    return {
      preferences: {
        contentTypes: ['posts', 'schedules', 'analytics'],
        visualStyle: 'balanced' as any,
        interactionStyle: 'balanced' as any,
        performanceMode: 'balanced',
        accessibility: {
          highContrast: false,
          largeText: false,
          reducedMotion: false,
          screenReader: false
        }
      },
      behaviorHistory: [],
      learningData: {
        patterns: new Map(),
        preferences: new Map(),
        performance: new Map(),
        errors: new Map(),
        adaptations: new Map()
      },
      adaptationRules: []
    }
  }

  /**
   * Start adaptive learning process
   */
  private startAdaptiveLearning(): void {
    this.setupContentTracking()
    this.setupPerformanceTracking()
    this.setupAdaptationEngine()
    
    // Update recommendations every 30 seconds
    setInterval(() => {
      this.updateRecommendations()
      this.applyAdaptations()
    }, 30000)
    
    console.log('🎯 Adaptive Content Delivery started learning')
  }

  /**
   * Setup content interaction tracking
   */
  private setupContentTracking(): void {
    // Track clicks and interactions
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      const contentInfo = this.extractContentInfo(target)
      
      if (contentInfo) {
        this.trackInteraction({
          contentId: contentInfo.id,
          contentType: contentInfo.type,
          action: 'click',
          timestamp: Date.now(),
          duration: 0,
          context: location.pathname
        })
      }
    })
    
    // Track content viewing time
    this.setupViewTimeTracking()
    
    // Track form interactions
    this.setupFormTracking()
  }

  /**
   * Setup view time tracking
   */
  private setupViewTimeTracking(): void {
    const visibilityTracker = new Map<string, number>()
    
    // Use Intersection Observer for accurate view tracking
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const contentInfo = this.extractContentInfo(entry.target as HTMLElement)
        if (!contentInfo) return
        
        if (entry.isIntersecting) {
          visibilityTracker.set(contentInfo.id, Date.now())
        } else {
          const startTime = visibilityTracker.get(contentInfo.id)
          if (startTime) {
            const duration = Date.now() - startTime
            
            this.trackInteraction({
              contentId: contentInfo.id,
              contentType: contentInfo.type,
              action: 'view',
              timestamp: startTime,
              duration,
              context: location.pathname
            })
            
            visibilityTracker.delete(contentInfo.id)
          }
        }
      })
    }, { threshold: 0.5 })
    
    // Observe content elements
    const observeContent = () => {
      document.querySelectorAll('[data-content-id]').forEach(el => {
        observer.observe(el)
      })
    }
    
    // Initial observation
    setTimeout(observeContent, 1000)
    
    // Re-observe on route changes
    window.addEventListener('popstate', () => {
      setTimeout(observeContent, 1000)
    })
  }

  /**
   * Setup form interaction tracking
   */
  private setupFormTracking(): void {
    document.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement
      const form = target.closest('form')
      
      if (form) {
        const formId = form.id || form.className || 'unknown-form'
        
        this.trackInteraction({
          contentId: formId,
          contentType: 'form',
          action: 'input' as any,
          timestamp: Date.now(),
          duration: 0,
          context: location.pathname
        })
      }
    })
    
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement
      const formId = form.id || form.className || 'unknown-form'
      
      this.trackInteraction({
        contentId: formId,
        contentType: 'form',
        action: 'submit' as any,
        timestamp: Date.now(),
        duration: 0,
        context: location.pathname
      })
    })
  }

  /**
   * Setup performance tracking for adaptations
   */
  private setupPerformanceTracking(): void {
    // Track page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        if (navigation) {
          this.performanceMetrics.set('loadTime', navigation.loadEventEnd - navigation.loadEventStart)
          this.performanceMetrics.set('domContentLoaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart)
        }
      }, 100)
    })
    
    // Track user interaction performance
    const measureInteractionDelay = () => {
      let startTime = 0
      
      document.addEventListener('pointerdown', () => {
        startTime = performance.now()
      }, { passive: true })
      
      document.addEventListener('click', () => {
        if (startTime > 0) {
          const delay = performance.now() - startTime
          this.performanceMetrics.set('interactionDelay', delay)
          
          if (delay > 100) {
            this.considerPerformanceAdaptation('slow_interaction', delay)
          }
        }
      })
    }
    
    measureInteractionDelay()
  }

  /**
   * Setup adaptation engine
   */
  private setupAdaptationEngine(): void {
    // Initialize base adaptation rules
    this.profile.adaptationRules = [
      {
        id: 'slow_device_simplify',
        condition: 'device_performance < 0.5',
        action: 'simplify',
        target: 'ui_components',
        confidence: 0.8,
        impact: 7
      },
      {
        id: 'frequent_user_shortcuts',
        condition: 'user_experience > 0.8',
        action: 'show',
        target: 'advanced_features',
        confidence: 0.9,
        impact: 6
      },
      {
        id: 'mobile_user_optimize',
        condition: 'device_type == mobile',
        action: 'emphasize',
        target: 'touch_targets',
        confidence: 0.95,
        impact: 8
      },
      {
        id: 'error_prone_areas',
        condition: 'error_rate > 0.1',
        action: 'emphasize',
        target: 'help_content',
        confidence: 0.7,
        impact: 9
      }
    ]
    
    // Auto-generate rules based on learning
    setInterval(() => {
      this.generateAdaptationRules()
    }, 300000) // Every 5 minutes
  }

  /**
   * Track content interaction
   */
  private trackInteraction(interaction: ContentInteraction): void {
    this.profile.behaviorHistory.push(interaction)
    
    // Limit history size
    if (this.profile.behaviorHistory.length > 1000) {
      this.profile.behaviorHistory = this.profile.behaviorHistory.slice(-500)
    }
    
    // Update learning data
    this.updateLearningData(interaction)
    
    // Trigger real-time adaptations for important interactions
    if (['click', 'submit'].includes(interaction.action)) {
      this.considerImmediateAdaptation(interaction)
    }
    
    // Persist profile periodically
    if (Math.random() < 0.1) { // 10% chance
      this.persistProfile()
    }
  }

  /**
   * Update learning data from interaction
   */
  private updateLearningData(interaction: ContentInteraction): void {
    const { patterns, preferences, performance } = this.profile.learningData
    
    // Update patterns
    const patternKey = `${interaction.contentType}_${interaction.action}`
    patterns.set(patternKey, (patterns.get(patternKey) || 0) + 1)
    
    // Update preferences based on engagement
    if (interaction.duration > 5000) { // Engaged for >5 seconds
      preferences.set(interaction.contentType, (preferences.get(interaction.contentType) || 0) + 1)
    }
    
    // Update performance data
    if (interaction.action === 'view' && interaction.duration > 0) {
      performance.set(interaction.contentId, interaction.duration)
    }
  }

  /**
   * Extract content information from DOM element
   */
  private extractContentInfo(element: HTMLElement): { id: string; type: string } | null {
    // Look for data attributes
    const contentId = element.dataset.contentId || element.closest('[data-content-id]')?.getAttribute('data-content-id')
    const contentType = element.dataset.contentType || element.closest('[data-content-type]')?.getAttribute('data-content-type')
    
    if (contentId && contentType) {
      return { id: contentId, type: contentType }
    }
    
    // Fallback to element classification
    if (element.matches('button, .btn, [role="button"]')) {
      return {
        id: element.id || element.className || 'button',
        type: 'button'
      }
    }
    
    if (element.matches('a, [role="link"]')) {
      return {
        id: element.getAttribute('href') || element.textContent?.substring(0, 20) || 'link',
        type: 'link'
      }
    }
    
    if (element.matches('.card, .post, .schedule, .account')) {
      return {
        id: element.id || element.className,
        type: 'content_card'
      }
    }
    
    return null
  }

  /**
   * Consider immediate adaptation based on interaction
   */
  private considerImmediateAdaptation(interaction: ContentInteraction): void {
    // Quick error detection
    if (interaction.action === 'click' && interaction.duration === 0) {
      const errorRate = this.calculateErrorRate(interaction.contentId)
      if (errorRate > 0.2) {
        this.applyEmergencyAdaptation(interaction.contentId, 'high_error_rate')
      }
    }
    
    // Engagement optimization
    if (interaction.action === 'view' && interaction.duration < 1000) {
      this.considerEngagementBoost(interaction.contentId)
    }
  }

  /**
   * Consider performance-based adaptation
   */
  private considerPerformanceAdaptation(type: string, value: number): void {
    switch (type) {
      case 'slow_interaction':
        if (value > 200) {
          this.applyAdaptation({
            component: 'ui',
            property: 'performance_mode',
            value: 'fast',
            reason: 'Slow interaction detected',
            confidence: 0.8
          })
        }
        break
        
      case 'slow_loading':
        if (value > 3000) {
          this.applyAdaptation({
            component: 'content',
            property: 'lazy_loading',
            value: true,
            reason: 'Slow loading detected',
            confidence: 0.9
          })
        }
        break
    }
  }

  /**
   * Update content recommendations
   */
  private updateRecommendations(): void {
    const userInsights = aiPredictionEngine.getAIInsights()
    const behaviorPatterns = this.analyzeBehaviorPatterns()
    
    this.recommendations = this.generateRecommendations(userInsights, behaviorPatterns)
  }

  /**
   * Analyze behavior patterns
   */
  private analyzeBehaviorPatterns(): any {
    const recent = this.profile.behaviorHistory.slice(-50)
    const patterns = {
      preferredContentTypes: this.getPreferredContentTypes(recent),
      interactionStyle: this.getInteractionStyle(recent),
      timePatterns: this.getTimePatterns(recent),
      errorPatterns: this.getErrorPatterns(recent)
    }
    
    return patterns
  }

  /**
   * Generate content recommendations
   */
  private generateRecommendations(userInsights: any, patterns: any): ContentRecommendation[] {
    const recommendations = []
    
    // Content type recommendations
    patterns.preferredContentTypes.forEach((confidence: number, contentType: string) => {
      if (confidence > 0.6) {
        recommendations.push({
          contentId: `${contentType}_recommendation`,
          type: contentType,
          relevance: confidence,
          reasoning: `User shows ${Math.round(confidence * 100)}% preference for ${contentType}`,
          adaptations: ['emphasize', 'prioritize']
        })
      }
    })
    
    // Performance-based recommendations
    if (userInsights.performanceScore < 70) {
      recommendations.push({
        contentId: 'performance_optimization',
        type: 'optimization',
        relevance: 0.9,
        reasoning: 'Performance issues detected - recommend optimization',
        adaptations: ['simplify', 'optimize']
      })
    }
    
    // Engagement recommendations
    if (userInsights.engagementLevel < 0.5) {
      recommendations.push({
        contentId: 'engagement_boost',
        type: 'ui_enhancement',
        relevance: 0.8,
        reasoning: 'Low engagement - recommend UI enhancements',
        adaptations: ['emphasize', 'guide']
      })
    }
    
    return recommendations.slice(0, 10) // Top 10 recommendations
  }

  /**
   * Apply UI adaptations
   */
  private applyAdaptations(): void {
    this.recommendations.forEach(rec => {
      rec.adaptations.forEach(adaptation => {
        this.applySpecificAdaptation(rec, adaptation)
      })
    })
    
    // Apply rule-based adaptations
    this.profile.adaptationRules.forEach(rule => {
      if (this.evaluateRule(rule)) {
        this.executeRule(rule)
      }
    })
  }

  /**
   * Apply specific adaptation
   */
  private applySpecificAdaptation(recommendation: ContentRecommendation, adaptation: string): void {
    const adaptationConfig = {
      component: recommendation.type,
      property: adaptation,
      value: true,
      reason: recommendation.reasoning,
      confidence: recommendation.relevance
    }
    
    this.applyAdaptation(adaptationConfig)
  }

  /**
   * Apply single adaptation
   */
  private applyAdaptation(adaptation: UIAdaptation): void {
    // Add to active adaptations
    const existingIndex = this.activeAdaptations.findIndex(
      a => a.component === adaptation.component && a.property === adaptation.property
    )
    
    if (existingIndex >= 0) {
      this.activeAdaptations[existingIndex] = adaptation
    } else {
      this.activeAdaptations.push(adaptation)
    }
    
    // Apply to DOM/Vue
    this.applyAdaptationToDOM(adaptation)
    
    console.log(`🎯 Applied adaptation: ${adaptation.component}.${adaptation.property} = ${adaptation.value}`)
  }

  /**
   * Apply adaptation to DOM
   */
  private applyAdaptationToDOM(adaptation: UIAdaptation): void {
    const className = `adaptive-${adaptation.component}-${adaptation.property}`
    
    switch (adaptation.property) {
      case 'performance_mode':
        document.body.classList.toggle('performance-mode', adaptation.value === 'fast')
        break
        
      case 'simplify':
        document.body.classList.toggle('simplified-ui', adaptation.value)
        break
        
      case 'emphasize':
        const targets = document.querySelectorAll(`[data-content-type="${adaptation.component}"]`)
        targets.forEach(el => {
          el.classList.toggle('emphasized', adaptation.value)
        })
        break
        
      case 'lazy_loading':
        if (adaptation.value) {
          this.enableLazyLoading()
        }
        break
        
      default:
        document.body.classList.toggle(className, !!adaptation.value)
    }
  }

  /**
   * Generate adaptation rules based on learning
   */
  private generateAdaptationRules(): void {
    const patterns = this.profile.learningData.patterns
    const errors = this.profile.learningData.errors
    
    // Generate rules for frequent error patterns
    for (const [errorPattern, frequency] of errors) {
      if (frequency > 5) {
        this.profile.adaptationRules.push({
          id: `auto_error_${errorPattern}`,
          condition: `error_pattern == ${errorPattern}`,
          action: 'emphasize',
          target: 'help_content',
          confidence: Math.min(frequency / 10, 0.9),
          impact: 8
        })
      }
    }
    
    // Generate rules for successful patterns
    for (const [pattern, frequency] of patterns) {
      if (frequency > 20) {
        this.profile.adaptationRules.push({
          id: `auto_success_${pattern}`,
          condition: `pattern == ${pattern}`,
          action: 'emphasize',
          target: pattern.split('_')[0],
          confidence: Math.min(frequency / 50, 0.9),
          impact: 6
        })
      }
    }
    
    // Limit rule count
    if (this.profile.adaptationRules.length > 50) {
      this.profile.adaptationRules = this.profile.adaptationRules
        .sort((a, b) => b.confidence * b.impact - a.confidence * a.impact)
        .slice(0, 30)
    }
  }

  /**
   * Helper methods
   */
  private getPreferredContentTypes(interactions: ContentInteraction[]): Map<string, number> {
    const preferences = new Map<string, number>()
    
    interactions.forEach(interaction => {
      if (interaction.duration > 3000) { // Engaged interaction
        const current = preferences.get(interaction.contentType) || 0
        preferences.set(interaction.contentType, current + 1)
      }
    })
    
    // Normalize to confidence scores
    const total = Array.from(preferences.values()).reduce((sum, count) => sum + count, 0)
    if (total > 0) {
      for (const [type, count] of preferences) {
        preferences.set(type, count / total)
      }
    }
    
    return preferences
  }

  private getInteractionStyle(interactions: ContentInteraction[]): string {
    const avgDuration = interactions.length > 0 
      ? interactions.reduce((sum, i) => sum + i.duration, 0) / interactions.length 
      : 0
    
    if (avgDuration > 10000) return 'detailed'
    if (avgDuration > 3000) return 'balanced'
    return 'quick'
  }

  private getTimePatterns(interactions: ContentInteraction[]): any {
    // Analyze time-based patterns
    const hourlyActivity = new Array(24).fill(0)
    
    interactions.forEach(interaction => {
      const hour = new Date(interaction.timestamp).getHours()
      hourlyActivity[hour]++
    })
    
    return { hourlyActivity }
  }

  private getErrorPatterns(interactions: ContentInteraction[]): Map<string, number> {
    const errors = new Map<string, number>()
    
    // Look for quick exits (potential errors)
    interactions.forEach(interaction => {
      if (interaction.action === 'click' && interaction.duration < 1000) {
        const current = errors.get(interaction.contentId) || 0
        errors.set(interaction.contentId, current + 1)
      }
    })
    
    return errors
  }

  private calculateErrorRate(contentId: string): number {
    const interactions = this.profile.behaviorHistory.filter(i => i.contentId === contentId)
    if (interactions.length === 0) return 0
    
    const errors = interactions.filter(i => i.action === 'click' && i.duration < 1000).length
    return errors / interactions.length
  }

  private applyEmergencyAdaptation(contentId: string, reason: string): void {
    this.applyAdaptation({
      component: contentId,
      property: 'emergency_help',
      value: true,
      reason: `Emergency adaptation: ${reason}`,
      confidence: 0.9
    })
  }

  private considerEngagementBoost(contentId: string): void {
    this.applyAdaptation({
      component: contentId,
      property: 'engagement_boost',
      value: true,
      reason: 'Low engagement detected',
      confidence: 0.7
    })
  }

  private evaluateRule(rule: AdaptationRule): boolean {
    // Simple rule evaluation - in production would use more sophisticated logic
    return rule.confidence > 0.6 && Math.random() < rule.confidence
  }

  private executeRule(rule: AdaptationRule): void {
    this.applyAdaptation({
      component: rule.target,
      property: rule.action,
      value: true,
      reason: `Rule: ${rule.condition}`,
      confidence: rule.confidence
    })
  }

  private enableLazyLoading(): void {
    const images = document.querySelectorAll('img[src]:not([loading])')
    images.forEach(img => {
      img.setAttribute('loading', 'lazy')
    })
  }

  private migrateProfile(profile: any): ContentProfile {
    // Migrate old profile format if needed
    return {
      ...profile,
      learningData: {
        patterns: new Map(profile.learningData?.patterns || []),
        preferences: new Map(profile.learningData?.preferences || []),
        performance: new Map(profile.learningData?.performance || []),
        errors: new Map(profile.learningData?.errors || []),
        adaptations: new Map(profile.learningData?.adaptations || [])
      }
    }
  }

  private initializeContentLibrary(): void {
    // Initialize with common content types
    this.contentLibrary.set('posts', {
      priority: 8,
      loadStrategy: 'eager',
      adaptations: ['visual', 'performance']
    })
    
    this.contentLibrary.set('schedules', {
      priority: 7,
      loadStrategy: 'lazy',
      adaptations: ['layout', 'interaction']
    })
    
    this.contentLibrary.set('analytics', {
      priority: 6,
      loadStrategy: 'lazy',
      adaptations: ['performance', 'complexity']
    })
  }

  private persistProfile(): void {
    try {
      const serializable = {
        ...this.profile,
        learningData: {
          patterns: Array.from(this.profile.learningData.patterns.entries()),
          preferences: Array.from(this.profile.learningData.preferences.entries()),
          performance: Array.from(this.profile.learningData.performance.entries()),
          errors: Array.from(this.profile.learningData.errors.entries()),
          adaptations: Array.from(this.profile.learningData.adaptations.entries())
        }
      }
      
      localStorage.setItem('adaptive_profile', JSON.stringify(serializable))
    } catch (error) {
      console.warn('Failed to persist adaptive profile:', error)
    }
  }

  /**
   * Public API
   */
  
  /**
   * Get current recommendations
   */
  getRecommendations(): ContentRecommendation[] {
    return this.recommendations
  }

  /**
   * Get active adaptations
   */
  getActiveAdaptations(): UIAdaptation[] {
    return this.activeAdaptations
  }

  /**
   * Get user profile
   */
  getProfile(): ContentProfile {
    return this.profile
  }

  /**
   * Update user preferences
   */
  updatePreferences(preferences: Partial<UserPreferences>): void {
    this.profile.preferences = { ...this.profile.preferences, ...preferences }
    this.persistProfile()
    this.updateRecommendations()
  }

  /**
   * Force adaptation update
   */
  updateAdaptations(): void {
    this.updateRecommendations()
    this.applyAdaptations()
  }

  /**
   * Get adaptation insights
   */
  getAdaptationInsights(): any {
    return {
      totalAdaptations: this.activeAdaptations.length,
      avgConfidence: this.activeAdaptations.reduce((sum, a) => sum + a.confidence, 0) / this.activeAdaptations.length,
      preferredTypes: Array.from(this.profile.learningData.preferences.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5),
      performanceImpact: this.calculatePerformanceImpact(),
      learningProgress: this.calculateLearningProgress()
    }
  }

  private calculatePerformanceImpact(): number {
    // Calculate performance improvement from adaptations
    const performanceAdaptations = this.activeAdaptations.filter(a => 
      ['performance_mode', 'lazy_loading', 'simplify'].includes(a.property)
    )
    
    return performanceAdaptations.length * 10 // Rough estimate
  }

  private calculateLearningProgress(): number {
    const totalInteractions = this.profile.behaviorHistory.length
    return Math.min(totalInteractions / 100, 1) // 100 interactions for full learning
  }
}

// Global adaptive content delivery instance
export const adaptiveContentDelivery = new AdaptiveContentDelivery()

// Vue composable for adaptive content
export function useAdaptiveContentDelivery() {
  const recommendations = ref([])
  const adaptations = ref([])
  const profile = ref({})
  const insights = ref({})
  
  const updateData = () => {
    recommendations.value = adaptiveContentDelivery.getRecommendations()
    adaptations.value = adaptiveContentDelivery.getActiveAdaptations()
    profile.value = adaptiveContentDelivery.getProfile()
    insights.value = adaptiveContentDelivery.getAdaptationInsights()
  }
  
  // Update every 30 seconds
  setInterval(updateData, 30000)
  updateData() // Initial update
  
  const isAdaptive = computed(() => adaptations.value.length > 0)
  const learningProgress = computed(() => insights.value.learningProgress || 0)
  
  return {
    recommendations: readonly(recommendations),
    adaptations: readonly(adaptations),
    profile: readonly(profile),
    insights: readonly(insights),
    isAdaptive,
    learningProgress,
    updatePreferences: (prefs: any) => adaptiveContentDelivery.updatePreferences(prefs),
    updateAdaptations: () => adaptiveContentDelivery.updateAdaptations()
  }
}

export default adaptiveContentDelivery