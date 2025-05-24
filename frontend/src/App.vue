<template>
  <v-app>
    <!-- 💫 モダンナビゲーションドロワー -->
    <v-navigation-drawer
      v-if="authStore.isAuthenticated"
      v-model="drawer"
      app
      temporary
      width="320"
      class="elegant-drawer"
    >
      <!-- 👤 ユーザープロフィールセクション -->
      <div class="user-profile-section">
        <div class="gradient-background">
          <v-avatar
            size="72"
            class="profile-avatar"
          >
            <v-img
              v-if="authStore.userPhotoURL"
              :src="authStore.userPhotoURL"
              :alt="authStore.userDisplayName"
            />
            <v-icon v-else size="40" color="white">mdi-account-circle</v-icon>
          </v-avatar>
          
          <div class="profile-info">
            <h3 class="user-name">{{ authStore.userDisplayName }}</h3>
            <p class="user-email">{{ authStore.userEmail }}</p>
          </div>
        </div>
      </div>

      <v-divider class="mx-4" />

      <!-- 📱 ナビゲーションメニュー -->
      <v-list class="navigation-menu" nav>
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :prepend-icon="item.icon"
          :title="item.title"
          :subtitle="item.subtitle"
          :to="item.to"
          class="nav-item"
          color="primary"
          rounded="xl"
        >
          <template #append>
            <v-icon
              v-if="item.badge"
              :icon="item.badgeIcon"
              size="12"
              :color="item.badgeColor"
            />
          </template>
        </v-list-item>
      </v-list>

      <!-- 🎯 プラン情報カード -->
      <div class="plan-card-section">
        <v-card
          class="plan-upgrade-card"
          variant="tonal"
          color="primary"
          rounded="xl"
        >
          <v-card-text class="pa-4">
            <div class="d-flex align-center">
              <v-icon icon="mdi-crown" color="primary" size="24" class="mr-3" />
              <div>
                <div class="text-subtitle-2 font-weight-bold">フリープラン</div>
                <div class="text-caption">アップグレードしませんか？</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </v-navigation-drawer>

    <!-- 🎨 グラデーションアプリバー -->
    <v-app-bar 
      app 
      class="elegant-app-bar"
      :style="appBarStyle"
      flat
    >
      <v-app-bar-nav-icon
        v-if="authStore.isAuthenticated"
        @click="drawer = !drawer"
        class="nav-icon"
      />
      
      <!-- 🌟 ブランドロゴ -->
      <v-toolbar-title class="brand-title">
        <router-link to="/" class="brand-link">
          <div class="d-flex align-center">
            <v-icon icon="mdi-instagram" size="28" class="mr-2" />
            <span class="brand-text">Omniy</span>
          </div>
        </router-link>
      </v-toolbar-title>

      <v-spacer />

      <!-- 📊 クイック統計（認証済みユーザー） -->
      <template v-if="authStore.isAuthenticated">
        <div class="quick-stats d-none d-md-flex mr-4">
          <v-chip
            variant="outlined"
            color="white"
            size="small"
            class="mr-2"
          >
            <v-icon icon="mdi-calendar-clock" size="16" class="mr-1" />
            アクティブ予約 3
          </v-chip>
        </div>

        <!-- 🔔 通知ボタン -->
        <v-btn
          icon
          size="small"
          class="notification-btn mr-2"
          @click="showNotifications = !showNotifications"
        >
          <v-badge
            :content="notificationCount"
            :model-value="notificationCount > 0"
            color="error"
            floating
          >
            <v-icon color="white">mdi-bell</v-icon>
          </v-badge>
        </v-btn>

        <!-- 👤 ユーザーメニュー -->
        <v-menu offset-y>
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              icon
              size="small"
              class="user-menu-btn"
            >
              <v-avatar size="36" class="user-avatar">
                <v-img
                  v-if="authStore.userPhotoURL"
                  :src="authStore.userPhotoURL"
                  :alt="authStore.userDisplayName"
                />
                <v-icon v-else color="primary">mdi-account-circle</v-icon>
              </v-avatar>
            </v-btn>
          </template>
          
          <v-card class="user-menu-card" width="240">
            <v-list>
              <v-list-item
                prepend-icon="mdi-cog"
                title="設定"
                subtitle="アカウント設定"
                to="/settings"
                class="menu-item"
              />
              <v-list-item
                prepend-icon="mdi-help-circle"
                title="ヘルプ"
                subtitle="使い方ガイド"
                class="menu-item"
              />
              <v-divider class="my-2" />
              <v-list-item
                prepend-icon="mdi-logout"
                title="ログアウト"
                @click="handleLogout"
                class="menu-item logout-item"
              />
            </v-list>
          </v-card>
        </v-menu>
      </template>

      <!-- 🔐 未認証ユーザーボタン -->
      <template v-else>
        <v-btn
          variant="elevated"
          color="white"
          to="/login"
          class="login-btn"
          rounded="xl"
        >
          <v-icon icon="mdi-login" class="mr-2" />
          ログイン
        </v-btn>
      </template>
    </v-app-bar>

    <!-- 🌊 メインコンテンツ -->
    <v-main class="main-content">
      <div class="content-wrapper">
        <router-view />
      </div>
    </v-main>

    <!-- 🎪 モダンフッター -->
    <v-footer class="elegant-footer">
      <div class="footer-content">
        <div class="footer-text">
          © 2024 Omniy. Made with ❤️ for Instagram creators
        </div>
        <div class="footer-links">
          <a href="#" class="footer-link">プライバシー</a>
          <a href="#" class="footer-link">利用規約</a>
          <a href="#" class="footer-link">サポート</a>
        </div>
      </div>
    </v-footer>

    <!-- 🚨 エレガントエラースナックバー -->
    <v-snackbar
      v-model="showError"
      color="error"
      timeout="6000"
      location="top"
      class="elegant-snackbar"
      rounded="xl"
    >
      <div class="d-flex align-center">
        <v-icon icon="mdi-alert-circle" class="mr-3" />
        <div>
          <div class="font-weight-bold">エラーが発生しました</div>
          <div class="text-caption">{{ authStore.error }}</div>
        </div>
      </div>
      <template #actions>
        <v-btn
          variant="text"
          color="white"
          @click="authStore.clearError"
          rounded="xl"
        >
          閉じる
        </v-btn>
      </template>
    </v-snackbar>

    <!-- 🔔 通知パネル -->
    <v-overlay
      v-model="showNotifications"
      class="notification-overlay"
      @click="showNotifications = false"
    >
      <v-card
        class="notification-panel"
        width="360"
        rounded="xl"
        @click.stop
      >
        <v-card-title class="text-h6">
          <v-icon icon="mdi-bell" class="mr-2" />
          通知
        </v-card-title>
        <v-card-text>
          <div class="text-center text-grey-darken-1 py-8">
            新しい通知はありません
          </div>
        </v-card-text>
      </v-card>
    </v-overlay>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// State
const drawer = ref(false)
const showNotifications = ref(false)
const notificationCount = ref(2)

// Computed
const showError = computed({
  get: () => !!authStore.error,
  set: () => authStore.clearError()
})

// 🎨 Instagram風グラデーションスタイル
const appBarStyle = computed(() => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
}))

// メニューアイテム（拡張版）
const menuItems = [
  { 
    title: 'ダッシュボード', 
    subtitle: '全体概要', 
    icon: 'mdi-view-dashboard', 
    to: '/dashboard',
    badge: false
  },
  { 
    title: '予約投稿', 
    subtitle: 'スケジュール管理', 
    icon: 'mdi-calendar-clock', 
    to: '/schedules',
    badge: true,
    badgeIcon: 'mdi-circle',
    badgeColor: 'success'
  },
  { 
    title: 'アカウント管理', 
    subtitle: 'Instagram連携', 
    icon: 'mdi-instagram', 
    to: '/accounts',
    badge: false
  },
  { 
    title: 'コンテンツ', 
    subtitle: '投稿ライブラリ', 
    icon: 'mdi-image-multiple', 
    to: '/content',
    badge: false
  },
  { 
    title: 'プロキシ管理', 
    subtitle: 'サーバー設定', 
    icon: 'mdi-server-network', 
    to: '/proxies',
    badge: false
  },
  { 
    title: 'グループ管理', 
    subtitle: 'アカウントグループ', 
    icon: 'mdi-account-group', 
    to: '/groups',
    badge: false
  },
  { 
    title: 'ログダッシュボード', 
    subtitle: '実行履歴・統計', 
    icon: 'mdi-chart-line', 
    to: '/logs',
    badge: false
  },
  { 
    title: 'カレンダー', 
    subtitle: '投稿スケジュール', 
    icon: 'mdi-calendar', 
    to: '/calendar',
    badge: false
  },
  { 
    title: '料金プラン', 
    subtitle: 'プラン・使用量', 
    icon: 'mdi-crown', 
    to: '/billing',
    badge: false
  }
]

// Methods
const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/')
  } catch (error) {
    console.error('ログアウトエラー:', error)
  }
}

// Lifecycle
onMounted(async () => {
  if (!authStore.isInitialized) {
    await authStore.initializeAuth()
  }
})
</script>

<style scoped>
/* 🎨 モダンデザインシステム */

/* ナビゲーションドロワー */
.elegant-drawer {
  backdrop-filter: blur(20px);
  border-radius: 0 24px 24px 0 !important;
}

.user-profile-section {
  padding: 24px 20px 16px;
}

.gradient-background {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 20px;
  color: white;
  text-align: center;
}

.profile-avatar {
  margin-bottom: 12px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.user-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 4px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-email {
  font-size: 0.9rem;
  opacity: 0.9;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.navigation-menu {
  padding: 16px;
}

.nav-item {
  margin-bottom: 8px;
  border-radius: 16px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.plan-card-section {
  padding: 16px;
  margin-top: auto;
}

.plan-upgrade-card {
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease;
}

.plan-upgrade-card:hover {
  transform: scale(1.02);
}

/* アプリバー */
.elegant-app-bar {
  backdrop-filter: blur(20px);
}

.brand-link {
  text-decoration: none;
  color: white;
  transition: transform 0.3s ease;
}

.brand-link:hover {
  transform: scale(1.05);
}

.brand-text {
  font-weight: 700;
  font-size: 1.6rem;
  background: linear-gradient(45deg, #fff, #f8f9fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-icon {
  color: white;
  transition: transform 0.3s ease;
}

.nav-icon:hover {
  transform: rotate(90deg);
}

.quick-stats {
  animation: fadeInUp 0.6s ease-out;
}

.notification-btn {
  color: white;
  transition: transform 0.3s ease;
}

.notification-btn:hover {
  transform: scale(1.1);
}

.user-avatar {
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: transform 0.3s ease;
}

.user-menu-btn:hover .user-avatar {
  transform: scale(1.1);
}

.login-btn {
  color: #667eea !important;
  font-weight: 600;
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

/* メインコンテンツ */
.main-content {
  background: linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%);
  min-height: 100vh;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

/* フッター */
.elegant-footer {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 32px 0;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.footer-text {
  font-weight: 500;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.footer-links {
  display: flex;
  gap: 24px;
}

.footer-link {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.footer-link:hover {
  color: white;
  transform: translateY(-2px);
}

/* ユーザーメニュー */
.user-menu-card {
  border-radius: 16px !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
  backdrop-filter: blur(20px);
}

.menu-item {
  border-radius: 12px;
  margin: 4px 8px;
  transition: all 0.3s ease;
}

.menu-item:hover {
  background: rgba(102, 126, 234, 0.08);
  transform: translateX(4px);
}

.logout-item:hover {
  background: rgba(244, 67, 54, 0.08);
  color: #f44336;
}

/* エラースナックバー */
.elegant-snackbar {
  backdrop-filter: blur(20px);
}

/* 通知パネル */
.notification-overlay {
  backdrop-filter: blur(20px);
}

.notification-panel {
  border-radius: 16px !important;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* アニメーション */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* レスポンシブ */
@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    text-align: center;
  }
  
  .brand-text {
    font-size: 1.4rem;
  }
  
  .content-wrapper {
    padding: 16px;
  }
}

/* ダークテーマ対応 */
@media (prefers-color-scheme: dark) {
  .main-content {
    background: linear-gradient(180deg, #1a1a1a 0%, #000000 100%);
  }
}
</style> 