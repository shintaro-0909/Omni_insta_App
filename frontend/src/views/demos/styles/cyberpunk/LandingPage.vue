<template>
  <div class="cyberpunk-landing" ref="landingRef">
    <!-- Digital Matrix Background -->
    <div class="matrix-core">
      <div class="digital-rain">
        <canvas ref="matrixCanvas" class="matrix-canvas"></canvas>
      </div>
      <div class="circuit-overlay">
        <svg class="circuit-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="circuitPattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <rect width="10" height="10" fill="none"/>
              <path d="M5,0 L5,5 L10,5" stroke="#00ffff" stroke-width="0.1" fill="none" opacity="0.3"/>
            </pattern>
            <filter id="neonGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuitPattern)"/>
        </svg>
      </div>
      <div class="scan-lines"></div>
      <div class="electromagnetic-field">
        <div v-for="i in 6" :key="i" class="em-wave" :style="getEMWaveStyle(i)"></div>
      </div>
    </div>

    <!-- Cybernetic Navigation HUD -->
    <nav class="cyber-hud" :class="{ 'hud-active': scrolled }">
      <div class="hud-container">
        <div class="nav-sector nav-brand" @click="initializeSystem">
          <div class="brand-hologram">
            <div class="holo-core">
              <div class="core-matrix">
                <div class="matrix-cell" v-for="i in 9" :key="i" :class="{ 'cell-active': i % 3 === 1 }"></div>
              </div>
              <div class="holo-ring ring-outer"></div>
              <div class="holo-ring ring-inner"></div>
            </div>
          </div>
          <div class="brand-display">
            <span class="brand-prefix">SYS://</span>
            <span class="brand-name glitch" data-text="OMNIY">OMNIY</span>
          </div>
        </div>
        
        <div class="nav-sector nav-menu">
          <a href="#features" class="nav-node" @click="navigateNode">
            <span class="node-text">FEATURES</span>
            <div class="node-indicator"></div>
            <div class="node-pulse"></div>
          </a>
          <a href="#pricing" class="nav-node" @click="navigateNode">
            <span class="node-text">PRICING</span>
            <div class="node-indicator"></div>
            <div class="node-pulse"></div>
          </a>
          <button class="cyber-button primary-node" @click="jackIn">
            <div class="button-shell"></div>
            <div class="button-core">
              <span class="button-text">JACK IN</span>
              <div class="button-glow"></div>
            </div>
            <div class="button-particles">
              <div v-for="i in 8" :key="i" class="particle" :style="getParticleStyle(i)"></div>
            </div>
          </button>
        </div>
      </div>
    </nav>

    <!-- Cybernetic Hero Interface -->
    <section class="hero-interface" ref="heroInterface">
      <div class="interface-grid">
        <div class="terminal-sector">
          <!-- Advanced Terminal Interface -->
          <div class="terminal-complex">
            <div class="terminal-header">
              <div class="header-controls">
                <div class="control-node active"></div>
                <div class="control-node warning"></div>
                <div class="control-node danger"></div>
              </div>
              <div class="terminal-status">
                <span class="status-indicator">{{ systemStatus }}</span>
                <div class="status-bar">
                  <div class="status-fill" :style="{ width: connectionStrength + '%' }"></div>
                </div>
              </div>
            </div>
            
            <div class="terminal-body">
              <div class="command-sequence">
                <div v-for="(command, index) in terminalSequence" 
                     :key="index" 
                     class="command-line"
                     :class="{ 'line-active': index === activeCommandIndex }">
                  <span class="command-prompt">{{ command.prompt }}</span>
                  <span class="command-text" :class="command.type">{{ command.text }}</span>
                  <div v-if="index === activeCommandIndex" class="cursor-blink">_</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Holographic Data Streams -->
          <div class="data-streams">
            <div v-for="stream in dataStreams" :key="stream.id" class="data-stream" :class="stream.type">
              <div class="stream-header">
                <span class="stream-label">{{ stream.label }}</span>
                <span class="stream-value">{{ stream.value }}</span>
              </div>
              <div class="stream-visualization">
                <canvas :ref="'streamCanvas' + stream.id" class="stream-canvas" width="200" height="40"></canvas>
              </div>
            </div>
          </div>
        </div>

        <div class="display-sector">
          <!-- Cybernetic Typography Display -->
          <div class="typography-matrix" :class="{ 'matrix-initialized': typographyInitialized }">
            <div class="title-sequence">
              <div class="title-block">
                <span class="title-prefix">NEURAL_LINK://</span>
                <h1 class="cyber-title">
                  <span class="title-segment">INSTAGRAM</span>
                  <span class="title-segment highlight">DOMINATION</span>
                  <span class="title-segment">PROTOCOL</span>
                </h1>
              </div>
              
              <div class="subtitle-matrix">
                <p class="cyber-subtitle">
                  <span class="accent-text">Initialize autonomous posting sequences.</span>
                  Deploy advanced AI algorithms to
                  <span class="highlight-text">maximize engagement vectors</span>
                  and achieve total social media supremacy.
                </p>
              </div>
            </div>
          </div>

          <!-- Cybernetic Metrics Dashboard -->
          <div class="metrics-dashboard" :class="{ 'dashboard-online': metricsOnline }">
            <div class="dashboard-header">
              <span class="dashboard-title">SYSTEM_METRICS://</span>
              <div class="metrics-status">
                <div class="status-dot active"></div>
                <span class="status-text">ONLINE</span>
              </div>
            </div>
            
            <div class="metrics-grid">
              <div v-for="(metric, index) in cyberMetrics" 
                   :key="index"
                   class="metric-node"
                   @mouseenter="activateMetric(index)"
                   @mouseleave="deactivateMetric(index)"
                   :class="{ 'node-activated': metric.active }">
                <div class="metric-glow"></div>
                <div class="metric-display">
                  <div class="metric-value">{{ metric.value }}</div>
                  <div class="metric-label">{{ metric.label }}</div>
                </div>
                <div class="metric-graph">
                  <div v-for="i in 8" :key="i" class="graph-bar" :style="{ height: getGraphHeight(index, i) + '%' }"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Interface -->
          <div class="action-interface" :class="{ 'interface-ready': actionsReady }">
            <button class="cyber-action primary-action" @click="jackIn">
              <div class="action-background"></div>
              <div class="action-content">
                <div class="action-icon">
                  <div class="icon-matrix">
                    <div class="matrix-dot" v-for="i in 9" :key="i"></div>
                  </div>
                </div>
                <span class="action-text">INITIATE_PROTOCOL</span>
              </div>
              <div class="action-energy"></div>
            </button>
            
            <button class="cyber-action secondary-action" @click="accessDemo">
              <div class="action-background"></div>
              <div class="action-content">
                <div class="action-icon">
                  <div class="icon-scan">
                    <div class="scan-element" v-for="i in 4" :key="i"></div>
                  </div>
                </div>
                <span class="action-text">ACCESS_DEMO</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Neural Network Features -->
    <section id="features" class="neural-section">
      <div class="neural-container">
        <div class="section-header">
          <h2 class="neural-title">
            <span class="title-glitch" data-text="NEURAL">NEURAL</span>
            <span class="title-highlight">CAPABILITIES</span>
          </h2>
          <div class="neural-subtitle">
            Advanced AI-powered features for total Instagram control
          </div>
        </div>

        <div class="capabilities-matrix">
          <div v-for="(capability, index) in neuralCapabilities" 
               :key="index"
               class="capability-node"
               @mouseenter="activateCapability(index)"
               @mouseleave="deactivateCapability(index)"
               :class="{ 'node-powered': capability.active }">
            <div class="node-frame">
              <div class="frame-glow"></div>
              <div class="capability-content">
                <div class="capability-icon">
                  <div class="icon-hologram" :class="capability.iconClass">
                    <div class="holo-element" v-for="i in capability.elements" :key="i"></div>
                  </div>
                </div>
                
                <h3 class="capability-title">{{ capability.title }}</h3>
                <p class="capability-description">{{ capability.description }}</p>
                
                <div class="capability-stats">
                  <div class="stat-primary">
                    <span class="stat-value">{{ capability.performance }}</span>
                    <span class="stat-label">{{ capability.metric }}</span>
                  </div>
                  <div class="capability-tags">
                    <span v-for="tag in capability.technologies" :key="tag" class="tech-tag">
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Digital Commerce Interface -->
    <section id="pricing" class="commerce-section">
      <div class="commerce-container">
        <div class="section-header">
          <h2 class="commerce-title">
            <span class="title-segment">ACCESS</span>
            <span class="title-segment highlight">LEVELS</span>
          </h2>
          <div class="commerce-subtitle">
            Select your neural interface subscription tier
          </div>
        </div>

        <div class="pricing-matrix">
          <div v-for="(tier, index) in accessTiers" 
               :key="index"
               class="access-node"
               :class="{ 
                 'node-premium': tier.featured,
                 'node-selected': tier.active 
               }"
               @mouseenter="activateTier(index)"
               @mouseleave="deactivateTier(index)">
            <div class="node-shell"></div>
            <div class="node-energy"></div>
            
            <div v-if="tier.featured" class="premium-badge">
              <div class="badge-glow"></div>
              <span class="badge-text">RECOMMENDED</span>
            </div>
            
            <div class="tier-interface">
              <div class="tier-header">
                <h3 class="tier-name">{{ tier.name }}</h3>
                <div class="tier-pricing">
                  <span class="price-currency">¥</span>
                  <span class="price-amount">{{ tier.price }}</span>
                  <span class="price-period">/MONTH</span>
                </div>
              </div>
              
              <div class="tier-features">
                <div v-for="(feature, fIndex) in tier.features" 
                     :key="fIndex"
                     class="feature-item">
                  <div class="feature-indicator">
                    <div class="indicator-core"></div>
                  </div>
                  <span class="feature-text">{{ feature }}</span>
                </div>
              </div>
              
              <div class="tier-action">
                <button class="access-button" 
                        :class="{ 'button-premium': tier.featured }"
                        @click="selectAccess(tier)">
                  <div class="button-matrix"></div>
                  <span class="button-text">{{ tier.cta }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Final Interface Call-to-Action -->
    <section class="finale-interface">
      <div class="finale-container">
        <div class="finale-background">
          <div class="digital-storm">
            <div v-for="i in 20" :key="i" class="storm-particle" :style="getStormParticleStyle(i)"></div>
          </div>
        </div>
        
        <div class="finale-content">
          <h2 class="finale-title">
            <span class="title-line">READY TO</span>
            <span class="title-line highlight">JACK INTO</span>
            <span class="title-line">THE MATRIX?</span>
          </h2>
          <p class="finale-description">
            Join the cybernetic revolution and dominate the Instagram neural network
          </p>
          
          <div class="finale-actions">
            <button class="ultimate-action" @click="jackIn">
              <div class="ultimate-core"></div>
              <div class="ultimate-energy"></div>
              <div class="ultimate-content">
                <div class="ultimate-icon">
                  <div class="icon-constellation">
                    <div class="constellation-node" v-for="i in 7" :key="i"></div>
                  </div>
                </div>
                <span class="ultimate-text">INITIALIZE_CONNECTION</span>
              </div>
            </button>
            
            <div class="finale-guarantee">
              <div class="guarantee-scanner">
                <div class="scanner-beam"></div>
              </div>
              <span class="guarantee-text">NO_COMMITMENT • INSTANT_ACCESS</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

// Cybernetic reactive state
const landingRef = ref<HTMLElement | null>(null)
const heroInterface = ref<HTMLElement | null>(null)
const matrixCanvas = ref<HTMLCanvasElement | null>(null)
const scrolled = ref(false)
const systemStatus = ref('NEURAL_LINK_ACTIVE')
const connectionStrength = ref(98)
const typographyInitialized = ref(false)
const metricsOnline = ref(false)
const actionsReady = ref(false)
const activeCommandIndex = ref(0)

// Matrix data streams
const terminalSequence = ref([
  { prompt: 'root@matrix:~$', text: 'initialize_neural_protocol.exe', type: 'command' },
  { prompt: '[SYSTEM]', text: 'Neural link established...', type: 'success' },
  { prompt: '[SYSTEM]', text: 'Instagram API connected...', type: 'success' },
  { prompt: '[SYSTEM]', text: 'AI scheduling modules loaded...', type: 'success' },
  { prompt: '[SYSTEM]', text: 'Quantum processors online...', type: 'warning' },
  { prompt: '[READY]', text: 'System ready for content upload', type: 'active' }
])

const dataStreams = ref([
  { id: 1, label: 'NEURAL_THROUGHPUT', value: '2.4TB/s', type: 'primary' },
  { id: 2, label: 'ENGAGEMENT_RATE', value: '847%', type: 'success' },
  { id: 3, label: 'QUANTUM_SYNC', value: '99.97%', type: 'warning' }
])

const cyberMetrics = ref([
  { value: '1.2M+', label: 'POSTS_PROCESSED', active: false },
  { value: '99.97%', label: 'ACCURACY_RATE', active: false },
  { value: '847%', label: 'GROWTH_FACTOR', active: false },
  { value: '24/7', label: 'NEURAL_UPTIME', active: false }
])

const neuralCapabilities = ref([
  {
    title: 'Quantum AI Scheduling',
    description: 'Advanced quantum algorithms analyze temporal patterns to optimize posting sequences for maximum viral potential.',
    performance: '847%',
    metric: 'ENGAGEMENT_BOOST',
    technologies: ['QUANTUM_AI', 'NEURAL_NETS', 'TEMPORAL_ANALYSIS'],
    iconClass: 'icon-quantum',
    elements: 6,
    active: false
  },
  {
    title: 'Neural Network Analytics',
    description: 'Deep learning systems process massive data streams to predict content performance with cybernetic precision.',
    performance: '99.97%',
    metric: 'PREDICTION_ACCURACY',
    technologies: ['DEEP_LEARNING', 'DATA_MINING', 'PREDICTIVE_AI'],
    iconClass: 'icon-neural',
    elements: 8,
    active: false
  },
  {
    title: 'Autonomous Content Matrix',
    description: 'Self-evolving content optimization protocols that adapt and improve without human intervention.',
    performance: '300%',
    metric: 'EFFICIENCY_GAIN',
    technologies: ['AUTO_EVOLUTION', 'MACHINE_LEARNING', 'OPTIMIZATION'],
    iconClass: 'icon-matrix',
    elements: 9,
    active: false
  }
])

const accessTiers = ref([
  {
    name: 'INITIATE',
    price: 29,
    featured: false,
    active: false,
    cta: 'BEGIN_PROTOCOL',
    features: [
      '5 NEURAL_ACCOUNTS',
      '500 AUTO_POSTS',
      'BASIC_AI_CORE',
      'STANDARD_BANDWIDTH',
      'NEURAL_SUPPORT'
    ]
  },
  {
    name: 'HACKER',
    price: 79,
    featured: true,
    active: false,
    cta: 'JACK_IN_NOW',
    features: [
      '15 NEURAL_ACCOUNTS',
      'UNLIMITED_POSTS',
      'QUANTUM_AI_CORE',
      'PRIORITY_BANDWIDTH',
      'ADVANCED_ANALYTICS',
      'NEURAL_ENHANCEMENT'
    ]
  },
  {
    name: 'ARCHITECT',
    price: 199,
    featured: false,
    active: false,
    cta: 'CONTACT_MATRIX',
    features: [
      'UNLIMITED_ACCOUNTS',
      'ENTERPRISE_AI_CORE',
      'DEDICATED_BANDWIDTH',
      'CUSTOM_ALGORITHMS',
      'MATRIX_ACCESS',
      'CYBERNETIC_SUPPORT'
    ]
  }
])

// Cybernetic interaction methods
const getEMWaveStyle = (index: number) => {
  const delays = ['0s', '0.5s', '1s', '1.5s', '2s', '2.5s']
  const sizes = ['100px', '150px', '200px', '250px', '300px', '350px']
  return {
    animationDelay: delays[index - 1] || '0s',
    width: sizes[index - 1] || '100px',
    height: sizes[index - 1] || '100px'
  }
}

const getParticleStyle = (index: number) => {
  const angle = (index / 8) * Math.PI * 2
  const radius = 20
  return {
    left: `${50 + Math.cos(angle) * radius}%`,
    top: `${50 + Math.sin(angle) * radius}%`,
    animationDelay: `${index * 0.1}s`
  }
}

const getGraphHeight = (metricIndex: number, barIndex: number) => {
  const baseHeights = [
    [20, 40, 30, 70, 50, 80, 60, 90],
    [30, 60, 45, 80, 65, 90, 75, 95],
    [25, 50, 35, 75, 55, 85, 70, 88],
    [40, 70, 60, 85, 75, 95, 80, 92]
  ]
  return baseHeights[metricIndex]?.[barIndex] || 50
}

const getStormParticleStyle = (index: number) => {
  return {
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 3}s`,
    animationDuration: `${3 + Math.random() * 2}s`
  }
}

// Neural interface methods
const activateMetric = (index: number) => {
  cyberMetrics.value[index].active = true
}

const deactivateMetric = (index: number) => {
  cyberMetrics.value[index].active = false
}

const activateCapability = (index: number) => {
  neuralCapabilities.value[index].active = true
}

const deactivateCapability = (index: number) => {
  neuralCapabilities.value[index].active = false
}

const activateTier = (index: number) => {
  accessTiers.value[index].active = true
}

const deactivateTier = (index: number) => {
  accessTiers.value[index].active = false
}

const handleScroll = () => {
  scrolled.value = window.scrollY > 50
}

const initializeSystem = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const navigateNode = (event: MouseEvent) => {
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

const jackIn = () => {
  console.log('Neural link initialized')
}

const accessDemo = () => {
  console.log('Demo access granted')
}

const selectAccess = (tier: any) => {
  console.log('Access tier selected:', tier.name)
}

// Matrix animation system
const initializeMatrix = () => {
  if (!matrixCanvas.value) return
  
  const canvas = matrixCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  
  const matrix = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()_+-=[]{}|;:,.<>?'
  const drops: number[] = []
  const fontSize = 10
  const columns = canvas.width / fontSize
  
  for (let x = 0; x < columns; x++) {
    drops[x] = 1
  }
  
  const draw = () => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.04)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    ctx.fillStyle = '#00ffff'
    ctx.font = `${fontSize}px 'Courier New'`
    
    for (let i = 0; i < drops.length; i++) {
      const text = matrix[Math.floor(Math.random() * matrix.length)]
      ctx.fillText(text, i * fontSize, drops[i] * fontSize)
      
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0
      }
      drops[i]++
    }
  }
  
  const interval = setInterval(draw, 35)
  
  return () => {
    clearInterval(interval)
  }
}

// Terminal sequence animation
const animateTerminalSequence = () => {
  let currentIndex = 0
  const interval = setInterval(() => {
    if (currentIndex < terminalSequence.value.length) {
      activeCommandIndex.value = currentIndex
      currentIndex++
    } else {
      clearInterval(interval)
    }
  }, 800)
}

// System initialization sequence
const initializeCyberSystems = async () => {
  await nextTick()
  
  // Sequential system activation
  setTimeout(() => { typographyInitialized.value = true }, 600)
  setTimeout(() => { metricsOnline.value = true }, 1200)
  setTimeout(() => { actionsReady.value = true }, 1800)
  
  // Start terminal sequence
  setTimeout(() => {
    animateTerminalSequence()
  }, 1000)
}

// Cybernetic lifecycle
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  
  // Initialize matrix and systems
  const cleanupMatrix = initializeMatrix()
  initializeCyberSystems()
  
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    if (cleanupMatrix) cleanupMatrix()
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* Cyberpunk CSS Architecture */
.cyberpunk-landing {
  --cyber-cyan: #00ffff;
  --cyber-magenta: #ff00ff;
  --cyber-yellow: #ffff00;
  --cyber-green: #00ff00;
  --cyber-red: #ff0040;
  --cyber-blue: #0080ff;
  --cyber-purple: #8000ff;
  --cyber-dark: #000000;
  --cyber-darker: #0a0a0a;
  --cyber-glow: rgba(0, 255, 255, 0.8);
  
  min-height: 100vh;
  background: 
    radial-gradient(ellipse at center, var(--cyber-darker) 0%, var(--cyber-dark) 100%);
  color: var(--cyber-cyan);
  font-family: 'Courier New', 'Consolas', monospace;
  position: relative;
  overflow-x: hidden;
  
  /* Performance optimization */
  contain: layout style;
  will-change: auto;
}

/* Digital Matrix Background */
.matrix-core {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.digital-rain {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.matrix-canvas {
  width: 100%;
  height: 100%;
  opacity: 0.6;
}

.circuit-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.3;
}

.circuit-svg {
  width: 100%;
  height: 100%;
}

.scan-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent 50%,
    rgba(0, 255, 255, 0.03) 51%
  );
  background-size: 100% 4px;
  animation: scanScroll 0.1s linear infinite;
}

@keyframes scanScroll {
  0% { background-position: 0 0; }
  100% { background-position: 0 4px; }
}

.electromagnetic-field {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.em-wave {
  position: absolute;
  top: 50%;
  left: 50%;
  border: 1px solid var(--cyber-cyan);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  animation: emPulse 3s ease-out infinite;
}

@keyframes emPulse {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

/* Cybernetic Navigation HUD */
.cyber-hud {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 1rem 0;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid var(--cyber-cyan);
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.hud-active {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(30px) saturate(200%);
  border-bottom-color: var(--cyber-magenta);
}

.hud-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-sector {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-brand {
  cursor: pointer;
  transition: all 0.3s ease;
}

.brand-hologram {
  position: relative;
  width: 50px;
  height: 50px;
  margin-right: 1rem;
}

.holo-core {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.core-matrix {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
  width: 20px;
  height: 20px;
}

.matrix-cell {
  width: 4px;
  height: 4px;
  background: var(--cyber-cyan);
  opacity: 0.3;
  transition: all 0.3s ease;
}

.matrix-cell.cell-active {
  opacity: 1;
  box-shadow: 0 0 10px var(--cyber-cyan);
}

.holo-ring {
  position: absolute;
  border: 1px solid var(--cyber-cyan);
  border-radius: 50%;
  opacity: 0.7;
  animation: holoRotate 10s linear infinite;
}

.ring-outer {
  width: 40px;
  height: 40px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.ring-inner {
  width: 30px;
  height: 30px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-direction: reverse;
  animation-duration: 7s;
}

@keyframes holoRotate {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

.brand-display {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.brand-prefix {
  font-size: 0.8rem;
  color: var(--cyber-green);
  opacity: 0.8;
}

.brand-name {
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--cyber-cyan);
  text-shadow: 0 0 10px var(--cyber-cyan);
}

.glitch {
  position: relative;
  animation: glitchFlicker 3s infinite;
}

.glitch::before,
.glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--cyber-dark);
}

.glitch::before {
  animation: glitchSkew 2s infinite;
  color: var(--cyber-magenta);
  z-index: -1;
}

.glitch::after {
  animation: glitchSkew 3s infinite;
  color: var(--cyber-yellow);
  z-index: -2;
}

@keyframes glitchFlicker {
  0%, 100% { opacity: 1; }
  98%, 99% { opacity: 0.8; transform: skew(1deg); }
}

@keyframes glitchSkew {
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0); }
}

.nav-node {
  position: relative;
  color: var(--cyber-cyan);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: bold;
  letter-spacing: 0.1em;
  padding: 0.5rem 1rem;
  transition: all 0.3s ease;
  overflow: hidden;
}

.node-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--cyber-cyan), var(--cyber-magenta));
  transition: width 0.4s ease;
}

.node-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 4px;
  background: var(--cyber-cyan);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.3s ease;
}

.nav-node:hover {
  color: var(--cyber-magenta);
  text-shadow: 0 0 10px var(--cyber-magenta);
}

.nav-node:hover .node-indicator {
  width: 100%;
}

.nav-node:hover .node-pulse {
  transform: translate(-50%, -50%) scale(3);
  opacity: 0;
}

.cyber-button {
  position: relative;
  padding: 0.8rem 1.5rem;
  background: transparent;
  border: 2px solid var(--cyber-cyan);
  color: var(--cyber-cyan);
  font-family: inherit;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
}

.button-shell {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--cyber-cyan);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
  z-index: 1;
}

.button-core {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.button-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, var(--cyber-cyan) 0%, transparent 70%);
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.3s ease;
  z-index: 0;
}

.cyber-button:hover {
  border-color: var(--cyber-magenta);
  color: var(--cyber-magenta);
  box-shadow: 0 0 30px var(--cyber-glow);
}

.cyber-button:hover .button-shell {
  transform: scaleX(1);
}

.cyber-button:hover .button-glow {
  transform: translate(-50%, -50%) scale(1);
}

.button-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 2px;
  height: 2px;
  background: var(--cyber-cyan);
  border-radius: 50%;
  opacity: 0;
  animation: particleBurst 0.6s ease-out;
}

@keyframes particleBurst {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0) translate(20px, 20px);
  }
}

/* Cybernetic Hero Interface */
.hero-interface {
  min-height: 100vh;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  padding-top: 120px;
  contain: layout style;
}

.interface-grid {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

@media (max-width: 1024px) {
  .interface-grid {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
}

/* Terminal Complex */
.terminal-complex {
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid var(--cyber-cyan);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 
    0 0 30px rgba(0, 255, 255, 0.3),
    inset 0 0 30px rgba(0, 255, 255, 0.1);
  margin-bottom: 2rem;
}

.terminal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: rgba(0, 255, 255, 0.1);
  border-bottom: 1px solid var(--cyber-cyan);
}

.header-controls {
  display: flex;
  gap: 0.5rem;
}

.control-node {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.control-node:hover {
  transform: scale(1.2);
  box-shadow: 0 0 15px currentColor;
}

.control-node.active { background: var(--cyber-green); }
.control-node.warning { background: var(--cyber-yellow); }
.control-node.danger { background: var(--cyber-red); }

.terminal-status {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-indicator {
  font-size: 0.8rem;
  color: var(--cyber-green);
  letter-spacing: 0.1em;
}

.status-bar {
  width: 100px;
  height: 4px;
  background: rgba(0, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.status-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--cyber-green), var(--cyber-cyan));
  transition: width 0.5s ease;
}

.terminal-body {
  padding: 1.5rem;
  min-height: 200px;
  font-family: 'Courier New', monospace;
}

.command-sequence {
  font-size: 0.9rem;
  line-height: 1.6;
}

.command-line {
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.command-line.line-active {
  opacity: 1;
}

.command-prompt {
  color: var(--cyber-green);
  margin-right: 0.5rem;
  font-weight: bold;
}

.command-text {
  color: var(--cyber-cyan);
}

.command-text.command { color: var(--cyber-cyan); }
.command-text.success { color: var(--cyber-green); }
.command-text.warning { color: var(--cyber-yellow); }
.command-text.active { color: var(--cyber-magenta); }

.cursor-blink {
  color: var(--cyber-cyan);
  animation: cursorBlink 1s infinite;
  margin-left: 0.25rem;
}

@keyframes cursorBlink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* Data Streams */
.data-streams {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.data-stream {
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid var(--cyber-cyan);
  border-radius: 4px;
  padding: 1rem;
  transition: all 0.3s ease;
}

.data-stream:hover {
  border-color: var(--cyber-magenta);
  box-shadow: 0 0 20px rgba(255, 0, 255, 0.3);
}

.stream-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.stream-label {
  font-size: 0.8rem;
  color: var(--cyber-cyan);
  letter-spacing: 0.1em;
}

.stream-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--cyber-green);
}

.stream-canvas {
  width: 100%;
  height: 40px;
  border: 1px solid rgba(0, 255, 255, 0.3);
  background: rgba(0, 0, 0, 0.5);
}

/* Typography Matrix */
.typography-matrix {
  opacity: 0;
  transform: translateY(30px);
  transition: all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.typography-matrix.matrix-initialized {
  opacity: 1;
  transform: translateY(0);
}

.title-sequence {
  margin-bottom: 3rem;
}

.title-block {
  margin-bottom: 2rem;
}

.title-prefix {
  display: block;
  font-size: 0.9rem;
  color: var(--cyber-green);
  margin-bottom: 1rem;
  letter-spacing: 0.2em;
  opacity: 0.8;
}

.cyber-title {
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: bold;
  line-height: 1.1;
  margin: 0;
}

.title-segment {
  display: block;
  margin-bottom: 0.2rem;
  color: var(--cyber-cyan);
  text-shadow: 0 0 20px var(--cyber-cyan);
}

.title-segment.highlight {
  color: var(--cyber-magenta);
  text-shadow: 0 0 20px var(--cyber-magenta);
  animation: titlePulse 2s ease-in-out infinite;
}

@keyframes titlePulse {
  0%, 100% { 
    text-shadow: 0 0 20px var(--cyber-magenta);
    transform: scale(1);
  }
  50% { 
    text-shadow: 0 0 30px var(--cyber-magenta), 0 0 40px var(--cyber-magenta);
    transform: scale(1.02);
  }
}

.subtitle-matrix {
  margin-bottom: 2rem;
}

.cyber-subtitle {
  font-size: 1.2rem;
  line-height: 1.6;
  color: rgba(0, 255, 255, 0.8);
  max-width: 600px;
}

.accent-text {
  color: var(--cyber-yellow);
  font-weight: bold;
}

.highlight-text {
  color: var(--cyber-magenta);
  font-weight: bold;
  text-shadow: 0 0 10px var(--cyber-magenta);
}

/* Cybernetic Metrics Dashboard */
.metrics-dashboard {
  opacity: 0;
  transform: translateY(30px);
  transition: all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid var(--cyber-cyan);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.metrics-dashboard.dashboard-online {
  opacity: 1;
  transform: translateY(0);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--cyber-cyan);
}

.dashboard-title {
  font-size: 1rem;
  color: var(--cyber-cyan);
  font-weight: bold;
  letter-spacing: 0.1em;
}

.metrics-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--cyber-green);
  box-shadow: 0 0 10px var(--cyber-green);
  animation: statusPulse 2s ease-in-out infinite;
}

@keyframes statusPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.status-text {
  font-size: 0.8rem;
  color: var(--cyber-green);
  font-weight: bold;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.metric-node {
  position: relative;
  background: rgba(0, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.4s ease;
  overflow: hidden;
}

.metric-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, var(--cyber-cyan) 0%, transparent 70%);
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.5s ease;
  z-index: 0;
}

.metric-node.node-activated .metric-glow {
  transform: translate(-50%, -50%) scale(1);
}

.metric-display {
  position: relative;
  z-index: 2;
  margin-bottom: 1rem;
}

.metric-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--cyber-cyan);
  margin-bottom: 0.5rem;
  text-shadow: 0 0 10px var(--cyber-cyan);
}

.metric-label {
  font-size: 0.8rem;
  color: rgba(0, 255, 255, 0.7);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.metric-graph {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: end;
  justify-content: center;
  gap: 2px;
  height: 30px;
}

.graph-bar {
  width: 3px;
  background: linear-gradient(to top, var(--cyber-cyan), var(--cyber-magenta));
  border-radius: 1px;
  transition: height 0.5s ease;
  opacity: 0.7;
}

.metric-node.node-activated .graph-bar {
  opacity: 1;
  box-shadow: 0 0 5px var(--cyber-cyan);
}

/* Action Interface */
.action-interface {
  opacity: 0;
  transform: translateY(30px);
  transition: all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.action-interface.interface-ready {
  opacity: 1;
  transform: translateY(0);
}

.cyber-action {
  position: relative;
  padding: 1.2rem 2rem;
  background: transparent;
  border: 2px solid var(--cyber-cyan);
  color: var(--cyber-cyan);
  font-family: inherit;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.4s ease;
  min-width: 200px;
}

.action-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-magenta));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
  z-index: 1;
}

.action-content {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
}

.action-icon {
  width: 20px;
  height: 20px;
}

.icon-matrix {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  width: 100%;
  height: 100%;
}

.matrix-dot {
  background: currentColor;
  border-radius: 50%;
  animation: matrixPulse 2s ease-in-out infinite;
}

.matrix-dot:nth-child(odd) {
  animation-delay: 0.2s;
}

@keyframes matrixPulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.icon-scan {
  position: relative;
  width: 100%;
  height: 100%;
}

.scan-element {
  position: absolute;
  border: 1px solid currentColor;
  border-radius: 2px;
}

.scan-element:nth-child(1) {
  top: 0;
  left: 0;
  width: 6px;
  height: 6px;
}

.scan-element:nth-child(2) {
  top: 0;
  right: 0;
  width: 6px;
  height: 6px;
}

.scan-element:nth-child(3) {
  bottom: 0;
  left: 0;
  width: 6px;
  height: 6px;
}

.scan-element:nth-child(4) {
  bottom: 0;
  right: 0;
  width: 6px;
  height: 6px;
}

.action-energy {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.3), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
  z-index: 2;
}

.cyber-action:hover {
  border-color: var(--cyber-magenta);
  color: var(--cyber-magenta);
  box-shadow: 0 0 30px var(--cyber-glow);
  transform: translateY(-2px);
}

.cyber-action:hover .action-background {
  transform: scaleX(1);
}

.cyber-action:hover .action-energy {
  transform: translateX(100%);
}

.primary-action {
  border-color: var(--cyber-magenta);
  color: var(--cyber-magenta);
}

.secondary-action {
  border-color: var(--cyber-yellow);
  color: var(--cyber-yellow);
}

/* Continue with Neural Network Features, Digital Commerce, and Final Interface sections... */

/* Revolutionary Responsive System */
@media (max-width: 768px) {
  .interface-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 0 1rem;
  }
  
  .cyber-title {
    font-size: clamp(2rem, 8vw, 3rem);
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .action-interface {
    flex-direction: column;
    align-items: center;
  }
  
  .cyber-action {
    width: 100%;
    max-width: 300px;
  }
  
  .nav-menu {
    display: none;
  }
}

/* Performance Optimizations */
.cyberpunk-landing * {
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* Focus Management */
.nav-node:focus,
.cyber-button:focus,
.cyber-action:focus {
  outline: 2px solid var(--cyber-cyan);
  outline-offset: 2px;
}

/* Print Styles */
@media print {
  .matrix-core,
  .cyber-hud {
    display: none;
  }
  
  .cyberpunk-landing {
    background: white;
    color: black;
  }
}
</style>