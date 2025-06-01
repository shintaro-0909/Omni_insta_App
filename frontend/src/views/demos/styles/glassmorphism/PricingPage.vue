<template>
  <div class="glassmorphism-pricing">
    <!-- Animated Background -->
    <div class="animated-bg">
      <div class="glass-shape shape-1"></div>
      <div class="glass-shape shape-2"></div>
      <div class="glass-shape shape-3"></div>
      <div class="glass-shape shape-4"></div>
      <div class="glass-shape shape-5"></div>
    </div>

    <v-container class="py-16">
      <!-- Header -->
      <div class="pricing-header text-center mb-12">
        <h1 class="pricing-title">Choose Your Perfect Plan</h1>
        <p class="pricing-subtitle">
          Start free and scale as you grow. No hidden fees, cancel anytime.
        </p>

        <!-- Billing Toggle -->
        <div class="billing-toggle mt-8">
          <span class="toggle-label" :class="{ active: !isAnnual }"
            >Monthly</span
          >
          <v-switch
            v-model="isAnnual"
            color="primary"
            hide-details
            class="glass-toggle"
          ></v-switch>
          <span class="toggle-label" :class="{ active: isAnnual }">
            Annual
            <v-chip size="small" class="savings-chip ml-2">Save 20%</v-chip>
          </span>
        </div>
      </div>

      <!-- Pricing Cards -->
      <v-row justify="center" class="mb-12">
        <v-col v-for="plan in pricingPlans" :key="plan.name" cols="12" md="3">
          <div
            class="glass-card pricing-card"
            :class="{
              featured: plan.featured,
              enterprise: plan.name === 'Enterprise',
            }"
          >
            <!-- Plan Badge -->
            <div v-if="plan.featured" class="featured-badge">
              <v-icon size="16">mdi-star</v-icon>
              Most Popular
            </div>

            <!-- Plan Header -->
            <div class="plan-header">
              <div class="plan-icon" :style="{ background: plan.gradient }">
                <v-icon size="40" color="white">{{ plan.icon }}</v-icon>
              </div>
              <h2 class="plan-name">{{ plan.name }}</h2>
              <p class="plan-description">{{ plan.description }}</p>
            </div>

            <!-- Plan Price -->
            <div class="plan-pricing">
              <template v-if="plan.price !== 'custom'">
                <span class="price-currency">$</span>
                <span class="price-amount">{{ getPrice(plan.price) }}</span>
                <span class="price-period">{{
                  isAnnual ? '/year' : '/month'
                }}</span>
              </template>
              <template v-else>
                <span class="custom-price">Custom Pricing</span>
              </template>
            </div>

            <!-- Plan Features -->
            <div class="plan-features">
              <div
                v-for="feature in plan.features"
                :key="feature"
                class="feature-item"
              >
                <v-icon size="20" color="success">mdi-check-circle</v-icon>
                <span>{{ feature }}</span>
              </div>
            </div>

            <!-- Plan CTA -->
            <v-btn
              class="glass-btn plan-cta"
              :class="{ 'primary-btn': plan.featured }"
              block
              size="large"
              @click="selectPlan(plan)"
            >
              {{ plan.cta }}
            </v-btn>

            <!-- Plan Footer -->
            <p v-if="plan.trial" class="plan-trial">
              <v-icon size="16">mdi-clock-outline</v-icon>
              {{ plan.trial }}
            </p>
          </div>
        </v-col>
      </v-row>

      <!-- Feature Comparison -->
      <div class="glass-card comparison-section">
        <h2 class="section-title text-center mb-8">Feature Comparison</h2>
        <div class="comparison-table">
          <div class="comparison-header">
            <div class="feature-name">Features</div>
            <div
              v-for="plan in comparisonPlans"
              :key="plan"
              class="plan-column"
            >
              {{ plan }}
            </div>
          </div>
          <div
            v-for="category in featureCategories"
            :key="category.name"
            class="feature-category"
          >
            <div class="category-header">
              <v-icon size="20" class="mr-2">{{ category.icon }}</v-icon>
              {{ category.name }}
            </div>
            <div
              v-for="feature in category.features"
              :key="feature.name"
              class="feature-row"
            >
              <div class="feature-name">
                {{ feature.name }}
                <v-tooltip v-if="feature.tooltip" location="top">
                  <template v-slot:activator="{ props }">
                    <v-icon size="16" v-bind="props" class="ml-1"
                      >mdi-information-outline</v-icon
                    >
                  </template>
                  <span>{{ feature.tooltip }}</span>
                </v-tooltip>
              </div>
              <div
                v-for="plan in comparisonPlans"
                :key="plan"
                class="plan-column"
              >
                <template v-if="typeof feature[plan] === 'boolean'">
                  <v-icon :color="feature[plan] ? 'success' : 'grey'">
                    {{ feature[plan] ? 'mdi-check' : 'mdi-minus' }}
                  </v-icon>
                </template>
                <template v-else>
                  {{ feature[plan] }}
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- FAQ Section -->
      <div class="faq-section mt-12">
        <h2 class="section-title text-center mb-8">
          Frequently Asked Questions
        </h2>
        <v-row justify="center">
          <v-col cols="12" md="8">
            <v-expansion-panels class="glass-expansion">
              <v-expansion-panel
                v-for="(faq, index) in faqs"
                :key="index"
                class="glass-panel"
              >
                <v-expansion-panel-title class="glass-panel-title">
                  <v-icon class="mr-3">{{ faq.icon }}</v-icon>
                  {{ faq.question }}
                </v-expansion-panel-title>
                <v-expansion-panel-text class="glass-panel-text">
                  {{ faq.answer }}
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-col>
        </v-row>
      </div>

      <!-- CTA Section -->
      <div class="glass-card cta-section text-center mt-12">
        <h2 class="cta-title mb-4">Ready to Get Started?</h2>
        <p class="cta-subtitle mb-8">
          Join thousands of creators and businesses already using Omniy
        </p>
        <div class="cta-buttons">
          <v-btn class="glass-btn primary-btn mr-4" size="x-large">
            <v-icon start>mdi-rocket-launch</v-icon>
            Start Free Trial
          </v-btn>
          <v-btn class="glass-btn" size="x-large">
            <v-icon start>mdi-calendar-check</v-icon>
            Schedule Demo
          </v-btn>
        </div>
        <div class="trust-badges mt-8">
          <div class="trust-item">
            <v-icon size="24">mdi-shield-check</v-icon>
            <span>SSL Secured</span>
          </div>
          <div class="trust-item">
            <v-icon size="24">mdi-credit-card-check</v-icon>
            <span>Safe Payment</span>
          </div>
          <div class="trust-item">
            <v-icon size="24">mdi-account-group</v-icon>
            <span>10K+ Users</span>
          </div>
        </div>
      </div>
    </v-container>

    <!-- Floating Chat Button -->
    <v-btn class="glass-fab chat-fab" fab @click="openChat">
      <v-icon>mdi-message-text</v-icon>
    </v-btn>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  // Data
  const isAnnual = ref(false);

  const pricingPlans = ref([
    {
      name: 'Free',
      description: 'Perfect for getting started',
      icon: 'mdi-gift',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      price: 0,
      features: [
        '1 Instagram Account',
        '10 Posts/Month',
        'Basic Scheduling',
        'Mobile App Access',
        'Email Support',
      ],
      cta: 'Start Free',
      trial: '14-day trial',
      featured: false,
    },
    {
      name: 'Basic',
      description: 'For growing creators',
      icon: 'mdi-rocket',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      price: 9,
      features: [
        '3 Instagram Accounts',
        '100 Posts/Month',
        'All Scheduling Types',
        'Analytics Dashboard',
        'Priority Support',
      ],
      cta: 'Get Started',
      trial: '14-day money back',
      featured: false,
    },
    {
      name: 'Pro',
      description: 'For professionals',
      icon: 'mdi-star',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      price: 29,
      features: [
        '10 Instagram Accounts',
        '1000 Posts/Month',
        'Advanced Analytics',
        'Team Collaboration',
        '24/7 Phone Support',
      ],
      cta: 'Go Pro',
      trial: '30-day money back',
      featured: true,
    },
    {
      name: 'Enterprise',
      description: 'For large teams',
      icon: 'mdi-domain',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      price: 'custom',
      features: [
        'Unlimited Accounts',
        'Unlimited Posts',
        'Custom Integrations',
        'Dedicated Manager',
        'SLA Guarantee',
      ],
      cta: 'Contact Sales',
      trial: null,
      featured: false,
    },
  ]);

  const comparisonPlans = ['Free', 'Basic', 'Pro', 'Enterprise'];

  const featureCategories = ref([
    {
      name: 'Account Management',
      icon: 'mdi-account-multiple',
      features: [
        {
          name: 'Instagram Accounts',
          Free: '1',
          Basic: '3',
          Pro: '10',
          Enterprise: 'Unlimited',
        },
        {
          name: 'Team Members',
          Free: false,
          Basic: '2',
          Pro: '5',
          Enterprise: 'Unlimited',
        },
        {
          name: 'Account Switching',
          tooltip: 'Switch between accounts without logging out',
          Free: true,
          Basic: true,
          Pro: true,
          Enterprise: true,
        },
      ],
    },
    {
      name: 'Posting & Scheduling',
      icon: 'mdi-calendar-check',
      features: [
        {
          name: 'Posts per Month',
          Free: '10',
          Basic: '100',
          Pro: '1000',
          Enterprise: 'Unlimited',
        },
        {
          name: 'Recurring Posts',
          Free: false,
          Basic: true,
          Pro: true,
          Enterprise: true,
        },
        {
          name: 'Random Posting',
          tooltip: 'Post at random intervals within time windows',
          Free: false,
          Basic: false,
          Pro: true,
          Enterprise: true,
        },
        {
          name: 'Bulk Upload',
          Free: false,
          Basic: false,
          Pro: true,
          Enterprise: true,
        },
      ],
    },
    {
      name: 'Analytics & Insights',
      icon: 'mdi-chart-line',
      features: [
        {
          name: 'Basic Analytics',
          Free: true,
          Basic: true,
          Pro: true,
          Enterprise: true,
        },
        {
          name: 'Advanced Reports',
          Free: false,
          Basic: false,
          Pro: true,
          Enterprise: true,
        },
        {
          name: 'Export Data',
          Free: false,
          Basic: false,
          Pro: true,
          Enterprise: true,
        },
        {
          name: 'API Access',
          Free: false,
          Basic: false,
          Pro: false,
          Enterprise: true,
        },
      ],
    },
    {
      name: 'Support & Services',
      icon: 'mdi-lifebuoy',
      features: [
        {
          name: 'Email Support',
          Free: true,
          Basic: true,
          Pro: true,
          Enterprise: true,
        },
        {
          name: 'Priority Support',
          Free: false,
          Basic: true,
          Pro: true,
          Enterprise: true,
        },
        {
          name: 'Phone Support',
          Free: false,
          Basic: false,
          Pro: true,
          Enterprise: true,
        },
        {
          name: 'Dedicated Manager',
          Free: false,
          Basic: false,
          Pro: false,
          Enterprise: true,
        },
      ],
    },
  ]);

  const faqs = ref([
    {
      icon: 'mdi-credit-card',
      question: 'What payment methods do you accept?',
      answer:
        'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and wire transfers for Enterprise plans. All payments are processed securely through Stripe.',
    },
    {
      icon: 'mdi-refresh',
      question: 'Can I change or cancel my plan anytime?',
      answer:
        'Yes! You can upgrade, downgrade, or cancel your subscription at any time. Changes take effect at the next billing cycle, and we offer prorated refunds for downgrades.',
    },
    {
      icon: 'mdi-account-switch',
      question: 'Can I switch between monthly and annual billing?',
      answer:
        "Absolutely! You can switch between monthly and annual billing at any time. When switching to annual, you'll receive a 20% discount immediately.",
    },
    {
      icon: 'mdi-shield-check',
      question: 'Is my Instagram account safe?',
      answer:
        "Yes, we use official Instagram Graph API and never store your Instagram password. We're fully compliant with Instagram's terms of service and use industry-standard encryption.",
    },
    {
      icon: 'mdi-test-tube',
      question: 'Do you offer a free trial?',
      answer:
        'Yes! All paid plans come with a 14-day free trial (30 days for Pro plan). No credit card required to start your trial.',
    },
  ]);

  // Methods
  const getPrice = (basePrice: number) => {
    if (basePrice === 0) return 0;
    return isAnnual.value ? Math.floor(basePrice * 12 * 0.8) : basePrice;
  };

  const selectPlan = (plan: any) => {
    console.log('Selected plan:', plan.name);
  };

  const openChat = () => {
    console.log('Open chat support');
  };
</script>

<style scoped>
  .glassmorphism-pricing {
    min-height: 100vh;
    background: linear-gradient(
      135deg,
      #3d4e81 0%,
      #5753c9 25%,
      #6e7ff3 50%,
      #c850c0 75%,
      #ffcc70 100%
    );
    background-size: 400% 400%;
    animation: gradientShift 30s ease infinite;
    position: relative;
    overflow: hidden;
  }

  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
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

  .glass-shape {
    position: absolute;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(40px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
  }

  .shape-1 {
    width: 400px;
    height: 400px;
    top: -20%;
    left: -10%;
    animation: float-shape 25s ease-in-out infinite;
  }

  .shape-2 {
    width: 300px;
    height: 300px;
    top: 50%;
    right: -15%;
    animation: float-shape 20s ease-in-out infinite reverse;
  }

  .shape-3 {
    width: 200px;
    height: 200px;
    bottom: 10%;
    left: 10%;
    animation: float-shape 30s ease-in-out infinite;
  }

  .shape-4 {
    width: 350px;
    height: 350px;
    top: 20%;
    right: 20%;
    animation: float-shape 35s ease-in-out infinite reverse;
  }

  .shape-5 {
    width: 250px;
    height: 250px;
    bottom: -10%;
    right: 30%;
    animation: float-shape 28s ease-in-out infinite;
  }

  @keyframes float-shape {
    0%,
    100% {
      transform: translate(0, 0) rotate(0deg) scale(1);
    }
    25% {
      transform: translate(50px, -30px) rotate(90deg) scale(1.1);
    }
    50% {
      transform: translate(-30px, 50px) rotate(180deg) scale(0.9);
    }
    75% {
      transform: translate(-50px, -20px) rotate(270deg) scale(1.05);
    }
  }

  /* Glass Card Base */
  .glass-card {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    padding: 2rem;
    position: relative;
    z-index: 1;
  }

  /* Header */
  .pricing-header {
    position: relative;
    z-index: 1;
  }

  .pricing-title {
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 800;
    color: white;
    margin-bottom: 1rem;
    text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }

  .pricing-subtitle {
    font-size: 1.25rem;
    color: rgba(255, 255, 255, 0.9);
    max-width: 600px;
    margin: 0 auto;
  }

  /* Billing Toggle */
  .billing-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  .toggle-label {
    color: rgba(255, 255, 255, 0.6);
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .toggle-label.active {
    color: white;
    font-weight: 600;
  }

  .glass-toggle :deep(.v-switch__track) {
    background: rgba(255, 255, 255, 0.2) !important;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .savings-chip {
    background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%) !important;
    color: white !important;
    font-weight: 600;
  }

  /* Pricing Cards */
  .pricing-card {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 2.5rem;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .pricing-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  }

  .pricing-card.featured {
    background: rgba(255, 255, 255, 0.25);
    border: 2px solid rgba(79, 172, 254, 0.5);
    transform: scale(1.05);
  }

  .pricing-card.enterprise {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(250, 112, 154, 0.4);
  }

  .featured-badge {
    position: absolute;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    color: white;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  /* Plan Header */
  .plan-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .plan-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 1.5rem;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }

  .plan-name {
    font-size: 1.75rem;
    font-weight: 700;
    color: white;
    margin-bottom: 0.5rem;
  }

  .plan-description {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.875rem;
  }

  /* Plan Pricing */
  .plan-pricing {
    text-align: center;
    margin-bottom: 2rem;
    min-height: 60px;
    display: flex;
    align-items: baseline;
    justify-content: center;
  }

  .price-currency {
    font-size: 1.5rem;
    color: rgba(255, 255, 255, 0.8);
    margin-right: 0.25rem;
  }

  .price-amount {
    font-size: 3.5rem;
    font-weight: 800;
    color: white;
    line-height: 1;
  }

  .price-period {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.7);
    margin-left: 0.5rem;
  }

  .custom-price {
    font-size: 1.5rem;
    font-weight: 600;
    color: white;
  }

  /* Plan Features */
  .plan-features {
    flex: 1;
    margin-bottom: 2rem;
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
    color: rgba(255, 255, 255, 0.9);
  }

  /* Plan CTA */
  .plan-cta {
    width: 100%;
    padding: 1rem !important;
    font-size: 1.125rem !important;
    font-weight: 600 !important;
  }

  .plan-trial {
    text-align: center;
    margin-top: 1rem;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  /* Glass Button */
  .glass-btn {
    background: rgba(255, 255, 255, 0.2) !important;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
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
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }

  .glass-btn.primary-btn {
    background: rgba(79, 172, 254, 0.4) !important;
    border: 1px solid rgba(79, 172, 254, 0.6) !important;
  }

  .glass-btn.primary-btn:hover {
    background: rgba(79, 172, 254, 0.6) !important;
  }

  /* Feature Comparison */
  .comparison-section {
    margin-top: 4rem;
    padding: 3rem;
  }

  .section-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: white;
  }

  .comparison-table {
    overflow-x: auto;
  }

  .comparison-header,
  .feature-row {
    display: grid;
    grid-template-columns: 2fr repeat(4, 1fr);
    gap: 1rem;
    padding: 1rem;
    align-items: center;
  }

  .comparison-header {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    font-weight: 600;
    color: white;
    margin-bottom: 1rem;
  }

  .feature-category {
    margin-bottom: 2rem;
  }

  .category-header {
    display: flex;
    align-items: center;
    color: white;
    font-weight: 600;
    font-size: 1.125rem;
    margin-bottom: 1rem;
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
  }

  .feature-row {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    margin-bottom: 0.5rem;
    transition: all 0.3s ease;
  }

  .feature-row:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .feature-name {
    color: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
  }

  .plan-column {
    text-align: center;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
  }

  /* FAQ Section */
  .faq-section {
    position: relative;
    z-index: 1;
  }

  .glass-expansion {
    background: transparent !important;
  }

  .glass-panel {
    background: rgba(255, 255, 255, 0.1) !important;
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px !important;
    margin-bottom: 1rem;
  }

  .glass-panel-title {
    color: white !important;
    font-weight: 600;
    padding: 1.5rem !important;
  }

  .glass-panel-text {
    color: rgba(255, 255, 255, 0.8) !important;
    padding: 0 1.5rem 1.5rem !important;
  }

  /* CTA Section */
  .cta-section {
    padding: 4rem;
    margin-top: 4rem;
  }

  .cta-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: white;
  }

  .cta-subtitle {
    font-size: 1.25rem;
    color: rgba(255, 255, 255, 0.9);
  }

  .cta-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .trust-badges {
    display: flex;
    justify-content: center;
    gap: 3rem;
    flex-wrap: wrap;
  }

  .trust-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: rgba(255, 255, 255, 0.8);
  }

  /* Floating Chat Button */
  .chat-fab {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: rgba(102, 126, 234, 0.8) !important;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(102, 126, 234, 0.9) !important;
    color: white !important;
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
  }

  .chat-fab:hover {
    transform: scale(1.1);
    box-shadow: 0 12px 40px rgba(102, 126, 234, 0.5);
  }

  /* Responsive */
  @media (max-width: 960px) {
    .pricing-title {
      font-size: 2.5rem;
    }

    .pricing-card.featured {
      transform: scale(1);
    }

    .comparison-header,
    .feature-row {
      grid-template-columns: 1fr;
      text-align: left;
    }

    .plan-column:not(:first-child) {
      display: none;
    }

    .cta-buttons {
      flex-direction: column;
    }

    .cta-buttons .v-btn {
      width: 100%;
    }
  }
</style>
