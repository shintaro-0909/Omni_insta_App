/// <reference types="cypress" />

describe('Performance Tests', () => {
  beforeEach(() => {
    cy.login()
  })

  it('should load dashboard within performance budget', () => {
    cy.visit('/dashboard')
    cy.waitForAppLoad()
    cy.checkPerformance()
  })

  it('should load all main pages within performance budget', () => {
    const pages = ['dashboard', 'schedules', 'content', 'accounts', 'billing']
    
    pages.forEach(page => {
      cy.navigateToView(page)
      cy.checkPerformance()
    })
  })

  it('should handle large datasets efficiently', () => {
    // Navigate to schedules with many items
    cy.navigateToView('schedules')
    
    // Measure rendering time for large lists
    cy.window().then((_win) => {
      const start = performance.now()
      
      // Trigger re-render with large dataset
      cy.get('[data-cy="load-more-btn"]').click()
      
      cy.get('[data-cy="schedule-item"]').should('have.length.at.least', 50).then(() => {
        const end = performance.now()
        const renderTime = end - start
        expect(renderTime).to.be.lessThan(1000) // Should render within 1 second
      })
    })
  })

  it('should have good Core Web Vitals', () => {
    cy.visit('/dashboard')
    cy.waitForAppLoad()
    
    // Check Largest Contentful Paint (LCP)
    cy.window().then((_win) => {
      // Wait for LCP to be measured
      cy.wait(2000)
      
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lcpEntry = entries[entries.length - 1]
        expect(lcpEntry.startTime).to.be.lessThan(2500) // Good LCP threshold
      })
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    })
  })

  it('should cache resources effectively', () => {
    cy.visit('/dashboard')
    cy.waitForAppLoad()
    
    // Check that static resources are cached
    cy.window().then((_win) => {
      const entries = win.performance.getEntriesByType('resource')
      const cachedEntries = entries.filter(entry => 
        entry.transferSize === 0 && entry.decodedBodySize > 0
      )
      
      // Should have some cached resources
      expect(cachedEntries.length).to.be.greaterThan(0)
    })
  })

  it('should work offline (PWA functionality)', () => {
    cy.visit('/dashboard')
    cy.waitForAppLoad()
    
    // Simulate offline
    cy.window().then((_win) => {
      cy.wrap(win.navigator).invoke('setOnline', false)
    })
    
    // Should still be able to navigate
    cy.navigateToView('schedules')
    cy.get('[data-cy="schedules-title"]').should('be.visible')
    
    // Check offline indicator
    cy.get('[data-cy="offline-indicator"]').should('be.visible')
  })

  it('should handle concurrent API calls efficiently', () => {
    cy.intercept('GET', '/api/**').as('apiCalls')
    
    cy.visit('/dashboard')
    cy.waitForAppLoad()
    
    // Should not have too many concurrent API calls
    cy.get('@apiCalls.all').should('have.length.lessThan', 10)
  })
})