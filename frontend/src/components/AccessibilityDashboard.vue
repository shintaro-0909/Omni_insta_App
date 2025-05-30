<template>
  <v-card
    class="accessibility-dashboard"
    :class="{
      'emergency-mode': accessibilityStatus.emergencyMode,
      'high-contrast': profile?.preferences.contrast > 1.5,
      'large-text': profile?.preferences.fontSize > 18
    }"
    elevation="2"
  >
    <!-- Header with Emergency Toggle -->
    <v-card-title class="d-flex align-center">
      <v-icon 
        :icon="accessibilityStatus.isActive ? 'mdi-wheelchair-accessibility' : 'mdi-account-circle'"
        :color="accessibilityStatus.isActive ? 'primary' : 'grey'"
        class="me-2"
      />
      <span>{{ $t('accessibility.dashboard.title') }}</span>
      
      <v-spacer />
      
      <!-- Emergency Mode Toggle -->
      <v-btn
        :color="accessibilityStatus.emergencyMode ? 'error' : 'warning'"
        :variant="accessibilityStatus.emergencyMode ? 'flat' : 'outlined'"
        size="small"
        @click="toggleEmergencyMode"
        :aria-label="$t('accessibility.emergency.toggle')"
      >
        <v-icon>mdi-alert-circle</v-icon>
        {{ accessibilityStatus.emergencyMode ? $t('accessibility.emergency.deactivate') : $t('accessibility.emergency.activate') }}
      </v-btn>
    </v-card-title>

    <!-- Status Overview -->
    <v-card-text>
      <v-row>
        <!-- Active Status -->
        <v-col cols="12" md="6">
          <v-card class="status-card" :color="accessibilityStatus.isActive ? 'success' : 'warning'" variant="tonal">
            <v-card-text>
              <div class="d-flex align-center">
                <v-icon size="large" class="me-3">
                  {{ accessibilityStatus.isActive ? 'mdi-check-circle' : 'mdi-pause-circle' }}
                </v-icon>
                <div>
                  <div class="text-h6">
                    {{ accessibilityStatus.isActive ? $t('accessibility.status.active') : $t('accessibility.status.inactive') }}
                  </div>
                  <div class="text-caption">
                    {{ accessibilityStatus.profileLoaded ? $t('accessibility.status.profileLoaded') : $t('accessibility.status.noProfile') }}
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Adaptations Count -->
        <v-col cols="12" md="6">
          <v-card class="status-card" color="info" variant="tonal">
            <v-card-text>
              <div class="d-flex align-center">
                <v-icon size="large" class="me-3">mdi-auto-fix</v-icon>
                <div>
                  <div class="text-h6">{{ accessibilityStatus.adaptationsActive }}</div>
                  <div class="text-caption">{{ $t('accessibility.adaptations.active') }}</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Profile Information -->
      <v-card v-if="profile" class="mt-4" variant="outlined">
        <v-card-title class="text-h6">
          <v-icon class="me-2">mdi-account-details</v-icon>
          {{ $t('accessibility.profile.title') }}
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="4">
              <div class="text-subtitle2">{{ $t('accessibility.profile.name') }}</div>
              <div>{{ profile.name }}</div>
            </v-col>
            <v-col cols="12" md="4">
              <div class="text-subtitle2">{{ $t('accessibility.profile.impairments') }}</div>
              <v-chip-group>
                <v-chip
                  v-for="impairment in profile.impairments"
                  :key="impairment.type"
                  size="small"
                  :color="getImpairmentColor(impairment.severity)"
                >
                  {{ $t(`accessibility.impairments.${impairment.type}`) }}
                </v-chip>
              </v-chip-group>
            </v-col>
            <v-col cols="12" md="4">
              <div class="text-subtitle2">{{ $t('accessibility.profile.adaptationMode') }}</div>
              <v-chip :color="getAdaptationModeColor(profile.adaptationMode)">
                {{ $t(`accessibility.adaptationMode.${profile.adaptationMode}`) }}
              </v-chip>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Quick Settings -->
      <v-expansion-panels v-if="profile" class="mt-4" variant="accordion">
        <!-- Visual Preferences -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <template v-slot:default="{ expanded }">
              <v-icon class="me-2">mdi-eye</v-icon>
              {{ $t('accessibility.visual.title') }}
            </template>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-slider
                  v-model="profile.preferences.fontSize"
                  :label="$t('accessibility.visual.fontSize')"
                  :min="12"
                  :max="32"
                  :step="2"
                  thumb-label
                  @update:model-value="updatePreference('fontSize', $event)"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-slider
                  v-model="profile.preferences.contrast"
                  :label="$t('accessibility.visual.contrast')"
                  :min="1"
                  :max="3"
                  :step="0.1"
                  thumb-label
                  @update:model-value="updatePreference('contrast', $event)"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="profile.preferences.darkMode"
                  :label="$t('accessibility.visual.darkMode')"
                  @update:model-value="updatePreference('darkMode', $event)"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="profile.preferences.reducedMotion"
                  :label="$t('accessibility.visual.reducedMotion')"
                  @update:model-value="updatePreference('reducedMotion', $event)"
                />
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Motor Preferences -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <v-icon class="me-2">mdi-hand-pointing-up</v-icon>
            {{ $t('accessibility.motor.title') }}
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-slider
                  v-model="profile.preferences.clickTolerance"
                  :label="$t('accessibility.motor.clickTolerance')"
                  :min="1"
                  :max="50"
                  :step="1"
                  thumb-label
                  @update:model-value="updatePreference('clickTolerance', $event)"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-slider
                  v-model="profile.preferences.dwellTime"
                  :label="$t('accessibility.motor.dwellTime')"
                  :min="0"
                  :max="3000"
                  :step="100"
                  thumb-label
                  @update:model-value="updatePreference('dwellTime', $event)"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="profile.preferences.stickyKeys"
                  :label="$t('accessibility.motor.stickyKeys')"
                  @update:model-value="updatePreference('stickyKeys', $event)"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="profile.preferences.gestureComplexity"
                  :items="gestureComplexityOptions"
                  :label="$t('accessibility.motor.gestureComplexity')"
                  @update:model-value="updatePreference('gestureComplexity', $event)"
                />
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Cognitive Preferences -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <v-icon class="me-2">mdi-brain</v-icon>
            {{ $t('accessibility.cognitive.title') }}
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="profile.preferences.simplifiedInterface"
                  :label="$t('accessibility.cognitive.simplifiedInterface')"
                  @update:model-value="updatePreference('simplifiedInterface', $event)"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="profile.preferences.memoryAids"
                  :label="$t('accessibility.cognitive.memoryAids')"
                  @update:model-value="updatePreference('memoryAids', $event)"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="profile.preferences.attentionFocus"
                  :items="attentionFocusOptions"
                  :label="$t('accessibility.cognitive.attentionFocus')"
                  @update:model-value="updatePreference('attentionFocus', $event)"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-slider
                  v-model="profile.preferences.processingTime"
                  :label="$t('accessibility.cognitive.processingTime')"
                  :min="0.5"
                  :max="3"
                  :step="0.1"
                  thumb-label
                  @update:model-value="updatePreference('processingTime', $event)"
                />
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- AI Assistance -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <v-icon class="me-2">mdi-robot</v-icon>
            {{ $t('accessibility.ai.title') }}
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="profile.preferences.predictiveInput"
                  :label="$t('accessibility.ai.predictiveInput')"
                  @update:model-value="updatePreference('predictiveInput', $event)"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="profile.preferences.proactiveAssistance"
                  :label="$t('accessibility.ai.proactiveAssistance')"
                  @update:model-value="updatePreference('proactiveAssistance', $event)"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="profile.preferences.smartSuggestions"
                  :label="$t('accessibility.ai.smartSuggestions')"
                  @update:model-value="updatePreference('smartSuggestions', $event)"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="profile.preferences.contextualHelp"
                  :label="$t('accessibility.ai.contextualHelp')"
                  @update:model-value="updatePreference('contextualHelp', $event)"
                />
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <!-- Active Adaptations -->
      <v-card v-if="activeAdaptations.size > 0" class="mt-4" variant="outlined">
        <v-card-title class="text-h6">
          <v-icon class="me-2">mdi-tune</v-icon>
          {{ $t('accessibility.adaptations.title') }}
        </v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item
              v-for="adaptation in Array.from(activeAdaptations.values())"
              :key="adaptation.id"
              class="adaptation-item"
            >
              <template v-slot:prepend>
                <v-avatar :color="getAdaptationTypeColor(adaptation.type)" size="small">
                  <v-icon>{{ getAdaptationIcon(adaptation.type) }}</v-icon>
                </v-avatar>
              </template>

              <v-list-item-title>{{ adaptation.reason }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ $t(`accessibility.adaptations.types.${adaptation.type}`) }} - 
                {{ $t(`accessibility.adaptations.confidence`) }}: {{ Math.round(adaptation.confidence * 100) }}%
              </v-list-item-subtitle>

              <template v-slot:append>
                <v-btn
                  variant="text"
                  size="small"
                  @click="removeAdaptation(adaptation.id)"
                  :aria-label="$t('accessibility.adaptations.remove')"
                >
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>

      <!-- Analytics & Insights -->
      <v-card v-if="insights" class="mt-4" variant="outlined">
        <v-card-title class="text-h6">
          <v-icon class="me-2">mdi-chart-line</v-icon>
          {{ $t('accessibility.insights.title') }}
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="3">
              <div class="text-center">
                <div class="text-h4 text-success">{{ Math.round(insights.successRate * 100) }}%</div>
                <div class="text-caption">{{ $t('accessibility.insights.successRate') }}</div>
              </div>
            </v-col>
            <v-col cols="12" md="3">
              <div class="text-center">
                <div class="text-h4 text-info">{{ insights.assistiveDevicesCount }}</div>
                <div class="text-caption">{{ $t('accessibility.insights.assistiveDevices') }}</div>
              </div>
            </v-col>
            <v-col cols="12" md="3">
              <div class="text-center">
                <div class="text-h4 text-primary">{{ Math.round(insights.learningAccuracy * 100) }}%</div>
                <div class="text-caption">{{ $t('accessibility.insights.learningAccuracy') }}</div>
              </div>
            </v-col>
            <v-col cols="12" md="3">
              <div class="text-center">
                <div class="text-h4 text-warning">{{ Math.round(insights.assistanceFrequency * 100) }}%</div>
                <div class="text-caption">{{ $t('accessibility.insights.assistanceFrequency') }}</div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Suggestions -->
      <v-card v-if="suggestions.length > 0" class="mt-4" color="amber-lighten-5" variant="outlined">
        <v-card-title class="text-h6">
          <v-icon class="me-2">mdi-lightbulb</v-icon>
          {{ $t('accessibility.suggestions.title') }}
        </v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item v-for="(suggestion, index) in suggestions" :key="index">
              <template v-slot:prepend>
                <v-icon color="amber">mdi-lightbulb-outline</v-icon>
              </template>
              <v-list-item-title>{{ suggestion }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>

      <!-- Alerts -->
      <v-alert
        v-for="alert in alertQueue"
        :key="alert.id"
        :type="getAlertType(alert.severity)"
        :title="alert.title"
        :text="alert.description"
        class="mt-2"
        dismissible
        @click:close="dismissAlert(alert.id)"
      >
        <template v-if="alert.suggestedActions.length > 0" v-slot:append>
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" variant="text" size="small">
                {{ $t('accessibility.alerts.actions') }}
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                v-for="action in alert.suggestedActions"
                :key="action"
                @click="executeAlertAction(alert, action)"
              >
                <v-list-item-title>{{ action }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-alert>
    </v-card-text>

    <!-- Action Buttons -->
    <v-card-actions>
      <v-btn
        color="primary"
        @click="runAccessibilityAssessment"
        :loading="isAssessing"
      >
        <v-icon class="me-1">mdi-magnify</v-icon>
        {{ $t('accessibility.actions.reassess') }}
      </v-btn>

      <v-btn
        color="secondary"
        @click="exportAccessibilitySettings"
      >
        <v-icon class="me-1">mdi-export</v-icon>
        {{ $t('accessibility.actions.export') }}
      </v-btn>

      <v-spacer />

      <v-btn
        :color="accessibilityState.crossDeviceEnabled ? 'success' : 'grey'"
        variant="outlined"
        @click="toggleCrossDeviceSync"
      >
        <v-icon class="me-1">mdi-sync</v-icon>
        {{ $t('accessibility.actions.crossDevice') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUniversalAccessibility } from '@/composables/useUniversalAccessibility'

const { t } = useI18n()

// Use the accessibility composable
const {
  currentProfile: profile,
  accessibilityState,
  accessibilityStatus,
  activeAdaptations,
  alertQueue,
  accessibilityInsights: insights,
  adaptationSuggestions: suggestions,
  activateEmergencyMode,
  createAccessibilityAlert,
  detectAndCreateProfile
} = useUniversalAccessibility()

// Local state
const isAssessing = ref(false)

// Options for selects
const gestureComplexityOptions = [
  { title: t('accessibility.motor.gestureComplexity.simple'), value: 'simple' },
  { title: t('accessibility.motor.gestureComplexity.normal'), value: 'normal' },
  { title: t('accessibility.motor.gestureComplexity.complex'), value: 'complex' }
]

const attentionFocusOptions = [
  { title: t('accessibility.cognitive.attentionFocus.single'), value: 'single' },
  { title: t('accessibility.cognitive.attentionFocus.multiple'), value: 'multiple' },
  { title: t('accessibility.cognitive.attentionFocus.adaptive'), value: 'adaptive' }
]

// Methods
const toggleEmergencyMode = async () => {
  if (accessibilityStatus.value.emergencyMode) {
    // Deactivate emergency mode (would need implementation)
    console.log('Deactivating emergency mode')
  } else {
    await activateEmergencyMode()
  }
}

const updatePreference = async (key: string, value: any) => {
  if (!profile.value) return
  
  // Update the preference
  ;(profile.value.preferences as any)[key] = value
  profile.value.lastUpdated = Date.now()
  
  // Apply the change immediately (would need implementation)
  console.log(`Updated preference ${key} to`, value)
}

const removeAdaptation = (adaptationId: string) => {
  activeAdaptations.value.delete(adaptationId)
  createAccessibilityAlert({
    type: 'suggestion',
    severity: 'info',
    title: t('accessibility.adaptations.removed'),
    description: t('accessibility.adaptations.removedDescription'),
    actionRequired: false,
    suggestedActions: []
  })
}

const runAccessibilityAssessment = async () => {
  isAssessing.value = true
  try {
    await detectAndCreateProfile()
    createAccessibilityAlert({
      type: 'achievement',
      severity: 'info',
      title: t('accessibility.assessment.completed'),
      description: t('accessibility.assessment.completedDescription'),
      actionRequired: false,
      suggestedActions: []
    })
  } catch (error) {
    console.error('Assessment failed:', error)
  } finally {
    isAssessing.value = false
  }
}

const exportAccessibilitySettings = () => {
  if (!profile.value) return
  
  const data = JSON.stringify(profile.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `accessibility-profile-${Date.now()}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const toggleCrossDeviceSync = () => {
  accessibilityState.crossDeviceEnabled = !accessibilityState.crossDeviceEnabled
}

const dismissAlert = (alertId: string) => {
  const index = alertQueue.value.findIndex(alert => alert.id === alertId)
  if (index > -1) {
    alertQueue.value.splice(index, 1)
  }
}

const executeAlertAction = (alert: any, action: string) => {
  console.log('Executing alert action:', action, 'for alert:', alert.title)
  // Implementation would depend on the specific action
}

// Helper functions
const getImpairmentColor = (severity: number) => {
  if (severity < 0.3) return 'green'
  if (severity < 0.7) return 'orange'
  return 'red'
}

const getAdaptationModeColor = (mode: string) => {
  switch (mode) {
    case 'subtle': return 'blue-grey'
    case 'moderate': return 'blue'
    case 'aggressive': return 'purple'
    case 'complete': return 'red'
    case 'predictive': return 'green'
    default: return 'grey'
  }
}

const getAdaptationTypeColor = (type: string) => {
  switch (type) {
    case 'layout': return 'blue'
    case 'content': return 'green'
    case 'interaction': return 'orange'
    case 'navigation': return 'purple'
    case 'feedback': return 'pink'
    default: return 'grey'
  }
}

const getAdaptationIcon = (type: string) => {
  switch (type) {
    case 'layout': return 'mdi-view-dashboard'
    case 'content': return 'mdi-text'
    case 'interaction': return 'mdi-cursor-default-click'
    case 'navigation': return 'mdi-navigation'
    case 'feedback': return 'mdi-vibrate'
    default: return 'mdi-cog'
  }
}

const getAlertType = (severity: string) => {
  switch (severity) {
    case 'critical': return 'error'
    case 'high': return 'warning'
    case 'medium': return 'info'
    case 'low': return 'success'
    default: return 'info'
  }
}

// Watch for profile changes to apply CSS custom properties
watch(
  () => profile.value?.preferences,
  (preferences) => {
    if (!preferences) return
    
    const root = document.documentElement
    root.style.setProperty('--accessibility-font-size', `${preferences.fontSize}px`)
    root.style.setProperty('--accessibility-contrast', preferences.contrast.toString())
    root.style.setProperty('--accessibility-cursor-size', `${preferences.cursorSize}em`)
    
    if (preferences.reducedMotion) {
      root.style.setProperty('--accessibility-animation-duration', '0ms')
    } else {
      root.style.removeProperty('--accessibility-animation-duration')
    }
  },
  { deep: true, immediate: true }
)
</script>

<style scoped>
.accessibility-dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.accessibility-dashboard.emergency-mode {
  border: 3px solid red !important;
  box-shadow: 0 0 20px rgba(255, 0, 0, 0.5) !important;
}

.accessibility-dashboard.high-contrast {
  filter: contrast(2);
}

.accessibility-dashboard.large-text {
  font-size: 1.2em;
}

.status-card {
  height: 100%;
}

.adaptation-item {
  border-left: 3px solid currentColor;
  margin-bottom: 8px;
  padding-left: 16px;
}

.text-h4 {
  font-weight: bold;
  margin-bottom: 4px;
}

.v-expansion-panel-text {
  padding-top: 16px;
}

/* Accessibility enhancements */
:focus-visible {
  outline: 3px solid var(--v-theme-primary) !important;
  outline-offset: 2px !important;
}

.v-btn:focus-visible {
  transform: scale(1.05);
}

.v-slider:focus-within {
  background-color: rgba(var(--v-theme-primary), 0.1);
  border-radius: 4px;
}

/* High contrast mode overrides */
.accessibility-dashboard.high-contrast .v-card {
  border: 2px solid currentColor;
}

.accessibility-dashboard.high-contrast .v-btn {
  border: 2px solid currentColor;
}

/* Large text adjustments */
.accessibility-dashboard.large-text .v-btn {
  min-height: 48px;
  font-size: 1.1em;
}

.accessibility-dashboard.large-text .v-list-item {
  min-height: 56px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>