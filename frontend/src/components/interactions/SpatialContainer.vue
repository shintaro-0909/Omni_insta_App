<template>
  <div 
    ref="containerRef"
    class="spatial-container"
    :style="containerStyles"
  >
    <div 
      class="spatial-viewport"
      :style="viewportStyles"
    >
      <div
        v-for="(layer, index) in layers"
        :key="layer.id"
        class="spatial-layer"
        :style="getLayerStyles(layer, index)"
        @click="handleLayerClick(layer)"
      >
        <slot :name="layer.id" :layer="layer" :index="index">
          {{ layer.content }}
        </slot>
      </div>
    </div>
    
    <!-- Navigation controls -->
    <div v-if="showControls" class="spatial-controls">
      <v-btn
        icon
        small
        @click="navigation.navigateBack()"
        :disabled="!canGoBack"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      
      <v-btn
        icon
        small
        @click="resetView"
      >
        <v-icon>mdi-home</v-icon>
      </v-btn>
      
      <v-btn-toggle
        v-model="viewMode"
        mandatory
        dense
      >
        <v-btn value="3d">
          <v-icon>mdi-cube-outline</v-icon>
        </v-btn>
        <v-btn value="2d">
          <v-icon>mdi-square-outline</v-icon>
        </v-btn>
      </v-btn-toggle>
    </div>
    
    <!-- Depth indicator -->
    <div v-if="showDepthIndicator" class="depth-indicator">
      <div class="depth-scale">
        <div 
          class="depth-marker"
          :style="{ transform: `translateY(${depthPercentage}%)` }"
        >
          <span class="depth-value">{{ Math.round(currentDepth) }}</span>
        </div>
      </div>
    </div>
    
    <!-- Minimap -->
    <div v-if="showMinimap" class="spatial-minimap">
      <div class="minimap-viewport">
        <div
          v-for="layer in layers"
          :key="`mini-${layer.id}`"
          class="minimap-layer"
          :style="getMinimapLayerStyle(layer)"
          @click="navigateToLayer(layer.id)"
        />
        <div 
          class="minimap-camera"
          :style="minimapCameraStyle"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useSpatialNavigation } from '@/composables/useSpatialNavigation'
import { useAdvancedGestures } from '@/composables/useAdvancedGestures'
import { useIntelligentAnimations } from '@/composables/useIntelligentAnimations'
import { getInteractionEngine } from '@/utils/interactionEngine'

export interface SpatialLayer {
  id: string
  content?: string
  position: {
    x: number
    y: number
    z: number
  }
  rotation?: {
    x: number
    y: number
    z: number
  }
  scale?: number
  opacity?: number
  blur?: number
  metadata?: any
}

interface Props {
  layers?: SpatialLayer[]
  perspective?: number
  showControls?: boolean
  showDepthIndicator?: boolean
  showMinimap?: boolean
  enableGestures?: boolean
  maxDepth?: number
}

const props = withDefaults(defineProps<Props>(), {
  layers: () => [],
  perspective: 1000,
  showControls: true,
  showDepthIndicator: true,
  showMinimap: false,
  enableGestures: true,
  maxDepth: 5000
})

const emit = defineEmits<{
  'layer-click': [layer: SpatialLayer]
  'navigation-change': [position: any]
}>()

// Refs
const containerRef = ref<HTMLElement>()
const viewMode = ref<'3d' | '2d'>('3d')

// Composables
const navigation = useSpatialNavigation({
  perspective: props.perspective,
  maxDepth: props.maxDepth,
  enableDepthBlur: true,
  enableParallax: true
})

const gestures = useAdvancedGestures({
  element: containerRef,
  enableMultiTouch: true,
  enableInertia: true
})

const animations = useIntelligentAnimations()

// Interaction engine
const interactionEngine = getInteractionEngine({
  enableSpatialNavigation: true,
  debugMode: false
})

// Computed
const containerStyles = computed(() => ({
  perspective: viewMode.value === '3d' ? `${props.perspective}px` : 'none',
  overflow: 'hidden',
  position: 'relative',
  width: '100%',
  height: '100%',
  background: 'var(--v-background-base)'
}))

const viewportStyles = computed(() => {
  const pos = navigation.currentPosition.value
  const matrix = navigation.transformMatrix.value
  
  if (viewMode.value === '2d') {
    return {
      transform: `translate(${pos.x}px, ${pos.y}px) scale(${pos.scale})`,
      transformStyle: 'flat',
      transition: navigation.isTransitioning.value 
        ? 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' 
        : 'none'
    }
  }
  
  return {
    transform: `matrix3d(${Array.from(matrix).join(',')})`,
    transformStyle: 'preserve-3d',
    transition: navigation.isTransitioning.value 
      ? 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' 
      : 'none'
  }
})

const currentDepth = computed(() => Math.abs(navigation.currentPosition.value.z))
const depthPercentage = computed(() => (currentDepth.value / props.maxDepth) * 100)

const canGoBack = computed(() => true) // Implement navigation history check

const minimapCameraStyle = computed(() => {
  const pos = navigation.currentPosition.value
  const scale = 0.1
  return {
    transform: `translate(${pos.x * scale}px, ${pos.y * scale}px)`,
    width: '20px',
    height: '20px',
    border: '2px solid var(--v-primary-base)',
    background: 'rgba(var(--v-primary-base-rgb), 0.2)'
  }
})

// Methods
const getLayerStyles = (layer: SpatialLayer, index: number) => {
  const depthOfField = navigation.depthOfField.value
  const isInFocus = layer.position.z >= depthOfField.near && layer.position.z <= depthOfField.far
  
  const blur = !isInFocus ? Math.abs(layer.position.z - currentDepth.value) / 100 : 0
  const opacity = layer.opacity !== undefined ? layer.opacity : 1
  
  const transform = viewMode.value === '3d'
    ? `translate3d(${layer.position.x}px, ${layer.position.y}px, ${layer.position.z}px) 
       rotateX(${layer.rotation?.x || 0}deg) 
       rotateY(${layer.rotation?.y || 0}deg) 
       rotateZ(${layer.rotation?.z || 0}deg) 
       scale(${layer.scale || 1})`
    : `translate(${layer.position.x}px, ${layer.position.y}px) scale(${layer.scale || 1})`
  
  return {
    transform,
    filter: blur > 0 ? `blur(${Math.min(blur, 10)}px)` : 'none',
    opacity,
    zIndex: Math.round(1000 - layer.position.z),
    position: 'absolute',
    transformStyle: viewMode.value === '3d' ? 'preserve-3d' : 'flat',
    willChange: 'transform, filter, opacity',
    cursor: 'pointer',
    transition: 'filter 0.3s, opacity 0.3s'
  }
}

const getMinimapLayerStyle = (layer: SpatialLayer) => {
  const scale = 0.1
  return {
    position: 'absolute',
    left: `${50 + layer.position.x * scale}px`,
    top: `${50 + layer.position.y * scale}px`,
    width: '10px',
    height: '10px',
    background: 'var(--v-secondary-base)',
    borderRadius: '50%',
    cursor: 'pointer',
    transform: `scale(${layer.scale || 1})`,
    opacity: layer.opacity || 1
  }
}

const handleLayerClick = (layer: SpatialLayer) => {
  emit('layer-click', layer)
  
  // Animate to layer
  if (animations) {
    animations.animateWithEmotion(
      containerRef.value!,
      'elegant',
      { opacity: 0.8 }
    ).then(() => {
      navigation.navigateTo({
        x: -layer.position.x,
        y: -layer.position.y,
        z: -layer.position.z + 200
      })
      
      animations.animateWithEmotion(
        containerRef.value!,
        'elegant',
        { opacity: 1 }
      )
    })
  }
}

const navigateToLayer = (layerId: string) => {
  navigation.navigateToLayer(layerId)
}

const resetView = () => {
  navigation.navigateTo({
    x: 0, y: 0, z: 0,
    rotationX: 0, rotationY: 0, rotationZ: 0,
    scale: 1
  })
}

// Register layers with navigation
watch(() => props.layers, (newLayers) => {
  newLayers.forEach(layer => {
    navigation.registerLayer(layer.id, {
      x: -layer.position.x,
      y: -layer.position.y,
      z: -layer.position.z + 200,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      scale: 1
    })
  })
}, { immediate: true })

// Handle gestures
watch(() => gestures.currentGesture.value, (gesture) => {
  if (!gesture || !props.enableGestures) return
  
  interactionEngine.handleGesture(gesture, {
    type: gesture,
    timestamp: Date.now(),
    deltaX: gestures.gestureVelocity.value.x,
    deltaY: gestures.gestureVelocity.value.y,
    velocity: gestures.gestureVelocity.value,
    distance: 0,
    angle: 0,
    scale: 1,
    rotation: 0,
    touches: [],
    progress: gestures.gestureProgress.value
  })
})

// Navigation change event
watch(() => navigation.currentPosition.value, (position) => {
  emit('navigation-change', position)
}, { deep: true })

// Connect to interaction engine
onMounted(() => {
  if (containerRef.value) {
    navigation.observeContainer(containerRef.value)
  }
  
  interactionEngine.connectToVue({
    gestures,
    spatial: navigation,
    animations
  })
})

onUnmounted(() => {
  // Cleanup
  props.layers.forEach(layer => {
    navigation.unregisterLayer(layer.id)
  })
})
</script>

<style scoped>
.spatial-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: linear-gradient(to bottom, 
    rgba(var(--v-background-base-rgb), 0.95),
    rgba(var(--v-background-base-rgb), 1)
  );
}

.spatial-viewport {
  position: absolute;
  width: 100%;
  height: 100%;
  transform-origin: center center;
}

.spatial-layer {
  position: absolute;
  padding: 16px;
  background: rgba(var(--v-surface-base-rgb), 0.8);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.spatial-layer:hover {
  background: rgba(var(--v-surface-base-rgb), 0.95);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  transform: translateZ(10px);
}

.spatial-controls {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  gap: 8px;
  padding: 8px;
  background: rgba(var(--v-surface-base-rgb), 0.9);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.depth-indicator {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 200px;
  background: rgba(var(--v-surface-base-rgb), 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.depth-scale {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom,
    var(--v-primary-base),
    var(--v-secondary-base)
  );
  border-radius: 12px;
  overflow: hidden;
}

.depth-marker {
  position: absolute;
  left: -8px;
  right: -8px;
  height: 4px;
  background: var(--v-background-base);
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.depth-value {
  position: absolute;
  right: -40px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  font-weight: 500;
  color: var(--v-text-base);
  white-space: nowrap;
}

.spatial-minimap {
  position: absolute;
  bottom: 16px;
  right: 16px;
  width: 120px;
  height: 120px;
  background: rgba(var(--v-surface-base-rgb), 0.9);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.minimap-viewport {
  position: relative;
  width: 100%;
  height: 100%;
  background: rgba(var(--v-background-base-rgb), 0.5);
  border-radius: 4px;
  overflow: hidden;
}

.minimap-layer {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.minimap-layer:hover {
  transform: scale(1.2);
  box-shadow: 0 0 0 2px var(--v-primary-base);
}

.minimap-camera {
  position: absolute;
  pointer-events: none;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Dark mode adjustments */
.v-application--is-dark .spatial-layer {
  background: rgba(var(--v-surface-base-rgb), 0.7);
}

.v-application--is-dark .spatial-layer:hover {
  background: rgba(var(--v-surface-base-rgb), 0.85);
}
</style>