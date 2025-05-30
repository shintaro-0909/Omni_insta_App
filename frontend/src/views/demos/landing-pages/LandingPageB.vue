<template>
  <div class="landing-page-b">
    <!-- Navigation -->
    <nav class="navigation">
      <div class="nav-container">
        <div class="nav-brand">
          <v-img src="/logo-gradient.svg" alt="Omniy" width="120"></v-img>
        </div>
        <div class="nav-links">
          <a href="#features">機能</a>
          <a href="#pricing">料金</a>
          <a href="#contact">お問い合わせ</a>
          <v-btn variant="outlined" color="primary" @click="login">ログイン</v-btn>
        </div>
      </div>
    </nav>

    <!-- Hero Section with Animation -->
    <section class="hero-section-b">
      <div class="hero-background">
        <div class="floating-icons">
          <div class="icon-instagram" v-for="n in 8" :key="n">
            <v-icon size="24" color="white">mdi-instagram</v-icon>
          </div>
        </div>
        <div class="wave-animation">
          <svg viewBox="0 0 1200 320" xmlns="http://www.w3.org/2000/svg">
            <path fill="rgba(255,255,255,0.1)" d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,186.7C672,203,768,181,864,154.7C960,128,1056,96,1152,90.7L1200,85.3L1200,320L1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </div>
      
      <div class="hero-container-b">
        <div class="hero-content-b">
          <div class="hero-badge">
            <v-chip color="success" variant="elevated" size="small">
              <v-icon left size="16">mdi-trending-up</v-icon>
              月間成長率150%
            </v-chip>
          </div>
          
          <h1 class="hero-title-b">
            <span class="title-line">Instagram投稿を</span>
            <span class="title-line highlight-gradient">AIが最適化</span>
            <span class="title-line">して自動配信</span>
          </h1>
          
          <p class="hero-description-b">
            データ駆動型のスマートスケジューリングで、
            <strong>エンゲージメントを平均3倍向上</strong>
          </p>
          
          <div class="hero-cta-b">
            <v-btn 
              class="cta-primary-b" 
              size="x-large"
              @click="startDemo"
            >
              <v-icon left>mdi-play</v-icon>
              インタラクティブデモ
            </v-btn>
            <v-btn 
              class="cta-secondary-b" 
              variant="text" 
              size="large"
              @click="scrollToFeatures"
            >
              詳細を見る
              <v-icon right>mdi-arrow-down</v-icon>
            </v-btn>
          </div>
          
          <div class="social-proof">
            <div class="proof-avatars">
              <v-avatar 
                v-for="n in 5" 
                :key="n" 
                size="40" 
                class="proof-avatar"
              >
                <v-img :src="`/user-${n}.jpg`" :alt="`User ${n}`"></v-img>
              </v-avatar>
              <div class="proof-text">
                <span class="proof-number">1,200+</span>
                <span class="proof-label">満足したユーザー</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="hero-visual-b">
          <div class="dashboard-preview">
            <div class="window-frame">
              <div class="window-header">
                <div class="window-controls">
                  <span class="control close"></span>
                  <span class="control minimize"></span>
                  <span class="control maximize"></span>
                </div>
                <div class="window-title">Omniy Dashboard</div>
              </div>
              <div class="window-content">
                <div class="dashboard-sidebar">
                  <div class="sidebar-item active">
                    <v-icon>mdi-view-dashboard</v-icon>
                    <span>ダッシュボード</span>
                  </div>
                  <div class="sidebar-item">
                    <v-icon>mdi-calendar</v-icon>
                    <span>スケジュール</span>
                  </div>
                  <div class="sidebar-item">
                    <v-icon>mdi-image-multiple</v-icon>
                    <span>コンテンツ</span>
                  </div>
                  <div class="sidebar-item">
                    <v-icon>mdi-chart-line</v-icon>
                    <span>分析</span>
                  </div>
                </div>
                <div class="dashboard-main">
                  <div class="stats-cards">
                    <div class="stat-card">
                      <div class="stat-icon success">
                        <v-icon>mdi-check-circle</v-icon>
                      </div>
                      <div class="stat-info">
                        <span class="stat-value">127</span>
                        <span class="stat-label">投稿完了</span>
                      </div>
                    </div>
                    <div class="stat-card">
                      <div class="stat-icon warning">
                        <v-icon>mdi-clock</v-icon>
                      </div>
                      <div class="stat-info">
                        <span class="stat-value">23</span>
                        <span class="stat-label">予約中</span>
                      </div>
                    </div>
                    <div class="stat-card">
                      <div class="stat-icon info">
                        <v-icon>mdi-heart</v-icon>
                      </div>
                      <div class="stat-info">
                        <span class="stat-value">+300%</span>
                        <span class="stat-label">エンゲージメント</span>
                      </div>
                    </div>
                  </div>
                  <div class="chart-area">
                    <div class="chart-header">
                      <h3>投稿パフォーマンス</h3>
                    </div>
                    <div class="chart-placeholder">
                      <svg viewBox="0 0 400 200" class="performance-chart">
                        <defs>
                          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#667eea;stop-opacity:0.8" />
                            <stop offset="100%" style="stop-color:#667eea;stop-opacity:0.1" />
                          </linearGradient>
                        </defs>
                        <polyline 
                          fill="url(#chartGradient)" 
                          stroke="#667eea" 
                          stroke-width="3"
                          points="0,150 50,120 100,80 150,60 200,40 250,30 300,20 350,10 400,5"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Floating Action Cards -->
          <div class="floating-cards">
            <div class="action-card card-1">
              <v-icon color="success">mdi-check-circle</v-icon>
              <span>投稿完了</span>
            </div>
            <div class="action-card card-2">
              <v-icon color="info">mdi-heart</v-icon>
              <span>+150 いいね</span>
            </div>
            <div class="action-card card-3">
              <v-icon color="warning">mdi-clock</v-icon>
              <span>次回: 18:00</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Interactive Features Section -->
    <section id="features" class="features-section-b">
      <div class="features-container-b">
        <div class="section-header-b">
          <h2 class="section-title-b">なぜOmniyが選ばれるのか</h2>
          <p class="section-subtitle-b">
            最新のAI技術と直感的なUIで、Instagram運用を革新します
          </p>
        </div>
        
        <div class="features-showcase">
          <div class="feature-tabs">
            <div 
              class="feature-tab"
              v-for="(feature, index) in featuresData"
              :key="feature.id"
              :class="{ active: activeFeature === index }"
              @click="activeFeature = index"
            >
              <v-icon :color="feature.color">{{ feature.icon }}</v-icon>
              <span>{{ feature.title }}</span>
            </div>
          </div>
          
          <div class="feature-content">
            <div class="feature-demo">
              <div class="demo-screen">
                <v-img 
                  :src="featuresData[activeFeature].demo" 
                  :alt="featuresData[activeFeature].title"
                  class="demo-image"
                ></v-img>
              </div>
              <div class="demo-info">
                <h3>{{ featuresData[activeFeature].title }}</h3>
                <p>{{ featuresData[activeFeature].description }}</p>
                <div class="demo-stats">
                  <div 
                    class="demo-stat" 
                    v-for="stat in featuresData[activeFeature].stats" 
                    :key="stat.label"
                  >
                    <span class="stat-value-demo">{{ stat.value }}</span>
                    <span class="stat-label-demo">{{ stat.label }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Visual Pricing Section -->
    <section id="pricing" class="pricing-section-b">
      <div class="pricing-background">
        <div class="pricing-pattern"></div>
      </div>
      
      <div class="pricing-container-b">
        <div class="section-header-b">
          <h2 class="section-title-b">投資対効果を最大化</h2>
          <p class="section-subtitle-b">
            月額980円から始めて、時間コストを年間100万円削減
          </p>
        </div>
        
        <div class="pricing-comparison">
          <div class="comparison-before">
            <h3>従来の方法</h3>
            <div class="time-blocks">
              <div class="time-block manual">手動投稿: 2時間/日</div>
              <div class="time-block analysis">分析: 1時間/日</div>
              <div class="time-block planning">企画: 1時間/日</div>
            </div>
            <div class="total-cost">
              <span class="cost-label">年間コスト</span>
              <span class="cost-value negative">¥1,460,000</span>
            </div>
          </div>
          
          <div class="comparison-arrow">
            <v-icon size="48" color="primary">mdi-arrow-right</v-icon>
          </div>
          
          <div class="comparison-after">
            <h3>Omniy利用時</h3>
            <div class="time-blocks">
              <div class="time-block auto">自動投稿: 0分/日</div>
              <div class="time-block ai">AI分析: 5分/日</div>
              <div class="time-block quick">企画: 15分/日</div>
            </div>
            <div class="total-cost">
              <span class="cost-label">年間コスト</span>
              <span class="cost-value positive">¥35,760</span>
            </div>
          </div>
        </div>
        
        <div class="savings-highlight">
          <div class="savings-amount">
            <span class="savings-label">年間削減額</span>
            <span class="savings-value">¥1,424,240</span>
          </div>
          <div class="roi-indicator">
            <span class="roi-label">投資対効果</span>
            <span class="roi-value">3,980%</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Call to Action -->
    <section class="cta-section-b">
      <div class="cta-container-b">
        <div class="cta-visual">
          <div class="success-animation">
            <div class="success-circle">
              <v-icon size="64" color="success">mdi-check-circle</v-icon>
            </div>
            <div class="ripple-effect"></div>
          </div>
        </div>
        
        <div class="cta-content-b">
          <h2 class="cta-title-b">今すぐ始めて、違いを実感</h2>
          <p class="cta-subtitle-b">
            設定わずか5分。今日から時間を取り戻しましょう
          </p>
          
          <div class="cta-features">
            <div class="cta-feature">
              <v-icon color="success">mdi-check</v-icon>
              <span>クレジットカード不要</span>
            </div>
            <div class="cta-feature">
              <v-icon color="success">mdi-check</v-icon>
              <span>7日間無料体験</span>
            </div>
            <div class="cta-feature">
              <v-icon color="success">mdi-check</v-icon>
              <span>いつでもキャンセル可能</span>
            </div>
          </div>
          
          <v-btn 
            class="cta-final" 
            size="x-large"
            @click="startTrial"
          >
            <v-icon left>mdi-rocket-launch</v-icon>
            無料体験を開始
          </v-btn>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activeFeature = ref(0)

const featuresData = ref([
  {
    id: 1,
    icon: 'mdi-brain',
    color: 'primary',
    title: 'AI最適化スケジューリング',
    description: 'フォロワーの行動パターンを分析し、最適な投稿時間を自動提案。エンゲージメント率を最大3倍向上させます。',
    demo: '/demo-ai-scheduling.jpg',
    stats: [
      { value: '+300%', label: 'エンゲージメント向上' },
      { value: '94%', label: '予測精度' }
    ]
  },
  {
    id: 2,
    icon: 'mdi-account-multiple',
    color: 'success',
    title: '複数アカウント一元管理',
    description: '最大10個のInstagramアカウントを1つのダッシュボードで管理。チーム運用も効率化します。',
    demo: '/demo-multi-account.jpg',
    stats: [
      { value: '10', label: 'アカウント管理' },
      { value: '80%', label: '時間短縮' }
    ]
  },
  {
    id: 3,
    icon: 'mdi-chart-timeline-variant',
    color: 'info',
    title: 'リアルタイム分析',
    description: '投稿パフォーマンスをリアルタイムで追跡。データに基づいた戦略的な意思決定をサポートします。',
    demo: '/demo-analytics.jpg',
    stats: [
      { value: '24/7', label: 'リアルタイム監視' },
      { value: '15+', label: '分析指標' }
    ]
  }
])

function login() {
  window.location.href = '/login'
}

function startDemo() {
  // Open interactive demo
  console.log('Start demo')
}

function scrollToFeatures() {
  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
}

function startTrial() {
  window.location.href = '/signup?trial=true'
}
</script>

<style scoped>
.landing-page-b {
  background: #ffffff;
  overflow-x: hidden;
}

/* Navigation */
.navigation {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  z-index: 1000;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-links a {
  text-decoration: none;
  color: #374151;
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-links a:hover {
  color: #667eea;
}

/* Hero Section */
.hero-section-b {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  display: flex;
  align-items: center;
  padding-top: 80px;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.floating-icons {
  position: absolute;
  width: 100%;
  height: 100%;
}

.icon-instagram {
  position: absolute;
  animation: float 6s ease-in-out infinite;
}

.icon-instagram:nth-child(1) { top: 10%; left: 10%; animation-delay: 0s; }
.icon-instagram:nth-child(2) { top: 20%; right: 15%; animation-delay: 1s; }
.icon-instagram:nth-child(3) { top: 50%; left: 5%; animation-delay: 2s; }
.icon-instagram:nth-child(4) { bottom: 30%; right: 10%; animation-delay: 3s; }
.icon-instagram:nth-child(5) { bottom: 10%; left: 20%; animation-delay: 4s; }
.icon-instagram:nth-child(6) { top: 70%; right: 25%; animation-delay: 5s; }
.icon-instagram:nth-child(7) { top: 35%; left: 80%; animation-delay: 2.5s; }
.icon-instagram:nth-child(8) { bottom: 60%; left: 75%; animation-delay: 1.5s; }

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
  50% { transform: translateY(-20px) rotate(180deg); opacity: 0.8; }
}

.wave-animation {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 200px;
}

.wave-animation svg {
  width: 100%;
  height: 100%;
  animation: wave 8s ease-in-out infinite;
}

@keyframes wave {
  0%, 100% { transform: translateX(0%); }
  50% { transform: translateX(-25px); }
}

.hero-container-b {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  position: relative;
  z-index: 1;
}

.hero-content-b {
  color: white;
}

.hero-badge {
  margin-bottom: 24px;
}

.hero-title-b {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 24px;
}

.title-line {
  display: block;
}

.highlight-gradient {
  background: linear-gradient(45deg, #FFD700, #FFA500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description-b {
  font-size: 1.25rem;
  line-height: 1.6;
  margin-bottom: 40px;
  opacity: 0.95;
}

.hero-cta-b {
  display: flex;
  gap: 16px;
  margin-bottom: 48px;
}

.cta-primary-b {
  background: linear-gradient(45deg, #FF6B6B, #FF8E53) !important;
  color: white !important;
  border-radius: 16px !important;
  text-transform: none !important;
  font-weight: 600 !important;
  padding: 0 32px !important;
  box-shadow: 0 8px 32px rgba(255, 107, 107, 0.3) !important;
}

.cta-secondary-b {
  color: white !important;
  text-transform: none !important;
  font-weight: 500 !important;
}

.social-proof {
  margin-top: 40px;
}

.proof-avatars {
  display: flex;
  align-items: center;
  gap: 16px;
}

.proof-avatar {
  border: 3px solid rgba(255, 255, 255, 0.3);
  margin-left: -8px;
}

.proof-avatar:first-child {
  margin-left: 0;
}

.proof-text {
  display: flex;
  flex-direction: column;
  margin-left: 16px;
}

.proof-number {
  font-size: 1.25rem;
  font-weight: 700;
}

.proof-label {
  font-size: 0.875rem;
  opacity: 0.8;
}

/* Dashboard Preview */
.hero-visual-b {
  position: relative;
}

.dashboard-preview {
  transform: perspective(1000px) rotateY(-5deg) rotateX(5deg);
  transition: transform 0.3s ease;
}

.dashboard-preview:hover {
  transform: perspective(1000px) rotateY(0deg) rotateX(0deg);
}

.window-frame {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
}

.window-header {
  background: #f1f5f9;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.window-controls {
  display: flex;
  gap: 8px;
}

.control {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.close { background: #ff5f57; }
.minimize { background: #ffbd2e; }
.maximize { background: #28ca42; }

.window-title {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.window-content {
  display: grid;
  grid-template-columns: 200px 1fr;
  min-height: 400px;
}

.dashboard-sidebar {
  background: #f8fafc;
  padding: 20px 0;
  border-right: 1px solid #e2e8f0;
}

.sidebar-item {
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sidebar-item.active {
  background: #667eea;
  color: white;
}

.sidebar-item:hover:not(.active) {
  background: #e2e8f0;
}

.dashboard-main {
  padding: 24px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.success { background: #dcfce7; color: #16a34a; }
.stat-icon.warning { background: #fef3c7; color: #d97706; }
.stat-icon.info { background: #dbeafe; color: #2563eb; }

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
}

.stat-label {
  font-size: 0.75rem;
  color: #64748b;
}

.chart-area {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
}

.chart-header {
  margin-bottom: 16px;
}

.chart-header h3 {
  font-size: 1rem;
  color: #1e293b;
  margin: 0;
}

.performance-chart {
  width: 100%;
  height: 150px;
}

/* Floating Cards */
.floating-cards {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.action-card {
  position: absolute;
  background: white;
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  animation: cardFloat 4s ease-in-out infinite;
}

.card-1 {
  top: 20%;
  right: -10%;
  animation-delay: 0s;
}

.card-2 {
  bottom: 30%;
  right: -15%;
  animation-delay: 1.5s;
}

.card-3 {
  top: 60%;
  left: -15%;
  animation-delay: 3s;
}

@keyframes cardFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

/* Features Section */
.features-section-b {
  padding: 120px 0;
  background: #f8fafc;
}

.features-container-b {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.section-header-b {
  text-align: center;
  margin-bottom: 80px;
}

.section-title-b {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 16px;
}

.section-subtitle-b {
  font-size: 1.125rem;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto;
}

.features-showcase {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.feature-tabs {
  display: flex;
  margin-bottom: 40px;
  border-bottom: 1px solid #e2e8f0;
}

.feature-tab {
  flex: 1;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.feature-tab.active {
  border-bottom-color: #667eea;
  background: #f8fafc;
}

.feature-tab:hover {
  background: #f1f5f9;
}

.feature-content {
  min-height: 400px;
}

.feature-demo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
}

.demo-screen {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.demo-image {
  width: 100%;
  height: 300px;
}

.demo-info h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
}

.demo-info p {
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 24px;
}

.demo-stats {
  display: flex;
  gap: 32px;
}

.demo-stat {
  text-align: center;
}

.stat-value-demo {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
}

.stat-label-demo {
  font-size: 0.875rem;
  color: #64748b;
}

/* Pricing Section */
.pricing-section-b {
  padding: 120px 0;
  position: relative;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
}

.pricing-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.pricing-pattern {
  background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0);
  background-size: 40px 40px;
  height: 100%;
  animation: patternMove 20s linear infinite;
}

@keyframes patternMove {
  0% { background-position: 0 0; }
  100% { background-position: 40px 40px; }
}

.pricing-container-b {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 24px;
  position: relative;
  z-index: 1;
}

.pricing-comparison {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 40px;
  align-items: center;
  margin: 60px 0;
}

.comparison-before,
.comparison-after {
  background: white;
  padding: 40px;
  border-radius: 16px;
  text-align: center;
}

.comparison-before h3,
.comparison-after h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 24px;
}

.time-blocks {
  margin-bottom: 24px;
}

.time-block {
  padding: 12px 16px;
  margin: 8px 0;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
}

.time-block.manual,
.time-block.analysis,
.time-block.planning {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.time-block.auto,
.time-block.ai,
.time-block.quick {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.total-cost {
  border-top: 2px solid #e5e7eb;
  padding-top: 20px;
}

.cost-label {
  display: block;
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 8px;
}

.cost-value {
  font-size: 2rem;
  font-weight: 700;
}

.cost-value.negative {
  color: #dc2626;
}

.cost-value.positive {
  color: #16a34a;
}

.comparison-arrow {
  color: white;
}

.savings-highlight {
  background: white;
  padding: 40px;
  border-radius: 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  text-align: center;
  margin-top: 40px;
}

.savings-amount,
.roi-indicator {
  padding: 20px;
  border-radius: 12px;
}

.savings-amount {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
}

.roi-indicator {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
}

.savings-label,
.roi-label {
  display: block;
  font-size: 0.875rem;
  color: #374151;
  margin-bottom: 8px;
}

.savings-value,
.roi-value {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1e293b;
}

/* CTA Section */
.cta-section-b {
  padding: 120px 0;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.cta-container-b {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.success-animation {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.success-circle {
  background: white;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 2;
}

.ripple-effect {
  position: absolute;
  width: 200px;
  height: 200px;
  border: 2px solid #4ade80;
  border-radius: 50%;
  animation: ripple 2s infinite;
}

@keyframes ripple {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

.cta-title-b {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 16px;
}

.cta-subtitle-b {
  font-size: 1.125rem;
  color: #64748b;
  margin-bottom: 32px;
}

.cta-features {
  margin-bottom: 32px;
}

.cta-feature {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 8px 0;
  color: #374151;
}

.cta-final {
  background: linear-gradient(45deg, #667eea, #764ba2) !important;
  color: white !important;
  border-radius: 16px !important;
  text-transform: none !important;
  font-weight: 600 !important;
  padding: 0 32px !important;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3) !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  
  .hero-container-b {
    grid-template-columns: 1fr;
    gap: 40px;
    text-align: center;
  }
  
  .hero-title-b {
    font-size: 2.5rem;
  }
  
  .hero-cta-b {
    flex-direction: column;
    align-items: center;
  }
  
  .window-content {
    grid-template-columns: 1fr;
  }
  
  .dashboard-sidebar {
    display: none;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .feature-tabs {
    flex-direction: column;
  }
  
  .feature-demo {
    grid-template-columns: 1fr;
  }
  
  .pricing-comparison {
    grid-template-columns: 1fr;
  }
  
  .comparison-arrow {
    transform: rotate(90deg);
  }
  
  .savings-highlight {
    grid-template-columns: 1fr;
  }
  
  .cta-container-b {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .section-title-b {
    font-size: 2rem;
  }
  
  .cta-title-b {
    font-size: 2rem;
  }
}
</style>