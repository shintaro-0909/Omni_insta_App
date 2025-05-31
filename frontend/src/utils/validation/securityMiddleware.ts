/**
 * Security Middleware for API Requests
 * Automatically adds security headers and CSRF protection
 */

import { enterpriseSecurity } from './security'

interface SecurityMiddlewareConfig {
  enableCSRF: boolean
  enableSecurityHeaders: boolean
  enableRequestValidation: boolean
  enableResponseValidation: boolean
  trustedDomains: string[]
}

class SecurityMiddleware {
  private config: SecurityMiddlewareConfig
  private requestInterceptors: ((request: Request) => Request)[] = []
  private responseInterceptors: ((response: Response) => Response)[] = []
  
  constructor() {
    this.config = {
      enableCSRF: true,
      enableSecurityHeaders: true,
      enableRequestValidation: true,
      enableResponseValidation: true,
      trustedDomains: [
        location.hostname,
        'api.instagram.com',
        'graph.instagram.com',
        'api.stripe.com'
      ]
    }
    
    this.initialize()
  }

  /**
   * Initialize security middleware
   */
  initialize(): void {
    this.setupRequestInterception()
    this.setupResponseInterception()
    this.setupGlobalErrorHandling()
    
    console.log('🛡️ Security Middleware initialized')
  }

  /**
   * Setup request interception for security
   */
  private setupRequestInterception(): void {
    const originalFetch = window.fetch
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      try {
        const request = new Request(input, init)
        const secureRequest = await this.processRequest(request)
        return await originalFetch(secureRequest)
      } catch (error) {
        this.handleSecurityError(error, 'request_processing')
        throw error
      }
    }
  }

  /**
   * Setup response interception for security
   */
  private setupResponseInterception(): void {
    // Response validation happens in the fetch wrapper above
    // Additional processing can be added here
  }

  /**
   * Process request for security
   */
  private async processRequest(request: Request): Promise<Request> {
    const url = new URL(request.url)
    
    // Skip processing for external non-trusted domains
    if (!this.isTrustedDomain(url.hostname) && url.hostname !== location.hostname) {
      return request
    }
    
    const headers = new Headers(request.headers)
    
    // Add security headers
    if (this.config.enableSecurityHeaders) {
      this.addSecurityHeaders(headers, url)
    }
    
    // Add CSRF protection for state-changing requests
    if (this.config.enableCSRF && this.isStateMutatingRequest(request.method)) {
      this.addCSRFProtection(headers, url)
    }
    
    // Validate request
    if (this.config.enableRequestValidation) {
      await this.validateRequest(request, headers)
    }
    
    return new Request(request.url, {
      method: request.method,
      headers,
      body: request.body,
      mode: request.mode,
      credentials: request.credentials,
      cache: request.cache,
      redirect: request.redirect,
      referrer: request.referrer,
      referrerPolicy: request.referrerPolicy,
      integrity: request.integrity,
      signal: request.signal
    })
  }

  /**
   * Add security headers to request
   */
  private addSecurityHeaders(headers: Headers, url: URL): void {
    // Add standard security headers
    headers.set('X-Requested-With', 'XMLHttpRequest')
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    headers.set('Pragma', 'no-cache')
    
    // Add nonce for same-origin requests
    if (url.origin === location.origin) {
      const nonce = enterpriseSecurity.getCurrentNonce()
      if (nonce) {
        headers.set('X-Security-Nonce', nonce)
      }
    }
    
    // Add content type if not set for JSON requests
    if (!headers.has('Content-Type') && ['POST', 'PUT', 'PATCH'].includes(headers.get('method') || '')) {
      headers.set('Content-Type', 'application/json')
    }
    
    // Add security timestamp
    headers.set('X-Security-Timestamp', Date.now().toString())
  }

  /**
   * Add CSRF protection to request
   */
  private addCSRFProtection(headers: Headers, url: URL): void {
    // Only add CSRF for same-origin requests
    if (url.origin === location.origin) {
      const csrfToken = enterpriseSecurity.getCSRFToken()
      if (csrfToken) {
        headers.set('X-CSRF-Token', csrfToken)
      }
    }
  }

  /**
   * Validate request for security issues
   */
  private async validateRequest(request: Request, headers: Headers): Promise<void> {
    const url = new URL(request.url)
    
    // Check for suspicious URL patterns
    if (this.hasSuspiciousUrlPatterns(url)) {
      throw new Error('Suspicious URL pattern detected')
    }
    
    // Validate headers for injection attempts
    for (const [name, value] of headers.entries()) {
      if (this.hasSuspiciousHeaderValue(name, value)) {
        throw new Error(`Suspicious header value detected: ${name}`)
      }
    }
    
    // Validate request body for injection attempts
    if (request.body) {
      const bodyText = await this.getRequestBodyText(request)
      if (this.hasSuspiciousContent(bodyText)) {
        throw new Error('Suspicious content detected in request body')
      }
    }
  }

  /**
   * Check if domain is trusted
   */
  private isTrustedDomain(hostname: string): boolean {
    return this.config.trustedDomains.some(domain => {
      return hostname === domain || hostname.endsWith('.' + domain)
    })
  }

  /**
   * Check if request method is state-mutating
   */
  private isStateMutatingRequest(method: string): boolean {
    return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())
  }

  /**
   * Check for suspicious URL patterns
   */
  private hasSuspiciousUrlPatterns(url: URL): boolean {
    const suspiciousPatterns = [
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /<script/i,
      /on\w+=/i,
      /\.\.\//,
      /%2e%2e%2f/i,
      /%252e%252e%252f/i
    ]
    
    const fullUrl = url.toString()
    return suspiciousPatterns.some(pattern => pattern.test(fullUrl))
  }

  /**
   * Check for suspicious header values
   */
  private hasSuspiciousHeaderValue(name: string, value: string): boolean {
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /\x00-\x1f/,
      /\x7f-\xff/
    ]
    
    return suspiciousPatterns.some(pattern => pattern.test(value))
  }

  /**
   * Check for suspicious content
   */
  private hasSuspiciousContent(content: string): boolean {
    const suspiciousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /eval\s*\(/gi,
      /document\.write/gi,
      /window\.location/gi,
      /\bexec\b/gi
    ]
    
    return suspiciousPatterns.some(pattern => pattern.test(content))
  }

  /**
   * Get request body as text
   */
  private async getRequestBodyText(request: Request): Promise<string> {
    try {
      const clonedRequest = request.clone()
      return await clonedRequest.text()
    } catch (error) {
      return ''
    }
  }

  /**
   * Setup global error handling for security
   */
  private setupGlobalErrorHandling(): void {
    window.addEventListener('error', (event) => {
      this.handleSecurityError(event.error, 'global_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      })
    })
    
    window.addEventListener('unhandledrejection', (event) => {
      this.handleSecurityError(event.reason, 'unhandled_rejection', {
        reason: event.reason
      })
    })
  }

  /**
   * Handle security errors
   */
  private handleSecurityError(error: any, type: string, metadata?: any): void {
    const securityEvent = {
      type: 'security_error',
      subtype: type,
      error: {
        message: error.message || String(error),
        stack: error.stack,
        name: error.name
      },
      metadata: metadata || {},
      timestamp: Date.now(),
      url: location.href,
      userAgent: navigator.userAgent
    }
    
    // Log in development
    if (import.meta.env.DEV) {
      console.error('🚨 Security Error:', securityEvent)
    }
    
    // Report to monitoring in production
    if (import.meta.env.PROD && typeof window !== 'undefined') {
      this.reportSecurityEvent(securityEvent)
    }
  }

  /**
   * Report security event to monitoring system
   */
  private reportSecurityEvent(event: any): void {
    // Send to real-time monitoring system
    if (window.__real_time_monitor__) {
      window.__real_time_monitor__.recordSecurityEvent(event)
    }
    
    // Could also send to external security service
    // this.sendToSecurityService(event)
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor: (request: Request) => Request): void {
    this.requestInterceptors.push(interceptor)
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(interceptor: (response: Response) => Response): void {
    this.responseInterceptors.push(interceptor)
  }

  /**
   * Update security configuration
   */
  updateConfig(newConfig: Partial<SecurityMiddlewareConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Get current security configuration
   */
  getConfig(): SecurityMiddlewareConfig {
    return { ...this.config }
  }

  /**
   * Validate API response for security
   */
  validateResponse(response: Response): boolean {
    if (!this.config.enableResponseValidation) return true
    
    // Check response headers for security indicators
    const securityHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection'
    ]
    
    const hasSecurityHeaders = securityHeaders.some(header => 
      response.headers.has(header)
    )
    
    // Log if response lacks security headers (from same origin)
    const url = new URL(response.url)
    if (url.origin === location.origin && !hasSecurityHeaders) {
      console.warn('⚠️ Response lacks security headers:', response.url)
    }
    
    return true
  }
}

// Global security middleware instance
export const securityMiddleware = new SecurityMiddleware()

// Helper function to secure fetch calls
export async function secureFetch(
  input: RequestInfo | URL, 
  init?: RequestInit
): Promise<Response> {
  // This will automatically use our security middleware
  return fetch(input, init)
}

// Helper function to validate and sanitize data
export function sanitizeData(data: any): any {
  if (typeof data === 'string') {
    return data
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeData)
  }
  
  if (data && typeof data === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeData(value)
    }
    return sanitized
  }
  
  return data
}

// Security validation utilities
export const securityUtils = {
  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && !this.hasSuspiciousContent(email)
  },
  
  /**
   * Validate URL format
   */
  isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url)
      return ['http:', 'https:'].includes(parsed.protocol) && 
             !this.hasSuspiciousContent(url)
    } catch {
      return false
    }
  },
  
  /**
   * Check for suspicious content
   */
  hasSuspiciousContent(content: string): boolean {
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /\x00-\x1f/,
      /\x7f-\xff/
    ]
    
    return suspiciousPatterns.some(pattern => pattern.test(content))
  },
  
  /**
   * Generate secure random string
   */
  generateSecureRandom(length: number = 32): string {
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    return btoa(String.fromCharCode.apply(null, Array.from(array)))
  }
}

export default securityMiddleware