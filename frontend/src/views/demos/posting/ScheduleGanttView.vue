<template>
  <div class="schedule-gantt-view">
    <!-- Header Controls -->
    <div class="gantt-header">
      <div class="header-left">
        <h1 class="page-title">
          <v-icon size="28" color="primary">mdi-calendar-clock</v-icon>
          投稿スケジュール管理
        </h1>
        <div class="view-toggle">
          <v-btn-toggle v-model="viewMode" variant="outlined" divided>
            <v-btn value="week" size="small">
              <v-icon left>mdi-calendar-week</v-icon>
              週表示
            </v-btn>
            <v-btn value="month" size="small">
              <v-icon left>mdi-calendar-month</v-icon>
              月表示
            </v-btn>
            <v-btn value="timeline" size="small">
              <v-icon left>mdi-chart-timeline</v-icon>
              タイムライン
            </v-btn>
          </v-btn-toggle>
        </div>
      </div>

      <div class="header-right">
        <div class="account-filter">
          <v-select
            v-model="selectedAccounts"
            :items="accounts"
            label="アカウント選択"
            multiple
            chips
            clearable
            variant="outlined"
            density="compact"
            class="account-selector"
          >
            <template #selection="{ item, index }">
              <v-chip
                v-if="index < 2"
                :color="item.raw.color"
                size="small"
                closable
                @click:close="removeAccount(item.raw)"
              >
                <v-avatar left>
                  <v-img
                    :src="item.raw.avatar"
                    :alt="item.raw.username"
                  ></v-img>
                </v-avatar>
                {{ item.raw.username }}
              </v-chip>
              <span v-if="index === 2" class="text-caption">
                (+{{ selectedAccounts.length - 2 }} その他)
              </span>
            </template>
          </v-select>
        </div>

        <v-btn color="primary" size="large" @click="openScheduleDialog">
          <v-icon left>mdi-plus</v-icon>
          新規投稿
        </v-btn>
      </div>
    </div>

    <!-- Status Summary Cards -->
    <div class="status-summary">
      <div
        class="summary-card"
        v-for="status in statusSummary"
        :key="status.type"
      >
        <div class="summary-icon" :class="status.type">
          <v-icon size="24">{{ status.icon }}</v-icon>
        </div>
        <div class="summary-content">
          <span class="summary-count">{{ status.count }}</span>
          <span class="summary-label">{{ status.label }}</span>
        </div>
      </div>
    </div>

    <!-- Gantt Chart Container -->
    <div class="gantt-container">
      <div class="gantt-sidebar">
        <div class="sidebar-header">
          <span class="sidebar-title">アカウント</span>
          <v-btn icon size="small" variant="text" @click="toggleAllAccounts">
            <v-icon>{{
              allAccountsVisible ? 'mdi-eye-off' : 'mdi-eye'
            }}</v-icon>
          </v-btn>
        </div>

        <div class="account-rows">
          <div
            v-for="account in filteredAccounts"
            :key="account.id"
            class="account-row"
            :class="{ hidden: !account.visible }"
          >
            <div class="account-info">
              <v-avatar size="32" class="account-avatar">
                <v-img :src="account.avatar" :alt="account.username"></v-img>
              </v-avatar>
              <div class="account-details">
                <span class="account-name">{{ account.username }}</span>
                <span class="account-followers"
                  >{{ account.followers }} followers</span
                >
              </div>
            </div>

            <div class="account-actions">
              <v-btn
                icon
                size="small"
                variant="text"
                @click="toggleAccountVisibility(account)"
              >
                <v-icon size="16">{{
                  account.visible ? 'mdi-eye' : 'mdi-eye-off'
                }}</v-icon>
              </v-btn>

              <v-menu>
                <template #activator="{ props }">
                  <v-btn icon size="small" variant="text" v-bind="props">
                    <v-icon size="16">mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list density="compact">
                  <v-list-item @click="editAccount(account)">
                    <v-icon left>mdi-pencil</v-icon>
                    編集
                  </v-list-item>
                  <v-list-item @click="viewAnalytics(account)">
                    <v-icon left>mdi-chart-line</v-icon>
                    分析
                  </v-list-item>
                  <v-list-item @click="duplicateLastPost(account)">
                    <v-icon left>mdi-content-copy</v-icon>
                    最新投稿を複製
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </div>
        </div>
      </div>

      <div class="gantt-timeline">
        <div class="timeline-header">
          <div
            v-for="timeSlot in timeSlots"
            :key="timeSlot.key"
            class="time-slot-header"
            :class="{ today: timeSlot.isToday, weekend: timeSlot.isWeekend }"
          >
            <div class="time-slot-date">{{ timeSlot.date }}</div>
            <div class="time-slot-day">{{ timeSlot.day }}</div>
          </div>
        </div>

        <div class="timeline-body">
          <div
            v-for="account in filteredAccounts"
            :key="account.id"
            class="timeline-row"
            :class="{ hidden: !account.visible }"
          >
            <div
              v-for="timeSlot in timeSlots"
              :key="`${account.id}-${timeSlot.key}`"
              class="timeline-cell"
              :class="{
                today: timeSlot.isToday,
                weekend: timeSlot.isWeekend,
                droppable: true,
              }"
              @drop="handleDrop($event, account, timeSlot)"
              @dragover.prevent
            >
              <div
                v-for="schedule in getSchedulesForCell(account.id, timeSlot)"
                :key="schedule.id"
                class="schedule-item"
                :class="[schedule.status, schedule.type]"
                :style="{
                  backgroundColor: account.color + '20',
                  borderColor: account.color,
                }"
                draggable="true"
                @dragstart="handleDragStart($event, schedule)"
                @click="openScheduleDetails(schedule)"
              >
                <div class="schedule-content">
                  <div class="schedule-time">
                    {{ formatTime(schedule.scheduledAt) }}
                  </div>
                  <div class="schedule-caption">
                    {{ truncateText(schedule.caption, 30) }}
                  </div>
                  <div class="schedule-images" v-if="schedule.images?.length">
                    <v-icon size="12">mdi-image</v-icon>
                    <span>{{ schedule.images.length }}</span>
                  </div>
                </div>

                <div class="schedule-status">
                  <v-icon :color="getStatusColor(schedule.status)" size="12">
                    {{ getStatusIcon(schedule.status) }}
                  </v-icon>
                </div>

                <div class="schedule-actions">
                  <v-btn
                    icon
                    size="x-small"
                    variant="text"
                    @click.stop="editSchedule(schedule)"
                  >
                    <v-icon size="10">mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    size="x-small"
                    variant="text"
                    @click.stop="deleteSchedule(schedule)"
                  >
                    <v-icon size="10">mdi-delete</v-icon>
                  </v-btn>
                </div>
              </div>

              <!-- Add Button for Empty Cells -->
              <v-btn
                v-if="!getSchedulesForCell(account.id, timeSlot).length"
                icon
                size="small"
                variant="text"
                class="add-schedule-btn"
                @click="addScheduleToCell(account, timeSlot)"
              >
                <v-icon size="16" color="grey">mdi-plus</v-icon>
              </v-btn>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="gantt-legend">
      <div class="legend-title">状態</div>
      <div class="legend-items">
        <div
          class="legend-item"
          v-for="status in legendStatuses"
          :key="status.type"
        >
          <div
            class="legend-color"
            :style="{ backgroundColor: status.color }"
          ></div>
          <span class="legend-label">{{ status.label }}</span>
        </div>
      </div>

      <div class="legend-title">種類</div>
      <div class="legend-items">
        <div class="legend-item" v-for="type in legendTypes" :key="type.type">
          <v-icon :color="type.color" size="16">{{ type.icon }}</v-icon>
          <span class="legend-label">{{ type.label }}</span>
        </div>
      </div>
    </div>

    <!-- Schedule Details Dialog -->
    <v-dialog v-model="scheduleDialog" max-width="800" persistent>
      <schedule-form-dialog
        v-if="scheduleDialog"
        :schedule="selectedSchedule"
        :accounts="accounts"
        @close="closeScheduleDialog"
        @save="saveSchedule"
      />
    </v-dialog>

    <!-- Quick Stats Overlay -->
    <div class="quick-stats" v-if="showQuickStats">
      <div class="stats-content">
        <h3>今週の統計</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-value">{{ weekStats.totalPosts }}</span>
            <span class="stat-label">投稿予定</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ weekStats.completedPosts }}</span>
            <span class="stat-label">完了</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ weekStats.engagementRate }}%</span>
            <span class="stat-label">平均エンゲージメント率</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { format, addDays, startOfWeek, isToday, isWeekend } from 'date-fns';
  import { ja } from 'date-fns/locale';

  interface Account {
    id: string;
    username: string;
    avatar: string;
    followers: string;
    color: string;
    visible: boolean;
  }

  interface Schedule {
    id: string;
    accountId: string;
    caption: string;
    images: string[];
    scheduledAt: Date;
    status: 'pending' | 'completed' | 'failed' | 'draft';
    type: 'once' | 'recurring' | 'random';
  }

  interface TimeSlot {
    key: string;
    date: string;
    day: string;
    fullDate: Date;
    isToday: boolean;
    isWeekend: boolean;
  }

  const viewMode = ref('week');
  const selectedAccounts = ref<string[]>([]);
  const scheduleDialog = ref(false);
  const selectedSchedule = ref<Schedule | null>(null);
  const showQuickStats = ref(false);
  const allAccountsVisible = ref(true);

  // Mock data
  const accounts = ref<Account[]>([
    {
      id: '1',
      username: 'business_official',
      avatar: '/avatars/business.jpg',
      followers: '12.5K',
      color: '#667eea',
      visible: true,
    },
    {
      id: '2',
      username: 'fashion_brand',
      avatar: '/avatars/fashion.jpg',
      followers: '8.2K',
      color: '#f093fb',
      visible: true,
    },
    {
      id: '3',
      username: 'food_lover',
      avatar: '/avatars/food.jpg',
      followers: '5.8K',
      color: '#4ecdc4',
      visible: true,
    },
    {
      id: '4',
      username: 'travel_diary',
      avatar: '/avatars/travel.jpg',
      followers: '15.1K',
      color: '#45b7d1',
      visible: true,
    },
  ]);

  const schedules = ref<Schedule[]>([
    {
      id: 's1',
      accountId: '1',
      caption: '新商品のご紹介です！限定セール開始 #NewProduct #Sale',
      images: ['product1.jpg', 'product2.jpg'],
      scheduledAt: new Date(2025, 0, 27, 10, 0),
      status: 'pending',
      type: 'once',
    },
    {
      id: 's2',
      accountId: '1',
      caption: '本日の営業時間のお知らせ',
      images: ['store.jpg'],
      scheduledAt: new Date(2025, 0, 27, 18, 0),
      status: 'completed',
      type: 'recurring',
    },
    {
      id: 's3',
      accountId: '2',
      caption: '春の新作コレクション✨ #SpringCollection #Fashion',
      images: ['fashion1.jpg', 'fashion2.jpg', 'fashion3.jpg'],
      scheduledAt: new Date(2025, 0, 28, 12, 0),
      status: 'pending',
      type: 'once',
    },
    {
      id: 's4',
      accountId: '3',
      caption: 'ランチタイム限定メニュー 🍜 #Lunch #Ramen',
      images: ['ramen.jpg'],
      scheduledAt: new Date(2025, 0, 28, 11, 30),
      status: 'failed',
      type: 'recurring',
    },
    {
      id: 's5',
      accountId: '4',
      caption: '週末の旅行先候補 #Weekend #Travel',
      images: [],
      scheduledAt: new Date(2025, 0, 29, 9, 0),
      status: 'draft',
      type: 'random',
    },
  ]);

  // Computed properties
  const filteredAccounts = computed(() => {
    if (selectedAccounts.value.length === 0) {
      return accounts.value;
    }
    return accounts.value.filter(account =>
      selectedAccounts.value.includes(account.id)
    );
  });

  const timeSlots = computed((): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });

    const days = viewMode.value === 'week' ? 7 : 30;

    for (let i = 0; i < days; i++) {
      const date = addDays(startDate, i);
      slots.push({
        key: format(date, 'yyyy-MM-dd'),
        date: format(date, 'M/d', { locale: ja }),
        day: format(date, 'EEE', { locale: ja }),
        fullDate: date,
        isToday: isToday(date),
        isWeekend: isWeekend(date),
      });
    }

    return slots;
  });

  const statusSummary = computed(() => [
    {
      type: 'pending',
      icon: 'mdi-clock-outline',
      count: schedules.value.filter(s => s.status === 'pending').length,
      label: '予約中',
    },
    {
      type: 'completed',
      icon: 'mdi-check-circle',
      count: schedules.value.filter(s => s.status === 'completed').length,
      label: '投稿完了',
    },
    {
      type: 'failed',
      icon: 'mdi-alert-circle',
      count: schedules.value.filter(s => s.status === 'failed').length,
      label: '投稿失敗',
    },
    {
      type: 'draft',
      icon: 'mdi-file-document-outline',
      count: schedules.value.filter(s => s.status === 'draft').length,
      label: '下書き',
    },
  ]);

  const weekStats = computed(() => ({
    totalPosts: schedules.value.length,
    completedPosts: schedules.value.filter(s => s.status === 'completed')
      .length,
    engagementRate: 4.2, // Mock data
  }));

  const legendStatuses = [
    { type: 'pending', color: '#fbbf24', label: '予約中' },
    { type: 'completed', color: '#10b981', label: '完了' },
    { type: 'failed', color: '#ef4444', label: '失敗' },
    { type: 'draft', color: '#6b7280', label: '下書き' },
  ];

  const legendTypes = [
    {
      type: 'once',
      icon: 'mdi-clock-outline',
      color: 'primary',
      label: '一回のみ',
    },
    {
      type: 'recurring',
      icon: 'mdi-repeat',
      color: 'success',
      label: '繰り返し',
    },
    {
      type: 'random',
      icon: 'mdi-shuffle',
      color: 'warning',
      label: 'ランダム',
    },
  ];

  // Methods
  function getSchedulesForCell(
    accountId: string,
    timeSlot: TimeSlot
  ): Schedule[] {
    return schedules.value.filter(
      schedule =>
        schedule.accountId === accountId &&
        format(schedule.scheduledAt, 'yyyy-MM-dd') === timeSlot.key
    );
  }

  function formatTime(date: Date): string {
    return format(date, 'HH:mm');
  }

  function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  function getStatusColor(status: string): string {
    const colors = {
      pending: 'warning',
      completed: 'success',
      failed: 'error',
      draft: 'grey',
    };
    return colors[status as keyof typeof colors] || 'grey';
  }

  function getStatusIcon(status: string): string {
    const icons = {
      pending: 'mdi-clock',
      completed: 'mdi-check-circle',
      failed: 'mdi-alert-circle',
      draft: 'mdi-file-document',
    };
    return icons[status as keyof typeof icons] || 'mdi-help-circle';
  }

  function toggleAllAccounts() {
    allAccountsVisible.value = !allAccountsVisible.value;
    accounts.value.forEach(account => {
      account.visible = allAccountsVisible.value;
    });
  }

  function toggleAccountVisibility(account: Account) {
    account.visible = !account.visible;
  }

  function removeAccount(account: Account) {
    const index = selectedAccounts.value.indexOf(account.id);
    if (index > -1) {
      selectedAccounts.value.splice(index, 1);
    }
  }

  function openScheduleDialog() {
    selectedSchedule.value = null;
    scheduleDialog.value = true;
  }

  function openScheduleDetails(schedule: Schedule) {
    selectedSchedule.value = schedule;
    scheduleDialog.value = true;
  }

  function closeScheduleDialog() {
    scheduleDialog.value = false;
    selectedSchedule.value = null;
  }

  function saveSchedule(scheduleData: Schedule) {
    if (selectedSchedule.value) {
      // Update existing schedule
      const index = schedules.value.findIndex(
        s => s.id === selectedSchedule.value!.id
      );
      if (index > -1) {
        schedules.value[index] = { ...scheduleData };
      }
    } else {
      // Add new schedule
      schedules.value.push({
        ...scheduleData,
        id: `s${schedules.value.length + 1}`,
      });
    }
    closeScheduleDialog();
  }

  function addScheduleToCell(account: Account, timeSlot: TimeSlot) {
    selectedSchedule.value = {
      id: '',
      accountId: account.id,
      caption: '',
      images: [],
      scheduledAt: timeSlot.fullDate,
      status: 'draft',
      type: 'once',
    };
    scheduleDialog.value = true;
  }

  function editSchedule(schedule: Schedule) {
    openScheduleDetails(schedule);
  }

  function deleteSchedule(schedule: Schedule) {
    const index = schedules.value.findIndex(s => s.id === schedule.id);
    if (index > -1) {
      schedules.value.splice(index, 1);
    }
  }

  function editAccount(account: Account) {
    console.log('Edit account:', account);
  }

  function viewAnalytics(account: Account) {
    console.log('View analytics:', account);
  }

  function duplicateLastPost(account: Account) {
    console.log('Duplicate last post:', account);
  }

  function handleDragStart(event: DragEvent, schedule: Schedule) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('application/json', JSON.stringify(schedule));
    }
  }

  function handleDrop(event: DragEvent, account: Account, timeSlot: TimeSlot) {
    event.preventDefault();
    if (event.dataTransfer) {
      const scheduleData = JSON.parse(
        event.dataTransfer.getData('application/json')
      );
      const schedule = schedules.value.find(s => s.id === scheduleData.id);
      if (schedule) {
        schedule.accountId = account.id;
        schedule.scheduledAt = timeSlot.fullDate;
      }
    }
  }

  onMounted(() => {
    // Initialize with all accounts selected
    selectedAccounts.value = accounts.value.map(a => a.id);
  });
</script>

<style scoped>
  .schedule-gantt-view {
    padding: 24px;
    background: #f8fafc;
    min-height: 100vh;
  }

  /* Header */
  .gantt-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .page-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1e293b;
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .account-selector {
    min-width: 250px;
  }

  /* Status Summary */
  .status-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .summary-card {
    background: white;
    padding: 20px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
  }

  .summary-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  .summary-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .summary-icon.pending {
    background: #fef3c7;
    color: #d97706;
  }
  .summary-icon.completed {
    background: #dcfce7;
    color: #16a34a;
  }
  .summary-icon.failed {
    background: #fee2e2;
    color: #dc2626;
  }
  .summary-icon.draft {
    background: #f1f5f9;
    color: #64748b;
  }

  .summary-content {
    display: flex;
    flex-direction: column;
  }

  .summary-count {
    font-size: 2rem;
    font-weight: 700;
    color: #1e293b;
  }

  .summary-label {
    font-size: 0.875rem;
    color: #64748b;
  }

  /* Gantt Container */
  .gantt-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    display: grid;
    grid-template-columns: 280px 1fr;
  }

  /* Sidebar */
  .gantt-sidebar {
    background: #f8fafc;
    border-right: 1px solid #e2e8f0;
  }

  .sidebar-header {
    padding: 16px 20px;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
  }

  .sidebar-title {
    font-weight: 600;
    color: #374151;
  }

  .account-rows {
    padding: 8px 0;
  }

  .account-row {
    padding: 12px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f1f5f9;
    transition: background-color 0.2s ease;
  }

  .account-row:hover {
    background: #f1f5f9;
  }

  .account-row.hidden {
    opacity: 0.5;
  }

  .account-info {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
  }

  .account-details {
    display: flex;
    flex-direction: column;
  }

  .account-name {
    font-weight: 500;
    color: #374151;
    font-size: 0.875rem;
  }

  .account-followers {
    font-size: 0.75rem;
    color: #64748b;
  }

  .account-actions {
    display: flex;
    gap: 4px;
  }

  /* Timeline */
  .gantt-timeline {
    overflow-x: auto;
  }

  .timeline-header {
    display: grid;
    grid-template-columns: repeat(var(--columns), 120px);
    background: white;
    border-bottom: 2px solid #e2e8f0;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .time-slot-header {
    padding: 16px 8px;
    text-align: center;
    border-right: 1px solid #f1f5f9;
    background: white;
  }

  .time-slot-header.today {
    background: #eff6ff;
    border-left: 3px solid #3b82f6;
  }

  .time-slot-header.weekend {
    background: #fef7f7;
  }

  .time-slot-date {
    font-weight: 600;
    color: #374151;
    font-size: 0.875rem;
  }

  .time-slot-day {
    font-size: 0.75rem;
    color: #64748b;
    margin-top: 4px;
  }

  .timeline-body {
    min-height: 400px;
  }

  .timeline-row {
    display: grid;
    grid-template-columns: repeat(var(--columns), 120px);
    min-height: 80px;
    border-bottom: 1px solid #f1f5f9;
  }

  .timeline-row.hidden {
    display: none;
  }

  .timeline-cell {
    border-right: 1px solid #f1f5f9;
    padding: 8px 4px;
    position: relative;
    min-height: 80px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .timeline-cell.today {
    background: #eff6ff;
  }

  .timeline-cell.weekend {
    background: #fef7f7;
  }

  .timeline-cell.droppable:hover {
    background: #f0f9ff;
  }

  /* Schedule Items */
  .schedule-item {
    background: white;
    border: 2px solid;
    border-radius: 8px;
    padding: 8px;
    cursor: pointer;
    position: relative;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
    min-height: 60px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .schedule-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .schedule-item.pending {
    border-color: #fbbf24;
  }

  .schedule-item.completed {
    border-color: #10b981;
  }

  .schedule-item.failed {
    border-color: #ef4444;
  }

  .schedule-item.draft {
    border-color: #6b7280;
    opacity: 0.7;
  }

  .schedule-content {
    flex: 1;
  }

  .schedule-time {
    font-size: 0.75rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 4px;
  }

  .schedule-caption {
    font-size: 0.75rem;
    color: #64748b;
    line-height: 1.3;
    margin-bottom: 4px;
  }

  .schedule-images {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.625rem;
    color: #64748b;
  }

  .schedule-status {
    position: absolute;
    top: 4px;
    right: 4px;
  }

  .schedule-actions {
    position: absolute;
    top: 4px;
    right: 24px;
    display: none;
    gap: 2px;
  }

  .schedule-item:hover .schedule-actions {
    display: flex;
  }

  .add-schedule-btn {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .timeline-cell:hover .add-schedule-btn {
    opacity: 1;
  }

  /* Legend */
  .gantt-legend {
    margin-top: 24px;
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }

  .legend-title {
    font-weight: 600;
    color: #374151;
    margin-bottom: 12px;
    grid-column: span 1;
  }

  .legend-items {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.875rem;
    color: #64748b;
  }

  .legend-color {
    width: 12px;
    height: 12px;
    border-radius: 2px;
  }

  /* Quick Stats */
  .quick-stats {
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    z-index: 1000;
  }

  .stats-content h3 {
    margin: 0 0 16px 0;
    font-size: 1rem;
    color: #374151;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .stat-item {
    text-align: center;
  }

  .stat-value {
    display: block;
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e293b;
  }

  .stat-label {
    font-size: 0.75rem;
    color: #64748b;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .gantt-header {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;
    }

    .header-left,
    .header-right {
      justify-content: center;
    }

    .gantt-container {
      grid-template-columns: 1fr;
    }

    .gantt-sidebar {
      border-right: none;
      border-bottom: 1px solid #e2e8f0;
    }

    .timeline-header,
    .timeline-row {
      grid-template-columns: repeat(7, 100px);
    }

    .gantt-legend {
      grid-template-columns: 1fr;
    }

    .status-summary {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  /* Dynamic grid columns */
  .timeline-header,
  .timeline-row {
    grid-template-columns: repeat(7, 120px);
  }

  @media (min-width: 1400px) {
    .timeline-header,
    .timeline-row {
      grid-template-columns: repeat(7, 140px);
    }
  }
</style>
