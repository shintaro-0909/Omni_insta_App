import { ref, onMounted, onUnmounted, Ref } from 'vue'
import { GestureRecognizer, GestureType, GestureEvent } from '@/utils/gestureRecognition'

export interface AdvancedGestureOptions {
  element?: Ref<HTMLElement | null>
  enableMultiTouch?: boolean
  enableInertia?: boolean
  enableHaptics?: boolean
  sensitivity?: number
}

export function useAdvancedGestures(options: AdvancedGestureOptions = {}) {
  const {
    element,
    enableMultiTouch = true,
    enableInertia = true,
    enableHaptics = true,
    sensitivity = 1
  } = options

  const isGesturing = ref(false)
  const currentGesture = ref<GestureType | null>(null)
  const gestureVelocity = ref({ x: 0, y: 0, z: 0 })
  const gestureProgress = ref(0)
  const touchPoints = ref<TouchList | null>(null)
  
  let recognizer: GestureRecognizer | null = null
  let inertiaAnimation: number | null = null
  let lastTimestamp = 0
  let velocityHistory: Array<{ x: number; y: number; z: number; time: number }> = []

  const startGesture = (type: GestureType, event: GestureEvent) => {
    isGesturing.value = true
    currentGesture.value = type
    gestureProgress.value = 0
    velocityHistory = []
    lastTimestamp = event.timestamp
    
    if (enableHaptics && 'vibrate' in navigator) {
      navigator.vibrate(10)
    }
  }

  const updateGesture = (event: GestureEvent) => {
    if (!isGesturing.value) return

    const deltaTime = event.timestamp - lastTimestamp
    if (deltaTime > 0) {
      const velocity = {
        x: (event.deltaX / deltaTime) * 1000 * sensitivity,
        y: (event.deltaY / deltaTime) * 1000 * sensitivity,
        z: (event.deltaZ || 0 / deltaTime) * 1000 * sensitivity,
        time: event.timestamp
      }
      
      velocityHistory.push(velocity)
      if (velocityHistory.length > 5) {
        velocityHistory.shift()
      }
      
      // Calculate smoothed velocity
      const smoothedVelocity = velocityHistory.reduce(
        (acc, v) => ({
          x: acc.x + v.x / velocityHistory.length,
          y: acc.y + v.y / velocityHistory.length,
          z: acc.z + v.z / velocityHistory.length
        }),
        { x: 0, y: 0, z: 0 }
      )
      
      gestureVelocity.value = smoothedVelocity
    }
    
    gestureProgress.value = Math.min(1, gestureProgress.value + event.progress)
    lastTimestamp = event.timestamp
  }

  const endGesture = () => {
    if (!isGesturing.value) return
    
    if (enableInertia && velocityHistory.length > 0) {
      applyInertia()
    } else {
      completeGesture()
    }
  }

  const applyInertia = () => {
    const friction = 0.95
    const minVelocity = 0.1
    
    const animate = () => {
      gestureVelocity.value = {
        x: gestureVelocity.value.x * friction,
        y: gestureVelocity.value.y * friction,
        z: gestureVelocity.value.z * friction
      }
      
      const totalVelocity = Math.sqrt(
        gestureVelocity.value.x ** 2 +
        gestureVelocity.value.y ** 2 +
        gestureVelocity.value.z ** 2
      )
      
      if (totalVelocity > minVelocity) {
        inertiaAnimation = requestAnimationFrame(animate)
      } else {
        completeGesture()
      }
    }
    
    inertiaAnimation = requestAnimationFrame(animate)
  }

  const completeGesture = () => {
    isGesturing.value = false
    currentGesture.value = null
    gestureProgress.value = 0
    gestureVelocity.value = { x: 0, y: 0, z: 0 }
    
    if (inertiaAnimation) {
      cancelAnimationFrame(inertiaAnimation)
      inertiaAnimation = null
    }
  }

  const cancelGesture = () => {
    completeGesture()
  }

  onMounted(() => {
    const targetElement = element?.value || document.body
    recognizer = new GestureRecognizer(targetElement, {
      enableMultiTouch,
      onGestureStart: startGesture,
      onGestureUpdate: updateGesture,
      onGestureEnd: endGesture,
      onGestureCancel: cancelGesture
    })
  })

  onUnmounted(() => {
    recognizer?.destroy()
    if (inertiaAnimation) {
      cancelAnimationFrame(inertiaAnimation)
    }
  })

  return {
    isGesturing,
    currentGesture,
    gestureVelocity,
    gestureProgress,
    touchPoints,
    cancelGesture
  }
}