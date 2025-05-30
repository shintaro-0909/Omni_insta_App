<template>
  <div class="cyberpunk-scheduler">
    <div class="scanlines"></div>
    <div class="circuit-background"></div>
    
    <!-- Header -->
    <header class="scheduler-header">
      <div class="header-content">
        <h1 class="page-title">
          <span class="glitch-text" data-text="SCHEDULE">SCHEDULE</span>
          <span class="neon-text">MATRIX</span>
        </h1>
        <div class="header-actions">
          <button class="cyber-btn" @click="showCreateDialog = true">
            <span class="btn-icon">+</span>
            NEW SCHEDULE
          </button>
          <div class="view-toggle">
            <button 
              class="toggle-btn"
              :class="{ active: viewMode === 'timeline' }"
              @click="viewMode = 'timeline'"
            >
              TIMELINE
            </button>
            <button 
              class="toggle-btn"
              :class="{ active: viewMode === 'calendar' }"
              @click="viewMode = 'calendar'"
            >
              CALENDAR
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Timeline View -->
    <div v-if="viewMode === 'timeline'" class="timeline-view">
      <div class="timeline-container">
        <div class="timeline-header">
          <h2 class="timeline-title neon-cyan">NEURAL TIMELINE</h2>
          <div class="timeline-controls">
            <button class="time-filter" :class="{ active: timeFilter === 'today' }" @click="timeFilter = 'today'">TODAY</button>
            <button class="time-filter" :class="{ active: timeFilter === 'week' }" @click="timeFilter = 'week'">7 DAYS</button>
            <button class="time-filter" :class="{ active: timeFilter === 'month' }" @click="timeFilter = 'month'">30 DAYS</button>
          </div>
        </div>
        
        <div class="timeline-content">
          <div class="timeline-axis">
            <div class="time-markers">
              <div 
                class="time-marker"
                v-for="hour in timeMarkers"
                :key="hour"
                :style="{ left: getTimePosition(hour) + '%' }"
              >
                <span class="time-label">{{ hour }}:00</span>
                <div class="time-line"></div>
              </div>
            </div>
            
            <div class="schedule-tracks">
              <div 
                class="schedule-track"
                v-for="account in accounts"
                :key="account.id"
              >
                <div class="track-header">
                  <div class="account-avatar">
                    <img :src="account.avatar" :alt="account.name">
                    <div class="status-dot" :class="account.status"></div>
                  </div>
                  <div class="account-info">
                    <span class="account-name">{{ account.name }}</span>
                    <span class="account-handle">@{{ account.handle }}</span>
                  </div>
                  <div class="track-stats">
                    <span class="posts-count">{{ account.scheduledPosts }} POSTS</span>
                  </div>
                </div>
                
                <div class="track-timeline">
                  <div 
                    class="schedule-block"
                    v-for="schedule in getAccountSchedules(account.id)"
                    :key="schedule.id"
                    :style="{ 
                      left: getTimePosition(schedule.hour) + '%',
                      width: getBlockWidth(schedule.duration) + '%'
                    }"
                    :class="['schedule-' + schedule.type, { 'glitch-active': schedule.isProcessing }]"
                    @click="selectSchedule(schedule)"
                  >
                    <div class="schedule-content">
                      <span class="schedule-time">{{ schedule.time }}</span>
                      <span class="schedule-title">{{ schedule.title }}</span>
                      <div class="schedule-indicators">
                        <span v-if="schedule.hasMedia" class="indicator media">📷</span>
                        <span v-if="schedule.isRecurring" class="indicator recurring">🔄</span>
                        <span v-if="schedule.hasAI" class="indicator ai">🤖</span>
                      </div>
                    </div>
                    <div class="schedule-glow"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Calendar View -->
    <div v-if="viewMode === 'calendar'" class="calendar-view">
      <div class="calendar-container">
        <div class="calendar-header">
          <h2 class="calendar-title neon-magenta">CYBER CALENDAR</h2>
          <div class="calendar-navigation">
            <button class="nav-btn" @click="previousMonth">
              <span class="arrow">←</span>
            </button>
            <span class="current-month">{{ currentMonthYear }}</span>
            <button class="nav-btn" @click="nextMonth">
              <span class="arrow">→</span>
            </button>
          </div>
        </div>
        
        <div class="calendar-grid">
          <div class="calendar-weekdays">
            <div class="weekday" v-for="day in weekdays" :key="day">{{ day }}</div>
          </div>
          
          <div class="calendar-days">
            <div 
              class="calendar-day"
              v-for="day in calendarDays"
              :key="day.date"
              :class="{ 
                'other-month': !day.isCurrentMonth,
                'today': day.isToday,
                'has-schedules': day.schedules.length > 0
              }"
              @click="selectDay(day)"
            >
              <span class="day-number">{{ day.number }}</span>
              <div class="day-schedules">
                <div 
                  class="schedule-dot"
                  v-for="schedule in day.schedules.slice(0, 3)"
                  :key="schedule.id"
                  :class="'dot-' + schedule.type"
                  :title="schedule.title"
                ></div>
                <span v-if="day.schedules.length > 3" class="more-schedules">
                  +{{ day.schedules.length - 3 }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Schedule Details Panel -->
    <div class="details-panel" :class="{ open: selectedSchedule }">
      <div class="panel-header">
        <h3 class="panel-title">SCHEDULE DETAILS</h3>
        <button class="close-btn" @click="selectedSchedule = null">×</button>
      </div>
      
      <div v-if="selectedSchedule" class="panel-content">
        <div class="detail-section">
          <label class="detail-label">TITLE</label>
          <div class="detail-value">{{ selectedSchedule.title }}</div>
        </div>
        
        <div class="detail-section">
          <label class="detail-label">ACCOUNT</label>
          <div class="detail-value">{{ getAccountName(selectedSchedule.accountId) }}</div>
        </div>
        
        <div class="detail-section">
          <label class="detail-label">SCHEDULED TIME</label>
          <div class="detail-value">{{ selectedSchedule.scheduledTime }}</div>
        </div>
        
        <div class="detail-section">
          <label class="detail-label">TYPE</label>
          <div class="detail-value type-badge" :class="'type-' + selectedSchedule.type">
            {{ selectedSchedule.type.toUpperCase() }}
          </div>
        </div>
        
        <div class="detail-section">
          <label class="detail-label">STATUS</label>
          <div class="detail-value status-badge" :class="'status-' + selectedSchedule.status">
            {{ selectedSchedule.status.toUpperCase() }}
          </div>
        </div>
        
        <div v-if="selectedSchedule.content" class="detail-section">
          <label class="detail-label">CONTENT PREVIEW</label>
          <div class="content-preview">{{ selectedSchedule.content }}</div>
        </div>
        
        <div class="panel-actions">
          <button class="action-btn edit">MODIFY</button>
          <button class="action-btn duplicate">CLONE</button>
          <button class="action-btn delete">DELETE</button>
        </div>
      </div>
    </div>

    <!-- Create Schedule Dialog -->
    <div v-if="showCreateDialog" class="dialog-overlay" @click="showCreateDialog = false">
      <div class="create-dialog" @click.stop>
        <div class="dialog-header">
          <h3 class="dialog-title">NEW NEURAL SCHEDULE</h3>
          <button class="close-btn" @click="showCreateDialog = false">×</button>
        </div>
        
        <div class="dialog-content">
          <div class="form-section">
            <label class="form-label">SCHEDULE TYPE</label>
            <div class="type-selector">
              <button 
                class="type-option"
                v-for="type in scheduleTypes"
                :key="type.id"
                :class="{ active: newSchedule.type === type.id }"
                @click="newSchedule.type = type.id"
              >
                <div class="type-icon" v-html="type.icon"></div>
                <span class="type-name">{{ type.name }}</span>
              </button>
            </div>
          </div>
          
          <div class="form-section">
            <label class="form-label">TARGET ACCOUNT</label>
            <select class="cyber-select" v-model="newSchedule.accountId">
              <option value="">Select Account</option>
              <option 
                v-for="account in accounts"
                :key="account.id"
                :value="account.id"
              >
                {{ account.name }} (@{{ account.handle }})
              </option>
            </select>
          </div>
          
          <div class="form-section">
            <label class="form-label">TITLE</label>
            <input 
              type="text" 
              class="cyber-input"
              v-model="newSchedule.title"
              placeholder="Enter schedule title..."
            >
          </div>
          
          <div class="form-section">
            <label class="form-label">EXECUTION TIME</label>
            <div class="time-inputs">
              <input 
                type="date" 
                class="cyber-input"
                v-model="newSchedule.date"
              >
              <input 
                type="time" 
                class="cyber-input"
                v-model="newSchedule.time"
              >
            </div>
          </div>
        </div>
        
        <div class="dialog-actions">
          <button class="cyber-btn secondary" @click="showCreateDialog = false">
            CANCEL
          </button>
          <button class="cyber-btn primary" @click="createSchedule">
            CREATE SCHEDULE
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Reactive data
const viewMode = ref<'timeline' | 'calendar'>('timeline')
const timeFilter = ref('today')
const selectedSchedule = ref<any>(null)
const showCreateDialog = ref(false)
const currentDate = ref(new Date())

const newSchedule = ref({
  type: 'instant',
  accountId: '',
  title: '',
  date: '',
  time: ''
})

// Sample data
const accounts = ref([
  {
    id: 1,
    name: 'Tech Ninja',
    handle: 'tech_ninja',
    avatar: 'https://picsum.photos/40/40?random=1',
    status: 'online',
    scheduledPosts: 12
  },
  {
    id: 2,
    name: 'Neo Fashion',
    handle: 'neo_fashion',
    avatar: 'https://picsum.photos/40/40?random=2',
    status: 'online',
    scheduledPosts: 8
  },
  {
    id: 3,
    name: 'Cyber Life',
    handle: 'cyber_life',
    avatar: 'https://picsum.photos/40/40?random=3',
    status: 'offline',
    scheduledPosts: 5
  }
])

const schedules = ref([
  {
    id: 1,
    accountId: 1,
    title: 'Morning Tech Update',
    time: '09:00',
    hour: 9,
    duration: 1,
    type: 'instant',
    status: 'scheduled',
    isProcessing: false,
    hasMedia: true,
    isRecurring: false,
    hasAI: true,
    scheduledTime: '2024-01-15 09:00',
    content: 'Latest tech trends and AI developments...'
  },
  {
    id: 2,
    accountId: 1,
    title: 'Lunch Break Post',
    time: '12:30',
    hour: 12.5,
    duration: 0.5,
    type: 'recurring',
    status: 'active',
    isProcessing: true,
    hasMedia: false,
    isRecurring: true,
    hasAI: false,
    scheduledTime: '2024-01-15 12:30',
    content: 'Daily lunch update for followers...'
  },
  {
    id: 3,
    accountId: 2,
    title: 'Fashion Showcase',
    time: '15:00',
    hour: 15,
    duration: 2,
    type: 'random',
    status: 'scheduled',
    isProcessing: false,
    hasMedia: true,
    isRecurring: false,
    hasAI: true,
    scheduledTime: '2024-01-15 15:00',
    content: 'New collection preview with AI styling...'
  }
])

const scheduleTypes = ref([
  {
    id: 'instant',
    name: 'INSTANT',
    icon: '⚡'
  },
  {
    id: 'recurring',
    name: 'RECURRING',
    icon: '🔄'
  },
  {
    id: 'random',
    name: 'RANDOM',
    icon: '🎲'
  },
  {
    id: 'ai',
    name: 'AI MANAGED',
    icon: '🤖'
  }
])

const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

// Computed properties
const timeMarkers = computed(() => {
  const markers = []
  for (let i = 0; i < 24; i += 3) {
    markers.push(i)
  }
  return markers
})

const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  }).toUpperCase()
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const days = []
  const today = new Date()
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    const isCurrentMonth = date.getMonth() === month
    const isToday = date.toDateString() === today.toDateString()
    const daySchedules = schedules.value.filter(s => 
      new Date(s.scheduledTime).toDateString() === date.toDateString()
    )
    
    days.push({
      date: date.toISOString(),
      number: date.getDate(),
      isCurrentMonth,
      isToday,
      schedules: daySchedules
    })
  }
  
  return days
})

// Methods
const getTimePosition = (hour: number) => {
  return (hour / 24) * 100
}

const getBlockWidth = (duration: number) => {
  return (duration / 24) * 100
}

const getAccountSchedules = (accountId: number) => {
  return schedules.value.filter(s => s.accountId === accountId)
}

const getAccountName = (accountId: number) => {
  const account = accounts.value.find(a => a.id === accountId)
  return account ? account.name : 'Unknown'
}

const selectSchedule = (schedule: any) => {
  selectedSchedule.value = schedule
}

const selectDay = (day: any) => {
  if (day.schedules.length > 0) {
    selectedSchedule.value = day.schedules[0]
  }
}

const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const createSchedule = () => {
  // Create new schedule logic
  const newId = Math.max(...schedules.value.map(s => s.id)) + 1
  const datetime = `${newSchedule.value.date} ${newSchedule.value.time}`
  const hour = parseInt(newSchedule.value.time.split(':')[0])
  
  schedules.value.push({
    id: newId,
    accountId: parseInt(newSchedule.value.accountId),
    title: newSchedule.value.title,
    time: newSchedule.value.time,
    hour: hour,
    duration: 1,
    type: newSchedule.value.type,
    status: 'scheduled',
    isProcessing: false,
    hasMedia: false,
    isRecurring: false,
    hasAI: false,
    scheduledTime: datetime,
    content: ''
  })
  
  showCreateDialog.value = false
  
  // Reset form
  newSchedule.value = {
    type: 'instant',
    accountId: '',
    title: '',
    date: '',
    time: ''
  }
}

onMounted(() => {
  // Initialize with today's date
  const today = new Date()
  newSchedule.value.date = today.toISOString().split('T')[0]
  newSchedule.value.time = '12:00'
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

/* Base Styles */
.cyberpunk-scheduler {
  min-height: 100vh;
  background: #000;
  color: #00ffff;
  font-family: 'Orbitron', monospace;
  position: relative;
  padding: 1rem;
}

/* Effects */
.scanlines {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent 50%,
    rgba(0, 255, 255, 0.02) 51%
  );
  background-size: 100% 3px;
  pointer-events: none;
  z-index: 1;
}

.circuit-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(0, 255, 255, 0.1) 1px, transparent 1px),
    radial-gradient(circle at 75% 75%, rgba(255, 0, 255, 0.1) 1px, transparent 1px);
  background-size: 100px 100px;
  pointer-events: none;
  z-index: 0;
}

/* Header */
.scheduler-header {
  position: relative;
  z-index: 2;
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
}

.page-title {
  font-size: 2.5rem;
  font-weight: 900;
  margin: 0;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.cyber-btn {
  background: transparent;
  border: 2px solid #00ffff;
  color: #00ffff;
  padding: 0.75rem 1.5rem;
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.cyber-btn:hover {
  background: rgba(0, 255, 255, 0.1);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
}

.cyber-btn.primary {
  border-color: #ff00ff;
  color: #ff00ff;
}

.cyber-btn.primary:hover {
  background: rgba(255, 0, 255, 0.1);
  box-shadow: 0 0 20px rgba(255, 0, 255, 0.5);
}

.cyber-btn.secondary {
  border-color: rgba(0, 255, 255, 0.5);
  color: rgba(0, 255, 255, 0.7);
}

.btn-icon {
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.view-toggle {
  display: flex;
  border: 1px solid #00ffff;
  border-radius: 4px;
  overflow: hidden;
}

.toggle-btn {
  background: transparent;
  border: none;
  color: #00ffff;
  padding: 0.5rem 1rem;
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-btn.active {
  background: rgba(0, 255, 255, 0.2);
  color: #ff00ff;
}

/* Timeline View */
.timeline-view {
  position: relative;
  z-index: 2;
}

.timeline-container {
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #00ffff;
  border-radius: 8px;
  overflow: hidden;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(0, 255, 255, 0.1);
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
}

.timeline-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.timeline-controls {
  display: flex;
  gap: 0.5rem;
}

.time-filter {
  background: transparent;
  border: 1px solid #00ffff;
  color: #00ffff;
  padding: 0.25rem 0.75rem;
  font-family: 'Orbitron', monospace;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.time-filter.active {
  background: rgba(255, 0, 255, 0.2);
  border-color: #ff00ff;
  color: #ff00ff;
}

.timeline-content {
  padding: 2rem;
}

.time-markers {
  position: relative;
  height: 40px;
  margin-bottom: 2rem;
}

.time-marker {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
}

.time-label {
  font-size: 0.8rem;
  color: rgba(0, 255, 255, 0.7);
  display: block;
  margin-bottom: 0.5rem;
}

.time-line {
  width: 1px;
  height: 30px;
  background: rgba(0, 255, 255, 0.3);
}

.schedule-tracks {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.schedule-track {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.track-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 300px;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 4px;
}

.account-avatar {
  position: relative;
}

.account-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #00ffff;
}

.status-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #000;
}

.status-dot.online { background: #00ff00; }
.status-dot.offline { background: #ff0040; }

.account-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.account-name {
  font-weight: 700;
  color: #00ffff;
}

.account-handle {
  font-size: 0.8rem;
  color: rgba(0, 255, 255, 0.7);
}

.track-stats {
  text-align: right;
}

.posts-count {
  font-size: 0.8rem;
  color: #ff00ff;
  font-weight: 700;
}

.track-timeline {
  position: relative;
  flex: 1;
  height: 60px;
  background: rgba(0, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.1);
  border-radius: 4px;
}

.schedule-block {
  position: absolute;
  top: 10px;
  height: 40px;
  background: rgba(0, 255, 255, 0.2);
  border: 1px solid #00ffff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.schedule-block:hover {
  border-color: #ff00ff;
  background: rgba(255, 0, 255, 0.2);
  transform: translateY(-2px);
}

.schedule-instant {
  border-color: #00ffff;
  background: rgba(0, 255, 255, 0.2);
}

.schedule-recurring {
  border-color: #ffff00;
  background: rgba(255, 255, 0, 0.2);
}

.schedule-random {
  border-color: #ff00ff;
  background: rgba(255, 0, 255, 0.2);
}

.schedule-block.glitch-active {
  animation: schedule-glitch 0.5s infinite;
}

.schedule-content {
  padding: 0.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.schedule-time {
  font-size: 0.7rem;
  font-weight: 700;
  color: currentColor;
}

.schedule-title {
  font-size: 0.8rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.schedule-indicators {
  display: flex;
  gap: 0.25rem;
}

.indicator {
  font-size: 0.7rem;
}

/* Calendar View */
.calendar-view {
  position: relative;
  z-index: 2;
}

.calendar-container {
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #00ffff;
  border-radius: 8px;
  overflow: hidden;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 0, 255, 0.1);
  border-bottom: 1px solid rgba(255, 0, 255, 0.3);
}

.calendar-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.calendar-navigation {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-btn {
  background: transparent;
  border: 1px solid #ff00ff;
  color: #ff00ff;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background: rgba(255, 0, 255, 0.2);
  box-shadow: 0 0 15px rgba(255, 0, 255, 0.5);
}

.current-month {
  font-size: 1.2rem;
  font-weight: 700;
  color: #ff00ff;
  min-width: 200px;
  text-align: center;
}

.calendar-grid {
  padding: 1rem;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  margin-bottom: 1rem;
}

.weekday {
  text-align: center;
  padding: 0.5rem;
  font-weight: 700;
  color: rgba(0, 255, 255, 0.7);
  font-size: 0.8rem;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
}

.calendar-day {
  aspect-ratio: 1;
  border: 1px solid rgba(0, 255, 255, 0.2);
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.3);
}

.calendar-day:hover {
  border-color: #ff00ff;
  background: rgba(255, 0, 255, 0.1);
}

.calendar-day.other-month {
  opacity: 0.3;
}

.calendar-day.today {
  border-color: #00ff00;
  background: rgba(0, 255, 0, 0.1);
}

.calendar-day.has-schedules {
  border-color: #ff00ff;
}

.day-number {
  font-weight: 700;
  color: #00ffff;
}

.day-schedules {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  margin-top: 0.25rem;
}

.schedule-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.dot-instant { background: #00ffff; }
.dot-recurring { background: #ffff00; }
.dot-random { background: #ff00ff; }

.more-schedules {
  font-size: 0.6rem;
  color: rgba(0, 255, 255, 0.7);
}

/* Details Panel */
.details-panel {
  position: fixed;
  top: 0;
  right: -400px;
  width: 400px;
  height: 100vh;
  background: rgba(0, 0, 0, 0.95);
  border-left: 1px solid #00ffff;
  transition: right 0.3s ease;
  z-index: 100;
  overflow-y: auto;
}

.details-panel.open {
  right: 0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
  background: rgba(0, 255, 255, 0.1);
}

.panel-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
  color: #00ffff;
}

.close-btn {
  background: transparent;
  border: none;
  color: rgba(0, 255, 255, 0.7);
  font-size: 1.5rem;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #ff0040;
}

.panel-content {
  padding: 1rem;
}

.detail-section {
  margin-bottom: 1.5rem;
}

.detail-label {
  display: block;
  font-size: 0.8rem;
  color: rgba(0, 255, 255, 0.7);
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.detail-value {
  color: #00ffff;
  font-weight: 700;
}

.type-badge,
.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 700;
}

.type-instant { background: rgba(0, 255, 255, 0.2); border: 1px solid #00ffff; }
.type-recurring { background: rgba(255, 255, 0, 0.2); border: 1px solid #ffff00; }
.type-random { background: rgba(255, 0, 255, 0.2); border: 1px solid #ff00ff; }

.status-scheduled { background: rgba(0, 255, 0, 0.2); border: 1px solid #00ff00; }
.status-active { background: rgba(255, 255, 0, 0.2); border: 1px solid #ffff00; }

.content-preview {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 255, 255, 0.3);
  padding: 1rem;
  border-radius: 4px;
  color: rgba(0, 255, 255, 0.8);
  line-height: 1.5;
}

.panel-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 2rem;
}

.action-btn {
  background: transparent;
  border: 1px solid #00ffff;
  color: #00ffff;
  padding: 0.75rem;
  font-family: 'Orbitron', monospace;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(0, 255, 255, 0.1);
}

.action-btn.edit {
  border-color: #ffff00;
  color: #ffff00;
}

.action-btn.edit:hover {
  background: rgba(255, 255, 0, 0.1);
}

.action-btn.delete {
  border-color: #ff0040;
  color: #ff0040;
}

.action-btn.delete:hover {
  background: rgba(255, 0, 64, 0.1);
}

/* Create Dialog */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.create-dialog {
  background: rgba(0, 0, 0, 0.95);
  border: 2px solid #00ffff;
  border-radius: 8px;
  width: 600px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
  background: rgba(0, 255, 255, 0.1);
}

.dialog-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
  color: #00ffff;
}

.dialog-content {
  padding: 1.5rem;
}

.form-section {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.8rem;
  color: rgba(0, 255, 255, 0.7);
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.type-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.type-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: transparent;
  border: 1px solid rgba(0, 255, 255, 0.3);
  color: #00ffff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.type-option:hover,
.type-option.active {
  border-color: #ff00ff;
  background: rgba(255, 0, 255, 0.1);
  color: #ff00ff;
}

.type-icon {
  font-size: 1.5rem;
}

.type-name {
  font-size: 0.8rem;
  font-weight: 700;
}

.cyber-select,
.cyber-input {
  width: 100%;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid #00ffff;
  color: #00ffff;
  padding: 0.75rem;
  font-family: 'Orbitron', monospace;
  border-radius: 4px;
  outline: none;
  transition: all 0.3s ease;
}

.cyber-select:focus,
.cyber-input:focus {
  border-color: #ff00ff;
  box-shadow: 0 0 10px rgba(255, 0, 255, 0.3);
}

.time-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.dialog-actions {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid rgba(0, 255, 255, 0.3);
  justify-content: flex-end;
}

/* Neon Effects */
.neon-text {
  text-shadow: 
    0 0 5px currentColor,
    0 0 10px currentColor,
    0 0 20px currentColor;
}

.neon-cyan {
  color: #00ffff;
  text-shadow: 0 0 10px #00ffff;
}

.neon-magenta {
  color: #ff00ff;
  text-shadow: 0 0 10px #ff00ff;
}

/* Glitch Effect */
.glitch-text {
  position: relative;
}

.glitch-text::before,
.glitch-text::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
}

.glitch-text:hover::before {
  animation: glitch-1 0.2s infinite;
  color: #ff00ff;
  opacity: 0.8;
}

.glitch-text:hover::after {
  animation: glitch-2 0.2s infinite;
  color: #00ff00;
  opacity: 0.8;
}

/* Animations */
@keyframes schedule-glitch {
  0%, 100% { transform: translate(0); }
  10% { transform: translate(-1px, -1px); }
  20% { transform: translate(1px, 1px); }
  30% { transform: translate(-1px, 1px); }
  40% { transform: translate(1px, -1px); }
  50% { transform: translate(-1px, -1px); }
  60% { transform: translate(1px, 1px); }
  70% { transform: translate(-1px, 1px); }
  80% { transform: translate(1px, -1px); }
  90% { transform: translate(-1px, -1px); }
}

@keyframes glitch-1 {
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0); }
}

@keyframes glitch-2 {
  0% { transform: translate(0); }
  20% { transform: translate(2px, -2px); }
  40% { transform: translate(2px, 2px); }
  60% { transform: translate(-2px, -2px); }
  80% { transform: translate(-2px, 2px); }
  100% { transform: translate(0); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .schedule-track {
    flex-direction: column;
    align-items: stretch;
  }
  
  .track-timeline {
    height: 80px;
  }
  
  .details-panel {
    width: 100%;
    right: -100%;
  }
  
  .create-dialog {
    width: 95vw;
    margin: 1rem;
  }
  
  .type-selector {
    grid-template-columns: 1fr;
  }
  
  .calendar-days {
    font-size: 0.8rem;
  }
}
</style>