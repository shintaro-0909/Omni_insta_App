<template>
  <nav class="omniy-nav" :class="{ 'scroll-shadow': hasScrolled }">
    <div class="nav-container">
      <router-link to="/" class="logo">Omniy</router-link>
      
      <!-- デスクトップナビゲーション -->
      <div class="nav-links desktop-nav">
        <router-link 
          v-for="link in mainNavLinks" 
          :key="link.path"
          :to="link.path" 
          class="nav-link"
          :class="{ 'active': isActiveLink(link.path) }"
        >
          {{ link.label }}
        </router-link>
        <router-link to="/billing" class="cta-button">
          {{ billingLinkText }}
        </router-link>
      </div>

      <!-- モバイルメニューボタン -->
      <button 
        class="mobile-menu-button"
        @click="toggleMobileMenu"
        :class="{ 'active': showMobileMenu }"
      >
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
    </div>

    <!-- モバイルナビゲーション -->
    <transition name="mobile-menu">
      <div v-if="showMobileMenu" class="mobile-nav-overlay">
        <div class="mobile-nav-container">
          <div class="mobile-nav-header">
            <div class="logo">Omniy</div>
            <button class="close-button" @click="closeMobileMenu">✕</button>
          </div>
          <div class="mobile-nav-links">
            <router-link 
              v-for="link in allNavLinks" 
              :key="link.path"
              :to="link.path" 
              class="mobile-nav-link"
              @click="closeMobileMenu"
            >
              <span class="link-icon">{{ link.icon }}</span>
              <span class="link-text">{{ link.label }}</span>
            </router-link>
          </div>
          <div class="mobile-nav-footer">
            <div class="user-info" v-if="authStore.isAuthenticated">
              <div class="user-avatar">👤</div>
              <div class="user-details">
                <div class="user-name">{{ authStore.userDisplayName }}</div>
                <div class="user-email">{{ authStore.userEmail }}</div>
              </div>
            </div>
            <div class="footer-actions">
              <button 
                class="feedback-button"
                @click="openFeedbackDialog"
              >
                💭 フィードバック
              </button>
              <button 
                v-if="authStore.isAuthenticated" 
                class="logout-button"
                @click="handleLogout"
              >
                🚪 ログアウト
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- フィードバックダイアログ -->
    <FeedbackDialog v-model="showFeedbackDialog" />
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores';
import FeedbackDialog from '@/components/forms/FeedbackDialog.vue';

interface NavLink {
  path: string;
  label: string;
  icon: string;
  requiresAuth: boolean;
}

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// State
const showMobileMenu = ref(false);
const hasScrolled = ref(false);
const showFeedbackDialog = ref(false);

// Navigation links configuration
const navLinksConfig: NavLink[] = [
  { path: '/', label: 'ホーム', icon: '🏠', requiresAuth: false },
  { path: '/dashboard', label: 'ダッシュボード', icon: '📊', requiresAuth: true },
  { path: '/schedules', label: '予約管理', icon: '📅', requiresAuth: true },
  { path: '/schedules/grid', label: 'グリッド管理', icon: '📊', requiresAuth: true },
  { path: '/accounts', label: 'アカウント', icon: '📱', requiresAuth: true },
  { path: '/content', label: 'コンテンツ', icon: '🎨', requiresAuth: true },
  { path: '/settings', label: '設定', icon: '⚙️', requiresAuth: true },
  { path: '/billing', label: 'プラン管理', icon: '💳', requiresAuth: true },
  { path: '/demo', label: 'UIデモ', icon: '✨', requiresAuth: false },
];

// Computed properties
const mainNavLinks = computed(() => {
  return navLinksConfig.filter(link => {
    // Show home for non-authenticated users
    if (link.path === '/' && !authStore.isAuthenticated) return true;
    
    // Show dashboard, schedules, accounts, content, settings for authenticated users
    if (authStore.isAuthenticated && ['/', '/dashboard', '/schedules', '/schedules/grid', '/accounts', '/content', '/settings'].includes(link.path)) {
      return link.path !== '/'; // Hide home for authenticated users in main nav
    }
    
    return false;
  });
});

const allNavLinks = computed(() => {
  return navLinksConfig.filter(link => {
    if (!authStore.isAuthenticated) {
      return !link.requiresAuth; // Show only public links for non-authenticated users
    }
    return true; // Show all links for authenticated users
  });
});

const billingLinkText = computed(() => {
  return authStore.isAuthenticated ? 'プラン管理' : 'プランを見る';
});

// Methods
const isActiveLink = (path: string): boolean => {
  if (path === '/') {
    return route.path === '/';
  }
  return route.path.startsWith(path);
};

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
  
  // Prevent body scroll when menu is open
  if (showMobileMenu.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
};

const closeMobileMenu = () => {
  showMobileMenu.value = false;
  document.body.style.overflow = '';
};

const handleScroll = () => {
  hasScrolled.value = window.scrollY > 10;
};

const handleLogout = async () => {
  try {
    await authStore.logout();
    closeMobileMenu();
    router.push('/');
  } catch (error) {
    console.error('ログアウトエラー:', error);
  }
};

const openFeedbackDialog = () => {
  showFeedbackDialog.value = true;
  closeMobileMenu();
};

// Lifecycle
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  
  // Close mobile menu on route change
  router.afterEach(() => {
    closeMobileMenu();
  });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  document.body.style.overflow = '';
});
</script>

<style scoped>
/* LP-demo.htmlと統一されたナビゲーションスタイル */
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
}

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

.omniy-nav.scroll-shadow {
  box-shadow: var(--shadow-md);
  background: rgba(255, 255, 255, 0.98);
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
  text-decoration: none;
  transition: all 0.3s ease;
}

.logo:hover {
  transform: scale(1.05);
}

/* デスクトップナビゲーション */
.desktop-nav {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  padding: 0.5rem 0;
}

.nav-link:hover,
.nav-link.active,
.nav-link.router-link-active {
  color: var(--text-primary);
}

.nav-link.active::after,
.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--primary-gradient);
  border-radius: 1px;
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

/* モバイルメニューボタン */
.mobile-menu-button {
  display: none;
  flex-direction: column;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.hamburger-line {
  width: 100%;
  height: 3px;
  background: var(--text-primary);
  margin: 3px 0;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.mobile-menu-button.active .hamburger-line:nth-child(1) {
  transform: rotate(45deg) translate(9px, 9px);
}

.mobile-menu-button.active .hamburger-line:nth-child(2) {
  opacity: 0;
}

.mobile-menu-button.active .hamburger-line:nth-child(3) {
  transform: rotate(-45deg) translate(9px, -9px);
}

/* モバイルナビゲーション */
.mobile-nav-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 999;
}

.mobile-nav-container {
  position: absolute;
  top: 0;
  right: 0;
  width: 80%;
  max-width: 400px;
  height: 100%;
  background: white;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
}

.mobile-nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-button:hover {
  background: var(--bg-light);
  color: var(--text-primary);
}

.mobile-nav-links {
  flex: 1;
  padding: 2rem 0;
  overflow-y: auto;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  text-decoration: none;
  color: var(--text-primary);
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.mobile-nav-link:hover,
.mobile-nav-link.router-link-active {
  background: var(--bg-light);
  border-left-color: #667eea;
}

.link-icon {
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
}

.link-text {
  font-weight: 500;
}

.mobile-nav-footer {
  padding: 2rem;
  border-top: 1px solid #e2e8f0;
  background: var(--bg-light);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.user-details {
  flex: 1;
}

.user-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.user-email {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.footer-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.feedback-button {
  width: 100%;
  background: var(--accent-gradient);
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
}

.feedback-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.logout-button {
  width: 100%;
  background: var(--secondary-gradient);
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* トランジション */
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.3s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
}

.mobile-menu-enter-from .mobile-nav-container,
.mobile-menu-leave-to .mobile-nav-container {
  transform: translateX(100%);
}

/* レスポンシブ */
@media (max-width: 768px) {
  .desktop-nav {
    display: none;
  }
  
  .mobile-menu-button {
    display: flex;
  }
  
  .nav-container {
    padding: 0 1rem;
  }
  
  .logo {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .mobile-nav-container {
    width: 90%;
  }
  
  .mobile-nav-link {
    padding: 0.75rem 1.5rem;
  }
  
  .mobile-nav-header,
  .mobile-nav-footer {
    padding: 1.5rem;
  }
}
</style>