/**
 * Composables barrel exports
 * Centralized export point for all Vue composables
 */

// Core UI composables
export { useNotification } from './useNotification';
export { useConfirm } from './useConfirm';

// Business logic composables (active)
export { useImageUpload } from './business/useImageUpload';
export { useFirestore } from './useFirestore';
export { useStorage } from './useStorage';

// API-related composables (temporarily disabled for release)
// export { useBatchOperations } from './api/useBatchOperations'
// export { useOptimizedFetch } from './api/useOptimizedFetch'
// export { usePersistedCache } from './api/usePersistedCache'

// UI-related composables (temporarily disabled for release)
// export { useAdaptiveLayout } from './ui/useAdaptiveLayout'
// export { useAdvancedGestures } from './ui/useAdvancedGestures'
// export { useIntelligentAnimations } from './ui/useIntelligentAnimations'
// export { usePredictiveUI } from './ui/usePredictiveUI'
// export { useSpatialNavigation } from './ui/useSpatialNavigation'
// export { useUniversalAccessibility } from './ui/useUniversalAccessibility'

// Business logic composables (temporarily disabled for release)
// export { useAIAdaptation } from './business/useAIAdaptation'
// export { useAdaptiveContentDelivery } from './business/useAdaptiveContentDelivery'
// export { useAdvancedMonitoring } from './business/useAdvancedMonitoring'
// export { useCrossDeviceState } from './business/useCrossDeviceState'
// export { useImageOptimization } from './business/useImageOptimization'
// export { useServiceWorker } from './business/useServiceWorker'
