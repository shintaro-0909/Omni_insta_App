<template>
  <div class="glassmorphism-dashboard">
    <!-- Animated Background -->
    <div class="animated-bg">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
      <div class="orb orb-4"></div>
    </div>

    <!-- Dashboard Content -->
    <v-container fluid class="pa-6">
      <!-- Header -->
      <div class="dashboard-header mb-8">
        <h1 class="dashboard-title">
          Welcome Back, <span class="gradient-text">Sarah</span>
        </h1>
        <p class="dashboard-subtitle">
          Here's what's happening with your Instagram accounts today
        </p>
      </div>

      <!-- Stats Grid -->
      <v-row class="mb-8">
        <v-col v-for="stat in stats" :key="stat.title" cols="12" sm="6" md="3">
          <div
            class="glass-card stat-card"
            :style="{ '--accent-color': stat.color }"
          >
            <div class="stat-icon-wrapper">
              <v-icon size="30" :color="stat.color">{{ stat.icon }}</v-icon>
            </div>
            <div class="stat-content">
              <h3 class="stat-value">{{ stat.value }}</h3>
              <p class="stat-title">{{ stat.title }}</p>
              <div class="stat-change" :class="stat.changeType">
                <v-icon size="16">{{
                  stat.changeType === 'up'
                    ? 'mdi-trending-up'
                    : 'mdi-trending-down'
                }}</v-icon>
                {{ stat.change }}% from last week
              </div>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Main Content Grid -->
      <v-row>
        <!-- Activity Chart -->
        <v-col cols="12" md="8">
          <div class="glass-card chart-card">
            <div class="card-header">
              <h2 class="card-title">Posting Activity</h2>
              <div class="time-filters">
                <v-btn
                  v-for="filter in timeFilters"
                  :key="filter"
                  class="glass-btn filter-btn"
                  :class="{ active: selectedFilter === filter }"
                  @click="selectedFilter = filter"
                  size="small"
                >
                  {{ filter }}
                </v-btn>
              </div>
            </div>
            <div class="chart-container">
              <canvas ref="activityChart" height="300"></canvas>
            </div>
          </div>
        </v-col>

        <!-- Upcoming Posts -->
        <v-col cols="12" md="4">
          <div class="glass-card upcoming-card">
            <h2 class="card-title mb-4">Upcoming Posts</h2>
            <div class="upcoming-list">
              <div
                v-for="post in upcomingPosts"
                :key="post.id"
                class="upcoming-item"
              >
                <div class="post-time">
                  <div class="time-badge" :style="{ background: post.color }">
                    {{ post.time }}
                  </div>
                </div>
                <div class="post-details">
                  <h4 class="post-title">{{ post.title }}</h4>
                  <p class="post-account">@{{ post.account }}</p>
                </div>
                <v-btn icon class="glass-btn edit-btn" size="small">
                  <v-icon size="18">mdi-pencil</v-icon>
                </v-btn>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Performance Metrics -->
      <v-row class="mt-6">
        <v-col cols="12" md="6">
          <div class="glass-card metrics-card">
            <h2 class="card-title mb-4">Performance Metrics</h2>
            <div class="metrics-grid">
              <div
                v-for="metric in metrics"
                :key="metric.label"
                class="metric-item"
              >
                <div class="metric-header">
                  <span class="metric-label">{{ metric.label }}</span>
                  <span class="metric-value">{{ metric.value }}</span>
                </div>
                <div class="progress-wrapper">
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      :style="{
                        width: metric.percentage + '%',
                        background: metric.color,
                      }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-col>

        <!-- Account Overview -->
        <v-col cols="12" md="6">
          <div class="glass-card accounts-card">
            <h2 class="card-title mb-4">Account Overview</h2>
            <div class="accounts-list">
              <div
                v-for="account in accounts"
                :key="account.username"
                class="account-item"
              >
                <v-avatar size="48" class="account-avatar">
                  <img :src="account.avatar" :alt="account.username" />
                </v-avatar>
                <div class="account-info">
                  <h4 class="account-name">{{ account.name }}</h4>
                  <p class="account-username">@{{ account.username }}</p>
                </div>
                <div class="account-stats">
                  <div class="stat-mini">
                    <span class="stat-mini-value">{{ account.posts }}</span>
                    <span class="stat-mini-label">posts</span>
                  </div>
                  <div class="stat-mini">
                    <span class="stat-mini-value">{{ account.followers }}</span>
                    <span class="stat-mini-label">followers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Quick Actions -->
      <div class="glass-card quick-actions mt-6">
        <h2 class="card-title mb-4">Quick Actions</h2>
        <v-row>
          <v-col
            v-for="action in quickActions"
            :key="action.title"
            cols="12"
            sm="6"
            md="3"
          >
            <v-btn
              class="glass-btn action-btn"
              block
              size="large"
              @click="action.action"
            >
              <v-icon start :color="action.color">{{ action.icon }}</v-icon>
              {{ action.title }}
            </v-btn>
          </v-col>
        </v-row>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue';
  import { Chart, registerables } from 'chart.js';

  Chart.register(...registerables);

  // Reactive data
  const selectedFilter = ref('7 Days');
  const activityChart = ref<HTMLCanvasElement>();
  let chartInstance: Chart | null = null;

  const timeFilters = ['24 Hours', '7 Days', '30 Days', '3 Months'];

  const stats = ref([
    {
      icon: 'mdi-send',
      title: 'Posts Published',
      value: '142',
      change: 12,
      changeType: 'up',
      color: '#667eea',
    },
    {
      icon: 'mdi-calendar-check',
      title: 'Scheduled',
      value: '28',
      change: 8,
      changeType: 'up',
      color: '#f093fb',
    },
    {
      icon: 'mdi-account-multiple',
      title: 'Total Reach',
      value: '45.2K',
      change: 5,
      changeType: 'down',
      color: '#4facfe',
    },
    {
      icon: 'mdi-heart',
      title: 'Engagement',
      value: '8.7%',
      change: 15,
      changeType: 'up',
      color: '#fa709a',
    },
  ]);

  const upcomingPosts = ref([
    {
      id: 1,
      time: '2:00 PM',
      title: 'Summer Collection Launch',
      account: 'fashionbrand',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      id: 2,
      time: '4:30 PM',
      title: 'Behind the Scenes',
      account: 'lifestyle',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      id: 3,
      time: '7:00 PM',
      title: 'Product Review',
      account: 'techreview',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
      id: 4,
      time: '9:15 PM',
      title: 'Weekly Motivation',
      account: 'motivational',
      color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    },
  ]);

  const metrics = ref([
    {
      label: 'Engagement Rate',
      value: '8.7%',
      percentage: 87,
      color: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
    },
    {
      label: 'Story Views',
      value: '12.4K',
      percentage: 72,
      color: 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      label: 'Profile Visits',
      value: '3.2K',
      percentage: 65,
      color: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
      label: 'Click Rate',
      value: '5.3%',
      percentage: 53,
      color: 'linear-gradient(90deg, #fa709a 0%, #fee140 100%)',
    },
  ]);

  const accounts = ref([
    {
      name: 'Fashion Brand',
      username: 'fashionbrand',
      avatar: 'https://i.pravatar.cc/150?img=1',
      posts: '1.2K',
      followers: '45.3K',
    },
    {
      name: 'Lifestyle Blog',
      username: 'lifestyle',
      avatar: 'https://i.pravatar.cc/150?img=2',
      posts: '856',
      followers: '23.1K',
    },
    {
      name: 'Tech Reviews',
      username: 'techreview',
      avatar: 'https://i.pravatar.cc/150?img=3',
      posts: '432',
      followers: '18.7K',
    },
  ]);

  const quickActions = ref([
    {
      icon: 'mdi-plus-circle',
      title: 'Create Post',
      color: '#667eea',
      action: () => console.log('Create post'),
    },
    {
      icon: 'mdi-calendar-plus',
      title: 'Schedule',
      color: '#f093fb',
      action: () => console.log('Schedule post'),
    },
    {
      icon: 'mdi-chart-timeline',
      title: 'Analytics',
      color: '#4facfe',
      action: () => console.log('View analytics'),
    },
    {
      icon: 'mdi-account-plus',
      title: 'Add Account',
      color: '#fa709a',
      action: () => console.log('Add account'),
    },
  ]);

  // Chart setup
  const createChart = () => {
    if (!activityChart.value) return;

    const ctx = activityChart.value.getContext('2d');
    if (!ctx) return;

    if (chartInstance) {
      chartInstance.destroy();
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(102, 126, 234, 0.4)');
    gradient.addColorStop(1, 'rgba(102, 126, 234, 0)');

    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: getLabels(),
        datasets: [
          {
            label: 'Posts Published',
            data: getData(),
            borderColor: '#667eea',
            backgroundColor: gradient,
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#667eea',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#333',
            bodyColor: '#666',
            borderColor: 'rgba(0, 0, 0, 0.1)',
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            callbacks: {
              label: context => `Posts: ${context.parsed.y}`,
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.8)',
            },
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.8)',
            },
          },
        },
      },
    });
  };

  const getLabels = () => {
    switch (selectedFilter.value) {
      case '24 Hours':
        return ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'];
      case '7 Days':
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      case '30 Days':
        return Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
      case '3 Months':
        return ['Jan', 'Feb', 'Mar'];
      default:
        return [];
    }
  };

  const getData = () => {
    switch (selectedFilter.value) {
      case '24 Hours':
        return [2, 3, 5, 8, 12, 7, 4];
      case '7 Days':
        return [15, 22, 18, 28, 25, 32, 28];
      case '30 Days':
        return Array.from(
          { length: 30 },
          () => Math.floor(Math.random() * 40) + 10
        );
      case '3 Months':
        return [450, 520, 480];
      default:
        return [];
    }
  };

  onMounted(() => {
    createChart();
  });

  watch(selectedFilter, () => {
    createChart();
  });
</script>

<style scoped>
  .glassmorphism-dashboard {
    min-height: 100vh;
    background: linear-gradient(
      135deg,
      #1e3c72 0%,
      #2a5298 25%,
      #7e22ce 50%,
      #ec4899 75%,
      #1e3c72 100%
    );
    background-size: 400% 400%;
    animation: gradientShift 25s ease infinite;
    position: relative;
  }

  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  /* Animated Background Orbs */
  .animated-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
  }

  .orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    opacity: 0.4;
  }

  .orb-1 {
    width: 500px;
    height: 500px;
    background: radial-gradient(
      circle,
      rgba(102, 126, 234, 0.8) 0%,
      transparent 70%
    );
    top: -20%;
    left: -10%;
    animation: float 30s ease-in-out infinite;
  }

  .orb-2 {
    width: 400px;
    height: 400px;
    background: radial-gradient(
      circle,
      rgba(240, 147, 251, 0.8) 0%,
      transparent 70%
    );
    top: 60%;
    right: -10%;
    animation: float 25s ease-in-out infinite reverse;
  }

  .orb-3 {
    width: 300px;
    height: 300px;
    background: radial-gradient(
      circle,
      rgba(79, 172, 254, 0.8) 0%,
      transparent 70%
    );
    bottom: 20%;
    left: 50%;
    animation: float 35s ease-in-out infinite;
  }

  .orb-4 {
    width: 250px;
    height: 250px;
    background: radial-gradient(
      circle,
      rgba(250, 112, 154, 0.8) 0%,
      transparent 70%
    );
    top: 40%;
    left: 20%;
    animation: float 20s ease-in-out infinite reverse;
  }

  @keyframes float {
    0%,
    100% {
      transform: translate(0, 0) scale(1) rotate(0deg);
    }
    25% {
      transform: translate(50px, -30px) scale(1.1) rotate(90deg);
    }
    50% {
      transform: translate(-30px, 50px) scale(0.9) rotate(180deg);
    }
    75% {
      transform: translate(-50px, -20px) scale(1.05) rotate(270deg);
    }
  }

  /* Glass Card Base */
  .glass-card {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    padding: 2rem;
    position: relative;
    z-index: 1;
    transition: all 0.3s ease;
  }

  .glass-card:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }

  /* Dashboard Header */
  .dashboard-header {
    text-align: center;
    position: relative;
    z-index: 1;
  }

  .dashboard-title {
    font-size: 3rem;
    font-weight: 800;
    color: white;
    margin-bottom: 0.5rem;
  }

  .gradient-text {
    background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .dashboard-subtitle {
    font-size: 1.25rem;
    color: rgba(255, 255, 255, 0.8);
  }

  /* Stats Cards */
  .stat-card {
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    height: 100%;
  }

  .stat-icon-wrapper {
    width: 60px;
    height: 60px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .stat-content {
    flex: 1;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: white;
    margin-bottom: 0.25rem;
  }

  .stat-title {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 0.5rem;
  }

  .stat-change {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .stat-change.up {
    color: #10b981;
  }

  .stat-change.down {
    color: #ef4444;
  }

  /* Chart Card */
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .card-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: white;
  }

  .time-filters {
    display: flex;
    gap: 0.5rem;
  }

  .glass-btn {
    background: rgba(255, 255, 255, 0.1) !important;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    color: rgba(255, 255, 255, 0.8) !important;
    font-weight: 500;
    transition: all 0.3s ease;
    text-transform: none;
  }

  .glass-btn:hover {
    background: rgba(255, 255, 255, 0.2) !important;
    color: white !important;
  }

  .filter-btn.active {
    background: rgba(102, 126, 234, 0.4) !important;
    border-color: rgba(102, 126, 234, 0.6) !important;
    color: white !important;
  }

  .chart-container {
    position: relative;
    height: 300px;
  }

  /* Upcoming Posts */
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
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    transition: all 0.3s ease;
  }

  .upcoming-item:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateX(4px);
  }

  .time-badge {
    padding: 0.5rem 1rem;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    font-size: 0.875rem;
  }

  .post-details {
    flex: 1;
  }

  .post-title {
    color: white;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .post-account {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.875rem;
  }

  .edit-btn {
    width: 32px !important;
    height: 32px !important;
  }

  /* Performance Metrics */
  .metrics-grid {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .metric-item {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .metric-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .metric-label {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.875rem;
  }

  .metric-value {
    color: white;
    font-weight: 600;
  }

  .progress-wrapper {
    width: 100%;
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 1s ease;
  }

  /* Account Overview */
  .accounts-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .account-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    transition: all 0.3s ease;
  }

  .account-item:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .account-avatar {
    border: 2px solid rgba(255, 255, 255, 0.3);
  }

  .account-info {
    flex: 1;
  }

  .account-name {
    color: white;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .account-username {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.875rem;
  }

  .account-stats {
    display: flex;
    gap: 1.5rem;
  }

  .stat-mini {
    text-align: center;
  }

  .stat-mini-value {
    display: block;
    color: white;
    font-weight: 600;
    font-size: 1.125rem;
  }

  .stat-mini-label {
    display: block;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.75rem;
    text-transform: uppercase;
  }

  /* Quick Actions */
  .action-btn {
    padding: 1.5rem !important;
    justify-content: flex-start !important;
  }

  /* Responsive */
  @media (max-width: 960px) {
    .dashboard-title {
      font-size: 2rem;
    }

    .time-filters {
      flex-wrap: wrap;
    }

    .account-stats {
      display: none;
    }
  }
</style>
