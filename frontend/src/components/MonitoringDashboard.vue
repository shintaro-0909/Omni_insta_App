<template>
  <v-card class="monitoring-dashboard" elevation="2">
    <v-card-title class="d-flex align-center">
      <v-icon 
        :color="systemHealthColor" 
        class="me-2"
        size="24"
      >
        mdi-monitor-dashboard
      </v-icon>
      <span>System Monitoring</span>
      
      <v-spacer />
      
      <!-- System Health Indicator -->
      <v-chip
        :color="systemHealthColor"
        :variant="isActive ? 'flat' : 'outlined'"
        size="small"
        class="me-2"
      >
        <v-icon start size="16">
          {{ systemHealthIcon }}
        </v-icon>
        {{ systemHealth.overall.toUpperCase() }}
      </v-chip>
      
      <!-- Toggle Monitoring -->
      <v-btn
        :color="isActive ? 'error' : 'success'"
        :variant="isActive ? 'outlined' : 'flat'"
        size="small"
        @click="toggleMonitoring"
      >
        <v-icon start>
          {{ isActive ? 'mdi-stop' : 'mdi-play' }}
        </v-icon>
        {{ isActive ? 'Stop' : 'Start' }}
      </v-btn>
    </v-card-title>

    <v-card-text v-if="isActive">
      <v-row>
        <!-- System Health Overview -->
        <v-col cols="12" md="6">
          <div class="health-overview">
            <h4 class="text-subtitle-1 font-weight-bold mb-3">System Health</h4>
            
            <div class="health-services">
              <div 
                v-for="(status, service) in systemHealth.services"
                :key="service"
                class="service-status mb-2"
              >
                <div class="d-flex align-center">
                  <v-icon 
                    :color="getServiceColor(status)"
                    size="16"
                    class="me-2"
                  >
                    {{ getServiceIcon(status) }}
                  </v-icon>
                  <span class="text-capitalize">{{ service }}</span>
                  <v-spacer />
                  <v-chip
                    :color="getServiceColor(status)"
                    size="x-small"
                    variant="outlined"
                  >
                    {{ status.toUpperCase() }}
                  </v-chip>
                </div>
              </div>
            </div>

            <!-- Performance Metrics -->
            <div class="performance-metrics mt-4">
              <h5 class="text-body-1 font-weight-bold mb-2">Performance</h5>
              
              <div class="metric-row">
                <span class="metric-label">Error Rate:</span>
                <v-progress-linear
                  :model-value="healthSummary.errorRate"
                  :color="healthSummary.errorRate > 5 ? 'error' : 'success'"
                  height="8"
                  rounded
                  class="flex-grow-1 mx-2"
                />
                <span class="metric-value">{{ healthSummary.errorRate.toFixed(1) }}%</span>
              </div>
              
              <div class="metric-row">
                <span class="metric-label">Performance:</span>
                <v-progress-linear
                  :model-value="healthSummary.performanceScore"
                  :color="healthSummary.performanceScore < 70 ? 'warning' : 'success'"
                  height="8"
                  rounded
                  class="flex-grow-1 mx-2"
                />
                <span class="metric-value">{{ healthSummary.performanceScore.toFixed(0) }}/100</span>
              </div>
            </div>
          </div>
        </v-col>

        <!-- Predictions & Alerts -->
        <v-col cols="12" md="6">
          <div class="predictions-section">
            <h4 class="text-subtitle-1 font-weight-bold mb-3">Predictions & Alerts</h4>
            
            <div v-if="predictions.length === 0" class="text-center py-4">
              <v-icon color="success" size="48">mdi-shield-check</v-icon>
              <p class="text-body-2 mt-2 mb-0">No issues predicted</p>
            </div>

            <div 
              v-for="prediction in predictions"
              :key="prediction.message"
              class="prediction-card mb-2"
            >
              <v-alert
                :color="getPredictionColor(prediction.severity)"
                variant="outlined"
                density="compact"
                border="start"
                class="mb-2"
              >
                <template #prepend>
                  <v-icon>{{ getPredictionIcon(prediction.type) }}</v-icon>
                </template>
                
                <div class="d-flex align-center">
                  <div class="flex-grow-1">
                    <div class="text-body-2 font-weight-bold">
                      {{ prediction.message }}
                    </div>
                    <div class="text-caption">
                      Probability: {{ (prediction.probability * 100).toFixed(0) }}% 
                      | Timeframe: {{ prediction.timeframe }}
                    </div>
                  </div>
                  
                  <v-chip
                    :color="getPredictionColor(prediction.severity)"
                    size="x-small"
                    variant="flat"
                    class="ml-2"
                  >
                    {{ prediction.severity.toUpperCase() }}
                  </v-chip>
                </div>
              </v-alert>
            </div>
          </div>
        </v-col>

        <!-- Recovery Actions -->
        <v-col cols="12" v-if="recoveryActions.length > 0">
          <div class="recovery-section">
            <h4 class="text-subtitle-1 font-weight-bold mb-3">Auto-Recovery Actions</h4>
            
            <v-data-table
              :headers="recoveryHeaders"
              :items="recoveryActions"
              density="compact"
              hide-default-footer
              class="recovery-table"
            >
              <template #item.type="{ item }">
                <v-chip
                  :color="getRecoveryTypeColor(item.type)"
                  size="small"
                  variant="outlined"
                >
                  {{ item.type.toUpperCase() }}
                </v-chip>
              </template>
              
              <template #item.successRate="{ item }">
                <div class="d-flex align-center">
                  <v-progress-linear
                    :model-value="item.successRate"
                    :color="item.successRate > 80 ? 'success' : item.successRate > 60 ? 'warning' : 'error'"
                    height="6"
                    rounded
                    class="flex-grow-1"
                  />
                  <span class="text-caption ml-2">{{ item.successRate.toFixed(0) }}%</span>
                </div>
              </template>
              
              <template #item.executed="{ item }">
                <v-chip size="x-small" variant="outlined">
                  {{ item.executed }}
                </v-chip>
              </template>
            </v-data-table>
          </div>
        </v-col>

        <!-- Error Patterns -->
        <v-col cols="12" v-if="errorCount > 0">
          <div class="errors-section">
            <h4 class="text-subtitle-1 font-weight-bold mb-3">
              Recent Error Patterns ({{ errorCount }})
            </h4>
            
            <v-expansion-panels variant="accordion" class="error-panels">
              <v-expansion-panel
                v-for="[key, pattern] in recentErrorPatterns"
                :key="key"
              >
                <v-expansion-panel-title>
                  <div class="d-flex align-center w-100">
                    <v-icon 
                      :color="getErrorSeverityColor(pattern.frequency)"
                      class="me-2"
                    >
                      {{ getErrorSeverityIcon(pattern.frequency) }}
                    </v-icon>
                    
                    <div class="flex-grow-1">
                      <div class="text-body-2 font-weight-bold">{{ pattern.type }}</div>
                      <div class="text-caption text-grey">{{ pattern.message }}</div>
                    </div>
                    
                    <div class="text-end">
                      <v-chip
                        :color="getErrorSeverityColor(pattern.frequency)"
                        size="x-small"
                        variant="outlined"
                      >
                        {{ pattern.frequency }}x
                      </v-chip>
                    </div>
                  </div>
                </v-expansion-panel-title>
                
                <v-expansion-panel-text>
                  <div class="error-details">
                    <div class="detail-row">
                      <strong>First Seen:</strong> {{ formatTime(pattern.firstSeen) }}
                    </div>
                    <div class="detail-row">
                      <strong>Last Seen:</strong> {{ formatTime(pattern.lastSeen) }}
                    </div>
                    <div class="detail-row" v-if="pattern.url">
                      <strong>URL:</strong> <code class="text-caption">{{ pattern.url }}</code>
                    </div>
                    <div class="detail-row" v-if="pattern.stack">
                      <strong>Stack Trace:</strong>
                      <pre class="stack-trace text-caption">{{ pattern.stack }}</pre>
                    </div>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
        </v-col>
      </v-row>
    </v-card-text>

    <v-card-text v-else class="text-center py-8">
      <v-icon size="64" color="grey-lighten-1">mdi-monitor-off</v-icon>
      <p class="text-h6 mt-2 mb-0">Monitoring Disabled</p>
      <p class="text-body-2 text-grey mb-4">Click Start to enable real-time monitoring</p>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRealTimeMonitoring } from '@/utils/realTimeMonitoring'

// Composable
const monitoring = useRealTimeMonitoring()

// Local state
const healthSummary = ref({
  errorRate: 0,
  performanceScore: 100,
  uptime: 0,
  lastCheck: Date.now(),
  activeRecoveryActions: 0
})

const recoveryActions = ref([])

// Computed properties
const { isActive, systemHealth, errorCount, predictions } = monitoring

const systemHealthColor = computed(() => {
  switch (systemHealth.value.overall) {
    case 'healthy': return 'success'
    case 'warning': return 'warning'
    case 'critical': return 'error'
    default: return 'grey'
  }
})

const systemHealthIcon = computed(() => {
  switch (systemHealth.value.overall) {
    case 'healthy': return 'mdi-check-circle'
    case 'warning': return 'mdi-alert'
    case 'critical': return 'mdi-alert-circle'
    default: return 'mdi-help-circle'
  }
})

const recentErrorPatterns = computed(() => {
  return Array.from(monitoring.getState().errorPatterns.entries())
    .sort(([, a], [, b]) => b.lastSeen - a.lastSeen)
    .slice(0, 10) // Show only recent 10 errors
})

// Recovery table headers
const recoveryHeaders = [
  { title: 'Action', key: 'description', sortable: false },
  { title: 'Type', key: 'type', sortable: false },
  { title: 'Success Rate', key: 'successRate', sortable: false },
  { title: 'Executed', key: 'executed', sortable: false }
]

// Methods
const toggleMonitoring = () => {
  if (isActive.value) {
    monitoring.stopMonitoring()
  } else {
    monitoring.startMonitoring()
  }
}

const getServiceColor = (status: string) => {
  switch (status) {
    case 'healthy': return 'success'
    case 'warning': return 'warning'
    case 'critical': return 'error'
    default: return 'grey'
  }
}

const getServiceIcon = (status: string) => {
  switch (status) {
    case 'healthy': return 'mdi-check-circle'
    case 'warning': return 'mdi-alert'
    case 'critical': return 'mdi-close-circle'
    default: return 'mdi-help-circle'
  }
}

const getPredictionColor = (severity: string) => {
  switch (severity) {
    case 'high': return 'error'
    case 'medium': return 'warning'
    case 'low': return 'info'
    default: return 'grey'
  }
}

const getPredictionIcon = (type: string) => {
  switch (type) {
    case 'error': return 'mdi-alert-circle-outline'
    case 'performance': return 'mdi-speedometer'
    default: return 'mdi-information-outline'
  }
}

const getRecoveryTypeColor = (type: string) => {
  switch (type) {
    case 'retry': return 'info'
    case 'fallback': return 'warning'
    case 'reload': return 'error'
    case 'clear-cache': return 'primary'
    default: return 'grey'
  }
}

const getErrorSeverityColor = (frequency: number) => {
  if (frequency >= 10) return 'error'
  if (frequency >= 5) return 'warning'
  return 'info'
}

const getErrorSeverityIcon = (frequency: number) => {
  if (frequency >= 10) return 'mdi-alert-circle'
  if (frequency >= 5) return 'mdi-alert'
  return 'mdi-information'
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString()
}

// Update health summary periodically
let healthInterval: NodeJS.Timeout | null = null

const updateHealthSummary = () => {
  if (isActive.value) {
    healthSummary.value = monitoring.getHealthSummary()
    recoveryActions.value = monitoring.getState().recoveryActions.filter(a => a.executed > 0)
  }
}

onMounted(() => {
  // Start monitoring by default in development
  if (import.meta.env.DEV) {
    monitoring.startMonitoring()
  }
  
  // Update health summary every 30 seconds
  healthInterval = setInterval(updateHealthSummary, 30000)
  updateHealthSummary() // Initial update
})

onUnmounted(() => {
  if (healthInterval) {
    clearInterval(healthInterval)
  }
})
</script>

<style scoped>
.monitoring-dashboard {
  font-family: 'Inter', sans-serif;
}

.health-overview {
  background: rgba(var(--v-theme-surface), 0.5);
  border-radius: 8px;
  padding: 16px;
}

.service-status {
  padding: 8px 0;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.1);
}

.service-status:last-child {
  border-bottom: none;
}

.performance-metrics {
  background: rgba(var(--v-theme-primary), 0.05);
  border-radius: 6px;
  padding: 12px;
}

.metric-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.metric-row:last-child {
  margin-bottom: 0;
}

.metric-label {
  min-width: 80px;
  font-size: 0.875rem;
  font-weight: 500;
}

.metric-value {
  min-width: 50px;
  text-align: right;
  font-size: 0.875rem;
  font-weight: 600;
}

.predictions-section {
  background: rgba(var(--v-theme-warning), 0.05);
  border-radius: 8px;
  padding: 16px;
}

.prediction-card {
  transition: all 0.3s ease;
}

.recovery-section {
  background: rgba(var(--v-theme-info), 0.05);
  border-radius: 8px;
  padding: 16px;
}

.recovery-table {
  background: transparent;
}

.errors-section {
  background: rgba(var(--v-theme-error), 0.05);
  border-radius: 8px;
  padding: 16px;
}

.error-panels {
  background: transparent;
}

.error-details {
  padding: 12px 0;
}

.detail-row {
  margin-bottom: 8px;
  font-size: 0.875rem;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.stack-trace {
  background: rgba(var(--v-theme-on-surface), 0.05);
  border-radius: 4px;
  padding: 8px;
  margin-top: 4px;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .metric-label {
    min-width: 70px;
    font-size: 0.8rem;
  }
  
  .metric-value {
    min-width: 45px;
    font-size: 0.8rem;
  }
}
</style>