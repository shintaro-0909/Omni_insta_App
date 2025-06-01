<template>
  <div class="minimalist-dashboard">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <h1 class="page-title">Dashboard</h1>
        <div class="header-actions">
          <button class="icon-button">
            <span class="icon">◔</span>
          </button>
          <button class="icon-button">
            <span class="icon">◉</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Metrics -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-label">Total Posts</div>
        <div class="metric-value">1,234</div>
        <div class="metric-change positive">+12%</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Engagement Rate</div>
        <div class="metric-value">4.8%</div>
        <div class="metric-change positive">+0.3%</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Followers</div>
        <div class="metric-value">45.2K</div>
        <div class="metric-change positive">+523</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Scheduled</div>
        <div class="metric-value">28</div>
        <div class="metric-change neutral">This week</div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="dashboard-grid">
      <!-- Performance Chart -->
      <div class="card chart-card">
        <div class="card-header">
          <h2 class="card-title">Performance Overview</h2>
          <select class="period-select">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
        </div>
        <div class="chart-container">
          <svg viewBox="0 0 600 200" class="line-chart">
            <polyline
              points="0,150 100,120 200,100 300,110 400,80 500,60 600,40"
              fill="none"
              stroke="#000"
              stroke-width="1"
            />
            <polyline
              points="0,150 100,120 200,100 300,110 400,80 500,60 600,40 600,200 0,200"
              fill="rgba(0,0,0,0.05)"
            />
          </svg>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="card activity-card">
        <div class="card-header">
          <h2 class="card-title">Recent Activity</h2>
        </div>
        <div class="activity-list">
          <div class="activity-item">
            <div class="activity-icon">●</div>
            <div class="activity-content">
              <div class="activity-title">Post published</div>
              <div class="activity-time">2 hours ago</div>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-icon">○</div>
            <div class="activity-content">
              <div class="activity-title">Schedule created</div>
              <div class="activity-time">5 hours ago</div>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-icon">◐</div>
            <div class="activity-content">
              <div class="activity-title">Account connected</div>
              <div class="activity-time">1 day ago</div>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-icon">●</div>
            <div class="activity-content">
              <div class="activity-title">Post published</div>
              <div class="activity-time">2 days ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <button class="action-button primary">
        <span class="button-icon">+</span>
        Create Post
      </button>
      <button class="action-button">
        <span class="button-icon">◷</span>
        Schedule
      </button>
      <button class="action-button">
        <span class="button-icon">◉</span>
        Analytics
      </button>
    </div>
  </div>
</template>

<style scoped>
  /* Base */
  .minimalist-dashboard {
    min-height: 100vh;
    background: #fff;
    font-family:
      'Inter',
      -apple-system,
      BlinkMacSystemFont,
      sans-serif;
    padding: 2rem;
    color: #000;
  }

  /* Header */
  .header {
    margin-bottom: 4rem;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .page-title {
    font-size: 2rem;
    font-weight: 300;
    letter-spacing: -0.02em;
  }

  .header-actions {
    display: flex;
    gap: 1rem;
  }

  .icon-button {
    width: 40px;
    height: 40px;
    border: 1px solid #e9ecef;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .icon-button:hover {
    border-color: #000;
  }

  .icon {
    font-size: 1.25rem;
  }

  /* Metrics Grid */
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
    margin-bottom: 4rem;
  }

  .metric-card {
    padding: 2rem;
    border: 1px solid #e9ecef;
    background: #fff;
    transition: all 0.2s ease;
  }

  .metric-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
  }

  .metric-label {
    font-size: 0.875rem;
    color: #666;
    margin-bottom: 1rem;
  }

  .metric-value {
    font-size: 2rem;
    font-weight: 300;
    letter-spacing: -0.02em;
    margin-bottom: 0.5rem;
  }

  .metric-change {
    font-size: 0.875rem;
  }

  .metric-change.positive {
    color: #00a86b;
  }

  .metric-change.neutral {
    color: #666;
  }

  /* Dashboard Grid */
  .dashboard-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
    margin-bottom: 4rem;
  }

  /* Cards */
  .card {
    border: 1px solid #e9ecef;
    background: #fff;
    padding: 2rem;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .card-title {
    font-size: 1.125rem;
    font-weight: 400;
  }

  .period-select {
    padding: 0.5rem 1rem;
    border: 1px solid #e9ecef;
    background: transparent;
    font-size: 0.875rem;
    cursor: pointer;
    transition: border-color 0.2s ease;
  }

  .period-select:hover,
  .period-select:focus {
    border-color: #000;
    outline: none;
  }

  /* Chart */
  .chart-container {
    height: 200px;
  }

  .line-chart {
    width: 100%;
    height: 100%;
  }

  /* Activity */
  .activity-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .activity-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #f8f9fa;
  }

  .activity-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .activity-icon {
    font-size: 1.25rem;
    opacity: 0.8;
  }

  .activity-content {
    flex: 1;
  }

  .activity-title {
    font-size: 0.95rem;
    margin-bottom: 0.25rem;
  }

  .activity-time {
    font-size: 0.875rem;
    color: #666;
  }

  /* Quick Actions */
  .quick-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .action-button {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 2rem;
    border: 1px solid #e9ecef;
    background: transparent;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-button:hover {
    border-color: #000;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .action-button.primary {
    background: #000;
    color: #fff;
    border-color: #000;
  }

  .action-button.primary:hover {
    background: #222;
    border-color: #222;
  }

  .button-icon {
    font-size: 1.25rem;
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .metrics-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .dashboard-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .minimalist-dashboard {
      padding: 1rem;
    }

    .metrics-grid {
      grid-template-columns: 1fr;
    }

    .quick-actions {
      flex-direction: column;
    }

    .action-button {
      width: 100%;
      justify-content: center;
    }
  }
</style>
