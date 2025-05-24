<template>
  <div class="schedules-view">
    <v-container fluid>
      <!-- ヘッダー -->
      <v-row class="mb-6">
        <v-col cols="12">
          <div class="d-flex align-center justify-space-between">
            <div>
              <h1 class="text-h4 font-weight-bold mb-2">スケジュール管理</h1>
              <p class="text-subtitle-1 text-medium-emphasis">
                Instagram投稿のスケジュールを管理します
              </p>
            </div>
            <v-btn
              color="primary"
              variant="elevated"
              size="large"
              prepend-icon="mdi-plus"
              @click="openCreateDialog"
            >
              新規作成
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <!-- 統計情報 -->
      <v-row class="mb-6">
        <v-col cols="12" sm="6" md="3">
          <v-card variant="outlined">
            <v-card-text class="text-center pa-6">
              <v-icon size="48" color="primary" class="mb-3">
                mdi-calendar-clock
              </v-icon>
              <div class="text-h4 font-weight-bold mb-1">
                {{ schedulesStore.schedulesCount.total }}
              </div>
              <div class="text-subtitle-2 text-medium-emphasis">
                総スケジュール数
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card variant="outlined">
            <v-card-text class="text-center pa-6">
              <v-icon size="48" color="success" class="mb-3">
                mdi-play-circle
              </v-icon>
              <div class="text-h4 font-weight-bold mb-1">
                {{ schedulesStore.schedulesCount.active }}
              </div>
              <div class="text-subtitle-2 text-medium-emphasis">
                アクティブ
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card variant="outlined">
            <v-card-text class="text-center pa-6">
              <v-icon size="48" color="info" class="mb-3">
                mdi-check-circle
              </v-icon>
              <div class="text-h4 font-weight-bold mb-1">
                {{ schedulesStore.schedulesCount.completed }}
              </div>
              <div class="text-subtitle-2 text-medium-emphasis">
                完了
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card variant="outlined">
            <v-card-text class="text-center pa-6">
              <v-icon size="48" color="error" class="mb-3">
                mdi-alert-circle
              </v-icon>
              <div class="text-h4 font-weight-bold mb-1">
                {{ schedulesStore.schedulesCount.error }}
              </div>
              <div class="text-subtitle-2 text-medium-emphasis">
                エラー
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- フィルター -->
      <v-row class="mb-4">
        <v-col cols="12" md="3">
          <v-select
            v-model="statusFilter"
            :items="statusItems"
            label="ステータス"
            variant="outlined"
            clearable
            prepend-inner-icon="mdi-filter"
            @update:model-value="applyFilters"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-select
            v-model="typeFilter"
            :items="typeItems"
            label="投稿タイプ"
            variant="outlined"
            clearable
            prepend-inner-icon="mdi-calendar-clock"
            @update:model-value="applyFilters"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-select
            v-model="igAccountFilter"
            :items="igAccountItems"
            label="Instagramアカウント"
            variant="outlined"
            clearable
            prepend-inner-icon="mdi-instagram"
            @update:model-value="applyFilters"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-btn
            variant="outlined"
            block
            @click="clearFilters"
            prepend-icon="mdi-filter-remove"
          >
            フィルタークリア
          </v-btn>
        </v-col>
      </v-row>

      <!-- スケジュール一覧 -->
      <v-row>
        <v-col cols="12">
          <v-card variant="outlined">
            <v-card-title class="pa-6">
              <v-icon class="mr-3">mdi-format-list-bulleted</v-icon>
              スケジュール一覧
            </v-card-title>

            <v-divider />

            <!-- エラー表示 -->
            <v-alert
              v-if="schedulesStore.error"
              type="error"
              variant="tonal"
              class="ma-4"
              closable
              @click:close="schedulesStore.clearError"
            >
              {{ schedulesStore.error }}
            </v-alert>

            <!-- ローディング -->
            <div v-if="schedulesStore.loading && schedules.length === 0" class="text-center pa-8">
              <v-progress-circular indeterminate color="primary" size="64" />
              <div class="mt-4 text-subtitle-1">スケジュールを読み込み中...</div>
            </div>

            <!-- 空の状態 -->
            <div v-else-if="schedules.length === 0" class="text-center pa-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">
                mdi-calendar-remove
              </v-icon>
              <div class="text-h6 mb-2">スケジュールがありません</div>
              <div class="text-subtitle-1 text-medium-emphasis mb-4">
                新しいスケジュールを作成してください
              </div>
              <v-btn
                color="primary"
                variant="elevated"
                @click="openCreateDialog"
                prepend-icon="mdi-plus"
              >
                新規作成
              </v-btn>
            </div>

            <!-- スケジュールリスト -->
            <div v-else>
              <v-list>
                <template v-for="(schedule, index) in schedules" :key="schedule.id">
                  <v-list-item
                    class="pa-4"
                    @click="viewSchedule(schedule)"
                  >
                    <template #prepend>
                      <v-avatar :color="getStatusColor(schedule.status)" size="40">
                        <v-icon :icon="getStatusIcon(schedule.status)" />
                      </v-avatar>
                    </template>

                    <v-list-item-title class="text-h6 mb-1">
                      {{ schedule.title }}
                    </v-list-item-title>

                    <v-list-item-subtitle class="mb-2">
                      <div class="d-flex align-center flex-wrap ga-2">
                        <v-chip size="small" variant="outlined">
                          {{ getTypeText(schedule.type) }}
                        </v-chip>
                        <v-chip
                          size="small"
                          :color="getStatusColor(schedule.status)"
                          variant="tonal"
                        >
                          {{ getStatusText(schedule.status) }}
                        </v-chip>
                        <span class="text-caption">
                          @{{ schedule.igAccount?.username }}
                        </span>
                      </div>
                    </v-list-item-subtitle>

                    <div class="text-body-2 text-medium-emphasis">
                      <div>次回実行: {{ formatNextRun(schedule.nextRunAt) }}</div>
                      <div>実行回数: {{ schedule.runCount }}回</div>
                    </div>

                    <template #append>
                      <div class="d-flex flex-column ga-2">
                        <v-btn
                          icon="mdi-pencil"
                          variant="text"
                          size="small"
                          @click.stop="editSchedule(schedule)"
                        />
                        <v-btn
                          icon="mdi-delete"
                          variant="text"
                          size="small"
                          color="error"
                          @click.stop="confirmDelete(schedule)"
                        />
                      </div>
                    </template>
                  </v-list-item>

                  <v-divider v-if="index < schedules.length - 1" />
                </template>
              </v-list>

              <!-- 無限スクロール -->
              <div
                v-if="schedulesStore.hasMore"
                class="text-center pa-4"
                v-intersect="loadMore"
              >
                <v-progress-circular
                  v-if="schedulesStore.loading"
                  indeterminate
                  color="primary"
                />
                <v-btn
                  v-else
                  variant="text"
                  @click="loadMore"
                >
                  さらに読み込む
                </v-btn>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- ダイアログ -->
    <ScheduleFormDialog
      v-model="showFormDialog"
      :schedule="editingSchedule"
      @saved="onScheduleSaved"
    />

    <ScheduleViewDialog
      v-model="showViewDialog"
      :schedule="viewingSchedule"
      @edit="onEditFromView"
    />

    <!-- 削除確認ダイアログ -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5">
          スケジュール削除
        </v-card-title>
        <v-card-text>
          「{{ deletingSchedule?.title }}」を削除しますか？
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
            @click="deleteSchedule"
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
import { useSchedulesStore, type Schedule, type ScheduleStatus, type ScheduleType } from '@/stores/schedules'
import { useIgAccountsStore } from '@/stores/igAccounts'
import ScheduleFormDialog from '@/components/ScheduleFormDialog.vue'
import ScheduleViewDialog from '@/components/ScheduleViewDialog.vue'

// Stores
const schedulesStore = useSchedulesStore()
const igAccountsStore = useIgAccountsStore()

// Reactive data
const statusFilter = ref<ScheduleStatus | null>(null)
const typeFilter = ref<ScheduleType | null>(null)
const igAccountFilter = ref<string | null>(null)

const showFormDialog = ref(false)
const showViewDialog = ref(false)
const showDeleteDialog = ref(false)

const editingSchedule = ref<Schedule | undefined>(undefined)
const viewingSchedule = ref<Schedule | undefined>(undefined)
const deletingSchedule = ref<Schedule | undefined>(undefined)
const deleting = ref(false)

// Computed
const schedules = computed(() => schedulesStore.schedules)

const statusItems = [
  { title: 'アクティブ', value: 'active' },
  { title: '一時停止', value: 'paused' },
  { title: 'エラー', value: 'error' },
  { title: '完了', value: 'completed' }
]

const typeItems = [
  { title: '一回限り投稿', value: 'one_time' },
  { title: '繰返投稿', value: 'recurring' },
  { title: 'ランダム投稿', value: 'random' }
]

const igAccountItems = computed(() =>
  igAccountsStore.accounts.map((account: any) => ({
    title: `@${account.username}`,
    value: account.id
  }))
)

// Methods
const openCreateDialog = () => {
  editingSchedule.value = undefined
  showFormDialog.value = true
}

const editSchedule = (schedule: Schedule) => {
  editingSchedule.value = schedule
  showFormDialog.value = true
}

const viewSchedule = (schedule: Schedule) => {
  viewingSchedule.value = schedule
  showViewDialog.value = true
}

const onEditFromView = (schedule: Schedule) => {
  showViewDialog.value = false
  setTimeout(() => {
    editingSchedule.value = schedule
    showFormDialog.value = true
  }, 300)
}

const confirmDelete = (schedule: Schedule) => {
  deletingSchedule.value = schedule
  showDeleteDialog.value = true
}

const deleteSchedule = async () => {
  if (!deletingSchedule.value) return

  try {
    deleting.value = true
    await schedulesStore.deleteSchedule(
      deletingSchedule.value.id,
      deletingSchedule.value.igAccount?.id || ''
    )
    showDeleteDialog.value = false
    deletingSchedule.value = undefined
  } catch (error) {
    console.error('Error deleting schedule:', error)
  } finally {
    deleting.value = false
  }
}

const onScheduleSaved = () => {
  // フォームダイアログが閉じられた後、リストを更新
  editingSchedule.value = undefined
}

const applyFilters = async () => {
  const filters: any = {}
  
  if (statusFilter.value) {
    filters.status = statusFilter.value
  }
  
  if (typeFilter.value) {
    filters.type = typeFilter.value
  }
  
  if (igAccountFilter.value) {
    filters.igAccountId = igAccountFilter.value
  }

  await schedulesStore.fetchSchedules(true, filters)
}

const clearFilters = async () => {
  statusFilter.value = null
  typeFilter.value = null
  igAccountFilter.value = null
  await schedulesStore.fetchSchedules(true)
}

const loadMore = async () => {
  if (schedulesStore.loading || !schedulesStore.hasMore) return

  const filters: any = {}
  
  if (statusFilter.value) {
    filters.status = statusFilter.value
  }
  
  if (typeFilter.value) {
    filters.type = typeFilter.value
  }
  
  if (igAccountFilter.value) {
    filters.igAccountId = igAccountFilter.value
  }

  await schedulesStore.fetchSchedules(false, filters)
}

// Utility functions
const getStatusColor = (status: ScheduleStatus): string => {
  switch (status) {
    case 'active':
      return 'success'
    case 'paused':
      return 'warning'
    case 'error':
      return 'error'
    case 'completed':
      return 'info'
    default:
      return 'grey'
  }
}

const getStatusIcon = (status: ScheduleStatus): string => {
  switch (status) {
    case 'active':
      return 'mdi-play'
    case 'paused':
      return 'mdi-pause'
    case 'error':
      return 'mdi-alert'
    case 'completed':
      return 'mdi-check'
    default:
      return 'mdi-help'
  }
}

const getStatusText = (status: ScheduleStatus): string => {
  switch (status) {
    case 'active':
      return 'アクティブ'
    case 'paused':
      return '一時停止'
    case 'error':
      return 'エラー'
    case 'completed':
      return '完了'
    default:
      return '不明'
  }
}

const getTypeText = (type: ScheduleType): string => {
  switch (type) {
    case 'one_time':
      return '一回限り'
    case 'recurring':
      return '繰返'
    case 'random':
      return 'ランダム'
    default:
      return '不明'
  }
}

const formatNextRun = (nextRunAt: any): string => {
  if (!nextRunAt) return '未設定'
  
  const date = new Date(nextRunAt.seconds * 1000)
  const now = new Date()
  
  // 今日の場合は時刻のみ表示
  if (date.toDateString() === now.toDateString()) {
    return `今日 ${date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`
  }
  
  // 明日の場合
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (date.toDateString() === tomorrow.toDateString()) {
    return `明日 ${date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`
  }
  
  // それ以外は日付と時刻
  return date.toLocaleString('ja-JP', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(async () => {
  // データを取得
  await Promise.all([
    schedulesStore.fetchSchedules(true),
    igAccountsStore.loadAccounts()
  ])
})
</script>

<style scoped>
.schedules-view {
  min-height: 100vh;
  background-color: rgb(var(--v-theme-surface));
}

.v-list-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.v-list-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
}
</style> 