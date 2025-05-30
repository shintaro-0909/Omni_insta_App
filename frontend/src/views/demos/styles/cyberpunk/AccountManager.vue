<template>
  <div class="cyberpunk-accounts">
    <div class="scanlines"></div>
    <div class="data-grid"></div>
    
    <!-- Header -->
    <header class="accounts-header">
      <div class="header-content">
        <h1 class="page-title">
          <span class="glitch-text" data-text="NEURAL">NEURAL</span>
          <span class="neon-text">ACCOUNT MATRIX</span>
        </h1>
        <div class="header-stats">
          <div class="stat-item">
            <span class="stat-value neon-cyan">{{ accounts.length }}</span>
            <span class="stat-label">ACTIVE LINKS</span>
          </div>
          <div class="stat-item">
            <span class="stat-value neon-magenta">{{ totalFollowers }}</span>
            <span class="stat-label">TOTAL REACH</span>
          </div>
          <div class="stat-item">
            <span class="stat-value neon-green">{{ totalPosts }}</span>
            <span class="stat-label">POSTS TODAY</span>
          </div>
        </div>
        <button class="cyber-btn add-account-btn" @click="showAddDialog = true">
          <span class="btn-icon">+</span>
          LINK NEW ACCOUNT
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <div class="accounts-layout">
      
      <!-- Accounts Grid -->
      <div class="accounts-grid">
        <div 
          class="account-card"
          v-for="account in accounts"
          :key="account.id"
          :class="['status-' + account.status, { selected: selectedAccount?.id === account.id }]"
          @click="selectAccount(account)"
        >
          <div class="card-header">
            <div class="account-avatar">
              <img :src="account.avatar" :alt="account.username">
              <div class="status-indicator" :class="account.status"></div>
              <div class="neural-ring"></div>
            </div>
            <div class="account-info">
              <h3 class="account-username">{{ account.username }}</h3>
              <p class="account-name">{{ account.fullName }}</p>
              <span class="account-type" :class="'type-' + account.type">{{ account.type.toUpperCase() }}</span>
            </div>
            <div class="account-actions">
              <button class="action-btn refresh" @click.stop="refreshAccount(account.id)" :disabled="account.refreshing">
                <span class="icon" :class="{ spinning: account.refreshing }">🔄</span>
              </button>
              <button class="action-btn settings" @click.stop="openSettings(account.id)">
                <span class="icon">⚙️</span>
              </button>
              <button class="action-btn disconnect" @click.stop="disconnectAccount(account.id)">
                <span class="icon">🔌</span>
              </button>
            </div>
          </div>
          
          <div class="card-metrics">
            <div class="metrics-grid">
              <div class="metric-item">
                <span class="metric-value">{{ formatNumber(account.followers) }}</span>
                <span class="metric-label">FOLLOWERS</span>
                <div class="metric-trend" :class="account.followersTrend">
                  {{ account.followersTrend === 'up' ? '↗' : account.followersTrend === 'down' ? '↘' : '→' }}
                  {{ Math.abs(account.followersChange) }}
                </div>
              </div>
              <div class="metric-item">
                <span class="metric-value">{{ formatNumber(account.following) }}</span>
                <span class="metric-label">FOLLOWING</span>
              </div>
              <div class="metric-item">
                <span class="metric-value">{{ account.postsCount }}</span>
                <span class="metric-label">POSTS</span>
              </div>
              <div class="metric-item">
                <span class="metric-value">{{ account.todayPosts }}</span>
                <span class="metric-label">TODAY</span>
              </div>
            </div>
          </div>
          
          <div class="card-engagement">
            <div class="engagement-header">
              <span class="engagement-title">NEURAL ACTIVITY</span>
              <span class="engagement-score" :class="getEngagementClass(account.engagementRate)">
                {{ account.engagementRate }}%
              </span>
            </div>
            <div class="engagement-chart">
              <div 
                class="engagement-bar"
                v-for="(value, index) in account.activityChart"
                :key="index"
                :style="{ height: value + '%' }"
                :class="getBarClass(value)"
              ></div>
            </div>
          </div>
          
          <div class="card-status">
            <div class="status-info">
              <span class="status-text">{{ getStatusText(account.status) }}</span>
              <span class="last-sync">Last sync: {{ account.lastSync }}</span>
            </div>
            <div class="neural-strength">
              <span class="strength-label">NEURAL LINK</span>
              <div class="strength-bars">
                <div 
                  class="strength-bar"
                  v-for="i in 5"
                  :key="i"
                  :class="{ active: i <= account.linkStrength }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Analytics Panel -->
      <div class="analytics-panel" v-if="selectedAccount">
        <div class="panel-header">
          <h3 class="panel-title neon-cyan">DEEP NEURAL ANALYSIS</h3>
          <div class="analysis-controls">
            <button 
              class="period-btn"
              v-for="period in analysisPeriods"
              :key="period"
              :class="{ active: analysisPeriod === period }"
              @click="analysisPeriod = period"
            >
              {{ period }}
            </button>
          </div>
        </div>
        
        <div class="panel-content">
          <!-- Performance Metrics -->
          <div class="metrics-section">
            <h4 class="section-title">PERFORMANCE MATRIX</h4>
            <div class="performance-grid">
              <div class="performance-card">
                <div class="performance-icon engagement"></div>
                <div class="performance-info">
                  <span class="performance-value neon-cyan">{{ selectedAccount.avgEngagement }}%</span>
                  <span class="performance-label">AVG ENGAGEMENT</span>
                </div>
                <div class="performance-trend up">+12%</div>
              </div>
              
              <div class="performance-card">
                <div class="performance-icon reach"></div>
                <div class="performance-info">
                  <span class="performance-value neon-magenta">{{ formatNumber(selectedAccount.avgReach) }}</span>
                  <span class="performance-label">AVG REACH</span>
                </div>
                <div class="performance-trend up">+8%</div>
              </div>
              
              <div class="performance-card">
                <div class="performance-icon impressions"></div>
                <div class="performance-info">
                  <span class="performance-value neon-green">{{ formatNumber(selectedAccount.avgImpressions) }}</span>
                  <span class="performance-label">IMPRESSIONS</span>
                </div>
                <div class="performance-trend down">-3%</div>
              </div>
            </div>
          </div>
          
          <!-- Growth Chart -->
          <div class="chart-section">
            <h4 class="section-title">GROWTH TRAJECTORY</h4>
            <div class="growth-chart">
              <svg class="chart-svg" viewBox="0 0 400 200">
                <defs>
                  <linearGradient id="growthGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#00ffff;stop-opacity:0.8" />
                    <stop offset="100%" style="stop-color:#00ffff;stop-opacity:0" />
                  </linearGradient>
                </defs>
                <path
                  class="growth-line"
                  :d="growthPath"
                  fill="none"
                  stroke="#00ffff"
                  stroke-width="3"
                />
                <path
                  class="growth-area"
                  :d="growthAreaPath"
                  fill="url(#growthGradient)"
                />
                <g class="growth-points">
                  <circle
                    v-for="(point, index) in growthData"
                    :key="index"
                    :cx="point.x"
                    :cy="point.y"
                    r="4"
                    fill="#00ffff"
                    class="growth-point"
                  />
                </g>
              </svg>
              <div class="chart-overlay">
                <div class="chart-stats">
                  <div class="stat-item">
                    <span class="stat-value neon-cyan">+{{ selectedAccount.monthlyGrowth }}%</span>
                    <span class="stat-label">MONTHLY GROWTH</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Recent Activity -->
          <div class="activity-section">
            <h4 class="section-title">NEURAL ACTIVITY LOG</h4>
            <div class="activity-feed">
              <div 
                class="activity-item"
                v-for="activity in selectedAccount.recentActivity"
                :key="activity.id"
              >
                <div class="activity-time">{{ activity.time }}</div>
                <div class="activity-type" :class="'type-' + activity.type">
                  {{ activity.type.toUpperCase() }}
                </div>
                <div class="activity-description">{{ activity.description }}</div>
                <div class="activity-value" :class="getValueClass(activity.value)">
                  {{ activity.value }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- AI Insights -->
          <div class="insights-section">
            <h4 class="section-title">AI NEURAL INSIGHTS</h4>
            <div class="insights-list">
              <div 
                class="insight-item"
                v-for="insight in selectedAccount.aiInsights"
                :key="insight.id"
                :class="'priority-' + insight.priority"
              >
                <div class="insight-icon">
                  <span class="icon">{{ insight.icon }}</span>
                </div>
                <div class="insight-content">
                  <h5 class="insight-title">{{ insight.title }}</h5>
                  <p class="insight-description">{{ insight.description }}</p>
                </div>
                <div class="insight-confidence">
                  <span class="confidence-value">{{ insight.confidence }}%</span>
                  <span class="confidence-label">CONFIDENCE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Account Dialog -->
    <div v-if="showAddDialog" class="dialog-overlay" @click="showAddDialog = false">
      <div class="add-dialog" @click.stop>
        <div class="dialog-header">
          <h3 class="dialog-title">ESTABLISH NEURAL LINK</h3>
          <button class="close-btn" @click="showAddDialog = false">×</button>
        </div>
        
        <div class="dialog-content">
          <div class="connection-steps">
            <div class="step" :class="{ active: connectionStep >= 1, completed: connectionStep > 1 }">
              <div class="step-number">1</div>
              <div class="step-content">
                <h4 class="step-title">AUTHENTICATION</h4>
                <p class="step-description">Connect to Instagram Graph API</p>
              </div>
            </div>
            
            <div class="step" :class="{ active: connectionStep >= 2, completed: connectionStep > 2 }">
              <div class="step-number">2</div>
              <div class="step-content">
                <h4 class="step-title">VERIFICATION</h4>
                <p class="step-description">Verify account permissions</p>
              </div>
            </div>
            
            <div class="step" :class="{ active: connectionStep >= 3, completed: connectionStep > 3 }">
              <div class="step-number">3</div>
              <div class="step-content">
                <h4 class="step-title">SYNCHRONIZATION</h4>
                <p class="step-description">Initialize neural interface</p>
              </div>
            </div>
          </div>
          
          <div class="connection-form" v-if="connectionStep === 1">
            <div class="form-group">
              <label class="form-label">ACCOUNT TYPE</label>
              <div class="account-type-selector">
                <button 
                  class="type-option"
                  v-for="type in accountTypes"
                  :key="type.id"
                  :class="{ active: newAccount.type === type.id }"
                  @click="newAccount.type = type.id"
                >
                  <div class="type-icon" v-html="type.icon"></div>
                  <span class="type-name">{{ type.name }}</span>
                  <span class="type-description">{{ type.description }}</span>
                </button>
              </div>
            </div>
          </div>
          
          <div class="verification-form" v-if="connectionStep === 2">
            <div class="verification-status">
              <div class="status-item" v-for="permission in requiredPermissions" :key="permission.name">
                <div class="permission-icon" :class="{ granted: permission.granted }">
                  {{ permission.granted ? '✓' : '○' }}
                </div>
                <span class="permission-name">{{ permission.name }}</span>
                <span class="permission-description">{{ permission.description }}</span>
              </div>
            </div>
          </div>
          
          <div class="sync-progress" v-if="connectionStep === 3">
            <div class="sync-animation">
              <div class="sync-rings">
                <div class="ring" v-for="i in 3" :key="i"></div>
              </div>
            </div>
            <div class="sync-status">
              <h4 class="sync-title">ESTABLISHING NEURAL LINK</h4>
              <p class="sync-message">{{ syncMessage }}</p>
              <div class="sync-progress-bar">
                <div class="progress-fill" :style="{ width: syncProgress + '%' }"></div>
              </div>
              <span class="sync-percentage">{{ syncProgress }}%</span>
            </div>
          </div>
        </div>
        
        <div class="dialog-actions">
          <button 
            v-if="connectionStep === 1"
            class="cyber-btn secondary" 
            @click="showAddDialog = false"
          >
            CANCEL
          </button>
          <button 
            v-if="connectionStep === 1"
            class="cyber-btn primary" 
            @click="startConnection"
            :disabled="!newAccount.type"
          >
            INITIATE CONNECTION
          </button>
          
          <button 
            v-if="connectionStep === 2"
            class="cyber-btn primary" 
            @click="verifyPermissions"
          >
            VERIFY PERMISSIONS
          </button>
          
          <button 
            v-if="connectionStep === 3 && syncProgress === 100"
            class="cyber-btn primary" 
            @click="completeConnection"
          >
            ESTABLISH LINK
          </button>
        </div>
      </div>
    </div>

    <!-- Neural Processing Overlay -->
    <div v-if="isProcessing" class="processing-overlay">
      <div class="processing-content">
        <div class="neural-processing">
          <div class="processing-rings">
            <div class="ring" v-for="i in 4" :key="i"></div>
          </div>
        </div>
        <h3 class="processing-title">{{ processingTitle }}</h3>
        <p class="processing-message">{{ processingMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Reactive data
const selectedAccount = ref<any>(null)
const showAddDialog = ref(false)
const analysisPeriod = ref('7D')
const connectionStep = ref(1)
const syncProgress = ref(0)
const syncMessage = ref('Initializing connection...')
const isProcessing = ref(false)
const processingTitle = ref('')
const processingMessage = ref('')

const newAccount = ref({
  type: ''
})

const analysisPeriods = ['24H', '7D', '30D', '90D']

const accountTypes = ref([
  {
    id: 'personal',
    name: 'PERSONAL',
    description: 'Individual creator account',
    icon: '👤'
  },
  {
    id: 'business',
    name: 'BUSINESS',
    description: 'Business or brand account',
    icon: '🏢'
  },
  {
    id: 'creator',
    name: 'CREATOR',
    description: 'Content creator account',
    icon: '🎨'
  }
])

const requiredPermissions = ref([
  {
    name: 'BASIC_READ',
    description: 'Read basic account information',
    granted: false
  },
  {
    name: 'CONTENT_PUBLISH',
    description: 'Publish posts and stories',
    granted: false
  },
  {
    name: 'INSIGHTS_READ',
    description: 'Access analytics and insights',
    granted: false
  },
  {
    name: 'MEDIA_MANAGE',
    description: 'Upload and manage media',
    granted: false
  }
])

const accounts = ref([
  {
    id: 1,
    username: '@neural_tech',
    fullName: 'Neural Technology',
    avatar: 'https://picsum.photos/80/80?random=1',
    status: 'online',
    type: 'business',
    followers: 125000,
    following: 890,
    postsCount: 247,
    todayPosts: 3,
    engagementRate: 8.7,
    linkStrength: 5,
    lastSync: '2 minutes ago',
    refreshing: false,
    followersTrend: 'up',
    followersChange: 1240,
    activityChart: [60, 80, 45, 90, 70, 85, 95, 65, 75, 88, 92, 78],
    avgEngagement: 8.7,
    avgReach: 45000,
    avgImpressions: 98000,
    monthlyGrowth: 12.5,
    recentActivity: [
      {
        id: 1,
        time: '14:23',
        type: 'post',
        description: 'New post published',
        value: '+89 likes'
      },
      {
        id: 2,
        time: '13:45',
        type: 'engagement',
        description: 'High engagement detected',
        value: '12% above avg'
      },
      {
        id: 3,
        time: '12:30',
        type: 'follower',
        description: 'New followers gained',
        value: '+47 followers'
      }
    ],
    aiInsights: [
      {
        id: 1,
        title: 'OPTIMAL POSTING TIME',
        description: 'Your audience is most active between 18:00-20:00 JST',
        icon: '⏰',
        priority: 'high',
        confidence: 94
      },
      {
        id: 2,
        title: 'HASHTAG OPTIMIZATION',
        description: 'Using #ai and #tech hashtags increases engagement by 23%',
        icon: '#️⃣',
        priority: 'medium',
        confidence: 87
      }
    ]
  },
  {
    id: 2,
    username: '@cyber_fashion',
    fullName: 'Cyber Fashion',
    avatar: 'https://picsum.photos/80/80?random=2',
    status: 'online',
    type: 'creator',
    followers: 89000,
    following: 1250,
    postsCount: 432,
    todayPosts: 1,
    engagementRate: 12.3,
    linkStrength: 4,
    lastSync: '5 minutes ago',
    refreshing: false,
    followersTrend: 'up',
    followersChange: 890,
    activityChart: [75, 85, 95, 80, 70, 90, 85, 75, 80, 85, 90, 88],
    avgEngagement: 12.3,
    avgReach: 32000,
    avgImpressions: 76000,
    monthlyGrowth: 18.2,
    recentActivity: [
      {
        id: 1,
        time: '11:15',
        type: 'story',
        description: 'Story posted',
        value: '1.2K views'
      }
    ],
    aiInsights: [
      {
        id: 1,
        title: 'CONTENT STRATEGY',
        description: 'Fashion posts perform 45% better on weekends',
        icon: '👗',
        priority: 'high',
        confidence: 91
      }
    ]
  },
  {
    id: 3,
    username: '@matrix_lifestyle',
    fullName: 'Matrix Lifestyle',
    avatar: 'https://picsum.photos/80/80?random=3',
    status: 'offline',
    type: 'personal',
    followers: 203000,
    following: 567,
    postsCount: 189,
    todayPosts: 0,
    engagementRate: 6.8,
    linkStrength: 2,
    lastSync: '2 hours ago',
    refreshing: false,
    followersTrend: 'down',
    followersChange: 145,
    activityChart: [40, 50, 35, 60, 45, 55, 50, 40, 45, 50, 55, 48],
    avgEngagement: 6.8,
    avgReach: 67000,
    avgImpressions: 124000,
    monthlyGrowth: -2.1,
    recentActivity: [],
    aiInsights: [
      {
        id: 1,
        title: 'ENGAGEMENT DECLINE',
        description: 'Posting frequency has decreased by 40% this month',
        icon: '📉',
        priority: 'high',
        confidence: 96
      }
    ]
  }
])

// Computed properties
const totalFollowers = computed(() => {
  return formatNumber(accounts.value.reduce((sum, account) => sum + account.followers, 0))
})

const totalPosts = computed(() => {
  return accounts.value.reduce((sum, account) => sum + account.todayPosts, 0)
})

const growthData = computed(() => {
  return [
    { x: 50, y: 150 },
    { x: 100, y: 120 },
    { x: 150, y: 100 },
    { x: 200, y: 80 },
    { x: 250, y: 60 },
    { x: 300, y: 40 },
    { x: 350, y: 20 }
  ]
})

const growthPath = computed(() => {
  return growthData.value.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ')
})

const growthAreaPath = computed(() => {
  const path = growthPath.value
  const firstPoint = growthData.value[0]
  const lastPoint = growthData.value[growthData.value.length - 1]
  return `${path} L ${lastPoint.x} 200 L ${firstPoint.x} 200 Z`
})

// Methods
const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const selectAccount = (account: any) => {
  selectedAccount.value = account
}

const refreshAccount = async (accountId: number) => {
  const account = accounts.value.find(a => a.id === accountId)
  if (account) {
    account.refreshing = true
    isProcessing.value = true
    processingTitle.value = 'REFRESHING NEURAL LINK'
    processingMessage.value = 'Synchronizing account data...'
    
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    account.refreshing = false
    account.lastSync = 'Just now'
    isProcessing.value = false
  }
}

const openSettings = (accountId: number) => {
  console.log('Open settings for account:', accountId)
}

const disconnectAccount = async (accountId: number) => {
  if (confirm('Are you sure you want to disconnect this neural link?')) {
    isProcessing.value = true
    processingTitle.value = 'DISCONNECTING NEURAL LINK'
    processingMessage.value = 'Severing connection...'
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    accounts.value = accounts.value.filter(a => a.id !== accountId)
    if (selectedAccount.value?.id === accountId) {
      selectedAccount.value = null
    }
    isProcessing.value = false
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'online': return 'NEURAL LINK ACTIVE'
    case 'offline': return 'CONNECTION LOST'
    case 'syncing': return 'SYNCHRONIZING'
    default: return 'UNKNOWN STATUS'
  }
}

const getEngagementClass = (rate: number) => {
  if (rate >= 10) return 'high'
  if (rate >= 5) return 'medium'
  return 'low'
}

const getBarClass = (value: number) => {
  if (value >= 80) return 'high'
  if (value >= 60) return 'medium'
  return 'low'
}

const getValueClass = (value: string) => {
  if (value.includes('+')) return 'positive'
  if (value.includes('-')) return 'negative'
  return 'neutral'
}

const startConnection = () => {
  connectionStep.value = 2
  
  // Simulate permission verification
  setTimeout(() => {
    requiredPermissions.value.forEach((permission, index) => {
      setTimeout(() => {
        permission.granted = true
      }, index * 500)
    })
  }, 1000)
}

const verifyPermissions = () => {
  connectionStep.value = 3
  
  // Simulate sync process
  const syncMessages = [
    'Establishing secure connection...',
    'Authenticating credentials...',
    'Downloading account data...',
    'Configuring neural interface...',
    'Finalizing connection...'
  ]
  
  let messageIndex = 0
  const syncInterval = setInterval(() => {
    syncProgress.value += Math.random() * 20
    
    if (messageIndex < syncMessages.length - 1 && syncProgress.value > (messageIndex + 1) * 20) {
      messageIndex++
      syncMessage.value = syncMessages[messageIndex]
    }
    
    if (syncProgress.value >= 100) {
      syncProgress.value = 100
      syncMessage.value = 'Neural link established successfully!'
      clearInterval(syncInterval)
    }
  }, 300)
}

const completeConnection = () => {
  // Add new account
  const newId = Math.max(...accounts.value.map(a => a.id)) + 1
  accounts.value.push({
    id: newId,
    username: '@new_account',
    fullName: 'New Neural Link',
    avatar: 'https://picsum.photos/80/80?random=' + newId,
    status: 'online',
    type: newAccount.value.type,
    followers: Math.floor(Math.random() * 50000) + 10000,
    following: Math.floor(Math.random() * 1000) + 500,
    postsCount: Math.floor(Math.random() * 100) + 50,
    todayPosts: 0,
    engagementRate: Math.random() * 10 + 5,
    linkStrength: 5,
    lastSync: 'Just now',
    refreshing: false,
    followersTrend: 'up',
    followersChange: Math.floor(Math.random() * 1000),
    activityChart: Array.from({ length: 12 }, () => Math.floor(Math.random() * 40) + 40),
    avgEngagement: Math.random() * 10 + 5,
    avgReach: Math.floor(Math.random() * 50000) + 20000,
    avgImpressions: Math.floor(Math.random() * 100000) + 50000,
    monthlyGrowth: Math.random() * 20 - 5,
    recentActivity: [],
    aiInsights: []
  })
  
  showAddDialog.value = false
  connectionStep.value = 1
  syncProgress.value = 0
  syncMessage.value = 'Initializing connection...'
  newAccount.value.type = ''
}

onMounted(() => {
  // Select first account by default
  if (accounts.value.length > 0) {
    selectedAccount.value = accounts.value[0]
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

/* Base Styles */
.cyberpunk-accounts {
  min-height: 100vh;
  background: #000;
  color: #00ffff;
  font-family: 'Orbitron', monospace;
  position: relative;
}

/* Effects */
.scanlines {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent 50%,
    rgba(0, 255, 255, 0.02) 51%
  );
  background-size: 100% 3px;
  pointer-events: none;
  z-index: 1;
}

.data-grid {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px),
    radial-gradient(circle at 50% 50%, rgba(255, 0, 255, 0.1) 1px, transparent 1px);
  background-size: 100px 100px, 100px 100px, 200px 200px;
  pointer-events: none;
  z-index: 0;
}

/* Header */
.accounts-header {
  position: relative;
  z-index: 2;
  padding: 1rem;
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1600px;
  margin: 0 auto;
  gap: 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 900;
  margin: 0;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.header-stats {
  display: flex;
  gap: 2rem;
  flex: 1;
  justify-content: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 900;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.8rem;
  color: rgba(0, 255, 255, 0.7);
  font-weight: 700;
}

.cyber-btn {
  background: transparent;
  border: 2px solid #00ffff;
  color: #00ffff;
  padding: 0.75rem 1.5rem;
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.cyber-btn:hover {
  background: rgba(0, 255, 255, 0.1);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
}

.cyber-btn.primary {
  border-color: #ff00ff;
  color: #ff00ff;
}

.cyber-btn.primary:hover {
  background: rgba(255, 0, 255, 0.1);
  box-shadow: 0 0 20px rgba(255, 0, 255, 0.5);
}

.cyber-btn.secondary {
  border-color: rgba(0, 255, 255, 0.5);
  color: rgba(0, 255, 255, 0.7);
}

.cyber-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

/* Main Layout */
.accounts-layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 1rem;
  padding: 1rem;
  max-width: 1600px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

/* Accounts Grid */
.accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1rem;
  height: fit-content;
}

.account-card {
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid #00ffff;
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.account-card:hover,
.account-card.selected {
  border-color: #ff00ff;
  box-shadow: 0 0 20px rgba(255, 0, 255, 0.3);
  transform: translateY(-2px);
}

.account-card.status-offline {
  border-color: rgba(255, 0, 64, 0.5);
}

.account-card.status-offline:hover,
.account-card.status-offline.selected {
  border-color: #ff0040;
  box-shadow: 0 0 20px rgba(255, 0, 64, 0.3);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.account-avatar {
  position: relative;
  width: 60px;
  height: 60px;
}

.account-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid #00ffff;
}

.status-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #000;
  animation: pulse 2s infinite;
}

.status-indicator.online {
  background: #00ff00;
}

.status-indicator.offline {
  background: #ff0040;
}

.neural-ring {
  position: absolute;
  top: -8px;
  left: -8px;
  width: 76px;
  height: 76px;
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 50%;
  animation: rotate 10s linear infinite;
}

.account-info {
  flex: 1;
}

.account-username {
  font-size: 1.2rem;
  font-weight: 700;
  color: #00ffff;
  margin: 0 0 0.25rem 0;
}

.account-name {
  color: rgba(0, 255, 255, 0.8);
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
}

.account-type {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 700;
}

.type-personal {
  background: rgba(0, 255, 255, 0.2);
  border: 1px solid #00ffff;
  color: #00ffff;
}

.type-business {
  background: rgba(255, 0, 255, 0.2);
  border: 1px solid #ff00ff;
  color: #ff00ff;
}

.type-creator {
  background: rgba(0, 255, 0, 0.2);
  border: 1px solid #00ff00;
  color: #00ff00;
}

.account-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 255, 0.3);
  color: #00ffff;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(0, 255, 255, 0.2);
  border-color: #00ffff;
}

.action-btn.disconnect {
  border-color: rgba(255, 0, 64, 0.5);
  color: rgba(255, 0, 64, 0.8);
}

.action-btn.disconnect:hover {
  background: rgba(255, 0, 64, 0.1);
  border-color: #ff0040;
  color: #ff0040;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.icon.spinning {
  animation: spin 1s linear infinite;
}

.card-metrics {
  margin-bottom: 1.5rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.metric-item {
  text-align: center;
  padding: 1rem;
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.3);
}

.metric-value {
  display: block;
  font-size: 1.2rem;
  font-weight: 700;
  color: #00ffff;
  margin-bottom: 0.25rem;
}

.metric-label {
  display: block;
  font-size: 0.7rem;
  color: rgba(0, 255, 255, 0.7);
  margin-bottom: 0.25rem;
}

.metric-trend {
  font-size: 0.7rem;
  font-weight: 700;
}

.metric-trend.up {
  color: #00ff00;
}

.metric-trend.down {
  color: #ff0040;
}

.card-engagement {
  margin-bottom: 1.5rem;
}

.engagement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.engagement-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: rgba(0, 255, 255, 0.8);
}

.engagement-score {
  font-size: 1rem;
  font-weight: 700;
}

.engagement-score.high {
  color: #00ff00;
}

.engagement-score.medium {
  color: #ffff00;
}

.engagement-score.low {
  color: #ff0040;
}

.engagement-chart {
  display: flex;
  align-items: end;
  gap: 2px;
  height: 40px;
  padding: 0 1rem;
}

.engagement-bar {
  flex: 1;
  background: #00ffff;
  border-radius: 2px 2px 0 0;
  transition: all 0.3s ease;
  min-height: 4px;
}

.engagement-bar.high {
  background: #00ff00;
}

.engagement-bar.medium {
  background: #ffff00;
}

.engagement-bar.low {
  background: #ff0040;
}

.card-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-info {
  display: flex;
  flex-direction: column;
}

.status-text {
  font-size: 0.8rem;
  font-weight: 700;
  color: #00ffff;
}

.last-sync {
  font-size: 0.7rem;
  color: rgba(0, 255, 255, 0.6);
}

.neural-strength {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.strength-label {
  font-size: 0.7rem;
  color: rgba(0, 255, 255, 0.7);
}

.strength-bars {
  display: flex;
  gap: 2px;
}

.strength-bar {
  width: 4px;
  height: 16px;
  background: rgba(0, 255, 255, 0.2);
  border-radius: 2px;
}

.strength-bar:nth-child(1) { height: 8px; }
.strength-bar:nth-child(2) { height: 10px; }
.strength-bar:nth-child(3) { height: 12px; }
.strength-bar:nth-child(4) { height: 14px; }
.strength-bar:nth-child(5) { height: 16px; }

.strength-bar.active {
  background: #00ff00;
  box-shadow: 0 0 4px #00ff00;
}

/* Analytics Panel */
.analytics-panel {
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid #00ffff;
  border-radius: 8px;
  height: fit-content;
  position: sticky;
  top: 1rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(0, 255, 255, 0.1);
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
}

.panel-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
}

.analysis-controls {
  display: flex;
  gap: 0.25rem;
}

.period-btn {
  background: transparent;
  border: 1px solid rgba(0, 255, 255, 0.5);
  color: rgba(0, 255, 255, 0.7);
  padding: 0.25rem 0.5rem;
  font-family: 'Orbitron', monospace;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.period-btn.active {
  border-color: #00ffff;
  color: #00ffff;
  background: rgba(0, 255, 255, 0.1);
}

.panel-content {
  padding: 1rem;
  max-height: 80vh;
  overflow-y: auto;
}

.metrics-section,
.chart-section,
.activity-section,
.insights-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #00ffff;
  margin: 0 0 1rem 0;
}

/* Performance Metrics */
.performance-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.performance-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.3);
}

.performance-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #00ffff;
}

.performance-icon.engagement::before {
  content: '💗';
  font-size: 1.2rem;
}

.performance-icon.reach::before {
  content: '👥';
  font-size: 1.2rem;
}

.performance-icon.impressions::before {
  content: '👁️';
  font-size: 1.2rem;
}

.performance-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.performance-value {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.performance-label {
  font-size: 0.8rem;
  color: rgba(0, 255, 255, 0.7);
}

.performance-trend {
  font-size: 0.9rem;
  font-weight: 700;
}

.performance-trend.up {
  color: #00ff00;
}

.performance-trend.down {
  color: #ff0040;
}

/* Growth Chart */
.growth-chart {
  position: relative;
  height: 200px;
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
}

.chart-svg {
  width: 100%;
  height: 160px;
}

.growth-line {
  filter: drop-shadow(0 0 3px #00ffff);
}

.growth-point {
  filter: drop-shadow(0 0 2px #00ffff);
}

.chart-overlay {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.chart-stats {
  text-align: right;
}

/* Activity Feed */
.activity-feed {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
}

.activity-item {
  display: grid;
  grid-template-columns: 60px 80px 1fr 80px;
  gap: 0.5rem;
  align-items: center;
  padding: 0.75rem;
  border: 1px solid rgba(0, 255, 255, 0.1);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.2);
}

.activity-time {
  font-size: 0.8rem;
  color: rgba(0, 255, 255, 0.7);
  font-family: 'Courier New', monospace;
}

.activity-type {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  text-align: center;
}

.type-post {
  background: rgba(0, 255, 255, 0.2);
  color: #00ffff;
}

.type-engagement {
  background: rgba(255, 0, 255, 0.2);
  color: #ff00ff;
}

.type-follower {
  background: rgba(0, 255, 0, 0.2);
  color: #00ff00;
}

.type-story {
  background: rgba(255, 255, 0, 0.2);
  color: #ffff00;
}

.activity-description {
  font-size: 0.8rem;
  color: rgba(0, 255, 255, 0.8);
}

.activity-value {
  font-size: 0.8rem;
  font-weight: 700;
  text-align: right;
}

.activity-value.positive {
  color: #00ff00;
}

.activity-value.negative {
  color: #ff0040;
}

.activity-value.neutral {
  color: #00ffff;
}

/* AI Insights */
.insights-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.insight-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-left: 4px solid;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.3);
}

.insight-item.priority-high {
  border-left-color: #ff0040;
  background: rgba(255, 0, 64, 0.1);
}

.insight-item.priority-medium {
  border-left-color: #ffff00;
  background: rgba(255, 255, 0, 0.1);
}

.insight-item.priority-low {
  border-left-color: #00ffff;
  background: rgba(0, 255, 255, 0.1);
}

.insight-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.insight-content {
  flex: 1;
}

.insight-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #00ffff;
  margin: 0 0 0.5rem 0;
}

.insight-description {
  font-size: 0.8rem;
  color: rgba(0, 255, 255, 0.8);
  margin: 0;
  line-height: 1.4;
}

.insight-confidence {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.confidence-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #00ff00;
}

.confidence-label {
  font-size: 0.7rem;
  color: rgba(0, 255, 255, 0.7);
}

/* Add Dialog */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.add-dialog {
  background: rgba(0, 0, 0, 0.95);
  border: 2px solid #00ffff;
  border-radius: 8px;
  width: 600px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
  background: rgba(0, 255, 255, 0.1);
}

.dialog-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
  color: #00ffff;
}

.close-btn {
  background: transparent;
  border: none;
  color: rgba(0, 255, 255, 0.7);
  font-size: 1.5rem;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #ff0040;
}

.dialog-content {
  padding: 1.5rem;
}

/* Connection Steps */
.connection-steps {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.step {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.3);
  opacity: 0.5;
  transition: all 0.3s ease;
}

.step.active {
  opacity: 1;
  border-color: #ff00ff;
  background: rgba(255, 0, 255, 0.1);
}

.step.completed {
  border-color: #00ff00;
  background: rgba(0, 255, 0, 0.1);
}

.step-number {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #00ffff;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.step.active .step-number {
  background: #ff00ff;
}

.step.completed .step-number {
  background: #00ff00;
}

.step-content {
  flex: 1;
}

.step-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  color: #00ffff;
}

.step-description {
  font-size: 0.8rem;
  color: rgba(0, 255, 255, 0.7);
  margin: 0;
}

/* Account Type Selector */
.account-type-selector {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.type-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: transparent;
  border: 1px solid rgba(0, 255, 255, 0.3);
  color: #00ffff;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 4px;
  text-align: left;
}

.type-option:hover,
.type-option.active {
  border-color: #ff00ff;
  background: rgba(255, 0, 255, 0.1);
  color: #ff00ff;
}

.type-icon {
  font-size: 2rem;
  width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.type-name {
  font-size: 1.1rem;
  font-weight: 700;
  display: block;
  margin-bottom: 0.25rem;
}

.type-description {
  font-size: 0.8rem;
  color: rgba(0, 255, 255, 0.7);
  display: block;
}

/* Verification Form */
.verification-status {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.3);
}

.permission-icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(0, 255, 255, 0.5);
  color: rgba(0, 255, 255, 0.5);
  font-weight: 700;
  transition: all 0.3s ease;
}

.permission-icon.granted {
  border-color: #00ff00;
  color: #00ff00;
  background: rgba(0, 255, 0, 0.1);
}

.permission-name {
  font-weight: 700;
  color: #00ffff;
  display: block;
  margin-bottom: 0.25rem;
}

.permission-description {
  font-size: 0.8rem;
  color: rgba(0, 255, 255, 0.7);
  display: block;
}

/* Sync Progress */
.sync-progress {
  text-align: center;
}

.sync-animation {
  margin-bottom: 2rem;
}

.sync-rings {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto;
}

.ring {
  position: absolute;
  border: 2px solid #00ffff;
  border-radius: 50%;
  animation: sync-pulse 2s infinite;
}

.ring:nth-child(1) {
  width: 40px;
  height: 40px;
  top: 30px;
  left: 30px;
  animation-delay: 0s;
}

.ring:nth-child(2) {
  width: 60px;
  height: 60px;
  top: 20px;
  left: 20px;
  animation-delay: 0.5s;
}

.ring:nth-child(3) {
  width: 80px;
  height: 80px;
  top: 10px;
  left: 10px;
  animation-delay: 1s;
}

.sync-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #00ffff;
  margin: 0 0 1rem 0;
}

.sync-message {
  color: rgba(0, 255, 255, 0.8);
  margin: 0 0 1.5rem 0;
}

.sync-progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(0, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00ffff, #ff00ff);
  transition: width 0.3s ease;
}

.sync-percentage {
  font-size: 0.9rem;
  color: #00ffff;
  font-weight: 700;
}

.dialog-actions {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid rgba(0, 255, 255, 0.3);
  justify-content: flex-end;
}

/* Processing Overlay */
.processing-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.processing-content {
  text-align: center;
  padding: 2rem;
  border: 1px solid #00ffff;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.95);
  max-width: 400px;
}

.neural-processing {
  margin-bottom: 2rem;
}

.processing-rings {
  position: relative;
  width: 150px;
  height: 150px;
  margin: 0 auto;
}

.processing-rings .ring {
  position: absolute;
  border: 2px solid #00ffff;
  border-radius: 50%;
  animation: neural-pulse 1.5s infinite;
}

.processing-rings .ring:nth-child(1) {
  width: 50px;
  height: 50px;
  top: 50px;
  left: 50px;
  animation-delay: 0s;
}

.processing-rings .ring:nth-child(2) {
  width: 80px;
  height: 80px;
  top: 35px;
  left: 35px;
  animation-delay: 0.3s;
}

.processing-rings .ring:nth-child(3) {
  width: 110px;
  height: 110px;
  top: 20px;
  left: 20px;
  animation-delay: 0.6s;
}

.processing-rings .ring:nth-child(4) {
  width: 140px;
  height: 140px;
  top: 5px;
  left: 5px;
  animation-delay: 0.9s;
}

.processing-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #00ffff;
  margin: 0 0 1rem 0;
}

.processing-message {
  color: rgba(0, 255, 255, 0.8);
  margin: 0;
}

/* Neon Effects */
.neon-text {
  text-shadow: 
    0 0 5px currentColor,
    0 0 10px currentColor,
    0 0 20px currentColor;
}

.neon-cyan {
  color: #00ffff;
  text-shadow: 0 0 10px #00ffff;
}

.neon-magenta {
  color: #ff00ff;
  text-shadow: 0 0 10px #ff00ff;
}

.neon-green {
  color: #00ff00;
  text-shadow: 0 0 10px #00ff00;
}

/* Glitch Effect */
.glitch-text {
  position: relative;
}

.glitch-text::before,
.glitch-text::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
}

.glitch-text:hover::before {
  animation: glitch-1 0.2s infinite;
  color: #ff00ff;
  opacity: 0.8;
}

.glitch-text:hover::after {
  animation: glitch-2 0.2s infinite;
  color: #00ff00;
  opacity: 0.8;
}

/* Animations */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes sync-pulse {
  0%, 100% { 
    opacity: 0.3;
    transform: scale(1);
  }
  50% { 
    opacity: 1;
    transform: scale(1.1);
  }
}

@keyframes neural-pulse {
  0%, 100% { 
    opacity: 0.3;
    transform: scale(1);
  }
  50% { 
    opacity: 1;
    transform: scale(1.2);
  }
}

@keyframes glitch-1 {
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0); }
}

@keyframes glitch-2 {
  0% { transform: translate(0); }
  20% { transform: translate(2px, -2px); }
  40% { transform: translate(2px, 2px); }
  60% { transform: translate(-2px, -2px); }
  80% { transform: translate(-2px, 2px); }
  100% { transform: translate(0); }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .accounts-layout {
    grid-template-columns: 1fr;
  }
  
  .analytics-panel {
    position: static;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }
  
  .header-stats {
    flex-direction: column;
    gap: 1rem;
  }
  
  .accounts-grid {
    grid-template-columns: 1fr;
  }
  
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .card-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .account-actions {
    justify-content: center;
  }
  
  .activity-item {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
  
  .add-dialog {
    width: 95vw;
    margin: 1rem;
  }
  
  .type-option {
    flex-direction: column;
    text-align: center;
  }
}
</style>