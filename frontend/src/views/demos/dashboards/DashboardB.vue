<template>
  <div class="dashboard-workspace">
    <!-- Sidebar Navigation -->
    <div class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <div class="logo">
          <v-icon icon="mdi-instagram" size="32" color="primary"></v-icon>
          <span v-if="!sidebarCollapsed" class="logo-text">Omni Insta</span>
        </div>
        <v-btn icon variant="text" size="small" @click="toggleSidebar">
          <v-icon
            :icon="sidebarCollapsed ? 'mdi-menu' : 'mdi-menu-open'"
          ></v-icon>
        </v-btn>
      </div>

      <div class="sidebar-content">
        <nav class="sidebar-nav">
          <div class="nav-section">
            <div v-if="!sidebarCollapsed" class="section-title">メイン</div>
            <a
              v-for="item in mainNavItems"
              :key="item.id"
              href="#"
              class="nav-item"
              :class="{ active: activeNav === item.id }"
              @click="setActiveNav(item.id)"
            >
              <v-icon :icon="item.icon" size="20"></v-icon>
              <span v-if="!sidebarCollapsed" class="nav-label">{{
                item.label
              }}</span>
              <div v-if="item.badge && !sidebarCollapsed" class="nav-badge">
                {{ item.badge }}
              </div>
            </a>
          </div>

          <div class="nav-section">
            <div v-if="!sidebarCollapsed" class="section-title">管理</div>
            <a
              v-for="item in manageNavItems"
              :key="item.id"
              href="#"
              class="nav-item"
              :class="{ active: activeNav === item.id }"
              @click="setActiveNav(item.id)"
            >
              <v-icon :icon="item.icon" size="20"></v-icon>
              <span v-if="!sidebarCollapsed" class="nav-label">{{
                item.label
              }}</span>
            </a>
          </div>
        </nav>

        <div class="sidebar-footer">
          <div class="user-profile">
            <div class="profile-avatar">
              <img
                src="https://picsum.photos/40/40?random=100"
                alt="User Avatar"
              />
            </div>
            <div v-if="!sidebarCollapsed" class="profile-info">
              <div class="profile-name">田中太郎</div>
              <div class="profile-plan">プロプラン</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="main-content" :class="{ expanded: sidebarCollapsed }">
      <!-- Top Header -->
      <div class="content-header">
        <div class="header-left">
          <div class="breadcrumb">
            <span class="breadcrumb-item">ダッシュボード</span>
            <v-icon
              icon="mdi-chevron-right"
              size="16"
              class="breadcrumb-separator"
            ></v-icon>
            <span class="breadcrumb-item active">概要</span>
          </div>
        </div>

        <div class="header-right">
          <div class="header-actions">
            <v-btn icon variant="text" class="header-btn">
              <v-icon icon="mdi-bell-outline"></v-icon>
              <div class="notification-dot"></div>
            </v-btn>

            <v-btn icon variant="text" class="header-btn">
              <v-icon icon="mdi-help-circle-outline"></v-icon>
            </v-btn>

            <v-select
              v-model="selectedAccount"
              :items="accountOptions"
              variant="outlined"
              density="compact"
              hide-details
              class="account-selector"
            >
              <template v-slot:selection="{ item }">
                <div class="selected-account">
                  <img
                    :src="item.raw.avatar"
                    :alt="item.raw.name"
                    class="account-avatar"
                  />
                  <span class="account-name">{{ item.raw.name }}</span>
                </div>
              </template>
            </v-select>
          </div>
        </div>
      </div>

      <!-- Dashboard Content -->
      <div class="dashboard-content">
        <!-- Widget Grid -->
        <div class="widget-grid">
          <!-- Performance Overview Widget -->
          <div class="widget performance-widget">
            <div class="widget-header">
              <h3 class="widget-title">パフォーマンス概要</h3>
              <div class="widget-actions">
                <v-select
                  v-model="performancePeriod"
                  :items="periodOptions"
                  variant="outlined"
                  density="compact"
                  hide-details
                ></v-select>
              </div>
            </div>

            <div class="widget-content">
              <div class="performance-metrics">
                <div
                  v-for="metric in performanceMetrics"
                  :key="metric.id"
                  class="metric-card"
                  :class="metric.trend"
                >
                  <div class="metric-header">
                    <div class="metric-icon">
                      <v-icon :icon="metric.icon" size="20"></v-icon>
                    </div>
                    <div class="metric-trend">
                      <v-icon :icon="metric.trendIcon" size="16"></v-icon>
                      <span>{{ metric.change }}</span>
                    </div>
                  </div>

                  <div class="metric-value">{{ metric.value }}</div>
                  <div class="metric-label">{{ metric.label }}</div>

                  <div class="metric-chart">
                    <canvas
                      :ref="'metric-chart-' + metric.id"
                      width="120"
                      height="40"
                    ></canvas>
                  </div>
                </div>
              </div>

              <div class="performance-chart">
                <canvas
                  ref="performanceChart"
                  width="500"
                  height="200"
                ></canvas>
              </div>
            </div>
          </div>

          <!-- Schedule Timeline Widget -->
          <div class="widget timeline-widget">
            <div class="widget-header">
              <h3 class="widget-title">投稿スケジュール</h3>
              <div class="widget-actions">
                <v-btn variant="text" size="small" prepend-icon="mdi-calendar">
                  カレンダー表示
                </v-btn>
              </div>
            </div>

            <div class="widget-content">
              <div class="timeline-view">
                <div class="timeline-header">
                  <div class="timeline-nav">
                    <v-btn
                      icon
                      variant="text"
                      size="small"
                      @click="previousTimelineDay"
                    >
                      <v-icon icon="mdi-chevron-left"></v-icon>
                    </v-btn>
                    <span class="timeline-date">{{ timelineDate }}</span>
                    <v-btn
                      icon
                      variant="text"
                      size="small"
                      @click="nextTimelineDay"
                    >
                      <v-icon icon="mdi-chevron-right"></v-icon>
                    </v-btn>
                  </div>
                </div>

                <div class="timeline-content">
                  <div class="timeline-hours">
                    <div v-for="hour in 24" :key="hour" class="hour-slot">
                      <span class="hour-label">{{
                        String(hour - 1).padStart(2, '0')
                      }}</span>
                    </div>
                  </div>

                  <div class="timeline-posts">
                    <div
                      v-for="post in timelinePosts"
                      :key="post.id"
                      class="timeline-post"
                      :style="{
                        left: getTimelinePosition(post.time) + '%',
                        width: post.duration + 'px',
                      }"
                      :class="post.status"
                    >
                      <div class="post-indicator">
                        <div class="post-dot"></div>
                        <div class="post-info">
                          <span class="post-time">{{ post.time }}</span>
                          <span class="post-title">{{ post.title }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions Widget -->
          <div class="widget actions-widget">
            <div class="widget-header">
              <h3 class="widget-title">クイックアクション</h3>
            </div>

            <div class="widget-content">
              <div class="action-grid">
                <div
                  v-for="action in quickActions"
                  :key="action.id"
                  class="action-item"
                  @click="executeAction(action.id)"
                >
                  <div class="action-icon" :class="action.colorClass">
                    <v-icon :icon="action.icon" size="24"></v-icon>
                  </div>
                  <div class="action-content">
                    <h4 class="action-title">{{ action.title }}</h4>
                    <p class="action-description">{{ action.description }}</p>
                  </div>
                  <div class="action-arrow">
                    <v-icon icon="mdi-chevron-right" size="16"></v-icon>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Analytics Summary Widget -->
          <div class="widget analytics-widget">
            <div class="widget-header">
              <h3 class="widget-title">分析サマリー</h3>
              <div class="widget-actions">
                <v-btn variant="text" size="small" prepend-icon="mdi-export">
                  エクスポート
                </v-btn>
              </div>
            </div>

            <div class="widget-content">
              <div class="analytics-summary">
                <div class="summary-section">
                  <h4 class="summary-title">今週のハイライト</h4>
                  <div class="highlight-items">
                    <div
                      v-for="highlight in weeklyHighlights"
                      :key="highlight.id"
                      class="highlight-item"
                    >
                      <div class="highlight-icon" :class="highlight.type">
                        <v-icon :icon="highlight.icon" size="16"></v-icon>
                      </div>
                      <div class="highlight-content">
                        <span class="highlight-label">{{
                          highlight.label
                        }}</span>
                        <span class="highlight-value">{{
                          highlight.value
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="summary-section">
                  <h4 class="summary-title">フォロワー増加</h4>
                  <div class="follower-chart">
                    <canvas
                      ref="followerChart"
                      width="300"
                      height="120"
                    ></canvas>
                  </div>
                </div>

                <div class="summary-section">
                  <h4 class="summary-title">トップパフォーマンス投稿</h4>
                  <div class="top-posts">
                    <div
                      v-for="post in topPosts"
                      :key="post.id"
                      class="top-post-item"
                    >
                      <div class="post-thumbnail">
                        <img :src="post.thumbnail" :alt="post.title" />
                      </div>
                      <div class="post-metrics">
                        <span class="post-title">{{ post.title }}</span>
                        <div class="post-stats">
                          <span class="stat-item">
                            <v-icon icon="mdi-heart" size="12"></v-icon>
                            {{ post.likes }}
                          </span>
                          <span class="stat-item">
                            <v-icon icon="mdi-comment" size="12"></v-icon>
                            {{ post.comments }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Activity Widget -->
          <div class="widget activity-widget">
            <div class="widget-header">
              <h3 class="widget-title">最近のアクティビティ</h3>
              <div class="widget-actions">
                <v-btn variant="text" size="small"> 全て表示 </v-btn>
              </div>
            </div>

            <div class="widget-content">
              <div class="activity-feed">
                <div
                  v-for="activity in recentActivities"
                  :key="activity.id"
                  class="activity-item"
                >
                  <div class="activity-icon" :class="activity.type">
                    <v-icon :icon="activity.icon" size="16"></v-icon>
                  </div>
                  <div class="activity-content">
                    <div class="activity-text">{{ activity.text }}</div>
                    <div class="activity-time">{{ activity.time }}</div>
                  </div>
                  <div v-if="activity.preview" class="activity-preview">
                    <img :src="activity.preview" :alt="activity.text" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Account Management Widget -->
          <div class="widget accounts-widget">
            <div class="widget-header">
              <h3 class="widget-title">アカウント管理</h3>
              <div class="widget-actions">
                <v-btn variant="text" size="small" prepend-icon="mdi-plus">
                  追加
                </v-btn>
              </div>
            </div>

            <div class="widget-content">
              <div class="accounts-overview">
                <div
                  v-for="account in managedAccounts"
                  :key="account.id"
                  class="account-overview"
                >
                  <div class="account-header">
                    <div class="account-info">
                      <img
                        :src="account.avatar"
                        :alt="account.name"
                        class="account-avatar"
                      />
                      <div class="account-details">
                        <h4 class="account-name">{{ account.name }}</h4>
                        <p class="account-handle">{{ account.handle }}</p>
                      </div>
                    </div>
                    <div class="account-status" :class="account.status">
                      <v-icon :icon="account.statusIcon" size="16"></v-icon>
                    </div>
                  </div>

                  <div class="account-metrics">
                    <div class="account-metric">
                      <span class="metric-value">{{ account.followers }}</span>
                      <span class="metric-label">フォロワー</span>
                    </div>
                    <div class="account-metric">
                      <span class="metric-value">{{ account.engagement }}</span>
                      <span class="metric-label">エンゲージメント</span>
                    </div>
                    <div class="account-metric">
                      <span class="metric-value">{{ account.todayPosts }}</span>
                      <span class="metric-label">今日の投稿</span>
                    </div>
                  </div>

                  <div class="account-actions">
                    <v-btn variant="outlined" size="small" block> 管理 </v-btn>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Command Palette -->
    <v-dialog v-model="commandPalette" max-width="600">
      <v-card class="command-card">
        <v-card-text class="pa-0">
          <div class="command-search">
            <v-text-field
              v-model="commandSearch"
              placeholder="コマンドを検索..."
              variant="plain"
              hide-details
              prepend-inner-icon="mdi-magnify"
              autofocus
            ></v-text-field>
          </div>

          <div class="command-results">
            <div
              v-for="command in filteredCommands"
              :key="command.id"
              class="command-item"
            >
              <div class="command-icon">
                <v-icon :icon="command.icon" size="20"></v-icon>
              </div>
              <div class="command-content">
                <span class="command-title">{{ command.title }}</span>
                <span class="command-description">{{
                  command.description
                }}</span>
              </div>
              <div class="command-shortcut">{{ command.shortcut }}</div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, nextTick } from 'vue';

  interface NavItem {
    id: string;
    label: string;
    icon: string;
    badge?: string;
  }

  interface PerformanceMetric {
    id: string;
    label: string;
    value: string;
    change: string;
    trend: string;
    icon: string;
    trendIcon: string;
  }

  interface TimelinePost {
    id: string;
    title: string;
    time: string;
    duration: number;
    status: string;
  }

  interface QuickAction {
    id: string;
    title: string;
    description: string;
    icon: string;
    colorClass: string;
  }

  // Reactive data
  const sidebarCollapsed = ref(false);
  const activeNav = ref('dashboard');
  const selectedAccount = ref('account1');
  const performancePeriod = ref('7days');
  const timelineDate = ref('2023年11月27日');
  const commandPalette = ref(false);
  const commandSearch = ref('');

  // Navigation items
  const mainNavItems: NavItem[] = [
    { id: 'dashboard', label: 'ダッシュボード', icon: 'mdi-view-dashboard' },
    { id: 'posts', label: '投稿管理', icon: 'mdi-post', badge: '3' },
    { id: 'schedule', label: 'スケジュール', icon: 'mdi-calendar' },
    { id: 'analytics', label: '分析', icon: 'mdi-chart-line' },
    { id: 'content', label: 'コンテンツ', icon: 'mdi-folder-multiple' },
  ];

  const manageNavItems: NavItem[] = [
    { id: 'accounts', label: 'アカウント', icon: 'mdi-account-multiple' },
    { id: 'settings', label: '設定', icon: 'mdi-cog' },
    { id: 'billing', label: '請求', icon: 'mdi-credit-card' },
  ];

  const accountOptions = [
    {
      title: 'カフェラバー',
      value: 'account1',
      name: 'カフェラバー',
      avatar: 'https://picsum.photos/32/32?random=101',
    },
    {
      title: 'フードクリエイター',
      value: 'account2',
      name: 'フードクリエイター',
      avatar: 'https://picsum.photos/32/32?random=102',
    },
  ];

  const periodOptions = [
    { title: '7日間', value: '7days' },
    { title: '30日間', value: '30days' },
    { title: '90日間', value: '90days' },
  ];

  const performanceMetrics: PerformanceMetric[] = [
    {
      id: 'posts',
      label: '投稿数',
      value: '42',
      change: '+8',
      trend: 'positive',
      icon: 'mdi-post',
      trendIcon: 'mdi-trending-up',
    },
    {
      id: 'engagement',
      label: 'エンゲージメント',
      value: '8.4%',
      change: '+0.7%',
      trend: 'positive',
      icon: 'mdi-heart',
      trendIcon: 'mdi-trending-up',
    },
    {
      id: 'reach',
      label: 'リーチ',
      value: '15.2K',
      change: '+2.1K',
      trend: 'positive',
      icon: 'mdi-eye',
      trendIcon: 'mdi-trending-up',
    },
    {
      id: 'followers',
      label: 'フォロワー',
      value: '12.5K',
      change: '+127',
      trend: 'positive',
      icon: 'mdi-account-plus',
      trendIcon: 'mdi-trending-up',
    },
  ];

  const timelinePosts: TimelinePost[] = [
    {
      id: '1',
      title: 'モーニングコーヒー',
      time: '09:00',
      duration: 60,
      status: 'scheduled',
    },
    {
      id: '2',
      title: 'ランチタイム',
      time: '12:30',
      duration: 80,
      status: 'pending',
    },
    {
      id: '3',
      title: 'サンセット',
      time: '19:00',
      duration: 70,
      status: 'draft',
    },
  ];

  const quickActions: QuickAction[] = [
    {
      id: 'new-post',
      title: '新規投稿',
      description: '新しい投稿を作成',
      icon: 'mdi-plus',
      colorClass: 'action-primary',
    },
    {
      id: 'schedule',
      title: 'スケジュール',
      description: '投稿をスケジュール',
      icon: 'mdi-calendar-plus',
      colorClass: 'action-secondary',
    },
    {
      id: 'analytics',
      title: '分析レポート',
      description: 'パフォーマンスを確認',
      icon: 'mdi-chart-line',
      colorClass: 'action-accent',
    },
    {
      id: 'content',
      title: 'コンテンツ管理',
      description: 'ライブラリを整理',
      icon: 'mdi-folder-open',
      colorClass: 'action-info',
    },
  ];

  const weeklyHighlights = [
    {
      id: '1',
      label: 'ベスト投稿',
      value: '19:00投稿',
      icon: 'mdi-trophy',
      type: 'success',
    },
    {
      id: '2',
      label: 'エンゲージメント',
      value: '+15.3%',
      icon: 'mdi-trending-up',
      type: 'positive',
    },
    {
      id: '3',
      label: '新規フォロワー',
      value: '+127',
      icon: 'mdi-account-plus',
      type: 'info',
    },
  ];

  const topPosts = [
    {
      id: '1',
      title: 'ラテアート',
      thumbnail: 'https://picsum.photos/40/40?random=201',
      likes: '1.2K',
      comments: '89',
    },
    {
      id: '2',
      title: 'パスタレシピ',
      thumbnail: 'https://picsum.photos/40/40?random=202',
      likes: '956',
      comments: '45',
    },
    {
      id: '3',
      title: '朝の風景',
      thumbnail: 'https://picsum.photos/40/40?random=203',
      likes: '743',
      comments: '32',
    },
  ];

  const recentActivities = [
    {
      id: '1',
      text: '「モーニングコーヒー」投稿を公開しました',
      time: '2時間前',
      icon: 'mdi-check-circle',
      type: 'success',
      preview: 'https://picsum.photos/40/40?random=301',
    },
    {
      id: '2',
      text: '新しいフォロワーが25人増加しました',
      time: '4時間前',
      icon: 'mdi-account-plus',
      type: 'info',
    },
    {
      id: '3',
      text: 'スケジュール投稿「ランチタイム」を編集しました',
      time: '6時間前',
      icon: 'mdi-pencil',
      type: 'warning',
    },
    {
      id: '4',
      text: 'エンゲージメント率が目標を上回りました',
      time: '8時間前',
      icon: 'mdi-trophy',
      type: 'success',
    },
  ];

  const managedAccounts = [
    {
      id: '1',
      name: 'カフェラバー',
      handle: '@cafe_lover',
      avatar: 'https://picsum.photos/48/48?random=401',
      followers: '12.5K',
      engagement: '8.4%',
      todayPosts: '3',
      status: 'active',
      statusIcon: 'mdi-check-circle',
    },
    {
      id: '2',
      name: 'フードクリエイター',
      handle: '@food_creator',
      avatar: 'https://picsum.photos/48/48?random=402',
      followers: '8.2K',
      engagement: '6.7%',
      todayPosts: '2',
      status: 'active',
      statusIcon: 'mdi-check-circle',
    },
    {
      id: '3',
      name: 'ネイチャーフォト',
      handle: '@nature_shots',
      avatar: 'https://picsum.photos/48/48?random=403',
      followers: '15.7K',
      engagement: '4.2%',
      todayPosts: '0',
      status: 'warning',
      statusIcon: 'mdi-alert-circle',
    },
  ];

  const commands = [
    {
      id: '1',
      title: '新規投稿を作成',
      description: '新しい投稿を作成します',
      icon: 'mdi-plus',
      shortcut: 'Ctrl+N',
    },
    {
      id: '2',
      title: 'スケジュールを表示',
      description: '投稿スケジュールを表示します',
      icon: 'mdi-calendar',
      shortcut: 'Ctrl+S',
    },
    {
      id: '3',
      title: '分析を表示',
      description: 'パフォーマンス分析を表示します',
      icon: 'mdi-chart-line',
      shortcut: 'Ctrl+A',
    },
  ];

  // Computed
  const filteredCommands = computed(() => {
    if (!commandSearch.value) return commands;
    return commands.filter(
      cmd =>
        cmd.title.toLowerCase().includes(commandSearch.value.toLowerCase()) ||
        cmd.description
          .toLowerCase()
          .includes(commandSearch.value.toLowerCase())
    );
  });

  // Methods
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  };

  const setActiveNav = (navId: string) => {
    activeNav.value = navId;
  };

  const getTimelinePosition = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return ((hours + minutes / 60) / 24) * 100;
  };

  const previousTimelineDay = () => {
    console.log('Previous day');
  };

  const nextTimelineDay = () => {
    console.log('Next day');
  };

  const executeAction = (actionId: string) => {
    console.log('Execute action:', actionId);
  };

  // Keyboard shortcuts
  onMounted(() => {
    document.addEventListener('keydown', e => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        commandPalette.value = true;
      }
    });
  });
</script>

<style scoped>
  .dashboard-workspace {
    display: flex;
    min-height: 100vh;
    background: #f8fafc;
  }

  .sidebar {
    width: 280px;
    background: white;
    border-right: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease;
    position: fixed;
    height: 100vh;
    z-index: 20;
  }

  .sidebar.collapsed {
    width: 80px;
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .logo-text {
    font-size: 1.25rem;
    font-weight: 700;
    color: #2d3748;
  }

  .sidebar-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .sidebar-nav {
    flex: 1;
    padding: 1rem 0;
  }

  .nav-section {
    margin-bottom: 2rem;
  }

  .section-title {
    font-size: 0.75rem;
    font-weight: 600;
    color: #a0aec0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 0 1.5rem;
    margin-bottom: 0.75rem;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.5rem;
    color: #4a5568;
    text-decoration: none;
    transition: all 0.2s ease;
    position: relative;
  }

  .nav-item:hover {
    background: #f7fafc;
    color: #2d3748;
  }

  .nav-item.active {
    background: linear-gradient(
      90deg,
      rgba(102, 126, 234, 0.1) 0%,
      transparent 100%
    );
    color: #667eea;
    border-right: 3px solid #667eea;
  }

  .nav-label {
    flex: 1;
    font-weight: 500;
  }

  .nav-badge {
    background: #667eea;
    color: white;
    font-size: 0.7rem;
    padding: 0.125rem 0.375rem;
    border-radius: 9999px;
    font-weight: 600;
    min-width: 1.25rem;
    text-align: center;
  }

  .sidebar-footer {
    padding: 1rem;
    border-top: 1px solid #e2e8f0;
  }

  .user-profile {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border-radius: 8px;
    transition: background 0.2s ease;
  }

  .user-profile:hover {
    background: #f7fafc;
  }

  .profile-avatar {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
  }

  .profile-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .profile-info {
    flex: 1;
  }

  .profile-name {
    font-weight: 600;
    color: #2d3748;
    font-size: 0.9rem;
  }

  .profile-plan {
    color: #718096;
    font-size: 0.8rem;
  }

  .main-content {
    flex: 1;
    margin-left: 280px;
    transition: all 0.3s ease;
  }

  .main-content.expanded {
    margin-left: 80px;
  }

  .content-header {
    background: white;
    border-bottom: 1px solid #e2e8f0;
    padding: 1.5rem 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .breadcrumb-item {
    color: #718096;
    font-size: 0.9rem;
  }

  .breadcrumb-item.active {
    color: #2d3748;
    font-weight: 600;
  }

  .breadcrumb-separator {
    color: #cbd5e0;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .header-btn {
    position: relative;
  }

  .notification-dot {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 8px;
    height: 8px;
    background: #ef4444;
    border-radius: 50%;
    border: 2px solid white;
  }

  .account-selector {
    min-width: 200px;
  }

  .selected-account {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .account-avatar {
    width: 24px;
    height: 24px;
    border-radius: 4px;
  }

  .account-name {
    font-weight: 500;
  }

  .dashboard-content {
    padding: 2rem;
  }

  .widget-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 2rem;
    max-width: 1600px;
    margin: 0 auto;
  }

  .widget {
    background: white;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .widget:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  .performance-widget {
    grid-column: span 8;
  }

  .timeline-widget {
    grid-column: span 8;
  }

  .actions-widget {
    grid-column: span 4;
  }

  .analytics-widget {
    grid-column: span 6;
  }

  .activity-widget {
    grid-column: span 6;
  }

  .accounts-widget {
    grid-column: span 12;
  }

  .widget-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .widget-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #2d3748;
    margin: 0;
  }

  .widget-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .widget-content {
    padding: 2rem;
  }

  .performance-metrics {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .metric-card {
    background: #f8fafc;
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid transparent;
    transition: all 0.3s ease;
  }

  .metric-card:hover {
    border-color: #e2e8f0;
    background: white;
  }

  .metric-card.positive {
    border-color: rgba(16, 185, 129, 0.3);
    background: rgba(16, 185, 129, 0.05);
  }

  .metric-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .metric-icon {
    width: 36px;
    height: 36px;
    background: white;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #667eea;
  }

  .metric-trend {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.8rem;
    color: #10b981;
    font-weight: 600;
  }

  .metric-value {
    font-size: 2rem;
    font-weight: 700;
    color: #2d3748;
    line-height: 1;
    margin-bottom: 0.5rem;
  }

  .metric-label {
    color: #718096;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .metric-chart {
    height: 40px;
  }

  .performance-chart {
    background: #f8fafc;
    border-radius: 12px;
    padding: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .timeline-view {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .timeline-header {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .timeline-nav {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .timeline-date {
    font-weight: 600;
    color: #2d3748;
    min-width: 140px;
    text-align: center;
  }

  .timeline-content {
    position: relative;
    background: #f8fafc;
    border-radius: 12px;
    padding: 1rem;
    height: 200px;
    overflow: hidden;
  }

  .timeline-hours {
    display: grid;
    grid-template-columns: repeat(24, 1fr);
    gap: 1px;
    margin-bottom: 1rem;
  }

  .hour-slot {
    text-align: center;
    padding: 0.5rem 0;
  }

  .hour-label {
    font-size: 0.7rem;
    color: #a0aec0;
  }

  .timeline-posts {
    position: relative;
    height: 120px;
  }

  .timeline-post {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }

  .timeline-post.scheduled .post-dot {
    background: #667eea;
  }
  .timeline-post.pending .post-dot {
    background: #f59e0b;
  }
  .timeline-post.draft .post-dot {
    background: #6b7280;
  }

  .post-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .post-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
  }

  .post-info {
    background: white;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    text-align: center;
    white-space: nowrap;
  }

  .post-time {
    display: block;
    font-size: 0.7rem;
    font-weight: 600;
    color: #2d3748;
  }

  .post-title {
    display: block;
    font-size: 0.7rem;
    color: #718096;
  }

  .action-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .action-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .action-item:hover {
    border-color: #cbd5e0;
    background: #f8fafc;
    transform: translateY(-1px);
  }

  .action-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .action-icon.action-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  .action-icon.action-secondary {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }
  .action-icon.action-accent {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }
  .action-icon.action-info {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  }

  .action-content {
    flex: 1;
  }

  .action-title {
    font-size: 1rem;
    font-weight: 600;
    color: #2d3748;
    margin: 0 0 0.25rem 0;
  }

  .action-description {
    color: #718096;
    font-size: 0.9rem;
    margin: 0;
  }

  .action-arrow {
    color: #cbd5e0;
    transition: all 0.3s ease;
  }

  .action-item:hover .action-arrow {
    color: #667eea;
    transform: translateX(4px);
  }

  .analytics-summary {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .summary-section {
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 1.5rem;
  }

  .summary-section:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .summary-title {
    font-size: 1rem;
    font-weight: 600;
    color: #2d3748;
    margin: 0 0 1rem 0;
  }

  .highlight-items {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .highlight-item {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .highlight-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .highlight-icon.success {
    background: #10b981;
  }
  .highlight-icon.positive {
    background: #667eea;
  }
  .highlight-icon.info {
    background: #3b82f6;
  }

  .highlight-content {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .highlight-label {
    color: #718096;
    font-size: 0.9rem;
  }

  .highlight-value {
    font-weight: 600;
    color: #2d3748;
  }

  .follower-chart {
    display: flex;
    justify-content: center;
    align-items: center;
    background: #f8fafc;
    border-radius: 8px;
    padding: 1rem;
  }

  .top-posts {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .top-post-item {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .post-thumbnail {
    width: 40px;
    height: 40px;
    border-radius: 6px;
    overflow: hidden;
    flex-shrink: 0;
  }

  .post-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .post-metrics {
    flex: 1;
  }

  .post-title {
    font-weight: 600;
    color: #2d3748;
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
  }

  .post-stats {
    display: flex;
    gap: 1rem;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.8rem;
    color: #718096;
  }

  .activity-feed {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .activity-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-radius: 8px;
    transition: background 0.2s ease;
  }

  .activity-item:hover {
    background: #f8fafc;
  }

  .activity-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
  }

  .activity-icon.success {
    background: #10b981;
  }
  .activity-icon.info {
    background: #3b82f6;
  }
  .activity-icon.warning {
    background: #f59e0b;
  }

  .activity-content {
    flex: 1;
  }

  .activity-text {
    color: #2d3748;
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
  }

  .activity-time {
    color: #a0aec0;
    font-size: 0.8rem;
  }

  .activity-preview {
    width: 40px;
    height: 40px;
    border-radius: 6px;
    overflow: hidden;
    flex-shrink: 0;
  }

  .activity-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .accounts-overview {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }

  .account-overview {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1.5rem;
    transition: all 0.3s ease;
  }

  .account-overview:hover {
    border-color: #cbd5e0;
    background: #f8fafc;
  }

  .account-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .account-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .account-avatar {
    width: 48px;
    height: 48px;
    border-radius: 8px;
  }

  .account-details {
    display: flex;
    flex-direction: column;
  }

  .account-name {
    font-weight: 600;
    color: #2d3748;
    font-size: 1rem;
    margin: 0 0 0.25rem 0;
  }

  .account-handle {
    color: #718096;
    font-size: 0.9rem;
    margin: 0;
  }

  .account-status {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .account-status.active {
    background: #10b981;
  }
  .account-status.warning {
    background: #f59e0b;
  }

  .account-metrics {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .account-metric {
    text-align: center;
  }

  .account-metric .metric-value {
    display: block;
    font-size: 1.25rem;
    font-weight: 700;
    color: #2d3748;
  }

  .account-metric .metric-label {
    display: block;
    font-size: 0.8rem;
    color: #718096;
  }

  .command-card {
    border-radius: 16px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    overflow: hidden;
  }

  .command-search {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .command-results {
    max-height: 400px;
    overflow-y: auto;
  }

  .command-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .command-item:hover {
    background: #f8fafc;
  }

  .command-icon {
    width: 32px;
    height: 32px;
    background: #f8fafc;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #667eea;
  }

  .command-content {
    flex: 1;
  }

  .command-title {
    display: block;
    font-weight: 600;
    color: #2d3748;
    font-size: 0.9rem;
  }

  .command-description {
    display: block;
    color: #718096;
    font-size: 0.8rem;
  }

  .command-shortcut {
    background: #f1f5f9;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.7rem;
    color: #64748b;
    font-family: 'Monaco', 'Menlo', monospace;
  }

  @media (max-width: 1200px) {
    .performance-widget,
    .timeline-widget {
      grid-column: span 12;
    }

    .actions-widget,
    .analytics-widget,
    .activity-widget {
      grid-column: span 6;
    }
  }

  @media (max-width: 768px) {
    .sidebar {
      transform: translateX(-100%);
    }

    .sidebar.collapsed {
      transform: translateX(0);
    }

    .main-content {
      margin-left: 0;
    }

    .main-content.expanded {
      margin-left: 80px;
    }

    .widget {
      grid-column: span 12 !important;
    }

    .performance-metrics {
      grid-template-columns: repeat(2, 1fr);
    }

    .header-actions {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
</style>
