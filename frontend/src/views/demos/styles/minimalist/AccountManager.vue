<template>
  <div class="minimalist-accounts">
    <!-- Header -->
    <header class="header">
      <h1 class="page-title">Accounts</h1>
      <button class="add-button">+ Add Account</button>
    </header>

    <!-- Account Grid -->
    <div class="account-grid">
      <div class="account-card" v-for="account in accounts" :key="account.id">
        <div class="account-header">
          <div class="account-avatar">{{ account.avatar }}</div>
          <div class="account-info">
            <div class="account-name">{{ account.username }}</div>
            <div class="account-type">{{ account.type }}</div>
          </div>
          <button class="account-menu">⋯</button>
        </div>

        <div class="account-stats">
          <div class="stat">
            <div class="stat-value">{{ account.followers }}</div>
            <div class="stat-label">Followers</div>
          </div>
          <div class="stat">
            <div class="stat-value">{{ account.posts }}</div>
            <div class="stat-label">Posts</div>
          </div>
          <div class="stat">
            <div class="stat-value">{{ account.engagement }}%</div>
            <div class="stat-label">Engagement</div>
          </div>
        </div>

        <div class="account-chart">
          <svg viewBox="0 0 300 100" class="mini-chart">
            <polyline
              :points="account.chartData"
              fill="none"
              stroke="#000"
              stroke-width="1"
            />
            <polyline
              :points="account.chartData + ' 300,100 0,100'"
              fill="rgba(0,0,0,0.05)"
            />
          </svg>
        </div>

        <div class="account-actions">
          <button class="action-link">View Analytics</button>
          <button class="action-link">Settings</button>
        </div>
      </div>
    </div>

    <!-- Analytics Section -->
    <section class="analytics-section">
      <h2 class="section-title">Performance Overview</h2>
      
      <div class="analytics-grid">
        <!-- Growth Chart -->
        <div class="analytics-card">
          <h3 class="card-title">Follower Growth</h3>
          <div class="chart-container">
            <svg viewBox="0 0 600 200" class="line-chart">
              <polyline
                points="0,180 100,160 200,140 300,130 400,100 500,80 600,60"
                fill="none"
                stroke="#000"
                stroke-width="1"
              />
              <polyline
                points="0,180 100,160 200,140 300,130 400,100 500,80 600,60 600,200 0,200"
                fill="rgba(0,0,0,0.05)"
              />
            </svg>
          </div>
          <div class="chart-legend">
            <span class="legend-item">+12.4% this month</span>
          </div>
        </div>

        <!-- Engagement Stats -->
        <div class="analytics-card">
          <h3 class="card-title">Engagement Metrics</h3>
          <div class="metric-list">
            <div class="metric-item">
              <span class="metric-name">Average Likes</span>
              <span class="metric-value">1,234</span>
            </div>
            <div class="metric-item">
              <span class="metric-name">Average Comments</span>
              <span class="metric-value">89</span>
            </div>
            <div class="metric-item">
              <span class="metric-name">Story Views</span>
              <span class="metric-value">5,678</span>
            </div>
            <div class="metric-item">
              <span class="metric-name">Profile Visits</span>
              <span class="metric-value">12.3K</span>
            </div>
          </div>
        </div>

        <!-- Best Times -->
        <div class="analytics-card">
          <h3 class="card-title">Best Posting Times</h3>
          <div class="time-grid">
            <div class="time-slot active">9 AM</div>
            <div class="time-slot">12 PM</div>
            <div class="time-slot active">6 PM</div>
            <div class="time-slot">9 PM</div>
          </div>
          <p class="card-note">Based on your audience activity</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
const accounts = [
  {
    id: 1,
    username: '@myaccount',
    type: 'Personal',
    avatar: '●',
    followers: '12.3K',
    posts: '234',
    engagement: '4.8',
    chartData: '0,80 50,75 100,70 150,65 200,60 250,55 300,50'
  },
  {
    id: 2,
    username: '@business',
    type: 'Business',
    avatar: '◐',
    followers: '45.6K',
    posts: '567',
    engagement: '6.2',
    chartData: '0,90 50,85 100,80 150,70 200,65 250,60 300,40'
  },
  {
    id: 3,
    username: '@personal',
    type: 'Creator',
    avatar: '○',
    followers: '8.9K',
    posts: '123',
    engagement: '3.5',
    chartData: '0,70 50,72 100,75 150,78 200,75 250,70 300,65'
  }
]
</script>

<style scoped>
/* Base */
.minimalist-accounts {
  min-height: 100vh;
  background: #fff;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  padding: 2rem;
  color: #000;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 300;
  letter-spacing: -0.02em;
}

.add-button {
  padding: 0.75rem 1.5rem;
  border: 1px solid #e9ecef;
  background: transparent;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-button:hover {
  border-color: #000;
  background: #000;
  color: #fff;
}

/* Account Grid */
.account-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-bottom: 6rem;
}

.account-card {
  border: 1px solid #e9ecef;
  padding: 2rem;
  transition: all 0.2s ease;
}

.account-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
}

.account-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.account-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.account-info {
  flex: 1;
}

.account-name {
  font-size: 1.125rem;
  margin-bottom: 0.25rem;
}

.account-type {
  font-size: 0.875rem;
  color: #666;
}

.account-menu {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 1.25rem;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.account-card:hover .account-menu {
  opacity: 1;
}

/* Account Stats */
.account-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #f8f9fa;
}

.stat {
  text-align: center;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 300;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Account Chart */
.account-chart {
  height: 100px;
  margin-bottom: 2rem;
}

.mini-chart {
  width: 100%;
  height: 100%;
}

/* Account Actions */
.account-actions {
  display: flex;
  gap: 2rem;
}

.action-link {
  background: none;
  border: none;
  color: #666;
  font-size: 0.875rem;
  cursor: pointer;
  transition: color 0.2s ease;
}

.action-link:hover {
  color: #000;
}

/* Analytics Section */
.analytics-section {
  border-top: 1px solid #e9ecef;
  padding-top: 4rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 300;
  margin-bottom: 3rem;
}

.analytics-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 2rem;
}

.analytics-card {
  border: 1px solid #e9ecef;
  padding: 2rem;
}

.card-title {
  font-size: 1rem;
  font-weight: 400;
  margin-bottom: 2rem;
}

/* Chart */
.chart-container {
  height: 200px;
  margin-bottom: 1rem;
}

.line-chart {
  width: 100%;
  height: 100%;
}

.chart-legend {
  font-size: 0.875rem;
  color: #666;
}

.legend-item {
  color: #00a86b;
}

/* Metrics */
.metric-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #f8f9fa;
}

.metric-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.metric-name {
  font-size: 0.875rem;
  color: #666;
}

.metric-value {
  font-size: 1.125rem;
  font-weight: 300;
}

/* Time Grid */
.time-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.time-slot {
  padding: 1rem;
  border: 1px solid #e9ecef;
  text-align: center;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.time-slot.active {
  background: #000;
  color: #fff;
  border-color: #000;
}

.card-note {
  font-size: 0.875rem;
  color: #666;
  text-align: center;
}

/* Responsive */
@media (max-width: 1024px) {
  .account-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .analytics-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .minimalist-accounts {
    padding: 1rem;
  }

  .account-grid {
    grid-template-columns: 1fr;
  }

  .account-stats {
    grid-template-columns: repeat(3, 1fr);
    font-size: 0.875rem;
  }
}
</style>