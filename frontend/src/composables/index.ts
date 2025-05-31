/**
 * Composables barrel exports
 * Centralized export point for all Vue composables
 */

// API-related composables
export { default as useBatchOperations } from './api/useBatchOperations'
export { default as useOptimizedFetch } from './api/useOptimizedFetch'
export { default as usePersistedCache } from './api/usePersistedCache'

// UI-related composables
export { default as useAdaptiveLayout } from './ui/useAdaptiveLayout'
export { default as useAdvancedGestures } from './ui/useAdvancedGestures'
export { default as useIntelligentAnimations } from './ui/useIntelligentAnimations'
export { default as usePredictiveUI } from './ui/usePredictiveUI'
export { default as useSpatialNavigation } from './ui/useSpatialNavigation'
export { default as useUniversalAccessibility } from './ui/useUniversalAccessibility'

// Business logic composables
export { default as useAIAdaptation } from './business/useAIAdaptation'
export { default as useAdaptiveContentDelivery } from './business/useAdaptiveContentDelivery'
export { default as useAdvancedMonitoring } from './business/useAdvancedMonitoring'
export { default as useCrossDeviceState } from './business/useCrossDeviceState'
export { default as useImageOptimization } from './business/useImageOptimization'
export { default as useImageUpload } from './business/useImageUpload'
export { default as useServiceWorker } from './business/useServiceWorker'