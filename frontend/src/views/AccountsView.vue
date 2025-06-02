<template>
  <div class="accounts-view">
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
          <h1>Instagram <span class="gradient-text">アカウント管理</span></h1>
          <p class="hero-description">
            複数のInstagramアカウントを安全に一元管理。
            トークンの有効期限を自動監視し、最適なアカウント運用をサポートします。
          </p>
          <div class="hero-actions">
            <button class="cta-button primary" @click="showAddDialog = true">
              📱 新しいアカウントを追加
            </button>
          </div>
        </div>

        <div class="hero-visual">
          <div class="accounts-phone-mockup">
            <div class="phone-screen">
              <div class="accounts-header">
                <span class="accounts-logo">📱 アカウント</span>
                <span>⚙️</span>
              </div>
              <div class="accounts-demo-content">
                <div class="demo-account-item">
                  <div class="account-avatar">📷</div>
                  <div class="account-info">
                    <div class="account-username">@your_account</div>
                    <div class="account-status active">✅ アクティブ</div>
                  </div>
                </div>
                <div class="demo-account-item">
                  <div class="account-avatar">📸</div>
                  <div class="account-info">
                    <div class="account-username">@business_acc</div>
                    <div class="account-status warning">⚠️ 期限間近</div>
                  </div>
                </div>
                <div class="demo-account-item">
                  <div class="account-avatar">🏪</div>
                  <div class="account-info">
                    <div class="account-username">@shop_official</div>
                    <div class="account-status active">✅ アクティブ</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="accounts-content">
      <!-- 統計情報セクション -->
      <section class="stats-section">
        <div class="section-header">
          <h2 class="section-title">📊 アカウント統計</h2>
          <p class="section-description">連携中のInstagramアカウントの状況をひと目で確認</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card gradient-primary">
            <div class="stat-icon">📱</div>
            <div class="stat-content">
              <div class="stat-value">{{ igAccountsStore.accountsCount }}</div>
              <div class="stat-title">連携アカウント</div>
              <div class="stat-trend">
                <span class="trend-positive">総アカウント数</span>
              </div>
            </div>
          </div>

          <div class="stat-card gradient-success">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <div class="stat-value">{{ activeAccountsCount }}</div>
              <div class="stat-title">アクティブ</div>
              <div class="stat-trend">
                <span class="trend-positive">正常動作中</span>
              </div>
            </div>
          </div>

          <div class="stat-card gradient-warning">
            <div class="stat-icon">⚠️</div>
            <div class="stat-content">
              <div class="stat-value">{{ expiringSoonCount }}</div>
              <div class="stat-title">期限間近</div>
              <div class="stat-trend">
                <span class="trend-negative">要更新</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- アカウント一覧セクション -->
      <section class="accounts-list-section">
        <div class="section-header">
          <h2 class="section-title">📋 連携アカウント一覧</h2>
        </div>

        <!-- エラー表示 -->
        <div v-if="igAccountsStore.error" class="error-alert">
          <div class="error-content">
            <span class="error-icon">⚠️</span>
            <span class="error-text">{{ igAccountsStore.error }}</span>
            <button class="error-close" @click="igAccountsStore.clearError">✕</button>
          </div>
        </div>

        <!-- アカウント一覧 -->
        <div v-if="igAccountsStore.accountsCount > 0" class="accounts-grid">
          <div
            v-for="account in igAccountsStore.accounts"
            :key="account.id"
            class="account-card"
          >
            <!-- アカウント情報ヘッダー -->
            <div class="account-header">
              <div class="account-avatar-section">
                <div class="instagram-icon">📷</div>
                <div class="account-details">
                  <h3 class="account-username">@{{ account.username }}</h3>
                  <div class="account-id">ID: {{ account.instagramUserId }}</div>
                </div>
              </div>
              <div class="account-status-badge" :class="`status-${getTokenStatusColor(account)}`">
                {{ getTokenStatusIcon(account) }} {{ getTokenStatusText(account) }}
              </div>
            </div>

            <!-- トークン有効期限情報 -->
            <div class="token-info">
              <div class="token-header">
                <span class="token-label">🔑 トークン有効期限</span>
                <span class="token-date">{{ formatDate(account.tokenExpiresAt) }}</span>
              </div>
              <div class="token-progress">
                <div 
                  class="progress-bar" 
                  :class="`progress-${getTokenStatusColor(account)}`"
                  :style="{ width: `${getTokenProgress(account)}%` }"
                ></div>
              </div>
              <div class="token-days">
                {{ getDaysUntilExpiry(account) }}日残り
              </div>
            </div>

            <!-- メタ情報 -->
            <div class="account-meta">
              <div class="meta-item">
                <span class="meta-label">📅 追加日:</span>
                <span class="meta-value">{{ formatDate(account.createdAt) }}</span>
              </div>
            </div>

            <!-- アクション -->
            <div class="account-actions">
              <button 
                class="action-button refresh"
                @click="refreshToken(account)"
                :disabled="igAccountsStore.loading"
                title="トークン更新"
              >
                <span v-if="igAccountsStore.loading">🔄</span>
                <span v-else>🔃</span>
                更新
              </button>
              <button 
                class="action-button delete"
                @click="confirmDelete(account)"
                title="アカウント削除"
              >
                🗑️ 削除
              </button>
            </div>
          </div>
        </div>

        <!-- 空の状態 -->
        <div 
          v-else-if="!igAccountsStore.loading && igAccountsStore.accountsCount === 0" 
          class="empty-state"
        >
          <div class="empty-icon">📱</div>
          <div class="empty-title">Instagramアカウントがありません</div>
          <div class="empty-description">
            最初のアカウントを追加して、Instagram予約投稿を始めましょう！<br>
            安全な公式API連携で、複数アカウントを簡単に管理できます。
          </div>
          <button class="cta-button primary" @click="showAddDialog = true">
            📱 最初のアカウントを追加
          </button>
        </div>
      </section>
    </div>

    <!-- アカウント追加ダイアログ -->
    <AddAccountDialog v-model="showAddDialog" @added="handleAccountAdded" />

    <!-- 削除確認ダイアログ -->
    <div v-if="showDeleteDialog" class="modal-overlay" @click="showDeleteDialog = false">
      <div class="delete-dialog" @click.stop>
        <div class="dialog-header">
          <h3 class="dialog-title">アカウント削除</h3>
        </div>
        <div class="dialog-content">
          <p class="dialog-message">
            Instagramアカウント「@{{ deletingAccount?.username }}」を削除しますか？<br><br>
            <strong class="warning-text">⚠️ 注意:</strong><br>
            このアカウントに関連する予約投稿も削除されます。<br>
            この操作は取り消せません。
          </p>
        </div>
        <div class="dialog-actions">
          <button 
            class="dialog-button secondary" 
            @click="showDeleteDialog = false"
          >
            キャンセル
          </button>
          <button 
            class="dialog-button danger" 
            @click="handleDelete"
            :disabled="igAccountsStore.loading"
          >
            <span v-if="igAccountsStore.loading">削除中...</span>
            <span v-else>削除</span>
          </button>
        </div>
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
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useIgAccountsStore, type IGAccount } from '@/stores';
  import { format, differenceInDays } from 'date-fns';
  import { ja } from 'date-fns/locale';
  import { AddAccountDialog } from '@/components';

  const igAccountsStore = useIgAccountsStore();

  // State
  const showAddDialog = ref(false);
  const showDeleteDialog = ref(false);
  const deletingAccount = ref<IGAccount | null>(null);
  const showSuccess = ref(false);
  const successMessage = ref('');

  // Computed
  const showError = computed({
    get: () => !!igAccountsStore.error,
    set: () => igAccountsStore.clearError(),
  });

  const activeAccountsCount = computed(() => {
    return igAccountsStore.accounts.filter(account => {
      const daysUntilExpiry = differenceInDays(
        account.tokenExpiresAt,
        new Date()
      );
      return daysUntilExpiry > 7;
    }).length;
  });

  const expiringSoonCount = computed(() => {
    return igAccountsStore.accounts.filter(account => {
      const daysUntilExpiry = differenceInDays(
        account.tokenExpiresAt,
        new Date()
      );
      return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    }).length;
  });

  // Methods
  const formatDate = (date: Date) => {
    return format(date, 'yyyy/MM/dd HH:mm', { locale: ja });
  };

  const getTokenStatusColor = (account: IGAccount) => {
    const daysUntilExpiry = differenceInDays(
      account.tokenExpiresAt,
      new Date()
    );

    if (daysUntilExpiry <= 0) return 'error';
    if (daysUntilExpiry <= 7) return 'warning';
    if (daysUntilExpiry <= 30) return 'info';
    return 'success';
  };

  const getTokenStatusText = (account: IGAccount) => {
    const daysUntilExpiry = differenceInDays(
      account.tokenExpiresAt,
      new Date()
    );

    if (daysUntilExpiry <= 0) return '期限切れ';
    if (daysUntilExpiry <= 7) return '期限間近';
    if (daysUntilExpiry <= 30) return '要注意';
    return 'アクティブ';
  };

  const getTokenProgress = (account: IGAccount) => {
    const totalDays = 60; // 60日間有効
    const daysUntilExpiry = differenceInDays(
      account.tokenExpiresAt,
      new Date()
    );
    const progress = Math.max(
      0,
      Math.min(100, (daysUntilExpiry / totalDays) * 100)
    );
    return progress;
  };

  const refreshToken = async (account: IGAccount) => {
    try {
      await igAccountsStore.refreshToken(account.id);
      successMessage.value = `@${account.username} のトークンを更新しました`;
      showSuccess.value = true;
    } catch (error) {
      console.error('トークン更新エラー:', error);
    }
  };

  const confirmDelete = (account: IGAccount) => {
    deletingAccount.value = account;
    showDeleteDialog.value = true;
  };

  const handleDelete = async () => {
    if (deletingAccount.value) {
      try {
        await igAccountsStore.deleteAccount(deletingAccount.value.id);
        successMessage.value = `@${deletingAccount.value.username} を削除しました`;
        showSuccess.value = true;
        showDeleteDialog.value = false;
        deletingAccount.value = null;
      } catch (error) {
        console.error('削除エラー:', error);
      }
    }
  };

  const handleAccountAdded = () => {
    successMessage.value = 'Instagram アカウントを追加しました';
    showSuccess.value = true;
  };

  const getTokenStatusIcon = (account: IGAccount) => {
    const daysUntilExpiry = differenceInDays(
      account.tokenExpiresAt,
      new Date()
    );

    if (daysUntilExpiry <= 0) return '❌';
    if (daysUntilExpiry <= 7) return '⚠️';
    if (daysUntilExpiry <= 30) return '⏰';
    return '✅';
  };

  const getDaysUntilExpiry = (account: IGAccount) => {
    const days = differenceInDays(
      account.tokenExpiresAt,
      new Date()
    );
    return Math.max(0, days);
  };

  // Lifecycle
  onMounted(async () => {
    await igAccountsStore.loadAccounts();
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

.accounts-view {
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

.hero-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 3rem;
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

/* アカウントモックアップ */
.hero-visual {
  position: relative;
}

.accounts-phone-mockup {
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

.accounts-header {
  padding: 1rem;
  border-bottom: 1px solid #efefef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.accounts-logo {
  font-size: 1.2rem;
  font-weight: 600;
}

.accounts-demo-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.demo-account-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-light);
  border-radius: 12px;
}

.account-avatar {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
}

.account-info {
  flex: 1;
}

.account-username {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.account-status {
  font-size: 0.8rem;
}

.account-status.active {
  color: #065f46;
}

.account-status.warning {
  color: #92400e;
}

/* メインコンテンツ */
.accounts-content {
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

/* 統計セクション */
.stats-section {
  margin-bottom: 6rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.stat-card {
  background: white;
  padding: 2rem;
  border-radius: 20px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.gradient-primary { background: var(--primary-gradient); }
.gradient-success { background: var(--success-gradient); }
.gradient-warning { background: var(--warning-gradient); color: var(--text-primary); }

.stat-icon {
  font-size: 2rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 1rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
}

.stat-title {
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
}

.stat-trend {
  font-size: 0.8rem;
  opacity: 0.8;
}

/* エラー表示 */
.error-alert {
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 2rem;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.error-icon {
  font-size: 1.5rem;
  color: #dc2626;
}

.error-text {
  flex: 1;
  color: #991b1b;
  font-weight: 500;
}

.error-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #991b1b;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.error-close:hover {
  background: rgba(185, 28, 28, 0.1);
}

/* アカウント一覧 */
.accounts-list-section {
  margin-bottom: 4rem;
}

.accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.account-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.account-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.account-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.account-avatar-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.instagram-icon {
  font-size: 2.5rem;
  background: var(--secondary-gradient);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.account-details {
  flex: 1;
}

.account-username {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.account-id {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.account-status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.account-status-badge.status-success {
  background: #d1fae5;
  color: #065f46;
}

.account-status-badge.status-warning {
  background: #fef3c7;
  color: #92400e;
}

.account-status-badge.status-error {
  background: #fee2e2;
  color: #991b1b;
}

.account-status-badge.status-info {
  background: #dbeafe;
  color: #1e40af;
}

/* トークン情報 */
.token-info {
  margin-bottom: 1.5rem;
}

.token-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.token-label {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.token-date {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.token-progress {
  background: #e2e8f0;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-bar.progress-success {
  background: var(--success-gradient);
}

.progress-bar.progress-warning {
  background: var(--warning-gradient);
}

.progress-bar.progress-error {
  background: var(--secondary-gradient);
}

.progress-bar.progress-info {
  background: var(--accent-gradient);
}

.token-days {
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-align: right;
}

/* メタ情報 */
.account-meta {
  margin-bottom: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.meta-item {
  display: flex;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.meta-label {
  color: var(--text-secondary);
}

.meta-value {
  color: var(--text-primary);
  font-weight: 500;
}

/* アクション */
.account-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.action-button {
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.action-button.refresh {
  background: var(--accent-gradient);
  color: white;
}

.action-button.delete {
  background: var(--bg-light);
  color: var(--text-secondary);
  border: 2px solid #e2e8f0;
}

.action-button:hover {
  transform: translateY(-2px);
}

.action-button.refresh:hover {
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
}

.action-button.delete:hover {
  border-color: #f56565;
  color: #e53e3e;
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* 空の状態 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: var(--shadow-md);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.empty-description {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
}

/* 削除ダイアログ */
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

.delete-dialog {
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
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

.warning-text {
  color: #e53e3e;
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
  background: var(--secondary-gradient);
  color: white;
}

.dialog-button.danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(240, 147, 251, 0.3);
}

.dialog-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* 成功通知 */
.success-notification {
  position: fixed;
  top: 100px;
  right: 2rem;
  z-index: 3000;
  animation: slideIn 0.3s ease-out;
}

.notification-content {
  background: #d1fae5;
  border: 1px solid #a7f3d0;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: var(--shadow-md);
}

.notification-icon {
  font-size: 1.2rem;
  color: #065f46;
}

.notification-text {
  color: #065f46;
  font-weight: 500;
}

.notification-close {
  background: none;
  border: none;
  font-size: 1.1rem;
  color: #065f46;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.notification-close:hover {
  background: rgba(6, 95, 70, 0.1);
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

  .accounts-phone-mockup {
    width: 280px;
    height: 560px;
  }

  .nav-links {
    display: none;
  }

  .stats-grid,
  .accounts-grid {
    grid-template-columns: 1fr;
  }

  .account-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .account-actions {
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .section-title {
    font-size: 2rem;
  }

  .success-notification {
    right: 1rem;
    left: 1rem;
  }
}</style>
