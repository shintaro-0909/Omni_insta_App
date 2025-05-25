/// <reference types="cypress" />

describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.cleanupTestData()
  })

  it('should display login page for unauthenticated users', () => {
    cy.visit('/')
    cy.url().should('include', '/login')
    cy.get('[data-cy="login-form"]').should('be.visible')
    cy.get('[data-cy="google-login-btn"]').should('be.visible')
  })

  it('should redirect to dashboard after successful login', () => {
    cy.login()
    cy.url().should('include', '/dashboard')
    cy.get('[data-cy="dashboard-content"]').should('be.visible')
  })

  it('should show user information in the header', () => {
    cy.login()
    cy.get('[data-cy="user-menu"]').should('be.visible')
    cy.get('[data-cy="user-name"]').should('contain', 'Test User')
  })

  it('should logout successfully', () => {
    cy.login()
    cy.logout()
    cy.url().should('include', '/login')
  })

  it('should persist authentication state on page reload', () => {
    cy.login()
    cy.reload()
    cy.waitForAppLoad()
    cy.url().should('include', '/dashboard')
  })

  it('should redirect unauthenticated users to login', () => {
    cy.visit('/schedules')
    cy.url().should('include', '/login')
  })
})