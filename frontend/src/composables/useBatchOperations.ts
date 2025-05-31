/**
 * Frontend Batch Operations Composable
 * Optimizes API calls by batching operations and reducing request frequency
 */

import { ref, computed, watch, onUnmounted } from 'vue'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/services/firebase'
import { measureAsync } from '@/utils/performance'

interface BatchOperation<T, R> {
  id: string
  data: T
  priority: 'high' | 'medium' | 'low'
  createdAt: number
  resolve: (result: R) => void
  reject: (error: Error) => void
}

interface BatchConfig {
  maxBatchSize: number
  maxWaitTime: number
  retryAttempts: number
  retryDelay: number
}

interface BatchStats {
  totalOperations: number
  batchesSent: number
  averageBatchSize: number
  averageResponseTime: number
  errorRate: number
  lastBatchTime: number | null
}

class FrontendBatchProcessor<T, R> {
  private queue: BatchOperation<T, R>[] = []
  private processing = false
  private stats: BatchStats = {
    totalOperations: 0,
    batchesSent: 0,
    averageBatchSize: 0,
    averageResponseTime: 0,
    errorRate: 0,
    lastBatchTime: null
  }
  
  private config: BatchConfig
  private processorFn: (items: T[]) => Promise<R[]>
  private timer: NodeJS.Timeout | null = null

  constructor(
    config: BatchConfig,
    processorFn: (items: T[]) => Promise<R[]>
  ) {
    this.config = config
    this.processorFn = processorFn
    this.startProcessingLoop()
  }

  async add(data: T, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<R> {
    return new Promise((resolve, reject) => {
      const operation: BatchOperation<T, R> = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        data,
        priority,
        createdAt: Date.now(),
        resolve,
        reject
      }

      this.queue.push(operation)
      this.sortQueueByPriority()

      // Trigger immediate processing if queue is full
      if (this.queue.length >= this.config.maxBatchSize) {
        this.processQueue()
      }
    })
  }

  async flush(): Promise<void> {
    await this.processQueue()
  }

  getStats(): BatchStats {
    return { ...this.stats }
  }

  clear(): void {
    this.queue.forEach(op => op.reject(new Error('Queue cleared')))
    this.queue = []
    this.processing = false
  }

  destroy(): void {
    this.clear()
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  private startProcessingLoop(): void {
    this.timer = setInterval(() => {
      if (!this.processing && this.shouldProcess()) {
        this.processQueue()
      }
    }, Math.min(this.config.maxWaitTime / 2, 5000))
  }

  private shouldProcess(): boolean {
    if (this.queue.length === 0) return false
    
    const now = Date.now()
    const oldestOperation = this.queue[0]
    
    return (
      this.queue.length >= this.config.maxBatchSize ||
      (now - oldestOperation.createdAt) >= this.config.maxWaitTime ||
      this.queue.some(op => op.priority === 'high' && (now - op.createdAt) >= 5000)
    )
  }

  private sortQueueByPriority(): void {
    this.queue.sort((a, b) => {
      const priorityWeights = { high: 3, medium: 2, low: 1 }
      
      if (priorityWeights[a.priority] !== priorityWeights[b.priority]) {
        return priorityWeights[b.priority] - priorityWeights[a.priority]
      }
      
      return a.createdAt - b.createdAt
    })
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return

    this.processing = true
    const startTime = Date.now()

    try {
      const batchSize = Math.min(this.queue.length, this.config.maxBatchSize)
      const batch = this.queue.splice(0, batchSize)
      
      const dataItems = batch.map(op => op.data)
      
      // Process the batch
      const results = await this.processorFn(dataItems)
      
      // Handle results
      batch.forEach((operation, index) => {
        if (index < results.length) {
          operation.resolve(results[index])
        } else {
          operation.reject(new Error('No result for this operation'))
        }
      })

      // Update stats
      this.updateStats(batch.length, Date.now() - startTime, false)

    } catch (error) {
      // Handle failed batch
      const batch = this.queue.splice(0, Math.min(this.queue.length, this.config.maxBatchSize))
      
      batch.forEach(operation => {
        operation.reject(error instanceof Error ? error : new Error('Batch processing failed'))
      })

      this.updateStats(batch.length, Date.now() - startTime, true)
    } finally {
      this.processing = false
    }
  }

  private updateStats(batchSize: number, responseTime: number, isError: boolean): void {
    this.stats.totalOperations += batchSize
    this.stats.batchesSent++
    this.stats.lastBatchTime = Date.now()
    
    this.stats.averageBatchSize = (
      (this.stats.averageBatchSize * (this.stats.batchesSent - 1) + batchSize) / 
      this.stats.batchesSent
    )
    
    this.stats.averageResponseTime = (
      (this.stats.averageResponseTime * (this.stats.batchesSent - 1) + responseTime) / 
      this.stats.batchesSent
    )
    
    if (isError) {
      this.stats.errorRate = (this.stats.errorRate * (this.stats.batchesSent - 1) + 1) / this.stats.batchesSent
    } else {
      this.stats.errorRate = (this.stats.errorRate * (this.stats.batchesSent - 1)) / this.stats.batchesSent
    }
  }
}

export function useBatchOperations() {
  // Batch processors for different operation types
  const processors = ref(new Map<string, FrontendBatchProcessor<any, any>>())
  const stats = ref<Record<string, BatchStats>>({})
  const isProcessing = ref(false)
  const error = ref<string | null>(null)

  // Create or get batch processor
  function createBatchProcessor<T, R>(
    key: string,
    config: Partial<BatchConfig>,
    functionName: string
  ): FrontendBatchProcessor<T, R> {
    if (processors.value.has(key)) {
      return processors.value.get(key)!
    }

    const defaultConfig: BatchConfig = {
      maxBatchSize: 10,
      maxWaitTime: 5000,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config
    }

    const processor = new FrontendBatchProcessor<T, R>(
      defaultConfig,
      async (items: T[]) => {
        const batchFn = httpsCallable(functions, functionName)
        const result = await measureAsync(
          `batch-${functionName}`,
          () => batchFn({ operations: items }),
          { batchSize: items.length }
        )
        
        const data = result.data as any
        if (data.success) {
          return data.results || []
        } else {
          throw new Error(data.message || 'Batch operation failed')
        }
      }
    )

    processors.value.set(key, processor)
    return processor
  }

  // Batch post operations
  const batchPostOperations = async (
    operations: Array<{
      type: 'create' | 'update' | 'delete'
      data?: any
      postId?: string
    }>,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ) => {
    const processor = createBatchProcessor<any, any>(
      'posts',
      { maxBatchSize: 20, maxWaitTime: 3000 },
      'batchPostOperationsOptimized'
    )

    const promises = operations.map(op => processor.add(op, priority))
    return Promise.all(promises)
  }

  // Batch schedule operations
  const batchScheduleOperations = async (
    operations: Array<{
      type: 'create' | 'update' | 'delete'
      data?: any
      scheduleId?: string
    }>,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ) => {
    const processor = createBatchProcessor<any, any>(
      'schedules',
      { maxBatchSize: 15, maxWaitTime: 5000 },
      'batchScheduleOperations'
    )

    const promises = operations.map(op => processor.add(op, priority))
    return Promise.all(promises)
  }

  // Batch Instagram account operations
  const batchAccountOperations = async (
    operations: Array<{
      type: 'refresh' | 'validate' | 'update'
      accountId: string
      data?: any
    }>,
    priority: 'high' | 'medium' | 'low' = 'low'
  ) => {
    const processor = createBatchProcessor<any, any>(
      'accounts',
      { maxBatchSize: 5, maxWaitTime: 10000 },
      'batchAccountOperations'
    )

    const promises = operations.map(op => processor.add(op, priority))
    return Promise.all(promises)
  }

  // Batch execution log retrieval
  const batchLogOperations = async (
    requests: Array<{
      type: 'get' | 'filter'
      filters?: any
      limit?: number
    }>,
    priority: 'high' | 'medium' | 'low' = 'low'
  ) => {
    const processor = createBatchProcessor<any, any>(
      'logs',
      { maxBatchSize: 25, maxWaitTime: 2000 },
      'batchLogOperations'
    )

    const promises = requests.map(req => processor.add(req, priority))
    return Promise.all(promises)
  }

  // Flush all pending operations
  const flushAllBatches = async () => {
    const flushPromises = Array.from(processors.value.values()).map(processor => 
      processor.flush()
    )
    await Promise.all(flushPromises)
  }

  // Get stats for all processors
  const getAllStats = computed(() => {
    const allStats: Record<string, BatchStats> = {}
    
    for (const [key, processor] of processors.value.entries()) {
      allStats[key] = processor.getStats()
    }
    
    return allStats
  })

  // Clear all processors
  const clearAllBatches = () => {
    processors.value.forEach(processor => processor.clear())
    stats.value = {}
    error.value = null
  }

  // Cleanup on unmount
  onUnmounted(() => {
    processors.value.forEach(processor => processor.destroy())
    processors.value.clear()
  })

  // Watch for processing status
  watch(
    () => Array.from(processors.value.values()).some(p => (p as any).processing),
    (newProcessing) => {
      isProcessing.value = newProcessing
    }
  )

  return {
    // State
    isProcessing,
    error,
    stats: getAllStats,

    // Batch operations
    batchPostOperations,
    batchScheduleOperations,
    batchAccountOperations,
    batchLogOperations,

    // Control functions
    flushAllBatches,
    clearAllBatches,
    
    // Utils
    createBatchProcessor
  }
}

// Utility function for optimized bulk operations
export function useBulkOperations() {
  const { batchPostOperations, batchScheduleOperations } = useBatchOperations()

  // Bulk create posts
  const bulkCreatePosts = async (postsData: any[]) => {
    const operations = postsData.map(data => ({
      type: 'create' as const,
      data
    }))
    
    return batchPostOperations(operations, 'high')
  }

  // Bulk update schedules
  const bulkUpdateSchedules = async (updates: Array<{ scheduleId: string; data: any }>) => {
    const operations = updates.map(({ scheduleId, data }) => ({
      type: 'update' as const,
      scheduleId,
      data
    }))
    
    return batchScheduleOperations(operations, 'medium')
  }

  // Bulk delete posts
  const bulkDeletePosts = async (postIds: string[]) => {
    const operations = postIds.map(postId => ({
      type: 'delete' as const,
      postId
    }))
    
    return batchPostOperations(operations, 'medium')
  }

  return {
    bulkCreatePosts,
    bulkUpdateSchedules,
    bulkDeletePosts
  }
}

// Performance monitoring for batch operations
export function useBatchPerformance() {
  const performanceMetrics = ref({
    apiCallsReduced: 0,
    timesSaved: 0,
    bandwidthSaved: 0,
    costsReduced: 0
  })

  const updateMetrics = (batchSize: number, responseTime: number) => {
    // Estimate API calls reduced (batch vs individual calls)
    const apiCallsReduced = Math.max(0, batchSize - 1)
    performanceMetrics.value.apiCallsReduced += apiCallsReduced

    // Estimate time saved (assuming 200ms per individual call)
    const estimatedIndividualTime = batchSize * 200
    const timeSaved = Math.max(0, estimatedIndividualTime - responseTime)
    performanceMetrics.value.timesSaved += timeSaved

    // Estimate bandwidth saved (rough calculation)
    const bandwidthSaved = apiCallsReduced * 1024 // 1KB per avoided call
    performanceMetrics.value.bandwidthSaved += bandwidthSaved

    // Estimate cost savings (rough calculation)
    const costPerCall = 0.0001 // $0.0001 per call
    const costSaved = apiCallsReduced * costPerCall
    performanceMetrics.value.costsReduced += costSaved
  }

  return {
    metrics: performanceMetrics,
    updateMetrics
  }
}