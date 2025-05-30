<template>
  <div class="cyberpunk-pricing">
    <div class="scanlines"></div>
    <div class="neural-grid"></div>
    
    <!-- Header -->
    <header class="pricing-header">
      <div class="header-content">
        <h1 class="page-title">
          <span class="glitch-text" data-text="NEURAL">NEURAL</span>
          <span class="neon-text">ACCESS PROTOCOLS</span>
        </h1>
        <p class="header-subtitle">
          Choose your level of neural enhancement and digital dominance.<br>
          All plans include advanced AI algorithms and quantum-encrypted security.
        </p>
      </div>
    </header>

    <!-- Pricing Plans -->
    <section class="pricing-section">
      <div class="pricing-container">
        <div 
          class="pricing-card"
          v-for="(plan, index) in pricingPlans"
          :key="plan.id"
          :class="[
            'plan-' + plan.id,
            { featured: plan.featured, selected: selectedPlan === plan.id }
          ]"
          @click="selectPlan(plan.id)"
        >
          <!-- Featured Badge -->
          <div v-if="plan.featured" class="featured-badge">
            <span class="badge-text">MOST POPULAR</span>
            <div class="badge-glow"></div>
          </div>
          
          <!-- Plan Header -->
          <div class="plan-header">
            <div class="plan-icon">
              <div class="icon-container">
                <div class="hologram-icon" v-html="plan.icon"></div>
              </div>
            </div>
            <h3 class="plan-name">{{ plan.name }}</h3>
            <p class="plan-description">{{ plan.description }}</p>
          </div>
          
          <!-- Plan Pricing -->
          <div class="plan-pricing">
            <div class="price-container">
              <span class="currency">¥</span>
              <span class="price-amount">{{ plan.price.toLocaleString() }}</span>
              <span class="price-period">/{{ plan.period }}</span>
            </div>
            <div v-if="plan.originalPrice" class="original-price">
              ¥{{ plan.originalPrice.toLocaleString() }}/{{ plan.period }}
            </div>
            <div v-if="plan.discount" class="discount-badge">
              {{ plan.discount }}% OFF
            </div>
          </div>
          
          <!-- Plan Features -->
          <div class="plan-features">
            <div 
              class="feature-item"
              v-for="feature in plan.features"
              :key="feature.name"
              :class="{ premium: feature.premium }"
            >
              <div class="feature-icon">
                <span v-if="feature.available" class="check-icon">✓</span>
                <span v-else class="cross-icon">✗</span>
              </div>
              <span class="feature-text">{{ feature.name }}</span>
              <div v-if="feature.premium" class="premium-indicator">
                <span class="premium-text">PREMIUM</span>
              </div>
            </div>
          </div>
          
          <!-- Plan CTA -->
          <div class="plan-cta">
            <button 
              class="cta-button"
              :class="{ 
                primary: plan.featured,
                processing: processingPlan === plan.id
              }"
              @click.stop="subscribeToPlan(plan.id)"
              :disabled="processingPlan"
            >
              <span v-if="processingPlan === plan.id" class="processing-text">
                PROCESSING...
              </span>
              <span v-else class="cta-text">
                {{ plan.ctaText }}
              </span>
              <div class="button-particles"></div>
            </button>
            
            <div class="plan-guarantee">
              <span class="guarantee-icon">🛡️</span>
              <span class="guarantee-text">{{ plan.guarantee }}</span>
            </div>
          </div>
          
          <!-- Neural Enhancement Level -->
          <div class="enhancement-level">
            <span class="level-label">NEURAL ENHANCEMENT</span>
            <div class="level-bars">
              <div 
                class="level-bar"
                v-for="i in 5"
                :key="i"
                :class="{ active: i <= plan.enhancementLevel }"
              ></div>
            </div>
            <span class="level-text">LEVEL {{ plan.enhancementLevel }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Comparison Matrix -->
    <section class="comparison-section">
      <div class="section-header">
        <h2 class="section-title neon-cyan">FEATURE COMPARISON MATRIX</h2>
        <p class="section-subtitle">
          Detailed breakdown of neural capabilities across all access levels
        </p>
      </div>
      
      <div class="comparison-table">
        <div class="table-header">
          <div class="feature-column">NEURAL FEATURES</div>
          <div 
            class="plan-column"
            v-for="plan in pricingPlans"
            :key="'header-' + plan.id"
          >
            <div class="plan-name-header">{{ plan.name }}</div>
            <div class="plan-price-header">¥{{ plan.price.toLocaleString() }}</div>
          </div>
        </div>
        
        <div class="table-body">
          <div 
            class="feature-row"
            v-for="feature in comparisonFeatures"
            :key="feature.name"
            :class="{ highlighted: feature.highlighted }"
          >
            <div class="feature-name">
              <span class="feature-title">{{ feature.name }}</span>
              <span class="feature-description">{{ feature.description }}</span>
            </div>
            <div 
              class="feature-value"
              v-for="plan in pricingPlans"
              :key="'value-' + plan.id + '-' + feature.name"
            >
              <span 
                class="value-content"
                :class="getFeatureClass(feature.values[plan.id])"
              >
                {{ formatFeatureValue(feature.values[plan.id]) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="faq-section">
      <div class="section-header">
        <h2 class="section-title neon-magenta">NEURAL INTERFACE FAQ</h2>
        <p class="section-subtitle">
          Common questions about our cybernetic enhancement protocols
        </p>
      </div>
      
      <div class="faq-container">
        <div 
          class="faq-item"
          v-for="(faq, index) in faqItems"
          :key="index"
          :class="{ active: activeFaq === index }"
          @click="toggleFaq(index)"
        >
          <div class="faq-question">
            <span class="question-text">{{ faq.question }}</span>
            <div class="question-icon">
              <span class="icon" :class="{ rotated: activeFaq === index }">▼</span>
            </div>
          </div>
          <div class="faq-answer">
            <p class="answer-text">{{ faq.answer }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="testimonials-section">
      <div class="section-header">
        <h2 class="section-title neon-green">NEURAL LINK TESTIMONIALS</h2>
        <p class="section-subtitle">
          Feedback from enhanced users in the digital matrix
        </p>
      </div>
      
      <div class="testimonials-grid">
        <div 
          class="testimonial-card"
          v-for="testimonial in testimonials"
          :key="testimonial.id"
        >
          <div class="testimonial-content">
            <div class="quote-icon">"</div>
            <p class="testimonial-text">{{ testimonial.text }}</p>
          </div>
          <div class="testimonial-author">
            <div class="author-avatar">
              <img :src="testimonial.avatar" :alt="testimonial.name">
              <div class="neural-ring"></div>
            </div>
            <div class="author-info">
              <span class="author-name">{{ testimonial.name }}</span>
              <span class="author-title">{{ testimonial.title }}</span>
              <div class="author-stats">
                <span class="stat">{{ testimonial.followers }} followers</span>
                <span class="stat">{{ testimonial.engagement }}% engagement</span>
              </div>
            </div>
            <div class="testimonial-rating">
              <div class="stars">
                <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= testimonial.rating }">★</span>
              </div>
              <span class="rating-text">{{ testimonial.rating }}/5</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Security Banner -->
    <section class="security-section">
      <div class="security-container">
        <div class="security-icon">
          <div class="shield-icon">🛡️</div>
          <div class="security-waves">
            <div class="wave" v-for="i in 3" :key="i"></div>
          </div>
        </div>
        <div class="security-content">
          <h3 class="security-title">QUANTUM-ENCRYPTED SECURITY</h3>
          <p class="security-description">
            All neural transmissions are protected by military-grade quantum encryption.<br>
            Your digital consciousness is safe in our cybernetic matrix.
          </p>
          <div class="security-features">
            <div class="security-feature">
              <span class="feature-icon">🔐</span>
              <span class="feature-name">256-bit Neural Encryption</span>
            </div>
            <div class="security-feature">
              <span class="feature-icon">🌐</span>
              <span class="feature-name">Global CDN Network</span>
            </div>
            <div class="security-feature">
              <span class="feature-icon">⚡</span>
              <span class="feature-name">99.99% Uptime SLA</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Processing Overlay -->
    <div v-if="processingPlan" class="processing-overlay">
      <div class="processing-content">
        <div class="processing-animation">
          <div class="neural-processor">
            <div class="processor-core"></div>
            <div class="processor-rings">
              <div class="ring" v-for="i in 4" :key="i"></div>
            </div>
          </div>
        </div>
        <h3 class="processing-title">INITIALIZING NEURAL UPGRADE</h3>
        <p class="processing-message">{{ processingMessage }}</p>
        <div class="processing-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: processingProgress + '%' }"></div>
          </div>
          <span class="progress-text">{{ processingProgress }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// Reactive data
const selectedPlan = ref('')
const activeFaq = ref<number | null>(null)
const processingPlan = ref('')
const processingProgress = ref(0)
const processingMessage = ref('Establishing neural connection...')

// Pricing plans data
const pricingPlans = ref([
  {
    id: 'initiate',
    name: 'INITIATE',
    description: 'Entry-level neural interface for digital newcomers',
    icon: '👤',
    price: 999,
    period: 'month',
    originalPrice: null,
    discount: null,
    featured: false,
    enhancementLevel: 1,
    ctaText: 'BEGIN INITIATION',
    guarantee: '7-day trial period',
    features: [
      { name: '3 Neural Links', available: true, premium: false },
      { name: '100 Automated Posts', available: true, premium: false },
      { name: 'Basic AI Scheduling', available: true, premium: false },
      { name: 'Standard Analytics', available: true, premium: false },
      { name: 'Email Support', available: true, premium: false },
      { name: 'Advanced AI Enhancement', available: false, premium: false },
      { name: 'Priority Neural Bandwidth', available: false, premium: false },
      { name: 'Custom Neural Training', available: false, premium: false }
    ]
  },
  {
    id: 'hacker',
    name: 'HACKER',
    description: 'Advanced neural capabilities for digital warriors',
    icon: '🤖',
    price: 2999,
    period: 'month',
    originalPrice: 3999,
    discount: 25,
    featured: true,
    enhancementLevel: 3,
    ctaText: 'INITIATE HACK',
    guarantee: '14-day money back',
    features: [
      { name: '10 Neural Links', available: true, premium: false },
      { name: '1,000 Automated Posts', available: true, premium: false },
      { name: 'Advanced AI Scheduling', available: true, premium: false },
      { name: 'Deep Analytics Suite', available: true, premium: false },
      { name: 'Priority Support Channel', available: true, premium: false },
      { name: 'Advanced AI Enhancement', available: true, premium: true },
      { name: 'Priority Neural Bandwidth', available: true, premium: true },
      { name: 'Custom Neural Training', available: false, premium: false }
    ]
  },
  {
    id: 'architect',
    name: 'ARCHITECT',
    description: 'Ultimate control over the digital matrix',
    icon: '⚡',
    price: 9999,
    period: 'month',
    originalPrice: null,
    discount: null,
    featured: false,
    enhancementLevel: 5,
    ctaText: 'BECOME ARCHITECT',
    guarantee: '30-day guarantee',
    features: [
      { name: 'Unlimited Neural Links', available: true, premium: false },
      { name: '10,000 Automated Posts', available: true, premium: false },
      { name: 'Neural Network Priority', available: true, premium: false },
      { name: 'Quantum Analytics Engine', available: true, premium: false },
      { name: 'Dedicated Neural Specialist', available: true, premium: false },
      { name: 'Advanced AI Enhancement', available: true, premium: true },
      { name: 'Priority Neural Bandwidth', available: true, premium: true },
      { name: 'Custom Neural Training', available: true, premium: true }
    ]
  }
])

// Comparison features
const comparisonFeatures = ref([
  {
    name: 'Neural Links',
    description: 'Connected Instagram accounts',
    highlighted: false,
    values: {
      initiate: '3',
      hacker: '10',
      architect: 'Unlimited'
    }
  },
  {
    name: 'Monthly Posts',
    description: 'Automated posts per month',
    highlighted: true,
    values: {
      initiate: '100',
      hacker: '1,000',
      architect: '10,000'
    }
  },
  {
    name: 'AI Enhancement',
    description: 'Advanced neural algorithms',
    highlighted: false,
    values: {
      initiate: false,
      hacker: true,
      architect: true
    }
  },
  {
    name: 'Analytics Suite',
    description: 'Performance analytics depth',
    highlighted: false,
    values: {
      initiate: 'Basic',
      hacker: 'Advanced',
      architect: 'Quantum'
    }
  },
  {
    name: 'Support Level',
    description: 'Customer support tier',
    highlighted: false,
    values: {
      initiate: 'Email',
      hacker: 'Priority',
      architect: 'Dedicated'
    }
  },
  {
    name: 'Neural Training',
    description: 'Custom AI model training',
    highlighted: true,
    values: {
      initiate: false,
      hacker: false,
      architect: true
    }
  }
])

// FAQ data
const faqItems = ref([
  {
    question: 'How does neural link establishment work?',
    answer: 'Our quantum-encrypted interface establishes a secure connection to your Instagram accounts through the Graph API. The process involves authentication, permission verification, and neural synchronization to ensure seamless control over your digital presence.'
  },
  {
    question: 'What happens if I exceed my monthly post limit?',
    answer: 'When you approach your limit, our AI will optimize your posting schedule to maximize engagement within your plan. You can upgrade at any time to increase your neural capacity, or wait for the next cycle to reset your limits.'
  },
  {
    question: 'Can I switch between enhancement levels?',
    answer: 'Yes, you can upgrade or downgrade your neural enhancement level at any time. Upgrades take effect immediately, while downgrades take effect at the next billing cycle to ensure continuous service.'
  },
  {
    question: 'Is my data secure in the neural matrix?',
    answer: 'Absolutely. All data transmissions are protected by military-grade 256-bit quantum encryption. We employ advanced cybersecurity protocols and never store your Instagram credentials permanently. Your digital consciousness remains private and secure.'
  },
  {
    question: 'What is the neural enhancement level system?',
    answer: 'Neural enhancement levels represent the sophistication of our AI algorithms applied to your content. Higher levels include advanced pattern recognition, predictive analytics, quantum optimization, and personalized neural network training.'
  },
  {
    question: 'Do you offer enterprise-level neural solutions?',
    answer: 'Yes, we provide custom enterprise solutions for large organizations requiring multiple architect-level accounts, dedicated infrastructure, and specialized neural configurations. Contact our cybernetics team for details.'
  }
])

// Testimonials data
const testimonials = ref([
  {
    id: 1,
    name: 'Neo Takahashi',
    title: 'Digital Matrix Architect',
    avatar: 'https://picsum.photos/60/60?random=1',
    text: 'The neural interface revolutionized my Instagram strategy. The AI algorithms are incredibly sophisticated, and the engagement rates have increased by 400%. It\'s like having a cybernetic brain managing my digital presence.',
    rating: 5,
    followers: '250K',
    engagement: '12.7'
  },
  {
    id: 2,
    name: 'Trinity Chen',
    title: 'Cyber Influencer',
    avatar: 'https://picsum.photos/60/60?random=2',
    text: 'I was skeptical about AI-powered posting, but this neural network understands my audience better than I do. The quantum analytics provide insights I never knew existed. Absolutely mind-blowing technology.',
    rating: 5,
    followers: '180K',
    engagement: '9.4'
  },
  {
    id: 3,
    name: 'Morpheus Smith',
    title: 'Tech Brand Manager',
    avatar: 'https://picsum.photos/60/60?random=3',
    text: 'Managing 15 brand accounts was overwhelming until I discovered this neural enhancement system. The automated scheduling and AI optimization saved me 30 hours per week while tripling our reach.',
    rating: 5,
    followers: '95K',
    engagement: '15.2'
  },
  {
    id: 4,
    name: 'Agent Williams',
    title: 'Digital Marketing Specialist',
    avatar: 'https://picsum.photos/60/60?random=4',
    text: 'The cyberpunk aesthetic is just the surface - the real power is in the neural algorithms. This system predicts viral content with 87% accuracy. It\'s like seeing the Matrix code of social media.',
    rating: 4,
    followers: '67K',
    engagement: '8.9'
  }
])

// Methods
const selectPlan = (planId: string) => {
  selectedPlan.value = planId
}

const subscribeToPlan = async (planId: string) => {
  processingPlan.value = planId
  processingProgress.value = 0
  
  const messages = [
    'Establishing neural connection...',
    'Authenticating digital identity...',
    'Initializing quantum algorithms...',
    'Configuring neural interface...',
    'Finalizing cybernetic enhancement...'
  ]
  
  let messageIndex = 0
  const interval = setInterval(() => {
    processingProgress.value += Math.random() * 15
    
    if (messageIndex < messages.length - 1 && processingProgress.value > (messageIndex + 1) * 20) {
      messageIndex++
      processingMessage.value = messages[messageIndex]
    }
    
    if (processingProgress.value >= 100) {
      processingProgress.value = 100
      processingMessage.value = 'Neural enhancement complete!'
      clearInterval(interval)
      
      setTimeout(() => {
        processingPlan.value = ''
        alert(`Successfully subscribed to ${pricingPlans.value.find(p => p.id === planId)?.name} plan!`)
      }, 1000)
    }
  }, 200)
}

const toggleFaq = (index: number) => {
  activeFaq.value = activeFaq.value === index ? null : index
}

const getFeatureClass = (value: any) => {
  if (value === true) return 'available'
  if (value === false) return 'unavailable'
  return 'value'
}

const formatFeatureValue = (value: any) => {
  if (value === true) return '✓'
  if (value === false) return '✗'
  return value
}

onMounted(() => {
  // Select featured plan by default
  const featuredPlan = pricingPlans.value.find(p => p.featured)
  if (featuredPlan) {
    selectedPlan.value = featuredPlan.id
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

/* Base Styles */
.cyberpunk-pricing {
  min-height: 100vh;
  background: #000;
  color: #00ffff;
  font-family: 'Orbitron', monospace;
  position: relative;
}

/* Effects */
.scanlines {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent 50%,
    rgba(0, 255, 255, 0.02) 51%
  );
  background-size: 100% 3px;
  pointer-events: none;
  z-index: 1;
}

.neural-grid {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px),
    radial-gradient(circle at 25% 25%, rgba(255, 0, 255, 0.1) 2px, transparent 2px),
    radial-gradient(circle at 75% 75%, rgba(0, 255, 0, 0.1) 2px, transparent 2px);
  background-size: 80px 80px, 80px 80px, 160px 160px, 240px 240px;
  pointer-events: none;
  z-index: 0;
}

/* Header */
.pricing-header {
  position: relative;
  z-index: 2;
  padding: 4rem 1rem 2rem;
  text-align: center;
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: 3.5rem;
  font-weight: 900;
  margin: 0 0 1.5rem 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.header-subtitle {
  font-size: 1.2rem;
  color: rgba(0, 255, 255, 0.8);
  line-height: 1.6;
  margin: 0;
}

/* Pricing Section */
.pricing-section {
  position: relative;
  z-index: 2;
  padding: 2rem 1rem;
}

.pricing-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.pricing-card {
  background: rgba(0, 0, 0, 0.9);
  border: 2px solid #00ffff;
  border-radius: 12px;
  padding: 2rem;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.pricing-card:hover,
.pricing-card.selected {
  border-color: #ff00ff;
  box-shadow: 0 0 30px rgba(255, 0, 255, 0.3);
  transform: translateY(-5px);
}

.pricing-card.featured {
  border-color: #ff00ff;
  box-shadow: 0 0 20px rgba(255, 0, 255, 0.2);
  transform: scale(1.05);
}

.plan-initiate {
  border-color: #00ffff;
}

.plan-hacker {
  border-color: #ff00ff;
}

.plan-architect {
  border-color: #00ff00;
}

.featured-badge {
  position: absolute;
  top: -1rem;
  left: 50%;
  transform: translateX(-50%);
  background: #ff00ff;
  color: #000;
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.8rem;
  z-index: 10;
}

.badge-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #ff00ff;
  border-radius: 20px;
  filter: blur(10px);
  opacity: 0.3;
  z-index: -1;
}

/* Plan Header */
.plan-header {
  text-align: center;
  margin-bottom: 2rem;
}

.plan-icon {
  margin-bottom: 1rem;
}

.icon-container {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid currentColor;
  border-radius: 50%;
  background: rgba(0, 255, 255, 0.1);
  position: relative;
}

.hologram-icon {
  font-size: 2.5rem;
  filter: drop-shadow(0 0 10px currentColor);
}

.plan-name {
  font-size: 2rem;
  font-weight: 900;
  margin: 0 0 0.5rem 0;
  color: currentColor;
}

.plan-description {
  color: rgba(0, 255, 255, 0.8);
  margin: 0;
  line-height: 1.5;
}

/* Plan Pricing */
.plan-pricing {
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
}

.price-container {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.currency {
  font-size: 1.5rem;
  color: rgba(0, 255, 255, 0.7);
  margin-right: 0.25rem;
}

.price-amount {
  font-size: 3.5rem;
  font-weight: 900;
  color: currentColor;
}

.price-period {
  font-size: 1.2rem;
  color: rgba(0, 255, 255, 0.7);
  margin-left: 0.25rem;
}

.original-price {
  text-decoration: line-through;
  color: rgba(0, 255, 255, 0.5);
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.discount-badge {
  display: inline-block;
  background: #ff0040;
  color: #fff;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 700;
}

/* Plan Features */
.plan-features {
  margin-bottom: 2rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: rgba(0, 255, 255, 0.05);
}

.feature-item.premium {
  background: rgba(255, 0, 255, 0.1);
  border: 1px solid rgba(255, 0, 255, 0.3);
}

.feature-icon {
  width: 20px;
  display: flex;
  justify-content: center;
}

.check-icon {
  color: #00ff00;
  font-weight: 700;
}

.cross-icon {
  color: rgba(255, 0, 64, 0.5);
  font-weight: 700;
}

.feature-text {
  flex: 1;
  color: rgba(0, 255, 255, 0.9);
}

.premium-indicator {
  background: rgba(255, 0, 255, 0.2);
  border: 1px solid #ff00ff;
  padding: 0.125rem 0.5rem;
  border-radius: 8px;
}

.premium-text {
  font-size: 0.7rem;
  font-weight: 700;
  color: #ff00ff;
}

/* Plan CTA */
.plan-cta {
  text-align: center;
}

.cta-button {
  width: 100%;
  background: transparent;
  border: 2px solid currentColor;
  color: currentColor;
  padding: 1rem 2rem;
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  font-size: 1rem;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  margin-bottom: 1rem;
}

.cta-button:hover {
  background: rgba(0, 255, 255, 0.1);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
}

.cta-button.primary {
  border-color: #ff00ff;
  color: #ff00ff;
}

.cta-button.primary:hover {
  background: rgba(255, 0, 255, 0.1);
  box-shadow: 0 0 20px rgba(255, 0, 255, 0.5);
}

.cta-button.processing {
  opacity: 0.7;
  cursor: not-allowed;
}

.button-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0;
  transition: opacity 0.3s ease;
  animation: particles 2s infinite linear;
}

.cta-button:hover .button-particles {
  opacity: 1;
}

.plan-guarantee {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: rgba(0, 255, 255, 0.7);
}

/* Enhancement Level */
.enhancement-level {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 255, 255, 0.2);
}

.level-label {
  display: block;
  font-size: 0.8rem;
  color: rgba(0, 255, 255, 0.7);
  margin-bottom: 0.5rem;
}

.level-bars {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-bottom: 0.5rem;
}

.level-bar {
  width: 8px;
  height: 20px;
  background: rgba(0, 255, 255, 0.2);
  border-radius: 2px;
  transition: all 0.3s ease;
}

.level-bar:nth-child(1) { height: 12px; }
.level-bar:nth-child(2) { height: 16px; }
.level-bar:nth-child(3) { height: 20px; }
.level-bar:nth-child(4) { height: 24px; }
.level-bar:nth-child(5) { height: 28px; }

.level-bar.active {
  background: currentColor;
  box-shadow: 0 0 8px currentColor;
}

.level-text {
  font-size: 0.8rem;
  font-weight: 700;
  color: currentColor;
}

/* Comparison Section */
.comparison-section {
  position: relative;
  z-index: 2;
  padding: 4rem 1rem;
  background: rgba(0, 0, 0, 0.5);
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 900;
  margin: 0 0 1rem 0;
}

.section-subtitle {
  font-size: 1.1rem;
  color: rgba(0, 255, 255, 0.8);
  margin: 0;
  line-height: 1.6;
}

.comparison-table {
  max-width: 1200px;
  margin: 0 auto;
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.8);
}

.table-header {
  display: grid;
  grid-template-columns: 2fr repeat(3, 1fr);
  background: rgba(0, 255, 255, 0.1);
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
}

.feature-column,
.plan-column {
  padding: 1.5rem 1rem;
  text-align: center;
  border-right: 1px solid rgba(0, 255, 255, 0.2);
}

.feature-column:last-child,
.plan-column:last-child {
  border-right: none;
}

.feature-column {
  text-align: left;
  font-weight: 700;
  color: #00ffff;
}

.plan-name-header {
  font-weight: 700;
  color: #00ffff;
  margin-bottom: 0.5rem;
}

.plan-price-header {
  font-size: 0.9rem;
  color: rgba(0, 255, 255, 0.7);
}

.table-body {
  display: flex;
  flex-direction: column;
}

.feature-row {
  display: grid;
  grid-template-columns: 2fr repeat(3, 1fr);
  border-bottom: 1px solid rgba(0, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.feature-row:hover {
  background: rgba(0, 255, 255, 0.05);
}

.feature-row.highlighted {
  background: rgba(255, 0, 255, 0.1);
  border-color: rgba(255, 0, 255, 0.3);
}

.feature-name,
.feature-value {
  padding: 1rem;
  border-right: 1px solid rgba(0, 255, 255, 0.1);
}

.feature-name:last-child,
.feature-value:last-child {
  border-right: none;
}

.feature-name {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.feature-title {
  font-weight: 700;
  color: #00ffff;
}

.feature-description {
  font-size: 0.8rem;
  color: rgba(0, 255, 255, 0.7);
}

.feature-value {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.value-content.available {
  color: #00ff00;
  font-weight: 700;
}

.value-content.unavailable {
  color: rgba(255, 0, 64, 0.5);
  font-weight: 700;
}

.value-content.value {
  color: #00ffff;
  font-weight: 700;
}

/* FAQ Section */
.faq-section {
  position: relative;
  z-index: 2;
  padding: 4rem 1rem;
}

.faq-container {
  max-width: 800px;
  margin: 0 auto;
}

.faq-item {
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 8px;
  margin-bottom: 1rem;
  background: rgba(0, 0, 0, 0.8);
  overflow: hidden;
  transition: all 0.3s ease;
}

.faq-item:hover {
  border-color: #ff00ff;
}

.faq-item.active {
  border-color: #ff00ff;
  background: rgba(255, 0, 255, 0.05);
}

.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  cursor: pointer;
  user-select: none;
}

.question-text {
  font-weight: 700;
  color: #00ffff;
  flex: 1;
}

.question-icon {
  margin-left: 1rem;
}

.icon {
  color: #ff00ff;
  transition: transform 0.3s ease;
}

.icon.rotated {
  transform: rotate(180deg);
}

.faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.faq-item.active .faq-answer {
  max-height: 200px;
}

.answer-text {
  padding: 0 1.5rem 1.5rem;
  color: rgba(0, 255, 255, 0.8);
  line-height: 1.6;
  margin: 0;
}

/* Testimonials Section */
.testimonials-section {
  position: relative;
  z-index: 2;
  padding: 4rem 1rem;
  background: rgba(0, 0, 0, 0.3);
}

.testimonials-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.testimonial-card {
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  padding: 2rem;
  transition: all 0.3s ease;
}

.testimonial-card:hover {
  border-color: #ff00ff;
  box-shadow: 0 0 20px rgba(255, 0, 255, 0.2);
  transform: translateY(-5px);
}

.testimonial-content {
  margin-bottom: 1.5rem;
  position: relative;
}

.quote-icon {
  position: absolute;
  top: -10px;
  left: -10px;
  font-size: 3rem;
  color: rgba(0, 255, 255, 0.3);
  font-family: serif;
}

.testimonial-text {
  color: rgba(0, 255, 255, 0.9);
  line-height: 1.6;
  margin: 0;
  padding-left: 2rem;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author-avatar {
  position: relative;
  width: 50px;
  height: 50px;
}

.author-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid #00ffff;
}

.neural-ring {
  position: absolute;
  top: -5px;
  left: -5px;
  width: 60px;
  height: 60px;
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 50%;
  animation: rotate 10s linear infinite;
}

.author-info {
  flex: 1;
}

.author-name {
  display: block;
  font-weight: 700;
  color: #00ffff;
  margin-bottom: 0.25rem;
}

.author-title {
  display: block;
  color: rgba(0, 255, 255, 0.7);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.author-stats {
  display: flex;
  gap: 1rem;
}

.stat {
  font-size: 0.8rem;
  color: rgba(0, 255, 255, 0.6);
}

.testimonial-rating {
  text-align: center;
}

.stars {
  margin-bottom: 0.25rem;
}

.star {
  color: rgba(255, 255, 0, 0.3);
  margin: 0 1px;
}

.star.filled {
  color: #ffff00;
  text-shadow: 0 0 5px #ffff00;
}

.rating-text {
  font-size: 0.8rem;
  color: rgba(0, 255, 255, 0.7);
}

/* Security Section */
.security-section {
  position: relative;
  z-index: 2;
  padding: 4rem 1rem;
  background: rgba(0, 0, 0, 0.8);
}

.security-container {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 3rem;
}

.security-icon {
  position: relative;
  width: 150px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shield-icon {
  font-size: 4rem;
  filter: drop-shadow(0 0 20px #00ffff);
}

.security-waves {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.wave {
  position: absolute;
  border: 2px solid rgba(0, 255, 255, 0.3);
  border-radius: 50%;
  animation: wave-pulse 3s infinite;
}

.wave:nth-child(1) {
  width: 100px;
  height: 100px;
  top: 25px;
  left: 25px;
  animation-delay: 0s;
}

.wave:nth-child(2) {
  width: 125px;
  height: 125px;
  top: 12.5px;
  left: 12.5px;
  animation-delay: 1s;
}

.wave:nth-child(3) {
  width: 150px;
  height: 150px;
  top: 0;
  left: 0;
  animation-delay: 2s;
}

.security-content {
  flex: 1;
}

.security-title {
  font-size: 2rem;
  font-weight: 900;
  color: #00ffff;
  margin: 0 0 1rem 0;
}

.security-description {
  color: rgba(0, 255, 255, 0.8);
  line-height: 1.6;
  margin: 0 0 2rem 0;
}

.security-features {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.security-feature {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.feature-icon {
  font-size: 1.5rem;
}

.feature-name {
  color: #00ffff;
  font-weight: 700;
}

/* Processing Overlay */
.processing-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.processing-content {
  text-align: center;
  padding: 3rem;
  border: 2px solid #00ffff;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.95);
  max-width: 500px;
}

.processing-animation {
  margin-bottom: 2rem;
}

.neural-processor {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto;
}

.processor-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: #00ffff;
  border-radius: 50%;
  animation: core-pulse 2s infinite;
}

.processor-rings {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.processor-rings .ring {
  position: absolute;
  border: 2px solid #00ffff;
  border-radius: 50%;
  animation: ring-rotate 3s infinite linear;
}

.processor-rings .ring:nth-child(1) {
  width: 80px;
  height: 80px;
  top: 60px;
  left: 60px;
  animation-duration: 3s;
}

.processor-rings .ring:nth-child(2) {
  width: 120px;
  height: 120px;
  top: 40px;
  left: 40px;
  animation-duration: 4s;
  animation-direction: reverse;
}

.processor-rings .ring:nth-child(3) {
  width: 160px;
  height: 160px;
  top: 20px;
  left: 20px;
  animation-duration: 5s;
}

.processor-rings .ring:nth-child(4) {
  width: 200px;
  height: 200px;
  top: 0;
  left: 0;
  animation-duration: 6s;
  animation-direction: reverse;
}

.processing-title {
  font-size: 1.8rem;
  font-weight: 900;
  color: #00ffff;
  margin: 0 0 1rem 0;
}

.processing-message {
  color: rgba(0, 255, 255, 0.8);
  margin: 0 0 2rem 0;
  font-size: 1.1rem;
}

.processing-progress {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.progress-bar {
  width: 100%;
  height: 10px;
  background: rgba(0, 255, 255, 0.2);
  border-radius: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00ffff, #ff00ff);
  transition: width 0.3s ease;
  border-radius: 5px;
}

.progress-text {
  font-size: 1.2rem;
  color: #00ffff;
  font-weight: 700;
}

/* Neon Effects */
.neon-text {
  text-shadow: 
    0 0 5px currentColor,
    0 0 10px currentColor,
    0 0 20px currentColor;
}

.neon-cyan {
  color: #00ffff;
  text-shadow: 0 0 10px #00ffff;
}

.neon-magenta {
  color: #ff00ff;
  text-shadow: 0 0 10px #ff00ff;
}

.neon-green {
  color: #00ff00;
  text-shadow: 0 0 10px #00ff00;
}

/* Glitch Effect */
.glitch-text {
  position: relative;
}

.glitch-text::before,
.glitch-text::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
}

.glitch-text:hover::before {
  animation: glitch-1 0.2s infinite;
  color: #ff00ff;
  opacity: 0.8;
}

.glitch-text:hover::after {
  animation: glitch-2 0.2s infinite;
  color: #00ff00;
  opacity: 0.8;
}

/* Animations */
@keyframes particles {
  0% { background-position: 0 0; }
  100% { background-position: 20px 20px; }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes wave-pulse {
  0%, 100% { 
    opacity: 0.3;
    transform: scale(1);
  }
  50% { 
    opacity: 1;
    transform: scale(1.1);
  }
}

@keyframes core-pulse {
  0%, 100% { 
    box-shadow: 0 0 20px #00ffff;
    transform: translate(-50%, -50%) scale(1);
  }
  50% { 
    box-shadow: 0 0 40px #00ffff;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

@keyframes ring-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes glitch-1 {
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0); }
}

@keyframes glitch-2 {
  0% { transform: translate(0); }
  20% { transform: translate(2px, -2px); }
  40% { transform: translate(2px, 2px); }
  60% { transform: translate(-2px, -2px); }
  80% { transform: translate(-2px, 2px); }
  100% { transform: translate(0); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-title {
    font-size: 2.5rem;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .pricing-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .pricing-card.featured {
    transform: none;
  }
  
  .table-header,
  .feature-row {
    grid-template-columns: 1fr;
  }
  
  .plan-column,
  .feature-value {
    display: none;
  }
  
  .feature-column {
    display: block;
  }
  
  .security-container {
    flex-direction: column;
    text-align: center;
    gap: 2rem;
  }
  
  .security-features {
    align-items: center;
  }
  
  .testimonials-grid {
    grid-template-columns: 1fr;
  }
  
  .testimonial-author {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .author-stats {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .pricing-card {
    padding: 1.5rem;
  }
  
  .price-amount {
    font-size: 2.5rem;
  }
  
  .processing-content {
    padding: 2rem;
    margin: 1rem;
  }
  
  .neural-processor {
    width: 150px;
    height: 150px;
  }
}
</style>