import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMotion, spring, animate } from '@vueuse/motion'

export interface AnimationContext {
  devicePerformance: 'low' | 'medium' | 'high'
  userPreference: 'reduced' | 'normal' | 'enhanced'
  systemLoad: number
  batteryLevel: number | null
  networkLatency: number
}

export interface IntelligentAnimation {
  duration: number
  easing: string
  delay: number
  stagger: number
  springConfig?: {
    stiffness: number
    damping: number
    mass: number
  }
}

export function useIntelligentAnimations() {
  // Context awareness
  const context = ref<AnimationContext>({
    devicePerformance: 'high',
    userPreference: 'normal',
    systemLoad: 0,
    batteryLevel: null,
    networkLatency: 0
  })
  
  // Animation state
  const isAnimating = ref(false)
  const animationQueue = ref<Array<() => void>>([])
  const activeAnimations = ref(new Set<string>())
  const frameRate = ref(60)
  const lastFrameTime = ref(0)
  
  // Emotion-based animation presets
  const emotionPresets = {
    excited: {
      duration: 300,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      springConfig: { stiffness: 300, damping: 10, mass: 1 }
    },
    calm: {
      duration: 800,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      springConfig: { stiffness: 100, damping: 20, mass: 1.5 }
    },
    urgent: {
      duration: 200,
      easing: 'cubic-bezier(0.4, 0, 1, 1)',
      springConfig: { stiffness: 400, damping: 15, mass: 0.8 }
    },
    playful: {
      duration: 500,
      easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      springConfig: { stiffness: 200, damping: 12, mass: 1.2 }
    },
    elegant: {
      duration: 600,
      easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
      springConfig: { stiffness: 150, damping: 25, mass: 2 }
    }
  }
  
  // Performance monitoring
  const measurePerformance = () => {
    let frameCount = 0
    let lastTime = performance.now()
    
    const measure = () => {
      frameCount++
      const currentTime = performance.now()
      
      if (currentTime - lastTime >= 1000) {
        frameRate.value = frameCount
        frameCount = 0
        lastTime = currentTime
        
        // Update device performance based on frame rate
        if (frameRate.value < 30) {
          context.value.devicePerformance = 'low'
        } else if (frameRate.value < 50) {
          context.value.devicePerformance = 'medium'
        } else {
          context.value.devicePerformance = 'high'
        }
      }
      
      if (activeAnimations.value.size > 0) {
        requestAnimationFrame(measure)
      }
    }
    
    requestAnimationFrame(measure)
  }
  
  // Adaptive animation configuration
  const getAdaptiveAnimation = (baseAnimation: IntelligentAnimation): IntelligentAnimation => {
    const { devicePerformance, userPreference, systemLoad, batteryLevel } = context.value
    
    let animation = { ...baseAnimation }
    
    // Adjust for device performance
    if (devicePerformance === 'low') {
      animation.duration *= 0.5
      animation.delay = 0
      animation.stagger *= 0.5
    } else if (devicePerformance === 'medium') {
      animation.duration *= 0.75
    }
    
    // Adjust for user preference
    if (userPreference === 'reduced') {
      animation.duration = 0
      animation.delay = 0
      animation.stagger = 0
    } else if (userPreference === 'enhanced') {
      animation.duration *= 1.2
      animation.stagger *= 1.5
    }
    
    // Adjust for system load
    if (systemLoad > 0.8) {
      animation.duration *= 0.6
    }
    
    // Adjust for battery level
    if (batteryLevel !== null && batteryLevel < 20) {
      animation.duration *= 0.5
      animation.delay = 0
    }
    
    return animation
  }
  
  // Emotion-aware animation
  const animateWithEmotion = (
    element: HTMLElement,
    emotion: keyof typeof emotionPresets,
    properties: Record<string, any>
  ) => {
    const preset = emotionPresets[emotion]
    const adaptive = getAdaptiveAnimation(preset)
    
    const animationId = `${element.id || 'element'}-${Date.now()}`
    activeAnimations.value.add(animationId)
    
    if (adaptive.duration === 0) {
      // Instant change for reduced motion
      Object.assign(element.style, properties)
      activeAnimations.value.delete(animationId)
      return Promise.resolve()
    }
    
    // Use spring physics for organic motion
    if (adaptive.springConfig) {
      return spring(element, properties, adaptive.springConfig).then(() => {
        activeAnimations.value.delete(animationId)
      })
    }
    
    // Fallback to regular animation
    return animate(element, properties, {
      duration: adaptive.duration,
      easing: adaptive.easing
    }).then(() => {
      activeAnimations.value.delete(animationId)
    })
  }
  
  // Orchestrated animations
  const orchestrate = async (
    animations: Array<{
      element: HTMLElement
      properties: Record<string, any>
      emotion?: keyof typeof emotionPresets
      delay?: number
    }>
  ) => {
    isAnimating.value = true
    measurePerformance()
    
    const promises = animations.map((anim, index) => {
      const emotion = anim.emotion || 'calm'
      const preset = emotionPresets[emotion]
      const adaptive = getAdaptiveAnimation({
        ...preset,
        delay: (anim.delay || 0) + (index * (preset.stagger || 50))
      })
      
      return new Promise(resolve => {
        setTimeout(() => {
          animateWithEmotion(anim.element, emotion, anim.properties)
            .then(resolve)
        }, adaptive.delay)
      })
    })
    
    await Promise.all(promises)
    isAnimating.value = false
  }
  
  // Intelligent stagger
  const staggerAnimation = (
    elements: HTMLElement[],
    properties: Record<string, any>,
    options: {
      emotion?: keyof typeof emotionPresets
      staggerFrom?: 'start' | 'end' | 'center' | 'random'
      staggerEach?: number
    } = {}
  ) => {
    const { emotion = 'calm', staggerFrom = 'start', staggerEach } = options
    const preset = emotionPresets[emotion]
    const adaptive = getAdaptiveAnimation(preset)
    
    let orderedElements = [...elements]
    
    // Apply stagger order
    switch (staggerFrom) {
      case 'end':
        orderedElements.reverse()
        break
      case 'center':
        const center = Math.floor(elements.length / 2)
        orderedElements = elements.sort((a, b) => {
          const aIndex = elements.indexOf(a)
          const bIndex = elements.indexOf(b)
          return Math.abs(aIndex - center) - Math.abs(bIndex - center)
        })
        break
      case 'random':
        orderedElements = elements.sort(() => Math.random() - 0.5)
        break
    }
    
    const staggerDelay = staggerEach || adaptive.stagger || 50
    
    return orchestrate(
      orderedElements.map((element, index) => ({
        element,
        properties,
        emotion,
        delay: index * staggerDelay
      }))
    )
  }
  
  // Morph between states
  const morphTransition = async (
    element: HTMLElement,
    fromState: Record<string, any>,
    toState: Record<string, any>,
    emotion: keyof typeof emotionPresets = 'elegant'
  ) => {
    // Capture current state
    const currentState: Record<string, any> = {}
    Object.keys(fromState).forEach(key => {
      currentState[key] = element.style[key as any]
    })
    
    // Apply from state instantly
    Object.assign(element.style, fromState)
    
    // Animate to final state
    return animateWithEmotion(element, emotion, toState)
  }
  
  // Context updates
  const updateUserPreference = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    context.value.userPreference = prefersReducedMotion ? 'reduced' : 'normal'
  }
  
  const updateBatteryLevel = async () => {
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery()
        context.value.batteryLevel = battery.level * 100
        
        battery.addEventListener('levelchange', () => {
          context.value.batteryLevel = battery.level * 100
        })
      } catch (error) {
        console.error('Battery API not available:', error)
      }
    }
  }
  
  const updateSystemLoad = () => {
    // Estimate system load based on active animations and frame rate
    const animationLoad = activeAnimations.value.size / 10
    const frameLoad = 1 - (frameRate.value / 60)
    context.value.systemLoad = Math.min(1, (animationLoad + frameLoad) / 2)
  }
  
  // Lifecycle
  onMounted(() => {
    updateUserPreference()
    updateBatteryLevel()
    
    // Listen for preference changes
    window.matchMedia('(prefers-reduced-motion: reduce)')
      .addEventListener('change', updateUserPreference)
    
    // Monitor system load
    setInterval(updateSystemLoad, 1000)
  })
  
  onUnmounted(() => {
    activeAnimations.value.clear()
  })
  
  return {
    // State
    context,
    isAnimating,
    frameRate,
    activeAnimations,
    
    // Methods
    animateWithEmotion,
    orchestrate,
    staggerAnimation,
    morphTransition,
    getAdaptiveAnimation,
    
    // Presets
    emotionPresets
  }
}