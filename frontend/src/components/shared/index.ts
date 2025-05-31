/**
 * Shared Dashboard Components Export
 * Centralized export for all reusable dashboard UI components
 */

export {
  DashboardCard,
  StatusCard,
  MetricCard,
  StatusChip,
  DashboardActionButton,
  ProgressMetric
} from './DashboardComponents.vue'

// Type definitions for the components
export interface MetricStatus {
  type: 'good' | 'needs-improvement' | 'poor' | 'warning' | 'error' | 'success'
  color: string
  icon: string
  text: string
}

export interface DashboardAction {
  icon: string
  tooltip: string
  handler: () => void
  loading?: boolean
  disabled?: boolean
}

export interface StatusCardData {
  title: string
  value: string | number
  subtitle?: string
  icon: string
  color?: string
}

export interface MetricCardData {
  icon: string
  title: string
  value?: number | string
  unit?: string
  status?: MetricStatus['type']
  subtitle?: string
  decimalPlaces?: number
}

// Helper functions
export const createMetricStatus = (
  type: MetricStatus['type'],
  customText?: string
): MetricStatus => {
  const statusMap: Record<MetricStatus['type'], Omit<MetricStatus, 'type'>> = {
    good: { color: 'success', icon: 'mdi-check', text: 'Good' },
    success: { color: 'success', icon: 'mdi-check-circle', text: 'Success' },
    'needs-improvement': { color: 'warning', icon: 'mdi-alert', text: 'Needs Improvement' },
    warning: { color: 'warning', icon: 'mdi-alert-triangle', text: 'Warning' },
    poor: { color: 'error', icon: 'mdi-close', text: 'Poor' },
    error: { color: 'error', icon: 'mdi-alert-circle', text: 'Error' }
  }

  return {
    type,
    ...statusMap[type],
    text: customText || statusMap[type].text
  }
}

export const createDashboardAction = (
  icon: string,
  tooltip: string,
  handler: () => void,
  options?: { loading?: boolean; disabled?: boolean }
): DashboardAction => ({
  icon,
  tooltip,
  handler,
  loading: options?.loading || false,
  disabled: options?.disabled || false
})

// Common dashboard patterns
export const DASHBOARD_COLORS = {
  primary: 'primary',
  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'info',
  grey: 'grey'
} as const

export const DASHBOARD_ICONS = {
  // Status icons
  active: 'mdi-check-circle',
  inactive: 'mdi-pause-circle',
  error: 'mdi-alert-circle',
  warning: 'mdi-alert',
  success: 'mdi-check',
  info: 'mdi-information',
  
  // Action icons
  refresh: 'mdi-refresh',
  settings: 'mdi-cog',
  export: 'mdi-export',
  download: 'mdi-download',
  upload: 'mdi-upload',
  edit: 'mdi-pencil',
  delete: 'mdi-delete',
  
  // Dashboard specific
  dashboard: 'mdi-view-dashboard',
  performance: 'mdi-speedometer',
  accessibility: 'mdi-wheelchair-accessibility',
  security: 'mdi-shield-check',
  ai: 'mdi-brain',
  monitoring: 'mdi-monitor-dashboard',
  
  // Metrics
  timer: 'mdi-timer-outline',
  cursor: 'mdi-cursor-default-click',
  view: 'mdi-view-grid-outline',
  flash: 'mdi-flash',
  download_speed: 'mdi-download',
  api: 'mdi-api'
} as const

export type DashboardColor = keyof typeof DASHBOARD_COLORS
export type DashboardIcon = keyof typeof DASHBOARD_ICONS