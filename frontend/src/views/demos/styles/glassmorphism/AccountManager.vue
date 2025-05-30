<template>
  <div class="glassmorphism-accounts">
    <!-- Animated Background -->
    <div class="animated-bg">
      <div class="aurora aurora-1"></div>
      <div class="aurora aurora-2"></div>
      <div class="aurora aurora-3"></div>
    </div>

    <v-container fluid class="pa-6">
      <!-- Header -->
      <div class="accounts-header mb-8">
        <h1 class="accounts-title">Account Manager</h1>
        <p class="accounts-subtitle">Manage and monitor all your Instagram accounts in one place</p>
      </div>

      <!-- Summary Cards -->
      <v-row class="mb-8">
        <v-col v-for="summary in summaryCards" :key="summary.title" cols="12" sm="6" md="3">
          <div class="glass-card summary-card">
            <div class="summary-icon" :style="{ background: summary.gradient }">
              <v-icon size="30" color="white">{{ summary.icon }}</v-icon>
            </div>
            <div class="summary-content">
              <h2 class="summary-value">{{ summary.value }}</h2>
              <p class="summary-title">{{ summary.title }}</p>
              <div class="summary-trend" :class="summary.trendType">
                <v-icon size="16">{{ summary.trendType === 'up' ? 'mdi-trending-up' : 'mdi-trending-down' }}</v-icon>
                {{ summary.trend }}% this month
              </div>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Accounts Grid -->
      <v-row>
        <v-col v-for="account in accounts" :key="account.id" cols="12" md="6" lg="4">
          <div class="glass-card account-card" :class="{ 'active': account.isActive }">
            <!-- Account Header -->
            <div class="account-header">
              <v-avatar size="64" class="account-avatar">
                <img :src="account.avatar" :alt="account.name">
              </v-avatar>
              <div class="account-info">
                <h3 class="account-name">{{ account.name }}</h3>
                <p class="account-username">@{{ account.username }}</p>
                <v-chip 
                  size="small" 
                  :color="account.isActive ? 'success' : 'warning'"
                  class="status-chip"
                >
                  {{ account.isActive ? 'Active' : 'Inactive' }}
                </v-chip>
              </div>
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn icon class="glass-btn" v-bind="props" size="small">
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list class="glass-menu">
                  <v-list-item @click="editAccount(account)">
                    <v-list-item-title>Edit Account</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="viewInsights(account)">
                    <v-list-item-title>View Insights</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="disconnectAccount(account)" class="text-error">
                    <v-list-item-title>Disconnect</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>

            <!-- Account Stats -->
            <div class="account-stats">
              <div class="stat-item">
                <span class="stat-value">{{ account.followers }}</span>
                <span class="stat-label">Followers</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-value">{{ account.following }}</span>
                <span class="stat-label">Following</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-value">{{ account.posts }}</span>
                <span class="stat-label">Posts</span>
              </div>
            </div>

            <!-- Performance Chart -->
            <div class="performance-section">
              <h4 class="section-subtitle mb-3">Performance Overview</h4>
              <canvas :ref="`chart-${account.id}`" height="150"></canvas>
            </div>

            <!-- Recent Activity -->
            <div class="activity-section">
              <h4 class="section-subtitle mb-3">Recent Activity</h4>
              <div class="activity-list">
                <div v-for="activity in account.recentActivity" :key="activity.id" class="activity-item">
                  <v-icon size="20" :color="getActivityColor(activity.type)">
                    {{ getActivityIcon(activity.type) }}
                  </v-icon>
                  <div class="activity-details">
                    <p class="activity-text">{{ activity.text }}</p>
                    <p class="activity-time">{{ activity.time }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="account-actions">
              <v-btn class="glass-btn action-btn" size="small">
                <v-icon start>mdi-plus</v-icon>
                New Post
              </v-btn>
              <v-btn class="glass-btn action-btn" size="small">
                <v-icon start>mdi-chart-line</v-icon>
                Analytics
              </v-btn>
              <v-btn class="glass-btn action-btn" size="small">
                <v-icon start>mdi-cog</v-icon>
                Settings
              </v-btn>
            </div>
          </div>
        </v-col>

        <!-- Add Account Card -->
        <v-col cols="12" md="6" lg="4">
          <div class="glass-card add-account-card" @click="addNewAccount">
            <v-icon size="64" color="white">mdi-plus-circle-outline</v-icon>
            <h3 class="add-account-title">Add New Account</h3>
            <p class="add-account-subtitle">Connect another Instagram account</p>
          </div>
        </v-col>
      </v-row>

      <!-- Analytics Overview -->
      <div class="glass-card analytics-overview mt-8">
        <h2 class="section-title mb-6">Analytics Overview</h2>
        <v-row>
          <v-col cols="12" md="4">
            <div class="metric-card">
              <h3 class="metric-title">Engagement Rate</h3>
              <div class="metric-value-large">{{ overallEngagement }}%</div>
              <v-progress-linear
                :model-value="overallEngagement"
                height="8"
                rounded
                class="mt-3"
                color="success"
              ></v-progress-linear>
              <p class="metric-description mt-2">Average across all accounts</p>
            </div>
          </v-col>
          <v-col cols="12" md="4">
            <div class="metric-card">
              <h3 class="metric-title">Total Reach</h3>
              <div class="metric-value-large">{{ totalReach }}</div>
              <div class="reach-breakdown mt-3">
                <div class="reach-item">
                  <span class="reach-label">Organic</span>
                  <span class="reach-value">75%</span>
                </div>
                <div class="reach-item">
                  <span class="reach-label">Paid</span>
                  <span class="reach-value">25%</span>
                </div>
              </div>
            </div>
          </v-col>
          <v-col cols="12" md="4">
            <div class="metric-card">
              <h3 class="metric-title">Best Posting Time</h3>
              <div class="best-times">
                <div class="time-slot" v-for="time in bestTimes" :key="time.day">
                  <span class="time-day">{{ time.day }}</span>
                  <span class="time-hour">{{ time.hour }}</span>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </div>

      <!-- Account Comparison -->
      <div class="glass-card comparison-section mt-6">
        <h2 class="section-title mb-6">Account Comparison</h2>
        <canvas ref="comparisonChart" height="300"></canvas>
      </div>
    </v-container>

    <!-- Add Account Dialog -->
    <v-dialog v-model="addAccountDialog" max-width="500">
      <div class="glass-card dialog-content">
        <h2 class="dialog-title mb-4">Connect Instagram Account</h2>
        <p class="dialog-subtitle mb-6">
          Choose how you'd like to connect your Instagram account
        </p>
        <div class="connection-options">
          <div class="connection-option" @click="connectWithInstagram">
            <v-icon size="48" color="purple">mdi-instagram</v-icon>
            <h3>Instagram Login</h3>
            <p>Connect directly through Instagram</p>
          </div>
          <div class="connection-option" @click="connectWithFacebook">
            <v-icon size="48" color="blue">mdi-facebook</v-icon>
            <h3>Facebook Business</h3>
            <p>Connect via Facebook Business Manager</p>
          </div>
        </div>
        <v-btn class="glass-btn mt-6" block @click="addAccountDialog = false">
          Cancel
        </v-btn>
      </div>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

// Data
const addAccountDialog = ref(false)
const overallEngagement = ref(7.8)
const totalReach = ref('234.5K')

const summaryCards = ref([
  {
    icon: 'mdi-account-multiple',
    title: 'Total Accounts',
    value: '6',
    trend: 20,
    trendType: 'up',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    icon: 'mdi-account-group',
    title: 'Total Followers',
    value: '156.8K',
    trend: 12,
    trendType: 'up',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    icon: 'mdi-send',
    title: 'Posts This Month',
    value: '48',
    trend: 8,
    trendType: 'down',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    icon: 'mdi-heart',
    title: 'Total Engagement',
    value: '89.2K',
    trend: 25,
    trendType: 'up',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  }
])

const accounts = ref([
  {
    id: 1,
    name: 'Fashion Brand',
    username: 'fashionbrand',
    avatar: 'https://i.pravatar.cc/150?img=1',
    isActive: true,
    followers: '45.3K',
    following: '1.2K',
    posts: '856',
    recentActivity: [
      { id: 1, type: 'post', text: 'Published new post', time: '2 hours ago' },
      { id: 2, type: 'story', text: 'Added to story', time: '5 hours ago' },
      { id: 3, type: 'engagement', text: 'Engagement spike detected', time: '1 day ago' }
    ]
  },
  {
    id: 2,
    name: 'Lifestyle Blog',
    username: 'lifestyle',
    avatar: 'https://i.pravatar.cc/150?img=2',
    isActive: true,
    followers: '23.1K',
    following: '856',
    posts: '432',
    recentActivity: [
      { id: 1, type: 'post', text: 'Scheduled post published', time: '4 hours ago' },
      { id: 2, type: 'follower', text: 'Gained 250 followers', time: '1 day ago' },
      { id: 3, type: 'mention', text: 'Mentioned by @influencer', time: '2 days ago' }
    ]
  },
  {
    id: 3,
    name: 'Tech Reviews',
    username: 'techreview',
    avatar: 'https://i.pravatar.cc/150?img=3',
    isActive: false,
    followers: '18.7K',
    following: '543',
    posts: '321',
    recentActivity: [
      { id: 1, type: 'error', text: 'Connection lost', time: '6 hours ago' },
      { id: 2, type: 'post', text: 'Last post 3 days ago', time: '3 days ago' }
    ]
  }
])

const bestTimes = ref([
  { day: 'Mon', hour: '6:00 PM' },
  { day: 'Wed', hour: '7:00 PM' },
  { day: 'Fri', hour: '5:00 PM' },
  { day: 'Sat', hour: '2:00 PM' }
])

// Methods
const getActivityIcon = (type: string) => {
  const icons: Record<string, string> = {
    post: 'mdi-send',
    story: 'mdi-circle-slice-8',
    engagement: 'mdi-trending-up',
    follower: 'mdi-account-plus',
    mention: 'mdi-at',
    error: 'mdi-alert-circle'
  }
  return icons[type] || 'mdi-information'
}

const getActivityColor = (type: string) => {
  const colors: Record<string, string> = {
    post: 'primary',
    story: 'purple',
    engagement: 'success',
    follower: 'info',
    mention: 'orange',
    error: 'error'
  }
  return colors[type] || 'grey'
}

const addNewAccount = () => {
  addAccountDialog.value = true
}

const connectWithInstagram = () => {
  console.log('Connect with Instagram')
  addAccountDialog.value = false
}

const connectWithFacebook = () => {
  console.log('Connect with Facebook')
  addAccountDialog.value = false
}

const editAccount = (account: any) => {
  console.log('Edit account:', account)
}

const viewInsights = (account: any) => {
  console.log('View insights:', account)
}

const disconnectAccount = (account: any) => {
  console.log('Disconnect account:', account)
}

// Chart initialization
onMounted(() => {
  // Initialize individual account charts
  accounts.value.forEach(account => {
    const canvas = document.querySelector(`canvas[ref="chart-${account.id}"]`) as HTMLCanvasElement
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
              label: 'Engagement',
              data: Array.from({ length: 7 }, () => Math.floor(Math.random() * 100) + 50),
              borderColor: '#667eea',
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              tension: 0.4,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: { display: false },
              x: { display: false }
            }
          }
        })
      }
    }
  })

  // Initialize comparison chart
  const comparisonCanvas = document.querySelector('canvas[ref="comparisonChart"]') as HTMLCanvasElement
  if (comparisonCanvas) {
    const ctx = comparisonCanvas.getContext('2d')
    if (ctx) {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: accounts.value.map(a => a.username),
          datasets: [
            {
              label: 'Followers',
              data: [45300, 23100, 18700],
              backgroundColor: 'rgba(102, 126, 234, 0.6)'
            },
            {
              label: 'Engagement',
              data: [3200, 1850, 1200],
              backgroundColor: 'rgba(240, 147, 251, 0.6)'
            },
            {
              label: 'Posts',
              data: [856, 432, 321],
              backgroundColor: 'rgba(79, 172, 254, 0.6)'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
              ticks: { color: 'rgba(255, 255, 255, 0.8)' }
            },
            x: {
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
              ticks: { color: 'rgba(255, 255, 255, 0.8)' }
            }
          },
          plugins: {
            legend: {
              labels: { color: 'white' }
            }
          }
        }
      })
    }
  }
})
</script>

<style scoped>
.glassmorphism-accounts {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #e94560 100%);
  background-size: 400% 400%;
  animation: gradientShift 30s ease infinite;
  position: relative;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Animated Background - Aurora Effect */
.animated-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.aurora {
  position: absolute;
  width: 150%;
  height: 150%;
  filter: blur(100px);
  opacity: 0.3;
}

.aurora-1 {
  background: radial-gradient(ellipse at center, rgba(102,126,234,0.8) 0%, transparent 50%);
  animation: aurora-move 20s ease-in-out infinite;
}

.aurora-2 {
  background: radial-gradient(ellipse at center, rgba(240,147,251,0.8) 0%, transparent 50%);
  animation: aurora-move 25s ease-in-out infinite reverse;
  animation-delay: 5s;
}

.aurora-3 {
  background: radial-gradient(ellipse at center, rgba(79,172,254,0.8) 0%, transparent 50%);
  animation: aurora-move 30s ease-in-out infinite;
  animation-delay: 10s;
}

@keyframes aurora-move {
  0%, 100% {
    transform: translate(-10%, -10%) rotate(0deg) scale(1);
  }
  25% {
    transform: translate(10%, -20%) rotate(90deg) scale(1.2);
  }
  50% {
    transform: translate(-20%, 10%) rotate(180deg) scale(0.8);
  }
  75% {
    transform: translate(20%, 20%) rotate(270deg) scale(1.1);
  }
}

/* Glass Card Base */
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

.glass-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

/* Header */
.accounts-header {
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  z-index: 1;
}

.accounts-title {
  font-size: 4rem;
  font-weight: 800;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.accounts-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
}

/* Summary Cards */
.summary-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  height: 100%;
}

.summary-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.summary-content {
  flex: 1;
}

.summary-value {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.25rem;
}

.summary-title {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.5rem;
}

.summary-trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

.summary-trend.up {
  color: #4caf50;
}

.summary-trend.down {
  color: #f44336;
}

/* Account Cards */
.account-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.account-card.active {
  border-color: rgba(102, 126, 234, 0.5);
  background: rgba(255, 255, 255, 0.15);
}

.account-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.account-avatar {
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.account-info {
  flex: 1;
}

.account-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.25rem;
}

.account-username {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.status-chip {
  font-size: 0.75rem;
}

/* Account Stats */
.account-stats {
  display: flex;
  justify-content: space-around;
  padding: 1.5rem 0;
  margin-bottom: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.25rem;
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
}

.stat-divider {
  width: 1px;
  background: rgba(255, 255, 255, 0.2);
}

/* Performance & Activity Sections */
.performance-section,
.activity-section {
  margin-bottom: 1.5rem;
}

.section-subtitle {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.activity-details {
  flex: 1;
}

.activity-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.activity-time {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
}

/* Account Actions */
.account-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}

.action-btn {
  flex: 1;
  font-size: 0.75rem;
}

/* Add Account Card */
.add-account-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  cursor: pointer;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.add-account-card:hover {
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.15);
}

.add-account-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
  margin: 1rem 0 0.5rem;
}

.add-account-subtitle {
  color: rgba(255, 255, 255, 0.7);
}

/* Analytics Overview */
.analytics-overview {
  margin-top: 3rem;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: white;
}

.metric-card {
  text-align: center;
}

.metric-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 1rem;
}

.metric-value-large {
  font-size: 3rem;
  font-weight: 800;
  color: white;
}

.metric-description {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
}

.reach-breakdown {
  display: flex;
  justify-content: space-around;
}

.reach-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.reach-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.reach-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
}

.best-times {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1rem;
}

.time-slot {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 12px;
  text-align: center;
}

.time-day {
  display: block;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.time-hour {
  display: block;
  color: white;
  font-weight: 600;
  font-size: 1.125rem;
}

/* Dialog */
.dialog-content {
  padding: 2.5rem;
}

.dialog-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
  text-align: center;
}

.dialog-subtitle {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
}

.connection-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 2rem;
}

.connection-option {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.connection-option:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.connection-option h3 {
  color: white;
  font-weight: 600;
  margin: 0.5rem 0;
}

.connection-option p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
}

/* Glass Controls */
.glass-btn {
  background: rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: white !important;
  font-weight: 500;
  transition: all 0.3s ease;
  text-transform: none;
}

.glass-btn:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.glass-menu {
  background: rgba(30, 30, 30, 0.9) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Responsive */
@media (max-width: 960px) {
  .accounts-title {
    font-size: 2.5rem;
  }
  
  .connection-options {
    grid-template-columns: 1fr;
  }
  
  .best-times {
    grid-template-columns: 1fr;
  }
}
</style>