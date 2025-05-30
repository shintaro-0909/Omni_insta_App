/// <reference types="cypress" />

describe('Instagram Account Management', () => {
  const mockUser = {
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User'
  }

  beforeEach(() => {
    cy.cleanupTestData()
    cy.seedTestData()
    cy.mockFirebaseAuth(mockUser)
    cy.visit('/accounts')
    cy.get('[data-testid="accounts-content"]', { timeout: 10000 }).should('be.visible')
  })

  afterEach(() => {
    cy.cleanupTestData()
  })

  it('should display accounts page', () => {
    cy.get('[data-testid="accounts-title"]').should('contain', 'Instagram Accounts')
    cy.get('[data-testid="add-account-btn"]').should('be.visible')
    cy.get('[data-testid="accounts-grid"]').should('be.visible')
    cy.get('[data-testid="account-usage-info"]').should('be.visible')
  })

  it('should show plan limits for account creation', () => {
    // Mock plan limits
    cy.intercept('GET', '**/api/planLimits', {
      statusCode: 200,
      body: {
        plan: 'free',
        accountsUsed: 0,
        accountsLimit: 1,
        postsUsed: 0,
        postsLimit: 10
      }
    }).as('getPlanLimits')
    
    cy.wait('@getPlanLimits')
    cy.get('[data-testid="plan-info"]').should('contain', 'Free Plan')
    cy.get('[data-testid="accounts-usage"]').should('contain', '0 / 1 accounts')
  })

  it('should add a new Instagram account', () => {
    cy.mockInstagramAuth()
    cy.mockApiError('igAccounts', 200) // Reset error mock
    
    // Mock successful account creation
    cy.intercept('POST', '**/api/igAccounts', {
      statusCode: 200,
      body: {
        id: 'new-account-id',
        username: 'test_new_account',
        displayName: 'Test New Account',
        profilePictureUrl: 'https://example.com/new-profile.jpg',
        status: 'active',
        followersCount: 1500,
        followingCount: 300,
        postsCount: 45,
        createdAt: new Date().toISOString()
      }
    }).as('createAccount')
    
    cy.get('[data-testid="add-account-btn"]').click()
    cy.get('[data-testid="add-account-dialog"]').should('be.visible')
    
    // Test Instagram OAuth flow
    cy.get('[data-testid="connect-instagram-btn"]').click()
    cy.waitForApiCall('instagramAuth')
    
    // Fill account details
    cy.get('[data-testid="account-username"]').should('have.value', 'test_new_account')
    cy.get('[data-testid="account-display-name"]').clear().type('My Test Account')
    
    cy.get('[data-testid="save-account-btn"]').click()
    cy.waitForApiCall('createAccount')
    cy.get('[data-testid="success-message"]').should('be.visible')
    
    // Verify account appears in list
    cy.get('[data-testid="account-card"]').should('contain', 'My Test Account')
    cy.get('[data-testid="account-username"]').should('contain', '@test_new_account')
  })

  it('should handle Instagram authentication errors', () => {
    // Mock Instagram auth error
    cy.intercept('POST', '**/api/instagram/auth', {
      statusCode: 400,
      body: { error: 'Invalid authorization code' }
    }).as('instagramAuthError')
    
    cy.get('[data-testid="add-account-btn"]').click()
    cy.get('[data-testid="connect-instagram-btn"]').click()
    
    cy.waitForApiCall('instagramAuthError')
    cy.get('[data-testid="error-message"]').should('be.visible')
    cy.get('[data-testid="error-message"]').should('contain', 'Failed to connect Instagram account')
  })

  it('should handle plan limit exceeded', () => {
    // Mock plan limits exceeded
    cy.intercept('GET', '**/api/planLimits', {
      statusCode: 200,
      body: {
        plan: 'free',
        accountsUsed: 1,
        accountsLimit: 1,
        postsUsed: 5,
        postsLimit: 10
      }
    }).as('getPlanLimitsExceeded')
    
    cy.intercept('POST', '**/api/igAccounts', {
      statusCode: 403,
      body: { error: 'Account limit exceeded' }
    }).as('accountLimitError')
    
    cy.wait('@getPlanLimitsExceeded')
    cy.get('[data-testid="add-account-btn"]').should('be.disabled')
    cy.get('[data-testid="upgrade-plan-message"]').should('be.visible')
    cy.get('[data-testid="upgrade-plan-btn"]').should('be.visible')
  })

  it('should edit account settings', () => {
    // Mock account update
    cy.intercept('PUT', '**/api/igAccounts/*', {
      statusCode: 200,
      body: {
        id: 'test-account-1',
        username: 'test_account_1',
        displayName: 'Updated Account Name',
        profilePictureUrl: 'https://example.com/updated-profile.jpg',
        status: 'active',
        settings: {
          autoPost: true,
          notifications: false
        }
      }
    }).as('updateAccount')
    
    cy.get('[data-testid="account-card"]').first().find('[data-testid="edit-btn"]').click()
    cy.get('[data-testid="edit-account-dialog"]').should('be.visible')
    
    // Update account settings
    cy.get('[data-testid="account-display-name"]').clear().type('Updated Account Name')
    cy.get('[data-testid="auto-post-toggle"]').click()
    cy.get('[data-testid="notifications-toggle"]').click()
    
    cy.get('[data-testid="save-changes-btn"]').click()
    cy.waitForApiCall('updateAccount')
    cy.get('[data-testid="success-message"]').should('be.visible')
    
    // Verify changes
    cy.get('[data-testid="account-card"]').should('contain', 'Updated Account Name')
  })

  it('should disconnect an Instagram account', () => {
    // Mock account deletion
    cy.intercept('DELETE', '**/api/igAccounts/*', {
      statusCode: 200,
      body: { success: true }
    }).as('deleteAccount')
    
    // Count accounts before deletion
    cy.get('[data-testid="account-card"]').its('length').then((initialCount) => {
      cy.get('[data-testid="account-card"]').first().find('[data-testid="disconnect-btn"]').click()
      cy.get('[data-testid="confirm-disconnect-dialog"]').should('be.visible')
      
      // Confirm account details in dialog
      cy.get('[data-testid="confirm-account-username"]').should('contain', '@test_account_1')
      cy.get('[data-testid="warning-message"]').should('contain', 'All schedules for this account will be deleted')
      
      cy.get('[data-testid="confirm-disconnect-btn"]').click()
      cy.waitForApiCall('deleteAccount')
      cy.get('[data-testid="success-message"]').should('be.visible')
      
      // Verify account count decreased
      cy.get('[data-testid="account-card"]').should('have.length', initialCount - 1)
    })
  })

  it('should refresh account data', () => {
    // Mock account refresh
    cy.intercept('POST', '**/api/igAccounts/*/refresh', {
      statusCode: 200,
      body: {
        id: 'test-account-1',
        username: 'test_account_1',
        displayName: 'Test Account 1',
        profilePictureUrl: 'https://example.com/refreshed-profile.jpg',
        followersCount: 1750, // Updated count
        followingCount: 320,
        postsCount: 52,
        lastRefreshed: new Date().toISOString()
      }
    }).as('refreshAccount')
    
    cy.get('[data-testid="account-card"]').first().find('[data-testid="refresh-btn"]').click()
    cy.get('[data-testid="loading-spinner"]').should('be.visible')
    
    cy.waitForApiCall('refreshAccount')
    cy.get('[data-testid="loading-spinner"]').should('not.exist')
    cy.get('[data-testid="followers-count"]').should('contain', '1,750')
    cy.get('[data-testid="last-updated"]').should('contain', 'just now')
  })

  it('should handle account connection errors', () => {
    // Mock connection error
    cy.intercept('POST', '**/api/igAccounts/*/refresh', {
      statusCode: 401,
      body: { error: 'Instagram access token expired' }
    }).as('refreshError')
    
    cy.get('[data-testid="account-card"]').first().find('[data-testid="refresh-btn"]').click()
    cy.waitForApiCall('refreshError')
    
    cy.get('[data-testid="error-message"]').should('be.visible')
    cy.get('[data-testid="error-message"]').should('contain', 'Instagram access token expired')
    cy.get('[data-testid="reconnect-btn"]').should('be.visible')
  })

  it('should display account analytics', () => {
    // Mock analytics data
    cy.intercept('GET', '**/api/igAccounts/*/analytics', {
      statusCode: 200,
      body: {
        followersChange: '+15',
        engagementRate: '3.2%',
        recentPosts: 5,
        totalReach: 2500,
        profileViews: 150
      }
    }).as('getAnalytics')
    
    cy.get('[data-testid="account-card"]').first().find('[data-testid="analytics-btn"]').click()
    cy.get('[data-testid="analytics-dialog"]').should('be.visible')
    
    cy.waitForApiCall('getAnalytics')
    
    // Verify analytics display
    cy.get('[data-testid="followers-change"]').should('contain', '+15')
    cy.get('[data-testid="engagement-rate"]').should('contain', '3.2%')
    cy.get('[data-testid="recent-posts"]').should('contain', '5')
    cy.get('[data-testid="total-reach"]').should('contain', '2,500')
    cy.get('[data-testid="profile-views"]').should('contain', '150')
    
    // Close analytics
    cy.get('[data-testid="close-analytics-btn"]').click()
    cy.get('[data-testid="analytics-dialog"]').should('not.exist')
  })

  it('should filter accounts by status', () => {
    // Mock accounts with different statuses
    cy.intercept('GET', '**/api/igAccounts', {
      statusCode: 200,
      body: [
        {
          id: 'active-account',
          username: 'active_account',
          displayName: 'Active Account',
          status: 'active',
          profilePictureUrl: 'https://example.com/active.jpg'
        },
        {
          id: 'error-account',
          username: 'error_account',
          displayName: 'Error Account',
          status: 'error',
          profilePictureUrl: 'https://example.com/error.jpg',
          error: 'Token expired'
        },
        {
          id: 'pending-account',
          username: 'pending_account',
          displayName: 'Pending Account',
          status: 'pending',
          profilePictureUrl: 'https://example.com/pending.jpg'
        }
      ]
    }).as('getAccountsWithStatus')
    
    cy.reload()
    cy.wait('@getAccountsWithStatus')
    
    // Filter by active accounts
    cy.get('[data-testid="status-filter"]').select('active')
    cy.get('[data-testid="account-card"]').should('have.length', 1)
    cy.get('[data-testid="account-card"]').should('contain', 'Active Account')
    
    // Filter by error accounts
    cy.get('[data-testid="status-filter"]').select('error')
    cy.get('[data-testid="account-card"]').should('have.length', 1)
    cy.get('[data-testid="account-card"]').should('contain', 'Error Account')
    cy.get('[data-testid="error-badge"]').should('be.visible')
    
    // Show all accounts
    cy.get('[data-testid="status-filter"]').select('all')
    cy.get('[data-testid="account-card"]').should('have.length', 3)
  })

  it('should search accounts by username', () => {
    cy.get('[data-testid="search-accounts"]').type('test_account_1')
    cy.get('[data-testid="account-card"]').should('have.length', 1)
    cy.get('[data-testid="account-card"]').should('contain', '@test_account_1')
    
    cy.get('[data-testid="search-accounts"]').clear().type('nonexistent')
    cy.get('[data-testid="no-accounts-found"]').should('be.visible')
    
    cy.get('[data-testid="search-accounts"]').clear()
    cy.get('[data-testid="account-card"]').should('have.length.at.least', 1)
  })

  it('should handle account token refresh', () => {
    // Mock token refresh
    cy.intercept('POST', '**/api/igAccounts/*/refresh-token', {
      statusCode: 200,
      body: {
        id: 'test-account-1',
        status: 'active',
        tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
      }
    }).as('refreshToken')
    
    // Show account with token expiring soon
    cy.get('[data-testid="account-card"]').first().within(() => {
      cy.get('[data-testid="token-warning"]').should('be.visible')
      cy.get('[data-testid="refresh-token-btn"]').click()
    })
    
    cy.waitForApiCall('refreshToken')
    cy.get('[data-testid="success-message"]').should('contain', 'Token refreshed successfully')
    cy.get('[data-testid="token-warning"]').should('not.exist')
  })

  it('should show account statistics', () => {
    cy.get('[data-testid="account-card"]').first().within(() => {
      cy.get('[data-testid="followers-count"]').should('be.visible')
      cy.get('[data-testid="following-count"]').should('be.visible')
      cy.get('[data-testid="posts-count"]').should('be.visible')
      cy.get('[data-testid="account-status"]').should('contain', 'Active')
    })
  })

  it('should handle bulk account operations', () => {
    // Mock multiple accounts
    cy.intercept('GET', '**/api/igAccounts', {
      statusCode: 200,
      body: [
        {
          id: 'account-1',
          username: 'account_1',
          displayName: 'Account 1',
          status: 'active',
          profilePictureUrl: 'https://example.com/1.jpg'
        },
        {
          id: 'account-2',
          username: 'account_2',
          displayName: 'Account 2',
          status: 'active',
          profilePictureUrl: 'https://example.com/2.jpg'
        },
        {
          id: 'account-3',
          username: 'account_3',
          displayName: 'Account 3',
          status: 'error',
          profilePictureUrl: 'https://example.com/3.jpg'
        }
      ]
    }).as('getMultipleAccounts')
    
    cy.reload()
    cy.wait('@getMultipleAccounts')
    
    // Select multiple accounts
    cy.get('[data-testid="select-all-accounts"]').check()
    cy.get('[data-testid="account-card"] [data-testid="account-checkbox"]').should('be.checked')
    cy.get('[data-testid="bulk-actions"]').should('be.visible')
    
    // Mock bulk refresh
    cy.intercept('POST', '**/api/igAccounts/bulk-refresh', {
      statusCode: 200,
      body: { refreshed: 3, failed: 0 }
    }).as('bulkRefresh')
    
    cy.get('[data-testid="bulk-refresh-btn"]').click()
    cy.waitForApiCall('bulkRefresh')
    cy.get('[data-testid="success-message"]').should('contain', 'Refreshed 3 accounts')
  })

  it('should show upgrade prompt for premium features', () => {
    // Mock free plan user trying to access premium features
    cy.intercept('GET', '**/api/planLimits', {
      statusCode: 200,
      body: {
        plan: 'free',
        accountsUsed: 1,
        accountsLimit: 1,
        features: {
          analytics: false,
          bulkOperations: false,
          advancedScheduling: false
        }
      }
    }).as('getFreePlan')
    
    cy.wait('@getFreePlan')
    
    // Try to access analytics (premium feature)
    cy.get('[data-testid="account-card"]').first().find('[data-testid="analytics-btn"]').click()
    cy.get('[data-testid="upgrade-dialog"]').should('be.visible')
    cy.get('[data-testid="upgrade-message"]').should('contain', 'Analytics is a premium feature')
    cy.get('[data-testid="upgrade-now-btn"]').should('be.visible')
    
    // Close upgrade dialog
    cy.get('[data-testid="close-upgrade-dialog"]').click()
    cy.get('[data-testid="upgrade-dialog"]').should('not.exist')
  })
})