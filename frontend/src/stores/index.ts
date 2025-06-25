/**
 * Stores barrel exports
 * Centralized export point for all Pinia stores
 */

// Core stores
export { useAuthStore } from './auth';
export { usePostsStore } from './posts';
export { useSchedulesStore } from './schedules';
export { useIgAccountsStore } from './igAccounts';

// Feature stores
export { useBillingStore } from './billing';
export { usePricingSystemStore } from './pricingSystem';
export { useFeedbackStore } from './feedback';
export { useGroupsStore } from './groups';
export { useProxiesStore } from './proxies';
export { usePreviewStore } from './preview';

// System stores
export { useErrorMonitoringStore } from './errorMonitoring';
export { usePerformanceStore } from './performance';
export { useLogsStore } from './logs';
export { usePlanLimitsStore } from './planLimits';
export { useNotificationsStore } from './notifications';
export { useDialogsStore } from './dialogs';
export { useUIStore } from './ui';
// export { useCalendarStore } from './calendar' // temporarily disabled

// Store types
export type { Post, CreatePostData, UpdatePostData } from './posts';

export type {
  Schedule,
  CreateScheduleData,
  UpdateScheduleData,
  ScheduleType,
  ScheduleStatus,
  RepeatRule,
} from './schedules';

export type { IGAccount, AddAccountData } from './igAccounts';

export type { Group, GroupStats } from './groups';

export type { Proxy, ProxyGroup, ProxyStats } from './proxies';

export type { ExecutionLog, LogStats, DailyLogStats, LogFilters } from './logs';

// export type {
//   CalendarEvent,
//   CalendarSettings
// } from './calendar' // temporarily disabled

export type { PerformanceMetrics, PerformanceThresholds } from './performance';

export type { PreviewSettings, PreviewPost, PreviewAccount } from './preview';

export type { 
  Notification, 
  NotificationOptions, 
  NotificationType 
} from './notifications';

export type { 
  ConfirmDialog, 
  ConfirmOptions 
} from './dialogs';

export type { FeedbackItem } from './feedback';
