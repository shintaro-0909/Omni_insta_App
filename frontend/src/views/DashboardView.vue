<template>
  <v-container>
    <!-- ページヘッダー -->
    <v-row class="mb-6">
      <v-col cols="12">
        <h1 class="text-h3 font-weight-bold">
          ダッシュボード
        </h1>
        <p class="text-h6 text-grey-darken-1 mt-2">
          おかえりなさい、{{ authStore.userDisplayName }}さん
        </p>
      </v-col>
    </v-row>

    <!-- 統計カード -->
    <v-row class="mb-6">
      <v-col
        v-for="stat in stats"
        :key="stat.title"
        cols="12"
        sm="6"
        md="3"
      >
        <v-card elevation="2" class="pa-4">
          <v-row align="center" no-gutters>
            <v-col cols="8">
              <div class="text-h4 font-weight-bold">
                {{ stat.value }}
              </div>
              <div class="text-body-2 text-grey-darken-1">
                {{ stat.title }}
              </div>
            </v-col>
            <v-col cols="4" class="text-right">
              <v-icon
                :icon="stat.icon"
                :color="stat.color"
                size="48"
              />
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- クイックアクション -->
    <v-row class="mb-6">
      <v-col cols="12">
        <h2 class="text-h5 font-weight-bold mb-4">
          クイックアクション
        </h2>
        <v-row>
          <v-col
            v-for="action in quickActions"
            :key="action.title"
            cols="12"
            sm="6"
            md="4"
          >
            <v-card
              elevation="2"
              class="pa-6 text-center"
              :color="action.color"
              dark
              @click="handleQuickAction(action)"
              style="cursor: pointer;"
            >
              <v-icon
                :icon="action.icon"
                size="48"
                class="mb-4"
              />
              <v-card-title class="text-h6">
                {{ action.title }}
              </v-card-title>
              <v-card-text>
                {{ action.description }}
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- 使用量ダッシュボード -->
    <v-row class="mb-6">
      <v-col cols="12">
        <UsageDashboard />
      </v-col>
    </v-row>

    <!-- 最近の活動 -->
    <v-row>
      <v-col cols="12" md="8">
        <v-card elevation="2">
          <v-card-title class="text-h6 font-weight-bold">
            最近の投稿予約
          </v-card-title>
          <v-card-text>
            <v-list v-if="recentSchedules.length > 0">
              <v-list-item
                v-for="schedule in recentSchedules"
                :key="schedule.id"
                class="px-0"
              >
                <template #prepend>
                  <v-icon
                    :icon="getScheduleIcon(schedule.type)"
                    :color="getScheduleColor(schedule.status)"
                  />
                </template>
                <v-list-item-title>
                  {{ schedule.title }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatDate(schedule.nextRunAt) }}
                </v-list-item-subtitle>
                <template #append>
                  <v-chip
                    :color="getScheduleColor(schedule.status)"
                    size="small"
                    variant="flat"
                  >
                    {{ getStatusText(schedule.status) }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
            <div v-else class="text-center py-8 text-grey-darken-1">
              まだ投稿予約がありません。<br>
              新しい予約を作成してみましょう！
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="primary"
              variant="text"
              to="/schedules"
            >
              すべて見る
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- アカウント状況 -->
      <v-col cols="12" md="4">
        <v-card elevation="2" class="mb-4">
          <v-card-title class="text-h6 font-weight-bold">
            連携アカウント
          </v-card-title>
          <v-card-text>
            <div v-if="connectedAccounts.length > 0">
              <v-list density="compact">
                <v-list-item
                  v-for="account in connectedAccounts"
                  :key="account.id"
                  class="px-0"
                >
                  <template #prepend>
                    <v-icon color="pink">mdi-instagram</v-icon>
                  </template>
                  <v-list-item-title>
                    @{{ account.username }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </div>
            <div v-else class="text-center py-4 text-grey-darken-1">
              Instagramアカウントを<br>連携してください
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="primary"
              variant="text"
              to="/accounts"
            >
              管理
            </v-btn>
          </v-card-actions>
        </v-card>

        <!-- プラン情報 -->
        <v-card elevation="2">
          <v-card-title class="text-h6 font-weight-bold">
            現在のプラン
          </v-card-title>
          <v-card-text>
            <div class="text-h6 font-weight-bold text-primary mb-2">
              {{ currentPlan.name }}
            </div>
            <div class="text-body-2 text-grey-darken-1 mb-4">
              月間投稿数: {{ currentPlan.usedPosts }}/{{ currentPlan.maxPosts }}
            </div>
            <v-progress-linear
              :model-value="(currentPlan.usedPosts / currentPlan.maxPosts) * 100"
              color="primary"
              height="8"
              rounded
            />
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="primary"
              variant="text"
              to="/settings"
            >
              プラン変更
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useIgAccountsStore } from '@/stores/igAccounts'
import { useSchedulesStore } from '@/stores/schedules'
import UsageDashboard from '@/components/UsageDashboard.vue'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

const router = useRouter()
const authStore = useAuthStore()
const igAccountsStore = useIgAccountsStore()
const schedulesStore = useSchedulesStore()

// 統計データ
const stats = computed(() => [
  {
    title: '今月の投稿数',
    value: '12',
    icon: 'mdi-send',
    color: 'primary'
  },
  {
    title: 'アクティブ予約',
    value: schedulesStore.schedulesCount.active.toString(),
    icon: 'mdi-calendar-clock',
    color: 'warning'
  },
  {
    title: '連携アカウント',
    value: igAccountsStore.accounts.length.toString(),
    icon: 'mdi-instagram',
    color: 'pink'
  },
  {
    title: '総スケジュール',
    value: schedulesStore.schedulesCount.total.toString(),
    icon: 'mdi-check-circle',
    color: 'success'
  }
])

// クイックアクション
const quickActions = [
  {
    title: '新しい予約',
    description: '投稿を予約する',
    icon: 'mdi-plus',
    color: 'primary',
    action: 'create-schedule'
  },
  {
    title: 'アカウント追加',
    description: 'Instagramアカウントを連携',
    icon: 'mdi-account-plus',
    color: 'pink',
    action: 'add-account'
  },
  {
    title: 'コンテンツ追加',
    description: '投稿用コンテンツを登録',
    icon: 'mdi-image-plus',
    color: 'green',
    action: 'add-content'
  }
]

// 最近のスケジュール（実データ）
const recentSchedules = computed(() => 
  schedulesStore.schedules
    .filter(s => s.status === 'active')
    .slice(0, 5)
    .sort((a, b) => {
      const aTime = a.nextRunAt?.seconds || 0
      const bTime = b.nextRunAt?.seconds || 0
      return aTime - bTime
    })
)

// 連携アカウント（実データ）
const connectedAccounts = computed(() => igAccountsStore.accounts)

// 現在のプラン情報
const currentPlan = ref({
  name: 'フリープラン',
  usedPosts: 12,
  maxPosts: 10
})

// Methods
const handleQuickAction = (action: any) => {
  switch (action.action) {
    case 'create-schedule':
      router.push('/schedules?action=create')
      break
    case 'add-account':
      router.push('/accounts?action=add')
      break
    case 'add-content':
      router.push('/content?action=add')
      break
  }
}

const getScheduleIcon = (type: string) => {
  switch (type) {
    case 'one_time':
      return 'mdi-calendar-clock'
    case 'recurring':
      return 'mdi-repeat'
    case 'random':
      return 'mdi-shuffle'
    default:
      return 'mdi-calendar'
  }
}

const getScheduleColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'paused':
      return 'warning'
    case 'error':
      return 'error'
    default:
      return 'grey'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return 'アクティブ'
    case 'paused':
      return '一時停止'
    case 'error':
      return 'エラー'
    default:
      return '不明'
  }
}

const formatDate = (nextRunAt: any) => {
  if (!nextRunAt) return '未設定'
  
  const date = new Date(nextRunAt.seconds * 1000)
  return format(date, 'MM/dd HH:mm', { locale: ja })
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    igAccountsStore.loadAccounts(),
    schedulesStore.fetchSchedules(true)
  ])
})
</script>

<style scoped>
.v-card {
  transition: transform 0.2s ease-in-out;
}

.v-card:hover {
  transform: translateY(-2px);
}
</style> 