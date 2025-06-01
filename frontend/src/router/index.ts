import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
// import { trackRouteChange } from '@/utils/api/performance' // temporarily disabled

// Mock implementation for route tracking
const trackRouteChange = (to: string, from: string) => {
  console.log(`Route change: ${from} -> ${to}`);
};

// Route metadata is handled by Vue Router's built-in types

// Core routes (always loaded)
const coreRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: {
      requiresAuth: false,
      title: 'Omniy - Instagram Scheduler',
      description: 'Professional Instagram scheduling app',
    },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: {
      requiresAuth: false,
      preload: true,
      title: 'Login - Omniy',
      description: 'Sign in to your Omniy account',
    },
  },
];

// Main application routes (lazy loaded)
const appRoutes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: {
      requiresAuth: true,
      preload: true,
      keepAlive: true,
      title: 'Dashboard - Omniy',
      description: 'Instagram scheduling dashboard',
    },
  },
  {
    path: '/schedules',
    name: 'schedules',
    component: () => import('@/views/SchedulesView.vue'),
    meta: {
      requiresAuth: true,
      keepAlive: true,
      title: 'Schedules - Omniy',
      description: 'Manage your Instagram post schedules',
    },
  },
  {
    path: '/accounts',
    name: 'accounts',
    component: () => import('@/views/AccountsView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Accounts - Omniy',
      description: 'Manage your Instagram accounts',
    },
  },
  {
    path: '/content',
    name: 'content',
    component: () => import('@/views/ContentView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Content Library - Omniy',
      description: 'Manage your post content',
    },
  },
];

// Secondary features (lazy loaded)
const secondaryRoutes: RouteRecordRaw[] = [
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Settings - Omniy',
      description: 'Application settings',
    },
  },
  {
    path: '/billing',
    name: 'billing',
    component: () => import('@/views/BillingView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Billing - Omniy',
      description: 'Manage your subscription',
    },
  },
  {
    path: '/billing/success',
    name: 'billing-success',
    component: () => import('@/views/BillingSuccessView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Payment Success - Omniy',
      description: 'Payment confirmation',
    },
  },
  {
    path: '/proxies',
    name: 'proxies',
    component: () => import('@/views/ProxiesView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Proxies - Omniy',
      description: 'Manage proxy settings',
    },
  },
  {
    path: '/groups',
    name: 'groups',
    component: () => import('@/views/GroupsView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Groups - Omniy',
      description: 'Manage account groups',
    },
  },
  {
    path: '/logs',
    name: 'logs',
    component: () => import('@/views/LogsView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Activity Logs - Omniy',
      description: 'View activity logs',
    },
  },
  // Calendar view temporarily disabled due to missing calendar store
  // {
  //   path: '/calendar',
  //   name: 'calendar',
  //   component: () => import('@/views/CalendarView.vue'),
  //   meta: {
  //     requiresAuth: true,
  //     title: 'Calendar - Omniy',
  //     description: 'Schedule calendar view'
  //   }
  // }
];

// Error routes
const errorRoutes: RouteRecordRaw[] = [
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: {
      title: 'Page Not Found - Omniy',
      description: 'The requested page was not found',
    },
  },
];

// Combine all routes
const routes = [
  ...coreRoutes,
  ...appRoutes,
  ...secondaryRoutes,
  ...errorRoutes,
];

// Create router with optimized configuration
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    // Restore scroll position on back navigation
    if (savedPosition) {
      return savedPosition;
    }
    // Scroll to anchor if present
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' };
    }
    // Scroll to top for new routes
    return { top: 0, behavior: 'smooth' };
  },
});

// Optimized route guards with performance tracking
router.beforeEach(async (to, from, next) => {
  // Track route change performance
  trackRouteChange(to.path, from.path);

  // Update document title and meta description
  if (to.meta?.title) {
    document.title = to.meta.title as string;
  }
  if (to.meta?.description) {
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', to.meta.description as string);
    }
  }

  // Cypress test environment bypass
  if (typeof window !== 'undefined' && (window as any).__CYPRESS_TESTING__) {
    console.log('🧪 Cypress testing mode - bypassing auth guards');
    next();
    return;
  }

  // Lazy load auth store only when needed
  if (to.meta?.requiresAuth) {
    try {
      const { useAuthStore } = await import('@/stores/auth');
      const authStore = useAuthStore();

      // Initialize auth if not already done
      if (!authStore.isInitialized) {
        await authStore.initializeAuth();
      }

      if (!authStore.isAuthenticated) {
        next('/login');
        return;
      }

      // Feature flag check (lazy loaded)
      try {
        const { featureFlags } = await import('@/utils/featureFlags');
        if (!featureFlags.isRouteAccessible(to.path)) {
          console.warn(`🚫 Route ${to.path} is disabled by feature flags`);
          next('/dashboard');
          return;
        }
      } catch (error) {
        console.warn('Feature flags check failed:', error);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      next('/login');
      return;
    }
  }

  // Handle authenticated user on login page
  if (to.name === 'login') {
    try {
      const { useAuthStore } = await import('@/stores/auth');
      const authStore = useAuthStore();

      if (authStore.isAuthenticated) {
        next('/dashboard');
        return;
      }
    } catch (error) {
      console.warn('Auth store check failed:', error);
    }
  }

  // Auto-redirect root to dashboard for authenticated users
  if (to.path === '/') {
    try {
      const { useAuthStore } = await import('@/stores/auth');
      const authStore = useAuthStore();

      if (authStore.isAuthenticated) {
        next('/dashboard');
        return;
      }
    } catch (error) {
      console.warn('Root redirect check failed:', error);
    }
  }

  next();
});

// Preload critical routes
router.afterEach((_to, _from) => {
  // Preload routes marked for preloading
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    requestIdleCallback(() => {
      const preloadRoutes = routes.filter(route => route.meta?.preload);
      preloadRoutes.forEach(route => {
        if (typeof route.component === 'function') {
          (route.component as () => Promise<any>)().catch(() => {
            // Ignore preload errors
          });
        }
      });
    });
  }
});

// Error handling for route loading failures
router.onError(error => {
  console.error('Router error:', error);

  // Try to navigate to a safe route on chunk load errors
  if (error.message?.includes('Loading chunk')) {
    console.warn('Chunk loading failed, attempting to reload...');
    window.location.reload();
  }
});

export default router;
