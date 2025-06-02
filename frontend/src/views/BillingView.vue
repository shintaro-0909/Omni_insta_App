<template>
  <div class="billing-view">
    <!-- 統一ナビゲーション -->
    <nav class="omniy-nav">
      <div class="nav-container">
        <div class="logo">Omniy</div>
        <div class="nav-links">
          <router-link to="/dashboard" class="nav-link">ダッシュボード</router-link>
          <router-link to="/schedules" class="nav-link">予約管理</router-link>
          <router-link to="/accounts" class="nav-link">アカウント</router-link>
          <router-link to="/content" class="nav-link">コンテンツ</router-link>
          <router-link to="/settings" class="nav-link">設定</router-link>
          <router-link to="/billing" class="cta-button">プラン管理</router-link>
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
          <h1>料金 <span class="gradient-text">プラン</span></h1>
          <p class="hero-description">
            あなたのInstagram運用に最適なプランを選択してください。
            柔軟なアップグレード、ダウングレードで必要な時に必要な機能を。
          </p>
        </div>

        <div class="hero-visual">
          <div class="billing-phone-mockup">
            <div class="phone-screen">
              <div class="billing-header">
                <span class="billing-logo">💳 プラン</span>
                <span>👑</span>
              </div>
              <div class="billing-demo-content">
                <div class="demo-plan current">
                  <div class="plan-name">Proプラン</div>
                  <div class="plan-price">¥2,980/月</div>
                  <div class="plan-status current">現在のプラン</div>
                </div>
                <div class="demo-features">
                  <div class="feature-item">✅ 10アカウント</div>
                  <div class="feature-item">✅ 無制限投稿</div>
                  <div class="feature-item">✅ AI最適化</div>
                </div>
                <div class="demo-button">
                  <div class="upgrade-button">アップグレード</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="billing-content">

      <!-- 現在のサブスクリプション情報 -->
      <section v-if="currentSubscription" class="current-plan-section">
        <div class="section-header">
          <h2 class="section-title">👑 現在のプラン</h2>
        </div>

        <div class="current-plan-card">
          <div class="plan-info">
            <div class="plan-main">
              <h3 class="plan-name">{{ currentPlan?.name || 'Free' }}プラン</h3>
              <p class="plan-description">
                {{ currentPlan?.description || 'フリープランをご利用中です' }}
              </p>
              <div v-if="!isFreePlan" class="plan-details">
                <div class="detail-item">
                  <span class="detail-label">📅 次回更新日:</span>
                  <span class="detail-value">{{ formatDate(currentSubscription.currentPeriodEnd) }}</span>
                </div>
                <div 
                  v-if="currentSubscription.cancelAtPeriodEnd" 
                  class="warning-item"
                >
                  <span class="warning-icon">⚠️</span>
                  <span class="warning-text">期間終了時にキャンセル予定</span>
                </div>
              </div>
            </div>
            
            <div class="plan-pricing">
              <div v-if="!isFreePlan" class="current-price">
                {{ formatPrice(currentPlan?.price || 0) }}<span class="price-period">/月</span>
              </div>
              
              <div class="plan-actions">
                <button 
                  v-if="canCancel"
                  class="action-button cancel"
                  @click="handleCancelSubscription"
                  :disabled="loading"
                >
                  🚫 キャンセル
                </button>
                <button 
                  v-if="canResume"
                  class="action-button resume"
                  @click="handleResumeSubscription"
                  :disabled="loading"
                >
                  ✅ 取り消し
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- プラン一覧セクション -->
      <section class="plans-section">
        <div class="section-header">
          <h2 class="section-title">📅 料金プラン</h2>
          <p class="section-description">あなたのニーズに最適なプランを選択してください</p>
        </div>

        <div class="plans-grid">
          <div
            v-for="plan in plans"
            :key="plan.id"
            class="plan-card"
            :class="{ 'current-plan': currentSubscription?.planId === plan.planId }"
          >
            <!-- 現在のプランバッジ -->
            <div 
              v-if="currentSubscription?.planId === plan.planId" 
              class="current-badge"
            >
              ✅ 現在のプラン
            </div>

            <!-- プランヘッダー -->
            <div class="plan-header">
              <h3 class="plan-title">{{ plan.name }}</h3>
              <div class="plan-price-display">
                <span class="price-amount">
                  {{ plan.planId === 'free' ? '無料' : formatPrice(plan.price) }}
                </span>
                <span v-if="plan.planId !== 'free'" class="price-period">/月</span>
              </div>
              <p class="plan-desc">{{ plan.description }}</p>
            </div>

            <!-- 機能一覧 -->
            <div class="plan-features">
              <div 
                v-for="feature in getPlanFeatureText(plan)" 
                :key="feature" 
                class="feature-item"
              >
                <span class="feature-check">✅</span>
                <span class="feature-text">{{ feature }}</span>
              </div>
            </div>

            <!-- アクションボタン -->
            <div class="plan-action">
              <button
                v-if="currentSubscription?.planId === plan.planId"
                class="plan-button current"
                disabled
              >
                現在のプラン
              </button>
              <button
                v-else
                class="plan-button select"
                @click="handleUpgrade(plan.planId)"
                :disabled="loading"
              >
                <span v-if="loading">処理中...</span>
                <span v-else>このプランを選択</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 決済履歴セクション -->
      <section v-if="!isFreePlan" class="payment-history-section">
        <div class="section-header">
          <h2 class="section-title">💾 決済履歴</h2>
        </div>

        <div class="payment-history-card">
          <div v-if="paymentHistory.length > 0" class="payments-list">
            <div class="payments-header">
              <div class="header-cell">日付</div>
              <div class="header-cell">プラン</div>
              <div class="header-cell">金額</div>
              <div class="header-cell">ステータス</div>
              <div class="header-cell">説明</div>
            </div>
            
            <div 
              v-for="payment in paymentHistory" 
              :key="payment.id" 
              class="payment-row"
            >
              <div class="payment-cell">
                <span class="cell-label">📅</span>
                <span class="cell-value">{{ formatDate(payment.createdAt) }}</span>
              </div>
              <div class="payment-cell">
                <span class="cell-label">📅</span>
                <span class="cell-value">{{ payment.planId }}</span>
              </div>
              <div class="payment-cell">
                <span class="cell-label">💰</span>
                <span class="cell-value amount">{{ formatPrice(payment.amount) }}</span>
              </div>
              <div class="payment-cell">
                <span 
                  class="payment-status" 
                  :class="`status-${payment.status}`"
                >
                  {{ getPaymentStatusIcon(payment.status) }} {{ getPaymentStatusText(payment.status) }}
                </span>
              </div>
              <div class="payment-cell">
                <span class="cell-value description">{{ payment.description }}</span>
              </div>
            </div>
          </div>
          
          <div v-else-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <div class="loading-text">決済履歴を読み込み中...</div>
          </div>
          
          <div v-else class="empty-payments">
            <div class="empty-icon">💾</div>
            <div class="empty-text">決済履歴がありません</div>
          </div>
        </div>
      </section>
    </div>

    <!-- エラー通知 -->
    <div v-if="showError" class="error-notification">
      <div class="notification-content">
        <span class="notification-icon">⚠️</span>
        <span class="notification-text">{{ error }}</span>
        <button class="notification-close" @click="clearError">✕</button>
      </div>
    </div>

    <!-- 成功通知 -->
    <div v-if="showSuccess" class="success-notification">
      <div class="notification-content">
        <span class="notification-icon">✅</span>
        <span class="notification-text">{{ successMessage }}</span>
        <button class="notification-close" @click="showSuccess = false">✕</button>
      </div>
    </div>

    <!-- キャンセル確認ダイアログ -->
    <div v-if="showCancelDialog" class="modal-overlay" @click="showCancelDialog = false">
      <div class="cancel-dialog" @click.stop>
        <div class="dialog-header">
          <h3 class="dialog-title">プランのキャンセル</h3>
        </div>
        <div class="dialog-content">
          <p class="dialog-message">
            本当にプランをキャンセルしますか？
          </p>
          <div class="cancel-info">
            <p class="cancel-details">
              現在の請求期間の終了時（{{ formatDate(currentSubscription?.currentPeriodEnd) }}）まで
              サービスをご利用いただけます。<br>
              その後、Freeプランに自動的に変更されます。
            </p>
          </div>
        </div>
        <div class="dialog-actions">
          <button 
            class="dialog-button secondary" 
            @click="showCancelDialog = false"
          >
            取り消し
          </button>
          <button 
            class="dialog-button danger" 
            @click="confirmCancelSubscription"
            :disabled="loading"
          >
            <span v-if="loading">キャンセル中...</span>
            <span v-else>キャンセルする</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue';
  import { useBillingStore } from '@/stores';

  const billingStore = useBillingStore();

  // State
  const showError = ref(false);
  const showSuccess = ref(false);
  const successMessage = ref('');
  const showCancelDialog = ref(false);

  // Computed
  const {
    plans,
    currentSubscription,
    currentPlan,
    paymentHistory,
    loading,
    error,
    isFreePlan,
    canCancel,
    canResume,
    formatPrice,
    formatDate,
    getPlanFeatureText,
  } = billingStore;

  // 決済履歴テーブルヘッダー
  const paymentHeaders = [
    { title: '日付', key: 'createdAt', sortable: true },
    { title: 'プラン', key: 'planId', sortable: false },
    { title: '金額', key: 'amount', sortable: true },
    { title: 'ステータス', key: 'status', sortable: false },
    { title: '説明', key: 'description', sortable: false },
  ];

  // Watchers
  const errorWatcher = computed(() => error);
  watch(errorWatcher, newError => {
    if (newError) {
      showError.value = true;
    }
  });

  // Methods
  const handleUpgrade = async (planId: string) => {
    try {
      await billingStore.createCheckoutSession(planId);
    } catch (err) {
      console.error('Failed to start checkout:', err);
    }
  };

  const handleCancelSubscription = () => {
    showCancelDialog.value = true;
  };

  const confirmCancelSubscription = async () => {
    try {
      const message = await billingStore.cancelSubscription();
      showCancelDialog.value = false;
      successMessage.value = message;
      showSuccess.value = true;
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
    }
  };

  const handleResumeSubscription = async () => {
    try {
      const message = await billingStore.resumeSubscription();
      successMessage.value = message;
      showSuccess.value = true;
    } catch (err) {
      console.error('Failed to resume subscription:', err);
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'success';
      case 'failed':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'grey';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'succeeded':
        return '成功';
      case 'failed':
        return '失敗';
      case 'pending':
        return '処理中';
      default:
        return status;
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return '✅';
      case 'failed':
        return '❌';
      case 'pending':
        return '⏳';
      default:
        return '❓';
    }
  };

  const clearError = () => {
    billingStore.clearError();
    showError.value = false;
  };

  // Lifecycle
  onMounted(async () => {
    await Promise.all([
      billingStore.fetchPlans(),
      billingStore.fetchSubscription(),
    ]);

    if (!isFreePlan) {
      await billingStore.fetchPaymentHistory();
    }
  });
</script>

<style scoped>
/* LP-demo.htmlと統一されたスタイルシステム */
:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --accent-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  --success-gradient: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  --warning-gradient: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  --text-primary: #2d3748;
  --text-secondary: #718096;
  --bg-light: #f7fafc;
  --white: #ffffff;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
}

.billing-view {
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

.nav-link:hover,
.nav-link.router-link-active {
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
  border: none;
  cursor: pointer;
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

/* 料金モックアップ */
.hero-visual {
  position: relative;
}

.billing-phone-mockup {
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

.billing-header {
  padding: 1rem;
  border-bottom: 1px solid #efefef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.billing-logo {
  font-size: 1.2rem;
  font-weight: 600;
}

.billing-demo-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.demo-plan {
  padding: 1rem;
  background: var(--bg-light);
  border-radius: 12px;
  text-align: center;
}

.demo-plan.current {
  background: var(--primary-gradient);
  color: white;
}

.plan-name {
  font-weight: 700;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.plan-price {
  font-size: 1.3rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.plan-status {
  font-size: 0.8rem;
  opacity: 0.9;
}

.demo-features {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.feature-item {
  font-size: 0.8rem;
  padding: 0.25rem;
}

.demo-button {
  margin-top: 1rem;
}

.upgrade-button {
  background: var(--accent-gradient);
  color: white;
  padding: 0.75rem;
  border-radius: 20px;
  text-align: center;
  font-weight: 600;
}

/* メインコンテンツ */
.billing-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 4rem;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
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

/* 現在のプランセクション */
.current-plan-section {
  margin-bottom: 6rem;
}

.current-plan-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
  border: 2px solid #667eea;
}

.plan-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.plan-main {
  flex: 1;
}

.plan-name {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.plan-description {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.6;
}

.plan-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.detail-label {
  color: var(--text-secondary);
}

.detail-value {
  color: var(--text-primary);
  font-weight: 500;
}

.warning-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #fef3c7;
  border-radius: 8px;
  margin-top: 0.5rem;
}

.warning-icon {
  font-size: 1rem;
}

.warning-text {
  color: #92400e;
  font-weight: 500;
  font-size: 0.9rem;
}

.plan-pricing {
  text-align: right;
}

.current-price {
  font-size: 2.5rem;
  font-weight: 800;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
}

.price-period {
  font-size: 1rem;
  font-weight: 400;
  color: var(--text-secondary);
}

.plan-actions {
  display: flex;
  gap: 1rem;
}

.action-button {
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.action-button.cancel {
  background: var(--warning-gradient);
  color: #92400e;
}

.action-button.resume {
  background: var(--success-gradient);
  color: white;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* プラン一覧セクション */
.plans-section {
  margin-bottom: 6rem;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.plan-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  position: relative;
  border: 2px solid transparent;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.plan-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.plan-card.current-plan {
  border-color: #667eea;
  transform: scale(1.02);
}

.current-badge {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--primary-gradient);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.plan-header {
  text-align: center;
  margin-bottom: 2rem;
}

.plan-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.plan-price-display {
  margin-bottom: 1rem;
}

.price-amount {
  font-size: 2.5rem;
  font-weight: 800;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.price-period {
  font-size: 1rem;
  color: var(--text-secondary);
}

.plan-desc {
  color: var(--text-secondary);
  line-height: 1.6;
}

.plan-features {
  flex: 1;
  margin-bottom: 2rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  font-size: 0.9rem;
}

.feature-check {
  color: #065f46;
  font-size: 1rem;
}

.feature-text {
  color: var(--text-primary);
}

.plan-action {
  margin-top: auto;
}

.plan-button {
  width: 100%;
  padding: 1rem 2rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 1rem;
}

.plan-button.current {
  background: var(--bg-light);
  color: var(--text-secondary);
  border: 2px solid #e2e8f0;
  cursor: not-allowed;
}

.plan-button.select {
  background: var(--primary-gradient);
  color: white;
}

.plan-button.select:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.plan-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* 決済履歴セクション */
.payment-history-section {
  margin-bottom: 4rem;
}

.payment-history-card {
  background: white;
  border-radius: 20px;
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.payments-list {
  overflow-x: auto;
}

.payments-header {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-light);
  border-bottom: 1px solid #e2e8f0;
}

.header-cell {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.payment-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  transition: background-color 0.2s;
}

.payment-row:hover {
  background: var(--bg-light);
}

.payment-row:last-child {
  border-bottom: none;
}

.payment-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.cell-label {
  color: var(--text-secondary);
  display: none;
}

.cell-value {
  color: var(--text-primary);
}

.cell-value.amount {
  font-weight: 600;
  color: #059669;
}

.cell-value.description {
  color: var(--text-secondary);
}

.payment-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.payment-status.status-succeeded {
  background: #d1fae5;
  color: #065f46;
}

.payment-status.status-failed {
  background: #fee2e2;
  color: #991b1b;
}

.payment-status.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.loading-state {
  text-align: center;
  padding: 3rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: var(--text-secondary);
}

.empty-payments {
  text-align: center;
  padding: 3rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-text {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

/* 通知 */
.error-notification,
.success-notification {
  position: fixed;
  top: 100px;
  right: 2rem;
  z-index: 3000;
  animation: slideIn 0.3s ease-out;
}

.notification-content {
  padding: 1rem 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: var(--shadow-md);
}

.error-notification .notification-content {
  background: #fee2e2;
  border: 1px solid #fecaca;
}

.success-notification .notification-content {
  background: #d1fae5;
  border: 1px solid #a7f3d0;
}

.notification-icon {
  font-size: 1.2rem;
}

.error-notification .notification-icon,
.error-notification .notification-text {
  color: #991b1b;
}

.success-notification .notification-icon,
.success-notification .notification-text {
  color: #065f46;
}

.notification-text {
  font-weight: 500;
}

.notification-close {
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.error-notification .notification-close {
  color: #991b1b;
}

.success-notification .notification-close {
  color: #065f46;
}

.notification-close:hover {
  background: rgba(0, 0, 0, 0.1);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* キャンセルダイアログ */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.cancel-dialog {
  background: white;
  border-radius: 20px;
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
  overflow: hidden;
}

.dialog-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.dialog-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.dialog-content {
  padding: 1.5rem;
}

.dialog-message {
  color: var(--text-primary);
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.cancel-info {
  background: var(--bg-light);
  padding: 1rem;
  border-radius: 12px;
}

.cancel-details {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
  font-size: 0.9rem;
}

.dialog-actions {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.dialog-button {
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.dialog-button.secondary {
  background: var(--bg-light);
  color: var(--text-primary);
  border: 2px solid #e2e8f0;
}

.dialog-button.secondary:hover {
  border-color: #cbd5e0;
}

.dialog-button.danger {
  background: var(--warning-gradient);
  color: #92400e;
}

.dialog-button.danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 236, 210, 0.5);
}

.dialog-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
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

  .billing-phone-mockup {
    width: 280px;
    height: 560px;
  }

  .nav-links {
    display: none;
  }

  .plans-grid {
    grid-template-columns: 1fr;
  }

  .plan-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .plan-actions {
    align-self: stretch;
    justify-content: center;
  }

  .payments-header {
    display: none;
  }

  .payment-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 1rem;
  }

  .cell-label {
    display: inline;
  }

  .section-title {
    font-size: 2rem;
  }

  .error-notification,
  .success-notification {
    right: 1rem;
    left: 1rem;
  }
}</style>
