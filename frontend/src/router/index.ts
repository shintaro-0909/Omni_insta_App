import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/schedules',
      name: 'schedules',
      component: () => import('@/views/SchedulesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/accounts',
      name: 'accounts',
      component: () => import('@/views/AccountsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/content',
      name: 'content',
      component: () => import('@/views/ContentView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/billing',
      name: 'billing',
      component: () => import('@/views/BillingView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/billing/success',
      name: 'billing-success',
      component: () => import('@/views/BillingSuccessView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/proxies',
      name: 'proxies',
      component: () => import('@/views/ProxiesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/groups',
      name: 'groups',
      component: () => import('@/views/GroupsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/logs',
      name: 'logs',
      component: () => import('@/views/LogsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: () => import('@/views/CalendarView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue')
    }
  ]
})

// 認証ガード
router.beforeEach(async (to, _from, next) => {
  // Cypress テスト環境では認証チェックをバイパス
  if (typeof window !== 'undefined' && window.__CYPRESS_TESTING__) {
    console.log('🧪 Cypress testing mode - bypassing auth guards')
    next()
    return
  }
  
  const authStore = useAuthStore()
  
  // 認証状態の初期化を待つ
  if (!authStore.isInitialized) {
    await authStore.initializeAuth()
  }
  
  // ルートページ (/) での自動リダイレクト（認証済みユーザーのみ）
  if (to.path === '/' && authStore.isAuthenticated) {
    next('/dashboard')
    return
  }
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.name === 'login' && authStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router 