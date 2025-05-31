<template>
  <v-card class="performance-dashboard">
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2">mdi-speedometer</v-icon>
      {{ $t('performance.title') }}
      
      <v-spacer />
      
      <v-chip
        :color="overallScoreColor"
        :variant="(overallScore ?? 0) >= 80 ? 'elevated' : 'outlined'"
        class="mr-2"
      >
        <v-icon start>mdi-trophy</v-icon>
        {{ overallScore ?? '--' }}/100
      </v-chip>
      
      <v-btn
        icon="mdi-refresh"
        variant="text"
        size="small"
        @click="refreshMetrics"
        :loading="loading"
      />
    </v-card-title>

    <v-card-text>
      <!-- Core Web Vitals -->
      <v-row class="mb-4">
        <v-col cols="12">
          <h3 class="text-h6 mb-3">{{ $t('performance.coreWebVitals') }}</h3>
        </v-col>
        
        <v-col cols="12" md="4">
          <performance-metric
            icon="mdi-timer-outline"
            :title="$t('performance.lcp')"
            :value="metrics.LCP"
            unit="ms"
            :status="metrics.LCP ? getMetricStatus('LCP', metrics.LCP) : undefined"
            :threshold="PERFORMANCE_THRESHOLDS.LCP"
          />
        </v-col>
        
        <v-col cols="12" md="4">
          <performance-metric
            icon="mdi-cursor-default-click"
            :title="$t('performance.fid')"
            :value="metrics.FID"
            unit="ms"
            :status="metrics.FID ? getMetricStatus('FID', metrics.FID) : undefined"
            :threshold="PERFORMANCE_THRESHOLDS.FID"
          />
        </v-col>
        
        <v-col cols="12" md="4">
          <performance-metric
            icon="mdi-view-grid-outline"
            :title="$t('performance.cls')"
            :value="metrics.CLS"
            unit=""
            :decimal-places="3"
            :status="metrics.CLS ? getMetricStatus('CLS', metrics.CLS) : undefined"
            :threshold="PERFORMANCE_THRESHOLDS.CLS"
          />
        </v-col>
      </v-row>

      <!-- Other Metrics -->
      <v-row class="mb-4">
        <v-col cols="12">
          <h3 class="text-h6 mb-3">{{ $t('performance.otherMetrics') }}</h3>
        </v-col>
        
        <v-col cols="12" md="3">
          <performance-metric
            icon="mdi-flash"
            :title="$t('performance.fcp')"
            :value="metrics.FCP"
            unit="ms"
            :status="metrics.FCP ? getMetricStatus('FCP', metrics.FCP) : undefined"
            :threshold="PERFORMANCE_THRESHOLDS.FCP"
          />
        </v-col>
        
        <v-col cols="12" md="3">
          <performance-metric
            icon="mdi-download"
            :title="$t('performance.ttfb')"
            :value="metrics.TTFB"
            unit="ms"
            :status="metrics.TTFB ? getMetricStatus('TTFB', metrics.TTFB) : undefined"
            :threshold="PERFORMANCE_THRESHOLDS.TTFB"
          />
        </v-col>
        
        <v-col cols="12" md="3">
          <performance-metric
            icon="mdi-api"
            :title="$t('performance.avgApiTime')"
            :value="averageApiCallTime"
            unit="ms"
          />
        </v-col>
        
        <v-col cols="12" md="3">
          <performance-metric
            icon="mdi-fire"
            :title="$t('performance.coldStarts')"
            :value="metrics.coldStartCount"
            unit=""
            :subtitle="`Avg: ${averageColdStartTime.toFixed(0)}ms`"
          />
        </v-col>
      </v-row>

      <!-- PWA Status -->
      <v-row class="mb-4">
        <v-col cols="12">
          <h3 class="text-h6 mb-3">{{ $t('performance.pwaStatus') }}</h3>
        </v-col>
        
        <v-col cols="12" md="6">
          <v-card variant="outlined" class="pa-3">
            <div class="d-flex align-center">
              <v-icon :color="isPWAInstalled ? 'success' : 'grey'" class="mr-2">
                mdi-cellphone-arrow-down
              </v-icon>
              <div>
                <div class="font-weight-medium">{{ $t('performance.pwaInstalled') }}</div>
                <div class="text-caption text-medium-emphasis">
                  {{ isPWAInstalled ? $t('performance.pwaInstalledYes') : $t('performance.pwaInstalledNo') }}
                </div>
              </div>
            </div>
          </v-card>
        </v-col>
        
        <v-col cols="12" md="6">
          <v-card variant="outlined" class="pa-3">
            <div class="d-flex align-center">
              <v-icon :color="isOnline ? 'success' : 'error'" class="mr-2">
                {{ isOnline ? 'mdi-wifi' : 'mdi-wifi-off' }}
              </v-icon>
              <div>
                <div class="font-weight-medium">{{ $t('performance.connectionStatus') }}</div>
                <div class="text-caption text-medium-emphasis">
                  {{ isOnline ? $t('performance.online') : $t('performance.offline') }}
                </div>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Error Count -->
      <v-alert
        v-if="metrics.errorCount > 0"
        type="warning"
        variant="outlined"
        class="mb-4"
      >
        <v-icon start>mdi-alert</v-icon>
        {{ $t('performance.errorCount', { count: metrics.errorCount }) }}
      </v-alert>

      <!-- Last Updated -->
      <div class="text-caption text-medium-emphasis text-center">
        {{ $t('performance.lastUpdated') }}: 
        {{ lastUpdated ? formatDateTime(lastUpdated) : $t('performance.never') }}
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { usePerformanceStore } from '@/stores/performance'
import { formatDateTime } from '@/plugins/i18n'
import PerformanceMetric from './PerformanceMetric.vue'

const performanceStore = usePerformanceStore()
const loading = ref(false)
const isOnline = ref(navigator.onLine)
const isPWAInstalled = ref(false)

// Computed
const { 
  metrics, 
  overallScore, 
  averageApiCallTime, 
  averageColdStartTime, 
  lastUpdated,
  PERFORMANCE_THRESHOLDS,
  getMetricStatus
} = performanceStore

const overallScoreColor = computed(() => {
  if (!overallScore) return 'grey'
  if (overallScore >= 90) return 'success'
  if (overallScore >= 80) return 'warning'
  return 'error'
})

// Methods
const refreshMetrics = async () => {
  loading.value = true
  
  try {
    // Re-initialize web vitals
    performanceStore.initializeWebVitals()
    
    // Check if PWA is installed
    checkPWAInstallation()
    
    await new Promise(resolve => setTimeout(resolve, 1000)) // Small delay for UX
  } finally {
    loading.value = false
  }
}

const checkPWAInstallation = () => {
  // Check if the app is running in standalone mode (PWA)
  if (window.matchMedia('(display-mode: standalone)').matches) {
    isPWAInstalled.value = true
  } else if ('getInstalledRelatedApps' in navigator) {
    // Check using getInstalledRelatedApps API if available
    ;(navigator as any).getInstalledRelatedApps().then((relatedApps: any[]) => {
      isPWAInstalled.value = relatedApps.length > 0
    })
  }
}

const handleOnline = () => {
  isOnline.value = true
}

const handleOffline = () => {
  isOnline.value = false
}

// Lifecycle
onMounted(() => {
  performanceStore.initializeWebVitals()
  checkPWAInstallation()
  
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
})

onUnmounted(() => {
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})
</script>

<style scoped>
.performance-dashboard {
  min-height: 400px;
}
</style>