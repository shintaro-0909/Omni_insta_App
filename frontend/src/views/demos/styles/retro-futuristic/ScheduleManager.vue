<template>
  <div class="retro-schedule">
    <!-- Background -->
    <div class="cyber-background">
      <div class="grid-floor"></div>
      <div class="neon-lines"></div>
      <div class="vhs-noise"></div>
    </div>

    <!-- Header -->
    <header class="schedule-header">
      <h1 class="page-title">
        <span class="title-prefix">▸</span>
        TIME MATRIX CONTROLLER
        <span class="title-suffix">◂</span>
      </h1>
      <div class="cyber-clock">
        <div class="clock-display">{{ currentDateTime }}</div>
        <div class="clock-label">SYSTEM TIME</div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="schedule-main">
      <!-- Calendar View -->
      <section class="calendar-section">
        <div class="section-title">
          <h2>TEMPORAL GRID</h2>
          <div class="title-decoration"></div>
        </div>

        <div class="retro-calendar">
          <div class="calendar-header">
            <button class="nav-btn prev" @click="previousMonth">◀</button>
            <div class="month-display">
              <span class="month-name">{{ currentMonth }}</span>
              <span class="year-number">{{ currentYear }}</span>
            </div>
            <button class="nav-btn next" @click="nextMonth">▶</button>
          </div>

          <div class="calendar-grid">
            <div class="day-header" v-for="day in weekDays" :key="day">
              {{ day }}
            </div>
            <div
              class="calendar-day"
              v-for="(date, index) in calendarDays"
              :key="index"
              :class="{
                'other-month': date.otherMonth,
                today: date.isToday,
                'has-events': date.events > 0,
              }"
              @click="selectDate(date)"
            >
              <span class="day-number">{{ date.day }}</span>
              <div class="event-indicator" v-if="date.events > 0">
                <span class="event-count">{{ date.events }}</span>
              </div>
              <div class="day-glow"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Timeline View -->
      <section class="timeline-section">
        <div class="section-title">
          <h2>SCHEDULE TIMELINE</h2>
          <div class="title-decoration"></div>
        </div>

        <div class="neon-timeline">
          <div class="timeline-grid">
            <div class="time-slots">
              <div class="time-slot" v-for="hour in 24" :key="hour">
                <span class="time-label"
                  >{{ String(hour - 1).padStart(2, '0') }}:00</span
                >
                <div class="time-line"></div>
              </div>
            </div>

            <div class="events-track">
              <div
                class="timeline-event"
                v-for="event in timelineEvents"
                :key="event.id"
                :style="{
                  top: `${event.position}%`,
                  height: `${event.duration}%`,
                  background: event.color,
                }"
              >
                <div class="event-content">
                  <span class="event-time">{{ event.time }}</span>
                  <span class="event-title">{{ event.title }}</span>
                </div>
                <div class="event-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Schedule Modal -->
      <div class="vhs-modal" v-if="showModal">
        <div class="modal-backdrop" @click="closeModal"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h3>CREATE TEMPORAL EVENT</h3>
            <button class="close-btn" @click="closeModal">✕</button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label>EVENT DESIGNATION</label>
              <input
                type="text"
                class="retro-input"
                v-model="newEvent.title"
                placeholder="Enter event name..."
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>DATE COORDINATES</label>
                <input
                  type="date"
                  class="retro-input"
                  v-model="newEvent.date"
                />
              </div>
              <div class="form-group">
                <label>TIME VECTOR</label>
                <input
                  type="time"
                  class="retro-input"
                  v-model="newEvent.time"
                />
              </div>
            </div>

            <div class="form-group">
              <label>REPEAT PROTOCOL</label>
              <div class="repeat-options">
                <button
                  class="repeat-btn"
                  v-for="option in repeatOptions"
                  :key="option.value"
                  :class="{ active: newEvent.repeat === option.value }"
                  @click="newEvent.repeat = option.value"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>CONTENT MATRIX</label>
              <textarea
                class="retro-textarea"
                v-model="newEvent.content"
                placeholder="Enter post content..."
                rows="4"
              ></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button class="action-btn cancel" @click="closeModal">
              <span>ABORT</span>
            </button>
            <button class="action-btn confirm" @click="saveEvent">
              <span>INITIALIZE</span>
              <div class="btn-scanline"></div>
            </button>
          </div>
        </div>
      </div>

      <!-- Floating Action -->
      <button class="fab-button" @click="openModal">
        <span class="fab-icon">+</span>
        <div class="fab-ring"></div>
        <div class="fab-ring delay"></div>
      </button>
    </main>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue';

  // Date & Time
  const currentDateTime = ref('');
  const currentMonth = ref('');
  const currentYear = ref(2084);
  const selectedDate = ref<any>(null);
  let timeInterval: number;

  const updateDateTime = () => {
    const now = new Date();
    currentDateTime.value = now.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    currentMonth.value = now
      .toLocaleString('en-US', { month: 'long' })
      .toUpperCase();
    currentYear.value = now.getFullYear();
  };

  // Calendar
  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const calendarDays = ref(
    Array.from({ length: 42 }, (_, i) => {
      const day = i - 5; // Start from previous month
      const isToday = day === 15;
      const otherMonth = day <= 0 || day > 30;
      const events =
        Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0;

      return {
        day: otherMonth ? Math.abs(day) : day,
        otherMonth,
        isToday,
        events,
      };
    })
  );

  // Timeline Events
  const timelineEvents = ref([
    {
      id: 1,
      time: '09:00',
      title: 'Morning Post',
      position: 37.5, // 9/24 * 100
      duration: 4.2, // 1 hour = 4.2%
      color: 'linear-gradient(135deg, #ff006e, #8338ec)',
    },
    {
      id: 2,
      time: '12:30',
      title: 'Lunch Content',
      position: 52.1,
      duration: 4.2,
      color: 'linear-gradient(135deg, #3a86ff, #8338ec)',
    },
    {
      id: 3,
      time: '18:00',
      title: 'Evening Update',
      position: 75,
      duration: 4.2,
      color: 'linear-gradient(135deg, #ffbe0b, #ff4500)',
    },
  ]);

  // Modal
  const showModal = ref(false);
  const newEvent = ref({
    title: '',
    date: '',
    time: '',
    repeat: 'once',
    content: '',
  });

  const repeatOptions = [
    { value: 'once', label: 'ONCE' },
    { value: 'daily', label: 'DAILY' },
    { value: 'weekly', label: 'WEEKLY' },
    { value: 'monthly', label: 'MONTHLY' },
  ];

  // Methods
  const previousMonth = () => {
    // Implementation for previous month navigation
  };

  const nextMonth = () => {
    // Implementation for next month navigation
  };

  const selectDate = (date: any) => {
    selectedDate.value = date;
    if (!date.otherMonth) {
      openModal();
    }
  };

  const openModal = () => {
    showModal.value = true;
  };

  const closeModal = () => {
    showModal.value = false;
    newEvent.value = {
      title: '',
      date: '',
      time: '',
      repeat: 'once',
      content: '',
    };
  };

  const saveEvent = () => {
    // Save event logic
    closeModal();
  };

  onMounted(() => {
    updateDateTime();
    timeInterval = setInterval(updateDateTime, 1000);
  });

  onUnmounted(() => {
    clearInterval(timeInterval);
  });
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');

  /* Base */
  .retro-schedule {
    position: relative;
    min-height: 100vh;
    background: #0a0a0f;
    color: #fff;
    font-family: 'Share Tech Mono', monospace;
    overflow-x: hidden;
  }

  /* Background Effects */
  .cyber-background {
    position: fixed;
    inset: 0;
    z-index: 0;
  }

  .grid-floor {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 70%;
    background-image:
      linear-gradient(rgba(138, 43, 226, 0.3) 2px, transparent 2px),
      linear-gradient(90deg, rgba(138, 43, 226, 0.3) 2px, transparent 2px);
    background-size: 100px 100px;
    transform: perspective(1000px) rotateX(70deg);
    transform-origin: center bottom;
  }

  .neon-lines {
    position: absolute;
    inset: 0;
    background-image: linear-gradient(
      90deg,
      transparent 49%,
      rgba(255, 0, 110, 0.1) 50%,
      transparent 51%
    );
    background-size: 100px 100%;
    animation: lines-move 10s linear infinite;
  }

  .vhs-noise {
    position: absolute;
    inset: 0;
    opacity: 0.03;
    background: repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0) 0px,
      rgba(255, 255, 255, 0.05) 1px,
      rgba(0, 0, 0, 0) 2px
    );
    animation: noise-shift 0.5s steps(10) infinite;
  }

  /* Header */
  .schedule-header {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem;
    background: rgba(10, 10, 15, 0.9);
    backdrop-filter: blur(10px);
    border-bottom: 2px solid rgba(255, 0, 110, 0.3);
    z-index: 10;
  }

  .page-title {
    font-family: 'Orbitron', monospace;
    font-size: 2rem;
    font-weight: 900;
    color: #ff006e;
    text-shadow:
      0 0 10px currentColor,
      0 0 20px currentColor,
      0 0 30px currentColor;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .title-prefix,
  .title-suffix {
    color: #3a86ff;
    animation: blink-neon 2s ease-in-out infinite;
  }

  .cyber-clock {
    text-align: right;
  }

  .clock-display {
    font-family: 'Orbitron', monospace;
    font-size: 1.3rem;
    color: #ffbe0b;
    text-shadow: 0 0 10px currentColor;
    letter-spacing: 0.1em;
  }

  .clock-label {
    font-size: 0.8rem;
    color: #8338ec;
    margin-top: 0.2rem;
  }

  /* Main Content */
  .schedule-main {
    position: relative;
    padding: 2rem;
    z-index: 1;
  }

  /* Section Titles */
  .section-title {
    margin-bottom: 2rem;
  }

  .section-title h2 {
    font-family: 'Orbitron', monospace;
    font-size: 1.5rem;
    font-weight: 700;
    color: #8338ec;
    text-shadow: 0 0 20px currentColor;
    margin-bottom: 0.5rem;
  }

  .title-decoration {
    height: 2px;
    background: linear-gradient(90deg, #8338ec, transparent);
    width: 200px;
  }

  /* Calendar */
  .calendar-section {
    margin-bottom: 4rem;
  }

  .retro-calendar {
    background: rgba(26, 0, 51, 0.6);
    border: 2px solid rgba(138, 43, 226, 0.5);
    padding: 2rem;
    backdrop-filter: blur(10px);
  }

  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .nav-btn {
    background: transparent;
    border: 1px solid #3a86ff;
    color: #3a86ff;
    font-size: 1.5rem;
    padding: 0.5rem 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .nav-btn:hover {
    background: rgba(58, 134, 255, 0.2);
    box-shadow: 0 0 20px rgba(58, 134, 255, 0.5);
    transform: scale(1.1);
  }

  .month-display {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .month-name {
    font-family: 'Orbitron', monospace;
    font-size: 2rem;
    font-weight: 900;
    background: linear-gradient(45deg, #ff006e, #8338ec);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .year-number {
    font-size: 1.2rem;
    color: #ffbe0b;
    text-shadow: 0 0 10px currentColor;
  }

  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  }

  .day-header {
    padding: 1rem;
    text-align: center;
    font-weight: 700;
    color: #3a86ff;
    border-bottom: 1px solid rgba(58, 134, 255, 0.3);
  }

  .calendar-day {
    position: relative;
    aspect-ratio: 1;
    padding: 0.5rem;
    border: 1px solid rgba(138, 43, 226, 0.2);
    cursor: pointer;
    transition: all 0.3s ease;
    overflow: hidden;
  }

  .calendar-day:hover {
    border-color: #ff006e;
    transform: scale(1.05);
    z-index: 2;
  }

  .calendar-day.other-month {
    opacity: 0.3;
  }

  .calendar-day.today {
    background: rgba(255, 0, 110, 0.2);
    border-color: #ff006e;
  }

  .calendar-day.has-events {
    border-color: #3a86ff;
  }

  .day-number {
    font-size: 1.1rem;
    font-weight: 700;
  }

  .event-indicator {
    position: absolute;
    bottom: 0.3rem;
    right: 0.3rem;
    width: 20px;
    height: 20px;
    background: linear-gradient(45deg, #ff006e, #8338ec);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    animation: pulse-indicator 2s ease-in-out infinite;
  }

  .day-glow {
    position: absolute;
    inset: -50%;
    background: radial-gradient(circle, rgba(255, 0, 110, 0.3), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .calendar-day:hover .day-glow {
    opacity: 1;
  }

  /* Timeline */
  .timeline-section {
    margin-bottom: 4rem;
  }

  .neon-timeline {
    background: rgba(26, 0, 51, 0.6);
    border: 2px solid rgba(138, 43, 226, 0.5);
    padding: 2rem;
    backdrop-filter: blur(10px);
    overflow: hidden;
  }

  .timeline-grid {
    position: relative;
    height: 600px;
  }

  .time-slots {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 100px;
  }

  .time-slot {
    position: relative;
    height: calc(100% / 24);
    display: flex;
    align-items: center;
  }

  .time-label {
    font-size: 0.8rem;
    color: #8338ec;
    padding-right: 1rem;
  }

  .time-line {
    position: absolute;
    right: 0;
    top: 50%;
    width: calc(100vw - 100px);
    height: 1px;
    background: rgba(138, 43, 226, 0.2);
  }

  .events-track {
    position: relative;
    margin-left: 120px;
    height: 100%;
  }

  .timeline-event {
    position: absolute;
    left: 0;
    right: 20px;
    padding: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.3);
    cursor: pointer;
    transition: all 0.3s ease;
    overflow: hidden;
  }

  .timeline-event:hover {
    transform: translateX(10px);
    box-shadow: 0 0 30px rgba(255, 0, 110, 0.5);
  }

  .event-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .event-time {
    font-size: 0.9rem;
    font-weight: 700;
    color: #ffbe0b;
  }

  .event-title {
    font-family: 'Orbitron', monospace;
    font-size: 1.1rem;
    text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  }

  .event-pulse {
    position: absolute;
    inset: 0;
    background: inherit;
    opacity: 0.3;
    animation: event-pulse 3s ease-in-out infinite;
  }

  /* Modal */
  .vhs-modal {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: modal-in 0.3s ease-out;
  }

  .modal-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(5px);
  }

  .modal-content {
    position: relative;
    width: 90%;
    max-width: 600px;
    background: linear-gradient(135deg, #1a0033, #0a0a0f);
    border: 2px solid #ff006e;
    box-shadow:
      0 0 50px rgba(255, 0, 110, 0.5),
      inset 0 0 50px rgba(138, 43, 226, 0.1);
    animation: modal-glow 2s ease-in-out infinite;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid rgba(255, 0, 110, 0.3);
  }

  .modal-header h3 {
    font-family: 'Orbitron', monospace;
    font-size: 1.5rem;
    color: #ff006e;
    text-shadow: 0 0 20px currentColor;
  }

  .close-btn {
    background: transparent;
    border: 1px solid #ff006e;
    color: #ff006e;
    font-size: 1.2rem;
    width: 40px;
    height: 40px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .close-btn:hover {
    background: rgba(255, 0, 110, 0.2);
    transform: rotate(90deg);
  }

  .modal-body {
    padding: 2rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-group label {
    display: block;
    font-family: 'Orbitron', monospace;
    font-size: 0.9rem;
    color: #3a86ff;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .retro-input,
  .retro-textarea {
    width: 100%;
    padding: 1rem;
    background: rgba(26, 0, 51, 0.4);
    border: 1px solid rgba(138, 43, 226, 0.5);
    color: #fff;
    font-family: 'Share Tech Mono', monospace;
    font-size: 1rem;
    transition: all 0.3s ease;
  }

  .retro-input:focus,
  .retro-textarea:focus {
    outline: none;
    border-color: #ff006e;
    box-shadow: 0 0 20px rgba(255, 0, 110, 0.3);
    background: rgba(26, 0, 51, 0.6);
  }

  .retro-textarea {
    resize: vertical;
  }

  .repeat-options {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
  }

  .repeat-btn {
    padding: 0.8rem;
    background: rgba(26, 0, 51, 0.4);
    border: 1px solid rgba(138, 43, 226, 0.5);
    color: #8338ec;
    font-family: 'Orbitron', monospace;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .repeat-btn:hover {
    border-color: #ff006e;
    color: #ff006e;
  }

  .repeat-btn.active {
    background: rgba(255, 0, 110, 0.2);
    border-color: #ff006e;
    color: #ff006e;
    box-shadow: 0 0 20px rgba(255, 0, 110, 0.3);
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding: 1.5rem;
    border-top: 1px solid rgba(255, 0, 110, 0.3);
  }

  .action-btn {
    position: relative;
    padding: 1rem 2rem;
    font-family: 'Orbitron', monospace;
    font-size: 1rem;
    font-weight: 700;
    background: transparent;
    border: 2px solid;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .action-btn.cancel {
    border-color: #8338ec;
    color: #8338ec;
  }

  .action-btn.confirm {
    border-color: #ff006e;
    color: #ff006e;
  }

  .action-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 0 30px currentColor;
  }

  .btn-scanline {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, currentColor, transparent);
    animation: scanline-move 2s linear infinite;
  }

  /* Floating Action Button */
  .fab-button {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 70px;
    height: 70px;
    background: linear-gradient(45deg, #ff006e, #8338ec);
    border: none;
    border-radius: 50%;
    color: #fff;
    font-size: 2rem;
    cursor: pointer;
    box-shadow: 0 0 30px rgba(255, 0, 110, 0.5);
    transition: all 0.3s ease;
    z-index: 50;
  }

  .fab-button:hover {
    transform: scale(1.1) rotate(90deg);
    box-shadow: 0 0 50px rgba(255, 0, 110, 0.8);
  }

  .fab-icon {
    position: relative;
    z-index: 2;
  }

  .fab-ring {
    position: absolute;
    inset: -10px;
    border: 2px solid #ff006e;
    border-radius: 50%;
    animation: ring-pulse 2s ease-out infinite;
  }

  .fab-ring.delay {
    animation-delay: 1s;
  }

  /* Animations */
  @keyframes lines-move {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(100px);
    }
  }

  @keyframes noise-shift {
    0% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(5px);
    }
  }

  @keyframes blink-neon {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @keyframes pulse-indicator {
    0%,
    100% {
      transform: scale(1);
      box-shadow: 0 0 10px rgba(255, 0, 110, 0.5);
    }
    50% {
      transform: scale(1.2);
      box-shadow: 0 0 20px rgba(255, 0, 110, 0.8);
    }
  }

  @keyframes event-pulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.02);
    }
  }

  @keyframes modal-in {
    0% {
      opacity: 0;
      transform: scale(0.8);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes modal-glow {
    0%,
    100% {
      box-shadow:
        0 0 50px rgba(255, 0, 110, 0.5),
        inset 0 0 50px rgba(138, 43, 226, 0.1);
    }
    50% {
      box-shadow:
        0 0 80px rgba(255, 0, 110, 0.8),
        inset 0 0 80px rgba(138, 43, 226, 0.2);
    }
  }

  @keyframes scanline-move {
    0% {
      left: -100%;
    }
    100% {
      left: 100%;
    }
  }

  @keyframes ring-pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(1.5);
      opacity: 0;
    }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .schedule-header {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }

    .page-title {
      font-size: 1.5rem;
    }

    .calendar-grid {
      gap: 2px;
    }

    .calendar-day {
      font-size: 0.9rem;
    }

    .time-slots {
      width: 60px;
    }

    .events-track {
      margin-left: 70px;
    }

    .form-row {
      grid-template-columns: 1fr;
    }

    .repeat-options {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
