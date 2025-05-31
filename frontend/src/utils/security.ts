/**
 * Enterprise-Grade Security System
 * Complete CSP, XSS, CSRF protection with security header optimization
 */

import { ref, computed, readonly } from 'vue'

interface SecurityConfig {
  csp: {
    defaultSrc: string[]
    scriptSrc: string[]
    styleSrc: string[]
    imgSrc: string[]
    connectSrc: string[]
    fontSrc: string[]
    objectSrc: string[]
    mediaSrc: string[]
    frameSrc: string[]
  }
  xssProtection: {
    enabled: boolean
    sanitizeInput: boolean
    validateOutput: boolean
    blockMode: boolean
  }
  csrfProtection: {
    enabled: boolean
    tokenExpiry: number
    sameSiteStrict: boolean
    secureOnly: boolean
  }
  securityHeaders: {
    hsts: boolean
    noSniff: boolean
    frameOptions: string
    xssProtection: boolean
    referrerPolicy: string
  }
}

class EnterpriseSecurity {
  private config: SecurityConfig
  private csrfToken: string | null = null
  private nonce: string | null = null
  private violations: any[] = []
  
  constructor() {
    this.config = {
      csp: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'nonce-{nonce}'",
          "https://apis.google.com",
          "https://www.gstatic.com",
          "https://www.googleapis.com",
          "https://js.stripe.com",
          "https://connect.facebook.net"
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
          "https://cdn.jsdelivr.net"
        ],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https:",
          "https://scontent.cdninstagram.com",
          "https://instagram.com",
          "https://*.fbcdn.net"
        ],
        connectSrc: [
          "'self'",
          "https://api.instagram.com",
          "https://graph.instagram.com",
          "https://api.stripe.com",
          `https://${location.hostname}`,
          "wss:"
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com",
          "data:"
        ],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", "blob:", "data:"],
        frameSrc: [
          "'self'",
          "https://js.stripe.com",
          "https://hooks.stripe.com"
        ]
      },
      xssProtection: {
        enabled: true,
        sanitizeInput: true,
        validateOutput: true,
        blockMode: true
      },
      csrfProtection: {
        enabled: true,
        tokenExpiry: 24 * 60 * 60 * 1000, // 24 hours
        sameSiteStrict: true,
        secureOnly: true
      },
      securityHeaders: {
        hsts: true,
        noSniff: true,
        frameOptions: 'DENY',
        xssProtection: true,
        referrerPolicy: 'strict-origin-when-cross-origin'
      }
    }
    
    this.initialize()
  }

  /**
   * Initialize security system
   */
  initialize(): void {
    console.log('🔒 Initializing Enterprise Security System...')
    
    this.generateNonce()
    this.setupCSP()
    this.setupXSSProtection()
    this.setupCSRFProtection()
    this.setupSecurityHeaders()
    this.setupSecurityMonitoring()
    
    console.log('✅ Enterprise Security System Active')
  }

  /**
   * Generate cryptographic nonce for CSP
   */
  private generateNonce(): void {
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    this.nonce = btoa(String.fromCharCode.apply(null, Array.from(array)))
  }

  /**
   * Setup Content Security Policy
   */
  private setupCSP(): void {
    if (!this.nonce) this.generateNonce()
    
    const csp = this.buildCSPString()
    
    // Set CSP via meta tag (backup method)
    let cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
    if (!cspMeta) {
      cspMeta = document.createElement('meta')
      cspMeta.setAttribute('http-equiv', 'Content-Security-Policy')
      document.head.appendChild(cspMeta)
    }
    cspMeta.setAttribute('content', csp)
    
    // Report CSP violations
    document.addEventListener('securitypolicyviolation', (event) => {
      this.handleCSPViolation(event)
    })
    
    console.log('🛡️ CSP Security Headers applied')
  }

  /**
   * Build CSP string with current nonce
   */
  private buildCSPString(): string {
    const csp = this.config.csp
    const directives = []
    
    // Replace nonce placeholder
    const scriptSrc = csp.scriptSrc.map(src => 
      src.replace('{nonce}', this.nonce || '')
    )
    
    directives.push(`default-src ${csp.defaultSrc.join(' ')}`)
    directives.push(`script-src ${scriptSrc.join(' ')}`)
    directives.push(`style-src ${csp.styleSrc.join(' ')}`)
    directives.push(`img-src ${csp.imgSrc.join(' ')}`)
    directives.push(`connect-src ${csp.connectSrc.join(' ')}`)
    directives.push(`font-src ${csp.fontSrc.join(' ')}`)
    directives.push(`object-src ${csp.objectSrc.join(' ')}`)
    directives.push(`media-src ${csp.mediaSrc.join(' ')}`)
    directives.push(`frame-src ${csp.frameSrc.join(' ')}`)
    directives.push(`base-uri 'self'`)
    directives.push(`form-action 'self'`)
    directives.push(`frame-ancestors 'none'`)
    directives.push(`upgrade-insecure-requests`)
    
    return directives.join('; ')
  }

  /**
   * Handle CSP violations
   */
  private handleCSPViolation(event: SecurityPolicyViolationEvent): void {
    const violation = {
      blockedURI: event.blockedURI,
      columnNumber: event.columnNumber,
      directive: event.violatedDirective,
      lineNumber: event.lineNumber,
      originalPolicy: event.originalPolicy,
      sourceFile: event.sourceFile,
      timestamp: Date.now()
    }
    
    this.violations.push(violation)
    
    // Log violation (in development)
    if (import.meta.env.DEV) {
      console.warn('🚨 CSP Violation:', violation)
    }
    
    // Report to monitoring service (in production)
    if (import.meta.env.PROD) {
      this.reportSecurityEvent('csp_violation', violation)
    }
  }

  /**
   * Setup XSS protection mechanisms
   */
  private setupXSSProtection(): void {
    // DOM-based XSS protection
    this.protectDOM()
    
    // Input sanitization
    this.setupInputSanitization()
    
    // Output encoding
    this.setupOutputEncoding()
    
    console.log('🛡️ XSS Protection mechanisms active')
  }

  /**
   * Protect DOM from XSS attacks
   */
  private protectDOM(): void {
    // Override dangerous DOM methods
    const originalInnerHTML = Element.prototype.innerHTML
    const originalSetAttribute = Element.prototype.setAttribute
    const originalInsertAdjacentHTML = Element.prototype.insertAdjacentHTML
    
    // Secure innerHTML setter
    Object.defineProperty(Element.prototype, 'innerHTML', {
      set: function(value: string) {
        const sanitized = enterpriseSecurity.sanitizeHTML(value)
        originalInnerHTML.call(this, sanitized)
      },
      get: function() {
        return originalInnerHTML.call(this)
      }
    })
    
    // Secure setAttribute
    Element.prototype.setAttribute = function(name: string, value: string) {
      if (name.toLowerCase().startsWith('on') || name.toLowerCase() === 'src') {
        const sanitized = enterpriseSecurity.sanitizeAttribute(name, value)
        return originalSetAttribute.call(this, name, sanitized)
      }
      return originalSetAttribute.call(this, name, value)
    }
    
    // Secure insertAdjacentHTML
    Element.prototype.insertAdjacentHTML = function(position: InsertPosition, text: string) {
      const sanitized = enterpriseSecurity.sanitizeHTML(text)
      return originalInsertAdjacentHTML.call(this, position, sanitized)
    }
  }

  /**
   * Setup input sanitization
   */
  private setupInputSanitization(): void {
    // Monitor form inputs
    document.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement
      if (target && target.tagName && ['INPUT', 'TEXTAREA'].includes(target.tagName)) {
        this.validateInput(target)
      }
    })
    
    // Monitor form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement
      if (form && form.tagName === 'FORM') {
        if (!this.validateForm(form)) {
          event.preventDefault()
          console.warn('🚨 Form submission blocked - security validation failed')
        }
      }
    })
  }

  /**
   * Setup output encoding protection
   */
  private setupOutputEncoding(): void {
    // Monitor dynamic content updates
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.validateElementSecurity(node as Element)
            }
          })
        }
      })
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  /**
   * Setup CSRF protection
   */
  private setupCSRFProtection(): void {
    this.generateCSRFToken()
    this.setupCSRFInterceptors()
    this.setupCSRFValidation()
    
    console.log('🛡️ CSRF Protection active')
  }

  /**
   * Generate CSRF token
   */
  private generateCSRFToken(): void {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    this.csrfToken = btoa(String.fromCharCode.apply(null, Array.from(array)))
    
    // Store in session storage with expiry
    const tokenData = {
      token: this.csrfToken,
      expiry: Date.now() + this.config.csrfProtection.tokenExpiry
    }
    sessionStorage.setItem('csrf_token', JSON.stringify(tokenData))
  }

  /**
   * Setup CSRF interceptors for fetch requests
   */
  private setupCSRFInterceptors(): void {
    const originalFetch = window.fetch
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const request = new Request(input, init)
      const url = new URL(request.url)
      
      // Add CSRF token to same-origin requests
      if (url.origin === location.origin && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
        const headers = new Headers(request.headers)
        headers.set('X-CSRF-Token', this.getCSRFToken())
        headers.set('X-Requested-With', 'XMLHttpRequest')
        
        const newInit = {
          ...init,
          headers,
          credentials: 'same-origin' as RequestCredentials
        }
        
        return originalFetch(input, newInit)
      }
      
      return originalFetch(input, init)
    }
  }

  /**
   * Setup CSRF validation
   */
  private setupCSRFValidation(): void {
    // Validate CSRF token on page focus (detect potential CSRF attacks)
    window.addEventListener('focus', () => {
      if (!this.validateCSRFToken()) {
        this.generateCSRFToken()
        console.warn('🚨 CSRF token refreshed due to validation failure')
      }
    })
  }

  /**
   * Setup security headers via JavaScript (backup method)
   */
  private setupSecurityHeaders(): void {
    // These should ideally be set by the server, but we can add them as meta tags
    const headers = [
      { name: 'X-Content-Type-Options', content: 'nosniff' },
      { name: 'X-Frame-Options', content: this.config.securityHeaders.frameOptions },
      { name: 'X-XSS-Protection', content: '1; mode=block' },
      { name: 'Referrer-Policy', content: this.config.securityHeaders.referrerPolicy }
    ]
    
    headers.forEach(header => {
      let meta = document.querySelector(`meta[http-equiv="${header.name}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('http-equiv', header.name)
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', header.content)
    })
    
    console.log('🛡️ Security headers applied')
  }

  /**
   * Setup security monitoring
   */
  private setupSecurityMonitoring(): void {
    // Monitor for suspicious activities
    this.setupTamperDetection()
    this.setupClickjackProtection()
    this.setupDeveloperToolsDetection()
    
    console.log('👁️ Security monitoring active')
  }

  /**
   * Setup tamper detection
   */
  private setupTamperDetection(): void {
    // Detect if critical security functions are tampered
    const criticalFunctions = [
      'fetch',
      'XMLHttpRequest',
      'localStorage.setItem',
      'sessionStorage.setItem'
    ]
    
    setInterval(() => {
      criticalFunctions.forEach(funcName => {
        if (this.isFunctionTampered(funcName)) {
          this.reportSecurityEvent('function_tampering', { function: funcName })
        }
      })
    }, 30000) // Check every 30 seconds
  }

  /**
   * Setup clickjack protection
   */
  private setupClickjackProtection(): void {
    // Detect if page is in iframe
    if (window.top !== window.self) {
      this.reportSecurityEvent('clickjacking_attempt', {
        parentOrigin: document.referrer,
        currentUrl: location.href
      })
      
      // Break out of iframe
      window.top!.location = window.location
    }
    
    // Monitor for overlay attacks
    document.addEventListener('click', (event) => {
      this.detectOverlayAttack(event)
    })
  }

  /**
   * Setup developer tools detection
   */
  private setupDeveloperToolsDetection(): void {
    let devtools = false
    
    setInterval(() => {
      const threshold = 160
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools) {
          devtools = true
          this.reportSecurityEvent('devtools_opened', {
            timestamp: Date.now(),
            userAgent: navigator.userAgent
          })
        }
      } else {
        devtools = false
      }
    }, 500)
  }

  /**
   * Sanitize HTML content
   */
  sanitizeHTML(html: string): string {
    const div = document.createElement('div')
    div.textContent = html
    return div.innerHTML
  }

  /**
   * Sanitize attribute values
   */
  sanitizeAttribute(name: string, value: string): string {
    // Block javascript: and data: URLs in sensitive attributes
    if (['href', 'src', 'action'].includes(name.toLowerCase())) {
      if (value.toLowerCase().startsWith('javascript:') || 
          value.toLowerCase().startsWith('data:') ||
          value.toLowerCase().startsWith('vbscript:')) {
        return ''
      }
    }
    
    // Block event handlers
    if (name.toLowerCase().startsWith('on')) {
      return ''
    }
    
    return value
  }

  /**
   * Validate input security
   */
  private validateInput(input: HTMLInputElement): boolean {
    const value = input.value
    
    // Check for script injection attempts
    const scriptPattern = /<script[^>]*>.*?<\/script>/gi
    const onEventPattern = /on\w+\s*=/gi
    const javascriptPattern = /javascript:/gi
    
    if (scriptPattern.test(value) || onEventPattern.test(value) || javascriptPattern.test(value)) {
      input.value = this.sanitizeHTML(value)
      this.reportSecurityEvent('xss_attempt', {
        inputName: input.name || input.id,
        originalValue: value,
        sanitizedValue: input.value
      })
      return false
    }
    
    return true
  }

  /**
   * Validate form security
   */
  private validateForm(form: HTMLFormElement): boolean {
    const inputs = form.querySelectorAll('input, textarea, select')
    let isValid = true
    
    inputs.forEach(input => {
      if (!this.validateInput(input as HTMLInputElement)) {
        isValid = false
      }
    })
    
    return isValid
  }

  /**
   * Validate element security
   */
  private validateElementSecurity(element: Element): void {
    // Check for dangerous attributes
    const dangerousAttrs = ['onload', 'onerror', 'onclick', 'onmouseover']
    dangerousAttrs.forEach(attr => {
      if (element.hasAttribute(attr)) {
        element.removeAttribute(attr)
        this.reportSecurityEvent('dangerous_attribute_removed', {
          tagName: element.tagName,
          attribute: attr
        })
      }
    })
    
    // Check for dangerous elements
    if (['SCRIPT', 'IFRAME', 'OBJECT', 'EMBED'].includes(element.tagName)) {
      if (!this.isElementTrusted(element)) {
        element.remove()
        this.reportSecurityEvent('dangerous_element_removed', {
          tagName: element.tagName,
          outerHTML: element.outerHTML.substring(0, 100)
        })
      }
    }
  }

  /**
   * Check if element is from trusted source
   */
  private isElementTrusted(element: Element): boolean {
    // Check if element has nonce attribute matching current nonce
    const nonce = element.getAttribute('nonce')
    return nonce === this.nonce
  }

  /**
   * Get CSRF token
   */
  getCSRFToken(): string {
    const stored = sessionStorage.getItem('csrf_token')
    if (stored) {
      const tokenData = JSON.parse(stored)
      if (tokenData.expiry > Date.now()) {
        return tokenData.token
      }
    }
    
    this.generateCSRFToken()
    return this.csrfToken || ''
  }

  /**
   * Validate CSRF token
   */
  private validateCSRFToken(): boolean {
    const stored = sessionStorage.getItem('csrf_token')
    if (!stored) return false
    
    const tokenData = JSON.parse(stored)
    return tokenData.expiry > Date.now()
  }

  /**
   * Check if function is tampered
   */
  private isFunctionTampered(funcName: string): boolean {
    // This is a simplified check - in production you'd have more sophisticated detection
    const func = this.getFunctionByName(funcName)
    return func && func.toString().includes('[native code]') === false
  }

  /**
   * Get function by name
   */
  private getFunctionByName(funcName: string): Function | null {
    const parts = funcName.split('.')
    let obj: any = window
    
    for (const part of parts) {
      if (obj && typeof obj[part] !== 'undefined') {
        obj = obj[part]
      } else {
        return null
      }
    }
    
    return typeof obj === 'function' ? obj : null
  }

  /**
   * Detect overlay attacks
   */
  private detectOverlayAttack(event: MouseEvent): void {
    const target = event.target as Element
    const rect = target.getBoundingClientRect()
    
    // Check if click is near sensitive elements
    const sensitiveSelectors = ['[type="password"]', '[type="submit"]', 'button']
    
    sensitiveSelectors.forEach(selector => {
      const sensitiveElements = document.querySelectorAll(selector)
      sensitiveElements.forEach(element => {
        const elemRect = element.getBoundingClientRect()
        const distance = Math.sqrt(
          Math.pow(rect.x - elemRect.x, 2) + Math.pow(rect.y - elemRect.y, 2)
        )
        
        if (distance < 50 && target !== element) {
          this.reportSecurityEvent('potential_overlay_attack', {
            clickTarget: target.tagName,
            sensitiveElement: element.tagName,
            distance
          })
        }
      })
    })
  }

  /**
   * Report security events
   */
  private reportSecurityEvent(type: string, data: any): void {
    const event = {
      type,
      data,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: location.href
    }
    
    // In development, log to console
    if (import.meta.env.DEV) {
      console.warn('🚨 Security Event:', event)
    }
    
    // In production, send to monitoring service
    if (import.meta.env.PROD) {
      // Send to real-time monitoring system
      this.sendToMonitoring(event)
    }
  }

  /**
   * Send to monitoring system
   */
  private sendToMonitoring(event: any): void {
    // Integrate with real-time monitoring system
    if (typeof window !== 'undefined' && window.__real_time_monitor__) {
      window.__real_time_monitor__.recordSecurityEvent(event)
    }
  }

  /**
   * Get current nonce
   */
  getCurrentNonce(): string | null {
    return this.nonce
  }

  /**
   * Get security status
   */
  getSecurityStatus() {
    return {
      cspActive: !!document.querySelector('meta[http-equiv="Content-Security-Policy"]'),
      csrfToken: !!this.csrfToken,
      xssProtection: this.config.xssProtection.enabled,
      violations: this.violations.length,
      lastViolation: this.violations.length > 0 ? this.violations[this.violations.length - 1] : null
    }
  }

  /**
   * Update security configuration
   */
  updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig }
    this.setupCSP() // Re-apply CSP with new config
  }
}

// Global security instance
export const enterpriseSecurity = new EnterpriseSecurity()

// Vue composable for security integration
export function useEnterpriseSecurity() {
  const securityStatus = ref(enterpriseSecurity.getSecurityStatus())
  
  const isSecure = computed(() => {
    return securityStatus.value.cspActive && 
           securityStatus.value.csrfToken && 
           securityStatus.value.xssProtection
  })
  
  const violationCount = computed(() => securityStatus.value.violations)
  
  const refreshStatus = () => {
    securityStatus.value = enterpriseSecurity.getSecurityStatus()
  }
  
  const getCSRFToken = () => enterpriseSecurity.getCSRFToken()
  
  const getCurrentNonce = () => enterpriseSecurity.getCurrentNonce()
  
  // Auto-refresh status every 30 seconds
  setInterval(refreshStatus, 30000)
  
  return {
    securityStatus: readonly(securityStatus),
    isSecure,
    violationCount,
    refreshStatus,
    getCSRFToken,
    getCurrentNonce
  }
}

// Export types
export type { SecurityConfig }