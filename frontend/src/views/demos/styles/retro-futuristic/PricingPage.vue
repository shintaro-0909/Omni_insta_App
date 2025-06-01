<template>
  <div class="retro-pricing">
    <!-- Sunset Background -->
    <div class="sunset-backdrop">
      <div class="sun-orb"></div>
      <div class="horizon-grid"></div>
      <div class="retro-stars"></div>
      <div class="vhs-overlay"></div>
    </div>

    <!-- Header -->
    <header class="pricing-header">
      <h1 class="main-title">
        <span class="title-line">━━━━━</span>
        <span class="title-text">CHOOSE YOUR FUTURE</span>
        <span class="title-line">━━━━━</span>
      </h1>
      <p class="subtitle">SELECT YOUR CYBERNETIC ENHANCEMENT PACKAGE</p>
    </header>

    <!-- Main Content -->
    <main class="pricing-main">
      <!-- Pricing Cards -->
      <section class="pricing-grid">
        <div
          class="price-card"
          v-for="plan in plans"
          :key="plan.id"
          :class="{ featured: plan.featured }"
          @click="selectPlan(plan)"
        >
          <!-- Card Background Effects -->
          <div class="card-bg-effect"></div>
          <div class="card-scan-lines"></div>

          <!-- Card Content -->
          <div class="card-content">
            <div class="plan-header">
              <h2 class="plan-name">{{ plan.name }}</h2>
              <div class="plan-icon">{{ plan.icon }}</div>
            </div>

            <div class="price-display">
              <span class="currency">¥</span>
              <span class="price-number">{{ plan.price }}</span>
              <span class="price-period">/月</span>
            </div>

            <div class="plan-description">
              {{ plan.description }}
            </div>

            <div class="features-list">
              <div
                class="feature-item"
                v-for="feature in plan.features"
                :key="feature"
              >
                <span class="feature-icon">▸</span>
                <span class="feature-text">{{ feature }}</span>
              </div>
            </div>

            <button class="select-button" :class="{ glowing: plan.featured }">
              <span class="button-text">{{
                plan.featured ? 'MOST POPULAR' : 'SELECT PLAN'
              }}</span>
              <div class="button-glow"></div>
              <div class="button-border"></div>
            </button>
          </div>

          <!-- Neon Border -->
          <div class="card-neon-border"></div>
        </div>
      </section>

      <!-- Comparison Table -->
      <section class="comparison-section">
        <h2 class="section-title">
          <span class="neon-text">FEATURE MATRIX</span>
        </h2>

        <div class="comparison-table">
          <div class="table-header">
            <div class="feature-label">CAPABILITIES</div>
            <div class="plan-column" v-for="plan in plans" :key="plan.id">
              {{ plan.name }}
            </div>
          </div>

          <div class="table-body">
            <div
              class="table-row"
              v-for="(feature, index) in comparisonFeatures"
              :key="index"
            >
              <div class="feature-name">{{ feature.name }}</div>
              <div class="plan-cell" v-for="plan in plans" :key="plan.id">
                <span v-if="feature.values[plan.id] === true" class="check-icon"
                  >✓</span
                >
                <span
                  v-else-if="feature.values[plan.id] === false"
                  class="cross-icon"
                  >✕</span
                >
                <span v-else class="value-text">{{
                  feature.values[plan.id]
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ Section -->
      <section class="faq-section">
        <h2 class="section-title">
          <span class="neon-text">FREQUENTLY ACCESSED QUERIES</span>
        </h2>

        <div class="faq-grid">
          <div
            class="faq-item"
            v-for="(faq, index) in faqs"
            :key="index"
            @click="toggleFaq(index)"
            :class="{ active: activeFaq === index }"
          >
            <div class="faq-header">
              <h3 class="faq-question">{{ faq.question }}</h3>
              <span class="faq-toggle">{{
                activeFaq === index ? '−' : '+'
              }}</span>
            </div>
            <transition name="faq">
              <div class="faq-answer" v-if="activeFaq === index">
                <p>{{ faq.answer }}</p>
                <div class="answer-glow"></div>
              </div>
            </transition>
          </div>
        </div>
      </section>

      <!-- Subscription Benefits -->
      <section class="benefits-section">
        <h2 class="section-title">
          <span class="neon-text">SUBSCRIPTION PERKS</span>
        </h2>

        <div class="benefits-grid">
          <div
            class="benefit-card"
            v-for="benefit in benefits"
            :key="benefit.id"
          >
            <div class="benefit-icon">{{ benefit.icon }}</div>
            <h3 class="benefit-title">{{ benefit.title }}</h3>
            <p class="benefit-desc">{{ benefit.description }}</p>
            <div class="benefit-pulse"></div>
          </div>
        </div>
      </section>

      <!-- Reviews Section -->
      <section class="reviews-section">
        <h2 class="section-title">
          <span class="neon-text">USER TRANSMISSIONS</span>
        </h2>

        <div class="reviews-carousel">
          <div class="review-card" v-for="review in reviews" :key="review.id">
            <div class="review-header">
              <div class="reviewer-info">
                <div class="reviewer-avatar">
                  <img :src="review.avatar" :alt="review.name" />
                </div>
                <div class="reviewer-details">
                  <h4 class="reviewer-name">{{ review.name }}</h4>
                  <p class="reviewer-handle">@{{ review.handle }}</p>
                </div>
              </div>
              <div class="review-rating">
                <span class="star" v-for="n in 5" :key="n">★</span>
              </div>
            </div>
            <p class="review-text">{{ review.text }}</p>
            <div class="review-date">{{ review.date }}</div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section">
        <div class="cta-content">
          <h2 class="cta-title">READY TO ENHANCE YOUR REALITY?</h2>
          <p class="cta-subtitle">
            Join thousands of users in the digital revolution
          </p>
          <button class="cta-button">
            <span>START FREE TRIAL</span>
            <div class="cta-energy"></div>
          </button>
        </div>
        <div class="cta-decoration">
          <div class="decoration-line"></div>
          <div class="decoration-line"></div>
          <div class="decoration-line"></div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  // Data
  const activeFaq = ref<number | null>(null);

  const plans = ref([
    {
      id: 'starter',
      name: 'STARTER',
      icon: '🌟',
      price: '0',
      description: 'Begin your journey into the digital realm',
      features: [
        '1 Instagram Account',
        '10 Posts per Month',
        'Basic Analytics',
        'Standard Support',
      ],
      featured: false,
    },
    {
      id: 'neon',
      name: 'NEON',
      icon: '💎',
      price: '980',
      description: 'Amplify your presence with enhanced capabilities',
      features: [
        '3 Instagram Accounts',
        '100 Posts per Month',
        'Advanced Analytics',
        'AI Content Suggestions',
        'Priority Support',
      ],
      featured: true,
    },
    {
      id: 'cyber',
      name: 'CYBER',
      icon: '🚀',
      price: '2,980',
      description: 'Unlock the full potential of automation',
      features: [
        '10 Instagram Accounts',
        '1,000 Posts per Month',
        'Pro Analytics Dashboard',
        'Neural Network AI',
        'API Access',
        'Dedicated Support',
      ],
      featured: false,
    },
    {
      id: 'matrix',
      name: 'MATRIX',
      icon: '🌌',
      price: '9,800',
      description: 'Transcend limitations with infinite possibilities',
      features: [
        'Unlimited Accounts',
        '10,000 Posts per Month',
        'Quantum Analytics',
        'Custom AI Models',
        'White Label Options',
        'Personal Account Manager',
      ],
      featured: false,
    },
  ]);

  const comparisonFeatures = ref([
    {
      name: 'Instagram Accounts',
      values: { starter: '1', neon: '3', cyber: '10', matrix: '∞' },
    },
    {
      name: 'Monthly Posts',
      values: { starter: '10', neon: '100', cyber: '1,000', matrix: '10,000' },
    },
    {
      name: 'Analytics Dashboard',
      values: { starter: true, neon: true, cyber: true, matrix: true },
    },
    {
      name: 'AI Suggestions',
      values: { starter: false, neon: true, cyber: true, matrix: true },
    },
    {
      name: 'API Access',
      values: { starter: false, neon: false, cyber: true, matrix: true },
    },
    {
      name: 'Custom AI Models',
      values: { starter: false, neon: false, cyber: false, matrix: true },
    },
  ]);

  const faqs = ref([
    {
      question: 'Can I upgrade or downgrade my plan?',
      answer:
        'Yes! You can seamlessly transition between plans at any time. Your data and settings will be preserved during the migration process.',
    },
    {
      question: 'Is there a free trial available?',
      answer:
        'Absolutely! All new users get a 14-day free trial of our NEON plan to experience the full power of our platform.',
    },
    {
      question: 'What payment methods do you accept?',
      answer:
        'We accept all major credit cards, cryptocurrency, and digital payment platforms from the future.',
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer:
        'Of course! No long-term contracts. You can cancel your subscription at any time with no penalties.',
    },
  ]);

  const benefits = ref([
    {
      id: 1,
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Post at the speed of light with our quantum servers',
    },
    {
      id: 2,
      icon: '🛡️',
      title: 'Ultra Secure',
      description: 'Military-grade encryption protects your data',
    },
    {
      id: 3,
      icon: '🎯',
      title: 'AI Precision',
      description: 'Neural networks optimize your posting strategy',
    },
    {
      id: 4,
      icon: '🌐',
      title: '24/7 Support',
      description: 'Round-the-clock assistance from cyborg agents',
    },
  ]);

  const reviews = ref([
    {
      id: 1,
      name: 'Sarah Chen',
      handle: 'techinfluencer',
      avatar: 'https://i.pravatar.cc/60?img=1',
      text: 'This platform transformed my Instagram game! The AI suggestions are incredibly accurate.',
      date: '2084.05.15',
    },
    {
      id: 2,
      name: 'Alex Rivera',
      handle: 'digitalnomad',
      avatar: 'https://i.pravatar.cc/60?img=2',
      text: 'Best investment for my business. The analytics alone are worth the price!',
      date: '2084.05.10',
    },
    {
      id: 3,
      name: 'Kim Park',
      handle: 'futuremarketer',
      avatar: 'https://i.pravatar.cc/60?img=3',
      text: 'The automation features save me hours every week. Highly recommended!',
      date: '2084.05.05',
    },
  ]);

  // Methods
  const selectPlan = (plan: any) => {
    console.log('Selected plan:', plan.name);
  };

  const toggleFaq = (index: number) => {
    activeFaq.value = activeFaq.value === index ? null : index;
  };
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Exo+2:wght@300;400;700&display=swap');

  /* Base */
  .retro-pricing {
    position: relative;
    min-height: 100vh;
    background: #0a0a0f;
    color: #fff;
    font-family: 'Exo 2', sans-serif;
    overflow-x: hidden;
  }

  /* Sunset Background */
  .sunset-backdrop {
    position: fixed;
    inset: 0;
    z-index: 0;
  }

  .sun-orb {
    position: absolute;
    bottom: 20%;
    left: 50%;
    transform: translateX(-50%);
    width: 400px;
    height: 400px;
    background: radial-gradient(
      circle,
      #ffbe0b 0%,
      #ff4500 30%,
      #ff006e 60%,
      transparent 70%
    );
    border-radius: 50%;
    filter: blur(1px);
    animation: sun-breathe 6s ease-in-out infinite;
  }

  .horizon-grid {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60%;
    background:
      linear-gradient(180deg, transparent 0%, rgba(255, 0, 110, 0.1) 100%),
      repeating-linear-gradient(
        90deg,
        #ff006e 0px,
        #ff006e 2px,
        transparent 2px,
        transparent 100px
      ),
      repeating-linear-gradient(
        0deg,
        #8338ec 0px,
        #8338ec 2px,
        transparent 2px,
        transparent 50px
      );
    transform: perspective(500px) rotateX(70deg);
    transform-origin: center bottom;
    opacity: 0.3;
    animation: grid-scroll 20s linear infinite;
  }

  .retro-stars {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 50%;
    background-image:
      radial-gradient(2px 2px at 20px 30px, #fff, transparent),
      radial-gradient(2px 2px at 40px 70px, #ff006e, transparent),
      radial-gradient(1px 1px at 50px 160px, #3a86ff, transparent),
      radial-gradient(1px 1px at 80px 10px, #fff, transparent);
    background-repeat: repeat;
    background-size: 300px 300px;
    animation: twinkle 10s ease-in-out infinite;
  }

  .vhs-overlay {
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0) 0px,
      rgba(0, 0, 0, 0.05) 1px,
      rgba(0, 0, 0, 0) 2px
    );
    pointer-events: none;
    animation: vhs-lines 8s linear infinite;
  }

  /* Header */
  .pricing-header {
    position: relative;
    padding: 4rem 2rem;
    text-align: center;
    z-index: 10;
  }

  .main-title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    margin-bottom: 1rem;
  }

  .title-line {
    font-size: 1.5rem;
    color: #8338ec;
    opacity: 0.5;
    animation: line-pulse 3s ease-in-out infinite;
  }

  .title-text {
    font-family: 'Orbitron', monospace;
    font-size: clamp(2.5rem, 6vw, 4rem);
    font-weight: 900;
    background: linear-gradient(45deg, #ff006e, #8338ec, #3a86ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 60px #ff006e;
    animation: title-glow 3s ease-in-out infinite;
  }

  .subtitle {
    font-size: 1.2rem;
    color: #3a86ff;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    animation: subtitle-fade 2s ease-out;
  }

  /* Main Content */
  .pricing-main {
    position: relative;
    z-index: 1;
    padding: 2rem;
    max-width: 1600px;
    margin: 0 auto;
  }

  /* Pricing Grid */
  .pricing-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-bottom: 6rem;
  }

  .price-card {
    position: relative;
    background: rgba(26, 0, 51, 0.8);
    border: 2px solid rgba(138, 43, 226, 0.5);
    padding: 3rem 2rem;
    cursor: pointer;
    transition: all 0.3s ease;
    overflow: hidden;
  }

  .price-card:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 30px 60px rgba(255, 0, 110, 0.3);
  }

  .price-card.featured {
    border-color: #ff006e;
    background: linear-gradient(
      135deg,
      rgba(255, 0, 110, 0.1),
      rgba(26, 0, 51, 0.9)
    );
  }

  /* Card Effects */
  .card-bg-effect {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 0, 110, 0.1), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .price-card:hover .card-bg-effect {
    opacity: 1;
    animation: rotate-slow 20s linear infinite;
  }

  .card-scan-lines {
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(255, 255, 255, 0.03) 2px,
      rgba(255, 255, 255, 0.03) 4px
    );
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .price-card:hover .card-scan-lines {
    opacity: 1;
    animation: scan-vertical 4s linear infinite;
  }

  .card-content {
    position: relative;
    z-index: 1;
  }

  .plan-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .plan-name {
    font-family: 'Orbitron', monospace;
    font-size: 1.8rem;
    font-weight: 900;
    color: #3a86ff;
    text-shadow: 0 0 20px currentColor;
  }

  .plan-icon {
    font-size: 2.5rem;
    animation: icon-float 3s ease-in-out infinite;
  }

  .price-display {
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .currency {
    font-size: 1.5rem;
    color: #ff006e;
    vertical-align: top;
  }

  .price-number {
    font-family: 'Orbitron', monospace;
    font-size: 3.5rem;
    font-weight: 900;
    background: linear-gradient(45deg, #ff006e, #8338ec);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 30px #ff006e;
  }

  .price-period {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.6);
    vertical-align: bottom;
  }

  .plan-description {
    text-align: center;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 2rem;
    line-height: 1.6;
  }

  .features-list {
    margin-bottom: 2rem;
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 1rem 0;
    color: rgba(255, 255, 255, 0.9);
  }

  .feature-icon {
    color: #ff006e;
    font-size: 1.2rem;
    animation: arrow-pulse 2s ease-in-out infinite;
  }

  .select-button {
    position: relative;
    width: 100%;
    padding: 1.2rem 2rem;
    background: transparent;
    border: 2px solid #8338ec;
    color: #fff;
    font-family: 'Orbitron', monospace;
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .select-button:hover {
    transform: scale(1.05);
    border-color: #ff006e;
    box-shadow: 0 0 30px rgba(255, 0, 110, 0.5);
  }

  .select-button.glowing {
    border-color: #ff006e;
    background: rgba(255, 0, 110, 0.1);
    animation: button-pulse 2s ease-in-out infinite;
  }

  .button-glow {
    position: absolute;
    inset: -2px;
    background: linear-gradient(45deg, #ff006e, #8338ec, #3a86ff);
    opacity: 0;
    filter: blur(10px);
    transition: opacity 0.3s ease;
    z-index: -1;
  }

  .select-button:hover .button-glow {
    opacity: 0.5;
  }

  .button-border {
    position: absolute;
    inset: -2px;
    background: linear-gradient(45deg, #ff006e, #8338ec, #3a86ff);
    z-index: -2;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .select-button:hover .button-border {
    opacity: 1;
    animation: rotate-border 2s linear infinite;
  }

  .card-neon-border {
    position: absolute;
    inset: -1px;
    background: linear-gradient(45deg, #ff006e, #8338ec, #3a86ff);
    opacity: 0;
    z-index: -1;
    transition: opacity 0.3s ease;
  }

  .price-card.featured .card-neon-border {
    opacity: 0.5;
    animation: rotate-border 4s linear infinite;
  }

  /* Comparison Section */
  .comparison-section {
    margin-bottom: 6rem;
  }

  .section-title {
    text-align: center;
    margin-bottom: 3rem;
  }

  .neon-text {
    font-family: 'Orbitron', monospace;
    font-size: 2.5rem;
    font-weight: 900;
    background: linear-gradient(45deg, #ff006e, #8338ec);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 40px #ff006e;
    position: relative;
  }

  .neon-text::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 200px;
    height: 2px;
    background: linear-gradient(90deg, transparent, #ff006e, transparent);
  }

  .comparison-table {
    background: rgba(26, 0, 51, 0.6);
    border: 1px solid rgba(138, 43, 226, 0.5);
    overflow: hidden;
  }

  .table-header {
    display: grid;
    grid-template-columns: 200px repeat(4, 1fr);
    background: rgba(255, 0, 110, 0.1);
    border-bottom: 2px solid rgba(255, 0, 110, 0.3);
  }

  .feature-label,
  .plan-column {
    padding: 1.5rem 1rem;
    font-family: 'Orbitron', monospace;
    font-weight: 700;
    text-align: center;
  }

  .feature-label {
    text-align: left;
    color: #8338ec;
  }

  .plan-column {
    color: #ff006e;
    text-shadow: 0 0 10px currentColor;
  }

  .table-body {
    background: rgba(0, 0, 0, 0.2);
  }

  .table-row {
    display: grid;
    grid-template-columns: 200px repeat(4, 1fr);
    border-bottom: 1px solid rgba(138, 43, 226, 0.2);
    transition: all 0.3s ease;
  }

  .table-row:hover {
    background: rgba(255, 0, 110, 0.05);
    transform: translateX(5px);
  }

  .feature-name {
    padding: 1rem;
    color: rgba(255, 255, 255, 0.9);
  }

  .plan-cell {
    padding: 1rem;
    text-align: center;
    color: rgba(255, 255, 255, 0.8);
  }

  .check-icon {
    color: #3a86ff;
    font-size: 1.5rem;
    text-shadow: 0 0 10px currentColor;
  }

  .cross-icon {
    color: #ff006e;
    font-size: 1.5rem;
    opacity: 0.5;
  }

  .value-text {
    font-family: 'Orbitron', monospace;
    font-weight: 700;
    color: #ffbe0b;
  }

  /* FAQ Section */
  .faq-section {
    margin-bottom: 6rem;
  }

  .faq-grid {
    max-width: 800px;
    margin: 0 auto;
  }

  .faq-item {
    background: rgba(26, 0, 51, 0.6);
    border: 1px solid rgba(138, 43, 226, 0.3);
    margin-bottom: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .faq-item:hover {
    border-color: #ff006e;
    transform: translateX(10px);
  }

  .faq-item.active {
    border-color: #ff006e;
    box-shadow: 0 0 30px rgba(255, 0, 110, 0.2);
  }

  .faq-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
  }

  .faq-question {
    font-size: 1.1rem;
    color: #3a86ff;
  }

  .faq-toggle {
    font-size: 1.5rem;
    color: #ff006e;
    transition: transform 0.3s ease;
  }

  .faq-item.active .faq-toggle {
    transform: rotate(45deg);
  }

  .faq-answer {
    position: relative;
    padding: 0 1.5rem 1.5rem;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.6;
  }

  .answer-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, #ff006e, transparent);
    animation: glow-line 2s ease-in-out infinite;
  }

  /* Benefits Section */
  .benefits-section {
    margin-bottom: 6rem;
  }

  .benefits-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
  }

  .benefit-card {
    position: relative;
    background: rgba(26, 0, 51, 0.6);
    border: 1px solid rgba(138, 43, 226, 0.5);
    padding: 3rem 2rem;
    text-align: center;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .benefit-card:hover {
    transform: translateY(-10px);
    border-color: #ff006e;
    box-shadow: 0 20px 40px rgba(255, 0, 110, 0.3);
  }

  .benefit-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    animation: icon-spin 4s ease-in-out infinite;
  }

  .benefit-title {
    font-family: 'Orbitron', monospace;
    font-size: 1.3rem;
    color: #ff006e;
    margin-bottom: 1rem;
    text-shadow: 0 0 10px currentColor;
  }

  .benefit-desc {
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.6;
  }

  .benefit-pulse {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(138, 43, 226, 0.2), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .benefit-card:hover .benefit-pulse {
    opacity: 1;
    animation: pulse-out 2s ease-out infinite;
  }

  /* Reviews Section */
  .reviews-section {
    margin-bottom: 6rem;
  }

  .reviews-carousel {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
  }

  .review-card {
    background: rgba(26, 0, 51, 0.8);
    border: 1px solid rgba(138, 43, 226, 0.5);
    padding: 2rem;
    transition: all 0.3s ease;
  }

  .review-card:hover {
    transform: scale(1.05);
    border-color: #ff006e;
    box-shadow: 0 20px 40px rgba(255, 0, 110, 0.3);
  }

  .review-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .reviewer-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .reviewer-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid #ff006e;
  }

  .reviewer-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .reviewer-name {
    font-family: 'Orbitron', monospace;
    color: #3a86ff;
    margin-bottom: 0.2rem;
  }

  .reviewer-handle {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .review-rating {
    color: #ffbe0b;
    text-shadow: 0 0 10px currentColor;
  }

  .star {
    font-size: 1.2rem;
  }

  .review-text {
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.6;
    margin-bottom: 1rem;
  }

  .review-date {
    font-size: 0.8rem;
    color: #8338ec;
    text-align: right;
  }

  /* CTA Section */
  .cta-section {
    position: relative;
    padding: 6rem 2rem;
    text-align: center;
    overflow: hidden;
  }

  .cta-content {
    position: relative;
    z-index: 1;
  }

  .cta-title {
    font-family: 'Orbitron', monospace;
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 900;
    background: linear-gradient(45deg, #ff006e, #8338ec, #3a86ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 1rem;
    animation: title-shimmer 3s ease-in-out infinite;
  }

  .cta-subtitle {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 2rem;
  }

  .cta-button {
    position: relative;
    padding: 1.5rem 4rem;
    background: linear-gradient(45deg, #ff006e, #8338ec);
    border: none;
    color: #fff;
    font-family: 'Orbitron', monospace;
    font-size: 1.2rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .cta-button:hover {
    transform: scale(1.1);
    box-shadow: 0 0 50px rgba(255, 0, 110, 0.5);
  }

  .cta-energy {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transform: translateX(-100%);
    animation: energy-sweep 2s linear infinite;
  }

  .cta-decoration {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  .decoration-line {
    position: absolute;
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, transparent, #ff006e, transparent);
  }

  .decoration-line:nth-child(1) {
    top: 20%;
    animation: line-slide 4s ease-in-out infinite;
  }

  .decoration-line:nth-child(2) {
    top: 50%;
    animation: line-slide 4s ease-in-out infinite 1s;
  }

  .decoration-line:nth-child(3) {
    top: 80%;
    animation: line-slide 4s ease-in-out infinite 2s;
  }

  /* Animations */
  @keyframes sun-breathe {
    0%,
    100% {
      transform: translateX(-50%) scale(1);
      filter: blur(1px);
    }
    50% {
      transform: translateX(-50%) scale(1.1);
      filter: blur(2px);
    }
  }

  @keyframes grid-scroll {
    0% {
      transform: perspective(500px) rotateX(70deg) translateY(0);
    }
    100% {
      transform: perspective(500px) rotateX(70deg) translateY(50px);
    }
  }

  @keyframes twinkle {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  @keyframes vhs-lines {
    0% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(10px);
    }
  }

  @keyframes line-pulse {
    0%,
    100% {
      opacity: 0.5;
    }
    50% {
      opacity: 1;
    }
  }

  @keyframes title-glow {
    0%,
    100% {
      filter: brightness(1) drop-shadow(0 0 20px #ff006e);
    }
    50% {
      filter: brightness(1.2) drop-shadow(0 0 40px #ff006e);
    }
  }

  @keyframes subtitle-fade {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes rotate-slow {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes scan-vertical {
    0% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(10px);
    }
  }

  @keyframes icon-float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes arrow-pulse {
    0%,
    100% {
      transform: translateX(0);
    }
    50% {
      transform: translateX(5px);
    }
  }

  @keyframes button-pulse {
    0%,
    100% {
      box-shadow: 0 0 20px rgba(255, 0, 110, 0.5);
    }
    50% {
      box-shadow: 0 0 40px rgba(255, 0, 110, 0.8);
    }
  }

  @keyframes rotate-border {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes glow-line {
    0%,
    100% {
      opacity: 0.5;
    }
    50% {
      opacity: 1;
    }
  }

  @keyframes icon-spin {
    0%,
    100% {
      transform: rotate(0deg) scale(1);
    }
    50% {
      transform: rotate(180deg) scale(1.1);
    }
  }

  @keyframes pulse-out {
    0% {
      transform: translate(-50%, -50%) scale(0);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0;
    }
  }

  @keyframes title-shimmer {
    0%,
    100% {
      filter: brightness(1);
    }
    50% {
      filter: brightness(1.3);
    }
  }

  @keyframes energy-sweep {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  @keyframes line-slide {
    0%,
    100% {
      transform: scaleX(0);
    }
    50% {
      transform: scaleX(1);
    }
  }

  /* FAQ Transition */
  .faq-enter-active,
  .faq-leave-active {
    transition: all 0.3s ease;
  }

  .faq-enter-from {
    opacity: 0;
    transform: translateY(-10px);
  }

  .faq-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .main-title {
      flex-direction: column;
      gap: 1rem;
    }

    .title-line {
      display: none;
    }

    .pricing-grid {
      grid-template-columns: 1fr;
    }

    .table-header,
    .table-row {
      grid-template-columns: 1fr;
      text-align: center;
    }

    .feature-label,
    .feature-name {
      text-align: center;
      padding: 0.5rem;
      border-bottom: 1px solid rgba(138, 43, 226, 0.3);
    }

    .plan-column,
    .plan-cell {
      padding: 0.5rem;
    }

    .reviews-carousel {
      grid-template-columns: 1fr;
    }
  }
</style>
