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
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue')
    }
  ]
})

// 認証ガード
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  
  // 認証状態の初期化を待つ
  if (!authStore.isInitialized) {
    await authStore.initializeAuth()
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