<template>
  <div class="neumorphism-account-manager">
    <!-- Header -->
    <header class="accounts-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">Account Manager</h1>
          <p class="page-subtitle">Connect and manage your Instagram accounts</p>
        </div>
        <div class="header-actions">
          <button class="action-btn" @click="showConnectModal = true">
            <i class="mdi mdi-plus"></i>
            Connect Account
          </button>
          <button class="action-btn secondary" @click="refreshAllAccounts">
            <i class="mdi mdi-refresh"></i>
            Refresh All
          </button>
        </div>
      </div>
    </header>

    <!-- Account Overview Stats -->
    <section class="overview-stats">
      <div class="stats-grid">
        <div class="stat-card total">
          <div class="stat-icon">
            <i class="mdi mdi-account-multiple"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ accounts.length }}</div>
            <div class="stat-label">Connected Accounts</div>
          </div>
        </div>
        <div class="stat-card followers">
          <div class="stat-icon">
            <i class="mdi mdi-account-heart"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ totalFollowers }}</div>
            <div class="stat-label">Total Followers</div>
          </div>
        </div>
        <div class="stat-card posts">
          <div class="stat-icon">
            <i class="mdi mdi-image-multiple"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ totalPosts }}</div>
            <div class="stat-label">Posts This Month</div>
          </div>
        </div>
        <div class="stat-card engagement">
          <div class="stat-icon">
            <i class="mdi mdi-heart"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ averageEngagement }}%</div>
            <div class="stat-label">Avg Engagement</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Accounts Grid -->
    <section class="accounts-section">
      <div class="section-header">
        <h2>Your Accounts</h2>
        <div class="view-controls">
          <button class="view-btn" :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'">
            <i class="mdi mdi-view-grid"></i>
          </button>
          <button class="view-btn" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">
            <i class="mdi mdi-view-list"></i>
          </button>
        </div>
      </div>

      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="accounts-grid">
        <div class="account-card" v-for="account in accounts" :key="account.id">
          <!-- Account Header -->
          <div class="account-header">
            <div class="account-avatar">
              <img :src="account.profilePicture" :alt="account.username" />
              <div class="status-indicator" :class="account.status"></div>
            </div>
            <div class="account-actions">
              <button class="action-menu-btn" @click="toggleAccountMenu(account.id)">
                <i class="mdi mdi-dots-vertical"></i>
              </button>
              <div v-if="activeMenuId === account.id" class="action-menu">
                <button @click="viewAnalytics(account)">
                  <i class="mdi mdi-chart-line"></i>
                  Analytics
                </button>
                <button @click="refreshAccount(account)">
                  <i class="mdi mdi-refresh"></i>
                  Refresh
                </button>
                <button @click="disconnectAccount(account)" class="danger">
                  <i class="mdi mdi-link-off"></i>
                  Disconnect
                </button>
              </div>
            </div>
          </div>

          <!-- Account Info -->
          <div class="account-info">
            <h3 class="account-username">@{{ account.username }}</h3>
            <p class="account-name">{{ account.fullName }}</p>
            <div class="account-stats">
              <div class="stat">
                <span class="stat-number">{{ formatNumber(account.followersCount) }}</span>
                <span class="stat-label">Followers</span>
              </div>
              <div class="stat">
                <span class="stat-number">{{ formatNumber(account.followingCount) }}</span>
                <span class="stat-label">Following</span>
              </div>
              <div class="stat">
                <span class="stat-number">{{ account.mediaCount }}</span>
                <span class="stat-label">Posts</span>
              </div>
            </div>
          </div>

          <!-- Recent Analytics -->
          <div class="account-analytics">
            <div class="analytics-header">
              <h4>Last 30 Days</h4>
              <span class="growth" :class="account.growth > 0 ? 'positive' : 'negative'">
                <i :class="account.growth > 0 ? 'mdi mdi-trending-up' : 'mdi mdi-trending-down'"></i>
                {{ Math.abs(account.growth) }}%
              </span>
            </div>
            <div class="analytics-grid">
              <div class="metric">
                <div class="metric-value">{{ formatNumber(account.analytics.likes) }}</div>
                <div class="metric-label">Likes</div>
              </div>
              <div class="metric">
                <div class="metric-value">{{ formatNumber(account.analytics.comments) }}</div>
                <div class="metric-label">Comments</div>
              </div>
              <div class="metric">
                <div class="metric-value">{{ account.analytics.engagement }}%</div>
                <div class="metric-label">Engagement</div>
              </div>
              <div class="metric">
                <div class="metric-value">{{ account.analytics.reach }}</div>
                <div class="metric-label">Reach</div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="quick-actions">
            <button class="quick-action create" @click="createPost(account)">
              <i class="mdi mdi-plus"></i>
              Create Post
            </button>
            <button class="quick-action schedule" @click="schedulePost(account)">
              <i class="mdi mdi-calendar"></i>
              Schedule
            </button>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-if="viewMode === 'list'" class="accounts-list">
        <div class="list-header">
          <div class="col-account">Account</div>
          <div class="col-followers">Followers</div>
          <div class="col-engagement">Engagement</div>
          <div class="col-posts">Posts</div>
          <div class="col-status">Status</div>
          <div class="col-actions">Actions</div>
        </div>
        <div class="account-row" v-for="account in accounts" :key="account.id">
          <div class="col-account">
            <div class="account-cell">
              <div class="account-avatar small">
                <img :src="account.profilePicture" :alt="account.username" />
              </div>
              <div class="account-details">
                <div class="username">@{{ account.username }}</div>
                <div class="full-name">{{ account.fullName }}</div>
              </div>
            </div>
          </div>
          <div class="col-followers">
            <div class="follower-info">
              <span class="count">{{ formatNumber(account.followersCount) }}</span>
              <span class="growth" :class="account.followerGrowth > 0 ? 'positive' : 'negative'">
                <i :class="account.followerGrowth > 0 ? 'mdi mdi-trending-up' : 'mdi mdi-trending-down'"></i>
                {{ Math.abs(account.followerGrowth) }}%
              </span>
            </div>
          </div>
          <div class="col-engagement">
            <div class="engagement-meter">
              <div class="meter-track">
                <div class="meter-fill" :style="{ width: account.analytics.engagement + '%' }"></div>
              </div>
              <span class="percentage">{{ account.analytics.engagement }}%</span>
            </div>
          </div>
          <div class="col-posts">
            <div class="posts-info">
              <span class="count">{{ account.analytics.postsThisMonth }}</span>
              <span class="period">this month</span>
            </div>
          </div>
          <div class="col-status">
            <div class="status-badge" :class="account.status">
              <div class="status-dot"></div>
              {{ account.status }}
            </div>
          </div>
          <div class="col-actions">
            <div class="row-actions">
              <button class="row-action" @click="viewAnalytics(account)" title="View Analytics">
                <i class="mdi mdi-chart-line"></i>
              </button>
              <button class="row-action" @click="createPost(account)" title="Create Post">
                <i class="mdi mdi-plus"></i>
              </button>
              <button class="row-action" @click="refreshAccount(account)" title="Refresh">
                <i class="mdi mdi-refresh"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Connect Account Modal -->
    <div v-if="showConnectModal" class="modal-overlay" @click="closeConnectModal">
      <div class="connect-modal" @click.stop>
        <div class="modal-header">
          <h3>Connect Instagram Account</h3>
          <button class="close-btn" @click="closeConnectModal">
            <i class="mdi mdi-close"></i>
          </button>
        </div>
        <div class="modal-content">
          <div class="connect-steps">
            <div class="step" :class="{ active: connectStep === 1, completed: connectStep > 1 }">
              <div class="step-number">1</div>
              <div class="step-content">
                <h4>Authorization</h4>
                <p>Connect your Instagram account securely</p>
              </div>
            </div>
            <div class="step" :class="{ active: connectStep === 2, completed: connectStep > 2 }">
              <div class="step-number">2</div>
              <div class="step-content">
                <h4>Permissions</h4>
                <p>Grant necessary permissions</p>
              </div>
            </div>
            <div class="step" :class="{ active: connectStep === 3 }">
              <div class="step-number">3</div>
              <div class="step-content">
                <h4>Verification</h4>
                <p>Verify and complete setup</p>
              </div>
            </div>
          </div>

          <div class="connect-content">
            <div v-if="connectStep === 1" class="step-1">
              <div class="connect-info">
                <i class="mdi mdi-instagram connect-icon"></i>
                <h4>Connect with Instagram</h4>
                <p>We'll redirect you to Instagram to authorize access to your account. We only request the minimum permissions needed.</p>
                <ul class="permissions-list">
                  <li><i class="mdi mdi-check"></i> Read basic profile information</li>
                  <li><i class="mdi mdi-check"></i> Publish posts and stories</li>
                  <li><i class="mdi mdi-check"></i> Access insights and analytics</li>
                </ul>
              </div>
              <button class="connect-btn" @click="startConnection">
                <i class="mdi mdi-instagram"></i>
                Connect with Instagram
              </button>
            </div>

            <div v-if="connectStep === 2" class="step-2">
              <div class="loading-state">
                <div class="loading-spinner"></div>
                <h4>Connecting...</h4>
                <p>Please complete the authorization on Instagram and return here.</p>
              </div>
            </div>

            <div v-if="connectStep === 3" class="step-3">
              <div class="success-state">
                <i class="mdi mdi-check-circle success-icon"></i>
                <h4>Account Connected!</h4>
                <p>Your Instagram account has been successfully connected.</p>
                <div class="connected-account">
                  <div class="account-preview">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop&crop=face" alt="Profile" />
                    <div class="account-info">
                      <div class="username">@newaccount</div>
                      <div class="followers">25.3K followers</div>
                    </div>
                  </div>
                </div>
              </div>
              <button class="complete-btn" @click="completeConnection">
                Complete Setup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const viewMode = ref('grid')
const activeMenuId = ref(null)
const showConnectModal = ref(false)
const connectStep = ref(1)

const accounts = ref([
  {
    id: 1,
    username: 'sarahlifestyle',
    fullName: 'Sarah Johnson',
    profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    followersCount: 45200,
    followingCount: 1250,
    mediaCount: 342,
    status: 'connected',
    growth: 12.5,
    followerGrowth: 8.2,
    analytics: {
      likes: 12500,
      comments: 890,
      engagement: 4.2,
      reach: '18.5K',
      postsThisMonth: 15
    }
  },
  {
    id: 2,
    username: 'sarahfitness',
    fullName: 'Sarah Fitness',
    profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    followersCount: 32100,
    followingCount: 890,
    mediaCount: 256,
    status: 'connected',
    growth: 18.7,
    followerGrowth: 15.3,
    analytics: {
      likes: 18900,
      comments: 1250,
      engagement: 5.8,
      reach: '24.2K',
      postsThisMonth: 12
    }
  },
  {
    id: 3,
    username: 'sarahtravel',
    fullName: 'Sarah Adventures',
    profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    followersCount: 28900,
    followingCount: 756,
    mediaCount: 198,
    status: 'warning',
    growth: -2.1,
    followerGrowth: -1.8,
    analytics: {
      likes: 8500,
      comments: 420,
      engagement: 3.6,
      reach: '12.8K',
      postsThisMonth: 8
    }
  }
])

const totalFollowers = computed(() => {
  const total = accounts.value.reduce((sum, account) => sum + account.followersCount, 0)
  return formatNumber(total)
})

const totalPosts = computed(() => {
  return accounts.value.reduce((sum, account) => sum + account.analytics.postsThisMonth, 0)
})

const averageEngagement = computed(() => {
  const avg = accounts.value.reduce((sum, account) => sum + account.analytics.engagement, 0) / accounts.value.length
  return avg.toFixed(1)
})

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const toggleAccountMenu = (accountId: number) => {
  activeMenuId.value = activeMenuId.value === accountId ? null : accountId
}

const viewAnalytics = (account: any) => {
  console.log('View analytics for:', account.username)
  activeMenuId.value = null
}

const refreshAccount = (account: any) => {
  console.log('Refresh account:', account.username)
  activeMenuId.value = null
}

const refreshAllAccounts = () => {
  console.log('Refresh all accounts')
}

const disconnectAccount = (account: any) => {
  console.log('Disconnect account:', account.username)
  activeMenuId.value = null
}

const createPost = (account: any) => {
  console.log('Create post for:', account.username)
}

const schedulePost = (account: any) => {
  console.log('Schedule post for:', account.username)
}

const closeConnectModal = () => {
  showConnectModal.value = false
  connectStep.value = 1
}

const startConnection = () => {
  connectStep.value = 2
  // Simulate connection process
  setTimeout(() => {
    connectStep.value = 3
  }, 2000)
}

const completeConnection = () => {
  closeConnectModal()
  // Add new account to the list
}
</script>

<style scoped>
.neumorphism-account-manager {
  background: #E0E5EC;
  min-height: 100vh;
  padding: 20px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Header */
.accounts-header {
  margin-bottom: 30px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #4A5568;
  margin: 0;
  text-shadow: 
    2px 2px 4px rgba(163, 177, 198, 0.3),
    -2px -2px 4px rgba(255, 255, 255, 0.7);
}

.page-subtitle {
  color: #718096;
  margin: 5px 0 0 0;
  font-size: 1.1rem;
}

.header-actions {
  display: flex;
  gap: 15px;
}

.action-btn {
  background: #E0E5EC;
  border: none;
  padding: 12px 20px;
  border-radius: 15px;
  color: #4299E1;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 
    8px 8px 16px rgba(163, 177, 198, 0.6),
    -8px -8px 16px rgba(255, 255, 255, 0.7);
}

.action-btn:hover {
  box-shadow: 
    4px 4px 8px rgba(163, 177, 198, 0.6),
    -4px -4px 8px rgba(255, 255, 255, 0.7);
  transform: translateY(2px);
}

.action-btn.secondary {
  color: #718096;
}

/* Overview Stats */
.overview-stats {
  margin-bottom: 40px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background: #E0E5EC;
  padding: 25px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
  box-shadow: 
    12px 12px 24px rgba(163, 177, 198, 0.6),
    -12px -12px 24px rgba(255, 255, 255, 0.7);
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 
    15px 15px 30px rgba(163, 177, 198, 0.7),
    -15px -15px 30px rgba(255, 255, 255, 0.8);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #E0E5EC;
  box-shadow: 
    inset 8px 8px 16px rgba(163, 177, 198, 0.6),
    inset -8px -8px 16px rgba(255, 255, 255, 0.7);
}

.stat-card.total .stat-icon i { color: #4299E1; }
.stat-card.followers .stat-icon i { color: #48BB78; }
.stat-card.posts .stat-icon i { color: #ED8936; }
.stat-card.engagement .stat-icon i { color: #E53E3E; }

.stat-icon i {
  font-size: 1.5rem;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #4A5568;
  margin-bottom: 5px;
}

.stat-label {
  color: #718096;
  font-size: 0.9rem;
}

/* Accounts Section */
.accounts-section {
  background: #E0E5EC;
  border-radius: 25px;
  padding: 30px;
  box-shadow: 
    15px 15px 30px rgba(163, 177, 198, 0.6),
    -15px -15px 30px rgba(255, 255, 255, 0.7);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #4A5568;
  margin: 0;
}

.view-controls {
  display: flex;
  gap: 8px;
}

.view-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: #E0E5EC;
  color: #718096;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 
    inset 6px 6px 12px rgba(163, 177, 198, 0.6),
    inset -6px -6px 12px rgba(255, 255, 255, 0.7);
}

.view-btn.active {
  color: #4299E1;
  box-shadow: 
    6px 6px 12px rgba(163, 177, 198, 0.6),
    -6px -6px 12px rgba(255, 255, 255, 0.7);
}

/* Grid View */
.accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 25px;
}

.account-card {
  background: #E0E5EC;
  border-radius: 20px;
  padding: 25px;
  transition: all 0.3s ease;
  box-shadow: 
    12px 12px 24px rgba(163, 177, 198, 0.6),
    -12px -12px 24px rgba(255, 255, 255, 0.7);
}

.account-card:hover {
  transform: translateY(-5px);
  box-shadow: 
    15px 15px 30px rgba(163, 177, 198, 0.7),
    -15px -15px 30px rgba(255, 255, 255, 0.8);
}

.account-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
}

.account-avatar {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 
    8px 8px 16px rgba(163, 177, 198, 0.6),
    -8px -8px 16px rgba(255, 255, 255, 0.7);
}

.account-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid #E0E5EC;
}

.status-indicator.connected { background: #48BB78; }
.status-indicator.warning { background: #ED8936; }
.status-indicator.error { background: #F56565; }

.action-menu-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: #E0E5EC;
  color: #718096;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 
    6px 6px 12px rgba(163, 177, 198, 0.6),
    -6px -6px 12px rgba(255, 255, 255, 0.7);
}

.action-menu-btn:hover {
  color: #4A5568;
}

.action-menu {
  position: absolute;
  top: 40px;
  right: 0;
  background: #E0E5EC;
  border-radius: 12px;
  padding: 8px;
  z-index: 10;
  min-width: 150px;
  box-shadow: 
    12px 12px 24px rgba(163, 177, 198, 0.6),
    -12px -12px 24px rgba(255, 255, 255, 0.7);
}

.action-menu button {
  width: 100%;
  background: none;
  border: none;
  padding: 10px 12px;
  border-radius: 8px;
  color: #4A5568;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.action-menu button:hover {
  background: rgba(163, 177, 198, 0.1);
  box-shadow: 
    inset 4px 4px 8px rgba(163, 177, 198, 0.6),
    inset -4px -4px 8px rgba(255, 255, 255, 0.7);
}

.action-menu button.danger {
  color: #F56565;
}

.account-info {
  text-align: center;
  margin-bottom: 25px;
}

.account-username {
  font-size: 1.3rem;
  font-weight: 600;
  color: #4A5568;
  margin: 0 0 5px 0;
}

.account-name {
  color: #718096;
  margin: 0 0 15px 0;
  font-size: 0.95rem;
}

.account-stats {
  display: flex;
  justify-content: space-around;
  gap: 15px;
}

.stat {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.1rem;
  font-weight: 700;
  color: #4A5568;
  margin-bottom: 3px;
}

.stat-label {
  font-size: 0.8rem;
  color: #718096;
}

/* Analytics */
.account-analytics {
  background: #E0E5EC;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 
    inset 8px 8px 16px rgba(163, 177, 198, 0.6),
    inset -8px -8px 16px rgba(255, 255, 255, 0.7);
}

.analytics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.analytics-header h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #4A5568;
  margin: 0;
}

.growth {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  font-weight: 600;
}

.growth.positive { color: #48BB78; }
.growth.negative { color: #F56565; }

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.metric {
  text-align: center;
}

.metric-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #4A5568;
  margin-bottom: 3px;
}

.metric-label {
  font-size: 0.8rem;
  color: #718096;
}

/* Quick Actions */
.quick-actions {
  display: flex;
  gap: 10px;
}

.quick-action {
  flex: 1;
  background: #E0E5EC;
  border: none;
  padding: 12px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  box-shadow: 
    6px 6px 12px rgba(163, 177, 198, 0.6),
    -6px -6px 12px rgba(255, 255, 255, 0.7);
}

.quick-action:hover {
  box-shadow: 
    3px 3px 6px rgba(163, 177, 198, 0.6),
    -3px -3px 6px rgba(255, 255, 255, 0.7);
  transform: translateY(1px);
}

.quick-action.create { color: #48BB78; }
.quick-action.schedule { color: #4299E1; }

/* List View */
.accounts-list {
  background: #E0E5EC;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 
    inset 8px 8px 16px rgba(163, 177, 198, 0.6),
    inset -8px -8px 16px rgba(255, 255, 255, 0.7);
}

.list-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
  gap: 20px;
  padding: 20px;
  background: rgba(163, 177, 198, 0.1);
  font-weight: 600;
  color: #4A5568;
  font-size: 0.9rem;
}

.account-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
  gap: 20px;
  padding: 20px;
  border-bottom: 1px solid rgba(163, 177, 198, 0.2);
  align-items: center;
  transition: all 0.3s ease;
}

.account-row:hover {
  background: rgba(163, 177, 198, 0.05);
}

.account-row:last-child {
  border-bottom: none;
}

.account-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.account-avatar.small {
  width: 40px;
  height: 40px;
}

.account-details .username {
  font-weight: 600;
  color: #4A5568;
  font-size: 0.95rem;
}

.account-details .full-name {
  color: #718096;
  font-size: 0.85rem;
}

.follower-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.follower-info .count {
  font-weight: 600;
  color: #4A5568;
}

.engagement-meter {
  display: flex;
  align-items: center;
  gap: 10px;
}

.meter-track {
  flex: 1;
  height: 6px;
  background: rgba(163, 177, 198, 0.3);
  border-radius: 3px;
  overflow: hidden;
}

.meter-fill {
  height: 100%;
  background: linear-gradient(90deg, #48BB78 0%, #4299E1 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.percentage {
  font-weight: 600;
  color: #4A5568;
  font-size: 0.9rem;
  min-width: 40px;
}

.posts-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.posts-info .count {
  font-weight: 600;
  color: #4A5568;
}

.posts-info .period {
  color: #718096;
  font-size: 0.8rem;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge.connected {
  background: #C6F6D5;
  color: #22543D;
}

.status-badge.warning {
  background: #FEEBC8;
  color: #C05621;
}

.status-badge.error {
  background: #FED7D7;
  color: #C53030;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-badge.connected .status-dot { background: #48BB78; }
.status-badge.warning .status-dot { background: #ED8936; }
.status-badge.error .status-dot { background: #F56565; }

.row-actions {
  display: flex;
  gap: 8px;
}

.row-action {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: #E0E5EC;
  color: #718096;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 
    4px 4px 8px rgba(163, 177, 198, 0.6),
    -4px -4px 8px rgba(255, 255, 255, 0.7);
}

.row-action:hover {
  color: #4299E1;
  box-shadow: 
    2px 2px 4px rgba(163, 177, 198, 0.6),
    -2px -2px 4px rgba(255, 255, 255, 0.7);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(163, 177, 198, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.connect-modal {
  background: #E0E5EC;
  border-radius: 25px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 
    20px 20px 40px rgba(163, 177, 198, 0.7),
    -20px -20px 40px rgba(255, 255, 255, 0.8);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.modal-header h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #4A5568;
  margin: 0;
}

.close-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: #E0E5EC;
  color: #718096;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 
    6px 6px 12px rgba(163, 177, 198, 0.6),
    -6px -6px 12px rgba(255, 255, 255, 0.7);
}

.close-btn:hover {
  color: #F56565;
}

/* Connect Steps */
.connect-steps {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  justify-content: center;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.step.active,
.step.completed {
  opacity: 1;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #E0E5EC;
  color: #718096;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 10px;
  box-shadow: 
    inset 6px 6px 12px rgba(163, 177, 198, 0.6),
    inset -6px -6px 12px rgba(255, 255, 255, 0.7);
}

.step.active .step-number {
  color: #4299E1;
  box-shadow: 
    6px 6px 12px rgba(163, 177, 198, 0.6),
    -6px -6px 12px rgba(255, 255, 255, 0.7);
}

.step.completed .step-number {
  background: #48BB78;
  color: white;
  box-shadow: 
    6px 6px 12px rgba(163, 177, 198, 0.6),
    -6px -6px 12px rgba(255, 255, 255, 0.7);
}

.step-content h4 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #4A5568;
  margin: 0 0 4px 0;
}

.step-content p {
  font-size: 0.8rem;
  color: #718096;
  margin: 0;
}

/* Connect Content */
.connect-content {
  text-align: center;
}

.connect-info {
  margin-bottom: 30px;
}

.connect-icon {
  font-size: 4rem;
  color: #E1306C;
  margin-bottom: 20px;
}

.connect-info h4 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #4A5568;
  margin: 0 0 15px 0;
}

.connect-info p {
  color: #718096;
  line-height: 1.5;
  margin-bottom: 20px;
}

.permissions-list {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
  max-width: 300px;
  margin: 0 auto;
}

.permissions-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  color: #4A5568;
  font-size: 0.9rem;
}

.permissions-list i {
  color: #48BB78;
}

.connect-btn,
.complete-btn {
  background: #E0E5EC;
  border: none;
  padding: 15px 30px;
  border-radius: 15px;
  color: #E1306C;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 0 auto;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 
    10px 10px 20px rgba(163, 177, 198, 0.6),
    -10px -10px 20px rgba(255, 255, 255, 0.7);
}

.connect-btn:hover,
.complete-btn:hover {
  box-shadow: 
    5px 5px 10px rgba(163, 177, 198, 0.6),
    -5px -5px 10px rgba(255, 255, 255, 0.7);
  transform: translateY(2px);
}

.complete-btn {
  color: #48BB78;
}

/* Loading State */
.loading-state {
  padding: 40px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(163, 177, 198, 0.3);
  border-top: 3px solid #4299E1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state h4 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #4A5568;
  margin: 0 0 10px 0;
}

.loading-state p {
  color: #718096;
  margin: 0;
}

/* Success State */
.success-state {
  padding: 20px;
}

.success-icon {
  font-size: 4rem;
  color: #48BB78;
  margin-bottom: 20px;
}

.success-state h4 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #4A5568;
  margin: 0 0 10px 0;
}

.success-state p {
  color: #718096;
  margin: 0 0 25px 0;
}

.connected-account {
  background: #E0E5EC;
  padding: 20px;
  border-radius: 15px;
  margin-bottom: 25px;
  box-shadow: 
    inset 8px 8px 16px rgba(163, 177, 198, 0.6),
    inset -8px -8px 16px rgba(255, 255, 255, 0.7);
}

.account-preview {
  display: flex;
  align-items: center;
  gap: 15px;
}

.account-preview img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.account-preview .username {
  font-weight: 600;
  color: #4A5568;
  margin-bottom: 3px;
}

.account-preview .followers {
  color: #718096;
  font-size: 0.9rem;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
  
  .accounts-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
  
  .list-header,
  .account-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .col-account,
  .col-followers,
  .col-engagement,
  .col-posts,
  .col-status,
  .col-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .col-account::before { content: 'Account:'; }
  .col-followers::before { content: 'Followers:'; }
  .col-engagement::before { content: 'Engagement:'; }
  .col-posts::before { content: 'Posts:'; }
  .col-status::before { content: 'Status:'; }
  .col-actions::before { content: 'Actions:'; }
  
  .list-header div::before {
    content: '';
  }
}

@media (max-width: 768px) {
  .neumorphism-account-manager {
    padding: 15px;
  }
  
  .accounts-section {
    padding: 20px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .accounts-grid {
    grid-template-columns: 1fr;
  }
  
  .analytics-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  
  .connect-steps {
    flex-direction: column;
    gap: 15px;
  }
  
  .step {
    flex-direction: row;
    text-align: left;
  }
  
  .step-number {
    margin-bottom: 0;
    margin-right: 15px;
  }
}
</style>