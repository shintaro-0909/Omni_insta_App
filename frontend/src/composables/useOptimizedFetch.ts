/**
 * Optimized data fetching composable for Omniy Instagram Scheduler
 * Provides caching, request deduplication, and performance optimization
 */

import { ref, computed, watch, onUnmounted, type Ref } from 'vue'
import { measureAsync } from '@/utils/performance'

interface FetchOptions {
  immediate?: boolean
  cache?: boolean
  cacheTime?: number
  retries?: number
  retryDelay?: number
  timeout?: number
  staleWhileRevalidate?: boolean
  dedupe?: boolean
}

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
  loading: boolean
}

interface FetchState<T> {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<Error | null>
  execute: () => Promise<T | null>
  refresh: () => Promise<T | null>
  clear: () => void
}

// Global cache and request deduplication
const cache = new Map<string, CacheEntry<any>>()
const pendingRequests = new Map<string, Promise<any>>()

// Cleanup expired cache entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of cache.entries()) {
    if (entry.expiresAt < now) {
      cache.delete(key)
    }
  }
}, 60000) // Cleanup every minute

function generateCacheKey(url: string, options?: RequestInit): string {
  const optionsStr = options ? JSON.stringify(options) : ''
  return `${url}:${optionsStr}`
}

function isStale<T>(entry: CacheEntry<T>): boolean {
  return Date.now() > entry.expiresAt
}

export function useOptimizedFetch<T = any>(
  url: string | (() => string),
  fetchOptions: RequestInit = {},
  options: FetchOptions = {}
): FetchState<T> {
  const {
    immediate = true,
    cache: enableCache = true,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    retries = 3,
    retryDelay = 1000,
    timeout = 30000,
    staleWhileRevalidate = true,
    dedupe = true
  } = options

  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const currentUrl = computed(() => {
    return typeof url === 'function' ? url() : url
  })

  const cacheKey = computed(() => {
    return generateCacheKey(currentUrl.value, fetchOptions)
  })

  async function fetchWithRetry(
    fetchUrl: string,
    options: RequestInit,
    attempt = 1
  ): Promise<T> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(fetchUrl, {
        ...options,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      return result
    } catch (err) {
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
        return fetchWithRetry(fetchUrl, options, attempt + 1)
      }
      throw err
    }
  }

  async function executeFetch(): Promise<T | null> {
    const key = cacheKey.value
    const fetchUrl = currentUrl.value

    if (!fetchUrl) {
      return null
    }

    try {
      loading.value = true
      error.value = null

      // Check cache first
      if (enableCache && cache.has(key)) {
        const cachedEntry = cache.get(key)!
        
        if (!isStale(cachedEntry)) {
          // Return fresh cache data immediately
          data.value = cachedEntry.data
          loading.value = false
          return cachedEntry.data
        } else if (staleWhileRevalidate && !cachedEntry.loading) {
          // Return stale data immediately, fetch fresh data in background
          data.value = cachedEntry.data
          loading.value = false
          
          // Mark as loading to prevent concurrent background fetches
          cachedEntry.loading = true
          
          // Background fetch
          fetchWithRetry(fetchUrl, fetchOptions)
            .then(result => {
              data.value = result
              cache.set(key, {
                data: result,
                timestamp: Date.now(),
                expiresAt: Date.now() + cacheTime,
                loading: false
              })
            })
            .catch(err => {
              console.warn('Background fetch failed:', err)
              cachedEntry.loading = false
            })
          
          return cachedEntry.data
        }
      }

      // Check for pending requests (deduplication)
      if (dedupe && pendingRequests.has(key)) {
        const result = await pendingRequests.get(key)!
        data.value = result
        loading.value = false
        return result
      }

      // Create new request
      const fetchPromise = measureAsync(
        `fetch-${fetchUrl}`,
        () => fetchWithRetry(fetchUrl, fetchOptions),
        { url: fetchUrl, cached: false }
      )

      if (dedupe) {
        pendingRequests.set(key, fetchPromise)
      }

      const result = await fetchPromise

      // Update cache
      if (enableCache) {
        cache.set(key, {
          data: result,
          timestamp: Date.now(),
          expiresAt: Date.now() + cacheTime,
          loading: false
        })
      }

      // Clean up pending request
      if (dedupe) {
        pendingRequests.delete(key)
      }

      data.value = result
      return result

    } catch (err) {
      error.value = err as Error
      
      // Clean up pending request on error
      if (dedupe) {
        pendingRequests.delete(key)
      }

      // If we have stale cache data, return it on error
      if (enableCache && cache.has(key)) {
        const cachedEntry = cache.get(key)!
        data.value = cachedEntry.data
        return cachedEntry.data
      }

      throw err
    } finally {
      loading.value = false
    }
  }

  async function refresh(): Promise<T | null> {
    // Clear cache for this key
    if (enableCache) {
      cache.delete(cacheKey.value)
    }
    
    return executeFetch()
  }

  function clear(): void {
    data.value = null
    error.value = null
    loading.value = false
    
    if (enableCache) {
      cache.delete(cacheKey.value)
    }
  }

  // Watch URL changes and refetch
  watch(
    currentUrl,
    (newUrl, oldUrl) => {
      if (newUrl && newUrl !== oldUrl) {
        executeFetch()
      }
    },
    { immediate }
  )

  // Cleanup on unmount
  onUnmounted(() => {
    // Cancel any pending requests
    const key = cacheKey.value
    if (pendingRequests.has(key)) {
      pendingRequests.delete(key)
    }
  })

  return {
    data,
    loading,
    error,
    execute: executeFetch,
    refresh,
    clear
  }
}

// Specialized composables for common use cases
export function useOptimizedQuery<T = any>(
  queryFn: () => Promise<T>,
  dependencies: Ref<any>[] = [],
  options: Omit<FetchOptions, 'immediate'> & { immediate?: boolean } = {}
): FetchState<T> {
  const { immediate = true, ...fetchOptions } = options
  
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  async function execute(): Promise<T | null> {
    try {
      loading.value = true
      error.value = null
      
      const result = await measureAsync(
        'optimized-query',
        queryFn,
        { dependencies: dependencies.map(d => d.value) }
      )
      
      data.value = result
      return result
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  // Watch dependencies and re-execute
  if (dependencies.length > 0) {
    watch(
      dependencies,
      () => {
        if (dependencies.every(dep => dep.value !== undefined)) {
          execute()
        }
      },
      { immediate, deep: true }
    )
  } else if (immediate) {
    execute()
  }

  return {
    data,
    loading,
    error,
    execute,
    refresh: execute,
    clear: () => {
      data.value = null
      error.value = null
      loading.value = false
    }
  }
}

// Firebase Functions optimized fetch
export function useFirebaseFunction<T = any>(
  functionName: string,
  parameters: Ref<any> | (() => any),
  options: FetchOptions = {}
): FetchState<T> {
  const { functions } = import('@/services/firebase')
  const { httpsCallable } = import('firebase/functions')

  return useOptimizedQuery(
    async () => {
      const [{ functions }, { httpsCallable }] = await Promise.all([
        import('@/services/firebase'),
        import('firebase/functions')
      ])

      const callable = httpsCallable(functions, functionName)
      const params = typeof parameters === 'function' ? parameters() : parameters.value
      
      const result = await callable(params)
      return (result.data as any).data || result.data
    },
    typeof parameters === 'function' ? [] : [parameters],
    {
      cache: true,
      cacheTime: 2 * 60 * 1000, // 2 minutes for API calls
      dedupe: true,
      ...options
    }
  )
}

// Pagination support
export function useOptimizedPagination<T = any>(
  baseFetcher: (page: number, limit: number) => Promise<{ items: T[], hasMore: boolean }>,
  options: { limit?: number; immediate?: boolean } = {}
) {
  const { limit = 20, immediate = true } = options
  
  const items = ref<T[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const hasMore = ref(true)
  const currentPage = ref(0)

  async function loadMore(): Promise<void> {
    if (loading.value || !hasMore.value) return

    try {
      loading.value = true
      error.value = null

      const result = await measureAsync(
        'paginated-fetch',
        () => baseFetcher(currentPage.value + 1, limit),
        { page: currentPage.value + 1, limit }
      )

      items.value.push(...result.items)
      hasMore.value = result.hasMore
      currentPage.value++
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  async function refresh(): Promise<void> {
    items.value = []
    currentPage.value = 0
    hasMore.value = true
    await loadMore()
  }

  if (immediate) {
    loadMore()
  }

  return {
    items,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  }
}

// Cache utilities
export function clearAllCache(): void {
  cache.clear()
  pendingRequests.clear()
}

export function clearCacheByPattern(pattern: RegExp): void {
  for (const key of cache.keys()) {
    if (pattern.test(key)) {
      cache.delete(key)
    }
  }
}

export function getCacheStats() {
  const now = Date.now()
  let activeEntries = 0
  let expiredEntries = 0
  let totalSize = 0

  for (const [key, entry] of cache.entries()) {
    totalSize += JSON.stringify(entry.data).length
    if (entry.expiresAt > now) {
      activeEntries++
    } else {
      expiredEntries++
    }
  }

  return {
    totalEntries: cache.size,
    activeEntries,
    expiredEntries,
    pendingRequests: pendingRequests.size,
    estimatedSize: totalSize
  }
}