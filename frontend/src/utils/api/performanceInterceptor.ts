import { usePerformanceStore } from '@/stores';

export interface ApiCallInfo {
  endpoint: string;
  method: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  isColdStart?: boolean;
  success?: boolean;
  error?: Error;
}

class PerformanceInterceptor {
  private activeRequests = new Map<string, ApiCallInfo>();

  // Generate a unique request ID
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Start tracking an API call
  startTracking(endpoint: string, method: string = 'GET'): string {
    const requestId = this.generateRequestId();
    const apiCall: ApiCallInfo = {
      endpoint,
      method,
      startTime: performance.now(),
    };

    this.activeRequests.set(requestId, apiCall);
    return requestId;
  }

  // End tracking and record metrics
  endTracking(requestId: string, success: boolean = true, error?: Error): void {
    const apiCall = this.activeRequests.get(requestId);
    if (!apiCall) return;

    apiCall.endTime = performance.now();
    apiCall.duration = apiCall.endTime - apiCall.startTime;
    apiCall.success = success;
    apiCall.error = error;

    // Check if this might be a cold start (duration > 3 seconds typically indicates cold start)
    apiCall.isColdStart = apiCall.duration > 3000;

    // Track in performance store
    const performanceStore = usePerformanceStore();
    performanceStore.trackApiCall(
      apiCall.endpoint,
      apiCall.duration,
      apiCall.isColdStart
    );

    // Track errors
    if (!success) {
      performanceStore.trackError();
    }

    // Clean up
    this.activeRequests.delete(requestId);

    // Log for debugging in development
    if (import.meta.env.DEV) {
      console.log(`[Performance] ${apiCall.method} ${apiCall.endpoint}:`, {
        duration: `${apiCall.duration.toFixed(2)}ms`,
        coldStart: apiCall.isColdStart,
        success: apiCall.success,
      });
    }
  }

  // Get current active requests count
  getActiveRequestsCount(): number {
    return this.activeRequests.size;
  }

  // Clear all active requests (useful for cleanup)
  clearAllRequests(): void {
    this.activeRequests.clear();
  }
}

// Create a singleton instance
export const performanceInterceptor = new PerformanceInterceptor();

// Fetch interceptor (for Firebase SDK which uses fetch)
export const setupFetchInterceptor = () => {
  const originalFetch = window.fetch;

  window.fetch = async (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> => {
    const url = typeof input === 'string' ? input : input.toString();
    const method = init?.method || 'GET';

    // Only track Firebase function calls
    if (
      !url.includes('cloudfunctions.net') &&
      !url.includes('localhost:5001')
    ) {
      return originalFetch(input, init);
    }

    const requestId = performanceInterceptor.startTracking(url, method);

    try {
      const response = await originalFetch(input, init);
      performanceInterceptor.endTracking(requestId, response.ok);
      return response;
    } catch (error) {
      performanceInterceptor.endTracking(requestId, false, error as Error);
      throw error;
    }
  };
};

// Manual tracking for custom scenarios
export const trackCustomApiCall = async <T>(
  endpoint: string,
  apiCall: () => Promise<T>,
  method: string = 'CUSTOM'
): Promise<T> => {
  const requestId = performanceInterceptor.startTracking(endpoint, method);

  try {
    const result = await apiCall();
    performanceInterceptor.endTracking(requestId, true);
    return result;
  } catch (error) {
    performanceInterceptor.endTracking(requestId, false, error as Error);
    throw error;
  }
};
