<template>
  <v-card
    variant="outlined"
    :class="['performance-metric', statusClass]"
    height="120"
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
        <div class="text-h5 font-weight-bold" :class="valueClass">
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
          :variant="status === 'good' ? 'elevated' : 'outlined'"
          size="x-small"
          :prepend-icon="statusIcon"
        >
          {{ statusText }}
        </v-chip>
        <span v-else class="text-caption text-medium-emphasis">
          {{ $t('performance.noData') }}
        </span>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';

  interface Props {
    icon: string;
    title: string;
    value?: number;
    unit?: string;
    status?: 'good' | 'needs-improvement' | 'poor';
    threshold?: { good: number; needsImprovement: number };
    subtitle?: string;
    decimalPlaces?: number;
  }

  const props = withDefaults(defineProps<Props>(), {
    unit: '',
    decimalPlaces: 0,
  });

  const { t } = useI18n();

  // Computed
  const formattedValue = computed(() => {
    if (props.value === undefined || props.value === null) {
      return '--';
    }

    const formatted = props.value.toFixed(props.decimalPlaces);
    return `${formatted}${props.unit}`;
  });

  const statusColor = computed(() => {
    switch (props.status) {
      case 'good':
        return 'success';
      case 'needs-improvement':
        return 'warning';
      case 'poor':
        return 'error';
      default:
        return 'grey';
    }
  });

  const statusClass = computed(() => {
    if (!props.status) return '';
    return `metric-${props.status}`;
  });

  const valueClass = computed(() => {
    if (!props.status) return 'text-medium-emphasis';
    return statusColor.value === 'success'
      ? 'text-success'
      : statusColor.value === 'warning'
        ? 'text-warning'
        : statusColor.value === 'error'
          ? 'text-error'
          : '';
  });

  const statusIcon = computed(() => {
    switch (props.status) {
      case 'good':
        return 'mdi-check';
      case 'needs-improvement':
        return 'mdi-alert';
      case 'poor':
        return 'mdi-close';
      default:
        return '';
    }
  });

  const statusText = computed(() => {
    switch (props.status) {
      case 'good':
        return t('performance.statusGood');
      case 'needs-improvement':
        return t('performance.statusNeedsImprovement');
      case 'poor':
        return t('performance.statusPoor');
      default:
        return '';
    }
  });
</script>

<style scoped>
  .performance-metric {
    transition: all 0.3s ease;
    position: relative;
  }

  .performance-metric:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .metric-good {
    border-left: 4px solid rgb(var(--v-theme-success));
  }

  .metric-needs-improvement {
    border-left: 4px solid rgb(var(--v-theme-warning));
  }

  .metric-poor {
    border-left: 4px solid rgb(var(--v-theme-error));
  }

  .metric-good::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: rgb(var(--v-theme-success));
    opacity: 0.3;
  }

  .metric-needs-improvement::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: rgb(var(--v-theme-warning));
    opacity: 0.3;
  }

  .metric-poor::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: rgb(var(--v-theme-error));
    opacity: 0.3;
  }
</style>
