<template>
  <div class="modern-schedule-manager">
    <!-- Header -->
    <div class="schedule-header">
      <v-container>
        <v-row align="center" justify="space-between">
          <v-col cols="auto">
            <div class="header-title-section">
              <h1 class="page-title">Schedule Manager</h1>
              <p class="page-subtitle">
                Plan, organize, and automate your Instagram content
              </p>
            </div>
          </v-col>
          <v-col cols="auto">
            <div class="header-actions">
              <v-btn
                color="primary"
                variant="flat"
                class="create-schedule-btn me-3"
                @click="createSchedule"
              >
                <v-icon start>mdi-calendar-plus</v-icon>
                Schedule Post
              </v-btn>
              <v-btn
                color="secondary"
                variant="outlined"
                class="bulk-action-btn"
                @click="bulkActions"
              >
                <v-icon start>mdi-format-list-bulleted</v-icon>
                Bulk Actions
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Quick Stats -->
    <v-container class="stats-section">
      <v-row>
        <v-col
          v-for="(stat, index) in quickStats"
          :key="index"
          cols="12"
          sm="6"
          md="3"
        >
          <v-card
            class="quick-stat-card"
            elevation="0"
            data-aos="fade-up"
            :data-aos-delay="index * 100"
          >
            <div class="stat-content">
              <v-avatar size="56" :class="`stat-icon stat-icon--${stat.color}`">
                <v-icon :icon="stat.icon" size="28"></v-icon>
              </v-avatar>
              <div class="stat-info">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- View Toggle & Filters -->
    <v-container>
      <v-row class="controls-section">
        <v-col cols="12" md="6">
          <v-btn-toggle
            v-model="viewMode"
            variant="outlined"
            mandatory
            class="view-toggle"
          >
            <v-btn value="calendar" prepend-icon="mdi-calendar">Calendar</v-btn>
            <v-btn value="timeline" prepend-icon="mdi-timeline">Timeline</v-btn>
            <v-btn value="list" prepend-icon="mdi-format-list-bulleted"
              >List</v-btn
            >
          </v-btn-toggle>
        </v-col>
        <v-col cols="12" md="6">
          <div class="filters-section">
            <v-select
              v-model="selectedAccount"
              :items="accountOptions"
              label="Account"
              variant="outlined"
              density="compact"
              class="filter-select me-3"
            ></v-select>
            <v-select
              v-model="selectedStatus"
              :items="statusOptions"
              label="Status"
              variant="outlined"
              density="compact"
              class="filter-select"
            ></v-select>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <!-- Calendar View -->
    <v-container v-if="viewMode === 'calendar'">
      <v-card class="calendar-card" elevation="2" data-aos="fade-up">
        <v-card-title class="calendar-header">
          <div class="calendar-title">
            <h3>{{ currentMonth }} {{ currentYear }}</h3>
            <p class="calendar-subtitle">Drag and drop to reschedule posts</p>
          </div>
          <div class="calendar-navigation">
            <v-btn
              icon="mdi-chevron-left"
              variant="text"
              @click="previousMonth"
            ></v-btn>
            <v-btn variant="outlined" @click="goToToday"> Today </v-btn>
            <v-btn
              icon="mdi-chevron-right"
              variant="text"
              @click="nextMonth"
            ></v-btn>
          </div>
        </v-card-title>
        <v-card-text>
          <div class="calendar-grid">
            <!-- Calendar weekdays -->
            <div class="calendar-weekdays">
              <div v-for="day in weekdays" :key="day" class="weekday-header">
                {{ day }}
              </div>
            </div>

            <!-- Calendar days -->
            <div class="calendar-days">
              <div
                v-for="(day, index) in calendarDays"
                :key="index"
                class="calendar-day"
                :class="{
                  'other-month': day.otherMonth,
                  today: day.isToday,
                  'has-posts': day.posts.length > 0,
                }"
                @click="selectDay(day)"
              >
                <div class="day-number">{{ day.day }}</div>
                <div v-if="day.posts.length > 0" class="day-posts">
                  <div
                    v-for="post in day.posts.slice(0, 3)"
                    :key="post.id"
                    class="day-post"
                    :class="`post-${post.status}`"
                    @click.stop="viewPost(post)"
                  >
                    <div class="post-time">{{ post.time }}</div>
                    <div class="post-preview">{{ post.caption }}</div>
                  </div>
                  <div v-if="day.posts.length > 3" class="more-posts">
                    +{{ day.posts.length - 3 }} more
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-container>

    <!-- Timeline View -->
    <v-container v-if="viewMode === 'timeline'">
      <v-card class="timeline-card" elevation="2" data-aos="fade-up">
        <v-card-title>
          <h3>Content Timeline</h3>
          <p class="timeline-subtitle">
            Visual overview of your posting schedule
          </p>
        </v-card-title>
        <v-card-text>
          <div class="timeline-container">
            <v-timeline side="end" class="schedule-timeline">
              <v-timeline-item
                v-for="(item, index) in timelineItems"
                :key="index"
                :dot-color="getTimelineColor(item.status)"
                size="large"
                fill-dot
              >
                <template v-slot:icon>
                  <v-icon
                    :icon="getTimelineIcon(item.status)"
                    size="20"
                  ></v-icon>
                </template>

                <div class="timeline-content">
                  <v-card class="timeline-post-card" elevation="2">
                    <v-row no-gutters>
                      <v-col cols="auto">
                        <div class="timeline-media">
                          <v-img
                            :src="item.image"
                            width="80"
                            height="80"
                            class="timeline-thumbnail"
                          ></v-img>
                        </div>
                      </v-col>
                      <v-col>
                        <v-card-text class="timeline-details">
                          <div class="timeline-meta">
                            <v-chip
                              :color="getStatusColor(item.status)"
                              size="small"
                              class="status-chip me-2"
                            >
                              {{ item.status }}
                            </v-chip>
                            <span class="timeline-account"
                              >@{{ item.account }}</span
                            >
                          </div>
                          <div class="timeline-caption">{{ item.caption }}</div>
                          <div class="timeline-time">
                            <v-icon
                              icon="mdi-clock-outline"
                              size="16"
                              class="me-1"
                            ></v-icon>
                            {{ item.scheduledTime }}
                          </div>
                        </v-card-text>
                      </v-col>
                      <v-col cols="auto">
                        <div class="timeline-actions">
                          <v-btn
                            icon="mdi-pencil"
                            size="small"
                            variant="text"
                            @click="editSchedule(item)"
                          ></v-btn>
                          <v-btn
                            icon="mdi-delete"
                            size="small"
                            variant="text"
                            color="error"
                            @click="deleteSchedule(item)"
                          ></v-btn>
                        </div>
                      </v-col>
                    </v-row>
                  </v-card>
                </div>
              </v-timeline-item>
            </v-timeline>
          </div>
        </v-card-text>
      </v-card>
    </v-container>

    <!-- List View -->
    <v-container v-if="viewMode === 'list'">
      <v-card class="list-card" elevation="2" data-aos="fade-up">
        <v-card-title class="list-header">
          <h3>Scheduled Posts</h3>
          <div class="list-controls">
            <v-text-field
              v-model="searchQuery"
              placeholder="Search posts..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              class="search-field me-3"
            ></v-text-field>
            <v-btn color="primary" variant="outlined" @click="exportSchedule">
              <v-icon start>mdi-download</v-icon>
              Export
            </v-btn>
          </div>
        </v-card-title>
        <v-card-text>
          <v-data-table
            :headers="tableHeaders"
            :items="filteredPosts"
            :search="searchQuery"
            class="schedule-table"
            item-value="id"
          >
            <template v-slot:item.media="{ item }">
              <v-avatar size="50" class="table-media">
                <v-img :src="item.image"></v-img>
              </v-avatar>
            </template>

            <template v-slot:item.caption="{ item }">
              <div class="caption-cell">
                <div class="caption-text">{{ item.caption }}</div>
                <div class="caption-account">@{{ item.account }}</div>
              </div>
            </template>

            <template v-slot:item.status="{ item }">
              <v-chip :color="getStatusColor(item.status)" size="small">
                {{ item.status }}
              </v-chip>
            </template>

            <template v-slot:item.actions="{ item }">
              <div class="table-actions">
                <v-btn
                  icon="mdi-eye"
                  size="small"
                  variant="text"
                  @click="viewPost(item)"
                ></v-btn>
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  @click="editSchedule(item)"
                ></v-btn>
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  @click="deleteSchedule(item)"
                ></v-btn>
              </div>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-container>

    <!-- Quick Schedule Panel -->
    <div class="quick-schedule-panel" v-if="showQuickPanel">
      <v-card class="quick-panel-card" elevation="8">
        <v-card-title class="quick-panel-header">
          <h4>Quick Schedule</h4>
          <v-btn
            icon="mdi-close"
            size="small"
            variant="text"
            @click="closeQuickPanel"
          ></v-btn>
        </v-card-title>
        <v-card-text>
          <v-form class="quick-schedule-form">
            <v-textarea
              v-model="quickSchedule.caption"
              label="Caption"
              rows="3"
              variant="outlined"
              class="mb-4"
            ></v-textarea>

            <v-select
              v-model="quickSchedule.account"
              :items="accountOptions"
              label="Account"
              variant="outlined"
              class="mb-4"
            ></v-select>

            <v-text-field
              v-model="quickSchedule.date"
              label="Date"
              type="date"
              variant="outlined"
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model="quickSchedule.time"
              label="Time"
              type="time"
              variant="outlined"
              class="mb-4"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" variant="flat" @click="saveQuickSchedule">
            Schedule Post
          </v-btn>
          <v-btn variant="text" @click="closeQuickPanel"> Cancel </v-btn>
        </v-card-actions>
      </v-card>
    </div>

    <!-- Floating Action Button -->
    <v-fab
      class="fab-schedule"
      color="primary"
      icon="mdi-plus"
      size="large"
      @click="showQuickPanel = true"
    ></v-fab>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import AOS from 'aos';
  import 'aos/dist/aos.css';

  // Reactive data
  const viewMode = ref('calendar');
  const selectedAccount = ref('all');
  const selectedStatus = ref('all');
  const searchQuery = ref('');
  const currentDate = ref(new Date());
  const showQuickPanel = ref(false);

  // Quick stats
  const quickStats = ref([
    {
      icon: 'mdi-calendar-check',
      label: 'Scheduled',
      value: '24',
      color: 'primary',
    },
    {
      icon: 'mdi-clock-outline',
      label: 'Pending',
      value: '8',
      color: 'warning',
    },
    {
      icon: 'mdi-check-circle',
      label: 'Published',
      value: '156',
      color: 'success',
    },
    {
      icon: 'mdi-alert-circle',
      label: 'Failed',
      value: '2',
      color: 'error',
    },
  ]);

  // Options
  const accountOptions = ref([
    { title: 'All Accounts', value: 'all' },
    { title: '@sarah_travels', value: 'sarah_travels' },
    { title: '@sarah_fitness', value: 'sarah_fitness' },
    { title: '@sarah_food', value: 'sarah_food' },
  ]);

  const statusOptions = ref([
    { title: 'All Status', value: 'all' },
    { title: 'Scheduled', value: 'scheduled' },
    { title: 'Published', value: 'published' },
    { title: 'Failed', value: 'failed' },
    { title: 'Draft', value: 'draft' },
  ]);

  // Calendar data
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const currentMonth = computed(() => {
    return currentDate.value.toLocaleDateString('en-US', { month: 'long' });
  });

  const currentYear = computed(() => {
    return currentDate.value.getFullYear();
  });

  // Sample posts data
  const samplePosts = ref([
    {
      id: 1,
      caption: 'Beautiful sunset at the beach 🌅',
      account: 'sarah_travels',
      image: 'https://picsum.photos/300/300?random=1',
      scheduledTime: '2024-01-15 18:00',
      status: 'scheduled',
      time: '6:00 PM',
    },
    {
      id: 2,
      caption: 'Morning workout motivation 💪',
      account: 'sarah_fitness',
      image: 'https://picsum.photos/300/300?random=2',
      scheduledTime: '2024-01-16 07:00',
      status: 'scheduled',
      time: '7:00 AM',
    },
    {
      id: 3,
      caption: 'Delicious healthy breakfast bowl 🥗',
      account: 'sarah_food',
      image: 'https://picsum.photos/300/300?random=3',
      scheduledTime: '2024-01-16 12:00',
      status: 'scheduled',
      time: '12:00 PM',
    },
    {
      id: 4,
      caption: 'Adventure awaits! Mountain hiking 🏔️',
      account: 'sarah_travels',
      image: 'https://picsum.photos/300/300?random=4',
      scheduledTime: '2024-01-17 15:00',
      status: 'published',
      time: '3:00 PM',
    },
    {
      id: 5,
      caption: 'Yoga session in the park 🧘‍♀️',
      account: 'sarah_fitness',
      image: 'https://picsum.photos/300/300?random=5',
      scheduledTime: '2024-01-18 08:00',
      status: 'failed',
      time: '8:00 AM',
    },
  ]);

  // Calendar computed properties
  const calendarDays = computed(() => {
    const year = currentDate.value.getFullYear();
    const month = currentDate.value.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const today = new Date();

    for (let i = 0; i < 42; i++) {
      const currentDay = new Date(startDate);
      currentDay.setDate(startDate.getDate() + i);

      const dayPosts = samplePosts.value.filter(post => {
        const postDate = new Date(post.scheduledTime);
        return postDate.toDateString() === currentDay.toDateString();
      });

      days.push({
        day: currentDay.getDate(),
        fullDate: currentDay,
        otherMonth: currentDay.getMonth() !== month,
        isToday: currentDay.toDateString() === today.toDateString(),
        posts: dayPosts,
      });
    }

    return days;
  });

  // Timeline items
  const timelineItems = computed(() => {
    return samplePosts.value
      .sort(
        (a, b) =>
          new Date(a.scheduledTime).getTime() -
          new Date(b.scheduledTime).getTime()
      )
      .map(post => ({
        ...post,
        scheduledTime: new Date(post.scheduledTime).toLocaleDateString(
          'en-US',
          {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          }
        ),
      }));
  });

  // Filtered posts for list view
  const filteredPosts = computed(() => {
    let filtered = samplePosts.value;

    if (selectedAccount.value !== 'all') {
      filtered = filtered.filter(
        post => post.account === selectedAccount.value
      );
    }

    if (selectedStatus.value !== 'all') {
      filtered = filtered.filter(post => post.status === selectedStatus.value);
    }

    return filtered.map(post => ({
      ...post,
      scheduledTime: new Date(post.scheduledTime).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
    }));
  });

  // Table headers
  const tableHeaders = ref([
    { title: 'Media', key: 'media', sortable: false },
    { title: 'Caption', key: 'caption' },
    { title: 'Account', key: 'account' },
    { title: 'Scheduled Time', key: 'scheduledTime' },
    { title: 'Status', key: 'status' },
    { title: 'Actions', key: 'actions', sortable: false },
  ]);

  // Quick schedule form
  const quickSchedule = ref({
    caption: '',
    account: '',
    date: '',
    time: '',
  });

  // Methods
  const createSchedule = () => {
    console.log('Create schedule clicked');
  };

  const bulkActions = () => {
    console.log('Bulk actions clicked');
  };

  const previousMonth = () => {
    const newDate = new Date(currentDate.value);
    newDate.setMonth(newDate.getMonth() - 1);
    currentDate.value = newDate;
  };

  const nextMonth = () => {
    const newDate = new Date(currentDate.value);
    newDate.setMonth(newDate.getMonth() + 1);
    currentDate.value = newDate;
  };

  const goToToday = () => {
    currentDate.value = new Date();
  };

  const selectDay = (day: any) => {
    console.log('Day selected:', day);
  };

  const viewPost = (post: any) => {
    console.log('View post:', post.caption);
  };

  const editSchedule = (item: any) => {
    console.log('Edit schedule:', item.caption);
  };

  const deleteSchedule = (item: any) => {
    console.log('Delete schedule:', item.caption);
  };

  const exportSchedule = () => {
    console.log('Export schedule');
  };

  const getTimelineColor = (status: string) => {
    const colors = {
      scheduled: 'primary',
      published: 'success',
      failed: 'error',
      draft: 'warning',
    };
    return colors[status as keyof typeof colors] || 'grey';
  };

  const getTimelineIcon = (status: string) => {
    const icons = {
      scheduled: 'mdi-clock-outline',
      published: 'mdi-check-circle',
      failed: 'mdi-alert-circle',
      draft: 'mdi-file-document',
    };
    return icons[status as keyof typeof icons] || 'mdi-circle';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'primary',
      published: 'success',
      failed: 'error',
      draft: 'warning',
    };
    return colors[status as keyof typeof colors] || 'grey';
  };

  const closeQuickPanel = () => {
    showQuickPanel.value = false;
    quickSchedule.value = {
      caption: '',
      account: '',
      date: '',
      time: '',
    };
  };

  const saveQuickSchedule = () => {
    console.log('Save quick schedule:', quickSchedule.value);
    closeQuickPanel();
  };

  // Lifecycle
  onMounted(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-out-cubic',
      once: true,
    });
  });
</script>

<style scoped>
  .modern-schedule-manager {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    min-height: 100vh;
    padding-bottom: 80px;
  }

  /* Header */
  .schedule-header {
    background: white;
    padding: 2rem 0;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
  }

  .page-title {
    font-size: 2.2rem;
    font-weight: 700;
    color: #2c3e50;
    margin: 0;
  }

  .page-subtitle {
    color: #7f8c8d;
    font-size: 1.1rem;
    margin: 0.5rem 0 0;
  }

  .header-actions {
    display: flex;
    gap: 1rem;
  }

  .create-schedule-btn {
    background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-weight: 600;
    border-radius: 25px;
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
    transition: all 0.3s ease;
  }

  .create-schedule-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(102, 126, 234, 0.4);
  }

  .bulk-action-btn {
    border-radius: 25px;
    font-weight: 600;
  }

  /* Quick Stats */
  .stats-section {
    margin-bottom: 2rem;
  }

  .quick-stat-card {
    background: white;
    border-radius: 20px;
    padding: 1.5rem;
    transition: all 0.3s ease;
    height: 100%;
  }

  .quick-stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }

  .stat-content {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .stat-icon {
    background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  }

  .stat-icon--primary {
    background: linear-gradient(45deg, #2196f3, #90caf9);
  }

  .stat-icon--warning {
    background: linear-gradient(45deg, #ff9800, #ffcc02);
  }

  .stat-icon--success {
    background: linear-gradient(45deg, #4caf50, #a5d6a7);
  }

  .stat-icon--error {
    background: linear-gradient(45deg, #f44336, #ef9a9a);
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 900;
    color: #2c3e50;
    line-height: 1;
  }

  .stat-label {
    color: #7f8c8d;
    font-size: 0.9rem;
    margin-top: 0.25rem;
  }

  /* Controls */
  .controls-section {
    margin-bottom: 2rem;
  }

  .view-toggle .v-btn {
    border-radius: 25px;
    font-weight: 600;
  }

  .filters-section {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }

  .filter-select {
    min-width: 150px;
  }

  /* Calendar View */
  .calendar-card {
    background: white;
    border-radius: 20px;
    overflow: hidden;
  }

  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #f0f0f0;
  }

  .calendar-title h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #2c3e50;
    margin: 0;
  }

  .calendar-subtitle {
    color: #7f8c8d;
    font-size: 0.9rem;
    margin: 0.25rem 0 0;
  }

  .calendar-navigation {
    display: flex;
    align-items: center;
    gap: 1rem;
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

  .weekday-header {
    padding: 1rem;
    text-align: center;
    font-weight: 600;
    color: #7f8c8d;
    background: #f8f9fa;
    border-radius: 8px;
  }

  .calendar-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
  }

  .calendar-day {
    min-height: 120px;
    padding: 0.5rem;
    background: #fafafa;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
  }

  .calendar-day:hover {
    background: #f0f0f0;
    transform: scale(1.02);
  }

  .calendar-day.today {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .calendar-day.today .day-number {
    color: white;
  }

  .calendar-day.other-month {
    opacity: 0.3;
  }

  .calendar-day.has-posts {
    background: #e3f2fd;
  }

  .day-number {
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }

  .day-posts {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .day-post {
    background: white;
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    border-left: 3px solid;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .day-post:hover {
    transform: translateX(2px);
  }

  .post-scheduled {
    border-left-color: #2196f3;
  }

  .post-published {
    border-left-color: #4caf50;
  }

  .post-failed {
    border-left-color: #f44336;
  }

  .post-time {
    font-weight: 600;
    color: #666;
  }

  .post-preview {
    color: #888;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .more-posts {
    background: #e0e0e0;
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
    color: #666;
    text-align: center;
  }

  /* Timeline View */
  .timeline-card {
    background: white;
    border-radius: 20px;
  }

  .timeline-card h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #2c3e50;
    margin: 0;
  }

  .timeline-subtitle {
    color: #7f8c8d;
    font-size: 0.9rem;
    margin: 0.25rem 0 0;
  }

  .timeline-container {
    max-height: 600px;
    overflow-y: auto;
  }

  .schedule-timeline {
    padding: 1rem 0;
  }

  .timeline-content {
    width: 100%;
  }

  .timeline-post-card {
    border-radius: 15px;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .timeline-post-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  .timeline-media {
    padding: 1rem;
  }

  .timeline-thumbnail {
    border-radius: 10px;
    object-fit: cover;
  }

  .timeline-details {
    padding: 1rem 1rem 1rem 0;
  }

  .timeline-meta {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .status-chip {
    text-transform: capitalize;
  }

  .timeline-account {
    color: #7f8c8d;
    font-size: 0.9rem;
  }

  .timeline-caption {
    font-weight: 500;
    color: #2c3e50;
    margin-bottom: 0.5rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .timeline-time {
    color: #7f8c8d;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
  }

  .timeline-actions {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  /* List View */
  .list-card {
    background: white;
    border-radius: 20px;
  }

  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #f0f0f0;
  }

  .list-header h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #2c3e50;
    margin: 0;
  }

  .list-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .search-field {
    min-width: 250px;
  }

  .schedule-table {
    border-radius: 15px;
    overflow: hidden;
  }

  .table-media {
    border-radius: 8px;
  }

  .caption-cell {
    max-width: 300px;
  }

  .caption-text {
    font-weight: 500;
    color: #2c3e50;
    margin-bottom: 0.25rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .caption-account {
    color: #7f8c8d;
    font-size: 0.85rem;
  }

  .table-actions {
    display: flex;
    gap: 0.25rem;
  }

  /* Quick Schedule Panel */
  .quick-schedule-panel {
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

  .quick-panel-card {
    background: white;
    border-radius: 20px;
    min-width: 400px;
    max-width: 500px;
    width: 90%;
  }

  .quick-panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #f0f0f0;
  }

  .quick-panel-header h4 {
    font-size: 1.3rem;
    font-weight: 700;
    color: #2c3e50;
    margin: 0;
  }

  .quick-schedule-form {
    padding: 1rem 0;
  }

  /* Floating Action Button */
  .fab-schedule {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
    z-index: 999;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .schedule-header {
      padding: 1rem 0;
    }

    .page-title {
      font-size: 1.8rem;
    }

    .header-actions {
      flex-direction: column;
      gap: 0.5rem;
      width: 100%;
    }

    .controls-section {
      flex-direction: column;
      gap: 1rem;
    }

    .view-toggle {
      width: 100%;
    }

    .filters-section {
      justify-content: flex-start;
      flex-wrap: wrap;
    }

    .filter-select {
      min-width: 120px;
    }

    .calendar-header {
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }

    .calendar-day {
      min-height: 80px;
      padding: 0.25rem;
    }

    .list-header {
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }

    .list-controls {
      width: 100%;
      flex-direction: column;
    }

    .search-field {
      min-width: auto;
      width: 100%;
    }

    .quick-panel-card {
      min-width: auto;
      margin: 1rem;
    }
  }
</style>
