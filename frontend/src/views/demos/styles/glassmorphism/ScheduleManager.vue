<template>
  <div class="glassmorphism-schedule">
    <!-- Animated Background -->
    <div class="animated-bg">
      <div class="wave wave-1"></div>
      <div class="wave wave-2"></div>
      <div class="wave wave-3"></div>
    </div>

    <v-container fluid class="pa-6">
      <!-- Header -->
      <div class="schedule-header mb-8">
        <h1 class="schedule-title">Schedule Manager</h1>
        <p class="schedule-subtitle">Plan and organize your Instagram content calendar</p>
      </div>

      <!-- Control Panel -->
      <div class="glass-card control-panel mb-6">
        <v-row align="center">
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedAccount"
              :items="accounts"
              item-title="name"
              item-value="id"
              label="Select Account"
              variant="outlined"
              density="comfortable"
              class="glass-select"
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="viewMode"
              :items="viewModes"
              label="View Mode"
              variant="outlined"
              density="comfortable"
              class="glass-select"
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="searchQuery"
              label="Search posts..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              class="glass-input"
              clearable
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="3" class="text-md-end">
            <v-btn class="glass-btn primary-btn" size="large">
              <v-icon start>mdi-plus</v-icon>
              Create New Post
            </v-btn>
          </v-col>
        </v-row>
      </div>

      <!-- Calendar View -->
      <div v-if="viewMode === 'Calendar'" class="glass-card calendar-container mb-6">
        <div class="calendar-header">
          <v-btn icon class="glass-btn" @click="previousMonth">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <h2 class="calendar-month">{{ currentMonth }}</h2>
          <v-btn icon class="glass-btn" @click="nextMonth">
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </div>
        <div class="calendar-grid">
          <div v-for="day in weekDays" :key="day" class="calendar-weekday">
            {{ day }}
          </div>
          <div 
            v-for="date in calendarDates" 
            :key="date.date"
            class="calendar-date"
            :class="{ 
              'other-month': date.otherMonth,
              'today': date.isToday,
              'has-posts': date.posts.length > 0
            }"
          >
            <span class="date-number">{{ date.day }}</span>
            <div v-if="date.posts.length > 0" class="date-posts">
              <div 
                v-for="(post, idx) in date.posts.slice(0, 3)" 
                :key="idx"
                class="post-indicator"
                :style="{ background: post.color }"
              ></div>
              <span v-if="date.posts.length > 3" class="more-posts">
                +{{ date.posts.length - 3 }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Timeline View -->
      <div v-else-if="viewMode === 'Timeline'" class="timeline-container">
        <div v-for="(day, index) in timelineDays" :key="index" class="timeline-day mb-6">
          <div class="glass-card timeline-header">
            <h3 class="timeline-date">{{ day.date }}</h3>
            <span class="timeline-count">{{ day.posts.length }} posts</span>
          </div>
          <div class="timeline-posts">
            <div v-for="post in day.posts" :key="post.id" class="glass-card timeline-post">
              <div class="post-time">
                <v-icon size="20">mdi-clock-outline</v-icon>
                {{ post.time }}
              </div>
              <div class="post-content">
                <v-avatar size="40" class="mr-3">
                  <img :src="post.accountAvatar" :alt="post.accountName">
                </v-avatar>
                <div class="post-details">
                  <h4 class="post-title">{{ post.title }}</h4>
                  <p class="post-account">@{{ post.accountHandle }}</p>
                </div>
              </div>
              <div class="post-actions">
                <v-btn icon size="small" class="glass-btn">
                  <v-icon size="18">mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon size="small" class="glass-btn">
                  <v-icon size="18">mdi-content-copy</v-icon>
                </v-btn>
                <v-btn icon size="small" class="glass-btn">
                  <v-icon size="18">mdi-delete</v-icon>
                </v-btn>
              </div>
              <div class="post-status" :class="post.status">
                <v-icon size="16">{{ getStatusIcon(post.status) }}</v-icon>
                {{ post.status }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else class="glass-card list-container">
        <v-data-table
          :headers="tableHeaders"
          :items="scheduledPosts"
          :search="searchQuery"
          class="glass-table"
          :items-per-page="10"
        >
          <template v-slot:item.account="{ item }">
            <div class="d-flex align-center">
              <v-avatar size="32" class="mr-2">
                <img :src="item.accountAvatar" :alt="item.accountName">
              </v-avatar>
              <span>@{{ item.accountHandle }}</span>
            </div>
          </template>
          <template v-slot:item.status="{ item }">
            <v-chip 
              :color="getStatusColor(item.status)" 
              size="small"
              class="glass-chip"
            >
              {{ item.status }}
            </v-chip>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-btn icon size="small" class="glass-btn mr-1">
              <v-icon size="18">mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon size="small" class="glass-btn mr-1">
              <v-icon size="18">mdi-content-copy</v-icon>
            </v-btn>
            <v-btn icon size="small" class="glass-btn">
              <v-icon size="18">mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </div>

      <!-- Floating Action Button -->
      <v-btn
        class="glass-fab"
        fab
        size="large"
        position="fixed"
        location="bottom end"
        @click="openScheduleDialog"
      >
        <v-icon>mdi-calendar-plus</v-icon>
      </v-btn>

      <!-- Schedule Dialog -->
      <v-dialog v-model="scheduleDialog" max-width="600" persistent>
        <div class="glass-card dialog-content">
          <h2 class="dialog-title mb-4">Schedule New Post</h2>
          <v-form>
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="newPost.account"
                  :items="accounts"
                  item-title="name"
                  item-value="id"
                  label="Instagram Account"
                  variant="outlined"
                  class="glass-select"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newPost.date"
                  label="Date"
                  type="date"
                  variant="outlined"
                  class="glass-input"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newPost.time"
                  label="Time"
                  type="time"
                  variant="outlined"
                  class="glass-input"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="newPost.type"
                  :items="postTypes"
                  label="Post Type"
                  variant="outlined"
                  class="glass-select"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="newPost.caption"
                  label="Caption"
                  variant="outlined"
                  rows="4"
                  class="glass-input"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
          <div class="dialog-actions mt-6">
            <v-btn class="glass-btn" @click="scheduleDialog = false">Cancel</v-btn>
            <v-btn class="glass-btn primary-btn" @click="saveSchedule">Schedule Post</v-btn>
          </div>
        </div>
      </v-dialog>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Data
const selectedAccount = ref('all')
const viewMode = ref('Calendar')
const searchQuery = ref('')
const scheduleDialog = ref(false)
const currentDate = ref(new Date())

const viewModes = ['Calendar', 'Timeline', 'List']
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const postTypes = ['Single Image', 'Carousel', 'Reel', 'Story']

const accounts = ref([
  { id: 'all', name: 'All Accounts' },
  { id: '1', name: 'Fashion Brand' },
  { id: '2', name: 'Lifestyle Blog' },
  { id: '3', name: 'Tech Reviews' }
])

const newPost = ref({
  account: '',
  date: '',
  time: '',
  type: 'Single Image',
  caption: ''
})

const tableHeaders = [
  { title: 'Date', key: 'date' },
  { title: 'Time', key: 'time' },
  { title: 'Account', key: 'account' },
  { title: 'Title', key: 'title' },
  { title: 'Type', key: 'type' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false }
]

const scheduledPosts = ref([
  {
    id: 1,
    date: '2024-01-15',
    time: '10:00 AM',
    accountName: 'Fashion Brand',
    accountHandle: 'fashionbrand',
    accountAvatar: 'https://i.pravatar.cc/150?img=1',
    title: 'New Collection Launch',
    type: 'Carousel',
    status: 'scheduled'
  },
  {
    id: 2,
    date: '2024-01-15',
    time: '2:00 PM',
    accountName: 'Lifestyle Blog',
    accountHandle: 'lifestyle',
    accountAvatar: 'https://i.pravatar.cc/150?img=2',
    title: 'Morning Routine Tips',
    type: 'Reel',
    status: 'published'
  },
  {
    id: 3,
    date: '2024-01-16',
    time: '6:00 PM',
    accountName: 'Tech Reviews',
    accountHandle: 'techreview',
    accountAvatar: 'https://i.pravatar.cc/150?img=3',
    title: 'Latest Gadget Review',
    type: 'Single Image',
    status: 'draft'
  }
])

// Computed
const currentMonth = computed(() => {
  const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' }
  return currentDate.value.toLocaleDateString('en-US', options)
})

const calendarDates = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()
  
  const dates = []
  const today = new Date()
  
  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    dates.push({
      day: daysInPrevMonth - i,
      date: `${year}-${month}-${daysInPrevMonth - i}`,
      otherMonth: true,
      isToday: false,
      posts: []
    })
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = year === today.getFullYear() && 
                    month === today.getMonth() && 
                    day === today.getDate()
    
    dates.push({
      day,
      date: `${year}-${month + 1}-${day}`,
      otherMonth: false,
      isToday,
      posts: getPostsForDate(year, month + 1, day)
    })
  }
  
  // Next month days
  const remainingDays = 42 - dates.length
  for (let day = 1; day <= remainingDays; day++) {
    dates.push({
      day,
      date: `${year}-${month + 2}-${day}`,
      otherMonth: true,
      isToday: false,
      posts: []
    })
  }
  
  return dates
})

const timelineDays = computed(() => {
  const days = []
  const today = new Date()
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    
    const dateStr = date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    })
    
    days.push({
      date: dateStr,
      posts: getTimelinePostsForDate(date)
    })
  }
  
  return days
})

// Methods
const getPostsForDate = (year: number, month: number, day: number) => {
  // Mock data - would be filtered from actual posts
  const colors = ['#667eea', '#f093fb', '#4facfe', '#fa709a']
  const randomPosts = Math.random() > 0.7 ? Math.floor(Math.random() * 5) : 0
  
  return Array.from({ length: randomPosts }, (_, i) => ({
    id: i,
    color: colors[i % colors.length]
  }))
}

const getTimelinePostsForDate = (date: Date) => {
  // Mock data for timeline view
  const times = ['9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM', '9:00 PM']
  const statuses = ['scheduled', 'published', 'draft']
  
  return times.slice(0, Math.floor(Math.random() * 3) + 1).map((time, i) => ({
    id: i,
    time,
    title: `Post ${i + 1} for ${date.toLocaleDateString()}`,
    accountName: accounts.value[i % 3 + 1].name,
    accountHandle: accounts.value[i % 3 + 1].name.toLowerCase().replace(' ', ''),
    accountAvatar: `https://i.pravatar.cc/150?img=${i + 1}`,
    status: statuses[i % statuses.length]
  }))
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'scheduled': return 'mdi-clock-outline'
    case 'published': return 'mdi-check-circle'
    case 'draft': return 'mdi-file-document-outline'
    default: return 'mdi-help-circle-outline'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'scheduled': return 'warning'
    case 'published': return 'success'
    case 'draft': return 'info'
    default: return 'grey'
  }
}

const previousMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() - 1)
  currentDate.value = newDate
}

const nextMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + 1)
  currentDate.value = newDate
}

const openScheduleDialog = () => {
  scheduleDialog.value = true
}

const saveSchedule = () => {
  // Save logic here
  scheduleDialog.value = false
}
</script>

<style scoped>
.glassmorphism-schedule {
  min-height: 100vh;
  background: linear-gradient(135deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%);
  background-size: 400% 400%;
  animation: gradientShift 20s ease infinite;
  position: relative;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Animated Background */
.animated-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.wave {
  position: absolute;
  width: 200%;
  height: 100%;
  opacity: 0.3;
  left: -50%;
}

.wave-1 {
  background: radial-gradient(ellipse at center, rgba(255,255,255,0.3) 0%, transparent 70%);
  animation: wave 10s linear infinite;
}

.wave-2 {
  background: radial-gradient(ellipse at center, rgba(255,255,255,0.2) 0%, transparent 70%);
  animation: wave 15s linear infinite reverse;
  top: 20%;
}

.wave-3 {
  background: radial-gradient(ellipse at center, rgba(255,255,255,0.1) 0%, transparent 70%);
  animation: wave 20s linear infinite;
  top: -20%;
}

@keyframes wave {
  0% { transform: translateX(0) translateY(0) rotate(0deg); }
  50% { transform: translateX(30%) translateY(-10%) rotate(180deg); }
  100% { transform: translateX(0) translateY(0) rotate(360deg); }
}

/* Glass Card Base */
.glass-card {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  position: relative;
  z-index: 1;
}

/* Header Styles */
.schedule-header {
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  z-index: 1;
}

.schedule-title {
  font-size: 3.5rem;
  font-weight: 800;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.schedule-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
}

/* Control Panel */
.control-panel {
  margin-bottom: 2rem;
}

/* Glass Input Controls */
.glass-select :deep(.v-field),
.glass-input :deep(.v-field) {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.glass-select :deep(.v-field__input),
.glass-input :deep(.v-field__input) {
  color: white;
}

.glass-select :deep(.v-label),
.glass-input :deep(.v-label) {
  color: rgba(255, 255, 255, 0.7);
}

/* Glass Button */
.glass-btn {
  background: rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: white !important;
  font-weight: 500;
  transition: all 0.3s ease;
  text-transform: none;
}

.glass-btn:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.glass-btn.primary-btn {
  background: rgba(102, 126, 234, 0.4) !important;
  border-color: rgba(102, 126, 234, 0.6) !important;
}

.glass-btn.primary-btn:hover {
  background: rgba(102, 126, 234, 0.6) !important;
}

/* Calendar View */
.calendar-container {
  padding: 2rem;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.calendar-month {
  font-size: 1.75rem;
  font-weight: 600;
  color: white;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.calendar-weekday {
  text-align: center;
  padding: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  font-size: 0.875rem;
}

.calendar-date {
  min-height: 100px;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.calendar-date:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.calendar-date.other-month {
  opacity: 0.4;
}

.calendar-date.today {
  background: rgba(102, 126, 234, 0.3);
  border-color: rgba(102, 126, 234, 0.5);
}

.calendar-date.has-posts {
  background: rgba(255, 255, 255, 0.15);
}

.date-number {
  font-weight: 600;
  color: white;
  font-size: 0.875rem;
}

.date-posts {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.post-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.more-posts {
  font-size: 0.625rem;
  color: rgba(255, 255, 255, 0.8);
  margin-left: auto;
}

/* Timeline View */
.timeline-day {
  position: relative;
  z-index: 1;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.timeline-date {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
}

.timeline-count {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
}

.timeline-posts {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-left: 2rem;
}

.timeline-post {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  position: relative;
}

.timeline-post::before {
  content: '';
  position: absolute;
  left: -2rem;
  top: 50%;
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  transform: translateY(-50%);
}

.post-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  min-width: 100px;
}

.post-content {
  display: flex;
  align-items: center;
  flex: 1;
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
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
}

.post-actions {
  display: flex;
  gap: 0.5rem;
}

.post-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.post-status.scheduled {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.post-status.published {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.post-status.draft {
  background: rgba(33, 150, 243, 0.2);
  color: #2196f3;
}

/* List View */
.list-container {
  padding: 0;
  overflow: hidden;
}

.glass-table {
  background: transparent !important;
}

.glass-table :deep(.v-table__wrapper) {
  background: transparent;
}

.glass-table :deep(th) {
  background: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
}

.glass-table :deep(td) {
  color: rgba(255, 255, 255, 0.9) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.glass-table :deep(tr:hover) {
  background: rgba(255, 255, 255, 0.05) !important;
}

.glass-chip {
  background: rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* Floating Action Button */
.glass-fab {
  background: rgba(102, 126, 234, 0.8) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(102, 126, 234, 0.9) !important;
  color: white !important;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
  bottom: 2rem;
  right: 2rem;
}

.glass-fab:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.5);
}

/* Dialog */
.dialog-content {
  padding: 2.5rem;
}

.dialog-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
  text-align: center;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .schedule-title {
    font-size: 2.5rem;
  }
  
  .calendar-date {
    min-height: 80px;
    padding: 0.5rem;
  }
  
  .timeline-posts {
    margin-left: 1rem;
  }
  
  .post-actions {
    display: none;
  }
}
</style>