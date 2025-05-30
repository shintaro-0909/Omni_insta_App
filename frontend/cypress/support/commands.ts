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
      
      /**
       * Mock API error responses
       */
      mockApiError(endpoint: string, statusCode?: number, message?: string): Chainable<void>
      
      /**
       * Mock post creation API
       */
      mockPostCreation(): Chainable<void>
      
      /**
       * Mock Instagram authentication
       */
      mockInstagramAuth(): Chainable<void>
      
      /**
       * Wait for specific API call
       */
      waitForApiCall(alias: string, timeout?: number): Chainable<void>
    }
  }
}

// Login command with improved Firebase mocking
Cypress.Commands.add('login', (email?: string, _password?: string) => {
  const testEmail = email || Cypress.env('TEST_USER_EMAIL') || 'test@omniy.app'
  const mockUser = {
    uid: 'test-user-id',
    email: testEmail,
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg'
  }
  
  // Mock Firebase Auth before visiting
  cy.mockFirebaseAuth(mockUser)
  
  cy.visit('/login')
  cy.waitForAppLoad()
  
  // Check if already logged in
  cy.get('body').then(($body) => {
    if ($body.find('[data-testid="login-form"]').length > 0) {
      // Click Google login button (mock will handle authentication)
      cy.get('[data-testid="google-login-btn"]').click()
      
      // Wait for redirect to dashboard
      cy.url({ timeout: 10000 }).should('include', '/dashboard')
      cy.get('[data-testid="dashboard-content"]', { timeout: 10000 }).should('be.visible')
    } else {
      // Already logged in, just verify we're on dashboard
      cy.url().should('include', '/dashboard')
    }
  })
})

// Enhanced logout with proper Firebase cleanup
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click()
  
  // Mock the logout process
  cy.window().then((win) => {
    if (win.firebase && win.firebase.auth) {
      cy.stub(win.firebase.auth(), 'signOut').resolves()
      cy.stub(win.firebase.auth(), 'currentUser').value(null)
      cy.stub(win.firebase.auth(), 'onAuthStateChanged').callsFake((callback: any) => {
        setTimeout(() => callback(null), 100)
        return () => {}
      })
    }
    
    // Clear auth data from localStorage
    win.localStorage.removeItem('omniy_user')
    win.localStorage.removeItem('omniy_auth_token')
  })
  
  cy.get('[data-testid="logout-btn"]').click()
  cy.url({ timeout: 10000 }).should('include', '/login')
  cy.get('[data-testid="login-form"]').should('be.visible')
})

// Wait for app load
Cypress.Commands.add('waitForAppLoad', () => {
  // Wait for Vue app to mount
  cy.get('[data-testid="app-loaded"]', { timeout: 10000 }).should('exist')
  
  // Wait for any loading indicators to disappear
  cy.get('[data-testid="loading"]').should('not.exist')
  
  // Wait for auth state to be determined
  cy.window().its('document.readyState').should('equal', 'complete')
})

// Enhanced test account creation with API mocking
Cypress.Commands.add('createTestAccount', (accountData) => {
  // Mock the account creation API
  cy.intercept('POST', '**/api/igAccounts', {
    statusCode: 200,
    body: {
      id: accountData.id || 'generated-id',
      username: accountData.username,
      displayName: accountData.displayName || accountData.username,
      profilePictureUrl: accountData.profilePictureUrl || 'https://example.com/default.jpg',
      status: 'active',
      createdAt: new Date().toISOString()
    }
  }).as('createAccount')
  
  cy.navigateToAccounts()
  cy.get('[data-testid="add-account-btn"]').click()
  
  cy.get('[data-testid="account-username"]').type(accountData.username)
  if (accountData.accessToken) {
    cy.get('[data-testid="account-token"]').type(accountData.accessToken)
  }
  if (accountData.displayName) {
    cy.get('[data-testid="account-display-name"]').type(accountData.displayName)
  }
  
  cy.get('[data-testid="save-account-btn"]').click()
  cy.wait('@createAccount')
  cy.get('[data-testid="success-message"]').should('be.visible')
})

// Enhanced test schedule creation with API mocking
Cypress.Commands.add('createTestSchedule', (scheduleData) => {
  // Mock the schedule creation API
  cy.intercept('POST', '**/api/schedules', {
    statusCode: 200,
    body: {
      id: scheduleData.id || 'generated-schedule-id',
      title: scheduleData.title || 'Test Schedule',
      type: scheduleData.type,
      contentId: scheduleData.contentId,
      accountId: scheduleData.accountId,
      status: 'active',
      scheduledAt: scheduleData.scheduledAt,
      repeatDays: scheduleData.repeatDays,
      repeatTime: scheduleData.repeatTime,
      createdAt: new Date().toISOString(),
      nextRunAt: scheduleData.scheduledAt || new Date().toISOString()
    }
  }).as('createSchedule')
  
  cy.navigateToSchedules()
  cy.get('[data-testid="create-schedule-btn"]').click()
  
  // Fill schedule form using the fillScheduleForm helper
  cy.fillScheduleForm(scheduleData)
  
  cy.get('[data-testid="save-schedule-btn"]').click()
  cy.wait('@createSchedule')
  cy.get('[data-testid="success-message"]').should('be.visible')
})

// Enhanced navigation with proper waiting
Cypress.Commands.add('navigateToView', (view: string) => {
  cy.get(`[data-testid="nav-${view}"]`).click()
  cy.url().should('include', `/${view}`)
  cy.get(`[data-testid="${view}-content"]`, { timeout: 10000 }).should('be.visible')
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

// Enhanced test data management
Cypress.Commands.add('seedTestData', () => {
  // Mock API responses for test data
  cy.intercept('GET', '**/api/igAccounts', {
    statusCode: 200,
    body: [
      {
        id: 'test-account-1',
        username: '@test_account_1',
        displayName: 'Test Account 1',
        profilePictureUrl: 'https://example.com/profile1.jpg',
        status: 'active'
      },
      {
        id: 'test-account-2', 
        username: '@test_account_2',
        displayName: 'Test Account 2',
        profilePictureUrl: 'https://example.com/profile2.jpg',
        status: 'active'
      }
    ]
  }).as('getAccounts')
  
  cy.intercept('GET', '**/api/posts', {
    statusCode: 200,
    body: [
      {
        id: 'test-content-1',
        title: 'Test Content 1',
        caption: 'This is test content for automated testing',
        mediaUrls: ['https://example.com/image1.jpg'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'test-content-2',
        title: 'Test Content 2', 
        caption: 'Another test content item',
        mediaUrls: ['https://example.com/image2.jpg'],
        createdAt: new Date().toISOString()
      }
    ]
  }).as('getPosts')
  
  cy.intercept('GET', '**/api/schedules', {
    statusCode: 200,
    body: []
  }).as('getSchedules')
  
  // Call the database seeding task if it exists
  cy.task('seedDatabase', null, { failOnStatusCode: false })
})

// Enhanced cleanup with API mocking
Cypress.Commands.add('cleanupTestData', () => {
  // Clear localStorage
  cy.window().then((win) => {
    win.localStorage.clear()
    win.sessionStorage.clear()
  })
  
  // Reset all intercepted API calls
  cy.intercept('DELETE', '**/api/schedules/*', { statusCode: 200 }).as('deleteSchedule')
  cy.intercept('DELETE', '**/api/posts/*', { statusCode: 200 }).as('deletePost')
  cy.intercept('DELETE', '**/api/igAccounts/*', { statusCode: 200 }).as('deleteAccount')
  
  // Call the database cleanup task if it exists
  cy.task('cleanupDatabase', null, { failOnStatusCode: false })
})

// Enhanced Firebase Auth mocking
Cypress.Commands.add('mockFirebaseAuth', (user) => {
  cy.window().then((win) => {
    // Set up Firebase Auth mocks before the app initializes
    if (!win.firebase) {
      win.firebase = {
        auth: () => ({
          currentUser: user,
          signInWithPopup: cy.stub().resolves({
            user,
            credential: null,
            operationType: 'signIn',
            providerId: 'google.com'
          }),
          onAuthStateChanged: cy.stub().callsFake((callback: any) => {
            setTimeout(() => callback(user), 100)
            return () => {}
          }),
          signOut: cy.stub().resolves(),
          getIdToken: cy.stub().resolves('mock-id-token'),
          getIdTokenResult: cy.stub().resolves({
            token: 'mock-id-token',
            claims: { uid: user.uid }
          })
        })
      }
    } else {
      // Firebase already exists, just stub the methods
      const auth = win.firebase.auth()
      cy.stub(auth, 'currentUser').value(user)
      cy.stub(auth, 'signInWithPopup').resolves({
        user,
        credential: null,
        operationType: 'signIn',
        providerId: 'google.com'
      })
      cy.stub(auth, 'onAuthStateChanged').callsFake((callback: any) => {
        setTimeout(() => callback(user), 100)
        return () => {}
      })
      cy.stub(auth, 'signOut').resolves()
      cy.stub(auth, 'getIdToken').resolves('mock-id-token')
    }
    
    // Set user data in localStorage for persistence
    win.localStorage.setItem('omniy_user', JSON.stringify(user))
    win.localStorage.setItem('omniy_auth_token', 'mock-id-token')
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

// Enhanced schedule form filling
Cypress.Commands.add('fillScheduleForm', (data: any) => {
  // Schedule type
  if (data.type) {
    cy.get('[data-testid="schedule-type"]').select(data.type)
  }
  
  // Schedule title
  if (data.title) {
    cy.get('[data-testid="schedule-title"]').type(data.title)
  }
  
  // Content selection
  if (data.contentId) {
    cy.get('[data-testid="schedule-content"]').select(data.contentId)
  }
  
  // Account selection
  if (data.accountId) {
    cy.get('[data-testid="schedule-account"]').select(data.accountId)
  }
  
  // Caption
  if (data.caption) {
    cy.get('[data-testid="schedule-caption"]').type(data.caption)
  }
  
  // Type-specific fields
  if (data.type === 'once') {
    if (data.scheduledAt) {
      const [date, time] = data.scheduledAt.split('T')
      cy.get('[data-testid="scheduled-date"]').type(date)
      cy.get('[data-testid="scheduled-time"]').type(time.substring(0, 5))
    }
  } else if (data.type === 'recurring') {
    if (data.repeatDays && Array.isArray(data.repeatDays)) {
      data.repeatDays.forEach((day: string) => {
        cy.get('[data-testid="repeat-days"]').within(() => {
          cy.get(`[data-testid="day-${day}"]`).check()
        })
      })
    }
    if (data.repeatTime) {
      cy.get('[data-testid="repeat-time"]').type(data.repeatTime)
    }
  } else if (data.type === 'random') {
    if (data.minInterval) {
      cy.get('[data-testid="random-min-interval"]').type(data.minInterval.toString())
    }
    if (data.maxInterval) {
      cy.get('[data-testid="random-max-interval"]').type(data.maxInterval.toString())
    }
    if (data.startTime) {
      cy.get('[data-testid="random-start-time"]').type(data.startTime)
    }
    if (data.endTime) {
      cy.get('[data-testid="random-end-time"]').type(data.endTime)
    }
    if (data.activeDays && Array.isArray(data.activeDays)) {
      data.activeDays.forEach((day: string) => {
        cy.get('[data-testid="random-days"]').within(() => {
          cy.get(`[data-testid="day-${day}"]`).check()
        })
      })
    }
  }
  
  // Media uploads
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

// Additional API mocking commands
Cypress.Commands.add('mockApiError', (endpoint: string, statusCode: number = 500, message: string = 'Internal Server Error') => {
  cy.intercept('**/api/**', (req) => {
    if (req.url.includes(endpoint)) {
      req.reply({
        statusCode,
        body: { error: message, code: statusCode }
      })
    }
  }).as('apiError')
})

Cypress.Commands.add('mockPostCreation', () => {
  cy.intercept('POST', '**/api/posts', {
    statusCode: 200,
    body: {
      id: 'generated-post-id',
      title: 'Test Post',
      caption: 'Test caption',
      mediaUrls: ['https://example.com/test-image.jpg'],
      createdAt: new Date().toISOString()
    }
  }).as('createPost')
})

Cypress.Commands.add('mockInstagramAuth', () => {
  cy.intercept('POST', '**/api/instagram/auth', {
    statusCode: 200,
    body: {
      accessToken: 'mock-instagram-token',
      userId: 'mock-instagram-user-id',
      username: 'test_instagram_user'
    }
  }).as('instagramAuth')
})

Cypress.Commands.add('waitForApiCall', (alias: string, timeout: number = 10000) => {
  cy.wait(`@${alias}`, { timeout })
})

// Enhanced file upload with better error handling
Cypress.Commands.add('uploadFile', (selector: string, fileName: string, fileType: string = 'image/jpeg') => {
  cy.get(selector).then(subject => {
    // Check if fixture exists, otherwise create a mock file
    cy.task('fileExists', fileName).then((exists) => {
      if (exists) {
        cy.fixture(fileName, 'base64').then((content) => {
          const el = subject[0] as HTMLInputElement
          const testFile = new File([Cypress.Blob.base64StringToBlob(content)], fileName, { type: fileType })
          const dataTransfer = new DataTransfer()
          dataTransfer.items.add(testFile)
          el.files = dataTransfer.files
          
          cy.wrap(subject).trigger('change', { force: true })
        })
      } else {
        // Create a mock file if fixture doesn't exist
        const mockContent = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
        const el = subject[0] as HTMLInputElement
        const testFile = new File([Cypress.Blob.base64StringToBlob(mockContent)], fileName, { type: fileType })
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(testFile)
        el.files = dataTransfer.files
        
        cy.wrap(subject).trigger('change', { force: true })
      }
    })
  })
})