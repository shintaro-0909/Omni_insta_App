/**
 * Stores barrel exports
 * Centralized export point for all Pinia stores
 */

// Core stores
export { useAuthStore } from './auth'
export { usePostsStore } from './posts'
export { useSchedulesStore } from './schedules'
export { useIgAccountsStore } from './igAccounts'

// Feature stores
export { useBillingStore } from './billing'
export { useGroupsStore } from './groups'
export { useProxiesStore } from './proxies'
export { usePreviewStore } from './preview'

// System stores
export { useErrorMonitoringStore } from './errorMonitoring'
export { usePerformanceStore } from './performance'
export { useLogsStore } from './logs'
export { usePlanLimitsStore } from './planLimits'
export { useCalendarStore } from './calendar'

// Store types
export type {
  Post,
  CreatePostData,
  UpdatePostData
} from './posts'

export type {
  Schedule,
  CreateScheduleData,
  UpdateScheduleData
} from './schedules'

export type {
  IgAccount,
  CreateIgAccountData
} from './igAccounts'