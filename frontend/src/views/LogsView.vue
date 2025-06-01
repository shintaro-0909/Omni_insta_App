<template>
  <div class="logs-view">
    <v-container>
      <!-- 📊 ページヘッダー -->
      <v-row class="mb-6">
        <v-col cols="12">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon
                icon="mdi-chart-line"
                size="32"
                color="primary"
                class="mr-3"
              />
              <div>
                <h1 class="text-h3 font-weight-bold">ログダッシュボード</h1>
                <p class="text-subtitle-1 text-grey-darken-1 mt-1">
                  投稿実行履歴と統計情報を確認
                </p>
              </div>
            </div>

            <div class="d-flex ga-3">
              <v-btn
                color="primary"
                variant="outlined"
                prepend-icon="mdi-refresh"
                @click="refreshData"
                :loading="logsStore.loading"
              >
                更新
              </v-btn>

              <v-btn
                color="success"
                variant="elevated"
                prepend-icon="mdi-download"
                @click="exportLogs"
              >
                エクスポート
              </v-btn>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- 📈 統計カード -->
      <v-row class="mb-6">
        <v-col
          v-for="stat in statsCards"
          :key="stat.title"
          cols="12"
          sm="6"
          md="3"
        >
          <v-card
            class="stat-card"
            :class="stat.gradient"
            elevation="4"
            rounded="xl"
          >
            <v-card-text class="pa-6">
              <div class="stat-card-content">
                <div class="stat-icon-wrapper">
                  <v-icon
                    :icon="stat.icon"
                    size="28"
                    color="white"
                    class="stat-icon"
                  />
                </div>

                <div class="stat-info">
                  <div class="stat-value">{{ stat.value }}</div>
                  <div class="stat-title">{{ stat.title }}</div>
                  <div v-if="stat.subtitle" class="stat-subtitle">
                    {{ stat.subtitle }}
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- 📊 グラフセクション -->
      <v-row class="mb-6">
        <v-col cols="12" md="8">
          <v-card class="chart-card" elevation="0" rounded="xl">
            <v-card-title class="chart-header">
              <div class="d-flex align-center justify-space-between w-100">
                <div class="d-flex align-center">
                  <v-icon icon="mdi-chart-bar" class="mr-3" />
                  日別実行統計
                </div>
                <v-select
                  v-model="chartDays"
                  :items="chartDaysOptions"
                  variant="outlined"
                  density="compact"
                  style="max-width: 120px"
                  @update:model-value="updateChart"
                />
              </div>
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-6">
              <div v-if="logsStore.loading" class="text-center pa-8">
                <v-progress-circular indeterminate color="primary" size="48" />
                <div class="mt-4">グラフを読み込み中...</div>
              </div>
              <canvas v-else ref="chartCanvas" style="max-height: 300px" />
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="status-card" elevation="0" rounded="xl">
            <v-card-title class="status-header">
              <v-icon icon="mdi-pie-chart" class="mr-3" />
              実行状況
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-6">
              <div v-if="logsStore.stats" class="status-content">
                <div class="status-item">
                  <div class="d-flex align-center justify-space-between mb-2">
                    <span class="status-label">
                      <v-icon
                        icon="mdi-check-circle"
                        color="success"
                        size="16"
                        class="mr-1"
                      />
                      成功
                    </span>
                    <span class="status-value">{{
                      logsStore.stats.success
                    }}</span>
                  </div>
                  <v-progress-linear
                    :model-value="successPercentage"
                    color="success"
                    height="6"
                    rounded
                  />
                </div>

                <div class="status-item mt-4">
                  <div class="d-flex align-center justify-space-between mb-2">
                    <span class="status-label">
                      <v-icon
                        icon="mdi-close-circle"
                        color="error"
                        size="16"
                        class="mr-1"
                      />
                      失敗
                    </span>
                    <span class="status-value">{{
                      logsStore.stats.failed
                    }}</span>
                  </div>
                  <v-progress-linear
                    :model-value="failurePercentage"
                    color="error"
                    height="6"
                    rounded
                  />
                </div>

                <div class="status-item mt-4">
                  <div class="d-flex align-center justify-space-between mb-2">
                    <span class="status-label">
                      <v-icon
                        icon="mdi-refresh"
                        color="warning"
                        size="16"
                        class="mr-1"
                      />
                      リトライ中
                    </span>
                    <span class="status-value">{{
                      logsStore.stats.retrying
                    }}</span>
                  </div>
                  <v-progress-linear
                    :model-value="retryingPercentage"
                    color="warning"
                    height="6"
                    rounded
                  />
                </div>

                <v-divider class="my-4" />

                <div class="success-rate-display">
                  <div class="text-center">
                    <div class="success-rate-number">
                      {{ logsStore.successRate }}%
                    </div>
                    <div class="success-rate-label">全体成功率</div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- 🔍 フィルター -->
      <v-row class="mb-4">
        <v-col cols="12" md="3">
          <v-text-field
            v-model="searchQuery"
            label="検索"
            variant="outlined"
            prepend-inner-icon="mdi-magnify"
            clearable
            density="compact"
            placeholder="エラー内容、投稿IDで検索"
          />
        </v-col>

        <v-col cols="12" md="2">
          <v-select
            v-model="statusFilter"
            :items="statusFilterOptions"
            label="ステータス"
            variant="outlined"
            density="compact"
            clearable
            prepend-inner-icon="mdi-filter"
          />
        </v-col>

        <v-col cols="12" md="2">
          <v-select
            v-model="timeFilter"
            :items="timeFilterOptions"
            label="期間"
            variant="outlined"
            density="compact"
            clearable
            prepend-inner-icon="mdi-calendar"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-select
            v-model="accountFilter"
            :items="accountFilterOptions"
            label="アカウント"
            variant="outlined"
            density="compact"
            clearable
            prepend-inner-icon="mdi-account"
          />
        </v-col>

        <v-col cols="12" md="2">
          <v-btn
            variant="outlined"
            block
            @click="clearFilters"
            prepend-icon="mdi-filter-remove"
          >
            クリア
          </v-btn>
        </v-col>
      </v-row>

      <!-- 📋 ログ一覧 -->
      <v-row>
        <v-col cols="12">
          <v-card class="logs-list-card" elevation="0" rounded="xl">
            <v-card-title class="logs-list-header">
              <div class="d-flex align-center justify-space-between w-100">
                <div class="d-flex align-center">
                  <v-icon icon="mdi-format-list-bulleted" class="mr-3" />
                  実行ログ一覧
                </div>
                <v-chip variant="outlined" size="small">
                  {{ filteredLogs.length }}件
                </v-chip>
              </div>
            </v-card-title>

            <v-divider />

            <!-- エラー表示 -->
            <v-alert
              v-if="logsStore.error"
              type="error"
              variant="tonal"
              class="ma-4"
              closable
              @click:close="logsStore.clearError"
            >
              {{ logsStore.error }}
            </v-alert>

            <!-- ローディング -->
            <div
              v-if="logsStore.loading && filteredLogs.length === 0"
              class="text-center pa-8"
            >
              <v-progress-circular indeterminate color="primary" size="64" />
              <div class="mt-4 text-subtitle-1">ログを読み込み中...</div>
            </div>

            <!-- 空の状態 -->
            <div v-else-if="filteredLogs.length === 0" class="text-center pa-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">
                mdi-file-document-outline
              </v-icon>
              <div class="text-h6 mb-2">
                {{ hasFilters ? '検索結果がありません' : 'ログがありません' }}
              </div>
              <div class="text-subtitle-1 text-medium-emphasis mb-4">
                {{
                  hasFilters
                    ? 'フィルター条件を変更してください'
                    : 'まだ投稿が実行されていません'
                }}
              </div>
            </div>

            <!-- ログリスト -->
            <div v-else>
              <v-list>
                <template v-for="(log, index) in filteredLogs" :key="log.id">
                  <v-list-item class="log-item pa-4">
                    <!-- ログ情報 -->
                    <template #prepend>
                      <v-avatar
                        :color="logsStore.getStatusColor(log.status)"
                        size="48"
                        class="log-status-avatar"
                      >
                        <v-icon
                          :icon="getStatusIcon(log.status)"
                          color="white"
                        />
                      </v-avatar>
                    </template>

                    <div class="log-info">
                      <v-list-item-title class="text-h6 mb-1">
                        {{ logsStore.getStatusText(log.status) }}
                        <v-chip
                          size="x-small"
                          :color="logsStore.getStatusColor(log.status)"
                          variant="outlined"
                          class="ml-2"
                        >
                          {{ log.status }}
                        </v-chip>
                      </v-list-item-title>

                      <v-list-item-subtitle class="mb-2">
                        <div class="d-flex align-center flex-wrap ga-2">
                          <v-chip size="small" variant="outlined">
                            {{ logsStore.formatLogDate(log.executedAt) }}
                          </v-chip>
                          <v-chip
                            v-if="log.instagramPostId"
                            size="small"
                            variant="outlined"
                            prepend-icon="mdi-instagram"
                          >
                            {{ log.instagramPostId }}
                          </v-chip>
                          <v-chip
                            v-if="log.retryCount > 0"
                            size="small"
                            color="warning"
                            variant="tonal"
                          >
                            リトライ {{ log.retryCount }}回
                          </v-chip>
                        </div>
                      </v-list-item-subtitle>

                      <div class="log-details">
                        <div class="d-flex align-center ga-4">
                          <div class="log-metric">
                            <v-icon icon="mdi-account" size="16" class="mr-1" />
                            アカウント: {{ getAccountName(log.igAccountId) }}
                          </div>
                          <div class="log-metric">
                            <v-icon
                              icon="mdi-calendar"
                              size="16"
                              class="mr-1"
                            />
                            スケジュール:
                            {{ log.scheduleId.substring(0, 8) }}...
                          </div>
                        </div>

                        <!-- エラー詳細 -->
                        <div v-if="log.error" class="error-details mt-2">
                          <v-alert
                            type="error"
                            variant="tonal"
                            density="compact"
                            class="text-caption"
                          >
                            <strong>エラー:</strong> {{ log.error }}
                          </v-alert>
                        </div>

                        <!-- 次回リトライ時刻 -->
                        <div v-if="log.nextRetryAt" class="retry-info mt-2">
                          <v-chip
                            size="small"
                            color="warning"
                            variant="tonal"
                            prepend-icon="mdi-clock"
                          >
                            次回リトライ:
                            {{ logsStore.formatLogDate(log.nextRetryAt) }}
                          </v-chip>
                        </div>
                      </div>
                    </div>

                    <!-- アクション -->
                    <template #append>
                      <div class="d-flex flex-column ga-2">
                        <v-btn
                          v-if="log.instagramPostId"
                          icon="mdi-open-in-new"
                          variant="text"
                          size="small"
                          color="primary"
                          @click="openInstagramPost(log.instagramPostId)"
                        />
                        <v-btn
                          icon="mdi-information"
                          variant="text"
                          size="small"
                          color="info"
                          @click="showLogDetails(log)"
                        />
                      </div>
                    </template>
                  </v-list-item>

                  <v-divider v-if="index < filteredLogs.length - 1" />
                </template>
              </v-list>

              <!-- もっと読み込む -->
              <div v-if="logsStore.hasMore" class="text-center pa-4">
                <v-btn
                  variant="outlined"
                  @click="loadMoreLogs"
                  :loading="logsStore.loading"
                  prepend-icon="mdi-chevron-down"
                >
                  もっと読み込む
                </v-btn>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- ログ詳細ダイアログ -->
    <v-dialog v-model="showDetailsDialog" max-width="600px">
      <v-card v-if="selectedLog">
        <v-card-title class="text-h5">
          <v-icon
            :icon="getStatusIcon(selectedLog.status)"
            :color="logsStore.getStatusColor(selectedLog.status)"
            class="mr-2"
          />
          ログ詳細
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="12" md="6">
              <div class="detail-item">
                <strong>ステータス:</strong>
                <v-chip
                  size="small"
                  :color="logsStore.getStatusColor(selectedLog.status)"
                  variant="tonal"
                  class="ml-2"
                >
                  {{ logsStore.getStatusText(selectedLog.status) }}
                </v-chip>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="detail-item">
                <strong>実行日時:</strong><br />
                {{ logsStore.formatLogDate(selectedLog.executedAt) }}
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="detail-item">
                <strong>リトライ回数:</strong> {{ selectedLog.retryCount }}回
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="detail-item">
                <strong>スケジュールID:</strong><br />
                <code>{{ selectedLog.scheduleId }}</code>
              </div>
            </v-col>
            <v-col cols="12">
              <div class="detail-item">
                <strong>アカウントID:</strong><br />
                <code>{{ selectedLog.igAccountId }}</code>
              </div>
            </v-col>
            <v-col v-if="selectedLog.instagramPostId" cols="12">
              <div class="detail-item">
                <strong>Instagram投稿ID:</strong><br />
                <code>{{ selectedLog.instagramPostId }}</code>
              </div>
            </v-col>
            <v-col v-if="selectedLog.error" cols="12">
              <div class="detail-item">
                <strong>エラー詳細:</strong><br />
                <v-alert type="error" variant="tonal" class="mt-2">
                  {{ selectedLog.error }}
                </v-alert>
              </div>
            </v-col>
            <v-col v-if="selectedLog.nextRetryAt" cols="12">
              <div class="detail-item">
                <strong>次回リトライ予定:</strong><br />
                {{ logsStore.formatLogDate(selectedLog.nextRetryAt) }}
              </div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDetailsDialog = false">
            閉じる
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, nextTick, watch } from 'vue';
  import {
    useLogsStore,
    useIgAccountsStore,
    type ExecutionLog,
    type LogFilters,
  } from '@/stores';
  import { Chart, registerables } from 'chart.js';

  // Chart.jsの登録
  Chart.register(...registerables);

  // Stores
  const logsStore = useLogsStore();
  const igAccountsStore = useIgAccountsStore();

  // State
  const searchQuery = ref('');
  const statusFilter = ref<string | null>(null);
  const timeFilter = ref<string | null>(null);
  const accountFilter = ref<string | null>(null);
  const chartDays = ref(7);
  const showDetailsDialog = ref(false);
  const selectedLog = ref<ExecutionLog | null>(null);

  // Chart
  const chartCanvas = ref<HTMLCanvasElement | null>(null);
  let chart: Chart | null = null;

  // フィルターオプション
  const statusFilterOptions = [
    { title: '成功', value: 'success' },
    { title: '失敗', value: 'failed' },
    { title: 'リトライ中', value: 'retrying' },
  ];

  const timeFilterOptions = [
    { title: '過去24時間', value: '24h' },
    { title: '過去7日', value: '7d' },
    { title: '過去30日', value: '30d' },
  ];

  const chartDaysOptions = [
    { title: '7日', value: 7 },
    { title: '14日', value: 14 },
    { title: '30日', value: 30 },
  ];

  // Computed
  const accountFilterOptions = computed(() => {
    return igAccountsStore.accounts.map(account => ({
      title: account.name || account.username,
      value: account.id,
    }));
  });

  const hasFilters = computed(() => {
    return !!(
      searchQuery.value ||
      statusFilter.value ||
      timeFilter.value ||
      accountFilter.value
    );
  });

  const currentFilters = computed((): LogFilters => {
    const filters: LogFilters = {};

    if (statusFilter.value) {
      filters.status = statusFilter.value as 'success' | 'failed' | 'retrying';
    }

    if (accountFilter.value) {
      filters.igAccountId = accountFilter.value;
    }

    if (timeFilter.value) {
      const now = new Date();
      switch (timeFilter.value) {
        case '24h':
          filters.last24Hours = true;
          break;
        case '7d':
          filters.dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          filters.dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }
    }

    return filters;
  });

  const filteredLogs = computed(() => {
    let filtered = [...logsStore.logs];

    // テキスト検索
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      filtered = filtered.filter(
        log =>
          log.error?.toLowerCase().includes(query) ||
          log.instagramPostId?.toLowerCase().includes(query) ||
          log.scheduleId.toLowerCase().includes(query)
      );
    }

    return filtered;
  });

  const statsCards = computed(() => {
    if (!logsStore.stats) return [];

    return [
      {
        title: '総実行数',
        value: logsStore.stats.total.toString(),
        icon: 'mdi-play-circle',
        gradient: 'gradient-primary',
      },
      {
        title: '成功数',
        value: logsStore.stats.success.toString(),
        subtitle: `成功率: ${logsStore.successRate}%`,
        icon: 'mdi-check-circle',
        gradient: 'gradient-success',
      },
      {
        title: '失敗数',
        value: logsStore.stats.failed.toString(),
        subtitle: `失敗率: ${logsStore.failureRate}%`,
        icon: 'mdi-close-circle',
        gradient: 'gradient-error',
      },
      {
        title: '24時間以内',
        value: logsStore.stats.last24Hours.total.toString(),
        subtitle: `成功率: ${logsStore.last24HoursSuccessRate}%`,
        icon: 'mdi-clock',
        gradient: 'gradient-warning',
      },
    ];
  });

  const successPercentage = computed(() => {
    if (!logsStore.stats || logsStore.stats.total === 0) return 0;
    return (logsStore.stats.success / logsStore.stats.total) * 100;
  });

  const failurePercentage = computed(() => {
    if (!logsStore.stats || logsStore.stats.total === 0) return 0;
    return (logsStore.stats.failed / logsStore.stats.total) * 100;
  });

  const retryingPercentage = computed(() => {
    if (!logsStore.stats || logsStore.stats.total === 0) return 0;
    return (logsStore.stats.retrying / logsStore.stats.total) * 100;
  });

  // Methods
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return 'mdi-check';
      case 'failed':
        return 'mdi-close';
      case 'retrying':
        return 'mdi-refresh';
      default:
        return 'mdi-help';
    }
  };

  const getAccountName = (accountId: string) => {
    const account = igAccountsStore.accounts.find(acc => acc.id === accountId);
    return account?.name || account?.username || 'Unknown';
  };

  const refreshData = async () => {
    await logsStore.refreshData(currentFilters.value);
    updateChart();
  };

  const loadMoreLogs = async () => {
    await logsStore.loadMoreLogs(currentFilters.value);
  };

  const clearFilters = () => {
    searchQuery.value = '';
    statusFilter.value = null;
    timeFilter.value = null;
    accountFilter.value = null;
  };

  const showLogDetails = (log: ExecutionLog) => {
    selectedLog.value = log;
    showDetailsDialog.value = true;
  };

  const openInstagramPost = (postId: string) => {
    window.open(`https://www.instagram.com/p/${postId}`, '_blank');
  };

  const exportLogs = () => {
    // CSV エクスポート機能
    const headers = [
      '実行日時',
      'ステータス',
      'アカウント',
      'スケジュールID',
      'エラー',
    ];
    const csvContent = [
      headers.join(','),
      ...filteredLogs.value.map(log =>
        [
          logsStore.formatLogDate(log.executedAt),
          logsStore.getStatusText(log.status),
          getAccountName(log.igAccountId),
          log.scheduleId,
          log.error || '',
        ]
          .map(field => `"${field}"`)
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `execution_logs_${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const updateChart = async () => {
    await logsStore.fetchDailyStats(chartDays.value);
    await nextTick();
    createChart();
  };

  const createChart = () => {
    if (!chartCanvas.value || !logsStore.dailyStats.length) return;

    // 既存のチャートを破棄
    if (chart) {
      chart.destroy();
    }

    const ctx = chartCanvas.value.getContext('2d');
    if (!ctx) return;

    const labels = logsStore.dailyStats.map(stat => {
      const date = new Date(stat.date);
      return date.toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
      });
    });

    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: '成功',
            data: logsStore.dailyStats.map(stat => stat.success),
            backgroundColor: '#4CAF50',
            borderColor: '#4CAF50',
            borderWidth: 1,
          },
          {
            label: '失敗',
            data: logsStore.dailyStats.map(stat => stat.failed),
            backgroundColor: '#F44336',
            borderColor: '#F44336',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
          },
        },
      },
    });
  };

  // Watchers
  watch(
    currentFilters,
    async newFilters => {
      await logsStore.fetchLogs(newFilters, true);
    },
    { deep: true }
  );

  // Lifecycle
  onMounted(async () => {
    await Promise.all([
      logsStore.refreshData(),
      igAccountsStore.fetchAccounts(),
    ]);

    await nextTick();
    createChart();
  });
</script>

<style scoped>
  /* 🎨 ログダッシュボードのスタイル */

  .logs-view {
    min-height: 100vh;
    background: linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%);
  }

  /* 統計カード */
  .stat-card {
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(20px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
  }

  .stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  }

  .gradient-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .gradient-success {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    color: white;
  }

  .gradient-error {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
  }

  .gradient-warning {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    color: white;
  }

  .stat-card-content {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .stat-icon-wrapper {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 10px;
    backdrop-filter: blur(10px);
  }

  .stat-info {
    flex: 1;
  }

  .stat-value {
    font-size: 1.8rem;
    font-weight: 800;
    margin-bottom: 0.25rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .stat-title {
    font-size: 0.85rem;
    opacity: 0.9;
    font-weight: 500;
  }

  .stat-subtitle {
    font-size: 0.75rem;
    opacity: 0.8;
    margin-top: 2px;
  }

  /* チャートカード */
  .chart-card,
  .status-card {
    background: white;
    border: 1px solid #e2e8f0;
  }

  .chart-header,
  .status-header {
    background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
    border-bottom: 1px solid #e2e8f0;
    padding: 20px 24px;
    font-weight: 600;
    color: #2c3e50;
  }

  /* ステータスカード */
  .status-content {
    padding: 8px 0;
  }

  .status-item {
    margin-bottom: 16px;
  }

  .status-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #64748b;
  }

  .status-value {
    font-size: 0.875rem;
    font-weight: 600;
    color: #1e293b;
  }

  .success-rate-display {
    padding: 16px;
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border-radius: 12px;
    border: 1px solid #b3e5fc;
  }

  .success-rate-number {
    font-size: 2rem;
    font-weight: 800;
    color: #0277bd;
    margin-bottom: 4px;
  }

  .success-rate-label {
    font-size: 0.75rem;
    color: #0277bd;
    font-weight: 500;
  }

  /* ログリスト */
  .logs-list-card {
    background: white;
    border: 1px solid #e2e8f0;
  }

  .logs-list-header {
    background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
    border-bottom: 1px solid #e2e8f0;
    padding: 20px 24px;
    font-weight: 600;
    color: #2c3e50;
  }

  .log-item {
    transition: all 0.3s ease;
    border-radius: 0;
  }

  .log-item:hover {
    background: rgba(102, 126, 234, 0.04);
  }

  .log-status-avatar {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .log-info {
    flex: 1;
  }

  .log-details {
    margin-top: 8px;
  }

  .log-metric {
    display: flex;
    align-items: center;
    font-size: 0.875rem;
    color: #64748b;
  }

  .error-details {
    margin-top: 8px;
  }

  .retry-info {
    margin-top: 8px;
  }

  /* 詳細ダイアログ */
  .detail-item {
    margin-bottom: 16px;
    font-size: 0.875rem;
  }

  .detail-item strong {
    color: #1e293b;
  }

  .detail-item code {
    background: #f1f5f9;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.8rem;
  }

  /* アニメーション */
  .stat-card {
    animation: fadeInUp 0.6s ease-out;
  }

  .log-item {
    animation: fadeInLeft 0.4s ease-out;
  }

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

  @keyframes fadeInLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  /* レスポンシブ */
  @media (max-width: 768px) {
    .stat-card-content {
      flex-direction: column;
      text-align: center;
      gap: 0.5rem;
    }

    .log-info {
      margin-left: 0;
    }

    .log-details {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }
  }
</style>
