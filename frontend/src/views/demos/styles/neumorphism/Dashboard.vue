<template>
  <div class="neumorphism-dashboard">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-content">
        <div class="welcome-section">
          <h1 class="welcome-title">Welcome back, Sarah</h1>
          <p class="welcome-subtitle">
            Here's what's happening with your accounts today
          </p>
        </div>
        <div class="quick-actions">
          <button class="action-btn" @click="showNewPost = true">
            <i class="mdi mdi-plus"></i>
            New Post
          </button>
          <button class="action-btn secondary">
            <i class="mdi mdi-calendar"></i>
            Schedule
          </button>
        </div>
      </div>
    </header>

    <!-- Stats Overview -->
    <section class="stats-overview">
      <div class="stats-grid">
        <div class="stat-card" v-for="stat in dashboardStats" :key="stat.id">
          <div class="stat-icon">
            <i :class="stat.icon"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-change" :class="stat.changeType">
              <i :class="stat.changeIcon"></i>
              {{ stat.change }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Dashboard Content -->
    <div class="dashboard-content">
      <!-- Left Column -->
      <div class="left-column">
        <!-- Activity Chart -->
        <div class="chart-card">
          <div class="card-header">
            <h3>Posting Activity</h3>
            <div class="chart-controls">
              <button
                class="chart-control"
                :class="{ active: activeChartPeriod === '7d' }"
                @click="activeChartPeriod = '7d'"
              >
                7d
              </button>
              <button
                class="chart-control"
                :class="{ active: activeChartPeriod === '30d' }"
                @click="activeChartPeriod = '30d'"
              >
                30d
              </button>
              <button
                class="chart-control"
                :class="{ active: activeChartPeriod === '90d' }"
                @click="activeChartPeriod = '90d'"
              >
                90d
              </button>
            </div>
          </div>
          <div class="chart-container">
            <div class="chart-placeholder">
              <div class="chart-bars">
                <div
                  class="bar"
                  v-for="i in 12"
                  :key="i"
                  :style="{ height: Math.random() * 80 + 20 + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Posts -->
        <div class="recent-posts-card">
          <div class="card-header">
            <h3>Recent Posts</h3>
            <button class="view-all-btn">View All</button>
          </div>
          <div class="posts-list">
            <div class="post-item" v-for="post in recentPosts" :key="post.id">
              <div class="post-thumbnail">
                <img :src="post.thumbnail" :alt="post.title" />
              </div>
              <div class="post-details">
                <h4>{{ post.title }}</h4>
                <p>{{ post.account }}</p>
                <div class="post-stats">
                  <span><i class="mdi mdi-heart"></i> {{ post.likes }}</span>
                  <span
                    ><i class="mdi mdi-comment"></i> {{ post.comments }}</span
                  >
                </div>
              </div>
              <div class="post-status" :class="post.status">
                {{ post.status }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="right-column">
        <!-- Quick Create -->
        <div class="quick-create-card">
          <div class="card-header">
            <h3>Quick Create</h3>
          </div>
          <div class="create-form">
            <div class="form-group">
              <textarea
                class="caption-input"
                placeholder="What's on your mind?"
                v-model="quickCaption"
              ></textarea>
            </div>
            <div class="form-group">
              <div class="media-upload">
                <i class="mdi mdi-cloud-upload"></i>
                <span>Drop files here or click to upload</span>
              </div>
            </div>
            <div class="form-actions">
              <button class="schedule-btn">Schedule for Later</button>
              <button class="post-now-btn">Post Now</button>
            </div>
          </div>
        </div>

        <!-- Account Performance -->
        <div class="performance-card">
          <div class="card-header">
            <h3>Account Performance</h3>
          </div>
          <div class="performance-list">
            <div
              class="performance-item"
              v-for="account in accounts"
              :key="account.id"
            >
              <div class="account-avatar">
                <img :src="account.avatar" :alt="account.name" />
              </div>
              <div class="account-info">
                <h4>{{ account.name }}</h4>
                <p>{{ account.followers }} followers</p>
              </div>
              <div class="account-metrics">
                <div class="metric">
                  <span class="metric-value">{{ account.engagement }}%</span>
                  <span class="metric-label">Engagement</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Upcoming Schedule -->
        <div class="schedule-card">
          <div class="card-header">
            <h3>Upcoming Posts</h3>
            <button class="view-calendar-btn">
              <i class="mdi mdi-calendar"></i>
            </button>
          </div>
          <div class="schedule-list">
            <div
              class="schedule-item"
              v-for="item in upcomingPosts"
              :key="item.id"
            >
              <div class="schedule-time">
                <div class="time">{{ item.time }}</div>
                <div class="date">{{ item.date }}</div>
              </div>
              <div class="schedule-content">
                <h4>{{ item.title }}</h4>
                <p>{{ item.account }}</p>
              </div>
              <div class="schedule-actions">
                <button class="edit-btn">
                  <i class="mdi mdi-pencil"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const activeChartPeriod = ref('30d');
  const quickCaption = ref('');
  const showNewPost = ref(false);

  const dashboardStats = ref([
    {
      id: 1,
      icon: 'mdi mdi-post',
      label: 'Posts This Month',
      value: '127',
      change: '+12%',
      changeType: 'positive',
      changeIcon: 'mdi mdi-trending-up',
    },
    {
      id: 2,
      icon: 'mdi mdi-heart',
      label: 'Total Engagement',
      value: '45.2K',
      change: '+8%',
      changeType: 'positive',
      changeIcon: 'mdi mdi-trending-up',
    },
    {
      id: 3,
      icon: 'mdi mdi-account-multiple',
      label: 'New Followers',
      value: '2.3K',
      change: '+24%',
      changeType: 'positive',
      changeIcon: 'mdi mdi-trending-up',
    },
    {
      id: 4,
      icon: 'mdi mdi-calendar-check',
      label: 'Scheduled Posts',
      value: '18',
      change: '-3',
      changeType: 'neutral',
      changeIcon: 'mdi mdi-minus',
    },
  ]);

  const recentPosts = ref([
    {
      id: 1,
      title: 'Morning coffee vibes ☕',
      account: '@sarahlifestyle',
      thumbnail:
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=60&h=60&fit=crop',
      likes: '1.2K',
      comments: '89',
      status: 'published',
    },
    {
      id: 2,
      title: 'Weekend workout session 💪',
      account: '@sarahfitness',
      thumbnail:
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=60&h=60&fit=crop',
      likes: '856',
      comments: '42',
      status: 'scheduled',
    },
    {
      id: 3,
      title: 'Healthy meal prep ideas',
      account: '@sarahlifestyle',
      thumbnail:
        'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=60&h=60&fit=crop',
      likes: '923',
      comments: '67',
      status: 'published',
    },
  ]);

  const accounts = ref([
    {
      id: 1,
      name: '@sarahlifestyle',
      followers: '45.2K',
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
      engagement: 4.2,
    },
    {
      id: 2,
      name: '@sarahfitness',
      followers: '32.1K',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
      engagement: 5.8,
    },
    {
      id: 3,
      name: '@sarahtravel',
      followers: '28.9K',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face',
      engagement: 3.6,
    },
  ]);

  const upcomingPosts = ref([
    {
      id: 1,
      title: 'Monday motivation post',
      account: '@sarahlifestyle',
      time: '9:00 AM',
      date: 'Tomorrow',
    },
    {
      id: 2,
      title: 'Workout tutorial video',
      account: '@sarahfitness',
      time: '6:00 PM',
      date: 'Tomorrow',
    },
    {
      id: 3,
      title: 'Travel throwback',
      account: '@sarahtravel',
      time: '2:00 PM',
      date: 'Wednesday',
    },
  ]);
</script>

<style scoped>
  .neumorphism-dashboard {
    background: #e0e5ec;
    min-height: 100vh;
    padding: 20px;
    font-family:
      'Inter',
      -apple-system,
      BlinkMacSystemFont,
      sans-serif;
  }

  /* Header */
  .dashboard-header {
    margin-bottom: 30px;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
  }

  .welcome-title {
    font-size: 2rem;
    font-weight: 700;
    color: #4a5568;
    margin: 0;
    text-shadow:
      2px 2px 4px rgba(163, 177, 198, 0.3),
      -2px -2px 4px rgba(255, 255, 255, 0.7);
  }

  .welcome-subtitle {
    color: #718096;
    margin: 5px 0 0 0;
    font-size: 1.1rem;
  }

  .quick-actions {
    display: flex;
    gap: 15px;
  }

  .action-btn {
    background: #e0e5ec;
    border: none;
    padding: 12px 20px;
    border-radius: 15px;
    color: #4299e1;
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

  .action-btn:active {
    box-shadow:
      inset 4px 4px 8px rgba(163, 177, 198, 0.6),
      inset -4px -4px 8px rgba(255, 255, 255, 0.7);
  }

  .action-btn.secondary {
    color: #718096;
  }

  /* Stats Overview */
  .stats-overview {
    margin-bottom: 30px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }

  .stat-card {
    background: #e0e5ec;
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
    background: #e0e5ec;
    box-shadow:
      inset 8px 8px 16px rgba(163, 177, 198, 0.6),
      inset -8px -8px 16px rgba(255, 255, 255, 0.7);
  }

  .stat-icon i {
    font-size: 1.5rem;
    color: #4299e1;
  }

  .stat-value {
    font-size: 1.8rem;
    font-weight: 700;
    color: #4a5568;
    margin-bottom: 5px;
  }

  .stat-label {
    color: #718096;
    font-size: 0.9rem;
    margin-bottom: 5px;
  }

  .stat-change {
    font-size: 0.8rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 3px;
  }

  .stat-change.positive {
    color: #48bb78;
  }

  .stat-change.negative {
    color: #f56565;
  }

  .stat-change.neutral {
    color: #718096;
  }

  /* Dashboard Content */
  .dashboard-content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 30px;
  }

  /* Card Base Styles */
  .chart-card,
  .recent-posts-card,
  .quick-create-card,
  .performance-card,
  .schedule-card {
    background: #e0e5ec;
    border-radius: 20px;
    padding: 25px;
    margin-bottom: 20px;
    box-shadow:
      12px 12px 24px rgba(163, 177, 198, 0.6),
      -12px -12px 24px rgba(255, 255, 255, 0.7);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .card-header h3 {
    font-size: 1.3rem;
    font-weight: 600;
    color: #4a5568;
    margin: 0;
  }

  /* Chart Card */
  .chart-controls {
    display: flex;
    gap: 5px;
  }

  .chart-control {
    background: #e0e5ec;
    border: none;
    padding: 8px 15px;
    border-radius: 10px;
    color: #718096;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow:
      inset 6px 6px 12px rgba(163, 177, 198, 0.6),
      inset -6px -6px 12px rgba(255, 255, 255, 0.7);
  }

  .chart-control.active {
    color: #4299e1;
    box-shadow:
      6px 6px 12px rgba(163, 177, 198, 0.6),
      -6px -6px 12px rgba(255, 255, 255, 0.7);
  }

  .chart-container {
    height: 200px;
    display: flex;
    align-items: end;
    padding: 20px;
    background: #e0e5ec;
    border-radius: 15px;
    box-shadow:
      inset 10px 10px 20px rgba(163, 177, 198, 0.6),
      inset -10px -10px 20px rgba(255, 255, 255, 0.7);
  }

  .chart-bars {
    display: flex;
    align-items: end;
    gap: 8px;
    width: 100%;
    height: 100%;
  }

  .bar {
    background: linear-gradient(180deg, #4299e1 0%, #2b6cb0 100%);
    border-radius: 4px 4px 0 0;
    flex: 1;
    min-height: 20px;
    transition: all 0.3s ease;
    box-shadow:
      2px 2px 4px rgba(163, 177, 198, 0.3),
      -1px -1px 2px rgba(255, 255, 255, 0.7);
  }

  .bar:hover {
    transform: scaleY(1.1);
  }

  /* Recent Posts */
  .posts-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .post-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    background: #e0e5ec;
    border-radius: 15px;
    box-shadow:
      inset 8px 8px 16px rgba(163, 177, 198, 0.6),
      inset -8px -8px 16px rgba(255, 255, 255, 0.7);
  }

  .post-thumbnail {
    width: 50px;
    height: 50px;
    border-radius: 10px;
    overflow: hidden;
    box-shadow:
      6px 6px 12px rgba(163, 177, 198, 0.6),
      -6px -6px 12px rgba(255, 255, 255, 0.7);
  }

  .post-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .post-details {
    flex: 1;
  }

  .post-details h4 {
    font-size: 0.95rem;
    font-weight: 600;
    color: #4a5568;
    margin: 0 0 5px 0;
  }

  .post-details p {
    color: #718096;
    font-size: 0.85rem;
    margin: 0 0 8px 0;
  }

  .post-stats {
    display: flex;
    gap: 15px;
    font-size: 0.8rem;
    color: #718096;
  }

  .post-stats span {
    display: flex;
    align-items: center;
    gap: 3px;
  }

  .post-status {
    padding: 6px 12px;
    border-radius: 10px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .post-status.published {
    background: #c6f6d5;
    color: #22543d;
  }

  .post-status.scheduled {
    background: #bee3f8;
    color: #1a365d;
  }

  /* Quick Create */
  .create-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
  }

  .caption-input {
    background: #e0e5ec;
    border: none;
    padding: 15px;
    border-radius: 15px;
    resize: vertical;
    min-height: 80px;
    color: #4a5568;
    font-family: inherit;
    box-shadow:
      inset 10px 10px 20px rgba(163, 177, 198, 0.6),
      inset -10px -10px 20px rgba(255, 255, 255, 0.7);
  }

  .caption-input:focus {
    outline: none;
    box-shadow:
      inset 8px 8px 16px rgba(163, 177, 198, 0.6),
      inset -8px -8px 16px rgba(255, 255, 255, 0.7);
  }

  .caption-input::placeholder {
    color: #a0aec0;
  }

  .media-upload {
    background: #e0e5ec;
    border: 2px dashed #cbd5e0;
    border-radius: 15px;
    padding: 30px;
    text-align: center;
    color: #718096;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow:
      inset 10px 10px 20px rgba(163, 177, 198, 0.6),
      inset -10px -10px 20px rgba(255, 255, 255, 0.7);
  }

  .media-upload:hover {
    border-color: #4299e1;
    color: #4299e1;
  }

  .media-upload i {
    font-size: 2rem;
    margin-bottom: 10px;
    display: block;
  }

  .form-actions {
    display: flex;
    gap: 10px;
  }

  .schedule-btn,
  .post-now-btn {
    flex: 1;
    padding: 12px;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    background: #e0e5ec;
  }

  .schedule-btn {
    color: #718096;
    box-shadow:
      8px 8px 16px rgba(163, 177, 198, 0.6),
      -8px -8px 16px rgba(255, 255, 255, 0.7);
  }

  .post-now-btn {
    color: #4299e1;
    box-shadow:
      8px 8px 16px rgba(163, 177, 198, 0.6),
      -8px -8px 16px rgba(255, 255, 255, 0.7);
  }

  .schedule-btn:hover,
  .post-now-btn:hover {
    box-shadow:
      4px 4px 8px rgba(163, 177, 198, 0.6),
      -4px -4px 8px rgba(255, 255, 255, 0.7);
    transform: translateY(2px);
  }

  /* Performance Card */
  .performance-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .performance-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    background: #e0e5ec;
    border-radius: 15px;
    box-shadow:
      inset 8px 8px 16px rgba(163, 177, 198, 0.6),
      inset -8px -8px 16px rgba(255, 255, 255, 0.7);
  }

  .account-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    box-shadow:
      6px 6px 12px rgba(163, 177, 198, 0.6),
      -6px -6px 12px rgba(255, 255, 255, 0.7);
  }

  .account-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .account-info {
    flex: 1;
  }

  .account-info h4 {
    font-size: 0.95rem;
    font-weight: 600;
    color: #4a5568;
    margin: 0 0 3px 0;
  }

  .account-info p {
    color: #718096;
    font-size: 0.85rem;
    margin: 0;
  }

  .metric {
    text-align: right;
  }

  .metric-value {
    font-size: 1.1rem;
    font-weight: 700;
    color: #4299e1;
    display: block;
  }

  .metric-label {
    font-size: 0.8rem;
    color: #718096;
  }

  /* Schedule Card */
  .schedule-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .schedule-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    background: #e0e5ec;
    border-radius: 15px;
    box-shadow:
      inset 8px 8px 16px rgba(163, 177, 198, 0.6),
      inset -8px -8px 16px rgba(255, 255, 255, 0.7);
  }

  .schedule-time {
    text-align: center;
    min-width: 60px;
  }

  .schedule-time .time {
    font-weight: 600;
    color: #4a5568;
    font-size: 0.9rem;
  }

  .schedule-time .date {
    color: #718096;
    font-size: 0.8rem;
  }

  .schedule-content {
    flex: 1;
  }

  .schedule-content h4 {
    font-size: 0.95rem;
    font-weight: 600;
    color: #4a5568;
    margin: 0 0 3px 0;
  }

  .schedule-content p {
    color: #718096;
    font-size: 0.85rem;
    margin: 0;
  }

  .edit-btn,
  .view-all-btn,
  .view-calendar-btn {
    background: #e0e5ec;
    border: none;
    padding: 8px 12px;
    border-radius: 8px;
    color: #718096;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow:
      6px 6px 12px rgba(163, 177, 198, 0.6),
      -6px -6px 12px rgba(255, 255, 255, 0.7);
  }

  .edit-btn:hover,
  .view-all-btn:hover,
  .view-calendar-btn:hover {
    color: #4299e1;
    box-shadow:
      3px 3px 6px rgba(163, 177, 198, 0.6),
      -3px -3px 6px rgba(255, 255, 255, 0.7);
  }

  /* Responsive Design */
  @media (max-width: 1024px) {
    .dashboard-content {
      grid-template-columns: 1fr;
    }

    .header-content {
      flex-direction: column;
      align-items: stretch;
      text-align: center;
    }

    .quick-actions {
      justify-content: center;
    }
  }

  @media (max-width: 768px) {
    .neumorphism-dashboard {
      padding: 15px;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .welcome-title {
      font-size: 1.5rem;
    }

    .form-actions {
      flex-direction: column;
    }

    .post-item,
    .performance-item,
    .schedule-item {
      flex-direction: column;
      text-align: center;
      gap: 10px;
    }
  }
</style>
