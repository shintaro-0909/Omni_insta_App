<template>
  <div class="retro-landing">
    <!-- Animated Background -->
    <div class="sunset-bg">
      <div class="sun"></div>
      <div class="grid-perspective"></div>
      <div class="stars"></div>
    </div>

    <!-- Scan Lines Overlay -->
    <div class="scanlines"></div>

    <!-- Hero Section -->
    <section class="hero">
      <div class="neon-container">
        <h1 class="glitch-title" data-text="OMNIY 2084">
          <span class="title-main">OMNIY 2084</span>
          <span class="title-shadow">OMNIY 2084</span>
        </h1>
        <p class="subtitle">
          <span class="neon-text">INSTAGRAM</span>
          <span class="divider">×</span>
          <span class="neon-text">AUTOMATION</span>
          <span class="divider">×</span>
          <span class="neon-text">FUTURE</span>
        </p>

        <div class="cta-group">
          <button class="vhs-button primary">
            <span class="button-glitch">START JOURNEY</span>
            <div class="button-glow"></div>
          </button>
          <button class="vhs-button secondary">
            <span class="button-glitch">VIEW DEMO</span>
            <div class="button-glow"></div>
          </button>
        </div>
      </div>

      <!-- Floating Elements -->
      <div class="floating-shapes">
        <div class="triangle"></div>
        <div class="hexagon"></div>
        <div class="diamond"></div>
      </div>
    </section>

    <!-- Features Grid -->
    <section class="features">
      <div class="feature-grid">
        <div class="feature-card" v-for="feature in features" :key="feature.id">
          <div class="card-glow"></div>
          <div class="card-content">
            <div class="icon-wrapper">
              <div class="icon-hex">{{ feature.icon }}</div>
            </div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.desc }}</p>
          </div>
          <div class="card-border"></div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section class="pricing">
      <h2 class="section-title">
        <span class="title-line"></span>
        <span class="title-text">CHOOSE YOUR DESTINY</span>
        <span class="title-line"></span>
      </h2>

      <div class="pricing-grid">
        <div class="price-card" v-for="plan in plans" :key="plan.name">
          <div class="card-header">
            <h3>{{ plan.name }}</h3>
            <div class="price-display">
              <span class="currency">¥</span>
              <span class="amount">{{ plan.price }}</span>
              <span class="period">/月</span>
            </div>
          </div>
          <div class="card-features">
            <div
              class="feature-item"
              v-for="feature in plan.features"
              :key="feature"
            >
              <span class="feature-icon">▸</span>
              {{ feature }}
            </div>
          </div>
          <button class="select-plan">
            <span>SELECT</span>
            <div class="button-pulse"></div>
          </button>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="retro-footer">
      <div class="footer-content">
        <div class="company-info">
          <h4>OMNIY CORP © 2084</h4>
          <p>BRINGING THE FUTURE TO YOUR FEED</p>
        </div>
        <div class="social-links">
          <a href="#" class="social-link">TWITTER</a>
          <a href="#" class="social-link">DISCORD</a>
          <a href="#" class="social-link">GITHUB</a>
        </div>
      </div>
      <div class="footer-grid"></div>
    </footer>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const features = ref([
    {
      id: 1,
      icon: '⚡',
      title: 'HYPER SCHEDULING',
      desc: 'Post at light speed with our quantum scheduler',
    },
    {
      id: 2,
      icon: '🌆',
      title: 'NEON ANALYTICS',
      desc: 'Track engagement in real-time holographic displays',
    },
    {
      id: 3,
      icon: '🔮',
      title: 'AI PREDICTIONS',
      desc: 'Neural networks optimize your posting times',
    },
    {
      id: 4,
      icon: '🎮',
      title: 'MULTI-ACCOUNT',
      desc: 'Control multiple accounts from one cyberdeck',
    },
  ]);

  const plans = ref([
    {
      name: 'STARTER',
      price: '0',
      features: ['1 Account', '10 Posts/Month', 'Basic Analytics'],
    },
    {
      name: 'NEON',
      price: '980',
      features: [
        '3 Accounts',
        '100 Posts/Month',
        'Advanced Analytics',
        'AI Suggestions',
      ],
    },
    {
      name: 'CYBER',
      price: '2980',
      features: [
        '10 Accounts',
        '1000 Posts/Month',
        'Holographic Dashboard',
        'Neural API',
      ],
    },
    {
      name: 'MATRIX',
      price: '9800',
      features: [
        '∞ Accounts',
        '10000 Posts/Month',
        'Quantum Processing',
        'Time Travel',
      ],
    },
  ]);
</script>

<style scoped>
  /* Import Fonts */
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Exo+2:wght@300;400;700&display=swap');

  /* Base Styles */
  .retro-landing {
    position: relative;
    min-height: 100vh;
    background: #0a0a0f;
    color: #fff;
    font-family: 'Exo 2', sans-serif;
    overflow-x: hidden;
  }

  /* Animated Sunset Background */
  .sunset-bg {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      180deg,
      #0a0a0f 0%,
      #1a0033 20%,
      #330066 40%,
      #ff006e 60%,
      #ff4500 80%,
      #ffbe0b 100%
    );
    z-index: -2;
  }

  .sun {
    position: absolute;
    bottom: 20%;
    left: 50%;
    transform: translateX(-50%);
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, #ffbe0b, #ff4500);
    border-radius: 50%;
    box-shadow:
      0 0 100px #ff4500,
      0 0 200px #ff006e;
    animation: pulse 4s ease-in-out infinite;
  }

  /* Grid Perspective */
  .grid-perspective {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60%;
    background-image:
      linear-gradient(rgba(138, 43, 226, 0.3) 2px, transparent 2px),
      linear-gradient(90deg, rgba(138, 43, 226, 0.3) 2px, transparent 2px);
    background-size: 100px 100px;
    transform: perspective(500px) rotateX(60deg);
    transform-origin: center bottom;
    animation: grid-move 10s linear infinite;
  }

  /* Stars */
  .stars {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 40%;
    background-image:
      radial-gradient(2px 2px at 20px 30px, #fff, transparent),
      radial-gradient(2px 2px at 40px 70px, #fff, transparent),
      radial-gradient(1px 1px at 50px 160px, #fff, transparent),
      radial-gradient(1px 1px at 80px 10px, #fff, transparent);
    background-repeat: repeat;
    background-size: 200px 200px;
    animation: sparkle 5s linear infinite;
  }

  /* Scanlines Effect */
  .scanlines {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0) 0px,
      rgba(0, 0, 0, 0.3) 1px,
      rgba(0, 0, 0, 0) 2px
    );
    pointer-events: none;
    z-index: 10;
    animation: scanlines 8s linear infinite;
  }

  /* Hero Section */
  .hero {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    z-index: 1;
  }

  .neon-container {
    text-align: center;
    z-index: 2;
  }

  /* Glitch Title */
  .glitch-title {
    position: relative;
    font-family: 'Orbitron', monospace;
    font-size: clamp(3rem, 10vw, 8rem);
    font-weight: 900;
    margin: 0;
    letter-spacing: 0.1em;
  }

  .title-main {
    display: block;
    background: linear-gradient(45deg, #ff006e, #8338ec, #3a86ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 40px #ff006e;
    animation: glow 2s ease-in-out infinite alternate;
  }

  .title-shadow {
    position: absolute;
    top: 0;
    left: 0;
    color: #ff006e;
    opacity: 0.8;
    animation: glitch 3s infinite;
    z-index: -1;
  }

  /* Subtitle */
  .subtitle {
    font-size: 1.5rem;
    margin: 2rem 0 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  .neon-text {
    color: #3a86ff;
    text-shadow: 0 0 10px #3a86ff;
    letter-spacing: 0.2em;
  }

  .divider {
    color: #ff006e;
    font-size: 2rem;
  }

  /* VHS Buttons */
  .cta-group {
    display: flex;
    gap: 2rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .vhs-button {
    position: relative;
    padding: 1.2rem 3rem;
    font-family: 'Orbitron', monospace;
    font-size: 1.1rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    background: transparent;
    border: 2px solid #ff006e;
    color: #fff;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .vhs-button.primary {
    border-color: #ff006e;
    box-shadow: 0 0 20px rgba(255, 0, 110, 0.5);
  }

  .vhs-button.secondary {
    border-color: #3a86ff;
    box-shadow: 0 0 20px rgba(58, 134, 255, 0.5);
  }

  .vhs-button:hover {
    transform: scale(1.05);
    box-shadow: 0 0 40px currentColor;
  }

  .button-glow {
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #ff006e, #8338ec, #3a86ff);
    opacity: 0;
    z-index: -1;
    transition: opacity 0.3s ease;
    filter: blur(10px);
  }

  .vhs-button:hover .button-glow {
    opacity: 0.5;
  }

  /* Floating Shapes */
  .floating-shapes {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
  }

  .triangle,
  .hexagon,
  .diamond {
    position: absolute;
    border: 2px solid rgba(138, 43, 226, 0.3);
    animation: float 6s ease-in-out infinite;
  }

  .triangle {
    top: 20%;
    left: 10%;
    width: 0;
    height: 0;
    border-left: 50px solid transparent;
    border-right: 50px solid transparent;
    border-bottom: 100px solid rgba(255, 0, 110, 0.2);
    animation-delay: 0s;
  }

  .hexagon {
    top: 60%;
    right: 10%;
    width: 100px;
    height: 60px;
    background: rgba(58, 134, 255, 0.1);
    position: relative;
    animation-delay: 2s;
  }

  .hexagon:before,
  .hexagon:after {
    content: '';
    position: absolute;
    width: 0;
    border-left: 50px solid transparent;
    border-right: 50px solid transparent;
  }

  .hexagon:before {
    bottom: 100%;
    border-bottom: 30px solid rgba(58, 134, 255, 0.1);
  }

  .hexagon:after {
    top: 100%;
    border-top: 30px solid rgba(58, 134, 255, 0.1);
  }

  .diamond {
    top: 40%;
    right: 20%;
    width: 80px;
    height: 80px;
    background: rgba(138, 43, 226, 0.1);
    transform: rotate(45deg);
    animation-delay: 4s;
  }

  /* Features Section */
  .features {
    position: relative;
    padding: 6rem 2rem;
    z-index: 1;
  }

  .feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 3rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .feature-card {
    position: relative;
    background: rgba(26, 0, 51, 0.8);
    border: 1px solid rgba(138, 43, 226, 0.5);
    padding: 3rem 2rem;
    transition: all 0.3s ease;
    overflow: hidden;
  }

  .feature-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(255, 0, 110, 0.3);
  }

  .card-glow {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 0, 110, 0.1), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .feature-card:hover .card-glow {
    opacity: 1;
  }

  .card-content {
    position: relative;
    z-index: 1;
  }

  .icon-wrapper {
    margin-bottom: 1.5rem;
  }

  .icon-hex {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    background: linear-gradient(45deg, #ff006e, #8338ec);
    font-size: 2.5rem;
    clip-path: polygon(
      30% 0%,
      70% 0%,
      100% 30%,
      100% 70%,
      70% 100%,
      30% 100%,
      0% 70%,
      0% 30%
    );
  }

  .feature-card h3 {
    font-family: 'Orbitron', monospace;
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #3a86ff;
    text-shadow: 0 0 10px currentColor;
  }

  .feature-card p {
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.6;
  }

  .card-border {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 2px solid transparent;
    background: linear-gradient(45deg, #ff006e, #8338ec, #3a86ff) border-box;
    -webkit-mask:
      linear-gradient(#fff 0 0) padding-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: destination-out;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .feature-card:hover .card-border {
    opacity: 1;
  }

  /* Pricing Section */
  .pricing {
    position: relative;
    padding: 6rem 2rem;
    z-index: 1;
  }

  .section-title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    margin-bottom: 4rem;
    font-family: 'Orbitron', monospace;
    font-size: 2.5rem;
    font-weight: 900;
  }

  .title-line {
    flex: 1;
    height: 2px;
    background: linear-gradient(90deg, transparent, #ff006e, transparent);
    max-width: 200px;
  }

  .title-text {
    background: linear-gradient(45deg, #ff006e, #8338ec);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 30px #ff006e;
  }

  .pricing-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .price-card {
    position: relative;
    background: linear-gradient(
      135deg,
      rgba(26, 0, 51, 0.9),
      rgba(51, 0, 102, 0.9)
    );
    border: 2px solid rgba(138, 43, 226, 0.5);
    padding: 3rem 2rem;
    text-align: center;
    transition: all 0.3s ease;
    overflow: hidden;
  }

  .price-card::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #ff006e, #8338ec, #3a86ff);
    opacity: 0;
    z-index: -1;
    transition: opacity 0.3s ease;
    filter: blur(5px);
  }

  .price-card:hover {
    transform: translateY(-10px) scale(1.05);
  }

  .price-card:hover::before {
    opacity: 1;
  }

  .card-header h3 {
    font-family: 'Orbitron', monospace;
    font-size: 1.8rem;
    margin-bottom: 1rem;
    color: #3a86ff;
    text-shadow: 0 0 10px currentColor;
  }

  .price-display {
    font-family: 'Orbitron', monospace;
    margin-bottom: 2rem;
  }

  .currency {
    font-size: 1.5rem;
    color: #ff006e;
  }

  .amount {
    font-size: 3rem;
    font-weight: 900;
    background: linear-gradient(45deg, #ff006e, #8338ec);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .period {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .card-features {
    margin-bottom: 2rem;
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 1rem 0;
    color: rgba(255, 255, 255, 0.8);
  }

  .feature-icon {
    color: #ff006e;
    font-size: 1.2rem;
  }

  .select-plan {
    position: relative;
    width: 100%;
    padding: 1rem 2rem;
    font-family: 'Orbitron', monospace;
    font-size: 1.1rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    background: transparent;
    border: 2px solid #ff006e;
    color: #fff;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .select-plan:hover {
    background: rgba(255, 0, 110, 0.1);
    box-shadow: 0 0 30px rgba(255, 0, 110, 0.5);
  }

  .button-pulse {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(255, 0, 110, 0.5), transparent);
    opacity: 0;
    animation: pulse-button 2s ease-out infinite;
  }

  /* Footer */
  .retro-footer {
    position: relative;
    padding: 4rem 2rem 2rem;
    background: linear-gradient(180deg, transparent, rgba(10, 10, 15, 0.9));
    z-index: 1;
  }

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 2rem;
  }

  .company-info h4 {
    font-family: 'Orbitron', monospace;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    background: linear-gradient(45deg, #ff006e, #8338ec);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .company-info p {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
    letter-spacing: 0.1em;
  }

  .social-links {
    display: flex;
    gap: 2rem;
  }

  .social-link {
    font-family: 'Orbitron', monospace;
    color: #3a86ff;
    text-decoration: none;
    font-weight: 700;
    letter-spacing: 0.1em;
    transition: all 0.3s ease;
  }

  .social-link:hover {
    color: #ff006e;
    text-shadow: 0 0 10px currentColor;
  }

  .footer-grid {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100px;
    background-image:
      linear-gradient(rgba(138, 43, 226, 0.2) 1px, transparent 1px),
      linear-gradient(90deg, rgba(138, 43, 226, 0.2) 1px, transparent 1px);
    background-size: 50px 50px;
    opacity: 0.5;
  }

  /* Animations */
  @keyframes pulse {
    0%,
    100% {
      transform: translateX(-50%) scale(1);
    }
    50% {
      transform: translateX(-50%) scale(1.1);
    }
  }

  @keyframes grid-move {
    0% {
      transform: perspective(500px) rotateX(60deg) translateY(0);
    }
    100% {
      transform: perspective(500px) rotateX(60deg) translateY(100px);
    }
  }

  @keyframes sparkle {
    0% {
      opacity: 0.5;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.5;
    }
  }

  @keyframes scanlines {
    0% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(10px);
    }
  }

  @keyframes glow {
    0% {
      filter: brightness(1) drop-shadow(0 0 20px currentColor);
    }
    100% {
      filter: brightness(1.2) drop-shadow(0 0 40px currentColor);
    }
  }

  @keyframes glitch {
    0%,
    100% {
      transform: translate(0);
      opacity: 0.8;
    }
    20% {
      transform: translate(-2px, 2px);
      opacity: 0.5;
    }
    40% {
      transform: translate(-2px, -2px);
      opacity: 0.6;
    }
    60% {
      transform: translate(2px, 2px);
      opacity: 0.4;
    }
    80% {
      transform: translate(2px, -2px);
      opacity: 0.7;
    }
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0) rotate(0deg);
    }
    33% {
      transform: translateY(-20px) rotate(120deg);
    }
    66% {
      transform: translateY(10px) rotate(240deg);
    }
  }

  @keyframes pulse-button {
    0% {
      transform: translate(-50%, -50%) scale(0);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) scale(2);
      opacity: 0;
    }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .glitch-title {
      font-size: clamp(2rem, 8vw, 4rem);
    }

    .subtitle {
      flex-direction: column;
      gap: 0.5rem;
    }

    .cta-group {
      flex-direction: column;
      width: 100%;
      max-width: 300px;
      margin: 0 auto;
    }

    .vhs-button {
      width: 100%;
    }

    .pricing-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
