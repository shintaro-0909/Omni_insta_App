<template>
  <div class="schedules-view">
    <!-- 統一ナビゲーション -->
    <nav class="omniy-nav">
      <div class="nav-container">
        <div class="logo">Omniy</div>
        <div class="nav-links">
          <router-link to="/dashboard" class="nav-link">ダッシュボード</router-link>
          <router-link to="/schedules" class="nav-link">予約管理</router-link>
          <router-link to="/accounts" class="nav-link">アカウント</router-link>
          <router-link to="/content" class="nav-link">コンテンツ</router-link>
          <router-link to="/settings" class="nav-link">設定</router-link>
          <router-link to="/billing" class="cta-button">プラン管理</router-link>
        </div>
      </div>
    </nav>

    <!-- ヒーローセクション -->
    <section class="hero">
      <div class="floating-elements">
        <div class="floating-circle circle-1"></div>
        <div class="floating-circle circle-2"></div>
        <div class="floating-circle circle-3"></div>
      </div>

      <div class="hero-container">
        <div class="hero-content">
          <h1>Instagram <span class="gradient-text">スケジュール管理</span></h1>
          <p class="hero-description">
            投稿予約の作成、編集、管理をスマートに。
            AIが最適化した投稿スケジュールで効果を最大化しましょう。
          </p>
          <div class="hero-actions">
            <button class="cta-button primary" @click="openCreateDialog">
              ➕ 新しいスケジュール作成
            </button>
          </div>
        </div>

        <div class="hero-visual">
          <div class="schedule-phone-mockup">
            <div class="phone-screen">
              <div class="schedule-header">
                <span class="schedule-logo">📅 スケジュール</span>
                <span>⚡</span>
              </div>
              <div class="schedule-demo-content">
                <div class="demo-schedule-item">
                  <div class="schedule-status active"></div>
                  <div class="schedule-info">
                    <div class="schedule-title">新商品紹介投稿</div>
                    <div class="schedule-time">今日 18:00</div>
                  </div>
                </div>
                <div class="demo-schedule-item">
                  <div class="schedule-status pending"></div>
                  <div class="schedule-info">
                    <div class="schedule-title">週末セール告知</div>
                    <div class="schedule-time">明日 10:00</div>
                  </div>
                </div>
                <div class="demo-schedule-item">
                  <div class="schedule-status recurring"></div>
                  <div class="schedule-info">
                    <div class="schedule-title">毎週の定期投稿</div>
                    <div class="schedule-time">月曜 09:00</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="schedules-content">
      <!-- 統計情報セクション -->
      <section class="stats-section">
        <div class="section-header">
          <h2 class="section-title">📊 スケジュール統計</h2>
          <p class="section-description">現在のスケジュール状況をひと目で確認</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card gradient-primary">
            <div class="stat-icon">📅</div>
            <div class="stat-content">
              <div class="stat-value">{{ schedulesStore.schedulesCount.total }}</div>
              <div class="stat-title">総スケジュール</div>
              <div class="stat-trend">
                <span class="trend-positive">全体管理中</span>
              </div>
            </div>
          </div>

          <div class="stat-card gradient-success">
            <div class="stat-icon">▶️</div>
            <div class="stat-content">
              <div class="stat-value">{{ schedulesStore.schedulesCount.active }}</div>
              <div class="stat-title">アクティブ</div>
              <div class="stat-trend">
                <span class="trend-positive">実行中</span>
              </div>
            </div>
          </div>

          <div class="stat-card gradient-info">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <div class="stat-value">{{ schedulesStore.schedulesCount.completed }}</div>
              <div class="stat-title">完了済み</div>
              <div class="stat-trend">
                <span class="trend-neutral">投稿完了</span>
              </div>
            </div>
          </div>

          <div class="stat-card gradient-warning">
            <div class="stat-icon">⚠️</div>
            <div class="stat-content">
              <div class="stat-value">{{ schedulesStore.schedulesCount.error }}</div>
              <div class="stat-title">エラー</div>
              <div class="stat-trend">
                <span class="trend-negative">要確認</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- フィルターセクション -->
      <section class="filters-section">
        <div class="filters-container">
          <div class="filter-group">
            <label class="filter-label">ステータス</label>
            <select 
              v-model="statusFilter" 
              class="filter-select"
              @change="applyFilters"
            >
              <option value="">すべて</option>
              <option value="active">アクティブ</option>
              <option value="paused">一時停止</option>
              <option value="error">エラー</option>
              <option value="completed">完了</option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">投稿タイプ</label>
            <select 
              v-model="typeFilter" 
              class="filter-select"
              @change="applyFilters"
            >
              <option value="">すべて</option>
              <option value="one_time">一回限り</option>
              <option value="recurring">繰返</option>
              <option value="random">ランダム</option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">アカウント</label>
            <select 
              v-model="igAccountFilter" 
              class="filter-select"
              @change="applyFilters"
            >
              <option value="">すべて</option>
              <option 
                v-for="account in igAccountItems" 
                :key="account.value" 
                :value="account.value"
              >
                {{ account.title }}
              </option>
            </select>
          </div>

          <button class="filter-clear-button" @click="clearFilters">
            🗑️ フィルタークリア
          </button>
        </div>
      </section>

      <!-- スケジュール一覧セクション -->
      <section class="schedules-list-section">
        <div class="section-header">
          <h2 class="section-title">📋 スケジュール一覧</h2>
        </div>

        <!-- エラー表示 -->
        <div v-if="schedulesStore.error" class="error-alert">
          <div class="error-content">
            <span class="error-icon">⚠️</span>
            <span class="error-text">{{ schedulesStore.error }}</span>
            <button class="error-close" @click="schedulesStore.clearError">✕</button>
          </div>
        </div>

        <!-- ローディング -->
        <div 
          v-if="schedulesStore.loading && schedules.length === 0" 
          class="loading-state"
        >
          <div class="loading-spinner"></div>
          <div class="loading-text">スケジュールを読み込み中...</div>
        </div>

        <!-- 空の状態 -->
        <div v-else-if="schedules.length === 0" class="empty-state">
          <div class="empty-icon">📅</div>
          <div class="empty-title">スケジュールがありません</div>
          <div class="empty-description">
            新しいスケジュールを作成して、Instagram投稿を自動化しましょう
          </div>
          <button class="cta-button primary" @click="openCreateDialog">
            ➕ 最初のスケジュールを作成
          </button>
        </div>

        <!-- スケジュールリスト -->
        <div v-else class="schedules-list">
          <div 
            v-for="schedule in schedules" 
            :key="schedule.id" 
            class="schedule-item"
            @click="viewSchedule(schedule)"
          >
            <div class="schedule-status-indicator" :class="`status-${schedule.status}`"></div>
            
            <div class="schedule-main-content">
              <div class="schedule-header-row">
                <h3 class="schedule-title">{{ schedule.title }}</h3>
                <div class="schedule-actions">
                  <button 
                    class="action-button edit"
                    @click.stop="editSchedule(schedule)"
                    title="編集"
                  >
                    ✏️
                  </button>
                  <button 
                    class="action-button delete"
                    @click.stop="confirmDelete(schedule)"
                    title="削除"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div class="schedule-details">
                <div class="schedule-badges">
                  <span class="type-badge" :class="`type-${schedule.type}`">
                    {{ getTypeIcon(schedule.type) }} {{ getTypeText(schedule.type) }}
                  </span>
                  <span class="status-badge" :class="`status-${schedule.status}`">
                    {{ getStatusIcon(schedule.status) }} {{ getStatusText(schedule.status) }}
                  </span>
                  <span class="account-badge">
                    📷 @{{ schedule.igAccount?.username }}
                  </span>
                </div>

                <div class="schedule-info-row">
                  <div class="schedule-time-info">
                    <span class="time-label">次回実行:</span>
                    <span class="time-value">{{ formatNextRun(schedule.nextRunAt) }}</span>
                  </div>
                  <div class="schedule-run-count">
                    <span class="run-label">実行回数:</span>
                    <span class="run-value">{{ schedule.runCount }}回</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 無限スクロール -->
          <div 
            v-if="schedulesStore.hasMore" 
            class="load-more-section"
            v-intersect="loadMore"
          >
            <div v-if="schedulesStore.loading" class="loading-more">
              <div class="loading-spinner small"></div>
              <span>読み込み中...</span>
            </div>
            <button v-else class="load-more-button" @click="loadMore">
              さらに読み込む
            </button>
          </div>
        </div>
      </section>
    </div>

    <!-- ダイアログ -->
    <ScheduleFormDialog
      v-model="showFormDialog"
      :schedule="editingSchedule"
      @saved="onScheduleSaved"
    />

    <ScheduleViewDialog
      v-model="showViewDialog"
      :schedule="viewingSchedule"
      @edit="onEditFromView"
    />

    <!-- 削除確認ダイアログ -->
    <div v-if="showDeleteDialog" class="modal-overlay" @click="showDeleteDialog = false">
      <div class="delete-dialog" @click.stop>
        <div class="dialog-header">
          <h3 class="dialog-title">スケジュール削除</h3>
        </div>
        <div class="dialog-content">
          <p class="dialog-message">
            「{{ deletingSchedule?.title }}」を削除しますか？<br>
            この操作は取り消せません。
          </p>
        </div>
        <div class="dialog-actions">
          <button 
            class="dialog-button secondary" 
            @click="showDeleteDialog = false"
          >
            キャンセル
          </button>
          <button 
            class="dialog-button danger" 
            @click="deleteSchedule"
            :disabled="deleting"
          >
            <span v-if="deleting">削除中...</span>
            <span v-else>削除</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import {
    useSchedulesStore,
    useIgAccountsStore,
    type Schedule,
    type ScheduleStatus,
    type ScheduleType,
  } from '@/stores';
  import { ScheduleFormDialog, ScheduleViewDialog } from '@/components';

  // Stores
  const schedulesStore = useSchedulesStore();
  const igAccountsStore = useIgAccountsStore();

  // Reactive data
  const statusFilter = ref<ScheduleStatus | null>(null);
  const typeFilter = ref<ScheduleType | null>(null);
  const igAccountFilter = ref<string | null>(null);

  const showFormDialog = ref(false);
  const showViewDialog = ref(false);
  const showDeleteDialog = ref(false);

  const editingSchedule = ref<Schedule | undefined>(undefined);
  const viewingSchedule = ref<Schedule | undefined>(undefined);
  const deletingSchedule = ref<Schedule | undefined>(undefined);
  const deleting = ref(false);

  // Computed
  const schedules = computed(() => schedulesStore.schedules);

  const statusItems = [
    { title: 'アクティブ', value: 'active' },
    { title: '一時停止', value: 'paused' },
    { title: 'エラー', value: 'error' },
    { title: '完了', value: 'completed' },
  ];

  const typeItems = [
    { title: '一回限り投稿', value: 'one_time' },
    { title: '繰返投稿', value: 'recurring' },
    { title: 'ランダム投稿', value: 'random' },
  ];

  const igAccountItems = computed(() =>
    igAccountsStore.accounts.map((account: any) => ({
      title: `@${account.username}`,
      value: account.id,
    }))
  );

  // Methods
  const openCreateDialog = () => {
    editingSchedule.value = undefined;
    showFormDialog.value = true;
  };

  const editSchedule = (schedule: Schedule) => {
    editingSchedule.value = schedule;
    showFormDialog.value = true;
  };

  const viewSchedule = (schedule: Schedule) => {
    viewingSchedule.value = schedule;
    showViewDialog.value = true;
  };

  const onEditFromView = (schedule: Schedule) => {
    showViewDialog.value = false;
    setTimeout(() => {
      editingSchedule.value = schedule;
      showFormDialog.value = true;
    }, 300);
  };

  const confirmDelete = (schedule: Schedule) => {
    deletingSchedule.value = schedule;
    showDeleteDialog.value = true;
  };

  const deleteSchedule = async () => {
    if (!deletingSchedule.value) return;

    try {
      deleting.value = true;
      await schedulesStore.deleteSchedule(
        deletingSchedule.value.id,
        deletingSchedule.value.igAccount?.id || ''
      );
      showDeleteDialog.value = false;
      deletingSchedule.value = undefined;
    } catch (error) {
      console.error('Error deleting schedule:', error);
    } finally {
      deleting.value = false;
    }
  };

  const onScheduleSaved = () => {
    // フォームダイアログが閉じられた後、リストを更新
    editingSchedule.value = undefined;
  };

  const applyFilters = async () => {
    const filters: any = {};

    if (statusFilter.value) {
      filters.status = statusFilter.value;
    }

    if (typeFilter.value) {
      filters.type = typeFilter.value;
    }

    if (igAccountFilter.value) {
      filters.igAccountId = igAccountFilter.value;
    }

    await schedulesStore.fetchSchedules(true, filters);
  };

  const clearFilters = async () => {
    statusFilter.value = null;
    typeFilter.value = null;
    igAccountFilter.value = null;
    await schedulesStore.fetchSchedules(true);
  };

  const loadMore = async () => {
    if (schedulesStore.loading || !schedulesStore.hasMore) return;

    const filters: any = {};

    if (statusFilter.value) {
      filters.status = statusFilter.value;
    }

    if (typeFilter.value) {
      filters.type = typeFilter.value;
    }

    if (igAccountFilter.value) {
      filters.igAccountId = igAccountFilter.value;
    }

    await schedulesStore.fetchSchedules(false, filters);
  };

  // Utility functions
  const getStatusColor = (status: ScheduleStatus): string => {
    switch (status) {
      case 'active':
        return 'success';
      case 'paused':
        return 'warning';
      case 'error':
        return 'error';
      case 'completed':
        return 'info';
      default:
        return 'grey';
    }
  };

  const getStatusIcon = (status: ScheduleStatus): string => {
    switch (status) {
      case 'active':
        return '▶️';
      case 'paused':
        return '⏸️';
      case 'error':
        return '⚠️';
      case 'completed':
        return '✅';
      default:
        return '❓';
    }
  };

  const getTypeIcon = (type: ScheduleType): string => {
    switch (type) {
      case 'one_time':
        return '⏰';
      case 'recurring':
        return '🔄';
      case 'random':
        return '🎲';
      default:
        return '📅';
    }
  };

  const getStatusText = (status: ScheduleStatus): string => {
    switch (status) {
      case 'active':
        return 'アクティブ';
      case 'paused':
        return '一時停止';
      case 'error':
        return 'エラー';
      case 'completed':
        return '完了';
      default:
        return '不明';
    }
  };

  const getTypeText = (type: ScheduleType): string => {
    switch (type) {
      case 'one_time':
        return '一回限り';
      case 'recurring':
        return '繰返';
      case 'random':
        return 'ランダム';
      default:
        return '不明';
    }
  };

  const formatNextRun = (nextRunAt: any): string => {
    if (!nextRunAt) return '未設定';

    const date = new Date(nextRunAt.seconds * 1000);
    const now = new Date();

    // 今日の場合は時刻のみ表示
    if (date.toDateString() === now.toDateString()) {
      return `今日 ${date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`;
    }

    // 明日の場合
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) {
      return `明日 ${date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`;
    }

    // それ以外は日付と時刻
    return date.toLocaleString('ja-JP', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Lifecycle
  onMounted(async () => {
    // データを取得
    await Promise.all([
      schedulesStore.fetchSchedules(true),
      igAccountsStore.loadAccounts(),
    ]);
  });
</script>

<style scoped>
/* LP-demo.htmlと統一されたスタイルシステム */
:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --accent-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  --success-gradient: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  --warning-gradient: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  --info-gradient: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  --text-primary: #2d3748;
  --text-secondary: #718096;
  --bg-light: #f7fafc;
  --white: #ffffff;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
}

.schedules-view {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans JP', sans-serif;
  color: var(--text-primary);
  line-height: 1.6;
  overflow-x: hidden;
  min-height: 100vh;
  background: linear-gradient(180deg, #fafbff 0%, #f3f4f6 100%);
}

/* 統一ナビゲーション */
.omniy-nav {
  position: fixed;
  top: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  z-index: 1000;
  padding: 1rem 0;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.8rem;
  font-weight: 800;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--text-primary);
}

.cta-button {
  background: var(--primary-gradient);
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 30px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  border: none;
  cursor: pointer;
  display: inline-block;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* ヒーローセクション */
.hero {
  margin-top: 80px;
  padding: 4rem 2rem 6rem;
  background: linear-gradient(180deg, #fafbff 0%, #f3f4f6 100%);
  position: relative;
  overflow: hidden;
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-content h1 {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1.5rem;
}

.gradient-text {
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-description {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.8;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 3rem;
}

/* 浮遊する要素 */
.floating-elements {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

.floating-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  animation: float 20s infinite ease-in-out;
}

.circle-1 {
  width: 200px;
  height: 200px;
  background: var(--primary-gradient);
  top: 10%;
  left: 5%;
  animation-delay: 0s;
}

.circle-2 {
  width: 150px;
  height: 150px;
  background: var(--secondary-gradient);
  top: 60%;
  right: 10%;
  animation-delay: 5s;
}

.circle-3 {
  width: 100px;
  height: 100px;
  background: var(--accent-gradient);
  bottom: 20%;
  left: 15%;
  animation-delay: 10s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, -30px) scale(1.1); }
  50% { transform: translate(-20px, 20px) scale(0.9); }
  75% { transform: translate(20px, 30px) scale(1.05); }
}

/* スケジュールモックアップ */
.hero-visual {
  position: relative;
}

.schedule-phone-mockup {
  width: 320px;
  height: 640px;
  background: #000;
  border-radius: 40px;
  padding: 10px;
  box-shadow: var(--shadow-xl);
  margin: 0 auto;
  position: relative;
}

.phone-screen {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 30px;
  overflow: hidden;
  position: relative;
}

.schedule-header {
  padding: 1rem;
  border-bottom: 1px solid #efefef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.schedule-logo {
  font-size: 1.2rem;
  font-weight: 600;
}

.schedule-demo-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.demo-schedule-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-light);
  border-radius: 12px;
}

.schedule-status {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.schedule-status.active {
  background: #43e97b;
}

.schedule-status.pending {
  background: #667eea;
}

.schedule-status.recurring {
  background: #f093fb;
}

.schedule-info {
  flex: 1;
}

.schedule-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.schedule-time {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

/* メインコンテンツ */
.schedules-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 4rem;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
}

.section-description {
  font-size: 1.1rem;
  color: var(--text-secondary);
}

/* 統計セクション */
.stats-section {
  margin-bottom: 6rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.stat-card {
  background: white;
  padding: 2rem;
  border-radius: 20px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.gradient-primary { background: var(--primary-gradient); }
.gradient-success { background: var(--success-gradient); }
.gradient-warning { background: var(--warning-gradient); color: var(--text-primary); }
.gradient-info { background: var(--info-gradient); color: var(--text-primary); }

.stat-icon {
  font-size: 2rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 1rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
}

.stat-title {
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 0.5rem;
}

.stat-trend {
  font-size: 0.8rem;
  opacity: 0.8;
}

/* フィルターセクション */
.filters-section {
  margin-bottom: 3rem;
}

.filters-container {
  background: white;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: var(--shadow-md);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-clear-button {
  background: var(--bg-light);
  color: var(--text-secondary);
  border: 2px solid #e2e8f0;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-clear-button:hover {
  border-color: #cbd5e0;
  color: var(--text-primary);
}

/* スケジュール一覧セクション */
.schedules-list-section {
  margin-bottom: 4rem;
}

.error-alert {
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 2rem;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.error-icon {
  font-size: 1.5rem;
  color: #dc2626;
}

.error-text {
  flex: 1;
  color: #991b1b;
  font-weight: 500;
}

.error-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #991b1b;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.error-close:hover {
  background: rgba(185, 28, 28, 0.1);
}

.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: var(--shadow-md);
}

.loading-spinner {
  width: 64px;
  height: 64px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.loading-spinner.small {
  width: 24px;
  height: 24px;
  border-width: 2px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 1.1rem;
  color: var(--text-secondary);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: var(--shadow-md);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.empty-description {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
}

/* スケジュールリスト */
.schedules-list {
  background: white;
  border-radius: 20px;
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.schedule-item {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.schedule-item:last-child {
  border-bottom: none;
}

.schedule-item:hover {
  background: var(--bg-light);
  transform: translateX(5px);
}

.schedule-status-indicator {
  width: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  flex-shrink: 0;
}

.schedule-status-indicator.status-active {
  background: var(--success-gradient);
}

.schedule-status-indicator.status-paused {
  background: var(--warning-gradient);
}

.schedule-status-indicator.status-error {
  background: var(--secondary-gradient);
}

.schedule-status-indicator.status-completed {
  background: var(--info-gradient);
}

.schedule-main-content {
  flex: 1;
}

.schedule-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.schedule-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.schedule-actions {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  background: none;
  border: none;
  font-size: 1.2rem;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-button:hover {
  background: var(--bg-light);
  transform: scale(1.1);
}

.schedule-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.schedule-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.type-badge,
.status-badge,
.account-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  background: var(--bg-light);
  color: var(--text-secondary);
}

.type-badge.type-one_time {
  background: #e0e7ff;
  color: #3730a3;
}

.type-badge.type-recurring {
  background: #fef3c7;
  color: #92400e;
}

.type-badge.type-random {
  background: #f3e8ff;
  color: #6b21a8;
}

.status-badge.status-active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.status-paused {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.status-error {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge.status-completed {
  background: #dbeafe;
  color: #1e40af;
}

.schedule-info-row {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.schedule-time-info,
.schedule-run-count {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.time-label,
.run-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.time-value,
.run-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* ロードモア */
.load-more-section {
  text-align: center;
  padding: 2rem;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: var(--text-secondary);
}

.load-more-button {
  background: var(--bg-light);
  color: var(--text-primary);
  border: 2px solid #e2e8f0;
  padding: 1rem 2rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.load-more-button:hover {
  border-color: #667eea;
  background: white;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* 削除ダイアログ */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.delete-dialog {
  background: white;
  border-radius: 20px;
  box-shadow: var(--shadow-xl);
  max-width: 400px;
  width: 90%;
  overflow: hidden;
}

.dialog-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.dialog-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.dialog-content {
  padding: 1.5rem;
}

.dialog-message {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

.dialog-actions {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.dialog-button {
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.dialog-button.secondary {
  background: var(--bg-light);
  color: var(--text-primary);
  border: 2px solid #e2e8f0;
}

.dialog-button.secondary:hover {
  border-color: #cbd5e0;
}

.dialog-button.danger {
  background: var(--secondary-gradient);
  color: white;
}

.dialog-button.danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(240, 147, 251, 0.3);
}

.dialog-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* レスポンシブ */
@media (max-width: 768px) {
  .hero-container {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .hero-content h1 {
    font-size: 2.5rem;
  }

  .hero-visual {
    order: -1;
    margin-bottom: 2rem;
  }

  .schedule-phone-mockup {
    width: 280px;
    height: 560px;
  }

  .nav-links {
    display: none;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .filters-container {
    grid-template-columns: 1fr;
  }

  .schedule-header-row {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .schedule-info-row {
    flex-direction: column;
    gap: 1rem;
  }

  .section-title {
    font-size: 2rem;
  }
}
</style>
