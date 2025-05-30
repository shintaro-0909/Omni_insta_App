import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useDisplay } from 'vuetify'

export interface LayoutConfig {
  columns: number
  gap: number
  padding: number
  itemAspectRatio: number
  minItemWidth: number
  maxItemWidth: number
}

export interface AdaptiveLayoutOptions {
  baseConfig?: Partial<LayoutConfig>
  contentDensity?: 'comfortable' | 'compact' | 'dense'
  enableAutoAdjust?: boolean
  enableContentAwareLayout?: boolean
}

export function useAdaptiveLayout(options: AdaptiveLayoutOptions = {}) {
  const {
    baseConfig = {},
    contentDensity = 'comfortable',
    enableAutoAdjust = true,
    enableContentAwareLayout = true
  } = options

  const display = useDisplay()
  
  // Layout state
  const containerWidth = ref(0)
  const containerHeight = ref(0)
  const itemCount = ref(0)
  const averageContentLength = ref(0)
  const layoutMode = ref<'grid' | 'list' | 'masonry' | 'timeline'>('grid')
  
  // Dynamic configuration
  const currentConfig = ref<LayoutConfig>({
    columns: 3,
    gap: 16,
    padding: 24,
    itemAspectRatio: 1,
    minItemWidth: 200,
    maxItemWidth: 400,
    ...baseConfig
  })
  
  // Density presets
  const densityPresets = {
    comfortable: { gap: 24, padding: 32 },
    compact: { gap: 16, padding: 24 },
    dense: { gap: 8, padding: 16 }
  }
  
  // Computed layout properties
  const effectiveColumns = computed(() => {
    if (!enableAutoAdjust) return currentConfig.value.columns
    
    const availableWidth = containerWidth.value - (currentConfig.value.padding * 2)
    const minColumns = Math.floor(availableWidth / currentConfig.value.maxItemWidth)
    const maxColumns = Math.floor(availableWidth / currentConfig.value.minItemWidth)
    
    // Adjust based on content
    if (enableContentAwareLayout) {
      if (itemCount.value <= 3) return Math.min(itemCount.value, maxColumns)
      if (itemCount.value <= 6) return Math.min(3, maxColumns)
      if (itemCount.value <= 12) return Math.min(4, maxColumns)
    }
    
    return Math.max(minColumns, Math.min(currentConfig.value.columns, maxColumns))
  })
  
  const itemWidth = computed(() => {
    const availableWidth = containerWidth.value - (currentConfig.value.padding * 2)
    const totalGapWidth = (effectiveColumns.value - 1) * currentConfig.value.gap
    return (availableWidth - totalGapWidth) / effectiveColumns.value
  })
  
  const itemHeight = computed(() => {
    if (layoutMode.value === 'masonry') return 'auto'
    return itemWidth.value / currentConfig.value.itemAspectRatio
  })
  
  const gridTemplateColumns = computed(() => {
    if (layoutMode.value === 'list') return '1fr'
    return `repeat(${effectiveColumns.value}, 1fr)`
  })
  
  const containerStyles = computed(() => ({
    padding: `${currentConfig.value.padding}px`,
    gap: `${currentConfig.value.gap}px`,
    display: layoutMode.value === 'timeline' ? 'flex' : 'grid',
    gridTemplateColumns: gridTemplateColumns.value,
    flexDirection: layoutMode.value === 'timeline' ? 'column' : undefined
  }))
  
  const itemStyles = computed(() => ({
    width: layoutMode.value === 'grid' ? '100%' : undefined,
    height: itemHeight.value === 'auto' ? undefined : `${itemHeight.value}px`,
    minHeight: layoutMode.value === 'masonry' ? '100px' : undefined
  }))
  
  // Responsive breakpoints
  const updateLayoutMode = () => {
    if (!enableAutoAdjust) return
    
    const { xs, sm, md } = display
    
    if (xs.value) {
      layoutMode.value = 'list'
      currentConfig.value.columns = 1
    } else if (sm.value && itemCount.value > 20) {
      layoutMode.value = 'list'
      currentConfig.value.columns = 1
    } else if (md.value && averageContentLength.value > 200) {
      layoutMode.value = 'masonry'
      currentConfig.value.columns = 2
    } else {
      layoutMode.value = 'grid'
      currentConfig.value.columns = baseConfig.columns || 3
    }
  }
  
  // Content analysis
  const analyzeContent = (items: any[]) => {
    itemCount.value = items.length
    
    if (enableContentAwareLayout && items.length > 0) {
      const totalLength = items.reduce((sum, item) => {
        const textLength = JSON.stringify(item).length
        return sum + textLength
      }, 0)
      
      averageContentLength.value = totalLength / items.length
    }
    
    updateLayoutMode()
  }
  
  // Dynamic density adjustment
  const setDensity = (density: 'comfortable' | 'compact' | 'dense') => {
    const preset = densityPresets[density]
    currentConfig.value.gap = preset.gap
    currentConfig.value.padding = preset.padding
  }
  
  // Manual configuration
  const setColumns = (columns: number) => {
    currentConfig.value.columns = columns
  }
  
  const setLayoutMode = (mode: 'grid' | 'list' | 'masonry' | 'timeline') => {
    layoutMode.value = mode
  }
  
  // Container observation
  let resizeObserver: ResizeObserver | null = null
  
  const observeContainer = (element: HTMLElement) => {
    if (resizeObserver) {
      resizeObserver.disconnect()
    }
    
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        containerWidth.value = entry.contentRect.width
        containerHeight.value = entry.contentRect.height
      }
    })
    
    resizeObserver.observe(element)
  }
  
  // Performance optimization
  const virtualizedIndices = computed(() => {
    if (!containerHeight.value || itemHeight.value === 'auto') return null
    
    const scrollTop = window.scrollY
    const itemsPerRow = effectiveColumns.value
    const rowHeight = Number(itemHeight.value) + currentConfig.value.gap
    
    const firstVisibleRow = Math.floor(scrollTop / rowHeight)
    const visibleRows = Math.ceil(containerHeight.value / rowHeight) + 2
    
    return {
      start: firstVisibleRow * itemsPerRow,
      end: (firstVisibleRow + visibleRows) * itemsPerRow
    }
  })
  
  // Lifecycle
  onMounted(() => {
    setDensity(contentDensity)
    updateLayoutMode()
  })
  
  onUnmounted(() => {
    if (resizeObserver) {
      resizeObserver.disconnect()
    }
  })
  
  // Watchers
  watch(() => display.name.value, updateLayoutMode)
  
  return {
    // State
    layoutMode,
    effectiveColumns,
    itemWidth,
    itemHeight,
    containerStyles,
    itemStyles,
    virtualizedIndices,
    
    // Methods
    analyzeContent,
    setDensity,
    setColumns,
    setLayoutMode,
    observeContainer
  }
}