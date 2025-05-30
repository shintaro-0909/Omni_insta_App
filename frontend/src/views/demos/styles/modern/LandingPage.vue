<template>
  <div class="modern-landing">
    <!-- Navigation Bar -->
    <v-app-bar 
      :elevation="0" 
      class="landing-nav" 
      color="transparent"
      :class="{ 'nav-scrolled': scrolled }"
    >
      <v-container>
        <v-row align="center" justify="space-between" no-gutters>
          <v-col cols="auto">
            <div class="d-flex align-center">
              <v-avatar size="40" class="brand-logo me-3">
                <v-icon icon="mdi-instagram" size="24" color="white"></v-icon>
              </v-avatar>
              <h2 class="brand-name">Omniy</h2>
            </div>
          </v-col>
          <v-col cols="auto">
            <v-btn
              variant="outlined"
              color="white"
              class="me-4 nav-btn"
              @click="scrollTo('features')"
            >
              Features
            </v-btn>
            <v-btn
              variant="outlined"
              color="white"
              class="me-4 nav-btn"
              @click="scrollTo('pricing')"
            >
              Pricing
            </v-btn>
            <v-btn
              color="primary"
              class="cta-btn"
              size="large"
              @click="getStarted"
            >
              Get Started
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-app-bar>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-bg">
        <div class="floating-elements">
          <div 
            v-for="i in 12" 
            :key="i" 
            class="floating-element"
            :style="{ 
              animationDelay: `${i * 0.3}s`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }"
          ></div>
        </div>
      </div>
      
      <v-container class="hero-content">
        <v-row justify="center" align="center" no-gutters>
          <v-col cols="12" md="8" lg="6" class="text-center">
            <h1 class="hero-title" data-aos="fade-up">
              Revolutionary
              <span class="gradient-text">Instagram</span>
              Automation
            </h1>
            <p class="hero-subtitle" data-aos="fade-up" data-aos-delay="200">
              Transform your social media presence with AI-powered scheduling, 
              intelligent posting, and performance optimization that generates 
              <span class="highlight">10x more engagement</span>
            </p>
            
            <div class="hero-stats" data-aos="fade-up" data-aos-delay="400">
              <div class="stat-item">
                <div class="stat-number">500K+</div>
                <div class="stat-label">Posts Automated</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">95%</div>
                <div class="stat-label">Time Saved</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">10M+</div>
                <div class="stat-label">Impressions Generated</div>
              </div>
            </div>

            <div class="hero-actions" data-aos="fade-up" data-aos-delay="600">
              <v-btn
                color="primary"
                size="x-large"
                class="hero-cta me-4"
                @click="getStarted"
              >
                <v-icon start>mdi-rocket-launch</v-icon>
                Start Free Trial
              </v-btn>
              <v-btn
                variant="outlined"
                color="white"
                size="x-large"
                class="hero-demo"
                @click="watchDemo"
              >
                <v-icon start>mdi-play-circle</v-icon>
                Watch Demo
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-container>

      <!-- Floating Dashboard Preview -->
      <div class="dashboard-preview" data-aos="fade-up" data-aos-delay="800">
        <v-card class="preview-card" elevation="24">
          <div class="preview-header">
            <div class="preview-controls">
              <div class="control red"></div>
              <div class="control yellow"></div>
              <div class="control green"></div>
            </div>
            <div class="preview-title">Omniy Dashboard</div>
          </div>
          <div class="preview-content">
            <div class="preview-chart">
              <canvas ref="previewChart" width="400" height="200"></canvas>
            </div>
          </div>
        </v-card>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="features-section">
      <v-container>
        <div class="section-header text-center mb-16">
          <h2 class="section-title" data-aos="fade-up">
            Supercharge Your Instagram Strategy
          </h2>
          <p class="section-subtitle" data-aos="fade-up" data-aos-delay="200">
            Revolutionary features that transform how you manage Instagram
          </p>
        </div>

        <v-row>
          <v-col 
            v-for="(feature, index) in features" 
            :key="index"
            cols="12" 
            md="4"
            class="mb-8"
          >
            <v-card 
              class="feature-card"
              :data-aos="'fade-up'"
              :data-aos-delay="index * 200"
              @mouseenter="onFeatureHover(index)"
              @mouseleave="onFeatureLeave(index)"
            >
              <div class="feature-icon-wrapper">
                <v-avatar 
                  size="80" 
                  class="feature-icon"
                  :class="{ active: hoveredFeature === index }"
                >
                  <v-icon :icon="feature.icon" size="40"></v-icon>
                </v-avatar>
              </div>
              
              <v-card-title class="feature-title">
                {{ feature.title }}
              </v-card-title>
              
              <v-card-text class="feature-description">
                {{ feature.description }}
              </v-card-text>

              <div class="feature-stats">
                <div class="feature-stat">
                  <div class="stat-value">{{ feature.stat.value }}</div>
                  <div class="stat-metric">{{ feature.stat.metric }}</div>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Pricing Section -->
    <section id="pricing" class="pricing-section">
      <v-container>
        <div class="section-header text-center mb-16">
          <h2 class="section-title" data-aos="fade-up">
            Choose Your Growth Plan
          </h2>
          <p class="section-subtitle" data-aos="fade-up" data-aos-delay="200">
            Transparent pricing that scales with your success
          </p>
        </div>

        <v-row justify="center">
          <v-col 
            v-for="(plan, index) in pricingPlans" 
            :key="index"
            cols="12" 
            md="4"
            lg="3"
          >
            <v-card 
              class="pricing-card"
              :class="{ featured: plan.featured }"
              :data-aos="'fade-up'"
              :data-aos-delay="index * 150"
              elevation="12"
            >
              <div v-if="plan.featured" class="featured-badge">
                Most Popular
              </div>
              
              <v-card-title class="plan-name">
                {{ plan.name }}
              </v-card-title>
              
              <div class="plan-price">
                <span class="price-currency">$</span>
                <span class="price-amount">{{ plan.price }}</span>
                <span class="price-period">/month</span>
              </div>
              
              <v-card-text>
                <v-list class="plan-features">
                  <v-list-item 
                    v-for="feature in plan.features" 
                    :key="feature"
                    class="plan-feature"
                  >
                    <template v-slot:prepend>
                      <v-icon color="success" size="20">mdi-check-circle</v-icon>
                    </template>
                    <v-list-item-title>{{ feature }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card-text>
              
              <v-card-actions class="pa-6">
                <v-btn
                  :color="plan.featured ? 'primary' : 'secondary'"
                  :variant="plan.featured ? 'flat' : 'outlined'"
                  size="large"
                  block
                  class="plan-cta"
                  @click="selectPlan(plan)"
                >
                  {{ plan.cta }}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- CTA Section -->
    <section class="final-cta-section">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" md="8" class="text-center">
            <h2 class="cta-title" data-aos="fade-up">
              Ready to Transform Your Instagram?
            </h2>
            <p class="cta-subtitle" data-aos="fade-up" data-aos-delay="200">
              Join thousands of creators who've revolutionized their social media presence
            </p>
            <v-btn
              color="primary"
              size="x-large"
              class="final-cta-btn"
              data-aos="fade-up"
              data-aos-delay="400"
              @click="getStarted"
            >
              <v-icon start>mdi-lightning-bolt</v-icon>
              Start Your Revolution
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import AOS from 'aos'
import 'aos/dist/aos.css'

// Reactive data
const scrolled = ref(false)
const hoveredFeature = ref(-1)
const previewChart = ref<HTMLCanvasElement | null>(null)

// Features data
const features = ref([
  {
    icon: 'mdi-brain',
    title: 'AI-Powered Scheduling',
    description: 'Machine learning algorithms analyze your audience behavior to optimize posting times for maximum engagement.',
    stat: { value: '300%', metric: 'More Engagement' }
  },
  {
    icon: 'mdi-chart-line',
    title: 'Advanced Analytics',
    description: 'Deep insights and predictive analytics help you understand what content performs best and when.',
    stat: { value: '85%', metric: 'Better ROI' }
  },
  {
    icon: 'mdi-auto-fix',
    title: 'Smart Automation',
    description: 'Intelligent content optimization, hashtag suggestions, and automatic post variations increase reach.',
    stat: { value: '500%', metric: 'Time Saved' }
  }
])

// Pricing plans
const pricingPlans = ref([
  {
    name: 'Starter',
    price: 9,
    featured: false,
    cta: 'Start Free Trial',
    features: [
      '1 Instagram Account',
      '50 Scheduled Posts',
      'Basic Analytics',
      'Email Support'
    ]
  },
  {
    name: 'Professional',
    price: 29,
    featured: true,
    cta: 'Get Started',
    features: [
      '5 Instagram Accounts',
      'Unlimited Posts',
      'Advanced Analytics',
      'AI Optimization',
      'Priority Support'
    ]
  },
  {
    name: 'Enterprise',
    price: 99,
    featured: false,
    cta: 'Contact Sales',
    features: [
      'Unlimited Accounts',
      'White Label Solution',
      'Custom Integrations',
      'Dedicated Manager',
      '24/7 Support'
    ]
  }
])

// Methods
const handleScroll = () => {
  scrolled.value = window.scrollY > 50
}

const scrollTo = (elementId: string) => {
  const element = document.getElementById(elementId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const onFeatureHover = (index: number) => {
  hoveredFeature.value = index
}

const onFeatureLeave = (index: number) => {
  hoveredFeature.value = -1
}

const getStarted = () => {
  // Navigation logic
  console.log('Get Started clicked')
}

const watchDemo = () => {
  // Demo modal logic
  console.log('Watch Demo clicked')
}

const selectPlan = (plan: any) => {
  console.log('Plan selected:', plan.name)
}

const drawPreviewChart = () => {
  if (!previewChart.value) return
  
  const canvas = previewChart.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Draw animated chart
  ctx.fillStyle = '#1976d2'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // Add gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, 'rgba(25, 118, 210, 0.8)')
  gradient.addColorStop(1, 'rgba(25, 118, 210, 0.1)')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

// Lifecycle
onMounted(() => {
  AOS.init({
    duration: 800,
    easing: 'ease-out-cubic',
    once: true
  })
  
  window.addEventListener('scroll', handleScroll)
  drawPreviewChart()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.modern-landing {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

/* Navigation */
.landing-nav {
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.nav-scrolled {
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(20px);
}

.brand-logo {
  background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);
}

.brand-name {
  color: white;
  font-weight: 700;
  font-size: 1.8rem;
  margin: 0;
}

.nav-btn {
  border-color: rgba(255, 255, 255, 0.3);
  color: white;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.cta-btn {
  background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 8px 32px rgba(240, 147, 251, 0.3);
  transition: all 0.3s ease;
}

.cta-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(240, 147, 251, 0.4);
}

/* Hero Section */
.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  padding-top: 80px;
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.floating-elements {
  position: absolute;
  width: 100%;
  height: 100%;
}

.floating-element {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.hero-content {
  position: relative;
  z-index: 2;
}

.hero-title {
  font-size: 4rem;
  font-weight: 900;
  color: white;
  line-height: 1.1;
  margin-bottom: 2rem;
}

.gradient-text {
  background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.4rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.highlight {
  color: #f093fb;
  font-weight: 600;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-bottom: 3rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 900;
  color: white;
  line-height: 1;
}

.stat-label {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 0.5rem;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.hero-cta, .hero-demo {
  font-size: 1.1rem;
  font-weight: 600;
  padding: 16px 32px;
  border-radius: 50px;
  transition: all 0.3s ease;
}

.hero-cta {
  background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 8px 32px rgba(240, 147, 251, 0.3);
}

.hero-cta:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(240, 147, 251, 0.4);
}

.hero-demo {
  border-color: rgba(255, 255, 255, 0.3);
  color: white;
}

.hero-demo:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-3px);
}

/* Dashboard Preview */
.dashboard-preview {
  position: absolute;
  bottom: -100px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
}

.preview-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.preview-header {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.preview-controls {
  display: flex;
  gap: 8px;
  margin-right: 16px;
}

.control {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.control.red { background: #ff5f56; }
.control.yellow { background: #ffbd2e; }
.control.green { background: #27ca3f; }

.preview-title {
  font-weight: 600;
  color: #333;
}

.preview-content {
  padding: 20px;
}

/* Features Section */
.features-section {
  padding: 120px 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.section-title {
  font-size: 3rem;
  font-weight: 800;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.section-subtitle {
  font-size: 1.3rem;
  color: #7f8c8d;
  max-width: 600px;
  margin: 0 auto;
}

.feature-card {
  height: 100%;
  padding: 2rem;
  border-radius: 20px;
  background: white;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.feature-icon-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.feature-icon {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  transition: all 0.3s ease;
}

.feature-icon.active {
  transform: scale(1.1) rotate(5deg);
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 1rem;
}

.feature-description {
  font-size: 1.1rem;
  color: #7f8c8d;
  line-height: 1.6;
  text-align: center;
  margin-bottom: 2rem;
}

.feature-stats {
  display: flex;
  justify-content: center;
}

.feature-stat {
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 900;
  color: #667eea;
}

.stat-metric {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-top: 0.5rem;
}

/* Pricing Section */
.pricing-section {
  padding: 120px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.pricing-section .section-title,
.pricing-section .section-subtitle {
  color: white;
}

.pricing-card {
  background: white;
  border-radius: 20px;
  position: relative;
  transition: all 0.3s ease;
  height: 100%;
}

.pricing-card.featured {
  transform: scale(1.05);
  border: 3px solid #f093fb;
  box-shadow: 0 20px 60px rgba(240, 147, 251, 0.3);
}

.pricing-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.pricing-card.featured:hover {
  transform: scale(1.05) translateY(-10px);
}

.featured-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);
  color: white;
  padding: 8px 24px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 4px 20px rgba(240, 147, 251, 0.3);
}

.plan-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  text-align: center;
  padding-top: 2rem;
}

.plan-price {
  text-align: center;
  margin: 1rem 0 2rem;
}

.price-currency {
  font-size: 1.5rem;
  color: #7f8c8d;
  vertical-align: top;
}

.price-amount {
  font-size: 3rem;
  font-weight: 900;
  color: #2c3e50;
}

.price-period {
  font-size: 1.2rem;
  color: #7f8c8d;
}

.plan-features {
  background: transparent;
}

.plan-feature {
  padding: 8px 0;
}

.plan-feature .v-list-item-title {
  font-size: 1rem;
  color: #5a6c7d;
}

.plan-cta {
  font-weight: 600;
  border-radius: 50px;
  padding: 16px;
  transition: all 0.3s ease;
}

.plan-cta:hover {
  transform: translateY(-2px);
}

/* Final CTA Section */
.final-cta-section {
  padding: 120px 0;
  background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
}

.cta-title {
  font-size: 3rem;
  font-weight: 800;
  color: white;
  margin-bottom: 1rem;
}

.cta-subtitle {
  font-size: 1.3rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 3rem;
}

.final-cta-btn {
  background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 8px 32px rgba(240, 147, 251, 0.3);
  font-size: 1.2rem;
  font-weight: 600;
  padding: 20px 40px;
  border-radius: 50px;
  transition: all 0.3s ease;
}

.final-cta-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(240, 147, 251, 0.4);
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .hero-stats {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .pricing-card.featured {
    transform: none;
  }
  
  .dashboard-preview {
    position: relative;
    bottom: auto;
    margin-top: 3rem;
  }
}
</style>