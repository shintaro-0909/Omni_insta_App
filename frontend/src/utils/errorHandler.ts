import { usePerformanceStore } from '@/stores/performance'

export interface ErrorDetails {
  message: string
  stack?: string
  url?: string
  lineNumber?: number
  columnNumber?: number
  timestamp: Date
  userId?: string
  sessionId: string
  userAgent: string
  viewport: string
  buildVersion: string
  environment: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'javascript' | 'network' | 'auth' | 'api' | 'ui' | 'performance'
  context?: Record<string, any>
}

export interface NetworkError extends ErrorDetails {
  category: 'network'
  endpoint: string
  method: string
  statusCode?: number
  responseTime: number
}

export interface ApiError extends ErrorDetails {
  category: 'api'
  endpoint: string
  requestId?: string
  errorCode?: string
}

class ErrorMonitoringService {
  private sessionId: string
  private errors: ErrorDetails[] = []
  private readonly maxErrors = 100
  
  constructor() {
    this.sessionId = this.generateSessionId()
    this.initializeGlobalErrorHandlers()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private initializeGlobalErrorHandlers(): void {
    // Global JavaScript error handler
    window.addEventListener('error', (event) => {
      this.logError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename,
        lineNumber: event.lineno,
        columnNumber: event.colno,
        timestamp: new Date(),
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        buildVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
        environment: import.meta.env.VITE_APP_ENV || 'development',
        severity: this.determineSeverity(event.message),
        category: 'javascript'
      })
    })

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        timestamp: new Date(),
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        buildVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
        environment: import.meta.env.VITE_APP_ENV || 'development',
        severity: 'high',
        category: 'javascript'
      })
    })

    // Network error monitoring
    this.interceptFetch()
  }

  private interceptFetch(): void {
    const originalFetch = window.fetch
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const start = performance.now()
      const url = typeof input === 'string' ? input : input.toString()
      const method = init?.method || 'GET'
      
      try {
        const response = await originalFetch(input, init)
        const duration = performance.now() - start
        
        if (!response.ok) {
          this.logNetworkError({
            message: `Network request failed: ${response.status} ${response.statusText}`,
            timestamp: new Date(),
            sessionId: this.sessionId,
            userAgent: navigator.userAgent,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            buildVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
            environment: import.meta.env.VITE_APP_ENV || 'development',
            severity: response.status >= 500 ? 'critical' : 'high',
            category: 'network',
            endpoint: url,
            method,
            statusCode: response.status,
            responseTime: duration
          })
        }
        
        return response
      } catch (error) {
        const duration = performance.now() - start
        
        this.logNetworkError({
          message: `Network request failed: ${error}`,
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date(),
          sessionId: this.sessionId,
          userAgent: navigator.userAgent,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          buildVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
          environment: import.meta.env.VITE_APP_ENV || 'development',
          severity: 'critical',
          category: 'network',
          endpoint: url,
          method,
          responseTime: duration
        })
        
        throw error
      }
    }
  }

  private determineSeverity(message: string): 'low' | 'medium' | 'high' | 'critical' {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('script error') || lowerMessage.includes('non-error')) {
      return 'low'
    }
    
    if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
      return 'high'
    }
    
    if (lowerMessage.includes('auth') || lowerMessage.includes('permission')) {
      return 'critical'
    }
    
    return 'medium'
  }

  logError(error: ErrorDetails): void {
    // Add to local storage
    this.errors.push(error)
    
    if (this.errors.length > this.maxErrors) {
      this.errors.shift()
    }
    
    // Track in performance store
    const performanceStore = usePerformanceStore()
    performanceStore.trackError()
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('[Error Monitor]', error)
    }
    
    // Send to logging service in production
    if (import.meta.env.PROD) {
      this.sendToLoggingService(error)
    }
  }

  logNetworkError(error: NetworkError): void {
    this.logError(error)
  }

  logApiError(error: ApiError): void {
    this.logError(error)
  }

  logUserInteractionError(action: string, element: string, error: Error): void {
    this.logError({
      message: `User interaction error: ${action} on ${element}`,
      stack: error.stack,
      timestamp: new Date(),
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      buildVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
      environment: import.meta.env.VITE_APP_ENV || 'development',
      severity: 'medium',
      category: 'ui',
      context: { action, element }
    })
  }

  logPerformanceIssue(metric: string, value: number, threshold: number): void {
    this.logError({
      message: `Performance issue: ${metric} (${value}ms) exceeded threshold (${threshold}ms)`,
      timestamp: new Date(),
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      buildVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
      environment: import.meta.env.VITE_APP_ENV || 'development',
      severity: value > threshold * 2 ? 'high' : 'medium',
      category: 'performance',
      context: { metric, value, threshold }
    })
  }

  private async sendToLoggingService(error: ErrorDetails): Promise<void> {
    try {
      // Send to your logging service (e.g., Sentry, LogRocket, custom endpoint)
      const endpoint = import.meta.env.VITE_ERROR_LOGGING_ENDPOINT
      
      if (!endpoint) return
      
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...error,
          timestamp: error.timestamp.toISOString(),
        }),
      })
    } catch (loggingError) {
      console.error('Failed to send error to logging service:', loggingError)
    }
  }

  getErrorHistory(): ErrorDetails[] {
    return [...this.errors]
  }

  clearErrorHistory(): void {
    this.errors = []
  }

  exportErrorReport(): string {
    const report = {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      errors: this.errors,
      systemInfo: {
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        language: navigator.language,
        platform: navigator.platform,
        buildVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
        environment: import.meta.env.VITE_APP_ENV || 'development'
      }
    }
    
    return JSON.stringify(report, null, 2)
  }
}

// Create singleton instance
export const errorMonitor = new ErrorMonitoringService()

// Utility functions for manual error logging
export const logError = (message: string, context?: Record<string, any>) => {
  errorMonitor.logError({
    message,
    timestamp: new Date(),
    sessionId: errorMonitor['sessionId'],
    userAgent: navigator.userAgent,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    buildVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.VITE_APP_ENV || 'development',
    severity: 'medium',
    category: 'javascript',
    context
  })
}

export const logApiError = (endpoint: string, error: Error, requestId?: string) => {
  errorMonitor.logApiError({
    message: `API Error: ${error.message}`,
    stack: error.stack,
    timestamp: new Date(),
    sessionId: errorMonitor['sessionId'],
    userAgent: navigator.userAgent,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    buildVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.VITE_APP_ENV || 'development',
    severity: 'high',
    category: 'api',
    endpoint,
    requestId
  })
}

export const logUserAction = (action: string, element: string, success: boolean, context?: Record<string, any>) => {
  if (!success) {
    errorMonitor.logUserInteractionError(action, element, new Error(`User action failed: ${action}`))
  }
  
  // Log successful actions for analytics (optional)
  if (import.meta.env.DEV && success) {
    console.log(`[User Action] ${action} on ${element}`, context)
  }
}