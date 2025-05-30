<template>
  <div class="retro-accounts">
    <!-- Background -->
    <div class="outrun-bg">
      <div class="neon-grid"></div>
      <div class="laser-beams"></div>
      <div class="digital-rain"></div>
    </div>

    <!-- Header -->
    <header class="accounts-header">
      <h1 class="header-title">
        <span class="title-start">◄</span>
        ACCOUNT MATRIX
        <span class="title-end">►</span>
      </h1>
      <div class="header-stats">
        <div class="stat-item">
          <span class="stat-value">{{ totalAccounts }}</span>
          <span class="stat-label">CONNECTIONS</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ activeAccounts }}</span>
          <span class="stat-label">ONLINE</span>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="accounts-main">
      <!-- Account Cards Grid -->
      <section class="accounts-grid">
        <div 
          class="account-card" 
          v-for="account in accounts" 
          :key="account.id"
          :class="{ 'is-active': account.isActive }"
        >
          <!-- Card Header -->
          <div class="card-header">
            <div class="account-avatar">
              <img :src="account.avatar" :alt="account.username">
              <div class="avatar-ring"></div>
              <div class="status-indicator" :class="account.status"></div>
            </div>
            <div class="account-info">
              <h3 class="account-username">@{{ account.username }}</h3>
              <p class="account-type">{{ account.type }}</p>
            </div>
            <div class="card-menu">
              <button class="menu-btn">⋮</button>
            </div>
          </div>

          <!-- Analytics Display -->
          <div class="analytics-section">
            <div class="metric-display">
              <div class="metric-item">
                <span class="metric-number">{{ formatNumber(account.followers) }}</span>
                <span class="metric-label">FOLLOWERS</span>
              </div>
              <div class="metric-item">
                <span class="metric-number">{{ formatNumber(account.engagement) }}%</span>
                <span class="metric-label">ENGAGEMENT</span>
              </div>
              <div class="metric-item">
                <span class="metric-number">{{ account.posts }}</span>
                <span class="metric-label">POSTS</span>
              </div>
            </div>

            <!-- Neon Chart -->
            <div class="neon-chart">
              <svg viewBox="0 0 200 100">
                <defs>
                  <linearGradient :id="`gradient-${account.id}`" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" :style="`stop-color:#ff006e;stop-opacity:1`" />
                    <stop offset="100%" :style="`stop-color:#3a86ff;stop-opacity:1`" />
                  </linearGradient>
                </defs>
                <polyline
                  :points="account.chartData"
                  fill="none"
                  :stroke="`url(#gradient-${account.id})`"
                  stroke-width="3"
                />
                <polyline
                  :points="account.chartData"
                  fill="none"
                  :stroke="`url(#gradient-${account.id})`"
                  stroke-width="3"
                  opacity="0.3"
                  filter="blur(5px)"
                />
              </svg>
              <div class="chart-grid"></div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="card-actions">
            <button class="action-btn view-profile">
              <span class="btn-icon">👁</span>
              <span class="btn-text">VIEW</span>
            </button>
            <button class="action-btn edit-account">
              <span class="btn-icon">✏️</span>
              <span class="btn-text">EDIT</span>
            </button>
            <button class="action-btn sync-account">
              <span class="btn-icon">🔄</span>
              <span class="btn-text">SYNC</span>
              <div class="sync-pulse"></div>
            </button>
          </div>

          <!-- Card Effects -->
          <div class="card-scanline"></div>
          <div class="card-glow"></div>
        </div>

        <!-- Add Account Card -->
        <div class="account-card add-card" @click="showAddModal = true">
          <div class="add-content">
            <div class="add-icon">+</div>
            <h3>ADD NEW ACCOUNT</h3>
            <p>Connect another profile</p>
          </div>
          <div class="add-rings">
            <div class="ring ring-1"></div>
            <div class="ring ring-2"></div>
            <div class="ring ring-3"></div>
          </div>
        </div>
      </section>

      <!-- Data View Section -->
      <section class="data-view">
        <h2 class="section-title">PERFORMANCE MATRIX</h2>
        
        <div class="data-grid">
          <!-- Performance Metrics -->
          <div class="data-card">
            <h3>GLOBAL METRICS</h3>
            <div class="global-stats">
              <div class="stat-row">
                <span class="stat-name">Total Reach</span>
                <span class="stat-value">2.8M</span>
                <div class="stat-bar">
                  <div class="bar-fill" style="width: 85%"></div>
                </div>
              </div>
              <div class="stat-row">
                <span class="stat-name">Avg Engagement</span>
                <span class="stat-value">4.2%</span>
                <div class="stat-bar">
                  <div class="bar-fill" style="width: 42%"></div>
                </div>
              </div>
              <div class="stat-row">
                <span class="stat-name">Growth Rate</span>
                <span class="stat-value">+23%</span>
                <div class="stat-bar">
                  <div class="bar-fill positive" style="width: 23%"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Activity Timeline -->
          <div class="data-card">
            <h3>ACTIVITY TIMELINE</h3>
            <div class="activity-timeline">
              <div class="timeline-item" v-for="activity in recentActivity" :key="activity.id">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                  <span class="activity-time">{{ activity.time }}</span>
                  <span class="activity-text">{{ activity.text }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Top Posts -->
          <div class="data-card">
            <h3>TOP TRANSMISSIONS</h3>
            <div class="top-posts">
              <div class="post-item" v-for="post in topPosts" :key="post.id">
                <div class="post-rank">#{{ post.rank }}</div>
                <div class="post-preview">
                  <img :src="post.thumbnail" :alt="post.caption">
                </div>
                <div class="post-stats">
                  <span class="post-metric">{{ formatNumber(post.likes) }} ❤️</span>
                  <span class="post-metric">{{ formatNumber(post.comments) }} 💬</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Add Account Modal -->
    <transition name="modal">
      <div class="retro-modal" v-if="showAddModal">
        <div class="modal-backdrop" @click="showAddModal = false"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h3>ESTABLISH NEW CONNECTION</h3>
            <button class="close-modal" @click="showAddModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="connection-steps">
              <div class="step" :class="{ active: currentStep === 1 }">
                <span class="step-number">01</span>
                <span class="step-label">AUTHENTICATE</span>
              </div>
              <div class="step" :class="{ active: currentStep === 2 }">
                <span class="step-number">02</span>
                <span class="step-label">AUTHORIZE</span>
              </div>
              <div class="step" :class="{ active: currentStep === 3 }">
                <span class="step-number">03</span>
                <span class="step-label">SYNCHRONIZE</span>
              </div>
            </div>
            
            <div class="form-section">
              <input 
                type="text" 
                class="retro-input" 
                placeholder="Enter Instagram username..."
                v-model="newUsername"
              >
              <button class="connect-btn">
                <span>INITIATE CONNECTION</span>
                <div class="btn-energy"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Data
const showAddModal = ref(false)
const currentStep = ref(1)
const newUsername = ref('')

const accounts = ref([
  {
    id: 1,
    username: 'neon_dreams',
    type: 'BUSINESS',
    avatar: 'https://i.pravatar.cc/150?img=1',
    isActive: true,
    status: 'online',
    followers: 125600,
    engagement: 4.8,
    posts: 892,
    chartData: '0,60 40,45 80,55 120,40 160,65 200,50'
  },
  {
    id: 2,
    username: 'cyber_aesthetic',
    type: 'CREATOR',
    avatar: 'https://i.pravatar.cc/150?img=2',
    isActive: true,
    status: 'online',
    followers: 89400,
    engagement: 6.2,
    posts: 634,
    chartData: '0,40 40,60 80,50 120,70 160,55 200,75'
  },
  {
    id: 3,
    username: 'retro_vibes',
    type: 'PERSONAL',
    avatar: 'https://i.pravatar.cc/150?img=3',
    isActive: false,
    status: 'offline',
    followers: 45200,
    engagement: 3.9,
    posts: 458,
    chartData: '0,50 40,40 80,45 120,35 160,40 200,38'
  }
])

const recentActivity = ref([
  { id: 1, time: '23:45', text: 'Post published on @neon_dreams' },
  { id: 2, time: '22:30', text: 'Story uploaded to @cyber_aesthetic' },
  { id: 3, time: '21:15', text: 'New follower milestone: 125K' },
  { id: 4, time: '20:00', text: 'Engagement spike detected' }
])

const topPosts = ref([
  { id: 1, rank: 1, thumbnail: 'https://picsum.photos/100/100?random=1', likes: 15600, comments: 342 },
  { id: 2, rank: 2, thumbnail: 'https://picsum.photos/100/100?random=2', likes: 12300, comments: 256 },
  { id: 3, rank: 3, thumbnail: 'https://picsum.photos/100/100?random=3', likes: 10800, comments: 198 }
])

// Computed
const totalAccounts = computed(() => accounts.value.length)
const activeAccounts = computed(() => accounts.value.filter(a => a.isActive).length)

// Methods
const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');

/* Base */
.retro-accounts {
  position: relative;
  min-height: 100vh;
  background: #0a0a0f;
  color: #fff;
  font-family: 'Share Tech Mono', monospace;
  overflow-x: hidden;
}

/* Outrun Background */
.outrun-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
}

.neon-grid {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(255, 0, 110, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 0, 110, 0.1) 1px, transparent 1px);
  background-size: 100px 100px;
  animation: grid-move 20s linear infinite;
}

.laser-beams {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.laser-beams::before,
.laser-beams::after {
  content: '';
  position: absolute;
  left: -100%;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #ff006e, transparent);
  animation: laser-scan 4s linear infinite;
}

.laser-beams::after {
  top: 60%;
  animation-delay: 2s;
  background: linear-gradient(90deg, transparent, #3a86ff, transparent);
}

.digital-rain {
  position: absolute;
  inset: 0;
  background-image: 
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(138, 43, 226, 0.05) 2px,
      rgba(138, 43, 226, 0.05) 4px
    );
  animation: rain-fall 1s linear infinite;
}

/* Header */
.accounts-header {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  background: rgba(10, 10, 15, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 2px solid rgba(255, 0, 110, 0.3);
  z-index: 10;
}

.header-title {
  font-family: 'Orbitron', monospace;
  font-size: 2.5rem;
  font-weight: 900;
  color: #ff006e;
  text-shadow: 
    0 0 20px currentColor,
    0 0 40px currentColor;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title-start,
.title-end {
  color: #3a86ff;
  font-size: 1.5rem;
  animation: pulse-icon 2s ease-in-out infinite;
}

.header-stats {
  display: flex;
  gap: 3rem;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-family: 'Orbitron', monospace;
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(45deg, #ff006e, #8338ec);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-label {
  font-size: 0.8rem;
  color: #8338ec;
  letter-spacing: 0.2em;
}

/* Main Content */
.accounts-main {
  position: relative;
  padding: 2rem;
  z-index: 1;
}

/* Accounts Grid */
.accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.account-card {
  position: relative;
  background: linear-gradient(135deg, rgba(26, 0, 51, 0.8), rgba(51, 0, 102, 0.8));
  border: 2px solid rgba(138, 43, 226, 0.5);
  padding: 2rem;
  overflow: hidden;
  transition: all 0.3s ease;
}

.account-card:hover {
  transform: translateY(-10px) scale(1.02);
  border-color: #ff006e;
  box-shadow: 
    0 20px 40px rgba(255, 0, 110, 0.3),
    inset 0 0 60px rgba(138, 43, 226, 0.1);
}

.account-card.is-active {
  border-color: #3a86ff;
  background: linear-gradient(135deg, rgba(26, 0, 51, 0.9), rgba(58, 134, 255, 0.2));
}

/* Card Header */
.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
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
  object-fit: cover;
}

.avatar-ring {
  position: absolute;
  inset: -3px;
  border: 2px solid #ff006e;
  border-radius: 50%;
  animation: rotate-ring 3s linear infinite;
}

.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #0a0a0f;
}

.status-indicator.online {
  background: #3a86ff;
  box-shadow: 0 0 10px #3a86ff;
}

.status-indicator.offline {
  background: #666;
}

.account-info {
  flex: 1;
}

.account-username {
  font-family: 'Orbitron', monospace;
  font-size: 1.2rem;
  color: #ff006e;
  margin-bottom: 0.2rem;
}

.account-type {
  font-size: 0.8rem;
  color: #8338ec;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.menu-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 1.2rem;
  width: 32px;
  height: 32px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.menu-btn:hover {
  border-color: #ff006e;
  color: #ff006e;
  transform: rotate(90deg);
}

/* Analytics Section */
.analytics-section {
  margin-bottom: 2rem;
}

.metric-display {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.metric-item {
  text-align: center;
}

.metric-number {
  display: block;
  font-family: 'Orbitron', monospace;
  font-size: 1.5rem;
  font-weight: 700;
  color: #3a86ff;
  text-shadow: 0 0 10px currentColor;
}

.metric-label {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* Neon Chart */
.neon-chart {
  position: relative;
  height: 100px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(138, 43, 226, 0.3);
  overflow: hidden;
}

.neon-chart svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.chart-grid {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(138, 43, 226, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(138, 43, 226, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* Action Buttons */
.card-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.action-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.8rem;
  background: rgba(26, 0, 51, 0.6);
  border: 1px solid rgba(255, 0, 110, 0.3);
  color: #ff006e;
  font-size: 0.8rem;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(255, 0, 110, 0.2);
  border-color: #ff006e;
  transform: scale(1.05);
}

.btn-icon {
  font-size: 1rem;
}

.sync-pulse {
  position: absolute;
  inset: -50%;
  background: radial-gradient(circle, rgba(58, 134, 255, 0.4), transparent);
  animation: pulse-sync 2s ease-out infinite;
}

/* Card Effects */
.card-scanline {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #ff006e, transparent);
  opacity: 0;
  animation: scanline-pass 3s linear infinite;
}

.account-card:hover .card-scanline {
  opacity: 1;
}

.card-glow {
  position: absolute;
  inset: -50%;
  background: radial-gradient(circle, rgba(255, 0, 110, 0.2), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.account-card:hover .card-glow {
  opacity: 1;
}

/* Add Account Card */
.add-card {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: rgba(26, 0, 51, 0.4);
  border-style: dashed;
}

.add-card:hover {
  background: rgba(26, 0, 51, 0.6);
}

.add-content {
  text-align: center;
  z-index: 1;
}

.add-icon {
  font-size: 3rem;
  color: #8338ec;
  margin-bottom: 1rem;
  animation: pulse-add 2s ease-in-out infinite;
}

.add-content h3 {
  font-family: 'Orbitron', monospace;
  color: #ff006e;
  margin-bottom: 0.5rem;
}

.add-content p {
  color: rgba(255, 255, 255, 0.6);
}

.add-rings {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.ring {
  position: absolute;
  border: 2px solid rgba(138, 43, 226, 0.3);
  border-radius: 50%;
  animation: ring-expand 3s ease-out infinite;
}

.ring-1 {
  width: 100px;
  height: 100px;
  animation-delay: 0s;
}

.ring-2 {
  width: 150px;
  height: 150px;
  animation-delay: 1s;
}

.ring-3 {
  width: 200px;
  height: 200px;
  animation-delay: 2s;
}

/* Data View Section */
.data-view {
  margin-top: 4rem;
}

.section-title {
  font-family: 'Orbitron', monospace;
  font-size: 2rem;
  color: #8338ec;
  text-shadow: 0 0 20px currentColor;
  margin-bottom: 2rem;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.data-card {
  background: rgba(26, 0, 51, 0.6);
  border: 1px solid rgba(138, 43, 226, 0.5);
  padding: 2rem;
}

.data-card h3 {
  font-family: 'Orbitron', monospace;
  color: #ff006e;
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
}

/* Global Stats */
.stat-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
}

.stat-name {
  color: rgba(255, 255, 255, 0.8);
}

.stat-value {
  font-family: 'Orbitron', monospace;
  color: #3a86ff;
  font-weight: 700;
}

.stat-bar {
  grid-column: 1 / -1;
  height: 6px;
  background: rgba(0, 0, 0, 0.4);
  overflow: hidden;
  margin-top: 0.5rem;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff006e, #8338ec);
  box-shadow: 0 0 10px currentColor;
  animation: bar-glow 2s ease-in-out infinite;
}

.bar-fill.positive {
  background: linear-gradient(90deg, #3a86ff, #00ff88);
}

/* Activity Timeline */
.activity-timeline {
  position: relative;
  padding-left: 2rem;
}

.timeline-item {
  position: relative;
  padding-bottom: 1.5rem;
}

.timeline-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: -1.5rem;
  top: 12px;
  bottom: 0;
  width: 1px;
  background: rgba(138, 43, 226, 0.3);
}

.timeline-marker {
  position: absolute;
  left: -1.75rem;
  top: 4px;
  width: 8px;
  height: 8px;
  background: #ff006e;
  border-radius: 50%;
  box-shadow: 0 0 10px currentColor;
}

.timeline-content {
  display: flex;
  gap: 1rem;
}

.activity-time {
  color: #ffbe0b;
  font-size: 0.8rem;
  min-width: 50px;
}

.activity-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

/* Top Posts */
.top-posts {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-item {
  display: grid;
  grid-template-columns: auto 80px 1fr;
  gap: 1rem;
  align-items: center;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.post-item:hover {
  background: rgba(255, 0, 110, 0.1);
  transform: translateX(5px);
}

.post-rank {
  font-family: 'Orbitron', monospace;
  font-size: 1.2rem;
  color: #ffbe0b;
  font-weight: 700;
}

.post-preview img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border: 1px solid rgba(255, 0, 110, 0.5);
}

.post-stats {
  display: flex;
  gap: 1rem;
}

.post-metric {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

/* Modal */
.retro-modal {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 600px;
  background: linear-gradient(135deg, #1a0033, #0a0a0f);
  border: 2px solid #ff006e;
  box-shadow: 
    0 0 60px rgba(255, 0, 110, 0.5),
    inset 0 0 60px rgba(138, 43, 226, 0.1);
  animation: modal-appear 0.3s ease-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 1px solid rgba(255, 0, 110, 0.3);
}

.modal-header h3 {
  font-family: 'Orbitron', monospace;
  font-size: 1.5rem;
  color: #ff006e;
  text-shadow: 0 0 20px currentColor;
}

.close-modal {
  background: transparent;
  border: 1px solid #ff006e;
  color: #ff006e;
  font-size: 1.2rem;
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-modal:hover {
  background: rgba(255, 0, 110, 0.2);
  transform: rotate(90deg);
}

.modal-body {
  padding: 2rem;
}

.connection-steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: 3rem;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.step.active {
  opacity: 1;
}

.step-number {
  font-family: 'Orbitron', monospace;
  font-size: 1.5rem;
  color: #3a86ff;
  text-shadow: 0 0 10px currentColor;
}

.step-label {
  font-size: 0.8rem;
  color: #8338ec;
  letter-spacing: 0.1em;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.retro-input {
  padding: 1rem 1.5rem;
  background: rgba(26, 0, 51, 0.4);
  border: 1px solid rgba(138, 43, 226, 0.5);
  color: #fff;
  font-family: 'Share Tech Mono', monospace;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.retro-input:focus {
  outline: none;
  border-color: #ff006e;
  background: rgba(26, 0, 51, 0.6);
  box-shadow: 0 0 30px rgba(255, 0, 110, 0.3);
}

.connect-btn {
  position: relative;
  padding: 1.5rem;
  background: transparent;
  border: 2px solid #ff006e;
  color: #ff006e;
  font-family: 'Orbitron', monospace;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
}

.connect-btn:hover {
  background: rgba(255, 0, 110, 0.1);
  transform: scale(1.02);
  box-shadow: 0 0 40px rgba(255, 0, 110, 0.5);
}

.btn-energy {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 0, 110, 0.5), transparent);
  transform: translateX(-100%);
  animation: energy-flow 2s linear infinite;
}

/* Animations */
@keyframes grid-move {
  0% { transform: translate(0, 0); }
  100% { transform: translate(100px, 100px); }
}

@keyframes laser-scan {
  0% { left: -100%; }
  100% { left: 100%; }
}

@keyframes rain-fall {
  0% { transform: translateY(0); }
  100% { transform: translateY(4px); }
}

@keyframes pulse-icon {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.9); }
}

@keyframes rotate-ring {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse-sync {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

@keyframes scanline-pass {
  0% { top: -2px; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}

@keyframes pulse-add {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes ring-expand {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

@keyframes bar-glow {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.2); }
}

@keyframes modal-appear {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes energy-flow {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .accounts-header {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }
  
  .header-title {
    font-size: 1.8rem;
  }
  
  .accounts-grid {
    grid-template-columns: 1fr;
  }
  
  .data-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-row {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .connection-steps {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>