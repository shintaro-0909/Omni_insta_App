/// <reference types="cypress" />

describe('Schedule Management', () => {
  const mockUser = {
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User'
  }

  beforeEach(() => {
    cy.cleanupTestData()
    cy.seedTestData()
    cy.mockFirebaseAuth(mockUser)
    cy.visit('/schedules')
    cy.get('[data-testid="schedules-content"]', { timeout: 10000 }).should('be.visible')
  })

  afterEach(() => {
    cy.cleanupTestData()
  })

  it('should display schedules page', () => {
    cy.get('[data-testid="schedules-title"]').should('contain', 'Schedules')
    cy.get('[data-testid="create-schedule-btn"]').should('be.visible')
    cy.get('[data-testid="schedule-list"]').should('be.visible')
    cy.get('[data-testid="filter-controls"]').should('be.visible')
    cy.get('[data-testid="search-input"]').should('be.visible')
  })

  it('should create a one-time schedule', () => {
    cy.get('[data-testid="create-schedule-btn"]').click()
    
    // Fill schedule form
    cy.get('[data-testid="schedule-type"]').select('once')
    cy.get('[data-testid="schedule-title"]').type('Test One-time Schedule')
    cy.get('[data-testid="schedule-content"]').select('test-content-1')
    cy.get('[data-testid="schedule-account"]').select('test-account-1')
    
    // Set future date
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 7)
    const dateStr = futureDate.toISOString().split('T')[0]
    
    cy.get('[data-testid="scheduled-date"]').type(dateStr)
    cy.get('[data-testid="scheduled-time"]').type('10:00')
    
    cy.get('[data-testid="save-schedule-btn"]').click()
    cy.get('[data-testid="success-message"]').should('be.visible')
    
    // Verify schedule appears in list
    cy.get('[data-testid="schedule-list"]').should('contain', 'Test One-time Schedule')
    cy.get('[data-testid="schedule-type-badge"]').should('contain', 'One-time')
  })

  it('should create a recurring schedule', () => {
    cy.get('[data-testid="create-schedule-btn"]').click()
    
    // Fill schedule form
    cy.get('[data-testid="schedule-type"]').select('recurring')
    cy.get('[data-testid="schedule-title"]').type('Test Recurring Schedule')
    cy.get('[data-testid="schedule-content"]').select('test-content-1')
    cy.get('[data-testid="schedule-account"]').select('test-account-1')
    
    // Set recurring options
    cy.get('[data-testid="repeat-days"]').within(() => {
      cy.get('[data-testid="day-monday"]').check()
      cy.get('[data-testid="day-wednesday"]').check()
      cy.get('[data-testid="day-friday"]').check()
    })
    
    cy.get('[data-testid="repeat-time"]').type('09:00')
    
    cy.get('[data-testid="save-schedule-btn"]').click()
    cy.get('[data-testid="success-message"]').should('be.visible')
    
    // Verify schedule appears in list
    cy.get('[data-testid="schedule-list"]').should('contain', 'Test Recurring Schedule')
    cy.get('[data-testid="schedule-type-badge"]').should('contain', 'Recurring')
  })

  it('should create a random schedule', () => {
    cy.get('[data-testid="create-schedule-btn"]').click()
    
    cy.get('[data-testid="schedule-type"]').select('random')
    cy.get('[data-testid="schedule-title"]').type('Test Random Schedule')
    cy.get('[data-testid="schedule-content"]').select('test-content-1')
    cy.get('[data-testid="schedule-account"]').select('test-account-1')
    
    // Random schedule specific fields
    cy.get('[data-testid="random-min-interval"]').type('60')
    cy.get('[data-testid="random-max-interval"]').type('240')
    cy.get('[data-testid="random-start-time"]').type('09:00')
    cy.get('[data-testid="random-end-time"]').type('18:00')
    
    // Set active days
    cy.get('[data-testid="random-days"]').within(() => {
      cy.get('[data-testid="day-monday"]').check()
      cy.get('[data-testid="day-tuesday"]').check()
      cy.get('[data-testid="day-wednesday"]').check()
      cy.get('[data-testid="day-thursday"]').check()
      cy.get('[data-testid="day-friday"]').check()
    })
    
    cy.get('[data-testid="save-schedule-btn"]').click()
    cy.get('[data-testid="success-message"]').should('be.visible')
    
    // Verify schedule appears in list
    cy.get('[data-testid="schedule-list"]').should('contain', 'Test Random Schedule')
    cy.get('[data-testid="schedule-type-badge"]').should('contain', 'Random')
  })

  it('should edit an existing schedule', () => {
    // First create a schedule
    cy.get('[data-testid="create-schedule-btn"]').click()
    cy.get('[data-testid="schedule-type"]').select('once')
    cy.get('[data-testid="schedule-title"]').type('Original Schedule')
    cy.get('[data-testid="schedule-content"]').select('test-content-1')
    cy.get('[data-testid="schedule-account"]').select('test-account-1')
    
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 7)
    const dateStr = futureDate.toISOString().split('T')[0]
    
    cy.get('[data-testid="scheduled-date"]').type(dateStr)
    cy.get('[data-testid="scheduled-time"]').type('10:00')
    cy.get('[data-testid="save-schedule-btn"]').click()
    cy.get('[data-testid="success-message"]').should('be.visible')
    
    // Now edit the schedule
    cy.get('[data-testid="schedule-item"]').first().find('[data-testid="edit-btn"]').click()
    
    // Update fields
    cy.get('[data-testid="schedule-title"]').clear().type('Updated Schedule')
    cy.get('[data-testid="scheduled-time"]').clear().type('11:00')
    
    cy.get('[data-testid="save-schedule-btn"]').click()
    cy.get('[data-testid="success-message"]').should('be.visible')
    
    // Verify changes
    cy.get('[data-testid="schedule-list"]').should('contain', 'Updated Schedule')
    cy.get('[data-testid="schedule-time"]').should('contain', '11:00')
  })

  it('should delete a schedule', () => {
    // First create a schedule
    cy.get('[data-testid="create-schedule-btn"]').click()
    cy.get('[data-testid="schedule-type"]').select('once')
    cy.get('[data-testid="schedule-title"]').type('Schedule to Delete')
    cy.get('[data-testid="schedule-content"]').select('test-content-1')
    cy.get('[data-testid="schedule-account"]').select('test-account-1')
    
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 7)
    const dateStr = futureDate.toISOString().split('T')[0]
    
    cy.get('[data-testid="scheduled-date"]').type(dateStr)
    cy.get('[data-testid="scheduled-time"]').type('10:00')
    cy.get('[data-testid="save-schedule-btn"]').click()
    cy.get('[data-testid="success-message"]').should('be.visible')
    
    // Count schedules before deletion
    cy.get('[data-testid="schedule-item"]').its('length').then((initialCount) => {
      // Delete the schedule
      cy.get('[data-testid="schedule-item"]').first().find('[data-testid="delete-btn"]').click()
      cy.get('[data-testid="confirm-delete-dialog"]').should('be.visible')
      cy.get('[data-testid="confirm-delete-btn"]').click()
      
      cy.get('[data-testid="success-message"]').should('be.visible')
      
      // Verify schedule count decreased
      cy.get('[data-testid="schedule-item"]').should('have.length', initialCount - 1)
      cy.get('[data-testid="schedule-list"]').should('not.contain', 'Schedule to Delete')
    })
  })

  it('should pause and resume schedules', () => {
    // Create a recurring schedule
    cy.get('[data-testid="create-schedule-btn"]').click()
    cy.get('[data-testid="schedule-type"]').select('recurring')
    cy.get('[data-testid="schedule-title"]').type('Schedule to Pause')
    cy.get('[data-testid="schedule-content"]').select('test-content-1')
    cy.get('[data-testid="schedule-account"]').select('test-account-1')
    
    cy.get('[data-testid="repeat-days"]').within(() => {
      cy.get('[data-testid="day-monday"]').check()
    })
    cy.get('[data-testid="repeat-time"]').type('09:00')
    
    cy.get('[data-testid="save-schedule-btn"]').click()
    cy.get('[data-testid="success-message"]').should('be.visible')
    
    // Verify initial status is active
    cy.get('[data-testid="schedule-status"]').should('contain', 'Active')
    
    // Pause schedule
    cy.get('[data-testid="schedule-item"]').first().find('[data-testid="pause-btn"]').click()
    cy.get('[data-testid="schedule-status"]').should('contain', 'Paused')
    cy.get('[data-testid="pause-btn"]').should('not.exist')
    cy.get('[data-testid="resume-btn"]').should('be.visible')
    
    // Resume schedule
    cy.get('[data-testid="schedule-item"]').first().find('[data-testid="resume-btn"]').click()
    cy.get('[data-testid="schedule-status"]').should('contain', 'Active')
    cy.get('[data-testid="resume-btn"]').should('not.exist')
    cy.get('[data-testid="pause-btn"]').should('be.visible')
  })

  it('should filter schedules by status', () => {
    // Create active schedule
    cy.get('[data-testid="create-schedule-btn"]').click()
    cy.get('[data-testid="schedule-type"]').select('once')
    cy.get('[data-testid="schedule-title"]').type('Active Schedule')
    cy.get('[data-testid="schedule-content"]').select('test-content-1')
    cy.get('[data-testid="schedule-account"]').select('test-account-1')
    
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 7)
    const dateStr = futureDate.toISOString().split('T')[0]
    
    cy.get('[data-testid="scheduled-date"]').type(dateStr)
    cy.get('[data-testid="scheduled-time"]').type('10:00')
    cy.get('[data-testid="save-schedule-btn"]').click()
    cy.get('[data-testid="success-message"]').should('be.visible')
    
    // Create another schedule and pause it
    cy.get('[data-testid="create-schedule-btn"]').click()
    cy.get('[data-testid="schedule-type"]').select('recurring')
    cy.get('[data-testid="schedule-title"]').type('Paused Schedule')
    cy.get('[data-testid="schedule-content"]').select('test-content-1')
    cy.get('[data-testid="schedule-account"]').select('test-account-1')
    
    cy.get('[data-testid="repeat-days"]').within(() => {
      cy.get('[data-testid="day-monday"]').check()
    })
    cy.get('[data-testid="repeat-time"]').type('14:00')
    cy.get('[data-testid="save-schedule-btn"]').click()
    cy.get('[data-testid="success-message"]').should('be.visible')
    
    // Pause the second schedule
    cy.get('[data-testid="schedule-item"]').contains('Paused Schedule')
      .parent().find('[data-testid="pause-btn"]').click()
    
    // Test filtering
    cy.get('[data-testid="filter-status"]').select('active')
    cy.get('[data-testid="schedule-item"]').should('contain', 'Active Schedule')
    cy.get('[data-testid="schedule-item"]').should('not.contain', 'Paused Schedule')
    
    cy.get('[data-testid="filter-status"]').select('paused')
    cy.get('[data-testid="schedule-item"]').should('contain', 'Paused Schedule')
    cy.get('[data-testid="schedule-item"]').should('not.contain', 'Active Schedule')
    
    cy.get('[data-testid="filter-status"]').select('all')
    cy.get('[data-testid="schedule-item"]').should('contain', 'Active Schedule')
    cy.get('[data-testid="schedule-item"]').should('contain', 'Paused Schedule')
  })

  it('should search schedules', () => {
    // Create multiple schedules with different titles
    const schedules = [
      { title: 'Marketing Campaign', type: 'once' },
      { title: 'Product Launch', type: 'recurring' },
      { title: 'Daily Updates', type: 'random' }
    ]
    
    schedules.forEach((schedule, index) => {
      cy.get('[data-testid="create-schedule-btn"]').click()
      cy.get('[data-testid="schedule-type"]').select(schedule.type)
      cy.get('[data-testid="schedule-title"]').type(schedule.title)
      cy.get('[data-testid="schedule-content"]').select('test-content-1')
      cy.get('[data-testid="schedule-account"]').select('test-account-1')
      
      if (schedule.type === 'once') {
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + index + 1)
        const dateStr = futureDate.toISOString().split('T')[0]
        cy.get('[data-testid="scheduled-date"]').type(dateStr)
        cy.get('[data-testid="scheduled-time"]').type('10:00')
      } else if (schedule.type === 'recurring') {
        cy.get('[data-testid="repeat-days"]').within(() => {
          cy.get('[data-testid="day-monday"]').check()
        })
        cy.get('[data-testid="repeat-time"]').type('09:00')
      } else {
        cy.get('[data-testid="random-min-interval"]').type('60')
        cy.get('[data-testid="random-max-interval"]').type('120')
        cy.get('[data-testid="random-start-time"]').type('09:00')
        cy.get('[data-testid="random-end-time"]').type('17:00')
        cy.get('[data-testid="random-days"]').within(() => {
          cy.get('[data-testid="day-monday"]').check()
        })
      }
      
      cy.get('[data-testid="save-schedule-btn"]').click()
      cy.get('[data-testid="success-message"]').should('be.visible')
    })
    
    // Test search functionality
    cy.get('[data-testid="search-input"]').type('Marketing')
    cy.get('[data-testid="schedule-item"]').should('have.length', 1)
    cy.get('[data-testid="schedule-item"]').should('contain', 'Marketing Campaign')
    
    cy.get('[data-testid="search-input"]').clear().type('Launch')
    cy.get('[data-testid="schedule-item"]').should('have.length', 1)
    cy.get('[data-testid="schedule-item"]').should('contain', 'Product Launch')
    
    cy.get('[data-testid="search-input"]').clear().type('nonexistent')
    cy.get('[data-testid="no-results"]').should('be.visible')
    cy.get('[data-testid="schedule-item"]').should('not.exist')
    
    // Clear search to show all results
    cy.get('[data-testid="search-input"]').clear()
    cy.get('[data-testid="schedule-item"]').should('have.length', 3)
  })
  
  it('should filter schedules by type', () => {
    // Create schedules of different types
    const scheduleTypes = ['once', 'recurring', 'random']
    
    scheduleTypes.forEach((type, index) => {
      cy.get('[data-testid="create-schedule-btn"]').click()
      cy.get('[data-testid="schedule-type"]').select(type)
      cy.get('[data-testid="schedule-title"]').type(`${type} Schedule`)
      cy.get('[data-testid="schedule-content"]').select('test-content-1')
      cy.get('[data-testid="schedule-account"]').select('test-account-1')
      
      if (type === 'once') {
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + index + 1)
        const dateStr = futureDate.toISOString().split('T')[0]
        cy.get('[data-testid="scheduled-date"]').type(dateStr)
        cy.get('[data-testid="scheduled-time"]').type('10:00')
      } else if (type === 'recurring') {
        cy.get('[data-testid="repeat-days"]').within(() => {
          cy.get('[data-testid="day-monday"]').check()
        })
        cy.get('[data-testid="repeat-time"]').type('09:00')
      } else {
        cy.get('[data-testid="random-min-interval"]').type('60')
        cy.get('[data-testid="random-max-interval"]').type('120')
        cy.get('[data-testid="random-start-time"]').type('09:00')
        cy.get('[data-testid="random-end-time"]').type('17:00')
        cy.get('[data-testid="random-days"]').within(() => {
          cy.get('[data-testid="day-monday"]').check()
        })
      }
      
      cy.get('[data-testid="save-schedule-btn"]').click()
      cy.get('[data-testid="success-message"]').should('be.visible')
    })
    
    // Test type filtering
    cy.get('[data-testid="filter-type"]').select('once')
    cy.get('[data-testid="schedule-item"]').should('have.length', 1)
    cy.get('[data-testid="schedule-type-badge"]').should('contain', 'One-time')
    
    cy.get('[data-testid="filter-type"]').select('recurring')
    cy.get('[data-testid="schedule-item"]').should('have.length', 1)
    cy.get('[data-testid="schedule-type-badge"]').should('contain', 'Recurring')
    
    cy.get('[data-testid="filter-type"]').select('random')
    cy.get('[data-testid="schedule-item"]').should('have.length', 1)
    cy.get('[data-testid="schedule-type-badge"]').should('contain', 'Random')
    
    cy.get('[data-testid="filter-type"]').select('all')
    cy.get('[data-testid="schedule-item"]').should('have.length', 3)
  })
  
  it('should handle validation errors', () => {
    cy.get('[data-testid="create-schedule-btn"]').click()
    
    // Try to save without required fields
    cy.get('[data-testid="save-schedule-btn"]').click()
    cy.get('[data-testid="error-message"]').should('be.visible')
    cy.get('[data-testid="error-message"]').should('contain', 'Title is required')
    
    // Fill title but leave other required fields empty
    cy.get('[data-testid="schedule-title"]').type('Test Schedule')
    cy.get('[data-testid="save-schedule-btn"]').click()
    cy.get('[data-testid="error-message"]').should('contain', 'Content is required')
    
    // Fill content but leave account empty
    cy.get('[data-testid="schedule-content"]').select('test-content-1')
    cy.get('[data-testid="save-schedule-btn"]').click()
    cy.get('[data-testid="error-message"]').should('contain', 'Account is required')
  })
})