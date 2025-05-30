<template>
  <div class="neumorphism-landing">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-card">
          <h1 class="hero-title">Omni Instagram</h1>
          <p class="hero-subtitle">Revolutionary social media scheduling with soft 3D design</p>
          <div class="hero-buttons">
            <button class="cta-button primary">Get Started</button>
            <button class="cta-button secondary">Watch Demo</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="section-title">
        <h2>Soft Features</h2>
      </div>
      <div class="features-grid">
        <div class="feature-card" v-for="feature in features" :key="feature.id">
          <div class="feature-icon">
            <i :class="feature.icon"></i>
          </div>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section class="pricing-section">
      <div class="section-title">
        <h2>Choose Your Plan</h2>
      </div>
      <div class="pricing-grid">
        <div class="pricing-card" v-for="plan in pricingPlans" :key="plan.id" :class="{ featured: plan.featured }">
          <div class="plan-header">
            <h3>{{ plan.name }}</h3>
            <div class="price">
              <span class="currency">$</span>
              <span class="amount">{{ plan.price }}</span>
              <span class="period">/month</span>
            </div>
          </div>
          <ul class="features-list">
            <li v-for="feature in plan.features" :key="feature">
              <i class="mdi mdi-check"></i>
              {{ feature }}
            </li>
          </ul>
          <button class="plan-button" :class="{ featured: plan.featured }">
            {{ plan.featured ? 'Start Free Trial' : 'Choose Plan' }}
          </button>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats-section">
      <div class="stats-grid">
        <div class="stat-card" v-for="stat in stats" :key="stat.id">
          <div class="stat-number">{{ stat.number }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const features = ref([
  {
    id: 1,
    icon: 'mdi mdi-calendar-clock',
    title: 'Smart Scheduling',
    description: 'Intelligent posting times with AI-powered optimization'
  },
  {
    id: 2,
    icon: 'mdi mdi-account-multiple',
    title: 'Multi-Account',
    description: 'Manage multiple Instagram accounts from one place'
  },
  {
    id: 3,
    icon: 'mdi mdi-chart-line',
    title: 'Analytics',
    description: 'Deep insights into your content performance'
  },
  {
    id: 4,
    icon: 'mdi mdi-image-multiple',
    title: 'Content Library',
    description: 'Organize and reuse your best content'
  },
  {
    id: 5,
    icon: 'mdi mdi-repeat',
    title: 'Auto Repost',
    description: 'Automatically repost your top-performing content'
  },
  {
    id: 6,
    icon: 'mdi mdi-shield-check',
    title: 'Secure & Safe',
    description: 'Bank-level security for your social media accounts'
  }
])

const pricingPlans = ref([
  {
    id: 1,
    name: 'Free',
    price: 0,
    featured: false,
    features: ['1 Instagram account', '10 posts per month', 'Basic scheduling', 'Email support']
  },
  {
    id: 2,
    name: 'Basic',
    price: 9,
    featured: false,
    features: ['3 Instagram accounts', '100 posts per month', 'Advanced scheduling', 'Priority support', 'Basic analytics']
  },
  {
    id: 3,
    name: 'Pro',
    price: 29,
    featured: true,
    features: ['10 Instagram accounts', '1000 posts per month', 'AI optimization', '24/7 support', 'Advanced analytics', 'Auto repost']
  },
  {
    id: 4,
    name: 'Business',
    price: 99,
    featured: false,
    features: ['Unlimited accounts', '10000 posts per month', 'White-label solution', 'Dedicated manager', 'Custom integrations', 'API access']
  }
])

const stats = ref([
  { id: 1, number: '50K+', label: 'Active Users' },
  { id: 2, number: '2M+', label: 'Posts Scheduled' },
  { id: 3, number: '99.9%', label: 'Uptime' },
  { id: 4, number: '24/7', label: 'Support' }
])
</script>

<style scoped>
.neumorphism-landing {
  background: #E0E5EC;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Hero Section */
.hero-section {
  padding: 80px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
}

.hero-content {
  max-width: 800px;
  width: 100%;
}

.hero-card {
  background: #E0E5EC;
  padding: 60px 40px;
  border-radius: 30px;
  text-align: center;
  box-shadow: 
    20px 20px 40px rgba(163, 177, 198, 0.6),
    -20px -20px 40px rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
}

.hero-card:hover {
  box-shadow: 
    25px 25px 50px rgba(163, 177, 198, 0.7),
    -25px -25px 50px rgba(255, 255, 255, 0.8);
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  color: #4A5568;
  margin-bottom: 20px;
  text-shadow: 
    2px 2px 4px rgba(163, 177, 198, 0.3),
    -2px -2px 4px rgba(255, 255, 255, 0.7);
}

.hero-subtitle {
  font-size: 1.3rem;
  color: #718096;
  margin-bottom: 40px;
  line-height: 1.6;
}

.hero-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-button {
  padding: 15px 30px;
  border: none;
  border-radius: 20px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #E0E5EC;
}

.cta-button.primary {
  color: #4299E1;
  box-shadow: 
    10px 10px 20px rgba(163, 177, 198, 0.6),
    -10px -10px 20px rgba(255, 255, 255, 0.7);
}

.cta-button.primary:hover {
  box-shadow: 
    5px 5px 10px rgba(163, 177, 198, 0.6),
    -5px -5px 10px rgba(255, 255, 255, 0.7);
  transform: translateY(2px);
}

.cta-button.primary:active {
  box-shadow: 
    inset 5px 5px 10px rgba(163, 177, 198, 0.6),
    inset -5px -5px 10px rgba(255, 255, 255, 0.7);
}

.cta-button.secondary {
  color: #718096;
  box-shadow: 
    inset 10px 10px 20px rgba(163, 177, 198, 0.6),
    inset -10px -10px 20px rgba(255, 255, 255, 0.7);
}

.cta-button.secondary:hover {
  box-shadow: 
    inset 5px 5px 10px rgba(163, 177, 198, 0.6),
    inset -5px -5px 10px rgba(255, 255, 255, 0.7);
}

/* Features Section */
.features-section {
  padding: 80px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  text-align: center;
  margin-bottom: 60px;
}

.section-title h2 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #4A5568;
  text-shadow: 
    2px 2px 4px rgba(163, 177, 198, 0.3),
    -2px -2px 4px rgba(255, 255, 255, 0.7);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.feature-card {
  background: #E0E5EC;
  padding: 40px 30px;
  border-radius: 25px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 
    15px 15px 30px rgba(163, 177, 198, 0.6),
    -15px -15px 30px rgba(255, 255, 255, 0.7);
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 
    20px 20px 40px rgba(163, 177, 198, 0.7),
    -20px -20px 40px rgba(255, 255, 255, 0.8);
}

.feature-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #E0E5EC;
  border-radius: 50%;
  box-shadow: 
    inset 10px 10px 20px rgba(163, 177, 198, 0.6),
    inset -10px -10px 20px rgba(255, 255, 255, 0.7);
}

.feature-icon i {
  font-size: 2rem;
  color: #4299E1;
}

.feature-card h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #4A5568;
  margin-bottom: 15px;
}

.feature-card p {
  color: #718096;
  line-height: 1.6;
}

/* Pricing Section */
.pricing-section {
  padding: 80px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
}

.pricing-card {
  background: #E0E5EC;
  padding: 40px 30px;
  border-radius: 25px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 
    15px 15px 30px rgba(163, 177, 198, 0.6),
    -15px -15px 30px rgba(255, 255, 255, 0.7);
}

.pricing-card.featured {
  transform: scale(1.05);
  box-shadow: 
    20px 20px 40px rgba(163, 177, 198, 0.7),
    -20px -20px 40px rgba(255, 255, 255, 0.8);
}

.pricing-card:hover {
  transform: translateY(-5px);
}

.pricing-card.featured:hover {
  transform: scale(1.05) translateY(-5px);
}

.plan-header {
  margin-bottom: 30px;
}

.plan-header h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #4A5568;
  margin-bottom: 10px;
}

.price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 5px;
}

.currency {
  font-size: 1.2rem;
  color: #718096;
}

.amount {
  font-size: 3rem;
  font-weight: 700;
  color: #4A5568;
}

.period {
  font-size: 1rem;
  color: #718096;
}

.features-list {
  list-style: none;
  padding: 0;
  margin-bottom: 30px;
}

.features-list li {
  padding: 8px 0;
  color: #718096;
  display: flex;
  align-items: center;
  gap: 10px;
}

.features-list i {
  color: #48BB78;
  font-size: 1.2rem;
}

.plan-button {
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 15px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #E0E5EC;
  color: #718096;
  box-shadow: 
    10px 10px 20px rgba(163, 177, 198, 0.6),
    -10px -10px 20px rgba(255, 255, 255, 0.7);
}

.plan-button.featured {
  color: #4299E1;
}

.plan-button:hover {
  box-shadow: 
    5px 5px 10px rgba(163, 177, 198, 0.6),
    -5px -5px 10px rgba(255, 255, 255, 0.7);
  transform: translateY(2px);
}

.plan-button:active {
  box-shadow: 
    inset 5px 5px 10px rgba(163, 177, 198, 0.6),
    inset -5px -5px 10px rgba(255, 255, 255, 0.7);
}

/* Stats Section */
.stats-section {
  padding: 80px 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
}

.stat-card {
  background: #E0E5EC;
  padding: 40px 20px;
  border-radius: 25px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 
    inset 15px 15px 30px rgba(163, 177, 198, 0.6),
    inset -15px -15px 30px rgba(255, 255, 255, 0.7);
}

.stat-card:hover {
  box-shadow: 
    inset 10px 10px 20px rgba(163, 177, 198, 0.6),
    inset -10px -10px 20px rgba(255, 255, 255, 0.7);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #4299E1;
  margin-bottom: 10px;
}

.stat-label {
  color: #718096;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .cta-button {
    width: 100%;
    max-width: 300px;
  }
  
  .features-grid,
  .pricing-grid,
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .pricing-card.featured {
    transform: none;
  }
  
  .pricing-card.featured:hover {
    transform: translateY(-5px);
  }
}
</style>