<template>
  <div class="style-showcase">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="gradient-text">Instagram Scheduler</span>
          <br>
          7 Beautiful UI Styles
        </h1>
        <p class="hero-description">
          Discover the perfect design aesthetic for your Instagram scheduling app. 
          From modern minimalism to cyberpunk futurism, each style tells a unique story.
        </p>
        <div class="hero-actions">
          <button class="cta-btn primary" @click="scrollToStyles">
            <i class="mdi mdi-palette"></i>
            Explore Styles
          </button>
          <button class="cta-btn secondary" @click="openComparison">
            <i class="mdi mdi-compare"></i>
            Compare All
          </button>
        </div>
      </div>
      
      <!-- Floating Preview Cards -->
      <div class="floating-previews">
        <div 
          v-for="(style, index) in featuredStyles" 
          :key="style.id"
          class="floating-card"
          :style="{ 
            '--delay': index * 0.2 + 's',
            '--offset': (index % 2 === 0 ? 1 : -1) * 20 + 'px'
          }"
          @click="previewStyle(style.id)"
        >
          <div class="card-preview" :class="`preview--${style.id}`">
            <i :class="style.icon"></i>
          </div>
          <span class="card-label">{{ style.name }}</span>
        </div>
      </div>
    </section>

    <!-- Statistics Section -->
    <section class="stats-section">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-item" v-for="stat in statistics" :key="stat.label">
            <div class="stat-icon">
              <i :class="stat.icon"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Styles Grid -->
    <section id="styles-section" class="styles-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Choose Your Perfect Style</h2>
          <p class="section-subtitle">
            Each design is carefully crafted with attention to detail, 
            accessibility, and user experience.
          </p>
        </div>

        <div class="filter-tabs">
          <button 
            v-for="filter in filterOptions" 
            :key="filter.value"
            :class="['filter-tab', { active: activeFilter === filter.value }]"
            @click="setFilter(filter.value)"
          >
            <i :class="filter.icon"></i>
            {{ filter.label }}
          </button>
        </div>

        <div class="styles-grid">
          <div 
            v-for="style in filteredStyles" 
            :key="style.id"
            class="style-showcase-card"
            :class="{ featured: style.featured }"
            @click="selectStyle(style.id)"
            :style="{ '--accent-color': style.color }"
          >
            <!-- Card Header -->
            <div class="card-header">
              <div class="style-meta">
                <span class="style-category">{{ style.category }}</span>
                <div class="style-rating">
                  <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= style.rating }">★</span>
                </div>
              </div>
              <div v-if="style.featured" class="featured-badge">
                <i class="mdi mdi-star"></i>
                Featured
              </div>
            </div>

            <!-- Style Preview -->
            <div class="style-preview-container">
              <div class="preview-mockup" :class="`mockup--${style.id}`">
                <div class="mockup-screen">
                  <div class="mockup-header">
                    <div class="mockup-dots">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                  <div class="mockup-content">
                    <component 
                      :is="getPreviewComponent(style.id)" 
                      class="preview-component"
                      :style="{ transform: 'scale(0.3)', transformOrigin: 'top left' }"
                    />
                  </div>
                </div>
              </div>
              
              <!-- Hover Actions -->
              <div class="preview-actions">
                <button class="action-btn" @click.stop="previewStyle(style.id)" title="Quick Preview">
                  <i class="mdi mdi-eye"></i>
                </button>
                <button class="action-btn" @click.stop="compareStyle(style.id)" title="Add to Compare">
                  <i class="mdi mdi-compare"></i>
                </button>
                <button class="action-btn" @click.stop="favoriteStyle(style.id)" title="Favorite">
                  <i :class="style.favorited ? 'mdi mdi-heart' : 'mdi mdi-heart-outline'"></i>
                </button>
              </div>
            </div>

            <!-- Card Content -->
            <div class="card-content">
              <h3 class="style-name">{{ style.name }}</h3>
              <p class="style-description">{{ style.description }}</p>
              
              <div class="style-tags">
                <span v-for="tag in style.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>

              <div class="style-metrics">
                <div class="metric">
                  <span class="metric-label">Performance</span>
                  <div class="metric-bar">
                    <div class="metric-fill" :style="{ width: style.performance + '%' }"></div>
                  </div>
                  <span class="metric-value">{{ style.performance }}%</span>
                </div>
                <div class="metric">
                  <span class="metric-label">Accessibility</span>
                  <div class="metric-bar">
                    <div class="metric-fill" :style="{ width: style.accessibility + '%' }"></div>
                  </div>
                  <span class="metric-value">{{ style.accessibility }}%</span>
                </div>
              </div>

              <button class="select-btn" @click.stop="selectStyle(style.id)">
                <i class="mdi mdi-arrow-right"></i>
                Explore {{ style.name }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="container">
        <h2 class="section-title">Why Our Designs Stand Out</h2>
        <div class="features-grid">
          <div v-for="feature in features" :key="feature.title" class="feature-card">
            <div class="feature-icon">
              <i :class="feature.icon"></i>
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Comparison Modal -->
    <div v-if="showComparison" class="comparison-modal" @click="closeComparison">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Style Comparison</h3>
          <button class="close-btn" @click="closeComparison">
            <i class="mdi mdi-close"></i>
          </button>
        </div>
        
        <div class="comparison-content">
          <div class="comparison-table">
            <div class="table-header">
              <div class="header-cell">Feature</div>
              <div 
                v-for="style in comparedStyles" 
                :key="style.id" 
                class="header-cell style-header"
              >
                <div class="style-avatar" :style="{ background: style.color }">
                  <i :class="style.icon"></i>
                </div>
                {{ style.name }}
              </div>
            </div>
            
            <div v-for="feature in comparisonFeatures" :key="feature.key" class="table-row">
              <div class="feature-cell">{{ feature.label }}</div>
              <div 
                v-for="style in comparedStyles" 
                :key="`${style.id}-${feature.key}`" 
                class="value-cell"
              >
                <component :is="getFeatureDisplay(feature.type, style[feature.key])" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <div v-if="showPreview" class="preview-modal" @click="closePreview">
      <div class="preview-content" @click.stop>
        <div class="preview-header">
          <h3>{{ previewedStyle?.name }} Preview</h3>
          <div class="preview-actions">
            <button class="preview-btn" @click="selectStyle(previewedStyle?.id)">
              <i class="mdi mdi-arrow-right"></i>
              Select This Style
            </button>
            <button class="close-btn" @click="closePreview">
              <i class="mdi mdi-close"></i>
            </button>
          </div>
        </div>
        <div class="preview-frame">
          <component 
            v-if="previewedStyle" 
            :is="getPreviewComponent(previewedStyle.id)" 
            class="preview-demo"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

interface Style {
  id: string
  name: string
  description: string
  category: string
  icon: string
  color: string
  tags: string[]
  rating: number
  performance: number
  accessibility: number
  featured?: boolean
  favorited?: boolean
  usability: number
  innovation: number
  aesthetics: number
}

const router = useRouter()

// Reactive state
const activeFilter = ref('all')
const showComparison = ref(false)
const showPreview = ref(false)
const previewedStyle = ref<Style | null>(null)
const comparedStyles = ref<Style[]>([])

// Data
const statistics = [
  { icon: 'mdi-palette', value: '7', label: 'Unique Styles' },
  { icon: 'mdi-speedometer', value: '95%', label: 'Avg Performance' },
  { icon: 'mdi-eye', value: '100%', label: 'Responsive' },
  { icon: 'mdi-shield-check', value: 'AA+', label: 'Accessibility' }
]

const filterOptions = [
  { value: 'all', label: 'All Styles', icon: 'mdi-view-grid' },
  { value: 'professional', label: 'Professional', icon: 'mdi-briefcase' },
  { value: 'creative', label: 'Creative', icon: 'mdi-brush' },
  { value: 'modern', label: 'Modern', icon: 'mdi-star' },
  { value: 'experimental', label: 'Experimental', icon: 'mdi-flask' }
]

const features = [
  {
    icon: 'mdi-responsive',
    title: 'Fully Responsive',
    description: 'Perfect adaptation to all screen sizes from mobile to desktop'
  },
  {
    icon: 'mdi-wheelchair-accessibility',
    title: 'Accessible Design',
    description: 'WCAG 2.1 AA compliant with keyboard navigation and screen reader support'
  },
  {
    icon: 'mdi-speedometer',
    title: 'High Performance',
    description: 'Optimized animations and efficient CSS for lightning-fast loading'
  },
  {
    icon: 'mdi-palette',
    title: 'Design System',
    description: 'Consistent components and patterns across all interface elements'
  },
  {
    icon: 'mdi-heart',
    title: 'User Experience',
    description: 'Intuitive interactions and smooth user journeys'
  },
  {
    icon: 'mdi-code-tags',
    title: 'Clean Code',
    description: 'Well-structured, maintainable Vue.js components with TypeScript'
  }
]

const styles: Style[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean, contemporary design with subtle shadows and excellent typography',
    category: 'Professional',
    icon: 'mdi-star',
    color: '#2196f3',
    tags: ['Professional', 'Clean', 'Versatile'],
    rating: 5,
    performance: 95,
    accessibility: 90,
    usability: 95,
    innovation: 80,
    aesthetics: 90,
    featured: true
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Futuristic neon design with glitch effects and high-tech aesthetics',
    category: 'Creative',
    icon: 'mdi-lightning-bolt',
    color: '#00ffff',
    tags: ['Futuristic', 'Bold', 'Gaming'],
    rating: 4,
    performance: 75,
    accessibility: 70,
    usability: 80,
    innovation: 95,
    aesthetics: 95
  },
  {
    id: 'glassmorphism',
    name: 'Glassmorphism',
    description: 'Translucent glass-like effects with backdrop blur for modern appeal',
    category: 'Modern',
    icon: 'mdi-rectangle-outline',
    color: 'rgba(255,255,255,0.3)',
    tags: ['Trendy', 'Elegant', 'iOS-like'],
    rating: 4,
    performance: 80,
    accessibility: 85,
    usability: 88,
    innovation: 85,
    aesthetics: 92,
    featured: true
  },
  {
    id: 'neumorphism',
    name: 'Neumorphism',
    description: 'Soft 3D effects with subtle depth and tactile visual language',
    category: 'Experimental',
    icon: 'mdi-circle-outline',
    color: '#e6e6e6',
    tags: ['Soft', '3D', 'Tactile'],
    rating: 3,
    performance: 85,
    accessibility: 75,
    usability: 75,
    innovation: 90,
    aesthetics: 85
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Ultra-clean design focusing on content with maximum simplicity',
    category: 'Professional',
    icon: 'mdi-minus',
    color: '#000000',
    tags: ['Simple', 'Content-focused', 'Fast'],
    rating: 5,
    performance: 100,
    accessibility: 95,
    usability: 90,
    innovation: 70,
    aesthetics: 85,
    featured: true
  },
  {
    id: 'stylish',
    name: 'Stylish',
    description: 'Elegant design with premium aesthetics and sophisticated details',
    category: 'Professional',
    icon: 'mdi-diamond',
    color: '#667eea',
    tags: ['Premium', 'Elegant', 'Sophisticated'],
    rating: 5,
    performance: 90,
    accessibility: 90,
    usability: 92,
    innovation: 85,
    aesthetics: 95
  },
  {
    id: 'retro',
    name: 'Retro-Futuristic',
    description: '80s-inspired design with neon colors and nostalgic future vision',
    category: 'Creative',
    icon: 'mdi-triangle',
    color: '#ff006e',
    tags: ['Retro', '80s', 'Nostalgic'],
    rating: 4,
    performance: 80,
    accessibility: 75,
    usability: 85,
    innovation: 88,
    aesthetics: 90
  }
]

const comparisonFeatures = [
  { key: 'performance', label: 'Performance Score', type: 'percentage' },
  { key: 'accessibility', label: 'Accessibility', type: 'percentage' },
  { key: 'usability', label: 'Usability', type: 'percentage' },
  { key: 'innovation', label: 'Innovation', type: 'percentage' },
  { key: 'aesthetics', label: 'Aesthetics', type: 'percentage' },
  { key: 'rating', label: 'Overall Rating', type: 'stars' }
]

// Computed
const featuredStyles = computed(() => styles.filter(s => s.featured).slice(0, 3))

const filteredStyles = computed(() => {
  if (activeFilter.value === 'all') return styles
  return styles.filter(style => 
    style.category.toLowerCase() === activeFilter.value ||
    style.tags.some(tag => tag.toLowerCase().includes(activeFilter.value))
  )
})

// Methods
const getPreviewComponent = (styleId: string) => {
  const componentMap: Record<string, string> = {
    modern: 'ModernDashboard',
    cyberpunk: 'CyberpunkDashboard',
    glassmorphism: 'GlassmorphismDashboard',
    neumorphism: 'NeumorphismDashboard',
    minimalist: 'MinimalistDashboard',
    stylish: 'StylishDashboard',
    retro: 'RetroFuturisticDashboard'
  }
  return componentMap[styleId] || 'ModernDashboard'
}

const getFeatureDisplay = (type: string, value: any) => {
  if (type === 'percentage') {
    return { template: `<div class="percentage-display">${value}%</div>` }
  }
  if (type === 'stars') {
    const stars = '★'.repeat(value) + '☆'.repeat(5 - value)
    return { template: `<div class="stars-display">${stars}</div>` }
  }
  return { template: `<div>${value}</div>` }
}

const setFilter = (filter: string) => {
  activeFilter.value = filter
}

const selectStyle = (styleId: string) => {
  router.push({
    name: 'DemoNavigation',
    query: { style: styleId, page: 'Dashboard', mode: 'single' }
  })
}

const previewStyle = (styleId: string) => {
  previewedStyle.value = styles.find(s => s.id === styleId) || null
  showPreview.value = true
}

const compareStyle = (styleId: string) => {
  const style = styles.find(s => s.id === styleId)
  if (style && !comparedStyles.value.includes(style)) {
    if (comparedStyles.value.length < 4) {
      comparedStyles.value.push(style)
    } else {
      comparedStyles.value = [style]
    }
  }
}

const favoriteStyle = (styleId: string) => {
  const style = styles.find(s => s.id === styleId)
  if (style) {
    style.favorited = !style.favorited
  }
}

const openComparison = () => {
  if (comparedStyles.value.length === 0) {
    comparedStyles.value = styles.slice(0, 3)
  }
  showComparison.value = true
}

const closeComparison = () => {
  showComparison.value = false
}

const closePreview = () => {
  showPreview.value = false
  previewedStyle.value = null
}

const scrollToStyles = () => {
  const element = document.getElementById('styles-section')
  element?.scrollIntoView({ behavior: 'smooth' })
}

// Lifecycle
onMounted(() => {
  // Add entrance animations
  const cards = document.querySelectorAll('.floating-card')
  cards.forEach((card, index) => {
    setTimeout(() => {
      card.classList.add('animate-in')
    }, index * 200)
  })
})
</script>

<style scoped>
/* Base Styles */
.style-showcase {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Hero Section */
.hero-section {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  color: white;
  text-align: center;
}

.hero-content {
  z-index: 2;
  max-width: 800px;
  padding: 2rem;
}

.hero-title {
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 800;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.gradient-text {
  background: linear-gradient(45deg, #ffffff, #f0f8ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.cta-btn.primary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.cta-btn.primary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.cta-btn.secondary {
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.cta-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: white;
}

/* Floating Previews */
.floating-previews {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.floating-card {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  pointer-events: auto;
  animation: float 6s ease-in-out infinite;
  opacity: 0;
  transform: translateY(50px);
  transition: all 0.5s ease;
}

.floating-card.animate-in {
  opacity: 0.7;
  transform: translateY(0);
}

.floating-card:hover {
  opacity: 1;
  transform: translateY(-10px) scale(1.1);
}

.floating-card:nth-child(1) { top: 20%; left: 10%; animation-delay: 0s; }
.floating-card:nth-child(2) { top: 30%; right: 15%; animation-delay: 2s; }
.floating-card:nth-child(3) { bottom: 25%; left: 15%; animation-delay: 4s; }

.card-preview {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.preview--modern { background: linear-gradient(45deg, #2196f3, #90caf9); }
.preview--cyberpunk { background: linear-gradient(45deg, #00ffff, #ff006e); }
.preview--glassmorphism { background: rgba(255, 255, 255, 0.2); }

.card-label {
  font-size: 0.9rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Statistics Section */
.stats-section {
  padding: 4rem 0;
  background: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-align: left;
}

.stat-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 800;
  color: #2c3e50;
  line-height: 1;
}

.stat-label {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin-top: 0.25rem;
}

/* Styles Section */
.styles-section {
  padding: 6rem 0;
  background: #f8f9fa;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.section-subtitle {
  font-size: 1.2rem;
  color: #7f8c8d;
  max-width: 600px;
  margin: 0 auto;
}

/* Filter Tabs */
.filter-tabs {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  border: 2px solid transparent;
  border-radius: 25px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.filter-tab:hover {
  border-color: rgba(102, 126, 234, 0.3);
  color: #667eea;
}

.filter-tab.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

/* Styles Grid */
.styles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 2rem;
}

.style-showcase-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: relative;
}

.style-showcase-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
}

.style-showcase-card.featured {
  border: 2px solid #667eea;
}

.style-showcase-card.featured::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
}

/* Card Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.style-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.style-category {
  font-size: 0.8rem;
  color: #666;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
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

.featured-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Style Preview */
.style-preview-container {
  position: relative;
  height: 250px;
  background: #f8f9fa;
  overflow: hidden;
}

.preview-mockup {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.mockup-screen {
  width: 100%;
  max-width: 300px;
  height: 200px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
}

.mockup-header {
  height: 30px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  padding: 0 0.75rem;
  border-bottom: 1px solid #e0e0e0;
}

.mockup-dots {
  display: flex;
  gap: 0.25rem;
}

.mockup-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ddd;
}

.mockup-dots span:nth-child(1) { background: #ff5f56; }
.mockup-dots span:nth-child(2) { background: #ffbd2e; }
.mockup-dots span:nth-child(3) { background: #27ca3f; }

.mockup-content {
  height: calc(100% - 30px);
  overflow: hidden;
  position: relative;
}

.preview-component {
  pointer-events: none;
  width: 333.33%;
  height: 333.33%;
}

/* Preview Actions */
.preview-actions {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.style-showcase-card:hover .preview-actions {
  opacity: 1;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.action-btn:hover {
  background: white;
  color: #667eea;
  transform: scale(1.1);
}

/* Card Content */
.card-content {
  padding: 1.5rem;
}

.style-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.style-description {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.style-tags {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.tag {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

/* Style Metrics */
.style-metrics {
  margin-bottom: 1.5rem;
}

.metric {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.metric-label {
  font-size: 0.85rem;
  color: #666;
  min-width: 80px;
  font-weight: 500;
}

.metric-bar {
  flex: 1;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.metric-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-color, #667eea), rgba(102, 126, 234, 0.7));
  transition: width 0.3s ease;
}

.metric-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--accent-color, #667eea);
  min-width: 40px;
  text-align: right;
}

/* Select Button */
.select-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: linear-gradient(45deg, var(--accent-color, #667eea), rgba(102, 126, 234, 0.8));
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.select-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}

/* Features Section */
.features-section {
  padding: 6rem 0;
  background: white;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.feature-card {
  text-align: center;
  padding: 2rem;
}

.feature-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  margin: 0 auto 1.5rem;
}

.feature-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.feature-description {
  color: #666;
  line-height: 1.6;
}

/* Comparison Modal */
.comparison-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-content {
  background: white;
  border-radius: 20px;
  max-width: 1000px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0.25rem;
}

.comparison-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.comparison-table {
  display: grid;
  grid-template-columns: 200px repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.table-header {
  display: contents;
}

.header-cell {
  font-weight: 700;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.style-header {
  flex-direction: column;
  gap: 0.5rem;
}

.style-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.table-row {
  display: contents;
}

.feature-cell,
.value-cell {
  padding: 1rem;
  border-radius: 8px;
  background: white;
  border: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.feature-cell {
  font-weight: 600;
  background: #f8f9fa;
  justify-content: flex-start;
}

/* Preview Modal */
.preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.preview-content {
  background: white;
  border-radius: 20px;
  max-width: 1200px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e9ecef;
}

.preview-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.preview-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.preview-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preview-btn:hover {
  background: #5a6fd8;
}

.preview-frame {
  flex: 1;
  overflow: auto;
  background: #f8f9fa;
}

.preview-demo {
  width: 100%;
  min-height: 600px;
}

/* Animations */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(var(--offset, -20px)); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-description {
    font-size: 1.1rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .floating-previews {
    display: none;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .styles-grid {
    grid-template-columns: 1fr;
  }
  
  .comparison-table {
    grid-template-columns: 150px repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.5rem;
  }
  
  .container {
    padding: 0 1rem;
  }
  
  .modal-content,
  .preview-content {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .style-showcase-card,
  .feature-card,
  .action-btn {
    border: 2px solid currentColor;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
  
  .floating-card {
    position: static;
    opacity: 1;
    transform: none;
  }
}
</style>