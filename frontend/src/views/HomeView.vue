<template>
  <div class="omniy-landing-page">
    <!-- ナビゲーション -->
    <nav class="omniy-nav">
      <div class="nav-container">
        <div class="logo">Omniy</div>
        <div class="nav-links">
          <a href="#features" class="nav-link">機能</a>
          <a href="#pricing" class="nav-link">料金</a>
          <router-link to="/demo" class="nav-link">デモ体験</router-link>
          <router-link v-if="!authStore.isAuthenticated" to="/login" class="nav-link">ログイン</router-link>
          <router-link v-else to="/dashboard" class="nav-link">ダッシュボード</router-link>
          <router-link 
            :to="authStore.isAuthenticated ? '/dashboard' : '/login'" 
            class="cta-button"
          >
            {{ authStore.isAuthenticated ? 'ダッシュボードへ' : '無料で始める' }}
          </router-link>
        </div>
      </div>
    </nav>

    <!-- ヒーローセクション -->
    <section class="hero">
      <div class="floating-elements">
        <div class="floating-circle circle-1"></div>
        <div class="floating-circle circle-2"></div>
        <div class="floating-circle circle-3"></div>
      </div>

      <div class="hero-container">
        <div class="hero-content">
          <h1>
            Instagram予約投稿を<br>
            <span class="gradient-text">もっとスマートに</span>
          </h1>
          <p class="hero-description">
            AIが最適な投稿時間を提案。繰り返し投稿やランダム投稿で、<br>
            フォロワーとのエンゲージメントを最大化します。
          </p>
          <div class="hero-actions">
            <router-link 
              :to="authStore.isAuthenticated ? '/dashboard' : '/login'" 
              class="cta-button primary"
            >
              {{ authStore.isAuthenticated ? 'ダッシュボードへ' : '14日間無料で試す' }}
            </router-link>
            <router-link to="/demo" class="secondary-button">デモを見る</router-link>
          </div>
          <div class="hero-stats">
            <div class="stat-item">
              <div class="stat-number">10,000+</div>
              <div class="stat-label">アクティブユーザー</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">1M+</div>
              <div class="stat-label">投稿実績</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">99.9%</div>
              <div class="stat-label">稼働率</div>
            </div>
          </div>
        </div>

        <div class="hero-visual">
          <div class="phone-mockup">
            <div class="phone-screen">
              <div class="instagram-header">
                <span class="ig-logo">Instagram</span>
                <span>⚙️</span>
              </div>
              <div class="instagram-post">
                <div class="post-header">
                  <div class="avatar"></div>
                  <div>
                    <div style="font-weight: 600;">your_account</div>
                    <div style="font-size: 0.8rem; color: #999;">東京</div>
                  </div>
                </div>
                <div class="post-image">
                  <div class="scheduled-badge">
                    📅 明日 18:00に投稿予定
                  </div>
                </div>
                <div style="margin-top: 1rem;">
                  <div style="display: flex; gap: 1rem; font-size: 1.5rem;">
                    ❤️ 💬 ✈️
                  </div>
                  <div style="margin-top: 0.5rem; font-size: 0.9rem;">
                    <strong>your_account</strong> 新商品入荷しました✨
                    <div style="color: #667eea; margin-top: 0.25rem;">
                      #fashion #ootd #newarrival
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ソーシャルプルーフ -->
    <section class="social-proof">
      <div class="ticker-wrapper">
        <div class="ticker-item" v-for="activity in realTimeActivities" :key="activity.id">
          <div class="ticker-avatar"></div>
          <span class="ticker-text">{{ activity.text }}</span>
        </div>
        <!-- 繰り返し用 -->
        <div class="ticker-item" v-for="activity in realTimeActivities" :key="`repeat-${activity.id}`">
          <div class="ticker-avatar"></div>
          <span class="ticker-text">{{ activity.text }}</span>
        </div>
      </div>
    </section>

    <!-- 機能セクション -->
    <section class="features" id="features">
      <div class="section-header">
        <h2 class="section-title">なぜOmniyが選ばれるのか？</h2>
        <p class="section-description">
          Instagram運用の手間を最小限に、効果を最大限に。<br>
          AIとスマートな自動化機能があなたの投稿をサポートします。
        </p>
      </div>

      <div class="features-grid">
        <div class="feature-card" v-for="feature in features" :key="feature.title">
          <div class="feature-icon">{{ feature.icon }}</div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-description">{{ feature.description }}</p>
          <div class="feature-benefits">
            <span 
              class="benefit-chip" 
              v-for="benefit in feature.benefits" 
              :key="benefit"
            >
              {{ benefit }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- 料金セクション -->
    <section class="pricing" id="pricing">
      <div class="section-header">
        <h2 class="section-title">シンプルで透明な料金プラン</h2>
        <p class="section-description">
          あなたのニーズに合わせた柔軟なプランをご用意。<br>
          いつでもアップグレード・ダウングレードが可能です。
        </p>
      </div>

      <div class="pricing-grid">
        <div 
          class="pricing-card" 
          :class="{ popular: plan.popular }" 
          v-for="plan in pricingPlans" 
          :key="plan.name"
        >
          <span v-if="plan.popular" class="popular-badge">人気No.1</span>
          <h3 class="plan-name">{{ plan.name }}</h3>
          <div class="plan-price">
            ¥{{ plan.price.toLocaleString() }}<small>/月</small>
          </div>
          <p style="color: var(--text-secondary); margin-bottom: 2rem;">
            {{ plan.description }}
          </p>
          <ul class="plan-features">
            <li v-for="feature in plan.features" :key="feature">
              <span class="check-icon">✓</span> {{ feature }}
            </li>
          </ul>
          <router-link 
            :to="plan.price === 0 ? '/login' : (authStore.isAuthenticated ? '/billing' : '/login')"
            :class="plan.popular ? 'cta-button' : 'secondary-button'"
            style="display: block; text-align: center; text-decoration: none;"
          >
            {{ plan.buttonText }}
          </router-link>
        </div>
      </div>

      <div style="text-align: center; margin-top: 3rem;">
        <p style="color: var(--text-secondary);">
          <strong>🔒 安心の返金保証</strong><br>
          14日間の返金保証付き。まずはお気軽にお試しください。
        </p>
      </div>
    </section>

    <!-- フッター -->
    <footer>
      <div class="footer-content">
        <div class="logo" style="margin-bottom: 2rem;">Omniy</div>
        <p style="opacity: 0.8;">
          © 2025 Omniy. All rights reserved.<br>
          Instagram予約投稿を、もっとスマートに。
        </p>
        <div class="footer-links">
          <router-link to="/" class="footer-link">ホーム</router-link>
          <router-link to="/demo" class="footer-link">デモ体験</router-link>
          <a href="#features" class="footer-link">機能</a>
          <a href="#pricing" class="footer-link">料金</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores'

const authStore = useAuthStore()

// リアルタイム活動データ
const realTimeActivities = ref([
  { id: 1, text: '@fashion_maya さんが10分前に投稿を予約しました' },
  { id: 2, text: '@cafe_tokyo さんが新規登録しました' },
  { id: 3, text: '@beauty_salon さんの投稿が完了しました' },
  { id: 4, text: '@shop_online さんが繰り返し投稿を設定しました' }
])

// 機能データ
const features = ref([
  {
    title: 'スマート予約投稿',
    icon: '📅',
    description: '日時指定はもちろん、曜日×時刻の繰り返し投稿やランダム投稿も可能。AIが最適な投稿時間を提案します。',
    benefits: ['自動投稿', '繰り返し設定', 'AI最適化']
  },
  {
    title: 'マルチアカウント管理',
    icon: '👥',
    description: '複数のInstagramアカウントを一元管理。アカウントごとに異なる投稿戦略を簡単に実行できます。',
    benefits: ['一括管理', '切り替え簡単', 'グループ機能']
  },
  {
    title: '詳細な分析機能',
    icon: '📊',
    description: '投稿のパフォーマンスをリアルタイムで追跡。エンゲージメント率の高い時間帯や内容を分析します。',
    benefits: ['リアルタイム', '詳細レポート', '改善提案']
  },
  {
    title: '安全性最優先',
    icon: '🔒',
    description: 'Instagram公式APIを使用し、アカウントの安全性を確保。プロキシ設定でさらに安心して運用できます。',
    benefits: ['公式API', 'セキュア', '24/7監視']
  },
  {
    title: 'コンテンツライブラリ',
    icon: '🎨',
    description: '投稿コンテンツを事前に作成・保存。タグ管理で簡単に整理し、いつでも再利用できます。',
    benefits: ['一括作成', 'タグ管理', '再利用可能']
  },
  {
    title: 'スマート通知',
    icon: '🔔',
    description: '投稿の成功・失敗をリアルタイムで通知。重要なイベントを見逃しません。',
    benefits: ['リアルタイム', 'カスタマイズ', '複数チャンネル']
  }
])

// 料金プランデータ
const pricingPlans = ref([
  {
    name: 'Free',
    price: 0,
    description: '個人利用に最適',
    popular: false,
    buttonText: '無料で始める',
    features: [
      'IGアカウント 1個',
      '月10投稿まで',
      '基本的な予約投稿',
      'コミュニティサポート'
    ]
  },
  {
    name: 'Pro',
    price: 2980,
    description: 'プロフェッショナル向け',
    popular: true,
    buttonText: '14日間無料で試す',
    features: [
      'IGアカウント 10個',
      '月500投稿まで',
      '全ての投稿機能',
      'AI最適化機能',
      '詳細分析レポート',
      '優先サポート'
    ]
  },
  {
    name: 'Business',
    price: 9800,
    description: '企業・代理店向け',
    popular: false,
    buttonText: 'お問い合わせ',
    features: [
      'IGアカウント 無制限',
      '投稿数 無制限',
      '全機能利用可能',
      'API アクセス',
      '専任サポート',
      'カスタマイズ対応'
    ]
  }
])
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --accent-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  --text-primary: #2d3748;
  --text-secondary: #718096;
  --bg-light: #f7fafc;
  --white: #ffffff;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
}

.omniy-landing-page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans JP', sans-serif;
  color: var(--text-primary);
  line-height: 1.6;
  overflow-x: hidden;
}

/* ナビゲーション */
.omniy-nav {
  position: fixed;
  top: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  z-index: 1000;
  padding: 1rem 0;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.8rem;
  font-weight: 800;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: var(--text-primary);
}

.cta-button {
  background: var(--primary-gradient);
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 30px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  display: inline-block;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* ヒーローセクション */
.hero {
  margin-top: 80px;
  padding: 4rem 2rem 6rem;
  background: linear-gradient(180deg, #fafbff 0%, #f3f4f6 100%);
  position: relative;
  overflow: hidden;
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-content h1 {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1.5rem;
}

.gradient-text {
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-description {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.8;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 3rem;
}

.secondary-button {
  background: white;
  color: var(--text-primary);
  padding: 0.75rem 2rem;
  border-radius: 30px;
  text-decoration: none;
  font-weight: 600;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  display: inline-block;
}

.secondary-button:hover {
  border-color: #cbd5e0;
  transform: translateY(-2px);
}

.hero-stats {
  display: flex;
  gap: 3rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* Instagram風モックアップ */
.hero-visual {
  position: relative;
}

.phone-mockup {
  width: 320px;
  height: 640px;
  background: #000;
  border-radius: 40px;
  padding: 10px;
  box-shadow: var(--shadow-xl);
  margin: 0 auto;
  position: relative;
}

.phone-screen {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 30px;
  overflow: hidden;
  position: relative;
}

.instagram-header {
  padding: 1rem;
  border-bottom: 1px solid #efefef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ig-logo {
  font-size: 1.5rem;
  font-weight: 600;
}

.instagram-post {
  padding: 1rem;
}

.post-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-gradient);
}

.post-image {
  width: 100%;
  height: 280px;
  background: linear-gradient(45deg, #f3f4f6 25%, #e5e7eb 25%, #e5e7eb 50%, #f3f4f6 50%, #f3f4f6 75%, #e5e7eb 75%, #e5e7eb);
  background-size: 20px 20px;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.scheduled-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: var(--primary-gradient);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* 浮遊する要素 */
.floating-elements {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

.floating-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  animation: float 20s infinite ease-in-out;
}

.circle-1 {
  width: 200px;
  height: 200px;
  background: var(--primary-gradient);
  top: 10%;
  left: 5%;
  animation-delay: 0s;
}

.circle-2 {
  width: 150px;
  height: 150px;
  background: var(--secondary-gradient);
  top: 60%;
  right: 10%;
  animation-delay: 5s;
}

.circle-3 {
  width: 100px;
  height: 100px;
  background: var(--accent-gradient);
  bottom: 20%;
  left: 15%;
  animation-delay: 10s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, -30px) scale(1.1); }
  50% { transform: translate(-20px, 20px) scale(0.9); }
  75% { transform: translate(20px, 30px) scale(1.05); }
}

/* ソーシャルプルーフティッカー */
.social-proof {
  background: white;
  padding: 1rem 0;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  overflow: hidden;
}

.ticker-wrapper {
  display: flex;
  animation: ticker 30s linear infinite;
}

.ticker-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0 2rem;
  white-space: nowrap;
}

.ticker-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #e2e8f0;
}

.ticker-text {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

@keyframes ticker {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* 機能セクション */
.features {
  padding: 6rem 2rem;
  background: white;
}

.section-header {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 4rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
}

.section-description {
  font-size: 1.1rem;
  color: var(--text-secondary);
}

.features-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: var(--bg-light);
  padding: 2.5rem;
  border-radius: 20px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.feature-icon {
  width: 60px;
  height: 60px;
  background: var(--primary-gradient);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  margin-bottom: 1.5rem;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.feature-description {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.feature-benefits {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.benefit-chip {
  background: white;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.85rem;
  color: #667eea;
  border: 1px solid #e0e7ff;
}

/* 料金セクション */
.pricing {
  padding: 6rem 2rem;
  background: linear-gradient(180deg, #fafbff 0%, white 100%);
}

.pricing-grid {
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.pricing-card {
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  text-align: center;
  position: relative;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.pricing-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-xl);
}

.pricing-card.popular {
  border-color: #667eea;
  transform: scale(1.05);
}

.popular-badge {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--primary-gradient);
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.plan-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.plan-price {
  font-size: 3rem;
  font-weight: 800;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.plan-price small {
  font-size: 1rem;
  font-weight: 400;
}

.plan-features {
  list-style: none;
  margin: 2rem 0;
  text-align: left;
}

.plan-features li {
  padding: 0.75rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-secondary);
}

.check-icon {
  color: #48bb78;
  font-size: 1.2rem;
}

/* フッター */
footer {
  background: var(--text-primary);
  color: white;
  padding: 3rem 2rem;
  text-align: center;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-links {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.footer-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: white;
}

/* レスポンシブ */
@media (max-width: 768px) {
  .hero-container {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .hero-content h1 {
    font-size: 2.5rem;
  }

  .hero-visual {
    order: -1;
    margin-bottom: 2rem;
  }

  .phone-mockup {
    width: 280px;
    height: 560px;
  }

  .nav-links {
    display: none;
  }

  .features-grid,
  .pricing-grid {
    grid-template-columns: 1fr;
  }

  .pricing-card.popular {
    transform: scale(1);
  }

  .hero-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .hero-actions .cta-button,
  .hero-actions .secondary-button {
    width: 100%;
    max-width: 300px;
  }

  .footer-links {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>