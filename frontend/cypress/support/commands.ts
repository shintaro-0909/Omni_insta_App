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