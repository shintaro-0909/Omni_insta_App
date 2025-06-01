<template>
  <div class="stylish-landing" ref="landingRef">
    <!-- Premium Background Orchestration -->
    <div class="premium-bg">
      <div class="luxury-gradients">
        <div class="gradient-layer layer-1"></div>
        <div class="gradient-layer layer-2"></div>
        <div class="gradient-layer layer-3"></div>
      </div>
      <div class="texture-overlay"></div>
      <div class="parallax-elements">
        <div
          v-for="i in 8"
          :key="i"
          class="parallax-orb"
          :style="getOrbStyle(i)"
        ></div>
      </div>
    </div>

    <!-- Sophisticated Navigation -->
    <nav class="sophisticated-nav" :class="{ 'nav-elevated': scrolled }">
      <div class="nav-container">
        <div class="nav-brand" @click="scrollToTop">
          <div class="brand-emblem">
            <div class="emblem-core">
              <div class="emblem-diamond"></div>
              <div class="emblem-ring"></div>
            </div>
          </div>
          <span class="brand-wordmark">Omniy</span>
        </div>
        <div class="nav-menu">
          <a href="#features" class="nav-item" @click="smoothScroll">
            <span class="item-text">Capabilities</span>
            <div class="item-underline"></div>
          </a>
          <a href="#pricing" class="nav-item" @click="smoothScroll">
            <span class="item-text">Investment</span>
            <div class="item-underline"></div>
          </a>
          <button class="premium-btn nav-cta" @click="getStarted">
            <span class="btn-shimmer"></span>
            <span class="btn-text">Begin Experience</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Luxurious Hero Section -->
    <section class="hero-section" ref="heroSection">
      <div class="hero-container">
        <div class="hero-content">
          <!-- Elegant Typography System -->
          <div class="typography-hierarchy">
            <div class="subtitle-elegant" :class="{ reveal: subtitleRevealed }">
              <span class="subtitle-line">P R E M I U M</span>
              <span class="subtitle-accent">INSTAGRAM EXCELLENCE</span>
            </div>

            <h1 class="hero-headline" :class="{ reveal: headlineRevealed }">
              <span class="headline-word">Orchestrate</span>
              <span class="headline-word highlight">Brilliance</span>
              <span class="headline-word">Effortlessly</span>
            </h1>

            <p
              class="hero-description"
              :class="{ reveal: descriptionRevealed }"
            >
              Where sophisticated automation meets exceptional results.
              <span class="highlight-text">Elevate your social presence</span>
              with our meticulously crafted Instagram management suite.
            </p>
          </div>

          <!-- Premium Metrics Grid -->
          <div class="metrics-collection" :class="{ reveal: metricsRevealed }">
            <div
              v-for="(metric, index) in premiumMetrics"
              :key="index"
              class="metric-item"
              @mouseenter="metricHover(index)"
              @mouseleave="metricLeave(index)"
              :class="{ 'metric-active': metric.active }"
            >
              <div class="metric-glow"></div>
              <div class="metric-value">{{ metric.value }}</div>
              <div class="metric-label">{{ metric.label }}</div>
              <div class="metric-indicator"></div>
            </div>
          </div>

          <!-- Elegant Actions -->
          <div class="actions-suite" :class="{ reveal: actionsRevealed }">
            <button class="primary-luxury" @click="getStarted">
              <div class="luxury-bg"></div>
              <div class="luxury-content">
                <div class="luxury-icon">
                  <svg viewBox="0 0 24 24" class="icon-crown">
                    <path
                      d="M7 8L12 3L17 8L19 6L22 12H2L5 6L7 8Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <span class="luxury-text">Commence Excellence</span>
              </div>
              <div class="luxury-shimmer"></div>
            </button>

            <button class="secondary-luxury" @click="watchDemo">
              <div class="secondary-bg"></div>
              <div class="secondary-content">
                <div class="secondary-icon">
                  <svg viewBox="0 0 24 24" class="icon-diamond">
                    <path
                      d="M12 2L16 8H8L12 2ZM4 8L8 8L6 22L4 8ZM16 8L20 8L18 22L16 8ZM8 8H16L14 22H10L8 8Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <span class="secondary-text">Experience Preview</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Sophisticated Showcase -->
        <div class="showcase-container" :class="{ reveal: showcaseRevealed }">
          <div class="showcase-frame">
            <div class="frame-header">
              <div class="frame-controls">
                <div class="control-dot dot-ruby"></div>
                <div class="control-dot dot-amber"></div>
                <div class="control-dot dot-emerald"></div>
              </div>
              <div class="frame-title">Omniy Orchestration Suite</div>
            </div>
            <div class="frame-content">
              <div class="showcase-grid">
                <div
                  class="showcase-metric"
                  v-for="metric in showcaseMetrics"
                  :key="metric.id"
                >
                  <div class="metric-header">
                    <div class="metric-icon" :class="metric.class"></div>
                    <span class="metric-name">{{ metric.name }}</span>
                  </div>
                  <div class="metric-chart">
                    <div
                      class="chart-bar"
                      :style="{ height: metric.value + '%' }"
                    ></div>
                  </div>
                  <div class="metric-percentage">{{ metric.value }}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Capabilities Exhibition -->
    <section id="features" class="capabilities-section">
      <div class="capabilities-container">
        <div class="section-header">
          <h2 class="section-headline">
            <span class="headline-prefix">E X Q U I S I T E</span>
            <span class="headline-main">Capabilities</span>
          </h2>
          <p class="section-description">
            Meticulously engineered features for the discerning professional
          </p>
        </div>

        <div class="capabilities-grid">
          <div
            v-for="(capability, index) in capabilities"
            :key="index"
            class="capability-card"
            @mouseenter="capabilityHover(index)"
            @mouseleave="capabilityLeave(index)"
            :class="{ 'card-active': capability.active }"
          >
            <div class="card-background"></div>
            <div class="card-border"></div>

            <div class="capability-content">
              <div class="capability-icon-frame">
                <div class="icon-backdrop"></div>
                <div class="capability-icon" :class="capability.iconClass">
                  <div class="icon-element"></div>
                  <div class="icon-accent"></div>
                </div>
              </div>

              <h3 class="capability-title">{{ capability.title }}</h3>
              <p class="capability-description">{{ capability.description }}</p>

              <div class="capability-metrics">
                <div class="capability-stat">
                  <span class="stat-value">{{ capability.metric }}</span>
                  <span class="stat-improvement">{{
                    capability.improvement
                  }}</span>
                </div>
                <div class="capability-tags">
                  <span
                    v-for="tag in capability.tags"
                    :key="tag"
                    class="capability-tag"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Investment Tiers -->
    <section id="pricing" class="investment-section">
      <div class="investment-container">
        <div class="section-header">
          <h2 class="section-headline">
            <span class="headline-prefix">I N V E S T M E N T</span>
            <span class="headline-main">Tiers</span>
          </h2>
          <p class="section-description">
            Curated packages for every level of ambition
          </p>
        </div>

        <div class="investment-grid">
          <div
            v-for="(tier, index) in investmentTiers"
            :key="index"
            class="investment-card"
            :class="{
              'tier-featured': tier.featured,
              'tier-active': tier.active,
            }"
            @mouseenter="tierHover(index)"
            @mouseleave="tierLeave(index)"
          >
            <div class="card-shimmer"></div>
            <div class="card-luxury-bg"></div>

            <div v-if="tier.featured" class="featured-crown">
              <div class="crown-icon">
                <svg viewBox="0 0 24 24">
                  <path
                    d="M7 8L12 3L17 8L19 6L22 12H2L5 6L7 8Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <span class="crown-text">Paramount</span>
            </div>

            <div class="tier-header">
              <h3 class="tier-name">{{ tier.name }}</h3>
              <div class="tier-pricing">
                <span class="pricing-currency">$</span>
                <span class="pricing-amount">{{ tier.price }}</span>
                <span class="pricing-period">/month</span>
              </div>
            </div>

            <div class="tier-offerings">
              <div class="offerings-list">
                <div
                  v-for="(offering, oIndex) in tier.offerings"
                  :key="oIndex"
                  class="offering-item"
                >
                  <div class="offering-marker">
                    <div class="marker-diamond"></div>
                  </div>
                  <span class="offering-text">{{ offering }}</span>
                </div>
              </div>
            </div>

            <div class="tier-action">
              <button
                class="tier-button"
                :class="{ 'button-featured': tier.featured }"
                @click="selectTier(tier)"
              >
                <div class="button-luxury"></div>
                <span class="button-text">{{ tier.cta }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Elite Call-to-Action -->
    <section class="elite-cta-section">
      <div class="elite-container">
        <div class="cta-backdrop">
          <div class="backdrop-texture"></div>
          <div class="backdrop-glow"></div>
        </div>

        <div class="cta-content">
          <h2 class="cta-headline">
            <span class="headline-elegant">Ready to</span>
            <span class="headline-golden">Transcend Excellence?</span>
          </h2>
          <p class="cta-description">
            Join the elite circle of creators who demand nothing but perfection
          </p>

          <div class="cta-actions">
            <button class="ultimate-cta" @click="getStarted">
              <div class="ultimate-bg"></div>
              <div class="ultimate-content">
                <div class="ultimate-icon">
                  <div class="icon-constellation">
                    <div
                      class="constellation-star"
                      v-for="i in 5"
                      :key="i"
                    ></div>
                  </div>
                </div>
                <span class="ultimate-text">Ascend to Excellence</span>
              </div>
              <div class="ultimate-aura"></div>
            </button>

            <div class="cta-assurance">
              <div class="assurance-icon">
                <svg viewBox="0 0 24 24">
                  <path
                    d="M12 2L3 7V12C3 17.55 6.84 22.74 12 23.91C17.16 22.74 21 17.55 21 12V7L12 2Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <span class="assurance-text"
                >No commitment required • Instant access</span
              >
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, nextTick } from 'vue';

  // Sophisticated reactive state
  const landingRef = ref<HTMLElement | null>(null);
  const heroSection = ref<HTMLElement | null>(null);
  const scrolled = ref(false);
  const subtitleRevealed = ref(false);
  const headlineRevealed = ref(false);
  const descriptionRevealed = ref(false);
  const metricsRevealed = ref(false);
  const actionsRevealed = ref(false);
  const showcaseRevealed = ref(false);

  // Premium data structures
  const premiumMetrics = ref([
    { value: '247%', label: 'Revenue Growth', active: false },
    { value: '99.8%', label: 'Precision Rate', active: false },
    { value: '15M+', label: 'Impressions Delivered', active: false },
    { value: '4.9/5', label: 'Satisfaction Rating', active: false },
  ]);

  const showcaseMetrics = ref([
    { id: 1, name: 'Engagement', value: 94, class: 'metric-engagement' },
    { id: 2, name: 'Reach', value: 87, class: 'metric-reach' },
    { id: 3, name: 'Conversion', value: 91, class: 'metric-conversion' },
  ]);

  const capabilities = ref([
    {
      title: 'Precision Orchestration',
      description:
        'Meticulously timed content delivery with sophisticated algorithms that understand your audience at a granular level.',
      metric: '247%',
      improvement: 'Engagement Increase',
      tags: ['AI-Driven', 'Real-time', 'Predictive'],
      iconClass: 'icon-orchestration',
      active: false,
    },
    {
      title: 'Elite Analytics Suite',
      description:
        'Comprehensive performance insights with luxury-grade reporting that reveals every nuance of your content success.',
      metric: '99.8%',
      improvement: 'Accuracy Rating',
      tags: ['Deep Learning', 'Forecasting', 'ROI Analysis'],
      iconClass: 'icon-analytics',
      active: false,
    },
    {
      title: 'Seamless Integration',
      description:
        'Effortless workflow integration that feels natural and intuitive, designed for professionals who value their time.',
      metric: '85%',
      improvement: 'Time Savings',
      tags: ['Workflow', 'Automation', 'Efficiency'],
      iconClass: 'icon-integration',
      active: false,
    },
  ]);

  const investmentTiers = ref([
    {
      name: 'Refined',
      price: 39,
      featured: false,
      active: false,
      cta: 'Begin Refinement',
      offerings: [
        '5 Premium Accounts',
        '500 Scheduled Posts',
        'Essential Analytics',
        'Priority Support',
        'Mobile Excellence',
      ],
    },
    {
      name: 'Distinguished',
      price: 89,
      featured: true,
      active: false,
      cta: 'Embrace Excellence',
      offerings: [
        '15 Premium Accounts',
        'Unlimited Scheduling',
        'Advanced Analytics Suite',
        'White-glove Support',
        'Custom Integrations',
        'Performance Optimization',
      ],
    },
    {
      name: 'Paramount',
      price: 199,
      featured: false,
      active: false,
      cta: 'Contact Concierge',
      offerings: [
        'Unlimited Accounts',
        'Enterprise Features',
        'Dedicated Success Manager',
        'Custom Development',
        'VIP Support Channel',
        'Exclusive Features Access',
      ],
    },
  ]);

  // Sophisticated interaction methods
  const getOrbStyle = (index: number) => {
    const positions = [
      { left: '10%', top: '20%', size: '120px', delay: '0s' },
      { left: '80%', top: '15%', size: '80px', delay: '2s' },
      { left: '70%', top: '70%', size: '100px', delay: '4s' },
      { left: '20%', top: '80%', size: '90px', delay: '1s' },
      { left: '50%', top: '30%', size: '60px', delay: '3s' },
      { left: '85%', top: '50%', size: '70px', delay: '5s' },
      { left: '15%', top: '50%', size: '110px', delay: '6s' },
      { left: '60%', top: '85%', size: '85px', delay: '2.5s' },
    ];

    return {
      left: positions[index - 1]?.left || '50%',
      top: positions[index - 1]?.top || '50%',
      width: positions[index - 1]?.size || '100px',
      height: positions[index - 1]?.size || '100px',
      animationDelay: positions[index - 1]?.delay || '0s',
    };
  };

  const metricHover = (index: number) => {
    premiumMetrics.value[index].active = true;
  };

  const metricLeave = (index: number) => {
    premiumMetrics.value[index].active = false;
  };

  const capabilityHover = (index: number) => {
    capabilities.value[index].active = true;
  };

  const capabilityLeave = (index: number) => {
    capabilities.value[index].active = false;
  };

  const tierHover = (index: number) => {
    investmentTiers.value[index].active = true;
  };

  const tierLeave = (index: number) => {
    investmentTiers.value[index].active = false;
  };

  const handleScroll = () => {
    scrolled.value = window.scrollY > 50;
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const smoothScroll = (event: MouseEvent) => {
    event.preventDefault();
    const target = event.currentTarget as HTMLAnchorElement;
    const href = target.getAttribute('href');
    if (href) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const getStarted = () => {
    console.log('Excellence journey initiated');
  };

  const watchDemo = () => {
    console.log('Premium preview activated');
  };

  const selectTier = (tier: any) => {
    console.log('Investment tier selected:', tier.name);
  };

  // Elegant reveal sequence
  const initiateRevealSequence = async () => {
    await nextTick();

    // Sequential luxury reveals
    setTimeout(() => {
      subtitleRevealed.value = true;
    }, 400);
    setTimeout(() => {
      headlineRevealed.value = true;
    }, 800);
    setTimeout(() => {
      descriptionRevealed.value = true;
    }, 1200);
    setTimeout(() => {
      metricsRevealed.value = true;
    }, 1600);
    setTimeout(() => {
      actionsRevealed.value = true;
    }, 2000);
    setTimeout(() => {
      showcaseRevealed.value = true;
    }, 2400);
  };

  // Sophisticated lifecycle
  onMounted(() => {
    window.addEventListener('scroll', handleScroll);

    // Initialize luxury experience
    initiateRevealSequence();
  });

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
  });
</script>

<style scoped>
  /* Sophisticated CSS Architecture */
  .stylish-landing {
    --luxury-gold: #d4af37;
    --luxury-platinum: #e5e4e2;
    --luxury-charcoal: #1a1a1a;
    --luxury-obsidian: #0a0a0a;
    --luxury-pearl: #f8f8ff;
    --luxury-ruby: #9b111e;
    --luxury-sapphire: #0f52ba;

    min-height: 100vh;
    background: linear-gradient(
      135deg,
      var(--luxury-obsidian) 0%,
      var(--luxury-charcoal) 50%,
      var(--luxury-obsidian) 100%
    );
    color: var(--luxury-platinum);
    font-family: 'Playfair Display', 'Georgia', serif;
    position: relative;
    overflow-x: hidden;

    /* Performance optimization */
    contain: layout style;
    will-change: scroll-position;
  }

  /* Premium Background System */
  .premium-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  }

  .luxury-gradients {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .gradient-layer {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0.4;
    mix-blend-mode: overlay;
  }

  .layer-1 {
    background: radial-gradient(
      ellipse at 20% 30%,
      var(--luxury-gold) 0%,
      transparent 60%
    );
    animation: gradientShift 20s ease-in-out infinite;
  }

  .layer-2 {
    background: radial-gradient(
      ellipse at 80% 70%,
      var(--luxury-sapphire) 0%,
      transparent 50%
    );
    animation: gradientShift 25s ease-in-out infinite reverse;
  }

  .layer-3 {
    background: radial-gradient(
      ellipse at 50% 50%,
      var(--luxury-ruby) 0%,
      transparent 40%
    );
    animation: gradientShift 30s ease-in-out infinite;
    animation-delay: -10s;
  }

  @keyframes gradientShift {
    0%,
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 0.3;
    }
    50% {
      transform: scale(1.2) rotate(180deg);
      opacity: 0.6;
    }
  }

  .texture-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: radial-gradient(
      circle at 1px 1px,
      rgba(212, 175, 55, 0.15) 1px,
      transparent 0
    );
    background-size: 20px 20px;
    opacity: 0.3;
    animation: textureFloat 15s linear infinite;
  }

  @keyframes textureFloat {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(20px, 20px);
    }
  }

  .parallax-elements {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .parallax-orb {
    position: absolute;
    background: radial-gradient(circle, var(--luxury-gold) 0%, transparent 70%);
    border-radius: 50%;
    filter: blur(3px);
    opacity: 0.6;
    animation: orbFloat 8s ease-in-out infinite;
  }

  @keyframes orbFloat {
    0%,
    100% {
      transform: translateY(0px) scale(1);
      opacity: 0.6;
    }
    50% {
      transform: translateY(-30px) scale(1.1);
      opacity: 0.8;
    }
  }

  /* Sophisticated Navigation */
  .sophisticated-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    padding: 1.5rem 0;
    background: rgba(26, 26, 26, 0.1);
    backdrop-filter: blur(30px) saturate(180%);
    border-bottom: 1px solid rgba(212, 175, 55, 0.2);
    transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .nav-elevated {
    background: rgba(26, 26, 26, 0.4);
    backdrop-filter: blur(40px) saturate(200%);
    border-bottom-color: rgba(212, 175, 55, 0.4);
  }

  .nav-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 3rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .nav-brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .brand-emblem {
    position: relative;
    width: 50px;
    height: 50px;
  }

  .emblem-core {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .emblem-diamond {
    width: 20px;
    height: 20px;
    background: linear-gradient(
      45deg,
      var(--luxury-gold),
      var(--luxury-platinum)
    );
    transform: rotate(45deg);
    border-radius: 3px;
    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .emblem-ring {
    position: absolute;
    width: 35px;
    height: 35px;
    border: 2px solid var(--luxury-gold);
    border-radius: 50%;
    opacity: 0.7;
    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .nav-brand:hover .emblem-diamond {
    transform: rotate(45deg) scale(1.2);
    box-shadow: 0 0 20px var(--luxury-gold);
  }

  .nav-brand:hover .emblem-ring {
    transform: scale(1.3);
    opacity: 1;
  }

  .brand-wordmark {
    font-size: 2rem;
    font-weight: 400;
    letter-spacing: 0.1em;
    background: linear-gradient(
      135deg,
      var(--luxury-platinum),
      var(--luxury-gold)
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .nav-menu {
    display: flex;
    align-items: center;
    gap: 3rem;
  }

  .nav-item {
    position: relative;
    color: var(--luxury-platinum);
    text-decoration: none;
    font-size: 1rem;
    font-weight: 300;
    letter-spacing: 0.05em;
    transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
    padding: 0.5rem 0;
  }

  .item-underline {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      var(--luxury-gold),
      var(--luxury-platinum)
    );
    transition: width 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .nav-item:hover {
    color: var(--luxury-gold);
  }

  .nav-item:hover .item-underline {
    width: 100%;
  }

  .premium-btn {
    position: relative;
    padding: 0.8rem 2rem;
    background: linear-gradient(
      135deg,
      var(--luxury-gold),
      var(--luxury-platinum)
    );
    border: none;
    border-radius: 30px;
    color: var(--luxury-charcoal);
    font-weight: 500;
    font-size: 0.95rem;
    letter-spacing: 0.05em;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .btn-shimmer {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transition: left 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .premium-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 35px rgba(212, 175, 55, 0.3);
  }

  .premium-btn:hover .btn-shimmer {
    left: 100%;
  }

  /* Luxurious Hero Section */
  .hero-section {
    min-height: 100vh;
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    padding-top: 120px;
    contain: layout style;
  }

  .hero-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 3rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5rem;
    align-items: center;
  }

  @media (max-width: 1024px) {
    .hero-container {
      grid-template-columns: 1fr;
      text-align: center;
      gap: 4rem;
    }
  }

  .hero-content {
    position: relative;
    z-index: 2;
  }

  /* Elegant Typography System */
  .typography-hierarchy {
    margin-bottom: 4rem;
  }

  .subtitle-elegant {
    opacity: 0;
    transform: translateY(30px);
    transition: all 1.5s cubic-bezier(0.23, 1, 0.32, 1);
    margin-bottom: 1.5rem;
  }

  .subtitle-elegant.reveal {
    opacity: 1;
    transform: translateY(0);
  }

  .subtitle-line {
    display: block;
    font-size: 0.9rem;
    font-weight: 300;
    letter-spacing: 0.3em;
    color: var(--luxury-gold);
    margin-bottom: 0.5rem;
  }

  .subtitle-accent {
    display: block;
    font-size: 1.1rem;
    font-weight: 400;
    letter-spacing: 0.1em;
    color: var(--luxury-platinum);
  }

  .hero-headline {
    opacity: 0;
    transform: translateY(40px);
    transition: all 1.5s cubic-bezier(0.23, 1, 0.32, 1);
    margin-bottom: 2rem;
    line-height: 1.1;
  }

  .hero-headline.reveal {
    opacity: 1;
    transform: translateY(0);
  }

  .headline-word {
    display: block;
    font-size: clamp(3rem, 8vw, 5rem);
    font-weight: 300;
    margin-bottom: 0.2rem;
  }

  .headline-word.highlight {
    background: linear-gradient(
      135deg,
      var(--luxury-gold),
      var(--luxury-platinum)
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 400;
  }

  .hero-description {
    opacity: 0;
    transform: translateY(30px);
    transition: all 1.5s cubic-bezier(0.23, 1, 0.32, 1);
    font-size: 1.25rem;
    line-height: 1.6;
    color: rgba(229, 228, 226, 0.8);
    max-width: 600px;
    margin-bottom: 3rem;
  }

  .hero-description.reveal {
    opacity: 1;
    transform: translateY(0);
  }

  .highlight-text {
    color: var(--luxury-gold);
    font-weight: 400;
  }

  /* Premium Metrics Grid */
  .metrics-collection {
    opacity: 0;
    transform: translateY(30px);
    transition: all 1.5s cubic-bezier(0.23, 1, 0.32, 1);
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
    margin-bottom: 4rem;
  }

  .metrics-collection.reveal {
    opacity: 1;
    transform: translateY(0);
  }

  .metric-item {
    position: relative;
    padding: 2rem;
    background: rgba(26, 26, 26, 0.4);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(212, 175, 55, 0.2);
    border-radius: 15px;
    text-align: center;
    cursor: pointer;
    transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
    overflow: hidden;
  }

  .metric-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 150px;
    height: 150px;
    background: radial-gradient(circle, var(--luxury-gold) 0%, transparent 70%);
    transform: translate(-50%, -50%) scale(0);
    transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
    z-index: 0;
  }

  .metric-item.metric-active .metric-glow {
    transform: translate(-50%, -50%) scale(1);
  }

  .metric-value {
    position: relative;
    z-index: 2;
    font-size: 2.5rem;
    font-weight: 300;
    color: var(--luxury-platinum);
    margin-bottom: 0.5rem;
  }

  .metric-label {
    position: relative;
    z-index: 2;
    font-size: 0.9rem;
    color: rgba(229, 228, 226, 0.7);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .metric-indicator {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(
      90deg,
      var(--luxury-gold),
      var(--luxury-platinum)
    );
    transition: width 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .metric-item.metric-active .metric-indicator {
    width: 100%;
  }

  /* Elegant Actions */
  .actions-suite {
    opacity: 0;
    transform: translateY(30px);
    transition: all 1.5s cubic-bezier(0.23, 1, 0.32, 1);
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
  }

  .actions-suite.reveal {
    opacity: 1;
    transform: translateY(0);
  }

  .primary-luxury {
    position: relative;
    padding: 1.2rem 2.5rem;
    border: none;
    border-radius: 40px;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
    min-width: 200px;
  }

  .luxury-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      var(--luxury-gold),
      var(--luxury-platinum)
    );
    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
    z-index: 1;
  }

  .luxury-content {
    position: relative;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    color: var(--luxury-charcoal);
  }

  .luxury-icon {
    width: 20px;
    height: 20px;
    transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .luxury-text {
    font-size: 1rem;
    font-weight: 500;
    letter-spacing: 0.05em;
  }

  .luxury-shimmer {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent
    );
    transition: left 0.8s cubic-bezier(0.23, 1, 0.32, 1);
    z-index: 2;
  }

  .primary-luxury:hover {
    transform: translateY(-3px);
    box-shadow: 0 20px 40px rgba(212, 175, 55, 0.4);
  }

  .primary-luxury:hover .luxury-icon {
    transform: scale(1.1) rotate(10deg);
  }

  .primary-luxury:hover .luxury-shimmer {
    left: 100%;
  }

  .secondary-luxury {
    position: relative;
    padding: 1.2rem 2.5rem;
    border: 2px solid rgba(212, 175, 55, 0.3);
    border-radius: 40px;
    background: transparent;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
    min-width: 200px;
  }

  .secondary-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(212, 175, 55, 0.1);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
    z-index: 1;
  }

  .secondary-content {
    position: relative;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    color: var(--luxury-platinum);
  }

  .secondary-luxury:hover {
    border-color: var(--luxury-gold);
    transform: translateY(-3px);
  }

  .secondary-luxury:hover .secondary-bg {
    transform: scaleX(1);
  }

  /* Sophisticated Showcase */
  .showcase-container {
    opacity: 0;
    transform: translateY(50px) rotateX(10deg);
    transition: all 2s cubic-bezier(0.23, 1, 0.32, 1);
    perspective: 1000px;
  }

  .showcase-container.reveal {
    opacity: 1;
    transform: translateY(0) rotateX(0deg);
  }

  .showcase-frame {
    background: rgba(26, 26, 26, 0.8);
    backdrop-filter: blur(30px);
    border: 1px solid rgba(212, 175, 55, 0.3);
    border-radius: 20px;
    overflow: hidden;
    box-shadow:
      0 30px 60px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(212, 175, 55, 0.2);
    transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .showcase-frame:hover {
    transform: rotateY(-2deg) rotateX(2deg);
  }

  .frame-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem 2rem;
    background: rgba(212, 175, 55, 0.1);
    border-bottom: 1px solid rgba(212, 175, 55, 0.2);
  }

  .frame-controls {
    display: flex;
    gap: 0.8rem;
  }

  .control-dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    transition: all 0.3s ease;
  }

  .control-dot:hover {
    transform: scale(1.2);
    box-shadow: 0 0 10px currentColor;
  }

  .dot-ruby {
    background: var(--luxury-ruby);
  }
  .dot-amber {
    background: var(--luxury-gold);
  }
  .dot-emerald {
    background: #50c878;
  }

  .frame-title {
    font-size: 1rem;
    font-weight: 400;
    color: var(--luxury-platinum);
    letter-spacing: 0.05em;
  }

  .frame-content {
    padding: 2rem;
  }

  .showcase-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }

  .showcase-metric {
    padding: 1.5rem;
    background: rgba(212, 175, 55, 0.05);
    border: 1px solid rgba(212, 175, 55, 0.2);
    border-radius: 12px;
    text-align: center;
    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .showcase-metric:hover {
    background: rgba(212, 175, 55, 0.1);
    transform: translateY(-3px);
  }

  .metric-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .metric-icon {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: linear-gradient(
      135deg,
      var(--luxury-gold),
      var(--luxury-platinum)
    );
  }

  .metric-name {
    font-size: 0.9rem;
    color: var(--luxury-platinum);
    font-weight: 300;
  }

  .metric-chart {
    height: 60px;
    background: rgba(26, 26, 26, 0.5);
    border-radius: 8px;
    position: relative;
    margin-bottom: 1rem;
    overflow: hidden;
  }

  .chart-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background: linear-gradient(
      to top,
      var(--luxury-gold),
      var(--luxury-platinum)
    );
    transition: height 1.5s cubic-bezier(0.23, 1, 0.32, 1);
    border-radius: 8px 8px 0 0;
  }

  .metric-percentage {
    font-size: 1.5rem;
    font-weight: 300;
    color: var(--luxury-gold);
  }

  /* Continue with capabilities, investment, and CTA sections... */

  /* Revolutionary Responsive System */
  @media (max-width: 768px) {
    .hero-container {
      grid-template-columns: 1fr;
      gap: 3rem;
      padding: 0 2rem;
    }

    .headline-word {
      font-size: clamp(2rem, 10vw, 3.5rem);
    }

    .metrics-collection {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .actions-suite {
      flex-direction: column;
      align-items: center;
    }

    .primary-luxury,
    .secondary-luxury {
      width: 100%;
      max-width: 300px;
    }

    .nav-menu {
      display: none;
    }

    .showcase-grid {
      grid-template-columns: 1fr;
    }
  }

  /* Print Styles */
  @media print {
    .premium-bg,
    .sophisticated-nav {
      display: none;
    }

    .stylish-landing {
      background: white;
      color: black;
    }
  }

  /* Performance Optimizations */
  .stylish-landing * {
    transform: translateZ(0);
    backface-visibility: hidden;
  }

  /* Focus Management */
  .nav-item:focus,
  .primary-luxury:focus,
  .secondary-luxury:focus {
    outline: 2px solid var(--luxury-gold);
    outline-offset: 2px;
  }
</style>
