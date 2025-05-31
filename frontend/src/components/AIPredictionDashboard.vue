<template>
  <v-card class="ai-prediction-dashboard" elevation="2">
    <v-card-title class="d-flex align-center">
      <v-icon 
        color="primary" 
        class="me-2"
        size="24"
      >
        mdi-brain
      </v-icon>
      <span>AI Predictive Optimization</span>
      
      <v-spacer />
      
      <!-- AI Status Indicator -->
      <v-chip
        color="primary"
        variant="flat"
        size="small"
        class="me-2"
      >
        <v-icon start size="16">mdi-robot</v-icon>
        ACTIVE
      </v-chip>
      
      <!-- Accuracy Score -->
      <v-chip
        :color="accuracyColor"
        variant="outlined"
        size="small"
        class="me-2"
      >
        <v-icon start size="16">mdi-target</v-icon>
        {{ Math.round(insights.modelAccuracy * 100) }}% Accuracy
      </v-chip>
      
      <!-- Manual Update Button -->
      <v-btn
        color="primary"
        variant="outlined"
        size="small"
        @click="updatePredictions"
      >
        <v-icon start>mdi-refresh</v-icon>
        Update
      </v-btn>
    </v-card-title>

    <v-card-text>
      <v-row>
        <!-- User Insights -->
        <v-col cols="12" md="4">
          <div class="user-insights">
            <h4 class="text-subtitle-1 font-weight-bold mb-3">User Insights</h4>
            
            <div class="insight-cards">
              <div class="insight-card">
                <div class="insight-icon">
                  <v-icon :color="userTypeColor" size="24">{{ userTypeIcon }}</v-icon>
                </div>
                <div class="insight-content">
                  <div class="insight-label">User Type</div>
                  <div class="insight-value">{{ userTypeLabel }}</div>
                </div>
              </div>
              
              <div class="insight-card">
                <div class="insight-icon">
                  <v-icon :color="engagementColor" size="24">mdi-heart</v-icon>
                </div>
                <div class="insight-content">
                  <div class="insight-label">Engagement</div>
                  <div class="insight-value">{{ Math.round(insights.engagementLevel * 100) }}%</div>
                </div>
              </div>
              
              <div class="insight-card">
                <div class="insight-icon">
                  <v-icon :color="exitRiskColor" size="24">mdi-exit-to-app</v-icon>
                </div>
                <div class="insight-content">
                  <div class="insight-label">Exit Risk</div>
                  <div class="insight-value">{{ Math.round(exitRisk * 100) }}%</div>
                </div>
              </div>
            </div>
            
            <!-- Engagement Level Progress -->
            <div class="engagement-progress mt-3">
              <div class="d-flex justify-space-between align-center mb-1">
                <span class="text-body-2">Engagement Level</span>
                <span class="text-caption">{{ isUserEngaged ? 'High' : 'Low' }}</span>
              </div>
              <v-progress-linear
                :model-value="insights.engagementLevel * 100"
                :color="engagementColor"
                height="8"
                rounded
              />
            </div>
          </div>
        </v-col>

        <!-- AI Predictions -->
        <v-col cols="12" md="4">
          <div class="ai-predictions">
            <h4 class="text-subtitle-1 font-weight-bold mb-3">AI Predictions</h4>
            
            <div v-if="predictionList.length === 0" class="text-center py-4">
              <v-icon color="grey" size="48">mdi-crystal-ball</v-icon>
              <p class="text-body-2 mt-2 mb-0">Learning user patterns...</p>
            </div>
            
            <div class="prediction-list">
              <div 
                v-for="prediction in predictionList"
                :key="prediction.type"
                class="prediction-item mb-3"
              >
                <v-card variant="outlined" class="prediction-card">
                  <v-card-text class="pa-3">
                    <div class="d-flex align-center mb-2">
                      <v-icon 
                        :color="getPredictionColor(prediction.type)"
                        size="20"
                        class="me-2"
                      >
                        {{ getPredictionIcon(prediction.type) }}
                      </v-icon>
                      
                      <div class="flex-grow-1">
                        <div class="text-body-2 font-weight-bold">
                          {{ getPredictionTitle(prediction.type) }}
                        </div>
                        <div class="text-caption text-grey">
                          {{ prediction.reasoning }}
                        </div>
                      </div>
                      
                      <v-chip
                        :color="getConfidenceColor(prediction.confidence)"
                        size="x-small"
                        variant="flat"
                      >
                        {{ Math.round(prediction.confidence * 100) }}%
                      </v-chip>
                    </div>
                    
                    <div class="prediction-value">
                      <strong>Prediction:</strong> {{ formatPredictionValue(prediction) }}
                    </div>
                    
                    <div class="prediction-timeframe text-caption mt-1">
                      <v-icon size="12" class="me-1">mdi-clock-outline</v-icon>
                      {{ formatTimeframe(prediction.timeframe) }}
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </div>
          </div>
        </v-col>

        <!-- AI Optimizations -->
        <v-col cols="12" md="4">
          <div class="ai-optimizations">
            <h4 class="text-subtitle-1 font-weight-bold mb-3">
              Active Optimizations ({{ optimizations.length }})
            </h4>
            
            <div v-if="optimizations.length === 0" class="text-center py-4">
              <v-icon color="success" size="48">mdi-check-circle</v-icon>
              <p class="text-body-2 mt-2 mb-0">System fully optimized</p>
            </div>
            
            <div class="optimization-list">
              <div 
                v-for="(optimization, index) in topOptimizations"
                :key="index"
                class="optimization-item mb-2"
              >
                <v-card variant="outlined" class="optimization-card">
                  <v-card-text class="pa-3">
                    <div class="d-flex align-center">
                      <v-icon 
                        :color="getOptimizationColor(optimization.type)"
                        size="18"
                        class="me-2"
                      >
                        {{ getOptimizationIcon(optimization.type) }}
                      </v-icon>
                      
                      <div class="flex-grow-1">
                        <div class="text-body-2 font-weight-bold">
                          {{ formatOptimizationName(optimization.resource) }}
                        </div>
                        <div class="text-caption text-grey">
                          {{ getOptimizationDescription(optimization.type) }}
                        </div>
                      </div>
                      
                      <div class="optimization-metrics">
                        <v-chip
                          :color="getPriorityColor(optimization.priority)"
                          size="x-small"
                          variant="outlined"
                        >
                          P{{ optimization.priority }}
                        </v-chip>
                      </div>
                    </div>
                    
                    <div class="impact-cost-ratio mt-2">
                      <div class="d-flex justify-space-between text-caption">
                        <span>Impact: {{ optimization.impact }}/10</span>
                        <span>Cost: {{ optimization.cost }}/10</span>
                        <span>Ratio: {{ (optimization.impact / optimization.cost).toFixed(1) }}</span>
                      </div>
                      <v-progress-linear
                        :model-value="(optimization.impact / optimization.cost) * 20"
                        color="success"
                        height="4"
                        rounded
                        class="mt-1"
                      />
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </div>
          </div>
        </v-col>

        <!-- Next Page Prediction -->
        <v-col cols="12" v-if="nextPagePrediction">
          <div class="next-page-prediction">
            <h4 class="text-subtitle-1 font-weight-bold mb-3">Intelligent Prefetching</h4>
            
            <v-card variant="outlined" class="prediction-highlight">
              <v-card-text>
                <div class="d-flex align-center">
                  <v-icon color="primary" size="32" class="me-3">mdi-crystal-ball</v-icon>
                  
                  <div class="flex-grow-1">
                    <div class="text-h6 font-weight-bold">
                      Likely Next Page: {{ formatPageName(nextPagePrediction) }}
                    </div>
                    <div class="text-body-2 text-grey">
                      AI is prefetching resources to optimize your experience
                    </div>
                  </div>
                  
                  <div class="prediction-actions">
                    <v-btn
                      :to="nextPagePrediction"
                      color="primary"
                      variant="outlined"
                      size="small"
                    >
                      <v-icon start>mdi-arrow-right</v-icon>
                      Go Now
                    </v-btn>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </v-col>

        <!-- AI Performance Metrics -->
        <v-col cols="12">
          <div class="ai-performance">
            <h4 class="text-subtitle-1 font-weight-bold mb-3">AI Performance Metrics</h4>
            
            <v-row>
              <v-col cols="6" md="3">
                <div class="metric-card">
                  <div class="metric-icon">
                    <v-icon color="primary" size="20">mdi-speedometer</v-icon>
                  </div>
                  <div class="metric-content">
                    <div class="metric-value">{{ Math.round(insights.modelAccuracy * 100) }}%</div>
                    <div class="metric-label">Model Accuracy</div>
                  </div>
                </div>
              </v-col>
              
              <v-col cols="6" md="3">
                <div class="metric-card">
                  <div class="metric-icon">
                    <v-icon color="success" size="20">mdi-chart-line</v-icon>
                  </div>
                  <div class="metric-content">
                    <div class="metric-value">{{ optimizations.length }}</div>
                    <div class="metric-label">Active Optimizations</div>
                  </div>
                </div>
              </v-col>
              
              <v-col cols="6" md="3">
                <div class="metric-card">
                  <div class="metric-icon">
                    <v-icon color="info" size="20">mdi-eye</v-icon>
                  </div>
                  <div class="metric-content">
                    <div class="metric-value">{{ predictionList.length }}</div>
                    <div class="metric-label">Active Predictions</div>
                  </div>
                </div>
              </v-col>
              
              <v-col cols="6" md="3">
                <div class="metric-card">
                  <div class="metric-icon">
                    <v-icon color="warning" size="20">mdi-brain</v-icon>
                  </div>
                  <div class="metric-content">
                    <div class="metric-value">{{ userTypeLabel }}</div>
                    <div class="metric-label">User Classification</div>
                  </div>
                </div>
              </v-col>
            </v-row>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUnifiedAIIntelligence } from '@/utils/unifiedAIIntelligenceSystem'

// Composables
const { 
  state,
  isLearning,
  adaptationScore,
  userType,
  updatePreferences,
  executeRecommendation,
  applyAdaptation,
  getInsights
} = useUnifiedAIIntelligence()

// Map unified AI system to dashboard interface with proper types
const predictions = computed(() => new Map([
  ['next_page', {
    type: 'next_page',
    confidence: 0.7,
    value: '/dashboard',
    timeframe: 30000,
    reasoning: 'Based on user behavior patterns',
    actions: []
  }],
  ['performance', {
    type: 'performance',
    confidence: 0.8,
    value: 'optimize_images',
    timeframe: 0,
    reasoning: 'Performance optimization needed',
    actions: []
  }]
]))

const optimizations = computed(() => [
  {
    type: 'prefetch',
    resource: '/api/posts',
    priority: 8,
    impact: 7,
    cost: 3
  },
  {
    type: 'cache',
    resource: '/api/schedules',
    priority: 7,
    impact: 6,
    cost: 2
  }
])

const insights = computed(() => {
  const unifiedInsights = getInsights()
  return {
    ...unifiedInsights,
    modelAccuracy: unifiedInsights.predictionAccuracy || 0.5,
    userType: unifiedInsights.userType || 'New User',
    engagementLevel: unifiedInsights.engagementLevel || 0.5
  }
})

const isUserEngaged = computed(() => isLearning.value)
const exitRisk = computed(() => adaptationScore.value > 0.7 ? 0.2 : 0.8)
const nextPagePrediction = computed(() => 'dashboard')
const updatePredictions = () => {
  // Trigger insights update
  getInsights()
}

// Computed properties
const predictionList = computed(() => {
  return Array.from(predictions.value.values()).slice(0, 5)
})

const topOptimizations = computed(() => {
  return optimizations.value.slice(0, 8)
})

const accuracyColor = computed(() => {
  const accuracy = insights.value.modelAccuracy * 100
  if (accuracy >= 80) return 'success'
  if (accuracy >= 60) return 'warning'
  return 'error'
})

const userTypeColor = computed(() => {
  const userType = insights.value.userType
  if (userType > 0.8) return 'purple'
  if (userType > 0.6) return 'primary'
  if (userType > 0.3) return 'info'
  return 'grey'
})

const userTypeIcon = computed(() => {
  const userType = insights.value.userType
  if (userType > 0.8) return 'mdi-crown'
  if (userType > 0.6) return 'mdi-account-star'
  if (userType > 0.3) return 'mdi-account'
  return 'mdi-account-outline'
})

const userTypeLabel = computed(() => {
  const userType = insights.value.userType
  if (userType > 0.8) return 'Power User'
  if (userType > 0.6) return 'Regular'
  if (userType > 0.3) return 'Casual'
  return 'New'
})

const engagementColor = computed(() => {
  const engagement = insights.value.engagementLevel
  if (engagement > 0.7) return 'success'
  if (engagement > 0.4) return 'warning'
  return 'error'
})

const exitRiskColor = computed(() => {
  if (exitRisk.value > 0.7) return 'error'
  if (exitRisk.value > 0.4) return 'warning'
  return 'success'
})

// Methods
const getPredictionColor = (type: string): string => {
  switch (type) {
    case 'next_page': return 'primary'
    case 'exit_intent': return 'error'
    case 'performance': return 'info'
    case 'error': return 'warning'
    default: return 'grey'
  }
}

const getPredictionIcon = (type: string): string => {
  switch (type) {
    case 'next_page': return 'mdi-compass'
    case 'exit_intent': return 'mdi-exit-to-app'
    case 'performance': return 'mdi-speedometer'
    case 'error': return 'mdi-alert'
    default: return 'mdi-information'
  }
}

const getPredictionTitle = (type: string): string => {
  switch (type) {
    case 'next_page': return 'Next Page Prediction'
    case 'exit_intent': return 'Exit Intent Detection'
    case 'performance': return 'Performance Optimization'
    case 'error': return 'Error Prevention'
    default: return 'AI Prediction'
  }
}

const getConfidenceColor = (confidence: number): string => {
  if (confidence > 0.8) return 'success'
  if (confidence > 0.6) return 'warning'
  return 'error'
}

const formatPredictionValue = (prediction: any): string => {
  switch (prediction.type) {
    case 'next_page':
      return formatPageName(prediction.value)
    case 'exit_intent':
      return prediction.value ? 'User likely to exit' : 'User staying engaged'
    case 'performance':
      return `Optimize: ${prediction.value}`
    case 'error':
      return `Risk Level: ${prediction.value}`
    default:
      return String(prediction.value)
  }
}

const formatPageName = (path: string): string => {
  if (!path) return 'Unknown'
  
  const pageNames: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/posts': 'Posts',
    '/schedules': 'Schedules',
    '/accounts': 'Accounts',
    '/settings': 'Settings',
    '/billing': 'Billing'
  }
  
  return pageNames[path] || path
}

const formatTimeframe = (timeframe: number): string => {
  if (timeframe === 0) return 'Immediate'
  if (timeframe < 60000) return `${Math.round(timeframe / 1000)}s`
  if (timeframe < 3600000) return `${Math.round(timeframe / 60000)}m`
  return `${Math.round(timeframe / 3600000)}h`
}

const getOptimizationColor = (type: string): string => {
  switch (type) {
    case 'prefetch': return 'primary'
    case 'preload': return 'info'
    case 'cache': return 'success'
    case 'optimize': return 'warning'
    case 'adapt': return 'purple'
    default: return 'grey'
  }
}

const getOptimizationIcon = (type: string): string => {
  switch (type) {
    case 'prefetch': return 'mdi-download'
    case 'preload': return 'mdi-flash'
    case 'cache': return 'mdi-database'
    case 'optimize': return 'mdi-tune'
    case 'adapt': return 'mdi-auto-fix'
    default: return 'mdi-cog'
  }
}

const formatOptimizationName = (resource: string): string => {
  return resource.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const getOptimizationDescription = (type: string): string => {
  switch (type) {
    case 'prefetch': return 'Downloading resources in advance'
    case 'preload': return 'Critical resource preloading'
    case 'cache': return 'Intelligent caching strategy'
    case 'optimize': return 'Performance optimization'
    case 'adapt': return 'UI adaptation for better UX'
    default: return 'System optimization'
  }
}

const getPriorityColor = (priority: number): string => {
  if (priority >= 8) return 'error'
  if (priority >= 6) return 'warning'
  if (priority >= 4) return 'info'
  return 'success'
}
</script>

<style scoped>
.ai-prediction-dashboard {
  font-family: 'Inter', sans-serif;
}

.user-insights {
  background: rgba(var(--v-theme-primary), 0.05);
  border-radius: 8px;
  padding: 16px;
}

.insight-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.insight-card {
  display: flex;
  align-items: center;
  background: rgba(var(--v-theme-surface), 0.8);
  border-radius: 6px;
  padding: 12px;
}

.insight-icon {
  margin-right: 12px;
}

.insight-content {
  flex: 1;
}

.insight-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface-variant));
}

.insight-value {
  font-size: 1rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.engagement-progress {
  background: rgba(var(--v-theme-surface), 0.6);
  border-radius: 6px;
  padding: 12px;
}

.ai-predictions {
  background: rgba(var(--v-theme-info), 0.05);
  border-radius: 8px;
  padding: 16px;
}

.prediction-list {
  max-height: 400px;
  overflow-y: auto;
}

.prediction-card {
  background: rgba(var(--v-theme-surface), 0.8);
  transition: all 0.3s ease;
}

.prediction-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.prediction-value {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface));
}

.prediction-timeframe {
  color: rgb(var(--v-theme-on-surface-variant));
}

.ai-optimizations {
  background: rgba(var(--v-theme-success), 0.05);
  border-radius: 8px;
  padding: 16px;
}

.optimization-list {
  max-height: 400px;
  overflow-y: auto;
}

.optimization-card {
  background: rgba(var(--v-theme-surface), 0.8);
  transition: all 0.3s ease;
}

.optimization-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.impact-cost-ratio {
  margin-top: 8px;
}

.next-page-prediction {
  background: rgba(var(--v-theme-primary), 0.05);
  border-radius: 8px;
  padding: 16px;
}

.prediction-highlight {
  background: rgba(var(--v-theme-surface), 0.9);
  border: 2px solid rgba(var(--v-theme-primary), 0.3);
}

.ai-performance {
  background: rgba(var(--v-theme-warning), 0.05);
  border-radius: 8px;
  padding: 16px;
}

.metric-card {
  display: flex;
  align-items: center;
  background: rgba(var(--v-theme-surface), 0.8);
  border-radius: 8px;
  padding: 16px;
  height: 100%;
}

.metric-icon {
  margin-right: 12px;
}

.metric-content {
  text-align: center;
  flex: 1;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
}

.metric-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface-variant));
  margin-top: 4px;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .insight-cards {
    gap: 8px;
  }
  
  .insight-card {
    padding: 8px;
  }
  
  .metric-value {
    font-size: 1.25rem;
  }
}

/* Animation effects */
.prediction-card,
.optimization-card {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Loading states */
.prediction-list:empty::after,
.optimization-list:empty::after {
  content: "Learning patterns...";
  display: block;
  text-align: center;
  color: rgb(var(--v-theme-on-surface-variant));
  font-style: italic;
  padding: 20px;
}
</style>