<template>
  <div class="dashboard-layout">
    <!-- サイドバーナビゲーション -->
    <SidebarNavigation />
    
    <div class="dashboard-view">

    <!-- ヒーローセクション -->
    <section class="hero">
      <div class="floating-elements">
        <div class="floating-circle circle-1"></div>
        <div class="floating-circle circle-2"></div>
        <div class="floating-circle circle-3"></div>
      </div>

      <div class="hero-container">
        <div class="hero-content">
          <h1>
            おかえりなさい、<br>
            <span class="gradient-text">{{ authStore.userDisplayName }}</span>さん ✨
          </h1>
          <p class="hero-description">
            Instagram投稿の自動化で、あなたのクリエイティブな時間を大切にしましょう
          </p>
          <div class="hero-stats">
            <div class="stat-item" v-for="chip in quickStatsChips" :key="chip.label">
              <div class="stat-number">{{ chip.value }}</div>
              <div class="stat-label">{{ chip.label }}</div>
            </div>
          </div>
        </div>

      </div>
    </section>

    <div class="dashboard-content">
      <!-- 統計カードセクション -->
      <section class="stats-section">
        <div class="section-header">
          <h2 class="section-title">📊 今月の実績</h2>
          <p class="section-description">あなたのInstagram運用の成果をひと目で確認</p>
        </div>

        <div class="stats-grid">
          <div 
            class="stat-card" 
            v-for="stat in stats" 
            :key="stat.title"
            :class="stat.gradient"
          >
            <div class="stat-icon">{{ stat.iconEmoji }}</div>
            <div class="stat-content">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-title">{{ stat.title }}</div>
              <div class="stat-trend">
                <span :class="`trend-${stat.trend.type}`">
                  {{ stat.trend.text }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- クイックアクションセクション -->
      <section class="actions-section">
        <div class="section-header">
          <h2 class="section-title">⚡ クイックアクション</h2>
          <p class="section-description">ワンクリックで素早く操作を開始できます</p>
        </div>

        <div class="actions-grid">
          <div 
            class="action-card" 
            v-for="action in quickActions" 
            :key="action.title"
            @click="handleQuickAction(action)"
          >
            <div class="action-icon">{{ action.iconEmoji }}</div>
            <h3 class="action-title">{{ action.title }}</h3>
            <p class="action-description">{{ action.description }}</p>
            <div class="action-button">
              {{ action.buttonText }}
              <span class="action-arrow">→</span>
            </div>
          </div>
        </div>
      </section>

      <!-- アクティビティ & プラン情報 -->
      <section class="activity-section">
        <div class="activity-grid">
          <!-- 最近のスケジュール -->
          <div class="activity-card">
            <div class="card-header">
              <div class="header-title">
                <span class="header-icon">📅</span>
                最近の投稿予約
              </div>
              <div class="header-badge">{{ recentSchedules.length }}件</div>
            </div>
            <div class="card-content">
              <div v-if="recentSchedules.length > 0" class="schedule-list">
                <div 
                  v-for="schedule in recentSchedules" 
                  :key="schedule.id" 
                  class="schedule-item"
                >
                  <div class="schedule-icon">{{ getScheduleIcon(schedule.type) }}</div>
                  <div class="schedule-info">
                    <div class="schedule-title">{{ schedule.title }}</div>
                    <div class="schedule-time">{{ formatDate(schedule.nextRunAt) }}</div>
                  </div>
                  <div class="schedule-status" :class="`status-${schedule.status}`">
                    {{ getStatusText(schedule.status) }}
                  </div>
                </div>
              </div>
              <div v-else class="empty-state">
                <div class="empty-icon">📝</div>
                <div class="empty-text">
                  まだ投稿予約がありません。<br>
                  新しい予約を作成してみましょう！
                </div>
              </div>
            </div>
            <div class="card-footer">
              <router-link to="/schedules" class="footer-link">すべて見る →</router-link>
            </div>
          </div>

          <!-- プラン情報 -->
          <div class="plan-card">
            <div class="card-header">
              <div class="header-title">
                <span class="header-icon">💎</span>
                現在のプラン
              </div>
            </div>
            <div class="card-content">
              <div class="plan-info">
                <div class="plan-name">{{ currentPlan.name }}</div>
                <div class="plan-usage">
                  今月の投稿: {{ currentPlan.usedPosts }}/{{ currentPlan.maxPosts }}
                </div>
                <div class="plan-progress">
                  <div 
                    class="progress-bar" 
                    :style="{ width: `${(currentPlan.usedPosts / currentPlan.maxPosts) * 100}%` }"
                  ></div>
                </div>
              </div>
              
              <!-- 連携アカウント -->
              <div class="accounts-info">
                <div class="accounts-title">連携アカウント</div>
                <div v-if="connectedAccounts.length > 0" class="accounts-list">
                  <div 
                    v-for="account in connectedAccounts" 
                    :key="account.id" 
                    class="account-item"
                  >
                    <div class="account-icon">📷</div>
                    <span class="account-name">@{{ account.username }}</span>
                  </div>
                </div>
                <div v-else class="accounts-empty">
                  Instagramアカウントを連携してください
                </div>
              </div>
            </div>
            <div class="card-footer">
              <router-link to="/billing" class="footer-button">プラン管理</router-link>
              <router-link to="/accounts" class="footer-link">アカウント管理</router-link>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, useIgAccountsStore, useSchedulesStore } from '@/stores'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { SidebarNavigation } from '@/components'

const router = useRouter()
const authStore = useAuthStore()
const igAccountsStore = useIgAccountsStore()
const schedulesStore = useSchedulesStore()

// クイック統計チップ
const quickStatsChips = computed(() => [
  {
    label: '今月投稿',
    value: '12',
  },
  {
    label: 'アクティブ予約',
    value: schedulesStore.schedulesCount.active.toString(),
  },
  {
    label: 'アカウント数',
    value: igAccountsStore.accounts.length.toString(),
  },
])

// 統計データ
const stats = computed(() => [
  {
    title: '今月の投稿数',
    value: '12',
    iconEmoji: '📈',
    gradient: 'gradient-primary',
    trend: {
      type: 'positive',
      text: '+20% 先月比',
    },
  },
  {
    title: 'アクティブ予約',
    value: schedulesStore.schedulesCount.active.toString(),
    iconEmoji: '⚡',
    gradient: 'gradient-warning',
    trend: {
      type: 'positive',
      text: '+5 新規追加',
    },
  },
  {
    title: '連携アカウント',
    value: igAccountsStore.accounts.length.toString(),
    iconEmoji: '📱',
    gradient: 'gradient-pink',
    trend: {
      type: 'neutral',
      text: 'すべて正常',
    },
  },
  {
    title: '総スケジュール',
    value: schedulesStore.schedulesCount.total.toString(),
    iconEmoji: '📊',
    gradient: 'gradient-success',
    trend: {
      type: 'positive',
      text: '+15% 成長中',
    },
  },
])

// クイックアクション
const quickActions = [
  {
    title: '新しい予約を作成',
    description: 'Instagram投稿を予約して自動化を開始',
    buttonText: '予約作成',
    iconEmoji: '➕',
    action: 'create-schedule',
  },
  {
    title: 'アカウント連携',
    description: 'Instagramアカウントを安全に接続',
    buttonText: 'アカウント追加',
    iconEmoji: '👤',
    action: 'add-account',
  },
  {
    title: 'コンテンツ登録',
    description: '投稿用の画像・動画をライブラリに追加',
    buttonText: 'コンテンツ追加',
    iconEmoji: '🎨',
    action: 'add-content',
  },
]

// 最近のスケジュール
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

// 連携アカウント
const connectedAccounts = computed(() => igAccountsStore.accounts)

// 現在のプラン情報
const currentPlan = ref({
  name: 'フリープラン',
  usedPosts: 12,
  maxPosts: 10,
})

// Methods
const handleQuickAction = (action: any) => {
  switch (action.action) {
    case 'create-schedule':
      router.push({ path: '/schedules', query: { action: 'create' } })
      break
    case 'add-account':
      router.push({ path: '/accounts', query: { action: 'add' } })
      break
    case 'add-content':
      router.push({ path: '/content', query: { action: 'add' } })
      break
  }
}

const getScheduleIcon = (type: string) => {
  switch (type) {
    case 'one_time':
      return '⏰'
    case 'recurring':
      return '🔄'
    case 'random':
      return '🎲'
    default:
      return '📅'
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
    schedulesStore.fetchSchedules(true),
  ])
})
</script>

<style scoped>
/* LP-demo.htmlと統一されたスタイルシステム */
:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --accent-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  --success-gradient: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  --text-primary: #2d3748;
  --text-secondary: #718096;
  --bg-light: #f7fafc;
  --white: #ffffff;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
}

.dashboard-layout {
  position: relative;
  width: 100%;
  min-height: 100vh;
  background: white;
  overflow-x: hidden;
  display: flex;
}

.dashboard-view {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans JP', sans-serif;
  color: var(--text-primary);
  line-height: 1.6;
  overflow-x: hidden;
  min-height: 100vh;
  background: linear-gradient(180deg, #fafbff 0%, #f3f4f6 100%);
  flex: 1;
  margin-left: 72px;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* サイドバーが開いている場合のマージン調整 */
@media (min-width: 768px) {
  .dashboard-view {
    margin-left: 280px;
  }
}

/* スマホ用調整 */
@media (max-width: 767px) {
  .dashboard-view {
    margin-left: 0;
  }
}

/* 統一ナビゲーション */
.omniy-nav {
  position: fixed;
  top: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  z-index: 1000;
  padding: 1rem 0;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.8rem;
  font-weight: 800;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--text-primary);
}

.cta-button {
  background: var(--primary-gradient);
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 30px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* ヒーローセクション */
.hero {
  margin-top: 80px;
  padding: 4rem 2rem 6rem;
  background: linear-gradient(180deg, #fafbff 0%, #f3f4f6 100%);
  position: relative;
  overflow: hidden;
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-content h1 {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1.5rem;
}

.gradient-text {
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-description {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.8;
}

.hero-stats {
  display: flex;
  gap: 3rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* 浮遊する要素 */
.floating-elements {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

.floating-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  animation: float 20s infinite ease-in-out;
}

.circle-1 {
  width: 200px;
  height: 200px;
  background: var(--primary-gradient);
  top: 10%;
  left: 5%;
  animation-delay: 0s;
}

.circle-2 {
  width: 150px;
  height: 150px;
  background: var(--secondary-gradient);
  top: 60%;
  right: 10%;
  animation-delay: 5s;
}

.circle-3 {
  width: 100px;
  height: 100px;
  background: var(--accent-gradient);
  bottom: 20%;
  left: 15%;
  animation-delay: 10s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, -30px) scale(1.1); }
  50% { transform: translate(-20px, 20px) scale(0.9); }
  75% { transform: translate(20px, 30px) scale(1.05); }
}

/* ダッシュボードモックアップ */
.hero-visual {
  position: relative;
}

.dashboard-phone-mockup {
  width: 320px;
  height: 640px;
  background: #000;
  border-radius: 40px;
  padding: 10px;
  box-shadow: var(--shadow-xl);
  margin: 0 auto;
  position: relative;
}

.phone-screen {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 30px;
  overflow: hidden;
  position: relative;
}

.dashboard-header {
  padding: 1rem;
  border-bottom: 1px solid #efefef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ig-logo {
  font-size: 1.2rem;
  font-weight: 600;
}

.dashboard-stats {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mini-stat {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-light);
  border-radius: 12px;
}

.stat-icon {
  font-size: 1.2rem;
}

.stat-data {
  flex: 1;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-title {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

/* ダッシュボードコンテンツ */
.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 4rem;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
}

.section-description {
  font-size: 1.1rem;
  color: var(--text-secondary);
}

/* 統計セクション */
.stats-section {
  margin-bottom: 6rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.stat-card {
  background: white;
  padding: 2rem;
  border-radius: 20px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.gradient-primary { background: var(--primary-gradient); color: white; }
.gradient-warning { background: var(--secondary-gradient); color: white; }
.gradient-pink { background: var(--accent-gradient); color: white; }
.gradient-success { background: var(--success-gradient); color: white; }

.stat-icon {
  font-size: 2rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 1rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
}

.stat-title {
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
}

.stat-trend {
  font-size: 0.8rem;
  opacity: 0.8;
}

.trend-positive { color: rgba(255, 255, 255, 0.9); }
.trend-neutral { color: rgba(255, 255, 255, 0.8); }

/* アクションセクション */
.actions-section {
  margin-bottom: 6rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.action-card {
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #e2e8f0;
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
  border-color: #667eea;
}

.action-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
}

.action-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.action-description {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.action-button {
  background: var(--primary-gradient);
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 25px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.action-arrow {
  transition: transform 0.3s ease;
}

.action-card:hover .action-arrow {
  transform: translateX(4px);
}

/* アクティビティセクション */
.activity-section {
  margin-bottom: 4rem;
}

.activity-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.activity-card,
.plan-card {
  background: white;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-light);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.header-icon {
  font-size: 1.2rem;
}

.header-badge {
  background: var(--primary-gradient);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.card-content {
  padding: 1.5rem;
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.schedule-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-light);
  border-radius: 12px;
}

.schedule-icon {
  font-size: 1.5rem;
  width: 40px;
  text-align: center;
}

.schedule-info {
  flex: 1;
}

.schedule-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.schedule-time {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.schedule-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-active {
  background: #d1fae5;
  color: #065f46;
}

.status-paused {
  background: #fef3c7;
  color: #92400e;
}

.status-error {
  background: #fee2e2;
  color: #991b1b;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-text {
  line-height: 1.6;
}

.card-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  background: var(--bg-light);
}

.footer-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: #5a67d8;
}

.footer-button {
  background: var(--primary-gradient);
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-block;
  margin-right: 1rem;
}

.footer-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* プラン情報 */
.plan-info {
  margin-bottom: 2rem;
}

.plan-name {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.plan-usage {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.plan-progress {
  background: #e2e8f0;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--primary-gradient);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.accounts-info {
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.accounts-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.accounts-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.account-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--bg-light);
  border-radius: 8px;
}

.account-icon {
  font-size: 1rem;
}

.account-name {
  font-size: 0.9rem;
  color: var(--text-primary);
}

.accounts-empty {
  color: var(--text-secondary);
  font-size: 0.9rem;
  text-align: center;
  padding: 1rem;
  background: var(--bg-light);
  border-radius: 8px;
}

/* レスポンシブ */
@media (max-width: 768px) {
  .hero-container {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .hero-content h1 {
    font-size: 2.5rem;
  }

  .hero-visual {
    order: -1;
    margin-bottom: 2rem;
  }

  .dashboard-phone-mockup {
    width: 280px;
    height: 560px;
  }

  .nav-links {
    display: none;
  }

  .stats-grid,
  .actions-grid {
    grid-template-columns: 1fr;
  }

  .activity-grid {
    grid-template-columns: 1fr;
  }

  .hero-stats {
    justify-content: center;
    flex-wrap: wrap;
    gap: 2rem;
  }

  .section-title {
    font-size: 2rem;
  }
}

/* 全画面レイアウトスタイル */
.fullscreen-layout {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  overflow: hidden;
}

.fullscreen-content {
  width: 90%;
  max-width: 1200px;
  height: 90%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: fullscreenSlideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.fullscreen-header {
  padding: 2rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.8) 100%);
}

.fullscreen-title {
  font-size: 2rem;
  font-weight: 800;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.fullscreen-close {
  width: 48px;
  height: 48px;
  border: none;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.5rem;
  color: var(--text-secondary);
}

.fullscreen-close:hover {
  background: rgba(0, 0, 0, 0.2);
  transform: scale(1.1);
}

.fullscreen-body {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  overflow-x: hidden;
}

.fullscreen-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  height: 100%;
}

.fullscreen-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.fullscreen-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.fullscreen-card-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  text-align: center;
}

.fullscreen-card-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--text-primary);
  text-align: center;
}

.fullscreen-card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

.fullscreen-metric {
  font-size: 3rem;
  font-weight: 800;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.fullscreen-description {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.fullscreen-action {
  background: var(--primary-gradient);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: center;
  min-width: 150px;
}

.fullscreen-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

/* アニメーション */
@keyframes fullscreenSlideIn {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(30px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.fullscreen-fade-enter-active,
.fullscreen-fade-leave-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.fullscreen-fade-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.fullscreen-fade-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

/* 全画面モード時のボディスタイル調整 */
body.fullscreen-active {
  overflow: hidden;
}

/* 全画面レイアウトのモバイル対応 */
@media (max-width: 768px) {
  .fullscreen-content {
    width: 95%;
    height: 95%;
    border-radius: 16px;
  }

  .fullscreen-header {
    padding: 1.5rem;
  }

  .fullscreen-title {
    font-size: 1.5rem;
  }

  .fullscreen-body {
    padding: 1.5rem;
  }

  .fullscreen-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .fullscreen-card {
    padding: 1.5rem;
  }

  .fullscreen-metric {
    font-size: 2.5rem;
  }
}
</style>