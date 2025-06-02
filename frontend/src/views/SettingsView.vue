<template>
  <div class="settings-view">
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
          <h1>アプリ <span class="gradient-text">設定</span></h1>
          <p class="hero-description">
            あなたのアカウント設定とアプリケーション設定をカスタマイズ。
            通知、外観、セキュリティ設定を管理して、最適な利用環境を構築しましょう。
          </p>
        </div>

        <div class="hero-visual">
          <div class="settings-phone-mockup">
            <div class="phone-screen">
              <div class="settings-header">
                <span class="settings-logo">⚙️ 設定</span>
                <span>👤</span>
              </div>
              <div class="settings-demo-content">
                <div class="demo-profile">
                  <div class="profile-avatar">👤</div>
                  <div class="profile-info">
                    <div class="profile-name">{{ authStore.userDisplayName }}</div>
                    <div class="profile-status">✅ 認証済み</div>
                  </div>
                </div>
                <div class="demo-settings">
                  <div class="setting-item">
                    <span class="setting-label">🔔 通知</span>
                    <span class="setting-toggle on">ON</span>
                  </div>
                  <div class="setting-item">
                    <span class="setting-label">🌙 ダークモード</span>
                    <span class="setting-toggle off">OFF</span>
                  </div>
                  <div class="setting-item">
                    <span class="setting-label">🔄 自動更新</span>
                    <span class="setting-toggle on">30秒</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="settings-content">
      <!-- ユーザー設定セクション -->
      <section class="user-settings-section">
        <div class="section-header">
          <h2 class="section-title">👤 ユーザー設定</h2>
          <p class="section-description">プロフィール情報とアカウント管理</p>
        </div>

        <div class="settings-grid">
          <!-- プロフィール情報 -->
          <div class="settings-card profile-card">
            <div class="profile-section">
              <div class="profile-avatar-large">
                <img 
                  v-if="authStore.userPhotoURL" 
                  :src="authStore.userPhotoURL" 
                  :alt="authStore.userDisplayName"
                  class="avatar-image"
                />
                <span v-else class="avatar-placeholder">👤</span>
              </div>
              
              <div class="profile-info">
                <h3 class="profile-name">{{ authStore.userDisplayName }}</h3>
                <p class="profile-email">{{ authStore.userEmail }}</p>
                <div class="profile-status">
                  <span class="status-badge verified">✅ 認証済み</span>
                </div>
              </div>
            </div>

            <div class="profile-actions">
              <button class="action-button logout" @click="handleLogout">
                🚪 ログアウト
              </button>
              <button class="action-button danger" @click="showDeleteDialog = true">
                🗑️ アカウント削除
              </button>
            </div>
          </div>

          <!-- アプリケーション設定 -->
          <div class="settings-card app-settings-card">
            <div class="settings-section">
              <h4 class="settings-section-title">🔔 通知設定</h4>
              
              <div class="settings-list">
                <div class="setting-item">
                  <div class="setting-info">
                    <div class="setting-name">投稿成功通知</div>
                    <div class="setting-description">投稿が正常に完了した時に通知</div>
                  </div>
                  <div class="setting-control">
                    <label class="switch">
                      <input 
                        type="checkbox" 
                        v-model="settings.notifications.postSuccess"
                        @change="saveSettings"
                      >
                      <span class="slider"></span>
                    </label>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <div class="setting-name">投稿失敗通知</div>
                    <div class="setting-description">投稿が失敗した時に通知</div>
                  </div>
                  <div class="setting-control">
                    <label class="switch">
                      <input 
                        type="checkbox" 
                        v-model="settings.notifications.postFailure"
                        @change="saveSettings"
                      >
                      <span class="slider"></span>
                    </label>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <div class="setting-name">システム通知</div>
                    <div class="setting-description">メンテナンスやアップデート情報</div>
                  </div>
                  <div class="setting-control">
                    <label class="switch">
                      <input 
                        type="checkbox" 
                        v-model="settings.notifications.system"
                        @change="saveSettings"
                      >
                      <span class="slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div class="settings-section">
              <h4 class="settings-section-title">⚙️ 一般設定</h4>
              
              <div class="settings-list">
                <div class="setting-item">
                  <div class="setting-info">
                    <div class="setting-name">ダークモード</div>
                    <div class="setting-description">画面テーマを切り替え</div>
                  </div>
                  <div class="setting-control">
                    <label class="switch">
                      <input 
                        type="checkbox" 
                        v-model="settings.appearance.darkMode"
                        @change="toggleDarkMode"
                      >
                      <span class="slider"></span>
                    </label>
                  </div>
                </div>

                <div class="setting-item">
                  <div class="setting-info">
                    <div class="setting-name">自動更新</div>
                    <div class="setting-description">データの自動更新間隔</div>
                  </div>
                  <div class="setting-control">
                    <select 
                      v-model="settings.general.autoRefresh" 
                      class="setting-select"
                      @change="saveSettings"
                    >
                      <option v-for="option in autoRefreshOptions" :key="option.value" :value="option.value">
                        {{ option.title }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div class="save-settings">
              <button 
                class="save-button" 
                @click="saveSettings"
                :disabled="savingSettings"
              >
                <span v-if="savingSettings">💾 保存中...</span>
                <span v-else>💾 設定を保存</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- プラン情報セクション -->
      <section class="plan-info-section">
        <div class="section-header">
          <h2 class="section-title">👑 プラン情報</h2>
        </div>

        <div class="plan-info-card">
          <div class="plan-details">
            <div class="plan-info">
              <h3 class="plan-name">{{ currentPlan.name }}プラン</h3>
              <p class="plan-price">
                {{ currentPlan.price === 0 ? '無料' : `月額 ¥${currentPlan.price.toLocaleString()}` }}
              </p>
            </div>
            <div class="plan-action">
              <router-link to="/billing" class="plan-button">
                プラン変更
              </router-link>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- アカウント削除確認ダイアログ -->
    <div v-if="showDeleteDialog" class="modal-overlay" @click="showDeleteDialog = false">
      <div class="delete-dialog" @click.stop>
        <div class="dialog-header">
          <h3 class="dialog-title">⚠️ アカウント削除の確認</h3>
        </div>
        
        <div class="dialog-content">
          <div class="warning-alert">
            <span class="warning-icon">⚠️</span>
            <span class="warning-text">この操作は取り消すことができません</span>
          </div>

          <p class="delete-message">
            アカウントを削除すると、以下のデータがすべて失われます：
          </p>

          <div class="delete-items">
            <div 
              v-for="item in deleteWarningItems" 
              :key="item" 
              class="delete-item"
            >
              <span class="item-icon">❌</span>
              <span class="item-text">{{ item }}</span>
            </div>
          </div>

          <div class="confirmation-input">
            <label class="input-label">確認のため「DELETE」と入力してください</label>
            <input 
              v-model="deleteConfirmation"
              type="text"
              class="delete-input"
              :class="{ 'error': deleteConfirmation !== '' && deleteConfirmation !== 'DELETE' }"
              placeholder="DELETE"
            >
          </div>
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
            @click="handleDeleteAccount"
            :disabled="deleteConfirmation !== 'DELETE' || deletingAccount"
          >
            <span v-if="deletingAccount">削除中...</span>
            <span v-else>完全削除</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '@/stores';

  const router = useRouter();
  const authStore = useAuthStore();

  // State
  const showDeleteDialog = ref(false);
  const deleteConfirmation = ref('');
  const deletingAccount = ref(false);
  const savingSettings = ref(false);

  // 設定データ
  const settings = reactive({
    notifications: {
      postSuccess: true,
      postFailure: true,
      system: true,
    },
    appearance: {
      darkMode: false,
    },
    general: {
      autoRefresh: 30,
    },
  });

  // 現在のプラン情報（仮）
  const currentPlan = ref({
    name: 'フリー',
    price: 0,
  });

  // 自動更新間隔オプション
  const autoRefreshOptions = [
    { title: '15秒', value: 15 },
    { title: '30秒', value: 30 },
    { title: '1分', value: 60 },
    { title: '5分', value: 300 },
    { title: '無効', value: 0 },
  ];

  // アカウント削除警告項目
  const deleteWarningItems = [
    'すべての予約投稿スケジュール',
    '連携しているInstagramアカウント情報',
    'コンテンツライブラリ',
    '投稿履歴とログ',
    'プラン・決済履歴',
    'アカウント設定',
  ];

  // Methods
  const handleLogout = async () => {
    try {
      await authStore.logout();
      router.push('/');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      deletingAccount.value = true;

      // TODO: バックエンドAPIでアカウント削除
      // await deleteUserAccount()

      // ダミー処理（実際はAPIを呼び出す）
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('アカウント削除処理完了');

      // ログアウトしてホームページへ
      await authStore.logout();
      router.push('/');
    } catch (error) {
      console.error('アカウント削除エラー:', error);
    } finally {
      deletingAccount.value = false;
      showDeleteDialog.value = false;
      deleteConfirmation.value = '';
    }
  };

  const saveSettings = async () => {
    try {
      savingSettings.value = true;

      // TODO: バックエンドAPIで設定保存
      // await saveUserSettings(settings)

      // ダミー処理（実際はAPIを呼び出す）
      await new Promise(resolve => setTimeout(resolve, 1000));

      // ローカルストレージに保存（仮）
      localStorage.setItem('omniy-settings', JSON.stringify(settings));

      console.log('設定保存完了:', settings);
    } catch (error) {
      console.error('設定保存エラー:', error);
    } finally {
      savingSettings.value = false;
    }
  };

  const toggleDarkMode = () => {
    // TODO: ダークモード実装
    saveSettings();
  };

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('omniy-settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        Object.assign(settings, parsed);
      }
    } catch (error) {
      console.error('設定読み込みエラー:', error);
    }
  };

  // プラン情報取得
  const loadPlanInfo = async () => {
    try {
      // TODO: バックエンドAPIでプラン情報取得
      // const planInfo = await getCurrentPlan()
      // currentPlan.value = planInfo

      // 仮データ
      currentPlan.value = {
        name: 'フリー',
        price: 0,
      };
    } catch (error) {
      console.error('プラン情報取得エラー:', error);
    }
  };

  // Lifecycle
  onMounted(async () => {
    loadSettings();
    await loadPlanInfo();
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

.settings-view {
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

/* 設定モックアップ */
.hero-visual {
  position: relative;
}

.settings-phone-mockup {
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

.settings-header {
  padding: 1rem;
  border-bottom: 1px solid #efefef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.settings-logo {
  font-size: 1.2rem;
  font-weight: 600;
}

.settings-demo-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.demo-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-light);
  border-radius: 12px;
}

.profile-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.profile-status {
  font-size: 0.8rem;
  color: #065f46;
}

.demo-settings {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--bg-light);
  border-radius: 8px;
}

.setting-label {
  font-size: 0.8rem;
  color: var(--text-primary);
}

.setting-toggle {
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 600;
}

.setting-toggle.on {
  background: #d1fae5;
  color: #065f46;
}

.setting-toggle.off {
  background: #fee2e2;
  color: #991b1b;
}

/* メインコンテンツ */
.settings-content {
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

/* ユーザー設定セクション */
.user-settings-section {
  margin-bottom: 6rem;
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.settings-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.settings-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

/* プロフィールカード */
.profile-card {
  display: flex;
  flex-direction: column;
  text-align: center;
}

.profile-section {
  margin-bottom: 2rem;
}

.profile-avatar-large {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin: 0 auto 1rem;
  overflow: hidden;
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 3rem;
  color: white;
}

.profile-info {
  margin-bottom: 1.5rem;
}

.profile-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.profile-email {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.verified {
  background: #d1fae5;
  color: #065f46;
}

.profile-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: auto;
}

.action-button {
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.action-button.logout {
  background: var(--accent-gradient);
  color: white;
}

.action-button.danger {
  background: var(--bg-light);
  color: var(--text-secondary);
  border: 2px solid #e2e8f0;
}

.action-button:hover {
  transform: translateY(-2px);
}

.action-button.logout:hover {
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
}

.action-button.danger:hover {
  border-color: #f56565;
  color: #e53e3e;
}

/* アプリ設定カード */
.app-settings-card {
  display: flex;
  flex-direction: column;
}

.settings-section {
  margin-bottom: 2rem;
}

.settings-section-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  background: var(--bg-light);
  border-radius: 12px;
  gap: 1rem;
}

.setting-info {
  flex: 1;
}

.setting-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.setting-description {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.setting-control {
  flex-shrink: 0;
}

/* カスタムスイッチ */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #e2e8f0;
  transition: 0.4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background: var(--primary-gradient);
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.setting-select {
  padding: 0.5rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: var(--text-primary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.setting-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.save-settings {
  margin-top: auto;
}

.save-button {
  width: 100%;
  padding: 1rem 2rem;
  background: var(--success-gradient);
  color: white;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.save-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(67, 233, 123, 0.3);
}

.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* プラン情報セクション */
.plan-info-section {
  margin-bottom: 4rem;
}

.plan-info-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
  border: 2px solid #667eea;
}

.plan-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plan-info {
  flex: 1;
}

.plan-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.plan-price {
  font-size: 1.1rem;
  color: var(--text-secondary);
}

.plan-action {
  flex-shrink: 0;
}

.plan-button {
  background: var(--primary-gradient);
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 25px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-block;
}

.plan-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
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
  background: #fee2e2;
}

.dialog-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #991b1b;
  margin: 0;
}

.dialog-content {
  padding: 1.5rem;
}

.warning-alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #fee2e2;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.warning-icon {
  font-size: 1.2rem;
}

.warning-text {
  color: #991b1b;
  font-weight: 600;
}

.delete-message {
  color: var(--text-primary);
  margin-bottom: 1rem;
  line-height: 1.6;
}

.delete-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.delete-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: var(--bg-light);
  border-radius: 8px;
}

.item-icon {
  font-size: 1rem;
}

.item-text {
  color: var(--text-primary);
  font-size: 0.9rem;
}

.confirmation-input {
  margin-bottom: 1rem;
}

.input-label {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.delete-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.delete-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.delete-input.error {
  border-color: #f56565;
  box-shadow: 0 0 0 3px rgba(245, 101, 101, 0.1);
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

  .settings-phone-mockup {
    width: 280px;
    height: 560px;
  }

  .nav-links {
    display: none;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }

  .plan-details {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .section-title {
    font-size: 2rem;
  }
}
</style>