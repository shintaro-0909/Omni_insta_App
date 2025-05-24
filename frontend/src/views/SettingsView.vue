<template>
  <div class="settings-view">
    <v-container>
      <!-- 🔧 ページヘッダー -->
      <v-row class="mb-6">
        <v-col cols="12">
          <div class="d-flex align-center">
            <v-icon icon="mdi-cog" size="32" color="primary" class="mr-3" />
            <div>
              <h1 class="text-h3 font-weight-bold">設定</h1>
              <p class="text-subtitle-1 text-grey-darken-1 mt-1">
                アカウント設定とアプリケーション設定を管理
              </p>
            </div>
          </div>
        </v-col>
      </v-row>

      <v-row>
        <!-- 👤 ユーザー設定 -->
        <v-col cols="12" md="6">
          <v-card class="settings-card" elevation="0" rounded="xl">
            <v-card-title class="settings-card-title">
              <v-icon icon="mdi-account-circle" class="mr-3" />
              ユーザー設定
            </v-card-title>
            
            <v-card-text class="pa-6">
              <!-- プロフィール情報 -->
              <div class="profile-section">
                <v-avatar size="80" class="mb-4">
                  <v-img
                    v-if="authStore.userPhotoURL"
                    :src="authStore.userPhotoURL"
                    :alt="authStore.userDisplayName"
                  />
                  <v-icon v-else size="40" color="primary">mdi-account-circle</v-icon>
                </v-avatar>
                
                <div class="profile-info">
                  <h3 class="text-h6 font-weight-bold mb-1">
                    {{ authStore.userDisplayName }}
                  </h3>
                  <p class="text-body-2 text-grey-darken-1 mb-4">
                    {{ authStore.userEmail }}
                  </p>
                  
                  <v-chip
                    color="success"
                    variant="tonal"
                    size="small"
                    class="mb-4"
                  >
                    <v-icon icon="mdi-check-circle" size="16" class="mr-1" />
                    認証済み
                  </v-chip>
                </div>
              </div>

              <v-divider class="my-4" />

              <!-- アカウント操作 -->
              <div class="account-actions">
                <v-list density="compact">
                  <v-list-item
                    prepend-icon="mdi-logout"
                    title="ログアウト"
                    subtitle="すべてのデバイスからログアウト"
                    @click="handleLogout"
                    class="logout-item"
                  />
                  <v-list-item
                    prepend-icon="mdi-delete-forever"
                    title="アカウント削除"
                    subtitle="全データを完全に削除（復旧不可）"
                    @click="showDeleteDialog = true"
                    class="danger-item"
                  />
                </v-list>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- ⚙️ アプリケーション設定 -->
        <v-col cols="12" md="6">
          <v-card class="settings-card" elevation="0" rounded="xl">
            <v-card-title class="settings-card-title">
              <v-icon icon="mdi-application-cog" class="mr-3" />
              アプリケーション設定
            </v-card-title>
            
            <v-card-text class="pa-6">
              <!-- 通知設定 -->
              <div class="notification-settings">
                <h4 class="text-subtitle-1 font-weight-bold mb-3">通知設定</h4>
                
                <v-list density="compact">
                  <v-list-item>
                    <v-list-item-title>投稿成功通知</v-list-item-title>
                    <v-list-item-subtitle>投稿が正常に完了した時に通知</v-list-item-subtitle>
                    <template #append>
                      <v-switch
                        v-model="settings.notifications.postSuccess"
                        color="success"
                        hide-details
                      />
                    </template>
                  </v-list-item>
                  
                  <v-list-item>
                    <v-list-item-title>投稿失敗通知</v-list-item-title>
                    <v-list-item-subtitle>投稿が失敗した時に通知</v-list-item-subtitle>
                    <template #append>
                      <v-switch
                        v-model="settings.notifications.postFailure"
                        color="error"
                        hide-details
                      />
                    </template>
                  </v-list-item>
                  
                  <v-list-item>
                    <v-list-item-title>システム通知</v-list-item-title>
                    <v-list-item-subtitle>メンテナンスやアップデート情報</v-list-item-subtitle>
                    <template #append>
                      <v-switch
                        v-model="settings.notifications.system"
                        color="info"
                        hide-details
                      />
                    </template>
                  </v-list-item>
                </v-list>
              </div>

              <v-divider class="my-4" />

              <!-- 一般設定 -->
              <div class="general-settings">
                <h4 class="text-subtitle-1 font-weight-bold mb-3">一般設定</h4>
                
                <v-list density="compact">
                  <v-list-item>
                    <v-list-item-title>ダークモード</v-list-item-title>
                    <v-list-item-subtitle>画面テーマを切り替え</v-list-item-subtitle>
                    <template #append>
                      <v-switch
                        v-model="settings.appearance.darkMode"
                        color="primary"
                        hide-details
                        @change="toggleDarkMode"
                      />
                    </template>
                  </v-list-item>
                  
                  <v-list-item>
                    <v-list-item-title>自動更新</v-list-item-title>
                    <v-list-item-subtitle>データの自動更新間隔</v-list-item-subtitle>
                    <template #append>
                      <v-select
                        v-model="settings.general.autoRefresh"
                        :items="autoRefreshOptions"
                        variant="outlined"
                        density="compact"
                        hide-details
                        style="width: 120px;"
                      />
                    </template>
                  </v-list-item>
                </v-list>
              </div>

              <!-- 設定保存ボタン -->
              <div class="mt-6">
                <v-btn
                  color="primary"
                  variant="elevated"
                  block
                  @click="saveSettings"
                  :loading="savingSettings"
                >
                  設定を保存
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- 📱 プラン情報 -->
      <v-row class="mt-6">
        <v-col cols="12">
          <v-card class="settings-card" elevation="0" rounded="xl">
            <v-card-title class="settings-card-title">
              <v-icon icon="mdi-crown" class="mr-3" />
              プラン情報
            </v-card-title>
            
            <v-card-text class="pa-6">
              <div class="d-flex justify-space-between align-center">
                <div>
                  <h3 class="text-h6 font-weight-bold">
                    {{ currentPlan.name }}プラン
                  </h3>
                  <p class="text-body-2 text-grey-darken-1">
                    月額 ¥{{ currentPlan.price.toLocaleString() }}
                  </p>
                </div>
                
                <v-btn
                  color="primary"
                  variant="outlined"
                  to="/billing"
                >
                  プラン変更
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- 🗑️ アカウント削除確認ダイアログ -->
    <v-dialog v-model="showDeleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5 text-error">
          <v-icon icon="mdi-alert" class="mr-2" />
          アカウント削除の確認
        </v-card-title>
        
        <v-card-text>
          <v-alert
            type="error"
            variant="tonal"
            class="mb-4"
          >
            この操作は取り消すことができません
          </v-alert>
          
          <p class="mb-4">
            アカウントを削除すると、以下のデータがすべて失われます：
          </p>
          
          <v-list density="compact">
            <v-list-item
              v-for="item in deleteWarningItems"
              :key="item"
              prepend-icon="mdi-close-circle"
            >
              <v-list-item-title>{{ item }}</v-list-item-title>
            </v-list-item>
          </v-list>
          
          <v-text-field
            v-model="deleteConfirmation"
            label="確認のため「DELETE」と入力してください"
            variant="outlined"
            class="mt-4"
            :error="deleteConfirmation !== '' && deleteConfirmation !== 'DELETE'"
          />
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="showDeleteDialog = false"
          >
            キャンセル
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            :disabled="deleteConfirmation !== 'DELETE'"
            :loading="deletingAccount"
            @click="handleDeleteAccount"
          >
            完全削除
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from 'vuetify'

const router = useRouter()
const authStore = useAuthStore()
const theme = useTheme()

// State
const showDeleteDialog = ref(false)
const deleteConfirmation = ref('')
const deletingAccount = ref(false)
const savingSettings = ref(false)

// 設定データ
const settings = reactive({
  notifications: {
    postSuccess: true,
    postFailure: true,
    system: true
  },
  appearance: {
    darkMode: false
  },
  general: {
    autoRefresh: 30
  }
})

// 現在のプラン情報（仮）
const currentPlan = ref({
  name: 'フリー',
  price: 0
})

// 自動更新間隔オプション
const autoRefreshOptions = [
  { title: '15秒', value: 15 },
  { title: '30秒', value: 30 },
  { title: '1分', value: 60 },
  { title: '5分', value: 300 },
  { title: '無効', value: 0 }
]

// アカウント削除警告項目
const deleteWarningItems = [
  'すべての予約投稿スケジュール',
  '連携しているInstagramアカウント情報',
  'コンテンツライブラリ',
  '投稿履歴とログ',
  'プラン・決済履歴',
  'アカウント設定'
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

const handleDeleteAccount = async () => {
  try {
    deletingAccount.value = true
    
    // TODO: バックエンドAPIでアカウント削除
    // await deleteUserAccount()
    
    // ダミー処理（実際はAPIを呼び出す）
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('アカウント削除処理完了')
    
    // ログアウトしてホームページへ
    await authStore.logout()
    router.push('/')
    
  } catch (error) {
    console.error('アカウント削除エラー:', error)
  } finally {
    deletingAccount.value = false
    showDeleteDialog.value = false
    deleteConfirmation.value = ''
  }
}

const saveSettings = async () => {
  try {
    savingSettings.value = true
    
    // TODO: バックエンドAPIで設定保存
    // await saveUserSettings(settings)
    
    // ダミー処理（実際はAPIを呼び出す）
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // ローカルストレージに保存（仮）
    localStorage.setItem('omniy-settings', JSON.stringify(settings))
    
    console.log('設定保存完了:', settings)
    
  } catch (error) {
    console.error('設定保存エラー:', error)
  } finally {
    savingSettings.value = false
  }
}

const toggleDarkMode = () => {
  theme.global.name.value = settings.appearance.darkMode ? 'dark' : 'light'
}

const loadSettings = () => {
  try {
    const savedSettings = localStorage.getItem('omniy-settings')
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      Object.assign(settings, parsed)
      
      // ダークモード設定を適用
      if (settings.appearance.darkMode) {
        theme.global.name.value = 'dark'
      }
    }
  } catch (error) {
    console.error('設定読み込みエラー:', error)
  }
}

// プラン情報取得
const loadPlanInfo = async () => {
  try {
    // TODO: バックエンドAPIでプラン情報取得
    // const planInfo = await getCurrentPlan()
    // currentPlan.value = planInfo
    
    // 仮データ
    currentPlan.value = {
      name: 'フリー',
      price: 0
    }
  } catch (error) {
    console.error('プラン情報取得エラー:', error)
  }
}

// Lifecycle
onMounted(async () => {
  loadSettings()
  await loadPlanInfo()
})
</script>

<style scoped>
/* 🎨 設定ページのスタイル */

.settings-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%);
}

.settings-card {
  background: white;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.settings-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.settings-card-title {
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
  border-bottom: 1px solid #e2e8f0;
  padding: 20px 24px;
  font-weight: 600;
  color: #2c3e50;
}

.profile-section {
  text-align: center;
}

.profile-info h3 {
  color: #2c3e50;
}

.logout-item {
  border-radius: 8px;
  margin: 4px 0;
  transition: all 0.3s ease;
}

.logout-item:hover {
  background: rgba(25, 118, 210, 0.08);
  transform: translateX(4px);
}

.danger-item {
  border-radius: 8px;
  margin: 4px 0;
  transition: all 0.3s ease;
}

.danger-item:hover {
  background: rgba(244, 67, 54, 0.08);
  transform: translateX(4px);
  color: #f44336;
}

.notification-settings .v-list-item,
.general-settings .v-list-item {
  border-radius: 8px;
  margin: 4px 0;
  transition: all 0.3s ease;
}

.notification-settings .v-list-item:hover,
.general-settings .v-list-item:hover {
  background: rgba(102, 126, 234, 0.04);
}

/* ダイアログスタイル */
.v-dialog .v-card {
  border-radius: 16px !important;
}

.v-dialog .v-card-title {
  background: linear-gradient(135deg, #ffebee 0%, #ffffff 100%);
  border-bottom: 1px solid #ffcdd2;
}

/* アニメーション */
.settings-card {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* レスポンシブ */
@media (max-width: 768px) {
  .profile-section {
    padding: 16px 0;
  }
  
  .settings-card-title {
    padding: 16px 20px;
    font-size: 1.1rem;
  }
}
</style> 