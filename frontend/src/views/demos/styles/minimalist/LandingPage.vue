<template>
  <div class="minimalist-landing">
    <!-- Navigation -->
    <nav class="navigation">
      <div class="container">
        <div class="nav-content">
          <div class="logo">Omniy</div>
          <div class="nav-links">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#about">About</a>
            <button class="nav-button">Sign In</button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <h1 class="hero-title">
          Schedule Instagram Posts<br />
          With Precision
        </h1>
        <p class="hero-subtitle">
          Automate your social media presence with minimal effort
        </p>
        <div class="hero-actions">
          <button class="primary-button">Start Free Trial</button>
          <button class="secondary-button">Watch Demo</button>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="features" id="features">
      <div class="container">
        <div class="feature-grid">
          <div class="feature">
            <div class="feature-icon">●</div>
            <h3>Schedule Posts</h3>
            <p>Plan your content calendar weeks in advance</p>
          </div>
          <div class="feature">
            <div class="feature-icon">◐</div>
            <h3>Multiple Accounts</h3>
            <p>Manage all your Instagram accounts in one place</p>
          </div>
          <div class="feature">
            <div class="feature-icon">○</div>
            <h3>Analytics</h3>
            <p>Track performance with detailed insights</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing -->
    <section class="pricing" id="pricing">
      <div class="container">
        <h2 class="section-title">Simple Pricing</h2>
        <div class="pricing-grid">
          <div class="pricing-card">
            <div class="plan-name">Free</div>
            <div class="plan-price">$0</div>
            <div class="plan-period">forever</div>
            <ul class="plan-features">
              <li>1 Instagram account</li>
              <li>10 posts per month</li>
              <li>Basic analytics</li>
            </ul>
            <button class="plan-button">Get Started</button>
          </div>
          <div class="pricing-card featured">
            <div class="plan-name">Pro</div>
            <div class="plan-price">$29</div>
            <div class="plan-period">per month</div>
            <ul class="plan-features">
              <li>10 Instagram accounts</li>
              <li>1,000 posts per month</li>
              <li>Advanced analytics</li>
              <li>Priority support</li>
            </ul>
            <button class="plan-button accent">Get Started</button>
          </div>
          <div class="pricing-card">
            <div class="plan-name">Business</div>
            <div class="plan-price">$99</div>
            <div class="plan-period">per month</div>
            <ul class="plan-features">
              <li>Unlimited accounts</li>
              <li>10,000 posts per month</li>
              <li>Custom integrations</li>
              <li>Dedicated support</li>
            </ul>
            <button class="plan-button">Contact Sales</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-brand">Omniy © 2025</div>
          <div class="footer-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
  /* Base */
  .minimalist-landing {
    font-family:
      'Inter',
      -apple-system,
      BlinkMacSystemFont,
      sans-serif;
    color: #000;
    background: #fff;
    line-height: 1.6;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  /* Typography */
  h1,
  h2,
  h3 {
    font-weight: 400;
    line-height: 1.2;
  }

  p {
    color: #666;
  }

  /* Navigation */
  .navigation {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid #e9ecef;
    z-index: 100;
  }

  .nav-content {
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

  .nav-links {
    display: flex;
    align-items: center;
    gap: 3rem;
  }

  .nav-links a {
    color: #666;
    text-decoration: none;
    font-size: 0.95rem;
    transition: color 0.2s ease;
  }

  .nav-links a:hover {
    color: #000;
  }

  .nav-button {
    background: #000;
    color: #fff;
    border: none;
    padding: 0.75rem 2rem;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .nav-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  /* Hero Section */
  .hero {
    padding: 12rem 0 8rem;
    text-align: center;
  }

  .hero-title {
    font-size: 4rem;
    font-weight: 300;
    letter-spacing: -0.03em;
    margin-bottom: 2rem;
  }

  .hero-subtitle {
    font-size: 1.25rem;
    color: #666;
    margin-bottom: 4rem;
  }

  .hero-actions {
    display: flex;
    gap: 1.5rem;
    justify-content: center;
  }

  .primary-button {
    background: #000;
    color: #fff;
    border: none;
    padding: 1rem 3rem;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .primary-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }

  .secondary-button {
    background: transparent;
    color: #000;
    border: 1px solid #e9ecef;
    padding: 1rem 3rem;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .secondary-button:hover {
    border-color: #000;
  }

  /* Features */
  .features {
    padding: 8rem 0;
    border-top: 1px solid #e9ecef;
  }

  .feature-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4rem;
    margin-top: 4rem;
  }

  .feature {
    text-align: center;
  }

  .feature-icon {
    font-size: 3rem;
    margin-bottom: 2rem;
    opacity: 0.8;
  }

  .feature h3 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }

  .feature p {
    font-size: 0.95rem;
    line-height: 1.8;
  }

  /* Pricing */
  .pricing {
    padding: 8rem 0;
    background: #f8f9fa;
  }

  .section-title {
    font-size: 2.5rem;
    text-align: center;
    margin-bottom: 4rem;
    font-weight: 300;
  }

  .pricing-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }

  .pricing-card {
    background: #fff;
    padding: 3rem;
    border: 1px solid #e9ecef;
    transition: all 0.2s ease;
  }

  .pricing-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }

  .pricing-card.featured {
    border-color: #000;
  }

  .plan-name {
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 1rem;
    color: #666;
  }

  .plan-price {
    font-size: 3rem;
    font-weight: 300;
    line-height: 1;
  }

  .plan-period {
    font-size: 0.875rem;
    color: #666;
    margin-bottom: 3rem;
  }

  .plan-features {
    list-style: none;
    padding: 0;
    margin: 0 0 3rem;
  }

  .plan-features li {
    padding: 0.75rem 0;
    border-bottom: 1px solid #f8f9fa;
    font-size: 0.95rem;
  }

  .plan-button {
    width: 100%;
    padding: 1rem;
    background: transparent;
    border: 1px solid #e9ecef;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .plan-button:hover {
    border-color: #000;
    background: #000;
    color: #fff;
  }

  .plan-button.accent {
    background: #000;
    color: #fff;
    border-color: #000;
  }

  .plan-button.accent:hover {
    background: #222;
    border-color: #222;
  }

  /* Footer */
  .footer {
    padding: 4rem 0;
    border-top: 1px solid #e9ecef;
  }

  .footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .footer-brand {
    font-size: 0.875rem;
    color: #666;
  }

  .footer-links {
    display: flex;
    gap: 2rem;
  }

  .footer-links a {
    color: #666;
    text-decoration: none;
    font-size: 0.875rem;
    transition: color 0.2s ease;
  }

  .footer-links a:hover {
    color: #000;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .hero-title {
      font-size: 2.5rem;
    }

    .feature-grid,
    .pricing-grid {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .nav-links {
      gap: 1.5rem;
    }

    .nav-links a:not(.nav-button) {
      display: none;
    }
  }
</style>
