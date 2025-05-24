<template>
  <v-app>
    <!-- ナビゲーションドロワー -->
    <v-navigation-drawer
      v-if="authStore.isAuthenticated"
      v-model="drawer"
      app
      temporary
    >
      <v-list>
        <v-list-item
          prepend-avatar="/favicon.ico"
          :title="authStore.userDisplayName"
          :subtitle="authStore.userEmail"
        />
      </v-list>

      <v-divider />

      <v-list density="compact" nav>
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :prepend-icon="item.icon"
          :title="item.title"
          :to="item.to"
          color="primary"
        />
      </v-list>
    </v-navigation-drawer>

    <!-- アプリバー -->
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon
        v-if="authStore.isAuthenticated"
        @click="drawer = !drawer"
      />
      
      <v-toolbar-title>
        <router-link to="/" class="text-decoration-none text-white">
          Omniy
        </router-link>
      </v-toolbar-title>

      <v-spacer />

      <!-- 認証済みユーザーメニュー -->
      <template v-if="authStore.isAuthenticated">
        <v-menu>
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              icon
              size="small"
            >
              <v-avatar size="32">
                <v-img
                  v-if="authStore.userPhotoURL"
                  :src="authStore.userPhotoURL"
                  :alt="authStore.userDisplayName"
                />
                <v-icon v-else>mdi-account-circle</v-icon>
              </v-avatar>
            </v-btn>
          </template>
          
          <v-list>
            <v-list-item
              prepend-icon="mdi-cog"
              title="設定"
              to="/settings"
            />
            <v-list-item
              prepend-icon="mdi-logout"
              title="ログアウト"
              @click="handleLogout"
            />
          </v-list>
        </v-menu>
      </template>

      <!-- 未認証ユーザーボタン -->
      <template v-else>
        <v-btn
          variant="outlined"
          color="white"
          to="/login"
        >
          ログイン
        </v-btn>
      </template>
    </v-app-bar>

    <!-- メインコンテンツ -->
    <v-main>
      <router-view />
    </v-main>

    <!-- フッター -->
    <v-footer app color="grey-lighten-3" class="text-center">
      <div>
        © 2024 Omniy. All rights reserved.
      </div>
    </v-footer>

    <!-- エラースナックバー -->
    <v-snackbar
      v-model="showError"
      color="error"
      timeout="5000"
      location="top"
    >
      {{ authStore.error }}
      <template #actions>
        <v-btn
          variant="text"
          @click="authStore.clearError"
        >
          閉じる
        </v-btn>
      </template>
    </v-snackbar>
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

// Computed
const showError = computed({
  get: () => !!authStore.error,
  set: () => authStore.clearError()
})

// メニューアイテム
const menuItems = [
  { title: 'ダッシュボード', icon: 'mdi-view-dashboard', to: '/dashboard' },
  { title: '予約投稿', icon: 'mdi-calendar-clock', to: '/schedules' },
  { title: 'アカウント管理', icon: 'mdi-instagram', to: '/accounts' },
  { title: 'コンテンツ', icon: 'mdi-image-multiple', to: '/content' },
  { title: '料金プラン', icon: 'mdi-crown', to: '/billing' }
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
.v-toolbar-title a {
  font-weight: bold;
  font-size: 1.5rem;
}
</style> 