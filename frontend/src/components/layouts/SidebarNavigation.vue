<template>
  <div class="sidebar-layout">
    <!-- トグルボタン（スマホ用） -->
    <button 
      v-if="isMobile"
      class="sidebar-toggle-btn"
      @click="toggleSidebar"
      :class="{ 'active': isOpen }"
    >
      <div class="toggle-icon">
        <span class="hamburger-line" :class="{ 'open': isOpen }"></span>
        <span class="hamburger-line" :class="{ 'open': isOpen }"></span>
        <span class="hamburger-line" :class="{ 'open': isOpen }"></span>
      </div>
    </button>

    <!-- オーバーレイ（スマホ用） -->
    <div 
      v-if="isMobile && isOpen"
      class="sidebar-overlay"
      @click="toggleSidebar"
    ></div>

    <!-- サイドバー -->
    <aside 
      class="sidebar"
      :class="{ 
        'sidebar-open': isOpen,
        'sidebar-closed': !isOpen,
        'sidebar-mobile': isMobile
      }"
    >
      <!-- ヘッダー -->
      <div class="sidebar-header">
        <div class="brand-section">
          <div class="brand-icon">
            <svg class="brand-logo" viewBox="0 0 32 32" fill="none">
              <rect x="4" y="4" width="24" height="24" rx="6" stroke="url(#brandGradient)" stroke-width="2"/>
              <circle cx="16" cy="16" r="6" stroke="url(#brandGradient)" stroke-width="2"/>
              <circle cx="16" cy="16" r="2" fill="url(#brandGradient)"/>
              <defs>
                <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#667eea"/>
                  <stop offset="100%" style="stop-color:#764ba2"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span v-if="isOpen" class="brand-text">Omniy</span>
        </div>
        
        <!-- デスクトップ用トグルボタン -->
        <button 
          v-if="!isMobile"
          class="sidebar-collapse-btn"
          @click="toggleSidebar"
          :title="isOpen ? 'サイドバーを閉じる' : 'サイドバーを開く'"
        >
          <div class="toggle-icon collapse-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path v-if="isOpen" d="M15 18l-6-6 6-6" stroke-width="2"/>
              <path v-else d="M9 18l6-6-6-6" stroke-width="2"/>
            </svg>
          </div>
        </button>
      </div>

      <!-- ナビゲーションメニュー -->
      <nav class="sidebar-nav">
        <div class="nav-section">
          <h3 v-if="isOpen" class="nav-section-title">メイン機能</h3>
          
          <router-link
            v-for="item in coreMenuItems"
            :key="item.to"
            :to="item.to"
            class="nav-item"
            :class="{ 'nav-item-collapsed': !isOpen }"
            :title="!isOpen ? item.title : ''"
          >
            <div class="nav-icon">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path v-if="item.icon === 'mdi-view-dashboard'" d="M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z" stroke-width="2"/>
                <path v-else-if="item.icon === 'mdi-calendar-clock'" d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke-width="2"/>
                <path v-else-if="item.icon === 'mdi-instagram'" d="M16 8a6 6 0 0 1-6 6 6 6 0 0 1-6-6 6 6 0 0 1 6-6 6 6 0 0 1 6 6zM2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" stroke-width="2"/>
                <path v-else-if="item.icon === 'mdi-image-multiple'" d="M14 2H6a2 2 0 0 0-2 2v16l4-4 4 4 7-7V4a2 2 0 0 0-2-2z M8.5 8.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" stroke-width="2"/>
                <path v-else-if="item.icon === 'mdi-crown'" d="M6 3h2l2 3 2-3 2 3 2-3h2l-2 8H8L6 3z" stroke-width="2"/>
                <path v-else-if="item.icon === 'mdi-account-group'" d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M12.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke-width="2"/>
                <path v-else-if="item.icon === 'mdi-chart-line'" d="M3 3v18h18M7 12l4-4 4 4 4-4" stroke-width="2"/>
                <path v-else-if="item.icon === 'mdi-server-network'" d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6zM4 16a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2z" stroke-width="2"/>
                <circle v-else cx="12" cy="12" r="2" stroke-width="2"/>
              </svg>
            </div>
            <span v-if="isOpen" class="nav-text">{{ item.title }}</span>
            <span v-if="isOpen && item.subtitle" class="nav-subtitle">{{ item.subtitle }}</span>
            <v-badge 
              v-if="item.badge && isOpen" 
              :color="item.badgeColor || 'primary'"
              dot
              class="nav-badge"
            />
          </router-link>
        </div>

        <!-- 高度機能（機能フラグで制御） -->
        <div v-if="hasAdvancedFeatures" class="nav-section">
          <h3 v-if="isOpen" class="nav-section-title">高度機能</h3>
          
          <router-link
            v-for="item in advancedMenuItems"
            :key="item.to"
            :to="item.to"
            class="nav-item"
            :class="{ 'nav-item-collapsed': !isOpen }"
            :title="!isOpen ? item.title : ''"
          >
            <div class="nav-icon">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path v-if="item.icon === 'mdi-view-dashboard'" d="M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z" stroke-width="2"/>
                <path v-else-if="item.icon === 'mdi-calendar-clock'" d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke-width="2"/>
                <path v-else-if="item.icon === 'mdi-instagram'" d="M16 8a6 6 0 0 1-6 6 6 6 0 0 1-6-6 6 6 0 0 1 6-6 6 6 0 0 1 6 6zM2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" stroke-width="2"/>
                <path v-else-if="item.icon === 'mdi-image-multiple'" d="M14 2H6a2 2 0 0 0-2 2v16l4-4 4 4 7-7V4a2 2 0 0 0-2-2z M8.5 8.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" stroke-width="2"/>
                <path v-else-if="item.icon === 'mdi-crown'" d="M6 3h2l2 3 2-3 2 3 2-3h2l-2 8H8L6 3z" stroke-width="2"/>
                <path v-else-if="item.icon === 'mdi-account-group'" d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M12.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke-width="2"/>
                <path v-else-if="item.icon === 'mdi-chart-line'" d="M3 3v18h18M7 12l4-4 4 4 4-4" stroke-width="2"/>
                <path v-else-if="item.icon === 'mdi-server-network'" d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6zM4 16a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2z" stroke-width="2"/>
                <circle v-else cx="12" cy="12" r="2" stroke-width="2"/>
              </svg>
            </div>
            <span v-if="isOpen" class="nav-text">{{ item.title }}</span>
            <span v-if="isOpen && item.subtitle" class="nav-subtitle">{{ item.subtitle }}</span>
          </router-link>
        </div>
      </nav>

      <!-- フッター -->
      <div class="sidebar-footer">
        <div v-if="isOpen" class="user-info">
          <v-avatar size="40" class="user-avatar">
            <v-img
              v-if="authStore.userPhotoURL"
              :src="authStore.userPhotoURL"
              :alt="authStore.userDisplayName"
            />
            <div v-else class="user-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke-width="2"/>
                <circle cx="12" cy="7" r="4" stroke-width="2"/>
              </svg>
            </div>
          </v-avatar>
          <div class="user-details">
            <div class="user-name">{{ authStore.userDisplayName }}</div>
            <div class="user-plan">フリープラン</div>
          </div>
        </div>
        
        <v-menu v-if="isOpen" offset-y>
          <template #activator="{ props }">
            <button v-bind="props" class="user-menu-btn">
              <div class="menu-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="1" stroke-width="2"/>
                  <circle cx="12" cy="5" r="1" stroke-width="2"/>
                  <circle cx="12" cy="19" r="1" stroke-width="2"/>
                </svg>
              </div>
            </button>
          </template>
          <v-list>
            <v-list-item title="設定" to="/settings" />
            <v-list-item title="ヘルプ" />
            <v-divider />
            <v-list-item title="ログアウト" @click="handleLogout" />
          </v-list>
        </v-menu>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores';
import { isFeatureEnabled } from '@/config/featureFlags';

const router = useRouter();
const authStore = useAuthStore();

// State
const isOpen = ref(true);
const isMobile = ref(false);

// Menu items
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

const advancedMenuItems = computed(() => {
  const items = [];
  
  if (isFeatureEnabled('GROUP_MANAGEMENT')) {
    items.push({
      title: 'グループ管理',
      subtitle: 'アカウントグループ',
      icon: 'mdi-account-group',
      to: '/groups',
    });
  }
  
  if (isFeatureEnabled('LOGS_DASHBOARD')) {
    items.push({
      title: 'ログダッシュボード',
      subtitle: '活動履歴',
      icon: 'mdi-chart-line',
      to: '/logs',
    });
  }
  
  if (isFeatureEnabled('PROXY_MANAGEMENT')) {
    items.push({
      title: 'プロキシ管理',
      subtitle: 'プロキシ設定',
      icon: 'mdi-server-network',
      to: '/proxies',
    });
  }
  
  return items;
});

const hasAdvancedFeatures = computed(() => advancedMenuItems.value.length > 0);

// Methods
const toggleSidebar = () => {
  isOpen.value = !isOpen.value;
  
  // ローカルストレージに状態を保存
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('omniy_sidebar_open', String(isOpen.value));
  }
  
  // モバイルで閉じる場合は本体をクリックできるようにする
  if (isMobile.value && !isOpen.value) {
    document.body.style.overflow = 'auto';
  } else if (isMobile.value && isOpen.value) {
    document.body.style.overflow = 'hidden';
  }
};

// No longer needed - using SVG icons

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push('/');
  } catch (error) {
    console.error('ログアウトエラー:', error);
  }
};

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
  
  // モバイルの場合はデフォルトで閉じる
  if (isMobile.value) {
    isOpen.value = false;
  }
};

// Lifecycle
onMounted(() => {
  // ローカルストレージからサイドバー状態を読み込み
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('omniy_sidebar_open');
    if (saved !== null) {
      isOpen.value = saved === 'true';
    }
  }
  
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
  document.body.style.overflow = 'auto';
});
</script>

<style scoped>
.sidebar-layout {
  position: relative;
}

/* トグルボタン（スマホ用） */
.sidebar-toggle-btn {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1001;
  background: var(--primary-gradient);
  color: white;
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
}

.sidebar-toggle-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

/* オーバーレイ */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  backdrop-filter: blur(4px);
}

/* サイドバー */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  background: white;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.sidebar-open {
  width: 280px;
}

.sidebar-closed {
  width: 72px;
}

.sidebar-mobile.sidebar-open {
  width: 280px;
  transform: translateX(0);
}

.sidebar-mobile.sidebar-closed {
  width: 280px;
  transform: translateX(-100%);
}

/* ヘッダー */
.sidebar-header {
  padding: 1.5rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 80px;
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-logo {
  width: 100%;
  height: 100%;
}

.brand-text {
  font-size: 1.5rem;
  font-weight: 700;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  white-space: nowrap;
}

.sidebar-collapse-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #64748b;
}

.sidebar-collapse-btn:hover {
  background: #f1f5f9;
  color: #475569;
}

/* ナビゲーション */
.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: 2rem;
}

.nav-section-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 1rem 0.75rem;
  padding: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  margin: 0 0.5rem;
  border-radius: 12px;
  text-decoration: none;
  color: #475569;
  transition: all 0.3s ease;
  position: relative;
}

.nav-item:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  color: #667eea;
  transform: translateX(4px);
}

.nav-item.router-link-active {
  background: var(--primary-gradient);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.nav-item-collapsed {
  justify-content: center;
  padding: 0.75rem;
}

.nav-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.nav-icon .icon {
  width: 20px;
  height: 20px;
  transition: all 0.3s ease;
}

.nav-text {
  font-weight: 500;
  white-space: nowrap;
}

.nav-subtitle {
  font-size: 0.8rem;
  opacity: 0.8;
  margin-left: auto;
  white-space: nowrap;
}

.nav-badge {
  margin-left: auto;
}

/* フッター */
.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.user-avatar {
  flex-shrink: 0;
  border: 2px solid #e2e8f0;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-plan {
  font-size: 0.8rem;
  color: #64748b;
  white-space: nowrap;
}

.user-menu-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  color: #64748b;
  transition: all 0.3s ease;
}

.toggle-icon,
.menu-icon,
.user-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
}

.toggle-icon svg,
.menu-icon svg,
.user-icon svg {
  width: 100%;
  height: 100%;
}

.sidebar-toggle-btn .toggle-icon {
  width: 1.2rem;
  height: 1.2rem;
  flex-direction: column;
  gap: 2px;
}

.hamburger-line {
  width: 18px;
  height: 2px;
  background: currentColor;
  border-radius: 1px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
}

.hamburger-line.open:nth-child(1) {
  transform: rotate(45deg) translateY(6px);
}

.hamburger-line.open:nth-child(2) {
  opacity: 0;
}

.hamburger-line.open:nth-child(3) {
  transform: rotate(-45deg) translateY(-6px);
}

.collapse-icon svg {
  width: 16px;
  height: 16px;
}

.user-menu-btn:hover {
  background: #f1f5f9;
  color: #475569;
}

/* デスクトップ専用表示 */
@media (min-width: 768px) {
  .sidebar-toggle-btn {
    display: none;
  }
}

/* スマホ専用調整 */
@media (max-width: 767px) {
  .sidebar-collapse-btn {
    display: none;
  }
  
  .nav-section-title {
    font-size: 0.8rem;
  }
  
  .nav-item {
    padding: 1rem;
  }
}

/* スクロールバーのスタイル */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 2px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: #cbd5e0;
}
</style>