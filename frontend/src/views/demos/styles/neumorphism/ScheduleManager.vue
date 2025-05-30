<template>
  <div class="neumorphism-schedule">
    <!-- Header -->
    <header class="schedule-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">Schedule Manager</h1>
          <p class="page-subtitle">Plan and organize your Instagram posts</p>
        </div>
        <div class="header-actions">
          <button class="view-toggle" :class="{ active: currentView === 'calendar' }" @click="currentView = 'calendar'">
            <i class="mdi mdi-calendar"></i>
            Calendar
          </button>
          <button class="view-toggle" :class="{ active: currentView === 'timeline' }" @click="currentView = 'timeline'">
            <i class="mdi mdi-timeline"></i>
            Timeline
          </button>
          <button class="new-schedule-btn" @click="showNewScheduleModal = true">
            <i class="mdi mdi-plus"></i>
            New Schedule
          </button>
        </div>
      </div>
    </header>

    <!-- Calendar View -->
    <div v-if="currentView === 'calendar'" class="calendar-container">
      <!-- Calendar Header -->
      <div class="calendar-header">
        <div class="month-navigation">
          <button class="nav-btn" @click="previousMonth">
            <i class="mdi mdi-chevron-left"></i>
          </button>
          <h2 class="current-month">{{ currentMonthName }} {{ currentYear }}</h2>
          <button class="nav-btn" @click="nextMonth">
            <i class="mdi mdi-chevron-right"></i>
          </button>
        </div>
        <div class="calendar-filters">
          <div class="filter-group">
            <button 
              class="filter-btn" 
              v-for="account in accounts" 
              :key="account.id"
              :class="{ active: selectedAccounts.includes(account.id) }"
              @click="toggleAccountFilter(account.id)"
            >
              <div class="account-color" :style="{ backgroundColor: account.color }"></div>
              {{ account.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- Calendar Grid -->
      <div class="calendar-grid">
        <!-- Days of Week Header -->
        <div class="calendar-weekdays">
          <div class="weekday" v-for="day in weekdays" :key="day">{{ day }}</div>
        </div>
        
        <!-- Calendar Days -->
        <div class="calendar-days">
          <div 
            class="calendar-day" 
            v-for="day in calendarDays" 
            :key="day.id"
            :class="{ 
              'other-month': day.otherMonth, 
              'today': day.isToday,
              'has-posts': day.posts.length > 0
            }"
            @click="selectDay(day)"
          >
            <div class="day-number">{{ day.number }}</div>
            <div class="day-posts">
              <div 
                class="post-dot" 
                v-for="post in day.posts.slice(0, 3)" 
                :key="post.id"
                :style="{ backgroundColor: post.accountColor }"
                :title="post.title"
              ></div>
              <div v-if="day.posts.length > 3" class="more-posts">+{{ day.posts.length - 3 }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Timeline View -->
    <div v-if="currentView === 'timeline'" class="timeline-container">
      <div class="timeline-header">
        <div class="timeline-filters">
          <button class="timeline-filter" :class="{ active: timelineFilter === 'all' }" @click="timelineFilter = 'all'">
            All Posts
          </button>
          <button class="timeline-filter" :class="{ active: timelineFilter === 'today' }" @click="timelineFilter = 'today'">
            Today
          </button>
          <button class="timeline-filter" :class="{ active: timelineFilter === 'week' }" @click="timelineFilter = 'week'">
            This Week
          </button>
          <button class="timeline-filter" :class="{ active: timelineFilter === 'month' }" @click="timelineFilter = 'month'">
            This Month
          </button>
        </div>
      </div>
      
      <div class="timeline-content">
        <div class="timeline">
          <div class="timeline-item" v-for="post in filteredTimelinePosts" :key="post.id">
            <div class="timeline-marker" :style="{ backgroundColor: post.accountColor }"></div>
            <div class="timeline-card">
              <div class="timeline-header-info">
                <div class="post-time">
                  <i class="mdi mdi-clock"></i>
                  {{ post.scheduledTime }}
                </div>
                <div class="post-status" :class="post.status">{{ post.status }}</div>
              </div>
              <div class="timeline-content-info">
                <h3>{{ post.title }}</h3>
                <p>{{ post.account }}</p>
                <div class="post-preview" v-if="post.image">
                  <img :src="post.image" :alt="post.title" />
                </div>
              </div>
              <div class="timeline-actions">
                <button class="action-btn edit" @click="editPost(post)">
                  <i class="mdi mdi-pencil"></i>
                </button>
                <button class="action-btn duplicate" @click="duplicatePost(post)">
                  <i class="mdi mdi-content-copy"></i>
                </button>
                <button class="action-btn delete" @click="deletePost(post)">
                  <i class="mdi mdi-delete"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Selected Day Modal -->
    <div v-if="selectedDay" class="modal-overlay" @click="closeModal">
      <div class="day-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedDay.number }} {{ currentMonthName }} {{ currentYear }}</h3>
          <button class="close-btn" @click="closeModal">
            <i class="mdi mdi-close"></i>
          </button>
        </div>
        <div class="modal-content">
          <div v-if="selectedDay.posts.length === 0" class="no-posts">
            <i class="mdi mdi-calendar-plus"></i>
            <p>No posts scheduled for this day</p>
            <button class="add-post-btn" @click="addPostToDay">Add Post</button>
          </div>
          <div v-else class="day-posts-list">
            <div class="post-item" v-for="post in selectedDay.posts" :key="post.id">
              <div class="post-thumbnail">
                <img v-if="post.image" :src="post.image" :alt="post.title" />
                <div v-else class="no-image">
                  <i class="mdi mdi-image"></i>
                </div>
              </div>
              <div class="post-details">
                <h4>{{ post.title }}</h4>
                <p>{{ post.account }} • {{ post.scheduledTime }}</p>
                <div class="post-status" :class="post.status">{{ post.status }}</div>
              </div>
              <div class="post-actions">
                <button class="edit-post-btn" @click="editPost(post)">
                  <i class="mdi mdi-pencil"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Schedule Modal -->
    <div v-if="showNewScheduleModal" class="modal-overlay" @click="closeNewScheduleModal">
      <div class="new-schedule-modal" @click.stop>
        <div class="modal-header">
          <h3>Create New Schedule</h3>
          <button class="close-btn" @click="closeNewScheduleModal">
            <i class="mdi mdi-close"></i>
          </button>
        </div>
        <div class="modal-content">
          <div class="schedule-form">
            <div class="form-row">
              <div class="form-group">
                <label>Account</label>
                <select class="form-select" v-model="newSchedule.accountId">
                  <option value="">Select Account</option>
                  <option v-for="account in accounts" :key="account.id" :value="account.id">
                    {{ account.name }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Post Type</label>
                <select class="form-select" v-model="newSchedule.type">
                  <option value="photo">Photo</option>
                  <option value="video">Video</option>
                  <option value="carousel">Carousel</option>
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label>Caption</label>
              <textarea class="form-textarea" v-model="newSchedule.caption" placeholder="Write your caption..."></textarea>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Schedule Date</label>
                <input type="date" class="form-input" v-model="newSchedule.date" />
              </div>
              <div class="form-group">
                <label>Schedule Time</label>
                <input type="time" class="form-input" v-model="newSchedule.time" />
              </div>
            </div>
            
            <div class="form-actions">
              <button class="cancel-btn" @click="closeNewScheduleModal">Cancel</button>
              <button class="save-btn" @click="saveNewSchedule">Schedule Post</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const currentView = ref('calendar')
const selectedDay = ref(null)
const showNewScheduleModal = ref(false)
const timelineFilter = ref('all')
const selectedAccounts = ref([1, 2, 3])

const currentDate = ref(new Date())
const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())
const currentMonthName = computed(() => {
  return new Intl.DateTimeFormat('en', { month: 'long' }).format(currentDate.value)
})

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const accounts = ref([
  { id: 1, name: '@sarahlifestyle', color: '#4299E1' },
  { id: 2, name: '@sarahfitness', color: '#48BB78' },
  { id: 3, name: '@sarahtravel', color: '#ED8936' }
])

const newSchedule = ref({
  accountId: '',
  type: 'photo',
  caption: '',
  date: '',
  time: ''
})

const scheduledPosts = ref([
  {
    id: 1,
    title: 'Morning workout routine',
    account: '@sarahfitness',
    accountId: 2,
    accountColor: '#48BB78',
    scheduledDate: '2024-01-15',
    scheduledTime: '06:00',
    status: 'scheduled',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop'
  },
  {
    id: 2,
    title: 'Coffee and planning',
    account: '@sarahlifestyle',
    accountId: 1,
    accountColor: '#4299E1',
    scheduledDate: '2024-01-15',
    scheduledTime: '09:00',
    status: 'scheduled',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=150&h=150&fit=crop'
  },
  {
    id: 3,
    title: 'Travel throwback',
    account: '@sarahtravel',
    accountId: 3,
    accountColor: '#ED8936',
    scheduledDate: '2024-01-16',
    scheduledTime: '14:00',
    status: 'scheduled',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=150&h=150&fit=crop'
  },
  {
    id: 4,
    title: 'Healthy meal prep',
    account: '@sarahlifestyle',
    accountId: 1,
    accountColor: '#4299E1',
    scheduledDate: '2024-01-17',
    scheduledTime: '12:00',
    status: 'draft',
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=150&h=150&fit=crop'
  },
  {
    id: 5,
    title: 'Gym session highlights',
    account: '@sarahfitness',
    accountId: 2,
    accountColor: '#48BB78',
    scheduledDate: '2024-01-18',
    scheduledTime: '18:00',
    status: 'scheduled'
  }
])

const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const days = []
  const today = new Date()
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    const dayPosts = scheduledPosts.value.filter(post => {
      const postDate = new Date(post.scheduledDate)
      return postDate.toDateString() === date.toDateString() &&
             selectedAccounts.value.includes(post.accountId)
    })
    
    days.push({
      id: i,
      number: date.getDate(),
      date: date.toISOString().split('T')[0],
      otherMonth: date.getMonth() !== month,
      isToday: date.toDateString() === today.toDateString(),
      posts: dayPosts
    })
  }
  
  return days
})

const filteredTimelinePosts = computed(() => {
  let filtered = scheduledPosts.value.filter(post => 
    selectedAccounts.value.includes(post.accountId)
  )
  
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  
  switch (timelineFilter.value) {
    case 'today':
      filtered = filtered.filter(post => {
        const postDate = new Date(post.scheduledDate)
        return postDate.toDateString() === today.toDateString()
      })
      break
    case 'week':
      filtered = filtered.filter(post => {
        const postDate = new Date(post.scheduledDate)
        return postDate >= weekStart && postDate < new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
      })
      break
    case 'month':
      filtered = filtered.filter(post => {
        const postDate = new Date(post.scheduledDate)
        return postDate >= monthStart && postDate < new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1)
      })
      break
  }
  
  return filtered.sort((a, b) => new Date(a.scheduledDate + ' ' + a.scheduledTime) - new Date(b.scheduledDate + ' ' + b.scheduledTime))
})

const previousMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

const toggleAccountFilter = (accountId: number) => {
  const index = selectedAccounts.value.indexOf(accountId)
  if (index > -1) {
    selectedAccounts.value.splice(index, 1)
  } else {
    selectedAccounts.value.push(accountId)
  }
}

const selectDay = (day: any) => {
  selectedDay.value = day
}

const closeModal = () => {
  selectedDay.value = null
}

const closeNewScheduleModal = () => {
  showNewScheduleModal.value = false
  newSchedule.value = {
    accountId: '',
    type: 'photo',
    caption: '',
    date: '',
    time: ''
  }
}

const addPostToDay = () => {
  closeModal()
  showNewScheduleModal.value = true
  newSchedule.value.date = selectedDay.value?.date || ''
}

const editPost = (post: any) => {
  console.log('Edit post:', post)
}

const duplicatePost = (post: any) => {
  console.log('Duplicate post:', post)
}

const deletePost = (post: any) => {
  console.log('Delete post:', post)
}

const saveNewSchedule = () => {
  console.log('Save new schedule:', newSchedule.value)
  closeNewScheduleModal()
}

onMounted(() => {
  // Set default date for new schedule
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  newSchedule.value.date = tomorrow.toISOString().split('T')[0]
  newSchedule.value.time = '09:00'
})
</script>

<style scoped>
.neumorphism-schedule {
  background: #E0E5EC;
  min-height: 100vh;
  padding: 20px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Header */
.schedule-header {
  margin-bottom: 30px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #4A5568;
  margin: 0;
  text-shadow: 
    2px 2px 4px rgba(163, 177, 198, 0.3),
    -2px -2px 4px rgba(255, 255, 255, 0.7);
}

.page-subtitle {
  color: #718096;
  margin: 5px 0 0 0;
  font-size: 1.1rem;
}

.header-actions {
  display: flex;
  gap: 15px;
  align-items: center;
}

.view-toggle {
  background: #E0E5EC;
  border: none;
  padding: 10px 16px;
  border-radius: 12px;
  color: #718096;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
  box-shadow: 
    inset 8px 8px 16px rgba(163, 177, 198, 0.6),
    inset -8px -8px 16px rgba(255, 255, 255, 0.7);
}

.view-toggle.active {
  color: #4299E1;
  box-shadow: 
    8px 8px 16px rgba(163, 177, 198, 0.6),
    -8px -8px 16px rgba(255, 255, 255, 0.7);
}

.new-schedule-btn {
  background: #E0E5EC;
  border: none;
  padding: 12px 20px;
  border-radius: 15px;
  color: #4299E1;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 
    10px 10px 20px rgba(163, 177, 198, 0.6),
    -10px -10px 20px rgba(255, 255, 255, 0.7);
}

.new-schedule-btn:hover {
  box-shadow: 
    5px 5px 10px rgba(163, 177, 198, 0.6),
    -5px -5px 10px rgba(255, 255, 255, 0.7);
  transform: translateY(2px);
}

/* Calendar Container */
.calendar-container {
  background: #E0E5EC;
  border-radius: 25px;
  padding: 30px;
  box-shadow: 
    15px 15px 30px rgba(163, 177, 198, 0.6),
    -15px -15px 30px rgba(255, 255, 255, 0.7);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.month-navigation {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: #E0E5EC;
  color: #4A5568;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 
    8px 8px 16px rgba(163, 177, 198, 0.6),
    -8px -8px 16px rgba(255, 255, 255, 0.7);
}

.nav-btn:hover {
  box-shadow: 
    4px 4px 8px rgba(163, 177, 198, 0.6),
    -4px -4px 8px rgba(255, 255, 255, 0.7);
  transform: translateY(1px);
}

.nav-btn:active {
  box-shadow: 
    inset 4px 4px 8px rgba(163, 177, 198, 0.6),
    inset -4px -4px 8px rgba(255, 255, 255, 0.7);
}

.current-month {
  font-size: 1.5rem;
  font-weight: 600;
  color: #4A5568;
  margin: 0;
  min-width: 200px;
  text-align: center;
}

.calendar-filters {
  display: flex;
  gap: 10px;
}

.filter-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-btn {
  background: #E0E5EC;
  border: none;
  padding: 8px 15px;
  border-radius: 12px;
  color: #718096;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
  box-shadow: 
    inset 6px 6px 12px rgba(163, 177, 198, 0.6),
    inset -6px -6px 12px rgba(255, 255, 255, 0.7);
}

.filter-btn.active {
  color: #4A5568;
  box-shadow: 
    6px 6px 12px rgba(163, 177, 198, 0.6),
    -6px -6px 12px rgba(255, 255, 255, 0.7);
}

.account-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

/* Calendar Grid */
.calendar-grid {
  background: #E0E5EC;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 
    inset 12px 12px 24px rgba(163, 177, 198, 0.6),
    inset -12px -12px 24px rgba(255, 255, 255, 0.7);
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 15px;
}

.weekday {
  text-align: center;
  font-weight: 600;
  color: #718096;
  padding: 10px;
  font-size: 0.9rem;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.calendar-day {
  background: #E0E5EC;
  border-radius: 15px;
  padding: 15px 10px;
  min-height: 100px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 
    6px 6px 12px rgba(163, 177, 198, 0.6),
    -6px -6px 12px rgba(255, 255, 255, 0.7);
}

.calendar-day:hover {
  transform: translateY(-2px);
  box-shadow: 
    8px 8px 16px rgba(163, 177, 198, 0.7),
    -8px -8px 16px rgba(255, 255, 255, 0.8);
}

.calendar-day.other-month {
  opacity: 0.4;
}

.calendar-day.today {
  box-shadow: 
    inset 6px 6px 12px rgba(163, 177, 198, 0.6),
    inset -6px -6px 12px rgba(255, 255, 255, 0.7),
    0 0 0 2px #4299E1;
}

.calendar-day.has-posts {
  background: linear-gradient(135deg, #E0E5EC 0%, #EDF2F7 100%);
}

.day-number {
  font-weight: 600;
  color: #4A5568;
  margin-bottom: 8px;
  font-size: 1rem;
}

.day-posts {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.post-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 
    2px 2px 4px rgba(163, 177, 198, 0.6),
    -1px -1px 2px rgba(255, 255, 255, 0.7);
}

.more-posts {
  font-size: 0.7rem;
  color: #718096;
  font-weight: 600;
  margin-left: 2px;
}

/* Timeline Container */
.timeline-container {
  background: #E0E5EC;
  border-radius: 25px;
  padding: 30px;
  box-shadow: 
    15px 15px 30px rgba(163, 177, 198, 0.6),
    -15px -15px 30px rgba(255, 255, 255, 0.7);
}

.timeline-header {
  margin-bottom: 30px;
}

.timeline-filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.timeline-filter {
  background: #E0E5EC;
  border: none;
  padding: 10px 16px;
  border-radius: 12px;
  color: #718096;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 
    inset 8px 8px 16px rgba(163, 177, 198, 0.6),
    inset -8px -8px 16px rgba(255, 255, 255, 0.7);
}

.timeline-filter.active {
  color: #4299E1;
  box-shadow: 
    8px 8px 16px rgba(163, 177, 198, 0.6),
    -8px -8px 16px rgba(255, 255, 255, 0.7);
}

/* Timeline */
.timeline {
  position: relative;
  padding-left: 30px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, #4299E1 0%, #2B6CB0 100%);
  border-radius: 1px;
  box-shadow: 
    1px 1px 2px rgba(163, 177, 198, 0.6),
    -1px -1px 2px rgba(255, 255, 255, 0.7);
}

.timeline-item {
  position: relative;
  margin-bottom: 30px;
}

.timeline-marker {
  position: absolute;
  left: -37px;
  top: 20px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 3px solid #E0E5EC;
  box-shadow: 
    3px 3px 6px rgba(163, 177, 198, 0.6),
    -3px -3px 6px rgba(255, 255, 255, 0.7);
}

.timeline-card {
  background: #E0E5EC;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 
    12px 12px 24px rgba(163, 177, 198, 0.6),
    -12px -12px 24px rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
}

.timeline-card:hover {
  transform: translateY(-3px);
  box-shadow: 
    15px 15px 30px rgba(163, 177, 198, 0.7),
    -15px -15px 30px rgba(255, 255, 255, 0.8);
}

.timeline-header-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.post-time {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #718096;
  font-size: 0.9rem;
  font-weight: 500;
}

.post-status {
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
}

.post-status.scheduled {
  background: #BEE3F8;
  color: #1A365D;
}

.post-status.draft {
  background: #FED7D7;
  color: #742A2A;
}

.post-status.published {
  background: #C6F6D5;
  color: #22543D;
}

.timeline-content-info h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #4A5568;
  margin: 0 0 8px 0;
}

.timeline-content-info p {
  color: #718096;
  margin: 0 0 15px 0;
  font-size: 0.95rem;
}

.post-preview {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 15px;
  box-shadow: 
    8px 8px 16px rgba(163, 177, 198, 0.6),
    -8px -8px 16px rgba(255, 255, 255, 0.7);
}

.post-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.timeline-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: #E0E5EC;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 
    6px 6px 12px rgba(163, 177, 198, 0.6),
    -6px -6px 12px rgba(255, 255, 255, 0.7);
}

.action-btn:hover {
  box-shadow: 
    3px 3px 6px rgba(163, 177, 198, 0.6),
    -3px -3px 6px rgba(255, 255, 255, 0.7);
  transform: translateY(1px);
}

.action-btn.edit {
  color: #4299E1;
}

.action-btn.duplicate {
  color: #48BB78;
}

.action-btn.delete {
  color: #F56565;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(163, 177, 198, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.day-modal,
.new-schedule-modal {
  background: #E0E5EC;
  border-radius: 25px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 
    20px 20px 40px rgba(163, 177, 198, 0.7),
    -20px -20px 40px rgba(255, 255, 255, 0.8);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.modal-header h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #4A5568;
  margin: 0;
}

.close-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: #E0E5EC;
  color: #718096;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 
    6px 6px 12px rgba(163, 177, 198, 0.6),
    -6px -6px 12px rgba(255, 255, 255, 0.7);
}

.close-btn:hover {
  color: #F56565;
  box-shadow: 
    3px 3px 6px rgba(163, 177, 198, 0.6),
    -3px -3px 6px rgba(255, 255, 255, 0.7);
}

.no-posts {
  text-align: center;
  padding: 40px 20px;
  color: #718096;
}

.no-posts i {
  font-size: 3rem;
  margin-bottom: 15px;
  display: block;
}

.add-post-btn {
  background: #E0E5EC;
  border: none;
  padding: 12px 24px;
  border-radius: 15px;
  color: #4299E1;
  font-weight: 600;
  cursor: pointer;
  margin-top: 15px;
  box-shadow: 
    8px 8px 16px rgba(163, 177, 198, 0.6),
    -8px -8px 16px rgba(255, 255, 255, 0.7);
}

.day-posts-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.post-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #E0E5EC;
  border-radius: 15px;
  box-shadow: 
    inset 8px 8px 16px rgba(163, 177, 198, 0.6),
    inset -8px -8px 16px rgba(255, 255, 255, 0.7);
}

.post-thumbnail {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 
    6px 6px 12px rgba(163, 177, 198, 0.6),
    -6px -6px 12px rgba(255, 255, 255, 0.7);
}

.post-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  width: 100%;
  height: 100%;
  background: #CBD5E0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #718096;
}

.post-details {
  flex: 1;
}

.post-details h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #4A5568;
  margin: 0 0 5px 0;
}

.post-details p {
  color: #718096;
  font-size: 0.85rem;
  margin: 0 0 8px 0;
}

.edit-post-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: #E0E5EC;
  color: #4299E1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    6px 6px 12px rgba(163, 177, 198, 0.6),
    -6px -6px 12px rgba(255, 255, 255, 0.7);
}

/* Form Styles */
.schedule-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #4A5568;
  font-size: 0.9rem;
}

.form-input,
.form-select,
.form-textarea {
  background: #E0E5EC;
  border: none;
  padding: 12px 15px;
  border-radius: 12px;
  color: #4A5568;
  font-family: inherit;
  font-size: 0.95rem;
  box-shadow: 
    inset 8px 8px 16px rgba(163, 177, 198, 0.6),
    inset -8px -8px 16px rgba(255, 255, 255, 0.7);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  box-shadow: 
    inset 6px 6px 12px rgba(163, 177, 198, 0.6),
    inset -6px -6px 12px rgba(255, 255, 255, 0.7);
}

.form-textarea {
  min-height: 80px;
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 10px;
}

.cancel-btn,
.save-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #E0E5EC;
}

.cancel-btn {
  color: #718096;
  box-shadow: 
    8px 8px 16px rgba(163, 177, 198, 0.6),
    -8px -8px 16px rgba(255, 255, 255, 0.7);
}

.save-btn {
  color: #4299E1;
  box-shadow: 
    8px 8px 16px rgba(163, 177, 198, 0.6),
    -8px -8px 16px rgba(255, 255, 255, 0.7);
}

.cancel-btn:hover,
.save-btn:hover {
  box-shadow: 
    4px 4px 8px rgba(163, 177, 198, 0.6),
    -4px -4px 8px rgba(255, 255, 255, 0.7);
  transform: translateY(2px);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
  
  .calendar-header {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .month-navigation {
    justify-content: center;
  }
  
  .calendar-filters {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .neumorphism-schedule {
    padding: 15px;
  }
  
  .calendar-container,
  .timeline-container {
    padding: 20px;
  }
  
  .calendar-day {
    min-height: 80px;
    padding: 10px 8px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .timeline {
    padding-left: 20px;
  }
  
  .timeline-marker {
    left: -27px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .header-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .view-toggle,
  .new-schedule-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>