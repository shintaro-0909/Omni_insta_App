<!--
  Example: Refactored Performance Dashboard
  This demonstrates how the new shared components can be used
  to simplify dashboard implementations
-->

<template>
  <dashboard-card
    :title="$t('performance.title')"
    icon="mdi-speedometer"
    :loading="loading"
  >
    <template #actions>
      <status-chip
        :status="overallScore >= 80 ? 'success' : overallScore >= 60 ? 'warning' : 'error'"
        :text="`${overallScore || '--'}/100`"
        icon="mdi-trophy"
        size="small"
      />
      
      <dashboard-action-button
        icon="mdi-refresh"
        :tooltip="$t('performance.refresh')"
        :loading="loading"
        @click="refreshMetrics"
      />
    </template>

    <!-- Core Web Vitals -->
    <v-row class="mb-4">
      <v-col cols="12">
        <h3 class="text-h6 mb-3">{{ $t('performance.coreWebVitals') }}</h3>
      </v-col>
      
      <v-col cols="12" md="4">
        <metric-card
          icon="mdi-timer-outline"
          :title="$t('performance.lcp')"
          :value="metrics.LCP"
          unit="ms"
          :status="metrics.LCP ? getMetricStatus('LCP', metrics.LCP) : undefined"
        />
      </v-col>
      
      <v-col cols="12" md="4">
        <metric-card
          icon="mdi-cursor-default-click"
          :title="$t('performance.fid')"
          :value="metrics.FID"
          unit="ms"
          :status="metrics.FID ? getMetricStatus('FID', metrics.FID) : undefined"
        />
      </v-col>
      
      <v-col cols="12" md="4">
        <metric-card
          icon="mdi-view-grid-outline"
          :title="$t('performance.cls')"
          :value="metrics.CLS"
          :decimal-places="3"
          :status="metrics.CLS ? getMetricStatus('CLS', metrics.CLS) : undefined"
        />
      </v-col>
    </v-row>

    <!-- Other Metrics -->
    <v-row class="mb-4">
      <v-col cols="12">
        <h3 class="text-h6 mb-3">{{ $t('performance.otherMetrics') }}</h3>
      </v-col>
      
      <v-col cols="12" md="3">
        <metric-card
          icon="mdi-flash"
          :title="$t('performance.fcp')"
          :value="metrics.FCP"
          unit="ms"
          :status="metrics.FCP ? getMetricStatus('FCP', metrics.FCP) : undefined"
        />
      </v-col>
      
      <v-col cols="12" md="3">
        <metric-card
          icon="mdi-download"
          :title="$t('performance.ttfb')"
          :value="metrics.TTFB"
          unit="ms"
          :status="metrics.TTFB ? getMetricStatus('TTFB', metrics.TTFB) : undefined"
        />
      </v-col>
      
      <v-col cols="12" md="3">
        <metric-card
          icon="mdi-api"
          :title="$t('performance.avgApiTime')"
          :value="metrics.avgApiTime"
          unit="ms"
          :status="getApiTimeStatus(metrics.avgApiTime)"
        />
      </v-col>
      
      <v-col cols="12" md="3">
        <metric-card
          icon="mdi-memory"
          :title="$t('performance.memoryUsage')"
          :value="metrics.memoryUsage"
          unit="MB"
          :status="getMemoryStatus(metrics.memoryUsage)"
        />
      </v-col>
    </v-row>

    <!-- Performance Trends -->
    <v-row>
      <v-col cols="12">
        <h3 class="text-h6 mb-3">{{ $t('performance.trends') }}</h3>
      </v-col>
      
      <v-col cols="12" md="6">
        <status-card
          :title="$t('performance.trend24h')"
          :value="formatTrend(trends.last24h)"
          :icon="trends.last24h >= 0 ? 'mdi-trending-up' : 'mdi-trending-down'"
          :color="trends.last24h >= 0 ? 'success' : 'warning'"
        />
      </v-col>
      
      <v-col cols="12" md="6">
        <status-card
          :title="$t('performance.trend7d')"
          :value="formatTrend(trends.last7d)"
          :icon="trends.last7d >= 0 ? 'mdi-trending-up' : 'mdi-trending-down'"
          :color="trends.last7d >= 0 ? 'success' : 'warning'"
        />
      </v-col>
    </v-row>
  </dashboard-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  DashboardCard,
  StatusCard,
  MetricCard,
  StatusChip,
  DashboardActionButton
} from './index'

const { t } = useI18n()

// Props
interface Props {
  autoRefresh?: boolean
  refreshInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  autoRefresh: true,
  refreshInterval: 30000
})

// Data
const loading = ref(false)
const metrics = ref({
  LCP: 0,
  FID: 0,
  CLS: 0,
  FCP: 0,
  TTFB: 0,
  avgApiTime: 0,
  memoryUsage: 0
})

const trends = ref({
  last24h: 0,
  last7d: 0
})

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 },
  FID: { good: 100, needsImprovement: 300 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FCP: { good: 1800, needsImprovement: 3000 },
  TTFB: { good: 800, needsImprovement: 1800 }
}

// Computed
const overallScore = computed(() => {
  // Calculate overall performance score based on metrics
  const scores = []
  
  Object.entries(PERFORMANCE_THRESHOLDS).forEach(([key, threshold]) => {
    const value = metrics.value[key as keyof typeof metrics.value] as number
    if (value > 0) {
      if (value <= threshold.good) scores.push(100)
      else if (value <= threshold.needsImprovement) scores.push(75)
      else scores.push(50)
    }
  })
  
  return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
})

// Methods
const getMetricStatus = (metricName: string, value: number) => {
  const threshold = PERFORMANCE_THRESHOLDS[metricName as keyof typeof PERFORMANCE_THRESHOLDS]
  if (!threshold) return 'warning'
  
  if (value <= threshold.good) return 'good'
  if (value <= threshold.needsImprovement) return 'needs-improvement'
  return 'poor'
}

const getApiTimeStatus = (time: number) => {
  if (time <= 200) return 'good'
  if (time <= 500) return 'needs-improvement'
  return 'poor'
}

const getMemoryStatus = (usage: number) => {
  if (usage <= 50) return 'good'
  if (usage <= 100) return 'needs-improvement'
  return 'poor'
}

const formatTrend = (value: number) => {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

const refreshMetrics = async () => {
  loading.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock data - replace with actual performance monitoring
    metrics.value = {
      LCP: Math.random() * 5000,
      FID: Math.random() * 400,
      CLS: Math.random() * 0.4,
      FCP: Math.random() * 4000,
      TTFB: Math.random() * 2000,
      avgApiTime: Math.random() * 800,
      memoryUsage: Math.random() * 150
    }
    
    trends.value = {
      last24h: (Math.random() - 0.5) * 20,
      last7d: (Math.random() - 0.5) * 50
    }
  } catch (error) {
    console.error('Failed to refresh metrics:', error)
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  refreshMetrics()
  
  if (props.autoRefresh) {
    setInterval(refreshMetrics, props.refreshInterval)
  }
})
</script>

<style scoped>
/* Any additional styling specific to this dashboard */
</style>