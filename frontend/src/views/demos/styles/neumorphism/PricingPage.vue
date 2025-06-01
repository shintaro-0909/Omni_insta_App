<template>
  <div class="neumorphism-pricing">
    <!-- Hero Section -->
    <section class="pricing-hero">
      <div class="hero-content">
        <h1 class="hero-title">Simple, Transparent Pricing</h1>
        <p class="hero-subtitle">
          Choose the perfect plan for your Instagram growth journey
        </p>

        <!-- Billing Toggle -->
        <div class="billing-toggle">
          <span class="toggle-label" :class="{ active: !isAnnual }"
            >Monthly</span
          >
          <div class="toggle-switch" @click="toggleBilling">
            <div class="toggle-slider" :class="{ annual: isAnnual }"></div>
          </div>
          <span class="toggle-label" :class="{ active: isAnnual }">
            Annual
            <span class="savings-badge">Save 20%</span>
          </span>
        </div>
      </div>
    </section>

    <!-- Pricing Cards -->
    <section class="pricing-section">
      <div class="pricing-grid">
        <div
          class="pricing-card"
          v-for="plan in pricingPlans"
          :key="plan.id"
          :class="{
            popular: plan.popular,
            enterprise: plan.id === 'enterprise',
          }"
        >
          <!-- Popular Badge -->
          <div v-if="plan.popular" class="popular-badge">
            <i class="mdi mdi-star"></i>
            Most Popular
          </div>

          <!-- Plan Header -->
          <div class="plan-header">
            <div class="plan-icon">
              <i :class="plan.icon"></i>
            </div>
            <h3 class="plan-name">{{ plan.name }}</h3>
            <p class="plan-description">{{ plan.description }}</p>
          </div>

          <!-- Pricing -->
          <div class="plan-pricing">
            <div class="price-main">
              <span class="currency">$</span>
              <span class="amount">{{ getCurrentPrice(plan) }}</span>
              <span class="period">/{{ isAnnual ? 'year' : 'month' }}</span>
            </div>
            <div v-if="isAnnual && plan.id !== 'free'" class="price-secondary">
              Billed annually • Save ${{ getAnnualSavings(plan) }}
            </div>
            <div v-if="plan.id === 'free'" class="free-forever">
              Free forever
            </div>
          </div>

          <!-- Features List -->
          <div class="features-section">
            <h4>What's included:</h4>
            <ul class="features-list">
              <li
                v-for="feature in plan.features"
                :key="feature"
                class="feature-item"
              >
                <i class="mdi mdi-check feature-check"></i>
                <span>{{ feature }}</span>
              </li>
            </ul>
          </div>

          <!-- CTA Button -->
          <div class="plan-cta">
            <button
              class="cta-button"
              :class="{
                primary: plan.popular,
                secondary: !plan.popular && plan.id !== 'enterprise',
                enterprise: plan.id === 'enterprise',
              }"
              @click="selectPlan(plan)"
            >
              <span v-if="plan.id === 'free'">Get Started Free</span>
              <span v-else-if="plan.id === 'enterprise'">Contact Sales</span>
              <span v-else
                >Start {{ isAnnual ? 'Annual' : 'Monthly' }} Plan</span
              >
            </button>
            <p v-if="plan.id !== 'free'" class="trial-info">
              {{
                plan.id === 'enterprise'
                  ? 'Custom pricing available'
                  : '14-day free trial • No credit card required'
              }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Feature Comparison -->
    <section class="comparison-section">
      <div class="section-header">
        <h2>Compare All Features</h2>
        <p>See exactly what's included in each plan</p>
      </div>

      <div class="comparison-table">
        <div class="table-header">
          <div class="feature-col">Features</div>
          <div class="plan-col" v-for="plan in pricingPlans" :key="plan.id">
            {{ plan.name }}
          </div>
        </div>

        <div class="table-body">
          <div
            class="feature-row"
            v-for="feature in comparisonFeatures"
            :key="feature.name"
          >
            <div class="feature-name">
              {{ feature.name }}
              <i
                v-if="feature.tooltip"
                class="mdi mdi-information-outline tooltip-icon"
                :title="feature.tooltip"
              ></i>
            </div>
            <div
              class="feature-value"
              v-for="plan in pricingPlans"
              :key="plan.id"
            >
              <span v-if="typeof feature.plans[plan.id] === 'boolean'">
                <i
                  :class="
                    feature.plans[plan.id]
                      ? 'mdi mdi-check check-yes'
                      : 'mdi mdi-close check-no'
                  "
                ></i>
              </span>
              <span v-else class="feature-text">
                {{ feature.plans[plan.id] }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="faq-section">
      <div class="section-header">
        <h2>Frequently Asked Questions</h2>
        <p>Got questions? We've got answers</p>
      </div>

      <div class="faq-grid">
        <div
          class="faq-item"
          v-for="faq in faqs"
          :key="faq.id"
          :class="{ active: activeFaq === faq.id }"
          @click="toggleFaq(faq.id)"
        >
          <div class="faq-question">
            <h4>{{ faq.question }}</h4>
            <i
              :class="
                activeFaq === faq.id
                  ? 'mdi mdi-chevron-up'
                  : 'mdi mdi-chevron-down'
              "
            ></i>
          </div>
          <div class="faq-answer" v-if="activeFaq === faq.id">
            <p>{{ faq.answer }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Trust Section -->
    <section class="trust-section">
      <div class="trust-content">
        <div class="trust-stats">
          <div class="trust-stat">
            <div class="stat-icon">
              <i class="mdi mdi-shield-check"></i>
            </div>
            <div class="stat-info">
              <div class="stat-number">100%</div>
              <div class="stat-label">Secure & Safe</div>
            </div>
          </div>
          <div class="trust-stat">
            <div class="stat-icon">
              <i class="mdi mdi-account-heart"></i>
            </div>
            <div class="stat-info">
              <div class="stat-number">50K+</div>
              <div class="stat-label">Happy Users</div>
            </div>
          </div>
          <div class="trust-stat">
            <div class="stat-icon">
              <i class="mdi mdi-clock-check"></i>
            </div>
            <div class="stat-info">
              <div class="stat-number">99.9%</div>
              <div class="stat-label">Uptime</div>
            </div>
          </div>
          <div class="trust-stat">
            <div class="stat-icon">
              <i class="mdi mdi-medal"></i>
            </div>
            <div class="stat-info">
              <div class="stat-number">#1</div>
              <div class="stat-label">Rated Tool</div>
            </div>
          </div>
        </div>

        <div class="guarantees">
          <div class="guarantee-item">
            <i class="mdi mdi-credit-card-off"></i>
            <span>No hidden fees</span>
          </div>
          <div class="guarantee-item">
            <i class="mdi mdi-cancel"></i>
            <span>Cancel anytime</span>
          </div>
          <div class="guarantee-item">
            <i class="mdi mdi-refresh"></i>
            <span>30-day money back</span>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="final-cta">
      <div class="cta-content">
        <h2>Ready to Grow Your Instagram?</h2>
        <p>Join thousands of creators and businesses using Omni Instagram</p>
        <div class="cta-buttons">
          <button class="cta-primary" @click="selectPlan(popularPlan)">
            Start Free Trial
          </button>
          <button class="cta-secondary" @click="viewDemo">Watch Demo</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';

  const isAnnual = ref(false);
  const activeFaq = ref(null);

  const pricingPlans = ref([
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for getting started',
      icon: 'mdi mdi-gift',
      monthlyPrice: 0,
      annualPrice: 0,
      popular: false,
      features: [
        '1 Instagram account',
        '10 posts per month',
        'Basic scheduling',
        'Email support',
        'Mobile app access',
      ],
    },
    {
      id: 'basic',
      name: 'Basic',
      description: 'Great for small businesses',
      icon: 'mdi mdi-rocket',
      monthlyPrice: 9,
      annualPrice: 86,
      popular: false,
      features: [
        '3 Instagram accounts',
        '100 posts per month',
        'Advanced scheduling',
        'Priority email support',
        'Basic analytics',
        'Auto repost',
        'Content library',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Best for growing businesses',
      icon: 'mdi mdi-star',
      monthlyPrice: 29,
      annualPrice: 278,
      popular: true,
      features: [
        '10 Instagram accounts',
        '1000 posts per month',
        'AI-powered optimization',
        '24/7 priority support',
        'Advanced analytics',
        'Team collaboration',
        'Custom branding',
        'API access',
        'Bulk upload',
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations',
      icon: 'mdi mdi-office-building',
      monthlyPrice: 99,
      annualPrice: 950,
      popular: false,
      features: [
        'Unlimited accounts',
        'Unlimited posts',
        'White-label solution',
        'Dedicated account manager',
        'Custom integrations',
        'Advanced security',
        'Custom analytics',
        'SLA guarantee',
        'Training & onboarding',
      ],
    },
  ]);

  const comparisonFeatures = ref([
    {
      name: 'Instagram Accounts',
      tooltip: 'Number of Instagram accounts you can connect',
      plans: { free: '1', basic: '3', pro: '10', enterprise: 'Unlimited' },
    },
    {
      name: 'Posts per Month',
      tooltip: 'Maximum number of posts you can schedule monthly',
      plans: {
        free: '10',
        basic: '100',
        pro: '1,000',
        enterprise: 'Unlimited',
      },
    },
    {
      name: 'Basic Scheduling',
      plans: { free: true, basic: true, pro: true, enterprise: true },
    },
    {
      name: 'Advanced Scheduling',
      tooltip: 'Recurring posts, bulk scheduling, and more',
      plans: { free: false, basic: true, pro: true, enterprise: true },
    },
    {
      name: 'AI Optimization',
      tooltip: 'AI-powered best time to post suggestions',
      plans: { free: false, basic: false, pro: true, enterprise: true },
    },
    {
      name: 'Analytics & Reports',
      plans: {
        free: 'Basic',
        basic: 'Standard',
        pro: 'Advanced',
        enterprise: 'Custom',
      },
    },
    {
      name: 'Team Collaboration',
      plans: { free: false, basic: false, pro: true, enterprise: true },
    },
    {
      name: 'API Access',
      plans: { free: false, basic: false, pro: true, enterprise: true },
    },
    {
      name: 'Custom Branding',
      plans: { free: false, basic: false, pro: true, enterprise: true },
    },
    {
      name: 'Priority Support',
      plans: { free: false, basic: true, pro: true, enterprise: true },
    },
    {
      name: 'Dedicated Manager',
      plans: { free: false, basic: false, pro: false, enterprise: true },
    },
  ]);

  const faqs = ref([
    {
      id: 1,
      question: 'Can I change my plan anytime?',
      answer:
        "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle, and we'll prorate any differences.",
    },
    {
      id: 2,
      question: 'Is there a free trial?',
      answer:
        'Yes! All paid plans come with a 14-day free trial. No credit card required to start your trial.',
    },
    {
      id: 3,
      question: 'What payment methods do you accept?',
      answer:
        'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for enterprise customers.',
    },
    {
      id: 4,
      question: 'Can I cancel my subscription?',
      answer:
        "Absolutely. You can cancel your subscription at any time from your account settings. You'll continue to have access until the end of your billing period.",
    },
    {
      id: 5,
      question: 'Do you offer refunds?',
      answer:
        "Yes, we offer a 30-day money-back guarantee. If you're not satisfied, contact our support team for a full refund.",
    },
    {
      id: 6,
      question: 'Is my data secure?',
      answer:
        'Absolutely. We use bank-level encryption and follow industry best practices to keep your data secure. We never store your Instagram passwords.',
    },
  ]);

  const popularPlan = computed(() => {
    return pricingPlans.value.find(plan => plan.popular);
  });

  const getCurrentPrice = (plan: any): number => {
    if (plan.id === 'free') return 0;
    if (isAnnual.value) {
      return Math.round(plan.annualPrice / 12);
    }
    return plan.monthlyPrice;
  };

  const getAnnualSavings = (plan: any): number => {
    if (plan.id === 'free') return 0;
    const monthlyTotal = plan.monthlyPrice * 12;
    return monthlyTotal - plan.annualPrice;
  };

  const toggleBilling = () => {
    isAnnual.value = !isAnnual.value;
  };

  const toggleFaq = (faqId: number) => {
    activeFaq.value = activeFaq.value === faqId ? null : faqId;
  };

  const selectPlan = (plan: any) => {
    console.log('Selected plan:', plan.name);
    // Handle plan selection logic
  };

  const viewDemo = () => {
    console.log('View demo clicked');
    // Handle demo view logic
  };
</script>

<style scoped>
  .neumorphism-pricing {
    background: #e0e5ec;
    min-height: 100vh;
    font-family:
      'Inter',
      -apple-system,
      BlinkMacSystemFont,
      sans-serif;
  }

  /* Hero Section */
  .pricing-hero {
    padding: 80px 20px;
    text-align: center;
  }

  .hero-content {
    max-width: 800px;
    margin: 0 auto;
  }

  .hero-title {
    font-size: 3rem;
    font-weight: 700;
    color: #4a5568;
    margin: 0 0 20px 0;
    text-shadow:
      2px 2px 4px rgba(163, 177, 198, 0.3),
      -2px -2px 4px rgba(255, 255, 255, 0.7);
  }

  .hero-subtitle {
    font-size: 1.3rem;
    color: #718096;
    margin: 0 0 40px 0;
    line-height: 1.6;
  }

  /* Billing Toggle */
  .billing-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    background: #e0e5ec;
    padding: 20px 30px;
    border-radius: 20px;
    margin: 0 auto;
    max-width: 400px;
    box-shadow:
      inset 12px 12px 24px rgba(163, 177, 198, 0.6),
      inset -12px -12px 24px rgba(255, 255, 255, 0.7);
  }

  .toggle-label {
    font-weight: 600;
    color: #718096;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .toggle-label.active {
    color: #4a5568;
  }

  .savings-badge {
    background: #48bb78;
    color: white;
    font-size: 0.7rem;
    padding: 2px 6px;
    border-radius: 6px;
    font-weight: 600;
  }

  .toggle-switch {
    width: 60px;
    height: 30px;
    background: #e0e5ec;
    border-radius: 15px;
    position: relative;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow:
      inset 8px 8px 16px rgba(163, 177, 198, 0.6),
      inset -8px -8px 16px rgba(255, 255, 255, 0.7);
  }

  .toggle-slider {
    width: 24px;
    height: 24px;
    background: #e0e5ec;
    border-radius: 50%;
    position: absolute;
    top: 3px;
    left: 3px;
    transition: all 0.3s ease;
    box-shadow:
      4px 4px 8px rgba(163, 177, 198, 0.6),
      -4px -4px 8px rgba(255, 255, 255, 0.7);
  }

  .toggle-slider.annual {
    transform: translateX(30px);
  }

  /* Pricing Section */
  .pricing-section {
    padding: 60px 20px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .pricing-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 30px;
    align-items: stretch;
  }

  .pricing-card {
    background: #e0e5ec;
    border-radius: 25px;
    padding: 30px;
    position: relative;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    box-shadow:
      15px 15px 30px rgba(163, 177, 198, 0.6),
      -15px -15px 30px rgba(255, 255, 255, 0.7);
  }

  .pricing-card:hover {
    transform: translateY(-5px);
    box-shadow:
      20px 20px 40px rgba(163, 177, 198, 0.7),
      -20px -20px 40px rgba(255, 255, 255, 0.8);
  }

  .pricing-card.popular {
    transform: scale(1.05);
    box-shadow:
      20px 20px 40px rgba(163, 177, 198, 0.7),
      -20px -20px 40px rgba(255, 255, 255, 0.8);
  }

  .pricing-card.popular:hover {
    transform: scale(1.05) translateY(-5px);
  }

  .pricing-card.enterprise {
    background: linear-gradient(135deg, #e0e5ec 0%, #edf2f7 100%);
  }

  /* Popular Badge */
  .popular-badge {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: #4299e1;
    color: white;
    padding: 8px 20px;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 5px;
    box-shadow:
      8px 8px 16px rgba(163, 177, 198, 0.6),
      -8px -8px 16px rgba(255, 255, 255, 0.7);
  }

  /* Plan Header */
  .plan-header {
    text-align: center;
    margin-bottom: 30px;
  }

  .plan-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #e0e5ec;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    box-shadow:
      inset 8px 8px 16px rgba(163, 177, 198, 0.6),
      inset -8px -8px 16px rgba(255, 255, 255, 0.7);
  }

  .plan-icon i {
    font-size: 1.5rem;
    color: #4299e1;
  }

  .pricing-card.popular .plan-icon i {
    color: #4299e1;
  }

  .pricing-card.enterprise .plan-icon i {
    color: #805ad5;
  }

  .plan-name {
    font-size: 1.5rem;
    font-weight: 700;
    color: #4a5568;
    margin: 0 0 10px 0;
  }

  .plan-description {
    color: #718096;
    margin: 0;
    font-size: 0.95rem;
  }

  /* Pricing */
  .plan-pricing {
    text-align: center;
    margin-bottom: 30px;
  }

  .price-main {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 5px;
    margin-bottom: 8px;
  }

  .currency {
    font-size: 1.2rem;
    color: #718096;
    font-weight: 600;
  }

  .amount {
    font-size: 3rem;
    font-weight: 700;
    color: #4a5568;
  }

  .period {
    font-size: 1rem;
    color: #718096;
  }

  .price-secondary {
    font-size: 0.9rem;
    color: #48bb78;
    font-weight: 500;
  }

  .free-forever {
    font-size: 0.95rem;
    color: #4299e1;
    font-weight: 600;
  }

  /* Features */
  .features-section {
    flex: 1;
    margin-bottom: 30px;
  }

  .features-section h4 {
    font-size: 1rem;
    font-weight: 600;
    color: #4a5568;
    margin: 0 0 20px 0;
  }

  .features-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .feature-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 8px 0;
    color: #4a5568;
    font-size: 0.95rem;
    line-height: 1.4;
  }

  .feature-check {
    color: #48bb78;
    font-size: 1rem;
    margin-top: 2px;
    flex-shrink: 0;
  }

  /* CTA Button */
  .plan-cta {
    text-align: center;
  }

  .cta-button {
    width: 100%;
    background: #e0e5ec;
    border: none;
    padding: 15px 20px;
    border-radius: 15px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 12px;
    transition: all 0.3s ease;
    box-shadow:
      10px 10px 20px rgba(163, 177, 198, 0.6),
      -10px -10px 20px rgba(255, 255, 255, 0.7);
  }

  .cta-button:hover {
    box-shadow:
      5px 5px 10px rgba(163, 177, 198, 0.6),
      -5px -5px 10px rgba(255, 255, 255, 0.7);
    transform: translateY(2px);
  }

  .cta-button.primary {
    color: #4299e1;
  }

  .cta-button.secondary {
    color: #718096;
  }

  .cta-button.enterprise {
    color: #805ad5;
  }

  .trial-info {
    font-size: 0.85rem;
    color: #718096;
    margin: 0;
    line-height: 1.3;
  }

  /* Comparison Section */
  .comparison-section {
    padding: 80px 20px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .section-header {
    text-align: center;
    margin-bottom: 50px;
  }

  .section-header h2 {
    font-size: 2.5rem;
    font-weight: 700;
    color: #4a5568;
    margin: 0 0 15px 0;
    text-shadow:
      2px 2px 4px rgba(163, 177, 198, 0.3),
      -2px -2px 4px rgba(255, 255, 255, 0.7);
  }

  .section-header p {
    font-size: 1.1rem;
    color: #718096;
    margin: 0;
  }

  .comparison-table {
    background: #e0e5ec;
    border-radius: 20px;
    overflow: hidden;
    box-shadow:
      15px 15px 30px rgba(163, 177, 198, 0.6),
      -15px -15px 30px rgba(255, 255, 255, 0.7);
  }

  .table-header {
    display: grid;
    grid-template-columns: 2fr repeat(4, 1fr);
    gap: 20px;
    padding: 25px;
    background: rgba(163, 177, 198, 0.1);
    font-weight: 700;
    color: #4a5568;
  }

  .table-body {
    padding: 0 25px 25px;
  }

  .feature-row {
    display: grid;
    grid-template-columns: 2fr repeat(4, 1fr);
    gap: 20px;
    padding: 15px 0;
    border-bottom: 1px solid rgba(163, 177, 198, 0.2);
    align-items: center;
  }

  .feature-row:last-child {
    border-bottom: none;
  }

  .feature-name {
    font-weight: 600;
    color: #4a5568;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .tooltip-icon {
    color: #718096;
    cursor: help;
  }

  .feature-value {
    text-align: center;
    color: #4a5568;
  }

  .check-yes {
    color: #48bb78;
    font-size: 1.2rem;
  }

  .check-no {
    color: #f56565;
    font-size: 1.2rem;
  }

  .feature-text {
    font-weight: 500;
  }

  /* FAQ Section */
  .faq-section {
    padding: 80px 20px;
    max-width: 800px;
    margin: 0 auto;
  }

  .faq-grid {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .faq-item {
    background: #e0e5ec;
    border-radius: 15px;
    padding: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow:
      12px 12px 24px rgba(163, 177, 198, 0.6),
      -12px -12px 24px rgba(255, 255, 255, 0.7);
  }

  .faq-item:hover {
    transform: translateY(-2px);
    box-shadow:
      15px 15px 30px rgba(163, 177, 198, 0.7),
      -15px -15px 30px rgba(255, 255, 255, 0.8);
  }

  .faq-item.active {
    box-shadow:
      inset 12px 12px 24px rgba(163, 177, 198, 0.6),
      inset -12px -12px 24px rgba(255, 255, 255, 0.7);
  }

  .faq-question {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
  }

  .faq-question h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #4a5568;
    margin: 0;
    flex: 1;
  }

  .faq-question i {
    color: #718096;
    font-size: 1.2rem;
    transition: transform 0.3s ease;
  }

  .faq-item.active .faq-question i {
    transform: rotate(180deg);
  }

  .faq-answer {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid rgba(163, 177, 198, 0.3);
  }

  .faq-answer p {
    color: #718096;
    line-height: 1.6;
    margin: 0;
  }

  /* Trust Section */
  .trust-section {
    padding: 80px 20px;
    background: #e0e5ec;
  }

  .trust-content {
    max-width: 1000px;
    margin: 0 auto;
  }

  .trust-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 30px;
    margin-bottom: 50px;
  }

  .trust-stat {
    background: #e0e5ec;
    padding: 25px;
    border-radius: 20px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    box-shadow:
      12px 12px 24px rgba(163, 177, 198, 0.6),
      -12px -12px 24px rgba(255, 255, 255, 0.7);
  }

  .stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #e0e5ec;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow:
      inset 8px 8px 16px rgba(163, 177, 198, 0.6),
      inset -8px -8px 16px rgba(255, 255, 255, 0.7);
  }

  .stat-icon i {
    font-size: 1.5rem;
    color: #48bb78;
  }

  .stat-number {
    font-size: 1.8rem;
    font-weight: 700;
    color: #4a5568;
    margin-bottom: 5px;
  }

  .stat-label {
    color: #718096;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .guarantees {
    display: flex;
    justify-content: center;
    gap: 40px;
    flex-wrap: wrap;
  }

  .guarantee-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #4a5568;
    font-weight: 600;
  }

  .guarantee-item i {
    color: #48bb78;
    font-size: 1.2rem;
  }

  /* Final CTA */
  .final-cta {
    padding: 80px 20px;
    text-align: center;
    background: #e0e5ec;
  }

  .cta-content {
    max-width: 600px;
    margin: 0 auto;
    background: #e0e5ec;
    padding: 50px 40px;
    border-radius: 25px;
    box-shadow:
      20px 20px 40px rgba(163, 177, 198, 0.6),
      -20px -20px 40px rgba(255, 255, 255, 0.7);
  }

  .cta-content h2 {
    font-size: 2.2rem;
    font-weight: 700;
    color: #4a5568;
    margin: 0 0 15px 0;
    text-shadow:
      2px 2px 4px rgba(163, 177, 198, 0.3),
      -2px -2px 4px rgba(255, 255, 255, 0.7);
  }

  .cta-content p {
    font-size: 1.1rem;
    color: #718096;
    margin: 0 0 30px 0;
    line-height: 1.5;
  }

  .cta-buttons {
    display: flex;
    gap: 15px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .cta-primary,
  .cta-secondary {
    background: #e0e5ec;
    border: none;
    padding: 15px 30px;
    border-radius: 15px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow:
      10px 10px 20px rgba(163, 177, 198, 0.6),
      -10px -10px 20px rgba(255, 255, 255, 0.7);
  }

  .cta-primary {
    color: #4299e1;
  }

  .cta-secondary {
    color: #718096;
  }

  .cta-primary:hover,
  .cta-secondary:hover {
    box-shadow:
      5px 5px 10px rgba(163, 177, 198, 0.6),
      -5px -5px 10px rgba(255, 255, 255, 0.7);
    transform: translateY(2px);
  }

  /* Responsive Design */
  @media (max-width: 1024px) {
    .pricing-grid {
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    }

    .table-header,
    .feature-row {
      grid-template-columns: 1fr;
      gap: 10px;
      text-align: left;
    }

    .feature-value {
      text-align: left;
    }

    .comparison-table {
      overflow-x: auto;
    }
  }

  @media (max-width: 768px) {
    .hero-title {
      font-size: 2rem;
    }

    .section-header h2 {
      font-size: 1.8rem;
    }

    .pricing-grid {
      grid-template-columns: 1fr;
    }

    .pricing-card.popular {
      transform: none;
    }

    .pricing-card.popular:hover {
      transform: translateY(-5px);
    }

    .billing-toggle {
      flex-direction: column;
      gap: 10px;
    }

    .trust-stats {
      grid-template-columns: repeat(2, 1fr);
    }

    .guarantees {
      flex-direction: column;
      gap: 15px;
    }

    .cta-buttons {
      flex-direction: column;
      align-items: center;
    }

    .cta-primary,
    .cta-secondary {
      width: 100%;
      max-width: 300px;
    }

    .cta-content {
      padding: 30px 25px;
    }
  }
</style>
