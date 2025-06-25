<template>
  <div class="login-layout">
    <!-- 左側: ログインフォーム -->
    <div class="login-section">
      <div class="login-container">
        <!-- ロゴ -->
        <div class="logo-section">
          <h1 class="logo">Omniy</h1>
          <p class="tagline">Instagram投稿を、もっとスマートに</p>
        </div>

        <!-- ログインフォーム -->
        <div class="form-card">
          <div class="login-header">
            <h2 class="login-title">おかえりなさい</h2>
            <p class="login-subtitle">アカウントにログイン</p>
          </div>

          <!-- エラーメッセージ -->
          <div v-if="authStore.error" class="error-message show">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{{ authStore.error }}</span>
          </div>

          <!-- メールアドレス -->
          <div class="form-group">
            <label class="form-label">メールアドレス</label>
            <input type="email" class="form-input" v-model="email" placeholder="example@email.com"
              @keypress="handleEmailKeypress">
          </div>

          <!-- パスワード -->
          <div class="form-group">
            <label class="form-label">パスワード</label>
            <div class="password-wrapper">
              <input :type="showPassword ? 'text' : 'password'" class="form-input" v-model="password"
                placeholder="••••••••" @keypress="handlePasswordKeypress">
              <button type="button" class="toggle-password" @click="togglePassword">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="eye-icon">
                  <template v-if="showPassword">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </template>
                  <template v-else>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </template>
                </svg>
              </button>
            </div>
          </div>

          <!-- オプション -->
          <div class="form-checkbox">
            <label class="checkbox-label">
              <input type="checkbox" class="checkbox-input" v-model="rememberMe">
              ログイン状態を保持する
            </label>
            <a href="#" class="forgot-link">パスワードを忘れた方</a>
          </div>

          <!-- ログインボタン -->
          <button class="login-button" :class="{ loading: isLoading }" :disabled="isLoading" @click="handleLogin">
            <span v-if="!isLoading">ログイン</span>
            <div v-if="isLoading" class="btn-loading">
              <div class="spinner"></div>
              <span>ログイン中...</span>
            </div>
          </button>

          <!-- 区切り線 -->
          <div class="divider">
            <div class="divider-line"></div>
            <span class="divider-text">または</span>
            <div class="divider-line"></div>
          </div>

          <!-- ソーシャルログイン -->
          <div class="social-login">
            <button class="social-button" @click="handleGoogleLogin">
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Google</span>
            </button>
          </div>

          <!-- 新規登録リンク -->
          <div class="signup-link">
            アカウントをお持ちでない方は <router-link to="/signup">新規登録</router-link>
          </div>
          
          <!-- 利用規約同意文 -->
          <div class="terms-agreement">
            ログインすることで、
            <router-link to="/terms" class="legal-link">利用規約</router-link>
            と
            <router-link to="/privacy" class="legal-link">プライバシーポリシー</router-link>
            に同意したものとみなされます。
          </div>
        </div>

        <!-- セキュリティ情報 -->
        <div class="security-info">
          <div class="security-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              class="check-icon">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>SSL暗号化</span>
          </div>
          <div class="security-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              class="check-icon">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>二段階認証対応</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右側: ビジュアルセクション -->
    <div class="visual-section">
      <!-- 背景装飾 -->
      <div class="bg-decoration decoration-1"></div>
      <div class="bg-decoration decoration-2"></div>
      <div class="bg-decoration decoration-3"></div>

      <!-- コンテンツ -->
      <div class="visual-content">
        <h2 class="visual-title">Instagram運用を<br>次のレベルへ</h2>

        <!-- 特徴リスト -->
        <ul class="feature-list">
          <li class="feature-item">
            <div class="feature-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div class="feature-content">
              <h3>AIによる最適化</h3>
              <p>投稿時間を自動で最適化し、エンゲージメントを最大化</p>
            </div>
          </li>
          <li class="feature-item">
            <div class="feature-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div class="feature-content">
              <h3>時間を味方につける</h3>
              <p>繰り返し投稿で毎日の運用を完全自動化</p>
            </div>
          </li>
          <li class="feature-item">
            <div class="feature-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div class="feature-content">
              <h3>Instagram公式API連携</h3>
              <p>Meta認定の安全な方法で大切なアカウントを保護</p>
            </div>
          </li>
        </ul>

        <!-- お客様の声 -->
        <div class="testimonial">
          <p class="testimonial-text">"{{ testimonials[currentTestimonial].text }}"</p>
          <div>
            <p class="testimonial-author">{{ testimonials[currentTestimonial].author }}</p>
            <p class="testimonial-role">{{ testimonials[currentTestimonial].role }}</p>
          </div>
        </div>

        <!-- インジケーター -->
        <div class="indicators">
          <div v-for="(_, index) in testimonials" :key="index" class="indicator"
            :class="{ active: index === currentTestimonial }" @click="setTestimonial(index)"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores'
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

// フォーム状態
const showPassword = ref(false)
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const isLoading = ref(false)

const router = useRouter()
const authStore = useAuthStore()

// お客様の声データ
const testimonials = ref([
  {
    text: "Omniyのおかげで投稿管理が劇的に楽になりました。もう手放せません！",
    author: "@fashion_maya",
    role: "ファッションインフルエンサー"
  },
  {
    text: "複数アカウントの管理が一元化できて、作業効率が3倍になりました。",
    author: "@marketing_pro",
    role: "デジタルマーケター"
  },
  {
    text: "AIの投稿時間提案が的確で、エンゲージメント率が150%向上しました。",
    author: "@cafe_tokyo",
    role: "カフェオーナー"
  }
])

const currentTestimonial = ref(0)
let testimonialInterval: NodeJS.Timeout | null = null

// お客様の声カルーセル
onMounted(() => {
  testimonialInterval = setInterval(() => {
    updateTestimonial()
  }, 5000)
})

onUnmounted(() => {
  if (testimonialInterval) {
    clearInterval(testimonialInterval)
  }
})

// パスワード表示切替
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

// ログイン処理
const handleLogin = async () => {
  authStore.clearError()

  if (!email.value || !password.value) {
    authStore.error = 'メールアドレスとパスワードを入力してください'
    return
  }

  isLoading.value = true

  // 開発環境用のテストログイン
  setTimeout(() => {
    if (email.value === 'test@omniy.com' && password.value === 'test123') {
      // テストアカウントでログイン成功をシミュレート
      authStore.user = {
        uid: 'test-user-123',
        email: 'test@omniy.com',
        displayName: 'テストユーザー',
        photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        emailVerified: true,
        isAnonymous: false,
        phoneNumber: null,
        providerId: 'password',
        providerData: [],
        refreshToken: 'mock-refresh-token',
        tenantId: null,
        delete: async () => {},
        getIdToken: async () => 'mock-id-token',
        getIdTokenResult: async () => ({} as any),
        reload: async () => {},
        toJSON: () => ({}),
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString(),
        },
      } as any
      authStore.clearError()
      router.push('/dashboard')
    } else {
      authStore.error = 'メールアドレスまたはパスワードが正しくありません'
    }
    isLoading.value = false
  }, 1500)
}

// Googleログイン処理
const handleGoogleLogin = async () => {
  try {
    // 開発環境用のGoogleログインシミュレート
    authStore.user = {
      uid: 'google-user-456',
      email: 'google.test@omniy.com',
      displayName: 'Googleテストユーザー',
      photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      emailVerified: true,
      isAnonymous: false,
      phoneNumber: null,
      providerId: 'google.com',
      providerData: [],
      refreshToken: 'mock-refresh-token',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => 'mock-id-token',
      getIdTokenResult: async () => ({} as any),
      reload: async () => {},
      toJSON: () => ({}),
      metadata: {
        creationTime: new Date().toISOString(),
        lastSignInTime: new Date().toISOString(),
      },
    } as any
    authStore.clearError()
    router.push('/dashboard')
  } catch (error) {
    console.error('Google login error:', error)
    authStore.error = 'Googleログインに失敗しました'
  }
}

// キーボードイベント
const handleEmailKeypress = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement
    passwordInput?.focus()
  }
}

const handlePasswordKeypress = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleLogin()
  }
}

// お客様の声更新
const updateTestimonial = () => {
  currentTestimonial.value = (currentTestimonial.value + 1) % testimonials.value.length
}

// インジケータークリック
const setTestimonial = (index: number) => {
  currentTestimonial.value = index
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-layout {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans JP', sans-serif;
  line-height: 1.6;
  color: #2d3748;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  z-index: 9999;
}

/* 左側: ログインフォーム */
.login-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: white;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

/* ロゴ */
.logo-section {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.tagline {
  color: #718096;
  font-size: 1rem;
}

/* フォームカード */
.form-card {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

/* ログインヘッダー */
.login-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.login-title {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.login-subtitle {
  color: #718096;
  font-size: 1rem;
}

/* エラーメッセージ */
.error-message {
  background: #fee;
  border: 1px solid #fc8181;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
  display: none;
  align-items: center;
  gap: 0.5rem;
  color: #c53030;
  font-size: 0.875rem;
}

.error-message.show {
  display: flex;
}

/* フォームグループ */
.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1.25rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input::placeholder {
  color: #a0aec0;
}

/* パスワード入力フィールド */
.password-wrapper {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #718096;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.5rem;
  transition: color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-password:hover {
  color: #2d3748;
}

.eye-icon {
  width: 20px;
  height: 20px;
}

.input-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #a0aec0;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #a0aec0;
  padding: 0.25rem;
  transition: color 0.2s;
}

.password-toggle:hover {
  color: #4a5568;
}

/* チェックボックス */
.form-checkbox {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: #718096;
  font-size: 0.9rem;
}

.checkbox-input {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #667eea;
}

.forgot-link {
  color: #667eea;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.3s ease;
}

.forgot-link:hover {
  color: #764ba2;
}

/* ボタン */
.login-button {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.login-button:active {
  transform: translateY(0);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-loading {
  display: none;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary.loading .btn-text {
  display: none;
}

.btn-primary.loading .btn-loading {
  display: flex;
}

/* スピナー */
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 区切り線 */
.divider {
  display: flex;
  align-items: center;
  margin: 2rem 0;
  gap: 1rem;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}

.divider-text {
  color: #718096;
  font-size: 0.9rem;
}

/* ソーシャルログイン */
.social-login {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.social-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.875rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  color: #2d3748;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
}

.social-button:hover {
  border-color: #cbd5e0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.social-icon {
  font-size: 1.25rem;
}

/* サインアップリンク */
.signup-link {
  text-align: center;
  color: #718096;
  font-size: 0.95rem;
}

.signup-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.signup-link a:hover {
  color: #764ba2;
}

/* 利用規約同意文 */
.terms-agreement {
  text-align: center;
  color: #718096;
  font-size: 0.85rem;
  margin-top: 1rem;
  line-height: 1.5;
}

.legal-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.legal-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

/* セキュリティ情報 */
.security-info {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 2rem;
  font-size: 0.875rem;
  color: #a0aec0;
}

.security-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.check-icon {
  color: #48bb78;
}

/* 右側: ビジュアルセクション */
.visual-section {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  position: relative;
  overflow: hidden;
}

/* 背景装飾 */
.bg-decoration {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  filter: blur(40px);
  animation: float 20s infinite ease-in-out;
}

.decoration-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.decoration-2 {
  width: 250px;
  height: 250px;
  bottom: -50px;
  right: -50px;
  animation-delay: 5s;
}

.decoration-3 {
  width: 200px;
  height: 200px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 10s;
}

@keyframes float {

  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  25% {
    transform: translate(30px, -30px) scale(1.1);
  }

  50% {
    transform: translate(-20px, 20px) scale(0.9);
  }

  75% {
    transform: translate(20px, 30px) scale(1.05);
  }
}

/* ビジュアルコンテンツ */
.visual-content {
  position: relative;
  z-index: 1;
  color: white;
  max-width: 500px;
}

.visual-title {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 2rem;
}

.feature-list {
  list-style: none;
  margin-bottom: 2rem;
}

.feature-item {
  display: flex;
  align-items: start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.feature-icon {
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.feature-content h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.feature-content p {
  font-size: 0.875rem;
  opacity: 0.9;
  line-height: 1.5;
}

/* お客様の声 */
.testimonial {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.testimonial-text {
  font-style: italic;
  margin-bottom: 1rem;
  opacity: 0.95;
}

.testimonial-author {
  font-weight: 600;
}

.testimonial-role {
  font-size: 0.875rem;
  opacity: 0.8;
}

/* インジケーター */
.indicators {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.indicator {
  width: 8px;
  height: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transition: all 0.3s;
  cursor: pointer;
}

.indicator.active {
  width: 24px;
  background: white;
  border-radius: 4px;
}

/* レスポンシブ */
@media (max-width: 1024px) {
  .visual-section {
    display: none;
  }

  .login-layout {
    background: white;
  }
}

@media (max-width: 480px) {
  .login-section {
    padding: 1rem;
  }

  .form-card {
    padding: 1.5rem;
  }

  .security-info {
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
  }
}
</style>
