/// <reference types="cypress" />

describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.clearCookies()
    // Mock Firebase Auth for testing
    cy.window().its('firebase').then((firebase: any) => {
      if (firebase && firebase.auth) {
        firebase.auth().signOut()
      }
    })
  })

  it('should display login page for unauthenticated users', () => {
    cy.visit('/')
    cy.url().should('include', '/login')
    cy.get('[data-testid="login-form"]').should('be.visible')
    cy.get('[data-testid="google-login-btn"]').should('be.visible')
    cy.contains('Welcome to Omniy').should('be.visible')
  })

  it('should show Google login button with correct styling', () => {
    cy.visit('/login')
    cy.get('[data-testid="google-login-btn"]')
      .should('be.visible')
      .should('contain', 'Continue with Google')
      .should('have.css', 'background-color')
  })

  it('should handle login errors gracefully', () => {
    cy.visit('/login')
    
    // Mock Firebase Auth error
    cy.window().its('firebase').then((firebase: any) => {
      cy.stub(firebase.auth(), 'signInWithPopup').rejects(new Error('auth/popup-blocked'))
    })
    
    cy.get('[data-testid="google-login-btn"]').click()
    cy.get('[data-testid="error-message"]').should('contain', 'Login failed')
  })

  it('should redirect to dashboard after successful login', () => {
    // Mock successful authentication
    cy.mockFirebaseAuth({
      uid: 'test-user-123',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: 'https://example.com/photo.jpg'
    })
    
    cy.visit('/login')
    cy.get('[data-testid="google-login-btn"]').click()
    
    cy.url().should('include', '/dashboard')
    cy.get('[data-testid="dashboard-content"]').should('be.visible')
    cy.get('[data-testid="welcome-message"]').should('contain', 'Welcome back, Test User')
  })

  it('should show user information in the header after login', () => {
    cy.mockFirebaseAuth({
      uid: 'test-user-123',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: 'https://example.com/photo.jpg'
    })
    
    cy.visit('/login')
    cy.get('[data-testid="google-login-btn"]').click()
    
    cy.get('[data-testid="user-menu"]').should('be.visible')
    cy.get('[data-testid="user-name"]').should('contain', 'Test User')
    cy.get('[data-testid="user-email"]').should('contain', 'test@example.com')
    cy.get('[data-testid="user-avatar"]').should('be.visible')
  })

  it('should logout successfully', () => {
    cy.mockFirebaseAuth({
      uid: 'test-user-123',
      email: 'test@example.com',
      displayName: 'Test User'
    })
    
    cy.visit('/dashboard')
    
    cy.get('[data-testid="user-menu"]').click()
    cy.get('[data-testid="logout-btn"]').click()
    
    cy.url().should('include', '/login')
    cy.get('[data-testid="login-form"]').should('be.visible')
  })

  it('should persist authentication state on page reload', () => {
    cy.mockFirebaseAuth({
      uid: 'test-user-123',
      email: 'test@example.com',
      displayName: 'Test User'
    })
    
    cy.visit('/dashboard')
    cy.reload()
    
    // Wait for auth state to be restored
    cy.get('[data-testid="dashboard-content"]', { timeout: 10000 }).should('be.visible')
    cy.url().should('include', '/dashboard')
  })

  it('should redirect unauthenticated users to login from protected routes', () => {
    cy.visit('/schedules')
    cy.url().should('include', '/login')
    
    cy.visit('/accounts')
    cy.url().should('include', '/login')
    
    cy.visit('/content')
    cy.url().should('include', '/login')
    
    cy.visit('/billing')
    cy.url().should('include', '/login')
  })

  it('should maintain intended destination after login', () => {
    // Try to access protected route
    cy.visit('/schedules')
    cy.url().should('include', '/login')
    
    // Login
    cy.mockFirebaseAuth({
      uid: 'test-user-123',
      email: 'test@example.com',
      displayName: 'Test User'
    })
    
    cy.get('[data-testid="google-login-btn"]').click()
    
    // Should redirect to originally intended page
    cy.url().should('include', '/schedules')
    cy.get('[data-testid="schedules-content"]').should('be.visible')
  })

  it('should handle authentication state changes', () => {
    // Start authenticated
    cy.mockFirebaseAuth({
      uid: 'test-user-123',
      email: 'test@example.com',
      displayName: 'Test User'
    })
    
    cy.visit('/dashboard')
    cy.get('[data-testid="dashboard-content"]').should('be.visible')
    
    // Simulate auth state change (user signs out from another tab)
    cy.window().its('firebase').then((firebase: any) => {
      firebase.auth().signOut()
    })
    
    // Should redirect to login
    cy.url().should('include', '/login')
  })

  it('should show loading state during authentication', () => {
    cy.visit('/login')
    
    // Mock slow authentication
    cy.window().its('firebase').then((firebase: any) => {
      cy.stub(firebase.auth(), 'signInWithPopup').callsFake(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve({
            user: {
              uid: 'test-user-123',
              email: 'test@example.com',
              displayName: 'Test User'
            }
          }), 2000)
        })
      })
    })
    
    cy.get('[data-testid="google-login-btn"]').click()
    cy.get('[data-testid="loading-spinner"]').should('be.visible')
    cy.get('[data-testid="google-login-btn"]').should('be.disabled')
  })

  it('should validate user permissions and roles', () => {
    cy.mockFirebaseAuth({
      uid: 'test-user-123',
      email: 'test@example.com',
      displayName: 'Test User'
    })
    
    cy.visit('/dashboard')
    
    // Check that user has access to basic features
    cy.get('[data-testid="nav-schedules"]').should('be.visible')
    cy.get('[data-testid="nav-content"]').should('be.visible')
    cy.get('[data-testid="nav-accounts"]').should('be.visible')
    
    // Check plan limitations are applied
    cy.get('[data-testid="usage-dashboard"]').should('be.visible')
    cy.get('[data-testid="plan-limits"]').should('contain', 'Free Plan')
  })
  
  it('should handle network errors during authentication', () => {
    cy.visit('/login')
    
    // Mock network error
    cy.window().then((win) => {
      if (win.firebase && win.firebase.auth) {
        cy.stub(win.firebase.auth(), 'signInWithPopup').rejects({
          code: 'auth/network-request-failed',
          message: 'A network error has occurred.'
        })
      }
    })
    
    cy.get('[data-testid="google-login-btn"]').click()
    cy.get('[data-testid="error-message"]', { timeout: 5000 })
      .should('be.visible')
      .should('contain.text', 'Network error')
  })
  
  it('should handle popup closed by user', () => {
    cy.visit('/login')
    
    // Mock popup closed error
    cy.window().then((win) => {
      if (win.firebase && win.firebase.auth) {
        cy.stub(win.firebase.auth(), 'signInWithPopup').rejects({
          code: 'auth/popup-closed-by-user',
          message: 'The popup has been closed by the user before finalizing the operation.'
        })
      }
    })
    
    cy.get('[data-testid="google-login-btn"]').click()
    // No error message should be shown for user-closed popup
    cy.get('[data-testid="error-message"]').should('not.exist')
  })
  
  it('should clear previous errors on new login attempt', () => {
    cy.visit('/login')
    
    // First attempt with error
    cy.window().then((win) => {
      if (win.firebase && win.firebase.auth) {
        cy.stub(win.firebase.auth(), 'signInWithPopup').rejects({
          code: 'auth/popup-blocked',
          message: 'The popup has been blocked.'
        })
      }
    })
    
    cy.get('[data-testid="google-login-btn"]').click()
    cy.get('[data-testid="error-message"]').should('be.visible')
    
    // Second attempt should clear error
    cy.window().then((win) => {
      if (win.firebase && win.firebase.auth) {
        cy.stub(win.firebase.auth(), 'signInWithPopup').resolves({
          user: {
            uid: 'test-user-123',
            email: 'test@example.com',
            displayName: 'Test User'
          }
        })
      }
    })
    
    cy.get('[data-testid="google-login-btn"]').click()
    cy.get('[data-testid="error-message"]').should('not.exist')
  })
})