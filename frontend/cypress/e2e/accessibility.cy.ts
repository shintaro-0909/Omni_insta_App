/// <reference types="cypress" />

describe('Accessibility Tests', () => {
  beforeEach(() => {
    cy.login()
  })

  it('should have no accessibility violations on main pages', () => {
    const pages = ['dashboard', 'schedules', 'content', 'accounts', 'billing']
    
    pages.forEach(page => {
      cy.navigateToView(page)
      cy.checkA11y()
    })
  })

  it('should support keyboard navigation', () => {
    cy.navigateToView('schedules')
    
    // Test Tab navigation
    cy.get('body').tab()
    cy.focused().should('have.attr', 'data-cy', 'create-schedule-btn')
    
    // Test Enter key activation
    cy.focused().type('{enter}')
    cy.get('[data-cy="schedule-form"]').should('be.visible')
    
    // Test Escape key to close
    cy.get('body').type('{esc}')
    cy.get('[data-cy="schedule-form"]').should('not.exist')
  })

  it('should have proper ARIA labels and roles', () => {
    cy.navigateToView('schedules')
    
    // Check main navigation
    cy.get('[role="navigation"]').should('exist')
    cy.get('[aria-label]').should('have.length.at.least', 5)
    
    // Check form controls
    cy.get('[data-cy="create-schedule-btn"]').click()
    cy.get('[data-cy="schedule-form"] input').each(($input) => {
      cy.wrap($input).should('have.attr', 'aria-label')
    })
  })

  it('should work with screen readers', () => {
    cy.navigateToView('dashboard')
    
    // Check heading structure
    cy.get('h1').should('exist')
    cy.get('h2').should('exist')
    
    // Check that interactive elements have accessible names
    cy.get('button').each(($btn) => {
      // Should have either aria-label, aria-labelledby, or text content
      cy.wrap($btn).should(($el) => {
        const hasAriaLabel = $el.attr('aria-label')
        const hasAriaLabelledby = $el.attr('aria-labelledby')
        const hasTextContent = $el.text().trim()
        
        expect(hasAriaLabel || hasAriaLabelledby || hasTextContent).to.be.ok
      })
    })
  })

  it('should have sufficient color contrast', () => {
    cy.navigateToView('dashboard')
    
    // This would typically be handled by axe-core
    cy.checkA11y(null, {
      rules: {
        'color-contrast': { enabled: true }
      }
    })
  })

  it('should work without JavaScript (progressive enhancement)', () => {
    // This test would require special setup to disable JavaScript
    // For now, we'll check that critical content is in HTML
    cy.visit('/dashboard')
    
    cy.get('noscript').should('exist')
    cy.get('[data-cy="app-loaded"]').should('exist')
  })

  it('should support high contrast mode', () => {
    // Simulate high contrast mode
    cy.visit('/dashboard', {
      onBeforeLoad: (win) => {
        win.matchMedia = cy.stub().returns({
          matches: true,
          addListener: () => {},
          removeListener: () => {}
        })
      }
    })
    
    cy.waitForAppLoad()
    cy.checkA11y()
  })

  it('should be usable with reduced motion', () => {
    // Simulate reduced motion preference
    cy.visit('/dashboard', {
      onBeforeLoad: (win) => {
        Object.defineProperty(win, 'matchMedia', {
          value: cy.stub().returns({
            matches: true,
            addListener: () => {},
            removeListener: () => {}
          })
        })
      }
    })
    
    cy.waitForAppLoad()
    
    // Check that animations are reduced or disabled
    cy.get('.v-btn').should('have.css', 'transition-duration', '0s')
  })

  it('should have proper focus management', () => {
    cy.navigateToView('schedules')
    cy.get('[data-cy="create-schedule-btn"]').click()
    
    // Focus should be on the first form field
    cy.focused().should('match', 'input, select, textarea')
    
    // When closing, focus should return to trigger
    cy.get('body').type('{esc}')
    cy.focused().should('have.attr', 'data-cy', 'create-schedule-btn')
  })
})