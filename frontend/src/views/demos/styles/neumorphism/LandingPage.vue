<template>
  <div class="neumorphism-landing" ref="landingRef">
    <!-- Organic Morphing Background -->
    <div class="organic-bg">
      <div class="morphing-waves">
        <div class="wave wave-1" :style="getWaveStyle(1)"></div>
        <div class="wave wave-2" :style="getWaveStyle(2)"></div>
        <div class="wave wave-3" :style="getWaveStyle(3)"></div>
      </div>
      <div class="organic-particles">
        <div v-for="i in 12" :key="i" class="organic-particle" :style="getParticleStyle(i)"></div>
      </div>
      <div class="breathing-aura"></div>
    </div>

    <!-- Soft 3D Navigation -->
    <nav class="soft-nav" :class="{ 'nav-elevated': scrolled }">
      <div class="nav-container">
        <div class="nav-brand" @click="scrollToTop">
          <div class="brand-morph">
            <div class="morph-core">
              <div class="core-layers">
                <div class="layer layer-1"></div>
                <div class="layer layer-2"></div>
                <div class="layer layer-3"></div>
              </div>
            </div>
          </div>
          <span class="brand-text">Omniy</span>
        </div>
        <div class="nav-menu">
          <a href="#capabilities" class="nav-item tactile-element" @click="smoothScroll">
            <span class="item-text">Capabilities</span>
            <div class="item-morph"></div>
          </a>
          <a href="#investment" class="nav-item tactile-element" @click="smoothScroll">
            <span class="item-text">Investment</span>
            <div class="item-morph"></div>
          </a>
          <button class="soft-btn nav-cta tactile-element" @click="getStarted">
            <div class="btn-morph"></div>
            <span class="btn-text">Begin Journey</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Biometric Hero Section -->
    <section class="hero-section" ref="heroSection">
      <div class="hero-container">
        <div class="hero-content">
          <!-- Organic Typography System -->
          <div class="typography-organic" :class="{ 'revealed': typographyRevealed }">
            <div class="subtitle-soft">
              <span class="subtitle-line">O R G A N I C</span>
              <span class="subtitle-accent">INSTAGRAM MASTERY</span>
            </div>
            
            <h1 class="hero-headline">
              <span class="headline-word">Breathe</span>
              <span class="headline-word highlight">Life</span>
              <span class="headline-word">Into Content</span>
            </h1>
            
            <p class="hero-description">
              Experience the most <span class="highlight-soft">natural and intuitive</span> 
              Instagram scheduling platform, designed with biometric precision 
              and organic responsiveness.
            </p>
          </div>

          <!-- Soft Metrics Ecosystem -->
          <div class="metrics-ecosystem" :class="{ 'revealed': metricsRevealed }">
            <div 
              v-for="(metric, index) in softMetrics" 
              :key="index"
              class="metric-cell"
              @mouseenter="metricTouch(index)"
              @mouseleave="metricLeave(index)"
              :class="{ 'cell-active': metric.active }"
            >
              <div class="cell-morph"></div>
              <div class="metric-content">
                <div class="metric-value">{{ metric.value }}</div>
                <div class="metric-label">{{ metric.label }}</div>
              </div>
              <div class="cell-ripple"></div>
            </div>
          </div>

          <!-- Tactile Actions -->
          <div class="actions-tactile" :class="{ 'revealed': actionsRevealed }">
            <button class="tactile-btn primary-tactile" @click="getStarted">
              <div class="tactile-bg"></div>
              <div class="tactile-content">
                <div class="tactile-icon">
                  <div class="icon-pulse"></div>
                </div>
                <span class="tactile-text">Touch Excellence</span>
              </div>
              <div class="tactile-aura"></div>
            </button>
            
            <button class="tactile-btn secondary-tactile" @click="watchDemo">
              <div class="tactile-bg"></div>
              <div class="tactile-content">
                <div class="tactile-icon">
                  <div class="icon-wave"></div>
                </div>
                <span class="tactile-text">Feel Demo</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Breathing Dashboard -->
        <div class="dashboard-bio" :class="{ 'revealed': dashboardRevealed }">
          <div class="bio-container">
            <div class="bio-surface">
              <div class="surface-header">
                <div class="bio-controls">
                  <div class="control-orb orb-1"></div>
                  <div class="control-orb orb-2"></div>
                  <div class="control-orb orb-3"></div>
                </div>
                <div class="surface-title">Biometric Interface</div>
              </div>
              <div class="surface-body">
                <div class="bio-metrics">
                  <div class="bio-metric" v-for="metric in bioMetrics" :key="metric.id">
                    <div class="metric-surface">
                      <div class="metric-display">{{ metric.value }}</div>
                      <div class="metric-name">{{ metric.name }}</div>
                    </div>
                    <div class="metric-pulse" :style="{ animationDelay: metric.delay }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Soft 3D Capabilities -->
    <section id="capabilities" class="capabilities-section">
      <div class="capabilities-container">
        <div class="section-header">
          <h2 class="section-headline">
            <span class="headline-prefix">T A C T I L E</span>
            <span class="headline-main">Capabilities</span>
          </h2>
          <p class="section-description">
            Feel the future of Instagram automation through biometric interfaces
          </p>
        </div>

        <div class="capabilities-grid">
          <div 
            v-for="(capability, index) in capabilities" 
            :key="index"
            class="capability-cell"
            @mouseenter="capabilityTouch(index)"
            @mouseleave="capabilityLeave(index)"
            :class="{ 'cell-touched': capability.active }"
          >
            <div class="cell-surface"></div>
            <div class="cell-depth"></div>
            
            <div class="capability-content">
              <div class="capability-icon-bio">
                <div class="icon-surface">
                  <div class="icon-core" :class="capability.iconClass">
                    <div class="core-pulse"></div>
                  </div>
                </div>
              </div>
              
              <h3 class="capability-title">{{ capability.title }}</h3>
              <p class="capability-description">{{ capability.description }}</p>
              
              <div class="capability-metrics">
                <div class="metric-display">
                  <span class="metric-value">{{ capability.performance }}</span>
                  <span class="metric-label">{{ capability.metric }}</span>
                </div>
                <div class="bio-tags">
                  <span 
                    v-for="tag in capability.technologies" 
                    :key="tag"
                    class="bio-tag"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="cell-breathing"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Organic Investment Tiers -->
    <section id="investment" class="investment-section">
      <div class="investment-container">
        <div class="section-header">
          <h2 class="section-headline">
            <span class="headline-prefix">I N V E S T M E N T</span>
            <span class="headline-main">Tiers</span>
          </h2>
          <p class="section-description">
            Choose your biometric access level
          </p>
        </div>

        <div class="investment-grid">
          <div 
            v-for="(tier, index) in investmentTiers" 
            :key="index"
            class="investment-cell"
            :class="{ 
              'cell-featured': tier.featured,
              'cell-active': tier.active 
            }"
            @mouseenter="tierTouch(index)"
            @mouseleave="tierLeave(index)"
          >
            <div class="cell-morph-deep"></div>
            <div class="cell-aura"></div>
            
            <div v-if="tier.featured" class="featured-pulse">
              <div class="pulse-core"></div>
              <span class="pulse-text">Optimal</span>
            </div>
            
            <div class="tier-content">
              <div class="tier-header">
                <h3 class="tier-name">{{ tier.name }}</h3>
                <div class="tier-pricing">
                  <span class="pricing-symbol">¥</span>
                  <span class="pricing-amount">{{ tier.price }}</span>
                  <span class="pricing-period">/month</span>
                </div>
              </div>
              
              <div class="tier-features">
                <div class="features-list">
                  <div 
                    v-for="(feature, fIndex) in tier.features" 
                    :key="fIndex"
                    class="feature-item"
                  >
                    <div class="feature-pulse">
                      <div class="pulse-dot"></div>
                    </div>
                    <span class="feature-text">{{ feature }}</span>
                  </div>
                </div>
              </div>
              
              <div class="tier-action">
                <button 
                  class="bio-btn"
                  :class="{ 'btn-featured': tier.featured }"
                  @click="selectTier(tier)"
                >
                  <div class="btn-surface"></div>
                  <span class="btn-content">{{ tier.cta }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Organic Call-to-Action -->
    <section class="organic-cta-section">
      <div class="organic-container">
        <div class="cta-surface">
          <div class="surface-breathing">
            <div v-for="i in 8" :key="i" class="breath-particle" :style="getBreathParticleStyle(i)"></div>
          </div>
          
          <div class="cta-content">
            <h2 class="cta-headline">
              <span class="headline-line">Ready to</span>
              <span class="headline-line highlight">Feel the Future?</span>
            </h2>
            <p class="cta-description">
              Join the biometric revolution of creators who experience Instagram like never before
            </p>
            
            <div class="cta-actions">
              <button class="ultimate-bio" @click="getStarted">
                <div class="bio-core"></div>
                <div class="bio-content">
                  <div class="bio-icon">
                    <div class="icon-breathing">
                      <div class="breath-center"></div>
                      <div class="breath-rings">
                        <div class="breath-ring"></div>
                        <div class="breath-ring"></div>
                        <div class="breath-ring"></div>
                      </div>
                    </div>
                  </div>
                  <span class="bio-text">Touch Excellence</span>
                </div>
                <div class="bio-aura"></div>
              </button>
              
              <div class="cta-assurance">
                <div class="assurance-pulse"></div>
                <span class="assurance-text">No commitment • Instant organic access</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

// Biometric reactive state
const landingRef = ref<HTMLElement | null>(null)
const heroSection = ref<HTMLElement | null>(null)
const scrolled = ref(false)
const typographyRevealed = ref(false)
const metricsRevealed = ref(false)
const actionsRevealed = ref(false)
const dashboardRevealed = ref(false)

// Organic data structures
const softMetrics = ref([
  { value: '3.2M+', label: 'Organic Reach', active: false },
  { value: '98.5%', label: 'Satisfaction', active: false },
  { value: '247%', label: 'Growth Rate', active: false },
  { value: '24/7', label: 'Bio Support', active: false }
])

const bioMetrics = ref([
  { id: 1, value: '94.7%', name: 'Engagement', delay: '0s' },
  { id: 2, value: '2.4K', name: 'Posts Active', delay: '0.5s' },
  { id: 3, value: '¥15.2K', name: 'Revenue', delay: '1s' }
])

const capabilities = ref([
  {
    title: 'Biometric Scheduling',
    description: 'Adaptive AI that learns from your organic posting patterns and biological rhythms to optimize engagement.',
    performance: '347%',
    metric: 'ENGAGEMENT_BOOST',
    technologies: ['Bio-AI', 'Rhythm-Sync', 'Organic-Learning'],
    iconClass: 'icon-bio-schedule',
    active: false
  },
  {
    title: 'Tactile Analytics',
    description: 'Feel your content performance through intuitive biometric feedback and organic data visualization.',
    performance: '99.2%',
    metric: 'ACCURACY_RATE', 
    technologies: ['Touch-Analytics', 'Bio-Feedback', 'Organic-Insights'],
    iconClass: 'icon-bio-analytics',
    active: false
  },
  {
    title: 'Organic Growth',
    description: 'Natural growth algorithms that mirror biological systems for sustainable and authentic expansion.',
    performance: '285%',
    metric: 'ORGANIC_GROWTH',
    technologies: ['Bio-Algorithms', 'Natural-Scaling', 'Organic-AI'],
    iconClass: 'icon-bio-growth',
    active: false
  }
])

const investmentTiers = ref([
  {
    name: 'Seedling',
    price: 29,
    featured: false,
    active: false,
    cta: 'Begin Growth',
    features: [
      '3 Organic Accounts',
      '500 Bio-Posts',
      'Basic Biometrics',
      'Natural Support',
      'Organic Analytics'
    ]
  },
  {
    name: 'Blooming',
    price: 79,
    featured: true,
    active: false,
    cta: 'Touch Excellence',
    features: [
      '10 Organic Accounts',
      'Unlimited Bio-Posts',
      'Advanced Biometrics',
      'Tactile Support',
      'Deep Bio-Analytics',
      'Organic Optimization'
    ]
  },
  {
    name: 'Flourishing',
    price: 199,
    featured: false,
    active: false,
    cta: 'Contact Bio-Team',
    features: [
      'Unlimited Accounts',
      'Enterprise Biometrics',
      'Custom Bio-AI',
      'Dedicated Bio-Manager',
      'Organic Enterprise',
      'Bio-API Access'
    ]
  }
])

// Organic interaction methods
const getWaveStyle = (index: number) => {
  const delays = ['0s', '2s', '4s']
  const scales = ['1', '1.2', '0.8']
  return {
    animationDelay: delays[index - 1] || '0s',
    transform: `scale(${scales[index - 1] || '1'})`
  }
}

const getParticleStyle = (index: number) => {
  const angle = (index / 12) * Math.PI * 2
  const radius = 30 + Math.random() * 40
  return {
    left: `${50 + Math.cos(angle) * radius}%`,
    top: `${50 + Math.sin(angle) * radius}%`,
    animationDelay: `${index * 0.3}s`,
    animationDuration: `${4 + Math.random() * 2}s`
  }
}

const getBreathParticleStyle = (index: number) => {
  const angle = (index / 8) * Math.PI * 2
  const radius = 20 + Math.random() * 30
  return {
    left: `${50 + Math.cos(angle) * radius}%`,
    top: `${50 + Math.sin(angle) * radius}%`,
    animationDelay: `${index * 0.4}s`,
    animationDuration: `${6 + Math.random() * 2}s`
  }
}

// Biometric interaction methods
const metricTouch = (index: number) => {
  softMetrics.value[index].active = true
}

const metricLeave = (index: number) => {
  softMetrics.value[index].active = false
}

const capabilityTouch = (index: number) => {
  capabilities.value[index].active = true
}

const capabilityLeave = (index: number) => {
  capabilities.value[index].active = false
}

const tierTouch = (index: number) => {
  investmentTiers.value[index].active = true
}

const tierLeave = (index: number) => {
  investmentTiers.value[index].active = false
}

const handleScroll = () => {
  scrolled.value = window.scrollY > 50
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const smoothScroll = (event: MouseEvent) => {
  event.preventDefault()
  const target = event.currentTarget as HTMLAnchorElement
  const href = target.getAttribute('href')
  if (href) {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }
}

const getStarted = () => {
  console.log('Biometric journey initiated')
}

const watchDemo = () => {
  console.log('Organic demo activated')
}

const selectTier = (tier: any) => {
  console.log('Investment tier selected:', tier.name)
}

// Organic reveal sequence
const initiateBiometricSequence = async () => {
  await nextTick()
  
  // Sequential organic reveals
  setTimeout(() => { typographyRevealed.value = true }, 400)
  setTimeout(() => { metricsRevealed.value = true }, 800)
  setTimeout(() => { actionsRevealed.value = true }, 1200)
  setTimeout(() => { dashboardRevealed.value = true }, 1600)
}

// Biometric lifecycle
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  
  // Initialize organic experience
  initiateBiometricSequence()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* Biometric CSS Architecture */
.neumorphism-landing {
  --organic-light: #f0f2f5;
  --organic-base: #e6e9ef;
  --organic-medium: #d1d9e6;
  --organic-dark: #bec8d9;
  --organic-shadow-light: rgba(255, 255, 255, 0.8);
  --organic-shadow-dark: rgba(163, 177, 198, 0.4);
  --organic-accent: #7c9cbf;
  --organic-highlight: #a8c0dc;
  --organic-pulse: #90a9c7;
  
  min-height: 100vh;
  background: 
    radial-gradient(ellipse at 20% 30%, rgba(124, 156, 191, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 70%, rgba(168, 192, 220, 0.1) 0%, transparent 50%),
    linear-gradient(135deg, var(--organic-light) 0%, var(--organic-base) 50%, var(--organic-medium) 100%);
  color: #6b7d99;
  font-family: 'Inter', 'SF Pro Display', system-ui, sans-serif;
  position: relative;
  overflow-x: hidden;
  
  /* Performance optimization */
  contain: layout style;
  will-change: auto;
}

/* Organic Morphing Background */
.organic-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.morphing-waves {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.wave {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse at center, rgba(124, 156, 191, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  animation: organicMorph 20s ease-in-out infinite;
}

.wave-1 {
  top: -20%;
  left: -20%;
  width: 80%;
  height: 80%;
}

.wave-2 {
  top: 20%;
  right: -20%;
  width: 60%;
  height: 60%;
  animation-direction: reverse;
}

.wave-3 {
  bottom: -20%;
  left: 10%;
  width: 70%;
  height: 70%;
  animation-delay: -10s;
}

@keyframes organicMorph {
  0%, 100% {
    transform: scale(1) rotate(0deg);
    border-radius: 50%;
  }
  25% {
    transform: scale(1.1) rotate(90deg);
    border-radius: 40% 60% 60% 40%;
  }
  50% {
    transform: scale(0.9) rotate(180deg);
    border-radius: 60% 40% 40% 60%;
  }
  75% {
    transform: scale(1.05) rotate(270deg);
    border-radius: 45% 55% 55% 45%;
  }
}

.organic-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.organic-particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: radial-gradient(circle, var(--organic-pulse) 0%, transparent 70%);
  border-radius: 50%;
  animation: particleBreathe 6s ease-in-out infinite;
}

@keyframes particleBreathe {
  0%, 100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.5);
    opacity: 1;
  }
}

.breathing-aura {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 400px;
  height: 400px;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(124, 156, 191, 0.05) 0%, transparent 70%);
  border-radius: 50%;
  animation: auraBreath 8s ease-in-out infinite;
}

@keyframes auraBreath {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.6;
  }
}

/* Soft 3D Navigation */
.soft-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 1.5rem 0;
  background: var(--organic-base);
  box-shadow: 
    inset 0 1px 0 var(--organic-shadow-light),
    0 20px 40px rgba(163, 177, 198, 0.1);
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.nav-elevated {
  background: rgba(230, 233, 239, 0.95);
  backdrop-filter: blur(20px);
  box-shadow: 
    inset 0 1px 0 var(--organic-shadow-light),
    0 25px 50px rgba(163, 177, 198, 0.2);
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.brand-morph {
  position: relative;
  width: 50px;
  height: 50px;
}

.morph-core {
  position: relative;
  width: 100%;
  height: 100%;
  background: var(--organic-base);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    8px 8px 16px var(--organic-shadow-dark),
    -8px -8px 16px var(--organic-shadow-light);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.nav-brand:hover .morph-core {
  box-shadow: 
    4px 4px 8px var(--organic-shadow-dark),
    -4px -4px 8px var(--organic-shadow-light);
  transform: scale(1.05);
}

.core-layers {
  position: relative;
  width: 30px;
  height: 30px;
}

.layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.layer-1 {
  background: linear-gradient(135deg, var(--organic-accent), var(--organic-highlight));
  transform: scale(1);
}

.layer-2 {
  background: linear-gradient(225deg, var(--organic-highlight), var(--organic-pulse));
  transform: scale(0.7);
  opacity: 0.8;
}

.layer-3 {
  background: linear-gradient(315deg, var(--organic-pulse), var(--organic-accent));
  transform: scale(0.4);
  opacity: 0.6;
}

.nav-brand:hover .layer-1 {
  transform: scale(1.1) rotate(15deg);
}

.nav-brand:hover .layer-2 {
  transform: scale(0.8) rotate(-10deg);
}

.nav-brand:hover .layer-3 {
  transform: scale(0.5) rotate(20deg);
}

.brand-text {
  font-size: 1.8rem;
  font-weight: 600;
  color: #6b7d99;
  text-shadow: 
    2px 2px 4px var(--organic-shadow-dark),
    -1px -1px 2px var(--organic-shadow-light);
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-item {
  position: relative;
  color: #6b7d99;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  background: var(--organic-base);
  box-shadow: 
    6px 6px 12px var(--organic-shadow-dark),
    -6px -6px 12px var(--organic-shadow-light);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow: hidden;
}

.tactile-element:hover {
  box-shadow: 
    3px 3px 6px var(--organic-shadow-dark),
    -3px -3px 6px var(--organic-shadow-light);
  transform: translateY(1px);
}

.tactile-element:active {
  box-shadow: 
    inset 3px 3px 6px var(--organic-shadow-dark),
    inset -3px -3px 6px var(--organic-shadow-light);
}

.item-text {
  position: relative;
  z-index: 2;
}

.item-morph {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(124, 156, 191, 0.1);
  border-radius: 25px;
  transform: scale(0);
  transition: transform 0.3s ease;
  z-index: 1;
}

.nav-item:hover .item-morph {
  transform: scale(1);
}

.soft-btn {
  position: relative;
  padding: 0.8rem 2rem;
  background: var(--organic-base);
  border: none;
  border-radius: 25px;
  color: #6b7d99;
  font-weight: 600;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 
    8px 8px 16px var(--organic-shadow-dark),
    -8px -8px 16px var(--organic-shadow-light);
}

.btn-morph {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--organic-accent), var(--organic-highlight));
  border-radius: 25px;
  transform: scale(0);
  transition: transform 0.3s ease;
  z-index: 1;
}

.btn-text {
  position: relative;
  z-index: 2;
  color: #6b7d99;
  transition: color 0.3s ease;
}

.soft-btn:hover .btn-morph {
  transform: scale(1);
}

.soft-btn:hover .btn-text {
  color: #ffffff;
}

/* Biometric Hero Section */
.hero-section {
  min-height: 100vh;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  padding-top: 120px;
  contain: layout style;
}

.hero-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 3rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5rem;
  align-items: center;
}

@media (max-width: 1024px) {
  .hero-container {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 4rem;
  }
}

.hero-content {
  position: relative;
  z-index: 2;
}

/* Organic Typography System */
.typography-organic {
  opacity: 0;
  transform: translateY(30px);
  transition: all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  margin-bottom: 4rem;
}

.typography-organic.revealed {
  opacity: 1;
  transform: translateY(0);
}

.subtitle-soft {
  margin-bottom: 2rem;
}

.subtitle-line {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.3em;
  color: var(--organic-accent);
  margin-bottom: 0.5rem;
  text-shadow: 
    1px 1px 2px var(--organic-shadow-dark),
    -1px -1px 2px var(--organic-shadow-light);
}

.subtitle-accent {
  display: block;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: #6b7d99;
}

.hero-headline {
  font-size: clamp(3rem, 8vw, 5rem);
  font-weight: 300;
  line-height: 1.1;
  margin-bottom: 2rem;
}

.headline-word {
  display: block;
  margin-bottom: 0.2rem;
  color: #6b7d99;
  text-shadow: 
    3px 3px 6px var(--organic-shadow-dark),
    -2px -2px 4px var(--organic-shadow-light);
}

.headline-word.highlight {
  background: linear-gradient(135deg, var(--organic-accent), var(--organic-highlight));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 400;
}

.hero-description {
  font-size: 1.2rem;
  line-height: 1.6;
  color: rgba(107, 125, 153, 0.8);
  max-width: 600px;
  margin-bottom: 3rem;
}

.highlight-soft {
  color: var(--organic-accent);
  font-weight: 500;
}

/* Soft Metrics Ecosystem */
.metrics-ecosystem {
  opacity: 0;
  transform: translateY(30px);
  transition: all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-bottom: 4rem;
}

.metrics-ecosystem.revealed {
  opacity: 1;
  transform: translateY(0);
}

.metric-cell {
  position: relative;
  padding: 2rem;
  background: var(--organic-base);
  border-radius: 25px;
  text-align: center;
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow: hidden;
  box-shadow: 
    12px 12px 24px var(--organic-shadow-dark),
    -12px -12px 24px var(--organic-shadow-light);
}

.cell-morph {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: radial-gradient(circle, var(--organic-accent) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  z-index: 1;
}

.metric-cell.cell-active .cell-morph {
  width: 150px;
  height: 150px;
}

.metric-content {
  position: relative;
  z-index: 2;
}

.metric-value {
  font-size: 2.5rem;
  font-weight: 300;
  color: #6b7d99;
  margin-bottom: 0.5rem;
  text-shadow: 
    2px 2px 4px var(--organic-shadow-dark),
    -1px -1px 2px var(--organic-shadow-light);
}

.metric-label {
  font-size: 0.9rem;
  color: rgba(107, 125, 153, 0.7);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.cell-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  background: rgba(124, 156, 191, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.6s ease;
  z-index: 1;
}

.metric-cell.cell-active .cell-ripple {
  transform: translate(-50%, -50%) scale(5);
  opacity: 0;
}

/* Tactile Actions */
.actions-tactile {
  opacity: 0;
  transform: translateY(30px);
  transition: all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.actions-tactile.revealed {
  opacity: 1;
  transform: translateY(0);
}

.tactile-btn {
  position: relative;
  padding: 1.2rem 2.5rem;
  background: var(--organic-base);
  border: none;
  border-radius: 40px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  min-width: 200px;
  box-shadow: 
    12px 12px 24px var(--organic-shadow-dark),
    -12px -12px 24px var(--organic-shadow-light);
}

.tactile-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--organic-accent), var(--organic-highlight));
  border-radius: 40px;
  transform: scale(0);
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  z-index: 1;
}

.tactile-content {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  color: #6b7d99;
  transition: color 0.3s ease;
}

.tactile-icon {
  width: 20px;
  height: 20px;
  position: relative;
}

.icon-pulse {
  width: 100%;
  height: 100%;
  background: var(--organic-accent);
  border-radius: 50%;
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

.icon-wave {
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 30% 30%, var(--organic-highlight) 2px, transparent 2px),
    radial-gradient(circle at 70% 70%, var(--organic-accent) 2px, transparent 2px);
  background-size: 8px 8px;
  animation: iconWave 3s ease-in-out infinite;
}

@keyframes iconWave {
  0%, 100% {
    background-position: 0 0, 4px 4px;
  }
  50% {
    background-position: 4px 4px, 0 0;
  }
}

.tactile-text {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.tactile-aura {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(124, 156, 191, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.5s ease;
  z-index: 0;
}

.tactile-btn:hover {
  transform: translateY(-3px);
  box-shadow: 
    16px 16px 32px var(--organic-shadow-dark),
    -16px -16px 32px var(--organic-shadow-light);
}

.tactile-btn:hover .tactile-bg {
  transform: scale(1);
}

.tactile-btn:hover .tactile-content {
  color: #ffffff;
}

.tactile-btn:hover .tactile-aura {
  transform: translate(-50%, -50%) scale(1.5);
}

.primary-tactile {
  background: linear-gradient(135deg, var(--organic-base), var(--organic-light));
}

.secondary-tactile {
  background: var(--organic-base);
  box-shadow: 
    inset 8px 8px 16px var(--organic-shadow-dark),
    inset -8px -8px 16px var(--organic-shadow-light);
}

/* Breathing Dashboard */
.dashboard-bio {
  opacity: 0;
  transform: translateY(50px) rotateX(10deg);
  transition: all 2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  perspective: 1000px;
}

.dashboard-bio.revealed {
  opacity: 1;
  transform: translateY(0) rotateX(0deg);
}

.bio-container {
  transform-style: preserve-3d;
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.bio-container:hover {
  transform: rotateY(-2deg) rotateX(2deg);
}

.bio-surface {
  background: var(--organic-base);
  border-radius: 30px;
  overflow: hidden;
  box-shadow: 
    20px 20px 40px var(--organic-shadow-dark),
    -20px -20px 40px var(--organic-shadow-light),
    inset 0 1px 0 var(--organic-shadow-light);
  transform: translateZ(0);
}

.surface-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  background: rgba(124, 156, 191, 0.05);
  border-bottom: 1px solid rgba(124, 156, 191, 0.1);
}

.bio-controls {
  display: flex;
  gap: 0.8rem;
}

.control-orb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 
    3px 3px 6px var(--organic-shadow-dark),
    -3px -3px 6px var(--organic-shadow-light);
}

.control-orb:hover {
  transform: scale(1.2);
  box-shadow: 
    2px 2px 4px var(--organic-shadow-dark),
    -2px -2px 4px var(--organic-shadow-light);
}

.orb-1 {
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
}

.orb-2 {
  background: linear-gradient(135deg, #feca57, #ff9ff3);
}

.orb-3 {
  background: linear-gradient(135deg, #48dbfb, #0abde3);
}

.surface-title {
  font-size: 1rem;
  font-weight: 600;
  color: #6b7d99;
  letter-spacing: 0.05em;
}

.surface-body {
  padding: 2rem;
}

.bio-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.bio-metric {
  position: relative;
  padding: 1.5rem;
  background: var(--organic-base);
  border-radius: 20px;
  text-align: center;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 
    inset 8px 8px 16px var(--organic-shadow-dark),
    inset -8px -8px 16px var(--organic-shadow-light);
}

.bio-metric:hover {
  transform: translateY(-2px);
  box-shadow: 
    inset 6px 6px 12px var(--organic-shadow-dark),
    inset -6px -6px 12px var(--organic-shadow-light);
}

.metric-surface {
  position: relative;
  z-index: 2;
}

.metric-display {
  font-size: 1.8rem;
  font-weight: 300;
  color: var(--organic-accent);
  margin-bottom: 0.5rem;
}

.metric-name {
  font-size: 0.8rem;
  color: rgba(107, 125, 153, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.metric-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 4px;
  background: var(--organic-pulse);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: bioPulse 2s ease-in-out infinite;
  z-index: 1;
}

@keyframes bioPulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: translate(-50%, -50%) scale(3);
    opacity: 0.2;
  }
}

/* Soft 3D Capabilities Section */
.capabilities-section {
  padding: 8rem 0;
  position: relative;
  z-index: 1;
  background: linear-gradient(135deg, 
    rgba(240, 242, 245, 0.7) 0%, 
    rgba(230, 233, 239, 0.8) 50%, 
    rgba(209, 217, 230, 0.7) 100%);
}

.capabilities-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 3rem;
}

.section-header {
  text-align: center;
  margin-bottom: 5rem;
}

.section-headline {
  margin-bottom: 2rem;
}

.headline-prefix {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.3em;
  color: var(--organic-accent);
  margin-bottom: 1rem;
  text-shadow: 
    1px 1px 2px var(--organic-shadow-dark),
    -1px -1px 2px var(--organic-shadow-light);
}

.headline-main {
  display: block;
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 300;
  color: #6b7d99;
  text-shadow: 
    3px 3px 6px var(--organic-shadow-dark),
    -2px -2px 4px var(--organic-shadow-light);
}

.section-description {
  font-size: 1.2rem;
  color: rgba(107, 125, 153, 0.8);
  max-width: 600px;
  margin: 0 auto;
}

.capabilities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 3rem;
  margin-top: 4rem;
}

.capability-cell {
  position: relative;
  padding: 3rem;
  background: var(--organic-base);
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow: hidden;
  box-shadow: 
    15px 15px 30px var(--organic-shadow-dark),
    -15px -15px 30px var(--organic-shadow-light);
  transform-style: preserve-3d;
}

.capability-cell:hover {
  transform: translateY(-5px) rotateX(2deg);
  box-shadow: 
    20px 20px 40px var(--organic-shadow-dark),
    -20px -20px 40px var(--organic-shadow-light);
}

.cell-surface {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(124, 156, 191, 0.05) 0%, 
    rgba(168, 192, 220, 0.05) 100%);
  border-radius: 30px;
  transform: scale(0);
  transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  z-index: 1;
}

.capability-cell.cell-touched .cell-surface {
  transform: scale(1);
}

.cell-depth {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  bottom: 10px;
  background: rgba(124, 156, 191, 0.02);
  border-radius: 25px;
  transform: translateZ(-10px);
  transition: all 0.4s ease;
  z-index: 0;
}

.capability-content {
  position: relative;
  z-index: 3;
}

.capability-icon-bio {
  margin-bottom: 2rem;
}

.icon-surface {
  width: 80px;
  height: 80px;
  background: var(--organic-base);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 
    inset 8px 8px 16px var(--organic-shadow-dark),
    inset -8px -8px 16px var(--organic-shadow-light);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.capability-cell.cell-touched .icon-surface {
  box-shadow: 
    inset 6px 6px 12px var(--organic-shadow-dark),
    inset -6px -6px 12px var(--organic-shadow-light);
  transform: scale(1.1);
}

.icon-core {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--organic-accent), var(--organic-highlight));
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.core-pulse {
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: corePulse 2s ease-in-out infinite;
}

@keyframes corePulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.3);
    opacity: 1;
  }
}

.capability-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #6b7d99;
  margin-bottom: 1rem;
  text-shadow: 
    2px 2px 4px var(--organic-shadow-dark),
    -1px -1px 2px var(--organic-shadow-light);
}

.capability-description {
  font-size: 1rem;
  line-height: 1.6;
  color: rgba(107, 125, 153, 0.8);
  margin-bottom: 2rem;
}

.capability-metrics {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.metric-display {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.metric-value {
  font-size: 2rem;
  font-weight: 300;
  color: var(--organic-accent);
  text-shadow: 
    2px 2px 4px var(--organic-shadow-dark),
    -1px -1px 2px var(--organic-shadow-light);
}

.metric-label {
  font-size: 0.8rem;
  color: rgba(107, 125, 153, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.bio-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.bio-tag {
  padding: 0.3rem 0.8rem;
  background: var(--organic-base);
  border-radius: 15px;
  font-size: 0.7rem;
  color: rgba(107, 125, 153, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 
    inset 3px 3px 6px var(--organic-shadow-dark),
    inset -3px -3px 6px var(--organic-shadow-light);
  transition: all 0.3s ease;
}

.capability-cell.cell-touched .bio-tag {
  background: rgba(124, 156, 191, 0.1);
  color: var(--organic-accent);
}

.cell-breathing {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(124, 156, 191, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  z-index: 0;
  animation: cellBreathe 4s ease-in-out infinite;
}

@keyframes cellBreathe {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
}

.capability-cell.cell-touched .cell-breathing {
  transform: translate(-50%, -50%) scale(1);
}

/* Organic Investment Tiers */
.investment-section {
  padding: 8rem 0;
  position: relative;
  z-index: 1;
  background: 
    radial-gradient(ellipse at 30% 70%, rgba(124, 156, 191, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 30%, rgba(168, 192, 220, 0.08) 0%, transparent 50%),
    linear-gradient(135deg, var(--organic-light) 0%, var(--organic-base) 100%);
}

.investment-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 3rem;
}

.investment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 3rem;
  margin-top: 4rem;
}

.investment-cell {
  position: relative;
  padding: 3rem 2.5rem;
  background: var(--organic-base);
  border-radius: 35px;
  cursor: pointer;
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow: hidden;
  box-shadow: 
    18px 18px 36px var(--organic-shadow-dark),
    -18px -18px 36px var(--organic-shadow-light);
  transform-style: preserve-3d;
}

.investment-cell:hover {
  transform: translateY(-8px) rotateX(3deg);
  box-shadow: 
    25px 25px 50px var(--organic-shadow-dark),
    -25px -25px 50px var(--organic-shadow-light);
}

.cell-featured {
  transform: scale(1.05);
  background: linear-gradient(135deg, 
    rgba(124, 156, 191, 0.1) 0%, 
    var(--organic-base) 30%, 
    rgba(168, 192, 220, 0.1) 100%);
}

.cell-featured:hover {
  transform: translateY(-10px) rotateX(3deg) scale(1.05);
}

.cell-morph-deep {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(124, 156, 191, 0.1) 0%, 
    rgba(168, 192, 220, 0.1) 100%);
  border-radius: 35px;
  transform: scale(0);
  transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  z-index: 1;
}

.investment-cell.cell-active .cell-morph-deep {
  transform: scale(1);
}

.cell-aura {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(124, 156, 191, 0.2) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.6s ease;
  z-index: 0;
  animation: auraBreatheSlow 6s ease-in-out infinite;
}

@keyframes auraBreatheSlow {
  0%, 100% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.4;
  }
}

.investment-cell.cell-active .cell-aura {
  transform: translate(-50%, -50%) scale(1);
}

.featured-pulse {
  position: absolute;
  top: -15px;
  right: 2rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  z-index: 5;
}

.pulse-core {
  width: 12px;
  height: 12px;
  background: linear-gradient(135deg, var(--organic-accent), var(--organic-highlight));
  border-radius: 50%;
  animation: featuredPulse 2s ease-in-out infinite;
  box-shadow: 
    0 0 20px rgba(124, 156, 191, 0.6),
    4px 4px 8px var(--organic-shadow-dark),
    -2px -2px 4px var(--organic-shadow-light);
}

@keyframes featuredPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 
      0 0 20px rgba(124, 156, 191, 0.6),
      4px 4px 8px var(--organic-shadow-dark),
      -2px -2px 4px var(--organic-shadow-light);
  }
  50% {
    transform: scale(1.3);
    box-shadow: 
      0 0 30px rgba(124, 156, 191, 0.8),
      4px 4px 8px var(--organic-shadow-dark),
      -2px -2px 4px var(--organic-shadow-light);
  }
}

.pulse-text {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--organic-accent);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-shadow: 
    1px 1px 2px var(--organic-shadow-dark),
    -1px -1px 2px var(--organic-shadow-light);
}

.tier-content {
  position: relative;
  z-index: 3;
}

.tier-header {
  text-align: center;
  margin-bottom: 3rem;
}

.tier-name {
  font-size: 1.8rem;
  font-weight: 300;
  color: #6b7d99;
  margin-bottom: 1rem;
  text-shadow: 
    2px 2px 4px var(--organic-shadow-dark),
    -1px -1px 2px var(--organic-shadow-light);
}

.tier-pricing {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.3rem;
}

.pricing-symbol {
  font-size: 1.2rem;
  color: var(--organic-accent);
  font-weight: 500;
}

.pricing-amount {
  font-size: 3rem;
  font-weight: 300;
  color: #6b7d99;
  text-shadow: 
    2px 2px 4px var(--organic-shadow-dark),
    -1px -1px 2px var(--organic-shadow-light);
}

.pricing-period {
  font-size: 1rem;
  color: rgba(107, 125, 153, 0.7);
  margin-left: 0.5rem;
}

.tier-features {
  margin-bottom: 3rem;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem 0;
}

.feature-pulse {
  position: relative;
  min-width: 20px;
  height: 20px;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: var(--organic-accent);
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: featurePulse 2s ease-in-out infinite;
}

@keyframes featurePulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 1;
  }
}

.feature-text {
  font-size: 1rem;
  color: rgba(107, 125, 153, 0.9);
  line-height: 1.4;
}

.tier-action {
  text-align: center;
}

.bio-btn {
  position: relative;
  width: 100%;
  padding: 1.2rem 2rem;
  background: var(--organic-base);
  border: none;
  border-radius: 30px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 
    12px 12px 24px var(--organic-shadow-dark),
    -12px -12px 24px var(--organic-shadow-light);
}

.bio-btn:hover {
  transform: translateY(-2px);
  box-shadow: 
    15px 15px 30px var(--organic-shadow-dark),
    -15px -15px 30px var(--organic-shadow-light);
}

.btn-surface {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--organic-accent), var(--organic-highlight));
  border-radius: 30px;
  transform: scale(0);
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  z-index: 1;
}

.bio-btn:hover .btn-surface {
  transform: scale(1);
}

.btn-content {
  position: relative;
  z-index: 2;
  font-size: 1rem;
  font-weight: 600;
  color: #6b7d99;
  letter-spacing: 0.05em;
  transition: color 0.3s ease;
}

.bio-btn:hover .btn-content {
  color: #ffffff;
}

.btn-featured {
  background: linear-gradient(135deg, 
    rgba(124, 156, 191, 0.1) 0%, 
    var(--organic-base) 30%, 
    rgba(168, 192, 220, 0.1) 100%);
  box-shadow: 
    15px 15px 30px var(--organic-shadow-dark),
    -15px -15px 30px var(--organic-shadow-light),
    inset 0 1px 0 var(--organic-shadow-light);
}

/* Organic Call-to-Action */
.organic-cta-section {
  padding: 8rem 0;
  position: relative;
  z-index: 1;
  background: 
    radial-gradient(ellipse at 50% 50%, rgba(124, 156, 191, 0.1) 0%, transparent 60%),
    linear-gradient(135deg, var(--organic-base) 0%, var(--organic-light) 50%, var(--organic-medium) 100%);
}

.organic-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 3rem;
}

.cta-surface {
  position: relative;
  padding: 5rem 4rem;
  background: var(--organic-base);
  border-radius: 50px;
  text-align: center;
  overflow: hidden;
  box-shadow: 
    25px 25px 50px var(--organic-shadow-dark),
    -25px -25px 50px var(--organic-shadow-light),
    inset 0 1px 0 var(--organic-shadow-light);
}

.surface-breathing {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 1;
}

.breath-particle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: radial-gradient(circle, var(--organic-pulse) 0%, transparent 70%);
  border-radius: 50%;
  animation: breathParticle 8s ease-in-out infinite;
}

@keyframes breathParticle {
  0%, 100% {
    transform: scale(1);
    opacity: 0.4;
  }
  25% {
    transform: scale(1.5);
    opacity: 0.8;
  }
  50% {
    transform: scale(2);
    opacity: 1;
  }
  75% {
    transform: scale(1.5);
    opacity: 0.8;
  }
}

.cta-content {
  position: relative;
  z-index: 3;
}

.cta-headline {
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 300;
  margin-bottom: 2rem;
}

.headline-line {
  display: block;
  color: #6b7d99;
  margin-bottom: 0.5rem;
  text-shadow: 
    3px 3px 6px var(--organic-shadow-dark),
    -2px -2px 4px var(--organic-shadow-light);
}

.headline-line.highlight {
  background: linear-gradient(135deg, var(--organic-accent), var(--organic-highlight));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 400;
}

.cta-description {
  font-size: 1.3rem;
  line-height: 1.6;
  color: rgba(107, 125, 153, 0.8);
  max-width: 700px;
  margin: 0 auto 4rem auto;
}

.cta-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.ultimate-bio {
  position: relative;
  padding: 1.5rem 4rem;
  background: var(--organic-base);
  border: none;
  border-radius: 50px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  min-width: 300px;
  box-shadow: 
    20px 20px 40px var(--organic-shadow-dark),
    -20px -20px 40px var(--organic-shadow-light);
}

.ultimate-bio:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 
    25px 25px 50px var(--organic-shadow-dark),
    -25px -25px 50px var(--organic-shadow-light);
}

.bio-core {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--organic-accent), var(--organic-highlight));
  border-radius: 50px;
  transform: scale(0);
  transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  z-index: 1;
}

.ultimate-bio:hover .bio-core {
  transform: scale(1);
}

.bio-content {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: #6b7d99;
  transition: color 0.4s ease;
}

.ultimate-bio:hover .bio-content {
  color: #ffffff;
}

.bio-icon {
  position: relative;
  width: 30px;
  height: 30px;
}

.icon-breathing {
  position: relative;
  width: 100%;
  height: 100%;
}

.breath-center {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  background: currentColor;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: breathCenter 3s ease-in-out infinite;
}

@keyframes breathCenter {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 1;
  }
}

.breath-rings {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.breath-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  border: 1px solid currentColor;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: breathRing 3s ease-in-out infinite;
}

.breath-ring:nth-child(1) {
  width: 15px;
  height: 15px;
  opacity: 0.6;
  animation-delay: 0s;
}

.breath-ring:nth-child(2) {
  width: 20px;
  height: 20px;
  opacity: 0.4;
  animation-delay: 0.5s;
}

.breath-ring:nth-child(3) {
  width: 25px;
  height: 25px;
  opacity: 0.2;
  animation-delay: 1s;
}

@keyframes breathRing {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
  50% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0.6;
  }
}

.bio-text {
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.bio-aura {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(124, 156, 191, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.6s ease;
  z-index: 0;
  animation: bioAura 4s ease-in-out infinite;
}

@keyframes bioAura {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
}

.ultimate-bio:hover .bio-aura {
  transform: translate(-50%, -50%) scale(1.5);
}

.cta-assurance {
  display: flex;
  align-items: center;
  gap: 1rem;
  opacity: 0.8;
}

.assurance-pulse {
  width: 6px;
  height: 6px;
  background: var(--organic-accent);
  border-radius: 50%;
  animation: assurancePulse 2s ease-in-out infinite;
}

@keyframes assurancePulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.5);
    opacity: 1;
  }
}

.assurance-text {
  font-size: 0.9rem;
  color: rgba(107, 125, 153, 0.7);
  letter-spacing: 0.05em;
}

/* Revolutionary Responsive System */
@media (max-width: 768px) {
  .hero-container {
    grid-template-columns: 1fr;
    gap: 3rem;
    padding: 0 2rem;
  }
  
  .headline-word {
    font-size: clamp(2rem, 10vw, 3.5rem);
  }
  
  .metrics-ecosystem {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .actions-tactile {
    flex-direction: column;
    align-items: center;
  }
  
  .tactile-btn {
    width: 100%;
    max-width: 300px;
  }
  
  .nav-menu {
    display: none;
  }
  
  .bio-metrics {
    grid-template-columns: 1fr;
  }
}

/* Performance Optimizations */
.neumorphism-landing * {
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* Focus Management */
.tactile-element:focus,
.soft-btn:focus,
.tactile-btn:focus {
  outline: 2px solid var(--organic-accent);
  outline-offset: 2px;
}

/* Print Styles */
@media print {
  .organic-bg,
  .soft-nav {
    display: none;
  }
  
  .neumorphism-landing {
    background: white;
    color: black;
  }
}
</style>