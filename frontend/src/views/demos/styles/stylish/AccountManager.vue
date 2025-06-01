<template>
  <div class="stylish-accounts">
    <!-- Header -->
    <header class="accounts-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">Account Management</h1>
          <p class="page-subtitle">Master your digital presence</p>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" @click="showAnalytics = !showAnalytics">
            {{ showAnalytics ? 'Hide' : 'Show' }} Analytics
          </button>
          <button class="btn-primary" @click="showAddAccountModal = true">
            Add Account
          </button>
        </div>
      </div>
    </header>

    <!-- Analytics Overview -->
    <section v-if="showAnalytics" class="analytics-overview">
      <div class="analytics-grid">
        <div class="analytics-card total-reach">
          <div class="card-header">
            <h3 class="card-title">Total Reach</h3>
            <div class="card-icon">📊</div>
          </div>
          <div class="card-value">{{ formatNumber(totalReach) }}</div>
          <div class="card-trend positive">+12.5% this month</div>
          <div class="card-chart">
            <canvas ref="reachChart" width="200" height="60"></canvas>
          </div>
        </div>

        <div class="analytics-card engagement-rate">
          <div class="card-header">
            <h3 class="card-title">Avg. Engagement</h3>
            <div class="card-icon">💬</div>
          </div>
          <div class="card-value">{{ avgEngagement }}%</div>
          <div class="card-trend positive">+2.3% this month</div>
          <div class="card-chart">
            <canvas ref="engagementChart" width="200" height="60"></canvas>
          </div>
        </div>

        <div class="analytics-card growth-rate">
          <div class="card-header">
            <h3 class="card-title">Growth Rate</h3>
            <div class="card-icon">📈</div>
          </div>
          <div class="card-value">{{ growthRate }}%</div>
          <div class="card-trend positive">+5.7% this month</div>
          <div class="card-chart">
            <canvas ref="growthChart" width="200" height="60"></canvas>
          </div>
        </div>

        <div class="analytics-card active-accounts">
          <div class="card-header">
            <h3 class="card-title">Active Accounts</h3>
            <div class="card-icon">👥</div>
          </div>
          <div class="card-value">{{ activeAccounts }}</div>
          <div class="card-trend neutral">{{ totalAccounts }} total</div>
          <div class="accounts-breakdown">
            <div class="breakdown-item">
              <span class="breakdown-label">Connected</span>
              <span class="breakdown-value">{{ connectedAccounts }}</span>
            </div>
            <div class="breakdown-item">
              <span class="breakdown-label">Pending</span>
              <span class="breakdown-value">{{ pendingAccounts }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Accounts Grid -->
    <section class="accounts-section">
      <div class="section-header">
        <div class="section-left">
          <h2 class="section-title">Your Accounts</h2>
          <div class="accounts-filters">
            <select v-model="selectedFilter" class="filter-select">
              <option value="all">All Accounts</option>
              <option value="active">Active Only</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
            <select v-model="sortBy" class="filter-select">
              <option value="followers">Sort by Followers</option>
              <option value="engagement">Sort by Engagement</option>
              <option value="growth">Sort by Growth</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>
        <div class="section-right">
          <div class="view-switcher">
            <button
              v-for="view in viewOptions"
              :key="view.value"
              :class="['view-btn', { active: currentView === view.value }]"
              @click="currentView = view.value"
            >
              {{ view.icon }} {{ view.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Grid View -->
      <div v-if="currentView === 'grid'" class="accounts-grid">
        <div
          v-for="(account, index) in filteredAccounts"
          :key="account.id"
          class="account-card"
          :class="account.status"
          :style="{ animationDelay: `${index * 0.1}s` }"
          @click="selectAccount(account)"
        >
          <div class="card-header">
            <div class="account-avatar">
              <img :src="account.avatar" :alt="account.name" />
              <div class="status-indicator" :class="account.status"></div>
            </div>
            <div class="account-actions">
              <button class="action-btn" @click.stop="editAccount(account)">
                ⚙️
              </button>
              <button class="action-btn" @click.stop="toggleAccount(account)">
                {{ account.status === 'active' ? '⏸️' : '▶️' }}
              </button>
            </div>
          </div>

          <div class="account-info">
            <h3 class="account-name">{{ account.name }}</h3>
            <p class="account-username">{{ account.username }}</p>
            <div class="account-category">{{ account.category }}</div>
          </div>

          <div class="account-stats">
            <div class="stat-item">
              <span class="stat-value">{{
                formatNumber(account.followers)
              }}</span>
              <span class="stat-label">Followers</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ account.engagement }}%</span>
              <span class="stat-label">Engagement</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ account.posts }}</span>
              <span class="stat-label">Posts</span>
            </div>
          </div>

          <div class="performance-chart">
            <canvas
              :ref="`chart-${account.id}`"
              width="250"
              height="80"
            ></canvas>
          </div>

          <div class="account-footer">
            <div class="last-post">
              <span class="last-post-label">Last post:</span>
              <span class="last-post-time">{{ account.lastPost }}</span>
            </div>
            <div class="growth-indicator" :class="account.growthTrend">
              {{ account.growthValue }}
            </div>
          </div>
        </div>

        <!-- Add Account Card -->
        <div class="add-account-card" @click="showAddAccountModal = true">
          <div class="add-icon">+</div>
          <h3 class="add-title">Add New Account</h3>
          <p class="add-description">
            Connect another Instagram account to manage
          </p>
        </div>
      </div>

      <!-- List View -->
      <div v-if="currentView === 'list'" class="accounts-list">
        <div class="list-header">
          <div class="header-column account-col">Account</div>
          <div class="header-column followers-col">Followers</div>
          <div class="header-column engagement-col">Engagement</div>
          <div class="header-column growth-col">Growth</div>
          <div class="header-column status-col">Status</div>
          <div class="header-column actions-col">Actions</div>
        </div>

        <div
          v-for="account in filteredAccounts"
          :key="account.id"
          class="list-row"
          :class="account.status"
        >
          <div class="row-column account-col">
            <div class="account-avatar small">
              <img :src="account.avatar" :alt="account.name" />
            </div>
            <div class="account-details">
              <div class="account-name">{{ account.name }}</div>
              <div class="account-username">{{ account.username }}</div>
            </div>
          </div>
          <div class="row-column followers-col">
            <div class="metric-value">
              {{ formatNumber(account.followers) }}
            </div>
            <div class="metric-change" :class="account.followersTrend">
              {{ account.followersChange }}
            </div>
          </div>
          <div class="row-column engagement-col">
            <div class="metric-value">{{ account.engagement }}%</div>
            <div class="engagement-bar">
              <div
                class="engagement-fill"
                :style="{ width: `${account.engagement * 5}%` }"
              ></div>
            </div>
          </div>
          <div class="row-column growth-col">
            <div class="metric-value">{{ account.growthValue }}</div>
            <div class="growth-trend" :class="account.growthTrend">
              {{
                account.growthTrend === 'positive'
                  ? '↗️'
                  : account.growthTrend === 'negative'
                    ? '↘️'
                    : '→'
              }}
            </div>
          </div>
          <div class="row-column status-col">
            <div class="status-badge" :class="account.status">
              {{ account.statusText }}
            </div>
          </div>
          <div class="row-column actions-col">
            <div class="row-actions">
              <button class="action-btn-small" @click="viewAccount(account)">
                👁️
              </button>
              <button class="action-btn-small" @click="editAccount(account)">
                ✏️
              </button>
              <button
                class="action-btn-small"
                @click="showAccountMenu(account)"
              >
                ⋯
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Account Details Modal -->
    <div
      v-if="selectedAccount"
      class="modal-overlay"
      @click="selectedAccount = null"
    >
      <div class="account-modal" @click.stop>
        <div class="modal-header">
          <div class="modal-account-info">
            <div class="modal-avatar">
              <img :src="selectedAccount.avatar" :alt="selectedAccount.name" />
            </div>
            <div class="modal-details">
              <h2 class="modal-title">{{ selectedAccount.name }}</h2>
              <p class="modal-username">{{ selectedAccount.username }}</p>
              <div class="modal-status" :class="selectedAccount.status">
                {{ selectedAccount.statusText }}
              </div>
            </div>
          </div>
          <button class="modal-close" @click="selectedAccount = null">×</button>
        </div>

        <div class="modal-content">
          <div class="modal-stats">
            <div class="modal-stat">
              <div class="stat-number">
                {{ formatNumber(selectedAccount.followers) }}
              </div>
              <div class="stat-label">Followers</div>
              <div class="stat-change positive">
                +{{ selectedAccount.followersChange }}
              </div>
            </div>
            <div class="modal-stat">
              <div class="stat-number">
                {{ selectedAccount.following?.toLocaleString() }}
              </div>
              <div class="stat-label">Following</div>
            </div>
            <div class="modal-stat">
              <div class="stat-number">{{ selectedAccount.posts }}</div>
              <div class="stat-label">Posts</div>
            </div>
            <div class="modal-stat">
              <div class="stat-number">{{ selectedAccount.engagement }}%</div>
              <div class="stat-label">Engagement Rate</div>
              <div class="stat-change positive">
                +{{ selectedAccount.engagementChange }}%
              </div>
            </div>
          </div>

          <div class="modal-chart">
            <h3 class="chart-title">Performance Overview</h3>
            <canvas ref="modalChart" width="400" height="200"></canvas>
          </div>

          <div class="modal-recent">
            <h3 class="recent-title">Recent Posts</h3>
            <div class="recent-posts">
              <div
                v-for="post in selectedAccount.recentPosts"
                :key="post.id"
                class="recent-post"
              >
                <div class="post-image" :style="{ background: post.color }">
                  <span class="post-type">{{ post.type }}</span>
                </div>
                <div class="post-stats">
                  <span class="post-likes"
                    >{{ formatNumber(post.likes) }} ❤️</span
                  >
                  <span class="post-comments">{{ post.comments } 💬</span>
                </div>
                <div class="post-date">{{ post.date }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button
            class="btn-secondary"
            @click="disconnectAccount(selectedAccount)"
          >
            Disconnect
          </button>
          <button class="btn-primary" @click="editAccount(selectedAccount)">
            Edit Settings
          </button>
        </div>
      </div>
    </div>

    <!-- Add Account Modal -->
    <div
      v-if="showAddAccountModal"
      class="modal-overlay"
      @click="showAddAccountModal = false"
    >
      <div class="add-account-modal" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">Add Instagram Account</h2>
          <button class="modal-close" @click="showAddAccountModal = false">
            ×
          </button>
        </div>

        <div class="modal-content">
          <div class="connection-options">
            <div class="connection-method" @click="connectInstagram">
              <div class="method-icon">📷</div>
              <h3 class="method-title">Instagram Business</h3>
              <p class="method-description">
                Connect your Instagram Business account for full features
              </p>
              <div class="method-features">
                <span class="feature">✓ Scheduled Posts</span>
                <span class="feature">✓ Analytics</span>
                <span class="feature">✓ Multiple Media</span>
              </div>
            </div>

            <div class="connection-method" @click="connectCreator">
              <div class="method-icon">🎨</div>
              <h3 class="method-title">Instagram Creator</h3>
              <p class="method-description">
                Connect your Instagram Creator account
              </p>
              <div class="method-features">
                <span class="feature">✓ Stories & Reels</span>
                <span class="feature">✓ Creator Analytics</span>
                <span class="feature">✓ Advanced Insights</span>
              </div>
            </div>
          </div>

          <div class="connection-help">
            <h4 class="help-title">Need Help?</h4>
            <p class="help-text">
              Make sure your Instagram account is set to Business or Creator
              mode. You'll need admin access to connect the account.
            </p>
            <button class="help-button">View Setup Guide</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, nextTick } from 'vue';

  // Reactive data
  const showAnalytics = ref(true);
  const showAddAccountModal = ref(false);
  const selectedAccount = ref<any>(null);
  const selectedFilter = ref('all');
  const sortBy = ref('followers');
  const currentView = ref('grid');

  // Chart refs
  const reachChart = ref<HTMLCanvasElement>();
  const engagementChart = ref<HTMLCanvasElement>();
  const growthChart = ref<HTMLCanvasElement>();
  const modalChart = ref<HTMLCanvasElement>();

  // Sample data
  const accounts = ref([
    {
      id: 'main',
      name: 'Company Official',
      username: '@company_official',
      avatar:
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM3ODc3QzYiLz4KPHRleHQgeD0iMjAiIHk9IjI2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiPk08L3RleHQ+Cjwvc3ZnPgo=',
      category: 'Business',
      followers: 1240000,
      following: 847,
      posts: 1856,
      engagement: 8.4,
      status: 'active',
      statusText: 'Active',
      lastPost: '2 hours ago',
      growthValue: '+12.5%',
      growthTrend: 'positive',
      followersChange: '+1.2K',
      followersTrend: 'positive',
      engagementChange: '+0.3',
      recentPosts: [
        {
          id: 1,
          type: '📸',
          likes: 15400,
          comments: 342,
          date: '2h ago',
          color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
        {
          id: 2,
          type: '🎬',
          likes: 28900,
          comments: 567,
          date: '1d ago',
          color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        },
        {
          id: 3,
          type: '📷',
          likes: 12100,
          comments: 289,
          date: '2d ago',
          color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        },
      ],
    },
    {
      id: 'creative',
      name: 'Creative Studio',
      username: '@creative_studio',
      avatar:
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNDNkE2RjciLz4KPHRleHQgeD0iMjAiIHk9IjI2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiPkM8L3RleHQ+Cjwvc3ZnPgo=',
      category: 'Creator',
      followers: 856000,
      following: 1240,
      posts: 987,
      engagement: 12.1,
      status: 'active',
      statusText: 'Active',
      lastPost: '5 hours ago',
      growthValue: '+8.7%',
      growthTrend: 'positive',
      followersChange: '+890',
      followersTrend: 'positive',
      engagementChange: '+0.8',
      recentPosts: [
        {
          id: 1,
          type: '🎨',
          likes: 22100,
          comments: 445,
          date: '5h ago',
          color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        },
        {
          id: 2,
          type: '📸',
          likes: 18700,
          comments: 321,
          date: '1d ago',
          color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        },
        {
          id: 3,
          type: '🎬',
          likes: 31200,
          comments: 678,
          date: '2d ago',
          color: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
        },
      ],
    },
    {
      id: 'personal',
      name: 'Personal Brand',
      username: '@john_doe',
      avatar:
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM0ZmFjZmUiLz4KPHRleHQgeD0iMjAiIHk9IjI2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiPko8L3RleHQ+Cjwvc3ZnPgo=',
      category: 'Personal',
      followers: 45200,
      following: 892,
      posts: 456,
      engagement: 6.8,
      status: 'pending',
      statusText: 'Pending',
      lastPost: '1 day ago',
      growthValue: '+3.2%',
      growthTrend: 'positive',
      followersChange: '+145',
      followersTrend: 'positive',
      engagementChange: '-0.1',
      recentPosts: [
        {
          id: 1,
          type: '📸',
          likes: 3200,
          comments: 89,
          date: '1d ago',
          color: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
        },
        {
          id: 2,
          type: '📷',
          likes: 2890,
          comments: 67,
          date: '3d ago',
          color: 'linear-gradient(135deg, #fdbb2d 0%, #22c1c3 100%)',
        },
        {
          id: 3,
          type: '🎬',
          likes: 4100,
          comments: 112,
          date: '5d ago',
          color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        },
      ],
    },
  ]);

  const viewOptions = [
    { label: 'Grid', value: 'grid', icon: '⊞' },
    { label: 'List', value: 'list', icon: '☰' },
  ];

  // Computed properties
  const totalReach = computed(() =>
    accounts.value.reduce((sum, account) => sum + account.followers, 0)
  );

  const avgEngagement = computed(
    () =>
      accounts.value.reduce((sum, account) => sum + account.engagement, 0) /
      accounts.value.length
  );

  const growthRate = computed(() => 15.7);

  const activeAccounts = computed(
    () => accounts.value.filter(account => account.status === 'active').length
  );

  const totalAccounts = computed(() => accounts.value.length);

  const connectedAccounts = computed(
    () => accounts.value.filter(account => account.status === 'active').length
  );

  const pendingAccounts = computed(
    () => accounts.value.filter(account => account.status === 'pending').length
  );

  const filteredAccounts = computed(() => {
    let filtered = accounts.value;

    // Apply filter
    if (selectedFilter.value !== 'all') {
      filtered = filtered.filter(
        account => account.status === selectedFilter.value
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy.value) {
        case 'followers':
          return b.followers - a.followers;
        case 'engagement':
          return b.engagement - a.engagement;
        case 'growth':
          return parseFloat(b.growthValue) - parseFloat(a.growthValue);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  });

  // Methods
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const selectAccount = (account: any) => {
    selectedAccount.value = account;
    nextTick(() => {
      if (modalChart.value) {
        drawModalChart();
      }
    });
  };

  const editAccount = (account: any) => {
    console.log('Edit account:', account);
  };

  const toggleAccount = (account: any) => {
    account.status = account.status === 'active' ? 'inactive' : 'active';
    account.statusText = account.status === 'active' ? 'Active' : 'Inactive';
  };

  const viewAccount = (account: any) => {
    selectAccount(account);
  };

  const showAccountMenu = (account: any) => {
    console.log('Show menu for:', account);
  };

  const disconnectAccount = (account: any) => {
    selectedAccount.value = null;
    const index = accounts.value.findIndex(a => a.id === account.id);
    if (index > -1) {
      accounts.value.splice(index, 1);
    }
  };

  const connectInstagram = () => {
    console.log('Connect Instagram Business');
    showAddAccountModal.value = false;
  };

  const connectCreator = () => {
    console.log('Connect Instagram Creator');
    showAddAccountModal.value = false;
  };

  // Chart drawing functions
  const drawMiniChart = (
    canvas: HTMLCanvasElement,
    data: number[],
    color: string
  ) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const max = Math.max(...data);
    const min = Math.min(...data);

    ctx.clearRect(0, 0, width, height);

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, `${color}20`);

    // Draw area
    ctx.beginPath();
    ctx.moveTo(0, height);

    data.forEach((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / (max - min)) * height;
      ctx.lineTo(x, y);
    });

    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    data.forEach((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / (max - min)) * height;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const drawModalChart = () => {
    const canvas = modalChart.value;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Sample data for 30 days
    const data = Array.from(
      { length: 30 },
      (_, i) => Math.sin(i * 0.2) * 1000 + 5000 + Math.random() * 500
    );

    const max = Math.max(...data);
    const min = Math.min(...data);

    ctx.clearRect(0, 0, width, height);

    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(120, 119, 198, 0.3)');
    gradient.addColorStop(1, 'rgba(120, 119, 198, 0.05)');

    // Draw area chart
    ctx.beginPath();
    ctx.moveTo(40, height - 40);

    data.forEach((value, index) => {
      const x = 40 + index * ((width - 80) / (data.length - 1));
      const y = height - 40 - ((value - min) / (max - min)) * (height - 80);
      ctx.lineTo(x, y);
    });

    ctx.lineTo(width - 40, height - 40);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = '#7877C6';
    ctx.lineWidth = 3;

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

      if (index % 5 === 0) {
        // Only show every 5th point
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = '#7877C6';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  };

  onMounted(async () => {
    await nextTick();

    // Draw analytics charts
    if (reachChart.value) {
      const reachData = [4000, 4200, 4100, 4300, 4500, 4800, 5000];
      drawMiniChart(reachChart.value, reachData, '#7877C6');
    }

    if (engagementChart.value) {
      const engagementData = [7.2, 7.5, 7.8, 8.1, 8.4, 8.2, 8.6];
      drawMiniChart(engagementChart.value, engagementData, '#C6A6F7');
    }

    if (growthChart.value) {
      const growthData = [12, 13, 14, 15, 16, 15, 17];
      drawMiniChart(growthChart.value, growthData, '#4ade80');
    }

    // Draw individual account charts
    accounts.value.forEach(account => {
      const canvas = document.querySelector(
        `[data-chart="${account.id}"]`
      ) as HTMLCanvasElement;
      if (canvas) {
        const data = Array.from(
          { length: 7 },
          () => Math.random() * 1000 + 2000
        );
        drawMiniChart(canvas, data, '#7877C6');
      }
    });
  });
</script>

<style scoped>
  .stylish-accounts {
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
  .accounts-header {
    margin-bottom: 3rem;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 2rem;
    border-bottom: 1px solid #222;
  }

  .page-title {
    font-size: 2.5rem;
    font-weight: 200;
    margin-bottom: 0.5rem;
    letter-spacing: -0.02em;
  }

  .page-subtitle {
    color: #888;
    font-size: 1.125rem;
    font-weight: 300;
  }

  .header-actions {
    display: flex;
    gap: 1rem;
  }

  .btn-primary,
  .btn-secondary {
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    letter-spacing: 0.025em;
  }

  .btn-primary {
    background: linear-gradient(135deg, #7877c6 0%, #c6a6f7 100%);
    border: none;
    color: #fff;
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(120, 119, 198, 0.3);
  }

  .btn-secondary {
    background: transparent;
    border: 1px solid #333;
    color: #fff;
  }

  .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: #555;
  }

  /* Analytics Overview */
  .analytics-overview {
    margin-bottom: 3rem;
  }

  .analytics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
  }

  .analytics-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid #222;
    border-radius: 8px;
    padding: 2rem;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    overflow: hidden;
  }

  .analytics-card:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: #333;
    transform: translateY(-5px);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .card-title {
    font-size: 1rem;
    font-weight: 500;
    color: #888;
    margin: 0;
  }

  .card-icon {
    font-size: 1.5rem;
    opacity: 0.6;
  }

  .card-value {
    font-size: 2.5rem;
    font-weight: 200;
    margin-bottom: 0.5rem;
    letter-spacing: -0.02em;
  }

  .card-trend {
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 1.5rem;
  }

  .card-trend.positive {
    color: #4ade80;
  }

  .card-trend.neutral {
    color: #888;
  }

  .card-chart {
    position: relative;
    height: 60px;
  }

  .card-chart canvas {
    width: 100%;
    height: 100%;
  }

  .accounts-breakdown {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
  }

  .breakdown-item {
    text-align: center;
  }

  .breakdown-label {
    display: block;
    font-size: 0.75rem;
    color: #888;
    margin-bottom: 0.25rem;
  }

  .breakdown-value {
    font-size: 1.5rem;
    font-weight: 500;
    color: #7877c6;
  }

  /* Section Header */
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .section-left {
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .section-title {
    font-size: 1.5rem;
    font-weight: 400;
    letter-spacing: -0.01em;
    margin: 0;
  }

  .accounts-filters {
    display: flex;
    gap: 1rem;
  }

  .filter-select {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #333;
    color: #fff;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
    cursor: pointer;
  }

  .view-switcher {
    display: flex;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #333;
    border-radius: 6px;
    overflow: hidden;
  }

  .view-btn {
    padding: 0.5rem 1rem;
    background: transparent;
    border: none;
    color: #888;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .view-btn.active {
    background: linear-gradient(135deg, #7877c6 0%, #c6a6f7 100%);
    color: #fff;
  }

  /* Grid View */
  .accounts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 2rem;
  }

  .account-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid #222;
    border-radius: 8px;
    padding: 2rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .account-card:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: #333;
    transform: translateY(-5px);
  }

  .account-card.active {
    border-color: #4ade80;
  }

  .account-card.pending {
    border-color: #fbbf24;
  }

  .account-card.inactive {
    opacity: 0.6;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .account-avatar {
    position: relative;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    overflow: hidden;
  }

  .account-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .status-indicator {
    position: absolute;
    bottom: 4px;
    right: 4px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid #000;
  }

  .status-indicator.active {
    background: #4ade80;
  }

  .status-indicator.pending {
    background: #fbbf24;
  }

  .status-indicator.inactive {
    background: #888;
  }

  .account-actions {
    display: flex;
    gap: 0.5rem;
  }

  .action-btn {
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #333;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .action-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: #555;
  }

  .account-info {
    text-align: center;
    margin-bottom: 2rem;
  }

  .account-name {
    font-size: 1.25rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  .account-username {
    color: #888;
    font-size: 0.875rem;
    margin-bottom: 0.75rem;
  }

  .account-category {
    display: inline-block;
    background: rgba(120, 119, 198, 0.2);
    color: #c6a6f7;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .account-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
    text-align: center;
  }

  .stat-item {
    padding: 1rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid #222;
    border-radius: 6px;
  }

  .stat-value {
    display: block;
    font-size: 1.25rem;
    font-weight: 500;
    color: #7877c6;
    margin-bottom: 0.25rem;
  }

  .stat-label {
    font-size: 0.75rem;
    color: #888;
  }

  .performance-chart {
    height: 80px;
    margin-bottom: 1.5rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid #222;
    border-radius: 6px;
    padding: 1rem;
  }

  .performance-chart canvas {
    width: 100%;
    height: 100%;
  }

  .account-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .last-post {
    font-size: 0.875rem;
  }

  .last-post-label {
    color: #888;
    margin-right: 0.5rem;
  }

  .last-post-time {
    color: #fff;
    font-weight: 500;
  }

  .growth-indicator {
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
  }

  .growth-indicator.positive {
    background: rgba(74, 222, 128, 0.2);
    color: #4ade80;
  }

  .growth-indicator.negative {
    background: rgba(239, 68, 68, 0.2);
    color: #fca5a5;
  }

  .growth-indicator.neutral {
    background: rgba(156, 163, 175, 0.2);
    color: #9ca3af;
  }

  /* Add Account Card */
  .add-account-card {
    background: rgba(255, 255, 255, 0.02);
    border: 2px dashed #333;
    border-radius: 8px;
    padding: 3rem 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
  }

  .add-account-card:hover {
    border-color: #7877c6;
    background: rgba(120, 119, 198, 0.05);
  }

  .add-icon {
    font-size: 3rem;
    color: #888;
    margin-bottom: 1rem;
  }

  .add-title {
    font-size: 1.25rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  .add-description {
    color: #888;
    margin: 0;
  }

  /* List View */
  .accounts-list {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid #222;
    border-radius: 8px;
    overflow: hidden;
  }

  .list-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
    padding: 1rem 2rem;
    background: rgba(255, 255, 255, 0.05);
    border-bottom: 1px solid #222;
    font-size: 0.875rem;
    font-weight: 500;
    color: #888;
  }

  .list-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid #222;
    transition: all 0.3s ease;
  }

  .list-row:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  .list-row:last-child {
    border-bottom: none;
  }

  .row-column {
    display: flex;
    align-items: center;
  }

  .account-col {
    gap: 1rem;
  }

  .account-avatar.small {
    width: 40px;
    height: 40px;
  }

  .account-details {
    display: flex;
    flex-direction: column;
  }

  .account-name {
    font-weight: 500;
    margin-bottom: 0.25rem;
  }

  .account-username {
    font-size: 0.875rem;
    color: #888;
  }

  .metric-value {
    font-weight: 500;
    margin-bottom: 0.25rem;
  }

  .metric-change {
    font-size: 0.75rem;
  }

  .metric-change.positive {
    color: #4ade80;
  }

  .engagement-bar {
    width: 60px;
    height: 4px;
    background: #333;
    border-radius: 2px;
    overflow: hidden;
    margin-top: 0.25rem;
  }

  .engagement-fill {
    height: 100%;
    background: linear-gradient(90deg, #7877c6 0%, #c6a6f7 100%);
  }

  .growth-trend {
    font-size: 1rem;
  }

  .status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .status-badge.active {
    background: rgba(74, 222, 128, 0.2);
    color: #4ade80;
  }

  .status-badge.pending {
    background: rgba(251, 191, 36, 0.2);
    color: #fbbf24;
  }

  .status-badge.inactive {
    background: rgba(156, 163, 175, 0.2);
    color: #9ca3af;
  }

  .row-actions {
    display: flex;
    gap: 0.5rem;
  }

  .action-btn-small {
    width: 28px;
    height: 28px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #333;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
  }

  .action-btn-small:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: #555;
  }

  /* Modals */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
  }

  .account-modal {
    background: #111;
    border: 1px solid #333;
    border-radius: 8px;
    width: 100%;
    max-width: 800px;
    max-height: 90vh;
    overflow: hidden;
    animation: modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .add-account-modal {
    background: #111;
    border: 1px solid #333;
    border-radius: 8px;
    width: 100%;
    max-width: 600px;
    animation: modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem;
    border-bottom: 1px solid #222;
  }

  .modal-account-info {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .modal-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    overflow: hidden;
  }

  .modal-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .modal-title {
    font-size: 1.5rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  .modal-username {
    color: #888;
    margin-bottom: 0.75rem;
  }

  .modal-status {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .modal-status.active {
    background: rgba(74, 222, 128, 0.2);
    color: #4ade80;
  }

  .modal-close {
    width: 32px;
    height: 32px;
    background: transparent;
    border: none;
    color: #888;
    font-size: 1.5rem;
    cursor: pointer;
    transition: color 0.3s ease;
  }

  .modal-close:hover {
    color: #fff;
  }

  .modal-content {
    padding: 2rem;
    max-height: 60vh;
    overflow-y: auto;
  }

  .modal-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
  }

  .modal-stat {
    text-align: center;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid #222;
    border-radius: 8px;
  }

  .stat-number {
    font-size: 2rem;
    font-weight: 200;
    color: #7877c6;
    margin-bottom: 0.5rem;
  }

  .stat-label {
    font-size: 0.875rem;
    color: #888;
    margin-bottom: 0.5rem;
  }

  .stat-change {
    font-size: 0.75rem;
    font-weight: 500;
  }

  .stat-change.positive {
    color: #4ade80;
  }

  .modal-chart {
    margin-bottom: 3rem;
  }

  .chart-title {
    font-size: 1.125rem;
    font-weight: 500;
    margin-bottom: 1.5rem;
    color: #7877c6;
  }

  .modal-chart canvas {
    width: 100%;
    height: 200px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid #222;
    border-radius: 8px;
  }

  .modal-recent {
    margin-bottom: 2rem;
  }

  .recent-title {
    font-size: 1.125rem;
    font-weight: 500;
    margin-bottom: 1.5rem;
  }

  .recent-posts {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
  }

  .recent-post {
    text-align: center;
  }

  .post-image {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.75rem;
    font-size: 1.5rem;
  }

  .post-stats {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: #888;
    margin-bottom: 0.5rem;
  }

  .post-date {
    font-size: 0.75rem;
    color: #888;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding: 2rem;
    border-top: 1px solid #222;
  }

  /* Add Account Modal Content */
  .connection-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
  }

  .connection-method {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid #222;
    border-radius: 8px;
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .connection-method:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: #7877c6;
  }

  .method-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .method-title {
    font-size: 1.25rem;
    font-weight: 500;
    margin-bottom: 1rem;
  }

  .method-description {
    color: #888;
    margin-bottom: 1.5rem;
    line-height: 1.5;
  }

  .method-features {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .feature {
    font-size: 0.875rem;
    color: #4ade80;
  }

  .connection-help {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid #222;
    border-radius: 8px;
    padding: 2rem;
  }

  .help-title {
    font-size: 1.125rem;
    font-weight: 500;
    margin-bottom: 1rem;
    color: #7877c6;
  }

  .help-text {
    color: #888;
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }

  .help-button {
    background: transparent;
    border: 1px solid #7877c6;
    color: #c6a6f7;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .help-button:hover {
    background: rgba(120, 119, 198, 0.2);
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

  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  /* Responsive */
  @media (max-width: 1200px) {
    .analytics-grid {
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    }

    .accounts-grid {
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    }
  }

  @media (max-width: 768px) {
    .stylish-accounts {
      padding: 1rem;
    }

    .header-content {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .section-header {
      flex-direction: column;
      align-items: stretch;
    }

    .section-left {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .accounts-filters {
      justify-content: stretch;
    }

    .accounts-grid {
      grid-template-columns: 1fr;
    }

    .list-header,
    .list-row {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .list-header {
      display: none;
    }

    .list-row {
      flex-direction: column;
      align-items: stretch;
    }

    .modal-stats {
      grid-template-columns: repeat(2, 1fr);
    }

    .connection-options {
      grid-template-columns: 1fr;
    }
  }
</style>
