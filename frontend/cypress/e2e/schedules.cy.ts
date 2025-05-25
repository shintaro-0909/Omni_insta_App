/// <reference types="cypress" />

describe('Schedule Management', () => {
  beforeEach(() => {
    cy.cleanupTestData()
    cy.seedTestData()
    cy.login()
  })

  afterEach(() => {
    cy.cleanupTestData()
  })

  it('should display schedules page', () => {
    cy.navigateToView('schedules')
    cy.get('[data-cy="schedules-title"]').should('contain', 'Schedules')
    cy.get('[data-cy="create-schedule-btn"]').should('be.visible')
  })

  it('should create a one-time schedule', () => {
    cy.createTestSchedule({
      type: 'once',
      contentId: 'test-content-1',
      accountId: 'test-account-1',
      scheduledAt: '2024-12-25T10:00'
    })
    
    cy.get('[data-cy="schedule-list"]').should('contain', 'One-time')
  })

  it('should create a recurring schedule', () => {
    cy.createTestSchedule({
      type: 'recurring',
      contentId: 'test-content-1',
      accountId: 'test-account-1',
      repeatDays: ['monday', 'wednesday', 'friday'],
      repeatTime: '09:00'
    })
    
    cy.get('[data-cy="schedule-list"]').should('contain', 'Recurring')
  })

  it('should create a random schedule', () => {
    cy.navigateToView('schedules')
    cy.get('[data-cy="create-schedule-btn"]').click()
    
    cy.get('[data-cy="schedule-type"]').select('random')
    cy.get('[data-cy="schedule-content"]').select('test-content-1')
    cy.get('[data-cy="schedule-account"]').select('test-account-1')
    cy.get('[data-cy="random-min-interval"]').type('60')
    cy.get('[data-cy="random-max-interval"]').type('240')
    cy.get('[data-cy="random-start-time"]').type('09:00')
    cy.get('[data-cy="random-end-time"]').type('18:00')
    
    cy.get('[data-cy="save-schedule-btn"]').click()
    cy.get('[data-cy="success-message"]').should('be.visible')
  })

  it('should edit an existing schedule', () => {
    cy.createTestSchedule({
      type: 'once',
      contentId: 'test-content-1',
      accountId: 'test-account-1',
      scheduledAt: '2024-12-25T10:00'
    })
    
    cy.get('[data-cy="schedule-item"]').first().find('[data-cy="edit-btn"]').click()
    cy.get('[data-cy="scheduled-date"]').clear().type('2024-12-26T11:00')
    cy.get('[data-cy="save-schedule-btn"]').click()
    
    cy.get('[data-cy="success-message"]').should('be.visible')
  })

  it('should delete a schedule', () => {
    cy.createTestSchedule({
      type: 'once',
      contentId: 'test-content-1',
      accountId: 'test-account-1',
      scheduledAt: '2024-12-25T10:00'
    })
    
    cy.get('[data-cy="schedule-item"]').first().find('[data-cy="delete-btn"]').click()
    cy.get('[data-cy="confirm-delete-btn"]').click()
    
    cy.get('[data-cy="success-message"]').should('be.visible')
  })

  it('should pause and resume schedules', () => {
    cy.createTestSchedule({
      type: 'recurring',
      contentId: 'test-content-1',
      accountId: 'test-account-1',
      repeatDays: ['monday'],
      repeatTime: '09:00'
    })
    
    // Pause schedule
    cy.get('[data-cy="schedule-item"]').first().find('[data-cy="pause-btn"]').click()
    cy.get('[data-cy="schedule-status"]').should('contain', 'Paused')
    
    // Resume schedule
    cy.get('[data-cy="schedule-item"]').first().find('[data-cy="resume-btn"]').click()
    cy.get('[data-cy="schedule-status"]').should('contain', 'Active')
  })

  it('should filter schedules by status', () => {
    // Create multiple schedules with different statuses
    cy.createTestSchedule({
      type: 'once',
      contentId: 'test-content-1',
      accountId: 'test-account-1',
      scheduledAt: '2024-12-25T10:00'
    })
    
    cy.get('[data-cy="filter-status"]').select('active')
    cy.get('[data-cy="schedule-item"]').should('have.length.at.least', 1)
    
    cy.get('[data-cy="filter-status"]').select('all')
    cy.get('[data-cy="schedule-item"]').should('have.length.at.least', 1)
  })

  it('should search schedules', () => {
    cy.createTestSchedule({
      type: 'once',
      contentId: 'test-content-1',
      accountId: 'test-account-1',
      scheduledAt: '2024-12-25T10:00'
    })
    
    cy.get('[data-cy="search-input"]').type('test-content')
    cy.get('[data-cy="schedule-item"]').should('have.length.at.least', 1)
    
    cy.get('[data-cy="search-input"]').clear().type('nonexistent')
    cy.get('[data-cy="no-results"]').should('be.visible')
  })
})