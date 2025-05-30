<template>
  <div class="demo-navigation" :class="navigationClasses">
    <!-- Navigation Header -->
    <header class="nav-header">
      <div class="header-content">
        <div class="logo-section">
          <div class="demo-logo">
            <i class="mdi mdi-palette"></i>
            <span class="logo-text">UI Style Showcase</span>
          </div>
          <p class="tagline">7 Beautiful Instagram App Designs</p>
        </div>
        
        <div class="header-actions">
          <!-- View Mode Toggle -->
          <div class="view-mode-toggle">
            <button 
              v-for="mode in viewModes" 
              :key="mode.value"
              :class="['mode-btn', { active: currentViewMode === mode.value }]"
              @click="setViewMode(mode.value)"
              :title="mode.tooltip"
            >
              <i :class="mode.icon"></i>
              <span class="mode-label">{{ mode.label }}</span>
            </button>
          </div>
          
          <!-- Theme Toggle -->
          <button class="theme-toggle" @click="toggleDarkMode" :title="darkMode ? 'Light Mode' : 'Dark Mode'">
            <i :class="darkMode ? 'mdi mdi-weather-sunny' : 'mdi mdi-weather-night'"></i>
          </button>
          
          <!-- Fullscreen Toggle -->
          <button class="fullscreen-btn" @click="toggleFullscreen" title="Toggle Fullscreen">
            <i :class="isFullscreen ? 'mdi mdi-fullscreen-exit' : 'mdi mdi-fullscreen'"></i>
          </button>
        </div>
      </div>
    </header>

    <!-- Style Selector -->
    <nav class="style-selector" v-show="currentViewMode !== 'comparison'">
      <div class="selector-content">
        <h3 class="selector-title">Choose Your Style</h3>
        <div class="style-grid">
          <div 
            v-for="style in styleOptions" 
            :key="style.id"
            :class="['style-card', { 
              active: currentStyle === style.id,
              'coming-soon': style.comingSoon 
            }]"
            @click="selectStyle(style.id)"
            :style="{ '--accent-color': style.color }"
          >
            <div class="style-preview">
              <div :class="['preview-icon', `preview-icon--${style.id}`]">
                <i :class="style.icon"></i>
              </div>
              <div v-if="style.comingSoon" class="coming-soon-badge">Soon</div>
            </div>
            <div class="style-info">
              <h4 class="style-name">{{ style.name }}</h4>
              <p class="style-description">{{ style.description }}</p>
              <div class="style-tags">
                <span v-for="tag in style.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Page Selector -->
    <nav class="page-selector" v-show="currentViewMode === 'single' && currentStyle">
      <div class="selector-content">
        <h3 class="selector-title">Select Page</h3>
        <div class="page-tabs">
          <button 
            v-for="page in pageOptions" 
            :key="page.id"
            :class="['page-tab', { active: currentPage === page.id }]"
            @click="selectPage(page.id)"
          >
            <i :class="page.icon"></i>
            <span>{{ page.name }}</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <button class="action-btn" @click="refreshDemo" title="Refresh Demo">
        <i class="mdi mdi-refresh"></i>
      </button>
      <button class="action-btn" @click="shareDemo" title="Share Demo">
        <i class="mdi mdi-share"></i>
      </button>
      <button class="action-btn" @click="exportDemo" title="Export Code">
        <i class="mdi mdi-code-tags"></i>
      </button>
      <button class="action-btn" @click="showInfo = !showInfo" title="Show Info">
        <i class="mdi mdi-information"></i>
      </button>
    </div>

    <!-- Demo Content -->
    <main class="demo-content">
      <!-- Single View -->
      <div v-if="currentViewMode === 'single'" class="single-view">
        <component 
          :is="currentComponent" 
          :key="componentKey"
          class="demo-component"
        />
      </div>

      <!-- Split View -->
      <div v-else-if="currentViewMode === 'split'" class="split-view">
        <div class="split-panel" v-for="style in selectedStyles" :key="style">
          <div class="split-header">
            <h4>{{ getStyleName(style) }}</h4>
            <button @click="removeFromSplit(style)" class="remove-btn">
              <i class="mdi mdi-close"></i>
            </button>
          </div>
          <component 
            :is="getComponentName(style, currentPage)" 
            class="split-component"
            :style="{ transform: `scale(${splitScale})` }"
          />
        </div>
        
        <!-- Add Panel Button -->
        <div v-if="selectedStyles.length < 4" class="add-panel">
          <button @click="showStylePicker = true" class="add-panel-btn">
            <i class="mdi mdi-plus"></i>
            <span>Add Style</span>
          </button>
        </div>
      </div>

      <!-- Comparison View -->
      <div v-else-if="currentViewMode === 'comparison'" class="comparison-view">
        <div class="comparison-grid">
          <div 
            v-for="style in allStyles" 
            :key="style.id"
            class="comparison-item"
            @click="selectStyle(style.id)"
          >
            <div class="comparison-header">
              <h4>{{ style.name }}</h4>
              <div class="style-rating">
                <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= style.rating }">★</span>
              </div>
            </div>
            <div class="comparison-preview">
              <component 
                :is="getComponentName(style.id, 'Dashboard')" 
                class="comparison-component"
                :style="{ transform: 'scale(0.3)', transformOrigin: 'top left' }"
              />
            </div>
            <div class="comparison-stats">
              <div class="stat">
                <span class="stat-label">Performance</span>
                <div class="stat-bar">
                  <div class="stat-fill" :style="{ width: style.performance + '%' }"></div>
                </div>
              </div>
              <div class="stat">
                <span class="stat-label">Accessibility</span>
                <div class="stat-bar">
                  <div class="stat-fill" :style="{ width: style.accessibility + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Style Picker Modal -->
    <div v-if="showStylePicker" class="modal-overlay" @click="showStylePicker = false">
      <div class="modal-content" @click.stop>
        <h3>Add Style to Comparison</h3>
        <div class="picker-grid">
          <button 
            v-for="style in availableStyles" 
            :key="style.id"
            class="picker-option"
            @click="addToSplit(style.id)"
          >
            <i :class="style.icon"></i>
            <span>{{ style.name }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Info Panel -->
    <aside v-if="showInfo" class="info-panel">
      <div class="info-header">
        <h3>Style Information</h3>
        <button @click="showInfo = false" class="close-btn">
          <i class="mdi mdi-close"></i>
        </button>
      </div>
      <div class="info-content">
        <div v-if="currentStyleInfo" class="style-details">
          <h4>{{ currentStyleInfo.name }}</h4>
          <p>{{ currentStyleInfo.longDescription }}</p>
          
          <div class="tech-specs">
            <h5>Technical Specifications</h5>
            <ul>
              <li v-for="spec in currentStyleInfo.specs" :key="spec">{{ spec }}</li>
            </ul>
          </div>
          
          <div class="use-cases">
            <h5>Best For</h5>
            <ul>
              <li v-for="useCase in currentStyleInfo.useCases" :key="useCase">{{ useCase }}</li>
            </ul>
          </div>
        </div>
      </div>
    </aside>

    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Loading demo...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

interface StyleOption {
  id: string
  name: string
  description: string
  longDescription: string
  icon: string
  color: string
  tags: string[]
  comingSoon?: boolean
  rating: number
  performance: number
  accessibility: number
  specs: string[]
  useCases: string[]
}

interface ViewMode {
  value: string
  label: string
  icon: string
  tooltip: string
}

interface PageOption {
  id: string
  name: string
  icon: string
}

// Reactive state
const currentStyle = ref('modern')
const currentPage = ref('Dashboard')
const currentViewMode = ref('single')
const selectedStyles = ref(['modern', 'cyberpunk'])
const showStylePicker = ref(false)
const showInfo = ref(false)
const darkMode = ref(false)
const isFullscreen = ref(false)
const loading = ref(false)

// Configuration
const viewModes: ViewMode[] = [
  { value: 'single', label: 'Single', icon: 'mdi-monitor', tooltip: 'View one style at a time' },
  { value: 'split', label: 'Split', icon: 'mdi-view-column', tooltip: 'Compare multiple styles' },
  { value: 'comparison', label: 'Compare', icon: 'mdi-compare', tooltip: 'Compare all styles' }
]

const styleOptions: StyleOption[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean, contemporary design with subtle shadows',
    longDescription: 'A contemporary design approach that emphasizes clean lines, subtle shadows, and excellent typography. Perfect for professional applications.',
    icon: 'mdi-star',
    color: '#2196f3',
    tags: ['Professional', 'Clean', 'Versatile'],
    rating: 5,
    performance: 95,
    accessibility: 90,
    specs: ['CSS Grid & Flexbox', 'Custom shadows', 'Responsive design'],
    useCases: ['Business apps', 'Dashboards', 'Professional platforms']
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Futuristic neon design with glitch effects',
    longDescription: 'A bold, futuristic aesthetic inspired by cyberpunk culture. Features neon colors, glitch effects, and high-tech visual elements.',
    icon: 'mdi-lightning-bolt',
    color: '#00ffff',
    tags: ['Futuristic', 'Bold', 'Gaming'],
    rating: 4,
    performance: 75,
    accessibility: 70,
    specs: ['CSS animations', 'Neon effects', 'Glitch animations'],
    useCases: ['Gaming platforms', 'Tech showcases', 'Creative portfolios']
  },
  {
    id: 'glassmorphism',
    name: 'Glassmorphism',
    description: 'Translucent glass-like effects with blur',
    longDescription: 'A modern design trend featuring translucent elements with backdrop blur effects, creating a frosted glass appearance.',
    icon: 'mdi-rectangle-outline',
    color: 'rgba(255,255,255,0.3)',
    tags: ['Trendy', 'Elegant', 'iOS-like'],
    rating: 4,
    performance: 80,
    accessibility: 85,
    specs: ['Backdrop-filter', 'Transparency', 'Layered design'],
    useCases: ['Mobile apps', 'Modern web apps', 'Creative interfaces']
  },
  {
    id: 'neumorphism',
    name: 'Neumorphism',
    description: 'Soft 3D effects with subtle depth',
    longDescription: 'Also known as "Soft UI", this style creates the illusion of extruded shapes through subtle shadows and highlights.',
    icon: 'mdi-circle-outline',
    color: '#e6e6e6',
    tags: ['Soft', '3D', 'Tactile'],
    rating: 3,
    performance: 85,
    accessibility: 75,
    specs: ['Multiple box-shadows', 'Monochromatic colors', 'Soft edges'],
    useCases: ['Touch interfaces', 'IoT dashboards', 'Creative apps']
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Ultra-clean design with maximum simplicity',
    longDescription: 'Stripped down to essentials, this style focuses on content and functionality with minimal visual distractions.',
    icon: 'mdi-minus',
    color: '#000000',
    tags: ['Simple', 'Content-focused', 'Fast'],
    rating: 5,
    performance: 100,
    accessibility: 95,
    specs: ['Minimal CSS', 'System fonts', 'High contrast'],
    useCases: ['Content platforms', 'Documentation', 'Reading apps']
  },
  {
    id: 'stylish',
    name: 'Stylish',
    description: 'Elegant design with premium aesthetics',
    longDescription: 'A sophisticated design approach with premium aesthetics, elegant typography, and refined visual hierarchy.',
    icon: 'mdi-diamond',
    color: '#667eea',
    tags: ['Premium', 'Elegant', 'Sophisticated'],
    rating: 5,
    performance: 90,
    accessibility: 90,
    specs: ['Custom gradients', 'Premium typography', 'Smooth animations'],
    useCases: ['Luxury brands', 'Portfolio sites', 'Premium services']
  },
  {
    id: 'retro',
    name: 'Retro-Futuristic',
    description: '80s-inspired neon and chrome effects',
    longDescription: 'Inspired by 1980s vision of the future, featuring neon colors, chrome effects, and retro-futuristic elements.',
    icon: 'mdi-triangle',
    color: '#ff006e',
    tags: ['Retro', '80s', 'Nostalgic'],
    rating: 4,
    performance: 80,
    accessibility: 75,
    specs: ['Gradient effects', 'Neon colors', 'Retro typography'],
    useCases: ['Entertainment', 'Gaming', 'Creative projects']
  }
]

const pageOptions: PageOption[] = [
  { id: 'Dashboard', name: 'Dashboard', icon: 'mdi-view-dashboard' },
  { id: 'LandingPage', name: 'Landing', icon: 'mdi-home' },
  { id: 'PostCreator', name: 'Create Post', icon: 'mdi-plus-circle' },
  { id: 'ScheduleManager', name: 'Schedule', icon: 'mdi-calendar' },
  { id: 'AccountManager', name: 'Accounts', icon: 'mdi-account-multiple' },
  { id: 'PricingPage', name: 'Pricing', icon: 'mdi-currency-usd' }
]

// Computed properties
const navigationClasses = computed(() => [
  'demo-navigation',
  `demo-navigation--${currentViewMode.value}`,
  {
    'demo-navigation--dark': darkMode.value,
    'demo-navigation--fullscreen': isFullscreen.value
  }
])

const currentComponent = computed(() => {
  if (!currentStyle.value || !currentPage.value) return null
  return getComponentName(currentStyle.value, currentPage.value)
})

const componentKey = computed(() => 
  `${currentStyle.value}-${currentPage.value}-${Date.now()}`
)

const allStyles = computed(() => styleOptions.filter(s => !s.comingSoon))

const availableStyles = computed(() => 
  styleOptions.filter(s => !s.comingSoon && !selectedStyles.value.includes(s.id))
)

const currentStyleInfo = computed(() => 
  styleOptions.find(s => s.id === currentStyle.value)
)

const splitScale = computed(() => {
  const count = selectedStyles.value.length
  if (count <= 1) return 1
  if (count <= 2) return 0.8
  if (count <= 4) return 0.6
  return 0.5
})

// Methods
const getComponentName = (style: string, page: string) => {
  const styleMap: Record<string, string> = {
    modern: 'Modern',
    cyberpunk: 'Cyberpunk',
    glassmorphism: 'Glassmorphism',
    neumorphism: 'Neumorphism',
    minimalist: 'Minimalist',
    stylish: 'Stylish',
    retro: 'RetroFuturistic'
  }
  
  const mappedStyle = styleMap[style] || 'Modern'
  return `${mappedStyle}${page}`
}

const getStyleName = (styleId: string) => {
  return styleOptions.find(s => s.id === styleId)?.name || styleId
}

const selectStyle = (styleId: string) => {
  if (styleOptions.find(s => s.id === styleId)?.comingSoon) return
  
  loading.value = true
  setTimeout(() => {
    currentStyle.value = styleId
    loading.value = false
  }, 300)
}

const selectPage = (pageId: string) => {
  loading.value = true
  setTimeout(() => {
    currentPage.value = pageId
    loading.value = false
  }, 200)
}

const setViewMode = (mode: string) => {
  currentViewMode.value = mode
}

const addToSplit = (styleId: string) => {
  if (selectedStyles.value.length < 4 && !selectedStyles.value.includes(styleId)) {
    selectedStyles.value.push(styleId)
  }
  showStylePicker.value = false
}

const removeFromSplit = (styleId: string) => {
  selectedStyles.value = selectedStyles.value.filter(id => id !== styleId)
}

const toggleDarkMode = () => {
  darkMode.value = !darkMode.value
  document.documentElement.classList.toggle('dark-mode', darkMode.value)
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

const refreshDemo = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

const shareDemo = () => {
  const url = `${window.location.origin}${window.location.pathname}?style=${currentStyle.value}&page=${currentPage.value}&mode=${currentViewMode.value}`
  navigator.clipboard.writeText(url)
  // Show toast notification
}

const exportDemo = () => {
  // Implementation for code export
  console.log('Export code for:', currentStyle.value, currentPage.value)
}

// Lifecycle
onMounted(() => {
  // Load from URL parameters
  const params = new URLSearchParams(window.location.search)
  if (params.get('style')) currentStyle.value = params.get('style')!
  if (params.get('page')) currentPage.value = params.get('page')!
  if (params.get('mode')) currentViewMode.value = params.get('mode')!
  
  // Handle fullscreen changes
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
})

// Watch for URL updates
watch([currentStyle, currentPage, currentViewMode], () => {
  const params = new URLSearchParams()
  params.set('style', currentStyle.value)
  params.set('page', currentPage.value)
  params.set('mode', currentViewMode.value)
  
  const newUrl = `${window.location.pathname}?${params.toString()}`
  window.history.replaceState(null, '', newUrl)
})
</script>

<style scoped>
/* Base Styles */
.demo-navigation {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
  overflow: hidden;
}

/* Header */
.nav-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.logo-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.demo-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
}

.demo-logo i {
  font-size: 2rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.tagline {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* View Mode Toggle */
.view-mode-toggle {
  display: flex;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  padding: 0.25rem;
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #666;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.mode-btn.active {
  background: white;
  color: #2c3e50;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mode-label {
  font-weight: 500;
}

/* Action Buttons */
.theme-toggle,
.fullscreen-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle:hover,
.fullscreen-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #333;
}

/* Style Selector */
.style-selector {
  padding: 2rem;
}

.selector-content {
  max-width: 1400px;
  margin: 0 auto;
}

.selector-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 2rem;
  text-align: center;
}

.style-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.style-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.style-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
}

.style-card.active {
  border-color: var(--accent-color);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.style-card.coming-soon {
  opacity: 0.6;
  cursor: not-allowed;
}

.style-preview {
  position: relative;
  margin-bottom: 1rem;
}

.preview-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  margin: 0 auto 1rem;
}

.preview-icon--modern { background: linear-gradient(45deg, #2196f3, #90caf9); }
.preview-icon--cyberpunk { background: linear-gradient(45deg, #00ffff, #ff006e); }
.preview-icon--glassmorphism { background: rgba(255, 255, 255, 0.3); backdrop-filter: blur(10px); }
.preview-icon--neumorphism { background: #e6e6e6; color: #333; box-shadow: 8px 8px 16px #bebebe, -8px -8px 16px #ffffff; }
.preview-icon--minimalist { background: #000; }
.preview-icon--stylish { background: linear-gradient(45deg, #667eea, #764ba2); }
.preview-icon--retro { background: linear-gradient(45deg, #ff006e, #8338ec); }

.coming-soon-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #ff9800;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
}

.style-info {
  text-align: center;
}

.style-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.style-description {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.style-tags {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  background: rgba(0, 0, 0, 0.05);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  color: #666;
}

/* Page Selector */
.page-selector {
  padding: 0 2rem 2rem;
}

.page-tabs {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.page-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  border: 2px solid transparent;
  border-radius: 12px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.page-tab:hover {
  background: #f8f9fa;
  border-color: rgba(0, 0, 0, 0.1);
}

.page-tab.active {
  background: #2196f3;
  color: white;
  border-color: #2196f3;
}

/* Quick Actions */
.quick-actions {
  position: fixed;
  top: 50%;
  right: 2rem;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 90;
}

.action-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: white;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #2196f3;
  color: white;
  transform: scale(1.1);
}

/* Demo Content */
.demo-content {
  padding: 2rem;
  min-height: calc(100vh - 200px);
}

.single-view {
  max-width: 1400px;
  margin: 0 auto;
}

.demo-component {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* Split View */
.split-view {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  max-width: 1400px;
  margin: 0 auto;
}

.split-panel {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.split-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.split-header h4 {
  margin: 0;
  font-weight: 600;
  color: #2c3e50;
}

.remove-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0.25rem;
}

.split-component {
  transform-origin: top left;
  width: 100%;
  overflow: hidden;
}

.add-panel {
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-panel-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem;
  background: transparent;
  border: 2px dashed #ccc;
  border-radius: 12px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 200px;
  width: 100%;
}

.add-panel-btn:hover {
  border-color: #2196f3;
  color: #2196f3;
}

/* Comparison View */
.comparison-view {
  max-width: 1600px;
  margin: 0 auto;
}

.comparison-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.comparison-item {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.comparison-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.comparison-header {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.comparison-header h4 {
  margin: 0;
  font-weight: 600;
}

.style-rating {
  display: flex;
  gap: 0.1rem;
}

.star {
  color: #ddd;
  font-size: 0.9rem;
}

.star.filled {
  color: #ffc107;
}

.comparison-preview {
  height: 200px;
  overflow: hidden;
  background: #f8f9fa;
  position: relative;
}

.comparison-component {
  pointer-events: none;
  width: 333.33%;
  height: 333.33%;
}

.comparison-stats {
  padding: 1rem;
}

.stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
}

.stat-bar {
  width: 100px;
  height: 4px;
  background: #e9ecef;
  border-radius: 2px;
  overflow: hidden;
}

.stat-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.picker-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.picker-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.picker-option:hover {
  background: #e9ecef;
}

/* Info Panel */
.info-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background: white;
  border-left: 1px solid #e9ecef;
  z-index: 200;
  overflow-y: auto;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.info-content {
  padding: 1rem;
}

.style-details h4 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.tech-specs,
.use-cases {
  margin-top: 1.5rem;
}

.tech-specs h5,
.use-cases h5 {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.tech-specs ul,
.use-cases ul {
  margin: 0;
  padding-left: 1rem;
}

.tech-specs li,
.use-cases li {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #666;
  cursor: pointer;
  padding: 0.25rem;
}

/* Loading */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2196f3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

/* Dark Mode */
.demo-navigation--dark {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d3748 100%);
  color: #ffffff;
}

.demo-navigation--dark .nav-header {
  background: rgba(0, 0, 0, 0.8);
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.demo-navigation--dark .style-card,
.demo-navigation--dark .split-panel,
.demo-navigation--dark .comparison-item {
  background: #2d3748;
  color: #ffffff;
}

/* Fullscreen */
.demo-navigation--fullscreen .nav-header {
  display: none;
}

.demo-navigation--fullscreen .style-selector,
.demo-navigation--fullscreen .page-selector {
  padding-top: 0;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .info-panel {
    width: 300px;
  }
}

@media (max-width: 768px) {
  .header-content {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }

  .view-mode-toggle {
    order: -1;
  }

  .mode-label {
    display: none;
  }

  .style-grid {
    grid-template-columns: 1fr;
  }

  .split-view {
    grid-template-columns: 1fr;
  }

  .comparison-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    position: relative;
    top: auto;
    right: auto;
    transform: none;
    flex-direction: row;
    justify-content: center;
    margin: 1rem 0;
  }

  .info-panel {
    width: 100%;
    height: auto;
    position: relative;
    border-left: none;
    border-top: 1px solid #e9ecef;
  }
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .style-card,
  .page-tab,
  .action-btn {
    border: 2px solid currentColor;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}
</style>