<template>
  <div class="stylish-dashboard">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="dashboard-title">Command Center</h1>
          <p class="dashboard-subtitle">Your digital empire at a glance</p>
        </div>
        <div class="header-right">
          <div class="header-actions">
            <button class="btn-icon">
              <span class="icon">⚙</span>
            </button>
            <button class="btn-icon">
              <span class="icon">📊</span>
            </button>
            <div class="user-avatar">
              <span>JD</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Stats Overview -->
    <section class="stats-overview">
      <div class="stats-grid">
        <div
          v-for="(stat, index) in overviewStats"
          :key="index"
          class="stat-card"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="stat-header">
            <div class="stat-icon" :class="stat.iconClass">
              <span>{{ stat.icon }}</span>
            </div>
            <div class="stat-trend" :class="stat.trend">
              {{ stat.trendValue }}
            </div>
          </div>
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-bar">
            <div
              class="stat-progress"
              :style="{ width: stat.progress + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <div class="dashboard-content">
      <!-- Analytics Chart -->
      <section class="chart-section">
        <div class="section-card">
          <div class="card-header">
            <h2 class="card-title">Performance Analytics</h2>
            <div class="card-actions">
              <select class="select-elegant">
                <option>Last 30 days</option>
                <option>Last 3 months</option>
                <option>Last year</option>
              </select>
            </div>
          </div>
          <div class="chart-container">
            <canvas ref="chartCanvas" class="analytics-chart"></canvas>
          </div>
        </div>
      </section>

      <!-- Content Grid -->
      <div class="content-grid">
        <!-- Recent Posts -->
        <section class="recent-posts">
          <div class="section-card">
            <div class="card-header">
              <h2 class="card-title">Latest Content</h2>
              <button class="btn-text">View All</button>
            </div>
            <div class="posts-list">
              <div
                v-for="(post, index) in recentPosts"
                :key="index"
                class="post-item"
              >
                <div class="post-media">
                  <div
                    class="media-placeholder"
                    :style="{ background: post.color }"
                  >
                    <span class="media-icon">📸</span>
                  </div>
                </div>
                <div class="post-details">
                  <h3 class="post-title">{{ post.title }}</h3>
                  <p class="post-status" :class="post.status">
                    {{ post.statusText }}
                  </p>
                  <div class="post-metrics">
                    <span class="metric">👤 {{ post.likes }}</span>
                    <span class="metric">💬 {{ post.comments }}</span>
                    <span class="metric">📤 {{ post.shares }}</span>
                  </div>
                </div>
                <div class="post-actions">
                  <button class="btn-icon-small">⋯</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Schedule Overview -->
        <section class="schedule-overview">
          <div class="section-card">
            <div class="card-header">
              <h2 class="card-title">Upcoming Schedule</h2>
              <button class="btn-text">Manage</button>
            </div>
            <div class="schedule-timeline">
              <div
                v-for="(item, index) in scheduleItems"
                :key="index"
                class="timeline-item"
              >
                <div class="timeline-time">{{ item.time }}</div>
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <h4 class="timeline-title">{{ item.title }}</h4>
                  <p class="timeline-desc">{{ item.description }}</p>
                  <div class="timeline-tags">
                    <span v-for="tag in item.tags" :key="tag" class="tag">
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Quick Actions -->
        <section class="quick-actions">
          <div class="section-card">
            <div class="card-header">
              <h2 class="card-title">Quick Actions</h2>
            </div>
            <div class="actions-grid">
              <button
                v-for="(action, index) in quickActions"
                :key="index"
                class="action-button"
                :class="action.class"
              >
                <div class="action-icon">{{ action.icon }}</div>
                <div class="action-label">{{ action.label }}</div>
              </button>
            </div>
          </div>
        </section>

        <!-- Account Status -->
        <section class="account-status">
          <div class="section-card">
            <div class="card-header">
              <h2 class="card-title">Account Health</h2>
              <div class="health-indicator excellent">Excellent</div>
            </div>
            <div class="account-list">
              <div
                v-for="(account, index) in accounts"
                :key="index"
                class="account-item"
              >
                <div class="account-avatar">
                  <img :src="account.avatar" :alt="account.name" />
                </div>
                <div class="account-details">
                  <h4 class="account-name">{{ account.name }}</h4>
                  <p class="account-handle">{{ account.handle }}</p>
                </div>
                <div class="account-metrics">
                  <div class="metric-item">
                    <span class="metric-value">{{ account.followers }}</span>
                    <span class="metric-label">Followers</span>
                  </div>
                  <div class="metric-item">
                    <span class="metric-value">{{ account.engagement }}</span>
                    <span class="metric-label">Engagement</span>
                  </div>
                </div>
                <div class="account-status" :class="account.status">
                  {{ account.statusText }}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, nextTick } from 'vue';

  const chartCanvas = ref<HTMLCanvasElement>();

  const overviewStats = [
    {
      icon: '📈',
      iconClass: 'growth',
      value: '847%',
      label: 'Growth Rate',
      trend: 'positive',
      trendValue: '+12%',
      progress: 85,
    },
    {
      icon: '👥',
      iconClass: 'followers',
      value: '2.3M',
      label: 'Total Reach',
      trend: 'positive',
      trendValue: '+8%',
      progress: 72,
    },
    {
      icon: '💬',
      iconClass: 'engagement',
      value: '94.2%',
      label: 'Engagement',
      trend: 'positive',
      trendValue: '+15%',
      progress: 94,
    },
    {
      icon: '⏰',
      iconClass: 'scheduled',
      value: '24',
      label: 'Scheduled Posts',
      trend: 'neutral',
      trendValue: '0%',
      progress: 60,
    },
  ];

  const recentPosts = [
    {
      title: 'Brand Campaign Launch',
      status: 'published',
      statusText: 'Published',
      likes: '12.4K',
      comments: '856',
      shares: '423',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      title: 'Behind the Scenes',
      status: 'scheduled',
      statusText: 'Scheduled',
      likes: '8.2K',
      comments: '342',
      shares: '156',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      title: 'Product Showcase',
      status: 'draft',
      statusText: 'Draft',
      likes: '—',
      comments: '—',
      shares: '—',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
  ];

  const scheduleItems = [
    {
      time: '14:30',
      title: 'Product Launch Post',
      description: 'Announce the new collection',
      tags: ['Product', 'Launch'],
    },
    {
      time: '18:00',
      title: 'Story Update',
      description: 'Behind the scenes content',
      tags: ['Story', 'BTS'],
    },
    {
      time: '20:15',
      title: 'Engagement Post',
      description: 'Community interaction',
      tags: ['Community', 'Q&A'],
    },
  ];

  const quickActions = [
    { icon: '✍️', label: 'Create Post', class: 'primary' },
    { icon: '📅', label: 'Schedule', class: 'secondary' },
    { icon: '📊', label: 'Analytics', class: 'secondary' },
    { icon: '⚙️', label: 'Settings', class: 'secondary' },
  ];

  const accounts = [
    {
      name: 'Main Brand',
      handle: '@company_official',
      avatar:
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM3ODc3QzYiLz4KPHRleHQgeD0iMjAiIHk9IjI2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiPk08L3RleHQ+Cjwvc3ZnPgo=',
      followers: '1.2M',
      engagement: '8.4%',
      status: 'active',
      statusText: 'Active',
    },
    {
      name: 'Creative Studio',
      handle: '@creative_studio',
      avatar:
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNDNkE2RjciLz4KPHRleHQgeD0iMjAiIHk9IjI2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiPkM8L3RleHQ+Cjwvc3ZnPgo=',
      followers: '856K',
      engagement: '12.1%',
      status: 'active',
      statusText: 'Active',
    },
  ];

  onMounted(async () => {
    await nextTick();
    if (chartCanvas.value) {
      drawChart();
    }
  });

  const drawChart = () => {
    const canvas = chartCanvas.value;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    // Chart data
    const data = [65, 78, 85, 92, 88, 95, 102, 98, 105, 112, 118, 125];
    const max = Math.max(...data);
    const min = Math.min(...data);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(120, 119, 198, 0.3)');
    gradient.addColorStop(1, 'rgba(120, 119, 198, 0.05)');

    // Draw area
    ctx.beginPath();
    ctx.moveTo(40, height - 40);

    data.forEach((value, index) => {
      const x = 40 + index * ((width - 80) / (data.length - 1));
      const y = height - 40 - ((value - min) / (max - min)) * (height - 80);

      if (index === 0) {
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.lineTo(width - 40, height - 40);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = '#7877C6';
    ctx.lineWidth = 2;

    data.forEach((value, index) => {
      const x = 40 + index * ((width - 80) / (data.length - 1));
      const y = height - 40 - ((value - min) / (max - min)) * (height - 80);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw points
    data.forEach((value, index) => {
      const x = 40 + index * ((width - 80) / (data.length - 1));
      const y = height - 40 - ((value - min) / (max - min)) * (height - 80);

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#7877C6';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  };
</script>

<style scoped>
  .stylish-dashboard {
    background: #000;
    color: #fff;
    font-family:
      'Inter',
      -apple-system,
      BlinkMacSystemFont,
      sans-serif;
    min-height: 100vh;
    padding: 2rem;
  }

  /* Header */
  .dashboard-header {
    margin-bottom: 3rem;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 2rem;
    border-bottom: 1px solid #222;
  }

  .dashboard-title {
    font-size: 2.5rem;
    font-weight: 200;
    margin-bottom: 0.5rem;
    letter-spacing: -0.02em;
  }

  .dashboard-subtitle {
    color: #888;
    font-size: 1.125rem;
    font-weight: 300;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .btn-icon {
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #333;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .btn-icon:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: #555;
    transform: translateY(-2px);
  }

  .user-avatar {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #7877c6 0%, #c6a6f7 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    letter-spacing: 0.025em;
  }

  /* Stats Overview */
  .stats-overview {
    margin-bottom: 3rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
  }

  .stat-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid #222;
    padding: 2rem;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .stat-card:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: #333;
    transform: translateY(-5px);
  }

  .stat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    background: rgba(120, 119, 198, 0.2);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
  }

  .stat-trend {
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
  }

  .stat-trend.positive {
    background: rgba(46, 160, 67, 0.2);
    color: #4ade80;
  }

  .stat-trend.neutral {
    background: rgba(156, 163, 175, 0.2);
    color: #9ca3af;
  }

  .stat-value {
    font-size: 2.5rem;
    font-weight: 200;
    margin-bottom: 0.5rem;
    letter-spacing: -0.02em;
  }

  .stat-label {
    color: #888;
    font-size: 1rem;
    margin-bottom: 1rem;
    font-weight: 300;
  }

  .stat-bar {
    width: 100%;
    height: 4px;
    background: #222;
    border-radius: 2px;
    overflow: hidden;
  }

  .stat-progress {
    height: 100%;
    background: linear-gradient(90deg, #7877c6 0%, #c6a6f7 100%);
    transition: width 1s cubic-bezier(0.16, 1, 0.3, 1);
  }

  /* Dashboard Content */
  .dashboard-content {
    display: grid;
    gap: 2rem;
  }

  .section-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid #222;
    padding: 2rem;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .section-card:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: #333;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #222;
  }

  .card-title {
    font-size: 1.5rem;
    font-weight: 400;
    letter-spacing: -0.01em;
  }

  .btn-text {
    background: none;
    border: none;
    color: #7877c6;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: color 0.3s ease;
  }

  .btn-text:hover {
    color: #c6a6f7;
  }

  .select-elegant {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #333;
    color: #fff;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-size: 0.875rem;
    cursor: pointer;
  }

  /* Chart Section */
  .chart-container {
    height: 300px;
    position: relative;
  }

  .analytics-chart {
    width: 100%;
    height: 100%;
  }

  /* Content Grid */
  .content-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 2rem;
  }

  /* Recent Posts */
  .posts-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .post-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid #222;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .post-item:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: #333;
    transform: translateX(5px);
  }

  .post-media {
    flex-shrink: 0;
  }

  .media-placeholder {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
  }

  .post-details {
    flex: 1;
  }

  .post-title {
    font-size: 1rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  .post-status {
    font-size: 0.875rem;
    margin-bottom: 0.75rem;
    font-weight: 500;
  }

  .post-status.published {
    color: #4ade80;
  }

  .post-status.scheduled {
    color: #fbbf24;
  }

  .post-status.draft {
    color: #9ca3af;
  }

  .post-metrics {
    display: flex;
    gap: 1rem;
  }

  .metric {
    font-size: 0.75rem;
    color: #888;
  }

  .btn-icon-small {
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #333;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-icon-small:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  /* Schedule Timeline */
  .schedule-timeline {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .timeline-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    position: relative;
  }

  .timeline-time {
    font-size: 0.875rem;
    font-weight: 500;
    color: #7877c6;
    min-width: 60px;
  }

  .timeline-dot {
    width: 8px;
    height: 8px;
    background: #7877c6;
    border-radius: 50%;
    margin-top: 6px;
    position: relative;
  }

  .timeline-dot::after {
    content: '';
    position: absolute;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    width: 1px;
    height: 40px;
    background: #333;
  }

  .timeline-item:last-child .timeline-dot::after {
    display: none;
  }

  .timeline-content {
    flex: 1;
  }

  .timeline-title {
    font-size: 1rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  .timeline-desc {
    color: #888;
    font-size: 0.875rem;
    margin-bottom: 0.75rem;
  }

  .timeline-tags {
    display: flex;
    gap: 0.5rem;
  }

  .tag {
    background: rgba(120, 119, 198, 0.2);
    color: #c6a6f7;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  /* Quick Actions */
  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
  }

  .action-button {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid #333;
    padding: 1.5rem 1rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    color: #fff;
  }

  .action-button:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: #555;
    transform: translateY(-3px);
  }

  .action-button.primary {
    background: linear-gradient(135deg, #7877c6 0%, #c6a6f7 100%);
    border-color: transparent;
  }

  .action-button.primary:hover {
    background: linear-gradient(135deg, #8988d6 0%, #d6b6ff 100%);
    transform: translateY(-3px) scale(1.02);
  }

  .action-icon {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .action-label {
    font-size: 0.875rem;
    font-weight: 500;
  }

  /* Account Status */
  .health-indicator {
    background: rgba(46, 160, 67, 0.2);
    color: #4ade80;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .account-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .account-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid #222;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .account-item:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: #333;
  }

  .account-avatar img {
    width: 48px;
    height: 48px;
    border-radius: 50%;
  }

  .account-details {
    flex: 1;
  }

  .account-name {
    font-size: 1rem;
    font-weight: 500;
    margin-bottom: 0.25rem;
  }

  .account-handle {
    color: #888;
    font-size: 0.875rem;
  }

  .account-metrics {
    display: flex;
    gap: 2rem;
  }

  .metric-item {
    text-align: center;
  }

  .metric-value {
    display: block;
    font-size: 1.125rem;
    font-weight: 500;
    color: #7877c6;
  }

  .metric-label {
    font-size: 0.75rem;
    color: #888;
  }

  .account-status {
    background: rgba(46, 160, 67, 0.2);
    color: #4ade80;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  /* Animations */
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .stylish-dashboard {
      padding: 1rem;
    }

    .header-content {
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }

    .content-grid {
      grid-template-columns: 1fr;
    }

    .actions-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
