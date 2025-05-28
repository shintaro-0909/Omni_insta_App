<template>
  <div class="dashboard-view">
    <!-- 🌅 ヒーローセクション -->
    <div class="hero-section">
      <v-container>
        <v-row align="center" class="py-8">
          <v-col cols="12" md="8">
            <div class="hero-content">
              <h1 class="hero-title">
                おかえりなさい、<br>
                <span class="gradient-text">{{ authStore.userDisplayName }}</span>さん ✨
              </h1>
              <p class="hero-subtitle">
                Instagram投稿の自動化で、あなたのクリエイティブな時間を大切にしましょう
              </p>
              
              <!-- 📊 クイック統計 -->
              <div class="quick-stats-chips">
                <v-chip
                  v-for="chip in quickStatsChips"
                  :key="chip.label"
                  :color="chip.color"
                  variant="elevated"
                  size="large"
                  class="mr-3 mb-2"
                >
                  <v-icon :icon="chip.icon" class="mr-2" />
                  {{ chip.label }}: {{ chip.value }}
                </v-chip>
              </div>
            </div>
          </v-col>
          
          <v-col cols="12" md="4" class="text-center">
            <div class="hero-illustration">
              <v-icon
                icon="mdi-instagram"
                size="120"
                class="instagram-icon"
              />
              <div class="floating-elements">
                <v-icon icon="mdi-heart" class="floating-heart" />
                <v-icon icon="mdi-comment" class="floating-comment" />
                <v-icon icon="mdi-send" class="floating-send" />
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <v-container class="dashboard-content">

      <!-- 💫 Instagram風統計カード -->
      <v-row class="mb-8">
        <v-col cols="12">
          <h2 class="section-title">📊 今月の実績</h2>
        </v-col>
        
        <v-col
          v-for="stat in stats"
          :key="stat.title"
          cols="12"
          sm="6"
          md="3"
        >
          <v-card 
            class="stat-card"
            :class="stat.gradient"
            elevation="8"
            rounded="xl"
          >
            <v-card-text class="pa-6">
              <div class="stat-card-content">
                <div class="stat-icon-wrapper">
                  <v-icon
                    :icon="stat.icon"
                    size="32"
                    color="white"
                    class="stat-icon"
                  />
                </div>
                
                <div class="stat-info">
                  <div class="stat-value">{{ stat.value }}</div>
                  <div class="stat-title">{{ stat.title }}</div>
                  
                  <div class="stat-trend">
                    <v-icon 
                      :icon="stat.trend.icon"
                      :color="stat.trend.color"
                      size="16"
                      class="mr-1"
                    />
                    <span :class="`text-${stat.trend.color}`">
                      {{ stat.trend.text }}
                    </span>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- 🚀 モダンクイックアクション -->
      <v-row class="mb-8">
        <v-col cols="12">
          <h2 class="section-title">⚡ クイックアクション</h2>
          <p class="section-subtitle">
            ワンクリックで素早く操作を開始できます
          </p>
        </v-col>
        
        <v-col
          v-for="action in quickActions"
          :key="action.title"
          cols="12"
          sm="6"
          md="4"
        >
          <v-card
            class="action-card"
            elevation="0"
            rounded="xl"
            @click="handleQuickAction(action)"
          >
            <v-card-text class="pa-6 text-center">
              <div class="action-icon-wrapper" :class="action.colorClass">
                <v-icon
                  :icon="action.icon"
                  size="40"
                  color="white"
                  class="action-icon"
                />
              </div>
              
              <h3 class="action-title">{{ action.title }}</h3>
              <p class="action-description">{{ action.description }}</p>
              
              <v-btn
                :color="action.color"
                variant="elevated"
                rounded="xl"
                size="large"
                class="action-button"
              >
                {{ action.buttonText }}
                <v-icon icon="mdi-arrow-right" class="ml-2" />
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- 📈 シンプルプラン表示 (MVP) -->
      <v-row class="mb-8">
        <v-col cols="12">
          <h2 class="section-title">💎 プラン状況</h2>
          <v-card elevation="0" rounded="xl" class="simple-plan-card">
            <v-card-text class="pa-6">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <div class="text-h6 font-weight-bold">{{ currentPlan.name }}</div>
                  <div class="text-body-2 text-grey-darken-1">
                    今月の投稿: {{ currentPlan.usedPosts }}/{{ currentPlan.maxPosts }}
                  </div>
                </div>
                <v-btn
                  color="primary"
                  variant="elevated"
                  to="/billing"
                  rounded="xl"
                >
                  プラン管理
                </v-btn>
              </div>
              <v-progress-linear
                :model-value="(currentPlan.usedPosts / currentPlan.maxPosts) * 100"
                color="primary"
                height="8"
                rounded
                class="mt-4"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- 📋 アクティビティセクション -->
      <v-row class="mb-6">
        <v-col cols="12" md="8">
          <v-card 
            class="activity-card"
            elevation="0" 
            rounded="xl"
          >
            <v-card-title class="activity-header">
              <div class="activity-header-content">
                <div>
                  <v-icon icon="mdi-calendar-clock" class="mr-3" />
                  最近の投稿予約
                </div>
                <v-chip variant="outlined" size="small">
                  {{ recentSchedules.length }}件
                </v-chip>
              </div>
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
</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useIgAccountsStore } from '@/stores/igAccounts'
import { useSchedulesStore } from '@/stores/schedules'
// UsageDashboard removed for MVP simplification
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

const router = useRouter()
const authStore = useAuthStore()
const igAccountsStore = useIgAccountsStore()
const schedulesStore = useSchedulesStore()

// 🎨 ヒーロー統計チップ
const quickStatsChips = computed(() => [
  {
    label: '今月投稿',
    value: '12',
    icon: 'mdi-send-circle',
    color: 'primary'
  },
  {
    label: 'アクティブ',
    value: schedulesStore.schedulesCount.active.toString(),
    icon: 'mdi-play-circle',
    color: 'success'
  },
  {
    label: 'アカウント',
    value: igAccountsStore.accounts.length.toString(),
    icon: 'mdi-instagram',
    color: 'pink'
  }
])

// 💫 Instagram風統計データ
const stats = computed(() => [
  {
    title: '今月の投稿数',
    value: '12',
    icon: 'mdi-send',
    gradient: 'gradient-primary',
    trend: {
      icon: 'mdi-trending-up',
      color: 'success',
      text: '+20% 先月比'
    }
  },
  {
    title: 'アクティブ予約',
    value: schedulesStore.schedulesCount.active.toString(),
    icon: 'mdi-calendar-clock',
    gradient: 'gradient-warning',
    trend: {
      icon: 'mdi-trending-up',
      color: 'success',
      text: '+5 新規追加'
    }
  },
  {
    title: '連携アカウント',
    value: igAccountsStore.accounts.length.toString(),
    icon: 'mdi-instagram',
    gradient: 'gradient-pink',
    trend: {
      icon: 'mdi-check-circle',
      color: 'success',
      text: 'すべて正常'
    }
  },
  {
    title: '総スケジュール',
    value: schedulesStore.schedulesCount.total.toString(),
    icon: 'mdi-check-circle',
    gradient: 'gradient-success',
    trend: {
      icon: 'mdi-trending-up',
      color: 'success',
      text: '+15% 成長中'
    }
  }
])

// 🚀 モダンクイックアクション
const quickActions = [
  {
    title: '新しい予約を作成',
    description: 'Instagram投稿を予約して自動化を開始',
    buttonText: '予約作成',
    icon: 'mdi-plus-circle',
    color: 'primary',
    colorClass: 'action-primary',
    action: 'create-schedule'
  },
  {
    title: 'アカウント連携',
    description: 'Instagramアカウントを安全に接続',
    buttonText: 'アカウント追加',
    icon: 'mdi-account-plus',
    color: 'pink',
    colorClass: 'action-pink',
    action: 'add-account'
  },
  {
    title: 'コンテンツ登録',
    description: '投稿用の画像・動画をライブラリに追加',
    buttonText: 'コンテンツ追加',
    icon: 'mdi-image-plus',
    color: 'green',
    colorClass: 'action-green',
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
/* 🎨 ダッシュボード：Instagram風デザインシステム */

.dashboard-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9ff 0%, #ffffff 50%, #f8f9ff 100%);
}

/* ヒーローセクション */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="%23ffffff" fill-opacity="0.1"><path d="m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/></g></g></svg>') repeat;
  opacity: 0.1;
}

.hero-content {
  position: relative;
  z-index: 2;
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.gradient-text {
  background: linear-gradient(45deg, #ffffff, #f8f9fa, #ffffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.hero-subtitle {
  font-size: 1.3rem;
  opacity: 0.95;
  margin-bottom: 2rem;
  font-weight: 400;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.quick-stats-chips {
  animation: fadeInUp 0.8s ease-out 0.3s both;
}

/* ヒーローイラストレーション */
.hero-illustration {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.instagram-icon {
  background: linear-gradient(45deg, #f093fb, #f5576c, #4facfe);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: pulse 2s ease-in-out infinite;
}

.floating-elements {
  position: absolute;
  width: 100%;
  height: 100%;
}

.floating-heart {
  position: absolute;
  top: 20%;
  right: 10%;
  color: #ff6b9d;
  animation: float 3s ease-in-out infinite;
}

.floating-comment {
  position: absolute;
  top: 60%;
  left: 10%;
  color: #4ecdc4;
  animation: float 3s ease-in-out infinite 1s;
}

.floating-send {
  position: absolute;
  bottom: 20%;
  right: 20%;
  color: #45aaf2;
  animation: float 3s ease-in-out infinite 2s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* ダッシュボードコンテンツ */
.dashboard-content {
  margin-top: -2rem;
  position: relative;
  z-index: 3;
}

/* セクションタイトル */
.section-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
}

.section-subtitle {
  color: #64748b;
  font-size: 1rem;
  margin-bottom: 2rem;
}

/* 統計カード */
.stat-card {
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform 0.6s;
}

.stat-card:hover::before {
  transform: translateX(100%);
}

.stat-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.gradient-warning {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.gradient-pink {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.gradient-success {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.stat-card-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon-wrapper {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 12px;
  backdrop-filter: blur(10px);
}

.stat-icon {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.stat-info {
  flex: 1;
  text-align: left;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-title {
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.stat-trend {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  opacity: 0.8;
}

/* アクションカード */
.action-card {
  background: white;
  border: 1px solid #e2e8f0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.action-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.3);
}

.action-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  position: relative;
  overflow: hidden;
}

.action-icon-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform 0.6s;
}

.action-card:hover .action-icon-wrapper::before {
  transform: translateX(100%);
}

.action-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.action-pink {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.action-green {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.action-icon {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.action-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.action-description {
  color: #64748b;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.action-button {
  transition: all 0.3s ease;
}

/* アクティビティカード */
.activity-card {
  background: white;
  border: 1px solid #e2e8f0;
  backdrop-filter: blur(20px);
}

.activity-header {
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
  border-bottom: 1px solid #e2e8f0;
}

.activity-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  font-weight: 600;
  color: #2c3e50;
}

/* 使用量ダッシュボード */
.usage-dashboard-wrapper {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* アニメーション */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* レスポンシブ */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.2rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .stat-card-content {
    flex-direction: column;
    text-align: center;
  }
  
  .stat-info {
    text-align: center;
  }
}

@media (max-width: 600px) {
  .hero-title {
    font-size: 1.8rem;
  }
  
  .dashboard-content {
    margin-top: -1rem;
  }
}
</style> 