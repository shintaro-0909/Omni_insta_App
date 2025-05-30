<template>
  <div class="posting-types-wizard">
    <!-- Progress Header -->
    <div class="wizard-header">
      <div class="container">
        <div class="progress-navigation">
          <div class="progress-steps">
            <div 
              v-for="(step, index) in wizardSteps" 
              :key="step.id"
              class="progress-step"
              :class="{ 
                active: currentStep === index, 
                completed: currentStep > index,
                disabled: currentStep < index
              }"
              @click="goToStep(index)"
            >
              <div class="step-circle">
                <v-icon v-if="currentStep > index" icon="mdi-check" size="16"></v-icon>
                <span v-else>{{ index + 1 }}</span>
              </div>
              <div class="step-info">
                <span class="step-title">{{ step.title }}</span>
                <span class="step-subtitle">{{ step.subtitle }}</span>
              </div>
            </div>
          </div>
          
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: ((currentStep + 1) / wizardSteps.length) * 100 + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="wizard-content">
      <div class="container">
        <!-- Step 1: Type Selection -->
        <div v-if="currentStep === 0" class="wizard-step" key="type-selection">
          <div class="step-header">
            <h1 class="step-title">投稿タイプを選択</h1>
            <p class="step-description">あなたのブランドに最適な投稿戦略を選んでください</p>
          </div>

          <div class="type-selection-grid">
            <div 
              v-for="type in postingTypes" 
              :key="type.id"
              class="type-option"
              :class="{ selected: selectedType === type.id }"
              @click="selectType(type.id)"
            >
              <div class="type-visual">
                <div class="type-icon">
                  <v-icon :icon="type.icon" size="32"></v-icon>
                </div>
                <div class="type-animation">
                  <div v-for="n in 3" :key="n" class="animation-dot" :style="{ animationDelay: n * 0.2 + 's' }"></div>
                </div>
              </div>
              
              <div class="type-content">
                <h3 class="type-name">{{ type.name }}</h3>
                <p class="type-description">{{ type.description }}</p>
                
                <div class="type-features">
                  <div v-for="feature in type.features" :key="feature" class="feature-tag">
                    {{ feature }}
                  </div>
                </div>
                
                <div class="type-stats">
                  <div class="stat-item">
                    <v-icon icon="mdi-target" size="16"></v-icon>
                    <span>効果: {{ type.effectiveness }}</span>
                  </div>
                  <div class="stat-item">
                    <v-icon icon="mdi-clock" size="16"></v-icon>
                    <span>頻度: {{ type.frequency }}</span>
                  </div>
                  <div class="stat-item">
                    <v-icon icon="mdi-account" size="16"></v-icon>
                    <span>対象: {{ type.target }}</span>
                  </div>
                </div>
              </div>
              
              <div class="selection-indicator">
                <v-icon icon="mdi-check-circle" size="24"></v-icon>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Configuration -->
        <div v-if="currentStep === 1" class="wizard-step" key="configuration">
          <div class="step-header">
            <h1 class="step-title">{{ selectedTypeData?.name }}の設定</h1>
            <p class="step-description">詳細な投稿設定をカスタマイズしましょう</p>
          </div>

          <!-- Auto Configuration -->
          <div v-if="selectedType === 'auto'" class="config-section">
            <div class="config-cards">
              <div class="config-card">
                <div class="card-header">
                  <v-icon icon="mdi-brain" size="24" color="primary"></v-icon>
                  <h3>AI最適化設定</h3>
                </div>
                <div class="card-content">
                  <div class="optimization-options">
                    <div 
                      v-for="option in optimizationModes" 
                      :key="option.value"
                      class="optimization-option"
                      :class="{ active: autoSettings.mode === option.value }"
                      @click="autoSettings.mode = option.value"
                    >
                      <div class="option-icon">
                        <v-icon :icon="option.icon" size="20"></v-icon>
                      </div>
                      <div class="option-content">
                        <span class="option-title">{{ option.title }}</span>
                        <span class="option-description">{{ option.description }}</span>
                      </div>
                      <div class="option-metrics">
                        <div class="metric">
                          <span class="metric-value">{{ option.engagement }}%</span>
                          <span class="metric-label">エンゲージメント</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="config-card">
                <div class="card-header">
                  <v-icon icon="mdi-chart-timeline-variant" size="24" color="secondary"></v-icon>
                  <h3>投稿頻度</h3>
                </div>
                <div class="card-content">
                  <div class="frequency-slider">
                    <v-slider
                      v-model="autoSettings.frequency"
                      :min="1"
                      :max="5"
                      :step="1"
                      :ticks="frequencyLabels"
                      show-ticks="always"
                      tick-size="4"
                      thumb-label
                      color="primary"
                    >
                      <template v-slot:thumb-label="{ modelValue }">
                        {{ frequencyLabels[modelValue] }}
                      </template>
                    </v-slider>
                    
                    <div class="frequency-preview">
                      <span class="preview-text">推定投稿数: </span>
                      <span class="preview-value">{{ getFrequencyEstimate(autoSettings.frequency) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="config-card">
                <div class="card-header">
                  <v-icon icon="mdi-clock-time-four" size="24" color="accent"></v-icon>
                  <h3>投稿時間帯</h3>
                </div>
                <div class="card-content">
                  <div class="time-grid">
                    <div 
                      v-for="slot in timeSlots" 
                      :key="slot.id"
                      class="time-card"
                      :class="{ active: autoSettings.timeSlots.includes(slot.id) }"
                      @click="toggleTimeSlot(slot.id)"
                    >
                      <div class="time-icon">
                        <v-icon :icon="slot.icon" size="20"></v-icon>
                      </div>
                      <div class="time-info">
                        <span class="time-name">{{ slot.name }}</span>
                        <span class="time-range">{{ slot.range }}</span>
                      </div>
                      <div class="time-effectiveness">
                        <div class="effectiveness-circle" :style="{ '--percentage': slot.effectiveness }">
                          <span>{{ slot.effectiveness }}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Infinite Configuration -->
          <div v-if="selectedType === 'infinite'" class="config-section">
            <div class="config-cards">
              <div class="config-card">
                <div class="card-header">
                  <v-icon icon="mdi-infinity" size="24" color="primary"></v-icon>
                  <h3>投稿間隔設定</h3>
                </div>
                <div class="card-content">
                  <div class="interval-configurator">
                    <div class="interval-visual">
                      <div class="interval-timeline">
                        <div 
                          v-for="n in 5" 
                          :key="n"
                          class="timeline-post"
                          :style="{ left: (n - 1) * (100 / 4) + '%' }"
                        >
                          <div class="post-dot"></div>
                          <span class="post-time">{{ getIntervalTime(n) }}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div class="interval-controls">
                      <div class="interval-presets">
                        <div 
                          v-for="preset in intervalPresets" 
                          :key="preset.value"
                          class="preset-chip"
                          :class="{ active: infiniteSettings.interval === preset.value }"
                          @click="infiniteSettings.interval = preset.value"
                        >
                          <span class="preset-value">{{ preset.value }}</span>
                          <span class="preset-unit">{{ preset.unit }}</span>
                        </div>
                      </div>
                      
                      <div class="custom-interval">
                        <v-text-field
                          v-model="infiniteSettings.interval"
                          type="number"
                          label="カスタム間隔（時間）"
                          variant="outlined"
                          density="comfortable"
                          :min="1"
                          :max="168"
                        ></v-text-field>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="config-card">
                <div class="card-header">
                  <v-icon icon="mdi-folder-multiple" size="24" color="secondary"></v-icon>
                  <h3>コンテンツ管理</h3>
                </div>
                <div class="card-content">
                  <div class="content-settings">
                    <div class="setting-row">
                      <div class="setting-label">コンテンツソース</div>
                      <v-select
                        v-model="infiniteSettings.source"
                        :items="contentSources"
                        variant="outlined"
                        density="comfortable"
                      ></v-select>
                    </div>
                    
                    <div class="setting-row">
                      <div class="setting-label">選択方法</div>
                      <v-select
                        v-model="infiniteSettings.method"
                        :items="selectionMethods"
                        variant="outlined"
                        density="comfortable"
                      ></v-select>
                    </div>
                    
                    <div class="setting-row">
                      <div class="setting-label">リピート設定</div>
                      <v-switch
                        v-model="infiniteSettings.repeat"
                        label="コンテンツを繰り返し使用"
                        color="primary"
                      ></v-switch>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Weekly Configuration -->
          <div v-if="selectedType === 'weekly'" class="config-section">
            <div class="weekly-configurator">
              <div class="weekly-calendar">
                <div class="calendar-header">
                  <h3>週間スケジュール</h3>
                  <p>曜日ごとに投稿時間を設定してください</p>
                </div>
                
                <div class="calendar-grid">
                  <div 
                    v-for="day in weekDays" 
                    :key="day.id"
                    class="calendar-day"
                    :class="{ active: weeklySettings.activeDays.includes(day.id) }"
                  >
                    <div class="day-header">
                      <v-checkbox
                        v-model="weeklySettings.activeDays"
                        :value="day.id"
                        hide-details
                        color="primary"
                      ></v-checkbox>
                      <div class="day-name">
                        <span class="day-full">{{ day.name }}</span>
                        <span class="day-short">{{ day.short }}</span>
                      </div>
                    </div>
                    
                    <div v-if="weeklySettings.activeDays.includes(day.id)" class="day-times">
                      <div 
                        v-for="(time, index) in weeklySettings.times[day.id] || []"
                        :key="index"
                        class="time-input"
                      >
                        <v-text-field
                          v-model="weeklySettings.times[day.id][index]"
                          type="time"
                          variant="outlined"
                          density="compact"
                          hide-details
                        ></v-text-field>
                        <v-btn
                          icon
                          size="small"
                          variant="text"
                          @click="removeTime(day.id, index)"
                        >
                          <v-icon icon="mdi-close" size="16"></v-icon>
                        </v-btn>
                      </div>
                      
                      <v-btn
                        variant="outlined"
                        size="small"
                        @click="addTime(day.id)"
                        class="add-time-btn"
                      >
                        <v-icon icon="mdi-plus" size="16"></v-icon>
                        時間追加
                      </v-btn>
                    </div>
                    
                    <div v-else class="day-inactive">
                      <v-icon icon="mdi-sleep" size="24" color="grey-lighten-1"></v-icon>
                      <span>投稿なし</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Random Configuration -->
          <div v-if="selectedType === 'random'" class="config-section">
            <div class="config-cards">
              <div class="config-card">
                <div class="card-header">
                  <v-icon icon="mdi-dice-multiple" size="24" color="primary"></v-icon>
                  <h3>ランダム設定</h3>
                </div>
                <div class="card-content">
                  <div class="random-controls">
                    <div class="range-sliders">
                      <div class="slider-group">
                        <label>最小間隔</label>
                        <v-slider
                          v-model="randomSettings.minInterval"
                          :min="1"
                          :max="72"
                          :step="1"
                          thumb-label="always"
                          color="primary"
                        >
                          <template v-slot:thumb-label="{ modelValue }">
                            {{ modelValue }}h
                          </template>
                        </v-slider>
                      </div>
                      
                      <div class="slider-group">
                        <label>最大間隔</label>
                        <v-slider
                          v-model="randomSettings.maxInterval"
                          :min="randomSettings.minInterval"
                          :max="168"
                          :step="1"
                          thumb-label="always"
                          color="secondary"
                        >
                          <template v-slot:thumb-label="{ modelValue }">
                            {{ modelValue }}h
                          </template>
                        </v-slider>
                      </div>
                    </div>
                    
                    <div class="random-preview">
                      <div class="preview-header">
                        <span>予想投稿パターン</span>
                        <v-btn icon size="small" @click="regeneratePreview">
                          <v-icon icon="mdi-refresh"></v-icon>
                        </v-btn>
                      </div>
                      <div class="random-timeline">
                        <div 
                          v-for="post in randomPreview" 
                          :key="post.id"
                          class="random-post"
                          :style="{ left: post.position + '%' }"
                        >
                          <div class="post-marker"></div>
                          <div class="post-tooltip">{{ post.time }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="config-card">
                <div class="card-header">
                  <v-icon icon="mdi-filter" size="24" color="accent"></v-icon>
                  <h3>制限設定</h3>
                </div>
                <div class="card-content">
                  <div class="restrictions">
                    <div class="time-restriction">
                      <label>投稿可能時間</label>
                      <div class="time-range">
                        <v-text-field
                          v-model="randomSettings.startTime"
                          type="time"
                          label="開始"
                          variant="outlined"
                          density="compact"
                        ></v-text-field>
                        <span class="time-separator">〜</span>
                        <v-text-field
                          v-model="randomSettings.endTime"
                          type="time"
                          label="終了"
                          variant="outlined"
                          density="compact"
                        ></v-text-field>
                      </div>
                    </div>
                    
                    <div class="day-restriction">
                      <label>投稿曜日</label>
                      <div class="day-toggles">
                        <div 
                          v-for="day in weekDays" 
                          :key="day.id"
                          class="day-toggle"
                          :class="{ active: randomSettings.allowedDays.includes(day.id) }"
                          @click="toggleRandomDay(day.id)"
                        >
                          {{ day.short }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Preview -->
        <div v-if="currentStep === 2" class="wizard-step" key="preview">
          <div class="step-header">
            <h1 class="step-title">設定プレビュー</h1>
            <p class="step-description">あなたの投稿スケジュールがどのように見えるかプレビューしましょう</p>
          </div>

          <div class="preview-section">
            <div class="preview-tabs">
              <v-tabs v-model="previewTab" bg-color="transparent" color="primary">
                <v-tab value="calendar">カレンダー表示</v-tab>
                <v-tab value="timeline">タイムライン表示</v-tab>
                <v-tab value="analytics">分析表示</v-tab>
              </v-tabs>
            </div>

            <v-window v-model="previewTab" class="preview-window">
              <!-- Calendar Preview -->
              <v-window-item value="calendar">
                <div class="calendar-preview">
                  <div class="calendar-month">
                    <div class="month-header">
                      <v-btn icon variant="text" @click="previousMonth">
                        <v-icon icon="mdi-chevron-left"></v-icon>
                      </v-btn>
                      <h3>{{ currentMonthName }} {{ currentYear }}</h3>
                      <v-btn icon variant="text" @click="nextMonth">
                        <v-icon icon="mdi-chevron-right"></v-icon>
                      </v-btn>
                    </div>
                    
                    <div class="calendar-grid">
                      <div v-for="day in calendarDays" :key="day.date" class="calendar-cell">
                        <div class="cell-header">
                          <span class="day-number">{{ day.day }}</span>
                          <span class="day-name">{{ day.dayName }}</span>
                        </div>
                        <div class="cell-posts">
                          <div 
                            v-for="post in day.posts" 
                            :key="post.time"
                            class="post-indicator"
                            :class="post.type"
                          >
                            <span class="post-time">{{ post.time }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </v-window-item>

              <!-- Timeline Preview -->
              <v-window-item value="timeline">
                <div class="timeline-preview">
                  <div class="timeline-controls">
                    <v-select
                      v-model="timelineRange"
                      :items="timelineRanges"
                      label="表示期間"
                      variant="outlined"
                      density="compact"
                    ></v-select>
                  </div>
                  
                  <div class="timeline-chart">
                    <div class="timeline-axis">
                      <div v-for="hour in 24" :key="hour" class="hour-mark">
                        {{ String(hour - 1).padStart(2, '0') }}:00
                      </div>
                    </div>
                    
                    <div class="timeline-content">
                      <div 
                        v-for="day in timelineDays" 
                        :key="day.date"
                        class="timeline-day"
                      >
                        <div class="day-label">{{ day.label }}</div>
                        <div class="day-timeline">
                          <div 
                            v-for="post in day.posts" 
                            :key="post.id"
                            class="timeline-post"
                            :style="{ left: getTimelinePosition(post.time) + '%' }"
                          >
                            <div class="post-bubble" :class="post.type"></div>
                            <div class="post-info">
                              <span class="post-time">{{ post.time }}</span>
                              <span class="post-content">{{ post.content }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </v-window-item>

              <!-- Analytics Preview -->
              <v-window-item value="analytics">
                <div class="analytics-preview">
                  <div class="analytics-cards">
                    <div class="analytics-card">
                      <div class="card-icon">
                        <v-icon icon="mdi-calendar-check" size="32" color="primary"></v-icon>
                      </div>
                      <div class="card-content">
                        <h3>{{ totalPosts }}</h3>
                        <p>月間投稿数</p>
                      </div>
                    </div>
                    
                    <div class="analytics-card">
                      <div class="card-icon">
                        <v-icon icon="mdi-clock-outline" size="32" color="secondary"></v-icon>
                      </div>
                      <div class="card-content">
                        <h3>{{ averageInterval }}</h3>
                        <p>平均投稿間隔</p>
                      </div>
                    </div>
                    
                    <div class="analytics-card">
                      <div class="card-icon">
                        <v-icon icon="mdi-chart-line" size="32" color="accent"></v-icon>
                      </div>
                      <div class="card-content">
                        <h3>{{ engagementScore }}%</h3>
                        <p>予想エンゲージメント</p>
                      </div>
                    </div>
                    
                    <div class="analytics-card">
                      <div class="card-icon">
                        <v-icon icon="mdi-target" size="32" color="success"></v-icon>
                      </div>
                      <div class="card-content">
                        <h3>{{ consistencyScore }}%</h3>
                        <p>一貫性スコア</p>
                      </div>
                    </div>
                  </div>
                  
                  <div class="chart-section">
                    <h4>投稿頻度分析</h4>
                    <div class="frequency-chart">
                      <canvas ref="frequencyChart" width="600" height="300"></canvas>
                    </div>
                  </div>
                </div>
              </v-window-item>
            </v-window>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <div class="wizard-navigation">
      <div class="container">
        <div class="nav-content">
          <v-btn
            v-if="currentStep > 0"
            variant="outlined"
            size="large"
            @click="previousStep"
          >
            <v-icon icon="mdi-chevron-left" class="mr-2"></v-icon>
            前に戻る
          </v-btn>
          
          <div class="nav-center">
            <span class="step-indicator">
              {{ currentStep + 1 }} / {{ wizardSteps.length }}
            </span>
          </div>
          
          <v-btn
            v-if="currentStep < wizardSteps.length - 1"
            color="primary"
            size="large"
            @click="nextStep"
            :disabled="!canProceed"
          >
            次へ進む
            <v-icon icon="mdi-chevron-right" class="ml-2"></v-icon>
          </v-btn>
          
          <v-btn
            v-else
            color="primary"
            size="large"
            @click="completeWizard"
          >
            設定を保存
            <v-icon icon="mdi-check" class="ml-2"></v-icon>
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, nextTick } from 'vue'

interface WizardStep {
  id: string
  title: string
  subtitle: string
}

interface PostingType {
  id: string
  name: string
  description: string
  icon: string
  features: string[]
  effectiveness: string
  frequency: string
  target: string
}

const currentStep = ref(0)
const selectedType = ref('')
const previewTab = ref('calendar')
const timelineRange = ref('7days')
const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())

const wizardSteps: WizardStep[] = [
  { id: 'type', title: 'タイプ選択', subtitle: '投稿戦略を選択' },
  { id: 'config', title: '詳細設定', subtitle: 'カスタマイズ' },
  { id: 'preview', title: 'プレビュー', subtitle: '確認・保存' }
]

const postingTypes: PostingType[] = [
  {
    id: 'auto',
    name: 'AI自動投稿',
    description: 'AIがエンゲージメントを最大化する最適なタイミングで自動投稿',
    icon: 'mdi-brain',
    features: ['AI最適化', 'エンゲージメント向上', '完全自動'],
    effectiveness: '最高',
    frequency: '1-3回/日',
    target: '全てのユーザー'
  },
  {
    id: 'infinite',
    name: '無限投稿',
    description: 'コンテンツライブラリから継続的に自動投稿してフォロワーを維持',
    icon: 'mdi-infinity',
    features: ['継続投稿', 'コンテンツ循環', 'フォロワー維持'],
    effectiveness: '高',
    frequency: 'カスタム',
    target: 'コンテンツ豊富'
  },
  {
    id: 'weekly',
    name: '曜日投稿',
    description: '曜日ごとに決まった時間に投稿してフォロワーの習慣を作る',
    icon: 'mdi-calendar-week',
    features: ['規則的投稿', 'ルーチン作成', 'フォロワー習慣化'],
    effectiveness: '中',
    frequency: '週1-14回',
    target: '規則性重視'
  },
  {
    id: 'random',
    name: 'ランダム投稿',
    description: '指定範囲内でランダムに投稿してアルゴリズムを最適化',
    icon: 'mdi-dice-multiple',
    features: ['自然な投稿', 'アルゴリズム対策', 'バラエティ豊富'],
    effectiveness: '高',
    frequency: '不定期',
    target: '上級ユーザー'
  }
]

// Settings
const autoSettings = reactive({
  mode: 'engagement',
  frequency: 3,
  timeSlots: ['morning', 'evening']
})

const infiniteSettings = reactive({
  interval: 8,
  source: 'all',
  method: 'random',
  repeat: true
})

const weeklySettings = reactive({
  activeDays: ['1', '3', '5'],
  times: {
    '0': ['09:00', '18:00'],
    '1': ['09:00', '12:00', '18:00'],
    '2': ['09:00', '18:00'],
    '3': ['09:00', '12:00', '18:00'],
    '4': ['09:00', '18:00'],
    '5': ['09:00', '12:00', '18:00'],
    '6': ['09:00', '18:00']
  }
})

const randomSettings = reactive({
  minInterval: 4,
  maxInterval: 12,
  startTime: '09:00',
  endTime: '21:00',
  allowedDays: ['1', '2', '3', '4', '5']
})

// Options
const optimizationModes = [
  {
    value: 'engagement',
    title: 'エンゲージメント重視',
    description: 'いいねやコメントを最大化',
    icon: 'mdi-heart',
    engagement: 95
  },
  {
    value: 'reach',
    title: 'リーチ重視',
    description: 'より多くの人に表示',
    icon: 'mdi-account-group',
    engagement: 80
  },
  {
    value: 'followers',
    title: 'フォロワー増加',
    description: '新規フォロワーを獲得',
    icon: 'mdi-account-plus',
    engagement: 85
  },
  {
    value: 'balanced',
    title: 'バランス型',
    description: '全体的にバランス良く',
    icon: 'mdi-scale-balance',
    engagement: 90
  }
]

const frequencyLabels = {
  1: '控えめ',
  2: 'やや控えめ',
  3: '標準',
  4: '積極的',
  5: '最大'
}

const timeSlots = [
  { id: 'morning', name: '朝', range: '7:00-9:00', icon: 'mdi-weather-sunny', effectiveness: 85 },
  { id: 'afternoon', name: '昼', range: '12:00-14:00', icon: 'mdi-white-balance-sunny', effectiveness: 70 },
  { id: 'evening', name: '夕方', range: '17:00-19:00', icon: 'mdi-weather-sunset', effectiveness: 90 },
  { id: 'night', name: '夜', range: '21:00-23:00', icon: 'mdi-weather-night', effectiveness: 95 }
]

const intervalPresets = [
  { value: 3, unit: '時間' },
  { value: 6, unit: '時間' },
  { value: 12, unit: '時間' },
  { value: 24, unit: '時間' },
  { value: 48, unit: '時間' }
]

const contentSources = [
  { title: '全てのコンテンツ', value: 'all' },
  { title: 'お気に入りのみ', value: 'favorites' },
  { title: '特定フォルダ', value: 'folder' },
  { title: '最新コンテンツ', value: 'recent' }
]

const selectionMethods = [
  { title: 'ランダム', value: 'random' },
  { title: '順番', value: 'sequential' },
  { title: 'エンゲージメント順', value: 'engagement' },
  { title: '作成日順', value: 'date' }
]

const weekDays = [
  { id: '0', name: '日曜日', short: '日' },
  { id: '1', name: '月曜日', short: '月' },
  { id: '2', name: '火曜日', short: '火' },
  { id: '3', name: '水曜日', short: '水' },
  { id: '4', name: '木曜日', short: '木' },
  { id: '5', name: '金曜日', short: '金' },
  { id: '6', name: '土曜日', short: '土' }
]

const timelineRanges = [
  { title: '1週間', value: '7days' },
  { title: '2週間', value: '14days' },
  { title: '1ヶ月', value: '30days' }
]

// Sample data
const randomPreview = ref([
  { id: 1, position: 15 },
  { id: 2, position: 35 },
  { id: 3, position: 58 },
  { id: 4, position: 78 }
])

const calendarDays = ref([
  {
    date: '2023-11-27',
    day: 27,
    dayName: '月',
    posts: [
      { time: '09:15', type: 'high' },
      { time: '14:30', type: 'medium' },
      { time: '19:45', type: 'high' }
    ]
  }
])

const timelineDays = ref([
  {
    date: '2023-11-27',
    label: '11/27 (月)',
    posts: [
      { id: 1, time: '09:15', content: 'モーニング投稿', type: 'auto' },
      { id: 2, time: '14:30', content: 'ランチ投稿', type: 'scheduled' }
    ]
  }
])

// Computed
const selectedTypeData = computed(() => {
  return postingTypes.find(type => type.id === selectedType.value)
})

const canProceed = computed(() => {
  if (currentStep.value === 0) {
    return selectedType.value !== ''
  }
  return true
})

const currentMonthName = computed(() => {
  const months = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ]
  return months[currentMonth.value]
})

const totalPosts = computed(() => '42')
const averageInterval = computed(() => '8.5時間')
const engagementScore = computed(() => '92')
const consistencyScore = computed(() => '87')

// Methods
const selectType = (typeId: string) => {
  selectedType.value = typeId
}

const goToStep = (step: number) => {
  if (step <= currentStep.value || canProceed.value) {
    currentStep.value = step
  }
}

const nextStep = () => {
  if (currentStep.value < wizardSteps.length - 1 && canProceed.value) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const completeWizard = () => {
  console.log('Wizard completed!')
}

const toggleTimeSlot = (slotId: string) => {
  const index = autoSettings.timeSlots.indexOf(slotId)
  if (index > -1) {
    autoSettings.timeSlots.splice(index, 1)
  } else {
    autoSettings.timeSlots.push(slotId)
  }
}

const getFrequencyEstimate = (frequency: number) => {
  const estimates = ['週1-3回', '週3-5回', '週5-7回', '週7-10回', '週10回以上']
  return estimates[frequency - 1] || '設定なし'
}

const getIntervalTime = (index: number) => {
  const baseTime = new Date()
  baseTime.setHours(9, 0, 0, 0)
  baseTime.setTime(baseTime.getTime() + (index - 1) * infiniteSettings.interval * 60 * 60 * 1000)
  return baseTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
}

const addTime = (dayId: string) => {
  if (!weeklySettings.times[dayId]) {
    weeklySettings.times[dayId] = []
  }
  weeklySettings.times[dayId].push('09:00')
}

const removeTime = (dayId: string, index: number) => {
  weeklySettings.times[dayId].splice(index, 1)
}

const toggleRandomDay = (dayId: string) => {
  const index = randomSettings.allowedDays.indexOf(dayId)
  if (index > -1) {
    randomSettings.allowedDays.splice(index, 1)
  } else {
    randomSettings.allowedDays.push(dayId)
  }
}

const regeneratePreview = () => {
  randomPreview.value = Array.from({ length: 4 }, (_, i) => ({
    id: i + 1,
    position: Math.random() * 90 + 5
  }))
}

const previousMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const getTimelinePosition = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number)
  return ((hours + minutes / 60) / 24) * 100
}
</script>

<style scoped>
.posting-types-wizard {
  min-height: 100vh;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%);
  position: relative;
}

.wizard-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.progress-navigation {
  position: relative;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.progress-step {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0.5rem;
  border-radius: 8px;
}

.progress-step:hover:not(.disabled) {
  background: rgba(0, 0, 0, 0.05);
}

.progress-step.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.step-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 0.3s ease;
}

.progress-step.active .step-circle {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.progress-step.completed .step-circle {
  background: #10B981;
  color: white;
}

.step-info {
  display: flex;
  flex-direction: column;
}

.step-title {
  font-weight: 600;
  color: #2D3748;
  font-size: 1rem;
}

.step-subtitle {
  color: #718096;
  font-size: 0.85rem;
}

.progress-bar {
  position: relative;
  height: 4px;
  background: #E2E8F0;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f093fb 0%, #f5576c 50%, #4facfe 100%);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.wizard-content {
  padding: 3rem 0;
  min-height: calc(100vh - 200px);
}

.wizard-step {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.step-header {
  text-align: center;
  margin-bottom: 3rem;
}

.step-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.step-description {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.type-selection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.type-option {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 2px solid transparent;
  border-radius: 20px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.type-option:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.type-option.selected {
  border-color: #f093fb;
  background: rgba(240, 147, 251, 0.1);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(240, 147, 251, 0.3);
}

.type-visual {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  position: relative;
  height: 80px;
}

.type-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 2;
}

.type-animation {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.animation-dot {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #f093fb;
  border-radius: 50%;
  animation: float 2s ease-in-out infinite;
}

.animation-dot:nth-child(1) { top: -40px; left: 0; }
.animation-dot:nth-child(2) { top: -30px; right: -30px; }
.animation-dot:nth-child(3) { bottom: -30px; left: -20px; }

@keyframes float {
  0%, 100% { transform: translateY(0); opacity: 0.7; }
  50% { transform: translateY(-10px); opacity: 1; }
}

.type-content {
  text-align: center;
}

.type-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2D3748;
  margin-bottom: 0.5rem;
}

.type-description {
  color: #718096;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.type-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.feature-tag {
  background: rgba(240, 147, 251, 0.1);
  color: #f093fb;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.type-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #E2E8F0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: #718096;
}

.selection-indicator {
  position: absolute;
  top: 1rem;
  right: 1rem;
  color: #f093fb;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.type-option.selected .selection-indicator {
  opacity: 1;
}

.config-section {
  max-width: 900px;
  margin: 0 auto;
}

.config-cards {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.config-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.card-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2D3748;
  margin: 0;
}

.optimization-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.optimization-option {
  border: 2px solid #E2E8F0;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.optimization-option:hover {
  border-color: #CBD5E0;
  background: #F7FAFC;
}

.optimization-option.active {
  border-color: #f093fb;
  background: rgba(240, 147, 251, 0.1);
}

.option-icon {
  width: 40px;
  height: 40px;
  background: #F7FAFC;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: #f093fb;
}

.optimization-option.active .option-icon {
  background: #f093fb;
  color: white;
}

.option-content {
  margin-bottom: 1rem;
}

.option-title {
  display: block;
  font-weight: 600;
  color: #2D3748;
  margin-bottom: 0.25rem;
}

.option-description {
  display: block;
  color: #718096;
  font-size: 0.85rem;
}

.option-metrics {
  text-align: center;
}

.metric-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #f093fb;
}

.metric-label {
  display: block;
  font-size: 0.75rem;
  color: #718096;
}

.frequency-slider {
  padding: 1rem 0;
}

.frequency-preview {
  text-align: center;
  margin-top: 1rem;
  padding: 1rem;
  background: #F7FAFC;
  border-radius: 8px;
}

.preview-text {
  color: #718096;
}

.preview-value {
  font-weight: 600;
  color: #2D3748;
}

.time-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.time-card {
  border: 2px solid #E2E8F0;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.time-card:hover {
  border-color: #CBD5E0;
  background: #F7FAFC;
}

.time-card.active {
  border-color: #f093fb;
  background: rgba(240, 147, 251, 0.1);
}

.time-icon {
  width: 40px;
  height: 40px;
  background: #F7FAFC;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: #f093fb;
}

.time-card.active .time-icon {
  background: #f093fb;
  color: white;
}

.time-info {
  margin-bottom: 1rem;
}

.time-name {
  display: block;
  font-weight: 600;
  color: #2D3748;
  margin-bottom: 0.25rem;
}

.time-range {
  display: block;
  color: #718096;
  font-size: 0.85rem;
}

.time-effectiveness {
  display: flex;
  align-items: center;
  justify-content: center;
}

.effectiveness-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: conic-gradient(#f093fb 0% calc(var(--percentage) * 1%), #E2E8F0 calc(var(--percentage) * 1%) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: #2D3748;
  position: relative;
}

.effectiveness-circle::before {
  content: '';
  position: absolute;
  width: 70%;
  height: 70%;
  background: white;
  border-radius: 50%;
  z-index: 1;
}

.effectiveness-circle span {
  position: relative;
  z-index: 2;
}

.interval-configurator {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.interval-visual {
  background: #F7FAFC;
  border-radius: 12px;
  padding: 2rem;
}

.interval-timeline {
  position: relative;
  height: 60px;
  background: linear-gradient(90deg, #E2E8F0 0%, #CBD5E0 50%, #E2E8F0 100%);
  border-radius: 8px;
}

.timeline-post {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.post-dot {
  width: 12px;
  height: 12px;
  background: #f093fb;
  border-radius: 50%;
  margin: 0 auto 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.post-time {
  font-size: 0.7rem;
  color: #2D3748;
  white-space: nowrap;
}

.interval-controls {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.interval-presets {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.preset-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border: 2px solid #E2E8F0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 80px;
}

.preset-chip:hover {
  border-color: #CBD5E0;
  background: #F7FAFC;
}

.preset-chip.active {
  border-color: #f093fb;
  background: rgba(240, 147, 251, 0.1);
}

.preset-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2D3748;
}

.preset-unit {
  font-size: 0.8rem;
  color: #718096;
}

.content-settings {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.setting-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.setting-label {
  font-weight: 600;
  color: #2D3748;
}

.weekly-configurator {
  max-width: 1000px;
  margin: 0 auto;
}

.weekly-calendar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.calendar-header {
  text-align: center;
  margin-bottom: 2rem;
}

.calendar-header h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2D3748;
  margin-bottom: 0.5rem;
}

.calendar-header p {
  color: #718096;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1rem;
}

.calendar-day {
  border: 2px solid #E2E8F0;
  border-radius: 12px;
  padding: 1rem;
  min-height: 200px;
  transition: all 0.3s ease;
}

.calendar-day.active {
  border-color: #f093fb;
  background: rgba(240, 147, 251, 0.05);
}

.day-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.day-name {
  display: flex;
  flex-direction: column;
}

.day-full {
  font-weight: 600;
  color: #2D3748;
  font-size: 0.9rem;
}

.day-short {
  color: #718096;
  font-size: 0.8rem;
}

.day-times {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.time-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.add-time-btn {
  margin-top: 0.5rem;
}

.day-inactive {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: #A0AEC0;
  font-style: italic;
}

.random-controls {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.range-sliders {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.slider-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.slider-group label {
  font-weight: 600;
  color: #2D3748;
}

.random-preview {
  background: #F7FAFC;
  border-radius: 12px;
  padding: 1.5rem;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-weight: 600;
  color: #2D3748;
}

.random-timeline {
  position: relative;
  height: 40px;
  background: linear-gradient(90deg, #E2E8F0 0%, #CBD5E0 50%, #E2E8F0 100%);
  border-radius: 8px;
}

.random-post {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.post-marker {
  width: 8px;
  height: 8px;
  background: #f093fb;
  border-radius: 50%;
}

.restrictions {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.time-restriction label,
.day-restriction label {
  display: block;
  font-weight: 600;
  color: #2D3748;
  margin-bottom: 1rem;
}

.time-range {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.time-separator {
  font-size: 1.2rem;
  color: #718096;
}

.day-toggles {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.day-toggle {
  padding: 0.5rem 1rem;
  border: 2px solid #E2E8F0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  color: #718096;
}

.day-toggle:hover {
  border-color: #CBD5E0;
  background: #F7FAFC;
}

.day-toggle.active {
  border-color: #f093fb;
  background: #f093fb;
  color: white;
}

.preview-section {
  max-width: 1000px;
  margin: 0 auto;
}

.preview-tabs {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px 16px 0 0;
  padding: 1rem 2rem 0;
}

.preview-window {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 0 0 16px 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  min-height: 500px;
}

.calendar-preview {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.month-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.month-header h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2D3748;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1rem;
}

.calendar-cell {
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 1rem;
  min-height: 120px;
}

.cell-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.day-number {
  font-weight: 600;
  color: #2D3748;
}

.day-name {
  color: #718096;
  font-size: 0.8rem;
}

.cell-posts {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.post-indicator {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  text-align: center;
}

.post-indicator.high { background: rgba(240, 147, 251, 0.2); color: #f093fb; }
.post-indicator.medium { background: rgba(245, 87, 108, 0.2); color: #f5576c; }
.post-indicator.low { background: rgba(79, 172, 254, 0.2); color: #4facfe; }

.timeline-preview {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.timeline-controls {
  display: flex;
  justify-content: flex-end;
}

.timeline-chart {
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  overflow: hidden;
}

.timeline-axis {
  display: grid;
  grid-template-columns: repeat(24, 1fr);
  background: #F7FAFC;
  border-bottom: 1px solid #E2E8F0;
  font-size: 0.7rem;
  color: #718096;
}

.hour-mark {
  padding: 0.5rem 0.25rem;
  text-align: center;
  border-right: 1px solid #E2E8F0;
}

.timeline-content {
  max-height: 400px;
  overflow-y: auto;
}

.timeline-day {
  display: grid;
  grid-template-columns: 100px 1fr;
  border-bottom: 1px solid #E2E8F0;
  min-height: 60px;
}

.day-label {
  background: #F7FAFC;
  padding: 1rem;
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #2D3748;
  border-right: 1px solid #E2E8F0;
}

.day-timeline {
  position: relative;
  padding: 1rem 0;
}

.timeline-post {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.post-bubble {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-bottom: 0.25rem;
}

.post-bubble.auto { background: #f093fb; }
.post-bubble.scheduled { background: #f5576c; }
.post-bubble.random { background: #4facfe; }

.post-info {
  background: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: 0.7rem;
  white-space: nowrap;
}

.post-time {
  display: block;
  font-weight: 600;
  color: #2D3748;
}

.post-content {
  display: block;
  color: #718096;
}

.analytics-preview {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.analytics-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.analytics-card {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 16px;
  padding: 2rem;
  color: white;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.card-icon {
  opacity: 0.8;
}

.card-content h3 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
}

.card-content p {
  margin: 0;
  opacity: 0.9;
}

.chart-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid #E2E8F0;
}

.chart-section h4 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2D3748;
  margin: 0 0 1rem 0;
}

.frequency-chart {
  display: flex;
  justify-content: center;
}

.wizard-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding: 1.5rem 0;
  z-index: 20;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-center {
  display: flex;
  align-items: center;
}

.step-indicator {
  font-weight: 600;
  color: #718096;
  font-size: 1rem;
}

@media (max-width: 1024px) {
  .type-selection-grid {
    grid-template-columns: 1fr;
    max-width: 500px;
    margin: 0 auto;
  }
  
  .progress-steps {
    flex-direction: column;
    gap: 1rem;
  }
  
  .progress-step {
    width: 100%;
    justify-content: center;
  }
  
  .calendar-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .config-cards {
    max-width: 600px;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .step-title {
    font-size: 2rem;
  }
  
  .nav-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .optimization-options {
    grid-template-columns: 1fr;
  }
  
  .time-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .range-sliders {
    grid-template-columns: 1fr;
  }
}
</style>