<template>
  <div
    ref="containerRef"
    class="adaptive-grid"
    :class="gridClasses"
    :style="containerStyles"
  >
    <!-- Grid items -->
    <transition-group
      name="grid-item"
      tag="div"
      class="grid-container"
      :style="gridStyles"
    >
      <div
        v-for="(item, index) in visibleItems"
        :key="item.id || index"
        class="grid-item"
        :style="getItemStyle(index)"
        @click="handleItemClick(item, index)"
        @mouseenter="handleItemHover(item, index)"
        @mouseleave="handleItemLeave(item, index)"
      >
        <slot name="item" :item="item" :index="index">
          <div class="grid-item-content">
            {{ item }}
          </div>
        </slot>
      </div>
    </transition-group>
    
    <!-- Loading skeleton -->
    <transition name="fade">
      <div v-if="loading" class="grid-skeleton">
        <div
          v-for="n in skeletonCount"
          :key="`skeleton-${n}`"
          class="skeleton-item"
          :style="getSkeletonStyle(n - 1)"
        >
          <div class="skeleton-shimmer" />
        </div>
      </div>
    </transition>
    
    <!-- Empty state -->
    <transition name="fade">
      <div v-if="!loading && items.length === 0" class="grid-empty">
        <slot name="empty">
          <v-icon size="64" color="grey">mdi-view-grid-outline</v-icon>
          <p class="text-h6 mt-4">No items to display</p>
        </slot>
      </div>
    </transition>
    
    <!-- Layout controls -->
    <div v-if="showControls" class="grid-controls">
      <v-btn-toggle
        v-model="layoutMode"
        mandatory
        dense
      >
        <v-btn value="grid" icon small>
          <v-icon>mdi-view-grid</v-icon>
        </v-btn>
        <v-btn value="list" icon small>
          <v-icon>mdi-view-list</v-icon>
        </v-btn>
        <v-btn value="masonry" icon small>
          <v-icon>mdi-view-dashboard</v-icon>
        </v-btn>
      </v-btn-toggle>
      
      <v-slider
        v-model="columns"
        :min="1"
        :max="maxColumns"
        :step="1"
        hide-details
        dense
        class="ml-4"
        style="max-width: 120px"
      >
        <template #prepend>
          <v-icon small>mdi-view-column</v-icon>
        </template>
      </v-slider>
      
      <v-btn-toggle
        v-model="density"
        mandatory
        dense
        class="ml-4"
      >
        <v-btn value="comfortable" icon small>
          <v-icon>mdi-arrow-expand-all</v-icon>
        </v-btn>
        <v-btn value="compact" icon small>
          <v-icon>mdi-arrow-collapse-all</v-icon>
        </v-btn>
        <v-btn value="dense" icon small>
          <v-icon>mdi-dots-grid</v-icon>
        </v-btn>
      </v-btn-toggle>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useAdaptiveLayout } from '@/composables/useAdaptiveLayout'
import { useIntelligentAnimations } from '@/composables/useIntelligentAnimations'
import { useDisplay } from 'vuetify'

interface GridItem {
  id?: string | number
  [key: string]: any
}

interface Props {
  items?: GridItem[]
  loading?: boolean
  showControls?: boolean
  initialLayout?: 'grid' | 'list' | 'masonry'
  initialColumns?: number
  maxColumns?: number
  aspectRatio?: number
  gap?: number
  virtualized?: boolean
  animateChanges?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  loading: false,
  showControls: true,
  initialLayout: 'grid',
  initialColumns: 3,
  maxColumns: 6,
  aspectRatio: 1,
  gap: 16,
  virtualized: true,
  animateChanges: true
})

const emit = defineEmits<{
  'item-click': [item: GridItem, index: number]
  'layout-change': [mode: string, columns: number]
}>()

// Refs
const containerRef = ref<HTMLElement>()
const layoutMode = ref(props.initialLayout)
const columns = ref(props.initialColumns)
const density = ref<'comfortable' | 'compact' | 'dense'>('comfortable')
const hoveredIndex = ref<number | null>(null)

// Composables
const display = useDisplay()
const adaptiveLayout = useAdaptiveLayout({
  baseConfig: {
    columns: columns.value,
    gap: props.gap,
    itemAspectRatio: props.aspectRatio
  },
  contentDensity: density.value,
  enableAutoAdjust: true,
  enableContentAwareLayout: true
})

const animations = useIntelligentAnimations()

// Computed
const gridClasses = computed(() => ({
  [`adaptive-grid--${layoutMode.value}`]: true,
  [`adaptive-grid--${density.value}`]: true,
  'adaptive-grid--loading': props.loading,
  'adaptive-grid--animated': props.animateChanges
}))

const containerStyles = computed(() => ({
  '--grid-columns': adaptiveLayout.effectiveColumns.value,
  '--grid-gap': `${props.gap}px`,
  '--item-aspect-ratio': props.aspectRatio
}))

const gridStyles = computed(() => {
  if (layoutMode.value === 'masonry') {
    return {
      columnCount: adaptiveLayout.effectiveColumns.value,
      columnGap: `${props.gap}px`
    }
  }
  
  return adaptiveLayout.containerStyles.value
})

const visibleItems = computed(() => {
  if (!props.virtualized || !adaptiveLayout.virtualizedIndices.value) {
    return props.items
  }
  
  const { start, end } = adaptiveLayout.virtualizedIndices.value
  return props.items.slice(start, end)
})

const skeletonCount = computed(() => {
  return Math.min(props.items.length || 12, adaptiveLayout.effectiveColumns.value * 3)
})

// Methods
const getItemStyle = (index: number) => {
  const baseStyle = adaptiveLayout.itemStyles.value
  
  if (layoutMode.value === 'masonry') {
    return {
      breakInside: 'avoid',
      marginBottom: `${props.gap}px`,
      transform: hoveredIndex.value === index ? 'scale(1.02)' : 'scale(1)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }
  }
  
  if (layoutMode.value === 'list') {
    return {
      ...baseStyle,
      gridColumn: '1 / -1',
      aspectRatio: 'auto',
      minHeight: '80px'
    }
  }
  
  return {
    ...baseStyle,
    transform: hoveredIndex.value === index ? 'scale(1.05)' : 'scale(1)',
    zIndex: hoveredIndex.value === index ? 10 : 1
  }
}

const getSkeletonStyle = (index: number) => {
  const delay = index * 50
  return {
    animationDelay: `${delay}ms`
  }
}

const handleItemClick = (item: GridItem, index: number) => {
  emit('item-click', item, index)
  
  // Animate click feedback
  if (animations && containerRef.value) {
    const itemElement = containerRef.value.querySelector(`.grid-item:nth-child(${index + 1})`)
    if (itemElement) {
      animations.animateWithEmotion(
        itemElement as HTMLElement,
        'playful',
        { scale: 0.95 }
      ).then(() => {
        animations.animateWithEmotion(
          itemElement as HTMLElement,
          'playful',
          { scale: 1 }
        )
      })
    }
  }
}

const handleItemHover = (item: GridItem, index: number) => {
  hoveredIndex.value = index
}

const handleItemLeave = (item: GridItem, index: number) => {
  if (hoveredIndex.value === index) {
    hoveredIndex.value = null
  }
}

const updateLayout = () => {
  adaptiveLayout.analyzeContent(props.items)
  emit('layout-change', layoutMode.value, adaptiveLayout.effectiveColumns.value)
}

// Watchers
watch(() => props.items, () => {
  updateLayout()
}, { deep: true })

watch(layoutMode, (mode) => {
  adaptiveLayout.setLayoutMode(mode as any)
  
  // Animate layout change
  if (animations && containerRef.value && props.animateChanges) {
    animations.staggerAnimation(
      Array.from(containerRef.value.querySelectorAll('.grid-item')) as HTMLElement[],
      { opacity: 1, transform: 'scale(1)' },
      {
        emotion: 'elegant',
        staggerFrom: 'random',
        staggerEach: 30
      }
    )
  }
})

watch(columns, (value) => {
  adaptiveLayout.setColumns(value)
})

watch(density, (value) => {
  adaptiveLayout.setDensity(value)
})

// Lifecycle
onMounted(() => {
  if (containerRef.value) {
    adaptiveLayout.observeContainer(containerRef.value)
  }
  
  updateLayout()
  
  // Initial animation
  if (animations && containerRef.value && props.animateChanges) {
    nextTick(() => {
      animations.staggerAnimation(
        Array.from(containerRef.value!.querySelectorAll('.grid-item')) as HTMLElement[],
        { opacity: 1, transform: 'translateY(0)' },
        {
          emotion: 'elegant',
          staggerFrom: 'start',
          staggerEach: 50
        }
      )
    })
  }
})
</script>

<style scoped>
.adaptive-grid {
  position: relative;
  width: 100%;
  min-height: 200px;
}

.grid-container {
  position: relative;
  width: 100%;
}

/* Grid layout */
.adaptive-grid--grid .grid-container {
  display: grid;
  grid-template-columns: repeat(var(--grid-columns), 1fr);
  gap: var(--grid-gap);
}

/* List layout */
.adaptive-grid--list .grid-container {
  display: flex;
  flex-direction: column;
  gap: var(--grid-gap);
}

/* Masonry layout */
.adaptive-grid--masonry .grid-container {
  column-count: var(--grid-columns);
  column-gap: var(--grid-gap);
}

.grid-item {
  position: relative;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.adaptive-grid--animated .grid-item {
  opacity: 0;
  transform: translateY(20px);
}

.grid-item-content {
  width: 100%;
  height: 100%;
  background: rgba(var(--v-surface-base-rgb), 0.8);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.grid-item:hover .grid-item-content {
  background: rgba(var(--v-surface-base-rgb), 0.95);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

/* Grid aspect ratio */
.adaptive-grid--grid .grid-item {
  aspect-ratio: var(--item-aspect-ratio);
}

/* Skeleton loading */
.grid-skeleton {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: grid;
  grid-template-columns: repeat(var(--grid-columns), 1fr);
  gap: var(--grid-gap);
  padding: inherit;
}

.skeleton-item {
  aspect-ratio: var(--item-aspect-ratio);
  background: rgba(var(--v-surface-base-rgb), 0.5);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.skeleton-shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 100%
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  to {
    left: 100%;
  }
}

/* Empty state */
.grid-empty {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: rgba(var(--v-text-base-rgb), 0.6);
}

/* Controls */
.grid-controls {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 16px;
  background: rgba(var(--v-surface-base-rgb), 0.9);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

/* Density variations */
.adaptive-grid--comfortable {
  padding: 32px;
}

.adaptive-grid--compact {
  padding: 24px;
}

.adaptive-grid--dense {
  padding: 16px;
}

/* Transitions */
.grid-item-enter-active,
.grid-item-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.grid-item-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

.grid-item-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.grid-item-move {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Dark mode adjustments */
.v-application--is-dark .grid-item-content {
  background: rgba(var(--v-surface-base-rgb), 0.7);
}

.v-application--is-dark .grid-item:hover .grid-item-content {
  background: rgba(var(--v-surface-base-rgb), 0.85);
}

/* Responsive */
@media (max-width: 600px) {
  .grid-controls {
    top: 8px;
    right: 8px;
    flex-wrap: wrap;
    max-width: calc(100% - 16px);
  }
  
  .adaptive-grid--comfortable {
    padding: 16px;
  }
  
  .adaptive-grid--compact {
    padding: 12px;
  }
  
  .adaptive-grid--dense {
    padding: 8px;
  }
}
</style>