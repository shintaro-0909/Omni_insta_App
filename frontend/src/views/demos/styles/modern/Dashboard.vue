<template>
  <div class="modern-dashboard">
    <!-- Enhanced Header with Better Typography and Spacing -->
    <header class="dashboard-header" role="banner">
      <v-container>
        <v-row align="center" justify="space-between">
          <v-col cols="auto">
            <div class="greeting-section">
              <h1 class="greeting-title">
                <span class="greeting-main">Welcome back,</span>
                <span class="greeting-name">Sarah!</span>
              </h1>
              <p class="greeting-subtitle">Your Instagram empire is growing 🚀</p>
              <div class="quick-stats">
                <span class="stat-chip">+12 new followers today</span>
                <span class="stat-chip">3 posts scheduled</span>
              </div>
            </div>
          </v-col>
          <v-col cols="auto">
            <div class="header-actions">
              <BaseButton
                variant="modern"
                color="primary"
                size="lg"
                class="create-post-btn"
                prepend-icon="mdi-plus"
                @click="createPost"
              >
                Create Post
              </BaseButton>
              <div class="user-profile">
                <div class="notification-indicator">
                  <v-btn icon size="small" class="notification-btn">
                    <v-icon>mdi-bell</v-icon>
                    <span class="notification-badge">3</span>
                  </v-btn>
                </div>
                <v-avatar size="48" class="user-avatar">
                  <v-img 
                    src="https://randomuser.me/api/portraits/women/1.jpg"
                    alt="User profile picture"
                  ></v-img>
                </v-avatar>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </header>

    <!-- Enhanced Statistics Cards with Better Animation and Accessibility -->
    <section class="stats-section" aria-label="Key statistics">
      <v-container>
        <v-row>
          <v-col
            v-for="(stat, index) in stats"
            :key="index"
            cols="12"
            sm="6"
            lg="3"
          >
            <BaseCard
              variant="modern"
              size="md"
              hoverable
              :elevation="2"
              class="stat-card"
              :class="`stat-card--${stat.color}`"
              data-aos="fade-up"
              :data-aos-delay="index * 100"
              :aria-label="`${stat.label}: ${stat.value}, ${stat.change} ${stat.trend}`"
            >
              <div class="stat-content">
                <div class="stat-icon-wrapper">
                  <div class="stat-icon" :class="`stat-icon--${stat.color}`">
                    <v-icon :icon="stat.icon" size="28"></v-icon>
                  </div>
                </div>
                <div class="stat-details">
                  <div class="stat-value">{{ stat.value }}</div>
                  <div class="stat-label">{{ stat.label }}</div>
                  <div class="stat-change" :class="stat.trend">
                    <v-icon 
                      :icon="stat.trend === 'up' ? 'mdi-trending-up' : 'mdi-trending-down'" 
                      size="16"
                      :color="stat.trend === 'up' ? 'success' : 'error'"
                    ></v-icon>
                    <span class="change-text">{{ stat.change }}</span>
                    <span class="change-period">vs last week</span>
                  </div>
                </div>
                <div class="stat-progress">
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      :class="`progress-fill--${stat.color}`"
                      :style="{ width: stat.progress + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </BaseCard>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Main Content -->
    <v-container>
      <v-row>
        <!-- Enhanced Analytics Chart -->
        <v-col cols="12" lg="8">
          <BaseCard
            variant="modern"
            size="lg"
            :elevation="3"
            class="analytics-card"
            data-aos="fade-up"
          >
            <template #header>
              <div class="analytics-header">
                <div class="analytics-title">
                  <h3>Engagement Analytics</h3>
                  <p class="analytics-subtitle">Track your performance over time</p>
                </div>
                <div class="analytics-controls">
                  <v-btn-toggle
                    v-model="selectedPeriod"
                    variant="outlined"
                    density="compact"
                    class="period-toggle"
                  >
                    <v-btn value="7d">7D</v-btn>
                    <v-btn value="30d">30D</v-btn>
                    <v-btn value="90d">90D</v-btn>
                  </v-btn-toggle>
                </div>
              </div>
            </template>
            
            <BaseChart
              type="area"
              variant="modern"
              :data="chartData"
              :height="300"
              :show-legend="true"
              :show-controls="false"
              :animated="true"
              :gradient-colors="['#667eea', '#764ba2']"
              aria-label="Engagement analytics chart showing likes, comments, and shares over time"
              @chart-ready="onChartReady"
            />
          </BaseCard>
        </v-col>

        <!-- Quick Actions & Recent Activity -->
        <v-col cols="12" lg="4">
          <!-- Quick Actions -->
          <v-card class="quick-actions-card mb-6" elevation="2" data-aos="fade-up" data-aos-delay="200">
            <v-card-title>Quick Actions</v-card-title>
            <v-card-text>
              <div class="quick-actions-grid">
                <div
                  v-for="(action, index) in quickActions"
                  :key="index"
                  class="quick-action-item"
                  @click="executeAction(action)"
                >
                  <v-avatar
                    size="48"
                    :class="`action-icon action-icon--${action.color}`"
                  >
                    <v-icon :icon="action.icon" size="24"></v-icon>
                  </v-avatar>
                  <div class="action-text">
                    <div class="action-title">{{ action.title }}</div>
                    <div class="action-subtitle">{{ action.subtitle }}</div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Recent Activity -->
          <v-card class="activity-card" elevation="2" data-aos="fade-up" data-aos-delay="400">
            <v-card-title>Recent Activity</v-card-title>
            <v-card-text>
              <v-timeline density="compact" class="activity-timeline">
                <v-timeline-item
                  v-for="(activity, index) in recentActivity"
                  :key="index"
                  :dot-color="activity.color"
                  size="small"
                >
                  <div class="activity-content">
                    <div class="activity-title">{{ activity.title }}</div>
                    <div class="activity-time">{{ activity.time }}</div>
                  </div>
                </v-timeline-item>
              </v-timeline>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Upcoming Posts & Performance -->
      <v-row class="mt-6">
        <!-- Upcoming Posts -->
        <v-col cols="12" lg="6">
          <v-card class="upcoming-posts-card" elevation="2" data-aos="fade-up">
            <v-card-title class="upcoming-header">
              <div>
                <h3>Upcoming Posts</h3>
                <p class="upcoming-subtitle">Next 7 days</p>
              </div>
              <v-btn
                color="primary"
                variant="outlined"
                size="small"
                @click="viewAllSchedules"
              >
                View All
              </v-btn>
            </v-card-title>
            <v-card-text>
              <div class="upcoming-list">
                <div
                  v-for="(post, index) in upcomingPosts"
                  :key="index"
                  class="upcoming-item"
                >
                  <div class="post-media">
                    <v-img
                      :src="post.image"
                      width="60"
                      height="60"
                      class="post-thumbnail"
                    ></v-img>
                  </div>
                  <div class="post-details">
                    <div class="post-caption">{{ post.caption }}</div>
                    <div class="post-schedule">
                      <v-icon icon="mdi-clock-outline" size="16" class="me-1"></v-icon>
                      {{ post.scheduledTime }}
                    </div>
                  </div>
                  <div class="post-actions">
                    <v-btn
                      icon="mdi-pencil"
                      size="small"
                      variant="text"
                      @click="editPost(post)"
                    ></v-btn>
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      variant="text"
                      color="error"
                      @click="deletePost(post)"
                    ></v-btn>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Top Performing Posts -->
        <v-col cols="12" lg="6">
          <v-card class="performance-card" elevation="2" data-aos="fade-up" data-aos-delay="200">
            <v-card-title>
              <div>
                <h3>Top Performing Posts</h3>
                <p class="performance-subtitle">This month</p>
              </div>
            </v-card-title>
            <v-card-text>
              <div class="performance-list">
                <div
                  v-for="(post, index) in topPosts"
                  :key="index"
                  class="performance-item"
                >
                  <div class="performance-rank">{{ index + 1 }}</div>
                  <div class="performance-media">
                    <v-img
                      :src="post.image"
                      width="50"
                      height="50"
                      class="performance-thumbnail"
                    ></v-img>
                  </div>
                  <div class="performance-details">
                    <div class="performance-caption">{{ post.caption }}</div>
                    <div class="performance-stats">
                      <span class="stat-item">
                        <v-icon icon="mdi-heart" size="14"></v-icon>
                        {{ post.likes }}
                      </span>
                      <span class="stat-item">
                        <v-icon icon="mdi-comment" size="14"></v-icon>
                        {{ post.comments }}
                      </span>
                      <span class="stat-item">
                        <v-icon icon="mdi-share" size="14"></v-icon>
                        {{ post.shares }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Instagram Accounts -->
      <v-row class="mt-6">
        <v-col cols="12">
          <v-card class="accounts-card" elevation="2" data-aos="fade-up">
            <v-card-title class="accounts-header">
              <div>
                <h3>Connected Instagram Accounts</h3>
                <p class="accounts-subtitle">Manage your Instagram presence</p>
              </div>
              <v-btn
                color="primary"
                variant="outlined"
                @click="addAccount"
              >
                <v-icon start>mdi-plus</v-icon>
                Add Account
              </v-btn>
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col
                  v-for="(account, index) in accounts"
                  :key="index"
                  cols="12"
                  sm="6"
                  md="4"
                  lg="3"
                >
                  <div class="account-card">
                    <div class="account-header">
                      <v-avatar size="60">
                        <v-img :src="account.avatar"></v-img>
                      </v-avatar>
                      <div class="account-status" :class="account.status">
                        <v-icon icon="mdi-check-circle" size="16"></v-icon>
                      </div>
                    </div>
                    <div class="account-info">
                      <div class="account-username">@{{ account.username }}</div>
                      <div class="account-followers">{{ account.followers }} followers</div>
                    </div>
                    <div class="account-stats">
                      <div class="account-stat">
                        <div class="stat-value">{{ account.posts }}</div>
                        <div class="stat-label">Posts</div>
                      </div>
                      <div class="account-stat">
                        <div class="stat-value">{{ account.engagement }}</div>
                        <div class="stat-label">Engagement</div>
                      </div>
                    </div>
                    <div class="account-actions">
                      <v-btn
                        size="small"
                        variant="outlined"
                        color="primary"
                        @click="manageAccount(account)"
                      >
                        Manage
                      </v-btn>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AOS from 'aos'
import 'aos/dist/aos.css'
import BaseCard from '../../components/BaseCard.vue'
import BaseButton from '../../components/BaseButton.vue'
import BaseChart from '../../components/BaseChart.vue'

// Reactive data
const selectedPeriod = ref('30d')
const analyticsChart = ref<HTMLCanvasElement | null>(null)

// Chart data
const chartData = ref({
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Likes',
      data: [120, 180, 150, 220, 280, 240, 320],
      borderColor: '#667eea',
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      fill: true
    },
    {
      label: 'Comments',
      data: [80, 120, 90, 140, 180, 160, 200],
      borderColor: '#764ba2',
      backgroundColor: 'rgba(118, 75, 162, 0.1)',
      fill: true
    }
  ]
})

// Enhanced Dashboard data with progress indicators
const stats = ref([
  {
    icon: 'mdi-heart',
    label: 'Total Likes',
    value: '24.8K',
    change: '+12.5%',
    trend: 'up',
    color: 'pink',
    progress: 78
  },
  {
    icon: 'mdi-comment-text',
    label: 'Comments',
    value: '3.2K',
    change: '+8.3%',
    trend: 'up',
    color: 'blue',
    progress: 65
  },
  {
    icon: 'mdi-share',
    label: 'Shares',
    value: '1.8K',
    change: '+15.7%',
    trend: 'up',
    color: 'green',
    progress: 45
  },
  {
    icon: 'mdi-eye',
    label: 'Reach',
    value: '127K',
    change: '+22.1%',
    trend: 'up',
    color: 'purple',
    progress: 89
  }
])

const quickActions = ref([
  {
    icon: 'mdi-camera-plus',
    title: 'Create Post',
    subtitle: 'New content',
    color: 'primary'
  },
  {
    icon: 'mdi-calendar-plus',
    title: 'Schedule',
    subtitle: 'Plan ahead',
    color: 'success'
  },
  {
    icon: 'mdi-chart-line',
    title: 'Analytics',
    subtitle: 'View insights',
    color: 'info'
  },
  {
    icon: 'mdi-cog',
    title: 'Settings',
    subtitle: 'Preferences',
    color: 'warning'
  }
])

const recentActivity = ref([
  {
    title: 'Posted "Summer vibes 🌞"',
    time: '2 hours ago',
    color: 'success'
  },
  {
    title: 'Scheduled 5 posts for next week',
    time: '4 hours ago',
    color: 'info'
  },
  {
    title: 'Received 50+ new followers',
    time: '6 hours ago',
    color: 'primary'
  },
  {
    title: 'Post reached 10K impressions',
    time: '1 day ago',
    color: 'warning'
  }
])

const upcomingPosts = ref([
  {
    image: 'https://picsum.photos/300/300?random=1',
    caption: 'Exploring the beautiful mountains today! 🏔️',
    scheduledTime: 'Today, 3:00 PM'
  },
  {
    image: 'https://picsum.photos/300/300?random=2',
    caption: 'Coffee and productivity go hand in hand ☕',
    scheduledTime: 'Tomorrow, 9:00 AM'
  },
  {
    image: 'https://picsum.photos/300/300?random=3',
    caption: 'Weekend adventures await! Who\'s ready?',
    scheduledTime: 'Friday, 6:00 PM'
  }
])

const topPosts = ref([
  {
    image: 'https://picsum.photos/300/300?random=4',
    caption: 'Best sunset ever captured 📸',
    likes: '2.8K',
    comments: '156',
    shares: '89'
  },
  {
    image: 'https://picsum.photos/300/300?random=5',
    caption: 'Healthy breakfast motivation',
    likes: '2.1K',
    comments: '203',
    shares: '67'
  },
  {
    image: 'https://picsum.photos/300/300?random=6',
    caption: 'Travel memories from Bali',
    likes: '1.9K',
    comments: '145',
    shares: '78'
  }
])

const accounts = ref([
  {
    username: 'sarah_travels',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    followers: '25.8K',
    posts: '124',
    engagement: '4.2%',
    status: 'active'
  },
  {
    username: 'sarah_fitness',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    followers: '18.3K',
    posts: '89',
    engagement: '3.8%',
    status: 'active'
  },
  {
    username: 'sarah_food',
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    followers: '12.1K',
    posts: '67',
    engagement: '5.1%',
    status: 'active'
  }
])

// Methods
const createPost = () => {
  console.log('Create post clicked')
}

const executeAction = (action: any) => {
  console.log('Action executed:', action.title)
}

const viewAllSchedules = () => {
  console.log('View all schedules')
}

const editPost = (post: any) => {
  console.log('Edit post:', post.caption)
}

const deletePost = (post: any) => {
  console.log('Delete post:', post.caption)
}

const addAccount = () => {
  console.log('Add account')
}

const manageAccount = (account: any) => {
  console.log('Manage account:', account.username)
}

const onChartReady = () => {
  console.log('Chart is ready')
}

// Lifecycle
onMounted(() => {
  AOS.init({
    duration: 600,
    easing: 'ease-out-cubic',
    once: true,
    offset: 100
  })
})
</script>

<style scoped>
/* Modern Dashboard - Enhanced Design System */
.modern-dashboard {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Enhanced Header */
.dashboard-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px) saturate(180%);
  padding: 1.5rem 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  position: sticky;
  top: 0;
  z-index: 10;
}

.greeting-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.greeting-title {
  margin: 0;
  line-height: 1.2;
}

.greeting-main {
  display: block;
  font-size: 1.5rem;
  font-weight: 500;
  color: #64748b;
  letter-spacing: -0.025em;
}

.greeting-name {
  display: block;
  font-size: 2.25rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.05em;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.greeting-subtitle {
  color: #64748b;
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
  letter-spacing: -0.025em;
}

.quick-stats {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.stat-chip {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  color: #667eea;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.notification-indicator {
  position: relative;
}

.notification-btn {
  background: rgba(102, 126, 234, 0.1) !important;
  color: #667eea !important;
  transition: all 0.2s ease;
}

.notification-btn:hover {
  background: rgba(102, 126, 234, 0.2) !important;
  transform: scale(1.05);
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  font-size: 0.625rem;
  font-weight: 700;
  padding: 0.125rem 0.375rem;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  line-height: 1;
}

.user-avatar {
  border: 3px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

/* Enhanced Statistics Section */
.stats-section {
  margin-bottom: 3rem;
}

.stat-card {
  height: 100%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(226, 232, 240, 0.8);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--stat-gradient);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-card--pink {
  --stat-gradient: linear-gradient(135deg, #ec4899 0%, #f472b6 100%);
}

.stat-card--blue {
  --stat-gradient: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
}

.stat-card--green {
  --stat-gradient: linear-gradient(135deg, #10b981 0%, #34d399 100%);
}

.stat-card--purple {
  --stat-gradient: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
}

.stat-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--stat-gradient);
  color: white;
  transition: all 0.3s ease;
}

.stat-card:hover .stat-icon {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.stat-details {
  flex: 1;
}

.stat-value {
  font-size: 1.875rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
  letter-spacing: -0.05em;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  letter-spacing: -0.025em;
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.stat-change.up {
  color: #059669;
}

.stat-change.down {
  color: #dc2626;
}

.change-text {
  font-weight: 700;
}

.change-period {
  color: #9ca3af;
  font-weight: 500;
}

.stat-progress {
  margin-top: auto;
}

.progress-bar {
  height: 4px;
  background: #f1f5f9;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--stat-gradient);
  border-radius: 2px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Enhanced Analytics Card */
.analytics-card {
  border: 1px solid rgba(226, 232, 240, 0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.analytics-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.analytics-title {
  flex: 1;
}

.analytics-title h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.25rem;
  letter-spacing: -0.025em;
}

.analytics-subtitle {
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0;
  letter-spacing: -0.025em;
}

.analytics-controls {
  flex-shrink: 0;
}

.period-toggle {
  background: #f8fafc;
  border-radius: 12px;
  padding: 0.25rem;
}

.period-toggle .v-btn {
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.75rem;
  min-width: 40px;
  height: 32px;
  letter-spacing: 0.05em;
}

/* Quick Actions */
.quick-actions-card {
  background: white;
  border-radius: 20px;
}

.quick-actions-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.quick-action-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 15px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quick-action-item:hover {
  background: #e9ecef;
  transform: translateX(5px);
}

.action-icon {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
}

.action-icon--primary {
  background: linear-gradient(45deg, #2196f3, #90caf9);
}

.action-icon--success {
  background: linear-gradient(45deg, #4caf50, #a5d6a7);
}

.action-icon--info {
  background: linear-gradient(45deg, #00bcd4, #80deea);
}

.action-icon--warning {
  background: linear-gradient(45deg, #ff9800, #ffcc02);
}

.action-title {
  font-weight: 600;
  color: #2c3e50;
}

.action-subtitle {
  font-size: 0.85rem;
  color: #7f8c8d;
}

/* Activity Card */
.activity-card {
  background: white;
  border-radius: 20px;
}

.activity-timeline {
  padding: 0;
}

.activity-content {
  padding-left: 1rem;
}

.activity-title {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
}

.activity-time {
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-top: 0.25rem;
}

/* Upcoming Posts */
.upcoming-posts-card {
  background: white;
  border-radius: 20px;
}

.upcoming-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.upcoming-header h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.upcoming-subtitle {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin: 0.25rem 0 0;
}

.upcoming-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.upcoming-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 15px;
  background: #f8f9fa;
  transition: all 0.3s ease;
}

.upcoming-item:hover {
  background: #e9ecef;
}

.post-thumbnail {
  border-radius: 10px;
  object-fit: cover;
}

.post-details {
  flex: 1;
}

.post-caption {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-schedule {
  font-size: 0.8rem;
  color: #7f8c8d;
  display: flex;
  align-items: center;
}

.post-actions {
  display: flex;
  gap: 0.25rem;
}

/* Performance Card */
.performance-card {
  background: white;
  border-radius: 20px;
}

.performance-card h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.performance-subtitle {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin: 0.25rem 0 0;
}

.performance-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.performance-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 15px;
  background: #f8f9fa;
  transition: all 0.3s ease;
}

.performance-item:hover {
  background: #e9ecef;
}

.performance-rank {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
}

.performance-thumbnail {
  border-radius: 8px;
  object-fit: cover;
}

.performance-details {
  flex: 1;
}

.performance-caption {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.performance-stats {
  display: flex;
  gap: 1rem;
}

.stat-item {
  font-size: 0.8rem;
  color: #7f8c8d;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Accounts Card */
.accounts-card {
  background: white;
  border-radius: 20px;
}

.accounts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.accounts-header h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.accounts-subtitle {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin: 0.25rem 0 0;
}

.account-card {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
  height: 100%;
}

.account-card:hover {
  background: #e9ecef;
  transform: translateY(-5px);
}

.account-header {
  position: relative;
  margin-bottom: 1rem;
}

.account-status {
  position: absolute;
  top: -5px;
  right: calc(50% - 35px);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #4caf50;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.account-username {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.account-followers {
  font-size: 0.85rem;
  color: #7f8c8d;
  margin-bottom: 1rem;
}

.account-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 1rem;
}

.account-stat {
  text-align: center;
}

.account-stat .stat-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2c3e50;
}

.account-stat .stat-label {
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-top: 0.25rem;
}

.account-actions {
  margin-top: 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-header {
    padding: 1rem 0;
  }
  
  .greeting-main {
    font-size: 1.25rem;
  }
  
  .greeting-name {
    font-size: 1.875rem;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-end;
  }
  
  .quick-stats {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
  
  .stat-content {
    align-items: center;
    text-align: center;
  }
  
  .analytics-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .upcoming-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .accounts-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .user-profile {
    flex-direction: row-reverse;
  }
}
</style>