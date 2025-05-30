<template>
  <div class="glassmorphism-landing">
    <!-- Animated Background -->
    <div class="animated-bg">
      <div class="gradient-sphere sphere-1"></div>
      <div class="gradient-sphere sphere-2"></div>
      <div class="gradient-sphere sphere-3"></div>
    </div>

    <!-- Hero Section -->
    <section class="hero-section">
      <v-container class="py-16">
        <v-row align="center" justify="center">
          <v-col cols="12" md="8" class="text-center">
            <div class="glass-card hero-content">
              <h1 class="hero-title">
                Schedule Your Instagram
                <span class="gradient-text">Like Magic</span>
              </h1>
              <p class="hero-subtitle">
                Experience the future of social media management with our glassmorphism-inspired platform
              </p>
              <div class="mt-8">
                <v-btn class="glass-btn primary-btn mr-4" size="x-large">
                  <v-icon start>mdi-rocket-launch</v-icon>
                  Start Free Trial
                </v-btn>
                <v-btn class="glass-btn secondary-btn" size="x-large">
                  <v-icon start>mdi-play-circle</v-icon>
                  Watch Demo
                </v-btn>
              </div>
              <div class="mt-8 stats-container">
                <div class="stat-item">
                  <h3 class="stat-number">10K+</h3>
                  <p class="stat-label">Active Users</p>
                </div>
                <div class="stat-item">
                  <h3 class="stat-number">5M+</h3>
                  <p class="stat-label">Posts Scheduled</p>
                </div>
                <div class="stat-item">
                  <h3 class="stat-number">99.9%</h3>
                  <p class="stat-label">Uptime</p>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Features Section -->
    <section class="features-section py-16">
      <v-container>
        <h2 class="section-title text-center mb-12">Powerful Features</h2>
        <v-row>
          <v-col v-for="feature in features" :key="feature.icon" cols="12" md="4" class="mb-6">
            <div class="glass-card feature-card" @mouseenter="feature.hover = true" @mouseleave="feature.hover = false">
              <div class="feature-icon" :class="{ 'icon-hover': feature.hover }">
                <v-icon size="40" :color="feature.color">{{ feature.icon }}</v-icon>
              </div>
              <h3 class="feature-title">{{ feature.title }}</h3>
              <p class="feature-description">{{ feature.description }}</p>
              <v-btn class="glass-btn feature-btn mt-4" text>
                Learn More
                <v-icon end>mdi-arrow-right</v-icon>
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Pricing Section -->
    <section class="pricing-section py-16">
      <v-container>
        <h2 class="section-title text-center mb-12">Choose Your Plan</h2>
        <v-row justify="center">
          <v-col v-for="plan in plans" :key="plan.name" cols="12" md="3">
            <div class="glass-card pricing-card" :class="{ 'featured': plan.featured }">
              <div v-if="plan.featured" class="featured-badge">Most Popular</div>
              <h3 class="plan-name">{{ plan.name }}</h3>
              <div class="plan-price">
                <span class="currency">$</span>
                <span class="amount">{{ plan.price }}</span>
                <span class="period">/month</span>
              </div>
              <ul class="plan-features">
                <li v-for="feature in plan.features" :key="feature">
                  <v-icon size="20" color="success">mdi-check-circle</v-icon>
                  {{ feature }}
                </li>
              </ul>
              <v-btn class="glass-btn plan-btn" :class="{ 'primary-btn': plan.featured }" block>
                {{ plan.featured ? 'Get Started' : 'Choose Plan' }}
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- CTA Section -->
    <section class="cta-section py-16">
      <v-container>
        <div class="glass-card cta-card text-center">
          <h2 class="cta-title">Ready to Transform Your Instagram?</h2>
          <p class="cta-subtitle">Join thousands of creators and businesses already using Omniy</p>
          <v-btn class="glass-btn primary-btn mt-6" size="x-large">
            <v-icon start>mdi-rocket</v-icon>
            Start Your Free Trial
          </v-btn>
          <p class="mt-4 text-caption">No credit card required • 14-day free trial</p>
        </div>
      </v-container>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const features = reactive([
  {
    icon: 'mdi-calendar-clock',
    title: 'Smart Scheduling',
    description: 'Schedule posts weeks in advance with our intelligent timing suggestions',
    color: 'purple',
    hover: false
  },
  {
    icon: 'mdi-infinity',
    title: 'Recurring Posts',
    description: 'Set up posts that automatically repeat on your chosen schedule',
    color: 'blue',
    hover: false
  },
  {
    icon: 'mdi-dice-5',
    title: 'Random Posting',
    description: 'Keep your feed fresh with randomized posting intervals',
    color: 'pink',
    hover: false
  },
  {
    icon: 'mdi-account-group',
    title: 'Multi-Account',
    description: 'Manage multiple Instagram accounts from one dashboard',
    color: 'teal',
    hover: false
  },
  {
    icon: 'mdi-chart-line',
    title: 'Analytics',
    description: 'Track performance and optimize your posting strategy',
    color: 'orange',
    hover: false
  },
  {
    icon: 'mdi-shield-check',
    title: 'Secure & Reliable',
    description: 'Enterprise-grade security with 99.9% uptime guarantee',
    color: 'green',
    hover: false
  }
])

const plans = ref([
  {
    name: 'Free',
    price: 0,
    features: ['1 Instagram Account', '10 Posts/Month', 'Basic Scheduling', 'Email Support'],
    featured: false
  },
  {
    name: 'Basic',
    price: 9,
    features: ['3 Instagram Accounts', '100 Posts/Month', 'All Scheduling Types', 'Priority Support'],
    featured: false
  },
  {
    name: 'Pro',
    price: 29,
    features: ['10 Instagram Accounts', '1000 Posts/Month', 'Advanced Analytics', '24/7 Support'],
    featured: true
  },
  {
    name: 'Business',
    price: 99,
    features: ['Unlimited Accounts', '10000 Posts/Month', 'API Access', 'Dedicated Manager'],
    featured: false
  }
])
</script>

<style scoped>
.glassmorphism-landing {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #667eea 100%);
  background-size: 400% 400%;
  animation: gradientShift 20s ease infinite;
  position: relative;
  overflow-x: hidden;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Animated Background */
.animated-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.gradient-sphere {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.5;
}

.sphere-1 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(255,0,150,0.8) 0%, transparent 70%);
  top: -10%;
  left: -10%;
  animation: float 20s ease-in-out infinite;
}

.sphere-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(0,150,255,0.8) 0%, transparent 70%);
  top: 50%;
  right: -5%;
  animation: float 15s ease-in-out infinite reverse;
}

.sphere-3 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(150,0,255,0.8) 0%, transparent 70%);
  bottom: -5%;
  left: 30%;
  animation: float 25s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, -30px) scale(1.05); }
  50% { transform: translate(-20px, 20px) scale(0.95); }
  75% { transform: translate(-30px, -10px) scale(1.02); }
}

/* Glass Card Base Style */
.glass-card {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(31, 38, 135, 0.2);
}

/* Glass Button Style */
.glass-btn {
  background: rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: white !important;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  text-transform: none;
}

.glass-btn:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(31, 38, 135, 0.2);
}

.glass-btn.primary-btn {
  background: rgba(102, 126, 234, 0.4) !important;
  border: 1px solid rgba(102, 126, 234, 0.5) !important;
}

.glass-btn.primary-btn:hover {
  background: rgba(102, 126, 234, 0.6) !important;
}

.glass-btn.secondary-btn {
  background: rgba(255, 255, 255, 0.1) !important;
}

/* Hero Section */
.hero-section {
  position: relative;
  z-index: 1;
}

.hero-content {
  padding: 4rem 3rem;
  text-align: center;
}

.hero-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  color: white;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.gradient-text {
  background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: block;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  max-width: 600px;
  margin: 0 auto;
}

/* Stats Container */
.stats-container {
  display: flex;
  justify-content: center;
  gap: 3rem;
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Features Section */
.section-title {
  font-size: 3rem;
  font-weight: 700;
  color: white;
  margin-bottom: 3rem;
}

.feature-card {
  padding: 2.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.feature-icon {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
}

.feature-icon.icon-hover {
  transform: scale(1.1) rotate(5deg);
  background: rgba(255, 255, 255, 0.3);
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
  margin-bottom: 1rem;
}

.feature-description {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  flex-grow: 1;
}

.feature-btn {
  margin-top: auto;
}

/* Pricing Section */
.pricing-card {
  padding: 2.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
}

.pricing-card.featured {
  transform: scale(1.05);
  background: rgba(255, 255, 255, 0.35);
}

.featured-badge {
  position: absolute;
  top: -12px;
  right: 20px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  padding: 4px 16px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.plan-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
  margin-bottom: 1.5rem;
}

.plan-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 2rem;
}

.currency {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  margin-right: 0.25rem;
}

.amount {
  font-size: 3rem;
  font-weight: 700;
  color: white;
}

.period {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin-left: 0.5rem;
}

.plan-features {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
  flex-grow: 1;
}

.plan-features li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.9);
}

.plan-btn {
  width: 100%;
  margin-top: auto;
}

/* CTA Section */
.cta-card {
  padding: 4rem 3rem;
  max-width: 800px;
  margin: 0 auto;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
}

.cta-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
}

/* Responsive Design */
@media (max-width: 960px) {
  .stats-container {
    gap: 2rem;
  }
  
  .pricing-card.featured {
    transform: scale(1);
  }
  
  .glass-card {
    margin: 0 1rem;
  }
}
</style>