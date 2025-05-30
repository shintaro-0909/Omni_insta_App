<template>
  <div class="dashboard-container">
    <!-- Header Section -->
    <div class="dashboard-header">
      <div class="header-content">
        <div class="header-left">
          <div class="greeting-section">
            <h1 class="greeting-title">おはようございます、{{ userName }}さん</h1>
            <p class="greeting-subtitle">{{ currentDate }}・今日も素晴らしい投稿を作りましょう！</p>
          </div>
        </div>
        
        <div class="header-right">
          <div class="quick-actions">
            <v-btn color="primary" variant="flat" size="large" prepend-icon="mdi-plus">
              新規投稿
            </v-btn>
            <v-btn variant="outlined" size="large" prepend-icon="mdi-calendar-plus">
              スケジュール
            </v-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="dashboard-main">
      <v-container fluid class="pa-6">
        <!-- Stats Overview -->
        <div class="stats-section mb-8">
          <v-row>
            <v-col cols="12" md="3" v-for="stat in statsCards" :key="stat.id">
              <div class="stat-card" :class="stat.colorClass">
                <div class="stat-icon">
                  <v-icon :icon="stat.icon" size="32"></v-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ stat.value }}</div>
                  <div class="stat-label">{{ stat.label }}</div>
                  <div class="stat-change" :class="stat.changeClass">
                    <v-icon :icon="stat.changeIcon" size="16"></v-icon>
                    <span>{{ stat.change }}</span>
                  </div>
                </div>
                <div class="stat-chart">
                  <canvas :ref="'chart-' + stat.id" width="60" height="30"></canvas>
                </div>
              </div>
            </v-col>
          </v-row>
        </div>

        <!-- Main Dashboard Grid -->
        <v-row>
          <!-- Left Column -->
          <v-col cols="12" lg="8">
            <!-- Upcoming Posts -->
            <div class="dashboard-section mb-6">
              <div class="section-header">
                <h2 class="section-title">
                  <v-icon icon="mdi-clock-outline" class="mr-3"></v-icon>
                  予定投稿
                </h2>
                <div class="section-actions">
                  <v-chip-group v-model="selectedTimeFilter" mandatory>
                    <v-chip
                      v-for="filter in timeFilters"
                      :key="filter.value"
                      :value="filter.value"
                      variant="outlined"
                      size="small"
                    >
                      {{ filter.label }}
                    </v-chip>
                  </v-chip-group>
                </div>
              </div>

              <div class="upcoming-posts">
                <div class="posts-timeline">
                  <div 
                    v-for="post in upcomingPosts" 
                    :key="post.id"
                    class="timeline-item"
                    :class="post.urgencyClass"
                  >
                    <div class="timeline-marker">
                      <div class="marker-dot"></div>
                      <div class="marker-time">{{ post.timeUntil }}</div>
                    </div>
                    
                    <div class="timeline-content">
                      <div class="post-preview">
                        <div class="post-image">
                          <img :src="post.thumbnail" :alt="post.title" />
                          <div class="post-type-badge">
                            <v-icon :icon="post.typeIcon" size="16"></v-icon>
                          </div>
                        </div>
                        
                        <div class="post-details">
                          <h4 class="post-title">{{ post.title }}</h4>
                          <p class="post-description">{{ post.description }}</p>
                          
                          <div class="post-meta">
                            <div class="meta-item">
                              <v-icon icon="mdi-account-circle" size="16"></v-icon>
                              <span>{{ post.account }}</span>
                            </div>
                            <div class="meta-item">
                              <v-icon icon="mdi-calendar" size="16"></v-icon>
                              <span>{{ post.scheduledTime }}</span>
                            </div>
                            <div class="meta-item">
                              <v-icon icon="mdi-repeat" size="16"></v-icon>
                              <span>{{ post.frequency }}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div class="post-actions">
                          <v-btn icon variant="text" size="small">
                            <v-icon icon="mdi-pencil"></v-icon>
                          </v-btn>
                          <v-btn icon variant="text" size="small">
                            <v-icon icon="mdi-eye"></v-icon>
                          </v-btn>
                          <v-btn icon variant="text" size="small">
                            <v-icon icon="mdi-play"></v-icon>
                          </v-btn>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="view-all-btn">
                  <v-btn variant="outlined" block>
                    全ての予定投稿を表示
                    <v-icon icon="mdi-arrow-right" class="ml-2"></v-icon>
                  </v-btn>
                </div>
              </div>
            </div>

            <!-- Performance Analytics -->
            <div class="dashboard-section">
              <div class="section-header">
                <h2 class="section-title">
                  <v-icon icon="mdi-chart-line" class="mr-3"></v-icon>
                  パフォーマンス分析
                </h2>
                <div class="section-actions">
                  <v-select
                    v-model="selectedPeriod"
                    :items="periodOptions"
                    variant="outlined"
                    density="compact"
                    hide-details
                  ></v-select>
                </div>
              </div>

              <div class="analytics-content">
                <div class="analytics-tabs">
                  <v-tabs v-model="analyticsTab" bg-color="transparent" color="primary">
                    <v-tab value="engagement">エンゲージメント</v-tab>
                    <v-tab value="reach">リーチ</v-tab>
                    <v-tab value="followers">フォロワー</v-tab>
                  </v-tabs>
                </div>

                <v-window v-model="analyticsTab" class="analytics-window">
                  <v-window-item value="engagement">
                    <div class="chart-container">
                      <canvas ref="engagementChart" width="700" height="300"></canvas>
                    </div>
                    
                    <div class="chart-insights">
                      <div class="insight-item">
                        <div class="insight-icon positive">
                          <v-icon icon="mdi-trending-up" size="20"></v-icon>
                        </div>
                        <div class="insight-content">
                          <span class="insight-title">エンゲージメント率が向上</span>
                          <span class="insight-description">先週比 +15.3%</span>
                        </div>
                      </div>
                      
                      <div class="insight-item">
                        <div class="insight-icon neutral">
                          <v-icon icon="mdi-clock" size="20"></v-icon>
                        </div>
                        <div class="insight-content">
                          <span class="insight-title">最適投稿時間</span>
                          <span class="insight-description">19:00-21:00が効果的</span>
                        </div>
                      </div>
                    </div>
                  </v-window-item>

                  <v-window-item value="reach">
                    <div class="chart-container">
                      <canvas ref="reachChart" width="700" height="300"></canvas>
                    </div>
                  </v-window-item>

                  <v-window-item value="followers">
                    <div class="chart-container">
                      <canvas ref="followersChart" width="700" height="300"></canvas>
                    </div>
                  </v-window-item>
                </v-window>
              </div>
            </div>
          </v-col>

          <!-- Right Column -->
          <v-col cols="12" lg="4">
            <!-- Account Status -->
            <div class="dashboard-section mb-6">
              <div class="section-header">
                <h2 class="section-title">
                  <v-icon icon="mdi-account-multiple" class="mr-3"></v-icon>
                  アカウント状況
                </h2>
              </div>

              <div class="accounts-list">
                <div 
                  v-for="account in accounts" 
                  :key="account.id"
                  class="account-item"
                  :class="account.statusClass"
                >
                  <div class="account-avatar">
                    <img :src="account.avatar" :alt="account.name" />
                    <div class="account-status" :class="account.statusClass">
                      <v-icon :icon="account.statusIcon" size="12"></v-icon>
                    </div>
                  </div>
                  
                  <div class="account-info">
                    <h4 class="account-name">{{ account.name }}</h4>
                    <p class="account-handle">{{ account.handle }}</p>
                    
                    <div class="account-stats">
                      <div class="stat-item">
                        <span class="stat-label">フォロワー</span>
                        <span class="stat-value">{{ account.followers }}</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">今日の投稿</span>
                        <span class="stat-value">{{ account.todayPosts }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="account-actions">
                    <v-btn icon variant="text" size="small">
                      <v-icon icon="mdi-dots-vertical"></v-icon>
                    </v-btn>
                  </div>
                </div>
              </div>
            </div>

            <!-- Content Library -->
            <div class="dashboard-section mb-6">
              <div class="section-header">
                <h2 class="section-title">
                  <v-icon icon="mdi-folder-multiple" class="mr-3"></v-icon>
                  コンテンツライブラリ
                </h2>
                <v-btn variant="text" size="small">
                  全て表示
                </v-btn>
              </div>

              <div class="content-grid">
                <div 
                  v-for="content in contentLibrary" 
                  :key="content.id"
                  class="content-item"
                  @click="openContent(content)"
                >
                  <div class="content-thumbnail">
                    <img :src="content.thumbnail" :alt="content.title" />
                    <div class="content-type">
                      <v-icon :icon="content.typeIcon" size="16" color="white"></v-icon>
                    </div>
                    <div class="content-overlay">
                      <v-btn icon variant="text" size="small" color="white">
                        <v-icon icon="mdi-play"></v-icon>
                      </v-btn>
                    </div>
                  </div>
                  
                  <div class="content-info">
                    <h5 class="content-title">{{ content.title }}</h5>
                    <p class="content-date">{{ content.date }}</p>
                  </div>
                </div>
              </div>

              <div class="content-summary">
                <div class="summary-stats">
                  <div class="summary-item">
                    <span class="summary-value">{{ totalContent }}</span>
                    <span class="summary-label">総コンテンツ</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-value">{{ unusedContent }}</span>
                    <span class="summary-label">未使用</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Tips -->
            <div class="dashboard-section">
              <div class="section-header">
                <h2 class="section-title">
                  <v-icon icon="mdi-lightbulb" class="mr-3"></v-icon>
                  今日のヒント
                </h2>
              </div>

              <div class="tips-carousel">
                <div class="tip-item">
                  <div class="tip-icon">
                    <v-icon icon="mdi-timer" size="24" color="primary"></v-icon>
                  </div>
                  <div class="tip-content">
                    <h4 class="tip-title">最適な投稿時間</h4>
                    <p class="tip-description">
                      あなたのフォロワーは19:00-21:00に最もアクティブです。この時間帯の投稿でエンゲージメントを最大化しましょう。
                    </p>
                  </div>
                </div>
              </div>

              <div class="tips-navigation">
                <v-btn icon variant="text" size="small">
                  <v-icon icon="mdi-chevron-left"></v-icon>
                </v-btn>
                <div class="tip-indicators">
                  <div v-for="n in 3" :key="n" class="indicator" :class="{ active: n === 1 }"></div>
                </div>
                <v-btn icon variant="text" size="small">
                  <v-icon icon="mdi-chevron-right"></v-icon>
                </v-btn>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Floating Action Button -->
    <v-fab
      color="primary"
      location="bottom end"
      :offset="{ x: 24, y: 80 }"
      icon="mdi-plus"
      @click="openQuickPost"
    ></v-fab>

    <!-- Quick Post Dialog -->
    <v-dialog v-model="quickPostDialog" max-width="600">
      <v-card class="quick-post-card">
        <v-card-title class="pa-6">
          <v-icon icon="mdi-lightning-bolt" class="mr-3" color="primary"></v-icon>
          クイック投稿
        </v-card-title>
        
        <v-card-text class="pa-6">
          <div class="quick-post-form">
            <v-textarea
              v-model="quickPostText"
              label="投稿内容"
              variant="outlined"
              rows="4"
              auto-grow
              placeholder="今何を投稿しますか？"
            ></v-textarea>
            
            <div class="quick-post-options">
              <v-select
                v-model="quickPostAccount"
                :items="accountOptions"
                label="アカウント選択"
                variant="outlined"
                density="comfortable"
              ></v-select>
              
              <v-select
                v-model="quickPostTiming"
                :items="timingOptions"
                label="投稿タイミング"
                variant="outlined"
                density="comfortable"
              ></v-select>
            </div>
          </div>
        </v-card-text>
        
        <v-card-actions class="pa-6">
          <v-spacer></v-spacer>
          <v-btn variant="outlined" @click="quickPostDialog = false">
            キャンセル
          </v-btn>
          <v-btn color="primary" @click="submitQuickPost">
            投稿する
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'

interface StatCard {
  id: string
  label: string
  value: string
  change: string
  changeClass: string
  changeIcon: string
  icon: string
  colorClass: string
}

interface UpcomingPost {
  id: string
  title: string
  description: string
  thumbnail: string
  account: string
  scheduledTime: string
  timeUntil: string
  frequency: string
  typeIcon: string
  urgencyClass: string
}

interface Account {
  id: string
  name: string
  handle: string
  avatar: string
  followers: string
  todayPosts: string
  statusClass: string
  statusIcon: string
}

interface ContentItem {
  id: string
  title: string
  thumbnail: string
  date: string
  typeIcon: string
}

// Reactive data
const userName = ref('田中')
const selectedTimeFilter = ref('today')
const selectedPeriod = ref('7days')
const analyticsTab = ref('engagement')
const quickPostDialog = ref(false)
const quickPostText = ref('')
const quickPostAccount = ref('')
const quickPostTiming = ref('now')

// Computed
const currentDate = computed(() => {
  const today = new Date()
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    weekday: 'long' 
  }
  return today.toLocaleDateString('ja-JP', options)
})

const totalContent = computed(() => '127')
const unusedContent = computed(() => '23')

// Static data
const statsCards: StatCard[] = [
  {
    id: 'posts',
    label: '今月の投稿',
    value: '42',
    change: '+12%',
    changeClass: 'positive',
    changeIcon: 'mdi-trending-up',
    icon: 'mdi-post',
    colorClass: 'stat-card-primary'
  },
  {
    id: 'engagement',
    label: 'エンゲージメント率',
    value: '8.4%',
    change: '+2.1%',
    changeClass: 'positive',
    changeIcon: 'mdi-trending-up',
    icon: 'mdi-heart',
    colorClass: 'stat-card-secondary'
  },
  {
    id: 'reach',
    label: '総リーチ',
    value: '15.2K',
    change: '+850',
    changeClass: 'positive',
    changeIcon: 'mdi-trending-up',
    icon: 'mdi-eye',
    colorClass: 'stat-card-accent'
  },
  {
    id: 'followers',
    label: '新規フォロワー',
    value: '+127',
    change: '-5%',
    changeClass: 'negative',
    changeIcon: 'mdi-trending-down',
    icon: 'mdi-account-plus',
    colorClass: 'stat-card-success'
  }
]

const timeFilters = [
  { label: '今日', value: 'today' },
  { label: '明日', value: 'tomorrow' },
  { label: '今週', value: 'week' },
  { label: '来週', value: 'next-week' }
]

const periodOptions = [
  { title: '過去7日間', value: '7days' },
  { title: '過去30日間', value: '30days' },
  { title: '過去3ヶ月', value: '3months' }
]

const upcomingPosts: UpcomingPost[] = [
  {
    id: '1',
    title: 'モーニングコーヒーの写真',
    description: '新しいカフェで撮影した美味しそうなラテアート',
    thumbnail: 'https://picsum.photos/80/80?random=1',
    account: '@cafe_lover',
    scheduledTime: '今日 9:00',
    timeUntil: '45分後',
    frequency: '毎日',
    typeIcon: 'mdi-image',
    urgencyClass: 'urgent'
  },
  {
    id: '2',
    title: 'ランチタイムの動画',
    description: '手作りパスタの調理過程を撮影したタイムラプス',
    thumbnail: 'https://picsum.photos/80/80?random=2',
    account: '@food_creator',
    scheduledTime: '今日 12:30',
    timeUntil: '4時間後',
    frequency: '平日のみ',
    typeIcon: 'mdi-video',
    urgencyClass: 'upcoming'
  },
  {
    id: '3',
    title: 'サンセットの風景',
    description: '海辺で撮影した美しい夕日の写真シリーズ',
    thumbnail: 'https://picsum.photos/80/80?random=3',
    account: '@nature_shots',
    scheduledTime: '今日 19:00',
    timeUntil: '10時間後',
    frequency: '週3回',
    typeIcon: 'mdi-image-multiple',
    urgencyClass: 'scheduled'
  }
]

const accounts: Account[] = [
  {
    id: '1',
    name: 'カフェラバー',
    handle: '@cafe_lover',
    avatar: 'https://picsum.photos/40/40?random=10',
    followers: '12.5K',
    todayPosts: '3',
    statusClass: 'active',
    statusIcon: 'mdi-check-circle'
  },
  {
    id: '2',
    name: 'フードクリエイター',
    handle: '@food_creator',
    avatar: 'https://picsum.photos/40/40?random=11',
    followers: '8.2K',
    todayPosts: '2',
    statusClass: 'active',
    statusIcon: 'mdi-check-circle'
  },
  {
    id: '3',
    name: 'ネイチャーフォト',
    handle: '@nature_shots',
    avatar: 'https://picsum.photos/40/40?random=12',
    followers: '15.7K',
    todayPosts: '0',
    statusClass: 'warning',
    statusIcon: 'mdi-clock-alert'
  }
]

const contentLibrary: ContentItem[] = [
  {
    id: '1',
    title: 'モーニングルーティン',
    thumbnail: 'https://picsum.photos/120/120?random=20',
    date: '2日前',
    typeIcon: 'mdi-video'
  },
  {
    id: '2',
    title: 'コーヒーアート',
    thumbnail: 'https://picsum.photos/120/120?random=21',
    date: '3日前',
    typeIcon: 'mdi-image'
  },
  {
    id: '3',
    title: 'レシピ動画',
    thumbnail: 'https://picsum.photos/120/120?random=22',
    date: '5日前',
    typeIcon: 'mdi-video'
  },
  {
    id: '4',
    title: '風景写真',
    thumbnail: 'https://picsum.photos/120/120?random=23',
    date: '1週間前',
    typeIcon: 'mdi-image-multiple'
  }
]

const accountOptions = [
  { title: 'カフェラバー (@cafe_lover)', value: 'cafe_lover' },
  { title: 'フードクリエイター (@food_creator)', value: 'food_creator' },
  { title: 'ネイチャーフォト (@nature_shots)', value: 'nature_shots' }
]

const timingOptions = [
  { title: '今すぐ投稿', value: 'now' },
  { title: '最適時間に投稿', value: 'optimal' },
  { title: '時間を指定', value: 'scheduled' }
]

// Methods
const openContent = (content: ContentItem) => {
  console.log('Opening content:', content.title)
}

const openQuickPost = () => {
  quickPostDialog.value = true
}

const submitQuickPost = () => {
  console.log('Quick post submitted:', quickPostText.value)
  quickPostDialog.value = false
  quickPostText.value = ''
}

// Chart initialization (placeholder)
onMounted(() => {
  nextTick(() => {
    // Initialize mini charts for stat cards
    statsCards.forEach(stat => {
      const canvas = document.querySelector(`[ref="chart-${stat.id}"]`) as HTMLCanvasElement
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          // Simple mini chart drawing
          ctx.strokeStyle = '#667eea'
          ctx.lineWidth = 2
          ctx.beginPath()
          for (let i = 0; i < 10; i++) {
            const x = (i / 9) * 60
            const y = 15 + Math.sin(i * 0.5) * 10
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
          ctx.stroke()
        }
      }
    })
  })
})
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.dashboard-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 2rem 0;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.greeting-section {
  display: flex;
  flex-direction: column;
}

.greeting-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2D3748;
  margin-bottom: 0.5rem;
}

.greeting-subtitle {
  color: #718096;
  font-size: 1rem;
  margin: 0;
}

.quick-actions {
  display: flex;
  gap: 1rem;
}

.dashboard-main {
  padding: 2rem 0;
}

.stats-section {
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.stat-card-primary::before { background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); }
.stat-card-secondary::before { background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%); }
.stat-card-accent::before { background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%); }
.stat-card-success::before { background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%); }

.stat-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2D3748;
  line-height: 1;
}

.stat-label {
  color: #718096;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  font-weight: 600;
}

.stat-change.positive { color: #10B981; }
.stat-change.negative { color: #EF4444; }
.stat-change.neutral { color: #6B7280; }

.stat-chart {
  width: 60px;
  height: 30px;
}

.dashboard-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.dashboard-section:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2D3748;
  margin: 0;
  display: flex;
  align-items: center;
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.upcoming-posts {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.posts-timeline {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.timeline-item {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.timeline-item.urgent {
  background: rgba(239, 68, 68, 0.05);
  border-left-color: #EF4444;
}

.timeline-item.upcoming {
  background: rgba(245, 158, 11, 0.05);
  border-left-color: #F59E0B;
}

.timeline-item.scheduled {
  background: rgba(59, 130, 246, 0.05);
  border-left-color: #3B82F6;
}

.timeline-item:hover {
  background: rgba(0, 0, 0, 0.02);
  transform: translateX(4px);
}

.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 80px;
}

.marker-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.marker-time {
  font-size: 0.8rem;
  font-weight: 600;
  color: #667eea;
  text-align: center;
  white-space: nowrap;
}

.timeline-content {
  flex: 1;
}

.post-preview {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.post-image {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.post-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-type-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.post-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.post-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2D3748;
  margin: 0;
}

.post-description {
  color: #718096;
  font-size: 0.9rem;
  margin: 0;
}

.post-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: #718096;
}

.post-actions {
  display: flex;
  gap: 0.5rem;
}

.view-all-btn {
  margin-top: 1rem;
}

.analytics-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.analytics-tabs {
  border-bottom: 1px solid #E2E8F0;
}

.analytics-window {
  min-height: 400px;
}

.chart-container {
  background: #F7FAFC;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart-insights {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.insight-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #F7FAFC;
  border-radius: 8px;
  flex: 1;
  min-width: 250px;
}

.insight-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.insight-icon.positive { background: rgba(16, 185, 129, 0.1); color: #10B981; }
.insight-icon.negative { background: rgba(239, 68, 68, 0.1); color: #EF4444; }
.insight-icon.neutral { background: rgba(107, 114, 128, 0.1); color: #6B7280; }

.insight-content {
  display: flex;
  flex-direction: column;
}

.insight-title {
  font-weight: 600;
  color: #2D3748;
  font-size: 0.9rem;
}

.insight-description {
  color: #718096;
  font-size: 0.8rem;
}

.accounts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.account-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.account-item:hover {
  border-color: #CBD5E0;
  background: #F7FAFC;
}

.account-item.active {
  border-color: #10B981;
  background: rgba(16, 185, 129, 0.05);
}

.account-item.warning {
  border-color: #F59E0B;
  background: rgba(245, 158, 11, 0.05);
}

.account-avatar {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.account-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.account-status {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.account-status.active { background: #10B981; }
.account-status.warning { background: #F59E0B; }

.account-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.account-name {
  font-size: 1rem;
  font-weight: 600;
  color: #2D3748;
  margin: 0;
}

.account-handle {
  color: #718096;
  font-size: 0.9rem;
  margin: 0;
}

.account-stats {
  display: flex;
  gap: 1rem;
}

.account-stats .stat-item {
  display: flex;
  flex-direction: column;
}

.account-stats .stat-label {
  font-size: 0.7rem;
  color: #A0AEC0;
}

.account-stats .stat-value {
  font-size: 0.8rem;
  font-weight: 600;
  color: #2D3748;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.content-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.content-item:hover {
  transform: translateY(-2px);
}

.content-thumbnail {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background: #F7FAFC;
}

.content-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.content-type {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.content-item:hover .content-overlay {
  opacity: 1;
}

.content-info {
  padding: 0.5rem 0;
}

.content-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #2D3748;
  margin: 0 0 0.25rem 0;
}

.content-date {
  font-size: 0.8rem;
  color: #718096;
  margin: 0;
}

.content-summary {
  border-top: 1px solid #E2E8F0;
  padding-top: 1rem;
}

.summary-stats {
  display: flex;
  justify-content: space-around;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.summary-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2D3748;
}

.summary-label {
  font-size: 0.8rem;
  color: #718096;
}

.tips-carousel {
  margin-bottom: 1rem;
}

.tip-item {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 12px;
}

.tip-icon {
  width: 50px;
  height: 50px;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tip-content {
  flex: 1;
}

.tip-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2D3748;
  margin: 0 0 0.5rem 0;
}

.tip-description {
  color: #718096;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
}

.tips-navigation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.tip-indicators {
  display: flex;
  gap: 0.5rem;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #E2E8F0;
  transition: background 0.3s ease;
}

.indicator.active {
  background: #667eea;
}

.quick-post-card {
  border-radius: 20px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.quick-post-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.quick-post-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 1200px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .greeting-title {
    font-size: 1.5rem;
  }
  
  .quick-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .chart-insights {
    flex-direction: column;
  }
  
  .post-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .quick-post-options {
    grid-template-columns: 1fr;
  }
}
</style>