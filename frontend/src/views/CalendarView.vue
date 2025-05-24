<template>
  <div class="calendar-view">
    <v-container>
      <!-- 📅 ページヘッダー -->
      <v-row class="mb-6">
        <v-col cols="12">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon icon="mdi-calendar" size="32" color="primary" class="mr-3" />
              <div>
                <h1 class="text-h3 font-weight-bold">投稿カレンダー</h1>
                <p class="text-subtitle-1 text-grey-darken-1 mt-1">
                  スケジュール投稿の予定を月表示で確認
                </p>
              </div>
            </div>
            
            <div class="d-flex ga-3">
              <v-btn
                color="primary"
                variant="outlined"
                prepend-icon="mdi-refresh"
                @click="refreshData"
                :loading="calendarStore.loading"
              >
                更新
              </v-btn>
              
              <v-btn
                color="success"
                variant="elevated"
                prepend-icon="mdi-plus"
                to="/schedules"
              >
                スケジュール作成
              </v-btn>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- 📊 統計サマリー -->
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
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <!-- 📅 メインカレンダー -->
        <v-col cols="12" lg="8">
          <v-card class="calendar-card" elevation="0" rounded="xl">
            <v-card-title class="calendar-header">
              <div class="d-flex align-center justify-space-between w-100">
                <div class="d-flex align-center">
                  <v-icon icon="mdi-calendar-month" class="mr-3" />
                  投稿スケジュール
                </div>
                
                <!-- カレンダービュー切り替え -->
                <div class="d-flex ga-2">
                  <v-btn-toggle
                    v-model="currentViewIndex"
                    mandatory
                    variant="outlined"
                    density="compact"
                  >
                    <v-btn
                      v-for="(view, index) in viewOptions"
                      :key="view.value"
                      :value="index"
                      size="small"
                      @click="changeView(view.value)"
                    >
                      {{ view.text }}
                    </v-btn>
                  </v-btn-toggle>
                </div>
              </div>
            </v-card-title>

            <v-divider />

            <!-- エラー表示 -->
            <v-alert
              v-if="calendarStore.error"
              type="error"
              variant="tonal"
              class="ma-4"
              closable
              @click:close="calendarStore.clearError"
            >
              {{ calendarStore.error }}
            </v-alert>

            <!-- カレンダー本体 -->
            <v-card-text class="pa-4">
              <div v-if="calendarStore.loading" class="text-center pa-8">
                <v-progress-circular indeterminate color="primary" size="64" />
                <div class="mt-4 text-subtitle-1">カレンダーを読み込み中...</div>
              </div>
              
              <div v-else id="calendar" ref="calendarElement" />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- 📋 サイドバー -->
        <v-col cols="12" lg="4">
          <!-- フィルター設定 -->
          <v-card class="filter-card mb-4" elevation="0" rounded="xl">
            <v-card-title class="filter-header">
              <v-icon icon="mdi-filter" class="mr-3" />
              表示フィルター
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-4">
              <!-- ステータスフィルター -->
              <div class="filter-section">
                <h4 class="filter-section-title">ステータス</h4>
                <v-checkbox
                  v-model="filters.showActive"
                  label="アクティブ"
                  density="compact"
                  hide-details
                  @update:model-value="updateFilters"
                />
                <v-checkbox
                  v-model="filters.showPaused"
                  label="一時停止"
                  density="compact"
                  hide-details
                  @update:model-value="updateFilters"
                />
                <v-checkbox
                  v-model="filters.showCompleted"
                  label="完了"
                  density="compact"
                  hide-details
                  @update:model-value="updateFilters"
                />
                <v-checkbox
                  v-model="filters.showFailed"
                  label="エラー"
                  density="compact"
                  hide-details
                  @update:model-value="updateFilters"
                />
              </div>

              <v-divider class="my-4" />

              <!-- スケジュールタイプフィルター -->
              <div class="filter-section">
                <h4 class="filter-section-title">投稿タイプ</h4>
                <v-checkbox
                  v-model="scheduleTypeFilters.oneTime"
                  label="一回のみ"
                  density="compact"
                  hide-details
                  @update:model-value="updateScheduleTypeFilters"
                />
                <v-checkbox
                  v-model="scheduleTypeFilters.recurring"
                  label="繰り返し"
                  density="compact"
                  hide-details
                  @update:model-value="updateScheduleTypeFilters"
                />
                <v-checkbox
                  v-model="scheduleTypeFilters.random"
                  label="ランダム"
                  density="compact"
                  hide-details
                  @update:model-value="updateScheduleTypeFilters"
                />
              </div>
            </v-card-text>
          </v-card>

          <!-- 今日のイベント -->
          <v-card class="today-events-card mb-4" elevation="0" rounded="xl">
            <v-card-title class="today-events-header">
              <v-icon icon="mdi-today" class="mr-3" />
              今日の予定
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-4">
              <div v-if="calendarStore.todayEvents.length === 0" class="text-center pa-4">
                <v-icon size="48" color="grey-lighten-2" class="mb-2">
                  mdi-calendar-blank
                </v-icon>
                <div class="text-subtitle-2 text-medium-emphasis">
                  今日の予定はありません
                </div>
              </div>
              
              <div v-else class="today-events-list">
                <div
                  v-for="event in calendarStore.todayEvents"
                  :key="event.id"
                  class="today-event-item"
                  @click="showEventDetails(event)"
                >
                  <div class="d-flex align-center">
                    <div 
                      class="event-color-indicator"
                      :style="{ backgroundColor: event.backgroundColor }"
                    />
                    <div class="event-info ml-3">
                      <div class="event-title">{{ event.title }}</div>
                      <div class="event-time">
                        {{ calendarStore.formatEventTime(event.start as string) }}
                      </div>
                      <div v-if="event.extendedProps?.igAccountName" class="event-account">
                        @{{ event.extendedProps.igAccountName }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- 近日予定 -->
          <v-card class="upcoming-events-card" elevation="0" rounded="xl">
            <v-card-title class="upcoming-events-header">
              <v-icon icon="mdi-clock-outline" class="mr-3" />
              近日予定
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-4">
              <div v-if="calendarStore.upcomingEvents.length === 0" class="text-center pa-4">
                <v-icon size="48" color="grey-lighten-2" class="mb-2">
                  mdi-calendar-clock
                </v-icon>
                <div class="text-subtitle-2 text-medium-emphasis">
                  近日の予定はありません
                </div>
              </div>
              
              <div v-else class="upcoming-events-list">
                <div
                  v-for="event in calendarStore.upcomingEvents"
                  :key="event.id"
                  class="upcoming-event-item"
                  @click="showEventDetails(event)"
                >
                  <div class="d-flex align-center">
                    <div 
                      class="event-color-indicator"
                      :style="{ backgroundColor: event.backgroundColor }"
                    />
                    <div class="event-info ml-3">
                      <div class="event-title">{{ event.title }}</div>
                      <div class="event-date">
                        {{ calendarStore.formatEventDate(event.start as string) }}
                      </div>
                      <div class="event-time">
                        {{ calendarStore.formatEventTime(event.start as string) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- イベント詳細ダイアログ -->
    <v-dialog v-model="showEventDialog" max-width="600px">
      <v-card v-if="selectedEvent">
        <v-card-title class="text-h5">
          <div class="d-flex align-center">
            <div 
              class="event-color-indicator mr-3"
              :style="{ backgroundColor: selectedEvent.backgroundColor }"
            />
            {{ selectedEvent.title }}
          </div>
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="12" md="6">
              <div class="detail-item">
                <strong>日時:</strong><br>
                {{ calendarStore.formatEventDate(selectedEvent.start as string) }}<br>
                {{ calendarStore.formatEventTime(selectedEvent.start as string) }}
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="detail-item">
                <strong>タイプ:</strong>
                <v-chip
                  size="small"
                  :color="selectedEvent.backgroundColor"
                  variant="tonal"
                  class="ml-2"
                >
                  {{ calendarStore.getScheduleTypeText(selectedEvent.extendedProps?.schedule.type || '') }}
                </v-chip>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="detail-item">
                <strong>ステータス:</strong>
                <v-chip
                  size="small"
                  :color="getStatusColor(selectedEvent.extendedProps?.schedule.status || '')"
                  variant="tonal"
                  class="ml-2"
                >
                  {{ calendarStore.getStatusText(selectedEvent.extendedProps?.schedule.status || '') }}
                </v-chip>
              </div>
            </v-col>
            <v-col v-if="selectedEvent.extendedProps?.igAccountName" cols="12" md="6">
              <div class="detail-item">
                <strong>アカウント:</strong><br>
                @{{ selectedEvent.extendedProps.igAccountName }}
              </div>
            </v-col>
            <v-col v-if="selectedEvent.extendedProps?.description" cols="12">
              <div class="detail-item">
                <strong>説明:</strong><br>
                {{ selectedEvent.extendedProps.description }}
              </div>
            </v-col>
            <v-col v-if="selectedEvent.extendedProps?.contentPreview" cols="12">
              <div class="detail-item">
                <strong>投稿内容（プレビュー）:</strong><br>
                {{ selectedEvent.extendedProps.contentPreview }}...
              </div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="showEventDialog = false"
          >
            閉じる
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            @click="editSchedule"
          >
            編集
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCalendarStore, type CalendarEvent } from '@/stores/calendar'
import { useSchedulesStore } from '@/stores/schedules'
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import jaLocale from '@fullcalendar/core/locales/ja'

// Router & Stores
const router = useRouter()
const calendarStore = useCalendarStore()
const schedulesStore = useSchedulesStore()

// State
const calendarElement = ref<HTMLElement | null>(null)
const calendar = ref<Calendar | null>(null)
const currentViewIndex = ref(0)
const showEventDialog = ref(false)
const selectedEvent = ref<CalendarEvent | null>(null)

// フィルター状態
const filters = ref({
  showActive: true,
  showPaused: true,
  showCompleted: true,
  showFailed: true
})

const scheduleTypeFilters = ref({
  oneTime: true,
  recurring: true,
  random: true
})

// ビューオプション
const viewOptions = [
  { text: '月', value: 'dayGridMonth' },
  { text: '週', value: 'timeGridWeek' },
  { text: '日', value: 'timeGridDay' },
  { text: 'リスト', value: 'listWeek' }
]

// Computed
const statsCards = computed(() => [
  {
    title: '総スケジュール数',
    value: schedulesStore.schedules.length.toString(),
    icon: 'mdi-calendar-multiple',
    gradient: 'gradient-primary'
  },
  {
    title: 'アクティブ',
    value: schedulesStore.schedules.filter(s => s.status === 'active').length.toString(),
    icon: 'mdi-play-circle',
    gradient: 'gradient-success'
  },
  {
    title: '今日の予定',
    value: calendarStore.todayEvents.length.toString(),
    icon: 'mdi-today',
    gradient: 'gradient-warning'
  },
  {
    title: '近日予定',
    value: calendarStore.upcomingEvents.length.toString(),
    icon: 'mdi-clock-outline',
    gradient: 'gradient-info'
  }
])

// Methods
const initializeCalendar = () => {
  if (!calendarElement.value) return

  calendar.value = new Calendar(calendarElement.value, {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    locale: jaLocale,
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },
    height: 'auto',
    eventSources: [
      {
        events: () => calendarStore.filteredEvents
      }
    ],
    eventClick: (info) => {
      const eventId = info.event.id
      const event = calendarStore.getEventDetails(eventId)
      if (event) {
        showEventDetails(event)
      }
    },
    eventDidMount: (info) => {
      // ツールチップ追加
      info.el.title = `${info.event.title}\n${info.event.extendedProps?.igAccountName ? '@' + info.event.extendedProps.igAccountName : ''}`
    },
    dayCellDidMount: (info) => {
      // 日付セルの装飾
      const dateStr = info.date.toISOString().split('T')[0]
      const dayEvents = calendarStore.eventsByDate[dateStr]
      if (dayEvents && dayEvents.length > 0) {
        info.el.classList.add('has-events')
      }
    }
  })

  calendar.value.render()
}

const changeView = (view: string) => {
  if (calendar.value) {
    calendar.value.changeView(view)
    calendarStore.updateView(view as any)
  }
}

const updateFilters = () => {
  calendarStore.updateFilters(filters.value)
  refreshCalendar()
}

const updateScheduleTypeFilters = () => {
  const scheduleTypes: string[] = []
  if (scheduleTypeFilters.value.oneTime) scheduleTypes.push('one_time')
  if (scheduleTypeFilters.value.recurring) scheduleTypes.push('recurring')
  if (scheduleTypeFilters.value.random) scheduleTypes.push('random')
  
  calendarStore.updateFilters({ scheduleTypes })
  refreshCalendar()
}

const refreshCalendar = () => {
  if (calendar.value) {
    calendar.value.refetchEvents()
  }
}

const refreshData = async () => {
  await calendarStore.refreshEvents()
  refreshCalendar()
}

const showEventDetails = (event: CalendarEvent) => {
  selectedEvent.value = event
  showEventDialog.value = true
}

const editSchedule = () => {
  if (selectedEvent.value?.extendedProps?.schedule) {
    router.push(`/schedules?edit=${selectedEvent.value.extendedProps.schedule.id}`)
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'paused':
      return 'warning'
    case 'completed':
      return 'info'
    case 'error':
      return 'error'
    default:
      return 'grey'
  }
}

// Watchers
watch(() => calendarStore.filteredEvents, () => {
  refreshCalendar()
}, { deep: true })

// Lifecycle
onMounted(async () => {
  await calendarStore.loadEvents()
  await nextTick()
  initializeCalendar()
})
</script>

<style scoped>
/* 🎨 カレンダービューのスタイル */

.calendar-view {
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

.gradient-warning {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  color: #8b5a2b;
}

.gradient-info {
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

/* カレンダーカード */
.calendar-card, .filter-card, .today-events-card, .upcoming-events-card {
  background: white;
  border: 1px solid #e2e8f0;
}

.calendar-header, .filter-header, .today-events-header, .upcoming-events-header {
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
  border-bottom: 1px solid #e2e8f0;
  padding: 20px 24px;
  font-weight: 600;
  color: #2c3e50;
}

/* フィルターセクション */
.filter-section {
  margin-bottom: 16px;
}

.filter-section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

/* イベントアイテム */
.today-event-item, .upcoming-event-item {
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s ease;
}

.today-event-item:hover, .upcoming-event-item:hover {
  background: rgba(102, 126, 234, 0.04);
  border-radius: 8px;
  padding-left: 8px;
  padding-right: 8px;
}

.today-event-item:last-child, .upcoming-event-item:last-child {
  border-bottom: none;
}

.event-color-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.event-info {
  flex: 1;
}

.event-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 2px;
}

.event-time, .event-date {
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 2px;
}

.event-account {
  font-size: 0.75rem;
  color: #8b5cf6;
  font-weight: 500;
}

/* 詳細ダイアログ */
.detail-item {
  margin-bottom: 16px;
  font-size: 0.875rem;
}

.detail-item strong {
  color: #1e293b;
}

/* FullCalendar カスタマイズ */
:deep(.fc) {
  font-family: 'Roboto', sans-serif;
}

:deep(.fc-toolbar-title) {
  font-size: 1.25rem !important;
  font-weight: 600 !important;
  color: #1e293b !important;
}

:deep(.fc-button) {
  background: #667eea !important;
  border-color: #667eea !important;
  font-weight: 500 !important;
  text-transform: none !important;
}

:deep(.fc-button:hover) {
  background: #5a6fd8 !important;
  border-color: #5a6fd8 !important;
}

:deep(.fc-button-active) {
  background: #4c51bf !important;
  border-color: #4c51bf !important;
}

:deep(.fc-day-today) {
  background: rgba(102, 126, 234, 0.1) !important;
}

:deep(.fc-event) {
  border-radius: 6px !important;
  border: none !important;
  font-size: 0.8rem !important;
  padding: 2px 6px !important;
}

:deep(.fc-event-title) {
  font-weight: 500 !important;
}

:deep(.has-events) {
  background: rgba(67, 233, 123, 0.05) !important;
}

/* アニメーション */
.stat-card {
  animation: fadeInUp 0.6s ease-out;
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

/* レスポンシブ */
@media (max-width: 768px) {
  .stat-card-content {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  :deep(.fc-toolbar) {
    flex-direction: column !important;
    gap: 10px !important;
  }

  :deep(.fc-toolbar-chunk) {
    justify-content: center !important;
  }
}
</style>