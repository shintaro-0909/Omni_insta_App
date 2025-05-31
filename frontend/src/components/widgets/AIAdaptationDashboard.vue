<template>
  <v-card class="ai-adaptation-dashboard" elevation="8">
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2" color="primary">mdi-brain</v-icon>
      <span>AI Adaptation System</span>
      <v-spacer />
      <v-switch
        v-model="aiAdaptation.isEnabled"
        label="Enabled"
        color="primary"
        hide-details
        dense
      />
    </v-card-title>
    
    <v-card-text>
      <!-- Adaptation Mode Selector -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-chip-group
            v-model="selectedMode"
            mandatory
            active-class="primary"
          >
            <v-chip value="conservative" small>
              <v-icon left small>mdi-shield-check</v-icon>
              Conservative
            </v-chip>
            <v-chip value="balanced" small>
              <v-icon left small>mdi-scale-balance</v-icon>
              Balanced
            </v-chip>
            <v-chip value="aggressive" small>
              <v-icon left small>mdi-lightning-bolt</v-icon>
              Aggressive
            </v-chip>
          </v-chip-group>
        </v-col>
      </v-row>
      
      <!-- System Status -->
      <v-row class="mb-4">
        <v-col cols="12" md="6">
          <div class="status-item">
            <div class="status-label">Learning Status</div>
            <div class="status-value d-flex align-center">
              <v-icon
                :color="aiAdaptation.isLearning.value ? 'success' : 'grey'"
                class="mr-1"
                small
              >
                {{ aiAdaptation.isLearning.value ? 'mdi-brain' : 'mdi-brain-sleep' }}
              </v-icon>
              {{ aiAdaptation.isLearning.value ? 'Active' : 'Paused' }}
            </div>
          </div>
        </v-col>
        <v-col cols="12" md="6">
          <div class="status-item">
            <div class="status-label">Confidence Level</div>
            <div class="status-value">
              <v-progress-linear
                :value="aiAdaptation.adaptationConfidence.value * 100"
                color="primary"
                height="6"
                rounded
                class="mr-2"
                style="min-width: 80px"
              />
              {{ Math.round(aiAdaptation.adaptationConfidence.value * 100) }}%
            </div>
          </div>
        </v-col>
      </v-row>
      
      <!-- Current Adaptations -->
      <div class="mb-4">
        <h4 class="mb-2">Active Adaptations ({{ aiAdaptation.currentAdaptations.value.length }})</h4>
        <div v-if="aiAdaptation.currentAdaptations.value.length === 0" class="text-center py-4">
          <v-icon color="grey" size="48">mdi-robot-outline</v-icon>
          <p class="text-body-2 grey--text mt-2">No active adaptations</p>
        </div>
        <v-chip-group v-else column>
          <v-chip
            v-for="adaptation in aiAdaptation.currentAdaptations.value"
            :key="adaptation.target"
            :color="getAdaptationColor(adaptation.type)"
            small
            close
            @click:close="rollbackAdaptation(adaptation)"
          >
            <v-icon left small>{{ getAdaptationIcon(adaptation.type) }}</v-icon>
            {{ formatAdaptationLabel(adaptation) }}
            <v-tooltip activator="parent" location="top">
              <div>
                <strong>{{ adaptation.type.toUpperCase() }}</strong><br>
                Target: {{ adaptation.target }}<br>
                Confidence: {{ Math.round(adaptation.confidence * 100) }}%<br>
                Impact: {{ Math.round(adaptation.impact * 100) }}%
              </div>
            </v-tooltip>
          </v-chip>
        </v-chip-group>
      </div>
      
      <!-- Behavior Patterns -->
      <div class="mb-4">
        <h4 class="mb-2">Detected Patterns ({{ aiAdaptation.behaviorPatterns.value.length }})</h4>
        <div v-if="aiAdaptation.behaviorPatterns.value.length === 0" class="text-center py-4">
          <v-icon color="grey" size="48">mdi-chart-line</v-icon>
          <p class="text-body-2 grey--text mt-2">Learning your behavior...</p>
        </div>
        <v-expansion-panels v-else variant="accordion" class="pattern-panels">
          <v-expansion-panel
            v-for="pattern in aiAdaptation.behaviorPatterns.value.slice(0, 3)"
            :key="pattern.id"
          >
            <v-expansion-panel-title>
              <div class="d-flex align-center w-100">
                <v-icon class="mr-2" small>mdi-chart-timeline-variant</v-icon>
                <span class="pattern-name">{{ pattern.name }}</span>
                <v-spacer />
                <v-progress-circular
                  :value="pattern.confidence * 100"
                  :color="getConfidenceColor(pattern.confidence)"
                  size="24"
                  width="3"
                >
                  <span class="text-caption">{{ Math.round(pattern.confidence * 100) }}</span>
                </v-progress-circular>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="pattern-details">
                <p class="text-body-2">{{ pattern.description }}</p>
                <div class="pattern-stats mt-2">
                  <v-chip size="x-small" class="mr-1">Frequency: {{ pattern.frequency }}</v-chip>
                  <v-chip size="x-small" class="mr-1">Recency: {{ formatRecency(pattern.recency) }}</v-chip>
                </div>
                <div class="pattern-triggers mt-2">
                  <span class="text-caption">Triggers:</span>
                  <v-chip
                    v-for="trigger in pattern.triggers"
                    :key="trigger"
                    size="x-small"
                    class="ml-1"
                    variant="outlined"
                  >
                    {{ trigger }}
                  </v-chip>
                </div>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
      
      <!-- Adaptation Suggestions -->
      <div class="mb-4">
        <h4 class="mb-2">Suggestions ({{ aiAdaptation.adaptationSuggestions.value.length }})</h4>
        <div v-if="aiAdaptation.adaptationSuggestions.value.length === 0" class="text-center py-4">
          <v-icon color="grey" size="48">mdi-lightbulb-outline</v-icon>
          <p class="text-body-2 grey--text mt-2">No suggestions available</p>
        </div>
        <v-list v-else dense>
          <v-list-item
            v-for="(suggestion, index) in aiAdaptation.adaptationSuggestions.value.slice(0, 3)"
            :key="index"
            class="suggestion-item"
          >
            <template #prepend>
              <v-icon :color="getAdaptationColor(suggestion.type)">{{ getAdaptationIcon(suggestion.type) }}</v-icon>
            </template>
            
            <v-list-item-title>{{ formatAdaptationLabel(suggestion) }}</v-list-item-title>
            <v-list-item-subtitle>{{ suggestion.reasoning }}</v-list-item-subtitle>
            
            <template #append>
              <div class="d-flex align-center">
                <v-chip
                  size="small"
                  :color="getConfidenceColor(suggestion.confidence)"
                  class="mr-2"
                >
                  {{ Math.round(suggestion.confidence * 100) }}%
                </v-chip>
                <v-btn
                  icon="mdi-plus"
                  size="small"
                  color="primary"
                  variant="text"
                  @click="applyAdaptation(suggestion)"
                >
                  <v-icon>mdi-plus</v-icon>
                  <v-tooltip activator="parent" location="top">Apply Adaptation</v-tooltip>
                </v-btn>
              </div>
            </template>
          </v-list-item>
        </v-list>
      </div>
      
      <!-- Context Information -->
      <div class="mb-4">
        <h4 class="mb-2">Current Context</h4>
        <v-row dense>
          <v-col cols="6" sm="4" md="3" v-for="(value, key) in contextDisplay" :key="key">
            <div class="context-item">
              <div class="context-label text-caption">{{ formatContextKey(key) }}</div>
              <div class="context-value text-body-2">{{ formatContextValue(value) }}</div>
            </div>
          </v-col>
        </v-row>
      </div>
      
      <!-- Performance Metrics -->
      <div class="mb-4">
        <h4 class="mb-2">Performance Metrics</h4>
        <v-row>
          <v-col cols="6" md="3" v-for="(metric, key) in aiAdaptation.adaptationState.metrics" :key="key">
            <div class="metric-card">
              <div class="metric-value">{{ Math.round(metric * 100) }}%</div>
              <div class="metric-label text-caption">{{ formatMetricKey(key) }}</div>
              <v-progress-linear
                :value="metric * 100"
                :color="getMetricColor(metric)"
                height="3"
                rounded
              />
            </div>
          </v-col>
        </v-row>
      </div>
    </v-card-text>
    
    <v-card-actions>
      <v-btn
        variant="text"
        prepend-icon="mdi-refresh"
        @click="aiAdaptation.analyzeUserBehavior()"
      >
        Analyze Now
      </v-btn>
      <v-btn
        variant="text"
        prepend-icon="mdi-cog"
        @click="showSettings = true"
      >
        Settings
      </v-btn>
      <v-spacer />
      <v-btn
        variant="text"
        color="error"
        prepend-icon="mdi-restore"
        @click="resetAdaptations"
      >
        Reset All
      </v-btn>
    </v-card-actions>
    
    <!-- Settings Dialog -->
    <v-dialog v-model="showSettings" max-width="600">
      <v-card>
        <v-card-title>AI Adaptation Settings</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-switch
                v-model="aiAdaptation.isLearning.value"
                label="Enable Learning"
                hint="Allow the system to learn from your behavior"
                persistent-hint
              />
            </v-col>
            <v-col cols="12">
              <v-slider
                v-model="aiAdaptation.learningConfig.confidenceThreshold"
                label="Confidence Threshold"
                min="0.5"
                max="1"
                step="0.05"
                thumb-label
                hint="Minimum confidence required for adaptations"
                persistent-hint
              />
            </v-col>
            <v-col cols="12">
              <v-slider
                v-model="aiAdaptation.learningConfig.maxActiveAdaptations"
                label="Max Active Adaptations"
                min="1"
                max="10"
                step="1"
                thumb-label
                hint="Maximum number of simultaneous adaptations"
                persistent-hint
              />
            </v-col>
            <v-col cols="12">
              <v-slider
                v-model="aiAdaptation.learningConfig.learningRate"
                label="Learning Rate"
                min="0.01"
                max="0.5"
                step="0.01"
                thumb-label
                hint="How quickly the system adapts to changes"
                persistent-hint
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showSettings = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useUnifiedAIIntelligence } from '@/utils/unifiedAIIntelligenceSystem'
import type { UIAdaptation } from '@/utils/unifiedAIIntelligenceSystem'

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

// Create compatibility layer for old aiAdaptation interface
const aiAdaptation = {
  isEnabled: ref(true),
  isLearning: computed(() => isLearning),
  adaptationConfidence: computed(() => ({ value: adaptationScore.value || 0 })),
  currentAdaptations: computed(() => ({ 
    value: [] as UIAdaptation[],
    length: 0 
  })),
  behaviorPatterns: computed(() => ({ 
    value: [] as Array<{
      id: string
      name: string
      description: string
      confidence: number
      frequency: number
      recency: number
      triggers: string[]
      preferences: Record<string, any>
      adaptations: UIAdaptation[]
    }>,
    length: 0
  })),
  adaptationSuggestions: computed(() => ({ 
    value: [] as Array<{
      id: string
      type: string
      title: string
      description: string
      confidence: number
      impact: number
      actions: Array<{ label: string; action: () => void }>
    }>,
    length: 0
  })),
  adaptationMode: ref('balanced' as 'conservative' | 'balanced' | 'aggressive'),
  adaptationState: {
    metrics: {},
    currentContext: {}
  },
  learningConfig: {
    confidenceThreshold: ref(0.7),
    maxActiveAdaptations: ref(5),
    learningRate: ref(0.1)
  },
  analyzeUserBehavior: () => getInsights(),
  applyAdaptation: async (adaptation: UIAdaptation) => {
    await applyAdaptation(adaptation)
  },
  rollbackAdaptation: (target: string) => Promise.resolve(true)
}

// Local state
const showSettings = ref(false)
const selectedMode = ref(aiAdaptation.adaptationMode.value)

// Watch mode changes
watch(selectedMode, (newMode) => {
  aiAdaptation.adaptationMode.value = newMode as 'conservative' | 'balanced' | 'aggressive'
})

// Computed
const contextDisplay = computed(() => {
  const context = aiAdaptation.adaptationState.currentContext
  return {
    timeOfDay: context.timeOfDay,
    deviceType: context.deviceType,
    networkSpeed: context.networkSpeed,
    userMood: context.userMood,
    taskComplexity: context.taskComplexity,
    sessionDuration: Math.round(context.sessionDuration / 1000 / 60) // minutes
  }
})

// Methods
const getAdaptationColor = (type: string): string => {
  const colors = {
    theme: 'purple',
    layout: 'blue',
    animation: 'green',
    navigation: 'orange',
    content: 'red'
  }
  return colors[type as keyof typeof colors] || 'grey'
}

const getAdaptationIcon = (type: string): string => {
  const icons = {
    theme: 'mdi-palette',
    layout: 'mdi-view-dashboard',
    animation: 'mdi-play-speed',
    navigation: 'mdi-compass',
    content: 'mdi-file-document'
  }
  return icons[type as keyof typeof icons] || 'mdi-cog'
}

const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.8) return 'success'
  if (confidence >= 0.6) return 'warning'
  return 'error'
}

const getMetricColor = (value: number): string => {
  if (value >= 0.8) return 'success'
  if (value >= 0.6) return 'primary'
  if (value >= 0.4) return 'warning'
  return 'error'
}

const formatAdaptationLabel = (adaptation: UIAdaptation): string => {
  const typeLabels = {
    theme: 'Theme',
    layout: 'Layout',
    animation: 'Animation',
    navigation: 'Navigation',
    content: 'Content'
  }
  
  const typeLabel = typeLabels[adaptation.type as keyof typeof typeLabels] || adaptation.type
  const targetLabel = adaptation.target.replace(/-/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2')
  
  return `${typeLabel}: ${targetLabel}`
}

const formatContextKey = (key: string): string => {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
}

const formatContextValue = (value: any): string => {
  if (typeof value === 'string') {
    return value.charAt(0).toUpperCase() + value.slice(1)
  }
  if (typeof value === 'number') {
    return value.toString()
  }
  return String(value)
}

const formatMetricKey = (key: string): string => {
  const labels = {
    accuracy: 'Accuracy',
    userSatisfaction: 'Satisfaction',
    performanceImpact: 'Performance',
    adoptionRate: 'Adoption',
    rollbackRate: 'Rollback'
  }
  return labels[key as keyof typeof labels] || key
}

const formatRecency = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'Just now'
}

const applyAdaptation = async (adaptation: UIAdaptation) => {
  await aiAdaptation.applyAdaptation(adaptation)
}

const rollbackAdaptation = async (adaptation: UIAdaptation) => {
  await aiAdaptation.rollbackAdaptation(adaptation.target)
}

const resetAdaptations = async () => {
  for (const adaptation of aiAdaptation.currentAdaptations.value) {
    await aiAdaptation.rollbackAdaptation(adaptation.target)
  }
}
</script>

<style scoped>
.ai-adaptation-dashboard {
  background: linear-gradient(135deg, 
    rgba(var(--v-surface-base-rgb), 0.95),
    rgba(var(--v-primary-base-rgb), 0.05)
  );
  backdrop-filter: blur(10px);
}

.status-item {
  padding: 8px 0;
}

.status-label {
  font-size: 12px;
  color: rgba(var(--v-text-base-rgb), 0.7);
  margin-bottom: 4px;
}

.status-value {
  font-weight: 500;
  display: flex;
  align-items: center;
}

.pattern-panels .v-expansion-panel {
  margin-bottom: 8px;
  border: 1px solid rgba(var(--v-border-color-rgb), 0.3);
  border-radius: 8px;
}

.pattern-name {
  font-weight: 500;
}

.pattern-details {
  padding: 8px 0;
}

.pattern-stats .v-chip {
  margin-right: 4px;
}

.suggestion-item {
  border: 1px solid rgba(var(--v-border-color-rgb), 0.2);
  border-radius: 8px;
  margin-bottom: 8px;
  background: rgba(var(--v-surface-base-rgb), 0.5);
}

.context-item {
  padding: 8px;
  background: rgba(var(--v-surface-base-rgb), 0.3);
  border-radius: 6px;
  text-align: center;
}

.context-label {
  opacity: 0.7;
  margin-bottom: 2px;
}

.context-value {
  font-weight: 500;
}

.metric-card {
  text-align: center;
  padding: 12px;
  background: rgba(var(--v-surface-base-rgb), 0.5);
  border-radius: 8px;
  border: 1px solid rgba(var(--v-border-color-rgb), 0.2);
}

.metric-value {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
}

.metric-label {
  opacity: 0.7;
  margin-bottom: 8px;
}

/* Dark mode adjustments */
.v-application--is-dark .ai-adaptation-dashboard {
  background: linear-gradient(135deg, 
    rgba(var(--v-surface-base-rgb), 0.9),
    rgba(var(--v-primary-base-rgb), 0.1)
  );
}

.v-application--is-dark .suggestion-item {
  background: rgba(var(--v-surface-base-rgb), 0.3);
}

.v-application--is-dark .context-item,
.v-application--is-dark .metric-card {
  background: rgba(var(--v-surface-base-rgb), 0.3);
}

/* Animation for real-time updates */
.ai-adaptation-dashboard * {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.pattern-panels,
.suggestion-item,
.context-item,
.metric-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.pattern-panels:hover,
.suggestion-item:hover,
.context-item:hover,
.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
</style>