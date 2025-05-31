<!--
  Unified Dashboard Components
  Common UI patterns extracted from dashboard components
  
  Components:
  - DashboardCard: Standard card wrapper with title and actions
  - StatusCard: Status display with icon and text  
  - MetricCard: Numerical metric display with status
  - StatusChip: Status indicator chip
  - ActionButton: Dashboard action button
  - ProgressMetric: Progress bar with label
-->

<template>
  <!-- This is a collection of reusable dashboard components -->
  <div class="dashboard-components-collection">
    <!-- Example usage shown in PerformanceDashboardRefactored.vue -->
  </div>
</template>

<script setup lang="ts">
// This file serves as the source for dashboard component definitions
// Individual components are imported from their separate files
</script>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import { useI18n } from 'vue-i18n'

// Base Dashboard Card Component
export const DashboardCard = defineComponent({
  name: 'DashboardCard',
  props: {
    title: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: ''
    },
    iconColor: {
      type: String,
      default: 'primary'
    },
    elevation: {
      type: [Number, String],
      default: 2
    },
    loading: {
      type: Boolean,
      default: false
    },
    variant: {
      type: String,
      default: 'elevated'
    },
    color: {
      type: String,
      default: ''
    }
  },
  template: `
    <v-card
      class="dashboard-card"
      :elevation="elevation"
      :variant="variant"
      :color="color"
      :loading="loading"
    >
      <v-card-title class="d-flex align-center">
        <v-icon v-if="icon" class="mr-2" :color="iconColor">
          {{ icon }}
        </v-icon>
        <span>{{ title }}</span>
        
        <v-spacer />
        
        <slot name="actions"></slot>
      </v-card-title>
      
      <v-card-text>
        <slot></slot>
      </v-card-text>
      
      <v-card-actions v-if="$slots.footer">
        <slot name="footer"></slot>
      </v-card-actions>
    </v-card>
  `
})

// Status Card Component
export const StatusCard = defineComponent({
  name: 'StatusCard',
  props: {
    title: {
      type: String,
      required: true
    },
    value: {
      type: [String, Number],
      required: true
    },
    subtitle: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      required: true
    },
    color: {
      type: String,
      default: 'primary'
    },
    variant: {
      type: String,
      default: 'tonal'
    },
    size: {
      type: String,
      default: 'default'
    }
  },
  setup(props) {
    const iconSize = computed(() => {
      switch (props.size) {
        case 'small': return 'default'
        case 'large': return 'x-large'
        default: return 'large'
      }
    })

    return { iconSize }
  },
  template: `
    <v-card class="status-card" :color="color" :variant="variant">
      <v-card-text>
        <div class="d-flex align-center">
          <v-icon :size="iconSize" class="me-3">
            {{ icon }}
          </v-icon>
          <div>
            <div class="text-h6">{{ value }}</div>
            <div class="text-caption">{{ title }}</div>
            <div v-if="subtitle" class="text-caption text-medium-emphasis">
              {{ subtitle }}
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  `
})

// Metric Card Component (Enhanced version of PerformanceMetric)
export const MetricCard = defineComponent({
  name: 'MetricCard',
  props: {
    icon: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    value: {
      type: [Number, String],
      default: undefined
    },
    unit: {
      type: String,
      default: ''
    },
    status: {
      type: String as PropType<'good' | 'needs-improvement' | 'poor' | 'warning' | 'error' | 'success'>,
      default: undefined
    },
    subtitle: {
      type: String,
      default: ''
    },
    decimalPlaces: {
      type: Number,
      default: 0
    },
    height: {
      type: [Number, String],
      default: 120
    },
    variant: {
      type: String,
      default: 'outlined'
    }
  },
  setup(props) {
    const { t } = useI18n()

    const formattedValue = computed(() => {
      if (props.value === undefined || props.value === null) {
        return '--'
      }
      
      if (typeof props.value === 'string') {
        return props.value
      }
      
      const formatted = props.value.toFixed(props.decimalPlaces)
      return `${formatted}${props.unit}`
    })

    const statusColor = computed(() => {
      switch (props.status) {
        case 'good':
        case 'success':
          return 'success'
        case 'needs-improvement':
        case 'warning':
          return 'warning'
        case 'poor':
        case 'error':
          return 'error'
        default:
          return 'grey'
      }
    })

    const statusClass = computed(() => {
      if (!props.status) return ''
      return `metric-${props.status}`
    })

    const valueClass = computed(() => {
      if (!props.status) return 'text-medium-emphasis'
      return `text-${statusColor.value}`
    })

    const statusIcon = computed(() => {
      switch (props.status) {
        case 'good':
        case 'success':
          return 'mdi-check'
        case 'needs-improvement':
        case 'warning':
          return 'mdi-alert'
        case 'poor':
        case 'error':
          return 'mdi-close'
        default:
          return ''
      }
    })

    const statusText = computed(() => {
      switch (props.status) {
        case 'good':
        case 'success':
          return t('performance.statusGood', 'Good')
        case 'needs-improvement':
        case 'warning':
          return t('performance.statusNeedsImprovement', 'Needs Improvement')
        case 'poor':
        case 'error':
          return t('performance.statusPoor', 'Poor')
        default:
          return ''
      }
    })

    return {
      formattedValue,
      statusColor,
      statusClass,
      valueClass,
      statusIcon,
      statusText
    }
  },
  template: `
    <v-card 
      :variant="variant"
      :class="['metric-card', statusClass]"
      :height="height"
    >
      <v-card-text class="d-flex flex-column justify-space-between pa-3 h-100">
        <!-- Header -->
        <div class="d-flex align-center mb-2">
          <v-icon :color="statusColor" class="mr-2" size="small">
            {{ icon }}
          </v-icon>
          <span class="text-caption font-weight-medium">{{ title }}</span>
        </div>
        
        <!-- Value -->
        <div class="text-center my-2">
          <div :class="['text-h5 font-weight-bold', valueClass]">
            {{ formattedValue }}
          </div>
          <div v-if="subtitle" class="text-caption text-medium-emphasis">
            {{ subtitle }}
          </div>
        </div>
        
        <!-- Status indicator -->
        <div class="d-flex align-center justify-center">
          <v-chip
            v-if="status"
            :color="statusColor"
            :variant="status === 'good' || status === 'success' ? 'elevated' : 'outlined'"
            size="x-small"
            :prepend-icon="statusIcon"
          >
            {{ statusText }}
          </v-chip>
          <span v-else class="text-caption text-medium-emphasis">
            No Data
          </span>
        </div>
      </v-card-text>
    </v-card>
  `
})

// Status Chip Component
export const StatusChip = defineComponent({
  name: 'StatusChip',
  props: {
    status: {
      type: String as PropType<'active' | 'inactive' | 'error' | 'warning' | 'success' | 'info'>,
      required: true
    },
    text: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'default'
    },
    variant: {
      type: String,
      default: 'elevated'
    }
  },
  setup(props) {
    const { t } = useI18n()

    const chipColor = computed(() => {
      switch (props.status) {
        case 'active':
        case 'success':
          return 'success'
        case 'inactive':
          return 'grey'
        case 'error':
          return 'error'
        case 'warning':
          return 'warning'
        case 'info':
          return 'info'
        default:
          return 'primary'
      }
    })

    const chipIcon = computed(() => {
      if (props.icon) return props.icon
      
      switch (props.status) {
        case 'active':
        case 'success':
          return 'mdi-check-circle'
        case 'inactive':
          return 'mdi-pause-circle'
        case 'error':
          return 'mdi-alert-circle'
        case 'warning':
          return 'mdi-alert'
        case 'info':
          return 'mdi-information'
        default:
          return ''
      }
    })

    const chipText = computed(() => {
      if (props.text) return props.text
      
      switch (props.status) {
        case 'active':
          return t('status.active', 'Active')
        case 'inactive':
          return t('status.inactive', 'Inactive')
        case 'error':
          return t('status.error', 'Error')
        case 'warning':
          return t('status.warning', 'Warning')
        case 'success':
          return t('status.success', 'Success')
        case 'info':
          return t('status.info', 'Info')
        default:
          return ''
      }
    })

    return {
      chipColor,
      chipIcon,
      chipText
    }
  },
  template: `
    <v-chip
      :color="chipColor"
      :variant="variant"
      :size="size"
      :prepend-icon="chipIcon"
    >
      {{ chipText }}
    </v-chip>
  `
})

// Dashboard Action Button Component
export const DashboardActionButton = defineComponent({
  name: 'DashboardActionButton',
  props: {
    icon: {
      type: String,
      required: true
    },
    tooltip: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: ''
    },
    variant: {
      type: String,
      default: 'text'
    },
    size: {
      type: String,
      default: 'small'
    },
    loading: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click'],
  setup(props, { emit }) {
    const handleClick = () => {
      if (!props.disabled && !props.loading) {
        emit('click')
      }
    }

    return { handleClick }
  },
  template: `
    <v-tooltip v-if="tooltip" :text="tooltip" location="bottom">
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn
          v-bind="activatorProps"
          :icon="icon"
          :variant="variant"
          :size="size"
          :color="color"
          :loading="loading"
          :disabled="disabled"
          @click="handleClick"
        />
      </template>
    </v-tooltip>
    <v-btn
      v-else
      :icon="icon"
      :variant="variant"
      :size="size"
      :color="color"
      :loading="loading"
      :disabled="disabled"
      @click="handleClick"
    />
  `
})

// Progress Metric Component
export const ProgressMetric = defineComponent({
  name: 'ProgressMetric',
  props: {
    title: {
      type: String,
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      default: 100
    },
    unit: {
      type: String,
      default: '%'
    },
    color: {
      type: String,
      default: 'primary'
    },
    height: {
      type: [Number, String],
      default: 6
    },
    showValue: {
      type: Boolean,
      default: true
    },
    icon: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const percentage = computed(() => {
      return Math.round((props.value / props.max) * 100)
    })

    const displayValue = computed(() => {
      return `${props.value}${props.unit}`
    })

    return {
      percentage,
      displayValue
    }
  },
  template: `
    <div class="progress-metric">
      <div class="d-flex align-center mb-1">
        <v-icon v-if="icon" class="mr-2" size="small">
          {{ icon }}
        </v-icon>
        <span class="text-caption font-weight-medium">{{ title }}</span>
        <v-spacer />
        <span v-if="showValue" class="text-caption">{{ displayValue }}</span>
      </div>
      <v-progress-linear
        :value="percentage"
        :color="color"
        :height="height"
        rounded
      />
    </div>
  `
})

</script>

<style scoped>
/* Dashboard Card Styles */
.dashboard-card {
  transition: all 0.3s ease;
}

.dashboard-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Status Card Styles */
.status-card {
  height: 100%;
}

/* Metric Card Styles */
.metric-card {
  transition: all 0.3s ease;
  position: relative;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.metric-good {
  border-left: 4px solid rgb(var(--v-theme-success));
}

.metric-needs-improvement,
.metric-warning {
  border-left: 4px solid rgb(var(--v-theme-warning));
}

.metric-poor,
.metric-error {
  border-left: 4px solid rgb(var(--v-theme-error));
}

.metric-success {
  border-left: 4px solid rgb(var(--v-theme-success));
}

.metric-good::before,
.metric-success::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: rgb(var(--v-theme-success));
  opacity: 0.3;
}

.metric-needs-improvement::before,
.metric-warning::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: rgb(var(--v-theme-warning));
  opacity: 0.3;
}

.metric-poor::before,
.metric-error::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: rgb(var(--v-theme-error));
  opacity: 0.3;
}

/* Progress Metric Styles */
.progress-metric {
  padding: 8px 0;
}

/* Collection container */
.dashboard-components-collection {
  display: none; /* This file is for component definitions only */
}
</style>