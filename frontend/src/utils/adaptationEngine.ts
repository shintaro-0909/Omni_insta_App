/**
 * AI-driven UI Adaptation Engine
 * Applies and manages dynamic UI adaptations based on user behavior patterns
 */

import { nextTick } from 'vue'
import type { BehaviorPattern } from './behaviorEngine'

interface UIAdaptation {
  type: 'layout' | 'theme' | 'animation' | 'navigation' | 'content'
  target: string
  modification: Record<string, any>
  confidence: number
  impact: number
  reversible: boolean
  metadata?: Record<string, any>
}

interface AdaptationSuggestion extends UIAdaptation {
  reasoning: string
  prerequisites: string[]
  conflicts: string[]
  expectedOutcome: string
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

interface AdaptationOptions {
  mode: 'conservative' | 'balanced' | 'aggressive'
  existingAdaptations: UIAdaptation[]
  userPreferences: Record<string, any>
}

interface PerformanceMetrics {
  satisfaction: number
  efficiency: number
  errorReduction: number
  usageIncrease: number
  timeToComplete: number
}

class AdaptationEngine {
  private activeAdaptations: Map<string, UIAdaptation> = new Map()
  private originalStyles: Map<string, any> = new Map()
  private adaptationHistory: Array<{adaptation: UIAdaptation, applied: Date, success: boolean}> = []
  private observers: Set<MutationObserver> = new Set()
  private styleSheets: Map<string, CSSStyleSheet> = new Map()
  
  constructor() {
    this.initializeStyleSystem()
  }
  
  private initializeStyleSystem() {
    // Create dynamic stylesheet for adaptations
    const style = document.createElement('style')
    style.id = 'ai-adaptations'
    document.head.appendChild(style)
    
    if (style.sheet) {
      this.styleSheets.set('main', style.sheet)
    }
    
    console.log('🎨 Adaptation Engine initialized')
  }
  
  generateSuggestions(
    context: AdaptationContext,
    pattern: BehaviorPattern,
    options: AdaptationOptions
  ): AdaptationSuggestion[] {
    const suggestions: AdaptationSuggestion[] = []
    
    // Theme adaptations based on time and mood
    if (pattern.triggers.includes('stress') || context.userMood === 'stressed') {
      suggestions.push({
        type: 'theme',
        target: 'color-scheme',
        modification: {
          primaryColor: '#4A90E2', // Calming blue
          accentColor: '#7ED321', // Soothing green
          contrast: 'reduced'
        },
        confidence: 0.85,
        impact: 0.7,
        reversible: true,
        reasoning: 'Calming colors to reduce stress',
        prerequisites: [],
        conflicts: ['theme-override'],
        expectedOutcome: 'Reduced visual stress and improved focus'
      })
    }
    
    // Animation adaptations for different user speeds
    if (pattern.id === 'rapid-clicking') {
      suggestions.push({
        type: 'animation',
        target: 'transition-speed',
        modification: {
          duration: '150ms',
          easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        },
        confidence: 0.9,
        impact: 0.6,
        reversible: true,
        reasoning: 'Faster animations for impatient users',
        prerequisites: [],
        conflicts: ['slow-animations'],
        expectedOutcome: 'Reduced perceived latency'
      })
    }
    
    // Layout adaptations for repetitive navigation
    if (pattern.id === 'repetitive-navigation') {
      suggestions.push({
        type: 'navigation',
        target: 'breadcrumbs',
        modification: {
          show: true,
          position: 'prominent',
          style: 'enhanced'
        },
        confidence: 0.8,
        impact: 0.8,
        reversible: true,
        reasoning: 'Enhanced navigation aids for confused users',
        prerequisites: [],
        conflicts: ['minimal-ui'],
        expectedOutcome: 'Improved navigation clarity'
      })
    }
    
    // Content adaptations for task-focused users
    if (pattern.id === 'task-focused') {
      suggestions.push({
        type: 'layout',
        target: 'interface-density',
        modification: {
          density: 'compact',
          showAdvanced: true,
          hideNonEssential: true
        },
        confidence: 0.75,
        impact: 0.5,
        reversible: true,
        reasoning: 'Compact interface for efficient users',
        prerequisites: [],
        conflicts: ['spacious-layout'],
        expectedOutcome: 'Increased efficiency and reduced clutter'
      })
    }
    
    // Performance adaptations for slow network
    if (context.networkSpeed === 'slow') {
      suggestions.push({
        type: 'content',
        target: 'image-optimization',
        modification: {
          lazyLoading: true,
          quality: 'compressed',
          placeholder: 'blur'
        },
        confidence: 0.95,
        impact: 0.9,
        reversible: true,
        reasoning: 'Optimize content for slow connections',
        prerequisites: [],
        conflicts: [],
        expectedOutcome: 'Faster loading times'
      })
    }
    
    // Device-specific adaptations
    if (context.deviceType === 'mobile') {
      suggestions.push({
        type: 'layout',
        target: 'touch-targets',
        modification: {
          minSize: '44px',
          spacing: 'increased',
          hapticFeedback: true
        },
        confidence: 0.9,
        impact: 0.8,
        reversible: true,
        reasoning: 'Optimize for touch interaction',
        prerequisites: [],
        conflicts: ['desktop-optimized'],
        expectedOutcome: 'Improved mobile usability'
      })
    }
    
    // Filter suggestions based on mode and conflicts
    return this.filterSuggestions(suggestions, options)
  }
  
  private filterSuggestions(
    suggestions: AdaptationSuggestion[],
    options: AdaptationOptions
  ): AdaptationSuggestion[] {
    const filtered = suggestions.filter(suggestion => {
      // Check confidence threshold based on mode
      const confidenceThreshold = {
        conservative: 0.9,
        balanced: 0.8,
        aggressive: 0.7
      }[options.mode]
      
      if (suggestion.confidence < confidenceThreshold) return false
      
      // Check for conflicts with existing adaptations
      const hasConflict = options.existingAdaptations.some(existing => 
        suggestion.conflicts.includes(existing.target) ||
        existing.target === suggestion.target
      )
      
      if (hasConflict) return false
      
      // Check user preferences
      if (options.userPreferences.disableAdaptations) return false
      if (options.userPreferences.preserveTheme && suggestion.type === 'theme') return false
      
      return true
    })
    
    // Sort by impact * confidence
    return filtered.sort((a, b) => (b.impact * b.confidence) - (a.impact * a.confidence))
  }
  
  async applyAdaptation(adaptation: UIAdaptation): Promise<boolean> {
    try {
      // Store original state for potential rollback
      if (!this.originalStyles.has(adaptation.target)) {
        this.storeOriginalState(adaptation.target)
      }
      
      // Apply the adaptation based on type
      switch (adaptation.type) {
        case 'theme':
          await this.applyThemeAdaptation(adaptation)
          break
        case 'layout':
          await this.applyLayoutAdaptation(adaptation)
          break
        case 'animation':
          await this.applyAnimationAdaptation(adaptation)
          break
        case 'navigation':
          await this.applyNavigationAdaptation(adaptation)
          break
        case 'content':
          await this.applyContentAdaptation(adaptation)
          break
        default:
          throw new Error(`Unknown adaptation type: ${adaptation.type}`)
      }
      
      // Store active adaptation
      this.activeAdaptations.set(adaptation.target, adaptation)
      
      // Record success
      this.adaptationHistory.push({
        adaptation,
        applied: new Date(),
        success: true
      })
      
      console.log(`✨ Applied ${adaptation.type} adaptation to ${adaptation.target}`)
      return true
      
    } catch (error) {
      console.error('Failed to apply adaptation:', error)
      
      // Record failure
      this.adaptationHistory.push({
        adaptation,
        applied: new Date(),
        success: false
      })
      
      return false
    }
  }
  
  private async applyThemeAdaptation(adaptation: UIAdaptation) {
    const { modification } = adaptation
    const root = document.documentElement
    
    // Apply CSS custom properties
    if (modification.primaryColor) {
      root.style.setProperty('--v-primary-base', modification.primaryColor)
    }
    
    if (modification.accentColor) {
      root.style.setProperty('--v-secondary-base', modification.accentColor)
    }
    
    if (modification.contrast === 'reduced') {
      root.style.setProperty('--adaptation-contrast', '0.8')
      this.addGlobalCSS('reduced-contrast', `
        .v-application {
          filter: contrast(0.8);
        }
      `)
    }
    
    // Smooth theme transition
    root.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    
    await nextTick()
    
    // Remove transition after completion
    setTimeout(() => {
      root.style.transition = ''
    }, 300)
  }
  
  private async applyLayoutAdaptation(adaptation: UIAdaptation) {
    const { modification } = adaptation
    
    if (modification.density === 'compact') {
      this.addGlobalCSS('compact-layout', `
        .v-card { padding: 12px !important; }
        .v-list-item { min-height: 36px !important; }
        .v-btn { padding: 0 12px !important; }
        .v-text-field .v-input__control { margin-top: 4px !important; }
      `)
    }
    
    if (modification.showAdvanced) {
      document.querySelectorAll('[data-advanced]').forEach(el => {
        (el as HTMLElement).style.display = 'block'
      })
    }
    
    if (modification.hideNonEssential) {
      document.querySelectorAll('[data-optional]').forEach(el => {
        (el as HTMLElement).style.display = 'none'
      })
    }
    
    if (modification.minSize || modification.spacing === 'increased') {
      this.addGlobalCSS('touch-optimization', `
        .v-btn { min-height: 44px !important; min-width: 44px !important; }
        .v-list-item { min-height: 48px !important; }
        .v-card { margin-bottom: 16px !important; }
      `)
    }
  }
  
  private async applyAnimationAdaptation(adaptation: UIAdaptation) {
    const { modification } = adaptation
    
    if (modification.duration || modification.easing) {
      const duration = modification.duration || '250ms'
      const easing = modification.easing || 'cubic-bezier(0.4, 0, 0.2, 1)'
      
      this.addGlobalCSS('animation-adaptation', `
        .v-application * {
          transition-duration: ${duration} !important;
          transition-timing-function: ${easing} !important;
        }
      `)
    }
    
    if (modification.speed === 'slow') {
      this.addGlobalCSS('slow-animations', `
        .v-application * {
          transition-duration: 600ms !important;
          animation-duration: 800ms !important;
        }
      `)
    }
  }
  
  private async applyNavigationAdaptation(adaptation: UIAdaptation) {
    const { modification } = adaptation
    
    if (modification.show && adaptation.target === 'breadcrumbs') {
      // Find or create breadcrumb container
      let breadcrumbContainer = document.querySelector('.ai-breadcrumbs')
      
      if (!breadcrumbContainer) {
        breadcrumbContainer = document.createElement('div')
        breadcrumbContainer.className = 'ai-breadcrumbs'
        
        const toolbar = document.querySelector('.v-toolbar')
        if (toolbar) {
          toolbar.appendChild(breadcrumbContainer)
        }
      }
      
      // Generate breadcrumbs based on current route
      const path = window.location.pathname
      const segments = path.split('/').filter(Boolean)
      
      breadcrumbContainer.innerHTML = segments.map((segment, index) => {
        const isLast = index === segments.length - 1
        const href = '/' + segments.slice(0, index + 1).join('/')
        const label = segment.charAt(0).toUpperCase() + segment.slice(1)
        
        return isLast 
          ? `<span class="breadcrumb-current">${label}</span>`
          : `<a href="${href}" class="breadcrumb-link">${label}</a> / `
      }).join('')
      
      this.addGlobalCSS('breadcrumb-styles', `
        .ai-breadcrumbs {
          padding: 8px 16px;
          font-size: 14px;
          background: rgba(var(--v-surface-base-rgb), 0.1);
          border-radius: 4px;
          margin: 8px 0;
        }
        .breadcrumb-link {
          color: var(--v-primary-base);
          text-decoration: none;
        }
        .breadcrumb-link:hover {
          text-decoration: underline;
        }
        .breadcrumb-current {
          font-weight: 500;
          color: var(--v-text-base);
        }
      `)
    }
  }
  
  private async applyContentAdaptation(adaptation: UIAdaptation) {
    const { modification } = adaptation
    
    if (modification.lazyLoading) {
      // Apply intersection observer to images
      const images = document.querySelectorAll('img:not([data-ai-observed])')
      
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            if (img.dataset.src) {
              img.src = img.dataset.src
              img.removeAttribute('data-src')
            }
            imageObserver.unobserve(img)
          }
        })
      })
      
      images.forEach(img => {
        img.setAttribute('data-ai-observed', 'true')
        imageObserver.observe(img)
      })
      
      this.observers.add(imageObserver)
    }
    
    if (modification.quality === 'compressed') {
      this.addGlobalCSS('image-compression', `
        img {
          image-rendering: -webkit-optimize-contrast;
        }
      `)
    }
  }
  
  private addGlobalCSS(id: string, css: string) {
    const styleSheet = this.styleSheets.get('main')
    if (!styleSheet) return
    
    try {
      // Remove existing rule with same ID
      const existingIndex = Array.from(styleSheet.cssRules).findIndex(
        rule => rule instanceof CSSStyleRule && (rule as any).selectorText?.includes(id)
      )
      
      if (existingIndex >= 0) {
        styleSheet.deleteRule(existingIndex)
      }
      
      // Add new rule
      styleSheet.insertRule(`/* ${id} */ ${css}`, styleSheet.cssRules.length)
    } catch (error) {
      console.warn('Failed to add CSS rule:', error)
    }
  }
  
  private storeOriginalState(target: string) {
    const element = document.querySelector(target)
    if (!element) return
    
    const computedStyle = getComputedStyle(element)
    const originalState = {
      display: computedStyle.display,
      visibility: computedStyle.visibility,
      opacity: computedStyle.opacity,
      transform: computedStyle.transform,
      transition: computedStyle.transition
    }
    
    this.originalStyles.set(target, originalState)
  }
  
  async rollbackAdaptation(adaptation: UIAdaptation): Promise<boolean> {
    try {
      const original = this.originalStyles.get(adaptation.target)
      
      switch (adaptation.type) {
        case 'theme':
          await this.rollbackThemeAdaptation(adaptation, original)
          break
        case 'layout':
          await this.rollbackLayoutAdaptation(adaptation, original)
          break
        case 'animation':
          await this.rollbackAnimationAdaptation(adaptation, original)
          break
        case 'navigation':
          await this.rollbackNavigationAdaptation(adaptation, original)
          break
        case 'content':
          await this.rollbackContentAdaptation(adaptation, original)
          break
      }
      
      // Remove from active adaptations
      this.activeAdaptations.delete(adaptation.target)
      this.originalStyles.delete(adaptation.target)
      
      console.log(`🔄 Rolled back ${adaptation.type} adaptation from ${adaptation.target}`)
      return true
      
    } catch (error) {
      console.error('Failed to rollback adaptation:', error)
      return false
    }
  }
  
  private async rollbackThemeAdaptation(adaptation: UIAdaptation, original: any) {
    const root = document.documentElement
    
    // Remove custom properties
    root.style.removeProperty('--v-primary-base')
    root.style.removeProperty('--v-secondary-base')
    root.style.removeProperty('--adaptation-contrast')
    
    // Remove CSS rules
    this.removeGlobalCSS('reduced-contrast')
  }
  
  private async rollbackLayoutAdaptation(adaptation: UIAdaptation, original: any) {
    this.removeGlobalCSS('compact-layout')
    this.removeGlobalCSS('touch-optimization')
    
    // Restore element visibility
    document.querySelectorAll('[data-advanced]').forEach(el => {
      (el as HTMLElement).style.display = ''
    })
    
    document.querySelectorAll('[data-optional]').forEach(el => {
      (el as HTMLElement).style.display = ''
    })
  }
  
  private async rollbackAnimationAdaptation(adaptation: UIAdaptation, original: any) {
    this.removeGlobalCSS('animation-adaptation')
    this.removeGlobalCSS('slow-animations')
  }
  
  private async rollbackNavigationAdaptation(adaptation: UIAdaptation, original: any) {
    const breadcrumbs = document.querySelector('.ai-breadcrumbs')
    if (breadcrumbs) {
      breadcrumbs.remove()
    }
    
    this.removeGlobalCSS('breadcrumb-styles')
  }
  
  private async rollbackContentAdaptation(adaptation: UIAdaptation, original: any) {
    this.removeGlobalCSS('image-compression')
    
    // Disconnect observers
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
  }
  
  private removeGlobalCSS(id: string) {
    const styleSheet = this.styleSheets.get('main')
    if (!styleSheet) return
    
    try {
      const rules = Array.from(styleSheet.cssRules)
      const index = rules.findIndex(rule => 
        rule.cssText.includes(`/* ${id} */`)
      )
      
      if (index >= 0) {
        styleSheet.deleteRule(index)
      }
    } catch (error) {
      console.warn('Failed to remove CSS rule:', error)
    }
  }
  
  evaluatePerformance(adaptation: UIAdaptation): PerformanceMetrics {
    // Simple heuristic-based performance evaluation
    const history = this.adaptationHistory
      .filter(h => h.adaptation.target === adaptation.target)
      .slice(-10) // Last 10 applications
    
    if (history.length === 0) {
      return {
        satisfaction: 0.5,
        efficiency: 0.5,
        errorReduction: 0.5,
        usageIncrease: 0.5,
        timeToComplete: 1
      }
    }
    
    const successRate = history.filter(h => h.success).length / history.length
    
    // Mock metrics - in a real app, these would be measured
    return {
      satisfaction: successRate * 0.8 + 0.2,
      efficiency: Math.min(successRate * 1.2, 1),
      errorReduction: adaptation.impact * successRate,
      usageIncrease: adaptation.confidence * 0.6,
      timeToComplete: 1 - (adaptation.impact * 0.3)
    }
  }
  
  getActiveAdaptations(): UIAdaptation[] {
    return Array.from(this.activeAdaptations.values())
  }
  
  getAdaptationHistory(): Array<{adaptation: UIAdaptation, applied: Date, success: boolean}> {
    return [...this.adaptationHistory]
  }
  
  destroy() {
    // Clean up all adaptations
    this.activeAdaptations.forEach(adaptation => {
      this.rollbackAdaptation(adaptation)
    })
    
    // Remove style sheets
    const styleElement = document.getElementById('ai-adaptations')
    if (styleElement) {
      styleElement.remove()
    }
    
    // Disconnect observers
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
    
    console.log('🎨 Adaptation Engine destroyed')
  }
}

// Singleton instance
let adaptationEngineInstance: AdaptationEngine | null = null

export function getAdaptationEngine(): AdaptationEngine {
  if (!adaptationEngineInstance) {
    adaptationEngineInstance = new AdaptationEngine()
  }
  return adaptationEngineInstance
}

export type { UIAdaptation, AdaptationSuggestion, AdaptationContext, PerformanceMetrics }