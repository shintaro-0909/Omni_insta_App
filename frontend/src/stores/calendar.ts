import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useSchedulesStore, type Schedule } from './schedules'
import type { EventInput } from '@fullcalendar/core'

// カレンダーイベントの型定義
export interface CalendarEvent extends EventInput {
  id: string
  title: string
  start: Date | string
  end?: Date | string
  backgroundColor?: string
  borderColor?: string
  textColor?: string
  allDay?: boolean
  extendedProps?: {
    schedule: Schedule
    type: 'schedule' | 'execution'
    status: string
    description?: string
    igAccountName?: string
    contentPreview?: string
  }
}

// カレンダー表示設定の型定義
export interface CalendarSettings {
  view: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek'
  eventFilters: {
    showCompleted: boolean
    showActive: boolean
    showPaused: boolean
    showFailed: boolean
    scheduleTypes: string[]
  }
  colorScheme: {
    oneTime: string
    recurring: string
    random: string
    completed: string
    failed: string
    paused: string
  }
}

export const useCalendarStore = defineStore('calendar', () => {
  // Dependencies
  const schedulesStore = useSchedulesStore()

  // State
  const events = ref<CalendarEvent[]>([])
  const currentView = ref<CalendarSettings['view']>('dayGridMonth')
  const selectedDate = ref<Date>(new Date())
  const loading = ref(false)
  const error = ref<string | null>(null)

  // カレンダー設定
  const settings = ref<CalendarSettings>({
    view: 'dayGridMonth',
    eventFilters: {
      showCompleted: true,
      showActive: true,
      showPaused: true,
      showFailed: true,
      scheduleTypes: ['one_time', 'recurring', 'random']
    },
    colorScheme: {
      oneTime: '#2196F3',     // Blue
      recurring: '#4CAF50',   // Green
      random: '#FF9800',      // Orange
      completed: '#9E9E9E',   // Grey
      failed: '#F44336',      // Red
      paused: '#FFC107'       // Amber
    }
  })

  // Getters
  const filteredEvents = computed(() => {
    return events.value.filter(event => {
      const filters = settings.value.eventFilters
      const schedule = event.extendedProps?.schedule
      
      if (!schedule) return true

      // ステータスフィルター
      switch (schedule.status) {
        case 'completed':
          if (!filters.showCompleted) return false
          break
        case 'active':
          if (!filters.showActive) return false
          break
        case 'paused':
          if (!filters.showPaused) return false
          break
        case 'error':
          if (!filters.showFailed) return false
          break
      }

      // スケジュールタイプフィルター
      if (!filters.scheduleTypes.includes(schedule.type)) {
        return false
      }

      return true
    })
  })

  const eventsByDate = computed(() => {
    const grouped: Record<string, CalendarEvent[]> = {}
    
    filteredEvents.value.forEach(event => {
      const date = new Date(event.start as string).toISOString().split('T')[0]
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(event)
    })
    
    return grouped
  })

  const todayEvents = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return eventsByDate.value[today] || []
  })

  const upcomingEvents = computed(() => {
    const now = new Date()
    return filteredEvents.value
      .filter(event => new Date(event.start as string) > now)
      .sort((a, b) => new Date(a.start as string).getTime() - new Date(b.start as string).getTime())
      .slice(0, 5)
  })

  // Actions
  const loadEvents = async (startDate?: Date, endDate?: Date) => {
    try {
      loading.value = true
      error.value = null

      // スケジュールデータを取得
      await schedulesStore.fetchSchedules()
      
      const calendarEvents: CalendarEvent[] = []

      // 各スケジュールをカレンダーイベントに変換
      schedulesStore.schedules.forEach(schedule => {
        const event = scheduleToCalendarEvent(schedule)
        if (event) {
          calendarEvents.push(event)
        }

        // 繰り返しスケジュールの場合、複数のイベントを生成
        if (schedule.type === 'recurring' && schedule.repeatRule?.weekdays) {
          const recurringEvents = generateRecurringEvents(schedule, startDate, endDate)
          calendarEvents.push(...recurringEvents)
        }
      })

      events.value = calendarEvents

    } catch (err: any) {
      error.value = err.message || 'イベントの読み込みに失敗しました'
      console.error('カレンダーイベント読み込みエラー:', err)
    } finally {
      loading.value = false
    }
  }

  const scheduleToCalendarEvent = (schedule: Schedule): CalendarEvent | null => {
    if (!schedule.nextRunAt) return null

    const eventDate = schedule.nextRunAt.seconds 
      ? new Date(schedule.nextRunAt.seconds * 1000)
      : new Date(schedule.nextRunAt)

    const event: CalendarEvent = {
      id: schedule.id,
      title: schedule.title || 'Instagram投稿',
      start: eventDate,
      backgroundColor: getEventColor(schedule),
      borderColor: getEventColor(schedule),
      textColor: '#FFFFFF',
      allDay: false,
      extendedProps: {
        schedule,
        type: 'schedule',
        status: schedule.status,
        description: schedule.description,
        igAccountName: schedule.igAccount?.username,
        contentPreview: schedule.content?.caption?.substring(0, 50)
      }
    }

    return event
  }

  const generateRecurringEvents = (
    schedule: Schedule, 
    startDate?: Date, 
    endDate?: Date
  ): CalendarEvent[] => {
    const events: CalendarEvent[] = []
    
    if (!schedule.repeatRule?.weekdays || !schedule.repeatRule?.time) {
      return events
    }

    const start = startDate || new Date()
    const end = endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90日後

    const [hours, minutes] = schedule.repeatRule.time.split(':').map(Number)

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const weekday = date.getDay()
      
      if (schedule.repeatRule.weekdays.includes(weekday)) {
        const eventDate = new Date(date)
        eventDate.setHours(hours, minutes, 0, 0)

        events.push({
          id: `${schedule.id}-${eventDate.toISOString()}`,
          title: `${schedule.title} (繰り返し)`,
          start: eventDate,
          backgroundColor: getEventColor(schedule),
          borderColor: getEventColor(schedule),
          textColor: '#FFFFFF',
          allDay: false,
          extendedProps: {
            schedule,
            type: 'schedule',
            status: schedule.status,
            description: schedule.description,
            igAccountName: schedule.igAccount?.username,
            contentPreview: schedule.content?.caption?.substring(0, 50)
          }
        })
      }
    }

    return events
  }

  const getEventColor = (schedule: Schedule): string => {
    // ステータス優先
    if (schedule.status === 'completed') {
      return settings.value.colorScheme.completed
    }
    if (schedule.status === 'error') {
      return settings.value.colorScheme.failed
    }
    if (schedule.status === 'paused') {
      return settings.value.colorScheme.paused
    }

    // スケジュールタイプによる色分け
    switch (schedule.type) {
      case 'one_time':
        return settings.value.colorScheme.oneTime
      case 'recurring':
        return settings.value.colorScheme.recurring
      case 'random':
        return settings.value.colorScheme.random
      default:
        return settings.value.colorScheme.oneTime
    }
  }

  const updateView = (view: CalendarSettings['view']) => {
    currentView.value = view
    settings.value.view = view
  }

  const updateFilters = (filters: Partial<CalendarSettings['eventFilters']>) => {
    settings.value.eventFilters = {
      ...settings.value.eventFilters,
      ...filters
    }
  }

  const updateColorScheme = (colors: Partial<CalendarSettings['colorScheme']>) => {
    settings.value.colorScheme = {
      ...settings.value.colorScheme,
      ...colors
    }
  }

  const navigateToDate = (date: Date) => {
    selectedDate.value = date
  }

  const getEventDetails = (eventId: string): CalendarEvent | null => {
    return events.value.find(event => event.id === eventId) || null
  }

  const formatEventTime = (date: Date | string): string => {
    const eventDate = typeof date === 'string' ? new Date(date) : date
    return eventDate.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatEventDate = (date: Date | string): string => {
    const eventDate = typeof date === 'string' ? new Date(date) : date
    return eventDate.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  const getScheduleTypeText = (type: string): string => {
    switch (type) {
      case 'one_time':
        return '一回のみ'
      case 'recurring':
        return '繰り返し'
      case 'random':
        return 'ランダム'
      default:
        return '不明'
    }
  }

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'active':
        return 'アクティブ'
      case 'paused':
        return '一時停止'
      case 'completed':
        return '完了'
      case 'error':
        return 'エラー'
      default:
        return '不明'
    }
  }

  const refreshEvents = async () => {
    await loadEvents()
  }

  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    events.value = []
    currentView.value = 'dayGridMonth'
    selectedDate.value = new Date()
    loading.value = false
    error.value = null
  }

  return {
    // State
    events,
    currentView,
    selectedDate,
    loading,
    error,
    settings,
    
    // Getters
    filteredEvents,
    eventsByDate,
    todayEvents,
    upcomingEvents,
    
    // Actions
    loadEvents,
    updateView,
    updateFilters,
    updateColorScheme,
    navigateToDate,
    getEventDetails,
    formatEventTime,
    formatEventDate,
    getScheduleTypeText,
    getStatusText,
    refreshEvents,
    clearError,
    reset
  }
})