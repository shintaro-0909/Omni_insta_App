<template>
  <div class="posting-types-container">
    <!-- Header Section -->
    <div class="header-section">
      <div class="header-content">
        <h1 class="main-title">
          <v-icon icon="mdi-clock-outline" size="32" class="mr-3"></v-icon>
          投稿タイプ設定
        </h1>
        <p class="subtitle">
          目的に合わせて最適な投稿スケジュールを選択してください
        </p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="content-section">
      <v-container fluid class="pa-0">
        <v-row>
          <!-- Type Selection Cards -->
          <v-col cols="12" lg="4" class="type-selection">
            <div class="sticky-sidebar">
              <h2 class="section-title mb-4">投稿タイプ</h2>

              <div class="type-cards">
                <div
                  v-for="type in postingTypes"
                  :key="type.id"
                  class="type-card"
                  :class="{ active: activeType === type.id }"
                  @click="setActiveType(type.id)"
                >
                  <div class="card-header">
                    <div class="icon-wrapper">
                      <v-icon :icon="type.icon" size="24"></v-icon>
                    </div>
                    <div class="card-title">
                      <h3>{{ type.name }}</h3>
                      <span class="difficulty" :class="type.difficulty">{{
                        type.difficultyLabel
                      }}</span>
                    </div>
                  </div>

                  <p class="card-description">{{ type.description }}</p>

                  <div class="card-features">
                    <div
                      v-for="feature in type.features"
                      :key="feature"
                      class="feature-item"
                    >
                      <v-icon
                        icon="mdi-check-circle"
                        size="16"
                        color="success"
                      ></v-icon>
                      <span>{{ feature }}</span>
                    </div>
                  </div>

                  <div class="card-stats">
                    <div class="stat">
                      <span class="stat-label">推奨頻度</span>
                      <span class="stat-value">{{ type.frequency }}</span>
                    </div>
                    <div class="stat">
                      <span class="stat-label">効果</span>
                      <span class="stat-value">{{ type.effectiveness }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </v-col>

          <!-- Configuration Panel -->
          <v-col cols="12" lg="8" class="config-panel">
            <div class="config-content">
              <!-- Auto Posting Configuration -->
              <div v-if="activeType === 'auto'" class="config-section">
                <div class="config-header">
                  <h2>自動投稿設定</h2>
                  <p>AIが最適なタイミングで自動投稿します</p>
                </div>

                <v-card class="config-card">
                  <v-card-text>
                    <div class="setting-group">
                      <h4 class="group-title">
                        <v-icon icon="mdi-brain" class="mr-2"></v-icon>
                        AI最適化設定
                      </h4>

                      <v-row>
                        <v-col cols="12" md="6">
                          <v-select
                            v-model="autoConfig.optimization"
                            :items="optimizationOptions"
                            label="最適化目標"
                            variant="outlined"
                            density="comfortable"
                          ></v-select>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-select
                            v-model="autoConfig.frequency"
                            :items="frequencyOptions"
                            label="投稿頻度"
                            variant="outlined"
                            density="comfortable"
                          ></v-select>
                        </v-col>
                      </v-row>
                    </div>

                    <v-divider class="my-6"></v-divider>

                    <div class="setting-group">
                      <h4 class="group-title">
                        <v-icon
                          icon="mdi-clock-time-four"
                          class="mr-2"
                        ></v-icon>
                        投稿時間帯
                      </h4>

                      <div class="time-slots">
                        <div
                          v-for="slot in timeSlots"
                          :key="slot.id"
                          class="time-slot"
                          :class="{
                            active: autoConfig.timeSlots.includes(slot.id),
                          }"
                          @click="toggleTimeSlot(slot.id)"
                        >
                          <div class="slot-icon">
                            <v-icon :icon="slot.icon" size="20"></v-icon>
                          </div>
                          <div class="slot-info">
                            <span class="slot-name">{{ slot.name }}</span>
                            <span class="slot-time">{{ slot.time }}</span>
                          </div>
                          <div class="slot-effectiveness">
                            <div class="effectiveness-bar">
                              <div
                                class="effectiveness-fill"
                                :style="{ width: slot.effectiveness + '%' }"
                              ></div>
                            </div>
                            <span class="effectiveness-value"
                              >{{ slot.effectiveness }}%</span
                            >
                          </div>
                        </div>
                      </div>
                    </div>

                    <v-divider class="my-6"></v-divider>

                    <div class="setting-group">
                      <h4 class="group-title">
                        <v-icon icon="mdi-tune" class="mr-2"></v-icon>
                        詳細設定
                      </h4>

                      <v-row>
                        <v-col cols="12" md="6">
                          <v-switch
                            v-model="autoConfig.weekendPosting"
                            label="週末投稿を含める"
                            color="primary"
                            hide-details
                          ></v-switch>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-switch
                            v-model="autoConfig.holidayPosting"
                            label="祝日投稿を含める"
                            color="primary"
                            hide-details
                          ></v-switch>
                        </v-col>
                      </v-row>
                    </div>
                  </v-card-text>
                </v-card>

                <!-- Preview Section -->
                <div class="preview-section">
                  <h4 class="preview-title">
                    <v-icon icon="mdi-eye" class="mr-2"></v-icon>
                    投稿スケジュール予測
                  </h4>

                  <div class="schedule-preview">
                    <div class="preview-calendar">
                      <div
                        v-for="day in previewDays"
                        :key="day.date"
                        class="preview-day"
                      >
                        <div class="day-header">
                          <span class="day-name">{{ day.name }}</span>
                          <span class="day-date">{{ day.date }}</span>
                        </div>
                        <div class="day-posts">
                          <div
                            v-for="post in day.posts"
                            :key="post.time"
                            class="preview-post"
                            :class="post.type"
                          >
                            <v-icon :icon="post.icon" size="12"></v-icon>
                            <span>{{ post.time }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Infinite Posting Configuration -->
              <div v-if="activeType === 'infinite'" class="config-section">
                <div class="config-header">
                  <h2>無限投稿設定</h2>
                  <p>コンテンツライブラリから自動で継続投稿</p>
                </div>

                <v-card class="config-card">
                  <v-card-text>
                    <div class="setting-group">
                      <h4 class="group-title">
                        <v-icon icon="mdi-infinity" class="mr-2"></v-icon>
                        投稿間隔設定
                      </h4>

                      <div class="interval-selector">
                        <v-slider
                          v-model="infiniteConfig.intervalHours"
                          :min="1"
                          :max="72"
                          :step="1"
                          thumb-label="always"
                          class="interval-slider"
                        >
                          <template v-slot:thumb-label="{ modelValue }">
                            {{ modelValue }}時間
                          </template>
                        </v-slider>

                        <div class="interval-presets">
                          <v-chip
                            v-for="preset in intervalPresets"
                            :key="preset.value"
                            :variant="
                              infiniteConfig.intervalHours === preset.value
                                ? 'flat'
                                : 'outlined'
                            "
                            :color="
                              infiniteConfig.intervalHours === preset.value
                                ? 'primary'
                                : ''
                            "
                            @click="infiniteConfig.intervalHours = preset.value"
                            class="mr-2 mb-2"
                          >
                            {{ preset.label }}
                          </v-chip>
                        </div>
                      </div>
                    </div>

                    <v-divider class="my-6"></v-divider>

                    <div class="setting-group">
                      <h4 class="group-title">
                        <v-icon
                          icon="mdi-folder-multiple"
                          class="mr-2"
                        ></v-icon>
                        コンテンツ選択
                      </h4>

                      <v-row>
                        <v-col cols="12" md="6">
                          <v-select
                            v-model="infiniteConfig.contentSource"
                            :items="contentSources"
                            label="コンテンツソース"
                            variant="outlined"
                            density="comfortable"
                          ></v-select>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-select
                            v-model="infiniteConfig.selectionMethod"
                            :items="selectionMethods"
                            label="選択方法"
                            variant="outlined"
                            density="comfortable"
                          ></v-select>
                        </v-col>
                      </v-row>
                    </div>

                    <div class="content-preview">
                      <div class="content-queue">
                        <h5 class="queue-title">投稿予定コンテンツ</h5>
                        <div class="queue-items">
                          <div
                            v-for="(item, index) in contentQueue"
                            :key="index"
                            class="queue-item"
                          >
                            <div class="item-image">
                              <img :src="item.thumbnail" :alt="item.title" />
                            </div>
                            <div class="item-info">
                              <span class="item-title">{{ item.title }}</span>
                              <span class="item-time">{{
                                item.scheduledTime
                              }}</span>
                            </div>
                            <div class="item-actions">
                              <v-btn icon size="small" variant="text">
                                <v-icon icon="mdi-drag-vertical"></v-icon>
                              </v-btn>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </div>

              <!-- Weekly Posting Configuration -->
              <div v-if="activeType === 'weekly'" class="config-section">
                <div class="config-header">
                  <h2>曜日投稿設定</h2>
                  <p>曜日ごとに決まった時間に投稿</p>
                </div>

                <v-card class="config-card">
                  <v-card-text>
                    <div class="weekly-schedule">
                      <div
                        v-for="day in weekDays"
                        :key="day.id"
                        class="day-schedule"
                      >
                        <div class="day-header">
                          <v-checkbox
                            v-model="weeklyConfig.activeDays"
                            :value="day.id"
                            hide-details
                          ></v-checkbox>
                          <div class="day-info">
                            <span class="day-name">{{ day.name }}</span>
                            <span class="day-name-en">{{ day.nameEn }}</span>
                          </div>
                        </div>

                        <div
                          v-if="weeklyConfig.activeDays.includes(day.id)"
                          class="day-times"
                        >
                          <div class="time-slots-container">
                            <div
                              v-for="(time, index) in weeklyConfig.dayTimes[
                                day.id
                              ] || []"
                              :key="index"
                              class="time-slot-item"
                            >
                              <v-text-field
                                v-model="weeklyConfig.dayTimes[day.id][index]"
                                type="time"
                                variant="outlined"
                                density="compact"
                                hide-details
                              ></v-text-field>
                              <v-btn
                                icon
                                size="small"
                                variant="text"
                                @click="removeTimeSlot(day.id, index)"
                              >
                                <v-icon icon="mdi-close"></v-icon>
                              </v-btn>
                            </div>

                            <v-btn
                              variant="outlined"
                              size="small"
                              @click="addTimeSlot(day.id)"
                              class="add-time-btn"
                            >
                              <v-icon icon="mdi-plus" class="mr-1"></v-icon>
                              時間追加
                            </v-btn>
                          </div>
                        </div>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>

                <!-- Weekly Preview -->
                <div class="weekly-preview">
                  <h4 class="preview-title">
                    <v-icon icon="mdi-calendar-week" class="mr-2"></v-icon>
                    週間スケジュール
                  </h4>

                  <div class="weekly-grid">
                    <div
                      v-for="day in weekDays"
                      :key="day.id"
                      class="weekly-day"
                      :class="{
                        active: weeklyConfig.activeDays.includes(day.id),
                      }"
                    >
                      <div class="weekly-day-header">
                        <span class="day-name">{{ day.shortName }}</span>
                      </div>
                      <div class="weekly-day-content">
                        <div
                          v-for="time in weeklyConfig.dayTimes[day.id] || []"
                          :key="time"
                          class="weekly-time"
                        >
                          {{ time }}
                        </div>
                        <div
                          v-if="!weeklyConfig.activeDays.includes(day.id)"
                          class="no-posts"
                        >
                          投稿なし
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Random Posting Configuration -->
              <div v-if="activeType === 'random'" class="config-section">
                <div class="config-header">
                  <h2>ランダム投稿設定</h2>
                  <p>指定範囲内でランダムな時間に投稿</p>
                </div>

                <v-card class="config-card">
                  <v-card-text>
                    <div class="setting-group">
                      <h4 class="group-title">
                        <v-icon icon="mdi-dice-multiple" class="mr-2"></v-icon>
                        ランダム範囲設定
                      </h4>

                      <v-row>
                        <v-col cols="12" md="6">
                          <div class="range-input">
                            <label>最小間隔</label>
                            <v-slider
                              v-model="randomConfig.minInterval"
                              :min="1"
                              :max="24"
                              :step="1"
                              thumb-label="always"
                            >
                              <template v-slot:thumb-label="{ modelValue }">
                                {{ modelValue }}時間
                              </template>
                            </v-slider>
                          </div>
                        </v-col>
                        <v-col cols="12" md="6">
                          <div class="range-input">
                            <label>最大間隔</label>
                            <v-slider
                              v-model="randomConfig.maxInterval"
                              :min="randomConfig.minInterval"
                              :max="168"
                              :step="1"
                              thumb-label="always"
                            >
                              <template v-slot:thumb-label="{ modelValue }">
                                {{ modelValue }}時間
                              </template>
                            </v-slider>
                          </div>
                        </v-col>
                      </v-row>
                    </div>

                    <v-divider class="my-6"></v-divider>

                    <div class="setting-group">
                      <h4 class="group-title">
                        <v-icon icon="mdi-clock-outline" class="mr-2"></v-icon>
                        投稿時間制限
                      </h4>

                      <div class="time-restrictions">
                        <v-row>
                          <v-col cols="12" md="6">
                            <v-text-field
                              v-model="randomConfig.startTime"
                              type="time"
                              label="開始時間"
                              variant="outlined"
                              density="comfortable"
                            ></v-text-field>
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-text-field
                              v-model="randomConfig.endTime"
                              type="time"
                              label="終了時間"
                              variant="outlined"
                              density="comfortable"
                            ></v-text-field>
                          </v-col>
                        </v-row>

                        <div class="day-restrictions">
                          <h5>投稿曜日</h5>
                          <div class="day-chips">
                            <v-chip
                              v-for="day in weekDays"
                              :key="day.id"
                              :variant="
                                randomConfig.allowedDays.includes(day.id)
                                  ? 'flat'
                                  : 'outlined'
                              "
                              :color="
                                randomConfig.allowedDays.includes(day.id)
                                  ? 'primary'
                                  : ''
                              "
                              @click="toggleRandomDay(day.id)"
                              class="mr-2 mb-2"
                            >
                              {{ day.shortName }}
                            </v-chip>
                          </div>
                        </div>
                      </div>
                    </div>

                    <v-divider class="my-6"></v-divider>

                    <div class="setting-group">
                      <h4 class="group-title">
                        <v-icon icon="mdi-chart-line" class="mr-2"></v-icon>
                        ランダム分布
                      </h4>

                      <v-select
                        v-model="randomConfig.distribution"
                        :items="distributionOptions"
                        label="分布タイプ"
                        variant="outlined"
                        density="comfortable"
                      ></v-select>

                      <div class="distribution-preview">
                        <canvas
                          ref="distributionChart"
                          width="400"
                          height="200"
                        ></canvas>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>

                <!-- Random Preview -->
                <div class="random-preview">
                  <h4 class="preview-title">
                    <v-icon icon="mdi-shuffle" class="mr-2"></v-icon>
                    ランダムスケジュール例
                  </h4>

                  <div class="random-timeline">
                    <div
                      v-for="post in randomPreview"
                      :key="post.id"
                      class="random-post"
                      :style="{ left: post.position + '%' }"
                    >
                      <div class="post-marker"></div>
                      <div class="post-info">
                        <span class="post-time">{{ post.time }}</span>
                        <span class="post-date">{{ post.date }}</span>
                      </div>
                    </div>
                  </div>

                  <v-btn
                    variant="outlined"
                    @click="generateRandomPreview"
                    class="mt-4"
                  >
                    <v-icon icon="mdi-refresh" class="mr-2"></v-icon>
                    新しいパターンを生成
                  </v-btn>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Action Bar -->
    <div class="action-bar">
      <div class="action-content">
        <div class="action-info">
          <span class="selected-type">{{ activeTypeData?.name }}を設定中</span>
          <span class="preview-count"
            >プレビュー: 次の7日間で約{{ estimatedPosts }}回投稿</span
          >
        </div>
        <div class="action-buttons">
          <v-btn variant="outlined" size="large"> プレビュー </v-btn>
          <v-btn color="primary" size="large"> 設定を保存 </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, reactive, nextTick } from 'vue';

  interface PostingType {
    id: string;
    name: string;
    description: string;
    icon: string;
    difficulty: string;
    difficultyLabel: string;
    features: string[];
    frequency: string;
    effectiveness: string;
  }

  interface TimeSlot {
    id: string;
    name: string;
    time: string;
    icon: string;
    effectiveness: number;
  }

  const activeType = ref('auto');

  const postingTypes: PostingType[] = [
    {
      id: 'auto',
      name: '自動投稿',
      description: 'AIが最適なタイミングで自動投稿',
      icon: 'mdi-brain',
      difficulty: 'easy',
      difficultyLabel: '簡単',
      features: ['AI自動最適化', 'エンゲージメント向上', '手間なし'],
      frequency: '1-3回/日',
      effectiveness: '高',
    },
    {
      id: 'infinite',
      name: '無限投稿',
      description: 'コンテンツを継続的に自動投稿',
      icon: 'mdi-infinity',
      difficulty: 'easy',
      difficultyLabel: '簡単',
      features: ['継続投稿', 'コンテンツ循環', 'フォロワー維持'],
      frequency: '設定可能',
      effectiveness: '中',
    },
    {
      id: 'weekly',
      name: '曜日投稿',
      description: '曜日ごとに決まった時間に投稿',
      icon: 'mdi-calendar-week',
      difficulty: 'medium',
      difficultyLabel: '普通',
      features: ['規則的投稿', 'ルーチン作成', 'フォロワー習慣化'],
      frequency: '週1-14回',
      effectiveness: '中',
    },
    {
      id: 'random',
      name: 'ランダム投稿',
      description: '指定範囲内でランダムに投稿',
      icon: 'mdi-dice-multiple',
      difficulty: 'advanced',
      difficultyLabel: '上級',
      features: ['自然な投稿', 'アルゴリズム対策', 'バラエティ豊富'],
      frequency: '不定期',
      effectiveness: '高',
    },
  ];

  // Auto configuration
  const autoConfig = reactive({
    optimization: 'engagement',
    frequency: 'medium',
    timeSlots: ['morning', 'afternoon'],
    weekendPosting: true,
    holidayPosting: false,
  });

  const optimizationOptions = [
    { title: 'エンゲージメント重視', value: 'engagement' },
    { title: 'リーチ重視', value: 'reach' },
    { title: 'フォロワー増加重視', value: 'followers' },
    { title: 'バランス型', value: 'balanced' },
  ];

  const frequencyOptions = [
    { title: '控えめ (1回/日)', value: 'low' },
    { title: '標準 (2-3回/日)', value: 'medium' },
    { title: '積極的 (4-5回/日)', value: 'high' },
  ];

  const timeSlots: TimeSlot[] = [
    {
      id: 'morning',
      name: '朝',
      time: '7:00-9:00',
      icon: 'mdi-weather-sunny',
      effectiveness: 85,
    },
    {
      id: 'afternoon',
      name: '昼',
      time: '12:00-14:00',
      icon: 'mdi-white-balance-sunny',
      effectiveness: 70,
    },
    {
      id: 'evening',
      name: '夕方',
      time: '17:00-19:00',
      icon: 'mdi-weather-sunset',
      effectiveness: 90,
    },
    {
      id: 'night',
      name: '夜',
      time: '21:00-23:00',
      icon: 'mdi-weather-night',
      effectiveness: 95,
    },
  ];

  // Infinite configuration
  const infiniteConfig = reactive({
    intervalHours: 8,
    contentSource: 'all',
    selectionMethod: 'random',
  });

  const intervalPresets = [
    { label: '3時間', value: 3 },
    { label: '6時間', value: 6 },
    { label: '12時間', value: 12 },
    { label: '1日', value: 24 },
    { label: '2日', value: 48 },
  ];

  const contentSources = [
    { title: '全てのコンテンツ', value: 'all' },
    { title: 'お気に入りのみ', value: 'favorites' },
    { title: '特定フォルダ', value: 'folder' },
    { title: '最新コンテンツ', value: 'recent' },
  ];

  const selectionMethods = [
    { title: 'ランダム', value: 'random' },
    { title: '順番', value: 'sequential' },
    { title: 'エンゲージメント順', value: 'engagement' },
    { title: '作成日順', value: 'date' },
  ];

  // Weekly configuration
  const weeklyConfig = reactive({
    activeDays: ['1', '3', '5'],
    dayTimes: {
      '0': ['09:00', '18:00'],
      '1': ['09:00', '12:00', '18:00'],
      '2': ['09:00', '18:00'],
      '3': ['09:00', '12:00', '18:00'],
      '4': ['09:00', '18:00'],
      '5': ['09:00', '12:00', '18:00'],
      '6': ['09:00', '18:00'],
    },
  });

  const weekDays = [
    { id: '0', name: '日曜日', nameEn: 'Sunday', shortName: '日' },
    { id: '1', name: '月曜日', nameEn: 'Monday', shortName: '月' },
    { id: '2', name: '火曜日', nameEn: 'Tuesday', shortName: '火' },
    { id: '3', name: '水曜日', nameEn: 'Wednesday', shortName: '水' },
    { id: '4', name: '木曜日', nameEn: 'Thursday', shortName: '木' },
    { id: '5', name: '金曜日', nameEn: 'Friday', shortName: '金' },
    { id: '6', name: '土曜日', nameEn: 'Saturday', shortName: '土' },
  ];

  // Random configuration
  const randomConfig = reactive({
    minInterval: 4,
    maxInterval: 12,
    startTime: '09:00',
    endTime: '21:00',
    allowedDays: ['1', '2', '3', '4', '5'],
    distribution: 'uniform',
  });

  const distributionOptions = [
    { title: '均等分布', value: 'uniform' },
    { title: '正規分布', value: 'normal' },
    { title: '指数分布', value: 'exponential' },
    { title: 'ポアソン分布', value: 'poisson' },
  ];

  // Computed properties
  const activeTypeData = computed(() => {
    return postingTypes.find(type => type.id === activeType.value);
  });

  const estimatedPosts = computed(() => {
    switch (activeType.value) {
      case 'auto':
        return autoConfig.frequency === 'high'
          ? '28-35'
          : autoConfig.frequency === 'medium'
            ? '14-21'
            : '7-10';
      case 'infinite':
        return Math.ceil(168 / infiniteConfig.intervalHours);
      case 'weekly':
        return weeklyConfig.activeDays.reduce((total, dayId) => {
          return total + (weeklyConfig.dayTimes[dayId]?.length || 0);
        }, 0);
      case 'random':
        const avgInterval =
          (randomConfig.minInterval + randomConfig.maxInterval) / 2;
        return Math.ceil(168 / avgInterval);
      default:
        return '0';
    }
  });

  // Sample data
  const previewDays = ref([
    {
      name: '月',
      date: '11/27',
      posts: [
        { time: '09:15', icon: 'mdi-image', type: 'high' },
        { time: '14:30', icon: 'mdi-video', type: 'medium' },
        { time: '19:45', icon: 'mdi-text', type: 'high' },
      ],
    },
    {
      name: '火',
      date: '11/28',
      posts: [
        { time: '08:20', icon: 'mdi-image', type: 'medium' },
        { time: '12:15', icon: 'mdi-video', type: 'low' },
      ],
    },
  ]);

  const contentQueue = ref([
    {
      thumbnail: 'https://picsum.photos/60/60?random=1',
      title: 'モーニングコーヒー',
      scheduledTime: '今日 14:30',
    },
    {
      thumbnail: 'https://picsum.photos/60/60?random=2',
      title: 'オフィスの風景',
      scheduledTime: '明日 09:15',
    },
    {
      thumbnail: 'https://picsum.photos/60/60?random=3',
      title: 'ランチタイム',
      scheduledTime: '明日 12:30',
    },
  ]);

  const randomPreview = ref([
    { id: 1, time: '09:23', date: '11/27', position: 15 },
    { id: 2, time: '14:15', date: '11/27', position: 35 },
    { id: 3, time: '19:42', date: '11/27', position: 58 },
    { id: 4, time: '11:08', date: '11/28', position: 78 },
  ]);

  // Methods
  const setActiveType = (typeId: string) => {
    activeType.value = typeId;
  };

  const toggleTimeSlot = (slotId: string) => {
    const index = autoConfig.timeSlots.indexOf(slotId);
    if (index > -1) {
      autoConfig.timeSlots.splice(index, 1);
    } else {
      autoConfig.timeSlots.push(slotId);
    }
  };

  const addTimeSlot = (dayId: string) => {
    if (!weeklyConfig.dayTimes[dayId]) {
      weeklyConfig.dayTimes[dayId] = [];
    }
    weeklyConfig.dayTimes[dayId].push('09:00');
  };

  const removeTimeSlot = (dayId: string, index: number) => {
    weeklyConfig.dayTimes[dayId].splice(index, 1);
  };

  const toggleRandomDay = (dayId: string) => {
    const index = randomConfig.allowedDays.indexOf(dayId);
    if (index > -1) {
      randomConfig.allowedDays.splice(index, 1);
    } else {
      randomConfig.allowedDays.push(dayId);
    }
  };

  const generateRandomPreview = () => {
    // Generate new random preview data
    const newPreview = [];
    for (let i = 0; i < 5; i++) {
      newPreview.push({
        id: i + 1,
        time:
          String(Math.floor(Math.random() * 12 + 9)).padStart(2, '0') +
          ':' +
          String(Math.floor(Math.random() * 60)).padStart(2, '0'),
        date: '11/' + String(Math.floor(Math.random() * 7 + 27)),
        position: Math.random() * 90 + 5,
      });
    }
    randomPreview.value = newPreview;
  };
</script>

<style scoped>
  .posting-types-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    position: relative;
  }

  .header-section {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    padding: 2rem 0;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
    text-align: center;
  }

  .main-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: white;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .subtitle {
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
  }

  .content-section {
    padding: 2rem 0;
    max-width: 1200px;
    margin: 0 auto;
  }

  .sticky-sidebar {
    position: sticky;
    top: 120px;
    height: fit-content;
  }

  .section-title {
    color: white;
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .type-cards {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .type-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .type-card:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  .type-card.active {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .icon-wrapper {
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .card-title h3 {
    color: white;
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 0.25rem 0;
  }

  .difficulty {
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-weight: 500;
  }

  .difficulty.easy {
    background: rgba(76, 175, 80, 0.3);
    color: #4caf50;
  }
  .difficulty.medium {
    background: rgba(255, 152, 0, 0.3);
    color: #ff9800;
  }
  .difficulty.advanced {
    background: rgba(244, 67, 54, 0.3);
    color: #f44336;
  }

  .card-description {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
    margin-bottom: 1rem;
    line-height: 1.5;
  }

  .card-features {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.85rem;
  }

  .card-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }

  .stat {
    text-align: center;
  }

  .stat-label {
    display: block;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.8rem;
    margin-bottom: 0.25rem;
  }

  .stat-value {
    display: block;
    color: white;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .config-panel {
    padding-left: 2rem;
  }

  .config-content {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  .config-header {
    margin-bottom: 2rem;
  }

  .config-header h2 {
    font-size: 2rem;
    font-weight: 700;
    color: #2d3748;
    margin-bottom: 0.5rem;
  }

  .config-header p {
    color: #718096;
    font-size: 1.1rem;
  }

  .config-card {
    margin-bottom: 2rem;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  .setting-group {
    margin-bottom: 2rem;
  }

  .group-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
  }

  .time-slots {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .time-slot {
    display: flex;
    align-items: center;
    padding: 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .time-slot:hover {
    border-color: #cbd5e0;
    background: #f7fafc;
  }

  .time-slot.active {
    border-color: #667eea;
    background: linear-gradient(
      135deg,
      rgba(102, 126, 234, 0.1) 0%,
      rgba(118, 75, 162, 0.1) 100%
    );
  }

  .slot-icon {
    width: 40px;
    height: 40px;
    background: #f7fafc;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 1rem;
    color: #667eea;
  }

  .time-slot.active .slot-icon {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .slot-info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .slot-name {
    font-weight: 600;
    color: #2d3748;
    font-size: 1rem;
  }

  .slot-time {
    color: #718096;
    font-size: 0.9rem;
  }

  .slot-effectiveness {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .effectiveness-bar {
    width: 80px;
    height: 8px;
    background: #e2e8f0;
    border-radius: 4px;
    overflow: hidden;
  }

  .effectiveness-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  .effectiveness-value {
    font-size: 0.8rem;
    font-weight: 600;
    color: #667eea;
  }

  .preview-section {
    margin-top: 2rem;
  }

  .preview-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
  }

  .schedule-preview {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid #e2e8f0;
  }

  .preview-calendar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .preview-day {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
  }

  .day-header {
    background: #f7fafc;
    padding: 0.75rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .day-name {
    font-weight: 600;
    color: #2d3748;
  }

  .day-date {
    color: #718096;
    margin-left: 0.5rem;
  }

  .day-posts {
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .preview-post {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 6px;
    font-size: 0.85rem;
  }

  .preview-post.high {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
  }
  .preview-post.medium {
    background: rgba(255, 152, 0, 0.1);
    color: #ff9800;
  }
  .preview-post.low {
    background: rgba(158, 158, 158, 0.1);
    color: #9e9e9e;
  }

  .interval-selector {
    margin-bottom: 1rem;
  }

  .interval-slider {
    margin-bottom: 1rem;
  }

  .interval-presets {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .content-preview {
    margin-top: 1.5rem;
  }

  .content-queue {
    background: #f7fafc;
    border-radius: 12px;
    padding: 1.5rem;
  }

  .queue-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 1rem;
  }

  .queue-items {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .queue-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
  }

  .item-image {
    width: 50px;
    height: 50px;
    border-radius: 6px;
    overflow: hidden;
  }

  .item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .item-info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .item-title {
    font-weight: 600;
    color: #2d3748;
    font-size: 0.9rem;
  }

  .item-time {
    color: #718096;
    font-size: 0.8rem;
  }

  .weekly-schedule {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .day-schedule {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1.5rem;
    transition: all 0.3s ease;
  }

  .day-schedule:hover {
    border-color: #cbd5e0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .day-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .day-info {
    display: flex;
    flex-direction: column;
  }

  .day-name {
    font-weight: 600;
    color: #2d3748;
    font-size: 1.1rem;
  }

  .day-name-en {
    color: #718096;
    font-size: 0.9rem;
  }

  .day-times {
    margin-left: 3rem;
  }

  .time-slots-container {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
  }

  .time-slot-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .add-time-btn {
    margin-top: 0.5rem;
  }

  .weekly-preview {
    margin-top: 2rem;
  }

  .weekly-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1rem;
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid #e2e8f0;
  }

  .weekly-day {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
    min-height: 120px;
  }

  .weekly-day.active {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.05);
  }

  .weekly-day-header {
    background: #f7fafc;
    padding: 0.5rem;
    text-align: center;
    border-bottom: 1px solid #e2e8f0;
  }

  .weekly-day.active .weekly-day-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .weekly-day-content {
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .weekly-time {
    background: #667eea;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    text-align: center;
  }

  .no-posts {
    color: #a0aec0;
    font-size: 0.8rem;
    text-align: center;
    font-style: italic;
  }

  .range-input {
    margin-bottom: 1rem;
  }

  .range-input label {
    display: block;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 0.5rem;
  }

  .time-restrictions {
    margin-bottom: 1.5rem;
  }

  .day-restrictions {
    margin-top: 1rem;
  }

  .day-restrictions h5 {
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 0.75rem;
  }

  .day-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .distribution-preview {
    margin-top: 1rem;
    text-align: center;
  }

  .random-preview {
    margin-top: 2rem;
  }

  .random-timeline {
    position: relative;
    height: 80px;
    background: linear-gradient(90deg, #e2e8f0 0%, #cbd5e0 50%, #e2e8f0 100%);
    border-radius: 8px;
    margin: 1rem 0;
  }

  .random-post {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }

  .post-marker {
    width: 12px;
    height: 12px;
    background: #667eea;
    border-radius: 50%;
    margin: 0 auto 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .post-info {
    background: white;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    font-size: 0.7rem;
    white-space: nowrap;
    text-align: center;
  }

  .post-time {
    display: block;
    font-weight: 600;
    color: #2d3748;
  }

  .post-date {
    display: block;
    color: #718096;
  }

  .action-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    padding: 1rem 0;
    z-index: 20;
  }

  .action-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .action-info {
    display: flex;
    flex-direction: column;
  }

  .selected-type {
    font-weight: 600;
    color: #2d3748;
    font-size: 1rem;
  }

  .preview-count {
    color: #718096;
    font-size: 0.9rem;
  }

  .action-buttons {
    display: flex;
    gap: 1rem;
  }

  @media (max-width: 1024px) {
    .config-panel {
      padding-left: 0;
      margin-top: 2rem;
    }

    .action-content {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }

    .action-buttons {
      width: 100%;
      justify-content: center;
    }
  }

  @media (max-width: 768px) {
    .main-title {
      font-size: 2rem;
    }

    .type-cards {
      grid-template-columns: 1fr;
    }

    .weekly-grid {
      grid-template-columns: repeat(3, 1fr);
    }

    .time-slots-container {
      flex-direction: column;
      align-items: stretch;
    }
  }
</style>
