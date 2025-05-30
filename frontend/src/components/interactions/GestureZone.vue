<template>
  <div
    ref="zoneRef"
    class="gesture-zone"
    :class="zoneClasses"
    :style="zoneStyles"
    @touchstart.prevent="handleStart"
    @mousedown="handleStart"
  >
    <!-- Gesture feedback visualization -->
    <transition name="gesture-feedback">
      <div
        v-if="showFeedback && currentGesture"
        class="gesture-feedback"
        :style="feedbackStyles"
      >
        <div class="gesture-icon">
          <v-icon :color="feedbackColor">{{ gestureIcon }}</v-icon>
        </div>
        <div class="gesture-label">{{ gestureLabel }}</div>
      </div>
    </transition>
    
    <!-- Touch points visualization -->
    <div
      v-for="(point, index) in touchPoints"
      :key="`touch-${index}`"
      class="touch-point"
      :style="getTouchPointStyle(point)"
    >
      <div class="touch-ripple" />
    </div>
    
    <!-- Gesture trail -->
    <svg
      v-if="showTrail && gestureTrail.length > 1"
      class="gesture-trail"
      :viewBox="`0 0 ${zoneWidth} ${zoneHeight}`"
    >
      <path
        :d="trailPath"
        fill="none"
        :stroke="trailColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
        :opacity="trailOpacity"
      />
    </svg>
    
    <!-- Content slot -->
    <div class="gesture-content">
      <slot />
    </div>
    
    <!-- Debug overlay -->
    <div v-if="debug" class="gesture-debug">
      <div>Gesture: {{ currentGesture || 'none' }}</div>
      <div>Velocity: {{ Math.round(velocity.magnitude) }}px/s</div>
      <div>Distance: {{ Math.round(totalDistance) }}px</div>
      <div>Touches: {{ touchPoints.length }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useTheme } from 'vuetify'
import { GestureRecognizer, GestureType, GestureEvent } from '@/utils/gestureRecognition'
import { useIntelligentAnimations } from '@/composables/useIntelligentAnimations'

interface Props {
  enabledGestures?: GestureType[]
  showFeedback?: boolean
  showTrail?: boolean
  feedbackDuration?: number
  trailDuration?: number
  sensitivity?: number
  debug?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  enabledGestures: () => [
    'tap', 'doubletap', 'longpress',
    'swipe-left', 'swipe-right', 'swipe-up', 'swipe-down',
    'pinch-in', 'pinch-out', 'rotate', 'drag'
  ],
  showFeedback: true,
  showTrail: true,
  feedbackDuration: 1000,
  trailDuration: 500,
  sensitivity: 1,
  debug: false,
  disabled: false
})

const emit = defineEmits<{
  gesture: [type: GestureType, event: GestureEvent]
  'gesture-start': [type: GestureType]
  'gesture-end': [type: GestureType]
  'gesture-cancel': []
}>()

// Refs
const zoneRef = ref<HTMLElement>()
const currentGesture = ref<GestureType | null>(null)
const touchPoints = ref<Array<{ x: number; y: number; id: number }>>([])
const gestureTrail = ref<Array<{ x: number; y: number; time: number }>>([])
const showFeedback = ref(false)
const velocity = ref({ x: 0, y: 0, magnitude: 0 })
const totalDistance = ref(0)
const zoneWidth = ref(0)
const zoneHeight = ref(0)

// Theme
const theme = useTheme()
const animations = useIntelligentAnimations()

// Gesture recognizer
let recognizer: GestureRecognizer | null = null
let feedbackTimeout: number | null = null
let trailCleanupInterval: number | null = null

// Computed
const zoneClasses = computed(() => ({
  'gesture-zone--active': currentGesture.value !== null,
  'gesture-zone--disabled': props.disabled,
  [`gesture-zone--${currentGesture.value}`]: currentGesture.value
}))

const zoneStyles = computed(() => ({
  cursor: props.disabled ? 'not-allowed' : currentGesture.value ? 'grabbing' : 'grab',
  userSelect: 'none',
  touchAction: 'none'
}))

const gestureIcon = computed(() => {
  const icons: Record<GestureType, string> = {
    'tap': 'mdi-gesture-tap',
    'doubletap': 'mdi-gesture-double-tap',
    'longpress': 'mdi-gesture-tap-hold',
    'swipe-left': 'mdi-arrow-left',
    'swipe-right': 'mdi-arrow-right',
    'swipe-up': 'mdi-arrow-up',
    'swipe-down': 'mdi-arrow-down',
    'pinch-in': 'mdi-arrow-collapse',
    'pinch-out': 'mdi-arrow-expand',
    'rotate': 'mdi-rotate-right',
    'drag': 'mdi-drag',
    'flick': 'mdi-flash',
    'pan': 'mdi-pan',
    'edge-swipe': 'mdi-import',
    'multi-finger-tap': 'mdi-gesture-two-double-tap'
  }
  return currentGesture.value ? icons[currentGesture.value] : 'mdi-gesture'
})

const gestureLabel = computed(() => {
  const labels: Record<GestureType, string> = {
    'tap': 'Tap',
    'doubletap': 'Double Tap',
    'longpress': 'Long Press',
    'swipe-left': 'Swipe Left',
    'swipe-right': 'Swipe Right',
    'swipe-up': 'Swipe Up',
    'swipe-down': 'Swipe Down',
    'pinch-in': 'Pinch In',
    'pinch-out': 'Pinch Out',
    'rotate': 'Rotate',
    'drag': 'Drag',
    'flick': 'Flick',
    'pan': 'Pan',
    'edge-swipe': 'Edge Swipe',
    'multi-finger-tap': 'Multi-finger Tap'
  }
  return currentGesture.value ? labels[currentGesture.value] : ''
})

const feedbackColor = computed(() => {
  if (!currentGesture.value) return 'primary'
  
  const colorMap: Partial<Record<GestureType, string>> = {
    'tap': 'primary',
    'doubletap': 'secondary',
    'longpress': 'accent',
    'swipe-left': 'info',
    'swipe-right': 'info',
    'swipe-up': 'success',
    'swipe-down': 'warning',
    'pinch-in': 'error',
    'pinch-out': 'success'
  }
  
  return colorMap[currentGesture.value] || 'primary'
})

const feedbackStyles = computed(() => {
  const center = touchPoints.value.length > 0
    ? touchPoints.value.reduce((acc, p) => ({
        x: acc.x + p.x / touchPoints.value.length,
        y: acc.y + p.y / touchPoints.value.length
      }), { x: 0, y: 0 })
    : { x: zoneWidth.value / 2, y: zoneHeight.value / 2 }
  
  return {
    left: `${center.x}px`,
    top: `${center.y}px`
  }
})

const trailPath = computed(() => {
  if (gestureTrail.value.length < 2) return ''
  
  const points = gestureTrail.value
  let path = `M ${points[0].x} ${points[0].y}`
  
  // Use quadratic bezier curves for smooth trail
  for (let i = 1; i < points.length - 1; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2
    const yc = (points[i].y + points[i + 1].y) / 2
    path += ` Q ${points[i].x} ${points[i].y}, ${xc} ${yc}`
  }
  
  // Add the last point
  if (points.length > 1) {
    path += ` L ${points[points.length - 1].x} ${points[points.length - 1].y}`
  }
  
  return path
})

const trailColor = computed(() => theme.current.value.colors.primary)
const trailOpacity = computed(() => currentGesture.value ? 0.6 : 0.3)

// Methods
const getTouchPointStyle = (point: { x: number; y: number }) => ({
  left: `${point.x}px`,
  top: `${point.y}px`
})

const handleStart = (e: TouchEvent | MouseEvent) => {
  if (props.disabled) return
  
  // Update zone dimensions
  if (zoneRef.value) {
    const rect = zoneRef.value.getBoundingClientRect()
    zoneWidth.value = rect.width
    zoneHeight.value = rect.height
  }
}

const onGestureStart = (type: GestureType, event: GestureEvent) => {
  if (!props.enabledGestures.includes(type)) return
  
  currentGesture.value = type
  touchPoints.value = event.touches
  totalDistance.value = 0
  
  if (props.showFeedback) {
    showFeedback.value = true
    
    // Animate feedback appearance
    if (animations && zoneRef.value) {
      animations.animateWithEmotion(
        zoneRef.value,
        'excited',
        { scale: 1.02 }
      )
    }
    
    // Hide feedback after duration
    if (feedbackTimeout) clearTimeout(feedbackTimeout)
    feedbackTimeout = window.setTimeout(() => {
      showFeedback.value = false
    }, props.feedbackDuration)
  }
  
  emit('gesture-start', type)
  emit('gesture', type, event)
}

const onGestureUpdate = (event: GestureEvent) => {
  if (!currentGesture.value) return
  
  touchPoints.value = event.touches
  velocity.value = {
    x: event.velocity.x,
    y: event.velocity.y,
    magnitude: Math.sqrt(event.velocity.x ** 2 + event.velocity.y ** 2)
  }
  totalDistance.value += Math.sqrt(event.deltaX ** 2 + event.deltaY ** 2)
  
  // Update trail
  if (props.showTrail && event.touches.length > 0) {
    const point = event.touches[0]
    gestureTrail.value.push({
      x: point.x,
      y: point.y,
      time: Date.now()
    })
    
    // Limit trail length
    if (gestureTrail.value.length > 50) {
      gestureTrail.value.shift()
    }
  }
  
  emit('gesture', currentGesture.value, event)
}

const onGestureEnd = () => {
  if (currentGesture.value) {
    emit('gesture-end', currentGesture.value)
    
    // Animate zone back to normal
    if (animations && zoneRef.value) {
      animations.animateWithEmotion(
        zoneRef.value,
        'calm',
        { scale: 1 }
      )
    }
  }
  
  currentGesture.value = null
  touchPoints.value = []
  velocity.value = { x: 0, y: 0, magnitude: 0 }
  
  // Start trail fade out
  startTrailFadeOut()
}

const onGestureCancel = () => {
  currentGesture.value = null
  touchPoints.value = []
  gestureTrail.value = []
  showFeedback.value = false
  
  emit('gesture-cancel')
}

const startTrailFadeOut = () => {
  if (!props.showTrail) return
  
  const fadeStartTime = Date.now()
  const fadeDuration = props.trailDuration
  
  const fadeOut = () => {
    const elapsed = Date.now() - fadeStartTime
    const progress = elapsed / fadeDuration
    
    if (progress >= 1) {
      gestureTrail.value = []
    } else {
      // Remove old points
      const cutoffTime = Date.now() - fadeDuration
      gestureTrail.value = gestureTrail.value.filter(p => p.time > cutoffTime)
      
      if (gestureTrail.value.length > 0) {
        requestAnimationFrame(fadeOut)
      }
    }
  }
  
  requestAnimationFrame(fadeOut)
}

// Lifecycle
onMounted(() => {
  if (!zoneRef.value) return
  
  recognizer = new GestureRecognizer(zoneRef.value, {
    enableMultiTouch: true,
    onGestureStart,
    onGestureUpdate,
    onGestureEnd,
    onGestureCancel
  })
  
  // Cleanup old trail points periodically
  trailCleanupInterval = window.setInterval(() => {
    if (gestureTrail.value.length > 0 && !currentGesture.value) {
      const cutoffTime = Date.now() - props.trailDuration
      gestureTrail.value = gestureTrail.value.filter(p => p.time > cutoffTime)
    }
  }, 100)
})

onUnmounted(() => {
  if (recognizer) {
    recognizer.destroy()
  }
  
  if (feedbackTimeout) {
    clearTimeout(feedbackTimeout)
  }
  
  if (trailCleanupInterval) {
    clearInterval(trailCleanupInterval)
  }
})
</script>

<style scoped>
.gesture-zone {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  touch-action: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

.gesture-zone--disabled {
  opacity: 0.6;
  pointer-events: none;
}

.gesture-content {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.gesture-feedback {
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.gesture-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--v-surface-base-rgb), 0.9);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
}

.gesture-label {
  padding: 4px 12px;
  background: rgba(var(--v-surface-base-rgb), 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.touch-point {
  position: absolute;
  width: 40px;
  height: 40px;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 99;
}

.touch-ripple {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(var(--v-primary-base-rgb), 0.3) 0%,
    rgba(var(--v-primary-base-rgb), 0) 70%
  );
  animation: touch-ripple 0.6s ease-out;
}

@keyframes touch-ripple {
  from {
    transform: scale(0);
    opacity: 1;
  }
  to {
    transform: scale(2);
    opacity: 0;
  }
}

.gesture-trail {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 98;
}

.gesture-debug {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-family: monospace;
  font-size: 11px;
  border-radius: 4px;
  z-index: 101;
  pointer-events: none;
}

.gesture-debug > div {
  margin-bottom: 4px;
}

.gesture-debug > div:last-child {
  margin-bottom: 0;
}

/* Gesture feedback transitions */
.gesture-feedback-enter-active,
.gesture-feedback-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.gesture-feedback-enter-from {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.5);
}

.gesture-feedback-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(1.2);
}

/* Gesture-specific styles */
.gesture-zone--longpress {
  animation: longpress-pulse 0.6s ease-out;
}

@keyframes longpress-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--v-primary-base-rgb), 0.4);
  }
  100% {
    box-shadow: 0 0 0 20px rgba(var(--v-primary-base-rgb), 0);
  }
}

.gesture-zone--pinch-in,
.gesture-zone--pinch-out {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.gesture-zone--rotate {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>