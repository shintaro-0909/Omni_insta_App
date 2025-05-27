<template>
  <v-container fluid class="pa-0">
    <!-- ヒーローセクション -->
    <section class="hero-section">
      <v-container class="hero-content">
        <v-row align="center" justify="center" class="min-height-100vh">
          <v-col cols="12" md="8" lg="6" class="text-center">
            <!-- ブランドロゴ・アイコン -->
            <div class="hero-icon mb-6">
              <v-avatar size="120" class="brand-avatar mb-4">
                <v-icon size="60" color="white">mdi-instagram</v-icon>
              </v-avatar>
            </div>
            
            <!-- メインタイトル -->
            <h1 class="hero-title gradient-text mb-6">
              Instagram予約投稿を<br>
              <span class="highlight-text">次のレベル</span>へ
            </h1>
            
            <!-- サブタイトル -->
            <p class="hero-subtitle mb-8">
              プロフェッショナルなコンテンツ管理で、<br>
              あなたのInstagramを成長させましょう。<br>
              <strong>定期投稿・ランダム投稿・複数アカウント管理</strong>が簡単に。
            </p>
            
            <!-- CTAボタン -->
            <div class="cta-buttons mb-8">
              <v-btn
                v-if="!authStore.isAuthenticated"
                size="x-large"
                class="cta-primary mr-4 mb-4"
                @click="handleGetStarted"
                elevation="0"
              >
                <v-icon start>mdi-rocket-launch</v-icon>
                無料で始める
              </v-btn>
              
              <v-btn
                v-else
                size="x-large"
                class="cta-primary mr-4 mb-4"
                to="/dashboard"
                elevation="0"
              >
                <v-icon start>mdi-view-dashboard</v-icon>
                ダッシュボードへ
              </v-btn>
              
              <v-btn
                size="large"
                variant="outlined"
                class="cta-secondary mb-4"
                color="primary"
                @click="scrollToFeatures"
              >
                機能を見る
              </v-btn>
            </div>
            
            <!-- 社会的証明 -->
            <div class="social-proof">
              <p class="text-body-2 text-grey-darken-1 mb-2">
                <v-icon size="16" color="success" class="mr-1">mdi-check-circle</v-icon>
                無料プランで今すぐ開始
              </p>
              <p class="text-body-2 text-grey-darken-1">
                <v-icon size="16" color="success" class="mr-1">mdi-shield-check</v-icon>
                Instagram公式API使用で安全
              </p>
            </div>
          </v-col>
        </v-row>
      </v-container>
      
      <!-- 背景装飾 -->
      <div class="hero-decoration">
        <div class="floating-element element-1"></div>
        <div class="floating-element element-2"></div>
        <div class="floating-element element-3"></div>
      </div>
    </section>

    <!-- 機能紹介セクション -->
    <section id="features" class="features-section">
      <v-container class="py-16">
        <v-row>
          <v-col cols="12" class="text-center mb-12">
            <h2 class="section-title gradient-text mb-6">
              なぜOmniyなのか？
            </h2>
            <p class="section-subtitle mb-8">
              Instagram運用を劇的に効率化する、<br>
              プロフェッショナルなツールセット
            </p>
          </v-col>
        </v-row>

        <v-row class="feature-grid">
          <v-col
            v-for="(feature, index) in features"
            :key="feature.title"
            cols="12"
            md="6"
            lg="4"
            class="mb-8"
          >
            <v-card
              class="feature-card h-100"
              :class="`feature-card-${index + 1}`"
              elevation="0"
              border
            >
              <div class="feature-icon-wrapper">
                <div class="feature-icon-bg">
                  <v-icon
                    :icon="feature.icon"
                    size="32"
                    color="white"
                  />
                </div>
              </div>
              
              <v-card-title class="feature-title">
                {{ feature.title }}
              </v-card-title>
              
              <v-card-text class="feature-description">
                {{ feature.description }}
              </v-card-text>
              
              <div class="feature-highlight">
                <v-chip
                  :color="feature.chipColor"
                  size="small"
                  variant="flat"
                  class="feature-chip"
                >
                  {{ feature.benefit }}
                </v-chip>
              </div>
            </v-card>
          </v-col>
        </v-row>
        
        <!-- 統計セクション -->
        <v-row class="stats-section mt-16">
          <v-col cols="12" class="text-center mb-8">
            <h3 class="text-h4 font-weight-bold mb-8">
              数字で見るOmniyの効果
            </h3>
          </v-col>
          
          <v-col
            v-for="stat in stats"
            :key="stat.label"
            cols="12"
            sm="6"
            md="3"
            class="text-center"
          >
            <div class="stat-item">
              <div class="stat-number gradient-text">
                {{ stat.number }}
              </div>
              <div class="stat-label">
                {{ stat.label }}
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- 価格セクション -->
    <section class="pricing-section">
      <v-container class="py-16">
        <v-row>
          <v-col cols="12" class="text-center mb-12">
            <h2 class="section-title gradient-text mb-6">
              シンプルで透明な料金体系
            </h2>
            <p class="section-subtitle mb-8">
              機能制限なし。隠れた費用なし。<br>
              あなたのニーズに合わせて選択できます。
            </p>
          </v-col>
        </v-row>

        <v-row justify="center" class="pricing-grid">
          <v-col
            v-for="(plan, index) in plans"
            :key="plan.name"
            cols="12"
            sm="6"
            md="4"
            class="mb-8"
          >
            <v-card
              class="pricing-card h-100"
              :class="{ 'featured-plan': plan.featured }"
              elevation="0"
              border
            >
              <!-- 人気バッジ -->
              <div v-if="plan.featured" class="popular-badge">
                <v-chip
                  color="orange"
                  size="small"
                  variant="flat"
                >
                  <v-icon start size="16">mdi-star</v-icon>
                  人気No.1
                </v-chip>
              </div>
              
              <v-card-text class="text-center pa-8">
                <!-- プラン名 -->
                <h3 class="plan-name mb-4">
                  {{ plan.name }}
                </h3>
                
                <!-- 価格 -->
                <div class="plan-price mb-6">
                  <span class="price-currency">¥</span>
                  <span class="price-amount">{{ plan.price.toLocaleString() }}</span>
                  <span class="price-period">/月</span>
                </div>
                
                <!-- 機能リスト -->
                <v-list class="feature-list mb-8" bg-color="transparent">
                  <v-list-item
                    v-for="feature in plan.features"
                    :key="feature"
                    class="px-0 py-2"
                  >
                    <template #prepend>
                      <v-icon color="success" size="18">mdi-check-circle</v-icon>
                    </template>
                    <v-list-item-title class="text-body-2">
                      {{ feature }}
                    </v-list-item-title>
                  </v-list-item>
                </v-list>

                <!-- CTAボタン -->
                <v-btn
                  :class="plan.featured ? 'cta-primary' : 'cta-outline'"
                  :variant="plan.featured ? 'flat' : 'outlined'"
                  size="large"
                  block
                  @click="handleSelectPlan(plan)"
                  elevation="0"
                >
                  {{ plan.buttonText }}
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        
        <!-- 保証セクション -->
        <v-row class="guarantee-section mt-12">
          <v-col cols="12" class="text-center">
            <v-card class="guarantee-card pa-6" elevation="0" color="blue-grey-lighten-5">
              <v-icon size="48" color="success" class="mb-4">mdi-shield-check</v-icon>
              <h4 class="text-h6 font-weight-bold mb-2">14日間返金保証</h4>
              <p class="text-body-2 text-grey-darken-1">
                ご満足いただけない場合は、理由を問わず全額返金いたします
              </p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- CTAセクション -->
    <section class="final-cta-section">
      <v-container class="py-16">
        <v-row>
          <v-col cols="12" md="8" offset-md="2" class="text-center">
            <h2 class="cta-title gradient-text mb-6">
              今すぐInstagram運用を<br>
              次のレベルへ
            </h2>
            <p class="cta-subtitle mb-8">
              数千人のクリエイターが既にOmniyで成果を上げています。<br>
              あなたも今日から始めませんか？
            </p>
            <v-btn
              size="x-large"
              class="cta-primary mb-4"
              @click="handleGetStarted"
              elevation="0"
            >
              <v-icon start>mdi-rocket-launch</v-icon>
              無料で始める
            </v-btn>
            <p class="text-body-2 text-grey-darken-1">
              クレジットカード不要 • 5分で設定完了
            </p>
          </v-col>
        </v-row>
      </v-container>
    </section>
  </v-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 機能一覧
const features = [
  {
    title: '日時指定予約投稿',
    icon: 'mdi-calendar-clock',
    description: '特定の日時に自動で投稿。ベストタイミングを逃しません。',
    chipColor: 'blue',
    benefit: '時間節約'
  },
  {
    title: '繰り返し投稿',
    icon: 'mdi-repeat',
    description: '曜日と時刻を指定して定期的に投稿。継続的な発信を実現。',
    chipColor: 'green',
    benefit: '継続運用'
  },
  {
    title: 'ランダム投稿',
    icon: 'mdi-shuffle',
    description: 'コンテンツライブラリからランダムに選択。自然な投稿パターン。',
    chipColor: 'purple',
    benefit: '自然な運用'
  },
  {
    title: 'マルチアカウント',
    icon: 'mdi-account-multiple',
    description: '複数のInstagramアカウントを一元管理。効率的な運用。',
    chipColor: 'orange',
    benefit: '一元管理'
  },
  {
    title: '安全な連携',
    icon: 'mdi-shield-check',
    description: 'Instagram公式APIを使用。規約違反のリスクなし。',
    chipColor: 'teal',
    benefit: '安全・安心'
  },
  {
    title: '日本語サポート',
    icon: 'mdi-translate',
    description: '完全日本語対応。直感的で使いやすいインターフェース。',
    chipColor: 'pink',
    benefit: '使いやすさ'
  }
]

// 統計データ
const stats = [
  { number: '5000+', label: 'アクティブユーザー' },
  { number: '99.9%', label: 'アップタイム' },
  { number: '24/7', label: 'サポート体制' },
  { number: '50万+', label: '投稿処理数/月' }
]

// 料金プラン
const plans = [
  {
    name: 'フリー',
    price: 0,
    featured: false,
    buttonText: '無料で始める',
    features: [
      'Instagramアカウント 1個',
      '月間投稿数 10件',
      '基本的な予約投稿',
      'コミュニティサポート'
    ]
  },
  {
    name: 'ベーシック',
    price: 980,
    featured: true,
    buttonText: '14日間無料体験',
    features: [
      'Instagramアカウント 3個',
      '月間投稿数 100件',
      '全ての投稿機能',
      'プロキシ設定',
      'メールサポート'
    ]
  },
  {
    name: 'プロ',
    price: 2980,
    featured: false,
    buttonText: '14日間無料体験',
    features: [
      'Instagramアカウント 10個',
      '月間投稿数 無制限',
      '全ての機能',
      '優先サポート',
      'アナリティクス'
    ]
  }
]

// Methods
const handleGetStarted = () => {
  router.push('/login')
}

const handleSelectPlan = (plan: any) => {
  if (plan.price === 0) {
    router.push('/login')
  } else {
    // 有料プランの場合は認証後に決済ページへ
    if (authStore.isAuthenticated) {
      // TODO: 決済ページへリダイレクト
      console.log('決済ページへ:', plan.name)
    } else {
      router.push('/login')
    }
  }
}

const scrollToFeatures = () => {
  const element = document.getElementById('features')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<style scoped>
/* ===========================================
   モダン2024 SaaSランディングページスタイル
   ========================================== */

/* CSS Variables */
:root {
  --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-instagram: linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%);
  --gradient-text: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --shadow-soft: 0 10px 40px rgba(102, 126, 234, 0.1);
  --shadow-hover: 0 20px 60px rgba(102, 126, 234, 0.15);
  --border-radius: 16px;
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ヒーローセクション */
.hero-section {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  overflow: hidden;
}

.hero-content {
  position: relative;
  z-index: 2;
}

.min-height-100vh {
  min-height: 100vh;
}

.brand-avatar {
  background: var(--gradient-instagram) !important;
  box-shadow: var(--shadow-soft);
  animation: float 6s ease-in-out infinite;
}

.hero-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 2rem;
}

.gradient-text {
  background: var(--gradient-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
}

.highlight-text {
  background: var(--gradient-instagram);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
}

.hero-subtitle {
  font-size: 1.25rem;
  line-height: 1.6;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto;
}

/* CTAボタン */
.cta-primary {
  background: var(--gradient-primary) !important;
  color: white !important;
  border-radius: 50px !important;
  padding: 16px 32px !important;
  font-weight: 600 !important;
  font-size: 1.1rem !important;
  text-transform: none !important;
  box-shadow: var(--shadow-soft) !important;
  transition: var(--transition) !important;
}

.cta-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover) !important;
}

.cta-secondary {
  border-radius: 50px !important;
  padding: 12px 24px !important;
  font-weight: 500 !important;
  text-transform: none !important;
  transition: var(--transition) !important;
}

.cta-outline {
  border-radius: 50px !important;
  padding: 12px 24px !important;
  font-weight: 600 !important;
  text-transform: none !important;
  transition: var(--transition) !important;
  border: 2px solid #667eea !important;
  color: #667eea !important;
}

.cta-outline:hover {
  background: var(--gradient-primary) !important;
  color: white !important;
  transform: translateY(-1px);
}

/* 背景装飾 */
.hero-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

.floating-element {
  position: absolute;
  border-radius: 50%;
  background: rgba(102, 126, 234, 0.1);
  animation: float 8s ease-in-out infinite;
}

.element-1 {
  width: 120px;
  height: 120px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.element-2 {
  width: 80px;
  height: 80px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.element-3 {
  width: 60px;
  height: 60px;
  bottom: 30%;
  left: 20%;
  animation-delay: 4s;
}

/* 機能セクション */
.features-section {
  background: #ffffff;
  position: relative;
}

.section-title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  line-height: 1.2;
}

.section-subtitle {
  font-size: 1.2rem;
  line-height: 1.6;
  color: #64748b;
  max-width: 600px;
  margin: 0 auto;
}

.feature-card {
  background: white;
  border-radius: var(--border-radius) !important;
  padding: 2rem;
  transition: var(--transition);
  border: 1px solid #e2e8f0 !important;
  position: relative;
  overflow: hidden;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-hover);
  border-color: #667eea !important;
}

.feature-icon-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.feature-icon-bg {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-soft);
}

.feature-title {
  font-size: 1.25rem !important;
  font-weight: 600 !important;
  color: #1e293b !important;
  margin-bottom: 1rem !important;
}

.feature-description {
  color: #64748b !important;
  line-height: 1.6 !important;
  margin-bottom: 1.5rem !important;
}

.feature-highlight {
  display: flex;
  justify-content: center;
}

.feature-chip {
  font-weight: 500 !important;
  border-radius: 20px !important;
}

/* 統計セクション */
.stats-section {
  margin-top: 4rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
}

/* 料金セクション */
.pricing-section {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  position: relative;
}

.pricing-card {
  background: white;
  border-radius: var(--border-radius) !important;
  transition: var(--transition);
  border: 1px solid #e2e8f0 !important;
  position: relative;
  overflow: hidden;
}

.pricing-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

.featured-plan {
  border: 2px solid #667eea !important;
  transform: scale(1.05);
  z-index: 2;
}

.popular-badge {
  position: absolute;
  top: -1px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
}

.plan-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
}

.plan-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.25rem;
}

.price-currency {
  font-size: 1.5rem;
  font-weight: 500;
  color: #64748b;
}

.price-amount {
  font-size: 3rem;
  font-weight: 700;
  background: var(--gradient-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
}

.price-period {
  font-size: 1.1rem;
  color: #64748b;
  font-weight: 500;
}

.feature-list {
  text-align: left;
}

.guarantee-card {
  border-radius: var(--border-radius) !important;
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
}

/* 最終CTAセクション */
.final-cta-section {
  background: var(--gradient-primary);
  color: white;
}

.cta-title {
  font-size: clamp(2rem, 4vw, 2.5rem);
  font-weight: 700;
  line-height: 1.2;
  color: white !important;
  background: none !important;
  -webkit-text-fill-color: white !important;
}

.cta-subtitle {
  font-size: 1.2rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  max-width: 600px;
  margin: 0 auto;
}

/* アニメーション */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
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
  
  .featured-plan {
    transform: none;
  }
  
  .pricing-card {
    margin-bottom: 2rem;
  }
}

/* スムーススクロール */
html {
  scroll-behavior: smooth;
}

/* カード共通ホバー効果 */
.v-card {
  transition: var(--transition);
}

.v-card:hover {
  transform: translateY(-4px);
}
</style> 