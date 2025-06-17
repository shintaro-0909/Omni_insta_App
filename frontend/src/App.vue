<template>
  <!-- エミュレーターバナー -->
  <EmulatorBanner />
  
  <v-app v-if="!isLandingPage">
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
          <v-avatar size="72" class="profile-avatar">
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
    <v-app-bar app class="elegant-app-bar" :style="appBarStyle" flat>
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

      <!-- 🌍 言語切り替え（1人運営では非表示）-->
      <LanguageSwitcher
        v-if="isFeatureEnabled('MULTI_LANGUAGE')"
        compact
        class="mr-2"
      />

      <!-- 📊 クイック統計（MVP では非表示） -->
      <template
        v-if="
          authStore.isAuthenticated && isFeatureEnabled('PERFORMANCE_METRICS')
        "
      >
        <div class="quick-stats d-none d-md-flex mr-4">
          <v-chip variant="outlined" color="white" size="small" class="mr-2">
            <v-icon icon="mdi-calendar-clock" size="16" class="mr-1" />
            アクティブ 3
          </v-chip>
        </div>
      </template>

      <template v-if="authStore.isAuthenticated">
        <!-- 🔔 通知ボタン（1人運営では非表示） -->
        <v-btn
          v-if="isFeatureEnabled('ADVANCED_NOTIFICATIONS')"
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
            <v-btn v-bind="props" icon size="small" class="user-menu-btn">
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

    <!-- 🔔 統合通知システム -->
    <v-snackbar
      v-for="notification in notificationsStore.activeNotifications"
      :key="notification.id"
      :model-value="true"
      :color="getNotificationColor(notification.type)"
      :timeout="notification.timeout"
      location="top"
      class="elegant-notification"
      :class="`notification-${notification.type}`"
      rounded="xl"
      multi-line
    >
      <div class="d-flex align-center">
        <v-icon :icon="getNotificationIcon(notification.type)" class="mr-3" />
        <div class="notification-content">
          <div class="font-weight-bold">{{ notification.title }}</div>
          <div v-if="notification.message" class="text-caption">
            {{ notification.message }}
          </div>
        </div>
      </div>
      
      <!-- カスタムアクション -->
      <template v-if="notification.actions && notification.actions.length > 0" #actions>
        <v-btn
          v-for="action in notification.actions"
          :key="action.label"
          variant="text"
          :color="action.color || 'white'"
          @click="action.action"
          rounded="xl"
          size="small"
          class="mr-2"
        >
          {{ action.label }}
        </v-btn>
      </template>
      
      <!-- デフォルトクローズボタン -->
      <template v-else #actions>
        <v-btn
          variant="text"
          color="white"
          @click="notificationsStore.removeNotification(notification.id)"
          rounded="xl"
          size="small"
        >
          閉じる
        </v-btn>
      </template>
    </v-snackbar>

    <!-- 🚨 レガシーエラー通知（後方互換性） -->
    <v-snackbar
      v-if="showError && !notificationsStore.hasNotifications"
      v-model="showError"
      color="error"
      timeout="6000"
      location="top"
      class="elegant-snackbar legacy-error"
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

    <!-- ❓ 確認ダイアログシステム -->
    <v-dialog
      v-model="dialogsStore.isConfirmDialogOpen"
      max-width="480"
      :persistent="dialogsStore.confirmDialog?.persistent"
      class="confirm-dialog"
    >
      <v-card
        v-if="dialogsStore.confirmDialog"
        rounded="xl"
        class="elegant-confirm-dialog"
        :class="{ 'danger-dialog': dialogsStore.confirmDialog.danger }"
      >
        <!-- ヘッダー -->
        <v-card-title class="dialog-header">
          <div class="d-flex align-center">
            <v-icon
              v-if="dialogsStore.confirmDialog.icon"
              :icon="dialogsStore.confirmDialog.icon"
              :color="dialogsStore.confirmDialog.danger ? 'error' : 'primary'"
              size="24"
              class="mr-3"
            />
            <span class="dialog-title-text">
              {{ dialogsStore.confirmDialog.title }}
            </span>
          </div>
        </v-card-title>

        <!-- メッセージ -->
        <v-card-text class="dialog-content">
          <div class="dialog-message" style="white-space: pre-line;">
            {{ dialogsStore.confirmDialog.message }}
          </div>
        </v-card-text>

        <!-- アクション -->
        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn
            variant="outlined"
            :color="dialogsStore.confirmDialog.cancelColor"
            @click="dialogsStore.cancelAction"
            rounded="xl"
          >
            {{ dialogsStore.confirmDialog.cancelText }}
          </v-btn>
          <v-btn
            :color="dialogsStore.confirmDialog.confirmColor"
            :variant="dialogsStore.confirmDialog.danger ? 'elevated' : 'flat'"
            @click="dialogsStore.confirmAction"
            rounded="xl"
            class="ml-2"
          >
            {{ dialogsStore.confirmDialog.confirmText }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 🔔 通知パネル（1人運営では非表示） -->
    <v-overlay
      v-if="isFeatureEnabled('ADVANCED_NOTIFICATIONS')"
      v-model="showNotifications"
      class="notification-overlay"
      @click="showNotifications = false"
    >
      <v-card class="notification-panel" width="360" rounded="xl" @click.stop>
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

  <!-- 🎨 LP専用レイアウト（ULTRATHINK統合） -->
  <div v-else class="lp-layout">
    <router-view />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore, useNotificationsStore, useDialogsStore } from '@/stores';
  import { isFeatureEnabled } from '@/config/featureFlags';
  import { LanguageSwitcher } from '@/components';
  import EmulatorBanner from '@/components/common/EmulatorBanner.vue';
  
  // AG Grid テーマをグローバルに読み込み
  import '@/styles/ag-grid-theme.css';

  const router = useRouter();
  const authStore = useAuthStore();
  const notificationsStore = useNotificationsStore();
  const dialogsStore = useDialogsStore();

  // State
  const drawer = ref(false);
  const showNotifications = ref(false);
  const notificationCount = ref(2);

  // Computed
  const showError = computed({
    get: () => !!authStore.error,
    set: () => authStore.clearError(),
  });

  // ULTRATHINK: 全ページでLP専用レイアウト使用 (黒サイドバー完全解除)
  const isLandingPage = computed(() => {
    // すべてのページでLP専用レイアウトを使用（黒サイドバーを完全に解除）
    return true;
  });

  // 🎨 Instagram風グラデーションスタイル
  const appBarStyle = computed(() => ({
    background:
      'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
  }));

  // 🎯 1人運営向けMVPメニュー (70%簡略化)
  const coreMenuItems = [
    {
      title: 'ダッシュボード',
      subtitle: '全体概要',
      icon: 'mdi-view-dashboard',
      to: '/dashboard',
      badge: false,
    },
    {
      title: '予約投稿',
      subtitle: 'スケジュール管理',
      icon: 'mdi-calendar-clock',
      to: '/schedules',
      badge: true,
      badgeIcon: 'mdi-circle',
      badgeColor: 'success',
    },
    {
      title: 'アカウント管理',
      subtitle: 'Instagram連携',
      icon: 'mdi-instagram',
      to: '/accounts',
      badge: false,
    },
    {
      title: 'コンテンツ',
      subtitle: '投稿ライブラリ',
      icon: 'mdi-image-multiple',
      to: '/content',
      badge: false,
    },
    {
      title: '料金プラン',
      subtitle: 'プラン・使用量',
      icon: 'mdi-crown',
      to: '/billing',
      badge: false,
    },
  ];

  // 将来実装予定の高度機能 (機能フラグで制御)
  const advancedMenuItems = [
    {
      title: 'グループ管理',
      subtitle: 'アカウントグループ',
      icon: 'mdi-account-group',
      to: '/groups',
      badge: false,
      feature: 'GROUP_MANAGEMENT',
    },
    {
      title: 'ログダッシュボード',
      subtitle: '活動履歴',
      icon: 'mdi-chart-line',
      to: '/logs',
      badge: false,
      feature: 'LOGS_DASHBOARD',
    },
    {
      title: 'カレンダー',
      subtitle: '投稿カレンダー',
      icon: 'mdi-calendar',
      to: '/calendar',
      badge: false,
      feature: 'CALENDAR_VIEW',
    },
    {
      title: 'プロキシ管理',
      subtitle: 'プロキシ設定',
      icon: 'mdi-server-network',
      to: '/proxies',
      badge: false,
      feature: 'PROXY_MANAGEMENT',
    },
  ];

  // 機能フラグでフィルタリングされたメニューアイテム
  const menuItems = computed(() => {
    const items = [...coreMenuItems];

    // 高度機能は機能フラグで制御
    advancedMenuItems.forEach(item => {
      if (item.feature && isFeatureEnabled(item.feature as any)) {
        items.push(item);
      }
    });

    return items;
  });

  // Methods
  const handleLogout = async () => {
    try {
      await authStore.logout();
      router.push('/');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  // Notification system methods
  const getNotificationColor = (type: string): string => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  };

  const getNotificationIcon = (type: string): string => {
    switch (type) {
      case 'success':
        return 'mdi-check-circle';
      case 'error':
        return 'mdi-alert-circle';
      case 'warning':
        return 'mdi-alert';
      case 'info':
        return 'mdi-information';
      default:
        return 'mdi-information';
    }
  };

  // Lifecycle
  onMounted(async () => {
    if (!authStore.isInitialized) {
      await authStore.initializeAuth();
    }
  });
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

  /* 統合通知システム */
  .elegant-notification {
    backdrop-filter: blur(20px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15) !important;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .notification-success {
    background: linear-gradient(135deg, 
      rgba(76, 175, 80, 0.95) 0%, 
      rgba(67, 160, 71, 0.95) 100%) !important;
  }

  .notification-error {
    background: linear-gradient(135deg, 
      rgba(244, 67, 54, 0.95) 0%, 
      rgba(229, 57, 53, 0.95) 100%) !important;
  }

  .notification-warning {
    background: linear-gradient(135deg, 
      rgba(255, 152, 0, 0.95) 0%, 
      rgba(251, 140, 0, 0.95) 100%) !important;
  }

  .notification-info {
    background: linear-gradient(135deg, 
      rgba(33, 150, 243, 0.95) 0%, 
      rgba(30, 136, 229, 0.95) 100%) !important;
  }

  .notification-content {
    flex: 1;
  }

  /* レガシーエラースナックバー */
  .elegant-snackbar.legacy-error {
    backdrop-filter: blur(20px);
  }

  /* 確認ダイアログ */
  .elegant-confirm-dialog {
    border-radius: 16px !important;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;
  }

  .elegant-confirm-dialog.danger-dialog {
    border: 1px solid rgba(244, 67, 54, 0.3);
  }

  .dialog-header {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    padding: 1.5rem;
  }

  .danger-dialog .dialog-header {
    background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
    border-bottom: 1px solid rgba(244, 67, 54, 0.1);
  }

  .dialog-title-text {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2d3748;
  }

  .danger-dialog .dialog-title-text {
    color: #c53030;
  }

  .dialog-content {
    padding: 1.5rem;
    background: white;
  }

  .dialog-message {
    font-size: 1rem;
    line-height: 1.6;
    color: #4a5568;
  }

  .danger-dialog .dialog-message {
    color: #742a2a;
  }

  .dialog-actions {
    padding: 1rem 1.5rem 1.5rem;
    background: #f8f9fa;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
  }

  .danger-dialog .dialog-actions {
    background: #fff5f5;
    border-top: 1px solid rgba(244, 67, 54, 0.1);
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

  /* 🎨 ULTRATHINK: LP専用レイアウト */
  .lp-layout {
    position: relative;
    width: 100%;
    min-height: 100vh;
    background: white;
    overflow-x: hidden;
  }

  /* 全画面レイアウト用ユーティリティクラス */
  .fullscreen-layout {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background: white !important;
    z-index: 9999 !important;
    overflow-y: auto !important;
  }

  /* Vuetifyリセット無効化（LP専用） */
  .lp-layout * {
    box-sizing: border-box;
  }
</style>

<!-- 🎨 ULTRATHINK: LP-demo.htmlグローバルスタイル -->
<style>
/* LP-demo.htmlスタイルをグローバルに適用（Vuetify競合解決） */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans JP', sans-serif !important;
  color: #2d3748 !important;
  line-height: 1.6 !important;
  overflow-x: hidden !important;
  background: white !important;
}

/* CSS変数 */
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

/* Vuetifyオーバーライド */
.v-application {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans JP', sans-serif !important;
}

.v-application .omniy-nav {
  position: fixed !important;
  top: 0 !important;
  width: 100% !important;
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px) !important;
  z-index: 1000 !important;
  padding: 1rem 0 !important;
  box-shadow: var(--shadow-sm) !important;
  transition: all 0.3s ease !important;
}

.v-application .nav-container {
  max-width: 1200px !important;
  margin: 0 auto !important;
  padding: 0 2rem !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
}

.v-application .logo {
  font-size: 1.8rem !important;
  font-weight: 800 !important;
  background: var(--primary-gradient) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
}

.v-application .nav-links {
  display: flex !important;
  gap: 2rem !important;
  align-items: center !important;
}

.v-application .nav-link {
  text-decoration: none !important;
  color: var(--text-secondary) !important;
  font-weight: 500 !important;
  transition: color 0.3s ease !important;
}

.v-application .nav-link:hover {
  color: var(--text-primary) !important;
}

.v-application .cta-button {
  background: var(--primary-gradient) !important;
  color: white !important;
  padding: 0.75rem 2rem !important;
  border-radius: 30px !important;
  text-decoration: none !important;
  font-weight: 600 !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3) !important;
  display: inline-block !important;
}

.v-application .cta-button:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4) !important;
}

.v-application .hero {
  margin-top: 80px !important;
  padding: 4rem 2rem 6rem !important;
  background: linear-gradient(180deg, #fafbff 0%, #f3f4f6 100%) !important;
  position: relative !important;
  overflow: hidden !important;
}

.v-application .hero-container {
  max-width: 1200px !important;
  margin: 0 auto !important;
  display: grid !important;
  grid-template-columns: 1fr 1fr !important;
  gap: 4rem !important;
  align-items: center !important;
}

.v-application .hero-content h1 {
  font-size: 3.5rem !important;
  font-weight: 800 !important;
  line-height: 1.2 !important;
  margin-bottom: 1.5rem !important;
  color: var(--text-primary) !important;
}

.v-application .gradient-text {
  background: var(--primary-gradient) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
}

.v-application .hero-description {
  font-size: 1.25rem !important;
  color: var(--text-secondary) !important;
  margin-bottom: 2rem !important;
  line-height: 1.8 !important;
}

.v-application .hero-actions {
  display: flex !important;
  gap: 1rem !important;
  align-items: center !important;
  margin-bottom: 3rem !important;
}

.v-application .secondary-button {
  background: white !important;
  color: var(--text-primary) !important;
  padding: 0.75rem 2rem !important;
  border-radius: 30px !important;
  text-decoration: none !important;
  font-weight: 600 !important;
  border: 2px solid #e2e8f0 !important;
  transition: all 0.3s ease !important;
  display: inline-block !important;
}

.v-application .secondary-button:hover {
  border-color: #cbd5e0 !important;
  transform: translateY(-2px) !important;
}

/* レスポンシブ */
@media (max-width: 768px) {
  .v-application .hero-container {
    grid-template-columns: 1fr !important;
    text-align: center !important;
  }

  .v-application .hero-content h1 {
    font-size: 2.5rem !important;
  }

  .v-application .nav-links {
    display: none !important;
  }
}
</style>
