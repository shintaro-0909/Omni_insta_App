<template>
  <div class="groups-view">
    <v-container>
      <!-- 🌐 ページヘッダー -->
      <v-row class="mb-6">
        <v-col cols="12">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon icon="mdi-account-group" size="32" color="primary" class="mr-3" />
              <div>
                <h1 class="text-h3 font-weight-bold">グループ管理</h1>
                <p class="text-subtitle-1 text-grey-darken-1 mt-1">
                  Instagramアカウントをグループ化して効率的に管理
                </p>
              </div>
            </div>
            
            <v-btn
              color="primary"
              variant="elevated"
              size="large"
              prepend-icon="mdi-plus"
              @click="openCreateDialog"
            >
              グループ追加
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <!-- 📊 統計カード -->
      <v-row class="mb-6">
        <v-col
          v-for="stat in statsCards"
          :key="stat.title"
          cols="12"
          sm="6"
          md="3"
        >
          <v-card 
            class="stat-card"
            :class="stat.gradient"
            elevation="4"
            rounded="xl"
          >
            <v-card-text class="pa-6">
              <div class="stat-card-content">
                <div class="stat-icon-wrapper">
                  <v-icon
                    :icon="stat.icon"
                    size="28"
                    color="white"
                    class="stat-icon"
                  />
                </div>
                
                <div class="stat-info">
                  <div class="stat-value">{{ stat.value }}</div>
                  <div class="stat-title">{{ stat.title }}</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- 🔍 フィルター -->
      <v-row class="mb-4">
        <v-col cols="12" md="4">
          <v-text-field
            v-model="searchQuery"
            label="グループを検索"
            variant="outlined"
            prepend-inner-icon="mdi-magnify"
            clearable
            density="compact"
            @input="applyFilters"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-select
            v-model="statusFilter"
            :items="statusFilterOptions"
            label="ステータス"
            variant="outlined"
            density="compact"
            clearable
            prepend-inner-icon="mdi-filter"
            @update:model-value="applyFilters"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-select
            v-model="colorFilter"
            :items="colorFilterOptions"
            label="カラー"
            variant="outlined"
            density="compact"
            clearable
            prepend-inner-icon="mdi-palette"
            @update:model-value="applyFilters"
          />
        </v-col>

        <v-col cols="12" md="2">
          <v-btn
            variant="outlined"
            block
            @click="clearFilters"
            prepend-icon="mdi-filter-remove"
          >
            クリア
          </v-btn>
        </v-col>
      </v-row>

      <!-- 📋 グループ一覧 -->
      <v-row>
        <v-col cols="12">
          <v-card class="groups-list-card" elevation="0" rounded="xl">
            <v-card-title class="groups-list-header">
              <div class="d-flex align-center justify-space-between w-100">
                <div class="d-flex align-center">
                  <v-icon icon="mdi-format-list-bulleted" class="mr-3" />
                  グループ一覧
                </div>
                <v-chip variant="outlined" size="small">
                  {{ filteredGroups.length }}件
                </v-chip>
              </div>
            </v-card-title>

            <v-divider />

            <!-- エラー表示 -->
            <v-alert
              v-if="groupsStore.error"
              type="error"
              variant="tonal"
              class="ma-4"
              closable
              @click:close="groupsStore.clearError"
            >
              {{ groupsStore.error }}
            </v-alert>

            <!-- ローディング -->
            <div v-if="groupsStore.loading && filteredGroups.length === 0" class="text-center pa-8">
              <v-progress-circular indeterminate color="primary" size="64" />
              <div class="mt-4 text-subtitle-1">グループを読み込み中...</div>
            </div>

            <!-- 空の状態 -->
            <div v-else-if="filteredGroups.length === 0" class="text-center pa-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">
                mdi-account-group-outline
              </v-icon>
              <div class="text-h6 mb-2">
                {{ searchQuery ? '検索結果がありません' : 'グループがありません' }}
              </div>
              <div class="text-subtitle-1 text-medium-emphasis mb-4">
                {{ searchQuery ? '検索条件を変更してください' : '新しいグループを作成してください' }}
              </div>
              <v-btn
                v-if="!searchQuery"
                color="primary"
                variant="elevated"
                @click="openCreateDialog"
                prepend-icon="mdi-plus"
              >
                グループ追加
              </v-btn>
            </div>

            <!-- グループリスト -->
            <div v-else>
              <v-list>
                <template v-for="(group, index) in filteredGroups" :key="group.id">
                  <v-list-item class="group-item pa-4">
                    <!-- グループ情報 -->
                    <template #prepend>
                      <v-avatar 
                        :color="group.color || 'blue'" 
                        size="48"
                        class="group-color-avatar"
                      >
                        <v-icon 
                          :icon="group.isActive ? 'mdi-account-group' : 'mdi-account-group-outline'"
                          color="white"
                        />
                      </v-avatar>
                    </template>

                    <div class="group-info">
                      <v-list-item-title class="text-h6 mb-1">
                        {{ group.name }}
                        <v-chip
                          v-if="!group.isActive"
                          size="x-small"
                          color="error"
                          variant="outlined"
                          class="ml-2"
                        >
                          非アクティブ
                        </v-chip>
                      </v-list-item-title>

                      <v-list-item-subtitle v-if="group.description" class="mb-2">
                        {{ group.description }}
                      </v-list-item-subtitle>

                      <div class="group-details">
                        <div class="d-flex align-center flex-wrap ga-2 mb-2">
                          <v-chip size="small" variant="outlined" prepend-icon="mdi-instagram">
                            {{ group.igAccountIds.length }} アカウント
                          </v-chip>
                          <v-chip
                            v-if="group.proxyId"
                            size="small"
                            variant="outlined"
                            prepend-icon="mdi-server-network"
                            color="success"
                          >
                            プロキシ設定済み
                          </v-chip>
                          <v-chip
                            v-else
                            size="small"
                            variant="outlined"
                            prepend-icon="mdi-server-off"
                            color="warning"
                          >
                            プロキシ未設定
                          </v-chip>
                        </div>

                        <!-- アカウント一覧 -->
                        <div v-if="group.igAccountIds.length > 0" class="group-accounts">
                          <div class="d-flex align-center flex-wrap ga-1">
                            <v-avatar
                              v-for="accountId in group.igAccountIds.slice(0, 5)"
                              :key="accountId"
                              size="24"
                              class="account-avatar"
                            >
                              <v-img 
                                :src="getAccountAvatar(accountId)"
                                :alt="getAccountName(accountId)"
                              />
                            </v-avatar>
                            <span
                              v-if="group.igAccountIds.length > 5"
                              class="text-caption text-medium-emphasis ml-1"
                            >
                              +{{ group.igAccountIds.length - 5 }}
                            </span>
                          </div>
                        </div>

                        <div class="group-meta mt-2">
                          <div class="text-caption text-medium-emphasis">
                            作成日: {{ formatDate(group.createdAt) }}
                            <span v-if="formatDate(group.updatedAt) !== formatDate(group.createdAt)">
                              • 更新日: {{ formatDate(group.updatedAt) }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- アクション -->
                    <template #append>
                      <div class="d-flex flex-column ga-2">
                        <v-btn
                          icon="mdi-pencil"
                          variant="text"
                          size="small"
                          color="primary"
                          @click="openEditDialog(group)"
                        />
                        <v-btn
                          icon="mdi-delete"
                          variant="text"
                          size="small"
                          color="error"
                          @click="confirmDelete(group)"
                        />
                      </div>
                    </template>
                  </v-list-item>

                  <v-divider v-if="index < filteredGroups.length - 1" />
                </template>
              </v-list>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- ダイアログ -->
    <GroupFormDialog
      v-model="showFormDialog"
      :group="editingGroup"
      @saved="onGroupSaved"
    />

    <!-- 削除確認ダイアログ -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5">
          グループ削除
        </v-card-title>
        <v-card-text>
          「{{ deletingGroup?.name }}」を削除しますか？
          このグループに属するアカウントは影響を受けませんが、グループ設定は失われます。
          この操作は取り消せません。
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDeleteDialog = false">
            キャンセル
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            @click="deleteGroup"
            :loading="deleting"
          >
            削除
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGroupsStore, type Group } from '@/stores/groups'
import { useIgAccountsStore } from '@/stores/igAccounts'
import GroupFormDialog from '@/components/GroupFormDialog.vue'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

// Stores
const groupsStore = useGroupsStore()
const igAccountsStore = useIgAccountsStore()

// State
const searchQuery = ref('')
const statusFilter = ref<string | null>(null)
const colorFilter = ref<string | null>(null)
const showFormDialog = ref(false)
const showDeleteDialog = ref(false)
const editingGroup = ref<Group | undefined>(undefined)
const deletingGroup = ref<Group | undefined>(undefined)
const deleting = ref(false)

// フィルターオプション
const statusFilterOptions = [
  { title: 'アクティブ', value: 'active' },
  { title: '非アクティブ', value: 'inactive' }
]

const colorFilterOptions = [
  { title: 'ブルー', value: 'blue' },
  { title: 'グリーン', value: 'green' },
  { title: 'レッド', value: 'red' },
  { title: 'オレンジ', value: 'orange' },
  { title: 'パープル', value: 'purple' },
  { title: 'ピンク', value: 'pink' },
  { title: 'イエロー', value: 'yellow' },
  { title: 'グレー', value: 'grey' }
]

// Computed
const statsCards = computed(() => [
  {
    title: '総グループ数',
    value: groupsStore.groupStats.total.toString(),
    icon: 'mdi-account-group',
    gradient: 'gradient-primary'
  },
  {
    title: 'アクティブ',
    value: groupsStore.groupStats.active.toString(),
    icon: 'mdi-check-circle',
    gradient: 'gradient-success'
  },
  {
    title: '管理アカウント数',
    value: groupsStore.groupStats.totalAccounts.toString(),
    icon: 'mdi-instagram',
    gradient: 'gradient-warning'
  },
  {
    title: 'プロキシ設定済み',
    value: groupsStore.groupStats.withProxy.toString(),
    icon: 'mdi-server-network',
    gradient: 'gradient-info'
  }
])

const filteredGroups = computed(() => {
  let filtered = [...groupsStore.groups]

  // テキスト検索
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(group =>
      group.name.toLowerCase().includes(query) ||
      group.description?.toLowerCase().includes(query)
    )
  }

  // ステータスフィルター
  if (statusFilter.value) {
    if (statusFilter.value === 'active') {
      filtered = filtered.filter(group => group.isActive)
    } else if (statusFilter.value === 'inactive') {
      filtered = filtered.filter(group => !group.isActive)
    }
  }

  // カラーフィルター
  if (colorFilter.value) {
    filtered = filtered.filter(group => group.color === colorFilter.value)
  }

  return filtered
})

// Methods
const getAccountAvatar = (accountId: string) => {
  const account = igAccountsStore.accounts.find(acc => acc.id === accountId)
  return account?.profilePictureUrl || '/default-avatar.png'
}

const getAccountName = (accountId: string) => {
  const account = igAccountsStore.accounts.find(acc => acc.id === accountId)
  return account?.name || account?.username || 'Unknown'
}

const formatDate = (timestamp: any) => {
  const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : timestamp
  return format(date, 'yyyy/MM/dd HH:mm', { locale: ja })
}

const openCreateDialog = () => {
  editingGroup.value = undefined
  showFormDialog.value = true
}

const openEditDialog = (group: Group) => {
  editingGroup.value = group
  showFormDialog.value = true
}

const onGroupSaved = () => {
  editingGroup.value = undefined
}

const confirmDelete = (group: Group) => {
  deletingGroup.value = group
  showDeleteDialog.value = true
}

const deleteGroup = async () => {
  if (!deletingGroup.value) return

  try {
    deleting.value = true
    await groupsStore.deleteGroup(deletingGroup.value.id)
    showDeleteDialog.value = false
    deletingGroup.value = undefined
  } catch (error) {
    console.error('グループ削除エラー:', error)
  } finally {
    deleting.value = false
  }
}

const applyFilters = () => {
  // フィルターは computed で自動的に適用される
}

const clearFilters = () => {
  searchQuery.value = ''
  statusFilter.value = null
  colorFilter.value = null
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    groupsStore.fetchGroups(),
    igAccountsStore.fetchAccounts()
  ])
})
</script>

<style scoped>
/* 🎨 グループ管理ページのスタイル */

.groups-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%);
}

/* 統計カード */
.stat-card {
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.gradient-success {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.gradient-warning {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  color: #8b5a2b;
}

.gradient-info {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.stat-card-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon-wrapper {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 10px;
  backdrop-filter: blur(10px);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-title {
  font-size: 0.85rem;
  opacity: 0.9;
  font-weight: 500;
}

/* グループリスト */
.groups-list-card {
  background: white;
  border: 1px solid #e2e8f0;
}

.groups-list-header {
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
  border-bottom: 1px solid #e2e8f0;
  padding: 20px 24px;
  font-weight: 600;
  color: #2c3e50;
}

.group-item {
  transition: all 0.3s ease;
  border-radius: 0;
}

.group-item:hover {
  background: rgba(102, 126, 234, 0.04);
}

.group-color-avatar {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.group-info {
  flex: 1;
}

.group-details {
  margin-top: 8px;
}

.group-accounts {
  margin-top: 8px;
}

.account-avatar {
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.group-meta {
  margin-top: 8px;
}

/* アニメーション */
.stat-card {
  animation: fadeInUp 0.6s ease-out;
}

.group-item {
  animation: fadeInLeft 0.4s ease-out;
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

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* レスポンシブ */
@media (max-width: 768px) {
  .stat-card-content {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .group-info {
    margin-left: 0;
  }

  .group-details {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .group-accounts {
    margin-top: 4px;
  }
}
</style>