<template>
  <div class="base-chart" :class="chartClasses">
    <div v-if="loading" class="chart-loading">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading chart data...</p>
    </div>
    
    <div v-else-if="error" class="chart-error">
      <div class="error-icon">⚠️</div>
      <p class="error-text">{{ error }}</p>
      <button @click="$emit('retry')" class="retry-button">Retry</button>
    </div>
    
    <div v-else class="chart-container">
      <canvas 
        ref="chartCanvas" 
        :width="canvasWidth" 
        :height="canvasHeight"
        :aria-label="ariaLabel"
        role="img"
      ></canvas>
      
      <!-- Chart Legend -->
      <div v-if="showLegend && legend.length > 0" class="chart-legend">
        <div 
          v-for="item in legend" 
          :key="item.label" 
          class="legend-item"
          :style="{ '--legend-color': item.color }"
        >
          <span class="legend-indicator"></span>
          <span class="legend-label">{{ item.label }}</span>
          <span v-if="item.value" class="legend-value">{{ item.value }}</span>
        </div>
      </div>
    </div>
    
    <!-- Chart Controls -->
    <div v-if="showControls" class="chart-controls">
      <slot name="controls">
        <div class="time-controls">
          <button 
            v-for="period in timePeriods" 
            :key="period.value"
            :class="['control-btn', { active: selectedPeriod === period.value }]"
            @click="handlePeriodChange(period.value)"
          >
            {{ period.label }}
          </button>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, nextTick, type PropType } from 'vue'

export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

export interface ChartDataset {
  label: string
  data: number[]
  color?: string
  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
  fill?: boolean
}

export interface LegendItem {
  label: string
  color: string
  value?: string
}

export interface TimePeriod {
  label: string
  value: string
}

const props = defineProps({
  // Chart configuration
  type: {
    type: String as PropType<'line' | 'bar' | 'doughnut' | 'area' | 'scatter'>,
    default: 'line'
  },
  variant: {
    type: String as PropType<'modern' | 'cyberpunk' | 'glassmorphism' | 'neumorphism' | 'minimalist' | 'stylish' | 'retro'>,
    default: 'modern'
  },
  
  // Data
  data: {
    type: Object as PropType<ChartData>,
    required: true
  },
  
  // Dimensions
  width: {
    type: [Number, String],
    default: '100%'
  },
  height: {
    type: [Number, String],
    default: 300
  },
  
  // Visual options
  showGrid: {
    type: Boolean,
    default: true
  },
  showAxes: {
    type: Boolean,
    default: true
  },
  showLegend: {
    type: Boolean,
    default: true
  },
  showControls: {
    type: Boolean,
    default: false
  },
  animated: {
    type: Boolean,
    default: true
  },
  responsive: {
    type: Boolean,
    default: true
  },
  
  // Colors
  gradientColors: {
    type: Array as PropType<string[]>,
    default: () => ['#667eea', '#764ba2']
  },
  
  // State
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  
  // Time controls
  timePeriods: {
    type: Array as PropType<TimePeriod[]>,
    default: () => [
      { label: '7D', value: '7d' },
      { label: '30D', value: '30d' },
      { label: '90D', value: '90d' }
    ]
  },
  selectedPeriod: {
    type: String,
    default: '30d'
  },
  
  // Accessibility
  ariaLabel: {
    type: String,
    default: 'Chart visualization'
  }
})

const emit = defineEmits(['period-change', 'retry', 'point-click', 'chart-ready'])

const chartCanvas = ref<HTMLCanvasElement>()
const ctx = ref<CanvasRenderingContext2D | null>(null)
const chartInstance = ref<any>(null)
const legend = ref<LegendItem[]>([])

const chartClasses = computed(() => [
  'base-chart',
  `base-chart--${props.variant}`,
  `base-chart--${props.type}`,
  {
    'base-chart--loading': props.loading,
    'base-chart--error': props.error,
    'base-chart--responsive': props.responsive
  }
])

const canvasWidth = computed(() => {
  return typeof props.width === 'string' ? 800 : props.width
})

const canvasHeight = computed(() => {
  return typeof props.height === 'string' ? 300 : props.height
})

const themeColors = computed(() => {
  const themes = {
    modern: {
      primary: '#2196f3',
      secondary: '#90caf9',
      grid: 'rgba(0, 0, 0, 0.1)',
      text: '#333333',
      background: '#ffffff'
    },
    cyberpunk: {
      primary: '#00ffff',
      secondary: '#ff006e',
      grid: 'rgba(0, 255, 255, 0.2)',
      text: '#00ffff',
      background: 'rgba(0, 0, 0, 0.8)'
    },
    glassmorphism: {
      primary: 'rgba(33, 150, 243, 0.8)',
      secondary: 'rgba(144, 202, 249, 0.6)',
      grid: 'rgba(255, 255, 255, 0.2)',
      text: 'rgba(0, 0, 0, 0.8)',
      background: 'rgba(255, 255, 255, 0.1)'
    },
    neumorphism: {
      primary: '#667eea',
      secondary: '#764ba2',
      grid: 'rgba(0, 0, 0, 0.1)',
      text: '#333333',
      background: '#e6e6e6'
    },
    minimalist: {
      primary: '#000000',
      secondary: '#666666',
      grid: 'rgba(0, 0, 0, 0.1)',
      text: '#000000',
      background: '#ffffff'
    },
    stylish: {
      primary: '#667eea',
      secondary: '#764ba2',
      grid: 'rgba(102, 126, 234, 0.1)',
      text: '#333333',
      background: '#ffffff'
    },
    retro: {
      primary: '#ff006e',
      secondary: '#8338ec',
      grid: 'rgba(255, 0, 110, 0.2)',
      text: '#ffffff',
      background: 'linear-gradient(145deg, #2a0845, #1a0330)'
    }
  }
  
  return themes[props.variant] || themes.modern
})

const handlePeriodChange = (period: string) => {
  emit('period-change', period)
}

const initChart = async () => {
  if (!chartCanvas.value) return
  
  ctx.value = chartCanvas.value.getContext('2d')
  if (!ctx.value) return
  
  await nextTick()
  
  // Clear canvas
  ctx.value.clearRect(0, 0, canvasWidth.value, canvasHeight.value)
  
  // Draw chart based on type
  switch (props.type) {
    case 'line':
      drawLineChart()
      break
    case 'bar':
      drawBarChart()
      break
    case 'area':
      drawAreaChart()
      break
    case 'doughnut':
      drawDoughnutChart()
      break
    case 'scatter':
      drawScatterChart()
      break
  }
  
  // Generate legend
  generateLegend()
  
  emit('chart-ready')
}

const drawLineChart = () => {
  if (!ctx.value || !props.data.datasets.length) return
  
  const padding = 40
  const chartWidth = canvasWidth.value - padding * 2
  const chartHeight = canvasHeight.value - padding * 2
  
  // Draw grid
  if (props.showGrid) {
    drawGrid(padding, chartWidth, chartHeight)
  }
  
  // Draw datasets
  props.data.datasets.forEach((dataset, datasetIndex) => {
    const points = dataset.data.map((value, index) => ({
      x: padding + (index / (dataset.data.length - 1)) * chartWidth,
      y: padding + chartHeight - (value / Math.max(...dataset.data)) * chartHeight
    }))
    
    // Create gradient if specified
    let strokeStyle = dataset.borderColor || themeColors.value.primary
    if (props.gradientColors.length > 1) {
      const gradient = ctx.value.createLinearGradient(0, 0, 0, canvasHeight.value)
      props.gradientColors.forEach((color, index) => {
        gradient.addColorStop(index / (props.gradientColors.length - 1), color)
      })
      strokeStyle = gradient
    }
    
    // Draw line
    ctx.value.beginPath()
    ctx.value.strokeStyle = strokeStyle
    ctx.value.lineWidth = dataset.borderWidth || 3
    ctx.value.lineJoin = 'round'
    ctx.value.lineCap = 'round'
    
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.value.moveTo(point.x, point.y)
      } else {
        ctx.value.lineTo(point.x, point.y)
      }
    })
    
    ctx.value.stroke()
    
    // Draw points
    points.forEach((point) => {
      ctx.value.beginPath()
      ctx.value.arc(point.x, point.y, 4, 0, 2 * Math.PI)
      ctx.value.fillStyle = strokeStyle
      ctx.value.fill()
      ctx.value.beginPath()
      ctx.value.arc(point.x, point.y, 6, 0, 2 * Math.PI)
      ctx.value.strokeStyle = themeColors.value.background
      ctx.value.lineWidth = 2
      ctx.value.stroke()
    })
  })
}

const drawAreaChart = () => {
  if (!ctx.value || !props.data.datasets.length) return
  
  const padding = 40
  const chartWidth = canvasWidth.value - padding * 2
  const chartHeight = canvasHeight.value - padding * 2
  
  // Draw grid
  if (props.showGrid) {
    drawGrid(padding, chartWidth, chartHeight)
  }
  
  // Draw datasets
  props.data.datasets.forEach((dataset) => {
    const points = dataset.data.map((value, index) => ({
      x: padding + (index / (dataset.data.length - 1)) * chartWidth,
      y: padding + chartHeight - (value / Math.max(...dataset.data)) * chartHeight
    }))
    
    // Create gradient
    const gradient = ctx.value.createLinearGradient(0, 0, 0, canvasHeight.value)
    if (props.gradientColors.length > 1) {
      props.gradientColors.forEach((color, index) => {
        gradient.addColorStop(index / (props.gradientColors.length - 1), color + '40')
      })
    } else {
      gradient.addColorStop(0, themeColors.value.primary + '40')
      gradient.addColorStop(1, themeColors.value.primary + '10')
    }
    
    // Draw area
    ctx.value.beginPath()
    ctx.value.moveTo(points[0].x, padding + chartHeight)
    
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.value.lineTo(point.x, point.y)
      } else {
        ctx.value.lineTo(point.x, point.y)
      }
    })
    
    ctx.value.lineTo(points[points.length - 1].x, padding + chartHeight)
    ctx.value.closePath()
    ctx.value.fillStyle = gradient
    ctx.value.fill()
    
    // Draw line
    ctx.value.beginPath()
    ctx.value.strokeStyle = dataset.borderColor || themeColors.value.primary
    ctx.value.lineWidth = 3
    
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.value.moveTo(point.x, point.y)
      } else {
        ctx.value.lineTo(point.x, point.y)
      }
    })
    
    ctx.value.stroke()
  })
}

const drawBarChart = () => {
  if (!ctx.value || !props.data.datasets.length) return
  
  const padding = 40
  const chartWidth = canvasWidth.value - padding * 2
  const chartHeight = canvasHeight.value - padding * 2
  
  // Draw grid
  if (props.showGrid) {
    drawGrid(padding, chartWidth, chartHeight)
  }
  
  const barWidth = chartWidth / props.data.labels.length * 0.8
  const barSpacing = chartWidth / props.data.labels.length * 0.2
  
  props.data.datasets.forEach((dataset, datasetIndex) => {
    dataset.data.forEach((value, index) => {
      const barHeight = (value / Math.max(...dataset.data)) * chartHeight
      const x = padding + index * (barWidth + barSpacing) + barSpacing / 2
      const y = padding + chartHeight - barHeight
      
      // Create gradient for bars
      const gradient = ctx.value.createLinearGradient(x, y, x, y + barHeight)
      if (props.gradientColors.length > 1) {
        props.gradientColors.forEach((color, colorIndex) => {
          gradient.addColorStop(colorIndex / (props.gradientColors.length - 1), color)
        })
      } else {
        gradient.addColorStop(0, dataset.backgroundColor || themeColors.value.primary)
        gradient.addColorStop(1, dataset.backgroundColor || themeColors.value.secondary)
      }
      
      // Draw bar
      ctx.value.fillStyle = gradient
      ctx.value.fillRect(x, y, barWidth, barHeight)
      
      // Add hover effect styling
      if (props.variant === 'neumorphism') {
        ctx.value.strokeStyle = 'rgba(0, 0, 0, 0.1)'
        ctx.value.lineWidth = 1
        ctx.value.strokeRect(x, y, barWidth, barHeight)
      }
    })
  })
}

const drawDoughnutChart = () => {
  if (!ctx.value || !props.data.datasets.length) return
  
  const centerX = canvasWidth.value / 2
  const centerY = canvasHeight.value / 2
  const radius = Math.min(centerX, centerY) - 20
  const innerRadius = radius * 0.6
  
  let currentAngle = -Math.PI / 2
  const total = props.data.datasets[0].data.reduce((sum, value) => sum + value, 0)
  
  props.data.datasets[0].data.forEach((value, index) => {
    const sliceAngle = (value / total) * 2 * Math.PI
    const endAngle = currentAngle + sliceAngle
    
    // Create gradient
    const gradient = ctx.value.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, radius)
    const color = props.gradientColors[index % props.gradientColors.length] || themeColors.value.primary
    gradient.addColorStop(0, color)
    gradient.addColorStop(1, color + '80')
    
    // Draw slice
    ctx.value.beginPath()
    ctx.value.arc(centerX, centerY, radius, currentAngle, endAngle)
    ctx.value.arc(centerX, centerY, innerRadius, endAngle, currentAngle, true)
    ctx.value.closePath()
    ctx.value.fillStyle = gradient
    ctx.value.fill()
    
    // Add stroke
    ctx.value.strokeStyle = themeColors.value.background
    ctx.value.lineWidth = 2
    ctx.value.stroke()
    
    currentAngle = endAngle
  })
}

const drawScatterChart = () => {
  if (!ctx.value || !props.data.datasets.length) return
  
  const padding = 40
  const chartWidth = canvasWidth.value - padding * 2
  const chartHeight = canvasHeight.value - padding * 2
  
  // Draw grid
  if (props.showGrid) {
    drawGrid(padding, chartWidth, chartHeight)
  }
  
  props.data.datasets.forEach((dataset) => {
    dataset.data.forEach((value, index) => {
      const x = padding + (index / (dataset.data.length - 1)) * chartWidth
      const y = padding + chartHeight - (value / Math.max(...dataset.data)) * chartHeight
      
      // Draw point
      ctx.value.beginPath()
      ctx.value.arc(x, y, 6, 0, 2 * Math.PI)
      ctx.value.fillStyle = dataset.backgroundColor || themeColors.value.primary
      ctx.value.fill()
      ctx.value.strokeStyle = themeColors.value.background
      ctx.value.lineWidth = 2
      ctx.value.stroke()
    })
  })
}

const drawGrid = (padding: number, chartWidth: number, chartHeight: number) => {
  if (!ctx.value) return
  
  ctx.value.strokeStyle = themeColors.value.grid
  ctx.value.lineWidth = 1
  
  // Vertical grid lines
  for (let i = 0; i <= 10; i++) {
    const x = padding + (i / 10) * chartWidth
    ctx.value.beginPath()
    ctx.value.moveTo(x, padding)
    ctx.value.lineTo(x, padding + chartHeight)
    ctx.value.stroke()
  }
  
  // Horizontal grid lines
  for (let i = 0; i <= 5; i++) {
    const y = padding + (i / 5) * chartHeight
    ctx.value.beginPath()
    ctx.value.moveTo(padding, y)
    ctx.value.lineTo(padding + chartWidth, y)
    ctx.value.stroke()
  }
}

const generateLegend = () => {
  legend.value = props.data.datasets.map((dataset, index) => ({
    label: dataset.label,
    color: dataset.borderColor || dataset.backgroundColor || props.gradientColors[index % props.gradientColors.length] || themeColors.value.primary
  }))
}

// Watch for data changes
watch(() => props.data, () => {
  initChart()
}, { deep: true })

watch(() => props.variant, () => {
  initChart()
})

// Lifecycle
onMounted(() => {
  initChart()
})

onUnmounted(() => {
  if (chartInstance.value) {
    chartInstance.value = null
  }
})
</script>

<style scoped>
.base-chart {
  position: relative;
  width: 100%;
  border-radius: var(--chart-border-radius, 8px);
  background: var(--chart-background, #ffffff);
  padding: 1rem;
  transition: all 0.3s ease;
}

/* Loading State */
.chart-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: var(--chart-text-color, #666);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--chart-primary-color, #2196f3);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.loading-text {
  font-size: 0.9rem;
  margin: 0;
}

/* Error State */
.chart-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: var(--chart-error-color, #f44336);
}

.error-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.error-text {
  font-size: 0.9rem;
  margin: 0 0 1rem;
  text-align: center;
}

.retry-button {
  padding: 0.5rem 1rem;
  background: var(--chart-primary-color, #2196f3);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

/* Chart Container */
.chart-container {
  position: relative;
}

.chart-container canvas {
  width: 100%;
  height: auto;
  display: block;
}

/* Legend */
.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--chart-border-color, rgba(0, 0, 0, 0.1));
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--chart-text-color, #666);
}

.legend-indicator {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background: var(--legend-color);
}

.legend-value {
  font-weight: 600;
  color: var(--chart-text-color, #333);
}

/* Controls */
.chart-controls {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--chart-border-color, rgba(0, 0, 0, 0.1));
}

.time-controls {
  display: flex;
  gap: 0.5rem;
}

.control-btn {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid var(--chart-border-color, rgba(0, 0, 0, 0.2));
  border-radius: 4px;
  color: var(--chart-text-color, #666);
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background: var(--chart-hover-background, rgba(0, 0, 0, 0.05));
}

.control-btn.active {
  background: var(--chart-primary-color, #2196f3);
  color: white;
  border-color: var(--chart-primary-color, #2196f3);
}

/* Theme Variants */

/* Modern */
.base-chart--modern {
  --chart-background: #ffffff;
  --chart-border-radius: 12px;
  --chart-primary-color: #2196f3;
  --chart-text-color: #333;
  --chart-border-color: rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

/* Cyberpunk */
.base-chart--cyberpunk {
  --chart-background: rgba(0, 0, 0, 0.85);
  --chart-border-radius: 0;
  --chart-primary-color: #00ffff;
  --chart-text-color: #00ffff;
  --chart-border-color: rgba(0, 255, 255, 0.3);
  --chart-error-color: #ff006e;
  border: 1px solid #00ffff;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
}

/* Glassmorphism */
.base-chart--glassmorphism {
  --chart-background: rgba(255, 255, 255, 0.1);
  --chart-border-radius: 16px;
  --chart-primary-color: rgba(33, 150, 243, 0.8);
  --chart-text-color: rgba(0, 0, 0, 0.8);
  --chart-border-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

/* Neumorphism */
.base-chart--neumorphism {
  --chart-background: #e6e6e6;
  --chart-border-radius: 20px;
  --chart-primary-color: #667eea;
  --chart-text-color: #333;
  --chart-border-color: rgba(0, 0, 0, 0.1);
  box-shadow: 20px 20px 60px #bebebe, -20px -20px 60px #ffffff;
  border: none;
}

/* Minimalist */
.base-chart--minimalist {
  --chart-background: #ffffff;
  --chart-border-radius: 0;
  --chart-primary-color: #000000;
  --chart-text-color: #000000;
  --chart-border-color: rgba(0, 0, 0, 0.2);
  border: 1px solid #e0e0e0;
  box-shadow: none;
}

/* Stylish */
.base-chart--stylish {
  --chart-background: #ffffff;
  --chart-border-radius: 24px;
  --chart-primary-color: #667eea;
  --chart-text-color: #333;
  --chart-border-color: rgba(102, 126, 234, 0.1);
  box-shadow: 0 8px 40px rgba(102, 126, 234, 0.15);
  border: none;
}

/* Retro */
.base-chart--retro {
  --chart-background: linear-gradient(145deg, #2a0845, #1a0330);
  --chart-border-radius: 0;
  --chart-primary-color: #ff006e;
  --chart-text-color: #ffffff;
  --chart-border-color: rgba(255, 0, 110, 0.3);
  --chart-error-color: #8338ec;
  border: 2px solid #ff006e;
  box-shadow: 0 0 30px rgba(255, 0, 110, 0.3);
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .chart-legend {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .time-controls {
    flex-wrap: wrap;
  }
  
  .control-btn {
    flex: 1;
    min-width: 60px;
  }
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  .base-chart--modern,
  .base-chart--minimalist,
  .base-chart--stylish {
    --chart-background: #1e1e1e;
    --chart-text-color: #ffffff;
    --chart-border-color: rgba(255, 255, 255, 0.1);
  }
}

/* High Contrast */
@media (prefers-contrast: high) {
  .base-chart {
    border: 2px solid currentColor;
  }
  
  .chart-legend {
    border-top-color: currentColor;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .base-chart {
    transition: none;
  }
  
  .loading-spinner {
    animation: none;
  }
}
</style>