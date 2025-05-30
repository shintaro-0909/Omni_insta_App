import { useAdvancedGestures } from '@/composables/useAdvancedGestures'
import { useSpatialNavigation } from '@/composables/useSpatialNavigation'
import { usePredictiveUI } from '@/composables/usePredictiveUI'
import { useAdaptiveLayout } from '@/composables/useAdaptiveLayout'
import { useIntelligentAnimations } from '@/composables/useIntelligentAnimations'
import { useAIAdaptation } from '@/composables/useAIAdaptation'
import { GestureEvent, GestureType } from './gestureRecognition'
import { smoothDamp } from './spatialMath'
import { getBehaviorEngine } from './behaviorEngine'
import { getAdaptationEngine } from './adaptationEngine'
import { getContextAnalyzer } from './contextAnalyzer'

export interface InteractionEngineOptions {
  enableSpatialNavigation?: boolean
  enablePredictiveUI?: boolean
  enableAdaptiveLayout?: boolean
  enableIntelligentAnimations?: boolean
  enableAIAdaptation?: boolean
  enableHapticFeedback?: boolean
  enableCrossSystemLearning?: boolean
  debugMode?: boolean
}

export class InteractionEngine {
  private options: InteractionEngineOptions
  private gesturesInstance: ReturnType<typeof useAdvancedGestures> | null = null
  private spatialNavInstance: ReturnType<typeof useSpatialNavigation> | null = null
  private predictiveUIInstance: ReturnType<typeof usePredictiveUI> | null = null
  private adaptiveLayoutInstance: ReturnType<typeof useAdaptiveLayout> | null = null
  private animationsInstance: ReturnType<typeof useIntelligentAnimations> | null = null
  private aiAdaptationInstance: ReturnType<typeof useAIAdaptation> | null = null
  
  // AI Engine instances
  private behaviorEngine = getBehaviorEngine()
  private adaptationEngine = getAdaptationEngine()
  private contextAnalyzer = getContextAnalyzer()
  
  private interactionHistory: Array<{
    type: string
    timestamp: number
    data: any
  }> = []
  
  private gestureHandlers = new Map<GestureType, (event: GestureEvent) => void>()
  private contextualActions = new Map<string, () => void>()
  
  constructor(options: InteractionEngineOptions = {}) {
    this.options = {
      enableSpatialNavigation: true,
      enablePredictiveUI: true,
      enableAdaptiveLayout: true,
      enableIntelligentAnimations: true,
      enableHapticFeedback: true,
      debugMode: false,
      ...options
    }
    
    this.initialize()
  }
  
  private initialize() {
    // Setup default gesture handlers
    this.setupDefaultGestureHandlers()
    
    // Initialize debug mode if enabled
    if (this.options.debugMode) {
      this.initializeDebugMode()
    }
  }
  
  private setupDefaultGestureHandlers() {
    // Spatial navigation gestures
    this.gestureHandlers.set('swipe-left', (event) => {
      if (this.spatialNavInstance && this.options.enableSpatialNavigation) {
        this.spatialNavInstance.pan(-event.distance, 0)
        this.provideHapticFeedback('light')
      }
    })
    
    this.gestureHandlers.set('swipe-right', (event) => {
      if (this.spatialNavInstance && this.options.enableSpatialNavigation) {
        this.spatialNavInstance.pan(event.distance, 0)
        this.provideHapticFeedback('light')
      }
    })
    
    this.gestureHandlers.set('swipe-up', (event) => {
      if (this.spatialNavInstance && this.options.enableSpatialNavigation) {
        this.spatialNavInstance.pan(0, -event.distance)
        this.provideHapticFeedback('light')
      }
    })
    
    this.gestureHandlers.set('swipe-down', (event) => {
      if (this.spatialNavInstance && this.options.enableSpatialNavigation) {
        this.spatialNavInstance.pan(0, event.distance)
        this.provideHapticFeedback('light')
      }
    })
    
    this.gestureHandlers.set('pinch-in', (event) => {
      if (this.spatialNavInstance && this.options.enableSpatialNavigation) {
        this.spatialNavInstance.zoom(0.9)
        this.provideHapticFeedback('light')
      }
    })
    
    this.gestureHandlers.set('pinch-out', (event) => {
      if (this.spatialNavInstance && this.options.enableSpatialNavigation) {
        this.spatialNavInstance.zoom(1.1)
        this.provideHapticFeedback('light')
      }
    })
    
    this.gestureHandlers.set('rotate', (event) => {
      if (this.spatialNavInstance && this.options.enableSpatialNavigation) {
        this.spatialNavInstance.rotate(0, 0, event.rotation)
      }
    })
    
    this.gestureHandlers.set('longpress', (event) => {
      this.showContextMenu(event)
      this.provideHapticFeedback('medium')
    })
    
    this.gestureHandlers.set('doubletap', (event) => {
      this.executeSmartAction(event)
      this.provideHapticFeedback('success')
    })
    
    this.gestureHandlers.set('edge-swipe', (event) => {
      this.handleEdgeSwipe(event)
      this.provideHapticFeedback('heavy')
    })
  }
  
  // Connect to Vue composables
  public connectToVue(vueContext: {
    gestures?: ReturnType<typeof useAdvancedGestures>
    spatial?: ReturnType<typeof useSpatialNavigation>
    predictive?: ReturnType<typeof usePredictiveUI>
    adaptive?: ReturnType<typeof useAdaptiveLayout>
    animations?: ReturnType<typeof useIntelligentAnimations>
  }) {
    if (vueContext.gestures) {
      this.gesturesInstance = vueContext.gestures
      this.setupGestureListeners()
    }
    
    if (vueContext.spatial && this.options.enableSpatialNavigation) {
      this.spatialNavInstance = vueContext.spatial
    }
    
    if (vueContext.predictive && this.options.enablePredictiveUI) {
      this.predictiveUIInstance = vueContext.predictive
    }
    
    if (vueContext.adaptive && this.options.enableAdaptiveLayout) {
      this.adaptiveLayoutInstance = vueContext.adaptive
    }
    
    if (vueContext.animations && this.options.enableIntelligentAnimations) {
      this.animationsInstance = vueContext.animations
    }
  }
  
  private setupGestureListeners() {
    // This would be connected to the gesture recognizer
    // For now, we'll use a placeholder
  }
  
  // Gesture handling
  public handleGesture(type: GestureType, event: GestureEvent) {
    // Record interaction
    this.recordInteraction('gesture', { type, event })
    
    // Execute handler
    const handler = this.gestureHandlers.get(type)
    if (handler) {
      handler(event)
    }
    
    // Update predictive UI
    if (this.predictiveUIInstance) {
      this.predictiveUIInstance.trackAction(`gesture-${type}`)
    }
  }
  
  // Context menu
  private showContextMenu(event: GestureEvent) {
    const actions = this.getContextualActions(event)
    
    if (this.animationsInstance && actions.length > 0) {
      // Animate context menu appearance
      this.animationsInstance.animateWithEmotion(
        document.createElement('div'), // Placeholder
        'elegant',
        {
          opacity: 1,
          scale: 1,
          transform: `translate(${event.touches[0]?.x || 0}px, ${event.touches[0]?.y || 0}px)`
        }
      )
    }
  }
  
  private getContextualActions(event: GestureEvent): Array<{ label: string; action: () => void }> {
    const actions = []
    
    // Get predicted actions
    if (this.predictiveUIInstance) {
      const predictions = this.predictiveUIInstance.predictedActions.value
      predictions.slice(0, 3).forEach(prediction => {
        actions.push({
          label: prediction.id,
          action: () => {
            if (prediction.action) prediction.action()
            else if (prediction.route) {
              // Navigate to route
            }
          }
        })
      })
    }
    
    return actions
  }
  
  // Smart actions
  private executeSmartAction(event: GestureEvent) {
    if (this.predictiveUIInstance) {
      const topPrediction = this.predictiveUIInstance.topPrediction.value
      if (topPrediction) {
        if (topPrediction.action) {
          topPrediction.action()
        } else if (topPrediction.route) {
          // Navigate to predicted route
        }
      }
    }
  }
  
  // Edge swipe handling
  private handleEdgeSwipe(event: GestureEvent) {
    const edge = this.detectEdge(event)
    
    switch (edge) {
      case 'left':
        // Navigate back
        if (this.spatialNavInstance) {
          this.spatialNavInstance.navigateBack()
        }
        break
      case 'right':
        // Show quick actions
        break
      case 'top':
        // Show notifications
        break
      case 'bottom':
        // Show navigation
        break
    }
  }
  
  private detectEdge(event: GestureEvent): 'left' | 'right' | 'top' | 'bottom' | null {
    const touch = event.touches[0]
    if (!touch) return null
    
    const threshold = 20
    const { innerWidth, innerHeight } = window
    
    if (touch.x < threshold) return 'left'
    if (touch.x > innerWidth - threshold) return 'right'
    if (touch.y < threshold) return 'top'
    if (touch.y > innerHeight - threshold) return 'bottom'
    
    return null
  }
  
  // Haptic feedback
  private provideHapticFeedback(intensity: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') {
    if (!this.options.enableHapticFeedback || !('vibrate' in navigator)) return
    
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
      success: [10, 50, 10],
      warning: [30, 10, 30],
      error: [50, 10, 50, 10, 50]
    }
    
    navigator.vibrate(patterns[intensity] || patterns.light)
  }
  
  // Interaction recording
  private recordInteraction(type: string, data: any) {
    this.interactionHistory.push({
      type,
      timestamp: Date.now(),
      data
    })
    
    // Keep history limited
    if (this.interactionHistory.length > 100) {
      this.interactionHistory.shift()
    }
    
    if (this.options.debugMode) {
      console.log('[InteractionEngine]', type, data)
    }
  }
  
  // Debug mode
  private initializeDebugMode() {
    // Create debug overlay
    const overlay = document.createElement('div')
    overlay.id = 'interaction-debug-overlay'
    overlay.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px;
      font-family: monospace;
      font-size: 12px;
      z-index: 99999;
      max-width: 300px;
      max-height: 400px;
      overflow-y: auto;
    `
    document.body.appendChild(overlay)
    
    // Update debug info
    setInterval(() => {
      const info = this.getDebugInfo()
      overlay.innerHTML = `
        <h4>Interaction Debug</h4>
        <div>FPS: ${info.fps}</div>
        <div>Active Animations: ${info.activeAnimations}</div>
        <div>Gesture: ${info.currentGesture || 'none'}</div>
        <div>Predicted Action: ${info.predictedAction || 'none'}</div>
        <div>Layout Mode: ${info.layoutMode}</div>
        <div>Recent Interactions:</div>
        <ul style="margin: 5px 0; padding-left: 20px;">
          ${info.recentInteractions.map(i => `<li>${i}</li>`).join('')}
        </ul>
      `
    }, 100)
  }
  
  private getDebugInfo() {
    return {
      fps: this.animationsInstance?.frameRate.value || 0,
      activeAnimations: this.animationsInstance?.activeAnimations.value.size || 0,
      currentGesture: this.gesturesInstance?.currentGesture.value,
      predictedAction: this.predictiveUIInstance?.topPrediction.value?.id,
      layoutMode: this.adaptiveLayoutInstance?.layoutMode.value,
      recentInteractions: this.interactionHistory.slice(-5).map(i => `${i.type} (${new Date(i.timestamp).toLocaleTimeString()})`)
    }
  }
  
  // Public API
  public registerGestureHandler(type: GestureType, handler: (event: GestureEvent) => void) {
    this.gestureHandlers.set(type, handler)
  }
  
  public registerContextualAction(id: string, action: () => void) {
    this.contextualActions.set(id, action)
  }
  
  public triggerHaptic(intensity: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') {
    this.provideHapticFeedback(intensity)
  }
  
  public getInteractionHistory() {
    return [...this.interactionHistory]
  }
  
  public destroy() {
    // Clean up debug overlay
    const overlay = document.getElementById('interaction-debug-overlay')
    if (overlay) {
      overlay.remove()
    }
    
    // Clear handlers
    this.gestureHandlers.clear()
    this.contextualActions.clear()
    this.interactionHistory = []
  }
}

// Singleton instance
let engineInstance: InteractionEngine | null = null

export function getInteractionEngine(options?: InteractionEngineOptions): InteractionEngine {
  if (!engineInstance) {
    engineInstance = new InteractionEngine(options)
  }
  return engineInstance
}

export function destroyInteractionEngine() {
  if (engineInstance) {
    engineInstance.destroy()
    engineInstance = null
  }
}