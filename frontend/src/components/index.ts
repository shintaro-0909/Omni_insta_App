/**
 * Components barrel exports
 * Centralized export point for all Vue components
 */

// Form components
export { default as AddAccountDialog } from './forms/AddAccountDialog.vue';
export { default as GroupFormDialog } from './forms/GroupFormDialog.vue';
export { default as PostFormDialog } from './forms/PostFormDialog.vue';
export { default as ProxyFormDialog } from './forms/ProxyFormDialog.vue';
export { default as ScheduleFormDialog } from './forms/ScheduleFormDialog.vue';
export { default as SimpleScheduleFormDialog } from './forms/SimpleScheduleFormDialog.vue';

// Widget components (core functionality only)
// export { default as AIAdaptationDashboard } from './widgets/AIAdaptationDashboard.vue' // temporarily disabled
// export { default as AIPredictionDashboard } from './widgets/AIPredictionDashboard.vue' // temporarily disabled
// export { default as AccessibilityDashboard } from './widgets/AccessibilityDashboard.vue' // temporarily disabled
// export { default as MonitoringDashboard } from './widgets/MonitoringDashboard.vue' // temporarily disabled
export { default as PerformanceDashboard } from './widgets/PerformanceDashboard.vue';
// export { default as SecurityDashboard } from './widgets/SecurityDashboard.vue' // temporarily disabled
export { default as UsageDashboard } from './widgets/UsageDashboard.vue';

// Common components
export { default as InstagramPreview } from './common/InstagramPreview.vue';
export { default as LanguageSwitcher } from './common/LanguageSwitcher.vue';
export { default as PerformanceMetric } from './common/PerformanceMetric.vue';
export { default as PostViewDialog } from './common/PostViewDialog.vue';
export { default as ScheduleViewDialog } from './common/ScheduleViewDialog.vue';

// Demo components
export { default as DemoHero } from './demos/shared/DemoHero.vue';
export { default as DemoNavigation } from './demos/shared/DemoNavigation.vue';

// Interaction components (temporarily disabled for release)
// export { default as AdaptiveGrid } from './interactions/AdaptiveGrid.vue'
// export { default as GestureZone } from './interactions/GestureZone.vue'
// export { default as PredictiveLoader } from './interactions/PredictiveLoader.vue'
// export { default as SpatialContainer } from './interactions/SpatialContainer.vue'

// Log components
export { default as LogsFilters } from './logs/LogsFilters.vue';
export { default as LogsHeader } from './logs/LogsHeader.vue';
export { default as LogsStatsCards } from './logs/LogsStatsCards.vue';
export { default as LogsTable } from './logs/LogsTable.vue';

// Shared components
export { default as ComponentsTest } from './shared/ComponentsTest.vue';
// export { default as DashboardComponents } from './shared/DashboardComponents.vue' // temporarily disabled
export { default as PerformanceDashboardRefactored } from './shared/PerformanceDashboardRefactored.vue';
