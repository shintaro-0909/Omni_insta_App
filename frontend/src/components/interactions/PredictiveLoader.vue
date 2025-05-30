<template>
  <div class="predictive-loader">
    <!-- Main content slot -->
    <div class="loader-content">
      <slot />
    </div>
    
    <!-- Predictive suggestions -->
    <transition name="suggestions">
      <div
        v-if="showSuggestions && suggestions.length > 0"
        class="predictive-suggestions"
        :style="suggestionsStyle"
      >
        <div class="suggestions-header">
          <v-icon small class="mr-2">mdi-lightbulb-on</v-icon>
          <span>{{ $t('predictive.nextActions') }}</span>
          <v-spacer />
          <v-btn
            icon
            x-small
            @click="dismissSuggestions"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        
        <div class="suggestions-list">
          <div
            v-for="(suggestion, index) in suggestions"
            :key="suggestion.id"
            class="suggestion-item"
            :class="{ 'suggestion-item--primary': index === 0 }"
            @click="executeSuggestion(suggestion)"
          >
            <div class="suggestion-icon">
              <v-icon :color="index === 0 ? 'primary' : 'grey'">{{ getSuggestionIcon(suggestion) }}</v-icon>
            </div>
            <div class="suggestion-content">
              <div class="suggestion-title">{{ getSuggestionTitle(suggestion) }}</div>
              <div class="suggestion-confidence">
                <v-progress-linear
                  :value="suggestion.probability * 100"
                  :color="index === 0 ? 'primary' : 'grey'"
                  height="2"
                  rounded
                />
              </div>
            </div>
            <div class="suggestion-preload" v-if="suggestion.preloaded">
              <v-icon small color="success">mdi-check-circle</v-icon>
            </div>
          </div>
        </div>
      </div>
    </transition>
    
    <!-- Preload progress indicator -->
    <transition name="fade">
      <div v-if="isPreloading" class="preload-indicator">
        <v-progress-circular
          indeterminate
          size="20"
          width="2"
          color="primary"
        />
        <span class="ml-2">{{ $t('predictive.preparing') }}</span>
      </div>
    </transition>
    
    <!-- Smart tooltip -->
    <v-tooltip
      v-model="showTooltip"
      :activator="tooltipActivator"
      location="top"
      :open-delay="500"
    >
      <div class="smart-tooltip">
        <div class="tooltip-header">
          <v-icon small class="mr-1">mdi-brain</v-icon>
          {{ $t('predictive.aiInsight') }}
        </div>
        <div class="tooltip-content">{{ currentInsight }}</div>
      </div>
    </v-tooltip>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePredictiveUI, PredictiveAction } from '@/composables/usePredictiveUI'
import { useIntelligentAnimations } from '@/composables/useIntelligentAnimations'
import { getContextAnalyzer } from '@/utils/contextAnalyzer'

interface Props {
  showSuggestions?: boolean
  maxSuggestions?: number
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  autoPreload?: boolean
  contextAware?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showSuggestions: true,
  maxSuggestions: 3,
  position: 'bottom-right',
  autoPreload: true,
  contextAware: true
})

const emit = defineEmits<{
  'suggestion-executed': [action: PredictiveAction]
  'preload-complete': [actionId: string]
}>()

// Composables
const router = useRouter()
const { t } = useI18n()
const predictiveUI = usePredictiveUI()
const animations = useIntelligentAnimations()
const contextAnalyzer = getContextAnalyzer()

// State
const isPreloading = ref(false)
const preloadedActions = ref(new Set<string>())
const showTooltip = ref(false)
const tooltipActivator = ref<HTMLElement | null>(null)
const currentInsight = ref('')
const dismissedSuggestions = ref(new Set<string>())

// Computed
const suggestions = computed(() => {
  const allSuggestions = predictiveUI.predictedActions.value
    .filter(action => !dismissedSuggestions.value.has(action.id))
    .slice(0, props.maxSuggestions)
  
  // Apply context filtering if enabled
  if (props.contextAware) {
    const context = contextAnalyzer.getContext()
    return allSuggestions.filter(suggestion => {
      // Filter based on context
      if (context.networkSpeed === 'slow' && suggestion.preloadData) {
        return false // Don't suggest data-heavy actions on slow connection
      }
      if (context.batteryLevel && context.batteryLevel < 20) {
        // Prioritize essential actions on low battery
        return suggestion.probability > 0.5
      }
      return true
    })
  }
  
  return allSuggestions
})

const suggestionsStyle = computed(() => {
  const positions = {
    'bottom-right': { bottom: '24px', right: '24px' },
    'bottom-left': { bottom: '24px', left: '24px' },
    'top-right': { top: '24px', right: '24px' },
    'top-left': { top: '24px', left: '24px' }
  }
  return positions[props.position]
})

// Methods
const getSuggestionIcon = (suggestion: PredictiveAction): string => {
  const iconMap: Record<string, string> = {
    'view-schedules': 'mdi-calendar-clock',
    'view-content': 'mdi-image-multiple',
    'view-accounts': 'mdi-account-multiple',
    'create-post': 'mdi-plus-box',
    'create-schedule': 'mdi-calendar-plus',
    'view-analytics': 'mdi-chart-line',
    'manage-settings': 'mdi-cog',
    'view-billing': 'mdi-credit-card'
  }
  return iconMap[suggestion.id] || 'mdi-arrow-right'
}

const getSuggestionTitle = (suggestion: PredictiveAction): string => {
  const titleMap: Record<string, string> = {
    'view-schedules': t('predictive.viewSchedules'),
    'view-content': t('predictive.viewContent'),
    'view-accounts': t('predictive.viewAccounts'),
    'create-post': t('predictive.createPost'),
    'create-schedule': t('predictive.createSchedule'),
    'view-analytics': t('predictive.viewAnalytics'),
    'manage-settings': t('predictive.manageSettings'),
    'view-billing': t('predictive.viewBilling')
  }
  return titleMap[suggestion.id] || suggestion.id
}

const executeSuggestion = async (suggestion: PredictiveAction) => {
  // Track the action
  predictiveUI.trackAction(`execute-${suggestion.id}`)
  
  // Animate the click
  if (animations) {
    const element = document.querySelector(`.suggestion-item[key="${suggestion.id}"]`) as HTMLElement
    if (element) {
      await animations.animateWithEmotion(element, 'excited', {
        scale: 0.95,
        opacity: 0.8
      })
    }
  }
  
  // Execute the action
  if (suggestion.route) {
    router.push(suggestion.route)
  } else if (suggestion.action) {
    suggestion.action()
  }
  
  emit('suggestion-executed', suggestion)
}

const dismissSuggestions = () => {
  // Remember dismissed suggestions for this session
  suggestions.value.forEach(s => dismissedSuggestions.value.add(s.id))
  
  // Animate dismissal
  if (animations) {
    const element = document.querySelector('.predictive-suggestions') as HTMLElement
    if (element) {
      animations.animateWithEmotion(element, 'calm', {
        opacity: 0,
        transform: 'translateY(20px)'
      })
    }
  }
}

const preloadSuggestions = async () => {
  if (!props.autoPreload) return
  
  isPreloading.value = true
  
  for (const suggestion of suggestions.value) {
    if (suggestion.preloadData && !preloadedActions.value.has(suggestion.id)) {
      try {
        await suggestion.preloadData()
        preloadedActions.value.add(suggestion.id)
        emit('preload-complete', suggestion.id)
      } catch (error) {
        console.error('Failed to preload:', suggestion.id, error)
      }
    }
  }
  
  isPreloading.value = false
}

const generateInsight = () => {
  const context = contextAnalyzer.getContext()
  const topSuggestion = suggestions.value[0]
  
  if (!topSuggestion) return
  
  // Generate contextual insights
  const insights: string[] = []
  
  if (context.timeOfDay === 'morning') {
    insights.push(t('predictive.insights.morning'))
  } else if (context.timeOfDay === 'evening') {
    insights.push(t('predictive.insights.evening'))
  }
  
  if (context.engagement === 'high') {
    insights.push(t('predictive.insights.highEngagement'))
  }
  
  if (topSuggestion.probability > 0.8) {
    insights.push(t('predictive.insights.highConfidence', { action: getSuggestionTitle(topSuggestion) }))
  }
  
  currentInsight.value = insights[Math.floor(Math.random() * insights.length)] || t('predictive.insights.default')
}

// Watchers
watch(suggestions, () => {
  preloadSuggestions()
  generateInsight()
})

watch(() => props.showSuggestions, (show) => {
  if (show && animations) {
    // Animate suggestions appearance
    setTimeout(() => {
      const element = document.querySelector('.predictive-suggestions') as HTMLElement
      if (element) {
        animations.animateWithEmotion(element, 'playful', {
          opacity: 1,
          transform: 'translateY(0)'
        })
      }
    }, 100)
  }
})

// Mark suggestions as preloaded based on predictiveUI data
watch(() => predictiveUI.predictedActions.value, () => {
  predictiveUI.predictedActions.value.forEach(action => {
    if (predictiveUI.getPreloadedData(action.id)) {
      preloadedActions.value.add(action.id)
    }
  })
})

// Context-aware updates
const unsubscribeContext = contextAnalyzer.subscribe((context) => {
  if (props.contextAware) {
    // Regenerate insights based on new context
    generateInsight()
  }
})

// Lifecycle
onMounted(() => {
  preloadSuggestions()
  generateInsight()
})
</script>

<style scoped>
.predictive-loader {
  position: relative;
  width: 100%;
  height: 100%;
}

.loader-content {
  width: 100%;
  height: 100%;
}

.predictive-suggestions {
  position: fixed;
  width: 320px;
  background: rgba(var(--v-surface-base-rgb), 0.95);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  padding: 16px;
  z-index: 1000;
  transform: translateY(20px);
  opacity: 0;
}

.suggestions-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 500;
  color: rgba(var(--v-text-base-rgb), 0.8);
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(var(--v-background-base-rgb), 0.5);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.suggestion-item:hover {
  background: rgba(var(--v-background-base-rgb), 0.8);
  transform: translateX(4px);
}

.suggestion-item--primary {
  background: rgba(var(--v-primary-base-rgb), 0.1);
  border: 1px solid rgba(var(--v-primary-base-rgb), 0.2);
}

.suggestion-item--primary:hover {
  background: rgba(var(--v-primary-base-rgb), 0.15);
}

.suggestion-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--v-surface-base-rgb), 0.5);
  border-radius: 50%;
}

.suggestion-content {
  flex: 1;
  min-width: 0;
}

.suggestion-title {
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.suggestion-confidence {
  width: 100%;
}

.suggestion-preload {
  flex-shrink: 0;
}

.preload-indicator {
  position: fixed;
  bottom: 24px;
  left: 24px;
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: rgba(var(--v-surface-base-rgb), 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  font-size: 12px;
  z-index: 999;
}

.smart-tooltip {
  max-width: 250px;
}

.tooltip-header {
  display: flex;
  align-items: center;
  font-weight: 500;
  margin-bottom: 4px;
}

.tooltip-content {
  font-size: 12px;
  line-height: 1.4;
  opacity: 0.9;
}

/* Transitions */
.suggestions-enter-active,
.suggestions-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.suggestions-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.suggestions-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Dark mode adjustments */
.v-application--is-dark .predictive-suggestions {
  background: rgba(var(--v-surface-base-rgb), 0.9);
}

.v-application--is-dark .suggestion-item {
  background: rgba(var(--v-background-base-rgb), 0.3);
}

.v-application--is-dark .suggestion-item:hover {
  background: rgba(var(--v-background-base-rgb), 0.5);
}

/* Mobile optimizations */
@media (max-width: 600px) {
  .predictive-suggestions {
    width: calc(100vw - 48px);
    max-width: 320px;
  }
  
  .suggestion-item {
    padding: 10px;
  }
  
  .suggestion-icon {
    width: 36px;
    height: 36px;
  }
}
</style>