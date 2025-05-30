<template>
  <div class="modern-account-manager">
    <!-- Header -->
    <div class="account-header">
      <v-container>
        <v-row align="center" justify="space-between">
          <v-col cols="auto">
            <div class="header-title-section">
              <h1 class="page-title">Instagram Accounts</h1>
              <p class="page-subtitle">Manage your connected Instagram accounts and analytics</p>
            </div>
          </v-col>
          <v-col cols="auto">
            <div class="header-actions">
              <v-btn
                color="secondary"
                variant="outlined"
                class="refresh-btn me-3"
                @click="refreshAccounts"
              >
                <v-icon start>mdi-refresh</v-icon>
                Refresh
              </v-btn>
              <v-btn
                color="primary"
                variant="flat"
                class="add-account-btn"
                @click="addAccount"
              >
                <v-icon start>mdi-plus</v-icon>
                Add Account
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Overview Stats -->
    <v-container class="stats-section">
      <v-row>
        <v-col
          v-for="(stat, index) in overviewStats"
          :key="index"
          cols="12"
          sm="6"
          lg="3"
        >
          <v-card
            class="overview-stat-card"
            elevation="0"
            data-aos="fade-up"
            :data-aos-delay="index * 100"
          >
            <div class="stat-content">
              <v-avatar
                size="64"
                :class="`stat-icon stat-icon--${stat.color}`"
              >
                <v-icon :icon="stat.icon" size="32"></v-icon>
              </v-avatar>
              <div class="stat-info">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
                <div class="stat-change" :class="stat.trend">
                  <v-icon :icon="stat.trend === 'up' ? 'mdi-trending-up' : 'mdi-trending-down'" size="16"></v-icon>
                  {{ stat.change }}
                </div>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Accounts Grid -->
    <v-container>
      <v-row>
        <v-col
          v-for="(account, index) in accounts"
          :key="account.id"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card
            class="account-card"
            elevation="2"
            data-aos="fade-up"
            :data-aos-delay="index * 150"
          >
            <!-- Account Header -->
            <div class="account-card-header">
              <div class="account-profile">
                <v-avatar size="80" class="account-avatar">
                  <v-img :src="account.avatar"></v-img>
                </v-avatar>
                <div class="account-status" :class="account.status">
                  <v-icon :icon="getStatusIcon(account.status)" size="20"></v-icon>
                </div>
              </div>
              <div class="account-info">
                <h3 class="account-username">@{{ account.username }}</h3>
                <p class="account-name">{{ account.name }}</p>
                <v-chip
                  :color="getStatusColor(account.status)"
                  size="small"
                  class="status-chip"
                >
                  {{ account.status }}
                </v-chip>
              </div>
              <div class="account-menu">
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon="mdi-dots-vertical"
                      variant="text"
                      v-bind="props"
                    ></v-btn>
                  </template>
                  <v-list>
                    <v-list-item @click="editAccount(account)">
                      <template v-slot:prepend>
                        <v-icon icon="mdi-pencil"></v-icon>
                      </template>
                      <v-list-item-title>Edit</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="refreshAccount(account)">
                      <template v-slot:prepend>
                        <v-icon icon="mdi-refresh"></v-icon>
                      </template>
                      <v-list-item-title>Refresh</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="disconnectAccount(account)">
                      <template v-slot:prepend>
                        <v-icon icon="mdi-link-off" color="error"></v-icon>
                      </template>
                      <v-list-item-title class="text-error">Disconnect</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </div>

            <!-- Account Stats -->
            <v-card-text>
              <div class="account-stats-grid">
                <div class="stat-item">
                  <div class="stat-number">{{ account.followers }}</div>
                  <div class="stat-label">Followers</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">{{ account.following }}</div>
                  <div class="stat-label">Following</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">{{ account.posts }}</div>
                  <div class="stat-label">Posts</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">{{ account.engagement }}</div>
                  <div class="stat-label">Engagement</div>
                </div>
              </div>

              <!-- Performance Chart -->
              <div class="performance-chart">
                <h4 class="chart-title">7-Day Performance</h4>
                <canvas
                  :ref="`chart-${account.id}`"
                  class="mini-chart"
                  width="300"
                  height="100"
                ></canvas>
              </div>

              <!-- Recent Activity -->
              <div class="recent-activity">
                <h4 class="activity-title">Recent Activity</h4>
                <div class="activity-list">
                  <div
                    v-for="(activity, actIndex) in account.recentActivity"
                    :key="actIndex"
                    class="activity-item"
                  >
                    <v-icon :icon="activity.icon" size="16" :color="activity.color" class="activity-icon"></v-icon>
                    <div class="activity-text">
                      <span class="activity-description">{{ activity.description }}</span>
                      <span class="activity-time">{{ activity.time }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </v-card-text>

            <!-- Account Actions -->
            <v-card-actions class="account-card-actions">
              <v-btn
                color="primary"
                variant="outlined"
                size="small"
                @click="viewAnalytics(account)"
              >
                <v-icon start>mdi-chart-line</v-icon>
                Analytics
              </v-btn>
              <v-btn
                color="success"
                variant="outlined"
                size="small"
                @click="createPost(account)"
              >
                <v-icon start>mdi-plus</v-icon>
                Create Post
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <!-- Add Account Card -->
        <v-col cols="12" md="6" lg="4">
          <v-card
            class="add-account-card"
            elevation="2"
            data-aos="fade-up"
            :data-aos-delay="accounts.length * 150"
            @click="addAccount"
          >
            <div class="add-account-content">
              <v-avatar size="80" class="add-account-icon">
                <v-icon icon="mdi-plus" size="40"></v-icon>
              </v-avatar>
              <h3 class="add-account-title">Add New Account</h3>
              <p class="add-account-subtitle">Connect another Instagram account to manage</p>
              <v-btn
                color="primary"
                variant="flat"
                class="add-account-btn"
              >
                <v-icon start>mdi-instagram</v-icon>
                Connect Instagram
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Detailed Analytics Section -->
    <v-container v-if="selectedAccount" class="analytics-section">
      <v-row>
        <v-col cols="12">
          <v-card class="analytics-card" elevation="2" data-aos="fade-up">
            <v-card-title class="analytics-header">
              <div class="analytics-title-section">
                <h3>Detailed Analytics - @{{ selectedAccount.username }}</h3>
                <p class="analytics-subtitle">Comprehensive insights and performance metrics</p>
              </div>
              <div class="analytics-controls">
                <v-btn-toggle
                  v-model="analyticsTimeframe"
                  variant="outlined"
                  density="compact"
                >
                  <v-btn value="7d">7 Days</v-btn>
                  <v-btn value="30d">30 Days</v-btn>
                  <v-btn value="90d">90 Days</v-btn>
                </v-btn-toggle>
              </div>
            </v-card-title>
            <v-card-text>
              <v-row>
                <!-- Main Chart -->
                <v-col cols="12" lg="8">
                  <div class="main-chart-container">
                    <canvas ref="mainAnalyticsChart" height="300"></canvas>
                  </div>
                </v-col>
                
                <!-- Side Metrics -->
                <v-col cols="12" lg="4">
                  <div class="side-metrics">
                    <div
                      v-for="(metric, index) in detailedMetrics"
                      :key="index"
                      class="metric-card"
                    >
                      <div class="metric-header">
                        <v-icon :icon="metric.icon" :color="metric.color"></v-icon>
                        <span class="metric-name">{{ metric.name }}</span>
                      </div>
                      <div class="metric-value">{{ metric.value }}</div>
                      <div class="metric-change" :class="metric.trend">
                        <v-icon :icon="metric.trend === 'up' ? 'mdi-trending-up' : 'mdi-trending-down'" size="14"></v-icon>
                        {{ metric.change }}
                      </div>
                    </div>
                  </div>
                </v-col>
              </v-row>

              <!-- Top Performing Posts -->
              <div class="top-posts-section">
                <h4 class="section-title">Top Performing Posts</h4>
                <v-row>
                  <v-col
                    v-for="(post, index) in topPosts"
                    :key="index"
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <div class="top-post-card">
                      <div class="post-media">
                        <v-img
                          :src="post.image"
                          class="post-thumbnail"
                          aspect-ratio="1"
                        ></v-img>
                        <div class="post-overlay">
                          <div class="post-stats">
                            <span class="post-stat">
                              <v-icon icon="mdi-heart" size="14"></v-icon>
                              {{ post.likes }}
                            </span>
                            <span class="post-stat">
                              <v-icon icon="mdi-comment" size="14"></v-icon>
                              {{ post.comments }}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div class="post-info">
                        <p class="post-caption">{{ post.caption }}</p>
                        <span class="post-date">{{ post.date }}</span>
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Account Connection Dialog -->
    <v-dialog v-model="showAddDialog" max-width="500px">
      <v-card class="add-dialog">
        <v-card-title class="dialog-header">
          <h3>Connect Instagram Account</h3>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="showAddDialog = false"
          ></v-btn>
        </v-card-title>
        <v-card-text>
          <div class="connection-steps">
            <div class="step-item">
              <div class="step-number">1</div>
              <div class="step-content">
                <h4>Authorize Access</h4>
                <p>Click the button below to connect your Instagram account</p>
              </div>
            </div>
            <div class="step-item">
              <div class="step-number">2</div>
              <div class="step-content">
                <h4>Grant Permissions</h4>
                <p>Allow Omniy to manage your Instagram content</p>
              </div>
            </div>
            <div class="step-item">
              <div class="step-number">3</div>
              <div class="step-content">
                <h4>Start Scheduling</h4>
                <p>Begin creating and scheduling your content</p>
              </div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="showAddDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="connectInstagram"
          >
            <v-icon start>mdi-instagram</v-icon>
            Connect Instagram
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AOS from 'aos'
import 'aos/dist/aos.css'

// Reactive data
const selectedAccount = ref(null)
const analyticsTimeframe = ref('30d')
const showAddDialog = ref(false)
const mainAnalyticsChart = ref<HTMLCanvasElement | null>(null)

// Overview stats
const overviewStats = ref([
  {
    icon: 'mdi-account-group',
    label: 'Total Followers',
    value: '56.2K',
    change: '+15.2%',
    trend: 'up',
    color: 'primary'
  },
  {
    icon: 'mdi-heart',
    label: 'Total Engagement',
    value: '8.4K',
    change: '+22.8%',
    trend: 'up',
    color: 'pink'
  },
  {
    icon: 'mdi-chart-line',
    label: 'Avg. Reach',
    value: '12.8K',
    change: '+8.5%',
    trend: 'up',
    color: 'green'
  },
  {
    icon: 'mdi-calendar-check',
    label: 'Posts This Month',
    value: '28',
    change: '+12%',
    trend: 'up',
    color: 'orange'
  }
])

// Accounts data
const accounts = ref([
  {
    id: 1,
    username: 'sarah_travels',
    name: 'Sarah\'s Travel Adventures',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    status: 'active',
    followers: '25.8K',
    following: '1.2K',
    posts: '124',
    engagement: '4.2%',
    recentActivity: [
      {
        icon: 'mdi-heart',
        color: 'pink',
        description: 'New post got 500+ likes',
        time: '2h ago'
      },
      {
        icon: 'mdi-account-plus',
        color: 'blue',
        description: '50 new followers',
        time: '5h ago'
      },
      {
        icon: 'mdi-comment',
        color: 'green',
        description: '25 new comments',
        time: '1d ago'
      }
    ]
  },
  {
    id: 2,
    username: 'sarah_fitness',
    name: 'Sarah Fitness Journey',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    status: 'active',
    followers: '18.3K',
    following: '890',
    posts: '89',
    engagement: '3.8%',
    recentActivity: [
      {
        icon: 'mdi-heart',
        color: 'pink',
        description: 'Workout video trending',
        time: '1h ago'
      },
      {
        icon: 'mdi-share',
        color: 'purple',
        description: 'Post shared 100+ times',
        time: '3h ago'
      },
      {
        icon: 'mdi-account-plus',
        color: 'blue',
        description: '30 new followers',
        time: '6h ago'
      }
    ]
  },
  {
    id: 3,
    username: 'sarah_food',
    name: 'Sarah\'s Kitchen',
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    status: 'warning',
    followers: '12.1K',
    following: '567',
    posts: '67',
    engagement: '5.1%',
    recentActivity: [
      {
        icon: 'mdi-alert',
        color: 'orange',
        description: 'Token needs refresh',
        time: '2h ago'
      },
      {
        icon: 'mdi-heart',
        color: 'pink',
        description: 'Recipe post viral',
        time: '4h ago'
      },
      {
        icon: 'mdi-comment',
        color: 'green',
        description: '40 recipe requests',
        time: '8h ago'
      }
    ]
  }
])

// Detailed metrics
const detailedMetrics = ref([
  {
    name: 'Reach',
    value: '45.2K',
    change: '+18.3%',
    trend: 'up',
    icon: 'mdi-eye',
    color: 'blue'
  },
  {
    name: 'Impressions',
    value: '67.8K',
    change: '+25.1%',
    trend: 'up',
    icon: 'mdi-chart-box',
    color: 'green'
  },
  {
    name: 'Profile Visits',
    value: '3.2K',
    change: '+12.7%',
    trend: 'up',
    icon: 'mdi-account-eye',
    color: 'purple'
  },
  {
    name: 'Website Clicks',
    value: '428',
    change: '+8.9%',
    trend: 'up',
    icon: 'mdi-web',
    color: 'orange'
  }
])

// Top posts
const topPosts = ref([
  {
    image: 'https://picsum.photos/300/300?random=10',
    caption: 'Amazing sunset at Santorini! Best vacation ever 🌅',
    likes: '2.8K',
    comments: '156',
    date: '2 days ago'
  },
  {
    image: 'https://picsum.photos/300/300?random=11',
    caption: 'Morning workout routine that changed my life 💪',
    likes: '2.1K',
    comments: '203',
    date: '5 days ago'
  },
  {
    image: 'https://picsum.photos/300/300?random=12',
    caption: 'Homemade pasta recipe everyone is asking for 🍝',
    likes: '1.9K',
    comments: '145',
    date: '1 week ago'
  }
])

// Methods
const getStatusIcon = (status: string) => {
  const icons = {
    active: 'mdi-check-circle',
    warning: 'mdi-alert-circle',
    error: 'mdi-close-circle',
    inactive: 'mdi-pause-circle'
  }
  return icons[status as keyof typeof icons] || 'mdi-help-circle'
}

const getStatusColor = (status: string) => {
  const colors = {
    active: 'success',
    warning: 'warning',
    error: 'error',
    inactive: 'grey'
  }
  return colors[status as keyof typeof colors] || 'grey'
}

const addAccount = () => {
  showAddDialog.value = true
}

const connectInstagram = () => {
  console.log('Connecting Instagram account...')
  showAddDialog.value = false
  // Simulate account connection
}

const refreshAccounts = () => {
  console.log('Refreshing all accounts...')
}

const editAccount = (account: any) => {
  console.log('Edit account:', account.username)
}

const refreshAccount = (account: any) => {
  console.log('Refresh account:', account.username)
}

const disconnectAccount = (account: any) => {
  console.log('Disconnect account:', account.username)
}

const viewAnalytics = (account: any) => {
  selectedAccount.value = account
  console.log('View analytics for:', account.username)
}

const createPost = (account: any) => {
  console.log('Create post for:', account.username)
}

const drawMiniChart = (canvasId: string) => {
  const canvas = document.querySelector(`[ref="${canvasId}"]`) as HTMLCanvasElement
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Sample data for mini chart
  const data = [65, 78, 72, 85, 91, 88, 95]
  const width = canvas.width
  const height = canvas.height
  const maxValue = Math.max(...data)
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height)
  
  // Draw line
  ctx.strokeStyle = '#667eea'
  ctx.lineWidth = 2
  ctx.beginPath()
  
  data.forEach((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - (value / maxValue) * height
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  
  ctx.stroke()
  
  // Add gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, 'rgba(102, 126, 234, 0.3)')
  gradient.addColorStop(1, 'rgba(102, 126, 234, 0.0)')
  
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.moveTo(0, height)
  
  data.forEach((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - (value / maxValue) * height
    ctx.lineTo(x, y)
  })
  
  ctx.lineTo(width, height)
  ctx.closePath()
  ctx.fill()
}

const drawMainAnalyticsChart = () => {
  if (!mainAnalyticsChart.value) return
  
  const canvas = mainAnalyticsChart.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Set canvas size
  canvas.width = canvas.offsetWidth
  canvas.height = 300

  // Sample data
  const data = [
    { date: '1', reach: 12000, engagement: 800, impressions: 15000 },
    { date: '5', reach: 15000, engagement: 950, impressions: 18500 },
    { date: '10', reach: 18000, engagement: 1200, impressions: 22000 },
    { date: '15', reach: 22000, engagement: 1400, impressions: 26500 },
    { date: '20', reach: 25000, engagement: 1600, impressions: 30000 },
    { date: '25', reach: 28000, engagement: 1800, impressions: 33500 },
    { date: '30', reach: 32000, engagement: 2100, impressions: 38000 }
  ]

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Draw reach line
  ctx.strokeStyle = '#667eea'
  ctx.lineWidth = 3
  ctx.beginPath()
  
  data.forEach((point, index) => {
    const x = (index / (data.length - 1)) * canvas.width
    const y = canvas.height - (point.reach / 35000) * canvas.height
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  
  ctx.stroke()

  // Draw engagement line
  ctx.strokeStyle = '#f093fb'
  ctx.lineWidth = 3
  ctx.beginPath()
  
  data.forEach((point, index) => {
    const x = (index / (data.length - 1)) * canvas.width
    const y = canvas.height - (point.engagement / 2500) * canvas.height
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  
  ctx.stroke()
}

// Lifecycle
onMounted(() => {
  AOS.init({
    duration: 600,
    easing: 'ease-out-cubic',
    once: true
  })
  
  // Draw mini charts for each account
  setTimeout(() => {
    accounts.value.forEach(account => {
      drawMiniChart(`chart-${account.id}`)
    })
    drawMainAnalyticsChart()
  }, 100)
})
</script>

<style scoped>
.modern-account-manager {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

/* Header */
.account-header {
  background: white;
  padding: 2rem 0;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.page-subtitle {
  color: #7f8c8d;
  font-size: 1.1rem;
  margin: 0.5rem 0 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.refresh-btn, .add-account-btn {
  font-weight: 600;
  border-radius: 25px;
  padding: 12px 24px;
}

.add-account-btn {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.add-account-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(102, 126, 234, 0.4);
}

/* Overview Stats */
.stats-section {
  margin-bottom: 2rem;
}

.overview-stat-card {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  height: 100%;
}

.overview-stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
}

.stat-icon--primary {
  background: linear-gradient(45deg, #2196f3, #90caf9);
}

.stat-icon--pink {
  background: linear-gradient(45deg, #e91e63, #f48fb1);
}

.stat-icon--green {
  background: linear-gradient(45deg, #4caf50, #a5d6a7);
}

.stat-icon--orange {
  background: linear-gradient(45deg, #ff9800, #ffcc02);
}

.stat-value {
  font-size: 2rem;
  font-weight: 900;
  color: #2c3e50;
  line-height: 1;
}

.stat-label {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin: 0.5rem 0;
}

.stat-change {
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.stat-change.up {
  color: #4caf50;
}

.stat-change.down {
  color: #f44336;
}

/* Account Cards */
.account-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  height: 100%;
}

.account-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
}

.account-card-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem 1.5rem 1rem;
  position: relative;
}

.account-profile {
  position: relative;
}

.account-avatar {
  border: 3px solid white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.account-status {
  position: absolute;
  bottom: -5px;
  right: -5px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

.account-status.active {
  background: #4caf50;
  color: white;
}

.account-status.warning {
  background: #ff9800;
  color: white;
}

.account-status.error {
  background: #f44336;
  color: white;
}

.account-info {
  flex: 1;
}

.account-username {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.25rem;
}

.account-name {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin: 0 0 0.75rem;
}

.status-chip {
  text-transform: capitalize;
}

.account-menu {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.account-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 10px;
}

.stat-number {
  font-size: 1.4rem;
  font-weight: 800;
  color: #2c3e50;
  line-height: 1;
}

.stat-label {
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-top: 0.25rem;
}

.performance-chart {
  margin-bottom: 1.5rem;
}

.chart-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.mini-chart {
  width: 100%;
  height: 100px;
  border-radius: 8px;
}

.recent-activity {
  margin-bottom: 1rem;
}

.activity-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.activity-icon {
  margin-top: 0.1rem;
}

.activity-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.activity-description {
  font-size: 0.85rem;
  color: #2c3e50;
  font-weight: 500;
}

.activity-time {
  font-size: 0.75rem;
  color: #7f8c8d;
}

.account-card-actions {
  padding: 1rem 1.5rem 1.5rem;
  display: flex;
  gap: 0.75rem;
}

/* Add Account Card */
.add-account-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.add-account-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 15px 40px rgba(102, 126, 234, 0.3);
}

.add-account-content {
  text-align: center;
  color: white;
  padding: 2rem;
}

.add-account-icon {
  background: rgba(255, 255, 255, 0.2);
  margin-bottom: 1.5rem;
}

.add-account-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1rem;
}

.add-account-subtitle {
  font-size: 1rem;
  opacity: 0.9;
  margin: 0 0 2rem;
}

.add-account-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  backdrop-filter: blur(10px);
}

/* Analytics Section */
.analytics-section {
  margin-top: 3rem;
}

.analytics-card {
  background: white;
  border-radius: 20px;
}

.analytics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.analytics-title-section h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.analytics-subtitle {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin: 0.25rem 0 0;
}

.main-chart-container {
  height: 300px;
  position: relative;
}

.main-chart-container canvas {
  width: 100%;
  height: 100%;
}

.side-metrics {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
}

.metric-card {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.metric-card:hover {
  background: #e9ecef;
  transform: translateX(5px);
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.metric-name {
  font-weight: 600;
  color: #2c3e50;
}

.metric-value {
  font-size: 2rem;
  font-weight: 900;
  color: #2c3e50;
  line-height: 1;
}

.metric-change {
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.metric-change.up {
  color: #4caf50;
}

.metric-change.down {
  color: #f44336;
}

/* Top Posts */
.top-posts-section {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #f0f0f0;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.top-post-card {
  background: #f8f9fa;
  border-radius: 15px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.top-post-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.post-media {
  position: relative;
  overflow: hidden;
}

.post-thumbnail {
  transition: transform 0.3s ease;
}

.top-post-card:hover .post-thumbnail {
  transform: scale(1.05);
}

.post-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: 1rem;
  color: white;
}

.post-stats {
  display: flex;
  gap: 1rem;
}

.post-stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.9rem;
  font-weight: 600;
}

.post-info {
  padding: 1rem;
}

.post-caption {
  font-size: 0.9rem;
  color: #2c3e50;
  margin: 0 0 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-date {
  font-size: 0.8rem;
  color: #7f8c8d;
}

/* Add Dialog */
.add-dialog {
  border-radius: 20px;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.dialog-header h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.connection-steps {
  padding: 1rem 0;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.step-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem;
}

.step-content p {
  color: #7f8c8d;
  margin: 0;
  line-height: 1.5;
}

/* Responsive Design */
@media (max-width: 768px) {
  .account-header {
    padding: 1rem 0;
  }
  
  .page-title {
    font-size: 1.8rem;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }
  
  .account-card-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .account-menu {
    position: relative;
    top: auto;
    right: auto;
    margin-top: 1rem;
  }
  
  .account-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .analytics-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .side-metrics {
    margin-top: 2rem;
  }
  
  .metric-card {
    padding: 1rem;
  }
}
</style>