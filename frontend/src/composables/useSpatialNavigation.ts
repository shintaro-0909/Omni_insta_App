import { ref, computed, onMounted, onUnmounted } from 'vue'
import { mat4, vec3, quat } from '@/utils/spatialMath'

export interface SpatialNavigationOptions {
  containerElement?: HTMLElement
  perspective?: number
  transitionDuration?: number
  enableDepthBlur?: boolean
  enableParallax?: boolean
  maxDepth?: number
}

export interface SpatialPosition {
  x: number
  y: number
  z: number
  rotationX: number
  rotationY: number
  rotationZ: number
  scale: number
}

export function useSpatialNavigation(options: SpatialNavigationOptions = {}) {
  const {
    containerElement,
    perspective = 1000,
    transitionDuration = 600,
    enableDepthBlur = true,
    enableParallax = true,
    maxDepth = 5000
  } = options

  // Current spatial state
  const currentPosition = ref<SpatialPosition>({
    x: 0, y: 0, z: 0,
    rotationX: 0, rotationY: 0, rotationZ: 0,
    scale: 1
  })

  const targetPosition = ref<SpatialPosition>({
    x: 0, y: 0, z: 0,
    rotationX: 0, rotationY: 0, rotationZ: 0,
    scale: 1
  })

  const isTransitioning = ref(false)
  const navigationHistory = ref<SpatialPosition[]>([])
  const spatialLayers = ref<Map<string, SpatialPosition>>(new Map())

  // Computed properties
  const transformMatrix = computed(() => {
    const pos = currentPosition.value
    const transform = mat4.create()
    
    // Apply transformations in correct order
    mat4.translate(transform, transform, [pos.x, pos.y, pos.z])
    mat4.rotateX(transform, transform, pos.rotationX * Math.PI / 180)
    mat4.rotateY(transform, transform, pos.rotationY * Math.PI / 180)
    mat4.rotateZ(transform, transform, pos.rotationZ * Math.PI / 180)
    mat4.scale(transform, transform, [pos.scale, pos.scale, pos.scale])
    
    return transform
  })

  const depthOfField = computed(() => {
    if (!enableDepthBlur) return { near: 0, far: maxDepth }
    
    const focusDistance = Math.abs(currentPosition.value.z)
    return {
      near: Math.max(0, focusDistance - 200),
      far: Math.min(maxDepth, focusDistance + 500)
    }
  })

  const parallaxOffset = computed(() => {
    if (!enableParallax) return { x: 0, y: 0 }
    
    return {
      x: currentPosition.value.x * 0.1,
      y: currentPosition.value.y * 0.1
    }
  })

  // Navigation methods
  const navigateTo = (position: Partial<SpatialPosition>, options: {
    duration?: number
    easing?: string
    preserveHistory?: boolean
  } = {}) => {
    const {
      duration = transitionDuration,
      easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
      preserveHistory = true
    } = options

    if (preserveHistory) {
      navigationHistory.value.push({ ...currentPosition.value })
      if (navigationHistory.value.length > 20) {
        navigationHistory.value.shift()
      }
    }

    targetPosition.value = {
      ...targetPosition.value,
      ...position
    }

    isTransitioning.value = true
    animateTransition(duration, easing)
  }

  const navigateToLayer = (layerId: string, options = {}) => {
    const layerPosition = spatialLayers.value.get(layerId)
    if (layerPosition) {
      navigateTo(layerPosition, options)
    }
  }

  const navigateBack = () => {
    if (navigationHistory.value.length > 0) {
      const previousPosition = navigationHistory.value.pop()
      if (previousPosition) {
        navigateTo(previousPosition, { preserveHistory: false })
      }
    }
  }

  const zoom = (factor: number, center?: { x: number; y: number }) => {
    const newScale = currentPosition.value.scale * factor
    const clampedScale = Math.max(0.1, Math.min(10, newScale))
    
    const position: Partial<SpatialPosition> = { scale: clampedScale }
    
    if (center) {
      // Zoom towards specific point
      const scaleDiff = clampedScale - currentPosition.value.scale
      position.x = currentPosition.value.x - (center.x * scaleDiff)
      position.y = currentPosition.value.y - (center.y * scaleDiff)
    }
    
    navigateTo(position, { duration: 200 })
  }

  const pan = (deltaX: number, deltaY: number) => {
    navigateTo({
      x: currentPosition.value.x + deltaX,
      y: currentPosition.value.y + deltaY
    }, { duration: 0 })
  }

  const rotate = (deltaX: number, deltaY: number, deltaZ: number = 0) => {
    navigateTo({
      rotationX: currentPosition.value.rotationX + deltaX,
      rotationY: currentPosition.value.rotationY + deltaY,
      rotationZ: currentPosition.value.rotationZ + deltaZ
    }, { duration: 300 })
  }

  const animateTransition = (duration: number, easing: string) => {
    const startTime = performance.now()
    const startPos = { ...currentPosition.value }
    const endPos = { ...targetPosition.value }
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Apply easing
      const easedProgress = applyEasing(progress, easing)
      
      // Interpolate position
      Object.keys(startPos).forEach(key => {
        const k = key as keyof SpatialPosition
        currentPosition.value[k] = startPos[k] + (endPos[k] - startPos[k]) * easedProgress
      })
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        isTransitioning.value = false
      }
    }
    
    requestAnimationFrame(animate)
  }

  const applyEasing = (t: number, easing: string): number => {
    // Simple cubic easing implementation
    if (easing.includes('cubic-bezier')) {
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
    }
    return t
  }

  // Layer management
  const registerLayer = (id: string, position: SpatialPosition) => {
    spatialLayers.value.set(id, position)
  }

  const unregisterLayer = (id: string) => {
    spatialLayers.value.delete(id)
  }

  // Lifecycle
  onMounted(() => {
    if (containerElement) {
      containerElement.style.perspective = `${perspective}px`
      containerElement.style.perspectiveOrigin = '50% 50%'
    }
  })

  onUnmounted(() => {
    navigationHistory.value = []
    spatialLayers.value.clear()
  })

  return {
    currentPosition,
    targetPosition,
    isTransitioning,
    transformMatrix,
    depthOfField,
    parallaxOffset,
    navigateTo,
    navigateToLayer,
    navigateBack,
    zoom,
    pan,
    rotate,
    registerLayer,
    unregisterLayer
  }
}