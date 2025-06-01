<template>
  <div class="modern-landing" ref="landingRef">
    <!-- Ambient Background System -->
    <div class="ambient-bg">
      <div class="neural-network">
        <svg
          class="neural-svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <radialGradient id="nodeGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="rgba(147, 197, 253, 0.8)" />
              <stop offset="100%" stop-color="rgba(147, 197, 253, 0)" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      <div class="particle-field">
        <div
          v-for="i in 20"
          :key="i"
          class="particle"
          :style="getParticleStyle(i)"
        ></div>
      </div>
      <div class="morphing-blobs">
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
        <div class="blob blob-3"></div>
      </div>
    </div>

    <!-- Magnetic Navigation Bar -->
    <nav class="magnetic-nav" :class="{ 'nav-elevated': scrolled }">
      <div class="nav-container">
        <div
          class="nav-brand magnetic-element"
          @mouseenter="magneticHover"
          @mouseleave="magneticLeave"
        >
          <div class="brand-icon">
            <div class="icon-layers">
              <div class="layer layer-1"></div>
              <div class="layer layer-2"></div>
              <div class="layer layer-3"></div>
            </div>
          </div>
          <span class="brand-text">Omniy</span>
        </div>
        <div class="nav-links">
          <a
            href="#features"
            class="nav-link magnetic-element"
            @mouseenter="magneticHover"
            @mouseleave="magneticLeave"
          >
            <span class="link-text">Features</span>
            <div class="link-ripple"></div>
          </a>
          <a
            href="#pricing"
            class="nav-link magnetic-element"
            @mouseenter="magneticHover"
            @mouseleave="magneticLeave"
          >
            <span class="link-text">Pricing</span>
            <div class="link-ripple"></div>
          </a>
          <button
            class="cta-nav-btn magnetic-element"
            @mouseenter="magneticHover"
            @mouseleave="magneticLeave"
            @click="getStarted"
          >
            <span class="btn-content">Get Started</span>
            <div class="btn-glow"></div>
          </button>
        </div>
      </div>
    </nav>

    <!-- Revolutionary Hero Section -->
    <section class="hero-section" ref="heroSection">
      <div class="hero-container">
        <div class="hero-content">
          <!-- Cinematic Title Sequence -->
          <div class="title-sequence">
            <div class="title-line" :class="{ 'animate-in': titleAnimated }">
              <span class="word word-1">Revolutionary</span>
            </div>
            <div class="title-line" :class="{ 'animate-in': titleAnimated }">
              <span class="word word-2 gradient-morph">Instagram</span>
            </div>
            <div class="title-line" :class="{ 'animate-in': titleAnimated }">
              <span class="word word-3">Experience</span>
            </div>
          </div>

          <!-- Cinematic Subtitle -->
          <div
            class="subtitle-container"
            :class="{ 'animate-in': subtitleAnimated }"
          >
            <p class="hero-subtitle">
              Transform your social media presence with
              <span class="highlight-morph">AI-powered scheduling</span>,
              intelligent posting, and performance optimization that generates
              exponential growth.
            </p>
          </div>

          <!-- Interactive Stats Grid -->
          <div class="stats-ecosystem" :class="{ 'animate-in': statsAnimated }">
            <div
              class="stat-node"
              v-for="(stat, index) in heroStats"
              :key="index"
              @mouseenter="statHover(index)"
              @mouseleave="statLeave(index)"
              :class="{ 'stat-active': stat.active }"
            >
              <div class="stat-glow"></div>
              <div class="stat-content">
                <div class="stat-number" ref="statNumbers">
                  {{ stat.number }}
                </div>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
              <div class="stat-connection"></div>
            </div>
          </div>

          <!-- Fluid Action Buttons -->
          <div
            class="action-ecosystem"
            :class="{ 'animate-in': actionsAnimated }"
          >
            <button
              class="fluid-btn primary-fluid"
              @mouseenter="buttonHover"
              @mouseleave="buttonLeave"
              @click="getStarted"
            >
              <div class="btn-bg"></div>
              <div class="btn-content">
                <div class="btn-icon">
                  <svg viewBox="0 0 24 24" class="icon-rocket">
                    <path
                      d="M12 2L2 7v10c0 5.55 3.84 10 9 11 1.16-.22 2-.65 2.74-1.07"
                      stroke="currentColor"
                      fill="none"
                      stroke-width="2"
                    />
                  </svg>
                </div>
                <span class="btn-text">Launch Experience</span>
              </div>
              <div class="btn-ripple"></div>
            </button>

            <button
              class="fluid-btn secondary-fluid"
              @mouseenter="buttonHover"
              @mouseleave="buttonLeave"
              @click="watchDemo"
            >
              <div class="btn-bg"></div>
              <div class="btn-content">
                <div class="btn-icon">
                  <svg viewBox="0 0 24 24" class="icon-play">
                    <polygon
                      points="9,8 16,12 9,16"
                      stroke="currentColor"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <span class="btn-text">Experience Demo</span>
              </div>
              <div class="btn-ripple"></div>
            </button>
          </div>
        </div>

        <!-- 3D Dashboard Preview -->
        <div class="dashboard-3d" :class="{ 'animate-in': dashboardAnimated }">
          <div class="dashboard-container">
            <div class="dashboard-glass">
              <div class="dashboard-header">
                <div class="window-controls">
                  <div class="control control-close"></div>
                  <div class="control control-minimize"></div>
                  <div class="control control-maximize"></div>
                </div>
                <div class="dashboard-title">Omniy Neural Interface</div>
              </div>
              <div class="dashboard-body">
                <div class="metrics-grid">
                  <div
                    class="metric-card"
                    v-for="metric in dashboardMetrics"
                    :key="metric.id"
                  >
                    <div class="metric-value">{{ metric.value }}</div>
                    <div class="metric-label">{{ metric.label }}</div>
                    <div class="metric-sparkline">
                      <svg viewBox="0 0 100 20" class="sparkline">
                        <polyline
                          :points="metric.sparkline"
                          stroke="currentColor"
                          fill="none"
                          stroke-width="1"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Revolutionary Features Ecosystem -->
    <section id="features" class="features-ecosystem-section">
      <div class="ecosystem-container">
        <div class="section-header">
          <h2 class="ecosystem-title">
            <span class="title-segment">Neural</span>
            <span class="title-segment highlight">Capabilities</span>
            <span class="title-segment">Matrix</span>
          </h2>
          <p class="ecosystem-subtitle">
            Revolutionary AI-driven features that redefine social media
            automation
          </p>
        </div>

        <div class="features-grid">
          <div
            v-for="(feature, index) in features"
            :key="index"
            class="feature-node"
            @mouseenter="featureHover(index)"
            @mouseleave="featureLeave(index)"
            :class="{ 'node-active': feature.active }"
          >
            <div class="node-background"></div>
            <div class="node-glow"></div>

            <div class="feature-content">
              <div class="feature-icon-system">
                <div class="icon-container">
                  <div class="icon-core"></div>
                  <div class="icon-rings">
                    <div class="ring ring-1"></div>
                    <div class="ring ring-2"></div>
                    <div class="ring ring-3"></div>
                  </div>
                </div>
              </div>

              <h3 class="feature-title">{{ feature.title }}</h3>
              <p class="feature-description">{{ feature.description }}</p>

              <div class="feature-metrics">
                <div class="metric-badge">{{ feature.metric }}</div>
                <div class="tech-stack">
                  <span
                    v-for="tech in feature.technologies"
                    :key="tech"
                    class="tech-tag"
                  >
                    {{ tech }}
                  </span>
                </div>
              </div>
            </div>

            <div class="node-connections">
              <div class="connection connection-top"></div>
              <div class="connection connection-right"></div>
              <div class="connection connection-bottom"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Revolutionary Pricing Matrix -->
    <section id="pricing" class="pricing-matrix-section">
      <div class="matrix-container">
        <div class="section-header">
          <h2 class="matrix-title">
            <span class="title-segment">Investment</span>
            <span class="title-segment highlight">Levels</span>
          </h2>
          <p class="matrix-subtitle">
            Choose your neural interface access tier
          </p>
        </div>

        <div class="pricing-grid">
          <div
            v-for="(plan, index) in pricingPlans"
            :key="index"
            class="pricing-node"
            :class="{
              'node-featured': plan.featured,
              'node-active': plan.active,
            }"
            @mouseenter="planHover(index)"
            @mouseleave="planLeave(index)"
          >
            <div class="node-aura"></div>
            <div class="node-frame">
              <div v-if="plan.featured" class="featured-indicator">
                <span class="indicator-text">Most Advanced</span>
                <div class="indicator-glow"></div>
              </div>

              <div class="plan-header">
                <h3 class="plan-tier">{{ plan.name }}</h3>
                <div class="plan-pricing">
                  <span class="currency">$</span>
                  <span class="amount">{{ plan.price }}</span>
                  <span class="period">/month</span>
                </div>
              </div>

              <div class="plan-capabilities">
                <div class="capabilities-list">
                  <div
                    v-for="(feature, fIndex) in plan.features"
                    :key="fIndex"
                    class="capability-item"
                  >
                    <div class="capability-icon">
                      <div class="icon-dot"></div>
                    </div>
                    <span class="capability-text">{{ feature }}</span>
                  </div>
                </div>
              </div>

              <div class="plan-action">
                <button
                  class="neural-btn"
                  :class="{ 'primary-neural': plan.featured }"
                  @click="selectPlan(plan)"
                >
                  <span class="btn-matrix"></span>
                  <span class="btn-content">{{ plan.cta }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Quantum Call-to-Action -->
    <section class="quantum-cta-section">
      <div class="quantum-container">
        <div class="quantum-field">
          <div class="field-particles">
            <div
              v-for="i in 15"
              :key="i"
              class="quantum-particle"
              :style="getQuantumParticleStyle(i)"
            ></div>
          </div>

          <div class="cta-content">
            <h2 class="quantum-title">
              <span class="title-line">Ready to Enter</span>
              <span class="title-line highlight">The Neural Matrix?</span>
            </h2>
            <p class="quantum-subtitle">
              Join the revolution of creators who've transcended traditional
              social media limitations
            </p>

            <div class="quantum-actions">
              <button class="quantum-btn primary-quantum" @click="getStarted">
                <div class="btn-quantum-bg"></div>
                <div class="btn-quantum-content">
                  <div class="quantum-icon">
                    <div class="icon-matrix">
                      <div class="matrix-dot"></div>
                      <div class="matrix-rings">
                        <div class="matrix-ring"></div>
                        <div class="matrix-ring"></div>
                      </div>
                    </div>
                  </div>
                  <span class="quantum-text">Initialize Neural Link</span>
                </div>
                <div class="btn-quantum-energy"></div>
              </button>

              <div class="quantum-guarantee">
                <div class="guarantee-icon"></div>
                <span class="guarantee-text"
                  >No credit card required • Instant activation</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, nextTick } from 'vue';

  // Revolutionary reactive state
  const landingRef = ref<HTMLElement | null>(null);
  const heroSection = ref<HTMLElement | null>(null);
  const scrolled = ref(false);
  const titleAnimated = ref(false);
  const subtitleAnimated = ref(false);
  const statsAnimated = ref(false);
  const actionsAnimated = ref(false);
  const dashboardAnimated = ref(false);
  const mousePosition = ref({ x: 0, y: 0 });
  const statNumbers = ref<HTMLElement[]>([]);

  // Revolutionary data structures
  const heroStats = ref([
    { number: '2.5M+', label: 'Neural Connections', active: false },
    { number: '99.97%', label: 'Precision Rate', active: false },
    { number: '847%', label: 'Growth Amplification', active: false },
    { number: '24/7', label: 'Quantum Processing', active: false },
  ]);

  const dashboardMetrics = ref([
    {
      id: 1,
      value: '4.2K',
      label: 'Active Posts',
      sparkline: '0,15 10,8 20,12 30,4 40,9 50,2 60,11 70,6 80,13 90,7 100,10',
    },
    {
      id: 2,
      value: '95.7%',
      label: 'Engagement Rate',
      sparkline: '0,10 15,12 30,8 45,14 60,9 75,13 90,11 100,15',
    },
    {
      id: 3,
      value: '$12.4K',
      label: 'Revenue Impact',
      sparkline: '0,12 20,9 40,15 60,7 80,11 100,14',
    },
  ]);

  const features = ref([
    {
      icon: 'neural-network',
      title: 'Neural AI Orchestration',
      description:
        'Advanced machine learning algorithms that adapt and evolve with your audience behavior patterns.',
      metric: '847% growth acceleration',
      technologies: ['GPT-4', 'Computer Vision', 'Behavioral Analytics'],
      active: false,
    },
    {
      icon: 'quantum-analytics',
      title: 'Quantum Analytics Engine',
      description:
        'Real-time data processing that predicts viral content potential before you post.',
      metric: '99.7% prediction accuracy',
      technologies: [
        'Real-time Processing',
        'Predictive Modeling',
        'Trend Analysis',
      ],
      active: false,
    },
    {
      icon: 'autonomous-optimization',
      title: 'Autonomous Optimization',
      description:
        'Self-improving systems that continuously optimize your content strategy without manual intervention.',
      metric: '95% time reduction',
      technologies: ['Auto-scaling', 'Self-healing', 'Continuous Learning'],
      active: false,
    },
  ]);

  // Pricing plans with enhanced data
  const pricingPlans = ref([
    {
      name: 'Initiate',
      price: 19,
      featured: false,
      active: false,
      cta: 'Begin Neural Link',
      features: [
        '3 Neural Accounts',
        '100 Automated Posts',
        'Basic AI Optimization',
        'Quantum Analytics Core',
        'Standard Support Matrix',
      ],
    },
    {
      name: 'Architect',
      price: 49,
      featured: true,
      active: false,
      cta: 'Activate Full Matrix',
      features: [
        '10 Neural Accounts',
        'Unlimited Automated Posts',
        'Advanced AI Orchestration',
        'Predictive Analytics Engine',
        'Priority Neural Bandwidth',
        'Multi-dimensional Insights',
      ],
    },
    {
      name: 'Quantum',
      price: 149,
      featured: false,
      active: false,
      cta: 'Contact Neural Command',
      features: [
        'Unlimited Neural Networks',
        'Enterprise AI Orchestration',
        'Custom Algorithm Training',
        'Dedicated Neural Architect',
        'Quantum-level Processing',
        'White-label Matrix Access',
      ],
    },
  ]);

  // Revolutionary interaction methods
  const getParticleStyle = (index: number) => {
    const angle = (index / 20) * Math.PI * 2;
    const radius = 40 + Math.random() * 60;
    return {
      left: `${50 + Math.cos(angle) * radius}%`,
      top: `${50 + Math.sin(angle) * radius}%`,
      animationDelay: `${index * 0.1}s`,
      animationDuration: `${3 + Math.random() * 2}s`,
    };
  };

  const magneticHover = (event: MouseEvent) => {
    const element = event.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;

    element.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) scale(1.05)`;
  };

  const magneticLeave = (event: MouseEvent) => {
    const element = event.currentTarget as HTMLElement;
    element.style.transform = 'translate(0px, 0px) scale(1)';
  };

  const statHover = (index: number) => {
    heroStats.value[index].active = true;
    // Trigger ripple effect
    setTimeout(() => {
      heroStats.value.forEach((stat, i) => {
        if (i !== index) stat.active = false;
      });
    }, 100);
  };

  const statLeave = (index: number) => {
    setTimeout(() => {
      heroStats.value[index].active = false;
    }, 300);
  };

  const buttonHover = (event: MouseEvent) => {
    const button = event.currentTarget as HTMLElement;
    const ripple = button.querySelector('.btn-ripple') as HTMLElement;
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.transform = 'scale(1)';
  };

  const buttonLeave = (event: MouseEvent) => {
    const button = event.currentTarget as HTMLElement;
    const ripple = button.querySelector('.btn-ripple') as HTMLElement;
    ripple.style.transform = 'scale(0)';
  };

  const handleScroll = () => {
    scrolled.value = window.scrollY > 50;
  };

  const getStarted = () => {
    console.log('Revolutionary experience started');
  };

  const watchDemo = () => {
    console.log('Demo experience initiated');
  };

  const selectPlan = (plan: any) => {
    console.log('Plan selected:', plan.name);
  };

  // Revolutionary feature interactions
  const featureHover = (index: number) => {
    features.value[index].active = true;
  };

  const featureLeave = (index: number) => {
    features.value[index].active = false;
  };

  // Pricing plan interactions
  const planHover = (index: number) => {
    pricingPlans.value[index].active = true;
  };

  const planLeave = (index: number) => {
    pricingPlans.value[index].active = false;
  };

  // Quantum particle styling
  const getQuantumParticleStyle = (index: number) => {
    const angle = (index / 15) * Math.PI * 2;
    const radius = 30 + Math.random() * 50;
    return {
      left: `${50 + Math.cos(angle) * radius}%`,
      top: `${50 + Math.sin(angle) * radius}%`,
      animationDelay: `${index * 0.2}s`,
      animationDuration: `${4 + Math.random() * 3}s`,
    };
  };

  // Cinematic animation sequence
  const startCinematicSequence = async () => {
    await nextTick();

    // Sequential animation triggers
    setTimeout(() => {
      titleAnimated.value = true;
    }, 300);
    setTimeout(() => {
      subtitleAnimated.value = true;
    }, 800);
    setTimeout(() => {
      statsAnimated.value = true;
    }, 1200);
    setTimeout(() => {
      actionsAnimated.value = true;
    }, 1600);
    setTimeout(() => {
      dashboardAnimated.value = true;
    }, 2000);

    // Animate stat numbers with spring physics
    setTimeout(() => {
      animateStatNumbers();
    }, 1400);
  };

  const animateStatNumbers = () => {
    heroStats.value.forEach((stat, index) => {
      const element = statNumbers.value[index];
      if (element) {
        let current = 0;
        const target = parseFloat(stat.number.replace(/[^0-9.]/g, ''));
        const increment = target / 60;

        const animate = () => {
          current += increment;
          if (current < target) {
            element.textContent = formatStatNumber(current, stat.number);
            requestAnimationFrame(animate);
          } else {
            element.textContent = stat.number;
          }
        };

        setTimeout(() => animate(), index * 200);
      }
    });
  };

  const formatStatNumber = (value: number, original: string) => {
    if (original.includes('%')) {
      return `${Math.round(value)}%`;
    } else if (original.includes('M+')) {
      return `${(value / 1000000).toFixed(1)}M+`;
    } else if (original.includes('K')) {
      return `${(value / 1000).toFixed(1)}K`;
    } else if (original.includes('/')) {
      return original; // Keep 24/7 as is
    }
    return Math.round(value).toString();
  };

  // Mouse tracking for ambient effects
  const trackMouse = (event: MouseEvent) => {
    mousePosition.value = {
      x: (event.clientX / window.innerWidth) * 100,
      y: (event.clientY / window.innerHeight) * 100,
    };
  };

  // Revolutionary lifecycle
  onMounted(() => {
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', trackMouse);

    // Initialize cinematic sequence
    startCinematicSequence();

    // Initialize neural network visualization
    setTimeout(() => {
      initializeNeuralNetwork();
    }, 500);
  });

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('mousemove', trackMouse);
  });

  // Neural network visualization
  const initializeNeuralNetwork = () => {
    const svg = document.querySelector('.neural-svg');
    if (!svg) return;

    // Create animated connections between nodes
    const connections = [
      { x1: 20, y1: 30, x2: 80, y2: 70 },
      { x1: 50, y1: 20, x2: 30, y2: 80 },
      { x1: 70, y1: 40, x2: 40, y2: 60 },
    ];

    connections.forEach((conn, index) => {
      const line = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'line'
      );
      line.setAttribute('x1', conn.x1.toString());
      line.setAttribute('y1', conn.y1.toString());
      line.setAttribute('x2', conn.x2.toString());
      line.setAttribute('y2', conn.y2.toString());
      line.setAttribute('stroke', 'rgba(147, 197, 253, 0.3)');
      line.setAttribute('stroke-width', '0.5');
      line.style.animationDelay = `${index * 0.5}s`;
      line.classList.add('neural-connection');
      svg.appendChild(line);
    });
  };
</script>

<style scoped>
  /* Revolutionary CSS Architecture */
  .modern-landing {
    --primary-hue: 220;
    --secondary-hue: 280;
    --accent-hue: 340;
    --neural-color: hsl(var(--primary-hue), 70%, 60%);
    --quantum-color: hsl(var(--secondary-hue), 80%, 65%);
    --morphic-color: hsl(var(--accent-hue), 75%, 58%);

    min-height: 100vh;
    background:
      radial-gradient(
        circle at 20% 80%,
        hsla(var(--primary-hue), 70%, 60%, 0.1) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 80% 20%,
        hsla(var(--secondary-hue), 80%, 65%, 0.1) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 40% 40%,
        hsla(var(--accent-hue), 75%, 58%, 0.05) 0%,
        transparent 50%
      ),
      linear-gradient(
        135deg,
        #0a0a0a 0%,
        #1a1a2e 25%,
        #16213e 50%,
        #0f3460 75%,
        #0a0a0a 100%
      );
    position: relative;
    overflow-x: hidden;
    font-family:
      'Inter',
      system-ui,
      -apple-system,
      sans-serif;
    color: #ffffff;

    /* Performance optimizations */
    contain: layout style paint;
    will-change: auto;

    /* CSS Custom Properties for dynamic theming */
    background-attachment: fixed;
    background-size: 200% 200%;
    animation: backgroundShift 20s ease infinite;
  }

  @keyframes backgroundShift {
    0%,
    100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }

  /* Ambient Background System */
  .ambient-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  }

  .neural-network {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.3;
  }

  .neural-svg {
    width: 100%;
    height: 100%;
  }

  .neural-connection {
    stroke-dasharray: 5;
    stroke-dashoffset: 5;
    animation: neuralPulse 3s ease-in-out infinite;
  }

  @keyframes neuralPulse {
    0%,
    100% {
      stroke-dashoffset: 5;
      opacity: 0.3;
    }
    50% {
      stroke-dashoffset: 0;
      opacity: 0.8;
    }
  }

  .particle-field {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .particle {
    position: absolute;
    width: 2px;
    height: 2px;
    background: radial-gradient(
      circle,
      var(--neural-color) 0%,
      transparent 70%
    );
    border-radius: 50%;
    animation: particleFloat 4s ease-in-out infinite;
  }

  @keyframes particleFloat {
    0%,
    100% {
      transform: translateY(0px) scale(1);
      opacity: 0.6;
    }
    50% {
      transform: translateY(-20px) scale(1.2);
      opacity: 1;
    }
  }

  .morphing-blobs {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    mix-blend-mode: screen;
    animation: blobMorph 15s ease-in-out infinite;
  }

  .blob-1 {
    width: 400px;
    height: 400px;
    background: linear-gradient(
      45deg,
      var(--neural-color),
      var(--quantum-color)
    );
    top: 10%;
    left: 10%;
    animation-delay: 0s;
  }

  .blob-2 {
    width: 300px;
    height: 300px;
    background: linear-gradient(
      135deg,
      var(--quantum-color),
      var(--morphic-color)
    );
    top: 60%;
    right: 10%;
    animation-delay: -5s;
  }

  .blob-3 {
    width: 350px;
    height: 350px;
    background: linear-gradient(
      225deg,
      var(--morphic-color),
      var(--neural-color)
    );
    bottom: 20%;
    left: 30%;
    animation-delay: -10s;
  }

  @keyframes blobMorph {
    0%,
    100% {
      transform: scale(1) rotate(0deg);
      border-radius: 50%;
    }
    25% {
      transform: scale(1.1) rotate(90deg);
      border-radius: 40% 60% 70% 30%;
    }
    50% {
      transform: scale(0.9) rotate(180deg);
      border-radius: 70% 30% 40% 60%;
    }
    75% {
      transform: scale(1.05) rotate(270deg);
      border-radius: 30% 70% 60% 40%;
    }
  }

  /* Magnetic Navigation System */
  .magnetic-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    padding: 1rem 0;
    background: rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(20px) saturate(180%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .nav-elevated {
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(30px) saturate(200%);
    border-bottom-color: rgba(255, 255, 255, 0.2);
  }

  .nav-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .nav-brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .brand-icon {
    position: relative;
    width: 40px;
    height: 40px;
  }

  .icon-layers {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 12px;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .layer-1 {
    background: linear-gradient(
      135deg,
      var(--neural-color),
      var(--quantum-color)
    );
    transform: translateZ(0);
  }

  .layer-2 {
    background: linear-gradient(
      225deg,
      var(--quantum-color),
      var(--morphic-color)
    );
    transform: translateZ(0) scale(0.8);
    opacity: 0.7;
  }

  .layer-3 {
    background: linear-gradient(
      315deg,
      var(--morphic-color),
      var(--neural-color)
    );
    transform: translateZ(0) scale(0.6);
    opacity: 0.5;
  }

  .nav-brand:hover .layer-1 {
    transform: translateZ(0) rotate(15deg);
  }

  .nav-brand:hover .layer-2 {
    transform: translateZ(0) scale(0.9) rotate(-10deg);
  }

  .nav-brand:hover .layer-3 {
    transform: translateZ(0) scale(0.7) rotate(20deg);
  }

  .brand-text {
    font-size: 1.8rem;
    font-weight: 700;
    background: linear-gradient(135deg, #ffffff, #e2e8f0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .nav-link {
    position: relative;
    color: rgba(255, 255, 255, 0.9);
    text-decoration: none;
    font-weight: 500;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    overflow: hidden;
  }

  .link-text {
    position: relative;
    z-index: 2;
  }

  .link-ripple {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.1);
    transform: scale(0);
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    border-radius: 8px;
  }

  .nav-link:hover {
    color: #ffffff;
  }

  .nav-link:hover .link-ripple {
    transform: scale(1);
  }

  .cta-nav-btn {
    position: relative;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(
      135deg,
      var(--neural-color),
      var(--quantum-color)
    );
    border: none;
    border-radius: 25px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .btn-content {
    position: relative;
    z-index: 2;
  }

  .btn-glow {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.2) 0%,
      transparent 70%
    );
    transform: scale(0);
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .cta-nav-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  }

  .cta-nav-btn:hover .btn-glow {
    transform: scale(1);
  }

  .magnetic-element {
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  /* Revolutionary Hero Section */
  .hero-section {
    min-height: 100vh;
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    padding-top: 100px;
    contain: layout style paint;
  }

  .hero-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: center;
  }

  @media (max-width: 1024px) {
    .hero-container {
      grid-template-columns: 1fr;
      text-align: center;
      gap: 3rem;
    }
  }

  .hero-content {
    position: relative;
    z-index: 2;
  }

  /* Cinematic Title System */
  .title-sequence {
    margin-bottom: 2rem;
  }

  .title-line {
    overflow: hidden;
    margin-bottom: 0.5rem;
  }

  .word {
    display: inline-block;
    font-size: clamp(3rem, 8vw, 6rem);
    font-weight: 800;
    line-height: 0.9;
    transform: translateY(100%);
    transition: transform 1s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .title-line.animate-in .word {
    transform: translateY(0);
  }

  .word-1 {
    color: #ffffff;
    transition-delay: 0.1s;
  }

  .word-2 {
    background: linear-gradient(
      135deg,
      var(--neural-color),
      var(--quantum-color),
      var(--morphic-color)
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    transition-delay: 0.3s;
    background-size: 200% 200%;
    animation: gradientMorph 8s ease infinite;
  }

  @keyframes gradientMorph {
    0%,
    100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }

  .word-3 {
    color: rgba(255, 255, 255, 0.9);
    transition-delay: 0.5s;
  }

  /* Cinematic Subtitle */
  .subtitle-container {
    opacity: 0;
    transform: translateY(30px);
    transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1);
    margin-bottom: 3rem;
  }

  .subtitle-container.animate-in {
    opacity: 1;
    transform: translateY(0);
  }

  .hero-subtitle {
    font-size: clamp(1.1rem, 2.5vw, 1.4rem);
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.8);
    max-width: 600px;
  }

  .highlight-morph {
    background: linear-gradient(
      135deg,
      var(--neural-color),
      var(--quantum-color)
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 600;
  }

  /* Interactive Stats Ecosystem */
  .stats-ecosystem {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    margin-bottom: 3rem;
    opacity: 0;
    transform: translateY(30px);
    transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .stats-ecosystem.animate-in {
    opacity: 1;
    transform: translateY(0);
  }

  .stat-node {
    position: relative;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    overflow: hidden;
  }

  .stat-node::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      var(--neural-color),
      var(--quantum-color)
    );
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 0;
  }

  .stat-node.stat-active::before {
    opacity: 0.1;
  }

  .stat-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100px;
    height: 100px;
    background: radial-gradient(
      circle,
      var(--neural-color) 0%,
      transparent 70%
    );
    transform: translate(-50%, -50%) scale(0);
    transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 1;
  }

  .stat-node.stat-active .stat-glow {
    transform: translate(-50%, -50%) scale(1.5);
  }

  .stat-content {
    position: relative;
    z-index: 2;
  }

  .stat-number {
    font-size: 2.2rem;
    font-weight: 800;
    color: #ffffff;
    margin-bottom: 0.5rem;
    line-height: 1;
  }

  .stat-label {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .stat-connection {
    position: absolute;
    top: 50%;
    right: -0.75rem;
    width: 1.5rem;
    height: 2px;
    background: linear-gradient(90deg, var(--neural-color), transparent);
    transform: translateY(-50%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .stat-node.stat-active .stat-connection {
    opacity: 1;
  }

  /* Fluid Action System */
  .action-ecosystem {
    display: flex;
    gap: 1.5rem;
    justify-content: center;
    flex-wrap: wrap;
    opacity: 0;
    transform: translateY(30px);
    transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .action-ecosystem.animate-in {
    opacity: 1;
    transform: translateY(0);
  }

  .fluid-btn {
    position: relative;
    padding: 1rem 2rem;
    border: none;
    border-radius: 50px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    min-width: 200px;
  }

  .btn-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 1;
  }

  .primary-fluid .btn-bg {
    background: linear-gradient(
      135deg,
      var(--neural-color),
      var(--quantum-color)
    );
  }

  .secondary-fluid .btn-bg {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .btn-content {
    position: relative;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    color: #ffffff;
  }

  .btn-icon {
    width: 20px;
    height: 20px;
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .btn-icon svg {
    width: 100%;
    height: 100%;
  }

  .btn-ripple {
    position: absolute;
    width: 20px;
    height: 20px;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.3) 0%,
      transparent 70%
    );
    border-radius: 50%;
    transform: scale(0);
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 2;
  }

  .fluid-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  }

  .fluid-btn:hover .btn-icon {
    transform: scale(1.1) rotate(5deg);
  }

  .primary-fluid:hover .btn-bg {
    background: linear-gradient(
      135deg,
      var(--quantum-color),
      var(--morphic-color)
    );
  }

  .secondary-fluid:hover .btn-bg {
    background: rgba(255, 255, 255, 0.2);
  }

  /* 3D Dashboard Preview System */
  .dashboard-3d {
    opacity: 0;
    transform: translateY(50px) rotateX(15deg);
    transition: all 1.5s cubic-bezier(0.16, 1, 0.3, 1);
    perspective: 1000px;
  }

  .dashboard-3d.animate-in {
    opacity: 1;
    transform: translateY(0) rotateX(0deg);
  }

  .dashboard-container {
    transform-style: preserve-3d;
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .dashboard-container:hover {
    transform: rotateY(-5deg) rotateX(5deg);
  }

  .dashboard-glass {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    overflow: hidden;
    box-shadow:
      0 25px 50px rgba(0, 0, 0, 0.1),
      0 0 0 1px rgba(255, 255, 255, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    transform: translateZ(0);
  }

  .dashboard-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .window-controls {
    display: flex;
    gap: 0.5rem;
  }

  .control {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    transition: all 0.2s ease;
  }

  .control:hover {
    transform: scale(1.2);
  }

  .control-close {
    background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  }

  .control-minimize {
    background: linear-gradient(135deg, #feca57, #ff9ff3);
  }

  .control-maximize {
    background: linear-gradient(135deg, #48dbfb, #0abde3);
  }

  .dashboard-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    letter-spacing: 0.5px;
  }

  .dashboard-body {
    padding: 1.5rem;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .metric-card {
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    text-align: center;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .metric-card:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }

  .metric-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--neural-color);
    margin-bottom: 0.25rem;
  }

  .metric-label {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .metric-sparkline {
    height: 20px;
  }

  .sparkline {
    width: 100%;
    height: 100%;
    color: var(--neural-color);
  }

  /* Add the remaining CSS for features, pricing, and CTA sections... */
  /* This would continue with all the CSS for the new revolutionary features */

  /* Revolutionary Responsive System */
  @container (max-width: 768px) {
    .hero-container {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .word {
      font-size: clamp(2rem, 12vw, 3.5rem);
    }

    .stats-ecosystem {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .action-ecosystem {
      flex-direction: column;
      align-items: center;
    }

    .fluid-btn {
      width: 100%;
      max-width: 300px;
    }

    .nav-links {
      display: none;
    }

    .metrics-grid {
      grid-template-columns: 1fr;
    }
  }

  @container (max-width: 480px) {
    .nav-container {
      padding: 0 1rem;
    }

    .hero-container {
      padding: 0 1rem;
    }

    .dashboard-3d {
      transform: scale(0.9);
    }
  }

  /* Reduced Motion Support */
  @media (prefers-reduced-motion: reduce) {
    .modern-landing {
      animation: none;
    }

    .particle,
    .blob,
    .neural-connection {
      animation: none;
    }

    .word,
    .subtitle-container,
    .stats-ecosystem,
    .action-ecosystem,
    .dashboard-3d {
      transition: none;
      transform: none;
      opacity: 1;
    }
  }

  /* High Contrast Mode */
  @media (prefers-contrast: high) {
    .modern-landing {
      --neural-color: #00ffff;
      --quantum-color: #ff00ff;
      --morphic-color: #ffff00;
    }

    .nav-link,
    .hero-subtitle,
    .stat-label {
      color: #ffffff;
    }
  }

  /* Print Styles */
  @media print {
    .ambient-bg,
    .magnetic-nav {
      display: none;
    }

    .modern-landing {
      background: white;
      color: black;
    }
  }

  /* Performance Optimizations */
  .modern-landing * {
    /* Enable hardware acceleration for smooth animations */
    transform: translateZ(0);
    backface-visibility: hidden;
    perspective: 1000px;
  }

  /* Focus Management for Accessibility */
  .magnetic-element:focus,
  .fluid-btn:focus,
  .stat-node:focus {
    outline: 2px solid var(--neural-color);
    outline-offset: 2px;
  }

  /* Custom Scrollbar */
  .modern-landing::-webkit-scrollbar {
    width: 8px;
  }

  .modern-landing::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
  }

  .modern-landing::-webkit-scrollbar-thumb {
    background: linear-gradient(
      135deg,
      var(--neural-color),
      var(--quantum-color)
    );
    border-radius: 4px;
  }

  .modern-landing::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(
      135deg,
      var(--quantum-color),
      var(--morphic-color)
    );
  }
</style>
