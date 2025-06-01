<template>
  <div class="landing-page-a">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-container">
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="hero-title">
              Instagram投稿を
              <span class="highlight-text">自動化</span>
              して、<br />
              ビジネスを加速させよう
            </h1>
            <p class="hero-subtitle">
              OmniyでInstagramの投稿スケジュールを設定し、
              最適なタイミングで自動投稿。
              あなたの時間を本当に大切なことに使いましょう。
            </p>
            <div class="hero-cta">
              <v-btn
                class="cta-primary"
                size="x-large"
                elevation="0"
                @click="startFree"
              >
                <v-icon left>mdi-rocket-launch</v-icon>
                無料で始める
              </v-btn>
              <v-btn
                class="cta-secondary"
                variant="outlined"
                size="large"
                @click="watchDemo"
              >
                <v-icon left>mdi-play</v-icon>
                デモを見る
              </v-btn>
            </div>
            <div class="hero-stats">
              <div class="stat-item">
                <span class="stat-number">1,000+</span>
                <span class="stat-label">アクティブユーザー</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">50K+</span>
                <span class="stat-label">自動投稿数</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">99.9%</span>
                <span class="stat-label">稼働率</span>
              </div>
            </div>
          </div>
          <div class="hero-visual">
            <div class="phone-mockup">
              <div class="phone-frame">
                <div class="phone-screen">
                  <div class="instagram-post">
                    <div class="post-header">
                      <v-avatar size="32">
                        <v-img src="/demo-avatar.jpg" alt="User Avatar"></v-img>
                      </v-avatar>
                      <div class="post-user">
                        <span class="username">your_business</span>
                        <span class="timestamp">2分前</span>
                      </div>
                    </div>
                    <div class="post-image">
                      <v-img
                        src="/demo-post.jpg"
                        alt="Demo Post"
                        aspect-ratio="1"
                      ></v-img>
                    </div>
                    <div class="post-actions">
                      <v-icon>mdi-heart-outline</v-icon>
                      <v-icon>mdi-chat-outline</v-icon>
                      <v-icon>mdi-send-outline</v-icon>
                    </div>
                    <div class="post-caption">
                      <strong>your_business</strong>
                      新商品のご紹介！✨ #自動投稿 #Omniy
                    </div>
                  </div>
                </div>
              </div>
              <div class="automation-indicator">
                <v-icon color="success">mdi-check-circle</v-icon>
                <span>自動投稿完了</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="features-container">
        <div class="section-header">
          <h2 class="section-title">シンプルで強力な機能</h2>
          <p class="section-subtitle">
            複雑な設定は不要。直感的な操作でInstagram投稿を完全自動化
          </p>
        </div>
        <div class="features-grid">
          <div
            class="feature-card"
            v-for="feature in features"
            :key="feature.id"
          >
            <div class="feature-icon">
              <v-icon :color="feature.color" size="48">{{
                feature.icon
              }}</v-icon>
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="how-it-works-section">
      <div class="how-it-works-container">
        <div class="section-header">
          <h2 class="section-title">たった3ステップで開始</h2>
        </div>
        <div class="steps-timeline">
          <div class="step-item" v-for="(step, index) in steps" :key="step.id">
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-content">
              <h3 class="step-title">{{ step.title }}</h3>
              <p class="step-description">{{ step.description }}</p>
            </div>
            <div class="step-visual">
              <v-img
                :src="step.image"
                :alt="step.title"
                class="step-image"
              ></v-img>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section class="pricing-section">
      <div class="pricing-container">
        <div class="section-header">
          <h2 class="section-title">シンプルな料金体系</h2>
          <p class="section-subtitle">
            必要な分だけ支払い。いつでもプラン変更可能
          </p>
        </div>
        <div class="pricing-grid">
          <div
            class="pricing-card"
            v-for="plan in plans"
            :key="plan.name"
            :class="{ popular: plan.popular }"
          >
            <div class="plan-badge" v-if="plan.popular">人気</div>
            <div class="plan-header">
              <h3 class="plan-name">{{ plan.name }}</h3>
              <div class="plan-price">
                <span class="price-currency">¥</span>
                <span class="price-amount">{{ plan.price }}</span>
                <span class="price-period">/月</span>
              </div>
            </div>
            <div class="plan-features">
              <div
                class="plan-feature"
                v-for="feature in plan.features"
                :key="feature"
              >
                <v-icon color="success" size="16">mdi-check</v-icon>
                <span>{{ feature }}</span>
              </div>
            </div>
            <v-btn
              :variant="plan.popular ? 'flat' : 'outlined'"
              :color="plan.popular ? 'primary' : 'default'"
              block
              size="large"
              class="plan-cta"
              @click="selectPlan(plan)"
            >
              {{ plan.cta }}
            </v-btn>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="final-cta-section">
      <div class="final-cta-container">
        <div class="cta-content">
          <h2 class="cta-title">今すぐInstagram投稿を自動化</h2>
          <p class="cta-subtitle">
            設定はたった5分。今日から時間を有効活用しましょう
          </p>
          <div class="cta-buttons">
            <v-btn
              class="cta-primary"
              size="x-large"
              elevation="0"
              @click="startFree"
            >
              <v-icon left>mdi-rocket-launch</v-icon>
              無料で始める
            </v-btn>
          </div>
          <div class="cta-trust">
            <v-icon color="success">mdi-shield-check</v-icon>
            <span>クレジットカード不要・いつでも停止可能</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const features = ref([
    {
      id: 1,
      icon: 'mdi-clock-outline',
      color: 'primary',
      title: '自動スケジューリング',
      description: '最適な投稿時間を AI が分析し、エンゲージメントを最大化',
    },
    {
      id: 2,
      icon: 'mdi-account-multiple-outline',
      color: 'success',
      title: '複数アカウント管理',
      description: '最大10個のInstagramアカウントを一元管理',
    },
    {
      id: 3,
      icon: 'mdi-calendar-sync',
      color: 'warning',
      title: '繰り返し投稿',
      description: '曜日指定や定期投稿で継続的なコンテンツ配信',
    },
    {
      id: 4,
      icon: 'mdi-chart-line',
      color: 'info',
      title: '詳細分析',
      description: '投稿パフォーマンスの詳細レポートとインサイト',
    },
  ]);

  const steps = ref([
    {
      id: 1,
      title: 'Instagramアカウント連携',
      description: 'ワンクリックで安全にアカウントを接続',
      image: '/step-1.jpg',
    },
    {
      id: 2,
      title: '投稿コンテンツ作成',
      description: '画像とキャプションを準備して投稿を作成',
      image: '/step-2.jpg',
    },
    {
      id: 3,
      title: 'スケジュール設定',
      description: '投稿日時を設定して自動化開始',
      image: '/step-3.jpg',
    },
  ]);

  const plans = ref([
    {
      name: 'Free',
      price: '0',
      features: [
        '1つのInstagramアカウント',
        '月10回の投稿',
        '基本的なスケジューリング',
        'メールサポート',
      ],
      cta: '無料で始める',
      popular: false,
    },
    {
      name: 'Basic',
      price: '980',
      features: [
        '3つのInstagramアカウント',
        '月100回の投稿',
        '高度なスケジューリング',
        '優先サポート',
        '投稿分析レポート',
      ],
      cta: '7日間無料体験',
      popular: true,
    },
    {
      name: 'Pro',
      price: '2,980',
      features: [
        '10個のInstagramアカウント',
        '月1,000回の投稿',
        'AI最適化スケジューリング',
        '24/7サポート',
        '詳細分析ダッシュボード',
        'API アクセス',
      ],
      cta: '7日間無料体験',
      popular: false,
    },
  ]);

  function startFree() {
    // Navigate to signup
    window.location.href = '/signup';
  }

  function watchDemo() {
    // Open demo modal or navigate to demo
    console.log('Watch demo');
  }

  function selectPlan(plan: any) {
    // Navigate to signup with selected plan
    console.log('Selected plan:', plan.name);
  }
</script>

<style scoped>
  .landing-page-a {
    background: #ffffff;
    font-family:
      'Inter',
      -apple-system,
      BlinkMacSystemFont,
      sans-serif;
  }

  /* Hero Section */
  .hero-section {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    position: relative;
    overflow: hidden;
  }

  .hero-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('/hero-pattern.svg') no-repeat center center;
    background-size: cover;
    opacity: 0.1;
  }

  .hero-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    position: relative;
    z-index: 1;
  }

  .hero-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
  }

  .hero-title {
    font-size: 3.5rem;
    font-weight: 700;
    line-height: 1.1;
    color: white;
    margin-bottom: 24px;
  }

  .highlight-text {
    background: linear-gradient(45deg, #ffd700, #ffa500);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-subtitle {
    font-size: 1.25rem;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.6;
    margin-bottom: 40px;
  }

  .hero-cta {
    display: flex;
    gap: 16px;
    margin-bottom: 48px;
  }

  .cta-primary {
    background: linear-gradient(45deg, #ff6b6b, #ff8e53) !important;
    color: white !important;
    border-radius: 12px !important;
    text-transform: none !important;
    font-weight: 600 !important;
    padding: 0 32px !important;
  }

  .cta-secondary {
    border: 2px solid rgba(255, 255, 255, 0.3) !important;
    color: white !important;
    border-radius: 12px !important;
    text-transform: none !important;
    font-weight: 600 !important;
    background: rgba(255, 255, 255, 0.1) !important;
  }

  .hero-stats {
    display: flex;
    gap: 40px;
  }

  .stat-item {
    text-align: center;
  }

  .stat-number {
    display: block;
    font-size: 2rem;
    font-weight: 700;
    color: white;
  }

  .stat-label {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.8);
  }

  /* Phone Mockup */
  .hero-visual {
    display: flex;
    justify-content: center;
    position: relative;
  }

  .phone-mockup {
    position: relative;
  }

  .phone-frame {
    width: 280px;
    height: 560px;
    background: #1a1a1a;
    border-radius: 36px;
    padding: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  .phone-screen {
    width: 100%;
    height: 100%;
    background: white;
    border-radius: 24px;
    overflow: hidden;
    position: relative;
  }

  .instagram-post {
    padding: 16px;
  }

  .post-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  .post-user {
    display: flex;
    flex-direction: column;
  }

  .username {
    font-weight: 600;
    font-size: 0.875rem;
  }

  .timestamp {
    font-size: 0.75rem;
    color: #8e8e8e;
  }

  .post-image {
    margin: 0 -16px 12px -16px;
  }

  .post-actions {
    display: flex;
    gap: 16px;
    margin-bottom: 8px;
  }

  .post-caption {
    font-size: 0.875rem;
    line-height: 1.4;
  }

  .automation-indicator {
    position: absolute;
    top: -20px;
    right: -20px;
    background: white;
    padding: 8px 16px;
    border-radius: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    color: #4caf50;
  }

  /* Features Section */
  .features-section {
    padding: 120px 0;
    background: #f8fafc;
  }

  .features-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }

  .section-header {
    text-align: center;
    margin-bottom: 80px;
  }

  .section-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1a202c;
    margin-bottom: 16px;
  }

  .section-subtitle {
    font-size: 1.125rem;
    color: #64748b;
    max-width: 600px;
    margin: 0 auto;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 40px;
  }

  .feature-card {
    background: white;
    padding: 40px 32px;
    border-radius: 16px;
    text-align: center;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
  }

  .feature-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
  }

  .feature-icon {
    margin-bottom: 24px;
  }

  .feature-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1a202c;
    margin-bottom: 16px;
  }

  .feature-description {
    color: #64748b;
    line-height: 1.6;
  }

  /* How It Works Section */
  .how-it-works-section {
    padding: 120px 0;
  }

  .how-it-works-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }

  .steps-timeline {
    display: flex;
    flex-direction: column;
    gap: 60px;
  }

  .step-item {
    display: grid;
    grid-template-columns: 80px 1fr 1fr;
    gap: 40px;
    align-items: center;
  }

  .step-item:nth-child(even) {
    grid-template-columns: 1fr 1fr 80px;
  }

  .step-item:nth-child(even) .step-content {
    order: 2;
  }

  .step-item:nth-child(even) .step-visual {
    order: 1;
  }

  .step-item:nth-child(even) .step-number {
    order: 3;
  }

  .step-number {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: 700;
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  }

  .step-content {
    padding: 20px 0;
  }

  .step-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1a202c;
    margin-bottom: 12px;
  }

  .step-description {
    color: #64748b;
    font-size: 1.125rem;
    line-height: 1.6;
  }

  .step-visual {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  .step-image {
    width: 100%;
    height: 300px;
  }

  /* Pricing Section */
  .pricing-section {
    padding: 120px 0;
    background: #f8fafc;
  }

  .pricing-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 24px;
  }

  .pricing-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 32px;
    margin-top: 60px;
  }

  .pricing-card {
    background: white;
    border-radius: 16px;
    padding: 40px 32px;
    text-align: center;
    position: relative;
    border: 2px solid transparent;
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
  }

  .pricing-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.1);
  }

  .pricing-card.popular {
    border-color: #667eea;
    box-shadow: 0 8px 40px rgba(102, 126, 234, 0.15);
  }

  .plan-badge {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
    padding: 6px 20px;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .plan-header {
    margin-bottom: 32px;
  }

  .plan-name {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1a202c;
    margin-bottom: 16px;
  }

  .plan-price {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 4px;
  }

  .price-currency {
    font-size: 1.25rem;
    color: #64748b;
  }

  .price-amount {
    font-size: 3rem;
    font-weight: 700;
    color: #1a202c;
  }

  .price-period {
    font-size: 1rem;
    color: #64748b;
  }

  .plan-features {
    margin-bottom: 32px;
    text-align: left;
  }

  .plan-feature {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
    color: #374151;
  }

  .plan-cta {
    border-radius: 12px !important;
    text-transform: none !important;
    font-weight: 600 !important;
  }

  /* Final CTA Section */
  .final-cta-section {
    padding: 120px 0;
    background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
  }

  .final-cta-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 24px;
    text-align: center;
  }

  .cta-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: white;
    margin-bottom: 16px;
  }

  .cta-subtitle {
    font-size: 1.25rem;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 40px;
  }

  .cta-buttons {
    margin-bottom: 24px;
  }

  .cta-trust {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.875rem;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .hero-content {
      grid-template-columns: 1fr;
      gap: 40px;
      text-align: center;
    }

    .hero-title {
      font-size: 2.5rem;
    }

    .hero-cta {
      flex-direction: column;
      align-items: center;
    }

    .hero-stats {
      justify-content: center;
    }

    .phone-frame {
      width: 240px;
      height: 480px;
    }

    .features-grid {
      grid-template-columns: 1fr;
    }

    .step-item {
      grid-template-columns: 1fr;
      text-align: center;
    }

    .step-item:nth-child(even) {
      grid-template-columns: 1fr;
    }

    .step-item:nth-child(even) .step-content,
    .step-item:nth-child(even) .step-visual,
    .step-item:nth-child(even) .step-number {
      order: initial;
    }

    .pricing-grid {
      grid-template-columns: 1fr;
    }

    .section-title {
      font-size: 2rem;
    }

    .cta-title {
      font-size: 2rem;
    }
  }
</style>
