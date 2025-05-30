<template>
  <div class="stylish-landing">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-background">
        <div class="hero-overlay"></div>
      </div>
      <div class="hero-content">
        <div class="hero-text" :class="{ 'fade-in': isLoaded }">
          <div class="hero-subtitle">INSTAGRAM EXCELLENCE</div>
          <h1 class="hero-title">
            <span class="title-line">Social Media</span>
            <span class="title-line accent">Perfection</span>
          </h1>
          <p class="hero-description">
            Curate, schedule, and execute your Instagram strategy with 
            unprecedented elegance and precision.
          </p>
          <div class="hero-actions">
            <button class="btn-primary">Start Your Journey</button>
            <button class="btn-secondary">Watch Demo</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="section-content">
        <div class="section-header">
          <h2 class="section-title">Refined Excellence</h2>
          <p class="section-subtitle">
            Every detail crafted for the discerning professional
          </p>
        </div>
        
        <div class="features-grid">
          <div 
            v-for="(feature, index) in features" 
            :key="index"
            class="feature-card"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <div class="feature-icon">
              <component :is="feature.icon" />
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats-section">
      <div class="section-content">
        <div class="stats-grid">
          <div 
            v-for="(stat, index) in stats" 
            :key="index"
            class="stat-item"
          >
            <div class="stat-number">{{ stat.number }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section class="pricing-section">
      <div class="section-content">
        <div class="section-header">
          <h2 class="section-title">Investment Tiers</h2>
          <p class="section-subtitle">
            Choose the level of excellence that suits your ambition
          </p>
        </div>
        
        <div class="pricing-grid">
          <div 
            v-for="(plan, index) in pricingPlans" 
            :key="index"
            class="pricing-card"
            :class="{ 'featured': plan.featured }"
          >
            <div class="plan-header">
              <h3 class="plan-name">{{ plan.name }}</h3>
              <div class="plan-price">
                <span class="price-currency">$</span>
                <span class="price-amount">{{ plan.price }}</span>
                <span class="price-period">/month</span>
              </div>
            </div>
            <ul class="plan-features">
              <li v-for="feature in plan.features" :key="feature">
                {{ feature }}
              </li>
            </ul>
            <button class="plan-button" :class="{ 'primary': plan.featured }">
              {{ plan.buttonText }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="section-content">
        <div class="cta-content">
          <h2 class="cta-title">Ready to Elevate?</h2>
          <p class="cta-description">
            Join the elite who understand that excellence is not a destination, but a journey.
          </p>
          <button class="btn-primary large">Begin Your Transformation</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isLoaded = ref(false)

const features = [
  {
    icon: 'ClockIcon',
    title: 'Precision Timing',
    description: 'Schedule with microsecond accuracy for optimal engagement windows.'
  },
  {
    icon: 'TargetIcon', 
    title: 'Strategic Curation',
    description: 'AI-powered content optimization for maximum impact and reach.'
  },
  {
    icon: 'AnalyticsIcon',
    title: 'Deep Intelligence',
    description: 'Comprehensive analytics that reveal the science behind your success.'
  },
  {
    icon: 'SecurityIcon',
    title: 'Absolute Security',
    description: 'Enterprise-grade protection for your most valuable digital assets.'
  }
]

const stats = [
  { number: '99.9%', label: 'Uptime Excellence' },
  { number: '2.3M+', label: 'Posts Delivered' },
  { number: '847%', label: 'Average Growth' },
  { number: '24/7', label: 'Elite Support' }
]

const pricingPlans = [
  {
    name: 'Essential',
    price: '29',
    features: [
      '3 Instagram Accounts',
      '100 Scheduled Posts',
      'Basic Analytics',
      'Email Support'
    ],
    buttonText: 'Start Essential',
    featured: false
  },
  {
    name: 'Professional',
    price: '79',
    features: [
      '10 Instagram Accounts',
      'Unlimited Posts',
      'Advanced Analytics',
      'Priority Support',
      'Custom Branding'
    ],
    buttonText: 'Go Professional',
    featured: true
  },
  {
    name: 'Enterprise',
    price: '199',
    features: [
      'Unlimited Accounts',
      'White Label Solution',
      'API Access',
      'Dedicated Success Manager',
      'Custom Integrations'
    ],
    buttonText: 'Contact Sales',
    featured: false
  }
]

onMounted(() => {
  setTimeout(() => {
    isLoaded.value = true
  }, 100)
})
</script>

<style scoped>
.stylish-landing {
  background: #000;
  color: #fff;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.6;
  overflow-x: hidden;
}

/* Hero Section */
.hero-section {
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #000 0%, #1a1a1a 100%);
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.05) 0%, transparent 50%);
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 900px;
  padding: 0 2rem;
}

.hero-text {
  opacity: 0;
  transform: translateY(30px);
  transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.hero-text.fade-in {
  opacity: 1;
  transform: translateY(0);
}

.hero-subtitle {
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.2em;
  color: #888;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
}

.hero-title {
  font-size: clamp(3rem, 8vw, 6rem);
  font-weight: 200;
  line-height: 1.1;
  margin-bottom: 2rem;
  letter-spacing: -0.02em;
}

.title-line {
  display: block;
}

.title-line.accent {
  background: linear-gradient(135deg, #7877C6 0%, #C6A6F7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 300;
}

.hero-description {
  font-size: 1.25rem;
  color: #bbb;
  max-width: 600px;
  margin: 0 auto 3rem;
  font-weight: 300;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Buttons */
.btn-primary, .btn-secondary {
  padding: 1rem 2.5rem;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  letter-spacing: 0.025em;
  position: relative;
  overflow: hidden;
}

.btn-primary {
  background: linear-gradient(135deg, #7877C6 0%, #C6A6F7 100%);
  color: #fff;
  border-radius: 0;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 40px rgba(120, 119, 198, 0.3);
}

.btn-primary.large {
  padding: 1.25rem 3rem;
  font-size: 1.125rem;
}

.btn-secondary {
  background: transparent;
  color: #fff;
  border: 1px solid #333;
}

.btn-secondary:hover {
  background: #fff;
  color: #000;
  border-color: #fff;
}

/* Sections */
section {
  padding: 8rem 0;
}

.section-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-header {
  text-align: center;
  margin-bottom: 5rem;
}

.section-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 200;
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
}

.section-subtitle {
  font-size: 1.25rem;
  color: #888;
  max-width: 600px;
  margin: 0 auto;
  font-weight: 300;
}

/* Features Section */
.features-section {
  background: #0a0a0a;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 3rem;
}

.feature-card {
  text-align: center;
  padding: 3rem 2rem;
  border: 1px solid #222;
  background: rgba(255, 255, 255, 0.02);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.feature-card:hover {
  transform: translateY(-5px);
  border-color: #333;
  background: rgba(255, 255, 255, 0.04);
}

.feature-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 2rem;
  background: linear-gradient(135deg, #7877C6 0%, #C6A6F7 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 400;
  margin-bottom: 1rem;
  letter-spacing: -0.01em;
}

.feature-description {
  color: #888;
  font-weight: 300;
  line-height: 1.6;
}

/* Stats Section */
.stats-section {
  background: linear-gradient(135deg, #111 0%, #1a1a1a 100%);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 3rem;
  text-align: center;
}

.stat-number {
  font-size: clamp(3rem, 6vw, 5rem);
  font-weight: 200;
  background: linear-gradient(135deg, #7877C6 0%, #C6A6F7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

.stat-label {
  font-size: 1.125rem;
  color: #888;
  font-weight: 300;
  letter-spacing: 0.025em;
}

/* Pricing Section */
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  margin-top: 4rem;
}

.pricing-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid #222;
  padding: 3rem 2rem;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}

.pricing-card.featured {
  border-color: #7877C6;
  background: rgba(120, 119, 198, 0.05);
  transform: scale(1.05);
}

.pricing-card:hover {
  transform: translateY(-10px);
  border-color: #333;
}

.pricing-card.featured:hover {
  transform: scale(1.05) translateY(-10px);
}

.plan-header {
  margin-bottom: 3rem;
}

.plan-name {
  font-size: 1.5rem;
  font-weight: 400;
  margin-bottom: 2rem;
  letter-spacing: 0.025em;
}

.plan-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.25rem;
}

.price-currency {
  font-size: 1.5rem;
  color: #888;
}

.price-amount {
  font-size: 3.5rem;
  font-weight: 200;
  letter-spacing: -0.02em;
}

.price-period {
  font-size: 1rem;
  color: #888;
}

.plan-features {
  list-style: none;
  padding: 0;
  margin: 0 0 3rem 0;
}

.plan-features li {
  padding: 0.75rem 0;
  border-bottom: 1px solid #222;
  color: #ccc;
  font-weight: 300;
}

.plan-features li:last-child {
  border-bottom: none;
}

.plan-button {
  width: 100%;
  padding: 1rem;
  background: transparent;
  border: 1px solid #333;
  color: #fff;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  letter-spacing: 0.025em;
}

.plan-button.primary {
  background: linear-gradient(135deg, #7877C6 0%, #C6A6F7 100%);
  border-color: transparent;
}

.plan-button:hover {
  background: #fff;
  color: #000;
}

.plan-button.primary:hover {
  background: linear-gradient(135deg, #8988D6 0%, #D6B6FF 100%);
  color: #fff;
  transform: translateY(-2px);
}

/* CTA Section */
.cta-section {
  background: linear-gradient(135deg, #0a0a0a 0%, #000 100%);
  text-align: center;
}

.cta-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 200;
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
}

.cta-description {
  font-size: 1.25rem;
  color: #888;
  max-width: 600px;
  margin: 0 auto 3rem;
  font-weight: 300;
  line-height: 1.6;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn-primary, .btn-secondary {
    width: 100%;
    max-width: 300px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .pricing-card.featured {
    transform: none;
  }
}
</style>