<template>
  <div class="stylish-pricing">
    <!-- Hero Section -->
    <section class="pricing-hero">
      <div class="hero-content">
        <div class="hero-text" :class="{ 'fade-in': isLoaded }">
          <div class="hero-subtitle">INVESTMENT IN EXCELLENCE</div>
          <h1 class="hero-title">
            <span class="title-line">Choose Your</span>
            <span class="title-line accent">Path to Success</span>
          </h1>
          <p class="hero-description">
            Select the perfect plan to elevate your Instagram presence. Every
            tier is crafted for exceptional results.
          </p>
        </div>
      </div>
    </section>

    <!-- Pricing Toggle -->
    <section class="pricing-toggle">
      <div class="toggle-container">
        <div class="billing-toggle">
          <button
            :class="['toggle-btn', { active: billingCycle === 'monthly' }]"
            @click="billingCycle = 'monthly'"
          >
            Monthly
          </button>
          <button
            :class="['toggle-btn', { active: billingCycle === 'yearly' }]"
            @click="billingCycle = 'yearly'"
          >
            Yearly
            <span class="discount-badge">Save 20%</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Pricing Plans -->
    <section class="pricing-plans">
      <div class="plans-container">
        <div class="plans-grid">
          <div
            v-for="(plan, index) in pricingPlans"
            :key="plan.id"
            :class="[
              'plan-card',
              {
                featured: plan.featured,
                'most-popular': plan.mostPopular,
              },
            ]"
            :style="{ animationDelay: `${index * 0.2}s` }"
          >
            <div v-if="plan.mostPopular" class="popular-badge">
              Most Popular
            </div>

            <div class="plan-header">
              <div class="plan-icon">{{ plan.icon }}</div>
              <h3 class="plan-name">{{ plan.name }}</h3>
              <p class="plan-description">{{ plan.description }}</p>
            </div>

            <div class="plan-pricing">
              <div class="price-display">
                <span class="currency">$</span>
                <span class="amount">{{ getPlanPrice(plan) }}</span>
                <span class="period">{{
                  billingCycle === 'monthly' ? '/month' : '/year'
                }}</span>
              </div>
              <div
                v-if="billingCycle === 'yearly' && plan.yearlyDiscount"
                class="yearly-savings"
              >
                Save ${{ plan.yearlyDiscount }} annually
              </div>
            </div>

            <div class="plan-features">
              <h4 class="features-title">Everything in {{ plan.name }}:</h4>
              <ul class="features-list">
                <li
                  v-for="feature in plan.features"
                  :key="feature.text"
                  :class="['feature-item', { premium: feature.premium }]"
                >
                  <span class="feature-icon">{{
                    feature.premium ? '✨' : '✓'
                  }}</span>
                  <span class="feature-text">{{ feature.text }}</span>
                  <span v-if="feature.highlight" class="feature-highlight">{{
                    feature.highlight
                  }}</span>
                </li>
              </ul>
            </div>

            <div class="plan-stats">
              <div class="stat-grid">
                <div
                  v-for="stat in plan.stats"
                  :key="stat.label"
                  class="stat-item"
                >
                  <div class="stat-value">{{ stat.value }}</div>
                  <div class="stat-label">{{ stat.label }}</div>
                </div>
              </div>
            </div>

            <div class="plan-action">
              <button
                :class="[
                  'plan-button',
                  {
                    primary: plan.featured,
                    secondary: !plan.featured,
                  },
                ]"
                @click="selectPlan(plan)"
              >
                {{ plan.buttonText }}
              </button>
              <p class="plan-note">{{ plan.note }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Comparison -->
    <section class="features-comparison">
      <div class="comparison-container">
        <div class="section-header">
          <h2 class="section-title">Complete Feature Comparison</h2>
          <p class="section-subtitle">
            Every detail matters when building your digital empire
          </p>
        </div>

        <div class="comparison-table">
          <div class="table-header">
            <div class="feature-column">Features</div>
            <div
              v-for="plan in pricingPlans"
              :key="plan.id"
              class="plan-column"
            >
              <div class="plan-name">{{ plan.name }}</div>
              <div class="plan-price">${{ getPlanPrice(plan) }}</div>
            </div>
          </div>

          <div class="table-body">
            <div
              v-for="(category, categoryIndex) in featureCategories"
              :key="category.name"
              class="feature-category"
            >
              <div class="category-header">
                <h3 class="category-title">{{ category.name }}</h3>
              </div>

              <div
                v-for="feature in category.features"
                :key="feature.name"
                class="feature-row"
              >
                <div class="feature-name">
                  <span class="feature-text">{{ feature.name }}</span>
                  <span
                    v-if="feature.tooltip"
                    class="feature-tooltip"
                    :title="feature.tooltip"
                    >?</span
                  >
                </div>
                <div
                  v-for="plan in pricingPlans"
                  :key="plan.id"
                  class="feature-value"
                >
                  <span
                    v-if="feature.values[plan.id] === true"
                    class="check-icon"
                    >✓</span
                  >
                  <span
                    v-else-if="feature.values[plan.id] === false"
                    class="cross-icon"
                    >×</span
                  >
                  <span v-else class="value-text">{{
                    feature.values[plan.id]
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Enterprise Section -->
    <section class="enterprise-section">
      <div class="enterprise-container">
        <div class="enterprise-content">
          <div class="enterprise-text">
            <h2 class="enterprise-title">Enterprise Solutions</h2>
            <p class="enterprise-description">
              For organizations that demand the absolute pinnacle of social
              media management. Custom solutions tailored to your unique
              requirements.
            </p>
            <div class="enterprise-features">
              <div class="enterprise-feature">
                <span class="feature-icon">🏢</span>
                <span>White-label solutions</span>
              </div>
              <div class="enterprise-feature">
                <span class="feature-icon">🔐</span>
                <span>Enterprise security</span>
              </div>
              <div class="enterprise-feature">
                <span class="feature-icon">📞</span>
                <span>Dedicated support</span>
              </div>
              <div class="enterprise-feature">
                <span class="feature-icon">🛠️</span>
                <span>Custom integrations</span>
              </div>
            </div>
            <button class="enterprise-button" @click="contactSales">
              Contact Sales Team
            </button>
          </div>
          <div class="enterprise-visual">
            <div class="visual-grid">
              <div class="visual-item">📊</div>
              <div class="visual-item">🎯</div>
              <div class="visual-item">⚡</div>
              <div class="visual-item">🔒</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="faq-section">
      <div class="faq-container">
        <div class="section-header">
          <h2 class="section-title">Frequently Asked Questions</h2>
          <p class="section-subtitle">
            Everything you need to know about our pricing and features
          </p>
        </div>

        <div class="faq-grid">
          <div
            v-for="(faq, index) in faqs"
            :key="index"
            class="faq-item"
            :class="{ open: openFaq === index }"
            @click="toggleFaq(index)"
          >
            <div class="faq-question">
              <h3 class="question-text">{{ faq.question }}</h3>
              <div class="question-icon">
                {{ openFaq === index ? '−' : '+' }}
              </div>
            </div>
            <div class="faq-answer">
              <p class="answer-text">{{ faq.answer }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Trust Section -->
    <section class="trust-section">
      <div class="trust-container">
        <div class="trust-stats">
          <div class="trust-stat">
            <div class="stat-number">99.9%</div>
            <div class="stat-label">Uptime SLA</div>
          </div>
          <div class="trust-stat">
            <div class="stat-number">10M+</div>
            <div class="stat-label">Posts Scheduled</div>
          </div>
          <div class="trust-stat">
            <div class="stat-number">50K+</div>
            <div class="stat-label">Happy Users</div>
          </div>
          <div class="trust-stat">
            <div class="stat-number">24/7</div>
            <div class="stat-label">Expert Support</div>
          </div>
        </div>

        <div class="trust-badges">
          <div class="badge-item">
            <span class="badge-icon">🔒</span>
            <span class="badge-text">SOC 2 Compliant</span>
          </div>
          <div class="badge-item">
            <span class="badge-icon">🛡️</span>
            <span class="badge-text">GDPR Ready</span>
          </div>
          <div class="badge-item">
            <span class="badge-icon">✅</span>
            <span class="badge-text">Instagram Partner</span>
          </div>
          <div class="badge-item">
            <span class="badge-icon">💎</span>
            <span class="badge-text">Enterprise Grade</span>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-container">
        <div class="cta-content">
          <h2 class="cta-title">Ready to Transform Your Instagram?</h2>
          <p class="cta-description">
            Join thousands of successful brands and creators who trust us with
            their social media excellence.
          </p>
          <div class="cta-actions">
            <button class="btn-primary large" @click="startTrial">
              Start 14-Day Free Trial
            </button>
            <button class="btn-secondary large" @click="watchDemo">
              Watch Demo
            </button>
          </div>
          <p class="cta-note">
            No credit card required • Cancel anytime • Full feature access
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';

  const isLoaded = ref(false);
  const billingCycle = ref<'monthly' | 'yearly'>('monthly');
  const openFaq = ref<number | null>(null);

  const pricingPlans = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Perfect for individuals and small creators',
      icon: '🌱',
      featured: false,
      mostPopular: false,
      monthlyPrice: 19,
      yearlyPrice: 15,
      yearlyDiscount: 48,
      buttonText: 'Start Free Trial',
      note: '14-day free trial',
      features: [
        { text: '3 Instagram accounts', premium: false },
        { text: '100 scheduled posts per month', premium: false },
        { text: 'Basic analytics & insights', premium: false },
        { text: 'Content calendar', premium: false },
        { text: 'Email support', premium: false },
        { text: 'Mobile app access', premium: false },
      ],
      stats: [
        { value: '3', label: 'Accounts' },
        { value: '100', label: 'Posts/mo' },
        { value: '24h', label: 'Support' },
      ],
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Ideal for growing businesses and agencies',
      icon: '🚀',
      featured: true,
      mostPopular: true,
      monthlyPrice: 49,
      yearlyPrice: 39,
      yearlyDiscount: 120,
      buttonText: 'Go Professional',
      note: 'Most popular choice',
      features: [
        { text: '10 Instagram accounts', premium: false },
        {
          text: 'Unlimited scheduled posts',
          premium: false,
          highlight: 'Most popular',
        },
        { text: 'Advanced analytics & ROI tracking', premium: true },
        { text: 'Team collaboration tools', premium: true },
        { text: 'Priority support', premium: false },
        { text: 'Custom branding', premium: true },
        { text: 'Bulk upload & editing', premium: true },
        { text: 'Auto-publishing', premium: true },
      ],
      stats: [
        { value: '10', label: 'Accounts' },
        { value: '∞', label: 'Posts/mo' },
        { value: '4h', label: 'Support' },
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations requiring maximum control',
      icon: '👑',
      featured: false,
      mostPopular: false,
      monthlyPrice: 149,
      yearlyPrice: 119,
      yearlyDiscount: 360,
      buttonText: 'Contact Sales',
      note: 'Custom solutions available',
      features: [
        { text: 'Unlimited Instagram accounts', premium: true },
        { text: 'Unlimited everything', premium: true },
        { text: 'White-label solutions', premium: true },
        { text: 'Advanced user management', premium: true },
        { text: 'Dedicated success manager', premium: true },
        { text: 'Custom integrations', premium: true },
        { text: 'API access', premium: true },
        { text: 'Enterprise security', premium: true },
        { text: 'SLA guarantee', premium: true },
      ],
      stats: [
        { value: '∞', label: 'Accounts' },
        { value: '∞', label: 'Posts/mo' },
        { value: '1h', label: 'Support' },
      ],
    },
  ];

  const featureCategories = [
    {
      name: 'Core Features',
      features: [
        {
          name: 'Instagram Accounts',
          values: { starter: '3', professional: '10', enterprise: 'Unlimited' },
        },
        {
          name: 'Monthly Posts',
          values: {
            starter: '100',
            professional: 'Unlimited',
            enterprise: 'Unlimited',
          },
        },
        {
          name: 'Scheduling & Publishing',
          values: { starter: true, professional: true, enterprise: true },
        },
        {
          name: 'Content Calendar',
          values: { starter: true, professional: true, enterprise: true },
        },
        {
          name: 'Mobile Apps',
          values: { starter: true, professional: true, enterprise: true },
        },
      ],
    },
    {
      name: 'Analytics & Insights',
      features: [
        {
          name: 'Basic Analytics',
          values: { starter: true, professional: true, enterprise: true },
        },
        {
          name: 'Advanced Analytics',
          values: { starter: false, professional: true, enterprise: true },
        },
        {
          name: 'ROI Tracking',
          values: { starter: false, professional: true, enterprise: true },
        },
        {
          name: 'Custom Reports',
          values: { starter: false, professional: false, enterprise: true },
        },
        {
          name: 'Data Export',
          values: { starter: false, professional: true, enterprise: true },
        },
      ],
    },
    {
      name: 'Team & Collaboration',
      features: [
        {
          name: 'Team Members',
          values: { starter: '1', professional: '5', enterprise: 'Unlimited' },
        },
        {
          name: 'Role Management',
          values: { starter: false, professional: true, enterprise: true },
        },
        {
          name: 'Approval Workflows',
          values: { starter: false, professional: true, enterprise: true },
        },
        {
          name: 'Team Analytics',
          values: { starter: false, professional: false, enterprise: true },
        },
      ],
    },
    {
      name: 'Support & Services',
      features: [
        {
          name: 'Support Response Time',
          values: {
            starter: '24 hours',
            professional: '4 hours',
            enterprise: '1 hour',
          },
        },
        {
          name: 'Phone Support',
          values: { starter: false, professional: false, enterprise: true },
        },
        {
          name: 'Dedicated Manager',
          values: { starter: false, professional: false, enterprise: true },
        },
        {
          name: 'Training & Onboarding',
          values: { starter: false, professional: true, enterprise: true },
        },
      ],
    },
  ];

  const faqs = [
    {
      question: 'Can I change my plan at any time?',
      answer:
        'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and billing is prorated accordingly.',
    },
    {
      question: 'What happens if I exceed my plan limits?',
      answer:
        "We'll notify you when you're approaching your limits. You can either upgrade your plan or wait until the next billing cycle for your limits to reset.",
    },
    {
      question: 'Do you offer refunds?',
      answer:
        "We offer a 30-day money-back guarantee for all plans. If you're not satisfied, contact our support team for a full refund.",
    },
    {
      question: 'Is my data secure?',
      answer:
        'Absolutely. We use enterprise-grade security measures, including SSL encryption, regular security audits, and SOC 2 compliance to protect your data.',
    },
    {
      question: 'Can I cancel anytime?',
      answer:
        'Yes, you can cancel your subscription at any time. Your account will remain active until the end of your current billing period.',
    },
    {
      question: 'Do you offer educational discounts?',
      answer:
        'Yes, we offer special pricing for educational institutions and non-profit organizations. Contact our sales team for more information.',
    },
  ];

  const getPlanPrice = (plan: any) => {
    return billingCycle.value === 'monthly'
      ? plan.monthlyPrice
      : plan.yearlyPrice;
  };

  const selectPlan = (plan: any) => {
    console.log('Selected plan:', plan.name);
  };

  const contactSales = () => {
    console.log('Contact sales');
  };

  const toggleFaq = (index: number) => {
    openFaq.value = openFaq.value === index ? null : index;
  };

  const startTrial = () => {
    console.log('Start trial');
  };

  const watchDemo = () => {
    console.log('Watch demo');
  };

  onMounted(() => {
    setTimeout(() => {
      isLoaded.value = true;
    }, 100);
  });
</script>

<style scoped>
  .stylish-pricing {
    background: #000;
    color: #fff;
    font-family:
      'Inter',
      -apple-system,
      BlinkMacSystemFont,
      sans-serif;
    line-height: 1.6;
    overflow-x: hidden;
  }

  /* Hero Section */
  .pricing-hero {
    padding: 4rem 0;
    text-align: center;
  }

  .hero-content {
    max-width: 800px;
    margin: 0 auto;
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
    font-size: clamp(2.5rem, 6vw, 4rem);
    font-weight: 200;
    line-height: 1.1;
    margin-bottom: 2rem;
    letter-spacing: -0.02em;
  }

  .title-line {
    display: block;
  }

  .title-line.accent {
    background: linear-gradient(135deg, #7877c6 0%, #c6a6f7 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 300;
  }

  .hero-description {
    font-size: 1.25rem;
    color: #bbb;
    max-width: 600px;
    margin: 0 auto;
    font-weight: 300;
    line-height: 1.6;
  }

  /* Pricing Toggle */
  .pricing-toggle {
    padding: 2rem 0;
    text-align: center;
  }

  .toggle-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .billing-toggle {
    display: inline-flex;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #333;
    border-radius: 8px;
    padding: 4px;
  }

  .toggle-btn {
    padding: 0.75rem 1.5rem;
    background: transparent;
    border: none;
    color: #888;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.3s ease;
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .toggle-btn.active {
    background: linear-gradient(135deg, #7877c6 0%, #c6a6f7 100%);
    color: #fff;
  }

  .discount-badge {
    background: rgba(74, 222, 128, 0.2);
    color: #4ade80;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  /* Pricing Plans */
  .pricing-plans {
    padding: 4rem 0;
  }

  .plans-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .plans-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 2rem;
    align-items: start;
  }

  .plan-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid #222;
    border-radius: 12px;
    padding: 2.5rem;
    position: relative;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    animation: slideInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .plan-card:hover {
    transform: translateY(-10px);
    border-color: #333;
    background: rgba(255, 255, 255, 0.04);
  }

  .plan-card.featured {
    border-color: #7877c6;
    background: rgba(120, 119, 198, 0.05);
    transform: scale(1.05);
  }

  .plan-card.featured:hover {
    transform: scale(1.05) translateY(-10px);
  }

  .popular-badge {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #7877c6 0%, #c6a6f7 100%);
    color: #fff;
    padding: 0.5rem 1.5rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.025em;
  }

  .plan-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .plan-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .plan-name {
    font-size: 1.75rem;
    font-weight: 500;
    margin-bottom: 0.75rem;
    letter-spacing: -0.01em;
  }

  .plan-description {
    color: #888;
    font-size: 1rem;
    font-weight: 300;
    margin: 0;
  }

  .plan-pricing {
    text-align: center;
    margin-bottom: 2.5rem;
  }

  .price-display {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 0.25rem;
    margin-bottom: 0.5rem;
  }

  .currency {
    font-size: 1.5rem;
    color: #888;
  }

  .amount {
    font-size: 3.5rem;
    font-weight: 200;
    letter-spacing: -0.02em;
  }

  .period {
    font-size: 1rem;
    color: #888;
  }

  .yearly-savings {
    font-size: 0.875rem;
    color: #4ade80;
    font-weight: 500;
  }

  .plan-features {
    margin-bottom: 2rem;
  }

  .features-title {
    font-size: 1rem;
    font-weight: 500;
    margin-bottom: 1.5rem;
    color: #ccc;
  }

  .features-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .feature-item:last-child {
    border-bottom: none;
  }

  .feature-item.premium {
    background: rgba(120, 119, 198, 0.05);
    margin: 0 -1rem;
    padding: 0.75rem 1rem;
    border-radius: 6px;
    border: none;
  }

  .feature-icon {
    font-size: 1rem;
    color: #7877c6;
    flex-shrink: 0;
  }

  .feature-text {
    flex: 1;
    font-weight: 300;
  }

  .feature-highlight {
    background: rgba(120, 119, 198, 0.2);
    color: #c6a6f7;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .plan-stats {
    margin-bottom: 2rem;
  }

  .stat-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    text-align: center;
  }

  .stat-item {
    padding: 1rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid #222;
    border-radius: 6px;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 500;
    color: #7877c6;
    display: block;
    margin-bottom: 0.25rem;
  }

  .stat-label {
    font-size: 0.75rem;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .plan-action {
    text-align: center;
  }

  .plan-button {
    width: 100%;
    padding: 1rem;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    letter-spacing: 0.025em;
    margin-bottom: 1rem;
  }

  .plan-button.primary {
    background: linear-gradient(135deg, #7877c6 0%, #c6a6f7 100%);
    border: none;
    color: #fff;
  }

  .plan-button.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(120, 119, 198, 0.3);
  }

  .plan-button.secondary {
    background: transparent;
    border: 1px solid #333;
    color: #fff;
  }

  .plan-button.secondary:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: #555;
  }

  .plan-note {
    font-size: 0.875rem;
    color: #888;
    margin: 0;
  }

  /* Features Comparison */
  .features-comparison {
    padding: 6rem 0;
    background: rgba(255, 255, 255, 0.01);
  }

  .comparison-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .section-header {
    text-align: center;
    margin-bottom: 4rem;
  }

  .section-title {
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 200;
    margin-bottom: 1.5rem;
    letter-spacing: -0.02em;
  }

  .section-subtitle {
    font-size: 1.125rem;
    color: #888;
    max-width: 600px;
    margin: 0 auto;
    font-weight: 300;
  }

  .comparison-table {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid #222;
    border-radius: 8px;
    overflow: hidden;
  }

  .table-header {
    display: grid;
    grid-template-columns: 2fr repeat(3, 1fr);
    background: rgba(255, 255, 255, 0.05);
    border-bottom: 1px solid #222;
  }

  .feature-column,
  .plan-column {
    padding: 2rem 1.5rem;
    text-align: center;
  }

  .feature-column {
    text-align: left;
    font-weight: 500;
    color: #ccc;
  }

  .plan-name {
    font-size: 1.125rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  .plan-price {
    font-size: 1.5rem;
    font-weight: 200;
    color: #7877c6;
  }

  .feature-category {
    border-bottom: 1px solid #222;
  }

  .feature-category:last-child {
    border-bottom: none;
  }

  .category-header {
    background: rgba(255, 255, 255, 0.02);
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #222;
  }

  .category-title {
    font-size: 1rem;
    font-weight: 500;
    color: #7877c6;
    margin: 0;
  }

  .feature-row {
    display: grid;
    grid-template-columns: 2fr repeat(3, 1fr);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .feature-row:last-child {
    border-bottom: none;
  }

  .feature-name {
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .feature-text {
    font-weight: 300;
  }

  .feature-tooltip {
    width: 16px;
    height: 16px;
    background: rgba(120, 119, 198, 0.2);
    color: #c6a6f7;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: help;
  }

  .feature-value {
    padding: 1rem 1.5rem;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .check-icon {
    color: #4ade80;
    font-size: 1.25rem;
    font-weight: bold;
  }

  .cross-icon {
    color: #888;
    font-size: 1.25rem;
  }

  .value-text {
    font-weight: 500;
    color: #7877c6;
  }

  /* Enterprise Section */
  .enterprise-section {
    padding: 6rem 0;
    background: linear-gradient(
      135deg,
      rgba(120, 119, 198, 0.05) 0%,
      rgba(0, 0, 0, 0.8) 100%
    );
  }

  .enterprise-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .enterprise-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: center;
  }

  .enterprise-title {
    font-size: 2.5rem;
    font-weight: 200;
    margin-bottom: 1.5rem;
    letter-spacing: -0.02em;
  }

  .enterprise-description {
    font-size: 1.125rem;
    color: #bbb;
    margin-bottom: 2rem;
    line-height: 1.6;
    font-weight: 300;
  }

  .enterprise-features {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 2.5rem;
  }

  .enterprise-feature {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.875rem;
    color: #ccc;
  }

  .feature-icon {
    font-size: 1.25rem;
  }

  .enterprise-button {
    background: linear-gradient(135deg, #7877c6 0%, #c6a6f7 100%);
    border: none;
    color: #fff;
    padding: 1rem 2rem;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    letter-spacing: 0.025em;
  }

  .enterprise-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(120, 119, 198, 0.3);
  }

  .enterprise-visual {
    display: flex;
    justify-content: center;
  }

  .visual-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }

  .visual-item {
    width: 80px;
    height: 80px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #333;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    transition: all 0.3s ease;
  }

  .visual-item:hover {
    background: rgba(120, 119, 198, 0.1);
    border-color: #7877c6;
  }

  /* FAQ Section */
  .faq-section {
    padding: 6rem 0;
  }

  .faq-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .faq-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .faq-item {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid #222;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .faq-item:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: #333;
  }

  .faq-item.open {
    border-color: #7877c6;
  }

  .faq-question {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
  }

  .question-text {
    font-size: 1.125rem;
    font-weight: 500;
    margin: 0;
    letter-spacing: -0.01em;
  }

  .question-icon {
    font-size: 1.5rem;
    color: #7877c6;
    font-weight: 300;
    transition: transform 0.3s ease;
  }

  .faq-item.open .question-icon {
    transform: rotate(45deg);
  }

  .faq-answer {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
  }

  .faq-item.open .faq-answer {
    max-height: 200px;
  }

  .answer-text {
    padding: 0 2rem 2rem 2rem;
    color: #bbb;
    line-height: 1.6;
    margin: 0;
    font-weight: 300;
  }

  /* Trust Section */
  .trust-section {
    padding: 4rem 0;
    background: rgba(255, 255, 255, 0.01);
  }

  .trust-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .trust-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 3rem;
    margin-bottom: 4rem;
    text-align: center;
  }

  .trust-stat {
    padding: 2rem;
  }

  .stat-number {
    font-size: 2.5rem;
    font-weight: 200;
    color: #7877c6;
    margin-bottom: 0.5rem;
    letter-spacing: -0.02em;
  }

  .stat-label {
    font-size: 1rem;
    color: #888;
    font-weight: 300;
  }

  .trust-badges {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
    text-align: center;
  }

  .badge-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid #222;
    border-radius: 8px;
    transition: all 0.3s ease;
  }

  .badge-item:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: #333;
  }

  .badge-icon {
    font-size: 1.5rem;
  }

  .badge-text {
    font-size: 0.875rem;
    font-weight: 500;
    color: #ccc;
  }

  /* CTA Section */
  .cta-section {
    padding: 6rem 0;
    text-align: center;
    background: linear-gradient(135deg, #0a0a0a 0%, #000 100%);
  }

  .cta-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 2rem;
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

  .cta-actions {
    display: flex;
    gap: 1.5rem;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 2rem;
  }

  .btn-primary,
  .btn-secondary {
    padding: 1rem 2.5rem;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    letter-spacing: 0.025em;
  }

  .btn-primary.large,
  .btn-secondary.large {
    padding: 1.25rem 3rem;
    font-size: 1.125rem;
  }

  .btn-primary {
    background: linear-gradient(135deg, #7877c6 0%, #c6a6f7 100%);
    border: none;
    color: #fff;
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 40px rgba(120, 119, 198, 0.3);
  }

  .btn-secondary {
    background: transparent;
    border: 1px solid #333;
    color: #fff;
  }

  .btn-secondary:hover {
    background: #fff;
    color: #000;
    border-color: #fff;
  }

  .cta-note {
    font-size: 0.875rem;
    color: #888;
    margin: 0;
  }

  /* Animations */
  @keyframes slideInUp {
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
  @media (max-width: 1024px) {
    .plans-grid {
      grid-template-columns: 1fr;
    }

    .plan-card.featured {
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

    .enterprise-content {
      grid-template-columns: 1fr;
      text-align: center;
    }
  }

  @media (max-width: 768px) {
    .cta-actions {
      flex-direction: column;
      align-items: center;
    }

    .btn-primary,
    .btn-secondary {
      width: 100%;
      max-width: 300px;
    }

    .trust-stats {
      grid-template-columns: repeat(2, 1fr);
      gap: 2rem;
    }

    .trust-badges {
      grid-template-columns: 1fr;
    }

    .billing-toggle {
      width: 100%;
    }

    .toggle-btn {
      flex: 1;
    }
  }
</style>
