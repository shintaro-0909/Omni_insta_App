<template>
  <div class="minimalist-pricing">
    <!-- Header -->
    <header class="header">
      <div class="container">
        <nav class="navigation">
          <div class="logo">Omniy</div>
          <button class="back-button">← Back</button>
        </nav>
      </div>
    </header>

    <!-- Hero -->
    <section class="pricing-hero">
      <div class="container">
        <h1 class="hero-title">Simple, Transparent Pricing</h1>
        <p class="hero-subtitle">Choose the plan that fits your needs</p>

        <!-- Billing Toggle -->
        <div class="billing-toggle">
          <button
            class="toggle-option"
            :class="{ active: billing === 'monthly' }"
            @click="billing = 'monthly'"
          >
            Monthly
          </button>
          <button
            class="toggle-option"
            :class="{ active: billing === 'yearly' }"
            @click="billing = 'yearly'"
          >
            Yearly <span class="discount">Save 20%</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Pricing Cards -->
    <section class="pricing-section">
      <div class="container">
        <div class="pricing-grid">
          <!-- Free Plan -->
          <div class="pricing-card">
            <div class="plan-header">
              <h3 class="plan-name">Free</h3>
              <div class="plan-price">
                <span class="price-currency">$</span>
                <span class="price-amount">0</span>
                <span class="price-period">forever</span>
              </div>
              <p class="plan-description">Perfect for getting started</p>
            </div>

            <ul class="feature-list">
              <li class="feature-item">
                <span class="feature-icon">✓</span>
                1 Instagram account
              </li>
              <li class="feature-item">
                <span class="feature-icon">✓</span>
                10 posts per month
              </li>
              <li class="feature-item">
                <span class="feature-icon">✓</span>
                Basic scheduling
              </li>
              <li class="feature-item">
                <span class="feature-icon">✓</span>
                Instagram preview
              </li>
              <li class="feature-item disabled">
                <span class="feature-icon">×</span>
                Analytics dashboard
              </li>
              <li class="feature-item disabled">
                <span class="feature-icon">×</span>
                Priority support
              </li>
            </ul>

            <button class="plan-button">Get Started</button>
          </div>

          <!-- Pro Plan -->
          <div class="pricing-card featured">
            <div class="plan-badge">Most Popular</div>
            <div class="plan-header">
              <h3 class="plan-name">Pro</h3>
              <div class="plan-price">
                <span class="price-currency">$</span>
                <span class="price-amount">{{
                  billing === 'monthly' ? '29' : '23'
                }}</span>
                <span class="price-period">per month</span>
              </div>
              <p class="plan-description">For growing businesses</p>
            </div>

            <ul class="feature-list">
              <li class="feature-item">
                <span class="feature-icon">✓</span>
                10 Instagram accounts
              </li>
              <li class="feature-item">
                <span class="feature-icon">✓</span>
                1,000 posts per month
              </li>
              <li class="feature-item">
                <span class="feature-icon">✓</span>
                Advanced scheduling
              </li>
              <li class="feature-item">
                <span class="feature-icon">✓</span>
                Instagram preview
              </li>
              <li class="feature-item">
                <span class="feature-icon">✓</span>
                Analytics dashboard
              </li>
              <li class="feature-item">
                <span class="feature-icon">✓</span>
                Priority support
              </li>
            </ul>

            <button class="plan-button primary">Get Started</button>
          </div>

          <!-- Business Plan -->
          <div class="pricing-card">
            <div class="plan-header">
              <h3 class="plan-name">Business</h3>
              <div class="plan-price">
                <span class="price-currency">$</span>
                <span class="price-amount">{{
                  billing === 'monthly' ? '99' : '79'
                }}</span>
                <span class="price-period">per month</span>
              </div>
              <p class="plan-description">For large teams</p>
            </div>

            <ul class="feature-list">
              <li class="feature-item">
                <span class="feature-icon">✓</span>
                Unlimited accounts
              </li>
              <li class="feature-item">
                <span class="feature-icon">✓</span>
                10,000 posts per month
              </li>
              <li class="feature-item">
                <span class="feature-icon">✓</span>
                Advanced scheduling
              </li>
              <li class="feature-item">
                <span class="feature-icon">✓</span>
                Instagram preview
              </li>
              <li class="feature-item">
                <span class="feature-icon">✓</span>
                Advanced analytics
              </li>
              <li class="feature-item">
                <span class="feature-icon">✓</span>
                Dedicated support
              </li>
            </ul>

            <button class="plan-button">Contact Sales</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Comparison Table -->
    <section class="comparison-section">
      <div class="container">
        <h2 class="section-title">Compare Plans</h2>

        <div class="comparison-table">
          <div class="table-header">
            <div class="feature-col">Features</div>
            <div class="plan-col">Free</div>
            <div class="plan-col featured">Pro</div>
            <div class="plan-col">Business</div>
          </div>

          <div
            class="table-row"
            v-for="feature in features"
            :key="feature.name"
          >
            <div class="feature-col">{{ feature.name }}</div>
            <div class="plan-col">{{ feature.free }}</div>
            <div class="plan-col featured">{{ feature.pro }}</div>
            <div class="plan-col">{{ feature.business }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="faq-section">
      <div class="container">
        <h2 class="section-title">Frequently Asked Questions</h2>

        <div class="faq-list">
          <details class="faq-item">
            <summary class="faq-question">Can I change plans anytime?</summary>
            <p class="faq-answer">
              Yes, you can upgrade or downgrade your plan at any time. Changes
              take effect immediately.
            </p>
          </details>

          <details class="faq-item">
            <summary class="faq-question">
              What payment methods do you accept?
            </summary>
            <p class="faq-answer">
              We accept all major credit cards, debit cards, and PayPal through
              our secure payment processor Stripe.
            </p>
          </details>

          <details class="faq-item">
            <summary class="faq-question">Is there a setup fee?</summary>
            <p class="faq-answer">
              No, there are no setup fees or hidden charges. You only pay the
              monthly subscription fee.
            </p>
          </details>

          <details class="faq-item">
            <summary class="faq-question">
              Can I cancel my subscription?
            </summary>
            <p class="faq-answer">
              Yes, you can cancel your subscription at any time. You'll continue
              to have access until the end of your billing period.
            </p>
          </details>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <p class="footer-text">© 2025 Omniy. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
  import { ref } from 'vue';

  const billing = ref('monthly');

  const features = [
    { name: 'Instagram Accounts', free: '1', pro: '10', business: 'Unlimited' },
    { name: 'Posts per Month', free: '10', pro: '1,000', business: '10,000' },
    {
      name: 'Scheduling',
      free: 'Basic',
      pro: 'Advanced',
      business: 'Advanced',
    },
    { name: 'Analytics', free: '—', pro: '✓', business: 'Advanced' },
    {
      name: 'Content Library',
      free: '10 items',
      pro: 'Unlimited',
      business: 'Unlimited',
    },
    { name: 'Team Members', free: '1', pro: '5', business: 'Unlimited' },
    { name: 'API Access', free: '—', pro: '—', business: '✓' },
    { name: 'Support', free: 'Email', pro: 'Priority', business: 'Dedicated' },
  ];
</script>

<style scoped>
  /* Base */
  .minimalist-pricing {
    min-height: 100vh;
    background: #fff;
    font-family:
      'Inter',
      -apple-system,
      BlinkMacSystemFont,
      sans-serif;
    color: #000;
    line-height: 1.6;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  /* Header */
  .header {
    border-bottom: 1px solid #e9ecef;
  }

  .navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 80px;
  }

  .logo {
    font-size: 1.5rem;
    font-weight: 500;
    letter-spacing: -0.02em;
  }

  .back-button {
    padding: 0.75rem 1.5rem;
    border: 1px solid #e9ecef;
    background: transparent;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .back-button:hover {
    border-color: #000;
  }

  /* Hero */
  .pricing-hero {
    padding: 6rem 0 4rem;
    text-align: center;
  }

  .hero-title {
    font-size: 3rem;
    font-weight: 300;
    letter-spacing: -0.03em;
    margin-bottom: 1rem;
  }

  .hero-subtitle {
    font-size: 1.25rem;
    color: #666;
    margin-bottom: 3rem;
  }

  /* Billing Toggle */
  .billing-toggle {
    display: inline-flex;
    border: 1px solid #e9ecef;
  }

  .toggle-option {
    padding: 0.75rem 2rem;
    background: transparent;
    border: none;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
  }

  .toggle-option:first-child {
    border-right: 1px solid #e9ecef;
  }

  .toggle-option.active {
    background: #000;
    color: #fff;
  }

  .discount {
    font-size: 0.75rem;
    color: #00a86b;
    margin-left: 0.5rem;
  }

  .toggle-option.active .discount {
    color: #4dff88;
  }

  /* Pricing Section */
  .pricing-section {
    padding: 4rem 0;
  }

  .pricing-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }

  /* Pricing Card */
  .pricing-card {
    border: 1px solid #e9ecef;
    padding: 3rem;
    position: relative;
    transition: all 0.2s ease;
  }

  .pricing-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.05);
  }

  .pricing-card.featured {
    border-color: #000;
  }

  .plan-badge {
    position: absolute;
    top: -1px;
    left: 50%;
    transform: translateX(-50%);
    background: #000;
    color: #fff;
    padding: 0.5rem 1.5rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .plan-header {
    text-align: center;
    padding-bottom: 2rem;
    border-bottom: 1px solid #f8f9fa;
    margin-bottom: 2rem;
  }

  .plan-name {
    font-size: 1.125rem;
    font-weight: 400;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .plan-price {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 0.25rem;
    margin-bottom: 0.5rem;
  }

  .price-currency {
    font-size: 1.25rem;
    color: #666;
  }

  .price-amount {
    font-size: 3rem;
    font-weight: 300;
    letter-spacing: -0.02em;
  }

  .price-period {
    font-size: 0.875rem;
    color: #666;
  }

  .plan-description {
    font-size: 0.875rem;
    color: #666;
  }

  /* Feature List */
  .feature-list {
    list-style: none;
    padding: 0;
    margin: 0 0 2rem;
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 0;
    border-bottom: 1px solid #f8f9fa;
    font-size: 0.95rem;
  }

  .feature-item:last-child {
    border-bottom: none;
  }

  .feature-item.disabled {
    color: #ccc;
  }

  .feature-icon {
    font-size: 1rem;
    width: 20px;
    text-align: center;
  }

  /* Plan Button */
  .plan-button {
    width: 100%;
    padding: 1rem;
    border: 1px solid #e9ecef;
    background: transparent;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .plan-button:hover {
    border-color: #000;
  }

  .plan-button.primary {
    background: #000;
    color: #fff;
    border-color: #000;
  }

  .plan-button.primary:hover {
    background: #222;
    border-color: #222;
  }

  /* Comparison Section */
  .comparison-section {
    padding: 6rem 0;
    background: #f8f9fa;
  }

  .section-title {
    font-size: 2rem;
    font-weight: 300;
    text-align: center;
    margin-bottom: 4rem;
  }

  /* Comparison Table */
  .comparison-table {
    background: #fff;
    border: 1px solid #e9ecef;
    overflow: hidden;
  }

  .table-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    background: #f8f9fa;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 0.875rem;
  }

  .table-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    border-top: 1px solid #e9ecef;
  }

  .feature-col {
    padding: 1.5rem;
    text-align: left;
  }

  .plan-col {
    padding: 1.5rem;
    text-align: center;
    border-left: 1px solid #e9ecef;
  }

  .plan-col.featured {
    background: rgba(0, 0, 0, 0.02);
  }

  /* FAQ Section */
  .faq-section {
    padding: 6rem 0;
  }

  .faq-list {
    max-width: 800px;
    margin: 0 auto;
  }

  .faq-item {
    border-bottom: 1px solid #e9ecef;
    padding: 2rem 0;
  }

  .faq-item:last-child {
    border-bottom: none;
  }

  .faq-question {
    font-size: 1.125rem;
    cursor: pointer;
    list-style: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .faq-question::after {
    content: '+';
    font-size: 1.5rem;
    font-weight: 300;
    transition: transform 0.2s ease;
  }

  .faq-item[open] .faq-question::after {
    transform: rotate(45deg);
  }

  .faq-answer {
    margin-top: 1rem;
    color: #666;
    line-height: 1.8;
  }

  /* Footer */
  .footer {
    padding: 4rem 0;
    border-top: 1px solid #e9ecef;
    text-align: center;
  }

  .footer-text {
    font-size: 0.875rem;
    color: #666;
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .pricing-grid {
      grid-template-columns: 1fr;
      max-width: 400px;
      margin: 0 auto;
    }

    .table-header,
    .table-row {
      grid-template-columns: 2fr 1fr 1fr 1fr;
      font-size: 0.875rem;
    }

    .feature-col,
    .plan-col {
      padding: 1rem 0.5rem;
    }
  }

  @media (max-width: 768px) {
    .hero-title {
      font-size: 2rem;
    }

    .comparison-table {
      overflow-x: auto;
    }

    .table-header,
    .table-row {
      min-width: 600px;
    }
  }
</style>
