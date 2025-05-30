/**
 * AI-driven Behavior Analysis Engine
 * Collects and analyzes user interaction patterns for UI adaptation
 */

interface UserInteraction {
  type: 'click' | 'scroll' | 'hover' | 'focus' | 'input' | 'navigation' | 'gesture'
  target: string
  timestamp: number
  duration: number
  speed: number
  accuracy: number
  context: Record<string, any>
  hasError: boolean
  metadata?: Record<string, any>
}

interface BehaviorPattern {
  id: string
  name: string
  description: string
  confidence: number
  frequency: number
  recency: number
  triggers: string[]
  preferences: Record<string, any>
  adaptations: any[]
}

interface BehaviorMetrics {
  totalInteractions: number
  averageSessionDuration: number
  mostUsedFeatures: string[]
  errorRate: number
  preferredInteractionStyle: 'fast' | 'deliberate' | 'exploratory'
  taskSuccessRate: number
  navigationEfficiency: number
}

class BehaviorEngine {
  private interactions: UserInteraction[] = []
  private patterns: Map<string, BehaviorPattern> = new Map()
  private observers: Set<MutationObserver> = new Set()
  private listeners: Map<string, EventListener> = new Map()
  private sessionStart: number = Date.now()
  private isCollecting: boolean = false
  
  // Behavior analysis configuration
  private config = {
    maxInteractionHistory: 1000,
    patternDetectionThreshold: 5,
    confidenceDecayRate: 0.01,
    spatialAccuracyRadius: 10,
    temporalWindowSize: 60000, // 1 minute
    semanticSimilarityThreshold: 0.7
  }
  
  constructor() {
    this.initializeCollection()
  }
  
  private initializeCollection() {
    if (typeof window === 'undefined') return
    
    this.isCollecting = true
    this.sessionStart = Date.now()
    
    // Set up interaction listeners
    this.setupClickTracking()
    this.setupScrollTracking()
    this.setupNavigationTracking()
    this.setupInputTracking()
    this.setupHoverTracking()
    this.setupErrorTracking()
    
    console.log('🧠 Behavior Engine initialized')
  }
  
  private setupClickTracking() {
    const clickListener = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const interaction: UserInteraction = {
        type: 'click',
        target: this.getElementSignature(target),
        timestamp: Date.now(),
        duration: 0,
        speed: this.calculateClickSpeed(event),
        accuracy: this.calculateClickAccuracy(event, target),
        context: {
          x: event.clientX,
          y: event.clientY,
          button: event.button,
          ctrlKey: event.ctrlKey,
          shiftKey: event.shiftKey,
          altKey: event.altKey
        },
        hasError: false
      }
      
      this.recordInteraction(interaction)
    }
    
    document.addEventListener('click', clickListener)
    this.listeners.set('click', clickListener)
  }
  
  private setupScrollTracking() {
    let lastScrollTime = 0
    let scrollStartY = 0
    let isScrolling = false
    
    const scrollListener = (event: Event) => {
      const now = Date.now()
      
      if (!isScrolling) {
        isScrolling = true
        scrollStartY = window.scrollY
        lastScrollTime = now
        return
      }
      
      // Debounce scroll end detection
      setTimeout(() => {
        if (now - lastScrollTime > 150) { // Scroll ended
          const distance = Math.abs(window.scrollY - scrollStartY)
          const duration = now - lastScrollTime
          
          const interaction: UserInteraction = {
            type: 'scroll',
            target: 'window',
            timestamp: lastScrollTime,
            duration,
            speed: distance / duration,
            accuracy: 1, // Scrolling doesn't have accuracy per se
            context: {
              startY: scrollStartY,
              endY: window.scrollY,
              distance,
              direction: window.scrollY > scrollStartY ? 'down' : 'up'
            },
            hasError: false
          }
          
          this.recordInteraction(interaction)
          isScrolling = false
        }
      }, 150)
      
      lastScrollTime = now
    }
    
    window.addEventListener('scroll', scrollListener, { passive: true })
    this.listeners.set('scroll', scrollListener)
  }
  
  private setupNavigationTracking() {
    let navigationStart = Date.now()
    
    const beforeUnloadListener = () => {
      const duration = Date.now() - navigationStart
      
      const interaction: UserInteraction = {
        type: 'navigation',
        target: window.location.pathname,
        timestamp: navigationStart,
        duration,
        speed: 1,
        accuracy: 1,
        context: {
          from: document.referrer,
          to: window.location.href,
          sessionDuration: Date.now() - this.sessionStart
        },
        hasError: false
      }
      
      this.recordInteraction(interaction)
    }
    
    // Track route changes in SPA
    const hashChangeListener = () => {
      const now = Date.now()
      const duration = now - navigationStart
      
      const interaction: UserInteraction = {
        type: 'navigation',
        target: window.location.hash || window.location.pathname,
        timestamp: navigationStart,
        duration,
        speed: 1,
        accuracy: 1,
        context: {
          type: 'spa-navigation',
          hash: window.location.hash,
          pathname: window.location.pathname
        },
        hasError: false
      }
      
      this.recordInteraction(interaction)
      navigationStart = now
    }
    
    window.addEventListener('beforeunload', beforeUnloadListener)
    window.addEventListener('hashchange', hashChangeListener)
    this.listeners.set('beforeunload', beforeUnloadListener)
    this.listeners.set('hashchange', hashChangeListener)
  }
  
  private setupInputTracking() {
    let inputStart = 0
    let inputElement: HTMLElement | null = null
    
    const focusListener = (event: FocusEvent) => {
      inputStart = Date.now()
      inputElement = event.target as HTMLElement
    }
    
    const blurListener = (event: FocusEvent) => {
      if (!inputElement || !inputStart) return
      
      const duration = Date.now() - inputStart
      const target = event.target as HTMLInputElement
      
      const interaction: UserInteraction = {
        type: 'input',
        target: this.getElementSignature(target),
        timestamp: inputStart,
        duration,
        speed: target.value ? target.value.length / duration : 0,
        accuracy: this.calculateInputAccuracy(target),
        context: {
          inputType: target.type,
          valueLength: target.value?.length || 0,
          hasValue: !!target.value
        },
        hasError: !target.checkValidity()
      }
      
      this.recordInteraction(interaction)
      inputElement = null
      inputStart = 0
    }
    
    document.addEventListener('focusin', focusListener)
    document.addEventListener('focusout', blurListener)
    this.listeners.set('focusin', focusListener)
    this.listeners.set('focusout', blurListener)
  }
  
  private setupHoverTracking() {
    let hoverStart = 0
    let hoverTarget: HTMLElement | null = null
    
    const mouseEnterListener = (event: MouseEvent) => {
      hoverStart = Date.now()
      hoverTarget = event.target as HTMLElement
    }
    
    const mouseLeaveListener = (event: MouseEvent) => {
      if (!hoverTarget || !hoverStart) return
      
      const duration = Date.now() - hoverStart
      if (duration < 100) return // Ignore very brief hovers
      
      const interaction: UserInteraction = {
        type: 'hover',
        target: this.getElementSignature(hoverTarget),
        timestamp: hoverStart,
        duration,
        speed: 1,
        accuracy: 1,
        context: {
          elementType: hoverTarget.tagName.toLowerCase(),
          hasTooltip: !!hoverTarget.title,
          isInteractive: this.isInteractiveElement(hoverTarget)
        },
        hasError: false
      }
      
      this.recordInteraction(interaction)
      hoverTarget = null
      hoverStart = 0
    }
    
    document.addEventListener('mouseenter', mouseEnterListener, true)
    document.addEventListener('mouseleave', mouseLeaveListener, true)
    this.listeners.set('mouseenter', mouseEnterListener)
    this.listeners.set('mouseleave', mouseLeaveListener)
  }
  
  private setupErrorTracking() {
    window.addEventListener('error', (event) => {
      const interaction: UserInteraction = {
        type: 'navigation', // Classify as navigation error
        target: 'error',
        timestamp: Date.now(),
        duration: 0,
        speed: 0,
        accuracy: 0,
        context: {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        },
        hasError: true
      }
      
      this.recordInteraction(interaction)
    })
  }
  
  // Calculation helpers
  private calculateClickSpeed(event: MouseEvent): number {
    // Calculate based on time since last click
    const lastClick = this.interactions
      .filter(i => i.type === 'click')
      .sort((a, b) => b.timestamp - a.timestamp)[0]
    
    if (!lastClick) return 1
    
    const timeDiff = event.timeStamp - lastClick.timestamp
    return Math.max(0.1, Math.min(2, 1000 / timeDiff)) // Normalize to 0.1-2 range
  }
  
  private calculateClickAccuracy(event: MouseEvent, target: HTMLElement): number {
    const rect = target.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const distance = Math.sqrt(
      Math.pow(event.clientX - centerX, 2) + Math.pow(event.clientY - centerY, 2)
    )
    
    const maxDistance = Math.sqrt(Math.pow(rect.width / 2, 2) + Math.pow(rect.height / 2, 2))
    return Math.max(0, 1 - (distance / maxDistance))
  }
  
  private calculateInputAccuracy(input: HTMLInputElement): number {
    if (!input.value) return 0
    
    // Simple heuristics for input accuracy
    const hasValidFormat = input.checkValidity()
    const hasReasonableLength = input.value.length > 0 && input.value.length < 1000
    const hasNoExcessiveSpaces = !/\s{3,}/.test(input.value)
    
    let accuracy = 0
    if (hasValidFormat) accuracy += 0.5
    if (hasReasonableLength) accuracy += 0.3
    if (hasNoExcessiveSpaces) accuracy += 0.2
    
    return accuracy
  }
  
  private getElementSignature(element: HTMLElement): string {
    const tag = element.tagName.toLowerCase()
    const id = element.id ? `#${element.id}` : ''
    const classes = element.className ? `.${element.className.replace(/\s+/g, '.')}` : ''
    const role = element.getAttribute('role') ? `[role=${element.getAttribute('role')}]` : ''
    
    return `${tag}${id}${classes}${role}`.substring(0, 100) // Limit length
  }
  
  private isInteractiveElement(element: HTMLElement): boolean {
    const interactiveTags = ['button', 'a', 'input', 'select', 'textarea']
    const hasClickHandler = element.onclick !== null
    const hasCursor = getComputedStyle(element).cursor === 'pointer'
    
    return interactiveTags.includes(element.tagName.toLowerCase()) || hasClickHandler || hasCursor
  }
  
  // Public methods
  recordInteraction(interaction: UserInteraction) {
    if (!this.isCollecting) return
    
    this.interactions.push(interaction)
    
    // Limit memory usage
    if (this.interactions.length > this.config.maxInteractionHistory) {
      this.interactions = this.interactions.slice(-Math.floor(this.config.maxInteractionHistory * 0.8))
    }
    
    // Trigger pattern analysis if we have enough data
    if (this.interactions.length % 20 === 0) {
      this.analyzePatterns()
    }
  }
  
  collectBehaviorData(): UserInteraction[] {
    return [...this.interactions] // Return copy
  }
  
  getRecentInteractions(windowMs: number = this.config.temporalWindowSize): UserInteraction[] {
    const cutoff = Date.now() - windowMs
    return this.interactions.filter(i => i.timestamp > cutoff)
  }
  
  identifyPatterns(interactions: UserInteraction[]): BehaviorPattern[] {
    const patterns: BehaviorPattern[] = []
    
    // Pattern 1: Rapid clicking (indicating impatience or urgency)
    const rapidClicks = this.detectRapidClicking(interactions)
    if (rapidClicks.confidence > 0.6) {
      patterns.push(rapidClicks)
    }
    
    // Pattern 2: Repetitive navigation (indicating confusion or search behavior)
    const repetitiveNav = this.detectRepetitiveNavigation(interactions)
    if (repetitiveNav.confidence > 0.6) {
      patterns.push(repetitiveNav)
    }
    
    // Pattern 3: Long hover times (indicating careful consideration)
    const deliberateHover = this.detectDeliberateHover(interactions)
    if (deliberateHover.confidence > 0.6) {
      patterns.push(deliberateHover)
    }
    
    // Pattern 4: Error-prone interactions (indicating UI confusion)
    const errorProne = this.detectErrorProneBehavior(interactions)
    if (errorProne.confidence > 0.6) {
      patterns.push(errorProne)
    }
    
    // Pattern 5: Task-focused behavior (indicating efficiency)
    const taskFocused = this.detectTaskFocusedBehavior(interactions)
    if (taskFocused.confidence > 0.6) {
      patterns.push(taskFocused)
    }
    
    return patterns
  }
  
  private detectRapidClicking(interactions: UserInteraction[]): BehaviorPattern {
    const clicks = interactions.filter(i => i.type === 'click')
    const rapidSequences = []
    
    for (let i = 0; i < clicks.length - 2; i++) {
      const sequence = clicks.slice(i, i + 3)
      const timeSpan = sequence[2].timestamp - sequence[0].timestamp
      
      if (timeSpan < 2000) { // 3 clicks in 2 seconds
        rapidSequences.push(sequence)
      }
    }
    
    const confidence = Math.min(rapidSequences.length / 5, 1) // Max confidence with 5+ sequences
    
    return {
      id: 'rapid-clicking',
      name: 'Rapid Clicking',
      description: 'User demonstrates impatient or urgent clicking behavior',
      confidence,
      frequency: rapidSequences.length,
      recency: rapidSequences.length > 0 ? rapidSequences[rapidSequences.length - 1][2].timestamp : 0,
      triggers: ['stress', 'urgency', 'impatience'],
      preferences: {
        animationSpeed: 'fast',
        responsiveness: 'immediate',
        feedback: 'prominent'
      },
      adaptations: [
        {
          type: 'animation',
          target: 'global-animations',
          modification: { speed: 'fast', feedback: 'immediate' }
        }
      ]
    }
  }
  
  private detectRepetitiveNavigation(interactions: UserInteraction[]): BehaviorPattern {
    const navs = interactions.filter(i => i.type === 'navigation')
    const routes = navs.map(n => n.target)
    const uniqueRoutes = [...new Set(routes)]
    
    let repetitions = 0
    for (const route of uniqueRoutes) {
      const visits = routes.filter(r => r === route).length
      if (visits > 2) repetitions += visits - 2
    }
    
    const confidence = Math.min(repetitions / 10, 1)
    
    return {
      id: 'repetitive-navigation',
      name: 'Repetitive Navigation',
      description: 'User revisits the same pages frequently, suggesting confusion or search behavior',
      confidence,
      frequency: repetitions,
      recency: navs.length > 0 ? navs[navs.length - 1].timestamp : 0,
      triggers: ['confusion', 'search', 'exploration'],
      preferences: {
        navigation: 'clear',
        breadcrumbs: true,
        searchAssistance: true
      },
      adaptations: [
        {
          type: 'navigation',
          target: 'main-nav',
          modification: { showBreadcrumbs: true, highlightCurrent: true }
        }
      ]
    }
  }
  
  private detectDeliberateHover(interactions: UserInteraction[]): BehaviorPattern {
    const hovers = interactions.filter(i => i.type === 'hover')
    const longHovers = hovers.filter(h => h.duration > 1000) // > 1 second
    
    const confidence = longHovers.length / Math.max(hovers.length, 1)
    
    return {
      id: 'deliberate-hover',
      name: 'Deliberate Hover',
      description: 'User takes time to consider options, indicating careful decision-making',
      confidence,
      frequency: longHovers.length,
      recency: longHovers.length > 0 ? longHovers[longHovers.length - 1].timestamp : 0,
      triggers: ['consideration', 'careful', 'thorough'],
      preferences: {
        tooltips: 'detailed',
        previews: true,
        confirmations: true
      },
      adaptations: [
        {
          type: 'content',
          target: 'tooltips',
          modification: { showDetailed: true, delay: 'reduced' }
        }
      ]
    }
  }
  
  private detectErrorProneBehavior(interactions: UserInteraction[]): BehaviorPattern {
    const totalInteractions = interactions.length
    const errorInteractions = interactions.filter(i => i.hasError)
    const errorRate = errorInteractions.length / Math.max(totalInteractions, 1)
    
    const confidence = Math.min(errorRate * 2, 1) // Max confidence at 50% error rate
    
    return {
      id: 'error-prone',
      name: 'Error Prone',
      description: 'User encounters frequent errors, suggesting UI confusion or complexity',
      confidence,
      frequency: errorInteractions.length,
      recency: errorInteractions.length > 0 ? errorInteractions[errorInteractions.length - 1].timestamp : 0,
      triggers: ['confusion', 'complexity', 'frustration'],
      preferences: {
        simplification: true,
        guidance: 'increased',
        validation: 'real-time'
      },
      adaptations: [
        {
          type: 'layout',
          target: 'forms',
          modification: { simplify: true, showHelp: true, realTimeValidation: true }
        }
      ]
    }
  }
  
  private detectTaskFocusedBehavior(interactions: UserInteraction[]): BehaviorPattern {
    const navs = interactions.filter(i => i.type === 'navigation')
    const avgSessionTime = navs.length > 1 
      ? (navs[navs.length - 1].timestamp - navs[0].timestamp) / navs.length
      : 0
    
    const directNavigation = navs.length > 0 && navs.length < 5 // Few navigation changes
    const longSessions = avgSessionTime > 60000 // > 1 minute per page
    const lowErrorRate = interactions.filter(i => i.hasError).length / Math.max(interactions.length, 1) < 0.1
    
    let confidence = 0
    if (directNavigation) confidence += 0.4
    if (longSessions) confidence += 0.3
    if (lowErrorRate) confidence += 0.3
    
    return {
      id: 'task-focused',
      name: 'Task Focused',
      description: 'User demonstrates efficient, goal-oriented behavior',
      confidence,
      frequency: navs.length,
      recency: navs.length > 0 ? navs[navs.length - 1].timestamp : 0,
      triggers: ['efficiency', 'expertise', 'goal-oriented'],
      preferences: {
        shortcuts: true,
        advanced: true,
        minimal: true
      },
      adaptations: [
        {
          type: 'layout',
          target: 'interface',
          modification: { showAdvanced: true, enableShortcuts: true }
        }
      ]
    }
  }
  
  private analyzePatterns() {
    const recentInteractions = this.getRecentInteractions()
    const newPatterns = this.identifyPatterns(recentInteractions)
    
    newPatterns.forEach(pattern => {
      this.patterns.set(pattern.id, pattern)
    })
    
    // Decay confidence of old patterns
    this.patterns.forEach(pattern => {
      const age = Date.now() - pattern.recency
      const decayFactor = Math.exp(-age / (24 * 60 * 60 * 1000)) // 24 hour decay
      pattern.confidence *= decayFactor
      
      // Remove patterns with very low confidence
      if (pattern.confidence < 0.1) {
        this.patterns.delete(pattern.id)
      }
    })
  }
  
  getBehaviorMetrics(): BehaviorMetrics {
    const recent = this.getRecentInteractions()
    const totalInteractions = recent.length
    
    if (totalInteractions === 0) {
      return {
        totalInteractions: 0,
        averageSessionDuration: 0,
        mostUsedFeatures: [],
        errorRate: 0,
        preferredInteractionStyle: 'deliberate',
        taskSuccessRate: 1,
        navigationEfficiency: 1
      }
    }
    
    const errorRate = recent.filter(i => i.hasError).length / totalInteractions
    const avgSpeed = recent.reduce((sum, i) => sum + i.speed, 0) / totalInteractions
    
    let preferredStyle: 'fast' | 'deliberate' | 'exploratory' = 'deliberate'
    if (avgSpeed > 1.5) preferredStyle = 'fast'
    else if (this.patterns.has('repetitive-navigation')) preferredStyle = 'exploratory'
    
    const navs = recent.filter(i => i.type === 'navigation')
    const navigationEfficiency = navs.length > 0 ? 1 / navs.length : 1
    
    return {
      totalInteractions,
      averageSessionDuration: Date.now() - this.sessionStart,
      mostUsedFeatures: this.getMostUsedFeatures(recent),
      errorRate,
      preferredInteractionStyle: preferredStyle,
      taskSuccessRate: 1 - errorRate,
      navigationEfficiency
    }
  }
  
  private getMostUsedFeatures(interactions: UserInteraction[]): string[] {
    const featureCounts = new Map<string, number>()
    
    interactions.forEach(interaction => {
      const feature = interaction.target.split('.')[0] // Get base element
      featureCounts.set(feature, (featureCounts.get(feature) || 0) + 1)
    })
    
    return Array.from(featureCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0])
  }
  
  destroy() {
    this.isCollecting = false
    
    // Remove all listeners
    this.listeners.forEach((listener, event) => {
      if (event === 'scroll') {
        window.removeEventListener(event, listener)
      } else {
        document.removeEventListener(event, listener)
      }
    })
    
    this.listeners.clear()
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
    
    console.log('🧠 Behavior Engine destroyed')
  }
}

// Singleton instance
let behaviorEngineInstance: BehaviorEngine | null = null

export function getBehaviorEngine(): BehaviorEngine {
  if (!behaviorEngineInstance) {
    behaviorEngineInstance = new BehaviorEngine()
  }
  return behaviorEngineInstance
}

export type { UserInteraction, BehaviorPattern, BehaviorMetrics }