<template>
  <v-container>
    <!-- ページヘッダー -->
    <v-row class="mb-6">
      <v-col cols="12" md="8">
        <h1 class="text-h3 font-weight-bold">
          アカウント管理
        </h1>
        <p class="text-h6 text-grey-darken-1 mt-2">
          Instagram アカウントを管理します
        </p>
      </v-col>
      <v-col cols="12" md="4" class="text-md-right">
        <v-btn
          color="primary"
          size="large"
          @click="showAddDialog = true"
        >
          <v-icon start>mdi-plus</v-icon>
          アカウントを追加
        </v-btn>
      </v-col>
    </v-row>

    <!-- 統計情報 -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" class="pa-4">
          <div class="text-h4 font-weight-bold text-primary">
            {{ igAccountsStore.accountsCount }}
          </div>
          <div class="text-body-2 text-grey-darken-1">
            連携アカウント数
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" class="pa-4">
          <div class="text-h4 font-weight-bold text-success">
            {{ activeAccountsCount }}
          </div>
          <div class="text-body-2 text-grey-darken-1">
            アクティブ
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card elevation="2" class="pa-4">
          <div class="text-h4 font-weight-bold text-warning">
            {{ expiringSoonCount }}
          </div>
          <div class="text-body-2 text-grey-darken-1">
            期限切れ間近
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- アカウント一覧 -->
    <v-row>
      <v-col
        v-for="account in igAccountsStore.accounts"
        :key="account.id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card elevation="2" class="mb-4">
          <v-card-text>
            <!-- アカウント情報 -->
            <div class="d-flex align-center mb-4">
              <v-icon size="48" color="pink" class="mr-4">
                mdi-instagram
              </v-icon>
              <div class="flex-grow-1">
                <div class="text-h6 font-weight-bold">
                  @{{ account.username }}
                </div>
                <div class="text-body-2 text-grey-darken-1">
                  ID: {{ account.instagramUserId }}
                </div>
              </div>
              <v-chip
                :color="getTokenStatusColor(account)"
                size="small"
                variant="flat"
              >
                {{ getTokenStatusText(account) }}
              </v-chip>
            </div>

            <!-- トークン有効期限 -->
            <div class="mb-3">
              <div class="text-body-2 text-grey-darken-1 mb-1">
                トークン有効期限
              </div>
              <div class="text-body-1">
                {{ formatDate(account.tokenExpiresAt) }}
              </div>
              <v-progress-linear
                :model-value="getTokenProgress(account)"
                :color="getTokenStatusColor(account)"
                height="4"
                rounded
                class="mt-2"
              />
            </div>

            <!-- メタ情報 -->
            <div class="text-caption text-grey-darken-1">
              追加日: {{ formatDate(account.createdAt) }}
            </div>
          </v-card-text>

          <v-card-actions>
            <v-btn
              variant="text"
              size="small"
              @click="refreshToken(account)"
              :loading="igAccountsStore.loading"
            >
              <v-icon start>mdi-refresh</v-icon>
              更新
            </v-btn>
            <v-spacer />
            <v-btn
              variant="text"
              size="small"
              color="error"
              @click="confirmDelete(account)"
            >
              <v-icon start>mdi-delete</v-icon>
              削除
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- 空の状態 -->
    <div
      v-if="!igAccountsStore.loading && igAccountsStore.accountsCount === 0"
      class="text-center py-16"
    >
      <v-icon size="120" color="grey-lighten-2" class="mb-4">
        mdi-instagram
      </v-icon>
      <h2 class="text-h5 font-weight-bold mb-4">
        Instagram アカウントがありません
      </h2>
      <p class="text-body-1 text-grey-darken-1 mb-6">
        最初のアカウントを追加して、予約投稿を始めましょう！
      </p>
      <v-btn
        color="primary"
        size="large"
        @click="showAddDialog = true"
      >
        <v-icon start>mdi-plus</v-icon>
        アカウントを追加
      </v-btn>
    </div>

    <!-- アカウント追加ダイアログ -->
    <AddAccountDialog
      v-model="showAddDialog"
      @added="handleAccountAdded"
    />

    <!-- 削除確認ダイアログ -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          アカウントを削除
        </v-card-title>
        <v-card-text>
          Instagram アカウント「@{{ deletingAccount?.username }}」を削除してもよろしいですか？<br>
          <br>
          <strong class="text-error">注意:</strong> このアカウントに関連する予約投稿も削除されます。<br>
          この操作は取り消せません。
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
            variant="text"
            @click="handleDelete"
            :loading="igAccountsStore.loading"
          >
            削除
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- エラースナックバー -->
    <v-snackbar
      v-model="showError"
      color="error"
      timeout="5000"
      location="top"
    >
      {{ igAccountsStore.error }}
      <template #actions>
        <v-btn
          variant="text"
          @click="igAccountsStore.clearError"
        >
          閉じる
        </v-btn>
      </template>
    </v-snackbar>

    <!-- 成功スナックバー -->
    <v-snackbar
      v-model="showSuccess"
      color="success"
      timeout="3000"
      location="top"
    >
      {{ successMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useIgAccountsStore, type IGAccount } from '@/stores/igAccounts'
import { format, differenceInDays } from 'date-fns'
import { ja } from 'date-fns/locale'
import AddAccountDialog from '@/components/AddAccountDialog.vue'

const igAccountsStore = useIgAccountsStore()

// State
const showAddDialog = ref(false)
const showDeleteDialog = ref(false)
const deletingAccount = ref<IGAccount | null>(null)
const showSuccess = ref(false)
const successMessage = ref('')

// Computed
const showError = computed({
  get: () => !!igAccountsStore.error,
  set: () => igAccountsStore.clearError()
})

const activeAccountsCount = computed(() => {
  return igAccountsStore.accounts.filter(account => {
    const daysUntilExpiry = differenceInDays(account.tokenExpiresAt, new Date())
    return daysUntilExpiry > 7
  }).length
})

const expiringSoonCount = computed(() => {
  return igAccountsStore.accounts.filter(account => {
    const daysUntilExpiry = differenceInDays(account.tokenExpiresAt, new Date())
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0
  }).length
})

// Methods
const formatDate = (date: Date) => {
  return format(date, 'yyyy/MM/dd HH:mm', { locale: ja })
}

const getTokenStatusColor = (account: IGAccount) => {
  const daysUntilExpiry = differenceInDays(account.tokenExpiresAt, new Date())
  
  if (daysUntilExpiry <= 0) return 'error'
  if (daysUntilExpiry <= 7) return 'warning'
  if (daysUntilExpiry <= 30) return 'info'
  return 'success'
}

const getTokenStatusText = (account: IGAccount) => {
  const daysUntilExpiry = differenceInDays(account.tokenExpiresAt, new Date())
  
  if (daysUntilExpiry <= 0) return '期限切れ'
  if (daysUntilExpiry <= 7) return '期限間近'
  if (daysUntilExpiry <= 30) return '要注意'
  return 'アクティブ'
}

const getTokenProgress = (account: IGAccount) => {
  const totalDays = 60 // 60日間有効
  const daysUntilExpiry = differenceInDays(account.tokenExpiresAt, new Date())
  const progress = Math.max(0, Math.min(100, (daysUntilExpiry / totalDays) * 100))
  return progress
}

const refreshToken = async (account: IGAccount) => {
  try {
    await igAccountsStore.refreshToken(account.id)
    successMessage.value = `@${account.username} のトークンを更新しました`
    showSuccess.value = true
  } catch (error) {
    console.error('トークン更新エラー:', error)
  }
}

const confirmDelete = (account: IGAccount) => {
  deletingAccount.value = account
  showDeleteDialog.value = true
}

const handleDelete = async () => {
  if (deletingAccount.value) {
    try {
      await igAccountsStore.deleteAccount(deletingAccount.value.id)
      successMessage.value = `@${deletingAccount.value.username} を削除しました`
      showSuccess.value = true
      showDeleteDialog.value = false
      deletingAccount.value = null
    } catch (error) {
      console.error('削除エラー:', error)
    }
  }
}

const handleAccountAdded = () => {
  successMessage.value = 'Instagram アカウントを追加しました'
  showSuccess.value = true
}

// Lifecycle
onMounted(async () => {
  await igAccountsStore.loadAccounts()
})
</script>

<style scoped>
.v-progress-linear {
  border-radius: 4px;
}
</style> 