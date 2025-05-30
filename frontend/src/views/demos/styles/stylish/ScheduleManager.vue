<template>
  <div class="stylish-schedule">
    <!-- Header -->
    <header class="schedule-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">Schedule Mastery</h1>
          <p class="page-subtitle">Orchestrate your content with precision</p>
        </div>
        <div class="header-actions">
          <div class="view-switcher">
            <button 
              v-for="view in viewOptions" 
              :key="view.value"
              :class="['view-btn', { active: currentView === view.value }]"
              @click="currentView = view.value"
            >
              {{ view.label }}
            </button>
          </div>
          <button class="btn-primary" @click="showCreateModal = true">
            Create Schedule
          </button>
        </div>
      </div>
    </header>

    <!-- Calendar View -->
    <section v-if="currentView === 'calendar'" class="calendar-section">
      <div class="calendar-container">
        <!-- Calendar Header -->
        <div class="calendar-header">
          <div class="calendar-nav">
            <button class="nav-btn" @click="previousMonth">‹</button>
            <h2 class="calendar-title">{{ currentMonthYear }}</h2>
            <button class="nav-btn" @click="nextMonth">›</button>
          </div>
          <div class="calendar-actions">
            <button class="btn-secondary">Today</button>
          </div>
        </div>

        <!-- Calendar Grid -->
        <div class="calendar-grid">
          <!-- Weekday Headers -->
          <div class="weekday-headers">
            <div 
              v-for="day in weekdays" 
              :key="day"
              class="weekday-header"
            >
              {{ day }}
            </div>
          </div>

          <!-- Calendar Days -->
          <div class="calendar-days">
            <div 
              v-for="(day, index) in calendarDays" 
              :key="index"
              :class="['calendar-day', { 
                'other-month': !day.isCurrentMonth,
                'today': day.isToday,
                'has-events': day.events.length > 0
              }]"
            >
              <div class="day-number">{{ day.number }}</div>
              <div class="day-events">
                <div 
                  v-for="(event, eventIndex) in day.events.slice(0, 3)" 
                  :key="eventIndex"
                  :class="['event-dot', event.type]"
                  @click="viewEvent(event)"
                >
                  <span class="event-time">{{ event.time }}</span>
                  <span class="event-title">{{ event.title }}</span>
                </div>
                <div 
                  v-if="day.events.length > 3" 
                  class="event-more"
                >
                  +{{ day.events.length - 3 }} more
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Timeline View -->
    <section v-if="currentView === 'timeline'" class="timeline-section">
      <div class="timeline-container">
        <div class="timeline-filters">
          <select class="filter-select">
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <select class="filter-select">
            <option value="all">All Types</option>
            <option value="post">Posts</option>
            <option value="story">Stories</option>
            <option value="reel">Reels</option>
          </select>
        </div>

        <div class="timeline-content">
          <div 
            v-for="(item, index) in timelineItems" 
            :key="index"
            class="timeline-item"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <div class="timeline-time">
              <div class="time-hour">{{ item.hour }}</div>
              <div class="time-minute">{{ item.minute }}</div>
            </div>
            <div class="timeline-line">
              <div class="timeline-dot" :class="item.status"></div>
            </div>
            <div class="timeline-content-card">
              <div class="content-header">
                <h3 class="content-title">{{ item.title }}</h3>
                <div class="content-status" :class="item.status">
                  {{ item.statusText }}
                </div>
              </div>
              <p class="content-description">{{ item.description }}</p>
              <div class="content-meta">
                <div class="meta-item">
                  <span class="meta-label">Account:</span>
                  <span class="meta-value">{{ item.account }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Type:</span>
                  <span class="meta-value">{{ item.type }}</span>
                </div>
              </div>
              <div class="content-actions">
                <button class="action-btn edit" @click="editSchedule(item)">
                  Edit
                </button>
                <button class="action-btn delete" @click="deleteSchedule(item)">
                  Delete
                </button>
                <button class="action-btn preview" @click="previewContent(item)">
                  Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- List View -->
    <section v-if="currentView === 'list'" class="list-section">
      <div class="list-container">
        <div class="list-header">
          <div class="list-stats">
            <div class="stat-item">
              <span class="stat-value">{{ totalScheduled }}</span>
              <span class="stat-label">Scheduled</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ pendingCount }}</span>
              <span class="stat-label">Pending</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ completedCount }}</span>
              <span class="stat-label">Completed</span>
            </div>
          </div>
          <div class="list-filters">
            <input 
              type="text" 
              placeholder="Search schedules..."
              class="search-input"
              v-model="searchQuery"
            />
            <select class="filter-select">
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        <div class="schedule-list">
          <div 
            v-for="(schedule, index) in filteredSchedules" 
            :key="index"
            class="schedule-item"
            :class="schedule.status"
          >
            <div class="schedule-time">
              <div class="time-date">{{ schedule.date }}</div>
              <div class="time-clock">{{ schedule.time }}</div>
            </div>
            <div class="schedule-content">
              <div class="content-preview">
                <div class="preview-image" :style="{ background: schedule.color }">
                  <span class="preview-icon">{{ schedule.icon }}</span>
                </div>
              </div>
              <div class="content-details">
                <h3 class="content-title">{{ schedule.title }}</h3>
                <p class="content-caption">{{ schedule.caption }}</p>
                <div class="content-tags">
                  <span 
                    v-for="tag in schedule.tags" 
                    :key="tag"
                    class="tag"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
            <div class="schedule-status">
              <div class="status-indicator" :class="schedule.status">
                {{ schedule.statusText }}
              </div>
              <div class="schedule-actions">
                <button class="action-btn-small">⋯</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Create Schedule Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">Create New Schedule</h2>
          <button class="modal-close" @click="showCreateModal = false">×</button>
        </div>
        <div class="modal-body">
          <form class="schedule-form">
            <div class="form-section">
              <h3 class="section-title">Content Details</h3>
              <div class="form-group">
                <label class="form-label">Title</label>
                <input type="text" class="form-input" placeholder="Enter post title" />
              </div>
              <div class="form-group">
                <label class="form-label">Caption</label>
                <textarea class="form-textarea" placeholder="Write your caption..." rows="4"></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Content Type</label>
                <select class="form-select">
                  <option value="post">Regular Post</option>
                  <option value="story">Story</option>
                  <option value="reel">Reel</option>
                </select>
              </div>
            </div>

            <div class="form-section">
              <h3 class="section-title">Schedule Settings</h3>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Date</label>
                  <input type="date" class="form-input" />
                </div>
                <div class="form-group">
                  <label class="form-label">Time</label>
                  <input type="time" class="form-input" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Account</label>
                <select class="form-select">
                  <option value="main">@company_official</option>
                  <option value="creative">@creative_studio</option>
                </select>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showCreateModal = false">
            Cancel
          </button>
          <button class="btn-primary" @click="createSchedule">
            Create Schedule
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const currentView = ref('calendar')
const showCreateModal = ref(false)
const searchQuery = ref('')
const currentDate = ref(new Date())

const viewOptions = [
  { label: 'Calendar', value: 'calendar' },
  { label: 'Timeline', value: 'timeline' },
  { label: 'List', value: 'list' }
]

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const currentMonthYear = computed(() => {
  const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' }
  return currentDate.value.toLocaleDateString('en-US', options)
})

// Sample data
const scheduleData = [
  {
    id: 1,
    title: 'Morning Motivation',
    caption: 'Start your day with positive energy! ✨',
    date: 'Dec 15',
    time: '09:00',
    hour: '09',
    minute: '00',
    account: '@company_official',
    type: 'Post',
    status: 'scheduled',
    statusText: 'Scheduled',
    icon: '📸',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    tags: ['motivation', 'morning']
  },
  {
    id: 2,
    title: 'Product Showcase',
    caption: 'Introducing our latest collection 🎯',
    date: 'Dec 15',
    time: '14:30',
    hour: '14',
    minute: '30',
    account: '@creative_studio',
    type: 'Reel',
    status: 'published',
    statusText: 'Published',
    icon: '🎬',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    tags: ['product', 'showcase']
  },
  {
    id: 3,
    title: 'Behind the Scenes',
    caption: 'Take a peek at our creative process 👀',
    date: 'Dec 16',
    time: '18:00',
    hour: '18',
    minute: '00',
    account: '@company_official',
    type: 'Story',
    status: 'scheduled',
    statusText: 'Scheduled',
    icon: '📷',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    tags: ['bts', 'process']
  }
]

const timelineItems = computed(() => scheduleData)

const totalScheduled = computed(() => scheduleData.length)
const pendingCount = computed(() => scheduleData.filter(s => s.status === 'scheduled').length)
const completedCount = computed(() => scheduleData.filter(s => s.status === 'published').length)

const filteredSchedules = computed(() => {
  return scheduleData.filter(schedule => 
    schedule.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    schedule.caption.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Calendar data
const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = (firstDay.getDay() + 6) % 7 // Monday = 0

  const days = []
  
  // Previous month days
  const prevMonth = new Date(year, month - 1, 0)
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    days.push({
      number: prevMonth.getDate() - i,
      isCurrentMonth: false,
      isToday: false,
      events: []
    })
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const isToday = date.toDateString() === new Date().toDateString()
    
    // Sample events for demonstration
    const events = day === 15 ? [
      { time: '09:00', title: 'Morning Post', type: 'post' },
      { time: '14:30', title: 'Product Reel', type: 'reel' }
    ] : day === 16 ? [
      { time: '18:00', title: 'Story Update', type: 'story' }
    ] : []
    
    days.push({
      number: day,
      isCurrentMonth: true,
      isToday,
      events
    })
  }
  
  // Next month days to complete the grid
  const remainingDays = 42 - days.length
  for (let day = 1; day <= remainingDays; day++) {
    days.push({
      number: day,
      isCurrentMonth: false,
      isToday: false,
      events: []
    })
  }
  
  return days
})

const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const viewEvent = (event: any) => {
  console.log('View event:', event)
}

const editSchedule = (item: any) => {
  console.log('Edit schedule:', item)
}

const deleteSchedule = (item: any) => {
  console.log('Delete schedule:', item)
}

const previewContent = (item: any) => {
  console.log('Preview content:', item)
}

const createSchedule = () => {
  showCreateModal.value = false
  console.log('Create new schedule')
}
</script>

<style scoped>
.stylish-schedule {
  background: #000;
  color: #fff;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  min-height: 100vh;
  padding: 2rem;
}

/* Header */
.schedule-header {
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
  align-items: center;
  gap: 2rem;
}

.view-switcher {
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #333;
  border-radius: 6px;
  overflow: hidden;
}

.view-btn {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.view-btn.active {
  background: linear-gradient(135deg, #7877C6 0%, #C6A6F7 100%);
  color: #fff;
}

.btn-primary {
  background: linear-gradient(135deg, #7877C6 0%, #C6A6F7 100%);
  border: none;
  color: #fff;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(120, 119, 198, 0.3);
}

.btn-secondary {
  background: transparent;
  border: 1px solid #333;
  color: #fff;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: #555;
}

/* Calendar Section */
.calendar-container {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid #222;
  border-radius: 8px;
  overflow: hidden;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 1px solid #222;
}

.calendar-nav {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-btn {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #333;
  border-radius: 50%;
  color: #fff;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #555;
}

.calendar-title {
  font-size: 1.5rem;
  font-weight: 400;
  letter-spacing: -0.01em;
}

.calendar-grid {
  padding: 2rem;
}

.weekday-headers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  margin-bottom: 1rem;
}

.weekday-header {
  padding: 1rem;
  text-align: center;
  font-size: 0.875rem;
  font-weight: 500;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #222;
}

.calendar-day {
  background: #111;
  min-height: 120px;
  padding: 0.75rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.calendar-day:hover {
  background: #1a1a1a;
}

.calendar-day.other-month {
  opacity: 0.3;
}

.calendar-day.today {
  background: rgba(120, 119, 198, 0.1);
  border: 1px solid #7877C6;
}

.calendar-day.has-events {
  background: rgba(120, 119, 198, 0.05);
}

.day-number {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.day-events {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.event-dot {
  background: rgba(120, 119, 198, 0.2);
  border-left: 3px solid #7877C6;
  padding: 0.25rem 0.5rem;
  border-radius: 0 4px 4px 0;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.event-dot:hover {
  background: rgba(120, 119, 198, 0.3);
  transform: translateX(2px);
}

.event-dot.post {
  border-left-color: #7877C6;
}

.event-dot.story {
  border-left-color: #C6A6F7;
}

.event-dot.reel {
  border-left-color: #f093fb;
}

.event-time {
  display: block;
  font-weight: 500;
  color: #7877C6;
}

.event-title {
  display: block;
  color: #ccc;
}

.event-more {
  font-size: 0.75rem;
  color: #888;
  margin-top: 0.25rem;
}

/* Timeline Section */
.timeline-container {
  max-width: 800px;
  margin: 0 auto;
}

.timeline-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.filter-select {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #333;
  color: #fff;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
}

.timeline-content {
  position: relative;
}

.timeline-item {
  display: flex;
  gap: 2rem;
  margin-bottom: 3rem;
  animation: slideInRight 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.timeline-time {
  text-align: center;
  min-width: 80px;
}

.time-hour {
  font-size: 2rem;
  font-weight: 200;
  color: #7877C6;
  line-height: 1;
}

.time-minute {
  font-size: 1rem;
  color: #888;
}

.timeline-line {
  position: relative;
  width: 2px;
  background: #333;
  margin-top: 1rem;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.timeline-dot.scheduled {
  background: #7877C6;
  box-shadow: 0 0 0 4px rgba(120, 119, 198, 0.2);
}

.timeline-dot.published {
  background: #4ade80;
  box-shadow: 0 0 0 4px rgba(74, 222, 128, 0.2);
}

.timeline-content-card {
  flex: 1;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid #222;
  border-radius: 8px;
  padding: 2rem;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.timeline-content-card:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: #333;
  transform: translateY(-2px);
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.content-title {
  font-size: 1.25rem;
  font-weight: 500;
  letter-spacing: -0.01em;
}

.content-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.content-status.scheduled {
  background: rgba(120, 119, 198, 0.2);
  color: #C6A6F7;
}

.content-status.published {
  background: rgba(74, 222, 128, 0.2);
  color: #4ade80;
}

.content-description {
  color: #888;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.content-meta {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.meta-item {
  font-size: 0.875rem;
}

.meta-label {
  color: #888;
  margin-right: 0.5rem;
}

.meta-value {
  color: #fff;
  font-weight: 500;
}

.content-actions {
  display: flex;
  gap: 1rem;
}

.action-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #333;
  background: transparent;
  color: #fff;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: #555;
}

.action-btn.edit:hover {
  background: rgba(120, 119, 198, 0.2);
  border-color: #7877C6;
  color: #C6A6F7;
}

.action-btn.delete:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
  color: #fca5a5;
}

.action-btn.preview:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: #3b82f6;
  color: #93c5fd;
}

/* List Section */
.list-container {
  max-width: 1000px;
  margin: 0 auto;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid #222;
  border-radius: 8px;
}

.list-stats {
  display: flex;
  gap: 3rem;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: 200;
  color: #7877C6;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.list-filters {
  display: flex;
  gap: 1rem;
}

.search-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #333;
  color: #fff;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  min-width: 200px;
}

.search-input::placeholder {
  color: #888;
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.schedule-item {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid #222;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.schedule-item:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: #333;
  transform: translateY(-2px);
}

.schedule-time {
  text-align: center;
  min-width: 100px;
}

.time-date {
  font-size: 0.875rem;
  color: #888;
  margin-bottom: 0.25rem;
}

.time-clock {
  font-size: 1.25rem;
  font-weight: 500;
  color: #7877C6;
}

.schedule-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
}

.content-preview {
  flex-shrink: 0;
}

.preview-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.content-details {
  flex: 1;
}

.content-title {
  font-size: 1.125rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.content-caption {
  color: #888;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
  line-height: 1.5;
}

.content-tags {
  display: flex;
  gap: 0.5rem;
}

.tag {
  background: rgba(120, 119, 198, 0.2);
  color: #C6A6F7;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.schedule-status {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-indicator {
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-indicator.scheduled {
  background: rgba(120, 119, 198, 0.2);
  color: #C6A6F7;
}

.status-indicator.published {
  background: rgba(74, 222, 128, 0.2);
  color: #4ade80;
}

.status-indicator.failed {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

.action-btn-small {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #333;
  border-radius: 4px;
  color: #888;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn-small:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

/* Modal */
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

.modal-content {
  background: #111;
  border: 1px solid #333;
  border-radius: 8px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  animation: modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 1px solid #222;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 400;
  letter-spacing: -0.01em;
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

.modal-body {
  padding: 2rem;
  max-height: 60vh;
  overflow-y: auto;
}

.schedule-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 500;
  color: #7877C6;
  margin-bottom: 0.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #ccc;
}

.form-input,
.form-textarea,
.form-select {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #333;
  color: #fff;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #7877C6;
  box-shadow: 0 0 0 3px rgba(120, 119, 198, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 2rem;
  border-top: 1px solid #222;
}

/* Animations */
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
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
@media (max-width: 768px) {
  .stylish-schedule {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: space-between;
  }
  
  .calendar-days {
    gap: 0;
  }
  
  .calendar-day {
    min-height: 80px;
    padding: 0.5rem;
  }
  
  .timeline-item {
    gap: 1rem;
  }
  
  .schedule-item {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .schedule-content {
    gap: 1rem;
  }
  
  .list-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .list-stats {
    gap: 2rem;
  }
  
  .modal-content {
    margin: 1rem;
    max-width: none;
  }
}
</style>