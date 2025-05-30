<template>
  <div class="minimalist-schedule">
    <!-- Header -->
    <header class="header">
      <h1 class="page-title">Schedule</h1>
      <div class="header-actions">
        <button class="view-toggle" :class="{ active: viewMode === 'calendar' }" @click="viewMode = 'calendar'">
          Calendar
        </button>
        <button class="view-toggle" :class="{ active: viewMode === 'timeline' }" @click="viewMode = 'timeline'">
          Timeline
        </button>
      </div>
    </header>

    <!-- Calendar View -->
    <div v-if="viewMode === 'calendar'" class="calendar-container">
      <!-- Calendar Header -->
      <div class="calendar-header">
        <button class="nav-button">←</button>
        <h2 class="calendar-month">January 2025</h2>
        <button class="nav-button">→</button>
      </div>

      <!-- Calendar Grid -->
      <div class="calendar-grid">
        <!-- Weekday Headers -->
        <div class="weekday" v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day">
          {{ day }}
        </div>

        <!-- Calendar Days -->
        <div v-for="n in 35" :key="n" class="calendar-day" :class="{ 
          'other-month': n <= 3 || n > 34,
          'has-post': [8, 12, 15, 22, 28].includes(n),
          'today': n === 15
        }">
          <div class="day-number">{{ getDayNumber(n) }}</div>
          <div v-if="[8, 12, 15, 22, 28].includes(n)" class="post-indicator">●</div>
        </div>
      </div>
    </div>

    <!-- Timeline View -->
    <div v-else class="timeline-container">
      <div class="timeline">
        <div class="timeline-item" v-for="n in 5" :key="n">
          <div class="timeline-date">
            <div class="date-day">{{ 15 + n * 3 }}</div>
            <div class="date-month">Jan</div>
          </div>
          <div class="timeline-line"></div>
          <div class="timeline-content">
            <div class="post-time">{{ 9 + n }}:00 AM</div>
            <div class="post-title">Scheduled Post {{ n }}</div>
            <div class="post-account">@myaccount</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Add -->
    <button class="fab" @click="showModal = true">+</button>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click="showModal = false">
      <div class="modal" @click.stop>
        <h2 class="modal-title">New Schedule</h2>
        
        <div class="form-group">
          <label>Date & Time</label>
          <input type="datetime-local" class="form-input">
        </div>

        <div class="form-group">
          <label>Repeat</label>
          <select class="form-input">
            <option>Never</option>
            <option>Daily</option>
            <option>Weekly</option>
            <option>Monthly</option>
          </select>
        </div>

        <div class="form-group">
          <label>Account</label>
          <select class="form-input">
            <option>@myaccount</option>
            <option>@business</option>
            <option>@personal</option>
          </select>
        </div>

        <div class="form-group">
          <label>Content</label>
          <div class="content-selector">
            <div class="content-option selected">
              <div class="content-preview">□</div>
              <div class="content-name">Post 1</div>
            </div>
            <div class="content-option">
              <div class="content-preview">□</div>
              <div class="content-name">Post 2</div>
            </div>
            <div class="content-option">
              <div class="content-preview">□</div>
              <div class="content-name">Post 3</div>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button class="button secondary" @click="showModal = false">Cancel</button>
          <button class="button primary">Create Schedule</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const viewMode = ref('calendar')
const showModal = ref(false)

const getDayNumber = (n) => {
  if (n <= 3) return 29 + n
  if (n > 34) return n - 34
  return n - 3
}
</script>

<style scoped>
/* Base */
.minimalist-schedule {
  min-height: 100vh;
  background: #fff;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  padding: 2rem;
  color: #000;
  position: relative;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 300;
  letter-spacing: -0.02em;
}

.header-actions {
  display: flex;
  border: 1px solid #e9ecef;
}

.view-toggle {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-toggle:first-child {
  border-right: 1px solid #e9ecef;
}

.view-toggle.active {
  background: #000;
  color: #fff;
}

/* Calendar View */
.calendar-container {
  max-width: 900px;
  margin: 0 auto;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
}

.calendar-month {
  font-size: 1.5rem;
  font-weight: 300;
}

.nav-button {
  width: 40px;
  height: 40px;
  border: 1px solid #e9ecef;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.nav-button:hover {
  border-color: #000;
}

/* Calendar Grid */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #e9ecef;
  border: 1px solid #e9ecef;
}

.weekday {
  background: #f8f9fa;
  padding: 1rem;
  text-align: center;
  font-size: 0.875rem;
  color: #666;
  font-weight: 500;
}

.calendar-day {
  background: #fff;
  padding: 1rem;
  min-height: 100px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.calendar-day:hover {
  background: #f8f9fa;
}

.calendar-day.other-month {
  color: #ccc;
}

.calendar-day.today {
  background: #f8f9fa;
}

.calendar-day.today .day-number {
  font-weight: 600;
}

.day-number {
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}

.post-indicator {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.75rem;
}

/* Timeline View */
.timeline-container {
  max-width: 600px;
  margin: 0 auto;
}

.timeline {
  position: relative;
  padding-left: 100px;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 3rem;
  position: relative;
}

.timeline-date {
  position: absolute;
  left: -100px;
  text-align: right;
  width: 80px;
}

.date-day {
  font-size: 1.5rem;
  font-weight: 300;
  line-height: 1;
}

.date-month {
  font-size: 0.875rem;
  color: #666;
}

.timeline-line {
  position: absolute;
  left: -10px;
  top: 0;
  bottom: -3rem;
  width: 1px;
  background: #e9ecef;
}

.timeline-item:last-child .timeline-line {
  display: none;
}

.timeline-content {
  flex: 1;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.timeline-content:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.post-time {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.post-title {
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
}

.post-account {
  font-size: 0.875rem;
  color: #666;
}

/* FAB */
.fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #000;
  color: #fff;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.fab:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #fff;
  width: 90%;
  max-width: 500px;
  padding: 3rem;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 300;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 2rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.75rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e9ecef;
  background: transparent;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #000;
}

/* Content Selector */
.content-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.content-option {
  border: 1px solid #e9ecef;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.content-option:hover,
.content-option.selected {
  border-color: #000;
}

.content-preview {
  width: 60px;
  height: 60px;
  margin: 0 auto 0.5rem;
  border: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.content-name {
  font-size: 0.875rem;
}

/* Modal Actions */
.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 3rem;
}

.button {
  flex: 1;
  padding: 1rem;
  border: 1px solid #e9ecef;
  background: transparent;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button:hover {
  border-color: #000;
}

.button.primary {
  background: #000;
  color: #fff;
  border-color: #000;
}

.button.primary:hover {
  background: #222;
  border-color: #222;
}

/* Responsive */
@media (max-width: 768px) {
  .minimalist-schedule {
    padding: 1rem;
  }

  .calendar-grid {
    gap: 0;
  }

  .calendar-day {
    min-height: 80px;
    padding: 0.5rem;
  }

  .timeline {
    padding-left: 60px;
  }

  .timeline-date {
    left: -60px;
    width: 50px;
  }
}
</style>