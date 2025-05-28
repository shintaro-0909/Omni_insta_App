/// <reference types="cypress" />

// Custom commands for Omniy Instagram Scheduler

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Login with test credentials
       */
      login(email?: string, password?: string): Chainable<void>
      
      /**
       * Logout from the application
       */
      logout(): Chainable<void>
      
      /**
       * Wait for app to be fully loaded
       */
      waitForAppLoad(): Chainable<void>
      
      /**
       * Create a test Instagram account
       */
      createTestAccount(accountData: any): Chainable<void>
      
      /**
       * Create a test schedule
       */
      createTestSchedule(scheduleData: any): Chainable<void>
      
      /**
       * Navigate to a specific view
       */
      navigateToView(view: string): Chainable<void>
      
      /**
       * Check performance metrics
       */
      checkPerformance(): Chainable<void>
      
      /**
       * Check accessibility
       */
      checkA11y(): Chainable<void>
      
      /**
       * Seed test data
       */
      seedTestData(): Chainable<void>
      
      /**
       * Clean up test data
       */
      cleanupTestData(): Chainable<void>
      
      /**
       * Mock Firebase Auth
       */
      mockFirebaseAuth(user: any): Chainable<void>
      
      /**
       * Mock Stripe payment
       */
      mockStripePayment(paymentData: any): Chainable<void>
      
      /**
       * Upload file helper
       */
      uploadFile(selector: string, fileName: string, fileType?: string): Chainable<void>
      
      /**
       * Fill schedule form
       */
      fillScheduleForm(data: any): Chainable<void>
      
      /**
       * Navigation helpers
       */
      navigateToSchedules(): Chainable<void>
      navigateToAccounts(): Chainable<void>
      navigateToBilling(): Chainable<void>
      
      /**
       * Usage tracking helpers
       */
      checkUsageLimits(expectedLimits: any): Chainable<void>
      
      /**
       * Error and success state helpers
       */
      shouldShowError(message: string): Chainable<void>
      shouldShowSuccess(message: string): Chainable<void>
      shouldNotHaveLoadingSpinner(): Chainable<void>
    }
  }
}

// Login command
Cypress.Commands.add('login', (email?: string, _password?: string) => {
  const testEmail = email || Cypress.env('TEST_USER_EMAIL')
  // const _testPassword = password || Cypress.env('TEST_USER_PASSWORD')
  
  cy.visit('/login')
  cy.waitForAppLoad()
  
  // Check if already logged in
  cy.get('body').then(($body) => {
    if ($body.find('[data-cy="login-form"]').length > 0) {
      // Click Google login button (mock for testing)
      cy.get('[data-cy="google-login-btn"]').click()
      
      // In real scenario, this would handle OAuth flow
      // For testing, we'll mock the authentication
      cy.window().its('localStorage').invoke('setItem', 'omniy-auth-token', 'mock-token')
      cy.window().its('localStorage').invoke('setItem', 'omniy-user', JSON.stringify({
        uid: 'test-user-id',
        email: testEmail,
        displayName: 'Test User'
      }))
      
      cy.reload()
    }
  })
  
  cy.url().should('include', '/dashboard')
})

// Logout command
Cypress.Commands.add('logout', () => {
  cy.get('[data-cy="user-menu"]').click()
  cy.get('[data-cy="logout-btn"]').click()
  cy.url().should('include', '/login')
})

// Wait for app load
Cypress.Commands.add('waitForAppLoad', () => {
  // Wait for Vue app to mount
  cy.get('[data-cy="app-loaded"]', { timeout: 10000 }).should('exist')
  
  // Wait for any loading indicators to disappear
  cy.get('[data-cy="loading"]').should('not.exist')
})

// Create test account
Cypress.Commands.add('createTestAccount', (accountData) => {
  cy.navigateToView('accounts')
  cy.get('[data-cy="add-account-btn"]').click()
  
  cy.get('[data-cy="account-username"]').type(accountData.username)
  cy.get('[data-cy="account-token"]').type(accountData.accessToken)
  
  cy.get('[data-cy="save-account-btn"]').click()
  cy.get('[data-cy="success-message"]').should('be.visible')
})

// Create test schedule
Cypress.Commands.add('createTestSchedule', (scheduleData) => {
  cy.navigateToView('schedules')
  cy.get('[data-cy="create-schedule-btn"]').click()
  
  // Fill schedule form
  cy.get('[data-cy="schedule-type"]').select(scheduleData.type)
  cy.get('[data-cy="schedule-content"]').select(scheduleData.contentId)
  cy.get('[data-cy="schedule-account"]').select(scheduleData.accountId)
  
  if (scheduleData.type === 'once') {
    cy.get('[data-cy="scheduled-date"]').type(scheduleData.scheduledAt)
  } else if (scheduleData.type === 'recurring') {
    cy.get('[data-cy="repeat-days"]').select(scheduleData.repeatDays)
    cy.get('[data-cy="repeat-time"]').type(scheduleData.repeatTime)
  }
  
  cy.get('[data-cy="save-schedule-btn"]').click()
  cy.get('[data-cy="success-message"]').should('be.visible')
})

// Navigate to view
Cypress.Commands.add('navigateToView', (view: string) => {
  cy.get(`[data-cy="nav-${view}"]`).click()
  cy.url().should('include', `/${view}`)
  cy.waitForAppLoad()
})

// Performance check
Cypress.Commands.add('checkPerformance', () => {
  if (!Cypress.env('ENABLE_PERFORMANCE_TESTS')) return
  
  cy.window().then((win) => {
    const performance = win.performance
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    // Check page load time
    const loadTime = navigation.loadEventEnd - navigation.fetchStart
    expect(loadTime).to.be.lessThan(3000) // 3 seconds
    
    // Check First Contentful Paint
    const fcp = performance.getEntriesByName('first-contentful-paint')[0]
    if (fcp) {
      expect(fcp.startTime).to.be.lessThan(1500) // 1.5 seconds
    }
  })
})

// Accessibility check
Cypress.Commands.add('checkA11y', () => {
  if (!Cypress.env('ENABLE_ACCESSIBILITY_TESTS')) return
  
  cy.injectAxe()
  cy.checkA11y(null, null, (violations) => {
    violations.forEach((violation) => {
      cy.log(`A11Y Violation: ${violation.description}`)
    })
  })
})

// Seed test data
Cypress.Commands.add('seedTestData', () => {
  cy.task('seedDatabase')
})

// Cleanup test data
Cypress.Commands.add('cleanupTestData', () => {
  cy.task('cleanupDatabase')
})

// Mock Firebase Auth
Cypress.Commands.add('mockFirebaseAuth', (user) => {
  cy.window().its('firebase').then((firebase: any) => {
    if (firebase && firebase.auth) {
      cy.stub(firebase.auth(), 'currentUser').value(user)
      cy.stub(firebase.auth(), 'signInWithPopup').resolves({
        user,
        credential: null,
        operationType: 'signIn',
        providerId: 'google.com'
      })
      cy.stub(firebase.auth(), 'onAuthStateChanged').callsFake((callback: any) => {
        callback(user)
        return () => {}
      })
      cy.stub(firebase.auth(), 'signOut').resolves()
    }
  })
  
  cy.window().then((win) => {
    win.localStorage.setItem('omniy_user', JSON.stringify(user))
  })
})

// Mock Stripe payment
Cypress.Commands.add('mockStripePayment', (paymentData) => {
  cy.window().then((win) => {
    if (win.Stripe) {
      cy.stub(win.Stripe.prototype, 'redirectToCheckout').resolves({
        error: null
      })
    }
  })
})

// Upload file helper
Cypress.Commands.add('uploadFile', (selector: string, fileName: string, fileType: string = 'image/jpeg') => {
  cy.get(selector).then(subject => {
    cy.fixture(fileName, 'base64').then((content) => {
      const el = subject[0] as HTMLInputElement
      const testFile = new File([Cypress.Blob.base64StringToBlob(content)], fileName, { type: fileType })
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(testFile)
      el.files = dataTransfer.files
      
      cy.wrap(subject).trigger('change', { force: true })
    })
  })
})

// Fill schedule form
Cypress.Commands.add('fillScheduleForm', (data: any) => {
  if (data.caption) {
    cy.get('[data-testid="schedule-caption"]').type(data.caption)
  }
  
  if (data.scheduledAt) {
    cy.get('[data-testid="schedule-date"]').type(data.scheduledAt.split('T')[0])
    cy.get('[data-testid="schedule-time"]').type(data.scheduledAt.split('T')[1].substring(0, 5))
  }
  
  if (data.igAccount) {
    cy.get('[data-testid="ig-account-select"]').click()
    cy.get(`[data-testid="ig-account-option-${data.igAccount}"]`).click()
  }
  
  if (data.images && data.images.length > 0) {
    data.images.forEach((image: string, index: number) => {
      cy.uploadFile('[data-testid="image-upload"]', `test-image-${index + 1}.jpg`)
    })
  }
})

// Navigation helpers
Cypress.Commands.add('navigateToSchedules', () => {
  cy.get('[data-testid="nav-schedules"]').click()
  cy.url().should('include', '/schedules')
  cy.get('[data-testid="schedules-content"]').should('be.visible')
})

Cypress.Commands.add('navigateToAccounts', () => {
  cy.get('[data-testid="nav-accounts"]').click()
  cy.url().should('include', '/accounts')
  cy.get('[data-testid="accounts-content"]').should('be.visible')
})

Cypress.Commands.add('navigateToBilling', () => {
  cy.get('[data-testid="nav-billing"]').click()
  cy.url().should('include', '/billing')
  cy.get('[data-testid="billing-content"]').should('be.visible')
})

// Usage tracking helpers
Cypress.Commands.add('checkUsageLimits', (expectedLimits: any) => {
  cy.get('[data-testid="usage-dashboard"]').within(() => {
    if (expectedLimits.accounts) {
      cy.get('[data-testid="accounts-usage"]').should('contain', expectedLimits.accounts)
    }
    if (expectedLimits.posts) {
      cy.get('[data-testid="posts-usage"]').should('contain', expectedLimits.posts)
    }
    if (expectedLimits.plan) {
      cy.get('[data-testid="current-plan"]').should('contain', expectedLimits.plan)
    }
  })
})

// Error and success state helpers
Cypress.Commands.add('shouldShowError', (message: string) => {
  cy.get('[data-testid="error-message"]')
    .should('be.visible')
    .should('contain', message)
})

Cypress.Commands.add('shouldShowSuccess', (message: string) => {
  cy.get('[data-testid="success-message"]')
    .should('be.visible')
    .should('contain', message)
})

Cypress.Commands.add('shouldNotHaveLoadingSpinner', () => {
  cy.get('[data-testid="loading-spinner"]').should('not.exist')
})