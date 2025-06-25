<template>
  <div class="billing-layout">
    <SidebarNavigation />
    <div class="billing-view">

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

      <!-- 価格システム情報セクション -->
      <section v-if="pricingSystemStore.currentPricingData" class="pricing-system-section">
        <div class="section-header">
          <h2 class="section-title">💰 現在の料金システム</h2>
          <p class="section-description">利用者数に応じて価格が変動するシステムを採用しています</p>
        </div>

        <div class="pricing-system-card">
          <div class="pricing-info">
            <div class="current-price-display">
              <div class="price-label">現在価格</div>
              <div class="price-value">{{ pricingSystemStore.formatPrice(pricingSystemStore.currentPrice) }}<span class="price-period">/月</span></div>
              
              <!-- 値上げ警告 -->
              <div v-if="pricingSystemStore.remainingUsersForNextTier > 0 && pricingSystemStore.remainingUsersForNextTier <= 10" class="price-warning">
                <span class="warning-icon">⚠️</span>
                <span class="warning-text">あと{{ pricingSystemStore.remainingUsersForNextTier }}人で{{ pricingSystemStore.nextTierPrice }}に値上げされます</span>
              </div>
            </div>

            <!-- Grandfather保護通知 -->
            <div v-if="!isFreePlan" class="grandfather-protection">
              <div class="protection-badge">🛡️ 価格保護中</div>
              <div class="protection-message">
                あなたは契約時の価格で継続利用できます（Grandfather価格）。<br>
                <strong>注意：</strong> 解約後に再契約する場合は、その時点の最新価格が適用されます。
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- プラン一覧セクション -->
      <section class="plans-section">
        <div class="section-header">
          <h2 class="section-title">📅 プラン選択</h2>
          <p class="section-description">シンプルな1プラン制。機能制限なしでご利用いただけます</p>
        </div>

        <div class="unified-plan-card">
          <!-- 無料プラン -->
          <div class="plan-section free-plan" :class="{ 'current-plan': isFreePlan }">
            <div v-if="isFreePlan" class="current-badge">✅ 現在のプラン</div>
            <div class="plan-header">
              <h3 class="plan-title">無料プラン</h3>
              <div class="plan-price-display">
                <span class="price-amount">無料</span>
              </div>
              <p class="plan-desc">基本機能を無料でお試しいただけます</p>
            </div>
            <div class="plan-features">
              <div class="feature-item">
                <span class="feature-check">✅</span>
                <span class="feature-text">月間投稿数: 10回</span>
              </div>
              <div class="feature-item">
                <span class="feature-check">✅</span>
                <span class="feature-text">Instagramアカウント: 1個</span>
              </div>
            </div>
            <div class="plan-action">
              <button v-if="isFreePlan" class="plan-button current" disabled>
                現在のプラン
              </button>
            </div>
          </div>

          <!-- 有料プラン -->
          <div class="plan-section paid-plan" :class="{ 'current-plan': !isFreePlan }">
            <div v-if="!isFreePlan" class="current-badge">✅ 現在のプラン</div>
            <div class="plan-header">
              <h3 class="plan-title">プレミアムプラン</h3>
              <div class="plan-price-display">
                <span class="price-amount">
                  {{ pricingSystemStore.formatPrice(pricingSystemStore.currentPrice) }}
                </span>
                <span class="price-period">/月</span>
              </div>
              <p class="plan-desc">すべての機能を無制限でご利用いただけます</p>
              
              <!-- 値上げ警告表示 -->
              <div v-if="pricingSystemStore.remainingUsersForNextTier > 0 && pricingSystemStore.remainingUsersForNextTier <= 20" class="price-warning-inline">
                あと{{ pricingSystemStore.remainingUsersForNextTier }}人で{{ pricingSystemStore.nextTierPrice }}に値上げ
              </div>
            </div>

            <div class="plan-features">
              <div class="feature-item">
                <span class="feature-check">✅</span>
                <span class="feature-text">月間投稿数: 無制限</span>
              </div>
              <div class="feature-item">
                <span class="feature-check">✅</span>
                <span class="feature-text">Instagramアカウント: 無制限</span>
              </div>
              <div class="feature-item">
                <span class="feature-check">✅</span>
                <span class="feature-text">予約投稿</span>
              </div>
              <div class="feature-item">
                <span class="feature-check">✅</span>
                <span class="feature-text">繰り返し投稿</span>
              </div>
              <div class="feature-item">
                <span class="feature-check">✅</span>
                <span class="feature-text">ランダム投稿</span>
              </div>
              <div class="feature-item">
                <span class="feature-check">✅</span>
                <span class="feature-text">プロキシ設定</span>
              </div>
              <div class="feature-item">
                <span class="feature-check">✅</span>
                <span class="feature-text">優先サポート</span>
              </div>
            </div>

            <!-- アクションボタン -->
            <div class="plan-action">
              <button
                v-if="!isFreePlan"
                class="plan-button current"
                disabled
              >
                現在のプラン
              </button>
              <button
                v-else
                class="plan-button select"
                @click="handlePremiumUpgrade"
                :disabled="loading"
              >
                <span v-if="loading">処理中...</span>
                <span v-else>プレミアムプランを選択</span>
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
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue';
  import { useBillingStore } from '@/stores';
  import { usePricingSystemStore } from '@/stores/pricingSystem';
  import { SidebarNavigation } from '@/components';

  const billingStore = useBillingStore();
  const pricingSystemStore = usePricingSystemStore();

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

  // Removed unused payment headers

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

  const handlePremiumUpgrade = async () => {
    try {
      // 新しい価格システムでのCheckout作成
      await billingStore.createCheckoutSession('premium');
    } catch (err) {
      console.error('Failed to start premium checkout:', err);
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
      pricingSystemStore.fetchCurrentPricing(),
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
  flex: 1;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans JP', sans-serif;
  color: var(--text-primary);
  line-height: 1.6;
  overflow-x: hidden;
  min-height: 100vh;
  background: linear-gradient(180deg, #fafbff 0%, #f3f4f6 100%);
  margin-left: 280px;
}

@media (max-width: 1200px) {
  .billing-view {
    margin-left: 72px;
  }
}

@media (max-width: 768px) {
  .billing-view {
    margin-left: 0;
  }
}


/* ヒーローセクション */
.hero {
  padding: 4rem 2rem 6rem;
  background: linear-gradient(180deg, #fafbff 0%, #f3f4f6 100%);
  position: relative;
  overflow: hidden;
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
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

/* 価格システムセクション */
.pricing-system-section {
  margin-bottom: 4rem;
}

.pricing-system-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
  border: 2px solid #f59e0b;
}

.pricing-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.current-price-display {
  text-align: center;
}

.price-label {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.price-value {
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
}

.price-warning {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #fef3c7;
  border-radius: 12px;
  border: 1px solid #f59e0b;
}

.warning-icon {
  font-size: 1.2rem;
}

.warning-text {
  color: #92400e;
  font-weight: 600;
}

.grandfather-protection {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #10b981;
}

.protection-badge {
  font-size: 1.1rem;
  font-weight: 700;
  color: #065f46;
  margin-bottom: 0.5rem;
}

.protection-message {
  color: #047857;
  line-height: 1.6;
}

.protection-message strong {
  color: #064e3b;
}

/* プラン一覧セクション */
.plans-section {
  margin-bottom: 6rem;
}

.unified-plan-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.plan-section {
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

.plan-section.current-plan {
  border-color: #667eea;
  transform: scale(1.02);
}

.plan-section.free-plan {
  border-color: #e2e8f0;
}

.plan-section.paid-plan {
  border-color: #f59e0b;
}

.price-warning-inline {
  background: #fef3c7;
  color: #92400e;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  text-align: center;
  font-weight: 500;
}

@media (max-width: 768px) {
  .unified-plan-card {
    grid-template-columns: 1fr;
  }
  
  .price-value {
    font-size: 2.5rem;
  }
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
  .hero-content h1 {
    font-size: 2.5rem;
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
}

/* 全画面レイアウトスタイル */
.billing-layout {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(180deg, #fafbff 0%, #f3f4f6 100%);
}

.fullscreen-layout {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  overflow: hidden;
}

.fullscreen-content {
  width: 90%;
  max-width: 1200px;
  height: 90%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: fullscreenSlideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.fullscreen-header {
  padding: 2rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.8) 100%);
}

.fullscreen-title {
  font-size: 2rem;
  font-weight: 800;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.fullscreen-close {
  width: 48px;
  height: 48px;
  border: none;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.5rem;
  color: var(--text-secondary);
}

.fullscreen-close:hover {
  background: rgba(0, 0, 0, 0.2);
  transform: scale(1.1);
}

.fullscreen-body {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  overflow-x: hidden;
}

.fullscreen-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  height: 100%;
}

.fullscreen-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  height: fit-content;
}

.fullscreen-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
}

@keyframes fullscreenSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@media (max-width: 768px) {
  .fullscreen-content {
    width: 95%;
    height: 95%;
  }
  
  .fullscreen-header {
    padding: 1.5rem;
  }
  
  .fullscreen-title {
    font-size: 1.5rem;
  }
  
  .fullscreen-body {
    padding: 1.5rem;
  }
  
  .fullscreen-grid {
    grid-template-columns: 1fr;
  }
}</style>
