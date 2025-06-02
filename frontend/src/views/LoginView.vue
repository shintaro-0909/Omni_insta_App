<template>
  <div class="login-view">
    <!-- 統一ナビゲーション -->
    <nav class="omniy-nav">
      <div class="nav-container">
        <div class="logo">Omniy</div>
        <div class="nav-links">
          <router-link to="/" class="nav-link">ホーム</router-link>
          <router-link to="/demo" class="nav-link">デモ体験</router-link>
          <a href="/#features" class="nav-link">機能</a>
          <a href="/#pricing" class="nav-link">料金</a>
        </div>
      </div>
    </nav>

    <!-- ログインセクション -->
    <section class="login-hero">
      <div class="floating-elements">
        <div class="floating-circle circle-1"></div>
        <div class="floating-circle circle-2"></div>
        <div class="floating-circle circle-3"></div>
      </div>

      <div class="login-container">
        <div class="login-content">
          <!-- ログインフォーム -->
          <div class="login-card">
            <div class="login-header">
              <div class="login-logo">
                <div class="logo-icon">📱</div>
                <h1 class="login-title">
                  <span class="gradient-text">Omniy</span> へようこそ
                </h1>
                <p class="login-subtitle">
                  Instagram予約投稿を始めましょう
                </p>
              </div>
            </div>

            <div class="login-form">
              <!-- Google認証ボタン -->
              <button
                class="google-login-button"
                :disabled="authStore.loading"
                @click="handleGoogleLogin"
              >
                <div class="button-content">
                  <div class="google-icon">🔑</div>
                  <span v-if="!authStore.loading">Googleでログイン</span>
                  <span v-else>ログイン中...</span>
                </div>
                <div v-if="authStore.loading" class="loading-spinner"></div>
              </button>

              <!-- 利用規約 -->
              <div class="terms-text">
                ログインすることで、
                <a href="#" class="terms-link">利用規約</a>
                および
                <a href="#" class="terms-link">プライバシーポリシー</a>
                に同意したものとみなされます。
              </div>

              <!-- セキュリティ情報 -->
              <div class="security-info">
                <div class="security-item">
                  <span class="security-icon">🔒</span>
                  <span class="security-text">Instagram公式API使用</span>
                </div>
                <div class="security-item">
                  <span class="security-icon">🛡️</span>
                  <span class="security-text">安全な認証システム</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 機能紹介 -->
          <div class="features-preview">
            <h2 class="features-title">Omniyでできること</h2>
            <div class="features-grid">
              <div 
                v-for="feature in features" 
                :key="feature.text" 
                class="feature-item"
              >
                <div class="feature-icon">{{ feature.iconEmoji }}</div>
                <div class="feature-content">
                  <div class="feature-name">{{ feature.name }}</div>
                  <div class="feature-text">{{ feature.text }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ビジュアル要素 -->
        <div class="login-visual">
          <div class="login-phone-mockup">
            <div class="phone-screen">
              <div class="login-demo-header">
                <span class="demo-logo">Omniy</span>
                <span>⚡</span>
              </div>
              <div class="demo-content">
                <div class="demo-welcome">
                  <div class="welcome-avatar"></div>
                  <div class="welcome-text">
                    <div class="welcome-title">ようこそ！</div>
                    <div class="welcome-subtitle">Instagram運用を始めましょう</div>
                  </div>
                </div>
                <div class="demo-stats">
                  <div class="demo-stat">
                    <div class="demo-stat-value">0</div>
                    <div class="demo-stat-label">投稿予約</div>
                  </div>
                  <div class="demo-stat">
                    <div class="demo-stat-value">0</div>
                    <div class="demo-stat-label">アカウント</div>
                  </div>
                  <div class="demo-stat">
                    <div class="demo-stat-value">∞</div>
                    <div class="demo-stat-label">可能性</div>
                  </div>
                </div>
                <div class="demo-button">
                  <div class="start-button">今すぐ始める</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- デモ体験セクション -->
    <section class="demo-cta-section">
      <div class="demo-cta-container">
        <h2 class="demo-cta-title">まずは<span class="gradient-text">デモ</span>を体験してみませんか？</h2>
        <p class="demo-cta-description">
          革新的なUIデザインとOmniyの機能を事前に確認できます
        </p>
        <div class="demo-cta-buttons">
          <router-link to="/demo" class="demo-button-primary">
            革命的UIデモを体験
          </router-link>
          <router-link to="/" class="demo-button-secondary">
            機能詳細を見る
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores'

const router = useRouter()
const authStore = useAuthStore()

// 機能一覧
const features = [
  {
    iconEmoji: '📅',
    name: 'スマート予約',
    text: '日時指定で自動投稿',
  },
  {
    iconEmoji: '🔄',
    name: '繰り返し投稿',
    text: '曜日・時刻の定期投稿',
  },
  {
    iconEmoji: '🎲',
    name: 'ランダム投稿',
    text: 'コンテンツから自動選択',
  },
  {
    iconEmoji: '👥',
    name: 'マルチアカウント',
    text: '複数アカウント一元管理',
  },
  {
    iconEmoji: '🔒',
    name: '安全な連携',
    text: 'Instagram公式API使用',
  },
  {
    iconEmoji: '📊',
    name: '詳細分析',
    text: 'パフォーマンス追跡',
  },
]

// Methods
const handleGoogleLogin = async () => {
  try {
    await authStore.loginWithGoogle()
    router.push('/dashboard')
  } catch (error) {
    console.error('ログインエラー:', error)
  }
}
</script>

<style scoped>
/* LP-demo.htmlと統一されたスタイルシステム */
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

.login-view {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans JP', sans-serif;
  color: var(--text-primary);
  line-height: 1.6;
  overflow-x: hidden;
  min-height: 100vh;
  background: linear-gradient(180deg, #fafbff 0%, #f3f4f6 100%);
}

/* 統一ナビゲーション */
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

/* ログインヒーローセクション */
.login-hero {
  margin-top: 80px;
  padding: 4rem 2rem 6rem;
  position: relative;
  overflow: hidden;
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
}

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

.login-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.login-content {
  z-index: 2;
}

/* ログインカード */
.login-card {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: var(--shadow-xl);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  margin-bottom: 3rem;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.login-title {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1rem;
}

.gradient-text {
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.login-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 0;
}

/* ログインフォーム */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.google-login-button {
  background: var(--primary-gradient);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 56px;
}

.google-login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.google-login-button:disabled {
  opacity: 0.8;
  cursor: not-allowed;
}

.button-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.google-icon {
  font-size: 1.2rem;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-left: 0.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.terms-text {
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.terms-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.terms-link:hover {
  text-decoration: underline;
}

.security-info {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-light);
  border-radius: 12px;
}

.security-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.security-icon {
  font-size: 1.1rem;
}

.security-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

/* 機能プレビュー */
.features-preview {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: var(--shadow-lg);
}

.features-title {
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 2rem;
  color: var(--text-primary);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg-light);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.feature-icon {
  font-size: 1.5rem;
  width: 40px;
  text-align: center;
}

.feature-content {
  flex: 1;
}

.feature-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.feature-text {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

/* ログインビジュアル */
.login-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-phone-mockup {
  width: 320px;
  height: 640px;
  background: #000;
  border-radius: 40px;
  padding: 10px;
  box-shadow: var(--shadow-xl);
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

.login-demo-header {
  padding: 1rem;
  border-bottom: 1px solid #efefef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.demo-logo {
  font-size: 1.2rem;
  font-weight: 600;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.demo-content {
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  height: calc(100% - 60px);
}

.demo-welcome {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-light);
  border-radius: 12px;
}

.welcome-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--primary-gradient);
}

.welcome-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.welcome-subtitle {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.demo-stats {
  display: flex;
  gap: 1rem;
}

.demo-stat {
  flex: 1;
  text-align: center;
  padding: 1rem;
  background: var(--bg-light);
  border-radius: 12px;
}

.demo-stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.demo-stat-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.demo-button {
  margin-top: auto;
}

.start-button {
  background: var(--primary-gradient);
  color: white;
  padding: 1rem;
  border-radius: 25px;
  text-align: center;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* デモCTAセクション */
.demo-cta-section {
  padding: 4rem 2rem;
  background: white;
  text-align: center;
}

.demo-cta-container {
  max-width: 800px;
  margin: 0 auto;
}

.demo-cta-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.demo-cta-description {
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.demo-cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.demo-button-primary {
  background: var(--primary-gradient);
  color: white;
  padding: 1rem 2rem;
  border-radius: 30px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.demo-button-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.demo-button-secondary {
  background: white;
  color: var(--text-primary);
  padding: 1rem 2rem;
  border-radius: 30px;
  text-decoration: none;
  font-weight: 600;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.demo-button-secondary:hover {
  border-color: #cbd5e0;
  transform: translateY(-2px);
}

/* レスポンシブ */
@media (max-width: 768px) {
  .login-container {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 2rem;
  }

  .login-visual {
    order: -1;
  }

  .login-phone-mockup {
    width: 280px;
    height: 560px;
  }

  .login-card {
    padding: 2rem;
  }

  .login-title {
    font-size: 2rem;
  }

  .nav-links {
    display: none;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .demo-cta-title {
    font-size: 2rem;
  }

  .demo-cta-buttons {
    flex-direction: column;
    align-items: center;
  }

  .demo-button-primary,
  .demo-button-secondary {
    width: 100%;
    max-width: 300px;
  }
}
</style>